"use server";

import { revalidatePath } from "next/cache";
import { all, get, run, tx } from "../db";
import { clientIp, getViewer } from "../auth";
import { PREVIEW_LINKS, issueToken } from "../account";
import {
  DISPUTE_DEADLINE,
  DomainError,
  OPEN_DISPUTE,
  audit,
  campaignById,
  launchCampaign,
  milestoneTarget,
  refundCampaign,
  refundMilestone,
  releaseMilestone,
  type Actor,
  type MilestoneRow,
} from "../domain";
import { HOUR, usd } from "@/lib/format";
import type { ActionState } from "@/lib/view-models";

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

class Refusal extends Error {}

/** Every admin action re-checks the role: rendering a button is not a permission. */
async function staff(): Promise<Actor> {
  const viewer = await getViewer();
  if (!viewer || viewer.role !== "admin") throw new Refusal("Only trust & safety staff can do that.");
  return { id: viewer.id, name: viewer.name, source: await clientIp() };
}

async function guarded(fn: () => Promise<ActionState>): Promise<ActionState> {
  try {
    const result = await fn();
    revalidatePath("/", "layout");
    return result;
  } catch (error) {
    if (error instanceof Refusal || error instanceof DomainError) return { error: error.message };
    throw error;
  }
}

/** For buttons that submit without showing a result: refusals simply do nothing. */
async function quietly(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    if (!(error instanceof Refusal || error instanceof DomainError)) throw error;
  }
  revalidatePath("/", "layout");
}

export async function decideDispute(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const actor = await staff();
    const option = text(formData.get("option"));
    const reason = text(formData.get("reason"));
    if (reason.length < 10) return { fieldErrors: { reason: "Record why — both parties see this reason." } };
    const d = get<{ id: number; code: string; milestone_id: number; assignee_id: number | null }>(
      `SELECT id, code, milestone_id, assignee_id FROM disputes WHERE id = ? AND ${OPEN_DISPUTE}`,
      Number(formData.get("dispute")),
    );
    if (!d) return { error: "This case has already been decided." };
    const m = get<MilestoneRow>("SELECT * FROM milestones WHERE id = ?", d.milestone_id)!;
    const c = campaignById(m.campaign_id)!;
    const now = Date.now();

    if (option === "more_evidence") {
      tx(() => {
        run(
          "UPDATE disputes SET status = 'awaiting_creator', deadline_at = ?, assignee_id = COALESCE(assignee_id, ?) WHERE id = ?",
          now + DISPUTE_DEADLINE,
          actor.id,
          d.id,
        );
        audit(actor, "Dispute", `${milestoneTarget(c, m)} · case ${d.code}`, `More evidence requested: ${reason}`, null);
      });
      return { ok: true, message: `Recorded. ${c.creator_name} has five more days to add evidence.` };
    }
    if (option !== "release" && option !== "refund") return { error: "Choose a decision." };

    tx(() => {
      if (option === "release") releaseMilestone(m.id, actor, `Case ${d.code}: ${reason}`);
      else refundMilestone(m.id, actor, `Case ${d.code}: ${reason}`);
      run(
        "UPDATE disputes SET status = 'resolved', decision = ?, decided_by = ?, decided_at = ?, reason = ?, assignee_id = COALESCE(assignee_id, ?) WHERE id = ?",
        option,
        actor.id,
        now,
        reason,
        actor.id,
        d.id,
      );
    });
    return {
      ok: true,
      message:
        option === "release"
          ? `Released to ${c.creator_name}. Both parties have been notified with your reason.`
          : "Refund queued to every donor on this campaign. The campaign is paused for review.",
    };
  });
}

type ReleaseState = "clear" | "held" | "blocked" | "stale-kyc";

function releaseState(m: MilestoneRow): ReleaseState | null {
  if (m.state !== "submitted" || (m.window_ends_at ?? Infinity) > Date.now()) return null;
  if (get(`SELECT 1 FROM disputes WHERE milestone_id = ? AND ${OPEN_DISPUTE}`, m.id)) return "blocked";
  const c = campaignById(m.campaign_id)!;
  if (c.kyc_status !== "verified") return "stale-kyc";
  return m.held_by ? "held" : "clear";
}

export async function releaseFromQueue(formData: FormData): Promise<void> {
  await quietly(async () => {
    const actor = await staff();
    const m = get<MilestoneRow>("SELECT * FROM milestones WHERE id = ?", Number(formData.get("milestone")));
    const state = m ? releaseState(m) : null;
    if (!m || (state !== "clear" && state !== "held")) throw new Refusal("Not releasable.");
    releaseMilestone(
      m.id,
      actor,
      state === "held" ? "Hold lifted after review. Evidence complete against terms." : "Window closed with no disputes. Evidence complete against terms.",
    );
  });
}

export async function holdRelease(formData: FormData): Promise<void> {
  await quietly(async () => {
    const actor = await staff();
    const m = get<MilestoneRow>("SELECT * FROM milestones WHERE id = ?", Number(formData.get("milestone")));
    if (!m || releaseState(m) !== "clear") throw new Refusal("Not holdable.");
    const c = campaignById(m.campaign_id)!;
    tx(() => {
      run("UPDATE milestones SET held_by = ?, held_at = ? WHERE id = ?", actor.id, Date.now(), m.id);
      audit(actor, "Hold", milestoneTarget(c, m), "Held from the release queue for a closer look.", m.amount);
    });
  });
}

export async function releaseAllClear(): Promise<void> {
  await quietly(async () => {
    const actor = await staff();
    const due = all<MilestoneRow>("SELECT * FROM milestones WHERE state = 'submitted' AND window_ends_at <= ?", Date.now());
    tx(() => {
      for (const m of due) {
        if (releaseState(m) === "clear") releaseMilestone(m.id, actor, "Window closed with no disputes. Released in a batch from the queue.");
      }
    });
  });
}

export async function decideIdentity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const actor = await staff();
    const option = text(formData.get("option"));
    const note = text(formData.get("reason"));
    if (note.length < 5) return { fieldErrors: { reason: "Leave a note for the audit log." } };
    const check = get<{ id: number; creator_id: number; status: string }>(
      "SELECT id, creator_id, status FROM identity_checks WHERE id = ? AND status IN ('incomplete', 'ready', 'resubmitted')",
      Number(formData.get("check")),
    );
    if (!check) return { error: "This check has already been decided." };
    const creator = get<{ name: string }>("SELECT name FROM creators WHERE id = ?", check.creator_id)!;
    const now = Date.now();

    if (option === "request") {
      tx(() => {
        run("UPDATE identity_checks SET status = 'incomplete', note = ? WHERE id = ?", note, check.id);
        audit(actor, "Identity", `${creator.name} · documents requested`, note, null);
      });
      return { ok: true, message: `${creator.name} has been asked for the missing documents.` };
    }
    if (option === "verify") {
      let launched = 0;
      tx(() => {
        run("UPDATE identity_checks SET status = 'verified', decided_at = ?, decided_by = ?, note = ? WHERE id = ?", now, actor.id, note, check.id);
        run("UPDATE creators SET kyc_status = 'verified', kyc_verified_at = ? WHERE id = ?", now, check.creator_id);
        for (const draft of all<{ id: number }>("SELECT id FROM campaigns WHERE creator_id = ? AND status = 'draft'", check.creator_id)) {
          if (launchCampaign(draft.id, now)) launched++;
        }
        audit(actor, "Identity", `${creator.name} · verified`, note, null);
      });
      return { ok: true, message: `${creator.name} is verified${launched ? ` and ${launched === 1 ? "their campaign is" : `${launched} campaigns are`} now live` : ""}.` };
    }
    if (option === "reject") {
      tx(() => {
        run("UPDATE identity_checks SET status = 'rejected', decided_at = ?, decided_by = ?, note = ? WHERE id = ?", now, actor.id, note, check.id);
        run("UPDATE creators SET kyc_status = 'rejected' WHERE id = ?", check.creator_id);
        for (const live of all<{ id: number }>("SELECT id FROM campaigns WHERE creator_id = ? AND status IN ('live', 'paused')", check.creator_id)) {
          refundCampaign(live.id, actor, `Identity rejected: ${note}`, "Identity rejected", "refunded", "Identity");
        }
        audit(actor, "Identity", `${creator.name} · rejected`, note, null);
      });
      return { ok: true, message: `${creator.name} was rejected. Anything they held in escrow is queued back to donors.` };
    }
    return { error: "Choose a decision." };
  });
}

function settleIfDone(batchId: number) {
  const outstanding = get<{ n: number }>("SELECT COUNT(*) AS n FROM refunds WHERE batch_id = ? AND status != 'paid'", batchId)!.n;
  if (outstanding === 0) run("UPDATE refund_batches SET status = 'settled', settled_at = ? WHERE id = ? AND status = 'queued'", Date.now(), batchId);
}

function runBatch(actor: Actor, batchId: number) {
  const b = get<{ id: number; code: string; campaign_id: number; status: string }>(
    "SELECT id, code, campaign_id, status FROM refund_batches WHERE id = ?",
    batchId,
  );
  if (!b || b.status !== "queued") return;
  const pending = get<{ n: number; total: number }>(
    "SELECT COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total FROM refunds WHERE batch_id = ? AND status != 'paid'",
    b.id,
  )!;
  run(
    "UPDATE refunds SET status = 'paid', paid_at = ?, failure_reason = NULL, failure_action = NULL WHERE batch_id = ? AND status != 'paid'",
    Date.now(),
    b.id,
  );
  settleIfDone(b.id);
  const title = campaignById(b.campaign_id)?.title ?? "Campaign";
  audit(actor, "Refund", `${title} · batch ${b.code}`, `Batch run: ${pending.n} refunds sent to donors' cards.`, pending.total);
}

export async function runRefundBatch(formData: FormData): Promise<void> {
  await quietly(async () => {
    const actor = await staff();
    tx(() => runBatch(actor, Number(formData.get("batch"))));
  });
}

export async function runQueuedBatches(): Promise<void> {
  await quietly(async () => {
    const actor = await staff();
    const batches = all<{ id: number }>(
      `SELECT b.id FROM refund_batches b WHERE b.status = 'queued'
       AND NOT EXISTS (SELECT 1 FROM refunds r WHERE r.batch_id = b.id AND r.status = 'failed')`,
    );
    tx(() => batches.forEach((b) => runBatch(actor, b.id)));
  });
}

export async function resolveFailedRefund(formData: FormData): Promise<void> {
  await quietly(async () => {
    const actor = await staff();
    const r = get<{ id: number; batch_id: number; amount: number; failure_action: string | null; backer_name: string; code: string }>(
      `SELECT r.id, r.batch_id, r.amount, r.failure_action, p.backer_name, b.code
       FROM refunds r JOIN pledges p ON p.id = r.pledge_id JOIN refund_batches b ON b.id = r.batch_id
       WHERE r.id = ? AND r.status = 'failed'`,
      Number(formData.get("refund")),
    );
    if (!r) throw new Refusal("Already resolved.");
    tx(() => {
      run("UPDATE refunds SET status = 'paid', paid_at = ?, failure_reason = NULL WHERE id = ?", Date.now(), r.id);
      settleIfDone(r.batch_id);
      audit(actor, "Refund", `${r.backer_name} · batch ${r.code}`, `Failed refund resolved: ${r.failure_action ?? "retried"}.`, r.amount);
    });
  });
}

export async function decideModeration(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const actor = await staff();
    const option = text(formData.get("option"));
    const policy = text(formData.get("policy"));
    const c = campaignById(Number(formData.get("campaign")));
    if (!c) return { error: "That campaign no longer exists." };
    const now = Date.now();
    const reports = get<{ n: number }>("SELECT COUNT(*) AS n FROM reports WHERE campaign_id = ? AND status = 'open'", c.id)!.n;
    if (reports === 0) return { error: "These reports have already been handled." };

    if (option === "takedown") {
      const code = refundCampaign(c.id, actor, `Policy ${policy}. ${reports} reports.`, "Campaign taken down", "taken_down", "Takedown");
      run("UPDATE creators SET barred_at = ? WHERE id = ?", now, c.creator_id);
      run("UPDATE reports SET status = 'actioned', resolved_at = ? WHERE campaign_id = ? AND status = 'open'", now, c.id);
      return {
        ok: true,
        message: `Taken down. ${code ? `Refund batch ${code} queued for ${usd(c.raised - c.released - c.refunded_total)}.` : "Nothing was held to refund."} A second moderator reviews takedowns within 24 hours.`,
      };
    }
    if (option === "pause") {
      tx(() => {
        run("UPDATE campaigns SET status = 'paused', paused_until = ? WHERE id = ?", now + 7 * 24 * HOUR, c.id);
        run("UPDATE reports SET status = 'actioned', resolved_at = ? WHERE campaign_id = ? AND status = 'open'", now, c.id);
        audit(actor, "Moderation", `${c.title} · paused 7 days`, `Policy ${policy}. Creator warned to fix the listed breaches.`, null);
      });
      return { ok: true, message: "Paused for seven days. The creator has been told what to fix." };
    }
    if (option === "dismiss") {
      tx(() => {
        run("UPDATE reports SET status = 'dismissed', resolved_at = ? WHERE campaign_id = ? AND status = 'open'", now, c.id);
        audit(actor, "Moderation", `${c.title} · reports dismissed`, `${reports} reports reviewed; no breach found.`, null);
      });
      return { ok: true, message: "Reports dismissed. The campaign stays live." };
    }
    return { error: "Choose a decision." };
  });
}

async function targetUser(formData: FormData, actor: Actor) {
  const user = get<{ id: number; name: string; email: string; suspended_at: number | null }>(
    "SELECT id, name, email, suspended_at FROM users WHERE id = ?",
    Number(formData.get("user")),
  );
  if (!user) throw new Refusal("That account no longer exists.");
  if (user.id === actor.id) throw new Refusal("You can't change your own account from here.");
  return user;
}

export async function setSuspended(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const actor = await staff();
    const user = await targetUser(formData, actor);
    const suspend = formData.get("suspend") === "1";
    tx(() => {
      run("UPDATE users SET suspended_at = ? WHERE id = ?", suspend ? Date.now() : null, user.id);
      if (suspend) run("DELETE FROM sessions WHERE user_id = ?", user.id);
      audit(actor, "Account", `${user.name} · ${suspend ? "suspended" : "reinstated"}`, suspend ? "Sign-in blocked. Escrow unaffected." : "Suspension lifted.", null);
    });
    return { ok: true, message: suspend ? `${user.name} is suspended and signed out everywhere.` : `${user.name} can sign in again.` };
  });
}

export async function sendResetFor(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const actor = await staff();
    const user = await targetUser(formData, actor);
    const token = issueToken(user.id, "reset", 24 * HOUR);
    audit(actor, "Account", `${user.name} · password reset sent`, "Reset link issued by support.", null);
    return {
      ok: true,
      message: `A reset link is on its way to ${user.email}.`,
      link: PREVIEW_LINKS ? `/reset-password?token=${token}` : undefined,
    };
  });
}

export async function resetTwoFactor(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const actor = await staff();
    const user = await targetUser(formData, actor);
    tx(() => {
      run("UPDATE users SET two_factor = 0 WHERE id = ?", user.id);
      audit(actor, "Account", `${user.name} · two-factor reset`, "Two-factor cleared by support; the user re-enrols at next sign-in.", null);
    });
    return { ok: true, message: `Two-factor reset for ${user.name}.` };
  });
}

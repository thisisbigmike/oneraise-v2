"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { all, get, run, tx } from "../db";
import { destroySession, getViewer } from "../auth";
import { DISPUTE_DEADLINE, OPEN_DISPUTE, campaignById, nextCode, pledgeShares } from "../domain";
import { COUNTRY_NAMES } from "@/lib/countries";
import type { ActionState } from "@/lib/view-models";

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

/** A donor approves a submitted stage or disputes it; the first dispute opens a moderator case. */
export async function reviewMilestone(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in again to review this stage." };
  const milestoneId = Number(formData.get("milestone"));
  const decision = formData.get("decision") === "dispute" ? "dispute" : "approve";
  const note = text(formData.get("note"));
  if (decision === "dispute" && note.length < 10) {
    return { fieldErrors: { note: "Say what the evidence is missing against the terms — at least a sentence." } };
  }

  const m = get<{ id: number; campaign_id: number; state: string; window_ends_at: number | null }>(
    "SELECT id, campaign_id, state, window_ends_at FROM milestones WHERE id = ?",
    milestoneId,
  );
  if (!m || m.state !== "submitted" || (m.window_ends_at ?? 0) <= Date.now()) {
    return { error: "The review window for this stage has closed." };
  }
  const pledge = get<{ id: number }>(
    "SELECT id FROM pledges WHERE user_id = ? AND campaign_id = ? ORDER BY created_at LIMIT 1",
    viewer.id,
    m.campaign_id,
  );
  if (!pledge) return { error: "Only donors to this campaign can review its stages." };
  const already = get(
    "SELECT 1 FROM milestone_reviews r JOIN pledges p ON p.id = r.pledge_id WHERE r.milestone_id = ? AND p.user_id = ?",
    m.id,
    viewer.id,
  );
  if (already) return { error: "You've already reviewed this stage." };

  tx(() => {
    const now = Date.now();
    run(
      "INSERT INTO milestone_reviews (milestone_id, pledge_id, decision, note, created_at) VALUES (?, ?, ?, ?, ?)",
      m.id,
      pledge.id,
      decision,
      note,
      now,
    );
    if (decision === "dispute" && !get(`SELECT 1 FROM disputes WHERE milestone_id = ? AND ${OPEN_DISPUTE}`, m.id)) {
      run(
        "INSERT INTO disputes (code, milestone_id, status, opened_at, deadline_at) VALUES (?, ?, 'new', ?, ?)",
        nextCode("D", "disputes"),
        m.id,
        now,
        now + DISPUTE_DEADLINE,
      );
    }
  });
  revalidatePath("/", "layout");
  return {
    ok: true,
    message:
      decision === "dispute"
        ? "Dispute raised. The release is held and a moderator will decide within five days."
        : "Approved. Thanks — the stage releases when its window closes.",
  };
}

export async function updateDonorProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in again to save changes." };
  const name = text(formData.get("name"));
  const country = text(formData.get("country"));
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2 || name.length > 80) fieldErrors.name = "Use between 2 and 80 characters.";
  if (!COUNTRY_NAMES.includes(country)) fieldErrors.country = "Choose a country from the list.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  run("UPDATE users SET name = ?, country = ? WHERE id = ?", name, country, viewer.id);
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}

const PREF_KEYS: Record<string, string[]> = {
  donor: ["window_closing", "refund_issued", "creator_updates", "new_campaigns"],
  creator: ["due_approaching", "payout_landed", "every_pledge"],
  admin: [],
};

export async function updateNotifications(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in again to save changes." };
  const prefs = Object.fromEntries((PREF_KEYS[viewer.role] ?? []).map((key) => [key, formData.get(key) === "on"]));
  run("UPDATE users SET notify_prefs = ? WHERE id = ?", JSON.stringify(prefs), viewer.id);
  revalidatePath("/", "layout");
  return { ok: true, message: "Notification settings saved." };
}

/** Closing is only possible once nothing the donor donated is still held in escrow. */
export async function closeAccount(): Promise<ActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in again first." };
  if (viewer.role !== "donor") return { error: "Creator and staff accounts are closed through support." };
  const pledges = all<{ campaign_id: number; amount: number; refunded: number }>(
    `SELECT p.campaign_id, p.amount, COALESCE((SELECT SUM(amount) FROM refunds r WHERE r.pledge_id = p.id), 0) AS refunded
     FROM pledges p WHERE p.user_id = ?`,
    viewer.id,
  );
  const held = pledges.reduce((s, p) => s + pledgeShares(p.amount, p.refunded, campaignById(p.campaign_id)!).inEscrow, 0);
  if (held >= 0.5) return { error: "Your account can close once every milestone you fund has settled." };
  tx(() => {
    run(
      "UPDATE users SET name = 'Closed account', email = ?, password_hash = ?, suspended_at = ? WHERE id = ?",
      `closed-${viewer.id}-${randomBytes(4).toString("hex")}@deleted.invalid`,
      `closed$${randomBytes(16).toString("hex")}`,
      Date.now(),
      viewer.id,
    );
    run("DELETE FROM follows WHERE user_id = ?", viewer.id);
    run("DELETE FROM sessions WHERE user_id = ?", viewer.id);
  });
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

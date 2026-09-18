import "server-only";
import { all, get, run, tx } from "./db";
import { DAY, stageNumber, usd } from "@/lib/format";
import type { CampaignStatus, Milestone } from "@/lib/types";

/**
 * The escrow model, in one place.
 *
 *   raised          every donation ever made to the campaign
 *   released        paid out to the creator (sum of payouts)
 *   refundedTotal   committed to refunds, whether or not the batch has run
 *   refundedPaid    refunds that have actually left the trustee account
 *
 *   escrow balance  raised − released − refundedPaid   (what the trustee holds)
 *   available       raised − released − refundedTotal  (what can still release)
 *
 * A release draws pro rata from every donation, so a donor's released share is
 * donation × released ÷ raised. Refunds are recorded per donation.
 */

export const PLATFORM_FEE = 0.025;
export const REVIEW_WINDOW = 3 * DAY;
export const DISPUTE_DEADLINE = 5 * DAY;

export class DomainError extends Error {}

export type CampaignDbStatus = "draft" | "live" | "paused" | "refunded" | "failed" | "taken_down";

export interface CampaignRow {
  id: number;
  slug: string;
  creator_id: number;
  title: string;
  short_title: string;
  category: string;
  location: string;
  summary: string;
  summary_short: string;
  story: string;
  hero_caption: string;
  currency: string;
  goal: number;
  status: CampaignDbStatus;
  duration_days: number;
  launched_at: number | null;
  ends_at: number | null;
  paused_until: number | null;
  created_at: number;
  creator_name: string;
  creator_initials: string;
  creator_location: string;
  kyc_status: "none" | "pending" | "verified" | "stale" | "rejected";
  creator_owner: number | null;
  payout_account: string | null;
  raised: number;
  backers: number;
  released: number;
  refunded_total: number;
  refunded_paid: number;
}

const CAMPAIGN_SELECT = `
SELECT c.*, cr.name AS creator_name, cr.initials AS creator_initials, cr.location AS creator_location,
       cr.kyc_status, cr.owner_user_id AS creator_owner, cr.payout_account,
       COALESCE(p.raised, 0) AS raised, COALESCE(p.backers, 0) AS backers,
       COALESCE(r.released, 0) AS released,
       COALESCE(f.refunded_total, 0) AS refunded_total, COALESCE(f.refunded_paid, 0) AS refunded_paid
FROM campaigns c
JOIN creators cr ON cr.id = c.creator_id
LEFT JOIN (SELECT campaign_id, SUM(amount) AS raised, COUNT(*) AS backers FROM pledges GROUP BY campaign_id) p
  ON p.campaign_id = c.id
LEFT JOIN (SELECT m.campaign_id, SUM(po.gross) AS released FROM payouts po JOIN milestones m ON m.id = po.milestone_id
           GROUP BY m.campaign_id) r
  ON r.campaign_id = c.id
LEFT JOIN (SELECT pl.campaign_id, SUM(rf.amount) AS refunded_total,
                  SUM(CASE WHEN rf.status = 'paid' THEN rf.amount ELSE 0 END) AS refunded_paid
           FROM refunds rf JOIN pledges pl ON pl.id = rf.pledge_id GROUP BY pl.campaign_id) f
  ON f.campaign_id = c.id`;

export function campaignsWhere(where = "1 = 1", ...params: (string | number)[]): CampaignRow[] {
  return all<CampaignRow>(`${CAMPAIGN_SELECT} WHERE ${where}`, ...params);
}

export function campaignBySlug(slug: string): CampaignRow | undefined {
  return campaignsWhere("c.slug = ?", slug)[0];
}

export function campaignById(id: number): CampaignRow | undefined {
  return campaignsWhere("c.id = ?", id)[0];
}

export const escrowBalance = (c: CampaignRow) => c.raised - c.released - c.refunded_paid;
export const available = (c: CampaignRow) => Math.max(0, c.raised - c.released - c.refunded_total);

/** A moderator pause can carry an end date; once it passes the campaign is live again. */
const isPaused = (c: Pick<CampaignRow, "status" | "paused_until">, now: number) =>
  c.status === "paused" && (c.paused_until == null || c.paused_until > now);

export function displayStatus(
  c: Pick<CampaignRow, "status" | "ends_at" | "paused_until">,
  now = Date.now(),
): CampaignStatus {
  if (isPaused(c, now)) return "paused";
  switch (c.status) {
    case "draft":
      return "draft";
    case "failed":
      return "failed";
    case "refunded":
    case "taken_down":
      return "refunded";
  }
  if (c.ends_at == null) return "live";
  if (c.ends_at <= now) return "funded";
  if (c.ends_at - now <= 3 * DAY) return "expiring";
  return "live";
}

export function acceptsPledges(
  c: Pick<CampaignRow, "status" | "ends_at" | "paused_until">,
  now = Date.now(),
): boolean {
  const live = c.status === "live" || (c.status === "paused" && !isPaused(c, now));
  return live && c.ends_at != null && c.ends_at > now;
}

/** Publish a draft: the funding clock starts and stage one opens. */
export function launchCampaign(campaignId: number, now = Date.now()): boolean {
  return tx(() => {
    const c = get<{ duration_days: number; status: string }>("SELECT duration_days, status FROM campaigns WHERE id = ?", campaignId);
    if (!c || c.status !== "draft") return false;
    run(
      "UPDATE campaigns SET status = 'live', launched_at = ?, ends_at = ? WHERE id = ?",
      now,
      now + c.duration_days * DAY,
      campaignId,
    );
    run(
      "UPDATE milestones SET state = 'current', due_at = ? WHERE campaign_id = ? AND position = 1 AND state = 'pending'",
      now + 30 * DAY,
      campaignId,
    );
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* Milestones                                                          */
/* ------------------------------------------------------------------ */

export interface MilestoneRow {
  id: number;
  campaign_id: number;
  position: number;
  label: string;
  description: string;
  terms: string;
  amount: number;
  state: "pending" | "current" | "submitted" | "released" | "refunded";
  due_at: number | null;
  evidence_note: string;
  evidence: string;
  evidence_document: string | null;
  submitted_at: number | null;
  window_ends_at: number | null;
  held_by: number | null;
  held_at: number | null;
  released_at: number | null;
  refunded_at: number | null;
}

export interface DisputeRowDb {
  id: number;
  code: string;
  milestone_id: number;
  status: "new" | "in_review" | "awaiting_creator" | "resolved" | "withdrawn";
  assignee_id: number | null;
  opened_at: number;
  deadline_at: number;
  creator_response: string | null;
  creator_response_at: number | null;
  decision: "release" | "refund" | null;
  decided_by: number | null;
  decided_at: number | null;
  reason: string | null;
}

export const OPEN_DISPUTE = "status IN ('new', 'in_review', 'awaiting_creator')";

export const placeholders = (n: number) => Array.from({ length: n }, () => "?").join(", ");

export function milestonesByCampaign(campaignIds: number[]): Map<number, MilestoneRow[]> {
  const map = new Map<number, MilestoneRow[]>(campaignIds.map((id) => [id, []]));
  if (campaignIds.length === 0) return map;
  const rows = all<MilestoneRow>(
    `SELECT * FROM milestones WHERE campaign_id IN (${placeholders(campaignIds.length)}) ORDER BY campaign_id, position`,
    ...campaignIds,
  );
  for (const row of rows) map.get(row.campaign_id)?.push(row);
  return map;
}

export function openDisputesByMilestone(milestoneIds: number[]): Map<number, DisputeRowDb> {
  const map = new Map<number, DisputeRowDb>();
  if (milestoneIds.length === 0) return map;
  const rows = all<DisputeRowDb>(
    `SELECT * FROM disputes WHERE ${OPEN_DISPUTE} AND milestone_id IN (${placeholders(milestoneIds.length)})`,
    ...milestoneIds,
  );
  for (const row of rows) map.set(row.milestone_id, row);
  return map;
}

export function disputeCountsByMilestone(milestoneIds: number[]): Map<number, number> {
  const map = new Map<number, number>();
  if (milestoneIds.length === 0) return map;
  const rows = all<{ milestone_id: number; n: number }>(
    `SELECT milestone_id, COUNT(*) AS n FROM milestone_reviews
     WHERE decision = 'dispute' AND milestone_id IN (${placeholders(milestoneIds.length)}) GROUP BY milestone_id`,
    ...milestoneIds,
  );
  for (const row of rows) map.set(row.milestone_id, row.n);
  return map;
}

/**
 * Where a stage sits right now:
 * review    evidence is up and donors' 72-hour window is open
 * awaiting  the window closed with no open case — a moderator releases it
 * disputed  the window closed with a case still open
 */
export type Phase = "pending" | "current" | "review" | "awaiting" | "disputed" | "released" | "refunded";

export function phaseOf(m: MilestoneRow, hasOpenDispute: boolean, now = Date.now()): Phase {
  if (m.state !== "submitted") return m.state;
  if ((m.window_ends_at ?? 0) > now) return "review";
  return hasOpenDispute ? "disputed" : "awaiting";
}

export const PHASE_LABEL: Record<Phase, string> = {
  pending: "Pending",
  current: "In progress",
  review: "In review",
  awaiting: "Awaiting release",
  disputed: "Disputed",
  released: "Released",
  refunded: "Refunded",
};

/** The rail every dashboard and card draws. */
export function trackFor(milestones: MilestoneRow[], disputes: Map<number, DisputeRowDb>, now = Date.now()): Milestone[] {
  return milestones.map((m, i) => {
    const phase = phaseOf(m, disputes.has(m.id), now);
    const state: Milestone["state"] =
      phase === "released"
        ? "released"
        : phase === "disputed" || phase === "refunded"
          ? "disputed"
          : phase === "pending"
            ? "pending"
            : "active";
    return {
      label: m.label,
      state,
      statusLabel: PHASE_LABEL[phase],
      amount: usd(m.amount),
      barState: i === milestones.length - 1 ? undefined : phase === "released" ? "released" : "pending",
    };
  });
}

/** "Stage 2 of 4" — the first stage not yet released. */
export function stageLabel(milestones: MilestoneRow[]): string {
  if (milestones.length === 0) return "No stages defined";
  const current = milestones.find((m) => m.state !== "released");
  return `Stage ${current ? current.position : milestones.length} of ${milestones.length}`;
}

export function evidenceOf(m: MilestoneRow): string[] {
  try {
    const parsed = JSON.parse(m.evidence);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function termsWithDate(m: MilestoneRow, launchedAt: number | null, format: (ms: number) => string): string {
  return launchedAt ? `${m.terms} Agreed at launch on ${format(launchedAt)}.` : m.terms;
}

/** A donation's slice of the campaign's releases, and what is still held for it. */
export function pledgeShares(amount: number, refunded: number, c: Pick<CampaignRow, "raised" | "released">) {
  const released = c.raised > 0 ? (amount * c.released) / c.raised : 0;
  return { released, refunded, inEscrow: Math.max(0, amount - released - refunded) };
}

/* ------------------------------------------------------------------ */
/* Money-moving operations                                             */
/* ------------------------------------------------------------------ */

export interface Actor {
  id: number | null;
  name: string;
  source: string;
}

export function audit(actor: Actor, action: string, target: string, reason: string, amount: number | null): void {
  run(
    "INSERT INTO audit_log (at, actor_id, actor_name, action, target, reason, amount, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    Date.now(),
    actor.id,
    actor.name,
    action,
    target,
    reason,
    amount,
    actor.source,
  );
}

export function nextCode(prefix: "D" | "R", table: "disputes" | "refund_batches"): string {
  const row = get<{ n: number | null }>(`SELECT MAX(CAST(SUBSTR(code, 3) AS INTEGER)) AS n FROM ${table}`);
  return `${prefix}-${String((row?.n ?? 1000) + 1).padStart(4, "0")}`;
}

export const milestoneTarget = (c: Pick<CampaignRow, "title">, m: Pick<MilestoneRow, "position">) =>
  `${c.title} · milestone ${stageNumber(m.position)}`;

/** Open the next stage once the one before it releases. */
function unlockNext(m: MilestoneRow, now: number) {
  run(
    "UPDATE milestones SET state = 'current', due_at = COALESCE(due_at, ?) WHERE campaign_id = ? AND position = ? AND state = 'pending'",
    now + 30 * DAY,
    m.campaign_id,
    m.position + 1,
  );
}

/** Pay a submitted stage out to the creator, less the platform fee. */
export function releaseMilestone(milestoneId: number, actor: Actor, reason: string): number {
  return tx(() => {
    const m = get<MilestoneRow>("SELECT * FROM milestones WHERE id = ?", milestoneId);
    if (!m || m.state !== "submitted") throw new DomainError("That stage is no longer awaiting release.");
    const c = campaignById(m.campaign_id)!;
    const gross = Math.min(m.amount, available(c));
    const fee = Math.round(gross * PLATFORM_FEE);
    const now = Date.now();
    run(
      "INSERT INTO payouts (milestone_id, gross, fee, net, account, released_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      m.id,
      gross,
      fee,
      gross - fee,
      c.payout_account ?? "Payout account on file",
      now,
      now + 2 * DAY,
    );
    run("UPDATE milestones SET state = 'released', released_at = ?, held_by = NULL, held_at = NULL WHERE id = ?", now, m.id);
    unlockNext(m, now);
    audit(actor, "Release", milestoneTarget(c, m), reason, gross);
    return gross;
  });
}

/**
 * Queue a refund of `amount` from a campaign's escrow, split across its
 * donations in proportion to what each still has held. Returns the batch code.
 */
export function queueRefund(c: CampaignRow, amount: number, reason: string): string | null {
  return tx(() => {
    const pledges = all<{ id: number; amount: number; refunded: number }>(
      `SELECT p.id, p.amount, COALESCE(SUM(r.amount), 0) AS refunded
       FROM pledges p LEFT JOIN refunds r ON r.pledge_id = p.id
       WHERE p.campaign_id = ? GROUP BY p.id`,
      c.id,
    );
    const held = pledges.map((p) => ({ id: p.id, held: pledgeShares(p.amount, p.refunded, c).inEscrow }));
    const totalHeld = held.reduce((s, p) => s + p.held, 0);
    const target = Math.min(Math.round(amount), Math.floor(totalHeld));
    if (target <= 0) return null;

    const shares = held.map((p) => ({ id: p.id, share: Math.floor((p.held * target) / totalHeld) }));
    let remainder = target - shares.reduce((s, p) => s + p.share, 0);
    for (const s of [...shares].sort((a, b) => b.share - a.share)) {
      if (remainder <= 0) break;
      s.share += 1;
      remainder -= 1;
    }

    const code = nextCode("R", "refund_batches");
    const batch = run(
      "INSERT INTO refund_batches (code, campaign_id, reason, status, created_at) VALUES (?, ?, ?, 'queued', ?)",
      code,
      c.id,
      reason,
      Date.now(),
    );
    for (const s of shares) {
      if (s.share > 0) {
        run("INSERT INTO refunds (batch_id, pledge_id, amount, status) VALUES (?, ?, ?, 'queued')", batch.lastId, s.id, s.share);
      }
    }
    return code;
  });
}

/** A failed stage: its money goes back to donors and the campaign pauses. */
export function refundMilestone(milestoneId: number, actor: Actor, reason: string): string | null {
  return tx(() => {
    const m = get<MilestoneRow>("SELECT * FROM milestones WHERE id = ?", milestoneId);
    if (!m || (m.state !== "submitted" && m.state !== "current")) {
      throw new DomainError("That stage can no longer be refunded.");
    }
    const c = campaignById(m.campaign_id)!;
    const code = queueRefund(c, m.amount, "Milestone failed");
    run("UPDATE milestones SET state = 'refunded', refunded_at = ?, held_by = NULL WHERE id = ?", Date.now(), m.id);
    if (c.status === "live") run("UPDATE campaigns SET status = 'paused' WHERE id = ?", c.id);
    audit(actor, "Refund", `${milestoneTarget(c, m)}${code ? ` · batch ${code}` : ""}`, reason, Math.min(m.amount, available(c)));
    return code;
  });
}

/** Everything still held goes back; no stage will release again. */
export function refundCampaign(
  campaignId: number,
  actor: Actor,
  reason: string,
  batchReason: string,
  status: "refunded" | "taken_down",
  action: "Refund" | "Takedown" | "Identity",
): string | null {
  return tx(() => {
    const c = campaignById(campaignId);
    if (!c) throw new DomainError("That campaign no longer exists.");
    const amount = available(c);
    const code = queueRefund(c, amount, batchReason);
    const now = Date.now();
    run(
      "UPDATE milestones SET state = 'refunded', refunded_at = ?, held_by = NULL WHERE campaign_id = ? AND state IN ('pending', 'current', 'submitted')",
      now,
      c.id,
    );
    run("UPDATE campaigns SET status = ? WHERE id = ?", status, c.id);
    run(
      `UPDATE disputes SET status = 'resolved', decision = 'refund', decided_by = ?, decided_at = ?, reason = ?
       WHERE ${OPEN_DISPUTE} AND milestone_id IN (SELECT id FROM milestones WHERE campaign_id = ?)`,
      actor.id,
      now,
      reason,
      c.id,
    );
    audit(actor, action, `${c.title}${code ? ` · batch ${code}` : ""}`, reason, amount);
    return code;
  });
}

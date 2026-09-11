import "server-only";
import { connection } from "next/server";
import { all, get } from "../db";
import {
  OPEN_DISPUTE,
  available,
  campaignById,
  campaignsWhere,
  disputeCountsByMilestone,
  displayStatus,
  escrowBalance,
  evidenceOf,
  milestonesByCampaign,
  openDisputesByMilestone,
  placeholders,
  pledgeShares,
  termsWithDate,
  type CampaignRow,
  type DisputeRowDb,
  type MilestoneRow,
} from "../domain";
import {
  DAY,
  ago,
  auditTimestamp,
  clockTime,
  count,
  dateTime,
  initialsOf,
  longDate,
  monthOf,
  plural,
  shortDate,
  span,
  stageNumber,
  usd,
} from "@/lib/format";
import { currencyFor } from "@/lib/countries";
import type {
  AdminCounts,
  AdminOverviewData,
  AuditActionType,
  AuditEntry,
  BadgeVariant,
  DecisionOption,
  DisputeCaseDetail,
  DisputeRow,
  DisputeStatus,
  EscrowLedgerData,
  IdentityPanel,
  IdentityRow,
  ModerationCampaign,
  RefundsData,
  ReleaseRow,
  UserProfileData,
  UserSearchResult,
  Viewer,
} from "@/lib/view-models";

/* ------------------------------------------------------------------ */
/* Disputes                                                            */
/* ------------------------------------------------------------------ */

export function disputeStatus(d: Pick<DisputeRowDb, "status" | "deadline_at">, now: number): DisputeStatus {
  if (d.status === "resolved" || d.status === "withdrawn") return "Resolved";
  if (d.deadline_at - now < DAY) return "Breaching";
  if (d.status === "awaiting_creator") return "Awaiting creator";
  if (d.status === "new") return "New";
  return "In review";
}

function decideWithin(d: Pick<DisputeRowDb, "status" | "deadline_at">, now: number): string {
  if (d.status === "resolved" || d.status === "withdrawn") return "Closed";
  const diff = d.deadline_at - now;
  if (diff < 0) return `${span(-diff)} over`;
  if (diff < DAY) return "Today";
  return span(diff);
}

interface DisputeJoined extends DisputeRowDb {
  campaign_id: number;
  position: number;
  label: string;
  amount: number;
  assignee_name: string | null;
}

function disputesJoined(where: string, ...params: (string | number)[]): DisputeJoined[] {
  return all<DisputeJoined>(
    `SELECT d.*, m.campaign_id, m.position, m.label, m.amount, u.name AS assignee_name
     FROM disputes d JOIN milestones m ON m.id = d.milestone_id LEFT JOIN users u ON u.id = d.assignee_id
     WHERE ${where} ORDER BY d.deadline_at`,
    ...params,
  );
}

export async function getDisputes(viewer: Viewer): Promise<{ rows: DisputeRow[]; heldPending: string }> {
  await connection();
  const now = Date.now();
  const disputes = disputesJoined("d.status != 'withdrawn'").sort((a, b) => {
    const aOpen = a.status !== "resolved";
    const bOpen = b.status !== "resolved";
    if (aOpen !== bOpen) return aOpen ? -1 : 1;
    return aOpen ? a.deadline_at - b.deadline_at : (b.decided_at ?? 0) - (a.decided_at ?? 0);
  });
  const campaigns = new Map(campaignsWhere().map((c) => [c.id, c]));
  const counts = disputeCountsByMilestone(disputes.map((d) => d.milestone_id));
  let held = 0;
  const rows = disputes.map((d) => {
    const status = disputeStatus(d, now);
    if (status !== "Resolved") held += d.amount;
    const tags: DisputeRow["filterTags"] = [];
    if (status === "Breaching") tags.push("breaching");
    if (d.assignee_id === viewer.id) tags.push("assigned-to-me");
    if (d.status === "awaiting_creator") tags.push("awaiting-creator");
    return {
      id: d.code,
      slug: d.code.toLowerCase(),
      campaign: campaigns.get(d.campaign_id)?.title ?? "Unknown campaign",
      milestone: `${stageNumber(d.position)} · ${d.label}`,
      held: usd(d.amount),
      donors: counts.get(d.milestone_id) ?? 0,
      opened: shortDate(d.opened_at),
      deadline: decideWithin(d, now),
      deadlineUrgent: status === "Breaching",
      assignee: d.assignee_name ?? "Unassigned",
      status,
      filterTags: tags,
    };
  });
  return { rows, heldPending: usd(held) };
}

export async function getDisputeCase(slug: string): Promise<DisputeCaseDetail | null> {
  await connection();
  const now = Date.now();
  const d = disputesJoined("d.code = ? COLLATE NOCASE", slug)[0];
  if (!d) return null;
  const c = campaignById(d.campaign_id)!;
  const m = get<MilestoneRow>("SELECT * FROM milestones WHERE id = ?", d.milestone_id)!;
  const complaints = all<{ backer_name: string; amount: number; created_at: number; note: string }>(
    `SELECT p.backer_name, p.amount, r.created_at, r.note FROM milestone_reviews r JOIN pledges p ON p.id = r.pledge_id
     WHERE r.milestone_id = ? AND r.decision = 'dispute' ORDER BY r.created_at`,
    d.milestone_id,
  );
  const shown = complaints.slice(0, 2);
  const disputingPledged = complaints.reduce((s, x) => s + x.amount, 0);
  const history = get<{ released: number; clean: number }>(
    `SELECT COUNT(*) AS released,
            SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM disputes x WHERE x.milestone_id = m.id) THEN 1 ELSE 0 END) AS clean
     FROM milestones m JOIN campaigns cc ON cc.id = m.campaign_id
     WHERE cc.creator_id = ? AND m.state = 'released'`,
    c.creator_id,
  )!;
  const decider = d.decided_by ? get<{ name: string }>("SELECT name FROM users WHERE id = ?", d.decided_by)?.name : null;
  const status = disputeStatus(d, now);
  const more = complaints.length - shown.length;

  return {
    disputeId: d.id,
    id: d.code,
    slug: d.code.toLowerCase(),
    status,
    title: `${m.label}, disputed by ${plural(complaints.length, "donor")}`,
    campaign: c.title,
    campaignSlug: c.slug,
    creator: c.creator_name,
    creatorInitials: c.creator_initials,
    openedDate: longDate(d.opened_at),
    decideWithin: decideWithin(d, now),
    disputingTotal: complaints.length,
    totalCampaignDonors: c.backers,
    submission: {
      date: m.submitted_at ? longDate(m.submitted_at) : "Not submitted",
      evidence: evidenceOf(m),
      note: m.evidence_note,
      termsNote: termsWithDate(m, c.launched_at, longDate),
      document: m.evidence_document ?? undefined,
    },
    donorComplaints: shown.map((x) => ({
      initials: initialsOf(x.backer_name),
      name: x.backer_name,
      pledged: usd(x.amount),
      date: shortDate(x.created_at),
      note: x.note || "No note left.",
    })),
    moreDisputesNote: more > 0 ? `${plural(more, "more dispute")}${complaints[2]?.note ? `, e.g. “${complaints[2].note}”` : ""}` : undefined,
    creatorResponse:
      d.creator_response && d.creator_response_at
        ? { date: dateTime(d.creator_response_at, now), note: d.creator_response }
        : undefined,
    money: [
      { label: "Milestone held", value: usd(m.amount) },
      { label: "Disputing donors' share", value: usd(c.raised > 0 ? (disputingPledged * m.amount) / c.raised : 0) },
      { label: "Campaign escrow remaining", value: usd(available(c)) },
      { label: "Creator's release history", value: `${history.clean ?? 0} of ${history.released} clean` },
    ],
    resolution:
      d.status === "resolved" || d.status === "withdrawn"
        ? {
            decision:
              d.status === "withdrawn"
                ? "Submission withdrawn by the creator"
                : d.decision === "release"
                  ? "Released to creator"
                  : "Refunded to donors",
            decidedBy: d.status === "withdrawn" ? c.creator_name : (decider ?? "A moderator"),
            decidedDate: longDate(d.decided_at ?? now),
            reason: d.reason ?? "The creator withdrew the submission, which closes the case.",
          }
        : undefined,
    options: [
      {
        value: "more_evidence",
        label: "Request more evidence",
        description: "Creator gets 5 more days. Escrow stays held. Donors are told what was asked for.",
      },
      {
        value: "release",
        label: "Release to creator",
        description: `${usd(Math.min(m.amount, available(c)))} moves to ${c.creator_name}. The dispute closes as unfounded.`,
      },
      {
        value: "refund",
        label: "Refund this milestone",
        description: `${usd(Math.min(m.amount, available(c)))} returns to all donors pro rata. The campaign is paused for review.`,
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Releases                                                            */
/* ------------------------------------------------------------------ */

export async function getReleaseQueue(): Promise<{ rows: ReleaseRow[]; awaitingAmount: string; awaitingCount: number }> {
  await connection();
  const now = Date.now();
  const milestones = all<MilestoneRow>(
    "SELECT * FROM milestones WHERE state = 'submitted' AND window_ends_at <= ? ORDER BY window_ends_at",
    now,
  );
  const campaigns = new Map(
    milestones.length
      ? campaignsWhere(`c.id IN (${placeholders(milestones.length)})`, ...milestones.map((m) => m.campaign_id)).map((c) => [c.id, c])
      : [],
  );
  const disputes = openDisputesByMilestone(milestones.map((m) => m.id));
  const counts = disputeCountsByMilestone(milestones.map((m) => m.id));
  const holders = new Map(all<{ id: number; name: string }>("SELECT id, name FROM users WHERE role = 'admin'").map((u) => [u.id, u.name]));

  const order: Record<ReleaseRow["state"], number> = { clear: 0, held: 1, "stale-kyc": 2, blocked: 3 };
  const rows = milestones
    .map((m) => {
      const c = campaigns.get(m.campaign_id)!;
      const dispute = disputes.get(m.id);
      const state: ReleaseRow["state"] = dispute
        ? "blocked"
        : c.kyc_status !== "verified"
          ? "stale-kyc"
          : m.held_by
            ? "held"
            : "clear";
      const amount = Math.min(m.amount, available(c));
      return {
        id: String(m.id),
        milestoneId: m.id,
        milestone: `${stageNumber(m.position)} · ${m.label}`,
        campaign: c.title,
        creator: c.creator_name,
        amount: usd(amount),
        amountValue: amount,
        windowClosed: ago(m.window_ends_at!, now),
        disputes: counts.get(m.id) ?? 0,
        state,
        note: m.held_by ? `Held by ${(holders.get(m.held_by) ?? "a moderator").split(" ")[0]}` : undefined,
        disputeSlug: dispute?.code.toLowerCase(),
      } satisfies ReleaseRow;
    })
    .sort((a, b) => order[a.state] - order[b.state]);
  return {
    rows,
    awaitingAmount: usd(rows.reduce((s, r) => s + r.amountValue, 0)),
    awaitingCount: rows.length,
  };
}

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

const IDENTITY_STATUS: Record<string, IdentityRow["status"]> = {
  incomplete: "Incomplete",
  ready: "Ready",
  resubmitted: "Resubmitted",
};

export async function getIdentityQueue(): Promise<{ rows: IdentityRow[]; summary: string }> {
  await connection();
  const now = Date.now();
  const checks = all<{
    id: number;
    creator_id: number;
    status: string;
    documents: string;
    checks: string;
    submitted_at: number;
    name: string;
    structure: string;
    country: string;
  }>(
    `SELECT ic.id, ic.creator_id, ic.status, ic.documents, ic.checks, ic.submitted_at, cr.name, cr.structure, cr.country
     FROM identity_checks ic JOIN creators cr ON cr.id = ic.creator_id
     WHERE ic.status IN ('incomplete', 'ready', 'resubmitted') ORDER BY ic.submitted_at`,
  );
  let blockedDrafts = 0;
  const rows = checks.map((ic) => {
    const items = JSON.parse(ic.documents) as IdentityPanel["items"];
    const checkBadges = JSON.parse(ic.checks) as IdentityPanel["checks"];
    const submitted = items.filter((i) => i.submitted).length;
    const blockedRelease = get<{ amount: number }>(
      `SELECT m.amount FROM milestones m JOIN campaigns c ON c.id = m.campaign_id
       WHERE c.creator_id = ? AND m.state = 'submitted' AND m.window_ends_at <= ? ORDER BY m.window_ends_at LIMIT 1`,
      ic.creator_id,
      now,
    );
    const draft = get("SELECT 1 FROM campaigns WHERE creator_id = ? AND status = 'draft'", ic.creator_id);
    const live = campaignsWhere("c.creator_id = ? AND c.status IN ('live', 'paused')", ic.creator_id);
    const heldLive = live.reduce((s, c) => s + available(c), 0);
    if (draft) blockedDrafts++;
    const blocking = blockedRelease ? usd(blockedRelease.amount) : draft ? "Campaign draft" : "—";
    const missing = items.filter((i) => !i.submitted).map((i) => i.label.toLowerCase());
    const options: DecisionOption[] = [
      {
        value: "request",
        label: missing.length ? `Request the ${missing.join(" and ")}` : "Request fresh documents",
        description: blockedRelease
          ? `Creator has 14 days. The blocked ${usd(blockedRelease.amount)} release stays held.`
          : "Creator has 14 days. The campaign stays in draft until then.",
      },
      {
        value: "verify",
        label: "Verify creator",
        description: draft ? "Clears the payout hold and publishes their draft campaign." : "Clears the payout hold on their releases.",
      },
      {
        value: "reject",
        label: "Reject",
        description: heldLive
          ? `${usd(heldLive)} held in escrow is refunded to donors. The creator can appeal once.`
          : "The draft cannot publish. The creator can appeal once.",
      },
    ];
    return {
      id: String(ic.id),
      checkId: ic.id,
      creator: ic.name,
      structure: ic.structure,
      country: ic.country,
      documents: `${submitted} of ${items.length}`,
      submitted: ago(ic.submitted_at, now),
      blocking,
      status: IDENTITY_STATUS[ic.status] ?? "Incomplete",
      panel: { creator: ic.name, documentsCount: `${submitted} of ${items.length}`, items, checks: checkBadges },
      options,
    } satisfies IdentityRow;
  });
  return {
    rows,
    summary: `${count(rows.length)} pending · ${plural(blockedDrafts, "campaign")} blocked from going live`,
  };
}

/* ------------------------------------------------------------------ */
/* Refunds                                                             */
/* ------------------------------------------------------------------ */

export async function getRefunds(): Promise<RefundsData> {
  await connection();
  const batches = all<{
    id: number;
    code: string;
    reason: string;
    status: "queued" | "settled";
    settled_at: number | null;
    title: string;
    amount: number;
    donors: number;
    failed: number;
    outstanding: number;
    outstanding_donors: number;
  }>(
    `SELECT b.id, b.code, b.reason, b.status, b.settled_at, c.title,
            COALESCE(SUM(r.amount), 0) AS amount, COUNT(DISTINCT r.pledge_id) AS donors,
            SUM(CASE WHEN r.status = 'failed' THEN 1 ELSE 0 END) AS failed,
            COALESCE(SUM(CASE WHEN r.status != 'paid' THEN r.amount ELSE 0 END), 0) AS outstanding,
            COUNT(DISTINCT CASE WHEN r.status != 'paid' THEN r.pledge_id END) AS outstanding_donors
     FROM refund_batches b JOIN campaigns c ON c.id = b.campaign_id LEFT JOIN refunds r ON r.batch_id = b.id
     GROUP BY b.id ORDER BY (b.status = 'settled'), b.created_at DESC`,
  );
  const failed = all<{ id: number; backer_name: string; card_label: string | null; amount: number; failure_reason: string | null; failure_action: string | null; code: string }>(
    `SELECT r.id, p.backer_name, p.card_label, r.amount, r.failure_reason, r.failure_action, b.code
     FROM refunds r JOIN pledges p ON p.id = r.pledge_id JOIN refund_batches b ON b.id = r.batch_id
     WHERE r.status = 'failed' ORDER BY b.created_at DESC, r.id`,
  );
  const queued = batches.filter((b) => b.status === "queued" && b.failed === 0);
  const failedCodes = [...new Set(failed.map((f) => f.code))];
  return {
    totalAmount: usd(batches.reduce((s, b) => s + b.outstanding, 0)),
    totalDonors: batches.reduce((s, b) => s + b.outstanding_donors, 0),
    queued: {
      count: queued.length,
      amount: usd(queued.reduce((s, b) => s + b.amount, 0)),
      donors: queued.reduce((s, b) => s + b.donors, 0),
    },
    batches: batches.map((b) => ({
      id: b.code,
      batchId: b.id,
      campaign: b.title,
      reason: b.reason,
      amount: usd(b.amount),
      donors: b.donors,
      status: b.status === "settled" ? "Settled" : b.failed > 0 ? "Failed" : "Queued",
      failedCount: b.failed,
      settledDate: b.settled_at ? longDate(b.settled_at) : undefined,
    })),
    failed: failed.map((f) => ({
      id: String(f.id),
      refundId: f.id,
      donor: f.backer_name,
      card: f.card_label ?? "Card on file",
      amount: usd(f.amount),
      reason: f.failure_reason ?? "Declined",
      action: f.failure_action ?? "Retry",
    })),
    failedSummary: failedCodes.length
      ? `Batch ${failedCodes.join(", ")} · ${usd(failed.reduce((s, f) => s + f.amount, 0))}`
      : "",
  };
}

/* ------------------------------------------------------------------ */
/* Moderation                                                          */
/* ------------------------------------------------------------------ */

export async function getModerationQueue(): Promise<{ rows: ModerationCampaign[]; summary: string }> {
  await connection();
  const now = Date.now();
  const grouped = all<{ campaign_id: number; n: number; oldest: number }>(
    `SELECT campaign_id, COUNT(*) AS n, MIN(created_at) AS oldest FROM reports
     WHERE status = 'open' AND campaign_id IS NOT NULL GROUP BY campaign_id ORDER BY n DESC`,
  );
  const unmatched = get<{ n: number }>("SELECT COUNT(*) AS n FROM reports WHERE status = 'open' AND campaign_id IS NULL")!.n;
  const rows = grouped.map((g) => {
    const c = campaignById(g.campaign_id)!;
    const reasons = all<{ reason: string; n: number }>(
      "SELECT reason, COUNT(*) AS n FROM reports WHERE status = 'open' AND campaign_id = ? GROUP BY reason ORDER BY n DESC",
      g.campaign_id,
    );
    const milestones = get<{ n: number }>("SELECT COUNT(*) AS n FROM milestones WHERE campaign_id = ?", c.id)!.n;
    const creatorSince = get<{ created_at: number }>("SELECT created_at FROM creators WHERE id = ?", c.creator_id)!.created_at;
    const verified = c.kyc_status === "verified";
    return {
      id: c.slug,
      campaignId: c.id,
      campaignSlug: c.slug,
      campaign: c.title,
      campaignMeta: `${verified ? "Verified creator" : "Unverified creator"} · ${milestones ? plural(milestones, "milestone") : "no milestones defined"}`,
      topReason: reasons[0]?.reason ?? "—",
      reports: g.n,
      raised: usd(c.raised),
      oldest: span(now - g.oldest),
      status: g.n >= 5 ? "Under review" : "Triage",
      donors: c.backers,
      description: `Listed as “${c.category}”. The campaign says: “${c.summary}” ${c.creator_name} registered ${longDate(creatorSince)}${verified ? "" : " and is unverified"}.`,
      reasonBreakdown: reasons.map((r) => ({ reason: r.reason, count: r.n, pct: Math.round((r.n / g.n) * 100) })),
      options: [
        {
          value: "takedown",
          label: "Take down and refund",
          description: `Campaign is delisted. ${usd(available(c))} returns to ${plural(c.backers, "donor")}. Creator is barred from publishing.`,
        },
        {
          value: "pause",
          label: "Pause and warn the creator",
          description: "No new pledges for 7 days. Escrow holds. Creator must fix the listed breaches.",
        },
        { value: "dismiss", label: "Dismiss the reports", description: "Campaign stays live. Reporters are told no breach was found." },
      ],
    } satisfies ModerationCampaign;
  });
  const total = rows.reduce((s, r) => s + r.reports, 0) + unmatched;
  return {
    rows,
    summary: `${plural(rows.length, "campaign")} reported · ${plural(total, "report")} total${unmatched ? ` · ${unmatched} not matched to a campaign` : ""}`,
  };
}

/* ------------------------------------------------------------------ */
/* Escrow                                                              */
/* ------------------------------------------------------------------ */

const FX: Record<string, { symbol: string; perUsd: number }> = {
  USD: { symbol: "$", perUsd: 1 },
  GBP: { symbol: "£", perUsd: 0.79 },
  EUR: { symbol: "€", perUsd: 0.92 },
  NGN: { symbol: "₦", perUsd: 1520 },
};

function heldBreakdown(rows: CampaignRow[], now: number) {
  const milestones = milestonesByCampaign(rows.map((c) => c.id));
  const disputes = openDisputesByMilestone([...milestones.values()].flat().map((m) => m.id));
  let frozen = 0;
  let awaiting = 0;
  let overdue = 0;
  for (const c of rows) {
    let left = available(c);
    for (const m of milestones.get(c.id) ?? []) {
      const take = (amount: number) => {
        const v = Math.min(amount, left);
        left -= v;
        return v;
      };
      if (m.state === "submitted" && disputes.has(m.id)) frozen += take(m.amount);
      else if (m.state === "submitted" && (m.window_ends_at ?? 0) <= now) awaiting += take(m.amount);
      else if (m.state === "current" && m.due_at != null && m.due_at < now) overdue += take(m.amount);
    }
  }
  return { frozen, awaiting, overdue, milestones, disputes };
}

export async function getEscrowLedger(): Promise<EscrowLedgerData> {
  await connection();
  const now = Date.now();
  const rows = campaignsWhere("c.status != 'draft'");
  const total = rows.reduce((s, c) => s + escrowBalance(c), 0);
  const queued = rows.reduce((s, c) => s + (c.refunded_total - c.refunded_paid), 0);
  const { frozen, awaiting, overdue, milestones, disputes } = heldBreakdown(rows, now);
  const onSchedule = Math.max(0, total - frozen - awaiting - overdue - queued);
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 1000) / 10 : 0);

  const byCurrency = new Map<string, { held: number; campaigns: number }>();
  for (const c of rows) {
    const bal = escrowBalance(c);
    if (bal <= 0) continue;
    const entry = byCurrency.get(c.currency) ?? { held: 0, campaigns: 0 };
    entry.held += bal;
    entry.campaigns += 1;
    byCurrency.set(c.currency, entry);
  }
  const currencies = [...byCurrency.entries()].sort((a, b) => b[1].held - a[1].held);

  return {
    totalHeld: usd(total),
    summary: [
      { label: "Awaiting release", value: usd(awaiting) },
      { label: "Queued for refund", value: usd(queued) },
    ],
    reconciledAt: `Computed ${longDate(now)} · ${clockTime(now)} WAT`,
    byState: [
      { label: "Live, on schedule", value: usd(onSchedule), pct: pct(onSchedule), color: "accent" },
      { label: "Awaiting release", value: usd(awaiting), pct: pct(awaiting), color: "primary" },
      { label: "Frozen by dispute", value: usd(frozen), pct: pct(frozen), color: "destructive" },
      { label: "Queued for refund", value: usd(queued), pct: pct(queued), color: "warning" },
      { label: "Overdue stages", value: usd(overdue), pct: pct(overdue), color: "warning" },
    ],
    byCurrency: currencies.map(([currency, v]) => {
      const fx = FX[currency] ?? FX.USD;
      return {
        currency,
        held: `${fx.symbol}${Math.round(v.held * fx.perUsd).toLocaleString("en-US")}`,
        usd: usd(v.held),
        campaigns: v.campaigns,
      };
    }),
    currencyTotal: {
      currencies: currencies.length,
      usd: usd(total),
      campaigns: currencies.reduce((s, [, v]) => s + v.campaigns, 0),
    },
    largest: [...rows]
      .sort((a, b) => escrowBalance(b) - escrowBalance(a))
      .slice(0, 5)
      .map((c) => {
        const ms = milestones.get(c.id) ?? [];
        const left = ms.filter((m) => m.state !== "released" && m.state !== "refunded").length;
        return {
          slug: c.slug,
          campaign: c.title,
          creator: c.creator_name,
          held: usd(escrowBalance(c)),
          stagesLeft: `${left} of ${ms.length}`,
          disputed: ms.some((m) => disputes.has(m.id)),
        };
      }),
  };
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export async function searchUsers(q: string): Promise<UserSearchResult[]> {
  await connection();
  const term = q.trim();
  const rows = term
    ? all<{ id: number; name: string; email: string; role: string }>(
        `SELECT id, name, email, role FROM users WHERE email LIKE ? OR name LIKE ? OR CAST(id AS TEXT) = ?
         ORDER BY (email = ?) DESC, created_at DESC LIMIT 8`,
        `%${term}%`,
        `%${term}%`,
        term,
        term,
      )
    : all<{ id: number; name: string; email: string; role: string }>(
        "SELECT id, name, email, role FROM users ORDER BY created_at DESC LIMIT 8",
      );
  return rows.map((r) => ({ ...r, role: r.role[0].toUpperCase() + r.role.slice(1) }));
}

export async function getUserProfile(userId: number): Promise<UserProfileData | null> {
  await connection();
  const now = Date.now();
  const u = get<{
    id: number;
    name: string;
    email: string;
    role: string;
    country: string;
    created_at: number;
    email_verified_at: number | null;
    suspended_at: number | null;
    two_factor: number;
    last_sign_in_at: number | null;
  }>("SELECT * FROM users WHERE id = ?", userId);
  if (!u) return null;
  const pledges = all<{ id: number; campaign_id: number; amount: number; created_at: number; refunded: number }>(
    `SELECT p.id, p.campaign_id, p.amount, p.created_at, COALESCE((SELECT SUM(amount) FROM refunds r WHERE r.pledge_id = p.id), 0) AS refunded
     FROM pledges p WHERE p.user_id = ? ORDER BY p.created_at DESC`,
    userId,
  );
  const campaignIds = [...new Set(pledges.map((p) => p.campaign_id))];
  const campaigns = new Map(
    campaignIds.length ? campaignsWhere(`c.id IN (${placeholders(campaignIds.length)})`, ...campaignIds).map((c) => [c.id, c]) : [],
  );
  let held = 0;
  let lifetime = 0;
  let refunded = 0;
  const rows = pledges.map((p) => {
    const c = campaigns.get(p.campaign_id)!;
    const shares = pledgeShares(p.amount, p.refunded, c);
    held += shares.inEscrow;
    lifetime += p.amount;
    refunded += p.refunded;
    const fullyRefunded = shares.inEscrow < 0.5 && p.refunded > 0 && shares.released < 0.5;
    return {
      id: p.id,
      campaign: c.title,
      pledged: usd(p.amount),
      inEscrow: usd(shares.inEscrow),
      date: longDate(p.created_at),
      status: fullyRefunded ? ("refunded" as const) : displayStatus(c, now),
    };
  });
  const disputesRaised = get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM milestone_reviews r JOIN pledges p ON p.id = r.pledge_id WHERE p.user_id = ? AND r.decision = 'dispute'",
    userId,
  )!.n;
  const sessions = get<{ n: number }>("SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND expires_at > ?", userId, now)!.n;
  return {
    id: u.id,
    initials: initialsOf(u.name),
    name: u.name,
    email: u.email,
    joined: longDate(u.created_at),
    role: u.role[0].toUpperCase() + u.role.slice(1),
    verified: u.email_verified_at != null,
    suspended: u.suspended_at != null,
    figures: [
      { label: "In escrow", value: usd(held) },
      { label: "Lifetime pledged", value: usd(lifetime) },
      { label: "Refunded", value: usd(refunded) },
      { label: "Disputes raised", value: count(disputesRaised) },
    ],
    pledges: rows,
    account: [
      { label: "Country", value: `${u.country} · ${currencyFor(u.country).split(" · ")[0]}` },
      { label: "Two-factor", value: u.two_factor ? "On" : "Off" },
      { label: "Sessions", value: plural(sessions, "device") },
      { label: "Last sign-in", value: u.last_sign_in_at ? dateTime(u.last_sign_in_at, now) : "Never" },
    ],
    escrowHeld: usd(held),
  };
}

/* ------------------------------------------------------------------ */
/* Audit                                                               */
/* ------------------------------------------------------------------ */

const FILTER_FOR: Record<string, AuditEntry["filterTag"]> = {
  Release: "releases",
  Hold: "releases",
  Refund: "refunds",
  Takedown: "takedowns",
  Moderation: "takedowns",
  Identity: "identity",
  Account: "account-changes",
  Dispute: "disputes",
};

export async function getAuditLog(limit = 300): Promise<AuditEntry[]> {
  await connection();
  return all<{ id: number; at: number; actor_name: string; action: string; target: string; reason: string; amount: number | null; source: string }>(
    "SELECT * FROM audit_log ORDER BY at DESC, id DESC LIMIT ?",
    limit,
  ).map((e) => ({
    id: e.id,
    timestamp: auditTimestamp(e.at),
    actor: e.actor_name,
    action: e.action as AuditActionType,
    target: e.target,
    reason: e.reason,
    amount: e.amount != null ? usd(e.amount) : "—",
    source: e.source,
    filterTag: FILTER_FOR[e.action] ?? "account-changes",
  }));
}

/* ------------------------------------------------------------------ */
/* Shell counts and overview                                           */
/* ------------------------------------------------------------------ */

export async function getAdminCounts(): Promise<AdminCounts> {
  await connection();
  const now = Date.now();
  const n = (sql: string, ...params: number[]) => get<{ n: number }>(sql, ...params)!.n;
  return {
    disputes: n(`SELECT COUNT(*) AS n FROM disputes WHERE ${OPEN_DISPUTE}`),
    releases: n("SELECT COUNT(*) AS n FROM milestones WHERE state = 'submitted' AND window_ends_at <= ?", now),
    identity: n("SELECT COUNT(*) AS n FROM identity_checks WHERE status IN ('incomplete', 'ready', 'resubmitted')"),
    refunds: n("SELECT COUNT(*) AS n FROM refund_batches WHERE status = 'queued'"),
    moderation: n("SELECT COUNT(DISTINCT COALESCE(campaign_id, -id)) AS n FROM reports WHERE status = 'open'"),
  };
}

export async function getAdminOverview(): Promise<AdminOverviewData> {
  await connection();
  const now = Date.now();
  const rows = campaignsWhere("c.status != 'draft'");
  const live = rows.filter((c) => c.status === "live" && (c.ends_at ?? 0) > now).length;
  const held = rows.reduce((s, c) => s + escrowBalance(c), 0);
  const d = new Date(now);
  const monthStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  const released = get<{ n: number; total: number }>(
    "SELECT COUNT(*) AS n, COALESCE(SUM(gross), 0) AS total FROM payouts WHERE released_at >= ?",
    monthStart,
  )!;

  const open = disputesJoined(OPEN_DISPUTE.replace(/status/, "d.status"));
  const breaching = open.filter((x) => disputeStatus(x, now) === "Breaching");
  const releases = await getReleaseQueue();
  const identity = all<{ submitted_at: number; status: string }>(
    "SELECT submitted_at, status FROM identity_checks WHERE status IN ('incomplete', 'ready', 'resubmitted') ORDER BY submitted_at",
  );
  const refunds = await getRefunds();
  const moderation = get<{ campaigns: number; reports: number; oldest: number | null }>(
    "SELECT COUNT(DISTINCT campaign_id) AS campaigns, COUNT(*) AS reports, MIN(created_at) AS oldest FROM reports WHERE status = 'open'",
  )!;
  const counts = await getAdminCounts();
  const clear = releases.rows.filter((r) => r.state === "clear");
  const disputeCounts = disputeCountsByMilestone(breaching.map((x) => x.milestone_id));
  const campaignTitles = new Map(rows.map((c) => [c.id, c.title]));
  const failedCards = refunds.failed.length;
  const oldestRelease = releases.rows.length
    ? Math.min(...all<{ w: number }>("SELECT window_ends_at AS w FROM milestones WHERE state = 'submitted' AND window_ends_at <= ?", now).map((r) => r.w))
    : null;

  const lastActions = all<{ id: number; at: number; actor_name: string; action: string; target: string; amount: number | null }>(
    "SELECT id, at, actor_name, action, target, amount FROM audit_log ORDER BY at DESC, id DESC LIMIT 5",
  );
  const verb: Record<string, string> = {
    Release: "Released",
    Refund: "Refunded",
    Identity: "Identity decision on",
    Takedown: "Took down",
    Hold: "Held",
    Account: "Account change on",
    Dispute: "Asked for evidence on",
    Moderation: "Moderated",
  };
  const monthName = monthOf(now);

  return {
    generatedAt: `${longDate(now)} · ${clockTime(now)} WAT`,
    stats: [
      { label: "Held in escrow", value: usd(held), meta: `Across ${plural(live, "live campaign")}`, destructive: false },
      { label: `Released in ${monthName}`, value: usd(released.total), meta: plural(released.n, "milestone"), destructive: false },
      {
        label: "Open disputes",
        value: count(open.length),
        meta: breaching.length ? `${breaching.length} past or at their 5-day deadline` : "All within deadline",
        destructive: breaching.length > 0,
      },
      { label: "Awaiting release", value: count(releases.awaitingCount), meta: `${releases.awaitingAmount} to move`, destructive: false },
    ],
    queues: [
      {
        key: "disputes",
        icon: "message-circle",
        label: "Disputes",
        href: "/admin/disputes",
        count: count(counts.disputes),
        meta: open.length ? `Oldest ${span(now - Math.min(...open.map((x) => x.opened_at)))}` : "Nothing open",
        badge: breaching.length ? `${breaching.length} breaching` : "On time",
        badgeVariant: (breaching.length ? "destructive" : "neutral") as BadgeVariant,
      },
      {
        key: "releases",
        icon: "check",
        label: "Releases",
        href: "/admin/releases",
        count: count(counts.releases),
        meta: oldestRelease ? `Oldest ${span(now - oldestRelease)}` : "Nothing waiting",
        badge: `${clear.length} clear`,
        badgeVariant: "funded" as BadgeVariant,
      },
      {
        key: "identity",
        icon: "shield-check",
        label: "Identity",
        href: "/admin/identity",
        count: count(counts.identity),
        meta: identity.length ? `Oldest ${span(now - identity[0].submitted_at)}` : "Nothing waiting",
        badge: `${identity.filter((i) => i.status === "resubmitted").length} resubmitted`,
        badgeVariant: "neutral" as BadgeVariant,
      },
      {
        key: "refunds",
        icon: "circle-dollar-sign",
        label: "Refunds",
        href: "/admin/refunds",
        count: count(counts.refunds),
        meta: `${refunds.totalAmount} to return`,
        badge: failedCards ? plural(failedCards, "failed card") : "None failed",
        badgeVariant: (failedCards ? "warning" : "neutral") as BadgeVariant,
      },
      {
        key: "moderation",
        icon: "alert-triangle",
        label: "Moderation",
        href: "/admin/moderation",
        count: count(counts.moderation),
        meta: moderation.oldest ? `Oldest ${span(now - moderation.oldest)}` : "Nothing reported",
        badge: plural(moderation.reports, "report"),
        badgeVariant: "neutral" as BadgeVariant,
      },
    ],
    lastActions: lastActions.map((a) => ({
      id: a.id,
      time: dateTime(a.at, now),
      moderator: a.actor_name,
      action: `${verb[a.action] ?? a.action} ${a.target}`,
      amount: a.amount != null ? usd(a.amount) : "—",
    })),
    triage: {
      banner: breaching.length
        ? {
            title: `${plural(breaching.length, "dispute")} at or past deadline`,
            meta: `${usd(breaching.reduce((s, x) => s + x.amount, 0))} frozen`,
          }
        : null,
      counts: [
        { label: "Disputes", value: count(counts.disputes) },
        { label: "Releases", value: count(counts.releases) },
        { label: "Identity", value: count(counts.identity) },
        { label: "Refunds", value: count(counts.refunds) },
      ],
      needsYouFirst: breaching.slice(0, 3).map((x) => ({
        id: x.code,
        slug: x.code.toLowerCase(),
        badge: decideWithin(x, now) === "Today" ? "Due today" : decideWithin(x, now),
        title: `${campaignTitles.get(x.campaign_id) ?? "Campaign"} · ${x.label.toLowerCase()}`,
        meta: `${usd(x.amount)} held · ${plural(disputeCounts.get(x.milestone_id) ?? 0, "donor")} disputing`,
      })),
    },
  };
}

export const adminMilestone = (id: number) => get<MilestoneRow>("SELECT * FROM milestones WHERE id = ?", id);

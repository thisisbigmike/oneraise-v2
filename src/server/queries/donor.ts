import "server-only";
import { connection } from "next/server";
import { all, get } from "../db";
import { currentSessionId } from "../auth";
import {
  PHASE_LABEL,
  acceptsPledges,
  available,
  campaignsWhere,
  disputeCountsByMilestone,
  displayStatus,
  evidenceOf,
  milestonesByCampaign,
  openDisputesByMilestone,
  phaseOf,
  placeholders,
  pledgeShares,
  stageLabel,
  termsWithDate,
  trackFor,
  type CampaignRow,
  type MilestoneRow,
} from "../domain";
import { toCard } from "./public";
import { DAY, initialsOf, longDate, percent, plural, span, usd } from "@/lib/format";
import { currencyFor } from "@/lib/countries";
import type {
  CampaignCard,
  DonorFigures,
  DonorPledge,
  DonorRefund,
  DonorSettingsData,
  FollowedCreator,
  NotificationPref,
  ReviewQueueItem,
  Viewer,
} from "@/lib/view-models";

interface PledgeTotals {
  campaign_id: number;
  amount: number;
  refunded: number;
  refunded_paid: number;
  first_at: number;
  last_refund_at: number | null;
}

/** The viewer's donations, one row per campaign. */
function pledgeTotals(userId: number): PledgeTotals[] {
  return all<PledgeTotals>(
    `SELECT p.campaign_id, SUM(p.amount) AS amount, MIN(p.created_at) AS first_at,
            COALESCE(SUM(r.refunded), 0) AS refunded, COALESCE(SUM(r.refunded_paid), 0) AS refunded_paid,
            MAX(r.last_paid) AS last_refund_at
     FROM pledges p
     LEFT JOIN (SELECT pledge_id, SUM(amount) AS refunded,
                       SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS refunded_paid,
                       MAX(paid_at) AS last_paid
                FROM refunds GROUP BY pledge_id) r ON r.pledge_id = p.id
     WHERE p.user_id = ?
     GROUP BY p.campaign_id
     ORDER BY first_at DESC`,
    userId,
  );
}

interface Portfolio {
  totals: PledgeTotals[];
  campaigns: Map<number, CampaignRow>;
  milestones: Map<number, MilestoneRow[]>;
  now: number;
}

function portfolio(userId: number): Portfolio {
  const totals = pledgeTotals(userId);
  const ids = totals.map((t) => t.campaign_id);
  const rows = ids.length ? campaignsWhere(`c.id IN (${placeholders(ids.length)})`, ...ids) : [];
  return {
    totals,
    campaigns: new Map(rows.map((c) => [c.id, c])),
    milestones: milestonesByCampaign(ids),
    now: Date.now(),
  };
}

function describePledge(t: PledgeTotals, c: CampaignRow, milestones: MilestoneRow[], now: number): DonorPledge {
  const disputes = openDisputesByMilestone(milestones.map((m) => m.id));
  const shares = pledgeShares(t.amount, t.refunded, c);
  const fullyRefunded = shares.inEscrow < 0.5 && t.refunded > 0 && shares.released < 0.5;
  const current = milestones.find((m) => m.state !== "released" && m.state !== "refunded");
  const refundedStage = [...milestones].reverse().find((m) => m.state === "refunded");

  let stageNote: string;
  if (fullyRefunded) stageNote = `Refunded in full${t.last_refund_at ? ` · ${longDate(t.last_refund_at)}` : ""}`;
  else if (refundedStage && t.refunded > 0)
    stageNote = `Stage ${refundedStage.position} refunded · ${usd(t.refunded)} back to you`;
  else if (current)
    stageNote = `${stageLabel(milestones)} · ${current.label.toLowerCase()} ${PHASE_LABEL[phaseOf(current, disputes.has(current.id), now)].toLowerCase()}`;
  else if (milestones.length) stageNote = "Every stage released";
  else stageNote = "No stages defined yet";

  const pledgedLabel = fullyRefunded
    ? `Donated ${usd(t.amount)} · refunded`
    : `Donated ${usd(t.amount)} · ${stageLabel(milestones).toLowerCase()}`;

  return {
    id: c.id,
    campaign: c.title,
    campaignSlug: c.slug,
    creator: c.creator_name,
    location: c.location,
    pledgedLabel,
    status: fullyRefunded ? "refunded" : displayStatus(c, now),
    milestones: trackFor(milestones, disputes, now),
    pledgedAmount: usd(t.amount),
    inEscrow: usd(shares.inEscrow),
    released: usd(shares.released),
    refunded: usd(t.refunded),
    stageNote,
  };
}

export async function getDonorPledges(viewer: Viewer): Promise<DonorPledge[]> {
  await connection();
  const p = portfolio(viewer.id);
  return p.totals.map((t) => describePledge(t, p.campaigns.get(t.campaign_id)!, p.milestones.get(t.campaign_id) ?? [], p.now));
}

function figuresFor(p: Portfolio): DonorFigures {
  let inEscrow = 0;
  let released = 0;
  let refunded = 0;
  let queued = 0;
  let holding = 0;
  let releasedStages = 0;
  let refundedStages = 0;
  for (const t of p.totals) {
    const c = p.campaigns.get(t.campaign_id)!;
    const shares = pledgeShares(t.amount, t.refunded, c);
    inEscrow += shares.inEscrow;
    released += shares.released;
    refunded += t.refunded;
    queued += t.refunded - t.refunded_paid;
    if (shares.inEscrow >= 0.5) holding++;
    const ms = p.milestones.get(t.campaign_id) ?? [];
    releasedStages += ms.filter((m) => m.state === "released").length;
    if (t.refunded > 0) refundedStages += Math.max(1, ms.filter((m) => m.state === "refunded").length);
  }
  return {
    inEscrow: { value: usd(inEscrow), meta: holding ? `Across ${plural(holding, "campaign")}` : "Nothing held right now" },
    released: {
      value: usd(released),
      meta: releasedStages ? `${plural(releasedStages, "milestone")} approved` : "No stage has released yet",
    },
    refunded: {
      value: usd(refunded),
      meta:
        refunded === 0
          ? "Nothing refunded"
          : queued > 0
            ? `${usd(queued)} still on its way back`
            : `${plural(refundedStages, "failed stage")}`,
    },
  };
}

export async function getReviewQueue(viewer: Viewer): Promise<ReviewQueueItem[]> {
  await connection();
  const now = Date.now();
  const rows = all<MilestoneRow>(
    `SELECT m.* FROM milestones m
     WHERE m.state = 'submitted' AND m.window_ends_at > ?
       AND m.campaign_id IN (SELECT campaign_id FROM pledges WHERE user_id = ?)
       AND NOT EXISTS (SELECT 1 FROM milestone_reviews r JOIN pledges p ON p.id = r.pledge_id
                       WHERE r.milestone_id = m.id AND p.user_id = ?)
     ORDER BY m.window_ends_at`,
    now,
    viewer.id,
    viewer.id,
  );
  if (rows.length === 0) return [];
  const campaignIds = [...new Set(rows.map((m) => m.campaign_id))];
  const campaigns = new Map(
    campaignsWhere(`c.id IN (${placeholders(campaignIds.length)})`, ...campaignIds).map((c) => [c.id, c]),
  );
  const allMilestones = milestonesByCampaign(campaignIds);
  const disputeCounts = disputeCountsByMilestone(rows.map((m) => m.id));
  const openDisputes = openDisputesByMilestone([...allMilestones.values()].flat().map((m) => m.id));
  const mine = new Map(
    all<{ campaign_id: number; amount: number }>(
      `SELECT campaign_id, SUM(amount) AS amount FROM pledges WHERE user_id = ? GROUP BY campaign_id`,
      viewer.id,
    ).map((r) => [r.campaign_id, r.amount]),
  );

  return rows.map((m) => {
    const c = campaigns.get(m.campaign_id)!;
    const siblings = allMilestones.get(c.id) ?? [];
    const prior = siblings.find((s) => s.position === m.position - 1);
    const remaining = m.window_ends_at! - now;
    const windowLength = m.window_ends_at! - (m.submitted_at ?? m.window_ends_at! - 3 * DAY);
    const releases = Math.min(m.amount, available(c));
    const share = c.raised > 0 ? ((mine.get(c.id) ?? 0) * releases) / c.raised : 0;
    return {
      id: String(m.id),
      milestoneId: m.id,
      campaign: c.title,
      campaignSlug: c.slug,
      milestone: `Milestone ${m.position} · ${m.label}`,
      milestoneLabel: m.label,
      amount: usd(m.amount),
      yourShare: usd(share),
      windowLabel: `Dispute window closes in ${span(remaining)}`,
      windowRemaining: span(remaining),
      windowPct: percent(windowLength - remaining, windowLength),
      urgent: remaining < DAY,
      evidenceNote: m.evidence_note,
      evidence: evidenceOf(m),
      releasesFrom: usd(releases),
      disputedOf: `${disputeCounts.get(m.id) ?? 0} of ${c.backers}`,
      termsNote: termsWithDate(m, c.launched_at, longDate),
      creatorName: c.creator_name,
      submittedDate: longDate(m.submitted_at ?? now),
      track: trackFor(prior ? [prior, m] : [m], openDisputes, now),
    };
  });
}

export async function getReviewCount(viewer: Viewer): Promise<number> {
  await connection();
  return get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM milestones m
     WHERE m.state = 'submitted' AND m.window_ends_at > ?
       AND m.campaign_id IN (SELECT campaign_id FROM pledges WHERE user_id = ?)
       AND NOT EXISTS (SELECT 1 FROM milestone_reviews r JOIN pledges p ON p.id = r.pledge_id
                       WHERE r.milestone_id = m.id AND p.user_id = ?)`,
    Date.now(),
    viewer.id,
    viewer.id,
  )!.n;
}

export async function getDonorOverview(viewer: Viewer): Promise<{
  figures: DonorFigures;
  queue: ReviewQueueItem[];
  pledges: DonorPledge[];
  liveNow: CampaignCard[];
}> {
  await connection();
  const p = portfolio(viewer.id);
  const backed = new Set(p.totals.map((t) => t.campaign_id));
  const open = campaignsWhere("c.status = 'live'")
    .filter((c) => acceptsPledges(c, p.now) && !backed.has(c.id))
    .sort((a, b) => b.backers - a.backers)
    .slice(0, 3);
  const openMilestones = milestonesByCampaign(open.map((c) => c.id));
  return {
    figures: figuresFor(p),
    queue: await getReviewQueue(viewer),
    pledges: p.totals.map((t) =>
      describePledge(t, p.campaigns.get(t.campaign_id)!, p.milestones.get(t.campaign_id) ?? [], p.now),
    ),
    liveNow: open.map((c) => toCard(c, openMilestones.get(c.id) ?? [], p.now)),
  };
}

export async function getDonorRefunds(viewer: Viewer): Promise<{ figure: DonorFigures["refunded"]; refunds: DonorRefund[] }> {
  await connection();
  const p = portfolio(viewer.id);
  const refunds: DonorRefund[] = [];
  for (const t of p.totals) {
    if (t.refunded <= 0) continue;
    const c = p.campaigns.get(t.campaign_id)!;
    const milestones = p.milestones.get(c.id) ?? [];
    const disputes = openDisputesByMilestone(milestones.map((m) => m.id));
    const lines = all<{ status: string; failure_reason: string | null; paid_at: number | null; code: string; created_at: number }>(
      `SELECT r.status, r.failure_reason, r.paid_at, b.code, b.created_at
       FROM refunds r JOIN refund_batches b ON b.id = r.batch_id JOIN pledges pl ON pl.id = r.pledge_id
       WHERE pl.user_id = ? AND pl.campaign_id = ? ORDER BY b.created_at DESC`,
      viewer.id,
      c.id,
    );
    const failed = lines.find((l) => l.status === "failed");
    const queued = lines.find((l) => l.status === "queued");
    const statusLabel = failed
      ? `Refund failed · ${failed.failure_reason?.toLowerCase() ?? "card declined"} — support will contact you`
      : queued
        ? `Refund queued in batch ${queued.code} on ${longDate(queued.created_at)}`
        : `Refunded ${longDate(lines[0]?.paid_at ?? lines[0]?.created_at ?? p.now)}`;
    refunds.push({
      id: c.id,
      campaign: c.title,
      creator: c.creator_name,
      location: c.location,
      amount: usd(t.refunded),
      statusLabel,
      note: queued
        ? "Queued refunds land on the card you donated with 3 to 5 working days after the batch runs."
        : "Refunds land back on the card you donated with, 3 to 5 working days after a milestone is refunded.",
      milestones: trackFor(milestones, disputes, p.now),
    });
  }
  return { figure: figuresFor(p).refunded, refunds };
}

export async function getFollowing(viewer: Viewer): Promise<FollowedCreator[]> {
  await connection();
  const now = Date.now();
  const creators = all<{ id: number; name: string; initials: string; location: string; n: number }>(
    `SELECT cr.id, cr.name, cr.initials, cr.location,
            (SELECT COUNT(*) FROM campaigns c WHERE c.creator_id = cr.id AND c.status != 'draft') AS n
     FROM follows f JOIN creators cr ON cr.id = f.creator_id
     WHERE f.user_id = ? ORDER BY f.created_at DESC`,
    viewer.id,
  );
  return creators.map((cr) => {
    const latest = all<Pick<CampaignRow, "slug" | "title" | "status" | "ends_at" | "paused_until">>(
      `SELECT slug, title, status, ends_at, paused_until FROM campaigns WHERE creator_id = ? AND status != 'draft'
       ORDER BY COALESCE(launched_at, created_at) DESC LIMIT 1`,
      cr.id,
    )[0];
    return {
      id: cr.id,
      initials: cr.initials,
      name: cr.name,
      location: cr.location,
      campaignsCount: cr.n,
      latestTitle: latest?.title ?? "No campaigns yet",
      latestSlug: latest?.slug ?? null,
      latestStatus: latest ? displayStatus(latest, now) : "draft",
    };
  });
}

function browserOf(ua: string | null): string {
  if (!ua) return "Unknown browser";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other browser";
}

export async function sessionSummary(userId: number): Promise<{ count: number; meta: string }> {
  const sessions = all<{ id: string; user_agent: string | null }>(
    "SELECT id, user_agent FROM sessions WHERE user_id = ? AND expires_at > ?",
    userId,
    Date.now(),
  );
  const mine = await currentSessionId();
  const browsers = [...new Set(sessions.map((s) => browserOf(s.user_agent)))];
  return {
    count: sessions.length,
    meta: sessions.length
      ? `${plural(sessions.length, "session")} · ${browsers.join(", ")}${sessions.some((s) => s.id === mine) ? " · including this one" : ""}`
      : "No active sessions",
  };
}

export function readPrefs(json: string): Record<string, boolean> {
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export async function getDonorSettings(viewer: Viewer): Promise<DonorSettingsData> {
  await connection();
  const u = get<{
    name: string;
    email: string;
    email_verified_at: number | null;
    country: string;
    card_label: string | null;
    card_expiry: string | null;
    password_changed_at: number;
    two_factor: number;
    notify_prefs: string;
  }>(
    "SELECT name, email, email_verified_at, country, card_label, card_expiry, password_changed_at, two_factor, notify_prefs FROM users WHERE id = ?",
    viewer.id,
  )!;
  const p = portfolio(viewer.id);
  const figures = figuresFor(p);
  const held = p.totals.reduce((s, t) => s + pledgeShares(t.amount, t.refunded, p.campaigns.get(t.campaign_id)!).inEscrow, 0);
  const cardPledges = u.card_label
    ? get<{ n: number }>("SELECT COUNT(*) AS n FROM pledges WHERE user_id = ? AND card_label = ?", viewer.id, u.card_label)!.n
    : 0;
  const prefs = readPrefs(u.notify_prefs);
  const sessions = await sessionSummary(viewer.id);
  const notifications: NotificationPref[] = [
    { key: "milestone_submitted", label: "A milestone is submitted for review", meta: "Required · starts your 72-hour window", checked: true, locked: true },
    { key: "window_closing", label: "A dispute window is about to close", meta: "Sent 12 hours before the deadline", checked: prefs.window_closing ?? true },
    { key: "refund_issued", label: "A refund is issued to you", checked: prefs.refund_issued ?? true },
    { key: "creator_updates", label: "Campaign updates from creators you fund", meta: "Weekly digest rather than per post", checked: prefs.creator_updates ?? false },
    { key: "new_campaigns", label: "New campaigns in categories you fund", checked: prefs.new_campaigns ?? false },
  ];
  return {
    name: u.name,
    initials: initialsOf(u.name),
    email: u.email,
    emailVerified: u.email_verified_at != null,
    country: u.country,
    currencyLabel: currencyFor(u.country),
    card: u.card_label ? { label: u.card_label, meta: `Expires ${u.card_expiry ?? "—"} · used for ${plural(cardPledges, "donation")}` } : null,
    passwordChanged: `Last changed ${longDate(u.password_changed_at)}`,
    twoFactor: u.two_factor === 1,
    sessionsCount: sessions.count,
    sessionsMeta: sessions.meta,
    escrowHeld: figures.inEscrow.value,
    canClose: held < 0.5,
    notifications,
  };
}

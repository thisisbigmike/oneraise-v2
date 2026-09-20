import "server-only";
import { connection } from "next/server";
import { all, get } from "../db";
import {
  PHASE_LABEL,
  acceptsPledges,
  available,
  campaignBySlug,
  campaignsWhere,
  displayStatus,
  escrowBalance,
  evidenceOf,
  milestonesByCampaign,
  openDisputesByMilestone,
  phaseOf,
  stageLabel,
  termsWithDate,
  trackFor,
  type CampaignRow,
  type MilestoneRow,
} from "../domain";
import {
  count,
  daysUntil,
  initialsOf,
  longDate,
  monthOf,
  percent,
  plural,
  shortDate,
  span,
  stageNumber,
  timeLeft,
  usd,
} from "@/lib/format";
import { homeFor } from "@/lib/roles";
import type {
  CampaignCard,
  CampaignDetail,
  CampaignViewerState,
  ContextCampaign,
  DetailMilestone,
  EscrowFigure,
  LandingStats,
  Viewer,
} from "@/lib/view-models";

const creatorLine = (c: CampaignRow) => `${c.creator_name} · ${c.location.split(",")[0]}`;
const goalLabel = (c: CampaignRow) => `${percent(c.raised, c.goal)}% of ${usd(c.goal)}`;

export function toCard(c: CampaignRow, milestones: MilestoneRow[], now: number): CampaignCard {
  return {
    slug: c.slug,
    title: c.title,
    category: c.category,
    location: c.location,
    creatorName: c.creator_name,
    creatorLine: creatorLine(c),
    status: displayStatus(c, now),
    stageLabel: stageLabel(milestones),
    raised: usd(c.raised),
    goalLabel: goalLabel(c),
    fillPct: percent(c.raised, c.goal),
    backerCount: c.backers,
    daysLeft: c.ends_at ? daysUntil(c.ends_at, now) : 0,
    timeLeftLabel: timeLeft(c.ends_at, now),
    heroCaption: c.hero_caption,
  };
}

function cardsFor(rows: CampaignRow[], now: number): CampaignCard[] {
  const milestones = milestonesByCampaign(rows.map((c) => c.id));
  return rows.map((c) => toCard(c, milestones.get(c.id) ?? [], now));
}

/** Start of the current month and year, in UTC — close enough for "this month" figures. */
function periodStarts(now: number) {
  const d = new Date(now);
  return {
    month: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1),
    year: Date.UTC(d.getUTCFullYear(), 0, 1),
  };
}

export async function getLandingData(): Promise<{
  stats: LandingStats;
  escrowFigures: EscrowFigure[];
  live: CampaignCard[];
}> {
  await connection();
  const now = Date.now();
  const rows = campaignsWhere("c.status != 'draft'");
  const open = rows.filter((c) => acceptsPledges(c, now));
  const held = rows.reduce((s, c) => s + escrowBalance(c), 0);
  const donors = get<{ n: number }>("SELECT COUNT(DISTINCT COALESCE('u' || user_id, backer_name)) AS n FROM pledges")!.n;
  const { month, year } = periodStarts(now);
  const releasedThisMonth = get<{ n: number }>(
    "SELECT COALESCE(SUM(gross), 0) AS n FROM payouts WHERE released_at >= ?",
    month,
  )!.n;
  const refundedThisYear = get<{ n: number }>(
    "SELECT COALESCE(SUM(amount), 0) AS n FROM refunds WHERE status = 'paid' AND paid_at >= ?",
    year,
  )!.n;
  const monthName = monthOf(now);

  return {
    stats: {
      escrow: `${usd(held)} held in escrow`,
      liveCampaigns: plural(open.length, "live campaign"),
      donors: `${count(donors)} donors`,
      liveCount: open.length,
    },
    escrowFigures: [
      { value: usd(held), label: "Held in escrow right now", mobileLabel: "Held in escrow" },
      {
        value: usd(releasedThisMonth),
        label: `Released to creators in ${monthName}`,
        mobileLabel: `Released in ${monthName}`,
      },
      { value: usd(refundedThisYear), label: "Refunded to donors this year", mobileLabel: "Refunded this year" },
      { value: "5 days", label: "Deadline to resolve any dispute", mobileLabel: "To resolve a dispute" },
    ],
    live: cardsFor(
      [...open].sort((a, b) => b.backers - a.backers).slice(0, 3),
      now,
    ),
  };
}

/** Every campaign a visitor can browse: open ones first (soonest closing), then funded. */
export async function getDiscoverCampaigns(): Promise<CampaignCard[]> {
  await connection();
  const now = Date.now();
  const rows = campaignsWhere("c.status = 'live'").sort((a, b) => {
    const aOpen = acceptsPledges(a, now);
    const bOpen = acceptsPledges(b, now);
    if (aOpen !== bOpen) return aOpen ? -1 : 1;
    return aOpen ? (a.ends_at ?? 0) - (b.ends_at ?? 0) : (b.ends_at ?? 0) - (a.ends_at ?? 0);
  });
  return cardsFor(rows, now);
}

export async function getCampaignMeta(slug: string): Promise<{ title: string; summary: string } | null> {
  await connection();
  const row = get<{ title: string; summary: string }>("SELECT title, summary FROM campaigns WHERE slug = ?", slug);
  return row ?? null;
}

/** "Stages 01 and 02" / "Stages 01 to 04" / "Stage 03". */
function stagesPhrase(positions: number[]): string {
  if (positions.length === 1) return `Stage ${stageNumber(positions[0])}`;
  if (positions.length === 2) return `Stages ${stageNumber(positions[0])} and ${stageNumber(positions[1])}`;
  return `Stages ${stageNumber(positions[0])} to ${stageNumber(positions[positions.length - 1])}`;
}

function detailMilestone(m: MilestoneRow, hasDispute: boolean, launchedAt: number | null, now: number): DetailMilestone {
  const phase = phaseOf(m, hasDispute, now);
  const base = {
    stageNumber: stageNumber(m.position),
    label: m.label,
    amount: usd(m.amount),
    description: m.description,
    evidenceNote: m.evidence_note,
    evidence: evidenceOf(m),
    evidenceDocument: m.evidence_document,
    terms: termsWithDate(m, launchedAt, longDate),
  };
  switch (phase) {
    case "released":
      return { ...base, state: "released", badgeLabel: "Released", badgeVariant: "funded", meta: `Released ${shortDate(m.released_at!)}` };
    case "review":
      return {
        ...base,
        state: "submitted",
        badgeLabel: "In review",
        badgeVariant: "warning",
        meta: `Evidence filed ${shortDate(m.submitted_at!)} · ${span(m.window_ends_at! - now)} to dispute`,
      };
    case "awaiting":
      return {
        ...base,
        state: "submitted",
        badgeLabel: "Awaiting release",
        badgeVariant: "neutral",
        meta: `Window closed ${shortDate(m.window_ends_at!)} · no dispute`,
      };
    case "disputed":
      return { ...base, state: "submitted", badgeLabel: "Disputed", badgeVariant: "destructive", meta: "Under moderator review" };
    case "current":
      return {
        ...base,
        state: "current",
        badgeLabel: "In progress",
        badgeVariant: "neutral",
        meta: m.due_at ? `Due ${shortDate(m.due_at)}` : "Work under way",
      };
    case "refunded":
      return {
        ...base,
        state: "pending",
        badgeLabel: "Refunded",
        badgeVariant: "outline",
        meta: m.refunded_at ? `Refunded ${shortDate(m.refunded_at)}` : "Refunded to donors",
      };
    default:
      return {
        ...base,
        state: "pending",
        badgeLabel: "Pending",
        badgeVariant: "outline",
        meta: m.position === 1 ? "Opens at launch" : `Opens after stage ${stageNumber(m.position - 1)}`,
      };
  }
}

export async function getCampaignPage(
  slug: string,
  viewer: Viewer | null,
): Promise<{ detail: CampaignDetail; viewerState: CampaignViewerState } | null> {
  await connection();
  const now = Date.now();
  const c = campaignBySlug(slug);
  if (!c) return null;
  // Drafts are visible only to their creator and to staff.
  if (c.status === "draft" && viewer?.creatorId !== c.creator_id && viewer?.role !== "admin") return null;

  const milestones = milestonesByCampaign([c.id]).get(c.id) ?? [];
  const disputes = openDisputesByMilestone(milestones.map((m) => m.id));
  const updates = all<{ id: number; title: string; body: string; created_at: number }>(
    "SELECT id, title, body, created_at FROM updates WHERE campaign_id = ? ORDER BY created_at DESC",
    c.id,
  );
  const backers = all<{ id: number; backer_name: string; amount: number }>(
    `SELECT p.id, p.backer_name, p.amount
     FROM pledges p
     WHERE p.campaign_id = ? ORDER BY p.created_at DESC LIMIT 12`,
    c.id,
  );
  const tiers = all<{ id: number; amount: number; label: string; stock: number | null; taken: number }>(
    `SELECT t.id, t.amount, t.label, t.stock, (SELECT COUNT(*) FROM pledges p WHERE p.tier_id = t.id) AS taken
     FROM tiers t WHERE t.campaign_id = ? ORDER BY t.position`,
    c.id,
  );
  const creatorStats = get<{ campaigns: number; released: number }>(
    `SELECT (SELECT COUNT(*) FROM campaigns WHERE creator_id = ? AND status != 'draft') AS campaigns,
            (SELECT COUNT(*) FROM milestones m JOIN campaigns x ON x.id = m.campaign_id
             WHERE x.creator_id = ? AND m.state = 'released') AS released`,
    c.creator_id,
    c.creator_id,
  )!;

  const released = milestones.filter((m) => m.state === "released");
  const next = milestones.find((m) => m.state !== "released" && m.state !== "refunded");
  const queued = c.refunded_total - c.refunded_paid;
  const status = displayStatus(c, now);

  const detail: CampaignDetail = {
    id: c.id,
    slug: c.slug,
    category: c.category,
    location: c.location,
    title: c.title,
    subtitleDesktop: c.summary,
    subtitleMobile: c.summary_short,
    status,
    canPledge: acceptsPledges(c, now),
    creator: {
      id: c.creator_id,
      initials: c.creator_initials,
      name: c.creator_name,
      location: c.creator_location,
      meta: `${plural(creatorStats.campaigns, "campaign")} · ${plural(creatorStats.released, "milestone")} released`,
      verified: c.kyc_status === "verified",
    },
    figures: [
      {
        label: "Released to creator",
        value: usd(c.released),
        meta: released.length ? `${stagesPhrase(released.map((m) => m.position))}, signed off` : "Nothing released yet",
      },
      {
        label: "Held in escrow",
        value: usd(available(c)),
        meta: queued > 0 ? `${usd(queued)} queued for refund` : "Releases only on approval",
      },
      next
        ? {
            label: "Next release",
            value: usd(next.amount),
            meta: `${next.label} · ${PHASE_LABEL[phaseOf(next, disputes.has(next.id), now)].toLowerCase()}`,
          }
        : { label: "Next release", value: "—", meta: "Every stage has settled" },
    ],
    raised: usd(c.raised),
    goalLabel: goalLabel(c),
    fillPct: percent(c.raised, c.goal),
    backerCount: c.backers,
    daysLeft: c.ends_at ? daysUntil(c.ends_at, now) : 0,
    timeLeftLabel: timeLeft(c.ends_at, now),
    milestoneSummary: `${released.length} of ${milestones.length} released · ${usd(c.released)} of ${usd(c.goal)}`,
    milestones: milestones.map((m) => detailMilestone(m, disputes.has(m.id), c.launched_at, now)),
    releasedCount: released.length,
    releasedValue: usd(c.released),
    heldValue: usd(available(c)),
    story: JSON.parse(c.story) as string[],
    updates: updates.map((u) => ({ id: u.id, date: shortDate(u.created_at), title: u.title, body: u.body })),
    backers: backers.map((b) => ({
      id: b.id,
      initials: initialsOf(b.backer_name),
      name: b.backer_name,
      amount: usd(b.amount),
    })),
    tiers: tiers.map((t) => {
      const left = t.stock != null ? Math.max(0, t.stock - t.taken) : null;
      return {
        id: t.id,
        amount: usd(t.amount),
        amountValue: t.amount,
        label: t.label,
        meta: left != null ? (left === 0 ? "Sold out" : `${left} of ${t.stock} left`) : plural(t.taken, "backer"),
        soldOut: left === 0,
      };
    }),
    defaultTierIndex: tiers.length > 1 ? 1 : 0,
    heroPlaceholder: c.hero_caption,
  };

  let viewerState: CampaignViewerState = {
    signedIn: false,
    initials: null,
    homeHref: "/signin",
    following: false,
    pledgedTotal: null,
  };
  if (viewer) {
    const following = get("SELECT 1 FROM follows WHERE user_id = ? AND creator_id = ?", viewer.id, c.creator_id) != null;
    const pledged = get<{ n: number | null }>(
      "SELECT SUM(amount) AS n FROM pledges WHERE user_id = ? AND campaign_id = ?",
      viewer.id,
      c.id,
    )!.n;
    viewerState = {
      signedIn: true,
      initials: viewer.initials,
      homeHref: homeFor(viewer.role),
      following,
      pledgedTotal: pledged ? usd(pledged) : null,
    };
  }

  return { detail, viewerState };
}

/**
 * The campaign card the auth screens show — the one the visitor came from if
 * we know it, otherwise the most-backed campaign still open.
 */
export async function getContextCampaign(slug?: string | null): Promise<ContextCampaign | null> {
  await connection();
  const now = Date.now();
  let c = slug ? campaignBySlug(slug) : undefined;
  if (!c || c.status === "draft") {
    c = campaignsWhere("c.status = 'live'")
      .filter((row) => acceptsPledges(row, now))
      .sort((a, b) => b.raised - a.raised)[0];
  }
  if (!c) return null;
  const milestones = milestonesByCampaign([c.id]).get(c.id) ?? [];
  const disputes = openDisputesByMilestone(milestones.map((m) => m.id));
  return {
    slug: c.slug,
    title: c.title,
    creatorLine: `${c.creator_name} · ${c.location}`,
    raised: usd(c.raised),
    goalLabel: goalLabel(c),
    fillPct: percent(c.raised, c.goal),
    donorsLabel: plural(c.backers, "donor"),
    timeLeftLabel: timeLeft(c.ends_at, now),
    milestones: trackFor(milestones, disputes, now),
  };
}

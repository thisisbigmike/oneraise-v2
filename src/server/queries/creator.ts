import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { all, get } from "../db";
import {
  PLATFORM_FEE,
  available,
  campaignsWhere,
  disputeCountsByMilestone,
  displayStatus,
  evidenceOf,
  milestonesByCampaign,
  openDisputesByMilestone,
  phaseOf,
  termsWithDate,
  type CampaignRow,
  type MilestoneRow,
} from "../domain";
import { readPrefs, sessionSummary } from "./donor";
import {
  count,
  dateTime,
  initialsOf,
  longDate,
  negativeUsd,
  percent,
  plural,
  span,
  stageNumber,
  timeLeft,
  usd,
} from "@/lib/format";
import type {
  CampaignUpdateItem,
  CreatorCampaignSummary,
  CreatorOverviewData,
  CreatorSettingsData,
  CreatorShellData,
  CurrentStage,
  DonorEntry,
  LadderStage,
  NextPayout,
  NotificationPref,
  PayoutEntry,
  Viewer,
} from "@/lib/view-models";

export const ACTIVE_CAMPAIGN_COOKIE = "or_campaign";

const STATUS_LABEL: Record<string, string> = {
  live: "Live campaign",
  expiring: "Closing soon",
  funded: "Funding closed",
  draft: "Draft",
  paused: "Paused",
  failed: "Failed",
  refunded: "Refunded",
};

function summary(c: CampaignRow, now: number): CreatorCampaignSummary {
  const status = displayStatus(c, now);
  return { id: c.id, slug: c.slug, title: c.title, shortTitle: c.short_title, status, statusLabel: STATUS_LABEL[status] };
}

/**
 * The campaign the creator is working on: the one they last switched to if it
 * is theirs, otherwise their live campaign, otherwise their newest.
 */
async function activeCampaign(viewer: Viewer): Promise<{ campaigns: CampaignRow[]; active: CampaignRow | null }> {
  if (viewer.creatorId == null) return { campaigns: [], active: null };
  const campaigns = campaignsWhere("c.creator_id = ? ORDER BY c.created_at DESC", viewer.creatorId);
  const chosen = (await cookies()).get(ACTIVE_CAMPAIGN_COOKIE)?.value;
  const active =
    campaigns.find((c) => c.slug === chosen) ??
    campaigns.find((c) => c.status === "live") ??
    campaigns[0] ??
    null;
  return { campaigns, active };
}

export async function getCreatorShell(viewer: Viewer): Promise<CreatorShellData> {
  await connection();
  const now = Date.now();
  const { campaigns, active } = await activeCampaign(viewer);
  const pending = active
    ? get<{ n: number }>("SELECT COUNT(*) AS n FROM milestones WHERE campaign_id = ? AND state = 'current'", active.id)!.n
    : 0;
  return {
    creatorName: viewer.displayName,
    creatorInitials: viewer.initials,
    campaigns: campaigns.map((c) => summary(c, now)),
    active: active ? summary(active, now) : null,
    pendingStageCount: pending,
  };
}

function ladderFor(c: CampaignRow, milestones: MilestoneRow[], now: number): LadderStage[] {
  const disputes = openDisputesByMilestone(milestones.map((m) => m.id));
  return milestones.map((m) => {
    const phase = phaseOf(m, disputes.has(m.id), now);
    const base = { number: stageNumber(m.position), label: m.label, amount: usd(m.amount) };
    switch (phase) {
      case "released":
        return {
          ...base,
          meta: `Released ${longDate(m.released_at!)}${c.payout_account ? ` · paid to ${c.payout_account.split(" · ")[0]} ${c.payout_account.split(" · ")[1] ?? ""}`.trimEnd() : ""}`,
          badge: "Released",
          badgeVariant: "funded",
        };
      case "current":
        return {
          ...base,
          meta: m.due_at ? `Due ${longDate(m.due_at)}` : "In progress",
          badge: "Draft",
          badgeVariant: "neutral",
          highlighted: true,
        };
      case "review":
        return {
          ...base,
          meta: `In review · window closes ${dateTime(m.window_ends_at!, now)}`,
          badge: "In review",
          badgeVariant: "warning",
          highlighted: true,
        };
      case "awaiting":
        return { ...base, meta: "Window closed · a moderator releases it next", badge: "Awaiting release", badgeVariant: "neutral", highlighted: true };
      case "disputed":
        return { ...base, meta: "A donor dispute is being decided", badge: "Disputed", badgeVariant: "destructive", highlighted: true };
      case "refunded":
        return {
          ...base,
          meta: m.refunded_at ? `Refunded to donors ${longDate(m.refunded_at)}` : "Refunded to donors",
          badge: "Refunded",
          badgeVariant: "outline",
        };
      default:
        return {
          ...base,
          meta: m.position === 1 ? "Opens at launch" : `Unlocks when stage ${stageNumber(m.position - 1)} releases`,
          badge: "Pending",
          badgeVariant: "outline",
        };
    }
  });
}

function currentStage(c: CampaignRow, milestones: MilestoneRow[], now: number): CurrentStage | null {
  const m = milestones.find((x) => x.state === "current" || x.state === "submitted");
  if (!m) return null;
  const openDispute = openDisputesByMilestone([m.id]).get(m.id) ?? null;
  const phase = phaseOf(m, openDispute != null, now);
  const evidence = evidenceOf(m);
  const gross = Math.min(m.amount, available(c));
  const fee = Math.round(gross * PLATFORM_FEE);
  const disputes = disputeCountsByMilestone([m.id]).get(m.id) ?? 0;
  const windowLength = m.window_ends_at && m.submitted_at ? m.window_ends_at - m.submitted_at : 0;

  let dueLabel = "No due date set";
  if (m.due_at) {
    const diff = m.due_at - now;
    dueLabel = diff >= 0 ? `Due ${longDate(m.due_at)} · ${span(diff)} from now` : `Due ${longDate(m.due_at)} · ${span(diff)} late`;
  }

  const complaint = openDispute
    ? (get<{ note: string }>(
        "SELECT note FROM milestone_reviews WHERE milestone_id = ? AND decision = 'dispute' AND note != '' ORDER BY created_at LIMIT 1",
        m.id,
      )?.note ?? null)
    : null;

  return {
    milestoneId: m.id,
    stageNumber: stageNumber(m.position),
    totalStages: stageNumber(milestones.length),
    label: m.label,
    amount: usd(m.amount),
    phase: phase === "current" ? "draft" : phase === "review" ? "review" : phase === "disputed" ? "disputed" : "awaiting",
    dueLabel,
    note: m.evidence_note,
    evidence,
    evidenceDocument: m.evidence_document,
    requirements: [
      { label: evidence.length ? `Evidence photos attached — ${evidence.length}` : "Evidence photos — none attached yet", met: evidence.length > 0 },
      { label: "Note to donors written", met: m.evidence_note.trim().length >= 20 },
      { label: m.evidence_document ? `Receipt attached · ${m.evidence_document}` : "Receipt or document attached", met: m.evidence_document != null },
    ],
    termsNote: termsWithDate(m, c.launched_at, longDate),
    submittedNote: m.submitted_at
      ? `Submitted ${longDate(m.submitted_at)} · ${
          phase === "review"
            ? "nothing to do until the window closes"
            : phase === "awaiting"
              ? "window closed, waiting on a moderator"
              : "a moderator is deciding the dispute"
        }`
      : "",
    windowEndsAt: m.window_ends_at,
    elapsedPct: windowLength ? percent(now - m.submitted_at!, windowLength) : 0,
    disputesNote: `${count(c.backers)} donors notified · ${plural(disputes, "dispute")} raised`,
    donorCount: c.backers,
    releasesTo: usd(gross),
    platformFee: negativeUsd(fee),
    landsIn: usd(gross - fee),
    payoutNote: c.payout_account
      ? `Paid to ${c.payout_account}, two working days after release.`
      : "Add a payout account in settings before this stage can release.",
    dispute: openDispute
      ? {
          id: openDispute.id,
          code: openDispute.code,
          statusLabel:
            openDispute.status === "awaiting_creator"
              ? "The moderator has asked you for more evidence"
              : openDispute.creator_response
                ? "Your response is with the moderator"
                : "Donors disputed this stage — respond with what they asked for",
          response: openDispute.creator_response,
          complaint,
        }
      : null,
  };
}

function donorEntries(campaignId: number, limit: number): DonorEntry[] {
  return all<{ id: number; backer_name: string; backer_location: string; amount: number; created_at: number; position: number | null }>(
    `SELECT p.id, p.backer_name, p.backer_location, p.amount, p.created_at, t.position
     FROM pledges p LEFT JOIN tiers t ON t.id = p.tier_id
     WHERE p.campaign_id = ? ORDER BY p.created_at DESC LIMIT ?`,
    campaignId,
    limit,
  ).map((p) => ({
    id: p.id,
    initials: initialsOf(p.backer_name),
    name: p.backer_name,
    amount: usd(p.amount),
    meta: [longDate(p.created_at), p.backer_location].filter(Boolean).join(" · "),
    tier: p.position != null ? `Tier ${p.position}` : "Custom",
  }));
}

export async function getCreatorOverview(viewer: Viewer): Promise<CreatorOverviewData | null> {
  await connection();
  const now = Date.now();
  const { active: c } = await activeCampaign(viewer);
  if (!c) return null;
  const milestones = milestonesByCampaign([c.id]).get(c.id) ?? [];
  const releasedCount = milestones.filter((m) => m.state === "released").length;
  const remaining = milestones.filter((m) => m.state !== "released" && m.state !== "refunded").length;
  const launched = c.launched_at != null;

  let identityNote: string | null = null;
  if (!launched) {
    identityNote =
      c.kyc_status === "verified"
        ? "This campaign is a draft. It publishes once it is reviewed."
        : c.kyc_status === "pending"
          ? "This campaign publishes as soon as a moderator verifies your identity documents."
          : c.kyc_status === "rejected"
            ? "Identity verification was rejected. Contact support to appeal before this can publish."
            : "Submit your identity documents so a moderator can verify you — the campaign publishes once they do.";
  } else if (c.kyc_status === "stale") {
    identityNote = "Your identity documents are more than a year old. Releases are on hold until you re-verify.";
  }

  return {
    campaign: summary(c, now),
    launched,
    kycStatus: c.kyc_status,
    figures: [
      { label: "Raised", value: usd(c.raised), meta: `${percent(c.raised, c.goal)}% of ${usd(c.goal)}` },
      { label: "Drawn down", value: usd(c.released), meta: `${plural(releasedCount, "milestone")} released` },
      { label: "Held in escrow", value: usd(available(c)), meta: `${plural(remaining, "stage")} remaining` },
      { label: "Donors", value: count(c.backers), meta: launched ? timeLeft(c.ends_at, now) : "Not launched" },
    ],
    stage: launched ? currentStage(c, milestones, now) : null,
    ladder: ladderFor(c, milestones, now),
    recentDonors: donorEntries(c.id, 3),
    moreDonors: Math.max(0, c.backers - 3),
    identityNote,
  };
}

export async function getCreatorMilestones(viewer: Viewer): Promise<{ shortTitle: string; ladder: LadderStage[] } | null> {
  await connection();
  const { active: c } = await activeCampaign(viewer);
  if (!c) return null;
  const milestones = milestonesByCampaign([c.id]).get(c.id) ?? [];
  return { shortTitle: c.short_title, ladder: ladderFor(c, milestones, Date.now()) };
}

export async function getCreatorDonors(viewer: Viewer): Promise<{ donors: DonorEntry[]; total: number } | null> {
  await connection();
  const { active: c } = await activeCampaign(viewer);
  if (!c) return null;
  return { donors: donorEntries(c.id, 250), total: c.backers };
}

export async function getCreatorPayouts(viewer: Viewer): Promise<{ history: PayoutEntry[]; next: NextPayout | null } | null> {
  await connection();
  const now = Date.now();
  const { active: c } = await activeCampaign(viewer);
  if (!c) return null;
  const history = all<{ id: number; position: number; label: string; gross: number; fee: number; net: number; account: string; released_at: number; paid_at: number }>(
    `SELECT po.id, m.position, m.label, po.gross, po.fee, po.net, po.account, po.released_at, po.paid_at
     FROM payouts po JOIN milestones m ON m.id = po.milestone_id
     WHERE m.campaign_id = ? ORDER BY po.released_at DESC`,
    c.id,
  ).map((p) => ({
    id: p.id,
    stage: `${stageNumber(p.position)} · ${p.label}`,
    releasedDate: longDate(p.released_at),
    gross: usd(p.gross),
    fee: negativeUsd(p.fee),
    net: usd(p.net),
    account: p.account,
    status: (p.paid_at <= now ? "Paid" : "Pending") as PayoutEntry["status"],
  }));

  const milestones = milestonesByCampaign([c.id]).get(c.id) ?? [];
  const m = milestones.find((x) => x.state === "current" || x.state === "submitted");
  let next: NextPayout | null = null;
  if (m && c.launched_at) {
    const phase = phaseOf(m, openDisputesByMilestone([m.id]).has(m.id), now);
    const gross = Math.min(m.amount, available(c));
    const fee = Math.round(gross * PLATFORM_FEE);
    next = {
      stage: `${stageNumber(m.position)} · ${m.label}`,
      gross: usd(gross),
      fee: negativeUsd(fee),
      net: usd(gross - fee),
      note:
        phase === "current"
          ? "Submit this stage's evidence to open the 72-hour window."
          : phase === "review"
            ? "Lands two working days after the dispute window closes with no objection."
            : phase === "awaiting"
              ? "The window has closed. It lands two working days after a moderator releases it."
              : "Held while a moderator decides the dispute.",
    };
  }
  return { history, next };
}

export async function getCreatorUpdates(viewer: Viewer): Promise<{ campaignTitle: string; updates: CampaignUpdateItem[] } | null> {
  await connection();
  const { active: c } = await activeCampaign(viewer);
  if (!c) return null;
  return {
    campaignTitle: c.title,
    updates: all<{ id: number; title: string; body: string; created_at: number }>(
      "SELECT id, title, body, created_at FROM updates WHERE campaign_id = ? ORDER BY created_at DESC",
      c.id,
    ).map((u) => ({ id: u.id, title: u.title, body: u.body, date: longDate(u.created_at) })),
  };
}

const KYC_LABEL: Record<CreatorSettingsData["kycStatus"], string> = {
  verified: "Verified creator",
  pending: "Verification in progress",
  stale: "Re-verification needed",
  rejected: "Verification rejected",
  none: "Not verified",
};

export async function getCreatorSettings(viewer: Viewer): Promise<CreatorSettingsData | null> {
  await connection();
  if (viewer.creatorId == null) return null;
  const cr = get<{
    name: string;
    initials: string;
    location: string;
    bio: string;
    kyc_status: CreatorSettingsData["kycStatus"];
    kyc_verified_at: number | null;
    payout_account: string | null;
    payout_currency: string;
  }>("SELECT name, initials, location, bio, kyc_status, kyc_verified_at, payout_account, payout_currency FROM creators WHERE id = ?", viewer.creatorId)!;
  const u = get<{ password_changed_at: number; two_factor: number; notify_prefs: string }>(
    "SELECT password_changed_at, two_factor, notify_prefs FROM users WHERE id = ?",
    viewer.id,
  )!;
  const payouts = await getCreatorPayouts(viewer);
  const { active } = await activeCampaign(viewer);
  const prefs = readPrefs(u.notify_prefs);
  const sessions = await sessionSummary(viewer.id);
  const donors = active?.backers ?? 0;
  const notifications: NotificationPref[] = [
    { key: "dispute_raised", label: "A donor disputes a milestone", meta: "Required · you have 5 days to respond", checked: true, locked: true },
    { key: "due_approaching", label: "A milestone due date is approaching", meta: "Sent 7 days and 1 day before", checked: prefs.due_approaching ?? true },
    { key: "payout_landed", label: "A payout lands in your account", checked: prefs.payout_landed ?? true },
    {
      key: "every_pledge",
      label: "Every new pledge",
      meta: donors > 50 ? `Off by default — ${count(donors)} donors is a lot of email` : "Off by default",
      checked: prefs.every_pledge ?? false,
    },
  ];
  const pendingDocs = get<{ status: string; submitted_at: number }>(
    "SELECT status, submitted_at FROM identity_checks WHERE creator_id = ? ORDER BY submitted_at DESC LIMIT 1",
    viewer.creatorId,
  );
  return {
    studioName: cr.name,
    initials: cr.initials || initialsOf(cr.name),
    location: cr.location,
    bio: cr.bio,
    kycStatus: cr.kyc_status,
    kycLabel: KYC_LABEL[cr.kyc_status],
    documentsMeta:
      cr.kyc_status === "verified" && cr.kyc_verified_at
        ? `Documents on file · verified ${longDate(cr.kyc_verified_at)}`
        : pendingDocs && cr.kyc_status === "pending"
          ? `Documents submitted ${longDate(pendingDocs.submitted_at)} · a moderator is reviewing them`
          : cr.kyc_status === "stale"
            ? "Documents on file are more than a year old"
            : "No documents submitted yet",
    payoutAccount: cr.payout_account ?? "No payout account added",
    payoutCurrency: cr.payout_currency,
    nextPayoutNote: payouts?.next
      ? `${payouts.next.net} · when stage ${payouts.next.stage.split(" · ")[0]} releases, then two working days`
      : "No payout scheduled",
    passwordChanged: `Last changed ${longDate(u.password_changed_at)}`,
    twoFactor: u.two_factor === 1,
    sessionsCount: sessions.count,
    sessionsMeta: sessions.meta,
    campaignLive: active?.status === "live",
    notifications,
  };
}

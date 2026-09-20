/**
 * The shapes the UI renders. The server data layer (src/server/queries)
 * computes these from the database; components only ever see these, never raw
 * rows, so nothing sensitive (hashes, emails of other users) reaches the client.
 */
import type { CampaignStatus, Milestone } from "@/lib/types";

export type { CampaignStatus, Milestone };

export type Role = "donor" | "creator" | "admin";

export interface Viewer {
  id: number;
  name: string;
  initials: string;
  email: string;
  role: Role;
  roleLabel: string;
  creatorId: number | null;
  /** The name shown on the account chip — the studio name for creators. */
  displayName: string;
  emailVerified: boolean;
}

export type BadgeVariant = "neutral" | "outline" | "primary" | "funded" | "warning" | "destructive";

/** The generic result every form action returns to useActionState. */
export interface ActionState {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Extra data a form may need back, e.g. a dev-only preview link. */
  link?: string;
  /** What the visitor typed, so a rejected form can be re-filled (React resets forms after an action). */
  values?: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/* Public campaign surfaces                                            */
/* ------------------------------------------------------------------ */

export interface CampaignCard {
  slug: string;
  title: string;
  category: string;
  location: string;
  creatorName: string;
  /** "Bryn & Co. · Powys" */
  creatorLine: string;
  status: CampaignStatus;
  stageLabel: string;
  raised: string;
  goalLabel: string;
  fillPct: number;
  backerCount: number;
  daysLeft: number;
  timeLeftLabel: string;
  heroCaption: string;
}

export interface LandingStats {
  escrow: string;
  liveCampaigns: string;
  donors: string;
  liveCount: number;
}

export interface EscrowFigure {
  value: string;
  label: string;
  mobileLabel: string;
}

export interface DetailMilestone {
  stageNumber: string;
  label: string;
  amount: string;
  description: string;
  state: "released" | "submitted" | "current" | "pending";
  badgeLabel: string;
  badgeVariant: BadgeVariant;
  meta: string;
  evidenceNote: string;
  evidence: string[];
  evidenceDocument: string | null;
  terms: string;
}

export interface CampaignUpdateItem {
  id: number;
  date: string;
  title: string;
  body: string;
}

export interface Backer {
  id: number;
  initials: string;
  name: string;
  amount: string;
}

export interface Tier {
  id: number;
  amount: string;
  amountValue: number;
  label: string;
  meta: string;
  soldOut: boolean;
}

export interface CampaignDetail {
  id: number;
  slug: string;
  category: string;
  location: string;
  title: string;
  subtitleDesktop: string;
  subtitleMobile: string;
  status: CampaignStatus;
  canPledge: boolean;
  creator: {
    id: number;
    initials: string;
    name: string;
    location: string;
    meta: string;
    verified: boolean;
  };
  figures: { label: string; value: string; meta: string }[];
  raised: string;
  goalLabel: string;
  fillPct: number;
  backerCount: number;
  daysLeft: number;
  timeLeftLabel: string;
  milestoneSummary: string;
  milestones: DetailMilestone[];
  releasedCount: number;
  releasedValue: string;
  heldValue: string;
  story: string[];
  updates: CampaignUpdateItem[];
  backers: Backer[];
  tiers: Tier[];
  defaultTierIndex: number;
  heroPlaceholder: string;
}

/** What the signed-in visitor has to do with this campaign. */
export interface CampaignViewerState {
  signedIn: boolean;
  initials: string | null;
  homeHref: string;
  following: boolean;
  pledgedTotal: string | null;
}

/** The campaign card the auth screens carry through sign in and sign up. */
export interface ContextCampaign {
  slug: string;
  title: string;
  creatorLine: string;
  raised: string;
  goalLabel: string;
  fillPct: number;
  donorsLabel: string;
  timeLeftLabel: string;
  milestones: Milestone[];
}

/* ------------------------------------------------------------------ */
/* Donor                                                               */
/* ------------------------------------------------------------------ */

export interface ReviewQueueItem {
  id: string;
  milestoneId: number;
  campaign: string;
  campaignSlug: string;
  /** "Milestone 2 · Pit relining" */
  milestone: string;
  milestoneLabel: string;
  amount: string;
  yourShare: string;
  windowLabel: string;
  /** "14 hours" */
  windowRemaining: string;
  windowPct: number;
  urgent: boolean;
  evidenceNote: string;
  evidence: string[];
  releasesFrom: string;
  disputedOf: string;
  termsNote: string;
  creatorName: string;
  submittedDate: string;
  track: Milestone[];
}

export interface DonorPledge {
  id: number;
  campaign: string;
  campaignSlug: string;
  creator: string;
  location: string;
  pledgedLabel: string;
  status: CampaignStatus;
  milestones: Milestone[];
  pledgedAmount: string;
  inEscrow: string;
  released: string;
  refunded: string;
  stageNote: string;
}

export interface DonorFigures {
  inEscrow: { value: string; meta: string };
  released: { value: string; meta: string };
  refunded: { value: string; meta: string };
}

export interface DonorRefund {
  id: number;
  campaign: string;
  creator: string;
  location: string;
  amount: string;
  statusLabel: string;
  note: string;
  milestones: Milestone[];
}

export interface FollowedCreator {
  id: number;
  initials: string;
  name: string;
  location: string;
  campaignsCount: number;
  latestTitle: string;
  latestSlug: string | null;
  latestStatus: CampaignStatus;
}

export interface NotificationPref {
  key: string;
  label: string;
  meta?: string;
  checked: boolean;
  locked?: boolean;
}

export interface DonorSettingsData {
  name: string;
  initials: string;
  email: string;
  emailVerified: boolean;
  country: string;
  currencyLabel: string;
  card: { label: string; meta: string } | null;
  passwordChanged: string;
  twoFactor: boolean;
  sessionsCount: number;
  sessionsMeta: string;
  escrowHeld: string;
  canClose: boolean;
  notifications: NotificationPref[];
}

/* ------------------------------------------------------------------ */
/* Creator                                                             */
/* ------------------------------------------------------------------ */

export interface CreatorCampaignSummary {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  status: CampaignStatus;
  statusLabel: string;
}

export interface CreatorShellData {
  creatorName: string;
  creatorInitials: string;
  campaigns: CreatorCampaignSummary[];
  active: CreatorCampaignSummary | null;
  pendingStageCount: number;
}

export interface CreatorFigure {
  label: string;
  value: string;
  meta: string;
}

export interface LadderStage {
  number: string;
  label: string;
  amount: string;
  meta: string;
  badge: string;
  badgeVariant: BadgeVariant;
  highlighted?: boolean;
}

export interface CurrentStage {
  milestoneId: number;
  stageNumber: string;
  totalStages: string;
  label: string;
  amount: string;
  /** draft: evidence not yet submitted · review: window open · awaiting: window closed, moderator to release · disputed: an open case */
  phase: "draft" | "review" | "awaiting" | "disputed";
  dueLabel: string;
  note: string;
  evidence: string[];
  evidenceDocument: string | null;
  requirements: { label: string; met: boolean }[];
  termsNote: string;
  submittedNote: string;
  windowEndsAt: number | null;
  elapsedPct: number;
  disputesNote: string;
  donorCount: number;
  releasesTo: string;
  platformFee: string;
  landsIn: string;
  payoutNote: string;
  dispute: {
    id: number;
    code: string;
    statusLabel: string;
    response: string | null;
    complaint: string | null;
  } | null;
}

export interface CreatorOverviewData {
  campaign: CreatorCampaignSummary;
  launched: boolean;
  kycStatus: "none" | "pending" | "verified" | "stale" | "rejected";
  figures: CreatorFigure[];
  stage: CurrentStage | null;
  ladder: LadderStage[];
  recentDonors: DonorEntry[];
  moreDonors: number;
  identityNote: string | null;
}

export interface DonorEntry {
  id: number;
  initials: string;
  name: string;
  amount: string;
  meta: string;
  tier: string;
}

export interface PayoutEntry {
  id: number;
  stage: string;
  releasedDate: string;
  gross: string;
  fee: string;
  net: string;
  account: string;
  status: "Paid" | "Pending";
}

export interface NextPayout {
  stage: string;
  gross: string;
  fee: string;
  net: string;
  note: string;
}

export interface CreatorSettingsData {
  studioName: string;
  initials: string;
  location: string;
  bio: string;
  kycStatus: "none" | "pending" | "verified" | "stale" | "rejected";
  kycLabel: string;
  documentsMeta: string;
  payoutAccount: string;
  payoutCurrency: string;
  nextPayoutNote: string;
  passwordChanged: string;
  twoFactor: boolean;
  sessionsCount: number;
  sessionsMeta: string;
  campaignLive: boolean;
  notifications: NotificationPref[];
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export type DisputeStatus = "Breaching" | "In review" | "Awaiting creator" | "New" | "Resolved";

export interface DisputeRow {
  id: string;
  slug: string;
  campaign: string;
  milestone: string;
  held: string;
  donors: number;
  opened: string;
  deadline: string;
  deadlineUrgent: boolean;
  assignee: string;
  status: DisputeStatus;
  filterTags: ("breaching" | "assigned-to-me" | "awaiting-creator")[];
}

export interface DecisionOption {
  value: string;
  label: string;
  description: string;
}

export interface DisputeCaseDetail {
  disputeId: number;
  id: string;
  slug: string;
  status: DisputeStatus;
  title: string;
  campaign: string;
  campaignSlug: string;
  creator: string;
  creatorInitials: string;
  openedDate: string;
  decideWithin: string;
  disputingTotal: number;
  totalCampaignDonors: number;
  submission: {
    date: string;
    evidence: string[];
    note: string;
    termsNote: string;
    document?: string;
  };
  donorComplaints: {
    initials: string;
    name: string;
    pledged: string;
    date: string;
    note: string;
  }[];
  moreDisputesNote?: string;
  creatorResponse?: { date: string; note: string };
  money: { label: string; value: string }[];
  resolution?: {
    decision: string;
    decidedBy: string;
    decidedDate: string;
    reason: string;
  };
  options: DecisionOption[];
}

export interface ReleaseRow {
  id: string;
  milestoneId: number;
  milestone: string;
  campaign: string;
  creator: string;
  amount: string;
  amountValue: number;
  windowClosed: string;
  disputes: number;
  state: "clear" | "blocked" | "stale-kyc" | "held";
  note?: string;
  disputeSlug?: string;
}

export interface IdentityPanel {
  creator: string;
  documentsCount: string;
  items: { label: string; meta: string; submitted: boolean }[];
  checks: { label: string; variant: BadgeVariant }[];
}

export interface IdentityRow {
  id: string;
  checkId: number;
  creator: string;
  structure: string;
  country: string;
  documents: string;
  submitted: string;
  blocking: string;
  status: "Incomplete" | "Ready" | "Resubmitted";
  panel: IdentityPanel;
  options: DecisionOption[];
}

export interface RefundBatchRow {
  id: string;
  batchId: number;
  campaign: string;
  reason: string;
  amount: string;
  donors: number;
  status: "Queued" | "Settled" | "Failed";
  failedCount: number;
  settledDate?: string;
}

export interface FailedRefundRow {
  id: string;
  refundId: number;
  donor: string;
  card: string;
  amount: string;
  reason: string;
  action: string;
}

export interface RefundsData {
  totalAmount: string;
  totalDonors: number;
  queued: { count: number; amount: string; donors: number };
  batches: RefundBatchRow[];
  failed: FailedRefundRow[];
  failedSummary: string;
}

export interface ModerationCampaign {
  id: string;
  campaignId: number;
  campaignSlug: string;
  campaign: string;
  campaignMeta: string;
  topReason: string;
  reports: number;
  raised: string;
  oldest: string;
  status: "Under review" | "Triage";
  donors: number;
  description: string;
  reasonBreakdown: { reason: string; count: number; pct: number }[];
  options: DecisionOption[];
}

export type AuditActionType =
  | "Release"
  | "Refund"
  | "Identity"
  | "Takedown"
  | "Hold"
  | "Account"
  | "Dispute"
  | "Moderation";

export interface AuditEntry {
  id: number;
  timestamp: string;
  actor: string;
  action: AuditActionType;
  target: string;
  reason: string;
  amount: string;
  source: string;
  filterTag: "releases" | "refunds" | "takedowns" | "identity" | "account-changes" | "disputes";
}

export interface AdminCounts {
  disputes: number;
  releases: number;
  identity: number;
  refunds: number;
  moderation: number;
}

export interface AdminOverviewData {
  generatedAt: string;
  stats: { label: string; value: string; meta: string; destructive: boolean }[];
  queues: {
    key: string;
    icon: string;
    label: string;
    href: string;
    count: string;
    meta: string;
    badge: string;
    badgeVariant: BadgeVariant;
  }[];
  lastActions: { id: number; time: string; moderator: string; action: string; amount: string }[];
  triage: {
    banner: { title: string; meta: string } | null;
    counts: { label: string; value: string }[];
    needsYouFirst: { id: string; slug: string; badge: string; title: string; meta: string }[];
  };
}

export interface EscrowLedgerData {
  totalHeld: string;
  /** Secondary figures shown beside the total — what is owed out of it next. */
  summary: { label: string; value: string }[];
  reconciledAt: string;
  byState: { label: string; value: string; pct: number; color: "accent" | "primary" | "destructive" | "warning" }[];
  byCurrency: { currency: string; held: string; usd: string; campaigns: number }[];
  currencyTotal: { currencies: number; usd: string; campaigns: number };
  largest: { slug: string; campaign: string; creator: string; held: string; stagesLeft: string; disputed: boolean }[];
}

export interface UserProfileData {
  id: number;
  initials: string;
  name: string;
  email: string;
  joined: string;
  role: string;
  verified: boolean;
  suspended: boolean;
  figures: { label: string; value: string }[];
  pledges: { id: number; campaign: string; pledged: string; inEscrow: string; date: string; status: CampaignStatus }[];
  account: { label: string; value: string }[];
  escrowHeld: string;
}

export interface UserSearchResult {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const overviewStats = {
  heldInEscrow: { value: "$4,182,400", meta: "Across 214 live campaigns" },
  releasedAugust: { value: "$612,900", meta: "148 milestones" },
  openDisputes: { value: "7", meta: "2 past their 5-day deadline" },
  awaitingRelease: { value: "12", meta: "$284,600 to move" },
};

export const queueSummary = [
  {
    key: "disputes",
    icon: "message-circle",
    label: "Disputes",
    href: "/admin/disputes",
    count: "7",
    meta: "Oldest 6 days",
    badge: "2 breaching",
    badgeVariant: "destructive" as const,
  },
  {
    key: "releases",
    icon: "check",
    label: "Releases",
    href: "/admin/releases",
    count: "12",
    meta: "Oldest 19 hours",
    badge: "9 clear",
    badgeVariant: "funded" as const,
  },
  {
    key: "identity",
    icon: "shield-check",
    label: "Identity",
    href: "/admin/identity",
    count: "4",
    meta: "Oldest 2 days",
    badge: "1 resubmitted",
    badgeVariant: "neutral" as const,
  },
  {
    key: "refunds",
    icon: "circle-dollar-sign",
    label: "Refunds",
    href: "/admin/refunds",
    count: "3",
    meta: "$47,200 to return",
    badge: "1 failed card",
    badgeVariant: "warning" as const,
  },
  {
    key: "moderation",
    icon: "alert-triangle",
    label: "Moderation",
    href: "/admin/moderation",
    count: "2",
    meta: "Oldest 8 hours",
    badge: "14 reports",
    badgeVariant: "neutral" as const,
  },
];

export const lastActions = [
  {
    time: "09:12 today",
    moderator: "Tomi Musa",
    action: "Released milestone 3 on Seed library for urban allotments",
    amount: "$4,800",
  },
  {
    time: "08:47 today",
    moderator: "Ruth Ade",
    action: "Refunded 41 donors on Restoring the Cowdray kiln",
    amount: "$16,000",
  },
  {
    time: "2 Sep · 17:30",
    moderator: "Tomi Musa",
    action: "Verified creator Rootwork Collective",
    amount: "—",
  },
  {
    time: "2 Sep · 14:05",
    moderator: "Ruth Ade",
    action: "Took down campaign Fast cash flip fund for policy breach",
    amount: "—",
  },
];

export type DisputeStatus =
  | "Breaching"
  | "In review"
  | "Awaiting creator"
  | "New"
  | "Resolved";

export interface DisputeRow {
  id: string;
  slug: string;
  campaign: string;
  milestone: string;
  held: string;
  donors: number;
  opened: string;
  deadline: string;
  deadlineUrgent?: boolean;
  assignee: string;
  status: DisputeStatus;
  filterTags: ("breaching" | "assigned-to-me" | "awaiting-creator")[];
}

export const disputes: DisputeRow[] = [
  {
    id: "D-1184",
    slug: "d-1184",
    campaign: "Restoring the Cowdray kiln",
    milestone: "02 · Kiln lining",
    held: "$16,000",
    donors: 38,
    opened: "28 Aug",
    deadline: "1 day over",
    deadlineUrgent: true,
    assignee: "Ruth Ade",
    status: "Breaching",
    filterTags: ["breaching"],
  },
  {
    id: "D-1179",
    slug: "d-1179",
    campaign: "A letterpress revival in the Welsh valleys",
    milestone: "03 · Bindery",
    held: "$22,400",
    donors: 61,
    opened: "29 Aug",
    deadline: "Today",
    deadlineUrgent: true,
    assignee: "Tomi Musa",
    status: "Breaching",
    filterTags: ["breaching", "assigned-to-me"],
  },
  {
    id: "D-1191",
    slug: "d-1191",
    campaign: "Rebuilding the indigo dye pits at Kofar Mata",
    milestone: "02 · Pit relining",
    held: "$21,000",
    donors: 4,
    opened: "2 Sep",
    deadline: "4 days",
    assignee: "Tomi Musa",
    status: "In review",
    filterTags: ["assigned-to-me"],
  },
  {
    id: "D-1188",
    slug: "d-1188",
    campaign: "Hollow Clay opens its second kiln",
    milestone: "01 · Tooling",
    held: "$9,600",
    donors: 12,
    opened: "1 Sep",
    deadline: "3 days",
    assignee: "Unassigned",
    status: "Awaiting creator",
    filterTags: ["awaiting-creator"],
  },
  {
    id: "D-1192",
    slug: "d-1192",
    campaign: "Rootwork Collective's winter beds",
    milestone: "02 · Frames",
    held: "$7,150",
    donors: 3,
    opened: "3 Sep",
    deadline: "5 days",
    assignee: "Unassigned",
    status: "New",
    filterTags: [],
  },
  {
    id: "D-1176",
    slug: "d-1176",
    campaign: "Seed library for urban allotments",
    milestone: "02 · Cataloguing",
    held: "$5,000",
    donors: 1,
    opened: "26 Aug",
    deadline: "Closed",
    assignee: "Ruth Ade",
    status: "Resolved",
    filterTags: ["assigned-to-me", "awaiting-creator"],
  },
];

export interface DisputeCaseDetail {
  id: string;
  slug: string;
  status: DisputeStatus;
  title: string;
  campaign: string;
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
}

export const disputeCases: Record<string, DisputeCaseDetail> = {
  "d-1191": {
    id: "D-1191",
    slug: "d-1191",
    status: "In review",
    title: "Pit relining, disputed by 4 donors",
    campaign: "Rebuilding the indigo dye pits at Kofar Mata",
    creator: "Hausa Indigo Collective",
    creatorInitials: "HI",
    openedDate: "2 Sep 2026",
    decideWithin: "4 days",
    disputingTotal: 4,
    totalCampaignDonors: 631,
    submission: {
      date: "1 Sep 2026",
      evidence: ["Pit 14, after", "Pit 15, after", "Pits, before"],
      note: "Thirty-one pits relined with laterite and potash mortar. The two shown are pits 14 and 15, cured eleven days. Remaining forty-seven follow in stage three once the roof is up.",
      termsNote:
        "Thirty pits relined and cured, photographed before and after, with a materials receipt. Agreed at launch on 4 Jul 2026.",
      document: "Materials receipt · laterite and potash",
    },
    donorComplaints: [
      {
        initials: "JO",
        name: "Joseph Okonkwo",
        pledged: "$80",
        date: "2 Sep",
        note: "The before photograph is the same pit as the after photograph, taken from a different angle. Only one pit is actually shown lined.",
      },
      {
        initials: "MW",
        name: "Mari Wren",
        pledged: "$40",
        date: "2 Sep",
        note: "Terms say thirty pits. The receipt covers mortar for about twelve. Asking for the rest of the receipts before this releases.",
      },
    ],
    moreDisputesNote: "2 more disputes, same objection",
    creatorResponse: {
      date: "3 Sep · 07:20",
      note: "The two receipts we hold cover the whole batch — the second was paid in cash at the potash market and we have the seller's book, photographed. Adding it now. The before image is pit 9, not pit 14. Reshooting today.",
    },
    money: [
      { label: "Milestone held", value: "$21,000" },
      { label: "Disputing donors' share", value: "$212" },
      { label: "Campaign escrow remaining", value: "$39,250" },
      { label: "Creator's release history", value: "1 of 1 clean" },
    ],
  },
  "d-1184": {
    id: "D-1184",
    slug: "d-1184",
    status: "Breaching",
    title: "Kiln lining, disputed by 38 donors",
    campaign: "Restoring the Cowdray kiln",
    creator: "Hollow Clay",
    creatorInitials: "HC",
    openedDate: "28 Aug 2026",
    decideWithin: "1 day over",
    disputingTotal: 38,
    totalCampaignDonors: 620,
    submission: {
      date: "26 Aug 2026",
      evidence: ["Kiln chamber, relined", "Firebox door, refitted"],
      note: "Chamber relined with new firebrick and the firebox door refitted. Ready for a test firing once approved.",
      termsNote:
        "The kiln chamber fully relined in refractory brick and the firebox door refitted, photographed before and after, with a fitter's invoice. Agreed at launch on 3 Jun 2026.",
    },
    donorComplaints: [
      {
        initials: "SK",
        name: "Sarah Kessler",
        pledged: "$80",
        date: "28 Aug",
        note: "No fitter's invoice attached, only the two photos. Terms specifically call for an invoice — this was already asked for once in the comments and never added.",
      },
      {
        initials: "DO",
        name: "David Okafor",
        pledged: "$40",
        date: "28 Aug",
        note: "The after photo shows the same crack visible in an earlier update, just from a different angle. Doesn't look relined to me.",
      },
    ],
    moreDisputesNote:
      "36 more disputes, same objection about the missing invoice",
    creatorResponse: {
      date: "29 Aug · 19:40",
      note: "The invoice is with our bookkeeper this week, will add by Friday. The crack in the photo is cosmetic, in the old brick we left in place around the door frame, not the relined section.",
    },
    money: [
      { label: "Milestone held", value: "$16,000" },
      { label: "Disputing donors' share", value: "$1,960" },
      { label: "Campaign escrow remaining", value: "$10,000" },
      { label: "Creator's release history", value: "1 of 2 clean" },
    ],
  },
  "d-1179": {
    id: "D-1179",
    slug: "d-1179",
    status: "Breaching",
    title: "Bindery, disputed by 61 donors",
    campaign: "A letterpress revival in the Welsh valleys",
    creator: "Bryn & Co.",
    creatorInitials: "BC",
    openedDate: "29 Aug 2026",
    decideWithin: "Today",
    disputingTotal: 61,
    totalCampaignDonors: 312,
    submission: {
      date: "27 Aug 2026",
      evidence: ["Bindery, new stitcher", "First bound proof"],
      note: "The new sewing stitcher is installed and commissioned. First hand-bound proof off it attached — full run of 40 starts next week.",
      termsNote:
        "Bindery equipment installed and commissioned, with one bound proof copy photographed and a supplier receipt. Agreed at launch on 12 May 2026.",
      document: "Delivery note · stitcher",
    },
    donorComplaints: [
      {
        initials: "TM",
        name: "Tunde Musa",
        pledged: "$250",
        date: "29 Aug",
        note: "Terms say a supplier receipt for the stitcher. What's attached is a delivery note with no price on it — that's not a receipt.",
      },
      {
        initials: "RA",
        name: "Ruth Adebayo",
        pledged: "$40",
        date: "29 Aug",
        note: "Agree with Tunde. Also this milestone was meant to include the guillotine, not just the stitcher — the update three weeks ago mentioned both.",
      },
    ],
    moreDisputesNote:
      "59 more disputes, split between the receipt and the guillotine question",
    creatorResponse: {
      date: "29 Aug · 22:10",
      note: "You're right that it's a delivery note — the invoice follows 30 days from the supplier, standard for them. The guillotine is stage 4, not this one; the update was about ordering it, not receiving it. Sorry that read as included here.",
    },
    money: [
      { label: "Milestone held", value: "$22,400" },
      { label: "Disputing donors' share", value: "$1,340" },
      { label: "Campaign escrow remaining", value: "$96,200" },
      { label: "Creator's release history", value: "1 of 4 clean" },
    ],
  },
  "d-1188": {
    id: "D-1188",
    slug: "d-1188",
    status: "Awaiting creator",
    title: "Tooling, disputed by 12 donors",
    campaign: "Hollow Clay opens its second kiln",
    creator: "Hollow Clay",
    creatorInitials: "HC",
    openedDate: "1 Sep 2026",
    decideWithin: "3 days",
    disputingTotal: 12,
    totalCampaignDonors: 340,
    submission: {
      date: "31 Aug 2026",
      evidence: ["Wheel, delivered", "Extruder, unboxed"],
      note: "New wheel and clay extruder delivered and unboxed. Second kiln build starts once the shed floor is reinforced, covered in stage two.",
      termsNote:
        "Wheel and extruder purchased and delivered on site, photographed still boxed with the courier's delivery note. Agreed at launch on 20 Jul 2026.",
    },
    donorComplaints: [
      {
        initials: "LH",
        name: "Lise Hansen",
        pledged: "$80",
        date: "1 Sep",
        note: "Both photos look staged in what could be any workshop — nothing in frame ties this to the Cowdray site specifically. Would like a wider shot showing the actual location.",
      },
      {
        initials: "PN",
        name: "Peter Nkemdirim",
        pledged: "$40",
        date: "1 Sep",
        note: "Same concern as Lise. This creator already has an open dispute on a different campaign — asking for more care here before this releases.",
      },
    ],
    moreDisputesNote:
      "10 more disputes, same request for a site-identifying photo",
    money: [
      { label: "Milestone held", value: "$9,600" },
      { label: "Disputing donors' share", value: "$680" },
      { label: "Campaign escrow remaining", value: "$0" },
      { label: "Creator's release history", value: "0 of 1 clean" },
    ],
  },
  "d-1192": {
    id: "D-1192",
    slug: "d-1192",
    status: "New",
    title: "Frames, disputed by 3 donors",
    campaign: "Rootwork Collective's winter beds",
    creator: "Rootwork Collective",
    creatorInitials: "RC",
    openedDate: "3 Sep 2026",
    decideWithin: "5 days",
    disputingTotal: 3,
    totalCampaignDonors: 180,
    submission: {
      date: "2 Sep 2026",
      evidence: ["Bed frames, built"],
      note: "Six raised bed frames built from reclaimed scaffold boards and set on the allotment. Soil delivery is stage three.",
      termsNote:
        "Six raised bed frames built and sited on the allotment, photographed in place, with a timber supplier note. Agreed at launch on 2 Aug 2026.",
    },
    donorComplaints: [
      {
        initials: "CW",
        name: "Chidinma Wright",
        pledged: "$250",
        date: "3 Sep",
        note: "Only one photo showing what looks like four frames, not six. Would like to see all six before this releases.",
      },
    ],
    money: [
      { label: "Milestone held", value: "$7,150" },
      { label: "Disputing donors' share", value: "$310" },
      { label: "Campaign escrow remaining", value: "$0" },
      { label: "Creator's release history", value: "0 of 3 clean" },
    ],
  },
  "d-1176": {
    id: "D-1176",
    slug: "d-1176",
    status: "Resolved",
    title: "Cataloguing, disputed by 1 donor",
    campaign: "Seed library for urban allotments",
    creator: "Rootwork Collective",
    creatorInitials: "RC",
    openedDate: "26 Aug 2026",
    decideWithin: "Closed",
    disputingTotal: 1,
    totalCampaignDonors: 140,
    submission: {
      date: "24 Aug 2026",
      evidence: ["Catalogue binder", "Seed shelving"],
      note: "Eighty varieties catalogued by sowing month with a paper index at the gate, backed by the same list photographed on shelving inside.",
      termsNote:
        "A seed catalogue covering at least seventy varieties, indexed and photographed both in the field register and on storage shelving. Agreed at launch on 10 Jul 2026.",
    },
    donorComplaints: [
      {
        initials: "SK",
        name: "Sarah Kessler",
        pledged: "$40",
        date: "26 Aug",
        note: "Counted the shelving photo myself and got sixty-two varieties, not eighty. Asking for the full list before this releases.",
      },
    ],
    creatorResponse: {
      date: "26 Aug · 15:05",
      note: "You're right that the shelf only shows sixty-two — the rest are in a second cupboard, out of frame. Adding a photo of the full set and the paper index today.",
    },
    money: [
      { label: "Milestone held", value: "$5,000" },
      { label: "Disputing donors' share", value: "$40" },
      { label: "Campaign escrow remaining", value: "$0" },
      { label: "Creator's release history", value: "1 of 3 clean" },
    ],
    resolution: {
      decision: "Released to creator",
      decidedBy: "Ruth Ade",
      decidedDate: "27 Aug 2026",
      reason:
        "Full catalogue and second-cupboard photo added within a day, count matches the terms. Dispute closed as unfounded.",
    },
  },
};

export function disputeDecisionOptionsFor(detail: DisputeCaseDetail) {
  const amount = detail.money[0]?.value ?? "The milestone amount";
  return [
    {
      label: "Request more evidence",
      description:
        "Creator gets 5 more days. Escrow stays held. Donors are told what was asked for.",
    },
    {
      label: "Release to creator",
      description: `${amount} moves to ${detail.creator}. The dispute closes as unfounded.`,
    },
    {
      label: "Refund this milestone",
      description: `${amount} returns to all donors pro rata. The campaign is paused for review.`,
    },
  ];
}

export interface ReleaseRow {
  id: string;
  milestone: string;
  campaign: string;
  creator: string;
  amount: string;
  windowClosed: string;
  disputes: number;
  state: "clear" | "blocked" | "stale-kyc" | "held";
  note?: string;
}

export const releaseAllSummary = {
  count: 9,
  amount: "$196,400",
  note: "identity checks current, payout accounts verified",
};

export const releases: ReleaseRow[] = [
  {
    id: "rel-1",
    milestone: "03 · Distribution",
    campaign: "Seed library for urban allotments",
    creator: "Rootwork Collective",
    amount: "$4,800",
    windowClosed: "19 hours ago",
    disputes: 0,
    state: "clear",
  },
  {
    id: "rel-2",
    milestone: "02 · First run",
    campaign: "A letterpress revival in the Welsh valleys",
    creator: "Bryn & Co.",
    amount: "$18,000",
    windowClosed: "1 day ago",
    disputes: 0,
    state: "clear",
  },
  {
    id: "rel-3",
    milestone: "01 · Tooling",
    campaign: "Hollow Clay opens its second kiln",
    creator: "Hollow Clay",
    amount: "$9,600",
    windowClosed: "2 days ago",
    disputes: 12,
    state: "blocked",
  },
  {
    id: "rel-4",
    milestone: "02 · Grinding",
    campaign: "Kestrel Forge kitchen knives",
    creator: "Kestrel Forge",
    amount: "$12,300",
    windowClosed: "3 hours ago",
    disputes: 0,
    state: "stale-kyc",
  },
  {
    id: "rel-5",
    milestone: "01 · Soil",
    campaign: "Rootwork Collective's winter beds",
    creator: "Rootwork Collective",
    amount: "$3,400",
    windowClosed: "4 days ago",
    disputes: 0,
    state: "held",
    note: "Held by Ruth",
  },
];

export interface IdentityRow {
  id: string;
  creator: string;
  structure: string;
  country: string;
  documents: string;
  submitted: string;
  blocking: string;
  status: "Incomplete" | "Ready" | "Resubmitted";
}

export const identityQueue: IdentityRow[] = [
  {
    id: "kestrel-forge",
    creator: "Kestrel Forge",
    structure: "Sole trader · J. Kestrel",
    country: "United Kingdom",
    documents: "2 of 3",
    submitted: "2 days ago",
    blocking: "$12,300",
    status: "Incomplete",
  },
  {
    id: "ferrous-press",
    creator: "Ferrous Press",
    structure: "Ltd · two directors",
    country: "Ireland",
    documents: "3 of 3",
    submitted: "1 day ago",
    blocking: "Campaign draft",
    status: "Ready",
  },
  {
    id: "salt-marsh-weavers",
    creator: "Salt Marsh Weavers",
    structure: "Co-operative",
    country: "Kenya",
    documents: "3 of 3",
    submitted: "6 hours ago",
    blocking: "Campaign draft",
    status: "Resubmitted",
  },
  {
    id: "ninefold-bindery",
    creator: "Ninefold Bindery",
    structure: "Sole trader",
    country: "Nigeria",
    documents: "1 of 3",
    submitted: "5 hours ago",
    blocking: "Campaign draft",
    status: "Incomplete",
  },
];

export const identityDocuments = {
  creator: "Kestrel Forge",
  documentsCount: "2 of 3",
  items: [
    { label: "Photo ID", meta: "Passport · expires 2031", submitted: true },
    {
      label: "Address proof",
      meta: "Utility bill · Jul 2026",
      submitted: true,
    },
    {
      label: "Bank statement",
      meta: "Needed to match the payout account",
      submitted: false,
    },
  ],
  checks: [
    { label: "Sanctions list · clear", variant: "neutral" as const },
    { label: "Document forgery · clear", variant: "neutral" as const },
    { label: "Name match · clear", variant: "neutral" as const },
    { label: "Payout name mismatch", variant: "warning" as const },
  ],
};

export const identityDecisionOptions = [
  {
    label: "Request the bank statement",
    description: "Creator has 14 days. The blocked $12,300 release stays held.",
  },
  {
    label: "Verify creator",
    description: "Clears the payout hold and lets the campaign publish.",
  },
  {
    label: "Reject",
    description:
      "Held funds are refunded to donors. The creator can appeal once.",
  },
];

export const refundSummary = {
  totalAmount: "$47,200",
  totalDonors: 312,
  batchReady: { count: 2, amount: "$31,200", donors: 271 },
};

export interface RefundBatch {
  id: string;
  campaign: string;
  reason: string;
  amount: string;
  donors: number;
  status: "Queued" | "3 failed" | "Settled";
  settledDate?: string;
}

export const refundBatches: RefundBatch[] = [
  {
    id: "R-0412",
    campaign: "Restoring the Cowdray kiln",
    reason: "Milestone failed",
    amount: "$16,000",
    donors: 41,
    status: "Queued",
  },
  {
    id: "R-0413",
    campaign: "Fast cash flip fund",
    reason: "Campaign taken down",
    amount: "$15,200",
    donors: 230,
    status: "Queued",
  },
  {
    id: "R-0410",
    campaign: "Tidewater oyster beds",
    reason: "Goal not met",
    amount: "$16,000",
    donors: 41,
    status: "3 failed",
  },
  {
    id: "R-0409",
    campaign: "Blackthorn cider press",
    reason: "Creator withdrew",
    amount: "$8,400",
    donors: 96,
    status: "Settled",
    settledDate: "28 Aug 2026",
  },
];

export interface FailedRefund {
  id: string;
  donor: string;
  card: string;
  amount: string;
  reason: string;
  action: string;
}

export const failedRefunds: FailedRefund[] = [
  {
    id: "fr-1",
    donor: "Mari Wren",
    card: "Visa · 4021",
    amount: "$400",
    reason: "Card expired",
    action: "Request new card",
  },
  {
    id: "fr-2",
    donor: "Peter Nkemdirim",
    card: "Mastercard · 7719",
    amount: "$540",
    reason: "Account closed",
    action: "Pay by transfer",
  },
  {
    id: "fr-3",
    donor: "Lise Hansen",
    card: "Visa · 1180",
    amount: "$300",
    reason: "Issuer declined",
    action: "Retry",
  },
];

export interface ModerationCampaign {
  id: string;
  campaign: string;
  campaignMeta: string;
  topReason: string;
  reports: number;
  raised: string;
  oldest: string;
  status: "Under review" | "Triage";
  donors?: number;
  description?: string;
  reasonBreakdown?: { reason: string; count: number; pct: number }[];
}

export const moderationQueue: ModerationCampaign[] = [
  {
    id: "fast-cash-flip-fund",
    campaign: "Fast cash flip fund",
    campaignMeta: "Unverified creator · no milestones defined",
    topReason: "Not a real project",
    reports: 11,
    raised: "$15,200",
    oldest: "8 hours",
    status: "Under review",
    donors: 230,
    description:
      'Listed as "Craft & material". Copy promises a 40% return in ninety days. No milestone breakdown, no location, creator registered 3 Sep 2026 and unverified.',
    reasonBreakdown: [
      { reason: "Not a real project", count: 7, pct: 64 },
      { reason: "Financial promise", count: 3, pct: 27 },
      { reason: "Stolen imagery", count: 1, pct: 9 },
    ],
  },
  {
    id: "hollow-clay-second-kiln",
    campaign: "Hollow Clay opens its second kiln",
    campaignMeta: "Verified creator · 4 milestones",
    topReason: "Misleading photos",
    reports: 3,
    raised: "$26,800",
    oldest: "2 days",
    status: "Triage",
  },
];

export const moderationDecisionOptions = [
  {
    label: "Take down and refund",
    description:
      "Campaign is delisted. $15,200 returns to 230 donors. Creator is barred from publishing.",
  },
  {
    label: "Pause and warn the creator",
    description:
      "No new pledges for 7 days. Escrow holds. Creator must fix the listed breaches.",
  },
  {
    label: "Dismiss the reports",
    description: "Campaign stays live. Reporters are told no breach was found.",
  },
];

export const moderationPolicies = [
  "3.1 · Financial return promised",
  "3.4 · No defined milestones",
  "5.2 · Imagery not the creator's own",
];

export const escrowTotals = {
  totalHeld: "$4,182,400",
  bankBalance: "$4,182,400",
  difference: "$0",
  reconciledAt: "Reconciled 3 Sep 2026 · 06:00 WAT",
};

export const escrowByState = [
  {
    label: "Live, on schedule",
    value: "$3,614,200",
    pct: 86,
    color: "accent" as const,
  },
  {
    label: "Awaiting release",
    value: "$284,600",
    pct: 7,
    color: "primary" as const,
  },
  {
    label: "Frozen by dispute",
    value: "$96,400",
    pct: 2.3,
    color: "destructive" as const,
  },
  {
    label: "Queued for refund",
    value: "$47,200",
    pct: 1.1,
    color: "warning" as const,
  },
  {
    label: "Overdue campaigns",
    value: "$140,000",
    pct: 3.3,
    color: "warning" as const,
  },
];

export const escrowByCurrency = [
  { currency: "GBP", held: "£1,482,000", usd: "$1,867,300", campaigns: 88 },
  { currency: "USD", held: "$1,204,600", usd: "$1,204,600", campaigns: 61 },
  { currency: "EUR", held: "€642,800", usd: "$698,900", campaigns: 39 },
  { currency: "NGN", held: "₦612,400,000", usd: "$411,600", campaigns: 26 },
];

export const escrowLargestHoldings = [
  {
    campaign: "Ridgeway signal box restoration",
    creator: "Ridgeway Trust",
    held: "$182,400",
    stagesLeft: "4 of 6",
    state: "live" as const,
  },
  {
    campaign: "A letterpress revival in the Welsh valleys",
    creator: "Bryn & Co.",
    held: "$96,200",
    stagesLeft: "2 of 4",
    state: "live" as const,
  },
  {
    campaign: "Restoring the Cowdray kiln",
    creator: "Hollow Clay",
    held: "$42,000",
    stagesLeft: "2 of 3",
    state: "disputed" as const,
  },
  {
    campaign: "Rebuilding the indigo dye pits at Kofar Mata",
    creator: "Hausa Indigo",
    held: "$39,250",
    stagesLeft: "3 of 4",
    state: "live" as const,
  },
];

export const userProfile = {
  initials: "AB",
  name: "Amina Bala",
  email: "amina@kanoindigo.org",
  userId: "41982",
  joined: "4 Jul 2026",
  role: "Donor",
  verified: true,
  figures: [
    { label: "In escrow", value: "$1,240" },
    { label: "Lifetime pledged", value: "$2,250" },
    { label: "Refunded", value: "$150" },
    { label: "Disputes raised", value: "1" },
  ],
  pledges: [
    {
      campaign: "Rebuilding the indigo dye pits at Kofar Mata",
      pledged: "$250",
      inEscrow: "$70",
      date: "2 Sep 2026",
      status: "live" as const,
    },
    {
      campaign: "Seed library for urban allotments",
      pledged: "$120",
      inEscrow: "$60",
      date: "18 Aug 2026",
      status: "funded" as const,
    },
    {
      campaign: "Restoring the Cowdray kiln",
      pledged: "$150",
      inEscrow: "$0",
      date: "11 Jul 2026",
      status: "refunded" as const,
    },
  ],
  account: [
    { label: "Country", value: "Nigeria · NGN" },
    { label: "Two-factor", value: "On" },
    { label: "Sessions", value: "3 devices" },
    { label: "Last sign-in", value: "Today · 09:12" },
  ],
};

export type AuditActionType =
  | "Release"
  | "Refund"
  | "Identity"
  | "Takedown"
  | "Hold"
  | "Account";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: AuditActionType;
  target: string;
  reason: string;
  amount: string;
  source: string;
  filterTag:
    | "releases"
    | "refunds"
    | "takedowns"
    | "identity"
    | "account-changes";
}

export const auditLog: AuditEntry[] = [
  {
    id: "a1",
    timestamp: "3 Sep · 09:12:04",
    actor: "Tomi Musa",
    action: "Release",
    target: "Seed library for urban allotments · milestone 03",
    reason: "Window closed with no disputes. Evidence complete against terms.",
    amount: "$4,800",
    source: "102.89.4.17",
    filterTag: "releases",
  },
  {
    id: "a2",
    timestamp: "3 Sep · 08:47:31",
    actor: "Ruth Ade",
    action: "Refund",
    target: "Restoring the Cowdray kiln · batch R-0412",
    reason:
      "Dispute D-1184 upheld. Kiln lining not evidenced after two requests.",
    amount: "$16,000",
    source: "102.89.4.22",
    filterTag: "refunds",
  },
  {
    id: "a3",
    timestamp: "2 Sep · 17:30:12",
    actor: "Tomi Musa",
    action: "Identity",
    target: "Rootwork Collective · verified",
    reason: "Three documents on file, all checks clear, payout name matches.",
    amount: "—",
    source: "102.89.4.17",
    filterTag: "identity",
  },
  {
    id: "a4",
    timestamp: "2 Sep · 14:05:58",
    actor: "Ruth Ade",
    action: "Takedown",
    target: "Fast cash flip fund · delisted",
    reason:
      "Policy 3.1, financial return promised. 11 reports. Second review pending.",
    amount: "$15,200",
    source: "102.89.4.22",
    filterTag: "takedowns",
  },
  {
    id: "a5",
    timestamp: "2 Sep · 11:22:07",
    actor: "System",
    action: "Hold",
    target: "Kestrel Forge kitchen knives · milestone 02",
    reason: "Automatic hold. Identity documents older than 12 months.",
    amount: "$12,300",
    source: "internal",
    filterTag: "identity",
  },
  {
    id: "a6",
    timestamp: "1 Sep · 16:40:19",
    actor: "Ruth Ade",
    action: "Account",
    target: "User 39104 · two-factor reset",
    reason: "Identity confirmed by video call. Recovery codes reissued.",
    amount: "—",
    source: "102.89.4.22",
    filterTag: "account-changes",
  },
  {
    id: "a7",
    timestamp: "1 Sep · 09:03:44",
    actor: "System",
    action: "Release",
    target: "Ridgeway signal box restoration · milestone 02",
    reason: "Automatic release. 72-hour window closed with no disputes.",
    amount: "$38,000",
    source: "internal",
    filterTag: "releases",
  },
];

export const mobileTriage = {
  breachingBanner: {
    title: "2 disputes past deadline",
    meta: "$38,400 frozen",
  },
  counts: [
    { label: "Disputes", value: "7" },
    { label: "Releases", value: "12" },
    { label: "Identity", value: "4" },
    { label: "Refunds", value: "3" },
  ],
  needsYouFirst: [
    {
      id: "D-1184",
      slug: "d-1184",
      badge: "1 day over",
      title: "Restoring the Cowdray kiln · kiln lining",
      meta: "$16,000 held · 38 donors disputing",
    },
    {
      id: "D-1179",
      slug: "d-1179",
      badge: "Due today",
      title: "A letterpress revival in the Welsh valleys · bindery",
      meta: "$22,400 held · 61 donors disputing",
    },
  ],
};

export const creatorCampaign = {
  title: "Rebuilding the indigo dye pits at Kofar Mata",
  shortTitle: "Kofar Mata pits",
  figures: [
    { label: "Raised", value: "$48,250", meta: "80% of $60,000" },
    { label: "Drawn down", value: "$9,000", meta: "1 milestone released" },
    { label: "Held in escrow", value: "$39,250", meta: "3 stages remaining" },
    { label: "Donors", value: "631", meta: "12 days left" },
  ],
};

export interface LadderStage {
  number: string;
  label: string;
  amount: string;
  meta: string;
  badge: string;
  badgeVariant: "funded" | "neutral" | "outline";
  highlighted?: boolean;
}

export const escrowLadder: LadderStage[] = [
  {
    number: "01",
    label: "Survey",
    amount: "$9,000",
    meta: "Released 22 Jul 2026 · paid to Zenith ending 8841",
    badge: "Released",
    badgeVariant: "funded",
  },
  {
    number: "02",
    label: "Pit relining",
    amount: "$21,000",
    meta: "Due 18 Sep 2026",
    badge: "Draft",
    badgeVariant: "neutral",
    highlighted: true,
  },
  {
    number: "03",
    label: "North shed roof",
    amount: "$18,000",
    meta: "Unlocks when stage 02 releases",
    badge: "Pending",
    badgeVariant: "outline",
  },
  {
    number: "04",
    label: "Reopening",
    amount: "$12,000",
    meta: "Unlocks when stage 03 releases",
    badge: "Pending",
    badgeVariant: "outline",
  },
];

export const recentDonors = [
  {
    initials: "AB",
    name: "Amina Bala",
    amount: "$250",
    meta: "2 Sep 2026 · Kano, Nigeria",
    tier: "Tier 3",
  },
  {
    initials: "JO",
    name: "Joseph Okonkwo",
    amount: "$80",
    meta: "2 Sep 2026 · Lagos, Nigeria",
    tier: "Tier 2",
  },
  {
    initials: "MW",
    name: "Mari Wren",
    amount: "$40",
    meta: "1 Sep 2026 · Sheffield, UK",
    tier: "Tier 1",
  },
];

export const stageDraft = {
  stageNumber: "02",
  totalStages: "04",
  label: "Pit relining",
  amount: "$21,000",
  dueLabel: "Due 18 Sep 2026 · 15 days from now",
  note: "Thirty-one pits relined with laterite and potash mortar. The two shown are pits 14 and 15, cured eleven days. Remaining forty-seven follow in stage three once the roof is up.",
  requirements: [
    { label: "Thirty pits relined — 31 done", met: true },
    { label: "Materials receipt attached", met: true },
    { label: "Before photographs — none attached yet", met: false },
  ],
  termsNote:
    "Thirty pits relined and cured, photographed before and after, with a materials receipt. Agreed at launch on 4 Jul 2026.",
};

export const stageReview = {
  submittedNote: "Submitted 1 Sep 2026 · nothing to do until the window closes",
  disputesNote: "631 donors notified · 0 disputes raised",
  elapsedPct: 81,
  releasesTo: "$21,000",
  platformFee: "−$1,050",
  landsIn: "$19,950",
  payoutNote: "Paid to Zenith ending 8841, two working days after release.",
};

export const stageStates = [
  {
    stageNumber: "01",
    label: "Survey",
    badge: "Released",
    badgeVariant: "funded" as const,
    meta: "Approved 22 Jul 2026 · no disputes raised",
    amountLabel: "Paid to you",
    amount: "$8,550",
  },
  {
    stageNumber: "02",
    label: "Pit relining",
    badge: "Disputed",
    badgeVariant: "destructive" as const,
    meta: "4 of 631 donors disputed · a moderator responds within 5 days",
    action: "Respond to dispute",
  },
  {
    stageNumber: "03",
    label: "North shed roof",
    badge: "Locked",
    badgeVariant: "outline" as const,
    meta: "Opens when stage 02 releases. Evidence cannot be added yet.",
    amountLabel: "Releases on approval",
    amount: "$18,000",
    muted: true,
  },
  {
    stageNumber: "02",
    label: "Pit relining",
    badge: "Overdue",
    badgeVariant: "warning" as const,
    meta: "Due 18 Aug 2026 · 16 days late. Donors can vote to refund after 30 days.",
    actions: ["Post an update", "Submit for review"],
  },
];

export interface PayoutEntry {
  id: string;
  stage: string;
  releasedDate: string;
  gross: string;
  fee: string;
  net: string;
  account: string;
  status: "Paid" | "Pending";
}

export const payoutHistory: PayoutEntry[] = [
  {
    id: "payout-01",
    stage: "01 · Survey",
    releasedDate: "22 Jul 2026",
    gross: "$9,000",
    fee: "−$450",
    net: "$8,550",
    account: "Zenith ending 8841",
    status: "Paid",
  },
];

export const nextPayout = {
  stage: "02 · Pit relining",
  gross: "$21,000",
  fee: "−$1,050",
  net: "$19,950",
  note: "Lands two working days after the dispute window closes with no objection.",
};

export interface DonorEntry {
  initials: string;
  name: string;
  amount: string;
  meta: string;
  tier: string;
}

export const allDonors: DonorEntry[] = [
  {
    initials: "AB",
    name: "Amina Bala",
    amount: "$250",
    meta: "2 Sep 2026 · Kano, Nigeria",
    tier: "Tier 3",
  },
  {
    initials: "JO",
    name: "Joseph Okonkwo",
    amount: "$80",
    meta: "2 Sep 2026 · Lagos, Nigeria",
    tier: "Tier 2",
  },
  {
    initials: "MW",
    name: "Mari Wren",
    amount: "$40",
    meta: "1 Sep 2026 · Sheffield, UK",
    tier: "Tier 1",
  },
  {
    initials: "PN",
    name: "Peter Nkemdirim",
    amount: "$40",
    meta: "1 Sep 2026 · Abuja, Nigeria",
    tier: "Tier 1",
  },
  {
    initials: "LH",
    name: "Lise Hansen",
    amount: "$80",
    meta: "31 Aug 2026 · Bergen, Norway",
    tier: "Tier 2",
  },
  {
    initials: "TM",
    name: "Tunde Musa",
    amount: "$250",
    meta: "29 Aug 2026 · Kano, Nigeria",
    tier: "Tier 3",
  },
  {
    initials: "RA",
    name: "Ruth Adebayo",
    amount: "$40",
    meta: "28 Aug 2026 · Ibadan, Nigeria",
    tier: "Tier 1",
  },
  {
    initials: "SK",
    name: "Sarah Kessler",
    amount: "$80",
    meta: "27 Aug 2026 · Leeds, UK",
    tier: "Tier 2",
  },
  {
    initials: "DO",
    name: "David Okafor",
    amount: "$40",
    meta: "25 Aug 2026 · Enugu, Nigeria",
    tier: "Tier 1",
  },
  {
    initials: "CW",
    name: "Chidinma Wright",
    amount: "$250",
    meta: "22 Aug 2026 · Kano, Nigeria",
    tier: "Tier 3",
  },
];

export const donorTotals = { count: 631, moreCount: 621 };

export interface CampaignUpdate {
  id: string;
  title: string;
  date: string;
  body: string;
}

export const campaignUpdates: CampaignUpdate[] = [
  {
    id: "update-3",
    title: "Pit relining evidence submitted",
    date: "1 Sep 2026",
    body: "Thirty-one of thirty pits are relined with laterite and potash mortar. Photos and the materials receipt are up for review — the dispute window closes in 72 hours.",
  },
  {
    id: "update-2",
    title: "Survey complete, first payout landed",
    date: "23 Jul 2026",
    body: "All sixty-two pits surveyed and mapped. The stage released with no disputes and $8,550 landed in our account two days later. Pit relining starts next week.",
  },
  {
    id: "update-1",
    title: "Thank you for getting us started",
    date: "5 Jul 2026",
    body: "Four days in and we're already at 12% of goal. The dyers have started clearing the first six pits ahead of the survey. More photos soon.",
  },
];

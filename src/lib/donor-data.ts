import type { CampaignStatus, Milestone } from "@/lib/types";

export interface ReviewQueueItem {
  id: string;
  campaign: string;
  milestone: string;
  amount: string;
  yourShare: string;
  windowLabel: string;
  windowPct: number;
  urgent: boolean;
  evidenceNote: string;
  releasesFrom: string;
  disputedOf: string;
  termsNote: string;
  creatorName: string;
  submittedDate: string;
}

export interface Pledge {
  campaign: string;
  creator: string;
  location: string;
  pledgedLabel: string;
  status: CampaignStatus;
  milestones: Milestone[];
  pledgedAmount: string;
  inEscrow: string;
  released: string;
  stageNote: string;
}

export interface LiveNowCampaign {
  category: string;
  title: string;
  raised: number;
  goal: number;
}

export const reviewQueue: ReviewQueueItem[] = [
  {
    id: "kofar-mata-m2",
    campaign: "Rebuilding the indigo dye pits at Kofar Mata",
    milestone: "Milestone 2 · Pit relining",
    amount: "$21,000",
    yourShare: "$180",
    windowLabel: "Dispute window closes in 14 hours",
    windowPct: 81,
    urgent: true,
    evidenceNote:
      "Thirty-one pits relined with laterite and potash mortar. The two shown are pits 14 and 15, cured eleven days. Remaining forty-seven follow in stage three once the roof is up.",
    releasesFrom: "$21,000",
    disputedOf: "0 of 631",
    termsNote:
      "Thirty pits relined and cured, photographed before and after, with a materials receipt. Agreed at launch on 4 Jul 2026.",
    creatorName: "Hausa Indigo Collective",
    submittedDate: "1 Sep 2026",
  },
  {
    id: "seed-library-m3",
    campaign: "Seed library for urban allotments",
    milestone: "Milestone 3 · Distribution",
    amount: "$4,800",
    yourShare: "$60",
    windowLabel: "Dispute window closes in 2 days",
    windowPct: 34,
    urgent: false,
    evidenceNote:
      "A weekly borrowing table running at the site gates through the spring sowing window, 80 varieties on offer.",
    releasesFrom: "$4,800",
    disputedOf: "0 of 140",
    termsNote:
      "A standing borrowing table run weekly through the sowing window, with a register of what was lent and returned.",
    creatorName: "Rootwork Collective",
    submittedDate: "1 Sep 2026",
  },
];

export const pledges: Pledge[] = [
  {
    campaign: "Rebuilding the indigo dye pits at Kofar Mata",
    creator: "Hausa Indigo Collective",
    location: "Kano, Nigeria",
    pledgedLabel: "Pledged $250 · stage 2 of 4",
    status: "live",
    pledgedAmount: "$250",
    inEscrow: "$70",
    released: "$180",
    stageNote: "Stage 2 of 4 · pit relining in review",
    milestones: [
      {
        label: "Survey",
        state: "released",
        statusLabel: "Released",
        amount: "$9,000",
        barState: "released",
      },
      {
        label: "Pit relining",
        state: "active",
        statusLabel: "In review",
        amount: "$21,000",
        barState: "pending",
      },
      {
        label: "North shed roof",
        state: "pending",
        statusLabel: "Pending",
        amount: "$18,000",
        barState: "pending",
      },
      {
        label: "Reopening",
        state: "pending",
        statusLabel: "Pending",
        amount: "$12,000",
      },
    ],
  },
  {
    campaign: "Seed library for urban allotments",
    creator: "Rootwork Collective",
    location: "Sheffield, UK",
    pledgedLabel: "Pledged $120 · stage 3 of 3",
    status: "funded",
    pledgedAmount: "$120",
    inEscrow: "$60",
    released: "$60",
    stageNote: "Stage 3 of 3 · distribution in review",
    milestones: [
      {
        label: "Seed intake",
        state: "released",
        statusLabel: "Released",
        amount: "$3,200",
        barState: "released",
      },
      {
        label: "Cataloguing",
        state: "released",
        statusLabel: "Released",
        amount: "$5,000",
        barState: "released",
      },
      {
        label: "Distribution",
        state: "active",
        statusLabel: "In review",
        amount: "$4,800",
      },
    ],
  },
  {
    campaign: "Restoring the Cowdray kiln",
    creator: "Hollow Clay",
    location: "Midhurst, UK",
    pledgedLabel: "Pledged $150 · refunded 12 Aug 2026",
    status: "refunded",
    pledgedAmount: "$150",
    inEscrow: "$0",
    released: "$0",
    stageNote: "Stage 2 disputed · refunded 12 Aug 2026",
    milestones: [
      {
        label: "Survey",
        state: "released",
        statusLabel: "Released",
        amount: "$4,000",
        barState: "released",
      },
      {
        label: "Kiln lining",
        state: "disputed",
        statusLabel: "Disputed",
        amount: "$16,000",
      },
      {
        label: "First firing",
        state: "pending",
        statusLabel: "Pending",
        amount: "$10,000",
      },
    ],
  },
];

export const liveNow: LiveNowCampaign[] = [
  {
    category: "Type & print",
    title: "A letterpress revival in the Welsh valleys",
    raised: 12400,
    goal: 30000,
  },
  {
    category: "Clay & kiln",
    title: "Hollow Clay opens its second kiln",
    raised: 26800,
    goal: 40000,
  },
  {
    category: "Growing",
    title: "Rootwork Collective's winter beds",
    raised: 7150,
    goal: 18000,
  },
];

export const donorFigures = {
  inEscrow: { value: "$1,240", meta: "Across 4 campaigns" },
  released: { value: "$860", meta: "6 milestones approved" },
  refunded: { value: "$150", meta: "1 failed stage" },
};

export interface FollowedCreator {
  id: string;
  initials: string;
  name: string;
  location: string;
  campaignsCount: number;
  latestTitle: string;
  latestStatus: CampaignStatus;
}

export const followedCreators: FollowedCreator[] = [
  {
    id: "hausa-indigo",
    initials: "HI",
    name: "Hausa Indigo Collective",
    location: "Kano, Nigeria",
    campaignsCount: 1,
    latestTitle: "Rebuilding the indigo dye pits at Kofar Mata",
    latestStatus: "live",
  },
  {
    id: "rootwork",
    initials: "RC",
    name: "Rootwork Collective",
    location: "Leeds, UK",
    campaignsCount: 2,
    latestTitle: "Rootwork Collective's winter beds",
    latestStatus: "live",
  },
  {
    id: "bryn-co",
    initials: "BC",
    name: "Bryn & Co.",
    location: "Powys, Wales",
    campaignsCount: 1,
    latestTitle: "A letterpress revival in the Welsh valleys",
    latestStatus: "live",
  },
  {
    id: "ridgeway-trust",
    initials: "RT",
    name: "Ridgeway Trust",
    location: "Oxfordshire, UK",
    campaignsCount: 1,
    latestTitle: "Ridgeway signal box restoration",
    latestStatus: "expiring",
  },
];

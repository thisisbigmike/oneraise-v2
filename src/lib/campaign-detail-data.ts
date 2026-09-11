import type { CampaignStatus } from "@/lib/types";

export interface DetailMilestone {
  stageNumber: string;
  label: string;
  amount: string;
  description: string;
  state: "released" | "submitted" | "current" | "pending";
  badgeLabel: string;
  meta: string;
}

export interface Update {
  date: string;
  title: string;
  body: string;
}

export interface Backer {
  initials: string;
  name: string;
  tierLabel: string;
  amount: string;
}

export interface Tier {
  amount: string;
  label: string;
  meta: string;
  selected?: boolean;
}

export interface CampaignDetail {
  slug: string;
  category: string;
  location: string;
  title: string;
  subtitleDesktop: string;
  subtitleMobile: string;
  status: CampaignStatus;
  creator: {
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
  milestoneSummary: string;
  milestones: DetailMilestone[];
  story: string[];
  updates: Update[];
  backers: Backer[];
  tiers: Tier[];
  heroPlaceholder: string;
}

export const campaignDetails: Record<string, CampaignDetail> = {
  "kofar-mata-indigo-dye-pits": {
    slug: "kofar-mata-indigo-dye-pits",
    category: "Craft & material",
    location: "Kano, Nigeria",
    title: "Rebuilding the indigo dye pits at Kofar Mata",
    subtitleDesktop:
      "Twelve of the ninety pits at Kano's dye yard still hold indigo. This raise relines the rest, stage by stage, and puts a roof over the north shed before the rains.",
    subtitleMobile: "Twelve of the ninety pits at Kano's dye yard still hold indigo. This raise relines the rest, stage by stage.",
    status: "live",
    creator: {
      initials: "HI",
      name: "Hausa Indigo Collective",
      location: "Kano, Nigeria",
      meta: "2 campaigns funded · 4 milestones released",
      verified: true,
    },
    figures: [
      { label: "Released to creator", value: "$24,000", meta: "Stages 01 and 02, signed off" },
      { label: "Held in escrow", value: "$14,400", meta: "Releases only on approval" },
      { label: "Next release", value: "$16,000", meta: "Dye house roof · in review" },
    ],
    raised: "$38,400",
    goalLabel: "74% of $52,000",
    fillPct: 74,
    backerCount: 487,
    daysLeft: 19,
    milestoneSummary: "2 of 4 released · $24,000 of $52,000",
    milestones: [
      {
        stageNumber: "01",
        label: "Pit relining",
        amount: "$11,000",
        description: "Twelve pits relined with clay and ash mortar, water-tested and logged.",
        state: "released",
        badgeLabel: "Released",
        meta: "Released 22 Jul",
      },
      {
        stageNumber: "02",
        label: "Indigo harvest",
        amount: "$13,000",
        description: "Two tonnes of leaf bought from four growers in Dawakin Kudu.",
        state: "released",
        badgeLabel: "Released",
        meta: "Released 6 Aug",
      },
      {
        stageNumber: "03",
        label: "Dye house roof",
        amount: "$16,000",
        description: "Sixteen timber trusses and zinc sheeting over the north shed.",
        state: "submitted",
        badgeLabel: "Submitted",
        meta: "Evidence filed 14 Aug · 61h to dispute",
      },
      {
        stageNumber: "04",
        label: "Apprentice intake",
        amount: "$12,000",
        description: "Six apprentices paid a stipend through the first dyeing season.",
        state: "pending",
        badgeLabel: "Pending",
        meta: "Opens after stage 03",
      },
    ],
    story: [
      "Kano's dye yard at Kofar Mata has been worked since 1498. Ninety pits were cut into the laterite; twelve still hold indigo. The rest silted up after their clay linings failed, and the men who know how to reline them are down to four.",
      "The raise pays for the relining, the leaf, and a roof over the north shed so the pits can be worked through the rains. Each stage draws only its own budget. The next stage stays in escrow until the last one is signed off by three of the collective's elders and an independent quantity surveyor.",
      "Backers are charged when funding closes, and the money is held by a licensed trustee rather than by the collective. When a stage is submitted, backers see the evidence and have 72 hours to dispute. If a dispute stands, that stage is refunded instead of released.",
    ],
    updates: [
      {
        date: "14 Aug",
        title: "Roof trusses up",
        body: "Sixteen trusses seated over the north shed. Zinc sheeting arrives Monday. Evidence for stage 03 is filed and the dispute window is open.",
      },
      {
        date: "6 Aug",
        title: "Two tonnes of leaf, weighed and paid",
        body: "Bought from four growers in Dawakin Kudu. Weighbridge tickets and receipts attached to stage 02.",
      },
      {
        date: "22 Jul",
        title: "Twelve pits back in service",
        body: "Relining finished on pits 3 to 14. First indigo went into pit 7 on Thursday.",
      },
    ],
    backers: [
      { initials: "AB", name: "Amina Bello", tierLabel: "Hand-stamped adire wrapper", amount: "$250" },
      { initials: "KM", name: "Kwame Mensah", tierLabel: "One metre of pit-dyed cloth", amount: "$80" },
      { initials: "SM", name: "Sofia Marchetti", tierLabel: "Name cut into the lintel", amount: "$1,000" },
      { initials: "TA", name: "Tunde Adeyemi", tierLabel: "Indigo swatch, dyed in pit 7", amount: "$25" },
    ],
    tiers: [
      { amount: "$25", label: "Indigo swatch, dyed in pit 7", meta: "214 backers" },
      { amount: "$80", label: "One metre of pit-dyed cloth", meta: "143 backers", selected: true },
      { amount: "$250", label: "Hand-stamped adire wrapper", meta: "12 of 40 left" },
      { amount: "$1,000", label: "Your name cut into the dye house lintel", meta: "6 backers" },
    ],
    heroPlaceholder: "Dye-yard photograph · 16:10",
  },
  "welsh-letterpress-revival": {
    slug: "welsh-letterpress-revival",
    category: "Type & print",
    location: "Powys, Wales",
    title: "A letterpress revival in the Welsh valleys",
    subtitleDesktop:
      "A 1920s Vandercook and eleven cases of Welsh-cut type have sat idle in a Powys barn for a decade. This raise fits out a working bindery around them and puts the first run on the shelf.",
    subtitleMobile: "A 1920s Vandercook and eleven cases of Welsh-cut type have sat idle in a Powys barn for a decade.",
    status: "live",
    creator: {
      initials: "BC",
      name: "Bryn & Co.",
      location: "Powys, Wales",
      meta: "1 campaign funded · 2 milestones released",
      verified: true,
    },
    figures: [
      { label: "Released to creator", value: "$18,000", meta: "Stage 01, signed off" },
      { label: "Held in escrow", value: "$66,600", meta: "Releases only on approval" },
      { label: "Next release", value: "$18,000", meta: "First run · in progress" },
    ],
    raised: "$84,600",
    goalLabel: "71% of $120,000",
    fillPct: 71,
    backerCount: 312,
    daysLeft: 18,
    milestoneSummary: "1 of 4 released · $18,000 of $120,000",
    milestones: [
      {
        stageNumber: "01",
        label: "Tooling",
        amount: "$18,000",
        description: "Vandercook stripped, regreased and test-printed. Missing rollers recast.",
        state: "released",
        badgeLabel: "Released",
        meta: "Released 4 Aug",
      },
      {
        stageNumber: "02",
        label: "First run",
        amount: "$18,000",
        description: "The eleven cases of Welsh-cut type sorted, cleaned and cased for production.",
        state: "current",
        badgeLabel: "In progress",
        meta: "Due 20 Sep",
      },
      {
        stageNumber: "03",
        label: "Bindery",
        amount: "$22,400",
        description: "A sewing frame and board shear fitted out to finish what the press prints.",
        state: "pending",
        badgeLabel: "Pending",
        meta: "Opens after stage 02",
      },
      {
        stageNumber: "04",
        label: "Public workshop",
        amount: "$61,600",
        description: "The barn opened for six-week composing courses, twelve places per intake.",
        state: "pending",
        badgeLabel: "Pending",
        meta: "Opens after stage 03",
      },
    ],
    story: [
      "The press came out of a closed Cardiff print works in 2014 and has sat under a tarpaulin since. It still turns freely. The type — eleven cases of a Welsh-cut face nobody else runs — came with it, uncatalogued.",
      "This raise puts both back to work: the press tuned and printing, the type sorted and cased, and a proper bindery built around them so a finished, sewn book can leave the barn rather than just loose sheets.",
      "Stage four opens the barn itself, running short composing courses so the skill doesn't leave with whoever taught it last.",
    ],
    updates: [
      {
        date: "20 Aug",
        title: "Type cases sorted",
        body: "All eleven cases catalogued by point size. Two are missing their descenders — a type founder in Bristol is casting replacements.",
      },
      {
        date: "4 Aug",
        title: "The Vandercook runs",
        body: "First test sheet off the press in ten years. Impression is even across the bed once the packing was rebuilt.",
      },
    ],
    backers: [
      { initials: "RH", name: "Rhys Hughes", tierLabel: "Broadside, hand-pulled", amount: "$45" },
      { initials: "EW", name: "Eira Watkins", tierLabel: "Six-week composing course", amount: "$380" },
      { initials: "GT", name: "Gareth Tudor", tierLabel: "Letterpress card set", amount: "$28" },
    ],
    tiers: [
      { amount: "$28", label: "Letterpress card set, six designs", meta: "104 backers" },
      { amount: "$45", label: "Broadside, hand-pulled and numbered", meta: "88 backers", selected: true },
      { amount: "$120", label: "A5 chapbook, sewn in the bindery", meta: "51 backers" },
      { amount: "$380", label: "A place on the six-week composing course", meta: "9 of 12 left" },
    ],
    heroPlaceholder: "Letterpress workshop · 16:10",
  },
  "urban-allotment-seed-library": {
    slug: "urban-allotment-seed-library",
    category: "Growing",
    location: "Sheffield, UK",
    title: "Seed library for urban allotments",
    subtitleDesktop:
      "Sheffield's allotment waiting list runs to nine years. This raise builds a shared seed library so every plot holder starts a season without buying in from scratch.",
    subtitleMobile: "Sheffield's allotment waiting list runs nine years. This builds a shared seed library for every plot holder.",
    status: "live",
    creator: {
      initials: "RC",
      name: "Rootwork Collective",
      location: "Sheffield, UK",
      meta: "3 campaigns funded · 7 milestones released",
      verified: true,
    },
    figures: [
      { label: "Released to creator", value: "$13,800", meta: "Stages 01 and 02, signed off" },
      { label: "Held in escrow", value: "$5,100", meta: "Releases only on approval" },
      { label: "Next release", value: "$4,800", meta: "Distribution · in review" },
    ],
    raised: "$18,900",
    goalLabel: "79% of $24,000",
    fillPct: 79,
    backerCount: 140,
    daysLeft: 6,
    milestoneSummary: "2 of 3 released · $13,800 of $24,000",
    milestones: [
      {
        stageNumber: "01",
        label: "Seed intake",
        amount: "$3,200",
        description: "Cataloguing cabinets built and the first 80 varieties logged from plot-holder donations.",
        state: "released",
        badgeLabel: "Released",
        meta: "Released 2 Aug",
      },
      {
        stageNumber: "02",
        label: "Cataloguing",
        amount: "$5,000",
        description: "Every variety photographed, germination-tested and entered into the shared register.",
        state: "released",
        badgeLabel: "Released",
        meta: "Released 20 Aug",
      },
      {
        stageNumber: "03",
        label: "Distribution",
        amount: "$4,800",
        description: "A weekly borrowing table at the site gates through the spring sowing window.",
        state: "submitted",
        badgeLabel: "Submitted",
        meta: "Evidence filed 1 Sep · window open",
      },
    ],
    story: [
      "There are 34 allotment sites across Sheffield and one seed catalogue between them — whatever each plot holder happens to save. Varieties adapted to the city's clay and short season get lost when a plot changes hands.",
      "The library gives every site a cabinet, a register, and a standing invitation to borrow rather than buy. Three stages: build the cabinets, catalogue what's already being grown, then run distribution through the borrowing table each spring.",
    ],
    updates: [
      {
        date: "1 Sep",
        title: "Borrowing table opens Saturday",
        body: "First distribution day at the Manor Fields gate. 80 varieties on the table, register open for new entries.",
      },
      {
        date: "20 Aug",
        title: "Cataloguing complete",
        body: "All 80 varieties germination-tested. Register live and searchable by sowing month.",
      },
    ],
    backers: [
      { initials: "JP", name: "Jamila Priestley", tierLabel: "A season's borrowing card", amount: "$15" },
      { initials: "OW", name: "Owen Whitfield", tierLabel: "Cabinet sponsor plaque", amount: "$120" },
      { initials: "FN", name: "Fiona Ng", tierLabel: "Seed swap starter pack", amount: "$8" },
    ],
    tiers: [
      { amount: "$8", label: "Seed swap starter pack, five varieties", meta: "61 backers" },
      { amount: "$15", label: "A season's borrowing card", meta: "52 backers", selected: true },
      { amount: "$40", label: "Borrowing card plus a growing workshop", meta: "19 backers" },
      { amount: "$120", label: "Your name on a cabinet sponsor plaque", meta: "8 of 10 left" },
    ],
    heroPlaceholder: "Allotment seed library · 16:10",
  },
  "ridgeway-signal-box-restoration": {
    slug: "ridgeway-signal-box-restoration",
    category: "Restoration",
    location: "Oxfordshire, UK",
    title: "Ridgeway signal box restoration",
    subtitleDesktop:
      "The 1892 signal box at Ridgeway Halt has been derelict since the line closed in 1967. This raise restores the frame, the block instruments and the levers, stage by stage, back to working order.",
    subtitleMobile: "The 1892 signal box at Ridgeway Halt has been derelict since the line closed in 1967.",
    status: "expiring",
    creator: {
      initials: "RT",
      name: "Ridgeway Trust",
      location: "Oxfordshire, UK",
      meta: "4 campaigns funded · 11 milestones released",
      verified: true,
    },
    figures: [
      { label: "Released to creator", value: "$144,400", meta: "Stages 01 to 04, signed off" },
      { label: "Held in escrow", value: "$38,000", meta: "Releases only on approval" },
      { label: "Next release", value: "$38,000", meta: "Lever frame · in review" },
    ],
    raised: "$182,400",
    goalLabel: "91% of $200,000",
    fillPct: 91,
    backerCount: 908,
    daysLeft: 2,
    milestoneSummary: "4 of 6 released · $144,400 of $200,000",
    milestones: [
      {
        stageNumber: "01",
        label: "Structural survey",
        amount: "$18,000",
        description: "Full timber and brick survey, rot mapped, load-bearing repairs scoped.",
        state: "released",
        badgeLabel: "Released",
        meta: "Released 4 Jun",
      },
      {
        stageNumber: "02",
        label: "Roof and frame",
        amount: "$52,000",
        description: "Slate roof relaid, timber frame repaired to the 1892 drawings.",
        state: "released",
        badgeLabel: "Released",
        meta: "Released 2 Jul",
      },
      {
        stageNumber: "03",
        label: "Block instruments",
        amount: "$36,400",
        description: "Original block instruments restored by a signalling specialist in York.",
        state: "released",
        badgeLabel: "Released",
        meta: "Released 30 Jul",
      },
      {
        stageNumber: "04",
        label: "Interior and glazing",
        amount: "$38,000",
        description: "Sash windows reglazed, interior lime-plastered and painted to the GWR spec.",
        state: "released",
        badgeLabel: "Released",
        meta: "Released 25 Aug",
      },
      {
        stageNumber: "05",
        label: "Lever frame",
        amount: "$38,000",
        description: "The 24-lever frame stripped, painted and reconnected to working signals.",
        state: "submitted",
        badgeLabel: "Submitted",
        meta: "Evidence filed 31 Aug · 39h to dispute",
      },
      {
        stageNumber: "06",
        label: "Opening to visitors",
        amount: "$17,600",
        description: "Steps, signage and a rota of volunteer signalmen so the box can open on weekends.",
        state: "pending",
        badgeLabel: "Pending",
        meta: "Opens after stage 05",
      },
    ],
    story: [
      "Ridgeway Halt closed with the line in 1967. The signal box survived because nobody got round to demolishing it — sixty years of damp took care of most of the rest.",
      "Six stages, most now done: the structure is sound, the roof is back on, and the block instruments — sent to a specialist in York — are restored and back in place. What's left is the lever frame and, finally, opening the doors.",
      "The Trust runs on volunteer labour for everything except specialist trades, which is where the escrow goes: roofers, the signalling restorer, and a structural engineer who signs off each stage before it's submitted.",
    ],
    updates: [
      {
        date: "31 Aug",
        title: "Lever frame reconnected",
        body: "All 24 levers stripped, repainted GWR chocolate and cream, and reconnected to the running signals for testing.",
      },
      {
        date: "25 Aug",
        title: "Interior finished",
        body: "Lime plaster cured and the block shelf repainted. The box looks like 1892 again from the inside.",
      },
      {
        date: "30 Jul",
        title: "Block instruments home",
        body: "Restored instruments back from York and refitted to the original shelf brackets.",
      },
    ],
    backers: [
      { initials: "DC", name: "David Carrow", tierLabel: "Volunteer signalman day", amount: "$60" },
      { initials: "PL", name: "Priya Lall", tierLabel: "Lever frame brass plaque", amount: "$450" },
      { initials: "WM", name: "William Marsh", tierLabel: "Opening day ticket", amount: "$20" },
    ],
    tiers: [
      { amount: "$20", label: "Opening day ticket for two", meta: "312 backers" },
      { amount: "$60", label: "A day shadowing the volunteer signalman", meta: "204 backers", selected: true },
      { amount: "$180", label: "Named brick in the platform rebuild", meta: "88 backers" },
      { amount: "$450", label: "Your name on a lever frame brass plaque", meta: "11 of 24 left" },
    ],
    heroPlaceholder: "Signal box restoration · 16:10",
  },
};

export function getCampaignDetail(slug: string): CampaignDetail | undefined {
  return campaignDetails[slug];
}

export function getAllCampaignSlugs(): string[] {
  return Object.keys(campaignDetails);
}

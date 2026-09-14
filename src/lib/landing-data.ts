/**
 * Static marketing copy for the landing page. Everything numeric the landing
 * page shows (escrow held, live campaigns, donors) comes from the database via
 * src/server/queries/public.ts — only the explanatory copy lives here.
 */

export const howItWorksSteps = [
  {
    number: "01",
    title: "A donor donations",
    body: "They pick a tier and pay. The money goes to escrow, not to the creator's account.",
  },
  {
    number: "02",
    title: "Escrow holds it",
    body: "Nothing releases at launch. The total is split across the campaign's stages by the plan the creator published.",
  },
  {
    number: "03",
    title: "The creator shows the work",
    body: "Photographs, receipts and a note, submitted against the terms that stage was funded on.",
  },
  {
    number: "04",
    title: "The stage releases",
    body: "Donors have 72 hours to dispute. If nobody does, that stage's funds move. A disputed stage is reviewed and can be refunded.",
  },
];

export const creatorBullets = [
  "No platform fee until a stage releases",
  "Funds land within three working days of approval",
  "A clean release history travels with your next campaign",
];

/** An illustrative stage plan for the "For creators" section. */
export const stagePlan = {
  campaignTitle: "Restoring the Cowdray kiln",
  stages: [
    { number: "01", label: "Kiln survey", amount: "$12,000", share: "20%" },
    { number: "02", label: "Kiln lining", amount: "$16,000", share: "27%" },
    { number: "03", label: "Firing trials", amount: "$14,000", share: "23%" },
    {
      number: "04",
      label: "First production run",
      amount: "$18,000",
      share: "30%",
    },
  ],
  goal: { amount: "$60,000", share: "100%" },
};

const footerDonors = [
  { label: "Discover", href: "/discover" },
  { label: "How escrow works", href: "/how-escrow-works" },
  { label: "Escrow and refunds", href: "/escrow-and-refund-policy" },
];

// Desktop's footer runs a third "Company" column; mobile condenses to two
// columns and folds "Guidelines" into Creators instead.
export const footerLinks = {
  donors: footerDonors,
  creators: [
    { label: "Start a campaign", href: "/create-campaign" },
    { label: "Payout terms", href: "/payout-terms" },
    { label: "Community guidelines", href: "/guidelines" },
  ],
  company: [
    { label: "Report a campaign", href: "/report-campaign" },
    { label: "Privacy", href: "/privacy" },
    { label: "Contact", href: "/contact" },
  ],
};

export const footerLinksMobile = {
  donors: footerDonors,
  creators: [
    { label: "Start a campaign", href: "/create-campaign" },
    { label: "Payout terms", href: "/payout-terms" },
    { label: "Community guidelines", href: "/guidelines" },
  ],
};

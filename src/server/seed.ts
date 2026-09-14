import type { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./password";

/**
 * The starting world: the campaigns, people and moderation history the
 * original mock data described, reconciled into one consistent set of facts.
 * Every date is relative to the moment of seeding, so a fresh database always
 * has a review window closing tonight, a dispute past its deadline, and so on.
 *
 * Figures a page shows (raised, backers, escrow, refunds) are never stored —
 * they are computed from these rows. Backers beyond the named ones are
 * generated deterministically so totals match what each campaign reports.
 */

/** Password for every seeded account. */
export const DEMO_PASSWORD = "oneraise-demo-2026";

const DAY = 86_400_000;
const HOUR = 3_600_000;

type MilestoneSeed = {
  label: string;
  description: string;
  terms?: string;
  amount: number;
  state: "pending" | "current" | "submitted" | "released" | "refunded";
  dueInDays?: number;
  submittedHoursAgo?: number;
  windowEndsInHours?: number;
  releasedDaysAgo?: number;
  refundedHoursAgo?: number;
  evidenceNote?: string;
  evidence?: string[];
  document?: string;
  heldBy?: number;
  heldDaysAgo?: number;
};

type NamedBacker = {
  name: string;
  location: string;
  amount: number;
  daysAgo: number;
  userId?: number;
  card?: string;
};

type CampaignSeed = {
  slug: string;
  creatorId: number;
  title: string;
  shortTitle: string;
  category: string;
  location: string;
  summary: string;
  summaryShort: string;
  story: string[];
  hero: string;
  currency: string;
  status: "draft" | "live" | "paused" | "refunded" | "failed" | "taken_down";
  launchedDaysAgo: number | null;
  durationDays: number;
  tiers: { amount: number; label: string; stock?: number; weight: number }[];
  milestones: MilestoneSeed[];
  raised: number;
  backers: number;
  named: NamedBacker[];
  updates: { title: string; body: string; daysAgo: number }[];
};

const FIRST_NAMES = [
  "Adaeze", "Bola", "Chinedu", "Efe", "Folake", "Ibrahim", "Kemi", "Musa", "Ngozi", "Obinna", "Sade", "Tobi",
  "Yusuf", "Zainab", "Aisha", "Emeka", "Funmi", "Ifeoma", "Kunle", "Nkechi", "Olu", "Temi", "Uche", "Wale",
  "Amara", "Kwabena", "Ama", "Kofi", "Esi", "Yaw", "Wanjiru", "Otieno", "Achieng", "Kamau", "Njeri", "Thabo",
  "Lerato", "Sipho", "Naledi", "Siobhan", "Ciaran", "Aoife", "Niamh", "Declan", "Rhian", "Dafydd", "Seren",
  "Gethin", "Cerys", "Hamish", "Isla", "Callum", "Morag", "Ewan", "Harriet", "Oliver", "Charlotte", "George",
  "Amelia", "Thomas", "Freya", "Arthur", "Poppy", "Priya", "Arjun", "Meera", "Rohan", "Anika", "Hannah",
  "Jonas", "Lena", "Mateo", "Lucia", "Chiara", "Marco", "Sofia", "Élodie", "Hugo", "Inès", "Lars", "Ingrid",
  "Maja", "Sven", "Astrid", "Daniel", "Grace", "Ben", "Ruby", "Sam", "Zara", "Leo", "Maya", "Noah", "Ivy",
];

const LAST_NAMES = [
  "Adeyemi", "Okafor", "Balogun", "Eze", "Nwosu", "Abubakar", "Bello", "Danjuma", "Olawale", "Chukwu",
  "Mensah", "Asante", "Owusu", "Boateng", "Mwangi", "Odhiambo", "Njoroge", "Nkosi", "Dlamini", "Murphy",
  "O'Brien", "Kelly", "Byrne", "Jones", "Davies", "Evans", "Pritchard", "Morgan", "MacLeod", "Campbell",
  "Fraser", "Smith", "Taylor", "Brown", "Wilson", "Clarke", "Hughes", "Walker", "Patel", "Shah", "Iyer",
  "Rao", "Fischer", "Weber", "Novak", "García", "Rossi", "Moreau", "Laurent", "Andersen", "Nilsson", "Berg",
  "Cohen", "Levy", "Walsh", "Doyle", "Reid", "Hart", "Stone", "Wood", "Fox",
];

const LOCATIONS = [
  "Kano, Nigeria", "Lagos, Nigeria", "Abuja, Nigeria", "Ibadan, Nigeria", "Enugu, Nigeria", "Accra, Ghana",
  "Kumasi, Ghana", "Nairobi, Kenya", "Mombasa, Kenya", "Cape Town, South Africa", "Johannesburg, South Africa",
  "London, UK", "Leeds, UK", "Sheffield, UK", "Bristol, UK", "Manchester, UK", "Cardiff, UK", "Edinburgh, UK",
  "Glasgow, UK", "Oxford, UK", "Dublin, Ireland", "Cork, Ireland", "Bergen, Norway", "Berlin, Germany",
  "Paris, France", "Lisbon, Portugal", "Toronto, Canada", "New York, USA", "Chicago, USA", "Mumbai, India",
];

/** mulberry32 — a small deterministic PRNG so the generated backers are stable. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Pick `count` donation amounts from the tiers that sum to exactly `total`:
 * draw by weight, walk individual donations up or down a tier until the sum is
 * within one tier step of the target, then settle the remainder as a custom
 * amount on one donation.
 */
function distributePledges(
  rand: () => number,
  count: number,
  total: number,
  tiers: { amount: number; stock?: number; weight: number }[],
): { amount: number; tierIndex: number | null }[] {
  if (count <= 0) return [];
  const stockLeft = tiers.map((t) => t.stock ?? Infinity);
  const weightSum = tiers.reduce((s, t) => s + t.weight, 0);
  const picks: number[] = [];
  for (let i = 0; i < count; i++) {
    let r = rand() * weightSum;
    let idx = 0;
    for (; idx < tiers.length - 1; idx++) {
      r -= tiers[idx].weight;
      if (r <= 0) break;
    }
    while (stockLeft[idx] <= 0 && idx > 0) idx--;
    stockLeft[idx]--;
    picks.push(idx);
  }
  let sum = picks.reduce((s, idx) => s + tiers[idx].amount, 0);
  const minStep = Math.min(...tiers.slice(1).map((t, i) => t.amount - tiers[i].amount));
  for (let guard = 0; guard < 200_000 && Math.abs(total - sum) >= minStep; guard++) {
    const i = Math.floor(rand() * count);
    const idx = picks[i];
    if (sum > total && idx > 0 && sum - (tiers[idx].amount - tiers[idx - 1].amount) >= total - minStep) {
      stockLeft[idx]++;
      stockLeft[idx - 1]--;
      sum -= tiers[idx].amount - tiers[idx - 1].amount;
      picks[i] = idx - 1;
    } else if (sum < total && idx < tiers.length - 1 && stockLeft[idx + 1] > 0) {
      stockLeft[idx]++;
      stockLeft[idx + 1]--;
      sum += tiers[idx + 1].amount - tiers[idx].amount;
      picks[i] = idx + 1;
    }
  }
  const result = picks.map((idx) => ({ amount: tiers[idx].amount, tierIndex: idx as number | null }));
  const remainder = total - sum;
  if (remainder !== 0) {
    const target = result.find((p) => p.amount + remainder > 0) ?? result[0];
    target.amount += remainder;
    target.tierIndex = null;
  }
  return result;
}

export function seedDatabase(conn: DatabaseSync): void {
  const now = Date.now();
  const daysAgo = (d: number) => Math.round(now - d * DAY);
  const hoursAgo = (h: number) => Math.round(now - h * HOUR);
  const hoursFromNow = (h: number) => Math.round(now + h * HOUR);

  const insert = (sql: string, ...params: (string | number | null)[]) =>
    Number(conn.prepare(sql).run(...params).lastInsertRowid);

  /* ---------------------------------------------------------------- */
  /* People                                                           */
  /* ---------------------------------------------------------------- */

  const passwordHash = hashPassword(DEMO_PASSWORD);
  const user = (u: {
    email: string;
    name: string;
    role: "donor" | "creator" | "admin";
    country: string;
    staffTitle?: string;
    twoFactor?: boolean;
    card?: [string, string];
    createdDaysAgo: number;
    notify?: Record<string, boolean>;
  }) =>
    insert(
      `INSERT INTO users (email, password_hash, name, country, role, staff_title, email_verified_at, two_factor,
         card_label, card_expiry, notify_prefs, password_changed_at, last_sign_in_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      u.email,
      passwordHash,
      u.name,
      u.country,
      u.role,
      u.staffTitle ?? null,
      daysAgo(u.createdDaysAgo - 0.01),
      u.twoFactor ? 1 : 0,
      u.card?.[0] ?? null,
      u.card?.[1] ?? null,
      JSON.stringify(u.notify ?? {}),
      daysAgo(u.createdDaysAgo),
      hoursAgo(20),
      daysAgo(u.createdDaysAgo),
    );

  const amina = user({
    email: "amina@example.org",
    name: "Amina Bala",
    role: "donor",
    country: "Nigeria",
    twoFactor: true,
    card: ["Visa ending 4021", "09/2029"],
    createdDaysAgo: 69,
    notify: { window_closing: true, refund_issued: true, creator_updates: false, new_campaigns: false },
  });
  const tomi = user({
    email: "tomi@example.org",
    name: "Tomi Musa",
    role: "admin",
    country: "Nigeria",
    staffTitle: "Trust & safety",
    twoFactor: true,
    createdDaysAgo: 400,
  });
  const ruth = user({
    email: "ruth@example.org",
    name: "Ruth Ade",
    role: "admin",
    country: "Nigeria",
    staffTitle: "Trust & safety",
    twoFactor: true,
    createdDaysAgo: 380,
  });

  const creatorNotify = { due_approaching: true, payout_landed: true, every_pledge: false };
  const creator = (c: {
    email: string;
    owner: string;
    ownerCountry: string;
    name: string;
    initials: string;
    location: string;
    country: string;
    bio: string;
    structure: string;
    kyc: "none" | "pending" | "verified" | "stale" | "rejected";
    kycVerifiedDaysAgo?: number;
    payout?: string;
    currency: string;
    createdDaysAgo: number;
  }) => {
    const ownerId = user({
      email: c.email,
      name: c.owner,
      role: "creator",
      country: c.ownerCountry,
      twoFactor: c.kyc === "verified" || c.kyc === "stale",
      createdDaysAgo: c.createdDaysAgo,
      notify: creatorNotify,
    });
    const creatorId = insert(
      `INSERT INTO creators (owner_user_id, name, initials, location, country, bio, structure, kyc_status,
         kyc_verified_at, payout_account, payout_currency, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ownerId,
      c.name,
      c.initials,
      c.location,
      c.country,
      c.bio,
      c.structure,
      c.kyc,
      c.kycVerifiedDaysAgo != null ? daysAgo(c.kycVerifiedDaysAgo) : null,
      c.payout ?? null,
      c.currency,
      daysAgo(c.createdDaysAgo),
    );
    return { ownerId, creatorId };
  };

  const hausa = creator({
    email: "hausa@example.org",
    owner: "Hadiza Ibrahim",
    ownerCountry: "Nigeria",
    name: "Hausa Indigo Collective",
    initials: "HI",
    location: "Kano, Nigeria",
    country: "Nigeria",
    bio: "Nine dyers working the Kofar Mata pits, in continuous use since 1498. We dye with wild indigo, potash and no synthetics.",
    structure: "Co-operative",
    kyc: "verified",
    kycVerifiedDaysAgo: 75,
    payout: "Zenith Bank · ending 8841",
    currency: "NGN",
    createdDaysAgo: 90,
  });
  const bryn = creator({
    email: "bryn@example.org",
    owner: "Bryn Evans",
    ownerCountry: "United Kingdom",
    name: "Bryn & Co.",
    initials: "BC",
    location: "Powys, Wales",
    country: "United Kingdom",
    bio: "A two-person letterpress and bindery in a converted Powys barn.",
    structure: "Ltd · one director",
    kyc: "verified",
    kycVerifiedDaysAgo: 60,
    payout: "Monzo Business · ending 2207",
    currency: "GBP",
    createdDaysAgo: 120,
  });
  const rootwork = creator({
    email: "rootwork@example.org",
    owner: "Joe Hartley",
    ownerCountry: "United Kingdom",
    name: "Rootwork Collective",
    initials: "RC",
    location: "Sheffield, UK",
    country: "United Kingdom",
    bio: "Plot holders across Sheffield's allotment sites, growing and saving seed together.",
    structure: "Community interest company",
    kyc: "verified",
    kycVerifiedDaysAgo: 9,
    payout: "Co-operative Bank · ending 6614",
    currency: "GBP",
    createdDaysAgo: 400,
  });
  const ridgeway = creator({
    email: "ridgeway@example.org",
    owner: "Margaret Hale",
    ownerCountry: "United Kingdom",
    name: "Ridgeway Trust",
    initials: "RT",
    location: "Oxfordshire, UK",
    country: "United Kingdom",
    bio: "Volunteers restoring the railway heritage of the Ridgeway line.",
    structure: "Registered charity",
    kyc: "verified",
    kycVerifiedDaysAgo: 200,
    payout: "Barclays · ending 1093",
    currency: "GBP",
    createdDaysAgo: 700,
  });
  const hollowClay = creator({
    email: "hollowclay@example.org",
    owner: "Isla Bennett",
    ownerCountry: "United Kingdom",
    name: "Hollow Clay",
    initials: "HC",
    location: "Midhurst, UK",
    country: "United Kingdom",
    bio: "A studio pottery in West Sussex firing wood kilns the old way.",
    structure: "Partnership",
    kyc: "verified",
    kycVerifiedDaysAgo: 150,
    payout: "Starling · ending 5520",
    currency: "GBP",
    createdDaysAgo: 300,
  });
  const kestrel = creator({
    email: "kestrel@example.org",
    owner: "James Kestrel",
    ownerCountry: "United Kingdom",
    name: "Kestrel Forge",
    initials: "KF",
    location: "Sheffield, UK",
    country: "United Kingdom",
    bio: "Hand-forged kitchen knives from reclaimed Sheffield steel.",
    structure: "Sole trader · J. Kestrel",
    kyc: "stale",
    kycVerifiedDaysAgo: 400,
    payout: "Lloyds · ending 3381",
    currency: "GBP",
    createdDaysAgo: 420,
  });
  const ferrous = creator({
    email: "ferrous@example.org",
    owner: "Aoife Byrne",
    ownerCountry: "Ireland",
    name: "Ferrous Press",
    initials: "FP",
    location: "Cork, Ireland",
    country: "Ireland",
    bio: "Casting metal type for Ireland's small presses.",
    structure: "Ltd · two directors",
    kyc: "pending",
    payout: "AIB · ending 7730",
    currency: "EUR",
    createdDaysAgo: 4,
  });
  const saltMarsh = creator({
    email: "saltmarsh@example.org",
    owner: "Wanjiru Kamau",
    ownerCountry: "Kenya",
    name: "Salt Marsh Weavers",
    initials: "SW",
    location: "Lamu, Kenya",
    country: "Kenya",
    bio: "Mat makers on Lamu island weaving doum palm.",
    structure: "Co-operative",
    kyc: "pending",
    payout: "Equity Bank · ending 4418",
    currency: "USD",
    createdDaysAgo: 20,
  });
  const ninefold = creator({
    email: "ninefold@example.org",
    owner: "Chuka Obi",
    ownerCountry: "Nigeria",
    name: "Ninefold Bindery",
    initials: "NB",
    location: "Lagos, Nigeria",
    country: "Nigeria",
    bio: "Hand-binding for Lagos's independent publishers.",
    structure: "Sole trader",
    kyc: "pending",
    currency: "NGN",
    createdDaysAgo: 2,
  });
  const quickFlip = creator({
    email: "flip@example.org",
    owner: "Dex Rowe",
    ownerCountry: "United Kingdom",
    name: "Quick Flip Capital",
    initials: "QF",
    location: "London, UK",
    country: "United Kingdom",
    bio: "",
    structure: "Sole trader",
    kyc: "none",
    currency: "GBP",
    createdDaysAgo: 8,
  });
  const tidewater = creator({
    email: "tidewater@example.org",
    owner: "Sam Whitlock",
    ownerCountry: "United Kingdom",
    name: "Tidewater Co-op",
    initials: "TC",
    location: "Whitstable, UK",
    country: "United Kingdom",
    bio: "Oyster growers on the north Kent coast.",
    structure: "Co-operative",
    kyc: "verified",
    kycVerifiedDaysAgo: 100,
    payout: "NatWest · ending 9902",
    currency: "GBP",
    createdDaysAgo: 110,
  });
  const blackthorn = creator({
    email: "blackthorn@example.org",
    owner: "Ellen Price",
    ownerCountry: "United Kingdom",
    name: "Blackthorn Cider",
    initials: "BL",
    location: "Hereford, UK",
    country: "United Kingdom",
    bio: "Farmhouse cider from old Herefordshire orchards.",
    structure: "Sole trader",
    kyc: "verified",
    kycVerifiedDaysAgo: 80,
    payout: "HSBC · ending 3027",
    currency: "GBP",
    createdDaysAgo: 90,
  });

  /* ---------------------------------------------------------------- */
  /* Campaigns                                                        */
  /* ---------------------------------------------------------------- */

  const campaigns: CampaignSeed[] = [
    {
      slug: "kofar-mata-indigo-dye-pits",
      creatorId: hausa.creatorId,
      title: "Rebuilding the indigo dye pits at Kofar Mata",
      shortTitle: "Kofar Mata pits",
      category: "Craft & material",
      location: "Kano, Nigeria",
      summary:
        "Twelve of the ninety pits at Kano's dye yard still hold indigo. This raise relines the rest, stage by stage, and puts a roof over the north shed before the rains.",
      summaryShort: "Twelve of the ninety pits at Kano's dye yard still hold indigo. This raise relines the rest, stage by stage.",
      story: [
        "Kano's dye yard at Kofar Mata has been worked since 1498. Ninety pits were cut into the laterite; twelve still hold indigo. The rest silted up after their clay linings failed, and the men who know how to reline them are down to four.",
        "The raise pays for the relining, the leaf, and a roof over the north shed so the pits can be worked through the rains. Each stage draws only its own budget. The next stage stays in escrow until the last one is signed off by three of the collective's elders and an independent quantity surveyor.",
        "Backers are charged when funding closes, and the money is held by a licensed trustee rather than by the collective. When a stage is submitted, backers see the evidence and have 72 hours to dispute. If a dispute stands, that stage is refunded instead of released.",
      ],
      hero: "Dye-yard photograph · 16:10",
      currency: "NGN",
      status: "live",
      launchedDaysAgo: 43,
      durationDays: 55,
      tiers: [
        { amount: 25, label: "Indigo swatch, dyed in pit 7", weight: 34 },
        { amount: 80, label: "One metre of pit-dyed cloth", weight: 52 },
        { amount: 250, label: "Hand-stamped adire wrapper", stock: 40, weight: 6 },
        { amount: 1000, label: "Your name cut into the dye house lintel", weight: 2 },
      ],
      milestones: [
        {
          label: "Survey",
          description: "All sixty-two working pits surveyed and mapped, with rot and silt depth logged per pit.",
          terms: "A survey of every pit, mapped and photographed, with the surveyor's report attached.",
          amount: 9000,
          state: "released",
          submittedHoursAgo: 40 * 24,
          releasedDaysAgo: 36,
          evidenceNote: "Every pit surveyed and mapped. Report from the quantity surveyor attached.",
          evidence: ["Pit map, north yard", "Surveyor at pit 9"],
          document: "Survey report · 14 pages",
        },
        {
          label: "Pit relining",
          description: "Thirty pits relined with laterite and potash mortar, cured and water-tested.",
          terms: "Thirty pits relined and cured, photographed before and after, with a materials receipt.",
          amount: 21000,
          state: "submitted",
          submittedHoursAgo: 58,
          windowEndsInHours: 14,
          evidenceNote:
            "Thirty-one pits relined with laterite and potash mortar. The two shown are pits 14 and 15, cured eleven days. Remaining forty-seven follow in stage three once the roof is up.",
          evidence: ["Pit 14, after", "Pit 15, after", "Pits, before"],
          document: "Materials receipt · laterite and potash",
        },
        {
          label: "North shed roof",
          description: "Sixteen timber trusses and zinc sheeting over the north shed.",
          terms: "Roof trusses and sheeting installed over the north shed, photographed complete, with the carpenter's invoice.",
          amount: 18000,
          state: "pending",
        },
        {
          label: "Reopening",
          description: "Six apprentices paid a stipend through the first dyeing season, and the yard reopened.",
          terms: "Apprentice stipends paid for one season and the yard open to visitors, with a payroll record.",
          amount: 12000,
          state: "pending",
        },
      ],
      raised: 48250,
      backers: 631,
      named: [
        { name: "Amina Bala", location: "Kano, Nigeria", amount: 250, daysAgo: 1.2, userId: amina, card: "Visa ending 4021" },
        { name: "Joseph Okonkwo", location: "Lagos, Nigeria", amount: 80, daysAgo: 1.4 },
        { name: "Mari Wren", location: "Sheffield, UK", amount: 40, daysAgo: 2.3 },
        { name: "Peter Nkemdirim", location: "Abuja, Nigeria", amount: 40, daysAgo: 2.6 },
        { name: "Lise Hansen", location: "Bergen, Norway", amount: 80, daysAgo: 3.2 },
        { name: "Tunde Musa", location: "Kano, Nigeria", amount: 250, daysAgo: 5.1 },
        { name: "Ruth Adebayo", location: "Ibadan, Nigeria", amount: 40, daysAgo: 6.2 },
        { name: "Sarah Kessler", location: "Leeds, UK", amount: 80, daysAgo: 7.1 },
        { name: "David Okafor", location: "Enugu, Nigeria", amount: 40, daysAgo: 9.3 },
        { name: "Chidinma Wright", location: "Kano, Nigeria", amount: 250, daysAgo: 12.2 },
      ],
      updates: [
        {
          title: "Pit relining evidence submitted",
          body: "Thirty-one of thirty pits are relined with laterite and potash mortar. Photos and the materials receipt are up for review — the dispute window closes in 72 hours.",
          daysAgo: 2.4,
        },
        {
          title: "Survey complete, first payout landed",
          body: "All sixty-two pits surveyed and mapped. The stage released with no disputes and the payout landed in our account two days later. Pit relining starts next week.",
          daysAgo: 35,
        },
        {
          title: "Thank you for getting us started",
          body: "Four days in and we're already at 12% of goal. The dyers have started clearing the first six pits ahead of the survey. More photos soon.",
          daysAgo: 39,
        },
      ],
    },
    {
      slug: "welsh-letterpress-revival",
      creatorId: bryn.creatorId,
      title: "A letterpress revival in the Welsh valleys",
      shortTitle: "Welsh letterpress",
      category: "Type & print",
      location: "Powys, Wales",
      summary:
        "A 1920s Vandercook and eleven cases of Welsh-cut type have sat idle in a Powys barn for a decade. This raise fits out a working bindery around them and puts the first run on the shelf.",
      summaryShort: "A 1920s Vandercook and eleven cases of Welsh-cut type have sat idle in a Powys barn for a decade.",
      story: [
        "The press came out of a closed Cardiff print works in 2014 and has sat under a tarpaulin since. It still turns freely. The type — eleven cases of a Welsh-cut face nobody else runs — came with it, uncatalogued.",
        "This raise puts both back to work: the press tuned and printing, a proper bindery built around it so a finished, sewn book can leave the barn rather than just loose sheets, and then the first edition itself.",
        "Stage four opens the barn itself, running short composing courses so the skill doesn't leave with whoever taught it last.",
      ],
      hero: "Letterpress workshop · 16:10",
      currency: "GBP",
      status: "live",
      launchedDaysAgo: 42,
      durationDays: 60,
      tiers: [
        { amount: 45, label: "Broadside, hand-pulled and numbered", weight: 40 },
        { amount: 120, label: "A5 chapbook, sewn in the bindery", weight: 34 },
        { amount: 380, label: "A place on the six-week composing course", stock: 12, weight: 3 },
        { amount: 1200, label: "Your own run of 200 copies, printed and bound", weight: 16 },
      ],
      milestones: [
        {
          label: "Tooling",
          description: "Vandercook stripped, regreased and test-printed. Missing rollers recast.",
          terms: "The press serviced and printing, with a test sheet photographed and the roller invoice.",
          amount: 18000,
          state: "released",
          submittedHoursAgo: 34 * 24,
          releasedDaysAgo: 30,
          evidenceNote: "First test sheet off the press in ten years. Impression is even across the bed.",
          evidence: ["Test sheet, first pull", "Rollers, recast"],
          document: "Roller invoice",
        },
        {
          label: "Bindery",
          description: "A sewing stitcher and board shear fitted out to finish what the press prints.",
          terms: "Bindery equipment installed and commissioned, with one bound proof copy photographed and a supplier receipt.",
          amount: 22400,
          state: "submitted",
          submittedHoursAgo: 9 * 24,
          windowEndsInHours: -6 * 24,
          evidenceNote:
            "The new sewing stitcher is installed and commissioned. First hand-bound proof off it attached — full run of 40 starts next week.",
          evidence: ["Bindery, new stitcher", "First bound proof"],
          document: "Delivery note · stitcher",
        },
        {
          label: "First run",
          description: "The eleven cases of Welsh-cut type sorted and cased, and the first edition printed and trimmed.",
          terms: "The first edition printed, trimmed and bound, with a photographed copy and the guillotine receipt.",
          amount: 18000,
          state: "pending",
        },
        {
          label: "Public workshop",
          description: "The barn opened for six-week composing courses, twelve places per intake.",
          terms: "The first composing course run to completion, with the attendance register.",
          amount: 61600,
          state: "pending",
        },
      ],
      raised: 84600,
      backers: 312,
      named: [
        { name: "Rhys Hughes", location: "Cardiff, UK", amount: 45, daysAgo: 2.2 },
        { name: "Eira Watkins", location: "Cardiff, UK", amount: 380, daysAgo: 4.4 },
        { name: "Gareth Tudor", location: "Bristol, UK", amount: 45, daysAgo: 6.1 },
        { name: "Tunde Musa", location: "Kano, Nigeria", amount: 250, daysAgo: 15 },
        { name: "Ruth Adebayo", location: "Ibadan, Nigeria", amount: 40, daysAgo: 18 },
      ],
      updates: [
        {
          title: "Bindery evidence submitted",
          body: "The stitcher is in and commissioned, and the first bound proof is attached to stage 02. Invoice follows from the supplier in 30 days, as is standard for them.",
          daysAgo: 9,
        },
        {
          title: "Type cases sorted",
          body: "All eleven cases catalogued by point size. Two are missing their descenders — a type founder in Bristol is casting replacements.",
          daysAgo: 20,
        },
        {
          title: "The Vandercook runs",
          body: "First test sheet off the press in ten years. Impression is even across the bed once the packing was rebuilt.",
          daysAgo: 33,
        },
      ],
    },
    {
      slug: "urban-allotment-seed-library",
      creatorId: rootwork.creatorId,
      title: "Seed library for urban allotments",
      shortTitle: "Seed library",
      category: "Growing",
      location: "Sheffield, UK",
      summary:
        "Sheffield's allotment waiting list runs to nine years. This raise builds a shared seed library so every plot holder starts a season without buying in from scratch.",
      summaryShort: "Sheffield's allotment waiting list runs nine years. This builds a shared seed library for every plot holder.",
      story: [
        "There are 34 allotment sites across Sheffield and one seed catalogue between them — whatever each plot holder happens to save. Varieties adapted to the city's clay and short season get lost when a plot changes hands.",
        "The library gives every site a cabinet, a register, and a standing invitation to borrow rather than buy. Three stages: build the cabinets, catalogue what's already being grown, then run distribution through the borrowing table each spring.",
      ],
      hero: "Allotment seed library · 16:10",
      currency: "GBP",
      status: "live",
      launchedDaysAgo: 50,
      durationDays: 56,
      tiers: [
        { amount: 15, label: "A season's borrowing card", weight: 30 },
        { amount: 40, label: "Borrowing card plus a growing workshop", weight: 30 },
        { amount: 120, label: "Your name on a cabinet sponsor plaque", weight: 26 },
        { amount: 500, label: "Sponsor a whole site's cabinet", stock: 20, weight: 14 },
      ],
      milestones: [
        {
          label: "Seed intake",
          description: "Cataloguing cabinets built and the first 80 varieties logged from plot-holder donations.",
          terms: "Cabinets built at three sites and at least fifty varieties logged, photographed in place.",
          amount: 3200,
          state: "released",
          submittedHoursAgo: 44 * 24,
          releasedDaysAgo: 40,
          evidenceNote: "Three cabinets built and eighty varieties logged from donations.",
          evidence: ["Cabinet, Manor Fields", "Donation table"],
        },
        {
          label: "Cataloguing",
          description: "Every variety photographed, germination-tested and entered into the shared register.",
          terms: "A seed catalogue covering at least seventy varieties, indexed and photographed both in the field register and on storage shelving.",
          amount: 5000,
          state: "released",
          submittedHoursAgo: 20 * 24,
          releasedDaysAgo: 18,
          evidenceNote:
            "Eighty varieties catalogued by sowing month with a paper index at the gate, backed by the same list photographed on shelving inside.",
          evidence: ["Catalogue binder", "Seed shelving"],
        },
        {
          label: "Distribution",
          description: "A weekly borrowing table at the site gates through the spring sowing window.",
          terms: "A standing borrowing table run weekly through the sowing window, with a register of what was lent and returned.",
          amount: 4800,
          state: "submitted",
          submittedHoursAgo: 24,
          windowEndsInHours: 48,
          evidenceNote: "A weekly borrowing table running at the site gates through the spring sowing window, 80 varieties on offer.",
          evidence: ["Borrowing table, Manor Fields gate", "Register, week one"],
        },
      ],
      raised: 18900,
      backers: 140,
      named: [
        { name: "Amina Bala", location: "Kano, Nigeria", amount: 120, daysAgo: 24, userId: amina, card: "Visa ending 4021" },
        { name: "Jamila Priestley", location: "Sheffield, UK", amount: 15, daysAgo: 3 },
        { name: "Owen Whitfield", location: "Sheffield, UK", amount: 120, daysAgo: 5 },
        { name: "Fiona Ng", location: "Leeds, UK", amount: 15, daysAgo: 8 },
        { name: "Sarah Kessler", location: "Leeds, UK", amount: 40, daysAgo: 30 },
      ],
      updates: [
        {
          title: "Borrowing table opens Saturday",
          body: "First distribution day at the Manor Fields gate. 80 varieties on the table, register open for new entries.",
          daysAgo: 1.2,
        },
        {
          title: "Cataloguing complete",
          body: "All 80 varieties germination-tested. Register live and searchable by sowing month.",
          daysAgo: 19,
        },
      ],
    },
    {
      slug: "ridgeway-signal-box-restoration",
      creatorId: ridgeway.creatorId,
      title: "Ridgeway signal box restoration",
      shortTitle: "Ridgeway signal box",
      category: "Restoration",
      location: "Oxfordshire, UK",
      summary:
        "The 1892 signal box at Ridgeway Halt has been derelict since the line closed in 1967. This raise restores the frame, the block instruments and the levers, stage by stage, back to working order.",
      summaryShort: "The 1892 signal box at Ridgeway Halt has been derelict since the line closed in 1967.",
      story: [
        "Ridgeway Halt closed with the line in 1967. The signal box survived because nobody got round to demolishing it — sixty years of damp took care of most of the rest.",
        "Six stages, most now done: the structure is sound, the roof is back on, and the block instruments — sent to a specialist in York — are restored and back in place. What's left is the lever frame and, finally, opening the doors.",
        "The Trust runs on volunteer labour for everything except specialist trades, which is where the escrow goes: roofers, the signalling restorer, and a structural engineer who signs off each stage before it's submitted.",
      ],
      hero: "Signal box restoration · 16:10",
      currency: "GBP",
      status: "live",
      launchedDaysAgo: 88,
      durationDays: 90,
      tiers: [
        { amount: 60, label: "A day shadowing the volunteer signalman", weight: 44 },
        { amount: 180, label: "Named brick in the platform rebuild", weight: 36 },
        { amount: 450, label: "Your name on a lever frame brass plaque", stock: 24, weight: 4 },
        { amount: 1500, label: "Sponsor a restored lever, named on the frame", weight: 7 },
      ],
      milestones: [
        {
          label: "Structural survey",
          description: "Full timber and brick survey, rot mapped, load-bearing repairs scoped.",
          amount: 18000,
          state: "released",
          submittedHoursAgo: 84 * 24,
          releasedDaysAgo: 80,
          evidenceNote: "Engineer's survey complete and repairs scoped.",
          evidence: ["Survey, east elevation"],
        },
        {
          label: "Roof and frame",
          description: "Slate roof relaid, timber frame repaired to the 1892 drawings.",
          amount: 52000,
          state: "released",
          submittedHoursAgo: 56 * 24,
          releasedDaysAgo: 52,
          evidenceNote: "Roof relaid in reclaimed Welsh slate, frame repaired.",
          evidence: ["Roof, relaid"],
        },
        {
          label: "Block instruments",
          description: "Original block instruments restored by a signalling specialist in York.",
          amount: 36400,
          state: "released",
          submittedHoursAgo: 28 * 24,
          releasedDaysAgo: 24,
          evidenceNote: "Restored instruments back from York and refitted to the original shelf brackets.",
          evidence: ["Block shelf, refitted"],
        },
        {
          label: "Interior and glazing",
          description: "Sash windows reglazed, interior lime-plastered and painted to the GWR spec.",
          amount: 38000,
          state: "released",
          submittedHoursAgo: 13 * 24,
          releasedDaysAgo: 9,
          evidenceNote: "Lime plaster cured and the block shelf repainted.",
          evidence: ["Interior, east wall", "Sash windows"],
        },
        {
          label: "Lever frame",
          description: "The 24-lever frame stripped, painted and reconnected to working signals.",
          terms: "The 24-lever frame restored and connected to working signals, with the signalling engineer's sign-off.",
          amount: 38000,
          state: "submitted",
          submittedHoursAgo: 91,
          windowEndsInHours: -19,
          evidenceNote:
            "All 24 levers stripped, repainted GWR chocolate and cream, and reconnected to the running signals for testing.",
          evidence: ["Lever frame, restored", "Signal test, down line"],
          document: "Engineer's sign-off",
        },
        {
          label: "Opening to visitors",
          description: "Steps, signage and a rota of volunteer signalmen so the box can open on weekends.",
          amount: 17600,
          state: "pending",
        },
      ],
      raised: 182400,
      backers: 908,
      named: [
        { name: "David Carrow", location: "Oxford, UK", amount: 60, daysAgo: 0.8 },
        { name: "Priya Lall", location: "London, UK", amount: 450, daysAgo: 1.6 },
        { name: "William Marsh", location: "Oxford, UK", amount: 60, daysAgo: 2.1 },
      ],
      updates: [
        {
          title: "Lever frame reconnected",
          body: "All 24 levers stripped, repainted GWR chocolate and cream, and reconnected to the running signals for testing.",
          daysAgo: 3.8,
        },
        {
          title: "Interior finished",
          body: "Lime plaster cured and the block shelf repainted. The box looks like 1892 again from the inside.",
          daysAgo: 12,
        },
        {
          title: "Block instruments home",
          body: "Restored instruments back from York and refitted to the original shelf brackets.",
          daysAgo: 27,
        },
      ],
    },
    {
      slug: "restoring-the-cowdray-kiln",
      creatorId: hollowClay.creatorId,
      title: "Restoring the Cowdray kiln",
      shortTitle: "Cowdray kiln",
      category: "Clay & kiln",
      location: "Midhurst, UK",
      summary: "The Cowdray estate's Victorian bottle kiln, relined and fired for the first time since 1938.",
      summaryShort: "The Cowdray estate's Victorian bottle kiln, relined and fired again.",
      story: [
        "The bottle kiln on the Cowdray estate last fired in 1938. The shell is sound; the lining is not.",
        "Three stages: survey the chamber, reline it in refractory brick, and fire it once to prove it.",
      ],
      hero: "Bottle kiln · 16:10",
      currency: "GBP",
      status: "paused",
      launchedDaysAgo: 120,
      durationDays: 45,
      tiers: [
        { amount: 40, label: "A test tile from the first firing", weight: 40 },
        { amount: 150, label: "A thrown mug, wood-fired", weight: 36 },
        { amount: 400, label: "A lidded jar from the first firing", weight: 12 },
        { amount: 1000, label: "Load your own pot in the first firing", weight: 3 },
      ],
      milestones: [
        {
          label: "Kiln survey",
          description: "The chamber surveyed and the failed lining mapped brick by brick.",
          amount: 4000,
          state: "released",
          submittedHoursAgo: 74 * 24,
          releasedDaysAgo: 70,
          evidenceNote: "Chamber surveyed; the lining has failed on the north side.",
          evidence: ["Chamber, north wall"],
        },
        {
          label: "Kiln lining",
          description: "The chamber fully relined in refractory brick and the firebox door refitted.",
          terms:
            "The kiln chamber fully relined in refractory brick and the firebox door refitted, photographed before and after, with a fitter's invoice.",
          amount: 16000,
          state: "refunded",
          submittedHoursAgo: 18 * 24,
          windowEndsInHours: -15 * 24,
          refundedHoursAgo: 9,
          evidenceNote: "Chamber relined with new firebrick and the firebox door refitted. Ready for a test firing once approved.",
          evidence: ["Kiln chamber, relined", "Firebox door, refitted"],
        },
        {
          label: "First firing",
          description: "One full wood firing to prove the kiln, with the load unpacked on camera.",
          amount: 10000,
          state: "pending",
        },
      ],
      raised: 30000,
      backers: 180,
      named: [
        { name: "Amina Bala", location: "Kano, Nigeria", amount: 150, daysAgo: 108, userId: amina, card: "Visa ending 4021" },
        { name: "Sarah Kessler", location: "Leeds, UK", amount: 80, daysAgo: 100 },
        { name: "David Okafor", location: "Enugu, Nigeria", amount: 40, daysAgo: 96 },
      ],
      updates: [
        {
          title: "Stage two refunded",
          body: "The moderators upheld the dispute on the lining. That stage's money is going back to you. We're pausing to fix the invoice problem properly.",
          daysAgo: 0.3,
        },
      ],
    },
    {
      slug: "hollow-clay-second-kiln",
      creatorId: hollowClay.creatorId,
      title: "Hollow Clay opens its second kiln",
      shortTitle: "Second kiln",
      category: "Clay & kiln",
      location: "Midhurst, UK",
      summary: "A second wood kiln for the Hollow Clay studio, so the waiting list for firings drops from a season to a month.",
      summaryShort: "A second wood kiln for the Hollow Clay studio.",
      story: [
        "One kiln, eleven potters, four firings a year. The second kiln doubles that, and the new wheel and extruder mean more work is ready to go in when it fires.",
      ],
      hero: "Studio kiln · 16:10",
      currency: "GBP",
      status: "live",
      launchedDaysAgo: 30,
      durationDays: 45,
      tiers: [
        { amount: 30, label: "A test bowl from the first firing", weight: 40 },
        { amount: 80, label: "A pair of wood-fired cups", weight: 40 },
        { amount: 200, label: "A serving platter", weight: 12 },
        { amount: 600, label: "A day's throwing class and your own firing", weight: 2 },
      ],
      milestones: [
        {
          label: "Tooling",
          description: "A new wheel and clay extruder bought and delivered to the studio.",
          terms: "Wheel and extruder purchased and delivered on site, photographed still boxed with the courier's delivery note.",
          amount: 9600,
          state: "submitted",
          submittedHoursAgo: 5 * 24,
          windowEndsInHours: -2 * 24,
          evidenceNote:
            "New wheel and clay extruder delivered and unboxed. Second kiln build starts once the shed floor is reinforced, covered in stage two.",
          evidence: ["Wheel, delivered", "Extruder, unboxed"],
        },
        { label: "Shed floor", description: "The shed floor reinforced to take the kiln's weight.", amount: 12000, state: "pending" },
        { label: "Kiln build", description: "The second kiln built from reclaimed firebrick.", amount: 14400, state: "pending" },
        { label: "First firing", description: "The first firing, unpacked in public.", amount: 4000, state: "pending" },
      ],
      raised: 26800,
      backers: 340,
      named: [
        { name: "Lise Hansen", location: "Bergen, Norway", amount: 80, daysAgo: 12 },
        { name: "Peter Nkemdirim", location: "Abuja, Nigeria", amount: 30, daysAgo: 14 },
      ],
      updates: [
        { title: "Wheel and extruder delivered", body: "Both arrived this week. Photos are up with the stage one evidence.", daysAgo: 5 },
      ],
    },
    {
      slug: "rootwork-winter-beds",
      creatorId: rootwork.creatorId,
      title: "Rootwork Collective's winter beds",
      shortTitle: "Winter beds",
      category: "Growing",
      location: "Sheffield, UK",
      summary: "Six raised winter beds at the Manor Fields site, so plot holders can grow through the cold months.",
      summaryShort: "Six raised winter beds at Manor Fields.",
      story: ["Soil first, then frames, then planting — so the beds are ready for the first frost."],
      hero: "Raised beds · 16:10",
      currency: "GBP",
      status: "live",
      launchedDaysAgo: 20,
      durationDays: 40,
      tiers: [
        { amount: 15, label: "A packet of saved winter seed", weight: 36 },
        { amount: 40, label: "Your name on a bed marker", weight: 44 },
        { amount: 100, label: "A winter veg box in January", weight: 16 },
        { amount: 250, label: "Sponsor a whole bed", weight: 2 },
      ],
      milestones: [
        {
          label: "Soil",
          description: "Twelve tonnes of screened topsoil delivered and spread across the six bed sites.",
          terms: "Topsoil delivered and spread across six bed sites, photographed, with the supplier's delivery note.",
          amount: 3400,
          state: "submitted",
          submittedHoursAgo: 7 * 24,
          windowEndsInHours: -4 * 24,
          evidenceNote: "Twelve tonnes of screened topsoil delivered and spread across the six new bed sites.",
          evidence: ["Soil delivery, bay 2"],
          heldDaysAgo: 3,
        },
        { label: "Frames", description: "Six raised bed frames built from reclaimed scaffold boards.", amount: 7150, state: "pending" },
        { label: "Planting", description: "The beds planted with winter crops and a frost cover fitted.", amount: 7450, state: "pending" },
      ],
      raised: 7150,
      backers: 180,
      named: [],
      updates: [{ title: "Soil is down", body: "All six beds have their soil. Frames next.", daysAgo: 6 }],
    },
    {
      slug: "kestrel-forge-kitchen-knives",
      creatorId: kestrel.creatorId,
      title: "Kestrel Forge kitchen knives",
      shortTitle: "Kestrel knives",
      category: "Craft & material",
      location: "Sheffield, UK",
      summary: "A run of hand-forged kitchen knives from reclaimed Sheffield steel, forged, ground and handled in one workshop.",
      summaryShort: "Hand-forged kitchen knives from reclaimed Sheffield steel.",
      story: ["Reclaimed steel, forged and ground by hand. Three stages: forging, grinding, then handles and dispatch."],
      hero: "Knife workshop · 16:10",
      currency: "GBP",
      status: "live",
      launchedDaysAgo: 70,
      durationDays: 60,
      tiers: [
        { amount: 95, label: "A paring knife", weight: 20 },
        { amount: 180, label: "A chef's knife", weight: 50 },
        { amount: 320, label: "A chef's and paring pair", weight: 20 },
        { amount: 900, label: "The full kitchen set", weight: 3 },
      ],
      milestones: [
        {
          label: "Forging",
          description: "All 150 blanks forged from reclaimed steel.",
          amount: 8700,
          state: "released",
          submittedHoursAgo: 44 * 24,
          releasedDaysAgo: 40,
          evidenceNote: "All blanks forged.",
          evidence: ["Blanks, forged"],
        },
        {
          label: "Grinding",
          description: "Every blade ground, heat-treated and sharpened.",
          terms: "All blades ground and heat-treated, photographed in batches, with the heat-treatment log.",
          amount: 12300,
          state: "submitted",
          submittedHoursAgo: 75,
          windowEndsInHours: -3,
          evidenceNote: "All 150 blades ground and heat-treated. Log attached.",
          evidence: ["Blades, batch one", "Blades, batch two"],
          document: "Heat-treatment log",
        },
        { label: "Handles and dispatch", description: "Handles fitted and every knife dispatched.", amount: 9000, state: "pending" },
      ],
      raised: 30600,
      backers: 150,
      named: [],
      updates: [{ title: "Grinding done", body: "Every blade is ground and heat-treated. Evidence is up for review.", daysAgo: 3 }],
    },
    {
      slug: "fast-cash-flip-fund",
      creatorId: quickFlip.creatorId,
      title: "Fast cash flip fund",
      shortTitle: "Flip fund",
      category: "Craft & material",
      location: "London, UK",
      summary: "Back our furniture flipping and get a guaranteed 40% return in ninety days.",
      summaryShort: "Guaranteed 40% return in ninety days.",
      story: ["We buy vintage furniture, flip it, and pay backers 40% on top within ninety days."],
      hero: "Furniture · 16:10",
      currency: "GBP",
      status: "live",
      launchedDaysAgo: 3,
      durationDays: 30,
      tiers: [
        { amount: 50, label: "Starter stake", weight: 50 },
        { amount: 100, label: "Standard stake", weight: 30 },
        { amount: 500, label: "Premium stake", weight: 4 },
      ],
      milestones: [],
      raised: 15200,
      backers: 230,
      named: [],
      updates: [],
    },
    {
      slug: "tidewater-oyster-beds",
      creatorId: tidewater.creatorId,
      title: "Tidewater oyster beds",
      shortTitle: "Oyster beds",
      category: "Growing",
      location: "Whitstable, UK",
      summary: "Native oyster beds restocked on the north Kent flats.",
      summaryShort: "Native oyster beds restocked.",
      story: ["The native oyster beds off Whitstable, restocked and trestled."],
      hero: "Oyster flats · 16:10",
      currency: "GBP",
      status: "failed",
      launchedDaysAgo: 80,
      durationDays: 60,
      tiers: [
        { amount: 100, label: "A dozen natives at first harvest", weight: 30 },
        { amount: 250, label: "A shucking lesson on the flats", weight: 40 },
        { amount: 500, label: "Your name on a trestle", weight: 20 },
        { amount: 1000, label: "Sponsor a whole trestle row", weight: 8 },
      ],
      milestones: [
        { label: "Seed oysters", description: "Native seed oysters bought and laid.", amount: 6000, state: "pending" },
        { label: "Trestles", description: "Trestles built across the flats.", amount: 14000, state: "pending" },
        { label: "First harvest", description: "The first native harvest.", amount: 20000, state: "pending" },
      ],
      raised: 16000,
      backers: 41,
      named: [
        { name: "Mari Wren", location: "Sheffield, UK", amount: 400, daysAgo: 60, card: "Visa ending 4021" },
        { name: "Peter Nkemdirim", location: "Abuja, Nigeria", amount: 540, daysAgo: 55, card: "Mastercard ending 7719" },
        { name: "Lise Hansen", location: "Bergen, Norway", amount: 300, daysAgo: 50, card: "Visa ending 1180" },
      ],
      updates: [],
    },
    {
      slug: "blackthorn-cider-press",
      creatorId: blackthorn.creatorId,
      title: "Blackthorn cider press",
      shortTitle: "Cider press",
      category: "Other",
      location: "Hereford, UK",
      summary: "A restored Victorian twin-screw press for a Herefordshire farmhouse cidery.",
      summaryShort: "A restored Victorian cider press.",
      story: ["A twin-screw press, restored and back in the barn for the autumn pressing."],
      hero: "Cider barn · 16:10",
      currency: "GBP",
      status: "refunded",
      launchedDaysAgo: 60,
      durationDays: 40,
      tiers: [
        { amount: 30, label: "A bottle from the first pressing", weight: 40 },
        { amount: 75, label: "A case of six", weight: 36 },
        { amount: 150, label: "A pressing-day ticket", weight: 16 },
        { amount: 400, label: "Your name on a barrel", weight: 4 },
      ],
      milestones: [
        { label: "Press restoration", description: "The press stripped and restored.", amount: 5000, state: "pending" },
        { label: "Orchard lease", description: "The orchard leased for three seasons.", amount: 4000, state: "pending" },
        { label: "First pressing", description: "The first pressing, bottled.", amount: 3000, state: "pending" },
      ],
      raised: 8400,
      backers: 96,
      named: [],
      updates: [],
    },
    {
      slug: "ferrous-press-type-foundry",
      creatorId: ferrous.creatorId,
      title: "Casting a new Irish type foundry",
      shortTitle: "Type foundry",
      category: "Type & print",
      location: "Cork, Ireland",
      summary: "A working type foundry in Cork, casting metal type for Ireland's small presses.",
      summaryShort: "A working type foundry in Cork.",
      story: ["Ireland has no working type foundry. This builds one."],
      hero: "Type foundry · 16:10",
      currency: "EUR",
      status: "draft",
      launchedDaysAgo: null,
      durationDays: 45,
      tiers: [
        { amount: 50, label: "A cast sort in your initial", weight: 1 },
        { amount: 250, label: "A full case of cast type", weight: 1 },
      ],
      milestones: [
        { label: "Caster", description: "A Monotype caster bought and restored.", amount: 20000, state: "pending" },
        { label: "Matrices", description: "The first two faces' matrices sourced.", amount: 15000, state: "pending" },
        { label: "First fount", description: "The first fount cast and cased.", amount: 10000, state: "pending" },
      ],
      raised: 0,
      backers: 0,
      named: [],
      updates: [],
    },
    {
      slug: "salt-marsh-weaving-house",
      creatorId: saltMarsh.creatorId,
      title: "A weaving house for Lamu's mat makers",
      shortTitle: "Weaving house",
      category: "Craft & material",
      location: "Lamu, Kenya",
      summary: "A shaded weaving house so Lamu's doum palm mat makers can work through the heat of the day.",
      summaryShort: "A weaving house for Lamu's mat makers.",
      story: ["Twenty weavers, no shade. This builds them a weaving house."],
      hero: "Weaving house · 16:10",
      currency: "USD",
      status: "draft",
      launchedDaysAgo: null,
      durationDays: 40,
      tiers: [{ amount: 40, label: "A woven doum palm mat", weight: 1 }],
      milestones: [
        { label: "Foundations", description: "Foundations laid on the plot.", amount: 7000, state: "pending" },
        { label: "Roof", description: "The makuti roof raised.", amount: 9000, state: "pending" },
        { label: "Fit-out", description: "Looms and storage fitted.", amount: 6000, state: "pending" },
      ],
      raised: 0,
      backers: 0,
      named: [],
      updates: [],
    },
    {
      slug: "ninefold-bindery-workshop",
      creatorId: ninefold.creatorId,
      title: "A hand-bindery for Lagos's small presses",
      shortTitle: "Lagos bindery",
      category: "Type & print",
      location: "Lagos, Nigeria",
      summary: "A hand-bindery in Yaba so Lagos's independent publishers can bind locally.",
      summaryShort: "A hand-bindery in Yaba.",
      story: ["Lagos's small presses send their books abroad to be bound. This keeps them home."],
      hero: "Bindery · 16:10",
      currency: "NGN",
      status: "draft",
      launchedDaysAgo: null,
      durationDays: 30,
      tiers: [{ amount: 35, label: "A hand-bound notebook", weight: 1 }],
      milestones: [
        { label: "Equipment", description: "Presses, a guillotine and a sewing frame.", amount: 10000, state: "pending" },
        { label: "Training", description: "Two apprentices trained for six months.", amount: 8000, state: "pending" },
      ],
      raised: 0,
      backers: 0,
      named: [],
      updates: [],
    },
  ];

  const campaignIds = new Map<string, number>();
  const milestoneIds = new Map<string, number[]>();
  const pledgeIds = new Map<string, { id: number; name: string; amount: number; synthetic: boolean }[]>();
  const creatorAccount = new Map<number, string>([
    [hausa.creatorId, "Zenith Bank · ending 8841"],
    [bryn.creatorId, "Monzo Business · ending 2207"],
    [rootwork.creatorId, "Co-operative Bank · ending 6614"],
    [ridgeway.creatorId, "Barclays · ending 1093"],
    [hollowClay.creatorId, "Starling · ending 5520"],
    [kestrel.creatorId, "Lloyds · ending 3381"],
    [tidewater.creatorId, "NatWest · ending 9902"],
    [blackthorn.creatorId, "HSBC · ending 3027"],
  ]);

  for (const c of campaigns) {
    const launchedAt = c.launchedDaysAgo != null ? daysAgo(c.launchedDaysAgo) : null;
    const endsAt = launchedAt != null ? launchedAt + c.durationDays * DAY : null;
    const campaignId = insert(
      `INSERT INTO campaigns (slug, creator_id, title, short_title, category, location, summary, summary_short, story,
         hero_caption, currency, goal, status, duration_days, launched_at, ends_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      c.slug,
      c.creatorId,
      c.title,
      c.shortTitle,
      c.category,
      c.location,
      c.summary,
      c.summaryShort,
      JSON.stringify(c.story),
      c.hero,
      c.currency,
      c.milestones.reduce((s, m) => s + m.amount, 0) || 50000,
      c.status,
      c.durationDays,
      launchedAt,
      endsAt,
      (launchedAt ?? now) - 5 * DAY,
    );
    campaignIds.set(c.slug, campaignId);

    const tierIds = c.tiers.map((t, i) =>
      insert(
        "INSERT INTO tiers (campaign_id, position, amount, label, stock) VALUES (?, ?, ?, ?, ?)",
        campaignId,
        i + 1,
        t.amount,
        t.label,
        t.stock ?? null,
      ),
    );

    const ids: number[] = [];
    c.milestones.forEach((m, i) => {
      const submittedAt = m.submittedHoursAgo != null ? hoursAgo(m.submittedHoursAgo) : null;
      const windowEnds =
        m.windowEndsInHours != null
          ? hoursFromNow(m.windowEndsInHours)
          : submittedAt != null
            ? submittedAt + 72 * HOUR
            : null;
      const releasedAt = m.releasedDaysAgo != null ? daysAgo(m.releasedDaysAgo) : null;
      const id = insert(
        `INSERT INTO milestones (campaign_id, position, label, description, terms, amount, state, due_at, evidence_note,
           evidence, evidence_document, submitted_at, window_ends_at, held_by, held_at, released_at, refunded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        campaignId,
        i + 1,
        m.label,
        m.description,
        m.terms ?? `${m.description} Evidenced with photographs and a receipt.`,
        m.amount,
        m.state,
        m.dueInDays != null ? now + m.dueInDays * DAY : null,
        m.evidenceNote ?? "",
        JSON.stringify(m.evidence ?? []),
        m.document ?? null,
        submittedAt,
        windowEnds,
        m.heldDaysAgo != null ? ruth : null,
        m.heldDaysAgo != null ? daysAgo(m.heldDaysAgo) : null,
        releasedAt,
        m.refundedHoursAgo != null ? hoursAgo(m.refundedHoursAgo) : null,
      );
      ids.push(id);
      if (releasedAt != null) {
        const fee = Math.round(m.amount * 0.05);
        insert(
          "INSERT INTO payouts (milestone_id, gross, fee, net, account, released_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
          id,
          m.amount,
          fee,
          m.amount - fee,
          creatorAccount.get(c.creatorId) ?? "Payout account",
          releasedAt,
          releasedAt + 2 * DAY,
        );
      }
    });
    milestoneIds.set(c.slug, ids);

    // Backers: the named ones first, then generated ones spread across the funding window.
    const rand = prng(hashString(c.slug));
    const list: { id: number; name: string; amount: number; synthetic: boolean }[] = [];
    const tierIndexFor = (amount: number) => c.tiers.findIndex((t) => t.amount === amount);
    for (const n of c.named) {
      const idx = tierIndexFor(n.amount);
      const id = insert(
        `INSERT INTO pledges (campaign_id, user_id, tier_id, backer_name, backer_location, amount, card_label, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        campaignId,
        n.userId ?? null,
        idx >= 0 ? tierIds[idx] : null,
        n.name,
        n.location,
        n.amount,
        n.card ?? null,
        daysAgo(n.daysAgo),
      );
      list.push({ id, name: n.name, amount: n.amount, synthetic: false });
    }
    const syntheticCount = c.backers - c.named.length;
    const syntheticTotal = c.raised - c.named.reduce((s, n) => s + n.amount, 0);
    if (syntheticCount > 0 && launchedAt != null) {
      const windowStart = launchedAt;
      const newestNamed = c.named.length ? Math.min(...c.named.map((n) => n.daysAgo)) : 0;
      const windowEnd = Math.min(endsAt ?? now, daysAgo(Math.max(newestNamed, 0.5)));
      // Named backers already hold some of each limited tier's places.
      const tiersLeft = c.tiers.map((t) => ({
        ...t,
        stock: t.stock != null ? t.stock - c.named.filter((n) => n.amount === t.amount).length : undefined,
      }));
      const amounts = distributePledges(rand, syntheticCount, syntheticTotal, tiersLeft);
      const usedNames = new Set(c.named.map((n) => n.name));
      amounts.forEach((p) => {
        let name = "";
        for (let tries = 0; tries < 20; tries++) {
          name = `${FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]}`;
          if (!usedNames.has(name)) break;
        }
        usedNames.add(name);
        const createdAt = Math.round(windowStart + Math.pow(rand(), 0.8) * (windowEnd - windowStart));
        const id = insert(
          `INSERT INTO pledges (campaign_id, tier_id, backer_name, backer_location, amount, card_label, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          campaignId,
          p.tierIndex != null ? tierIds[p.tierIndex] : null,
          name,
          LOCATIONS[Math.floor(rand() * LOCATIONS.length)],
          p.amount,
          `${rand() < 0.6 ? "Visa" : "Mastercard"} ending ${String(1000 + Math.floor(rand() * 9000))}`,
          createdAt,
        );
        list.push({ id, name, amount: p.amount, synthetic: true });
      });
    }
    pledgeIds.set(c.slug, list);

    c.updates.forEach((u) =>
      insert(
        "INSERT INTO updates (campaign_id, title, body, created_at) VALUES (?, ?, ?, ?)",
        campaignId,
        u.title,
        u.body,
        daysAgo(u.daysAgo),
      ),
    );
  }

  /* ---------------------------------------------------------------- */
  /* Disputes and the donor objections behind them                    */
  /* ---------------------------------------------------------------- */

  const pledgeOf = (slug: string, name: string) => pledgeIds.get(slug)!.find((p) => p.name === name)!.id;
  const syntheticPledges = (slug: string, n: number) =>
    pledgeIds
      .get(slug)!
      .filter((p) => p.synthetic)
      .slice(0, n);

  const dispute = (d: {
    code: string;
    slug: string;
    stage: number;
    status: "new" | "in_review" | "awaiting_creator" | "resolved";
    assignee: number | null;
    openedHoursAgo: number;
    complaints: { name: string; note: string }[];
    extra: number;
    extraNotes: string[];
    response?: { note: string; hoursAgo: number };
    resolution?: { decision: "release" | "refund"; by: number; hoursAgo: number; reason: string };
  }) => {
    const milestoneId = milestoneIds.get(d.slug)![d.stage - 1];
    const openedAt = hoursAgo(d.openedHoursAgo);
    const disputeId = insert(
      `INSERT INTO disputes (code, milestone_id, status, assignee_id, opened_at, deadline_at, creator_response,
         creator_response_at, decision, decided_by, decided_at, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      d.code,
      milestoneId,
      d.status,
      d.assignee,
      openedAt,
      openedAt + 5 * DAY,
      d.response?.note ?? null,
      d.response ? hoursAgo(d.response.hoursAgo) : null,
      d.resolution?.decision ?? null,
      d.resolution?.by ?? null,
      d.resolution ? hoursAgo(d.resolution.hoursAgo) : null,
      d.resolution?.reason ?? null,
    );
    d.complaints.forEach((c, i) =>
      insert(
        "INSERT INTO milestone_reviews (milestone_id, pledge_id, decision, note, created_at) VALUES (?, ?, 'dispute', ?, ?)",
        milestoneId,
        pledgeOf(d.slug, c.name),
        c.note,
        openedAt + i * 20 * 60_000,
      ),
    );
    syntheticPledges(d.slug, d.extra).forEach((p, i) =>
      insert(
        "INSERT INTO milestone_reviews (milestone_id, pledge_id, decision, note, created_at) VALUES (?, ?, 'dispute', ?, ?)",
        milestoneId,
        p.id,
        d.extraNotes[i % d.extraNotes.length],
        openedAt + (i + 2) * 45 * 60_000,
      ),
    );
    return disputeId;
  };

  dispute({
    code: "D-1191",
    slug: "kofar-mata-indigo-dye-pits",
    stage: 2,
    status: "in_review",
    assignee: tomi,
    openedHoursAgo: 50,
    complaints: [
      {
        name: "Joseph Okonkwo",
        note: "The before photograph is the same pit as the after photograph, taken from a different angle. Only one pit is actually shown lined.",
      },
      {
        name: "Mari Wren",
        note: "Terms say thirty pits. The receipt covers mortar for about twelve. Asking for the rest of the receipts before this releases.",
      },
    ],
    extra: 2,
    extraNotes: ["Same objection — the before photo looks like the same pit as the after photo."],
    response: {
      note: "The two receipts we hold cover the whole batch — the second was paid in cash at the potash market and we have the seller's book, photographed. Adding it now. The before image is pit 9, not pit 14. Reshooting today.",
      hoursAgo: 26,
    },
  });
  dispute({
    code: "D-1179",
    slug: "welsh-letterpress-revival",
    stage: 2,
    status: "in_review",
    assignee: tomi,
    openedHoursAgo: 5 * 24 - 3,
    complaints: [
      {
        name: "Tunde Musa",
        note: "Terms say a supplier receipt for the stitcher. What's attached is a delivery note with no price on it — that's not a receipt.",
      },
      {
        name: "Ruth Adebayo",
        note: "Agree with Tunde. Also this milestone was meant to include the guillotine, not just the stitcher — the update three weeks ago mentioned both.",
      },
    ],
    extra: 59,
    extraNotes: [
      "The receipt is a delivery note with no price on it.",
      "The guillotine was meant to be part of this stage.",
    ],
    response: {
      note: "You're right that it's a delivery note — the invoice follows 30 days from the supplier, standard for them. The guillotine is in stage three, not this one; the update was about ordering it, not receiving it. Sorry that read as included here.",
      hoursAgo: 4 * 24,
    },
  });
  dispute({
    code: "D-1184",
    slug: "restoring-the-cowdray-kiln",
    stage: 2,
    status: "resolved",
    assignee: ruth,
    openedHoursAgo: 16 * 24,
    complaints: [
      {
        name: "Sarah Kessler",
        note: "No fitter's invoice attached, only the two photos. Terms specifically call for an invoice — this was already asked for once in the comments and never added.",
      },
      {
        name: "David Okafor",
        note: "The after photo shows the same crack visible in an earlier update, just from a different angle. Doesn't look relined to me.",
      },
    ],
    extra: 36,
    extraNotes: ["No fitter's invoice attached, same as the others have said."],
    response: {
      note: "The invoice is with our bookkeeper this week, will add by Friday. The crack in the photo is cosmetic, in the old brick we left in place around the door frame, not the relined section.",
      hoursAgo: 15 * 24,
    },
    resolution: {
      decision: "refund",
      by: ruth,
      hoursAgo: 9,
      reason: "Dispute upheld. Kiln lining not evidenced after two requests — no fitter's invoice was ever added.",
    },
  });
  dispute({
    code: "D-1188",
    slug: "hollow-clay-second-kiln",
    stage: 1,
    status: "awaiting_creator",
    assignee: null,
    openedHoursAgo: 60,
    complaints: [
      {
        name: "Lise Hansen",
        note: "Both photos look staged in what could be any workshop — nothing in frame ties this to the studio specifically. Would like a wider shot showing the actual location.",
      },
      {
        name: "Peter Nkemdirim",
        note: "Same concern as Lise. This creator already had a dispute upheld on a different campaign — asking for more care here before this releases.",
      },
    ],
    extra: 10,
    extraNotes: ["Would like a wider photo that shows the actual site."],
  });
  dispute({
    code: "D-1176",
    slug: "urban-allotment-seed-library",
    stage: 2,
    status: "resolved",
    assignee: ruth,
    openedHoursAgo: 19.5 * 24,
    complaints: [
      {
        name: "Sarah Kessler",
        note: "Counted the shelving photo myself and got sixty-two varieties, not eighty. Asking for the full list before this releases.",
      },
    ],
    extra: 0,
    extraNotes: [],
    response: {
      note: "You're right that the shelf only shows sixty-two — the rest are in a second cupboard, out of frame. Adding a photo of the full set and the paper index today.",
      hoursAgo: 19 * 24,
    },
    resolution: {
      decision: "release",
      by: ruth,
      hoursAgo: 18 * 24,
      reason: "Full catalogue and second-cupboard photo added within a day, count matches the terms. Dispute closed as unfounded.",
    },
  });

  /* ---------------------------------------------------------------- */
  /* Refunds                                                          */
  /* ---------------------------------------------------------------- */

  const batch = (code: string, slug: string, reason: string, status: "queued" | "settled", createdAt: number, settledAt: number | null) =>
    insert(
      "INSERT INTO refund_batches (code, campaign_id, reason, status, created_at, settled_at) VALUES (?, ?, ?, ?, ?, ?)",
      code,
      campaignIds.get(slug)!,
      reason,
      status,
      createdAt,
      settledAt,
    );

  // Blackthorn withdrew: every backer refunded in full, settled two weeks ago.
  const blackthornBatch = batch("R-0409", "blackthorn-cider-press", "Creator withdrew", "settled", daysAgo(15), daysAgo(14));
  for (const p of pledgeIds.get("blackthorn-cider-press")!) {
    insert(
      "INSERT INTO refunds (batch_id, pledge_id, amount, status, paid_at) VALUES (?, ?, ?, 'paid', ?)",
      blackthornBatch,
      p.id,
      p.amount,
      daysAgo(14),
    );
  }

  // Tidewater missed its goal: refunds ran, three cards bounced.
  const tidewaterBatch = batch("R-0410", "tidewater-oyster-beds", "Goal not met", "queued", daysAgo(12), null);
  const failures: Record<string, [string, string]> = {
    "Mari Wren": ["Card expired", "Request new card"],
    "Peter Nkemdirim": ["Account closed", "Pay by transfer"],
    "Lise Hansen": ["Issuer declined", "Retry"],
  };
  for (const p of pledgeIds.get("tidewater-oyster-beds")!) {
    const failure = failures[p.name];
    insert(
      "INSERT INTO refunds (batch_id, pledge_id, amount, status, failure_reason, failure_action, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      tidewaterBatch,
      p.id,
      p.amount,
      failure ? "failed" : "paid",
      failure?.[0] ?? null,
      failure?.[1] ?? null,
      failure ? null : daysAgo(11),
    );
  }

  // Cowdray's lining stage was refunded when D-1184 was upheld this morning: queued, not yet run.
  const cowdray = campaigns.find((c) => c.slug === "restoring-the-cowdray-kiln")!;
  const cowdrayBatch = batch("R-0411", cowdray.slug, "Milestone failed", "queued", hoursAgo(9), null);
  for (const p of pledgeIds.get(cowdray.slug)!) {
    insert(
      "INSERT INTO refunds (batch_id, pledge_id, amount, status) VALUES (?, ?, ?, 'queued')",
      cowdrayBatch,
      p.id,
      Math.round((p.amount * 16000) / cowdray.raised),
    );
  }

  /* ---------------------------------------------------------------- */
  /* Identity, moderation, follows, audit                             */
  /* ---------------------------------------------------------------- */

  const docs = (submitted: number, overrides?: { label: string; meta: string }[]) => {
    const base = overrides ?? [
      { label: "Photo ID", meta: "Government-issued ID" },
      { label: "Address proof", meta: "Utility bill or bank statement" },
      { label: "Bank statement", meta: "Needed to match the payout account" },
    ];
    return JSON.stringify(base.map((d, i) => ({ ...d, submitted: i < submitted })));
  };
  const clearChecks = (last: { label: string; variant: string }) =>
    JSON.stringify([
      { label: "Sanctions list · clear", variant: "neutral" },
      { label: "Document forgery · clear", variant: "neutral" },
      last,
    ]);

  insert(
    "INSERT INTO identity_checks (creator_id, status, documents, checks, submitted_at) VALUES (?, ?, ?, ?, ?)",
    kestrel.creatorId,
    "incomplete",
    docs(2, [
      { label: "Photo ID", meta: "Passport · expires 2031" },
      { label: "Address proof", meta: "Utility bill · last month" },
      { label: "Bank statement", meta: "Needed to match the payout account" },
    ]),
    JSON.stringify([
      { label: "Sanctions list · clear", variant: "neutral" },
      { label: "Document forgery · clear", variant: "neutral" },
      { label: "Name match · clear", variant: "neutral" },
      { label: "Payout name mismatch", variant: "warning" },
    ]),
    daysAgo(2),
  );
  insert(
    "INSERT INTO identity_checks (creator_id, status, documents, checks, submitted_at) VALUES (?, ?, ?, ?, ?)",
    ferrous.creatorId,
    "ready",
    docs(3),
    clearChecks({ label: "Name match · clear", variant: "neutral" }),
    daysAgo(1),
  );
  insert(
    "INSERT INTO identity_checks (creator_id, status, documents, checks, submitted_at) VALUES (?, ?, ?, ?, ?)",
    saltMarsh.creatorId,
    "resubmitted",
    docs(3),
    clearChecks({ label: "Resubmitted after rejection", variant: "outline" }),
    hoursAgo(6),
  );
  insert(
    "INSERT INTO identity_checks (creator_id, status, documents, checks, submitted_at) VALUES (?, ?, ?, ?, ?)",
    ninefold.creatorId,
    "incomplete",
    docs(1),
    clearChecks({ label: "Name match · clear", variant: "neutral" }),
    hoursAgo(5),
  );
  insert(
    "INSERT INTO identity_checks (creator_id, status, documents, checks, submitted_at, decided_at, decided_by, note) VALUES (?, 'verified', ?, ?, ?, ?, ?, ?)",
    rootwork.creatorId,
    docs(3),
    clearChecks({ label: "Name match · clear", variant: "neutral" }),
    daysAgo(10),
    daysAgo(9),
    tomi,
    "Three documents on file, all checks clear, payout name matches.",
  );

  const report = (slug: string, reason: string, details: string, hoursOld: number) =>
    insert(
      "INSERT INTO reports (campaign_id, campaign_text, reason, details, status, created_at) VALUES (?, ?, ?, ?, 'open', ?)",
      campaignIds.get(slug)!,
      slug,
      reason,
      details,
      hoursAgo(hoursOld),
    );
  const flip = "fast-cash-flip-fund";
  [8, 7, 6.5, 5, 4, 3, 1].forEach((h) => report(flip, "Not a real project", "No milestones, no location, no real project described.", h));
  [6, 4.5, 2].forEach((h) => report(flip, "Financial return promised", "Promises a 40% return in ninety days.", h));
  report(flip, "Imagery not the creator's own", "The hero photo is a stock image.", 3.5);
  [48, 30, 12].forEach((h) =>
    report("hollow-clay-second-kiln", "Misleading photos or claims", "The evidence photos could be from any workshop.", h),
  );

  for (const creatorId of [hausa.creatorId, rootwork.creatorId, bryn.creatorId, ridgeway.creatorId]) {
    insert("INSERT INTO follows (user_id, creator_id, created_at) VALUES (?, ?, ?)", amina, creatorId, daysAgo(30));
  }

  const TOMI_IP = "102.89.4.17";
  const RUTH_IP = "102.89.4.22";
  const audit = (
    at: number,
    actor: number | null,
    actorName: string,
    action: string,
    target: string,
    reason: string,
    amount: number | null,
    source: string,
  ) =>
    insert(
      "INSERT INTO audit_log (at, actor_id, actor_name, action, target, reason, amount, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      at,
      actor,
      actorName,
      action,
      target,
      reason,
      amount,
      source,
    );

  audit(daysAgo(80), tomi, "Tomi Musa", "Release", "Ridgeway signal box restoration · milestone 01", "Window closed with no disputes. Survey report complete against terms.", 18000, TOMI_IP);
  audit(daysAgo(70), ruth, "Ruth Ade", "Release", "Restoring the Cowdray kiln · milestone 01", "Window closed with no disputes.", 4000, RUTH_IP);
  audit(daysAgo(52), tomi, "Tomi Musa", "Release", "Ridgeway signal box restoration · milestone 02", "Window closed with no disputes.", 52000, TOMI_IP);
  audit(daysAgo(40), null, "System", "Release", "Seed library for urban allotments · milestone 01", "Automatic release. 72-hour window closed with no disputes.", 3200, "internal");
  audit(daysAgo(40), tomi, "Tomi Musa", "Release", "Kestrel Forge kitchen knives · milestone 01", "Window closed with no disputes.", 8700, TOMI_IP);
  audit(daysAgo(36), tomi, "Tomi Musa", "Release", "Rebuilding the indigo dye pits at Kofar Mata · milestone 01", "Window closed with no disputes. Survey report attached.", 9000, TOMI_IP);
  audit(daysAgo(30), ruth, "Ruth Ade", "Release", "A letterpress revival in the Welsh valleys · milestone 01", "Window closed with no disputes.", 18000, RUTH_IP);
  audit(daysAgo(24), null, "System", "Release", "Ridgeway signal box restoration · milestone 03", "Automatic release. 72-hour window closed with no disputes.", 36400, "internal");
  audit(daysAgo(18), ruth, "Ruth Ade", "Release", "Seed library for urban allotments · milestone 02 · case D-1176", "Full catalogue and second-cupboard photo added within a day, count matches the terms. Dispute closed as unfounded.", 5000, RUTH_IP);
  audit(daysAgo(14), ruth, "Ruth Ade", "Refund", "Blackthorn cider press · batch R-0409", "Creator withdrew before any stage released. Settled in full.", 8400, RUTH_IP);
  audit(daysAgo(12), tomi, "Tomi Musa", "Refund", "Tidewater oyster beds · batch R-0410", "Goal not met at close. Refunds run; three cards failed.", 16000, TOMI_IP);
  audit(daysAgo(10), ruth, "Ruth Ade", "Account", "Bryn Evans · two-factor reset", "Identity confirmed by video call. Recovery codes reissued.", null, RUTH_IP);
  audit(daysAgo(9), tomi, "Tomi Musa", "Identity", "Rootwork Collective · verified", "Three documents on file, all checks clear, payout name matches.", null, TOMI_IP);
  audit(daysAgo(9), tomi, "Tomi Musa", "Release", "Ridgeway signal box restoration · milestone 04", "Window closed with no disputes. Evidence complete against terms.", 38000, TOMI_IP);
  audit(daysAgo(3), ruth, "Ruth Ade", "Hold", "Rootwork Collective's winter beds · milestone 01", "Held pending the soil supplier's delivery note.", 3400, RUTH_IP);
  audit(hoursAgo(9), ruth, "Ruth Ade", "Refund", "Restoring the Cowdray kiln · milestone 02 · case D-1184", "Dispute upheld. Kiln lining not evidenced after two requests — no fitter's invoice was ever added.", 16000, RUTH_IP);
  audit(hoursAgo(3), null, "System", "Hold", "Kestrel Forge kitchen knives · milestone 02", "Automatic hold. Identity documents older than 12 months.", 12300, "internal");
}

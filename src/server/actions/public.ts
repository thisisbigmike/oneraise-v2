"use server";

import { revalidatePath } from "next/cache";
import { get, run } from "../db";
import { getViewer } from "../auth";
import { acceptsPledges, campaignBySlug } from "../domain";
import { usd } from "@/lib/format";
import type { ActionState } from "@/lib/view-models";

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createPledge(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in to place a pledge." };
  const c = campaignBySlug(text(formData.get("campaign")));
  if (!c) return { error: "That campaign no longer exists." };
  if (!acceptsPledges(c)) return { error: "This campaign isn't taking pledges right now." };
  if (viewer.creatorId != null && viewer.creatorId === c.creator_id) {
    return { error: "You can't pledge to your own campaign." };
  }
  const tierId = Number(formData.get("tier"));
  const tier = get<{ id: number; amount: number; stock: number | null; taken: number }>(
    `SELECT t.id, t.amount, t.stock, (SELECT COUNT(*) FROM pledges p WHERE p.tier_id = t.id) AS taken
     FROM tiers t WHERE t.id = ? AND t.campaign_id = ?`,
    tierId,
    c.id,
  );
  if (!tier) return { error: "Choose an amount first." };
  if (tier.stock != null && tier.taken >= tier.stock) return { error: "That tier has just sold out. Choose another." };

  const user = get<{ name: string; country: string; card_label: string | null }>(
    "SELECT name, country, card_label FROM users WHERE id = ?",
    viewer.id,
  )!;
  run(
    `INSERT INTO pledges (campaign_id, user_id, tier_id, backer_name, backer_location, amount, card_label, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    c.id,
    viewer.id,
    tier.id,
    user.name,
    user.country,
    tier.amount,
    user.card_label,
    Date.now(),
  );
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: `Your ${usd(tier.amount)} pledge to ${c.title} is in. It's charged when funding closes and released one stage at a time.`,
  };
}

export async function toggleFollow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in to follow creators." };
  const creatorId = Number(formData.get("creator"));
  if (!get("SELECT 1 FROM creators WHERE id = ?", creatorId)) return { error: "That creator no longer exists." };
  const following = get("SELECT 1 FROM follows WHERE user_id = ? AND creator_id = ?", viewer.id, creatorId) != null;
  if (following) run("DELETE FROM follows WHERE user_id = ? AND creator_id = ?", viewer.id, creatorId);
  else run("INSERT INTO follows (user_id, creator_id, created_at) VALUES (?, ?, ?)", viewer.id, creatorId, Date.now());
  revalidatePath("/", "layout");
  return { ok: true, message: following ? "Unfollowed." : "Following." };
}

const TOPICS = [
  "A pledge or donation",
  "A campaign I'm running",
  "A dispute or milestone review",
  "My account",
  "Something else",
];

export async function sendContactMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  const name = text(formData.get("name"));
  const email = text(formData.get("email")).toLowerCase();
  const topic = text(formData.get("topic"));
  const message = text(formData.get("message"));
  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Tell us your name.";
  if (!EMAIL.test(email)) fieldErrors.email = "Enter an email we can reply to.";
  if (!TOPICS.includes(topic)) fieldErrors.topic = "Choose a topic.";
  if (message.length < 10) fieldErrors.message = "Tell us a little more so we can help.";
  if (message.length > 5000) fieldErrors.message = "Keep it under 5,000 characters.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  run(
    "INSERT INTO contact_messages (user_id, name, email, topic, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    viewer?.id ?? null,
    name,
    email,
    topic,
    message,
    Date.now(),
  );
  return { ok: true };
}

/** The monthly escrow note. Subscribing twice is not an error. */
export async function subscribeToNewsletter(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  const email = text(formData.get("email")).toLowerCase();
  if (!EMAIL.test(email)) return { error: "Enter an email address we can send it to." };
  const existing = get<{ id: number }>("SELECT id FROM newsletter_subscribers WHERE email = ?", email);
  if (existing) {
    run("UPDATE newsletter_subscribers SET unsubscribed_at = NULL, user_id = COALESCE(user_id, ?) WHERE id = ?", viewer?.id ?? null, existing.id);
  } else {
    run(
      "INSERT INTO newsletter_subscribers (email, user_id, created_at) VALUES (?, ?, ?)",
      email,
      viewer?.id ?? null,
      Date.now(),
    );
  }
  return { ok: true, message: `Subscribed. The next monthly note goes to ${email}.` };
}

const REASONS = [
  "Not a real project",
  "Financial return promised",
  "Misleading photos or claims",
  "Imagery not the creator's own",
  "Something else",
];

/** Accepts a campaign URL, slug or title and returns the matching campaign id, if any. */
function matchCampaign(input: string): number | null {
  const slug = input.match(/campaigns\/([a-z0-9-]+)/i)?.[1] ?? input.trim().toLowerCase();
  const bySlug = get<{ id: number }>("SELECT id FROM campaigns WHERE slug = ?", slug);
  if (bySlug) return bySlug.id;
  const byTitle = get<{ id: number }>("SELECT id FROM campaigns WHERE title = ? COLLATE NOCASE", input.trim());
  if (byTitle) return byTitle.id;
  const fuzzy = get<{ id: number }>("SELECT id FROM campaigns WHERE title LIKE ? AND status != 'draft' LIMIT 1", `%${input.trim()}%`);
  return fuzzy?.id ?? null;
}

export async function reportCampaign(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  const campaign = text(formData.get("campaign"));
  const reason = text(formData.get("reason"));
  const details = text(formData.get("details"));
  const fieldErrors: Record<string, string> = {};
  if (campaign.length < 3) fieldErrors.campaign = "Name the campaign or paste its link.";
  if (!REASONS.includes(reason)) fieldErrors.reason = "Choose a reason.";
  if (details.length < 10) fieldErrors.details = "Say what you noticed — the more specific, the faster we can act.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  run(
    "INSERT INTO reports (campaign_id, campaign_text, reason, details, reporter_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    matchCampaign(campaign),
    campaign,
    reason,
    details,
    viewer?.id ?? null,
    Date.now(),
  );
  revalidatePath("/admin", "layout");
  return { ok: true };
}

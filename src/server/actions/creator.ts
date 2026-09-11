"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { all, get, run, tx } from "../db";
import { getViewer } from "../auth";
import { OPEN_DISPUTE, REVIEW_WINDOW, campaignById, launchCampaign, type MilestoneRow } from "../domain";
import { ACTIVE_CAMPAIGN_COOKIE } from "../queries/creator";
import { initialsOf, stageNumber, usd } from "@/lib/format";
import type { ActionState, Viewer } from "@/lib/view-models";

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

class Refusal extends Error {}

async function creatorViewer(): Promise<Viewer & { creatorId: number }> {
  const viewer = await getViewer();
  if (!viewer || viewer.creatorId == null) throw new Refusal("Sign in with your creator account to do that.");
  return viewer as Viewer & { creatorId: number };
}

/** A milestone the signed-in creator owns — or a refusal. */
function ownMilestone(viewer: { creatorId: number }, milestoneId: number): MilestoneRow {
  const m = get<MilestoneRow & { creator_id: number }>(
    "SELECT m.*, c.creator_id FROM milestones m JOIN campaigns c ON c.id = m.campaign_id WHERE m.id = ?",
    milestoneId,
  );
  if (!m || m.creator_id !== viewer.creatorId) throw new Refusal("That stage isn't one of yours.");
  return m;
}

async function guarded(fn: () => Promise<ActionState> | ActionState): Promise<ActionState> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Refusal) return { error: error.message };
    throw error;
  }
}

function evidenceList(m: MilestoneRow): string[] {
  try {
    return JSON.parse(m.evidence) as string[];
  } catch {
    return [];
  }
}

function refreshCreator() {
  revalidatePath("/", "layout");
}

export async function saveStageDraft(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const viewer = await creatorViewer();
    const m = ownMilestone(viewer, Number(formData.get("milestone")));
    if (m.state !== "current") return { error: "Only a stage in progress can be edited." };
    const note = text(formData.get("note")).slice(0, 600);
    run("UPDATE milestones SET evidence_note = ? WHERE id = ?", note, m.id);
    refreshCreator();
    return { ok: true, message: "Draft saved." };
  });
}

export async function addEvidence(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const viewer = await creatorViewer();
    const m = ownMilestone(viewer, Number(formData.get("milestone")));
    if (m.state !== "current") return { error: "Evidence can only be added while the stage is in progress." };
    const kind = formData.get("kind") === "document" ? "document" : "photo";
    const caption = text(formData.get("caption")).slice(0, 80);
    if (caption.length < 3) return { fieldErrors: { caption: "Describe what it shows, e.g. “Pit 16, after”." } };
    if (kind === "document") {
      run("UPDATE milestones SET evidence_document = ? WHERE id = ?", caption, m.id);
    } else {
      const list = evidenceList(m);
      if (list.length >= 8) return { error: "Eight photos is the limit for one stage." };
      run("UPDATE milestones SET evidence = ? WHERE id = ?", JSON.stringify([...list, caption]), m.id);
    }
    refreshCreator();
    return { ok: true };
  });
}

export async function removeEvidence(formData: FormData): Promise<void> {
  const viewer = await creatorViewer();
  const m = ownMilestone(viewer, Number(formData.get("milestone")));
  if (m.state !== "current") return;
  if (formData.get("kind") === "document") {
    run("UPDATE milestones SET evidence_document = NULL WHERE id = ?", m.id);
  } else {
    const index = Number(formData.get("index"));
    run("UPDATE milestones SET evidence = ? WHERE id = ?", JSON.stringify(evidenceList(m).filter((_, i) => i !== index)), m.id);
  }
  refreshCreator();
}

/** Put the stage in front of donors: the 72-hour dispute window opens now. */
export async function submitStage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const viewer = await creatorViewer();
    const m = ownMilestone(viewer, Number(formData.get("milestone")));
    if (m.state !== "current") return { error: "This stage has already been submitted." };
    const note = text(formData.get("note")) || m.evidence_note;
    if (note.length < 20) return { fieldErrors: { note: "Write donors a note of at least a sentence about what was done." } };
    if (evidenceList(m).length === 0) return { error: "Attach at least one evidence photo before submitting." };
    const c = campaignById(m.campaign_id)!;
    const now = Date.now();
    tx(() => {
      run(
        "UPDATE milestones SET state = 'submitted', evidence_note = ?, submitted_at = ?, window_ends_at = ? WHERE id = ?",
        note.slice(0, 600),
        now,
        now + REVIEW_WINDOW,
        m.id,
      );
      run(
        "INSERT INTO updates (campaign_id, title, body, created_at) VALUES (?, ?, ?, ?)",
        c.id,
        `${m.label} evidence submitted`,
        `Stage ${stageNumber(m.position)} is up for review. ${note.slice(0, 280)} The dispute window closes in 72 hours; ${usd(m.amount)} releases if nobody objects.`,
        now,
      );
    });
    refreshCreator();
    return { ok: true, message: `Submitted. ${c.backers} donors can now review it for 72 hours.` };
  });
}

/** Pull a submission back to draft; its reviews and any open case are cleared. */
export async function withdrawStage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const viewer = await creatorViewer();
    const m = ownMilestone(viewer, Number(formData.get("milestone")));
    if (m.state !== "submitted") return { error: "Only a submitted stage can be withdrawn." };
    const now = Date.now();
    tx(() => {
      run("UPDATE milestones SET state = 'current', submitted_at = NULL, window_ends_at = NULL, held_by = NULL, held_at = NULL WHERE id = ?", m.id);
      run("DELETE FROM milestone_reviews WHERE milestone_id = ?", m.id);
      run(
        `UPDATE disputes SET status = 'withdrawn', decided_at = ?, reason = 'The creator withdrew the submission.' WHERE milestone_id = ? AND ${OPEN_DISPUTE}`,
        now,
        m.id,
      );
      run(
        "INSERT INTO updates (campaign_id, title, body, created_at) VALUES (?, ?, ?, ?)",
        m.campaign_id,
        `${m.label} submission withdrawn`,
        `We've withdrawn stage ${stageNumber(m.position)} to add more evidence. It goes back up for review when it's ready — nothing has moved from escrow.`,
        now,
      );
    });
    refreshCreator();
    return { ok: true, message: "Withdrawn. The stage is back in draft and donors have been told." };
  });
}

export async function respondToDispute(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const viewer = await creatorViewer();
    const response = text(formData.get("response"));
    if (response.length < 20) return { fieldErrors: { response: "Answer what the donors raised — at least a sentence." } };
    const d = get<{ id: number; milestone_id: number; status: string }>(
      `SELECT id, milestone_id, status FROM disputes WHERE id = ? AND ${OPEN_DISPUTE}`,
      Number(formData.get("dispute")),
    );
    if (!d) return { error: "That case has already been decided." };
    ownMilestone(viewer, d.milestone_id);
    run(
      "UPDATE disputes SET creator_response = ?, creator_response_at = ?, status = 'in_review' WHERE id = ?",
      response.slice(0, 2000),
      Date.now(),
      d.id,
    );
    refreshCreator();
    return { ok: true, message: "Response sent. The moderator and the disputing donors can see it." };
  });
}

async function activeCampaignId(viewer: { creatorId: number }): Promise<number | null> {
  const chosen = (await cookies()).get(ACTIVE_CAMPAIGN_COOKIE)?.value;
  const rows = all<{ id: number; slug: string; status: string }>(
    "SELECT id, slug, status FROM campaigns WHERE creator_id = ? ORDER BY created_at DESC",
    viewer.creatorId,
  );
  return (rows.find((c) => c.slug === chosen) ?? rows.find((c) => c.status === "live") ?? rows[0])?.id ?? null;
}

export async function postUpdate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const viewer = await creatorViewer();
    const title = text(formData.get("title"));
    const body = text(formData.get("body"));
    const fieldErrors: Record<string, string> = {};
    if (title.length < 3 || title.length > 120) fieldErrors.title = "Give the update a title (3–120 characters).";
    if (body.length < 10 || body.length > 4000) fieldErrors.body = "Write the update (10–4,000 characters).";
    if (Object.keys(fieldErrors).length) return { fieldErrors };
    const campaignId = await activeCampaignId(viewer);
    if (!campaignId) return { error: "Create a campaign before posting updates." };
    run("INSERT INTO updates (campaign_id, title, body, created_at) VALUES (?, ?, ?, ?)", campaignId, title, body, Date.now());
    refreshCreator();
    return { ok: true, message: "Published. Every donor on this campaign can now read it." };
  });
}

export async function updateStudio(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(async () => {
    const viewer = await creatorViewer();
    const name = text(formData.get("name"));
    const location = text(formData.get("location"));
    const bio = text(formData.get("bio"));
    const fieldErrors: Record<string, string> = {};
    if (name.length < 2 || name.length > 80) fieldErrors.name = "Use between 2 and 80 characters.";
    if (location.length < 2 || location.length > 80) fieldErrors.location = "Where the work happens, e.g. “Kano, Nigeria”.";
    if (bio.length > 600) fieldErrors.bio = "Keep it under 600 characters.";
    if (Object.keys(fieldErrors).length) return { fieldErrors };
    run("UPDATE creators SET name = ?, initials = ?, location = ?, bio = ? WHERE id = ?", name, initialsOf(name), location, bio, viewer.creatorId);
    refreshCreator();
    return { ok: true, message: "Studio profile saved." };
  });
}

export async function switchCampaign(formData: FormData): Promise<void> {
  const viewer = await creatorViewer();
  const slug = text(formData.get("slug"));
  if (!get("SELECT 1 FROM campaigns WHERE slug = ? AND creator_id = ?", slug, viewer.creatorId)) return;
  (await cookies()).set(ACTIVE_CAMPAIGN_COOKIE, slug, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  refreshCreator();
}

/**
 * Identity documents. There is no file storage in this build, so submitting
 * marks the three required documents as received and puts the check in front
 * of a moderator.
 */
export async function submitIdentityDocuments(): Promise<ActionState> {
  return guarded(async () => {
    const viewer = await creatorViewer();
    const creator = get<{ kyc_status: string }>("SELECT kyc_status FROM creators WHERE id = ?", viewer.creatorId)!;
    if (creator.kyc_status === "verified") return { ok: true, message: "You're already verified." };
    const open = get<{ id: number }>(
      "SELECT id FROM identity_checks WHERE creator_id = ? AND status IN ('incomplete', 'ready', 'resubmitted')",
      viewer.creatorId,
    );
    const documents = JSON.stringify([
      { label: "Photo ID", meta: "Government-issued ID", submitted: true },
      { label: "Address proof", meta: "Utility bill or bank statement", submitted: true },
      { label: "Bank statement", meta: "Matches the payout account", submitted: true },
    ]);
    const checks = JSON.stringify([
      { label: "Sanctions list · clear", variant: "neutral" },
      { label: "Document forgery · clear", variant: "neutral" },
      creator.kyc_status === "rejected" || creator.kyc_status === "stale"
        ? { label: creator.kyc_status === "rejected" ? "Resubmitted after rejection" : "Re-verification", variant: "outline" }
        : { label: "Name match · clear", variant: "neutral" },
    ]);
    const status = creator.kyc_status === "rejected" ? "resubmitted" : "ready";
    tx(() => {
      if (open) {
        run("UPDATE identity_checks SET status = ?, documents = ?, checks = ?, submitted_at = ? WHERE id = ?", status, documents, checks, Date.now(), open.id);
      } else {
        run(
          "INSERT INTO identity_checks (creator_id, status, documents, checks, submitted_at) VALUES (?, ?, ?, ?, ?)",
          viewer.creatorId,
          status,
          documents,
          checks,
          Date.now(),
        );
      }
      if (creator.kyc_status !== "stale") run("UPDATE creators SET kyc_status = 'pending' WHERE id = ?", viewer.creatorId);
    });
    refreshCreator();
    return { ok: true, message: "Documents submitted. A moderator usually decides within two working days." };
  });
}

/** A verified creator can publish a draft straight away. */
export async function publishCampaign(formData: FormData): Promise<void> {
  const viewer = await creatorViewer();
  const c = get<{ id: number; creator_id: number }>("SELECT id, creator_id FROM campaigns WHERE slug = ?", text(formData.get("slug")));
  if (!c || c.creator_id !== viewer.creatorId) return;
  const kyc = get<{ kyc_status: string; barred_at: number | null }>("SELECT kyc_status, barred_at FROM creators WHERE id = ?", viewer.creatorId)!;
  if (kyc.kyc_status !== "verified" || kyc.barred_at) return;
  launchCampaign(c.id);
  refreshCreator();
}

const CATEGORIES = ["Craft & material", "Type & print", "Growing", "Restoration", "Clay & kiln", "Other"];
const CURRENCIES = ["USD", "GBP", "EUR", "NGN"];

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "") || "campaign";
  let slug = base;
  for (let i = 2; get("SELECT 1 FROM campaigns WHERE slug = ?", slug); i++) slug = `${base}-${i}`;
  return slug;
}

export async function createCampaign(prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded(() => createCampaignUnguarded(prev, formData));
}

async function createCampaignUnguarded(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in or create an account to save your campaign." };
  if (viewer.role === "admin") return { error: "Staff accounts can't run campaigns." };

  const title = text(formData.get("title"));
  const category = text(formData.get("category"));
  const location = text(formData.get("location"));
  const summary = text(formData.get("summary"));
  const goal = Math.round(Number(formData.get("goal")));
  const currency = text(formData.get("currency"));
  const duration = Math.round(Number(formData.get("duration")));
  let milestones: { label: string; amount: number; note: string }[] = [];
  try {
    milestones = (JSON.parse(text(formData.get("milestones"))) as { label: string; amount: string | number; note: string }[]).map((m) => ({
      label: String(m.label ?? "").trim().slice(0, 80),
      amount: Math.round(Number(m.amount)),
      note: String(m.note ?? "").trim().slice(0, 600),
    }));
  } catch {
    return { error: "The milestones couldn't be read. Try again." };
  }

  const problems: string[] = [];
  if (title.length < 6 || title.length > 120) problems.push("a title of 6–120 characters");
  if (!CATEGORIES.includes(category)) problems.push("a category");
  if (location.length < 2) problems.push("a location");
  if (summary.length < 20) problems.push("a summary of at least a sentence");
  if (!(goal > 0 && goal <= 10_000_000)) problems.push("a funding goal");
  if (!CURRENCIES.includes(currency)) problems.push("a currency");
  if (!(duration >= 7 && duration <= 90)) problems.push("a funding period of 7–90 days");
  if (milestones.length === 0 || milestones.length > 10 || milestones.some((m) => m.label.length < 2 || !(m.amount > 0))) {
    problems.push("between 1 and 10 stages, each with a name and an amount");
  }
  if (problems.length) return { error: `Add ${problems.join(", ")} before saving.` };

  const now = Date.now();
  const slug = slugify(title);
  const creatorId = tx(() => {
    let id = viewer.creatorId;
    if (id == null) {
      // A donor starting a campaign gets a creator profile, as the sign-up screen promises.
      const user = get<{ name: string; country: string }>("SELECT name, country FROM users WHERE id = ?", viewer.id)!;
      id = run(
        "INSERT INTO creators (owner_user_id, name, initials, location, country, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        viewer.id,
        user.name,
        initialsOf(user.name),
        location,
        user.country,
        now,
      ).lastId;
      run("UPDATE users SET role = 'creator' WHERE id = ?", viewer.id);
    }
    const creator = get<{ barred_at: number | null }>("SELECT barred_at FROM creators WHERE id = ?", id)!;
    if (creator.barred_at) throw new Refusal("This creator account is barred from publishing campaigns.");
    const campaignId = run(
      `INSERT INTO campaigns (slug, creator_id, title, short_title, category, location, summary, summary_short, story,
         hero_caption, currency, goal, status, duration_days, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
      slug,
      id,
      title,
      title.length > 28 ? `${title.slice(0, 26).trimEnd()}…` : title,
      category,
      location,
      summary,
      summary.length > 140 ? `${summary.slice(0, 138).trimEnd()}…` : summary,
      JSON.stringify([summary]),
      `${category} · 16:10`,
      currency,
      goal,
      duration,
      now,
    ).lastId;
    milestones.forEach((m, i) =>
      run(
        "INSERT INTO milestones (campaign_id, position, label, description, terms, amount, state) VALUES (?, ?, ?, ?, ?, ?, 'pending')",
        campaignId,
        i + 1,
        m.label,
        m.note || m.label,
        m.note || `${m.label}, evidenced with photographs and a receipt.`,
        m.amount,
      ),
    );
    // Every campaign starts with three plain tiers; the creator can rename them later.
    [
      [25, "Supporter — an update at every stage"],
      [100, "Backer — your name on the thank-you page"],
      [500, "Patron — a thank-you from the studio"],
    ].forEach(([amount, label], i) =>
      run("INSERT INTO tiers (campaign_id, position, amount, label) VALUES (?, ?, ?, ?)", campaignId, i + 1, amount, label),
    );
    return id;
  });

  const kyc = get<{ kyc_status: string }>("SELECT kyc_status FROM creators WHERE id = ?", creatorId)!.kyc_status;
  (await cookies()).set(ACTIVE_CAMPAIGN_COOKIE, slug, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
  return {
    ok: true,
    message:
      kyc === "verified"
        ? "Saved as a draft. You're verified, so you can publish it from your dashboard whenever you're ready."
        : "Saved as a draft. It publishes once a moderator verifies your identity — submit your documents from the dashboard.",
    link: "/creator",
  };
}

/** Used by <form action> buttons that don't need a result. */
export async function redirectToCreator(): Promise<void> {
  redirect("/creator");
}

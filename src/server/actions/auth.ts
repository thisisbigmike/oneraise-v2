"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { get, run, tx } from "../db";
import { clientIp, createSession, currentSessionId, destroySession, getViewer, safeNext } from "../auth";
import { PREVIEW_LINKS, consumeToken, issueToken, lockedUntil } from "../account";
import { hashPassword, passwordProblem, verifyPassword } from "../password";
import { HOUR, MINUTE, initialsOf } from "@/lib/format";
import { homeFor } from "@/lib/roles";
import type { ActionState } from "@/lib/view-models";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "Ireland", "United States", "Canada", "Germany", "India",
];

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

let dummyHash: string | null = null;
/** Verify against a throwaway hash for unknown emails so response time doesn't reveal which emails exist. */
function burnPasswordCheck(password: string) {
  dummyHash ??= hashPassword("not-a-real-account-password-1");
  verifyPassword(password, dummyHash);
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = text(formData.get("email")).toLowerCase();
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";
  const next = safeNext(formData.get("next"));
  if (!email || !password) return { error: "Enter both an email and a password to continue.", values: { email } };

  const lockedPage = `/locked-account?email=${encodeURIComponent(email)}`;
  if (lockedUntil(email)) redirect(lockedPage);

  const user = get<{ id: number; password_hash: string; role: "donor" | "creator" | "admin"; suspended_at: number | null }>(
    "SELECT id, password_hash, role, suspended_at FROM users WHERE email = ?",
    email,
  );
  let ok = false;
  if (user) ok = verifyPassword(password, user.password_hash);
  else burnPasswordCheck(password);
  run("INSERT INTO login_attempts (email, at, ip, success) VALUES (?, ?, ?, ?)", email, Date.now(), await clientIp(), ok ? 1 : 0);

  if (!ok || !user) {
    if (lockedUntil(email)) redirect(lockedPage);
    return { error: "That email and password don't match an account.", values: { email } };
  }
  if (user.suspended_at) {
    return { error: "This account is suspended. Contact support to have it reviewed.", values: { email } };
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  if (formData.get("stay") === "1") return { ok: true };
  redirect(next ?? homeFor(user.role));
}

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = text(formData.get("name"));
  const email = text(formData.get("email")).toLowerCase();
  const country = text(formData.get("country"));
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";
  const role = formData.get("role") === "creator" ? "creator" : "donor";
  const next = safeNext(formData.get("next"));

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Enter your full name.";
  if (!EMAIL.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!COUNTRIES.includes(country)) fieldErrors.country = "Choose your country of residence.";
  const problem = passwordProblem(password);
  if (problem) fieldErrors.password = problem;
  if (formData.get("terms") !== "on") fieldErrors.terms = "Agree to the terms to create an account.";
  if (!fieldErrors.email && get("SELECT 1 FROM users WHERE email = ?", email)) {
    fieldErrors.email = "An account already uses that email. Sign in instead.";
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors, values: { name, email, country } };

  const now = Date.now();
  const userId = tx(() => {
    const id = run(
      `INSERT INTO users (email, password_hash, name, country, role, notify_prefs, password_changed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      email,
      hashPassword(password),
      name,
      country,
      role,
      JSON.stringify(
        role === "creator"
          ? { due_approaching: true, payout_landed: true, every_pledge: false }
          : { window_closing: true, refund_issued: true, creator_updates: false, new_campaigns: false },
      ),
      now,
      now,
    ).lastId;
    if (role === "creator") {
      run(
        "INSERT INTO creators (owner_user_id, name, initials, location, country, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        id,
        name,
        initialsOf(name),
        country,
        country,
        now,
      );
    }
    return id;
  });
  issueToken(userId, "verify", 30 * MINUTE);
  await createSession(userId);
  revalidatePath("/", "layout");
  redirect(next ? `/welcome?next=${encodeURIComponent(next)}` : "/welcome");
}

export async function signOut(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = text(formData.get("email")).toLowerCase();
  if (!EMAIL.test(email)) return { error: "Enter the email address on your account." };
  const user = get<{ id: number }>("SELECT id FROM users WHERE email = ?", email);
  // Same answer either way, so the form can't be used to discover accounts.
  const result: ActionState = { ok: true };
  if (user) {
    const token = issueToken(user.id, "reset", 30 * MINUTE);
    if (PREVIEW_LINKS) result.link = `/reset-password?token=${token}`;
  }
  return result;
}

export async function resetPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = text(formData.get("token"));
  const password = typeof formData.get("new") === "string" ? (formData.get("new") as string) : "";
  const confirm = formData.get("confirm");
  if (password !== confirm) return { fieldErrors: { confirm: "Both passwords must match." } };
  const problem = passwordProblem(password);
  if (problem) return { fieldErrors: { new: problem } };
  if (!token) return { error: "This reset link is missing its token. Request a new one." };

  const userId = consumeToken(token, "reset");
  if (!userId) return { error: "This reset link has expired or was already used. Request a new one." };

  const user = get<{ role: "donor" | "creator" | "admin" }>("SELECT role FROM users WHERE id = ?", userId)!;
  tx(() => {
    run("UPDATE users SET password_hash = ?, password_changed_at = ? WHERE id = ?", hashPassword(password), Date.now(), userId);
    // Saving a new password closes every existing session on the account.
    run("DELETE FROM sessions WHERE user_id = ?", userId);
    // A successful reset also clears any sign-in lock.
    const email = get<{ email: string }>("SELECT email FROM users WHERE id = ?", userId)!.email;
    run("INSERT INTO login_attempts (email, at, ip, success) VALUES (?, ?, 'reset', 1)", email, Date.now());
  });
  await createSession(userId);
  revalidatePath("/", "layout");
  redirect(homeFor(user.role));
}

export async function resendVerification(): Promise<ActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in to verify your email." };
  if (viewer.emailVerified) return { ok: true, message: "Your email is already verified." };
  const token = issueToken(viewer.id, "verify", 30 * MINUTE);
  return { ok: true, message: `Sent a fresh link to ${viewer.email}.`, link: PREVIEW_LINKS ? `/verify-email/confirm?token=${token}` : undefined };
}

export async function sendUnlockLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = text(formData.get("email")).toLowerCase();
  const user = get<{ id: number }>("SELECT id FROM users WHERE email = ?", email);
  const result: ActionState = { ok: true, message: `If ${email} has an account, an unlock link is on its way.` };
  if (user) {
    const token = issueToken(user.id, "unlock", HOUR);
    if (PREVIEW_LINKS) result.link = `/locked-account/unlock?token=${token}`;
  }
  return result;
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in again to change your password." };
  const current = typeof formData.get("current") === "string" ? (formData.get("current") as string) : "";
  const password = typeof formData.get("new") === "string" ? (formData.get("new") as string) : "";
  const stored = get<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", viewer.id)!;
  if (!verifyPassword(current, stored.password_hash)) return { fieldErrors: { current: "That isn't your current password." } };
  const problem = passwordProblem(password);
  if (problem) return { fieldErrors: { new: problem } };
  const keep = await currentSessionId();
  tx(() => {
    run("UPDATE users SET password_hash = ?, password_changed_at = ? WHERE id = ?", hashPassword(password), Date.now(), viewer.id);
    run("DELETE FROM sessions WHERE user_id = ? AND id != ?", viewer.id, keep ?? "");
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Password changed. Every other session was signed out." };
}

export async function signOutOtherSessions(): Promise<ActionState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in again first." };
  const keep = await currentSessionId();
  const removed = run("DELETE FROM sessions WHERE user_id = ? AND id != ?", viewer.id, keep ?? "").changes;
  revalidatePath("/", "layout");
  return { ok: true, message: removed ? `Signed out ${removed} other ${removed === 1 ? "session" : "sessions"}.` : "No other sessions were open." };
}

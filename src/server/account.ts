import "server-only";
import { all, get, run } from "./db";
import { digest, newToken } from "./auth";
import { MINUTE } from "@/lib/format";

/**
 * Account-security helpers shared by the auth actions and the auth pages.
 * Kept out of the "use server" action modules on purpose: anything exported
 * from those becomes a public endpoint.
 */

/**
 * No mail service is wired up, so reset / verify / unlock links are shown on
 * screen instead of emailed — in development, or when explicitly enabled with
 * ONERAISE_EMAIL_PREVIEW=1. Never enable that on a public deployment: anyone
 * could then reset any account's password.
 */
export const PREVIEW_LINKS = process.env.NODE_ENV !== "production" || process.env.ONERAISE_EMAIL_PREVIEW === "1";

export const LOCK_AFTER = 5;
export const LOCK_FOR = 30 * MINUTE;

/** A lock is five failures in a row with no success in between, lasting 30 minutes from the fifth. */
export function lockedUntil(email: string): number | null {
  const attempts = all<{ at: number; success: number }>(
    "SELECT at, success FROM login_attempts WHERE email = ? ORDER BY at DESC LIMIT ?",
    email,
    LOCK_AFTER,
  );
  if (attempts.length < LOCK_AFTER || attempts.some((a) => a.success)) return null;
  const until = attempts[0].at + LOCK_FOR;
  return until > Date.now() ? until : null;
}

export function recentAttempts(email: string, limit = 5) {
  return all<{ at: number; ip: string | null; success: number }>(
    "SELECT at, ip, success FROM login_attempts WHERE email = ? ORDER BY at DESC LIMIT ?",
    email,
    limit,
  );
}

export function issueToken(userId: number, kind: "reset" | "verify" | "unlock", ttl: number): string {
  const token = newToken();
  run("INSERT INTO tokens (id, user_id, kind, expires_at) VALUES (?, ?, ?, ?)", digest(token), userId, kind, Date.now() + ttl);
  return token;
}

/** Look a token up without using it — for pages that show when a link expires. */
export function peekToken(token: string, kind: "reset" | "verify" | "unlock") {
  const row = get<{ user_id: number; expires_at: number; used_at: number | null }>(
    "SELECT user_id, expires_at, used_at FROM tokens WHERE id = ? AND kind = ?",
    digest(token),
    kind,
  );
  if (!row || row.used_at || row.expires_at < Date.now()) return null;
  return { userId: row.user_id, expiresAt: row.expires_at };
}

/** Consume a one-time token; returns its user id, or null if unknown, used or expired. */
export function consumeToken(token: string, kind: "reset" | "verify" | "unlock"): number | null {
  const found = peekToken(token, kind);
  if (!found) return null;
  run("UPDATE tokens SET used_at = ? WHERE id = ?", Date.now(), digest(token));
  return found.userId;
}

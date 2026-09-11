import "server-only";
import { cache } from "react";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { get, run } from "./db";
import { DAY, initialsOf } from "@/lib/format";
import { homeFor } from "@/lib/roles";
import type { Role, Viewer } from "@/lib/view-models";

/**
 * Database sessions. The browser holds a random token in an httpOnly cookie;
 * the database stores only its SHA-256, so a leaked database cannot be used to
 * impersonate anyone. Every page and action resolves the viewer through
 * `getViewer`, memoised per request.
 */

const COOKIE = "or_session";
const SESSION_TTL = 30 * DAY;

export const digest = (token: string) => createHash("sha256").update(token).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");

export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "local";
}

export async function createSession(userId: number): Promise<void> {
  const token = newToken();
  const now = Date.now();
  const expires = now + SESSION_TTL;
  const userAgent = (await headers()).get("user-agent")?.slice(0, 200) ?? null;
  run(
    "INSERT INTO sessions (id, user_id, created_at, expires_at, user_agent) VALUES (?, ?, ?, ?, ?)",
    digest(token),
    userId,
    now,
    expires,
    userAgent,
  );
  run("UPDATE users SET last_sign_in_at = ? WHERE id = ?", now, userId);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) run("DELETE FROM sessions WHERE id = ?", digest(token));
  store.delete(COOKIE);
}

/** The id of the session making this request, so "sign out other devices" can spare it. */
export async function currentSessionId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? digest(token) : null;
}

interface SessionRow {
  id: number;
  email: string;
  name: string;
  role: Role;
  staff_title: string | null;
  email_verified_at: number | null;
  suspended_at: number | null;
  expires_at: number;
  creator_id: number | null;
  creator_name: string | null;
  creator_initials: string | null;
}

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = get<SessionRow>(
    `SELECT u.id, u.email, u.name, u.role, u.staff_title, u.email_verified_at, u.suspended_at, s.expires_at,
            c.id AS creator_id, c.name AS creator_name, c.initials AS creator_initials
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN creators c ON c.owner_user_id = u.id
     WHERE s.id = ?`,
    digest(token),
  );
  if (!row || row.expires_at < Date.now() || row.suspended_at) return null;
  const isCreator = row.role === "creator" && row.creator_id != null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    roleLabel: row.role === "admin" ? (row.staff_title ?? "Admin") : row.role === "creator" ? "Creator" : "Donor",
    creatorId: row.creator_id,
    displayName: isCreator ? row.creator_name! : row.name,
    initials: isCreator ? row.creator_initials! : initialsOf(row.name),
    emailVerified: row.email_verified_at != null,
  };
});

export { homeFor };

/**
 * Gate a page. Signed-out visitors go to sign in and come back to `next`;
 * signed-in visitors without the right role go to their own dashboard.
 */
export async function requireViewer(next: string, roles?: Role[]): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/signin?next=${encodeURIComponent(next)}`);
  if (roles && !roles.includes(viewer.role)) redirect(homeFor(viewer.role));
  return viewer;
}

/** Safe post-sign-in destination: only same-site paths are honoured. */
export function safeNext(next: FormDataEntryValue | string | null | undefined): string | null {
  const value = typeof next === "string" ? next : null;
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

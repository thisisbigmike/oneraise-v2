import type { Role } from "@/lib/view-models";

/** Where each kind of account lands after signing in. */
export function homeFor(role: Role): string {
  return role === "admin" ? "/admin" : role === "creator" ? "/creator" : "/donor";
}

/** The campaign a post-sign-in destination points at, if any: "/campaigns/x?tier=2" → "x". */
export function campaignSlugFrom(next: string | null | undefined): string | null {
  return next?.match(/^\/campaigns\/([a-z0-9-]+)/)?.[1] ?? null;
}

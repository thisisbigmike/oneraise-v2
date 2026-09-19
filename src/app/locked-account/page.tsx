import type { Metadata } from "next";
import { LockedView } from "@/components/auth/locked-view";
import { lockedUntil, recentAttempts } from "@/server/account";
import { requestNow } from "@/server/clock";
import { clockTime, shortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Account locked | OneRaise" };

export default async function LockedAccountPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const now = await requestNow();
  const email = ((await searchParams).email ?? "").trim().toLowerCase();
  const until = email ? lockedUntil(email) : null;
  // Times only: the log is shown to whoever holds the link, so no IPs or locations.
  const attempts = until
    ? recentAttempts(email).map((a, i, arr) => ({
        left: `${shortDate(a.at)} · ${clockTime(a.at)}`,
        right: i === 0 && arr.length >= 5 ? "Locked" : a.success ? "Signed in" : "Wrong password",
      }))
    : [];
  return <LockedView email={email} lockedUntil={until} initialNow={now} attempts={attempts} />;
}

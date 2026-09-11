import type { Metadata } from "next";
import { ResetView } from "@/components/auth/reset-view";
import { peekToken } from "@/server/account";
import { requestNow } from "@/server/clock";
import { all } from "@/server/db";
import { shortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Choose a new password — OneRaise" };

function browserOf(ua: string | null): string {
  if (!ua) return "Unknown browser";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Another browser";
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const now = await requestNow();
  const { token } = await searchParams;
  const found = token ? peekToken(token, "reset") : null;
  const sessions = found
    ? all<{ user_agent: string | null; created_at: number }>(
        "SELECT user_agent, created_at FROM sessions WHERE user_id = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 4",
        found.userId,
        now,
      )
    : [];
  const sessionRows = sessions.length
    ? sessions.map((s) => ({ left: `${browserOf(s.user_agent)} · since ${shortDate(s.created_at)}`, right: "Signed out" }))
    : [{ left: "Other sessions", right: "None open" }];

  return (
    <ResetView
      token={found ? token! : null}
      expiresAt={found?.expiresAt ?? null}
      initialNow={now}
      sessionRows={sessionRows}
    />
  );
}

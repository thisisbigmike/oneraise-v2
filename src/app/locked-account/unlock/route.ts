import { NextResponse, type NextRequest } from "next/server";
import { consumeToken } from "@/server/account";
import { get, run } from "@/server/db";

export const dynamic = "force-dynamic";

/** The link in an unlock email: records a clean attempt, which clears the lock. */
export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const userId = token ? consumeToken(token, "unlock") : null;
  if (!userId) return NextResponse.redirect(new URL("/signin", request.url));
  const user = get<{ email: string }>("SELECT email FROM users WHERE id = ?", userId);
  if (user) run("INSERT INTO login_attempts (email, at, ip, success) VALUES (?, ?, 'unlock', 1)", user.email, Date.now());
  return NextResponse.redirect(new URL("/signin?unlocked=1", request.url));
}

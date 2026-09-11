import { NextResponse, type NextRequest } from "next/server";
import { consumeToken } from "@/server/account";
import { run } from "@/server/db";

export const dynamic = "force-dynamic";

/** The link in a verification email. One use; marks the address verified. */
export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const userId = token ? consumeToken(token, "verify") : null;
  if (!userId) return NextResponse.redirect(new URL("/verify-email?invalid=1", request.url));
  run("UPDATE users SET email_verified_at = ? WHERE id = ? AND email_verified_at IS NULL", Date.now(), userId);
  return NextResponse.redirect(new URL("/verify-email?verified=1", request.url));
}

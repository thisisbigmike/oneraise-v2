import type { Metadata } from "next";
import { VerifyView } from "@/components/auth/verify-view";
import { homeFor, requireViewer } from "@/server/auth";

export const metadata: Metadata = { title: "Verify your email | OneRaise" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; invalid?: string }>;
}) {
  const viewer = await requireViewer("/verify-email");
  const params = await searchParams;
  return (
    <VerifyView
      email={viewer.email}
      verified={viewer.emailVerified}
      home={homeFor(viewer.role)}
      notice={params.invalid ? "invalid" : params.verified ? "verified" : null}
    />
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInView } from "@/components/auth/signin-view";
import { getViewer, safeNext } from "@/server/auth";
import { getContextCampaign } from "@/server/queries/public";
import { campaignSlugFrom, homeFor } from "@/lib/roles";

export const metadata: Metadata = { title: "Sign in — OneRaise" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; unlocked?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const viewer = await getViewer();
  if (viewer) redirect(next ?? homeFor(viewer.role));

  const campaign = await getContextCampaign(campaignSlugFrom(next));
  const notice = params.unlocked
    ? "Your account is unlocked. Sign in with your password."
    : null;
  return (
    <SignInView
      next={next}
      campaign={campaign}
      notice={notice}
      demoHint={process.env.NODE_ENV !== "production"}
    />
  );
}

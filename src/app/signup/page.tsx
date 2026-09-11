import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpView } from "@/components/auth/signup-view";
import { getViewer, safeNext } from "@/server/auth";
import { getContextCampaign } from "@/server/queries/public";
import { campaignSlugFrom, homeFor } from "@/lib/roles";

export const metadata: Metadata = { title: "Create an account — OneRaise" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; role?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const viewer = await getViewer();
  if (viewer) redirect(next ?? homeFor(viewer.role));

  const campaign = await getContextCampaign(campaignSlugFrom(next));
  const initialRole = params.role === "creator" || next === "/create-campaign" ? "creator" : "donor";
  return <SignUpView next={next} campaign={campaign} initialRole={initialRole} />;
}

import type { Metadata } from "next";
import { WelcomeView } from "@/components/auth/welcome-view";
import { homeFor, requireViewer, safeNext } from "@/server/auth";
import { getContextCampaign } from "@/server/queries/public";
import { campaignSlugFrom } from "@/lib/roles";

export const metadata: Metadata = { title: "Welcome | OneRaise" };

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const viewer = await requireViewer("/welcome");
  const next = safeNext((await searchParams).next);
  const campaign = await getContextCampaign(campaignSlugFrom(next));
  return (
    <WelcomeView
      firstName={viewer.name.split(" ")[0]}
      initials={viewer.initials}
      role={viewer.role}
      next={next}
      campaign={campaign}
      emailVerified={viewer.emailVerified}
      home={homeFor(viewer.role)}
    />
  );
}

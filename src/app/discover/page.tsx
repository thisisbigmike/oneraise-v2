import type { Metadata } from "next";
import { DiscoverPage } from "@/components/marketing/discover-page";
import { getDiscoverCampaigns } from "@/server/queries/public";

export const metadata: Metadata = { title: "Discover — OneRaise" };

export default async function Discover() {
  const campaigns = await getDiscoverCampaigns();
  return <DiscoverPage campaigns={campaigns} />;
}

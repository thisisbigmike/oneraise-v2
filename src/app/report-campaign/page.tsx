import type { Metadata } from "next";
import { ReportCampaignPage } from "@/components/marketing/report-campaign-page";
import { getCampaignMeta } from "@/server/queries/public";

export const metadata: Metadata = { title: "Report a campaign — OneRaise" };

export default async function ReportCampaign({ searchParams }: { searchParams: Promise<{ campaign?: string }> }) {
  const { campaign } = await searchParams;
  const meta = campaign ? await getCampaignMeta(campaign) : null;
  return <ReportCampaignPage initialCampaign={meta?.title ?? ""} />;
}

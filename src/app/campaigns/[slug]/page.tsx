import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CampaignDetailView } from "@/components/campaign/campaign-detail-view";
import { getViewer } from "@/server/auth";
import { getCampaignMeta, getCampaignPage } from "@/server/queries/public";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getCampaignMeta(slug);
  if (!meta) return {};
  return { title: `${meta.title} | OneRaise`, description: meta.summary };
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getCampaignPage(slug, await getViewer());
  if (!page) notFound();
  return <CampaignDetailView detail={page.detail} viewer={page.viewerState} />;
}

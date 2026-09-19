import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateCampaignPage } from "@/components/marketing/create-campaign-page";
import { getViewer } from "@/server/auth";

export const metadata: Metadata = { title: "Start a campaign | OneRaise" };

export default async function CreateCampaign() {
  const viewer = await getViewer();
  // Campaigns belong to an account, so the builder asks for one first.
  if (!viewer) redirect("/signup?next=%2Fcreate-campaign&role=creator");
  if (viewer.role === "admin") redirect("/admin");
  return <CreateCampaignPage />;
}

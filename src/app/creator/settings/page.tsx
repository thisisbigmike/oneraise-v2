import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreatorSettings } from "@/components/creator/creator-settings";
import { requireViewer } from "@/server/auth";
import { getCreatorSettings, getCreatorShell } from "@/server/queries/creator";

export const metadata: Metadata = { title: "Account settings — OneRaise" };

export default async function CreatorSettingsPage() {
  const viewer = await requireViewer("/creator/settings", ["creator"]);
  const [shell, data] = await Promise.all([getCreatorShell(viewer), getCreatorSettings(viewer)]);
  if (!data) redirect("/create-campaign");
  return <CreatorSettings shell={shell} data={data} />;
}

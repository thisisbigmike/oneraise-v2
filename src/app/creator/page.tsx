import type { Metadata } from "next";
import { CreatorWorkbench } from "@/components/creator/creator-workbench";
import { requireViewer } from "@/server/auth";
import { requestNow } from "@/server/clock";
import { getCreatorOverview, getCreatorShell } from "@/server/queries/creator";

export const metadata: Metadata = { title: "Creator | OneRaise" };

export default async function CreatorPage() {
  const viewer = await requireViewer("/creator", ["creator"]);
  const [shell, data, now] = await Promise.all([getCreatorShell(viewer), getCreatorOverview(viewer), requestNow()]);
  return <CreatorWorkbench shell={shell} data={data} initialNow={now} />;
}

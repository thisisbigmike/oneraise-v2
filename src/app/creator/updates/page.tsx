import type { Metadata } from "next";
import { CreatorUpdatesPage } from "@/components/creator/creator-updates-page";
import { requireViewer } from "@/server/auth";
import { getCreatorShell, getCreatorUpdates } from "@/server/queries/creator";

export const metadata: Metadata = { title: "Updates — OneRaise" };

export default async function CreatorUpdates() {
  const viewer = await requireViewer("/creator/updates", ["creator"]);
  const [shell, data] = await Promise.all([getCreatorShell(viewer), getCreatorUpdates(viewer)]);
  return <CreatorUpdatesPage shell={shell} data={data} />;
}

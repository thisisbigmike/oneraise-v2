import type { Metadata } from "next";
import { CreatorMilestonesPage } from "@/components/creator/creator-milestones-page";
import { requireViewer } from "@/server/auth";
import { getCreatorMilestones, getCreatorShell } from "@/server/queries/creator";

export const metadata: Metadata = { title: "Milestones — OneRaise" };

export default async function CreatorMilestones() {
  const viewer = await requireViewer("/creator/milestones", ["creator"]);
  const [shell, data] = await Promise.all([getCreatorShell(viewer), getCreatorMilestones(viewer)]);
  return <CreatorMilestonesPage shell={shell} data={data} />;
}

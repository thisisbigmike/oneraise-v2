import type { Metadata } from "next";
import { CreatorPayoutsPage } from "@/components/creator/creator-payouts-page";
import { requireViewer } from "@/server/auth";
import { getCreatorPayouts, getCreatorShell } from "@/server/queries/creator";

export const metadata: Metadata = { title: "Payouts — OneRaise" };

export default async function CreatorPayouts() {
  const viewer = await requireViewer("/creator/payouts", ["creator"]);
  const [shell, data] = await Promise.all([getCreatorShell(viewer), getCreatorPayouts(viewer)]);
  return <CreatorPayoutsPage shell={shell} data={data} />;
}

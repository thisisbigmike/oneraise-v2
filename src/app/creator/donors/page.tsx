import type { Metadata } from "next";
import { CreatorDonorsPage } from "@/components/creator/creator-donors-page";
import { requireViewer } from "@/server/auth";
import { getCreatorDonors, getCreatorShell } from "@/server/queries/creator";

export const metadata: Metadata = { title: "Donors — OneRaise" };

export default async function CreatorDonors() {
  const viewer = await requireViewer("/creator/donors", ["creator"]);
  const [shell, data] = await Promise.all([getCreatorShell(viewer), getCreatorDonors(viewer)]);
  return <CreatorDonorsPage shell={shell} data={data} />;
}

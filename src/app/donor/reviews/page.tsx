import type { Metadata } from "next";
import { DonorReviewsPage } from "@/components/donor/donor-reviews-page";
import { requireViewer } from "@/server/auth";
import { getReviewQueue } from "@/server/queries/donor";

export const metadata: Metadata = { title: "Reviews — OneRaise" };

export default async function DonorReviews() {
  const viewer = await requireViewer("/donor/reviews", ["donor", "creator"]);
  const queue = await getReviewQueue(viewer);
  return (
    <DonorReviewsPage account={{ initials: viewer.initials, name: viewer.displayName, roleLabel: viewer.roleLabel }} queue={queue} />
  );
}

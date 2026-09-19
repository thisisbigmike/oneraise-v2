import type { Metadata } from "next";
import { DonorDonationsPage } from "@/components/donor/donor-donations-page";
import { requireViewer } from "@/server/auth";
import { getDonorPledges, getReviewCount } from "@/server/queries/donor";

export const metadata: Metadata = { title: "Your donations | OneRaise" };

export default async function DonorPledges() {
  const viewer = await requireViewer("/donor/donations", ["donor", "creator"]);
  const [pledges, reviewCount] = await Promise.all([getDonorPledges(viewer), getReviewCount(viewer)]);
  return (
    <DonorDonationsPage
      account={{ initials: viewer.initials, name: viewer.displayName, roleLabel: viewer.roleLabel }}
      pledges={pledges}
      reviewCount={reviewCount}
    />
  );
}

import type { Metadata } from "next";
import { DonorPledgesPage } from "@/components/donor/donor-pledges-page";
import { requireViewer } from "@/server/auth";
import { getDonorPledges, getReviewCount } from "@/server/queries/donor";

export const metadata: Metadata = { title: "Your pledges — OneRaise" };

export default async function DonorPledges() {
  const viewer = await requireViewer("/donor/pledges", ["donor", "creator"]);
  const [pledges, reviewCount] = await Promise.all([getDonorPledges(viewer), getReviewCount(viewer)]);
  return (
    <DonorPledgesPage
      account={{ initials: viewer.initials, name: viewer.displayName, roleLabel: viewer.roleLabel }}
      pledges={pledges}
      reviewCount={reviewCount}
    />
  );
}

import type { Metadata } from "next";
import { DonorRefundsPage } from "@/components/donor/donor-refunds-page";
import { requireViewer } from "@/server/auth";
import { getDonorRefunds, getReviewCount } from "@/server/queries/donor";

export const metadata: Metadata = { title: "Refunds | OneRaise" };

export default async function DonorRefunds() {
  const viewer = await requireViewer("/donor/refunds", ["donor", "creator"]);
  const [{ figure, refunds }, reviewCount] = await Promise.all([getDonorRefunds(viewer), getReviewCount(viewer)]);
  return (
    <DonorRefundsPage
      account={{ initials: viewer.initials, name: viewer.displayName, roleLabel: viewer.roleLabel }}
      figure={figure}
      refunds={refunds}
      reviewCount={reviewCount}
    />
  );
}

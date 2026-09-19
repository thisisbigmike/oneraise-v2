import type { Metadata } from "next";
import { DonorFollowingPage } from "@/components/donor/donor-following-page";
import { requireViewer } from "@/server/auth";
import { getFollowing, getReviewCount } from "@/server/queries/donor";

export const metadata: Metadata = { title: "Following | OneRaise" };

export default async function DonorFollowing() {
  const viewer = await requireViewer("/donor/following", ["donor", "creator"]);
  const [creators, reviewCount] = await Promise.all([getFollowing(viewer), getReviewCount(viewer)]);
  return (
    <DonorFollowingPage
      account={{ initials: viewer.initials, name: viewer.displayName, roleLabel: viewer.roleLabel }}
      creators={creators}
      reviewCount={reviewCount}
    />
  );
}

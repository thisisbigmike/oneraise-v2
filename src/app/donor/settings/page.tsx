import type { Metadata } from "next";
import { DonorSettings } from "@/components/donor/donor-settings";
import { requireViewer } from "@/server/auth";
import { getDonorSettings, getReviewCount } from "@/server/queries/donor";

export const metadata: Metadata = { title: "Account settings — OneRaise" };

export default async function DonorSettingsPage() {
  const viewer = await requireViewer("/donor/settings", ["donor", "creator"]);
  const [data, reviewCount] = await Promise.all([getDonorSettings(viewer), getReviewCount(viewer)]);
  return (
    <DonorSettings
      account={{ initials: viewer.initials, name: viewer.displayName, roleLabel: viewer.roleLabel }}
      data={data}
      reviewCount={reviewCount}
    />
  );
}

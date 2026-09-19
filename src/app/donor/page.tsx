import type { Metadata } from "next";
import { DonorOverview } from "@/components/donor/donor-overview";
import { requireViewer } from "@/server/auth";
import { getDonorOverview } from "@/server/queries/donor";

export const metadata: Metadata = { title: "Overview | OneRaise" };

export default async function DonorPage() {
  const viewer = await requireViewer("/donor", ["donor", "creator"]);
  const data = await getDonorOverview(viewer);
  return (
    <DonorOverview
      account={{ initials: viewer.initials, name: viewer.displayName, roleLabel: viewer.roleLabel }}
      figures={data.figures}
      queue={data.queue}
      pledges={data.pledges}
      liveNow={data.liveNow}
    />
  );
}

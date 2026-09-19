import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReleasesQueue } from "@/components/admin/releases-queue";
import { requireViewer } from "@/server/auth";
import { getReleaseQueue } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Releases | OneRaise Admin" };

export default async function AdminReleasesPage() {
  const viewer = await requireViewer("/admin/releases", ["admin"]);
  const data = await getReleaseQueue();
  return (
    <AdminShell active="releases" title="Releases" viewer={viewer}>
      <ReleasesQueue rows={data.rows} awaitingAmount={data.awaitingAmount} awaitingCount={data.awaitingCount} />
    </AdminShell>
  );
}

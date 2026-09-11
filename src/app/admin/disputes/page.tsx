import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { DisputesQueue } from "@/components/admin/disputes-queue";
import { requireViewer } from "@/server/auth";
import { getDisputes } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Disputes — OneRaise Admin" };

export default async function AdminDisputesPage() {
  const viewer = await requireViewer("/admin/disputes", ["admin"]);
  const { rows, heldPending } = await getDisputes(viewer);
  return (
    <AdminShell active="disputes" title="Disputes" viewer={viewer}>
      <DisputesQueue rows={rows} heldPending={heldPending} />
    </AdminShell>
  );
}

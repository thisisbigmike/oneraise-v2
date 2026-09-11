import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { RefundsQueue } from "@/components/admin/refunds-queue";
import { requireViewer } from "@/server/auth";
import { getRefunds } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Refunds — OneRaise Admin" };

export default async function AdminRefundsPage() {
  const viewer = await requireViewer("/admin/refunds", ["admin"]);
  const data = await getRefunds();
  return (
    <AdminShell active="refunds" title="Refunds" viewer={viewer}>
      <RefundsQueue data={data} />
    </AdminShell>
  );
}

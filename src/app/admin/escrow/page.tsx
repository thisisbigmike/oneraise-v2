import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { EscrowLedger } from "@/components/admin/escrow-ledger";
import { requireViewer } from "@/server/auth";
import { getEscrowLedger } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Escrow | OneRaise Admin" };

export default async function AdminEscrowPage() {
  const viewer = await requireViewer("/admin/escrow", ["admin"]);
  const data = await getEscrowLedger();
  return (
    <AdminShell active="escrow" title="Escrow" viewer={viewer}>
      <EscrowLedger data={data} />
    </AdminShell>
  );
}

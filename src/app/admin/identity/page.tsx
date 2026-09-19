import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { IdentityQueue } from "@/components/admin/identity-queue";
import { requireViewer } from "@/server/auth";
import { getIdentityQueue } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Identity | OneRaise Admin" };

export default async function AdminIdentityPage() {
  const viewer = await requireViewer("/admin/identity", ["admin"]);
  const { rows, summary } = await getIdentityQueue();
  return (
    <AdminShell active="identity" title="Identity" viewer={viewer}>
      <IdentityQueue rows={rows} summary={summary} />
    </AdminShell>
  );
}

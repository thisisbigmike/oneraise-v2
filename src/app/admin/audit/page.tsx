import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AuditLog } from "@/components/admin/audit-log";
import { requireViewer } from "@/server/auth";
import { getAuditLog } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Audit log | OneRaise Admin" };

export default async function AdminAuditPage() {
  const viewer = await requireViewer("/admin/audit", ["admin"]);
  const entries = await getAuditLog();
  return (
    <AdminShell active="audit" title="Audit log" viewer={viewer}>
      <AuditLog entries={entries} />
    </AdminShell>
  );
}

import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminOverview, AdminTriageMobile } from "@/components/admin/admin-overview";
import { requireViewer } from "@/server/auth";
import { getAdminOverview } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Overview — OneRaise Admin" };

export default async function AdminPage() {
  const viewer = await requireViewer("/admin", ["admin"]);
  const data = await getAdminOverview();
  return (
    <AdminShell active="overview" title="Overview" viewer={viewer} mobileContent={<AdminTriageMobile data={data} />}>
      <AdminOverview data={data} />
    </AdminShell>
  );
}

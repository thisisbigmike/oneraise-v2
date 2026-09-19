import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { requireViewer } from "@/server/auth";
import { getModerationQueue } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Moderation | OneRaise Admin" };

export default async function AdminModerationPage() {
  const viewer = await requireViewer("/admin/moderation", ["admin"]);
  const { rows, summary } = await getModerationQueue();
  return (
    <AdminShell active="moderation" title="Moderation" viewer={viewer}>
      <ModerationQueue rows={rows} summary={summary} />
    </AdminShell>
  );
}

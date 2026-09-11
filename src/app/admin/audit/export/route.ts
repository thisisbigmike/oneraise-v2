import { all } from "@/server/db";
import { getViewer } from "@/server/auth";

export const dynamic = "force-dynamic";

const csv = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** The full audit log as CSV, newest first. */
export async function GET() {
  const viewer = await getViewer();
  if (viewer?.role !== "admin") return new Response("Staff only.", { status: 403 });
  const rows = all<{ at: number; actor_name: string; action: string; target: string; reason: string; amount: number | null; source: string }>(
    "SELECT at, actor_name, action, target, reason, amount, source FROM audit_log ORDER BY at DESC, id DESC",
  );
  const body = [
    ["Timestamp (UTC)", "Actor", "Action", "Target", "Reason", "Amount (USD)", "Source"].map(csv).join(","),
    ...rows.map((r) => [new Date(r.at).toISOString(), r.actor_name, r.action, r.target, r.reason, r.amount, r.source].map(csv).join(",")),
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="oneraise-audit-log.csv"' },
  });
}

import { getViewer } from "@/server/auth";
import { available, campaignsWhere, displayStatus, escrowBalance } from "@/server/domain";

export const dynamic = "force-dynamic";

const csv = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/** Every published campaign's escrow position as CSV. */
export async function GET() {
  const viewer = await getViewer();
  if (viewer?.role !== "admin") return new Response("Staff only.", { status: 403 });
  const now = Date.now();
  const rows = campaignsWhere("c.status != 'draft'").sort((a, b) => escrowBalance(b) - escrowBalance(a));
  const body = [
    ["Campaign", "Creator", "Status", "Currency", "Raised", "Released", "Refunded (paid)", "Refunds queued", "Escrow balance", "Available to release"]
      .map(csv)
      .join(","),
    ...rows.map((c) =>
      [
        c.title,
        c.creator_name,
        displayStatus(c, now),
        c.currency,
        c.raised,
        c.released,
        c.refunded_paid,
        c.refunded_total - c.refunded_paid,
        escrowBalance(c),
        available(c),
      ]
        .map(csv)
        .join(","),
    ),
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="oneraise-escrow-ledger.csv"' },
  });
}

import { cookies } from "next/headers";
import { all } from "@/server/db";
import { getViewer } from "@/server/auth";
import { ACTIVE_CAMPAIGN_COOKIE } from "@/server/queries/creator";

export const dynamic = "force-dynamic";

const csv = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/** Every pledge to the creator's active campaign as CSV: name, place, amount, tier, date. */
export async function GET() {
  const viewer = await getViewer();
  if (!viewer || viewer.creatorId == null) return new Response("Sign in with your creator account.", { status: 401 });
  const campaigns = all<{ id: number; slug: string; status: string }>(
    "SELECT id, slug, status FROM campaigns WHERE creator_id = ? ORDER BY created_at DESC",
    viewer.creatorId,
  );
  const chosen = (await cookies()).get(ACTIVE_CAMPAIGN_COOKIE)?.value;
  const campaign = campaigns.find((c) => c.slug === chosen) ?? campaigns.find((c) => c.status === "live") ?? campaigns[0];
  if (!campaign) return new Response("No campaign yet.", { status: 404 });

  const rows = all<{ backer_name: string; backer_location: string; amount: number; tier: string | null; created_at: number }>(
    `SELECT p.backer_name, p.backer_location, p.amount, t.label AS tier, p.created_at
     FROM pledges p LEFT JOIN tiers t ON t.id = p.tier_id WHERE p.campaign_id = ? ORDER BY p.created_at DESC`,
    campaign.id,
  );
  const body = [
    ["Name", "Location", "Amount (USD)", "Tier", "Pledged at (UTC)"].map(csv).join(","),
    ...rows.map((r) =>
      [r.backer_name, r.backer_location, r.amount, r.tier ?? "Custom amount", new Date(r.created_at).toISOString()].map(csv).join(","),
    ),
  ].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${campaign.slug}-donors.csv"`,
    },
  });
}

import { all, get } from "@/server/db";
import { audit } from "@/server/domain";
import { clientIp, getViewer } from "@/server/auth";

export const dynamic = "force-dynamic";

/** A subject-access export of one account: profile, donations, reviews, follows. Never includes the password hash. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (viewer?.role !== "admin") return new Response("Staff only.", { status: 403 });
  const id = Number((await params).id);
  const user = get<Record<string, unknown>>(
    `SELECT id, email, name, country, role, email_verified_at, two_factor, suspended_at, card_label, notify_prefs,
            password_changed_at, last_sign_in_at, created_at FROM users WHERE id = ?`,
    id,
  );
  if (!user) return new Response("No such user.", { status: 404 });
  const data = {
    exportedAt: new Date().toISOString(),
    user,
    creatorProfile: get("SELECT id, name, location, country, bio, structure, kyc_status, created_at FROM creators WHERE owner_user_id = ?", id) ?? null,
    pledges: all(
      `SELECT p.id, c.title AS campaign, p.amount, t.label AS tier, p.created_at,
              COALESCE((SELECT SUM(amount) FROM refunds r WHERE r.pledge_id = p.id), 0) AS refunded
       FROM pledges p JOIN campaigns c ON c.id = p.campaign_id LEFT JOIN tiers t ON t.id = p.tier_id WHERE p.user_id = ?`,
      id,
    ),
    reviews: all(
      `SELECT r.decision, r.note, r.created_at, m.label AS milestone FROM milestone_reviews r
       JOIN pledges p ON p.id = r.pledge_id JOIN milestones m ON m.id = r.milestone_id WHERE p.user_id = ?`,
      id,
    ),
    follows: all("SELECT cr.name, f.created_at FROM follows f JOIN creators cr ON cr.id = f.creator_id WHERE f.user_id = ?", id),
  };
  audit({ id: viewer.id, name: viewer.name, source: await clientIp() }, "Account", `${String(user.name)} · data exported`, "Subject-access export downloaded by support.", null);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="oneraise-user-${id}.json"`,
    },
  });
}

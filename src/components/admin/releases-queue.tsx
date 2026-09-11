"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/form-status";
import { holdRelease, releaseAllClear, releaseFromQueue } from "@/server/actions/admin";
import { usd } from "@/lib/format";
import type { ReleaseRow } from "@/lib/view-models";

const COLUMNS = "1fr 160px 110px 120px 90px 230px";

function MilestoneForm({ action, milestoneId, children, className, pending }: {
  action: (formData: FormData) => Promise<void>;
  milestoneId: number;
  children: React.ReactNode;
  className: string;
  pending: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="milestone" value={milestoneId} />
      <SubmitButton className={className} pendingLabel={pending}>
        {children}
      </SubmitButton>
    </form>
  );
}

export function ReleasesQueue({
  rows,
  awaitingAmount,
  awaitingCount,
}: {
  rows: ReleaseRow[];
  awaitingAmount: string;
  awaitingCount: number;
}) {
  const clear = rows.filter((r) => r.state === "clear");
  const clearAmount = clear.reduce((sum, r) => sum + r.amountValue, 0);

  return (
    <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
      <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Queue
            </div>
            <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
              Releases
            </h2>
          </div>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {awaitingAmount} awaiting release across {awaitingCount} {awaitingCount === 1 ? "milestone" : "milestones"}
          </span>
        </div>

        {clear.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--surface))",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: "hsl(var(--secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "hsl(var(--primary))",
                flexShrink: 0,
              }}
            >
              <Icon name="check" size={16} style={{ width: 16, height: 16 }} />
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                {clear.length} {clear.length === 1 ? "milestone" : "milestones"} passed {clear.length === 1 ? "its" : "their"} window with no
                disputes
              </span>
              <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {usd(clearAmount)} · identity checks current, payout accounts on file
              </span>
            </div>
            <form action={releaseAllClear}>
              <SubmitButton className="ms-btn ms-btn--primary ms-btn--md" pendingLabel="Releasing…">
                Release all {clear.length}
              </SubmitButton>
            </form>
          </div>
        )}

        <div
          style={{
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
            boxShadow: "var(--shadow-xs)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: COLUMNS,
              gap: 14,
              padding: "12px 20px",
              borderBottom: "1px solid hsl(var(--border))",
              background: "hsl(var(--canvas))",
            }}
          >
            {["Milestone", "Creator", "Amount", "Window closed", "Disputes", "Action"].map((h) => (
              <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                {h}
              </span>
            ))}
          </div>

          {rows.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              Nothing left in this queue.
            </div>
          )}

          {rows.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "grid",
                gridTemplateColumns: COLUMNS,
                gap: 14,
                padding: "14px 20px",
                borderBottom: i === rows.length - 1 ? undefined : "1px solid hsl(var(--border))",
                alignItems: "center",
                background: r.state === "clear" ? undefined : "hsl(var(--secondary))",
              }}
            >
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.campaign}</span>
                <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{r.milestone}</span>
              </span>
              <span style={{ fontSize: 13 }}>{r.creator}</span>
              <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                {r.amount}
              </span>
              <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {r.windowClosed}
              </span>
              <span
                className="numeric"
                style={{
                  fontSize: 13,
                  color: r.disputes > 0 ? "hsl(var(--destructive))" : undefined,
                  fontWeight: r.disputes > 0 ? 600 : 400,
                }}
              >
                {r.disputes}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {r.state === "clear" && (
                  <>
                    <MilestoneForm action={releaseFromQueue} milestoneId={r.milestoneId} className="ms-btn ms-btn--primary ms-btn--sm" pending="Releasing…">
                      Release
                    </MilestoneForm>
                    <MilestoneForm action={holdRelease} milestoneId={r.milestoneId} className="ms-btn ms-btn--ghost ms-btn--sm" pending="Holding…">
                      Hold
                    </MilestoneForm>
                  </>
                )}
                {r.state === "blocked" && (
                  <>
                    <Link href={`/admin/disputes/${r.disputeSlug}`} className="ms-btn ms-btn--secondary ms-btn--sm">
                      Open dispute
                    </Link>
                    <Badge variant="destructive">Blocked</Badge>
                  </>
                )}
                {r.state === "stale-kyc" && (
                  <>
                    <Link href="/admin/identity" className="ms-btn ms-btn--secondary ms-btn--sm">
                      Review identity
                    </Link>
                    <Badge variant="warning">Stale KYC</Badge>
                  </>
                )}
                {r.state === "held" && (
                  <>
                    <MilestoneForm action={releaseFromQueue} milestoneId={r.milestoneId} className="ms-btn ms-btn--primary ms-btn--sm" pending="Releasing…">
                      Release
                    </MilestoneForm>
                    <Badge variant="outline">{r.note}</Badge>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
          <Icon name="lock" size={14} style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 12, lineHeight: 1.4 }}>
            Releases are irreversible and recorded in the audit log. A held row stays in this queue until a moderator releases it.
          </span>
        </div>
      </div>
    </div>
  );
}

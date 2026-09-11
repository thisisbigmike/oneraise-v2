import { Icon } from "@/components/ui/icon";
import { MilestoneTrack } from "@/components/campaign/milestone-track";
import { MilestoneListMobile } from "@/components/campaign/milestone-list-mobile";
import { DonorShell, type ShellAccount } from "@/components/donor/donor-shell";
import type { DonorFigures, DonorRefund } from "@/lib/view-models";

function Body({
  figure,
  refunds,
  compact,
}: {
  figure: DonorFigures["refunded"];
  refunds: DonorRefund[];
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 16 : 24,
        flex: 1,
        padding: compact ? "20px 20px 28px" : "32px 40px 56px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Donor
        </div>
        <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
          Refunds
        </h2>
      </div>

      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
          boxShadow: compact ? undefined : "var(--shadow-xs)",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          maxWidth: 280,
        }}
      >
        <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Refunded to you
        </span>
        <span className="numeric" style={{ fontSize: 26, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.01em" }}>
          {figure.value}
        </span>
        <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          {figure.meta}
        </span>
      </div>

      {refunds.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 20px",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600 }}>No refunds on your account</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {refunds.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-lg)",
                background: "hsl(var(--surface))",
                boxShadow: "var(--shadow-xs)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8, borderBottom: "1px solid hsl(var(--border))" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <span className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em" }}>
                    {r.campaign}
                  </span>
                  <span className="numeric" style={{ fontSize: 16, fontWeight: 600 }}>
                    {r.amount}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                  {r.creator} · {r.location}
                </span>
                <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                  {r.statusLabel}
                </span>
              </div>
              {r.milestones.length > 0 && (
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: compact ? 8 : undefined }}>
                  {compact ? <MilestoneListMobile milestones={r.milestones} /> : <MilestoneTrack milestones={r.milestones} />}
                </div>
              )}
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid hsl(var(--border))",
                  background: "hsl(var(--canvas))",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <Icon name="clock" size={14} style={{ width: 14, height: 14 }} />
                <span style={{ fontSize: 12, lineHeight: 1.4 }}>{r.note}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DonorRefundsPage({
  account,
  figure,
  refunds,
  reviewCount,
}: {
  account: ShellAccount;
  figure: DonorFigures["refunded"];
  refunds: DonorRefund[];
  reviewCount: number;
}) {
  return (
    <DonorShell
      active="refunds"
      account={account}
      reviewCount={reviewCount}
      desktop={<Body figure={figure} refunds={refunds} />}
      mobile={<Body figure={figure} refunds={refunds} compact />}
    />
  );
}

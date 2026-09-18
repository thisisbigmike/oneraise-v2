import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { CreatorShell, NoCampaign } from "@/components/creator/creator-shell";
import type { CreatorShellData, NextPayout, PayoutEntry } from "@/lib/view-models";

function Body({ history, next, compact }: { history: PayoutEntry[]; next: NextPayout | null; compact?: boolean }) {
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
          Creator
        </div>
        <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
          Payouts
        </h2>
      </div>

      {next && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 20px",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
            flexWrap: compact ? "wrap" : undefined,
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
            <Icon name="circle-dollar-sign" size={16} style={{ width: 16, height: 16 }} />
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Next payout · {next.stage}</span>
            <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              {next.gross} − fee {next.fee}. {next.note}
            </span>
          </div>
          <span className="numeric" style={{ fontSize: 18, fontWeight: 600, flexShrink: 0 }}>
            {next.net}
          </span>
        </div>
      )}

      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
          boxShadow: compact ? undefined : "var(--shadow-xs)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
          <h3 className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em", margin: 0 }}>
            Payout history
          </h3>
        </div>
        {history.length === 0 && (
          <div style={{ padding: "16px 20px", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            Nothing has been released yet. A payout appears here the moment a stage releases.
          </div>
        )}
        {history.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: compact ? "flex-start" : "center",
              flexDirection: compact ? "column" : "row",
              gap: compact ? 8 : 16,
              padding: compact ? 16 : "16px 20px",
              borderBottom: i === history.length - 1 ? undefined : "1px solid hsl(var(--border))",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: compact ? undefined : 1, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{p.stage}</span>
              <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                Released {p.releasedDate} · {p.account}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                width: compact ? "100%" : undefined,
                justifyContent: compact ? "space-between" : undefined,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
                <span className="numeric" style={{ fontSize: 14, fontWeight: 600 }}>
                  {p.net}
                </span>
                <span className="numeric" style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                  {p.gross} − fee {p.fee}
                </span>
              </div>
              <Badge variant={p.status === "Paid" ? "funded" : "neutral"}>{p.status}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
        <Icon name="lock" size={14} style={{ width: 14, height: 14 }} />
        <span style={{ fontSize: 12, lineHeight: 1.4 }}>
          OneRaise takes a 2.5% platform fee at the moment a milestone releases. See payout terms for the full schedule.
        </span>
      </div>
    </div>
  );
}

export function CreatorPayoutsPage({
  shell,
  data,
}: {
  shell: CreatorShellData;
  data: { history: PayoutEntry[]; next: NextPayout | null } | null;
}) {
  return (
    <CreatorShell
      active="payouts"
      shell={shell}
      desktop={data ? <Body {...data} /> : <NoCampaign />}
      mobile={data ? <Body {...data} compact /> : <NoCampaign compact />}
    />
  );
}

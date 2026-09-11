import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { CreatorShell, NoCampaign } from "@/components/creator/creator-shell";
import type { CreatorShellData, LadderStage } from "@/lib/view-models";

function Body({ shortTitle, ladder, compact }: { shortTitle: string; ladder: LadderStage[]; compact?: boolean }) {
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
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Creator
          </div>
          <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
            Milestones
          </h2>
        </div>
        {!compact && (
          <Link href="/creator" className="ms-btn ms-btn--secondary ms-btn--md">
            Go to active stage
          </Link>
        )}
      </div>

      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
          boxShadow: compact ? undefined : "var(--shadow-xs)",
          overflow: "hidden",
        }}
      >
        {ladder.length === 0 && (
          <div style={{ padding: 20, fontSize: 13, color: "hsl(var(--muted-foreground))" }}>This campaign has no stages defined.</div>
        )}
        {ladder.map((stage, i) => (
          <div
            key={stage.number}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: compact ? 16 : "16px 20px",
              borderBottom: i === ladder.length - 1 ? undefined : "1px solid hsl(var(--border))",
              background: stage.highlighted ? "hsl(var(--secondary))" : undefined,
              flexWrap: compact ? "wrap" : undefined,
            }}
          >
            <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", flexShrink: 0, width: 24 }}>
              {stage.number}
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, flex: compact ? "1 0 100%" : 1, minWidth: 0 }}>{stage.label}</span>
            <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>
              {stage.meta}
            </span>
            <span className="numeric" style={{ fontSize: 14, fontWeight: 600, flexShrink: 0, marginLeft: compact ? undefined : "auto" }}>
              {stage.amount}
            </span>
            <Badge variant={stage.badgeVariant}>{stage.badge}</Badge>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
        <Icon name="lock" size={14} style={{ width: 14, height: 14 }} />
        <span style={{ fontSize: 12, lineHeight: 1.4 }}>
          {shortTitle} releases one stage at a time. A stage unlocks only once the one before it has released.
        </span>
      </div>
    </div>
  );
}

export function CreatorMilestonesPage({
  shell,
  data,
}: {
  shell: CreatorShellData;
  data: { shortTitle: string; ladder: LadderStage[] } | null;
}) {
  return (
    <CreatorShell
      active="milestones"
      shell={shell}
      desktop={data ? <Body {...data} /> : <NoCampaign />}
      mobile={data ? <Body {...data} compact /> : <NoCampaign compact />}
    />
  );
}

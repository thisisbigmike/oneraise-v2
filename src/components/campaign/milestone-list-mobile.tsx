import { Icon } from "@/components/ui/icon";
import type { Milestone } from "@/lib/types";

/** Compact one-line-per-stage list — used wherever a mobile layout needs the
 *  milestone rail collapsed to single rows (hero cards, dashboard summaries). */
export function MilestoneListMobile({ milestones }: { milestones: Milestone[] }) {
  return (
    <>
      {milestones.map((m) => (
        <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className={`ms-track__node ms-track__node--${m.state}`} style={{ width: 24, height: 24 }}>
            {m.state === "released" && <Icon name="check" size={14} strokeWidth={3} />}
            {m.state === "disputed" && <Icon name="alert-triangle" size={12} />}
            {m.state === "active" && <span className="ms-track__pip" style={{ width: 8, height: 8 }} />}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              flex: 1,
              color: m.state === "pending" ? "hsl(var(--muted-foreground))" : undefined,
            }}
          >
            {m.label}
          </span>
          <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
            {m.statusLabel} · {m.amount}
          </span>
        </div>
      ))}
    </>
  );
}

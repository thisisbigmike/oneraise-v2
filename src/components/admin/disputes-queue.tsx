"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { DisputeRow, DisputeStatus } from "@/lib/view-models";

export const STATUS_VARIANT: Record<DisputeStatus, Parameters<typeof Badge>[0]["variant"]> = {
  Breaching: "destructive",
  "In review": "warning",
  "Awaiting creator": "outline",
  New: "neutral",
  Resolved: "funded",
};

type Filter = "all" | "breaching" | "assigned-to-me" | "awaiting-creator";

const COLUMNS = "84px 1fr 110px 70px 100px 110px 120px 110px";

export function DisputesQueue({ rows: disputes, heldPending }: { rows: DisputeRow[]; heldPending: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: disputes.length },
    { key: "breaching", label: "Breaching", count: disputes.filter((d) => d.filterTags.includes("breaching")).length },
    { key: "assigned-to-me", label: "Assigned to me", count: disputes.filter((d) => d.filterTags.includes("assigned-to-me")).length },
    { key: "awaiting-creator", label: "Awaiting creator", count: disputes.filter((d) => d.filterTags.includes("awaiting-creator")).length },
  ];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return disputes.filter((d) => {
      if (filter !== "all" && !d.filterTags.includes(filter)) return false;
      if (q && !(d.campaign.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.assignee.toLowerCase().includes(q)))
        return false;
      return true;
    });
  }, [disputes, filter, query]);

  return (
    <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
      <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Queue
            </div>
            <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
              Disputes
            </h2>
          </div>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {heldPending} held pending open decisions
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`ms-badge numeric ${filter === f.key ? "ms-badge--primary" : "ms-badge--outline"}`}
              style={{ cursor: "pointer", fontFamily: "inherit", border: filter === f.key ? undefined : "1px solid hsl(var(--border))" }}
              onClick={() => setFilter(f.key)}
            >
              {f.label} {f.count}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative", display: "flex", width: 260 }}>
            <input
              type="search"
              className="ms-input"
              style={{ paddingLeft: 36 }}
              placeholder="Case, campaign or assignee"
              aria-label="Search disputes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "hsl(var(--muted-foreground))",
                display: "flex",
              }}
            >
              <Icon name="search" size={16} style={{ width: 16, height: 16 }} />
            </span>
          </div>
        </div>

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
            {["Case", "Campaign and milestone", "Held", "Donors", "Opened", "Decide within", "Assignee", "Status"].map((h) => (
              <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                {h}
              </span>
            ))}
          </div>

          {rows.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              No disputes match this filter.
            </div>
          )}

          {rows.map((d, i) => (
            <Link
              key={d.id}
              href={`/admin/disputes/${d.slug}`}
              style={{
                display: "grid",
                gridTemplateColumns: COLUMNS,
                gap: 14,
                padding: "14px 20px",
                borderBottom: i === rows.length - 1 ? undefined : "1px solid hsl(var(--border))",
                alignItems: "center",
                textDecoration: "none",
                color: "hsl(var(--foreground))",
              }}
            >
              <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                {d.id}
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.campaign}
                </span>
                <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{d.milestone}</span>
              </span>
              <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                {d.held}
              </span>
              <span className="numeric" style={{ fontSize: 13 }}>
                {d.donors}
              </span>
              <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {d.opened}
              </span>
              <span
                className="numeric"
                style={{
                  fontSize: 13,
                  color: d.deadlineUrgent ? "hsl(var(--destructive))" : undefined,
                  fontWeight: d.deadlineUrgent ? 600 : 400,
                }}
              >
                {d.deadline}
              </span>
              <span style={{ fontSize: 13, color: d.assignee === "Unassigned" ? "hsl(var(--muted-foreground))" : undefined }}>{d.assignee}</span>
              <Badge variant={STATUS_VARIANT[d.status]}>{d.status}</Badge>
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
          <Icon name="clock" size={14} style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 12, lineHeight: 1.4 }}>
            A dispute holds the whole milestone, not just the disputing donors&apos; share. Escrow does not move until the case closes.
          </span>
        </div>
      </div>
    </div>
  );
}

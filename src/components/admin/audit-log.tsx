"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { AuditActionType, AuditEntry } from "@/lib/view-models";

const ACTION_VARIANT: Record<AuditActionType, Parameters<typeof Badge>[0]["variant"]> = {
  Release: "funded",
  Refund: "warning",
  Identity: "neutral",
  Takedown: "destructive",
  Hold: "outline",
  Account: "neutral",
  Dispute: "outline",
  Moderation: "warning",
};

type Filter = "all" | AuditEntry["filterTag"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All actions" },
  { key: "releases", label: "Releases" },
  { key: "refunds", label: "Refunds" },
  { key: "disputes", label: "Disputes" },
  { key: "takedowns", label: "Moderation" },
  { key: "identity", label: "Identity" },
  { key: "account-changes", label: "Account changes" },
];

const COLUMNS = "130px 120px 130px 1fr 110px 120px";

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter !== "all" && e.filterTag !== filter) return false;
      if (q && !(e.actor.toLowerCase().includes(q) || e.target.toLowerCase().includes(q) || e.reason.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [entries, filter, query]);

  return (
    <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
      <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Platform
            </div>
            <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
              Audit log
            </h2>
          </div>
          <a href="/admin/audit/export" className="ms-btn ms-btn--secondary ms-btn--md">
            Export CSV
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`ms-badge ${filter === f.key ? "ms-badge--primary" : "ms-badge--outline"}`}
              style={{ cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative", display: "flex", width: 240 }}>
            <input
              type="search"
              className="ms-input"
              style={{ paddingLeft: 36 }}
              placeholder="Actor, target or case"
              aria-label="Search the audit log"
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
            {["Timestamp", "Actor", "Action", "Target and reason", "Amount", "Source"].map((h) => (
              <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                {h}
              </span>
            ))}
          </div>

          {rows.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              No entries match this filter.
            </div>
          )}

          {rows.map((e, i) => (
            <div
              key={e.id}
              style={{
                display: "grid",
                gridTemplateColumns: COLUMNS,
                gap: 14,
                padding: "13px 20px",
                borderBottom: i === rows.length - 1 ? undefined : "1px solid hsl(var(--border))",
                alignItems: "start",
              }}
            >
              <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", lineHeight: 1.5 }}>
                {e.timestamp}
              </span>
              <span style={{ fontSize: 13 }}>{e.actor}</span>
              <Badge variant={ACTION_VARIANT[e.action] ?? "neutral"}>{e.action}</Badge>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 13 }}>{e.target}</span>
                <span style={{ fontSize: 12, lineHeight: 1.5, color: "hsl(var(--muted-foreground))" }}>{e.reason}</span>
              </span>
              <span
                className="numeric"
                style={{
                  fontSize: 13,
                  fontWeight: e.amount === "—" ? 400 : 600,
                  color: e.amount === "—" ? "hsl(var(--muted-foreground))" : undefined,
                }}
              >
                {e.amount}
              </span>
              <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {e.source}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
          <Icon name="lock" size={14} style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 12, lineHeight: 1.4 }}>
            Entries cannot be edited or deleted. A wrong decision is corrected by a new entry that supersedes it.
          </span>
        </div>
      </div>
    </div>
  );
}

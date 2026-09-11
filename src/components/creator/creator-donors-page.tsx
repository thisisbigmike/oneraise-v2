"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreatorShell, NoCampaign } from "@/components/creator/creator-shell";
import { count } from "@/lib/format";
import type { CreatorShellData, DonorEntry } from "@/lib/view-models";

function Body({ donors, total, compact }: { donors: DonorEntry[]; total: number; compact?: boolean }) {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? donors.filter((d) => d.name.toLowerCase().includes(q) || d.meta.toLowerCase().includes(q)) : donors;
  }, [donors, query]);

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
            Donors
          </h2>
        </div>
        {!compact && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              {count(total)} total
            </span>
            {total > 0 && (
              <a href="/creator/donors/export" className="ms-btn ms-btn--secondary ms-btn--md">
                Export CSV
              </a>
            )}
          </div>
        )}
      </div>

      <div style={{ position: "relative", display: "flex", maxWidth: compact ? undefined : 320 }}>
        <input
          type="search"
          className="ms-input"
          style={{ paddingLeft: 36 }}
          placeholder="Search donors"
          aria-label="Search donors"
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

      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
          boxShadow: compact ? undefined : "var(--shadow-xs)",
          overflow: "hidden",
        }}
      >
        {rows.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {donors.length === 0 ? "No pledges yet." : "No donors match that search."}
          </div>
        )}
        {rows.map((d, i) => (
          <div
            key={d.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: compact ? "14px 16px" : "14px 20px",
              borderBottom: i === rows.length - 1 ? undefined : "1px solid hsl(var(--border))",
            }}
          >
            <Avatar initials={d.initials} size={32} fontSize={12} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</span>
              <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {d.meta}
              </span>
            </div>
            <span className="numeric" style={{ fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
              {d.amount}
            </span>
            <Badge variant="outline">{d.tier}</Badge>
          </div>
        ))}
      </div>
      {!query && total > donors.length && (
        <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          Showing the {count(donors.length)} most recent of {count(total)}. Export the CSV for everyone.
        </span>
      )}
    </div>
  );
}

export function CreatorDonorsPage({
  shell,
  data,
}: {
  shell: CreatorShellData;
  data: { donors: DonorEntry[]; total: number } | null;
}) {
  return (
    <CreatorShell
      active="donors"
      shell={shell}
      desktop={data ? <Body {...data} /> : <NoCampaign />}
      mobile={data ? <Body {...data} compact /> : <NoCampaign compact />}
    />
  );
}

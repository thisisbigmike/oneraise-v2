"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { MilestoneTrack } from "@/components/campaign/milestone-track";
import { MilestoneListMobile } from "@/components/campaign/milestone-list-mobile";
import { DonorShell, type ShellAccount } from "@/components/donor/donor-shell";
import type { DonorPledge } from "@/lib/view-models";

type Filter = "all" | "live" | "funded" | "refunded";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "funded", label: "Funded" },
  { key: "refunded", label: "Refunded" },
];

function matches(filter: Filter, p: DonorPledge) {
  if (filter === "all") return true;
  if (filter === "live") return p.status === "live" || p.status === "expiring" || p.status === "paused";
  if (filter === "refunded") return p.status === "refunded" || p.status === "failed";
  return p.status === filter;
}

function Body({ pledges, compact }: { pledges: DonorPledge[]; compact?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const rows = useMemo(() => pledges.filter((p) => matches(filter, p)), [pledges, filter]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 20 : 24,
        flex: 1,
        padding: compact ? "20px 20px 28px" : "32px 40px 56px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Donor
        </div>
        <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
          Your pledges
        </h2>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`ms-badge numeric ${filter === f.key ? "ms-badge--primary" : "ms-badge--outline"}`}
            style={{ cursor: "pointer", fontFamily: "inherit" }}
            onClick={() => setFilter(f.key)}
          >
            {f.label} {pledges.filter((p) => matches(f.key, p)).length}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: compact ? 16 : 0,
          border: compact ? undefined : "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: compact ? undefined : "hsl(var(--surface))",
          boxShadow: compact ? undefined : "var(--shadow-xs)",
          overflow: compact ? undefined : "hidden",
        }}
      >
        {rows.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {pledges.length === 0 ? (
              <>
                Nothing here yet. <Link href="/discover">Find a campaign to back</Link>.
              </>
            ) : (
              "No pledges match this filter."
            )}
          </div>
        )}
        {rows.map((p, i) =>
          compact ? (
            <Link
              key={p.id}
              href={`/campaigns/${p.campaignSlug}`}
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-lg)",
                background: "hsl(var(--surface))",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <span className="font-display" style={{ fontSize: 17, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em" }}>
                  {p.campaign}
                </span>
                <StatusBadge status={p.status} />
              </div>
              <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {p.creator} · {p.location}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <MilestoneListMobile milestones={p.milestones} />
              </div>
              <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {p.pledgedLabel} · {p.stageNote}
              </span>
            </Link>
          ) : (
            <Link
              key={p.id}
              href={`/campaigns/${p.campaignSlug}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "18px 20px",
                borderBottom: i === rows.length - 1 ? undefined : "1px solid hsl(var(--border))",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 3, width: 300, flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{p.campaign}</span>
                <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                  {p.pledgedLabel}
                </span>
                <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                  {p.inEscrow} in escrow · {p.released} released
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {p.milestones.length > 0 ? (
                  <MilestoneTrack milestones={p.milestones} />
                ) : (
                  <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>No stages defined</span>
                )}
              </div>
              <StatusBadge status={p.status} />
            </Link>
          ),
        )}
      </div>
    </div>
  );
}

export function DonorPledgesPage({
  account,
  pledges,
  reviewCount,
}: {
  account: ShellAccount;
  pledges: DonorPledge[];
  reviewCount: number;
}) {
  return (
    <DonorShell
      active="pledges"
      account={account}
      reviewCount={reviewCount}
      desktop={<Body pledges={pledges} />}
      mobile={<Body pledges={pledges} compact />}
    />
  );
}

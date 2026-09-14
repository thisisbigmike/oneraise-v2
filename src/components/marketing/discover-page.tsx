"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Icon } from "@/components/ui/icon";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { StatusBadge } from "@/components/ui/status-badge";
import { FundingProgress } from "@/components/campaign/funding-progress";
import { count } from "@/lib/format";
import type { CampaignCard } from "@/lib/view-models";

export function DiscoverPage({ campaigns }: { campaigns: CampaignCard[] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(campaigns.map((c) => c.category)))],
    [campaigns],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (category !== "All" && c.category !== category) return false;
      if (
        q &&
        !(
          c.title.toLowerCase().includes(q) ||
          c.creatorName.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [campaigns, category, query]);

  return (
    <div style={{ background: "hsl(var(--canvas))" }}>
      <Header />
      <div
        style={{
          padding: "56px clamp(20px, 8vw, 120px) 96px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 640,
          }}
        >
          <div
            className="eyebrow"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Discover
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(30px, 4vw, 40px)",
              lineHeight: 1.15,
              letterSpacing: "-0.018em",
              fontWeight: 600,
              margin: 0,
            }}
          >
            Campaigns funding right now
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 16,
              lineHeight: 1.65,
              color: "hsl(var(--muted-foreground))",
            }}
          >
            Every campaign here is broken into milestones. Your donation sits in
            escrow and only reaches the creator as they show each stage done.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`ms-badge ${category === c ? "ms-badge--primary" : "ms-badge--outline"}`}
              style={{ cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative", display: "flex", width: 260, maxWidth: "100%" }}>
            <input
              type="search"
              className="ms-input"
              style={{ paddingLeft: 36 }}
              placeholder="Campaign, creator or place"
              aria-label="Search campaigns"
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

        {results.length === 0 ? (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              fontSize: 14,
              color: "hsl(var(--muted-foreground))",
            }}
          >
            {campaigns.length === 0 ? "No campaigns are open right now." : "No campaigns match that search."}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
              gap: 20,
            }}
          >
            {results.map((c) => (
              <Link
                key={c.slug}
                href={`/campaigns/${c.slug}`}
                style={{
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-lg)",
                  background: "hsl(var(--surface))",
                  boxShadow: "var(--shadow-xs)",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "hsl(var(--foreground))",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ImagePlaceholder
                  caption={c.heroCaption}
                  style={{ width: "100%", height: 190 }}
                />
                <div
                  style={{
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span
                      className="eyebrow"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <span
                    className="font-display"
                    style={{
                      fontSize: 19,
                      lineHeight: 1.3,
                      fontWeight: 600,
                      letterSpacing: "-0.010em",
                      textWrap: "balance",
                    }}
                  >
                    {c.title}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    {c.creatorName} · {c.location}
                  </span>
                  <FundingProgress
                    raised={c.raised}
                    goalLabel={c.goalLabel}
                    fillPct={c.fillPct}
                    variant="card"
                  />
                  <span
                    className="numeric"
                    style={{
                      fontSize: 12,
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    {count(c.backerCount)} donors · {c.timeLeftLabel} · {c.stageLabel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

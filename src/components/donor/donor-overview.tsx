"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PillNav } from "@/components/ui/pill-nav";
import { Avatar } from "@/components/ui/avatar";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { StatusBadge } from "@/components/ui/status-badge";
import { FormSuccess } from "@/components/ui/form-status";
import { FundingProgress } from "@/components/campaign/funding-progress";
import { MilestoneTrack } from "@/components/campaign/milestone-track";
import { DonorShell, type ShellAccount } from "@/components/donor/donor-shell";
import { ReviewDrawer, ReviewQueueRow } from "@/components/donor/review-queue";
import type { CampaignCard, DonorFigures, DonorPledge, ReviewQueueItem } from "@/lib/view-models";

function EmptyState({ compact }: { compact?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 12 : 14,
        padding: compact ? "14px 16px" : "16px 20px",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
      }}
    >
      <span
        style={{
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
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
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: compact ? 14 : 15, fontWeight: 600 }}>Nothing needs your review</span>
        <span className="numeric" style={{ fontSize: compact ? 12 : 13, color: "hsl(var(--muted-foreground))" }}>
          {compact
            ? "Check back for the next submission"
            : "Every submitted milestone has been decided. Check back when the next one comes up for review."}
        </span>
      </div>
    </div>
  );
}

function NoPledges() {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px dashed hsl(var(--input))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--canvas))",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600 }}>You haven&apos;t backed a campaign yet</span>
      <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
        Pledges sit in escrow and release one milestone at a time — you review each one.
      </span>
      <Link href="/discover" className="ms-btn ms-btn--primary ms-btn--md">
        Discover campaigns
      </Link>
    </div>
  );
}

function PledgeCard({ p }: { p: DonorPledge }) {
  return (
    <Link
      href={`/campaigns/${p.campaignSlug}`}
      style={{
        display: "block",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
        boxShadow: "var(--shadow-xs)",
        overflow: "hidden",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <div style={{ display: "flex", gap: 20, padding: 20, borderBottom: "1px solid hsl(var(--border))" }}>
        <ImagePlaceholder caption="16:10" style={{ width: 176, height: 110, flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="font-display" style={{ fontSize: 21, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em" }}>
                {p.campaign}
              </span>
              <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {p.creator} · {p.location}
              </span>
            </div>
            <StatusBadge status={p.status} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 4 }}>
            {[
              { l: "You pledged", v: p.pledgedAmount },
              { l: "Still in escrow", v: p.inEscrow },
              { l: "Released", v: p.released },
              ...(p.refunded !== "$0" ? [{ l: "Refunded", v: p.refunded }] : []),
            ].map((f) => (
              <div key={f.l} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {f.l}
                </span>
                <span className="numeric" style={{ fontSize: 16, fontWeight: 600 }}>
                  {f.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {p.milestones.length > 0 && (
        <div style={{ padding: 20 }}>
          <MilestoneTrack milestones={p.milestones} />
        </div>
      )}
    </Link>
  );
}

export function DonorOverview({
  account,
  figures,
  queue,
  pledges,
  liveNow,
}: {
  account: ShellAccount;
  figures: DonorFigures;
  queue: ReviewQueueItem[];
  pledges: DonorPledge[];
  liveNow: CampaignCard[];
}) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const openItem = queue.find((q) => q.id === openItemId) ?? null;
  const isQuiet = queue.length === 0;

  const onDone = useCallback((message: string) => {
    setOpenItemId(null);
    setNotice(message);
  }, []);

  const desktop = (
    <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Donor
          </div>
          <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
            Overview
          </h2>
        </div>
        <Link href="/discover" className="ms-btn ms-btn--secondary ms-btn--md">
          <Icon name="search" size={16} style={{ width: 16, height: 16 }} />
          Discover campaigns
        </Link>
      </div>

      {notice && <FormSuccess message={notice} />}
      {isQuiet && <EmptyState />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "In escrow", ...figures.inEscrow },
          { label: "Released to creators", ...figures.released },
          { label: "Refunded to you", ...figures.refunded },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--surface))",
              boxShadow: "var(--shadow-xs)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              {f.label}
            </span>
            <span className="numeric" style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.01em" }}>
              {f.value}
            </span>
            <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              {f.meta}
            </span>
          </div>
        ))}
      </div>

      {!isQuiet && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
            Needs your review
          </h3>
          <div
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--surface))",
              boxShadow: "var(--shadow-xs)",
              overflow: "hidden",
            }}
          >
            {queue.map((item, i) => (
              <div key={item.id} style={{ borderBottom: i === queue.length - 1 ? undefined : "1px solid hsl(var(--border))" }}>
                <ReviewQueueRow item={item} onReview={() => setOpenItemId(item.id)} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
            <Icon name="clock" size={14} style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: 12, lineHeight: 1.4 }}>No response counts as approval. A milestone releases when its window closes.</span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
          What you have funded
        </h3>
        {pledges.length === 0 ? (
          <NoPledges />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {pledges.map((p) => (
              <PledgeCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>

      {liveNow.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20 }}>
            <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
              Live now
            </h3>
            <Link href="/discover" style={{ fontSize: 13 }}>
              All campaigns
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {liveNow.map((c) => (
              <Link
                key={c.slug}
                href={`/campaigns/${c.slug}`}
                style={{
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-lg)",
                  background: "hsl(var(--surface))",
                  boxShadow: "var(--shadow-xs)",
                  overflow: "hidden",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <ImagePlaceholder caption={c.heroCaption} style={{ width: "100%", height: 200 }} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {c.category}
                  </span>
                  <span className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em", textWrap: "balance" }}>
                    {c.title}
                  </span>
                  <FundingProgress raised={c.raised} goalLabel={c.goalLabel} fillPct={c.fillPct} variant="card" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const mobile = (
    <>
      <PillNav
        size="sm"
        end={
          <Link href="/donor/settings" aria-label="Account settings">
            <Avatar initials={account.initials} size={32} fontSize={12} />
          </Link>
        }
      />
      <div style={{ flex: 1, padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Donor
          </div>
          <h3 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
            Overview
          </h3>
        </div>

        {notice && <FormSuccess message={notice} />}
        {isQuiet && <EmptyState compact />}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "In escrow", value: figures.inEscrow.value },
            { label: "Released", value: figures.released.value },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-lg)",
                background: "hsl(var(--surface))",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                {f.label}
              </span>
              <span className="numeric" style={{ fontSize: 24, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.01em" }}>
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {!isQuiet && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <h4 className="font-display" style={{ fontSize: 21, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
                Needs your review
              </h4>
              <span className="ms-badge ms-badge--funded numeric">{queue.length}</span>
            </div>
            {queue.map((item) => (
              <ReviewQueueRow key={item.id} item={item} onReview={() => setOpenItemId(item.id)} mobile />
            ))}
          </div>
        )}

        <h4 className="font-display" style={{ fontSize: 21, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: "4px 0 0" }}>
          What you have funded
        </h4>
        {pledges.length === 0 && <NoPledges />}
        {pledges.map((p) => (
          <Link
            key={p.id}
            href={`/campaigns/${p.campaignSlug}`}
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--surface))",
              overflow: "hidden",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <ImagePlaceholder caption="16:10" style={{ width: "100%", height: 160 }} />
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <span className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em", textWrap: "balance" }}>
                  {p.campaign}
                </span>
                <StatusBadge status={p.status} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {[
                  { l: "Pledged", v: p.pledgedAmount },
                  { l: "In escrow", v: p.inEscrow },
                  { l: "Released", v: p.released },
                ].map((f) => (
                  <div key={f.l} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {f.l}
                    </span>
                    <span className="numeric" style={{ fontSize: 15, fontWeight: 600 }}>
                      {f.v}
                    </span>
                  </div>
                ))}
              </div>
              <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {p.stageNote}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <>
      <DonorShell active="overview" account={account} reviewCount={queue.length} desktop={desktop} mobile={mobile} />
      {openItem && <ReviewDrawer key={openItem.id} item={openItem} onClose={() => setOpenItemId(null)} onDone={onDone} />}
    </>
  );
}

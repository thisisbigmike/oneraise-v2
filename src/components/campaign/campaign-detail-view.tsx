"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PillNav } from "@/components/ui/pill-nav";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { FundingProgress } from "@/components/campaign/funding-progress";
import { BackerStack } from "@/components/campaign/backer-stack";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { AuthModal } from "@/components/auth/auth-modal";
import { FormError, FormSuccess, SubmitButton } from "@/components/ui/form-status";
import { createPledge, toggleFollow } from "@/server/actions/public";
import { count } from "@/lib/format";
import type { CampaignDetail, CampaignViewerState, DetailMilestone, Tier } from "@/lib/view-models";
import styles from "@/styles/responsive.module.css";

type Tab = "story" | "updates" | "backers";

function StageNode({ state }: { state: DetailMilestone["state"] }) {
  if (state === "released") {
    return (
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          background: "hsl(var(--milestone-released))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "hsl(var(--accent-foreground))",
        }}
      >
        <Icon name="check" size={16} strokeWidth={3} />
      </span>
    );
  }
  if (state === "submitted") {
    return (
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          background: "hsl(var(--warning))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "hsl(var(--warning-foreground))",
        }}
      >
        <Icon name="file-text" size={14} />
      </span>
    );
  }
  return (
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: 999,
        border: "2px solid hsl(var(--milestone-pending))",
        background: "hsl(var(--surface))",
        flexShrink: 0,
        display: "block",
      }}
    />
  );
}

function DesktopMilestoneCard({
  milestone,
  isLast,
  onViewEvidence,
}: {
  milestone: DetailMilestone;
  isLast: boolean;
  onViewEvidence: () => void;
}) {
  const isCurrent = milestone.state === "current" || milestone.state === "submitted";
  return (
    <li style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", paddingLeft: 12 }}>
        <StageNode state={milestone.state} />
        {!isLast && (
          <span
            style={{
              height: 2,
              flex: 1,
              margin: "0 8px",
              borderRadius: 999,
              background:
                milestone.state === "released" ? "hsl(var(--milestone-released))" : "hsl(var(--milestone-pending))",
            }}
          />
        )}
      </div>
      <div
        style={{
          marginTop: 12,
          padding: 12,
          border: isCurrent ? "1px solid hsl(var(--primary))" : "1px solid transparent",
          borderRadius: "var(--radius-lg)",
          background: isCurrent ? "hsl(var(--secondary))" : undefined,
        }}
      >
        <div className="eyebrow" style={{ color: isCurrent ? "hsl(var(--primary-hover))" : "hsl(var(--muted-foreground))" }}>
          Stage {milestone.stageNumber}
          {isCurrent ? " · current" : ""}
        </div>
        <div
          className="numeric"
          style={{
            fontSize: 20,
            fontWeight: 600,
            marginTop: 8,
            color: milestone.state === "pending" ? "hsl(var(--muted-foreground))" : undefined,
          }}
        >
          {milestone.amount}
        </div>
        <div
          className="font-display"
          style={{
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            marginTop: 2,
            color: milestone.state === "pending" ? "hsl(var(--muted-foreground))" : undefined,
          }}
        >
          {milestone.label}
        </div>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            lineHeight: 1.5,
            color: isCurrent ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
            minHeight: 58,
          }}
        >
          {milestone.description}
        </p>
        <span className={`ms-badge ms-badge--${milestone.badgeVariant}`} style={{ marginTop: 2 }}>
          {milestone.badgeLabel}
        </span>
        <div
          className="numeric"
          style={{ fontSize: 12, color: isCurrent ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))", marginTop: 8 }}
        >
          {milestone.meta}
        </div>
        {(milestone.state === "submitted" || milestone.state === "released") && milestone.evidenceNote && (
          <button type="button" className="ms-btn ms-btn--secondary ms-btn--sm" style={{ marginTop: 12 }} onClick={onViewEvidence}>
            View evidence
          </button>
        )}
      </div>
    </li>
  );
}

function MobileMilestoneRow({
  milestone,
  isLast,
  onViewEvidence,
}: {
  milestone: DetailMilestone;
  isLast: boolean;
  onViewEvidence: () => void;
}) {
  const isCurrent = milestone.state === "current" || milestone.state === "submitted";
  if (!isCurrent) {
    return (
      <li style={{ display: "flex", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
          <StageNode state={milestone.state} />
          {!isLast && (
            <span
              style={{
                flex: 1,
                width: 2,
                margin: "4px 0",
                background:
                  milestone.state === "released" ? "hsl(var(--milestone-released))" : "hsl(var(--milestone-pending))",
              }}
            />
          )}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            paddingBottom: 16,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 8,
            minHeight: 24,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, color: milestone.state === "pending" ? "hsl(var(--muted-foreground))" : undefined }}>
            {milestone.stageNumber} · {milestone.label}
          </span>
          <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", whiteSpace: "nowrap" }}>
            {milestone.amount} · {milestone.badgeLabel}
          </span>
        </div>
      </li>
    );
  }
  return (
    <li style={{ display: "flex", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
        <StageNode state={milestone.state} />
        {!isLast && <span style={{ flex: 1, width: 2, margin: "4px 0", background: "hsl(var(--milestone-pending))" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: 16 }}>
        <div
          style={{
            border: "1px solid hsl(var(--primary))",
            background: "hsl(var(--secondary))",
            borderRadius: "var(--radius-lg)",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span className="eyebrow" style={{ color: "hsl(var(--primary-hover))" }}>
              Stage {milestone.stageNumber} · current
            </span>
            <span className={`ms-badge ms-badge--${milestone.badgeVariant}`}>{milestone.badgeLabel}</span>
          </div>
          <div>
            <div className="numeric" style={{ fontSize: 22, fontWeight: 600 }}>
              {milestone.amount}
            </div>
            <div className="font-display" style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", marginTop: 2 }}>
              {milestone.label}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{milestone.description}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--primary-hover))" }}>
            <Icon name="clock" size={14} style={{ width: 14, height: 14 }} />
            <span className="numeric" style={{ fontSize: 12 }}>
              {milestone.meta}
            </span>
          </div>
          {milestone.state === "submitted" && (
            <button
              type="button"
              className="ms-btn ms-btn--secondary"
              style={{ width: "100%", height: 44, fontSize: 14, marginTop: 2 }}
              onClick={onViewEvidence}
            >
              View evidence
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function TabStrip({
  tab,
  setTab,
  mobile,
  updates,
  backers,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  mobile?: boolean;
  updates: number;
  backers: number;
}) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "story", label: "Story" },
    { key: "updates", label: mobile ? "Updates" : `Updates · ${count(updates)}` },
    { key: "backers", label: mobile ? "Backers" : `Backers · ${count(backers)}` },
  ];
  return (
    <div className="ms-tabs__list" role="tablist" style={mobile ? { display: "flex", width: "100%" } : undefined}>
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={tab === t.key}
          className="ms-tabs__trigger"
          style={mobile ? { flex: 1, height: 36 } : undefined}
          data-state={tab === t.key ? "active" : "inactive"}
          onClick={() => setTab(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function TabContent({ tab, detail }: { tab: Tab; detail: CampaignDetail }) {
  if (tab === "story") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {detail.story.map((p, i) => (
          <p key={i} style={{ margin: 0, fontSize: 16, lineHeight: 1.65 }}>
            {p}
          </p>
        ))}
      </div>
    );
  }
  if (tab === "updates") {
    if (detail.updates.length === 0) {
      return <p style={{ margin: 0, fontSize: 15, color: "hsl(var(--muted-foreground))" }}>No updates posted yet.</p>;
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {detail.updates.map((u, i) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingBottom: i === detail.updates.length - 1 ? 0 : 20,
              borderBottom: i === detail.updates.length - 1 ? undefined : "1px solid hsl(var(--border))",
            }}
          >
            <span className="numeric eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              {u.date}
            </span>
            <span className="font-display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>
              {u.title}
            </span>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{u.body}</p>
          </div>
        ))}
      </div>
    );
  }
  if (detail.backers.length === 0) {
    return <p style={{ margin: 0, fontSize: 15, color: "hsl(var(--muted-foreground))" }}>Nobody has backed this campaign yet.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {detail.backers.map((b, i) => (
        <div
          key={b.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 0",
            borderBottom: i === detail.backers.length - 1 ? undefined : "1px solid hsl(var(--border))",
          }}
        >
          <Avatar initials={b.initials} size={32} fontSize={12} />
          <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{b.name}</span>
          <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{b.tierLabel}</span>
          <span className="numeric" style={{ fontSize: 14, fontWeight: 600, width: 70, textAlign: "right" }}>
            {b.amount}
          </span>
        </div>
      ))}
      {detail.backerCount > detail.backers.length && (
        <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", paddingTop: 14 }}>
          and {count(detail.backerCount - detail.backers.length)} more, most recent first
        </span>
      )}
    </div>
  );
}

function TierOption({
  tier,
  selected,
  onSelect,
  compact,
}: {
  tier: Tier;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={tier.soldOut}
      aria-pressed={selected}
      style={{
        border: selected ? "1px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-md)",
        padding: compact ? 14 : "12px 14px",
        display: "flex",
        flexDirection: compact ? "row" : "column",
        alignItems: compact ? "center" : undefined,
        gap: compact ? 14 : 3,
        cursor: tier.soldOut ? "not-allowed" : "pointer",
        opacity: tier.soldOut ? 0.55 : 1,
        background: selected ? "hsl(var(--secondary))" : "hsl(var(--surface))",
        textAlign: "left",
        fontFamily: "inherit",
        width: "100%",
        minHeight: compact ? 44 : undefined,
      }}
    >
      {compact && (
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            border: selected ? "2px solid hsl(var(--primary))" : "2px solid hsl(var(--input))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {selected && <span style={{ width: 10, height: 10, borderRadius: 999, background: "hsl(var(--primary))" }} />}
        </span>
      )}
      <span style={{ flex: compact ? 1 : undefined, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        {!compact && (
          <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <span className="numeric" style={{ fontSize: 15, fontWeight: 600 }}>
              {tier.amount}
            </span>
            <span className="numeric" style={{ fontSize: 12, color: selected ? "hsl(var(--primary-hover))" : "hsl(var(--muted-foreground))" }}>
              {tier.meta}
            </span>
          </span>
        )}
        {compact && (
          <span className="numeric" style={{ fontSize: 15, fontWeight: 600 }}>
            {tier.amount}
          </span>
        )}
        <span style={{ fontSize: 13, color: selected ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>{tier.label}</span>
      </span>
      {compact && (
        <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          {tier.meta}
        </span>
      )}
    </button>
  );
}

function Dialog({
  label,
  onClose,
  children,
  width = 480,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div aria-hidden="true" onClick={onClose} style={{ position: "absolute", inset: 0, background: "hsl(var(--scrim) / 0.5)" }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        style={{
          position: "relative",
          width: `min(${width}px, calc(100vw - 40px))`,
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
          boxShadow: "var(--shadow-lg)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <button
          type="button"
          className="ms-btn ms-btn--ghost ms-btn--icon"
          aria-label="Close"
          onClick={onClose}
          style={{ position: "absolute", right: 12, top: 12 }}
        >
          <Icon name="x" size={16} style={{ width: 16, height: 16 }} />
        </button>
        {children}
      </div>
    </div>
  );
}

/** The last step before a donation is recorded. */
function PledgeConfirm({
  detail,
  tier,
  onClose,
  onPledged,
}: {
  detail: CampaignDetail;
  tier: Tier;
  onClose: () => void;
  onPledged: (message: string) => void;
}) {
  const [state, action] = useActionState(createPledge, {});
  useEffect(() => {
    if (state.ok && state.message) onPledged(state.message);
  }, [state.ok, state.message, onPledged]);

  return (
    <Dialog label="Confirm your donation" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 32 }}>
        <h4 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
          Confirm your donation
        </h4>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "hsl(var(--muted-foreground))" }}>
          {detail.title} · {detail.creator.name}
        </p>
      </div>
      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-md)",
          background: "hsl(var(--canvas))",
          overflow: "hidden",
        }}
      >
        {[
          { l: "Your donation", v: tier.amount },
          { l: "Reward", v: tier.label },
          { l: "Releases", v: `One stage at a time · ${detail.milestones.length} stages` },
        ].map((row, i, arr) => (
          <div
            key={row.l}
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
              padding: "12px 14px",
              borderBottom: i === arr.length - 1 ? undefined : "1px solid hsl(var(--border))",
            }}
          >
            <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>{row.l}</span>
            <span className={i === 0 ? "numeric" : undefined} style={{ fontSize: 14, fontWeight: i === 0 ? 600 : 500, textAlign: "right" }}>
              {row.v}
            </span>
          </div>
        ))}
      </div>
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="hidden" name="campaign" value={detail.slug} />
        <input type="hidden" name="tier" value={tier.id} />
        <FormError message={state.error} />
        <SubmitButton className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%" }} pendingLabel="Placing donation…">
          Donate {tier.amount}
        </SubmitButton>
      </form>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "hsl(var(--muted-foreground))" }}>
        <Icon name="lock" size={14} style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 12, lineHeight: 1.5 }}>
          Charged when funding closes. Released one stage at a time. Refunded in full if a stage fails review.
        </span>
      </div>
    </Dialog>
  );
}

function EvidenceDialog({ milestone, onClose }: { milestone: DetailMilestone; onClose: () => void }) {
  return (
    <Dialog label={`Evidence for ${milestone.label}`} onClose={onClose} width={620}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingRight: 32 }}>
        <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Stage {milestone.stageNumber} · {milestone.badgeLabel}
        </span>
        <h4 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
          {milestone.label}
        </h4>
        <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          {milestone.amount} · {milestone.meta}
        </span>
      </div>
      {milestone.evidence.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {milestone.evidence.map((caption, i) => (
            <ImagePlaceholder key={`${caption}-${i}`} caption={caption} style={{ width: "100%", height: 120 }} />
          ))}
        </div>
      )}
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{milestone.evidenceNote}</p>
      {milestone.evidenceDocument && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md)",
            background: "hsl(var(--canvas))",
          }}
        >
          <Icon name="file-text" size={16} style={{ width: 16, height: 16, color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{milestone.evidenceDocument}</span>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 12, borderTop: "1px solid hsl(var(--border))" }}>
        <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Terms, as published
        </span>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{milestone.terms}</p>
      </div>
    </Dialog>
  );
}

function FollowButton({ creatorId, following, signInHref }: { creatorId: number; following: boolean; signInHref: string | null }) {
  const [, action] = useActionState(toggleFollow, {});
  if (signInHref) {
    return (
      <Link href={signInHref} className="ms-btn ms-btn--ghost ms-btn--md">
        <Icon name="heart" size={16} style={{ width: 16, height: 16 }} />
        Follow
      </Link>
    );
  }
  return (
    <form action={action}>
      <input type="hidden" name="creator" value={creatorId} />
      <SubmitButton className="ms-btn ms-btn--ghost ms-btn--md" pendingLabel="Saving…">
        <Icon name="heart" size={16} style={{ width: 16, height: 16, fill: following ? "currentColor" : "none" }} />
        {following ? "Following" : "Follow"}
      </SubmitButton>
    </form>
  );
}

function ShareButton({ compact }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share && compact) await navigator.share({ url });
      else await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // The visitor dismissed the share sheet; nothing to do.
    }
  };
  if (compact) {
    return (
      <button type="button" className="ms-btn ms-btn--ghost" style={{ width: 40, height: 40, padding: 0 }} aria-label="Share" onClick={share}>
        <Icon name={copied ? "check" : "share"} size={20} style={{ width: 20, height: 20 }} />
      </button>
    );
  }
  return (
    <button type="button" className="ms-btn ms-btn--ghost ms-btn--md" onClick={share}>
      <Icon name={copied ? "check" : "share"} size={16} style={{ width: 16, height: 16 }} />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

const CLOSED_LABEL: Partial<Record<CampaignDetail["status"], string>> = {
  funded: "Funding has closed",
  failed: "This campaign didn't reach its goal",
  refunded: "This campaign was refunded",
  paused: "Paused — not taking donations",
  draft: "Not published yet",
};

export function CampaignDetailView({ detail, viewer }: { detail: CampaignDetail; viewer: CampaignViewerState }) {
  const [tabDesktop, setTabDesktop] = useState<Tab>("story");
  const [tabMobile, setTabMobile] = useState<Tab>("story");
  const [selectedTier, setSelectedTier] = useState(detail.defaultTierIndex);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTierSheet, setShowTierSheet] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [evidenceFor, setEvidenceFor] = useState<DetailMilestone | null>(null);
  const [pledgedMessage, setPledgedMessage] = useState<string | null>(null);

  const tier = detail.tiers[selectedTier] ?? detail.tiers[0];
  const returnTo = `/campaigns/${detail.slug}`;
  const signInHref = viewer.signedIn ? null : `/signin?next=${encodeURIComponent(returnTo)}`;
  const closedLabel = detail.canPledge ? null : (CLOSED_LABEL[detail.status] ?? "Not taking donations");

  const handleBackThis = () => {
    if (!detail.canPledge || !tier) return;
    if (viewer.signedIn) setShowConfirm(true);
    else setShowAuthModal(true);
  };
  const handleSignedIn = useCallback(() => {
    setShowAuthModal(false);
    setShowConfirm(true);
  }, []);
  const handlePledged = useCallback((message: string) => {
    setShowConfirm(false);
    setPledgedMessage(message);
  }, []);

  const firstNames = detail.backers.slice(0, 2).map((b) => b.name.split(" ")[0]);
  const backersSentence =
    detail.backerCount === 0
      ? "Be the first to back this"
      : detail.backerCount <= 2
        ? `· ${firstNames.join(" and ")}`
        : `· ${firstNames.join(", ")} and ${count(detail.backerCount - 2)} others`;

  return (
    <div style={{ background: "hsl(var(--canvas))" }}>
      {/* ============================ Desktop ============================ */}
      <div className={styles.desktopOnly}>
        <PillNav
          center={
            <>
              <Link href="/discover" style={{ fontSize: 14, color: "hsl(var(--foreground))" }}>
                Discover
              </Link>
              <Link href="/how-escrow-works" style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
                How escrow works
              </Link>
              <Link href="/guidelines" style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
                Guidelines
              </Link>
            </>
          }
          end={
            <>
              <Link href="/discover" className="ms-btn ms-btn--ghost ms-btn--icon" aria-label="Search campaigns">
                <Icon name="search" size={16} style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/create-campaign" className="ms-btn ms-btn--secondary ms-btn--md">
                Start a campaign
              </Link>
              {viewer.signedIn ? (
                <Link href={viewer.homeHref} aria-label="Your account">
                  <Avatar initials={viewer.initials ?? "?"} size={36} fontSize={13} />
                </Link>
              ) : (
                <Link href={signInHref!} className="ms-btn ms-btn--ghost ms-btn--md">
                  Sign in
                </Link>
              )}
            </>
          }
        />

        {/* 8.334vw lands exactly on the artboard's 120px at 1440 and eases off below it. */}
        <div style={{ padding: "44px clamp(24px, 8.334vw, 120px) 64px" }}>
          {pledgedMessage && (
            <div style={{ marginBottom: 24 }}>
              <FormSuccess message={pledgedMessage}>
                <Link href="/donor/donations" style={{ fontSize: 13 }}>
                  See it in your donations →
                </Link>
              </FormSuccess>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              {detail.category} · {detail.location}
            </div>
            <StatusBadge status={detail.status} />
          </div>

          <h1
            className="font-display"
            style={{ fontSize: 56, lineHeight: 1.04, letterSpacing: "-0.022em", fontWeight: 600, margin: "14px 0 0", maxWidth: 920, textWrap: "balance" }}
          >
            {detail.title}
          </h1>

          <p style={{ margin: "18px 0 0", fontSize: 19, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "64ch" }}>
            {detail.subtitleDesktop}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid hsl(var(--border))",
            }}
          >
            <Avatar initials={detail.creator.initials} size={44} fontSize={14} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{detail.creator.name}</span>
              <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {detail.creator.location} · {detail.creator.meta}
              </span>
            </div>
            {detail.creator.verified && (
              <span className="ms-badge ms-badge--outline" style={{ marginLeft: 4 }}>
                <Icon name="shield-check" size={12} style={{ width: 12, height: 12 }} />
                Verified creator
              </span>
            )}
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShareButton />
              <FollowButton creatorId={detail.creator.id} following={viewer.following} signInHref={signInHref} />
            </div>
          </div>

          {/*
           * 792 + 24 + 384 is the 1440 artboard, and as fixed pixels it overflowed
           * every viewport from 1024 (where this composition takes over from the
           * mobile one) to 1366. As tracks it resolves to exactly those numbers at
           * 1440 and gives the sidebar its 384 first below that, so the story
           * column is the one that gives ground.
           */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(min-content, 384px)",
              gap: 24,
              alignItems: "start",
              marginTop: 36,
              maxWidth: 1200,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 36, minWidth: 0 }}>
              <ImagePlaceholder caption={detail.heroPlaceholder} style={{ width: "100%", aspectRatio: "792 / 495", borderRadius: 12 }} />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-lg)",
                  background: "hsl(var(--surface))",
                  boxShadow: "var(--shadow-xs)",
                  overflow: "hidden",
                }}
              >
                {detail.figures.map((f, i) => (
                  <div
                    key={f.label}
                    style={{
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      borderLeft: i === 0 ? undefined : "1px solid hsl(var(--border))",
                    }}
                  >
                    <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {f.label}
                    </span>
                    <span className="numeric" style={{ fontSize: 24, fontWeight: 600 }}>
                      {f.value}
                    </span>
                    <span style={{ fontSize: 12, lineHeight: 1.4, color: "hsl(var(--muted-foreground))" }}>{f.meta}</span>
                  </div>
                ))}
              </div>

              {detail.milestones.length > 0 && (
                <div
                  style={{
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius-lg)",
                    background: "hsl(var(--surface))",
                    boxShadow: "var(--shadow-xs)",
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      gap: 24,
                      paddingBottom: 20,
                      borderBottom: "1px solid hsl(var(--border))",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Escrow, in stages
                      </span>
                      <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.01em", fontWeight: 600, margin: 0 }}>
                        Milestone releases
                      </h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                        {detail.milestoneSummary}
                      </span>
                      <Link href="/how-escrow-works" style={{ fontSize: 13 }}>
                        How escrow works
                      </Link>
                    </div>
                  </div>
                  <ol style={{ display: "grid", gridTemplateColumns: `repeat(${detail.milestones.length}, 1fr)`, margin: "24px 0 0", padding: 0, listStyle: "none" }}>
                    {detail.milestones.map((m, i) => (
                      <DesktopMilestoneCard
                        key={m.stageNumber}
                        milestone={m}
                        isLast={i === detail.milestones.length - 1}
                        onViewEvidence={() => setEvidenceFor(m)}
                      />
                    ))}
                  </ol>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-lg)",
                  background: "hsl(var(--surface))",
                }}
              >
                {detail.backerCount > 0 && (
                  <BackerStack initials={detail.backers.map((b) => b.initials)} totalCount={detail.backerCount} max={5} />
                )}
                <span className="numeric" style={{ fontSize: 14 }}>
                  {count(detail.backerCount)} backers
                </span>
                <span style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>{backersSentence}</span>
                <div style={{ flex: 1 }} />
                {detail.backerCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setTabDesktop("backers")}
                    style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4, background: "none", border: 0, cursor: "pointer", color: "hsl(var(--primary))", fontFamily: "inherit" }}
                  >
                    See all backers
                  </button>
                )}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <TabStrip tab={tabDesktop} setTab={setTabDesktop} updates={detail.updates.length} backers={detail.backerCount} />
                  {detail.updates[0] && (
                    <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                      Last update {detail.updates[0].date}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 24, maxWidth: "68ch" }}>
                  <TabContent tab={tabDesktop} detail={detail} />
                </div>
              </div>
            </div>

            <div style={{ position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-lg)",
                  background: "hsl(var(--card))",
                  boxShadow: "var(--shadow-xs)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <FundingProgress raised={detail.raised} goalLabel={detail.goalLabel} fillPct={detail.fillPct} variant="hero-desktop" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 16, borderTop: "1px solid hsl(var(--border))" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span className="numeric" style={{ fontSize: 17, fontWeight: 600 }}>
                      {count(detail.backerCount)}
                    </span>
                    <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Backers
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span className="numeric" style={{ fontSize: 17, fontWeight: 600 }}>
                      {detail.daysLeft}
                    </span>
                    <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Days left
                    </span>
                  </div>
                </div>

                {viewer.pledgedTotal && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <Icon name="check" size={14} strokeWidth={3} style={{ width: 14, height: 14, color: "hsl(var(--primary))" }} />
                    You&apos;ve donated <span className="numeric" style={{ fontWeight: 600 }}>{viewer.pledgedTotal}</span> to this campaign.
                  </div>
                )}

                {detail.canPledge && detail.tiers.length > 0 ? (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 16, borderTop: "1px solid hsl(var(--border))" }}>
                      <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))", marginBottom: 2 }}>
                        Choose an amount
                      </span>
                      {detail.tiers.map((t, i) => (
                        <TierOption key={t.id} tier={t} selected={selectedTier === i} onSelect={() => setSelectedTier(i)} />
                      ))}
                    </div>

                    <button type="button" className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%" }} onClick={handleBackThis}>
                      {viewer.signedIn ? `Donation ${tier?.amount ?? ""}` : "Back this project"}
                    </button>
                  </>
                ) : (
                  <div
                    style={{
                      padding: "12px 14px",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius-md)",
                      background: "hsl(var(--canvas))",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {closedLabel}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "hsl(var(--muted-foreground))" }}>
                  <Icon name="lock" size={14} style={{ width: 14, height: 14, marginTop: 2 }} />
                  <span style={{ fontSize: 12, lineHeight: 1.5 }}>
                    Charged when funding closes. Released one stage at a time. Refunded in full if a stage fails review.
                  </span>
                </div>
              </div>
              <Link
                href={`/report-campaign?campaign=${detail.slug}`}
                style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", paddingLeft: 4 }}
              >
                Report this campaign
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============================ Mobile ============================ */}
      <div className={styles.mobileOnly}>
        <PillNav
          size="sm"
          brand={
            <Link href="/discover" className="ms-btn ms-btn--ghost" style={{ width: 40, height: 40, padding: 0, flexShrink: 0 }} aria-label="Back">
              <Icon name="arrow-left" size={20} style={{ width: 20, height: 20 }} />
            </Link>
          }
          centered
          center={
            <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {detail.title.length > 28 ? `${detail.title.slice(0, 28)}…` : detail.title}
            </span>
          }
          end={<ShareButton compact />}
        />

        <ImagePlaceholder caption={detail.heroPlaceholder} style={{ width: "100%", height: 244 }} />

        <div style={{ padding: "20px 20px 176px", display: "flex", flexDirection: "column", gap: 24 }}>
          {pledgedMessage && <FormSuccess message={pledgedMessage} />}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                {detail.category} · {detail.location.split(",")[0]}
              </span>
              <StatusBadge status={detail.status} />
            </div>
            <h2 className="font-display" style={{ fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 600, margin: 0, textWrap: "balance" }}>
              {detail.title}
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{detail.subtitleMobile}</p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 0",
              borderTop: "1px solid hsl(var(--border))",
              borderBottom: "1px solid hsl(var(--border))",
            }}
          >
            <Avatar initials={detail.creator.initials} size={40} fontSize={13} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{detail.creator.name}</span>
              <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {detail.creator.location} · {detail.creator.meta.split(" · ")[0]}
              </span>
            </div>
            {detail.creator.verified && (
              <span className="ms-badge ms-badge--outline">
                <Icon name="shield-check" size={12} style={{ width: 12, height: 12 }} />
                Verified
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <span className="numeric" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1 }}>
                {detail.raised}
              </span>
              <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {detail.goalLabel}
              </span>
            </div>
            <div className="ms-progress__track">
              <div className="ms-progress__fill" style={{ width: `${detail.fillPct}%` }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 6 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span className="numeric" style={{ fontSize: 17, fontWeight: 600 }}>
                  {count(detail.backerCount)}
                </span>
                <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Backers
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span className="numeric" style={{ fontSize: 17, fontWeight: 600 }}>
                  {detail.daysLeft}
                </span>
                <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Days left
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--surface))",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                Released
              </span>
              <span className="numeric" style={{ fontSize: 20, fontWeight: 600 }}>
                {detail.releasedValue}
              </span>
              <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {detail.releasedCount} of {detail.milestones.length} stages
              </span>
            </div>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 4, borderLeft: "1px solid hsl(var(--border))" }}>
              <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                In escrow
              </span>
              <span className="numeric" style={{ fontSize: 20, fontWeight: 600 }}>
                {detail.heldValue}
              </span>
              <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Held by trustee</span>
            </div>
          </div>

          {detail.milestones.length > 0 && (
            <div
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-lg)",
                background: "hsl(var(--surface))",
                boxShadow: "var(--shadow-xs)",
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 12,
                  paddingBottom: 14,
                  borderBottom: "1px solid hsl(var(--border))",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Escrow, in stages
                  </span>
                  <h3 className="font-display" style={{ fontSize: 20, lineHeight: 1.3, letterSpacing: "-0.01em", fontWeight: 600, margin: 0 }}>
                    Milestone releases
                  </h3>
                </div>
                <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                  {detail.releasedCount} / {detail.milestones.length} released
                </span>
              </div>
              <ol style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
                {detail.milestones.map((m, i) => (
                  <MobileMilestoneRow
                    key={m.stageNumber}
                    milestone={m}
                    isLast={i === detail.milestones.length - 1}
                    onViewEvidence={() => setEvidenceFor(m)}
                  />
                ))}
              </ol>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 0",
              borderTop: "1px solid hsl(var(--border))",
              borderBottom: "1px solid hsl(var(--border))",
            }}
          >
            {detail.backerCount > 0 && (
              <BackerStack initials={detail.backers.map((b) => b.initials)} totalCount={detail.backerCount} max={4} size="sm" />
            )}
            <span className="numeric" style={{ fontSize: 13, flex: 1 }}>
              {count(detail.backerCount)} backers
            </span>
            <FollowButton creatorId={detail.creator.id} following={viewer.following} signInHref={signInHref} />
          </div>

          <div>
            <TabStrip tab={tabMobile} setTab={setTabMobile} mobile updates={detail.updates.length} backers={detail.backerCount} />
            <div style={{ marginTop: 16 }}>
              <TabContent tab={tabMobile} detail={detail} />
            </div>
          </div>

          <Link href={`/report-campaign?campaign=${detail.slug}`} style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
            Report this campaign
          </Link>
        </div>

        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 8,
            height: 72,
            background: "hsl(var(--surface))",
            borderTop: "1px solid hsl(var(--border))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "0 20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span className="numeric" style={{ fontSize: 17, fontWeight: 600 }}>
              {detail.raised} raised
            </span>
            <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
              {detail.fillPct}% · {detail.timeLeftLabel}
            </span>
          </div>
          {detail.canPledge ? (
            <button
              type="button"
              className="ms-btn ms-btn--primary"
              style={{ height: 48, padding: "0 22px", fontSize: 15 }}
              onClick={() => setShowTierSheet(true)}
            >
              Back this
            </button>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 500, color: "hsl(var(--muted-foreground))", textAlign: "right" }}>{closedLabel}</span>
          )}
        </div>
      </div>

      {showTierSheet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div
            aria-hidden="true"
            onClick={() => setShowTierSheet(false)}
            style={{ position: "absolute", inset: 0, background: "hsl(var(--scrim) / 0.5)" }}
          />
          <div
            role="dialog"
            aria-label="Choose an amount"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              background: "hsl(var(--surface))",
              borderTop: "1px solid hsl(var(--border))",
              borderRadius: "16px 16px 0 0",
              boxShadow: "var(--shadow-lg)",
              padding: "10px 20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <span aria-hidden="true" style={{ width: 40, height: 4, borderRadius: 999, background: "hsl(var(--border))", alignSelf: "center" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.01em", fontWeight: 600, margin: 0 }}>
                  Choose an amount
                </h3>
                <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                  Released to {detail.creator.name.split(" ")[0]} one stage at a time.
                </span>
              </div>
              <button
                type="button"
                className="ms-btn ms-btn--ghost"
                style={{ width: 44, height: 44, padding: 0, margin: "-8px -8px 0 0" }}
                aria-label="Close"
                onClick={() => setShowTierSheet(false)}
              >
                <Icon name="x" size={18} style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {detail.tiers.map((t, i) => (
                <TierOption key={t.id} tier={t} selected={selectedTier === i} onSelect={() => setSelectedTier(i)} compact />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingTop: 12, borderTop: "1px solid hsl(var(--border))" }}>
              <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>Your donation</span>
              <span className="numeric" style={{ fontSize: 17, fontWeight: 600 }}>
                {tier?.amount} · {detail.milestones.length} stages
              </span>
            </div>
            <button
              type="button"
              className="ms-btn ms-btn--primary"
              style={{ width: "100%", height: 48, fontSize: 15 }}
              onClick={() => {
                setShowTierSheet(false);
                handleBackThis();
              }}
            >
              Continue
            </button>
            <span style={{ fontSize: 12, lineHeight: 1.5, color: "hsl(var(--muted-foreground))", textAlign: "center" }}>
              Charged when funding closes. Refunded in full if a stage fails review.
            </span>
          </div>
        </div>
      )}

      {showAuthModal && tier && (
        <AuthModal
          amountLabel={tier.amount}
          campaignName={detail.title}
          returnTo={returnTo}
          onClose={() => setShowAuthModal(false)}
          onSignedIn={handleSignedIn}
        />
      )}

      {showConfirm && tier && viewer.signedIn && (
        <PledgeConfirm detail={detail} tier={tier} onClose={() => setShowConfirm(false)} onPledged={handlePledged} />
      )}

      {evidenceFor && <EvidenceDialog milestone={evidenceFor} onClose={() => setEvidenceFor(null)} />}
    </div>
  );
}

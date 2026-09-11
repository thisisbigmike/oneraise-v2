import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { FundingProgress } from "@/components/campaign/funding-progress";
import { MilestoneTrack } from "@/components/campaign/milestone-track";
import type { ContextCampaign } from "@/lib/view-models";

/** "You were viewing" / "Waiting for you" — the campaign card auth carries
 *  through sign in, sign up and welcome so the flow never loses context. */
export function CampaignContextPanel({
  eyebrow,
  heading,
  body,
  campaign: contextCampaign,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  campaign: ContextCampaign | null;
}) {
  if (!contextCampaign) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          {eyebrow}
        </div>
        <h3 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: "8px 0 0" }}>
          {heading}
        </h3>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "52ch" }}>{body}</p>
      </div>
    );
  }
  return (
    <>
      <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
        {eyebrow}
      </div>
      <Link
        href={`/campaigns/${contextCampaign.slug}`}
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
          boxShadow: "var(--shadow-xs)",
          overflow: "hidden",
          marginTop: 20,
        }}
      >
        <div style={{ display: "flex", gap: 20, padding: 20 }}>
          <ImagePlaceholder caption="16:10" style={{ width: 176, height: 110, flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            <h3
              className="font-display"
              style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0, textWrap: "balance" }}
            >
              {contextCampaign.title}
            </h3>
            <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{contextCampaign.creatorLine}</span>
          </div>
        </div>
        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <FundingProgress raised={contextCampaign.raised} goalLabel={contextCampaign.goalLabel} fillPct={contextCampaign.fillPct} variant="hero-desktop" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              {contextCampaign.donorsLabel}
            </span>
            <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              {contextCampaign.timeLeftLabel}
            </span>
          </div>
        </div>
        {contextCampaign.milestones.length > 0 && (
          <div style={{ borderTop: "1px solid hsl(var(--border))", padding: 20 }}>
            <MilestoneTrack milestones={contextCampaign.milestones} />
          </div>
        )}
      </div>
      </Link>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
        <h3 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
          {heading}
        </h3>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "52ch" }}>{body}</p>
      </div>
    </>
  );
}

/** The recovery-screen right rail: an eyebrow, a heading, and a short list
 *  of icon-led security facts. */
export function SecurityContextPanel({
  eyebrow,
  heading,
  body,
  rows,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  rows: { left: string; right: string }[];
}) {
  return (
    <>
      <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
        {eyebrow}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
        <h3
          className="font-display"
          style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0, textWrap: "balance" }}
        >
          {heading}
        </h3>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "52ch" }}>{body}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 36, borderTop: "1px solid hsl(var(--border))" }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              padding: "22px 0",
              borderBottom: i === rows.length - 1 ? undefined : "1px solid hsl(var(--border))",
            }}
          >
            <span style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>{row.left}</span>
            <span className="numeric" style={{ fontSize: 14, fontWeight: 500 }}>
              {row.right}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

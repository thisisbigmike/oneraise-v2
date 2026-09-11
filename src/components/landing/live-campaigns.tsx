import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { FundingProgress } from "@/components/campaign/funding-progress";
import { count } from "@/lib/format";
import type { CampaignCard } from "@/lib/view-models";
import styles from "./responsive.module.css";

const caption = (campaign: CampaignCard) => campaign.heroCaption.split(" · ")[0];
const donorsAndTime = (campaign: CampaignCard) =>
  `${count(campaign.backerCount)} donors · ${campaign.timeLeftLabel}`;

function CampaignCardDesktop({ campaign }: { campaign: CampaignCard }) {
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="ms-campaign ms-campaign--link"
      style={{
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
        boxShadow: "var(--shadow-xs)",
        textDecoration: "none",
        color: "hsl(var(--foreground))",
      }}
    >
      <div className="ms-campaign__media" style={{ aspectRatio: "auto" }}>
        <ImagePlaceholder
          caption={caption(campaign)}
          style={{ width: "100%", height: 240 }}
        />
      </div>
      <div className="ms-campaign__body">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge status={campaign.status} />
          <span
            className="numeric"
            style={{
              fontSize: 12,
              letterSpacing: "0.02em",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            {campaign.stageLabel}
          </span>
        </div>
        <div className="ms-campaign__head">
          <h3
            className="ms-campaign__title"
            style={{ minHeight: 58, overflow: "hidden", textWrap: "balance" }}
          >
            <span>{campaign.title}</span>
          </h3>
          <span className="ms-campaign__creator">{campaign.creatorLine}</span>
        </div>
        <div className="ms-campaign__foot">
          <FundingProgress
            raised={campaign.raised}
            goalLabel={campaign.goalLabel}
            fillPct={campaign.fillPct}
            variant="card"
          />
          <span
            className="numeric"
            style={{
              fontSize: 12,
              letterSpacing: "0.02em",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            {donorsAndTime(campaign)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function CampaignCardMobile({ campaign }: { campaign: CampaignCard }) {
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="ms-campaign"
      style={{
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
        boxShadow: "var(--shadow-xs)",
        textDecoration: "none",
        color: "hsl(var(--foreground))",
      }}
    >
      <ImagePlaceholder
        caption={caption(campaign)}
        style={{ width: "100%", height: 218 }}
      />
      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge status={campaign.status} />
          <span
            className="numeric"
            style={{
              fontSize: 12,
              letterSpacing: "0.02em",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            {campaign.stageLabel}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            className="font-display"
            style={{
              fontSize: 19,
              lineHeight: 1.3,
              letterSpacing: "-0.010em",
              fontWeight: 600,
              textWrap: "balance",
            }}
          >
            {campaign.title}
          </span>
          <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {campaign.creatorLine}
          </span>
        </div>
        <FundingProgress
          raised={campaign.raised}
          goalLabel={campaign.goalLabel}
          fillPct={campaign.fillPct}
          variant="card"
        />
        <span
          className="numeric"
          style={{
            fontSize: 12,
            letterSpacing: "0.02em",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          {donorsAndTime(campaign)}
        </span>
      </div>
    </Link>
  );
}

export function LiveCampaigns({
  campaigns,
  totalLive,
}: {
  campaigns: CampaignCard[];
  totalLive: number;
}) {
  const seeAll = totalLive > campaigns.length ? `See all ${count(totalLive)}` : "Browse campaigns";
  return (
    <div id="live-campaigns">
      {/* Desktop */}
      <div className={styles.desktopOnly}>
        <div
          style={{
            padding: "96px 120px",
            display: "flex",
            flexDirection: "column",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 40,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span
                className="eyebrow"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Open now
              </span>
              <h2
                className="font-display"
                style={{
                  fontSize: 40,
                  lineHeight: 1.12,
                  letterSpacing: "-0.018em",
                  fontWeight: 600,
                  margin: 0,
                  textWrap: "balance",
                }}
              >
                Live campaigns
              </h2>
            </div>
            <Link href="/discover" style={{ fontSize: 14 }}>
              {seeAll}
            </Link>
          </div>
          {campaigns.length === 0 ? (
            <p style={{ margin: 0, fontSize: 15, color: "hsl(var(--muted-foreground))" }}>
              No campaigns are open right now. Check back soon.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 24,
              }}
            >
              {campaigns.map((campaign) => (
                <CampaignCardDesktop key={campaign.slug} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className={styles.mobileOnly}>
        <div
          style={{
            padding: "48px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                className="eyebrow"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Open now
              </span>
              <h3
                className="font-display"
                style={{
                  fontSize: 30,
                  lineHeight: 1.2,
                  letterSpacing: "-0.014em",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Live campaigns
              </h3>
            </div>
            <Link
              href="/discover"
              style={{ fontSize: 13, whiteSpace: "nowrap" }}
            >
              {seeAll}
            </Link>
          </div>
          {campaigns.map((campaign) => (
            <CampaignCardMobile key={campaign.slug} campaign={campaign} />
          ))}
        </div>
      </div>
    </div>
  );
}

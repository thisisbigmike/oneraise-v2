import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { creatorBullets, stagePlan } from "@/lib/landing-data";
import styles from "./responsive.module.css";

const STAGE_GRID_DESKTOP = "32px 1fr 100px 60px";

function StagePlanDesktop() {
  return (
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
          padding: 20,
          borderBottom: "1px solid hsl(var(--border))",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span
          className="eyebrow"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Stage plan
        </span>
        <span
          className="font-display"
          style={{
            fontSize: 21,
            lineHeight: 1.3,
            letterSpacing: "-0.010em",
            fontWeight: 600,
          }}
        >
          {stagePlan.campaignTitle}
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: STAGE_GRID_DESKTOP,
          gap: 14,
          padding: "12px 20px",
          borderBottom: "1px solid hsl(var(--border))",
          background: "hsl(var(--canvas))",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "hsl(var(--muted-foreground))",
          }}
        >
          #
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Stage
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Releases
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Share
        </span>
      </div>
      {stagePlan.stages.map((stage) => (
        <div
          key={stage.number}
          style={{
            display: "grid",
            gridTemplateColumns: STAGE_GRID_DESKTOP,
            gap: 14,
            padding: "14px 20px",
            borderBottom: "1px solid hsl(var(--border))",
            alignItems: "center",
          }}
        >
          <span
            className="numeric"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
          >
            {stage.number}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{stage.label}</span>
          <span className="numeric" style={{ fontSize: 14, fontWeight: 600 }}>
            {stage.amount}
          </span>
          <span
            className="numeric"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
          >
            {stage.share}
          </span>
        </div>
      ))}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: STAGE_GRID_DESKTOP,
          gap: 14,
          padding: "14px 20px",
          alignItems: "center",
          background: "hsl(var(--canvas))",
        }}
      >
        <span />
        <span style={{ fontSize: 14, fontWeight: 600 }}>Goal</span>
        <span className="numeric" style={{ fontSize: 14, fontWeight: 600 }}>
          {stagePlan.goal.amount}
        </span>
        <span
          className="numeric"
          style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}
        >
          {stagePlan.goal.share}
        </span>
      </div>
    </div>
  );
}

function StagePlanMobile() {
  return (
    <div
      style={{
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: 16,
          borderBottom: "1px solid hsl(var(--border))",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span
          className="eyebrow"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Stage plan
        </span>
        <span
          className="font-display"
          style={{
            fontSize: 19,
            lineHeight: 1.3,
            letterSpacing: "-0.010em",
            fontWeight: 600,
          }}
        >
          {stagePlan.campaignTitle}
        </span>
      </div>
      {stagePlan.stages.map((stage) => (
        <div
          key={stage.number}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "13px 16px",
            borderBottom: "1px solid hsl(var(--border))",
          }}
        >
          <span
            className="numeric"
            style={{
              fontSize: 12,
              color: "hsl(var(--muted-foreground))",
              width: 20,
              flexShrink: 0,
            }}
          >
            {stage.number}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>
            {stage.label}
          </span>
          <span className="numeric" style={{ fontSize: 14, fontWeight: 600 }}>
            {stage.amount}
          </span>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 16px",
          background: "hsl(var(--canvas))",
        }}
      >
        <span style={{ width: 20, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Goal</span>
        <span className="numeric" style={{ fontSize: 14, fontWeight: 600 }}>
          {stagePlan.goal.amount}
        </span>
      </div>
    </div>
  );
}

export function CreatorSection() {
  return (
    <div id="for-creators">
      {/* Desktop */}
      <div className={styles.desktopOnly}>
        <div
          style={{
            padding: "0 120px 96px",
            display: "grid",
            gridTemplateColumns: "1fr 480px",
            gap: 72,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              minWidth: 0,
            }}
          >
            <span
              className="eyebrow"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              For creators
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
              Raise in stages
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.65,
                color: "hsl(var(--muted-foreground))",
                maxWidth: "48ch",
                textWrap: "pretty",
              }}
            >
              Break the project into the stages you would actually work in,
              price each one, and say what you will show when it is done. Donors
              fund the plan, and each stage pays out as you clear it.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 4,
              }}
            >
              {creatorBullets.map((bullet) => (
                <div
                  key={bullet}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                >
                  <span
                    style={{
                      color: "hsl(var(--primary))",
                      display: "flex",
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="check" size={16} strokeWidth={3} />
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.5 }}>
                    {bullet}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 12,
              }}
            >
              <Link
                href="/create-campaign"
                className="ms-btn ms-btn--primary ms-btn--lg"
              >
                Start a campaign
              </Link>
              <Link
                href="/payout-terms"
                className="ms-btn ms-btn--ghost ms-btn--lg"
              >
                Read the payout terms
              </Link>
            </div>
          </div>

          <StagePlanDesktop />
        </div>
      </div>

      {/* Mobile */}
      <div className={styles.mobileOnly}>
        <div
          style={{
            padding: "0 20px 48px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              className="eyebrow"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              For creators
            </span>
            <h3
              className="font-display"
              style={{
                fontSize: 30,
                lineHeight: 1.2,
                letterSpacing: "-0.014em",
                fontWeight: 600,
                margin: 0,
                textWrap: "balance",
              }}
            >
              Raise in stages
            </h3>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.65,
              color: "hsl(var(--muted-foreground))",
              textWrap: "pretty",
            }}
          >
            Break the project into the stages you would actually work in, price
            each one, and say what you will show when it is done. Each stage
            pays out as you clear it.
          </p>
          <StagePlanMobile />
          <Link
            href="/create-campaign"
            className="ms-btn ms-btn--primary ms-btn--lg"
            style={{ width: "100%" }}
          >
            Start a campaign
          </Link>
        </div>
      </div>
    </div>
  );
}

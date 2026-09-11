import Link from "next/link";
import styles from "./responsive.module.css";

export function CtaBand() {
  return (
    <>
      {/* Desktop */}
      <div className={styles.desktopOnly}>
        <div
          style={{
            padding: "80px 120px",
            borderTop: "1px solid hsl(var(--border))",
            background: "hsl(var(--surface))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 56,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
              Fund a stage today
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.65,
                color: "hsl(var(--muted-foreground))",
                maxWidth: "52ch",
                textWrap: "pretty",
              }}
            >
              Pledges start at $10, and you can see exactly which stage your
              money is holding at any time.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <Link
              href="/discover"
              className="ms-btn ms-btn--primary ms-btn--lg"
            >
              Explore campaigns
            </Link>
            <Link
              href="/create-campaign"
              className="ms-btn ms-btn--secondary ms-btn--lg"
            >
              Start a campaign
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className={styles.mobileOnly}>
        <div
          style={{
            padding: "40px 20px",
            borderTop: "1px solid hsl(var(--border))",
            background: "hsl(var(--surface))",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
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
            Fund a stage today
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.65,
              color: "hsl(var(--muted-foreground))",
              textWrap: "pretty",
            }}
          >
            Pledges start at $10, and you can see exactly which stage your money
            is holding at any time.
          </p>
          <Link
            href="/discover"
            className="ms-btn ms-btn--primary ms-btn--lg"
            style={{ width: "100%", marginTop: 4 }}
          >
            Explore campaigns
          </Link>
        </div>
      </div>
    </>
  );
}

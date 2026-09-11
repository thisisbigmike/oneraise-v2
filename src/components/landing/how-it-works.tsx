import { howItWorksSteps } from "@/lib/landing-data";
import styles from "./responsive.module.css";

export function HowItWorks() {
  return (
    <div id="how-it-works">
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
                How it works
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
                How the money moves
              </h2>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.65,
                color: "hsl(var(--muted-foreground))",
                maxWidth: "44ch",
                textWrap: "pretty",
              }}
            >
              The terms of each stage are published when the campaign launches
              and cannot be edited afterwards.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
            }}
          >
            {howItWorksSteps.map((step) => (
              <div
                key={step.number}
                style={{
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-lg)",
                  background: "hsl(var(--surface))",
                  boxShadow: "var(--shadow-xs)",
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <span
                  className="eyebrow numeric"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {step.number}
                </span>
                <h3
                  className="font-display"
                  style={{
                    fontSize: 21,
                    lineHeight: 1.3,
                    letterSpacing: "-0.010em",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "hsl(var(--muted-foreground))",
                    textWrap: "pretty",
                  }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              className="eyebrow"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              How it works
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
              How the money moves
            </h3>
          </div>
          <div
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--surface))",
              overflow: "hidden",
            }}
          >
            {howItWorksSteps.map((step, i) => (
              <div
                key={step.number}
                style={{
                  padding: "18px 16px",
                  borderBottom:
                    i === howItWorksSteps.length - 1
                      ? undefined
                      : "1px solid hsl(var(--border))",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span
                  className="eyebrow numeric"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {step.number}
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
                  {step.title}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "hsl(var(--muted-foreground))",
                    textWrap: "pretty",
                  }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

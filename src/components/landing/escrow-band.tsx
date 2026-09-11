import type { EscrowFigure } from "@/lib/view-models";
import styles from "./responsive.module.css";

export function EscrowBand({ figures: escrowFigures }: { figures: EscrowFigure[] }) {
  return (
    <>
      {/* Desktop */}
      <div className={styles.desktopOnly}>
        <div
          style={{
            padding: "80px 120px",
            background: "hsl(var(--secondary))",
            borderTop: "1px solid hsl(var(--border))",
            borderBottom: "1px solid hsl(var(--border))",
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
              Where the money sits
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.65,
                color: "hsl(var(--muted-foreground))",
                maxWidth: "46ch",
                textWrap: "pretty",
              }}
            >
              The platform&apos;s live position, computed from the ledger on
              every visit. Escrow is reconciled against the bank balance every
              morning.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 32,
            }}
          >
            {escrowFigures.map((figure) => (
              <div
                key={figure.label}
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <span
                  className="numeric font-display"
                  style={{
                    fontSize: 40,
                    lineHeight: 1.1,
                    letterSpacing: "-0.018em",
                    fontWeight: 600,
                  }}
                >
                  {figure.value}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  {figure.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className={styles.mobileOnly}>
        <div
          style={{
            padding: "40px 20px",
            background: "hsl(var(--secondary))",
            borderTop: "1px solid hsl(var(--border))",
            borderBottom: "1px solid hsl(var(--border))",
            display: "flex",
            flexDirection: "column",
            gap: 24,
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
            Where the money sits
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
          >
            {escrowFigures.map((figure) => (
              <div
                key={figure.label}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span
                  className="numeric font-display"
                  style={{
                    fontSize: 24,
                    lineHeight: 1.15,
                    letterSpacing: "-0.014em",
                    fontWeight: 600,
                  }}
                >
                  {figure.value}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  {figure.mobileLabel}
                </span>
              </div>
            ))}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.5,
              color: "hsl(var(--muted-foreground))",
              textWrap: "pretty",
            }}
          >
            The platform&apos;s live position, computed from the ledger on every
            visit. Escrow is reconciled against the bank balance every morning.
          </p>
        </div>
      </div>
    </>
  );
}

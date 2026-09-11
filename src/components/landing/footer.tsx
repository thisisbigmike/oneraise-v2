import Link from "next/link";
import { footerLinks, footerLinksMobile } from "@/lib/landing-data";
import styles from "./responsive.module.css";

export function Footer() {
  return (
    <footer>
      {/* Desktop */}
      <div className={styles.desktopOnly}>
        <div
          style={{
            padding: "56px 120px 48px",
            borderTop: "1px solid hsl(var(--border))",
            display: "grid",
            gridTemplateColumns: "1fr 160px 160px 160px",
            gap: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: "34ch",
            }}
          >
            <span
              className="font-display"
              style={{
                fontSize: 21,
                fontWeight: 600,
                letterSpacing: "-0.010em",
                color: "hsl(var(--primary))",
              }}
            >
              OneRaise
            </span>
            <span
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: "hsl(var(--muted-foreground))",
                textWrap: "pretty",
              }}
            >
              Milestone crowdfunding. Escrow held by Onefold Trust Services,
              registered in England.
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              className="eyebrow"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Donors
            </span>
            {footerLinks.donors.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{ fontSize: 14, color: "hsl(var(--foreground))" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              className="eyebrow"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Creators
            </span>
            {footerLinks.creators.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{ fontSize: 14, color: "hsl(var(--foreground))" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              className="eyebrow"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Company
            </span>
            {footerLinks.company.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{ fontSize: 14, color: "hsl(var(--foreground))" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div
          style={{
            padding: "20px 120px 32px",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span
            className="numeric"
            style={{
              fontSize: 12,
              letterSpacing: "0.02em",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            © 2026 OneRaise
          </span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>·</span>
          <Link
            href="/privacy"
            style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
          >
            Terms
          </Link>
          <Link
            href="/cookies"
            style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
          >
            Cookies
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className={styles.mobileOnly}>
        <div
          style={{
            padding: "32px 20px",
            borderTop: "1px solid hsl(var(--border))",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              className="font-display"
              style={{
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: "-0.010em",
                color: "hsl(var(--primary))",
              }}
            >
              OneRaise
            </span>
            <span
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: "hsl(var(--muted-foreground))",
                textWrap: "pretty",
              }}
            >
              Milestone crowdfunding. Escrow held by Onefold Trust Services,
              registered in England.
            </span>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                className="eyebrow"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Donors
              </span>
              {footerLinksMobile.donors.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{ fontSize: 13, color: "hsl(var(--foreground))" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                className="eyebrow"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                Creators
              </span>
              {footerLinksMobile.creators.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{ fontSize: 13, color: "hsl(var(--foreground))" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              paddingTop: 16,
              borderTop: "1px solid hsl(var(--border))",
            }}
          >
            <span
              className="numeric"
              style={{
                fontSize: 12,
                letterSpacing: "0.02em",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              © 2026 OneRaise
            </span>
            <Link
              href="/privacy"
              style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { ReactNode } from "react";
import { PillNav } from "@/components/ui/pill-nav";
import styles from "@/styles/responsive.module.css";

/**
 * The auth flow's constant shell: task on the left, live campaign or
 * security context on the right (desktop only — mobile is a single
 * column). `topBarRight` fills the header's right slot on both sizes.
 */
export function AuthShell({
  topBarRight,
  mobileTopBarRight,
  mobileTopBarCenter,
  children,
  contextPanel,
  mobileContextCard,
}: {
  topBarRight: ReactNode;
  mobileTopBarRight?: ReactNode;
  mobileTopBarCenter?: ReactNode;
  children: ReactNode;
  contextPanel: ReactNode;
  mobileContextCard?: ReactNode;
}) {
  return (
    <div style={{ background: "hsl(var(--canvas))", minHeight: "100vh" }}>
      {/* Desktop */}
      <div className={styles.desktopOnly}>
        <PillNav end={topBarRight} />
        <div style={{ display: "grid", gridTemplateColumns: "640px 1fr" }}>
          <div style={{ padding: "64px 120px", display: "flex", flexDirection: "column", gap: 28, minHeight: "calc(100vh - 78px)" }}>
            {children}
          </div>
          <div
            style={{
              background: "hsl(var(--secondary))",
              borderLeft: "1px solid hsl(var(--border))",
              padding: 56,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {contextPanel}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className={styles.mobileOnly}>
        {mobileTopBarCenter ? (
          <PillNav size="sm" brand={<span />} center={mobileTopBarCenter} centered />
        ) : (
          <PillNav size="sm" end={mobileTopBarRight} />
        )}
        <div style={{ padding: "24px 20px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          {mobileContextCard}
          {children}
        </div>
      </div>
    </div>
  );
}

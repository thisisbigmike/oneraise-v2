import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./pill-nav.module.css";

export interface PillNavProps {
  /**
   * "solid" is the pill on the cream canvas — every page but the landing hero.
   * "overlay" is glass with cream content, for floating on a dark photograph;
   * the caller must switch back to "solid" once it scrolls off that photo.
   */
  tone?: "solid" | "overlay";
  /** "lg" is the desktop pill, "sm" the mobile one. */
  size?: "lg" | "sm";
  /** Widest the pill grows before it stops tracking the viewport. */
  maxWidth?: number;
  /** Drop out of the flow entirely so a hero can start at the viewport top. */
  float?: boolean;
  /** Turn off stickiness for a bar that should scroll away with the page. */
  sticky?: boolean;
  /** Rides beside the wordmark — the "Admin" badge, say. */
  brandSuffix?: ReactNode;
  /** Replaces the wordmark outright, for a contextual toolbar. */
  brand?: ReactNode;
  /** Navigation between the brand and the actions. */
  center?: ReactNode;
  /** Let the centre slot take the free space and centre itself in it. */
  centered?: boolean;
  /** Actions at the trailing edge. */
  end?: ReactNode;
  className?: string;
}

/**
 * The app's one top bar. Renders a floating pill with a brand slot, an
 * optional centre slot and a trailing action slot.
 *
 * No hooks, so it stays usable from server components — the landing header
 * owns its own scroll state and just feeds `tone` in.
 */
export function PillNav({
  tone = "solid",
  size = "lg",
  maxWidth = 1200,
  float = false,
  sticky = true,
  brandSuffix,
  brand,
  center,
  centered = false,
  end,
  className,
}: PillNavProps) {
  const wrapClasses = [
    styles.wrap,
    size === "sm" ? styles.sizeSm : "",
    float ? styles.wrapOverlay : "",
    !float && !sticky ? styles.static : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={wrapClasses}>
      <div
        className={`${styles.bar} ${tone === "overlay" ? styles.overlay : styles.solid}`}
        style={{ maxWidth }}
      >
        {brand ?? (
          <div className={styles.brand}>
            <Link href="/" className={`font-display ${styles.wordmark}`}>
              OneRaise
            </Link>
            {brandSuffix}
          </div>
        )}
        {center ? (
          <div
            className={`${styles.center} ${centered ? styles.centerAlone : ""}`}
          >
            {center}
          </div>
        ) : null}
        {end ? <div className={styles.end}>{end}</div> : null}
      </div>
    </header>
  );
}

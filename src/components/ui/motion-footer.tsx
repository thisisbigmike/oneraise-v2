"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@/components/ui/icon";
import styles from "./motion-footer.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * motion.css owns the global reduced-motion guard, but it only reaches CSS
 * animations and transitions. GSAP writes inline transforms straight onto the
 * element, so every JS-driven effect below asks this first and opts out
 * entirely rather than running at 1ms.
 */
function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------
   Magnetic pill
   ---------------------------------------------------------------------- */

export type MagneticProps<T extends React.ElementType> = {
  as?: T;
  children?: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * Pulls its element toward the cursor and tilts it, then releases on an
 * elastic ease. The tilt carries its own perspective (see below), without
 * which the rotation reads as a flat skew.
 */
function Magnetic<T extends React.ElementType = "button">({
  as,
  className,
  children,
  ...props
}: MagneticProps<T>) {
  const ref = useRef<HTMLElement | null>(null);
  const Component = (as ?? "button") as React.ElementType;

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const handleMouseMove = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const offsetX = event.clientX - rect.left - rect.width / 2;
        const offsetY = event.clientY - rect.top - rect.height / 2;

        gsap.to(element, {
          x: offsetX * 0.4,
          y: offsetY * 0.4,
          rotationX: -offsetY * 0.15,
          rotationY: offsetX * 0.15,
          // Per-element, because `perspective` only reaches a direct child and
          // these pills sit deep inside the footer.
          transformPerspective: 800,
          scale: 1.05,
          ease: "power2.out",
          duration: 0.4,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          ease: "elastic.out(1, 0.3)",
          duration: 1.2,
        });
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, element);

    return () => ctx.revert();
  }, []);

  return (
    <Component
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={joinClasses(styles.pill, className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/* -------------------------------------------------------------------------
   Data
   ---------------------------------------------------------------------- */

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export interface CinematicFooterProps {
  /** Oversized background wordmark. Kept short — it renders at 26vw. */
  wordmark?: string;
  /** The closing call to action. */
  heading?: string;
  /** One line under the heading. Pass null to drop it. */
  subheading?: string | null;
  /** Phrases cycling through the diagonal marquee. */
  marqueeItems?: string[];
  /** The two lead actions, rendered as large magnetic pills. */
  primaryActions?: FooterLink[];
  /** Which lead action comes first, matching the hero's ordering. */
  ctaOrder?: "donor-first" | "creator-first";
  /** Navigation columns carried over from the standard footer. */
  columns?: FooterColumn[];
  /** Policy links in the pill row under the actions. */
  policyLinks?: FooterLink[];
  /** Live escrow position shown in the bottom badge. */
  escrowAmount?: string;
  /** Bottom-left copyright line. */
  copyright?: string;
}

const DEFAULT_MARQUEE = [
  "Money follows the work",
  "Escrow held, not spent",
  "One milestone at a time",
  "Evidence before payout",
  "Refunds if a stage fails",
];

const DEFAULT_PRIMARY_ACTIONS: FooterLink[] = [
  { label: "Explore campaigns", href: "/discover" },
  { label: "Start a campaign", href: "/create-campaign" },
];

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    heading: "Donors",
    links: [
      { label: "How escrow works", href: "/how-escrow-works" },
      { label: "Refund policy", href: "/escrow-and-refund-policy" },
      { label: "Report a campaign", href: "/report-campaign" },
    ],
  },
  {
    heading: "Creators",
    links: [
      { label: "Start a campaign", href: "/create-campaign" },
      { label: "Payout terms", href: "/payout-terms" },
      { label: "Guidelines", href: "/guidelines" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

const DEFAULT_POLICY_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

/** Glyphs are keyed by destination so reordering the actions cannot swap them. */
const ACTION_ICONS: Record<string, string> = {
  "/discover": "search",
  "/create-campaign": "sprout",
};

function MarqueeGroup({ items }: { items: string[] }) {
  return (
    <div className={styles.marqueeGroup} aria-hidden="true">
      {items.map((item) => (
        <React.Fragment key={item}>
          <span>{item}</span>
          <span className={styles.marqueeMark}>✦</span>
        </React.Fragment>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   Footer
   ---------------------------------------------------------------------- */

export function CinematicFooter({
  wordmark = "ONERAISE",
  heading = "Fund a stage today",
  subheading = "Donations start at $10, and you can see exactly which stage your money is holding at any time.",
  marqueeItems = DEFAULT_MARQUEE,
  primaryActions = DEFAULT_PRIMARY_ACTIONS,
  ctaOrder = "donor-first",
  columns = DEFAULT_COLUMNS,
  policyLinks = DEFAULT_POLICY_LINKS,
  escrowAmount = "$4,182,400 in escrow",
  copyright = "© 2026 OneRaise",
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordmarkRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        [headingRef.current, bodyRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const actions =
    ctaOrder === "creator-first"
      ? [...primaryActions].reverse()
      : primaryActions;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {/* Stays put while the page above slides off it — see the module CSS. */}
      <footer className={styles.footer}>
        <div className={styles.aurora} />
        <div className={styles.grid} />

        <div
          ref={wordmarkRef}
          className={joinClasses(styles.giantText, "font-display")}
          aria-hidden="true"
        >
          {wordmark}
        </div>

        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            <MarqueeGroup items={marqueeItems} />
            <MarqueeGroup items={marqueeItems} />
          </div>
        </div>

        <div className={styles.center}>
          <h2
            ref={headingRef}
            className={joinClasses(styles.heading, "font-display")}
          >
            {heading}
          </h2>

          <div ref={bodyRef} style={{ width: "100%" }}>
            {subheading ? (
              <p className={styles.subheading}>{subheading}</p>
            ) : null}

            <div className={styles.actions}>
              <div className={styles.actionRow}>
                {actions.map((action) => (
                  <Magnetic
                    key={action.href}
                    as={Link}
                    href={action.href}
                    className={styles.pillPrimary}
                  >
                    <Icon
                      name={ACTION_ICONS[action.href] ?? "arrow-right"}
                      size={20}
                      className={styles.pillIcon}
                    />
                    {action.label}
                  </Magnetic>
                ))}
              </div>

              <div className={styles.linkRow}>
                {policyLinks.map((link) => (
                  <Magnetic
                    key={link.href}
                    as={Link}
                    href={link.href}
                    className={styles.pillSecondary}
                  >
                    {link.label}
                  </Magnetic>
                ))}
              </div>
            </div>

            <nav className={styles.columns} aria-label="Footer">
              {columns.map((column) => (
                <div key={column.heading} className={styles.column}>
                  <span
                    className={joinClasses("eyebrow", styles.columnHeading)}
                  >
                    {column.heading}
                  </span>
                  {column.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={styles.columnLink}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <span className={joinClasses("numeric", styles.copyright)}>
            {copyright}
          </span>

          <div className={styles.escrowBadge}>
            <span className={styles.escrowDot} aria-hidden="true" />
            <span className={styles.escrowLabel}>Live</span>
            <span className={joinClasses("numeric", styles.escrowAmount)}>
              {escrowAmount}
            </span>
          </div>

          <Magnetic
            as="button"
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className={styles.toTop}
          >
            <Icon name="arrow-up" size={20} className={styles.pillIcon} />
          </Magnetic>
        </div>
      </footer>
    </div>
  );
}

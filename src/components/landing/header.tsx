"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { PillNav } from "@/components/ui/pill-nav";
import { useViewer } from "@/components/viewer-context";
import { homeFor } from "@/lib/roles";
import { signOut } from "@/server/actions/auth";
import styles from "./responsive.module.css";
import nav from "./header.module.css";

const NAV_LINKS = [
  { label: "Discover", href: "/discover" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "For creators", href: "/#for-creators" },
];

export interface HeaderProps {
  /**
   * "overlay" floats the pill on the landing hero's photograph in cream and
   * takes it out of the flow, so the hero starts at the viewport top. "solid"
   * is the pill on the cream canvas, which is what every other page wants.
   */
  variant?: "overlay" | "solid";
}

export function Header({ variant = "solid" }: HeaderProps) {
  const viewer = useViewer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /*
   * The overlay treatment is only legible while the pill is actually over the
   * hero; past it, cream content would sit on the cream canvas. Below the hero
   * the pill takes the solid treatment instead.
   */
  useEffect(() => {
    if (variant !== "overlay") return;

    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > 40);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [variant]);

  const floating = variant === "overlay";
  const tone = floating && !scrolled ? "overlay" : "solid";
  const onPhoto = tone === "overlay" ? nav.onPhoto : "";
  const home = viewer ? homeFor(viewer.role) : "/signin";

  const links = NAV_LINKS.map((link) => (
    <Link key={link.label} href={link.href} className={`${nav.navLink} ${onPhoto}`}>
      {link.label}
    </Link>
  ));

  return (
    <>
      {/* Desktop */}
      <div className={styles.desktopOnly}>
        <PillNav
          tone={tone}
          float={floating}
          center={links}
          end={
            viewer ? (
              <>
                <Link href={home} className={`${nav.signIn} ${onPhoto}`}>
                  Dashboard
                </Link>
                <Link href={home} aria-label={`${viewer.displayName} — your account`}>
                  <Avatar initials={viewer.initials} size={36} fontSize={13} />
                </Link>
              </>
            ) : (
              <>
                <Link href="/signin" className={`${nav.signIn} ${onPhoto}`}>
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className={`${nav.signUp} ${tone === "overlay" ? nav.signUpOnPhoto : ""}`}
                >
                  Sign up
                </Link>
              </>
            )
          }
        />
      </div>

      {/* Mobile */}
      <div className={styles.mobileOnly} style={{ position: "relative" }}>
        <PillNav
          size="sm"
          tone={tone}
          float={floating}
          end={
            <>
              {viewer ? (
                <Link href={home} aria-label={`${viewer.displayName} — your account`}>
                  <Avatar initials={viewer.initials} size={32} fontSize={12} />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className={`${nav.signUp} ${nav.signUpSm} ${
                    tone === "overlay" ? nav.signUpOnPhoto : ""
                  }`}
                >
                  Sign up
                </Link>
              )}
              <button
                type="button"
                className={`${nav.menuButton} ${tone === "overlay" ? nav.menuButtonOnPhoto : ""}`}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                <Icon name="menu" size={16} />
              </button>
            </>
          }
        />

        {mobileMenuOpen && (
          <nav className={nav.menu}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={nav.menuLink}
              >
                {link.label}
              </Link>
            ))}
            {viewer ? (
              <>
                <Link
                  href={home}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${nav.menuLink} ${nav.menuDivider}`}
                >
                  Dashboard
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className={nav.menuLink}
                    style={{ width: "100%", textAlign: "left", background: "none", border: 0, cursor: "pointer", font: "inherit" }}
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className={`${nav.menuLink} ${nav.menuDivider}`}
              >
                Sign in
              </Link>
            )}
          </nav>
        )}
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

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

  /* The drawer owns focus while it is open, and restores it to the trigger
   * when it closes. Keeping this here, rather than on every menu item, also
   * covers Escape and tapping the scrim. */
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const menuButton = menuButtonRef.current;
    const drawer = drawerRef.current;
    const focusable = () =>
      drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [];
    const focusFirst = () => focusable()[0]?.focus();

    focusFirst();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      (lastFocused ?? menuButton)?.focus();
    };
  }, [mobileMenuOpen]);

  // A drawer is never useful once the desktop navigation takes over.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

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
      <div className={styles.mobileOnly}>
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
                ref={menuButtonRef}
                type="button"
                className={`${nav.menuButton} ${tone === "overlay" ? nav.menuButtonOnPhoto : ""}`}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                <Icon name="menu" size={16} />
              </button>
            </>
          }
        />

        <div className={nav.drawerLayer} data-open={mobileMenuOpen} aria-hidden={!mobileMenuOpen} inert={!mobileMenuOpen}>
          <button type="button" className={nav.drawerBackdrop} aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            className={nav.drawer}
          >
            <div className={nav.drawerHeader}>
              <span id="mobile-navigation-title" className={nav.drawerTitle}>
                Menu
              </span>
              <button type="button" className={nav.drawerClose} aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>
                <Icon name="x" size={20} />
              </button>
            </div>
            <nav className={nav.drawerNav} aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className={nav.drawerLink}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className={nav.drawerAccount}>
              {viewer ? (
                <>
                  <Link href={home} onClick={() => setMobileMenuOpen(false)} className={nav.drawerLink}>
                    Dashboard
                  </Link>
                  <form action={signOut} onSubmit={() => setMobileMenuOpen(false)}>
                    <button type="submit" className={nav.drawerLink}>
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className={nav.drawerLink}>
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

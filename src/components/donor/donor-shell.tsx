import type { ReactNode } from "react";
import {
  SidebarNav,
  type SidebarItem,
} from "@/components/dashboard/sidebar-nav";
import {
  MobileTabBar,
  type TabBarItem,
} from "@/components/dashboard/mobile-tab-bar";
import styles from "@/styles/responsive.module.css";

export type DonorActive =
  | "overview"
  | "reviews"
  | "donations"
  | "refunds"
  | "following"
  | "settings";

export interface ShellAccount {
  initials: string;
  name: string;
  roleLabel: string;
}

function navItems(active: DonorActive, reviewCount: number): SidebarItem[] {
  return [
    {
      icon: "trending-up",
      label: "Overview",
      href: "/donor",
      active: active === "overview",
    },
    {
      icon: "check",
      label: "Reviews",
      href: "/donor/reviews",
      active: active === "reviews",
      badge: reviewCount ? String(reviewCount) : undefined,
      badgeVariant: "funded",
    },
    {
      icon: "circle-dollar-sign",
      label: "Your donations",
      href: "/donor/donations",
      active: active === "donations",
    },
    {
      icon: "arrow-left",
      label: "Refunds",
      href: "/donor/refunds",
      active: active === "refunds",
    },
    {
      icon: "heart",
      label: "Following",
      href: "/donor/following",
      active: active === "following",
    },
    {
      icon: "users",
      label: "Account settings",
      href: "/donor/settings",
      active: active === "settings",
    },
    { icon: "search", label: "Discover", href: "/discover" },
  ];
}

function tabItems(active: DonorActive, reviewCount: number): TabBarItem[] {
  return [
    {
      icon: "trending-up",
      label: "Overview",
      href: "/donor",
      active: active === "overview",
    },
    {
      icon: "check",
      label: "Reviews",
      href: "/donor/reviews",
      active: active === "reviews",
      dot: reviewCount > 0,
    },
    {
      icon: "circle-dollar-sign",
      label: "Donations",
      href: "/donor/donations",
      active: active === "donations",
    },
    { icon: "search", label: "Discover", href: "/discover" },
    {
      icon: "users",
      label: "Account",
      href: "/donor/settings",
      active: active === "settings",
    },
  ];
}

/** Shared donor sidebar/content shell — same nav data, same desktop/mobile
 *  split, so the section a page belongs to is obvious. */
export function DonorShell({
  active,
  account,
  reviewCount = 0,
  desktop,
  mobile,
}: {
  active: DonorActive;
  account: ShellAccount;
  reviewCount?: number;
  desktop: ReactNode;
  mobile: ReactNode;
}) {
  return (
    <div style={{ background: "hsl(var(--canvas))" }}>
      <div className={styles.desktopOnly}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <SidebarNav
            items={navItems(active, reviewCount)}
            accountInitials={account.initials}
            accountName={account.name}
            accountRole={account.roleLabel}
          />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {desktop}
          </div>
        </div>
      </div>
      <div className={styles.mobileOnly}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          {mobile}
          <MobileTabBar items={tabItems(active, reviewCount)} />
        </div>
      </div>
    </div>
  );
}

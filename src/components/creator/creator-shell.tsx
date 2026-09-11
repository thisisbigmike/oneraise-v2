import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  SidebarNav,
  type SidebarItem,
} from "@/components/dashboard/sidebar-nav";
import {
  MobileTabBar,
  type TabBarItem,
} from "@/components/dashboard/mobile-tab-bar";
import { switchCampaign } from "@/server/actions/creator";
import type { CreatorShellData } from "@/lib/view-models";
import styles from "@/styles/responsive.module.css";

/** The campaign picker at the top of the creator sidebar. */
function CampaignSwitcher({ shell }: { shell: CreatorShellData }) {
  const active = shell.active;
  return (
    <div style={{ padding: "12px 12px 8px" }}>
      <details style={{ position: "relative" }}>
        <summary
          style={{
            listStyle: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 10,
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md)",
            background: "hsl(var(--canvas))",
            cursor: "pointer",
          }}
        >
          <span style={{ width: 28, height: 28, borderRadius: 6, background: "hsl(var(--secondary))", flexShrink: 0 }} />
          <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {active?.shortTitle ?? "No campaign yet"}
            </span>
            <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{active?.statusLabel ?? "Start one below"}</span>
          </span>
          <span style={{ marginLeft: "auto", color: "hsl(var(--muted-foreground))", display: "flex" }}>
            <Icon name="chevron-down" size={16} style={{ width: 16, height: 16 }} />
          </span>
        </summary>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "calc(100% + 4px)",
            zIndex: 20,
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md)",
            background: "hsl(var(--surface))",
            boxShadow: "var(--shadow-lg)",
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {shell.campaigns.map((c) => (
            <form key={c.id} action={switchCampaign}>
              <input type="hidden" name="slug" value={c.slug} />
              <button
                type="submit"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  padding: "8px 10px",
                  border: 0,
                  borderRadius: "var(--radius-sm)",
                  background: c.id === active?.id ? "hsl(var(--secondary))" : "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.shortTitle}</span>
                <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{c.statusLabel}</span>
              </button>
            </form>
          ))}
          <Link
            href="/create-campaign"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", fontSize: 13, borderTop: shell.campaigns.length ? "1px solid hsl(var(--border))" : undefined }}
          >
            <Icon name="plus" size={14} style={{ width: 14, height: 14 }} />
            Start a campaign
          </Link>
        </div>
      </details>
    </div>
  );
}

export type CreatorActive =
  | "overview"
  | "milestones"
  | "donors"
  | "payouts"
  | "updates"
  | "settings";

function navItems(active: CreatorActive, shell: CreatorShellData): SidebarItem[] {
  const items: SidebarItem[] = [
    {
      icon: "trending-up",
      label: "Overview",
      href: "/creator",
      active: active === "overview",
    },
    {
      icon: "check",
      label: "Milestones",
      href: "/creator/milestones",
      active: active === "milestones",
      badge: shell.pendingStageCount ? String(shell.pendingStageCount) : undefined,
    },
    {
      icon: "users",
      label: "Donors",
      href: "/creator/donors",
      active: active === "donors",
    },
    {
      icon: "circle-dollar-sign",
      label: "Payouts",
      href: "/creator/payouts",
      active: active === "payouts",
    },
    {
      icon: "message-circle",
      label: "Updates",
      href: "/creator/updates",
      active: active === "updates",
    },
    {
      icon: "shield-check",
      label: "Account settings",
      href: "/creator/settings",
      active: active === "settings",
    },
  ];
  if (shell.active) {
    items.push({ icon: "external-link", label: "View campaign", href: `/campaigns/${shell.active.slug}` });
  }
  return items;
}

function tabItems(active: CreatorActive): TabBarItem[] {
  return [
    {
      icon: "trending-up",
      label: "Overview",
      href: "/creator",
      active: active === "overview",
    },
    {
      icon: "check",
      label: "Stages",
      href: "/creator/milestones",
      active: active === "milestones",
    },
    {
      icon: "users",
      label: "Donors",
      href: "/creator/donors",
      active: active === "donors",
    },
    {
      icon: "circle-dollar-sign",
      label: "Payouts",
      href: "/creator/payouts",
      active: active === "payouts",
    },
    {
      icon: "shield-check",
      label: "Account",
      href: "/creator/settings",
      active: active === "settings",
    },
  ];
}

/** Shared creator sidebar/content shell for every creator page. */
export function CreatorShell({
  active,
  shell,
  desktop,
  mobile,
}: {
  active: CreatorActive;
  shell: CreatorShellData;
  desktop: ReactNode;
  mobile: ReactNode;
}) {
  return (
    <div style={{ background: "hsl(var(--canvas))" }}>
      <div className={styles.desktopOnly}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <SidebarNav
            items={navItems(active, shell)}
            accountInitials={shell.creatorInitials}
            accountName={shell.creatorName}
            accountRole="Creator"
            topSlot={<CampaignSwitcher shell={shell} />}
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
          <MobileTabBar items={tabItems(active)} />
        </div>
      </div>
    </div>
  );
}

/** What every creator page shows when the creator has no campaign yet. */
export function NoCampaign({ compact }: { compact?: boolean }) {
  return (
    <div style={{ padding: compact ? "20px 20px 28px" : "32px 40px 56px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Creator
        </div>
        <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
          Start your first campaign
        </h2>
      </div>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "56ch" }}>
        Split the work into stages, say what evidence each one needs, and set a goal. Donors fund it into escrow and it
        releases to you one stage at a time.
      </p>
      <Link href="/create-campaign" className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "fit-content" }}>
        Start a campaign
      </Link>
    </div>
  );
}

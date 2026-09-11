import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { PillNav } from "@/components/ui/pill-nav";
import { Avatar } from "@/components/ui/avatar";
import {
  SidebarNav,
  type SidebarItem,
} from "@/components/dashboard/sidebar-nav";
import { getAdminCounts } from "@/server/queries/admin";
import type { AdminCounts, Viewer } from "@/lib/view-models";
import styles from "@/styles/responsive.module.css";

export type AdminActive =
  | "overview"
  | "disputes"
  | "releases"
  | "identity"
  | "refunds"
  | "moderation"
  | "escrow"
  | "users"
  | "audit";

const badge = (n: number) => (n > 0 ? String(n) : undefined);

function adminGroups(
  active: AdminActive,
  counts: AdminCounts,
): { label?: string; items: SidebarItem[] }[] {
  return [
    {
      items: [
        {
          icon: "trending-up",
          label: "Overview",
          href: "/admin",
          active: active === "overview",
        },
      ],
    },
    {
      label: "Queues",
      items: [
        {
          icon: "message-circle",
          label: "Disputes",
          href: "/admin/disputes",
          active: active === "disputes",
          badge: badge(counts.disputes),
          badgeVariant: "destructive",
        },
        {
          icon: "check",
          label: "Releases",
          href: "/admin/releases",
          active: active === "releases",
          badge: badge(counts.releases),
          badgeVariant: "neutral",
        },
        {
          icon: "shield-check",
          label: "Identity",
          href: "/admin/identity",
          active: active === "identity",
          badge: badge(counts.identity),
          badgeVariant: "neutral",
        },
        {
          icon: "circle-dollar-sign",
          label: "Refunds",
          href: "/admin/refunds",
          active: active === "refunds",
          badge: badge(counts.refunds),
          badgeVariant: "neutral",
        },
        {
          icon: "alert-triangle",
          label: "Moderation",
          href: "/admin/moderation",
          active: active === "moderation",
          badge: badge(counts.moderation),
          badgeVariant: "neutral",
        },
      ],
    },
    {
      label: "Platform",
      items: [
        {
          icon: "lock",
          label: "Escrow",
          href: "/admin/escrow",
          active: active === "escrow",
        },
        {
          icon: "users",
          label: "Users",
          href: "/admin/users",
          active: active === "users",
        },
        {
          icon: "file-text",
          label: "Audit log",
          href: "/admin/audit",
          active: active === "audit",
        },
      ],
    },
  ];
}

function MobileTopBar({ initials }: { initials: string }) {
  return (
    <PillNav
      size="sm"
      brandSuffix={<Badge variant="neutral">Admin</Badge>}
      end={<Avatar initials={initials} size={32} fontSize={12} />}
    />
  );
}

function DesktopOnlyNotice({ title }: { title: string }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "20px 20px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          className="eyebrow"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Admin
        </div>
        <h3
          className="font-display"
          style={{
            fontSize: 24,
            lineHeight: 1.3,
            letterSpacing: "-0.010em",
            fontWeight: 600,
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "16px",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
        }}
      >
        <span
          style={{
            color: "hsl(var(--muted-foreground))",
            display: "flex",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <Icon
            name="alert-triangle"
            size={16}
            style={{ width: 16, height: 16 }}
          />
        </span>
        <span
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Admin is a work surface built for a wide screen. This queue is easiest
          to review on a desktop — from your phone, check{" "}
          <Link href="/admin" style={{ fontSize: 13 }}>
            Triage
          </Link>{" "}
          for what needs you first.
        </span>
      </div>
    </div>
  );
}

/** Shared admin shell: 248px desktop sidebar with live queue counts, and on
 *  mobile either a purpose-built screen (Triage, a case) or a "use desktop"
 *  notice. Pages gate access themselves before loading data. */
export async function AdminShell({
  active,
  title,
  viewer,
  children,
  mobileContent,
  mobileTopBar,
}: {
  active: AdminActive;
  title: string;
  viewer: Viewer;
  children: ReactNode;
  mobileContent?: ReactNode;
  mobileTopBar?: ReactNode;
}) {
  const counts = await getAdminCounts();
  return (
    <div style={{ background: "hsl(var(--canvas))" }}>
      <div className={styles.desktopOnly}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <SidebarNav
            groups={adminGroups(active, counts)}
            accountInitials={viewer.initials}
            accountName={viewer.name}
            accountRole={viewer.roleLabel}
            brandBadge={<Badge variant="neutral">Admin</Badge>}
          />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
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
          {mobileTopBar ?? <MobileTopBar initials={viewer.initials} />}
          {mobileContent ?? <DesktopOnlyNotice title={title} />}
        </div>
      </div>
    </div>
  );
}

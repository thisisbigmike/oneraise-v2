import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { signOut } from "@/server/actions/auth";

export interface SidebarItem {
  icon: string;
  label: string;
  href: string;
  badge?: string;
  badgeVariant?: "neutral" | "funded" | "destructive";
  active?: boolean;
}

/** The 248px desktop dashboard sidebar shared by the donor, creator and
 *  admin surfaces — logo, nav rows (active row is a sage pill), account
 *  chip pinned to the bottom. */
export function SidebarNav({
  items,
  groups,
  accountInitials,
  accountName,
  accountRole,
  topSlot,
  brandBadge,
}: {
  items?: SidebarItem[];
  groups?: { label?: string; items: SidebarItem[] }[];
  accountInitials: string;
  accountName: string;
  accountRole: string;
  topSlot?: ReactNode;
  brandBadge?: ReactNode;
}) {
  const resolvedGroups = groups ?? [{ items: items ?? [] }];
  return (
    <div
      style={{
        width: 248,
        flexShrink: 0,
        background: "hsl(var(--surface))",
        borderRight: "1px solid hsl(var(--border))",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 20px",
          borderBottom: "1px solid hsl(var(--border))",
        }}
      >
        <Link
          href="/"
          className="font-display"
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-0.014em",
            color: "hsl(var(--primary))",
          }}
        >
          OneRaise
        </Link>
        {brandBadge}
      </div>
      {topSlot}
      <div
        style={{
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        {resolvedGroups.map((group, gi) => (
          <div
            key={gi}
            style={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {group.label && (
              <span
                className="eyebrow"
                style={{
                  padding: "14px 12px 6px",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                {group.label}
              </span>
            )}
            {group.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  height: 40,
                  padding: "0 12px",
                  borderRadius: "var(--radius-md)",
                  background: item.active ? "hsl(var(--secondary))" : undefined,
                  color: item.active
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground))",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <Icon
                  name={item.icon}
                  size={16}
                  style={{ width: 16, height: 16 }}
                />
                {item.label}
                {item.badge && (
                  <span
                    className={`ms-badge ms-badge--${item.badgeVariant ?? "neutral"} numeric`}
                    style={{ marginLeft: "auto" }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "auto",
          padding: 12,
          borderTop: "1px solid hsl(var(--border))",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, padding: 8 }}
        >
          <Avatar initials={accountInitials} size={32} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {accountName}
            </span>
            <span
              style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
            >
              {accountRole}
            </span>
          </div>
          <form action={signOut} style={{ marginLeft: "auto", display: "flex" }}>
            <button
              type="submit"
              className="ms-btn ms-btn--ghost ms-btn--icon"
              aria-label="Sign out"
              title="Sign out"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              <Icon
                name="log-out"
                size={16}
                style={{ width: 16, height: 16 }}
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

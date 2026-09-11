import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export interface TabBarItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  dot?: boolean;
}

/** Bottom tab bar — the mobile replacement for the dashboard sidebar. */
export function MobileTabBar({ items }: { items: TabBarItem[] }) {
  return (
    <div
      style={{
        height: 72,
        flexShrink: 0,
        borderTop: "1px solid hsl(var(--border))",
        background: "hsl(var(--surface))",
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        paddingBottom: 8,
      }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            color: item.active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
            position: "relative",
            textDecoration: "none",
          }}
        >
          <Icon name={item.icon} size={20} style={{ width: 20, height: 20 }} />
          <span style={{ fontSize: 11, fontWeight: item.active ? 500 : 400 }}>{item.label}</span>
          {item.dot && (
            <span
              style={{
                position: "absolute",
                top: 8,
                right: 22,
                width: 7,
                height: 7,
                borderRadius: "999px",
                background: "hsl(var(--accent))",
              }}
            />
          )}
        </Link>
      ))}
    </div>
  );
}

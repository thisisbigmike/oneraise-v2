import type { ReactNode } from "react";

type BadgeVariant =
  | "neutral"
  | "outline"
  | "primary"
  | "funded"
  | "warning"
  | "destructive";

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children?: ReactNode;
}) {
  const cls = ["ms-badge", `ms-badge--${variant}`, className]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{children}</span>;
}

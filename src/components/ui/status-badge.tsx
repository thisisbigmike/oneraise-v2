import { Badge } from "./badge";
import type { CampaignStatus } from "@/lib/types";

export type { CampaignStatus };

const STATUS: Record<
  CampaignStatus,
  { label: string; variant: Parameters<typeof Badge>[0]["variant"]; dot: string }
> = {
  live: { label: "Live", variant: "neutral", dot: "var(--color-primary)" },
  // The single sanctioned lime fill outside a progress bar.
  funded: { label: "Funded", variant: "funded", dot: "var(--color-accent-foreground)" },
  expiring: { label: "Expiring", variant: "warning", dot: "var(--color-warning-foreground)" },
  failed: { label: "Failed", variant: "destructive", dot: "var(--color-destructive-foreground)" },
  refunded: { label: "Refunded", variant: "outline", dot: "var(--color-muted-foreground)" },
  draft: { label: "Draft", variant: "outline", dot: "var(--color-muted-foreground)" },
  paused: { label: "Paused", variant: "warning", dot: "var(--color-warning-foreground)" },
};

/** Campaign state as a badge. The dot is decorative — the label beside it
 *  always states the status in words. */
export function StatusBadge({ status, children }: { status: CampaignStatus; children?: string }) {
  const spec = STATUS[status] ?? STATUS.live;
  return (
    <Badge variant={spec.variant}>
      <span aria-hidden="true" className="ms-badge__dot" style={{ backgroundColor: spec.dot }} />
      {children ?? spec.label}
    </Badge>
  );
}

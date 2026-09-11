import type { CSSProperties } from "react";

type Variant = "hero-desktop" | "hero-mobile" | "card";

const RAISED_STYLE: Record<Variant, { className: string; style?: CSSProperties }> = {
  "hero-desktop": { className: "ms-progress__raised numeric font-display" },
  "hero-mobile": { className: "numeric", style: { fontSize: 19, fontWeight: 600 } },
  card: { className: "numeric", style: { fontSize: 16, fontWeight: 600 } },
};

export function FundingProgress({
  raised,
  goalLabel,
  fillPct,
  variant,
}: {
  raised: string;
  goalLabel: string;
  fillPct: number;
  variant: Variant;
}) {
  const raisedProps = RAISED_STYLE[variant];
  const trackClassName = variant === "hero-desktop" ? "ms-progress__track" : "ms-progress__track ms-progress__track--sm";
  return (
    <div className="ms-progress">
      <div className="ms-progress__figures">
        <span className={raisedProps.className} style={raisedProps.style}>
          {raised}
        </span>
        <span className="ms-progress__goal numeric">{goalLabel}</span>
      </div>
      <div className={trackClassName}>
        <div className="ms-progress__fill" style={{ width: `${fillPct}%` }} />
      </div>
    </div>
  );
}

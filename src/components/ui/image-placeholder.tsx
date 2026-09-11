import type { CSSProperties } from "react";

/**
 * Stand-in for campaign photography. The design system ships no real imagery
 * — its own placeholders are "inline SVG ... built from the brand neutrals
 * ... with a green circle motif and a Georgia numeral" (readme.md,
 * Imagery). This reproduces that convention: a sage `.reserve` ground behind
 * a green circle mark, so a grid of these can never reflow when real
 * photography replaces them.
 */
export function ImagePlaceholder({
  caption,
  mark,
  className,
  style,
}: {
  caption: string;
  mark?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const cls = ["reserve", className].filter(Boolean).join(" ");
  return (
    <div
      className={cls}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "999px",
          background: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          fontFamily: "var(--font-display)",
          fontVariationSettings: "var(--font-display-variation)",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {mark ?? "OR"}
      </span>
      <span
        className="eyebrow"
        style={{
          color: "hsl(var(--muted-foreground))",
          textAlign: "center",
          padding: "0 12px",
        }}
      >
        {caption}
      </span>
    </div>
  );
}

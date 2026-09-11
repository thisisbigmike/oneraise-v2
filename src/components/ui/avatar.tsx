import type { CSSProperties } from "react";

/** Sage-fill initials circle — the system's stand-in for a photo, used for
 *  donors, creators and account chips throughout. */
export function Avatar({
  initials,
  size = 32,
  fontSize,
  style,
}: {
  initials: string;
  size?: number;
  fontSize?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "999px",
        background: "hsl(var(--secondary))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: fontSize ?? Math.round(size * 0.4),
        fontWeight: 600,
        color: "hsl(var(--primary-hover))",
        flexShrink: 0,
        ...style,
      }}
    >
      {initials}
    </span>
  );
}

import type { CSSProperties, ReactNode, SVGProps } from "react";

/**
 * Lucide glyphs, inline — ported 1:1 from the design system's Icon component
 * (components/core/Icon.jsx), which itself inlines lucide-react path data at
 * the same 24x24 / stroke-2 / round-cap geometry so the kit needs no npm
 * package. Add a glyph by pasting its Lucide `d` attribute into GLYPHS.
 */
const GLYPHS: Record<string, string[]> = {
  check: ["M20 6 9 17l-5-5"],
  "alert-triangle": [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
    "M12 9v4",
    "M12 17h.01",
  ],
  x: ["M18 6 6 18", "m6 6 12 12"],
  "chevron-down": ["m6 9 6 6 6-6"],
  "chevron-right": ["m9 18 6-6-6-6"],
  "arrow-right": ["M5 12h14", "m12 5 7 7-7 7"],
  "arrow-left": ["m12 19-7-7 7-7", "M19 12H5"],
  "arrow-up": ["m5 12 7-7 7 7", "M12 19V5"],
  "arrow-up-right": ["M7 7h10v10", "M7 17 17 7"],
  plus: ["M5 12h14", "M12 5v14"],
  minus: ["M5 12h14"],
  search: ["m21 21-4.34-4.34"],
  sprout: [
    "M7 20h10",
    "M10 20c5.5-2.5.8-6.4 3-10",
    "M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z",
    "M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z",
  ],
  heart: [
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  ],
  share: ["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", "m16 6-4-4-4 4", "M12 2v13"],
  bell: [
    "M10.268 21a2 2 0 0 0 3.464 0",
    "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
  ],
  clock: ["M12 6v6l4 2"],
  "trending-up": ["M16 7h6v6", "m22 7-8.5 8.5-5-5L2 17"],
  users: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  lock: ["M7 11V7a5 5 0 0 1 10 0v4"],
  "shield-check": [
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
    "m9 12 2 2 4-4",
  ],
  "file-text": [
    "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
    "M14 2v4a2 2 0 0 0 2 2h4",
    "M16 13H8",
    "M16 17H8",
    "M10 9H8",
  ],
  "circle-dollar-sign": ["M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8", "M12 18V6"],
  "external-link": ["M15 3h6v6", "M10 14 21 3", "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"],
  menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
  calendar: ["M8 2v4", "M16 2v4", "M3 10h18"],
  "message-circle": ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z"],
  "log-out": ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "m16 17 5-5-5-5", "M21 12H9"],
  mail: ["m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"],
  phone: [
    "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
  ],
  "map-pin": ["M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"],
  // Brand marks. Lucide deprecated these in its own package; the path data is
  // kept here so the kit still needs no npm dependency.
  facebook: ["M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"],
  instagram: ["M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", "M17.5 6.5h.01"],
  twitter: [
    "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
  ],
  github: [
    "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
    "M9 18c-4.51 2-5-2-7-2",
  ],
  dribbble: ["M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94", "M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32", "M8.56 2.75c4.37 6 6 9.42 8 17.72"],
  linkedin: ["M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z", "M4 4h.01"],
  youtube: [
    "M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17",
    "m10 15 5-3-5-3z",
  ],
};

/** Non-path primitives some glyphs need alongside their paths. */
const EXTRAS: Record<string, ReactNode> = {
  search: <circle key="e" cx="11" cy="11" r="8" />,
  clock: <circle key="e" cx="12" cy="12" r="10" />,
  users: <circle key="e" cx="9" cy="7" r="4" />,
  lock: <rect key="e" width="18" height="11" x="3" y="11" rx="2" ry="2" />,
  "circle-dollar-sign": <circle key="e" cx="12" cy="12" r="10" />,
  calendar: <rect key="e" width="18" height="18" x="3" y="4" rx="2" />,
  mail: <rect key="e" width="20" height="16" x="2" y="4" rx="2" />,
  "map-pin": <circle key="e" cx="12" cy="10" r="3" />,
  instagram: <rect key="e" width="20" height="20" x="2" y="2" rx="5" ry="5" />,
  dribbble: <circle key="e" cx="12" cy="12" r="10" />,
  linkedin: <rect key="e" width="4" height="12" x="2" y="9" />,
};

type IconName = keyof typeof GLYPHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName | (string & {});
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
}

export function Icon({ name, size = 16, strokeWidth = 2, className, style, ...rest }: IconProps) {
  const paths = GLYPHS[name];
  if (!paths) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
      {...rest}
    >
      {EXTRAS[name] ?? null}
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

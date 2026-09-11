"use client";

import { useEffect, useState } from "react";
import { MINUTE, countdown } from "@/lib/format";

/**
 * A ticking clock to `end`. The first render uses the server's `initialNow`
 * so the server HTML and the hydrated client agree; it starts ticking after.
 */
export function Countdown({
  end,
  initialNow,
  format = "hms",
}: {
  end: number;
  initialNow: number;
  /** "hms" → 14:22:08, "ms" → 24:12 (minutes may exceed 59) */
  format?: "hms" | "ms";
}) {
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (format === "ms") {
    const diff = Math.max(0, end - now);
    const m = Math.floor(diff / MINUTE);
    const s = Math.floor((diff % MINUTE) / 1000);
    return <>{`${m}:${String(s).padStart(2, "0")}`}</>;
  }
  return <>{countdown(end, now)}</>;
}

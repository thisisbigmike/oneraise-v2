/**
 * Display formatting shared by the server data layer and client components.
 * Everything the UI shows as money, a date or a countdown goes through here so
 * the whole site speaks one format. Dates render in West Africa Time — the
 * platform's operating timezone — so server and client always agree.
 */

export const DAY = 86_400_000;
export const HOUR = 3_600_000;
export const MINUTE = 60_000;

const TZ = "Africa/Lagos";

export function usd(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? "−" : "";
  return `${sign}$${Math.abs(rounded).toLocaleString("en-US")}`;
}

/** A fee or deduction, always shown with a leading minus. */
export function negativeUsd(n: number): string {
  return `−$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
}

export function count(n: number): string {
  return n.toLocaleString("en-US");
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${count(n)} ${n === 1 ? one : many}`;
}

export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)));
}

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TZ });
const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TZ,
});
const hourMinute = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});
const hourMinuteSecond = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: TZ,
});
const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: TZ });
const monthYear = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: TZ });

/** "22 Jul" */
export function shortDate(ms: number): string {
  return dayMonth.format(ms);
}

/** "22 Jul 2026" */
export function longDate(ms: number): string {
  return dayMonthYear.format(ms);
}

/** "09:12" */
export function clockTime(ms: number): string {
  return hourMinute.format(ms);
}

/** "3 Sep · 09:12", or "09:12 today" when it is today. */
export function dateTime(ms: number, now = Date.now()): string {
  if (dayMonthYear.format(ms) === dayMonthYear.format(now)) return `${clockTime(ms)} today`;
  return `${shortDate(ms)} · ${clockTime(ms)}`;
}

/** "3 Sep · 09:12:04" */
export function auditTimestamp(ms: number): string {
  return `${shortDate(ms)} · ${hourMinuteSecond.format(ms)}`;
}

/** "August" */
export function monthOf(ms: number): string {
  return monthName.format(ms);
}

/** "Jul 2026" */
export function monthAndYear(ms: number): string {
  return monthYear.format(ms);
}

/** A span of time in the largest sensible unit: "14 hours", "2 days", "39 minutes". */
export function span(ms: number): string {
  const abs = Math.abs(ms);
  if (abs >= 2 * DAY) return plural(Math.round(abs / DAY), "day");
  if (abs >= 2 * HOUR) return plural(Math.round(abs / HOUR), "hour");
  if (abs >= HOUR) return "1 hour";
  return plural(Math.max(1, Math.round(abs / MINUTE)), "minute");
}

/** "19 hours ago", "2 days ago", "just now". */
export function ago(ms: number, now = Date.now()): string {
  const diff = now - ms;
  if (diff < MINUTE) return "just now";
  return `${span(diff)} ago`;
}

/** Whole days remaining until `end`, never negative. */
export function daysUntil(end: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((end - now) / DAY));
}

/** "18 days left", "39 hours left", "Ended" — the funding clock on a card. */
export function timeLeft(end: number | null, now = Date.now()): string {
  if (end == null) return "Not launched";
  const diff = end - now;
  if (diff <= 0) return "Ended";
  if (diff < 2 * DAY) return `${plural(Math.max(1, Math.round(diff / HOUR)), "hour")} left`;
  return `${plural(Math.ceil(diff / DAY), "day")} left`;
}

/** "HH:MM:SS" countdown to `end` — used by the live release clock. */
export function countdown(end: number, now = Date.now()): string {
  const diff = Math.max(0, end - now);
  const h = Math.floor(diff / HOUR);
  const m = Math.floor((diff % HOUR) / MINUTE);
  const s = Math.floor((diff % MINUTE) / 1000);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function initialsOf(name: string): string {
  const parts = name
    .replace(/[^\p{L}\p{N}\s&]/gu, " ")
    .split(/\s+/)
    .filter((p) => p && p !== "&");
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function stageNumber(position: number): string {
  return String(position).padStart(2, "0");
}

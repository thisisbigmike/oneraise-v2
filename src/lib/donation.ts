/**
 * The rule for a custom donation amount, shared by the form and the server
 * action so both agree on what is acceptable. The client uses it to show the
 * problem as you type; the server uses it as the one that actually decides,
 * because a hand-rolled request never runs the client half.
 */
import { usd } from "./format";

/** The floor the landing page promises: "Donations start at $10". */
export const MIN_DONATION = 10;

/**
 * A ceiling, not a policy — it keeps a slipped keyboard out of the ledger and
 * the escrow arithmetic inside safe-integer range.
 */
export const MAX_DONATION = 1_000_000;

export type ParsedAmount = { ok: true; amount: number } | { ok: false; error: string };

/**
 * Whole dollars only. Everything the platform stores and releases is an
 * integer — tiers, milestones, refunds — so accepting cents here would put a
 * fraction into pro-rata splits that nothing else is built to carry.
 */
export function parseDonationAmount(raw: string): ParsedAmount {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!cleaned) return { ok: false, error: "Enter an amount." };
  if (!/^\d+$/.test(cleaned)) {
    return { ok: false, error: "Enter a whole dollar amount — digits only, no cents." };
  }
  const amount = Number(cleaned);
  if (!Number.isSafeInteger(amount) || amount > MAX_DONATION) {
    return { ok: false, error: `The most you can donate in one go is ${usd(MAX_DONATION)}.` };
  }
  if (amount < MIN_DONATION) {
    return { ok: false, error: `The smallest donation is ${usd(MIN_DONATION)}.` };
  }
  return { ok: true, amount };
}

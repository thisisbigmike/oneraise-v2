"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityContextPanel } from "@/components/auth/context-panel";
import { Countdown } from "@/components/ui/countdown";
import { FormError, FormSuccess, SubmitButton } from "@/components/ui/form-status";
import { sendUnlockLink } from "@/server/actions/auth";

export function LockedView({
  email,
  lockedUntil,
  initialNow,
  attempts,
}: {
  email: string;
  lockedUntil: number | null;
  initialNow: number;
  attempts: { left: string; right: string }[];
}) {
  const [state, action] = useActionState(sendUnlockLink, {});
  const locked = lockedUntil != null;

  return (
    <AuthShell
      topBarRight={
        <Link href="/signin" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          Back to sign in
        </Link>
      }
      contextPanel={
        <SecurityContextPanel
          eyebrow="Attempt log"
          heading="Nothing in escrow was touched"
          body="A lock stops sign-in only. Pledges, milestone approvals and payouts continue under their own rules."
          rows={attempts.length ? attempts : [{ left: "No recent attempts", right: "—" }]}
        />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span className={`ms-badge ${locked ? "ms-badge--destructive" : "ms-badge--neutral"}`} style={{ width: "fit-content" }}>
          {locked ? "Locked" : "Not locked"}
        </span>
        <h2
          className="font-display"
          style={{ fontSize: 40, lineHeight: 1.12, letterSpacing: "-0.018em", fontWeight: 600, margin: 0, textWrap: "balance" }}
        >
          {locked ? "This account is locked" : "Sign-in is open"}
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
          {locked
            ? "Five sign-in attempts failed. Sign-in is blocked for 30 minutes, or you can unlock it now by email."
            : "There's no lock on this account right now. If a password isn't working, reset it."}
        </p>
      </div>

      {locked && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            padding: 20,
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
          }}
        >
          <span className="numeric font-display" style={{ fontSize: 30, lineHeight: 1, fontWeight: 600, letterSpacing: "-0.014em" }}>
            <Countdown end={lockedUntil} initialNow={initialNow} format="ms" />
          </span>
          <span style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>until sign-in reopens</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {locked ? (
          <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="email" value={email} />
            <SubmitButton className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%" }} pendingLabel="Sending…" disabled={state.ok}>
              {state.ok ? "Unlock link sent" : `Send unlock link to ${email}`}
            </SubmitButton>
            {state.ok && (
              <FormSuccess message={state.message}>
                {state.link && (
                  // A route handler, not a page: a plain anchor so the browser follows its redirect.
                  <a href={state.link} style={{ fontSize: 13 }}>
                    No mail is sent in development — open the unlock link →
                  </a>
                )}
              </FormSuccess>
            )}
            <FormError message={state.error} />
          </form>
        ) : (
          <Link href="/forgot-password" className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%" }}>
            Reset your password
          </Link>
        )}
        <Link href="/contact" className="ms-btn ms-btn--secondary ms-btn--lg" style={{ width: "100%" }}>
          Contact support
        </Link>
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Was this not you?</span>
        <span style={{ fontSize: 13, lineHeight: 1.55, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
          Reset your password before signing in again, and check your active sessions in account settings once you are back.
        </span>
      </div>
    </AuthShell>
  );
}

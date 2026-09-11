"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityContextPanel } from "@/components/auth/context-panel";
import { Icon } from "@/components/ui/icon";
import { FormError, SubmitButton } from "@/components/ui/form-status";
import { requestPasswordReset } from "@/server/actions/auth";

export function ForgotView() {
  const [state, action] = useActionState(requestPasswordReset, {});
  const sent = state.ok === true;

  return (
    <AuthShell
      topBarRight={
        <Link href="/signin" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          Back to sign in
        </Link>
      }
      mobileTopBarCenter={<span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>Password reset</span>}
      contextPanel={
        <SecurityContextPanel
          eyebrow="Account security"
          heading="How your account is protected"
          body="A password gets you in. It does not, on its own, move money."
          rows={[
            { left: "Escrow release", right: "Needs milestone approval" },
            { left: "Reset link", right: "Expires in 30 min" },
            { left: "Failed attempts", right: "5 locks for 30 min" },
          ]}
        />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Password reset
        </div>
        <h2
          className="font-display"
          style={{ fontSize: 40, lineHeight: 1.12, letterSpacing: "-0.018em", fontWeight: 600, margin: 0, textWrap: "balance" }}
        >
          Reset your password
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
          Enter the email on your account. A reset link is sent if it matches one.
        </p>
      </div>

      {sent ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: 16,
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--secondary))",
          }}
        >
          <Icon name="check" size={16} style={{ width: 16, height: 16, color: "hsl(var(--primary))", flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 14, lineHeight: 1.55 }}>
            If that email matches an account, a reset link is on its way. It works once and expires in 30 minutes.
          </span>
        </div>
      ) : (
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="fp-email" style={{ fontSize: 14, fontWeight: 500 }}>
              Email
            </label>
            <input
              id="fp-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="ms-input"
              style={{ height: "var(--control-h-lg)" }}
              placeholder="you@example.org"
            />
          </div>
          <FormError message={state.error} />
          <SubmitButton className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%" }} pendingLabel="Sending…">
            Send reset link
          </SubmitButton>
          <Link href="/signin" className="ms-btn ms-btn--ghost ms-btn--lg" style={{ width: "100%" }}>
            <Icon name="arrow-left" size={16} style={{ width: 16, height: 16 }} />
            Back to sign in
          </Link>
        </form>
      )}
      <p style={{ margin: "auto 0 0", fontSize: 12, lineHeight: 1.5, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
        A reset link does not release escrow or change payout details. Saving a new password signs out every other session.
      </p>
      {sent && state.link && (
        <Link href={state.link} style={{ fontSize: 13 }}>
          (No mail is sent in development — open the reset link →)
        </Link>
      )}
    </AuthShell>
  );
}

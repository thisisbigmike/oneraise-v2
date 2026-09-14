"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityContextPanel } from "@/components/auth/context-panel";
import { Countdown } from "@/components/ui/countdown";
import { FieldError, FormError, SubmitButton } from "@/components/ui/form-status";
import { resetPassword } from "@/server/actions/auth";

function strength(password: string): { pct: number; label: string } {
  if (!password) return { pct: 0, label: "" };
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/\d/.test(password)) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
  return { pct: Math.max(8, (score / 5) * 100), label: labels[score] };
}

export function ResetView({
  token,
  expiresAt,
  initialNow,
  sessionRows,
}: {
  token: string | null;
  expiresAt: number | null;
  initialNow: number;
  sessionRows: { left: string; right: string }[];
}) {
  const [state, action] = useActionState(resetPassword, {});
  const [password, setPassword] = useState("");
  const meter = strength(password);
  const valid = token != null && expiresAt != null;

  return (
    <AuthShell
      topBarRight={
        valid ? (
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            Link expires in <Countdown end={expiresAt} initialNow={initialNow} format="ms" />
          </span>
        ) : (
          <Link href="/signin" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            Back to sign in
          </Link>
        )
      }
      mobileTopBarRight={
        valid ? (
          <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
            <Countdown end={expiresAt} initialNow={initialNow} format="ms" />
          </span>
        ) : undefined
      }
      contextPanel={
        <SecurityContextPanel
          eyebrow="Account security"
          heading="What a reset ends"
          body="Every session on this account is closed the moment you save. This browser is signed straight back in."
          rows={sessionRows}
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
          {valid ? "Choose a new password" : "This link has expired"}
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
          {valid
            ? "Saving a new password signs out every other session on this account."
            : "Reset links work once and last 30 minutes. Request a fresh one and use it straight away."}
        </p>
      </div>

      {valid ? (
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="hidden" name="token" value={token} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="rp-new" style={{ fontSize: 14, fontWeight: 500 }}>
              New password
            </label>
            <input
              id="rp-new"
              name="new"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              className="ms-input"
              style={{ height: "var(--control-h-lg)" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={state.fieldErrors?.new ? true : undefined}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={{ flex: 1, height: 4, borderRadius: 999, background: "hsl(var(--border))", overflow: "hidden" }}>
                <span style={{ display: "block", width: `${meter.pct}%`, height: "100%", background: "hsl(var(--accent))" }} />
              </span>
              <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", minWidth: 70, textAlign: "right" }}>{meter.label}</span>
            </div>
            <FieldError message={state.fieldErrors?.new} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="rp-conf" style={{ fontSize: 14, fontWeight: 500 }}>
              Confirm password
            </label>
            <input
              id="rp-conf"
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
              className="ms-input"
              style={{ height: "var(--control-h-lg)" }}
              aria-invalid={state.fieldErrors?.confirm ? true : undefined}
              aria-describedby={state.fieldErrors?.confirm ? "rp-err" : undefined}
            />
            <FieldError id="rp-err" message={state.fieldErrors?.confirm} />
          </div>
          <FormError message={state.error} />
          <SubmitButton className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%", marginTop: 4 }} pendingLabel="Saving…">
            Save password
          </SubmitButton>
        </form>
      ) : (
        <Link href="/forgot-password" className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%" }}>
          Request a new link
        </Link>
      )}
      <p style={{ margin: "auto 0 0", fontSize: 12, lineHeight: 1.5, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
        Two-factor stays as it was. Your escrow balance and donation history are unaffected.
      </p>
    </AuthShell>
  );
}

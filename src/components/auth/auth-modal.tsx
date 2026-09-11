"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { FormError, SubmitButton } from "@/components/ui/form-status";
import { signIn } from "@/server/actions/auth";

/** The "Back this project" interruption — auth over the campaign, no
 *  navigation away. Mounted by any page that needs a signed-out visitor to
 *  authenticate before an action (pledging, following) completes. */
export function AuthModal({
  amountLabel,
  campaignName,
  returnTo,
  onClose,
  onSignedIn,
}: {
  amountLabel: string;
  campaignName: string;
  /** Where "Create an account instead" should bring the visitor back to. */
  returnTo: string;
  onClose: () => void;
  onSignedIn: () => void;
}) {
  const [state, action] = useActionState(signIn, {});

  useEffect(() => {
    if (state.ok) onSignedIn();
  }, [state.ok, onSignedIn]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "hsl(var(--scrim) / 0.5)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Sign in to fund ${campaignName}`}
        style={{
          position: "relative",
          width: "min(480px, calc(100vw - 40px))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          className="ms-btn ms-btn--ghost ms-btn--icon"
          aria-label="Close"
          onClick={onClose}
          style={{ position: "absolute", right: 12, top: 12 }}
        >
          <Icon name="x" size={16} style={{ width: 16, height: 16 }} />
        </button>
        <div style={{ padding: "24px 24px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          <h4
            className="font-display"
            style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0, maxWidth: "22ch" }}
          >
            Sign in to fund this project
          </h4>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "hsl(var(--muted-foreground))" }}>
            Sign in to place your <span className="numeric" style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>{amountLabel}</span>{" "}
            pledge to {campaignName}. You&apos;ll confirm it before anything is recorded.
          </p>
        </div>
        <form action={action} style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="hidden" name="stay" value="1" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="auth-modal-email" style={{ fontSize: 14, fontWeight: 500 }}>
              Email
            </label>
            <input id="auth-modal-email" name="email" type="email" required autoComplete="email" className="ms-input" placeholder="you@example.org" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <label htmlFor="auth-modal-password" style={{ fontSize: 14, fontWeight: 500 }}>
                Password
              </label>
              <Link href="/forgot-password" style={{ fontSize: 13 }}>
                Forgot?
              </Link>
            </div>
            <input id="auth-modal-password" name="password" type="password" required autoComplete="current-password" className="ms-input" />
          </div>
          <FormError message={state.error} />
          <SubmitButton className="ms-btn ms-btn--primary ms-btn--md" style={{ width: "100%", marginTop: 4 }} pendingLabel="Signing in…">
            Sign in and continue
          </SubmitButton>
          <Link href={`/signup?next=${encodeURIComponent(returnTo)}`} className="ms-btn ms-btn--ghost ms-btn--md" style={{ width: "100%" }}>
            Create an account instead
          </Link>
        </form>
        <div
          style={{
            borderTop: "1px solid hsl(var(--border))",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "hsl(var(--muted-foreground))",
          }}
        >
          <Icon name="lock" size={14} style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 12, lineHeight: 1.4 }}>Funds stay in escrow until a milestone is approved.</span>
        </div>
      </div>
    </div>
  );
}

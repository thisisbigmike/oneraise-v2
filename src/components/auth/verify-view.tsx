"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityContextPanel } from "@/components/auth/context-panel";
import { Icon } from "@/components/ui/icon";
import { FormError, FormSuccess, SubmitButton } from "@/components/ui/form-status";
import { resendVerification, signOut } from "@/server/actions/auth";

export function VerifyView({
  email,
  verified,
  home,
  notice,
}: {
  email: string;
  verified: boolean;
  home: string;
  notice: "verified" | "invalid" | null;
}) {
  const [state, resend] = useActionState(() => resendVerification(), {});

  return (
    <AuthShell
      topBarRight={
        <form action={signOut}>
          <button type="submit" className="ms-btn ms-btn--ghost ms-btn--md">
            <Icon name="log-out" size={16} style={{ width: 16, height: 16 }} />
            Sign out
          </button>
        </form>
      }
      contextPanel={
        <SecurityContextPanel
          eyebrow="Account security"
          heading="Why a verified address matters"
          body="Milestone reviews, dispute windows and refund notices all arrive by email. An unverified address means a release could pass without you seeing it."
          rows={[
            { left: "Dispute window", right: "72 hours" },
            { left: "Escrow release", right: "Needs milestone approval" },
            { left: "What creators see", right: "Your display name only" },
          ]}
        />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Verify your email
        </div>
        <h2
          className="font-display"
          style={{ fontSize: 40, lineHeight: 1.12, letterSpacing: "-0.018em", fontWeight: 600, margin: 0, textWrap: "balance" }}
        >
          {verified ? "Your email is verified" : "Check your email"}
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
          {verified ? (
            <>
              Reviews, dispute windows and refund notices will reach{" "}
              <span style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>{email}</span>.
            </>
          ) : (
            <>
              A verification link was sent to <span style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>{email}</span>. It
              expires in 30 minutes.
            </>
          )}
        </p>
      </div>

      {notice === "invalid" && <FormError message="That verification link has expired or was already used. Send a fresh one below." />}

      {verified ? (
        <Link href={home} className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "fit-content" }}>
          Continue to your dashboard
        </Link>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: 20,
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--secondary))",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
              <Icon name="shield-check" size={14} style={{ width: 14, height: 14 }} />
              Your account exists already
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.55, color: "hsl(var(--muted-foreground))" }}>
              Browsing and pledging work now. Verify so review windows and refund notices reach you.
            </span>
          </div>

          <form action={resend} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <SubmitButton className="ms-btn ms-btn--secondary ms-btn--lg" pendingLabel="Sending…">
                Resend
              </SubmitButton>
              <Link href={home} className="ms-btn ms-btn--ghost ms-btn--lg">
                Do this later
              </Link>
            </div>
            {state.ok && (
              <FormSuccess message={state.message}>
                {state.link && (
                  // A route handler, not a page: a plain anchor so the browser follows its redirect.
                  <a href={state.link} style={{ fontSize: 13 }}>
                    No mail is sent in development — open the verification link →
                  </a>
                )}
              </FormSuccess>
            )}
            <FormError message={state.error} />
          </form>
        </>
      )}

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Nothing arrived?</span>
        <span style={{ fontSize: 13, lineHeight: 1.55, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
          Check the spam folder, then confirm the address above is the one you typed. Mail from OneRaise comes from notifications@oneraise.org.
        </span>
      </div>
    </AuthShell>
  );
}

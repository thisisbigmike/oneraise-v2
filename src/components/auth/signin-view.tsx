"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { CampaignContextPanel } from "@/components/auth/context-panel";
import { Icon } from "@/components/ui/icon";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { FormError, FormSuccess, SubmitButton } from "@/components/ui/form-status";
import { signIn } from "@/server/actions/auth";
import type { ContextCampaign } from "@/lib/view-models";

export function SignInView({
  next,
  campaign,
  notice,
  demoHint,
}: {
  next: string | null;
  campaign: ContextCampaign | null;
  notice: string | null;
  demoHint: boolean;
}) {
  const [state, action] = useActionState(signIn, {});
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";

  return (
    <AuthShell
      topBarRight={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>New to OneRaise?</span>
          <Link href={signupHref} className="ms-btn ms-btn--secondary ms-btn--md">
            Create an account
          </Link>
        </div>
      }
      mobileTopBarRight={<span style={{ width: 40 }} />}
      mobileContextCard={
        campaign ? (
          <Link
            href={`/campaigns/${campaign.slug}`}
            style={{
              display: "flex",
              gap: 12,
              padding: 12,
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--secondary))",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <ImagePlaceholder caption="16:10" style={{ width: 72, height: 45, flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {campaign.title}
              </span>
              <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {campaign.raised} raised · {campaign.donorsLabel}
              </span>
            </div>
          </Link>
        ) : undefined
      }
      contextPanel={
        <CampaignContextPanel
          eyebrow={next ? "You were viewing" : "Open now"}
          heading="Escrow, in stages"
          body="A donation is held rather than paid. The creator draws one milestone at a time, and only after donors have had 72 hours to review the work. Your account is where those reviews land."
          campaign={campaign}
        />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Sign in
        </div>
        <h2
          className="font-display"
          style={{ fontSize: 40, lineHeight: 1.12, letterSpacing: "-0.018em", fontWeight: 600, margin: 0, textWrap: "balance" }}
        >
          Sign in to OneRaise
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "44ch" }}>
          Fund a project in stages, or track the milestones you have already funded.
        </p>
      </div>

      {notice && <FormSuccess message={notice} />}

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {next && <input type="hidden" name="next" value={next} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="si-email" style={{ fontSize: 14, fontWeight: 500 }}>
            Email
          </label>
          <input
            id="si-email"
            name="email"
            type="email"
            autoComplete="email"
            className="ms-input"
            style={{ height: "var(--control-h-lg)" }}
            placeholder="you@example.org"
            defaultValue={state.values?.email}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <label htmlFor="si-pass" style={{ fontSize: 14, fontWeight: 500 }}>
              Password
            </label>
            <Link href="/forgot-password" style={{ fontSize: 13 }}>
              Forgot password?
            </Link>
          </div>
          <input
            id="si-pass"
            name="password"
            type="password"
            autoComplete="current-password"
            className="ms-input"
            style={{ height: "var(--control-h-lg)" }}
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "si-err" : undefined}
          />
        </div>
        <FormError id="si-err" message={state.error} />
        <SubmitButton className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%", marginTop: 4 }} pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
        {demoHint && (
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: "hsl(var(--muted-foreground))" }}>
            Demo accounts all use the password <span className="numeric">oneraise-demo-2026</span>: amina@example.org
            (donor), hausa@example.org (creator), tomi@example.org (admin).
          </p>
        )}
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", color: "hsl(var(--muted-foreground))" }}>
        <Icon name="lock" size={14} style={{ width: 14, height: 14 }} />
        <span style={{ fontSize: 12, lineHeight: 1.4 }}>Funds stay in escrow until a milestone is approved.</span>
      </div>
    </AuthShell>
  );
}

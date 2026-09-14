"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { CampaignContextPanel } from "@/components/auth/context-panel";
import { Icon } from "@/components/ui/icon";
import { FieldError, FormError, SubmitButton } from "@/components/ui/form-status";
import { COUNTRY_NAMES } from "@/lib/countries";
import { signUp } from "@/server/actions/auth";
import type { ContextCampaign } from "@/lib/view-models";

type Role = "donor" | "creator";

function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div className="eyebrow numeric" style={{ color: "hsl(var(--muted-foreground))" }}>
        Step {step} of 2
      </div>
      <span style={{ width: 56, height: 3, borderRadius: 999, background: "hsl(var(--accent))" }} />
      <span style={{ width: 56, height: 3, borderRadius: 999, background: step === 2 ? "hsl(var(--accent))" : "hsl(var(--border))" }} />
    </div>
  );
}

function RoleFork({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  const options: { key: Role; icon: string; title: string; body: string }[] = [
    {
      key: "donor",
      icon: "circle-dollar-sign",
      title: "I want to fund projects",
      body: "Pledge to a campaign, review each milestone before it releases, and get your share back if a stage fails.",
    },
    {
      key: "creator",
      icon: "sprout",
      title: "I want to raise funds",
      body: "Publish a campaign, split the work into milestones, and draw the money down as each one is approved.",
    },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {options.map((opt) => {
        const active = role === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            aria-pressed={active}
            onClick={() => setRole(opt.key)}
            style={{
              display: "flex",
              gap: 16,
              padding: 20,
              border: active ? "1px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: active ? "hsl(var(--secondary))" : "hsl(var(--surface))",
              textAlign: "left",
              cursor: "pointer",
              fontFamily: "inherit",
              width: "100%",
            }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: active ? "hsl(var(--surface))" : "hsl(var(--canvas))",
                border: "1px solid hsl(var(--border))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              }}
            >
              <Icon name={opt.icon} size={16} style={{ width: 16, height: 16 }} />
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{opt.title}</span>
                {active && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      background: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="check" size={12} strokeWidth={3} style={{ width: 12, height: 12 }} />
                  </span>
                )}
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: "hsl(var(--muted-foreground))" }}>{opt.body}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Rule({ met, label }: { met: boolean; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: met ? undefined : "hsl(var(--muted-foreground))" }}>
      {met ? (
        <span style={{ color: "hsl(var(--primary))", display: "flex" }}>
          <Icon name="check" size={12} strokeWidth={3} style={{ width: 12, height: 12 }} />
        </span>
      ) : (
        <span style={{ width: 12, height: 12, border: "1px solid hsl(var(--input))", borderRadius: 999, flexShrink: 0 }} />
      )}
      <span className="numeric">{label}</span>
    </span>
  );
}

export function SignUpView({
  next,
  campaign,
  initialRole,
}: {
  next: string | null;
  campaign: ContextCampaign | null;
  initialRole: Role;
}) {
  const [state, action] = useActionState(signUp, {});
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>(initialRole);
  const [password, setPassword] = useState("");
  const errors = state.fieldErrors ?? {};
  const signinHref = next ? `/signin?next=${encodeURIComponent(next)}` : "/signin";

  return (
    <AuthShell
      topBarRight={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>Already have an account?</span>
          <Link href={signinHref} className="ms-btn ms-btn--secondary ms-btn--md">
            Sign in
          </Link>
        </div>
      }
      mobileTopBarRight={
        <span className="eyebrow numeric" style={{ color: "hsl(var(--muted-foreground))" }}>
          Step {step} of 2
        </span>
      }
      contextPanel={
        step === 1 ? (
          <>
            <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              The two sides
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
              <h3 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
                Fund what gets built
              </h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "52ch" }}>
                Both sides of OneRaise meet at the same object: a milestone. A donor approves it, a creator delivers it, and escrow moves once.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 36, borderTop: "1px solid hsl(var(--border))" }}>
              {[
                { n: "01", t: "A donor pledges", b: "The amount is held in escrow. Nothing reaches the creator yet." },
                { n: "02", t: "A creator submits a stage", b: "Evidence of the work goes up. The milestone reads In review." },
                { n: "03", t: "Escrow releases", b: "Donors are notified and have 72 hours to dispute. Then the funds move." },
              ].map((row, i, arr) => (
                <div key={row.n} style={{ display: "flex", gap: 20, padding: "24px 0", borderBottom: i === arr.length - 1 ? undefined : "1px solid hsl(var(--border))" }}>
                  <span className="eyebrow numeric" style={{ color: "hsl(var(--muted-foreground))", width: 24, flexShrink: 0, paddingTop: 2 }}>
                    {row.n}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{row.t}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.55, color: "hsl(var(--muted-foreground))" }}>{row.b}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : next ? (
          <CampaignContextPanel
            eyebrow="You were viewing"
            heading="Your pledge is waiting"
            body="Finish setting up and you land straight back on this campaign to place it. Nothing is charged until funding closes."
            campaign={campaign}
          />
        ) : (
          <CampaignContextPanel
            eyebrow="Open now"
            heading={role === "creator" ? "What donors will see" : "Escrow, in stages"}
            body={
              role === "creator"
                ? "Your campaign looks like this: a goal, split into stages, each releasing only when donors have seen the work."
                : "A pledge is held rather than paid. The creator draws one milestone at a time, and only after donors have had 72 hours to review the work."
            }
            campaign={campaign}
          />
        )
      }
    >
      {step === 1 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StepDots step={1} />
            <h2
              className="font-display"
              style={{ fontSize: 40, lineHeight: 1.12, letterSpacing: "-0.018em", fontWeight: 600, margin: 0, textWrap: "balance" }}
            >
              What brings you here?
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "44ch" }}>
              This sets up your account. Donors can start a campaign later; a creator profile is added when you do.
            </p>
          </div>

          <RoleFork role={role} setRole={setRole} />

          <button type="button" className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%" }} onClick={() => setStep(2)}>
            Continue as a {role === "donor" ? "donor" : "creator"}
            <Icon name="arrow-right" size={16} style={{ width: 16, height: 16 }} />
          </button>

          <p style={{ margin: "auto 0 0", fontSize: 12, lineHeight: 1.5, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
            Raising funds needs identity and payout details before a campaign can go live. Donating does not.
          </p>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "hsl(var(--muted-foreground))",
              width: "fit-content",
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Icon name="arrow-left" size={14} style={{ width: 14, height: 14 }} />
            Back
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <StepDots step={2} />
            <h2
              className="font-display"
              style={{ fontSize: 40, lineHeight: 1.12, letterSpacing: "-0.018em", fontWeight: 600, margin: 0, textWrap: "balance" }}
            >
              Create your account
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="ms-badge ms-badge--neutral">
                <Icon name={role === "donor" ? "circle-dollar-sign" : "sprout"} size={12} style={{ width: 12, height: 12 }} />
                {role === "donor" ? "Donor account" : "Creator account"}
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ fontSize: 13, background: "none", border: 0, padding: 0, cursor: "pointer", color: "hsl(var(--primary))", fontFamily: "inherit" }}
              >
                Change
              </button>
            </div>
          </div>

          <form action={action} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input type="hidden" name="role" value={role} />
            {next && <input type="hidden" name="next" value={next} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="su-name" style={{ fontSize: 14, fontWeight: 500 }}>
                Full name
              </label>
              <input
                id="su-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="ms-input"
                style={{ height: "var(--control-h-lg)" }}
                defaultValue={state.values?.name}
                aria-invalid={errors.name ? true : undefined}
              />
              <FieldError message={errors.name} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="su-email" style={{ fontSize: 14, fontWeight: 500 }}>
                Email
              </label>
              <input
                id="su-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="ms-input"
                style={{ height: "var(--control-h-lg)" }}
                defaultValue={state.values?.email}
                aria-invalid={errors.email ? true : undefined}
              />
              <FieldError message={errors.email} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="su-country" style={{ fontSize: 14, fontWeight: 500 }}>
                Country of residence
              </label>
              <div style={{ position: "relative", display: "flex" }}>
                <select
                  id="su-country"
                  name="country"
                  className="ms-input"
                  style={{ height: "var(--control-h-lg)", appearance: "none", paddingRight: 40, cursor: "pointer" }}
                  aria-describedby="su-country-note"
                  defaultValue={state.values?.country ?? COUNTRY_NAMES[0]}
                >
                  {COUNTRY_NAMES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "hsl(var(--muted-foreground))",
                    display: "flex",
                  }}
                >
                  <Icon name="chevron-down" size={16} style={{ width: 16, height: 16 }} />
                </span>
              </div>
              <span id="su-country-note" style={{ fontSize: 12, lineHeight: 1.5, color: "hsl(var(--muted-foreground))" }}>
                Sets the currency you pledge in and the campaigns you are eligible to fund. Raising funds later needs this to match your payout account.
              </span>
              <FieldError message={errors.country} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label htmlFor="su-pass" style={{ fontSize: 14, fontWeight: 500 }}>
                Password
              </label>
              <input
                id="su-pass"
                name="password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                className="ms-input"
                style={{ height: "var(--control-h-lg)" }}
                aria-describedby="su-rules"
                aria-invalid={errors.password ? true : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div id="su-rules" style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
                <Rule met={password.length >= 12} label="12 characters or more" />
                <Rule met={/\d/.test(password)} label="Contains a number" />
                <Rule met={/[^a-zA-Z0-9]/.test(password)} label="Contains a special character" />
              </div>
              <FieldError message={errors.password} />
            </div>

            <label htmlFor="su-terms" style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginTop: 4 }}>
              <input id="su-terms" name="terms" type="checkbox" required style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 13, lineHeight: 1.55, color: "hsl(var(--muted-foreground))" }}>
                I agree to the <Link href="/terms">terms of use</Link> and the <Link href="/escrow-and-refund-policy">escrow and refund policy</Link>,
                including how a failed milestone is refunded.
              </span>
            </label>
            <FieldError message={errors.terms} />
            <FormError message={state.error} />

            <SubmitButton className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%", marginTop: 4 }} pendingLabel="Creating account…">
              Create account
            </SubmitButton>
          </form>
        </>
      )}
    </AuthShell>
  );
}

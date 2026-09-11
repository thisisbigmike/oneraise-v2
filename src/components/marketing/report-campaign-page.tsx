"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Icon } from "@/components/ui/icon";
import { FieldError, FormError, SubmitButton } from "@/components/ui/form-status";
import { reportCampaign } from "@/server/actions/public";

const REASONS = [
  "Not a real project",
  "Financial return promised",
  "Misleading photos or claims",
  "Imagery not the creator's own",
  "Something else",
];

export function ReportCampaignPage({ initialCampaign }: { initialCampaign: string }) {
  const [state, action] = useActionState(reportCampaign, {});
  const errors = state.fieldErrors ?? {};

  return (
    <div style={{ background: "hsl(var(--canvas))" }}>
      <Header />
      <div
        style={{
          padding: "56px clamp(20px, 8vw, 120px) 96px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
            maxWidth: 560,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              className="eyebrow"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Trust & safety
            </div>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(30px, 4vw, 40px)",
                lineHeight: 1.15,
                letterSpacing: "-0.018em",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Report a campaign
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 16,
                lineHeight: 1.65,
                color: "hsl(var(--muted-foreground))",
              }}
            >
              Every report is reviewed against our{" "}
              <Link href="/guidelines" style={{ color: "hsl(var(--primary))" }}>
                community guidelines
              </Link>
              . A campaign with enough reports is queued for a moderator, who
              can pause it, take it down, or dismiss the reports if no breach is
              found.
            </p>
          </div>

          {state.ok ? (
            <div
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-lg)",
                background: "hsl(var(--surface))",
                boxShadow: "var(--shadow-xs)",
                padding: 24,
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: "hsl(var(--secondary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "hsl(var(--primary))",
                  flexShrink: 0,
                }}
              >
                <Icon
                  name="check"
                  size={16}
                  style={{ width: 16, height: 16 }}
                />
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  Report received
                </span>
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  Thanks — this is now in a moderator&apos;s queue. We
                  don&apos;t share who filed a report with the campaign&apos;s
                  creator.
                </span>
              </div>
            </div>
          ) : (
            <form
              action={action}
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-lg)",
                background: "hsl(var(--surface))",
                boxShadow: "var(--shadow-xs)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  htmlFor="report-campaign"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  Campaign name or link
                </label>
                <input
                  id="report-campaign"
                  name="campaign"
                  type="text"
                  required
                  className="ms-input"
                  placeholder="e.g. Rebuilding the indigo dye pits at Kofar Mata"
                  defaultValue={initialCampaign}
                />
                <FieldError message={errors.campaign} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  htmlFor="report-reason"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  Reason
                </label>
                <div style={{ position: "relative", display: "flex" }}>
                  <select
                    id="report-reason"
                    name="reason"
                    className="ms-input"
                    style={{
                      appearance: "none",
                      paddingRight: 40,
                      cursor: "pointer",
                    }}
                    defaultValue={REASONS[0]}
                  >
                    {REASONS.map((r) => (
                      <option key={r}>{r}</option>
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
                    <Icon
                      name="chevron-down"
                      size={16}
                      style={{ width: 16, height: 16 }}
                    />
                  </span>
                </div>
                <FieldError message={errors.reason} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  htmlFor="report-details"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  What did you notice
                </label>
                <textarea
                  id="report-details"
                  name="details"
                  required
                  className="ms-input"
                  style={{
                    minHeight: 120,
                    padding: "10px 12px",
                    lineHeight: 1.6,
                  }}
                  placeholder="The more specific, the faster a moderator can act."
                />
                <FieldError message={errors.details} />
              </div>
              <FormError message={state.error} />
              <SubmitButton
                className="ms-btn ms-btn--destructive ms-btn--lg"
                style={{ width: "100%", marginTop: 4 }}
                pendingLabel="Submitting…"
              >
                Submit report
              </SubmitButton>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Icon } from "@/components/ui/icon";
import { FieldError, FormError, SubmitButton } from "@/components/ui/form-status";
import { useViewer } from "@/components/viewer-context";
import { sendContactMessage } from "@/server/actions/public";

const TOPICS = [
  "A donation",
  "A campaign I'm running",
  "A dispute or milestone review",
  "My account",
  "Something else",
];

export function ContactPage() {
  const viewer = useViewer();
  const [state, action] = useActionState(sendContactMessage, {});
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
              Support
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
              Contact us
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 16,
                lineHeight: 1.65,
                color: "hsl(var(--muted-foreground))",
              }}
            >
              For anything about a live dispute, use the review or case screen
              directly — it reaches a moderator faster. For everything else,
              tell us what&apos;s going on and we&apos;ll get back within one
              working day.
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
                  Message sent
                </span>
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  We&apos;ve got it and will reply by email within one working
                  day.
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
                  htmlFor="contact-name"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="ms-input"
                  placeholder="Your name"
                  defaultValue={viewer?.name}
                />
                <FieldError message={errors.name} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  htmlFor="contact-email"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="ms-input"
                  placeholder="you@example.com"
                  defaultValue={viewer?.email}
                />
                <FieldError message={errors.email} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  htmlFor="contact-topic"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  What&apos;s this about
                </label>
                <div style={{ position: "relative", display: "flex" }}>
                  <select
                    id="contact-topic"
                    name="topic"
                    className="ms-input"
                    style={{
                      appearance: "none",
                      paddingRight: 40,
                      cursor: "pointer",
                    }}
                    defaultValue={TOPICS[0]}
                  >
                    {TOPICS.map((t) => (
                      <option key={t}>{t}</option>
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
                <FieldError message={errors.topic} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  htmlFor="contact-message"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  className="ms-input"
                  style={{
                    minHeight: 120,
                    padding: "10px 12px",
                    lineHeight: 1.6,
                  }}
                  placeholder="What's going on?"
                />
                <FieldError message={errors.message} />
              </div>
              <FormError message={state.error} />
              <SubmitButton
                className="ms-btn ms-btn--primary ms-btn--lg"
                style={{ width: "100%", marginTop: 4 }}
                pendingLabel="Sending…"
              >
                Send message
              </SubmitButton>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

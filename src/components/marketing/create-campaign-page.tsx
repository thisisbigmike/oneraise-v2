"use client";

import { useActionState, useId, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Icon } from "@/components/ui/icon";
import { FormError, SubmitButton } from "@/components/ui/form-status";
import { createCampaign } from "@/server/actions/creator";

const CATEGORIES = [
  "Craft & material",
  "Type & print",
  "Growing",
  "Restoration",
  "Clay & kiln",
  "Other",
];
const CURRENCIES = ["USD", "GBP", "EUR", "NGN"];

type Step = 1 | 2 | 3 | 4;

interface MilestoneDraft {
  label: string;
  amount: string;
  note: string;
}

function StepDots({ step }: { step: Step }) {
  const labels = ["Basics", "Funding", "Milestones", "Review"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        className="eyebrow numeric"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        Step {step} of 4 · {labels[step - 1]}
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            style={{
              width: 40,
              height: 3,
              borderRadius: 999,
              background:
                n <= step ? "hsl(var(--accent))" : "hsl(var(--border))",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={htmlFor} style={{ fontSize: 13, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function CreateCampaignPage() {
  const [step, setStep] = useState<Step>(1);
  const [state, saveAction] = useActionState(createCampaign, {});
  const formId = useId();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");

  const [goal, setGoal] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [duration, setDuration] = useState("30");

  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    { label: "", amount: "", note: "" },
  ]);

  const milestonesTotal = useMemo(
    () => milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0),
    [milestones],
  );
  const goalNum = Number(goal) || 0;

  const updateMilestone = (i: number, patch: Partial<MilestoneDraft>) =>
    setMilestones((ms) =>
      ms.map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
    );
  const addMilestone = () =>
    setMilestones((ms) => [...ms, { label: "", amount: "", note: "" }]);
  const removeMilestone = (i: number) =>
    setMilestones((ms) =>
      ms.length > 1 ? ms.filter((_, idx) => idx !== i) : ms,
    );

  const canContinueStep1 =
    title.trim().length > 0 &&
    location.trim().length > 0 &&
    summary.trim().length > 0;
  const canContinueStep2 = goalNum > 0;
  const canContinueStep3 = milestones.every(
    (m) => m.label.trim() && Number(m.amount) > 0,
  );

  if (state.ok) {
    return (
      <div style={{ background: "hsl(var(--canvas))" }}>
        <Header />
        <div
          style={{
            padding: "80px clamp(20px, 8vw, 120px) 120px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              textAlign: "center",
            }}
          >
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                background: "hsl(var(--secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "hsl(var(--primary))",
              }}
            >
              <Icon name="check" size={22} style={{ width: 22, height: 22 }} />
            </span>
            <h1
              className="font-display"
              style={{
                fontSize: 30,
                lineHeight: 1.25,
                letterSpacing: "-0.014em",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Campaign drafted
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.6,
                color: "hsl(var(--muted-foreground))",
              }}
            >
              {title || "Your campaign"} has {milestones.length} milestone
              {milestones.length === 1 ? "" : "s"} totalling {currency}{" "}
              {milestonesTotal.toLocaleString()}. {state.message}
            </p>
            <Link
              href="/creator"
              className="ms-btn ms-btn--primary ms-btn--lg"
              style={{ marginTop: 8 }}
            >
              Go to creator dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            maxWidth: 640,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              className="eyebrow"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Start a campaign
            </div>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(28px, 3.6vw, 36px)",
                lineHeight: 1.2,
                letterSpacing: "-0.016em",
                fontWeight: 600,
                margin: 0,
              }}
            >
              Break your project into milestones donors can trust
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 15,
                lineHeight: 1.6,
                color: "hsl(var(--muted-foreground))",
              }}
            >
              Every OneRaise campaign is funded in stages. Donors only release
              the next one once you&apos;ve shown the last is done.
            </p>
          </div>

          <StepDots step={step} />

          <form
            id={formId}
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
            onSubmit={(e) => e.preventDefault()}
          >
            {step === 1 && (
              <>
                <Field label="Campaign title" htmlFor="cc-title">
                  <input
                    id="cc-title"
                    type="text"
                    className="ms-input"
                    placeholder="e.g. Rebuilding the indigo dye pits at Kofar Mata"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 16,
                  }}
                >
                  <Field label="Category" htmlFor="cc-category">
                    <div style={{ position: "relative", display: "flex" }}>
                      <select
                        id="cc-category"
                        className="ms-input"
                        style={{
                          appearance: "none",
                          paddingRight: 40,
                          cursor: "pointer",
                        }}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
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
                        <Icon
                          name="chevron-down"
                          size={16}
                          style={{ width: 16, height: 16 }}
                        />
                      </span>
                    </div>
                  </Field>
                  <Field label="Location" htmlFor="cc-location">
                    <input
                      id="cc-location"
                      type="text"
                      className="ms-input"
                      placeholder="City, country"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="One-line summary" htmlFor="cc-summary">
                  <textarea
                    id="cc-summary"
                    className="ms-input"
                    style={{
                      minHeight: 100,
                      padding: "10px 12px",
                      lineHeight: 1.6,
                    }}
                    placeholder="What are you building, and why does it need donors rather than a loan?"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 16,
                  }}
                >
                  <Field label="Funding goal" htmlFor="cc-goal">
                    <input
                      id="cc-goal"
                      type="number"
                      min={0}
                      className="ms-input"
                      placeholder="60000"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    />
                  </Field>
                  <Field label="Currency" htmlFor="cc-currency">
                    <div style={{ position: "relative", display: "flex" }}>
                      <select
                        id="cc-currency"
                        className="ms-input"
                        style={{
                          appearance: "none",
                          paddingRight: 40,
                          cursor: "pointer",
                        }}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        {CURRENCIES.map((c) => (
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
                        <Icon
                          name="chevron-down"
                          size={16}
                          style={{ width: 16, height: 16 }}
                        />
                      </span>
                    </div>
                  </Field>
                </div>
                <Field
                  label="Days to raise the first milestone"
                  htmlFor="cc-duration"
                >
                  <input
                    id="cc-duration"
                    type="number"
                    min={7}
                    max={90}
                    className="ms-input"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </Field>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 14px",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius-md)",
                    background: "hsl(var(--canvas))",
                  }}
                >
                  <Icon
                    name="lock"
                    size={14}
                    style={{
                      width: 14,
                      height: 14,
                      marginTop: 2,
                      color: "hsl(var(--muted-foreground))",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    None of this reaches you at launch — it holds in escrow and
                    releases only as milestones you define next are approved.
                  </span>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {milestones.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius-md)",
                        padding: 14,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          className="eyebrow numeric"
                          style={{ color: "hsl(var(--muted-foreground))" }}
                        >
                          Stage {String(i + 1).padStart(2, "0")}
                        </span>
                        {milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMilestone(i)}
                            className="ms-btn ms-btn--ghost ms-btn--sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                          gap: 12,
                        }}
                      >
                        <input
                          type="text"
                          className="ms-input"
                          placeholder="What this stage delivers, e.g. Pit relining"
                          value={m.label}
                          onChange={(e) =>
                            updateMilestone(i, { label: e.target.value })
                          }
                        />
                        <input
                          type="number"
                          min={0}
                          className="ms-input"
                          placeholder={`${currency} amount`}
                          value={m.amount}
                          onChange={(e) =>
                            updateMilestone(i, { amount: e.target.value })
                          }
                        />
                      </div>
                      <textarea
                        className="ms-input"
                        style={{
                          minHeight: 64,
                          padding: "10px 12px",
                          lineHeight: 1.6,
                          fontSize: 13,
                        }}
                        placeholder="What evidence you'll submit — photos, receipts, a note against these terms"
                        value={m.note}
                        onChange={(e) =>
                          updateMilestone(i, { note: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="ms-btn ms-btn--secondary ms-btn--md"
                  style={{ width: "100%" }}
                >
                  Add another stage
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    background:
                      milestonesTotal === goalNum
                        ? "hsl(var(--secondary))"
                        : "hsl(var(--canvas))",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  <span style={{ fontSize: 13 }}>Milestones total</span>
                  <span
                    className="numeric"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    {currency} {milestonesTotal.toLocaleString()} of {currency}{" "}
                    {goalNum.toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {step === 4 && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  <span
                    className="font-display"
                    style={{
                      fontSize: 21,
                      fontWeight: 600,
                      letterSpacing: "-0.010em",
                    }}
                  >
                    {title || "Untitled campaign"}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    {category} · {location || "No location set"}
                  </span>
                  <p
                    style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6 }}
                  >
                    {summary || "No summary written yet."}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderTop: "1px solid hsl(var(--border))",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    Funding goal
                  </span>
                  <span
                    className="numeric"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    {currency} {goalNum.toLocaleString()} · {duration} days
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    borderTop: "1px solid hsl(var(--border))",
                    paddingTop: 12,
                  }}
                >
                  <span
                    className="eyebrow"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    {milestones.length} milestone
                    {milestones.length === 1 ? "" : "s"}
                  </span>
                  {milestones.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 13 }}>
                        {String(i + 1).padStart(2, "0")} ·{" "}
                        {m.label || "Untitled stage"}
                      </span>
                      <span
                        className="numeric"
                        style={{ fontSize: 13, fontWeight: 600 }}
                      >
                        {currency} {(Number(m.amount) || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                {milestonesTotal !== goalNum && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "12px 14px",
                      border: "1px solid hsl(var(--warning))",
                      borderRadius: "var(--radius-md)",
                      background: "hsl(var(--canvas))",
                    }}
                  >
                    <Icon
                      name="alert-triangle"
                      size={14}
                      style={{
                        width: 14,
                        height: 14,
                        marginTop: 2,
                        color: "hsl(var(--warning))",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      Milestones add up to {currency}{" "}
                      {milestonesTotal.toLocaleString()}, not your {currency}{" "}
                      {goalNum.toLocaleString()} goal. You can still publish and
                      adjust this later.
                    </span>
                  </div>
                )}
              </div>
            )}
          </form>

          <FormError message={state.error} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {step > 1 ? (
              <button
                type="button"
                className="ms-btn ms-btn--ghost ms-btn--lg"
                onClick={() => setStep((s) => (s - 1) as Step)}
              >
                Back
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button
                type="button"
                className="ms-btn ms-btn--primary ms-btn--lg"
                disabled={
                  (step === 1 && !canContinueStep1) ||
                  (step === 2 && !canContinueStep2) ||
                  (step === 3 && !canContinueStep3)
                }
                onClick={() => setStep((s) => (s + 1) as Step)}
              >
                Continue
              </button>
            ) : (
              <form action={saveAction}>
                <input type="hidden" name="title" value={title} />
                <input type="hidden" name="category" value={category} />
                <input type="hidden" name="location" value={location} />
                <input type="hidden" name="summary" value={summary} />
                <input type="hidden" name="goal" value={goal} />
                <input type="hidden" name="currency" value={currency} />
                <input type="hidden" name="duration" value={duration} />
                <input type="hidden" name="milestones" value={JSON.stringify(milestones)} />
                <SubmitButton className="ms-btn ms-btn--primary ms-btn--lg" pendingLabel="Saving…">
                  Save as draft
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

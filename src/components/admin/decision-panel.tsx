"use client";

import { useActionState, useId, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { FieldError, FormError, SubmitButton } from "@/components/ui/form-status";
import type { ActionState, DecisionOption } from "@/lib/view-models";

export type { DecisionOption };

/**
 * The moderator decision card: pick one outcome, record a reason, submit to a
 * Server Action. The action does the work and writes the audit entry; this
 * panel only shows the confirmation it returns.
 */
export function DecisionPanel({
  title,
  options,
  defaultSelected = 0,
  reasonLabel,
  reasonPlaceholder,
  submitLabel,
  destructiveValues = [],
  footNote,
  confirmFootNote,
  action,
  hidden,
  extraFields,
  reasonName = "reason",
  onRecorded,
}: {
  title: string;
  options: DecisionOption[];
  defaultSelected?: number;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  /** Defaults to the selected option's label. */
  submitLabel?: string;
  /** Options whose submit button should read as destructive. */
  destructiveValues?: string[];
  footNote: string;
  confirmFootNote: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  hidden: Record<string, string | number>;
  extraFields?: ReactNode;
  reasonName?: string;
  /**
   * Called when the decision is recorded. A decision often resolves the item
   * this panel belongs to, so the panel may unmount straight away — a parent
   * that stays on screen should show the confirmation.
   */
  onRecorded?: (message: string) => void;
}) {
  const [selected, setSelected] = useState(defaultSelected);
  const [state, formAction] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.ok) onRecorded?.(result.message ?? "Decision recorded.");
    return result;
  }, {});
  const reasonId = useId();
  const option = options[selected];

  return (
    <div
      style={{
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
        boxShadow: "var(--shadow-xs)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid hsl(var(--border))",
        }}
      >
        <h3
          className="font-display"
          style={{
            fontSize: 19,
            lineHeight: 1.3,
            fontWeight: 600,
            letterSpacing: "-0.010em",
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>

      {state.ok ? (
        <div
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: "hsl(var(--secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "hsl(var(--primary))",
                flexShrink: 0,
              }}
            >
              <Icon name="check" size={14} style={{ width: 14, height: 14 }} />
            </span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Decision recorded
            </span>
          </div>
          <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {option.label}
          </span>
          {state.message && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.6,
                color: "hsl(var(--muted-foreground))",
              }}
            >
              {state.message}
            </p>
          )}
          <span
            style={{
              fontSize: 12,
              lineHeight: 1.45,
              color: "hsl(var(--muted-foreground))",
            }}
          >
            {confirmFootNote}
          </span>
        </div>
      ) : (
        <form
          action={formAction}
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {Object.entries(hidden).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <input type="hidden" name="option" value={option.value} />
          {options.map((opt, i) => {
            const active = i === selected;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(i)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  padding: 14,
                  border: active
                    ? "1px solid hsl(var(--primary))"
                    : "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-md)",
                  background: active
                    ? "hsl(var(--secondary))"
                    : "hsl(var(--surface))",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {opt.label}
                </span>
                <span
                  className="numeric"
                  style={{
                    fontSize: 12,
                    lineHeight: 1.45,
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  {opt.description}
                </span>
              </button>
            );
          })}
          {extraFields}
          {reasonLabel && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginTop: 6,
              }}
            >
              <label htmlFor={reasonId} style={{ fontSize: 13, fontWeight: 500 }}>
                {reasonLabel}
              </label>
              <textarea
                id={reasonId}
                name={reasonName}
                required
                className="ms-input"
                style={{
                  minHeight: 84,
                  padding: "10px 12px",
                  lineHeight: 1.6,
                  fontSize: 13,
                }}
                placeholder={reasonPlaceholder}
                aria-invalid={state.fieldErrors?.[reasonName] ? true : undefined}
              />
              <FieldError message={state.fieldErrors?.[reasonName]} />
            </div>
          )}
          <FormError message={state.error} />
          <SubmitButton
            className={`ms-btn ms-btn--${destructiveValues.includes(option.value) ? "destructive" : "primary"} ms-btn--lg`}
            style={{ width: "100%", marginTop: 4 }}
            pendingLabel="Recording…"
          >
            {submitLabel ?? option.label}
          </SubmitButton>
          <span
            style={{
              fontSize: 12,
              lineHeight: 1.45,
              color: "hsl(var(--muted-foreground))",
            }}
          >
            {footNote}
          </span>
        </form>
      )}
    </div>
  );
}

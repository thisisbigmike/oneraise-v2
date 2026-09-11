"use client";

import type { CSSProperties, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "./icon";
import type { ActionState } from "@/lib/view-models";

/** The red-bordered notice the auth screens already use for a failed submit. */
export function FormError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null;
  return (
    <div
      id={id}
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "12px 14px",
        border: "1px solid hsl(var(--destructive))",
        borderRadius: "var(--radius-md)",
        background: "hsl(var(--surface))",
      }}
    >
      <span style={{ color: "hsl(var(--destructive))", display: "flex", flexShrink: 0, marginTop: 1 }}>
        <Icon name="alert-triangle" size={14} style={{ width: 14, height: 14 }} />
      </span>
      <span style={{ fontSize: 13, lineHeight: 1.5, color: "hsl(var(--destructive))" }}>{message}</span>
    </div>
  );
}

export function FormSuccess({ message, children }: { message?: string; children?: ReactNode }) {
  if (!message && !children) return null;
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-md)",
        background: "hsl(var(--secondary))",
      }}
    >
      <span style={{ color: "hsl(var(--primary))", display: "flex", flexShrink: 0, marginTop: 2 }}>
        <Icon name="check" size={14} strokeWidth={3} style={{ width: 14, height: 14 }} />
      </span>
      <span style={{ fontSize: 13, lineHeight: 1.55, display: "flex", flexDirection: "column", gap: 4 }}>
        {message}
        {children}
      </span>
    </div>
  );
}

/** The inline message under a single field. */
export function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null;
  return (
    <span id={id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "hsl(var(--destructive))" }}>
      <Icon name="alert-triangle" size={12} style={{ width: 12, height: 12, flexShrink: 0 }} />
      {message}
    </span>
  );
}

/** Success or failure of the last submit, whichever applies. */
export function ActionMessage({ state }: { state: ActionState }) {
  if (state.error) return <FormError message={state.error} />;
  if (state.ok && state.message) return <FormSuccess message={state.message} />;
  return null;
}

/** A submit button that disables itself and swaps its label while the action runs. */
export function SubmitButton({
  children,
  pendingLabel,
  className = "ms-btn ms-btn--primary ms-btn--md",
  style,
  disabled,
  name,
  value,
  form,
}: {
  children: ReactNode;
  pendingLabel?: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  name?: string;
  value?: string;
  form?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      style={style}
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      name={name}
      value={value}
      form={form}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}

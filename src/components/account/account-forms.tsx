"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ActionMessage, FieldError, SubmitButton } from "@/components/ui/form-status";
import { changePassword, signOutOtherSessions } from "@/server/actions/auth";
import { updateNotifications } from "@/server/actions/donor";
import type { NotificationPref } from "@/lib/view-models";

/**
 * The account-settings pieces donors and creators share: notification
 * preferences, password and sessions. Each one saves through its own action.
 */

export function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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
      <div style={{ padding: 20, borderBottom: "1px solid hsl(var(--border))", display: "flex", flexDirection: "column", gap: 4 }}>
        <h3 className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em", margin: 0 }}>
          {title}
        </h3>
        {subtitle && <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function NotificationRow({ pref }: { pref: NotificationPref }) {
  const [checked, setChecked] = useState(pref.checked);
  return (
    <label
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid hsl(var(--border))",
        cursor: pref.locked ? "default" : "pointer",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: "var(--radius-sm)",
          background: checked ? "hsl(var(--primary))" : undefined,
          border: checked ? undefined : "1px solid hsl(var(--input))",
          color: "hsl(var(--primary-foreground))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
          opacity: pref.locked ? 0.5 : 1,
        }}
      >
        {checked && <Icon name="check" size={12} strokeWidth={3} style={{ width: 12, height: 12 }} />}
      </span>
      <input
        type="checkbox"
        name={pref.locked ? undefined : pref.key}
        checked={checked}
        disabled={pref.locked}
        onChange={(e) => setChecked(e.target.checked)}
        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
      />
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{pref.label}</span>
        {pref.meta && <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{pref.meta}</span>}
      </span>
    </label>
  );
}

export function NotificationsForm({ prefs, subtitle }: { prefs: NotificationPref[]; subtitle: string }) {
  const [state, action] = useActionState(updateNotifications, {});
  return (
    <Card title="Notifications" subtitle={subtitle}>
      <form action={action}>
        <div style={{ padding: "8px 20px 16px", display: "flex", flexDirection: "column" }}>
          {prefs.map((p) => (
            <NotificationRow key={p.key} pref={p} />
          ))}
        </div>
        <div
          style={{
            borderTop: "1px solid hsl(var(--border))",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: "hsl(var(--canvas))",
          }}
        >
          <ActionMessage state={state} />
          <SubmitButton className="ms-btn ms-btn--primary ms-btn--md" style={{ width: "fit-content" }} pendingLabel="Saving…">
            Save notifications
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "18px 20px",
        borderBottom: last ? undefined : "1px solid hsl(var(--border))",
        flexWrap: "wrap",
      }}
    >
      {children}
    </div>
  );
}

function RowText({ label, meta, badge }: { label: string; meta: string; badge?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 200 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
        {badge && <span className="ms-badge ms-badge--neutral">{badge}</span>}
      </span>
      <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
        {meta}
      </span>
    </div>
  );
}

function PasswordRow({ changedLabel }: { changedLabel: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(changePassword, {});
  return (
    <Row>
      <RowText label="Password" meta={changedLabel} />
      {!open && !state.ok && (
        <button type="button" className="ms-btn ms-btn--secondary ms-btn--md" onClick={() => setOpen(true)}>
          Change password
        </button>
      )}
      {state.ok && !open && <ActionMessage state={state} />}
      {open && (
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="pw-current" style={{ fontSize: 13, fontWeight: 500 }}>
                Current password
              </label>
              <input id="pw-current" name="current" type="password" required autoComplete="current-password" className="ms-input" />
              <FieldError message={state.fieldErrors?.current} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="pw-new" style={{ fontSize: 13, fontWeight: 500 }}>
                New password
              </label>
              <input id="pw-new" name="new" type="password" required minLength={12} autoComplete="new-password" className="ms-input" />
              <FieldError message={state.fieldErrors?.new} />
            </div>
          </div>
          {state.ok ? <ActionMessage state={state} /> : state.error && <ActionMessage state={state} />}
          <div style={{ display: "flex", gap: 10 }}>
            <SubmitButton className="ms-btn ms-btn--primary ms-btn--md" pendingLabel="Saving…">
              Save password
            </SubmitButton>
            <button type="button" className="ms-btn ms-btn--ghost ms-btn--md" onClick={() => setOpen(false)}>
              {state.ok ? "Done" : "Cancel"}
            </button>
          </div>
        </form>
      )}
    </Row>
  );
}

function SessionsRow({ count, meta }: { count: number; meta: string }) {
  const [state, action] = useActionState(() => signOutOtherSessions(), {});
  return (
    <Row last>
      <RowText label="Active sessions" meta={state.ok && state.message ? state.message : meta} />
      <form action={action}>
        <SubmitButton className="ms-btn ms-btn--secondary ms-btn--md" disabled={count <= 1} pendingLabel="Signing out…">
          Sign out other sessions
        </SubmitButton>
      </form>
    </Row>
  );
}

export function SecurityCard({
  passwordChanged,
  twoFactor,
  twoFactorMeta,
  sessionsCount,
  sessionsMeta,
}: {
  passwordChanged: string;
  twoFactor: boolean;
  twoFactorMeta: string;
  sessionsCount: number;
  sessionsMeta: string;
}) {
  return (
    <Card title="Security">
      <PasswordRow changedLabel={passwordChanged} />
      <Row>
        <RowText label="Two-factor authentication" badge={twoFactor ? "On" : "Off"} meta={twoFactorMeta} />
      </Row>
      <SessionsRow count={sessionsCount} meta={sessionsMeta} />
    </Card>
  );
}

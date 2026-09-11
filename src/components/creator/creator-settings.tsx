"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { ActionMessage, FieldError, SubmitButton } from "@/components/ui/form-status";
import { Card, NotificationsForm, SecurityCard } from "@/components/account/account-forms";
import { CreatorShell } from "@/components/creator/creator-shell";
import { submitIdentityDocuments, updateStudio } from "@/server/actions/creator";
import { signOut } from "@/server/actions/auth";
import type { CreatorSettingsData, CreatorShellData } from "@/lib/view-models";

function StudioCard({ data }: { data: CreatorSettingsData }) {
  const [state, action] = useActionState(updateStudio, {});
  return (
    <Card title="Studio profile">
      <form action={action}>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar initials={data.initials} size={56} fontSize={17} />
            <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              Your studio name and mark are shown on your campaign page and every donor notice.
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="cs-studio" style={{ fontSize: 14, fontWeight: 500 }}>
                Studio name
              </label>
              <input id="cs-studio" name="name" type="text" className="ms-input" defaultValue={data.studioName} required />
              <FieldError message={state.fieldErrors?.name} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="cs-loc" style={{ fontSize: 14, fontWeight: 500 }}>
                Location
              </label>
              <input id="cs-loc" name="location" type="text" className="ms-input" defaultValue={data.location} required />
              <FieldError message={state.fieldErrors?.location} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="cs-bio" style={{ fontSize: 14, fontWeight: 500 }}>
              About the studio
            </label>
            <textarea
              id="cs-bio"
              name="bio"
              maxLength={600}
              className="ms-input"
              style={{ minHeight: 88, padding: "10px 12px", lineHeight: 1.6 }}
              defaultValue={data.bio}
            />
            <FieldError message={state.fieldErrors?.bio} />
          </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SubmitButton className="ms-btn ms-btn--primary ms-btn--md" pendingLabel="Saving…">
              Save changes
            </SubmitButton>
            <button type="reset" className="ms-btn ms-btn--ghost ms-btn--md">
              Discard
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}

function IdentityCard({ data }: { data: CreatorSettingsData }) {
  const [state, submit] = useActionState(() => submitIdentityDocuments(), {});
  const canSubmit = data.kycStatus !== "verified" && data.kycStatus !== "pending";
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
      <div style={{ padding: 20, borderBottom: "1px solid hsl(var(--border))", display: "flex", alignItems: "center", gap: 16 }}>
        <h3 className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em", margin: 0, flex: 1 }}>
          Identity
        </h3>
        <span className={`ms-badge ms-badge--${data.kycStatus === "verified" ? "outline" : data.kycStatus === "rejected" ? "destructive" : "warning"}`}>
          <Icon name="shield-check" size={12} style={{ width: 12, height: 12 }} />
          {data.kycLabel}
        </span>
      </div>
      <form action={submit} style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 20px", borderBottom: "1px solid hsl(var(--border))", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Documents on file</span>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {data.documentsMeta}
          </span>
        </div>
        {canSubmit && (
          <SubmitButton className="ms-btn ms-btn--secondary ms-btn--md" pendingLabel="Submitting…">
            {data.kycStatus === "none" ? "Submit documents" : "Resubmit documents"}
          </SubmitButton>
        )}
        {(state.ok || state.error) && (
          <div style={{ width: "100%" }}>
            <ActionMessage state={state} />
          </div>
        )}
      </form>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
        <Icon name="lock" size={14} style={{ width: 14, height: 14 }} />
        <span style={{ fontSize: 12, lineHeight: 1.4 }}>
          Verification is re-checked yearly and whenever your payout account changes. Releases pause while it lapses.
        </span>
      </div>
    </div>
  );
}

function PayoutCard({ data }: { data: CreatorSettingsData }) {
  return (
    <Card title="Payout account">
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
        <span style={{ width: 44, height: 30, border: "1px solid hsl(var(--border))", borderRadius: 6, background: "hsl(var(--canvas))", flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
          <span className="numeric" style={{ fontSize: 14, fontWeight: 500 }}>
            {data.payoutAccount}
          </span>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {data.payoutCurrency} · {data.studioName}
          </span>
        </div>
        {data.kycStatus === "verified" && <span className="ms-badge ms-badge--neutral">Verified</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Next payout</span>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {data.nextPayoutNote}
          </span>
        </div>
        <Link href="/creator/payouts" style={{ fontSize: 13 }}>
          Payout history
        </Link>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
        <Icon name="alert-triangle" size={14} style={{ width: 14, height: 14 }} />
        <span style={{ fontSize: 12, lineHeight: 1.4 }}>
          To change the payout account, contact support — a change pauses releases for 72 hours and re-runs identity checks.
        </span>
      </div>
    </Card>
  );
}

function SettingsBody({ data }: { data: CreatorSettingsData }) {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Creator
        </div>
        <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
          Account settings
        </h2>
      </div>
      <StudioCard data={data} />
      <IdentityCard data={data} />
      <PayoutCard data={data} />
      <SecurityCard
        passwordChanged={data.passwordChanged}
        twoFactor={data.twoFactor}
        twoFactorMeta={data.campaignLive ? "Cannot be turned off while a campaign is live." : "Required before a campaign can draw down."}
        sessionsCount={data.sessionsCount}
        sessionsMeta={data.sessionsMeta}
      />
      <NotificationsForm prefs={data.notifications} subtitle="Dispute notices always reach you — you have five days to respond." />
    </>
  );
}

export function CreatorSettings({ shell, data }: { shell: CreatorShellData; data: CreatorSettingsData }) {
  return (
    <CreatorShell
      active="settings"
      shell={shell}
      desktop={
        <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 28, maxWidth: 820 }}>
          <SettingsBody data={data} />
        </div>
      }
      mobile={
        <>
          <div
            style={{
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              borderBottom: "1px solid hsl(var(--border))",
              background: "hsl(var(--surface))",
            }}
          >
            <Link href="/creator" className="ms-btn ms-btn--ghost ms-btn--icon" aria-label="Back" style={{ marginLeft: -8 }}>
              <Icon name="arrow-left" size={16} style={{ width: 16, height: 16 }} />
            </Link>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Account settings</span>
            <span style={{ width: 40 }} />
          </div>
          <div style={{ padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            <SettingsBody data={data} />
            <form action={signOut}>
              <button type="submit" className="ms-btn ms-btn--ghost ms-btn--lg" style={{ width: "100%", color: "hsl(var(--destructive))" }}>
                <Icon name="log-out" size={16} style={{ width: 16, height: 16 }} />
                Sign out
              </button>
            </form>
          </div>
        </>
      }
    />
  );
}

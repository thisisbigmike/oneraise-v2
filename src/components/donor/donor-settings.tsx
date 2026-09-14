"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { ActionMessage, FieldError, FormError, SubmitButton } from "@/components/ui/form-status";
import { Card, NotificationsForm, SecurityCard } from "@/components/account/account-forms";
import { DonorShell, type ShellAccount } from "@/components/donor/donor-shell";
import { COUNTRIES } from "@/lib/countries";
import { closeAccount, updateDonorProfile } from "@/server/actions/donor";
import { signOut } from "@/server/actions/auth";
import type { DonorSettingsData } from "@/lib/view-models";

function ProfileCard({ data }: { data: DonorSettingsData }) {
  const [state, action] = useActionState(updateDonorProfile, {});
  const [country, setCountry] = useState(data.country);
  const currency = COUNTRIES.find((c) => c.name === country)?.currency ?? data.currencyLabel;
  return (
    <Card title="Profile">
      <form action={action}>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar initials={data.initials} size={56} fontSize={17} />
            <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              Creators see your display name and initials, never your email.
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="st-name" style={{ fontSize: 14, fontWeight: 500 }}>
                Display name
              </label>
              <input id="st-name" name="name" type="text" className="ms-input" defaultValue={data.name} required />
              <FieldError message={state.fieldErrors?.name} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Email</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: "var(--control-h-md)" }}>
                <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis" }}>{data.email}</span>
                {data.emailVerified ? (
                  <span className="ms-badge ms-badge--outline" style={{ flexShrink: 0 }}>
                    <Icon name="shield-check" size={12} style={{ width: 12, height: 12 }} />
                    Verified
                  </span>
                ) : (
                  <Link href="/verify-email" className="ms-badge ms-badge--warning" style={{ flexShrink: 0 }}>
                    Verify
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="st-country" style={{ fontSize: 14, fontWeight: 500 }}>
                Country of residence
              </label>
              <div style={{ position: "relative", display: "flex" }}>
                <select
                  id="st-country"
                  name="country"
                  className="ms-input"
                  style={{ appearance: "none", paddingRight: 40, cursor: "pointer" }}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.name}>{c.name}</option>
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
              <FieldError message={state.fieldErrors?.country} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Donation currency</span>
              <div
                style={{
                  height: "var(--control-h-md)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-md)",
                  background: "hsl(var(--canvas))",
                }}
              >
                <span className="numeric" style={{ fontSize: 15 }}>
                  {currency}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Set by country</span>
              </div>
            </div>
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
            <button type="reset" className="ms-btn ms-btn--ghost ms-btn--md" onClick={() => setCountry(data.country)}>
              Discard
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}

function PaymentCard({ card }: { card: DonorSettingsData["card"] }) {
  return (
    <Card title="Payment method">
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
        <span
          style={{
            width: 44,
            height: 30,
            border: "1px solid hsl(var(--border))",
            borderRadius: 6,
            background: "hsl(var(--canvas))",
            flexShrink: 0,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
          <span className="numeric" style={{ fontSize: 14, fontWeight: 500 }}>
            {card ? card.label : "No card saved"}
          </span>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {card ? card.meta : "You're asked for a card when a campaign you back closes its funding."}
          </span>
        </div>
        {card && <span className="ms-badge ms-badge--neutral">Default</span>}
      </div>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
        <Icon name="lock" size={14} style={{ width: 14, height: 14 }} />
        <span style={{ fontSize: 12, lineHeight: 1.4 }}>A card cannot be removed while it holds escrow.</span>
      </div>
    </Card>
  );
}

function CloseCard({ data }: { data: DonorSettingsData }) {
  const [state, action] = useActionState(() => closeAccount(), {});
  const [confirming, setConfirming] = useState(false);
  return (
    <div
      style={{
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
        boxShadow: "var(--shadow-xs)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Close your account</span>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {data.canClose
              ? "Nothing you donated is still held. Closing removes your name and email and signs you out."
              : `Blocked while ${data.escrowHeld} sits in escrow. Available once every milestone you fund has settled.`}
          </span>
        </div>
        {!confirming ? (
          <button type="button" className="ms-btn ms-btn--destructive ms-btn--md" disabled={!data.canClose} onClick={() => setConfirming(true)}>
            Close account
          </button>
        ) : (
          <form action={action} style={{ display: "flex", gap: 10 }}>
            <SubmitButton className="ms-btn ms-btn--destructive ms-btn--md" pendingLabel="Closing…">
              Yes, close it
            </SubmitButton>
            <button type="button" className="ms-btn ms-btn--ghost ms-btn--md" onClick={() => setConfirming(false)}>
              Keep it
            </button>
          </form>
        )}
      </div>
      <FormError message={state.error} />
    </div>
  );
}

function SettingsBody({ data }: { data: DonorSettingsData }) {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Donor
        </div>
        <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
          Account settings
        </h2>
      </div>
      <ProfileCard data={data} />
      <SecurityCard
        passwordChanged={data.passwordChanged}
        twoFactor={data.twoFactor}
        twoFactorMeta={data.twoFactor ? "Authenticator app. Required while you hold escrow." : "Not set up on this account."}
        sessionsCount={data.sessionsCount}
        sessionsMeta={data.sessionsMeta}
      />
      <NotificationsForm prefs={data.notifications} subtitle="Milestone and dispute notices cannot be turned off while you hold escrow." />
      <PaymentCard card={data.card} />
      <CloseCard data={data} />
    </>
  );
}

export function DonorSettings({
  account,
  data,
  reviewCount,
}: {
  account: ShellAccount;
  data: DonorSettingsData;
  reviewCount: number;
}) {
  return (
    <DonorShell
      active="settings"
      account={account}
      reviewCount={reviewCount}
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
            <Link href="/donor" className="ms-btn ms-btn--ghost ms-btn--icon" aria-label="Back" style={{ marginLeft: -8 }}>
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

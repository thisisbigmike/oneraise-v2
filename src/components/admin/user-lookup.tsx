"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionMessage, SubmitButton } from "@/components/ui/form-status";
import { resetTwoFactor, sendResetFor, setSuspended } from "@/server/actions/admin";
import type { UserProfileData, UserSearchResult } from "@/lib/view-models";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
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
      <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
        <h3 className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em", margin: 0 }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Actions({ profile, isSelf }: { profile: UserProfileData; isSelf: boolean }) {
  const [resetState, reset] = useActionState(sendResetFor, {});
  const [twoFactorState, clearTwoFactor] = useActionState(resetTwoFactor, {});
  const [suspendState, suspend] = useActionState(setSuspended, {});
  const last = [resetState, twoFactorState, suspendState].find((s) => s.ok || s.error);

  return (
    <Panel title="Actions">
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {isSelf && (
          <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>This is your own account — change it from your own settings.</span>
        )}
        <form action={reset}>
          <input type="hidden" name="user" value={profile.id} />
          <SubmitButton className="ms-btn ms-btn--secondary ms-btn--md" style={{ width: "100%" }} disabled={isSelf} pendingLabel="Sending…">
            Send password reset
          </SubmitButton>
        </form>
        <form action={clearTwoFactor}>
          <input type="hidden" name="user" value={profile.id} />
          <SubmitButton className="ms-btn ms-btn--secondary ms-btn--md" style={{ width: "100%" }} disabled={isSelf} pendingLabel="Resetting…">
            Reset two-factor
          </SubmitButton>
        </form>
        <a href={`/admin/users/${profile.id}/export`} className="ms-btn ms-btn--secondary ms-btn--md" style={{ width: "100%" }}>
          Export their data
        </a>
        <span style={{ height: 1, background: "hsl(var(--border))", margin: "4px 0" }} />
        <form action={suspend}>
          <input type="hidden" name="user" value={profile.id} />
          <input type="hidden" name="suspend" value={profile.suspended ? "0" : "1"} />
          <SubmitButton
            className={`ms-btn ms-btn--${profile.suspended ? "secondary" : "destructive"} ms-btn--md`}
            style={{ width: "100%" }}
            disabled={isSelf}
            pendingLabel="Saving…"
          >
            {profile.suspended ? "Reinstate account" : "Suspend account"}
          </SubmitButton>
        </form>
        {last && <ActionMessage state={last} />}
        {resetState.link && (
          <Link href={resetState.link} style={{ fontSize: 12 }}>
            No mail is sent in development — the reset link →
          </Link>
        )}
        <span style={{ fontSize: 12, lineHeight: 1.45, color: "hsl(var(--muted-foreground))" }}>
          Suspending blocks sign-in and ends every session. It does not release or refund the{" "}
          <span className="numeric">{profile.escrowHeld}</span> they hold in escrow.
        </span>
      </div>
    </Panel>
  );
}

export function UserLookup({
  query,
  results,
  profile,
  viewerId,
}: {
  query: string;
  results: UserSearchResult[];
  profile: UserProfileData | null;
  viewerId: number;
}) {
  return (
    <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
      <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Platform
          </div>
          <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
            Users
          </h2>
        </div>

        <form action="/admin/users" style={{ position: "relative", display: "flex", maxWidth: 520 }}>
          <input
            type="search"
            name="q"
            className="ms-input"
            style={{ height: "var(--control-h-lg)", paddingLeft: 40 }}
            aria-label="Search users"
            placeholder="Email, name or user id"
            defaultValue={query}
          />
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "hsl(var(--muted-foreground))",
              display: "flex",
            }}
          >
            <Icon name="search" size={16} style={{ width: 16, height: 16 }} />
          </span>
        </form>

        {results.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/admin/users?${new URLSearchParams({ q: query, user: String(r.id) })}`}
                className={`ms-badge ${profile?.id === r.id ? "ms-badge--primary" : "ms-badge--outline"}`}
              >
                {r.name} · {r.email} · {r.role}
              </Link>
            ))}
          </div>
        )}

        {!profile ? (
          <p style={{ margin: 0, fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
            {query ? `No account matches “${query}”.` : "Search for an account by email, name or user id."}
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
              <div
                style={{
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-lg)",
                  background: "hsl(var(--surface))",
                  boxShadow: "var(--shadow-xs)",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid hsl(var(--border))" }}>
                  <Avatar initials={profile.initials} size={52} fontSize={16} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                    <span className="font-display" style={{ fontSize: 21, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em" }}>
                      {profile.name}
                    </span>
                    <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                      {profile.email} · user {profile.id} · joined {profile.joined}
                    </span>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <Badge variant="neutral">{profile.role}</Badge>
                    {profile.verified && (
                      <Badge variant="outline">
                        <Icon name="shield-check" size={12} style={{ width: 12, height: 12 }} />
                        Verified
                      </Badge>
                    )}
                    {profile.suspended && <Badge variant="destructive">Suspended</Badge>}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                  {profile.figures.map((f, i) => (
                    <div
                      key={f.label}
                      style={{
                        padding: "18px 20px",
                        borderRight: i === profile.figures.length - 1 ? undefined : "1px solid hsl(var(--border))",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {f.label}
                      </span>
                      <span className="numeric" style={{ fontSize: 21, fontWeight: 600 }}>
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Panel title="Donations">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 110px 110px 120px 130px",
                    gap: 14,
                    padding: "12px 20px",
                    borderBottom: "1px solid hsl(var(--border))",
                    background: "hsl(var(--canvas))",
                  }}
                >
                  {["Campaign", "Donated", "In escrow", "Date", "State"].map((h) => (
                    <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                      {h}
                    </span>
                  ))}
                </div>
                {profile.pledges.length === 0 && (
                  <div style={{ padding: "16px 20px", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>No donations on this account.</div>
                )}
                {profile.pledges.map((p, i) => (
                  <div
                    key={p.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 110px 110px 120px 130px",
                      gap: 14,
                      padding: "13px 20px",
                      borderBottom: i === profile.pledges.length - 1 ? undefined : "1px solid hsl(var(--border))",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.campaign}</span>
                    <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                      {p.pledged}
                    </span>
                    <span className="numeric" style={{ fontSize: 13 }}>
                      {p.inEscrow}
                    </span>
                    <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                      {p.date}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </Panel>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Panel title="Account">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {profile.account.map((row, i) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "13px 20px",
                        borderBottom: i === profile.account.length - 1 ? undefined : "1px solid hsl(var(--border))",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{row.label}</span>
                      <span className="numeric" style={{ fontSize: 13, fontWeight: 500 }}>
                        {row.label === "Two-factor" ? <Badge variant="neutral">{row.value}</Badge> : row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
              <Actions key={profile.id} profile={profile} isSelf={profile.id === viewerId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

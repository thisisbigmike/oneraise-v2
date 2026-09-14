import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { CampaignContextPanel } from "@/components/auth/context-panel";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import type { ContextCampaign } from "@/lib/view-models";

const DONOR_STEPS = [
  { n: "01", t: "Donations sit in escrow", b: "Pick an amount. It is held, not paid, until a milestone is approved." },
  { n: "02", t: "You review each release", b: "An email arrives when a stage is submitted. You have 72 hours to dispute it." },
  { n: "03", t: "Failed stages refund", b: "If a campaign stalls, your share of the remaining escrow returns to your card." },
];

const CREATOR_STEPS = [
  { n: "01", t: "Split the work into stages", b: "Each stage has an amount and the evidence you'll show when it's done." },
  { n: "02", t: "Verify your identity", b: "A moderator checks your documents. Your campaign publishes once they do." },
  { n: "03", t: "Draw down one stage at a time", b: "Submit evidence, donors get 72 hours, then that stage's money moves to you." },
];

export function WelcomeView({
  firstName,
  initials,
  role,
  next,
  campaign,
  emailVerified,
  home,
}: {
  firstName: string;
  initials: string;
  role: "donor" | "creator" | "admin";
  next: string | null;
  campaign: ContextCampaign | null;
  emailVerified: boolean;
  home: string;
}) {
  const creator = role === "creator";
  const steps = creator ? CREATOR_STEPS : DONOR_STEPS;
  const primary = next
    ? { href: next, label: campaign ? "Continue to the campaign" : "Continue where you left off" }
    : creator
      ? { href: "/create-campaign", label: "Start your first campaign" }
      : { href: "/discover", label: "Browse campaigns" };

  return (
    <AuthShell
      topBarRight={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {emailVerified ? (
            <span className="ms-badge ms-badge--outline">
              <Icon name="shield-check" size={12} style={{ width: 12, height: 12 }} />
              Verified
            </span>
          ) : (
            <Link href="/verify-email" className="ms-badge ms-badge--warning">
              Verify your email
            </Link>
          )}
          <Avatar initials={initials} size={36} fontSize={13} />
        </div>
      }
      mobileTopBarRight={<Avatar initials={initials} size={32} fontSize={12} />}
      contextPanel={
        <CampaignContextPanel
          eyebrow={next ? "Waiting for you" : "Open now"}
          heading={next ? "Pick up where you left off" : "A campaign to start with"}
          body={
            next
              ? "Your donation hasn't been placed yet. Choose an amount on the campaign page and confirm it — nothing is charged until funding closes."
              : "Every stage on this campaign releases only after its donors have seen the work."
          }
          campaign={campaign}
        />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span className="ms-badge ms-badge--funded" style={{ width: "fit-content" }}>
          <Icon name="check" size={12} strokeWidth={3} style={{ width: 12, height: 12 }} />
          Account created
        </span>
        <h2
          className="font-display"
          style={{ fontSize: 40, lineHeight: 1.12, letterSpacing: "-0.018em", fontWeight: 600, margin: 0, textWrap: "balance" }}
        >
          Your account is ready
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
          Signed up as a {creator ? "creator" : "donor"}, {firstName}. Three things are worth knowing before your first{" "}
          {creator ? "campaign" : "donation"}.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid hsl(var(--border))" }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: "flex", gap: 20, padding: "22px 0", borderBottom: i === steps.length - 1 ? undefined : "1px solid hsl(var(--border))" }}>
            <span className="eyebrow numeric" style={{ color: "hsl(var(--muted-foreground))", width: 24, flexShrink: 0, paddingTop: 2 }}>
              {s.n}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{s.t}</span>
              <span style={{ fontSize: 14, lineHeight: 1.55, color: "hsl(var(--muted-foreground))" }}>{s.b}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link href={primary.href} className="ms-btn ms-btn--primary ms-btn--lg">
          {primary.label}
        </Link>
        <Link href={home} className="ms-btn ms-btn--ghost ms-btn--lg">
          Go to your dashboard
        </Link>
      </div>

      <p style={{ margin: "auto 0 0", fontSize: 12, lineHeight: 1.5, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
        {creator
          ? "Identity and payout details are collected from your dashboard before your first campaign publishes."
          : "Want to raise funds too? Start a campaign any time — a creator profile is added when you do."}
      </p>
    </AuthShell>
  );
}

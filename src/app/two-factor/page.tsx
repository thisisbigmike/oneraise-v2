"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SecurityContextPanel } from "@/components/auth/context-panel";

function CodeBoxes({ size }: { size: number }) {
  const digits = ["7", "1", "4", "0"];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {digits.map((d, i) => (
        <span
          key={i}
          className="numeric"
          style={{
            flex: size ? undefined : 1,
            width: size,
            height: size ? size * 1.14 : undefined,
            border: "1px solid hsl(var(--input))",
            borderRadius: "var(--radius-md)",
            background: "hsl(var(--surface))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          {d}
        </span>
      ))}
      <span
        style={{
          width: size,
          height: size ? size * 1.14 : undefined,
          flex: size ? undefined : 1,
          border: "2px solid hsl(var(--ring))",
          borderRadius: "var(--radius-md)",
          background: "hsl(var(--surface))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ width: 2, height: 26, background: "hsl(var(--foreground))" }} />
      </span>
      <span
        style={{
          width: size,
          height: size ? size * 1.14 : undefined,
          flex: size ? undefined : 1,
          border: "1px solid hsl(var(--input))",
          borderRadius: "var(--radius-md)",
          background: "hsl(var(--surface))",
        }}
      />
    </div>
  );
}

export default function TwoFactorPage() {
  const router = useRouter();
  const [trust, setTrust] = useState(false);

  return (
    <AuthShell
      topBarRight={
        <Link href="/signin" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          Cancel sign-in
        </Link>
      }
      mobileTopBarCenter={<span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>Two-factor</span>}
      contextPanel={
        <SecurityContextPanel
          eyebrow="Account security"
          heading="A second step, because money moves"
          body="Two-factor is required on accounts holding escrow or drawing it down. It cannot be turned off while a campaign is live."
          rows={[
            { left: "This device", right: "New — Lagos, Nigeria" },
            { left: "Last sign-in", right: "28 Aug 2026 · Kano" },
            { left: "Held in escrow", right: "$250" },
          ]}
        />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Two-factor
        </div>
        <h2
          className="font-display"
          style={{ fontSize: 40, lineHeight: 1.12, letterSpacing: "-0.018em", fontWeight: 600, margin: 0, textWrap: "balance" }}
        >
          Enter your six-digit code
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
          Open your authenticator app and enter the current code for OneRaise.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CodeBoxes size={56} />
        <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          Code refreshes in 0:22
        </span>
      </div>

      <label htmlFor="tf-trust" style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
        <input
          id="tf-trust"
          type="checkbox"
          checked={trust}
          onChange={(e) => setTrust(e.target.checked)}
          style={{ marginTop: 3, flexShrink: 0 }}
        />
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Trust this device for 30 days</span>
          <span style={{ fontSize: 13, lineHeight: 1.5, color: "hsl(var(--muted-foreground))" }}>
            Skip the code on this browser. Do not use it on a shared machine.
          </span>
        </span>
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" className="ms-btn ms-btn--primary ms-btn--lg" onClick={() => router.push("/donor")}>
          Verify code
        </button>
        <Link href="/locked-account" className="ms-btn ms-btn--ghost ms-btn--lg">
          Use a recovery code
        </Link>
      </div>

      <p style={{ margin: "auto 0 0", fontSize: 12, lineHeight: 1.5, color: "hsl(var(--muted-foreground))", maxWidth: "46ch" }}>
        Lost your authenticator? A recovery code signs you in once and resets two-factor.
      </p>
    </AuthShell>
  );
}

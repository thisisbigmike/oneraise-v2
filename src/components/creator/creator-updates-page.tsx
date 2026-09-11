"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { FieldError, FormError, FormSuccess, SubmitButton } from "@/components/ui/form-status";
import { CreatorShell, NoCampaign } from "@/components/creator/creator-shell";
import { postUpdate } from "@/server/actions/creator";
import type { ActionState, CampaignUpdateItem, CreatorShellData } from "@/lib/view-models";

function Composer({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  // The composer closes itself once the update is published.
  const [state, action] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await postUpdate(prev, formData);
    if (result.ok) setOpen(false);
    return result;
  }, {});

  if (!open) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: compact ? "100%" : "auto", alignItems: compact ? "stretch" : "flex-end" }}>
        <button
          type="button"
          className="ms-btn ms-btn--primary ms-btn--md"
          style={{ width: compact ? "100%" : "fit-content" }}
          onClick={() => setOpen(true)}
        >
          Post an update
        </button>
        {state.ok && <FormSuccess message={state.message} />}
      </div>
    );
  }

  return (
    <form
      action={action}
      style={{
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
        boxShadow: "var(--shadow-xs)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
      }}
    >
      <input name="title" type="text" className="ms-input" placeholder="Update title" aria-label="Update title" required maxLength={120} />
      <FieldError message={state.fieldErrors?.title} />
      <textarea
        name="body"
        className="ms-input"
        style={{ minHeight: 100, padding: "10px 12px", lineHeight: 1.6 }}
        placeholder="What's changed since your last update?"
        aria-label="Update"
        required
        maxLength={4000}
      />
      <FieldError message={state.fieldErrors?.body} />
      <FormError message={state.error} />
      <div style={{ display: "flex", gap: 10 }}>
        <SubmitButton className="ms-btn ms-btn--primary ms-btn--md" pendingLabel="Publishing…">
          Publish
        </SubmitButton>
        <button type="button" className="ms-btn ms-btn--ghost ms-btn--md" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
        Updates appear on your campaign page for every donor and visitor.
      </span>
    </form>
  );
}

function Body({ updates, compact }: { updates: CampaignUpdateItem[]; compact?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 16 : 24,
        flex: 1,
        padding: compact ? "20px 20px 28px" : "32px 40px 56px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Creator
          </div>
          <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
            Updates
          </h2>
        </div>
        <Composer compact={compact} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {updates.length === 0 && (
          <div style={{ padding: 20, border: "1px dashed hsl(var(--input))", borderRadius: "var(--radius-lg)", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            No updates yet. A short note every week or two keeps donors confident while stages are in progress.
          </div>
        )}
        {updates.map((u) => (
          <div
            key={u.id}
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--surface))",
              boxShadow: compact ? undefined : "var(--shadow-xs)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em" }}>
                {u.title}
              </span>
              <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", flexShrink: 0 }}>
                {u.date}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{u.body}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
        <Icon name="message-circle" size={14} style={{ width: 14, height: 14 }} />
        <span style={{ fontSize: 12, lineHeight: 1.4 }}>
          Updates are separate from milestone evidence — they don&apos;t open a dispute window or move escrow.
        </span>
      </div>
    </div>
  );
}

export function CreatorUpdatesPage({
  shell,
  data,
}: {
  shell: CreatorShellData;
  data: { campaignTitle: string; updates: CampaignUpdateItem[] } | null;
}) {
  return (
    <CreatorShell
      active="updates"
      shell={shell}
      desktop={data ? <Body updates={data.updates} /> : <NoCampaign />}
      mobile={data ? <Body updates={data.updates} compact /> : <NoCampaign compact />}
    />
  );
}

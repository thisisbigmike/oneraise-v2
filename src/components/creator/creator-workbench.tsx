"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PillNav } from "@/components/ui/pill-nav";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Countdown } from "@/components/ui/countdown";
import { ActionMessage, FieldError, FormError, FormSuccess, SubmitButton } from "@/components/ui/form-status";
import { CreatorShell, NoCampaign } from "@/components/creator/creator-shell";
import {
  addEvidence,
  publishCampaign,
  removeEvidence,
  respondToDispute,
  saveStageDraft,
  submitIdentityDocuments,
  submitStage,
  withdrawStage,
} from "@/server/actions/creator";
import type { CreatorOverviewData, CreatorShellData, CurrentStage } from "@/lib/view-models";

function StatGrid({ figures, compact }: { figures: CreatorOverviewData["figures"]; compact?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr 1fr" : "repeat(4, 1fr)", gap: compact ? 12 : 16 }}>
      {(compact ? figures.slice(0, 2) : figures).map((f) => (
        <div
          key={f.label}
          style={{
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
            boxShadow: compact ? undefined : "var(--shadow-xs)",
            padding: compact ? 14 : 18,
            display: "flex",
            flexDirection: "column",
            gap: compact ? 4 : 6,
          }}
        >
          <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            {f.label}
          </span>
          <span className="numeric" style={{ fontSize: compact ? 21 : 26, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.01em" }}>
            {f.value}
          </span>
          {!compact && (
            <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              {f.meta}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function EvidenceGrid({ stage, editable, compact }: { stage: CurrentStage; editable: boolean; compact?: boolean }) {
  const [state, add] = useActionState(addEvidence, {});
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
        Evidence
      </span>
      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr 1fr" : "repeat(3, 1fr)", gap: compact ? 8 : 10 }}>
        {stage.evidence.map((caption, i) => (
          <div key={`${caption}-${i}`} style={{ position: "relative" }}>
            <ImagePlaceholder caption={caption} style={{ width: "100%", height: compact ? 96 : 120 }} />
            {editable && (
              <form action={removeEvidence} style={{ position: "absolute", top: 6, right: 6 }}>
                <input type="hidden" name="milestone" value={stage.milestoneId} />
                <input type="hidden" name="index" value={i} />
                <button
                  type="submit"
                  className="ms-btn ms-btn--ghost ms-btn--icon"
                  aria-label={`Remove ${caption}`}
                  style={{ background: "hsl(var(--surface))", width: 28, height: 28 }}
                >
                  <Icon name="x" size={14} style={{ width: 14, height: 14 }} />
                </button>
              </form>
            )}
          </div>
        ))}
        {editable && stage.evidence.length < 8 && (
          <form
            action={add}
            style={{
              minHeight: compact ? 96 : 120,
              border: "1px dashed hsl(var(--input))",
              borderRadius: 8,
              background: "hsl(var(--canvas))",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
              padding: 10,
            }}
          >
            <input type="hidden" name="milestone" value={stage.milestoneId} />
            <input type="hidden" name="kind" value="photo" />
            <input name="caption" className="ms-input" placeholder="What it shows" aria-label="Photo caption" style={{ fontSize: 12, height: 32 }} />
            <SubmitButton className="ms-btn ms-btn--ghost ms-btn--sm" pendingLabel="Adding…">
              <Icon name="plus" size={14} style={{ width: 14, height: 14 }} />
              Add photo
            </SubmitButton>
          </form>
        )}
      </div>
      <FieldError message={state.fieldErrors?.caption} />
      <FormError message={state.error} />
      {stage.evidenceDocument ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md)",
            background: "hsl(var(--canvas))",
          }}
        >
          <Icon name="file-text" size={16} style={{ width: 16, height: 16, color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 500, flex: 1, minWidth: 0 }}>{stage.evidenceDocument}</span>
          {editable && (
            <form action={removeEvidence}>
              <input type="hidden" name="milestone" value={stage.milestoneId} />
              <input type="hidden" name="kind" value="document" />
              <button type="submit" className="ms-btn ms-btn--ghost ms-btn--sm">
                Remove
              </button>
            </form>
          )}
        </div>
      ) : (
        editable && <DocumentForm milestoneId={stage.milestoneId} />
      )}
    </div>
  );
}

function DocumentForm({ milestoneId }: { milestoneId: number }) {
  const [state, add] = useActionState(addEvidence, {});
  return (
    <form action={add} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="milestone" value={milestoneId} />
      <input type="hidden" name="kind" value="document" />
      <input
        name="caption"
        className="ms-input"
        placeholder="Receipt or document, e.g. “Materials receipt · laterite”"
        aria-label="Document name"
        style={{ flex: 1, minWidth: 200 }}
      />
      <SubmitButton className="ms-btn ms-btn--secondary ms-btn--md" pendingLabel="Attaching…">
        Attach receipt
      </SubmitButton>
      <FieldError message={state.fieldErrors?.caption} />
    </form>
  );
}

function DraftCard({ stage, compact }: { stage: CurrentStage; compact?: boolean }) {
  const [submitState, submit] = useActionState(submitStage, {});
  const [saveState, save] = useActionState(saveStageDraft, {});
  const noteId = `cd-note-${compact ? "m" : "d"}`;
  return (
    <div
      style={{
        border: "1px solid hsl(var(--primary))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
        boxShadow: compact ? undefined : "var(--shadow-xs)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: compact ? 16 : 20,
          borderBottom: "1px solid hsl(var(--border))",
          display: "flex",
          flexDirection: compact ? "column" : "row",
          alignItems: compact ? undefined : "flex-start",
          gap: compact ? 8 : 20,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
          <div className="eyebrow numeric" style={{ color: "hsl(var(--muted-foreground))" }}>
            Current stage · {stage.stageNumber} of {stage.totalStages}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: compact ? 10 : 12 }}>
            <h3 className="font-display" style={{ fontSize: compact ? 21 : 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
              {stage.label}
            </h3>
            <span className="ms-badge ms-badge--neutral">Draft</span>
          </div>
          <span className="numeric" style={{ fontSize: compact ? 13 : 14, color: "hsl(var(--muted-foreground))" }}>
            {stage.dueLabel}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: compact ? "row" : "column",
            alignItems: compact ? "baseline" : "flex-end",
            justifyContent: compact ? "space-between" : undefined,
            gap: 2,
            flexShrink: 0,
          }}
        >
          <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Releases on approval
          </span>
          <span className="numeric" style={{ fontSize: compact ? 21 : 26, lineHeight: 1.1, fontWeight: 600 }}>
            {stage.releasesTo}
          </span>
        </div>
      </div>

      <div
        style={{
          padding: compact ? 16 : 20,
          display: compact ? "flex" : "grid",
          flexDirection: compact ? "column" : undefined,
          gridTemplateColumns: compact ? undefined : "1fr 340px",
          gap: compact ? 14 : 28,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: compact ? 14 : 20, minWidth: 0 }}>
          <EvidenceGrid stage={stage} editable compact={compact} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Requirements
            </span>
            {stage.requirements.map((r) => (
              <span
                key={r.label}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: r.met ? undefined : "hsl(var(--muted-foreground))",
                }}
              >
                {r.met ? (
                  <span style={{ color: "hsl(var(--primary))", display: "flex", flexShrink: 0, marginTop: 2 }}>
                    <Icon name="check" size={14} strokeWidth={3} style={{ width: 14, height: 14 }} />
                  </span>
                ) : (
                  <span style={{ width: 14, height: 14, border: "1px solid hsl(var(--input))", borderRadius: 999, flexShrink: 0, marginTop: 2 }} />
                )}
                <span className="numeric">{r.label}</span>
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 16,
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-md)",
            background: "hsl(var(--canvas))",
          }}
        >
          <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Terms, as published
          </span>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{stage.termsNote}</p>
        </div>
      </div>

      <form action={submit}>
        <input type="hidden" name="milestone" value={stage.milestoneId} />
        <div style={{ padding: compact ? "0 16px 16px" : "0 20px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor={noteId} style={{ fontSize: 14, fontWeight: 500 }}>
            Note to donors
          </label>
          <textarea
            id={noteId}
            name="note"
            maxLength={600}
            className="ms-input"
            style={{ minHeight: 104, padding: "10px 12px", lineHeight: 1.6 }}
            defaultValue={stage.note}
            placeholder="What was done, against the terms above. Donors read this before they approve or dispute."
          />
          <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
            Up to 600 characters
          </span>
          <FieldError message={submitState.fieldErrors?.note} />
        </div>
        <div
          style={{
            borderTop: "1px solid hsl(var(--border))",
            padding: compact ? "14px 16px" : "16px 20px",
            background: "hsl(var(--canvas))",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <FormError message={submitState.error} />
          <ActionMessage state={saveState} />
          <div style={{ display: "flex", flexDirection: compact ? "column" : "row", alignItems: compact ? undefined : "center", gap: compact ? 10 : 16 }}>
            <SubmitButton className="ms-btn ms-btn--primary ms-btn--lg" style={compact ? { width: "100%" } : undefined} pendingLabel="Submitting…">
              Submit for review
            </SubmitButton>
            <button type="submit" formAction={save} className="ms-btn ms-btn--ghost ms-btn--lg">
              Save draft
            </button>
            <span style={{ fontSize: 12, lineHeight: 1.45, color: "hsl(var(--muted-foreground))", maxWidth: compact ? undefined : "52ch" }}>
              Submitting notifies <span className="numeric">{stage.donorCount} donors</span> and opens a 72-hour dispute window.{" "}
              <span className="numeric">{stage.releasesTo}</span> releases when it closes with no objection.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

function DisputeBox({ stage }: { stage: CurrentStage }) {
  const [state, respond] = useActionState(respondToDispute, {});
  const dispute = stage.dispute!;
  return (
    <div
      style={{
        border: "1px solid hsl(var(--destructive))",
        borderRadius: "var(--radius-md)",
        background: "hsl(var(--surface))",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="ms-badge ms-badge--destructive">Case {dispute.code}</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{dispute.statusLabel}</span>
      </div>
      {dispute.complaint && (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>“{dispute.complaint}”</p>
      )}
      {dispute.response ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Your response
          </span>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{dispute.response}</p>
        </div>
      ) : null}
      {(!dispute.response || dispute.statusLabel.includes("more evidence")) && (
        <form action={respond} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input type="hidden" name="dispute" value={dispute.id} />
          <textarea
            name="response"
            className="ms-input"
            required
            style={{ minHeight: 88, padding: "10px 12px", lineHeight: 1.6, fontSize: 13 }}
            placeholder="Answer what the donors raised. The moderator and the disputing donors see this."
            aria-label="Response to the dispute"
          />
          <FieldError message={state.fieldErrors?.response} />
          <ActionMessage state={state} />
          <SubmitButton className="ms-btn ms-btn--secondary ms-btn--md" style={{ width: "fit-content" }} pendingLabel="Sending…">
            {dispute.response ? "Send an update" : "Respond to dispute"}
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

function ReviewCard({ stage, initialNow, compact }: { stage: CurrentStage; initialNow: number; compact?: boolean }) {
  const [state, withdraw] = useActionState(withdrawStage, {});
  const badge =
    stage.phase === "review"
      ? { label: "In review", variant: "warning" }
      : stage.phase === "awaiting"
        ? { label: "Awaiting release", variant: "neutral" }
        : { label: "Disputed", variant: "destructive" };
  return (
    <div
      style={{
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
        boxShadow: compact ? undefined : "var(--shadow-xs)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: compact ? 16 : 20,
          borderBottom: "1px solid hsl(var(--border))",
          display: "flex",
          flexDirection: compact ? "column" : "row",
          alignItems: compact ? undefined : "flex-start",
          gap: compact ? 8 : 20,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
          <div className="eyebrow numeric" style={{ color: "hsl(var(--muted-foreground))" }}>
            Current stage · {stage.stageNumber} of {stage.totalStages}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 className="font-display" style={{ fontSize: compact ? 21 : 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
              {stage.label}
            </h3>
            <span className={`ms-badge ms-badge--${badge.variant}`}>{badge.label}</span>
          </div>
          <span className="numeric" style={{ fontSize: compact ? 13 : 14, color: "hsl(var(--muted-foreground))" }}>
            {stage.submittedNote}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: compact ? undefined : "flex-end", flexShrink: 0 }}>
          <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            {stage.phase === "review" ? "Window closes in" : "Window"}
          </span>
          <span className="numeric font-display" style={{ fontSize: compact ? 24 : 30, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.014em" }}>
            {stage.phase === "review" && stage.windowEndsAt ? <Countdown end={stage.windowEndsAt} initialNow={initialNow} /> : "Closed"}
          </span>
        </div>
      </div>

      <div style={{ padding: compact ? 16 : 20, display: "flex", flexDirection: "column", gap: 12, borderBottom: "1px solid hsl(var(--border))" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {stage.disputesNote}
          </span>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {stage.elapsedPct}% of the window elapsed
          </span>
        </div>
        <span style={{ height: 6, borderRadius: 999, background: "hsl(var(--border))", overflow: "hidden" }}>
          <span style={{ display: "block", width: `${stage.elapsedPct}%`, height: "100%", background: "hsl(var(--accent))" }} />
        </span>
        {stage.dispute && <DisputeBox stage={stage} />}
      </div>

      <div
        style={{
          padding: compact ? 16 : 20,
          display: compact ? "flex" : "grid",
          flexDirection: compact ? "column" : undefined,
          gridTemplateColumns: compact ? undefined : "1fr 340px",
          gap: compact ? 14 : 28,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <EvidenceGrid stage={stage} editable={false} compact={compact} />
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{stage.note}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-md)",
              background: "hsl(var(--canvas))",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {[
              { l: "Releases to you", v: stage.releasesTo },
              { l: "Platform fee", v: stage.platformFee },
              { l: "Lands in your account", v: stage.landsIn, strong: true },
            ].map((row, i, arr) => (
              <div
                key={row.l}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  borderBottom: i === arr.length - 1 ? undefined : "1px solid hsl(var(--border))",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: row.strong ? undefined : "hsl(var(--muted-foreground))",
                    fontWeight: row.strong ? 500 : undefined,
                  }}
                >
                  {row.l}
                </span>
                <span className="numeric" style={{ fontSize: 14, fontWeight: 600 }}>
                  {row.v}
                </span>
              </div>
            ))}
          </div>
          <span className="numeric" style={{ fontSize: 12, lineHeight: 1.5, color: "hsl(var(--muted-foreground))" }}>
            {stage.payoutNote}
          </span>
        </div>
      </div>

      <form
        action={withdraw}
        style={{
          borderTop: "1px solid hsl(var(--border))",
          padding: compact ? "14px 16px" : "16px 20px",
          background: "hsl(var(--canvas))",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <input type="hidden" name="milestone" value={stage.milestoneId} />
        <FormError message={state.error} />
        <SubmitButton className="ms-btn ms-btn--secondary ms-btn--lg" style={compact ? { width: "100%" } : { width: "fit-content" }} pendingLabel="Withdrawing…">
          Withdraw submission
        </SubmitButton>
        <span style={{ fontSize: 12, lineHeight: 1.45, color: "hsl(var(--muted-foreground))", maxWidth: compact ? undefined : "56ch" }}>
          Withdrawing returns the stage to draft, cancels the window and closes any open dispute. Donors are told the submission was withdrawn.
        </span>
      </form>
    </div>
  );
}

function LaunchCard({ data }: { data: CreatorOverviewData }) {
  const [state, submitDocs] = useActionState(() => submitIdentityDocuments(), {});
  const verified = data.kycStatus === "verified";
  return (
    <div
      style={{
        border: "1px solid hsl(var(--primary))",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--surface))",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StatusBadge status={data.campaign.status} />
        <span style={{ fontSize: 15, fontWeight: 600 }}>{verified ? "Ready to publish" : "Waiting on identity verification"}</span>
      </div>
      {data.identityNote && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{data.identityNote}</p>}
      {verified ? (
        <form action={publishCampaign}>
          <input type="hidden" name="slug" value={data.campaign.slug} />
          <SubmitButton className="ms-btn ms-btn--primary ms-btn--md" pendingLabel="Publishing…">
            Publish campaign
          </SubmitButton>
        </form>
      ) : data.kycStatus === "pending" ? (
        <FormSuccess message="Documents received — a moderator usually decides within two working days." />
      ) : (
        <form action={submitDocs} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SubmitButton className="ms-btn ms-btn--primary ms-btn--md" style={{ width: "fit-content" }} pendingLabel="Submitting…">
            Submit identity documents
          </SubmitButton>
          <ActionMessage state={state} />
        </form>
      )}
      <Link href={`/campaigns/${data.campaign.slug}`} style={{ fontSize: 13 }}>
        Preview the campaign page →
      </Link>
    </div>
  );
}

function IdentityBanner({ note }: { note: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        border: "1px solid hsl(var(--warning))",
        borderRadius: "var(--radius-md)",
        background: "hsl(var(--surface))",
      }}
    >
      <Icon name="alert-triangle" size={14} style={{ width: 14, height: 14, color: "hsl(var(--warning))", flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 13, lineHeight: 1.5 }}>
        {note} <Link href="/creator/settings">Re-verify in settings</Link>
      </span>
    </div>
  );
}

function StageArea({ data, initialNow, compact }: { data: CreatorOverviewData; initialNow: number; compact?: boolean }) {
  if (!data.launched) return <LaunchCard data={data} />;
  if (!data.stage) {
    return (
      <div
        style={{
          padding: 20,
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
          fontSize: 14,
        }}
      >
        Every stage of this campaign has settled. Nothing left to submit.
      </div>
    );
  }
  return data.stage.phase === "draft" ? (
    <DraftCard key={data.stage.milestoneId} stage={data.stage} compact={compact} />
  ) : (
    <ReviewCard key={data.stage.milestoneId} stage={data.stage} initialNow={initialNow} compact={compact} />
  );
}

export function CreatorWorkbench({
  shell,
  data,
  initialNow,
}: {
  shell: CreatorShellData;
  data: CreatorOverviewData | null;
  initialNow: number;
}) {
  if (!data) {
    return <CreatorShell active="overview" shell={shell} desktop={<NoCampaign />} mobile={<NoCampaign compact />} />;
  }

  const desktop = (
    <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Creator
          </div>
          <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
            {data.campaign.title}
          </h2>
        </div>
        <StatusBadge status={data.campaign.status} />
      </div>

      {data.launched && data.identityNote && <IdentityBanner note={data.identityNote} />}
      <StatGrid figures={data.figures} />
      <StageArea data={data} initialNow={initialNow} />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
          Escrow ladder
        </h3>
        <div
          style={{
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
            boxShadow: "var(--shadow-xs)",
            overflow: "hidden",
          }}
        >
          {data.ladder.map((stage, i) => (
            <div
              key={stage.number}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "16px 20px",
                borderBottom: i === data.ladder.length - 1 ? undefined : "1px solid hsl(var(--border))",
                background: stage.highlighted ? "hsl(var(--secondary))" : undefined,
              }}
            >
              <span className="eyebrow numeric" style={{ color: "hsl(var(--muted-foreground))", width: 24, flexShrink: 0 }}>
                {stage.number}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, width: 220, flexShrink: 0 }}>{stage.label}</span>
              <span className="numeric" style={{ fontSize: 15, fontWeight: 600, width: 100, flexShrink: 0 }}>
                {stage.amount}
              </span>
              <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", flex: 1 }}>
                {stage.meta}
              </span>
              <span className={`ms-badge ms-badge--${stage.badgeVariant}`} style={{ flexShrink: 0 }}>
                {stage.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20 }}>
          <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
            Recent donors
          </h3>
          {data.recentDonors.length > 0 && (
            <a href="/creator/donors/export" className="ms-btn ms-btn--ghost ms-btn--sm">
              Export donors
            </a>
          )}
        </div>
        <div
          style={{
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
            boxShadow: "var(--shadow-xs)",
            overflow: "hidden",
          }}
        >
          {data.recentDonors.length === 0 && (
            <div style={{ padding: "16px 20px", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              No donations yet. They appear here as they come in.
            </div>
          )}
          {data.recentDonors.map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
              <Avatar initials={d.initials} size={32} fontSize={12} />
              <span style={{ fontSize: 14, fontWeight: 500, width: 200, flexShrink: 0 }}>{d.name}</span>
              <span className="numeric" style={{ fontSize: 14, fontWeight: 600, width: 80, flexShrink: 0 }}>
                {d.amount}
              </span>
              <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", flex: 1 }}>
                {d.meta}
              </span>
              <span className="ms-badge ms-badge--outline" style={{ flexShrink: 0 }}>
                {d.tier}
              </span>
            </div>
          ))}
          {data.moreDonors > 0 && (
            <div
              style={{
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                background: "hsl(var(--canvas))",
              }}
            >
              <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {data.moreDonors.toLocaleString("en-US")} more donors
              </span>
              <Link href="/creator/donors" style={{ fontSize: 13 }}>
                See all
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const mobile = (
    <>
      <PillNav size="sm" end={<Avatar initials={shell.creatorInitials} size={32} fontSize={12} />} />
      <div style={{ flex: 1, padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Creator
          </div>
          <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.25, letterSpacing: "-0.014em", fontWeight: 600, margin: 0, textWrap: "balance" }}>
            {data.campaign.shortTitle}
          </h3>
        </div>
        {data.launched && data.identityNote && <IdentityBanner note={data.identityNote} />}
        <StatGrid figures={data.figures} compact />
        <StageArea data={data} initialNow={initialNow} compact />
      </div>
    </>
  );

  return <CreatorShell active="overview" shell={shell} desktop={desktop} mobile={mobile} />;
}

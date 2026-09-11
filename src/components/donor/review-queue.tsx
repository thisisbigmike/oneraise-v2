"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { MilestoneTrack } from "@/components/campaign/milestone-track";
import { FieldError, FormError, SubmitButton } from "@/components/ui/form-status";
import { reviewMilestone } from "@/server/actions/donor";
import type { ActionState, ReviewQueueItem } from "@/lib/view-models";
import styles from "@/styles/responsive.module.css";

/** One stage waiting on the donor's review, as a table row or a mobile card. */
export function ReviewQueueRow({
  item,
  onReview,
  mobile,
}: {
  item: ReviewQueueItem;
  onReview: () => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <ImagePlaceholder caption="16:10" style={{ width: 64, height: 40, flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{item.campaign}</span>
            <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{item.milestone}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span className="numeric" style={{ fontSize: 15, fontWeight: 600 }}>
            {item.amount}
          </span>
          <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
            Your share {item.yourShare}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
            Closes in {item.windowRemaining}
          </span>
          <span style={{ height: 4, borderRadius: 999, background: "hsl(var(--border))", overflow: "hidden" }}>
            <span
              style={{
                display: "block",
                width: `${item.windowPct}%`,
                height: "100%",
                background: item.urgent ? "hsl(var(--warning))" : "hsl(var(--primary))",
              }}
            />
          </span>
        </div>
        <button type="button" className="ms-btn ms-btn--primary ms-btn--lg" style={{ width: "100%" }} onClick={onReview}>
          Review
        </button>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, padding: 20 }}>
      <ImagePlaceholder caption="16:10" style={{ width: 72, height: 45, flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 3, width: 300, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{item.campaign}</span>
        <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{item.milestone}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, width: 150, flexShrink: 0 }}>
        <span className="numeric" style={{ fontSize: 15, fontWeight: 600 }}>
          {item.amount}
        </span>
        <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          Your share {item.yourShare}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
        <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
          {item.windowLabel}
        </span>
        <span style={{ height: 4, borderRadius: 999, background: "hsl(var(--border))", overflow: "hidden" }}>
          <span
            style={{
              display: "block",
              width: `${item.windowPct}%`,
              height: "100%",
              background: item.urgent ? "hsl(var(--warning))" : "hsl(var(--primary))",
            }}
          />
        </span>
      </div>
      <span className="ms-badge ms-badge--warning" style={{ flexShrink: 0 }}>
        In review
      </span>
      <button type="button" className="ms-btn ms-btn--primary ms-btn--md" style={{ flexShrink: 0 }} onClick={onReview}>
        Review
      </button>
    </div>
  );
}

function DrawerBody({ item, compact }: { item: ReviewQueueItem; compact?: boolean }) {
  return (
    <div style={{ padding: compact ? 0 : 24, display: "flex", flexDirection: "column", gap: compact ? 20 : 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span className="ms-badge ms-badge--warning">In review</span>
        <span className="numeric" style={{ fontSize: compact ? 12 : 13, color: "hsl(var(--muted-foreground))" }}>
          Submitted {item.submittedDate} · window closes in {item.windowRemaining}
        </span>
      </div>

      {!compact && (
        <div
          style={{
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
            boxShadow: "var(--shadow-xs)",
            padding: 20,
          }}
        >
          <MilestoneTrack milestones={item.track} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Evidence submitted
        </span>
        {item.evidence.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {item.evidence.map((caption, i) => (
              <ImagePlaceholder key={`${caption}-${i}`} caption={caption} style={{ width: "100%", height: 140 }} />
            ))}
          </div>
        )}
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{item.evidenceNote}</p>
      </div>

      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--canvas))",
          overflow: "hidden",
        }}
      >
        {[
          { l: "Releases from escrow", v: item.releasesFrom },
          { l: "Your share of it", v: item.yourShare },
          { l: "Donors who have disputed", v: item.disputedOf },
        ].map((row, i, arr) => (
          <div
            key={row.l}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "14px 16px",
              borderBottom: i === arr.length - 1 ? undefined : "1px solid hsl(var(--border))",
            }}
          >
            <span style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>{row.l}</span>
            <span className="numeric" style={{ fontSize: 14, fontWeight: 600 }}>
              {row.v}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Milestone terms, as published</span>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "hsl(var(--muted-foreground))" }}>{item.termsNote}</p>
      </div>
    </div>
  );
}

function DrawerFooter({
  item,
  compact,
  action,
  state,
  disputing,
  setDisputing,
}: {
  item: ReviewQueueItem;
  compact?: boolean;
  action: (formData: FormData) => void;
  state: ActionState;
  disputing: boolean;
  setDisputing: (v: boolean) => void;
}) {
  const noteId = `dispute-note-${compact ? "m" : "d"}-${item.milestoneId}`;
  return (
    <form
      action={action}
      style={{
        marginTop: compact ? undefined : "auto",
        flexShrink: 0,
        position: compact ? undefined : "sticky",
        bottom: 0,
        background: "hsl(var(--surface))",
        borderTop: "1px solid hsl(var(--border))",
        padding: "16px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <input type="hidden" name="milestone" value={item.milestoneId} />
      <input type="hidden" name="decision" value={disputing ? "dispute" : "approve"} />
      {disputing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor={noteId} style={{ fontSize: 13, fontWeight: 500 }}>
            What does the evidence miss against the terms?
          </label>
          <textarea
            id={noteId}
            name="note"
            required
            minLength={10}
            className="ms-input"
            style={{ minHeight: 88, padding: "10px 12px", lineHeight: 1.6, fontSize: 13 }}
            placeholder="e.g. The receipt covers twelve pits, the terms say thirty."
          />
          <FieldError message={state.fieldErrors?.note} />
        </div>
      )}
      <FormError message={state.error} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexDirection: compact ? "column" : "row" }}>
        {disputing ? (
          <>
            <SubmitButton className="ms-btn ms-btn--destructive ms-btn--lg" style={{ flex: 1, width: compact ? "100%" : undefined }} pendingLabel="Raising…">
              Raise dispute
            </SubmitButton>
            <button
              type="button"
              className="ms-btn ms-btn--ghost ms-btn--lg"
              style={{ width: compact ? "100%" : undefined }}
              onClick={() => setDisputing(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <SubmitButton className="ms-btn ms-btn--primary ms-btn--lg" style={{ flex: 1, width: compact ? "100%" : undefined }} pendingLabel="Approving…">
              Approve release
            </SubmitButton>
            <button
              type="button"
              className="ms-btn ms-btn--secondary ms-btn--lg"
              style={{ width: compact ? "100%" : undefined }}
              onClick={() => setDisputing(true)}
            >
              Dispute this
            </button>
          </>
        )}
      </div>
      <span style={{ fontSize: 12, lineHeight: 1.45, color: "hsl(var(--muted-foreground))" }}>
        {disputing ? (
          "A dispute holds the release and opens a case a moderator reviews within five days. The creator sees your note, not your name."
        ) : (
          <>
            Approving releases <span className="numeric">{item.releasesFrom}</span> from escrow to {item.creatorName} when the window closes. A
            dispute holds the release and opens a case a moderator reviews within five days.
          </>
        )}
      </span>
    </form>
  );
}

/** The milestone review panel: evidence, terms and the approve / dispute decision. */
export function ReviewDrawer({
  item,
  onClose,
  onDone,
}: {
  item: ReviewQueueItem;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  // Report back from inside the action: once it succeeds the item leaves the
  // queue and this drawer unmounts, so an effect would never get to run.
  const [state, action] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await reviewMilestone(prev, formData);
    if (result.ok && result.message) onDone(result.message);
    return result;
  }, {});
  const [disputing, setDisputing] = useState(false);

  const footer = { item, action, state, disputing, setDisputing };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40 }}>
      <div aria-hidden="true" onClick={onClose} style={{ position: "absolute", inset: 0, background: "hsl(var(--scrim) / 0.5)" }} />
      {/* Desktop: 520px right panel */}
      <div className={styles.desktopOnly}>
        <div
          role="dialog"
          aria-label={`Review ${item.milestoneLabel}`}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 520,
            background: "hsl(var(--surface))",
            borderLeft: "1px solid hsl(var(--border))",
            boxShadow: "var(--shadow-lg)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              background: "hsl(var(--surface))",
              borderBottom: "1px solid hsl(var(--border))",
              padding: "20px 24px",
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                Milestone review
              </div>
              <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
                {item.milestoneLabel}
              </h3>
              <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {item.campaign} · {item.creatorName}
              </span>
            </div>
            <button
              type="button"
              className="ms-btn ms-btn--ghost ms-btn--icon"
              aria-label="Close review"
              style={{ flexShrink: 0, margin: "-4px -8px 0 0" }}
              onClick={onClose}
            >
              <Icon name="x" size={16} style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <DrawerBody item={item} />
          <DrawerFooter {...footer} />
        </div>
      </div>
      {/* Mobile: near-full sheet */}
      <div className={styles.mobileOnly}>
        <div
          role="dialog"
          aria-label={`Review ${item.milestoneLabel}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 64,
            background: "hsl(var(--surface))",
            borderTop: "1px solid hsl(var(--border))",
            borderRadius: "16px 16px 0 0",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 20px 16px",
              borderBottom: "1px solid hsl(var(--border))",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <span style={{ width: 36, height: 4, borderRadius: 999, background: "hsl(var(--border))", alignSelf: "center" }} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Milestone review
                </div>
                <h4 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
                  {item.milestoneLabel}
                </h4>
                <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{item.campaign}</span>
              </div>
              <button type="button" className="ms-btn ms-btn--ghost ms-btn--icon" aria-label="Close" style={{ margin: "-4px -8px 0 0" }} onClick={onClose}>
                <Icon name="x" size={16} style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            <DrawerBody item={item} compact />
          </div>
          <DrawerFooter {...footer} compact />
        </div>
      </div>
    </div>
  );
}

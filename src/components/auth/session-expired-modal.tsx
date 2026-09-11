"use client";

/** The other auth interruption: a signed-out session, surfaced over
 *  whatever the visitor was doing rather than a redirect away from it. */
export function SessionExpiredModal({
  draftAmountLabel,
  onSignInAgain,
  onKeepBrowsing,
}: {
  draftAmountLabel?: string;
  onSignInAgain: () => void;
  onKeepBrowsing: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        aria-hidden="true"
        onClick={onKeepBrowsing}
        style={{ position: "absolute", inset: 0, background: "hsl(var(--scrim) / 0.5)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your session expired"
        style={{
          position: "relative",
          width: "min(440px, calc(100vw - 40px))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-lg)",
          background: "hsl(var(--surface))",
          boxShadow: "var(--shadow-lg)",
          padding: 24,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h4 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
            Your session expired
          </h4>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "hsl(var(--muted-foreground))" }}>
            You were signed out after 30 minutes without activity.
            {draftAmountLabel && (
              <>
                {" "}
                Your pledge draft of{" "}
                <span className="numeric" style={{ color: "hsl(var(--foreground))", fontWeight: 500 }}>
                  {draftAmountLabel}
                </span>{" "}
                is saved.
              </>
            )}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
          <button type="button" className="ms-btn ms-btn--primary ms-btn--md" style={{ flex: 1 }} onClick={onSignInAgain}>
            Sign in again
          </button>
          <button type="button" className="ms-btn ms-btn--ghost ms-btn--md" onClick={onKeepBrowsing}>
            Keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/form-status";
import { resolveFailedRefund, runQueuedBatches, runRefundBatch } from "@/server/actions/admin";
import type { RefundsData } from "@/lib/view-models";

const BATCH_COLUMNS = "90px 1fr 180px 110px 80px 110px 150px";
const FAILED_COLUMNS = "1fr 170px 110px 200px 150px";

export function RefundsQueue({ data }: { data: RefundsData }) {
  const { batches, failed, queued } = data;
  return (
    <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
      <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Queue
            </div>
            <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
              Refunds
            </h2>
          </div>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {data.totalAmount} to return to {data.totalDonors} donors
          </span>
        </div>

        {queued.count > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--surface))",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: "hsl(var(--secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "hsl(var(--primary))",
                flexShrink: 0,
              }}
            >
              <Icon name="circle-dollar-sign" size={16} style={{ width: 16, height: 16 }} />
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                {queued.count} {queued.count === 1 ? "batch" : "batches"} queued and ready to run
              </span>
              <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {queued.amount} · {queued.donors} donors · refunds land in 3 to 5 working days
              </span>
            </div>
            <form action={runQueuedBatches}>
              <SubmitButton className="ms-btn ms-btn--primary ms-btn--md" pendingLabel="Running…">
                Run {queued.count === 1 ? "batch" : `all ${queued.count} batches`}
              </SubmitButton>
            </form>
          </div>
        )}

        <div
          style={{
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
            boxShadow: "var(--shadow-xs)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: BATCH_COLUMNS,
              gap: 14,
              padding: "12px 20px",
              borderBottom: "1px solid hsl(var(--border))",
              background: "hsl(var(--canvas))",
            }}
          >
            {["Batch", "Campaign", "Reason", "Amount", "Donors", "Status", "Action"].map((h) => (
              <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                {h}
              </span>
            ))}
          </div>
          {batches.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              No refund batches yet.
            </div>
          )}
          {batches.map((b, i) => (
            <div
              key={b.id}
              style={{
                display: "grid",
                gridTemplateColumns: BATCH_COLUMNS,
                gap: 14,
                padding: "14px 20px",
                borderBottom: i === batches.length - 1 ? undefined : "1px solid hsl(var(--border))",
                alignItems: "center",
                background: b.status === "Failed" ? "hsl(var(--secondary))" : undefined,
              }}
            >
              <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                {b.id}
              </span>
              <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.campaign}</span>
              <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{b.reason}</span>
              <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                {b.amount}
              </span>
              <span className="numeric" style={{ fontSize: 13 }}>
                {b.donors}
              </span>
              {b.status === "Settled" ? (
                <>
                  <Badge variant="funded">Settled</Badge>
                  <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                    {b.settledDate}
                  </span>
                </>
              ) : (
                <>
                  <Badge variant={b.status === "Failed" ? "destructive" : "neutral"}>
                    {b.status === "Failed" ? `${b.failedCount} failed` : "Queued"}
                  </Badge>
                  <form action={runRefundBatch}>
                    <input type="hidden" name="batch" value={b.batchId} />
                    <SubmitButton
                      className={`ms-btn ms-btn--${b.status === "Failed" ? "secondary" : "primary"} ms-btn--sm`}
                      pendingLabel="Running…"
                    >
                      {b.status === "Failed" ? `Retry ${b.failedCount} ${b.failedCount === 1 ? "card" : "cards"}` : "Run batch"}
                    </SubmitButton>
                  </form>
                </>
              )}
            </div>
          ))}
        </div>

        {failed.length > 0 && (
          <div
            style={{
              border: "1px solid hsl(var(--destructive))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--surface))",
              boxShadow: "var(--shadow-xs)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "hsl(var(--destructive))", display: "flex", flexShrink: 0 }}>
                <Icon name="alert-triangle" size={16} style={{ width: 16, height: 16 }} />
              </span>
              <h3 className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em", margin: 0, flex: 1 }}>
                {failed.length === 1 ? "One refund could not be paid" : `${failed.length} refunds could not be paid`}
              </h3>
              <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {data.failedSummary}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: FAILED_COLUMNS,
                gap: 14,
                padding: "12px 20px",
                borderBottom: "1px solid hsl(var(--border))",
                background: "hsl(var(--canvas))",
              }}
            >
              {["Donor", "Card", "Amount", "Reason", "Action"].map((h) => (
                <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                  {h}
                </span>
              ))}
            </div>
            {failed.map((f, i) => (
              <div
                key={f.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: FAILED_COLUMNS,
                  gap: 14,
                  padding: "13px 20px",
                  borderBottom: i === failed.length - 1 ? undefined : "1px solid hsl(var(--border))",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13 }}>{f.donor}</span>
                <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                  {f.card}
                </span>
                <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                  {f.amount}
                </span>
                <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{f.reason}</span>
                <form action={resolveFailedRefund}>
                  <input type="hidden" name="refund" value={f.refundId} />
                  <SubmitButton className="ms-btn ms-btn--secondary ms-btn--sm" pendingLabel="Resolving…">
                    {f.action}
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

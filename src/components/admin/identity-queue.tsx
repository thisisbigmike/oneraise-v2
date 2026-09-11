"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Icon } from "@/components/ui/icon";
import { DecisionPanel } from "@/components/admin/decision-panel";
import { FormSuccess } from "@/components/ui/form-status";
import { decideIdentity } from "@/server/actions/admin";
import type { IdentityRow } from "@/lib/view-models";

const STATUS_VARIANT = {
  Incomplete: "warning",
  Ready: "neutral",
  Resubmitted: "outline",
} as const;

const COLUMNS = "1fr 150px 130px 110px 130px 130px";

export function IdentityQueue({ rows, summary }: { rows: IdentityRow[]; summary: string }) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0] ?? null;

  return (
    <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
      <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Queue
            </div>
            <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
              Identity
            </h2>
          </div>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {summary}
          </span>
        </div>

        {notice && <FormSuccess message={notice} />}

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
              gridTemplateColumns: COLUMNS,
              gap: 14,
              padding: "12px 20px",
              borderBottom: "1px solid hsl(var(--border))",
              background: "hsl(var(--canvas))",
            }}
          >
            {["Creator", "Country", "Documents", "Submitted", "Blocking", "Status"].map((h) => (
              <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                {h}
              </span>
            ))}
          </div>
          {rows.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              No identity checks are waiting.
            </div>
          )}
          {rows.map((row, i) => {
            const active = row.id === selected?.id;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                aria-pressed={active}
                style={{
                  display: "grid",
                  gridTemplateColumns: COLUMNS,
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom: i === rows.length - 1 ? undefined : "1px solid hsl(var(--border))",
                  alignItems: "center",
                  background: active ? "hsl(var(--secondary))" : undefined,
                  textAlign: "left",
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "inherit",
                  width: "100%",
                }}
              >
                <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{row.creator}</span>
                  <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{row.structure}</span>
                </span>
                <span style={{ fontSize: 13 }}>{row.country}</span>
                <span className="numeric" style={{ fontSize: 13 }}>
                  {row.documents}
                </span>
                <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                  {row.submitted}
                </span>
                <span
                  className="numeric"
                  style={{
                    fontSize: 13,
                    fontWeight: row.blocking.startsWith("$") ? 600 : 400,
                    color: row.blocking.startsWith("$") ? undefined : "hsl(var(--muted-foreground))",
                  }}
                >
                  {row.blocking}
                </span>
                <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
              </button>
            );
          })}
        </div>

        {selected && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
            <div
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-lg)",
                background: "hsl(var(--surface))",
                boxShadow: "var(--shadow-xs)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))", display: "flex", alignItems: "center", gap: 12 }}>
                <h3 className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em", margin: 0, flex: 1 }}>
                  {selected.panel.creator} · documents on file
                </h3>
                <span className="ms-badge ms-badge--warning">{selected.panel.documentsCount}</span>
              </div>
              <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {selected.panel.items.map((item) =>
                  item.submitted ? (
                    <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <ImagePlaceholder caption={item.label} style={{ width: "100%", height: 150 }} />
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500 }}>
                        <span style={{ color: "hsl(var(--primary))", display: "flex" }}>
                          <Icon name="check" size={14} strokeWidth={3} style={{ width: 14, height: 14 }} />
                        </span>
                        {item.label}
                      </span>
                      <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                        {item.meta}
                      </span>
                    </div>
                  ) : (
                    <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div
                        style={{
                          width: "100%",
                          height: 150,
                          border: "1px dashed hsl(var(--input))",
                          borderRadius: 8,
                          background: "hsl(var(--canvas))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "hsl(var(--muted-foreground))",
                          fontSize: 13,
                          textAlign: "center",
                          padding: 12,
                        }}
                      >
                        Not submitted
                      </div>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                        <span style={{ width: 14, height: 14, border: "1px solid hsl(var(--input))", borderRadius: 999, flexShrink: 0 }} />
                        {item.label}
                      </span>
                      <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{item.meta}</span>
                    </div>
                  ),
                )}
              </div>
              <div
                style={{
                  borderTop: "1px solid hsl(var(--border))",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  background: "hsl(var(--canvas))",
                }}
              >
                <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Automated checks
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selected.panel.checks.map((c) => (
                    <Badge key={c.label} variant={c.variant}>
                      {c.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DecisionPanel
              key={selected.id}
              title="Decision"
              options={selected.options}
              action={decideIdentity}
              hidden={{ check: selected.checkId }}
              destructiveValues={["reject"]}
              onRecorded={setNotice}
              reasonLabel="Note for the audit log"
              reasonPlaceholder="e.g. Payout account is in the trading name, ID is in the personal name. Statement will resolve."
              footNote="Recorded against this creator's verification history."
              confirmFootNote="The creator has been notified of this decision."
            />
          </div>
        )}
      </div>
    </div>
  );
}

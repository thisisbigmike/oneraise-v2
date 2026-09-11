"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { DecisionPanel } from "@/components/admin/decision-panel";
import { FormSuccess } from "@/components/ui/form-status";
import { decideModeration } from "@/server/actions/admin";
import type { ModerationCampaign } from "@/lib/view-models";

const STATUS_VARIANT = {
  "Under review": "destructive",
  Triage: "warning",
} as const;

const POLICIES = [
  "3.1 · Financial return promised",
  "3.4 · No defined milestones",
  "5.2 · Imagery not the creator's own",
  "5.4 · Misleading evidence or claims",
];

const COLUMNS = "1fr 190px 90px 110px 110px 120px";

function PolicySelect() {
  const id = useId();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500 }}>
        Policy breached
      </label>
      <div style={{ position: "relative", display: "flex" }}>
        <select id={id} name="policy" className="ms-input" style={{ appearance: "none", paddingRight: 40, cursor: "pointer", fontSize: 13 }} defaultValue={POLICIES[0]}>
          {POLICIES.map((p) => (
            <option key={p}>{p}</option>
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
    </div>
  );
}

export function ModerationQueue({ rows, summary }: { rows: ModerationCampaign[]; summary: string }) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const selected = rows.find((c) => c.id === selectedId) ?? rows[0] ?? null;

  return (
    <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
      <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Queue
            </div>
            <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
              Moderation
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
            {["Campaign", "Top reason", "Reports", "Raised", "Oldest", "Status"].map((h) => (
              <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                {h}
              </span>
            ))}
          </div>
          {rows.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              No open reports.
            </div>
          )}
          {rows.map((c, i) => {
            const active = c.id === selected?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
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
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.campaign}</span>
                  <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{c.campaignMeta}</span>
                </span>
                <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{c.topReason}</span>
                <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                  {c.reports}
                </span>
                <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                  {c.raised}
                </span>
                <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                  {c.oldest}
                </span>
                <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
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
                  {selected.campaign} · {selected.reports} reports
                </h3>
                <Link
                  href={`/campaigns/${selected.campaignSlug}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "hsl(var(--primary))" }}
                >
                  Open campaign
                  <Icon name="external-link" size={14} style={{ width: 14, height: 14 }} />
                </Link>
              </div>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <ImagePlaceholder caption="Campaign artwork" style={{ width: 176, height: 110, flexShrink: 0 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                    <span style={{ fontSize: 14, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{selected.description}</span>
                    <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                      {selected.donors} donors · {selected.raised} raised
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: "1px solid hsl(var(--border))" }}>
                  <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Reports by reason
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selected.reasonBreakdown.map((r) => (
                      <div key={r.reason} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 13, width: 190, flexShrink: 0 }}>{r.reason}</span>
                        <span style={{ flex: 1, height: 8, borderRadius: 999, background: "hsl(var(--border))", overflow: "hidden" }}>
                          <span style={{ display: "block", width: `${r.pct}%`, height: "100%", background: "hsl(var(--accent))" }} />
                        </span>
                        <span className="numeric" style={{ fontSize: 13, fontWeight: 600, width: 24, textAlign: "right" }}>
                          {r.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DecisionPanel
              key={selected.id}
              title="Decision"
              options={selected.options}
              action={decideModeration}
              hidden={{ campaign: selected.campaignId }}
              destructiveValues={["takedown", "pause"]}
              extraFields={<PolicySelect />}
              onRecorded={setNotice}
              footNote="Takedowns are reviewed by a second moderator within 24 hours. Yours is recorded either way."
              confirmFootNote="Recorded in the audit log. Reporters are told the outcome, not who decided it."
            />
          </div>
        )}
      </div>
    </div>
  );
}

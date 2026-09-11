import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import type { EscrowLedgerData } from "@/lib/view-models";

const STATE_COLOR: Record<string, string> = {
  accent: "hsl(var(--accent))",
  primary: "hsl(var(--primary))",
  destructive: "hsl(var(--destructive))",
  warning: "hsl(var(--warning))",
};

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
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
      <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))", display: "flex", alignItems: "center", gap: 12 }}>
        <h3 className="font-display" style={{ fontSize: 19, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.010em", margin: 0, flex: 1 }}>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function EscrowLedger({ data }: { data: EscrowLedgerData }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
      <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Platform
            </div>
            <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
              Escrow
            </h2>
          </div>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {data.reconciledAt}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 40,
            padding: 24,
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Total held
            </span>
            <span className="numeric font-display" style={{ fontSize: 44, lineHeight: 1, fontWeight: 600, letterSpacing: "-0.022em" }}>
              {data.totalHeld}
            </span>
          </div>
          <div style={{ width: 1, height: 56, background: "hsl(var(--border))" }} />
          {data.summary.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                {s.label}
              </span>
              <span className="numeric" style={{ fontSize: 21, fontWeight: 600 }}>
                {s.value}
              </span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <Badge variant="funded">
            <Icon name="check" size={12} strokeWidth={3} style={{ width: 12, height: 12 }} />
            Live ledger
          </Badge>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <Panel title="Held by campaign state">
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {data.byState.map((s) => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span>
                    <span className="numeric" style={{ fontSize: 14, fontWeight: 600 }}>
                      {s.value}
                    </span>
                  </div>
                  <span style={{ height: 8, borderRadius: 999, background: "hsl(var(--border))", overflow: "hidden" }}>
                    <span style={{ display: "block", width: `${s.pct}%`, height: "100%", background: STATE_COLOR[s.color] }} />
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="By currency">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 130px 110px",
                gap: 14,
                padding: "12px 20px",
                borderBottom: "1px solid hsl(var(--border))",
                background: "hsl(var(--canvas))",
              }}
            >
              {["Currency", "Held", "In USD", "Campaigns"].map((h) => (
                <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                  {h}
                </span>
              ))}
            </div>
            {data.byCurrency.map((c) => (
              <div
                key={c.currency}
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr 130px 110px",
                  gap: 14,
                  padding: "13px 20px",
                  borderBottom: "1px solid hsl(var(--border))",
                  alignItems: "center",
                }}
              >
                <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                  {c.currency}
                </span>
                <span className="numeric" style={{ fontSize: 13 }}>
                  {c.held}
                </span>
                <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                  {c.usd}
                </span>
                <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                  {c.campaigns}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 130px 110px",
                gap: 14,
                padding: "13px 20px",
                alignItems: "center",
                background: "hsl(var(--canvas))",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {data.currencyTotal.currencies} {data.currencyTotal.currencies === 1 ? "currency" : "currencies"}
              </span>
              <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                {data.currencyTotal.usd}
              </span>
              <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                {data.currencyTotal.campaigns}
              </span>
            </div>
          </Panel>
        </div>

        <Panel
          title="Largest holdings"
          action={
            <a href="/admin/escrow/export" className="ms-btn ms-btn--ghost ms-btn--sm">
              Export ledger
            </a>
          }
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 170px 130px 120px 130px",
              gap: 14,
              padding: "12px 20px",
              borderBottom: "1px solid hsl(var(--border))",
              background: "hsl(var(--canvas))",
            }}
          >
            {["Campaign", "Creator", "Held", "Stages left", "State"].map((h) => (
              <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                {h}
              </span>
            ))}
          </div>
          {data.largest.map((h, i) => (
            <div
              key={h.slug}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 170px 130px 120px 130px",
                gap: 14,
                padding: "13px 20px",
                borderBottom: i === data.largest.length - 1 ? undefined : "1px solid hsl(var(--border))",
                alignItems: "center",
              }}
            >
              <Link href={`/campaigns/${h.slug}`} style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {h.campaign}
              </Link>
              <span style={{ fontSize: 13 }}>{h.creator}</span>
              <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                {h.held}
              </span>
              <span className="numeric" style={{ fontSize: 13 }}>
                {h.stagesLeft}
              </span>
              {h.disputed ? <Badge variant="destructive">Disputed</Badge> : <StatusBadge status="live" />}
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

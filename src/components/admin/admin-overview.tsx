import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { AdminOverviewData } from "@/lib/view-models";

export function AdminOverview({ data }: { data: AdminOverviewData }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
      <div style={{ padding: "32px 40px 56px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Platform
            </div>
            <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
              Overview
            </h2>
          </div>
          <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {data.generatedAt}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {data.stats.map((s) => (
            <div
              key={s.label}
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-lg)",
                background: "hsl(var(--surface))",
                boxShadow: "var(--shadow-xs)",
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                {s.label}
              </span>
              <span className="numeric" style={{ fontSize: 26, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.01em" }}>
                {s.value}
              </span>
              <span
                className="numeric"
                style={{ fontSize: 13, color: s.destructive ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}
              >
                {s.meta}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
            Queues
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
            {data.queues.map((q) => (
              <Link
                key={q.key}
                href={q.href}
                style={{
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius-lg)",
                  background: "hsl(var(--surface))",
                  boxShadow: "var(--shadow-xs)",
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  textDecoration: "none",
                  color: "hsl(var(--foreground))",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
                  <Icon name={q.icon} size={16} style={{ width: 16, height: 16 }} />
                  <span className="eyebrow">{q.label}</span>
                </span>
                <span className="numeric" style={{ fontSize: 30, lineHeight: 1, fontWeight: 600, letterSpacing: "-0.01em" }}>
                  {q.count}
                </span>
                <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                  {q.meta}
                </span>
                <Badge variant={q.badgeVariant}>{q.badge}</Badge>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20 }}>
            <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: 0 }}>
              Last actions taken
            </h3>
            <Link href="/admin/audit" style={{ fontSize: 13 }}>
              Full audit log
            </Link>
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 150px 1fr 130px",
                gap: 14,
                padding: "12px 20px",
                borderBottom: "1px solid hsl(var(--border))",
                background: "hsl(var(--canvas))",
              }}
            >
              {["Time", "Moderator", "Action", "Amount"].map((h) => (
                <span key={h} style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>
                  {h}
                </span>
              ))}
            </div>
            {data.lastActions.map((row, i) => (
              <div
                key={row.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 150px 1fr 130px",
                  gap: 14,
                  padding: "13px 20px",
                  borderBottom: i === data.lastActions.length - 1 ? undefined : "1px solid hsl(var(--border))",
                  alignItems: "center",
                }}
              >
                <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                  {row.time}
                </span>
                <span style={{ fontSize: 13 }}>{row.moderator}</span>
                <span style={{ fontSize: 13 }}>{row.action}</span>
                <span
                  className="numeric"
                  style={{
                    fontSize: 13,
                    fontWeight: row.amount === "—" ? 400 : 600,
                    color: row.amount === "—" ? "hsl(var(--muted-foreground))" : undefined,
                  }}
                >
                  {row.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminTriageMobile({ data }: { data: AdminOverviewData }) {
  const { triage } = data;
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Platform
        </div>
        <h3 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
          Triage
        </h3>
      </div>

      {triage.banner && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            border: "1px solid hsl(var(--destructive))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
          }}
        >
          <span style={{ color: "hsl(var(--destructive))", display: "flex", flexShrink: 0 }}>
            <Icon name="alert-triangle" size={16} style={{ width: 16, height: 16 }} />
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{triage.banner.title}</span>
            <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
              {triage.banner.meta}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {triage.counts.map((c) => (
          <div
            key={c.label}
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius-lg)",
              background: "hsl(var(--surface))",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              {c.label}
            </span>
            <span className="numeric" style={{ fontSize: 24, lineHeight: 1.1, fontWeight: 600 }}>
              {c.value}
            </span>
          </div>
        ))}
      </div>

      <h4 className="font-display" style={{ fontSize: 21, lineHeight: 1.3, letterSpacing: "-0.010em", fontWeight: 600, margin: "4px 0 0" }}>
        Needs you first
      </h4>
      {triage.needsYouFirst.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14, color: "hsl(var(--muted-foreground))" }}>Nothing is at or past its deadline.</p>
      ) : (
        <div
          style={{
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
            overflow: "hidden",
          }}
        >
          {triage.needsYouFirst.map((item, i) => (
            <div
              key={item.id}
              style={{
                padding: 16,
                borderBottom: i === triage.needsYouFirst.length - 1 ? undefined : "1px solid hsl(var(--border))",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="numeric" style={{ fontSize: 13, fontWeight: 600 }}>
                  {item.id}
                </span>
                <Badge variant="destructive">{item.badge}</Badge>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{item.title}</span>
              <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                {item.meta}
              </span>
              <Link
                href={`/admin/disputes/${item.slug}`}
                className="ms-btn ms-btn--primary ms-btn--md"
                style={{ width: "100%", marginTop: 4, textAlign: "center" }}
              >
                Open case
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

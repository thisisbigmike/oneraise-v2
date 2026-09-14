import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { DecisionPanel } from "@/components/admin/decision-panel";
import { decideDispute } from "@/server/actions/admin";
import type { DisputeCaseDetail, DisputeStatus } from "@/lib/view-models";

const STATUS_VARIANT: Record<DisputeStatus, Parameters<typeof Badge>[0]["variant"]> = {
  Breaching: "destructive",
  "In review": "warning",
  "Awaiting creator": "outline",
  New: "neutral",
  Resolved: "funded",
};

function Section({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
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
        {meta && (
          <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
            {meta}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Resolution({ detail }: { detail: DisputeCaseDetail }) {
  const r = detail.resolution!;
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "hsl(var(--secondary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "hsl(var(--primary))",
            flexShrink: 0,
          }}
        >
          <Icon name="check" size={14} style={{ width: 14, height: 14 }} />
        </span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{r.decision}</span>
      </div>
      <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
        {r.decidedBy} · {r.decidedDate}
      </span>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{r.reason}</p>
      <span style={{ fontSize: 12, lineHeight: 1.45, color: "hsl(var(--muted-foreground))" }}>
        Decisions cannot be edited, only superseded by a new entry in the audit log.
      </span>
    </div>
  );
}

function Decision({ detail }: { detail: DisputeCaseDetail }) {
  return (
    <DecisionPanel
      title="Decision"
      options={detail.options}
      action={decideDispute}
      hidden={{ dispute: detail.disputeId }}
      destructiveValues={["refund"]}
      reasonLabel="Reason, recorded in the audit log"
      reasonPlaceholder="What the evidence does and doesn't show against the published terms, and what you're asking for."
      footNote="Both parties are notified with this reason attached. Decisions cannot be edited, only superseded."
      confirmFootNote="Both parties have been notified with this reason attached."
    />
  );
}

export function DisputeCaseView({ detail }: { detail: DisputeCaseDetail }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
      <div style={{ padding: "28px 40px 56px", display: "flex", flexDirection: "column", gap: 24 }}>
        <Link
          href="/admin/disputes"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "hsl(var(--muted-foreground))", width: "fit-content" }}
        >
          <Icon name="arrow-left" size={14} style={{ width: 14, height: 14 }} />
          All disputes
        </Link>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="eyebrow numeric" style={{ color: "hsl(var(--muted-foreground))" }}>
                Case {detail.id}
              </span>
              <Badge variant={STATUS_VARIANT[detail.status]}>{detail.status}</Badge>
            </div>
            <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
              {detail.title}
            </h2>
            <span className="numeric" style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
              <Link href={`/campaigns/${detail.campaignSlug}`}>{detail.campaign}</Link> · {detail.creator} · opened {detail.openedDate}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end", flexShrink: 0 }}>
            <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
              Decide within
            </span>
            <span className="numeric font-display" style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.014em" }}>
              {detail.decideWithin}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
            <Section title="What the creator submitted" meta={detail.submission.date}>
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {detail.submission.evidence.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {detail.submission.evidence.map((caption, i) => (
                      <ImagePlaceholder key={`${caption}-${i}`} caption={caption} style={{ width: "100%", height: 130 }} />
                    ))}
                  </div>
                )}
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{detail.submission.note}</p>
                {detail.submission.document && (
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
                    <span style={{ color: "hsl(var(--muted-foreground))", display: "flex", flexShrink: 0 }}>
                      <Icon name="file-text" size={16} style={{ width: 16, height: 16 }} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{detail.submission.document}</span>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 6, borderTop: "1px solid hsl(var(--border))" }}>
                  <span className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Terms, as published
                  </span>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{detail.submission.termsNote}</p>
                </div>
              </div>
            </Section>

            <Section title="What the donors said" meta={`${detail.disputingTotal} of ${detail.totalCampaignDonors} donors`}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {detail.donorComplaints.map((c, i) => (
                  <div key={`${c.name}-${i}`} style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))", display: "flex", gap: 14 }}>
                    <Avatar initials={c.initials} size={32} fontSize={12} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                        <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                          {c.pledged} donated · {c.date}
                        </span>
                      </span>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{c.note}</p>
                    </div>
                  </div>
                ))}
                {detail.moreDisputesNote && (
                  <div style={{ padding: "14px 20px", background: "hsl(var(--canvas))" }}>
                    <span className="numeric" style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                      {detail.moreDisputesNote}
                    </span>
                  </div>
                )}
              </div>
            </Section>

            {detail.creatorResponse ? (
              <Section title="Creator's response">
                <div style={{ padding: "16px 20px", display: "flex", gap: 14 }}>
                  <Avatar initials={detail.creatorInitials} size={32} fontSize={12} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{detail.creator}</span>
                      <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
                        {detail.creatorResponse.date}
                      </span>
                    </span>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{detail.creatorResponse.note}</p>
                  </div>
                </div>
              </Section>
            ) : (
              <div
                style={{
                  border: "1px dashed hsl(var(--input))",
                  borderRadius: "var(--radius-lg)",
                  background: "hsl(var(--canvas))",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Icon name="clock" size={14} style={{ width: 14, height: 14, color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{detail.creator} hasn&apos;t responded yet.</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Section title="Money at stake">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {detail.money.map((row, i) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "13px 20px",
                      borderBottom: i === detail.money.length - 1 ? undefined : "1px solid hsl(var(--border))",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{row.label}</span>
                    <span className="numeric" style={{ fontSize: 14, fontWeight: 600 }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            {detail.resolution ? (
              <Section title="Decision">
                <Resolution detail={detail} />
              </Section>
            ) : (
              <Decision detail={detail} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DisputeCaseMobile({ detail }: { detail: DisputeCaseDetail }) {
  const objection = detail.donorComplaints[1] ?? detail.donorComplaints[0];
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Badge variant={STATUS_VARIANT[detail.status]}>{detail.status}</Badge>
          <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
            Decide within {detail.decideWithin}
          </span>
        </div>
        <h3 className="font-display" style={{ fontSize: 24, lineHeight: 1.25, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
          {detail.title}
        </h3>
        <span className="numeric" style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
          {detail.campaign} · {detail.money[0].value} held
        </span>
      </div>

      <div style={{ border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-lg)", background: "hsl(var(--surface))", overflow: "hidden" }}>
        <span className="eyebrow" style={{ display: "block", padding: "14px 16px 8px", color: "hsl(var(--muted-foreground))" }}>
          Creator&apos;s evidence
        </span>
        {detail.submission.evidence.length > 0 && (
          <div style={{ padding: "0 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {detail.submission.evidence.slice(0, 2).map((caption, i) => (
              <ImagePlaceholder key={`${caption}-${i}`} caption={caption} style={{ width: "100%", height: 96 }} />
            ))}
          </div>
        )}
        <p style={{ margin: 0, padding: "0 16px 16px", fontSize: 13, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>
          {detail.submission.note}
        </p>
      </div>

      {objection && (
        <div style={{ border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-lg)", background: "hsl(var(--surface))", overflow: "hidden" }}>
          <span className="eyebrow" style={{ display: "block", padding: "14px 16px 8px", color: "hsl(var(--muted-foreground))" }}>
            The objection
          </span>
          <p style={{ margin: 0, padding: "0 16px 16px", fontSize: 13, lineHeight: 1.6, color: "hsl(var(--muted-foreground))" }}>{objection.note}</p>
        </div>
      )}

      {detail.resolution ? (
        <div style={{ border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-lg)", background: "hsl(var(--surface))" }}>
          <Resolution detail={detail} />
        </div>
      ) : (
        <Decision detail={detail} />
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { DisputeCaseView, DisputeCaseMobile } from "@/components/admin/dispute-case";
import { Icon } from "@/components/ui/icon";
import { requireViewer } from "@/server/auth";
import { getDisputeCase } from "@/server/queries/admin";

export async function generateMetadata({ params }: { params: Promise<{ caseId: string }> }): Promise<Metadata> {
  const { caseId } = await params;
  return { title: `Case ${caseId.toUpperCase()} | OneRaise Admin` };
}

export default async function AdminDisputeCasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const viewer = await requireViewer(`/admin/disputes/${caseId}`, ["admin"]);
  const detail = await getDisputeCase(caseId);
  if (!detail) notFound();

  const mobileTopBar = (
    <div
      style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid hsl(var(--border))",
        background: "hsl(var(--surface))",
        flexShrink: 0,
      }}
    >
      <Link href="/admin/disputes" aria-label="Back" className="ms-btn ms-btn--ghost ms-btn--icon" style={{ marginLeft: -8 }}>
        <Icon name="arrow-left" size={16} style={{ width: 16, height: 16 }} />
      </Link>
      <span className="numeric" style={{ fontSize: 15, fontWeight: 600 }}>
        Case {detail.id}
      </span>
      <span style={{ width: 40 }} />
    </div>
  );

  return (
    <AdminShell
      active="disputes"
      title={`Case ${detail.id}`}
      viewer={viewer}
      mobileTopBar={mobileTopBar}
      mobileContent={<DisputeCaseMobile detail={detail} />}
    >
      <DisputeCaseView detail={detail} />
    </AdminShell>
  );
}

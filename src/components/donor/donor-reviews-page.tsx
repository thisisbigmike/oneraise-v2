"use client";

import { useCallback, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { FormSuccess } from "@/components/ui/form-status";
import { DonorShell, type ShellAccount } from "@/components/donor/donor-shell";
import { ReviewDrawer, ReviewQueueRow } from "@/components/donor/review-queue";
import type { ReviewQueueItem } from "@/lib/view-models";

function Body({
  queue,
  openReview,
  notice,
  compact,
}: {
  queue: ReviewQueueItem[];
  openReview: (id: string) => void;
  notice: string | null;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 16 : 24,
        flex: 1,
        padding: compact ? "20px 20px 28px" : "32px 40px 56px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
          Donor
        </div>
        <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
          Needs your review
        </h2>
      </div>
      {notice && <FormSuccess message={notice} />}
      {queue.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
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
            <Icon name="check" size={16} style={{ width: 16, height: 16 }} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Nothing needs your review right now</span>
        </div>
      ) : compact ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {queue.map((item) => (
            <ReviewQueueRow key={item.id} item={item} onReview={() => openReview(item.id)} mobile />
          ))}
        </div>
      ) : (
        <div
          style={{
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius-lg)",
            background: "hsl(var(--surface))",
            boxShadow: "var(--shadow-xs)",
            overflow: "hidden",
          }}
        >
          {queue.map((item, i) => (
            <div key={item.id} style={{ borderBottom: i === queue.length - 1 ? undefined : "1px solid hsl(var(--border))" }}>
              <ReviewQueueRow item={item} onReview={() => openReview(item.id)} />
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(var(--muted-foreground))" }}>
        <Icon name="clock" size={14} style={{ width: 14, height: 14 }} />
        <span style={{ fontSize: 12, lineHeight: 1.4 }}>No response counts as approval. A milestone releases when its window closes.</span>
      </div>
    </div>
  );
}

export function DonorReviewsPage({ account, queue }: { account: ShellAccount; queue: ReviewQueueItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const openItem = queue.find((q) => q.id === openId) ?? null;
  const onDone = useCallback((message: string) => {
    setOpenId(null);
    setNotice(message);
  }, []);

  return (
    <>
      <DonorShell
        active="reviews"
        account={account}
        reviewCount={queue.length}
        desktop={<Body queue={queue} openReview={setOpenId} notice={notice} />}
        mobile={<Body queue={queue} openReview={setOpenId} notice={notice} compact />}
      />
      {openItem && <ReviewDrawer key={openItem.id} item={openItem} onClose={() => setOpenId(null)} onDone={onDone} />}
    </>
  );
}

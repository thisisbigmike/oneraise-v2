"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { SubmitButton } from "@/components/ui/form-status";
import { DonorShell, type ShellAccount } from "@/components/donor/donor-shell";
import { toggleFollow } from "@/server/actions/public";
import type { FollowedCreator } from "@/lib/view-models";

function UnfollowButton({ creatorId, compact }: { creatorId: number; compact?: boolean }) {
  const [, action] = useActionState(toggleFollow, {});
  return (
    <form action={action} style={{ flexShrink: 0, width: compact ? "100%" : undefined }}>
      <input type="hidden" name="creator" value={creatorId} />
      <SubmitButton className="ms-btn ms-btn--ghost ms-btn--sm" style={{ width: compact ? "100%" : undefined }} pendingLabel="Unfollowing…">
        Unfollow
      </SubmitButton>
    </form>
  );
}

function CreatorRow({ creator, compact }: { creator: FollowedCreator; compact?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: compact ? "flex-start" : "center",
        gap: 16,
        padding: compact ? 16 : 20,
        flexDirection: compact ? "column" : "row",
        border: compact ? "1px solid hsl(var(--border))" : undefined,
        borderRadius: compact ? "var(--radius-lg)" : undefined,
        background: compact ? "hsl(var(--surface))" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: compact ? undefined : 1, minWidth: 0 }}>
        <Avatar initials={creator.initials} size={40} fontSize={13} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{creator.name}</span>
          <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {creator.location} · {creator.campaignsCount} campaign
            {creator.campaignsCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
          width: compact ? "100%" : undefined,
          justifyContent: compact ? "space-between" : undefined,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: compact ? "flex-start" : "flex-end" }}>
          {creator.latestSlug ? (
            <Link href={`/campaigns/${creator.latestSlug}`} style={{ fontSize: 13 }}>
              {creator.latestTitle}
            </Link>
          ) : (
            <span style={{ fontSize: 13 }}>{creator.latestTitle}</span>
          )}
          {creator.latestSlug && <StatusBadge status={creator.latestStatus} />}
        </div>
      </div>
      <UnfollowButton creatorId={creator.id} compact={compact} />
    </div>
  );
}

function Body({ creators, compact }: { creators: FollowedCreator[]; compact?: boolean }) {
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
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="eyebrow" style={{ color: "hsl(var(--muted-foreground))" }}>
            Donor
          </div>
          <h2 className="font-display" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.014em", fontWeight: 600, margin: 0 }}>
            Following
          </h2>
        </div>
        {!compact && (
          <Link href="/discover" style={{ fontSize: 13 }}>
            Find more creators
          </Link>
        )}
      </div>

      {creators.length === 0 ? (
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
          <span style={{ fontSize: 15, fontWeight: 600 }}>You&apos;re not following anyone yet</span>
          <Link href="/discover" style={{ fontSize: 13, marginLeft: "auto" }}>
            Discover campaigns
          </Link>
        </div>
      ) : compact ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {creators.map((c) => (
            <CreatorRow key={c.id} creator={c} compact />
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
          {creators.map((c, i) => (
            <div key={c.id} style={{ borderBottom: i === creators.length - 1 ? undefined : "1px solid hsl(var(--border))" }}>
              <CreatorRow creator={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DonorFollowingPage({
  account,
  creators,
  reviewCount,
}: {
  account: ShellAccount;
  creators: FollowedCreator[];
  reviewCount: number;
}) {
  return (
    <DonorShell
      active="following"
      account={account}
      reviewCount={reviewCount}
      desktop={<Body creators={creators} />}
      mobile={<Body creators={creators} compact />}
    />
  );
}

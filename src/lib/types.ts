export type MilestoneState = "pending" | "active" | "released" | "disputed";

export interface Milestone {
  label: string;
  state: MilestoneState;
  statusLabel: string;
  amount: string;
  /** Colour of the connector rail leaving this node (desktop track only). */
  barState?: MilestoneState;
}

export type CampaignStatus = "live" | "funded" | "expiring" | "failed" | "refunded" | "draft" | "paused";

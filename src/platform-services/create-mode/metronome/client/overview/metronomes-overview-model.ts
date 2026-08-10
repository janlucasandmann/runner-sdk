export type MetronomeOverviewStatus =
  | "active"
  | "default"
  | "draft"
  | "paused"
  | "removed"
  | "shared";

export interface MetronomeOverviewRow {
  id: string;
  name: string;
  searchText?: string;
  status: MetronomeOverviewStatus;
  statusLabel: string;
  statusRank: number;
  triggerLabel: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  ownerFallback?: string;
  /** @deprecated Transitional compatibility for previously loaded overview bundles. */
  creatorName?: string;
  /** @deprecated Transitional compatibility for previously loaded overview bundles. */
  creatorAvatarUrl?: string;
  /** @deprecated Transitional compatibility for previously loaded overview bundles. */
  creatorFallback?: string;
  lastRunAt?: number;
  sortTimestamp?: number;
  lastRunLabel: string;
  lastRunTitle?: string;
  runsToday: number;
  waitingApprovals: number;
  isBuiltIn?: boolean;
  isTeamShared?: boolean;
  isHiddenTeamShared?: boolean;
  canEditShared?: boolean;
}

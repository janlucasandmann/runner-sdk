export type MetronomeOverviewStatus =
  | "active"
  | "default"
  | "draft"
  | "paused"
  | "removed"
  | "shared";

export type MetronomeOverviewVisualKind =
  | "metronome"
  | "loop"
  | "mission-control";

export interface MetronomeOverviewRow {
  id: string;
  name: string;
  description: string;
  searchText?: string;
  status: MetronomeOverviewStatus;
  statusLabel: string;
  statusRank: number;
  triggerLabel: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  ownerFallback?: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  creatorFallback?: string;
  updatedAt: number;
  lastRunAt?: number;
  sortTimestamp?: number;
  lastRunLabel: string;
  lastRunTitle?: string;
  runsToday: number;
  waitingApprovals: number;
  visualKind?: MetronomeOverviewVisualKind;
  isBuiltIn?: boolean;
  isTeamShared?: boolean;
  isHiddenTeamShared?: boolean;
  canEditShared?: boolean;
}

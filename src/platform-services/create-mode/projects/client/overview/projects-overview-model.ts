import type { ReactNode } from "react";

export type ProjectOverviewStatus =
  | "backlog"
  | "in_progress"
  | "on_track"
  | "at_risk"
  | "blocked"
  | "completed";

export interface ProjectOverviewRow {
  id: string;
  name: string;
  description?: string;
  searchText?: string;
  icon?: ReactNode;
  projectTypeLabel?: string;
  status: ProjectOverviewStatus;
  statusLabel: string;
  statusRank: number;
  ownerName: string;
  ownerAvatarUrl?: string;
  ownerFallback?: string;
  updatedAt?: number;
  updatedLabel: string;
  updatedTitle?: string;
  source?: unknown;
}

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
  ResourceOverviewAnalyticsModel,
  ResourceOverviewPeriod,
} from "../../../../../platform-ui/pages/overview/index.js";

export type DevelopResourceKind =
  | "web_app"
  | "api"
  | "function"
  | "database"
  | "auth"
  | "agent_runtime"
  | "voice_agent"
  | "secrets"
  | "payments";

export type DevelopResourceMetricKey =
  | "hostingRequests"
  | "apiRequests"
  | "functionCalls"
  | "databaseReads"
  | "databaseWrites"
  | "agentRuntimeRuns"
  | "voiceCalls"
  | "voiceMinutes"
  | "secretReads"
  | "authEvents"
  | "paymentCheckoutSessions"
  | "computeTokens"
  | "resources"
  | "errors";

export interface DevelopResourceMetricDefinition {
  id: string;
  key: DevelopResourceMetricKey;
  label: string;
  color: string;
}

export interface DevelopResourceDefinition {
  kind: DevelopResourceKind;
  singular: string;
  plural: string;
  resourceCountKey: string;
  documentationPath: string;
  icon: LucideIcon;
  activityMetrics: readonly DevelopResourceMetricDefinition[];
}

export interface DevelopResourceOperationalSeries {
  id?: string;
  label?: string;
  total?: number;
  values?: readonly number[];
}

export interface DevelopResourceOperationalMetrics {
  labels?: readonly string[];
  scopeKind?: string;
  period?: ResourceOverviewPeriod;
  resourceCount?: number;
  resourceCounts?: Readonly<Record<string, number>>;
  series?: Partial<Record<DevelopResourceMetricKey, readonly number[]>>;
  totals?: Partial<Record<DevelopResourceMetricKey, number>>;
  topResourceSeries?: Partial<Record<DevelopResourceMetricKey, readonly DevelopResourceOperationalSeries[]>>;
}

export interface DevelopResourceOverviewRow {
  id: string;
  sourceId: string;
  resourceType: "server" | "database";
  kind: DevelopResourceKind;
  name: string;
  description: string;
  typeLabel: string;
  published: boolean;
  createdAt: number;
  createdLabel: string;
  createdTitle?: string;
  lastUsedAt: number;
  lastUsedLabel: string;
  lastUsedTitle?: string;
  searchText: string;
  isDraft?: boolean;
}

export interface DevelopResourceDateFormatters {
  formatDate?: (value: string) => string;
  formatExactDate?: (value: string) => string;
}

export interface DevelopResourceOverviewAnalyticsOptions {
  resourceCount?: number;
  publishedCount?: number;
  loading?: boolean;
  error?: string;
}

export interface DevelopResourceOverviewServicePageProps {
  rows: readonly DevelopResourceOverviewRow[];
  period: ResourceOverviewPeriod;
  onPeriodChange: (period: ResourceOverviewPeriod) => void;
  operationalMetrics?: DevelopResourceOperationalMetrics | null;
  analytics?: ResourceOverviewAnalyticsModel;
  analyticsLoading?: boolean;
  analyticsError?: string;
  controlsPortalId?: string;
  loading?: boolean;
  mutating?: boolean;
  headerActions?: ReactNode;
  onOpen: (row: DevelopResourceOverviewRow) => void;
  onCreate?: () => void;
  onRename?: (row: DevelopResourceOverviewRow) => void;
  onCopy?: (row: DevelopResourceOverviewRow) => void;
  onDelete?: (rows: readonly DevelopResourceOverviewRow[]) => void;
  onPrefetch?: (row: DevelopResourceOverviewRow) => void;
}

export interface DevelopResourceOverviewSurfaceProps extends DevelopResourceOverviewServicePageProps {
  definition: DevelopResourceDefinition;
}

export interface DevelopResourceOverviewRouteProps extends DevelopResourceOverviewServicePageProps {
  kind: Exclude<DevelopResourceKind, "voice_agent">;
}

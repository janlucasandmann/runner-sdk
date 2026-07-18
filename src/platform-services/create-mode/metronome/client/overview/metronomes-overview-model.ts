import type {
  ResourceOverviewAnalyticsModel,
  ResourceOverviewPeriod,
} from "../../../../../platform-ui/pages/overview/index.js";

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
  creatorName: string;
  creatorAvatarUrl?: string;
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

interface CreateMetronomesOverviewAnalyticsOptions {
  rows: readonly MetronomeOverviewRow[];
  period: ResourceOverviewPeriod;
  loading?: boolean;
  error?: string | null;
  now?: Date;
}

interface AnalyticsBucket {
  start: Date;
  end: Date;
  label: string;
}

function positiveInteger(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

function formatCount(value: number): string {
  return positiveInteger(value).toLocaleString("en-US");
}

function createAnalyticsBuckets(period: ResourceOverviewPeriod, now: Date): AnalyticsBucket[] {
  const count = period === "day" ? 24 : period === "week" ? 7 : 30;
  const first = new Date(now);
  first.setMinutes(0, 0, 0);
  if (period !== "day") {
    first.setHours(0, 0, 0, 0);
    first.setDate(first.getDate() - (count - 1));
  } else {
    first.setHours(0, 0, 0, 0);
  }

  return Array.from({ length: count }, (_value, index) => {
    const start = new Date(first);
    if (period === "day") start.setHours(first.getHours() + index);
    else start.setDate(first.getDate() + index);
    const end = new Date(start);
    if (period === "day") end.setHours(start.getHours() + 1);
    else end.setDate(start.getDate() + 1);
    return {
      start,
      end,
      label:
        period === "day"
          ? start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
          : start.toLocaleDateString(
              undefined,
              period === "week" ? { weekday: "short" } : { month: "short", day: "numeric" },
            ),
    };
  });
}

export function createMetronomesOverviewAnalytics({
  rows,
  period,
  loading = false,
  error = null,
  now = new Date(),
}: CreateMetronomesOverviewAnalyticsOptions): ResourceOverviewAnalyticsModel {
  const visibleRows = rows.filter((row) => !row.isHiddenTeamShared);
  const buckets = createAnalyticsBuckets(period, now);
  const activityValues = buckets.map(() => 0);

  for (const row of visibleRows) {
    const lastRunAt = Number(row.lastRunAt);
    if (!Number.isFinite(lastRunAt) || lastRunAt <= 0) continue;
    const bucketIndex = buckets.findIndex(
      (bucket) => lastRunAt >= bucket.start.getTime() && lastRunAt < bucket.end.getTime(),
    );
    if (bucketIndex >= 0) activityValues[bucketIndex] += 1;
  }

  const activeCount = visibleRows.filter((row) => row.status === "active").length;
  const runsToday = visibleRows.reduce((total, row) => total + positiveInteger(row.runsToday), 0);
  const waitingApprovals = visibleRows.reduce(
    (total, row) => total + positiveInteger(row.waitingApprovals),
    0,
  );

  return {
    title: "Metronome activity",
    ariaLabel: "Metronome workflow activity over time",
    loading,
    error: error || undefined,
    metrics: [
      {
        id: "workflows",
        label: "Metronomes",
        value: formatCount(visibleRows.length),
        color: "#8fc4ff",
      },
      {
        id: "active",
        label: "Active",
        value: formatCount(activeCount),
        color: "#7effff",
      },
      {
        id: "runs-today",
        label: "Runs today",
        value: formatCount(runsToday),
        color: "#4da3ff",
      },
      {
        id: "waiting-approvals",
        label: "Waiting approvals",
        value: formatCount(waitingApprovals),
        color: "#6750ff",
      },
    ],
    labels: buckets.map((bucket) => bucket.label),
    series: [
      {
        id: "workflow-activity",
        label: "Workflows run",
        values: activityValues,
        color: "#7effff",
        type: "line",
        valueKind: "count",
      },
    ],
  };
}

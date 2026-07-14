import type { ReactNode } from "react";
import type { PlatformDataTableProps } from "../../components/composite/data-table/index.js";

export type ResourceOverviewPeriod = "day" | "week" | "month";
export type ResourceOverviewSeriesType = "bar" | "line";
export type ResourceOverviewValueKind = "count" | "currency" | "duration" | "percent";

export interface ResourceOverviewPeriodOption {
  id: ResourceOverviewPeriod;
  label: string;
}

export interface ResourceOverviewMetric {
  id: string;
  label: string;
  value: ReactNode;
  color?: string;
}

export interface ResourceOverviewSeries {
  id: string;
  label: string;
  values: readonly number[];
  color: string;
  type?: ResourceOverviewSeriesType;
  stack?: string;
  valueKind?: ResourceOverviewValueKind;
  fill?: boolean;
}

export interface ResourceOverviewAnalyticsModel {
  metrics: readonly ResourceOverviewMetric[];
  labels: readonly string[];
  series: readonly ResourceOverviewSeries[];
  title?: string;
  ariaLabel?: string;
  loading?: boolean;
  error?: ReactNode;
  emptyState?: ReactNode;
}

export interface ResourceOverviewPageProps<TData> {
  title: ReactNode;
  period: ResourceOverviewPeriod;
  onPeriodChange: (period: ResourceOverviewPeriod) => void;
  analytics: ResourceOverviewAnalyticsModel;
  table: PlatformDataTableProps<TData>;
  periodOptions?: readonly ResourceOverviewPeriodOption[];
  headerActions?: ReactNode;
  className?: string;
}

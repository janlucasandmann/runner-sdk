import type { ReactNode } from "react";

export type PlatformAnalyticsChartType = "bar" | "line";
export type PlatformAnalyticsValueKind = "count" | "currency" | "duration" | "percent" | "tokens";
export type PlatformAnalyticsAxis = "primary" | "secondary";
export type PlatformAnalyticsSectionVariant = "default" | "framed";

export interface PlatformAnalyticsMetric {
  id: string;
  label: string;
  value: ReactNode;
  color?: string;
}

export interface PlatformAnalyticsSeries {
  id: string;
  label: string;
  values: readonly number[];
  color: string;
  type?: PlatformAnalyticsChartType;
  axis?: PlatformAnalyticsAxis;
  stack?: string;
  valueKind?: PlatformAnalyticsValueKind;
  fill?: boolean;
}

export interface PlatformAnalyticsModel {
  metrics: readonly PlatformAnalyticsMetric[];
  labels: readonly string[];
  series: readonly PlatformAnalyticsSeries[];
  title?: string;
  ariaLabel?: string;
  loading?: boolean;
  error?: ReactNode;
  emptyState?: ReactNode;
}

export interface PlatformAnalyticsChartProps {
  analytics: PlatformAnalyticsModel;
  chartType?: PlatformAnalyticsChartType;
}

export interface PlatformAnalyticsSectionProps extends PlatformAnalyticsChartProps {
  className?: string;
  variant?: PlatformAnalyticsSectionVariant;
  title?: ReactNode;
  headerActions?: ReactNode;
  chartContent?: ReactNode;
}

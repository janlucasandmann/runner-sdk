import type { ReactNode } from "react";
import type { PlatformSwitchOption } from "../../ui/switch/index.js";

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
  hasData?: boolean;
  loading?: boolean;
  error?: ReactNode;
}

export interface PlatformAnalyticsChartProps {
  analytics: PlatformAnalyticsModel;
  chartType?: PlatformAnalyticsChartType;
}

export interface PlatformAnalyticsTimeframeControl {
  value: string;
  options: readonly PlatformSwitchOption[];
  onValueChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

export interface PlatformAnalyticsSectionProps extends PlatformAnalyticsChartProps {
  className?: string;
  variant?: PlatformAnalyticsSectionVariant;
  title?: ReactNode;
  timeframe?: PlatformAnalyticsTimeframeControl;
}

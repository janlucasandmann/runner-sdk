import type { ReactNode } from "react";
import type {
  PlatformAnalyticsChartType,
  PlatformAnalyticsMetric,
  PlatformAnalyticsModel,
  PlatformAnalyticsSeries,
  PlatformAnalyticsValueKind,
} from "../../components/composite/analytics/index.js";
import type { PlatformDataTableProps } from "../../components/composite/data-table/index.js";

export type ResourceOverviewPeriod = "day" | "week" | "month";
export type ResourceOverviewSeriesType = PlatformAnalyticsChartType;
export type ResourceOverviewValueKind = PlatformAnalyticsValueKind;

export interface ResourceOverviewPeriodOption {
  id: ResourceOverviewPeriod;
  label: string;
}

export type ResourceOverviewMetric = PlatformAnalyticsMetric;
export type ResourceOverviewSeries = PlatformAnalyticsSeries;
export type ResourceOverviewAnalyticsModel = PlatformAnalyticsModel;

interface ResourceOverviewPageBaseProps<TData> {
  showPeriodSelector?: boolean;
  controlsPortalId?: string;
  table: PlatformDataTableProps<TData>;
  periodOptions?: readonly ResourceOverviewPeriodOption[];
  headerActions?: ReactNode;
  className?: string;
}

interface ResourceOverviewAnalyticsPageProps {
  heroContent?: undefined;
  period: ResourceOverviewPeriod;
  onPeriodChange: (period: ResourceOverviewPeriod) => void;
  analytics: ResourceOverviewAnalyticsModel;
}

interface ResourceOverviewCustomHeroPageProps {
  heroContent: ReactNode;
  period?: ResourceOverviewPeriod;
  onPeriodChange?: (period: ResourceOverviewPeriod) => void;
  analytics?: ResourceOverviewAnalyticsModel;
}

export type ResourceOverviewPageProps<TData> = ResourceOverviewPageBaseProps<TData> & (
  | ResourceOverviewAnalyticsPageProps
  | ResourceOverviewCustomHeroPageProps
);

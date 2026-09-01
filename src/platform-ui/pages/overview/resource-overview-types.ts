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
export type ResourceOverviewRowActionMode = "resource" | "custom";
export type ResourceOverviewPageVariant = "standard" | "analytics-catalog";

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
  periodPortalId?: string;
  table: PlatformDataTableProps<TData>;
  periodOptions?: readonly ResourceOverviewPeriodOption[];
  headerActions?: ReactNode;
  className?: string;
  /**
   * Resource catalogs receive Edit, Duplicate, Share, and Delete by default.
   * Use custom only for non-resource tables with a deliberately specialized
   * action contract, such as API keys.
   */
  rowActionMode?: ResourceOverviewRowActionMode;
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
  | (ResourceOverviewAnalyticsPageProps & {
      /**
       * `analytics-catalog` keeps the analytics/KPI stack as the page header
       * while applying the same full-width catalog table layout used by
       * resource pages such as Workflows.
       */
      variant?: ResourceOverviewPageVariant;
    })
  | (ResourceOverviewCustomHeroPageProps & { variant?: "standard" })
);

export type ResourceOverviewAnalyticsCatalogPageProps<TData> =
  ResourceOverviewPageBaseProps<TData> & ResourceOverviewAnalyticsPageProps;

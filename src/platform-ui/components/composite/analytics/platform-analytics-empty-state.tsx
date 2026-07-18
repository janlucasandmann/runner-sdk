import { ChartColumnIncreasing } from "lucide-react";
import { PlatformEmptyState } from "../empty-state/index.js";

export const PLATFORM_ANALYTICS_EMPTY_STATE_TITLE = "No data available yet";
export const PLATFORM_ANALYTICS_EMPTY_STATE_DESCRIPTION =
  "Analytics will appear here once activity has been recorded.";

export function PlatformAnalyticsEmptyState() {
  return (
    <PlatformEmptyState
      className="platform-analytics-empty-state"
      icon={ChartColumnIncreasing}
      title={PLATFORM_ANALYTICS_EMPTY_STATE_TITLE}
      description={PLATFORM_ANALYTICS_EMPTY_STATE_DESCRIPTION}
    />
  );
}

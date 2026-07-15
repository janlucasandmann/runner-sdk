import { PlatformAnalyticsChart } from "./platform-analytics-chart.js";
import type { PlatformAnalyticsSectionProps } from "./platform-analytics-types.js";

export function PlatformAnalyticsSection({
  analytics,
  chartType = "line",
  className = "",
}: PlatformAnalyticsSectionProps) {
  return (
    <section
      className={`platform-analytics${className ? ` ${className}` : ""}`}
      aria-label={analytics.ariaLabel || analytics.title || "Analytics"}
    >
      <div className="platform-analytics__metrics">
        {analytics.metrics.map((metric) => (
          <div key={metric.id} className="platform-analytics__metric">
            <div className="platform-analytics__metric-label">
              <span className="platform-analytics__metric-dot" style={{ backgroundColor: metric.color || "#fff" }} aria-hidden="true" />
              <span>{metric.label}</span>
            </div>
            <div className="platform-analytics__metric-value">{metric.value}</div>
          </div>
        ))}
      </div>
      <PlatformAnalyticsChart analytics={analytics} chartType={chartType} />
    </section>
  );
}

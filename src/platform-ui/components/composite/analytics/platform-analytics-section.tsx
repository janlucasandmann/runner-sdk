import { PlatformSwitch } from "../../ui/switch/index.js";
import { PlatformAnalyticsChart } from "./platform-analytics-chart.js";
import type { PlatformAnalyticsSectionProps } from "./platform-analytics-types.js";

export function PlatformAnalyticsSection({
  analytics,
  chartType = "line",
  className = "",
  variant = "default",
  title,
  timeframe,
  showChart = true,
  showXAxisLabels = true,
}: PlatformAnalyticsSectionProps) {
  const resolvedTitle = title ?? analytics.title;
  const showTitle = (variant === "framed" || variant === "compact")
    && Boolean(resolvedTitle);
  const hasHeader = showTitle || Boolean(timeframe);

  return (
    <section
      className={`platform-analytics is-${variant}${className ? ` ${className}` : ""}`}
      aria-label={analytics.ariaLabel || analytics.title || (typeof title === "string" ? title : "Analytics")}
      data-platform-analytics-variant={variant}
    >
      {hasHeader ? (
        <div className="platform-analytics__header">
          {showTitle ? <h2 className="platform-analytics__title">{resolvedTitle}</h2> : null}
          {timeframe ? (
            <div className="platform-analytics__header-actions">
              <PlatformSwitch
                value={timeframe.value}
                options={timeframe.options}
                onValueChange={timeframe.onValueChange}
                ariaLabel={timeframe.ariaLabel || "Analytics time frame"}
                className={timeframe.className}
                disabled={timeframe.disabled}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="platform-analytics__metrics">
        {analytics.metrics.map((metric) => (
          <div key={metric.id} className="platform-analytics__metric">
            <div className="platform-analytics__metric-label">
              <span
                className="platform-analytics__metric-dot"
                style={{ backgroundColor: metric.color || "#fff", color: metric.color || "#fff" }}
                aria-hidden="true"
              />
              <span>{metric.label}</span>
            </div>
            <div className="platform-analytics__metric-value">{metric.value}</div>
          </div>
        ))}
      </div>
      {showChart ? (
        <div className="platform-analytics__chart">
          <PlatformAnalyticsChart
            analytics={analytics}
            chartType={chartType}
            compact={variant === "compact"}
            showXAxisLabels={showXAxisLabels}
          />
        </div>
      ) : null}
    </section>
  );
}

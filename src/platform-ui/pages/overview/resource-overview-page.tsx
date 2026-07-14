import { Ellipsis } from "lucide-react";
import type { ReactNode } from "react";
import { PlatformDataTable } from "../../components/composite/data-table/index.js";
import { PlatformSwitch } from "../../components/ui/switch/index.js";
import { ResourceOverviewChart } from "./resource-overview-chart.js";
import type { ResourceOverviewPageProps, ResourceOverviewPeriodOption } from "./resource-overview-types.js";

const DEFAULT_PERIOD_OPTIONS: readonly ResourceOverviewPeriodOption[] = [
  { id: "day", label: "1D" },
  { id: "week", label: "1W" },
  { id: "month", label: "1M" },
];

function renderHeaderActions(actions: ReactNode) {
  if (!actions) return null;
  return <div className="resource-overview-page__header-actions">{actions}</div>;
}

export function ResourceOverviewPage<TData>({
  title,
  period,
  onPeriodChange,
  analytics,
  table,
  periodOptions = DEFAULT_PERIOD_OPTIONS,
  headerActions,
  className = "",
}: ResourceOverviewPageProps<TData>) {
  return (
    <div className={`resource-overview-page${className ? ` ${className}` : ""}`}>
      <header className="resource-overview-page__header">
        <h1 className="resource-overview-page__title">{title}</h1>
        <div className="resource-overview-page__header-controls">
          <PlatformSwitch
            ariaLabel="Analytics time frame"
            value={period}
            options={periodOptions.map((option) => ({ value: option.id, label: option.label }))}
            onValueChange={(value) => {
              const nextPeriod = periodOptions.find((option) => option.id === value);
              if (nextPeriod) onPeriodChange(nextPeriod.id);
            }}
          />
          {renderHeaderActions(headerActions)}
        </div>
      </header>

      <section className="resource-overview-analytics" aria-label={analytics.ariaLabel || "Resource analytics"}>
        <div className="resource-overview-analytics__metrics">
          {analytics.metrics.map((metric) => (
            <div key={metric.id} className="resource-overview-analytics__metric">
              <div className="resource-overview-analytics__metric-label">
                <span className="resource-overview-analytics__metric-dot" style={{ backgroundColor: metric.color || "#fff" }} aria-hidden="true" />
                <span>{metric.label}</span>
              </div>
              <div className="resource-overview-analytics__metric-value">{metric.value}</div>
            </div>
          ))}
        </div>
        <ResourceOverviewChart analytics={analytics} />
      </section>

      <section className="resource-overview-page__table-section">
        <PlatformDataTable<TData>
          {...table}
          surface={table.surface || "plain"}
          layout={table.layout || "fill"}
          pagination={table.pagination === undefined ? {} : table.pagination}
        />
      </section>
    </div>
  );
}

export function ResourceOverviewMenuButton({
  onClick,
  expanded = false,
  label = "Analytics options",
}: {
  onClick: () => void;
  expanded?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`resource-overview-page__menu-button${expanded ? " is-active" : ""}`}
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <Ellipsis width={16} height={16} strokeWidth={1.8} />
    </button>
  );
}

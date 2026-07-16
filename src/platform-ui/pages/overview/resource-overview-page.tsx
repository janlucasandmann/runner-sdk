import { Ellipsis, Plus } from "lucide-react";
import { createElement, isValidElement, useEffect, useState, type ElementType, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PlatformAnalyticsSection } from "../../components/composite/analytics/index.js";
import {
  PlatformDataTable,
  type PlatformDataTableIcon,
  type PlatformDataTablePrimaryAction,
} from "../../components/composite/data-table/index.js";
import { PlatformPrimaryButton } from "../../components/ui/button/index.js";
import { PlatformSwitch } from "../../components/ui/switch/index.js";
import type { ResourceOverviewPageProps, ResourceOverviewPeriodOption } from "./resource-overview-types.js";

const DEFAULT_PERIOD_OPTIONS: readonly ResourceOverviewPeriodOption[] = [
  { id: "day", label: "24H" },
  { id: "week", label: "7D" },
  { id: "month", label: "30D" },
];

function renderHeaderActions(actions: ReactNode) {
  if (!actions) return null;
  return <div className="resource-overview-page__header-actions">{actions}</div>;
}

function useOverviewControlsPortalTarget(portalId: string) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!portalId || typeof document === "undefined") {
      setTarget(null);
      return undefined;
    }

    const nextTarget = document.getElementById(portalId);
    setTarget((current) => current === nextTarget ? current : nextTarget);
    return undefined;
  }, [portalId]);

  return target;
}

function renderActionIcon(icon: PlatformDataTableIcon | undefined): ReactNode {
  const resolvedIcon = icon || Plus;
  if (isValidElement(resolvedIcon)) return resolvedIcon;
  if (typeof resolvedIcon === "string" || typeof resolvedIcon === "number") return resolvedIcon;
  return createElement(resolvedIcon as ElementType, {
    width: 14,
    height: 14,
    strokeWidth: 1.8,
    "aria-hidden": true,
  });
}

function renderPrimaryAction(action: PlatformDataTablePrimaryAction | undefined) {
  if (!action) return null;
  return (
    <PlatformPrimaryButton
      size="small"
      className={action.className}
      disabled={action.disabled}
      onClick={action.onClick}
      aria-label={action.ariaLabel || action.label}
    >
      {renderActionIcon(action.icon)}
      <span>{action.label}</span>
    </PlatformPrimaryButton>
  );
}

export function ResourceOverviewPage<TData>({
  period = "day",
  onPeriodChange = () => undefined,
  analytics,
  heroContent,
  showPeriodSelector = true,
  controlsPortalId = "",
  table,
  periodOptions = DEFAULT_PERIOD_OPTIONS,
  headerActions,
  className = "",
}: ResourceOverviewPageProps<TData>) {
  const primaryAction = table.toolbar?.primaryAction;
  const resolvedTable = primaryAction
    ? { ...table, toolbar: { ...table.toolbar, primaryAction: undefined } }
    : table;
  const hasHeaderControls = showPeriodSelector || Boolean(primaryAction) || Boolean(headerActions);
  const controlsPortalTarget = useOverviewControlsPortalTarget(controlsPortalId);
  const overviewControls = hasHeaderControls && controlsPortalTarget
    ? createPortal(
        <div className="resource-overview-page__controls" data-resource-overview-controls="true">
          {showPeriodSelector ? (
            <PlatformSwitch
              ariaLabel="Analytics time frame"
              value={period}
              options={periodOptions.map((option) => ({ value: option.id, label: option.label }))}
              onValueChange={(value) => {
                const nextPeriod = periodOptions.find((option) => option.id === value);
                if (nextPeriod) onPeriodChange(nextPeriod.id);
              }}
            />
          ) : null}
          {renderPrimaryAction(primaryAction)}
          {renderHeaderActions(headerActions)}
        </div>,
        controlsPortalTarget,
      )
    : null;

  return (
    <>
      {overviewControls}
      <div className={`resource-overview-page${className ? ` ${className}` : ""}`}>
        {heroContent === undefined
          ? <PlatformAnalyticsSection analytics={analytics!} chartType="line" />
          : heroContent}

        <section className="resource-overview-page__table-section">
          <PlatformDataTable<TData>
            {...resolvedTable}
            surface={resolvedTable.surface || "plain"}
            layout={resolvedTable.layout || "fill"}
            variant={resolvedTable.variant || "minimalistic-ui"}
            pagination={resolvedTable.pagination === undefined ? {} : resolvedTable.pagination}
          />
        </section>
      </div>
    </>
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

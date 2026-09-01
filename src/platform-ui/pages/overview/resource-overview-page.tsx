import { Ellipsis, Plus } from "../../components/ui/hugeicons-compat.js";
import {
  createElement,
  isValidElement,
  useLayoutEffect,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { PlatformAnalyticsSection } from "../../components/composite/analytics/index.js";
import {
  PlatformDataTable,
  type PlatformDataTableIcon,
  type PlatformDataTablePrimaryAction,
  type PlatformDataTableRowActionState,
} from "../../components/composite/data-table/index.js";
import { PlatformPrimaryButton } from "../../components/ui/button/index.js";
import { PlatformSwitch } from "../../components/ui/switch/index.js";
import { createResourceOverviewRowActions } from "./resource-overview-actions.js";
import type {
  ResourceOverviewAnalyticsCatalogPageProps,
  ResourceOverviewPageProps,
  ResourceOverviewPeriodOption,
} from "./resource-overview-types.js";

const DEFAULT_PERIOD_OPTIONS: readonly ResourceOverviewPeriodOption[] = [
  { id: "day", label: "24H" },
  { id: "week", label: "7D" },
  { id: "month", label: "30D" },
];

function renderHeaderActions(actions: ReactNode) {
  if (!actions) return null;
  return (
    <div className="resource-overview-page__header-actions">{actions}</div>
  );
}

function useOverviewControlsPortalTarget(portalId: string) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!portalId || typeof document === "undefined") {
      setTarget(null);
      return undefined;
    }

    let disposed = false;
    const resolveTarget = () => {
      if (disposed) return;
      const nextTarget = document.getElementById(portalId);
      setTarget((current) => (current === nextTarget ? current : nextTarget));
    };

    resolveTarget();

    // The app header and routed page are committed together, but navigating
    // from a detail page can briefly leave the portal slot out of the DOM.
    // Observe the document so the action is restored as soon as the header
    // recreates its slot, without requiring a full page remount.
    const Observer = globalThis.MutationObserver;
    const observationRoot = document.documentElement;
    if (Observer && observationRoot) {
      const observer = new Observer(resolveTarget);
      observer.observe(observationRoot, { childList: true, subtree: true });
      return () => {
        disposed = true;
        observer.disconnect();
      };
    }

    return () => {
      disposed = true;
    };
  }, [portalId]);

  return target;
}

function renderActionIcon(icon: PlatformDataTableIcon | undefined): ReactNode {
  const resolvedIcon = icon === undefined ? Plus : icon;
  if (!resolvedIcon) return null;
  if (isValidElement(resolvedIcon)) return resolvedIcon;
  if (typeof resolvedIcon === "string" || typeof resolvedIcon === "number")
    return resolvedIcon;
  return createElement(resolvedIcon as ElementType, {
    width: 14,
    height: 14,
    strokeWidth: 1.8,
    "aria-hidden": true,
  });
}

function renderPrimaryAction(
  action: PlatformDataTablePrimaryAction | undefined,
) {
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
  variant = "standard",
  period = "day",
  onPeriodChange = () => undefined,
  analytics,
  heroContent,
  showPeriodSelector = true,
  controlsPortalId = "",
  periodPortalId = "",
  table,
  periodOptions = DEFAULT_PERIOD_OPTIONS,
  headerActions,
  className = "",
  rowActionMode = "resource",
}: ResourceOverviewPageProps<TData>) {
  const usesAnalyticsCatalog = variant === "analytics-catalog";
  const primaryAction = table.toolbar?.primaryAction;
  const tableWithoutPrimaryAction = primaryAction
    ? { ...table, toolbar: { ...table.toolbar, primaryAction: undefined } }
    : table;
  const sourceGetRowActions = tableWithoutPrimaryAction.getRowActions;
  const resolvedTable = rowActionMode === "custom"
    ? tableWithoutPrimaryAction
    : {
        ...tableWithoutPrimaryAction,
        getRowActions: (
          row: TData,
          state: PlatformDataTableRowActionState<TData>,
        ) =>
          createResourceOverviewRowActions({
            row,
            state,
            actions: sourceGetRowActions?.(row, state) || [],
            onEdit: tableWithoutPrimaryAction.onRowActivate,
            disabled: Boolean(tableWithoutPrimaryAction.isRowDisabled?.(row)),
          }),
      };
  const resolvedTableVariant =
    resolvedTable.variant ||
    (usesAnalyticsCatalog ? "catalog-ui" : "minimalistic-ui");
  const resolvedPagination =
    resolvedTable.pagination === undefined
      ? resolvedTableVariant === "catalog-ui"
        ? false
        : {}
      : resolvedTable.pagination;
  const hasDedicatedPeriodPortal = Boolean(periodPortalId);
  const hasHeaderControls =
    (showPeriodSelector && !hasDedicatedPeriodPortal) ||
    Boolean(primaryAction) ||
    Boolean(headerActions);
  const controlsPortalTarget =
    useOverviewControlsPortalTarget(controlsPortalId);
  const periodPortalTarget = useOverviewControlsPortalTarget(periodPortalId);
  const periodSelector = showPeriodSelector ? (
    <PlatformSwitch
      ariaLabel="Analytics time frame"
      value={period}
      options={periodOptions.map((option) => ({
        value: option.id,
        label: option.label,
      }))}
      onValueChange={(value) => {
        const nextPeriod = periodOptions.find(
          (option) => option.id === value,
        );
        if (nextPeriod) onPeriodChange(nextPeriod.id);
      }}
    />
  ) : null;
  const overviewControls =
    hasHeaderControls && controlsPortalTarget
      ? createPortal(
          <div
            className="resource-overview-page__controls"
            data-resource-overview-controls="true"
          >
            {!hasDedicatedPeriodPortal ? periodSelector : null}
            {renderPrimaryAction(primaryAction)}
            {renderHeaderActions(headerActions)}
          </div>,
          controlsPortalTarget,
        )
      : null;
  const overviewPeriodControl =
    periodSelector && periodPortalTarget
      ? createPortal(
          <div
            className="resource-overview-page__controls resource-overview-page__period-controls"
            data-resource-overview-period-controls="true"
          >
            {periodSelector}
          </div>,
          periodPortalTarget,
        )
      : null;

  return (
    <>
      {overviewControls}
      {overviewPeriodControl}
      <div
        className={`resource-overview-page${
          usesAnalyticsCatalog ? " is-analytics-catalog" : ""
        }${className ? ` ${className}` : ""}`}
        data-resource-overview-page-variant={variant}
      >
        {usesAnalyticsCatalog ? (
          <header
            className="resource-overview-page__analytics-header"
            data-resource-overview-header="analytics"
          >
            <PlatformAnalyticsSection analytics={analytics!} chartType="line" />
          </header>
        ) : heroContent === undefined ? (
          <PlatformAnalyticsSection analytics={analytics!} chartType="line" />
        ) : (
          heroContent
        )}

        <section
          className={`resource-overview-page__table-section${
            resolvedTableVariant === "catalog-ui"
              ? " has-full-bleed-table"
              : ""
          }`}
        >
          <PlatformDataTable<TData>
            {...resolvedTable}
            surface={resolvedTable.surface || "plain"}
            layout={resolvedTable.layout || "fill"}
            variant={resolvedTableVariant}
            pagination={resolvedPagination}
          />
        </section>
      </div>
    </>
  );
}

/**
 * Full-width resource catalog with a KPI/chart header. The table toolbar stays
 * responsible for resource navigation, filtering, and search, so all header
 * controls share the same state as the table they operate on.
 */
export function ResourceOverviewAnalyticsCatalogPage<TData>(
  { table, ...props }: ResourceOverviewAnalyticsCatalogPageProps<TData>,
) {
  return (
    <ResourceOverviewPage<TData>
      {...props}
      variant="analytics-catalog"
      table={{
        ...table,
        variant: "catalog-ui",
        pagination: table.pagination ?? false,
      }}
    />
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

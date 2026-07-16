import { Info } from "lucide-react";
import type { ReactNode } from "react";
import {
  PlatformDataTable,
  type PlatformDataTableColumn,
} from "../../components/composite/data-table/index.js";
import { PlatformSelector } from "../../components/ui/selector/index.js";
import {
  PLATFORM_PERMISSION_ACTION_DEFINITIONS,
  PLATFORM_PERMISSION_RING_DEFINITIONS,
} from "./permission-catalog.js";
import {
  getPlatformPermissionAccessLabel,
  getPlatformPermissionActionAccess,
  getPlatformPermissionActionExplicitAccess,
  getPlatformPermissionActionRingId,
  getPlatformPermissionRingAccess,
  normalizePlatformPermissionAccess,
  PLATFORM_PERMISSION_ACCESS_OPTIONS,
  shouldShowPlatformPermissionAction,
} from "./permission-model.js";
import { PlatformPermissionMiniRingIcon, PlatformPermissionRingsChart } from "./permission-ring-visuals.js";
import type {
  PlatformPermissionAccess,
  PlatformPermissionAccessOption,
  PlatformPermissionActionDefinition,
  PlatformPermissionRingDefinition,
  PlatformPermissionsPageProps,
} from "./permission-types.js";

function PermissionAccessSelect({
  value,
  inheritedAccess = "",
  includeInherit = false,
  accessOptions,
  disabled,
  ariaLabel,
  alignment = "end",
  popupAlignment = "left",
  onChange,
}: {
  value: PlatformPermissionAccess | "";
  inheritedAccess?: PlatformPermissionAccess | "";
  includeInherit?: boolean;
  accessOptions: readonly PlatformPermissionAccessOption[];
  disabled: boolean;
  ariaLabel: string;
  alignment?: "start" | "end";
  popupAlignment?: "left" | "right";
  onChange?: (access: PlatformPermissionAccess) => void;
}) {
  const selectedValue = includeInherit && !value
    ? normalizePlatformPermissionAccess(inheritedAccess, accessOptions)
    : normalizePlatformPermissionAccess(value, accessOptions);
  return (
    <PlatformSelector
      value={selectedValue}
      options={accessOptions.map((option) => ({
        value: option.id,
        label: option.label,
      }))}
      onValueChange={(access) => onChange?.(access)}
      ariaLabel={ariaLabel}
      alignment={alignment}
      popupAlignment={popupAlignment}
      fullWidth
      disabled={disabled}
      className="platform-permissions-page__selector playground-agents-permission-select-shell"
      popupClassName="platform-permissions-page__selector-popup"
    />
  );
}

function PermissionRingSelect({
  value,
  rings,
  disabled,
  ariaLabel,
  onChange,
}: {
  value: string;
  rings: readonly PlatformPermissionRingDefinition[];
  disabled: boolean;
  ariaLabel: string;
  onChange?: (ringId: string) => void;
}) {
  const selectedValue = rings.some((ring) => ring.id === value) ? value : rings[0]?.id || "";
  return (
    <PlatformSelector
      value={selectedValue}
      options={rings.map((ring) => ({
        value: ring.id,
        label: `${ring.label} · ${ring.shortLabel}`,
      }))}
      onValueChange={(ringId) => onChange?.(ringId)}
      ariaLabel={ariaLabel}
      alignment="start"
      fullWidth
      disabled={disabled}
      className="platform-permissions-page__selector playground-agents-permission-select-shell is-ring"
      popupClassName="platform-permissions-page__selector-popup"
    />
  );
}

interface PermissionActionTableRow {
  action: PlatformPermissionActionDefinition;
  label: ReactNode;
  description: ReactNode;
  actionRingId: string;
  inheritedAccess: PlatformPermissionAccess;
  explicitAccess: PlatformPermissionAccess | "";
  effectiveAccess: PlatformPermissionAccess;
}

function PermissionRingTable({
  ring,
  actions,
  permissionSet,
  rings,
  accessOptions,
  actionPresentation,
  disabled,
  showEffectiveAccess,
  onActionRingChange,
  onActionAccessChange,
}: {
  ring: PlatformPermissionRingDefinition;
  actions: readonly PlatformPermissionActionDefinition[];
  permissionSet: PlatformPermissionsPageProps["permissionSet"];
  rings: readonly PlatformPermissionRingDefinition[];
  accessOptions: readonly PlatformPermissionAccessOption[];
  actionPresentation: PlatformPermissionsPageProps["actionPresentation"];
  disabled: boolean;
  showEffectiveAccess: boolean;
  onActionRingChange: PlatformPermissionsPageProps["onActionRingChange"];
  onActionAccessChange: PlatformPermissionsPageProps["onActionAccessChange"];
}) {
  const rows: PermissionActionTableRow[] = actions.map((action) => {
    const actionRingId = getPlatformPermissionActionRingId(permissionSet, action, rings);
    const actionRing = rings.find((candidate) => candidate.id === actionRingId) || rings[0];
    const presentation = actionPresentation?.[action.id];
    return {
      action,
      label: presentation?.label ?? action.label,
      description: presentation?.description ?? action.description,
      actionRingId,
      inheritedAccess: actionRing
        ? getPlatformPermissionRingAccess(permissionSet, actionRing, accessOptions)
        : normalizePlatformPermissionAccess(permissionSet?.defaultAccess, accessOptions),
      explicitAccess: getPlatformPermissionActionExplicitAccess(
        permissionSet,
        action,
        rings,
        accessOptions,
      ),
      effectiveAccess: getPlatformPermissionActionAccess(permissionSet, action, rings, accessOptions),
    };
  });
  const columns: PlatformDataTableColumn<PermissionActionTableRow>[] = [
    {
      id: "action",
      header: (
        <span className="platform-permissions-page__ring-title playground-agents-permission-detail-ring-title-label">
          <PlatformPermissionMiniRingIcon
            ringId={ring.id}
            icon={ring.icon}
            accessOptions={accessOptions}
          />
          <span>{ring.label}</span>
        </span>
      ),
      width: "minmax(0, 1fr)",
      cell: ({ row }) => (
        <div className="platform-permissions-page__action-copy playground-agents-permission-copy">
          <div className="platform-permissions-page__action-title playground-agents-permission-title">
            {row.label}
            {row.explicitAccess ? (
              <span className="platform-permissions-page__override-badge playground-agents-permission-action-badge">
                Override
              </span>
            ) : null}
          </div>
          <div className="platform-permissions-page__action-description playground-agents-permission-description">
            {row.description}
          </div>
        </div>
      ),
    },
    {
      id: "ring",
      header: "Ring",
      width: "104px",
      cell: ({ row }) => (
        <PermissionRingSelect
          value={row.actionRingId}
          rings={rings}
          disabled={disabled || !onActionRingChange}
          ariaLabel={`${row.action.label} ring`}
          onChange={onActionRingChange
            ? (ringId) => onActionRingChange(row.action.id, ringId)
            : undefined}
        />
      ),
    },
    {
      id: "permission",
      header: "Permission",
      width: "126px",
      cell: ({ row }) => (
        <PermissionAccessSelect
          value={row.explicitAccess}
          inheritedAccess={row.inheritedAccess}
          includeInherit
          accessOptions={accessOptions}
          disabled={disabled || !onActionAccessChange}
          ariaLabel={`${row.action.label} permissions`}
          alignment="start"
          popupAlignment="right"
          onChange={onActionAccessChange
            ? (access) => onActionAccessChange(row.action.id, access)
            : undefined}
        />
      ),
    },
  ];

  if (showEffectiveAccess) {
    columns.push({
      id: "effective",
      header: "Effective",
      width: "minmax(92px, 0.3fr)",
      hideBelow: 760,
      cell: ({ row }) => (
        <span className="platform-permissions-page__effective-access playground-agents-permission-effective-access">
          {getPlatformPermissionAccessLabel(row.effectiveAccess, accessOptions)}
        </span>
      ),
    });
  }

  return (
    <PlatformDataTable
      rows={rows}
      columns={columns}
      getRowId={(row) => row.action.id}
      getRowAriaLabel={(row) => `${row.action.label} permission`}
      ariaLabel={`${ring.label} permissions`}
      className="platform-permissions-page__ring-table"
      surface="plain"
      layout="content"
      variant="minimalistic-ui"
      sticky={false}
      rowMinHeight={56}
      pagination={false}
      emptyState={
        <span className="platform-permissions-page__ring-empty">
          No actions assigned to this ring.
        </span>
      }
    />
  );
}

export function PlatformPermissionsPage({
  permissionSet,
  accessOptions = PLATFORM_PERMISSION_ACCESS_OPTIONS,
  ringDefinitions = PLATFORM_PERMISSION_RING_DEFINITIONS,
  actionDefinitions = PLATFORM_PERMISSION_ACTION_DEFINITIONS,
  subjectType = permissionSet?.subjectType || "agent",
  actionPresentation = {},
  animationKey = 0,
  disabled = false,
  showOverview = true,
  showEffectiveAccess = false,
  ariaLabel = "Permissions",
  className = "",
  onRingAccessChange,
  onActionRingChange,
  onActionAccessChange,
}: PlatformPermissionsPageProps) {
  const ringAccessById = Object.fromEntries(
    ringDefinitions.map((ring) => [
      ring.id,
      getPlatformPermissionRingAccess(permissionSet, ring, accessOptions),
    ]),
  );
  const visibleActions = actionDefinitions.filter((action) =>
    shouldShowPlatformPermissionAction(action, subjectType)
  );

  return (
    <section
      className={`platform-permissions-page playground-permissions-panel${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
      data-platform-permissions-page="true"
    >
      {showOverview ? (
        <section className="platform-permissions-page__overview playground-permission-rings-overview">
          <div className="platform-permissions-page__visual playground-permission-rings-visual" aria-hidden="true">
            <PlatformPermissionRingsChart
              rings={ringDefinitions}
              ringAccessById={ringAccessById}
              accessOptions={accessOptions}
              animationKey={animationKey}
            />
          </div>
          <div className="platform-permissions-page__summary playground-permission-rings-copy">
            {ringDefinitions.map((ring) => (
              <div
                key={ring.id}
                className="platform-permissions-page__summary-row playground-permission-ring-summary-row"
              >
                <div className="platform-permissions-page__summary-copy playground-permission-ring-summary-copy">
                  <div className="platform-permissions-page__summary-title-row playground-permission-ring-summary-title-row">
                    <PlatformPermissionMiniRingIcon
                      ringId={ring.id}
                      icon={ring.icon}
                      accessOptions={accessOptions}
                    />
                    <div className="platform-permissions-page__summary-title playground-permission-ring-summary-title">
                      {ring.label} · {ring.title}
                    </div>
                    <button
                      type="button"
                      className="platform-permissions-page__summary-info playground-permission-ring-summary-info"
                      aria-label={ring.description}
                      data-tooltip={ring.description}
                    >
                      <Info width={12} height={12} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
                <PermissionAccessSelect
                  value={ringAccessById[ring.id]}
                  accessOptions={accessOptions}
                  disabled={disabled || !onRingAccessChange}
                  ariaLabel={`${ring.label} default permissions`}
                  onChange={(access) => onRingAccessChange?.(ring.id, access)}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="platform-permissions-page__details playground-permissions-panel-details">
        <div className="platform-permissions-page__ring-list playground-agents-permissions-list is-details-only">
          {ringDefinitions.map((ring) => {
            const ringActions = visibleActions.filter((action) =>
              getPlatformPermissionActionRingId(permissionSet, action, ringDefinitions) === ring.id
            );
            return (
              <section
                key={ring.id}
                className="platform-permissions-page__ring playground-agents-permission-ring-card is-details-only"
              >
                <PermissionRingTable
                  ring={ring}
                  actions={ringActions}
                  permissionSet={permissionSet}
                  rings={ringDefinitions}
                  accessOptions={accessOptions}
                  actionPresentation={actionPresentation}
                  disabled={disabled}
                  showEffectiveAccess={showEffectiveAccess}
                  onActionRingChange={onActionRingChange}
                  onActionAccessChange={onActionAccessChange}
                />
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import {
  useMemo,
  type CSSProperties,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react";
import {
  Check,
  Code2,
  Plus,
  Rocket,
} from "lucide-react";
import { PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformLabel } from "../../ui/label/index.js";
import {
  PlatformDataTable,
  type PlatformDataTableAction,
  type PlatformDataTableColumn,
} from "../data-table/index.js";
import { PlatformLoadingState } from "../loading-state/index.js";
import {
  PlatformFloatingSidebar,
  type PlatformFloatingSidebarCloseReason,
  type PlatformFloatingSidebarPosition,
} from "../floating-sidebar/index.js";

export interface PlatformVersionHistoryRecord {
  id?: string | number;
  version?: string | number;
  label?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  [key: string]: unknown;
}

export interface PlatformVersionHistoryContext<TVersion extends PlatformVersionHistoryRecord> {
  version: TVersion;
  versionId: string;
  index: number;
  isActiveVersion: boolean;
  isSelectedVersion: boolean;
  isBusy: boolean;
  versionCount: number;
}

export type PlatformVersionHistoryActionIcon = ComponentType<
  SVGProps<SVGSVGElement> & { size?: string | number; strokeWidth?: string | number }
>;

export interface PlatformVersionHistoryAction<TVersion extends PlatformVersionHistoryRecord> {
  id: string;
  label: ReactNode;
  icon?: PlatformVersionHistoryActionIcon;
  Icon?: PlatformVersionHistoryActionIcon;
  disabled?: boolean;
  danger?: boolean;
  onSelect: (
    versionId: string,
    version: TVersion,
    context: PlatformVersionHistoryContext<TVersion>,
  ) => void | Promise<void>;
}

export interface PlatformVersionHistorySidebarProps<
  TVersion extends PlatformVersionHistoryRecord = PlatformVersionHistoryRecord,
> {
  open: boolean;
  versions?: TVersion[];
  activeVersionId?: string;
  selectedVersionId?: string;
  title?: ReactNode;
  sectionTitle?: ReactNode;
  versionColumnLabel?: ReactNode;
  createdAtColumnLabel?: ReactNode;
  activeLabel?: ReactNode;
  createVersionLabel?: ReactNode;
  publishVersionLabel?: ReactNode;
  viewChangesLabel?: ReactNode;
  loading?: boolean;
  loadingMessage?: ReactNode;
  error?: ReactNode;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  busy?: boolean;
  stateContent?: ReactNode;
  headerActions?: ReactNode;
  footerExtra?: ReactNode;
  minimumVersionCount?: number;
  onClose: (reason: PlatformFloatingSidebarCloseReason) => void;
  onCreateVersion?: () => void | Promise<void>;
  onSelectVersion?: (versionId: string, version: TVersion) => void | Promise<void>;
  onPublishVersion?: (versionId: string, version: TVersion) => void | Promise<void>;
  onViewChanges?: () => void | Promise<void>;
  canPublishVersion?: (
    version: TVersion,
    context: PlatformVersionHistoryContext<TVersion>,
  ) => boolean;
  getVersionId?: (version: TVersion, index: number) => string;
  getVersionTitle?: (
    version: TVersion,
    context: PlatformVersionHistoryContext<TVersion>,
  ) => ReactNode;
  /** @deprecated Version-history rows no longer render title subtitles. */
  getVersionDescription?: (
    version: TVersion,
    context: PlatformVersionHistoryContext<TVersion>,
  ) => ReactNode;
  getVersionCreatedAt?: (
    version: TVersion,
    context: PlatformVersionHistoryContext<TVersion>,
  ) => ReactNode;
  /** @deprecated Use getVersionCreatedAt. */
  getVersionMeta?: (
    version: TVersion,
    context: PlatformVersionHistoryContext<TVersion>,
  ) => ReactNode;
  getVersionActions?: (
    version: TVersion,
    context: PlatformVersionHistoryContext<TVersion>,
  ) => Array<PlatformVersionHistoryAction<TVersion> | null | false | undefined>;
  portal?: boolean;
  portalTarget?: Element | DocumentFragment | null;
  position?: PlatformFloatingSidebarPosition;
  width?: CSSProperties["width"];
  className?: string;
}

interface PlatformVersionHistoryTableRow<
  TVersion extends PlatformVersionHistoryRecord,
> {
  version: TVersion;
  versionId: string;
  context: PlatformVersionHistoryContext<TVersion>;
  title: ReactNode;
  accessibleTitle: string;
  createdAt: ReactNode;
  canSelect: boolean;
  canPublish: boolean;
  actions: PlatformVersionHistoryAction<TVersion>[];
}

function normalizeId(value: unknown) {
  return String(value ?? "").trim();
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

function getAccessibleVersionTitle(
  version: PlatformVersionHistoryRecord,
  title: ReactNode,
  index: number,
) {
  if (typeof title === "string" || typeof title === "number") {
    const normalizedTitle = normalizeId(title);
    if (normalizedTitle) return normalizedTitle;
  }
  const label = normalizeId(version.label);
  if (label) return label;
  const versionNumber = normalizeId(version.version);
  return versionNumber ? `Version ${versionNumber}` : `Version ${index + 1}`;
}

export function PlatformVersionHistorySidebar<
  TVersion extends PlatformVersionHistoryRecord = PlatformVersionHistoryRecord,
>({
  open,
  versions = [],
  activeVersionId = "",
  selectedVersionId = "",
  title = "Version history",
  sectionTitle = "Saved versions",
  versionColumnLabel = "Version",
  createdAtColumnLabel = "Created",
  activeLabel = "Published",
  createVersionLabel = "Version",
  publishVersionLabel = "Publish",
  viewChangesLabel = "View Changes",
  loading = false,
  loadingMessage = "Loading versions",
  error,
  emptyTitle = "No versions yet",
  emptyDescription = "Save a version to start this workflow's history.",
  busy = false,
  stateContent,
  headerActions,
  footerExtra,
  minimumVersionCount = 1,
  onClose,
  onCreateVersion,
  onSelectVersion,
  onPublishVersion,
  onViewChanges,
  canPublishVersion,
  getVersionId,
  getVersionTitle,
  getVersionCreatedAt,
  getVersionMeta,
  getVersionActions,
  portal = false,
  portalTarget,
  position = "absolute",
  width,
  className = "",
}: PlatformVersionHistorySidebarProps<TVersion>) {
  const normalizedActiveVersionId = normalizeId(activeVersionId);
  const normalizedSelectedVersionId = normalizeId(
    selectedVersionId || normalizedActiveVersionId,
  );
  const resolvedVersions = useMemo(
    () => (Array.isArray(versions) ? versions : []),
    [versions],
  );

  const footer = onViewChanges || footerExtra ? (
    <div className="platform-version-history-sidebar__footer-actions">
      {onViewChanges ? (
        <PlatformSecondaryButton
          type="button"
          size="small"
          fullWidth
          disabled={busy || resolvedVersions.length === 0}
          onClick={() => void onViewChanges()}
        >
          <Code2 aria-hidden="true" />
          <span>{viewChangesLabel}</span>
        </PlatformSecondaryButton>
      ) : null}
      {footerExtra}
    </div>
  ) : null;

  const tableRows = resolvedVersions.map<PlatformVersionHistoryTableRow<TVersion>>(
    (version, index) => {
      const versionId = normalizeId(getVersionId?.(version, index))
        || normalizeId(version.id)
        || `version-${index}`;
      const isActiveVersion = versionId === normalizedActiveVersionId
        || normalizeId(version.status).toLowerCase() === "active";
      const isSelectedVersion = versionId === normalizedSelectedVersionId;
      const context: PlatformVersionHistoryContext<TVersion> = {
        version,
        versionId,
        index,
        isActiveVersion,
        isSelectedVersion,
        isBusy: busy,
        versionCount: resolvedVersions.length,
      };
      const fallbackTitle = normalizeId(
        version.label
        || (version.version !== undefined ? `Version ${version.version}` : ""),
      ) || "Version";
      const versionTitle = getVersionTitle?.(version, context) ?? fallbackTitle;
      const versionCreatedAt = getVersionCreatedAt?.(version, context)
        ?? getVersionMeta?.(version, context)
        ?? normalizeId(version.createdAt);
      const actions = (getVersionActions?.(version, context) || [])
        .filter((action): action is PlatformVersionHistoryAction<TVersion> => Boolean(action))
        .filter((action) => !(
          resolvedVersions.length <= Math.max(1, minimumVersionCount)
          && action.id.trim().toLowerCase() === "delete"
        ));
      return {
        version,
        versionId,
        context,
        title: versionTitle,
        accessibleTitle: getAccessibleVersionTitle(version, versionTitle, index),
        createdAt: versionCreatedAt,
        canSelect: Boolean(onSelectVersion) && !busy && !isSelectedVersion,
        canPublish: canPublishVersion
          ? canPublishVersion(version, context)
          : !isActiveVersion,
        actions,
      };
    },
  );

  const columns: PlatformDataTableColumn<PlatformVersionHistoryTableRow<TVersion>>[] = [
    {
      id: "version",
      header: versionColumnLabel,
      width: "minmax(0, 1fr)",
      cell: ({ row }) => (
        <div className="platform-version-history-sidebar__version-cell">
          <button
            type="button"
            className="platform-version-history-sidebar__selection"
            disabled={!row.canSelect}
            aria-label={`Display ${row.accessibleTitle}`}
            aria-pressed={row.context.isSelectedVersion}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (row.canSelect) {
                void onSelectVersion?.(row.versionId, row.version);
              }
            }}
          >
            {row.context.isSelectedVersion ? <Check aria-hidden="true" /> : null}
          </button>
          <div className="platform-version-history-sidebar__version-copy">
            <span className="platform-version-history-sidebar__row-title-line">
              <span className="platform-version-history-sidebar__row-title">{row.title}</span>
              {row.context.isActiveVersion ? (
                <PlatformLabel
                  className="platform-version-history-sidebar__status-label"
                  variant="green"
                >
                  {activeLabel}
                </PlatformLabel>
              ) : null}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "createdAt",
      header: createdAtColumnLabel,
      width: "112px",
      cell: ({ row }) => (
        <span className="platform-version-history-sidebar__created-at">
          {row.createdAt || "-"}
        </span>
      ),
    },
  ];

  const getRowActions = onPublishVersion || getVersionActions
    ? (
        row: PlatformVersionHistoryTableRow<TVersion>,
      ): readonly PlatformDataTableAction<PlatformVersionHistoryTableRow<TVersion>>[] => [
        ...(onPublishVersion ? [{
          id: "publish-version",
          label: publishVersionLabel,
          icon: Rocket,
          disabled: busy || !row.canPublish,
          onSelect: () => onPublishVersion(row.versionId, row.version),
        }] : []),
        ...row.actions.map((action) => ({
          id: action.id,
          label: action.label,
          icon: action.Icon || action.icon,
          disabled: busy || action.disabled,
          danger: action.danger,
          onSelect: () => action.onSelect(
            row.versionId,
            row.version,
            row.context,
          ),
        })),
      ]
    : undefined;

  const emptyState = loading ? (
    <PlatformLoadingState
      centered
      message={loadingMessage}
      className="platform-version-history-sidebar__loading"
    />
  ) : (
    <div className="platform-version-history-sidebar__empty">
      <h3>{emptyTitle}</h3>
      {emptyDescription ? <p>{emptyDescription}</p> : null}
    </div>
  );

  const resolvedHeaderActions = (
    <>
      {headerActions}
      {onCreateVersion ? (
        <PlatformSecondaryButton
          type="button"
          size="small"
          className="platform-version-history-sidebar__create-button"
          disabled={busy}
          onClick={() => void onCreateVersion()}
        >
          <Plus aria-hidden="true" />
          <span>{createVersionLabel}</span>
        </PlatformSecondaryButton>
      ) : null}
    </>
  );

  const handleRowActivate = (
    row: PlatformVersionHistoryTableRow<TVersion>,
  ) => {
    if (!row.canSelect || !onSelectVersion) return;
    void onSelectVersion(row.versionId, row.version);
  };

  const getRowClassName = (
    row: PlatformVersionHistoryTableRow<TVersion>,
  ) => joinClassNames(
    "platform-version-history-sidebar__row",
    row.context.isActiveVersion && "is-active",
  );

  const tableAriaLabel = typeof sectionTitle === "string"
    ? sectionTitle
    : "Saved versions";

  return (
    <PlatformFloatingSidebar
      open={open}
      title={title}
      headerActions={resolvedHeaderActions}
      footer={footer}
      onClose={onClose}
      portal={portal}
      portalTarget={portalTarget}
      position={position}
      width={width}
      className={joinClassNames(
        "platform-version-history-sidebar",
        className,
      )}
      bodyClassName="platform-version-history-sidebar__body"
      footerClassName="platform-version-history-sidebar__footer"
      closeButtonLabel="Close version history"
    >
      {stateContent}
      {error ? (
        <div className="platform-version-history-sidebar__state is-error" role="alert">
          {error}
        </div>
      ) : null}
      <PlatformDataTable
        rows={tableRows}
        columns={columns}
        getRowId={(row) => row.versionId}
        ariaLabel={tableAriaLabel}
        className="platform-version-history-sidebar__table"
        surface="plain"
        variant="minimalistic-ui"
        sticky={false}
        pagination={false}
        toolbar={{ title: sectionTitle }}
        rowMinHeight={48}
        getRowActions={getRowActions}
        onRowActivate={onSelectVersion ? handleRowActivate : undefined}
        getRowClassName={getRowClassName}
        getRowAriaLabel={(row) => row.accessibleTitle}
        emptyState={emptyState}
      />
    </PlatformFloatingSidebar>
  );
}

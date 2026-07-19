import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react";
import {
  Check,
  Code2,
  EllipsisVertical,
  ListFilter,
  Plus,
  Rocket,
} from "lucide-react";
import { PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformIconButton } from "../../ui/icon-button/index.js";
import { PlatformLabel } from "../../ui/label/index.js";
import {
  formatPlatformVersionTitle,
} from "../../ui/version-label/index.js";
import { PlatformLoadingState } from "../loading-state/index.js";
import { PlatformPopup } from "../popup/index.js";
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
  /** @deprecated The version history uses a list rather than table columns. */
  versionColumnLabel?: ReactNode;
  /** @deprecated The version history uses a list rather than table columns. */
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

interface PlatformVersionHistoryListItem<
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

interface PlatformVersionHistoryResolvedAction {
  id: string;
  label: ReactNode;
  Icon?: PlatformVersionHistoryActionIcon;
  disabled?: boolean;
  danger?: boolean;
  onSelect: () => void | Promise<void>;
}

function normalizeId(value: unknown) {
  return String(value ?? "").trim();
}

function isProductionVersion<
  TVersion extends PlatformVersionHistoryRecord,
>(
  row: PlatformVersionHistoryListItem<TVersion>,
) {
  return row.context.isActiveVersion;
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
  const versionIdentifier = version.version ?? label ?? index;
  return formatPlatformVersionTitle(versionIdentifier, version.description);
}

export function PlatformVersionHistorySidebar<
  TVersion extends PlatformVersionHistoryRecord = PlatformVersionHistoryRecord,
>({
  open,
  versions = [],
  activeVersionId = "",
  selectedVersionId = "",
  title = "Version history",
  sectionTitle = "All Versions",
  activeLabel = "Production",
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
  const [versionFilter, setVersionFilter] = useState("all");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [actionMenuVersionId, setActionMenuVersionId] = useState("");
  const filterPopupRootRef = useRef<HTMLDivElement | null>(null);
  const filterPopupSurfaceRef = useRef<HTMLDivElement | null>(null);
  const actionPopupRootRef = useRef<HTMLDivElement | null>(null);
  const actionPopupSurfaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterMenuOpen && !actionMenuVersionId) return undefined;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target instanceof Node ? event.target : null;
      if (!target) return;

      if (
        filterMenuOpen
        && !filterPopupRootRef.current?.contains(target)
        && !filterPopupSurfaceRef.current?.contains(target)
      ) {
        setFilterMenuOpen(false);
      }
      if (
        actionMenuVersionId
        && !actionPopupRootRef.current?.contains(target)
        && !actionPopupSurfaceRef.current?.contains(target)
      ) {
        setActionMenuVersionId("");
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setFilterMenuOpen(false);
      setActionMenuVersionId("");
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [actionMenuVersionId, filterMenuOpen]);

  const footer = onViewChanges || footerExtra ? (
    <div className="platform-version-history-sidebar__footer-actions">
      {onViewChanges ? (
        <PlatformSecondaryButton
          type="button"
          size="small"
          fullWidth
          className="platform-version-history-sidebar__view-changes-button"
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

  const versionItems = resolvedVersions.map<PlatformVersionHistoryListItem<TVersion>>(
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
      const fallbackVersionIdentifier = version.version
        ?? version.label
        ?? version.id
        ?? Math.max(0, resolvedVersions.length - index - 1);
      const fallbackTitle = formatPlatformVersionTitle(
        fallbackVersionIdentifier,
        version.description,
      );
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

  const visibleVersionItems = versionItems.filter((item) => {
    if (versionFilter === "production") {
      if (!isProductionVersion(item)) return false;
    }
    if (versionFilter === "saved") {
      if (isProductionVersion(item)) return false;
    }
    return true;
  });

  const getItemActions = (
    item: PlatformVersionHistoryListItem<TVersion>,
  ): PlatformVersionHistoryResolvedAction[] => [
    ...(onPublishVersion ? [{
      id: "publish-version",
      label: publishVersionLabel,
      Icon: Rocket,
      disabled: busy || !item.canPublish,
      onSelect: () => onPublishVersion(item.versionId, item.version),
    }] : []),
    ...item.actions.map((action) => ({
      id: action.id,
      label: action.label,
      Icon: action.Icon || action.icon,
      disabled: busy || action.disabled,
      danger: action.danger,
      onSelect: () => action.onSelect(
        item.versionId,
        item.version,
        item.context,
      ),
    })),
  ];

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

  const handleItemActivate = (
    item: PlatformVersionHistoryListItem<TVersion>,
  ) => {
    if (!item.canSelect || !onSelectVersion) return;
    void onSelectVersion(item.versionId, item.version);
  };

  const listAriaLabel = typeof sectionTitle === "string"
    ? sectionTitle
    : "All Versions";
  const filterOptions = [
    { id: "all", label: "All versions" },
    { id: "production", label: "Production" },
    { id: "saved", label: "Saved" },
  ];
  const handleActionSelect = (action: PlatformVersionHistoryResolvedAction) => {
    if (action.disabled) return;
    setActionMenuVersionId("");
    try {
      void Promise.resolve(action.onSelect()).catch((actionError) => {
        console.error("[PlatformVersionHistorySidebar] Version action failed", actionError);
      });
    } catch (actionError) {
      console.error("[PlatformVersionHistorySidebar] Version action failed", actionError);
    }
  };

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
      <div className="platform-data-table__toolbar platform-version-history-sidebar__toolbar">
        <h2 className="platform-data-table__toolbar-title">{sectionTitle}</h2>
        <PlatformPopup
          open={filterMenuOpen}
          rootRef={filterPopupRootRef}
          surfaceRef={filterPopupSurfaceRef}
          rootClassName="platform-version-history-sidebar__filter-popup"
          surfaceClassName="platform-version-history-sidebar__popup"
          surfaceProps={{ role: "menu", width: 180 }}
          animation="down-in"
          variant="minimal"
          portal
          placement="bottom-start"
          trigger={({ open: popupOpen }) => (
            <PlatformIconButton
              size="small"
              active={popupOpen}
              aria-label="Filter"
              aria-haspopup="menu"
              aria-expanded={popupOpen}
              onClick={() => {
                setActionMenuVersionId("");
                setFilterMenuOpen((current) => !current);
              }}
            >
              <ListFilter aria-hidden="true" />
            </PlatformIconButton>
          )}
        >
          {filterOptions.map((option) => {
            const selected = versionFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className={joinClassNames(
                  "tb-popup-row",
                  "platform-version-history-sidebar__menu-item",
                  selected && "is-selected",
                )}
                onClick={() => {
                  setVersionFilter(option.id);
                  setFilterMenuOpen(false);
                  setActionMenuVersionId("");
                }}
              >
                <span className="tb-popup-check-slot">
                  {selected ? <Check aria-hidden="true" /> : null}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </PlatformPopup>
      </div>
      {loading ? emptyState : resolvedVersions.length === 0 ? emptyState : visibleVersionItems.length === 0 ? (
        <div className="platform-version-history-sidebar__empty">
          <h3>No matching versions</h3>
          <p>Adjust the filter to see more versions.</p>
        </div>
      ) : (
        <div className="platform-version-history-sidebar__list" role="list" aria-label={listAriaLabel}>
          {visibleVersionItems.map((item) => {
            const itemActions = getItemActions(item);
            const actionMenuOpen = actionMenuVersionId === item.versionId;
            return (
              <div
                key={item.versionId}
                className={joinClassNames(
                  "platform-version-history-sidebar__row",
                  item.context.isSelectedVersion && "is-selected",
                )}
                role="listitem"
                data-version-id={item.versionId}
              >
                <button
                  type="button"
                  className="platform-version-history-sidebar__row-main"
                  aria-label={`Display ${item.accessibleTitle}`}
                  aria-pressed={item.context.isSelectedVersion}
                  aria-disabled={!item.canSelect}
                  onClick={() => handleItemActivate(item)}
                >
                  <span className="platform-version-history-sidebar__row-title">{item.title}</span>
                  <span className="platform-version-history-sidebar__created-at">
                    {item.createdAt || "-"}
                  </span>
                </button>
                <div className="platform-version-history-sidebar__row-actions">
                  {item.context.isActiveVersion ? (
                    <PlatformLabel
                      className="platform-version-history-sidebar__status-label"
                      variant="green"
                    >
                      {activeLabel}
                    </PlatformLabel>
                  ) : null}
                  <PlatformPopup
                    open={actionMenuOpen}
                    rootRef={actionMenuOpen ? actionPopupRootRef : undefined}
                    surfaceRef={actionMenuOpen ? actionPopupSurfaceRef : undefined}
                    rootClassName="platform-version-history-sidebar__action-popup"
                    surfaceClassName="platform-version-history-sidebar__popup"
                    surfaceProps={{ role: "menu", width: 190 }}
                    animation="down-in"
                    variant="minimal"
                    portal
                    placement="bottom-end"
                    trigger={({ open: popupOpen }) => (
                      <PlatformIconButton
                        size="compact"
                        active={popupOpen}
                        disabled={itemActions.length === 0}
                        aria-label={`Open actions for ${item.accessibleTitle}`}
                        aria-haspopup="menu"
                        aria-expanded={popupOpen}
                        onClick={() => {
                          if (!itemActions.length) return;
                          setFilterMenuOpen(false);
                          setActionMenuVersionId((current) => (
                            current === item.versionId ? "" : item.versionId
                          ));
                        }}
                      >
                        <EllipsisVertical aria-hidden="true" />
                      </PlatformIconButton>
                    )}
                  >
                    {itemActions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        role="menuitem"
                        className={joinClassNames(
                          "tb-popup-row",
                          "platform-version-history-sidebar__menu-item",
                          action.danger && "is-danger",
                        )}
                        disabled={action.disabled}
                        onClick={() => handleActionSelect(action)}
                      >
                        <span className="platform-version-history-sidebar__menu-icon">
                          {action.Icon ? <action.Icon aria-hidden="true" /> : null}
                        </span>
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </PlatformPopup>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PlatformFloatingSidebar>
  );
}

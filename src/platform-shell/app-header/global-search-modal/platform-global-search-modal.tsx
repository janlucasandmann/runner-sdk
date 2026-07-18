import {
  ArrowUpRight,
  Bot,
  Check,
  FileText,
  ListTodo,
  MessageSquare,
  Pencil,
  SlidersHorizontal,
  SquareArrowOutUpRight,
  SquarePen,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PlatformEmptyState } from "../../../platform-ui/components/composite/empty-state/index.js";
import {
  PlatformConfirmationModal,
  PlatformModal,
} from "../../../platform-ui/components/composite/modal/index.js";
import { PlatformPopup } from "../../../platform-ui/components/composite/popup/index.js";
import { PlatformSecondaryButton } from "../../../platform-ui/components/ui/button/index.js";
import { DotLoader } from "../../../platform-ui/components/ui/dot-loader/index.js";
import { PlatformIconButton } from "../../../platform-ui/components/ui/icon-button/index.js";

export type PlatformGlobalSearchMode = "threads" | "files" | "tickets" | "agents" | "workflows";

export interface PlatformGlobalSearchModeOption {
  id: PlatformGlobalSearchMode;
  label: string;
  description?: string;
}

export const PLATFORM_GLOBAL_SEARCH_MODE_OPTIONS: readonly PlatformGlobalSearchModeOption[] = [
  {
    id: "threads",
    label: "Threads",
    description: "Conversations in your workspace",
  },
  {
    id: "files",
    label: "Files",
    description: "Files across your computers",
  },
  {
    id: "tickets",
    label: "Tickets",
    description: "Tickets inside projects",
  },
  {
    id: "agents",
    label: "Agents",
    description: "Agents in this organization",
  },
  {
    id: "workflows",
    label: "Workflows",
    description: "Metronome workflows",
  },
] as const;

export interface PlatformGlobalSearchAction {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface PlatformGlobalSearchResultItem {
  id: string;
  title: string;
  identifier?: string;
  meta?: ReactNode;
  icon?: ReactNode;
  iconClassName?: string;
  active?: boolean;
  renameDisabled?: boolean;
  deleteDisabled?: boolean;
}

export interface PlatformGlobalSearchResultGroup {
  id: string;
  label: string;
  items: readonly PlatformGlobalSearchResultItem[];
}

export interface PlatformGlobalSearchModalProps {
  open: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  mode?: PlatformGlobalSearchMode;
  modeOptions?: readonly PlatformGlobalSearchModeOption[];
  onModeChange?: (mode: PlatformGlobalSearchMode) => void;
  actions?: readonly PlatformGlobalSearchAction[];
  onActionSelect?: (actionId: string) => void;
  onShowAllActions?: () => void;
  resultGroups?: readonly PlatformGlobalSearchResultGroup[];
  resultsLoading?: boolean;
  onResultSelect?: (resultId: string) => void;
  onResultOpenInNewTab?: (resultId: string) => void | Promise<void>;
  onResultRename?: (resultId: string, nextTitle: string) => void | Promise<void>;
  onResultDelete?: (resultId: string) => void | Promise<void>;
  resultCount?: number;
  title?: string;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  actionsLabel?: string;
  showAllLabel?: string;
  loadingLabel?: string;
  emptyLabel?: string;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  openResultLabel?: string;
  closeHintLabel?: string;
  className?: string;
  backdropClassName?: string;
}

const EMPTY_ACTIONS: readonly PlatformGlobalSearchAction[] = [];
const EMPTY_RESULT_GROUPS: readonly PlatformGlobalSearchResultGroup[] = [];

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function getModeIcon(mode: PlatformGlobalSearchMode) {
  if (mode === "files") return FileText;
  if (mode === "tickets") return ListTodo;
  if (mode === "agents") return Bot;
  if (mode === "workflows") return Workflow;
  return MessageSquare;
}

function getDefaultResultIcon(mode: PlatformGlobalSearchMode) {
  const ModeIcon = getModeIcon(mode);
  const iconProps = {
    width: 16,
    height: 16,
    strokeWidth: 1.85,
    "aria-hidden": true,
  };
  return <ModeIcon {...iconProps} />;
}

function getModeItemLabel(mode: PlatformGlobalSearchMode) {
  if (mode === "files") return "file";
  if (mode === "tickets") return "ticket";
  if (mode === "agents") return "agent";
  if (mode === "workflows") return "workflow";
  return "thread";
}

interface GlobalSearchResultRowProps {
  item: PlatformGlobalSearchResultItem;
  defaultIcon: ReactNode;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onSelect?: (resultId: string) => void;
  onOpenInNewTab?: (resultId: string) => void | Promise<void>;
  onRename?: (resultId: string, nextTitle: string) => void | Promise<void>;
  onDeleteRequest?: (item: PlatformGlobalSearchResultItem) => void;
}

function GlobalSearchResultRow({
  item,
  defaultIcon,
  editing,
  onEditingChange,
  onSelect,
  onOpenInNewTab,
  onRename,
  onDeleteRequest,
}: GlobalSearchResultRowProps) {
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const [renameValue, setRenameValue] = useState(item.title);
  const [pendingAction, setPendingAction] = useState<"" | "open" | "rename">("");
  const [actionError, setActionError] = useState("");
  const canRename = Boolean(onRename) && !item.renameDisabled;
  const canDelete = Boolean(onDeleteRequest) && !item.deleteDisabled;
  const busy = Boolean(pendingAction);

  useLayoutEffect(() => {
    if (!editing) return;
    setRenameValue(item.title);
    setActionError("");
    renameInputRef.current?.focus({ preventScroll: true });
    renameInputRef.current?.select();
  }, [editing, item.title]);

  const runAction = async (action: "open" | "rename", callback: () => void | Promise<void>) => {
    if (busy) return;
    setPendingAction(action);
    setActionError("");
    try {
      await callback();
      if (action === "rename") {
        onEditingChange(false);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : `Failed to ${action} result.`);
    } finally {
      setPendingAction("");
    }
  };

  const cancelRename = () => {
    if (busy) return;
    setRenameValue(item.title);
    setActionError("");
    onEditingChange(false);
  };

  const submitRename = () => {
    const nextTitle = renameValue.trim();
    if (!nextTitle) {
      setActionError("Name cannot be empty.");
      renameInputRef.current?.focus({ preventScroll: true });
      return;
    }
    if (nextTitle === item.title.trim()) {
      onEditingChange(false);
      return;
    }
    if (!onRename || !canRename) return;
    void runAction("rename", () => onRename(item.id, nextTitle));
  };

  return (
    <div
      className={joinClassNames(
        "platform-global-search-modal__result",
        item.active && "is-active",
        editing && "is-editing",
        busy && "is-busy",
        actionError && "has-error",
      )}
      aria-busy={busy || undefined}
      title={actionError || undefined}
    >
      {editing ? (
        <form
          className="platform-global-search-modal__rename-form"
          onSubmit={(event) => {
            event.preventDefault();
            submitRename();
          }}
        >
          {item.identifier ? (
            <span className="platform-global-search-modal__result-identifier">
              {item.identifier}
            </span>
          ) : null}
          <input
            ref={renameInputRef}
            className="platform-global-search-modal__rename-input"
            value={renameValue}
            onChange={(event) => {
              setRenameValue(event.target.value);
              if (actionError) setActionError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                cancelRename();
                return;
              }
              if (event.key === "Enter") {
                event.preventDefault();
                submitRename();
              }
            }}
            aria-label={`Rename ${item.title}`}
            aria-invalid={Boolean(actionError)}
            disabled={busy}
          />
          <span className="platform-global-search-modal__rename-actions">
            <PlatformIconButton
              aria-label={`Cancel renaming ${item.title}`}
              onClick={cancelRename}
              disabled={busy}
              title="Cancel"
            >
              <X strokeWidth={1.9} aria-hidden="true" />
            </PlatformIconButton>
            <PlatformIconButton
              type="submit"
              aria-label={`Save name for ${item.title}`}
              disabled={busy || !renameValue.trim()}
              title="Save"
            >
              <Check strokeWidth={1.9} aria-hidden="true" />
            </PlatformIconButton>
          </span>
        </form>
      ) : (
        <>
          <button
            type="button"
            className="platform-global-search-modal__result-trigger"
            aria-current={item.active ? "page" : undefined}
            onClick={() => onSelect?.(item.id)}
            disabled={!onSelect || busy}
          >
            <span
              className={joinClassNames(
                "platform-global-search-modal__result-icon",
                item.iconClassName,
              )}
              aria-hidden="true"
            >
              {item.icon ?? defaultIcon}
            </span>
            <span className="platform-global-search-modal__result-copy">
              {item.identifier ? (
                <span className="platform-global-search-modal__result-identifier">
                  {item.identifier}
                </span>
              ) : null}
              <span className="platform-global-search-modal__result-title">{item.title}</span>
            </span>
            {item.meta ? (
              <span className="platform-global-search-modal__result-meta">{item.meta}</span>
            ) : null}
          </button>
          <span className="platform-global-search-modal__result-actions">
            <PlatformIconButton
              aria-label={`Open ${item.title} in a new tab`}
              onClick={() => {
                if (!onOpenInNewTab) return;
                void runAction("open", () => onOpenInNewTab(item.id));
              }}
              disabled={!onOpenInNewTab || busy}
              title="Open in new tab"
            >
              <SquareArrowOutUpRight strokeWidth={1.8} aria-hidden="true" />
            </PlatformIconButton>
            <PlatformIconButton
              aria-label={`Rename ${item.title}`}
              onClick={() => {
                setRenameValue(item.title);
                setActionError("");
                onEditingChange(true);
              }}
              disabled={!canRename || busy}
              title={item.renameDisabled ? "This item cannot be renamed" : "Rename"}
            >
              <Pencil strokeWidth={1.8} aria-hidden="true" />
            </PlatformIconButton>
            <PlatformIconButton
              aria-label={`Delete ${item.title}`}
              onClick={() => {
                if (!onDeleteRequest || !canDelete) return;
                onDeleteRequest(item);
              }}
              disabled={!canDelete || busy}
              title={item.deleteDisabled ? "This item cannot be deleted" : "Delete"}
            >
              <Trash2 strokeWidth={1.8} aria-hidden="true" />
            </PlatformIconButton>
          </span>
        </>
      )}
    </div>
  );
}

export function PlatformGlobalSearchModal({
  open,
  query,
  onQueryChange,
  onClose,
  mode = "threads",
  modeOptions = PLATFORM_GLOBAL_SEARCH_MODE_OPTIONS,
  onModeChange,
  actions = EMPTY_ACTIONS,
  onActionSelect,
  onShowAllActions,
  resultGroups = EMPTY_RESULT_GROUPS,
  resultsLoading = false,
  onResultSelect,
  onResultOpenInNewTab,
  onResultRename,
  onResultDelete,
  resultCount,
  title = "Global search",
  searchPlaceholder,
  searchAriaLabel,
  actionsLabel = "Actions",
  showAllLabel = "Show All",
  loadingLabel = "Searching...",
  emptyLabel = "No results found.",
  emptyTitle,
  emptyDescription,
  openResultLabel = "Open result",
  closeHintLabel = "Esc close",
  className = "",
  backdropClassName = "",
}: PlatformGlobalSearchModalProps) {
  const generatedId = useId().replace(/:/g, "");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [editingResultId, setEditingResultId] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState<PlatformGlobalSearchResultItem | null>(
    null,
  );
  const activeModeOption =
    modeOptions.find((option) => option.id === mode) ?? PLATFORM_GLOBAL_SEARCH_MODE_OPTIONS[0];
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? `Search ${activeModeOption.label.toLowerCase()}...`;
  const resolvedSearchAriaLabel =
    searchAriaLabel ?? `Search ${activeModeOption.label.toLowerCase()}`;
  const resultItemCount = useMemo(
    () => resultGroups.reduce((count, group) => count + group.items.length, 0),
    [resultGroups],
  );
  const resolvedResultCount = resultCount ?? resultItemCount;
  const defaultResultIcon = useMemo(() => getDefaultResultIcon(mode), [mode]);
  const emptyStateIcon = useMemo(() => getModeIcon(mode), [mode]);
  const resolvedEmptyTitle = emptyTitle ?? emptyLabel;

  useLayoutEffect(() => {
    if (open) {
      searchInputRef.current?.select();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setModeMenuOpen(false);
      setEditingResultId("");
      setDeleteCandidate(null);
    }
  }, [open]);

  useEffect(() => {
    setDeleteCandidate(null);
  }, [mode]);

  useEffect(() => {
    if (!modeMenuOpen) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setModeMenuOpen(false);
      searchInputRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", handleEscape, true);
    return () => document.removeEventListener("keydown", handleEscape, true);
  }, [modeMenuOpen]);

  const selectMode = (nextMode: PlatformGlobalSearchMode) => {
    setModeMenuOpen(false);
    setEditingResultId("");
    setDeleteCandidate(null);
    if (nextMode !== mode) {
      onModeChange?.(nextMode);
    }
    searchInputRef.current?.focus({ preventScroll: true });
  };

  const modeControl =
    modeOptions.length > 0 ? (
      <PlatformPopup
        open={modeMenuOpen}
        variant="minimal"
        portal
        placement="bottom-end"
        animation="down-in"
        rootClassName="platform-global-search-modal__mode-anchor"
        surfaceClassName="platform-global-search-modal__mode-menu"
        surfaceProps={{
          role: "menu",
          "aria-label": "Search mode",
          width: 250,
        }}
        trigger={
          <PlatformSecondaryButton
            type="button"
            size="small"
            className="platform-global-search-modal__mode-button"
            active={modeMenuOpen}
            onClick={() => setModeMenuOpen((current) => !current)}
            aria-label={`Search mode: ${activeModeOption.label}`}
            aria-haspopup="menu"
            aria-expanded={modeMenuOpen}
          >
            <SlidersHorizontal width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
            <span>{activeModeOption.label}</span>
          </PlatformSecondaryButton>
        }
      >
        {modeOptions.map((option) => {
          const selected = option.id === mode;
          return (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              className={joinClassNames("tb-popup-row", selected && "is-selected")}
              onClick={() => selectMode(option.id)}
            >
              <span className="tb-popup-check-slot" aria-hidden="true">
                {selected ? (
                  <Check className="tb-popup-check" width={13} height={13} strokeWidth={1.8} />
                ) : null}
              </span>
              <span className="platform-global-search-modal__mode-option-copy">
                <span>{option.label}</span>
                {option.description ? <span>{option.description}</span> : null}
              </span>
            </button>
          );
        })}
      </PlatformPopup>
    ) : null;

  const footer = (
    <>
      <div className="platform-global-search-modal__footer-copy">
        <ArrowUpRight
          className="platform-global-search-modal__footer-icon"
          strokeWidth={1.85}
          aria-hidden="true"
        />
        <span>{openResultLabel}</span>
      </div>
      <div className="platform-global-search-modal__footer-meta">
        <span>
          {resolvedResultCount} result{resolvedResultCount === 1 ? "" : "s"}
        </span>
        <span className="platform-global-search-modal__footer-separator" aria-hidden="true">
          {"\u2022"}
        </span>
        <span>{closeHintLabel}</span>
      </div>
    </>
  );

  return (
    <>
      <PlatformModal
        open={open}
        title={title}
        headerVariant="search"
        headerSearchProps={{
          inputRef: searchInputRef,
          value: query,
          onChange: (event) => onQueryChange(event.target.value),
          placeholder: resolvedSearchPlaceholder,
          "aria-label": resolvedSearchAriaLabel,
        }}
        headerActions={modeControl}
        onClose={() => onClose()}
        closeOnEscape={!modeMenuOpen && !deleteCandidate}
        trapFocus={!deleteCandidate}
        size="large"
        width="min(792px, calc(100vw - 24px))"
        maxHeight="min(78dvh, 720px)"
        animateResize={false}
        backdropClassName={joinClassNames(
          "platform-global-search-modal__backdrop",
          backdropClassName,
        )}
        className={joinClassNames("platform-global-search-modal", className)}
        headerClassName="platform-global-search-modal__header"
        bodyClassName="platform-global-search-modal__body"
        footerClassName="platform-global-search-modal__footer"
        closeButtonLabel="Close global search"
        footer={footer}
        surfaceProps={{
          style: {
            height: "min(78dvh, 720px)",
          },
          onClick: (event) => {
            const target = event.target instanceof Element ? event.target : null;
            if (
              modeMenuOpen &&
              !target?.closest(
                ".platform-global-search-modal__mode-anchor, .platform-global-search-modal__mode-menu",
              )
            ) {
              setModeMenuOpen(false);
            }
          },
        }}
      >
        {actions.length > 0 ? (
          <section
            className="platform-global-search-modal__section"
            aria-labelledby={`platform-global-search-actions-${generatedId}`}
          >
            <div className="platform-global-search-modal__section-header">
              <h3
                id={`platform-global-search-actions-${generatedId}`}
                className="platform-global-search-modal__section-label"
              >
                {actionsLabel}
              </h3>
              {onShowAllActions ? (
                <button
                  type="button"
                  className="platform-global-search-modal__section-link"
                  onClick={onShowAllActions}
                >
                  {showAllLabel}
                </button>
              ) : null}
            </div>
            <div className="platform-global-search-modal__result-list">
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="platform-global-search-modal__action"
                  onClick={() => onActionSelect?.(action.id)}
                  disabled={!onActionSelect}
                >
                  <span className="platform-global-search-modal__action-icon" aria-hidden="true">
                    {action.icon ?? <SquarePen strokeWidth={1.9} />}
                  </span>
                  <span className="platform-global-search-modal__action-copy">{action.label}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {resultsLoading && resultItemCount === 0 ? (
          <div
            className="platform-global-search-modal__center-state is-loading"
            role="status"
            aria-label={loadingLabel}
          >
            <DotLoader
              className="platform-global-search-modal__dot-loader"
              dotCount={9}
              dotSize={3}
              gap={2}
              speed={800}
            />
          </div>
        ) : resultGroups.length === 0 ? (
          <div className="platform-global-search-modal__center-state is-empty">
            <PlatformEmptyState
              className="platform-global-search-modal__empty-state"
              icon={emptyStateIcon}
              title={resolvedEmptyTitle}
              description={emptyDescription}
            />
          </div>
        ) : (
          resultGroups.map((group, groupIndex) => (
            <section
              key={group.id}
              className="platform-global-search-modal__section"
              aria-labelledby={`platform-global-search-group-${generatedId}-${groupIndex}`}
            >
              <div className="platform-global-search-modal__section-header">
                <h3
                  id={`platform-global-search-group-${generatedId}-${groupIndex}`}
                  className="platform-global-search-modal__section-label"
                >
                  {group.label}
                </h3>
              </div>
              <div className="platform-global-search-modal__result-list">
                {group.items.map((resultItem) => (
                  <GlobalSearchResultRow
                    key={resultItem.id}
                    item={resultItem}
                    defaultIcon={defaultResultIcon}
                    editing={editingResultId === resultItem.id}
                    onEditingChange={(editing) => {
                      setEditingResultId(editing ? resultItem.id : "");
                    }}
                    onSelect={onResultSelect}
                    onOpenInNewTab={onResultOpenInNewTab}
                    onRename={onResultRename}
                    onDeleteRequest={
                      onResultDelete ? (item) => setDeleteCandidate(item) : undefined
                    }
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </PlatformModal>
      <PlatformConfirmationModal
        open={Boolean(open && deleteCandidate)}
        title={deleteCandidate ? `Delete ${deleteCandidate.title}?` : "Delete item?"}
        description={`This will permanently delete this ${getModeItemLabel(mode)}. This action cannot be undone.`}
        confirmLabel="Delete"
        confirmingLabel="Deleting..."
        tone="destructive"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={async () => {
          if (!deleteCandidate || !onResultDelete) return;
          await onResultDelete(deleteCandidate.id);
          setDeleteCandidate(null);
        }}
      />
    </>
  );
}

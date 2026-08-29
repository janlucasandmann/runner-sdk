import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useState } from "react";

import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformSearch } from "../../ui/search/index.js";
import { type PlatformDetailTab, PlatformDetailTabBar } from "../detail-tab-bar/index.js";
import { PlatformLoadingState } from "../loading-state/index.js";
import {
  PlatformFileExplorerModal,
  type PlatformFileExplorerModalProps,
} from "./platform-file-explorer-modal.js";

export type PlatformFileExplorerFilter = "all" | "recent" | "images" | "pdfs";
export type PlatformFileExplorerItemKind = "folder" | "image" | "pdf" | "file";

export interface PlatformFileExplorerSourceItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  note?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface PlatformFileExplorerSourceGroup {
  id: string;
  label: ReactNode;
  items: readonly PlatformFileExplorerSourceItem[];
}

export interface PlatformFileExplorerBreadcrumb {
  id: string;
  label: ReactNode;
  onSelect?: () => void;
}

export interface PlatformFileExplorerEmptyContext {
  activeFilter: PlatformFileExplorerFilter;
  hasSearchQuery: boolean;
}

export interface PlatformFileExplorerBrowserModalProps<TItem>
  extends Omit<
    PlatformFileExplorerModalProps,
    | "children"
    | "contentHeader"
    | "contentNavigation"
    | "footer"
    | "mainClassName"
    | "sidebar"
    | "sidebarHeader"
  > {
  sourceGroups: readonly PlatformFileExplorerSourceGroup[];
  breadcrumbs: readonly PlatformFileExplorerBreadcrumb[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  headerIcon?: ReactNode;
  /** Optional control rendered as the source title immediately after the icon. */
  headerTitle?: ReactNode;
  headerActions?: ReactNode;
  /** Hides the file-type filter strip for scoped explorer flows. */
  showFilterTabs?: boolean;
  filterContextKey?: string;
  items?: readonly TItem[];
  renderItem?: (item: TItem) => ReactNode;
  getItemKind?: (item: TItem) => PlatformFileExplorerItemKind;
  getItemTimestamp?: (item: TItem) => string | number | Date | null | undefined;
  loading?: boolean;
  loadingMessage?: ReactNode;
  error?: ReactNode;
  emptyMessage?: ReactNode | ((context: PlatformFileExplorerEmptyContext) => ReactNode);
  content?: ReactNode;
  /** Optional action area rendered after the browsable list. */
  listFooter?: ReactNode;
  cancelLabel?: ReactNode;
  confirmLabel: ReactNode;
  confirmDisabled?: boolean;
  onCancel?: () => void;
  onConfirm: () => void | Promise<void>;
}

const FILE_FILTER_TABS: readonly PlatformDetailTab<PlatformFileExplorerFilter>[] = [
  { id: "all", label: "All Files" },
  { id: "recent", label: "Recently Changed" },
  { id: "images", label: "Images" },
  { id: "pdfs", label: "PDFs" },
];

function joinClassNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

function normalizeTimestamp(value: string | number | Date | null | undefined): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return Number.isFinite(value) ? value : Number.NaN;
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function PlatformFileExplorerBrowserModal<TItem>({
  sourceGroups,
  breadcrumbs,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder = "Search Files",
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
  headerIcon,
  headerTitle,
  headerActions,
  showFilterTabs = true,
  filterContextKey = "default",
  items = [],
  renderItem,
  getItemKind = () => "file",
  getItemTimestamp = () => null,
  loading = false,
  loadingMessage = "Loading files...",
  error,
  emptyMessage = "This folder is empty",
  content,
  listFooter,
  cancelLabel = "Cancel",
  confirmLabel,
  confirmDisabled = false,
  onCancel,
  onConfirm,
  className = "",
  onClose,
  ...modalProps
}: PlatformFileExplorerBrowserModalProps<TItem>) {
  const [filterSelection, setFilterSelection] = useState<{
    contextKey: string;
    value: PlatformFileExplorerFilter;
  }>({ contextKey: filterContextKey, value: "all" });
  const activeFilter =
    showFilterTabs && filterSelection.contextKey === filterContextKey
      ? filterSelection.value
      : "all";

  const visibleItems = (() => {
    if (activeFilter === "all") return [...items];
    if (activeFilter === "images") {
      return items.filter((item) => getItemKind(item) === "image");
    }
    if (activeFilter === "pdfs") {
      return items.filter((item) => getItemKind(item) === "pdf");
    }
    return items
      .filter((item) => getItemKind(item) !== "folder")
      .map((item) => ({ item, timestamp: normalizeTimestamp(getItemTimestamp(item)) }))
      .filter((entry) => Number.isFinite(entry.timestamp))
      .sort((left, right) => right.timestamp - left.timestamp)
      .map((entry) => entry.item);
  })();
  const resolvedEmptyMessage =
    typeof emptyMessage === "function"
      ? emptyMessage({ activeFilter, hasSearchQuery: Boolean(searchQuery.trim()) })
      : emptyMessage;
  const close = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    onClose("close-button");
  };

  return (
    <PlatformFileExplorerModal
      {...modalProps}
      className={joinClassNames("is-browser-layout", className)}
      onClose={onClose}
      sidebarHeader={null}
      sidebar={sourceGroups.map((group) =>
        group.items.length > 0 ? (
          <section
            key={group.id}
            className={joinClassNames(
              "tb-file-browser-sidebar-section",
              group.id === "computers" && "tb-file-browser-sidebar-section-environments",
            )}
          >
            {group.label ? (
              <div className="tb-file-browser-sidebar-title">{group.label}</div>
            ) : null}
            <div
              className={joinClassNames(
                "tb-file-browser-sidebar-list",
                group.id === "computers" && "tb-file-browser-sidebar-list-environments",
              )}
            >
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={joinClassNames(
                    "tb-file-browser-source-row",
                    item.active && "active",
                    item.disabled && "disabled",
                  )}
                  disabled={item.disabled}
                  onClick={item.onSelect}
                >
                  {item.icon}
                  <span className="tb-file-browser-source-label">{item.label}</span>
                  {item.note != null ? (
                    <span className="tb-file-browser-source-note">{item.note}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        ) : null,
      )}
      contentHeader={
        <div className="tb-file-browser-header">
          <button
            type="button"
            className="tb-file-browser-nav-button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label="Back"
          >
            <ChevronLeft className="tb-file-browser-nav-icon" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="tb-file-browser-nav-button"
            onClick={onForward}
            disabled={!canGoForward}
            aria-label="Forward"
          >
            <ChevronRight className="tb-file-browser-nav-icon" aria-hidden="true" />
          </button>
          {headerIcon != null ? (
            <div className="tb-file-browser-header-icon">{headerIcon}</div>
          ) : null}
          {headerTitle != null ? (
            <div className="tb-file-browser-header-title">{headerTitle}</div>
          ) : null}
          <div className="tb-file-browser-breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.id} className="tb-file-browser-breadcrumb-chip">
                {index > 0 ? <span className="tb-file-browser-breadcrumb-sep">/</span> : null}
                <button
                  type="button"
                  className={joinClassNames(
                    "tb-file-browser-breadcrumb",
                    index === breadcrumbs.length - 1 && "active",
                  )}
                  onClick={crumb.onSelect}
                  disabled={!crumb.onSelect}
                >
                  {crumb.label}
                </button>
              </span>
            ))}
          </div>
          <PlatformSearch
            className="tb-file-browser-header-search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
          {headerActions}
        </div>
      }
      contentNavigation={
        showFilterTabs ? (
          <PlatformDetailTabBar
            className="tb-file-browser-tabs"
            tabs={FILE_FILTER_TABS}
            value={activeFilter}
            onValueChange={(value) => {
              setFilterSelection({ contextKey: filterContextKey, value });
            }}
            ariaLabel="File filters"
            showDivider
          />
        ) : null
      }
      mainClassName="tb-file-browser-main"
      contentFooterClassName="tb-file-browser-footer"
      footer={
        <>
          <PlatformSecondaryButton
            type="button"
            className="tb-file-browser-footer-button tb-file-browser-footer-button-secondary"
            onClick={close}
          >
            {cancelLabel}
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            type="button"
            className="tb-file-browser-footer-button tb-file-browser-footer-button-primary"
            onClick={() => void onConfirm()}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </PlatformPrimaryButton>
        </>
      }
    >
      {content != null ? (
        content
      ) : (
        <div className="tb-file-browser-list">
          {loading ? (
            <PlatformLoadingState
              centered
              className="tb-file-browser-loading-state"
              message={loadingMessage}
            />
          ) : error ? (
            <div className="tb-file-browser-empty">{error}</div>
          ) : visibleItems.length === 0 ? (
            <div className="tb-file-browser-empty">{resolvedEmptyMessage}</div>
          ) : (
            <div className="tb-file-browser-list-inner">
              {renderItem ? visibleItems.map((item) => renderItem(item)) : null}
            </div>
          )}
          {listFooter != null ? (
            <div className="tb-file-browser-list-footer">{listFooter}</div>
          ) : null}
        </div>
      )}
    </PlatformFileExplorerModal>
  );
}

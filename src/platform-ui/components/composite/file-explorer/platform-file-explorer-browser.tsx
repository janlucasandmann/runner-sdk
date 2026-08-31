import { ChevronLeft, ChevronRight } from "../../ui/hugeicons-compat.js";
import { type ReactNode, useState } from "react";

import { PlatformSearch } from "../../ui/search/index.js";
import { type PlatformDetailTab, PlatformDetailTabBar } from "../detail-tab-bar/index.js";
import { PlatformLoadingState } from "../loading-state/index.js";
import type {
  PlatformFileExplorerBreadcrumb,
  PlatformFileExplorerEmptyContext,
  PlatformFileExplorerFilter,
  PlatformFileExplorerItemKind,
  PlatformFileExplorerSourceGroup,
} from "./platform-file-explorer-browser-modal.js";

export interface PlatformFileExplorerBrowserProps<TItem> {
  sourceGroups: readonly PlatformFileExplorerSourceGroup[];
  showSourceRail?: boolean;
  breadcrumbs: readonly PlatformFileExplorerBreadcrumb[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  headerIcon?: ReactNode;
  headerActions?: ReactNode;
  filterContextKey?: string;
  showFilters?: boolean;
  items?: readonly TItem[];
  renderItem?: (item: TItem) => ReactNode;
  getItemKind?: (item: TItem) => PlatformFileExplorerItemKind;
  getItemTimestamp?: (item: TItem) => string | number | Date | null | undefined;
  loading?: boolean;
  loadingMessage?: ReactNode;
  error?: ReactNode;
  emptyMessage?: ReactNode | ((context: PlatformFileExplorerEmptyContext) => ReactNode);
  content?: ReactNode;
  className?: string;
  ariaLabel?: string;
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

export function PlatformFileExplorerBrowser<TItem>({
  sourceGroups,
  showSourceRail = true,
  breadcrumbs,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder = "Search Files",
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
  headerIcon,
  headerActions,
  filterContextKey = "default",
  showFilters = true,
  items = [],
  renderItem,
  getItemKind = () => "file",
  getItemTimestamp = () => null,
  loading = false,
  loadingMessage = "Loading files...",
  error,
  emptyMessage = "This folder is empty",
  content,
  className = "",
  ariaLabel = "Connected files",
}: PlatformFileExplorerBrowserProps<TItem>) {
  const [filterSelection, setFilterSelection] = useState<{
    contextKey: string;
    value: PlatformFileExplorerFilter;
  }>({ contextKey: filterContextKey, value: "all" });
  const activeFilter =
    filterSelection.contextKey === filterContextKey ? filterSelection.value : "all";
  const visibleItems = (() => {
    if (activeFilter === "all") return [...items];
    if (activeFilter === "images") return items.filter((item) => getItemKind(item) === "image");
    if (activeFilter === "pdfs") return items.filter((item) => getItemKind(item) === "pdf");
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

  return (
    <section
      className={joinClassNames(
        "platform-file-explorer-browser",
        "platform-file-explorer-modal",
        "is-browser-layout",
        !showSourceRail && "without-source-rail",
        className,
      )}
      aria-label={ariaLabel}
    >
      {showSourceRail ? (
        <aside className="platform-file-explorer-browser__sidebar">
          {sourceGroups.map((group) =>
            group.items.length ? (
              <section key={group.id} className="tb-file-browser-sidebar-section">
                {group.label ? (
                  <div className="tb-file-browser-sidebar-title">{group.label}</div>
                ) : null}
                <div className="tb-file-browser-sidebar-list">
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
        </aside>
      ) : null}
      <div className="platform-file-explorer-browser__content">
        <header className="platform-file-explorer-browser__header">
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
          {showFilters ? (
            <PlatformDetailTabBar
              className="tb-file-browser-tabs"
              tabs={FILE_FILTER_TABS}
              value={activeFilter}
              onValueChange={(value) => setFilterSelection({ contextKey: filterContextKey, value })}
              ariaLabel="File filters"
              showDivider
            />
          ) : null}
        </header>
        <main className="platform-file-explorer-browser__main">
          {content != null ? (
            content
          ) : (
            <div className="tb-file-browser-list">
              {loading ? (
                <PlatformLoadingState centered message={loadingMessage} />
              ) : error ? (
                <div className="tb-file-browser-empty">{error}</div>
              ) : visibleItems.length === 0 ? (
                <div className="tb-file-browser-empty">{resolvedEmptyMessage}</div>
              ) : (
                <div className="tb-file-browser-list-inner">
                  {renderItem ? visibleItems.map((item) => renderItem(item)) : null}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

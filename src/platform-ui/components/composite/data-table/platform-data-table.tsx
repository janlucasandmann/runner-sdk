import ChevronsLeftRightIcon from "@hugeicons/core-free-icons/ChevronsLeftRightIcon";
import ListFilterIcon from "@hugeicons/core-free-icons/ListFilterIcon";
import Share01Icon from "@hugeicons/core-free-icons/Share01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  type CSSProperties,
  createElement,
  type ElementType,
  isValidElement,
  type KeyboardEvent,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { PlatformPrimaryButton } from "../../ui/button/platform-button.js";
import { PlatformCheckbox } from "../../ui/checkbox/platform-checkbox.js";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  GripVertical,
  LayoutGrid,
  List,
  Plus,
  Trash2,
} from "../../ui/hugeicons-compat.js";
import { PlatformSearch } from "../../ui/search/platform-search.js";
import { PlatformLoadingState } from "../loading-state/index.js";
import { PlatformPopupSurface } from "../popup/platform-popup.js";
import {
  getNextPlatformDataTableSort,
  normalizePlatformDataTableIds,
  togglePlatformDataTableSelection,
  togglePlatformDataTableVisibleSelection,
} from "./data-table-state.js";
import type {
  PlatformDataTableAction,
  PlatformDataTableActionContext,
  PlatformDataTableColumn,
  PlatformDataTableIcon,
  PlatformDataTablePaginationState,
  PlatformDataTableProps,
  PlatformDataTableRowGroup,
  PlatformDataTableSortState,
} from "./data-table-types.js";
import { useAnimatedHeight } from "./use-animated-height.js";

const DEFAULT_ACTION_MENU_WIDTH = 220;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_CATALOG_INITIAL_ROW_COUNT = 20;
const DEFAULT_CATALOG_ROW_INCREMENT = 10;
const VIEWPORT_GUTTER = 8;
const DELETE_ACTION_ID = "delete";
const DELETE_ACTION_ARIA_SHORTCUTS =
  "Meta+Backspace Meta+Delete Control+Backspace Control+Delete";
const DELETE_ACTION_SHORTCUT_LABEL = "⌘ ⌫";

interface FloatingAnchor {
  x: number;
  y: number;
  alignRight: boolean;
}

interface RowMenuState {
  rowId: string;
  anchor: FloatingAnchor;
}

interface ToolbarMenuState {
  anchor: FloatingAnchor;
}

function joinClassNames(
  ...values: Array<string | null | undefined | false>
): string {
  return values.filter(Boolean).join(" ");
}

function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (typeof Element === "undefined" || !(target instanceof Element)) {
    return false;
  }
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  );
}

function isDeleteShortcut(event: globalThis.KeyboardEvent): boolean {
  return (
    (event.metaKey || event.ctrlKey) &&
    !event.altKey &&
    !event.shiftKey &&
    (event.key === "Backspace" || event.key === "Delete")
  );
}

function isDeleteAction<TData>(
  action: PlatformDataTableAction<TData>,
): boolean {
  const actionId = action.id.trim().toLowerCase();
  return (
    actionId === DELETE_ACTION_ID ||
    actionId.startsWith(`${DELETE_ACTION_ID}-`) ||
    actionId.startsWith(`${DELETE_ACTION_ID}_`)
  );
}

function isShareAction<TData>(action: PlatformDataTableAction<TData>): boolean {
  const actionId = action.id.trim().toLowerCase();
  if (
    actionId === "share" ||
    actionId.startsWith("share-") ||
    actionId.startsWith("share_")
  ) {
    return true;
  }
  return typeof action.label === "string" && /^share(?:\b|$)/i.test(action.label.trim());
}

function formatCellValue(value: unknown): ReactNode {
  if (value == null || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return value;
  return String(value);
}

function renderIcon(
  icon: PlatformDataTableIcon | undefined,
  className: string,
  size = 15,
): ReactNode {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === "string" || typeof icon === "number") return icon;
  return createElement(icon as ElementType, {
    className,
    width: size,
    height: size,
    strokeWidth: 1.8,
    "aria-hidden": true,
  });
}

function toSortingState(
  value: PlatformDataTableSortState | null,
): SortingState {
  return value ? [{ id: value.id, desc: value.direction === "desc" }] : [];
}

function toRowSelectionState(ids: ReadonlySet<string>): RowSelectionState {
  const state: RowSelectionState = {};
  ids.forEach((id) => {
    state[id] = true;
  });
  return state;
}

function normalizePaginationState(
  value: Partial<PlatformDataTablePaginationState> | undefined,
): PlatformDataTablePaginationState {
  const pageIndex = Math.max(0, Math.floor(Number(value?.pageIndex) || 0));
  const pageSize = Math.max(
    1,
    Math.floor(Number(value?.pageSize) || DEFAULT_PAGE_SIZE),
  );
  return { pageIndex, pageSize };
}

function getFloatingPosition(
  anchor: FloatingAnchor,
  width: number,
  height: number,
): { left: number; top: number } {
  const viewportWidth =
    typeof window === "undefined"
      ? width + VIEWPORT_GUTTER * 2
      : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined"
      ? height + VIEWPORT_GUTTER * 2
      : window.innerHeight;
  const preferredLeft = anchor.alignRight ? anchor.x - width : anchor.x;
  const left = Math.min(
    Math.max(VIEWPORT_GUTTER, preferredLeft),
    Math.max(VIEWPORT_GUTTER, viewportWidth - width - VIEWPORT_GUTTER),
  );
  const preferredTop = anchor.y;
  const top =
    preferredTop + height + VIEWPORT_GUTTER <= viewportHeight
      ? preferredTop
      : Math.max(VIEWPORT_GUTTER, preferredTop - height - VIEWPORT_GUTTER);
  return { left, top };
}

function PlatformDataTableSortIcon({
  active,
  direction,
  sortDescFirst,
}: {
  active: boolean;
  direction: "asc" | "desc";
  sortDescFirst: boolean;
}): ReactNode {
  const primaryDirection = sortDescFirst ? "desc" : "asc";
  const primaryDirectionActive = active && direction === primaryDirection;
  return createElement(
    "span",
    {
      className: joinClassNames(
        "platform-data-table__sort-icon",
        active && "is-active",
        active && primaryDirectionActive && "is-bottom-active",
        active && !primaryDirectionActive && "is-top-active",
      ),
      "aria-hidden": "true",
    },
    createElement(
      "span",
      { className: "platform-data-table__sort-icon-glyph is-top" },
      createElement(HugeiconsIcon, {
        icon: ChevronsLeftRightIcon,
        className: "platform-data-table__sort-icon-glyph-icon",
        size: 14,
        strokeWidth: 1.8,
      }),
    ),
    createElement(
      "span",
      { className: "platform-data-table__sort-icon-glyph is-bottom" },
      createElement(HugeiconsIcon, {
        icon: ChevronsLeftRightIcon,
        className: "platform-data-table__sort-icon-glyph-icon",
        size: 14,
        strokeWidth: 1.8,
      }),
    ),
  );
}

export function PlatformDataTable<TData>({
  rows,
  columns,
  getRowId,
  ariaLabel,
  sorting,
  selection,
  pagination,
  incrementalLoading,
  toolbar,
  rowGrouping,
  rowReordering,
  getRowActions,
  renderRowMenu,
  onRowActionTrigger,
  isRowActionOpen,
  onRowActivate,
  onRowContextMenu,
  onRowPointerEnter,
  onRowFocus,
  isRowExpanded,
  renderExpandedRow,
  getRowClassName,
  getRowAriaLabel,
  isRowDisabled,
  loading = false,
  loadingState = null,
  error = null,
  emptyState = "No items yet.",
  noResultsState = "No items match this view.",
  footer,
  className = "",
  surface = "default",
  layout = "content",
  variant = "default",
  sticky = true,
  stickyTop = 0,
  rowMinHeight,
  style,
}: PlatformDataTableProps<TData>): ReactNode {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const incrementalRequestInFlightRef = useRef(false);
  const progressiveRevealInFlightRef = useRef(false);
  const previousProgressiveRowIdsRef = useRef<readonly string[]>([]);
  const hoveredRowIdRef = useRef<string | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);
  const toolbarMenuRef = useRef<HTMLDivElement | null>(null);
  const rowSelectionControlRefs = useRef(
    new Map<string, HTMLButtonElement>(),
  );
  const rowSelectionRangeRef = useRef<{
    anchorId: string;
    cursorId: string;
    baselineIds: Set<string>;
  } | null>(null);
  const paginationClampRequestRef = useRef("");
  const [containerWidth, setContainerWidth] = useState(
    Number.POSITIVE_INFINITY,
  );
  const [internalSorting, setInternalSorting] =
    useState<PlatformDataTableSortState | null>(sorting?.defaultValue || null);
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(
    () => normalizePlatformDataTableIds(selection?.defaultValue),
  );
  const [internalPagination, setInternalPagination] =
    useState<PlatformDataTablePaginationState>(() =>
      normalizePaginationState(
        typeof pagination === "object" ? pagination.defaultValue : undefined,
      ),
    );
  const [internalSearchValue, setInternalSearchValue] = useState(
    toolbar?.search?.defaultValue || "",
  );
  const [progressiveRowLimit, setProgressiveRowLimit] = useState(
    DEFAULT_CATALOG_INITIAL_ROW_COUNT,
  );
  const [incrementalRequestPending, setIncrementalRequestPending] =
    useState(false);
  const [internallyCollapsedGroupIds, setInternallyCollapsedGroupIds] =
    useState<Set<string>>(
      () =>
        new Set(
          (rowGrouping?.groups || [])
            .filter((group) => group.defaultExpanded === false)
            .map((group) => group.id),
        ),
    );
  const [rowMenu, setRowMenu] = useState<RowMenuState | null>(null);
  const [toolbarMenu, setToolbarMenu] = useState<ToolbarMenuState | null>(null);
  const [rowMenuPosition, setRowMenuPosition] = useState({
    left: VIEWPORT_GUTTER,
    top: VIEWPORT_GUTTER,
  });
  const [toolbarMenuPosition, setToolbarMenuPosition] = useState({
    left: VIEWPORT_GUTTER,
    top: VIEWPORT_GUTTER,
  });
  const draggedRowIdRef = useRef<string | null>(null);
  const rowDropPendingRef = useRef(false);
  const rowDragResetFrameRef = useRef<number | null>(null);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [draggedRowHeight, setDraggedRowHeight] = useState(0);
  const [rowDropCommitted, setRowDropCommitted] = useState(false);
  const [rowDropTarget, setRowDropTarget] = useState<{
    rowId: string;
    placement: "before" | "after";
  } | null>(null);

  const requestMoreRows = useCallback(() => {
    if (
      !incrementalLoading?.hasMore ||
      incrementalLoading.loading ||
      incrementalRequestInFlightRef.current
    ) {
      return;
    }
    incrementalRequestInFlightRef.current = true;
    setIncrementalRequestPending(true);
    try {
      Promise.resolve(incrementalLoading.onLoadMore())
        .catch((loadError) => {
          console.error(
            "[PlatformDataTable] Incremental row loading failed",
            loadError,
          );
        })
        .finally(() => {
          incrementalRequestInFlightRef.current = false;
          setIncrementalRequestPending(false);
        });
    } catch (loadError) {
      incrementalRequestInFlightRef.current = false;
      setIncrementalRequestPending(false);
      console.error(
        "[PlatformDataTable] Incremental row loading failed",
        loadError,
      );
    }
  }, [incrementalLoading]);

  const data = useMemo(() => Array.from(rows || []), [rows]);
  const sortingControlled = sorting?.value !== undefined;
  const activeSorting = sortingControlled
    ? sorting?.value || null
    : internalSorting;
  const selectionControlled = selection?.value !== undefined;
  const selectedIds = useMemo(
    () =>
      selectionControlled
        ? normalizePlatformDataTableIds(selection?.value)
        : internalSelectedIds,
    [internalSelectedIds, selection?.value, selectionControlled],
  );
  const searchControlled = toolbar?.search?.value !== undefined;
  const searchValue = searchControlled
    ? toolbar?.search?.value || ""
    : internalSearchValue;
  const paginationConfig = typeof pagination === "object" ? pagination : null;
  const paginationEnabled = Boolean(paginationConfig);
  const usesProgressiveCatalogRows =
    variant === "catalog-ui" && !paginationEnabled;
  const paginationControlled = paginationConfig?.value !== undefined;
  const activePagination = normalizePaginationState(
    paginationControlled ? paginationConfig?.value : internalPagination,
  );
  const hasSelection = Boolean(selection?.enabled);
  const hasActions = Boolean(
    getRowActions || renderRowMenu || onRowActionTrigger,
  );
  const hasReordering = Boolean(
    rowReordering && rowReordering.enabled !== false,
  );
  const rowReorderActivation = rowReordering?.activation === "row" ? "row" : "handle";
  const hasReorderColumn = hasReordering && rowReorderActivation === "handle";
  const progressiveRowIds = useMemo(
    () => data.map((row) => getRowId(row)),
    [data, getRowId],
  );
  const progressiveViewKey = `${activeSorting?.id || ""}:${
    activeSorting?.direction || ""
  }:${searchValue}`;
  const rowGroupExpansionControlled = rowGrouping?.expandedIds !== undefined;
  const expandedRowGroupIds = useMemo(
    () =>
      rowGroupExpansionControlled
        ? normalizePlatformDataTableIds(rowGrouping?.expandedIds)
        : new Set(
            (rowGrouping?.groups || [])
              .filter((group) => !internallyCollapsedGroupIds.has(group.id))
              .map((group) => group.id),
          ),
    [
      internallyCollapsedGroupIds,
      rowGroupExpansionControlled,
      rowGrouping?.expandedIds,
      rowGrouping?.groups,
    ],
  );

  useEffect(() => {
    const previousRowIds = previousProgressiveRowIdsRef.current;
    const unchanged =
      previousRowIds.length === progressiveRowIds.length &&
      previousRowIds.every((rowId, index) => rowId === progressiveRowIds[index]);
    const appended =
      previousRowIds.length > 0 &&
      previousRowIds.length < progressiveRowIds.length &&
      previousRowIds.every((rowId, index) => rowId === progressiveRowIds[index]);

    previousProgressiveRowIdsRef.current = progressiveRowIds;
    if (!usesProgressiveCatalogRows || unchanged || appended) return;
    setProgressiveRowLimit(DEFAULT_CATALOG_INITIAL_ROW_COUNT);
  }, [progressiveRowIds, usesProgressiveCatalogRows]);

  useEffect(() => {
    if (!usesProgressiveCatalogRows) return;
    setProgressiveRowLimit(DEFAULT_CATALOG_INITIAL_ROW_COUNT);
  }, [progressiveViewKey, usesProgressiveCatalogRows]);

  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const updateWidth = () =>
      setContainerWidth(
        element.getBoundingClientRect().width || Number.POSITIVE_INFINITY,
      );
    updateWidth();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const visibleColumns = useMemo(
    () =>
      columns.filter(
        (column) => !column.hideBelow || containerWidth >= column.hideBelow,
      ),
    [columns, containerWidth],
  );

  const columnVisibility = useMemo<VisibilityState>(() => {
    const visibleIds = new Set(visibleColumns.map((column) => column.id));
    const state: VisibilityState = {};
    columns.forEach((column) => {
      state[column.id] = visibleIds.has(column.id);
    });
    return state;
  }, [columns, visibleColumns]);

  const tanstackColumns = useMemo<ColumnDef<TData>[]>(
    () =>
      columns.map((column) => {
        const readValue = (row: TData): unknown => {
          if (typeof column.accessor === "function")
            return column.accessor(row);
          if (column.accessor != null) return row[column.accessor];
          return undefined;
        };
        const definition: ColumnDef<TData> = {
          id: column.id,
          accessorFn: readValue,
          header: () => column.header,
          cell: (cellContext) => {
            const rowId = cellContext.row.id;
            const value = cellContext.getValue();
            return column.cell
              ? column.cell({
                  row: cellContext.row.original,
                  rowId,
                  rowIndex: cellContext.row.index,
                  value,
                })
              : formatCellValue(value);
          },
          enableSorting: Boolean(column.sortable),
          sortDescFirst: Boolean(column.sortDescFirst),
          enableGlobalFilter: true,
        };
        if (column.sortingFn) definition.sortingFn = column.sortingFn;
        return definition;
      }),
    [columns],
  );

  const sortingState = useMemo(
    () => toSortingState(activeSorting),
    [activeSorting],
  );
  const rowSelectionState = useMemo(
    () => toRowSelectionState(selectedIds),
    [selectedIds],
  );
  const paginationState = useMemo<PaginationState>(
    () => ({
      pageIndex: activePagination.pageIndex,
      pageSize: activePagination.pageSize,
    }),
    [activePagination.pageIndex, activePagination.pageSize],
  );
  const manualPageCount =
    paginationEnabled && paginationConfig?.manual
      ? Math.max(
          1,
          Math.ceil(
            Math.max(0, Number(paginationConfig.totalCount ?? data.length)) /
              activePagination.pageSize,
          ),
        )
      : undefined;

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    getRowId: (row) => getRowId(row),
    state: {
      sorting: sortingState,
      rowSelection: rowSelectionState,
      globalFilter: searchValue,
      columnVisibility,
      pagination: paginationState,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginationEnabled
      ? getPaginationRowModel()
      : undefined,
    manualSorting: Boolean(sorting?.manual),
    manualFiltering: Boolean(toolbar?.search?.manual),
    manualPagination: Boolean(paginationConfig?.manual),
    pageCount: manualPageCount,
    autoResetPageIndex: false,
    enableMultiRowSelection: true,
    enableRowSelection: (row) =>
      selection?.isRowSelectable
        ? selection.isRowSelectable(row.original)
        : true,
    globalFilterFn: (row, _columnId, filterValue) => {
      const normalizedFilter = String(filterValue || "")
        .trim()
        .toLocaleLowerCase();
      if (!normalizedFilter) return true;
      const source = toolbar?.search?.getSearchText
        ? toolbar.search.getSearchText(row.original)
        : visibleColumns
            .map((column) => {
              if (typeof column.accessor === "function")
                return column.accessor(row.original);
              if (column.accessor != null) return row.original[column.accessor];
              return "";
            })
            .join(" ");
      return String(source || "")
        .toLocaleLowerCase()
        .includes(normalizedFilter);
    },
  });

  const commitSorting = useCallback(
    (next: PlatformDataTableSortState | null) => {
      if (!sortingControlled) setInternalSorting(next);
      sorting?.onChange?.(next);
    },
    [sorting?.onChange, sortingControlled],
  );

  const commitPagination = useCallback(
    (next: PlatformDataTablePaginationState) => {
      if (!paginationEnabled) return;
      const normalized = normalizePaginationState(next);
      if (!paginationControlled) setInternalPagination(normalized);
      paginationConfig?.onChange?.(normalized);
    },
    [paginationConfig?.onChange, paginationControlled, paginationEnabled],
  );

  const resetPagination = useCallback(() => {
    if (!paginationEnabled || activePagination.pageIndex === 0) return;
    commitPagination({ ...activePagination, pageIndex: 0 });
  }, [activePagination, commitPagination, paginationEnabled]);

  const sortColumn = useCallback(
    (column: PlatformDataTableColumn<TData>) => {
      if (!column.sortable) return;
      if (usesProgressiveCatalogRows) {
        setProgressiveRowLimit(DEFAULT_CATALOG_INITIAL_ROW_COUNT);
      }
      commitSorting(
        getNextPlatformDataTableSort(
          activeSorting,
          column.id,
          Boolean(column.sortDescFirst),
        ),
      );
      resetPagination();
    },
    [
      activeSorting,
      commitSorting,
      resetPagination,
      usesProgressiveCatalogRows,
    ],
  );

  const selectedRows = useMemo(
    () => data.filter((row) => selectedIds.has(getRowId(row))),
    [data, getRowId, selectedIds],
  );

  const resolveRowActions = useCallback(
    (row: TData, rowId: string) => {
      const isSelected = selectedIds.has(rowId);
      const targetRows =
        isSelected && selectedRows.length > 1 ? selectedRows : [row];
      const actions = (
        getRowActions?.(row, {
          rowId,
          isSelected,
          selectedIds,
          selectedRows,
          targetRows,
        }) || []
      );
      if (targetRows.length <= 1) return actions;

      return actions.flatMap((action) => {
        const selectedRowsAction = action.selectedRows;
        if (!selectedRowsAction) return [];
        return [{
          ...action,
          ...selectedRowsAction,
          onSelect: selectedRowsAction.onSelect,
          selectedRows: undefined,
        }];
      });
    },
    [getRowActions, selectedIds, selectedRows],
  );

  const commitSelection = useCallback(
    (next: Set<string>, reason: "row" | "visible" | "programmatic") => {
      if (!selectionControlled) setInternalSelectedIds(next);
      selection?.onChange?.({
        selectedIds: next,
        selectedRows: data.filter((row) => next.has(getRowId(row))),
        reason,
      });
    },
    [data, getRowId, selection, selectionControlled],
  );

  const allRenderedRows = table.getRowModel().rows;
  const renderedRows = usesProgressiveCatalogRows
    ? allRenderedRows.slice(0, progressiveRowLimit)
    : allRenderedRows;
  const hasLocalProgressiveRows =
    usesProgressiveCatalogRows && renderedRows.length < allRenderedRows.length;
  const incrementalLoadingActive = Boolean(
    incrementalLoading?.loading || incrementalRequestPending,
  );

  useEffect(() => {
    progressiveRevealInFlightRef.current = false;
  }, [allRenderedRows.length, progressiveRowLimit]);

  const handleIncrementalScroll = useCallback(
    (scrollBoundary: Element | null = null) => {
      const scrollElement = scrollRef.current;
      const hasRemoteRows = Boolean(incrementalLoading?.hasMore);
      if (
        !scrollElement ||
        (!hasLocalProgressiveRows && !hasRemoteRows) ||
        (!hasLocalProgressiveRows && incrementalLoadingActive)
      ) {
        return;
      }

      const requestedThreshold = Number(incrementalLoading?.threshold);
      const threshold = Number.isFinite(requestedThreshold)
        ? Math.max(0, requestedThreshold)
        : 24;
      const ownScrollRange =
        scrollElement.scrollHeight - scrollElement.clientHeight;
      const scrollHappenedInTableViewport = scrollBoundary === scrollElement;
      if (scrollHappenedInTableViewport && ownScrollRange > 1) {
        const remainingScrollDistance =
          ownScrollRange - scrollElement.scrollTop;
        if (remainingScrollDistance > threshold) return;
      } else {
        const viewportBottom =
          typeof window === "undefined"
            ? Number.POSITIVE_INFINITY
            : window.innerHeight || document.documentElement.clientHeight;
        const boundaryRect =
          scrollBoundary &&
          scrollBoundary !== scrollElement &&
          scrollBoundary.contains(rootRef.current)
            ? scrollBoundary.getBoundingClientRect()
            : null;
        const visibleBottom =
          boundaryRect && boundaryRect.height > 0
            ? Math.min(viewportBottom, boundaryRect.bottom)
            : viewportBottom;
        if (
          scrollElement.getBoundingClientRect().bottom >
          visibleBottom + threshold
        ) {
          return;
        }
      }

      if (!usesProgressiveCatalogRows) {
        requestMoreRows();
        return;
      }
      if (progressiveRevealInFlightRef.current) return;

      progressiveRevealInFlightRef.current = true;
      const nextLimit = progressiveRowLimit + DEFAULT_CATALOG_ROW_INCREMENT;
      setProgressiveRowLimit(nextLimit);
      if (hasRemoteRows && nextLimit > allRenderedRows.length) {
        requestMoreRows();
      }
    },
    [
      allRenderedRows.length,
      hasLocalProgressiveRows,
      incrementalLoading?.hasMore,
      incrementalLoading?.threshold,
      incrementalLoadingActive,
      progressiveRowLimit,
      requestMoreRows,
      usesProgressiveCatalogRows,
    ],
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      (!usesProgressiveCatalogRows && !incrementalLoading)
    ) {
      return undefined;
    }

    const handleCapturedScroll = (event: Event) => {
      const rootElement = rootRef.current;
      const scrollElement = scrollRef.current;
      if (!rootElement || !scrollElement) return;

      const target = event.target;
      if (!(target instanceof Element)) {
        handleIncrementalScroll();
        return;
      }

      const scrollHappenedInsideTable = rootElement.contains(target);
      const scrollHappenedInAncestor = target.contains(rootElement);
      if (!scrollHappenedInsideTable && !scrollHappenedInAncestor) return;

      handleIncrementalScroll(
        target === scrollElement
          ? scrollElement
          : scrollHappenedInAncestor
            ? target
            : null,
      );
    };

    window.addEventListener("scroll", handleCapturedScroll, true);
    return () => {
      window.removeEventListener("scroll", handleCapturedScroll, true);
    };
  }, [handleIncrementalScroll, incrementalLoading, usesProgressiveCatalogRows]);
  const renderedRowGroupIds = rowGrouping
    ? new Set(
        renderedRows.map((tableRow) =>
          rowGrouping.getGroupId(tableRow.original),
        ),
      )
    : null;
  const renderedRowGroupCount = rowGrouping
    ? rowGrouping.groups.filter((group) =>
        renderedRowGroupIds?.has(group.id),
      ).length
    : 0;
  const showEmptyStateRow =
    !loading && !error && (!data.length || !allRenderedRows.length);
  const totalRowCount = paginationConfig?.manual
    ? Math.max(
        0,
        Math.floor(Number(paginationConfig.totalCount ?? data.length) || 0),
      )
    : table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(
    1,
    Math.ceil(totalRowCount / activePagination.pageSize),
  );
  const resolvedPageIndex = Math.min(activePagination.pageIndex, pageCount - 1);
  const pageRangeStart = totalRowCount
    ? resolvedPageIndex * activePagination.pageSize + 1
    : 0;
  const pageRangeEnd = totalRowCount
    ? Math.min(
        totalRowCount,
        resolvedPageIndex * activePagination.pageSize + renderedRows.length,
      )
    : 0;
  const surfaceHeightAnimationKey = [
    loading
      ? "loading"
      : error
        ? "error"
        : renderedRows.length
          ? "rows"
          : "empty",
    renderedRows
      .map(
        (tableRow) =>
          `${tableRow.id}:${isRowExpanded?.(tableRow.original) ? "expanded" : "collapsed"}`,
      )
      .join(","),
    paginationEnabled
      ? `${resolvedPageIndex}:${activePagination.pageSize}:${totalRowCount}`
      : "unpaginated",
    rowGrouping
      ? rowGrouping.groups
          .map(
            (group) =>
              `${group.id}:${expandedRowGroupIds.has(group.id) ? "expanded" : "collapsed"}`,
          )
          .join(",")
      : "ungrouped",
    footer ? "footer" : "no-footer",
  ].join("|");
  const surfaceRef = useAnimatedHeight<HTMLDivElement>({
    enabled: layout === "fill",
    changeKey: surfaceHeightAnimationKey,
  });
  const pageSizeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...(paginationConfig?.pageSizeOptions || DEFAULT_PAGE_SIZE_OPTIONS),
            activePagination.pageSize,
          ].map((option) =>
            Math.max(1, Math.floor(Number(option) || DEFAULT_PAGE_SIZE)),
          ),
        ),
      ).sort((left, right) => left - right),
    [activePagination.pageSize, paginationConfig?.pageSizeOptions],
  );

  useEffect(() => {
    if (
      !paginationEnabled ||
      resolvedPageIndex === activePagination.pageIndex
    ) {
      paginationClampRequestRef.current = "";
      return;
    }
    const requestKey = `${activePagination.pageIndex}:${resolvedPageIndex}:${activePagination.pageSize}:${totalRowCount}`;
    if (paginationClampRequestRef.current === requestKey) return;
    paginationClampRequestRef.current = requestKey;
    commitPagination({ ...activePagination, pageIndex: resolvedPageIndex });
  }, [
    activePagination,
    commitPagination,
    paginationEnabled,
    resolvedPageIndex,
    totalRowCount,
  ]);

  const visibleSelectableIds = renderedRows
    .filter((row) => row.getCanSelect())
    .map((row) => row.id);
  const selectedVisibleCount = visibleSelectableIds.filter((id) =>
    selectedIds.has(id),
  ).length;
  const allVisibleSelected =
    visibleSelectableIds.length > 0 &&
    selectedVisibleCount === visibleSelectableIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  const toggleRowSelection = useCallback(
    (rowId: string) => {
      const nextSelectedIds = togglePlatformDataTableSelection(
        selectedIds,
        rowId,
      );
      rowSelectionRangeRef.current = nextSelectedIds.has(rowId)
        ? {
            anchorId: rowId,
            cursorId: rowId,
            baselineIds: new Set(nextSelectedIds),
          }
        : null;
      commitSelection(nextSelectedIds, "row");
    },
    [commitSelection, selectedIds],
  );

  const toggleVisibleSelection = useCallback(() => {
    rowSelectionRangeRef.current = null;
    commitSelection(
      togglePlatformDataTableVisibleSelection(
        selectedIds,
        visibleSelectableIds,
        !allVisibleSelected,
      ),
      "visible",
    );
  }, [allVisibleSelected, commitSelection, selectedIds, visibleSelectableIds]);

  const handleRowSelectionKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, rowId: string) => {
      if (
        !event.shiftKey ||
        (event.key !== "ArrowUp" && event.key !== "ArrowDown") ||
        !selectedIds.has(rowId)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      let range = rowSelectionRangeRef.current;
      if (
        !range ||
        range.cursorId !== rowId ||
        !selectedIds.has(range.anchorId) ||
        !visibleSelectableIds.includes(range.anchorId)
      ) {
        range = {
          anchorId: rowId,
          cursorId: rowId,
          baselineIds: new Set(selectedIds),
        };
        rowSelectionRangeRef.current = range;
      }

      const currentIndex = visibleSelectableIds.indexOf(range.cursorId);
      if (currentIndex < 0) return;
      const nextIndex =
        currentIndex + (event.key === "ArrowDown" ? 1 : -1);
      const nextRowId = visibleSelectableIds[nextIndex];
      if (!nextRowId) return;

      const anchorIndex = visibleSelectableIds.indexOf(range.anchorId);
      if (anchorIndex < 0) return;
      const rangeStart = Math.min(anchorIndex, nextIndex);
      const rangeEnd = Math.max(anchorIndex, nextIndex);
      const nextSelectedIds = new Set(range.baselineIds);
      visibleSelectableIds
        .slice(rangeStart, rangeEnd + 1)
        .forEach((visibleRowId) => nextSelectedIds.add(visibleRowId));

      range.cursorId = nextRowId;
      commitSelection(nextSelectedIds, "row");
      rowSelectionControlRefs.current.get(nextRowId)?.focus();
    },
    [commitSelection, selectedIds, visibleSelectableIds],
  );

  const toggleRowGroup = useCallback(
    (groupId: string) => {
      const nextExpandedIds = new Set(expandedRowGroupIds);
      if (nextExpandedIds.has(groupId)) nextExpandedIds.delete(groupId);
      else nextExpandedIds.add(groupId);

      if (!rowGroupExpansionControlled) {
        setInternallyCollapsedGroupIds(
          new Set(
            (rowGrouping?.groups || [])
              .filter((group) => !nextExpandedIds.has(group.id))
              .map((group) => group.id),
          ),
        );
      }
      rowGrouping?.onExpandedChange?.(nextExpandedIds);
    },
    [
      expandedRowGroupIds,
      rowGroupExpansionControlled,
      rowGrouping?.groups,
      rowGrouping?.onExpandedChange,
    ],
  );

  const updateSearch = useCallback(
    (value: string) => {
      if (!searchControlled) setInternalSearchValue(value);
      if (usesProgressiveCatalogRows) {
        setProgressiveRowLimit(DEFAULT_CATALOG_INITIAL_ROW_COUNT);
      }
      toolbar?.search?.onChange?.(value);
      resetPagination();
    },
    [
      resetPagination,
      searchControlled,
      toolbar?.search,
      usesProgressiveCatalogRows,
    ],
  );

  const closeMenus = useCallback(() => {
    setRowMenu(null);
    setToolbarMenu(null);
  }, []);

  const createRowActionContext = useCallback(
    (row: TData, rowId: string): PlatformDataTableActionContext<TData> => {
      const useSelectedRows = selectedIds.has(rowId) && selectedRows.length > 1;
      const targetRows = useSelectedRows ? selectedRows : [row];
      return {
        row,
        rowId,
        rows: targetRows,
        rowIds: new Set(
          targetRows.map((targetRow) => getRowId(targetRow)),
        ),
        selectedRows,
        selectedIds,
        closeMenu: closeMenus,
      };
    },
    [closeMenus, getRowId, selectedIds, selectedRows],
  );

  const invokeRowAction = useCallback(
    (
      action: PlatformDataTableAction<TData>,
      context: PlatformDataTableActionContext<TData>,
    ) => {
      if (action.disabled) return;
      if (!action.keepOpen) closeMenus();
      try {
        const result = action.onSelect(context);
        if (result && typeof result.catch === "function") {
          result.catch((actionError) =>
            console.error("[PlatformDataTable] Row action failed", actionError),
          );
        }
      } catch (actionError) {
        console.error("[PlatformDataTable] Row action failed", actionError);
      }
    },
    [closeMenus],
  );

  useEffect(() => {
    if (typeof document === "undefined" || !getRowActions) return undefined;

    const handleDeleteShortcut = (event: globalThis.KeyboardEvent) => {
      const rowId = hoveredRowIdRef.current;
      if (
        !rowId ||
        event.repeat ||
        event.isComposing ||
        isEditableShortcutTarget(event.target) ||
        !isDeleteShortcut(event)
      ) {
        return;
      }

      const row = data.find((candidate) => getRowId(candidate) === rowId);
      if (!row || isRowDisabled?.(row)) return;
      const deleteAction = resolveRowActions(row, rowId).find(
        (action) => !action.hidden && isDeleteAction(action),
      );
      if (!deleteAction || deleteAction.disabled) return;

      event.preventDefault();
      event.stopPropagation();
      invokeRowAction(
        deleteAction,
        createRowActionContext(row, rowId),
      );
    };

    document.addEventListener("keydown", handleDeleteShortcut, true);
    return () => {
      document.removeEventListener("keydown", handleDeleteShortcut, true);
    };
  }, [
    createRowActionContext,
    data,
    getRowActions,
    getRowId,
    invokeRowAction,
    isRowDisabled,
    resolveRowActions,
  ]);

  useEffect(() => {
    const hoveredRowId = hoveredRowIdRef.current;
    if (
      hoveredRowId &&
      !data.some((candidate) => getRowId(candidate) === hoveredRowId)
    ) {
      hoveredRowIdRef.current = null;
    }
  }, [data, getRowId]);

  useEffect(() => {
    if (!rowMenu && !toolbarMenu) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        (rowMenuRef.current?.contains(target) ||
          toolbarMenuRef.current?.contains(target))
      )
        return;
      closeMenus();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeMenus();
    };
    const handleViewportChange = () => closeMenus();
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [closeMenus, rowMenu, toolbarMenu]);

  useLayoutEffect(() => {
    if (!rowMenu || !rowMenuRef.current) return;
    const rect = rowMenuRef.current.getBoundingClientRect();
    setRowMenuPosition(
      getFloatingPosition(
        rowMenu.anchor,
        rect.width || DEFAULT_ACTION_MENU_WIDTH,
        rect.height || 40,
      ),
    );
  }, [rowMenu]);

  useLayoutEffect(() => {
    if (!toolbarMenu || !toolbarMenuRef.current) return;
    const rect = toolbarMenuRef.current.getBoundingClientRect();
    setToolbarMenuPosition(
      getFloatingPosition(
        toolbarMenu.anchor,
        rect.width || DEFAULT_ACTION_MENU_WIDTH,
        rect.height || 40,
      ),
    );
  }, [toolbarMenu]);

  const openRowMenu = useCallback(
    (event: ReactMouseEvent, rowId: string, contextMenu = false) => {
      event.preventDefault();
      event.stopPropagation();
      const row = data.find((candidate) => getRowId(candidate) === rowId);
      if (!row) return;
      const actions = resolveRowActions(row, rowId).filter(
        (action) => !action.hidden,
      );
      if (!actions.length && !renderRowMenu) return;
      const rect = contextMenu
        ? null
        : (event.currentTarget as HTMLElement).getBoundingClientRect();
      setToolbarMenu(null);
      setRowMenu({
        rowId,
        anchor: contextMenu
          ? { x: event.clientX, y: event.clientY, alignRight: false }
          : {
              x: rect?.right || event.clientX,
              y: (rect?.bottom || event.clientY) + 6,
              alignRight: true,
            },
      });
    },
    [data, getRowId, renderRowMenu, resolveRowActions],
  );

  const openToolbarMenu = useCallback((event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setRowMenu(null);
    setToolbarMenu((current) =>
      current
        ? null
        : { anchor: { x: rect.right, y: rect.bottom + 6, alignRight: true } },
    );
  }, []);

  const isReorderableRow = useCallback(
    (row: TData) =>
      hasReordering &&
      !isRowDisabled?.(row) &&
      (rowReordering?.isRowReorderable?.(row) ?? true),
    [hasReordering, isRowDisabled, rowReordering],
  );

  const canDropRow = useCallback(
    (row: TData, targetRow: TData) =>
      getRowId(row) !== getRowId(targetRow) &&
      isReorderableRow(row) &&
      isReorderableRow(targetRow) &&
      (rowReordering?.canDrop?.(row, targetRow) ?? true),
    [getRowId, isReorderableRow, rowReordering],
  );

  const resetRowDrag = useCallback(() => {
    rowDropPendingRef.current = false;
    draggedRowIdRef.current = null;
    setDraggedRowId(null);
    setDraggedRowHeight(0);
    setRowDropCommitted(false);
    setRowDropTarget(null);
  }, []);

  const scheduleRowDragReset = useCallback(() => {
    if (rowDragResetFrameRef.current != null) {
      globalThis.cancelAnimationFrame?.(rowDragResetFrameRef.current);
      rowDragResetFrameRef.current = null;
    }
    if (typeof globalThis.requestAnimationFrame !== "function") {
      resetRowDrag();
      return;
    }
    rowDragResetFrameRef.current = globalThis.requestAnimationFrame(() => {
      rowDragResetFrameRef.current = null;
      resetRowDrag();
    });
  }, [resetRowDrag]);

  useEffect(
    () => () => {
      if (rowDragResetFrameRef.current != null) {
        globalThis.cancelAnimationFrame?.(rowDragResetFrameRef.current);
      }
    },
    [],
  );

  const beginRowDrag = useCallback(
    (event: ReactDragEvent<HTMLElement>, rowId: string) => {
      if (rowDragResetFrameRef.current != null) {
        globalThis.cancelAnimationFrame?.(rowDragResetFrameRef.current);
        rowDragResetFrameRef.current = null;
      }
      rowDropPendingRef.current = false;
      draggedRowIdRef.current = rowId;
      setDraggedRowId(rowId);
      setRowDropCommitted(false);
      setRowDropTarget(null);
      const dragHandle = event.currentTarget as HTMLElement;
      const rowElement = dragHandle.closest<HTMLElement>(
        ".platform-data-table__row",
      );
      const rowGroupElement = rowElement?.closest<HTMLElement>(
        ".platform-data-table__row-group",
      );
      const measuredHeight = (
        rowGroupElement ||
        rowElement ||
        dragHandle
      ).getBoundingClientRect().height;
      setDraggedRowHeight(
        Number.isFinite(measuredHeight) && measuredHeight > 0
          ? measuredHeight
          : 0,
      );
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", rowId);
    },
    [],
  );

  const resolveDropPlacement = (
    event: ReactDragEvent<HTMLDivElement>,
  ): "before" | "after" => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientY < bounds.top + bounds.height / 2
      ? "before"
      : "after";
  };

  const findDraggedRow = useCallback(() => {
    const sourceId = draggedRowIdRef.current;
    if (!sourceId) return null;
    return data.find((candidate) => getRowId(candidate) === sourceId) || null;
  }, [data, getRowId]);

  const reportRowReorderError = (reorderError: unknown) => {
    console.error("[PlatformDataTable] Row reorder failed", reorderError);
  };

  const gridTemplateColumns = useMemo(
    () =>
      [
        hasReorderColumn ? "24px" : "",
        hasSelection ? "21px" : "",
        ...visibleColumns.map((column) => column.width || "minmax(120px, 1fr)"),
        hasActions ? "28px" : "",
      ]
        .filter(Boolean)
        .join(" "),
    [hasActions, hasReorderColumn, hasSelection, visibleColumns],
  );

  const resolvedRowMinHeight = Math.max(
    36,
    rowMinHeight ?? (variant === "catalog-ui" ? 72 : 58),
  );
  const rootStyle = {
    ...style,
    "--platform-data-table-columns": gridTemplateColumns,
    "--platform-data-table-row-min-height": `${resolvedRowMinHeight}px`,
    "--platform-data-table-drag-shift-distance": `${
      draggedRowHeight || resolvedRowMinHeight
    }px`,
    "--platform-data-table-sticky-top":
      typeof stickyTop === "number" ? `${stickyTop}px` : stickyTop,
  } as CSSProperties;

  const renderSelectionControl = (
    selected: boolean,
    partial: boolean,
    label: string,
    onClick: () => void,
    disabled = false,
    rowId?: string,
  ) =>
    createElement(PlatformCheckbox, {
      className: joinClassNames("platform-data-table__checkbox"),
      checked: selected,
      indeterminate: partial,
      "aria-label": label,
      disabled,
      ref: rowId
        ? (element: HTMLButtonElement | null) => {
            if (element) rowSelectionControlRefs.current.set(rowId, element);
            else rowSelectionControlRefs.current.delete(rowId);
          }
        : undefined,
      onKeyDown: rowId
        ? (event: KeyboardEvent<HTMLButtonElement>) =>
            handleRowSelectionKeyDown(event, rowId)
        : undefined,
      onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.focus();
        onClick();
      },
    });

  const renderReorderControl = (row: TData, rowId: string) => {
    const reorderable = isReorderableRow(row);
    if (!reorderable) {
      return createElement(
        "span",
        {
          className: "platform-data-table__reorder-handle is-disabled",
          "aria-hidden": "true",
        },
        createElement(GripVertical, {
          width: 15,
          height: 15,
          strokeWidth: 1.8,
        }),
      );
    }
    return createElement(
      "button",
      {
        type: "button",
        className: "platform-data-table__reorder-handle",
        draggable: true,
        title: "Drag to reorder",
        "aria-label":
          rowReordering?.ariaLabel?.(row) || "Drag row to reorder",
        onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          event.stopPropagation();
        },
        onDragStart: (event: ReactDragEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          beginRowDrag(event, rowId);
        },
        onDragEnd: resetRowDrag,
      },
      createElement(GripVertical, {
        width: 15,
        height: 15,
        strokeWidth: 1.8,
        "aria-hidden": true,
      }),
    );
  };

  const renderToolbar = () => {
    if (!toolbar) return null;
    const filters = toolbar.filters || [];
    const viewOptions = toolbar.view?.options || [];
    const hasTitleLine = Boolean(
      toolbar.title || toolbar.leading || filters.length,
    );
    const hasContent = Boolean(
      toolbar.title ||
      toolbar.leading ||
      toolbar.search ||
      filters.length ||
      viewOptions.length ||
      toolbar.controlsLeading ||
      toolbar.trailing ||
      toolbar.primaryAction,
    );
    if (!hasContent) return null;
    return createElement(
      "div",
      {
        className: joinClassNames(
          "platform-data-table__toolbar",
          hasTitleLine && "has-title-line",
          toolbar.className,
        ),
      },
      toolbar.title
        ? createElement(
            "h2",
            { className: "platform-data-table__toolbar-title" },
            toolbar.title,
          )
        : null,
      toolbar.leading
        ? createElement(
            "div",
            { className: "platform-data-table__toolbar-leading" },
            toolbar.leading,
          )
        : null,
      filters.length
        ? createElement(
            "button",
            {
              type: "button",
              className: joinClassNames(
                "platform-data-table__toolbar-button",
                "is-icon-only",
                toolbarMenu && "is-open",
              ),
              title: "Filter",
              "aria-label": "Filter",
              onClick: openToolbarMenu,
              "aria-haspopup": "menu",
              "aria-expanded": toolbarMenu ? "true" : "false",
            },
            createElement(HugeiconsIcon, {
              icon: ListFilterIcon,
              className: "hugeicons-list-filter platform-data-table__filter-icon",
              size: 14,
              strokeWidth: 1.8,
              "aria-hidden": true,
            }),
          )
        : null,
      createElement("div", {
        className: "platform-data-table__toolbar-spacer",
      }),
      createElement(
        "div",
        { className: "platform-data-table__toolbar-controls" },
        toolbar.controlsLeading
          ? createElement(
              "div",
              { className: "platform-data-table__toolbar-controls-leading" },
              toolbar.controlsLeading,
            )
          : null,
        toolbar.search
          ? createElement(PlatformSearch, {
              className: "platform-data-table__search",
              value: searchValue,
              placeholder: toolbar.search.placeholder || "Search",
              "aria-label":
                toolbar.search.ariaLabel ||
                toolbar.search.placeholder ||
                "Search table",
              onChange: (event) => updateSearch(event.currentTarget.value),
            })
          : null,
        viewOptions.length
          ? createElement(
              "div",
              {
                className: "platform-data-table__view-switch",
                role: "group",
                "aria-label": "View",
              },
              viewOptions.map((option) => {
                const active = toolbar.view?.value === option.id;
                const fallbackIcon = option.id === "grid" ? LayoutGrid : List;
                return createElement(
                  "button",
                  {
                    key: option.id,
                    type: "button",
                    className: active ? "is-active" : "",
                    title: option.label,
                    "aria-label": option.label,
                    "aria-pressed": active ? "true" : "false",
                    onClick: () => toolbar.view?.onChange(option.id),
                  },
                  renderIcon(
                    option.icon || fallbackIcon,
                    "platform-data-table__view-icon",
                    14,
                  ),
                );
              }),
            )
          : null,
        toolbar.trailing
          ? createElement(
              "div",
              { className: "platform-data-table__toolbar-trailing" },
              toolbar.trailing,
            )
          : null,
        toolbar.primaryAction
          ? createElement(
              PlatformPrimaryButton,
              {
                size: "small",
                type: "button",
                className: joinClassNames(
                  "platform-data-table__primary-action",
                  toolbar.primaryAction.className,
                ),
                disabled: toolbar.primaryAction.disabled,
                onClick: toolbar.primaryAction.onClick,
                "aria-label":
                  toolbar.primaryAction.ariaLabel ||
                  toolbar.primaryAction.label,
              },
              renderIcon(
                toolbar.primaryAction.icon === undefined
                  ? Plus
                  : toolbar.primaryAction.icon,
                "platform-data-table__primary-action-icon",
                15,
              ),
              createElement("span", null, toolbar.primaryAction.label),
            )
          : null,
      ),
    );
  };

  const renderPagination = () => {
    if (!paginationEnabled) return null;
    const previousDisabled = loading || resolvedPageIndex <= 0;
    const nextDisabled = loading || resolvedPageIndex >= pageCount - 1;
    return createElement(
      "nav",
      {
        className: "platform-data-table__pagination",
        "aria-label": `${ariaLabel} pagination`,
      },
      createElement(
        "label",
        { className: "platform-data-table__page-size" },
        createElement(
          "span",
          { className: "platform-data-table__page-size-label" },
          "Rows per page:",
        ),
        createElement(
          "span",
          { className: "platform-data-table__page-size-control" },
          createElement(
            "select",
            {
              value: String(activePagination.pageSize),
              disabled: loading,
              "aria-label": "Rows per page",
              onChange: (event) =>
                commitPagination({
                  pageIndex: 0,
                  pageSize: Number(
                    (event.currentTarget as HTMLSelectElement).value,
                  ),
                }),
            },
            pageSizeOptions.map((pageSize) =>
              createElement(
                "option",
                {
                  key: pageSize,
                  value: String(pageSize),
                },
                String(pageSize),
              ),
            ),
          ),
          createElement(ChevronDown, {
            className: "platform-data-table__page-size-chevron",
            width: 14,
            height: 14,
            strokeWidth: 1.8,
            "aria-hidden": true,
          }),
        ),
      ),
      createElement(
        "span",
        {
          className: "platform-data-table__page-range",
          "aria-live": "polite",
        },
        `${pageRangeStart}-${pageRangeEnd} of ${totalRowCount}`,
      ),
      createElement(
        "div",
        { className: "platform-data-table__page-actions" },
        createElement(
          "button",
          {
            type: "button",
            className: "platform-data-table__page-button",
            disabled: previousDisabled,
            "aria-label": "Previous page",
            onClick: () =>
              commitPagination({
                ...activePagination,
                pageIndex: Math.max(0, resolvedPageIndex - 1),
              }),
          },
          createElement(ChevronLeft, {
            width: 17,
            height: 17,
            strokeWidth: 1.9,
            "aria-hidden": true,
          }),
        ),
        createElement(
          "button",
          {
            type: "button",
            className: "platform-data-table__page-button",
            disabled: nextDisabled,
            "aria-label": "Next page",
            onClick: () =>
              commitPagination({
                ...activePagination,
                pageIndex: Math.min(pageCount - 1, resolvedPageIndex + 1),
              }),
          },
          createElement(ChevronRight, {
            width: 17,
            height: 17,
            strokeWidth: 1.9,
            "aria-hidden": true,
          }),
        ),
      ),
    );
  };

  const renderHeader = () =>
    createElement(
      "div",
      { className: "platform-data-table__header-group", role: "rowgroup" },
      createElement(
        "div",
        {
          className: "platform-data-table__header",
          role: "row",
          "aria-rowindex": 1,
          style: { gridTemplateColumns },
        },
        hasReorderColumn
          ? createElement("div", {
              className: "platform-data-table__header-cell is-reordering",
              role: "columnheader",
              "aria-label": "Queue order",
            })
          : null,
        hasSelection
          ? createElement(
              "div",
              {
                className: "platform-data-table__header-cell is-selection",
                role: "columnheader",
              },
              renderSelectionControl(
                allVisibleSelected,
                someVisibleSelected,
                allVisibleSelected
                  ? "Deselect all visible rows"
                  : "Select all visible rows",
                toggleVisibleSelection,
                !visibleSelectableIds.length,
              ),
            )
          : null,
        visibleColumns.map((column) => {
          const active = activeSorting?.id === column.id;
          const direction = activeSorting?.direction || "asc";
          const nextDirection =
            active && direction === "asc" ? "descending" : "ascending";
          return createElement(
            "div",
            {
              key: column.id,
              className: joinClassNames(
                "platform-data-table__header-cell",
                "is-start",
                active && "is-active",
                column.headerClassName,
              ),
              role: "columnheader",
              "aria-sort": active
                ? direction === "asc"
                  ? "ascending"
                  : "descending"
                : "none",
              "data-column-id": column.id,
            },
            column.sortable
              ? createElement(
                  "span",
                  { className: "platform-data-table__sortable-header" },
                  createElement(
                    "span",
                    { className: "platform-data-table__header-label" },
                    column.header,
                  ),
                  createElement(
                    "button",
                    {
                      type: "button",
                      className: "platform-data-table__column-sort-button",
                      title: `Sort ${column.ariaLabel || String(column.header)} ${nextDirection}`,
                      "aria-label": `Sort ${column.ariaLabel || String(column.header)} ${nextDirection}`,
                      onClick: (event: ReactMouseEvent) => {
                        event.preventDefault();
                        event.stopPropagation();
                        sortColumn(column);
                      },
                    },
                    createElement(PlatformDataTableSortIcon, {
                      active,
                      direction,
                      sortDescFirst: Boolean(column.sortDescFirst),
                    }),
                  ),
                )
              : column.header,
          );
        }),
        hasActions
          ? createElement("div", {
              className: "platform-data-table__header-cell is-actions",
              role: "columnheader",
              "aria-label": "Actions",
            })
          : null,
      ),
    );

  const renderBody = () => {
    let stateContent: ReactNode = null;
    if (loading) {
      stateContent = createElement(
        "div",
        {
          className: joinClassNames(
            "platform-data-table__state is-loading has-loading-state",
            Boolean(loadingState) && "has-custom-loading-state",
          ),
        },
        loadingState ||
          createElement(PlatformLoadingState, {
            centered: true,
            message: `Loading ${ariaLabel}…`,
          }),
      );
    } else if (error)
      stateContent = createElement(
        "div",
        { className: "platform-data-table__state is-error", role: "alert" },
        error,
      );

    if (showEmptyStateRow) {
      const columnCount =
        visibleColumns.length +
        (hasReorderColumn ? 1 : 0) +
        (hasSelection ? 1 : 0) +
        (hasActions ? 1 : 0);
      return createElement(
        "div",
        { className: "platform-data-table__body has-state", role: "rowgroup" },
        createElement(
          "div",
          {
            className: "platform-data-table__state-row",
            role: "row",
            "aria-rowindex": 2,
          },
          createElement(
            "div",
            {
              className: "platform-data-table__state is-empty",
              role: "cell",
              "aria-colspan": columnCount,
            },
            !data.length ? emptyState : noResultsState,
          ),
        ),
      );
    }

    if (stateContent) {
      return createElement(
        "div",
        { className: "platform-data-table__body has-state", role: "rowgroup" },
        stateContent,
      );
    }

    const indexedRows = renderedRows.map((tableRow, renderedIndex) => ({
      tableRow,
      renderedIndex,
    }));
    const bodyEntries: Array<
      | {
          kind: "group";
          group: PlatformDataTableRowGroup;
          rowCount: number;
        }
      | {
          kind: "row";
          tableRow: (typeof renderedRows)[number];
          renderedIndex: number;
          group?: PlatformDataTableRowGroup;
        }
    > = [];

    if (rowGrouping?.groups.length) {
      const rowsByGroupId = new Map<string, typeof indexedRows>();
      indexedRows.forEach((indexedRow) => {
        const groupId = rowGrouping.getGroupId(indexedRow.tableRow.original);
        const groupRows = rowsByGroupId.get(groupId) || [];
        groupRows.push(indexedRow);
        rowsByGroupId.set(groupId, groupRows);
      });

      rowGrouping.groups.forEach((group) => {
        const groupRows = rowsByGroupId.get(group.id) || [];
        if (!groupRows.length) return;
        bodyEntries.push({
          kind: "group",
          group,
          rowCount: groupRows.length,
        });
        if (expandedRowGroupIds.has(group.id)) {
          bodyEntries.push(
            ...groupRows.map((indexedRow) => ({
              kind: "row" as const,
              ...indexedRow,
              group,
            })),
          );
        }
        rowsByGroupId.delete(group.id);
      });

      rowsByGroupId.forEach((groupRows) => {
        bodyEntries.push(
          ...groupRows.map((indexedRow) => ({
            kind: "row" as const,
            ...indexedRow,
          })),
        );
      });
    } else {
      bodyEntries.push(
        ...indexedRows.map((indexedRow) => ({
          kind: "row" as const,
          ...indexedRow,
        })),
      );
    }

    const reorderShiftByRowId = new Map<string, "up" | "down">();
    if (draggedRowId && rowDropTarget && !rowDropCommitted) {
      const visibleRowEntries = bodyEntries.filter(
        (
          candidate,
        ): candidate is Extract<(typeof bodyEntries)[number], { kind: "row" }> =>
          candidate.kind === "row",
      );
      const sourceIndex = visibleRowEntries.findIndex(
        (candidate) => candidate.tableRow.id === draggedRowId,
      );
      const targetIndex = visibleRowEntries.findIndex(
        (candidate) => candidate.tableRow.id === rowDropTarget.rowId,
      );
      const sourceEntry = visibleRowEntries[sourceIndex];
      const targetEntry = visibleRowEntries[targetIndex];
      const sourceGroupId = sourceEntry?.group?.id || null;
      const targetGroupId = targetEntry?.group?.id || null;

      if (
        sourceIndex >= 0 &&
        targetIndex >= 0 &&
        sourceGroupId === targetGroupId
      ) {
        const destinationIndex =
          rowDropTarget.placement === "before"
            ? targetIndex > sourceIndex
              ? targetIndex - 1
              : targetIndex
            : targetIndex > sourceIndex
              ? targetIndex
              : targetIndex + 1;

        if (destinationIndex > sourceIndex) {
          for (
            let index = sourceIndex + 1;
            index <= destinationIndex;
            index += 1
          ) {
            reorderShiftByRowId.set(
              visibleRowEntries[index].tableRow.id,
              "up",
            );
          }
        } else if (destinationIndex < sourceIndex) {
          for (
            let index = destinationIndex;
            index < sourceIndex;
            index += 1
          ) {
            reorderShiftByRowId.set(
              visibleRowEntries[index].tableRow.id,
              "down",
            );
          }
        }
      }
    }

    const columnCount =
      visibleColumns.length +
      (hasReorderColumn ? 1 : 0) +
      (hasSelection ? 1 : 0) +
      (hasActions ? 1 : 0);

    return createElement(
      "div",
      { className: "platform-data-table__body", role: "rowgroup" },
      bodyEntries.map((entry, bodyEntryIndex) => {
        if (entry.kind === "group") {
          const expanded = expandedRowGroupIds.has(entry.group.id);
          const groupAccessibleLabel =
            entry.group.ariaLabel ||
            (typeof entry.group.label === "string"
              ? entry.group.label
              : "row group");
          return createElement(
            "div",
            {
              key: `group:${entry.group.id}`,
              className: joinClassNames(
                "platform-data-table__group-header",
                expanded ? "is-expanded" : "is-collapsed",
              ),
              role: "row",
              "aria-rowindex": bodyEntryIndex + 2,
            },
            createElement(
              "div",
              {
                className: "platform-data-table__group-cell",
                role: "cell",
                "aria-colspan": columnCount,
              },
              createElement(
                "button",
                {
                  type: "button",
                  className: "platform-data-table__group-toggle",
                  "aria-expanded": expanded ? "true" : "false",
                  "aria-label": `${expanded ? "Collapse" : "Expand"} ${groupAccessibleLabel}`,
                  onClick: () => toggleRowGroup(entry.group.id),
                  style: entry.group.color
                    ? ({
                        "--platform-data-table-row-group-color":
                          entry.group.color,
                      } as CSSProperties)
                    : undefined,
                },
                entry.group.showChevron === false
                  ? null
                  : createElement(ChevronDown, {
                      className: "platform-data-table__group-chevron",
                      width: 15,
                      height: 15,
                      strokeWidth: 1.8,
                      "aria-hidden": true,
                    }),
                entry.group.color
                  ? createElement("span", {
                      className: "platform-data-table__group-indicator",
                      "aria-hidden": true,
                    })
                  : null,
                createElement(
                  "span",
                  { className: "platform-data-table__group-label" },
                  entry.group.label,
                ),
                createElement(
                  "span",
                  { className: "platform-data-table__group-count" },
                  String(entry.rowCount),
                ),
              ),
            ),
          );
        }

        const { tableRow, renderedIndex } = entry;
        const row = tableRow.original;
        const rowId = tableRow.id;
        const rowDraggable =
          rowReorderActivation === "row" && isReorderableRow(row);
        const reorderShift = reorderShiftByRowId.get(rowId) || null;
        const dropPlacement =
          rowDropTarget?.rowId === rowId ? rowDropTarget.placement : null;
        const isSectionEnd =
          Boolean(rowGrouping?.groups.length) &&
          (bodyEntryIndex === bodyEntries.length - 1 ||
            bodyEntries[bodyEntryIndex + 1]?.kind === "group");
        const groupedRowClassNames = [
          entry.group && "is-grouped-row",
          entry.group?.color && "has-group-indicator",
        ];
        const disabled = Boolean(isRowDisabled?.(row));
        const selected = selectedIds.has(rowId);
        const actions = resolveRowActions(row, rowId).filter(
          (action) => !action.hidden,
        );
        const menuAvailable = Boolean(
          actions.length || renderRowMenu || onRowActionTrigger,
        );
        const externalActionOpen = Boolean(isRowActionOpen?.(row));
        const rowCells = new Map(
          tableRow.getVisibleCells().map((cell) => [cell.column.id, cell]),
        );
        const handleActivate = () => {
          if (!disabled) onRowActivate?.(row);
        };
        const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
          if (
            !onRowActivate ||
            disabled ||
            event.target !== event.currentTarget
          )
            return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleActivate();
          }
        };
        const rowElement = createElement(
          "div",
          {
            className: joinClassNames(
              "platform-data-table__row",
              selected && "is-selected",
              disabled && "is-disabled",
              rowDraggable && "is-row-draggable",
              draggedRowId === rowId && "is-dragging",
              dropPlacement === "before" && "is-drop-before",
              dropPlacement === "after" && "is-drop-after",
              isRowExpanded?.(row) && "is-expanded",
              (rowMenu?.rowId === rowId || externalActionOpen) &&
                "is-menu-open",
              getRowClassName?.(row),
            ),
            role: "row",
            "aria-rowindex": paginationEnabled
              ? resolvedPageIndex * activePagination.pageSize +
                bodyEntryIndex +
                2
              : bodyEntryIndex + 2,
            tabIndex: onRowActivate && !disabled ? 0 : undefined,
            "aria-selected": hasSelection
              ? selected
                ? "true"
                : "false"
              : undefined,
            "aria-disabled": disabled ? "true" : undefined,
            "aria-label": getRowAriaLabel?.(row),
            style: { gridTemplateColumns },
            onClick: onRowActivate ? handleActivate : undefined,
            onKeyDown: handleRowKeyDown,
            onPointerEnter: () => {
              hoveredRowIdRef.current = rowId;
              onRowPointerEnter?.(row);
            },
            onPointerLeave: () => {
              if (hoveredRowIdRef.current === rowId) {
                hoveredRowIdRef.current = null;
              }
            },
            onFocus: onRowFocus ? () => onRowFocus(row) : undefined,
            draggable: rowDraggable,
            onDragStart: rowDraggable
              ? (event: ReactDragEvent<HTMLDivElement>) => {
                  const target = event.target as HTMLElement;
                  const interactiveTarget = target.closest(
                    "button, a, input, textarea, select, [contenteditable='true']",
                  );
                  if (interactiveTarget && interactiveTarget !== event.currentTarget) {
                    event.preventDefault();
                    return;
                  }
                  beginRowDrag(event, rowId);
                }
              : undefined,
            onDragEnd: rowDraggable
              ? () => {
                  if (!rowDropPendingRef.current) resetRowDrag();
                }
              : undefined,
            onDragOver: hasReordering
              ? (event: ReactDragEvent<HTMLDivElement>) => {
                  const sourceRow = findDraggedRow();
                  if (!sourceRow || !canDropRow(sourceRow, row)) return;
                  event.preventDefault();
                  event.stopPropagation();
                  event.dataTransfer.dropEffect = "move";
                  const placement = resolveDropPlacement(event);
                  setRowDropTarget((current) =>
                    current?.rowId === rowId &&
                    current.placement === placement
                      ? current
                      : { rowId, placement },
                  );
                }
              : undefined,
            onDrop: hasReordering
              ? (event: ReactDragEvent<HTMLDivElement>) => {
                  const sourceRow = findDraggedRow();
                  if (!sourceRow || !canDropRow(sourceRow, row)) return;
                  event.preventDefault();
                  event.stopPropagation();
                  const sourceRowId = getRowId(sourceRow);
                  const placement = resolveDropPlacement(event);
                  rowDropPendingRef.current = true;
                  setRowDropCommitted(true);
                  try {
                    const result = rowReordering?.onReorder({
                      row: sourceRow,
                      rowId: sourceRowId,
                      targetRow: row,
                      targetRowId: rowId,
                      placement,
                    });
                    if (result && typeof result.catch === "function") {
                      result.catch(reportRowReorderError);
                    }
                  } catch (reorderError) {
                    reportRowReorderError(reorderError);
                  }
                  scheduleRowDragReset();
                }
              : undefined,
            onContextMenu: (event) => {
              onRowContextMenu?.(event, row);
              if (!event.defaultPrevented && menuAvailable)
                openRowMenu(event, rowId, true);
            },
          },
          hasReorderColumn
            ? createElement(
                "div",
                {
                  className: "platform-data-table__cell is-reordering",
                  role: "cell",
                },
                renderReorderControl(row, rowId),
              )
            : null,
          hasSelection
            ? createElement(
                "div",
                {
                  className: "platform-data-table__cell is-selection",
                  role: "cell",
                },
                renderSelectionControl(
                  selected,
                  false,
                  selection?.ariaLabel?.(row) ||
                    `${selected ? "Deselect" : "Select"} row`,
                  () => toggleRowSelection(rowId),
                  !tableRow.getCanSelect(),
                  rowId,
                ),
              )
            : null,
          visibleColumns.map((column) => {
            const cell = rowCells.get(column.id);
            const customClassName =
              typeof column.className === "function"
                ? column.className(row)
                : column.className;
            return createElement(
              "div",
              {
                key: column.id,
                className: joinClassNames(
                  "platform-data-table__cell",
                  "is-start",
                  customClassName,
                ),
                role: "cell",
                "data-column-id": column.id,
              },
              cell
                ? flexRender(cell.column.columnDef.cell, cell.getContext())
                : null,
            );
          }),
          hasActions
            ? createElement(
                "div",
                {
                  className: "platform-data-table__cell is-actions",
                  role: "cell",
                },
                menuAvailable
                  ? createElement(
                      "button",
                      {
                        type: "button",
                        className: joinClassNames(
                          "platform-data-table__action-button",
                          (rowMenu?.rowId === rowId || externalActionOpen) &&
                            "is-open",
                        ),
                        "aria-label": `Open actions${getRowAriaLabel?.(row) ? ` for ${getRowAriaLabel(row)}` : ""}`,
                        "aria-haspopup": "menu",
                        "aria-expanded":
                          rowMenu?.rowId === rowId || externalActionOpen
                            ? "true"
                            : "false",
                        onClick: (event) => {
                          if (onRowActionTrigger) {
                            event.preventDefault();
                            event.stopPropagation();
                            onRowActionTrigger(event, row);
                            return;
                          }
                          openRowMenu(event, rowId);
                        },
                        onContextMenu: (event) => {
                          if (onRowActionTrigger) {
                            event.preventDefault();
                            event.stopPropagation();
                            onRowActionTrigger(event, row);
                            return;
                          }
                          openRowMenu(event, rowId, true);
                        },
                      },
                      createElement(EllipsisVertical, {
                        width: 16,
                        height: 16,
                        strokeWidth: 1.8,
                      }),
                    )
                  : null,
              )
            : null,
        );
        const expandedContent =
          isRowExpanded?.(row) && renderExpandedRow
            ? renderExpandedRow({
                row,
                rowId,
                rowIndex: renderedIndex,
                value: undefined,
              })
            : null;
        if (expandedContent == null)
          return createElement(
            "div",
            {
              key: rowId,
              className: joinClassNames(
                "platform-data-table__row-group",
                reorderShift === "up" && "is-reorder-shift-up",
                reorderShift === "down" && "is-reorder-shift-down",
                draggedRowId === rowId && "is-drag-origin",
                isSectionEnd && "is-section-end",
                ...groupedRowClassNames,
              ),
            },
            rowElement,
          );
        return createElement(
          "div",
          {
            key: rowId,
            className: joinClassNames(
              "platform-data-table__row-group is-expanded",
              reorderShift === "up" && "is-reorder-shift-up",
              reorderShift === "down" && "is-reorder-shift-down",
              draggedRowId === rowId && "is-drag-origin",
              isSectionEnd && "is-section-end",
              ...groupedRowClassNames,
            ),
          },
          rowElement,
          createElement(
            "div",
            { className: "platform-data-table__expanded-row", role: "row" },
            createElement(
              "div",
              {
                className: "platform-data-table__expanded-cell",
                role: "cell",
                "aria-colspan":
                  visibleColumns.length +
                  (hasReorderColumn ? 1 : 0) +
                  (hasSelection ? 1 : 0) +
                  (hasActions ? 1 : 0),
              },
              expandedContent,
            ),
          ),
        );
      }),
    );
  };

  const renderRowActionMenu = () => {
    if (!rowMenu || typeof document === "undefined" || !document.body)
      return null;
    const row = data.find((candidate) => getRowId(candidate) === rowMenu.rowId);
    if (!row) return null;
    const actions = resolveRowActions(row, rowMenu.rowId).filter(
      (action) => !action.hidden,
    );
    const context = createRowActionContext(row, rowMenu.rowId);
    const customContent = renderRowMenu?.({ ...context, actions });
    const content =
      customContent ||
      actions.map((action: PlatformDataTableAction<TData>) => {
        const deleteAction = isDeleteAction(action);
        const shareAction = isShareAction(action);
        return createElement(
          "button",
          {
            key: action.id,
            type: "button",
            role: "menuitem",
            className: joinClassNames(
              "platform-data-table__menu-item",
              (action.danger || deleteAction) && "is-danger",
              (action.separatorBefore || deleteAction) && "has-separator",
              deleteAction && "is-delete",
            ),
            disabled: action.disabled,
            "aria-keyshortcuts": deleteAction
              ? DELETE_ACTION_ARIA_SHORTCUTS
              : undefined,
            onClick: () => invokeRowAction(action, context),
          },
          createElement(
            "span",
            { className: "platform-data-table__menu-icon" },
            renderIcon(
              shareAction
                ? createElement(HugeiconsIcon, {
                    icon: Share01Icon,
                    className: "hugeicons hugeicons-share-01",
                    size: 15,
                    strokeWidth: 1.8,
                    "aria-hidden": true,
                  })
                : action.icon || (deleteAction ? Trash2 : undefined),
              "",
              15,
            ),
          ),
          createElement(
            "span",
            { className: "platform-data-table__menu-label" },
            action.label,
          ),
          deleteAction
            ? createElement(
                "span",
                {
                  className: "platform-data-table__menu-shortcut",
                  "aria-hidden": true,
                },
                DELETE_ACTION_SHORTCUT_LABEL,
              )
            : null,
        );
      });
    return createPortal(
      createElement(
        PlatformPopupSurface,
        {
          ref: rowMenuRef,
          className: "platform-data-table__floating-menu is-portaled",
          mode: "fixed",
          variant: "minimal",
          animation: "down-in",
          role: "menu",
          style: { left: rowMenuPosition.left, top: rowMenuPosition.top },
          onClick: (event) => event.stopPropagation(),
          onContextMenu: (event) => event.preventDefault(),
        },
        content,
      ),
      document.body,
    );
  };

  const renderToolbarFloatingMenu = () => {
    if (!toolbarMenu || typeof document === "undefined" || !document.body)
      return null;
    const content = (toolbar?.filters || []).flatMap(
      (filterConfig, filterIndex) => [
        (toolbar?.filters?.length || 0) > 1
          ? createElement(
              "div",
              {
                key: `${filterConfig.id}:label`,
                className: "platform-data-table__menu-heading",
              },
              filterConfig.label,
            )
          : null,
        ...filterConfig.options.map((option) => {
          const active = filterConfig.value === option.id;
          return createElement(
            "button",
            {
              key: `${filterConfig.id}:${option.id}`,
              type: "button",
              role: "menuitemradio",
              "aria-checked": active ? "true" : "false",
              className: "platform-data-table__menu-item",
              disabled: option.disabled,
              onClick: () => {
                filterConfig.onChange(option.id);
                resetPagination();
                closeMenus();
              },
            },
            createElement(
              "span",
              { className: "platform-data-table__menu-icon" },
              active ? createElement(Check, { width: 14, height: 14 }) : null,
            ),
            createElement(
              "span",
              { className: "platform-data-table__menu-copy" },
              createElement(
                "span",
                { className: "platform-data-table__menu-label" },
                option.label,
              ),
              option.description
                ? createElement(
                    "span",
                    { className: "platform-data-table__menu-description" },
                    option.description,
                  )
                : null,
            ),
          );
        }),
        filterIndex < (toolbar?.filters?.length || 0) - 1
          ? createElement("div", {
              key: `${filterConfig.id}:separator`,
              className: "platform-data-table__menu-separator",
            })
          : null,
      ],
    );
    return createPortal(
      createElement(
        PlatformPopupSurface,
        {
          ref: toolbarMenuRef,
          className: "platform-data-table__floating-menu is-portaled",
          mode: "fixed",
          variant: "minimal",
          animation: "down-in",
          role: "menu",
          style: {
            left: toolbarMenuPosition.left,
            top: toolbarMenuPosition.top,
          },
          onClick: (event) => event.stopPropagation(),
        },
        content,
      ),
      document.body,
    );
  };

  return createElement(
    "div",
    {
      ref: rootRef,
      className: joinClassNames(
        "platform-data-table",
        `is-${surface}`,
        `is-${layout}-layout`,
        variant === "minimalistic-ui" && "is-minimalistic-ui",
        variant === "catalog-ui" && "is-catalog-ui",
        paginationEnabled && "has-pagination",
        sticky && "has-sticky-header",
        draggedRowId && "has-active-row-reorder",
        rowDropCommitted && "is-row-drop-committed",
        className,
      ),
      style: rootStyle,
    },
    renderToolbar(),
    createElement(
      "div",
      {
        ref: surfaceRef,
        className: "platform-data-table__surface",
      },
      createElement(
        "section",
        {
          className: "platform-data-table__table",
          role: "table",
          "aria-label": ariaLabel,
          "aria-rowcount":
            Math.max(
              paginationEnabled || usesProgressiveCatalogRows
                ? totalRowCount
                : renderedRows.length,
              showEmptyStateRow ? 1 : 0,
            ) +
            renderedRowGroupCount +
            1,
          "aria-colcount":
            visibleColumns.length +
            (hasReorderColumn ? 1 : 0) +
            (hasSelection ? 1 : 0) +
            (hasActions ? 1 : 0),
        },
        createElement(
          "div",
          { className: "platform-data-table__sticky" },
          renderHeader(),
        ),
        createElement(
          "div",
          {
            ref: scrollRef,
            className: "platform-data-table__scroll",
            onScroll:
              usesProgressiveCatalogRows || incrementalLoading
                ? () => handleIncrementalScroll(scrollRef.current)
                : undefined,
          },
          renderBody(),
          incrementalLoadingActive
            ? createElement(PlatformLoadingState, {
                className: "platform-data-table__incremental-loading",
                message:
                  incrementalLoading?.loadingMessage || "Loading more...",
                centered: true,
              })
            : null,
        ),
      ),
      footer
        ? createElement(
            "div",
            { className: "platform-data-table__footer" },
            footer,
          )
        : null,
      renderPagination(),
    ),
    renderRowActionMenu(),
    renderToolbarFloatingMenu(),
  );
}

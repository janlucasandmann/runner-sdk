import {
  createElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  EllipsisVertical,
  LayoutGrid,
  List,
  ListFilter,
  Plus,
} from "lucide-react";
import {
  getNextPlatformDataTableSort,
  normalizePlatformDataTableIds,
  togglePlatformDataTableSelection,
  togglePlatformDataTableVisibleSelection,
} from "./data-table-state.js";
import { useAnimatedHeight } from "./use-animated-height.js";
import { DotLoader } from "../../ui/dot-loader/index.js";
import { PlatformPrimaryButton } from "../../ui/button/platform-button.js";
import { PlatformCheckbox } from "../../ui/checkbox/platform-checkbox.js";
import { PlatformSearch } from "../../ui/search/platform-search.js";
import { PlatformPopupSurface } from "../popup/platform-popup.js";
import type {
  PlatformDataTableAction,
  PlatformDataTableActionContext,
  PlatformDataTableColumn,
  PlatformDataTableIcon,
  PlatformDataTablePaginationState,
  PlatformDataTableProps,
  PlatformDataTableSortState,
} from "./data-table-types.js";

const DEFAULT_ACTION_MENU_WIDTH = 220;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const VIEWPORT_GUTTER = 8;

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
    createElement(ChevronsUpDown, {
      className: "platform-data-table__sort-icon-layer is-top",
      width: 14,
      height: 14,
      strokeWidth: 1.8,
    }),
    createElement(ChevronsUpDown, {
      className: "platform-data-table__sort-icon-layer is-bottom",
      width: 14,
      height: 14,
      strokeWidth: 1.8,
    }),
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
  toolbar,
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
  rowMinHeight = 58,
  style,
}: PlatformDataTableProps<TData>): ReactNode {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);
  const toolbarMenuRef = useRef<HTMLDivElement | null>(null);
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
  const paginationControlled = paginationConfig?.value !== undefined;
  const activePagination = normalizePaginationState(
    paginationControlled ? paginationConfig?.value : internalPagination,
  );
  const hasSelection = Boolean(selection?.enabled);
  const hasActions = Boolean(
    getRowActions || renderRowMenu || onRowActionTrigger,
  );

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
      commitSorting(
        getNextPlatformDataTableSort(
          activeSorting,
          column.id,
          Boolean(column.sortDescFirst),
        ),
      );
      resetPagination();
    },
    [activeSorting, commitSorting, resetPagination],
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
      return (
        getRowActions?.(row, {
          rowId,
          isSelected,
          selectedIds,
          selectedRows,
          targetRows,
        }) || []
      );
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

  const renderedRows = table.getRowModel().rows;
  const showEmptyStateRow =
    !loading && !error && (!data.length || !renderedRows.length);
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
      commitSelection(
        togglePlatformDataTableSelection(selectedIds, rowId),
        "row",
      );
    },
    [commitSelection, selectedIds],
  );

  const toggleVisibleSelection = useCallback(() => {
    commitSelection(
      togglePlatformDataTableVisibleSelection(
        selectedIds,
        visibleSelectableIds,
        !allVisibleSelected,
      ),
      "visible",
    );
  }, [allVisibleSelected, commitSelection, selectedIds, visibleSelectableIds]);

  const updateSearch = useCallback(
    (value: string) => {
      if (!searchControlled) setInternalSearchValue(value);
      toolbar?.search?.onChange?.(value);
      resetPagination();
    },
    [resetPagination, searchControlled, toolbar?.search],
  );

  const closeMenus = useCallback(() => {
    setRowMenu(null);
    setToolbarMenu(null);
  }, []);

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

  const gridTemplateColumns = useMemo(
    () =>
      [
        hasSelection ? "21px" : "",
        ...visibleColumns.map((column) => column.width || "minmax(120px, 1fr)"),
        hasActions ? "28px" : "",
      ]
        .filter(Boolean)
        .join(" "),
    [hasActions, hasSelection, visibleColumns],
  );

  const rootStyle = {
    ...style,
    "--platform-data-table-columns": gridTemplateColumns,
    "--platform-data-table-row-min-height": `${Math.max(36, rowMinHeight)}px`,
    "--platform-data-table-sticky-top":
      typeof stickyTop === "number" ? `${stickyTop}px` : stickyTop,
  } as CSSProperties;

  const renderSelectionControl = (
    selected: boolean,
    partial: boolean,
    label: string,
    onClick: () => void,
    disabled = false,
  ) =>
    createElement(PlatformCheckbox, {
      className: joinClassNames("platform-data-table__checkbox"),
      checked: selected,
      indeterminate: partial,
      "aria-label": label,
      disabled,
      onClick: (event: ReactMouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      },
    });

  const renderToolbar = () => {
    if (!toolbar) return null;
    const filters = toolbar.filters || [];
    const viewOptions = toolbar.view?.options || [];
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
            createElement(ListFilter, {
              width: 14,
              height: 14,
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
    if (loading)
      stateContent = createElement(
        "div",
        { className: "platform-data-table__state is-loading", role: "status" },
        createElement(DotLoader, {
          className: "platform-data-table__dot-loader",
          dotCount: 9,
          dotSize: 3,
          gap: 2,
          speed: 800,
          color: "currentColor",
        }),
        createElement("span", null, "Loading"),
      );
    else if (error)
      stateContent = createElement(
        "div",
        { className: "platform-data-table__state is-error", role: "alert" },
        error,
      );

    if (showEmptyStateRow) {
      const columnCount =
        visibleColumns.length + (hasSelection ? 1 : 0) + (hasActions ? 1 : 0);
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

    return createElement(
      "div",
      { className: "platform-data-table__body", role: "rowgroup" },
      renderedRows.map((tableRow, renderedIndex) => {
        const row = tableRow.original;
        const rowId = tableRow.id;
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
              isRowExpanded?.(row) && "is-expanded",
              (rowMenu?.rowId === rowId || externalActionOpen) &&
                "is-menu-open",
              getRowClassName?.(row),
            ),
            role: "row",
            "aria-rowindex": paginationEnabled
              ? resolvedPageIndex * activePagination.pageSize +
                renderedIndex +
                2
              : renderedIndex + 2,
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
            onPointerEnter: onRowPointerEnter
              ? () => onRowPointerEnter(row)
              : undefined,
            onFocus: onRowFocus ? () => onRowFocus(row) : undefined,
            onContextMenu: (event) => {
              onRowContextMenu?.(event, row);
              if (!event.defaultPrevented && menuAvailable)
                openRowMenu(event, rowId, true);
            },
          },
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
            { key: rowId, className: "platform-data-table__row-group" },
            rowElement,
          );
        return createElement(
          "div",
          {
            key: rowId,
            className: "platform-data-table__row-group is-expanded",
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
    const useSelectedRows =
      selectedIds.has(rowMenu.rowId) && selectedRows.length > 1;
    const targetRows = useSelectedRows ? selectedRows : [row];
    const targetIds = new Set(
      targetRows.map((targetRow) => getRowId(targetRow)),
    );
    const context: PlatformDataTableActionContext<TData> = {
      row,
      rowId: rowMenu.rowId,
      rows: targetRows,
      rowIds: targetIds,
      selectedRows,
      selectedIds,
      closeMenu: closeMenus,
    };
    const customContent = renderRowMenu?.({ ...context, actions });
    const content =
      customContent ||
      actions.map((action: PlatformDataTableAction<TData>) =>
        createElement(
          "button",
          {
            key: action.id,
            type: "button",
            role: "menuitem",
            className: joinClassNames(
              "platform-data-table__menu-item",
              action.danger && "is-danger",
              action.separatorBefore && "has-separator",
            ),
            disabled: action.disabled,
            onClick: () => {
              if (action.disabled) return;
              if (!action.keepOpen) closeMenus();
              const result = action.onSelect(context);
              if (result && typeof result.catch === "function") {
                result.catch((actionError) =>
                  console.error(
                    "[PlatformDataTable] Row action failed",
                    actionError,
                  ),
                );
              }
            },
          },
          createElement(
            "span",
            { className: "platform-data-table__menu-icon" },
            renderIcon(action.icon, "", 15),
          ),
          createElement(
            "span",
            { className: "platform-data-table__menu-label" },
            action.label,
          ),
        ),
      );
    return createPortal(
      createElement(
        PlatformPopupSurface,
        {
          ref: rowMenuRef,
          className: "platform-data-table__floating-menu",
          mode: "fixed",
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
          className: "platform-data-table__floating-menu",
          mode: "fixed",
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
        paginationEnabled && "has-pagination",
        sticky && "has-sticky-header",
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
              paginationEnabled ? totalRowCount : renderedRows.length,
              showEmptyStateRow ? 1 : 0,
            ) + 1,
          "aria-colcount":
            visibleColumns.length +
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
          { className: "platform-data-table__scroll" },
          renderBody(),
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

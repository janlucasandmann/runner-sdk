import type { CSSProperties, ComponentType, MouseEvent, ReactNode } from "react";
import type { SortingFn } from "@tanstack/react-table";

export type PlatformDataTableSortDirection = "asc" | "desc";
export type PlatformDataTableAlignment = "start" | "center" | "end";
export type PlatformDataTableSurface = "default" | "plain" | "glass";
export type PlatformDataTableLayout = "content" | "fill";
export type PlatformDataTableVariant = "default" | "minimalistic-ui" | "catalog-ui";

export interface PlatformDataTableSortState {
  id: string;
  direction: PlatformDataTableSortDirection;
}

export interface PlatformDataTableCellContext<TData> {
  row: TData;
  rowId: string;
  rowIndex: number;
  value: unknown;
}

export interface PlatformDataTableColumn<TData> {
  id: string;
  header: ReactNode;
  accessor?: keyof TData | ((row: TData) => unknown);
  cell?: (context: PlatformDataTableCellContext<TData>) => ReactNode;
  sortable?: boolean;
  sortDescFirst?: boolean;
  sortingFn?: SortingFn<TData>;
  width?: string;
  /** @deprecated Platform data columns are always left-aligned. */
  align?: PlatformDataTableAlignment;
  hideBelow?: number;
  className?: string | ((row: TData) => string);
  headerClassName?: string;
  ariaLabel?: string;
}

export interface PlatformDataTableSortingConfig {
  value?: PlatformDataTableSortState | null;
  defaultValue?: PlatformDataTableSortState | null;
  onChange?: (sorting: PlatformDataTableSortState | null) => void;
  manual?: boolean;
}

export interface PlatformDataTableSelectionChange<TData> {
  selectedIds: ReadonlySet<string>;
  selectedRows: readonly TData[];
  reason: "row" | "visible" | "programmatic";
}

export interface PlatformDataTableSelectionConfig<TData> {
  enabled?: boolean;
  value?: ReadonlySet<string> | readonly string[];
  defaultValue?: ReadonlySet<string> | readonly string[];
  onChange?: (change: PlatformDataTableSelectionChange<TData>) => void;
  isRowSelectable?: (row: TData) => boolean;
  ariaLabel?: (row: TData) => string;
}

export interface PlatformDataTablePaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface PlatformDataTablePaginationConfig {
  value?: PlatformDataTablePaginationState;
  defaultValue?: Partial<PlatformDataTablePaginationState>;
  onChange?: (state: PlatformDataTablePaginationState) => void;
  pageSizeOptions?: readonly number[];
  totalCount?: number;
  manual?: boolean;
}

export interface PlatformDataTableIncrementalLoadingConfig {
  hasMore: boolean;
  loading?: boolean;
  onLoadMore: () => void | Promise<void>;
  threshold?: number;
  loadingMessage?: ReactNode;
}

export interface PlatformDataTableSearchConfig<TData> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  manual?: boolean;
  getSearchText?: (row: TData) => string;
}

export interface PlatformDataTableFilterOption {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface PlatformDataTableFilter {
  id: string;
  label: string;
  value: string;
  options: readonly PlatformDataTableFilterOption[];
  onChange: (value: string) => void;
}

export interface PlatformDataTableViewOption {
  id: string;
  label: string;
  icon?: PlatformDataTableIcon;
}

export interface PlatformDataTableViewConfig {
  value: string;
  options: readonly PlatformDataTableViewOption[];
  onChange: (value: string) => void;
}

export type PlatformDataTableIcon =
  | ReactNode
  | ComponentType<{
      width?: number | string;
      height?: number | string;
      strokeWidth?: number | string;
      className?: string;
      "aria-hidden"?: boolean | "true" | "false";
    }>;

export interface PlatformDataTablePrimaryAction {
  label: string;
  icon?: PlatformDataTableIcon;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export interface PlatformDataTableToolbarConfig<TData> {
  title?: ReactNode;
  search?: PlatformDataTableSearchConfig<TData>;
  filters?: readonly PlatformDataTableFilter[];
  view?: PlatformDataTableViewConfig;
  primaryAction?: PlatformDataTablePrimaryAction;
  leading?: ReactNode;
  controlsLeading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

export interface PlatformDataTableRowGroup {
  id: string;
  label: ReactNode;
  ariaLabel?: string;
  color?: string;
  defaultExpanded?: boolean;
}

export interface PlatformDataTableRowGroupingConfig<TData> {
  groups: readonly PlatformDataTableRowGroup[];
  getGroupId: (row: TData) => string;
  expandedIds?: ReadonlySet<string> | readonly string[];
  onExpandedChange?: (expandedIds: ReadonlySet<string>) => void;
}

export type PlatformDataTableRowReorderPlacement = "before" | "after";

export interface PlatformDataTableRowReorderChange<TData> {
  row: TData;
  rowId: string;
  targetRow: TData;
  targetRowId: string;
  placement: PlatformDataTableRowReorderPlacement;
}

/**
 * Adds a dedicated drag handle without making the complete row draggable.
 * Consumers should keep a keyboard-accessible reorder action available when
 * ordering is part of the product workflow.
 */
export interface PlatformDataTableRowReorderingConfig<TData> {
  enabled?: boolean;
  isRowReorderable?: (row: TData) => boolean;
  canDrop?: (row: TData, targetRow: TData) => boolean;
  onReorder: (
    change: PlatformDataTableRowReorderChange<TData>,
  ) => void | Promise<void>;
  ariaLabel?: (row: TData) => string;
}

export interface PlatformDataTableActionContext<TData> {
  row: TData;
  rowId: string;
  rows: readonly TData[];
  rowIds: ReadonlySet<string>;
  selectedRows: readonly TData[];
  selectedIds: ReadonlySet<string>;
  closeMenu: () => void;
}

/**
 * Overrides a row action when its context row belongs to a multi-row
 * selection. Actions without this contract are intentionally omitted from a
 * multi-selection menu so a row-scoped destructive callback can never delete
 * only the row that happened to open the menu.
 */
export interface PlatformDataTableSelectedRowsAction<TData> {
  label?: ReactNode;
  icon?: PlatformDataTableIcon;
  onSelect: (context: PlatformDataTableActionContext<TData>) => void | Promise<void>;
  disabled?: boolean;
  hidden?: boolean;
  danger?: boolean;
  separatorBefore?: boolean;
  keepOpen?: boolean;
}

export interface PlatformDataTableAction<TData> {
  id: string;
  label: ReactNode;
  icon?: PlatformDataTableIcon;
  onSelect: (context: PlatformDataTableActionContext<TData>) => void | Promise<void>;
  disabled?: boolean;
  hidden?: boolean;
  danger?: boolean;
  separatorBefore?: boolean;
  keepOpen?: boolean;
  selectedRows?: PlatformDataTableSelectedRowsAction<TData>;
}

export interface PlatformDataTableRowActionState<TData> {
  rowId: string;
  isSelected: boolean;
  selectedIds: ReadonlySet<string>;
  selectedRows: readonly TData[];
  targetRows: readonly TData[];
}

export interface PlatformDataTableRowMenuContext<TData> extends PlatformDataTableActionContext<TData> {
  actions: readonly PlatformDataTableAction<TData>[];
}

export interface PlatformDataTableProps<TData> {
  rows: readonly TData[];
  columns: readonly PlatformDataTableColumn<TData>[];
  getRowId: (row: TData) => string;
  ariaLabel: string;
  sorting?: PlatformDataTableSortingConfig;
  selection?: PlatformDataTableSelectionConfig<TData>;
  pagination?: PlatformDataTablePaginationConfig | false;
  incrementalLoading?: PlatformDataTableIncrementalLoadingConfig;
  toolbar?: PlatformDataTableToolbarConfig<TData>;
  rowGrouping?: PlatformDataTableRowGroupingConfig<TData>;
  rowReordering?: PlatformDataTableRowReorderingConfig<TData>;
  getRowActions?: (row: TData, state: PlatformDataTableRowActionState<TData>) => readonly PlatformDataTableAction<TData>[];
  renderRowMenu?: (context: PlatformDataTableRowMenuContext<TData>) => ReactNode;
  onRowActionTrigger?: (event: MouseEvent, row: TData) => void;
  isRowActionOpen?: (row: TData) => boolean;
  onRowActivate?: (row: TData) => void;
  onRowContextMenu?: (event: MouseEvent, row: TData) => void;
  onRowPointerEnter?: (row: TData) => void;
  onRowFocus?: (row: TData) => void;
  isRowExpanded?: (row: TData) => boolean;
  renderExpandedRow?: (context: PlatformDataTableCellContext<TData>) => ReactNode;
  getRowClassName?: (row: TData) => string;
  getRowAriaLabel?: (row: TData) => string;
  isRowDisabled?: (row: TData) => boolean;
  loading?: boolean;
  error?: ReactNode;
  emptyState?: ReactNode;
  noResultsState?: ReactNode;
  footer?: ReactNode;
  className?: string;
  surface?: PlatformDataTableSurface;
  layout?: PlatformDataTableLayout;
  variant?: PlatformDataTableVariant;
  sticky?: boolean;
  stickyTop?: number | string;
  rowMinHeight?: number;
  style?: CSSProperties;
}

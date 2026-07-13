import type { PlatformDataTableSortState } from "./data-table-types.js";

export function normalizePlatformDataTableIds(values: ReadonlySet<string> | readonly string[] | undefined): Set<string> {
  const source = values instanceof Set ? [...values] : Array.isArray(values) ? values : [];
  return new Set(source.map((value) => String(value || "").trim()).filter(Boolean));
}

export function getNextPlatformDataTableSort(
  current: PlatformDataTableSortState | null,
  columnId: string,
  sortDescFirst = false,
): PlatformDataTableSortState {
  if (current?.id === columnId) {
    return {
      id: columnId,
      direction: current.direction === "asc" ? "desc" : "asc",
    };
  }
  return {
    id: columnId,
    direction: sortDescFirst ? "desc" : "asc",
  };
}

export function togglePlatformDataTableSelection(
  selectedIds: ReadonlySet<string>,
  rowId: string,
  selected?: boolean,
): Set<string> {
  const next = new Set(selectedIds);
  const shouldSelect = selected ?? !next.has(rowId);
  if (shouldSelect) next.add(rowId);
  else next.delete(rowId);
  return next;
}

export function togglePlatformDataTableVisibleSelection(
  selectedIds: ReadonlySet<string>,
  visibleIds: readonly string[],
  selected: boolean,
): Set<string> {
  const next = new Set(selectedIds);
  visibleIds.forEach((rowId) => {
    if (selected) next.add(rowId);
    else next.delete(rowId);
  });
  return next;
}

// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Copy } from "lucide-react";
import type { ComponentProps } from "react";
import { PlatformDataTable } from "./platform-data-table.js";
import type { PlatformDataTableColumn } from "./data-table-types.js";

interface TestRow {
  id: string;
  name: string;
  status: string;
}

const rows: TestRow[] = [
  { id: "row-b", name: "Beta", status: "Draft" },
  { id: "row-a", name: "Alpha", status: "Published" },
];

const columns: PlatformDataTableColumn<TestRow>[] = [
  {
    id: "name",
    header: "Name",
    accessor: "name",
    sortable: true,
    width: "minmax(180px, 1fr)",
  },
  {
    id: "status",
    header: "Status",
    accessor: "status",
    sortable: true,
    width: "120px",
    align: "end",
  },
];

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

function renderTable(overrides: Partial<ComponentProps<typeof PlatformDataTable<TestRow>>> = {}) {
  return render(
    <PlatformDataTable<TestRow>
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      ariaLabel="Test resources"
      getRowAriaLabel={(row) => row.name}
      {...overrides}
    />,
  );
}

function getRenderedNames(): string[] {
  return screen.getAllByRole("row").slice(1).map((row) => within(row).getByText(/Alpha|Beta/).textContent || "");
}

describe("PlatformDataTable", () => {
  it("sorts rows and exposes the active direction", async () => {
    const user = userEvent.setup();
    renderTable({ sorting: { defaultValue: { id: "name", direction: "asc" } } });

    expect(getRenderedNames()).toEqual(["Alpha", "Beta"]);
    expect(screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort")).toBe("ascending");

    const sortButton = screen.getByRole("button", { name: "Sort Name descending" });
    expect(sortButton.querySelector(".platform-data-table__sort-icon")?.classList.contains("is-bottom-active")).toBe(true);
    expect(sortButton.querySelectorAll(".lucide-chevrons-up-down")).toHaveLength(2);
    expect(sortButton.querySelector(".lucide-arrow-up-down")).toBeNull();

    await user.click(sortButton);

    expect(getRenderedNames()).toEqual(["Beta", "Alpha"]);
    expect(screen.getByRole("columnheader", { name: /Name/ }).getAttribute("aria-sort")).toBe("descending");
    expect(screen.getByRole("button", { name: "Sort Name ascending" }).querySelector(".platform-data-table__sort-icon")?.classList.contains("is-top-active")).toBe(true);
  });

  it("filters through the standard toolbar search", async () => {
    const user = userEvent.setup();
    renderTable({
      toolbar: {
        search: {
          placeholder: "Search resources",
          getSearchText: (row) => `${row.name} ${row.status}`,
        },
      },
    });

    await user.type(screen.getByRole("searchbox", { name: "Search resources" }), "published");

    expect(getRenderedNames()).toEqual(["Alpha"]);
  });

  it("renders the optional toolbar outside the persistent table surface", () => {
    const { container, rerender } = renderTable({
      toolbar: {
        title: "All Resources",
        search: { placeholder: "Search resources" },
      },
    });
    const toolbar = container.querySelector(".platform-data-table__toolbar");
    const table = screen.getByRole("table", { name: "Test resources" });
    const surface = container.querySelector(".platform-data-table__surface");
    const controls = container.querySelector(".platform-data-table__toolbar-controls");
    const search = screen.getByRole("searchbox", { name: "Search resources" });

    expect(toolbar).not.toBeNull();
    expect(screen.getByRole("heading", { name: "All Resources", level: 2 })).not.toBeNull();
    expect(controls?.contains(search)).toBe(true);
    expect(search.closest("[data-platform-search='true']")).not.toBeNull();
    expect(table.contains(toolbar)).toBe(false);
    expect(toolbar?.nextElementSibling).toBe(surface);
    expect(surface?.contains(table)).toBe(true);
    expect(within(table).getByRole("columnheader", { name: /Name/ })).not.toBeNull();

    rerender(
      <PlatformDataTable<TestRow>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Test resources"
      />,
    );

    expect(container.querySelector(".platform-data-table__toolbar")).toBeNull();
    expect(screen.getByRole("table", { name: "Test resources" })).not.toBeNull();
    expect(screen.getByRole("columnheader", { name: /Name/ })).not.toBeNull();

    rerender(
      <PlatformDataTable<TestRow>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Test resources"
        toolbar={{}}
      />,
    );

    expect(container.querySelector(".platform-data-table__toolbar")).toBeNull();
  });

  it("places an icon-only filter directly beside the toolbar title", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderTable({
      toolbar: {
        title: "All Resources",
        search: { placeholder: "Search resources" },
        filters: [{
          id: "status",
          label: "Status",
          value: "all",
          onChange,
          options: [
            { id: "all", label: "All" },
            { id: "published", label: "Published" },
          ],
        }],
      },
    });

    const title = screen.getByRole("heading", { name: "All Resources", level: 2 });
    const filterButton = screen.getByRole("button", { name: "Filter" });
    expect(title.nextElementSibling).toBe(filterButton);
    expect(filterButton.classList.contains("is-icon-only")).toBe(true);
    expect(filterButton.querySelector(".lucide-list-filter")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Sort" })).toBeNull();

    await user.click(filterButton);
    await user.click(screen.getByRole("menuitemradio", { name: "Published" }));
    expect(onChange).toHaveBeenCalledWith("published");
  });

  it("supports a fill layout with an internally scrollable table surface", () => {
    const { container } = renderTable({ layout: "fill" });
    const root = container.querySelector(".platform-data-table");
    const table = screen.getByRole("table", { name: "Test resources" });

    expect(root?.classList.contains("is-fill-layout")).toBe(true);
    expect(root?.classList.contains("is-content-layout")).toBe(false);
    expect(table.classList.contains("platform-data-table__scroll")).toBe(true);
  });

  it("paginates rows and keeps navigation outside the scroll viewport", async () => {
    const user = userEvent.setup();
    const paginatedRows = Array.from({ length: 22 }, (_, index) => ({
      id: `row-${index + 1}`,
      name: `Item ${index + 1}`,
      status: "Active",
    }));
    const { container } = renderTable({ rows: paginatedRows, layout: "fill", pagination: {} });
    const table = screen.getByRole("table", { name: "Test resources" });
    const pagination = screen.getByRole("navigation", { name: "Test resources pagination" });

    expect(screen.getByText("1-20 of 22")).not.toBeNull();
    expect(screen.getAllByRole("row")).toHaveLength(21);
    expect(table.contains(pagination)).toBe(false);
    expect(container.querySelector(".platform-data-table__surface")?.lastElementChild).toBe(pagination);

    await user.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByText("21-22 of 22")).not.toBeNull();
    expect(screen.getByRole("row", { name: "Item 21" })).not.toBeNull();
    expect(screen.queryByRole("row", { name: "Item 1" })).toBeNull();

    await user.selectOptions(screen.getByRole("combobox", { name: "Rows per page" }), "50");

    expect(screen.getByText("1-22 of 22")).not.toBeNull();
    expect(screen.getAllByRole("row")).toHaveLength(23);
  });

  it("left-aligns every data column regardless of legacy alignment settings", () => {
    const { container } = renderTable();
    const statusCells = Array.from(container.querySelectorAll<HTMLElement>('[data-column-id="status"]'));

    expect(statusCells.length).toBeGreaterThan(1);
    expect(statusCells.every((cell) => cell.classList.contains("is-start"))).toBe(true);
    expect(statusCells.some((cell) => cell.classList.contains("is-end"))).toBe(false);
  });

  it("supports row selection and partial select-all state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderTable({
      selection: {
        enabled: true,
        onChange,
        ariaLabel: (row) => `Select ${row.name}`,
      },
    });

    await user.click(screen.getByRole("checkbox", { name: "Select Alpha" }));
    expect(screen.getByRole("checkbox", { name: "Select all visible rows" }).getAttribute("aria-checked")).toBe("mixed");

    await user.click(screen.getByRole("checkbox", { name: "Select all visible rows" }));
    const latestChange = onChange.mock.calls.at(-1)?.[0];
    expect([...latestChange.selectedIds].sort()).toEqual(["row-a", "row-b"]);
  });

  it("passes selected rows to the shared portal action menu", async () => {
    const user = userEvent.setup();
    const duplicate = vi.fn();
    renderTable({
      selection: {
        enabled: true,
        defaultValue: new Set(["row-a", "row-b"]),
        ariaLabel: (row) => `Select ${row.name}`,
      },
      getRowActions: () => [{
        id: "duplicate",
        label: "Duplicate",
        icon: Copy,
        onSelect: duplicate,
      }],
    });

    await user.click(screen.getByRole("button", { name: "Open actions for Alpha" }));
    await user.click(screen.getByRole("menuitem", { name: "Duplicate" }));

    expect(duplicate).toHaveBeenCalledTimes(1);
    expect(duplicate.mock.calls[0]?.[0].rows).toHaveLength(2);
  });

  it("activates a focused row with the keyboard", async () => {
    const user = userEvent.setup();
    const onRowActivate = vi.fn();
    renderTable({ onRowActivate });
    const alphaRow = screen.getByRole("row", { name: "Alpha" });

    alphaRow.focus();
    await user.keyboard("{Enter}");

    expect(onRowActivate).toHaveBeenCalledWith(expect.objectContaining({ id: "row-a" }));
  });

  it("renders expanded row content through the shared row surface", () => {
    renderTable({
      isRowExpanded: (row) => row.id === "row-a",
      renderExpandedRow: ({ row }) => <div>Details for {row.name}</div>,
    });

    expect(screen.getByText("Details for Alpha")).not.toBeNull();
    expect(screen.queryByText("Details for Beta")).toBeNull();
  });

  it("delegates an action trigger to externally managed menus", async () => {
    const user = userEvent.setup();
    const onRowActionTrigger = vi.fn();
    renderTable({ onRowActionTrigger });

    await user.click(screen.getByRole("button", { name: "Open actions for Alpha" }));

    expect(onRowActionTrigger).toHaveBeenCalledTimes(1);
    expect(onRowActionTrigger.mock.calls[0]?.[1]).toEqual(expect.objectContaining({ id: "row-a" }));
  });

  it("uses the canonical loading and empty states", () => {
    const { rerender } = renderTable({ rows: [], loading: true });
    expect(screen.getByRole("status").textContent).toContain("Loading");
    expect(screen.getByRole("columnheader", { name: /Name/ })).not.toBeNull();

    rerender(
      <PlatformDataTable<TestRow>
        rows={[]}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Test resources"
        emptyState="No resources yet"
      />,
    );
    expect(screen.getByText("No resources yet")).not.toBeNull();
  });

  it("animates the shared nine-dot loading sequence", () => {
    vi.useFakeTimers();
    const { container } = renderTable({ rows: [], loading: true });
    const dots = Array.from(container.querySelectorAll<HTMLElement>(".platform-data-table__dot-loader > span"));
    const initialOpacities = dots.map((dot) => dot.style.opacity);

    expect(dots).toHaveLength(9);

    act(() => vi.advanceTimersByTime(62));

    expect(dots.map((dot) => dot.style.opacity)).not.toEqual(initialOpacities);
  });
});

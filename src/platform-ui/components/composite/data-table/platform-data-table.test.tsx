// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

function renderTable(
  overrides: Partial<ComponentProps<typeof PlatformDataTable<TestRow>>> = {},
) {
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
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getByText(/Alpha|Beta/).textContent || "");
}

describe("PlatformDataTable", () => {
  it("sorts rows and exposes the active direction", async () => {
    const user = userEvent.setup();
    renderTable({
      sorting: { defaultValue: { id: "name", direction: "asc" } },
    });

    expect(getRenderedNames()).toEqual(["Alpha", "Beta"]);
    expect(
      screen
        .getByRole("columnheader", { name: /Name/ })
        .getAttribute("aria-sort"),
    ).toBe("ascending");

    const sortButton = screen.getByRole("button", {
      name: "Sort Name descending",
    });
    expect(
      sortButton
        .querySelector(".platform-data-table__sort-icon")
        ?.classList.contains("is-bottom-active"),
    ).toBe(true);
    expect(
      sortButton.querySelectorAll(".lucide-chevrons-up-down"),
    ).toHaveLength(2);
    expect(sortButton.querySelector(".lucide-arrow-up-down")).toBeNull();

    await user.click(sortButton);

    expect(getRenderedNames()).toEqual(["Beta", "Alpha"]);
    expect(
      screen
        .getByRole("columnheader", { name: /Name/ })
        .getAttribute("aria-sort"),
    ).toBe("descending");
    expect(
      screen
        .getByRole("button", { name: "Sort Name ascending" })
        .querySelector(".platform-data-table__sort-icon")
        ?.classList.contains("is-top-active"),
    ).toBe(true);
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

    await user.type(
      screen.getByRole("searchbox", { name: "Search resources" }),
      "published",
    );

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
    const controls = container.querySelector(
      ".platform-data-table__toolbar-controls",
    );
    const search = screen.getByRole("searchbox", { name: "Search resources" });

    expect(toolbar).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "All Resources", level: 2 }),
    ).not.toBeNull();
    expect(controls?.contains(search)).toBe(true);
    expect(search.closest("[data-platform-search='true']")).not.toBeNull();
    expect(table.contains(toolbar)).toBe(false);
    expect(toolbar?.nextElementSibling).toBe(surface);
    expect(surface?.contains(table)).toBe(true);
    expect(
      within(table).getByRole("columnheader", { name: /Name/ }),
    ).not.toBeNull();

    rerender(
      <PlatformDataTable<TestRow>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Test resources"
      />,
    );

    expect(container.querySelector(".platform-data-table__toolbar")).toBeNull();
    expect(
      screen.getByRole("table", { name: "Test resources" }),
    ).not.toBeNull();
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
        filters: [
          {
            id: "status",
            label: "Status",
            value: "all",
            onChange,
            options: [
              { id: "all", label: "All" },
              { id: "published", label: "Published" },
            ],
          },
        ],
      },
    });

    const title = screen.getByRole("heading", {
      name: "All Resources",
      level: 2,
    });
    const filterButton = screen.getByRole("button", { name: "Filter" });
    expect(title.nextElementSibling).toBe(filterButton);
    expect(filterButton.classList.contains("is-icon-only")).toBe(true);
    expect(filterButton.querySelector(".lucide-list-filter")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Sort" })).toBeNull();

    await user.click(filterButton);
    expect(screen.getByRole("menu").classList.contains("is-minimal")).toBe(true);
    await user.click(screen.getByRole("menuitemradio", { name: "Published" }));
    expect(onChange).toHaveBeenCalledWith("published");
  });

  it("keeps leading navigation at the left edge before toolbar filters", () => {
    const { container } = renderTable({
      toolbar: {
        leading: <nav aria-label="Resource types">Types</nav>,
        filters: [
          {
            id: "status",
            label: "Status",
            value: "all",
            onChange: () => undefined,
            options: [{ id: "all", label: "All" }],
          },
        ],
      },
    });

    const toolbar = container.querySelector(".platform-data-table__toolbar");
    const leading = container.querySelector(
      ".platform-data-table__toolbar-leading",
    );
    const filterButton = screen.getByRole("button", { name: "Filter" });

    expect(toolbar?.firstElementChild).toBe(leading);
    expect(leading?.nextElementSibling).toBe(filterButton);
  });

  it("places controls-leading content immediately before search", () => {
    const { container } = renderTable({
      toolbar: {
        search: { placeholder: "Search resources" },
        controlsLeading: <button type="button">Create resource</button>,
      },
    });

    const controls = container.querySelector(
      ".platform-data-table__toolbar-controls",
    );
    const controlsLeading = container.querySelector(
      ".platform-data-table__toolbar-controls-leading",
    );
    const search = screen.getByRole("searchbox", { name: "Search resources" });

    expect(controls?.firstElementChild).toBe(controlsLeading);
    expect(controlsLeading?.nextElementSibling?.contains(search)).toBe(true);
  });

  it("allows an explicitly iconless primary action", () => {
    renderTable({
      toolbar: {
        primaryAction: {
          label: "Manage Repos",
          icon: null,
          onClick: () => undefined,
        },
      },
    });

    expect(
      screen.getByRole("button", { name: "Manage Repos" }).querySelector("svg"),
    ).toBeNull();
  });

  it("keeps the fill-layout header outside the row scroll viewport", () => {
    const { container } = renderTable({ layout: "fill" });
    const root = container.querySelector(".platform-data-table");
    const table = screen.getByRole("table", { name: "Test resources" });
    const scrollViewport = container.querySelector(
      ".platform-data-table__scroll",
    );
    const header = container.querySelector(
      ".platform-data-table__header-group",
    );
    const body = container.querySelector(".platform-data-table__body");

    expect(root?.classList.contains("is-fill-layout")).toBe(true);
    expect(root?.classList.contains("is-content-layout")).toBe(false);
    expect(table.classList.contains("platform-data-table__table")).toBe(true);
    expect(table.contains(scrollViewport)).toBe(true);
    expect(scrollViewport?.contains(body)).toBe(true);
    expect(scrollViewport?.contains(header)).toBe(false);
  });

  it("exposes the minimalistic UI variant without changing the default table", () => {
    const { container, rerender } = renderTable({ variant: "minimalistic-ui" });
    expect(
      container.querySelector(".platform-data-table.is-minimalistic-ui"),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".platform-data-table.is-minimalistic-ui .platform-data-table__surface",
      ),
    ).not.toBeNull();

    rerender(
      <PlatformDataTable<TestRow>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Test resources"
      />,
    );
    expect(
      container.querySelector(".platform-data-table.is-minimalistic-ui"),
    ).toBeNull();
  });

  it("exposes the catalog UI variant with a full toolbar stack and roomier rows", () => {
    const { container } = renderTable({
      variant: "catalog-ui",
      toolbar: {
        leading: <nav aria-label="Catalog categories">Categories</nav>,
        search: { placeholder: "Search catalog" },
      },
    });
    const root = container.querySelector<HTMLElement>(
      ".platform-data-table.is-catalog-ui",
    );
    const toolbar = container.querySelector(".platform-data-table__toolbar");
    const leading = container.querySelector(
      ".platform-data-table__toolbar-leading",
    );
    const controls = container.querySelector(
      ".platform-data-table__toolbar-controls",
    );
    const search = screen.getByRole("searchbox", { name: "Search catalog" });

    expect(root).not.toBeNull();
    expect(root?.style.getPropertyValue("--platform-data-table-row-min-height")).toBe(
      "72px",
    );
    expect(toolbar?.classList.contains("has-title-line")).toBe(true);
    expect(toolbar?.firstElementChild).toBe(leading);
    expect(controls?.contains(search)).toBe(true);
  });

  it("progressively reveals catalog rows in shared 20 then 10 row increments", () => {
    const catalogRows: TestRow[] = Array.from({ length: 35 }, (_, index) => ({
      id: `resource-${index + 1}`,
      name: `Resource ${String(index + 1).padStart(2, "0")}`,
      status: "Published",
    }));
    const { container } = renderTable({
      rows: catalogRows,
      variant: "catalog-ui",
      pagination: false,
    });

    expect(screen.getByText("Resource 20")).not.toBeNull();
    expect(screen.queryByText("Resource 21")).toBeNull();
    expect(screen.getByRole("table").getAttribute("aria-rowcount")).toBe("36");

    const scroll = container.querySelector<HTMLElement>(
      ".platform-data-table__scroll",
    );
    expect(scroll).not.toBeNull();
    Object.defineProperties(scroll as HTMLElement, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 600, writable: true },
    });

    fireEvent.scroll(scroll as HTMLElement);
    expect(screen.getByText("Resource 30")).not.toBeNull();
    expect(screen.queryByText("Resource 31")).toBeNull();
  });

  it("progressively reveals catalog rows when the overview page owns scrolling", async () => {
    const catalogRows: TestRow[] = Array.from({ length: 35 }, (_, index) => ({
      id: `resource-${index + 1}`,
      name: `Resource ${String(index + 1).padStart(2, "0")}`,
      status: "Published",
    }));
    const { container } = renderTable({
      rows: catalogRows,
      variant: "catalog-ui",
      pagination: false,
    });
    const scroll = container.querySelector<HTMLElement>(
      ".platform-data-table__scroll",
    );
    expect(scroll).not.toBeNull();
    Object.defineProperties(scroll as HTMLElement, {
      // Some overview layouts report a nominal inner scroll range even while
      // their page-level container is the surface that actually scrolls.
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 0, writable: true },
      getBoundingClientRect: {
        configurable: true,
        value: () => ({
          top: 200,
          right: 800,
          bottom: 760,
          left: 0,
          width: 800,
          height: 560,
          x: 0,
          y: 200,
          toJSON: () => ({}),
        }),
      },
    });

    expect(screen.getByText("Resource 20")).not.toBeNull();
    expect(screen.queryByText("Resource 21")).toBeNull();

    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByText("Resource 30")).not.toBeNull();
    });
    expect(screen.queryByText("Resource 31")).toBeNull();
  });

  it("renders ordered row groups that can be expanded and collapsed", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const { container } = renderTable({
      rowGrouping: {
        groups: [
          {
            id: "published",
            label: "Published",
            ariaLabel: "Published",
            color: "#4da3ff",
          },
          {
            id: "draft",
            label: "Draft",
            ariaLabel: "Draft",
            color: "#7effff",
          },
        ],
        getGroupId: (row) => row.status.toLowerCase(),
        onExpandedChange,
      },
    });
    const table = screen.getByRole("table", { name: "Test resources" });
    const groupButtons = within(table).getAllByRole("button", {
      name: /Collapse (Published|Draft)/,
    });
    const publishedButton = within(table).getByRole("button", {
      name: "Collapse Published",
    });

    expect(groupButtons.map((button) => button.textContent)).toEqual([
      "Published1",
      "Draft1",
    ]);
    expect(
      publishedButton.style.getPropertyValue(
        "--platform-data-table-row-group-color",
      ),
    ).toBe("#4da3ff");
    expect(table.getAttribute("aria-rowcount")).toBe("5");
    expect(
      container.querySelectorAll(".platform-data-table__group-header"),
    ).toHaveLength(2);
    const alphaRow = screen.getByRole("row", { name: "Alpha" });
    const betaRow = screen.getByRole("row", { name: "Beta" });
    expect(alphaRow).not.toBeNull();
    expect(betaRow).not.toBeNull();
    expect(alphaRow.parentElement?.classList.contains("is-section-end")).toBe(
      true,
    );
    expect(betaRow.parentElement?.classList.contains("is-section-end")).toBe(
      true,
    );
    expect(alphaRow.parentElement?.classList.contains("is-grouped-row")).toBe(
      true,
    );
    expect(
      alphaRow.parentElement?.classList.contains("has-group-indicator"),
    ).toBe(true);

    await user.click(publishedButton);

    expect(screen.queryByRole("row", { name: "Alpha" })).toBeNull();
    expect(screen.getByRole("row", { name: "Beta" })).not.toBeNull();
    expect(
      within(table).getByRole("button", { name: "Expand Published" }),
    ).not.toBeNull();
    expect(onExpandedChange).toHaveBeenLastCalledWith(new Set(["draft"]));

    await user.click(
      within(table).getByRole("button", { name: "Expand Published" }),
    );

    expect(screen.getByRole("row", { name: "Alpha" })).not.toBeNull();
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      new Set(["published", "draft"]),
    );
  });

  it("reorders rows from a dedicated drag handle", () => {
    const onReorder = vi.fn();
    renderTable({
      rowReordering: {
        ariaLabel: (row) => `Reorder ${row.name}`,
        onReorder,
      },
    });
    const dataTransfer = {
      effectAllowed: "none",
      dropEffect: "none",
      setData: vi.fn(),
      getData: vi.fn(),
    };
    const targetRow = screen.getByRole("row", { name: "Beta" });
    Object.defineProperty(targetRow, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        top: 0,
        bottom: 40,
        left: 0,
        right: 400,
        width: 400,
        height: 40,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.dragStart(screen.getByRole("button", { name: "Reorder Alpha" }), {
      dataTransfer,
    });
    const dragOverEvent = createEvent.dragOver(targetRow, { dataTransfer });
    Object.defineProperty(dragOverEvent, "clientY", { value: 5 });
    fireEvent(targetRow, dragOverEvent);
    expect(targetRow.classList.contains("is-drop-before")).toBe(true);
    expect(
      targetRow.parentElement?.classList.contains("is-reorder-shift-down"),
    ).toBe(true);
    expect(
      targetRow
        .closest(".platform-data-table")
        ?.classList.contains("has-active-row-reorder"),
    ).toBe(true);
    const dropEvent = createEvent.drop(targetRow, { dataTransfer });
    Object.defineProperty(dropEvent, "clientY", { value: 5 });
    fireEvent(targetRow, dropEvent);

    expect(onReorder).toHaveBeenCalledWith({
      row: rows[1],
      rowId: "row-a",
      targetRow: rows[0],
      targetRowId: "row-b",
      placement: "before",
    });
  });

  it("supports full-row dragging without reserving a reorder-handle column", () => {
    const onReorder = vi.fn();
    renderTable({
      rowReordering: {
        activation: "row",
        onReorder,
      },
    });
    const dataTransfer = {
      effectAllowed: "none",
      dropEffect: "none",
      setData: vi.fn(),
      getData: vi.fn(),
    };
    const sourceRow = screen.getByRole("row", { name: "Alpha" });
    const targetRow = screen.getByRole("row", { name: "Beta" });
    Object.defineProperty(targetRow, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        top: 0,
        bottom: 40,
        left: 0,
        right: 400,
        width: 400,
        height: 40,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    expect(sourceRow.getAttribute("draggable")).toBe("true");
    expect(document.querySelector(".platform-data-table__reorder-handle")).toBeNull();
    expect(document.querySelector(".platform-data-table__header-cell.is-reordering")).toBeNull();

    fireEvent.dragStart(sourceRow, { dataTransfer });
    const dropEvent = createEvent.drop(targetRow, { dataTransfer });
    Object.defineProperty(dropEvent, "clientY", { value: 35 });
    fireEvent(targetRow, dropEvent);

    expect(onReorder).toHaveBeenCalledWith({
      row: rows[1],
      rowId: "row-a",
      targetRow: rows[0],
      targetRowId: "row-b",
      placement: "after",
    });
  });

  it("supports embedded minimal tables without toolbar, footer, or pagination chrome", () => {
    const { container } = renderTable({
      variant: "minimalistic-ui",
      surface: "plain",
      sticky: false,
      pagination: false,
    });

    expect(container.querySelector(".platform-data-table__toolbar")).toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(
      container.querySelector(".platform-data-table__pagination"),
    ).toBeNull();
    expect(screen.getByRole("columnheader", { name: /Name/ })).not.toBeNull();
    expect(
      screen.getByRole("table", { name: "Test resources" }),
    ).not.toBeNull();
  });

  it("paginates rows and keeps navigation outside the scroll viewport", async () => {
    const user = userEvent.setup();
    const paginatedRows = Array.from({ length: 22 }, (_, index) => ({
      id: `row-${index + 1}`,
      name: `Item ${index + 1}`,
      status: "Active",
    }));
    const { container } = renderTable({
      rows: paginatedRows,
      layout: "fill",
      pagination: {},
    });
    const table = screen.getByRole("table", { name: "Test resources" });
    const pagination = screen.getByRole("navigation", {
      name: "Test resources pagination",
    });

    expect(screen.getByText("1-20 of 22")).not.toBeNull();
    expect(screen.getAllByRole("row")).toHaveLength(21);
    expect(table.contains(pagination)).toBe(false);
    expect(
      container.querySelector(".platform-data-table__surface")
        ?.lastElementChild,
    ).toBe(pagination);

    await user.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByText("21-22 of 22")).not.toBeNull();
    expect(screen.getByRole("row", { name: "Item 21" })).not.toBeNull();
    expect(screen.queryByRole("row", { name: "Item 1" })).toBeNull();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Rows per page" }),
      "50",
    );

    expect(screen.getByText("1-22 of 22")).not.toBeNull();
    expect(screen.getAllByRole("row")).toHaveLength(23);
  });

  it("left-aligns every data column regardless of legacy alignment settings", () => {
    const { container } = renderTable();
    const statusCells = Array.from(
      container.querySelectorAll<HTMLElement>('[data-column-id="status"]'),
    );

    expect(statusCells.length).toBeGreaterThan(1);
    expect(
      statusCells.every((cell) => cell.classList.contains("is-start")),
    ).toBe(true);
    expect(statusCells.some((cell) => cell.classList.contains("is-end"))).toBe(
      false,
    );
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
    expect(
      screen
        .getByRole("checkbox", { name: "Select all visible rows" })
        .getAttribute("aria-checked"),
    ).toBe("mixed");

    await user.click(
      screen.getByRole("checkbox", { name: "Select all visible rows" }),
    );
    const latestChange = onChange.mock.calls.at(-1)?.[0];
    expect([...latestChange.selectedIds].sort()).toEqual(["row-a", "row-b"]);
  });

  it("expands and contracts checkbox selection with Shift+Arrow", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderTable({
      selection: {
        enabled: true,
        onChange,
        ariaLabel: (row) => `Select ${row.name}`,
      },
    });

    const betaCheckbox = screen.getByRole("checkbox", {
      name: "Select Beta",
    });
    const alphaCheckbox = screen.getByRole("checkbox", {
      name: "Select Alpha",
    });

    await user.click(alphaCheckbox);
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");

    expect([
      ...(onChange.mock.calls.at(-1)?.[0].selectedIds || []),
    ].sort()).toEqual(["row-a", "row-b"]);
    expect(document.activeElement).toBe(betaCheckbox);

    await user.keyboard("{Shift>}{ArrowDown}{/Shift}");

    expect([
      ...(onChange.mock.calls.at(-1)?.[0].selectedIds || []),
    ].sort()).toEqual(["row-a"]);
    expect(document.activeElement).toBe(alphaCheckbox);

    await user.click(alphaCheckbox);
    await user.click(betaCheckbox);
    await user.keyboard("{Shift>}{ArrowDown}{/Shift}");

    expect([
      ...(onChange.mock.calls.at(-1)?.[0].selectedIds || []),
    ].sort()).toEqual(["row-a", "row-b"]);
    expect(document.activeElement).toBe(alphaCheckbox);

    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");

    expect([
      ...(onChange.mock.calls.at(-1)?.[0].selectedIds || []),
    ].sort()).toEqual(["row-b"]);
    expect(document.activeElement).toBe(betaCheckbox);
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
      getRowActions: () => [
        {
          id: "duplicate",
          label: "Duplicate",
          icon: Copy,
          onSelect: vi.fn(),
          selectedRows: {
            label: "Duplicate selected",
            onSelect: duplicate,
          },
        },
      ],
    });

    await user.click(
      screen.getByRole("button", { name: "Open actions for Alpha" }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: "Duplicate selected" }),
    );

    expect(duplicate).toHaveBeenCalledTimes(1);
    expect(duplicate.mock.calls[0]?.[0].rows).toHaveLength(2);
  });

  it("omits row-only actions from a multi-row selection menu", async () => {
    const user = userEvent.setup();
    renderTable({
      selection: {
        enabled: true,
        defaultValue: new Set(["row-a", "row-b"]),
        ariaLabel: (row) => `Select ${row.name}`,
      },
      getRowActions: () => [
        {
          id: "rename",
          label: "Rename",
          onSelect: vi.fn(),
        },
        {
          id: "delete",
          label: "Delete",
          onSelect: vi.fn(),
          selectedRows: {
            label: "Delete selected",
            onSelect: vi.fn(),
          },
        },
      ],
    });

    await user.click(
      screen.getByRole("button", { name: "Open actions for Alpha" }),
    );

    expect(screen.queryByRole("menuitem", { name: "Rename" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Delete" })).toBeNull();
    expect(
      screen.getByRole("menuitem", { name: "Delete selected" }),
    ).not.toBeNull();
  });

  it("uses the minimal popup variant for row actions", async () => {
    const user = userEvent.setup();
    renderTable({
      getRowActions: () => [
        {
          id: "duplicate",
          label: "Duplicate",
          icon: Copy,
          onSelect: vi.fn(),
        },
      ],
    });

    await user.click(
      screen.getByRole("button", { name: "Open actions for Alpha" }),
    );

    expect(
      document.querySelector(
        ".platform-data-table__floating-menu.platform-popup-surface.is-minimal",
      ),
    ).not.toBeNull();
  });

  it("activates a focused row with the keyboard", async () => {
    const user = userEvent.setup();
    const onRowActivate = vi.fn();
    renderTable({ onRowActivate });
    const alphaRow = screen.getByRole("row", { name: "Alpha" });

    alphaRow.focus();
    await user.keyboard("{Enter}");

    expect(onRowActivate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "row-a" }),
    );
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

    await user.click(
      screen.getByRole("button", { name: "Open actions for Alpha" }),
    );

    expect(onRowActionTrigger).toHaveBeenCalledTimes(1);
    expect(onRowActionTrigger.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ id: "row-a" }),
    );
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
    const emptyMessage = screen.getByText("No resources yet");
    const emptyRow = emptyMessage.closest('[role="row"]');
    expect(emptyRow?.classList.contains("platform-data-table__state-row")).toBe(
      true,
    );
    expect(
      within(emptyRow as HTMLElement)
        .getByRole("cell")
        .getAttribute("aria-colspan"),
    ).toBe("2");
  });

  it("loads the next increment at the bottom and renders the shared loading state", () => {
    const onLoadMore = vi.fn();
    const { container, rerender } = renderTable({
      incrementalLoading: {
        hasMore: true,
        onLoadMore,
        threshold: 0,
      },
    });
    const scroll = container.querySelector<HTMLElement>(
      ".platform-data-table__scroll",
    );
    expect(scroll).not.toBeNull();
    Object.defineProperties(scroll as HTMLElement, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 600, writable: true },
    });

    fireEvent.scroll(scroll as HTMLElement);
    fireEvent.scroll(scroll as HTMLElement);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(
      <PlatformDataTable<TestRow>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Test resources"
        incrementalLoading={{
          hasMore: true,
          loading: true,
          onLoadMore,
          loadingMessage: "Loading more workflows...",
        }}
      />,
    );
    expect(
      screen.getByRole("status", { name: "Loading more workflows..." }),
    ).not.toBeNull();
    expect(
      container.querySelector(".platform-data-table__incremental-loading"),
    ).not.toBeNull();
  });

  it("renders filtered no-results content in the canonical empty table row", () => {
    renderTable({
      toolbar: {
        search: {
          value: "missing",
          onChange: vi.fn(),
        },
      },
      noResultsState: "No matching resources",
    });

    const noResultsMessage = screen.getByText("No matching resources");
    expect(
      noResultsMessage
        .closest('[role="row"]')
        ?.classList.contains("platform-data-table__state-row"),
    ).toBe(true);
  });

  it("animates the shared nine-dot loading sequence", () => {
    vi.useFakeTimers();
    const { container } = renderTable({ rows: [], loading: true });
    const dots = Array.from(
      container.querySelectorAll<HTMLElement>(
        ".platform-data-table__dot-loader > span",
      ),
    );
    const initialOpacities = dots.map((dot) => dot.style.opacity);

    expect(dots).toHaveLength(9);

    act(() => vi.advanceTimersByTime(62));

    expect(dots.map((dot) => dot.style.opacity)).not.toEqual(initialOpacities);
  });
});

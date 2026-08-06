// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Pencil } from "lucide-react";
import { PlatformVersionHistorySidebar } from "./platform-version-history-sidebar.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformVersionHistorySidebar", () => {
  it("renders versions and keeps comparison behind an explicit action", async () => {
    const onViewChanges = vi.fn();
    const onSelectVersion = vi.fn();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    render(
      <PlatformVersionHistorySidebar
        open
        versions={[
          {
            id: "v2",
            version: 2,
            label: "Version 2",
            description: "Internal subtitle",
            status: "active",
            createdAt: "Today",
          },
          { id: "v1", version: 1, label: "Version 1", createdAt: "Yesterday" },
        ]}
        activeVersionId="v2"
        selectedVersionId="v2"
        onClose={() => {}}
        onSelectVersion={onSelectVersion}
        onViewChanges={onViewChanges}
      />,
    );

    await act(async () => {});
    expect(screen.queryByRole("table", { name: "All Versions" })).toBeNull();
    expect(screen.getByRole("list", { name: "All Versions" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "All Versions" })).not.toBeNull();
    const filterButton = screen.getByRole("button", { name: "Filter" });
    expect(
      screen
        .getByRole("heading", { name: "All Versions" })
        .nextElementSibling
        ?.contains(filterButton),
    ).toBe(true);
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("columnheader")).toBeNull();
    expect(screen.getByText("Today")).not.toBeNull();
    expect(screen.getByText("v2 | Internal subtitle")).not.toBeNull();
    const productionLabel = screen.getByText("Production");
    expect(productionLabel.classList.contains("platform-label")).toBe(true);
    expect(
      productionLabel.classList.contains("platform-version-history-sidebar__status-label"),
    ).toBe(true);
    expect(productionLabel.querySelector("svg")).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Display v2 | Internal subtitle" })
        .closest(".platform-version-history-sidebar__row")
        ?.classList.contains("is-selected"),
    ).toBe(true);
    expect(document.querySelector(".platform-version-history-sidebar__selection")).toBeNull();
    expect(onViewChanges).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Display v1" }));
    expect(onSelectVersion).toHaveBeenCalledWith(
      "v1",
      expect.objectContaining({ id: "v1" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "View Changes" }));
    expect(onViewChanges).toHaveBeenCalledTimes(1);

    fireEvent.click(filterButton);
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Saved" }));
    expect(screen.queryByText("v2 | Internal subtitle")).toBeNull();
    expect(screen.getByText("v1")).not.toBeNull();
  });

  it("renders reusable row actions in the shared popup", async () => {
    const onRename = vi.fn();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    render(
      <PlatformVersionHistorySidebar
        open
        versions={[{ id: "v1", version: 1, label: "Version 1" }]}
        onClose={() => {}}
        getVersionActions={() => [{
          id: "rename",
          label: "Rename",
          icon: Pencil,
          onSelect: onRename,
        }]}
      />,
    );

    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: "Open actions for v1" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(onRename).toHaveBeenCalledWith(
      "v1",
      expect.objectContaining({ id: "v1" }),
      expect.objectContaining({ versionId: "v1" }),
    );
  });

  it("renders publishing as a row-menu action instead of a table column", async () => {
    const onPublishVersion = vi.fn();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    const { container } = render(
      <PlatformVersionHistorySidebar
        open
        versions={[{ id: "v1", version: 1, label: "Version 1" }]}
        onClose={() => {}}
        onPublishVersion={onPublishVersion}
      />,
    );

    await act(async () => {});
    expect(screen.queryByRole("columnheader")).toBeNull();
    expect(container.querySelector("[data-column-id='publish']")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open actions for v1" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Publish" }));
    expect(onPublishVersion).toHaveBeenCalledWith(
      "v1",
      expect.objectContaining({ id: "v1" }),
    );
  });

  it("uses the shared loading state while versions load", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    render(
      <PlatformVersionHistorySidebar
        open
        loading
        onClose={() => {}}
      />,
    );
    await act(async () => {});
    expect(screen.getByRole("status", { name: "Loading versions" })).not.toBeNull();
  });

  it("places version creation in the shared sidebar header", async () => {
    const onCreateVersion = vi.fn();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    const { container } = render(
      <PlatformVersionHistorySidebar
        open
        versions={[{ id: "v1", version: 1, label: "Version 1" }]}
        onClose={() => {}}
        onCreateVersion={onCreateVersion}
      />,
    );

    await act(async () => {});
    const createButton = screen.getByRole("button", { name: "Version" });
    expect(createButton.closest(".platform-floating-sidebar__header")).not.toBeNull();
    expect(container.querySelector(".platform-version-history-sidebar__toolbar")).not.toBeNull();
    expect(
      screen.getByRole("list", { name: "All Versions" }),
    ).not.toBeNull();

    fireEvent.click(createButton);
    expect(onCreateVersion).toHaveBeenCalledTimes(1);
  });

  it("always renders the centralized View Changes footer action", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    render(
      <PlatformVersionHistorySidebar
        open
        versions={[{ id: "v1", version: 1, label: "Version 1" }]}
        onClose={() => {}}
      />,
    );

    await act(async () => {});
    const viewChangesButton = screen.getByRole("button", { name: "View Changes" });
    expect(viewChangesButton.closest(".platform-floating-sidebar__footer")).not.toBeNull();
    expect((viewChangesButton as HTMLButtonElement).disabled).toBe(true);
  });
});

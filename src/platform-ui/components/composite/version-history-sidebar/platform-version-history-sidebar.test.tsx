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
          { id: "v2", label: "Version 2", status: "active", createdAt: "Today" },
          { id: "v1", label: "Version 1", createdAt: "Yesterday" },
        ]}
        activeVersionId="v2"
        selectedVersionId="v2"
        onClose={() => {}}
        onSelectVersion={onSelectVersion}
        onViewChanges={onViewChanges}
      />,
    );

    await act(async () => {});
    expect(screen.getByRole("table", { name: "Saved versions" })).not.toBeNull();
    expect(screen.getByText("Published")).not.toBeNull();
    expect(onViewChanges).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Display Version 1" }));
    expect(onSelectVersion).toHaveBeenCalledWith(
      "v1",
      expect.objectContaining({ id: "v1" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "View Changes" }));
    expect(onViewChanges).toHaveBeenCalledTimes(1);
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
        versions={[{ id: "v1", label: "Version 1" }]}
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
    fireEvent.click(screen.getByRole("button", { name: "Open actions for Version 1" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(onRename).toHaveBeenCalledWith(
      "v1",
      expect.objectContaining({ id: "v1" }),
      expect.objectContaining({ versionId: "v1" }),
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
        versions={[{ id: "v1", label: "Version 1" }]}
        onClose={() => {}}
        onCreateVersion={onCreateVersion}
      />,
    );

    await act(async () => {});
    const createButton = screen.getByRole("button", { name: "Version" });
    expect(createButton.closest(".platform-floating-sidebar__header")).not.toBeNull();
    expect(container.querySelector(".platform-version-history-sidebar__toolbar")).toBeNull();
    expect(
      screen
        .getByRole("table", { name: "Saved versions" })
        .closest(".platform-data-table.is-minimalistic-ui"),
    ).not.toBeNull();

    fireEvent.click(createButton);
    expect(onCreateVersion).toHaveBeenCalledTimes(1);
  });
});

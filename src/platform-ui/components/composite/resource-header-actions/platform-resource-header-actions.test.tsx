// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PlatformResourceActionMenuItem,
  PlatformResourceActionsInformation,
  PlatformResourceActionsMenu,
  PlatformResourceHeaderActions,
  PlatformResourceVersionLabel,
  PlatformResourceVersionHistoryMenuItem,
} from "./platform-resource-header-actions.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformResourceHeaderActions", () => {
  it("marks the highest current version as Latest", () => {
    const onOpenVersionHistory = vi.fn();
    render(
      <PlatformResourceVersionLabel
        resourceLabel="test"
        version={3}
        latestVersion={3}
        onOpenVersionHistory={onOpenVersionHistory}
      />,
    );

    expect(screen.getByText("v3")).not.toBeNull();
    expect(screen.getByText("Latest")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open test version history" }));
    expect(onOpenVersionHistory).toHaveBeenCalledTimes(1);
  });

  it("does not mark an older selected version as Latest", () => {
    render(
      <PlatformResourceVersionLabel
        resourceLabel="test"
        version={2}
        latestVersion={3}
        onOpenVersionHistory={() => {}}
      />,
    );

    expect(screen.queryByText("Latest")).toBeNull();
  });

  it("opens the shared resource menu below its trigger", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <PlatformResourceHeaderActions>
        <PlatformResourceActionsMenu open={false} onOpenChange={onOpenChange} resourceLabel="Test">
          <button type="button" role="menuitem">
            Copy Test ID
          </button>
        </PlatformResourceActionsMenu>
      </PlatformResourceHeaderActions>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Test actions" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <PlatformResourceHeaderActions>
        <PlatformResourceActionsMenu open onOpenChange={onOpenChange} resourceLabel="Test">
          <button type="button" role="menuitem">
            Copy Test ID
          </button>
        </PlatformResourceActionsMenu>
      </PlatformResourceHeaderActions>,
    );

    const menu = screen.getByRole("menu", { name: "Test actions" });
    expect(menu.getAttribute("data-platform-popup-animation")).toBe("down-in");
    expect(menu.getAttribute("data-platform-popup-placement")).toBe("bottom-start");
    expect(menu.getAttribute("data-platform-popup-portaled")).toBe("true");
    expect((menu as HTMLElement).style.width).toBe("240px");
  });

  it("opens resource information beside the compact menu and exposes version history", () => {
    const onOpenVersionHistory = vi.fn();
    const onOpenChange = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <PlatformResourceActionsMenu open onOpenChange={onOpenChange} resourceLabel="Test">
        <PlatformResourceActionsInformation
          resourceLabel="Test"
          items={[
            {
              id: "id",
              label: "ID",
              value: "test-resource-id-that-must-remain-fully-visible",
              monospace: true,
              copyValue: "test-resource-id-that-must-remain-fully-visible",
              copyAriaLabel: "Copy Test ID",
            },
            { id: "created", label: "Created", value: "August 4, 2026" },
            { id: "updated", label: "Updated", value: "August 5, 2026" },
          ]}
        />
        <PlatformResourceVersionHistoryMenuItem onClick={onOpenVersionHistory} />
      </PlatformResourceActionsMenu>,
    );

    const information = screen.getByRole("menuitem", { name: "Information" });
    expect(information.getAttribute("aria-expanded")).toBe("false");
    expect(
      information.querySelector(".platform-resource-actions-menu__item-trailing"),
    ).not.toBeNull();

    fireEvent.pointerEnter(information);

    expect(information.getAttribute("aria-expanded")).toBe("true");
    const informationPopup = screen.getByRole("dialog", { name: "Test information" });
    expect(informationPopup.getAttribute("data-platform-popup-placement")).toBe("right-start");
    expect(informationPopup.getAttribute("data-platform-popup-animation")).toBe("left-in");
    const resourceId = screen.getByText("test-resource-id-that-must-remain-fully-visible");
    expect(resourceId.classList.contains("is-copyable")).toBe(true);
    expect(screen.getByText("August 4, 2026")).not.toBeNull();
    expect(screen.getByText("August 5, 2026")).not.toBeNull();

    const copyButton = screen.getByRole("button", { name: "Copy Test ID" });
    fireEvent.pointerDown(copyButton);
    fireEvent.click(copyButton);
    expect(writeText).toHaveBeenCalledWith("test-resource-id-that-must-remain-fully-visible");
    expect(screen.getByRole("dialog", { name: "Test information" })).not.toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("menuitem", { name: "Show version history" }));
    expect(onOpenVersionHistory).toHaveBeenCalledTimes(1);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
  });

  it("shows and executes shared resource action shortcuts even while the menu is closed", () => {
    const onShare = vi.fn();
    const onRename = vi.fn();
    const onDelete = vi.fn();
    const { rerender } = render(
      <PlatformResourceActionsMenu
        open={false}
        onOpenChange={() => {}}
        resourceLabel="Test"
        shortcutActions={{
          share: { onInvoke: onShare },
          rename: { onInvoke: onRename },
          delete: { onInvoke: onDelete },
        }}
      >
        <PlatformResourceActionMenuItem label="Share" shortcut="share" onClick={onShare} />
        <PlatformResourceActionMenuItem label="Rename" shortcut="rename" onClick={onRename} />
        <PlatformResourceActionMenuItem label="Delete" shortcut="delete" onClick={onDelete} />
      </PlatformResourceActionsMenu>,
    );

    fireEvent.keyDown(document, {
      key: "ß",
      code: "KeyS",
      metaKey: true,
      altKey: true,
    });
    fireEvent.keyDown(document, {
      key: "®",
      code: "KeyR",
      ctrlKey: true,
      altKey: true,
    });
    fireEvent.keyDown(document, {
      key: "Backspace",
      code: "Backspace",
      metaKey: true,
      altKey: true,
    });

    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);

    rerender(
      <PlatformResourceActionsMenu
        open
        onOpenChange={() => {}}
        resourceLabel="Test"
        shortcutActions={{
          share: { onInvoke: onShare },
          rename: { onInvoke: onRename },
          delete: { onInvoke: onDelete },
        }}
      >
        <PlatformResourceActionMenuItem label="Share" shortcut="share" onClick={onShare} />
        <PlatformResourceActionMenuItem label="Rename" shortcut="rename" onClick={onRename} />
        <PlatformResourceActionMenuItem label="Delete" shortcut="delete" onClick={onDelete} />
      </PlatformResourceActionsMenu>,
    );

    const shareAction = screen.getByRole("menuitem", { name: "Share" });
    const renameAction = screen.getByRole("menuitem", { name: "Rename" });
    const deleteAction = screen.getByRole("menuitem", { name: "Delete" });
    expect(shareAction.getAttribute("aria-keyshortcuts")).toContain("Meta+Alt+S");
    expect(renameAction.getAttribute("aria-keyshortcuts")).toContain("Meta+Alt+R");
    expect(deleteAction.getAttribute("aria-keyshortcuts")).toContain("Meta+Alt+Backspace");
    expect(screen.getByText("⌘ ⌥ S").className).toBe("platform-resource-actions-menu__shortcut");
    expect(screen.getByText("⌘ ⌥ R").className).toBe("platform-resource-actions-menu__shortcut");
    expect(screen.getByText("⌘ ⌥ ⌫").className).toBe("platform-resource-actions-menu__shortcut");
  });
});

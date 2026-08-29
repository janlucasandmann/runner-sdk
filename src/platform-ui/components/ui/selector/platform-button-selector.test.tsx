// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { GitBranch, Rocket } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformButtonSelector } from "./platform-button-selector.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PlatformButtonSelector", () => {
  it("opens the shared portaled selector popup from the full secondary button", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(
      <PlatformButtonSelector
        mode="popup"
        buttonVariant="secondary"
        label="Version 2"
        leading={<GitBranch />}
        popupAriaLabel="Choose version"
        onOpenChange={onOpenChange}
      >
        <button type="button" role="menuitem">
          Version 1
        </button>
      </PlatformButtonSelector>,
    );

    const trigger = screen.getByRole("button", { name: "Choose version" });
    const chevronTrigger = screen.getByRole("button", {
      name: "Choose version options",
    });
    expect(trigger.dataset.platformButtonVariant).toBe("secondary");
    expect(chevronTrigger.dataset.platformButtonVariant).toBe("secondary");
    expect(
      container.querySelector(".platform-button-selector.is-mode-popup"),
    ).not.toBeNull();
    expect(
      container.querySelector(".platform-button-selector__divider"),
    ).not.toBeNull();

    await user.click(trigger);

    const popup = screen.getByRole("menu", { name: "Choose version" });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(popup.classList.contains("is-minimal")).toBe(true);
    expect(popup.classList.contains("is-portaled")).toBe(true);
    expect(popup.parentElement).toBe(document.body);
    expect(container.querySelector(".platform-popup-surface")).toBeNull();

    await user.click(chevronTrigger);
    expect(screen.queryByRole("menu", { name: "Choose version" })).toBeNull();
  });

  it("separates the primary action from the split popup trigger", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <PlatformButtonSelector
        mode="split-action"
        buttonVariant="primary"
        label="Save & Publish"
        leading={<Rocket />}
        actionAriaLabel="Save and publish"
        popupAriaLabel="Version options"
        onAction={onAction}
      >
        <button type="button" role="menuitem">
          Save Version
        </button>
      </PlatformButtonSelector>,
    );

    const action = screen.getByRole("button", { name: "Save and publish" });
    const popupTrigger = screen.getByRole("button", {
      name: "Version options",
    });
    expect(action.dataset.platformButtonVariant).toBe("primary");
    expect(popupTrigger.dataset.platformButtonVariant).toBe("primary");

    await user.click(action);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu", { name: "Version options" })).toBeNull();

    await user.click(popupTrigger);
    expect(
      screen.getByRole("menu", { name: "Version options" }),
    ).not.toBeNull();
  });

  it("exposes centralized full-width geometry for whole-control label centering", () => {
    const { container } = render(
      <PlatformButtonSelector
        mode="split-action"
        buttonVariant="primary"
        label="Deploy"
        actionAriaLabel="Deploy"
        popupAriaLabel="Deployment options"
        onAction={vi.fn()}
        fullWidth
      >
        <button type="button" role="menuitem">
          Test Invoke
        </button>
      </PlatformButtonSelector>,
    );

    const selector = container.querySelector(".platform-button-selector");
    expect(selector).not.toBeNull();
    expect(selector?.classList.contains("is-full-width")).toBe(true);
    expect(
      selector?.querySelector(".platform-button-selector__group"),
    ).not.toBeNull();
    expect(
      selector?.querySelector(".platform-button-selector__action"),
    ).not.toBeNull();
    expect(
      selector?.querySelector(".platform-button-selector__popup-trigger"),
    ).not.toBeNull();
  });

  it("dismisses the portaled popup without swallowing popup interactions", async () => {
    const user = userEvent.setup();
    const onMenuAction = vi.fn();
    render(
      <div>
        <PlatformButtonSelector
          mode="popup"
          label="Versions"
          popupAriaLabel="Choose version"
        >
          <button type="button" role="menuitem" onClick={onMenuAction}>
            Version 1
          </button>
        </PlatformButtonSelector>
        <button type="button">Outside</button>
      </div>,
    );

    const trigger = screen.getByRole("button", { name: "Choose version" });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Version 1" }));
    expect(onMenuAction).toHaveBeenCalledTimes(1);

    fireEvent.mouseDown(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu", { name: "Choose version" })).toBeNull();

    await user.click(trigger);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("menu", { name: "Choose version" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("can dismiss its popup immediately after a menu selection", async () => {
    const user = userEvent.setup();
    const onMenuAction = vi.fn();
    render(
      <PlatformButtonSelector
        mode="popup"
        label="New"
        popupAriaLabel="Create new"
        closeOnSelect
      >
        <button type="button" role="menuitem" onClick={onMenuAction}>
          Computer
        </button>
      </PlatformButtonSelector>,
    );

    await user.click(screen.getByRole("button", { name: "Create new" }));
    await user.click(screen.getByRole("menuitem", { name: "Computer" }));

    expect(onMenuAction).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu", { name: "Create new" })).toBeNull();
  });

  it("supports the centralized searchable-popup variant", async () => {
    const user = userEvent.setup();
    render(
      <PlatformButtonSelector
        mode="popup"
        label="Resource"
        popupAriaLabel="Create project resource"
        popupSearch={{
          "aria-label": "Search resource types",
          placeholder: "Search resources...",
          autoFocus: true,
        }}
      >
        <button type="button" role="menuitem">Database</button>
      </PlatformButtonSelector>,
    );

    await user.click(screen.getByRole("button", { name: "Create project resource" }));

    const search = screen.getByRole("searchbox", { name: "Search resource types" });
    expect(search.closest(".platform-popup__search-header")).not.toBeNull();
    expect(document.activeElement).toBe(search);
  });

  it("keeps a hover-opened popup available while moving into its portaled surface", () => {
    vi.useFakeTimers();
    const { container } = render(
      <PlatformButtonSelector
        mode="popup"
        label="Export"
        popupAriaLabel="Export database"
        openOnHover
        hoverCloseDelayMs={50}
      >
        <button type="button" role="menuitem">
          Export as JSON
        </button>
      </PlatformButtonSelector>,
    );

    const selector = container.querySelector(".platform-button-selector");
    expect(selector).not.toBeNull();

    fireEvent.mouseEnter(selector!);
    const popup = screen.getByRole("menu", { name: "Export database" });

    fireEvent.mouseLeave(selector!);
    fireEvent.mouseEnter(popup);
    act(() => vi.advanceTimersByTime(60));
    expect(
      screen.getByRole("menu", { name: "Export database" }),
    ).not.toBeNull();

    fireEvent.mouseLeave(popup);
    act(() => vi.advanceTimersByTime(60));
    expect(screen.queryByRole("menu", { name: "Export database" })).toBeNull();
  });
});

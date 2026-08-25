// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformPopupSubmenu } from "./platform-popup-submenu.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PlatformPopupSubmenu", () => {
  it("keeps its portaled surface open while pointer focus moves into it", () => {
    vi.useFakeTimers();
    const { container } = render(
      <div role="menu">
        <PlatformPopupSubmenu
          label="Status"
          detail="Todo"
          popupAriaLabel="Change ticket status"
          hoverCloseDelayMs={50}
        >
          <button type="button" role="menuitem">
            In Progress
          </button>
        </PlatformPopupSubmenu>
      </div>,
    );

    const submenuRoot = container.querySelector(".platform-popup-submenu");
    expect(submenuRoot).not.toBeNull();

    fireEvent.pointerEnter(submenuRoot!);
    const popup = screen.getByRole("menu", { name: "Change ticket status" });
    expect(popup.getAttribute("data-platform-popup-placement")).toBe(
      "right-start",
    );

    fireEvent.pointerLeave(submenuRoot!);
    fireEvent.pointerEnter(popup);
    act(() => vi.advanceTimersByTime(60));
    expect(
      screen.getByRole("menu", { name: "Change ticket status" }),
    ).not.toBeNull();

    fireEvent.pointerLeave(popup);
    act(() => vi.advanceTimersByTime(60));
    expect(
      screen.queryByRole("menu", { name: "Change ticket status" }),
    ).toBeNull();
  });

  it("can close after selecting a submenu action", () => {
    render(
      <div role="menu">
        <PlatformPopupSubmenu
          label="Priority"
          popupAriaLabel="Change ticket priority"
          closeOnSelect
        >
          <button type="button" role="menuitem">
            High
          </button>
        </PlatformPopupSubmenu>
      </div>,
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "Priority" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "High" }));
    expect(
      screen.queryByRole("menu", { name: "Change ticket priority" }),
    ).toBeNull();
  });
});

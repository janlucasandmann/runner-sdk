// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  PlatformPopup,
  PlatformPopupDismissLayer,
  PlatformPopupSurface,
} from "./platform-popup.js";

describe("PlatformPopup", () => {
  it("keeps the trigger mounted while the controlled popup is closed", () => {
    const { container } = render(
      <PlatformPopup open={false} trigger={<button type="button">Open</button>}>
        Popup content
      </PlatformPopup>
    );

    expect(screen.getByRole("button", { name: "Open" })).toBeTruthy();
    expect(container.querySelector(".platform-popup-surface")).toBeNull();
  });

  it("renders the canonical surface and selected animation", () => {
    const { container } = render(
      <PlatformPopup open trigger={<button type="button">Open</button>} animation="down-in">
        Popup content
      </PlatformPopup>
    );

    const surface = container.querySelector(".platform-popup-surface");
    expect(surface?.textContent).toBe("Popup content");
    expect(surface?.classList.contains("tb-popup-menu")).toBe(true);
    expect(surface?.getAttribute("data-platform-popup-animation")).toBe("down-in");
  });

  it("supports portal and context-menu callers through the shared surface", () => {
    const { container } = render(
      <PlatformPopupSurface role="menu" className="custom-popup">
        Popup content
      </PlatformPopupSurface>
    );

    const surface = container.querySelector(".platform-popup-surface");
    expect(surface?.getAttribute("role")).toBe("menu");
    expect(surface?.classList.contains("custom-popup")).toBe(true);
  });

  it("supports fixed portal positioning and shared dismissal layers", () => {
    const { container } = render(
      <>
        <PlatformPopupDismissLayer className="custom-dismiss-layer" />
        <PlatformPopupSurface mode="fixed" width={220} maxHeight="50vh">
          Popup content
        </PlatformPopupSurface>
      </>
    );

    const surface = container.querySelector(".platform-popup-surface");
    expect(container.querySelector(".platform-popup-dismiss-layer.custom-dismiss-layer")).toBeTruthy();
    expect(surface?.classList.contains("is-fixed")).toBe(true);
    expect((surface as HTMLElement).style.width).toBe("220px");
    expect((surface as HTMLElement).style.maxHeight).toBe("50vh");
  });

  it("normalizes legacy transition classes onto the central animation contract", () => {
    const { container } = render(
      <PlatformPopupSurface className="playground-tasks-toolbar-popup-menu-animate-down-in">
        Popup content
      </PlatformPopupSurface>
    );

    expect(container.querySelector(".platform-popup-surface")?.getAttribute("data-platform-popup-animation")).toBe("down-in");
  });

  it("animates opt-in content height changes", () => {
    const originalAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "animate");
    const getBoundingClientRect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const height = this.textContent === "Tall content" ? 140 : 80;
      return {
        x: 0,
        y: 0,
        width: 240,
        height,
        top: 0,
        right: 240,
        bottom: height,
        left: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });
    const cancel = vi.fn();
    const animate = vi.fn(() => ({ cancel, oncancel: null, onfinish: null }) as unknown as Animation);
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: animate,
    });

    try {
      const { container, rerender } = render(
        <PlatformPopupSurface animateHeight>Short content</PlatformPopupSurface>
      );
      rerender(<PlatformPopupSurface animateHeight>Tall content</PlatformPopupSurface>);

      expect(container.querySelector(".platform-popup-surface")?.getAttribute("data-platform-popup-height-animation")).toBe("enabled");
      expect(animate).toHaveBeenCalledWith([
        { height: "80px" },
        { height: "140px" },
      ], {
        duration: 180,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
    } finally {
      getBoundingClientRect.mockRestore();
      if (originalAnimate) {
        Object.defineProperty(HTMLElement.prototype, "animate", originalAnimate);
      } else {
        delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
      }
    }
  });
});

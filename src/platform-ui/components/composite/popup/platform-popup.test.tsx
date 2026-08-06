// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PlatformPopup,
  PlatformPopupDismissLayer,
  PlatformPopupSurface,
} from "./platform-popup.js";
import { PlatformPopupSearchHeader } from "./platform-popup-search-header.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformPopup", () => {
  it("provides a reusable, autofocusable search header with a shortcut hint", () => {
    render(
      <PlatformPopupSearchHeader
        aria-label="Search statuses"
        placeholder="Change status..."
        shortcut="S"
        autoFocus
      />,
    );

    const input = screen.getByRole("searchbox", { name: "Search statuses" });
    expect(input).toBe(document.activeElement);
    expect(screen.getByText("S").tagName).toBe("KBD");
  });

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

  it("applies the centralized minimal surface variant", () => {
    const { container } = render(
      <PlatformPopup
        open
        variant="minimal"
        trigger={<button type="button">Open</button>}
      >
        Popup content
      </PlatformPopup>
    );

    const surface = container.querySelector(".platform-popup-surface");
    expect(surface?.classList.contains("is-minimal")).toBe(true);
    expect(surface?.getAttribute("data-platform-popup-variant")).toBe("minimal");
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

  it("portals anchored surfaces beyond clipping ancestors and tracks viewport placement", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains("platform-popup-anchor")) {
        return {
          x: 300,
          y: 700,
          width: 100,
          height: 32,
          top: 700,
          right: 400,
          bottom: 732,
          left: 300,
          toJSON: () => ({}),
        } as DOMRect;
      }
      if (this.classList.contains("platform-popup-surface")) {
        return {
          x: 0,
          y: 0,
          width: 180,
          height: 200,
          top: 0,
          right: 180,
          bottom: 200,
          left: 0,
          toJSON: () => ({}),
        } as DOMRect;
      }
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });

    const { container } = render(
      <div style={{ overflow: "hidden" }}>
        <PlatformPopup
          open
          portal
          placement="bottom-end"
          portalMatchAnchorWidth
          trigger={<button type="button">Open portaled popup</button>}
        >
          Popup content
        </PlatformPopup>
      </div>
    );

    const surface = document.body.querySelector<HTMLElement>(
      ".platform-popup-surface.is-portaled",
    );
    expect(surface).not.toBeNull();
    expect(surface?.parentElement).toBe(document.body);
    expect(container.querySelector(".platform-popup-surface")).toBeNull();
    expect(surface?.classList.contains("is-fixed")).toBe(true);
    expect(surface?.getAttribute("data-platform-popup-portaled")).toBe("true");
    expect(surface?.getAttribute("data-platform-popup-placement")).toBe("top-end");
    expect(surface?.style.left).toBe("220px");
    expect(surface?.style.top).toBe("492px");
    expect(surface?.style.width).toBe("180px");
    expect(surface?.style.visibility).toBe("");
  });

  it("anchors context menus to an explicit viewport point", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains("platform-popup-surface")) {
          return {
            x: 0,
            y: 0,
            width: 160,
            height: 120,
            top: 0,
            right: 160,
            bottom: 120,
            left: 0,
            toJSON: () => ({}),
          } as DOMRect;
        }
        return {
          x: 12,
          y: 16,
          width: 32,
          height: 32,
          top: 16,
          right: 44,
          bottom: 48,
          left: 12,
          toJSON: () => ({}),
        } as DOMRect;
      },
    );

    render(
      <PlatformPopup
        open
        portal
        portalAnchorPoint={{ x: 420, y: 240 }}
        portalOffset={0}
        placement="bottom-start"
        trigger={<button type="button">Context target</button>}
      >
        Context actions
      </PlatformPopup>,
    );

    const surface = document.body.querySelector<HTMLElement>(
      ".platform-popup-surface.is-portaled",
    );
    expect(surface?.style.left).toBe("420px");
    expect(surface?.style.top).toBe("240px");
  });

  it("positions nested popup surfaces beside their anchor", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains("platform-popup-surface")) {
          return {
            x: 0,
            y: 0,
            width: 180,
            height: 120,
            top: 0,
            right: 180,
            bottom: 120,
            left: 0,
            toJSON: () => ({}),
          } as DOMRect;
        }
        return {
          x: 100,
          y: 160,
          width: 40,
          height: 32,
          top: 160,
          right: 140,
          bottom: 192,
          left: 100,
          toJSON: () => ({}),
        } as DOMRect;
      },
    );

    render(
      <PlatformPopup
        open
        portal
        placement="right-start"
        trigger={<button type="button">Open side popup</button>}
      >
        Side content
      </PlatformPopup>,
    );

    const surface = document.body.querySelector<HTMLElement>(
      ".platform-popup-surface.is-portaled",
    );
    expect(surface?.getAttribute("data-platform-popup-placement")).toBe("right-start");
    expect(surface?.style.left).toBe("148px");
    expect(surface?.style.top).toBe("160px");
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

// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PlatformModal,
  PlatformModalBackdrop,
  PlatformModalSurface,
} from "./platform-modal.js";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("PlatformModal", () => {
  it("owns the canonical surface, size variants, and header styles", () => {
    const css = readFileSync(
      path.join(process.cwd(), "src/platform-ui/components/composite/modal/modal.css"),
      "utf8",
    );
    expect(css).toMatch(/padding:\s*24px;/);
    expect(css).toMatch(/border:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.075\)\s*!important;/);
    expect(css).toMatch(/border-radius:\s*15px\s*!important;/);
    expect(css).toMatch(/background:\s*#1a1a1a\s*!important;/i);
    expect(css).toMatch(/scrollbar-width:\s*none;/);
    expect(css).toMatch(/::-webkit-scrollbar[\s\S]*display:\s*none;/);
    expect(css).toMatch(/\.platform-modal-surface\.is-size-small[\s\S]*width:\s*min\(400px,/);
    expect(css).toMatch(/\.platform-modal-surface\.is-size-medium[\s\S]*width:\s*min\(640px,/);
    expect(css).toMatch(/\.platform-modal-surface\.is-size-large[\s\S]*width:\s*min\(880px,/);
    expect(css).toMatch(/\.platform-modal-header__title[\s\S]*font-size:\s*14px;/);
    expect(css).toMatch(/\.platform-modal-header__title[\s\S]*color:\s*#fff;/);
    expect(css).toMatch(/\.platform-modal-header\s*\{[\s\S]*padding-bottom:\s*12px;/);
    expect(css).toMatch(/\.platform-modal-header\s*\{[\s\S]*border-bottom:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.1\);/);
    expect(css).toMatch(/\.platform-modal-header__close[\s\S]*color:\s*#fff;/);
    expect(css).toMatch(/\.platform-modal-header__close:hover,[\s\S]*background:\s*transparent;/);
  });

  it("renders the standard backdrop and a configurable semantic surface", () => {
    const onClose = vi.fn();
    const { container } = render(
      <PlatformModal
        open
        visible
        portal={false}
        title="Create issue"
        description="Describe the issue before creating it."
        onClose={onClose}
        as="form"
        size="large"
        width="900px"
        maxHeight="70vh"
      >
        Modal content
      </PlatformModal>
    );

    const backdrop = container.querySelector(".platform-modal-backdrop");
    const surface = screen.getByRole("dialog", { name: "Create issue" });
    expect(backdrop?.classList.contains("is-visible")).toBe(true);
    expect(surface.tagName).toBe("FORM");
    expect(surface.classList.contains("is-size-large")).toBe(true);
    expect(surface.style.width).toBe("900px");
    expect(surface.style.maxHeight).toBe("70vh");
    expect(screen.getByRole("heading", { name: "Create issue", level: 2 })).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.getByText("Describe the issue before creating it.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));
    expect(onClose).toHaveBeenLastCalledWith("close-button");
  });

  it("closes only for an enabled backdrop or Escape interaction", () => {
    const onClose = vi.fn();
    const { container } = render(
      <PlatformModal open visible portal={false} title="Interaction test" onClose={onClose}>
        <button type="button">Inside</button>
      </PlatformModal>
    );

    fireEvent.click(screen.getByRole("button", { name: "Inside" }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(container.querySelector(".platform-modal-backdrop") as Element);
    expect(onClose).toHaveBeenLastCalledWith("backdrop");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenLastCalledWith("escape");
  });

  it("exposes composable primitives for externally managed portal layouts", () => {
    const { container } = render(
      <PlatformModalBackdrop className="custom-backdrop">
        <PlatformModalSurface size="compact" className="custom-modal">
          Content
        </PlatformModalSurface>
      </PlatformModalBackdrop>
    );

    expect(container.querySelector(".platform-modal-backdrop.custom-backdrop")).toBeTruthy();
    expect(container.querySelector(".platform-modal-surface.custom-modal.is-size-compact")).toBeTruthy();
  });

  it("locks document scrolling while mounted and restores it on unmount", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(
      <PlatformModal open visible portal={false} title="Scroll lock" onClose={() => {}}>
        Content
      </PlatformModal>
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});

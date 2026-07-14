// @vitest-environment jsdom

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
  it("renders the standard backdrop and a configurable semantic surface", () => {
    const { container } = render(
      <PlatformModal
        open
        visible
        portal={false}
        as="form"
        size="large"
        width="900px"
        maxHeight="70vh"
        ariaLabel="Create issue"
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
  });

  it("closes only for an enabled backdrop or Escape interaction", () => {
    const onClose = vi.fn();
    const { container } = render(
      <PlatformModal open visible portal={false} onClose={onClose}>
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
      <PlatformModal open visible portal={false}>Content</PlatformModal>
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});

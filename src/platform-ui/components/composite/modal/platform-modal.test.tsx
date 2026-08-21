// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PlatformModal,
  PlatformModalBackdrop,
  PlatformModalBody,
  PlatformModalContent,
  PlatformModalFooter,
  PlatformModalSidebar,
  PlatformModalSplitLayout,
  PlatformModalSurface,
} from "./platform-modal.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.body.style.overflow = "";
});

describe("PlatformModal", () => {
  it("owns the canonical surface, size variants, and header styles", () => {
    const css = readFileSync(
      path.join(process.cwd(), "src/platform-ui/components/composite/modal/modal.css"),
      "utf8",
    );
    expect(css).toMatch(/\.platform-modal-surface\s*\{[\s\S]*padding:\s*0;/);
    expect(css).toMatch(/\.platform-modal-surface\s*\{[\s\S]*overflow:\s*hidden;/);
    expect(css).toMatch(/--platform-modal-animation-duration:\s*60ms;/);
    expect(css).toMatch(
      /@starting-style\s*\{[\s\S]*\.platform-modal-surface\.is-visible\s*\{[\s\S]*opacity:\s*0;[\s\S]*transform:\s*scale\(0\.75\);/,
    );
    expect(css).toMatch(
      /\.platform-modal-backdrop\.is-visible\s*\{[\s\S]*-webkit-backdrop-filter:\s*blur\(10px\);[\s\S]*backdrop-filter:\s*blur\(10px\);/,
    );
    expect(css).toMatch(/\.platform-modal-surface:not\(\.is-structured\)[\s\S]*padding:\s*24px;/);
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
    expect(css).toMatch(/\.platform-modal-header__title[\s\S]*font-weight:\s*400;/);
    expect(css).toMatch(
      /\.platform-modal-surface\.is-size-small \.platform-modal-body\s*\{[\s\S]*padding-top:\s*0;/,
    );
    expect(css).toMatch(/\.platform-modal-header\s*\{[\s\S]*padding:\s*12px 24px;/);
    expect(css).toMatch(/\.platform-modal-header\s*\{[\s\S]*border-bottom:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.1\);/);
    expect(css).toMatch(
      /\.platform-modal-header\.is-title-only\s*\{[\s\S]*padding-top:\s*24px;[\s\S]*border-bottom:\s*0;/,
    );
    expect(css).toMatch(/\.platform-modal-body\s*\{[\s\S]*padding:\s*24px;/);
    expect(css).toMatch(
      /\.platform-modal-footer\s*\{[\s\S]*padding:\s*12px 24px;[\s\S]*border-top:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.075\);[\s\S]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.05\);/,
    );
    expect(css).toMatch(/\.platform-modal-header__search\.platform-search[\s\S]*background:\s*transparent;/);
    expect(css).toMatch(/\.platform-modal-header__search-input\.platform-search__input[\s\S]*font-size:\s*14px;/);
    expect(css).toMatch(/\.platform-modal-header__close[\s\S]*color:\s*#fff;/);
    expect(css).toMatch(/\.platform-modal-header__close:hover,[\s\S]*background:\s*transparent;/);
    expect(css).toMatch(/\.platform-modal-header\.is-media\s*\{[\s\S]*min-height:\s*0;/);
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
        footer={<button type="button">Create</button>}
      >
        Modal content
      </PlatformModal>
    );

    const backdrop = container.querySelector(".platform-modal-backdrop");
    const surface = screen.getByRole("dialog", { name: "Create issue" });
    expect(backdrop?.classList.contains("is-visible")).toBe(true);
    expect(surface.tagName).toBe("FORM");
    expect(surface.classList.contains("is-size-large")).toBe(true);
    expect(surface.classList.contains("is-structured")).toBe(true);
    expect(surface.style.width).toBe("900px");
    expect(surface.style.maxHeight).toBe("70vh");
    expect(screen.getByRole("heading", { name: "Create issue", level: 2 })).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.getByText("Describe the issue before creating it.")).toBeTruthy();
    expect(
      surface.querySelector("[data-platform-modal-part='body']")?.textContent,
    ).toContain("Modal content");
    expect(
      surface.querySelector("[data-platform-modal-part='footer']")
        ?.contains(screen.getByRole("button", { name: "Create" })),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Close modal" }));
    expect(onClose).toHaveBeenLastCalledWith("close-button");
  });

  it("marks default headers containing only a title", () => {
    const { rerender } = render(
      <PlatformModal
        open
        visible
        portal={false}
        title="Title only"
        onClose={() => {}}
      >
        Modal content
      </PlatformModal>
    );

    const titleOnlyDialog = screen.getByRole("dialog", { name: "Title only" });
    expect(titleOnlyDialog.querySelector(".platform-modal-header.is-title-only")).not.toBeNull();

    rerender(
      <PlatformModal
        open
        visible
        portal={false}
        title="Title with description"
        description="Supporting copy"
        onClose={() => {}}
      >
        Modal content
      </PlatformModal>
    );

    const describedDialog = screen.getByRole("dialog", { name: "Title with description" });
    expect(describedDialog.querySelector(".platform-modal-header.is-title-only")).toBeNull();

    rerender(
      <PlatformModal
        open
        visible
        portal={false}
        title="Title with leading control"
        headerLeading={<button type="button">Change type</button>}
        onClose={() => {}}
      >
        Modal content
      </PlatformModal>
    );

    const leadingDialog = screen.getByRole("dialog", { name: "Title with leading control" });
    expect(leadingDialog.querySelector(".platform-modal-header.is-title-only")).toBeNull();
    expect(screen.getByRole("button", { name: "Change type" })).toBeTruthy();
  });

  it("mounts in the opening render and keeps close timing stable across rerenders", () => {
    vi.useFakeTimers();
    let enterFrame: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      enterFrame = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const initialOnExited = vi.fn();
    const latestOnExited = vi.fn();
    const { rerender } = render(
      <PlatformModal
        open={false}
        portal={false}
        title="Lifecycle test"
        onClose={() => {}}
        onExited={initialOnExited}
      >
        Content
      </PlatformModal>
    );

    expect(screen.queryByRole("dialog", { name: "Lifecycle test" })).toBeNull();

    rerender(
      <PlatformModal
        open
        portal={false}
        title="Lifecycle test"
        onClose={() => {}}
        onExited={initialOnExited}
      >
        Content
      </PlatformModal>
    );

    const dialog = screen.getByRole("dialog", { name: "Lifecycle test" });
    expect(dialog.getAttribute("data-platform-modal-state")).toBe("opening");
    expect(
      dialog.closest(".platform-modal-backdrop")?.getAttribute("data-platform-modal-state"),
    ).toBe("opening");
    act(() => enterFrame?.(0));
    expect(dialog.getAttribute("data-platform-modal-state")).toBe("visible");

    rerender(
      <PlatformModal
        open={false}
        portal={false}
        title="Lifecycle test"
        onClose={() => {}}
        onExited={initialOnExited}
      >
        Content
      </PlatformModal>
    );
    expect(dialog.getAttribute("data-platform-modal-state")).toBe("closing");
    expect(
      dialog.closest(".platform-modal-backdrop")?.getAttribute("data-platform-modal-state"),
    ).toBe("closing");

    act(() => vi.advanceTimersByTime(30));
    rerender(
      <PlatformModal
        open={false}
        portal={false}
        title="Lifecycle test"
        onClose={() => {}}
        onExited={latestOnExited}
      >
        Content
      </PlatformModal>
    );
    act(() => vi.advanceTimersByTime(30));

    expect(screen.queryByRole("dialog", { name: "Lifecycle test" })).toBeNull();
    expect(initialOnExited).not.toHaveBeenCalled();
    expect(latestOnExited).toHaveBeenCalledOnce();
  });

  it("can omit each structured modal part independently", () => {
    render(
      <PlatformModal
        open
        visible
        portal={false}
        title="Headless utility"
        showHeader={false}
        showBody={false}
        showFooter={false}
        onClose={() => {}}
      >
        Hidden content
      </PlatformModal>
    );

    const dialog = screen.getByRole("dialog", { name: "Headless utility" });
    expect(dialog.querySelectorAll("[data-platform-modal-part]")).toHaveLength(0);
    expect(screen.queryByText("Hidden content")).toBeNull();
  });

  it("recognizes explicit body and footer primitives without nesting them", () => {
    render(
      <PlatformModal
        open
        visible
        portal={false}
        title="Explicit slots"
        onClose={() => {}}
      >
        <PlatformModalBody className="custom-body">Body slot</PlatformModalBody>
        <PlatformModalFooter className="custom-footer">Footer slot</PlatformModalFooter>
      </PlatformModal>
    );

    const dialog = screen.getByRole("dialog", { name: "Explicit slots" });
    expect(dialog.querySelectorAll("[data-platform-modal-part='body']")).toHaveLength(1);
    expect(dialog.querySelectorAll("[data-platform-modal-part='footer']")).toHaveLength(1);
    expect(dialog.querySelector(".platform-modal-body.custom-body")?.textContent).toBe("Body slot");
    expect(dialog.querySelector(".platform-modal-footer.custom-footer")?.textContent).toBe("Footer slot");
  });

  it("provides matched sidebar and content panes for split workflows", () => {
    render(
      <PlatformModal
        open
        visible
        portal={false}
        title="Browse files"
        showHeader={false}
        showFooter={false}
        onClose={() => {}}
      >
        <PlatformModalSplitLayout>
          <PlatformModalSidebar title="Browse files">
            Sidebar navigation
          </PlatformModalSidebar>
          <PlatformModalContent
            header={<span>Workspace</span>}
            footer={<button type="button">Attach</button>}
          >
            File list
          </PlatformModalContent>
        </PlatformModalSplitLayout>
      </PlatformModal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Browse files" });
    const sidebar = dialog.querySelector("[data-platform-modal-part='sidebar']");
    const content = dialog.querySelector("[data-platform-modal-part='content']");
    expect(sidebar?.textContent).toContain("Sidebar navigation");
    expect(content?.textContent).toContain("File list");
    expect(
      dialog.querySelectorAll("[data-platform-modal-pane-part='header']"),
    ).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Attach" })).toBeTruthy();
  });

  it("renders an accessible search header and focuses its input when opened", async () => {
    const onSearchChange = vi.fn();
    render(
      <PlatformModal
        open
        visible
        portal={false}
        title="Select model"
        headerVariant="search"
        headerSearchProps={{
          value: "",
          onChange: onSearchChange,
          placeholder: "Search models",
        }}
        headerLeading={<button type="button">Model family</button>}
        headerActions={<button type="button">Filter models</button>}
        onClose={() => {}}
      >
        Model options
      </PlatformModal>
    );

    const dialog = screen.getByRole("dialog", { name: "Select model" });
    const searchInput = screen.getByRole("searchbox", { name: "Search models" });
    expect(dialog.querySelector(".platform-modal-header.is-search")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Select model", level: 2 })
        .classList.contains("platform-modal-header__visually-hidden"),
    ).toBe(true);
    expect(screen.getByRole("button", { name: "Filter models" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Model family" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Model family" }).closest(".platform-modal-header__leading"),
    ).not.toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(searchInput));

    fireEvent.change(searchInput, { target: { value: "deepseek" } });
    expect(onSearchChange).toHaveBeenCalledOnce();
  });

  it("renders arbitrary media in an accessible media header", () => {
    render(
      <PlatformModal
        open
        visible
        portal={false}
        title="Create agent"
        description="Configure the new agent."
        headerVariant="media"
        headerMedia={<div data-testid="agent-identity-preview">Agent identity</div>}
        onClose={() => {}}
      >
        Agent fields
      </PlatformModal>
    );

    const dialog = screen.getByRole("dialog", { name: "Create agent" });
    expect(dialog.querySelector(".platform-modal-header.is-media")).not.toBeNull();
    expect(
      dialog.querySelector(".platform-modal-header__media")
        ?.contains(screen.getByTestId("agent-identity-preview")),
    ).toBe(true);
    expect(
      screen.getByRole("heading", { name: "Create agent", level: 2 })
        .classList.contains("platform-modal-header__visually-hidden"),
    ).toBe(true);
    expect(screen.getByText("Configure the new agent.").classList.contains(
      "platform-modal-header__visually-hidden",
    )).toBe(true);
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

  it("animates intrinsic surface size changes without animating the initial mount", () => {
    const offsetWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "offsetWidth",
    );
    const offsetHeightDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "offsetHeight",
    );
    const animateDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "animate",
    );
    let surfaceWidth = 400;
    let surfaceHeight = 220;
    const animation = {
      cancel: vi.fn(),
      oncancel: null,
      onfinish: null,
    } as unknown as Animation;
    const animate = vi.fn(() => animation);

    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get: () => surfaceWidth,
    });
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get: () => surfaceHeight,
    });
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: animate,
    });

    try {
      const { container, rerender } = render(
        <PlatformModalSurface>Compact content</PlatformModalSurface>,
      );
      expect(animate).not.toHaveBeenCalled();
      expect(
        container.querySelector(".platform-modal-surface")
          ?.getAttribute("data-platform-modal-resize"),
      ).toBe("animated");

      surfaceWidth = 560;
      surfaceHeight = 340;
      rerender(
        <PlatformModalSurface>Expanded content</PlatformModalSurface>,
      );

      expect(animate).toHaveBeenCalledOnce();
      expect(animate).toHaveBeenCalledWith(
        [
          { width: "400px", height: "220px" },
          { width: "560px", height: "340px" },
        ],
        {
          duration: 140,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "none",
        },
      );
    } finally {
      if (offsetWidthDescriptor) {
        Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidthDescriptor);
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "offsetWidth");
      }
      if (offsetHeightDescriptor) {
        Object.defineProperty(HTMLElement.prototype, "offsetHeight", offsetHeightDescriptor);
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "offsetHeight");
      }
      if (animateDescriptor) {
        Object.defineProperty(HTMLElement.prototype, "animate", animateDescriptor);
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "animate");
      }
    }
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

// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PlatformFloatingSidebar } from "./platform-floating-sidebar.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformFloatingSidebar", () => {
  it("renders a standard header and closes from its close button", async () => {
    const onClose = vi.fn();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    render(
      <PlatformFloatingSidebar open title="Version history" onClose={onClose}>
        <p>Saved versions</p>
      </PlatformFloatingSidebar>,
    );

    await act(async () => {});
    const sidebar = screen.getByRole("complementary", { name: "Version history" });
    expect(sidebar.getAttribute("data-state")).toBe("open");
    expect(screen.getByText("Saved versions")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Close sidebar" }));
    expect(onClose).toHaveBeenCalledWith("close-button");
  });

  it("supports Escape dismissal", () => {
    const onClose = vi.fn();
    render(
      <PlatformFloatingSidebar open title="History" onClose={onClose}>
        History
      </PlatformFloatingSidebar>,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledWith("escape");
  });

  it("renders into a supplied portal target", () => {
    const portalTarget = document.createElement("div");
    document.body.append(portalTarget);

    render(
      <PlatformFloatingSidebar
        open
        title="Portaled history"
        portal
        portalTarget={portalTarget}
        onClose={() => {}}
      >
        Portaled content
      </PlatformFloatingSidebar>,
    );

    expect(portalTarget.querySelector("[data-platform-floating-sidebar='true']")).not.toBeNull();
    portalTarget.remove();
  });
});

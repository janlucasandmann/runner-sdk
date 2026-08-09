// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { Search } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";
import { PlatformIconButton } from "./platform-icon-button.js";

afterEach(cleanup);

describe("PlatformIconButton", () => {
  it("provides the shared small icon-control contract by default", () => {
    render(
      <PlatformIconButton aria-label="Search">
        <Search />
      </PlatformIconButton>,
    );

    const button = screen.getByRole("button", { name: "Search" });
    expect(button.classList.contains("platform-icon-button")).toBe(true);
    expect(button.classList.contains("is-size-small")).toBe(true);
    expect(button.dataset.platformIconButtonSize).toBe("small");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("supports native state, explicit sizing, and active semantics", () => {
    render(
      <PlatformIconButton aria-label="Toggle panel" size="compact" active disabled>
        <Search />
      </PlatformIconButton>,
    );

    const button = screen.getByRole("button", { name: "Toggle panel" });
    expect(button.classList.contains("is-size-compact")).toBe(true);
    expect(button.classList.contains("is-active")).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("provides a reusable hover label with controlled placement", () => {
    render(
      <PlatformIconButton
        aria-label="Collapse sidebar"
        tooltip="Close sidebar"
        tooltipShortcut="⌘ B"
        tooltipPlacement="bottom"
        tooltipAlign="end"
      >
        <Search />
      </PlatformIconButton>,
    );

    const button = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(button.dataset.platformIconButtonTooltip).toBe("Close sidebar");
    expect(button.dataset.platformIconButtonTooltipShortcut).toBe("⌘ B");
    expect(button.dataset.platformIconButtonTooltipPlacement).toBe("bottom");
    expect(button.dataset.platformIconButtonTooltipAlign).toBe("end");
    expect(button.querySelector(".platform-icon-button__tooltip-label")?.textContent).toBe(
      "Close sidebar",
    );
    expect(button.querySelector(".platform-icon-button__tooltip-shortcut")?.textContent).toBe(
      "⌘ B",
    );
  });

  it("does not render tooltip metadata for an empty label", () => {
    render(
      <PlatformIconButton aria-label="More" tooltip="  ">
        <Search />
      </PlatformIconButton>,
    );

    const button = screen.getByRole("button", { name: "More" });
    expect(button.dataset.platformIconButtonTooltip).toBeUndefined();
    expect(button.dataset.platformIconButtonTooltipShortcut).toBeUndefined();
    expect(button.dataset.platformIconButtonTooltipPlacement).toBeUndefined();
    expect(button.dataset.platformIconButtonTooltipAlign).toBeUndefined();
  });

  it("keeps every shared icon control circular", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/platform-ui/components/ui/icon-button/icon-button.css"),
      "utf8",
    );

    expect(css).toMatch(/\.platform-icon-button\s*\{[^}]*border-radius: 50% !important;/s);
  });
});

// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Search } from "lucide-react";
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

  it("keeps every shared icon control circular", () => {
    const css = readFileSync(
      resolve(
        process.cwd(),
        "src/platform-ui/components/ui/icon-button/icon-button.css",
      ),
      "utf8",
    );

    expect(css).toMatch(
      /\.platform-icon-button\s*\{[^}]*border-radius: 50% !important;/s,
    );
  });
});

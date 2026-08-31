// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PlatformDetailSidebar, PlatformDetailSidebarSection } from "./platform-detail-sidebar.js";

afterEach(cleanup);

describe("PlatformDetailSidebar", () => {
  it("uses the shared sticky detail-sidebar baseline", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/platform-ui/components/composite/detail-sidebar/detail-sidebar.css"),
      "utf8",
    );
    const baseRule = css.match(/\.platform-detail-sidebar\s*\{([\s\S]*?)\n\}/)?.[1] || "";

    expect(baseRule).toContain("position: sticky;");
    expect(baseRule).toContain("top: 0;");
  });

  it("owns sidebar structure and collapsed accessibility state", () => {
    const { rerender } = render(
      <PlatformDetailSidebar ariaLabel="Agent settings">
        <PlatformDetailSidebarSection title="About"><button type="button">Model</button></PlatformDetailSidebarSection>
      </PlatformDetailSidebar>,
    );

    const sidebar = screen.getByRole("complementary", { name: "Agent settings" });
    expect(sidebar.getAttribute("data-collapsed")).toBe("false");
    expect(screen.getByRole("heading", { name: "About", level: 2 })).not.toBeNull();

    rerender(
      <PlatformDetailSidebar ariaLabel="Agent settings" collapsed>
        <PlatformDetailSidebarSection title="About"><button type="button">Model</button></PlatformDetailSidebarSection>
      </PlatformDetailSidebar>,
    );
    expect(sidebar.getAttribute("aria-hidden")).toBe("true");
    expect(sidebar.hasAttribute("inert")).toBe(true);
  });
});

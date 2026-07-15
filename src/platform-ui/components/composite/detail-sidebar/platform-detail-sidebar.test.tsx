// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PlatformDetailSidebar, PlatformDetailSidebarSection } from "./platform-detail-sidebar.js";

afterEach(cleanup);

describe("PlatformDetailSidebar", () => {
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

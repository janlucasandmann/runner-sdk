// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { PlatformDetailTabBar } from "./platform-detail-tab-bar.js";

afterEach(cleanup);

describe("PlatformDetailTabBar", () => {
  it("renders the optional bottom divider without changing the default", () => {
    const tabs = [{ id: "general", label: "General" }] as const;
    const { rerender } = render(
      <PlatformDetailTabBar
        tabs={tabs}
        value="general"
        onValueChange={() => {}}
      />
    );

    const tabBar = screen.getByRole("navigation", { name: "Details" });
    expect(tabBar.classList.contains("has-divider")).toBe(false);

    rerender(
      <PlatformDetailTabBar
        tabs={tabs}
        value="general"
        onValueChange={() => {}}
        showDivider
      />
    );
    expect(tabBar.classList.contains("has-divider")).toBe(true);
  });

  it("exposes a minimal text-only variant without dividers", () => {
    render(
      <PlatformDetailTabBar
        tabs={[
          { id: "agent", label: "Agent Models" },
          { id: "image", label: "Image" },
        ]}
        value="agent"
        onValueChange={() => {}}
        variant="minimal"
        showDivider
      />
    );

    const tabBar = screen.getByRole("navigation", { name: "Details" });
    expect(tabBar.classList.contains("is-minimal")).toBe(true);
    expect(tabBar.classList.contains("has-divider")).toBe(false);
    expect(tabBar.getAttribute("data-platform-detail-tab-bar-variant")).toBe("minimal");
    expect(screen.getByRole("tab", { name: "Agent Models" }).classList.contains("is-active")).toBe(true);
  });

  it("keeps optional end actions outside the scrollable tab list", () => {
    const { container } = render(
      <PlatformDetailTabBar
        tabs={[{ id: "general", label: "General" }]}
        value="general"
        onValueChange={() => {}}
        endActions={<button type="button">Versions</button>}
      />
    );

    const tabList = screen.getByRole("tablist");
    const endActions = container.querySelector(".platform-detail-tab-bar__end-actions");
    expect(endActions).not.toBeNull();
    expect(endActions?.contains(screen.getByRole("button", { name: "Versions" }))).toBe(true);
    expect(tabList.contains(screen.getByRole("button", { name: "Versions" }))).toBe(false);
  });

  it("changes tabs through clicks and keyboard navigation", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function Example() {
      const [value, setValue] = useState("general");
      return (
        <PlatformDetailTabBar
          tabs={[
            { id: "general", label: "General" },
            { id: "disabled", label: "Disabled", disabled: true },
            { id: "insights", label: "Insights" },
          ]}
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onChange(next);
          }}
          panelId="details-panel"
        />
      );
    }

    render(<Example />);
    const general = screen.getByRole("tab", { name: "General" });
    general.focus();
    await user.keyboard("{ArrowRight}");

    expect(onChange).toHaveBeenLastCalledWith("insights");
    expect(screen.getByRole("tab", { name: "Insights" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Insights" }).getAttribute("aria-controls")).toBe("details-panel");

    await user.click(general);
    expect(onChange).toHaveBeenLastCalledWith("general");
  });
});

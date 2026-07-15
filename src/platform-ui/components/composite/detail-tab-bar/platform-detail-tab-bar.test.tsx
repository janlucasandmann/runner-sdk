// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { PlatformDetailTabBar } from "./platform-detail-tab-bar.js";

afterEach(cleanup);

describe("PlatformDetailTabBar", () => {
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

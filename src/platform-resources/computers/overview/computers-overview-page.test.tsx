// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ResourceOverviewAnalyticsModel } from "../../../platform-ui/pages/overview/index.js";
import {
  type ComputerOverviewRow,
  ComputersOverviewPage,
} from "./computers-overview-page.js";

const analytics: ResourceOverviewAnalyticsModel = {
  metrics: [],
  labels: [],
  series: [],
};

function createRows(count: number): ComputerOverviewRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `computer-${index + 1}`,
    name: `Computer ${String(index + 1).padStart(2, "0")}`,
    description: index === 0 ? "Primary build computer" : "",
    profileLabel: "Standard",
    status: "Running",
    isRunning: true,
    creatorName: "Computer Agents",
    createdLabel: "Today",
    lastUsedLabel: "Today",
  }));
}

afterEach(() => {
  cleanup();
});

describe("ComputersOverviewPage", () => {
  it("uses the shared analytics catalog and its 20 then 10 row reveal", () => {
    const { container } = render(
      <ComputersOverviewPage
        rows={createRows(35)}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onShare={vi.fn()}
        onCopy={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      container
        .querySelector(".resource-overview-page")
        ?.getAttribute("data-resource-overview-page-variant"),
    ).toBe("analytics-catalog");
    expect(
      container.querySelector(
        ".resource-overview-page__analytics-header .platform-analytics__chart",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(".platform-data-table.is-catalog-ui"),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".resource-overview-identity__visual.is-standard-name.is-computer svg",
      ),
    ).not.toBeNull();
    expect(screen.getByText("Primary build computer")).not.toBeNull();
    expect(screen.getAllByText("No description").length).toBeGreaterThan(0);
    expect(screen.getByText("Computer 20")).not.toBeNull();
    expect(screen.queryByText("Computer 21")).toBeNull();

    const scroll = container.querySelector<HTMLElement>(
      ".platform-data-table__scroll",
    );
    expect(scroll).not.toBeNull();
    Object.defineProperties(scroll as HTMLElement, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 600, writable: true },
    });
    fireEvent.scroll(scroll as HTMLElement);

    expect(screen.getByText("Computer 30")).not.toBeNull();
    expect(screen.queryByText("Computer 31")).toBeNull();
  });
});

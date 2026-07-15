// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PlatformAnalyticsSection } from "./platform-analytics-section.js";

afterEach(cleanup);

describe("PlatformAnalyticsSection", () => {
  it("renders KPI values and the shared empty chart state", () => {
    const { container } = render(
      <PlatformAnalyticsSection
        analytics={{
          title: "Usage",
          ariaLabel: "Usage analytics",
          metrics: [
            { id: "runs", label: "Runs", value: "18", color: "#7effff" },
            { id: "tokens", label: "Total tokens", value: "24,000", color: "#8fc4ff" },
          ],
          labels: [],
          series: [],
          emptyState: "No usage yet.",
        }}
      />,
    );

    expect(container.querySelectorAll(".platform-analytics")).toHaveLength(1);
    expect(screen.getByLabelText("Usage analytics")).not.toBeNull();
    expect(screen.getByText("Runs")).not.toBeNull();
    expect(screen.getByText("24,000")).not.toBeNull();
    expect(screen.getByText("No usage yet.")).not.toBeNull();
  });

  it("owns the analytics loading state", () => {
    render(
      <PlatformAnalyticsSection
        analytics={{ metrics: [], labels: [], series: [], loading: true }}
      />,
    );

    expect(screen.getByRole("status", { name: "Loading analytics" })).not.toBeNull();
  });
});

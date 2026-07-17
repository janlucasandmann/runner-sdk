// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
    expect(screen.queryByRole("heading", { name: "Usage" })).toBeNull();
  });

  it("renders the framed analytics composition with title, actions, KPIs, and custom chart content", () => {
    const onTimeframeValueChange = vi.fn();
    const { container } = render(
      <PlatformAnalyticsSection
        variant="framed"
        title="Analytics"
        timeframe={{
          value: "5d",
          options: [
            { value: "5d", label: "5D" },
            { value: "1m", label: "1M" },
          ],
          onValueChange: onTimeframeValueChange,
          ariaLabel: "Performance range",
        }}
        headerActions={<button type="button">Download chart</button>}
        chartContent={<div data-testid="specialized-chart">Specialized chart</div>}
        analytics={{
          ariaLabel: "Agent analytics",
          metrics: [{ id: "runs", label: "Total Runs", value: "24", color: "#7effff" }],
          labels: ["Mon"],
          series: [{ id: "runs", label: "Runs", values: [24], color: "#7effff" }],
        }}
      />,
    );

    const section = screen.getByLabelText("Agent analytics");
    expect(section.classList.contains("is-framed")).toBe(true);
    expect(section.getAttribute("data-platform-analytics-variant")).toBe("framed");
    expect(screen.getByRole("heading", { name: "Analytics", level: 2 })).not.toBeNull();
    expect(screen.getByRole("radiogroup", { name: "Performance range" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Download chart" })).not.toBeNull();
    expect(screen.getByText("Total Runs")).not.toBeNull();
    expect(screen.getByTestId("specialized-chart")).not.toBeNull();
    expect(container.querySelector(".platform-analytics__header-actions")).not.toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "1M" }));
    expect(onTimeframeValueChange).toHaveBeenCalledWith("1m");
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

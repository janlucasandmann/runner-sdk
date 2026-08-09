// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformAnalyticsSection } from "./platform-analytics-section.js";

afterEach(cleanup);

describe("PlatformAnalyticsSection", () => {
  it("hides KPI values when the shared chart has no recorded data", () => {
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
        }}
      />,
    );

    expect(container.querySelectorAll(".platform-analytics")).toHaveLength(1);
    expect(screen.getByLabelText("Usage analytics")).not.toBeNull();
    expect(screen.queryByText("Runs")).toBeNull();
    expect(screen.queryByText("24,000")).toBeNull();
    expect(container.querySelector(".platform-analytics__metrics")).toBeNull();
    expect(container.querySelector(".platform-analytics")?.classList.contains("has-no-metrics")).toBe(true);
    expect(screen.getByText("No data available yet")).not.toBeNull();
    expect(screen.getByText("Analytics will appear here once activity has been recorded.")).not.toBeNull();
    expect(container.querySelector(".platform-analytics-empty-state svg")).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Usage" })).toBeNull();
  });

  it("renders the framed analytics composition without KPIs in the shared empty state", () => {
    const onTimeframeValueChange = vi.fn();
    const { container } = render(
      <PlatformAnalyticsSection
        variant="framed"
        title="Analytics"
        timeframe={{
          value: "day",
          options: [
            { value: "day", label: "24H" },
            { value: "week", label: "7D" },
            { value: "month", label: "30D" },
          ],
          onValueChange: onTimeframeValueChange,
          ariaLabel: "Performance range",
        }}
        analytics={{
          ariaLabel: "Agent analytics",
          metrics: [{ id: "runs", label: "Total Runs", value: "24", color: "#7effff" }],
          labels: [],
          series: [],
        }}
      />,
    );

    const section = screen.getByLabelText("Agent analytics");
    expect(section.classList.contains("is-framed")).toBe(true);
    expect(section.getAttribute("data-platform-analytics-variant")).toBe("framed");
    expect(screen.getByRole("heading", { name: "Analytics", level: 2 })).not.toBeNull();
    expect(screen.getByRole("radiogroup", { name: "Performance range" })).not.toBeNull();
    expect(screen.queryByText("Total Runs")).toBeNull();
    expect(screen.getByText("No data available yet")).not.toBeNull();
    expect(screen.getByText("Analytics will appear here once activity has been recorded.")).not.toBeNull();
    expect(container.querySelector(".platform-analytics-empty-state svg")).not.toBeNull();
    expect(container.querySelector(".platform-analytics__header-actions")).not.toBeNull();
    expect(container.querySelector(".platform-analytics-chart__state")).not.toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "30D" }));
    expect(onTimeframeValueChange).toHaveBeenCalledWith("month");
  });

  it("keeps default analytics unboxed while owning its timeframe control", () => {
    const onTimeframeValueChange = vi.fn();
    render(
      <PlatformAnalyticsSection
        timeframe={{
          value: "week",
          options: [
            { value: "day", label: "24H" },
            { value: "week", label: "7D" },
          ],
          onValueChange: onTimeframeValueChange,
          ariaLabel: "Agent analytics time frame",
        }}
        analytics={{
          title: "Analytics",
          metrics: [],
          labels: [],
          series: [],
        }}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Analytics" })).toBeNull();
    expect(screen.getByRole("radiogroup", { name: "Agent analytics time frame" })).not.toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "24H" }));
    expect(onTimeframeValueChange).toHaveBeenCalledWith("day");
  });

  it("owns the analytics loading state", () => {
    render(
      <PlatformAnalyticsSection
        analytics={{ metrics: [], labels: [], series: [], loading: true }}
      />,
    );

    expect(screen.getByRole("status", { name: "Loading analytics" })).not.toBeNull();
  });

  it("supports the centralized KPI composition without mounting a chart", () => {
    const { container } = render(
      <PlatformAnalyticsSection
        showChart={false}
        analytics={{
          ariaLabel: "Run summary metrics",
          metrics: [
            { id: "findings", label: "Findings", value: "3", color: "#4da3ff" },
            { id: "artifacts", label: "Artifacts", value: "2", color: "#85df7b" },
          ],
          labels: [],
          series: [],
        }}
      />,
    );

    expect(screen.getByLabelText("Run summary metrics")).not.toBeNull();
    expect(container.querySelectorAll(".platform-analytics__metric")).toHaveLength(2);
    expect(container.querySelector(".platform-analytics__chart")).toBeNull();
    expect(container.querySelector(".platform-analytics-empty-state")).toBeNull();
  });

  it("renders the compact sidebar composition with its title and three KPIs", () => {
    const { container } = render(
      <PlatformAnalyticsSection
        variant="compact"
        title="Progress"
        showChart={false}
        analytics={{
          ariaLabel: "Project progress",
          metrics: [
            { id: "scope", label: "Scope", value: "3", color: "#777" },
            { id: "started", label: "Started", value: "1", color: "#ffd000" },
            { id: "completed", label: "Completed", value: "0", color: "#636bdc" },
          ],
          labels: [],
          series: [],
        }}
      />,
    );

    const section = screen.getByLabelText("Project progress");
    expect(section.classList.contains("is-compact")).toBe(true);
    expect(section.getAttribute("data-platform-analytics-variant")).toBe("compact");
    expect(screen.getByRole("heading", { name: "Progress", level: 2 })).not.toBeNull();
    expect(container.querySelectorAll(".platform-analytics__metric")).toHaveLength(3);
  });
});

// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformAnalyticsChart } from "./platform-analytics-chart.js";

interface CapturedChartConfiguration {
  data: {
    datasets: Array<Record<string, unknown>>;
  };
  options: {
    scales: {
      x: {
        ticks: {
          display?: boolean;
          padding?: number;
        };
      };
      y: {
        display?: boolean;
        grid: {
          display: boolean;
        };
      };
    };
  };
  plugins: Array<{ id: string }>;
}

const chartConfigurations = vi.hoisted(() => [] as CapturedChartConfiguration[]);

vi.mock("chart.js/auto", () => ({
  default: class ChartMock {
    constructor(_canvas: HTMLCanvasElement, configuration: CapturedChartConfiguration) {
      chartConfigurations.push(configuration);
    }

    destroy() {}
  },
}));

afterEach(() => {
  cleanup();
  chartConfigurations.length = 0;
});

describe("PlatformAnalyticsChart", () => {
  it("uses the centralized loading state while analytics are loading", () => {
    const { container } = render(
      <PlatformAnalyticsChart
        analytics={{
          metrics: [],
          labels: [],
          series: [],
          loading: true,
        }}
      />,
    );

    expect(screen.getByRole("status", { name: "Loading analytics" })).not.toBeNull();
    expect(container.querySelector(".platform-loading-state")).not.toBeNull();
    expect(container.querySelector(".platform-loading-state__loader")).not.toBeNull();
  });

  it("uses the canonical layered area treatment for shared line charts", () => {
    render(
      <PlatformAnalyticsChart
        chartType="line"
        analytics={{
          metrics: [],
          labels: ["Jun 19", "Jun 24", "Jun 29"],
          series: [
            {
              id: "current",
              label: "Current",
              color: "#8fc4ff",
              values: [28, 58, 102],
            },
            {
              id: "comparison",
              label: "Comparison",
              color: "#4da3ff",
              values: [0, 26, 64],
            },
          ],
        }}
      />,
    );

    const configuration = chartConfigurations.at(-1);
    expect(configuration).toBeDefined();
    expect(configuration?.data.datasets[0]).toMatchObject({
      fill: "origin",
      borderColor: "#7657ff",
      backgroundColor: "rgba(193, 218, 248, 0.92)",
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.38,
      cubicInterpolationMode: "monotone",
    });
    expect(configuration?.data.datasets[1]).toMatchObject({
      fill: "origin",
      borderColor: "#7657ff",
      backgroundColor: "rgba(53, 126, 239, 0.9)",
    });
    expect(configuration?.options.scales.y.grid.display).toBe(false);
    expect(configuration?.plugins.map((plugin) => plugin.id)).toContain(
      "platform-analytics-dashed-grid",
    );
  });

  it("preserves explicit unfilled line series", () => {
    render(
      <PlatformAnalyticsChart
        chartType="line"
        analytics={{
          metrics: [],
          labels: ["Jun 19", "Jun 24"],
          series: [
            {
              id: "target",
              label: "Target",
              color: "#7effff",
              values: [20, 25],
              fill: false,
            },
          ],
        }}
      />,
    );

    expect(chartConfigurations.at(-1)?.data.datasets[0]).toMatchObject({
      fill: false,
      borderColor: "#7effff",
      backgroundColor: "transparent",
    });
  });

  it("renders recorded all-zero datasets when data availability is explicit", () => {
    render(
      <PlatformAnalyticsChart
        chartType="line"
        analytics={{
          metrics: [],
          labels: ["Case 1", "Case 2"],
          hasData: true,
          series: [
            {
              id: "score",
              label: "Case score",
              color: "#8fc4ff",
              values: [0, 0],
              valueKind: "percent",
            },
          ],
        }}
      />,
    );

    expect(chartConfigurations.at(-1)).toBeDefined();
    expect(chartConfigurations.at(-1)?.data.datasets[0]).toMatchObject({
      data: [0, 0],
    });
  });

  it("can hide x-axis labels without removing the chart labels", () => {
    render(
      <PlatformAnalyticsChart
        showXAxisLabels={false}
        chartType="line"
        analytics={{
          metrics: [],
          labels: ["Run 1", "Run 2"],
          hasData: true,
          series: [
            {
              id: "score",
              label: "Average score",
              color: "#8fc4ff",
              values: [70, 90],
              valueKind: "percent",
            },
          ],
        }}
      />,
    );

    const configuration = chartConfigurations.at(-1);
    expect(configuration?.options.scales.x.ticks).toMatchObject({
      display: false,
      padding: 0,
    });
  });

  it("uses the compact chart configuration and explicit area color for sidebar charts", () => {
    render(
      <PlatformAnalyticsChart
        compact
        chartType="line"
        analytics={{
          metrics: [],
          labels: ["Jun 11", "Jul 1", "Jul 24"],
          series: [
            {
              id: "completed",
              label: "Completed",
              color: "#636bdc",
              fillColor: "rgba(99, 107, 220, 0.28)",
              values: [0, 1, 2],
              fill: true,
            },
          ],
        }}
      />,
    );

    const configuration = chartConfigurations.at(-1);
    expect(configuration?.data.datasets[0]).toMatchObject({
      borderColor: "#636bdc",
      backgroundColor: "rgba(99, 107, 220, 0.28)",
      pointRadius: [0, 0, 3],
    });
    expect(configuration?.options.scales.y.display).toBe(false);
    expect(configuration?.plugins).toEqual([]);
  });
});

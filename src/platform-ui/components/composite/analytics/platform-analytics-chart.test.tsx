// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformAnalyticsChart } from "./platform-analytics-chart.js";

interface CapturedChartConfiguration {
  data: {
    datasets: Array<Record<string, unknown>>;
  };
  options: {
    scales: {
      y: {
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
});

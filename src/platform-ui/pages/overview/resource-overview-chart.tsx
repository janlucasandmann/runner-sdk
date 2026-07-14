import Chart from "chart.js/auto";
import { useEffect, useMemo, useRef } from "react";
import { DotLoader } from "../../../react/dot-loader.js";
import type { ResourceOverviewAnalyticsModel, ResourceOverviewValueKind } from "./resource-overview-types.js";

interface ResourceOverviewChartProps {
  analytics: ResourceOverviewAnalyticsModel;
}

function formatChartValue(value: number, kind: ResourceOverviewValueKind = "count"): string {
  if (kind === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: value > 0 && value < 1 ? 3 : 2,
      maximumFractionDigits: value > 0 && value < 1 ? 4 : 2,
    }).format(value);
  }
  if (kind === "duration") {
    if (value < 60) return `${Math.round(value)}m`;
    return `${(value / 60).toFixed(value >= 600 ? 0 : 1)}h`;
  }
  if (kind === "percent") return `${Math.round(value)}%`;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function ResourceOverviewChart({ analytics }: ResourceOverviewChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const labels = useMemo(() => Array.from(analytics.labels || []), [analytics.labels]);
  const series = useMemo(
    () => Array.from(analytics.series || []).filter((entry) => entry.values.length === labels.length),
    [analytics.series, labels.length],
  );
  const hasData = labels.length > 0 && series.some((entry) => entry.values.some((value) => Number(value) !== 0));
  const signature = useMemo(() => JSON.stringify({ labels, series }), [labels, series]);

  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || analytics.loading || analytics.error || !hasData) {
      chartRef.current?.destroy();
      chartRef.current = null;
      return;
    }

    chartRef.current?.destroy();
    const maxValue = Math.max(0, ...series.flatMap((entry) => entry.values.map((value) => Math.max(0, Number(value) || 0))));
    const maxReferencePlugin = {
      id: "resource-overview-max-reference",
      afterDatasetsDraw(chart: Chart) {
        if (maxValue <= 0) return;
        const yScale = chart.scales.y;
        const chartArea = chart.chartArea;
        if (!yScale || !chartArea) return;
        const y = yScale.getPixelForValue(maxValue);
        const context = chart.ctx;
        context.save();
        context.beginPath();
        context.setLineDash([4, 5]);
        context.strokeStyle = "rgba(255,255,255,0.36)";
        context.lineWidth = 1;
        context.moveTo(chartArea.left, y);
        context.lineTo(chartArea.right, y);
        context.stroke();
        context.restore();
      },
    };

    chartRef.current = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: series.map((entry) => ({
          type: entry.type || "bar",
          label: entry.label,
          data: entry.values.map((value) => Math.max(0, Number(value) || 0)),
          borderColor: entry.color,
          backgroundColor: entry.type === "line" ? `${entry.color}22` : entry.color,
          borderWidth: entry.type === "line" ? 1.35 : 0,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.32,
          fill: Boolean(entry.fill),
          stack: entry.stack,
          borderRadius: entry.type === "line" ? 0 : 3,
          borderSkipped: false,
          barPercentage: 0.9,
          categoryPercentage: 0.58,
          maxBarThickness: 24,
        })),
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        normalized: true,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(20,20,20,0.94)",
            borderColor: "rgba(255,255,255,0.12)",
            borderWidth: 1,
            padding: 10,
            titleColor: "rgba(255,255,255,0.72)",
            bodyColor: "#fff",
            callbacks: {
              label(context) {
                const entry = series[context.datasetIndex];
                const value = Number(context.parsed.y || 0);
                return `${entry?.label || context.dataset.label || "Value"}: ${formatChartValue(value, entry?.valueKind)}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: series.some((entry) => Boolean(entry.stack)),
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: "rgba(255,255,255,0.4)",
              font: { family: "Inter, sans-serif", size: 11, weight: 400 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7,
            },
          },
          y: {
            beginAtZero: true,
            stacked: series.some((entry) => Boolean(entry.stack)),
            border: { display: false },
            grid: { color: "rgba(255,255,255,0.08)", lineWidth: 1 },
            ticks: {
              color: "rgba(255,255,255,0.4)",
              font: { family: "Inter, sans-serif", size: 11, weight: 400 },
              maxTicksLimit: 5,
              callback(value) {
                const firstKind = series[0]?.valueKind;
                return formatChartValue(Number(value), firstKind);
              },
            },
          },
        },
      },
      plugins: [maxReferencePlugin],
    });
  }, [analytics.error, analytics.loading, hasData, labels, series, signature]);

  if (analytics.loading) {
    return (
      <div className="resource-overview-chart__state" role="status" aria-label="Loading analytics">
        <DotLoader className="resource-overview-chart__loader" dotCount={9} dotSize={3} gap={2} speed={800} />
      </div>
    );
  }
  if (analytics.error) return <div className="resource-overview-chart__state is-error" role="alert">{analytics.error}</div>;
  if (!hasData) return <div className="resource-overview-chart__state is-empty">{analytics.emptyState || "No usage data yet."}</div>;

  return (
    <div className="resource-overview-chart__frame">
      <canvas ref={canvasRef} role="img" aria-label={analytics.ariaLabel || analytics.title || "Resource usage"} />
    </div>
  );
}

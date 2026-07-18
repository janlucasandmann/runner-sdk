import Chart from "chart.js/auto";
import { useEffect, useMemo, useRef } from "react";
import { DotLoader } from "../../ui/dot-loader/index.js";
import { PlatformAnalyticsEmptyState } from "./platform-analytics-empty-state.js";
import type {
  PlatformAnalyticsAxis,
  PlatformAnalyticsChartProps,
  PlatformAnalyticsSeries,
  PlatformAnalyticsValueKind,
} from "./platform-analytics-types.js";

function formatChartValue(value: number, kind: PlatformAnalyticsValueKind = "count"): string {
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
  if (kind === "tokens") {
    return new Intl.NumberFormat("en-US", {
      notation: value >= 1_000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function resolveSeriesType(series: PlatformAnalyticsSeries, chartType: PlatformAnalyticsChartProps["chartType"]) {
  return chartType || series.type || "line";
}

function getAxisSeries(series: readonly PlatformAnalyticsSeries[], axis: PlatformAnalyticsAxis) {
  return series.filter((entry) => (entry.axis || "primary") === axis);
}

export function PlatformAnalyticsChart({ analytics, chartType }: PlatformAnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const labels = useMemo(() => Array.from(analytics.labels || []), [analytics.labels]);
  const series = useMemo(
    () => Array.from(analytics.series || []).filter((entry) => entry.values.length === labels.length),
    [analytics.series, labels.length],
  );
  const hasData = labels.length > 0 && series.some((entry) => entry.values.some((value) => Number(value) !== 0));
  const signature = useMemo(() => JSON.stringify({ chartType, labels, series }), [chartType, labels, series]);

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
    const primarySeries = getAxisSeries(series, "primary");
    const referenceSeries = primarySeries.length > 0 ? primarySeries : getAxisSeries(series, "secondary");
    const referenceAxisId = primarySeries.length > 0 ? "y" : "y1";
    const maxValue = Math.max(0, ...referenceSeries.flatMap((entry) => entry.values.map((value) => Math.max(0, Number(value) || 0))));
    const maxReferencePlugin = {
      id: "platform-analytics-max-reference",
      afterDatasetsDraw(chart: Chart) {
        if (maxValue <= 0) return;
        const yScale = chart.scales[referenceAxisId];
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
    const hasSecondaryAxis = series.some((entry) => entry.axis === "secondary");
    const isStacked = series.some((entry) => resolveSeriesType(entry, chartType) === "bar" && Boolean(entry.stack));
    const primaryKind = primarySeries[0]?.valueKind;
    const secondaryKind = getAxisSeries(series, "secondary")[0]?.valueKind;
    const rootType = chartType || series[0]?.type || "line";

    chartRef.current = new Chart(canvas, {
      type: rootType,
      data: {
        labels,
        datasets: series.map((entry) => {
          const resolvedType = resolveSeriesType(entry, chartType);
          const isLine = resolvedType === "line";
          return {
            type: resolvedType,
            label: entry.label,
            data: entry.values.map((value) => Math.max(0, Number(value) || 0)),
            borderColor: entry.color,
            backgroundColor: isLine ? `${entry.color}22` : entry.color,
            borderWidth: isLine ? 1.35 : 0,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: 0.32,
            fill: isLine && Boolean(entry.fill),
            yAxisID: entry.axis === "secondary" ? "y1" : "y",
            stack: isLine ? undefined : entry.stack,
            borderRadius: isLine ? 0 : 3,
            borderSkipped: false,
            barPercentage: 0.9,
            categoryPercentage: 0.58,
            maxBarThickness: 24,
          };
        }),
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
            stacked: isStacked,
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
            stacked: isStacked,
            position: "left",
            border: { display: false },
            grid: { color: "rgba(255,255,255,0.08)", lineWidth: 1 },
            ticks: {
              color: "rgba(255,255,255,0.4)",
              font: { family: "Inter, sans-serif", size: 11, weight: 400 },
              maxTicksLimit: 5,
              callback(value) {
                return formatChartValue(Number(value), primaryKind);
              },
            },
          },
          ...(hasSecondaryAxis ? {
            y1: {
              beginAtZero: true,
              position: "right" as const,
              border: { display: false },
              grid: { drawOnChartArea: false },
              ticks: {
                color: "rgba(255,255,255,0.4)",
                font: { family: "Inter, sans-serif", size: 11, weight: 400 as const },
                maxTicksLimit: 5,
                callback(value: string | number) {
                  return formatChartValue(Number(value), secondaryKind);
                },
              },
            },
          } : {}),
        },
      },
      plugins: [maxReferencePlugin],
    });
  }, [analytics.error, analytics.loading, chartType, hasData, labels, series, signature]);

  if (analytics.loading) {
    return (
      <div className="platform-analytics-chart__state" role="status" aria-label="Loading analytics">
        <DotLoader className="platform-analytics-chart__loader" dotCount={9} dotSize={3} gap={2} speed={800} />
      </div>
    );
  }
  if (analytics.error) return <div className="platform-analytics-chart__state is-error" role="alert">{analytics.error}</div>;
  if (!hasData) {
    return (
      <div className="platform-analytics-chart__state is-empty">
        <PlatformAnalyticsEmptyState />
      </div>
    );
  }

  return (
    <div className="platform-analytics-chart__frame">
      <canvas ref={canvasRef} role="img" aria-label={analytics.ariaLabel || analytics.title || "Resource usage"} />
    </div>
  );
}

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

const PLATFORM_ANALYTICS_AREA_STYLES = [
  {
    borderColor: "#7657ff",
    backgroundColor: "rgba(193, 218, 248, 0.92)",
  },
  {
    borderColor: "#7657ff",
    backgroundColor: "rgba(53, 126, 239, 0.9)",
  },
  {
    borderColor: "#4da3ff",
    backgroundColor: "rgba(77, 163, 255, 0.52)",
  },
  {
    borderColor: "#7effff",
    backgroundColor: "rgba(126, 255, 255, 0.28)",
  },
] as const;

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

function resolveSeriesType(
  series: PlatformAnalyticsSeries,
  chartType: PlatformAnalyticsChartProps["chartType"],
) {
  return chartType || series.type || "line";
}

function getAxisSeries(series: readonly PlatformAnalyticsSeries[], axis: PlatformAnalyticsAxis) {
  return series.filter((entry) => (entry.axis || "primary") === axis);
}

function resolveAreaStyle(seriesIndex: number) {
  return PLATFORM_ANALYTICS_AREA_STYLES[seriesIndex % PLATFORM_ANALYTICS_AREA_STYLES.length];
}

export function PlatformAnalyticsChart({
  analytics,
  chartType,
  compact = false,
}: PlatformAnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const labels = useMemo(() => Array.from(analytics.labels || []), [analytics.labels]);
  const series = useMemo(
    () =>
      Array.from(analytics.series || []).filter((entry) => entry.values.length === labels.length),
    [analytics.series, labels.length],
  );
  const hasData =
    typeof analytics.hasData === "boolean"
      ? analytics.hasData && labels.length > 0 && series.length > 0
      : labels.length > 0 && series.some((entry) => entry.values.some((value) => Number(value) !== 0));

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
    const referenceSeries =
      primarySeries.length > 0 ? primarySeries : getAxisSeries(series, "secondary");
    const referenceAxisId = primarySeries.length > 0 ? "y" : "y1";
    const maxValue = Math.max(
      0,
      ...referenceSeries.flatMap((entry) =>
        entry.values.map((value) => Math.max(0, Number(value) || 0)),
      ),
    );
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
    const dashedGridPlugin = {
      id: "platform-analytics-dashed-grid",
      beforeDatasetsDraw(chart: Chart) {
        const yScale = chart.scales[referenceAxisId];
        const chartArea = chart.chartArea;
        if (!yScale || !chartArea) return;
        const context = chart.ctx;
        context.save();
        context.setLineDash([4, 5]);
        context.strokeStyle = "rgba(255,255,255,0.075)";
        context.lineWidth = 1;
        yScale.ticks.forEach((tick) => {
          const y = yScale.getPixelForValue(tick.value);
          if (y < chartArea.top || y > chartArea.bottom) return;
          context.beginPath();
          context.moveTo(chartArea.left, y);
          context.lineTo(chartArea.right, y);
          context.stroke();
        });
        context.restore();
      },
    };
    const hasSecondaryAxis = series.some((entry) => entry.axis === "secondary");
    const isStacked = series.some(
      (entry) => resolveSeriesType(entry, chartType) === "bar" && Boolean(entry.stack),
    );
    const primaryKind = primarySeries[0]?.valueKind;
    const secondaryKind = getAxisSeries(series, "secondary")[0]?.valueKind;
    const rootType = chartType || series[0]?.type || "line";

    chartRef.current = new Chart(canvas, {
      type: rootType,
      data: {
        labels,
        datasets: series.map((entry, seriesIndex) => {
          const resolvedType = resolveSeriesType(entry, chartType);
          const isLine = resolvedType === "line";
          const usesAreaTreatment = isLine && entry.fill !== false;
          const areaStyle = resolveAreaStyle(seriesIndex);
          const resolvedAreaBorderColor = entry.fillColor ? entry.color : areaStyle.borderColor;
          const resolvedAreaBackgroundColor = entry.fillColor || areaStyle.backgroundColor;
          return {
            type: resolvedType,
            label: entry.label,
            data: entry.values.map((value) => Math.max(0, Number(value) || 0)),
            borderColor: usesAreaTreatment ? resolvedAreaBorderColor : entry.color,
            backgroundColor: usesAreaTreatment
              ? resolvedAreaBackgroundColor
              : isLine
                ? "transparent"
                : entry.color,
            borderWidth: isLine ? 1.5 : 0,
            pointRadius: compact
              ? entry.values.map((_, valueIndex) =>
                  valueIndex === entry.values.length - 1 ? 3 : 0
                )
              : 0,
            pointHoverRadius: isLine ? 4 : 0,
            pointHitRadius: isLine ? 12 : 0,
            pointHoverBorderWidth: isLine ? 2 : 0,
            pointHoverBorderColor: isLine ? "#fff" : undefined,
            pointHoverBackgroundColor: isLine
              ? usesAreaTreatment
                ? resolvedAreaBorderColor
                : entry.color
              : undefined,
            tension: 0.38,
            cubicInterpolationMode: isLine ? "monotone" : undefined,
            spanGaps: true,
            fill: usesAreaTreatment ? "origin" : false,
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
        layout: {
          padding: {
            top: compact ? 2 : 8,
          },
        },
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
              color: "rgba(255,255,255,0.42)",
              font: { family: "Inter, sans-serif", size: 11, weight: 400 },
              padding: compact ? 6 : 10,
              maxRotation: 0,
              autoSkip: !compact,
              maxTicksLimit: compact ? 2 : 7,
              callback(_value, index) {
                if (compact && index !== 0 && index !== labels.length - 1) {
                  return "";
                }
                return labels[index] || "";
              },
            },
          },
          y: {
            display: !compact,
            beginAtZero: true,
            stacked: isStacked,
            position: "left",
            border: { display: false },
            grace: "14%",
            grid: {
              display: false,
              drawTicks: false,
            },
            ticks: {
              color: "rgba(255,255,255,0.42)",
              font: { family: "Inter, sans-serif", size: 11, weight: 400 },
              padding: 12,
              maxTicksLimit: 4,
              callback(value) {
                return formatChartValue(Number(value), primaryKind);
              },
            },
          },
          ...(hasSecondaryAxis
            ? {
                y1: {
                  beginAtZero: true,
                  position: "right" as const,
                  border: { display: false },
                  grace: "14%",
                  grid: { drawOnChartArea: false },
                  ticks: {
                    color: "rgba(255,255,255,0.42)",
                    font: { family: "Inter, sans-serif", size: 11, weight: 400 as const },
                    padding: 12,
                    maxTicksLimit: 4,
                    callback(value: string | number) {
                      return formatChartValue(Number(value), secondaryKind);
                    },
                  },
                },
              }
            : {}),
        },
      },
      plugins: compact ? [] : [dashedGridPlugin, maxReferencePlugin],
    });
  }, [analytics.error, analytics.loading, chartType, compact, hasData, labels, series]);

  if (analytics.loading) {
    return (
      <div className="platform-analytics-chart__state" role="status" aria-label="Loading analytics">
        <DotLoader
          className="platform-analytics-chart__loader"
          dotCount={9}
          dotSize={3}
          gap={2}
          speed={800}
        />
      </div>
    );
  }
  if (analytics.error)
    return (
      <div className="platform-analytics-chart__state is-error" role="alert">
        {analytics.error}
      </div>
    );
  if (!hasData) {
    return (
      <div className="platform-analytics-chart__state is-empty">
        <PlatformAnalyticsEmptyState />
      </div>
    );
  }

  return (
    <div className="platform-analytics-chart__frame">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={analytics.ariaLabel || analytics.title || "Resource usage"}
      />
    </div>
  );
}

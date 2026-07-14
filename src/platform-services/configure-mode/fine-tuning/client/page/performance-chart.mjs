export const FINE_TUNING_PAGE_PERFORMANCE_CHART_SCRIPT = String.raw`      function PlaygroundFineTuningPerformanceChart({ job }) {
        const canvasRef = useRef(null);
        const chartRef = useRef(null);
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        const hasAfter = hasPlaygroundFineTuningAfterResult(normalizedJob);
        const labels = ["Before", "After"];
        const rawValues = [
          Math.round(normalizePlaygroundFineTuningScore(normalizedJob.beforeScore) * 100),
          Math.round(normalizePlaygroundFineTuningScore(hasAfter ? normalizedJob.afterScore : normalizedJob.beforeScore) * 100),
        ];
        const values = rawValues.map((value) => value <= 0 ? 1 : value);
        const chartSignature = JSON.stringify({ rawValues, values, hasAfter });

        useEffect(() => () => {
          if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
          }
        }, []);

        useEffect(() => {
          const canvas = canvasRef.current;
          if (!canvas || typeof Chart !== "function") {
            if (chartRef.current) {
              chartRef.current.destroy();
              chartRef.current = null;
            }
            return undefined;
          }
          const makeHorizontalGradient = (context, stops, fallback) => {
            const chart = context?.chart;
            const chartArea = chart?.chartArea;
            const ctx = chart?.ctx;
            if (!ctx || !chartArea) return fallback;
            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
            return gradient;
          };
          const hoverGuidePlugin = {
            id: "fineTuningPerformanceHoverGuide",
            afterDatasetsDraw: (chartInstance) => {
              const activeElements = chartInstance?.tooltip?.getActiveElements?.() || [];
              if (!activeElements.length) return;
              const activeElement = activeElements[0]?.element;
              const chartArea = chartInstance.chartArea;
              const ctx = chartInstance.ctx;
              if (!ctx || !chartArea || !activeElement) return;
              ctx.save();
              ctx.setLineDash([4, 4]);
              ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(chartArea.left, activeElement.y);
              ctx.lineTo(chartArea.right, activeElement.y);
              ctx.stroke();
              ctx.restore();
            },
          };
          const chartData = {
            labels,
            datasets: [
              {
                id: "performance",
                type: "bar",
                label: "Performance",
                data: values,
                backgroundColor: (context) => {
                  const index = context?.dataIndex || 0;
                  return makeHorizontalGradient(context, index === 0
                    ? [
                        [0, "rgba(126, 255, 255, 0.72)"],
                        [1, "rgba(91, 103, 230, 0.46)"],
                      ]
                    : [
                        [0, "rgba(159, 246, 206, 0.84)"],
                        [1, "rgba(84, 229, 166, 0.42)"],
                      ],
                    index === 0 ? "rgba(126, 255, 255, 0.58)" : "rgba(159, 246, 206, 0.68)");
                },
                borderWidth: 0,
                borderRadius: 4,
                barPercentage: 0.56,
                categoryPercentage: 0.66,
                maxBarThickness: 24,
              },
            ],
          };
          const chartOptions = {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            normalized: true,
            interaction: { intersect: false, mode: "nearest" },
            layout: { padding: { top: 12, right: 4, bottom: 0, left: 0 } },
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: true,
                backgroundColor: "rgba(8, 8, 8, 0.96)",
                borderColor: "rgba(255, 255, 255, 0.14)",
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                titleColor: "rgba(255, 255, 255, 0.94)",
                bodyColor: "rgba(255, 255, 255, 0.78)",
                padding: 10,
                callbacks: {
                  label: (context) => {
                    const value = Math.max(0, Number(rawValues[context.dataIndex] || 0));
                    return String(context.label || "Performance") + ": " + Math.round(value) + "%";
                  },
                },
              },
            },
            scales: {
              x: {
                type: "linear",
                min: 0,
                max: 100,
                ticks: {
                  display: true,
                  maxTicksLimit: 4,
                  color: "rgba(255, 255, 255, 0.34)",
                  padding: 8,
                  font: { size: 11, weight: "400", family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" },
                  callback: (value) => String(Math.round(Number(value) || 0)) + "%",
                },
                grid: { color: "rgba(255, 255, 255, 0.07)", drawTicks: false },
                border: { display: false },
              },
              y: {
                type: "category",
                bounds: "data",
                offset: true,
                grid: { display: false, drawBorder: false },
                border: { display: false },
                ticks: {
                  color: "rgba(255, 255, 255, 0.58)",
                  font: { size: 11, weight: "500", family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" },
                  padding: 8,
                },
              },
            },
          };
          if (chartRef.current) {
            chartRef.current.data = chartData;
            chartRef.current.options = chartOptions;
            chartRef.current.update("none");
            return undefined;
          }
          chartRef.current = new Chart(canvas, {
            type: "bar",
            data: chartData,
            options: chartOptions,
            plugins: [hoverGuidePlugin],
          });
          return undefined;
        }, [chartSignature]);

        return React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame playground-fine-tuning-score-chart" },
          React.createElement("canvas", {
            ref: canvasRef,
            className: "playground-project-overview-progress-combo-canvas playground-evaluations-progress-combo-canvas playground-fine-tuning-progress-combo-canvas",
            role: "img",
            "aria-label": "Fine-tuning before and after evaluation scores",
          })
        );
      }

`;


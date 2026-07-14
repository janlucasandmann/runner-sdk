export const EVALUATIONS_PAGE_CONTROLLER_CHARTS_SCRIPT = String.raw`        function drawPlaygroundEvaluationCaseRunRing(canvas) {
          if (!canvas) return;
          if (typeof drawPlaygroundPermissionMiniRingIcon === "function") {
            drawPlaygroundPermissionMiniRingIcon(canvas, "ring_2", 100);
            return;
          }
          const rect = canvas.getBoundingClientRect();
          const width = Math.max(1, Math.round(rect.width || 24));
          const height = Math.max(1, Math.round(rect.height || 24));
          const dpr = Math.max(1, (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1);
          const targetWidth = Math.round(width * dpr);
          const targetHeight = Math.round(height * dpr);
          if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
          }
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);
          const size = Math.min(width, height);
          const centerX = width / 2;
          const centerY = height / 2;
          const lineWidth = Math.max(1, size * (1 / 24));
          const padding = Math.max(2, size * (2.9 / 24));
          const radius = Math.max(1, size / 2 - lineWidth / 2 - padding);
          const startAngle = -Math.PI / 2 - 0.18;
          const makeGradient = (alpha) => {
            const gradient = typeof ctx.createConicGradient === "function"
              ? ctx.createConicGradient(startAngle, centerX, centerY)
              : ctx.createLinearGradient(width / 2, 0, width / 2, height);
            gradient.addColorStop(0, "rgba(7, 61, 188, " + alpha + ")");
            gradient.addColorStop(0.72, "rgba(78, 162, 255, " + alpha + ")");
            gradient.addColorStop(0.985, "rgba(7, 61, 188, " + alpha + ")");
            gradient.addColorStop(1, "rgba(7, 61, 188, " + alpha + ")");
            return gradient;
          };
          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "butt";
          ctx.strokeStyle = makeGradient(0.12);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "butt";
          ctx.strokeStyle = makeGradient(1);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        function PlaygroundEvaluationCaseRunRing({ runCount } = {}) {
          const canvasRef = useRef(null);
          const normalizedRunCount = normalizePlaygroundEvaluationCaseRunCount(runCount);
          const iconColor = typeof getPlaygroundPermissionRingIconColor === "function"
            ? getPlaygroundPermissionRingIconColor("ring_2", 1)
            : "rgba(78, 162, 255, 1)";

          useEffect(() => {
            const redraw = () => drawPlaygroundEvaluationCaseRunRing(canvasRef.current);
            redraw();
            if (typeof window === "undefined") return undefined;
            window.addEventListener("resize", redraw);
            return () => window.removeEventListener("resize", redraw);
          }, [normalizedRunCount]);

          return React.createElement("span", {
              className: "playground-permission-mini-ring-icon playground-evaluations-case-run-ring is-ring-2",
              role: "img",
              "aria-label": String(normalizedRunCount) + " " + (normalizedRunCount === 1 ? "run" : "runs"),
              style: { "--permission-mini-ring-icon-color": iconColor },
            },
            React.createElement("canvas", {
              ref: canvasRef,
              className: "playground-permission-mini-ring-canvas",
            }),
            React.createElement("span", { className: "playground-evaluations-case-run-ring-value" }, String(normalizedRunCount))
          );
        }

        function PlaygroundEvaluationPerformanceChart({ runs, run }) {
          const canvasRef = useRef(null);
          const chartRef = useRef(null);
          const normalizedRun = run ? normalizePlaygroundEvaluationRun(run) : null;
          const normalizedRuns = normalizedRun
            ? []
            : (Array.isArray(runs) ? runs : [])
                .map((item, index) => normalizePlaygroundEvaluationRun(item, index))
                .slice(-12);
          const runCases = normalizedRun ? normalizedRun.cases : [];
          const labels = normalizedRun
            ? runCases.map((_caseItem, index) => "Case " + (index + 1))
            : normalizedRuns.map((item, index) => String(item.label || ("Run " + (index + 1))));
          const scoreValues = normalizedRun
            ? runCases.map((caseItem) => Math.round(Math.max(0, Math.min(1, Number(caseItem.score || 0))) * 100))
            : normalizedRuns.map((item) => Math.round(Math.max(0, Math.min(1, Number(item.averageScore || 0))) * 100));
          const costValues = normalizedRun
            ? runCases.map((caseItem) => normalizePlaygroundEvaluationUsdCost(caseItem.costUsd))
            : normalizedRuns.map((item) => normalizePlaygroundEvaluationUsdCost(item.costUsd));
          const scoreLineLabel = normalizedRun ? "Score" : "Avg Score";
          const costBarLabel = normalizedRun ? "Cost / Case" : "Cost / Run";
          const chartSignature = JSON.stringify({ mode: normalizedRun ? "run" : "set", labels, scoreValues, costValues });

          useEffect(() => () => {
            if (chartRef.current) {
              chartRef.current.destroy();
              chartRef.current = null;
            }
          }, []);

          useEffect(() => {
            const canvas = canvasRef.current;
            const hasData = labels.length > 0;
            if (!canvas || typeof Chart !== "function" || !hasData) {
              if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
              }
              return undefined;
            }
            const makeVerticalGradient = (context, stops, fallback) => {
              const chart = context?.chart;
              const chartArea = chart?.chartArea;
              const ctx = chart?.ctx;
              if (!ctx || !chartArea) {
                return fallback;
              }
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
              return gradient;
            };
            const hoverGuidePlugin = {
              id: "evaluationPerformanceHoverGuide",
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
                ctx.moveTo(activeElement.x, chartArea.top + 8);
                ctx.lineTo(activeElement.x, chartArea.bottom);
                ctx.stroke();
                ctx.restore();
              },
            };
            const chartData = {
              labels,
              datasets: [
                {
                  id: "cost",
                  type: "bar",
                  label: costBarLabel,
                  data: costValues,
                  yAxisID: "cost",
                  backgroundColor: (context) => makeVerticalGradient(context, [
                    [0, "rgba(159, 246, 206, 0.82)"],
                    [1, "rgba(42, 165, 123, 0.56)"],
                  ], "rgba(92, 212, 163, 0.68)"),
                  borderWidth: 0,
                  borderRadius: 2,
                  barPercentage: 0.72,
                  categoryPercentage: 0.86,
                  maxBarThickness: 10,
                  order: 4,
                },
                {
                  id: "score",
                  type: "line",
                  label: scoreLineLabel,
                  data: scoreValues,
                  yAxisID: "score",
                  borderColor: "#7EFFFF",
                  backgroundColor: "rgba(126, 255, 255, 0.08)",
                  borderWidth: 1.5,
                  fill: false,
                  pointBackgroundColor: "#7EFFFF",
                  pointBorderColor: "#050505",
                  pointBorderWidth: 2,
                  pointRadius: (context) => context.dataIndex === scoreValues.length - 1 ? 5 : 0,
                  pointHoverRadius: 5,
                  tension: 0.28,
                  order: 2,
                },
              ],
            };
            const chartOptions = {
              animation: false,
              responsive: true,
              maintainAspectRatio: false,
              normalized: true,
              interaction: { intersect: false, mode: "index" },
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
                      const datasetId = context.dataset?.id || "";
                      const value = Math.max(0, Number(context.parsed?.y || 0));
                      if (datasetId === "score") return scoreLineLabel + ": " + Math.round(value) + "%";
                      if (datasetId === "cost") return costBarLabel + ": " + formatPlaygroundEvaluationCostUsd(value);
                      return String(context.dataset?.label || "Value") + ": " + value;
                    },
                  },
                },
              },
              scales: {
                x: {
                  type: "category",
                  bounds: "data",
                  offset: false,
                  grid: { display: false, offset: false, drawBorder: false },
                  border: { display: false },
                  ticks: {
                    display: false,
                    autoSkip: false,
                  },
                },
                score: {
                  display: true,
                  type: "linear",
                  position: "left",
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
                  grid: { display: false, drawTicks: false },
                  border: { display: false },
                },
                cost: {
                  display: false,
                  type: "linear",
                  position: "right",
                  min: 0,
                  suggestedMax: Math.max(0.01, ...costValues) * 1.2,
                  ticks: { display: false },
                  grid: { display: false, drawTicks: false },
                  border: { display: false },
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

          if (!labels.length) {
            return React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame" },
              React.createElement("div", { className: "playground-settings-usage-chart-empty" }, normalizedRun ? "No evaluation cases yet" : "No evaluation runs yet")
            );
          }
          return React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame" },
            React.createElement("canvas", {
              ref: canvasRef,
              className: "playground-project-overview-progress-combo-canvas playground-evaluations-progress-combo-canvas",
              role: "img",
              "aria-label": normalizedRun ? "Evaluation case scores and costs" : "Evaluation average scores and costs per run",
            })
          );
        }

`;


export const PROJECT_OVERVIEW_METRICS_FILES_FRAGMENT = String.raw`
        function formatProjectOverviewCt(value) {
          const numericValue = Math.max(0, Number(value || 0));
          const dollars = Number.isFinite(numericValue) ? numericValue / 100 : 0;
          const smallValue = dollars > 0 && dollars < 0.01;
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: smallValue ? 4 : 2,
            maximumFractionDigits: smallValue ? 4 : 2,
          }).format(dollars);
        }

        function formatProjectOverviewAxisCt(value) {
          return formatProjectOverviewCt(value);
        }

        function formatProjectOverviewInteger(value) {
          const numericValue = Math.max(0, Number(value || 0));
          if (!Number.isFinite(numericValue) || numericValue <= 0) {
            return "0";
          }
          return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(numericValue));
        }

        function getProjectOverviewOutcomeReleaseIds(outcome) {
          if (typeof normalizePlaygroundStrategyOutcomeReleaseIds === "function") {
            return normalizePlaygroundStrategyOutcomeReleaseIds(outcome);
          }
          const next = [];
          const seen = new Set();
          const addReleaseId = (releaseId) => {
            const normalizedReleaseId = String(releaseId || "").trim();
            if (!normalizedReleaseId || seen.has(normalizedReleaseId)) {
              return;
            }
            seen.add(normalizedReleaseId);
            next.push(normalizedReleaseId);
          };
          const addReleaseIds = (releaseIds) => {
            if (Array.isArray(releaseIds)) {
              releaseIds.forEach(addReleaseId);
              return;
            }
            if (typeof releaseIds === "string") {
              releaseIds
                .replaceAll(String.fromCharCode(13), "")
                .split(new RegExp("[" + String.fromCharCode(10) + ",]+"))
                .forEach(addReleaseId);
            }
          };
          if (outcome && typeof outcome === "object" && !Array.isArray(outcome)) {
            addReleaseIds(outcome.releaseIds || outcome.release_ids || outcome.milestoneIds || outcome.milestone_ids);
            addReleaseId(outcome.releaseId || outcome.release_id || outcome.milestoneId || outcome.milestone_id);
          }
          return next;
        }

        function getProjectOverviewLocalDayKey(dateLike) {
          const date = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
          if (Number.isNaN(date.getTime())) {
            return "";
          }
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return year + "-" + month + "-" + day;
        }

        function getProjectOverviewLocalWeekStartKey(dateLike) {
          const date = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
          if (Number.isNaN(date.getTime())) {
            return "";
          }
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() - date.getDay());
          return getProjectOverviewLocalDayKey(date);
        }

        function getProjectOverviewLocalMonthStartKey(dateLike) {
          const date = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
          if (Number.isNaN(date.getTime())) {
            return "";
          }
          date.setHours(0, 0, 0, 0);
          date.setDate(1);
          return getProjectOverviewLocalDayKey(date);
        }

        function getProjectOverviewOutcomeProgressRingValue(value) {
          const numericValue = Number(value || 0);
          if (!Number.isFinite(numericValue)) {
            return 0;
          }
          return Math.max(0, Math.min(100, numericValue));
        }

        function drawProjectOverviewOutcomeProgressRing(canvas, progressValue, ringId = "ring_1") {
          if (!canvas) {
            return;
          }
          const fallbackSize = typeof PLAYGROUND_PERMISSION_MINI_RING_ICON_SIZE === "number"
            ? PLAYGROUND_PERMISSION_MINI_RING_ICON_SIZE
            : 24;
          const fallbackLineWidthRatio = typeof PLAYGROUND_PERMISSION_MINI_RING_ICON_LINE_WIDTH === "number"
            ? PLAYGROUND_PERMISSION_MINI_RING_ICON_LINE_WIDTH / fallbackSize
            : 1 / 24;
          const fallbackPaddingRatio = typeof PLAYGROUND_PERMISSION_MINI_RING_ICON_PADDING === "number"
            ? PLAYGROUND_PERMISSION_MINI_RING_ICON_PADDING / fallbackSize
            : 2.9 / 24;
          const startAngle = typeof PLAYGROUND_PERMISSION_RING_CHART_START_ANGLE === "number"
            ? PLAYGROUND_PERMISSION_RING_CHART_START_ANGLE
            : -Math.PI / 2 - 0.18;
          const fullCapStartOffset = typeof PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_START_OFFSET === "number"
            ? PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_START_OFFSET
            : -0.18;
          const fullCapEndOffset = typeof PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_END_OFFSET === "number"
            ? PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_END_OFFSET
            : 0.32;
          const fullCapClipOffset = typeof PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_CLIP_OFFSET === "number"
            ? PLAYGROUND_PERMISSION_RING_CHART_FULL_CAP_CLIP_OFFSET
            : 0.14;
          const normalizedRingId = typeof normalizePlaygroundPermissionRingId === "function"
            ? normalizePlaygroundPermissionRingId(ringId, "ring_1")
            : "ring_1";
          const rawProgress = getProjectOverviewOutcomeProgressRingValue(progressValue) / 100;
          const progress = rawProgress > 0 ? rawProgress : 0.05;
          const rect = canvas.getBoundingClientRect();
          const width = Math.max(1, Math.round(rect.width || fallbackSize));
          const height = Math.max(1, Math.round(rect.height || fallbackSize));
          const dpr = Math.max(1, window.devicePixelRatio || 1);
          const targetWidth = Math.round(width * dpr);
          const targetHeight = Math.round(height * dpr);
          if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
          }

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return;
          }

          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);

          const size = Math.min(width, height);
          const centerX = width / 2;
          const centerY = height / 2;
          const lineWidth = Math.max(1, size * fallbackLineWidthRatio);
          const padding = Math.max(2, size * fallbackPaddingRatio);
          const radius = Math.max(1, size / 2 - lineWidth / 2 - padding);
          const miniRingGradients = typeof PLAYGROUND_PERMISSION_MINI_RING_ICON_GRADIENTS === "object"
            ? PLAYGROUND_PERMISSION_MINI_RING_ICON_GRADIENTS
            : undefined;
          const makeGradient = (alpha, gradientProgress = Math.max(progress, 0.001)) => {
            if (typeof createPlaygroundPermissionRingGradient === "function") {
              return createPlaygroundPermissionRingGradient(ctx, width, height, normalizedRingId, alpha, gradientProgress, miniRingGradients);
            }
            const gradient = ctx.createLinearGradient(width / 2, 0, width / 2, height);
            gradient.addColorStop(0, "rgba(31, 130, 72, " + alpha + ")");
            gradient.addColorStop(1, "rgba(29, 225, 163, " + alpha + ")");
            return gradient;
          };
          const getStartColor = (alpha = 1) => typeof getPlaygroundPermissionRingStartColor === "function"
            ? getPlaygroundPermissionRingStartColor(normalizedRingId, alpha)
            : "rgba(31, 130, 72, " + alpha + ")";
          const getEndColor = (alpha = 1) => typeof getPlaygroundPermissionRingEndColor === "function"
            ? getPlaygroundPermissionRingEndColor(normalizedRingId, alpha)
            : "rgba(29, 225, 163, " + alpha + ")";

          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = makeGradient(0.1, 1);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          if (progress <= 0) {
            return;
          }

          const endAngle = startAngle + Math.PI * 2 * Math.min(progress, 1);

          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = makeGradient(1, progress);
          ctx.lineCap = "butt";
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.stroke();
          ctx.restore();

          if (progress < 0.999) {
            const startCapX = centerX + Math.cos(startAngle) * radius;
            const startCapY = centerY + Math.sin(startAngle) * radius;
            const endCapX = centerX + Math.cos(endAngle) * radius;
            const endCapY = centerY + Math.sin(endAngle) * radius;

            ctx.save();
            ctx.fillStyle = getStartColor(1);
            ctx.beginPath();
            ctx.arc(startCapX, startCapY, lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.fillStyle = getEndColor(1);
            ctx.beginPath();
            ctx.arc(endCapX, endCapY, lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
          }

          const fullCapStartAngle = startAngle + fullCapStartOffset;
          const fullCapEndAngle = startAngle + fullCapEndOffset;
          const capClipAngle = startAngle + fullCapClipOffset;
          const capClipX = centerX + Math.cos(capClipAngle) * radius;

          ctx.save();
          ctx.beginPath();
          ctx.rect(capClipX + lineWidth * 0.08, 0, width - capClipX, height);
          ctx.clip();
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "round";
          ctx.strokeStyle = getEndColor(1);
          ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
          ctx.shadowBlur = Math.max(3, lineWidth * 0.8);
          ctx.shadowOffsetX = Math.max(1, lineWidth * 0.24);
          ctx.shadowOffsetY = Math.max(0.5, lineWidth * 0.14);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, fullCapStartAngle, fullCapEndAngle);
          ctx.stroke();
          ctx.restore();

          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "round";
          ctx.strokeStyle = getEndColor(1);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, fullCapStartAngle, fullCapEndAngle);
          ctx.stroke();
          ctx.restore();
        }

        function PlaygroundProjectOverviewOutcomeProgressRing({ progress, label } = {}) {
          const normalizedProgress = getProjectOverviewOutcomeProgressRingValue(progress);
          const canvasRef = useRef(null);
          const iconColor = typeof getPlaygroundPermissionRingIconColor === "function"
            ? getPlaygroundPermissionRingIconColor("ring_1", 1)
            : "rgba(29, 225, 163, 1)";

          useEffect(() => {
            const redraw = () => drawProjectOverviewOutcomeProgressRing(canvasRef.current, normalizedProgress, "ring_1");
            redraw();
            window.addEventListener("resize", redraw);
            return () => window.removeEventListener("resize", redraw);
          }, [normalizedProgress]);

          return React.createElement("span", {
              className: "playground-project-overview-outcome-progress-ring"
                + (normalizedProgress >= 100 ? " is-complete" : normalizedProgress > 0 ? " is-active" : " is-empty"),
              role: "img",
              "aria-label": label || ("Outcome progress " + Math.round(normalizedProgress) + "%"),
              style: {
                "--permission-mini-ring-icon-color": iconColor,
              },
            },
            React.createElement("canvas", {
              ref: canvasRef,
              className: "playground-project-overview-outcome-progress-ring-canvas",
            }),
            React.createElement(Award, { strokeWidth: 2.35 })
          );
        }

        function PlaygroundProjectOverviewResponsiveSvg({ frameClassName, frameHeight, svgHeight, fallbackWidth = 960, ariaLabel, renderOverlay, children }) {
          const frameRef = useRef(null);
          const [measuredWidth, setMeasuredWidth] = useState(0);

          useLayoutEffect(() => {
            const node = frameRef.current;
            if (!node) {
              return undefined;
            }

            const updateWidth = () => {
              const nextWidth = Math.max(1, Math.round(node.clientWidth || fallbackWidth));
              setMeasuredWidth((current) => current === nextWidth ? current : nextWidth);
            };

            updateWidth();

            if (typeof ResizeObserver === "undefined") {
              window.addEventListener("resize", updateWidth);
              return () => window.removeEventListener("resize", updateWidth);
            }

            const observer = new ResizeObserver(() => updateWidth());
            observer.observe(node);
            return () => observer.disconnect();
          }, [fallbackWidth]);

          const resolvedSvgWidth = Math.max(1, Math.round(measuredWidth || fallbackWidth));
          const resolvedSvgHeight = Math.max(1, Math.round(svgHeight || frameHeight || 252));

          return React.createElement("div", {
              ref: frameRef,
              className: frameClassName,
              style: frameHeight ? { height: String(frameHeight) + "px" } : undefined,
            },
            typeof renderOverlay === "function"
              ? renderOverlay({
                  svgWidth: resolvedSvgWidth,
                  svgHeight: resolvedSvgHeight,
                })
              : renderOverlay || null,
            React.createElement("svg", {
              className: "playground-project-overview-chart-svg",
              width: resolvedSvgWidth,
              height: resolvedSvgHeight,
              role: "img",
              "aria-label": ariaLabel || "Project overview chart",
            },
              typeof children === "function"
                ? children({
                    svgWidth: resolvedSvgWidth,
                    svgHeight: resolvedSvgHeight,
                  })
                : children
            )
          );
        }

        function renderProjectOverviewMultiStackedChart(config) {
          const labels = Array.isArray(config?.labels) ? config.labels : [];
          const series = Array.isArray(config?.series)
            ? config.series.filter((entry) => entry && Array.isArray(entry.values))
            : [];
          if (!labels.length || !series.length) {
            return React.createElement("div", { className: "playground-project-overview-chart-empty" }, config?.emptyText || "No usage data in this period");
          }

          const frameHeight = 252;
          const baseSvgHeight = 252;
          const marginTop = 12;
          const marginRight = 14;
          const marginBottom = 38;
          const marginLeft = 58;
          const totals = labels.map((_, index) =>
            series.reduce((sum, entry) => sum + Math.max(0, Number(entry.values[index] || 0)), 0)
          );
          if (!totals.some((value) => value > 0)) {
            return config?.emptyContent || React.createElement("div", { className: "playground-project-overview-chart-empty" }, config?.emptyText || "No usage data in this period");
          }
          const yMax = Math.max(1, Number(config?.yMax || Math.max(...totals, 1)));
          const gridLineCount = 4;
          const tickFormatter = typeof config?.tickFormatter === "function"
            ? config.tickFormatter
            : (value) => String(Math.round(value));
          const labelStep = Math.max(1, Math.ceil(labels.length / 7));
          const visibleLabelIndexes = (() => {
            const next = [];
            for (let index = 0; index < labels.length; index += labelStep) {
              next.push(index);
            }
            const lastIndex = labels.length - 1;
            if (lastIndex >= 0 && !next.includes(lastIndex)) {
              if (next.length > 0 && lastIndex - next[next.length - 1] < 2) {
                next[next.length - 1] = lastIndex;
              } else {
                next.push(lastIndex);
              }
            }
            return new Set(next);
          })();

          return React.createElement(PlaygroundProjectOverviewResponsiveSvg, {
              frameClassName: "playground-project-overview-chart-shell",
              frameHeight,
              svgHeight: baseSvgHeight,
              fallbackWidth: 1200,
              ariaLabel: config?.ariaLabel || "Project cost chart",
            }, ({ svgWidth, svgHeight }) => {
              const plotWidth = svgWidth - marginLeft - marginRight;
              const plotHeight = svgHeight - marginTop - marginBottom;
              const slotWidth = plotWidth / Math.max(labels.length, 1);
              const barWidth = Math.min(24, Math.max(8, slotWidth * 0.56));
              const baselineY = marginTop + plotHeight;

              return React.createElement(React.Fragment, null,
              Array.from({ length: gridLineCount + 1 }).map((_, index) => {
                const y = marginTop + (plotHeight / gridLineCount) * index;
                const tickValue = yMax - (yMax / gridLineCount) * index;
                return React.createElement(React.Fragment, { key: "grid:" + index },
                  React.createElement("line", {
                    x1: marginLeft,
                    y1: y,
                    x2: svgWidth - marginRight,
                    y2: y,
                    stroke: "rgba(255,255,255,0.10)",
                    strokeWidth: "1",
                  }),
                  React.createElement("text", {
                    x: 0,
                    y,
                    textAnchor: "start",
                    dominantBaseline: "middle",
                    fill: "rgba(255,255,255,0.4)",
                    fontSize: "10",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "400",
                  }, tickFormatter(tickValue))
                );
              }),
              labels.map((label, index) => {
                const x = marginLeft + slotWidth * index + (slotWidth - barWidth) / 2;
                const isFirstLabel = index === 0;
                const isLastLabel = index === labels.length - 1;
                const labelX = isFirstLabel
                  ? marginLeft
                  : isLastLabel
                    ? svgWidth - marginRight
                    : marginLeft + slotWidth * index + slotWidth / 2;
                let stackOffsetY = baselineY;
                return React.createElement(React.Fragment, { key: "stack:" + index },
                  series.map((entry, seriesIndex) => {
                    const rawValue = Math.max(0, Number(entry.values[index] || 0));
                    if (rawValue <= 0) {
                      return null;
                    }
                    const segmentHeight = (rawValue / yMax) * plotHeight;
                    stackOffsetY -= segmentHeight;
                    return React.createElement("rect", {
                      key: "segment:" + seriesIndex,
                      x,
                      y: stackOffsetY,
                      width: barWidth,
                      height: Math.max(segmentHeight, 1),
                      rx: "3",
                      fill: entry.color || "rgba(255,255,255,0.8)",
                    });
                  }),
                  visibleLabelIndexes.has(index)
                    ? React.createElement("text", {
                        x: labelX,
                        y: svgHeight - 8,
                        textAnchor: isFirstLabel ? "start" : (isLastLabel ? "end" : "middle"),
                        fill: "rgba(255,255,255,0.4)",
                        fontSize: "10",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "400",
                      }, label)
                    : null
                );
              })
              );
            }
          );
        }

        function renderProjectOverviewCostEmptyState() {
          return React.createElement("div", {
            className: "playground-project-overview-chart-empty playground-auth-users-empty-state playground-configure-usage-empty-state",
          },
            React.createElement("img", {
              className: "playground-auth-users-empty-state-image",
              src: "/img/empty-state/no-agent-usage.avif",
              alt: "",
              "aria-hidden": "true",
              draggable: "false",
            }),
            React.createElement("div", { className: "playground-auth-users-empty-state-title" }, "No Project Cost yet"),
            React.createElement("div", { className: "playground-auth-users-empty-state-copy" },
              "Project costs will appear here once agents, computers, or connected resources consume credits."
            )
          );
        }

        function renderProjectOverviewActivityMap(config) {
          const cells = Array.isArray(config?.cells) ? config.cells : [];
          const rowCount = Math.max(1, Number(config?.rowCount || 7));
          if (!cells.length) {
            return React.createElement("div", { className: "playground-project-overview-chart-empty" }, config?.emptyText || "No project activity yet");
          }

          const columns = [];
          for (let index = 0; index < cells.length; index += rowCount) {
            columns.push(cells.slice(index, index + rowCount));
          }
          const maxCount = Math.max(0, ...cells.map((cell) => Math.max(0, Number(cell?.count || 0))));

          function resolveLevel(count) {
            const value = Math.max(0, Number(count || 0));
            if (value <= 0 || maxCount <= 0) {
              return 0;
            }
            const ratio = value / maxCount;
            if (ratio >= 0.8) return 4;
            if (ratio >= 0.55) return 3;
            if (ratio >= 0.25) return 2;
            return 1;
          }

          function resolveFill(count) {
            const level = resolveLevel(count);
            if (level === 4) return "rgba(77, 163, 255, 0.9)";
            if (level === 3) return "rgba(77, 163, 255, 0.68)";
            if (level === 2) return "rgba(77, 163, 255, 0.44)";
            if (level === 1) return "rgba(77, 163, 255, 0.24)";
            return "rgba(255, 255, 255, 0.05)";
          }

          const frameHeight = 252;
          const labelBandHeight = 26;
          const outerPaddingX = 0;
          const outerPaddingTop = 0;
          const outerPaddingBottom = 4;
          const gridGapY = 8;
          const labelColumnIndexes = (() => {
            const next = [];
            let previousLabel = "";
            columns.forEach((column, columnIndex) => {
              const label = String(column?.[0]?.label || "").trim();
              if (label && label !== previousLabel) {
                next.push(columnIndex);
                previousLabel = label;
              }
            });
            if (columns.length > 0 && !next.includes(0)) {
              next.unshift(0);
            }
            if (columns.length > 1 && !next.includes(columns.length - 1)) {
              next.push(columns.length - 1);
            }
            return new Set(next);
          })();

          function computeActivityMapLayout(svgWidth, svgHeight) {
            const availableWidth = Math.max(1, svgWidth - (outerPaddingX * 2));
            const gridTop = outerPaddingTop;
            const gridHeight = Math.max(1, svgHeight - gridTop - labelBandHeight - outerPaddingBottom);
            const columnCount = Math.max(1, columns.length);
            const horizontalSize = columnCount > 0 ? availableWidth / columnCount : availableWidth;
            const verticalSize = Math.max(1, (gridHeight - (gridGapY * Math.max(0, rowCount - 1))) / rowCount);
            const cellSize = Math.max(4, Math.min(horizontalSize, verticalSize) - 3);
            const cellRadius = cellSize / 2;
            const stepX = columnCount > 1 ? Math.max(cellSize, (availableWidth - cellSize) / (columnCount - 1)) : 0;
            const verticalContentHeight = (cellSize * rowCount) + (gridGapY * Math.max(0, rowCount - 1));
            const gridOffsetY = gridTop + Math.max(0, (gridHeight - verticalContentHeight) / 2);
            const labelY = gridTop + gridHeight + 8;
            return {
              availableWidth,
              gridTop,
              gridHeight,
              columnCount,
              cellSize,
              cellRadius,
              stepX,
              gridOffsetY,
              labelY,
            };
          }

          return React.createElement("div", { className: "playground-project-overview-activity-map" },
            React.createElement(PlaygroundProjectOverviewResponsiveSvg, {
              frameClassName: "playground-project-overview-chart-shell",
              frameHeight,
              svgHeight: frameHeight,
              fallbackWidth: 1200,
              ariaLabel: config?.ariaLabel || "Project activity map",
            }, ({ svgWidth, svgHeight }) => {
              const {
                availableWidth,
                gridHeight,
                columnCount,
                cellRadius,
                stepX,
                gridOffsetY,
                labelY,
              } = computeActivityMapLayout(svgWidth, svgHeight);
              const cellDiameter = cellRadius * 2;

              return React.createElement(React.Fragment, null,
                columns.map((column, columnIndex) => {
                  const firstCell = column[0] || {};
                  const rawLabelText = labelColumnIndexes.has(columnIndex) ? String(firstCell.label || "") : "";
                  const previousColumn = columnIndex > 0 ? columns[columnIndex - 1] || null : null;
                  const previousLabelText = String(previousColumn?.[0]?.label || "").trim();
                  const labelText = rawLabelText && rawLabelText === previousLabelText ? "" : rawLabelText;
                  const cellCenterX = columnCount > 1
                    ? outerPaddingX + cellRadius + (stepX * columnIndex)
                    : outerPaddingX + (availableWidth / 2);
                  const isFirstLabel = columnIndex === 0;
                  const isLastLabel = columnIndex === columnCount - 1;
                  const labelX = isFirstLabel
                    ? 0
                    : isLastLabel
                      ? svgWidth
                      : cellCenterX;
                  return React.createElement(React.Fragment, { key: "activity-column:" + columnIndex },
                    labelText
                      ? React.createElement("text", {
                          x: labelX,
                          y: labelY,
                          textAnchor: isFirstLabel ? "start" : (isLastLabel ? "end" : "middle"),
                          dominantBaseline: "hanging",
                          fill: "rgba(255,255,255,0.42)",
                          fontSize: "10",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: "400",
                        }, labelText)
                      : null,
                    column.map((cell, rowIndex) =>
                      React.createElement("circle", {
                        key: "cell:" + columnIndex + ":" + rowIndex,
                        cx: cellCenterX,
                        cy: gridOffsetY + cellRadius + (rowIndex * (cellDiameter + gridGapY)),
                        r: cellRadius,
                        fill: resolveFill(cell?.count || 0),
                      })
                    )
                  );
                })
              );
            })
          );
        }

        function renderProjectOverviewDonutChart(config) {
          const items = Array.isArray(config?.items) ? config.items.filter(Boolean) : [];
          const totalValue = Math.max(0, items.reduce((sum, item) => sum + Math.max(0, Number(item.value || 0)), 0));
          const hasData = items.length > 0 && totalValue > 0;
          const valueFormatter = typeof config?.valueFormatter === "function"
            ? config.valueFormatter
            : (value) => formatProjectOverviewCt(value);

          function renderArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
            const startOuterX = cx + outerRadius * Math.cos(startAngle);
            const startOuterY = cy + outerRadius * Math.sin(startAngle);
            const endOuterX = cx + outerRadius * Math.cos(endAngle);
            const endOuterY = cy + outerRadius * Math.sin(endAngle);
            const startInnerX = cx + innerRadius * Math.cos(endAngle);
            const startInnerY = cy + innerRadius * Math.sin(endAngle);
            const endInnerX = cx + innerRadius * Math.cos(startAngle);
            const endInnerY = cy + innerRadius * Math.sin(startAngle);
            const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
            return [
              "M", startOuterX, startOuterY,
              "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuterX, endOuterY,
              "L", startInnerX, startInnerY,
              "A", innerRadius, innerRadius, 0, largeArcFlag, 0, endInnerX, endInnerY,
              "Z",
            ].join(" ");
          }

          const svgWidth = 280;
          const svgHeight = 264;
          const cx = svgWidth / 2;
          const cy = svgHeight / 2;
          const outerRadius = Math.min(svgWidth, svgHeight) * 0.38;
          const innerRadius = outerRadius * 0.58;
          const trackRadius = (outerRadius + innerRadius) / 2;
          const trackStrokeWidth = outerRadius - innerRadius;
          let currentAngle = -Math.PI / 2;

          return React.createElement("div", { className: "playground-project-overview-donut-layout" },
            React.createElement("div", { className: "playground-project-overview-chart-shell" },
              React.createElement("svg", {
                  className: "playground-project-overview-chart-svg",
                  viewBox: "0 0 " + svgWidth + " " + svgHeight,
                  role: "img",
                  "aria-label": config?.ariaLabel || "Project tickets by status",
                },
                React.createElement("circle", {
                  cx,
                  cy,
                  r: trackRadius,
                  fill: "none",
                  stroke: "rgba(255, 255, 255, 0.10)",
                  strokeWidth: trackStrokeWidth,
                }),
                hasData
                  ? items.map((item) => {
                      const value = Math.max(0, Number(item.value || 0));
                      const sliceAngle = (value / totalValue) * Math.PI * 2;
                      const isFullCircleSlice = sliceAngle >= (Math.PI * 2) - 0.0001;
                      const path = isFullCircleSlice
                        ? null
                        : renderArcPath(cx, cy, innerRadius, outerRadius, currentAngle, currentAngle + sliceAngle);
                      currentAngle += sliceAngle;
                      return isFullCircleSlice
                        ? React.createElement("circle", {
                            key: item.id || item.label,
                            cx,
                            cy,
                            r: trackRadius,
                            fill: "none",
                            stroke: item.color,
                            strokeWidth: trackStrokeWidth,
                          })
                        : React.createElement("path", {
                            key: item.id || item.label,
                            d: path,
                            fill: item.color,
                          });
                    })
                  : null,
                React.createElement("text", {
                  x: cx,
                  y: cy - 16,
                  textAnchor: "middle",
                  className: "playground-project-overview-donut-center-label",
                }, config?.centerLabel || "Total"),
                React.createElement("text", {
                  x: cx,
                  y: cy + 6,
                  textAnchor: "middle",
                  className: "playground-project-overview-donut-center-value",
                }, config?.centerValue || String(totalValue))
              )
            ),
            items.length > 0
              ? React.createElement("div", { className: "playground-project-overview-donut-legend" },
                  items.map((item) =>
                    React.createElement("div", { key: "legend:" + (item.id || item.label), className: "playground-project-overview-donut-legend-item" },
                      React.createElement("span", {
                        className: "playground-project-overview-donut-swatch",
                        style: { background: item.color },
                      }),
                      React.createElement("div", { className: "playground-project-overview-donut-legend-copy" },
                        React.createElement("div", { className: "playground-project-overview-donut-label" }, item.label),
                        React.createElement("div", { className: "playground-project-overview-donut-value" }, valueFormatter(item.value || 0))
                      )
                    )
                  )
                )
              : null
          );
        }

        function renderProjectOverviewView() {
          if (!selectedProject) {
            return null;
          }

          const normalizedSelectedProjectId = String(selectedProjectId || selectedProject.id || "").trim();
          const projectOverviewDraft = projectDraft?.id === normalizedSelectedProjectId
            ? projectDraft
            : selectedProject;
          const projectOverviewGoal = String(projectOverviewDraft?.description || "");
          const projectThreads = Array.isArray(projectOverviewThreads) ? projectOverviewThreads : [];
          const normalizedOverviewTasks = Array.isArray(tasks)
            ? tasks.map((task) => normalizePlaygroundTaskRecord(task))
            : [];
          const normalizedOverviewTasksById = normalizedOverviewTasks.reduce((acc, task) => {
            const taskId = String(task?.id || "").trim();
            if (taskId) {
              acc[taskId] = task;
            }
            return acc;
          }, Object.create(null));
          const missionControlSummaryText = String(selectedProjectMissionControl.summary || "").trim()
            || (String(missionControlDocumentDraft || selectedProjectMissionControl.document || "").trim()
              ? "Mission Control has generated a strategy snapshot for the current project state."
              : "Run Mission Control to generate the first strategy statement and backlog recommendations for this project.");
          const hasStrategyDocument = Boolean(String(missionControlDocumentDraft || selectedProjectMissionControl.document || "").trim());
          const canUndoMissionControlDocument = Array.isArray(missionControlDocumentHistory?.past) && missionControlDocumentHistory.past.length > 0;
          const canRedoMissionControlDocument = Array.isArray(missionControlDocumentHistory?.future) && missionControlDocumentHistory.future.length > 0;
          const renderMissionControlDocumentToolbarButton = (action) =>
            React.createElement("button", {
              key: action.id,
              type: "button",
              className: "playground-tasks-detail-format-button",
              title: action.label,
              "aria-label": action.label,
              disabled: Boolean(action.disabled),
              onMouseDown: (event) => event.preventDefault(),
              onClick: action.onClick,
            }, React.createElement(action.icon, {
              width: 14,
              height: 14,
              strokeWidth: action.strokeWidth || 1.8,
            }));
          const missionControlDocumentTextFormatActions = [
            { id: "bold", label: "Bold", icon: Bold, strokeWidth: 2.7 },
            { id: "italic", label: "Italic", icon: Italic },
            { id: "underline", label: "Underline", icon: Underline },
          ];
          const missionControlDocumentListFormatActions = [
            { id: "list", label: "List", icon: List },
            { id: "ordered-list", label: "Ordered list", icon: ListOrdered },
          ];
          const missionControlDocumentInsertFormatActions = [
            { id: "code", label: "Code", icon: CodeXml },
            { id: "link", label: "Link", icon: Link2 },
          ];
          const normalizedProjectOverviewHomeTab = projectOverviewHomeTab === "rules" ? "strategy" : projectOverviewHomeTab;
          const projectOverviewSettingsMetadata = projectOverviewDraft?.metadata && typeof projectOverviewDraft.metadata === "object" && !Array.isArray(projectOverviewDraft.metadata)
            ? projectOverviewDraft.metadata
            : {};
          const selectedProjectSettingsMetadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
            ? selectedProject.metadata
            : {};
	          const projectOverviewAccessLevel = String(
	            projectOverviewDraft?.teamAccessLevel
	            || selectedProject?.teamAccessLevel
	            || projectOverviewSettingsMetadata.teamAccessLevel
	            || selectedProjectSettingsMetadata.teamAccessLevel
	            || ""
	          ).trim().toLowerCase();
          const projectOverviewSharedTeamId = String(
            projectOverviewDraft?.teamId
            || selectedProject?.teamId
            || projectOverviewSettingsMetadata.teamId
            || selectedProjectSettingsMetadata.teamId
            || ""
          ).trim();
          const projectOverviewSharedWorkspaceTeam = projectOverviewSharedTeamId && Array.isArray(workspaceTeams)
            ? workspaceTeams.find((team) => String(team?.id || "").trim() === projectOverviewSharedTeamId) || null
            : null;
          const normalizedWorkspaceTeamMembersTeamId = String(workspaceTeamMembersTeamId || "").trim();
          const projectOverviewSharedTeamMemberRows = projectOverviewSharedTeamId
            && normalizedWorkspaceTeamMembersTeamId === projectOverviewSharedTeamId
            && Array.isArray(workspaceTeamMembers)
              ? workspaceTeamMembers
              : [];
          const projectOverviewSharedTeamName = String(
            projectOverviewDraft?.teamName
            || selectedProject?.teamName
            || projectOverviewSettingsMetadata.teamName
            || selectedProjectSettingsMetadata.teamName
            || projectOverviewSharedWorkspaceTeam?.name
            || ""
          ).trim();
          const projectOverviewViewerProjectRoleId = (() => {
            const explicitRole = String(
              projectOverviewDraft?.teamRoleId
              || projectOverviewDraft?.teamRole
              || projectOverviewDraft?.projectRoleId
              || projectOverviewDraft?.projectRole
              || selectedProject?.teamRoleId
              || selectedProject?.teamRole
              || selectedProject?.projectRoleId
              || selectedProject?.projectRole
              || projectOverviewSettingsMetadata.teamRoleId
              || projectOverviewSettingsMetadata.teamRole
              || projectOverviewSettingsMetadata.projectRoleId
              || projectOverviewSettingsMetadata.projectRole
              || selectedProjectSettingsMetadata.teamRoleId
              || selectedProjectSettingsMetadata.teamRole
              || selectedProjectSettingsMetadata.projectRoleId
              || selectedProjectSettingsMetadata.projectRole
              || ""
            ).trim();
            if (explicitRole) {
              return normalizePlaygroundTeamRoleId(explicitRole, "");
            }
            const sharedTeamRole = String(
              projectOverviewSharedWorkspaceTeam?.projectRoleId
              || projectOverviewSharedWorkspaceTeam?.projectRole
              || projectOverviewSharedWorkspaceTeam?.teamRoleId
              || projectOverviewSharedWorkspaceTeam?.teamRole
              || projectOverviewSharedWorkspaceTeam?.role
              || ""
            ).trim();
            if (sharedTeamRole) {
              return normalizePlaygroundTeamRoleId(sharedTeamRole, "");
            }
            if (
              projectOverviewAccessLevel === "edit"
              || projectOverviewAccessLevel === "write"
              || projectOverviewAccessLevel === "contributor"
              || projectOverviewAccessLevel === "develop"
              || projectOverviewAccessLevel === "configure"
            ) {
              return "contributor";
            }
            if (
              projectOverviewAccessLevel === "use"
              || projectOverviewAccessLevel === "read"
              || projectOverviewAccessLevel === "read_only"
              || projectOverviewAccessLevel === "viewer"
              || projectOverviewAccessLevel === "view"
              || projectOverviewAccessLevel === "member"
              || projectOverviewAccessLevel === "create"
            ) {
              return "member";
            }
            return "";
          })();
	          const hasReducedProjectRole = projectOverviewViewerProjectRoleId === "contributor" || projectOverviewViewerProjectRoleId === "member";
          const isCurrentViewerProjectOwner = Boolean(isProjectCreatedByCurrentViewer?.(projectOverviewDraft || selectedProject));
	          const canManageProjectAccess = Boolean(
	            (!hasReducedProjectRole && isCurrentViewerProjectOwner)
	            || (!hasReducedProjectRole && (projectOverviewViewerProjectRoleId === "owner" || projectOverviewViewerProjectRoleId === "admin" || projectOverviewAccessLevel === "owner" || projectOverviewAccessLevel === "manage"))
	          );
          const hasReducedProjectSettingsAccess = Boolean(!canManageProjectAccess && hasReducedProjectRole);
          const canViewProjectSettings = canManageProjectAccess || hasReducedProjectSettingsAccess;
	          const activeProjectOverviewHomeTab = normalizedProjectOverviewHomeTab === "resources" || normalizedProjectOverviewHomeTab === "strategy" || (canViewProjectSettings && normalizedProjectOverviewHomeTab === "permissions")
		            ? normalizedProjectOverviewHomeTab
		            : "general";
          function restoreProjectOverviewSidebarAfterPermissionClose() {
            if (!projectOverviewSidebarAutoCollapsedForPermissionRef.current) {
              return;
            }
            projectOverviewSidebarAutoCollapsedForPermissionRef.current = false;
            setProjectOverviewSidebarCollapsed(false);
          }
          function closeProjectOverviewPermissionDetail(options = {}) {
            if (typeof setProjectOverviewPermissionTeamId === "function") {
              setProjectOverviewPermissionTeamId("");
            }
            if (typeof setProjectOverviewPermissionRoleId === "function") {
              setProjectOverviewPermissionRoleId("member");
            }
            if (options.restoreSidebar !== false) {
              restoreProjectOverviewSidebarAfterPermissionClose();
            }
          }
	          function openProjectOverviewPermissionDetail(team, roleId = "member") {
	            if (!canManageProjectAccess) {
	              return;
	            }
	            const teamId = String(team?.id || "").trim();
	            if (!teamId) {
	              return;
	            }
            if (typeof setProjectOverviewPermissionRoleId === "function") {
              setProjectOverviewPermissionRoleId(normalizePlaygroundTeamRoleId(roleId, "member"));
            }
            if (typeof setProjectOverviewPermissionTeamId === "function") {
              setProjectOverviewPermissionTeamId(teamId);
            }
            const shouldAutoCollapseSidebar = teamId !== "all_agents" && !projectOverviewSidebarCollapsed;
            if (shouldAutoCollapseSidebar) {
              projectOverviewSidebarAutoCollapsedForPermissionRef.current = true;
              setProjectOverviewSidebarCollapsed(true);
            } else if (teamId !== "all_agents") {
              projectOverviewSidebarAutoCollapsedForPermissionRef.current = false;
            }
          }
	          function renderProjectOverviewHomeTabs() {
	            const tabs = [
		              { id: "general", label: "General" },
		              { id: "resources", label: "Resources" },
			              { id: "strategy", label: "Strategy" },
			              canViewProjectSettings ? { id: "permissions", label: "Settings" } : null,
			            ].filter(Boolean);
            return React.createElement("div", { className: "playground-agents-overview-tabs playground-project-overview-tabs" },
              React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                tabs.map((tab) =>
                  React.createElement("button", {
                    key: tab.id,
                    type: "button",
                    className: "playground-project-overview-chart-tab" + (activeProjectOverviewHomeTab === tab.id ? " is-active" : ""),
                    onClick: () => {
                      if (typeof setProjectOverviewHomeTab === "function") {
                        setProjectOverviewHomeTab(tab.id);
                      }
                      if (typeof setProjectOverviewTaskToolbarPopover === "function") {
                        setProjectOverviewTaskToolbarPopover("");
                      }
                      if (typeof setProjectOverviewThreadToolbarPopover === "function") {
                        setProjectOverviewThreadToolbarPopover("");
                      }
                      if (typeof setProjectOverviewFileToolbarPopover === "function") {
                        setProjectOverviewFileToolbarPopover("");
                      }
                      if (typeof setProjectOverviewResourceToolbarPopover === "function") {
                        setProjectOverviewResourceToolbarPopover("");
                      }
                      if (typeof setProjectOverviewFilesSubview === "function") {
                        setProjectOverviewFilesSubview("overview");
                      }
                      closeProjectOverviewPermissionDetail();
                      if (tab.id === "permissions" && typeof requestProjectOverviewWorkspaceTeams === "function") {
                        requestProjectOverviewWorkspaceTeams();
                      }
                      if (tab.id === "strategy") {
                        if (typeof setMissionControlSetupOpen === "function") {
                          setMissionControlSetupOpen(false);
                        }
                        if (typeof setSelectedTaskId === "function") {
                          setSelectedTaskId("");
                        }
                        if (typeof setDraftTask === "function") {
                          setDraftTask(null);
                        }
                        if (typeof setMissionControlStrategyOpen === "function") {
                          setMissionControlStrategyOpen(false);
                        }
                      }
                    },
                    "aria-pressed": activeProjectOverviewHomeTab === tab.id ? "true" : "false",
                  }, tab.label)
                )
              )
            );
          }

          const projectOverviewTimescaleConfig = (() => {
            if (projectOverviewChartTimescale === "day") {
              return {
                key: "day",
                title: "Daily Cost by Resource Type",
                bucketCount: 14,
                unit: "day",
              };
            }
            if (projectOverviewChartTimescale === "week") {
              return {
                key: "week",
                title: "Weekly Cost by Resource Type",
                bucketCount: 8,
                unit: "week",
              };
            }
            return {
              key: "month",
              title: "Monthly Cost by Resource Type",
              bucketCount: 6,
              unit: "month",
            };
          })();

          const projectThreadTimeline = (() => {
            const now = new Date();
            const makeBucketBase = (key, label) => ({
              key,
              label,
              totalCT: 0,
              aiCT: 0,
              runtimeCT: 0,
              otherCT: 0,
            });
            const buckets = [];
            const bucketIndexByKey = new Map();

            if (projectOverviewTimescaleConfig.unit === "day") {
              const endDate = new Date(now);
              endDate.setHours(0, 0, 0, 0);
              for (let index = 0; index < projectOverviewTimescaleConfig.bucketCount; index += 1) {
                const date = new Date(endDate);
                date.setDate(endDate.getDate() - (projectOverviewTimescaleConfig.bucketCount - 1 - index));
                const key = getProjectOverviewLocalDayKey(date);
                const bucket = makeBucketBase(key, date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
                bucketIndexByKey.set(key, buckets.length);
                buckets.push(bucket);
              }
            } else if (projectOverviewTimescaleConfig.unit === "week") {
              const endWeek = new Date(now);
              endWeek.setHours(0, 0, 0, 0);
              endWeek.setDate(endWeek.getDate() - endWeek.getDay());
              for (let index = 0; index < projectOverviewTimescaleConfig.bucketCount; index += 1) {
                const date = new Date(endWeek);
                date.setDate(endWeek.getDate() - (7 * (projectOverviewTimescaleConfig.bucketCount - 1 - index)));
                const key = getProjectOverviewLocalWeekStartKey(date);
                const bucket = makeBucketBase(key, date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
                bucketIndexByKey.set(key, buckets.length);
                buckets.push(bucket);
              }
            } else {
              const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              for (let index = 0; index < projectOverviewTimescaleConfig.bucketCount; index += 1) {
                const date = new Date(endMonth.getFullYear(), endMonth.getMonth() - (projectOverviewTimescaleConfig.bucketCount - 1 - index), 1);
                const key = getProjectOverviewLocalMonthStartKey(date);
                const bucket = makeBucketBase(key, date.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
                bucketIndexByKey.set(key, buckets.length);
                buckets.push(bucket);
              }
            }

            const projectCostSummary = projectOverviewCostSummaryState?.summary;
            const projectCostSummaryDays = Array.isArray(projectCostSummary?.byDay) ? projectCostSummary.byDay : [];
            if (projectOverviewCostSummaryState?.status === "ready" && projectCostSummary) {
              projectCostSummaryDays.forEach((day) => {
                const timestamp = Date.parse(String(day?.date || "") + "T00:00:00");
                if (!Number.isFinite(timestamp)) {
                  return;
                }
                const dayDate = new Date(timestamp);
                let bucketKey = "";
                if (projectOverviewTimescaleConfig.unit === "day") {
                  bucketKey = getProjectOverviewLocalDayKey(dayDate);
                } else if (projectOverviewTimescaleConfig.unit === "week") {
                  bucketKey = getProjectOverviewLocalWeekStartKey(dayDate);
                } else {
                  bucketKey = getProjectOverviewLocalMonthStartKey(dayDate);
                }
                const bucketIndex = bucketIndexByKey.get(bucketKey);
                if (typeof bucketIndex !== "number") {
                  return;
                }
                const totalCT = Math.max(0, Number(readSettingsComputeTokens(day, "totalCT", "totalCost") || 0));
                const aiCT = Math.max(0, Number(readSettingsComputeTokens(day, "agentCT", "agentCost") || 0));
                const runtimeCT = Math.max(0, Number(readSettingsComputeTokens(day, "environmentCT", "environmentCost") || 0));
                const otherCT = Math.max(0, totalCT - aiCT - runtimeCT);
                buckets[bucketIndex].totalCT += totalCT;
                buckets[bucketIndex].aiCT += aiCT;
                buckets[bucketIndex].runtimeCT += runtimeCT;
                buckets[bucketIndex].otherCT += otherCT;
              });
              return buckets;
            }

            projectThreads.forEach((thread) => {
              const timestamp = Date.parse(String(thread?.updatedAt || thread?.createdAt || ""));
              if (!Number.isFinite(timestamp)) {
                return;
              }
              const threadDate = new Date(timestamp);
              let bucketKey = "";
              if (projectOverviewTimescaleConfig.unit === "day") {
                bucketKey = getProjectOverviewLocalDayKey(threadDate);
              } else if (projectOverviewTimescaleConfig.unit === "week") {
                bucketKey = getProjectOverviewLocalWeekStartKey(threadDate);
              } else {
                bucketKey = getProjectOverviewLocalMonthStartKey(threadDate);
              }
              const bucketIndex = bucketIndexByKey.get(bucketKey);
              if (typeof bucketIndex !== "number") {
                return;
              }
              const totalCT = Math.max(0, Number(readSettingsComputeTokens(thread, "totalCT", "totalCost") || 0));
              const aiCT = Math.max(0, Number(readSettingsComputeTokens(thread, "agentCT", "agentCost") || 0));
              const runtimeCT = Math.max(0, Number(readSettingsComputeTokens(thread, "environmentCT", "environmentCost") || 0));
              const otherCT = Math.max(0, totalCT - aiCT - runtimeCT);
              buckets[bucketIndex].totalCT += totalCT;
              buckets[bucketIndex].aiCT += aiCT;
              buckets[bucketIndex].runtimeCT += runtimeCT;
              buckets[bucketIndex].otherCT += otherCT;
            });

            return buckets;
          })();

          const projectComputeSeries = [
            {
              id: "inference",
              label: "LLM Inference",
              color: "rgb(143,196,255)",
              values: projectThreadTimeline.map((bucket) => bucket.aiCT),
            },
            {
              id: "runtime",
              label: "Computers & Resources",
              color: "rgb(103,80,255)",
              values: projectThreadTimeline.map((bucket) => bucket.runtimeCT),
            },
          ];
          if (projectThreadTimeline.some((bucket) => bucket.otherCT > 0)) {
            projectComputeSeries.push({
              id: "other",
              label: "Other Runtime",
              color: "rgb(94,234,212)",
              values: projectThreadTimeline.map((bucket) => bucket.otherCT),
            });
          }

          const maxProjectDailyCt = Math.max(...projectThreadTimeline.map((bucket) => bucket.totalCT), 1);
          const projectTotalCt = projectThreadTimeline.reduce((sum, bucket) => sum + bucket.totalCT, 0);
          const projectHasCostData = projectThreadTimeline.some((bucket) => bucket.totalCT > 0);
          const allOverviewResourceItems = Array.isArray(projectOverviewServerResourcesState?.items)
            ? projectOverviewServerResourcesState.items
            : [];
          const overviewResourceItems = allOverviewResourceItems
            .filter((item) => !normalizedSearchQuery || String(item?.searchText || "").includes(normalizedSearchQuery));
          const projectOverviewIntegrationRows = (() => {
            const integrationOrder = new Map([
              ["github", 0],
              ["notion", 1],
              ["googleDrive", 2],
              ["oneDrive", 3],
            ]);
            return (Array.isArray(PLAYGROUND_TASK_CONNECTOR_OPTIONS) ? PLAYGROUND_TASK_CONNECTOR_OPTIONS : [])
              .slice()
              .sort((left, right) => {
                const leftOrder = integrationOrder.has(left?.key) ? integrationOrder.get(left.key) : 99;
                const rightOrder = integrationOrder.has(right?.key) ? integrationOrder.get(right.key) : 99;
                return leftOrder - rightOrder;
              })
              .map((option) => {
                const selection = getDraftTaskConnectorSelection(option.source, selectedProject);
                return {
                  id: String(option?.key || option?.source || option?.label || ""),
                  source: option?.source || "",
                  label: option?.label || "Integration",
                  selection,
                  value: selection?.valueLabel || "Connect",
                  isEmpty: !selection,
                };
              });
          })();
          const overviewProjectAttachments = Array.isArray(selectedProjectAttachments) ? selectedProjectAttachments : [];
          const projectOverviewResourceTemplates = Array.isArray(PLAYGROUND_RESOURCE_TEMPLATE_DATA)
            ? PLAYGROUND_RESOURCE_TEMPLATE_DATA
            : [];
          const projectOverviewResourceTemplateTypes = Array.isArray(PLAYGROUND_RESOURCE_TEMPLATE_TYPE_DATA)
            ? PLAYGROUND_RESOURCE_TEMPLATE_TYPE_DATA
            : [];
          const projectOverviewMetadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
            ? selectedProject.metadata
            : {};
          const projectOverviewPublishedTemplates = Array.isArray(projectOverviewMetadata.resourceTemplates)
            ? projectOverviewMetadata.resourceTemplates
            : [];

          function getProjectOverviewCurrentProjectTypeId() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const candidates = [
              selectedProject?.projectType,
              selectedProject?.type,
              metadata.projectType,
              metadata.projectTypeId,
              metadata.operatingProfile,
            ];
            for (const value of candidates) {
              const normalized = String(value || "").trim().toLowerCase().replace(/_/g, "-");
              if (normalized) {
                return normalized;
              }
            }
            return "blank";
          }

          const currentProjectTypeId = getProjectOverviewCurrentProjectTypeId();
          const projectOverviewRecommendedTemplates = (() => {
            const normalizeProjectTypes = (template) => Array.isArray(template?.projectTypes)
              ? template.projectTypes.map((value) => String(value || "").trim().toLowerCase().replace(/_/g, "-")).filter(Boolean)
              : [];
            const matching = projectOverviewResourceTemplates.filter((template) => normalizeProjectTypes(template).includes(currentProjectTypeId));
            const fallback = projectOverviewResourceTemplates.filter((template) => {
              const projectTypes = normalizeProjectTypes(template);
              return !projectTypes.length || projectTypes.includes("blank");
            });
            const seen = new Set();
            return [...matching, ...fallback, ...projectOverviewResourceTemplates]
              .filter((template) => {
                const id = String(template?.id || "").trim();
                if (!id || seen.has(id)) {
                  return false;
                }
                seen.add(id);
                return true;
              })
              .slice(0, 3);
          })();

          const projectOverviewResourceTypeFilters = (() => {
            const fallbackTypes = [
              { id: "all", label: "All" },
              { id: "file", label: "Files" },
              { id: "metronome", label: "Metronomes" },
              { id: "web_app", label: "Web Apps" },
              { id: "function", label: "Functions" },
              { id: "database", label: "Databases" },
              { id: "imagine", label: "Imagine" },
            ];
            const base = projectOverviewResourceTemplateTypes.length ? projectOverviewResourceTemplateTypes : fallbackTypes;
            const wanted = new Set(["all", "file", "metronome", "web_app", "function", "database", "imagine"]);
            const seen = new Set();
            return base
              .filter((type) => wanted.has(String(type?.id || "").trim()))
              .filter((type) => {
                const id = String(type?.id || "").trim();
                if (!id || seen.has(id)) {
                  return false;
                }
                seen.add(id);
                return true;
              });
          })();

          function getProjectOverviewResourceTemplateIcon(type) {
            if (typeof getPlaygroundResourceTemplateIcon === "function") {
              return getPlaygroundResourceTemplateIcon(type);
            }
            const normalized = String(type || "").trim();
            if (normalized === "metronome") return Metronome;
            if (normalized === "web_app") return Monitor;
            if (normalized === "function") return FunctionSquare;
            if (normalized === "database") return Database;
            if (normalized === "imagine") return Clapperboard;
            return FileText;
          }

          function getProjectOverviewResourceTypeMeta(type) {
            const normalized = String(type || "").trim();
            const metaByType = {
              file: { label: "File", Icon: FileText, subview: "overview" },
              metronome: { label: "Metronome", Icon: Metronome, subview: "resources" },
              web_app: { label: "Web App", Icon: Monitor, subview: "web-apps" },
              function: { label: "Function", Icon: FunctionSquare, subview: "functions" },
              database: { label: "Database", Icon: Database, subview: "databases" },
              imagine: { label: "Imagine", Icon: Clapperboard, subview: "imagine" },
            };
            return metaByType[normalized] || { label: "Resource", Icon: Layers, subview: "resources" };
          }

          function classifyProjectOverviewServerResource(item) {
            if (isProjectOverviewMetronomeResource(item)) return "metronome";
            if (isProjectOverviewWebAppResource(item)) return "web_app";
            if (isProjectOverviewFunctionResource(item)) return "function";
            if (isProjectOverviewDatabaseResource(item)) return "database";
            return "resource";
          }

          function classifyProjectOverviewFileResource(item) {
            const candidate = [
              item?.mimeType,
              item?.contentType,
              item?.type,
              item?.fileType,
              item?.path,
              item?.sourcePath,
              item?.workspacePath,
              item?.title,
              item?.filename,
            ].join(" ");
            const normalizedCandidate = String(candidate || "").trim();
            if (/^image\//i.test(normalizedCandidate) || /^video\//i.test(normalizedCandidate) || /\.(avif|bmp|gif|jpe?g|png|svg|webp|m4v|mkv|mov|mp4|webm)$/i.test(normalizedCandidate)) {
              return "imagine";
            }
            return "file";
          }

          const projectOverviewAllResourceRows = (() => {
            const seen = new Set();
            const rows = [];
            function pushResourceRow(row) {
              const key = String(row?.key || row?.id || row?.path || row?.title || "").trim();
              if (!key || seen.has(key)) {
                return;
              }
              seen.add(key);
              rows.push(row);
            }
            projectOverviewPublishedTemplates.forEach((item, index) => {
              const normalizedTemplateId = String(item?.templateId || item?.id || "").trim();
              const catalogTemplate = projectOverviewResourceTemplates.find((template) => (
                String(template?.id || "").trim() === normalizedTemplateId
              ));
              const template = {
                ...(catalogTemplate && typeof catalogTemplate === "object" ? catalogTemplate : {}),
                ...(item && typeof item === "object" ? item : {}),
              };
              const type = String(template.type || "file").trim() || "file";
              pushResourceRow({
                key: "template:" + (normalizedTemplateId || type + ":" + index),
                kind: "template",
                type,
                title: String(template.title || "Published template").trim() || "Published template",
                subtitle: String(template.summary || template.description || "Published resource template").trim(),
                status: "Template",
                updatedLabel: getProjectOverviewSidebarDateLabel(template.publishedAt || ""),
                record: template,
                template,
                path: "",
              });
            });
            overviewProjectAttachments.forEach((attachment, index) => {
              const path = normalizeHistoryPath(attachment?.sourcePath || attachment?.workspacePath || attachment?.path || "");
              const title = String(attachment?.filename || getHistoryPathName(path) || attachment?.title || "Untitled file").trim();
              const type = classifyProjectOverviewFileResource(attachment);
              pushResourceRow({
                key: "attachment:" + (path || attachment?.id || index),
                kind: "attachment",
                type,
                title,
                subtitle: path || "Project attachment",
                status: "Attached",
                updatedLabel: getProjectOverviewSidebarDateLabel(attachment?.updatedAt || attachment?.createdAt || ""),
                record: attachment,
                path,
              });
            });
            (projectOverviewFileActivityState?.items || []).forEach((item, index) => {
              const path = normalizeHistoryPath(item?.path || item?.sourcePath || item?.workspacePath || "");
              const title = String(item?.title || item?.filename || getHistoryPathName(path) || "Untitled file").trim();
              const type = classifyProjectOverviewFileResource(item);
              pushResourceRow({
                key: "file:" + (path || item?.id || index),
                kind: "file",
                type,
                title,
                subtitle: path || "Workspace file",
                status: String(item?.operation || item?.operationKind || "Modified").trim() || "Modified",
                updatedLabel: item?.dateLabel || getProjectOverviewSidebarDateLabel(item?.updatedAt || item?.createdAt || ""),
                record: item,
                path,
              });
            });
            allOverviewResourceItems.forEach((item, index) => {
              const type = classifyProjectOverviewServerResource(item);
              const meta = getProjectOverviewResourceTypeMeta(type);
              const title = String(item?.name || item?.title || item?.label || item?.id || meta.label).trim();
              const subtitle = String(item?.description || item?.endpoint || item?.url || item?.id || "").trim();
              pushResourceRow({
                key: "resource:" + (item?.id || type + ":" + title + ":" + index),
                kind: "runtime",
                type,
                title,
                subtitle,
                status: String(item?.status || item?.state || "Linked").trim() || "Linked",
                updatedLabel: getProjectOverviewSidebarDateLabel(item?.updatedAt || item?.createdAt || ""),
                record: item,
                path: "",
              });
            });
            return rows.sort((left, right) => String(left.title || "").localeCompare(String(right.title || "")));
          })();
          const projectOverviewResourceRows = (() => {
            const filter = String(projectOverviewResourceFilter || "all").trim();
            const resourceSearch = String(projectOverviewResourceSearchQuery || "").trim().toLowerCase();
            return projectOverviewAllResourceRows
              .filter((row) => filter === "all" || row.type === filter)
              .filter((row) => {
                if (!resourceSearch) {
                  return true;
                }
                const creator = getProjectOverviewResourceCreator(row);
                return [row.title, row.subtitle, creator.name, creator.email, row.type].join(" ").toLowerCase().includes(resourceSearch);
              });
          })();

          const hasOverviewProjectAttachments = overviewProjectAttachments.length > 0;
          function openOverviewAttachmentInFiles(attachment) {
            const normalizedPath = normalizeHistoryPath(attachment?.sourcePath || attachment?.workspacePath || "");
            if (!normalizedPath) {
              return;
            }
            if (typeof navigateProjectOverviewFileToFiles === "function") {
              navigateProjectOverviewFileToFiles({
                path: normalizedPath,
                title: attachment?.filename || getHistoryPathName(normalizedPath) || "Untitled file",
                environmentId: attachment?.environmentId || activeProjectAttachmentEnvironmentId || selectedProject?.defaultEnvironmentId || "",
                projectId: normalizedSelectedProjectId,
              });
            }
            if (typeof setProjectPreviewedAttachmentId === "function") {
              setProjectPreviewedAttachmentId("");
            }
          }
          const allOverviewProjectFileCount = (() => {
            const next = new Set();
            (projectOverviewFileActivityState?.items || []).forEach((item) => {
              const key = String(item?.path || item?.title || item?.id || "").trim();
              if (key) {
                next.add(key);
              }
            });
            overviewProjectAttachments.forEach((attachment) => {
              const key = String(
                attachment?.sourcePath
                || attachment?.workspacePath
                || attachment?.filename
                || attachment?.id
                || ""
              ).trim();
              if (key) {
                next.add(key);
              }
            });
            return next.size;
          })();
          function readProjectOverviewFileByteSize(record) {
            if (!record || typeof record !== "object") {
              return 0;
            }
            const candidateKeys = [
              "size",
              "bytes",
              "byteSize",
              "sizeBytes",
              "fileSize",
              "fileSizeBytes",
              "contentLength",
              "contentLengthBytes",
            ];
            for (const key of candidateKeys) {
              const value = Number(record[key]);
              if (Number.isFinite(value) && value > 0) {
                return value;
              }
            }
            const metadata = record.metadata || record.file || record.entry || record.resource || null;
            if (metadata && metadata !== record) {
              return readProjectOverviewFileByteSize(metadata);
            }
            return 0;
          }
          function readProjectOverviewStorageCapacityBytes(environment) {
            if (!environment || typeof environment !== "object") {
              return 0;
            }
            const bytesKeys = [
              "storageLimitBytes",
              "storageQuotaBytes",
              "storageCapacityBytes",
              "diskLimitBytes",
              "diskQuotaBytes",
              "diskCapacityBytes",
              "quotaBytes",
              "capacityBytes",
              "maxStorageBytes",
            ];
            for (const key of bytesKeys) {
              const value = Number(environment[key]);
              if (Number.isFinite(value) && value > 0) {
                return value;
              }
            }
            const mbKeys = [
              "storageLimitMB",
              "storageQuotaMB",
              "storageCapacityMB",
              "diskLimitMB",
              "diskQuotaMB",
              "diskCapacityMB",
              "quotaMB",
              "capacityMB",
              "maxStorageMB",
            ];
            for (const key of mbKeys) {
              const value = Number(environment[key]);
              if (Number.isFinite(value) && value > 0) {
                return value * 1024 * 1024;
              }
            }
            const gbKeys = [
              "storageLimitGB",
              "storageQuotaGB",
              "storageCapacityGB",
              "diskLimitGB",
              "diskQuotaGB",
              "diskCapacityGB",
              "quotaGB",
              "capacityGB",
              "maxStorageGB",
            ];
            for (const key of gbKeys) {
              const value = Number(environment[key]);
              if (Number.isFinite(value) && value > 0) {
                return value * 1024 * 1024 * 1024;
              }
            }
            const metadata = environment.metadata || environment.resource || environment.details || null;
            if (metadata && metadata !== environment) {
              return readProjectOverviewStorageCapacityBytes(metadata);
            }
            return 0;
          }
          const projectOverviewStorageUsedBytes = (() => {
            const seen = new Set();
            let total = 0;
            function addRecord(record, fallbackKey) {
              const key = String(
                record?.path
                || record?.sourcePath
                || record?.workspacePath
                || record?.filename
                || record?.title
                || record?.id
                || fallbackKey
                || ""
              ).trim();
              if (key && seen.has(key)) {
                return;
              }
              if (key) {
                seen.add(key);
              }
              total += readProjectOverviewFileByteSize(record);
            }
            (projectOverviewFileActivityState?.items || []).forEach((item, index) => addRecord(item, "activity:" + index));
            overviewProjectAttachments.forEach((attachment, index) => addRecord(attachment, "attachment:" + index));
            return total;
          })();
          const projectOverviewStorageCapacityBytes = Math.max(
            readProjectOverviewStorageCapacityBytes(activeProjectAttachmentEnvironment),
            projectOverviewStorageUsedBytes > 0 ? projectOverviewStorageUsedBytes * 4 : 0,
            1024 * 1024 * 1024
          );
          const projectOverviewStoragePercent = projectOverviewStorageCapacityBytes > 0
            ? Math.max(0, Math.min(100, Math.round((projectOverviewStorageUsedBytes / projectOverviewStorageCapacityBytes) * 1000) / 10))
            : 0;
          const projectOverviewFilesSubviewId = ["overview", "resources", "web-apps", "functions", "databases", "imagine"].includes(String(projectOverviewFilesSubview || ""))
            ? String(projectOverviewFilesSubview || "")
            : "overview";
          const isProjectOverviewResourceSubviewOpen = projectOverviewFilesSubviewId !== "overview";
          const visibleOverviewTasks = overviewVisibleTasks.slice(0, 5);
          const normalizedProjectOverviewTaskSearch = String(projectOverviewTaskSearchQuery || "").trim();
          const hasProjectOverviewTaskListFilters = Boolean(
            normalizedSearchQuery
            || normalizedProjectOverviewTaskSearch
            || projectOverviewTaskFilterMode !== "open"
          );
          const overviewCurrentTaskReleaseSections = (() => {
            const sections = [];
            const sectionIndexByKey = new Map();
            (Array.isArray(releases) ? releases : []).forEach((release) => {
              const releaseId = String(release?.id || "").trim();
              if (!releaseId || sectionIndexByKey.has(releaseId)) {
                return;
              }
              sectionIndexByKey.set(releaseId, sections.length);
              sections.push({
                key: releaseId,
                releaseId,
                title: release.name || "Untitled Milestone",
                tasks: [],
              });
            });
            normalizedOverviewTasks.forEach((task) => {
              const normalizedReleaseId = typeof task?.releaseId === "string" && task.releaseId.trim()
                ? task.releaseId.trim()
                : "";
              const sectionKey = normalizedReleaseId || "__no_release__";
              const releaseRecord = normalizedReleaseId ? (releasesById[normalizedReleaseId] || null) : null;
              let sectionIndex = sectionIndexByKey.get(sectionKey);
              if (sectionIndex === undefined) {
                sectionIndex = sections.length;
                sectionIndexByKey.set(sectionKey, sectionIndex);
                sections.push({
                  key: sectionKey,
                  releaseId: normalizedReleaseId,
                  title: normalizedReleaseId ? (releaseRecord?.name || "Milestone unavailable") : "All other",
                  tasks: [],
                });
              }
              sections[sectionIndex].tasks.push(task);
            });
            return sections
              .slice()
              .sort((left, right) => {
                const leftIsAllOther = left.key === "__no_release__";
                const rightIsAllOther = right.key === "__no_release__";
                if (leftIsAllOther !== rightIsAllOther) {
                  return leftIsAllOther ? 1 : -1;
                }
                if (leftIsAllOther && rightIsAllOther) {
                  return 0;
                }
                const leftRelease = releasesById[left.releaseId] || { id: left.releaseId, name: left.title };
                const rightRelease = releasesById[right.releaseId] || { id: right.releaseId, name: right.title };
                return typeof compareTaskReleaseOrder === "function"
                  ? compareTaskReleaseOrder(leftRelease, rightRelease)
                  : String(left.title || "").localeCompare(String(right.title || ""));
              });
          })();
          const normalizedProjectOverviewThreadSearch = String(projectOverviewThreadSearchQuery || "").trim().toLowerCase();
          const projectOverviewFilteredThreads = filteredProjectThreads
            .filter((thread) => {
              const status = typeof resolveThreadDisplayStatus === "function"
                ? resolveThreadDisplayStatus(thread?.status, thread?.completedAt || thread?.finishedAt || thread?.endedAt)
                : (thread?.status || "");
              const normalizedStatus = String(status || "").trim().toLowerCase();
              if (projectOverviewThreadFilterMode === "running" && !(typeof isRunningThreadDisplayStatus === "function" ? isRunningThreadDisplayStatus(normalizedStatus) : ["running", "queued", "pending", "scheduled", "starting", "created", "ready"].includes(normalizedStatus))) {
                return false;
              }
              if (projectOverviewThreadFilterMode === "permission" && !(typeof isPendingPermissionThreadDisplayStatus === "function" ? isPendingPermissionThreadDisplayStatus(normalizedStatus) : normalizedStatus === "permission_asked")) {
                return false;
              }
              if (projectOverviewThreadFilterMode === "completed" && !(typeof isCompletedThreadStatus === "function" ? isCompletedThreadStatus(normalizedStatus) : ["completed", "complete", "done", "succeeded", "success", "finished"].includes(normalizedStatus))) {
                return false;
              }
              if (projectOverviewThreadFilterMode === "failed" && !["failed", "cancelled", "canceled"].includes(normalizedStatus)) {
                return false;
              }
              if (!normalizedProjectOverviewThreadSearch) {
                return true;
              }
              const threadParts = typeof getSidebarThreadTitleParts === "function"
                ? getSidebarThreadTitleParts(thread)
                : {
                    safeThread: thread,
                    taskTicketNumber: "",
                    displayThreadTitle: thread?.title || "Untitled thread",
                  };
              const safeThread = threadParts.safeThread || thread;
              const threadActor = typeof getPlaygroundThreadActorInfo === "function"
                ? getPlaygroundThreadActorInfo(safeThread, agentsById, "No agent")
                : { name: safeThread?.agentId || "" };
              const taskPreview = typeof getThreadTaskPreview === "function" ? getThreadTaskPreview(safeThread) : null;
              const haystack = [
                threadParts.displayThreadTitle || safeThread?.title || "",
                safeThread?.id || "",
                threadParts.taskTicketNumber || "",
                threadActor?.name || "",
                status || "",
                taskPreview?.runKind || "",
                typeof formatRelativeThreadTime === "function" ? (formatRelativeThreadTime(safeThread?.updatedAt || safeThread?.createdAt) || "") : "",
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedProjectOverviewThreadSearch);
            })
            .sort((left, right) => {
              if (projectOverviewThreadSortMode === "title-asc") {
                const leftTitle = typeof getSidebarThreadTitleParts === "function"
                  ? getSidebarThreadTitleParts(left).displayThreadTitle
                  : left?.title;
                const rightTitle = typeof getSidebarThreadTitleParts === "function"
                  ? getSidebarThreadTitleParts(right).displayThreadTitle
                  : right?.title;
                return String(leftTitle || "").localeCompare(String(rightTitle || ""));
              }
              if (projectOverviewThreadSortMode === "created-desc") {
                const leftCreatedAt = Date.parse(String(left?.createdAt || ""));
                const rightCreatedAt = Date.parse(String(right?.createdAt || ""));
                const leftValue = Number.isFinite(leftCreatedAt) ? leftCreatedAt : 0;
                const rightValue = Number.isFinite(rightCreatedAt) ? rightCreatedAt : 0;
                return rightValue - leftValue;
              }
              return typeof compareThreadsByRecent === "function"
                ? compareThreadsByRecent(left, right)
                : String(right?.updatedAt || right?.createdAt || "").localeCompare(String(left?.updatedAt || left?.createdAt || ""));
            });
          const visibleProjectThreads = projectOverviewFilteredThreads.slice(0, Math.max(5, Number(projectOverviewVisibleThreadCount) || 5));
          const visibleProjectThreadIds = visibleProjectThreads
            .map((thread) => {
              const safeThread = typeof normalizeThreadItem === "function" ? normalizeThreadItem(thread) : thread;
              return String(safeThread?.id || thread?.id || "").trim();
            })
            .filter(Boolean);
          const selectedVisibleProjectThreadIds = visibleProjectThreadIds.filter((threadId) =>
            selectedProjectOverviewThreadIds instanceof Set && selectedProjectOverviewThreadIds.has(threadId)
          );
          const allVisibleProjectThreadsSelected = visibleProjectThreadIds.length > 0 && selectedVisibleProjectThreadIds.length === visibleProjectThreadIds.length;
          const hasPartialVisibleProjectThreadSelection = selectedVisibleProjectThreadIds.length > 0 && !allVisibleProjectThreadsSelected;
          const toggleProjectOverviewThreadSelection = (threadId) => {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId || typeof setSelectedProjectOverviewThreadIds !== "function") {
              return;
            }
            setSelectedProjectOverviewThreadIds((current) => {
              const next = new Set(current || []);
              if (next.has(normalizedThreadId)) {
                next.delete(normalizedThreadId);
              } else {
                next.add(normalizedThreadId);
              }
              return next;
            });
          };
          const toggleVisibleProjectOverviewThreadSelection = () => {
            if (!visibleProjectThreadIds.length || typeof setSelectedProjectOverviewThreadIds !== "function") {
              return;
            }
            setSelectedProjectOverviewThreadIds((current) => {
              const next = new Set(current || []);
              if (allVisibleProjectThreadsSelected) {
                visibleProjectThreadIds.forEach((threadId) => next.delete(threadId));
              } else {
                visibleProjectThreadIds.forEach((threadId) => next.add(threadId));
              }
              return next;
            });
          };
          const hasMoreProjectThreads = projectOverviewFilteredThreads.length > visibleProjectThreads.length;
          const hasProjectOverviewThreadListFilters = Boolean(
            normalizedSearchQuery
            || normalizedProjectOverviewThreadSearch
            || projectOverviewThreadFilterMode !== "all"
          );
          const normalizedProjectOverviewFileSearch = String(projectOverviewFileSearchQuery || "").trim().toLowerCase();
          const getProjectOverviewFileOperationKind = (item) => {
            const normalizedKind = String(item?.operationKind || item?.operation || "").trim().toLowerCase();
            if (normalizedKind.includes("creat") || normalizedKind === "added" || normalizedKind === "add") {
              return "created";
            }
            if (normalizedKind.includes("delet") || normalizedKind === "removed" || normalizedKind === "remove") {
              return "deleted";
            }
            return "modified";
          };
          const filteredProjectFileActivityItems = (projectOverviewFileActivityState?.items || [])
            .filter((item) => {
              if (!normalizedSearchQuery) {
                return true;
              }
              const haystack = [
                item?.title || "",
                item?.path || "",
                item?.operation || "",
                item?.assignee || "",
                item?.taskTicketNumber || "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            })
            .filter((item) => {
              if (projectOverviewFileFilterMode !== "all" && getProjectOverviewFileOperationKind(item) !== projectOverviewFileFilterMode) {
                return false;
              }
              if (!normalizedProjectOverviewFileSearch) {
                return true;
              }
              const haystack = [
                item?.title || "",
                item?.path || "",
                item?.operation || "",
                item?.assignee || "",
                item?.taskTicketNumber || "",
                item?.dateLabel || "",
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedProjectOverviewFileSearch);
            })
            .sort((left, right) => {
              if (projectOverviewFileSortMode === "title-asc") {
                return String(left?.title || left?.path || "").localeCompare(String(right?.title || right?.path || ""));
              }
              if (projectOverviewFileSortMode === "operation-asc") {
                const operationOrder = getProjectOverviewFileOperationKind(left).localeCompare(getProjectOverviewFileOperationKind(right));
                if (operationOrder !== 0) {
                  return operationOrder;
                }
                return String(left?.title || left?.path || "").localeCompare(String(right?.title || right?.path || ""));
              }
              const leftTimestamp = Number(left?.timestamp || 0);
              const rightTimestamp = Number(right?.timestamp || 0);
              const leftValue = Number.isFinite(leftTimestamp) ? leftTimestamp : 0;
              const rightValue = Number.isFinite(rightTimestamp) ? rightTimestamp : 0;
              return rightValue - leftValue;
            })
            .slice(0, 12);
          const hasProjectOverviewFileListFilters = Boolean(
            normalizedSearchQuery
            || normalizedProjectOverviewFileSearch
            || projectOverviewFileFilterMode !== "all"
          );
          const projectOverviewImagineResources = (() => {
            const seen = new Set();
            const imageExtensions = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;
            const videoExtensions = /\.(m4v|mkv|mov|mp4|webm)$/i;
            return (projectOverviewFileActivityState?.items || [])
              .filter((item) => {
                const candidate = [
                  item?.mimeType,
                  item?.contentType,
                  item?.type,
                  item?.fileType,
                  item?.path,
                  item?.title,
                  item?.filename,
                ].join(" ");
                const normalizedCandidate = String(candidate || "").trim();
                return /^image\//i.test(normalizedCandidate)
                  || /^video\//i.test(normalizedCandidate)
                  || imageExtensions.test(normalizedCandidate)
                  || videoExtensions.test(normalizedCandidate);
              })
              .filter((item) => {
                const key = String(item?.path || item?.title || item?.id || "").trim();
                if (!key) {
                  return false;
                }
                if (seen.has(key)) {
                  return false;
                }
                seen.add(key);
                return true;
              })
              .sort((left, right) => {
                const leftTimestamp = Number(left?.timestamp || 0);
                const rightTimestamp = Number(right?.timestamp || 0);
                return (Number.isFinite(rightTimestamp) ? rightTimestamp : 0) - (Number.isFinite(leftTimestamp) ? leftTimestamp : 0);
              });
          })();
          const projectOverviewKpis = [
            {
              id: "tasks",
              value: String(Number(selectedProjectSummary.tasksCount) || Number(selectedProjectTaskStatusOverview.total) || 0),
              label: "All Tasks",
            },
            {
              id: "open",
              value: String(Number(selectedProjectSummary.openTasksCount) || 0),
              label: "Open Tasks",
            },
            {
              id: "ct",
              value: formatProjectOverviewCt(projectTotalCt),
              label: "Spent on Project",
            },
            {
              id: "resources",
              value: String(allOverviewResourceItems.length),
              label: "Project Resources",
            },
            {
              id: "files",
              value: String(allOverviewProjectFileCount),
              label: "Project Files",
            },
          ];

          function renderOverviewSectionHeader(title, description, action) {
            return React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, title),
                description
                  ? React.createElement("p", { className: "playground-plugins-section-subtitle" }, description)
                  : null
              ),
              action || null
            );
          }

          function renderProjectOverviewIntegrationRow(row) {
            const rowProjectId = normalizedSelectedProjectId;
            const openProjectConnectorBrowser = (reason, event) => {
              console.info("[connector-debug] project overview integration row open requested", {
                reason,
                source: row.source,
                rowProjectId,
                selectedProjectId: normalizedSelectedProjectId,
                hasRequestHandler: typeof requestProjectConnectorBrowserOpen === "function",
                eventButton: event?.button ?? null,
                eventDetail: event?.detail ?? null,
                eventType: event?.type || "",
                isTrusted: event?.isTrusted ?? null,
              });
              requestProjectConnectorBrowserOpen(row.source, {
                projectId: rowProjectId,
                projectRecord: selectedProject,
              });
            };
            return React.createElement("button", {
                key: row.id || row.label,
                type: "button",
                className: "playground-tasks-connector-row playground-project-overview-integration-row",
                "data-project-overview-connector-source": row.source,
                "data-project-overview-project-id": rowProjectId,
                onPointerDown: (event) => {
                  console.info("[connector-debug] project overview integration row pointerdown", {
                    source: row.source,
                    rowProjectId,
                    button: event.button,
                    detail: event.detail,
                    isTrusted: event.isTrusted,
                  });
                  if (event.button && event.button !== 0) {
                    console.info("[connector-debug] project overview integration row pointerdown ignored", {
                      source: row.source,
                      rowProjectId,
                      button: event.button,
                    });
                    return;
                  }
                  event.preventDefault();
                  openProjectConnectorBrowser("pointerdown", event);
                },
                onClick: (event) => {
                  console.info("[connector-debug] project overview integration row click", {
                    source: row.source,
                    rowProjectId,
                    detail: event.detail,
                    isTrusted: event.isTrusted,
                  });
                  if (event.detail !== 0) {
                    console.info("[connector-debug] project overview integration row click ignored because pointerdown handled it", {
                      source: row.source,
                      rowProjectId,
                      detail: event.detail,
                    });
                    return;
                  }
                  event.preventDefault();
                  openProjectConnectorBrowser("programmatic-click", event);
                },
              },
              React.createElement("div", { className: "playground-tasks-connector-service" },
                renderTaskConnectorServiceIcon(row.source, "playground-tasks-connector-service-icon playground-project-overview-integration-icon"),
                React.createElement("span", { className: "playground-tasks-connector-service-label" }, row.label)
              ),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                React.createElement("span", {
                  className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger playground-project-overview-integration-value-button" + (row.isEmpty ? " is-empty" : ""),
                  title: row.value,
                },
                  React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, row.value),
                  React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron playground-project-overview-integration-chevron", strokeWidth: 1.8 })
                )
              )
            );
          }

          function renderProjectOverviewPluginsPanel() {
            const hasProjectPlugins = projectOverviewIntegrationRows.length > 0;
            return React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-plugins-panel",
              },
              renderOverviewSectionHeader(
                "Project Plugins",
                "Connect project-scoped plugin access so agents can read and write the right repositories, drives, and workspaces while they work."
              ),
              hasProjectPlugins
                ? React.createElement("div", { className: "playground-project-overview-plugins-list" },
                    projectOverviewIntegrationRows.map((row) => renderProjectOverviewIntegrationRow(row))
                  )
                : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                    "No plugins are available yet."
                  )
            );
          }

          function renderProjectOverviewTaskToolbarOption({ option, active, onClick }) {
            return React.createElement("button", {
                key: option.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (active ? " selected" : ""),
                onClick,
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                active
                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, option.label),
                option.description
                  ? React.createElement("span", null, option.description)
                  : null
              )
            );
          }
`;

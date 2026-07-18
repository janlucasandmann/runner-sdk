  ${INFERENCE_APP_SCRIPT_FRAGMENTS.handlers}
  ${API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacyCard}        function renderSettingsChip(label, tone = "muted") {
            return React.createElement("span", {
              className: "playground-settings-chip is-" + tone,
            }, label);
          }
  
          function renderSettingsSectionCard(title, description, body, footer) {
            return React.createElement("section", { className: "playground-settings-card" },
              React.createElement("div", { className: "playground-settings-card-header" },
                React.createElement("div", null,
                  React.createElement("div", { className: "playground-settings-card-title" }, title),
                  description
                    ? React.createElement("div", { className: "playground-settings-card-copy" }, description)
                    : null
                )
              ),
              body,
              footer
                ? React.createElement("div", { className: "playground-settings-card-footer" }, footer)
                : null
            );
          }
  
          function renderSettingsEmptyState(Icon, title, copy, action) {
            return React.createElement("div", { className: "playground-settings-empty-state" },
              React.createElement("div", { className: "playground-settings-empty-icon" },
                React.createElement(Icon, { width: 18, height: 18, strokeWidth: 1.8 })
              ),
              React.createElement("div", { className: "playground-settings-empty-title" }, title),
              React.createElement("div", { className: "playground-settings-empty-copy" }, copy),
              action || null
            );
          }
  
          function renderWebhookEmptyState() {
            return React.createElement("div", { className: "playground-tasks-empty" },
              React.createElement(Webhook, { width: 28, height: 28, strokeWidth: 1.9 }),
              React.createElement("div", { className: "playground-tasks-empty-title" }, "Create your first webhook"),
              React.createElement("div", { className: "playground-tasks-empty-copy" }, "Webhook triggers let ACP react to external events automatically. Start with one trigger, connect a source, and route incoming events into agent work."),
              React.createElement("div", { className: "playground-tasks-empty-actions" },
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "button",
                  className: "playground-tasks-empty-primary-button",
                  onClick: openSettingsTriggerComposer,
                },
                  React.createElement(Plus, { width: 12, height: 12, strokeWidth: 2, "aria-hidden": "true" }),
                  React.createElement("span", null, "New Webhook")
                )
              )
            );
          }
  
          function renderSettingsDotLoader(dotCount = 9) {
            return React.createElement("div", { className: "playground-settings-dot-loader", "aria-hidden": "true" },
              Array.from({ length: dotCount }, (_, index) =>
                React.createElement("span", {
                    key: "settings-dot:" + index,
                    className: "playground-settings-dot-loader-dot",
                    style: { animationDelay: String(index * 0.08) + "s" },
                  })
              )
            );
          }
  
          function getSettingsTelegramDisplayName(status) {
            if (status?.telegramUsername) {
              return "@" + status.telegramUsername;
            }
            if (status?.telegramFirstName) {
              return status.telegramFirstName + (status?.telegramLastName ? " " + status.telegramLastName : "");
            }
            return "User";
          }
  
          function renderSettingsIntegrationMessage(type, message) {
            if (!message) {
              return null;
            }
  
            const Icon = type === "error" ? AlertCircle : Check;
            return React.createElement("div", {
                className: "playground-settings-integration-message is-" + (type === "error" ? "error" : "success"),
              },
                React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, message)
              );
          }
  
          function renderSettingsIntegrationInfoBody(title, items, actions, footer) {
            return React.createElement("div", { className: "playground-settings-integration-body" },
              title
                ? React.createElement("p", { className: "playground-settings-integration-section-label" }, title)
                : null,
              Array.isArray(items) && items.length > 0
                ? React.createElement("ul", { className: "playground-settings-integration-list" },
                    items.map((item, index) =>
                      React.createElement("li", { key: title + ":" + index }, item)
                    )
                  )
                : null,
              Array.isArray(actions) && actions.length > 0
                ? React.createElement("div", { className: "playground-settings-integration-actions" }, actions)
                : null,
              footer
                ? React.createElement("p", { className: "playground-settings-integration-helper" }, footer)
                : null
            );
          }
  
          function renderSettingsIntegrationConnectBody(tone, buttonLabel, onClick, hint) {
            return React.createElement("div", { className: "playground-settings-integration-body" },
              React.createElement("div", { className: "playground-settings-integration-actions" },
                React.createElement("button", {
                  type: "button",
                  onClick,
                  className: "playground-settings-integration-button is-" + tone,
                },
                  React.createElement(ArrowUpRight, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, buttonLabel)
                )
              ),
              hint
                ? React.createElement("p", { className: "playground-settings-integration-helper" }, hint)
                : null
            );
          }
  
          function buildSettingsSvgLinePath(points) {
            if (!Array.isArray(points) || points.length === 0) {
              return "";
            }
  
            return points.map((point, index) => (index === 0 ? "M " : "L ") + point.x.toFixed(2) + " " + point.y.toFixed(2)).join(" ");
          }
  
          function buildSettingsSvgAreaPath(points, baselineY) {
            if (!Array.isArray(points) || points.length === 0) {
              return "";
            }
  
            const linePath = buildSettingsSvgLinePath(points);
            const firstPoint = points[0];
            const lastPoint = points[points.length - 1];
            return linePath
              + " L " + lastPoint.x.toFixed(2) + " " + baselineY.toFixed(2)
              + " L " + firstPoint.x.toFixed(2) + " " + baselineY.toFixed(2)
              + " Z";
          }
  
          function getSettingsVisibleChartLabelIndexes(labels, maxVisibleLabels = 8) {
            const count = Array.isArray(labels) ? labels.length : 0;
            if (count <= 0) {
              return new Set();
            }
  
            const visibleLimit = Math.max(2, Math.min(count, Math.floor(Number(maxVisibleLabels) || 8)));
            const labelStep = Math.max(1, Math.ceil(count / visibleLimit));
            const indexes = [];
            for (let index = 0; index < count; index += labelStep) {
              indexes.push(index);
            }
  
            const lastIndex = count - 1;
            if (!indexes.includes(lastIndex)) {
              const previousIndex = indexes[indexes.length - 1];
              if (Number.isFinite(previousIndex) && lastIndex - previousIndex < Math.max(2, Math.ceil(labelStep / 2))) {
                indexes[indexes.length - 1] = lastIndex;
              } else {
                indexes.push(lastIndex);
              }
            }
  
            return new Set(indexes);
          }
  
          function PlaygroundSettingsResponsiveSvg({ frameClassName, frameHeight, svgHeight, fallbackWidth = 640, ariaLabel, children }) {
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
            const resolvedSvgHeight = Math.max(1, Math.round(frameHeight || svgHeight || 208));
  
            return React.createElement("div", {
                ref: frameRef,
                className: frameClassName,
                style: frameHeight ? { height: String(frameHeight) + "px" } : undefined,
              },
              React.createElement("svg", {
                className: "playground-settings-usage-chart-svg",
                width: resolvedSvgWidth,
                height: resolvedSvgHeight,
                role: "img",
                "aria-label": ariaLabel || "Usage chart",
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
  
          function renderPlaygroundTelemetryTimeseriesChart({
            ariaLabel,
            labels,
            series,
            emptyText,
            buildLinePath,
            getSeriesValue,
            getXAxisLabel,
            formatAxisValue,
            chartHeight,
            headerContent,
          }) {
            const normalizedLabels = Array.isArray(labels) ? labels : [];
            const normalizedSeries = Array.isArray(series) ? series.filter(Boolean) : [];
            if (!normalizedLabels.length || !normalizedSeries.length) {
              return React.createElement("div", { className: "playground-settings-usage-chart-empty" }, emptyText || "Select a metric");
            }
  
            const resolvedChartHeight = Math.max(120, Number(chartHeight || 178));
            const marginTop = 14;
            const marginRight = 10;
            const marginBottom = 28;
            const marginLeft = 58;
            const readValue = typeof getSeriesValue === "function"
              ? getSeriesValue
              : (entry, _label, index) => entry?.values?.[index];
            const renderXAxisLabel = typeof getXAxisLabel === "function"
              ? getXAxisLabel
              : (label) => String(label || "");
            const renderYAxisLabel = typeof formatAxisValue === "function"
              ? formatAxisValue
              : (value) => String(value);
  
            const maxValue = Math.max(
              1,
              ...normalizedSeries.flatMap((entry) =>
                normalizedLabels.map((label, index) => Math.max(0, Number(readValue(entry, label, index) || 0)))
              ),
            );
            return React.createElement("div", {
                className: "playground-database-overview-timeseries-card",
                "aria-label": ariaLabel || "Telemetry chart",
              },
              headerContent || null,
              React.createElement("div", { className: "playground-database-overview-timeseries-chart" },
                React.createElement(PlaygroundSettingsResponsiveSvg, {
                    frameClassName: "playground-database-overview-timeseries-frame",
                    frameHeight: resolvedChartHeight,
                    svgHeight: resolvedChartHeight,
                    fallbackWidth: 420,
                    ariaLabel: ariaLabel || "Telemetry chart",
                  }, ({ svgWidth, svgHeight }) => {
                    const plotWidth = svgWidth - marginLeft - marginRight;
                    const plotHeight = svgHeight - marginTop - marginBottom;
                    const baselineY = marginTop + plotHeight;
                    const slotWidth = plotWidth / Math.max(normalizedLabels.length - 1, 1);
                    const xForIndex = (index) => normalizedLabels.length === 1
                      ? marginLeft + plotWidth
                      : marginLeft + slotWidth * index;
                    const yAxisValues = [maxValue, Math.round(maxValue / 2), 0];
                    const visibleLabelIndexes = getSettingsVisibleChartLabelIndexes(
                      normalizedLabels,
                      Math.max(2, Math.floor(plotWidth / 84))
                    );
  
                    return React.createElement(React.Fragment, null,
                      Array.from({ length: 4 }).map((_, index) => {
                        const y = marginTop + (plotHeight / 3) * index;
                        return React.createElement("line", {
                          key: "grid:" + index,
                          className: "playground-database-overview-timeseries-grid-line",
                          x1: marginLeft,
                          y1: y,
                          x2: svgWidth - marginRight,
                          y2: y,
                        });
                      }),
                      yAxisValues.map((value, index) =>
                        React.createElement("text", {
                          key: "y-axis:" + index,
                          x: 0,
                          y: marginTop + (plotHeight / 2) * index + 4,
                          textAnchor: "start",
                          className: "playground-database-overview-timeseries-axis-label",
                          fontSize: "10",
                        }, renderYAxisLabel(value))
                      ),
                      normalizedSeries.map((entry) => {
                        const points = normalizedLabels.map((label, index) => ({
                          x: xForIndex(index),
                          y: baselineY - ((Math.max(0, Number(readValue(entry, label, index) || 0)) / maxValue) * plotHeight),
                        }));
                        const linePath = typeof buildLinePath === "function" ? buildLinePath(points) : "";
                        const lastPoint = points[points.length - 1] || null;
                        return React.createElement(React.Fragment, { key: "series:" + entry.key },
                          linePath
                            ? React.createElement("path", {
                                d: linePath,
                                className: "playground-database-overview-timeseries-line is-" + entry.tone,
                              })
                            : null,
                          lastPoint
                            ? React.createElement("circle", {
                                cx: lastPoint.x,
                                cy: lastPoint.y,
                                r: "3.5",
                                className: "playground-database-overview-timeseries-dot is-" + entry.tone,
                              })
                            : null
                        );
                      }),
                      normalizedLabels.map((label, index) => (
                        visibleLabelIndexes.has(index)
                          ? React.createElement("text", {
                              key: "label:" + index,
                              x: xForIndex(index),
                              y: svgHeight - 8,
                              textAnchor: index === 0 ? "start" : index === normalizedLabels.length - 1 ? "end" : "middle",
                              className: "playground-database-overview-timeseries-axis-label",
                              fontSize: "10",
                            }, renderXAxisLabel(label, index))
                          : null
                      ))
                    );
                  })
              )
            );
          }
  
          function renderSettingsUsageMixedChart(config) {
            const labels = Array.isArray(config?.labels) ? config.labels : [];
            const barValues = Array.isArray(config?.barValues) ? config.barValues : [];
            const lineValues = Array.isArray(config?.lineValues) ? config.lineValues : [];
            if (!labels.length || !barValues.length) {
              return React.createElement("div", { className: "playground-settings-usage-chart-empty" }, config?.emptyText || "No usage data in this period");
            }
  
            const chartFrameHeight = config?.tall ? 288 : 208;
            const baseSvgHeight = 240;
            const marginTop = 12;
            const marginRight = 14;
            const marginBottom = 38;
            const marginLeft = 58;
            const yMax = Math.max(1, Number(config?.yMax || 0));
            const gridLineCount = 4;
            const tickFormatter = typeof config?.tickFormatter === "function"
              ? config.tickFormatter
              : (value) => String(Math.round(value));
            const limitValue = Number(config?.limitValue);
            return React.createElement(PlaygroundSettingsResponsiveSvg, {
                frameClassName: "playground-settings-usage-chart-frame" + (config?.tall ? " is-tall" : ""),
                frameHeight: chartFrameHeight,
                svgHeight: baseSvgHeight,
                ariaLabel: config?.ariaLabel || "Usage chart",
              }, ({ svgWidth, svgHeight }) => {
                const plotWidth = svgWidth - marginLeft - marginRight;
                const plotHeight = svgHeight - marginTop - marginBottom;
                const slotWidth = plotWidth / Math.max(labels.length, 1);
                const barWidth = Math.min(24, Math.max(8, slotWidth * 0.56));
                const baselineY = marginTop + plotHeight;
                const visibleLabelIndexes = getSettingsVisibleChartLabelIndexes(
                  labels,
                  Math.max(2, Math.floor(plotWidth / 84))
                );
                const barRects = barValues.map((value, index) => {
                  const normalizedValue = Math.max(0, Number(value || 0));
                  const height = normalizedValue > 0 ? (normalizedValue / yMax) * plotHeight : 0;
                  return {
                    x: marginLeft + slotWidth * index + (slotWidth - barWidth) / 2,
                    y: baselineY - height,
                    width: barWidth,
                    height,
                  };
                });
                const linePoints = lineValues.reduce((points, value, index) => {
                  if (value == null || value === undefined || Number.isNaN(Number(value))) {
                    return points;
                  }
  
                  points.push({
                    x: marginLeft + slotWidth * index + slotWidth / 2,
                    y: baselineY - (Math.max(0, Number(value)) / yMax) * plotHeight,
                  });
                  return points;
                }, []);
                const linePath = buildSettingsSvgLinePath(linePoints);
                const areaPath = buildSettingsSvgAreaPath(linePoints, baselineY);
                const hasLimitLine = Number.isFinite(limitValue) && limitValue > 0;
                const limitY = hasLimitLine
                  ? baselineY - (Math.min(limitValue, yMax) / yMax) * plotHeight
                  : baselineY;
  
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
                        y: y + 3,
                        textAnchor: "start",
                        fill: "rgba(255,255,255,0.4)",
                        fontSize: "10",
                      }, tickFormatter(tickValue))
                    );
                  }),
                  hasLimitLine
                    ? React.createElement(React.Fragment, null,
                        React.createElement("line", {
                          x1: marginLeft,
                          y1: limitY,
                          x2: svgWidth - marginRight,
                          y2: limitY,
                          stroke: "rgba(255,255,255,0.5)",
                          strokeWidth: "1",
                          strokeDasharray: "6 6",
                        }),
                        React.createElement("rect", {
                          x: svgWidth - marginRight - 122,
                          y: Math.max(marginTop, limitY - 18),
                          width: "118",
                          height: "16",
                          rx: "4",
                          fill: "rgba(255,255,255,1)",
                        }),
                        React.createElement("text", {
                          x: svgWidth - marginRight - 63,
                          y: Math.max(marginTop + 11, limitY - 7),
                          textAnchor: "middle",
                          fill: "#000",
                          fontSize: "10",
                          fontWeight: "500",
                        }, config?.limitLabel || ("Limit: " + tickFormatter(limitValue)))
                      )
                    : null,
                  areaPath
                    ? React.createElement("path", {
                        d: areaPath,
                        fill: config?.areaColor || "rgba(24,59,184,0.10)",
                      })
                    : null,
                  barRects.map((bar, index) =>
                    React.createElement("rect", {
                      key: "bar:" + index,
                      x: bar.x,
                      y: bar.y,
                      width: bar.width,
                      height: Math.max(bar.height, 1),
                      rx: "3",
                      fill: config?.barColor || "rgb(143,196,255)",
                    })
                  ),
                  linePath
                    ? React.createElement("path", {
                        d: linePath,
                        fill: "none",
                        stroke: config?.lineColor || "rgb(24,59,184)",
                        strokeWidth: "2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      })
                    : null,
                  labels.map((label, index) => {
                    if (!visibleLabelIndexes.has(index)) {
                      return null;
                    }
  
                    return React.createElement("text", {
                      key: "label:" + index,
                      x: marginLeft + slotWidth * index + slotWidth / 2,
                      y: svgHeight - 10,
                      textAnchor: "middle",
                      fill: "rgba(255,255,255,0.4)",
                      fontSize: "10",
                    }, label);
                  })
                );
              }
            );
          }
  
          function renderSettingsUsageStackedChart(config) {
            const labels = Array.isArray(config?.labels) ? config.labels : [];
            const primaryValues = Array.isArray(config?.primaryValues) ? config.primaryValues : [];
            const secondaryValues = Array.isArray(config?.secondaryValues) ? config.secondaryValues : [];
            if (!labels.length || !primaryValues.length) {
              return React.createElement("div", { className: "playground-settings-usage-chart-empty" }, config?.emptyText || "No usage data in this period");
            }
  
            const chartFrameHeight = 208;
            const baseSvgHeight = 210;
            const marginTop = 12;
            const marginRight = 14;
            const marginBottom = 38;
            const marginLeft = 34;
            const totals = labels.map((_, index) => Math.max(0, Number(primaryValues[index] || 0)) + Math.max(0, Number(secondaryValues[index] || 0)));
            const yMax = Math.max(1, Number(config?.yMax || Math.max(...totals, 1)));
            return React.createElement(PlaygroundSettingsResponsiveSvg, {
                frameClassName: "playground-settings-usage-chart-frame is-medium",
                frameHeight: chartFrameHeight,
                svgHeight: baseSvgHeight,
                ariaLabel: config?.ariaLabel || "Usage breakdown chart",
              }, ({ svgWidth, svgHeight }) => {
                const plotWidth = svgWidth - marginLeft - marginRight;
                const plotHeight = svgHeight - marginTop - marginBottom;
                const slotWidth = plotWidth / Math.max(labels.length, 1);
                const barWidth = Math.min(22, Math.max(8, slotWidth * 0.56));
                const baselineY = marginTop + plotHeight;
                const visibleLabelIndexes = getSettingsVisibleChartLabelIndexes(
                  labels,
                  Math.max(2, Math.floor(plotWidth / 84))
                );
  
                return React.createElement(React.Fragment, null,
                  Array.from({ length: 5 }).map((_, index) => {
                    const y = marginTop + (plotHeight / 4) * index;
                    return React.createElement("line", {
                      key: "grid:" + index,
                      x1: marginLeft,
                      y1: y,
                      x2: svgWidth - marginRight,
                      y2: y,
                      stroke: "rgba(255,255,255,0.10)",
                      strokeWidth: "1",
                    });
                  }),
                  labels.map((label, index) => {
                    const primary = Math.max(0, Number(primaryValues[index] || 0));
                    const secondary = Math.max(0, Number(secondaryValues[index] || 0));
                    const secondaryHeight = secondary > 0 ? (secondary / yMax) * plotHeight : 0;
                    const primaryHeight = primary > 0 ? (primary / yMax) * plotHeight : 0;
                    const x = marginLeft + slotWidth * index + (slotWidth - barWidth) / 2;
                    const secondaryY = baselineY - secondaryHeight;
                    const primaryY = secondaryY - primaryHeight;
  
                    return React.createElement(React.Fragment, { key: "stack:" + index },
                      React.createElement("rect", {
                        x,
                        y: secondaryY,
                        width: barWidth,
                        height: Math.max(secondaryHeight, 1),
                        rx: "3",
                        fill: config?.secondaryColor || "rgb(150,150,150)",
                      }),
                      React.createElement("rect", {
                        x,
                        y: primaryY,
                        width: barWidth,
                        height: Math.max(primaryHeight, 1),
                        rx: "3",
                        fill: config?.primaryColor || "rgb(255,255,255)",
                      }),
                      visibleLabelIndexes.has(index)
                        ? React.createElement("text", {
                            x: marginLeft + slotWidth * index + slotWidth / 2,
                            y: svgHeight - 10,
                            textAnchor: "middle",
                            fill: "rgba(255,255,255,0.4)",
                            fontSize: "9",
                          }, label)
                        : null
                    );
                  })
                );
              }
            );
          }
  
          function renderSettingsUsageMultiStackedChart(config) {
            const labels = Array.isArray(config?.labels) ? config.labels : [];
            const series = Array.isArray(config?.series)
              ? config.series.filter((entry) => entry && Array.isArray(entry.values))
              : [];
            if (!labels.length || !series.length) {
              return config?.emptyContent || React.createElement("div", { className: "playground-settings-usage-chart-empty" + (config?.tall ? " is-tall" : "") }, config?.emptyText || "No usage data in this period");
            }
  
            const chartFrameHeight = Number(config?.tall) ? 288 : 228;
            const baseSvgHeight = Number(config?.tall) ? 252 : 220;
            const marginTop = 12;
            const marginRight = 14;
            const marginBottom = 38;
            const marginLeft = 58;
            const totals = labels.map((_, index) =>
              series.reduce((sum, entry) => sum + Math.max(0, Number(entry.values[index] || 0)), 0)
            );
            const yMax = Math.max(1, Number(config?.yMax || Math.max(...totals, 1)));
            const gridLineCount = 4;
            const tickFormatter = typeof config?.tickFormatter === "function"
              ? config.tickFormatter
              : (value) => String(Math.round(value));
            return React.createElement(PlaygroundSettingsResponsiveSvg, {
                frameClassName: "playground-settings-usage-chart-frame" + (config?.tall ? " is-tall" : ""),
                frameHeight: chartFrameHeight,
                svgHeight: baseSvgHeight,
                ariaLabel: config?.ariaLabel || "Usage chart",
              }, ({ svgWidth, svgHeight }) => {
                const plotWidth = svgWidth - marginLeft - marginRight;
                const plotHeight = svgHeight - marginTop - marginBottom;
                const slotWidth = plotWidth / Math.max(labels.length, 1);
                const barWidth = Math.min(24, Math.max(8, slotWidth * 0.56));
                const baselineY = marginTop + plotHeight;
                const visibleLabelIndexes = getSettingsVisibleChartLabelIndexes(
                  labels,
                  Math.max(2, Math.floor(plotWidth / 84))
                );
  
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
                        y: y + 3,
                        textAnchor: "start",
                        fill: "rgba(255,255,255,0.4)",
                        fontSize: "10",
                      }, tickFormatter(tickValue))
                    );
                  }),
                  labels.map((label, index) => {
                    const x = marginLeft + slotWidth * index + (slotWidth - barWidth) / 2;
                    let stackOffsetY = baselineY;
                    const stackRects = series.map((entry, seriesIndex) => {
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
                    });
  
                    return React.createElement(React.Fragment, { key: "stack:" + index },
                      stackRects,
                      visibleLabelIndexes.has(index)
                        ? React.createElement("text", {
                            x: marginLeft + slotWidth * index + slotWidth / 2,
                            y: svgHeight - 10,
                            textAnchor: "middle",
                            fill: "rgba(255,255,255,0.4)",
                            fontSize: "10",
                          }, label)
                        : null
                    );
                  })
                );
              }
            );
          }
  
          function renderSettingsUsageDonutChart(config) {
            const items = Array.isArray(config?.items) ? config.items.filter(Boolean) : [];
            const totalValue = Math.max(0, items.reduce((sum, item) => sum + Math.max(0, Number(item.value || 0)), 0));
            const hasData = items.length > 0 && totalValue > 0;
            const valueFormatter = typeof config?.valueFormatter === "function"
              ? config.valueFormatter
              : formatSettingsComputeTokens;
  
            const renderArcPath = (cx, cy, innerRadius, outerRadius, startAngle, endAngle) => {
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
            };
  
            const renderLegendColumn = (legendItems, className) =>
              React.createElement("div", { className }, legendItems.map((item) =>
                React.createElement("div", { key: "legend:" + (item.id || item.label), className: "playground-settings-usage-donut-legend-item" },
                  React.createElement("span", {
                    className: "playground-settings-usage-legend-swatch",
                    style: { background: item.color },
                  }),
                  React.createElement("div", { className: "playground-settings-usage-donut-legend-copy" },
                    React.createElement("div", { className: "playground-settings-usage-donut-label" }, item.label),
                    React.createElement("div", { className: "playground-settings-usage-donut-value" }, valueFormatter(item.value || 0))
                  )
                )
              ));
  
            return React.createElement("div", { className: "playground-settings-usage-donut-layout" },
              React.createElement(PlaygroundSettingsResponsiveSvg, {
                  frameClassName: "playground-settings-usage-donut-frame",
                  frameHeight: 264,
                  svgHeight: 264,
                  fallbackWidth: 264,
                  ariaLabel: config?.ariaLabel || "Usage by source",
                }, ({ svgWidth, svgHeight }) => {
                  const cx = svgWidth / 2;
                  const cy = svgHeight / 2;
                  const outerRadius = Math.min(svgWidth, svgHeight) * 0.38;
                  const innerRadius = outerRadius * 0.58;
                  const trackRadius = (outerRadius + innerRadius) / 2;
                  const trackStrokeWidth = outerRadius - innerRadius;
                  let currentAngle = -Math.PI / 2;
  
                  return React.createElement(React.Fragment, null,
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
                      className: "playground-settings-usage-donut-center-label",
                    }, config?.centerLabel || "Total cost"),
                    React.createElement("text", {
                      x: cx,
                      y: cy + 6,
                      textAnchor: "middle",
                      className: "playground-settings-usage-donut-center-value",
                    }, config?.centerValue || formatSettingsComputeTokens(totalValue)),
                  );
                }),
              items.length > 0
                ? renderLegendColumn(items, "playground-settings-usage-donut-column is-right")
                : null
            );
          }
  
          function renderSettingsUsageSourceBreakdown(items) {
            if (!Array.isArray(items) || items.length === 0) {
              return React.createElement("div", { className: "playground-settings-usage-chart-empty" }, "No source usage data in this period");
            }
  
            const maxValue = Math.max(...items.map((item) => Number(item?.totalCT || 0)), 1);
            return React.createElement("div", { className: "playground-settings-usage-source-list" },
              items.map((item) => {
                const width = Math.max(3, Math.round((Number(item?.totalCT || 0) / maxValue) * 100));
                return React.createElement("div", { key: item.id || item.name, className: "playground-settings-usage-source-row" },
                  React.createElement("div", { className: "playground-settings-usage-source-row-top" },
                    React.createElement("div", { className: "playground-settings-usage-source-label" }, item.displayName || item.name || item.id || "Unattributed"),
                    React.createElement("div", { className: "playground-settings-usage-source-value" }, formatSettingsComputeTokens(item.totalCT || 0))
                  ),
                  React.createElement("div", { className: "playground-settings-usage-source-track" },
                    React.createElement("span", {
                      className: "playground-settings-usage-source-fill",
                      style: {
                        width: String(width) + "%",
                        background: SETTINGS_CHANNEL_COLORS[item.channel] || SETTINGS_CHANNEL_COLORS.integrations,
                      },
                    })
                  )
                );
              })
            );
          }
  
          function renderSettingsUsageBalanceCard(config) {
            return React.createElement("section", {
                className: "playground-settings-usage-balance-card" + (config.noBar ? " is-static" : "") + (config.action ? " has-action" : ""),
              },
                React.createElement("div", { className: "playground-settings-usage-balance-card-top" },
                  React.createElement("div", { className: "playground-settings-usage-balance-card-label" }, config.title),
                  config.action
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-settings-usage-balance-card-action",
                        onClick: config.action,
                        "aria-label": config.actionLabel || config.title,
                      },
                        React.createElement(Plus, { width: 16, height: 16, strokeWidth: 2.2 })
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-settings-usage-balance-card-main" },
                  React.createElement("div", { className: "playground-settings-usage-balance-card-value" }, config.value),
                  config.subvalue
                    ? React.createElement("div", { className: "playground-settings-usage-balance-card-subvalue" }, config.subvalue)
                    : null
                ),
                config.noBar
                  ? null
                  : React.createElement("div", { className: "playground-settings-usage-balance-track" },
                      React.createElement("span", {
                        className: "playground-settings-usage-balance-fill" + (config.progressTone === "neutral" ? " is-neutral" : ""),
                        style: { width: String(clampSettingsPercentage(config.progress)) + "%" },
                      })
                    ),
                React.createElement("div", { className: "playground-settings-usage-balance-card-footer" }, config.footer)
              );
          }
  
          function renderSettingsIntegrationCard(config) {
            const Icon = config.icon;
            const isConnected = Boolean(config.status?.connected);
  
            return React.createElement("div", { className: "playground-settings-integration-card", key: config.id },
              React.createElement("div", { className: "playground-settings-integration-card-row" },
                React.createElement("div", {
                  className: "playground-settings-integration-icon is-" + config.id,
                },
                  Icon
                    ? React.createElement(Icon, { width: 18, height: 18, strokeWidth: 1.8 })
                    : null
                ),
                React.createElement("div", { className: "playground-settings-integration-main" },
                  React.createElement("div", { className: "playground-settings-integration-top" },
                    React.createElement("h4", { className: "playground-settings-integration-title" }, config.label),
                    isConnected
                      ? React.createElement("div", { className: "playground-settings-integration-account-group" },
                          config.accountNode
                            ? React.createElement("span", { className: "playground-settings-integration-account" }, config.accountNode)
                            : null,
                          React.createElement("button", {
                            type: "button",
                            onClick: config.onDisconnect,
                            className: "playground-settings-integration-unlink",
                          },
                            React.createElement("span", null, config.disconnectLabel || "Disconnect")
                          )
                        )
                      : null
                  ),
                  React.createElement("p", { className: "playground-settings-integration-copy" }, config.description),
                  config.isLoading
                    ? React.createElement("div", { className: "playground-settings-integration-loading" },
                        React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                      )
                    : isConnected
                      ? config.connectedContent
                      : config.disconnectedContent
                )
              )
            );
          }
  
          function renderPluginRowLogo(plugin) {
            if (plugin.icon) {
              const PluginIcon = plugin.icon;
              return React.createElement(PluginIcon, {
                className: "playground-plugin-row-logo",
                strokeWidth: 1.8,
              });
            }
  
            if (plugin.logoUrl) {
              return React.createElement("img", {
                src: plugin.logoUrl,
                alt: plugin.label,
                className: "playground-plugin-row-logo" + (plugin.id === "github" ? " is-github" : ""),
              });
            }
  
            return React.createElement("span", { className: "playground-plugin-row-fallback-logo" }, plugin.shortLabel || plugin.label.slice(0, 2));
          }
  
          function getPluginConnectionSummary(pluginId) {
            if (pluginId === "email") {
              if (settingsEmailStatus?.linked && settingsEmailStatus?.verified) {
                return settingsEmailStatus.email || "Connected";
              }
              if (settingsEmailStatus?.linked && !settingsEmailStatus?.verified) {
                return "Verification pending";
              }
              return "Not connected";
            }
            if (pluginId === "discord") {
              return settingsDiscordStatus?.linked && settingsDiscordStatus?.verified
                ? (settingsDiscordStatus?.discordUsername || "Connected")
                : "Not connected";
            }
            if (pluginId === "telegram") {
              return settingsTelegramStatus?.linked && settingsTelegramStatus?.verified
                ? getSettingsTelegramDisplayName(settingsTelegramStatus)
                : "Not connected";
            }
            if (pluginId === "github") {
              const profile = githubStatus?.profile || {};
              return githubStatus?.connected
                ? (profile.login || profile.email || profile.name || "Connected")
                : "Not connected";
            }
            if (pluginId === "google-drive") {
              const profile = googleDriveStatus?.profile || {};
              return googleDriveStatus?.connected
                ? (profile.email || profile.username || "Connected")
                : "Not connected";
            }
            if (pluginId === "gmail") {
              const profile = gmailStatus?.profile || {};
              return gmailStatus?.connected
                ? (profile.email || profile.username || "Connected")
                : "Not connected";
            }
            if (pluginId === "one-drive") {
              const profile = oneDriveStatus?.profile || {};
              return oneDriveStatus?.connected
                ? (profile.email || profile.username || "Connected")
                : "Not connected";
            }
            if (pluginId === "notion") {
              const profile = notionStatus?.profile || {};
              return notionStatus?.connected
                ? (profile.workspaceName || profile.name || profile.email || "Connected")
                : "Not connected";
            }
            if (pluginId === "gitlab") {
              return "Available via webhooks";
            }
            return "Not connected";
          }
  
  	        function getPluginStaticDetail(pluginId) {
  	          switch (String(pluginId || "").trim().toLowerCase()) {
              case "github":
                return {
                  categoryLabel: "Workspace Integration",
                  functionsLabel: "Browse, Review, Trigger",
                  samplePrompt: "Inspect open PRs, triage issues, debug failing checks, and prepare code changes for review.",
                  whenToUse: "Use GitHub when agents need repository context, pull request history, issues, or CI state directly inside ACP workspaces.",
                  websiteUrl: "https://github.com/",
                  termsUrl: "https://docs.github.com/en/site-policy/github-terms/github-terms-of-service",
                  privacyUrl: "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
                  features: [
                    { id: "github-app", title: "GitHub", kind: "App", description: "Access repositories, issues, and pull requests directly inside ACP.", iconKey: "app" },
                    { id: "github-review", title: "Review Follow-up", kind: "Skill", description: "Address actionable pull request feedback with targeted edits.", iconKey: "skill" },
                    { id: "github-ci", title: "CI Debug", kind: "Skill", description: "Inspect failing GitHub Actions checks and summarize root causes.", iconKey: "skill" },
                    { id: "github-publish", title: "Publish Changes", kind: "Skill", description: "Commit, push, and open a pull request from ACP workspaces.", iconKey: "skill" },
                  ],
                };
              case "gitlab":
                return {
                  categoryLabel: "Automation Endpoint",
                  functionsLabel: "Webhook, Trigger, Comment",
                  samplePrompt: "Route merge request events into ACP, analyze failures, and post targeted follow-ups back into GitLab.",
                  whenToUse: "Use GitLab when external repository events should trigger ACP threads or when merge requests need automated analysis and responses.",
                  websiteUrl: "https://about.gitlab.com/",
                  termsUrl: "https://about.gitlab.com/terms/",
                  privacyUrl: "https://about.gitlab.com/privacy/",
                  features: [
                    { id: "gitlab-webhook", title: "GitLab", kind: "Webhook", description: "Receive push, merge request, note, and pipeline events inside ACP.", iconKey: "workflow" },
                    { id: "gitlab-threads", title: "Thread Trigger", kind: "Workflow", description: "Start ACP threads automatically from GitLab activity.", iconKey: "workflow" },
                    { id: "gitlab-comments", title: "Merge Request Follow-up", kind: "Workflow", description: "Send structured comments and summaries back to merge requests.", iconKey: "workflow" },
                  ],
                };
              case "notion":
                return {
                  categoryLabel: "Workspace Integration",
                  functionsLabel: "Search, Reference, Context",
                  samplePrompt: "Pull the latest planning docs from Notion, extract the open decisions, and turn them into executable ACP tasks.",
                  whenToUse: "Use Notion when agents need live workspace knowledge from pages and databases while staying inside ACP.",
                  websiteUrl: "https://www.notion.com/",
                  termsUrl: "https://www.notion.so/product/terms-and-privacy",
                  privacyUrl: "https://www.notion.so/privacy",
                  features: [
                    { id: "notion-app", title: "Notion", kind: "App", description: "Browse connected pages and databases from ACP.", iconKey: "app" },
                    { id: "notion-pages", title: "Page Context", kind: "Skill", description: "Reference workspace documents during agent runs.", iconKey: "skill" },
                    { id: "notion-databases", title: "Database Reference", kind: "Skill", description: "Work with structured Notion records as live context.", iconKey: "skill" },
                  ],
                };
              case "google-drive":
                return {
                  categoryLabel: "Workspace Integration",
                  functionsLabel: "Browse, Import, Context",
                  samplePrompt: "Open the shared product brief from Google Drive, summarize missing requirements, and attach the file to the current thread.",
                  whenToUse: "Use Google Drive when agents need to browse, preview, and import Drive files directly into ACP work.",
                  websiteUrl: "https://workspace.google.com/products/drive/",
                  termsUrl: "https://policies.google.com/terms",
                  privacyUrl: "https://policies.google.com/privacy",
                  features: [
                    { id: "drive-app", title: "Google Drive", kind: "App", description: "Browse folders and files from connected Drive accounts.", iconKey: "app" },
                    { id: "drive-import", title: "File Import", kind: "Skill", description: "Bring selected Drive files into ACP tasks and threads.", iconKey: "skill" },
                    { id: "drive-access", title: "Access Manager", kind: "Flow", description: "Review and reconnect granted Drive permissions from ACP.", iconKey: "workflow" },
                  ],
                };
              case "gmail":
                return {
                  categoryLabel: "Communication Integration",
                  functionsLabel: "Read, Draft, Send",
                  samplePrompt: "Find recent customer replies in Gmail, summarize what needs action, and draft a short follow-up email.",
                  whenToUse: "Use Gmail when agents need inbox context or should send email from your connected Google Workspace account.",
                  websiteUrl: "https://mail.google.com/",
                  termsUrl: "https://policies.google.com/terms",
                  privacyUrl: "https://policies.google.com/privacy",
                  features: [
                    { id: "gmail-inbox", title: "Gmail", kind: "App", description: "Read message metadata and snippets from a connected Gmail inbox.", iconKey: "app" },
                    { id: "gmail-context", title: "Inbox Context", kind: "Skill", description: "Use recent email conversations as context for agent work.", iconKey: "skill" },
                    { id: "gmail-send", title: "Send Email", kind: "Action", description: "Send follow-up messages through the connected Gmail account.", iconKey: "workflow" },
                  ],
                };
              case "one-drive":
                return {
                  categoryLabel: "Workspace Integration",
                  functionsLabel: "Browse, Import, Context",
                  samplePrompt: "Load the planning deck from OneDrive, extract the unresolved decisions, and prepare a follow-up task list.",
                  whenToUse: "Use OneDrive when ACP needs Microsoft-hosted files and folders as live context or task attachments.",
                  websiteUrl: "https://www.microsoft.com/microsoft-365/onedrive/online-cloud-storage",
                  termsUrl: "https://www.microsoft.com/servicesagreement",
                  privacyUrl: "https://privacy.microsoft.com/privacystatement",
                  features: [
                    { id: "onedrive-app", title: "OneDrive", kind: "App", description: "Browse connected OneDrive folders and files inside ACP.", iconKey: "app" },
                    { id: "onedrive-import", title: "Document Import", kind: "Skill", description: "Attach Microsoft-hosted documents to active ACP work.", iconKey: "skill" },
                    { id: "onedrive-access", title: "Access Sync", kind: "Flow", description: "Maintain granted OneDrive permissions from ACP.", iconKey: "workflow" },
                  ],
                };
              case "discord":
                return {
                  categoryLabel: "External Agent Channel",
                  functionsLabel: "Chat, Trigger, Notify",
                  samplePrompt: "Ask ACP from Discord to run a task, follow execution progress, and receive the final result back in the same channel.",
                  whenToUse: "Use Discord when you want to interact with ACP agents from an external chat surface instead of staying inside the platform.",
                  websiteUrl: "https://discord.com/",
                  termsUrl: "https://discord.com/terms",
                  privacyUrl: "https://discord.com/privacy",
                  features: [
                    { id: "discord-bot", title: "Discord", kind: "Bot", description: "Run ACP tasks from Discord slash commands and message flows.", iconKey: "channel" },
                    { id: "discord-routing", title: "Command Routing", kind: "Flow", description: "Route external Discord requests into ACP agents and environments.", iconKey: "workflow" },
                    { id: "discord-notifications", title: "Notifications", kind: "Flow", description: "Send run status updates and completion events back to Discord.", iconKey: "channel" },
                  ],
                };
              case "telegram":
                return {
                  categoryLabel: "External Agent Channel",
                  functionsLabel: "Chat, Trigger, Notify",
                  samplePrompt: "Message the ACP Telegram bot to start a run, check status, or continue a thread while staying outside the ACP UI.",
                  whenToUse: "Use Telegram when you need a lightweight external channel for ACP task execution, follow-ups, and status checks.",
                  websiteUrl: "https://telegram.org/",
                  termsUrl: "https://telegram.org/tos",
                  privacyUrl: "https://telegram.org/privacy",
                  features: [
                    { id: "telegram-bot", title: "Telegram", kind: "Bot", description: "Send ACP tasks and follow-ups through the Telegram bot.", iconKey: "channel" },
                    { id: "telegram-routing", title: "Command Routing", kind: "Flow", description: "Route Telegram requests into ACP agents and threads.", iconKey: "workflow" },
                    { id: "telegram-link", title: "Verification Link", kind: "Flow", description: "Link Telegram to ACP with a short verification code.", iconKey: "workflow" },
                  ],
                };
              case "email":
                return {
                  categoryLabel: "External Agent Channel",
                  functionsLabel: "Inbox, Reply, Attachments",
                  samplePrompt: "Send a task to ACP by email, attach files, and continue the same thread by replying from your inbox.",
                  whenToUse: "Use Email when work should start from an external inbox and continue through replies, attachments, and agent follow-ups.",
                  websiteUrl: "https://computer-agents.com/",
                  termsUrl: "https://computer-agents.com/terms",
                  privacyUrl: "https://computer-agents.com/privacy",
                  features: [
                    { id: "email-inbox", title: "Agent Inbox", kind: "Channel", description: "Send tasks to ACP through a dedicated agent email address.", iconKey: "channel" },
                    { id: "email-replies", title: "Reply Continuation", kind: "Flow", description: "Continue existing ACP threads by replying to previous emails.", iconKey: "workflow" },
                    { id: "email-attachments", title: "Attachment Ingestion", kind: "Flow", description: "Bring files and images from email directly into ACP tasks.", iconKey: "workflow" },
                  ],
                };
              default:
                return {
                  categoryLabel: "Workspace Integration",
                  functionsLabel: "Connect, Trigger",
                  samplePrompt: "Use this plugin from ACP to move context and actions between your external system and active work.",
                  whenToUse: "Use this plugin when ACP needs direct context or an external trigger path for the current workflow.",
                  websiteUrl: "",
                  termsUrl: "",
                  privacyUrl: "",
                  features: [],
                };
  	          }
  	        }
  
  	        function getPluginIntegrationManifest(pluginId) {
  	          const normalizedId = String(pluginId || "").trim().toLowerCase();
  	          const capabilityDefaults = {
  	            agentActions: {
  	              id: "agentActions",
  	              title: "Agents can use it",
  	              description: "Run read or write actions from inside ACP threads.",
  	              icon: Bot,
  	              supported: false,
  	              planned: false,
  	            },
  	            externalTriggers: {
  	              id: "externalTriggers",
  	              title: "Starts work externally",
  	              description: "Let the external system start or continue ACP threads.",
  	              icon: Webhook,
  	              supported: false,
  	              planned: false,
  	            },
  	            context: {
  	              id: "context",
  	              title: "Provides context",
  	              description: "Attach live files, records, messages, or events to agent work.",
  	              icon: Layers,
  	              supported: false,
  	              planned: false,
  	            },
  	            notifications: {
  	              id: "notifications",
  	              title: "Sends updates",
  	              description: "Deliver run status, summaries, or follow-ups back to the connected system.",
  	              icon: Bell,
  	              supported: false,
  	              planned: false,
  	            },
  	          };
  	          const manifests = {
  	            github: {
  	              authMethod: "GitHub App",
  	              workflowMode: "Workspace actions + webhooks",
  	              workflowDescription: "Agents can inspect and update repositories while repository events can start ACP workflows.",
  	              capabilities: {
  	                agentActions: { supported: true, description: "Agents can inspect repositories, issues, PRs, branches, and CI state." },
  	                externalTriggers: { supported: true, description: "Repository events can trigger or continue ACP workflows through webhooks." },
  	                context: { supported: true, description: "Code, reviews, issues, and build logs can become task context." },
  	                notifications: { supported: true, description: "Agents can post requested comments, reviews, and pull request updates." },
  	              },
  	              permissions: [
  	                { id: "read", title: "Read repositories", description: "Repository files, issues, pull requests, branches, and CI metadata." },
  	                { id: "write", title: "Write repository updates", description: "Comments, commits, pull requests, and review follow-ups when requested." },
  	                { id: "trigger", title: "Receive repository events", description: "GitHub webhook events can start or continue structured agent work." },
  	              ],
  	            },
  	            gitlab: {
  	              authMethod: "Webhook secret",
  	              workflowMode: "External workflow trigger",
  	              workflowDescription: "GitLab events can enter ACP through webhook endpoints; direct GitLab browsing is not enabled yet.",
  	              capabilities: {
  	                agentActions: { planned: true, description: "Direct GitLab browsing from ACP is planned for a future connector version." },
  	                externalTriggers: { supported: true, title: "Webhook-triggered work", description: "Merge requests, notes, pushes, and pipelines can route into ACP." },
  	                context: { supported: true, description: "Event payloads and merge request metadata are carried into the new thread." },
  	                notifications: { supported: true, description: "Webhook workflows can post structured follow-ups back to GitLab." },
  	              },
  	              permissions: [
  	                { id: "trigger", title: "Receive GitLab events", description: "Push, note, pipeline, and merge request payloads." },
  	                { id: "write", title: "Post merge request follow-ups", description: "Structured comments and summaries back to GitLab." },
  	              ],
  	            },
  	            notion: {
  	              authMethod: "OAuth",
  	              workflowMode: "Workspace context",
  	              workflowDescription: "Agents can use selected Notion pages and databases as live project and thread context.",
  	              capabilities: {
  	                agentActions: { supported: true, description: "Agents can search connected pages and databases while working." },
  	                externalTriggers: { planned: true, description: "Notion events do not start ACP work yet." },
  	                context: { supported: true, description: "Pages and database records can be referenced as workspace context." },
  	              },
  	              permissions: [
  	                { id: "read", title: "Read pages and databases", description: "Connected Notion workspace content used as context." },
  	                { id: "context", title: "Use workspace knowledge", description: "Reference pages and records in active tasks." },
  	              ],
  	            },
  	            "google-drive": {
  	              authMethod: "OAuth",
  	              workflowMode: "Workspace files",
  	              workflowDescription: "Agents can browse and import granted Drive files as task, project, and thread context.",
  	              capabilities: {
  	                agentActions: { supported: true, description: "Agents can browse and read files you grant from Google Drive." },
  	                externalTriggers: { planned: true, description: "Drive activity does not start ACP work yet." },
  	                context: { supported: true, description: "Documents, spreadsheets, PDFs, and images can be attached to tasks." },
  	              },
  	              permissions: [
  	                { id: "read", title: "Read granted files", description: "Files and folders selected through Google Drive access." },
  	                { id: "context", title: "Attach documents", description: "Bring Drive files into agent tasks and project context." },
  	              ],
  	            },
  	            gmail: {
  	              authMethod: "OAuth",
  	              workflowMode: "Workspace actions",
  	              workflowDescription: "Agents can search inbox context and send requested follow-up messages from Gmail.",
  	              capabilities: {
  	                agentActions: { supported: true, description: "Agents can search inbox threads, summarize messages, and send replies." },
  	                externalTriggers: { planned: true, description: "Incoming Gmail triggers are not enabled yet." },
  	                context: { supported: true, description: "Email threads can be used as evidence and follow-up context." },
  	                notifications: { supported: true, description: "Follow-up messages can be sent from the connected Gmail account." },
  	              },
  	              permissions: [
  	                { id: "read", title: "Read messages", description: "Search message metadata, snippets, and conversation context." },
  	                { id: "write", title: "Send messages", description: "Send requested follow-up emails from the connected account." },
  	              ],
  	            },
  	            "one-drive": {
  	              authMethod: "OAuth",
  	              workflowMode: "Workspace files",
  	              workflowDescription: "Agents can browse and import granted OneDrive files as task, project, and thread context.",
  	              capabilities: {
  	                agentActions: { supported: true, description: "Agents can browse and read Microsoft-hosted files you grant." },
  	                externalTriggers: { planned: true, description: "OneDrive events do not start ACP work yet." },
  	                context: { supported: true, description: "Files and folders can be attached to tasks as live context." },
  	              },
  	              permissions: [
  	                { id: "read", title: "Read granted files", description: "Files and folders selected from OneDrive." },
  	                { id: "context", title: "Attach documents", description: "Bring Microsoft-hosted files into agent tasks." },
  	              ],
  	            },
  	            discord: {
  	              authMethod: "Discord account link",
  	              workflowMode: "External agent channel",
  	              workflowDescription: "Discord can start ACP runs and receive updates; agent-side Discord read/write actions are separate from the trigger path.",
  	              capabilities: {
  	                agentActions: { planned: true, description: "Discord read/write actions from ACP are not enabled yet." },
  	                externalTriggers: { supported: true, description: "Slash commands and bot messages can start and monitor ACP work." },
  	                context: { supported: true, description: "Discord command details become context for the started thread." },
  	                notifications: { supported: true, description: "Run status updates and completions can be delivered back to Discord." },
  	              },
  	              permissions: [
  	                { id: "trigger", title: "Run slash commands", description: "Start tasks, check status, and receive updates in Discord." },
  	                { id: "notify", title: "Send run updates", description: "Deliver asynchronous run events back to Discord." },
  	              ],
  	            },
  	            telegram: {
  	              authMethod: "Bot verification code",
  	              workflowMode: "External agent channel",
  	              workflowDescription: "Telegram can start ACP runs, continue work, and receive status updates through the bot.",
  	              capabilities: {
  	                agentActions: { planned: true, description: "Telegram read/write actions from ACP are not enabled yet." },
  	                externalTriggers: { supported: true, description: "Bot commands can start runs, query status, and continue work." },
  	                context: { supported: true, description: "Telegram request text is attached to the thread as context." },
  	                notifications: { supported: true, description: "Run status updates and completions can be delivered back to Telegram." },
  	              },
  	              permissions: [
  	                { id: "trigger", title: "Run bot commands", description: "Start tasks and request run status from Telegram." },
  	                { id: "notify", title: "Send run updates", description: "Deliver asynchronous run events back to Telegram." },
  	              ],
  	            },
  	            email: {
  	              authMethod: "Email verification code",
  	              workflowMode: "External agent channel",
  	              workflowDescription: "Email can create or continue ACP work through messages, replies, and attachments.",
  	              capabilities: {
  	                agentActions: { planned: true, description: "Sending arbitrary outbound email from ACP uses Gmail instead." },
  	                externalTriggers: { supported: true, description: "Emails and replies can start or continue ACP threads." },
  	                context: { supported: true, description: "Email bodies and attachments are ingested as thread context." },
  	                notifications: { supported: true, description: "Verification and notification emails are sent through ACP." },
  	              },
  	              permissions: [
  	                { id: "trigger", title: "Start work by email", description: "Create tasks from email subject, body, and attachments." },
  	                { id: "context", title: "Continue by reply", description: "Replies can continue the same ACP thread." },
  	              ],
  	            },
  	          };
  	          const manifest = manifests[normalizedId] || {
  	            authMethod: "Connection flow",
  	            workflowMode: "Workspace integration",
  	            workflowDescription: "Connect this external system so ACP can exchange context, actions, or trigger events.",
  	            capabilities: {},
  	            permissions: [],
  	          };
  	          return {
  	            ...manifest,
  	            capabilities: ["agentActions", "externalTriggers", "context", "notifications"].map((key) => ({
  	              ...capabilityDefaults[key],
  	              ...((manifest.capabilities && manifest.capabilities[key]) || {}),
  	            })),
  	          };
  	        }
  
  	        function buildPluginsCatalog() {
            return [
              {
                id: "github",
                label: "GitHub",
                shortLabel: "GH",
                logoUrl: PLAYGROUND_GITHUB_LOGO_URL,
                description: "Browse repos, branches, and files inside ACP workspaces.",
                connected: Boolean(githubStatus?.connected),
                statusCopy: getPluginConnectionSummary("github"),
                category: "Source control",
                ...getPluginStaticDetail("github"),
                capabilities: [
                  "Browse repositories and branches in the file browser.",
                  "Read repository files and use them in agent tasks.",
                  "Use GitHub-based webhooks for pull request workflows.",
                ],
                actions: githubStatus?.connected
                  ? [{ label: "Disconnect GitHub", onClick: () => { void handleGithubAuthDisconnect(); }, tone: "destructive" }]
                  : [{ label: "Connect GitHub", onClick: () => { void handleGithubAuthConnect(); }, tone: "primary" }],
              },
              {
                id: "gitlab",
                label: "GitLab",
                shortLabel: "GL",
                logoUrl: "/img/04-skills/gitlab.svg",
                description: "Trigger threads and merge request comments from GitLab webhooks.",
                connected: false,
                statusCopy: getPluginConnectionSummary("gitlab"),
                category: "Automation",
                ...getPluginStaticDetail("gitlab"),
                capabilities: [
                  "Receive push, merge request, note, and pipeline events.",
                  "Start agent threads or comment back on merge requests.",
                  "Configure delivery through ACP webhook endpoints.",
                ],
                actions: [{ label: "Create GitLab Webhook", onClick: () => { setSelectedPluginId(""); openGitLabWebhookComposer(); }, tone: "primary" }],
              },
              {
                id: "notion",
                label: "Notion",
                shortLabel: "N",
                logoUrl: PLAYGROUND_NOTION_LOGO_URL,
                description: "Use connected Notion databases and pages inside agent work.",
                connected: Boolean(notionStatus?.connected),
                statusCopy: getPluginConnectionSummary("notion"),
                category: "Knowledge",
                ...getPluginStaticDetail("notion"),
                capabilities: [
                  "Browse Notion databases in the connector browser.",
                  "Reference workspace knowledge during tasks.",
                  "Keep structured docs available to agents.",
                ],
                actions: notionStatus?.connected
                  ? [{ label: "Disconnect Notion", onClick: () => { void handleNotionAuthDisconnect(); }, tone: "destructive" }]
                  : [{ label: "Connect Notion", onClick: () => { void handleNotionAuthConnect(); }, tone: "primary" }],
              },
              {
                id: "google-drive",
                label: "Google Drive",
                shortLabel: "GD",
                logoUrl: PLAYGROUND_GOOGLE_DRIVE_LOGO_URL,
                description: "Open Drive files directly in ACP and share them with agents.",
                connected: Boolean(googleDriveStatus?.connected),
                statusCopy: getPluginConnectionSummary("google-drive"),
                category: "Storage",
                ...getPluginStaticDetail("google-drive"),
                capabilities: [
                  "Browse files and folders from My Drive.",
                  "Download file previews into current tasks.",
                  "Manage granted file access from ACP.",
                ],
                actions: googleDriveStatus?.connected
                  ? [
                      { label: "Manage access", onClick: () => { void handleGoogleDriveManageAccess(); } },
                      { label: "Disconnect Google Drive", onClick: () => { void handleGoogleDriveAuthDisconnect(); }, tone: "destructive" },
                    ]
                  : [{ label: "Connect Google Drive", onClick: () => { void handleGoogleDriveAuthConnect(); }, tone: "primary" }],
              },
              {
                id: "gmail",
                label: "Gmail",
                shortLabel: "GM",
                logoUrl: PLAYGROUND_GMAIL_LOGO_URL,
                description: "Read and send Gmail messages from ACP workflows.",
                connected: Boolean(gmailStatus?.connected),
                statusCopy: getPluginConnectionSummary("gmail"),
                category: "Channels",
                ...getPluginStaticDetail("gmail"),
                capabilities: [
                  "Search and list Gmail messages for task context.",
                  "Summarize inbox threads before replying.",
                  "Send follow-up emails from the connected account.",
                ],
                actions: gmailStatus?.connected
                  ? [{ label: "Disconnect Gmail", onClick: () => { void handleGmailAuthDisconnect(); }, tone: "destructive" }]
                  : [{ label: "Connect Gmail", onClick: () => { void handleGmailAuthConnect(); }, tone: "primary" }],
              },
              {
                id: "one-drive",
                label: "OneDrive",
                shortLabel: "OD",
                logoUrl: PLAYGROUND_ONEDRIVE_LOGO_URL,
                description: "Access OneDrive folders and files from your ACP workspace.",
                connected: Boolean(oneDriveStatus?.connected),
                statusCopy: getPluginConnectionSummary("one-drive"),
                category: "Storage",
                ...getPluginStaticDetail("one-drive"),
                capabilities: [
                  "Browse folders and files from OneDrive.",
                  "Download documents into current agent tasks.",
                  "Keep Microsoft-hosted files available to ACP.",
                ],
                actions: oneDriveStatus?.connected
                  ? [{ label: "Disconnect OneDrive", onClick: () => { void handleOneDriveAuthDisconnect(); }, tone: "destructive" }]
                  : [{ label: "Connect OneDrive", onClick: () => { void handleOneDriveAuthConnect(); }, tone: "primary" }],
              },
            ];
          }
  
          function buildTagsCatalog() {
            return [
              {
                id: "discord",
                label: "Discord",
                shortLabel: "D",
                logoUrl: "/img/logos/discord.svg",
                description: "Run tasks and receive updates through Discord slash commands.",
                connected: Boolean(settingsDiscordStatus?.linked && settingsDiscordStatus?.verified),
                statusCopy: getPluginConnectionSummary("discord"),
                category: "Channels",
                ...getPluginStaticDetail("discord"),
                capabilities: [
                  "Run agent tasks from Discord slash commands.",
                  "Check status, recent runs, agents, and environments.",
                  "Receive asynchronous updates in Discord.",
                ],
                actions: settingsDiscordStatus?.linked && settingsDiscordStatus?.verified
                  ? [{ label: "Disconnect Discord", onClick: () => { void handleSettingsUnlinkDiscord(); }, tone: "destructive" }]
                  : [{ label: "Connect Discord", onClick: () => { void handleSettingsLinkDiscord(); }, tone: "primary" }],
              },
              {
                id: "telegram",
                label: "Telegram",
                shortLabel: "TG",
                logoUrl: "/img/logos/telegram.svg",
                description: "Run tasks and receive updates through the ACP Telegram bot.",
                connected: Boolean(settingsTelegramStatus?.linked && settingsTelegramStatus?.verified),
                statusCopy: getPluginConnectionSummary("telegram"),
                category: "Channels",
                ...getPluginStaticDetail("telegram"),
                capabilities: [
                  "Run agent tasks and query run status from Telegram.",
                  "Use the ACP bot to manage environments and agents.",
                  "Link the bot with a short verification code.",
                ],
                actions: settingsTelegramStatus?.linked && settingsTelegramStatus?.verified
                  ? [{ label: "Disconnect Telegram", onClick: () => { void handleSettingsUnlinkTelegram(); }, tone: "destructive" }]
                  : [{ label: "Open Telegram link flow", onClick: () => { setSelectedPluginId("telegram"); }, tone: "primary" }],
              },
              {
                id: "email",
                label: "Email",
                shortLabel: "EM",
                icon: Mail,
                description: "Send tasks, files, and replies through your ACP email channel.",
                connected: Boolean(settingsEmailStatus?.linked && settingsEmailStatus?.verified),
                statusCopy: getPluginConnectionSummary("email"),
                category: "Channels",
                ...getPluginStaticDetail("email"),
                capabilities: [
                  "Send tasks from email subject or body.",
                  "Attach files and continue existing threads by reply.",
                  "Receive verification and notification emails.",
                ],
                actions: settingsEmailStatus?.linked && settingsEmailStatus?.verified
                  ? [{ label: "Disconnect Email", onClick: () => { void handleSettingsUnlinkEmail(); }, tone: "destructive" }]
                  : [{ label: "Open email link flow", onClick: () => { setSelectedPluginId("email"); }, tone: "primary" }],
              },
            ];
          }
  
          function getPluginDetailConnectionState(plugin) {
            const pluginId = String(plugin?.id || "").trim().toLowerCase();
            if (pluginId === "email" && settingsEmailStatus?.linked && !settingsEmailStatus?.verified) {
              return {
                id: "pending",
                label: "Verification pending",
                copy: "Finish email verification before ACP can use this channel.",
                tone: "pending",
              };
            }
            if (pluginId === "telegram" && settingsTelegramStatus?.linked && !settingsTelegramStatus?.verified) {
              return {
                id: "pending",
                label: "Verification pending",
                copy: "Finish Telegram verification before ACP can use this channel.",
                tone: "pending",
              };
            }
            if (pluginId === "gitlab") {
              return {
                id: "webhook",
                label: "Webhook setup",
                copy: "Create a webhook endpoint and connect it from GitLab.",
                tone: "available",
              };
            }
            if (plugin?.connected) {
              return {
                id: "connected",
                label: "Connected",
                copy: plugin.statusCopy || "Connected to ACP.",
                tone: "connected",
              };
            }
            return {
              id: "not-connected",
              label: "Not connected",
              copy: "Connect this plugin before agents can use its protected data or actions.",
              tone: "inactive",
            };
          }
  
  	        function getPluginDetailAuthMethod(pluginId) {
  	          return getPluginIntegrationManifest(pluginId).authMethod || "Connection flow";
  	        }
  
  	        function getPluginDetailCapabilityCards(plugin) {
  	          return getPluginIntegrationManifest(plugin?.id).capabilities;
  	        }
  
  	        function getPluginDetailPermissionRows(plugin) {
  	          const manifestRows = getPluginIntegrationManifest(plugin?.id).permissions || [];
  	          return manifestRows.length ? manifestRows : (plugin.features || []).map((feature) => ({
  	            id: feature.id,
  	            title: feature.title,
  	            description: feature.description,
  	          }));
  	        }
  
          function getDefaultTagEnvironmentRecord() {
            return (Array.isArray(runtimeEnvironments) ? runtimeEnvironments : []).find((environment) => environment?.isDefault)
              || (Array.isArray(runtimeEnvironments) ? runtimeEnvironments : [])[0]
              || null;
          }
  
          function getTagProjectEnvironmentId(project) {
            if (!project) {
              return "";
            }
            const directDefaultEnvironmentId = String(project.defaultEnvironmentId || "").trim();
            if (directDefaultEnvironmentId) {
              return directDefaultEnvironmentId;
            }
            const directEnvironmentId = String(project.environmentId || "").trim();
            if (directEnvironmentId) {
              return directEnvironmentId;
            }
            const metadata = project.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
              ? project.metadata
              : null;
            const metadataDefaultEnvironmentId = metadata ? String(metadata.defaultEnvironmentId || "").trim() : "";
            if (metadataDefaultEnvironmentId) {
              return metadataDefaultEnvironmentId;
            }
            return metadata ? String(metadata.environmentId || "").trim() : "";
          }
  
          function createDefaultTagDetailConfig(tagId) {
            const normalizedTagId = String(tagId || "").trim().toLowerCase();
            const defaultEnvironment = getDefaultTagEnvironmentRecord();
            return {
              tagId: normalizedTagId,
              linked: false,
              verified: false,
              connectedIdentity: "",
              defaultEnvironmentId: defaultEnvironment?.id || "default",
              defaultEnvironmentName: defaultEnvironment?.name || "Default",
              defaultProjectId: "",
              defaultProjectName: "",
              instructions: "",
              permissionSet: createPlaygroundFullAccessPermissionSet("agent"),
              updatedAt: "",
            };
          }
  
          function normalizeTagDetailConfig(tagId, value) {
            const fallback = createDefaultTagDetailConfig(tagId);
            const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
            const permissionSetSource = source.permissionSet && typeof source.permissionSet === "object" && !Array.isArray(source.permissionSet)
              ? source.permissionSet
              : fallback.permissionSet;
            return {
              ...fallback,
              ...source,
              tagId: String(source.tagId || tagId || fallback.tagId).trim().toLowerCase(),
              linked: Boolean(source.linked),
              verified: Boolean(source.verified),
              connectedIdentity: String(source.connectedIdentity || source.email || ""),
              defaultEnvironmentId: String(source.defaultEnvironmentId || fallback.defaultEnvironmentId || ""),
              defaultEnvironmentName: String(source.defaultEnvironmentName || fallback.defaultEnvironmentName || ""),
              defaultProjectId: String(source.defaultProjectId || ""),
              defaultProjectName: String(source.defaultProjectName || ""),
              defaultAgentId: String(source.defaultAgentId || ""),
              defaultAgentName: String(source.defaultAgentName || ""),
              instructions: String(source.instructions || ""),
              permissionSet: normalizePlaygroundPermissionSet(permissionSetSource, "agent"),
              updatedAt: String(source.updatedAt || ""),
            };
          }
  
          function getCurrentTagDetailConfig(tagId) {
            const normalizedTagId = String(tagId || "").trim().toLowerCase();
            return normalizeTagDetailConfig(normalizedTagId, tagDetailConfigsById[normalizedTagId]);
          }
  
          function getTagDetailSaveState(tagId) {
            return tagDetailSaveStateById[String(tagId || "").trim().toLowerCase()] || { status: "idle", error: "" };
          }
  
          function setTagDetailSaveState(tagId, nextState) {
            const normalizedTagId = String(tagId || "").trim().toLowerCase();
            setTagDetailSaveStateById((current) => ({
              ...current,
              [normalizedTagId]: {
                ...(current[normalizedTagId] || { status: "idle", error: "" }),
                ...nextState,
              },
            }));
          }
  
          async function saveTagDetailConfig(tagId, config) {
            const normalizedTagId = String(tagId || "").trim().toLowerCase();
            if (!normalizedTagId || !hasSessionAuth) {
              return;
            }
            setTagDetailSaveState(normalizedTagId, { status: "saving", error: "" });
            try {
              const response = await fetch("/api/aios/user/tags/" + encodeURIComponent(normalizedTagId), {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  instructions: config.instructions || "",
                  defaultEnvironmentId: config.defaultEnvironmentId || "",
                  defaultEnvironmentName: config.defaultEnvironmentName || "",
                  defaultProjectId: config.defaultProjectId || "",
                  defaultProjectName: config.defaultProjectName || "",
                  defaultAgentId: config.defaultAgentId || "",
                  defaultAgentName: config.defaultAgentName || "",
                  permissionSet: normalizePlaygroundPermissionSet(config.permissionSet, "agent"),
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.error || data?.message || "Failed to save tag settings.");
              }
              const normalized = normalizeTagDetailConfig(normalizedTagId, data);
              setTagDetailConfigsById((current) => ({
                ...current,
                [normalizedTagId]: normalized,
              }));
              setTagDetailSaveState(normalizedTagId, { status: "saved", error: "" });
              window.setTimeout(() => {
                setTagDetailSaveStateById((current) => {
                  const currentState = current[normalizedTagId];
                  if (!currentState || currentState.status !== "saved") {
                    return current;
                  }
                  return {
                    ...current,
                    [normalizedTagId]: { status: "idle", error: "" },
                  };
                });
              }, 1600);
            } catch (error) {
              setTagDetailSaveState(normalizedTagId, {
                status: "error",
                error: error instanceof Error ? error.message : "Failed to save tag settings.",
              });
            }
          }
  
          function queueTagDetailConfigSave(tagId, nextConfig) {
            const normalizedTagId = String(tagId || "").trim().toLowerCase();
            if (!normalizedTagId || typeof window === "undefined") {
              return;
            }
            const currentTimer = tagDetailAutosaveTimersRef.current[normalizedTagId];
            if (currentTimer) {
              window.clearTimeout(currentTimer);
            }
            tagDetailAutosaveTimersRef.current[normalizedTagId] = window.setTimeout(() => {
              delete tagDetailAutosaveTimersRef.current[normalizedTagId];
              void saveTagDetailConfig(normalizedTagId, nextConfig);
            }, 650);
          }
  
          function commitTagDetailConfig(tagId, nextConfig, options = {}) {
            const normalizedTagId = String(tagId || "").trim().toLowerCase();
            if (!normalizedTagId) {
              return;
            }
            const normalized = normalizeTagDetailConfig(normalizedTagId, nextConfig);
            setTagDetailConfigsById((current) => ({
              ...current,
              [normalizedTagId]: normalized,
            }));
            if (options.save !== false) {
              queueTagDetailConfigSave(normalizedTagId, normalized);
            }
          }
  
          function updateTagDetailConfig(tagId, updater, options = {}) {
            const normalizedTagId = String(tagId || "").trim().toLowerCase();
            if (!normalizedTagId) {
              return;
            }
            const currentConfig = getCurrentTagDetailConfig(normalizedTagId);
            const nextConfig = typeof updater === "function"
              ? updater(currentConfig)
              : { ...currentConfig, ...(updater || {}) };
            commitTagDetailConfig(normalizedTagId, nextConfig, options);
          }
  
          async function loadTagDetailConfig(tagId, options = {}) {
            const normalizedTagId = String(tagId || "").trim().toLowerCase();
            if (!normalizedTagId) {
              return null;
            }
            if (!options.force && tagDetailConfigsById[normalizedTagId]) {
              return tagDetailConfigsById[normalizedTagId];
            }
            if (!hasSessionAuth) {
              const fallback = createDefaultTagDetailConfig(normalizedTagId);
              setTagDetailConfigsById((current) => ({
                ...current,
                [normalizedTagId]: fallback,
              }));
              return fallback;
            }
            setTagDetailLoadingId(normalizedTagId);
            try {
              const response = await fetch("/api/aios/user/tags/" + encodeURIComponent(normalizedTagId), {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.error || data?.message || "Failed to load tag settings.");
              }
              const normalized = normalizeTagDetailConfig(normalizedTagId, data);
              setTagDetailConfigsById((current) => ({
                ...current,
                [normalizedTagId]: normalized,
              }));
              return normalized;
            } catch (error) {
              setTagDetailSaveState(normalizedTagId, {
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load tag settings.",
              });
              const fallback = createDefaultTagDetailConfig(normalizedTagId);
              setTagDetailConfigsById((current) => ({
                ...current,
                [normalizedTagId]: current[normalizedTagId] || fallback,
              }));
              return null;
            } finally {
              setTagDetailLoadingId((current) => current === normalizedTagId ? "" : current);
            }
          }
  
          function updateTagPermissionRingAccess(tagId, ringId, access) {
            const normalizedRingId = normalizePlaygroundPermissionRingId(ringId, "");
            if (!normalizedRingId) {
              return;
            }
            const nextAccess = normalizePlaygroundPermissionAccess(access);
            updateTagDetailConfig(tagId, (current) => {
              const currentPermissionSet = normalizePlaygroundPermissionSet(current.permissionSet, "agent");
              const currentRings = currentPermissionSet.rings || createPlaygroundDefaultPermissionRings();
              const currentRingPolicy = currentRings[normalizedRingId] || {
                defaultAccess: getPlaygroundPermissionRingDefinition(normalizedRingId).defaultAccess,
              };
              return {
                ...current,
                permissionSet: {
                  ...currentPermissionSet,
                  version: 1,
                  subjectType: "agent",
                  rings: {
                    ...currentRings,
                    [normalizedRingId]: {
                      ...currentRingPolicy,
                      defaultAccess: nextAccess,
                    },
                  },
                },
              };
            });
          }
  
          function updateTagPermissionActionRing(tagId, actionId, ringId) {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            if (!actionDefinition) {
              return;
            }
            const nextRingId = normalizePlaygroundPermissionRingId(ringId, actionDefinition.ringId);
            updateTagDetailConfig(tagId, (current) => {
              const currentPermissionSet = normalizePlaygroundPermissionSet(current.permissionSet, "agent");
              const currentActions = currentPermissionSet.actions || createPlaygroundDefaultPermissionActions();
              const currentActionPolicy = currentActions[actionDefinition.id] || {
                ringId: actionDefinition.ringId,
              };
              const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
              return {
                ...current,
                permissionSet: {
                  ...currentPermissionSet,
                  version: 1,
                  subjectType: "agent",
                  actions: {
                    ...currentActions,
                    [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
                      currentPermissionSet,
                      actionDefinition,
                      currentActionPolicy,
                      explicitAccess,
                      nextRingId
                    ),
                  },
                },
              };
            });
          }
  
          function updateTagPermissionActionAccess(tagId, actionId, access) {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            if (!actionDefinition) {
              return;
            }
            const shouldInherit = !String(access || "").trim();
            const nextAccess = shouldInherit ? "" : normalizePlaygroundPermissionAccess(access);
            updateTagDetailConfig(tagId, (current) => {
              const currentPermissionSet = normalizePlaygroundPermissionSet(current.permissionSet, "agent");
              const currentActions = currentPermissionSet.actions || createPlaygroundDefaultPermissionActions();
              const currentActionPolicy = currentActions[actionDefinition.id] || {
                ringId: actionDefinition.ringId,
              };
              return {
                ...current,
                permissionSet: {
                  ...currentPermissionSet,
                  version: 1,
                  subjectType: "agent",
                  actions: {
                    ...currentActions,
                    [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
                      currentPermissionSet,
                      actionDefinition,
                      currentActionPolicy,
                      shouldInherit ? "" : nextAccess
                    ),
                  },
                },
              };
            });
          }
  
          function updateTagInstructionsValue(tagId, value) {
            const normalizedTagId = String(tagId || "").trim().toLowerCase();
            const nextValue = String(value ?? "");
            const currentConfig = getCurrentTagDetailConfig(normalizedTagId);
            const previousValue = String(currentConfig.instructions || "");
            if (previousValue === nextValue) {
              return;
            }
            updateTagDetailConfig(normalizedTagId, { instructions: nextValue });
          }
  
          function renderTagDetailBody(selectedTag) {
            if (!selectedTag) {
              return null;
            }
  
            const tagId = String(selectedTag.id || "").trim().toLowerCase();
            const tagConfig = getCurrentTagDetailConfig(tagId);
            const tagSaveState = getTagDetailSaveState(tagId);
            const tagManifest = getPluginIntegrationManifest(tagId);
            const isTagLoading = tagDetailLoadingId === tagId;
            const normalizedPermissionSet = normalizePlaygroundPermissionSet(tagConfig.permissionSet, "agent");
            const getLinkLabel = (url) => {
              const value = String(url || "").trim();
              if (!value) {
                return "";
              }
              try {
                const parsed = new URL(value);
                return (parsed.hostname + parsed.pathname).replace(/\/+$/, "");
              } catch (_error) {
                return value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
              }
            };
            const renderFeatureIcon = (feature) => {
              const iconKey = String(feature?.iconKey || "").trim().toLowerCase();
              const Icon = iconKey === "app"
                ? Grid3x3
                : iconKey === "workflow" || iconKey === "flow"
                  ? Webhook
                  : iconKey === "channel"
                    ? MessageSquare
                    : Layers;
              return React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.8 });
            };
            const renderTagProfileLogo = () => {
              if (selectedTag.logoUrl) {
                return React.createElement("img", {
                  className: "profile-editor-avatar-image",
                  src: selectedTag.logoUrl,
                  alt: selectedTag.label || "Tag",
                  draggable: "false",
                });
              }
              const Icon = selectedTag.icon || Tag;
              return React.createElement(Icon, { width: 23, height: 23, strokeWidth: 1.8 });
            };
            const tagHeaderButtonClass = "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-develop-server-metrics-add-button playground-plugin-detail-connect-button";
            const getTagConnectionButtonState = () => {
              if (tagId === "email") {
                return settingsEmailStatus?.linked && settingsEmailStatus?.verified
                  ? {
                      label: settingsIsUnlinkingEmail ? "Disconnecting..." : "Disconnect",
                      tone: "destructive",
                      disabled: settingsIsUnlinkingEmail,
                      onClick: () => { void handleSettingsUnlinkEmail(); },
                    }
                  : {
                      label: "Connect",
                      tone: "primary",
                      disabled: false,
                      onClick: () => setPluginDetailTab("tutorial"),
                    };
              }
              if (tagId === "telegram") {
                return settingsTelegramStatus?.linked && settingsTelegramStatus?.verified
                  ? {
                      label: settingsIsUnlinkingTelegram ? "Disconnecting..." : "Disconnect",
                      tone: "destructive",
                      disabled: settingsIsUnlinkingTelegram,
                      onClick: () => { void handleSettingsUnlinkTelegram(); },
                    }
                  : {
                      label: "Connect",
                      tone: "primary",
                      disabled: false,
                      onClick: () => setPluginDetailTab("tutorial"),
                    };
              }
              if (tagId === "discord") {
                return settingsDiscordStatus?.linked && settingsDiscordStatus?.verified
                  ? {
                      label: settingsIsUnlinkingDiscord ? "Disconnecting..." : "Disconnect",
                      tone: "destructive",
                      disabled: settingsIsUnlinkingDiscord,
                      onClick: () => { void handleSettingsUnlinkDiscord(); },
                    }
                  : {
                      label: settingsIsLinkingDiscord ? "Connecting..." : "Connect",
                      tone: "primary",
                      disabled: settingsIsLinkingDiscord,
                      onClick: () => { void handleSettingsLinkDiscord(); },
                    };
              }
              return null;
            };
            const renderTagConnectionButton = () => {
              const buttonState = getTagConnectionButtonState();
              if (!buttonState) {
                return null;
              }
              const ButtonComponent = buttonState.tone === "primary"
                ? PlatformPrimaryButton
                : PlatformSecondaryButton;
              return React.createElement(ButtonComponent, {
                type: "button",
                size: "small",
                className: tagHeaderButtonClass + (buttonState.tone === "destructive" ? " is-destructive" : ""),
                onClick: buttonState.onClick,
                disabled: buttonState.disabled,
              }, React.createElement("span", null, buttonState.label));
            };
            const renderTagSidebarToggleButton = () => React.createElement("button", {
                type: "button",
                className: "playground-project-overview-sidebar-toggle",
                onClick: () => setTagDetailSidebarCollapsed((current) => !current),
                title: tagDetailSidebarCollapsed ? "Show tag sidebar" : "Hide tag sidebar",
                "aria-label": tagDetailSidebarCollapsed ? "Show tag sidebar" : "Hide tag sidebar",
                "aria-pressed": tagDetailSidebarCollapsed ? "true" : "false",
              },
              React.createElement(PanelRight, {
                width: 15,
                height: 15,
                strokeWidth: 1.8,
              })
            );
            const tagProfileSection = React.createElement("div", { className: "playground-agents-profile-section playground-tags-detail-profile-section" },
              React.createElement("div", { className: "profile-editor-avatar-wrap playground-agents-profile-avatar-wrap" },
                React.createElement("div", { className: "profile-editor-avatar playground-agents-profile-avatar playground-tags-detail-profile-avatar" },
                  React.createElement("div", { className: "profile-editor-avatar-surface playground-tags-detail-avatar-surface" },
                    renderTagProfileLogo()
                  )
                )
              ),
              React.createElement("div", { className: "playground-agents-profile-copy" },
                React.createElement("div", { className: "playground-agents-profile-name-wrap" },
                  React.createElement("h1", {
                    className: "playground-content-title playground-tasks-detail-navbar-title-input playground-environments-editor-title-input playground-agents-profile-name-input playground-tags-detail-profile-title",
                    title: selectedTag.label || "Tag",
                  }, selectedTag.label || "Tag")
                )
              )
            );
            const readThreadMetadata = (thread) => (
              thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
                ? thread.metadata
                : {}
            );
            const readTagThreadCreatedAtMs = (thread) => {
              const timestamp = Date.parse(String(thread?.createdAt || thread?.updatedAt || ""));
              return Number.isFinite(timestamp) ? timestamp : null;
            };
            const readTagThreadTotalCT = (thread) => Math.max(0, Number(readSettingsComputeTokens(thread, "totalCT", "totalCost") || 0));
            const getTagThreadStatus = (thread) => String(thread?.status || thread?.state || thread?.phase || "").trim().toLowerCase();
            const isTagThreadCompleted = (thread) => {
              const status = getTagThreadStatus(thread);
              return status === "completed" || status === "complete" || status === "done" || status === "success" || status === "finished";
            };
            const isThreadForTag = (thread) => {
              const metadata = readThreadMetadata(thread);
              const emailMetadata = metadata.email && typeof metadata.email === "object" && !Array.isArray(metadata.email)
                ? metadata.email
                : null;
              const sourceValues = [
                thread?.source,
                thread?.channel,
                thread?.appId,
                metadata.source,
                metadata.channel,
                metadata.appId,
                metadata.tagId,
                metadata.integration,
              ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
              if (tagId === "email") {
                return sourceValues.some((value) => value === "email" || value === "mail")
                  || Boolean(emailMetadata)
                  || Boolean(metadata.replyToEmail || metadata.emailFrom || metadata.fromEmail);
              }
              if (tagId === "discord") {
                return sourceValues.includes("discord")
                  || Boolean(metadata.discord || metadata.discordChannelId || metadata.discordUserId);
              }
              if (tagId === "telegram") {
                return sourceValues.includes("telegram")
                  || Boolean(metadata.telegram || metadata.telegramChatId || metadata.telegramUserId);
              }
              return sourceValues.includes(tagId);
            };
            const tagDetailPerformanceRangeOptions = [
              { id: "day", label: "24H", bucketCount: 1 },
              { id: "week", label: "7D", bucketCount: 7 },
              { id: "month", label: "30D", bucketCount: 30 },
            ];
            const activeTagPerformanceRange = tagDetailPerformanceRangeOptions.find((option) => option.id === tagDetailPerformanceRange)
              || tagDetailPerformanceRangeOptions[2];
            const formatTagPerformanceInteger = (value) => Math.max(0, Math.round(Number(value || 0))).toLocaleString("en-US");
            const getTagLocalDayKey = (dateLike) => {
              const date = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
              if (Number.isNaN(date.getTime())) {
                return "";
              }
              return [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0"),
              ].join("-");
            };
            const tagPerformanceBuckets = (() => {
              const now = new Date();
              const endDate = new Date(now);
              endDate.setHours(0, 0, 0, 0);
              return Array.from({ length: Math.max(1, Number(activeTagPerformanceRange.bucketCount || 30)) }, (_, index) => {
                const date = new Date(endDate);
                date.setDate(endDate.getDate() - (Math.max(1, Number(activeTagPerformanceRange.bucketCount || 30)) - 1 - index));
                const startMs = date.getTime();
                return {
                  key: getTagLocalDayKey(date),
                  label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  startMs,
                  endMs: startMs + 24 * 60 * 60 * 1000,
                  runCount: 0,
                  completedCount: 0,
                  totalCT: 0,
                };
              });
            })();
            const tagPerformanceStartMs = tagPerformanceBuckets[0]?.startMs || 0;
            const tagPerformanceEndMs = tagPerformanceBuckets[tagPerformanceBuckets.length - 1]?.endMs || Date.now();
            const tagThreads = (Array.isArray(realThreads) ? realThreads : [])
              .filter(isThreadForTag)
              .filter((thread) => {
                const createdAtMs = readTagThreadCreatedAtMs(thread);
                return Number.isFinite(createdAtMs) && createdAtMs >= tagPerformanceStartMs && createdAtMs < tagPerformanceEndMs;
              });
            tagPerformanceBuckets.forEach((bucket) => {
              tagThreads.forEach((thread) => {
                const createdAtMs = readTagThreadCreatedAtMs(thread);
                if (!Number.isFinite(createdAtMs) || createdAtMs < bucket.startMs || createdAtMs >= bucket.endMs) {
                  return;
                }
                bucket.runCount += 1;
                bucket.totalCT += readTagThreadTotalCT(thread);
                if (isTagThreadCompleted(thread)) {
                  bucket.completedCount += 1;
                }
              });
            });
            const tagRunCount = tagThreads.length;
            const tagCompletedCount = tagPerformanceBuckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket.completedCount || 0)), 0);
            const tagTotalCT = tagPerformanceBuckets.reduce((sum, bucket) => sum + Math.max(0, Number(bucket.totalCT || 0)), 0);
            const tagAvgCT = tagRunCount > 0 ? tagTotalCT / tagRunCount : 0;
            const tagSuccessRate = tagRunCount > 0 ? Math.round((tagCompletedCount / tagRunCount) * 100) : 0;
            const tagPerformanceKpis = [
              { id: "total-runs", label: "Total Threads", value: formatTagPerformanceInteger(tagRunCount) },
              { id: "cost", label: "Cost", value: formatSettingsComputeTokens(tagTotalCT) },
              { id: "avg-ct", label: "Avg cost / Thread", value: formatSettingsComputeTokens(tagAvgCT) },
              { id: "success-rate", label: "Success Rate", value: String(tagSuccessRate) + "%" },
            ];
            const tagPerformanceSeries = [
              { id: "runs", values: tagPerformanceBuckets.map((bucket) => Math.max(0, Number(bucket.runCount || 0))) },
            ];
            const tagAnalyticsMetricColors = {
              "total-runs": "#7effff",
              cost: "#8fc4ff",
              "avg-ct": "#ffffff",
              "success-rate": "#54e5a6",
            };
            const tagAnalyticsModel = {
              title: "Analytics",
              ariaLabel: selectedTag.label + " analytics",
              metrics: tagPerformanceKpis.map((item) => ({
                id: item.id,
                label: item.label,
                value: item.value,
                color: tagAnalyticsMetricColors[item.id] || "rgba(255, 255, 255, 0.72)",
              })),
              labels: tagPerformanceBuckets.map((bucket) => String(bucket?.label || "")),
              series: [
                {
                  id: "cost",
                  label: "Cost",
                  values: tagPerformanceBuckets.map((bucket) => Math.max(0, Number(bucket?.totalCT || 0))),
                  color: "#8fc4ff",
                  type: "bar",
                  axis: "secondary",
                  valueKind: "tokens",
                },
                {
                  id: "runs",
                  label: "Threads",
                  values: tagPerformanceSeries.find((entry) => entry.id === "runs")?.values || [],
                  color: "#7effff",
                  type: "line",
                  axis: "primary",
                  valueKind: "count",
                },
              ],
              loading: isThreadsLoading,
            };
            const analyticsSection = React.createElement(PlatformAnalyticsSection, {
              variant: "framed",
              className: "playground-tags-detail-analytics",
              analytics: tagAnalyticsModel,
              title: "Analytics",
              timeframe: {
                value: activeTagPerformanceRange.id,
                options: tagDetailPerformanceRangeOptions.map((option) => ({
                  value: option.id,
                  label: option.label,
                })),
                onValueChange: setTagDetailPerformanceRange,
                ariaLabel: "Tag analytics time frame",
              },
            });
  
            const instructionsSection = React.createElement(React.Fragment, null,
              React.createElement(PlatformInstructionsEditor, {
                value: tagConfig.instructions || "",
                onChange: (value) => updateTagInstructionsValue(tagId, value),
                title: "Instructions",
                placeholder: "Add custom instructions that will be sent to the agent every time a thread is invoked from this tag.",
                ariaLabel: selectedTag.label + " instructions",
                stickyHeader: true,
                historyKey: tagId,
              }),
              tagSaveState.status === "saving" || tagSaveState.status === "saved" || tagSaveState.error
                ? React.createElement("div", { className: "playground-environments-muted" },
                    tagSaveState.error || (tagSaveState.status === "saving" ? "Saving..." : "Saved")
                  )
                : null
            );
  
            const renderTagPermissionRings = () =>
              React.createElement("span", { className: "playground-agents-detail-permission-rings", "aria-hidden": "true" },
                PLAYGROUND_PERMISSION_RING_DEFINITIONS.map((ring) => {
                  const ringAccess = getPlaygroundPermissionRingAccess(normalizedPermissionSet, ring.id);
                  return React.createElement("span", {
                      key: ring.id,
                      className: "playground-agents-detail-permission-ring",
                      title: ring.label + ": " + getPlaygroundPermissionAccessLabel(ringAccess),
                    },
                    React.createElement(PlatformPermissionMiniRingIcon, {
                      ringId: ring.id,
                      access: ringAccess,
                    })
                  );
                })
              );
            const renderSidebarValue = (value) =>
              React.createElement("span", {
                className: "playground-environments-editor-fact-value",
                title: String(value || ""),
              }, value || "Not set");
            const renderSidebarRow = (label, valueNode, props = {}) =>
              React.createElement(props.asButton ? "button" : "div", {
                  key: label,
                  type: props.asButton ? "button" : undefined,
                  className: "playground-project-overview-sidebar-row" + (props.className ? " " + props.className : ""),
                  onClick: props.onClick,
                },
                React.createElement("div", { className: "playground-project-overview-sidebar-row-label" }, props.labelNode || label),
                React.createElement("div", {
                  className: "playground-project-overview-sidebar-row-value"
                    + (props.editable ? " is-editable" : "")
                    + (props.valueClassName ? " " + props.valueClassName : ""),
                }, valueNode)
              );
            const defaultEnvironmentOptions = Array.isArray(runtimeEnvironments) ? runtimeEnvironments : [];
            const defaultProjectOptions = Array.isArray(runnerWorkspaceProjects) ? runnerWorkspaceProjects : [];
            const environmentNameById = new Map(defaultEnvironmentOptions.map((environment) => [
              environment?.id,
              environment?.name || environment?.id || "",
            ]));
            const hasSelectedDefaultEnvironment = defaultEnvironmentOptions.some((environment) => environment?.id === tagConfig.defaultEnvironmentId);
            const defaultEnvironmentChoices = [
              !hasSelectedDefaultEnvironment && tagConfig.defaultEnvironmentId
                ? {
                    id: tagConfig.defaultEnvironmentId,
                    name: tagConfig.defaultEnvironmentName || tagConfig.defaultEnvironmentId,
                    description: "Saved computer",
                  }
                : null,
              ...defaultEnvironmentOptions.map((environment) => ({
                id: environment.id,
                name: environment.name || environment.id,
                description: environment.isDefault ? "Default computer" : "Computer",
              })),
            ].filter((environment) => environment && environment.id);
            const hasSelectedDefaultProject = defaultProjectOptions.some((project) => project?.id === tagConfig.defaultProjectId);
            const defaultProjectChoices = [
              !hasSelectedDefaultProject && tagConfig.defaultProjectId
                ? {
                    id: tagConfig.defaultProjectId,
                    name: tagConfig.defaultProjectName || tagConfig.defaultProjectId,
                    description: "Saved project",
                    defaultEnvironmentId: tagConfig.defaultEnvironmentId || "",
                  }
                : null,
              ...defaultProjectOptions.map((project) => ({
                ...project,
                id: project.id,
                name: project.name || project.id,
                description: project.description || "Project",
                defaultEnvironmentId: getTagProjectEnvironmentId(project),
              })),
            ].filter((project) => project && project.id);
            const selectedDefaultEnvironment = defaultEnvironmentChoices.find((environment) => environment.id === tagConfig.defaultEnvironmentId) || null;
            const selectedDefaultProject = defaultProjectChoices.find((project) => project.id === tagConfig.defaultProjectId) || null;
            const defaultEnvironmentLabel = selectedDefaultProject?.name
              || selectedDefaultEnvironment?.name
              || tagConfig.defaultProjectName
              || tagConfig.defaultEnvironmentName
              || tagConfig.defaultEnvironmentId
              || "Select environment";
            const DefaultEnvironmentIcon = selectedDefaultProject ? Rocket : Monitor;
            const defaultEnvironmentPopoverOpen = tagDetailPropertyPopover === "environment";
            const currentTagDefaultEnvironmentMode = tagDefaultEnvironmentMode === "projects" ? "projects" : "computers";
            const defaultEnvironmentHelpText = "This is the default computer or project chosen for new threads triggered from this tag. It defines where the agent should work.";
            const defaultEnvironmentLabelNode = React.createElement("span", { className: "playground-tags-detail-label-with-help" },
              React.createElement("span", null, "Environment"),
              React.createElement("span", {
                  className: "playground-tags-default-environment-help",
                  tabIndex: 0,
                  "aria-label": defaultEnvironmentHelpText,
                },
                React.createElement(CircleHelp, { width: 12, height: 12, strokeWidth: 1.8 }),
                React.createElement("span", {
                  className: "playground-tags-default-environment-tooltip",
                  role: "tooltip",
                }, defaultEnvironmentHelpText)
              )
            );
            const defaultEnvironmentSelect = renderPlaygroundPlatformPopup({
              open: defaultEnvironmentPopoverOpen,
              shellRef: defaultEnvironmentPopoverOpen ? tagDetailPropertyPopoverRef : null,
              shellClassName: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell playground-agents-model-select-popup playground-tags-detail-computer-popup playground-tags-detail-environment-popup",
              menuClassName: "tb-popup-menu-inline tb-popup-menu-inline-right tb-popup-menu-inline-workspace playground-tags-detail-environment-menu",
              trigger: React.createElement("button", {
                  type: "button",
                  className: "playground-environments-runtime-value-button playground-agents-model-picker-trigger" + (selectedDefaultEnvironment || selectedDefaultProject ? "" : " is-empty"),
                  onClick: () => {
                    setTagDefaultEnvironmentMode(tagConfig.defaultProjectId ? "projects" : "computers");
                    setTagDetailPropertyPopover((current) => current === "environment" ? "" : "environment");
                  },
                  title: defaultEnvironmentLabel,
                  "aria-label": "Environment: " + defaultEnvironmentLabel,
                  "aria-expanded": defaultEnvironmentPopoverOpen ? "true" : "false",
                },
                React.createElement("span", { className: "playground-agents-model-picker-trigger-copy" },
                  React.createElement("span", { className: "playground-agents-model-provider-icon-shell", "aria-hidden": "true" },
                    React.createElement(DefaultEnvironmentIcon, { width: 14, height: 14, strokeWidth: 1.8 })
                  ),
                  React.createElement("span", { className: "playground-agents-model-picker-trigger-labels" },
                    React.createElement("span", { className: "playground-environments-runtime-value-label" }, defaultEnvironmentLabel)
                  )
                ),
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
              ),
              children: React.createElement(React.Fragment, null,
                React.createElement("div", { className: "tb-popup-panel-section tb-popup-panel-section-attach-header" },
                  React.createElement(PlatformSwitch, {
                    ariaLabel: "Environment source",
                    value: currentTagDefaultEnvironmentMode,
                    options: [
                      { value: "computers", label: "Computers" },
                      { value: "projects", label: "Projects" },
                    ],
                    onValueChange: setTagDefaultEnvironmentMode,
                  })
                ),
                React.createElement("div", { className: "tb-popup-menu-inline-body tb-popup-menu-inline-body-agent tb-popup-menu-inline-body-workspace" },
                  currentTagDefaultEnvironmentMode === "projects"
                    ? (
                        defaultProjectChoices.length > 0
                          ? defaultProjectChoices.map((project) => {
                              const projectEnvironmentId = getTagProjectEnvironmentId(project) || String(project.defaultEnvironmentId || "").trim();
                              const projectEnvironmentName = environmentNameById.get(projectEnvironmentId) || project.defaultEnvironmentName || projectEnvironmentId;
                              const isSelectedProject = Boolean(tagConfig.defaultProjectId) && project.id === tagConfig.defaultProjectId;
                              return React.createElement("button", {
                                  key: project.id,
                                  type: "button",
                                  className: "tb-popup-row tb-popup-row-select tb-popup-row-agent tb-popup-row-workspace" + (isSelectedProject ? " selected" : ""),
                                  onClick: () => {
                                    if (!projectEnvironmentId) {
                                      return;
                                    }
                                    updateTagDetailConfig(tagId, {
                                      defaultEnvironmentId: projectEnvironmentId,
                                      defaultEnvironmentName: projectEnvironmentName || projectEnvironmentId,
                                      defaultProjectId: project.id,
                                      defaultProjectName: project.name || project.id,
                                    });
                                    setTagDetailPropertyPopover("");
                                  },
                                  disabled: !projectEnvironmentId,
                                  title: !projectEnvironmentId ? "This project has no linked computer." : project.name || project.id,
                                },
                                React.createElement(Rocket, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.75 }),
                                React.createElement("span", { className: "tb-popup-label" }, project.name || project.id),
                                React.createElement("span", { className: "tb-popup-check-slot" },
                                  isSelectedProject
                                    ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                    : null
                                )
                              );
                            })
                          : React.createElement("div", { className: "tb-popup-menu-inline-empty" },
                              React.createElement("div", { className: "tb-popup-empty-state" }, "No projects available.")
                            )
                      )
                    : (
                        defaultEnvironmentChoices.length > 0
                          ? defaultEnvironmentChoices.map((environment) => {
                              const isSelectedEnvironment = !tagConfig.defaultProjectId && environment.id === tagConfig.defaultEnvironmentId;
                              return React.createElement("button", {
                                  key: environment.id,
                                  type: "button",
                                  className: "tb-popup-row tb-popup-row-select tb-popup-row-agent tb-popup-row-workspace" + (isSelectedEnvironment ? " selected" : ""),
                                  onClick: () => {
                                    updateTagDetailConfig(tagId, {
                                      defaultEnvironmentId: environment.id,
                                      defaultEnvironmentName: environment.name || environment.id,
                                      defaultProjectId: "",
                                      defaultProjectName: "",
                                    });
                                    setTagDetailPropertyPopover("");
                                  },
                                },
                                React.createElement(Monitor, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.75 }),
                                React.createElement("span", { className: "tb-popup-label" }, environment.name || environment.id),
                                React.createElement("span", { className: "tb-popup-check-slot" },
                                  isSelectedEnvironment
                                    ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                    : null
                                )
                              );
                            })
                          : React.createElement("div", { className: "tb-popup-menu-inline-empty" },
                              React.createElement("div", { className: "tb-popup-empty-state" }, "No computers available.")
                            )
                      )
                )
              ),
            });
            const sidebar = React.createElement(React.Fragment, null,
              React.createElement("section", {
                  className: "playground-project-overview-sidebar-card playground-tags-detail-properties-card" + (defaultEnvironmentPopoverOpen ? " is-computer-popup-open is-environment-popup-open" : ""),
                },
                React.createElement("div", { className: "playground-project-overview-sidebar-card-header" },
                  React.createElement("h2", { className: "playground-project-overview-sidebar-title" }, "Properties")
                ),
                React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                  renderSidebarRow("Connected Identity", renderSidebarValue(tagConfig.connectedIdentity || selectedTag.statusCopy || "Not connected")),
                  renderSidebarRow("Environment", defaultEnvironmentSelect, {
                    editable: true,
                    labelNode: defaultEnvironmentLabelNode,
                  }),
                  renderSidebarRow("Permissions", renderTagPermissionRings(), {
                    asButton: true,
                    className: "playground-agents-detail-sidebar-permission-row",
                    valueClassName: "playground-agents-detail-sidebar-permission-value",
                    onClick: () => setPluginDetailTab("permissions"),
                  })
                )
              ),
              React.createElement("section", { className: "playground-project-overview-sidebar-card playground-tags-detail-included-actions-card" },
                React.createElement("div", { className: "playground-project-overview-sidebar-card-header" },
                  React.createElement("h2", { className: "playground-project-overview-sidebar-title" }, "Included Actions")
                ),
                React.createElement("div", { className: "playground-tags-detail-sidebar-actions" },
                  (selectedTag.features || []).map((feature) =>
                    React.createElement("div", { key: feature.id, className: "playground-tags-detail-sidebar-action" },
                      React.createElement("span", { className: "playground-plugin-detail-feature-icon playground-tags-detail-sidebar-action-icon" }, renderFeatureIcon(feature)),
                      React.createElement("div", { className: "playground-plugin-detail-feature-copy playground-tags-detail-sidebar-action-copy" },
                        React.createElement("div", { className: "playground-plugin-detail-feature-title-row" },
                          React.createElement("span", { className: "playground-plugin-detail-feature-title" }, feature.title)
                        ),
                        feature.description
                          ? React.createElement("div", { className: "playground-plugin-detail-feature-description" }, feature.description)
                          : null
                      )
                    )
                  )
                )
              ),
              React.createElement("section", { className: "playground-project-overview-sidebar-card" },
                React.createElement("div", { className: "playground-project-overview-sidebar-card-header" },
                  React.createElement("h2", { className: "playground-project-overview-sidebar-title" }, "Provider Information")
                ),
                React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                  [
                    { label: "Website", href: selectedTag.websiteUrl },
                    { label: "Terms", href: selectedTag.termsUrl },
                    { label: "Privacy", href: selectedTag.privacyUrl },
                  ].map((row) =>
                    renderSidebarRow(
                      row.label,
                      row.href
                        ? React.createElement("a", {
                            className: "playground-plugin-detail-info-link",
                            href: row.href,
                            target: "_blank",
                            rel: "noreferrer",
                          },
                            React.createElement("span", { className: "playground-plugin-detail-info-link-text" }, getLinkLabel(row.href)),
                            React.createElement(ExternalLink, { width: 12, height: 12, strokeWidth: 1.8 })
                          )
                        : renderSidebarValue("Not available"),
                      { valueClassName: "playground-tags-detail-provider-value" }
                    )
                  )
                )
              )
            );
  
            const setupContent = (() => {
              if (tagId === "email") {
                const emailSetup = settingsEmailLoading
                  ? React.createElement("div", { className: "playground-settings-integration-loading" },
                      React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                    )
                  : settingsEmailStatus?.linked && settingsEmailStatus?.verified
                    ? React.createElement("div", { className: "playground-settings-integration-notice is-success" }, "Email is linked and ready to receive tasks.")
                    : settingsShowEmailVerificationInput || (settingsEmailStatus?.linked && !settingsEmailStatus?.verified)
                      ? React.createElement(React.Fragment, null,
                          React.createElement("div", { className: "playground-settings-integration-notice is-warning" }, "A verification code has been sent to your email. Enter it below to complete linking."),
                          React.createElement("div", { className: "playground-settings-integration-form-row" },
                            React.createElement("input", {
                              type: "text",
                              value: settingsEmailVerificationCodeInput,
                              onChange: (event) => setSettingsEmailVerificationCodeInput(event.target.value),
                              placeholder: "Enter 6-digit code",
                              maxLength: 6,
                              className: "playground-settings-integration-input is-code",
                            }),
                            React.createElement(PlatformPrimaryButton, {
                              size: "large",
                              type: "button",
                              className: "playground-plugin-modal-button is-primary",
                              onClick: () => {
                                void handleSettingsVerifyEmailCode();
                              },
                              disabled: settingsIsVerifyingEmail || !settingsEmailVerificationCodeInput,
                            }, settingsIsVerifyingEmail ? "Verifying..." : "Verify")
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-plugin-modal-button",
                            onClick: () => {
                              void handleSettingsCancelEmailVerification();
                            },
                          }, "Cancel")
                        )
                      : React.createElement("div", { className: "playground-settings-integration-form-row" },
                          React.createElement("input", {
                            type: "email",
                            value: settingsEmailInput,
                            onChange: (event) => setSettingsEmailInput(event.target.value),
                            placeholder: "you@example.com",
                            className: "playground-settings-integration-input is-email",
                          }),
                          React.createElement(PlatformPrimaryButton, {
                            size: "large",
                            type: "button",
                            className: "playground-plugin-modal-button is-primary",
                            onClick: () => {
                              void handleSettingsLinkEmail();
                            },
                            disabled: settingsIsLinkingEmail || !settingsEmailInput,
                          }, settingsIsLinkingEmail ? "Linking..." : "Link Email")
                        );
                return React.createElement(React.Fragment, null,
                  emailSetup,
                  renderSettingsIntegrationMessage("error", settingsEmailError),
                  renderSettingsIntegrationMessage("success", settingsEmailSuccess)
                );
              }
              if (tagId === "telegram") {
                return React.createElement(React.Fragment, null,
                  settingsTelegramStatus?.linked && settingsTelegramStatus?.verified
                    ? React.createElement("div", { className: "playground-settings-integration-notice is-success" }, "Telegram is linked and ready to receive tasks.")
                    : React.createElement(React.Fragment, null,
                        React.createElement("ul", { className: "playground-plugin-modal-list" },
                          React.createElement("li", null, "Open Telegram and search for @aios_agent_bot."),
                          React.createElement("li", null, "Send /link to the bot."),
                          React.createElement("li", null, "Enter the verification code below.")
                        ),
                        React.createElement("div", { className: "playground-settings-integration-form-row" },
                          React.createElement("input", {
                            type: "text",
                            value: settingsTelegramVerificationCode,
                            onChange: (event) => setSettingsTelegramVerificationCode(event.target.value),
                            placeholder: "Enter verification code",
                            className: "playground-settings-integration-input",
                            maxLength: 6,
                          }),
                          React.createElement(PlatformPrimaryButton, {
                            size: "large",
                            type: "button",
                            className: "playground-plugin-modal-button is-primary",
                            onClick: () => {
                              void handleSettingsVerifyTelegramCode();
                            },
                            disabled: settingsIsVerifyingTelegram || !settingsTelegramVerificationCode.trim(),
                          }, settingsIsVerifyingTelegram ? "Verifying..." : "Verify")
                        )
                      ),
                  renderSettingsIntegrationMessage("error", settingsTelegramError),
                  renderSettingsIntegrationMessage("success", settingsTelegramSuccess)
                );
              }
              return React.createElement(React.Fragment, null,
                selectedTag.connected
                  ? React.createElement("div", { className: "playground-settings-integration-notice is-success" }, selectedTag.label + " is connected and ready to receive tasks.")
                  : React.createElement("div", { className: "playground-settings-integration-notice" }, "Connect " + selectedTag.label + " to receive external requests."),
                renderSettingsIntegrationMessage("error", settingsDiscordError),
                renderSettingsIntegrationMessage("success", settingsDiscordSuccess)
              );
            })();
            const setupSection = React.createElement("div", { className: "playground-plugin-detail-tutorial" },
              React.createElement("section", { className: "playground-plugin-detail-section" },
                React.createElement("h3", { className: "playground-plugin-detail-section-title playground-plugin-detail-surface-title" }, "Setup"),
                React.createElement("div", { className: "playground-plugin-detail-tutorial-grid" },
                  [
                    { id: "connect", title: "1. Connect " + selectedTag.label, copy: "Link the external identity that can start or continue work through this tag." },
                    { id: "route", title: "2. Choose defaults", copy: "Select the default computer and permissions that should apply to incoming requests." },
                    { id: "use", title: "3. Send a request", copy: tagManifest.workflowDescription || "Start work from the external service and ACP will route it into an agent thread." },
                  ].map((step) =>
                    React.createElement("div", { key: step.id, className: "playground-plugin-detail-surface playground-plugin-detail-tutorial-card" },
                      React.createElement("div", { className: "playground-plugin-detail-tutorial-title" }, step.title),
                      React.createElement("div", { className: "playground-plugin-detail-tutorial-copy" }, step.copy)
                    )
                  )
                )
              ),
              React.createElement("section", { className: "playground-plugin-detail-section playground-plugin-detail-setup" },
                React.createElement("h3", { className: "playground-plugin-detail-section-title playground-plugin-detail-surface-title" }, "Connection"),
                setupContent
              )
            );
            const normalizedTagDetailTab = pluginDetailTab === "permissions"
              ? "permissions"
              : pluginDetailTab === "tutorial"
                ? "setup"
                : "general";
            const activeSection = normalizedTagDetailTab === "permissions"
              ? null
              : normalizedTagDetailTab === "setup"
                ? setupSection
                : React.createElement(React.Fragment, null,
                    analyticsSection,
                    instructionsSection
                  );
            const tagDetailContent = isTagLoading
              ? React.createElement(PlatformLoadingState, {
                  centered: true,
                  message: "Loading tag...",
                })
              : activeSection;

            return React.createElement(TagDetailPage, {
                header: tagProfileSection,
                tabBarActions: renderTagConnectionButton(),
                sidebarToggle: renderTagSidebarToggleButton(),
                sidebar,
                activeTab: normalizedTagDetailTab,
                onTabChange: (tab) => setPluginDetailTab(tab === "setup" ? "tutorial" : tab),
                sidebarCollapsed: tagDetailSidebarCollapsed,
                sidebarPopoverOpen: defaultEnvironmentPopoverOpen,
                permissions: {
                  permissionSet: normalizedPermissionSet,
                  subjectType: "agent",
                  onRingAccessChange: (ringId, access) => updateTagPermissionRingAccess(tagId, ringId, access),
                  onActionRingChange: (actionId, ringId) => updateTagPermissionActionRing(tagId, actionId, ringId),
                  onActionAccessChange: (actionId, access) => updateTagPermissionActionAccess(tagId, actionId, access),
                },
                ariaLabel: selectedTag.label + " tag details",
                sidebarAriaLabel: selectedTag.label + " tag settings",
              },
              tagDetailContent
            );
          }
  
          function renderPluginDetailBody(selectedPlugin) {
            if (!selectedPlugin) {
              return null;
            }
  
            const getLinkLabel = (url) => {
              const value = String(url || "").trim();
              if (!value) {
                return "";
              }
              try {
                const parsed = new URL(value);
                return (parsed.hostname + parsed.pathname).replace(/\/+$/, "");
              } catch (_error) {
                return value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
              }
            };
  
            const renderFeatureIcon = (feature) => {
              const iconKey = String(feature?.iconKey || "").trim().toLowerCase();
              const Icon = iconKey === "app"
                ? Grid3x3
                : iconKey === "workflow" || iconKey === "flow"
                  ? Webhook
                  : iconKey === "channel"
                    ? MessageSquare
                    : Layers;
              return React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.8 });
            };
  
            const infoRows = [
              { id: "category", label: "Category", value: selectedPlugin.categoryLabel || selectedPlugin.category || "Workspace Integration" },
              { id: "functions", label: "Functions", value: selectedPlugin.functionsLabel || "Connect" },
              { id: "built-by", label: "Built by", value: "Computer Agents" },
              { id: "website", label: "Website", href: selectedPlugin.websiteUrl },
              { id: "terms", label: "Terms of Use", href: selectedPlugin.termsUrl },
              { id: "privacy", label: "Data Protection", href: selectedPlugin.privacyUrl },
            ];
  
            let setupContent = null;
            if (selectedPlugin.id === "email") {
              setupContent = settingsEmailLoading
                ? React.createElement("div", { className: "playground-settings-integration-loading" },
                    React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                  )
                : settingsEmailStatus?.linked && settingsEmailStatus?.verified
                  ? null
                  : settingsShowEmailVerificationInput || (settingsEmailStatus?.linked && !settingsEmailStatus?.verified)
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-settings-integration-notice is-warning" }, "A verification code has been sent to your email. Enter it below to complete linking."),
                        React.createElement("div", { className: "playground-settings-integration-form-row" },
                          React.createElement("input", {
                            type: "text",
                            value: settingsEmailVerificationCodeInput,
                            onChange: (event) => setSettingsEmailVerificationCodeInput(event.target.value),
                            placeholder: "Enter 6-digit code",
                            maxLength: 6,
                            className: "playground-settings-integration-input is-code",
                          }),
                          React.createElement(PlatformPrimaryButton, {
                            size: "large",
                            type: "button",
                            className: "playground-plugin-modal-button is-primary",
                            onClick: () => {
                              void handleSettingsVerifyEmailCode();
                            },
                            disabled: settingsIsVerifyingEmail || !settingsEmailVerificationCodeInput,
                          }, settingsIsVerifyingEmail ? "Verifying..." : "Verify")
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-plugin-modal-button",
                          onClick: () => {
                            void handleSettingsCancelEmailVerification();
                          },
                        }, "Cancel")
                      )
                    : React.createElement("div", { className: "playground-settings-integration-form-row" },
                        React.createElement("input", {
                          type: "email",
                          value: settingsEmailInput,
                          onChange: (event) => setSettingsEmailInput(event.target.value),
                          placeholder: "you@example.com",
                          className: "playground-settings-integration-input is-email",
                        }),
                        React.createElement(PlatformPrimaryButton, {
                          size: "large",
                          type: "button",
                          className: "playground-plugin-modal-button is-primary",
                          onClick: () => {
                            void handleSettingsLinkEmail();
                          },
                          disabled: settingsIsLinkingEmail || !settingsEmailInput,
                        }, settingsIsLinkingEmail ? "Linking..." : "Link Email")
                      );
              setupContent = React.createElement(React.Fragment, null,
                setupContent,
                renderSettingsIntegrationMessage("error", settingsEmailError),
                renderSettingsIntegrationMessage("success", settingsEmailSuccess)
              );
            } else if (selectedPlugin.id === "telegram") {
              setupContent = settingsTelegramLoading
                ? React.createElement("div", { className: "playground-settings-integration-loading" },
                    React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                  )
                : settingsTelegramStatus?.linked && settingsTelegramStatus?.verified
                  ? null
                  : React.createElement(React.Fragment, null,
                      React.createElement("ul", { className: "playground-plugin-modal-list" },
                        React.createElement("li", null, "Open Telegram and search for @aios_agent_bot."),
                        React.createElement("li", null, "Send /link to the bot."),
                        React.createElement("li", null, "Enter the verification code below.")
                      ),
                      React.createElement("div", { className: "playground-settings-integration-form-row" },
                        React.createElement("input", {
                          type: "text",
                          value: settingsTelegramVerificationCode,
                          onChange: (event) => setSettingsTelegramVerificationCode(event.target.value),
                          placeholder: "Enter verification code",
                          className: "playground-settings-integration-input",
                          maxLength: 6,
                        }),
                        React.createElement(PlatformPrimaryButton, {
                          size: "large",
                          type: "button",
                          className: "playground-plugin-modal-button is-primary",
                          onClick: () => {
                            void handleSettingsVerifyTelegramCode();
                          },
                          disabled: settingsIsVerifyingTelegram || !settingsTelegramVerificationCode.trim(),
                        }, settingsIsVerifyingTelegram ? "Verifying..." : "Verify")
                      )
                    );
              setupContent = React.createElement(React.Fragment, null,
                setupContent,
                renderSettingsIntegrationMessage("error", settingsTelegramError),
                renderSettingsIntegrationMessage("success", settingsTelegramSuccess)
              );
            } else {
              setupContent = selectedPlugin.id === "discord"
                ? (settingsDiscordError || settingsDiscordSuccess
                    ? React.createElement(React.Fragment, null,
                        renderSettingsIntegrationMessage("error", settingsDiscordError),
                        renderSettingsIntegrationMessage("success", settingsDiscordSuccess)
                      )
                    : null)
                : null;
            }
  
  	          const connectionState = getPluginDetailConnectionState(selectedPlugin);
  	          const pluginManifest = getPluginIntegrationManifest(selectedPlugin.id);
  	          const capabilityCards = getPluginDetailCapabilityCards(selectedPlugin).filter((card) =>
  	            card && card.supported !== false && !card.planned
  	          );
  	          const permissionRows = getPluginDetailPermissionRows(selectedPlugin);
            const getPermissionStatus = () => {
              if (connectionState.id === "connected") {
                return { label: "Enabled", tone: "connected" };
              }
              if (connectionState.id === "pending") {
                return { label: "Pending", tone: "pending" };
              }
              if (connectionState.id === "webhook") {
                return { label: "Configure", tone: "available" };
              }
              return { label: "Disabled", tone: "inactive" };
            };
            const permissionStatus = getPermissionStatus();
            const connectionRows = [
              { id: "status", label: "Status", value: connectionState.label },
  	            { id: "account", label: "Account", value: selectedPlugin.statusCopy || connectionState.copy },
  	            { id: "auth", label: "Authentication", value: getPluginDetailAuthMethod(selectedPlugin.id) },
  	            { id: "mode", label: "Workflow mode", value: pluginManifest.workflowMode },
  	            { id: "category", label: "Category", value: selectedPlugin.categoryLabel || selectedPlugin.category || "Workspace Integration" },
  	            { id: "website", label: "Website", href: selectedPlugin.websiteUrl },
              { id: "terms", label: "Terms", href: selectedPlugin.termsUrl },
              { id: "privacy", label: "Privacy", href: selectedPlugin.privacyUrl },
            ];
  
  	          const normalizedCapabilityCards = capabilityCards.length
  	            ? capabilityCards
  	            : [{
  	                id: "overview",
  	                title: selectedPlugin.label,
  	                description: selectedPlugin.description || "Connect this plugin to extend what agents can read, write, or trigger.",
  	                icon: Layers,
  	                supported: true,
  	              }];
  	          const normalizedCapabilityIndex = ((pluginDetailCapabilityIndex % normalizedCapabilityCards.length) + normalizedCapabilityCards.length) % normalizedCapabilityCards.length;
  	          const activeCapability = normalizedCapabilityCards[normalizedCapabilityIndex] || normalizedCapabilityCards[0];
  	          const outgoingCapability = pluginDetailCapabilityOutgoingIndex === null
  	            ? null
  	            : normalizedCapabilityCards[((pluginDetailCapabilityOutgoingIndex % normalizedCapabilityCards.length) + normalizedCapabilityCards.length) % normalizedCapabilityCards.length];
  	          const showCapabilityAt = (nextIndex, directionOverride = null) => {
  	            const count = normalizedCapabilityCards.length || 1;
  	            const normalizedNextIndex = ((nextIndex % count) + count) % count;
  	            if (normalizedNextIndex === normalizedCapabilityIndex) {
  	              return;
  	            }
  	            const direction = directionOverride || (normalizedNextIndex > normalizedCapabilityIndex ? 1 : -1);
  	            setPluginDetailCapabilityOutgoingIndex(normalizedCapabilityIndex);
  	            setPluginDetailCapabilityDirection(direction > 0 ? 1 : -1);
  	            setPluginDetailCapabilityIndex(normalizedNextIndex);
  	            setPluginDetailCapabilityTransitionKey((current) => current + 1);
  	            window.setTimeout(() => {
  	              setPluginDetailCapabilityOutgoingIndex(null);
  	            }, 360);
  	          };
  	          const advanceCapability = (direction) => {
  	            const count = normalizedCapabilityCards.length || 1;
  	            showCapabilityAt(normalizedCapabilityIndex + direction + count, direction >= 0 ? 1 : -1);
            };
            const renderPermissionsPanel = () =>
              React.createElement("div", { className: "playground-plugin-detail-surface playground-plugin-detail-permission-panel" },
  	              React.createElement("div", { className: "playground-plugin-detail-permission-list" },
  	                permissionRows.map((row) =>
  	                  React.createElement("div", { key: row.id, className: "playground-plugin-detail-permission-row" },
  	                    React.createElement("span", { className: "playground-plugin-detail-permission-icon is-" + permissionStatus.tone },
  	                      permissionStatus.tone === "connected"
  	                        ? React.createElement(Check, { width: 13, height: 13, strokeWidth: 2 })
  	                        : React.createElement(Shield, { width: 13, height: 13, strokeWidth: 1.8 })
  	                    ),
  	                    React.createElement("div", { className: "playground-plugin-detail-permission-copy" },
  	                      React.createElement("div", { className: "playground-plugin-detail-permission-name" }, row.title),
  	                      React.createElement("div", { className: "playground-plugin-detail-permission-description" }, row.description)
  	                    )
  	                  )
  	                )
  	              )
  	            );
  	          const renderConnectionDetailsPanel = () =>
  	            React.createElement("section", { className: "playground-plugin-detail-section" },
  	              React.createElement("h3", { className: "playground-plugin-detail-section-title playground-plugin-detail-surface-title" }, "Connection"),
  	              React.createElement("div", { className: "playground-plugin-detail-surface playground-plugin-detail-connection-panel" },
  	                React.createElement("div", { className: "playground-plugin-detail-info-compact" },
  	                  connectionRows
  	                    .filter((row) => row.id !== "status" && (row.href || row.value))
  	                    .map((row) =>
  	                      React.createElement("div", { key: row.id, className: "playground-plugin-detail-info-row" },
  	                        React.createElement("div", { className: "playground-plugin-detail-info-label" }, row.label),
  	                        React.createElement("div", { className: "playground-plugin-detail-info-value" },
  	                          row.href
  	                            ? React.createElement("a", {
  	                                className: "playground-plugin-detail-info-link",
  	                                href: row.href,
  	                                target: "_blank",
  	                                rel: "noreferrer",
  	                              },
  	                                React.createElement("span", { className: "playground-plugin-detail-info-link-text" }, getLinkLabel(row.href)),
  	                                React.createElement(ExternalLink, { width: 12, height: 12, strokeWidth: 1.8 })
  	                              )
  	                            : row.value
  	                        )
  	                      )
  	                    )
  	                )
  	              )
  	            );
  	          const renderIncludedActions = () =>
  	            React.createElement("section", { className: "playground-plugin-detail-section playground-plugin-detail-included-actions" },
  	              React.createElement("h3", { className: "playground-plugin-detail-section-title playground-plugin-detail-surface-title" }, "Included actions"),
  	              React.createElement("div", { className: "playground-plugin-detail-surface playground-plugin-detail-table" },
  	                (selectedPlugin.features || []).map((feature) =>
  	                  React.createElement("div", { key: feature.id, className: "playground-plugin-detail-table-row" },
  	                    React.createElement("div", { className: "playground-plugin-detail-feature-main" },
  	                      React.createElement("span", { className: "playground-plugin-detail-feature-icon" }, renderFeatureIcon(feature)),
  	                      React.createElement("div", { className: "playground-plugin-detail-feature-copy" },
  	                        React.createElement("div", { className: "playground-plugin-detail-feature-title-row" },
  	                          React.createElement("span", { className: "playground-plugin-detail-feature-title" }, feature.title),
  	                          feature.kind
  	                            ? React.createElement("span", { className: "playground-plugin-detail-feature-kind" }, feature.kind)
  	                            : null
  	                        ),
  	                        React.createElement("div", { className: "playground-plugin-detail-feature-description" }, feature.description)
  	                      )
  	                    )
  	                  )
  	                )
  	              )
  	            );
            const renderSetupSection = () =>
              setupContent
                ? React.createElement("section", { className: "playground-plugin-detail-section playground-plugin-detail-setup" },
                    React.createElement("h3", { className: "playground-plugin-detail-section-title" }, "Setup"),
                    setupContent
                  )
                : null;
  	          const getCapabilityDescription = (capability) => {
  	            const base = String(capability?.description || "Use this capability to connect external work with ACP.").trim();
  	            const followUps = {
  	              agentActions: "Once connected, agents can use this capability while running a thread, so the external system becomes part of the same workspace instead of a separate manual handoff.",
  	              externalTriggers: "Use this when work should start outside ACP and still arrive with the right agent, environment, files, and run context.",
  	              context: "This keeps external files, messages, records, and events available as evidence for the task without copying everything into a prompt by hand.",
  	              notifications: "Use this to close the loop by sending run status, summaries, comments, or follow-up messages back to the place where the work started.",
  	            };
  	            return [base, followUps[capability?.id] || pluginManifest.workflowDescription || ""].filter(Boolean).join(" ");
  	          };
  	          const getPluginTutorialSteps = () => {
  	            const pluginLabel = selectedPlugin.label || "Plugin";
  	            const isExternalChannel = ["discord", "telegram", "email"].includes(selectedPlugin.id);
  	            const isWebhookPlugin = ["gitlab"].includes(selectedPlugin.id);
  	            const connectCopy = isWebhookPlugin
  	              ? "Create the webhook endpoint, copy the generated URL and secret, and paste both into " + pluginLabel + " so events can be routed into ACP."
  	              : isExternalChannel
  	                ? "Start the " + pluginLabel + " connection flow, complete verification, and choose the default agent and environment that should receive incoming requests."
  	                : "Click Connect " + pluginLabel + ", complete the authorization flow, and grant only the workspaces, files, repositories, or scopes ACP should be allowed to use.";
  	            const permissionCopy = "Review the permissions below, confirm what agents can read, write, trigger, or notify, and keep the connection scoped to the work this plugin should support.";
  	            const useCopy = isExternalChannel || isWebhookPlugin
  	              ? "Send a command or trigger an event from " + pluginLabel + ". ACP will create or continue a thread with the external request attached as context, then return updates through the configured channel."
  	              : "Open a thread, task, or project and reference " + pluginLabel + " context when asking an agent to work. The agent can inspect connected data and perform the supported actions during the run.";
  	            return [
  	              { id: "connect", title: "1. Connect " + pluginLabel, copy: connectCopy },
  	              { id: "permissions", title: "2. Confirm permissions", copy: permissionCopy },
  	              { id: "use", title: "3. Use it in agent work", copy: useCopy },
  	            ];
  	          };
  	          const renderTutorialPanel = () =>
  	            React.createElement("div", { className: "playground-plugin-detail-tutorial" },
  	              React.createElement("section", { className: "playground-plugin-detail-section" },
  	                React.createElement("h3", { className: "playground-plugin-detail-section-title playground-plugin-detail-surface-title" }, "Tutorial"),
  	                React.createElement("div", { className: "playground-plugin-detail-tutorial-grid" },
  	                  getPluginTutorialSteps().map((step) =>
  	                    React.createElement("div", { key: step.id, className: "playground-plugin-detail-surface playground-plugin-detail-tutorial-card" },
  	                      React.createElement("div", { className: "playground-plugin-detail-tutorial-title" }, step.title),
  	                      React.createElement("div", { className: "playground-plugin-detail-tutorial-copy" }, step.copy)
  	                    )
  	                  )
  	                )
  	              ),
  	              setupContent
  	                ? React.createElement("section", { className: "playground-plugin-detail-section playground-plugin-detail-setup" },
  	                    React.createElement("h3", { className: "playground-plugin-detail-section-title playground-plugin-detail-surface-title" }, "Setup flow"),
  	                    setupContent
  	                  )
  	                : null
  	            );
            const renderCapabilitySlide = (capability, index, variant) => {
  	            const directionClass = pluginDetailCapabilityDirection > 0
  	              ? " is-forward"
  	              : pluginDetailCapabilityDirection < 0
  	                ? " is-backward"
  	                : "";
  	            const variantClass = variant ? " is-" + variant : "";
  	            return React.createElement("div", {
  	              key: (capability?.id || index) + ":" + variant + ":" + pluginDetailCapabilityTransitionKey,
  	              className: "playground-plugin-detail-carousel-slide" + variantClass + directionClass,
  	            },
  	              React.createElement("div", { className: "playground-plugin-detail-carousel-copy" },
  	                React.createElement("h3", { className: "playground-plugin-detail-carousel-title" }, capability.title),
  	                React.createElement("p", { className: "playground-plugin-detail-carousel-description" }, getCapabilityDescription(capability)),
  	                React.createElement("button", {
  	                  type: "button",
  	                  className: "playground-plugin-detail-carousel-learn",
  	                  onClick: () => setPluginDetailTab("tutorial"),
  	                }, "Learn more")
  	              )
  	            );
  	          };
  	          const renderCapabilityCarousel = () =>
  	            React.createElement("section", { className: "playground-plugin-detail-carousel" },
  	              React.createElement("div", { className: "playground-plugin-detail-carousel-stage" },
  	                outgoingCapability
  	                  ? renderCapabilitySlide(outgoingCapability, pluginDetailCapabilityOutgoingIndex, "outgoing")
  	                  : null,
  	                renderCapabilitySlide(activeCapability, normalizedCapabilityIndex, pluginDetailCapabilityDirection === 0 ? "" : "incoming")
  	              ),
  	              React.createElement("div", { className: "playground-plugin-detail-carousel-dots" },
  	                normalizedCapabilityCards.map((card, index) =>
  	                  React.createElement("button", {
  	                    key: card.id || index,
  	                    type: "button",
  	                    className: "playground-plugin-detail-carousel-dot" + (index === normalizedCapabilityIndex ? " is-active" : ""),
  	                    onClick: () => showCapabilityAt(index),
  	                    "aria-label": "Show " + (card.title || "capability"),
  	                  })
  	                )
  	              ),
  	              React.createElement("div", { className: "playground-plugin-detail-carousel-controls" },
  	                React.createElement("button", {
  	                  type: "button",
  	                  className: "playground-plugin-detail-carousel-nav",
  	                  onClick: () => advanceCapability(-1),
  	                  "aria-label": "Previous capability",
  	                }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
  	                React.createElement("button", {
  	                  type: "button",
  	                  className: "playground-plugin-detail-carousel-nav",
  	                  onClick: () => advanceCapability(1),
  	                  "aria-label": "Next capability",
  	                }, React.createElement(ChevronRight, { width: 16, height: 16, strokeWidth: 1.8 }))
  	              )
  	            );
  
  	          return React.createElement("div", { className: "playground-plugin-detail-stack" },
  	            pluginDetailTab === "permissions"
  	              ? React.createElement(React.Fragment, null,
  	                  React.createElement("section", { className: "playground-plugin-detail-section" },
  	                    renderPermissionsPanel()
  	                  )
  	                )
  	              : pluginDetailTab === "tutorial"
  	                ? React.createElement(React.Fragment, null,
  	                    renderTutorialPanel()
  	                )
  	              : React.createElement(React.Fragment, null,
  	                  renderCapabilityCarousel(),
  	                  renderConnectionDetailsPanel(),
  	                  renderIncludedActions()
  	                )
  	          );
          }
  
          function renderWebhookActionsPanel(options = {}) {
            const embedded = Boolean(options.embedded);
            const showEmbeddedListActions = options.showEmbeddedListActions !== false;
            const normalizedWebhookSearchQuery = String(options.searchQuery || "").trim().toLowerCase();
            const visibleTriggers = normalizedWebhookSearchQuery
              ? settingsTriggers.filter((trigger) => {
                  const sourceMeta = getSettingsTriggerSourceMeta(trigger.source);
                  const haystack = [
                    trigger.name || "",
                    sourceMeta.label || "",
                    trigger.event || "",
                    getSettingsTriggerActionLabel(trigger.action),
                  ]
                    .join(" ")
                    .toLowerCase();
                  return haystack.includes(normalizedWebhookSearchQuery);
                })
              : settingsTriggers;
            const canCreateSettingsTrigger = Boolean(
              String(settingsTriggerForm.name || "").trim()
              && String(settingsTriggerForm.event || "").trim()
              && String(settingsTriggerForm.environmentId || "").trim()
              && String(settingsTriggerForm.message || "").trim()
              && (settingsTriggerForm.source !== "github" || githubStatus.connected)
            );
  
            const settingsTriggerComposerDialog = settingsCreatingTrigger
              ? React.createElement(PlatformModalBackdrop, {
                  className: "playground-modal-scrim",
                  onClick: closeSettingsTriggerComposer,
                },
                  React.createElement(PlatformModalSurface, {
                    className: "playground-tasks-project-modal",
                    onClick: (event) => event.stopPropagation(),
                  },
                    React.createElement("div", { className: "playground-tasks-project-modal-header" },
                      React.createElement("div", { className: "playground-tasks-project-modal-copy" },
                        React.createElement("div", { className: "playground-tasks-project-modal-title" }, "Create Webhook"),
                        React.createElement("div", { className: "playground-tasks-project-modal-subtitle" }, "Route external events into a selected environment and agent.")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-project-modal-close",
                        onClick: closeSettingsTriggerComposer,
                        "aria-label": "Close webhook composer",
                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                    ),
                    React.createElement("form", {
                      className: "playground-tasks-project-modal-form",
                      onSubmit: (event) => {
                        event.preventDefault();
                        void handleSettingsCreateTrigger();
                      },
                    },
                      React.createElement("div", { className: "playground-tasks-project-modal-body" },
                        React.createElement("div", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Name"),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-environments-input",
                            value: settingsTriggerForm.name,
                            onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, name: event.target.value })),
                            placeholder: "GitHub PR Review",
                            disabled: settingsTriggerSubmitting,
                          })
                        ),
                        React.createElement("div", { className: "playground-tasks-project-modal-grid" },
                          React.createElement("div", { className: "playground-tasks-project-modal-field" },
                            React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Source"),
                            React.createElement("select", {
                              className: "playground-environments-select",
                              value: settingsTriggerForm.source,
                              disabled: settingsTriggerSubmitting,
                              onChange: (event) => setSettingsTriggerForm((current) => {
                                const nextSource = event.target.value;
                                const nextActionType = isSettingsTriggerActionSupportedForSource(nextSource, current.actionType)
                                  ? current.actionType
                                  : "send_message";
                                return {
                                  ...current,
                                  source: nextSource,
                                  actionType: nextActionType,
                                  event: getSettingsTriggerDefaultEvent(nextSource, nextActionType),
                                };
                              }),
                            },
                              SETTINGS_TRIGGER_SOURCE_OPTIONS.map((option) =>
                                React.createElement("option", { key: option.value, value: option.value }, option.label)
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-project-modal-field" },
                            React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Event"),
                            React.createElement("select", {
                              className: "playground-environments-select",
                              value: settingsTriggerForm.event,
                              disabled: settingsTriggerSubmitting,
                              onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, event: event.target.value })),
                            },
                              getSettingsTriggerEventOptions(settingsTriggerForm.source, settingsTriggerForm.actionType).map((eventName) =>
                                React.createElement("option", { key: eventName, value: eventName }, eventName)
                              )
                            )
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-project-modal-grid" },
                          React.createElement("div", { className: "playground-tasks-project-modal-field" },
                            React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Environment"),
                            React.createElement("select", {
                              className: "playground-environments-select",
                              value: settingsTriggerForm.environmentId,
                              disabled: settingsTriggerSubmitting,
                              onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, environmentId: event.target.value })),
                            },
                              React.createElement("option", { value: "" }, "Select environment"),
                              runtimeEnvironments.map((environment) =>
                                React.createElement("option", { key: environment.id, value: environment.id }, environment.name || environment.id)
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-project-modal-field" },
                            React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Action"),
                            React.createElement("select", {
                              className: "playground-environments-select",
                              value: settingsTriggerForm.actionType,
                              disabled: settingsTriggerSubmitting,
                              onChange: (event) => setSettingsTriggerForm((current) => {
                                const nextActionType = event.target.value;
                                return {
                                  ...current,
                                  actionType: nextActionType,
                                  event: getSettingsTriggerDefaultEvent(current.source, nextActionType),
                                };
                              }),
                            },
                              SETTINGS_TRIGGER_ACTION_OPTIONS
                                .filter((option) => isSettingsTriggerActionSupportedForSource(settingsTriggerForm.source, option.value))
                                .map((option) => React.createElement("option", { key: option.value, value: option.value }, option.label))
                            )
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Agent"),
                          React.createElement("select", {
                            className: "playground-environments-select",
                            value: settingsTriggerForm.agentId,
                            disabled: settingsTriggerSubmitting,
                            onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, agentId: event.target.value })),
                          },
                            React.createElement("option", { value: "" }, "Select agent"),
                            runtimeAgents.map((agent) =>
                              React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.id)
                            )
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Message"),
                          React.createElement("div", { className: "playground-tasks-detail-description-toolbar" },
                            ["bold", "italic", "underline", "list"].map((action) =>
                              React.createElement("button", {
                                key: action,
                                type: "button",
                                className: "playground-tasks-detail-description-toolbar-button",
                                onClick: () => handleSettingsTriggerPromptMarkdownFormat(action),
                              },
                                action === "bold" ? React.createElement(Bold, { width: 14, height: 14, strokeWidth: 1.8 })
                                  : action === "italic" ? React.createElement(Italic, { width: 14, height: 14, strokeWidth: 1.8 })
                                  : action === "underline" ? React.createElement(Underline, { width: 14, height: 14, strokeWidth: 1.8 })
                                  : React.createElement(List, { width: 14, height: 14, strokeWidth: 1.8 })
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-detail-description-editor " + (isSettingsTriggerPromptEditing ? "is-editing" : "is-preview") },
                            React.createElement("textarea", {
                              ref: settingsTriggerPromptTextareaRef,
                              className: "playground-tasks-detail-description-input " + (isSettingsTriggerPromptEditing ? "is-editing" : "is-preview"),
                              value: settingsTriggerForm.message,
                              placeholder: getSettingsTriggerPromptPlaceholder(settingsTriggerForm.source, settingsTriggerForm.actionType),
                              disabled: settingsTriggerSubmitting,
                              onFocus: () => setIsSettingsTriggerPromptEditing(true),
                              onChange: (event) => {
                                updateSettingsTriggerPromptField(event.target.value);
                                resizeSettingsTriggerPromptTextarea(event.currentTarget);
                              },
                              onBlur: () => setIsSettingsTriggerPromptEditing(false),
                            })
                          ),
                          settingsTriggerForm.actionType === "comment_pull_request"
                            ? React.createElement("div", { className: "playground-environments-muted", style: { marginTop: 8 } }, "The assistant response will be posted back to the matching GitHub pull request as a comment.")
                            : settingsTriggerForm.actionType === "comment_merge_request"
                              ? React.createElement("div", { className: "playground-environments-muted", style: { marginTop: 8 } }, "The assistant response will be posted back to the matching GitLab merge request as a comment.")
                              : null
                        ),
                        settingsTriggerForm.source === "github"
                          ? React.createElement("div", { className: "playground-tasks-project-modal-field" },
                              React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Filters"),
                              !githubStatus.connected
                                ? React.createElement("div", { className: "playground-settings-trigger-connect-card" },
                                    React.createElement("div", { className: "playground-environments-muted" }, "Connect GitHub to choose one of your repositories for this webhook."),
                                    React.createElement(PlatformPrimaryButton, {
                                      size: "medium",
                                      type: "button",
                                      className: "playground-environments-action-button is-primary",
                                      onClick: () => {
                                        void handleGithubAuthConnect();
                                      },
                                      disabled: settingsTriggerSubmitting,
                                    }, React.createElement("span", null, "Connect GitHub"))
                                  )
                                : React.createElement(React.Fragment, null,
                                    React.createElement("div", { className: "playground-settings-trigger-connect-card", style: { marginBottom: 8 } },
                                      React.createElement("div", { className: "playground-environments-muted" }, "GitHub is connected. Choose a repository or log out of GitHub for this webhook."),
                                      React.createElement("button", {
                                        type: "button",
                                        className: "playground-environments-action-button",
                                        onClick: () => {
                                          void handleGithubAuthDisconnect();
                                        },
                                        disabled: settingsTriggerSubmitting,
                                      }, React.createElement("span", null, "Log out of GitHub"))
                                    ),
                                    React.createElement("div", { className: "playground-environment-composer-runtime-facts" },
                                      React.createElement("div", { className: "playground-tasks-detail-fact" },
                                        React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Repository"),
                                        React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                          React.createElement("select", {
                                            className: "playground-environments-select playground-tasks-detail-fact-select playground-tasks-detail-priority-select",
                                            value: settingsTriggerForm.filterRepo,
                                            disabled: settingsTriggerSubmitting || settingsTriggerGithubReposLoading,
                                            onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, filterRepo: event.target.value })),
                                          },
                                            React.createElement("option", { value: "" },
                                              settingsTriggerGithubReposLoading
                                                ? "Loading repositories..."
                                                : settingsTriggerGithubRepos.length === 0
                                                  ? "No repositories found"
                                                  : "Any connected repo"
                                            ),
                                            settingsTriggerGithubRepos.map((repo) =>
                                              React.createElement("option", { key: repo.id, value: repo.fullName }, repo.fullName)
                                            )
                                          )
                                        )
                                      ),
                                      React.createElement("div", { className: "playground-tasks-detail-fact" },
                                        React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Branch Filter"),
                                        React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                          React.createElement("input", {
                                            type: "text",
                                            className: "playground-environments-input playground-tasks-detail-fact-select",
                                            value: settingsTriggerForm.filterBranch,
                                            disabled: settingsTriggerSubmitting,
                                            onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, filterBranch: event.target.value })),
                                            placeholder: "main",
                                          })
                                        )
                                      ),
                                      settingsTriggerGithubReposError
                                        ? React.createElement("div", { className: "playground-environments-muted", style: { color: "#ffb0b0" } }, settingsTriggerGithubReposError)
                                        : null
                                    )
                                  )
                            )
                          : settingsTriggerForm.source === "gitlab"
                            ? React.createElement("div", { className: "playground-tasks-project-modal-field" },
                                React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Filters"),
                                React.createElement("div", { className: "playground-settings-trigger-connect-card", style: { marginBottom: 8 } },
                                  React.createElement("div", { className: "playground-environments-muted" }, "Set a GitLab webhook secret in ACP, then configure the project webhook in GitLab. Add a GITLAB_TOKEN secret on the selected computer if you want ACP to comment back on merge requests.")
                                ),
                                React.createElement("div", { className: "playground-environment-composer-runtime-facts" },
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Project Filter"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                      React.createElement("input", {
                                        type: "text",
                                        className: "playground-environments-input playground-tasks-detail-fact-select",
                                        value: settingsTriggerForm.filterRepo,
                                        disabled: settingsTriggerSubmitting,
                                        onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, filterRepo: event.target.value })),
                                        placeholder: "group/project",
                                      })
                                    )
                                  ),
                                  React.createElement("div", { className: "playground-tasks-detail-fact" },
                                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Branch Filter"),
                                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                      React.createElement("input", {
                                        type: "text",
                                        className: "playground-environments-input playground-tasks-detail-fact-select",
                                        value: settingsTriggerForm.filterBranch,
                                        disabled: settingsTriggerSubmitting,
                                        onChange: (event) => setSettingsTriggerForm((current) => ({ ...current, filterBranch: event.target.value })),
                                        placeholder: "main",
                                      })
                                    )
                                  )
                                )
                              )
                            : null
                      ),
                      settingsTriggersError
                        ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, settingsTriggersError)
                        : null,
                      React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: closeSettingsTriggerComposer,
                          disabled: settingsTriggerSubmitting,
                        }, "Cancel"),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "submit",
                          className: "playground-environments-action-button is-primary",
                          disabled: settingsTriggerSubmitting || !canCreateSettingsTrigger,
                        }, settingsTriggerSubmitting ? "Creating..." : "Create Webhook")
                      )
                    )
                  )
                )
              : null;
  
            if (options.composerOnly) {
              return settingsTriggerComposerDialog;
            }
  
            const content = React.createElement(React.Fragment, null,
              renderSettingsBanner("error", settingsTriggersError),
              renderSettingsBanner("success", settingsTriggersSuccess),
              settingsSelectedTrigger
                ? (() => {
                    const sourceMeta = getSettingsTriggerSourceMeta(settingsSelectedTrigger.source);
                    const TriggerIcon = sourceMeta.icon;
                    return React.createElement(React.Fragment, null,
                      renderSettingsSectionCard(
                        settingsSelectedTrigger.name || "Webhook",
                        sourceMeta.label + " · " + (settingsSelectedTrigger.event || "event") + " · " + getSettingsTriggerActionLabel(settingsSelectedTrigger.action),
                        React.createElement("div", { className: "playground-settings-card-stack" },
                          React.createElement("div", { className: "playground-settings-inline-row" },
                            React.createElement("div", { className: "playground-settings-inline-row-main" },
                              React.createElement("div", { className: "playground-settings-empty-icon is-inline" },
                                React.createElement(TriggerIcon, { width: 18, height: 18, strokeWidth: 1.8 })
                              ),
                              React.createElement("div", null,
                                React.createElement("div", { className: "playground-settings-emphasis" }, settingsSelectedTrigger.name || "Webhook"),
                                React.createElement("div", { className: "playground-settings-muted-copy" },
                                  settingsSelectedTrigger.lastTriggeredAt
                                    ? "Last triggered " + formatSettingsDateTime(settingsSelectedTrigger.lastTriggeredAt)
                                    : "No runs yet"
                                )
                              )
                            ),
                            React.createElement("div", { className: "playground-settings-chip-row" },
                              renderSettingsChip(settingsSelectedTrigger.enabled ? "Enabled" : "Disabled", settingsSelectedTrigger.enabled ? "success" : "muted")
                            )
                          ),
                          React.createElement("div", { className: "playground-settings-form-grid" },
                            React.createElement("div", { className: "playground-settings-field" },
                              React.createElement("label", { className: "playground-settings-label" }, "Webhook URL"),
                              React.createElement("div", { className: "playground-settings-code-row" },
                                React.createElement("code", { className: "playground-settings-code" }, settingsSelectedTrigger.webhookUrl || "Unavailable"),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-settings-icon-button",
                                  onClick: () => {
                                    void handleSettingsCopyField(settingsSelectedTrigger.webhookUrl, "trigger-url");
                                  },
                                }, settingsCopiedField === "trigger-url" ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 }) : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8 }))
                              )
                            ),
                            React.createElement("div", { className: "playground-settings-field" },
                              React.createElement("label", { className: "playground-settings-label" }, "Webhook Secret"),
                              React.createElement("div", { className: "playground-settings-code-row" },
                                React.createElement("code", { className: "playground-settings-code" }, settingsShowTriggerSecret ? (settingsSelectedTrigger.webhookSecret || "Unavailable") : "••••••••••••••••••••"),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-settings-icon-button",
                                  onClick: () => setSettingsShowTriggerSecret((current) => !current),
                                }, settingsShowTriggerSecret ? React.createElement(EyeOff, { width: 14, height: 14, strokeWidth: 1.8 }) : React.createElement(Eye, { width: 14, height: 14, strokeWidth: 1.8 })),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-settings-icon-button",
                                  onClick: () => {
                                    void handleSettingsCopyField(settingsSelectedTrigger.webhookSecret, "trigger-secret");
                                  },
                                }, settingsCopiedField === "trigger-secret" ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 }) : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8 }))
                              )
                            )
                          )
                        ),
                        React.createElement("div", { className: "playground-settings-form-actions" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-action-button",
                            disabled: settingsTriggerActionId === settingsSelectedTrigger.id,
                            onClick: () => {
                              void handleSettingsToggleTrigger(settingsSelectedTrigger);
                            },
                          }, React.createElement("span", null, settingsTriggerActionId === settingsSelectedTrigger.id && settingsTriggerActionType === "toggle" ? "Updating..." : (settingsSelectedTrigger.enabled ? "Disable" : "Enable"))),
                          React.createElement(PlatformPrimaryButton, {
                            size: "medium",
                            type: "button",
                            className: "playground-environments-action-button is-primary",
                            disabled: settingsTriggerActionId === settingsSelectedTrigger.id,
                            onClick: () => {
                              void handleSettingsTestTrigger(settingsSelectedTrigger);
                            },
                          }, React.createElement("span", null, settingsTriggerActionId === settingsSelectedTrigger.id && settingsTriggerActionType === "test" ? "Testing..." : "Test Fire")),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-action-button playground-settings-danger-action",
                            disabled: settingsTriggerActionId === settingsSelectedTrigger.id,
                            onClick: () => {
                              void handleSettingsDeleteTrigger(settingsSelectedTrigger);
                            },
                          }, React.createElement("span", null, settingsTriggerActionId === settingsSelectedTrigger.id && settingsTriggerActionType === "delete" ? "Deleting..." : "Delete"))
                        )
                      )
                    );
                  })()
                : renderSettingsSectionCard(
                    "Webhook triggers",
                    "Route GitHub, GitLab, Slack, and raw webhook events into agent executions.",
                    settingsTriggersLoading
                      ? React.createElement("div", { className: "playground-settings-loading-state" },
                          React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                        )
                      : settingsTriggers.length === 0
                        ? renderWebhookEmptyState()
                        : React.createElement("div", { className: "playground-settings-listing" },
                            settingsTriggers.map((trigger) => {
                              const sourceMeta = getSettingsTriggerSourceMeta(trigger.source);
                              const TriggerIcon = sourceMeta.icon;
                              return React.createElement("button", {
                                  key: trigger.id,
                                  type: "button",
                                  className: "playground-settings-trigger-card",
                                  onClick: () => setSettingsSelectedTriggerId(trigger.id),
                                },
                                  React.createElement("div", { className: "playground-settings-inline-row" },
                                    React.createElement("div", { className: "playground-settings-inline-row-main" },
                                      React.createElement("div", { className: "playground-settings-empty-icon is-inline" },
                                        React.createElement(TriggerIcon, { width: 18, height: 18, strokeWidth: 1.8 })
                                      ),
                                      React.createElement("div", null,
                                        React.createElement("div", { className: "playground-settings-emphasis" }, trigger.name || "Webhook"),
                                        React.createElement("div", { className: "playground-settings-muted-copy" },
                                          sourceMeta.label + " · " + (trigger.event || "event") + " · " + getSettingsTriggerActionLabel(trigger.action) + (trigger.lastTriggeredAt ? " · " + formatSettingsDate(trigger.lastTriggeredAt) : "")
                                        )
                                      )
                                    ),
                                    React.createElement("div", { className: "playground-settings-chip-row" },
                                      renderSettingsChip(trigger.enabled ? "Active" : "Inactive", trigger.enabled ? "success" : "muted")
                                    )
                                  )
                                );
                            })
                          )
                  ),
              settingsTriggerComposerDialog
            );
  
            if (embedded) {
              const shouldShowEmbeddedEmptyState = !settingsSelectedTrigger && !settingsTriggersLoading && settingsTriggers.length === 0;
              const webhookCountLabel = visibleTriggers.length === 1 ? "Webhook" : "Webhooks";
              return React.createElement("section", { className: "playground-plugins-section playground-develop-webhooks-section" },
                React.createElement("div", { className: "playground-develop-server-metrics-toolbar playground-develop-api-keys-toolbar playground-develop-webhooks-toolbar" },
                  React.createElement("div", { className: "playground-develop-server-metrics-resource-pill" },
                    React.createElement("span", { className: "playground-develop-server-metrics-resource-count" }, String(visibleTriggers.length)),
                    React.createElement("span", { className: "playground-develop-server-metrics-resource-label" }, webhookCountLabel)
                  ),
                  React.createElement("div", { className: "playground-develop-webhooks-actions" },
                    settingsSelectedTrigger
                      ? React.createElement(PlatformSecondaryButton, {
                          type: "button",
                          className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button",
                          onClick: () => {
                            setSettingsSelectedTriggerId("");
                            setSettingsShowTriggerSecret(false);
                          },
                        }, "Back to List")
                      : null,
                    React.createElement(PlatformSecondaryButton, {
                      type: "button",
                      className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-develop-server-metrics-add-button",
                      onClick: openSettingsTriggerComposer,
                    }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }), "Add Webhook")
                  )
                ),
                shouldShowEmbeddedEmptyState
                  ? renderWebhookEmptyState()
                  : null,
                shouldShowEmbeddedEmptyState
                  ? settingsTriggerComposerDialog
                  : content
              );
            }
  
            return React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
              renderSettingsDetailHeader(
                "Webhooks",
                "Create triggers that launch agent work automatically when external events arrive.",
                React.createElement(React.Fragment, null,
                  settingsSelectedTrigger
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: () => {
                          setSettingsSelectedTriggerId("");
                          setSettingsShowTriggerSecret(false);
                        },
                      }, React.createElement("span", null, "Back to List"))
                    : React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                        type: "button",
                        className: "playground-environments-action-button is-primary",
                        onClick: openSettingsTriggerComposer,
                      },
                        React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "New Webhook")
                      ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => {
                      void loadSettingsTriggers();
                    },
                  },
                    React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Refresh")
                  )
                )
              ),
              content
            );
          }
  
          function renderPluginsPageNav() {
            const isTagsView = toolsView === "tags";
            const currentToolsCatalog = toolsView === "plugins"
              ? buildPluginsCatalog()
              : isTagsView
                ? buildTagsCatalog()
                : [];
            const selectedPlugin = toolsView === "plugins" || isTagsView
              ? currentToolsCatalog.find((plugin) => plugin.id === selectedPluginId) || null
              : null;
            const handleDisconnectAllPlugins = async () => {
              const hasConnectedPlugin = isTagsView
                ? Boolean(
                    (settingsEmailStatus?.linked && settingsEmailStatus?.verified)
                    || (settingsDiscordStatus?.linked && settingsDiscordStatus?.verified)
                    || (settingsTelegramStatus?.linked && settingsTelegramStatus?.verified)
                  )
                : Boolean(
                    githubStatus?.connected
                    || gmailStatus?.connected
                    || googleDriveStatus?.connected
                    || oneDriveStatus?.connected
                    || notionStatus?.connected
                  );
              if (!hasConnectedPlugin) {
                setPluginsNavPopover("");
                return;
              }
              if (!window.confirm("Disconnect all connected " + (isTagsView ? "tags" : "plugins") + " from this account?")) {
                return;
              }
              setPluginsNavPopover("");
              if (isTagsView) {
                if (settingsEmailStatus?.linked && settingsEmailStatus?.verified) {
                  await handleSettingsUnlinkEmail();
                }
                if (settingsDiscordStatus?.linked && settingsDiscordStatus?.verified) {
                  await handleSettingsUnlinkDiscord();
                }
                if (settingsTelegramStatus?.linked && settingsTelegramStatus?.verified) {
                  await handleSettingsUnlinkTelegram();
                }
              } else {
                if (githubStatus?.connected) {
                  await handleGithubAuthDisconnect();
                }
                if (googleDriveStatus?.connected) {
                  await handleGoogleDriveAuthDisconnect();
                }
                if (gmailStatus?.connected) {
                  await handleGmailAuthDisconnect();
                }
                if (oneDriveStatus?.connected) {
                  await handleOneDriveAuthDisconnect();
                }
                if (notionStatus?.connected) {
                  await handleNotionAuthDisconnect();
                }
              }
            };
  
            const handleDeleteAllWebhooks = async () => {
              if (!settingsTriggers.length) {
                setPluginsNavPopover("");
                return;
              }
              if (!window.confirm("Delete all webhook actions? This cannot be undone.")) {
                return;
              }
              setPluginsNavPopover("");
              for (const trigger of settingsTriggers) {
                await handleSettingsDeleteTrigger(trigger);
              }
            };
  
            const isPluginsView = toolsView === "plugins";
            const isSkillsView = toolsView === "skills";
            const isActionsView = toolsView === "actions";
            const isPluginsDetailView = (isPluginsView || isTagsView) && Boolean(selectedPlugin);
            const isSkillsDetailView = isSkillsView && toolsSkillsHeaderState.mode === "detail";
            const hasMenu = ((isPluginsView || isTagsView) && !isPluginsDetailView) || isActionsView;
            const toolsOverviewTitle = isActionsView
              ? "Actions"
              : isSkillsView
                ? "Skills"
                : "Tags and Plugins";
            const toolsWorkspaceRoot = isActionsView ? "Develop" : "Configure";
  
            return renderAppHeader({
              pathItems: isPluginsDetailView
                ? [
                    { label: toolsWorkspaceRoot },
                    { label: toolsOverviewTitle, onClick: () => setSelectedPluginId("") },
                    { label: selectedPlugin?.label || "Plugin" },
                  ]
                : isSkillsDetailView
                  ? [
                      { label: toolsWorkspaceRoot },
                      { label: toolsOverviewTitle, onClick: () => setToolsSkillsBackRequestToken((current) => current + 1) },
                      { label: toolsSkillsHeaderState.title || "Skill" },
                    ]
                  : [{ label: toolsWorkspaceRoot }, { label: toolsOverviewTitle }],
              rightRef: pluginsNavActionsRef,
              includeSearchDivider: isSkillsView || ((isPluginsView || isTagsView) && !isPluginsDetailView),
              extraActions: React.createElement(React.Fragment, null,
                isActionsView && !settingsSelectedTrigger
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-files-toolbar-anchor" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-files-header-icon-button is-plain",
                          onClick: openSettingsTriggerComposer,
                          title: "New webhook",
                          "aria-label": "New webhook",
                        }, React.createElement(Plus, { width: 16, height: 16, strokeWidth: 1.8 }))
                      ),
                      React.createElement("div", { className: "playground-files-toolbar-anchor" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-files-header-icon-button is-plain",
                          onClick: () => {
                            void loadSettingsTriggers();
                          },
                          title: "Refresh",
                          "aria-label": "Refresh",
                        }, React.createElement(RefreshCw, { width: 16, height: 16, strokeWidth: 1.8 }))
                      )
                    )
                  : null,
                ((isPluginsView || isTagsView) && !isPluginsDetailView) || (isSkillsView && !isSkillsDetailView)
                  ? React.createElement("div", {
                      id: "playground-tools-overview-controls",
                      className: "playground-tools-overview-controls-slot",
                    })
                  : null,
                isSkillsView
                  ? React.createElement("div", {
                      id: "playground-tools-skills-nav-actions",
                      className: "playground-tools-skills-nav-actions-slot",
                    })
                  : null,
                hasMenu
                  ? React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-header-icon-button is-plain" + (pluginsNavPopover === "menu" ? " is-active" : ""),
                        "aria-label": "Tools actions",
                        "aria-expanded": pluginsNavPopover === "menu" ? "true" : "false",
                        onClick: () => setPluginsNavPopover((current) => current === "menu" ? "" : "menu"),
                        title: "More actions",
                      }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.75 })),
                      pluginsNavPopover === "menu"
                        ? React.createElement(PlatformPopupSurface, {
                            className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                          },
                            isPluginsView || isTagsView
                              ? React.createElement("button", {
                                  type: "button",
                                  className: "tb-popup-row",
                                  onClick: () => {
                                    void handleDisconnectAllPlugins();
                                  },
                                },
                                  React.createElement(Unlink, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                    React.createElement("span", null, "Disconnect all " + (isTagsView ? "tags" : "plugins"))
                                  )
                                )
                              : React.createElement("button", {
                                  type: "button",
                                  className: "tb-popup-row playground-tasks-detail-menu-item-danger",
                                  onClick: () => {
                                    void handleDeleteAllWebhooks();
                                  },
                                },
                                  React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                    React.createElement("span", null, "Remove all webhooks")
                                  )
                                )
                          )
                        : null
                    )
                  : null
              ),
            });
          }
  
          function renderPluginsPage() {
            if (toolsView === "skills") {
              return React.createElement(PlaygroundSkillsPage, {
                skills: demoSkills,
                fetchSkills: handleFetchSkills,
                backendUrl: proxyBackendBase,
                requestHeaders,
                environments: realEnvironments,
                projectId: settingsProjectRoutingId,
                apiKey: effectiveApiKey,
                upstreamUrl: resolvedUpstreamUrl,
                topNavActionsPortalId: "playground-tools-skills-nav-actions",
                onToolsSkillsHeaderChange: setToolsSkillsHeaderState,
                backRequestToken: toolsSkillsBackRequestToken,
                openSkillRequest: toolsSkillsOpenRequest,
                enabledSkillIds: runnerEnabledSkillIds,
                onSkillsChange: setRunnerEnabledSkillIds,
              });
            }
  
            if (toolsView === "actions") {
              return React.createElement("section", { className: "playground-environments-detail playground-plugins-detail" },
                React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                  React.createElement("div", { className: "playground-plugins-page" },
                    renderWebhookActionsPanel({ embedded: true, searchQuery: "", showEmbeddedListActions: false })
                  )
                )
              );
            }
  
            const isTagsView = toolsView === "tags";
            const tagsCatalog = buildTagsCatalog();
            const pluginCatalog = buildPluginsCatalog();
            const pluginsCatalog = isTagsView ? tagsCatalog : pluginCatalog;
            const selectedPlugin = pluginsCatalog.find((plugin) => plugin.id === selectedPluginId) || null;
            if (!selectedPlugin) {
              const buildConnectionOverviewRows = (catalog, kind) => catalog.map((plugin) => {
                const isTag = kind === "tags";
                const preferredAction = Array.isArray(plugin?.actions) ? plugin.actions[0] : null;
                const category = String(plugin?.category || "").trim().toLowerCase() === "channels"
                  ? "channel"
                  : "workspace";
                const identityLabel = isTag
                  ? String(getCurrentTagDetailConfig(plugin?.id).connectedIdentity || plugin?.statusCopy || "").trim() || "Not connected"
                  : String(plugin?.statusCopy || "").trim() || (plugin?.connected ? "Connected" : "Not connected");
                return {
                  ...plugin,
                  id: String(plugin?.id || ""),
                  name: String(plugin?.label || plugin?.id || (isTag ? "Tag" : "Plugin")),
                  searchText: [plugin?.label, plugin?.description, plugin?.category, identityLabel].filter(Boolean).join(" "),
                  icon: renderPluginRowLogo(plugin),
                  connected: Boolean(plugin?.connected),
                  identityLabel,
                  providerLabel: String(plugin?.category || (isTag ? "Channel" : "Integration")).trim() || (isTag ? "Channel" : "Integration"),
                  category,
                  connectionAction: preferredAction
                    ? {
                        label: preferredAction.label,
                        tone: preferredAction.tone === "destructive" ? "destructive" : "default",
                        onSelect: preferredAction.onClick,
                      }
                    : undefined,
                };
              });
              const tagRows = buildConnectionOverviewRows(tagsCatalog, "tags");
              const pluginRows = buildConnectionOverviewRows(pluginCatalog, "plugins");
              const overviewPage = React.createElement(TagsOverviewPage, {
                mode: isTagsView ? "tags" : "plugins",
                onModeChange: (mode) => {
                  setSelectedPluginId("");
                  setToolsView(mode);
                },
                tagRows,
                pluginRows,
                period: connectionsOverviewChartTimescale,
                onPeriodChange: setConnectionsOverviewChartTimescale,
                controlsPortalId: "playground-tools-overview-controls",
                onOpenTag: (plugin) => {
                  setToolsView("tags");
                  setSelectedPluginId(plugin.id);
                },
                onOpenPlugin: (plugin) => {
                  setToolsView("plugins");
                  setSelectedPluginId(plugin.id);
                },
              });
  
              return React.createElement("section", {
                className: "playground-environments-detail playground-plugins-detail playground-skills-page playground-resources-page playground-tags-overview-page is-develop-configure-page",
              }, overviewPage);
            }
  	          if (selectedPlugin) {
              const pluginHeaderButtonClass = "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-develop-server-metrics-add-button playground-plugin-detail-connect-button";
              const pluginHeaderAction = (() => {
                if (selectedPlugin.id === "email") {
                  return settingsEmailStatus?.linked && settingsEmailStatus?.verified
                    ? React.createElement("button", {
                        type: "button",
                        className: pluginHeaderButtonClass + " is-destructive",
                        onClick: () => {
                          void handleSettingsUnlinkEmail();
                        },
                        disabled: settingsIsUnlinkingEmail,
                      }, settingsIsUnlinkingEmail ? "Disconnecting..." : "Disconnect")
                    : null;
                }
                if (selectedPlugin.id === "telegram") {
                  return settingsTelegramStatus?.linked && settingsTelegramStatus?.verified
                    ? React.createElement("button", {
                        type: "button",
                        className: pluginHeaderButtonClass + " is-destructive",
                        onClick: () => {
                          void handleSettingsUnlinkTelegram();
                        },
                        disabled: settingsIsUnlinkingTelegram,
                      }, settingsIsUnlinkingTelegram ? "Disconnecting..." : "Disconnect")
                    : null;
                }
  
                const actions = Array.isArray(selectedPlugin.actions) ? selectedPlugin.actions : [];
                const preferredAction = actions.find((action) => action?.tone === "destructive")
                  || actions.find((action) => action?.tone === "primary")
                  || actions[0]
                  || null;
                if (!preferredAction) {
                  return null;
                }
                const disabled = selectedPlugin.id === "discord"
                  ? Boolean((preferredAction.tone === "destructive" && settingsIsUnlinkingDiscord) || (preferredAction.tone === "primary" && settingsIsLinkingDiscord))
                  : false;
                const label = selectedPlugin.id === "discord" && preferredAction.tone === "destructive" && settingsIsUnlinkingDiscord
                  ? "Disconnecting..."
                  : selectedPlugin.id === "discord" && preferredAction.tone === "primary" && settingsIsLinkingDiscord
                    ? "Connecting..."
                    : preferredAction.label;
                return React.createElement("button", {
                  type: "button",
                  className: pluginHeaderButtonClass + (preferredAction.tone === "destructive" ? " is-destructive" : ""),
                  onClick: preferredAction.onClick,
                  disabled,
                }, label);
              })();
  
              if (isTagsView) {
                return React.createElement("section", { className: "playground-environments-detail playground-plugins-detail playground-skills-page" },
                  React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                    React.createElement("div", { className: "playground-plugin-detail-page playground-plugin-detail-content playground-agents-detail-content playground-tags-detail-content is-agent-overview-general" },
                      renderTagDetailBody(selectedPlugin)
                    )
                  )
                );
              }
  
              return React.createElement("section", { className: "playground-environments-detail playground-plugins-detail playground-skills-page" },
                React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                    React.createElement("div", { className: "playground-plugin-detail-page playground-plugin-detail-content" + (isTagsView ? " playground-agents-detail-content is-agent-overview-general" : "") },
                    React.createElement("div", { className: "playground-project-overview-summary-title-row playground-develop-header playground-develop-server-kind-header playground-plugin-detail-title-row" },
                      React.createElement("div", { className: "playground-plugin-detail-title-main" },
                        React.createElement("div", { className: "playground-plugin-detail-header-icon-shell" }, renderPluginRowLogo(selectedPlugin)),
                        React.createElement("h1", { className: "playground-project-overview-summary-title playground-develop-title playground-plugin-detail-title" }, selectedPlugin.label)
                      ),
                      pluginHeaderAction
                        ? React.createElement("div", { className: "playground-project-overview-summary-title-actions playground-develop-header-actions" },
                            pluginHeaderAction
                          )
                        : null
                    ),
                    React.createElement("div", { className: "playground-agents-overview-tabs playground-plugin-detail-tabs" },
                      React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-project-overview-chart-tab" + (pluginDetailTab === "general" ? " is-active" : ""),
                          onClick: () => setPluginDetailTab("general"),
                          "aria-pressed": pluginDetailTab === "general" ? "true" : "false",
                        }, "General"),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-project-overview-chart-tab" + (pluginDetailTab === "permissions" ? " is-active" : ""),
                          onClick: () => setPluginDetailTab("permissions"),
                          "aria-pressed": pluginDetailTab === "permissions" ? "true" : "false",
                        }, "Permissions"),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-project-overview-chart-tab" + (pluginDetailTab === "tutorial" ? " is-active" : ""),
                          onClick: () => setPluginDetailTab("tutorial"),
                          "aria-pressed": pluginDetailTab === "tutorial" ? "true" : "false",
                        }, isTagsView ? "Setup" : "Tutorial")
                        )
                    ),
                    isTagsView
                      ? renderTagDetailBody(selectedPlugin)
                      : renderPluginDetailBody(selectedPlugin)
                  )
                )
              );
            }
  
            return null;
          }
  

          const handleEnvironmentsHomeThreadOpen = (threadId) => {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId || typeof onThreadOpen !== "function") {
              return;
            }
            setEnvironmentsHomeActiveResourceCommand("");
            setEnvironmentsHomeResourceCommandRequest(null);
            onThreadOpen(normalizedThreadId);
          };
  
          const handleEnvironmentsHomeThreadStartRequest = (runRequest) => {
            const normalizedThreadId = String(runRequest?.threadId || "").trim();
            const normalizedPrompt = String(runRequest?.prompt || "").trim();
            if (!normalizedThreadId || !normalizedPrompt || typeof onThreadStarted !== "function") {
              return false;
            }
            setEnvironmentsHomeActiveResourceCommand("");
            setEnvironmentsHomeResourceCommandRequest(null);
            onThreadStarted(normalizedThreadId, {
              taskRunRequest: {
                token: runRequest.token || (Date.now().toString(36) + Math.random().toString(36).slice(2)),
                prompt: normalizedPrompt,
                attachments: Array.isArray(runRequest.attachments) ? runRequest.attachments : [],
                githubRepo: runRequest.githubRepo || null,
                enabledSkills: runRequest.enabledSkills || null,
                connectors: runRequest.connectors || null,
                environmentId: typeof runRequest.environmentId === "string" ? runRequest.environmentId : "",
                quotedSelection: runRequest.quotedSelection || null,
                executionStarted: false,
              },
            });
            return true;
          };
  
          function EnvironmentsHomeResponsiveSvgShared({ frameClassName, frameHeight, svgHeight, fallbackWidth = 640, ariaLabel, svgClassName, children }) {
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
            const resolvedSvgHeight = Math.max(1, Math.round(svgHeight || frameHeight || 208));
  
            return React.createElement("div", {
                ref: frameRef,
                className: frameClassName,
                style: frameHeight ? { height: String(frameHeight) + "px" } : undefined,
              },
              React.createElement("svg", {
                className: svgClassName || "playground-settings-usage-chart-svg",
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
  
          const renderPlaygroundConfigureUsageEmptyState = (imageName, title, copy) =>
            React.createElement("div", { className: "playground-settings-usage-chart-empty is-tall playground-auth-users-empty-state playground-configure-usage-empty-state" },
              React.createElement("img", {
                className: "playground-auth-users-empty-state-image",
                src: "/img/empty-state/" + imageName,
                alt: "",
                "aria-hidden": "true",
                draggable: "false",
              }),
              React.createElement("div", { className: "playground-auth-users-empty-state-title" }, title),
              React.createElement("div", { className: "playground-auth-users-empty-state-copy" }, copy)
            );
  
          const renderHomeStackedUsageChartShared = ({ ariaLabel, labels, series, emptyText, emptyContent, title, timescaleControl, tickFormatter, isLoading, showLegend = true, controlsInFooter = false, hideHeader = false }) => {
            const normalizedLabels = Array.isArray(labels) ? labels : [];
            const normalizedSeries = Array.isArray(series)
              ? series.filter((entry) => entry && Array.isArray(entry.values))
              : [];
  
            const frameHeight = 270;
            const svgHeight = 270;
            const marginTop = 12;
            const marginRight = 14;
            const marginBottom = 64;
            const marginLeft = 58;
            const totals = normalizedLabels.map((_, index) =>
              normalizedSeries.reduce((sum, entry) => sum + Math.max(0, Number(entry.values[index] || 0)), 0)
            );
            const hasUsageData = totals.some((value) => Math.max(0, Number(value || 0)) > 0);
            const shouldShowEmptyState = !normalizedLabels.length || !normalizedSeries.length || !hasUsageData;
            const yMax = Math.max(1, ...totals, 1);
            const gridLineCount = 4;
            const formatTick = typeof tickFormatter === "function"
              ? tickFormatter
              : (value) => String(Math.round(value));
            const labelStep = Math.max(1, Math.ceil(normalizedLabels.length / 7));
            const visibleLabelIndexes = (() => {
              const next = [];
              for (let index = 0; index < normalizedLabels.length; index += labelStep) {
                next.push(index);
              }
              const lastIndex = normalizedLabels.length - 1;
              if (lastIndex >= 0 && !next.includes(lastIndex)) {
                if (next.length > 0 && lastIndex - next[next.length - 1] < 2) {
                  next[next.length - 1] = lastIndex;
                } else {
                  next.push(lastIndex);
                }
              }
              return new Set(next);
            })();
            const chartLegend = showLegend
              ? React.createElement("div", {
                  className: "playground-settings-usage-inline-legend" + (controlsInFooter ? " playground-develop-server-metrics-legend" : ""),
                  style: { justifyContent: "flex-start" },
                },
                  normalizedSeries.map((entry) =>
                    React.createElement("div", { key: entry.id || entry.label, className: "playground-settings-usage-legend-item" },
                      React.createElement("span", {
                        className: "playground-settings-usage-legend-swatch",
                        style: { background: entry.color },
                      }),
                      React.createElement("span", null, entry.label)
                    )
                  )
                )
              : null;
  
            return React.createElement("div", { className: "playground-settings-usage-chart-card" },
              hideHeader
                ? null
                : React.createElement("div", { className: "playground-project-overview-chart-header" },
                  React.createElement("div", { className: "playground-project-overview-chart-header-main" },
                    React.createElement("div", { className: "playground-project-overview-chart-title" }, title || "Activity comparison"),
                    controlsInFooter ? null : (timescaleControl || null)
                  )
                )
              ,
              isLoading
                ? React.createElement("div", {
                    className: "playground-project-overview-chart-shell",
                    style: { height: String(frameHeight) + "px" },
                  },
                    React.createElement("div", {
                        className: "playground-overview-chart-loading",
                        style: { position: "static", inset: "auto", height: "100%" },
                        "aria-label": "Loading chart data",
                      },
                      React.createElement(Loader2, { className: "playground-overview-chart-loading-icon", strokeWidth: 1.8 })
                    )
                  )
                : shouldShowEmptyState
                  ? (emptyContent || React.createElement("div", { className: "playground-settings-usage-chart-empty" }, emptyText || "No usage data yet"))
                  : React.createElement(EnvironmentsHomeResponsiveSvgShared, {
                      frameClassName: "playground-project-overview-chart-shell",
                      frameHeight,
                      svgHeight,
                      fallbackWidth: 1200,
                      ariaLabel: ariaLabel || "Usage chart",
                    }, ({ svgWidth, svgHeight: measuredSvgHeight }) => {
                      const plotWidth = svgWidth - marginLeft - marginRight;
                      const plotHeight = measuredSvgHeight - marginTop - marginBottom;
                      const slotWidth = plotWidth / Math.max(normalizedLabels.length, 1);
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
                              fontSize: "12",
                              fontFamily: "Inter, sans-serif",
                              fontWeight: "400",
                            }, formatTick(tickValue))
                          );
                        }),
                        normalizedLabels.map((label, index) => {
                          const x = marginLeft + slotWidth * index + (slotWidth - barWidth) / 2;
                          const isFirstLabel = index === 0;
                          const isLastLabel = index === normalizedLabels.length - 1;
                          const labelX = isFirstLabel
                            ? marginLeft
                            : isLastLabel
                              ? svgWidth - marginRight
                              : marginLeft + slotWidth * index + slotWidth / 2;
                          let stackOffsetY = baselineY;
                          return React.createElement(React.Fragment, { key: "stack:" + index },
                            normalizedSeries.map((entry, seriesIndex) => {
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
                                  y: measuredSvgHeight - 28,
                                  textAnchor: isFirstLabel ? "start" : (isLastLabel ? "end" : "middle"),
                                  dominantBaseline: "middle",
                                  fill: "rgba(255,255,255,0.4)",
                                  fontSize: "12",
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: "400",
                                }, label)
                              : null
                          );
                        })
                      );
                    }
                  ),
              controlsInFooter
                ? React.createElement("div", { className: "playground-develop-server-metrics-footer" },
                    React.createElement("div", { className: "playground-develop-server-metrics-footer-left" }, !isLoading && !shouldShowEmptyState ? chartLegend : null),
                    timescaleControl || null
                  )
                : (!isLoading && !shouldShowEmptyState ? chartLegend : null)
            );
          };
  
          function getActiveResourcesOverviewHomeTab() {
            if (isServersMode) {
              if (normalizedEmbeddedServerKind) {
                return "general";
              }
              return resourcesOverviewHomeTab === "types" || resourcesOverviewHomeTab === "settings"
                ? resourcesOverviewHomeTab
                : "general";
            }
            if (embeddedInResources) {
              return "general";
            }
            return resourcesOverviewHomeTab === "profiles" ? "profiles" : "general";
          }
  
          function renderResourcesOverviewHomeTabs() {
            if (embeddedInResources && !isServersMode) {
              return null;
            }
            const activeTab = getActiveResourcesOverviewHomeTab();
            const tabs = isServersMode
              ? (normalizedEmbeddedServerKind
                ? [{ id: "general", label: "General" }]
                : [
                  { id: "general", label: "General" },
                  { id: "types", label: "Types" },
                  { id: "settings", label: "Settings" },
                ])
              : [
                  { id: "general", label: "General" },
                  { id: "profiles", label: "Profiles" },
                ];
            if (tabs.length <= 1) {
              return null;
            }
            const isDevelopConfigureTabs = embeddedInResources && (!isServersMode || Boolean(normalizedEmbeddedServerKind));
            return React.createElement("div", {
                className: "playground-agents-overview-tabs playground-resources-overview-tabs"
                  + (isDevelopConfigureTabs ? " playground-project-overview-tabs playground-develop-tabs playground-develop-server-kind-tabs" : ""),
              },
              React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                tabs.map((tab) =>
                  React.createElement("button", {
                    key: tab.id,
                    type: "button",
                    className: "playground-project-overview-chart-tab" + (activeTab === tab.id ? " is-active" : ""),
                    onClick: () => {
                      setResourcesOverviewHomeTab(tab.id);
                      setResourcesOverviewToolbarPopover("");
                    },
                    "aria-pressed": activeTab === tab.id ? "true" : "false",
                  }, tab.label)
                )
              )
            );
          }
  
          function renderEnvironmentsHome(overviewListContent = null) {
  	          const shouldRenderCanonicalDevelopResourceOverview = embeddedInResources
  	            && isServersMode
  	            && Boolean(normalizedEmbeddedServerKind);
  	          if (shouldRenderCanonicalDevelopResourceOverview) {
  	            const canonicalPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(developServerOperationalMetricsPeriod);
  	            const metricsMatchCurrentResource = String(developServerOperationalMetrics?.scopeKind || "").trim() === normalizedEmbeddedServerKind
  	              && normalizePlaygroundEnvironmentHomeChartPeriod(developServerOperationalMetrics?.period) === canonicalPeriod;
  	            if (normalizedEmbeddedServerKind === "voice_agent") {
  	              const voiceRows = createDevelopVoiceAgentOverviewRows(
  	                voiceAgentRecords,
	                voiceAgentDraftsById,
	                voiceAgentsState,
	                voiceAgentSessionResultsById,
	                getCurrentDevelopResourceIdentityInput()
	              );
	              return React.createElement(DevelopVoiceAgentsOverviewPage, {
	                rows: voiceRows,
	                period: canonicalPeriod,
	                onPeriodChange: onDevelopServerOperationalMetricsPeriodChange || updateEnvironmentHomeChartTimescale,
	                controlsPortalId: "playground-resource-overview-controls",
	                operationalMetrics: metricsMatchCurrentResource ? developServerOperationalMetrics : null,
  	                analyticsLoading: Boolean(developServerOperationalMetricsLoading || !metricsMatchCurrentResource),
  	                analyticsError: metricsMatchCurrentResource ? developServerOperationalMetricsError : "",
  	                loading: Boolean(voiceAgentsLoading && voiceRows.length === 0),
  	                error: voiceAgentsState.error,
  	                message: voiceAgentsState.message,
  	                modeOptions: PLAYGROUND_VOICE_AGENT_MODE_OPTIONS,
  	                modelOptions: PLAYGROUND_VOICE_AGENT_MODEL_OPTIONS,
  	                onRefresh: () => void loadVoiceAgents({ force: true }),
  	                onChange: (row, patch) => updateVoiceAgentDraft(row.id, {
  	                  ...(Object.prototype.hasOwnProperty.call(patch, "mode") ? { voiceMode: patch.mode } : {}),
  	                  ...(Object.prototype.hasOwnProperty.call(patch, "model") ? { voiceModel: patch.model } : {}),
  	                  ...(Object.prototype.hasOwnProperty.call(patch, "voiceId") ? { voiceId: patch.voiceId } : {}),
  	                  ...(Object.prototype.hasOwnProperty.call(patch, "languageHint") ? { voiceLanguageHint: patch.languageHint } : {}),
  	                  ...(Object.prototype.hasOwnProperty.call(patch, "instructions") ? { voiceInstructions: patch.instructions } : {}),
  	                }),
  	                onSave: (row) => saveVoiceAgentConfig(row.id),
  	                onTest: async (row) => {
  	                  const savedRecord = await saveVoiceAgentConfig(row.id);
  	                  if (savedRecord) await createVoiceAgentTestSession(row.id);
  	                },
  	                onProvision: async (row) => {
  	                  const savedRecord = await saveVoiceAgentConfig(row.id);
  	                  if (savedRecord) await provisionVoiceAgentPhoneNumber(row.id);
  	                },
  	                onDisablePhone: (row) => disableVoiceAgentPhoneNumber(row.id),
  	                onOpenThread: typeof onThreadOpen === "function" ? onThreadOpen : undefined,
  	              });
  	            }
  	            const sourceResources = visibleDisplayServerResources.filter((resource) => (
  	              resource?.id !== PLAYGROUND_SERVER_DRAFT_ID
  	              && resource?.id !== PLAYGROUND_DATABASE_DRAFT_ID
  	            ));
  	            const overviewRows = createDevelopResourceOverviewRows(
  	              sourceResources,
  	              normalizedEmbeddedServerKind,
  	              {
  	                formatDate: formatPlaygroundFileDate,
  	                formatExactDate: formatPlaygroundExactDate,
  	              }
  	            );
  	            const sourceByRowId = new Map(sourceResources.map((resource) => [
  	              (resource?.resourceType === "database" ? "database:" : "server:") + String(resource?.id || ""),
  	              resource,
  	            ]));
  	            const resolveSourceResource = (row) => sourceByRowId.get(row.id) || null;
	            const expectedServerCatalogScope = databaseListScopeKey
	              + "|servers|"
	              + normalizedEmbeddedServerKind;
	            const isCurrentServerCatalogLoaded = hasLoadedServers
	              && loadedServerListScope === expectedServerCatalogScope;
	            const isCatalogLoading = normalizedEmbeddedServerKind === "database"
	              ? (!hasLoadedDatabases || databaseListLoading)
	              : (!isCurrentServerCatalogLoaded || serverListLoading);
  	            const deleteOverviewRows = async (rows) => {
  	              const targets = rows.map((row) => ({ row, resource: resolveSourceResource(row) })).filter((entry) => entry.resource);
  	              if (!targets.length) return;
  	              if (targets.length > 1 && !window.confirm("Delete " + String(targets.length) + " selected resources?")) return;
  	              for (const target of targets) {
  	                if (target.row.resourceType === "database") {
  	                  await handleDeleteDatabase(target.row.sourceId, { skipConfirmation: targets.length > 1 });
  	                } else {
  	                  await handleDeleteServer(target.row.sourceId, { skipConfirmation: targets.length > 1 });
  	                }
  	              }
  	            };
  	            return React.createElement(DevelopResourceOverviewRoute, {
  	              kind: normalizedEmbeddedServerKind,
  	              rows: overviewRows,
	              period: canonicalPeriod,
	              onPeriodChange: onDevelopServerOperationalMetricsPeriodChange || updateEnvironmentHomeChartTimescale,
	              controlsPortalId: "playground-resource-overview-controls",
	              periodPortalId: isDevelopResourceCreationModalKind(normalizedEmbeddedServerKind)
	                ? "playground-develop-resource-overview-period-controls"
	                : undefined,
	              operationalMetrics: metricsMatchCurrentResource ? developServerOperationalMetrics : null,
  	              analyticsLoading: Boolean(developServerOperationalMetricsLoading || !metricsMatchCurrentResource),
	              analyticsError: metricsMatchCurrentResource ? developServerOperationalMetricsError : "",
	              loading: overviewRows.length === 0 && isCatalogLoading,
	              error: overviewRows.length === 0 && !serverListLoading && serverSaveState.error
	                ? serverSaveState.error
	                : null,
	              mutating: Boolean(serverSaveState.isSaving || databaseSaveState.isSaving),
  	              onOpen: (row) => row.resourceType === "database" ? handleDatabaseSelect(row.sourceId) : handleServerSelect(row.sourceId),
  	              onCreate: () => handleCreateServer(normalizedEmbeddedServerKind),
  	              onRename: (row) => {
  	                const resource = resolveSourceResource(row);
  	                if (!resource) return;
  	                if (row.resourceType === "database") openDatabaseRenameDialog(resource);
  	                else openServerRenameDialog(resource);
  	              },
  	              onCopy: (row) => {
  	                const resource = resolveSourceResource(row);
  	                if (resource) openServerResourceCopyComposer(resource);
  	              },
  	              onDelete: (rows) => void deleteOverviewRows(rows),
	              onPrefetch: (row) => {
	                if (row.resourceType === "database") {
	                  prefetchDatabaseBootstrap(row.sourceId);
	                }
	              },
  	            });
  	          }
            const renderHomeResourceIcon = (item, className) => {
              if (item?.resourceType === "computer") {
                return React.createElement(HardDrive, { className, strokeWidth: 1.8 });
              }
              if (item?.resourceType === "database" || item?.kind === "database") {
                return React.createElement(Database, { className, strokeWidth: 1.8 });
              }
              if (item?.kind === "function") {
                return React.createElement(FunctionSquare, { className, strokeWidth: 1.8 });
              }
              if (item?.kind === "api") {
                return React.createElement(Code2, { className, strokeWidth: 1.8 });
              }
              if (item?.kind === "auth") {
                return React.createElement(Users, { className, strokeWidth: 1.8 });
              }
              if (item?.kind === "agent_runtime") {
                return React.createElement(Bot, { className, strokeWidth: 1.8 });
              }
              if (item?.kind === "secrets") {
                return React.createElement(Key, { className, strokeWidth: 1.8 });
              }
              return React.createElement(Globe, { className, strokeWidth: 1.8 });
            };
  
            const getHomeResourceKindLabel = (item) => {
              if (item?.resourceType === "computer") {
                return "Computer";
              }
              if (item?.resourceType === "database" || item?.kind === "database") {
                return "Database";
              }
              if (item?.kind === "function") {
                return "Function";
              }
              if (item?.kind === "api") {
                return "API";
              }
  	            if (item?.kind === "auth") {
  	              return "Authentication";
  	            }
              if (item?.kind === "agent_runtime") {
                return "Agent Runtime";
              }
              if (item?.kind === "secrets") {
                return "Secrets";
              }
              return "Web App";
            };
  
            const buildHomeUsageLinePath = (points) => {
              if (!Array.isArray(points) || points.length === 0) {
                return "";
              }
              return points
                .map((point, index) => (index === 0 ? "M " : "L ") + point.x.toFixed(2) + " " + point.y.toFixed(2))
                .join(" ");
            };
  
            function EnvironmentsHomeResponsiveSvg({ frameClassName, frameHeight, svgHeight, fallbackWidth = 640, ariaLabel, children }) {
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
              const resolvedSvgHeight = Math.max(1, Math.round(svgHeight || frameHeight || 208));
  
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
  
            const renderHomeComparisonBarChart = ({ ariaLabel, labels, countValues, costValues, emptyText }) => {
              const normalizedLabels = Array.isArray(labels) ? labels : [];
              const normalizedCountValues = Array.isArray(countValues) ? countValues.map((value) => Math.max(0, Number(value || 0))) : [];
              const normalizedCostValues = Array.isArray(costValues) ? costValues.map((value) => Math.max(0, Number(value || 0))) : [];
              if (
                !normalizedLabels.length
                || normalizedLabels.length !== normalizedCountValues.length
                || normalizedLabels.length !== normalizedCostValues.length
              ) {
                return React.createElement("div", { className: "playground-settings-usage-chart-empty" }, emptyText || "No resource data yet");
              }
  
              const chartHeight = 194;
              const marginTop = 12;
              const marginRight = 42;
              const marginBottom = 28;
              const marginLeft = 58;
              const maxCountValue = Math.max(1, ...normalizedCountValues);
              const maxCostValue = Math.max(1, ...normalizedCostValues);
              const countAxisValues = [maxCountValue, Math.round(maxCountValue / 2), 0];
              const costAxisValues = [maxCostValue, Math.round(maxCostValue / 2), 0];
  
              return React.createElement("div", {
                  className: "playground-database-overview-timeseries-card",
                  "aria-label": ariaLabel || "Environment overview chart",
                },
                React.createElement("div", { className: "playground-environments-home-comparison-header" },
                  React.createElement("div", { className: "playground-environments-home-comparison-copy" },
                    React.createElement("div", { className: "playground-environments-home-comparison-title" }, "Resource comparison"),
                    React.createElement("div", { className: "playground-environments-home-comparison-legend" },
                      React.createElement("span", { className: "playground-environments-home-comparison-legend-item" },
                        React.createElement("span", { className: "playground-environments-home-comparison-legend-dot is-count" }),
                        React.createElement("span", null, "Count")
                      ),
                      React.createElement("span", { className: "playground-environments-home-comparison-legend-item" },
                        React.createElement("span", { className: "playground-environments-home-comparison-legend-dot is-cost" }),
                        React.createElement("span", null, "Running cost")
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "playground-database-overview-timeseries-chart" },
                  React.createElement(EnvironmentsHomeResponsiveSvg, {
                      frameClassName: "playground-database-overview-timeseries-frame",
                      frameHeight: chartHeight,
                      svgHeight: chartHeight,
                      fallbackWidth: 420,
                      ariaLabel: ariaLabel || "Environment overview chart",
                    }, ({ svgWidth, svgHeight }) => {
                      const plotWidth = svgWidth - marginLeft - marginRight;
                      const plotHeight = svgHeight - marginTop - marginBottom;
                      const baselineY = marginTop + plotHeight;
                      const slotWidth = plotWidth / Math.max(normalizedLabels.length, 1);
                      const pairWidth = Math.min(38, Math.max(16, slotWidth * 0.42));
                      const pairGap = Math.min(8, Math.max(4, slotWidth * 0.08));
                      const barWidth = Math.max(5, (pairWidth - pairGap) / 2);
  
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
                        countAxisValues.map((value, index) =>
                          React.createElement("text", {
                            key: "count-axis:" + index,
                            x: 0,
                            y: marginTop + (plotHeight / 2) * index + 4,
                            textAnchor: "start",
                            className: "playground-database-overview-timeseries-axis-label",
                            fontSize: "10",
                          }, String(value))
                        ),
                        costAxisValues.map((value, index) =>
                          React.createElement("text", {
                            key: "cost-axis:" + index,
                            x: svgWidth,
                            y: marginTop + (plotHeight / 2) * index + 4,
                            textAnchor: "end",
                            className: "playground-database-overview-timeseries-axis-label",
                            fontSize: "10",
                          }, formatSettingsComputeTokens(value))
                        ),
                        normalizedLabels.map((label, index) => {
                          const groupX = marginLeft + slotWidth * index + ((slotWidth - pairWidth) / 2);
                          const countHeight = (normalizedCountValues[index] / maxCountValue) * plotHeight;
                          const costHeight = (normalizedCostValues[index] / maxCostValue) * plotHeight;
                          return React.createElement(React.Fragment, { key: "bars:" + index },
                            React.createElement("rect", {
                              x: groupX,
                              y: baselineY - countHeight,
                              width: barWidth,
                              height: Math.max(2, countHeight),
                              rx: "7",
                              ry: "7",
                              className: "playground-database-overview-timeseries-bar is-comparison-count",
                            }),
                            React.createElement("rect", {
                              x: groupX + barWidth + pairGap,
                              y: baselineY - costHeight,
                              width: barWidth,
                              height: Math.max(2, costHeight),
                              rx: "7",
                              ry: "7",
                              className: "playground-database-overview-timeseries-bar is-comparison-cost",
                            })
                          );
                        }),
                        normalizedLabels.map((label, index) =>
                          React.createElement("text", {
                            key: "label:" + index,
                            x: marginLeft + slotWidth * index + (slotWidth / 2),
                            y: svgHeight - 8,
                            textAnchor: "middle",
                            className: "playground-database-overview-timeseries-axis-label",
                            fontSize: "10",
                          }, String(label || ""))
                        )
                      );
                    })
                )
              );
            };
  
            const renderHomeStackedUsageChart = ({ ariaLabel, labels, series, emptyText, emptyContent, title, timescaleControl, tickFormatter, isLoading, controlsInFooter = false, showLegend = true, hideHeader = false, chartCardClassName = "" }) => {
              const normalizedLabels = Array.isArray(labels) ? labels : [];
              const normalizedSeries = Array.isArray(series)
                ? series.filter((entry) => entry && Array.isArray(entry.values))
                : [];
  
              const frameHeight = 270;
              const svgHeight = 270;
              const marginTop = 12;
              const marginRight = 14;
              const marginBottom = 64;
              const marginLeft = 58;
              const totals = normalizedLabels.map((_, index) =>
                normalizedSeries.reduce((sum, entry) => sum + Math.max(0, Number(entry.values[index] || 0)), 0)
              );
              const hasUsageData = totals.some((value) => Math.max(0, Number(value || 0)) > 0);
              const shouldShowEmptyState = !normalizedLabels.length || !normalizedSeries.length || !hasUsageData;
              const yMax = Math.max(1, ...totals, 1);
              const gridLineCount = 4;
              const formatTick = typeof tickFormatter === "function"
                ? tickFormatter
                : (value) => String(Math.round(value));
              const labelStep = Math.max(1, Math.ceil(normalizedLabels.length / 7));
              const visibleLabelIndexes = (() => {
                const next = [];
                for (let index = 0; index < normalizedLabels.length; index += labelStep) {
                  next.push(index);
                }
                const lastIndex = normalizedLabels.length - 1;
                if (lastIndex >= 0 && !next.includes(lastIndex)) {
                  if (next.length > 0 && lastIndex - next[next.length - 1] < 2) {
                    next[next.length - 1] = lastIndex;
                  } else {
                    next.push(lastIndex);
                  }
                }
                return new Set(next);
              })();
  
              const chartLegend = showLegend ? React.createElement("div", {
                  className: controlsInFooter
                    ? "playground-develop-server-metrics-footer-left playground-develop-server-metrics-legend"
                    : "playground-settings-usage-inline-legend",
                  style: controlsInFooter ? undefined : { justifyContent: "flex-start" },
                },
                  normalizedSeries.map((entry) =>
                    React.createElement("div", { key: entry.id || entry.label, className: "playground-settings-usage-legend-item" },
                      React.createElement("span", {
                        className: "playground-settings-usage-legend-swatch",
                        style: { background: entry.color },
                      }),
                      React.createElement("span", null, entry.label)
                    )
                  )
                ) : null;
  
              return React.createElement("div", { className: "playground-settings-usage-chart-card" + (chartCardClassName ? " " + chartCardClassName : "") },
                hideHeader
                  ? null
                  : React.createElement("div", { className: "playground-project-overview-chart-header" },
                      React.createElement("div", { className: "playground-project-overview-chart-header-main" },
                        React.createElement("div", { className: "playground-project-overview-chart-title" }, title || "Activity comparison"),
                        controlsInFooter ? null : (timescaleControl || null)
                      )
                  )
                ,
                isLoading
                  ? React.createElement("div", {
                      className: "playground-project-overview-chart-shell",
                      style: { height: String(frameHeight) + "px" },
                    },
                      React.createElement("div", {
                          className: "playground-overview-chart-loading",
                          style: { position: "static", inset: "auto", height: "100%" },
                          "aria-label": "Loading chart data",
                        },
                        React.createElement(Loader2, { className: "playground-overview-chart-loading-icon", strokeWidth: 1.8 })
                      )
                    )
                  : shouldShowEmptyState
                    ? (emptyContent || React.createElement("div", { className: "playground-settings-usage-chart-empty" }, emptyText || "No usage data yet"))
                    : React.createElement(EnvironmentsHomeResponsiveSvg, {
                        frameClassName: "playground-project-overview-chart-shell",
                        frameHeight,
                        svgHeight,
                        fallbackWidth: 1200,
                        ariaLabel: ariaLabel || "Usage chart",
                      }, ({ svgWidth, svgHeight: measuredSvgHeight }) => {
                        const plotWidth = svgWidth - marginLeft - marginRight;
                        const plotHeight = measuredSvgHeight - marginTop - marginBottom;
                        const slotWidth = plotWidth / Math.max(normalizedLabels.length, 1);
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
                                fontSize: "12",
                                fontFamily: "Inter, sans-serif",
                                fontWeight: "400",
                              }, formatTick(tickValue))
                            );
                          }),
                          normalizedLabels.map((label, index) => {
                            const x = marginLeft + slotWidth * index + (slotWidth - barWidth) / 2;
                            const isFirstLabel = index === 0;
                            const isLastLabel = index === normalizedLabels.length - 1;
                            const labelX = isFirstLabel
                              ? marginLeft
                              : isLastLabel
                                ? svgWidth - marginRight
                                : marginLeft + slotWidth * index + slotWidth / 2;
                            let stackOffsetY = baselineY;
                            return React.createElement(React.Fragment, { key: "stack:" + index },
                              normalizedSeries.map((entry, seriesIndex) => {
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
                                    y: measuredSvgHeight - 28,
                                    textAnchor: isFirstLabel ? "start" : (isLastLabel ? "end" : "middle"),
                                    dominantBaseline: "middle",
                                    fill: "rgba(255,255,255,0.4)",
                                    fontSize: "12",
                                    fontFamily: "Inter, sans-serif",
                                    fontWeight: "400",
                                  }, label)
                                : null
                            );
                          })
                        );
                      }
                    ),
                controlsInFooter
                  ? React.createElement("div", { className: "playground-develop-server-metrics-footer" },
                      !isLoading && !shouldShowEmptyState && showLegend ? chartLegend : null,
                      timescaleControl || null
                    )
                  : (!isLoading && !shouldShowEmptyState && showLegend ? chartLegend : null)
              );
            };
  
            const renderHomeUsageChart = ({ ariaLabel, labels, computerValues, resourceValues, emptyText }) => (
              renderHomeStackedUsageChart({
                ariaLabel: ariaLabel || "Overall environment activity",
                labels,
                series: [
                  {
                    id: "computers",
                    label: "Computers",
                    color: "rgb(143,196,255)",
                    values: computerValues,
                  },
                  {
                    id: "resources",
                    label: "Resources",
                    color: "rgb(103,80,255)",
                    values: resourceValues,
                  },
                ],
                emptyText: emptyText || "No usage data yet",
                title: "Daily cost by Resource Type",
                timescaleControl: React.createElement("div", { className: "playground-environments-home-comparison-timescale" },
                  React.createElement("select", {
                    className: "playground-environments-home-comparison-timescale-select",
                    value: environmentHomeChartTimescale,
                    "aria-label": "Environment chart timescale",
                    onChange: (event) => updateEnvironmentHomeChartTimescale(String(event.target.value || "month")),
                  },
                    React.createElement("option", { value: "day" }, "Daily"),
                    React.createElement("option", { value: "week" }, "Weekly"),
                    React.createElement("option", { value: "month" }, "Monthly")
                  )
                ),
              })
            );
  
            const normalizedEnvironmentHomeChartTimescale = normalizePlaygroundEnvironmentHomeChartPeriod(environmentHomeChartTimescale);
            const homeActivityBuckets = buildPlaygroundEnvironmentHomeActivityBuckets(normalizedEnvironmentHomeChartTimescale);
            const compactComputerAnalyticsSnapshot = computersOverviewAnalyticsState.scopeKey === computersOverviewAnalyticsScopeKey
              ? computersOverviewAnalyticsState.dataByPeriod?.[normalizedEnvironmentHomeChartTimescale] || null
              : null;
            const hasCompactComputerAnalytics = Array.isArray(compactComputerAnalyticsSnapshot?.buckets)
              && compactComputerAnalyticsSnapshot.buckets.length > 0;
  
            const currentEnvironmentHomeCostSummary = environmentHomeCostSummaryByPeriod[normalizedEnvironmentHomeChartTimescale] || null;
            const currentEnvironmentHomeCostBreakdown = environmentHomeCostBreakdownByPeriod[normalizedEnvironmentHomeChartTimescale] || null;
            const currentEnvironmentHomeCostSources = Array.isArray(currentEnvironmentHomeCostBreakdown?.sources)
              ? currentEnvironmentHomeCostBreakdown.sources
              : [];
            const currentEnvironmentHomeChartSummaries = Array.isArray(environmentHomeChartSummariesByPeriod[normalizedEnvironmentHomeChartTimescale])
              ? environmentHomeChartSummariesByPeriod[normalizedEnvironmentHomeChartTimescale]
              : [];
            const currentEnvironmentHomeChartBreakdowns = Array.isArray(environmentHomeChartBreakdownsByPeriod[normalizedEnvironmentHomeChartTimescale])
              ? environmentHomeChartBreakdownsByPeriod[normalizedEnvironmentHomeChartTimescale]
              : [];
            const readEnvironmentHomeSourceCostCTFromSources = (sources, sourceIds) => (Array.isArray(sources) ? sources : []).reduce((sum, entry) => {
              const entryId = String(entry?.id || "").trim();
              if (!sourceIds.includes(entryId)) {
                return sum;
              }
              return sum + Math.max(0, Number(entry?.totalCT || 0));
            }, 0);
            const readEnvironmentHomeSourceCostCT = (sourceIds) =>
              readEnvironmentHomeSourceCostCTFromSources(currentEnvironmentHomeCostSources, sourceIds);
            const readEnvironmentHomeBucketSourceCostCT = (breakdown, sourceIds) =>
              readEnvironmentHomeSourceCostCTFromSources(
                Array.isArray(breakdown?.sources) ? breakdown.sources : [],
                sourceIds
              );
            const readEnvironmentHomeSummaryRuntimeCT = (summary) =>
              Math.max(0, Number(readSettingsComputeTokens(summary?.totals, "environmentCT", "environmentCost") || 0));
            const totalRuntimeCT = readEnvironmentHomeSummaryRuntimeCT(currentEnvironmentHomeCostSummary);
            const totalWebAppRuntimeCT = readEnvironmentHomeSourceCostCT(["resource:web_app", "resource:website", "resource:api"]);
            const totalFunctionRuntimeCT = readEnvironmentHomeSourceCostCT(["resource:function"]);
            const totalManagedRuntimeCT = readEnvironmentHomeSourceCostCT(["resource:auth", "resource:agent_runtime", "resource:secrets"]);
            const totalResourceRuntimeCT = totalWebAppRuntimeCT + totalFunctionRuntimeCT + totalManagedRuntimeCT;
            const totalComputerRuntimeCT = Math.max(0, totalRuntimeCT - totalResourceRuntimeCT);
            const resourceBreakdownLabels = ["Computers", "Web Apps", "Functions", "Managed"];
            const resourceBreakdownValues = [
              environmentsHomeSummary.computers,
              environmentsHomeSummary.webApps,
              environmentsHomeSummary.functions,
              environmentsHomeSummary.managedResources,
            ];
            const resourceBreakdownCostValues = [
              totalComputerRuntimeCT,
              totalWebAppRuntimeCT,
              totalFunctionRuntimeCT,
              totalManagedRuntimeCT,
            ];
            const totalEnvironmentRuntimeCT = totalComputerRuntimeCT + totalResourceRuntimeCT;
            const getEnvironmentHomeChartSummaryForBucket = (bucket, index) =>
              currentEnvironmentHomeChartSummaries.find((record) => record?.key && record.key === bucket?.key)
              || currentEnvironmentHomeChartSummaries[index]
              || null;
            const getEnvironmentHomeChartBreakdownForBucket = (bucket, index) =>
              currentEnvironmentHomeChartBreakdowns.find((record) => record?.key && record.key === bucket?.key)
              || currentEnvironmentHomeChartBreakdowns[index]
              || null;
            const buildHomeBucketedUsageValues = (sourceIds) => homeActivityBuckets.map((bucket, index) => {
              const bucketBreakdown = getEnvironmentHomeChartBreakdownForBucket(bucket, index)?.breakdown || null;
              return readEnvironmentHomeBucketSourceCostCT(bucketBreakdown, sourceIds);
            });
            const homeResourceUsage = buildHomeBucketedUsageValues(["resource:web_app", "resource:website", "resource:api", "resource:function", "resource:auth", "resource:agent_runtime", "resource:secrets"]);
            const homeComputerUsage = homeActivityBuckets.map((bucket, index) => {
              const bucketSummary = getEnvironmentHomeChartSummaryForBucket(bucket, index)?.summary || null;
              const bucketRuntimeCT = readEnvironmentHomeSummaryRuntimeCT(bucketSummary);
              return Math.max(0, bucketRuntimeCT - Number(homeResourceUsage[index] || 0));
            });
            const hasEnvironmentHomeChartError = Boolean(
              environmentHomeCostSummaryError
              || environmentHomeCostBreakdownError
              || environmentHomeChartSummariesError
              || environmentHomeChartBreakdownsError
            );
            const isEnvironmentHomeChartLoading = !hasEnvironmentHomeChartError && (
              environmentHomeCostSummaryLoadingPeriod === normalizedEnvironmentHomeChartTimescale
              || environmentHomeCostBreakdownLoadingPeriod === normalizedEnvironmentHomeChartTimescale
              || environmentHomeChartSummariesLoadingPeriod === normalizedEnvironmentHomeChartTimescale
              || environmentHomeChartBreakdownsLoadingPeriod === normalizedEnvironmentHomeChartTimescale
              || !currentEnvironmentHomeCostSummary
              || !currentEnvironmentHomeCostBreakdown
              || !Array.isArray(environmentHomeChartSummariesByPeriod[normalizedEnvironmentHomeChartTimescale])
              || !Array.isArray(environmentHomeChartBreakdownsByPeriod[normalizedEnvironmentHomeChartTimescale])
            );
            const environmentsHomeKpis = [
              { id: "computers", value: String(environmentsHomeSummary.computers), label: "Computers" },
              { id: "resources", value: String(environmentsHomeSummary.totalResources), label: "Resources" },
              { id: "computer-ct", value: formatSettingsComputeTokens(totalComputerRuntimeCT), label: "Spent on Computers" },
              { id: "resource-ct", value: formatSettingsComputeTokens(totalResourceRuntimeCT), label: "Spent on Resources" },
              { id: "total-ct", value: formatSettingsComputeTokens(totalEnvironmentRuntimeCT), label: "Total cost" },
            ];
            const environmentOverviewChartSeries = isServersMode
              ? [
                  {
                    id: "resources",
                    label: "Servers",
                    color: "rgb(103,80,255)",
                    values: homeResourceUsage,
                  },
                ]
              : [
                  {
                    id: "computers",
                    label: "Computers",
                    color: "rgb(143,196,255)",
                    values: homeComputerUsage,
                  },
                ];
            const environmentOverviewPeriodLabel = normalizedEnvironmentHomeChartTimescale === "day"
              ? "Daily"
              : normalizedEnvironmentHomeChartTimescale === "week"
                ? "Weekly"
                : "Monthly";
  	          const environmentOverviewChartTitle = isServersMode
  	            ? environmentOverviewPeriodLabel + " cost by Server Type"
  	            : environmentOverviewPeriodLabel + " cost by Computer Type";
  	          const environmentOverviewChartLabel = isServersMode ? "server" : "computer";
  	          const activeResourcesOverviewHomeTab = getActiveResourcesOverviewHomeTab();
  	          const environmentOverviewMetricsSection = activeResourcesOverviewHomeTab === "general"
  	            ? React.createElement("div", {
  	                    className: "playground-environments-home-metrics",
  	                  },
  	                    React.createElement("section", { className: "playground-tasks-detail-facts" },
  	                      React.createElement("div", { className: "playground-tasks-detail-facts-body" },
  	                        React.createElement("div", { className: "playground-database-overview" },
  	                          React.createElement("div", { className: "playground-database-overview-chart-block" },
  	                            React.createElement("div", { className: "playground-project-overview-summary-kpis playground-project-overview-chart-kpis" },
  	                              environmentsHomeKpis.map((item) =>
  	                                React.createElement("div", { key: item.id, className: "playground-project-overview-summary-kpi" },
  	                                  React.createElement("div", { className: "playground-project-overview-summary-kpi-heading" },
  	                                    React.createElement("div", { className: "playground-project-overview-summary-kpi-label" }, item.label)
  	                                  ),
  	                                  React.createElement("div", { className: "playground-project-overview-summary-kpi-value" }, item.value)
  	                                )
  	                              )
  	                            ),
  	                            renderHomeStackedUsageChart({
  	                              ariaLabel: "Overall " + environmentOverviewChartLabel + " activity",
  	                              labels: homeActivityBuckets.map((bucket) => String(bucket?.label || "")),
  	                              series: environmentOverviewChartSeries,
  	                              emptyText: "No usage data yet",
  	                              title: environmentOverviewChartTitle,
  	                              isLoading: isEnvironmentHomeChartLoading,
  	                              timescaleControl: React.createElement("div", { className: "playground-environments-home-comparison-timescale" },
  	                                React.createElement("select", {
  	                                  className: "playground-environments-home-comparison-timescale-select",
  	                                  value: normalizedEnvironmentHomeChartTimescale,
  	                                  "aria-label": "Environment chart timescale",
                                    onChange: (event) => updateEnvironmentHomeChartTimescale(String(event.target.value || "month")),
  	                                },
  	                                  React.createElement("option", { value: "day" }, "Daily"),
  	                                  React.createElement("option", { value: "week" }, "Weekly"),
  	                                  React.createElement("option", { value: "month" }, "Monthly")
  	                                )
  	                              ),
  	                            })
  	                          )
  	                        )
  	                      )
  	                    )
  	                  )
  	            : null;
  	          if (embeddedInResources && !isServersMode) {
  	            const sourceComputers = displayEnvironments.filter((environment) => (
  	              environment?.id && environment.id !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
  	            ));
  	            const computerRows = normalizeComputerOverviewRows(sourceComputers, {
  	              agents,
  	              currentUserName,
  	              currentUserEmail,
  	              currentUserAvatarUrl,
  	              systemCreatorAvatarUrl: COMPUTER_AGENTS_CREATOR_PROFILE_URL,
  	              resolveProfileLabel: (environment) => String(getPlaygroundEnvironmentComputeProfileConfig(environment?.computeProfile)?.label || "Standard").trim(),
  	              resolveAgentAvatarUrl: (agent) => getPlaygroundAgentProfilePhotoUrl(agent),
  	              normalizeAvatarUrl: normalizeSessionPhotoUrl,
  	              canRenderAvatarImage,
  	              formatDate: formatPlaygroundFileDate,
  	              formatExactDate: formatPlaygroundExactDate,
  	              getInitials: getAccountInitials,
  	            });
  	            const computerCostValuesUsd = hasCompactComputerAnalytics
  	              ? compactComputerAnalyticsSnapshot.buckets.map((bucket) => Math.max(0, Number(bucket?.computerCostUsd) || 0))
  	              : homeComputerUsage.map((value) => Math.max(0, Number(value || 0)) / SETTINGS_CT_PER_DOLLAR);
  	            const totalComputerCostUsd = hasCompactComputerAnalytics
  	              ? Math.max(0, Number(compactComputerAnalyticsSnapshot?.totalComputerCostUsd) || 0)
  	              : Math.max(0, Number(totalComputerRuntimeCT || 0)) / SETTINGS_CT_PER_DOLLAR;
  	            const compactComputerAnalyticsLoading = computersOverviewAnalyticsState.scopeKey !== computersOverviewAnalyticsScopeKey
  	              || computersOverviewAnalyticsState.loadingPeriod === normalizedEnvironmentHomeChartTimescale;
  	            const compactComputerAnalyticsError = computersOverviewAnalyticsState.scopeKey === computersOverviewAnalyticsScopeKey
  	              ? String(computersOverviewAnalyticsState.errorsByPeriod?.[normalizedEnvironmentHomeChartTimescale] || "")
  	              : "";
  	            const legacyFallbackKey = computersOverviewAnalyticsScopeKey + "|" + normalizedEnvironmentHomeChartTimescale;
  	            const isUsingLegacyComputerAnalytics = computersOverviewAnalyticsFallbackScopeRef.current === legacyFallbackKey;
  	            const computerAnalyticsLoading = !hasCompactComputerAnalytics && (
  	              isUsingLegacyComputerAnalytics ? isEnvironmentHomeChartLoading : compactComputerAnalyticsLoading
  	            );
  	            const computerAnalyticsError = hasCompactComputerAnalytics || computerAnalyticsLoading
  	              ? ""
  	              : isUsingLegacyComputerAnalytics
  	                ? (environmentHomeCostSummaryError || environmentHomeCostBreakdownError || environmentHomeChartSummariesError || environmentHomeChartBreakdownsError)
  	                : compactComputerAnalyticsError;
  	            const computerAnalytics = createComputersOverviewAnalytics({
  	              rows: computerRows,
  	              title: environmentOverviewChartTitle,
  	              labels: hasCompactComputerAnalytics
  	                ? compactComputerAnalyticsSnapshot.buckets.map((bucket) => String(bucket?.label || ""))
  	                : homeActivityBuckets.map((bucket) => String(bucket?.label || "")),
  	              costValuesUsd: computerCostValuesUsd,
  	              totalCostUsd: totalComputerCostUsd,
  	              formatCurrency: formatSettingsUsdCredits,
  	              loading: computerAnalyticsLoading,
  	              error: computerAnalyticsError,
  	            });
  	            const resolveSourceComputer = (row) => sourceComputers.find((environment) => String(environment?.id || "") === row.id) || null;
  	            return React.createElement(ComputersOverviewPage, {
  	              rows: computerRows,
  	              period: normalizedEnvironmentHomeChartTimescale,
  	              onPeriodChange: updateEnvironmentHomeChartTimescale,
  	              analytics: computerAnalytics,
  	              controlsPortalId: "playground-resource-overview-controls",
	              periodPortalId: "playground-computers-overview-period-controls",
  	              loading: false,
  	              mutating: Boolean(saveState.isSaving || fileEnvironmentMutationState.action || environmentShareTeamState.action),
  	              onOpen: (row) => handleEnvironmentSelect(row.id),
  	              onCreate: handleCreateEnvironment,
  	              onRename: (row) => {
  	                const environment = resolveSourceComputer(row);
  	                if (environment) openEnvironmentRenameDialog(environment);
  	              },
  	              onShare: (rows) => {
  	                const environmentsToShare = rows.map(resolveSourceComputer).filter(Boolean);
  	                if (environmentsToShare.length === 1) openEnvironmentShareTeamModal(environmentsToShare[0]);
  	                else if (environmentsToShare.length > 1) openEnvironmentShareTeamModal(null, { environmentIds: environmentsToShare.map((environment) => environment.id) });
  	              },
  	              onCopy: (row) => {
  	                const environment = resolveSourceComputer(row);
  	                if (environment) void handleCopyEnvironmentFromMenu(environment);
  	              },
  	              onDelete: (rows) => {
  	                const environmentsToDelete = rows.map(resolveSourceComputer).filter(Boolean);
  	                if (environmentsToDelete.length === 1) void handleDeleteEnvironment(environmentsToDelete[0].id);
  	                else if (environmentsToDelete.length > 1) void handleDeleteEnvironments(environmentsToDelete);
  	              },
  	            });
  	          }
  
  	          const environmentsHomeHero = React.createElement("section", { className: "playground-environments-home-hero" },
  	                React.createElement("div", { className: "playground-environments-home-hero-title" }, "Build and run your full AI app stack."),
  	                renderResourcesOverviewHomeTabs(),
  	                environmentOverviewMetricsSection,
  	                overviewListContent
  	              );
  
            return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-home-scroll", ref: resourcesHomeScrollRef },
              React.createElement("div", { className: "playground-environments-home-content" },
                environmentsHomeHero
              )
            );
          }
  
          const shouldShowEnvironmentHome = isHomeViewActive || (isServersMode ? (!selectedServerId && !selectedDatabaseId) : !selectedEnvironmentId);
          const embeddedServerKindLabel = normalizedEmbeddedServerKind ? formatPlaygroundServerKindLabel(normalizedEmbeddedServerKind) : "";
          const embeddedServerKindPluralLabel = normalizedEmbeddedServerKind ? formatPlaygroundServerKindPluralLabel(normalizedEmbeddedServerKind) : "";
          const currentServerResourcesLabel = embeddedServerKindPluralLabel || "Resources";
          const currentSearchTitle = isServersMode ? "Search " + currentServerResourcesLabel : "Search Computers";
          const currentSearchEmpty = isServersMode ? "No matching " + currentServerResourcesLabel.toLowerCase() + " found." : "No matching computers found.";
            const currentSearchPlaceholder = isServersMode
              ? "Search " + currentServerResourcesLabel.toLowerCase() + " by name or description..."
            : "Search by computer name...";

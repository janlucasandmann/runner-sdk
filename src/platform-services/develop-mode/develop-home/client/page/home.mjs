export const DEVELOP_HOME_PAGE_SCRIPT_TEMPLATE = `        function renderDevelopHomePage() {
          const totalUsedCT = readSettingsComputeTokens(settingsUsageSummary?.totals || {}, "totalCT", "totalCost");
          const apiKeyCount = Array.isArray(settingsApiKeys) ? settingsApiKeys.filter((key) => !key?.revokedAt).length : 0;
          const activeServerCount = Array.isArray(realServers)
            ? realServers.filter((server) => String(server?.status || server?.state || "").toLowerCase() !== "deleted").length
            : 0;
          const activeDevelopServers = Array.isArray(realServers)
            ? realServers.filter((server) => (
                server?.id
                && String(server?.status || server?.state || "").toLowerCase() !== "deleted"
              ))
            : [];
          const activeDevelopServerKindCounts = activeDevelopServers.reduce((counts, server) => {
            const kind = canonicalizePlaygroundServerKind(server?.kind);
            counts[kind] = (counts[kind] || 0) + 1;
            return counts;
          }, {});
          const activeDevelopDatabaseCount = Math.max(0, Math.round(Number(developServerOperationalMetrics?.resourceCounts?.databases || 0)));
          const quickstartSnippets = {
            javascript: [
              "import { ComputerAgentsClient } from 'computer-agents';",
              "",
              "const client = new ComputerAgentsClient();",
              "",
              "const result = await client.run('Build a CRM pipeline board', {",
              "  onEvent: (event) => console.log(event.type)",
              "});",
              "",
              "console.log(result.content);",
            ],
            python: [
              "from computer_agents import ComputerAgentsClient",
              "",
              "client = ComputerAgentsClient()",
              "",
              "result = client.run(",
              "    'Build a CRM pipeline board',",
              "    on_event=lambda event: print(event['type']),",
              ")",
              "",
              "print(result.content)",
            ],
          };
          const activeQuickstartLanguage = quickstartSnippets[developQuickstartLanguage] ? developQuickstartLanguage : "javascript";
          const quickstartLines = quickstartSnippets[activeQuickstartLanguage];
          const renderDevelopCodeTokens = (line) => {
            const parts = [];
            const pattern = /('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*"|\\b(?:import|from|const|new|await|lambda|print)\\b|\\b(?:ComputerAgentsClient|client|result)\\b|\\b(?:run|onEvent|on_event|console|log|content|event|type)\\b)/g;
            let cursor = 0;
            let match;
            while ((match = pattern.exec(line))) {
              if (match.index > cursor) {
                parts.push(line.slice(cursor, match.index));
              }
              const token = match[0];
              const tokenClass = token.startsWith("'") || token.startsWith('"')
                ? "is-string"
                : /^(import|from|const|new|await|lambda|print)$/.test(token)
                  ? "is-keyword"
                  : /^(run|onEvent|on_event|console|log|content|event|type)$/.test(token)
                    ? "is-property"
                    : "is-identifier";
              parts.push(React.createElement("span", {
                key: String(match.index) + ":" + token,
                className: "playground-develop-docs-code-token " + tokenClass,
              }, token));
              cursor = match.index + token.length;
            }
            if (cursor < line.length) {
              parts.push(line.slice(cursor));
            }
            return parts.length ? parts : "\u00a0";
          };
          const renderCodeLine = (line, index) =>
            React.createElement("div", { key: String(index) + ":" + line, className: "playground-develop-docs-code-line" },
              React.createElement("span", { className: "playground-develop-docs-code-line-number" }, String(index + 1)),
              React.createElement("span", null, renderDevelopCodeTokens(line))
            );
          const coreConceptCards = [
            {
              title: "Threads",
              description: "Run work in persistent histories with streaming, editable turns, and resumable state.",
              href: "/developers/core-concepts#threads",
              image: "/img/001-docs/thread.jpg",
            },
            {
              title: "Computers",
              description: "Give ACP stateful execution machines with runtimes, GUI access, snapshots, and forks.",
              href: "/developers/core-concepts#computers",
              image: "/img/001-docs/computer.jpg",
            },
            {
              title: "Projects",
              description: "Coordinate mission control, tickets, resources, schedules, and agents in one workspace.",
              href: "/developers/core-concepts#projects",
              image: "/img/001-docs/projects.jpg",
            },
          ];
          const openDevelopApiKeysSection = (options = {}) => {
            openDevelopApiKeysPage(options);
          };
          const openDevelopWebhooksSection = () => {
            setDevelopHomeSection("webhooks");
          };
          const tabs = [
            { id: "overview", label: "Overview", onClick: () => setDevelopHomeSection("overview") },
            { id: "webhooks", label: "Webhooks", onClick: openDevelopWebhooksSection },
          ];
          const quickLinks = [
            { label: "Create an API Key", Icon: Key, onClick: () => openDevelopApiKeysSection({ openCreateDialog: true }) },
            {
              label: "Browse Models",
              Icon: Grid3x3,
              onClick: () => {
                openModelsPage();
              },
            },
__DEVELOP_HOME_INFERENCE_ENTRY__            { label: "Webhooks", Icon: Webhook, onClick: openDevelopWebhooksSection },
            { label: "API Reference", Icon: ReceiptText, onClick: () => window.open(__DEVELOPERS_URL__, "_blank", "noopener,noreferrer") },
            { label: "Pricing Overview", Icon: Coins, onClick: () => window.open(__PRICING_URL__, "_blank", "noopener,noreferrer") },
          ];
          const handleCopyQuickstart = () => {
            try {
              void navigator.clipboard?.writeText(quickstartLines.join("\\n"));
            } catch {}
          };
          const formatDevelopOperationalMetricValue = (value) => {
            const numericValue = Math.max(0, Math.round(Number.isFinite(Number(value)) ? Number(value) : 0));
            if (numericValue >= 1000000) {
              return (numericValue / 1000000).toFixed(numericValue >= 10000000 ? 0 : 1).replace(".0", "") + "M";
            }
            if (numericValue >= 1000) {
              return (numericValue / 1000).toFixed(numericValue >= 10000 ? 0 : 1).replace(".0", "") + "k";
            }
            return numericValue.toLocaleString("en-US");
          };
          const buildDevelopMetricHourLabels = () => {
            const formatter = new Intl.DateTimeFormat("en-US", { hour: "numeric" });
            const anchor = new Date();
            anchor.setMinutes(0, 0, 0);
            return Array.from({ length: 24 }, (_, index) => {
              const date = new Date(anchor);
              date.setHours(anchor.getHours() - (23 - index));
              return formatter.format(date);
            });
          };
          const developOperationalLabels = Array.isArray(developServerOperationalMetrics?.labels) && developServerOperationalMetrics.labels.length
            ? developServerOperationalMetrics.labels
            : buildDevelopMetricHourLabels();
          const getDevelopOperationalSeries = (key) => {
            const values = developServerOperationalMetrics?.series?.[key];
            return Array.isArray(values) && values.length === developOperationalLabels.length
              ? values.map((value) => Math.max(0, Number(value || 0)))
              : developOperationalLabels.map(() => 0);
          };
          const developOperationalMetricTabs = [
            {
              id: "hosting-requests",
              key: "hostingRequests",
              label: "Hosting Requests",
              title: "Hosting Requests",
              tone: "requests",
              legend: "Web apps",
              serverKind: "web_app",
              resourceCountKey: "webApps",
              resourceFallbackCount: activeDevelopServerKindCounts.web_app || 0,
              resourceSingular: "Web App",
              resourcePlural: "Web Apps",
              emptyText: "No hosting requests in the last 24 hours",
            },
            {
              id: "api-requests",
              key: "apiRequests",
              label: "API Requests",
              title: "API Requests",
              tone: "success",
              legend: "APIs",
              serverKind: "api",
              resourceCountKey: "apis",
              resourceFallbackCount: activeDevelopServerKindCounts.api || 0,
              resourceSingular: "API",
              resourcePlural: "APIs",
              emptyText: "No API requests in the last 24 hours",
            },
            {
              id: "function-calls",
              key: "functionCalls",
              label: "Function Calls",
              title: "Function Calls",
              tone: "latency",
              legend: "Functions",
              serverKind: "function",
              resourceCountKey: "functions",
              resourceFallbackCount: activeDevelopServerKindCounts.function || 0,
              resourceSingular: "Function",
              resourcePlural: "Functions",
              emptyText: "No function calls in the last 24 hours",
            },
            {
              id: "database-reads",
              key: "databaseReads",
              label: "Database Reads",
              title: "Database Reads",
              tone: "reads",
              legend: "Reads",
              serverKind: "database",
              resourceCountKey: "databases",
              resourceFallbackCount: activeDevelopDatabaseCount,
              resourceSingular: "Database",
              resourcePlural: "Databases",
              emptyText: "No database reads in the last 24 hours",
            },
            {
              id: "database-writes",
              key: "databaseWrites",
              label: "Database Writes",
              title: "Database Writes",
              tone: "writes",
              legend: "Writes",
              serverKind: "database",
              resourceCountKey: "databases",
              resourceFallbackCount: activeDevelopDatabaseCount,
              resourceSingular: "Database",
              resourcePlural: "Databases",
              emptyText: "No database writes in the last 24 hours",
            },
          ];
          const activeDevelopOperationalMetric = developOperationalMetricTabs.find((tab) => tab.id === developServerMetricsChartTab)
            || developOperationalMetricTabs[0];
          const openActiveDevelopOperationalResourceComposer = () => {
            const normalizedServerKind = normalizePlaygroundServerOverviewKind(activeDevelopOperationalMetric?.serverKind) || "web_app";
            openResourcesView("servers", { serverKind: normalizedServerKind });
            handleCreateServer(normalizedServerKind);
          };
          const renderDevelopOperationalMetricsChart = () => {
            const activeSeriesValues = getDevelopOperationalSeries(activeDevelopOperationalMetric.key);
            const activeResourceCount = Math.max(0, Math.round(Number(
              developServerOperationalMetrics?.resourceCounts?.[activeDevelopOperationalMetric.resourceCountKey]
              ?? activeDevelopOperationalMetric.resourceFallbackCount
              ?? 0
            ) || 0));
            const activeResourceLabel = activeResourceCount === 1
              ? activeDevelopOperationalMetric.resourceSingular
              : activeDevelopOperationalMetric.resourcePlural;
            return React.createElement("section", { className: "playground-develop-server-metrics playground-settings-usage-top-chart playground-environments-home-metrics" },
              React.createElement("div", { className: "playground-develop-server-metrics-toolbar" },
                React.createElement("div", { className: "playground-develop-server-metrics-resource-pill" },
                  React.createElement("span", { className: "playground-develop-server-metrics-resource-count" }, formatDevelopOperationalMetricValue(activeResourceCount)),
                  React.createElement("span", { className: "playground-develop-server-metrics-resource-label" }, activeResourceLabel),
                  React.createElement(ChevronRight, { width: 14, height: 14, strokeWidth: 1.8 })
                ),
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-develop-server-metrics-add-button",
                  onClick: openActiveDevelopOperationalResourceComposer,
                }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }), "Add Resource")
              ),
              React.createElement("div", { className: "playground-develop-server-metrics-title-row" },
                React.createElement("h2", { className: "playground-develop-server-metrics-title" }, "Analytics"),
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-develop-server-metrics-menu-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-content-menu-button",
                    "aria-label": "Analytics options",
                    "aria-expanded": developAnalyticsMenuOpen ? "true" : "false",
                    onClick: () => setDevelopAnalyticsMenuOpen((current) => !current),
                  }, React.createElement(Ellipsis, { className: "playground-content-menu-icon", strokeWidth: 1.75 })),
                  developAnalyticsMenuOpen
                    ? React.createElement(PlatformPopupSurface, {
                        className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                      },
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          onClick: () => {
                            setDevelopAnalyticsMenuOpen(false);
                            openSettingsModal("costs-overview");
                          },
                        },
                          React.createElement(ChartNoAxesColumnIncreasing, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, "Show Usage")
                          )
                        )
                      )
                    : null
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-facts" },
                React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                  React.createElement("div", { className: "playground-database-overview" },
                    React.createElement("div", { className: "playground-database-overview-chart-block playground-settings-usage-chart-block playground-develop-server-metrics-chart-block" },
                      React.createElement("div", { className: "playground-project-overview-summary-kpis playground-project-overview-chart-kpis playground-settings-usage-chart-kpis playground-develop-server-metrics-kpis" },
                        developOperationalMetricTabs.map((tab) =>
                          React.createElement("button", {
                            key: tab.id,
                            type: "button",
                            className: "playground-project-overview-summary-kpi playground-settings-usage-chart-kpi playground-develop-server-metrics-kpi" + (activeDevelopOperationalMetric.id === tab.id ? " is-active" : ""),
                            onClick: () => setDevelopServerMetricsChartTab(tab.id),
                          },
                            React.createElement("div", { className: "playground-project-overview-summary-kpi-heading" },
                              React.createElement("div", { className: "playground-project-overview-summary-kpi-label" }, tab.label)
                            ),
                            React.createElement("div", { className: "playground-project-overview-summary-kpi-value" },
                              formatDevelopOperationalMetricValue(developServerOperationalMetrics?.totals?.[tab.key] || 0)
                            )
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-settings-usage-chart-panel playground-develop-server-metrics-panel" },
                        developServerOperationalMetricsLoading
                          ? React.createElement("div", { className: "playground-settings-loading-state playground-settings-usage-chart-loading-frame" },
                              React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                            )
                          : renderPlaygroundTelemetryTimeseriesChart({
                              labels: developOperationalLabels,
                              series: [{
                                key: activeDevelopOperationalMetric.key,
                                tone: activeDevelopOperationalMetric.tone,
                                values: activeSeriesValues,
                              }],
                              emptyText: activeDevelopOperationalMetric.emptyText,
                              ariaLabel: activeDevelopOperationalMetric.title + " over time",
                              chartHeight: 288,
                              buildLinePath: buildSettingsSvgLinePath,
                              getSeriesValue: (entry, _label, index) => entry?.values?.[index],
                              getXAxisLabel: (label) => String(label || ""),
                              formatAxisValue: formatDevelopOperationalMetricValue,
                            }),
                        React.createElement("div", {
                          className: "playground-develop-server-metrics-footer",
                        },
                          React.createElement("div", { className: "playground-develop-server-metrics-footer-left playground-develop-server-metrics-legend" },
                            React.createElement("div", { className: "playground-settings-usage-legend-item" },
                              React.createElement("span", { className: "playground-settings-usage-legend-swatch is-" + activeDevelopOperationalMetric.tone }),
                              React.createElement("span", null, activeDevelopOperationalMetric.legend)
                            ),
                            developServerOperationalMetricsError
                              ? React.createElement("span", { className: "playground-develop-server-metrics-error" }, developServerOperationalMetricsError)
                              : React.createElement("span", { className: "playground-develop-server-metrics-source" },
                                  formatDevelopOperationalMetricValue(developServerOperationalMetrics?.resourceCount || 0) + " resources monitored"
                                )
                          ),
                          React.createElement("div", { className: "playground-environments-home-comparison-timescale playground-develop-server-metrics-timescale" },
                            React.createElement("select", {
                              className: "playground-environments-home-comparison-timescale-select",
                              value: "24h",
                              "aria-label": "Server metrics period",
                              onChange: () => {},
                            },
                              React.createElement("option", { value: "24h" }, "Last 24 hours")
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            );
          };

          const developHomeTimescaleOptions = [
            { id: "day", label: "1D" },
            { id: "week", label: "1W" },
            { id: "month", label: "1M" },
          ];
          const activeDevelopHomeTimescaleId = developHomeTimescaleOptions.some((option) => option.id === developHomeChartTimescale)
            ? developHomeChartTimescale
            : "day";
          const developHomeTimescaleControl = React.createElement("div", {
              className: "playground-project-overview-progress-combo-ranges",
              role: "group",
              "aria-label": "Develop analytics time frame",
            },
            developHomeTimescaleOptions.map((option) =>
              React.createElement("button", {
                key: option.id,
                type: "button",
                className: "playground-project-overview-progress-combo-range" + (activeDevelopHomeTimescaleId === option.id ? " is-active" : ""),
                onClick: () => setDevelopHomeChartTimescale(option.id),
                "aria-pressed": activeDevelopHomeTimescaleId === option.id ? "true" : "false",
              }, option.label)
            )
          );
          const developHomeAnalyticsOptions = React.createElement("div", {
              className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-develop-server-metrics-menu-shell",
            },
            React.createElement("button", {
              type: "button",
              className: "playground-content-menu-button",
              "aria-label": "Develop options",
              "aria-expanded": developAnalyticsMenuOpen ? "true" : "false",
              onClick: () => setDevelopAnalyticsMenuOpen((current) => !current),
            }, React.createElement(Ellipsis, { className: "playground-content-menu-icon", strokeWidth: 1.75 })),
            developAnalyticsMenuOpen
              ? React.createElement(PlatformPopupSurface, {
                  className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                },
                  developHomeSection === "overview"
                    ? React.createElement("button", {
                        type: "button",
                        className: "tb-popup-row",
                        onClick: () => {
                          setDevelopAnalyticsMenuOpen(false);
                          openSettingsModal("costs-overview");
                        },
                      },
                        React.createElement(ChartNoAxesColumnIncreasing, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "Show Usage")
                        )
                      )
                    : null,
                  React.createElement("button", {
                    type: "button",
                    className: "tb-popup-row",
                    onClick: () => {
                      setDevelopAnalyticsMenuOpen(false);
                      window.open(__PRICING_URL__, "_blank", "noopener,noreferrer");
                    },
                  },
                    React.createElement(Coins, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                      React.createElement("span", null, "API Pricing")
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "tb-popup-row",
                    onClick: () => {
                      setDevelopAnalyticsMenuOpen(false);
                      openDocsPage();
                    },
                  },
                    React.createElement(BookOpen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                      React.createElement("span", null, "Documentation")
                    )
                  )
                )
              : null
          );
          const developHomeServerActivityKeys = [
            "hostingRequests",
            "apiRequests",
            "functionCalls",
            "agentRuntimeRuns",
            "secretReads",
            "authEvents",
            "paymentCheckoutSessions",
          ];
          const developHomeDatabaseActivityKeys = ["databaseReads", "databaseWrites"];
          const sumDevelopOperationalTotals = (keys) => keys.reduce((sum, key) => (
            sum + Math.max(0, Number(developServerOperationalMetrics?.totals?.[key] || 0))
          ), 0);
          const sumDevelopOperationalSeries = (keys) => developOperationalLabels.map((_, index) => (
            keys.reduce((sum, key) => sum + Math.max(0, Number(getDevelopOperationalSeries(key)?.[index] || 0)), 0)
          ));
          const developHomeServerActivityValues = sumDevelopOperationalSeries(developHomeServerActivityKeys);
          const developHomeDatabaseActivityValues = sumDevelopOperationalSeries(developHomeDatabaseActivityKeys);
          const developHomeResourceCount = Math.max(0, Math.round(Number(
            developServerOperationalMetrics?.resourceCount
            ?? (activeServerCount + activeDevelopDatabaseCount)
            ?? 0
          ) || 0));
          const developHomeOverviewKpis = [
            {
              id: "develop-resources",
              label: "Resources",
              color: "#7effff",
              value: formatDevelopOperationalMetricValue(developHomeResourceCount),
            },
            {
              id: "develop-server-operations",
              label: "Server Operations",
              color: "rgb(143, 196, 255)",
              value: formatDevelopOperationalMetricValue(sumDevelopOperationalTotals(developHomeServerActivityKeys)),
            },
            {
              id: "develop-database-operations",
              label: "Database Operations",
              color: "rgb(103, 80, 255)",
              value: formatDevelopOperationalMetricValue(sumDevelopOperationalTotals(developHomeDatabaseActivityKeys)),
            },
            {
              id: "develop-errors",
              label: "Errors",
              color: "#f53b3a",
              value: formatDevelopOperationalMetricValue(developServerOperationalMetrics?.totals?.errors || 0),
            },
            {
              id: "develop-cost",
              label: "Usage cost",
              color: "#9ff6ce",
              value: formatDevelopOperationalMetricValue(developServerOperationalMetrics?.totals?.computeTokens || 0),
            },
          ];
          const developHomeOverviewChartSeries = [
            {
              id: "server-operations",
              label: "Server Operations",
              color: "rgb(143, 196, 255)",
              values: developHomeServerActivityValues,
            },
            {
              id: "database-operations",
              label: "Database Operations",
              color: "rgb(103, 80, 255)",
              values: developHomeDatabaseActivityValues,
            },
          ];
          const hasDevelopHomeOverviewActivity = developHomeOverviewChartSeries.some((series) => (
            series.values.some((value) => Math.max(0, Number(value || 0)) > 0)
          ));
          const renderDevelopHomeOverviewAnalyticsSection = () =>
            React.createElement("div", {
              className: "playground-environments-home-metrics playground-develop-server-metrics playground-develop-server-kind-metrics playground-develop-home-overview-metrics",
            },
              React.createElement("section", {
                className: "playground-project-overview-progress-combo-card playground-agents-detail-progress-combo-card playground-evaluations-analytics-card playground-agents-overview-analytics-card playground-resource-type-overview-analytics-card playground-develop-home-overview-analytics-card",
              },
                React.createElement("div", { className: "playground-project-overview-progress-combo-metrics" },
                  developHomeOverviewKpis.map((item) =>
                    React.createElement("div", { key: item.id, className: "playground-project-overview-progress-combo-metric" },
                      React.createElement("div", { className: "playground-project-overview-progress-combo-metric-label" },
                        React.createElement("span", {
                          className: "playground-project-overview-progress-combo-metric-dot is-" + item.id,
                          style: { background: item.color },
                          "aria-hidden": "true",
                        }),
                        React.createElement("span", null, item.label)
                      ),
                      React.createElement("div", { className: "playground-project-overview-progress-combo-metric-value" }, item.value)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-project-overview-progress-combo-chart playground-develop-home-overview-chart" },
                  developServerOperationalMetricsLoading
                    ? React.createElement("div", { className: "playground-settings-loading-state playground-settings-usage-chart-loading-frame" },
                        React.createElement(Loader2, { className: "playground-settings-loading-icon", strokeWidth: 1.8 })
                      )
                    : developServerOperationalMetricsError
                      ? React.createElement("div", { className: "playground-settings-usage-chart-empty" }, developServerOperationalMetricsError)
                      : hasDevelopHomeOverviewActivity
                        ? renderSettingsUsageMultiStackedChart({
                            labels: developOperationalLabels,
                            series: developHomeOverviewChartSeries,
                            tickFormatter: formatDevelopOperationalMetricValue,
                            tall: true,
                            ariaLabel: "Develop resource activity over time",
                          })
                        : React.createElement("div", { className: "playground-settings-usage-chart-empty is-tall" }, "No resource activity yet")
                )
              )
            );

          return React.createElement("div", { className: "playground-develop-home" },
            React.createElement("div", { className: "playground-develop-home-inner" },
              React.createElement("section", { className: "playground-environments-home-hero playground-develop-server-kind-hero playground-develop-home-hero" },
                React.createElement("div", { className: "playground-project-overview-summary-title-row playground-develop-header playground-develop-server-kind-header playground-develop-home-hero-header" },
                  React.createElement("h1", { className: "playground-project-overview-summary-title playground-develop-title" }, "Develop your Workspace"),
                  React.createElement("div", { className: "playground-project-overview-summary-title-actions playground-develop-header-actions" },
                    developHomeSection === "overview" ? developHomeTimescaleControl : null,
                    developHomeAnalyticsOptions
                  )
                ),
                React.createElement("div", { className: "playground-agents-overview-tabs playground-project-overview-tabs playground-develop-tabs playground-develop-home-tabs" },
                  React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                    tabs.map((tab) =>
                      React.createElement("button", {
                        key: tab.id,
                        type: "button",
                        className: "playground-project-overview-chart-tab playground-develop-tab" + (tab.id === developHomeSection ? " is-active" : ""),
                        onClick: tab.onClick || undefined,
                      }, tab.label)
                    )
                  )
                ),
                developHomeSection === "overview" ? renderDevelopHomeOverviewAnalyticsSection() : null
              ),
              developHomeSection === "webhooks"
                  ? React.createElement("div", { className: "playground-plugins-page playground-develop-webhooks-page" },
                      renderWebhookActionsPanel({ embedded: true, searchQuery: "", showEmbeddedListActions: false })
                    )
                : React.createElement(React.Fragment, null,
              React.createElement("section", { className: "playground-develop-docs-quickstart-card" },
                React.createElement("div", { className: "playground-develop-docs-quickstart-inner" },
                  React.createElement("div", null,
                    React.createElement("h2", { className: "playground-develop-docs-quickstart-title" }, "Developer quickstart"),
                    React.createElement("p", { className: "playground-develop-docs-quickstart-text" },
                      "Start ACP in minutes. Create a project, get a computer, run a thread, and ship your first working workflow."
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-develop-docs-quickstart-button",
                      onClick: () => window.open(__QUICKSTART_URL__, "_blank", "noopener,noreferrer"),
                    }, "Get started")
                  ),
                  React.createElement("div", { className: "playground-develop-docs-code-card" },
                    React.createElement("div", { className: "playground-develop-docs-code-toolbar" },
                      React.createElement("div", { className: "playground-develop-docs-code-tabs" },
                        Object.entries({ javascript: "javascript", python: "python" }).map(([language, label]) =>
                          React.createElement("button", {
                            key: language,
                            type: "button",
                            className: "playground-develop-docs-code-tab" + (activeQuickstartLanguage === language ? " is-active" : ""),
                            onClick: () => setDevelopQuickstartLanguage(language),
                          }, label)
                        )
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-develop-docs-code-copy",
                        "aria-label": "Copy quickstart code",
                        title: "Copy quickstart code",
                        onClick: handleCopyQuickstart,
                      }, React.createElement(Copy, { width: 16, height: 16, strokeWidth: 1.9 }))
                    ),
                    React.createElement("pre", { className: "playground-develop-docs-code-body" },
                      quickstartLines.map(renderCodeLine)
                    )
                  )
                )
              ),
              React.createElement("section", { className: "playground-develop-docs-concepts" },
                React.createElement("div", { className: "playground-develop-docs-concepts-header" },
                  React.createElement("div", null,
                    React.createElement("h2", { className: "playground-develop-docs-concepts-title" }, "Core concepts"),
                    React.createElement("p", { className: "playground-develop-docs-concepts-copy" },
                      "Understand the primitives that define how ACP organizes work, persists state, and executes actions."
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-develop-docs-concepts-view-all",
                    onClick: () => window.open(__CORE_CONCEPTS_URL__, "_blank", "noopener,noreferrer"),
                  }, "View all")
                ),
                React.createElement("div", { className: "playground-develop-docs-concepts-grid" },
                  coreConceptCards.map((card) =>
                    React.createElement("button", {
                      key: card.title,
                      type: "button",
                      className: "playground-develop-docs-concept-card",
                      onClick: () => window.open(__AIOS_ORIGIN__ + card.href, "_blank", "noopener,noreferrer"),
                    },
                      React.createElement("div", {
                        className: "playground-develop-docs-concept-art",
                        style: {
                          backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.18)), url(" + card.image + ")",
                        },
                      }),
                      React.createElement("div", { className: "playground-develop-docs-concept-copy" },
                        React.createElement("div", { className: "playground-develop-docs-concept-title" }, card.title),
                        React.createElement("div", { className: "playground-develop-docs-concept-description" }, card.description)
                      )
                    )
                  )
                )
              ),
              React.createElement("div", { className: "playground-develop-bottom-grid" },
                React.createElement("section", { className: "playground-develop-section" },
                  React.createElement("h2", { className: "playground-develop-section-title" }, "Usage"),
                  React.createElement("div", { className: "playground-develop-usage-card" },
                    React.createElement("div", { className: "playground-develop-usage-top" },
                      React.createElement("div", null,
                        React.createElement("div", { className: "playground-develop-usage-label" }, "Current period"),
                        React.createElement("div", { className: "playground-develop-usage-value" }, formatSettingsComputeTokens(totalUsedCT))
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-develop-usage-icon",
                        onClick: () => openSettingsModal("costs-overview"),
                        "aria-label": "Open usage details",
                      }, React.createElement(ChartNoAxesColumnIncreasing, { width: 20, height: 20, strokeWidth: 1.8 }))
                    ),
                    React.createElement("div", { className: "playground-develop-usage-actions" },
                      React.createElement(PlatformPrimaryButton, {
                        type: "button",
                        className: "playground-develop-secondary-button is-primary",
                        onClick: () => openDevelopApiKeysSection({ openCreateDialog: true }),
                      }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }), "Create API Key"),
                      React.createElement(PlatformSecondaryButton, {
                        type: "button",
                        className: "playground-develop-secondary-button",
                        onClick: () => openResourcesView("servers", { serverKind: "web_app" }),
                      }, String(activeServerCount) + " resources"),
                      React.createElement(PlatformSecondaryButton, {
                        type: "button",
                        className: "playground-develop-secondary-button",
                        onClick: () => openDevelopApiKeysSection(),
                      }, String(apiKeyCount) + " keys")
                    )
                  )
                ),
                React.createElement("section", { className: "playground-develop-section" },
                  React.createElement("h2", { className: "playground-develop-section-title" }, "Quick Links"),
	                  React.createElement("div", { className: "playground-develop-quick-links" },
	                    quickLinks.map((link) => {
	                      const Icon = getPlaygroundSafeIconComponent(link.Icon, Circle);
	                      return React.createElement("button", {
                        key: link.label,
                        type: "button",
                        className: "playground-develop-quick-link",
                        onClick: link.onClick,
                      },
                        React.createElement(Icon, { className: "playground-develop-quick-link-icon", strokeWidth: 1.8 }),
                        React.createElement("span", { className: "playground-develop-quick-link-label" }, link.label)
                      );
                    })
                  )
                )
              )
              )
            )
          );
        }
`;

export function createDevelopHomePageScript(options = {}) {
  const aiosOrigin = String(options.aiosOrigin || "").replace(/\/+$/, "");
  const inferenceEntry = typeof options.inferenceEntry === "string" ? options.inferenceEntry : "";
  return DEVELOP_HOME_PAGE_SCRIPT_TEMPLATE
    .replace("__DEVELOP_HOME_INFERENCE_ENTRY__", inferenceEntry)
    .replaceAll("__DEVELOPERS_URL__", JSON.stringify(aiosOrigin + "/developers"))
    .replaceAll("__PRICING_URL__", JSON.stringify(aiosOrigin + "/pricing"))
    .replaceAll("__QUICKSTART_URL__", JSON.stringify(aiosOrigin + "/developers/quickstart"))
    .replaceAll("__CORE_CONCEPTS_URL__", JSON.stringify(aiosOrigin + "/developers/core-concepts"))
    .replaceAll("__AIOS_ORIGIN__", JSON.stringify(aiosOrigin));
}

          function renderCurrentServerEditor() {
            if (!draftServer) {
              return React.createElement("div", { className: "playground-environments-detail-empty" },
                React.createElement("div", { className: "playground-files-state" }, "Select a server to configure its runtime, connections, and deployment settings.")
              );
            }

            const normalizedServerKind = canonicalizePlaygroundServerKind(draftServer.kind);
            const serverPermissionSubjectType = getServerPermissionSubjectType(draftServer);
            const isFunctionServer = normalizedServerKind === "function";
            const isWebAppServer = normalizedServerKind === "web_app";
            const isSourceDeployableServer = isWebAppServer || isFunctionServer;
            const isAuthServer = normalizedServerKind === "auth";
            const isAgentRuntimeServer = normalizedServerKind === "agent_runtime";
            const isSecretsServer = normalizedServerKind === "secrets";
            const isPaymentsServer = normalizedServerKind === "payments";
            const isOperationalDetailServer = isSourceDeployableServer || isAuthServer || isAgentRuntimeServer || isSecretsServer || isPaymentsServer;
            const isServerTemplatePreview = isSelectedServerTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftServer);
            const ServerPreviewEditorComponent = serverPreviewEditorModule?.default || null;
            const renderServerFactRow = (label, control) => React.createElement("div", { className: "playground-tasks-detail-fact", key: label },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
            );
            const renderServerDetailSelectOptionRow = ({ key, label, description, selected, onClick, disabled = false }) => ({
              value: String(key),
              label,
              description: description || undefined,
              selected: Boolean(selected),
              disabled,
              onSelect: onClick,
            });
            const renderServerDetailSelectControl = ({
              popoverId,
              valueLabel,
              disabled = false,
              isEmpty = false,
              children,
            }) => {
              const isOpen = serverDetailSelectPopover === popoverId;
              const isControlDisabled = disabled || isServerTemplatePreview;
              const options = (Array.isArray(children) ? children.flat(Infinity) : [children])
                .filter((option) => option && typeof option === "object");
              const selectedOption = options.find((option) => option.selected) || null;
              const fallbackValue = "current:" + popoverId;
              const selectorOptions = selectedOption
                ? options
                : [{ value: fallbackValue, label: valueLabel, disabled: true }, ...options];
              return React.createElement(PlatformSelector, {
                value: selectedOption?.value || fallbackValue,
                options: selectorOptions,
                label: valueLabel,
                onValueChange: (_nextValue, option) => {
                  if (typeof option?.onSelect === "function") option.onSelect();
                },
                ariaLabel: "Choose " + String(popoverId || "resource").replace(/^server-/, "").replace(/-/g, " "),
                open: isOpen,
                onOpenChange: (nextOpen) => setServerDetailSelectPopover(nextOpen ? popoverId : ""),
                alignment: "end",
                popupAlignment: "right",
                fullWidth: true,
                disabled: isControlDisabled,
                className: "playground-server-detail-selector" + (isEmpty ? " is-empty" : ""),
                triggerClassName: "playground-server-detail-selector-trigger",
                popupClassName: "playground-server-detail-selector-popup",
                optionClassName: "playground-server-detail-selector-option",
                popupWidth: 280,
                popupMaxWidth: "min(320px, calc(100vw - 40px))",
              });
            };
            const buildServerAnalyticsSvgLinePath = (points) => {
              if (!Array.isArray(points) || points.length === 0) {
                return "";
              }
              return points.map((point, index) => (index === 0 ? "M " : "L ") + point.x.toFixed(2) + " " + point.y.toFixed(2)).join(" ");
            };
            const buildZeroTelemetryHourLabels = (count = 8) => {
              const formatter = new Intl.DateTimeFormat("en-US", { hour: "numeric" });
              const anchor = new Date();
              anchor.setMinutes(0, 0, 0);
              return Array.from({ length: count }, (_, index) => {
                const date = new Date(anchor);
                date.setHours(anchor.getHours() - (count - 1 - index));
                return formatter.format(date);
              });
            };
            const normalizedServerDetailChartTimescale = normalizePlaygroundEnvironmentHomeChartPeriod(serverDetailChartTimescale);
            const activeServerAnalyticsStateKey = buildPlaygroundServerAnalyticsStateKey(
              draftServer.id,
              normalizedServerDetailChartTimescale
            );
            const activeServerAnalytics = activeServerAnalyticsStateKey
              ? serverAnalyticsById[activeServerAnalyticsStateKey] || null
              : null;
            const activeServerAnalyticsSummary = activeServerAnalytics?.summary || null;
            const resolvedServerAnalyticsSummary = activeServerAnalyticsSummary || {
              totalRequests: 0,
              successRate: 0,
              clientErrors: 0,
              serverErrors: 0,
              totalRequests24h: 0,
              successRate24h: 0,
              p95LatencyMs: 0,
              clientErrors24h: 0,
              serverErrors24h: 0,
            };
            const activeServerTrafficBuckets = Array.isArray(activeServerAnalytics?.charts?.traffic)
              ? activeServerAnalytics.charts.traffic
              : [];
            const activeServerStatusBuckets = Array.isArray(activeServerAnalytics?.charts?.status)
              ? activeServerAnalytics.charts.status
              : [];
            const zeroTelemetryLabels = buildZeroTelemetryHourLabels(8);
            const activeServerRecentRequests = Array.isArray(activeServerAnalytics?.recentRequests)
              ? activeServerAnalytics.recentRequests
              : [];
            const activeServerDeploymentRecord = activeServerAnalytics?.deployment || draftServer?.metadata?.lastDeployment || null;
            const isServerAnalyticsLoading = loadingServerAnalyticsId === activeServerAnalyticsStateKey;
            const activeServerLogs = currentServerLogs || {};
            const activeServerLogList = Array.isArray(activeServerLogs[serverLogsState.kind]) ? activeServerLogs[serverLogsState.kind] : [];
            const activeServerLogLoadingKey = draftServer.id ? draftServer.id + ":" + serverLogsState.kind : "";
            const isServerLogsLoading = serverLogsState.loadingKey === activeServerLogLoadingKey;
            const activeServerTrafficLabels = activeServerTrafficBuckets.length > 0
              ? activeServerTrafficBuckets.map((bucket) => bucket?.label || "")
              : zeroTelemetryLabels;
            const activeServerTrafficCounts = activeServerTrafficBuckets.length > 0
              ? activeServerTrafficBuckets.map((bucket) => Number(bucket?.total || 0))
              : zeroTelemetryLabels.map(() => 0);
            const activeServerTrafficErrors = activeServerTrafficBuckets.length > 0
              ? activeServerTrafficBuckets.map((bucket) => Number(bucket?.clientErrors || 0) + Number(bucket?.serverErrors || 0))
              : zeroTelemetryLabels.map(() => 0);
            const activeServerStatusLabels = activeServerStatusBuckets.length > 0
              ? activeServerStatusBuckets.map((bucket) => bucket?.label || "")
              : zeroTelemetryLabels;
            const activeServerStatusSuccess = activeServerStatusBuckets.length > 0 ? activeServerStatusBuckets.map((bucket) => {
              const explicitRate = Number(bucket?.successRate);
              if (Number.isFinite(explicitRate)) {
                return explicitRate;
              }
              const total = Number(bucket?.total || 0);
              const success = Number(bucket?.success || 0);
              return total > 0 ? Math.round((success / total) * 1000) / 10 : 0;
            }) : zeroTelemetryLabels.map(() => 0);
            const activeServerStatusLatency = activeServerStatusBuckets.length > 0
              ? activeServerStatusBuckets.map((bucket) => Number(bucket?.p95LatencyMs || 0))
              : zeroTelemetryLabels.map(() => 0);
            const activeServerStatusErrors = activeServerStatusBuckets.length > 0
              ? activeServerStatusBuckets.map((bucket) => Number(bucket?.clientErrors || 0) + Number(bucket?.serverErrors || 0))
              : zeroTelemetryLabels.map(() => 0);
            const serverDetailActivityBuckets = buildPlaygroundEnvironmentHomeActivityBuckets(normalizedServerDetailChartTimescale);
            const readServerDetailRequestTimestampMs = (entry) => {
              const timestamp = Date.parse(String(entry?.timestamp || entry?.createdAt || entry?.updatedAt || ""));
              return Number.isFinite(timestamp) ? timestamp : null;
            };
            const resolvedServerDetailTrafficBuckets = activeServerTrafficBuckets.length > 0
              ? activeServerTrafficBuckets
              : serverDetailActivityBuckets.map((bucket) => ({
                  ...bucket,
                  total: 0,
                }));
            const serverDetailTrafficLabels = resolvedServerDetailTrafficBuckets.map((bucket) => bucket?.label || "");
            const serverDetailTrafficCounts = resolvedServerDetailTrafficBuckets.map((bucket) => Number(bucket?.total || 0));
            const readServerMetricNumber = (...values) => {
              for (const value of values) {
                if (value == null || value === "") {
                  continue;
                }
                const numeric = Number(value);
                if (Number.isFinite(numeric)) {
                  return numeric;
                }
              }
              return 0;
            };
            const readServerNestedMetricNumber = (source, paths) => {
              const candidates = [];
              (Array.isArray(paths) ? paths : []).forEach((path) => {
                const parts = String(path || "").split(".").filter(Boolean);
                let current = source;
                parts.forEach((part) => {
                  current = current && typeof current === "object" ? current[part] : undefined;
                });
                candidates.push(current);
              });
              for (const value of candidates) {
                if (value == null || value === "") {
                  continue;
                }
                const numeric = Number(value);
                if (Number.isFinite(numeric)) {
                  return numeric;
                }
              }
              return null;
            };
            const averageServerBucketMetric = (buckets, paths) => {
              const values = (Array.isArray(buckets) ? buckets : [])
                .map((bucket) => readServerNestedMetricNumber(bucket, paths))
                .filter((value) => Number.isFinite(value) && value > 0);
              if (values.length === 0) {
                return 0;
              }
              return values.reduce((sum, value) => sum + value, 0) / values.length;
            };
            const functionMemoryMb = readServerMetricNumber(
              readServerNestedMetricNumber(resolvedServerAnalyticsSummary, [
                "avgMemoryMb",
                "averageMemoryMb",
                "memoryMb",
                "memoryUsageMb",
                "avgMemoryUsageMb",
                "memory.avgMb",
                "memory.averageMb",
              ]),
              averageServerBucketMetric(activeServerStatusBuckets, ["avgMemoryMb", "memoryMb", "memoryUsageMb", "memory.avgMb"]),
              averageServerBucketMetric(activeServerTrafficBuckets, ["avgMemoryMb", "memoryMb", "memoryUsageMb", "memory.avgMb"])
            );
            const functionCpuTimeMs = readServerMetricNumber(
              readServerNestedMetricNumber(resolvedServerAnalyticsSummary, [
                "avgCpuTimeMs",
                "cpuTimeMs",
                "cpuMs",
                "avgCpuMs",
                "cpu.avgMs",
                "cpu.averageMs",
              ]),
              averageServerBucketMetric(activeServerStatusBuckets, ["avgCpuTimeMs", "cpuTimeMs", "cpuMs", "cpu.avgMs"]),
              averageServerBucketMetric(activeServerTrafficBuckets, ["avgCpuTimeMs", "cpuTimeMs", "cpuMs", "cpu.avgMs"])
            );
            const formatFunctionMemory = (value) => {
              const numeric = Number(value);
              if (!Number.isFinite(numeric) || numeric <= 0) {
                return "0 MB";
              }
              if (numeric >= 1024) {
                const gb = numeric / 1024;
                return (Math.abs(gb - Math.round(gb)) < 0.05 ? String(Math.round(gb)) : gb.toFixed(1).replace(/\.0$/, "")) + " GB";
              }
              return String(Math.round(numeric)) + " MB";
            };
            const serverUsageMetricConfig = isFunctionServer
              ? { title: "Function Invocations", metricLabel: "Invocations", emptyLabel: "invocation" }
              : isWebAppServer
                ? { title: "Web App Invocations", metricLabel: "Requests", emptyLabel: "request" }
                : isAuthServer
                  ? { title: "Authentication Events", metricLabel: "Events", emptyLabel: "authentication event" }
                  : isSecretsServer
                    ? { title: "Secret Accesses", metricLabel: "Accesses", emptyLabel: "secret access" }
                    : isPaymentsServer
                      ? { title: "Payment Activity", metricLabel: "Checkout Sessions", emptyLabel: "payment event" }
                      : isAgentRuntimeServer
                        ? { title: "Agent Runtime Runs", metricLabel: "Runs", emptyLabel: "runtime run" }
                        : { title: "Resource Activity", metricLabel: "Requests", emptyLabel: "request" };
            const serverPermissionResourceNoun = formatPlaygroundServerKindLabel(draftServer.kind).toLowerCase();
            const serverPermissionInvokeLabel = isAuthServer
              ? "Authenticate users"
              : isSecretsServer
                ? "Access secrets"
                : isPaymentsServer
                  ? "Create checkout sessions"
                  : isAgentRuntimeServer
                    ? "Run agents"
                    : "Invoke resource";
            const serverPermissionManageLabel = isAuthServer
              ? "Manage authentication"
              : isSecretsServer
                ? "Manage secrets"
                : isPaymentsServer
                  ? "Manage payments"
                  : isAgentRuntimeServer
                    ? "Configure runtime"
                    : "Edit source";
            const serverPermissionActionPresentation = serverPermissionSubjectType !== "server" || isSourceDeployableServer ? null : {
              server_source_read: {
                label: "View configuration",
                description: "View this " + serverPermissionResourceNoun + " configuration, status, and metadata.",
              },
              server_invoke: {
                label: serverPermissionInvokeLabel,
                description: "Use the managed capabilities exposed by this " + serverPermissionResourceNoun + ".",
              },
              server_logs_read: {
                label: "View usage and activity",
                description: "View analytics, activity history, and operational status for this " + serverPermissionResourceNoun + ".",
              },
              server_source_write: {
                label: serverPermissionManageLabel,
                description: "Change the managed configuration and operational settings for this " + serverPermissionResourceNoun + ".",
              },
              server_connection_manage: {
                label: "Manage connections",
                description: "Connect or disconnect this " + serverPermissionResourceNoun + " from other managed resources.",
              },
              server_deploy: {
                label: "Publish changes",
                description: "Publish versioned configuration changes for this " + serverPermissionResourceNoun + ".",
              },
              server_access_manage: {
                label: "Manage access",
                description: "Share this " + serverPermissionResourceNoun + " and change team permission policies.",
              },
              server_delete: {
                label: "Delete resource",
                description: "Permanently delete this " + serverPermissionResourceNoun + " and its managed data.",
              },
            };
            const serverDetailKpis = isSourceDeployableServer
              ? [
                  { id: "invocations", value: String(resolvedServerAnalyticsSummary.totalRequests ?? resolvedServerAnalyticsSummary.totalRequests24h ?? 0), label: isFunctionServer ? "Invocations" : "Requests", Icon: Globe },
                  { id: "memory", value: formatFunctionMemory(functionMemoryMb), label: "Memory", Icon: HardDrive },
                  { id: "cpu-time", value: formatPlaygroundServerLatency(functionCpuTimeMs), label: "CPU time", Icon: Cpu },
                  { id: "execution-time", value: formatPlaygroundServerLatency(resolvedServerAnalyticsSummary.p95LatencyMs), label: "Execution time", Icon: Clock },
                  { id: "errors", value: String(Number(resolvedServerAnalyticsSummary.clientErrors ?? resolvedServerAnalyticsSummary.clientErrors24h ?? 0) + Number(resolvedServerAnalyticsSummary.serverErrors ?? resolvedServerAnalyticsSummary.serverErrors24h ?? 0)), label: "Errors", Icon: X },
                ]
              : [
                  { id: "requests", value: String(resolvedServerAnalyticsSummary.totalRequests ?? resolvedServerAnalyticsSummary.totalRequests24h ?? 0), label: serverUsageMetricConfig.metricLabel, Icon: Globe },
                  { id: "success-rate", value: formatPlaygroundServerRate(resolvedServerAnalyticsSummary.successRate24h), label: "Success Rate", Icon: Check },
                  { id: "latency", value: formatPlaygroundServerLatency(resolvedServerAnalyticsSummary.p95LatencyMs), label: "P95 Latency", Icon: Clock },
                  { id: "errors", value: String(Number(resolvedServerAnalyticsSummary.clientErrors24h || 0) + Number(resolvedServerAnalyticsSummary.serverErrors24h || 0)), label: "4xx / 5xx", Icon: X },
                ];
            const serverDetailTimescaleOptions = [
              { value: "day", label: "24H" },
              { value: "week", label: "7D" },
              { value: "month", label: "30D" },
            ];
            const sourceServerAnalyticsMetricColors = {
              invocations: "#7effff",
              requests: "#7effff",
              memory: "rgb(143,196,255)",
              "cpu-time": "rgb(103,80,255)",
              "execution-time": "#f7b955",
              errors: "#f53b3a",
            };
            const sourceServerDetailAnalyticsModel = {
              title: serverUsageMetricConfig.title,
              ariaLabel: serverUsageMetricConfig.title,
              metrics: serverDetailKpis.map((item) => ({
                id: item.id,
                label: item.label,
                value: item.value,
                color: sourceServerAnalyticsMetricColors[item.id] || "rgba(255, 255, 255, 0.72)",
              })),
              labels: serverDetailTrafficLabels,
              series: [
                {
                  id: "server-requests",
                  label: serverUsageMetricConfig.metricLabel,
                  values: serverDetailTrafficCounts,
                  color: "#7effff",
                  type: "line",
                  axis: "primary",
                  valueKind: "count",
                },
              ],
              loading: isServerAnalyticsLoading && !activeServerAnalytics,
            };
            const renderServerDetailTimescaleControl = () => React.createElement("div", {
                className: "playground-project-overview-progress-combo-ranges playground-database-detail-usage-ranges",
                role: "group",
                "aria-label": formatPlaygroundServerKindLabel(draftServer.kind) + " analytics time frame",
              },
              [
                { id: "day", label: "1D" },
                { id: "week", label: "1W" },
                { id: "month", label: "1M" },
              ].map((option) => React.createElement("button", {
                  key: option.id,
                  type: "button",
                  className: "playground-project-overview-progress-combo-range"
                    + (normalizedServerDetailChartTimescale === option.id ? " is-active" : ""),
                  onClick: () => setServerDetailChartTimescale(option.id),
                  "aria-pressed": normalizedServerDetailChartTimescale === option.id ? "true" : "false",
                }, option.label)
              )
            );
            const renderServerDetailRequestChart = () => React.createElement(PlaygroundResourceOperationsChart, {
              ariaLabel: serverUsageMetricConfig.title,
              labels: serverDetailTrafficLabels,
              series: [
                {
                  id: "server-requests",
                  label: serverUsageMetricConfig.metricLabel,
                  color: "rgb(143,196,255)",
                  values: serverDetailTrafficCounts,
                },
              ],
              emptyText: isServerAnalyticsLoading
                ? "Loading " + serverUsageMetricConfig.emptyLabel + " data..."
                : "No " + serverUsageMetricConfig.emptyLabel + " data yet",
              loadingLabel: "Loading " + serverUsageMetricConfig.emptyLabel + " data",
              isLoading: isServerAnalyticsLoading && !activeServerAnalytics,
            });
            const renderServerDetailChartKpis = (items) => React.createElement("div", {
                className: "playground-project-overview-progress-combo-metrics playground-server-detail-chart-kpis",
              },
              (Array.isArray(items) ? items : []).map((item, index) =>
                React.createElement("div", { key: item.id, className: "playground-project-overview-progress-combo-metric" },
                  React.createElement("div", { className: "playground-project-overview-progress-combo-metric-label" },
                    React.createElement("span", {
                      className: "playground-project-overview-progress-combo-metric-dot is-" + item.id,
                      style: { background: ["#7effff", "rgb(143,196,255)", "rgb(103,80,255)", "#f7b955", "#f53b3a"][index % 5] },
                      "aria-hidden": "true",
                    }),
                    React.createElement("span", null, item.label)
                  ),
                  React.createElement("div", { className: "playground-project-overview-progress-combo-metric-value" }, item.value)
                )
              )
            );
            const serverAnalyticsLogKinds = [
              { id: "request", label: "Requests", description: "HTTP traffic, status, and latency entries", Icon: Globe },
              { id: "runtime", label: "Console", description: "Runtime stdout, stderr, and application logs", Icon: Terminal },
              { id: "deployment", label: "Deploy", description: "Deployment output and build logs", Icon: Rocket },
            ];
            const renderServerAnalyticsKpi = (label, value, tone) => React.createElement("div", {
                className: "playground-servers-analytics-kpi",
                key: label,
              },
              React.createElement("div", { className: "playground-servers-analytics-kpi-value" }, value),
              React.createElement("button", {
                  type: "button",
                  className: "playground-database-overview-kpi-label"
                    + (tone ? " is-" + tone : "")
                    + (tone && serverAnalyticsVisibility[tone] === false ? " is-inactive" : ""),
                  onClick: () => {
                    if (!tone) {
                      return;
                    }
                    setServerAnalyticsVisibility((current) => ({
                      ...current,
                      [tone]: current[tone] === false,
                    }));
                  },
                  "aria-pressed": tone ? (serverAnalyticsVisibility[tone] === false ? "false" : "true") : "true",
                },
                React.createElement("span", { className: "playground-database-overview-kpi-check" },
                  React.createElement(Check, { width: 9, height: 9, strokeWidth: 2.4 })
                ),
                React.createElement("span", null, label)
              )
            );
            const renderServerTelemetryChart = (config) => {
              const labels = Array.isArray(config?.labels) ? config.labels : [];
              const series = Array.isArray(config?.series)
                ? config.series.filter((entry) => entry && serverAnalyticsVisibility[entry.key] !== false)
                : [];
              return renderPlaygroundTelemetryTimeseriesChart({
                ariaLabel: config?.ariaLabel || "Server telemetry chart",
                labels,
                series,
                emptyText: config?.emptyText || "Select a metric",
                buildLinePath: buildServerAnalyticsSvgLinePath,
                getSeriesValue: (entry, _label, index) => entry?.values?.[index],
                getXAxisLabel: (label) => String(label || ""),
              });
            };
            const serverAnalyticsOverview = React.createElement("div", { className: "playground-database-overview" },
              React.createElement("div", { className: "playground-servers-analytics-kpi-grid" },
                [
                  renderServerAnalyticsKpi("Requests (24h)", String(resolvedServerAnalyticsSummary.totalRequests24h || 0), "requests"),
                  renderServerAnalyticsKpi("Success rate", formatPlaygroundServerRate(resolvedServerAnalyticsSummary.successRate24h), "success"),
                  renderServerAnalyticsKpi("P95 latency", formatPlaygroundServerLatency(resolvedServerAnalyticsSummary.p95LatencyMs), "latency"),
                  renderServerAnalyticsKpi("4xx / 5xx", String(Number(resolvedServerAnalyticsSummary.clientErrors24h || 0) + Number(resolvedServerAnalyticsSummary.serverErrors24h || 0)), "errors"),
                ]
              ),
              React.createElement("div", { className: "playground-database-overview-chart-grid" },
                React.createElement("div", { className: "playground-database-overview-chart-block" },
                  renderServerTelemetryChart({
                    labels: activeServerTrafficLabels,
                    series: [
                      {
                        key: "requests",
                        tone: "requests",
                        values: activeServerTrafficCounts,
                      },
                      {
                        key: "errors",
                        tone: "errors",
                        values: activeServerTrafficErrors,
                      },
                    ],
                    emptyText: "No request data yet",
                    ariaLabel: "Requests and failed requests over time",
                  })
                ),
                React.createElement("div", { className: "playground-database-overview-chart-block" },
                  renderServerTelemetryChart({
                    labels: activeServerStatusLabels,
                    series: [
                      {
                        key: "success",
                        tone: "success",
                        values: activeServerStatusSuccess,
                      },
                      {
                        key: "latency",
                        tone: "latency",
                        values: activeServerStatusLatency,
                      },
                    ],
                    emptyText: "No status data yet",
                    ariaLabel: "Success rate and latency over time",
                  })
                )
              )
            );
            const getServerLogStatusTone = (entry, kind) => {
              const normalizedKind = String(kind || "request");
              if (normalizedKind === "request") {
                const status = Number(entry?.status);
                if (Number.isFinite(status)) {
                  if (status >= 500) return "error";
                  if (status >= 400) return "warning";
                  if (status >= 300) return "info";
                  if (status >= 200) return "success";
                }
                return "info";
              }
              const statusText = String(entry?.severity || entry?.stream || "").trim().toLowerCase();
              if (statusText.includes("error") || statusText.includes("fatal") || statusText.includes("stderr")) return "error";
              if (statusText.includes("warn")) return "warning";
              if (statusText.includes("success") || statusText.includes("complete")) return "success";
              return "info";
            };
            const renderServerLogStatusPill = (label, tone) => React.createElement("span", {
                className: "playground-servers-analytics-log-pill is-" + (tone || "info"),
              },
              label || "—"
            );
            const buildServerLogRowKey = (entry, kind) => [
              String(kind || "request"),
              entry?.id,
              entry?.timestamp || entry?.createdAt || entry?.updatedAt,
              entry?.method,
              entry?.path,
              entry?.status,
              entry?.stream,
              entry?.severity,
              String(entry?.message || "").slice(0, 96),
            ].map((value) => String(value || "")).join(":");
            const buildServerLogDetailText = (entry, kind) => {
              const normalizedKind = String(kind || "request");
              if (normalizedKind === "request") {
                return JSON.stringify({
                  method: String(entry?.method || "GET"),
                  path: String(entry?.path || "/"),
                  status: formatPlaygroundServerRequestStatus(entry?.status),
                  latency: formatPlaygroundServerLatency(entry?.latencyMs),
                  time: formatPlaygroundFileDate(entry?.timestamp),
                }, null, 2);
              }
              return String(entry?.message || "").trim() || "No log message available.";
            };
            const inferServerLogDetailLanguage = (value, kind) => {
              const text = String(value || "").trim();
              if (String(kind || "request") === "request") {
                return "json";
              }
              if (!text) {
                return "plaintext";
              }
              try {
                JSON.parse(text);
                return "json";
              } catch {}
              const lowerText = text.toLowerCase();
              if (lowerText.startsWith("<!doctype html") || lowerText.startsWith("<html") || /<\/?[a-z][\s\S]*>/i.test(text)) {
                return "html";
              }
              if (/^\s*(\$|>|npm |pnpm |yarn |node |python3? |gcloud |curl |git )/m.test(text)) {
                return "shell";
              }
              if (text.includes("Traceback (most recent call last)") || /\bFile "[^"]+", line \d+/m.test(text)) {
                return "python";
              }
              if (/\b(function|const|let|var|import|export|class|async)\b/.test(text) || /=>\s*[{(]/.test(text)) {
                return "javascript";
              }
              return "plaintext";
            };
            const getServerLogDetailEditorHeight = (value) => {
              const lineCount = String(value || "").split(/\n/).length;
              return Math.min(420, Math.max(140, (lineCount + 2) * 20)) + "px";
            };
            const renderServerLogDetailContent = (entry, kind) => {
              const detailText = buildServerLogDetailText(entry, kind);
              if (ServerPreviewEditorComponent) {
                return React.createElement("div", { className: "playground-code-preview-editor-shell playground-servers-logs-expanded-editor-shell" },
                  React.createElement(ServerPreviewEditorComponent, {
                    path: "server-log." + (inferServerLogDetailLanguage(detailText, kind) === "json" ? "json" : "log"),
                    height: getServerLogDetailEditorHeight(detailText),
                    language: inferServerLogDetailLanguage(detailText, kind),
                    theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                    value: detailText,
                    beforeMount: ensurePlaygroundCodeEditorTheme,
                    options: {
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      readOnly: true,
                      fontSize: 12,
                      lineHeight: 20,
                      tabSize: 2,
                      insertSpaces: true,
                      renderLineHighlight: "none",
                      lineNumbersMinChars: 3,
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      wordWrap: "on",
                      padding: { top: 12, bottom: 12 },
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    },
                  })
                );
              }
              return React.createElement("pre", { className: "playground-servers-logs-expanded-detail" }, detailText);
            };
            const toggleServerLogExpansion = (rowKey) => {
              setExpandedServerLogKey((current) => current === rowKey ? "" : rowKey);
            };
            const readServerLogTimestampMs = (entry) => {
              const timestamp = Date.parse(String(entry?.timestamp || entry?.createdAt || entry?.updatedAt || ""));
              return Number.isFinite(timestamp) ? timestamp : 0;
            };
            const getServerLogSearchText = (entry, kind) => {
              const normalizedKind = String(kind || "request");
              if (normalizedKind === "request") {
                return [
                  entry?.timestamp,
                  entry?.method,
                  entry?.path,
                  entry?.status,
                  entry?.latencyMs,
                ].map((value) => String(value || "")).join(" ");
              }
              return [
                entry?.timestamp,
                entry?.stream,
                entry?.severity,
                entry?.message,
              ].map((value) => String(value || "")).join(" ");
            };
            const normalizedServerLogsSearchQuery = String(serverLogsSearchQuery || "").trim().toLowerCase();
            const displayedServerLogList = activeServerLogList
              .filter((entry) => {
                if (!normalizedServerLogsSearchQuery) {
                  return true;
                }
                return getServerLogSearchText(entry, serverLogsState.kind).toLowerCase().includes(normalizedServerLogsSearchQuery);
              })
              .slice()
              .sort((left, right) => {
                const delta = readServerLogTimestampMs(right) - readServerLogTimestampMs(left);
                return serverLogsSort === "oldest" ? -delta : delta;
              });
            const serverLogsPageSize = 20;
            const normalizedServerLogsKind = ["request", "runtime", "deployment"].includes(String(serverLogsState.kind || "").trim().toLowerCase())
              ? String(serverLogsState.kind).trim().toLowerCase()
              : "request";
            const serverLogsVisibleCount = Math.max(serverLogsPageSize, Number(serverLogsVisibleCountByKind[normalizedServerLogsKind] || serverLogsPageSize));
            const visibleServerLogList = displayedServerLogList.slice(0, serverLogsVisibleCount);
            const hasMoreServerLogs = displayedServerLogList.length > visibleServerLogList.length;
            const handleLoadMoreServerLogs = () => {
              setServerLogsVisibleCountByKind((current) => ({
                ...current,
                [normalizedServerLogsKind]: Math.max(serverLogsPageSize, Number(current[normalizedServerLogsKind] || serverLogsPageSize)) + serverLogsPageSize,
              }));
            };
            const selectServerLogKind = (kind) => {
              const normalizedKind = ["request", "runtime", "deployment"].includes(String(kind || "").trim().toLowerCase())
                ? String(kind).trim().toLowerCase()
                : "request";
              setServerLogsState((current) => ({
                ...current,
                kind: normalizedKind,
                error: "",
              }));
              setServerLogsToolbarPopover("");
              setExpandedServerLogKey("");
              if (draftServer.id) {
                void loadServerLogs(draftServer.id, normalizedKind);
              }
            };
            const formatServerDeploymentOutcomeLabel = (outcome) => {
              const normalizedOutcome = String(outcome || "").trim().toLowerCase();
              if (normalizedOutcome === "rollback") return "Rollback";
              if (normalizedOutcome === "failed" || normalizedOutcome === "error") return "Failed";
              return "Success";
            };
            const getServerDeploymentOutcomeTone = (deployment) => {
              const normalizedOutcome = String(deployment?.outcome || "").trim().toLowerCase();
              if (normalizedOutcome === "failed" || normalizedOutcome === "error") return "error";
              if (normalizedOutcome === "rollback") return "warning";
              return "success";
            };
            const readServerDeploymentTimestampMs = (deployment) => {
              const timestamp = Date.parse(String(deployment?.at || deployment?.createdAt || deployment?.updatedAt || ""));
              return Number.isFinite(timestamp) ? timestamp : 0;
            };
            const renderServerDeploymentsSurface = () => {
              const loadedDeployments = Array.isArray(currentServerDeployments) ? currentServerDeployments : [];
              const fallbackDeployment = loadedDeployments.length > 0 ? null : buildPlaygroundServerCurrentDeploymentFallback(draftServer);
              const deployments = loadedDeployments.length > 0
                ? loadedDeployments
                : fallbackDeployment
                  ? [fallbackDeployment]
                  : [];
              const sortedDeployments = deployments.slice().sort((left, right) => readServerDeploymentTimestampMs(right) - readServerDeploymentTimestampMs(left));
              const activeDeploymentId = String(draftServer?.metadata?.activeDeploymentId || "").trim();
              const activeRevision = String(activeServerDeploymentRecord?.revision || draftServer?.metadata?.lastDeployment?.revision || draftServer?.metadata?.latestRevision || "").trim();
              const isServerDeploymentsLoading = loadingServerDeploymentsId === draftServer.id;
              return React.createElement("div", {
                  className: "playground-environments-editor-surface playground-servers-analytics-logs-surface playground-servers-deployments-surface" + (isWebAppServer ? " is-web-app-history" : ""),
                },
                React.createElement("div", { className: "playground-plugins-section-header playground-servers-logs-section-header" },
                  React.createElement("div", { className: "playground-plugins-section-copy" },
                    React.createElement("h3", { className: "playground-plugins-section-title" }, "Deployments")
                  ),
                  React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    onClick: () => void loadServerDeployments(draftServer.id, { force: true }),
                    disabled: !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || isServerDeploymentsLoading,
                  },
                    isServerDeploymentsLoading
                      ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                      : React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Refresh")
                  )
                ),
                serverDeploymentHistoryState.error
                  ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, serverDeploymentHistoryState.error)
                  : null,
                React.createElement(PlatformDataTable, {
                  rows: sortedDeployments,
                  getRowId: (deployment) => String(deployment?.id || deployment?.revision || deployment?.at || deployment?.createdAt || "deployment"),
                  ariaLabel: "Server deployments",
                  className: "playground-servers-deployments-platform-table",
                  surface: "plain",
                  sticky: false,
                  loading: isServerDeploymentsLoading && sortedDeployments.length === 0,
                  emptyState: "No deployments yet.",
                  columns: [
                    {
                      id: "status",
                      header: "Status",
                      width: "minmax(90px, 0.75fr)",
                      cell: ({ row: deployment }) => renderServerLogStatusPill(
                        formatServerDeploymentOutcomeLabel(deployment?.outcome),
                        getServerDeploymentOutcomeTone(deployment)
                      ),
                    },
                    {
                      id: "revision",
                      header: "Revision",
                      accessor: (deployment) => deployment?.revision || "",
                      width: "minmax(120px, 1fr)",
                      cell: ({ row: deployment }) => React.createElement("div", {
                        className: "playground-agents-overview-table-value playground-servers-logs-table-message",
                        title: String(deployment?.revision || "No revision"),
                      }, deployment?.revision || "—"),
                    },
                    {
                      id: "runtime",
                      header: "Runtime",
                      accessor: (deployment) => deployment?.runtime || "",
                      width: "minmax(100px, 0.8fr)",
                      cell: ({ row: deployment }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, deployment?.runtime || "—"),
                    },
                    {
                      id: "source",
                      header: "Source",
                      accessor: (deployment) => deployment?.sourcePath || deployment?.sourceEnvironmentId || "",
                      width: "minmax(150px, 1.35fr)",
                      hideBelow: 760,
                      cell: ({ row: deployment }) => React.createElement("div", {
                        className: "playground-agents-overview-table-value playground-servers-logs-table-message",
                        title: String(deployment?.sourcePath || deployment?.sourceEnvironmentId || ""),
                      }, deployment?.sourcePath || deployment?.sourceEnvironmentId || "—"),
                    },
                    {
                      id: "time",
                      header: "Time",
                      accessor: (deployment) => readServerDeploymentTimestampMs(deployment),
                      width: "minmax(110px, 0.85fr)",
                      align: "end",
                      cell: ({ row: deployment }) => formatPlaygroundFileDate(deployment?.at),
                    },
                    {
                      id: "action",
                      header: "Action",
                      width: "minmax(110px, 0.8fr)",
                      align: "end",
                      cell: ({ row: deployment }) => {
                        const deploymentId = String(deployment?.id || "").trim();
                        const revision = String(deployment?.revision || "").trim();
                        const isActiveDeployment = Boolean(
                          (activeDeploymentId && deploymentId && activeDeploymentId === deploymentId)
                          || (activeRevision && revision && activeRevision === revision)
                        );
                        const canRollback = !isActiveDeployment
                          && Boolean(deploymentId)
                          && Boolean(revision)
                          && !["failed", "error"].includes(String(deployment?.outcome || "").trim().toLowerCase());
                        const isRollingBack = serverDeploymentHistoryState.rollingBackDeploymentId === deploymentId;
                        if (isActiveDeployment) return "Active";
                        if (!canRollback) return "—";
                        return React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: () => void handleRollbackServerDeployment(deployment),
                          disabled: isRollingBack,
                        },
                          isRollingBack
                            ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                            : React.createElement(RotateCcw, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, isRollingBack ? "Rolling back" : "Rollback")
                        );
                      },
                    },
                  ],
                })
              );
            };
            const renderServerLogsSurface = () => {
              const isRequestLog = serverLogsState.kind === "request";
              const serverLogColumns = isRequestLog
                ? [
                    {
                      id: "status",
                      header: "Status",
                      width: "minmax(90px, 0.75fr)",
                      cell: ({ row: entry }) => renderServerLogStatusPill(
                        formatPlaygroundServerRequestStatus(entry?.status),
                        getServerLogStatusTone(entry, "request")
                      ),
                    },
                    { id: "method", header: "Method", accessor: (entry) => entry?.method || "GET", width: "minmax(80px, 0.65fr)" },
                    {
                      id: "path",
                      header: "Path",
                      accessor: (entry) => entry?.path || "/",
                      width: "minmax(180px, 2fr)",
                      cell: ({ row: entry }) => React.createElement("div", {
                        className: "playground-agents-overview-table-value playground-servers-logs-table-message",
                        title: String(entry?.path || "/"),
                      }, String(entry?.path || "/")),
                    },
                    {
                      id: "latency",
                      header: "Latency",
                      accessor: (entry) => Number(entry?.latencyMs || 0),
                      width: "minmax(90px, 0.75fr)",
                      align: "end",
                      cell: ({ row: entry }) => formatPlaygroundServerLatency(entry?.latencyMs),
                    },
                    {
                      id: "time",
                      header: "Time",
                      accessor: (entry) => readServerLogTimestampMs(entry),
                      sortable: true,
                      sortDescFirst: true,
                      width: "minmax(110px, 0.9fr)",
                      align: "end",
                      cell: ({ row: entry }) => formatPlaygroundFileDate(entry?.timestamp),
                    },
                  ]
                : [
                    {
                      id: "status",
                      header: "Status",
                      width: "minmax(90px, 0.75fr)",
                      cell: ({ row: entry }) => renderServerLogStatusPill(
                        serverLogsState.kind === "deployment" ? String(entry?.stream || "deploy") : String(entry?.severity || "INFO"),
                        getServerLogStatusTone(entry, serverLogsState.kind)
                      ),
                    },
                    {
                      id: "type",
                      header: "Type",
                      accessor: () => formatPlaygroundServerLogKindLabel(serverLogsState.kind),
                      width: "minmax(100px, 0.8fr)",
                    },
                    {
                      id: "message",
                      header: "Message",
                      accessor: (entry) => entry?.message || "",
                      width: "minmax(200px, 2.5fr)",
                      cell: ({ row: entry }) => React.createElement("div", {
                        className: "playground-agents-overview-table-value playground-servers-logs-table-message",
                        title: String(entry?.message || ""),
                      }, entry?.message || "—"),
                    },
                    {
                      id: "time",
                      header: "Time",
                      accessor: (entry) => readServerLogTimestampMs(entry),
                      sortable: true,
                      sortDescFirst: true,
                      width: "minmax(110px, 0.9fr)",
                      align: "end",
                      cell: ({ row: entry }) => formatPlaygroundFileDate(entry?.timestamp),
                    },
                  ];
              return React.createElement("div", {
                  className: "playground-environments-editor-surface playground-servers-analytics-logs-surface",
                },
                React.createElement(PlatformDataTable, {
                  rows: visibleServerLogList,
                  columns: serverLogColumns,
                  getRowId: (entry) => buildServerLogRowKey(entry, serverLogsState.kind),
                  ariaLabel: formatPlaygroundServerLogKindLabel(serverLogsState.kind) + " logs",
                  className: "playground-servers-logs-platform-table",
                  surface: "plain",
                  sticky: false,
                  loading: isServerLogsLoading,
                  error: serverLogsState.error || null,
                  emptyState: normalizedServerLogsSearchQuery
                    ? "No matching logs found."
                    : "No " + formatPlaygroundServerLogKindLabel(serverLogsState.kind).toLowerCase() + " logs yet.",
                  sorting: {
                    value: { id: "time", direction: serverLogsSort === "oldest" ? "asc" : "desc" },
                    manual: true,
                    onChange: (next) => {
                      setServerLogsSort(next?.direction === "asc" ? "oldest" : "newest");
                      setExpandedServerLogKey("");
                    },
                  },
                  toolbar: {
                    title: "All Logs",
                    search: {
                      value: serverLogsSearchQuery,
                      manual: true,
                      placeholder: "Search logs",
                      onChange: (value) => {
                        setServerLogsSearchQuery(value);
                        setExpandedServerLogKey("");
                      },
                    },
                    showSort: true,
                    filters: [{
                      id: "kind",
                      label: "Log type",
                      value: serverLogsState.kind,
                      onChange: selectServerLogKind,
                      options: serverAnalyticsLogKinds.map((option) => ({
                        id: option.id,
                        label: option.label,
                        description: option.description,
                      })),
                    }],
                  },
                  onRowActivate: (entry) => toggleServerLogExpansion(buildServerLogRowKey(entry, serverLogsState.kind)),
                  getRowClassName: (entry) => "playground-servers-logs-table-row" + (
                    expandedServerLogKey === buildServerLogRowKey(entry, serverLogsState.kind) ? " is-expanded" : ""
                  ),
                  getRowAriaLabel: (entry) => "Inspect log " + buildServerLogRowKey(entry, serverLogsState.kind),
                  isRowExpanded: (entry) => expandedServerLogKey === buildServerLogRowKey(entry, serverLogsState.kind),
                  renderExpandedRow: ({ row: entry }) => renderServerLogDetailContent(entry, serverLogsState.kind),
                  footer: hasMoreServerLogs
                    ? React.createElement("div", { className: "playground-servers-logs-load-more-row" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: handleLoadMoreServerLogs,
                        },
                          React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Load 20 more")
                        )
                      )
                    : null,
                })
              );
            };
  
            const canUndoServerDescription = Array.isArray(serverDescriptionHistory.past) && serverDescriptionHistory.past.length > 0;
            const canRedoServerDescription = Array.isArray(serverDescriptionHistory.future) && serverDescriptionHistory.future.length > 0;
            const renderServerDescriptionToolbarButton = (action) => React.createElement("button", {
                key: action.id,
                type: "button",
                className: "playground-tasks-detail-format-button",
                title: action.label,
                "aria-label": action.label,
                disabled: isServerTemplatePreview || Boolean(action.disabled),
                onMouseDown: (event) => event.preventDefault(),
                onClick: action.onClick || (() => handleServerDescriptionFormat(action.id)),
              }, React.createElement(action.icon, {
                width: 14,
                height: 14,
                strokeWidth: action.strokeWidth || 1.8,
              }));
            const serverDescriptionFormatActions = React.createElement("div", { className: "playground-tasks-detail-format-actions" },
              renderServerDescriptionToolbarButton({ id: "undo", label: "Undo", icon: Undo2, disabled: !canUndoServerDescription, onClick: handleServerDescriptionUndo }),
              renderServerDescriptionToolbarButton({ id: "redo", label: "Redo", icon: Redo2, disabled: !canRedoServerDescription, onClick: handleServerDescriptionRedo }),
              React.createElement("span", { className: "playground-agents-detail-instructions-toolbar-divider", "aria-hidden": "true" }),
              [
                { id: "bold", label: "Bold", icon: Bold, strokeWidth: 2.7 },
                { id: "italic", label: "Italic", icon: Italic },
                { id: "underline", label: "Underline", icon: Underline },
              ].map(renderServerDescriptionToolbarButton),
              React.createElement("span", { className: "playground-agents-detail-instructions-toolbar-divider", "aria-hidden": "true" }),
              [
                { id: "list", label: "List", icon: List },
                { id: "ordered-list", label: "Ordered list", icon: ListOrdered },
              ].map(renderServerDescriptionToolbarButton),
              React.createElement("span", { className: "playground-agents-detail-instructions-toolbar-divider", "aria-hidden": "true" }),
              [
                { id: "code", label: "Code", icon: CodeXml },
                { id: "link", label: "Link", icon: Link2 },
              ].map(renderServerDescriptionToolbarButton)
            );
            const serverDescriptionEditor = React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isServerDescriptionEditing ? " is-editing" : " is-preview") },
              !isServerDescriptionEditing
                ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                    String(draftServer.description || "").trim()
                      ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                          content: draftServer.description,
                          className: "playground-tasks-detail-description-preview tb-message-markdown",
                        })
                      : React.createElement("div", {
                          className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                        }, "Add Description here")
                  )
                : null,
              React.createElement("textarea", {
                ref: serverDescriptionTextareaRef,
                className: "playground-tasks-detail-description-input " + (isServerDescriptionEditing ? "is-editing" : "is-preview"),
                rows: 1,
                placeholder: isServerDescriptionEditing ? "Add Description here" : "",
                value: draftServer.description || "",
                readOnly: isServerTemplatePreview,
                "aria-readonly": isServerTemplatePreview ? "true" : "false",
                onFocus: () => {
                  if (!isServerTemplatePreview) {
                    setIsServerDescriptionEditing(true);
                  }
                },
                onChange: (event) => {
                  if (isServerTemplatePreview) {
                    return;
                  }
                  updateServerDescriptionValue(event.target.value);
                  resizeEnvironmentDescriptionTextarea(event.currentTarget);
                },
                onBlur: () => {
                  setIsServerDescriptionEditing(false);
                  if (!isServerTemplatePreview) {
                    void commitDraftServerIfDirty();
                  }
                },
              })
            );
            const descriptionSection = React.createElement("div", {
                className: "playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section playground-database-description-section playground-server-settings-description-section",
                key: "server-description",
              },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                serverDescriptionFormatActions
              ),
              serverDescriptionEditor
            );
  
  	          const isFunctionInvokeCapableServer = isFunctionServer || isAgentRuntimeServer;
  	          const functionInvokePayload = JSON.stringify(isAgentRuntimeServer ? { prompt: "Run this agent workflow." } : { name: "Functions" });
  	          const functionInvokeSlug = String(draftServer.slug || draftServer.name || (isAgentRuntimeServer ? "agent-runtime" : "hello-world"))
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
  	            .replace(/^-+|-+$/g, "") || (isAgentRuntimeServer ? "agent-runtime" : "hello-world");
            const functionInvokeUrl = String(draftServer.serviceUrl || "").trim()
              || ("https://api.computer-agents.com/functions/v1/" + functionInvokeSlug);
            const functionDeployedServiceUrl = String(draftServer.serviceUrl || "").trim();
            const functionAuthMetadata = draftServer?.metadata?.functionAuth && typeof draftServer.metadata.functionAuth === "object" && !Array.isArray(draftServer.metadata.functionAuth)
              ? draftServer.metadata.functionAuth
              : {};
  	          const functionApiKeyAuthEnabled = isAgentRuntimeServer || (functionAuthMetadata.apiKeyAuthEnabled !== false
  	            && draftServer?.metadata?.functionApiKeyAuthEnabled !== false);
            const setFunctionApiKeyAuthEnabled = (nextEnabled) => {
              updateDraftServer((current) => {
                const normalized = normalizePlaygroundServerRecord(current || draftServer || selectedServerSnapshot || buildPlaygroundDefaultServerDraft());
                const metadata = normalized?.metadata && typeof normalized.metadata === "object" && !Array.isArray(normalized.metadata)
                  ? { ...normalized.metadata }
                  : {};
                const functionAuth = metadata.functionAuth && typeof metadata.functionAuth === "object" && !Array.isArray(metadata.functionAuth)
                  ? { ...metadata.functionAuth }
                  : {};
                functionAuth.apiKeyAuthEnabled = Boolean(nextEnabled);
                metadata.functionAuth = functionAuth;
                metadata.functionApiKeyAuthEnabled = Boolean(nextEnabled);
                return {
                  ...normalized,
                  metadata,
                };
              });
            };
            const functionInvokeSnippetTabs = [
              { id: "curl", label: "cURL" },
              { id: "javascript", label: "JavaScript" },
              { id: "swift", label: "Swift" },
              { id: "flutter", label: "Flutter" },
              { id: "python", label: "Python" },
            ];
            const functionInvokeSnippets = {
              curl: [
                "curl -L -X POST '" + functionInvokeUrl + "' \\",
                ...(functionApiKeyAuthEnabled ? ["  -H \"Authorization: Bearer $COMPUTER_AGENTS_API_KEY\" \\"] : []),
                "  -H 'Content-Type: application/json' \\",
                "  --data '" + functionInvokePayload.replace(/'/g, "'\\''") + "'",
              ].join("\n"),
              javascript: [
                ...(functionApiKeyAuthEnabled ? [
                  "const apiKey = process.env.COMPUTER_AGENTS_API_KEY;",
                  "",
                ] : []),
                "const response = await fetch('" + functionInvokeUrl + "', {",
                "  method: 'POST',",
                "  headers: {",
                ...(functionApiKeyAuthEnabled ? ["    Authorization: 'Bearer ' + apiKey,"] : []),
                "    'Content-Type': 'application/json',",
                "  },",
                "  body: JSON.stringify(" + functionInvokePayload + "),",
                "});",
                "",
                "const data = await response.json();",
                "console.log(data);",
              ].join("\n"),
              swift: [
                ...(functionApiKeyAuthEnabled ? ["let apiKey = \"COMPUTER_AGENTS_API_KEY\""] : []),
                "let url = URL(string: \"" + functionInvokeUrl + "\")!",
                "var request = URLRequest(url: url)",
                "request.httpMethod = \"POST\"",
                ...(functionApiKeyAuthEnabled ? ["request.setValue(\"Bearer \\(apiKey)\", forHTTPHeaderField: \"Authorization\")"] : []),
                "request.setValue(\"application/json\", forHTTPHeaderField: \"Content-Type\")",
  	              "request.httpBody = try JSONSerialization.data(withJSONObject: " + (isAgentRuntimeServer ? "[\"prompt\": \"Run this agent workflow.\"]" : "[\"name\": \"Functions\"]") + ")",
                "",
                "let (data, _) = try await URLSession.shared.data(for: request)",
                "print(String(data: data, encoding: .utf8) ?? \"\")",
              ].join("\n"),
              flutter: [
                ...(functionApiKeyAuthEnabled ? [
                  "const apiKey = 'COMPUTER_AGENTS_API_KEY';",
                  "",
                ] : []),
                "final response = await http.post(",
                "  Uri.parse('" + functionInvokeUrl + "'),",
                "  headers: {",
                ...(functionApiKeyAuthEnabled ? ["    'Authorization': 'Bearer $apiKey',"] : []),
                "    'Content-Type': 'application/json',",
                "  },",
                "  body: jsonEncode(" + functionInvokePayload + "),",
                ");",
                "",
                "print(response.body);",
              ].join("\n"),
              python: [
                "import os",
                "import requests",
                "",
                ...(functionApiKeyAuthEnabled ? [
                  "api_key = os.environ['COMPUTER_AGENTS_API_KEY']",
                  "",
                ] : []),
                "response = requests.post(",
                "    '" + functionInvokeUrl + "',",
                "    headers={",
                ...(functionApiKeyAuthEnabled ? ["        'Authorization': f'Bearer {api_key}',"] : []),
                "        'Content-Type': 'application/json',",
                "    },",
                "    json=" + functionInvokePayload.replace(/"/g, "'") + ",",
                ")",
                "",
                "print(response.json())",
              ].join("\n"),
            };
            const activeFunctionInvokeSnippet = functionInvokeSnippets[serverInvokeSnippetTab] || functionInvokeSnippets.curl;
            const functionInvokeSnippetLanguage = ({
              curl: "shell",
              javascript: "javascript",
              swift: "swift",
              flutter: "dart",
              python: "python",
            })[serverInvokeSnippetTab] || "shell";
            const functionInvokeSnippetExtension = ({
              curl: "sh",
              javascript: "js",
              swift: "swift",
              flutter: "dart",
              python: "py",
            })[serverInvokeSnippetTab] || "sh";
            const functionInvokeSnippetLineCount = String(activeFunctionInvokeSnippet || "").split(/\n/).length || 1;
            const functionInvokeCodeHeight = Math.max(72, functionInvokeSnippetLineCount * 20 + 24) + "px";
            const FunctionInvokeEditorComponent = serverPreviewEditorModule?.default || null;
            const functionInvokeCodePreview = FunctionInvokeEditorComponent
              ? React.createElement("div", {
                  className: "playground-server-invoke-code-editor playground-code-preview-editor-shell",
                  style: { "--playground-server-invoke-code-height": functionInvokeCodeHeight },
                },
                  React.createElement(FunctionInvokeEditorComponent, {
                    path: "function-invoke-" + functionInvokeSlug + "." + functionInvokeSnippetExtension,
                    height: functionInvokeCodeHeight,
                    language: functionInvokeSnippetLanguage,
                    theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                    value: activeFunctionInvokeSnippet,
                    beforeMount: ensurePlaygroundCodeEditorTheme,
                    options: {
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      readOnly: true,
                      fontSize: 12,
                      lineHeight: 20,
                      tabSize: 2,
                      insertSpaces: true,
                      renderLineHighlight: "none",
                      lineNumbersMinChars: 3,
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      wordWrap: "on",
                      padding: { top: 12, bottom: 12 },
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    },
                  })
                )
              : !serverPreviewEditorModuleError
                ? React.createElement("div", {
                    className: "playground-code-preview-state playground-server-invoke-code-editor",
                    style: { "--playground-server-invoke-code-height": functionInvokeCodeHeight },
                  },
                    React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                    React.createElement("span", null, "Loading editor...")
                  )
                : React.createElement("pre", {
                    className: "playground-server-invoke-code-fallback",
                    style: { minHeight: functionInvokeCodeHeight },
                  }, activeFunctionInvokeSnippet);
  	          const functionInvokeSection = isFunctionInvokeCapableServer
  	            ? React.createElement("section", {
  	                className: "playground-server-invoke-section playground-server-details-card"
  	                  + (isFunctionServer ? " playground-function-usage-invoke-section" : ""),
  	              },
  	                React.createElement("div", { className: "playground-server-invoke-title" }, "Invoke function"),
  	                React.createElement("div", { className: "playground-server-invoke-auth-note" },
  	                  React.createElement("div", { className: "playground-server-invoke-auth-copy" },
  	                    React.createElement("div", { className: "playground-server-invoke-auth-toggle-copy" },
  	                      React.createElement("span", { className: "playground-server-invoke-auth-label" }, isAgentRuntimeServer ? "Computer Agents API key required" : "Require Computer Agents API key"),
  	                      React.createElement("span", null,
  	                        isAgentRuntimeServer
  		                      ? React.createElement(React.Fragment, null,
  		                          "Agent runtimes always require a Computer Agents API key in the ",
  		                          React.createElement("code", null, "Authorization"),
  		                          " header."
  		                        )
  		                      : functionApiKeyAuthEnabled
  		                          ? React.createElement(React.Fragment, null,
  		                            "Calls must include a Computer Agents API key in the ",
  		                            React.createElement("code", null, "Authorization"),
  	                            " header. Recommended: keep this as the platform guard and implement user/session-specific authentication in your function code."
  	                          )
  	                          : "API key authentication is off. This function can receive unauthenticated requests. Turn this off only for public endpoints or when the function implements its own authentication."
  	                      )
  	                    )
  	                  ),
  	                  isAgentRuntimeServer
  	                    ? null
  	                    : React.createElement("button", {
  	                        type: "button",
  	                        role: "switch",
  	                        "aria-checked": functionApiKeyAuthEnabled ? "true" : "false",
  	                        className: "playground-environments-toggle" + (functionApiKeyAuthEnabled ? " is-active" : ""),
  	                        onClick: () => setFunctionApiKeyAuthEnabled(!functionApiKeyAuthEnabled),
  	                      }, React.createElement("span", { className: "playground-environments-toggle-thumb" }))
                  ),
                  React.createElement("div", { className: "playground-server-invoke-card" },
                    React.createElement("div", { className: "playground-server-invoke-header" },
                      React.createElement("div", { className: "playground-server-invoke-tabs", role: "tablist", "aria-label": "Function invoke examples" },
                        functionInvokeSnippetTabs.map((tab) =>
                          React.createElement("button", {
                            key: tab.id,
                            type: "button",
                            role: "tab",
                            className: "playground-server-invoke-tab" + (serverInvokeSnippetTab === tab.id ? " is-active" : ""),
                            "aria-selected": serverInvokeSnippetTab === tab.id ? "true" : "false",
                            onClick: () => setServerInvokeSnippetTab(tab.id),
                          }, tab.label)
                        )
                      )
                    ),
                    functionInvokeCodePreview
                  )
                )
              : null;
  
            const factsSection = React.createElement(React.Fragment, null,
              React.createElement("div", { className: "playground-environments-home-metrics playground-server-detail-metrics" },
                React.createElement("div", { className: "playground-tasks-detail-facts playground-environments-editor-facts playground-server-details-card" },
                  React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                    React.createElement("div", { className: "playground-database-overview" },
                      React.createElement("div", { className: "playground-database-overview-chart-block playground-server-detail-chart-block" },
                        renderServerDetailChartKpis(serverDetailKpis),
                        renderServerDetailRequestChart(),
                        React.createElement("div", { className: "playground-server-detail-fact-rows" },
                          renderServerFactRow("ID",
                            React.createElement("span", {
                              className: "playground-environments-editor-fact-value is-id",
                              title: draftServer.id || "Unsaved server",
                            }, draftServer.id || "Unsaved server")
                          ),
                          !isSourceDeployableServer ? renderServerFactRow("Service URL",
                            draftServer.serviceUrl
                              ? React.createElement("button", {
                                  type: "button",
                                  className: "playground-tasks-detail-fact-button",
                                  onClick: () => window.open(draftServer.serviceUrl, "_blank", "noopener,noreferrer"),
                                  title: draftServer.serviceUrl,
                                }, draftServer.serviceUrl)
                              : React.createElement("div", { className: "playground-tasks-detail-fact-button is-empty" }, "Not deployed")
                          ) : null,
                          !isSourceDeployableServer ? renderServerFactRow("Auth",
                            renderServerDetailSelectControl({
                              popoverId: "server-auth",
                              valueLabel: draftServer.authMode === "private" ? "Private" : "Public",
                              children: [
                                renderServerDetailSelectOptionRow({
                                  key: "public",
                                  label: "Public",
                                  selected: (draftServer.authMode || "public") !== "private",
                                  onClick: () => {
                                    updateServerField("authMode", "public");
                                    setServerDetailSelectPopover("");
                                  },
                                }),
                                renderServerDetailSelectOptionRow({
                                  key: "private",
                                  label: "Private",
                                  selected: draftServer.authMode === "private",
                                  onClick: () => {
                                    updateServerField("authMode", "private");
                                    setServerDetailSelectPopover("");
                                  },
                                }),
                              ],
                            })
                          ) : null,
                          renderServerFactRow("Runtime",
                            renderServerDetailSelectControl({
                              popoverId: "server-runtime",
                              valueLabel: draftServer.runtime || "nodejs22",
                              children: [
                                renderServerDetailSelectOptionRow({
                                  key: "nodejs22",
                                  label: "nodejs22",
                                  selected: (draftServer.runtime || "nodejs22") === "nodejs22",
                                  onClick: () => {
                                    updateServerField("runtime", "nodejs22");
                                    setServerDetailSelectPopover("");
                                  },
                                }),
                                renderServerDetailSelectOptionRow({
                                  key: "nodejs20",
                                  label: "nodejs20",
                                  selected: draftServer.runtime === "nodejs20",
                                  onClick: () => {
                                    updateServerField("runtime", "nodejs20");
                                    setServerDetailSelectPopover("");
                                  },
                                }),
                              ],
                            })
                          ),
                          renderServerFactRow("Updated",
                            React.createElement("span", { className: "playground-environments-editor-fact-value" }, formatPlaygroundFileDate(draftServer.updatedAt))
                          )
                        )
                      )
                    )
                  )
                )
              )
            );
            const serverUsageTabContent = isOperationalDetailServer
              ? isSourceDeployableServer || isAuthServer || isSecretsServer || isPaymentsServer || isAgentRuntimeServer
                ? React.createElement(PlatformAnalyticsSection, {
                    variant: "framed",
                    className: "playground-server-detail-analytics",
                    analytics: sourceServerDetailAnalyticsModel,
                    chartType: "line",
                    title: serverUsageMetricConfig.title,
                    timeframe: {
                      value: normalizedServerDetailChartTimescale,
                      options: serverDetailTimescaleOptions,
                      onValueChange: setServerDetailChartTimescale,
                      ariaLabel: formatPlaygroundServerKindLabel(draftServer.kind) + " analytics time frame",
                    },
                  })
                : React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-database-detail-usage-header-actions playground-server-detail-usage-header" },
                      React.createElement("h2", { className: "playground-server-detail-usage-title" },
                        serverUsageMetricConfig.title
                      ),
                      renderServerDetailTimescaleControl()
                    ),
                    React.createElement("div", {
                        className: "playground-environments-home-metrics playground-develop-server-metrics playground-develop-server-kind-metrics playground-resource-type-overview-metrics playground-database-detail-usage-metrics playground-server-detail-usage-metrics",
                      },
                      React.createElement("section", {
                          className: "playground-project-overview-progress-combo-card playground-agents-detail-progress-combo-card playground-evaluations-analytics-card playground-agents-overview-analytics-card playground-resource-type-overview-analytics-card playground-database-detail-usage-analytics-card playground-server-detail-usage-analytics-card",
                        },
                        renderServerDetailChartKpis(serverDetailKpis),
                        React.createElement("div", { className: "playground-project-overview-progress-combo-chart" },
                          React.createElement("div", { className: "playground-resource-type-overview-chart-card" },
                            renderServerDetailRequestChart()
                          )
                        )
                      )
                    ),
                    React.createElement("div", {
                        className: "playground-server-detail-fact-rows playground-database-detail-usage-fact-rows"
                          + (isWebAppServer ? " playground-web-app-usage-fact-rows" : ""),
                      },
                      renderServerFactRow("ID",
                        React.createElement("span", {
                          className: "playground-environments-editor-fact-value is-id",
                          title: draftServer.id || "Unsaved server",
                        }, draftServer.id || "Unsaved server")
                      ),
                      renderServerFactRow("Runtime",
                        React.createElement("span", { className: "playground-environments-editor-fact-value" }, draftServer.runtime || "nodejs22")
                      ),
                      renderServerFactRow("Region",
                        React.createElement("span", { className: "playground-environments-editor-fact-value" }, draftServer.region || "europe-west1")
                      ),
                      renderServerFactRow("Updated",
                        React.createElement("span", { className: "playground-environments-editor-fact-value" }, formatPlaygroundFileDate(draftServer.updatedAt))
                      )
                    )
                  )
              : factsSection;
  
            const activeCustomDomains = getPlaygroundServerCustomDomainStates(draftServer);
            const isCustomDomainCapableServer = isSourceDeployableServer;
            const customDomainColumns = [
              {
                id: "domain",
                header: "Domain",
                accessor: (customDomain) => String(customDomain?.domain || ""),
                sortable: true,
                width: "minmax(240px, 1.8fr)",
                cell: ({ row: customDomain }) => React.createElement("div", { className: "playground-server-custom-domain-main" },
                  React.createElement("div", { className: "playground-server-custom-domain-icon" },
                    React.createElement(Globe, { width: 16, height: 16, strokeWidth: 1.8 })
                  ),
                  React.createElement("div", { className: "playground-server-custom-domain-copy" },
                    React.createElement("div", { className: "playground-server-custom-domain-name" }, customDomain.domain)
                  )
                ),
              },
              {
                id: "status",
                header: "Status",
                accessor: (customDomain) => String(customDomain?.status || ""),
                sortable: true,
                width: "minmax(130px, 0.75fr)",
                cell: ({ row: customDomain }) => {
                  const customDomainStatus = String(customDomain?.status || "");
                  const isRemovingDomain = serverCustomDomainRemoveState.status === "removing"
                    && serverCustomDomainRemoveState.domain === customDomain.domain;
                  const statusVariant = customDomainStatus === "connected"
                    ? "green"
                    : customDomainStatus === "needs_setup"
                      ? "red"
                      : customDomainStatus === "verification_required" || customDomainStatus === "pending_dns"
                        ? "yellow"
                        : "gray";
                  return React.createElement(PlatformLabel, {
                    variant: isRemovingDomain ? "gray" : statusVariant,
                  }, isRemovingDomain ? "Removing..." : formatPlaygroundCustomDomainStatus(customDomainStatus));
                },
              },
              {
                id: "lastChecked",
                header: "Last checked",
                accessor: (customDomain) => Date.parse(String(customDomain?.lastCheckedAt || "")) || 0,
                sortable: true,
                sortDescFirst: true,
                width: "minmax(150px, 0.9fr)",
                cell: ({ row: customDomain }) => React.createElement("div", {
                  className: "playground-server-custom-domain-meta",
                },
                  customDomain.lastCheckedAt
                    ? formatPlaygroundFileDate(customDomain.lastCheckedAt)
                    : "Ready to verify"
                ),
              },
            ];
            const customDomainSection = isCustomDomainCapableServer
              ? React.createElement(PlatformDataTable, {
                  rows: activeCustomDomains,
                  columns: customDomainColumns,
                  getRowId: (customDomain) => String(customDomain?.domain || ""),
                  ariaLabel: "Custom domains",
                  className: "playground-server-custom-domains-platform-table",
                  surface: "plain",
                  variant: "minimalistic-ui",
                  sticky: false,
                  pagination: false,
                  sorting: {
                    defaultValue: { id: "lastChecked", direction: "desc" },
                  },
                  toolbar: {
                    title: "Custom Domains",
                    primaryAction: {
                      label: "Add Domain",
                      icon: Plus,
                      onClick: () => openServerCustomDomainModal(null),
                      disabled: isServerTemplatePreview || !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                    },
                  },
                  onRowActivate: (customDomain) => {
                    if (!isServerTemplatePreview) {
                      openServerCustomDomainModal(customDomain);
                    }
                  },
                  isRowDisabled: () => isServerTemplatePreview,
                  getRowAriaLabel: (customDomain) => "Edit custom domain " + String(customDomain?.domain || ""),
                  getRowActions: (customDomain) => {
                    const isRemovingDomain = serverCustomDomainRemoveState.status === "removing"
                      && serverCustomDomainRemoveState.domain === customDomain.domain;
                    return [
                      {
                        id: "open",
                        label: "Open domain",
                        icon: ExternalLink,
                        hidden: !customDomain.url,
                        onSelect: () => window.open(customDomain.url, "_blank", "noopener,noreferrer"),
                      },
                      {
                        id: "edit",
                        label: "Edit",
                        icon: SquarePen,
                        disabled: isServerTemplatePreview,
                        onSelect: () => openServerCustomDomainModal(customDomain),
                      },
                      {
                        id: "remove",
                        label: isRemovingDomain ? "Removing..." : "Remove",
                        icon: Trash2,
                        danger: true,
                        disabled: isServerTemplatePreview || isRemovingDomain,
                        onSelect: () => void handleRemoveServerCustomDomain(customDomain.domain),
                      },
                    ];
                  },
                  error: serverCustomDomainRemoveState.error || null,
                  emptyState: React.createElement(PlatformEmptyState, {
                    icon: Globe,
                    title: "No custom domains yet",
                    description: draftServer.status === "deployed"
                      ? "Add a domain to generate the DNS records your registrar needs."
                      : "Deploy this " + serverKindLabel.toLowerCase() + " before adding a custom domain.",
                  }),
                })
              : null;
  
            const isConnectableServer = normalizedServerKind === "function" || normalizedServerKind === "web_app";
            const activeDatabaseBinding = getCurrentServerBindingByType("database");
            const activeAuthBinding = getCurrentServerBindingByType("auth");
            const activeAgentRuntimeBinding = getCurrentServerBindingByType("agent_runtime");
            const activeSecretsBinding = getCurrentServerBindingByType("secrets");
            const activePaymentsBinding = getCurrentServerBindingByType("payments");
            const activeServerContext = draftServer.id ? (serverContextsById[draftServer.id] || currentServerContext || null) : null;
            const activeServerRuntimeDiagnostics = activeServerContext?.diagnostics || null;
            const activeServerRuntimeWarnings = Array.isArray(activeServerRuntimeDiagnostics?.warnings)
              ? activeServerRuntimeDiagnostics.warnings.filter((warning) => String(warning?.message || "").trim())
              : [];
            const activeServerRuntimeManifestUrl = typeof activeServerRuntimeDiagnostics?.runtime?.manifestUrl === "string"
              ? activeServerRuntimeDiagnostics.runtime.manifestUrl
              : "";
            const availableAuthModules = orderedServers.filter((server) =>
              canonicalizePlaygroundServerKind(server.kind) === "auth" && server.id !== draftServer.id
            );
            const availableAgentRuntimes = orderedServers.filter((server) =>
              canonicalizePlaygroundServerKind(server.kind) === "agent_runtime" && server.id !== draftServer.id
            );
            const availableSecretsVaults = orderedServers.filter((server) =>
              canonicalizePlaygroundServerKind(server.kind) === "secrets" && server.id !== draftServer.id
            );
            const availablePaymentsResources = orderedServers.filter((server) =>
              canonicalizePlaygroundServerKind(server.kind) === "payments" && server.id !== draftServer.id
            );
            const isSavingDatabaseConnection = serverBindingState.savingKey.startsWith("database");
            const isSavingAuthConnection = serverBindingState.savingKey.startsWith("auth");
            const isSavingAgentRuntimeConnection = serverBindingState.savingKey.startsWith("agent_runtime");
            const isSavingSecretsConnection = serverBindingState.savingKey.startsWith("secrets");
            const isSavingPaymentsConnection = serverBindingState.savingKey.startsWith("payments");
            const isLoadingServerRuntimeContext = loadingServerContextId === draftServer.id
              || (
                isConnectableServer
                && Boolean(draftServer.id)
                && draftServer.id !== PLAYGROUND_SERVER_DRAFT_ID
                && !activeServerContext
                && !serverRuntimeState.error
              );
            const renderRuntimePreviewButton = (label, target) => React.createElement("button", {
                type: "button",
                className: "playground-tasks-detail-fact-button",
                onClick: () => {
                  void openServerRuntimePreview(target);
                },
                disabled: !draftServer.id
                  || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
                  || (serverRuntimePreviewState.loading && serverRuntimePreviewState.target === target),
              },
              serverRuntimePreviewState.loading && serverRuntimePreviewState.target === target
                ? "Loading..."
                : label
            );
  
            const renderServerConnectionsSection = ({
              showTitle = true,
              className = "",
            } = {}) => isConnectableServer
              ? React.createElement("div", {
                  className: "playground-environments-connections-section" + (className ? " " + className : ""),
                },
                  showTitle
                    ? React.createElement("div", {
                        className: "playground-tasks-detail-section-title playground-environments-connections-title",
                      }, "Connections")
                    : null,
                  React.createElement("div", { className: "playground-tasks-detail-facts playground-environments-editor-facts" },
                    React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                      renderServerFactRow("Database",
                        renderServerDetailSelectControl({
                          popoverId: "server-connection-database",
                          valueLabel: isSavingDatabaseConnection
                            ? "Connecting..."
                            : isLoadingServerRuntimeContext
                              ? "Loading..."
                              : (activeDatabaseBinding?.resource?.name || activeDatabaseBinding?.targetId || "None"),
                          isEmpty: !activeDatabaseBinding && !isLoadingServerRuntimeContext,
                          disabled: !draftServer.id
                            || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
                            || isSavingDatabaseConnection
                            || isLoadingServerRuntimeContext,
                          children: [
                            renderServerDetailSelectOptionRow({
                              key: "database:none",
                              label: "None",
                              selected: !activeDatabaseBinding,
                              onClick: () => {
                                setServerDetailSelectPopover("");
                                void removeServerConnection("database");
                              },
                            }),
                            ...orderedDatabases.map((database) =>
                              renderServerDetailSelectOptionRow({
                                key: "database:" + database.id,
                                label: database.name || "Untitled Database",
                                description: database.location || "Firestore",
                                selected: activeDatabaseBinding?.targetId === database.id,
                                onClick: () => {
                                  setServerDetailSelectPopover("");
                                  void upsertServerConnection("database", database.id);
                                },
                              })
                            ),
                            renderServerDetailSelectOptionRow({
                              key: "database:create",
                              label: "Create And Connect New",
                              description: "Creates a new Firestore database for this app.",
                              selected: false,
                              onClick: () => {
                                setServerDetailSelectPopover("");
                                void createAndConnectDatabase();
                              },
                            }),
                          ],
                        })
                      ),
                      renderServerFactRow("Auth",
                        renderServerDetailSelectControl({
                          popoverId: "server-connection-auth",
                          valueLabel: isSavingAuthConnection
                            ? "Connecting..."
                            : isLoadingServerRuntimeContext
                              ? "Loading..."
                              : (activeAuthBinding?.resource?.name || activeAuthBinding?.targetId || "None"),
                          isEmpty: !activeAuthBinding && !isLoadingServerRuntimeContext,
                          disabled: !draftServer.id
                            || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
                            || isSavingAuthConnection
                            || isLoadingServerRuntimeContext,
                          children: [
                            renderServerDetailSelectOptionRow({
                              key: "auth:none",
                              label: "None",
                              selected: !activeAuthBinding,
                              onClick: () => {
                                setServerDetailSelectPopover("");
                                void removeServerConnection("auth");
                              },
                            }),
                            ...availableAuthModules.map((server) =>
                              renderServerDetailSelectOptionRow({
                                key: "auth:" + server.id,
                                label: server.name || "Untitled Auth",
                                description: "Auth module",
                                selected: activeAuthBinding?.targetId === server.id,
                                onClick: () => {
                                  setServerDetailSelectPopover("");
                                  void upsertServerConnection("auth", server.id);
                                },
                              })
                            ),
                            renderServerDetailSelectOptionRow({
                              key: "auth:create",
                              label: "Create And Connect New",
                              description: "Creates a dedicated auth module for this app.",
                              selected: false,
                              onClick: () => {
                                setServerDetailSelectPopover("");
                                void createAndConnectAuth();
                              },
                            }),
                          ],
                        })
                      ),
                      renderServerFactRow("Agent Runtime",
                        renderServerDetailSelectControl({
                          popoverId: "server-connection-agent-runtime",
                          valueLabel: isSavingAgentRuntimeConnection
                            ? "Connecting..."
                            : isLoadingServerRuntimeContext
                              ? "Loading..."
                              : (activeAgentRuntimeBinding?.resource?.name || activeAgentRuntimeBinding?.targetId || "None"),
                          isEmpty: !activeAgentRuntimeBinding && !isLoadingServerRuntimeContext,
                          disabled: !draftServer.id
                            || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
                            || isSavingAgentRuntimeConnection
                            || isLoadingServerRuntimeContext,
                          children: [
                            renderServerDetailSelectOptionRow({
                              key: "agent_runtime:none",
                              label: "None",
                              selected: !activeAgentRuntimeBinding,
                              onClick: () => {
                                setServerDetailSelectPopover("");
                                void removeServerConnection("agent_runtime");
                              },
                            }),
                            ...availableAgentRuntimes.map((server) =>
                              renderServerDetailSelectOptionRow({
                                key: "agent_runtime:" + server.id,
                                label: server.name || "Untitled Agent Runtime",
                                description: "Agent runtime",
                                selected: activeAgentRuntimeBinding?.targetId === server.id,
                                onClick: () => {
                                  setServerDetailSelectPopover("");
                                  void upsertServerConnection("agent_runtime", server.id);
                                },
                              })
                            ),
                            renderServerDetailSelectOptionRow({
                              key: "agent_runtime:create",
                              label: "Create And Connect New",
                              description: "Creates a dedicated agent runtime for this app.",
                              selected: false,
                              onClick: () => {
                                setServerDetailSelectPopover("");
                                void createAndConnectAgentRuntime();
                              },
                            }),
                          ],
                        })
                      ),
                      renderServerFactRow("Secrets",
                        renderServerDetailSelectControl({
                          popoverId: "server-connection-secrets",
                          valueLabel: isSavingSecretsConnection
                            ? "Connecting..."
                            : isLoadingServerRuntimeContext
                              ? "Loading..."
                              : (activeSecretsBinding?.resource?.name || activeSecretsBinding?.targetId || "None"),
                          isEmpty: !activeSecretsBinding && !isLoadingServerRuntimeContext,
                          disabled: !draftServer.id
                            || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
                            || isSavingSecretsConnection
                            || isLoadingServerRuntimeContext,
                          children: [
                            renderServerDetailSelectOptionRow({
                              key: "secrets:none",
                              label: "None",
                              selected: !activeSecretsBinding,
                              onClick: () => {
                                setServerDetailSelectPopover("");
                                void removeServerConnection("secrets");
                              },
                            }),
                            ...availableSecretsVaults.map((server) =>
                              renderServerDetailSelectOptionRow({
                                key: "secrets:" + server.id,
                                label: server.name || "Untitled Secrets",
                                description: "Secrets vault",
                                selected: activeSecretsBinding?.targetId === server.id,
                                onClick: () => {
                                  setServerDetailSelectPopover("");
                                  void upsertServerConnection("secrets", server.id);
                                },
                              })
                            ),
                            renderServerDetailSelectOptionRow({
                              key: "secrets:create",
                              label: "Create And Connect New",
                              description: "Creates an encrypted secrets vault for this app.",
                              selected: false,
                              onClick: () => {
                                setServerDetailSelectPopover("");
                                void createAndConnectSecrets();
                              },
                            }),
                          ],
                        })
                      ),
                      renderServerFactRow("Payments",
                        renderServerDetailSelectControl({
                          popoverId: "server-connection-payments",
                          valueLabel: isSavingPaymentsConnection
                            ? "Connecting..."
                            : isLoadingServerRuntimeContext
                              ? "Loading..."
                              : (activePaymentsBinding?.resource?.name || activePaymentsBinding?.targetId || "None"),
                          isEmpty: !activePaymentsBinding && !isLoadingServerRuntimeContext,
                          disabled: !draftServer.id
                            || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
                            || isSavingPaymentsConnection
                            || isLoadingServerRuntimeContext,
                          children: [
                            renderServerDetailSelectOptionRow({
                              key: "payments:none",
                              label: "None",
                              selected: !activePaymentsBinding,
                              onClick: () => {
                                setServerDetailSelectPopover("");
                                void removeServerConnection("payments");
                              },
                            }),
                            ...availablePaymentsResources.map((server) =>
                              renderServerDetailSelectOptionRow({
                                key: "payments:" + server.id,
                                label: server.name || "Untitled Payments",
                                description: "Stripe payments",
                                selected: activePaymentsBinding?.targetId === server.id,
                                onClick: () => {
                                  setServerDetailSelectPopover("");
                                  void upsertServerConnection("payments", server.id);
                                },
                              })
                            ),
                            renderServerDetailSelectOptionRow({
                              key: "payments:create",
                              label: "Create And Connect New",
                              description: "Creates a Stripe payments resource for this app.",
                              selected: false,
                              onClick: () => {
                                setServerDetailSelectPopover("");
                                void createAndConnectPayments();
                              },
                            }),
                          ],
                        })
                      ),
                      serverBindingState.error
                        ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, serverBindingState.error)
                        : null
                    )
                  )
                )
              : null;
            const connectionsSection = renderServerConnectionsSection();
  
            const isLoadingCurrentServerFiles = loadingServerFilesId === draftServer.id;
            const serverFileEditorIsDirty = serverFileEditorState.status === "ready" && serverFileEditorState.value !== serverFileEditorState.initialValue;
            const activeServerFileEditorHistoryKey = String(draftServer?.id || selectedServerId || "").trim()
              && normalizeHistoryPath(serverFileEditorState.path || "")
              ? String(draftServer?.id || selectedServerId || "").trim() + "|" + normalizeHistoryPath(serverFileEditorState.path || "")
              : "";
            const activeServerFileEditorHistory = activeServerFileEditorHistoryKey
              ? serverFileEditorHistoryByKey[activeServerFileEditorHistoryKey] || { past: [], future: [] }
              : { past: [], future: [] };
            const serverFileEditorStatusClassName = serverFileEditorState.saveError
              ? "playground-servers-source-preview-status is-error"
              : serverFileEditorState.isSaving
                ? "playground-servers-source-preview-status"
                : serverFileEditorIsDirty
                  ? "playground-servers-source-preview-status is-warning"
                  : serverFileEditorState.saveMessage
                    ? "playground-servers-source-preview-status is-success"
                    : "playground-servers-source-preview-status";
            const serverFileEditorStatusText = serverFileEditorState.saveError
              ? serverFileEditorState.saveError
              : serverFileEditorState.isSaving
                ? "Saving..."
                : serverFileEditorIsDirty
                  ? "Unsaved changes"
                  : serverFileEditorState.saveMessage
                    ? serverFileEditorState.saveMessage
                    : "No unsaved changes";
            const renderServerSourceFileRow = (row) => {
              const entry = row?.entry || {};
              const normalizedPath = String(entry?.path || entry?.name || "").trim();
              const isActiveSourceFile = serverFileEditorState.path === entry.path;
              const isExpandedSourceFolder = entry.isFolder && serverSourceExpandedFolders.has(entry.path);
              const canOpenSourceFile = !entry.isFolder && isPlaygroundTextPreviewable(entry);
              const canExpandSourceFolder = entry.isFolder && (
                entry.hasChildren
                || isExpandedSourceFolder
                || (Array.isArray(entry.children) && entry.children.length > 0)
              );
              return React.createElement("div", {
                  key: entry.id || entry.path,
                  className: "playground-files-entry-row" + (isActiveSourceFile ? " is-active" : ""),
                  style: { paddingLeft: 12 + Number(row?.level || 0) * 18 + "px" },
                  onClick: () => {
                    setServerSourceFileMenuPath("");
                    if (entry.isFolder) {
                      toggleServerSourceFolderExpansion(entry.path);
                      return;
                    }
                    if (canOpenSourceFile) {
                      void handleServerFileOpen(entry);
                    }
                  },
                },
                canExpandSourceFolder
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-files-entry-chevron-button",
                      onClick: (event) => {
                        event.stopPropagation();
                        setServerSourceFileMenuPath("");
                        toggleServerSourceFolderExpansion(entry.path);
                      },
                    }, isExpandedSourceFolder
                      ? React.createElement(ChevronDown, { className: "playground-files-entry-chevron", strokeWidth: 1.8 })
                      : React.createElement(ChevronRight, { className: "playground-files-entry-chevron", strokeWidth: 1.8 }))
                  : React.createElement("div", { className: "playground-files-entry-chevron is-placeholder" }),
                React.createElement("div", { className: "playground-files-entry-main" },
                  React.createElement(PlaygroundFileIcon, { entry }),
                  React.createElement("div", { className: "playground-files-entry-copy" },
                    React.createElement("div", { className: "playground-files-entry-name" }, entry.name || normalizedPath || "Untitled")
                  )
                ),
                React.createElement("div", { className: "playground-files-entry-meta" },
                  React.createElement("span", { className: "playground-files-entry-date" }, formatPlaygroundFileDate(entry.modifiedTime)),
                  React.createElement("span", { className: "playground-files-entry-size" }, entry.isFolder ? "-" : formatPlaygroundFileSize(entry.size))
                ),
                React.createElement("div", { className: "playground-servers-source-file-actions-menu-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-entry-options-button",
                    onClick: (event) => {
                      event.stopPropagation();
                      setServerSourceFileMenuPath((current) => current === entry.path ? "" : entry.path);
                    },
                    title: "Source file actions",
                    "aria-label": "Source file actions",
                    "aria-expanded": serverSourceFileMenuPath === entry.path ? "true" : "false",
                  }, React.createElement(Ellipsis, { className: "playground-files-entry-options-icon", strokeWidth: 1.8 })),
                  serverSourceFileMenuPath === entry.path
                    ? React.createElement(PlatformPopupSurface, {
                        className: "playground-server-custom-domain-menu playground-servers-source-file-menu",
                        onClick: (event) => event.stopPropagation(),
                      },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-server-custom-domain-menu-row",
                          onClick: () => {
                            setServerSourceFileMenuPath("");
                            if (entry.isFolder) {
                              toggleServerSourceFolderExpansion(entry.path);
                              return;
                            }
                            if (canOpenSourceFile) {
                              void handleServerFileOpen(entry);
                            }
                          },
                          disabled: !entry.isFolder && !canOpenSourceFile,
                        },
                          React.createElement(FolderOpen, { width: 13, height: 13, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Open in Files")
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-server-custom-domain-menu-row",
                          onClick: () => void handleServerFileRename(entry),
                          disabled: isServerTemplatePreview || entry.isFolder,
                        },
                          React.createElement(SquarePen, { width: 13, height: 13, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Rename")
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-server-custom-domain-menu-row is-danger",
                          onClick: () => void handleServerFileDelete(entry),
                          disabled: isServerTemplatePreview,
                        },
                          React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Delete")
                        )
                      )
                    : null
                  )
              );
            };
            const renderServerDeploymentCodePreview = ({ path, language, value, emptyText, height = "168px" }) => {
              if (!String(value || "").trim()) {
                return React.createElement("div", { className: "playground-files-state" }, emptyText);
              }
              if (ServerPreviewEditorComponent) {
                return React.createElement("div", { className: "playground-code-preview-editor-shell playground-database-browser-json-editor-shell playground-servers-function-editor-shell" },
                  React.createElement(ServerPreviewEditorComponent, {
                    path,
                    height,
                    language,
                    theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                    value,
                    beforeMount: ensurePlaygroundCodeEditorTheme,
                    options: {
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      readOnly: true,
                      fontSize: 12,
                      lineHeight: 20,
                      tabSize: 2,
                      insertSpaces: true,
                      renderLineHighlight: "none",
                      lineNumbersMinChars: 3,
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      wordWrap: "on",
                      padding: { top: 12, bottom: 12 },
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    },
                  })
                );
              }
              return React.createElement("div", { className: "playground-code-preview-editor-shell playground-database-browser-json-editor-shell playground-servers-function-editor-shell" },
                React.createElement("textarea", {
                  className: "playground-code-preview-textarea playground-servers-source-editor-textarea",
                  value,
                  readOnly: true,
                  spellCheck: false,
                  wrap: "off",
                  style: { minHeight: height, height },
                })
              );
            };
            const sourceFilesSidebarTopbar = serverFileEditorState.path
              ? React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-servers-editor-sidebar-topnav" },
                  React.createElement("div", { className: "playground-environments-editor-navbar-title" },
                    React.createElement("div", { className: "playground-environments-editor-navbar-copy playground-servers-source-preview-copy" },
                      React.createElement("div", { className: "playground-content-title playground-tasks-detail-navbar-title-input playground-environments-editor-title-input playground-servers-source-preview-title" }, currentServerEditorEntry?.name || serverFileEditorState.path || "Source file")
                    )
                  ),
                  React.createElement("div", { className: "playground-content-nav-center" }),
                  React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions playground-servers-source-preview-actions" },
                    React.createElement("div", {
                      className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell",
                      ref: serverFileActionsPopoverRef,
                    },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-content-menu-button",
                        "aria-label": "Source file actions",
                        "aria-expanded": serverFileActionsPopoverOpen ? "true" : "false",
                        onClick: () => setServerFileActionsPopoverOpen((current) => !current),
                        disabled: serverFileEditorState.status !== "ready",
                      }, React.createElement(Settings2, { className: "playground-content-menu-icon", strokeWidth: 1.75 })),
                      serverFileActionsPopoverOpen
                        ? React.createElement(PlatformPopupSurface, {
                            className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                            onClick: (event) => event.stopPropagation(),
                          },
                            React.createElement("button", {
                              type: "button",
                              className: "tb-popup-row",
                              onClick: () => {
                                setServerFileActionsPopoverOpen(false);
                                void handleServerFileSave();
                              },
                              disabled: isServerTemplatePreview || !serverFileEditorIsDirty || serverFileEditorState.isSaving || serverFileEditorState.status !== "ready",
                            },
                              React.createElement(HardDrive, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, serverFileEditorState.isSaving ? "Saving..." : "Save")
                              )
                            ),
                            React.createElement("button", {
                              type: "button",
                              className: "tb-popup-row",
                              onClick: () => {
                                setServerFileActionsPopoverOpen(false);
                                if (currentServerEditorEntry) {
                                  void handleServerFileDownload(currentServerEditorEntry);
                                }
                              },
                              disabled: isServerTemplatePreview || !currentServerEditorEntry,
                            },
                              React.createElement(Download, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, "Download")
                              )
                            ),
                            React.createElement("button", {
                              type: "button",
                              className: "tb-popup-row",
                              onClick: () => {
                                setServerFileActionsPopoverOpen(false);
                                if (currentServerEditorEntry) {
                                  void handleServerFileDelete(currentServerEditorEntry);
                                }
                              },
                              disabled: !currentServerEditorEntry,
                            },
                              React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, "Delete")
                              )
                            )
                          )
                        : null
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-servers-source-preview-close-button",
                      onClick: handleCloseServerFileEditor,
                      title: "Close",
                      "aria-label": "Close source file editor",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  )
                )
              : null;
            const sourceFilesSidebar = serverFileEditorState.path
              ? React.createElement("aside", { className: "playground-servers-source-preview-sidebar" },
                  React.createElement("div", { className: "playground-servers-source-preview-body" },
                    serverFileEditorState.status === "loading"
                      ? React.createElement("div", { className: "playground-code-preview-state" },
                          React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                          React.createElement("span", null, "Opening source file...")
                        )
                      : serverFileEditorState.status === "error"
                        ? React.createElement("div", { className: "playground-code-preview-state is-error" }, serverFileEditorState.error || "Failed to open source file.")
                        : ServerPreviewEditorComponent
                          ? React.createElement("div", { className: "playground-code-preview-editor-shell playground-database-browser-json-editor-shell playground-servers-source-preview-editor-shell" },
                              React.createElement(ServerPreviewEditorComponent, {
                                path: currentServerEditorEntry?.path || serverFileEditorState.path,
                                height: "100%",
                                language: getPlaygroundCodeEditorLanguage(currentServerEditorEntry || {
                                  path: serverFileEditorState.path,
                                  name: currentServerEditorEntry?.name || serverFileEditorState.path,
                                }),
                                theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                                value: serverFileEditorState.value,
                                onChange: isServerTemplatePreview ? undefined : handleServerFileEditorChange,
                                beforeMount: ensurePlaygroundCodeEditorTheme,
                                options: {
                                  automaticLayout: true,
                                  readOnly: isServerTemplatePreview,
                                  minimap: { enabled: false },
                                  scrollBeyondLastLine: false,
                                  smoothScrolling: true,
                                  fontSize: 12,
                                  lineHeight: 20,
                                  tabSize: 2,
                                  insertSpaces: true,
                                  renderLineHighlight: "gutter",
                                  lineNumbersMinChars: 3,
                                  overviewRulerBorder: false,
                                  hideCursorInOverviewRuler: true,
                                  wordWrap: serverFileEditorState.wordWrap ? "on" : "off",
                                  padding: { top: 12, bottom: 12 },
                                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                },
                              })
                            )
                          : React.createElement("div", { className: "playground-code-preview-editor-shell playground-database-browser-json-editor-shell playground-servers-source-preview-editor-shell" },
                              React.createElement("textarea", {
                                className: "playground-code-preview-textarea playground-servers-source-editor-textarea",
                                value: serverFileEditorState.value,
                                onChange: (event) => handleServerFileEditorChange(event.target.value),
                                readOnly: isServerTemplatePreview,
                                spellCheck: false,
                                wrap: serverFileEditorState.wordWrap ? "soft" : "off",
                            })
                          )
                  )
                  ,
                  React.createElement("div", { className: serverFileEditorStatusClassName }, serverFileEditorStatusText)
                )
              : null;
            const serverKindLabel = formatPlaygroundServerKindLabel(draftServer.kind);
            const sourceServerCodeWorkspaceRowById = new Map();
            const sourceServerCodeWorkspaceFiles = visibleServerSourceFileRows.map((row) => {
              const entry = row?.entry || {};
              const normalizedPath = String(entry?.path || entry?.name || "").trim();
              const isExpandedSourceFolder = entry.isFolder && serverSourceExpandedFolders.has(entry.path);
              const canOpenSourceFile = !entry.isFolder && isPlaygroundTextPreviewable(entry);
              const canExpandSourceFolder = entry.isFolder && (
                entry.hasChildren
                || isExpandedSourceFolder
                || (Array.isArray(entry.children) && entry.children.length > 0)
              );
              const id = String(normalizedPath || entry.id || "").trim();
              sourceServerCodeWorkspaceRowById.set(id, { entry, canOpenSourceFile });
              return {
                id,
                label: entry.name || normalizedPath || "Untitled",
                icon: React.createElement(PlaygroundFileIcon, { entry }),
                leading: canExpandSourceFolder
                  ? React.createElement(isExpandedSourceFolder ? ChevronDown : ChevronRight, {
                      width: 14,
                      height: 14,
                      strokeWidth: 1.8,
                    })
                  : null,
                depth: Number(row?.level || 0),
                disabled: !entry.isFolder && !canOpenSourceFile,
                openInTab: canOpenSourceFile,
                dirty: canOpenSourceFile
                  && serverSourceDraftContentsRef.current.has(
                    String(draftServer?.id || selectedServerId || "").trim()
                      + "|"
                      + normalizeHistoryPath(entry.path || "")
                  ),
                selectable: !isServerTemplatePreview,
                renameDisabled: isServerTemplatePreview || entry.isFolder,
                deleteDisabled: isServerTemplatePreview,
                ariaLabel: entry.name || normalizedPath || "Untitled",
              };
            });
            const handleSourceServerCodeWorkspaceFileSelect = (fileId) => {
              const row = sourceServerCodeWorkspaceRowById.get(fileId);
              if (!row) return;
              setServerSourceFileMenuPath("");
              if (row.entry.isFolder) {
                toggleServerSourceFolderExpansion(row.entry.path);
                return;
              }
              if (row.canOpenSourceFile) {
                void handleServerFileOpen(row.entry);
              }
            };
            const renderServerCodeEditorBody = () => {
              if (!draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
                return React.createElement("div", { className: "playground-servers-code-empty" }, "Create this " + serverKindLabel.toLowerCase() + " before editing code.");
              }
              if (serverFileEditorState.status === "loading") {
                return React.createElement("div", { className: "playground-code-preview-state" },
                  React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                  React.createElement("span", null, "Opening source file...")
                );
              }
              if (serverFileEditorState.status === "error") {
                return React.createElement("div", { className: "playground-code-preview-state is-error" }, serverFileEditorState.error || "Failed to open source file.");
              }
              if (serverFileEditorState.status !== "ready" || !serverFileEditorState.path) {
                return React.createElement("div", { className: "playground-servers-code-empty" },
                  isLoadingCurrentServerFiles || serverFileTransferState.isUploading
                    ? React.createElement(React.Fragment, null,
                        React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                        React.createElement("span", null, serverFileTransferState.isUploading ? "Uploading source files..." : "Loading source files...")
                      )
                    : "Select a file to start editing."
                );
              }
              if (ServerPreviewEditorComponent) {
                return React.createElement("div", { className: "playground-code-preview-editor-shell playground-servers-code-editor-shell" },
                  React.createElement(ServerPreviewEditorComponent, {
                    path: currentServerEditorEntry?.path || serverFileEditorState.path,
                    height: "100%",
                    language: getPlaygroundCodeEditorLanguage(currentServerEditorEntry || {
                      path: serverFileEditorState.path,
                      name: currentServerEditorEntry?.name || serverFileEditorState.path,
                    }),
                    theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                    value: serverFileEditorState.value,
                    onChange: isServerTemplatePreview ? undefined : handleServerFileEditorChange,
                    beforeMount: ensurePlaygroundCodeEditorTheme,
                    options: {
                      automaticLayout: true,
                      readOnly: isServerTemplatePreview,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      fontSize: 12,
                      lineHeight: 20,
                      tabSize: 2,
                      insertSpaces: true,
                      renderLineHighlight: "gutter",
                      lineNumbersMinChars: 3,
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      wordWrap: serverFileEditorState.wordWrap ? "on" : "off",
                      padding: { top: 12, bottom: 12 },
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    },
                  })
                );
              }
              return React.createElement("textarea", {
                className: "playground-code-preview-textarea playground-servers-source-editor-textarea playground-servers-code-editor-shell",
                value: serverFileEditorState.value,
                onChange: (event) => handleServerFileEditorChange(event.target.value),
                readOnly: isServerTemplatePreview,
                spellCheck: false,
                wrap: serverFileEditorState.wordWrap ? "soft" : "off",
              });
            };
            const sourceServerCodeTabBarActions = React.createElement(PlatformButtonSelector, {
                mode: "popup",
                label: "Add File",
                leading: React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.8 }),
                popupAriaLabel: "Add file options",
                buttonVariant: "primary",
                buttonSize: "compact",
                popupVariant: "minimal",
                popupAlignment: "right",
                open: serverCodeAddFileMenuOpen,
                onOpenChange: setServerCodeAddFileMenuOpen,
                closeOnSelect: true,
                disabled: !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
              },
              React.createElement("button", {
                type: "button",
                className: "tb-popup-row",
                onClick: () => {
                  setServerCodeAddFileMenuOpen(false);
                  void handleCreateServerFile();
                },
                disabled: isServerTemplatePreview,
              },
                React.createElement(FilePlus2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, "Create File")
                )
              ),
              React.createElement("button", {
                type: "button",
                className: "tb-popup-row",
                onClick: () => {
                  setServerCodeAddFileMenuOpen(false);
                  openServerFileUploadPicker();
                },
                disabled: isServerTemplatePreview,
              },
                React.createElement(ArrowUpFromLine, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, "Upload Files")
                )
              )
            );
            const sourceServerCodeStatus = serverFileTransferState.error
              || ((serverFileEditorState.status === "ready" && (
                serverFileEditorIsDirty
                || serverFileEditorState.isSaving
                || serverFileEditorState.saveError
                || serverFileEditorState.saveMessage
              ))
                ? serverFileEditorStatusText
                : (serverFileTransferState.message || serverFileEditorStatusText));
            const sourceServerCodeStatusTone = serverFileTransferState.error || serverFileEditorState.saveError
              ? "error"
              : serverFileEditorState.isSaving
                ? "loading"
                : serverFileEditorState.saveMessage
                  ? "success"
                  : "default";
            const sourceFilesSection = React.createElement(React.Fragment, null,
              React.createElement("input", {
                ref: serverFileUploadInputRef,
                type: "file",
                multiple: true,
                hidden: true,
                onChange: (event) => void handleServerFileUploadSelection(event),
              }),
              React.createElement(PlatformCodeEditorWorkspace, {
                className: "playground-server-source-code-workspace" + (isServerFileDragging ? " is-dragging" : ""),
                ariaLabel: serverKindLabel + " code editor",
                variant: "default",
                files: sourceServerCodeWorkspaceFiles,
                activeFileId: normalizeHistoryPath(serverFileEditorState.path || ""),
                onFileSelect: handleSourceServerCodeWorkspaceFileSelect,
                onFileRename: (file) => {
                  const row = sourceServerCodeWorkspaceRowById.get(file.id);
                  if (!row) return;
                  return handleServerFileRename(row.entry);
                },
                onFilesDelete: (files) => handleServerFilesDelete(
                  files
                    .map((file) => sourceServerCodeWorkspaceRowById.get(file.id)?.entry)
                    .filter(Boolean)
                ),
                tabBarActions: sourceServerCodeTabBarActions,
                isLoadingFiles: isLoadingCurrentServerFiles,
                loadingFilesMessage: "Loading files...",
                emptyFiles: draftServer.id && draftServer.id !== PLAYGROUND_SERVER_DRAFT_ID
                  ? "No source files yet."
                  : "Create this " + serverKindLabel.toLowerCase() + " first.",
                editor: renderServerCodeEditorBody(),
                status: sourceServerCodeStatus,
                statusTone: sourceServerCodeStatusTone,
                historyControls: {
                  onUndo: handleServerFileEditorUndo,
                  onRedo: handleServerFileEditorRedo,
                  undoDisabled: isServerTemplatePreview
                    || serverFileEditorState.isSaving
                    || serverFileEditorState.status !== "ready"
                    || activeServerFileEditorHistory.past.length === 0,
                  redoDisabled: isServerTemplatePreview
                    || serverFileEditorState.isSaving
                    || serverFileEditorState.status !== "ready"
                    || activeServerFileEditorHistory.future.length === 0,
                },
                onDragOver: (event) => {
                  event.preventDefault();
                  if (!draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || isServerTemplatePreview || serverFileTransferState.isUploading) {
                    return;
                  }
                  setIsServerFileDragging(true);
                },
                onDragLeave: (event) => {
                  if (event.currentTarget.contains(event.relatedTarget)) {
                    return;
                  }
                  setIsServerFileDragging(false);
                },
                onDrop: (event) => {
                  event.preventDefault();
                  setIsServerFileDragging(false);
                  const droppedFiles = Array.from(event.dataTransfer?.files || []);
                  if (!droppedFiles.length || isServerTemplatePreview) {
                    return;
                  }
                  setServerCodeAddFileMenuOpen(false);
                  void handleServerFileUploadFiles(droppedFiles);
                },
              })
            );
  
            const deployActionLabel = serverDeploymentState.isDeploying ? "Deploying..." : "Deploy " + serverKindLabel;
            const requestActionLabel = serverDeploymentState.isInvoking
              ? "Requesting..."
              : draftServer.kind === "function"
                ? "Test Invoke"
                : "Test Request";
            const deployProgressPercent = Math.max(8, Math.round(Number(serverDeploymentState.deployProgress || 0) * 100));
            const deploymentGuideCopy = draftServer.kind === "function"
              ? React.createElement("div", { className: "playground-servers-source-files-copy" },
                  "Upload ",
                  React.createElement("code", null, "index.js"),
                  " or ",
                  React.createElement("code", null, "index.mjs"),
                  " at the source root and export a default async handler that receives a web ",
                  React.createElement("code", null, "Request"),
                  ". Add npm dependencies in ",
                  React.createElement("code", null, "package.json"),
                  "; deploy installs production packages and publishes the function service."
                )
              : React.createElement("div", { className: "playground-servers-source-files-copy" },
                  "If the source root contains ",
                  React.createElement("code", null, "package.json"),
                  ", it is deployed directly as a Cloud Run app. Otherwise, if an ",
                  React.createElement("code", null, "index.html"),
                  " bundle exists at the source root, ",
                  React.createElement("code", null, "dist/"),
                  ", ",
                  React.createElement("code", null, "build/"),
                  ", or ",
                  React.createElement("code", null, "public/"),
                  ", it is deployed as a browser-routed static app."
                );
            const deploymentSnippet = draftServer.kind === "function"
              ? [
                  "export default async function handler(request) {",
                  "  return {",
                  '    status: 200,',
                  '    headers: { "content-type": "text/plain; charset=utf-8" },',
                  '    body: "hello world",',
                  "  };",
                  "}",
                ].join("\n")
              : [
                  "{",
                  '  "name": "my-app",',
                  '  "private": true,',
                  '  "scripts": { "start": "node server.js" }',
                  "}",
                ].join("\n");
            function openServerAnalyticsView() {
              if (isSourceDeployableServer) {
                handleCloseServerFileEditor();
                setServerDetailTab("logs");
              } else {
                setServerAnalyticsView("analytics");
              }
              if (draftServer.id) {
                void loadServerAnalytics(draftServer.id, { force: true });
                void loadServerLogs(draftServer.id, serverLogsState.kind);
              }
            }
            const customDomainModalResult = serverCustomDomainModalState.result || null;
            const customDomainModalBaseRecords = Array.isArray(customDomainModalResult?.records)
              ? customDomainModalResult.records.filter((record) => record && typeof record === "object")
              : [];
            const customDomainOwnershipSiteId = String(customDomainModalResult?.siteId || customDomainModalResult?.hosting?.siteId || "").trim();
            const customDomainModalNeedsOwnershipRecord = customDomainOwnershipSiteId
              && customDomainModalResult?.ownershipState !== "OWNERSHIP_ACTIVE"
              && customDomainModalResult?.ownershipState !== "OWNERSHIP_PENDING"
              && !customDomainModalBaseRecords.some((record) => String(record?.value || "").trim() === "hosting-site=" + customDomainOwnershipSiteId);
            const customDomainModalRecords = customDomainModalNeedsOwnershipRecord
              ? [
                  ...customDomainModalBaseRecords,
                  {
                    action: "add",
                    type: "TXT",
                    name: String(customDomainModalResult?.domain || serverCustomDomainModalState.domain || "").trim(),
                    value: "hosting-site=" + customDomainOwnershipSiteId,
                    source: "ownership",
                  },
                ]
              : customDomainModalBaseRecords;
            const customDomainModalAddRecords = customDomainModalRecords.filter((record) => String(record?.action || "add").toLowerCase() !== "remove");
            const customDomainModalRemoveRecords = customDomainModalRecords.filter((record) => String(record?.action || "").toLowerCase() === "remove");
            const customDomainModalStatus = String(serverCustomDomainModalState.status || "idle");
            const isCustomDomainSaving = customDomainModalStatus === "saving";
            const isCustomDomainChecking = customDomainModalStatus === "checking";
            const hasCustomDomainDnsView = Boolean(customDomainModalResult);
            const customDomainRequiresVerification = customDomainModalResult?.status === "verification_required";
            const customDomainVerificationMessage = String(customDomainModalResult?.verification?.message || "").includes("Cloud Run")
              ? "Add the ownership TXT record below, then check again after DNS propagation."
              : customDomainModalResult?.verification?.message;
            const customDomainModalMessage = customDomainModalStatus === "success"
              ? customDomainRequiresVerification
                ? (customDomainVerificationMessage || "Add the ownership TXT record below, then check again after DNS propagation.")
                : customDomainModalResult?.status === "connected"
                ? "Domain is connected."
                : "Apply the DNS changes below, then check again after propagation."
              : "";
            function renderCustomDomainDnsRecord(record, index, actionLabel) {
              const type = String(record?.type || "").trim() || "DNS";
              const name = String(record?.name || serverCustomDomainModalState.domain || "").trim();
              const value = String(record?.value || "").trim();
              const action = String(record?.action || actionLabel || "add").toLowerCase() === "remove" ? "remove" : "add";
              return React.createElement("div", { className: "playground-server-custom-domain-record", key: action + ":" + type + ":" + name + ":" + index },
                React.createElement("div", { className: "playground-server-custom-domain-record-action" + (action === "remove" ? " is-remove" : " is-add") }, action === "remove" ? "Remove" : "Add"),
                React.createElement("div", { className: "playground-server-custom-domain-record-type" }, type),
                React.createElement("div", { className: "playground-server-custom-domain-record-name", title: name }, name || "@"),
                React.createElement("div", { className: "playground-server-custom-domain-record-value", title: value },
                  React.createElement("span", null, value || "Pending"),
                  value
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-settings-icon-button playground-server-custom-domain-record-copy-button",
                        onClick: () => void copyTextToClipboard(value),
                        title: "Copy value",
                      }, React.createElement(Copy, { width: 13, height: 13, strokeWidth: 1.8 }))
                    : null
                )
              );
            }
            const serverCustomDomainModal = serverCustomDomainModalState.open
              ? React.createElement(PlatformModalBackdrop, {
                  className: "playground-tasks-project-modal-backdrop",
                  onClick: closeServerCustomDomainModal,
                },
                  React.createElement(PlatformModalSurface, {
                      className: "playground-tasks-project-modal playground-database-browser-modal playground-server-custom-domain-modal",
                      onClick: (event) => event.stopPropagation(),
                    },
                    React.createElement("div", { className: "playground-tasks-project-modal-top" },
                      React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                        React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                          React.createElement(Globe, { width: 18, height: 18, strokeWidth: 1.9 })
                        ),
                        React.createElement("div", { className: "playground-content-title playground-tasks-project-modal-name-input", style: { display: "flex", alignItems: "center" } }, "Custom Domain")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-settings-icon-button playground-tasks-project-modal-close",
                        onClick: closeServerCustomDomainModal,
                        title: "Close",
                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                    ),
                    React.createElement("div", { className: "playground-server-custom-domain-modal-body" },
                      React.createElement("label", { className: "playground-environments-field playground-server-custom-domain-field" },
                        React.createElement("span", { className: "playground-server-custom-domain-label-row" },
                          React.createElement("span", { className: "playground-environments-field-label" }, "Domain"),
                          customDomainModalResult
                            ? React.createElement("span", {
                                className: "playground-server-custom-domain-status"
                                  + (customDomainModalResult.status === "connected" ? " is-connected" : customDomainModalResult.status === "needs_setup" ? " is-error" : ""),
                              }, formatPlaygroundCustomDomainStatus(customDomainModalResult.status))
                            : null
                        ),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-environments-input",
                          value: serverCustomDomainModalState.domain,
                          placeholder: "app.example.com",
                          autoFocus: true,
                          onChange: (event) => setServerCustomDomainModalState((current) => ({
                            ...current,
                            domain: event.target.value,
                            error: "",
                          })),
                        })
                      ),
                      serverCustomDomainModalState.error
                        ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, serverCustomDomainModalState.error)
                        : null,
                      hasCustomDomainDnsView
                        ? React.createElement("div", { className: "playground-server-custom-domain-records" },
                            React.createElement("div", { className: "playground-server-custom-domain-records-title" }, "DNS Records"),
                            React.createElement("div", { className: "playground-server-custom-domain-records-copy" },
                              customDomainModalMessage || "No DNS records were returned yet. Check again in a moment."
                            ),
                            customDomainModalRecords.length > 0
                              ? [
                                  customDomainModalAddRecords.length > 0
                                    ? customDomainModalAddRecords.map((record, index) => renderCustomDomainDnsRecord(record, index, "add"))
                                    : null,
                                  customDomainModalRemoveRecords.length > 0
                                    ? customDomainModalRemoveRecords.map((record, index) => renderCustomDomainDnsRecord(record, index, "remove"))
                                    : null,
                                ]
                              : React.createElement("div", { className: "playground-server-custom-domain-records-empty" },
                                  customDomainRequiresVerification
                                    ? "Domain ownership verification is still required before DNS routing records can be generated."
                                    : "No DNS records were returned yet. Check again in a moment."
                                )
                          )
                        : null
                    ),
                    React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                      hasCustomDomainDnsView
                        ? React.createElement("button", {
                            type: "button",
                            className: "playground-environments-action-button",
                            onClick: () => void handleCheckServerCustomDomain(),
                            disabled: isCustomDomainSaving || isCustomDomainChecking || !String(serverCustomDomainModalState.domain || "").trim(),
                          },
                            isCustomDomainChecking
                              ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                              : React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("span", null, isCustomDomainChecking ? "Checking..." : "Check Status")
                          )
                        : null,
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                        type: "button",
                        className: "playground-environments-action-button is-primary",
                        onClick: () => void handleSaveServerCustomDomain(),
                        disabled: isCustomDomainSaving || isCustomDomainChecking || !String(serverCustomDomainModalState.domain || "").trim(),
                      },
                        isCustomDomainSaving
                          ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                          : React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, isCustomDomainSaving ? "Saving..." : hasCustomDomainDnsView ? "Save Domain" : "Next Step")
                      )
                    )
                  )
                )
              : null;
            const serverDeploymentHelpModal = serverDeploymentHelpOpen
              ? React.createElement(PlatformModalBackdrop, {
                  className: "playground-tasks-project-modal-backdrop",
                  onClick: () => setServerDeploymentHelpOpen(false),
                },
                  React.createElement(PlatformModalSurface, {
                      className: "playground-tasks-project-modal playground-database-browser-modal playground-servers-deploy-help-modal",
                      onClick: (event) => event.stopPropagation(),
                    },
                    React.createElement("div", { className: "playground-tasks-project-modal-top" },
                      React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                        React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                          React.createElement(CircleHelp, { width: 18, height: 18, strokeWidth: 1.9 })
                        ),
                        React.createElement("div", { className: "playground-content-title playground-tasks-project-modal-name-input", style: { display: "flex", alignItems: "center" } }, serverKindLabel + " Help")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-settings-icon-button playground-tasks-project-modal-close",
                        onClick: () => setServerDeploymentHelpOpen(false),
                        title: "Close",
                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                    ),
                    React.createElement("div", { className: "playground-servers-deploy-help-body" },
                      React.createElement("div", { className: "playground-servers-deploy-help-copy" }, deploymentGuideCopy),
                      React.createElement("div", { className: "playground-servers-function-preview-pane" },
                        renderServerDeploymentCodePreview({
                          path: draftServer.kind === "function" ? "index.js" : "package.json",
                          language: draftServer.kind === "function" ? "javascript" : "json",
                          value: deploymentSnippet,
                          emptyText: "No deployment snippet available.",
                        })
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: () => setServerDeploymentHelpOpen(false),
                      }, "Close")
                    )
                  )
                )
              : null;
            const serverRuntimePreviewModal = serverRuntimePreviewState.open
              ? React.createElement(PlatformModalBackdrop, {
                  className: "playground-tasks-project-modal-backdrop",
                  onClick: closeServerRuntimePreview,
                },
                  React.createElement(PlatformModalSurface, {
                      className: "playground-tasks-project-modal playground-database-browser-modal playground-servers-runtime-preview-modal",
                      onClick: (event) => event.stopPropagation(),
                    },
                    React.createElement("div", { className: "playground-tasks-project-modal-top" },
                      React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                        React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                          React.createElement(Code2, { width: 18, height: 18, strokeWidth: 1.9 })
                        ),
                        React.createElement("div", { className: "playground-content-title playground-tasks-project-modal-name-input", style: { display: "flex", alignItems: "center" } }, serverRuntimePreviewState.title || "Runtime Preview")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-settings-icon-button playground-tasks-project-modal-close",
                        onClick: closeServerRuntimePreview,
                        title: "Close",
                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                    ),
                    React.createElement("div", { className: "playground-servers-deploy-help-body" },
                      serverRuntimePreviewState.error
                        ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, serverRuntimePreviewState.error)
                        : serverRuntimePreviewState.loading
                          ? React.createElement("div", { className: "playground-files-state" },
                              React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                              React.createElement("span", null, "Loading runtime preview...")
                            )
                          : React.createElement("div", { className: "playground-servers-function-preview-pane" },
                              renderServerDeploymentCodePreview({
                                path: serverRuntimePreviewState.path,
                                language: serverRuntimePreviewState.language,
                                value: serverRuntimePreviewState.value,
                                emptyText: "Nothing to preview yet.",
                                height: "360px",
                              })
                            )
                    ),
                    React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: closeServerRuntimePreview,
                      }, "Close")
                    )
                  )
                )
              : null;
            const canShowServerVersionPublish = isSourceDeployableServer
              && !isServerTemplatePreview
              && Boolean(draftServer?.id)
              && draftServer.id !== PLAYGROUND_SERVER_DRAFT_ID;
            const serverVersionHasChanges = hasDraftServerVersionChanges();
            const isServerPublishControlDisabled = !canShowServerVersionPublish
              || serverSaveState.isSaving
              || serverVersionState.status === "loading"
              || !serverVersionHasChanges;
            const renderServerPublishSplitButton = () => canShowServerVersionPublish
              ? React.createElement(AgentPublishControl, {
                  open: serverPublishMenuOpen,
                  actions: [{
                    id: "revert",
                    label: "Revert changes",
                    icon: Undo2,
                    disabled: !serverVersionHasChanges,
                    onClick: handleRevertServerDraft,
                  }],
                  active: serverPublishMenuOpen,
                  disabled: isServerPublishControlDisabled,
                  menuDisabled: isServerPublishControlDisabled,
                  label: "Save Changes",
                  leading: React.createElement(Bookmark, { strokeWidth: 1.8 }),
                  onOpenChange: (nextOpen) => {
                    setServerVersionsHeaderMenuOpen(false);
                    setServerPublishMenuOpen(nextOpen);
                  },
                  onPublish: () => openAuthoritativeServerVersionSaveDialog(),
                  publishAriaLabel: "Save resource changes",
                  menuAriaLabel: "Resource version save options",
                  className: "playground-server-detail-publish-control",
                })
              : null;
            const serverBottomBar = React.createElement("div", { className: "playground-servers-editor-bottom-bar" },
              React.createElement("div", { className: "playground-servers-editor-bottom-bar-inner" },
                React.createElement("div", { className: "playground-servers-editor-bottom-bar-copy" },
                  serverDeploymentState.isDeploying
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-servers-editor-bottom-progress-header" },
                          React.createElement("div", { className: "playground-servers-editor-bottom-progress-label" }, "Deploy started"),
                          React.createElement("div", { className: "playground-servers-editor-bottom-progress-value" }, deployProgressPercent + "%")
                        ),
                        React.createElement("div", { className: "playground-servers-editor-bottom-progress-track" },
                          React.createElement("div", {
                            className: "playground-servers-editor-bottom-progress-fill",
                            style: { width: Math.max(0, Math.min(100, deployProgressPercent)) + "%" },
                          })
                        )
                      )
                    : React.createElement("div", {
                        className: "playground-servers-editor-bottom-message"
                          + (serverDeploymentState.error ? " is-error" : serverDeploymentState.message ? " is-success" : ""),
                      },
                        serverDeploymentState.error
                          ? serverDeploymentState.error
                          : serverDeploymentState.isInvoking
                            ? "Testing live invocation..."
                            : serverDeploymentState.message
                              ? serverDeploymentState.message
                              : (!draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID)
                                ? "Save this " + serverKindLabel.toLowerCase() + " to deploy it."
                                : "Deployment"
                      )
                ),
                React.createElement("div", { className: "playground-servers-editor-bottom-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-server-deploy-pill-button",
                    onClick: openServerAnalyticsView,
                    disabled: !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                  },
                    React.createElement(Telescope, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Logs")
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-server-deploy-pill-button",
                    onClick: () => void handleInvokeServer(),
                    disabled: isServerTemplatePreview || serverDeploymentState.isInvoking || !draftServer.serviceUrl,
                  },
                    serverDeploymentState.isInvoking
                      ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                      : React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, requestActionLabel)
                  ),
                  React.createElement(PlatformPrimaryButton, {
                    type: "button",
                    className: "playground-server-deploy-pill-button is-primary",
                    onClick: () => void handleDeployServer(),
                    disabled: serverDeploymentState.isDeploying || !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                  },
                    serverDeploymentState.isDeploying
                      ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                      : React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, deployActionLabel)
                  )
                )
              )
  	          );
  	          const serverLogsPageContent = renderServerLogsSurface();
            const serverResourceDetailBackButton = !isSourceDeployableServer
                && !isAuthServer
                && !isSecretsServer
                && !isPaymentsServer
                && !isAgentRuntimeServer
                && embeddedInResources
                && isServersMode
                && normalizedEmbeddedServerKind
  	            ? React.createElement("button", {
  	                type: "button",
  	                className: "playground-resource-detail-back-button playground-database-navbar-back-button",
  	                onClick: showEnvironmentsHome,
  	                title: "Back to " + formatPlaygroundServerKindPluralLabel(normalizedEmbeddedServerKind),
  	                "aria-label": "Back to " + formatPlaygroundServerKindPluralLabel(normalizedEmbeddedServerKind),
  	              }, "←")
  	            : null;
  	          const renderServerResourceDetailTitleRow = ({
  	            className = "",
  	            placeholder = "Server",
  	            ariaLabel = "Server name",
  	            readOnly = false,
  	          } = {}) => React.createElement("div", { className: "playground-server-detail-title-row" },
  	            serverResourceDetailBackButton,
  	            React.createElement("input", {
  	              type: "text",
  	              className: "playground-content-title playground-tasks-detail-navbar-title-input playground-environments-editor-title-input" + className,
  	              value: draftServer.name || "",
  	              placeholder,
  	              "aria-label": ariaLabel,
  	              title: draftServer.name || placeholder,
  	              readOnly,
  	              "aria-readonly": readOnly ? "true" : "false",
  	              onChange: (event) => updateServerField("name", event.target.value),
  	              onBlur: () => {
  	                if (!readOnly) {
  	                  void commitDraftServerIfDirty();
  	                }
  	              },
  	            })
  	          );
  
  	          if (!isSourceDeployableServer && !isAuthServer && !isAgentRuntimeServer && !isSecretsServer && serverAnalyticsView === "analytics") {
              return React.createElement("div", { className: "playground-environments-editor-main playground-tasks-detail-main", ref: serverDetailMainRef },
                React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-server-detail-navbar" },
                  React.createElement("div", { className: "playground-environments-editor-navbar-title" },
                    React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                      React.createElement("div", { className: "playground-content-title playground-tasks-detail-navbar-title-input playground-environments-editor-title-input" }, (draftServer.name || "Server") + " Analytics"),
                      React.createElement("div", { className: "playground-environments-editor-navbar-subtitle" }, "Traffic, latency, status mix, deploy output, and runtime logs")
                    )
                  ),
                  React.createElement("div", { className: "playground-content-nav-center" }),
                  React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions" },
                    draftServer.serviceUrl
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: () => window.open(draftServer.serviceUrl, "_blank", "noopener,noreferrer"),
                        },
                          React.createElement(ExternalLink, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Open URL")
                        )
                      : null,
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: () => {
                        if (!draftServer.id) {
                          return;
                        }
                        void loadServerAnalytics(draftServer.id, { force: true });
                        void loadServerLogs(draftServer.id, serverLogsState.kind, { force: true });
                      },
                    },
                      React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Refresh")
                    ),
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "button",
                      className: "playground-environments-action-button is-primary",
                      onClick: () => setServerAnalyticsView("editor"),
                    },
                      React.createElement(ArrowLeft, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Back")
                    )
                  )
                ),
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" },
                  React.createElement("div", { className: "playground-server-detail-content" },
                    React.createElement("div", { className: "playground-environments-editor-surface playground-servers-analytics-page" },
                      serverAnalyticsOverview
                    ),
                    renderServerLogsSurface()
                  )
                )
              );
            }
  
            const normalizedServerDetailTab = isSourceDeployableServer && ["usage", "code", "logs", "history", "settings"].includes(serverDetailTab)
              ? serverDetailTab
              : "usage";
            const handleSourceServerDetailTabChange = (tabId) => {
              if (tabId !== "code") {
                handleCloseServerFileEditor();
              }
              setServerDetailTab(tabId);
              if (tabId === "code" && draftServer.id) {
                void loadServerFiles(draftServer.id);
              }
              if (tabId === "logs" && draftServer.id) {
                void loadServerLogs(draftServer.id, serverLogsState.kind);
              }
              if (tabId === "usage" && draftServer.id) {
                void loadServerAnalytics(draftServer.id, { period: serverDetailChartTimescale });
              }
              if (tabId === "settings") {
                if (
                  draftServer.id
                  && !serverContextsById[draftServer.id]
                  && loadingServerContextId !== draftServer.id
                ) {
                  void loadServerContext(draftServer.id);
                }
                if (typeof onWorkspaceTeamsRequest === "function" && !workspaceTeamsLoading) {
                  onWorkspaceTeamsRequest({});
                }
              }
              if (tabId === "history" && draftServer.id) {
                void loadServerDeployments(draftServer.id);
              }
            };
            const serverDetailTabs = isSourceDeployableServer
              ? React.createElement("div", { className: "playground-agents-overview-tabs playground-agents-detail-tabs playground-server-detail-tabs" },
                  React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                    [
                      { id: "usage", label: "Usage", Icon: ChartColumnIncreasing },
                      { id: "code", label: "Code", Icon: Code2 },
                      { id: "logs", label: "Logs", Icon: Terminal },
                      { id: "history", label: "History", Icon: History },
                      { id: "settings", label: "Settings", Icon: Settings },
                    ].map((tab) => {
                      const TabIcon = tab.Icon;
                      return React.createElement("button", {
                          key: tab.id,
                          type: "button",
                          className: "playground-project-overview-chart-tab" + (normalizedServerDetailTab === tab.id ? " is-active" : ""),
                          onClick: () => handleSourceServerDetailTabChange(tab.id),
                          "aria-pressed": normalizedServerDetailTab === tab.id ? "true" : "false",
                          "aria-label": tab.label,
                        },
                        React.createElement(TabIcon, { className: "playground-agents-detail-tab-icon", strokeWidth: 1.7 }),
                        React.createElement("span", null, tab.label)
                      );
                    })
                  )
                )
              : null;
  
            const serverSharedTeamIds = getServerSharedTeamIds(draftServer);
            const serverSharedTeamIdSet = new Set(serverSharedTeamIds);
            const serverWorkspaceTeamById = new Map(normalizedEnvironmentWorkspaceTeams.map((team) => [String(team.id), team]));
            const serverSharedTeams = serverSharedTeamIds.map((teamId) => {
              const team = serverWorkspaceTeamById.get(String(teamId));
              return team || { id: teamId, name: "Team", roleId: "member", createdAt: "" };
            });
            const availableServerAccessTeams = availableEnvironmentShareTeams.filter((team) => !serverSharedTeamIdSet.has(String(team.id)));
            const normalizedServerAccessSearchQuery = String(serverAccessSearchQuery || "").trim().toLowerCase();
            const visibleServerSharedTeams = serverSharedTeams
              .filter((team) => {
                if (normalizedServerAccessSearchQuery && !String(team.name || "").toLowerCase().includes(normalizedServerAccessSearchQuery)) return false;
                if (serverAccessFilter === "managed") return ["owner", "admin"].includes(team.roleId);
                return true;
              })
              .sort((left, right) => {
                const direction = serverAccessSortDirection === "desc" ? -1 : 1;
                if (serverAccessSort === "created") {
                  return direction * (new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime());
                }
                if (serverAccessSort === "policy") {
                  return direction * String(left.roleId || "member").localeCompare(String(right.roleId || "member"));
                }
                return direction * String(left.name || "").localeCompare(String(right.name || ""));
              });
            const allAgentsServerAccessTeam = {
              id: "all-agents",
              name: "All Agents",
              roleId: "default",
              createdAt: "",
              locked: true,
            };
  
  
  
  
  
  
  
  
  
            const serverCreatorIdentity = getServerCreatorIdentity(draftServer);
            const serverCreatorValue = renderDevelopResourceIdentityValue(serverCreatorIdentity);
            const serverOwnerIdentity = getServerOwnerIdentity(draftServer);
            const serverOwnerIdentityKey = getDatabaseOwnerIdentityKey(serverOwnerIdentity);
            const serverOwnerCandidatesByKey = new Map();
            serverSharedTeamIds.forEach((teamId) => {
              const team = serverWorkspaceTeamById.get(String(teamId)) || { id: teamId, name: "Team" };
              const members = Array.isArray(databaseOwnerTeamMembersById[teamId]) ? databaseOwnerTeamMembersById[teamId] : [];
              members.filter(isHumanDatabaseOwnerCandidate).forEach((member) => {
                const identity = normalizeDatabaseOwnerIdentity(member);
                const key = getDatabaseOwnerIdentityKey(identity);
                if (!key) return;
                const existing = serverOwnerCandidatesByKey.get(key);
                serverOwnerCandidatesByKey.set(key, {
                  ...(existing || {}),
                  ...identity,
                  teamNames: Array.from(new Set([...(existing?.teamNames || []), team.name].filter(Boolean))),
                });
              });
            });
            const serverOwnerCandidates = Array.from(serverOwnerCandidatesByKey.values()).sort((left, right) =>
              String(left.name || left.email || "").localeCompare(String(right.name || right.email || ""), undefined, { sensitivity: "base" })
            );
            const serverOwnerMissingTeamIds = serverSharedTeamIds.filter((teamId) =>
              !Object.prototype.hasOwnProperty.call(databaseOwnerTeamMembersById, teamId)
            );
            const serverOwnerLabel = String(serverOwnerIdentity.name || serverOwnerIdentity.email || "Owner").trim();
            const serverOwnerOptions = serverOwnerCandidates.map((candidate) => {
              const key = getDatabaseOwnerIdentityKey(candidate);
              const label = String(candidate.name || candidate.email || "Team member").trim();
              const detail = candidate.email && label.toLowerCase() !== candidate.email.toLowerCase()
                ? candidate.email
                : (candidate.teamNames || []).join(", ");
              return {
                value: key,
                label,
                description: detail || undefined,
                ariaLabel: detail ? label + ", " + detail : label,
                leading: React.createElement(AccountAvatar, {
                  className: "playground-agents-detail-owner-option-avatar",
                  imageClassName: "playground-agents-detail-owner-option-avatar-image",
                  fallbackLabel: getAccountInitials(label),
                  photoUrl: candidate.avatarUrl || "",
                }),
                candidate,
              };
            });
            const serverOwnerSelectorControl = React.createElement(PlatformSelector, {
                value: serverOwnerIdentityKey,
                options: serverOwnerOptions,
                open: serverOwnerPopoverOpen,
                onOpenChange: setServerOwnerPopoverOpen,
                onValueChange: (nextValue) => {
                  const selectedOwner = serverOwnerOptions.find((option) => option.value === nextValue)?.candidate;
                  if (!selectedOwner || nextValue === serverOwnerIdentityKey) {
                    setServerOwnerPopoverOpen(false);
                    return;
                  }
                  openServerOwnerTransferModal(selectedOwner);
                },
                ariaLabel: "Choose " + serverKindLabel.toLowerCase() + " owner",
                label: React.createElement("span", { className: "playground-team-member-cell" },
                  React.createElement(AccountAvatar, {
                    className: "playground-team-member-avatar",
                    imageClassName: "playground-team-member-avatar-image",
                    fallbackLabel: getAccountInitials(serverOwnerLabel),
                    photoUrl: serverOwnerIdentity.avatarUrl || "",
                  }),
                  React.createElement("span", { className: "playground-team-member-copy" },
                    React.createElement("span", { className: "playground-team-table-title" }, serverOwnerLabel)
                  )
                ),
                alignment: isOperationalDetailServer ? "end" : "start",
                popupAlignment: "right",
                fullWidth: true,
                disabled: !isCurrentUserServerOwner(draftServer) || serverSaveState.isSaving,
                loading: serverSharedTeamIds.length > 0 && serverOwnerMissingTeamIds.length > 0,
                loadingContent: "Loading team members...",
                emptyContent: serverSharedTeamIds.length === 0
                  ? "Grant a team access before choosing an owner."
                  : "No human team members are available.",
                popupWidth: 260,
                popupMaxHeight: "min(320px, calc(100vh - 180px))",
                className: "playground-server-owner-selector",
                triggerClassName: "playground-database-owner-trigger playground-server-owner-selector-trigger",
                popupClassName: "playground-agents-detail-owner-menu playground-server-owner-selector-popup",
                optionClassName: "playground-agents-detail-owner-option",
              });
            const serverOwnerSelectorRow = React.createElement("div", { className: "playground-database-access-owner-row" },
              React.createElement("span", { className: "playground-database-access-owner-label" }, "Owner"),
              serverOwnerSelectorControl
            );
            const serverOwnerTransferTargetLabel = String(serverOwnerTransferTarget?.name || serverOwnerTransferTarget?.email || "New owner").trim();
            const serverOwnerTransferModalContent = serverOwnerTransferTarget
              ? renderPlaygroundPlatformModal({
                  open: true,
                  visible: !serverOwnerTransferModalClosing,
                  closing: serverOwnerTransferModalClosing,
                  onClose: () => closeServerOwnerTransferModal(),
                  as: "form",
                  backdropClassName: "playground-tasks-project-issue-backdrop playground-database-owner-transfer-backdrop",
                  className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-database-owner-transfer-modal",
                  ariaLabel: "Transfer " + serverKindLabel.toLowerCase() + " ownership",
                  surfaceProps: { onSubmit: (event) => { event.preventDefault(); void handleServerOwnerTransferConfirm(); } },
                  children: React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-tasks-project-modal-top" },
                      React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                        React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" }, React.createElement(Shield, { width: 17, height: 17 })),
                        React.createElement("div", { className: "playground-content-title playground-tasks-project-modal-name-input" }, "Transfer " + serverKindLabel + " Ownership")
                      ),
                      React.createElement("button", { type: "button", className: "playground-settings-icon-button playground-tasks-project-modal-close", onClick: () => closeServerOwnerTransferModal() }, React.createElement(X, { width: 16, height: 16 }))
                    ),
                    React.createElement("div", { className: "playground-database-owner-transfer-copy" },
                      React.createElement("div", { className: "playground-database-owner-transfer-person" },
                        React.createElement(AccountAvatar, {
                          className: "playground-team-member-avatar",
                          imageClassName: "playground-team-member-avatar-image",
                          fallbackLabel: getAccountInitials(serverOwnerTransferTargetLabel),
                          photoUrl: serverOwnerTransferTarget.avatarUrl || "",
                        }),
                        React.createElement("div", { className: "playground-database-owner-transfer-person-copy" },
                          React.createElement("span", { className: "playground-database-owner-transfer-person-name" }, serverOwnerTransferTargetLabel),
                          serverOwnerTransferTarget.email ? React.createElement("span", { className: "playground-database-owner-transfer-person-email" }, serverOwnerTransferTarget.email) : null
                        )
                      ),
                      React.createElement("p", { className: "playground-database-owner-transfer-warning" },
                        "This transfers ownership immediately. You will keep only the privileges granted through your team access and will no longer be able to change the owner."
                      )
                    ),
                    serverSaveState.error ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, serverSaveState.error) : null,
                    React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                      React.createElement("button", { type: "button", className: "playground-environments-action-button", onClick: () => closeServerOwnerTransferModal(), disabled: serverSaveState.isSaving }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium", type: "submit", className: "playground-environments-action-button is-primary", disabled: serverSaveState.isSaving }, serverSaveState.isSaving ? "Transferring..." : "Transfer Owner")
                    )
                  ),
                })
              : null;
            const serverOwnerTransferModal = serverOwnerTransferModalContent && typeof document !== "undefined" && document.body
              ? createPortal(serverOwnerTransferModalContent, document.body)
              : serverOwnerTransferModalContent;
  
            const serverPermissionTeam = serverPermissionTeamId && serverPermissionTeamId !== "all-agents"
              ? serverWorkspaceTeamById.get(String(serverPermissionTeamId)) || serverSharedTeams.find((team) => String(team.id) === String(serverPermissionTeamId))
              : null;
            const selectedServerRoleDefinition = getPlaygroundTeamRoleDefinition(serverPermissionRoleId);
            const selectedServerRolePermissionSet = serverPermissionTeam
              ? getServerTeamRolePermissionSet(draftServer, serverPermissionTeam.id, selectedServerRoleDefinition.id)
              : null;
            const serverTeamRolePages = serverPermissionTeam
              ? React.createElement(PlatformRolePermissionsPage, {
                  roles: PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => ({
                    id: role.id,
                    label: role.label,
                    description: role.description,
                    meta: serverKindLabel + " access",
                  })),
                  value: selectedServerRoleDefinition.id,
                  onValueChange: setServerPermissionRoleId,
                  roleAriaLabel: serverKindLabel + " team roles",
                  roleKicker: serverKindLabel + " role",
                  roleDescription: serverKindLabel + "-scoped permissions for "
                    + selectedServerRoleDefinition.label.toLowerCase() + "s in "
                    + (serverPermissionTeam.name || "this team") + ".",
                  readOnly: selectedServerRoleDefinition.id === "owner",
                  className: "playground-project-team-role-pages playground-database-team-role-pages",
                  roleListClassName: "playground-project-team-role-list",
                  permissionPageClassName: "playground-project-team-role-permission-page",
                  permissionHeaderClassName: "playground-project-team-role-permission-header",
                  permissionSet: selectedServerRolePermissionSet,
                  accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
                  ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
                  actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
                  subjectType: serverPermissionSubjectType,
                  actionPresentation: serverPermissionActionPresentation,
                  animationKey: serverPermissionChartAnimationKey,
                  disabled: isSelectedServerTemplatePreview,
                  onRingAccessChange: (ringId, access) => updateServerTeamRolePermissionRingAccess(
                    serverPermissionTeam.id,
                    selectedServerRoleDefinition.id,
                    ringId,
                    access
                  ),
                  onActionRingChange: (actionId, ringId) => updateServerTeamRolePermissionActionRing(
                    serverPermissionTeam.id,
                    selectedServerRoleDefinition.id,
                    actionId,
                    ringId
                  ),
                  onActionAccessChange: (actionId, access) => updateServerTeamRolePermissionActionAccess(
                    serverPermissionTeam.id,
                    selectedServerRoleDefinition.id,
                    actionId,
                    access
                  ),
                })
              : null;
            const serverSettingsPermissionContent = serverPermissionTeamId
              ? React.createElement("section", {
                  className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-permissions-section playground-project-teams-section playground-database-permissions-section playground-server-permissions-section",
                },
                React.createElement("div", { className: "playground-project-team-permissions-header" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-project-team-permissions-back",
                    onClick: () => setServerPermissionTeamId(""),
                  },
                    React.createElement(ArrowLeft, { width: 13, height: 13, strokeWidth: 1.9 }),
                    React.createElement("span", null, "Settings")
                  ),
                  React.createElement("div", { className: "playground-project-team-permissions-title" },
                    serverPermissionTeamId === "all-agents"
                      ? "All Agents Permissions"
                      : (serverPermissionTeam?.name || "Team") + " " + serverKindLabel + " Access"
                  )
                ),
                serverPermissionTeamId === "all-agents"
                  ? React.createElement(PlatformPermissionsPage, {
                      permissionSet: getServerPermissionSet(draftServer),
                      subjectType: serverPermissionSubjectType,
                      actionPresentation: serverPermissionActionPresentation,
                      animationKey: serverPermissionChartAnimationKey,
                      disabled: isSelectedServerTemplatePreview,
                      onRingAccessChange: updateServerPermissionRingAccess,
                      onActionRingChange: updateServerPermissionActionRing,
                      onActionAccessChange: updateServerPermissionActionAccess,
                    })
                  : serverTeamRolePages
              )
              : null;
  
            const serverAddTeamsControl = React.createElement(PlatformButtonSelector, {
                mode: "popup",
                buttonVariant: "secondary",
                buttonSize: "small",
                label: "Add Teams",
                leading: React.createElement(Plus, {
                  width: 14,
                  height: 14,
                  strokeWidth: 1.8,
                  "aria-hidden": "true",
                }),
                open: serverTeamMenuId === "add-teams",
                onOpenChange: (nextOpen) => {
                  if (nextOpen && typeof onWorkspaceTeamsRequest === "function" && !workspaceTeamsLoading) {
                    onWorkspaceTeamsRequest({});
                  }
                  setServerTeamMenuId(nextOpen ? "add-teams" : "");
                },
                closeOnSelect: true,
                popupAriaLabel: "Add teams with " + serverKindLabel.toLowerCase() + " access",
                popupAlignment: "right",
                popupRole: "menu",
                popupVariant: "minimal",
                popupWidth: 240,
                disabled: Boolean(serverTeamAccessState.action),
                className: "playground-project-teams-add-shell playground-database-team-menu-scope",
                popupClassName: "playground-project-teams-menu",
              },
              availableServerAccessTeams.length
                ? availableServerAccessTeams.map((team) => React.createElement("button", {
                    key: team.id,
                    type: "button",
                    role: "menuitem",
                    className: "platform-data-table__menu-item playground-project-teams-menu-row",
                    onClick: () => void handleAddServerTeamAccess(team),
                  },
                    React.createElement("span", { className: "platform-data-table__menu-icon" },
                      React.createElement(Users, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("span", { className: "platform-data-table__menu-copy" }, team.name)
                  ))
                : React.createElement("div", {
                    className: "playground-project-teams-menu-empty",
                  }, workspaceTeamsLoading ? "Loading teams..." : "All available teams have access.")
            );
            const usesCentralServerAccessTable = isOperationalDetailServer;
            const serverAccessTableRows = isAuthServer
              ? [allAgentsServerAccessTeam, ...serverSharedTeams]
              : [allAgentsServerAccessTeam, ...visibleServerSharedTeams];
            const serverAccessColumns = [
              {
                id: "name",
                header: "Team",
                accessor: (team) => team.name || "Untitled team",
                sortable: true,
                width: "minmax(220px, 1.45fr)",
                cell: ({ row: team }) => isAuthServer
                  ? React.createElement("div", null,
                      React.createElement("div", { className: "playground-team-table-title" }, team.name),
                      React.createElement("div", { className: "playground-team-table-meta" },
                        team.locked
                          ? "Always included"
                          : Number(team.memberCount || 0) > 0
                            ? String(team.memberCount) + " member" + (Number(team.memberCount) === 1 ? "" : "s")
                            : "Team workspace"
                      )
                    )
                  : React.createElement("div", { className: "playground-agents-overview-name-title" }, team.name),
              },
              {
                id: "policy",
                header: "Policy",
                accessor: (team) => team.locked ? "Default policy" : "Role policy",
                sortable: true,
                width: "minmax(150px, 0.9fr)",
                cell: ({ row: team }) => team.locked ? "Default policy" : "Role policy",
              },
              {
                id: "created",
                header: "Created",
                accessor: (team) => Date.parse(String(team.createdAt || "")) || 0,
                sortable: true,
                sortDescFirst: true,
                width: "minmax(120px, 0.7fr)",
                align: "end",
                cell: ({ row: team }) => team.locked ? "Default" : (team.createdAt ? formatPlaygroundFileDate(team.createdAt) : "—"),
              },
            ];
            const serverTeamAccessTable = React.createElement(PlatformDataTable, {
              rows: serverAccessTableRows,
              columns: serverAccessColumns,
              getRowId: (team) => String(team.id || ""),
              ariaLabel: serverKindLabel + " team access",
              className: "playground-server-access-platform-data-table"
                + (isSourceDeployableServer ? " is-source-server-access-table" : "")
                + (isAuthServer ? " is-auth-server-access-table" : "")
                + (isSecretsServer ? " is-secrets-server-access-table" : "")
                + (isPaymentsServer ? " is-payments-server-access-table" : "")
                + (isAgentRuntimeServer ? " is-agent-runtime-server-access-table" : ""),
              surface: "plain",
              variant: "minimalistic-ui",
              sticky: false,
              pagination: false,
              sorting: isAuthServer
                ? { defaultValue: { id: "name", direction: "asc" } }
                : {
                    value: { id: serverAccessSort, direction: serverAccessSortDirection === "desc" ? "desc" : "asc" },
                    manual: true,
                    onChange: (next) => {
                      if (!next) return;
                      setServerAccessSort(next.id);
                      setServerAccessSortDirection(next.direction);
                    },
                  },
              selection: {
                enabled: true,
                value: selectedServerAccessTeamIds,
                isRowSelectable: (team) => !team.locked,
                ariaLabel: (team) => team.locked ? "All Agents is always included" : "Select " + team.name,
                onChange: ({ selectedIds }) => setSelectedServerAccessTeamIds(new Set(selectedIds)),
              },
              toolbar: isAuthServer
                ? {
                    title: "Manage " + serverKindLabel + " Access",
                    trailing: serverAddTeamsControl,
                  }
                : {
                    title: usesCentralServerAccessTable ? "Manage " + serverKindLabel + " Access" : null,
                    search: {
                      value: serverAccessSearchQuery,
                      onChange: setServerAccessSearchQuery,
                      placeholder: "Search teams",
                      manual: true,
                    },
                    filters: [{
                      id: "server-access-kind",
                      label: "Filter",
                      value: serverAccessFilter,
                      onChange: setServerAccessFilter,
                      options: [
                        { id: "all", label: "All access", description: "Show every team access grant" },
                        { id: "managed", label: "Managed teams", description: "Only teams you can manage" },
                      ],
                    }],
                    showSort: true,
                    trailing: serverAddTeamsControl,
                  },
              onRowActivate: (team) => {
                setServerPermissionRoleId("member");
                setServerPermissionTeamId(String(team.id));
              },
              getRowActions: (team) => [
                {
                  id: "edit-permissions",
                  label: "Edit permissions",
                  icon: Settings,
                  onSelect: () => {
                    setServerPermissionRoleId("member");
                    setServerPermissionTeamId(String(team.id));
                  },
                },
                ...(!team.locked ? [{
                  id: "remove",
                  label: "Remove team access",
                  icon: Trash2,
                  danger: true,
                  disabled: Boolean(serverTeamAccessState.action),
                  onSelect: ({ rows }) => void handleRemoveServerTeamsAccess(rows.filter((row) => !row.locked)),
                }] : []),
              ],
              error: serverTeamAccessState.error || null,
              emptyState: "No team access configured.",
              noResultsState: "No matching team access found.",
            });
            const serverTeamAccessPlatformSection = usesCentralServerAccessTable
              ? serverTeamAccessTable
              : React.createElement("section", {
                  className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-teams-section playground-project-settings-root playground-database-settings-root",
                },
                React.createElement("div", { className: "playground-database-access-section-group" },
                  React.createElement("div", { className: "playground-database-access-section-header" },
                    React.createElement("h2", { className: "playground-project-teams-table-title playground-database-access-section-title" }, "Manage " + serverKindLabel + " Access"),
                    serverOwnerSelectorRow
                  ),
                  React.createElement("section", {
                      className: "playground-project-settings-access-section playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-database-access-table-section",
                    },
                    serverTeamAccessTable
                  )
                )
              );
  
  	          const serverDangerSection = !isServerTemplatePreview && isOperationalDetailServer
  	            ? React.createElement("section", { className: "playground-server-danger-section playground-server-details-card" },
                  React.createElement("div", { className: "playground-server-danger-copy-row" },
                    React.createElement("span", { className: "playground-server-danger-icon", "aria-hidden": "true" },
                      React.createElement(AlertCircle, { width: 15, height: 15, strokeWidth: 2 })
                    ),
                    React.createElement("div", { className: "playground-server-danger-copy" },
                      React.createElement("div", { className: "playground-server-danger-title" },
                        "Delete this " + serverKindLabel.toLowerCase()
                      ),
                      React.createElement("div", { className: "playground-server-danger-text" },
                        "Make sure you have copied anything you need before deleting this " + serverKindLabel.toLowerCase() + "."
                      )
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-server-danger-delete-button",
                    onClick: () => void handleDeleteServer(draftServer.id),
                    disabled: serverSaveState.isSaving
                      || serverDeploymentState.isDeploying
                      || !draftServer.id
                      || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                  }, "Delete " + serverKindLabel.toLowerCase())
                )
              : null;
            const serverSettingsOverviewContent = React.createElement("div", {
                className: "playground-server-settings-tab"
                  + (isFunctionServer ? " is-function-settings-tab" : "")
                  + (isWebAppServer ? " is-web-app-settings-tab" : "")
                  + (isAuthServer ? " is-auth-settings-tab" : "")
                  + (isSecretsServer ? " is-secrets-settings-tab" : "")
                  + (isPaymentsServer ? " is-payments-settings-tab" : "")
                  + (isAgentRuntimeServer ? " is-agent-runtime-settings-tab" : ""),
              },
              descriptionSection,
              customDomainSection,
              isFunctionServer ? null : connectionsSection,
              serverTeamAccessPlatformSection,
              serverDangerSection
            );
            const serverSettingsTabContent = serverSettingsPermissionContent || serverSettingsOverviewContent;
            const serverEditorTabContent = isSourceDeployableServer
              ? normalizedServerDetailTab === "logs"
                ? serverLogsPageContent
                : normalizedServerDetailTab === "history"
                  ? renderServerDeploymentsSurface()
                  : normalizedServerDetailTab === "code"
                    ? sourceFilesSection
                    : normalizedServerDetailTab === "usage"
                      ? React.createElement(React.Fragment, null, serverUsageTabContent, functionInvokeSection)
                      : normalizedServerDetailTab === "settings"
                        ? serverSettingsTabContent
                        : serverUsageTabContent
              : React.createElement(React.Fragment, null,
                  factsSection,
                  functionInvokeSection,
                  customDomainSection,
                  connectionsSection,
                  sourceFilesSection
                );
            const sourceServerDeploymentStatusText = isSourceDeployableServer
              ? serverDeploymentState.error
                ? serverDeploymentState.error
                : serverDeploymentState.isDeploying
                  ? "Deploying " + serverKindLabel.toLowerCase() + "..."
                  : serverDeploymentState.isInvoking
                    ? "Testing live invocation..."
                    : serverDeploymentState.message || ""
              : "";
            const sourceServerDeploymentStatusVariant = serverDeploymentState.error
              ? " is-error"
              : serverDeploymentState.message && !serverDeploymentState.isDeploying && !serverDeploymentState.isInvoking
                ? " is-success"
                : "";
            const sourceServerDeploymentStatusBar = sourceServerDeploymentStatusText && !serverDeploymentStatusDismissed
              ? React.createElement("div", {
                  className: "playground-server-deployment-status-bar" + sourceServerDeploymentStatusVariant,
                  role: "status",
                },
                  React.createElement("span", {
                    className: "playground-server-deployment-status-text",
                    title: sourceServerDeploymentStatusText,
                  }, sourceServerDeploymentStatusText),
                  serverDeploymentState.isDeploying
                    ? React.createElement("span", { className: "playground-server-deployment-status-progress" }, deployProgressPercent + "%")
                    : null,
                  React.createElement("button", {
                    type: "button",
                    className: "playground-server-deployment-status-close",
                    onClick: () => setServerDeploymentStatusDismissed(true),
                    title: "Close",
                    "aria-label": "Close deployment status",
                  }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.8 }))
                )
              : null;
            const serverDetailContentClassName = "playground-server-detail-content" + (
              isSourceDeployableServer && normalizedServerDetailTab === "code"
                ? " is-code-tab"
                : ""
            );
            const serverEditorMainClassName = "playground-environments-editor-main playground-tasks-detail-main" + (
              isSourceDeployableServer && normalizedServerDetailTab === "code"
                ? " is-code-tab"
                : ""
            );
  
            const serverEditorScrollClassName = "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" + (
              isSourceDeployableServer && normalizedServerDetailTab === "code"
                ? " is-code-tab"
                : ""
            );
            const serverEditorLayoutClassName = "playground-servers-editor-layout" + (
              isSourceDeployableServer && normalizedServerDetailTab === "code"
                ? " is-code-tab"
                : ""
            );
  
            function renderServerVersionsSidebar() {
              if (!canShowServerVersionPublish || !serverVersionsSidebarOpen) {
                return null;
              }
              if (isAuthoritativelyVersionedServer(draftServer)) {
                const versions = readDraftServerVersions();
                const metadata = getServerVersionMetadata();
                const activeVersion = getDraftServerActiveVersion();
                const activeVersionId = String(
                  activeVersion?.id
                  || metadata.activeServerVersionId
                  || metadata.active_server_version_id
                  || ""
                ).trim();
                const selectedVersionId = String(
                  metadata.restoredFromServerVersionId
                  || metadata.restored_from_server_version_id
                  || activeVersionId
                  || ""
                ).trim();
                const normalizedServerId = String(draftServer?.id || selectedServerId || "").trim();
                const versionsLoading = serverVersionsLoadState.serverId === normalizedServerId
                  && serverVersionsLoadState.status === "loading";
                const versionsError = serverVersionsLoadState.serverId === normalizedServerId
                  && serverVersionsLoadState.status === "error"
                  ? serverVersionsLoadState.error
                  : "";
                const mutationStateContent = serverVersionState.status === "loading"
                  ? React.createElement(
                      "div",
                      { className: "platform-version-history-sidebar__state" },
                      serverVersionState.message || "Saving resource version..."
                    )
                  : serverVersionState.status === "error" && serverVersionState.error
                    ? React.createElement("div", {
                        className: "platform-version-history-sidebar__state is-error",
                        role: "alert",
                      }, serverVersionState.error)
                    : null;
                return React.createElement(PlatformVersionHistorySidebar, {
                  open: serverVersionsSidebarOpen,
                  title: "Version history",
                  sectionTitle: "All Versions",
                  className: "playground-server-versions-sidebar",
                  width: "var(--playground-thread-task-detail-width)",
                  portal: Boolean(environmentVersionsDrawerContainer),
                  portalTarget: environmentVersionsDrawerContainer || null,
                  versions,
                  activeVersionId,
                  selectedVersionId,
                  loading: versionsLoading,
                  loadingMessage: "Loading versions",
                  error: versionsError || null,
                  emptyDescription: "Save changes to create this resource's first version.",
                  busy: serverSaveState.isSaving || serverVersionState.status === "loading",
                  stateContent: mutationStateContent,
                  onClose: () => {
                    setServerVersionChangesState(null);
                    closeServerVersionsSidebar();
                  },
                  onSelectVersion: restoreAuthoritativeServerVersion,
                  onPublishVersion: (versionId) => void publishAuthoritativeServerVersion(versionId),
                  canPublishVersion: (version) => canPublishServerVersion(version),
                  onViewChanges: () => openServerVersionChangesPage(),
                  getVersionCreatedAt: (version) => {
                    const timestamp = version.createdAt || version.updatedAt || version.publishedAt;
                    return timestamp ? formatEnvironmentVersionTimestamp(timestamp) : "-";
                  },
                  getVersionActions: (version) => [
                    {
                      id: "edit",
                      label: "Edit description",
                      icon: SquarePen,
                      onSelect: () => openEditServerVersionModal(version.id),
                    },
                    {
                      id: "compare",
                      label: "View Changes",
                      icon: Code2,
                      onSelect: () => openServerVersionChangesPage(version.id),
                    },
                    {
                      id: "delete",
                      label: "Delete version",
                      icon: Trash2,
                      danger: true,
                      disabled: version.status === "active" || versions.length <= 1,
                      onSelect: () => void deleteAuthoritativeServerVersion(version.id),
                    },
                  ],
                });
              }
              const versions = readDraftServerVersions();
              const metadata = getServerVersionMetadata();
              const activeVersion = getDraftServerActiveVersion();
              const activeVersionId = String(
                activeVersion?.id
                || metadata.activeServerVersionId
                || metadata.active_server_version_id
                || ""
              ).trim();
              const selectedVersionId = String(
                metadata.restoredFromServerVersionId
                || metadata.restored_from_server_version_id
                || activeVersionId
                || ""
              ).trim();
              return React.createElement(PlaygroundVersionSidebar, {
                open: serverVersionsSidebarOpen,
                title: "Publish " + serverKindLabel,
                className: "playground-server-versions-sidebar",
                versions,
                activeVersionId,
                selectedVersionId,
                state: serverVersionState,
                busy: serverVersionState.status === "loading",
                openMenuId: openServerVersionMenuId,
                onOpenMenuIdChange: setOpenServerVersionMenuId,
                headerMenuOpen: serverVersionsHeaderMenuOpen,
                headerMenuActions: getServerVersionPopupActions({ includeVersionHistory: false }),
                headerMenuDisabled: serverSaveState.isSaving || serverVersionState.status === "loading" || serverDeploymentState.isDeploying,
                onHeaderMenuOpenChange: setServerVersionsHeaderMenuOpen,
                onClose: closeServerVersionsSidebar,
                onSaveVersion: () => openCreateServerVersionModal({ force: true }),
                onRestoreVersion: (versionId) => void restoreServerVersion(versionId),
                onPublishVersion: (versionId) => void publishServerVersion(versionId),
                canPublishVersion: (version) => canPublishServerVersion(version),
                onDeleteVersion: (versionId) => void deleteServerVersion(versionId),
                versionsSectionFooter: React.createElement("div", { className: "playground-metronome-publish-section-footer playground-agents-version-compare-footer" },
                  React.createElement(PlatformSecondaryButton, {
                    size: "large",
                    type: "button",
                    className: "playground-metronome-secondary-button playground-metronome-publish-new-button playground-agents-version-compare-button",
                    disabled: serverVersionState.status === "loading" || !versions.length,
                    onClick: () => openServerVersionChangesPage(),
                  },
                    React.createElement(Code2, { width: 13, height: 13, strokeWidth: 1.8 }),
                    React.createElement("span", null, "View Changes")
                  )
                ),
                getRowMenuItems: (version) => [
                  {
                    id: "edit",
                    label: "Edit version",
                    icon: SquarePen,
                    onClick: () => openEditServerVersionModal(version.id),
                  },
                  {
                    id: "compare",
                    label: "View Changes",
                    icon: Code2,
                    onClick: () => openServerVersionChangesPage(version.id),
                  },
                  {
                    id: "restore",
                    label: "Restore version",
                    icon: RotateCcw,
                    onClick: () => void restoreServerVersion(version.id),
                  },
                  {
                    id: "delete",
                    label: "Delete version",
                    icon: Trash2,
                    danger: true,
                    onClick: () => void deleteServerVersion(version.id),
                  },
                ],
                getVersionTitle: (version) => String(version.label || ("Version " + version.version)).trim(),
                getVersionDescription: () => "",
                getVersionMeta: (version) => {
                  const lifecycleLabel = getServerVersionLifecycleLabel(version);
                  const timestamp = version.publishedAt || version.updatedAt || version.createdAt;
                  const actorLabel = getServerVersionActorLabel(version.publishedAt ? version.publishedBy : (version.updatedBy || version.createdBy));
                  return lifecycleLabel
                    + " "
                    + formatEnvironmentVersionTimestamp(timestamp)
                    + (actorLabel ? " by " + actorLabel : "")
                    + " · "
                    + (version.runtime || version.snapshot?.runtime || draftServer.runtime || "nodejs22");
                },
              });
            }
  
            function renderServerVersionsSidebarPortal() {
              const sidebar = renderServerVersionsSidebar();
              if (!sidebar) {
                return null;
              }
              if (isAuthoritativelyVersionedServer(draftServer)) {
                return sidebar;
              }
              if (environmentVersionsDrawerContainer && typeof createPortal === "function") {
                return createPortal(sidebar, environmentVersionsDrawerContainer);
              }
              if (versionsDrawerPortalId) {
                return null;
              }
              return React.createElement("aside", {
                  className: "playground-metronome-node-drawer playground-agent-versions-inline-drawer is-open",
                },
                sidebar
              );
            }

            function renderAuthoritativeServerVersionSaveDialog() {
              if (!isSourceDeployableServer || !serverVersionSaveDialog) {
                return null;
              }
              const versionData = buildAuthoritativeServerVersionSaveDialogData();
              const snapshotPending = serverVersionReviewSnapshot?.key === serverVersionSaveDialog.key
                && serverVersionReviewSnapshot.status === "loading";
              const snapshotError = serverVersionReviewSnapshot?.key === serverVersionSaveDialog.key
                && serverVersionReviewSnapshot.status === "error"
                ? serverVersionReviewSnapshot.error
                : "";
              const isBusy = serverSaveState.isSaving
                || serverVersionState.status === "loading"
                || snapshotPending;
              return React.createElement(PlatformVersionSaveDialog, {
                open: true,
                title: "Review changes",
                currentVersion: versionData.currentVersion,
                nextVersion: versionData.nextVersion,
                currentDescription: versionData.currentDescription,
                initialMode: serverVersionSaveDialog.initialMode || "new",
                canSaveCurrent: versionData.canSaveCurrent,
                instanceKey: serverVersionSaveDialog.key,
                pending: isBusy,
                error: snapshotError || (
                  serverVersionState.status === "error"
                    ? serverVersionState.error
                    : null
                ),
                changes: versionData.diffFiles.map((file) => ({
                  id: file.id,
                  label: file.label || file.filePath,
                  content: React.createElement(PlatformDiffViewer, {
                    filePath: file.filePath,
                    diffContent: file.diffContent || "",
                    fileContent: file.fileContent || "",
                    additions: file.additions,
                    deletions: file.deletions,
                    hideTopbar: true,
                    embedded: true,
                    defaultExpanded: true,
                    maxHeight: 330,
                  }),
                })),
                emptyChanges: "No changes were found between the editor and the selected version.",
                onClose: () => {
                  if (!isBusy) {
                    setServerVersionSaveDialog(null);
                    setServerVersionReviewSnapshot(null);
                  }
                },
                onSubmit: async (details) => {
                  const savedServer = await saveAndPublishCurrentServerVersion(details);
                  if (!savedServer) {
                    throw new Error("The resource could not be saved. Review the validation details and try again.");
                  }
                  setServerVersionSaveDialog(null);
                },
              });
            }
  
            function renderServerVersionChangesPage() {
              if (!serverVersionChangesState) {
                return null;
              }
              const versions = readDraftServerVersions();
              const sources = buildServerVersionCompareSources(versions);
              const requestedLeftSourceId = String(serverVersionChangesState.leftSourceId || "").trim()
                || getDefaultServerVersionCompareLeftSourceId(versions);
              const requestedRightSourceId = String(serverVersionChangesState.rightSourceId || "").trim()
                || SERVER_VERSION_COMPARE_CURRENT_EDITOR_ID;
              const currentEditorSource = sources.find((source) => source.id === SERVER_VERSION_COMPARE_CURRENT_EDITOR_ID) || sources[0] || null;
              const leftSource = resolveServerVersionCompareSource(requestedLeftSourceId, sources, sources[1] || currentEditorSource);
              const rightSource = resolveServerVersionCompareSource(requestedRightSourceId, sources, currentEditorSource);
              if (!leftSource || !rightSource) {
                return null;
              }
              const diffFiles = buildServerVersionDiffFilesFromSnapshots(leftSource.snapshot, rightSource.snapshot);
              const compareOptions = sources.map((source) =>
                React.createElement("option", { key: source.id, value: source.id }, source.label)
              );
              const renderCompareSelect = (value, side, ariaLabel) =>
                React.createElement("label", { className: "playground-version-changes-select-shell" },
                  React.createElement("span", { className: "playground-version-changes-select-control-wrap" },
                    React.createElement("select", {
                      className: "playground-version-changes-select-control",
                      value,
                      onChange: (event) => handleServerVersionCompareSourceChange(side, event.target.value),
                      "aria-label": ariaLabel,
                    }, compareOptions),
                    React.createElement(ChevronDown, { width: 13, height: 13, strokeWidth: 1.8, "aria-hidden": "true" })
                  )
                );
              const compareControls = React.createElement(React.Fragment, null,
                renderCompareSelect(leftSource.id, "left", "Base version"),
                React.createElement("span", { className: "playground-version-changes-select-arrow", "aria-hidden": "true" }, "→"),
                renderCompareSelect(rightSource.id, "right", "Compare version")
              );
              return renderPlaygroundVersionChangesPage({
                title: "Changes",
                backText: "Back to " + serverKindLabel,
                backLabel: "Back to " + serverKindLabel,
                onBack: closeServerVersionChangesPage,
                compareControls,
                actions: renderServerPublishSplitButton(),
                files: diffFiles,
                emptyMessage: "No changes between these versions.",
              });
            }

            const sourceServerSidebarCollapsed = Boolean(serverDetailsCollapsed);
            const sourceServerDeploymentLabel = serverDeploymentState.isDeploying
              ? "Deploying"
              : functionDeployedServiceUrl
                ? "Deployed"
                : "Not deployed";
            const sourceServerDeploymentVariant = serverDeploymentState.isDeploying
              ? "yellow"
              : functionDeployedServiceUrl
                ? "green"
                : "gray";
            const sourceServerSourceType = String(
              draftServer.sourceType
              || draftServer.source_type
              || draftServer.template
              || ""
            ).trim();
            const sourceServerSourceLabel = ({
              manual: "Manual",
              computer: "Computer",
              git: "Git",
              blank: "Blank template",
              ai_chat_app: "AI chat app template",
            })[sourceServerSourceType] || sourceServerSourceType;
            const renderSourceServerSidebarValue = (value, className = "") =>
              React.createElement("span", {
                className: "playground-environments-editor-fact-value" + (className ? " " + className : ""),
                title: String(value || ""),
              }, value || "Not set");
            const renderSourceServerSidebarRow = (label, valueNode, options = {}) =>
              React.createElement("div", {
                  key: label,
                  className: "playground-project-overview-sidebar-row"
                    + (options.className ? " " + options.className : ""),
                },
                React.createElement("div", { className: "playground-project-overview-sidebar-row-label" }, label),
                React.createElement("div", {
                  className: "playground-project-overview-sidebar-row-value"
                    + (options.valueClassName ? " " + options.valueClassName : ""),
                }, valueNode)
              );
            const sourceServerUrlValue = functionDeployedServiceUrl
              ? React.createElement("span", { className: "playground-agents-detail-sidebar-copy-value playground-server-detail-sidebar-url-value" },
                  React.createElement("a", {
                    className: "playground-server-detail-sidebar-url-link",
                    href: functionDeployedServiceUrl,
                    target: "_blank",
                    rel: "noreferrer",
                    title: functionDeployedServiceUrl,
                  }, functionDeployedServiceUrl),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-agents-detail-sidebar-copy-button",
                    onClick: async () => {
                      const copied = await copyTextToClipboard(functionDeployedServiceUrl);
                      if (!copied) return;
                      setCopiedFunctionServiceUrl(functionDeployedServiceUrl);
                      window.setTimeout(() => {
                        setCopiedFunctionServiceUrl((currentValue) =>
                          currentValue === functionDeployedServiceUrl ? "" : currentValue
                        );
                      }, 3000);
                    },
                    title: copiedFunctionServiceUrl === functionDeployedServiceUrl ? "Copied" : "Copy service URL",
                    "aria-label": copiedFunctionServiceUrl === functionDeployedServiceUrl ? "Service URL copied" : "Copy service URL",
                  },
                    copiedFunctionServiceUrl === functionDeployedServiceUrl
                      ? React.createElement(Check, { width: 12, height: 12, strokeWidth: 2 })
                      : React.createElement(Copy, { width: 12, height: 12, strokeWidth: 1.8 })
                  )
                )
              : renderSourceServerSidebarValue("Not deployed", "is-empty");
            const sourceServerPropertiesSidebar = isSourceDeployableServer
              ? React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "sidebar",
                  cardTitle: "Properties",
                  className: "playground-project-overview-sidebar-card playground-server-detail-properties-card",
                },
                    React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                      renderSourceServerSidebarRow("Status",
                        React.createElement(PlatformLabel, {
                          variant: sourceServerDeploymentVariant,
                        }, sourceServerDeploymentLabel)
                      ),
                      renderSourceServerSidebarRow("URL", sourceServerUrlValue, {
                        className: "playground-server-detail-sidebar-url-row",
                        valueClassName: "playground-server-detail-sidebar-url-cell",
                      }),
                      renderSourceServerSidebarRow("Creator", serverCreatorValue, {
                        valueClassName: "playground-server-detail-sidebar-identity-cell",
                      }),
                      renderSourceServerSidebarRow("Owner", serverOwnerSelectorControl, {
                        className: "playground-server-detail-sidebar-owner-row",
                        valueClassName: "playground-server-detail-sidebar-owner-cell",
                      }),
                      !isFunctionServer
                        ? renderSourceServerSidebarRow("Runtime",
                            renderSourceServerSidebarValue(draftServer.runtime || "nodejs22")
                          )
                        : null,
                      !isFunctionServer
                        ? renderSourceServerSidebarRow("Region",
                            renderSourceServerSidebarValue(draftServer.region || "europe-west1")
                          )
                        : null,
                      !isFunctionServer
                        ? renderSourceServerSidebarRow("Authentication",
                            renderSourceServerSidebarValue(functionApiKeyAuthEnabled ? "API key required" : "Public")
                          )
                        : null,
                      sourceServerSourceLabel
                        ? renderSourceServerSidebarRow("Source",
                            renderSourceServerSidebarValue(sourceServerSourceLabel)
                          )
                        : null,
                      renderSourceServerSidebarRow("Resource ID",
                        renderSourceServerSidebarValue(
                          draftServer.id || "Unsaved resource",
                          "is-id"
                        )
                      ),
                      renderSourceServerSidebarRow("Created",
                        renderSourceServerSidebarValue(formatPlaygroundFileDate(draftServer.createdAt))
                      ),
                      renderSourceServerSidebarRow("Updated",
                        renderSourceServerSidebarValue(formatPlaygroundFileDate(draftServer.updatedAt))
                      )
                    )
                  )
              : null;
            const sourceServerConnectionsSidebar = isFunctionServer
              ? React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "sidebar",
                  cardTitle: "Connections",
                  className: "playground-project-overview-sidebar-card playground-server-detail-connections-card",
                },
                  renderServerConnectionsSection({
                    showTitle: false,
                    className: "playground-server-detail-sidebar-connections",
                  })
                )
              : null;
            const sourceServerDetailSidebar = isSourceDeployableServer
              ? React.createElement(React.Fragment, null,
                  sourceServerPropertiesSidebar,
                  sourceServerConnectionsSidebar
                )
              : null;
            const sourceServerDetailSidebarToggle = isSourceDeployableServer
              ? React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-sidebar-toggle",
                  onClick: () => setServerDetailsCollapsed((current) => !current),
                  title: sourceServerSidebarCollapsed
                    ? "Show " + serverKindLabel.toLowerCase() + " properties"
                    : "Hide " + serverKindLabel.toLowerCase() + " properties",
                  "aria-label": sourceServerSidebarCollapsed
                    ? "Show " + serverKindLabel.toLowerCase() + " properties"
                    : "Hide " + serverKindLabel.toLowerCase() + " properties",
                  "aria-pressed": sourceServerSidebarCollapsed ? "true" : "false",
                },
                React.createElement(PanelRight, {
                  width: 15,
                  height: 15,
                  strokeWidth: 1.8,
                })
              )
              : null;
            const sourceServerDetailHeader = isSourceDeployableServer
              ? React.createElement("div", {
                  className: "playground-server-detail-profile-section",
                },
                  renderServerResourceDetailTitleRow({
                    className: " playground-server-function-title-input",
                    placeholder: serverKindLabel,
                    ariaLabel: serverKindLabel + " name",
                    readOnly: isServerTemplatePreview,
                  })
                )
              : null;
            const sourceServerDetailContent = serverVersionChangesState
              ? renderServerVersionChangesPage()
              : React.createElement("div", { className: serverDetailContentClassName },
                  serverSaveState.error
                    ? React.createElement("div", {
                        className: "playground-environments-error playground-environments-editor-notice",
                        role: "alert",
                      }, serverSaveState.error)
                    : null,
                  serverEditorTabContent
                );
            const sourceServerDetailWorkspace = isSourceDeployableServer
              ? React.createElement(DevelopServerDetailPage, {
                  header: sourceServerDetailHeader,
                  sidebarToggle: sourceServerDetailSidebarToggle,
                  sidebar: sourceServerDetailSidebar,
                  activeTab: normalizedServerDetailTab,
                  onTabChange: handleSourceServerDetailTabChange,
                  sidebarCollapsed: sourceServerSidebarCollapsed,
                  ariaLabel: serverKindLabel + " details for " + (draftServer.name || "Untitled"),
                  sidebarAriaLabel: (draftServer.name || serverKindLabel) + " properties",
                  className: isFunctionServer ? "is-function-server-detail" : "is-web-app-server-detail",
                }, sourceServerDetailContent)
              : null;
            const sourceServerTopNavActions = isSourceDeployableServer
              && topNavActionsContainer
              ? createPortal(
                  React.createElement(React.Fragment, null,
                    React.createElement(PlatformSecondaryButton, {
                      size: "medium",
                      type: "button",
                      onClick: () => {
                        if (isWebAppServer) {
                          if (draftServer.serviceUrl) {
                            window.open(draftServer.serviceUrl, "_blank", "noopener,noreferrer");
                          }
                          return;
                        }
                        void handleInvokeServer();
                      },
                      disabled: isServerTemplatePreview
                        || serverDeploymentState.isInvoking
                        || !draftServer.serviceUrl,
                    },
                      isWebAppServer
                        ? React.createElement(ArrowUpRight, { width: 14, height: 14, strokeWidth: 1.8 })
                        : serverDeploymentState.isInvoking
                          ? React.createElement(Loader2, {
                              width: 14,
                              height: 14,
                              strokeWidth: 1.8,
                              className: "playground-files-state-loader",
                            })
                          : React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null,
                        isWebAppServer
                          ? "Open App"
                          : serverDeploymentState.isInvoking
                            ? "Testing..."
                            : "Test Invoke"
                      )
                    ),
                    renderServerPublishSplitButton()
                  ),
                  topNavActionsContainer
                )
              : null;
  
            const activeServerEditorContent = serverVersionChangesState
              ? renderServerVersionChangesPage()
              : React.createElement("div", { className: serverDetailContentClassName },
                  serverSaveState.error
                    ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, serverSaveState.error)
                    : null,
                  isSourceDeployableServer ? null : descriptionSection,
                  serverDetailTabs,
                  serverEditorTabContent
                );
            const serverEditorScroll = React.createElement("div", { className: serverEditorScrollClassName },
              activeServerEditorContent
            );
  
  	          const serverMainTopbar = React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-server-detail-navbar" + (isSourceDeployableServer ? " is-function-detail-navbar" : "") },
  	            React.createElement("div", { className: "playground-environments-editor-navbar-title" },
  	              React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
  	                renderServerResourceDetailTitleRow({
  	                  className: isSourceDeployableServer ? " playground-server-function-title-input" : "",
  	                  placeholder: serverKindLabel,
  	                  ariaLabel: serverKindLabel + " name",
  	                  readOnly: isServerTemplatePreview,
  	                }),
                  isSourceDeployableServer && functionDeployedServiceUrl
                    ? React.createElement("div", { className: "playground-server-service-url-row" },
                        React.createElement("span", {
                          className: "playground-server-service-url-value",
                          title: functionDeployedServiceUrl,
                        }, functionDeployedServiceUrl),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-server-service-url-copy",
                          onClick: async () => {
                            const copied = await copyTextToClipboard(functionDeployedServiceUrl);
                            if (!copied) {
                              return;
                            }
                            setCopiedFunctionServiceUrl(functionDeployedServiceUrl);
                            window.setTimeout(() => {
                              setCopiedFunctionServiceUrl((currentValue) =>
                                currentValue === functionDeployedServiceUrl ? "" : currentValue
                              );
                            }, 3000);
                          },
                          title: copiedFunctionServiceUrl === functionDeployedServiceUrl ? "Copied" : "Copy service URL",
                          "aria-label": copiedFunctionServiceUrl === functionDeployedServiceUrl ? "Copied" : "Copy service URL",
                        },
                          copiedFunctionServiceUrl === functionDeployedServiceUrl
                            ? React.createElement(Check, { width: 12, height: 12, strokeWidth: 2 })
                            : React.createElement(Copy, { width: 12, height: 12, strokeWidth: 1.8 })
                        )
                      )
                    : null
                )
              ),
              React.createElement("div", { className: "playground-content-nav-center" }),
              React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions" },
                isPaymentsServer
                  ? React.createElement(React.Fragment, null,
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: () => void syncPaymentsResource(draftServer.id),
                        disabled: serverSaveState.isSaving || !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                      },
                        serverSaveState.isSaving
                          ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                          : React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Sync Status")
                      ),
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                        type: "button",
                        className: "playground-environments-action-button is-primary",
                        onClick: () => void connectPaymentsResource(draftServer.id),
                        disabled: serverSaveState.isSaving || !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                      },
                        serverSaveState.isSaving
                          ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                          : React.createElement(ReceiptText, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, getPlaygroundPaymentsMetadata(draftServer).stripeAccountId ? "Continue Setup" : "Connect Stripe")
                      )
                    )
                  : isSourceDeployableServer
                  ? React.createElement(React.Fragment, null,
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: () => {
                          if (isWebAppServer) {
                            if (draftServer.serviceUrl) {
                              window.open(draftServer.serviceUrl, "_blank", "noopener,noreferrer");
                            }
                            return;
                          }
                          void handleInvokeServer();
                        },
                        disabled: isServerTemplatePreview || serverDeploymentState.isInvoking || !draftServer.serviceUrl,
                        title: isWebAppServer
                          ? (draftServer.serviceUrl || "Service URL is available after deployment")
                          : (draftServer.serviceUrl ? "Invoke the live " + serverKindLabel.toLowerCase() : "Deploy first to enable test invocation"),
                      },
                        isWebAppServer
                          ? React.createElement(ArrowUpRight, { width: 14, height: 14, strokeWidth: 1.8 })
                          : serverDeploymentState.isInvoking
                          ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                          : React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, isWebAppServer ? "Open App" : (serverDeploymentState.isInvoking ? "Testing..." : "Test Invoke"))
                      ),
                      renderServerPublishSplitButton()
                    )
                  : null
              )
            );
  
            if (isPaymentsServer) {
              const paymentsMetadata = getPlaygroundPaymentsMetadata(draftServer);
              const paymentsCurrency = String(paymentsMetadata.currency || paymentsMetadata.defaultCurrency || "usd").toUpperCase();
              const paymentsStatus = formatPlaygroundPaymentsStatus(paymentsMetadata);
              const paymentsStatusVariant = paymentsMetadata.stripeAccountId
                ? paymentsMetadata.chargesEnabled ? "green" : "yellow"
                : "gray";
              const paymentsDetailsSection = React.createElement(PlatformUiCard, {
                  as: "section",
                  className: "playground-server-details-card playground-server-runtime-card playground-payments-detail-card",
                },
                React.createElement("div", { className: "playground-server-details-card-header" },
                  React.createElement("div", null,
                    React.createElement("h2", { className: "playground-server-details-card-title" }, "Stripe payments"),
                    React.createElement("p", { className: "playground-server-details-card-copy" },
                      "Connect one Stripe account and bind it to web apps, functions, and agent runtimes without exposing Stripe keys."
                    )
                  ),
                  React.createElement(PlatformLabel, { variant: paymentsStatusVariant }, paymentsStatus)
                ),
                React.createElement("div", { className: "playground-server-runtime-grid" },
                  renderServerFactRow("Provider",
                    React.createElement("span", { className: "playground-environments-editor-fact-value" }, "Stripe")
                  ),
                  renderServerFactRow("Mode",
                    React.createElement("span", { className: "playground-environments-editor-fact-value" }, String(paymentsMetadata.mode || "test").toUpperCase())
                  ),
                  renderServerFactRow("Charges",
                    React.createElement("span", { className: "playground-environments-editor-fact-value" }, paymentsMetadata.chargesEnabled ? "Enabled" : "Not enabled")
                  ),
                  renderServerFactRow("Payouts",
                    React.createElement("span", { className: "playground-environments-editor-fact-value" }, paymentsMetadata.payoutsEnabled ? "Enabled" : "Not enabled")
                  ),
                  renderServerFactRow("Earned",
                    React.createElement("span", { className: "playground-environments-editor-fact-value" },
                      formatPlaygroundPaymentMoney(paymentsMetadata.totalEarnedCents, paymentsCurrency)
                    )
                  ),
                  renderServerFactRow("Payments",
                    React.createElement("span", { className: "playground-environments-editor-fact-value" },
                      String(Math.max(0, Number(paymentsMetadata.totalPaymentCount || 0)))
                    )
                  ),
                  renderServerFactRow("Stripe Account",
                    React.createElement("span", {
                      className: "playground-environments-editor-fact-value is-id",
                      title: String(paymentsMetadata.stripeAccountId || "None"),
                    }, String(paymentsMetadata.stripeAccountId || "None"))
                  )
                )
              );
              const paymentsRuntimeSection = React.createElement(PlatformUiCard, {
                  as: "section",
                  className: "playground-server-details-card playground-server-runtime-card playground-payments-detail-card playground-payments-runtime-card",
                },
                React.createElement("div", { className: "playground-server-details-card-header" },
                  React.createElement("div", null,
                    React.createElement("h2", { className: "playground-server-details-card-title" }, "Runtime checkout API"),
                    React.createElement("p", { className: "playground-server-details-card-copy" },
                      "Connected workloads can create Stripe Checkout Sessions through the Computer Agents runtime SDK. Stripe credentials stay in the control plane."
                    )
                  )
                ),
                React.createElement("div", { className: "playground-server-runtime-grid" },
                  renderServerFactRow("Node.js",
                    React.createElement("span", { className: "playground-environments-editor-fact-value is-id" }, "await computerAgents.payments.createCheckoutSession(...)")
                  ),
                  renderServerFactRow("Browser",
                    React.createElement("span", { className: "playground-environments-editor-fact-value is-id" }, "await client.payments.createCheckoutSession(...)")
                  )
                )
              );
              const normalizedPaymentsDetailTab = ["usage", "settings"].includes(serverDetailTab) ? serverDetailTab : "usage";
              const paymentsDetailTabs = [
                { id: "usage", label: "Usage", icon: ChartColumnIncreasing },
                { id: "settings", label: "Settings", icon: Settings },
              ];
              const handlePaymentsDetailTabChange = (nextTab) => {
                setServerOwnerPopoverOpen(false);
                setServerDetailTab(nextTab);
                if (nextTab === "usage" && draftServer.id) {
                  void loadServerAnalytics(draftServer.id, { period: serverDetailChartTimescale });
                }
                if (nextTab === "settings") {
                  if (draftServer.id) void loadServerContext(draftServer.id);
                  if (typeof onWorkspaceTeamsRequest === "function" && !workspaceTeamsLoading) onWorkspaceTeamsRequest({});
                }
              };
              const paymentsSettingsContent = serverSettingsPermissionContent || React.createElement("div", { className: "playground-server-settings-tab" },
                descriptionSection,
                paymentsRuntimeSection,
                connectionsSection,
                serverTeamAccessPlatformSection,
                serverDangerSection
              );
              const paymentsTabContent = normalizedPaymentsDetailTab === "settings"
                ? paymentsSettingsContent
                : React.createElement(React.Fragment, null, serverUsageTabContent, paymentsDetailsSection);
              const paymentsStorageLocation = String(draftServer.location || "eur3").trim() || "eur3";
              const paymentsDetailSidebar = React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "sidebar",
                  cardTitle: "Properties",
                  className: "playground-project-overview-sidebar-card playground-server-detail-properties-card playground-payments-detail-properties-card",
                },
                React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                  renderSourceServerSidebarRow("Creator", serverCreatorValue, {
                    valueClassName: "playground-server-detail-sidebar-identity-cell",
                  }),
                  renderSourceServerSidebarRow("Owner", serverOwnerSelectorControl, {
                    className: "playground-server-detail-sidebar-owner-row",
                    valueClassName: "playground-server-detail-sidebar-owner-cell",
                  }),
                  renderSourceServerSidebarRow("Status",
                    React.createElement(PlatformLabel, { variant: paymentsStatusVariant }, paymentsStatus)
                  ),
                  renderSourceServerSidebarRow("Stripe Account",
                    renderSourceServerSidebarValue(paymentsMetadata.stripeAccountId || "Not connected", "is-id")
                  ),
                  renderSourceServerSidebarRow("Mode",
                    renderSourceServerSidebarValue(String(paymentsMetadata.mode || "test").toUpperCase())
                  ),
                  renderSourceServerSidebarRow("Currency", renderSourceServerSidebarValue(paymentsCurrency)),
                  renderSourceServerSidebarRow("Payments",
                    renderSourceServerSidebarValue(String(Math.max(0, Number(paymentsMetadata.totalPaymentCount || 0))))
                  ),
                  renderSourceServerSidebarRow("Earned",
                    renderSourceServerSidebarValue(formatPlaygroundPaymentMoney(paymentsMetadata.totalEarnedCents, paymentsCurrency))
                  ),
                  renderSourceServerSidebarRow("Location", renderSourceServerSidebarValue(paymentsStorageLocation)),
                  renderSourceServerSidebarRow("Resource ID",
                    renderSourceServerSidebarValue(draftServer.id || "Unsaved payments", "is-id")
                  ),
                  renderSourceServerSidebarRow("Created",
                    renderSourceServerSidebarValue(formatPlaygroundFileDate(draftServer.createdAt))
                  ),
                  renderSourceServerSidebarRow("Updated",
                    renderSourceServerSidebarValue(formatPlaygroundFileDate(draftServer.updatedAt))
                  )
                )
              );
              const paymentsDetailSidebarCollapsed = Boolean(serverDetailsCollapsed);
              const paymentsDetailSidebarToggle = React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-sidebar-toggle",
                  onClick: () => setServerDetailsCollapsed((current) => !current),
                  title: paymentsDetailSidebarCollapsed ? "Show payments properties" : "Hide payments properties",
                  "aria-label": paymentsDetailSidebarCollapsed ? "Show payments properties" : "Hide payments properties",
                  "aria-pressed": paymentsDetailSidebarCollapsed ? "true" : "false",
                },
                React.createElement(PanelRight, { width: 15, height: 15, strokeWidth: 1.8 })
              );
              const paymentsDetailHeader = React.createElement("div", { className: "playground-server-detail-profile-section" },
                renderServerResourceDetailTitleRow({
                  className: " playground-server-function-title-input playground-payments-title-input",
                  placeholder: "Payments",
                  ariaLabel: "Payments name",
                  readOnly: isServerTemplatePreview,
                })
              );
              const paymentsDetailWorkspace = React.createElement(DevelopServerDetailPage, {
                  header: paymentsDetailHeader,
                  tabs: paymentsDetailTabs,
                  activeTab: normalizedPaymentsDetailTab,
                  onTabChange: handlePaymentsDetailTabChange,
                  sidebarToggle: paymentsDetailSidebarToggle,
                  sidebar: paymentsDetailSidebar,
                  sidebarCollapsed: paymentsDetailSidebarCollapsed,
                  ariaLabel: "Payments details for " + (draftServer.name || "Untitled payments resource"),
                  sidebarAriaLabel: (draftServer.name || "Payments") + " properties",
                  className: "is-payments-server-detail",
                  contentClassName: "playground-server-detail-content playground-payments-detail-content",
                },
                serverSaveState.error
                  ? React.createElement("div", {
                      className: "playground-environments-error playground-environments-editor-notice",
                      role: "alert",
                    }, serverSaveState.error)
                  : null,
                serverSaveState.message
                  ? React.createElement("div", {
                      className: "playground-environments-success playground-environments-editor-notice",
                      role: "status",
                    }, serverSaveState.message)
                  : null,
                paymentsTabContent
              );
              const paymentsTopNavActions = topNavActionsContainer
                ? createPortal(
                    React.createElement(React.Fragment, null,
                      React.createElement(PlatformSecondaryButton, {
                        size: "medium",
                        type: "button",
                        onClick: () => void syncPaymentsResource(draftServer.id),
                        disabled: serverSaveState.isSaving || !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                      },
                        serverSaveState.isSaving
                          ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                          : React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Sync Status")
                      ),
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                        type: "button",
                        onClick: () => void connectPaymentsResource(draftServer.id),
                        disabled: serverSaveState.isSaving || !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                      },
                        serverSaveState.isSaving
                          ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                          : React.createElement(ReceiptText, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, paymentsMetadata.stripeAccountId ? "Continue Setup" : "Connect Stripe")
                      )
                    ),
                    topNavActionsContainer
                  )
                : null;

              return React.createElement(React.Fragment, null,
                React.createElement("div", {
                    className: "playground-environments-editor-main playground-tasks-detail-main playground-managed-data-detail-main playground-payments-detail-main",
                    ref: serverDetailMainRef,
                  },
                  React.createElement("div", {
                    className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll",
                  }, paymentsDetailWorkspace)
                ),
                paymentsTopNavActions,
                serverOwnerTransferModal
              );
            }
  
            if (isSecretsServer) {
              const secrets = Array.isArray(currentServerSecrets) ? currentServerSecrets : [];
              const secretsLoading = loadingServerSecretsId === draftServer.id;
              const totalSecrets = secrets.length;
              const secretDescriptionFormatActions = React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                [
                  { id: "bold", label: "Bold", icon: Bold },
                  { id: "italic", label: "Italic", icon: Italic },
                  { id: "underline", label: "Underline", icon: Underline },
                  { id: "list", label: "List", icon: List },
                ].map((action) =>
                  React.createElement("button", {
                    key: action.id,
                    type: "button",
                    className: "playground-tasks-detail-format-button",
                    title: action.label,
                    "aria-label": action.label,
                    disabled: serverSecretComposerState.isSaving,
                    onMouseDown: (event) => event.preventDefault(),
                    onClick: () => handleServerSecretDescriptionFormat(action.id),
                  }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                )
              );
              const secretDescriptionEditor = React.createElement("div", {
                  className: "playground-tasks-detail-description-editor" + (isServerSecretDescriptionEditing ? " is-editing" : " is-preview"),
                },
                !isServerSecretDescriptionEditing
                  ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                      String(serverSecretComposerState.description || "").trim()
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: serverSecretComposerState.description,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", {
                            className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                          }, "Add Description here")
                    )
                  : null,
                React.createElement("textarea", {
                  ref: serverSecretDescriptionTextareaRef,
                  className: "playground-tasks-detail-description-input " + (isServerSecretDescriptionEditing ? "is-editing" : "is-preview"),
                  rows: 1,
                  placeholder: isServerSecretDescriptionEditing ? "Add Description here" : "",
                  value: serverSecretComposerState.description || "",
                  disabled: serverSecretComposerState.isSaving,
                  onFocus: () => setIsServerSecretDescriptionEditing(true),
                  onChange: (event) => {
                    setServerSecretComposerState((current) => ({
                      ...current,
                      description: event.target.value,
                      error: "",
                    }));
                    resizeEnvironmentDescriptionTextarea(event.currentTarget);
                  },
                  onBlur: () => setIsServerSecretDescriptionEditing(false),
                })
              );
              const secretComposerModal = serverSecretComposerState.open
                ? React.createElement(PlatformModalBackdrop, {
                    className: "playground-tasks-project-modal-backdrop",
                    onClick: () => {
                      if (!serverSecretComposerState.isSaving) {
                        closeServerSecretComposer();
                      }
                    },
                  },
                    React.createElement(PlatformModalSurface, {
                        as: "form",
                        className: "playground-tasks-project-modal playground-database-browser-modal playground-server-custom-domain-modal",
                        onClick: (event) => event.stopPropagation(),
                        onSubmit: (event) => void handleServerSecretComposerSubmit(event),
                      },
                      React.createElement("div", { className: "playground-tasks-project-modal-top" },
                        React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                          React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                            React.createElement(Key, { width: 18, height: 18, strokeWidth: 1.9 })
                          ),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-tasks-project-modal-name-input",
                            value: serverSecretComposerState.name,
                            placeholder: "New Secret",
                            autoFocus: true,
                            disabled: serverSecretComposerState.isSaving,
                            onChange: (event) => setServerSecretComposerState((current) => ({
                              ...current,
                              name: event.target.value,
                              error: "",
                            })),
                          })
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-icon-button playground-tasks-project-modal-close",
                          onClick: closeServerSecretComposer,
                          title: "Close",
                          disabled: serverSecretComposerState.isSaving,
                        }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                      ),
                      React.createElement("div", { className: "playground-server-custom-domain-modal-body" },
                        React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-server-secret-modal-description" },
                          React.createElement("div", { className: "playground-tasks-detail-section-header" },
                            React.createElement("div", { className: "playground-tasks-detail-section-title playground-server-description-title" }, "Description"),
                            secretDescriptionFormatActions
                          ),
                          secretDescriptionEditor
                        ),
                        React.createElement("label", { className: "playground-environments-field playground-server-custom-domain-field" },
                          React.createElement("span", { className: "playground-environments-field-label" },
                            serverSecretComposerState.secretId ? "Value (leave empty to keep existing)" : "Value"
                          ),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-environments-input",
                            value: serverSecretComposerState.value,
                            placeholder: "Paste the secret value",
                            disabled: serverSecretComposerState.isSaving,
                            onChange: (event) => setServerSecretComposerState((current) => ({
                              ...current,
                              value: event.target.value,
                              error: "",
                            })),
                          })
                        ),
                        serverSecretComposerState.error
                          ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, serverSecretComposerState.error)
                          : null
                      ),
                      React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: closeServerSecretComposer,
                          disabled: serverSecretComposerState.isSaving,
                        }, "Cancel"),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "submit",
                          className: "playground-environments-action-button is-primary",
                          disabled: serverSecretComposerState.isSaving || !String(serverSecretComposerState.name || "").trim(),
                        }, serverSecretComposerState.isSaving ? "Saving..." : "Save Secret")
                      )
                    )
                  )
                : null;
	            const secretsSurface = React.createElement(PlatformUiCard, {
	                as: "section",
	                className: "playground-managed-data-list-surface playground-secrets-surface",
	              },
                    React.createElement(PlatformDataTable, {
	                      rows: filteredServerSecrets,
	                      getRowId: (secret) => String(secret.id || secret.name),
	                      ariaLabel: "Server secrets",
	                      className: "playground-managed-data-list-table playground-server-secrets-platform-table",
	                      surface: "plain",
	                      variant: "minimalistic-ui",
	                      layout: "fill",
	                      sticky: false,
	                      pagination: {
	                        defaultValue: { pageIndex: 0, pageSize: 20 },
	                        pageSizeOptions: [20, 50, 100],
	                      },
	                      selection: {
	                        enabled: true,
	                        ariaLabel: (secret) => "Select " + String(secret.name || "secret"),
	                      },
	                      loading: secretsLoading,
	                      error: serverSecretsState.error || null,
                      emptyState: serverSecretsSearchQuery.trim()
                        ? "No matching secrets found."
                        : React.createElement("div", { className: "playground-files-state playground-auth-users-empty-state" },
                            React.createElement("img", {
                              className: "playground-auth-users-empty-state-image",
                              src: "/img/empty-state/no-secrets-yet.avif",
                              alt: "",
                              "aria-hidden": "true",
                              draggable: "false",
                            }),
                            React.createElement("div", { className: "playground-auth-users-empty-state-title" }, "Add your first secret"),
                            React.createElement("div", { className: "playground-auth-users-empty-state-copy" }, "Secrets store encrypted values that agents and resources can use securely.")
	                          ),
	                      toolbar: {
	                        title: "All Secrets",
	                        search: {
	                          value: serverSecretsSearchQuery,
                          manual: true,
                          onChange: setServerSecretsSearchQuery,
                          placeholder: "Search secrets by name or description",
                        },
                        primaryAction: {
                          label: "Add Secret",
                          icon: Plus,
                          onClick: () => openServerSecretComposer(null),
                          disabled: !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                        },
                      },
                      columns: [
                        {
	                          id: "name",
	                          header: "Name",
	                          accessor: (secret) => secret.name || "",
	                          sortable: true,
	                          width: "minmax(180px, 1.5fr)",
                          cell: ({ row: secret }) => React.createElement("div", {
                              className: "playground-auth-users-cell is-identifier is-secret-name",
                              title: secret.description ? (secret.name + " - " + secret.description) : secret.name,
                            },
                            React.createElement("div", { className: "playground-auth-users-secret-name-title" }, secret.name),
                            secret.description
                              ? React.createElement("div", { className: "playground-auth-users-secret-description", title: secret.description }, secret.description)
                              : null
                          ),
                        },
                        {
	                          id: "value",
	                          header: "Value",
	                          accessor: (secret) => secret.maskedValue || "",
	                          sortable: true,
	                          width: "minmax(120px, 1fr)",
                          cell: ({ row: secret }) => React.createElement("span", {
                            className: "playground-auth-users-cell is-uid",
                            title: "Secret values are encrypted and masked in the control plane.",
                          }, secret.maskedValue || "••••••••"),
                        },
                        {
	                          id: "updated",
	                          header: "Updated",
	                          accessor: (secret) => secret.updatedAt || "",
	                          sortable: true,
	                          sortDescFirst: true,
	                          width: "minmax(120px, 1fr)",
                          hideBelow: 720,
                          cell: ({ row: secret }) => formatPlaygroundExactDate(secret.updatedAt),
                        },
                        {
	                          id: "accessed",
	                          header: "Last Accessed",
	                          accessor: (secret) => secret.lastAccessedAt || "",
	                          sortable: true,
	                          sortDescFirst: true,
	                          width: "minmax(130px, 1fr)",
                          hideBelow: 900,
                          cell: ({ row: secret }) => secret.lastAccessedAt ? formatPlaygroundExactDate(secret.lastAccessedAt) : "Never",
                        },
                      ],
                      onRowActivate: openServerSecretComposer,
                      getRowAriaLabel: (secret) => "Edit secret " + String(secret.name || ""),
                      getRowActions: (secret) => [{
                        id: "delete",
                        label: "Delete",
                        icon: Trash2,
                        danger: true,
	                        onSelect: () => handleDeleteServerSecret(secret),
	                      }],
	                    })
              );
  
	            const normalizedSecretsDetailTab = ["secrets", "usage", "settings"].includes(secretsDetailTab) ? secretsDetailTab : "secrets";
	            const secretsDetailTabs = [
	              { id: "secrets", label: "Secrets", icon: Key },
	              { id: "usage", label: "Usage", icon: ChartColumnIncreasing },
	              { id: "settings", label: "Settings", icon: Settings },
	            ];
	            const handleSecretsDetailTabChange = (nextTab) => {
	              setServerOwnerPopoverOpen(false);
	              setSecretsDetailTab(nextTab);
	              if (nextTab === "usage" && draftServer.id) {
	                void loadServerAnalytics(draftServer.id, { period: serverDetailChartTimescale });
	              }
	              if (nextTab === "settings") {
	                if (draftServer.id) void loadServerContext(draftServer.id);
	                if (typeof onWorkspaceTeamsRequest === "function" && !workspaceTeamsLoading) onWorkspaceTeamsRequest({});
	              }
	            };
	            const secretsStorageLocation = String(draftServer.location || "eur3").trim() || "eur3";
  	            const secretsTabContent = React.createElement(React.Fragment, null,
  	              secretsSurface,
  	              React.createElement("div", { className: "playground-database-storage-location-note" },
  	                React.createElement(MapPin, { width: 13, height: 13, strokeWidth: 1.8 }),
  	                "Data is stored in Location ",
  	                React.createElement("strong", null, secretsStorageLocation),
  	                "."
  	              )
  	            );
  	            const secretsEditorTabContent = normalizedSecretsDetailTab === "secrets"
  	              ? secretsTabContent
	              : normalizedSecretsDetailTab === "settings"
	                ? serverSettingsTabContent
	                : serverUsageTabContent;
	            const secretsDetailSidebar = React.createElement(PlatformUiCard, {
	                as: "section",
	                variant: "sidebar",
	                cardTitle: "Properties",
	                className: "playground-project-overview-sidebar-card playground-server-detail-properties-card playground-secrets-detail-properties-card",
	              },
	              React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
	                renderSourceServerSidebarRow("Creator", serverCreatorValue, {
	                  valueClassName: "playground-server-detail-sidebar-identity-cell",
	                }),
	                renderSourceServerSidebarRow("Owner", serverOwnerSelectorControl, {
	                  className: "playground-server-detail-sidebar-owner-row",
	                  valueClassName: "playground-server-detail-sidebar-owner-cell",
	                }),
	                renderSourceServerSidebarRow("Secrets", renderSourceServerSidebarValue(String(totalSecrets))),
	                renderSourceServerSidebarRow("Location", renderSourceServerSidebarValue(secretsStorageLocation)),
	                renderSourceServerSidebarRow("Resource ID",
	                  renderSourceServerSidebarValue(draftServer.id || "Unsaved secrets", "is-id")
	                ),
	                renderSourceServerSidebarRow("Created",
	                  renderSourceServerSidebarValue(formatPlaygroundFileDate(draftServer.createdAt))
	                ),
	                renderSourceServerSidebarRow("Updated",
	                  renderSourceServerSidebarValue(formatPlaygroundFileDate(draftServer.updatedAt))
	                )
	              )
	            );
	            const secretsDetailSidebarCollapsed = Boolean(serverDetailsCollapsed);
	            const secretsDetailSidebarToggle = React.createElement("button", {
	                type: "button",
	                className: "playground-project-overview-sidebar-toggle",
	                onClick: () => setServerDetailsCollapsed((current) => !current),
	                title: secretsDetailSidebarCollapsed ? "Show secrets properties" : "Hide secrets properties",
	                "aria-label": secretsDetailSidebarCollapsed ? "Show secrets properties" : "Hide secrets properties",
	                "aria-pressed": secretsDetailSidebarCollapsed ? "true" : "false",
	              },
	              React.createElement(PanelRight, { width: 15, height: 15, strokeWidth: 1.8 })
	            );
	            const secretsDetailHeader = React.createElement("div", { className: "playground-server-detail-profile-section" },
	              renderServerResourceDetailTitleRow({
	                className: " playground-server-function-title-input playground-secrets-title-input",
	                placeholder: "Secrets",
	                ariaLabel: "Secrets name",
	                readOnly: isServerTemplatePreview,
	              })
	            );
	            const secretsEditorMainClassName = "playground-environments-editor-main playground-tasks-detail-main playground-managed-data-detail-main playground-secrets-detail-main" + (
	              normalizedSecretsDetailTab === "secrets" ? " is-managed-data-list-tab is-secrets-tab" : ""
	            );
	            const secretsEditorScrollClassName = "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" + (
	              normalizedSecretsDetailTab === "secrets" ? " is-secrets-tab" : ""
	            );
	            const secretsDetailContentClassName = "playground-server-detail-content playground-secrets-detail-content" + (
	              normalizedSecretsDetailTab === "secrets" ? " is-managed-data-list-tab is-secrets-tab" : ""
	            );
	            const secretsDetailWorkspace = React.createElement(DevelopServerDetailPage, {
	                header: secretsDetailHeader,
	                tabs: secretsDetailTabs,
	                activeTab: normalizedSecretsDetailTab,
	                onTabChange: handleSecretsDetailTabChange,
	                sidebarToggle: secretsDetailSidebarToggle,
	                sidebar: secretsDetailSidebar,
	                sidebarCollapsed: secretsDetailSidebarCollapsed,
	                sidebarAutoCollapseTabs: ["secrets"],
	                ariaLabel: "Secrets details for " + (draftServer.name || "Untitled secrets resource"),
	                sidebarAriaLabel: (draftServer.name || "Secrets") + " properties",
	                className: "is-secrets-server-detail" + (normalizedSecretsDetailTab === "secrets" ? " is-managed-data-list-tab is-secrets-tab" : ""),
	                contentClassName: secretsDetailContentClassName,
	              },
	              serverSaveState.error
	                ? React.createElement("div", {
	                    className: "playground-environments-error playground-environments-editor-notice",
	                    role: "alert",
	                  }, serverSaveState.error)
	                : null,
	              secretsEditorTabContent
	            );
  
	            return React.createElement(React.Fragment, null,
	              React.createElement("div", { className: secretsEditorMainClassName, ref: serverDetailMainRef },
	                React.createElement("div", { className: secretsEditorScrollClassName }, secretsDetailWorkspace)
	              ),
	              secretComposerModal,
	              serverOwnerTransferModal
	            );
            }
  
            if (isAgentRuntimeServer) {
              const agentRuntimeConfig = getPlaygroundServerAgentRuntimeConfig(draftServer);
              const orderedAgentRuntimeAgentOptions = [...serverAgentOptions].sort((left, right) => String(left?.name || "").localeCompare(String(right?.name || "")));
              const selectedAgentRuntimeAgent = orderedAgentRuntimeAgentOptions.find((agent) => agent.id === agentRuntimeConfig.agentId) || null;
              const resolvedAgentRuntimeEnvironmentId = draftServer.sourceEnvironmentId || defaultAgentRuntimeEnvironmentId;
              const selectedAgentRuntimeEnvironment = orderedEnvironments.find((environment) => environment.id === resolvedAgentRuntimeEnvironmentId)
                || orderedEnvironments.find((environment) => environment.isDefault)
                || orderedEnvironments[0]
                || null;
              const availableAgentRuntimeAgentModes = ["agents", "teams"].filter((mode) =>
                orderedAgentRuntimeAgentOptions.some((agent) => getPlaygroundAgentListMode(agent) === mode)
              );
              const activeAgentRuntimeAgentMode = availableAgentRuntimeAgentModes.includes(serverAgentPickerMode)
                ? serverAgentPickerMode
                : selectedAgentRuntimeAgent && availableAgentRuntimeAgentModes.includes(getPlaygroundAgentListMode(selectedAgentRuntimeAgent))
                  ? getPlaygroundAgentListMode(selectedAgentRuntimeAgent)
                  : (availableAgentRuntimeAgentModes[0] || "agents");
              const filteredAgentRuntimeAgentOptions = orderedAgentRuntimeAgentOptions.filter((agent) =>
                getPlaygroundAgentListMode(agent) === activeAgentRuntimeAgentMode
              );
              const baseAgentRuntimeSkillIds = normalizePlaygroundEnabledSkillIds(selectedAgentRuntimeAgent?.enabledSkills);
              const configuredAgentRuntimeSkillIds = normalizePlaygroundEnabledSkillIds(agentRuntimeConfig.enabledSkills);
              const effectiveAgentRuntimeSkillIds = agentRuntimeConfig.skillsMode === "override"
                ? configuredAgentRuntimeSkillIds
                : baseAgentRuntimeSkillIds;
              function buildAgentRuntimeSkillFallbackName(skillId) {
                return String(skillId || "")
                  .replace(/[_-]+/g, " ")
                  .replace(/\b\w/g, (character) => character.toUpperCase());
              }
              const agentRuntimeSkillOptionsById = {};
              PLAYGROUND_AGENT_SKILL_OPTIONS.forEach((skill) => {
                if (!skill?.id) return;
                agentRuntimeSkillOptionsById[skill.id] = {
                  id: skill.id,
                  name: typeof skill.label === "string" && skill.label.trim() ? skill.label.trim() : skill.id,
                  description: typeof skill.description === "string" ? skill.description : "",
                  icon: null,
                  isCustom: false,
                };
              });
              runtimeCustomSkills.forEach((skill) => {
                const normalizedSkillId = typeof skill?.id === "string" ? skill.id.trim() : "";
                if (!normalizedSkillId) {
                  return;
                }
                agentRuntimeSkillOptionsById[normalizedSkillId] = {
                  id: normalizedSkillId,
                  name: typeof skill?.name === "string" && skill.name.trim()
                    ? skill.name.trim()
                    : agentRuntimeSkillOptionsById[normalizedSkillId]?.name || normalizedSkillId,
                  description: typeof skill?.description === "string"
                    ? skill.description
                    : agentRuntimeSkillOptionsById[normalizedSkillId]?.description || "",
                  icon: typeof skill?.icon === "string" ? skill.icon : null,
                  isCustom: true,
                };
              });
              function resolveAgentRuntimeSkillItem(skillId) {
                const normalizedSkillId = normalizePlaygroundEnabledSkillIds([skillId])[0] || String(skillId || "").trim();
                if (!normalizedSkillId) {
                  return null;
                }
                const option = agentRuntimeSkillOptionsById[normalizedSkillId];
                if (option) {
                  return option;
                }
                return {
                  id: normalizedSkillId,
                  name: buildAgentRuntimeSkillFallbackName(normalizedSkillId),
                  description: "",
                  icon: null,
                  isCustom: !PLAYGROUND_AGENT_SKILL_OPTIONS.some((skill) => skill.id === normalizedSkillId),
                };
              }
              const agentRuntimeSystemSkillItems = [];
              const seenAgentRuntimeSystemSkillIds = new Set();
              function appendAgentRuntimeSystemSkill(skillId) {
                const item = resolveAgentRuntimeSkillItem(skillId);
                if (!item || item.isCustom || seenAgentRuntimeSystemSkillIds.has(item.id)) {
                  return;
                }
                seenAgentRuntimeSystemSkillIds.add(item.id);
                agentRuntimeSystemSkillItems.push(item);
              }
              PLAYGROUND_AGENT_SKILL_OPTIONS.forEach((skill) => appendAgentRuntimeSystemSkill(skill?.id));
              effectiveAgentRuntimeSkillIds.forEach((skillId) => appendAgentRuntimeSystemSkill(skillId));
              const agentRuntimeSystemSkillIdSet = new Set(agentRuntimeSystemSkillItems.map((skill) => skill.id));
              const agentRuntimeCustomSkillItems = [];
              const seenAgentRuntimeCustomSkillIds = new Set();
              function appendAgentRuntimeCustomSkill(skillId) {
                const item = resolveAgentRuntimeSkillItem(skillId);
                if (!item || seenAgentRuntimeCustomSkillIds.has(item.id)) {
                  return;
                }
                if (!item.isCustom && agentRuntimeSystemSkillIdSet.has(item.id)) {
                  return;
                }
                seenAgentRuntimeCustomSkillIds.add(item.id);
                agentRuntimeCustomSkillItems.push({
                  ...item,
                  isCustom: true,
                });
              }
              runtimeCustomSkills.forEach((skill) => appendAgentRuntimeCustomSkill(skill?.id));
              effectiveAgentRuntimeSkillIds.forEach((skillId) => {
                if (!agentRuntimeSystemSkillIdSet.has(skillId)) {
                  appendAgentRuntimeCustomSkill(skillId);
                }
              });
              const agentRuntimeSkillEntries = effectiveAgentRuntimeSkillIds
                .map((skillId) => resolveAgentRuntimeSkillItem(skillId))
                .filter(Boolean);
              function getAgentRuntimeSkillIconComponent(skill) {
                const normalizedCustomIcon = String(skill?.icon || "default").trim().toLowerCase();
                if (skill?.isCustom) {
                  if (normalizedCustomIcon === "sparkles") return Sparkles;
                  if (normalizedCustomIcon === "brain") return Brain;
                  if (normalizedCustomIcon === "zap") return Zap;
                  if (normalizedCustomIcon === "telescope") return Telescope;
                  if (normalizedCustomIcon === "search") return Globe;
                  if (normalizedCustomIcon === "image") return ImageIcon;
                  if (normalizedCustomIcon === "code") return Code;
                  if (normalizedCustomIcon === "terminal") return Terminal;
                  if (normalizedCustomIcon === "file-text") return FileText;
                  if (normalizedCustomIcon === "database") return Database;
                  if (normalizedCustomIcon === "pen-tool") return PenTool;
                  if (normalizedCustomIcon === "palette") return Paintbrush;
                  if (normalizedCustomIcon === "slash") return Slash;
                  if (normalizedCustomIcon === "message") return MessageSquare;
                  if (normalizedCustomIcon === "mail") return Mail;
                  if (normalizedCustomIcon === "calendar") return CalendarIcon;
                  if (normalizedCustomIcon === "calculator") return Calculator;
                  if (normalizedCustomIcon === "shield" || normalizedCustomIcon === "lock") return Shield;
                  if (normalizedCustomIcon === "cloud") return Cloud;
                  if (normalizedCustomIcon === "server") return Server;
                  if (normalizedCustomIcon === "cpu") return Cpu;
                  if (normalizedCustomIcon === "git") return GitCommitHorizontal;
                  if (normalizedCustomIcon === "package") return Package;
                  if (normalizedCustomIcon === "list") return ListTodo;
                  return Wand2;
                }
                if (skill?.id === "image_generation") return ImageIcon;
                if (skill?.id === "video_generation") return Film;
                if (skill?.id === "web_search") return Globe;
                if (skill?.id === "research" || skill?.id === "deep_research") return Telescope;
                if (skill?.id === "pdf") return FileText;
                if (skill?.id === "frontend_design") return Slash;
                if (skill?.id === "pptx") return Layers;
                if (skill?.id === "memory") return Brain;
                if (skill?.id === "task_management") return ListTodo;
                if (skill?.id === "app_platform") return Server;
                if (skill?.id === "computer_agents") return Cpu;
                return Layers;
              }
              function renderAgentRuntimeSkillIcon(skill, className) {
                if (skill?.id === "computer_agents") {
                  return React.createElement("img", {
                    src: RUNNER_TRANSPARENT_LOGO_URL,
                    alt: "",
                    "aria-hidden": "true",
                    draggable: false,
                    className,
                    style: { objectFit: "contain" },
                  });
                }
                const Icon = getAgentRuntimeSkillIconComponent(skill);
                return React.createElement(Icon, { className, strokeWidth: 1.75 });
              }
              const agentRuntimeRuns = Array.isArray(currentServerAgentRuntimeRuns) ? currentServerAgentRuntimeRuns : [];
              const agentRuntimeRunsLoading = loadingServerAgentRuntimeRunsId === draftServer.id;
              const totalRuns = agentRuntimeRuns.length;
              const completedRuns = agentRuntimeRuns.filter((run) => run?.status === "completed").length;
              const failedRuns = agentRuntimeRuns.filter((run) => run?.status === "failed").length;
              const runningRuns = agentRuntimeRuns.filter((run) => run?.status === "running" || run?.status === "queued").length;
              const agentRuntimeSettingsRows = React.createElement("div", { className: "playground-server-detail-fact-rows" },
                renderServerFactRow("Agent",
                  renderServerDetailSelectControl({
                    popoverId: "agent-runtime-agent",
                    valueLabel: selectedAgentRuntimeAgent?.name || agentRuntimeConfig.agentId || "Choose agent",
                    isEmpty: !agentRuntimeConfig.agentId,
                    children: [
                      renderServerDetailSelectOptionRow({
                        key: "agent-runtime-agent:none",
                        label: "None",
                        selected: !agentRuntimeConfig.agentId,
                        onClick: () => {
                          updateServerAgentRuntimeField("agentId", "");
                          setServerDetailSelectPopover("");
                        },
                      }),
                      ...orderedAgentRuntimeAgentOptions.map((agent) =>
                        renderServerDetailSelectOptionRow({
                          key: "agent-runtime-agent:" + agent.id,
                          label: agent.name || agent.id,
                          selected: agentRuntimeConfig.agentId === agent.id,
                          onClick: () => {
                            updateServerAgentRuntimeField("agentId", agent.id);
                            setServerDetailSelectPopover("");
                          },
                        })
                      ),
                    ],
                  })
                ),
                renderServerFactRow("Computer",
                  renderServerDetailSelectControl({
                    popoverId: "agent-runtime-environment",
                    valueLabel: selectedAgentRuntimeEnvironment?.name || resolvedAgentRuntimeEnvironmentId || "No computer available",
                    isEmpty: !selectedAgentRuntimeEnvironment,
                    children: orderedEnvironments.length > 0
                      ? orderedEnvironments.map((environment) =>
                          renderServerDetailSelectOptionRow({
                            key: "agent-runtime-environment:" + environment.id,
                            label: environment.name || "Untitled Computer",
                            selected: resolvedAgentRuntimeEnvironmentId === environment.id,
                            onClick: () => {
                              updateServerField("sourceEnvironmentId", environment.id);
                              setServerDetailSelectPopover("");
                            },
                          })
                        )
                      : [
                          renderServerDetailSelectOptionRow({
                            key: "agent-runtime-environment:empty",
                            label: "No computers available",
                            selected: true,
                            disabled: true,
                          }),
                        ],
                  })
                ),
                renderServerFactRow("Execution",
                  renderServerDetailSelectControl({
                    popoverId: "agent-runtime-execution-mode",
                    valueLabel: agentRuntimeConfig.executionMode === "sync" ? "Sync" : "Async",
                    children: [
                      renderServerDetailSelectOptionRow({
                        key: "agent-runtime-mode:async",
                        label: "Async",
                        description: "Starts a background run and poll its status later.",
                        selected: agentRuntimeConfig.executionMode !== "sync",
                        onClick: () => {
                          updateServerAgentRuntimeField("executionMode", "async");
                          setServerDetailSelectPopover("");
                        },
                      }),
                      renderServerDetailSelectOptionRow({
                        key: "agent-runtime-mode:sync",
                        label: "Sync",
                        description: "Waits for the run to finish before returning.",
                        selected: agentRuntimeConfig.executionMode === "sync",
                        onClick: () => {
                          updateServerAgentRuntimeField("executionMode", "sync");
                          setServerDetailSelectPopover("");
                        },
                      }),
                    ],
                  })
                ),
                renderServerFactRow("Streaming",
                  renderServerDetailSelectControl({
                    popoverId: "agent-runtime-streaming",
                    valueLabel: agentRuntimeConfig.streamingEnabled ? "Enabled" : "Disabled",
                    children: [
                      renderServerDetailSelectOptionRow({
                        key: "agent-runtime-streaming:on",
                        label: "Enabled",
                        selected: agentRuntimeConfig.streamingEnabled !== false,
                        onClick: () => {
                          updateServerAgentRuntimeField("streamingEnabled", true);
                          setServerDetailSelectPopover("");
                        },
                      }),
                      renderServerDetailSelectOptionRow({
                        key: "agent-runtime-streaming:off",
                        label: "Disabled",
                        selected: agentRuntimeConfig.streamingEnabled === false,
                        onClick: () => {
                          updateServerAgentRuntimeField("streamingEnabled", false);
                          setServerDetailSelectPopover("");
                        },
                      }),
                    ],
                  })
                )
              );
  
              const agentRuntimeSkillsSection = React.createElement(PlatformUiCard, {
                  as: "section",
                  className: "playground-environments-section playground-agent-runtime-skills-section",
                  key: "agent-runtime-skills",
                },
                React.createElement("div", { className: "playground-tasks-skills" },
                  React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Skills"),
                    React.createElement("div", {
                      className: "playground-tasks-skills-popup-shell tb-runner-chat",
                      ref: agentRuntimeSkillsActionsRef,
                    },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button playground-tasks-skills-manage-button" + (agentRuntimeSkillsPopoverOpen ? " is-active" : ""),
                        onClick: () => {
                          setServerDetailSelectPopover("");
                          setAgentRuntimeSkillsPopoverOpen((current) => !current);
                        },
                      }, "Manage Skills"),
                      agentRuntimeSkillsPopoverOpen
                        ? React.createElement(PlatformPopupSurface, { className: "tb-popup-menu-skills", animation: "up-in" },
                            React.createElement("div", { className: "tb-popup-attach-topbar" },
                              React.createElement("button", {
                                type: "button",
                                className: "tb-popup-attach-topbar-button tb-popup-attach-topbar-button-close",
                                onClick: () => setAgentRuntimeSkillsPopoverOpen(false),
                                "aria-label": "Close skills popup",
                              }, React.createElement(X, { className: "tb-popup-attach-topbar-icon", strokeWidth: 1.75 })),
                              React.createElement("div", { className: "tb-popup-attach-topbar-title" }, "Skills"),
                              React.createElement("button", {
                                type: "button",
                                className: "tb-popup-attach-topbar-button tb-popup-attach-topbar-button-confirm",
                                onClick: () => setAgentRuntimeSkillsPopoverOpen(false),
                                "aria-label": "Done",
                              }, React.createElement(Check, { className: "tb-popup-attach-topbar-icon", strokeWidth: 2 }))
                            ),
                            React.createElement("div", { className: "tb-popup-panel-section tb-popup-panel-section-attach-header" },
                              React.createElement(PlatformSwitch, {
                                ariaLabel: "Skill source",
                                value: agentRuntimeSkillsTab,
                                options: [
                                  { value: "system", label: "System" },
                                  { value: "custom", label: "Custom" },
                                ],
                                onValueChange: setAgentRuntimeSkillsTab,
                              })
                            ),
                            React.createElement("div", { className: "tb-popup-panel-section tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced tb-popup-panel-section-skills-body" },
                              (agentRuntimeSkillsTab === "system" ? agentRuntimeSystemSkillItems : agentRuntimeCustomSkillItems).map((skill) => {
                                const isEnabled = effectiveAgentRuntimeSkillIds.includes(skill.id);
                                return React.createElement("button", {
                                    key: skill.id,
                                    type: "button",
                                    className: "tb-popup-row tb-popup-row-skill" + (isEnabled ? " selected" : ""),
                                    onClick: () => toggleServerAgentRuntimeSkill(skill.id, baseAgentRuntimeSkillIds),
                                  },
                                    renderAgentRuntimeSkillIcon(skill, "tb-popup-icon"),
                                    React.createElement("span", { className: "tb-popup-label" }, skill.name),
                                    React.createElement("span", { className: "tb-popup-check-slot" },
                                      isEnabled
                                        ? React.createElement(Check, { className: "tb-popup-check", strokeWidth: 1.75 })
                                        : null
                                    )
                                  );
                              }),
                              agentRuntimeSkillsTab === "custom" && runtimeCustomSkillsLoading
                                ? React.createElement("div", { className: "tb-popup-loading-row" },
                                    React.createElement("span", { className: "tb-popup-loading-spinner", "aria-hidden": "true" }),
                                    React.createElement("span", { className: "tb-popup-loading-label" }, "Loading custom skills...")
                                  )
                                : null,
                              agentRuntimeSkillsTab === "custom" && !runtimeCustomSkillsLoading && agentRuntimeCustomSkillItems.length === 0
                                ? React.createElement("div", { className: "tb-popup-empty-state" }, "No custom skills yet.")
                                : null
                            )
                          )
                        : null
                    )
                  ),
                  agentRuntimeSkillEntries.length > 0
                    ? React.createElement("div", { className: "playground-tasks-skills-list" },
                        agentRuntimeSkillEntries.map((skill) =>
                          React.createElement("div", {
                            key: skill.id,
                            className: "playground-tasks-skill-pill",
                            title: skill.name,
                          },
                            renderAgentRuntimeSkillIcon(skill, "playground-tasks-skill-pill-icon"),
                            React.createElement("span", { className: "playground-tasks-skill-pill-label" }, skill.name),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-tasks-skill-pill-remove",
                              onClick: (event) => {
                                event.stopPropagation();
                                toggleServerAgentRuntimeSkill(skill.id, baseAgentRuntimeSkillIds);
                              },
                              "aria-label": "Remove " + skill.name,
                              title: "Remove " + skill.name,
                            }, React.createElement(X, { width: 12, height: 12, strokeWidth: 1.9 }))
                          )
                        )
                      )
                    : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No skills selected.")
                )
              );
              const agentRuntimeSettingsSection = React.createElement("div", { className: "playground-environments-home-metrics playground-server-detail-metrics" },
                React.createElement(PlatformUiCard, { className: "playground-tasks-detail-facts playground-environments-editor-facts playground-server-details-card playground-agent-runtime-settings-card" },
                  React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                    agentRuntimeSettingsRows
                  )
                ),
                agentRuntimeSkillsSection
              );
  
              function openAgentRuntimeRunComposer() {
                setIsServerAgentRuntimeRunPromptEditing(true);
                setServerAgentRuntimeRunComposer({
                  open: true,
                  title: "",
                  prompt: "",
                  mode: agentRuntimeConfig.executionMode === "sync" ? "sync" : "async",
                  error: "",
                  isSubmitting: false,
                });
              }
  
              function closeAgentRuntimeRunComposer() {
                setIsServerAgentRuntimeRunPromptEditing(false);
                setServerAgentRuntimeRunComposer((current) => ({
                  ...current,
                  open: false,
                  error: "",
                }));
              }
  
              const handleAgentRuntimeRunSubmit = async (event) => {
                event.preventDefault();
                const prompt = String(serverAgentRuntimeRunComposer.prompt || "").trim();
                if (!prompt || !draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
                  setServerAgentRuntimeRunComposer((current) => ({
                    ...current,
                    error: prompt ? "Save the agent runtime before starting a run." : "Prompt is required.",
                  }));
                  return;
                }
                const runtimeEnvironmentId = draftServer.sourceEnvironmentId || defaultAgentRuntimeEnvironmentId;
                if (!runtimeEnvironmentId) {
                  setServerAgentRuntimeRunComposer((current) => ({
                    ...current,
                    error: "Select a computer before starting a run.",
                  }));
                  return;
                }
  
                setServerAgentRuntimeRunComposer((current) => ({
                  ...current,
                  error: "",
                  isSubmitting: true,
                }));
  
                try {
                  if (!draftServer.sourceEnvironmentId) {
                    const savedServer = await persistServerRecord(normalizePlaygroundServerRecord({
                      ...draftServer,
                      sourceEnvironmentId: runtimeEnvironmentId,
                      authMode: "private",
                    }));
                    if (savedServer?.id) {
                      upsertLocalServerRecord(savedServer);
                      setDraftServer(savedServer);
                      serverEditorDirtyRef.current = false;
                    }
                  }
                  await createServerAgentRuntimeRun(draftServer.id, {
                    title: String(serverAgentRuntimeRunComposer.title || "").trim(),
                    prompt,
                    mode: serverAgentRuntimeRunComposer.mode === "sync" ? "sync" : "async",
                  });
                  setIsServerAgentRuntimeRunPromptEditing(false);
                  setServerAgentRuntimeRunComposer({
                    open: false,
                    title: "",
                    prompt: "",
                    mode: agentRuntimeConfig.executionMode === "sync" ? "sync" : "async",
                    error: "",
                    isSubmitting: false,
                  });
                } catch (error) {
                  setServerAgentRuntimeRunComposer((current) => ({
                    ...current,
                    error: error instanceof Error ? error.message : "Failed to start run.",
                    isSubmitting: false,
                  }));
                }
              };
  
              const agentRuntimeRunComposerModal = serverAgentRuntimeRunComposer.open
                ? React.createElement(PlatformModalBackdrop, {
                    className: "playground-tasks-project-modal-backdrop playground-agent-runtime-thread-modal-backdrop",
                    onClick: () => {
                      if (!serverAgentRuntimeRunComposer.isSubmitting) {
                        closeAgentRuntimeRunComposer();
                      }
                    },
                  },
                    React.createElement(PlatformModalSurface, {
                        as: "form",
                        className: "playground-tasks-project-modal playground-environment-composer-modal",
                        onClick: (event) => event.stopPropagation(),
                        onSubmit: (event) => void handleAgentRuntimeRunSubmit(event),
                      },
                      React.createElement("div", { className: "playground-tasks-project-modal-top" },
                        React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                          React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                            React.createElement(Bot, { width: 18, height: 18, strokeWidth: 1.9 })
                          ),
                          React.createElement("div", { className: "playground-content-title playground-tasks-project-modal-name-input", style: { display: "flex", alignItems: "center" } }, "New Thread")
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-icon-button playground-tasks-project-modal-close",
                          onClick: closeAgentRuntimeRunComposer,
                          title: "Close",
                          disabled: serverAgentRuntimeRunComposer.isSubmitting,
                        }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                      ),
                      React.createElement("div", { className: "playground-environment-composer-modal-body" },
                        React.createElement("div", { className: "playground-environments-field-grid" },
                          React.createElement("label", { className: "playground-environments-field" },
                            React.createElement("span", { className: "playground-environments-field-label" }, "Title"),
                            React.createElement("input", {
                              type: "text",
                              className: "playground-environments-input",
                              value: serverAgentRuntimeRunComposer.title,
                              onChange: (event) => setServerAgentRuntimeRunComposer((current) => ({
                                ...current,
                                title: event.target.value,
                              })),
                              placeholder: "Optional run title",
                              disabled: serverAgentRuntimeRunComposer.isSubmitting,
                            })
                          ),
                          React.createElement("label", { className: "playground-environments-field" },
                            React.createElement("span", { className: "playground-environments-field-label" }, "Mode"),
                            React.createElement("select", {
                              className: "playground-environments-input",
                              value: serverAgentRuntimeRunComposer.mode,
                              onChange: (event) => setServerAgentRuntimeRunComposer((current) => ({
                                ...current,
                                mode: event.target.value === "sync" ? "sync" : "async",
                              })),
                              disabled: serverAgentRuntimeRunComposer.isSubmitting,
                            },
                              React.createElement("option", { value: "async" }, "Async"),
                              React.createElement("option", { value: "sync" }, "Sync")
                            )
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-modal-description" },
                          React.createElement("div", { className: "playground-tasks-detail-section-header" },
                            React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Prompt"),
                            React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                              [
                                {
                                  id: "bold",
                                  label: "Bold",
                                  icon: Bold,
                                },
                                {
                                  id: "italic",
                                  label: "Italic",
                                  icon: Italic,
                                },
                                {
                                  id: "underline",
                                  label: "Underline",
                                  icon: Underline,
                                },
                                {
                                  id: "list",
                                  label: "List",
                                  icon: List,
                                },
                              ].map((action) =>
                                React.createElement("button", {
                                  key: action.id,
                                  type: "button",
                                  className: "playground-tasks-detail-format-button",
                                  title: action.label,
                                  "aria-label": action.label,
                                  onMouseDown: (event) => event.preventDefault(),
                                  onClick: () => handleServerAgentRuntimeRunPromptFormat(action.id),
                                }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isServerAgentRuntimeRunPromptEditing ? " is-editing" : " is-preview") },
                            !isServerAgentRuntimeRunPromptEditing
                              ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                                  String(serverAgentRuntimeRunComposer.prompt || "").trim()
                                    ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                        content: serverAgentRuntimeRunComposer.prompt,
                                        className: "playground-tasks-detail-description-preview tb-message-markdown",
                                      })
                                    : React.createElement("div", {
                                        className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                      }, "Describe what the agent should do.")
                                )
                              : null,
                            React.createElement("textarea", {
                              ref: serverAgentRuntimeRunPromptTextareaRef,
                              className: "playground-tasks-detail-description-input " + (isServerAgentRuntimeRunPromptEditing ? "is-editing" : "is-preview"),
                              rows: 1,
                              placeholder: isServerAgentRuntimeRunPromptEditing ? "Describe what the agent should do." : "",
                              value: serverAgentRuntimeRunComposer.prompt,
                              disabled: serverAgentRuntimeRunComposer.isSubmitting,
                              onFocus: () => setIsServerAgentRuntimeRunPromptEditing(true),
                              onChange: (event) => {
                                setServerAgentRuntimeRunComposer((current) => ({
                                  ...current,
                                  prompt: event.target.value,
                                }));
                                resizeEnvironmentDescriptionTextarea(event.currentTarget);
                              },
                              onBlur: () => setIsServerAgentRuntimeRunPromptEditing(false),
                            })
                          )
                        )
                      ),
                      serverAgentRuntimeRunComposer.error
                        ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, serverAgentRuntimeRunComposer.error)
                        : null,
                      React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: closeAgentRuntimeRunComposer,
                          disabled: serverAgentRuntimeRunComposer.isSubmitting,
                        }, "Cancel"),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "submit",
                          className: "playground-environments-action-button is-primary",
                          disabled: serverAgentRuntimeRunComposer.isSubmitting || !String(serverAgentRuntimeRunComposer.prompt || "").trim(),
                        }, serverAgentRuntimeRunComposer.isSubmitting ? "Starting..." : "Start Run")
                      )
                    )
                  )
                : null;
  
	            const agentRuntimeRunsSurface = React.createElement(PlatformUiCard, {
	                as: "section",
	                className: "playground-managed-data-list-surface playground-agent-runtime-runs-surface",
	              },
                  serverAgentRuntimeRunsState.message
                    ? React.createElement("div", { className: "playground-environments-editor-notice" }, serverAgentRuntimeRunsState.message)
                    : null,
                  React.createElement(PlatformDataTable, {
                      rows: agentRuntimeRuns,
                      getRowId: (run) => String(run.id || run.threadId || run.createdAt || "thread"),
                      ariaLabel: "Agent runtime threads",
                      className: "playground-managed-data-list-table playground-agent-runtime-platform-table",
                      surface: "plain",
                      variant: "minimalistic-ui",
                      layout: "fill",
                      sticky: false,
                      pagination: {
                        defaultValue: { pageIndex: 0, pageSize: 20 },
                        pageSizeOptions: [20, 50, 100],
                      },
                      selection: {
                        enabled: true,
                        ariaLabel: (run) => "Select " + String(run.title || run.input || "thread"),
                      },
                      loading: agentRuntimeRunsLoading,
                      error: serverAgentRuntimeRunsState.error || null,
                      emptyState: React.createElement("div", { className: "playground-files-state playground-agent-runtime-empty-state" },
                        React.createElement("img", {
                          className: "playground-agent-runtime-empty-state-image",
                          src: "/img/empty-state/no-chats-yet.avif",
                          alt: "",
                          "aria-hidden": "true",
                          draggable: "false",
                        }),
                        React.createElement("span", null, "No threads yet.")
                      ),
                      toolbar: {
                        title: "All Threads",
                        controlsLeading: React.createElement("button", {
                          type: "button",
                          className: "playground-auth-users-refresh-button",
                          onClick: () => {
                            if (draftServer.id) void loadServerAgentRuntimeRuns(draftServer.id, { force: true });
                          },
                          disabled: agentRuntimeRunsLoading || !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                          title: "Refresh threads",
                          "aria-label": "Refresh threads",
                        }, React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 })),
                        search: {
                          placeholder: "Search threads",
                          getSearchText: (run) => [run.title, run.input, run.status, run.mode, run.threadId].filter(Boolean).join(" "),
                        },
                        primaryAction: {
                          label: "New Thread",
                          icon: Plus,
                          onClick: openAgentRuntimeRunComposer,
                          disabled: !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                        },
                      },
                      columns: [
                        {
                          id: "prompt",
                          header: "Prompt",
                          accessor: (run) => run.title || run.input || "Untitled run",
                          width: "minmax(200px, 2fr)",
                          cell: ({ row: run }) => React.createElement("span", {
                            className: "playground-auth-users-cell is-identifier",
                            title: run.title || run.input || "Untitled run",
                          }, String(run.title || run.input || "Untitled run")),
                        },
                        { id: "status", header: "Status", accessor: (run) => String(run.status || "unknown"), width: "minmax(90px, 0.8fr)" },
                        { id: "mode", header: "Mode", accessor: (run) => String(run.mode || "async"), width: "minmax(80px, 0.7fr)", hideBelow: 700 },
                        {
                          id: "started",
                          header: "Started",
                          accessor: (run) => run.createdAt || "",
                          width: "minmax(110px, 0.9fr)",
                          cell: ({ row: run }) => formatPlaygroundFileDate(run.createdAt),
                        },
                        {
                          id: "thread",
                          header: "Thread",
                          accessor: (run) => run.threadId || "",
                          width: "minmax(130px, 1.1fr)",
                          hideBelow: 900,
                          cell: ({ row: run }) => React.createElement("span", { className: "playground-auth-users-cell is-uid", title: run.threadId || "—" }, run.threadId || "—"),
                        },
                      ],
                      getRowActions: (run) => [{
                        id: "cancel",
                        label: "Cancel run",
                        icon: X,
                        hidden: run.status !== "running" && run.status !== "queued",
                        danger: true,
                        onSelect: () => cancelServerAgentRuntimeRun(draftServer.id, run.id),
                      }],
                      onRowActivate: (run) => {
                        if (run.threadId && typeof onThreadOpen === "function") onThreadOpen(run.threadId);
                      },
                      getRowAriaLabel: (run) => run.threadId
                        ? "Open thread " + run.threadId
                        : "Agent runtime run " + String(run.title || run.input || run.id || ""),
                    })
	            );
  
              const normalizedAgentRuntimeDetailTab = ["usage", "settings", "threads"].includes(agentRuntimeDetailTab)
                ? agentRuntimeDetailTab
                : "usage";
              const agentRuntimeDetailTabs = [
                { id: "usage", label: "Usage", icon: ChartColumnIncreasing },
                { id: "threads", label: "Threads", icon: MessageSquare },
                { id: "settings", label: "Settings", icon: Settings },
              ];
              const handleAgentRuntimeDetailTabChange = (nextTab) => {
                setServerOwnerPopoverOpen(false);
                setAgentRuntimeDetailTab(nextTab);
                if (nextTab === "usage" && draftServer.id) {
                  void loadServerAnalytics(draftServer.id, { period: serverDetailChartTimescale });
                }
                if (nextTab === "settings") {
                  if (draftServer.id) void loadServerContext(draftServer.id);
                  if (typeof onWorkspaceTeamsRequest === "function" && !workspaceTeamsLoading) onWorkspaceTeamsRequest({});
                }
              };
              const agentRuntimeStorageLocation = String(draftServer.location || "eur3").trim() || "eur3";
              const agentRuntimeThreadsTabContent = React.createElement(React.Fragment, null,
                agentRuntimeRunsSurface,
                React.createElement("div", { className: "playground-database-storage-location-note" },
                  React.createElement(MapPin, { width: 13, height: 13, strokeWidth: 1.8 }),
                  "Data is stored in Location ",
                  React.createElement("strong", null, agentRuntimeStorageLocation),
                  "."
                )
              );
              const agentRuntimeUsageTabContent = React.createElement(React.Fragment, null,
                serverUsageTabContent,
                functionInvokeSection
              );
              const agentRuntimeSettingsTabContent = serverSettingsPermissionContent || React.createElement("div", {
                  className: "playground-server-settings-tab is-agent-runtime-settings-tab",
                },
                descriptionSection,
                agentRuntimeSettingsSection,
                connectionsSection,
                serverTeamAccessPlatformSection,
                serverDangerSection
              );
              const agentRuntimeEditorTabContent = normalizedAgentRuntimeDetailTab === "threads"
                ? agentRuntimeThreadsTabContent
                : normalizedAgentRuntimeDetailTab === "settings"
                  ? agentRuntimeSettingsTabContent
                  : agentRuntimeUsageTabContent;
              const agentRuntimeDetailSidebar = React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "sidebar",
                  cardTitle: "Properties",
                  className: "playground-project-overview-sidebar-card playground-server-detail-properties-card playground-agent-runtime-detail-properties-card",
                },
                React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                  renderSourceServerSidebarRow("Creator", serverCreatorValue, {
                    valueClassName: "playground-server-detail-sidebar-identity-cell",
                  }),
                  renderSourceServerSidebarRow("Owner", serverOwnerSelectorControl, {
                    className: "playground-server-detail-sidebar-owner-row",
                    valueClassName: "playground-server-detail-sidebar-owner-cell",
                  }),
                  renderSourceServerSidebarRow("Agent",
                    renderSourceServerSidebarValue(selectedAgentRuntimeAgent?.name || agentRuntimeConfig.agentId || "Not selected")
                  ),
                  renderSourceServerSidebarRow("Computer",
                    renderSourceServerSidebarValue(selectedAgentRuntimeEnvironment?.name || "Not selected")
                  ),
                  renderSourceServerSidebarRow("Execution",
                    renderSourceServerSidebarValue(agentRuntimeConfig.executionMode === "sync" ? "Sync" : "Async")
                  ),
                  renderSourceServerSidebarRow("Streaming",
                    React.createElement(PlatformLabel, {
                      variant: agentRuntimeConfig.streamingEnabled === false ? "gray" : "green",
                    }, agentRuntimeConfig.streamingEnabled === false ? "Disabled" : "Enabled")
                  ),
                  renderSourceServerSidebarRow("Runs", renderSourceServerSidebarValue(String(totalRuns))),
                  renderSourceServerSidebarRow("Completed", renderSourceServerSidebarValue(String(completedRuns))),
                  renderSourceServerSidebarRow("Failed", renderSourceServerSidebarValue(String(failedRuns))),
                  renderSourceServerSidebarRow("Running", renderSourceServerSidebarValue(String(runningRuns))),
                  renderSourceServerSidebarRow("Location", renderSourceServerSidebarValue(agentRuntimeStorageLocation)),
                  renderSourceServerSidebarRow("Resource ID",
                    renderSourceServerSidebarValue(draftServer.id || "Unsaved agent runtime", "is-id")
                  ),
                  renderSourceServerSidebarRow("Created",
                    renderSourceServerSidebarValue(formatPlaygroundFileDate(draftServer.createdAt))
                  ),
                  renderSourceServerSidebarRow("Updated",
                    renderSourceServerSidebarValue(formatPlaygroundFileDate(draftServer.updatedAt))
                  )
                )
              );
              const agentRuntimeDetailSidebarCollapsed = Boolean(serverDetailsCollapsed);
              const agentRuntimeDetailSidebarToggle = React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-sidebar-toggle",
                  onClick: () => setServerDetailsCollapsed((current) => !current),
                  title: agentRuntimeDetailSidebarCollapsed ? "Show agent runtime properties" : "Hide agent runtime properties",
                  "aria-label": agentRuntimeDetailSidebarCollapsed ? "Show agent runtime properties" : "Hide agent runtime properties",
                  "aria-pressed": agentRuntimeDetailSidebarCollapsed ? "true" : "false",
                },
                React.createElement(PanelRight, { width: 15, height: 15, strokeWidth: 1.8 })
              );
              const agentRuntimeDetailHeader = React.createElement("div", { className: "playground-server-detail-profile-section" },
                renderServerResourceDetailTitleRow({
                  className: " playground-server-function-title-input playground-agent-runtime-title-input",
                  placeholder: "Agent Runtime",
                  ariaLabel: "Agent runtime name",
                  readOnly: isServerTemplatePreview,
                })
              );
              const agentRuntimeDetailContentClassName = "playground-server-detail-content playground-agent-runtime-detail-content" + (
                normalizedAgentRuntimeDetailTab === "threads" ? " is-managed-data-list-tab is-agent-runtime-threads-tab" : ""
              );
              const agentRuntimeDetailWorkspace = React.createElement(DevelopServerDetailPage, {
                  header: agentRuntimeDetailHeader,
                  tabs: agentRuntimeDetailTabs,
                  activeTab: normalizedAgentRuntimeDetailTab,
                  onTabChange: handleAgentRuntimeDetailTabChange,
                  sidebarToggle: agentRuntimeDetailSidebarToggle,
                  sidebar: agentRuntimeDetailSidebar,
                  sidebarCollapsed: agentRuntimeDetailSidebarCollapsed,
                  sidebarAutoCollapseTabs: ["threads"],
                  ariaLabel: "Agent Runtime details for " + (draftServer.name || "Untitled agent runtime"),
                  sidebarAriaLabel: (draftServer.name || "Agent Runtime") + " properties",
                  className: "is-agent-runtime-server-detail" + (
                    normalizedAgentRuntimeDetailTab === "threads" ? " is-managed-data-list-tab is-agent-runtime-threads-tab" : ""
                  ),
                  contentClassName: agentRuntimeDetailContentClassName,
                },
                serverSaveState.error
                  ? React.createElement("div", {
                      className: "playground-environments-error playground-environments-editor-notice",
                      role: "alert",
                    }, serverSaveState.error)
                  : null,
                serverSaveState.message
                  ? React.createElement("div", {
                      className: "playground-environments-success playground-environments-editor-notice",
                      role: "status",
                    }, serverSaveState.message)
                  : null,
                agentRuntimeEditorTabContent
              );

              return React.createElement(React.Fragment, null,
                React.createElement("div", {
                    className: "playground-environments-editor-main playground-tasks-detail-main playground-managed-data-detail-main playground-agent-runtime-detail-main" + (
                      normalizedAgentRuntimeDetailTab === "threads" ? " is-managed-data-list-tab is-agent-runtime-threads-tab" : ""
                    ),
                    ref: serverDetailMainRef,
                  },
                  React.createElement("div", {
                    className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" + (
                      normalizedAgentRuntimeDetailTab === "threads" ? " is-agent-runtime-threads-tab" : ""
                    ),
                  }, agentRuntimeDetailWorkspace)
                ),
                agentRuntimeRunComposerModal,
                serverOwnerTransferModal
              );
            }

            if (isAuthServer) {
              const authUsers = Array.isArray(currentServerAuthUsers) ? currentServerAuthUsers : [];
              const authUsersLoading = loadingServerAuthUsersId === draftServer.id;
              const renderAuthProviderPill = (providerId) => {
                const tone = getPlaygroundAuthProviderTone(providerId);
                const label = formatPlaygroundAuthProviderLabel(providerId);
                return React.createElement("span", {
                    key: providerId,
                    className: "playground-auth-users-provider-pill is-" + tone,
                    title: label,
                    "aria-label": label,
                  },
                  tone === "email"
                    ? React.createElement(React.Fragment, null,
                        React.createElement(Mail, { width: 11, height: 11, strokeWidth: 2 }),
                        React.createElement("span", null, label)
                      )
                    : label
                );
              };
  
              const authUsersSurface = React.createElement(PlatformUiCard, {
                  as: "section",
                  className: "playground-managed-data-list-surface playground-auth-users-surface",
                },
                  React.createElement(PlatformDataTable, {
                    rows: filteredServerAuthUsers,
                    getRowId: (user) => String(user.uid || getPlaygroundAuthUserIdentifier(user)),
                    ariaLabel: "Authentication users",
                    className: "playground-managed-data-list-table playground-auth-users-platform-table",
                    surface: "plain",
                    variant: "minimalistic-ui",
                    layout: "fill",
                    sticky: false,
                    pagination: {
                      defaultValue: { pageIndex: 0, pageSize: 20 },
                      pageSizeOptions: [20, 50, 100],
                    },
                    selection: {
                      enabled: true,
                      ariaLabel: (user) => "Select " + getPlaygroundAuthUserIdentifier(user),
                    },
                    loading: authUsersLoading,
                    error: serverAuthUsersState.error || null,
                    emptyState: serverAuthSearchQuery.trim() || serverAuthProviderFilter !== "all"
                      ? "No matching users found."
                      : React.createElement("div", { className: "playground-files-state playground-auth-users-empty-state" },
                          React.createElement("img", {
                            className: "playground-auth-users-empty-state-image",
                            src: "/img/empty-state/no-users-yet.avif",
                            alt: "",
                            "aria-hidden": "true",
                            draggable: "false",
                          }),
                          React.createElement("div", { className: "playground-auth-users-empty-state-title" }, "Add your first user"),
                          React.createElement("div", { className: "playground-auth-users-empty-state-copy" }, "Authentication resources manage sign-in identities and access for your app.")
                        ),
                    toolbar: {
                      title: "All Users",
                      filters: [{
                        id: "provider",
                        label: "Provider",
                        value: serverAuthProviderFilter,
                        onChange: setServerAuthProviderFilter,
                        options: [
                          { id: "all", label: "All Users", description: "Show users from every authentication provider." },
                          { id: "email", label: "Email", description: "Show users who sign in with email and password." },
                          { id: "google", label: "Google", description: "Show users connected through Google." },
                          { id: "microsoft", label: "Microsoft", description: "Show users connected through Microsoft." },
                          { id: "github", label: "GitHub", description: "Show users connected through GitHub." },
                          { id: "phone", label: "Phone", description: "Show users who sign in with a phone number." },
                        ],
                      }],
                      search: {
                        value: serverAuthSearchQuery,
                        manual: true,
                        onChange: setServerAuthSearchQuery,
                        placeholder: "Search by email address, phone number, or user UID",
                      },
                      primaryAction: {
                        label: "Add User",
                        icon: Plus,
                        onClick: openServerAuthUserComposer,
                        disabled: !draftServer.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID,
                      },
                    },
                    columns: [
                      {
                        id: "identifier",
                        header: "Identifier",
                        accessor: getPlaygroundAuthUserIdentifier,
                        sortable: true,
                        width: "minmax(180px, 1.5fr)",
                        cell: ({ row: user }) => React.createElement("span", {
                          className: "playground-auth-users-cell is-identifier",
                          title: getPlaygroundAuthUserIdentifier(user),
                        }, getPlaygroundAuthUserIdentifier(user)),
                      },
                      {
                        id: "provider",
                        header: "Provider",
                        accessor: (user) => Array.isArray(user?.providers) ? user.providers.join(" ") : "",
                        sortable: true,
                        width: "minmax(130px, 1fr)",
                        cell: ({ row: user }) => {
                          const providerIds = Array.isArray(user?.providers) && user.providers.length > 0 ? user.providers : (user?.email ? ["password"] : []);
                          return React.createElement("div", { className: "playground-auth-users-provider-list" },
                            providerIds.slice(0, 2).map((providerId) => renderAuthProviderPill(providerId)),
                            providerIds.length > 2
                              ? React.createElement("span", { className: "playground-auth-users-provider-more" }, "+" + String(providerIds.length - 2))
                              : null
                          );
                        },
                      },
                      {
                        id: "created",
                        header: "Created",
                        accessor: (user) => user?.createdAt || "",
                        sortable: true,
                        sortDescFirst: true,
                        width: "minmax(120px, 1fr)",
                        cell: ({ row: user }) => formatPlaygroundExactDate(user?.createdAt),
                      },
                      {
                        id: "signed-in",
                        header: "Signed In",
                        accessor: (user) => user?.lastLoginAt || "",
                        sortable: true,
                        sortDescFirst: true,
                        width: "minmax(120px, 1fr)",
                        hideBelow: 780,
                        cell: ({ row: user }) => formatPlaygroundExactDate(user?.lastLoginAt),
                      },
                      {
                        id: "uid",
                        header: "User UID",
                        accessor: (user) => user?.uid || "",
                        sortable: true,
                        width: "minmax(140px, 1.2fr)",
                        hideBelow: 940,
                        cell: ({ row: user }) => React.createElement("span", { className: "playground-auth-users-cell is-uid", title: user?.uid || "—" }, user?.uid || "—"),
                      },
                    ],
                  })
              );
              const normalizedAuthDetailTab = ["users", "usage", "settings"].includes(authDetailTab) ? authDetailTab : "users";
              const authDetailTabs = [
                { id: "users", label: "Users", icon: Users },
                { id: "usage", label: "Usage", icon: ChartColumnIncreasing },
                { id: "settings", label: "Settings", icon: Settings },
              ];
              const handleAuthDetailTabChange = (nextTab) => {
                setServerOwnerPopoverOpen(false);
                setAuthDetailTab(nextTab);
                if (nextTab === "usage" && draftServer.id) {
                  void loadServerAnalytics(draftServer.id, { period: serverDetailChartTimescale });
                }
                if (nextTab === "settings") {
                  if (draftServer.id) void loadServerContext(draftServer.id);
                  if (typeof onWorkspaceTeamsRequest === "function" && !workspaceTeamsLoading) onWorkspaceTeamsRequest({});
                }
              };
              const authStorageLocation = String(draftServer.location || "eur3").trim() || "eur3";
              const authUsersTabContent = React.createElement(React.Fragment, null,
                authUsersSurface,
                React.createElement("div", { className: "playground-database-storage-location-note" },
                  React.createElement(MapPin, { width: 13, height: 13, strokeWidth: 1.8 }),
                  "Data is stored in Location ",
                  React.createElement("strong", null, authStorageLocation),
                  "."
                )
              );
              const authEditorTabContent = normalizedAuthDetailTab === "users"
                ? authUsersTabContent
                : normalizedAuthDetailTab === "settings"
                  ? serverSettingsTabContent
                  : serverUsageTabContent;
              const authDetailSidebar = React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "sidebar",
                  cardTitle: "Properties",
                  className: "playground-project-overview-sidebar-card playground-server-detail-properties-card playground-auth-detail-properties-card",
                },
                React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                  renderSourceServerSidebarRow("Creator", serverCreatorValue, {
                    valueClassName: "playground-server-detail-sidebar-identity-cell",
                  }),
                  renderSourceServerSidebarRow("Owner", serverOwnerSelectorControl, {
                    className: "playground-server-detail-sidebar-owner-row",
                    valueClassName: "playground-server-detail-sidebar-owner-cell",
                  }),
                  renderSourceServerSidebarRow("Users", renderSourceServerSidebarValue(String(authUsers.length))),
                  renderSourceServerSidebarRow("Location", renderSourceServerSidebarValue(authStorageLocation)),
                  renderSourceServerSidebarRow("Resource ID",
                    renderSourceServerSidebarValue(draftServer.id || "Unsaved authentication", "is-id")
                  ),
                  renderSourceServerSidebarRow("Created",
                    renderSourceServerSidebarValue(formatPlaygroundFileDate(draftServer.createdAt))
                  ),
                  renderSourceServerSidebarRow("Updated",
                    renderSourceServerSidebarValue(formatPlaygroundFileDate(draftServer.updatedAt))
                  )
                )
              );
              const authDetailSidebarCollapsed = Boolean(serverDetailsCollapsed);
              const authDetailSidebarToggle = React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-sidebar-toggle",
                  onClick: () => setServerDetailsCollapsed((current) => !current),
                  title: authDetailSidebarCollapsed ? "Show authentication properties" : "Hide authentication properties",
                  "aria-label": authDetailSidebarCollapsed ? "Show authentication properties" : "Hide authentication properties",
                  "aria-pressed": authDetailSidebarCollapsed ? "true" : "false",
                },
                React.createElement(PanelRight, { width: 15, height: 15, strokeWidth: 1.8 })
              );
              const authDetailHeader = React.createElement("div", { className: "playground-server-detail-profile-section" },
                renderServerResourceDetailTitleRow({
                  className: " playground-server-function-title-input playground-auth-title-input",
                  placeholder: "Authentication",
                  ariaLabel: "Authentication name",
                  readOnly: isServerTemplatePreview,
                })
              );
              const authEditorMainClassName = "playground-environments-editor-main playground-tasks-detail-main playground-managed-data-detail-main playground-auth-detail-main" + (
                normalizedAuthDetailTab === "users" ? " is-managed-data-list-tab is-auth-users-tab" : ""
              );
              const authEditorScrollClassName = "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" + (
                normalizedAuthDetailTab === "users" ? " is-auth-users-tab" : ""
              );
              const authDetailContentClassName = "playground-server-detail-content playground-auth-detail-content" + (
                normalizedAuthDetailTab === "users" ? " is-managed-data-list-tab is-auth-users-tab" : ""
              );
              const authDetailWorkspace = React.createElement(DevelopServerDetailPage, {
                  header: authDetailHeader,
                  tabs: authDetailTabs,
                  activeTab: normalizedAuthDetailTab,
                  onTabChange: handleAuthDetailTabChange,
                  sidebarToggle: authDetailSidebarToggle,
                  sidebar: authDetailSidebar,
                  sidebarCollapsed: authDetailSidebarCollapsed,
                  sidebarAutoCollapseTabs: ["users"],
                  ariaLabel: "Authentication details for " + (draftServer.name || "Untitled authentication"),
                  sidebarAriaLabel: (draftServer.name || "Authentication") + " properties",
                  className: "is-auth-server-detail" + (normalizedAuthDetailTab === "users" ? " is-managed-data-list-tab is-auth-users-tab" : ""),
                  contentClassName: authDetailContentClassName,
                },
                serverSaveState.error
                  ? React.createElement("div", {
                      className: "playground-environments-error playground-environments-editor-notice",
                      role: "alert",
                    }, serverSaveState.error)
                  : null,
                authEditorTabContent
              );

              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: authEditorMainClassName, ref: serverDetailMainRef },
                  React.createElement("div", { className: authEditorScrollClassName }, authDetailWorkspace)
                ),
                serverOwnerTransferModal
              );
            }
  
            const activeSourceFilesSidebar = isSourceDeployableServer ? null : sourceFilesSidebar;
            function renderServerVersionModal() {
              if (!serverVersionModal) {
                return null;
              }
              const title = serverVersionModal.mode === "edit" ? "Edit Version" : "New Version";
              const isSavingVersion = serverSaveState.isSaving || serverVersionState.status === "loading";
              const descriptionFormatActions = [
                { id: "bold", label: "Bold", icon: Bold },
                { id: "italic", label: "Italic", icon: Italic },
                { id: "underline", label: "Underline", icon: Underline },
                { id: "list", label: "List", icon: List },
              ];
              return React.createElement(PlatformModalBackdrop, {
                  className: "playground-tasks-project-modal-backdrop"
                    + (serverVersionModalVisible ? " is-visible" : "")
                    + (serverVersionModalClosing ? " is-closing" : ""),
                  onClick: () => closeServerVersionModal(),
                },
                React.createElement(PlatformModalSurface, {
                    as: "form",
                    className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-agents-version-modal playground-server-version-modal"
                      + (serverVersionModalVisible ? " is-visible" : "")
                      + (serverVersionModalClosing ? " is-closing" : ""),
                    onClick: (event) => event.stopPropagation(),
                    onSubmit: (event) => {
                      event.preventDefault();
                      void commitServerVersionModal();
                    },
                  },
                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                      React.createElement("input", {
                        type: "text",
                        className: "playground-content-title playground-tasks-project-modal-name-input",
                        value: serverVersionNameDraft,
                        onChange: (event) => setServerVersionNameDraft(event.target.value),
                        placeholder: "Version name",
                        autoFocus: true,
                        disabled: isSavingVersion,
                      })
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: () => closeServerVersionModal(),
                      title: "Close",
                      disabled: isSavingVersion,
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-tasks-project-modal-body playground-agents-version-modal-body" },
                    React.createElement("div", { className: "playground-tasks-detail-section-header playground-agents-version-modal-description-header" },
                      React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                      React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                        descriptionFormatActions.map((action) =>
                          React.createElement("button", {
                            key: action.id,
                            type: "button",
                            className: "playground-tasks-detail-format-button",
                            title: action.label,
                            "aria-label": action.label,
                            disabled: isSavingVersion,
                            onMouseDown: (event) => event.preventDefault(),
                            onClick: () => handleServerVersionDescriptionFormat(action.id),
                          }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-detail-description playground-agents-version-modal-description" },
                      !isServerVersionDescriptionEditing
                        ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                            String(serverVersionDescriptionDraft || "").trim()
                              ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                  content: serverVersionDescriptionDraft,
                                  className: "playground-tasks-detail-description-preview tb-message-markdown",
                                })
                              : React.createElement("div", {
                                  className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                }, "Add Description here")
                          )
                        : null,
                      React.createElement("textarea", {
                        ref: serverVersionDescriptionTextareaRef,
                        className: "playground-tasks-detail-description-input " + (isServerVersionDescriptionEditing ? "is-editing" : "is-preview"),
                        rows: 3,
                        placeholder: isServerVersionDescriptionEditing ? "Add Description here" : "",
                        value: serverVersionDescriptionDraft,
                        disabled: isSavingVersion,
                        onFocus: () => setIsServerVersionDescriptionEditing(true),
                        onChange: (event) => {
                          setServerVersionDescriptionDraft(event.target.value);
                          resizeEnvironmentDescriptionTextarea(event.currentTarget);
                        },
                        onBlur: () => setIsServerVersionDescriptionEditing(false),
                      })
                    )
                  ),
                  serverVersionState.error
                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, serverVersionState.error)
                    : null,
                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: () => closeServerVersionModal(),
                      disabled: isSavingVersion,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "submit",
                      className: "playground-environments-action-button is-primary",
                      disabled: isSavingVersion || !String(serverVersionNameDraft || "").trim(),
                    }, isSavingVersion ? "Saving..." : serverVersionModal.mode === "edit" ? "Save" : "Create Version")
                  )
                )
              );
            }

            if (isSourceDeployableServer) {
              return React.createElement(React.Fragment, null,
                sourceServerTopNavActions,
                React.createElement("div", {
                    className: serverEditorMainClassName + " playground-source-server-detail-main",
                    ref: serverDetailMainRef,
                  },
                  React.createElement("div", { className: serverEditorScrollClassName },
                    sourceServerDetailWorkspace
                  ),
                  sourceServerDeploymentStatusBar
                ),
                serverDeploymentHelpModal,
                serverCustomDomainModal,
                serverRuntimePreviewModal,
                renderServerVersionModal(),
                renderServerVersionsSidebarPortal(),
                renderAuthoritativeServerVersionSaveDialog()
              );
            }
  
            return React.createElement(React.Fragment, null,
              React.createElement("div", { className: serverEditorMainClassName, ref: serverDetailMainRef },
                activeSourceFilesSidebar && sourceFilesSidebarTopbar
                  ? React.createElement("div", { className: "playground-servers-editor-layout has-preview" },
                      React.createElement("div", { className: "playground-servers-editor-main-column" },
                        serverMainTopbar,
                        serverEditorScroll,
                        sourceServerDeploymentStatusBar,
                        isSourceDeployableServer ? null : serverBottomBar
                      ),
                      React.createElement("div", { className: "playground-servers-editor-sidebar" },
                        sourceFilesSidebarTopbar,
                        activeSourceFilesSidebar
                      )
                    )
                  : React.createElement(React.Fragment, null,
                      serverMainTopbar,
                      React.createElement("div", { className: serverEditorLayoutClassName },
                        serverEditorScroll
                      ),
                      sourceServerDeploymentStatusBar,
                      isSourceDeployableServer ? null : serverBottomBar
                    )
              ),
              serverDeploymentHelpModal,
              serverCustomDomainModal,
              serverRuntimePreviewModal,
              renderServerVersionModal(),
              renderServerVersionsSidebarPortal()
            );
          }
  

export const APPLIANCE_ADMIN_PAGE_SCRIPT = `          const formatApplianceInteger = (value) => new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 0,
          }).format(Math.max(0, Number(value) || 0));

          const formatApplianceBytes = (value) => {
            const bytes = Math.max(0, Number(value) || 0);
            if (bytes < 1024) return formatApplianceInteger(bytes) + " B";
            const units = ["KB", "MB", "GB", "TB", "PB"];
            let amount = bytes;
            let unitIndex = -1;
            do {
              amount /= 1024;
              unitIndex += 1;
            } while (amount >= 1024 && unitIndex < units.length - 1);
            return new Intl.NumberFormat("en-US", {
              maximumFractionDigits: amount >= 100 ? 0 : 1,
            }).format(amount) + " " + units[unitIndex];
          };

          const formatApplianceUptime = (value) => {
            const seconds = Math.max(0, Number(value) || 0);
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            if (days > 0) return days + "d " + hours + "h";
            const minutes = Math.floor((seconds % 3600) / 60);
            return hours > 0 ? hours + "h " + minutes + "m" : minutes + "m";
          };

          const renderApplianceCapacity = (id, label, capacity) => {
            const totalBytes = Math.max(0, Number(capacity?.totalBytes) || 0);
            const availableBytes = Math.max(0, Number(capacity?.availableBytes) || 0);
            const usedPercent = Math.min(100, Math.max(0, Number(capacity?.usedPercent) || 0));
            return React.createElement("div", { className: "platform-appliance-capacity", key: id },
              React.createElement("div", { className: "platform-appliance-capacity__header" },
                React.createElement("span", { className: "platform-appliance-capacity__label" }, label),
                React.createElement("span", { className: "platform-appliance-capacity__value" },
                  formatApplianceBytes(availableBytes) + " available"
                )
              ),
              React.createElement("div", {
                className: "platform-appliance-capacity__track",
                role: "progressbar",
                "aria-label": label + " used",
                "aria-valuemin": 0,
                "aria-valuemax": 100,
                "aria-valuenow": usedPercent,
              }, React.createElement("span", {
                className: "platform-appliance-capacity__fill",
                style: { width: usedPercent + "%" },
              })),
              React.createElement("div", { className: "platform-appliance-capacity__footer" },
                React.createElement("span", null, usedPercent.toFixed(1) + "% used"),
                React.createElement("span", null, formatApplianceBytes(totalBytes) + " total")
              )
            );
          };

          const renderApplianceOverviewPage = () => {
            if (applianceOverviewLoading && !applianceOverview) {
              return React.createElement(PlatformLoadingState, {
                message: "Loading appliance information...",
                centered: true,
                className: "platform-appliance-overview__loading",
              });
            }
            if (applianceOverviewError && !applianceOverview) {
              return React.createElement(PlatformEmptyState, {
                icon: AlertCircle,
                title: "Appliance information is unavailable",
                description: applianceOverviewError,
                primaryAction: {
                  label: "Retry",
                  icon: RefreshCw,
                  onClick: () => void loadApplianceOverview({ refresh: true }),
                },
              });
            }

            const overview = applianceOverview || {};
            const kpis = [
              { id: "users", label: "Users", value: formatApplianceInteger(overview.users?.total), detail: formatApplianceInteger(overview.users?.active) + " active" },
              { id: "tokens", label: "Inference Tokens", value: formatApplianceInteger(overview.inference?.totalTokens), detail: formatApplianceInteger(overview.inference?.threads) + " threads" },
              { id: "containers", label: "Running Containers", value: overview.containers?.running == null ? "Unavailable" : formatApplianceInteger(overview.containers.running), detail: overview.containers?.total == null ? "Runtime unavailable" : formatApplianceInteger(overview.containers.total) + " managed" },
              { id: "storage", label: "Available Storage", value: formatApplianceBytes(overview.host?.storage?.availableBytes), detail: formatApplianceBytes(overview.host?.storage?.totalBytes) + " total" },
            ];
            const detailRows = [
              ["Runtime", overview.runtime?.status === "available" ? "Available" : "Unavailable"],
              ["Fixed model", overview.deployment?.modelId || "Not configured"],
              ["Release", overview.deployment?.releaseId || "Unknown"],
              ["Architecture", overview.host?.architecture || "Unknown"],
              ["CPU", formatApplianceInteger(overview.host?.cpuCount) + " cores"],
              ["Load average", Number(overview.host?.loadAverage1m || 0).toFixed(2)],
              ["Uptime", formatApplianceUptime(overview.host?.uptimeSeconds)],
            ];

            return React.createElement("section", { className: "platform-appliance-overview" },
              applianceOverviewError
                ? React.createElement("div", { className: "platform-appliance-overview__warning" }, applianceOverviewError)
                : null,
              React.createElement("div", { className: "platform-appliance-overview__metrics" },
                kpis.map((metric) => React.createElement("div", {
                  className: "platform-appliance-metric",
                  key: metric.id,
                },
                  React.createElement("span", { className: "platform-appliance-metric__label" }, metric.label),
                  React.createElement("strong", { className: "platform-appliance-metric__value" }, metric.value),
                  React.createElement("span", { className: "platform-appliance-metric__detail" }, metric.detail)
                ))
              ),
              React.createElement("div", { className: "platform-appliance-overview__grid" },
                React.createElement(PlatformUiCard, { className: "platform-appliance-overview__card" },
                  React.createElement("h3", { className: "platform-appliance-overview__card-title" }, "Host Capacity"),
                  renderApplianceCapacity("memory", "Unified memory", overview.host?.memory),
                  renderApplianceCapacity("storage", "Storage", overview.host?.storage)
                ),
                React.createElement(PlatformUiCard, { className: "platform-appliance-overview__card" },
                  React.createElement("h3", { className: "platform-appliance-overview__card-title" }, "System"),
                  React.createElement("div", { className: "platform-appliance-overview__details" },
                    detailRows.map(([label, value]) => React.createElement("div", {
                      className: "platform-appliance-overview__detail-row",
                      key: label,
                    },
                      React.createElement("span", { className: "platform-appliance-overview__detail-label" }, label),
                      React.createElement("span", { className: "platform-appliance-overview__detail-value" }, value)
                    ))
                  )
                )
              )
            );
          };
`;

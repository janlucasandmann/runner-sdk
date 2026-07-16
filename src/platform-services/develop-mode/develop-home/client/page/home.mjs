export const DEVELOP_HOME_PAGE_SCRIPT_TEMPLATE = `        function formatDevelopOverviewValue(value) {
          const numericValue = Math.max(0, Math.round(Number.isFinite(Number(value)) ? Number(value) : 0));
          if (numericValue >= 1000000) {
            return (numericValue / 1000000).toFixed(numericValue >= 10000000 ? 0 : 1).replace(".0", "") + "M";
          }
          if (numericValue >= 1000) {
            return (numericValue / 1000).toFixed(numericValue >= 10000 ? 0 : 1).replace(".0", "") + "k";
          }
          return numericValue.toLocaleString("en-US");
        }

        function renderDevelopHomePage() {
          const totalUsedCT = readSettingsComputeTokens(settingsUsageSummary?.totals || {}, "totalCT", "totalCost");
          const apiKeyCount = Array.isArray(settingsApiKeys)
            ? settingsApiKeys.filter((key) => !key?.revokedAt).length
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
          const resourceCounts = developServerOperationalMetrics?.resourceCounts || {};
          const metricTotals = developServerOperationalMetrics?.totals || {};
          const metricLabels = Array.isArray(developServerOperationalMetrics?.labels)
            ? developServerOperationalMetrics.labels.map(String)
            : [];
          const readMetricSeries = (key) => {
            const values = developServerOperationalMetrics?.series?.[key];
            return Array.isArray(values) && values.length === metricLabels.length
              ? values.map((value) => Math.max(0, Number(value || 0)))
              : metricLabels.map(() => 0);
          };
          const sumMetricTotals = (keys) => keys.reduce((sum, key) => (
            sum + Math.max(0, Number(metricTotals?.[key] || 0))
          ), 0);
          const sumMetricSeries = (keys) => metricLabels.map((_, index) => (
            keys.reduce((sum, key) => sum + Math.max(0, Number(readMetricSeries(key)?.[index] || 0)), 0)
          ));
          const serverActivityKeys = [
            "hostingRequests",
            "apiRequests",
            "functionCalls",
            "agentRuntimeRuns",
            "voiceCalls",
            "secretReads",
            "authEvents",
            "paymentCheckoutSessions",
          ];
          const databaseActivityKeys = ["databaseReads", "databaseWrites"];
          const resourceDefinitions = [
            {
              id: "web-apps",
              kind: "web_app",
              label: "Web Apps",
              description: "Deploy and operate browser applications.",
              icon: Globe,
              countKey: "webApps",
              activityKeys: ["hostingRequests"],
            },
            {
              id: "apis",
              kind: "api",
              label: "APIs",
              description: "Publish programmatic service endpoints.",
              icon: Code2,
              countKey: "apis",
              activityKeys: ["apiRequests"],
            },
            {
              id: "functions",
              kind: "function",
              label: "Functions",
              description: "Run focused serverless handlers.",
              icon: FunctionSquare,
              countKey: "functions",
              activityKeys: ["functionCalls"],
            },
            {
              id: "databases",
              kind: "database",
              label: "Databases",
              description: "Persist structured application data.",
              icon: Database,
              countKey: "databases",
              activityKeys: databaseActivityKeys,
            },
            {
              id: "authentication",
              kind: "auth",
              label: "Authentication",
              description: "Manage users, sessions, and access.",
              icon: UsersRound,
              countKey: "auth",
              activityKeys: ["authEvents"],
            },
            {
              id: "agent-runtime",
              kind: "agent_runtime",
              label: "Agent Runtime",
              description: "Host persistent agent execution services.",
              icon: Bot,
              countKey: "agentRuntimes",
              activityKeys: ["agentRuntimeRuns"],
            },
            {
              id: "voice-agents",
              kind: "voice_agent",
              label: "Voice Agents",
              description: "Operate realtime conversational agents.",
              icon: AudioLines,
              countKey: "voiceAgents",
              activityKeys: ["voiceCalls"],
            },
            {
              id: "secrets",
              kind: "secrets",
              label: "Secrets",
              description: "Store credentials for deployed resources.",
              icon: Shield,
              countKey: "secrets",
              activityKeys: ["secretReads"],
            },
            {
              id: "payments",
              kind: "payments",
              label: "Payments",
              description: "Accept and observe checkout activity.",
              icon: ReceiptText,
              countKey: "payments",
              activityKeys: ["paymentCheckoutSessions"],
            },
          ];
          const rows = resourceDefinitions.map((definition) => {
            const metricsCount = Number(resourceCounts?.[definition.countKey]);
            const fallbackCount = definition.kind === "database"
              ? 0
              : activeDevelopServerKindCounts[definition.kind] || 0;
            const resourceCount = Math.max(0, Math.round(Number.isFinite(metricsCount) ? metricsCount : fallbackCount));
            const operationCount = sumMetricTotals(definition.activityKeys);
            return {
              ...definition,
              resourceCount,
              resourceCountLabel: formatDevelopOverviewValue(resourceCount),
              operationCount,
              operationCountLabel: formatDevelopOverviewValue(operationCount),
              searchText: [
                definition.label,
                definition.description,
                resourceCount > 0 ? "in use active" : "not in use empty",
              ].join(" "),
            };
          });
          const totalResourceCount = rows.reduce((sum, row) => sum + row.resourceCount, 0);
          const analytics = {
            title: "Develop resource activity",
            ariaLabel: "Develop resource activity over time",
            loading: developServerOperationalMetricsLoading,
            error: developServerOperationalMetricsError || undefined,
            emptyState: "No resource activity yet.",
            labels: metricLabels,
            metrics: [
              { id: "resources", label: "Resources", value: formatDevelopOverviewValue(totalResourceCount), color: "#7effff" },
              { id: "server-operations", label: "Server Operations", value: formatDevelopOverviewValue(sumMetricTotals(serverActivityKeys)), color: "#8fc4ff" },
              { id: "database-operations", label: "Database Operations", value: formatDevelopOverviewValue(sumMetricTotals(databaseActivityKeys)), color: "#6750ff" },
              { id: "errors", label: "Errors", value: formatDevelopOverviewValue(metricTotals?.errors || 0), color: "#f53b3a" },
              { id: "compute-tokens", label: "Compute Tokens", value: formatDevelopOverviewValue(metricTotals?.computeTokens || 0), color: "#9ff6ce" },
            ],
            series: [
              {
                id: "server-operations",
                label: "Server Operations",
                color: "#8fc4ff",
                values: sumMetricSeries(serverActivityKeys),
                type: "line",
              },
              {
                id: "database-operations",
                label: "Database Operations",
                color: "#6750ff",
                values: sumMetricSeries(databaseActivityKeys),
                type: "line",
              },
            ],
          };
          const quickstartLanguages = [
            {
              id: "javascript",
              label: "javascript",
              lines: [
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
            },
            {
              id: "python",
              label: "python",
              lines: [
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
            },
          ];
          const coreConcepts = [
            {
              id: "threads",
              title: "Threads",
              description: "Run work in persistent histories with streaming, editable turns, and resumable state.",
              imageUrl: "/img/001-docs/thread.jpg",
              onClick: () => window.open(__AIOS_ORIGIN__ + "/developers/core-concepts#threads", "_blank", "noopener,noreferrer"),
            },
            {
              id: "computers",
              title: "Computers",
              description: "Give ACP stateful execution machines with runtimes, GUI access, snapshots, and forks.",
              imageUrl: "/img/001-docs/computer.jpg",
              onClick: () => window.open(__AIOS_ORIGIN__ + "/developers/core-concepts#computers", "_blank", "noopener,noreferrer"),
            },
            {
              id: "projects",
              title: "Projects",
              description: "Coordinate mission control, tickets, resources, schedules, and agents in one workspace.",
              imageUrl: "/img/001-docs/projects.jpg",
              onClick: () => window.open(__AIOS_ORIGIN__ + "/developers/core-concepts#projects", "_blank", "noopener,noreferrer"),
            },
          ];
          const rawQuickLinks = [
            {
              id: "create-api-key",
              label: "Create an API Key",
              icon: Key,
              onClick: () => openDevelopApiKeysPage({ openCreateDialog: true }),
            },
            {
              id: "browse-models",
              label: "Browse Models",
              icon: Grid3x3,
              onClick: openModelsPage,
            },
__DEVELOP_HOME_INFERENCE_ENTRY__            {
              id: "webhooks",
              label: "Webhooks",
              icon: Webhook,
              onClick: openDevelopWebhooksPage,
            },
            {
              id: "api-reference",
              label: "API Reference",
              icon: ReceiptText,
              onClick: () => window.open(__DEVELOPERS_URL__, "_blank", "noopener,noreferrer"),
            },
            {
              id: "pricing",
              label: "Pricing Overview",
              icon: Coins,
              onClick: () => window.open(__PRICING_URL__, "_blank", "noopener,noreferrer"),
            },
          ];
          const quickLinks = rawQuickLinks.map((link, index) => ({
            ...link,
            id: String(link.id || "develop-link-" + index),
            icon: link.icon || link.Icon || Circle,
          }));

          return React.createElement(DevelopHomeOverviewPage, {
            rows,
            period: developHomeChartTimescale,
            onPeriodChange: setDevelopHomeChartTimescale,
            analytics,
            controlsPortalId: "playground-develop-overview-controls",
            supplementaryContent: {
              quickstartLanguages,
              activeQuickstartLanguageId: developQuickstartLanguage,
              onQuickstartLanguageChange: setDevelopQuickstartLanguage,
              onOpenQuickstart: () => window.open(__QUICKSTART_URL__, "_blank", "noopener,noreferrer"),
              concepts: coreConcepts,
              onOpenAllConcepts: () => window.open(__CORE_CONCEPTS_URL__, "_blank", "noopener,noreferrer"),
              usageValue: formatSettingsComputeTokens(totalUsedCT),
              resourceCountLabel: String(activeDevelopServers.length) + " resources",
              apiKeyCountLabel: String(apiKeyCount) + " keys",
              onOpenUsage: () => openSettingsModal("costs-overview"),
              onCreateApiKey: () => openDevelopApiKeysPage({ openCreateDialog: true }),
              onOpenResources: () => openResourcesView("servers", { serverKind: "web_app" }),
              onOpenApiKeys: () => openDevelopApiKeysPage(),
              quickLinks,
            },
            onOpen: (row) => openResourcesView("servers", { serverKind: row.kind }),
            onShowUsage: () => openSettingsModal("costs-overview"),
            onOpenPricing: () => window.open(__PRICING_URL__, "_blank", "noopener,noreferrer"),
            onOpenDocumentation: openDocsPage,
          });
        }

        function renderDevelopWebhooksPage() {
          if (settingsSelectedTrigger) {
            return React.createElement("section", { className: "playground-environments-detail playground-plugins-detail playground-develop-webhooks-page" },
              React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                React.createElement("div", { className: "playground-plugins-page" },
                  renderWebhookActionsPanel({ embedded: true, searchQuery: "", showEmbeddedListActions: false })
                )
              )
            );
          }

          const rows = settingsTriggers.map((trigger) => {
            const sourceMeta = getSettingsTriggerSourceMeta(trigger.source);
            const lastTriggeredTimestamp = Date.parse(String(trigger.lastTriggeredAt || ""));
            return {
              id: String(trigger.id || ""),
              name: String(trigger.name || "Webhook"),
              sourceLabel: String(sourceMeta.label || trigger.source || "Webhook"),
              eventLabel: String(trigger.event || "Event"),
              actionLabel: getSettingsTriggerActionLabel(trigger.action),
              enabled: Boolean(trigger.enabled),
              lastTriggeredAt: Number.isFinite(lastTriggeredTimestamp) ? lastTriggeredTimestamp : 0,
              lastTriggeredLabel: trigger.lastTriggeredAt ? formatSettingsDateTime(trigger.lastTriggeredAt) : "Never",
              icon: sourceMeta.icon,
              searchText: [
                trigger.name,
                sourceMeta.label,
                trigger.event,
                getSettingsTriggerActionLabel(trigger.action),
                trigger.enabled ? "active enabled" : "inactive disabled",
              ].filter(Boolean).join(" "),
              raw: trigger,
            };
          });

          return React.createElement(React.Fragment, null,
            React.createElement(DevelopWebhooksOverviewPage, {
              rows,
              controlsPortalId: "playground-develop-webhooks-overview-controls",
              loading: settingsTriggersLoading,
              error: settingsTriggersError,
              successMessage: settingsTriggersSuccess,
              mutatingId: settingsTriggerActionId,
              onOpen: (row) => setSettingsSelectedTriggerId(row.id),
              onCreate: openSettingsTriggerComposer,
              onToggle: (row) => handleSettingsToggleTrigger(row.raw),
              onTest: (row) => handleSettingsTestTrigger(row.raw),
              onDelete: (row) => handleSettingsDeleteTrigger(row.raw),
            }),
            renderWebhookActionsPanel({ composerOnly: true })
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

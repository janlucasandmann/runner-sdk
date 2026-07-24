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
          const resourceDefinitions = [
            {
              id: "web-apps",
              kind: "web_app",
              label: "Web Apps",
              description: "Deploy and operate browser applications.",
              icon: Globe,
            },
            {
              id: "apis",
              kind: "api",
              label: "APIs",
              description: "Publish programmatic service endpoints.",
              icon: Code2,
            },
            {
              id: "functions",
              kind: "function",
              label: "Functions",
              description: "Run focused serverless handlers.",
              icon: FunctionSquare,
            },
            {
              id: "databases",
              kind: "database",
              label: "Databases",
              description: "Persist structured application data.",
              icon: Database,
            },
            {
              id: "authentication",
              kind: "auth",
              label: "Authentication",
              description: "Manage users, sessions, and access.",
              icon: UsersRound,
            },
            {
              id: "agent-runtime",
              kind: "agent_runtime",
              label: "Agent Runtime",
              description: "Host persistent agent execution services.",
              icon: Bot,
            },
            {
              id: "voice-agents",
              kind: "voice_agent",
              label: "Voice Agents",
              description: "Operate realtime conversational agents.",
              icon: AudioLines,
            },
            {
              id: "secrets",
              kind: "secrets",
              label: "Secrets",
              description: "Store credentials for deployed resources.",
              icon: Vault,
            },
            {
              id: "payments",
              kind: "payments",
              label: "Payments",
              description: "Accept and observe checkout activity.",
              icon: ReceiptText,
            },
          ];
          const rows = resourceDefinitions.map((definition) => {
            const resourceCount = Math.max(0, Math.round(activeDevelopServerKindCounts[definition.kind] || 0));
            return {
              ...definition,
              resourceCount,
              resourceCountLabel: formatDevelopOverviewValue(resourceCount),
              operationCount: 0,
              operationCountLabel: "0",
              searchText: [
                definition.label,
                definition.description,
                resourceCount > 0 ? "in use active" : "not in use empty",
              ].join(" "),
            };
          });
          const rawQuickLinks = [
            {
              id: "create-api-key",
              label: "Create an API Key",
              description: "Authenticate requests from your applications and development tools.",
              icon: Key,
              onClick: () => openDevelopApiKeysPage({ openCreateDialog: true }),
            },
            {
              id: "browse-models",
              label: "Browse Models",
              description: "Compare available models, capabilities, context, and pricing.",
              icon: Grid3x3,
              onClick: openModelsPage,
            },
__DEVELOP_HOME_INFERENCE_ENTRY__            {
              id: "webhooks",
              label: "Webhooks",
              description: "Connect external events to platform actions and agent workflows.",
              icon: Webhook,
              onClick: openDevelopWebhooksPage,
            },
          ];
          const quickLinks = rawQuickLinks.map((link, index) => ({
            ...link,
            id: String(link.id || "develop-link-" + index),
            icon: link.icon || link.Icon || Circle,
            description: link.description || (
              link.label === "Configure Inference"
                ? "Route models through organization-managed or local inference endpoints."
                : undefined
            ),
          }));

          return React.createElement(DevelopHomeOverviewPage, {
            rows,
            supplementaryContent: {
              onOpenQuickstart: () => window.open(__QUICKSTART_URL__, "_blank", "noopener,noreferrer"),
              onOpenAllConcepts: () => window.open(__CORE_CONCEPTS_URL__, "_blank", "noopener,noreferrer"),
              quickLinks,
            },
            onOpen: (row) => openResourcesView("servers", { serverKind: row.kind }),
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
  const inferenceEntry =
    typeof options.inferenceEntry === "string" ? options.inferenceEntry : "";
  return DEVELOP_HOME_PAGE_SCRIPT_TEMPLATE.replace(
    "__DEVELOP_HOME_INFERENCE_ENTRY__",
    inferenceEntry,
  )
    .replaceAll("__PRICING_URL__", JSON.stringify(aiosOrigin + "/pricing"))
    .replaceAll(
      "__QUICKSTART_URL__",
      JSON.stringify(aiosOrigin + "/developers/quickstart"),
    )
    .replaceAll(
      "__CORE_CONCEPTS_URL__",
      JSON.stringify(aiosOrigin + "/developers/core-concepts"),
    );
}

export const API_KEYS_LEGACY_CARD_SCRIPT = `        function renderSettingsApiKeyCard(apiKeyRecord, options = {}) {
          const isManaged = !!options.managed;
          const createdBy = typeof apiKeyRecord?.metadata?.createdBy === "string"
            ? apiKeyRecord.metadata.createdBy
            : "";
          const keyPreview = String(apiKeyRecord?.keyPrefix || "key") + "••••••••••••••••••••••••••••••••";

          return React.createElement("div", {
              key: apiKeyRecord.id,
              className: "playground-settings-api-key-card" + (apiKeyRecord?.isActive ? "" : " is-revoked"),
            },
              React.createElement("div", { className: "playground-settings-api-key-header" },
                React.createElement("div", { className: "playground-settings-api-key-title-wrap" },
                  React.createElement("div", { className: "playground-settings-api-key-badges" },
                    React.createElement("span", { className: "playground-settings-api-key-name" }, apiKeyRecord.name || (isManaged ? "System key" : "Developer key")),
                    !apiKeyRecord?.isActive
                      ? React.createElement("span", { className: "playground-settings-api-key-badge is-danger" }, "Revoked")
                      : null,
                    React.createElement("span", { className: "playground-settings-api-key-badge is-neutral" }, apiKeyRecord.keyType || "standard"),
                    !isManaged
                      ? React.createElement("span", { className: "playground-settings-api-key-badge is-primary" }, getSettingsApiKeyScopeLabel(apiKeyRecord.permissions))
                      : null
                  ),
                  apiKeyRecord.description
                    ? React.createElement("p", { className: "playground-settings-api-key-description" }, apiKeyRecord.description)
                    : null,
                  isManaged
                    ? React.createElement("p", { className: "playground-settings-api-key-managed-copy" },
                        "Managed automatically for app and web access" + (createdBy ? " via " + createdBy : "") + "."
                      )
                    : null
                ),
                !isManaged && apiKeyRecord?.isActive
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-settings-api-key-revoke",
                      disabled: settingsRevokingKeyId === apiKeyRecord.id,
                      onClick: () => {
                        void handleSettingsRevokeApiKey(apiKeyRecord.id);
                      },
                    }, settingsRevokingKeyId === apiKeyRecord.id
                      ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-settings-records-spinner" })
                      : React.createElement("span", null, "Revoke"))
                  : null
              ),
              React.createElement("code", { className: "playground-settings-api-key-preview" }, keyPreview),
              apiKeyRecord?.usageStats
                ? React.createElement("div", { className: "playground-settings-api-key-stats" },
                    React.createElement("div", { className: "playground-settings-api-key-stat" },
                      React.createElement("div", { className: "playground-settings-api-key-stat-label" }, "24h Requests"),
                      React.createElement("div", { className: "playground-settings-api-key-stat-value" }, String(apiKeyRecord.usageStats.last24h?.totalRequests || 0))
                    ),
                    React.createElement("div", { className: "playground-settings-api-key-stat" },
                      React.createElement("div", { className: "playground-settings-api-key-stat-label" }, "30d Requests"),
                      React.createElement("div", { className: "playground-settings-api-key-stat-value" }, String(apiKeyRecord.usageStats.last30d?.totalRequests || 0))
                    ),
                    React.createElement("div", { className: "playground-settings-api-key-stat" },
                      React.createElement("div", { className: "playground-settings-api-key-stat-label" }, "30d Success"),
                      React.createElement("div", { className: "playground-settings-api-key-stat-value" }, String(Math.round(apiKeyRecord.usageStats.last30d?.successRate || 0)) + "%")
                    )
                  )
                : null,
              React.createElement("div", { className: "playground-settings-api-key-meta" },
                React.createElement("span", null, "Created: " + formatSettingsDate(apiKeyRecord.createdAt)),
                apiKeyRecord?.lastUsedAt
                  ? React.createElement("span", null, "Last used: " + formatSettingsDate(apiKeyRecord.lastUsedAt))
                  : null,
                apiKeyRecord?.expiresAt
                  ? React.createElement("span", null, "Expires: " + formatSettingsDate(apiKeyRecord.expiresAt))
                  : null,
                apiKeyRecord?.usageStats?.lifetime
                  ? React.createElement("span", null, "Lifetime requests: " + String(apiKeyRecord.usageStats.lifetime.totalRequests || 0))
                  : null
              )
            );
        }

`;

export const API_KEYS_LEGACY_SETTINGS_CASE_SCRIPT = `            case "api": {
              const visibleApiKeys = settingsApiKeys.filter((apiKeyRecord) => apiKeyRecord?.isActive !== false);
              const getSettingsApiKeyCreatorLabel = (apiKeyRecord) => typeof apiKeyRecord?.createdByLabel === "string" && apiKeyRecord.createdByLabel
                ? apiKeyRecord.createdByLabel
                : typeof apiKeyRecord?.metadata?.userEmail === "string" && apiKeyRecord.metadata.userEmail
                  ? apiKeyRecord.metadata.userEmail
                  : typeof apiKeyRecord?.metadata?.createdBy === "string" && apiKeyRecord.metadata.createdBy
                    ? apiKeyRecord.metadata.createdBy
                    : "—";
              const apiKeysListContent = React.createElement(PlatformDataTable, {
                rows: visibleApiKeys,
                getRowId: (apiKeyRecord) => String(apiKeyRecord.id),
                ariaLabel: "API keys",
                className: "playground-settings-api-keys-platform-table",
                surface: "plain",
                sticky: false,
                loading: settingsApiKeysLoading,
                emptyState: renderSettingsEmptyState(Code, "No API keys yet", "Create an API key to start using the computer-agents API"),
                columns: [
                  {
                    id: "name",
                    header: "Name",
                    accessor: (apiKeyRecord) => apiKeyRecord.name || "API Key",
                    width: "minmax(160px, 1fr)",
                    cell: ({ row: apiKeyRecord }) => React.createElement("div", { className: "playground-settings-api-keys-name-row" },
                      React.createElement("span", { className: "playground-settings-api-keys-name" }, apiKeyRecord.name || "API Key"),
                      apiKeyRecord?.isCurrentDefault
                        ? React.createElement("span", { className: "playground-settings-api-keys-pill" }, "standard")
                        : null
                    ),
                  },
                  {
                    id: "secret",
                    header: "Secret key",
                    accessor: (apiKeyRecord) => String(apiKeyRecord?.keyPrefix || "key") + "••••",
                    width: "minmax(120px, 0.72fr)",
                  },
                  {
                    id: "created",
                    header: "Created",
                    accessor: (apiKeyRecord) => Date.parse(String(apiKeyRecord.createdAt || "")) || 0,
                    width: "minmax(100px, 0.62fr)",
                    cell: ({ row: apiKeyRecord }) => formatSettingsDate(apiKeyRecord.createdAt),
                  },
                  {
                    id: "last-used",
                    header: "Last used",
                    accessor: (apiKeyRecord) => Date.parse(String(apiKeyRecord.lastUsedAt || "")) || 0,
                    width: "minmax(100px, 0.62fr)",
                    hideBelow: 820,
                    cell: ({ row: apiKeyRecord }) => apiKeyRecord?.lastUsedAt ? formatSettingsDate(apiKeyRecord.lastUsedAt) : "Never",
                  },
                  {
                    id: "created-by",
                    header: "Created by",
                    accessor: getSettingsApiKeyCreatorLabel,
                    width: "minmax(130px, 0.8fr)",
                    hideBelow: 980,
                  },
                  {
                    id: "permissions",
                    header: "Permissions",
                    accessor: (apiKeyRecord) => getSettingsApiKeyScopeLabel(apiKeyRecord.permissions),
                    width: "minmax(120px, 0.72fr)",
                    hideBelow: 680,
                  },
                ],
                getRowActions: (apiKeyRecord) => apiKeyRecord?.canRevoke !== false && apiKeyRecord?.isActive
                  ? [{
                      id: "revoke",
                      label: settingsRevokingKeyId === apiKeyRecord.id ? "Revoking" : "Revoke key",
                      icon: settingsRevokingKeyId === apiKeyRecord.id ? Loader2 : Trash2,
                      danger: true,
                      disabled: settingsRevokingKeyId === apiKeyRecord.id,
                      onSelect: () => void handleSettingsRevokeApiKey(apiKeyRecord.id),
                    }]
                  : [],
              });

              const apiKeyDialogContent = settingsApiKeyDialogOpen
                ? React.createElement(PlatformModalBackdrop, {
                    className: "playground-tasks-project-modal-backdrop playground-settings-api-key-modal-backdrop",
                    onClick: () => setSettingsApiKeyDialogOpen(false),
                  },
                    React.createElement(PlatformModalSurface, {
                        as: "form",
                        className: "playground-tasks-project-modal playground-agent-composer-modal playground-settings-api-key-modal",
                        onClick: (event) => event.stopPropagation(),
                        onSubmit: (event) => {
                          event.preventDefault();
                          void handleSettingsCreateApiKey();
                        },
                      },
                      React.createElement("div", { className: "playground-tasks-project-modal-top playground-settings-api-key-modal-top" },
                        React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                          React.createElement("span", {
                            className: "playground-tasks-project-modal-icon-trigger",
                            "aria-hidden": "true",
                          }, React.createElement(Code, { width: 18, height: 18, strokeWidth: 1.9 })),
                          React.createElement("div", { className: "playground-settings-api-key-modal-title-shell" },
                            React.createElement("div", { className: "playground-settings-api-key-modal-title" }, "Create API Key"),
                            React.createElement("div", { className: "playground-settings-api-key-modal-subtitle" }, "Create a scoped key for SDKs, automation, or external apps.")
                          )
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-icon-button playground-tasks-project-modal-close",
                          onClick: () => setSettingsApiKeyDialogOpen(false),
                          title: "Close",
                        }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                      ),
                      React.createElement("div", { className: "playground-agent-composer-modal-body playground-settings-api-key-modal-body" },
                        React.createElement("div", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Name *"),
                          React.createElement("input", {
                            id: "settings-new-key-name",
                            className: "playground-environments-input",
                            value: settingsNewKeyName,
                            onChange: (event) => setSettingsNewKeyName(event.target.value),
                            placeholder: "e.g., Development Key",
                            autoFocus: true,
                          })
                        ),
                        React.createElement("div", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Description (optional)"),
                          React.createElement("textarea", {
                            id: "settings-new-key-description",
                            className: "playground-tasks-project-modal-textarea",
                            value: settingsNewKeyDescription,
                            onChange: (event) => setSettingsNewKeyDescription(event.target.value),
                            placeholder: "e.g., For local development and testing",
                          })
                        ),
                        React.createElement("div", { className: "playground-tasks-project-modal-field" },
                          React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Permissions"),
                          React.createElement("div", { className: "playground-settings-api-key-modal-scopes" },
                            Object.entries(SETTINGS_API_KEY_SCOPE_PRESETS).map(([presetId, preset]) =>
                              React.createElement("button", {
                                  key: presetId,
                                  type: "button",
                                  className: "playground-settings-scope-option" + (settingsNewKeyScopePreset === presetId ? " is-active" : ""),
                                  onClick: () => setSettingsNewKeyScopePreset(presetId),
                                },
                                  React.createElement("div", { className: "playground-settings-emphasis" }, preset.label),
                                  React.createElement("div", { className: "playground-settings-muted-copy" }, preset.description)
                                )
                            )
                          )
                        ),
                        settingsApiKeysError
                          ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, settingsApiKeysError)
                          : null,
                        React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-action-button",
                            onClick: () => setSettingsApiKeyDialogOpen(false),
                            disabled: settingsCreateKeyLoading,
                          }, "Cancel"),
                          React.createElement(PlatformPrimaryButton, {
                            size: "medium",
                            type: "submit",
                            className: "playground-environments-action-button is-primary",
                            disabled: settingsCreateKeyLoading || !String(settingsNewKeyName || "").trim(),
                          }, settingsCreateKeyLoading
                            ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-settings-records-spinner" })
                            : "Create Key")
                        )
                      )
                    )
                  )
                : null;

              const apiKeyDialog = apiKeyDialogContent
                ? ((typeof document !== "undefined" && document.body)
                    ? createPortal(apiKeyDialogContent, document.body)
                    : apiKeyDialogContent)
                : null;

              detailContent = React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-settings-plans-navbar" },
                  React.createElement("div", { className: "playground-environments-editor-navbar-title" },
                    React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                      React.createElement("div", { className: "playground-settings-plans-title" }, "API Keys")
                    )
                  ),
                  React.createElement("div", { className: "playground-content-nav-center" }),
                  React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button",
                      onClick: () => setSettingsApiKeyDialogOpen(true),
                      title: "Create API key",
                      "aria-label": "Create API key",
                    }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }))
                  )
                ),
                React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                  React.createElement("div", { className: "playground-settings-account-shell is-wide" },
                    settingsNewlyCreatedKey
                      ? React.createElement("div", { className: "playground-settings-created-key-notice" },
                          React.createElement("div", { className: "playground-settings-created-key-row" },
                            React.createElement("div", { style: { minWidth: 0, flex: "1 1 auto" } },
                              React.createElement("p", { className: "playground-settings-created-key-title" }, "API Key Created Successfully"),
                              React.createElement("p", { className: "playground-settings-created-key-copy" }, "Copy this key now. You won't be able to see it again!"),
                              React.createElement("div", { className: "playground-settings-code-row" },
                                React.createElement("code", { className: "playground-settings-code" }, settingsNewlyCreatedKey),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-settings-icon-button",
                                  onClick: () => {
                                    void handleSettingsCopyField(settingsNewlyCreatedKey, "new-key");
                                  },
                                  title: "Copy to clipboard",
                                }, settingsCopiedField === "new-key"
                                  ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                                  : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8 }))
                              )
                            ),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-settings-icon-button",
                              onClick: () => setSettingsNewlyCreatedKey(""),
                            }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.8 }))
                          )
                        )
                      : null,
                    renderSettingsInlineStatus("error", settingsApiKeysError),
                    apiKeysListContent,
                    apiKeyDialog
                  )
                )
              );
              break;
            }
`;

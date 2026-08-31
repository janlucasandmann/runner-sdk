export const API_KEYS_LEGACY_SETTINGS_CASE_SCRIPT = `            case "api": {
              const visibleApiKeys = settingsApiKeys.filter((apiKeyRecord) => apiKeyRecord?.isActive !== false);
              const getSettingsApiKeyCreatorLabel = (apiKeyRecord) => typeof apiKeyRecord?.createdByLabel === "string" && apiKeyRecord.createdByLabel
                ? apiKeyRecord.createdByLabel
                : typeof apiKeyRecord?.metadata?.userEmail === "string" && apiKeyRecord.metadata.userEmail
                  ? apiKeyRecord.metadata.userEmail
                  : typeof apiKeyRecord?.metadata?.createdBy === "string" && apiKeyRecord.metadata.createdBy
                    ? apiKeyRecord.metadata.createdBy
                    : "—";
              const openSettingsApiKeyRevealModal = async (apiKeyRecord) => {
                const keyId = String(apiKeyRecord?.id || "").trim();
                if (!keyId) return;
                const locallyAvailableKey = String(
                  settingsRevealableApiKeys[keyId]
                  || (apiKeyRecord?.isCurrentDefault ? resolvedSessionApiKey : "")
                  || ""
                ).trim();
                setSettingsApiKeyRevealModal({
                  apiKeyRecord,
                  key: locallyAvailableKey,
                  loading: !locallyAvailableKey,
                  error: "",
                });
                if (locallyAvailableKey) return;
                try {
                  const response = await fetch("/api/aios/user/api-keys/" + encodeURIComponent(keyId) + "/reveal", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                  });
                  const data = await response.json().catch(() => ({}));
                  if (!response.ok) {
                    throw new Error(data?.message || data?.error || "Failed to reveal API key.");
                  }
                  const revealedKey = typeof data?.key === "string" ? data.key.trim() : "";
                  if (!revealedKey) throw new Error("The API key value is unavailable.");
                  setSettingsRevealableApiKeys((current) => ({ ...current, [keyId]: revealedKey }));
                  setSettingsApiKeyRevealModal((current) => String(current?.apiKeyRecord?.id || "") === keyId
                    ? { ...current, key: revealedKey, loading: false, error: "" }
                    : current);
                } catch (error) {
                  setSettingsApiKeyRevealModal((current) => String(current?.apiKeyRecord?.id || "") === keyId
                    ? {
                        ...current,
                        loading: false,
                        error: error instanceof Error ? error.message : "Failed to reveal API key.",
                      }
                    : current);
                }
              };
              const apiKeysListContent = React.createElement(PlatformDataTable, {
                rows: visibleApiKeys,
                getRowId: (apiKeyRecord) => String(apiKeyRecord.id),
                ariaLabel: "API keys",
                className: "playground-settings-api-keys-platform-table",
                surface: "plain",
                layout: "fill",
                variant: "minimalistic-ui",
                sticky: false,
                pagination: false,
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
                getRowActions: (apiKeyRecord) => [
                  {
                    id: "show",
                    label: "Show API key",
                    icon: Eye,
                    onSelect: () => void openSettingsApiKeyRevealModal(apiKeyRecord),
                  },
                  {
                    id: "delete",
                    label: settingsRevokingKeyId === apiKeyRecord.id ? "Deleting" : "Delete",
                    icon: settingsRevokingKeyId === apiKeyRecord.id ? Loader2 : Trash2,
                    danger: true,
                    separatorBefore: true,
                    disabled: apiKeyRecord?.canRevoke === false || settingsRevokingKeyId === apiKeyRecord.id,
                    onSelect: () => void handleSettingsRevokeApiKey(apiKeyRecord.id),
                  },
                ],
                getRowAriaLabel: (apiKeyRecord) => apiKeyRecord.name || "API Key",
              });

              const apiKeyRevealDialog = React.createElement(PlatformModal, {
                  open: Boolean(settingsApiKeyRevealModal),
                  portal: true,
                  title: settingsApiKeyRevealModal?.apiKeyRecord?.name || "API Key",
                  onClose: () => setSettingsApiKeyRevealModal(null),
                  size: "medium",
                  className: "platform-api-key-management-modal playground-api-key-reveal-modal",
                  closeButtonLabel: "Close API key",
                },
                settingsApiKeyRevealModal?.loading
                  ? React.createElement(PlatformLoadingState, {
                      message: "Loading API key...",
                      centered: true,
                    })
                  : settingsApiKeyRevealModal?.key
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-settings-code-row" },
                          React.createElement("input", {
                            type: "text",
                            className: "playground-settings-code playground-settings-code-input",
                            value: settingsApiKeyRevealModal.key,
                            readOnly: true,
                            "aria-label": "API key",
                          }),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-settings-icon-button playground-settings-code-copy",
                            onClick: () => void handleSettingsCopyField(settingsApiKeyRevealModal.key, "settings-revealed-api-key"),
                            title: "Copy API key",
                            "aria-label": "Copy API key",
                          }, settingsCopiedField === "settings-revealed-api-key"
                            ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" })
                            : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }))
                        ),
                        React.createElement("p", { className: "platform-api-key-management-modal__notice" }, "Keep this key private. Anyone with it can access resources allowed by its permissions.")
                      )
                    : React.createElement("p", {
                        className: "platform-api-key-management-modal__error",
                        role: "alert",
                      }, settingsApiKeyRevealModal?.error || "The API key value is unavailable.")
              );

              const apiKeyDialog = React.createElement(ApiKeyCreateDialog, {
                open: settingsApiKeyDialogOpen,
                submitting: settingsCreateKeyLoading,
                error: settingsApiKeysError,
                onClose: () => {
                  if (!settingsCreateKeyLoading) {
                    setSettingsApiKeyDialogOpen(false);
                  }
                },
                onSubmit: (input) => handleSettingsCreateApiKey(input),
              });

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
                      onClick: () => {
                        setSettingsApiKeysError("");
                        setSettingsApiKeyDialogOpen(true);
                      },
                      title: "Create API key",
                      "aria-label": "Create API key",
                    }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }))
                  )
                ),
                React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                  React.createElement("div", { className: "playground-settings-account-shell is-wide" },
                    isEmbeddedSettingsPage
                      ? React.createElement("div", { className: "playground-shell-settings-modal-api-keys-header" },
                          React.createElement("h2", { className: "playground-shell-settings-modal-page-title" }, "API Keys"),
                          React.createElement(PlatformPrimaryButton, {
                            size: "small",
                            type: "button",
                            onClick: () => {
                              setSettingsApiKeysError("");
                              setSettingsApiKeyDialogOpen(true);
                            },
                          },
                            React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                            React.createElement("span", null, "Create API key")
                          )
                        )
                      : null,
                    settingsNewlyCreatedKey
                      ? React.createElement("div", { className: "playground-settings-created-key-notice" },
                          React.createElement("div", { className: "playground-settings-created-key-row" },
                            React.createElement("div", { style: { minWidth: 0, flex: "1 1 auto" } },
                              React.createElement("p", { className: "playground-settings-created-key-title" }, "API Key Created Successfully"),
                              React.createElement("p", { className: "playground-settings-created-key-copy" }, "Copy this key now. You won't be able to see it again!"),
                              React.createElement("div", { className: "playground-settings-created-key-secret" },
                                React.createElement("code", { className: "playground-settings-code playground-settings-created-key-value" }, settingsNewlyCreatedKey),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-settings-icon-button playground-settings-created-key-copy-button",
                                  onClick: () => {
                                    void handleSettingsCopyField(settingsNewlyCreatedKey, "new-key");
                                  },
                                  title: "Copy to clipboard",
                                  "aria-label": "Copy newly created API key",
                                }, settingsCopiedField === "new-key"
                                  ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                                  : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8 }))
                              )
                            ),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-settings-icon-button playground-settings-created-key-dismiss-button",
                              onClick: () => setSettingsNewlyCreatedKey(""),
                              "aria-label": "Dismiss created API key",
                            }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.8 }))
                          )
                        )
                      : null,
                    renderSettingsInlineStatus("error", settingsApiKeysError),
                    apiKeysListContent,
                    apiKeyDialog,
                    apiKeyRevealDialog
                  )
                )
              );
              break;
            }
`;

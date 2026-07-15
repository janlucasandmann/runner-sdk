export const API_KEYS_MANAGEMENT_PAGE_SCRIPT = `        function renderApiKeysManagementPanel() {
          const normalizedApiKeySearchQuery = String(developApiKeysSearchQuery || "").trim().toLowerCase();
          const activeApiKeys = settingsApiKeys.filter((apiKeyRecord) => apiKeyRecord?.isActive !== false);
          const getApiKeyCreatedByLabel = (apiKeyRecord) => (
            typeof apiKeyRecord?.createdByLabel === "string" && apiKeyRecord.createdByLabel
              ? apiKeyRecord.createdByLabel
              : typeof apiKeyRecord?.metadata?.userEmail === "string" && apiKeyRecord.metadata.userEmail
                ? apiKeyRecord.metadata.userEmail
                : typeof apiKeyRecord?.metadata?.createdBy === "string" && apiKeyRecord.metadata.createdBy
                  ? apiKeyRecord.metadata.createdBy
                  : "—"
          );
          const isStandardApiKey = (apiKeyRecord) => Boolean(
            apiKeyRecord?.isCurrentDefault || isSettingsSystemManagedKey(apiKeyRecord)
          );
          const visibleApiKeys = activeApiKeys
            .filter((apiKeyRecord) => {
              if (developApiKeysFilter === "standard" && !isStandardApiKey(apiKeyRecord)) {
                return false;
              }
              if (developApiKeysFilter === "scoped" && isStandardApiKey(apiKeyRecord)) {
                return false;
              }
              if (!normalizedApiKeySearchQuery) {
                return true;
              }
              return [
                apiKeyRecord?.name,
                apiKeyRecord?.keyPrefix,
                getApiKeyCreatedByLabel(apiKeyRecord),
                getSettingsApiKeyScopeLabel(apiKeyRecord?.permissions),
              ].some((value) => String(value || "").toLowerCase().includes(normalizedApiKeySearchQuery));
            })
            .sort((left, right) => {
              let comparison = 0;
              if (developApiKeysSort === "created") {
                comparison = Date.parse(String(left?.createdAt || "")) - Date.parse(String(right?.createdAt || ""));
              } else if (developApiKeysSort === "last-used") {
                comparison = Date.parse(String(left?.lastUsedAt || "")) - Date.parse(String(right?.lastUsedAt || ""));
              } else {
                comparison = String(left?.name || "API Key").localeCompare(String(right?.name || "API Key"), undefined, {
                  numeric: true,
                  sensitivity: "base",
                });
              }
              const normalizedComparison = Number.isFinite(comparison) ? comparison : 0;
              return developApiKeysSortDirection === "desc" ? -normalizedComparison : normalizedComparison;
            });
          const apiKeySortOptions = [
            { id: "name-asc", label: "Name (A-Z)", sort: "name", direction: "asc" },
            { id: "created-desc", label: "Newest First", sort: "created", direction: "desc" },
            { id: "created-asc", label: "Oldest First", sort: "created", direction: "asc" },
            { id: "last-used-desc", label: "Recently Used", sort: "last-used", direction: "desc" },
          ];
          const apiKeyFilterOptions = [
            { id: "all", label: "All API Keys", description: "Show every active API key" },
            { id: "standard", label: "Standard", description: "Show system-managed and default keys" },
            { id: "scoped", label: "Scoped", description: "Show keys created with custom access" },
          ];
          const visibleApiKeyIds = visibleApiKeys.map((apiKeyRecord) => String(apiKeyRecord?.id || "").trim()).filter(Boolean);
          const allVisibleApiKeysSelected = visibleApiKeyIds.length > 0 && visibleApiKeyIds.every((keyId) => developApiKeysSelectedIds.has(keyId));
          const someVisibleApiKeysSelected = !allVisibleApiKeysSelected && visibleApiKeyIds.some((keyId) => developApiKeysSelectedIds.has(keyId));


          const toggleAllVisibleApiKeys = () => {
            setDevelopApiKeysSelectedIds((current) => {
              const next = new Set(current);
              if (allVisibleApiKeysSelected) visibleApiKeyIds.forEach((keyId) => next.delete(keyId));
              else visibleApiKeyIds.forEach((keyId) => next.add(keyId));
              return next;
            });
          };

          const closeApiKeyActionMenu = (options = {}) => {
            if (!developApiKeyActionMenu) return;
            if (developApiKeyActionMenuCloseTimerRef.current !== null && typeof window !== "undefined") {
              window.clearTimeout(developApiKeyActionMenuCloseTimerRef.current);
              developApiKeyActionMenuCloseTimerRef.current = null;
            }
            if (options.animate === false || typeof window === "undefined") {
              setDevelopApiKeyActionMenuClosing(false);
              setDevelopApiKeyActionMenu(null);
              return;
            }
            setDevelopApiKeyActionMenuClosing(true);
            developApiKeyActionMenuCloseTimerRef.current = window.setTimeout(() => {
              developApiKeyActionMenuCloseTimerRef.current = null;
              setDevelopApiKeyActionMenuClosing(false);
              setDevelopApiKeyActionMenu(null);
            }, 90);
          };


          const openApiKeyRevealModal = async (apiKeyRecord) => {
            const keyId = String(apiKeyRecord?.id || "").trim();
            if (!keyId) return;
            const locallyAvailableKey = String(
              settingsRevealableApiKeys[keyId]
              || (apiKeyRecord?.isCurrentDefault ? resolvedSessionApiKey : "")
              || ""
            ).trim();
            setDevelopApiKeyRevealModal({ apiKeyRecord, key: locallyAvailableKey, loading: !locallyAvailableKey, error: "" });
            if (locallyAvailableKey) return;
            try {
              const response = await fetch("/api/aios/user/api-keys/" + encodeURIComponent(keyId) + "/reveal", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) throw new Error(data?.message || data?.error || "Failed to reveal API key.");
              const revealedKey = typeof data?.key === "string" ? data.key.trim() : "";
              if (!revealedKey) throw new Error("The API key value is unavailable.");
              setSettingsRevealableApiKeys((current) => ({ ...current, [keyId]: revealedKey }));
              setDevelopApiKeyRevealModal((current) => current?.apiKeyRecord?.id === keyId
                ? { ...current, key: revealedKey, loading: false, error: "" }
                : current);
            } catch (error) {
              setDevelopApiKeyRevealModal((current) => current?.apiKeyRecord?.id === keyId
                ? { ...current, loading: false, error: error instanceof Error ? error.message : "Failed to reveal API key." }
                : current);
            }
          };


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


          const apiKeyRevealDialogContent = developApiKeyRevealModal
            ? React.createElement(PlatformModalBackdrop, {
                className: "playground-tasks-project-modal-backdrop playground-settings-api-key-modal-backdrop",
                onClick: () => setDevelopApiKeyRevealModal(null),
              },
                React.createElement(PlatformModalSurface, {
                    className: "playground-tasks-project-modal playground-agent-composer-modal playground-settings-api-key-modal playground-api-key-reveal-modal",
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-labelledby": "playground-api-key-reveal-title",
                    onClick: (event) => event.stopPropagation(),
                  },
                  React.createElement("div", { className: "playground-tasks-project-modal-top playground-settings-api-key-modal-top" },
                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                      React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                        React.createElement(Eye, { width: 18, height: 18, strokeWidth: 1.9 })
                      ),
                      React.createElement("div", { className: "playground-settings-api-key-modal-title-shell" },
                        React.createElement("div", { id: "playground-api-key-reveal-title", className: "playground-settings-api-key-modal-title" }, developApiKeyRevealModal.apiKeyRecord?.name || "API Key"),
                        React.createElement("div", { className: "playground-settings-api-key-modal-subtitle" }, "Use this key to authenticate SDK and API requests.")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: () => setDevelopApiKeyRevealModal(null),
                      title: "Close",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-agent-composer-modal-body playground-settings-api-key-modal-body" },
                    developApiKeyRevealModal.loading
                      ? React.createElement("div", { className: "playground-files-state" },
                          React.createElement(Loader2, { className: "playground-files-state-loader", width: 16, height: 16, strokeWidth: 1.75 }),
                          React.createElement("span", null, "Loading API key")
                        )
                      : developApiKeyRevealModal.key
                        ? React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "playground-settings-code-row" },
                              React.createElement("code", { className: "playground-settings-code" }, developApiKeyRevealModal.key),
                              React.createElement("button", {
                                type: "button",
                                className: "playground-settings-icon-button",
                                onClick: () => void handleSettingsCopyField(developApiKeyRevealModal.key, "revealed-api-key"),
                                title: "Copy API key",
                              }, settingsCopiedField === "revealed-api-key"
                                ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                                : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8 }))
                            ),
                            React.createElement("div", { className: "playground-settings-muted-copy" }, "Keep this key private. Anyone with it can access resources allowed by its permissions.")
                          )
                        : React.createElement("div", { className: "playground-api-key-reveal-error" }, developApiKeyRevealModal.error || "The API key value is unavailable.")
                  )
                )
              )
            : null;
          const apiKeyRevealDialog = apiKeyRevealDialogContent && typeof document !== "undefined" && document.body
            ? createPortal(apiKeyRevealDialogContent, document.body)
            : apiKeyRevealDialogContent;

          const apiKeyColumns = [
            {
              id: "name",
              header: "Name",
              accessor: (apiKeyRecord) => apiKeyRecord?.name || "API Key",
              sortable: true,
              width: "minmax(190px, 1.25fr)",
              cell: ({ row: apiKeyRecord }) => React.createElement("div", { className: "playground-resources-overview-name-cell" },
                React.createElement("div", { className: "playground-resources-overview-name-copy" },
                  React.createElement("div", { className: "playground-settings-api-keys-name-row" },
                    React.createElement("span", { className: "playground-resources-overview-name-title" }, apiKeyRecord.name || "API Key"),
                    isStandardApiKey(apiKeyRecord)
                      ? React.createElement("span", { className: "playground-settings-api-keys-pill" }, "standard")
                      : null
                  )
                )
              ),
            },
            {
              id: "secret",
              header: "Secret key",
              accessor: (apiKeyRecord) => apiKeyRecord?.keyPrefix || "key",
              width: "minmax(125px, 0.85fr)",
              cell: ({ row: apiKeyRecord }) => React.createElement("div", { className: "playground-agents-overview-table-value playground-develop-api-keys-secret" }, String(apiKeyRecord?.keyPrefix || "key") + "••••"),
            },
            {
              id: "created",
              header: "Created",
              accessor: (apiKeyRecord) => Date.parse(String(apiKeyRecord?.createdAt || "")) || 0,
              sortable: true,
              sortDescFirst: true,
              width: "minmax(120px, 0.72fr)",
              cell: ({ row: apiKeyRecord }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, formatSettingsDate(apiKeyRecord.createdAt)),
            },
            {
              id: "last-used",
              header: "Last used",
              accessor: (apiKeyRecord) => Date.parse(String(apiKeyRecord?.lastUsedAt || "")) || 0,
              sortable: true,
              sortDescFirst: true,
              width: "minmax(120px, 0.72fr)",
              hideBelow: 780,
              cell: ({ row: apiKeyRecord }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, apiKeyRecord?.lastUsedAt ? formatSettingsDate(apiKeyRecord.lastUsedAt) : "Never"),
            },
            {
              id: "created-by",
              header: "Created by",
              accessor: getApiKeyCreatedByLabel,
              sortable: true,
              width: "minmax(130px, 0.8fr)",
              hideBelow: 960,
              cell: ({ row: apiKeyRecord }) => {
                const createdByLabel = getApiKeyCreatedByLabel(apiKeyRecord);
                return React.createElement("div", { className: "playground-agents-overview-table-value", title: createdByLabel }, createdByLabel);
              },
            },
            {
              id: "permissions",
              header: "Permissions",
              accessor: (apiKeyRecord) => getSettingsApiKeyScopeLabel(apiKeyRecord?.permissions),
              sortable: true,
              width: "minmax(140px, 0.9fr)",
              hideBelow: 680,
              cell: ({ row: apiKeyRecord }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, getSettingsApiKeyScopeLabel(apiKeyRecord.permissions)),
            },
          ];
          const apiKeysPlatformTable = React.createElement(PlatformDataTable, {
            rows: visibleApiKeys,
            columns: apiKeyColumns,
            getRowId: (apiKeyRecord) => String(apiKeyRecord?.id || ""),
            ariaLabel: "API keys",
            className: "playground-api-keys-platform-data-table",
            sorting: {
              value: { id: developApiKeysSort, direction: developApiKeysSortDirection },
              manual: true,
              onChange: (next) => {
                if (!next) {
                  setDevelopApiKeysSort("name");
                  setDevelopApiKeysSortDirection("asc");
                  return;
                }
                setDevelopApiKeysSort(next.id === "created" || next.id === "last-used" ? next.id : "name");
                setDevelopApiKeysSortDirection(next.direction);
              },
            },
            selection: {
              enabled: true,
              value: developApiKeysSelectedIds,
              onChange: ({ selectedIds }) => setDevelopApiKeysSelectedIds(new Set(selectedIds)),
              ariaLabel: (apiKeyRecord) => "Select " + (apiKeyRecord.name || "API key"),
            },
            toolbar: {
              search: {
                value: developApiKeysSearchQuery,
                onChange: setDevelopApiKeysSearchQuery,
                placeholder: "Search API keys",
                manual: true,
              },
              filters: [{
                id: "api-key-kind",
                label: "Filter",
                value: developApiKeysFilter,
                onChange: setDevelopApiKeysFilter,
                options: apiKeyFilterOptions,
              }],
              showSort: true,
              primaryAction: {
                label: "New API Key",
                icon: Plus,
                onClick: () => setSettingsApiKeyDialogOpen(true),
              },
            },
            getRowActions: (apiKeyRecord) => [
              {
                id: "view",
                label: "View key",
                icon: Eye,
                onSelect: () => void openApiKeyRevealModal(apiKeyRecord),
              },
              {
                id: "delete",
                label: "Delete",
                icon: Trash2,
                danger: true,
                disabled: apiKeyRecord?.canRevoke === false || settingsRevokingKeyId === apiKeyRecord?.id,
                onSelect: () => void handleSettingsRevokeApiKey(apiKeyRecord?.id),
              },
            ],
            loading: settingsApiKeysLoading,
            error: settingsApiKeysError || null,
            emptyState: "No API keys available.",
            noResultsState: "No matching API keys found.",
          });

          const apiKeysToolbar = React.createElement("div", {
              className: "playground-agents-overview-sticky-table-header playground-develop-resource-overview-sticky-table-header playground-develop-api-keys-sticky-table-header",
            },
            React.createElement("div", {
                className: "playground-plugins-search-row playground-resources-overview-search-row playground-develop-server-kind-table-toolbar playground-develop-resource-overview-toolbar-row playground-develop-api-keys-table-toolbar",
              },
              React.createElement("div", { className: "playground-develop-server-kind-table-controls" },
                React.createElement("div", { className: "playground-plugins-search-shell playground-develop-server-kind-search-shell" },
                  React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("input", {
                    type: "search",
                    value: developApiKeysSearchQuery,
                    onChange: (event) => setDevelopApiKeysSearchQuery(event.target.value),
                    className: "playground-plugins-search",
                    placeholder: "Search API keys",
                  })
                ),
                React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-sort" + (developApiKeysToolbarPopover === "sort" || developApiKeysSort !== "name" || developApiKeysSortDirection !== "asc" ? " is-active" : ""),
                      onClick: () => setDevelopApiKeysToolbarPopover((current) => current === "sort" ? "" : "sort"),
                    },
                      React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Sort")
                    ),
                    developApiKeysToolbarPopover === "sort"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu playground-agents-overview-toolbar-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                          apiKeySortOptions.map((option) => {
                            const isSelected = developApiKeysSort === option.sort && developApiKeysSortDirection === option.direction;
                            return React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (isSelected ? " selected" : ""),
                                onClick: () => {
                                  setDevelopApiKeysSort(option.sort);
                                  setDevelopApiKeysSortDirection(option.direction);
                                  setDevelopApiKeysToolbarPopover("");
                                },
                              },
                              React.createElement("span", { className: "tb-popup-check-slot" },
                                isSelected ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 }) : null
                              ),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, option.label)
                              )
                            );
                          })
                        )
                      : null
                  ),
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-filter" + (developApiKeysToolbarPopover === "filter" || developApiKeysFilter !== "all" ? " is-active" : ""),
                      onClick: () => setDevelopApiKeysToolbarPopover((current) => current === "filter" ? "" : "filter"),
                    },
                      React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Filter")
                    ),
                    developApiKeysToolbarPopover === "filter"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu playground-agents-overview-toolbar-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                          apiKeyFilterOptions.map((option) =>
                            React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (developApiKeysFilter === option.id ? " selected" : ""),
                                onClick: () => {
                                  setDevelopApiKeysFilter(option.id);
                                  setDevelopApiKeysToolbarPopover("");
                                },
                              },
                              React.createElement("span", { className: "tb-popup-check-slot" },
                                developApiKeysFilter === option.id
                                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                  : null
                              ),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, option.label),
                                React.createElement("span", null, option.description)
                              )
                            )
                          )
                        )
                      : null
                  )
                )
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-top-nav-private-chat-button playground-agents-nav-create-button playground-agents-overview-toolbar-create-button playground-resources-overview-create-button",
                onClick: () => setSettingsApiKeyDialogOpen(true),
              },
                React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "New API Key")
              )
            )
          );


          const newlyCreatedKeyNotice = settingsNewlyCreatedKey
            ? React.createElement("div", { className: "playground-settings-created-key-notice playground-develop-api-keys-created-notice" },
                React.createElement("div", { className: "playground-settings-created-key-row" },
                  React.createElement("div", { style: { minWidth: 0, flex: "1 1 auto" } },
                    React.createElement("p", { className: "playground-settings-created-key-title" }, "API Key Created Successfully"),
                    React.createElement("p", { className: "playground-settings-created-key-copy" }, "Copy this key now or view it again from the API keys table."),
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
                    "aria-label": "Dismiss created API key",
                  }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.8 }))
                )
              )
            : null;

          return React.createElement(React.Fragment, null,
            React.createElement("section", {
                className: "playground-environments-detail playground-plugins-detail playground-skills-page playground-resources-page is-develop-server-kind-page playground-agents-overview-page playground-resource-type-overview-page playground-develop-api-keys-page",
              },
              React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-home-scroll" },
                React.createElement("div", { className: "playground-environments-home-content" },
                  React.createElement("section", { className: "playground-environments-home-hero playground-develop-server-kind-hero playground-develop-api-keys-hero" },
                    React.createElement("div", { className: "playground-project-overview-summary-title-row playground-develop-header playground-develop-server-kind-header playground-develop-api-keys-page-header" },
                      React.createElement("h1", { className: "playground-project-overview-summary-title playground-develop-title" }, "API Keys"),
                      React.createElement("div", { className: "playground-project-overview-summary-title-actions playground-develop-header-actions" },
                        React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-develop-server-metrics-menu-shell" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-content-menu-button",
                            "aria-label": "API key options",
                            "aria-expanded": developApiKeysMenuOpen ? "true" : "false",
                            onClick: () => setDevelopApiKeysMenuOpen((current) => !current),
                          }, React.createElement(Ellipsis, { className: "playground-content-menu-icon", strokeWidth: 1.75 })),
                          developApiKeysMenuOpen
                            ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                                React.createElement("button", {
                                  type: "button",
                                  className: "tb-popup-row",
                                  onClick: () => {
                                    setDevelopApiKeysMenuOpen(false);
                                    openSettingsModal("costs-overview");
                                  },
                                },
                                  React.createElement(ChartNoAxesColumnIncreasing, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                    React.createElement("span", null, "View Usage")
                                  )
                                )
                              )
                            : null
                        )
                      )
                    ),
                    newlyCreatedKeyNotice,
                    renderSettingsInlineStatus("error", settingsApiKeysError),
                    React.createElement("section", {
                        className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-overview-list-section playground-team-grid-table-section playground-resources-overview-section playground-develop-resource-overview-table-section playground-develop-api-keys-table-section is-servers-overview is-develop-server-kind-list",
                      },
                      apiKeysPlatformTable
                    )
                  )
                )
              )
            ),
            apiKeyDialog,
            apiKeyRevealDialog
          );
        }
`;

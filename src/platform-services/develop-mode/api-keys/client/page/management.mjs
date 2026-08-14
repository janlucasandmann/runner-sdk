export const API_KEYS_MANAGEMENT_PAGE_SCRIPT = `        function renderApiKeysManagementPanel() {
          const activeApiKeys = settingsApiKeys.filter((apiKeyRecord) => apiKeyRecord?.isActive !== false);
          const isStandardApiKey = (apiKeyRecord) => Boolean(
            apiKeyRecord?.isCurrentDefault || isSettingsSystemManagedKey(apiKeyRecord)
          );
          const getApiKeyCreator = (apiKeyRecord) => {
            if (isStandardApiKey(apiKeyRecord)) {
              return {
                name: "Computer Agents",
                avatarUrl: COMPUTER_AGENTS_CREATOR_PROFILE_URL,
                fallback: "CA",
              };
            }
            const metadata = apiKeyRecord?.metadata && typeof apiKeyRecord.metadata === "object" && !Array.isArray(apiKeyRecord.metadata)
              ? apiKeyRecord.metadata
              : {};
            const nested = apiKeyRecord?.creator && typeof apiKeyRecord.creator === "object"
              ? apiKeyRecord.creator
              : apiKeyRecord?.createdBy && typeof apiKeyRecord.createdBy === "object"
                ? apiKeyRecord.createdBy
                : metadata?.creator && typeof metadata.creator === "object"
                  ? metadata.creator
                  : metadata?.createdBy && typeof metadata.createdBy === "object"
                    ? metadata.createdBy
                    : {};
            const createdByLabel = typeof apiKeyRecord?.createdByLabel === "string"
              ? apiKeyRecord.createdByLabel.trim()
              : "";
            const metadataEmail = typeof metadata?.userEmail === "string" ? metadata.userEmail.trim() : "";
            const explicitName = String(
              nested?.name
              || nested?.displayName
              || nested?.display_name
              || apiKeyRecord?.creatorName
              || apiKeyRecord?.creator_name
              || apiKeyRecord?.createdByName
              || apiKeyRecord?.created_by_name
              || metadata?.creatorName
              || metadata?.creator_name
              || metadata?.createdByName
              || metadata?.created_by_name
              || metadata?.userName
              || metadata?.displayName
              || ""
            ).trim();
            const accountIdentityMatches = [createdByLabel, metadataEmail]
              .filter(Boolean)
              .some((value) => value.toLowerCase() === String(accountEmail || "").trim().toLowerCase());
            const nonEmailLabel = createdByLabel && !createdByLabel.includes("@") ? createdByLabel : "";
            const name = explicitName
              || nonEmailLabel
              || (accountIdentityMatches ? accountName : "")
              || accountName
              || createdByLabel
              || metadataEmail
              || "Unknown";
            const explicitAvatarUrl = normalizeSessionPhotoUrl(
              nested?.avatarUrl
              || nested?.avatar_url
              || nested?.photoUrl
              || nested?.photoURL
              || apiKeyRecord?.creatorAvatarUrl
              || apiKeyRecord?.creator_avatar_url
              || apiKeyRecord?.createdByAvatarUrl
              || apiKeyRecord?.created_by_avatar_url
              || metadata?.creatorAvatarUrl
              || metadata?.creator_avatar_url
              || metadata?.createdByAvatarUrl
              || metadata?.created_by_avatar_url
              || metadata?.userAvatarUrl
              || metadata?.photoURL
              || ""
            );
            const avatarUrl = canRenderAvatarImage(explicitAvatarUrl)
              ? explicitAvatarUrl
              : canRenderAvatarImage(accountAvatarUrl)
                ? accountAvatarUrl
                : "";
            return {
              name,
              avatarUrl,
              fallback: getAccountInitials(name),
            };
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
          const apiKeyDialog = apiKeyDialogContent && typeof document !== "undefined" && document.body
            ? createPortal(apiKeyDialogContent, document.body)
            : apiKeyDialogContent;

          const apiKeyRevealDialogContent = developApiKeyRevealModal
            ? React.createElement(PlatformModal, {
                open: true,
                title: developApiKeyRevealModal.apiKeyRecord?.name || "API Key",
                onClose: () => setDevelopApiKeyRevealModal(null),
                size: "medium",
                className: "platform-api-key-management-modal playground-api-key-reveal-modal",
                closeButtonLabel: "Close API key",
              },
                developApiKeyRevealModal.loading
                  ? React.createElement("div", { className: "platform-api-key-management-modal__loading", role: "status" },
                      React.createElement(Loader2, {
                        className: "platform-api-key-management-modal__spinner",
                        width: 16,
                        height: 16,
                        "aria-hidden": "true",
                      }),
                      React.createElement("span", null, "Loading API key")
                    )
                  : developApiKeyRevealModal.key
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-settings-code-row" },
                          React.createElement("input", {
                            type: "text",
                            className: "playground-settings-code playground-settings-code-input",
                            value: developApiKeyRevealModal.key,
                            readOnly: true,
                            "aria-label": "API key",
                          }),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-settings-icon-button playground-settings-code-copy",
                            onClick: () => void handleSettingsCopyField(developApiKeyRevealModal.key, "revealed-api-key"),
                            title: "Copy API key",
                            "aria-label": "Copy API key",
                          }, settingsCopiedField === "revealed-api-key"
                            ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" })
                            : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }))
                        ),
                        React.createElement("p", { className: "platform-api-key-management-modal__notice" }, "Keep this key private. Anyone with it can access resources allowed by its permissions.")
                      )
                    : React.createElement("p", { className: "platform-api-key-management-modal__error", role: "alert" }, developApiKeyRevealModal.error || "The API key value is unavailable.")
              )
            : null;
          const apiKeyRevealDialog = apiKeyRevealDialogContent && typeof document !== "undefined" && document.body
            ? createPortal(apiKeyRevealDialogContent, document.body)
            : apiKeyRevealDialogContent;

          const apiKeyRows = activeApiKeys.map((apiKeyRecord) => {
            const createdTimestamp = Date.parse(String(apiKeyRecord?.createdAt || ""));
            const lastUsedTimestamp = Date.parse(String(apiKeyRecord?.lastUsedAt || ""));
            const creator = getApiKeyCreator(apiKeyRecord);
            const permissionsLabel = getSettingsApiKeyScopeLabel(apiKeyRecord?.permissions);
            const name = String(apiKeyRecord?.name || "API Key");
            const keyPrefix = String(apiKeyRecord?.keyPrefix || "key");
            const isStandard = isStandardApiKey(apiKeyRecord);
            return {
              id: String(apiKeyRecord?.id || ""),
              name,
              keyPrefix,
              createdAt: Number.isFinite(createdTimestamp) ? createdTimestamp : 0,
              createdLabel: apiKeyRecord?.createdAt ? formatSettingsDate(apiKeyRecord.createdAt) : "—",
              lastUsedAt: Number.isFinite(lastUsedTimestamp) ? lastUsedTimestamp : 0,
              lastUsedLabel: apiKeyRecord?.lastUsedAt ? formatSettingsDate(apiKeyRecord.lastUsedAt) : "Never",
              creatorName: creator.name,
              creatorAvatarUrl: creator.avatarUrl,
              creatorFallback: creator.fallback,
              permissionsLabel,
              isStandard,
              canRevoke: apiKeyRecord?.canRevoke !== false,
              searchText: [
                name,
                keyPrefix,
                creator.name,
                permissionsLabel,
                isStandard ? "standard default" : "scoped custom",
              ].join(" "),
            };
          }).filter((row) => row.id);
          const apiKeysAnalyticsPeriod = developApiKeysAnalyticsPeriod === "day" || developApiKeysAnalyticsPeriod === "week"
            ? developApiKeysAnalyticsPeriod
            : "month";
          const apiKeysAnalyticsSnapshot = developApiKeysAnalyticsState.dataByPeriod?.[apiKeysAnalyticsPeriod] || null;
          const apiKeysAnalytics = createApiKeysOverviewAnalytics({
            snapshot: apiKeysAnalyticsSnapshot,
            fallbackTotalKeyCount: apiKeyRows.length,
            fallbackUsedKeyCount: apiKeyRows.filter((row) => row.lastUsedAt > 0).length,
            loading: !apiKeysAnalyticsSnapshot
              && developApiKeysAnalyticsState.loadingPeriod === apiKeysAnalyticsPeriod,
            error: developApiKeysAnalyticsState.errorsByPeriod?.[apiKeysAnalyticsPeriod] || "",
          });

          return React.createElement(React.Fragment, null,
            React.createElement(DevelopApiKeysOverviewPage, {
              rows: apiKeyRows,
              controlsPortalId: "playground-develop-api-keys-overview-controls",
              period: apiKeysAnalyticsPeriod,
              onPeriodChange: setDevelopApiKeysAnalyticsPeriod,
              analytics: apiKeysAnalytics,
              loading: settingsApiKeysLoading,
              error: settingsApiKeysError,
              revokingKeyId: settingsRevokingKeyId,
              createdNotice: settingsNewlyCreatedKey
                ? {
                    keyValue: settingsNewlyCreatedKey,
                    copied: settingsCopiedField === "new-key",
                    onCopy: () => void handleSettingsCopyField(settingsNewlyCreatedKey, "new-key"),
                    onDismiss: () => setSettingsNewlyCreatedKey(""),
                  }
                : null,
              onCreate: () => setSettingsApiKeyDialogOpen(true),
              onReveal: (row) => {
                const apiKeyRecord = activeApiKeys.find((record) => String(record?.id || "") === row.id);
                if (apiKeyRecord) return openApiKeyRevealModal(apiKeyRecord);
              },
              onDelete: async (rows) => {
                for (const row of rows) {
                  await handleSettingsRevokeApiKey(row.id);
                }
              },
            }),
            apiKeyDialog,
            apiKeyRevealDialog
          );
        }
`;

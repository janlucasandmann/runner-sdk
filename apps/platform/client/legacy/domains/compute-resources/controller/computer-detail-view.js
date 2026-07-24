          function renderCurrentEnvironmentEditor() {
            if (!draftEnvironment) {
              return React.createElement("div", { className: "playground-environments-detail-empty" },
                React.createElement("div", { className: "playground-files-state" }, "Select an environment to see its configuration.")
              );
            }
  
            const storageDisplay = "4GB";
            const gitTokenIsSet = existingSecretKeys.has("GITHUB_TOKEN");
            const gitTokenValue = getDraftGitTokenValue();
            const environmentStatusLabel = draftEnvironment.isDefault
              ? "Default"
              : draftEnvironment.isSystem
                ? "System"
                : "Custom";
            const officeAppsEnabled = draftEnvironment.officeAppsEnabled === true;
            const activeEnvironmentComputeProfile = getPlaygroundEnvironmentComputeProfileConfig(draftEnvironment.computeProfile);
            const isEnvironmentDescriptionLocked = Boolean(draftEnvironment.isDefault);
            const shouldShowEnvironmentAnalytics = Boolean(
              draftEnvironment.id && draftEnvironment.id !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
            );
            const activeEnvironmentAnalytics = draftEnvironment.id ? environmentAnalyticsById[draftEnvironment.id] || null : null;
            const activeEnvironmentAnalyticsSummary = activeEnvironmentAnalytics?.summary || null;
            const activeEnvironmentActivityBuckets = Array.isArray(activeEnvironmentAnalytics?.charts?.activity24h)
              ? activeEnvironmentAnalytics.charts.activity24h
              : [];
            const isEnvironmentAnalyticsLoading = loadingEnvironmentAnalyticsId === draftEnvironment.id;
            const environmentAnalyticsError = draftEnvironment.id ? environmentAnalyticsErrorById[draftEnvironment.id] || "" : "";
            const normalizedEnvironmentDetailChartTimescale = normalizePlaygroundEnvironmentHomeChartPeriod(environmentDetailChartTimescale);
            const environmentDetailActivityBuckets = buildPlaygroundEnvironmentHomeActivityBuckets(normalizedEnvironmentDetailChartTimescale);
            const readEnvironmentDetailThreadTimestampMs = (thread) => {
              const timestamp = Date.parse(String(thread?.startedAt || thread?.createdAt || thread?.updatedAt || ""));
              return Number.isFinite(timestamp) ? timestamp : null;
            };
            const readEnvironmentDetailThreadEnvironmentId = (thread) => String(
              thread?.environmentId
              || thread?.environment?.id
              || thread?.metadata?.environmentId
              || thread?.metadata?.environment_id
              || thread?.metadata?.runnerPlayground?.environmentId
              || thread?.metadata?.taskPreview?.environmentId
              || thread?.runnerPlayground?.environmentId
              || thread?.taskPreview?.environmentId
              || ""
            ).trim();
            const environmentDetailThreadRecords = (Array.isArray(threadRecords) ? threadRecords : [])
              .filter((thread) => readEnvironmentDetailThreadEnvironmentId(thread) === String(draftEnvironment.id || "").trim());
            const shouldUseEnvironmentDetailThreadBuckets = normalizedEnvironmentDetailChartTimescale !== "day" || environmentDetailThreadRecords.length > 0;
            const resolvedEnvironmentActivityBuckets = shouldUseEnvironmentDetailThreadBuckets
              ? environmentDetailActivityBuckets.map((bucket) => ({
                  ...bucket,
                  total: environmentDetailThreadRecords.reduce((sum, thread) => {
                    const timestampMs = readEnvironmentDetailThreadTimestampMs(thread);
                    if (!Number.isFinite(timestampMs) || timestampMs < bucket.startMs || timestampMs >= bucket.endMs) {
                      return sum;
                    }
                    return sum + 1;
                  }, 0),
                }))
              : activeEnvironmentActivityBuckets.length > 0
                ? activeEnvironmentActivityBuckets
                : environmentDetailActivityBuckets.map((bucket) => ({
                    ...bucket,
                    total: 0,
                  }));
            const activeEnvironmentActivityLabels = resolvedEnvironmentActivityBuckets.map((bucket) => bucket?.label || "");
            const activeEnvironmentActivityCounts = resolvedEnvironmentActivityBuckets.map((bucket) => Number(bucket?.total || 0));
            const resolvedEnvironmentAnalyticsSummary = activeEnvironmentAnalyticsSummary || {
              totalRuns24h: 0,
              successRate24h: 0,
              failedRuns24h: 0,
              cancelledRuns24h: 0,
              p95RuntimeMs: 0,
            };
            const environmentDetailKpis = [
              { id: "runs", value: String(resolvedEnvironmentAnalyticsSummary.totalRuns24h || 0), label: "Runs (24h)" },
              { id: "success-rate", value: formatPlaygroundServerRate(resolvedEnvironmentAnalyticsSummary.successRate24h), label: "Success Rate" },
              { id: "runtime", value: formatPlaygroundExecutionDuration(resolvedEnvironmentAnalyticsSummary.p95RuntimeMs), label: "P95 Runtime" },
              { id: "failed", value: String(Number(resolvedEnvironmentAnalyticsSummary.failedRuns24h || 0) + Number(resolvedEnvironmentAnalyticsSummary.cancelledRuns24h || 0)), label: "Failed / Cancelled" },
            ];
            const renderEnvironmentFactRow = (label, control) => React.createElement("div", { className: "playground-tasks-detail-fact", key: label },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
            );
            const environmentDetailTimescaleOptions = [
              { value: "day", label: "24H" },
              { value: "week", label: "7D" },
              { value: "month", label: "30D" },
            ];
            const environmentDetailAnalyticsMetricColors = {
              runs: "#7effff",
              "success-rate": "#54e5a6",
              runtime: "#ffffff",
              failed: "#f53b3a",
            };
            const environmentDetailAnalyticsModel = {
              title: "Analytics",
              ariaLabel: "Computer analytics",
              metrics: environmentDetailKpis.map((item) => ({
                id: item.id,
                label: item.label,
                value: item.value,
                color: environmentDetailAnalyticsMetricColors[item.id] || "rgba(255, 255, 255, 0.72)",
              })),
              labels: activeEnvironmentActivityLabels,
              series: [
                {
                  id: "runs",
                  label: "Runs",
                  values: activeEnvironmentActivityCounts,
                  color: "#7effff",
                  type: "line",
                  axis: "primary",
                  valueKind: "count",
                },
              ],
              loading: isEnvironmentAnalyticsLoading && !activeEnvironmentAnalytics,
              error: shouldShowEnvironmentAnalytics && environmentAnalyticsError ? environmentAnalyticsError : undefined,
            };
            const environmentAnalyticsSection = React.createElement(PlatformAnalyticsSection, {
              variant: "framed",
              className: "playground-computer-detail-analytics",
              analytics: environmentDetailAnalyticsModel,
              chartType: "line",
              title: "Analytics",
              timeframe: {
                value: normalizedEnvironmentDetailChartTimescale,
                options: environmentDetailTimescaleOptions,
                onValueChange: setEnvironmentDetailChartTimescale,
                ariaLabel: "Computer analytics time frame",
              },
            });
            const normalizedEnvironmentRuntimeStatus = String(environmentRuntimeState.status || "idle").trim().toLowerCase();
            const environmentDesktopStatusLabel = normalizedEnvironmentRuntimeStatus === "running"
              ? "Running"
              : normalizedEnvironmentRuntimeStatus === "starting"
                ? "Starting"
                : normalizedEnvironmentRuntimeStatus === "error"
                  ? "Unavailable"
                  : "Stopped";
            const desktopLaunchers = [
              {
                id: "browser",
                label: "Open Browser",
                title: "Open Browser",
                renderIcon: () => React.createElement("img", {
                  className: "playground-environments-desktop-footer-icon",
                  src: PLAYGROUND_BROWSER_APP_ICON_URL,
                  alt: "Browser",
                  draggable: false,
                }),
              },
              {
                id: "files",
                label: "Open Files",
                title: "Open Files",
                renderIcon: () => React.createElement("img", {
                  className: "playground-environments-desktop-footer-icon",
                  src: PLAYGROUND_FILES_APP_ICON_URL,
                  alt: "Files",
                  draggable: false,
                }),
              },
              {
                id: "terminal",
                label: "Open Terminal",
                title: "Open Terminal",
                renderIcon: () => React.createElement("img", {
                  className: "playground-environments-desktop-footer-icon",
                  src: PLAYGROUND_TERMINAL_APP_ICON_URL,
                  alt: "Terminal",
                  draggable: false,
                }),
              },
              {
                id: "editor",
                label: "Open Editor",
                title: "Open Editor",
                renderIcon: () => React.createElement("span", { className: "playground-environments-desktop-footer-glyph" },
                  React.createElement(SquarePen, { width: 22, height: 22, strokeWidth: 1.85 })
                ),
              },
              {
                id: "pdf",
                label: "Open PDF Viewer",
                title: "Open PDF Viewer",
                renderIcon: () => React.createElement("span", { className: "playground-environments-desktop-footer-glyph" },
                  React.createElement(File, { width: 22, height: 22, strokeWidth: 1.85 })
                ),
              },
              {
                id: "archive",
                label: "Open Archive Manager",
                title: "Open Archive Manager",
                renderIcon: () => React.createElement("span", { className: "playground-environments-desktop-footer-glyph" },
                  React.createElement(Package, { width: 22, height: 22, strokeWidth: 1.85 })
                ),
              },
              {
                id: "writer",
                label: "Open Writer",
                title: officeAppsEnabled ? "Open Writer" : "Enable Office on the environment details page to use Writer",
                requiresOffice: true,
                renderIcon: () => React.createElement("span", { className: "playground-environments-desktop-footer-glyph" },
                  React.createElement(FileText, { width: 22, height: 22, strokeWidth: 1.85 })
                ),
              },
              {
                id: "calc",
                label: "Open Calc",
                title: officeAppsEnabled ? "Open Calc" : "Enable Office on the environment details page to use Calc",
                requiresOffice: true,
                renderIcon: () => React.createElement("span", { className: "playground-environments-desktop-footer-glyph" },
                  React.createElement(Calculator, { width: 22, height: 22, strokeWidth: 1.85 })
                ),
              },
            ];
            const desktopOverlay = environmentGuiOpen
              ? React.createElement("div", { className: "playground-environments-desktop-overlay" },
                  React.createElement("div", { className: "playground-environments-desktop-overlay-header" },
                    React.createElement("div", { className: "playground-environments-desktop-overlay-title" },
                      React.createElement("div", { className: "playground-environments-desktop-overlay-label" }, (draftEnvironment.name || "Environment") + " Desktop")
                    ),
                    React.createElement("div", { className: "playground-environments-desktop-overlay-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button playground-environments-desktop-restart-button",
                        onClick: () => {
                          void handleOpenEnvironmentGui({ forceRestart: true });
                        },
                        disabled: environmentGuiState.isStarting,
                      },
                        React.createElement(RefreshCw, {
                          width: 13,
                          height: 13,
                          strokeWidth: 1.8,
                          className: environmentGuiState.isStarting ? "playground-environments-spin" : "",
                        }),
                        React.createElement("span", null, environmentGuiState.isStarting ? "Restarting..." : "Restart")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button playground-environments-desktop-close-button",
                        onClick: () => setEnvironmentGuiOpen(false),
                        "aria-label": "Close desktop",
                        title: "Close desktop",
                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.9 }))
                    )
                  ),
                  React.createElement("div", { className: "playground-environments-desktop-overlay-body" },
                    React.createElement("div", { className: "playground-environments-desktop-viewer-shell" },
                      React.createElement("div", {
                        className: "playground-environments-desktop-viewer" + (environmentGuiState.isLoading ? " is-loading" : ""),
                      },
                        environmentGuiFrameUrl
                          ? React.createElement("iframe", {
                              className: "playground-environments-desktop-iframe",
                              src: environmentGuiFrameUrl,
                              title: "Live environment desktop",
                              allow: "clipboard-read; clipboard-write",
                            })
                          : React.createElement("div", { className: "playground-environments-desktop-placeholder" },
                              environmentGuiState.isStarting
                                ? [
                                    React.createElement(Loader2, {
                                      key: "spinner",
                                      className: "playground-environments-spin",
                                      width: 20,
                                      height: 20,
                                      strokeWidth: 1.8,
                                    }),
                                    React.createElement("div", {
                                      key: "copy",
                                      className: "playground-environments-desktop-placeholder-copy",
                                    },
                                      React.createElement("div", {
                                        className: "playground-environments-desktop-placeholder-title",
                                      }, "Starting Computer"),
                                      React.createElement("div", {
                                        className: "playground-environments-desktop-placeholder-subtitle",
                                      }, "This might take up to 2 minutes.")
                                    ),
                                  ]
                                : [
                                    React.createElement(HardDrive, {
                                      key: "icon",
                                      width: 18,
                                      height: 18,
                                      strokeWidth: 1.8,
                                    }),
                                    React.createElement("span", { key: "label" },
                                      environmentGuiState.isLoading
                                        ? "Loading desktop..."
                                        : "Desktop will appear here."
                                    ),
                                  ]
                            ),
                        environmentGuiState.isLoading && environmentGuiFrameUrl
                          ? React.createElement("div", { className: "playground-environments-desktop-loading" },
                              React.createElement(Loader2, { className: "playground-environments-spin", width: 18, height: 18, strokeWidth: 1.8 })
                            )
                          : null
                      ),
                    )
                  ),
                  React.createElement("div", { className: "playground-environments-desktop-overlay-footer" },
                    desktopLaunchers.map((launcher) =>
                      React.createElement("button", {
                        key: launcher.id,
                        type: "button",
                        className: "playground-environments-action-button playground-environments-desktop-footer-button",
                        onClick: () => {
                          void launchEnvironmentGuiApp(launcher.id);
                        },
                        disabled: normalizedEnvironmentRuntimeStatus !== "running" || (launcher.requiresOffice && !officeAppsEnabled),
                        "aria-label": launcher.label,
                        title: launcher.title,
                      }, launcher.renderIcon())
                    )
                  )
                )
              : null;
            const descriptionSection = React.createElement(PlatformInstructionsEditor, {
              value: draftEnvironment.description || "",
              onChange: (value) => updateEnvironmentField("description", value),
              title: "Description",
              placeholder: "Add Description here",
              ariaLabel: "Computer description",
              readOnly: isEnvironmentDescriptionLocked,
              stickyHeader: !isEnvironmentDescriptionLocked,
              historyKey: draftEnvironment.id || "draft-computer",
              className: "playground-computer-detail-description-section",
              onEditingChange: (editing) => {
                if (!editing) {
                  commitDraftEnvironmentIfDirty();
                }
              },
            });
  
            const runtimesSection = React.createElement("div", { className: "playground-tasks-connectors playground-environments-runtimes-section" },
              React.createElement("div", { className: "playground-tasks-connectors-list" },
                PLAYGROUND_RUNTIME_DEFINITIONS.map((runtime) => {
                  const versions = availableRuntimes[runtime.key] || [];
                  const currentValue = draftEnvironment.runtimes?.[runtime.key] || "";
                  const runtimeOptions = currentValue && !versions.includes(currentValue)
                    ? [currentValue, ...versions]
                    : versions;
                  return React.createElement("div", {
                    className: "playground-tasks-connector-row playground-environments-runtime-row",
                    key: runtime.key,
                  },
                    React.createElement("div", { className: "playground-environments-runtime-service" },
                      React.createElement("div", { className: "playground-tasks-connector-service" },
                        React.createElement("span", { className: "playground-tasks-connector-service-label" }, runtime.label)
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                      React.createElement(PlatformSelector, {
                        value: currentValue,
                        options: [
                          { value: "", label: "Disabled" },
                          ...runtimeOptions.map((version) => ({ value: version, label: version })),
                        ],
                        onValueChange: (version) => updateRuntime(runtime.key, version),
                        ariaLabel: runtime.label + " runtime version",
                        alignment: "end",
                        popupAlignment: "right",
                        fullWidth: true,
                        className: "platform-permissions-page__selector playground-agents-permission-select-shell playground-computer-runtime-selector",
                        popupClassName: "platform-permissions-page__selector-popup playground-computer-runtime-selector-popup",
                      })
                    )
                  );
                })
              )
            );
  
            const environmentVariablesSection = React.createElement("div", { className: "playground-environments-stack" },
              draftEnvironment.environmentVariables.length > 0
                ? React.createElement("div", { className: "playground-environments-stack" },
                    draftEnvironment.environmentVariables.map((item, index) =>
                      React.createElement("div", { className: "playground-environments-inline-row playground-environments-inline-row-paired playground-environments-editor-surface", key: "env-var:" + index },
                        React.createElement("input", {
                          type: "text",
                          className: "playground-environments-input",
                          value: item.key,
                          onChange: (event) => updateEnvironmentVariable(index, "key", event.target.value),
                          placeholder: "KEY",
                        }),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-environments-input",
                          value: item.value,
                          onChange: (event) => updateEnvironmentVariable(index, "value", event.target.value),
                          placeholder: "value",
                        }),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-remove-button",
                          onClick: () => removeEnvironmentVariable(index),
                          "aria-label": "Remove variable",
                        }, React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }))
                      )
                    )
                  )
                : React.createElement("div", { className: "playground-environments-empty-copy" }, "No environment variables configured.")
            );
  
            const secretsSection = React.createElement("div", { className: "playground-environments-stack" },
              draftEnvironment.secrets.length > 0
                ? React.createElement("div", { className: "playground-environments-stack" },
                    draftEnvironment.secrets.map((secret, index) => {
                      const isExistingSecret = existingSecretKeys.has(secret.key);
                      const hasBeenModified = modifiedSecrets[secret.key] !== undefined;
                      const displayValue = isExistingSecret
                        ? (hasBeenModified ? modifiedSecrets[secret.key] : "")
                        : secret.value;
                      return React.createElement("div", { className: "playground-environments-inline-row playground-environments-inline-row-paired playground-environments-editor-surface", key: "secret:" + index },
                        React.createElement("input", {
                          type: "text",
                          className: "playground-environments-input",
                          value: secret.key,
                          disabled: isExistingSecret,
                          onChange: (event) => updateSecret(index, "key", event.target.value),
                          placeholder: "SECRET_KEY",
                        }),
                        React.createElement("div", { className: "playground-environments-secret-field" },
                          React.createElement("input", {
                            type: "password",
                            className: "playground-environments-input",
                            value: displayValue,
                            onChange: (event) => updateSecret(index, "value", event.target.value),
                            placeholder: isExistingSecret ? "Enter new value to change" : "secret value",
                          }),
                          isExistingSecret && !hasBeenModified
                            ? React.createElement("span", { className: "playground-environments-secret-indicator" }, "(set)")
                            : null
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-remove-button",
                          onClick: () => removeSecret(index),
                          "aria-label": "Remove secret",
                        }, React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }))
                      );
                    })
                  )
                : React.createElement("div", { className: "playground-environments-empty-copy" }, "No secrets configured.")
            );
  
            const mcpSection = React.createElement("div", { className: "playground-environments-stack" },
              draftEnvironment.mcpServers.length > 0
                ? draftEnvironment.mcpServers.map((server, index) => {
                    const hasExistingToken = existingMcpTokenServers.has(server.name);
                    const hasModifiedToken = modifiedMcpTokens[server.name] !== undefined;
                    return React.createElement("div", { className: "playground-environments-mcp-card playground-environments-editor-surface", key: server.id || index },
                      React.createElement("div", { className: "playground-environments-inline-row" },
                        React.createElement("input", {
                          type: "text",
                          className: "playground-environments-input",
                          value: server.name,
                          onChange: (event) => updateMcpServer(index, (current) => ({
                            ...current,
                            name: event.target.value,
                          })),
                          placeholder: "Server name",
                        }),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-remove-button",
                          onClick: () => removeMcpServer(index),
                          "aria-label": "Remove MCP server",
                        }, React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }))
                      ),
                      React.createElement("div", { className: "playground-environments-radio-row" },
                        React.createElement("label", { className: "playground-environments-radio-option" },
                          React.createElement("input", {
                            type: "radio",
                            name: "mcp-type-" + index,
                            checked: server.type !== "http",
                            onChange: () => updateMcpServer(index, (current) => ({
                              ...current,
                              type: "stdio",
                              url: "",
                            })),
                          }),
                          React.createElement("span", null, "stdio")
                        ),
                        React.createElement("label", { className: "playground-environments-radio-option" },
                          React.createElement("input", {
                            type: "radio",
                            name: "mcp-type-" + index,
                            checked: server.type === "http",
                            onChange: () => updateMcpServer(index, (current) => ({
                              ...current,
                              type: "http",
                              command: "",
                            })),
                          }),
                          React.createElement("span", null, "HTTP")
                        )
                      ),
                      server.type === "http"
                        ? React.createElement(React.Fragment, null,
                            React.createElement("label", { className: "playground-environments-field" },
                              React.createElement("span", { className: "playground-environments-field-label" }, "Server URL"),
                              React.createElement("input", {
                                type: "text",
                                className: "playground-environments-input",
                                value: server.url || "",
                                onChange: (event) => updateMcpServer(index, (current) => ({
                                  ...current,
                                  url: event.target.value,
                                })),
                                placeholder: "https://api.example.com/mcp",
                              })
                            ),
                            React.createElement("label", { className: "playground-environments-field" },
                              React.createElement("span", { className: "playground-environments-field-label" }, "Bearer Token"),
                              React.createElement("div", { className: "playground-environments-secret-field" },
                                React.createElement("input", {
                                  type: "password",
                                  className: "playground-environments-input",
                                  value: hasExistingToken
                                    ? (hasModifiedToken ? modifiedMcpTokens[server.name] : "")
                                    : (server.bearerToken || ""),
                                  onChange: (event) => updateMcpBearerToken(index, event.target.value),
                                  placeholder: hasExistingToken ? "Enter new token to change" : "Bearer token",
                                }),
                                hasExistingToken && !hasModifiedToken
                                  ? React.createElement("span", { className: "playground-environments-secret-indicator" }, "(set)")
                                  : null
                              )
                            )
                          )
                        : React.createElement("label", { className: "playground-environments-field" },
                            React.createElement("span", { className: "playground-environments-field-label" }, "Command Line"),
                            React.createElement("input", {
                              type: "text",
                              className: "playground-environments-input",
                              value: server.command || "",
                              onChange: (event) => updateMcpServer(index, (current) => ({
                                ...current,
                                command: event.target.value,
                              })),
                              placeholder: "npx @modelcontextprotocol/server-filesystem /workspace",
                            })
                          ),
                      React.createElement("div", { className: "playground-environments-toggle-row" },
                        React.createElement("div", { className: "playground-environments-toggle-copy" },
                          React.createElement("div", { className: "playground-environments-subtitle" }, "Server Status"),
                          React.createElement("div", { className: "playground-environments-muted" }, server.enabled ? "Enabled" : "Disabled")
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-toggle" + (server.enabled ? " is-active" : ""),
                          onClick: () => updateMcpServer(index, (current) => ({
                            ...current,
                            enabled: !current.enabled,
                          })),
                          "aria-pressed": server.enabled ? "true" : "false",
                        }, React.createElement("span", { className: "playground-environments-toggle-thumb" }))
                      )
                    );
                  })
                : React.createElement("div", { className: "playground-environments-empty-copy" }, "No MCP servers configured.")
            );
  
            const setupScriptsSection = React.createElement("div", { className: "playground-environments-stack" },
              draftEnvironment.setupScripts.length > 0
                ? draftEnvironment.setupScripts.map((script, index) =>
                    React.createElement("div", { className: "playground-environments-inline-row playground-environments-inline-row-top playground-environments-editor-surface", key: "script:" + index },
                      React.createElement("textarea", {
                        className: "playground-environments-textarea",
                        rows: 3,
                        value: script,
                        onChange: (event) => updateSetupScript(index, event.target.value),
                        placeholder: "npm install, pip install -r requirements.txt, ...",
                      }),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-remove-button",
                        onClick: () => removeSetupScript(index),
                        "aria-label": "Remove setup script",
                      }, React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }))
                    )
                  )
                : React.createElement("div", { className: "playground-environments-empty-copy" }, "No setup scripts configured.")
            );
  
            const environmentSidebarCollapsed = Boolean(environmentDetailsCollapsed);
            const renderEnvironmentSidebarToggleButton = () => React.createElement("button", {
                type: "button",
                className: "playground-project-overview-sidebar-toggle",
                onClick: () => setEnvironmentDetailsCollapsed((current) => !current),
                title: environmentSidebarCollapsed ? "Show computer sidebar" : "Hide computer sidebar",
                "aria-label": environmentSidebarCollapsed ? "Show computer sidebar" : "Hide computer sidebar",
                "aria-pressed": environmentSidebarCollapsed ? "true" : "false",
              },
              React.createElement(PanelRight, {
                width: 15,
                height: 15,
                strokeWidth: 1.8,
              })
            );
            const canShowEnvironmentDetailHeaderPublish = Boolean(
              draftEnvironment?.id
              && draftEnvironment.id !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
              && !draftEnvironment.isSystem
            );
            const isEnvironmentVersionControlBusy = saveState.isSaving || environmentVersionState.status === "loading";
            const environmentVersionHasChanges = hasDraftEnvironmentVersionChanges();
            const isEnvironmentPublishControlDisabled = Boolean(isEnvironmentVersionControlBusy || !environmentVersionHasChanges);
            const areEnvironmentPublishMenuActionsDisabled = isEnvironmentPublishControlDisabled;
            const environmentVersionPopupActions = getEnvironmentVersionPopupActions();
            const renderEnvironmentPublishAction = () => React.createElement(AgentPublishControl, {
              open: environmentPublishMenuOpen,
              actions: environmentVersionPopupActions.map((action) => ({
                id: action.id || action.label,
                label: action.label,
                icon: getPlaygroundSafeIconComponent(action.Icon, Circle),
                shortcut: action.shortcut,
                disabled: action.disabled,
                onClick: action.onClick,
              })),
              active: environmentPublishMenuOpen,
              disabled: isEnvironmentPublishControlDisabled,
              menuDisabled: areEnvironmentPublishMenuActionsDisabled || !draftEnvironment,
              label: "Save Changes",
              leading: React.createElement(Bookmark, { strokeWidth: 1.8 }),
              onOpenChange: (nextOpen) => {
                setEnvironmentVersionSelectorMenuOpen(false);
                setEnvironmentVersionsHeaderMenuOpen(false);
                setEnvironmentPublishMenuOpen(nextOpen);
              },
              onPublish: () => openEnvironmentVersionSaveDialog(),
              publishAriaLabel: "Save computer changes",
              menuAriaLabel: "Computer version save options",
              className: "playground-computer-detail-publish-control",
            });
            const environmentDetailTabBarActions = null;
            const environmentDetailSidebarToggle = renderEnvironmentSidebarToggleButton();
            const environmentProfileSection = React.createElement("div", { className: "playground-agents-profile-section playground-computer-detail-profile-section" },
              React.createElement("div", { className: "playground-agents-profile-copy" },
                React.createElement("div", { className: "playground-agents-profile-name-wrap" },
                  React.createElement("input", {
                    type: "text",
                    className: "playground-content-title playground-tasks-detail-navbar-title-input playground-environments-editor-title-input playground-agents-profile-name-input playground-computer-detail-profile-title",
                    value: draftEnvironment.name || "",
                    placeholder: "Computer",
                    "aria-label": "Computer name",
                    title: draftEnvironment.name || "Computer",
                    onKeyDown: (event) => event.stopPropagation(),
                    onChange: (event) => updateEnvironmentField("name", event.target.value),
                    onBlur: commitDraftEnvironmentIfDirty,
                  })
                )
              )
            );
            const renderEnvironmentSidebarValue = (value, className = "") =>
              React.createElement("span", {
                className: "playground-environments-editor-fact-value" + (className ? " " + className : ""),
                title: String(value || ""),
              }, value || "Not set");
            const renderEnvironmentFactCopyButton = (fieldId, value, label) => {
              const normalizedValue = String(value || "").trim();
              const isCopied = environmentDetailCopiedFact === fieldId;
              return React.createElement("button", {
                  type: "button",
                  className: "playground-agents-detail-sidebar-copy-button",
                  title: isCopied ? "Copied" : "Copy " + label,
                  "aria-label": isCopied ? label + " copied" : "Copy " + label,
                  disabled: !normalizedValue,
                  onClick: async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!normalizedValue) {
                      return;
                    }
                    const copied = await copyTextToClipboard(normalizedValue);
                    if (!copied) {
                      return;
                    }
                    setEnvironmentDetailCopiedFact(fieldId);
                    window.setTimeout(() => {
                      setEnvironmentDetailCopiedFact((current) => current === fieldId ? "" : current);
                    }, 1400);
                  },
                },
                isCopied
                  ? React.createElement(Check, { width: 12, height: 12, strokeWidth: 1.6 })
                  : React.createElement(Copy, { width: 12, height: 12, strokeWidth: 1.45 })
              );
            };
            const renderEnvironmentCopyableSidebarValue = (fieldId, value, label, className = "", displayValue = value) =>
              React.createElement("span", { className: "playground-agents-detail-sidebar-copy-value" },
                React.createElement("span", {
                  className: "playground-environments-editor-fact-value" + (className ? " " + className : ""),
                  title: String(displayValue || ""),
                }, displayValue || "Not set"),
                renderEnvironmentFactCopyButton(fieldId, value, label)
              );
            const renderEnvironmentSidebarRow = (label, valueNode, props = {}) =>
              React.createElement(props.asButton ? "button" : "div", {
                  key: label,
                  type: props.asButton ? "button" : undefined,
                  className: "playground-project-overview-sidebar-row" + (props.className ? " " + props.className : ""),
                  onClick: props.onClick,
                },
                React.createElement("div", { className: "playground-project-overview-sidebar-row-label" }, label),
                React.createElement("div", {
                  className: "playground-project-overview-sidebar-row-value"
                    + (props.editable ? " is-editable" : "")
                    + (props.valueClassName ? " " + props.valueClassName : ""),
                }, valueNode)
              );
            const environmentRuntimeStatusNode = React.createElement("span", {
              className: "playground-environments-desktop-status playground-computer-detail-sidebar-status is-" + (
                normalizedEnvironmentRuntimeStatus === "running"
                  ? "running"
                  : normalizedEnvironmentRuntimeStatus === "starting"
                    ? "starting"
                    : normalizedEnvironmentRuntimeStatus === "error"
                      ? "error"
                      : "stopped"
              ),
            }, environmentDesktopStatusLabel);
            const renderEnvironmentActionRow = (key, label, Icon, onClick, options = {}) =>
              React.createElement("button", {
                  key,
                  type: "button",
                  className: "playground-project-overview-sidebar-resource-row playground-agents-detail-sidebar-action playground-computer-detail-sidebar-action",
                  onClick,
                  disabled: Boolean(options.disabled),
                },
                React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                  React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.85 })
                ),
                React.createElement("span", { className: "playground-project-overview-sidebar-resource-label" }, label)
              );
            const selectedEnvironmentComputeProfile = activeEnvironmentComputeProfile || getPlaygroundEnvironmentComputeProfileConfig(draftEnvironment.computeProfile);
            const environmentComputeProfilePopoverOpen = environmentRuntimePopover === "compute-profile";
            const environmentComputeProfileSelector = React.createElement("div", {
                className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell playground-agents-model-select-popup playground-computer-profile-select-popup" + (environmentComputeProfilePopoverOpen ? " is-open" : ""),
                ref: environmentComputeProfilePopoverOpen ? environmentRuntimePopoverRef : null,
              },
              React.createElement("button", {
                  type: "button",
                  className: "playground-environments-runtime-value-button playground-agents-model-picker-trigger",
                  onClick: () => setEnvironmentRuntimePopover((current) => current === "compute-profile" ? "" : "compute-profile"),
                  title: selectedEnvironmentComputeProfile.label || "Computer profile",
                  "aria-label": "Computer profile: " + (selectedEnvironmentComputeProfile.label || "Computer profile"),
                  "aria-expanded": environmentComputeProfilePopoverOpen ? "true" : "false",
                },
                React.createElement("span", { className: "playground-agents-model-picker-trigger-copy" },
                  React.createElement("span", { className: "playground-agents-model-provider-icon-shell", "aria-hidden": "true" },
                    React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.8 })
                  ),
                  React.createElement("span", { className: "playground-agents-model-picker-trigger-labels" },
                    React.createElement("span", { className: "playground-environments-runtime-value-label" }, selectedEnvironmentComputeProfile.label || "Computer profile")
                  )
                ),
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
              ),
              environmentComputeProfilePopoverOpen
                ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                    PLAYGROUND_ENVIRONMENT_COMPUTE_PROFILES.map((profile) =>
                      React.createElement("button", {
                          key: profile.id,
                          type: "button",
                          className: "tb-popup-row tb-popup-row-select" + (profile.id === selectedEnvironmentComputeProfile.id ? " selected" : ""),
                          onClick: () => {
                            updateEnvironmentField("computeProfile", profile.id);
                            setEnvironmentRuntimePopover("");
                          },
                        },
                        React.createElement("span", { className: "tb-popup-check-slot" },
                          profile.id === selectedEnvironmentComputeProfile.id
                            ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                            : null
                        ),
                        React.createElement("span", null, profile.label)
                      )
                    )
                  )
                : null
            );
            const canMutateEnvironmentRecord = Boolean(draftEnvironment.id && !draftEnvironment.isSystem && !draftEnvironment.isDefault);
            const environmentSystemIdentity = {
              id: "computer-agents",
              userId: "computer-agents",
              name: "Computer Agents",
              email: "",
              avatarUrl: COMPUTER_AGENTS_CREATOR_PROFILE_URL,
            };
            const environmentIdentityFallback = getCurrentDevelopResourceIdentityInput();
            const environmentCreatorIdentity = draftEnvironment.isSystem || draftEnvironment.isDefault
              ? environmentSystemIdentity
              : getDevelopResourceCreatorIdentity(draftEnvironment, environmentIdentityFallback);
            const environmentOwnerIdentity = draftEnvironment.isSystem || draftEnvironment.isDefault
              ? environmentSystemIdentity
              : getDevelopResourceOwnerIdentity(draftEnvironment, environmentIdentityFallback);
            const environmentSidebar = React.createElement(React.Fragment, null,
              React.createElement("section", { className: "playground-project-overview-sidebar-card playground-server-detail-properties-card playground-computer-detail-properties-card" },
                React.createElement("div", { className: "playground-project-overview-sidebar-card-header" },
                  React.createElement("h2", { className: "playground-project-overview-sidebar-title" }, "Properties")
                ),
                React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                  renderEnvironmentSidebarRow("Status", environmentRuntimeStatusNode, {
                    valueClassName: "playground-computer-detail-sidebar-status-value",
                  }),
                  renderEnvironmentSidebarRow("Creator", renderDevelopResourceIdentityValue(environmentCreatorIdentity), {
                    valueClassName: "playground-server-detail-sidebar-identity-cell",
                  }),
                  renderEnvironmentSidebarRow("Computer Profile",
                    environmentComputeProfileSelector,
                    {
                      editable: true,
                      className: "playground-computer-detail-profile-row",
                      valueClassName: "playground-computer-detail-profile-value",
                    }
                  ),
                  renderEnvironmentSidebarRow("Rate",
                    renderEnvironmentSidebarValue(formatPlaygroundEnvironmentProfileRate(activeEnvironmentComputeProfile))
                  ),
                  renderEnvironmentSidebarRow("RAM",
                    renderEnvironmentSidebarValue(formatPlaygroundEnvironmentProfileMemory(activeEnvironmentComputeProfile))
                  ),
                  renderEnvironmentSidebarRow("Computer ID",
                    renderEnvironmentCopyableSidebarValue("computer-id", draftEnvironment.id, "computer ID", "is-id", draftEnvironment.id || "Unsaved computer")
                  ),
                  renderEnvironmentSidebarRow("Created", renderEnvironmentSidebarValue(formatPlaygroundFileDate(draftEnvironment.createdAt))),
                  renderEnvironmentSidebarRow("Updated", renderEnvironmentSidebarValue(formatPlaygroundFileDate(draftEnvironment.updatedAt))),
                  renderEnvironmentSidebarRow("Resources", renderEnvironmentSidebarValue(formatPlaygroundEnvironmentProfileResources(activeEnvironmentComputeProfile))),
                  renderEnvironmentSidebarRow("Internet",
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-toggle" + (draftEnvironment.internetAccess ? " is-active" : ""),
                      onClick: () => updateEnvironmentField("internetAccess", !draftEnvironment.internetAccess),
                      "aria-pressed": draftEnvironment.internetAccess ? "true" : "false",
                      title: draftEnvironment.internetAccess ? "Internet access enabled" : "Internet access disabled",
                    }, React.createElement("span", { className: "playground-environments-toggle-thumb" })),
                    { valueClassName: "playground-computer-detail-sidebar-toggle-value" }
                  ),
                  draftEnvironment.computeProfile === "desktop"
                    ? renderEnvironmentSidebarRow("Office Apps",
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-toggle" + (officeAppsEnabled ? " is-active" : ""),
                          onClick: () => updateEnvironmentField("officeAppsEnabled", !officeAppsEnabled),
                          "aria-pressed": officeAppsEnabled ? "true" : "false",
                          title: officeAppsEnabled ? "Office apps enabled" : "Office apps disabled",
                        }, React.createElement("span", { className: "playground-environments-toggle-thumb" })),
                        { valueClassName: "playground-computer-detail-sidebar-toggle-value" }
                      )
                    : null,
                  draftEnvironment.isSystem
                    ? renderEnvironmentSidebarRow("Type", renderEnvironmentSidebarValue("System"))
                    : null,
                  renderEnvironmentSidebarRow("Owner", renderDevelopResourceIdentityValue(environmentOwnerIdentity), {
                    className: "playground-server-detail-sidebar-owner-row",
                    valueClassName: "playground-server-detail-sidebar-identity-cell playground-server-detail-sidebar-owner-cell",
                  })
                )
              ),
              React.createElement("section", { className: "playground-project-overview-sidebar-card playground-agents-detail-actions-card playground-computer-detail-actions-card" },
                React.createElement("div", { className: "playground-project-overview-sidebar-card-header" },
                  React.createElement("h2", { className: "playground-project-overview-sidebar-title" }, "Actions")
                ),
                React.createElement("div", { className: "playground-agents-detail-sidebar-actions" },
                  canMutateEnvironmentRecord
                    ? renderEnvironmentActionRow("share-team", "Share with Team", UsersRound, () => openEnvironmentShareTeamModal(), {
                        disabled: saveState.isSaving || environmentShareTeamState.action === "share",
                      })
                    : null,
                  draftEnvironment?.id && draftEnvironment.id !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
                    ? renderEnvironmentActionRow("api", "Use via API", Code, () => openEnvironmentApiModal(), {
                        disabled: saveState.isSaving,
                      })
                    : null,
                  renderEnvironmentActionRow("open-gui", environmentGuiOpen ? "Show Desktop" : "Open GUI", Monitor, () => {
                    void handleOpenEnvironmentGui();
                  }, {
                    disabled: !draftEnvironment?.id || draftEnvironment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID || environmentGuiState.isStarting || draftEnvironment.guiEnabled === false,
                  }),
                  renderEnvironmentActionRow("restart", environmentGuiState.isStarting ? "Restarting..." : "Restart", RefreshCw, () => {
                    void handleOpenEnvironmentGui({ forceRestart: true });
                  }, {
                    disabled: !draftEnvironment?.id || draftEnvironment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID || environmentGuiState.isStarting,
                  }),
                  canMutateEnvironmentRecord
                    ? renderEnvironmentActionRow("rename", "Rename", SquarePen, () => openEnvironmentRenameDialog(draftEnvironment), {
                        disabled: saveState.isSaving,
                      })
                    : null,
                  canMutateEnvironmentRecord
                    ? renderEnvironmentActionRow("delete", "Delete", Trash2, () => {
                        void handleDeleteEnvironment(draftEnvironment.id);
                      }, {
                        disabled: saveState.isSaving,
                      })
                    : null
                )
              )
            );
            const openEnvironmentFilebase = () => {
              const normalizedEnvironmentId = String(draftEnvironment?.id || "").trim();
              if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
                return;
              }
              if (typeof onOpenFilesPage !== "function") {
                return;
              }
              onOpenFilesPage({
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                environmentId: normalizedEnvironmentId,
                contentMode: "files",
                path: "",
                isFolder: true,
              });
            };
            const normalizedEnvironmentDetailTab =
              environmentDetailTab === "settings"
                ? "settings"
                : environmentDetailTab === "runtime" || environmentDetailTab === "advanced"
                  ? "runtime"
                  : "general";
            const environmentDetailGeneralSection = React.createElement(React.Fragment, null,
              environmentAnalyticsSection,
              descriptionSection
            );
            const runtimeVersionsBox = React.createElement("div", {
                className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-mission-control-modal-context-editor playground-mission-control-modal-outcomes-editor playground-computer-runtime-versions-box",
              },
              runtimesSection
            );
            const renderEnvironmentAddIconButton = (label, onClick) => React.createElement("button", {
                type: "button",
                className: "playground-computer-detail-add-icon-button",
                onClick,
                title: label,
                "aria-label": label,
              },
              React.createElement(Plus, { width: 15, height: 15, strokeWidth: 1.9 })
            );
            const renderEnvironmentAdvancedSettingsSection = (
              sectionId,
              title,
              Icon,
              content,
              actions = null
            ) => React.createElement(PlatformSettingsSection, {
                key: sectionId,
                title,
                icon: React.createElement(Icon, {
                  width: 14,
                  height: 14,
                  strokeWidth: 1.8,
                }),
                actions,
                className: "playground-computer-detail-advanced-section",
                "data-computer-settings-section": sectionId,
              },
              content
            );
            const environmentAccessTeams = environmentSharedTeamIds.map((teamId) => (
              environmentShareTeamById.get(String(teamId))
              || {
                id: String(teamId),
                name: "Team",
                kind: "team",
                roleId: "member",
                roleLabel: "Member",
                createdAt: "",
              }
            ));
            const availableEnvironmentAccessTeams = availableEnvironmentShareTeams.filter(
              (team) => !environmentSharedTeamIdSet.has(String(team.id))
            );
            const environmentAccessAddTeamsControl = canMutateEnvironmentRecord
              ? React.createElement(PlatformButtonSelector, {
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
                  open: environmentAccessTeamMenuOpen,
                  onOpenChange: (nextOpen) => {
                    if (
                      nextOpen
                      && typeof onWorkspaceTeamsRequest === "function"
                      && !workspaceTeamsLoading
                    ) {
                      onWorkspaceTeamsRequest({});
                    }
                    setEnvironmentAccessTeamMenuOpen(nextOpen);
                  },
                  closeOnSelect: true,
                  popupAriaLabel: "Add teams with computer access",
                  popupAlignment: "right",
                  popupRole: "menu",
                  popupVariant: "minimal",
                  popupWidth: 240,
                  disabled: Boolean(environmentTeamAccessState.action),
                  className: "playground-project-teams-add-shell playground-computer-access-team-menu",
                  popupClassName: "playground-project-teams-menu",
                },
                availableEnvironmentAccessTeams.length
                  ? availableEnvironmentAccessTeams.map((team) => React.createElement("button", {
                      key: team.id,
                      type: "button",
                      role: "menuitem",
                      className: "platform-data-table__menu-item playground-project-teams-menu-row",
                      onClick: () => void handleAddEnvironmentTeamAccess(team),
                    },
                    React.createElement("span", { className: "platform-data-table__menu-icon" },
                      React.createElement(Users, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("span", { className: "platform-data-table__menu-copy" }, team.name)
                  ))
                  : React.createElement("div", {
                      className: "playground-project-teams-menu-empty",
                    }, workspaceTeamsLoading ? "Loading teams..." : "All available teams have access.")
              )
              : null;
            const selectedEnvironmentSystemAccessPrincipal = getPlatformSystemAccessPrincipal(environmentPermissionPrincipalId);
            const selectedEnvironmentAccessTeam = environmentPermissionPrincipalId && !selectedEnvironmentSystemAccessPrincipal
              ? environmentAccessTeams.find((team) => String(team.id) === String(environmentPermissionPrincipalId)) || null
              : null;
            const restoreEnvironmentDetailSidebarAfterAccess = () => {
              if (environmentDetailsCollapsedBeforeAccessRef.current === null) {
                return;
              }
              const shouldRestoreCollapsed = Boolean(environmentDetailsCollapsedBeforeAccessRef.current);
              environmentDetailsCollapsedBeforeAccessRef.current = null;
              setEnvironmentDetailsCollapsed(shouldRestoreCollapsed);
            };
            const handleEnvironmentAccessPrincipalChange = (principalId) => {
              const normalizedPrincipalId = String(principalId || "").trim();
              const needsRoleSidebar = Boolean(
                normalizedPrincipalId
                && (
                  !isPlatformSystemAccessPrincipalId(normalizedPrincipalId)
                  || isPlatformRoleScopedSystemAccessPrincipalId(normalizedPrincipalId)
                )
              );
              if (needsRoleSidebar) {
                if (environmentDetailsCollapsedBeforeAccessRef.current === null) {
                  environmentDetailsCollapsedBeforeAccessRef.current = Boolean(environmentDetailsCollapsed);
                }
                if (!environmentDetailsCollapsed) {
                  setEnvironmentDetailsCollapsed(true);
                }
              } else if (!normalizedPrincipalId) {
                restoreEnvironmentDetailSidebarAfterAccess();
              }
              setEnvironmentPermissionRoleId("member");
              setEnvironmentPermissionPrincipalId(normalizedPrincipalId);
            };
            const environmentAccessSettingsSection = React.createElement(PlatformResourceAccessSettings, {
              teams: environmentAccessTeams,
              resourceLabel: "Computer",
              selectedPrincipalId: environmentPermissionPrincipalId,
              onSelectedPrincipalIdChange: handleEnvironmentAccessPrincipalChange,
              subjectType: "computer",
              teamSubjectType: "computer_team_role",
              systemPermissionSet: getPlatformSystemPrincipalPermissionSet(
                getEnvironmentMetadataRecord(draftEnvironment),
                selectedEnvironmentSystemAccessPrincipal?.id || PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
                "computer",
                getEnvironmentMetadataRecord(draftEnvironment).permissionSet
              ),
              onSystemPermissionSetChange: canMutateEnvironmentRecord
                ? updateEnvironmentSystemAccessPermissionSet
                : undefined,
              systemRolePermissionSet:
                selectedEnvironmentSystemAccessPrincipal &&
                isPlatformRoleScopedSystemAccessPrincipalId(
                  selectedEnvironmentSystemAccessPrincipal.id
                )
                  ? getEnvironmentSystemRolePermissionSet(
                      draftEnvironment,
                      selectedEnvironmentSystemAccessPrincipal.id,
                      environmentPermissionRoleId
                    )
                  : null,
              onSystemRolePermissionSetChange: canMutateEnvironmentRecord
                ? updateEnvironmentSystemRoleAccessPermissionSet
                : undefined,
              roles: PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => ({
                id: role.id,
                label: role.label,
                description: role.description,
                meta: "Computer access",
              })),
              selectedRoleId: environmentPermissionRoleId,
              onSelectedRoleIdChange: setEnvironmentPermissionRoleId,
              teamPermissionSet: selectedEnvironmentAccessTeam
                ? getEnvironmentTeamRolePermissionSet(
                    draftEnvironment,
                    selectedEnvironmentAccessTeam.id,
                    environmentPermissionRoleId
                  )
                : null,
              onTeamPermissionSetChange: canMutateEnvironmentRecord
                ? updateEnvironmentTeamRoleAccessPermissionSet
                : undefined,
              animationKey: environmentPermissionChartAnimationKey,
              disabled: !canMutateEnvironmentRecord,
              backLabel: "Settings",
              className: "playground-computer-access-settings",
              tableProps: {
                className: "playground-computer-access-platform-data-table",
                trailing: environmentAccessAddTeamsControl,
                selectedIds: selectedEnvironmentAccessTeamIds,
                onSelectedIdsChange: setSelectedEnvironmentAccessTeamIds,
                busy: Boolean(environmentTeamAccessState.action),
                onRemoveTeams: canMutateEnvironmentRecord
                  ? (teams) => void handleRemoveEnvironmentTeamsAccess(teams)
                  : undefined,
                formatCreatedAt: (value) => value ? formatPlaygroundFileDate(value) : "—",
                error: environmentTeamAccessState.error || null,
              },
            });
            const environmentDetailAdvancedSettingsList = React.createElement(PlatformSettingsSectionList, {
                className: "playground-computer-detail-advanced-tab",
                "aria-label": "Advanced computer settings",
              },
              renderEnvironmentAdvancedSettingsSection(
                "runtimes",
                "Runtime Versions",
                Cpu,
                runtimeVersionsBox
              ),
              renderEnvironmentAdvancedSettingsSection(
                "packages-system",
                "System Packages",
                Package,
                renderPackageGroup("system", "System", "ffmpeg, curl, imagemagick..."),
                renderEnvironmentAddIconButton("Add Package", () => openPackageComposer("system"))
              ),
              renderEnvironmentAdvancedSettingsSection(
                "packages-python",
                "Python Packages",
                Package,
                renderPackageGroup("python", "Python", "numpy, pandas, flask..."),
                renderEnvironmentAddIconButton("Add Package", () => openPackageComposer("python"))
              ),
              renderEnvironmentAdvancedSettingsSection(
                "packages-node",
                "Node.js Packages",
                Package,
                renderPackageGroup("node", "Node.js", "express, typescript, axios..."),
                renderEnvironmentAddIconButton("Add Package", () => openPackageComposer("node"))
              ),
              renderEnvironmentAdvancedSettingsSection(
                "variables",
                "Environment Variables",
                Braces,
                environmentVariablesSection,
                renderEnvironmentAddIconButton("Add Variable", addEnvironmentVariable)
              ),
              renderEnvironmentAdvancedSettingsSection(
                "secrets",
                "Secrets",
                KeyRound,
                secretsSection,
                renderEnvironmentAddIconButton("Add Secret", addSecret)
              ),
              renderEnvironmentAdvancedSettingsSection(
                "mcp",
                "MCP Servers",
                Cable,
                mcpSection,
                renderEnvironmentAddIconButton("Add Server", addMcpServer)
              ),
              renderEnvironmentAdvancedSettingsSection(
                "scripts",
                "Setup Scripts",
                Terminal,
                setupScriptsSection,
                renderEnvironmentAddIconButton("Add Script", addSetupScript)
              )
            );
            const environmentDetailActiveSection =
              normalizedEnvironmentDetailTab === "runtime"
                ? environmentDetailAdvancedSettingsList
                : normalizedEnvironmentDetailTab === "settings"
                  ? environmentAccessSettingsSection
                  : environmentDetailGeneralSection;
  
            function renderEnvironmentVersionsSidebar() {
              if (!canShowEnvironmentDetailHeaderPublish || !environmentVersionsSidebarOpen) {
                return null;
              }
              const versions = readDraftEnvironmentVersions();
              const metadata = getEnvironmentVersionMetadata();
              const activeVersion = getDraftEnvironmentActiveVersion();
              const activeVersionId = String(
                activeVersion?.id
                || metadata.activeEnvironmentVersionId
                || metadata.active_environment_version_id
                || metadata.activeComputerVersionId
                || metadata.active_computer_version_id
                || ""
              ).trim();
              const selectedVersionId = String(
                metadata.restoredFromEnvironmentVersionId
                || metadata.restored_from_environment_version_id
                || metadata.restoredFromComputerVersionId
                || metadata.restored_from_computer_version_id
                || activeVersionId
                || ""
              ).trim();
              const normalizedEnvironmentId = String(
                draftEnvironment?.id || selectedEnvironmentId || ""
              ).trim();
              const versionsLoading = environmentVersionsLoadState.environmentId === normalizedEnvironmentId
                && environmentVersionsLoadState.status === "loading";
              const versionsError = environmentVersionsLoadState.environmentId === normalizedEnvironmentId
                && environmentVersionsLoadState.status === "error"
                ? environmentVersionsLoadState.error
                : "";
              const mutationStateContent = environmentVersionState.status === "loading"
                ? React.createElement(
                    "div",
                    { className: "platform-version-history-sidebar__state" },
                    environmentVersionState.message || "Saving computer version..."
                  )
                : environmentVersionState.status === "error" && environmentVersionState.error
                  ? React.createElement("div", {
                      className: "platform-version-history-sidebar__state is-error",
                      role: "alert",
                    }, environmentVersionState.error)
                  : null;
              return React.createElement(PlatformVersionHistorySidebar, {
                open: environmentVersionsSidebarOpen,
                title: "Version history",
                sectionTitle: "All Versions",
                className: "playground-computer-versions-sidebar",
                width: "var(--playground-thread-task-detail-width)",
                portal: Boolean(environmentVersionsDrawerContainer),
                portalTarget: environmentVersionsDrawerContainer || null,
                versions,
                activeVersionId,
                selectedVersionId,
                loading: versionsLoading,
                loadingMessage: "Loading versions",
                error: versionsError || null,
                emptyDescription: "Save changes to create this computer's first version.",
                busy: saveState.isSaving || environmentVersionState.status === "loading",
                stateContent: mutationStateContent,
                onClose: () => {
                  setEnvironmentVersionChangesState(null);
                  closeEnvironmentVersionsSidebar();
                },
                onSelectVersion: (versionId) => void restoreEnvironmentVersion(versionId),
                onPublishVersion: (versionId) => void publishEnvironmentVersion(versionId),
                canPublishVersion: (version) => canPublishEnvironmentVersion(version),
                onViewChanges: () => openEnvironmentVersionChangesPage(),
                getVersionCreatedAt: (version) => {
                  const timestamp = version.createdAt || version.updatedAt || version.publishedAt;
                  return timestamp ? formatEnvironmentVersionTimestamp(timestamp) : "-";
                },
                getVersionActions: (version) => [
                  {
                    id: "edit",
                    label: "Edit description",
                    icon: SquarePen,
                    onSelect: () => openEditEnvironmentVersionModal(version.id),
                  },
                  {
                    id: "compare",
                    label: "View Changes",
                    icon: Code2,
                    onSelect: () => openEnvironmentVersionChangesPage(version.id),
                  },
                  {
                    id: "delete",
                    label: "Delete version",
                    icon: Trash2,
                    danger: true,
                    disabled: version.status === "active" || versions.length <= 1,
                    onSelect: () => void deleteEnvironmentVersion(version.id),
                  },
                ],
              });
            }
  
            function renderEnvironmentVersionsSidebarPortal() {
              const sidebar = renderEnvironmentVersionsSidebar();
              if (!sidebar) {
                return null;
              }
              if (environmentVersionsDrawerContainer) {
                return sidebar;
              }
              if (versionsDrawerPortalId) {
                return null;
              }
              return sidebar;
            }

            function renderEnvironmentVersionSaveDialog() {
              if (!environmentVersionSaveDialog) {
                return null;
              }
              const versionData = buildEnvironmentVersionSaveDialogData();
              const isBusy = saveState.isSaving || environmentVersionState.status === "loading";
              return React.createElement(PlatformVersionSaveDialog, {
                open: true,
                title: "Review changes",
                currentVersion: versionData.currentVersion,
                nextVersion: versionData.nextVersion,
                currentDescription: versionData.currentDescription,
                initialMode: environmentVersionSaveDialog.initialMode || "new",
                canSaveCurrent: versionData.canSaveCurrent,
                instanceKey: environmentVersionSaveDialog.key,
                pending: isBusy,
                error: environmentVersionState.status === "error"
                  ? environmentVersionState.error
                  : null,
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
                  if (!isBusy) setEnvironmentVersionSaveDialog(null);
                },
                onSubmit: async (details) => {
                  const savedEnvironment = await saveAndPublishCurrentEnvironmentVersion(details);
                  if (!savedEnvironment) {
                    throw new Error("The computer could not be saved and published. Review the validation details and try again.");
                  }
                  setEnvironmentVersionSaveDialog(null);
                },
              });
            }
  
            function renderEnvironmentVersionChangesPage() {
              if (!environmentVersionChangesState) {
                return null;
              }
              const versions = readDraftEnvironmentVersions();
              const sources = buildEnvironmentVersionCompareSources(versions);
              const requestedLeftSourceId = String(environmentVersionChangesState.leftSourceId || "").trim()
                || getDefaultEnvironmentVersionCompareLeftSourceId(versions);
              const requestedRightSourceId = String(environmentVersionChangesState.rightSourceId || "").trim()
                || ENVIRONMENT_VERSION_COMPARE_CURRENT_EDITOR_ID;
              const currentEditorSource = sources.find((source) => source.id === ENVIRONMENT_VERSION_COMPARE_CURRENT_EDITOR_ID) || sources[0] || null;
              const leftSource = resolveEnvironmentVersionCompareSource(requestedLeftSourceId, sources, sources[1] || currentEditorSource);
              const rightSource = resolveEnvironmentVersionCompareSource(requestedRightSourceId, sources, currentEditorSource);
              if (!leftSource || !rightSource) {
                return null;
              }
              const diffFiles = buildEnvironmentVersionDiffFilesFromSnapshots(leftSource.snapshot, rightSource.snapshot);
              const compareOptions = sources.map((source) =>
                React.createElement("option", { key: source.id, value: source.id }, source.label)
              );
              const renderCompareSelect = (value, side) =>
                React.createElement("label", { className: "playground-version-changes-select-shell" },
                  React.createElement("span", { className: "playground-version-changes-select-control-wrap" },
                    React.createElement("select", {
                      className: "playground-version-changes-select-control",
                      value,
                      onChange: (event) => handleEnvironmentVersionCompareSourceChange(side, event.target.value),
                    }, compareOptions),
                    React.createElement(ChevronDown, { width: 13, height: 13, strokeWidth: 1.8, "aria-hidden": "true" })
                  )
                );
              return renderPlaygroundVersionChangesPage({
                title: "Changes",
                compareControls: React.createElement(React.Fragment, null,
                  renderCompareSelect(leftSource.id, "left"),
                  React.createElement("span", { className: "playground-version-changes-select-arrow", "aria-hidden": "true" }, "→"),
                  renderCompareSelect(rightSource.id, "right")
                ),
                actions: renderEnvironmentPublishAction(),
                files: diffFiles,
                backIcon: ArrowLeft,
                backText: "Back",
                backLabel: "Back to computer details",
                onBack: closeEnvironmentVersionChangesPage,
                emptyMessage: "No differences from the current editor.",
                className: "playground-computer-version-changes-page",
              });
            }
  
            function renderEnvironmentVersionModal() {
              if (!environmentVersionModal) {
                return null;
              }
              const isBusy = saveState.isSaving || environmentVersionState.status === "loading";
              const versionLabel = formatPlatformVersionLabel(environmentVersionModal.version);
  
              function renderEnvironmentVersionDescriptionField() {
                return React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-tasks-issue-description-editor playground-agents-version-description-editor playground-computer-version-description-editor" },
                  React.createElement("div", { className: "playground-tasks-detail-section-header" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                    React.createElement("div", { className: "playground-tasks-detail-format-actions" },
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
                          disabled: isBusy,
                          onMouseDown: (event) => event.preventDefault(),
                          onClick: () => handleEnvironmentVersionDescriptionFormat(action.id),
                        }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                      )
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isEnvironmentVersionDescriptionEditing ? " is-editing" : " is-preview") },
                    !isEnvironmentVersionDescriptionEditing
                      ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                          String(environmentVersionDescriptionDraft || "").trim()
                            ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                content: environmentVersionDescriptionDraft,
                                className: "playground-tasks-detail-description-preview tb-message-markdown",
                              })
                            : React.createElement("div", {
                                className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                              }, "Describe what changed in this version.")
                        )
                      : null,
                    React.createElement("textarea", {
                      ref: environmentVersionDescriptionTextareaRef,
                      className: "playground-tasks-detail-description-input " + (isEnvironmentVersionDescriptionEditing ? "is-editing" : "is-preview"),
                      rows: 1,
                      placeholder: isEnvironmentVersionDescriptionEditing ? "Describe what changed in this version." : "",
                      value: environmentVersionDescriptionDraft || "",
                      disabled: isBusy,
                      onFocus: (event) => {
                        setIsEnvironmentVersionDescriptionEditing(true);
                        resizeEnvironmentDescriptionTextarea(event.currentTarget);
                      },
                      onChange: (event) => {
                        setEnvironmentVersionDescriptionDraft(event.target.value);
                        resizeEnvironmentDescriptionTextarea(event.currentTarget);
                      },
                      onBlur: () => setIsEnvironmentVersionDescriptionEditing(false),
                      onKeyDown: (event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          closeEnvironmentVersionModal();
                        }
                      },
                    })
                  )
                );
              }
  
              return renderPlaygroundPlatformModal({
                open: Boolean(environmentVersionModal),
                visible: environmentVersionModalVisible,
                closing: environmentVersionModalClosing,
                onClose: () => closeEnvironmentVersionModal(),
                as: "form",
                backdropClassName: "playground-tasks-project-issue-backdrop playground-agents-version-modal-backdrop playground-computer-version-modal-backdrop",
                className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-agents-version-modal playground-computer-version-modal",
                ariaLabel: "Edit computer version",
                surfaceProps: {
                  onSubmit: (event) => {
                    event.preventDefault();
                    void commitEnvironmentVersionModal();
                  },
                  onKeyDown: (event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      closeEnvironmentVersionModal();
                    }
                  },
                },
                children: React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                      React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                        React.createElement(SquarePen, { width: 18, height: 18, strokeWidth: 1.9 })
                      ),
                      React.createElement("input", {
                        type: "text",
                        className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
                        value: versionLabel,
                        "aria-label": "Version identifier",
                        readOnly: true,
                        tabIndex: -1,
                        disabled: isBusy,
                      })
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: () => closeEnvironmentVersionModal(),
                      title: "Close",
                      disabled: isBusy,
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-tasks-issue-modal-body" },
                    renderEnvironmentVersionDescriptionField(),
                    environmentVersionState.status === "error" && environmentVersionState.error
                      ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, environmentVersionState.error)
                      : null
                  ),
                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: () => closeEnvironmentVersionModal(),
                      disabled: isBusy,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "submit",
                      className: "playground-environments-action-button is-primary",
                      disabled: isBusy,
                    }, isBusy ? "Saving..." : "Save Version")
                  )
                )
              });
            }
  
            function renderEnvironmentShareTeamModal() {
              return renderEnvironmentShareTeamModalElement();
            }
  
            function renderEnvironmentApiModal() {
              if (!environmentApiModalOpen) {
                return null;
              }
              const snippetTabs = [
                { id: "curl", label: "cURL" },
                { id: "python", label: "Python" },
                { id: "javascript", label: "JavaScript" },
              ];
              const effectiveEnvironmentApiAgentId = String(
                selectedEnvironmentApiAgent?.id
                || environmentApiAgentId
                || environmentApiDefaultAgentId
                || "agent_assistant"
              ).trim() || "agent_assistant";
              const snippets = buildEnvironmentApiSnippets(draftEnvironment, effectiveEnvironmentApiAgentId);
              const activeSnippet = snippets[environmentApiSnippetTab] || snippets.curl;
              const activeSnippetLanguage = ({
                curl: "shell",
                python: "python",
                javascript: "javascript",
              })[environmentApiSnippetTab] || "shell";
              const activeSnippetExtension = ({
                curl: "sh",
                python: "py",
                javascript: "js",
              })[environmentApiSnippetTab] || "sh";
              const activeSnippetLineCount = String(activeSnippet || "").split(/\n/).length || 1;
              const activeSnippetCodeHeight = Math.min(460, Math.max(240, activeSnippetLineCount * 20 + 24)) + "px";
              const environmentApiSnippetSlug = String((draftEnvironment?.id || "computer") + "-" + effectiveEnvironmentApiAgentId + "-" + environmentApiSnippetTab)
                .replace(/[^A-Za-z0-9_.:-]+/g, "_")
                .slice(0, 96);
              const EnvironmentApiEditorComponent = serverPreviewEditorModule?.default || null;
              const environmentApiCodePreview = EnvironmentApiEditorComponent
                ? React.createElement("div", {
                    className: "playground-server-invoke-code-editor playground-code-preview-editor-shell playground-computer-api-code-editor",
                    style: { "--playground-server-invoke-code-height": activeSnippetCodeHeight },
                  },
                    React.createElement(EnvironmentApiEditorComponent, {
                      path: "computer-api-" + environmentApiSnippetSlug + "." + activeSnippetExtension,
                      height: activeSnippetCodeHeight,
                      language: activeSnippetLanguage,
                      theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                      value: activeSnippet,
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
                      className: "playground-code-preview-state playground-server-invoke-code-editor playground-computer-api-code-editor",
                      style: { "--playground-server-invoke-code-height": activeSnippetCodeHeight },
                    },
                      React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                      React.createElement("span", null, "Loading editor...")
                    )
                  : React.createElement("pre", {
                      className: "playground-server-invoke-code-fallback playground-computer-api-code",
                      style: { minHeight: activeSnippetCodeHeight },
                    },
                      React.createElement("code", null, activeSnippet)
                    );
              const environmentApiAgentPopoverOpen = environmentRuntimePopover === "api-agent";
              const environmentApiAgentLabel = selectedEnvironmentApiAgent?.name || selectedEnvironmentApiAgent?.label || effectiveEnvironmentApiAgentId || "Agent";
              const environmentApiAgentSelector = React.createElement("div", {
                  className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell playground-agents-model-select-popup playground-computer-api-agent-select-popup" + (environmentApiAgentPopoverOpen ? " is-open" : ""),
                  ref: environmentApiAgentPopoverOpen ? environmentRuntimePopoverRef : null,
                },
                React.createElement("button", {
                    type: "button",
                    className: "playground-environments-runtime-value-button playground-agents-model-picker-trigger",
                    onClick: () => setEnvironmentRuntimePopover((current) => current === "api-agent" ? "" : "api-agent"),
                    title: environmentApiAgentLabel,
                    "aria-label": "Agent: " + environmentApiAgentLabel,
                    "aria-expanded": environmentApiAgentPopoverOpen ? "true" : "false",
                  },
                  React.createElement("span", { className: "playground-agents-model-picker-trigger-copy" },
                    React.createElement("span", { className: "playground-agents-model-provider-icon-shell", "aria-hidden": "true" },
                      React.createElement(Bot, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("span", { className: "playground-agents-model-picker-trigger-labels" },
                      React.createElement("span", { className: "playground-environments-runtime-value-label" }, environmentApiAgentLabel)
                    )
                  ),
                  React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                ),
                environmentApiAgentPopoverOpen
                  ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                      environmentApiAgentOptions.map((agent) => {
                        const agentId = String(agent?.id || "").trim();
                        const isSelected = agentId === effectiveEnvironmentApiAgentId;
                        return React.createElement("button", {
                            key: agentId,
                            type: "button",
                            className: "tb-popup-row tb-popup-row-select" + (isSelected ? " selected" : ""),
                            onClick: () => {
                              setEnvironmentApiAgentId(agentId);
                              setEnvironmentRuntimePopover("");
                            },
                          },
                          React.createElement("span", { className: "tb-popup-check-slot" },
                            isSelected
                              ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                              : null
                          ),
                          React.createElement("span", null, agent?.name || agentId)
                        );
                      })
                    )
                  : null
              );
              const modal = renderPlaygroundPlatformModal({
                open: environmentApiModalOpen,
                visible: environmentApiModalVisible,
                closing: environmentApiModalClosing,
                onClose: () => closeEnvironmentApiModal(),
                backdropClassName: "playground-tasks-project-issue-backdrop playground-computer-api-modal-backdrop",
                className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-computer-api-modal",
                ariaLabel: "Use computer via API",
                children: React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                      React.createElement("div", {
                        className: "playground-content-title playground-tasks-project-modal-name-input",
                        style: { display: "flex", alignItems: "center" },
                      }, "Use via API"),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-settings-icon-button playground-tasks-project-modal-close",
                        onClick: () => closeEnvironmentApiModal(),
                        title: "Close",
                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-issue-modal-body playground-computer-api-modal-body" },
                    React.createElement("div", { className: "playground-computer-api-config-row" },
                      React.createElement("div", { className: "playground-computer-api-config-label" }, "Agent"),
                      environmentApiAgentSelector
                    ),
                    React.createElement("div", { className: "playground-server-invoke-card playground-computer-api-card" },
                      React.createElement("div", { className: "playground-server-invoke-header playground-computer-api-header" },
                        React.createElement("div", { className: "playground-server-invoke-tabs", role: "tablist", "aria-label": "Computer API examples" },
                          snippetTabs.map((tab) =>
                            React.createElement("button", {
                              key: tab.id,
                              type: "button",
                              role: "tab",
                              className: "playground-server-invoke-tab" + (environmentApiSnippetTab === tab.id ? " is-active" : ""),
                              "aria-selected": environmentApiSnippetTab === tab.id ? "true" : "false",
                              onClick: () => setEnvironmentApiSnippetTab(tab.id),
                            }, tab.label)
                          )
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-settings-icon-button playground-computer-api-copy-button",
                          onClick: () => void copyEnvironmentApiSnippet(environmentApiSnippetTab, activeSnippet),
                          title: "Copy code",
                          "aria-label": "Copy code",
                        }, copiedEnvironmentApiSnippet === environmentApiSnippetTab
                          ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.9 })
                          : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.9 }))
                      ),
                      environmentApiCodePreview
                    )
                  )
                )
              });
              return modal && typeof createPortal === "function" && typeof document !== "undefined" && document.body
                ? createPortal(modal, document.body)
                : modal;
            }
  
            const environmentDetailWorkspaceSection = React.createElement(ComputerDetailPage, {
                header: environmentProfileSection,
                tabBarActions: environmentDetailTabBarActions,
                sidebarToggle: environmentDetailSidebarToggle,
                sidebar: environmentSidebar,
                activeTab: normalizedEnvironmentDetailTab,
                onTabChange: (tab) => {
                  if (tab !== "settings" && environmentPermissionPrincipalId) {
                    handleEnvironmentAccessPrincipalChange("");
                  }
                  setEnvironmentDetailTab(tab);
                  if (tab === "settings") {
                    setEnvironmentPermissionChartAnimationKey((current) => current + 1);
                    if (
                      typeof onWorkspaceTeamsRequest === "function"
                      && !workspaceTeamsLoading
                    ) {
                      onWorkspaceTeamsRequest({});
                    }
                  }
                },
                onOpenFilebase: openEnvironmentFilebase,
                filebaseDisabled: !draftEnvironment?.id
                  || draftEnvironment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID
                  || typeof onOpenFilesPage !== "function",
                sidebarCollapsed: environmentSidebarCollapsed,
                sidebarPopoverOpen: environmentRuntimePopover === "compute-profile",
                ariaLabel: "Computer details for " + (draftEnvironment.name || "Untitled"),
                sidebarAriaLabel: (draftEnvironment.name || "Computer") + " settings",
              },
              environmentDetailActiveSection
            );
            const environmentDetailTopNavActions = topNavActionsContainer
              && canShowEnvironmentDetailHeaderPublish
              ? createPortal(
                  renderEnvironmentPublishAction(),
                  topNavActionsContainer
                )
              : null;
  
            return React.createElement(React.Fragment, null,
              environmentDetailTopNavActions,
              React.createElement("div", { className: "playground-environments-editor-main playground-tasks-detail-main playground-computer-detail-main", ref: environmentDetailMainRef },
              React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" },
                React.createElement("div", { className: "playground-agents-detail-content playground-computer-detail-content is-agent-overview-general" },
                  environmentVersionChangesState
                    ? renderEnvironmentVersionChangesPage()
                    : React.createElement(React.Fragment, null,
                        environmentGuiState.error
                          ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, environmentGuiState.error)
                          : null,
                        environmentDetailWorkspaceSection
                      )
                )
              )
              ),
              desktopOverlay,
              renderEnvironmentVersionsSidebarPortal(),
              renderEnvironmentVersionSaveDialog(),
              renderEnvironmentVersionModal(),
              renderEnvironmentShareTeamModalElement(),
              renderEnvironmentApiModal()
            );
          }
  

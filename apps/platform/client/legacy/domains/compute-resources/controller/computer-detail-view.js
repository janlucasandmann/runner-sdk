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
              { id: "day", label: "1D" },
              { id: "week", label: "1W" },
              { id: "month", label: "1M" },
            ];
            const renderEnvironmentDetailTimescaleControl = () => React.createElement("div", {
                className: "playground-project-overview-progress-combo-ranges",
                role: "group",
                "aria-label": "Computer detail chart timescale",
              },
              environmentDetailTimescaleOptions.map((option) =>
                React.createElement("button", {
                  key: option.id,
                  type: "button",
                  className: "playground-project-overview-progress-combo-range" + (normalizedEnvironmentDetailChartTimescale === option.id ? " is-active" : ""),
                  onClick: () => setEnvironmentDetailChartTimescale(option.id),
                  "aria-pressed": normalizedEnvironmentDetailChartTimescale === option.id ? "true" : "false",
                }, option.label)
              )
            );
            const renderEnvironmentDetailActivityChart = () => renderHomeStackedUsageChartShared({
              ariaLabel: "Computer run activity",
              labels: activeEnvironmentActivityLabels,
              series: [
                {
                  id: "computer-runs",
                  label: "Runs",
                  color: "rgb(143,196,255)",
                  values: activeEnvironmentActivityCounts,
                },
              ],
              emptyText: environmentAnalyticsError || "No computer activity yet",
              emptyContent: isEnvironmentAnalyticsLoading
                ? null
                : React.createElement("div", { className: "playground-settings-usage-chart-empty is-tall playground-auth-users-empty-state" },
                    React.createElement("div", { className: "playground-auth-users-empty-state-title" }, "No Computer Usage yet"),
                    React.createElement("div", { className: "playground-auth-users-empty-state-copy" }, "Computer usage appears here once agents run work inside this computer.")
                  ),
              tickFormatter: (value) => String(Math.round(Number(value) || 0)),
              isLoading: isEnvironmentAnalyticsLoading && !activeEnvironmentAnalytics,
              showLegend: true,
              timescaleControl: null,
              controlsInFooter: false,
              hideHeader: true,
            });
            const environmentAnalyticsSection = React.createElement("section", { className: "playground-project-overview-progress-combo-card playground-agents-detail-progress-combo-card playground-computer-detail-progress-combo-card" },
              React.createElement("div", { className: "playground-project-overview-progress-combo-topbar" },
                React.createElement("h2", { className: "playground-project-overview-progress-combo-title" }, "Analytics"),
                React.createElement("div", { className: "playground-project-overview-progress-combo-actions" },
                  renderEnvironmentDetailTimescaleControl()
                )
              ),
              React.createElement("div", { className: "playground-project-overview-progress-combo-metrics" },
                environmentDetailKpis.map((item) =>
                  React.createElement("div", { key: item.id, className: "playground-project-overview-progress-combo-metric" },
                    React.createElement("div", { className: "playground-project-overview-progress-combo-metric-label" },
                      React.createElement("span", { className: "playground-project-overview-progress-combo-metric-dot is-" + item.id, "aria-hidden": "true" }),
                      React.createElement("span", null, item.label)
                    ),
                    React.createElement("div", { className: "playground-project-overview-progress-combo-metric-value" }, item.value)
                  )
                )
              ),
              shouldShowEnvironmentAnalytics && environmentAnalyticsError
                ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, environmentAnalyticsError)
                : null,
              React.createElement("div", { className: "playground-project-overview-progress-combo-chart playground-computer-detail-progress-combo-chart" },
                renderEnvironmentDetailActivityChart()
              )
            );
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
            const environmentDescriptionFormatActions = React.createElement("div", { className: "playground-tasks-detail-format-actions" },
              [
                { id: "bold", label: "Bold", icon: Bold, strokeWidth: 2.7 },
                { id: "italic", label: "Italic", icon: Italic },
                { id: "underline", label: "Underline", icon: Underline },
                { id: "list", label: "List", icon: List },
              ].map((action) =>
                React.createElement("button", {
                  key: "computer-description-" + action.id,
                  type: "button",
                  className: "playground-tasks-detail-format-button",
                  title: action.label,
                  "aria-label": action.label,
                  onMouseDown: (event) => event.preventDefault(),
                  onClick: () => handleEnvironmentDescriptionFormat(action.id),
                }, React.createElement(action.icon, {
                  width: 14,
                  height: 14,
                  strokeWidth: action.strokeWidth || 1.8,
                }))
              )
            );
            const descriptionSection = React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section playground-computer-detail-description-section" },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                environmentDescriptionFormatActions
              ),
              React.createElement("div", {
                  className: "playground-tasks-detail-description-editor"
                    + (isEnvironmentDescriptionEditing ? " is-editing" : " is-preview"),
                },
                !isEnvironmentDescriptionEditing
                  ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                      String(draftEnvironment.description || "").trim()
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: draftEnvironment.description,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", {
                            className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                          }, "Add Description here")
                    )
                  : null,
                React.createElement("textarea", {
                  ref: environmentDescriptionTextareaRef,
                  className: "playground-tasks-detail-description-input " + (isEnvironmentDescriptionEditing ? "is-editing" : "is-preview"),
                  rows: 1,
                  placeholder: isEnvironmentDescriptionEditing ? "Add Description here" : "",
                  value: draftEnvironment.description || "",
                  onFocus: () => setIsEnvironmentDescriptionEditing(true),
                  onChange: (event) => {
                    updateEnvironmentField("description", event.target.value);
                    resizeEnvironmentDescriptionTextarea(event.currentTarget);
                  },
                  onBlur: () => {
                    setIsEnvironmentDescriptionEditing(false);
                    commitDraftEnvironmentIfDirty();
                  },
                })
              )
            );
  
            const runtimesSection = React.createElement("div", { className: "playground-tasks-connectors playground-environments-runtimes-section" },
              React.createElement("div", { className: "playground-tasks-connectors-list" },
                PLAYGROUND_RUNTIME_DEFINITIONS.map((runtime) => {
                  const versions = availableRuntimes[runtime.key] || [];
                  const currentValue = draftEnvironment.runtimes?.[runtime.key] || "";
                  const runtimeOptions = currentValue && !versions.includes(currentValue)
                    ? [currentValue, ...versions]
                    : versions;
                  const isPopoverOpen = environmentRuntimePopover === runtime.key;
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
                      React.createElement("div", {
                          className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell" + (isPopoverOpen ? " is-open" : ""),
                          ref: isPopoverOpen ? environmentRuntimePopoverRef : null,
                        },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-runtime-value-button" + (currentValue ? "" : " is-empty"),
                          onClick: () => setEnvironmentRuntimePopover((current) => current === runtime.key ? "" : runtime.key),
                        },
                          React.createElement("span", { className: "playground-environments-runtime-value-label" }, currentValue || "Disabled"),
                          React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                        ),
                        isPopoverOpen
                          ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                              React.createElement("button", {
                                  type: "button",
                                  className: "tb-popup-row tb-popup-row-select" + (!currentValue ? " selected" : ""),
                                  onClick: () => {
                                    updateRuntime(runtime.key, "");
                                    setEnvironmentRuntimePopover("");
                                  },
                                },
                                  React.createElement("span", { className: "tb-popup-check-slot" },
                                    !currentValue
                                      ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                      : null
                                  ),
                                  React.createElement("span", null, "Disabled")
                                ),
                              runtimeOptions.map((version) =>
                                React.createElement("button", {
                                    key: version,
                                    type: "button",
                                    className: "tb-popup-row tb-popup-row-select" + (currentValue === version ? " selected" : ""),
                                    onClick: () => {
                                      updateRuntime(runtime.key, version);
                                      setEnvironmentRuntimePopover("");
                                    },
                                  },
                                    React.createElement("span", { className: "tb-popup-check-slot" },
                                      currentValue === version
                                        ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                        : null
                                    ),
                                    React.createElement("span", null, version)
                                  )
                              )
                            )
                          : null
                      )
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
  
            const dockerfileSection = React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-environments-dockerfile-extension-section" },
              React.createElement("div", { className: "playground-tasks-detail-description-editor is-editing" },
                React.createElement("textarea", {
                  ref: environmentDockerfileTextareaRef,
                  className: "playground-tasks-detail-description-input is-editing playground-environments-dockerfile-extension-input",
                  rows: 1,
                  placeholder: "RUN apt-get update && apt-get install -y custom-tool",
                  value: draftEnvironment.dockerfileExtensions || "",
                  onChange: (event) => {
                    updateEnvironmentField("dockerfileExtensions", event.target.value);
                    resizeEnvironmentDescriptionTextarea(event.currentTarget);
                  },
                  onBlur: commitDraftEnvironmentIfDirty,
                })
              )
            );
  
            const environmentResourceDetailBackButton = embeddedInResources
              ? React.createElement("button", {
                  type: "button",
                  className: "playground-resource-detail-back-button",
                  onClick: showEnvironmentsHome,
                  "aria-label": "Back to Computers",
                },
                  React.createElement(ArrowLeft, { width: 12, height: 12, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Back")
                )
              : null;
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
            const environmentVersionPopupActions = getEnvironmentVersionPopupActions({ includeVersionHistory: false });
            const environmentDetailVersions = readDraftEnvironmentVersions();
            const selectedEnvironmentDetailVersion = getDraftEnvironmentSelectedVersion() || getDraftEnvironmentActiveVersion() || environmentDetailVersions[0] || null;
            const activeEnvironmentDetailVersion = getDraftEnvironmentActiveVersion();
            const selectedEnvironmentDetailVersionId = String(selectedEnvironmentDetailVersion?.id || "").trim();
            const activeEnvironmentDetailVersionId = String(activeEnvironmentDetailVersion?.id || "").trim();
            const environmentTagLabels = getEnvironmentTagLabels(draftEnvironment);
            const getEnvironmentDetailVersionTitle = (version) => {
              if (!version) return "No versions";
              return String(version.label || ("Version " + (version.version || ""))).trim() || "Version";
            };
            const getEnvironmentDetailVersionMeta = (version) => {
              if (!version) return "";
              const versionId = String(version.id || "").trim();
              const status = versionId && versionId === activeEnvironmentDetailVersionId
                ? "Published"
                : (String(version.status || "").toLowerCase() === "active" ? "Published" : "Saved");
              const timestamp = String(version.publishedAt || version.updatedAt || version.createdAt || "").trim();
              const formattedTimestamp = timestamp ? formatPlaygroundFileDate(timestamp) : "";
              return status + (formattedTimestamp ? " · " + formattedTimestamp : "");
            };
            const renderEnvironmentVersionCountLabel = () => {
              const versionCountLabel = String(environmentDetailVersions.length) + " " + (environmentDetailVersions.length === 1 ? "Version" : "Versions");
              return React.createElement("div", {
                  className: "playground-agents-version-count-label playground-computer-version-count-label",
                  title: versionCountLabel,
                  "aria-label": versionCountLabel,
                },
                React.createElement(GitBranch, { className: "playground-agents-version-count-icon", strokeWidth: 1.8 }),
                React.createElement("span", null, versionCountLabel)
              );
            };
            const renderEnvironmentVersionSelector = () => {
              const hasVersions = environmentDetailVersions.length > 0;
              const currentTitle = getEnvironmentDetailVersionTitle(selectedEnvironmentDetailVersion);
              const selectorDisabled = isEnvironmentVersionControlBusy;
              const canCreateVersionFromSelector = Boolean(canShowEnvironmentDetailHeaderPublish && !isEnvironmentVersionControlBusy);
              const toggleSelectorMenu = (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (selectorDisabled) {
                  return;
                }
                setEnvironmentPublishMenuOpen(false);
                setEnvironmentVersionsHeaderMenuOpen(false);
                setEnvironmentTagsMenuOpen(false);
                setEnvironmentVersionSelectorMenuOpen((current) => !current);
              };
              return React.createElement("div", { className: "playground-agents-detail-version-selector-row playground-computer-detail-version-selector-row" },
                renderPlaygroundPlatformPopup({
                  open: environmentVersionSelectorMenuOpen,
                  shellRef: environmentVersionSelectorMenuRef,
                  shellClassName: "playground-agents-detail-publish-split-shell playground-agents-detail-version-selector-shell playground-computer-detail-version-selector-shell",
                  menuClassName: "playground-agents-detail-publish-menu playground-agents-detail-version-selector-menu playground-computer-detail-version-selector-menu",
                  trigger: React.createElement("div", {
                      className: "playground-metronome-create-button playground-metronome-publish-button playground-agents-detail-header-publish-button playground-computer-detail-header-publish-button playground-agents-detail-publish-split-control playground-agents-detail-version-selector-control"
                        + (environmentVersionSelectorMenuOpen ? " is-active" : "")
                        + (selectorDisabled ? " is-disabled" : ""),
                    },
                    React.createElement("button", {
                        type: "button",
                        className: "playground-agents-detail-publish-main playground-agents-detail-version-selector-main",
                        title: currentTitle,
                        "aria-label": "Choose computer version",
                        "aria-haspopup": "menu",
                        "aria-expanded": environmentVersionSelectorMenuOpen ? "true" : "false",
                        disabled: selectorDisabled,
                        onClick: toggleSelectorMenu,
                      },
                      React.createElement(GitBranch, { className: "playground-agents-detail-version-selector-icon", strokeWidth: 1.8 }),
                      React.createElement("span", { className: "playground-agents-detail-version-selector-label" }, currentTitle)
                    ),
                    React.createElement("span", { className: "playground-agents-detail-publish-divider", "aria-hidden": "true" }),
                    React.createElement("button", {
                        type: "button",
                        className: "playground-agents-detail-publish-chevron",
                        title: "Choose computer version",
                        "aria-label": "Choose computer version",
                        "aria-haspopup": "menu",
                        "aria-expanded": environmentVersionSelectorMenuOpen ? "true" : "false",
                        disabled: selectorDisabled,
                        onClick: toggleSelectorMenu,
                      },
                      React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                    )
                  ),
                  menuProps: {
                    role: "menu",
                    onClick: (event) => event.stopPropagation(),
                  },
                  children: React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-agents-detail-version-selector-list", role: "group", "aria-label": "Computer versions" },
                      hasVersions
                        ? environmentDetailVersions.map((version, index) => {
                            const versionId = String(version?.id || "").trim() || "version-" + index;
                            const isSelected = versionId === selectedEnvironmentDetailVersionId;
                            return React.createElement("button", {
                                key: versionId,
                                type: "button",
                                className: "tb-popup-row playground-agents-detail-version-selector-option" + (isSelected ? " is-selected" : ""),
                                role: "menuitemradio",
                                "aria-checked": isSelected ? "true" : "false",
                                disabled: isEnvironmentVersionControlBusy || isSelected,
                                onClick: () => {
                                  if (isEnvironmentVersionControlBusy || isSelected) {
                                    return;
                                  }
                                  setEnvironmentVersionSelectorMenuOpen(false);
                                  void restoreEnvironmentVersion(versionId);
                                },
                              },
                              React.createElement("span", { className: "playground-agents-detail-version-selector-option-check" },
                                isSelected
                                  ? React.createElement(Check, { width: 13, height: 13, strokeWidth: 2.2 })
                                  : null
                              ),
                              React.createElement("span", { className: "playground-agents-detail-version-selector-option-copy" },
                                React.createElement("span", { className: "playground-agents-detail-version-selector-option-title" }, getEnvironmentDetailVersionTitle(version)),
                                React.createElement("span", { className: "playground-agents-detail-version-selector-option-meta" }, getEnvironmentDetailVersionMeta(version))
                              )
                            );
                          })
                        : React.createElement("div", { className: "playground-agents-detail-version-selector-empty" }, "No versions yet.")
                    ),
                    React.createElement("div", { className: "playground-agents-detail-version-selector-footer" },
                      React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row playground-agents-detail-version-selector-new-button",
                          role: "menuitem",
                          disabled: !canCreateVersionFromSelector,
                          onClick: () => {
                            if (!canCreateVersionFromSelector) {
                              return;
                            }
                            setEnvironmentVersionSelectorMenuOpen(false);
                            openCreateEnvironmentVersionModal({ force: true });
                          },
                        },
                        React.createElement(GitBranchPlus, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.1 }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "New Version")
                        )
                      ),
                      React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row playground-agents-detail-version-selector-new-button",
                          role: "menuitem",
                          disabled: !canShowEnvironmentDetailHeaderPublish || isEnvironmentVersionControlBusy,
                          onClick: () => {
                            if (!canShowEnvironmentDetailHeaderPublish || isEnvironmentVersionControlBusy) {
                              return;
                            }
                            setEnvironmentVersionSelectorMenuOpen(false);
                            setEnvironmentPublishMenuOpen(false);
                            setEnvironmentTagsMenuOpen(false);
                            setEnvironmentVersionsHeaderMenuOpen(false);
                            openEnvironmentVersionChangesPage();
                          },
                        },
                        React.createElement(History, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.1 }),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, "Version history")
                        )
                      )
                    )
                  )
                }),
                renderEnvironmentVersionCountLabel(),
                renderEnvironmentTagsControl()
              );
            };
            const handleEnvironmentTagSubmit = (event) => {
              event.preventDefault();
              const nextLabel = normalizeEnvironmentTagLabel(environmentTagInputValue);
              if (!nextLabel) {
                return;
              }
              const existingKey = nextLabel.toLowerCase();
              if (environmentTagLabels.some((label) => label.toLowerCase() === existingKey)) {
                setEnvironmentTagInputValue("");
                return;
              }
              updateEnvironmentTagLabels([...environmentTagLabels, nextLabel]);
              setEnvironmentTagInputValue("");
            };
            const removeEnvironmentTagLabel = (labelToRemove) => {
              const removeKey = normalizeEnvironmentTagLabel(labelToRemove).toLowerCase();
              if (!removeKey) {
                return;
              }
              updateEnvironmentTagLabels(environmentTagLabels.filter((label) => label.toLowerCase() !== removeKey));
            };
            function renderEnvironmentTagsControl() {
              return renderPlaygroundPlatformPopup({
                open: environmentTagsMenuOpen,
                shellRef: environmentTagsMenuRef,
                shellClassName: "playground-agents-tags-control-shell playground-computer-tags-control-shell playground-tasks-toolbar-popup-shell",
                menuClassName: "playground-agents-tags-menu playground-computer-tags-menu",
                trigger: React.createElement("button", {
                    type: "button",
                    className: "playground-agents-tags-control-button" + (environmentTagsMenuOpen ? " is-active" : ""),
                    "aria-label": "Edit computer tags",
                    "aria-haspopup": "menu",
                    "aria-expanded": environmentTagsMenuOpen ? "true" : "false",
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setEnvironmentPublishMenuOpen(false);
                      setEnvironmentVersionSelectorMenuOpen(false);
                      setEnvironmentVersionsHeaderMenuOpen(false);
                      setEnvironmentTagsMenuOpen((current) => !current);
                    },
                  },
                  React.createElement(Tag, { className: "playground-agents-tags-control-icon", strokeWidth: 1.8 }),
                  React.createElement("span", null, "Tags"),
                  React.createElement("span", { className: "playground-agents-tags-count" }, String(environmentTagLabels.length))
                ),
                menuProps: {
                  role: "menu",
                  onClick: (event) => event.stopPropagation(),
                },
                children: React.createElement("div", { className: "playground-agents-tags-menu-content" },
                  React.createElement("form", {
                      className: "playground-agents-tags-form",
                      onSubmit: handleEnvironmentTagSubmit,
                    },
                    React.createElement("input", {
                      type: "text",
                      className: "playground-agents-tags-input",
                      value: environmentTagInputValue,
                      placeholder: "Add label",
                      "aria-label": "Add computer tag",
                      onChange: (event) => setEnvironmentTagInputValue(event.target.value),
                      onKeyDown: (event) => event.stopPropagation(),
                    }),
                    React.createElement("button", {
                      type: "submit",
                      className: "playground-agents-tags-add-button",
                      disabled: !normalizeEnvironmentTagLabel(environmentTagInputValue),
                      "aria-label": "Add tag",
                    }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }))
                  ),
                  environmentTagLabels.length > 0
                    ? React.createElement("div", { className: "playground-agents-tags-list" },
                        environmentTagLabels.map((label) =>
                          React.createElement("span", { key: label, className: "playground-agents-tags-chip" },
                            React.createElement("span", { className: "playground-agents-tags-chip-label" }, label),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-agents-tags-chip-remove",
                              "aria-label": "Remove " + label,
                              onClick: () => removeEnvironmentTagLabel(label),
                            }, React.createElement(X, { width: 12, height: 12, strokeWidth: 2 }))
                          )
                        )
                      )
                    : React.createElement("div", { className: "playground-agents-tags-empty" }, "No tags yet.")
                )
              });
            }
            const renderEnvironmentPublishSplitButton = () => renderPlaygroundPlatformPopup({
              open: environmentPublishMenuOpen,
              shellRef: environmentPublishMenuRef,
              shellClassName: "playground-agents-detail-publish-split-shell playground-computer-detail-publish-split-shell",
              menuClassName: "playground-agents-detail-publish-menu playground-computer-detail-publish-menu",
              trigger: React.createElement("div", {
                  className: "playground-metronome-create-button playground-metronome-publish-button playground-agents-detail-header-publish-button playground-computer-detail-header-publish-button playground-agents-detail-publish-split-control"
                    + (environmentVersionsSidebarOpen ? " is-active" : "")
                    + (isEnvironmentPublishControlDisabled ? " is-disabled" : ""),
                },
                React.createElement("button", {
                    type: "button",
                    className: "playground-agents-detail-publish-main",
                    title: "Save and publish computer changes",
                    "aria-label": "Save and publish computer changes",
                    disabled: isEnvironmentPublishControlDisabled,
                    onClick: () => {
                      setEnvironmentPublishMenuOpen(false);
                      setEnvironmentVersionSelectorMenuOpen(false);
                      setEnvironmentTagsMenuOpen(false);
                      setEnvironmentVersionsHeaderMenuOpen(false);
                      void saveAndPublishCurrentEnvironmentVersion();
                    },
                  },
                  React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Save & Publish")
                ),
                React.createElement("span", { className: "playground-agents-detail-publish-divider", "aria-hidden": "true" }),
                React.createElement("button", {
                    type: "button",
                    className: "playground-agents-detail-publish-chevron",
                    title: "Version save options",
                    "aria-label": "Version save options",
                    "aria-haspopup": "menu",
                    "aria-expanded": environmentPublishMenuOpen ? "true" : "false",
                    disabled: isEnvironmentPublishControlDisabled,
                    onClick: (event) => {
                      event.stopPropagation();
                      setEnvironmentVersionSelectorMenuOpen(false);
                      setEnvironmentTagsMenuOpen(false);
                      setEnvironmentPublishMenuOpen((current) => !current);
                    },
                  },
                  React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                )
              ),
              menuProps: {
                role: "menu",
                onClick: (event) => event.stopPropagation(),
              },
              children: React.createElement(React.Fragment, null,
                environmentVersionPopupActions.map((action) => React.createElement("button", {
                    key: action.label,
                    type: "button",
                    className: "tb-popup-row",
                    role: "menuitem",
                    disabled: areEnvironmentPublishMenuActionsDisabled || !draftEnvironment || action.disabled,
                    onClick: () => {
                      setEnvironmentPublishMenuOpen(false);
                      void action.onClick();
                    },
                  },
                  React.createElement(getPlaygroundSafeIconComponent(action.Icon, Circle), { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.15 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, action.label)
                  ),
                  action.shortcut
                    ? React.createElement("span", {
                        className: "playground-agents-detail-publish-menu-shortcut",
                        "aria-hidden": "true",
                      }, action.shortcut)
                    : null
                ))
              )
            });
            const renderEnvironmentControlRow = (className) =>
              React.createElement("div", { className },
                canShowEnvironmentDetailHeaderPublish
                  ? renderEnvironmentPublishSplitButton()
                  : null,
                renderEnvironmentSidebarToggleButton()
              );
            const environmentDetailSidebarControls = renderEnvironmentControlRow("playground-agents-detail-sidebar-controls playground-agents-detail-top-controls-actions playground-computer-detail-sidebar-controls playground-computer-detail-top-controls-actions");
            const environmentDetailTopControls = React.createElement("div", { className: "playground-agents-detail-top-controls playground-computer-detail-top-controls" },
              renderEnvironmentVersionSelector(),
              environmentDetailSidebarControls
            );
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
            const environmentSidebar = React.createElement("aside", {
                className: "playground-project-overview-sidebar playground-agents-detail-sidebar playground-computer-detail-sidebar",
                "aria-label": (draftEnvironment.name || "Computer") + " settings",
              },
              React.createElement("section", { className: "playground-project-overview-sidebar-card playground-computer-detail-properties-card" },
                React.createElement("div", { className: "playground-project-overview-sidebar-card-header" },
                  React.createElement("h2", { className: "playground-project-overview-sidebar-title" }, "Properties")
                ),
                React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                  renderEnvironmentSidebarRow("Status", environmentRuntimeStatusNode, {
                    valueClassName: "playground-computer-detail-sidebar-status-value",
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
                    : null
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
            const normalizedEnvironmentDetailTab = environmentDetailTab === "advanced" ? "advanced" : "general";
            const environmentDetailTabs = React.createElement("div", { className: "playground-agents-overview-tabs playground-agents-detail-tabs playground-computer-detail-tabs" },
              React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                [
                  { id: "general", label: "General", Icon: LayoutGrid },
                  { id: "advanced", label: "Advanced Settings", Icon: Settings2 },
                ].map((tab) => {
                  const TabIcon = tab.Icon;
                  return React.createElement("button", {
                      key: tab.id,
                      type: "button",
                      className: "playground-project-overview-chart-tab" + (normalizedEnvironmentDetailTab === tab.id ? " is-active" : ""),
                      onClick: () => setEnvironmentDetailTab(tab.id),
                      "aria-pressed": normalizedEnvironmentDetailTab === tab.id ? "true" : "false",
                    },
                    React.createElement(TabIcon, { className: "playground-agents-detail-tab-icon", strokeWidth: 1.8 }),
                    tab.label
                  );
                }),
                React.createElement("button", {
                    type: "button",
                    className: "playground-project-overview-chart-tab playground-computer-detail-filebase-tab",
                    onClick: openEnvironmentFilebase,
                    disabled: !draftEnvironment?.id || draftEnvironment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID || typeof onOpenFilesPage !== "function",
                    title: "Open Filebase",
                    "aria-label": "Open Filebase for this computer",
                  },
                  React.createElement(FolderOpen, { className: "playground-agents-detail-tab-icon", strokeWidth: 1.8 }),
                  React.createElement("span", null, "Filebase"),
                  React.createElement(ExternalLink, { width: 12, height: 12, strokeWidth: 1.8 })
                )
              )
            );
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
            const environmentDetailAdvancedSection = React.createElement("div", { className: "playground-computer-detail-advanced-tab" },
              renderEditorSection("runtimes", "Runtime Versions", "", runtimeVersionsBox, null, false),
              renderEditorSection(
                "packages-system",
                "System Packages",
                "",
                renderPackageGroup("system", "System", "ffmpeg, curl, imagemagick..."),
                renderEnvironmentAddIconButton("Add Package", () => openPackageComposer("system")),
                false
              ),
              renderEditorSection(
                "packages-python",
                "Python Packages",
                "",
                renderPackageGroup("python", "Python", "numpy, pandas, flask..."),
                renderEnvironmentAddIconButton("Add Package", () => openPackageComposer("python")),
                false
              ),
              renderEditorSection(
                "packages-node",
                "Node.js Packages",
                "",
                renderPackageGroup("node", "Node.js", "express, typescript, axios..."),
                renderEnvironmentAddIconButton("Add Package", () => openPackageComposer("node")),
                false
              ),
              renderEditorSection(
                "variables",
                "Environment Variables",
                "",
                environmentVariablesSection,
                renderEnvironmentAddIconButton("Add Variable", addEnvironmentVariable),
                false
              ),
              renderEditorSection(
                "secrets",
                "Secrets",
                "",
                secretsSection,
                renderEnvironmentAddIconButton("Add Secret", addSecret),
                false
              ),
              renderEditorSection(
                "mcp",
                "MCP Servers",
                "",
                mcpSection,
                renderEnvironmentAddIconButton("Add Server", addMcpServer),
                false
              ),
              renderEditorSection(
                "scripts",
                "Setup Scripts",
                "",
                setupScriptsSection,
                renderEnvironmentAddIconButton("Add Script", addSetupScript),
                false
              ),
              renderEditorSection(
                "dockerfile",
                "Dockerfile Extension",
                "",
                dockerfileSection,
                null,
                false
              )
            );
            const environmentDetailActiveSection = normalizedEnvironmentDetailTab === "advanced"
              ? environmentDetailAdvancedSection
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
              return React.createElement(PlaygroundVersionSidebar, {
                open: environmentVersionsSidebarOpen,
                title: "Publish Computer",
                className: "playground-computer-versions-sidebar",
                versions,
                activeVersionId,
                selectedVersionId,
                state: environmentVersionState,
                busy: environmentVersionState.status === "loading",
                openMenuId: openEnvironmentVersionMenuId,
                onOpenMenuIdChange: setOpenEnvironmentVersionMenuId,
                headerMenuOpen: environmentVersionsHeaderMenuOpen,
                headerMenuActions: getEnvironmentVersionPopupActions({ includeVersionHistory: false }),
                headerMenuDisabled: saveState.isSaving || environmentVersionState.status === "loading",
                onHeaderMenuOpenChange: setEnvironmentVersionsHeaderMenuOpen,
                onClose: closeEnvironmentVersionsSidebar,
                onSaveVersion: () => openCreateEnvironmentVersionModal({ force: true }),
                onRestoreVersion: (versionId) => void restoreEnvironmentVersion(versionId),
                onPublishVersion: (versionId) => void publishEnvironmentVersion(versionId),
                canPublishVersion: (version) => canPublishEnvironmentVersion(version),
                onDeleteVersion: (versionId) => void deleteEnvironmentVersion(versionId),
                versionsSectionFooter: React.createElement("div", { className: "playground-metronome-publish-section-footer playground-agents-version-compare-footer" },
                  React.createElement(PlatformSecondaryButton, {
                    size: "large",
                    type: "button",
                    className: "playground-metronome-secondary-button playground-metronome-publish-new-button playground-agents-version-compare-button",
                    disabled: environmentVersionState.status === "loading" || !versions.length,
                    onClick: () => openEnvironmentVersionChangesPage(),
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
                    onClick: () => openEditEnvironmentVersionModal(version.id),
                  },
                  {
                    id: "compare",
                    label: "View Changes",
                    icon: Code2,
                    onClick: () => openEnvironmentVersionChangesPage(version.id),
                  },
                  {
                    id: "restore",
                    label: "Restore version",
                    icon: RotateCcw,
                    onClick: () => void restoreEnvironmentVersion(version.id),
                  },
                  {
                    id: "delete",
                    label: "Delete version",
                    icon: Trash2,
                    danger: true,
                    onClick: () => void deleteEnvironmentVersion(version.id),
                  },
                ],
                unpublishLabel: "Unpublish computer",
                getVersionTitle: (version) => String(version.label || ("Version " + version.version)).trim(),
                getVersionDescription: () => "",
                getVersionMeta: (version) => {
                  const profile = getPlaygroundEnvironmentComputeProfileConfig(version.computeProfile || version.snapshot?.computeProfile || draftEnvironment?.computeProfile);
                  const lifecycleLabel = getEnvironmentVersionLifecycleLabel(version);
                  const timestamp = version.publishedAt || version.updatedAt || version.createdAt;
                  const actorLabel = getEnvironmentVersionActorLabel(version.publishedAt ? version.publishedBy : (version.updatedBy || version.createdBy));
                  return lifecycleLabel
                    + " "
                    + formatEnvironmentVersionTimestamp(timestamp)
                    + (actorLabel ? " by " + actorLabel : "")
                    + " · "
                    + (profile?.label || "Computer profile");
                },
              });
            }
  
            function renderEnvironmentVersionsSidebarPortal() {
              const sidebar = renderEnvironmentVersionsSidebar();
              if (!sidebar) {
                return null;
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
                actions: renderEnvironmentPublishSplitButton(),
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
              const isEditMode = environmentVersionModal.mode === "edit";
              const trimmedVersionName = String(environmentVersionNameDraft || "").trim();
  
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
                ariaLabel: isEditMode ? "Edit computer version" : "New computer version",
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
                        React.createElement(isEditMode ? SquarePen : GitBranchPlus, { width: 18, height: 18, strokeWidth: 1.9 })
                      ),
                      React.createElement("input", {
                        type: "text",
                        className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
                        value: environmentVersionNameDraft,
                        placeholder: "Version name",
                        autoFocus: true,
                        disabled: isBusy,
                        onChange: (event) => setEnvironmentVersionNameDraft(event.target.value),
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
                      disabled: isBusy || !trimmedVersionName,
                    }, isBusy ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Version" : "Create Version"))
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
  
            const environmentDetailWorkspaceSection = React.createElement("div", {
                className: "playground-project-overview-layout playground-agents-detail-overview-layout playground-computer-detail-overview-layout" + (environmentSidebarCollapsed ? " is-sidebar-collapsed" : ""),
              },
              environmentDetailTabs,
              environmentDetailTopControls,
              React.createElement("div", { className: "playground-project-overview-main playground-agents-detail-overview-main playground-computer-detail-overview-main" },
                environmentDetailActiveSection
              ),
              environmentSidebar
            );
  
            return React.createElement(React.Fragment, null,
              React.createElement("div", { className: "playground-environments-editor-main playground-tasks-detail-main playground-computer-detail-main", ref: environmentDetailMainRef },
              React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" },
                React.createElement("div", { className: "playground-agents-detail-content playground-computer-detail-content is-agent-overview-general" },
                  environmentVersionChangesState
                    ? renderEnvironmentVersionChangesPage()
                    : React.createElement(React.Fragment, null,
                        saveState.error
                          ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, saveState.error)
                          : saveState.message
                            ? React.createElement("div", { className: "playground-environments-success playground-environments-editor-notice" }, saveState.message)
                            : null,
                        environmentGuiState.error
                          ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, environmentGuiState.error)
                          : null,
                        environmentResourceDetailBackButton,
                        environmentProfileSection,
                        environmentDetailWorkspaceSection
                      )
                )
              )
              ),
              desktopOverlay,
              renderEnvironmentVersionsSidebarPortal(),
              renderEnvironmentVersionModal(),
              renderEnvironmentShareTeamModalElement(),
              renderEnvironmentApiModal()
            );
          }
  

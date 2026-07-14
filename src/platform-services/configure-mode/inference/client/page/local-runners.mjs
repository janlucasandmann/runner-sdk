export const INFERENCE_PAGE_LOCAL_RUNNERS_SCRIPT = `                const settingsLocalRunnerBindingsByDeviceId = new Map();
                settingsLocalRunnersState.bindings.forEach((binding) => {
                  const entries = settingsLocalRunnerBindingsByDeviceId.get(binding.deviceId) || [];
                  entries.push(binding);
                  settingsLocalRunnerBindingsByDeviceId.set(binding.deviceId, entries);
                });
                const settingsLocalRunnersLoading = settingsLocalRunnersState.status === "loading";
                const settingsLocalBindingDeviceOptions = settingsLocalRunnersState.devices;
                const settingsLocalBindingEnvironmentOptions = Array.isArray(realEnvironments) ? realEnvironments : [];
                const settingsLocalBindingProjectOptions = Array.isArray(realProjects) ? realProjects : [];
                const settingsLocalBindingCanCreate = hasRealAccess
                  && settingsLocalBindingDeviceOptions.length > 0
                  && settingsLocalBindingEnvironmentOptions.length > 0
                  && settingsLocalRunnersState.bridgeEnabled !== false;
                const settingsLocalRunnerInstallCommand = "pnpm --filter @computer-agents/local-bridge-daemon build";
                const settingsLocalRunnerPairingTokenValue = String(settingsLocalRunnerPairingState.token || "").trim();
                const settingsLocalRunnerStartCommand = "ACP_LOCAL_PAIRING_TOKEN="
                  + (settingsLocalRunnerPairingTokenValue || "<generate-pairing-token>")
                  + " ACP_LOCAL_BRIDGE_ENABLED=1 ACP_LOCAL_RUNTIME_ENABLED=1 acp-local-daemon";
                const settingsLocalRunnerPairingBusy = settingsLocalRunnerPairingState.status === "creating";
                const settingsLocalRunnerPairingPending = settingsLocalRunnerPairingState.status === "waiting"
                  || settingsLocalRunnerPairingState.pairingToken?.status === "pending";
                const settingsLocalRunnersSection = React.createElement("section", { className: "playground-settings-plans-budget-card playground-computer-details-card playground-settings-local-runners-card" },
                  React.createElement("div", { className: "playground-settings-local-runners-header" },
                    React.createElement("div", { className: "playground-settings-inference-endpoint-copy" },
                      React.createElement("div", { className: "playground-settings-card-title" }, "Local Runners"),
                      React.createElement("div", { className: "playground-settings-card-copy" },
                        "Registered bridge devices and workspace bindings for local environments. This is read-only until runtime routing is enabled."
                      )
                    ),
                    React.createElement("div", { className: "playground-settings-local-runners-actions" },
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                        type: "button",
                        className: "playground-settings-local-runners-refresh is-primary",
                        onClick: () => setSettingsLocalRunnerOnboardingOpen((current) => !current),
                      },
                        React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.9 }),
                        React.createElement("span", null, "Connect Runner")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-settings-local-runners-refresh",
                        onClick: () => {
                          setSettingsLocalBindingError("");
                          setSettingsLocalBindingSuccess("");
                          setSettingsLocalBindingFormOpen((current) => !current);
                        },
                        disabled: !settingsLocalBindingCanCreate,
                        title: settingsLocalBindingCanCreate
                          ? "Bind a local path to an environment"
                          : "Connect a local runner and create an environment first",
                      },
                        React.createElement(Link2, { width: 13, height: 13, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Bind Workspace")
                      ),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-settings-local-runners-refresh",
                        onClick: () => setSettingsLocalRunnersReloadToken((current) => current + 1),
                        disabled: settingsLocalRunnersLoading,
                      },
                        settingsLocalRunnersLoading
                          ? React.createElement(Loader2, { width: 13, height: 13, strokeWidth: 1.8, className: "playground-spin" })
                          : React.createElement(RefreshCw, { width: 13, height: 13, strokeWidth: 1.8 }),
                        React.createElement("span", null, settingsLocalRunnersLoading ? "Loading" : "Refresh")
                      )
                    )
                  ),
                  settingsLocalRunnerOnboardingOpen
                    ? React.createElement("div", { className: "playground-settings-local-runner-onboarding" },
                        React.createElement("div", null,
                          React.createElement("div", { className: "playground-settings-local-runner-onboarding-title" }, "Connect a local runner"),
                          React.createElement("div", { className: "playground-settings-local-runner-onboarding-copy" },
                            "Generate a one-time pairing token, build the bridge daemon, then start it with the command below. The daemon stores a scoped runner key after pairing."
                          )
                        ),
                        React.createElement("div", { className: "playground-settings-local-binding-form-actions" },
                          React.createElement(PlatformPrimaryButton, {
                            size: "large",
                            type: "button",
                            className: "playground-settings-app-primary-button",
                            onClick: () => void handleSettingsCreateLocalRunnerPairingToken(),
                            disabled: settingsLocalRunnerPairingBusy || !hasRealAccess || settingsLocalRunnersState.bridgeEnabled === false,
                          },
                            settingsLocalRunnerPairingBusy
                              ? React.createElement(Loader2, { width: 13, height: 13, strokeWidth: 1.8, className: "playground-spin" })
                              : React.createElement(Key, { width: 13, height: 13, strokeWidth: 1.8 }),
                            React.createElement("span", null, settingsLocalRunnerPairingBusy ? "Creating..." : settingsLocalRunnerPairingTokenValue ? "Regenerate Token" : "Generate Token")
                          )
                        ),
                        React.createElement("div", { className: "playground-settings-local-runner-command-stack" },
                          React.createElement("pre", { className: "playground-settings-local-runner-command" }, settingsLocalRunnerInstallCommand),
                          React.createElement("pre", { className: "playground-settings-local-runner-command" }, settingsLocalRunnerStartCommand)
                        ),
                        settingsLocalRunnerPairingPending
                          ? React.createElement("div", { className: "playground-settings-muted-copy" }, "Waiting for the daemon to exchange the token...")
                          : null,
                        renderSettingsInlineStatus("error", settingsLocalRunnerPairingState.error),
                        renderSettingsInlineStatus("success", settingsLocalRunnerPairingState.success)
                      )
                    : null,
                  settingsLocalBindingFormOpen
                    ? React.createElement("form", {
                        className: "playground-settings-local-binding-form",
                        onSubmit: (event) => {
                          event.preventDefault();
                          void handleSettingsCreateWorkspaceBinding();
                        },
                      },
                        React.createElement("div", { className: "playground-settings-local-binding-form-top" },
                          React.createElement("div", null,
                            React.createElement("div", { className: "playground-settings-local-binding-form-title" }, "Bind workspace"),
                            React.createElement("div", { className: "playground-settings-local-binding-form-copy" },
                              "Connect a local folder to a cloud environment. This prepares local runner placement and sync metadata; it does not route active work locally yet."
                            )
                          ),
                          React.createElement("div", { className: "playground-settings-local-binding-form-actions" },
                            React.createElement(PlatformSecondaryButton, {
                              size: "large",
                              type: "button",
                              className: "playground-settings-app-secondary-button",
                              onClick: () => {
                                setSettingsLocalBindingFormOpen(false);
                                setSettingsLocalBindingError("");
                                setSettingsLocalBindingSuccess("");
                              },
                              disabled: settingsLocalBindingSubmitting,
                            }, "Cancel"),
                            React.createElement(PlatformPrimaryButton, {
                              size: "large",
                              type: "submit",
                              className: "playground-settings-app-primary-button",
                              disabled: settingsLocalBindingSubmitting,
                            }, settingsLocalBindingSubmitting ? "Creating..." : "Create Binding")
                          )
                        ),
                        React.createElement("div", { className: "playground-settings-form-grid" },
                          React.createElement("div", { className: "playground-settings-field" },
                            React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-local-binding-device" }, "Runner"),
                            React.createElement("select", {
                              id: "settings-local-binding-device",
                              className: "playground-settings-select",
                              value: settingsLocalBindingForm.deviceId,
                              onChange: (event) => setSettingsLocalBindingForm((current) => ({ ...current, deviceId: event.target.value })),
                              disabled: settingsLocalBindingSubmitting,
                            },
                              settingsLocalBindingDeviceOptions.map((device) =>
                                React.createElement("option", { key: device.id, value: device.id }, device.name + (device.status === "online" ? " · Online" : " · Offline"))
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-settings-field" },
                            React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-local-binding-environment" }, "Environment"),
                            React.createElement("select", {
                              id: "settings-local-binding-environment",
                              className: "playground-settings-select",
                              value: settingsLocalBindingForm.environmentId,
                              onChange: (event) => setSettingsLocalBindingForm((current) => ({ ...current, environmentId: event.target.value })),
                              disabled: settingsLocalBindingSubmitting,
                            },
                              settingsLocalBindingEnvironmentOptions.map((environment) =>
                                React.createElement("option", { key: environment.id, value: environment.id }, environment.name || environment.id)
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-settings-field" },
                            React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-local-binding-project" }, "Project"),
                            React.createElement("select", {
                              id: "settings-local-binding-project",
                              className: "playground-settings-select",
                              value: settingsLocalBindingForm.projectId,
                              onChange: (event) => setSettingsLocalBindingForm((current) => ({ ...current, projectId: event.target.value })),
                              disabled: settingsLocalBindingSubmitting,
                            },
                              React.createElement("option", { value: "" }, "No project"),
                              settingsLocalBindingProjectOptions.map((project) =>
                                React.createElement("option", { key: project.id, value: project.id }, project.name || project.title || project.id)
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-settings-field" },
                            React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-local-binding-name" }, "Name"),
                            React.createElement("input", {
                              id: "settings-local-binding-name",
                              type: "text",
                              className: "playground-settings-input",
                              value: settingsLocalBindingForm.name,
                              onChange: (event) => setSettingsLocalBindingForm((current) => ({ ...current, name: event.target.value })),
                              placeholder: "Local project workspace",
                              disabled: settingsLocalBindingSubmitting,
                            })
                          ),
                          React.createElement("div", { className: "playground-settings-field playground-settings-field-span-2" },
                            React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-local-binding-path" }, "Local Path"),
                            React.createElement("input", {
                              id: "settings-local-binding-path",
                              type: "text",
                              className: "playground-settings-input",
                              value: settingsLocalBindingForm.localPath,
                              onChange: (event) => setSettingsLocalBindingForm((current) => ({ ...current, localPath: event.target.value })),
                              placeholder: "/Users/me/projects/app",
                              disabled: settingsLocalBindingSubmitting,
                            })
                          ),
                          React.createElement("div", { className: "playground-settings-field playground-settings-field-span-2" },
                            React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-local-binding-sync-root" }, "Sync Root"),
                            React.createElement("input", {
                              id: "settings-local-binding-sync-root",
                              type: "text",
                              className: "playground-settings-input",
                              value: settingsLocalBindingForm.syncRoot,
                              onChange: (event) => setSettingsLocalBindingForm((current) => ({ ...current, syncRoot: event.target.value })),
                              placeholder: "Leave empty to use local path",
                              disabled: settingsLocalBindingSubmitting,
                            })
                          ),
                          React.createElement("div", { className: "playground-settings-field" },
                            React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-local-binding-sync-mode" }, "Sync Mode"),
                            React.createElement("select", {
                              id: "settings-local-binding-sync-mode",
                              className: "playground-settings-select",
                              value: settingsLocalBindingForm.syncMode,
                              onChange: (event) => setSettingsLocalBindingForm((current) => ({ ...current, syncMode: event.target.value })),
                              disabled: settingsLocalBindingSubmitting,
                            },
                              React.createElement("option", { value: "manual" }, "Manual"),
                              React.createElement("option", { value: "watch" }, "Watch"),
                              React.createElement("option", { value: "off" }, "Off")
                            )
                          ),
                          React.createElement("div", { className: "playground-settings-field" },
                            React.createElement("label", { className: "playground-settings-label", htmlFor: "settings-local-binding-execution-mode" }, "Execution Mode"),
                            React.createElement("select", {
                              id: "settings-local-binding-execution-mode",
                              className: "playground-settings-select",
                              value: settingsLocalBindingForm.executionMode,
                              onChange: (event) => setSettingsLocalBindingForm((current) => ({ ...current, executionMode: event.target.value })),
                              disabled: settingsLocalBindingSubmitting,
                            },
                              React.createElement("option", { value: "bridge_local" }, "Local Runner"),
                              React.createElement("option", { value: "legacy_remote" }, "Cloud Runtime")
                            )
                          )
                        ),
                        renderSettingsInlineStatus("error", settingsLocalBindingError),
                        renderSettingsInlineStatus("success", settingsLocalBindingSuccess)
                      )
                    : null,
                  settingsLocalRunnersState.error && settingsLocalRunnersState.devices.length > 0
                    ? React.createElement("div", { className: "playground-settings-muted-copy" }, settingsLocalRunnersState.error)
                    : null,
                  settingsLocalRunnersLoading && settingsLocalRunnersState.devices.length === 0
                    ? React.createElement("div", { className: "playground-settings-local-runners-empty" }, "Loading local runners...")
                    : settingsLocalRunnersState.devices.length === 0
                      ? React.createElement("div", { className: "playground-settings-local-runners-empty" },
                          settingsLocalRunnersState.error
                            ? settingsLocalRunnersState.error
                            : settingsLocalRunnersState.bridgeEnabled === false
                            ? (settingsLocalRunnersState.error || "Local bridge is not enabled for this workspace yet.")
                            : hasRealAccess
                              ? "No local runners are registered for this workspace yet."
                              : "Sign in to inspect local runner registrations for this workspace."
                        )
                      : React.createElement("div", { className: "playground-settings-local-runners-list" },
                          settingsLocalRunnersState.devices.map((device) => {
                            const localRuntime = getSettingsLocalRuntimeCapabilities(device);
                            const resources = localRuntime.resources && typeof localRuntime.resources === "object" && !Array.isArray(localRuntime.resources)
                              ? localRuntime.resources
                              : {};
                            const inference = localRuntime.inference && typeof localRuntime.inference === "object" && !Array.isArray(localRuntime.inference)
                              ? localRuntime.inference
                              : {};
                            const backend = localRuntime.backend && typeof localRuntime.backend === "object" && !Array.isArray(localRuntime.backend)
                              ? localRuntime.backend
                              : {};
                            const execution = localRuntime.execution && typeof localRuntime.execution === "object" && !Array.isArray(localRuntime.execution)
                              ? localRuntime.execution
                              : {};
                            const bindings = settingsLocalRunnerBindingsByDeviceId.get(device.id) || [];
                            const hostLabel = [device.platform, device.hostname].filter(Boolean).join(" · ") || "Unknown host";
                            const memoryLabel = formatSettingsLocalRunnerNumber(resources.totalMemoryGiB, " GB RAM");
                            const diskLabel = resources.freeDiskGiB === null || resources.freeDiskGiB === undefined
                              ? "disk unknown"
                              : formatSettingsLocalRunnerNumber(resources.freeDiskGiB, " GB free");
                            const resourceLabel = [
                              Number.isFinite(Number(resources.cpuCount)) ? String(resources.cpuCount) + " CPU" : "CPU unknown",
                              memoryLabel,
                              diskLabel,
                            ].join(" · ");
                            const inferenceStatus = inference.enabled
                              ? [
                                  formatSettingsLocalRunnerRuntimeStatus(inference.status),
                                  inference.defaultProvider ? String(inference.defaultProvider).replace(/_/g, " ") : "",
                                  inference.baseUrlHost ? String(inference.baseUrlHost) : "",
                                ].filter(Boolean).join(" · ")
                              : "Disabled";
                            const runnerFacts = [
                              { label: "Runtime", value: formatSettingsLocalRunnerRuntimeStatus(localRuntime.status) },
                              { label: "Resources", value: resourceLabel },
                              { label: "Toolchain", value: formatSettingsLocalRunnerToolchain(localRuntime.toolchain) },
                              { label: "Inference", value: inferenceStatus },
                              { label: "Backend", value: formatSettingsLocalRunnerRuntimeStatus(backend.status) },
                              { label: "Execution", value: formatSettingsLocalRunnerRuntimeStatus(execution.status) },
                              { label: "Bindings", value: bindings.length > 0 ? String(bindings.length) : "None" },
                              { label: "Last Seen", value: formatSettingsLocalRunnerDateTime(device.lastSeenAt) },
                            ];

                            return React.createElement("div", { key: device.id, className: "playground-settings-local-runner-card" },
                              React.createElement("div", { className: "playground-settings-local-runner-main" },
                                React.createElement("div", { className: "playground-settings-local-runner-identity" },
                                  React.createElement("div", { className: "playground-settings-local-runner-icon" },
                                    React.createElement(Monitor, { width: 17, height: 17, strokeWidth: 1.8 })
                                  ),
                                  React.createElement("div", { style: { minWidth: 0 } },
                                    React.createElement("div", { className: "playground-settings-local-runner-name" }, device.name),
                                    React.createElement("div", { className: "playground-settings-local-runner-meta" },
                                      hostLabel,
                                      device.daemonVersion ? " · daemon " + device.daemonVersion : "",
                                      device.appVersion ? " · app " + device.appVersion : ""
                                    )
                                  )
                                ),
                                React.createElement("span", {
                                  className: "playground-settings-local-runner-status" + (device.status === "online" ? " is-online" : ""),
                                }, device.status === "online" ? "Online" : "Offline")
                              ),
                              React.createElement("div", { className: "playground-settings-local-runner-facts" },
                                runnerFacts.map((fact) =>
                                  React.createElement("div", { key: fact.label, className: "playground-settings-local-runner-fact" },
                                    React.createElement("div", { className: "playground-settings-local-runner-fact-label" }, fact.label),
                                    React.createElement("div", { className: "playground-settings-local-runner-fact-value" }, fact.value)
                                  )
                                )
                              ),
                              bindings.length > 0
                                ? React.createElement("div", { className: "playground-settings-local-runner-bindings" },
                                    bindings.slice(0, 4).map((binding) =>
                                      React.createElement("div", { key: binding.id, className: "playground-settings-local-runner-binding" },
                                        React.createElement("div", {
                                          className: "playground-settings-local-runner-binding-path",
                                          title: binding.localPath || binding.syncRoot || binding.name || binding.id,
                                        }, binding.name || binding.localPath || binding.syncRoot || binding.id),
                                        React.createElement("div", { className: "playground-settings-local-runner-binding-pill" }, binding.syncMode),
                                        React.createElement("div", { className: "playground-settings-local-runner-binding-pill" }, binding.executionMode)
                                      )
                                    ),
                                    bindings.length > 4
                                      ? React.createElement("div", { className: "playground-settings-muted-copy" }, "+" + String(bindings.length - 4) + " more bindings")
                                      : null
                                  )
                                : null
                            );
                          })
                        )
                );
`;


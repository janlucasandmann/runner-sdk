export const INFERENCE_PAGE_SETUP_SCRIPT = `            case "inference":
              detailContent = (() => {
                const inferenceSavedApiKeyPreview = settingsClearInferenceApiKey ? "" : settingsInferenceSettings.apiKeyPreview;
                const inferenceShowingSavedApiKeyPreview = !settingsInferenceApiKeyEditing
                  && !settingsInferenceApiKeyInput
                  && Boolean(inferenceSavedApiKeyPreview);
                const inferenceApiKeyDisplayValue = inferenceShowingSavedApiKeyPreview
                  ? inferenceSavedApiKeyPreview
                  : settingsInferenceApiKeyInput;
                const fallbackSettingsRuntimeTargets = [
                  {
                    kind: "cloud",
                    label: "Cloud Runtime",
                    status: "available",
                    default: true,
                    description: "Hosted control plane, cloud execution, managed storage, and optional external inference.",
                  },
                  {
                    kind: "local_runner",
                    label: "Local Runner",
                    status: "disabled",
                    default: false,
                    description: "Paired bridge device for local environments, file sync, session heartbeat, and future local execution.",
                    deviceCount: 0,
                    onlineDeviceCount: 0,
                    bindingCount: 0,
                    bridgeLocalBindingCount: 0,
                  },
                  {
                    kind: "fully_local",
                    label: "Fully Local",
                    status: "planned",
                    default: false,
                    description: "Local UI, API, storage, execution, and inference packaged for offline or on-prem deployments.",
                  },
                ];
                const runtimeTargetsSource = settingsLocalRunnersState.runtimeTargets.length > 0
                  ? settingsLocalRunnersState.runtimeTargets
                  : fallbackSettingsRuntimeTargets;
                const localRunnerRuntimeTarget = runtimeTargetsSource.find((target) => target.kind === "local_runner") || fallbackSettingsRuntimeTargets[1];
                const settingsRuntimeTargets = runtimeTargetsSource.map((target) => {
                  const statusLabel = target.default && target.status === "available"
                    ? "Active"
                    : formatSettingsLocalRunnerRuntimeStatus(target.status);
                  const statusClass = target.default && target.status === "available"
                    ? " is-active"
                    : target.kind === "local_runner" && target.status === "available"
                      ? " is-foundation"
                      : "";
                  const Icon = target.kind === "cloud" ? Cloud : target.kind === "local_runner" ? Monitor : Server;
                  return {
                    id: target.kind,
                    title: target.label,
                    statusLabel,
                    statusClass,
                    Icon,
                    copy: target.description,
                  };
                });
                const settingsRuntimeCapabilities = [
                  { label: "Control Plane", value: "Cloud default, local appliance planned" },
                  {
                    label: "Local Runners",
                    value: settingsLocalRunnersState.bridgeEnabled === false
                      ? "Bridge disabled"
                      : String(localRunnerRuntimeTarget.onlineDeviceCount || 0) + " / " + String(localRunnerRuntimeTarget.deviceCount || 0) + " online",
                  },
                  { label: "Bindings", value: String(localRunnerRuntimeTarget.bindingCount || 0) + " workspace bindings" },
                  { label: "Inference", value: "Managed, external, or local endpoint" },
                ];
                const settingsRuntimeSection = React.createElement("section", { className: "playground-settings-plans-budget-card playground-computer-details-card playground-settings-runtime-card" },
                  React.createElement("div", { className: "playground-settings-inference-endpoint-copy" },
                    React.createElement("div", { className: "playground-settings-card-title" }, "Execution Runtime"),
                    React.createElement("div", { className: "playground-settings-card-copy" },
                      "Choose where the platform executes work separately from where model inference happens. The current bridge keeps this modular without changing API or SDK contracts."
                    )
                  ),
                  React.createElement("div", { className: "playground-settings-runtime-grid" },
                    settingsRuntimeTargets.map((target) =>
                      React.createElement("div", { key: target.id, className: "playground-settings-runtime-target" },
                        React.createElement("div", { className: "playground-settings-runtime-target-header" },
                          React.createElement("div", { className: "playground-settings-runtime-target-title" },
                            React.createElement(getPlaygroundSafeIconComponent(target.Icon, Circle), { className: "playground-settings-runtime-target-icon", strokeWidth: 1.8 }),
                            React.createElement("span", null, target.title)
                          ),
                          React.createElement("span", { className: "playground-settings-runtime-status" + target.statusClass }, target.statusLabel)
                        ),
                        React.createElement("p", { className: "playground-settings-runtime-target-copy" }, target.copy)
                      )
                    )
                  ),
                  React.createElement("div", { className: "playground-settings-runtime-capabilities" },
                    settingsRuntimeCapabilities.map((item) =>
                      React.createElement("div", { key: item.label, className: "playground-settings-runtime-capability" },
                        React.createElement("div", { className: "playground-settings-runtime-capability-label" }, item.label),
                        React.createElement("div", { className: "playground-settings-runtime-capability-value" }, item.value)
                      )
                    )
                  ),
                  React.createElement("div", { className: "playground-settings-runtime-note" },
                    "Local runner support builds on existing local computers, workspace bindings, local sessions, command polling, and structured event ingest. Actual local agent execution stays disabled until the runtime router is explicitly enabled."
                  )
                );
`;

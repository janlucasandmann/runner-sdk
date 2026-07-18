        function PlaygroundOnboardingVideoBackground({ onStarted } = {}) {
          const videoRef = useRef(null);
          const [videoReady, setVideoReady] = useState(false);
          const hasNotifiedStartedRef = useRef(false);
          const notifyStarted = useCallback(() => {
            if (hasNotifiedStartedRef.current) {
              return;
            }
            hasNotifiedStartedRef.current = true;
            if (typeof onStarted === "function") {
              onStarted();
            }
          }, [onStarted]);
  
          useEffect(() => {
            const video = videoRef.current;
            if (!video) {
              return undefined;
            }
            const fallbackTimer = window.setTimeout(notifyStarted, 180);
  
            video.playbackRate = 0.5;
            video.preload = "auto";
            video.src = "/img/bg/macapp.mp4";
  
            const handleCanPlay = () => {
              setVideoReady(true);
              notifyStarted();
              const playResult = video.play();
              if (playResult && typeof playResult.then === "function") {
                playResult.catch(() => {});
              } else {
                video.play().catch(() => {});
              }
            };
            const handlePlaying = () => {
              notifyStarted();
            };
  
            video.addEventListener("canplaythrough", handleCanPlay);
            video.addEventListener("playing", handlePlaying);
            video.load();
  
            return () => {
              window.clearTimeout(fallbackTimer);
              video.removeEventListener("canplaythrough", handleCanPlay);
              video.removeEventListener("playing", handlePlaying);
            };
          }, [notifyStarted]);
  
          return React.createElement("div", { className: "playground-onboarding-video-bg", "aria-hidden": "true" },
            React.createElement("img", {
              className: "playground-onboarding-video-bg-media",
              src: "/img/bg/macapp-poster.jpg",
              alt: "",
            }),
            React.createElement("video", {
              ref: videoRef,
              className: "playground-onboarding-video-bg-media playground-onboarding-video-bg-video" + (videoReady ? " is-ready" : ""),
              loop: true,
              muted: true,
              playsInline: true,
              autoPlay: true,
              suppressHydrationWarning: true,
            }),
            React.createElement("div", { className: "playground-onboarding-video-bg-overlay" })
          );
        }
  
        function PlaygroundOnboardingModal({
          open,
          sessionStatus,
          hasRealAccess,
          backendUrl = "",
          requestHeaders = {},
          existingAgentCount,
          environmentCount,
          defaultEnvironmentId,
          defaultEnvironmentName,
          skillCount,
          currentPlanId,
          connectorStatuses = {},
          connectorActions = {},
          onClose,
          onSignIn,
          onUpgradeToIndividual,
          onCreateProject,
        }) {
          const savedState = useMemo(() => readPlaygroundOnboardingState(), []);
          const rawUrlStepIndex = readCurrentSearchParam(PLAYGROUND_ONBOARDING_STEP_QUERY_PARAM);
          const urlStepIndex = rawUrlStepIndex !== "" ? Number(rawUrlStepIndex) : NaN;
          const initialStepIndex = Number.isFinite(urlStepIndex)
            ? Math.max(0, Math.min(4, Math.round(urlStepIndex)))
            : Number.isFinite(savedState?.stepIndex)
            ? Math.max(0, Math.min(4, Math.round(savedState.stepIndex)))
            : 0;
          const [stepIndex, setStepIndex] = useState(initialStepIndex);
          const totalSteps = 5;
          const stepLabels = ["Welcome", "Computer", "Agents", "Connectors", "Plan"];
          const normalizedPlanId = normalizeSettingsTierId(currentPlanId) || "sandbox";
          const isOnPaidPlan = normalizedPlanId !== "sandbox";
          const individualPlan = SETTINGS_PLAN_CATALOG.find((plan) => plan.id === "builder") || SETTINGS_PLAN_CATALOG[0];
  	        const individualPlanFeatures = getSettingsPlanFeatures(
  	          individualPlan.id,
  	          Number(individualPlan.computeTokens || 0)
  	        );
          const [computerSize, setComputerSize] = useState("lite");
          const [nodeVersion, setNodeVersion] = useState("22");
          const [pythonVersion, setPythonVersion] = useState("3.12");
          const [computerInternetEnabled, setComputerInternetEnabled] = useState(true);
          const onboardingComputerUploadInputRef = useRef(null);
          const onboardingComputerUploadVisualTimersRef = useRef([]);
          const onboardingComputerActiveUploadsRef = useRef(0);
          const [onboardingComputerUploadedAttachments, setOnboardingComputerUploadedAttachments] = useState([]);
          const [isOnboardingComputerUploadDragging, setOnboardingComputerUploadDragging] = useState(false);
          const [onboardingVideoStarted, setOnboardingVideoStarted] = useState(false);
          const [onboardingCreationTransition, setOnboardingCreationTransition] = useState(null);
          const onboardingCreationTransitionTimersRef = useRef([]);
          const [onboardingPaneTransition, setOnboardingPaneTransition] = useState(null);
          const onboardingPaneTransitionTimersRef = useRef([]);
          const [onboardingFreeExitPhase, setOnboardingFreeExitPhase] = useState("");
          const onboardingFreeExitTimersRef = useRef([]);
          const [onboardingCheckoutLoadingButton, setOnboardingCheckoutLoadingButton] = useState("");
          const [onboardingComputerUploadState, setOnboardingComputerUploadState] = useState({
            isUploading: false,
            error: "",
          });
          const onboardingCreationTransitionPhase = onboardingCreationTransition?.phase || "";
          const onboardingCreationTransitionActive = Boolean(onboardingCreationTransitionPhase);
          const onboardingCreationTransitionLabel = onboardingCreationTransition?.label || "";
          const onboardingPaneTransitionPhase = onboardingPaneTransition?.phase || "";
          const onboardingPaneTransitionActive = Boolean(onboardingPaneTransitionPhase);
          const onboardingFreeExitActive = Boolean(onboardingFreeExitPhase);
          const onboardingTransitionActive = onboardingCreationTransitionActive || onboardingPaneTransitionActive || onboardingFreeExitActive;
          const onboardingCheckoutLoading = Boolean(onboardingCheckoutLoadingButton);
          const [onboardingProjectName, setOnboardingProjectName] = useState("");
          const [onboardingProjectGoal, setOnboardingProjectGoal] = useState("");
          let onboardingBackendUrl = String(backendUrl || "");
          while (onboardingBackendUrl.endsWith("/")) {
            onboardingBackendUrl = onboardingBackendUrl.slice(0, -1);
          }
          const buildSnapshot = useCallback((nextStepIndex = stepIndex) => ({
            stepIndex: nextStepIndex,
          }), [stepIndex]);
  
          function buildOnboardingReturnUrl(nextStepIndex = stepIndex) {
            try {
              const url = new URL(window.location.href);
              url.searchParams.set(PLAYGROUND_ONBOARDING_QUERY_PARAM, "true");
              url.searchParams.set(PLAYGROUND_ONBOARDING_STEP_QUERY_PARAM, String(Math.max(0, Math.min(totalSteps - 1, Math.round(Number(nextStepIndex) || 0)))));
              return url.toString();
            } catch {
              return window.location.href;
            }
          }
  
          const clearOnboardingCreationTransitionTimers = useCallback(() => {
            onboardingCreationTransitionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
            onboardingCreationTransitionTimersRef.current = [];
          }, []);
          const clearOnboardingPaneTransitionTimers = useCallback(() => {
            onboardingPaneTransitionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
            onboardingPaneTransitionTimersRef.current = [];
          }, []);
          const clearOnboardingFreeExitTimers = useCallback(() => {
            onboardingFreeExitTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
            onboardingFreeExitTimersRef.current = [];
          }, []);
          const clearOnboardingComputerUploadVisualTimers = useCallback(() => {
            onboardingComputerUploadVisualTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
            onboardingComputerUploadVisualTimersRef.current = [];
          }, []);
  
          useEffect(() => {
            if (!open) {
              setOnboardingVideoStarted(false);
              setOnboardingCreationTransition(null);
              setOnboardingPaneTransition(null);
              setOnboardingFreeExitPhase("");
              setOnboardingCheckoutLoadingButton("");
              clearOnboardingCreationTransitionTimers();
              clearOnboardingPaneTransitionTimers();
              clearOnboardingFreeExitTimers();
              clearOnboardingComputerUploadVisualTimers();
              return;
            }
            writePlaygroundOnboardingState(buildSnapshot());
          }, [
            buildSnapshot,
            clearOnboardingComputerUploadVisualTimers,
            clearOnboardingCreationTransitionTimers,
            clearOnboardingFreeExitTimers,
            clearOnboardingPaneTransitionTimers,
            open,
          ]);
  
          useEffect(() => () => {
            clearOnboardingCreationTransitionTimers();
            clearOnboardingPaneTransitionTimers();
            clearOnboardingFreeExitTimers();
            clearOnboardingComputerUploadVisualTimers();
          }, [
            clearOnboardingComputerUploadVisualTimers,
            clearOnboardingCreationTransitionTimers,
            clearOnboardingFreeExitTimers,
            clearOnboardingPaneTransitionTimers,
          ]);
  
          const handleClose = useCallback(() => {
            clearOnboardingCreationTransitionTimers();
            clearOnboardingPaneTransitionTimers();
            clearOnboardingFreeExitTimers();
            clearOnboardingComputerUploadVisualTimers();
            clearPlaygroundOnboardingState();
            if (typeof onClose === "function") {
              onClose();
            }
          }, [
            clearOnboardingComputerUploadVisualTimers,
            clearOnboardingCreationTransitionTimers,
            clearOnboardingFreeExitTimers,
            clearOnboardingPaneTransitionTimers,
            onClose,
          ]);
          const handleOnboardingVideoStarted = useCallback(() => {
            setOnboardingVideoStarted(true);
          }, []);
          const launchOnboardingIndividualCheckout = useCallback(async (buttonId) => {
            if (onboardingTransitionActive || onboardingCheckoutLoading) {
              return;
            }
            if (typeof onUpgradeToIndividual !== "function") {
              return;
            }
            setOnboardingCheckoutLoadingButton(buttonId || "checkout");
            try {
              await Promise.resolve(onUpgradeToIndividual());
            } finally {
              setOnboardingCheckoutLoadingButton("");
            }
          }, [onUpgradeToIndividual, onboardingCheckoutLoading, onboardingTransitionActive]);
          const beginOnboardingFreeExit = useCallback(() => {
            if (onboardingTransitionActive) {
              return;
            }
            clearOnboardingCreationTransitionTimers();
            clearOnboardingPaneTransitionTimers();
            clearOnboardingFreeExitTimers();
            setOnboardingFreeExitPhase("leaving");
            const leaveTimer = window.setTimeout(() => {
              setOnboardingFreeExitPhase("fading");
              const fadeTimer = window.setTimeout(() => {
                clearPlaygroundOnboardingState();
                if (typeof onClose === "function") {
                  onClose();
                }
              }, 460);
              onboardingFreeExitTimersRef.current = [fadeTimer];
            }, 520);
            onboardingFreeExitTimersRef.current = [leaveTimer];
          }, [
            clearOnboardingCreationTransitionTimers,
            clearOnboardingFreeExitTimers,
            clearOnboardingPaneTransitionTimers,
            onClose,
            onboardingTransitionActive,
          ]);
          const beginOnboardingCreationTransition = useCallback(({ fromStep, toStep, label }) => {
            if (onboardingTransitionActive) {
              return;
            }
            clearOnboardingCreationTransitionTimers();
            clearOnboardingPaneTransitionTimers();
            clearOnboardingFreeExitTimers();
            const transitionState = { fromStep, toStep, label };
            setOnboardingCreationTransition({ ...transitionState, phase: "loading" });
            const loadingTimer = window.setTimeout(() => {
              setOnboardingCreationTransition({ ...transitionState, phase: "hiding-label" });
              const hideTimer = window.setTimeout(() => {
                setStepIndex(toStep);
                setOnboardingCreationTransition({ ...transitionState, phase: "entering" });
                const enterTimer = window.setTimeout(() => {
                  setOnboardingCreationTransition(null);
                  onboardingCreationTransitionTimersRef.current = [];
                }, 620);
                onboardingCreationTransitionTimersRef.current = [enterTimer];
              }, 240);
              onboardingCreationTransitionTimersRef.current = [hideTimer];
            }, 4000);
            onboardingCreationTransitionTimersRef.current = [loadingTimer];
          }, [clearOnboardingCreationTransitionTimers, clearOnboardingFreeExitTimers, clearOnboardingPaneTransitionTimers, onboardingTransitionActive]);
          const beginOnboardingPaneTransition = useCallback(({ fromStep, toStep }) => {
            if (onboardingTransitionActive) {
              return;
            }
            clearOnboardingCreationTransitionTimers();
            clearOnboardingPaneTransitionTimers();
            clearOnboardingFreeExitTimers();
            const transitionState = { fromStep, toStep };
            setOnboardingPaneTransition({ ...transitionState, phase: "leaving" });
            const leaveTimer = window.setTimeout(() => {
              setStepIndex(toStep);
              setOnboardingPaneTransition({ ...transitionState, phase: "entering" });
              const enterTimer = window.setTimeout(() => {
                setOnboardingPaneTransition(null);
                onboardingPaneTransitionTimersRef.current = [];
              }, 620);
              onboardingPaneTransitionTimersRef.current = [enterTimer];
            }, 520);
            onboardingPaneTransitionTimersRef.current = [leaveTimer];
          }, [clearOnboardingCreationTransitionTimers, clearOnboardingFreeExitTimers, clearOnboardingPaneTransitionTimers, onboardingTransitionActive]);
  
          useEffect(() => {
            if (!open) {
              return;
            }
            function handleKeyDown(event) {
              if (event.key === "Escape") {
                event.preventDefault();
                handleClose();
              }
            }
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
          }, [handleClose, open]);
  
          function renderFooter(options = {}) {
            const {
              primaryLabel = stepIndex === totalSteps - 1 ? "Finish" : "Continue",
              onPrimary = () => {
                if (stepIndex === totalSteps - 1) {
                  handleClose();
                } else {
                  setStepIndex((current) => Math.min(totalSteps - 1, current + 1));
                }
              },
              secondaryLabel = "",
              onSecondary = null,
              primaryDisabled = false,
            } = options;
            return React.createElement("div", { className: "playground-onboarding-footer" },
              React.createElement("div", { className: "playground-onboarding-progress-label" },
                "Step " + (stepIndex + 1) + " of " + totalSteps + " • " + stepLabels[stepIndex]
              ),
              React.createElement("div", { className: "playground-onboarding-footer-actions" },
                stepIndex > 0
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-onboarding-button",
                      onClick: () => setStepIndex((current) => Math.max(0, current - 1)),
                    }, "Back")
                  : React.createElement("button", {
                      type: "button",
                      className: "playground-onboarding-button is-ghost",
                      onClick: handleClose,
                    }, "Dismiss"),
                secondaryLabel && typeof onSecondary === "function"
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-onboarding-button",
                      onClick: onSecondary,
                    }, secondaryLabel)
                  : null,
                React.createElement(PlatformPrimaryButton, {
                  size: "large",
                  type: "button",
                  className: "playground-onboarding-button is-primary",
                  onClick: onPrimary,
                  disabled: primaryDisabled,
                }, primaryLabel)
              )
            );
          }
  
          if (!open) {
            return null;
          }
  
          if (sessionStatus === "loading") {
            return React.createElement(PlaygroundAppLoadingScreen, {
              label: "Agentic Compute Platform",
            });
          }
  
          if (sessionStatus !== "authenticated" || !hasRealAccess) {
            return React.createElement(PlatformModalBackdrop, {
                className: "playground-onboarding-scrim",
                onClick: handleClose,
              },
                React.createElement("div", {
                  className: "playground-onboarding-auth-card",
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement("div", { className: "playground-onboarding-title-wrap" },
                    React.createElement("div", { className: "playground-onboarding-kicker" }, "Agentic Compute Platform"),
                    React.createElement("h2", { className: "playground-onboarding-auth-title" },
                      "Sign in to continue setup"
                    )
                  ),
                  React.createElement("p", { className: "playground-onboarding-auth-copy" },
                    "The onboarding uses your real Agentic Compute Platform account, environments, connectors, and API keys. Sign in first, then reopen with showOnboarding=true to test the full flow."
                  ),
                  React.createElement("div", { className: "playground-onboarding-footer" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-onboarding-button",
                      onClick: handleClose,
                    }, "Close"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "button",
                      className: "playground-onboarding-button is-primary",
                      onClick: () => {
                        if (typeof onSignIn === "function") {
                          onSignIn();
                        }
                      },
                    }, "Sign in")
                  )
                )
              );
          }
  
          const currentComputerName = defaultEnvironmentName || "Default Computer";
          const splitPages = [
            {
              key: "welcome",
              label: "Welcome",
            },
            {
              key: "computer",
              label: "Computer",
              icon: Monitor,
              configTitle: "Your Computer has been created",
              configCopy: "This is the default workspace agents will use for files, runtimes, packages, and execution.",
              kicker: "Step 1",
              explainImage: "/img/010-svgs/animated_cube_layer.svg",
              explainTitle: "A real computer for agent work",
              explainCopy: "",
              bullets: [
                { icon: HardDrive, title: "Durable workspace", copy: "Files, generated artifacts, and installed packages stay attached to the computer." },
                { icon: Cpu, title: "Configurable runtime", copy: "Choose the size and package profile that match the work you want agents to run." },
                { icon: Package, title: "Ready by default", copy: "A default computer is already selected so new threads and projects can start immediately." },
              ],
            },
            {
              key: "agents",
              label: "Agents",
              icon: Bot,
              configTitle: "Three agents are ready",
              configCopy: "",
              kicker: "Step 2",
              explainImage: "",
              explainTitle: "Agents are reusable operators",
              explainCopy: "Each agent can keep its own instructions, model, and working style while still sharing project context.",
              bullets: [
                { icon: MessageSquare, title: "Assistant", copy: "Handles general coordination, explanations, and lightweight follow-up work." },
                { icon: Code2, title: "Developer", copy: "Works on implementation tasks inside the computer workspace." },
                { icon: Shield, title: "Reviewer", copy: "Reviews completed work and helps turn feedback into the next action." },
              ],
            },
            {
              key: "connectors",
              label: "Connectors",
              icon: Cable,
              configTitle: "Connectors and plugins are ready",
              configCopy: "",
              kicker: "Step 3",
              explainImage: "",
              explainTitle: "Bring your workspace with you",
              explainCopy: "Connectors let agents inspect repositories, documents, drives, and notes without manual copy-paste.",
              bullets: [
                { icon: Code2, title: "Repositories", copy: "Let agents inspect issues, code, branches, and project history." },
                { icon: FolderOpen, title: "Cloud files", copy: "Use Drive and OneDrive files as live project context." },
                { icon: FileText, title: "Notes", copy: "Bring Notion pages into planning and execution workflows." },
              ],
            },
            {
              key: "plan",
              label: "Plan",
              icon: Sparkles,
              configTitle: isOnPaidPlan ? "Your plan is active" : "",
              configCopy: isOnPaidPlan
                ? "You already have access to the upgraded workspace."
                : "",
              kicker: "Step 4",
              explainTitle: "Choose how much room you want",
              explainCopy: "Sandbox is enough to evaluate the platform. Builder unlocks custom agents, projects, workflows, and developer resources.",
              bullets: [
                { icon: Coins, title: "More compute", copy: "Run longer and heavier agent workflows without stopping early." },
                { icon: Monitor, title: "Richer computers", copy: "Use more capable workspaces as projects become more demanding." },
  	              { icon: Sparkles, title: "Usage controls", copy: "Set organization budgets and add credits when your included balance runs out." },
              ],
            },
          ];
          const activeOnboardingPage = splitPages[stepIndex] || splitPages[0];
  
          function renderSplitOptionCard({ id, label, copy, active, onClick }) {
            return React.createElement("button", {
              key: id,
              type: "button",
              className: "playground-onboarding-option-card" + (active ? " is-active" : ""),
              onClick,
            },
              React.createElement("span", { className: "playground-onboarding-option-title" }, label),
              React.createElement("span", { className: "playground-onboarding-option-copy" }, copy)
            );
          }
  
          function renderSplitField(label, control) {
            const controlType = String(control?.type || "");
            const controlClassName = controlType === "textarea"
              ? "playground-onboarding-textarea"
              : controlType === "select"
                ? "playground-onboarding-select"
                : "playground-onboarding-input";
            const enhancedControl = React.isValidElement(control)
              ? React.cloneElement(control, {
                  className: [control.props?.className, controlClassName].filter(Boolean).join(" "),
                })
              : control;
            return React.createElement("label", { className: "playground-onboarding-field" },
              React.createElement("span", { className: "playground-onboarding-label" }, label),
              enhancedControl
            );
          }
  
          function renderSplitHeading(page) {
            const Icon = page.icon || Sparkles;
            const isPlainHeading = page.key === "computer" || page.key === "agents" || page.key === "connectors" || page.key === "plan";
            return React.createElement("div", { className: "playground-onboarding-config-heading" + (isPlainHeading ? " is-plain" : "") },
              isPlainHeading
                ? null
                : React.createElement("div", { className: "playground-onboarding-config-icon" },
                    React.createElement(Icon, { width: 18, height: 18, strokeWidth: 1.9 })
                  ),
              React.createElement("div", null,
                React.createElement("h2", { className: "playground-onboarding-config-title" }, page.configTitle),
                page.configCopy
                  ? React.createElement("p", { className: "playground-onboarding-config-copy" }, page.configCopy)
                  : null
              )
            );
          }
  
          function renderOnboardingAgentModel(modelId) {
            const modelMeta = getPlaygroundAgentModelMeta(modelId, PLAYGROUND_AGENT_MODEL_OPTIONS);
            const providerIcon = getPlaygroundAgentModelProviderIcon(modelMeta);
            return React.createElement("div", { className: "playground-onboarding-agent-model" },
              providerIcon
                ? React.createElement("span", { className: "playground-agents-model-provider-icon-shell", "aria-hidden": "true" },
                    React.createElement("img", {
                      src: providerIcon.src,
                      alt: "",
                      className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
                    })
                  )
                : null,
              React.createElement("span", { className: "playground-onboarding-agent-model-name" }, modelMeta.label || modelMeta.id)
            );
          }
  
          function renderSplitRows(rows) {
            return React.createElement("div", { className: "playground-onboarding-agent-list" },
              rows.map((row) => {
                const Icon = row.icon || Check;
                return React.createElement("div", {
                  key: row.title,
                  className: "playground-onboarding-agent-row",
                },
                  React.createElement("div", { className: "playground-onboarding-row-main" },
                    row.profileUrl
                      ? React.createElement("img", {
                          className: "playground-onboarding-row-avatar",
                          src: row.profileUrl,
                          alt: "",
                          "aria-hidden": "true",
                        })
                      : React.createElement("div", { className: "playground-onboarding-row-icon" },
                          React.createElement(Icon, { width: 16, height: 16, strokeWidth: 1.9 })
                        ),
                    React.createElement("div", null,
                      React.createElement("div", { className: "playground-onboarding-row-title" }, row.title),
                      React.createElement("div", { className: "playground-onboarding-row-copy" }, row.copy)
                    )
                  ),
                  row.modelId
                    ? renderOnboardingAgentModel(row.modelId)
                    : React.createElement("div", { className: "playground-onboarding-status" },
                        React.createElement(Check, { width: 13, height: 13, strokeWidth: 2 }),
                        row.status || "Ready"
                      )
                );
              })
            );
          }
  
          function formatOnboardingComputerProfileRate(profile) {
            const rate = Number(profile?.minutePrice || 0);
            if (!Number.isFinite(rate) || rate <= 0) {
              return "$0.00 / min";
            }
            return "$" + rate.toFixed(rate < 0.01 ? 4 : 3) + " / min";
          }
  
          function formatOnboardingComputerProfileHourlyPrice(profile) {
            return "$" + (Number(profile?.minutePrice || 0) * 60).toFixed(2) + " / hr";
          }
  
          function formatOnboardingComputerProfileResources(profile) {
            const cpuLabel = Number(profile?.cpuCores || 0) % 1 === 0
              ? String(Number(profile?.cpuCores || 0))
              : Number(profile?.cpuCores || 0).toFixed(1).replace(/\.0$/, "");
            const memoryGb = Number(profile?.memoryMb || 0) / 1024;
            const memoryLabel = Math.abs(memoryGb - Math.round(memoryGb)) < 0.001
              ? String(Math.round(memoryGb))
              : memoryGb.toFixed(1).replace(/\.0$/, "");
            return cpuLabel + " vCPU · " + memoryLabel + " GB RAM";
          }
  
          function renderOnboardingComputerFact(label, control) {
            return React.createElement("div", { className: "playground-onboarding-computer-fact", key: label },
              React.createElement("div", { className: "playground-onboarding-computer-fact-label" }, label),
              React.createElement("div", { className: "playground-onboarding-computer-fact-value" }, control)
            );
          }
  
          function renderOnboardingComputerSelect(value, onChange, options, ariaLabel) {
            return React.createElement("select", {
              className: "playground-onboarding-computer-select",
              value,
              onChange: (event) => onChange(event.target.value),
              "aria-label": ariaLabel,
            },
              options.map((option) =>
                React.createElement("option", { key: option.value, value: option.value }, option.label)
              )
            );
          }
  
          function renderOnboardingButtonLoader(dotCount = 3) {
            return React.createElement("span", { className: "playground-onboarding-button-loader", "aria-hidden": "true" },
              Array.from({ length: dotCount }, (_, index) =>
                React.createElement("span", {
                  key: "onboarding-button-loader:" + index,
                  className: "playground-onboarding-button-loader-dot",
                  style: { animationDelay: String(index * 0.08) + "s" },
                })
              )
            );
          }
  
          function renderOnboardingButtonContent(label, loading = false) {
            return React.createElement(React.Fragment, null,
              React.createElement("span", null, label),
              loading ? renderOnboardingButtonLoader() : null
            );
          }
  
          function renderWelcomeIntro() {
            return React.createElement("div", { className: "playground-onboarding-welcome-intro" },
              React.createElement("div", { className: "playground-onboarding-welcome-kicker" },
                "Welcome to Computer Agents"
              ),
              React.createElement("h1", { className: "playground-onboarding-welcome-title" },
                "Your AI teammates,",
                React.createElement("br", null),
                "in ",
                React.createElement("span", { className: "playground-onboarding-welcome-title-accent" }, "one workspace"),
                "."
              ),
              React.createElement("p", { className: "playground-onboarding-welcome-copy" },
                "Assign agents work like you would assign it to a colleague. They pick it up, work inside a real computer, update status, and keep the project moving."
              ),
              React.createElement(PlatformPrimaryButton, {
                size: "large",
                type: "button",
                className: "playground-onboarding-button is-primary",
                onClick: () => beginOnboardingCreationTransition({
                  fromStep: 0,
                  toStep: 1,
                  label: "Creating your first computer",
                }),
              },
                "Create first Computer",
                React.createElement(ArrowRight, { width: 15, height: 15, strokeWidth: 1.9 })
              )
            );
          }
  
          function renderWelcomePromptMock() {
            return React.createElement("div", { className: "playground-onboarding-welcome-prompt-stage", "aria-hidden": "true" },
              React.createElement("div", { className: "playground-onboarding-welcome-prompt-wrap" },
                React.createElement("div", { className: "tb-runner-chat playground-onboarding-welcome-runner-mock" },
                  React.createElement("div", { className: "tb-input-width" },
                    React.createElement("div", { className: "embedded-runner-input" },
                      React.createElement("div", { className: "task-input-box" },
                        React.createElement("div", { className: "tb-composer-textarea-shell" },
                          React.createElement("textarea", {
                            className: "sidebar-textarea",
                            rows: 1,
                            readOnly: true,
                            tabIndex: -1,
                            placeholder: "Give it a task...",
                          })
                        ),
                        React.createElement("div", { className: "task-input-controls task-input-controls-full" },
                          React.createElement("div", { className: "tb-selector-anchor" },
                            React.createElement("button", {
                              type: "button",
                              className: "task-attachment-button task-attachment-button-full",
                              tabIndex: -1,
                              "aria-label": "Attach files",
                            },
                              React.createElement(Plus, { className: "task-attachment-icon", strokeWidth: 1.9 })
                            )
                          ),
                          React.createElement("div", { className: "tb-selector-anchor tb-context-indicator-anchor" },
                            React.createElement("button", {
                              type: "button",
                              className: "tb-context-indicator-button",
                              tabIndex: -1,
                              "aria-label": "Conversation context remaining",
                            },
                              React.createElement("span", {
                                className: "tb-context-indicator-ring",
                                style: { "--tb-context-progress": "0.78" },
                              })
                            )
                          ),
                          React.createElement("div", { className: "tb-selector-anchor" },
                            React.createElement("button", {
                              type: "button",
                              className: "tb-inline-selector tb-inline-selector-agent",
                              tabIndex: -1,
                            },
                              React.createElement("span", null, "Default Team"),
                              React.createElement(ChevronDown, { className: "tb-inline-selector-chevron", strokeWidth: 1.8 })
                            )
                          ),
                          React.createElement("div", { className: "task-input-spacer" }),
                          React.createElement("div", { className: "tb-selector-anchor" },
                            React.createElement("button", {
                              type: "button",
                              className: "tb-inline-selector",
                              tabIndex: -1,
                            },
                              React.createElement("span", null, "Default"),
                              React.createElement(ChevronDown, { className: "tb-inline-selector-chevron", strokeWidth: 1.8 })
                            )
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "task-mic-button task-mic-button-full",
                            tabIndex: -1,
                            "aria-label": "Start speech to text",
                          },
                            React.createElement(Mic, { className: "task-mic-icon", strokeWidth: 1.9 })
                          )
                        )
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "playground-onboarding-welcome-input-guide" },
                  React.createElement("svg", {
                    className: "playground-onboarding-welcome-input-guide-lines",
                    viewBox: "0 0 1000 280",
                    preserveAspectRatio: "none",
                    focusable: "false",
                    "aria-hidden": "true",
                  },
                    React.createElement("line", { className: "playground-onboarding-welcome-input-guide-line", x1: "100", y1: "64", x2: "100", y2: "104" }),
                    React.createElement("line", { className: "playground-onboarding-welcome-input-guide-line", x1: "964", y1: "64", x2: "964", y2: "166" }),
                    React.createElement("line", { className: "playground-onboarding-welcome-input-guide-line", x1: "40", y1: "214", x2: "40", y2: "166" }),
                    React.createElement("line", { className: "playground-onboarding-welcome-input-guide-line", x1: "134", y1: "214", x2: "88", y2: "166" }),
                    React.createElement("line", { className: "playground-onboarding-welcome-input-guide-line", x1: "312", y1: "214", x2: "214", y2: "166" }),
                    React.createElement("line", { className: "playground-onboarding-welcome-input-guide-line", x1: "890", y1: "214", x2: "890", y2: "166" })
                  ),
                  [
                    { id: "textarea", title: "Give it a task", copy: "Type what the agents should do." },
                    { id: "voice", title: "Voice", copy: "Dictate requests instead of typing." },
                    { id: "attach", title: "Attach", copy: "Add files or folders." },
                    { id: "context", title: "Context", copy: "Inspect memory." },
                    { id: "team", title: "Agents & Squads", copy: "Choose who should work." },
                    { id: "computer", title: "Computer", copy: "Pick the computer for the agents to work on." },
                  ].map((item) =>
                    React.createElement("div", {
                      key: item.id,
                      className: "playground-onboarding-welcome-input-guide-item playground-onboarding-welcome-input-guide-item-" + item.id,
                    },
                      React.createElement("div", { className: "playground-onboarding-welcome-input-guide-title" }, item.title),
                      React.createElement("div", { className: "playground-onboarding-welcome-input-guide-copy" }, item.copy)
                    )
                  )
                )
              )
            );
          }
  
          function openOnboardingComputerUploadPicker() {
            onboardingComputerUploadInputRef.current?.click?.();
          }
  
          function buildOnboardingComputerAttachmentFromFile(file, normalizedEnvironmentId, options = {}) {
            const workspacePath = normalizeHistoryPath(file.webkitRelativePath || file.name);
            const clientUploadId = "onboarding-upload:" + normalizedEnvironmentId + ":" + workspacePath + ":" + String(file.size || 0) + ":" + String(file.lastModified || 0);
            return normalizePlaygroundTaskAttachmentRecord({
              id: options.id || clientUploadId,
              clientUploadId,
              filename: file.name,
              mimeType: file.type || "application/octet-stream",
              type: file.type && file.type.startsWith("image/") ? "image" : "document",
              size: file.size,
              uploadedAt: new Date().toISOString(),
              environmentId: normalizedEnvironmentId,
              sourcePath: workspacePath,
              workspacePath,
              isUploading: Boolean(options.isUploading),
              uploadPending: Boolean(options.uploadPending),
            });
          }
  
          function upsertOnboardingComputerAttachments(attachments) {
            const normalizedAttachments = (Array.isArray(attachments) ? attachments : []).filter(Boolean);
            if (normalizedAttachments.length === 0) {
              return;
            }
            setOnboardingComputerUploadedAttachments((current) => {
              const next = current.slice();
              normalizedAttachments.forEach((attachment) => {
                const attachmentClientUploadId = String(attachment.clientUploadId || "");
                const existingIndex = next.findIndex((item) =>
                  item.id === attachment.id
                  || (attachmentClientUploadId && String(item.clientUploadId || "") === attachmentClientUploadId)
                );
                if (existingIndex >= 0) {
                  next[existingIndex] = {
                    ...next[existingIndex],
                    ...attachment,
                  };
                } else {
                  next.push(attachment);
                }
              });
              return next.slice(-5);
            });
          }
  
          function scheduleOnboardingComputerUploadPreviewSettle(attachments) {
            const attachmentIds = (Array.isArray(attachments) ? attachments : [])
              .map((attachment) => attachment?.id)
              .filter(Boolean);
            if (attachmentIds.length === 0) {
              return;
            }
            const timerId = window.setTimeout(() => {
              setOnboardingComputerUploadedAttachments((current) =>
                current.map((attachment) =>
                  attachmentIds.includes(attachment.id)
                    ? {
                        ...attachment,
                        isUploading: false,
                        uploadPending: true,
                      }
                    : attachment
                )
              );
              setOnboardingComputerUploadState((current) => ({
                isUploading: false,
                error: current.error || "",
              }));
              onboardingComputerUploadVisualTimersRef.current = onboardingComputerUploadVisualTimersRef.current.filter((id) => id !== timerId);
            }, 1000);
            onboardingComputerUploadVisualTimersRef.current.push(timerId);
          }
  
          async function uploadOnboardingComputerFiles(files) {
            const normalizedFiles = (Array.isArray(files) ? files : []).filter((file) =>
              file
              && typeof file === "object"
              && typeof file.name === "string"
              && typeof file.size === "number"
            );
            if (normalizedFiles.length === 0) {
              return;
            }
            const normalizedEnvironmentId = String(defaultEnvironmentId || "").trim();
            if (!normalizedEnvironmentId || !onboardingBackendUrl) {
              setOnboardingComputerUploadState({
                isUploading: false,
                error: "Sign in and create a default computer before uploading starter files.",
              });
              return;
            }
  
            const optimisticAttachments = normalizedFiles.map((file) =>
              buildOnboardingComputerAttachmentFromFile(file, normalizedEnvironmentId, {
                isUploading: true,
                uploadPending: true,
              })
            );
            upsertOnboardingComputerAttachments(optimisticAttachments);
            scheduleOnboardingComputerUploadPreviewSettle(optimisticAttachments);
  
            onboardingComputerActiveUploadsRef.current += 1;
            setOnboardingComputerUploadState({ isUploading: true, error: "" });
            try {
              const uploadedAttachments = [];
              for (const file of normalizedFiles) {
                const optimisticAttachment = buildOnboardingComputerAttachmentFromFile(file, normalizedEnvironmentId);
                const formData = new FormData();
                formData.append("file", file);
                formData.append("path", "");
                const response = await fetch(
                  onboardingBackendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/files/upload",
                  {
                    method: "POST",
                    headers: requestHeaders,
                    body: formData,
                  }
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || ("Failed to upload " + file.name + "."));

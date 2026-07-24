export const EVALUATIONS_AGENT_VIEW_SCRIPT = `          const agentEvaluationEnvironmentChoices = typeof buildPlaygroundEvaluationEnvironmentChoices === "function"
            ? buildPlaygroundEvaluationEnvironmentChoices(environments, projects)
            : [];
          const agentEvaluationSets = (Array.isArray(evaluationSets) ? evaluationSets : [])
            .map((set, index) => (typeof normalizePlaygroundEvaluationSet === "function" ? normalizePlaygroundEvaluationSet(set, index) : set))
            .filter((set) => String(set?.id || "").trim());
          const getAgentEvaluationRunTimestampMs = (run) => {
            const timestamp = Date.parse(String(run?.completedAt || run?.updatedAt || run?.createdAt || ""));
            return Number.isFinite(timestamp) ? timestamp : 0;
          };
          const isAgentEvaluationRunActive = (run) => (
            typeof isPlaygroundEvaluationRunActive === "function"
              ? isPlaygroundEvaluationRunActive(run)
              : String(run?.status || "").trim().toLowerCase() === "running"
          );
          const formatAgentEvaluationPercent = (value) => {
            const score = Math.max(0, Math.min(1, Number(value) || 0));
            return Math.round(score * 100) + "%";
          };
          const formatAgentEvaluationDate = (value) => (
            typeof formatPlaygroundEvaluationDate === "function"
              ? formatPlaygroundEvaluationDate(value)
              : (formatPlaygroundFileDate(value) || "Never")
          );
          const getAgentEvaluationActiveVersion = () => {
            const selectedVersion = typeof getDraftAgentSelectedVersion === "function" ? getDraftAgentSelectedVersion(draftAgent) : null;
            const activeVersion = typeof getDraftAgentActiveVersion === "function" ? getDraftAgentActiveVersion(draftAgent) : null;
            const versions = typeof readDraftAgentVersions === "function" ? readDraftAgentVersions(draftAgent) : [];
            return selectedVersion || activeVersion || versions[0] || null;
          };
          const getAgentEvaluationVersionLabel = (run) => {
            const versionNumber = Number(run?.targetAgentVersionNumber || run?.agentVersionNumber || 0) || 0;
            const label = String(run?.targetAgentVersionLabel || run?.agentVersionLabel || "").trim();
            if (label) return label;
            if (versionNumber > 0) return "Version " + versionNumber;
            return "Unversioned";
          };
          const getAgentEvaluationVersionKey = (run) => {
            const id = String(run?.targetAgentVersionId || run?.agentVersionId || "").trim();
            if (id) return id;
            const versionNumber = Number(run?.targetAgentVersionNumber || run?.agentVersionNumber || 0) || 0;
            return versionNumber > 0 ? "version:" + versionNumber : "unversioned";
          };
          const getAgentEvaluationRunStatus = (run) => {
            if (isAgentEvaluationRunActive(run)) return "running";
            const status = String(run?.status || "").trim().toLowerCase();
            if (status === "failed" || status === "error") return "failed";
            return Number(run?.averageScore || 0) >= Number(run?.passThreshold || 0.8) ? "passed" : "completed";
          };
          const getAgentEvaluationEnvironmentLabel = (run) => {
            if (String(run?.environmentType || "").trim().toLowerCase() === "project") {
              return String(run?.projectName || run?.projectId || "Project").trim() || "Project";
            }
            return String(run?.environmentName || run?.environmentId || "Computer").trim() || "Computer";
          };
          const selectedAgentEvaluationAgentId = String(draftAgent.id || "").trim();
          const agentEvaluationRows = agentEvaluationSets
            .map((set) => {
              const runs = (Array.isArray(set.runs) ? set.runs : [])
                .filter((run) => String(run?.targetAgentId || "").trim() === selectedAgentEvaluationAgentId)
                .sort((left, right) => getAgentEvaluationRunTimestampMs(right) - getAgentEvaluationRunTimestampMs(left));
              return {
                set,
                runs,
                latestRun: runs[0] || null,
              };
            })
            .filter((row) => row.runs.length > 0);
          const getAgentEvaluationSearchText = (row) => [
            row.set?.name,
            row.set?.id,
            row.latestRun?.label,
            getAgentEvaluationVersionLabel(row.latestRun),
            getAgentEvaluationEnvironmentLabel(row.latestRun),
          ].join(" ");
          const agentEvaluationStatusFilteredRows = agentEvaluationRows.filter((row) => (
            agentDetailEvaluationFilterMode === "all"
            || getAgentEvaluationRunStatus(row.latestRun) === agentDetailEvaluationFilterMode
          ));
          const normalizedAgentEvaluationSearch = String(agentDetailEvaluationSearchQuery || "").trim().toLowerCase();
          const filteredAgentEvaluationRows = agentEvaluationStatusFilteredRows.filter((row) => {
            if (!normalizedAgentEvaluationSearch) return true;
            return getAgentEvaluationSearchText(row).toLowerCase().includes(normalizedAgentEvaluationSearch);
          });
          const selectedAgentEvaluationRow = agentEvaluationRows.find((row) => row.set.id === agentDetailEvaluationSelectedSetId)
            || (agentDetailEvaluationSelectedSetId
              ? agentEvaluationSets
                  .map((set) => ({
                    set,
                    runs: (Array.isArray(set.runs) ? set.runs : [])
                      .filter((run) => String(run?.targetAgentId || "").trim() === selectedAgentEvaluationAgentId)
                      .sort((left, right) => getAgentEvaluationRunTimestampMs(right) - getAgentEvaluationRunTimestampMs(left)),
                    latestRun: null,
                  }))
                  .find((row) => row.set.id === agentDetailEvaluationSelectedSetId)
              : null);
          if (selectedAgentEvaluationRow && !selectedAgentEvaluationRow.latestRun) {
            selectedAgentEvaluationRow.latestRun = selectedAgentEvaluationRow.runs[0] || null;
          }
          const getAgentEvaluationDefaultEnvironmentChoice = (set) => (
            typeof getPlaygroundEvaluationEnvironmentChoice === "function"
              ? getPlaygroundEvaluationEnvironmentChoice(agentEvaluationEnvironmentChoices, set || {}, preferredEnvironmentId)
              : agentEvaluationEnvironmentChoices[0] || null
          );
          function upsertAgentEvaluationRun(setId, run, setPatch = {}) {
            if (typeof setEvaluationSets !== "function" || !setId || typeof normalizePlaygroundEvaluationRun !== "function") return;
            const normalizedRun = normalizePlaygroundEvaluationRun(run);
            if (!normalizedRun.id) return;
            setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
              const normalizedSet = typeof normalizePlaygroundEvaluationSet === "function" ? normalizePlaygroundEvaluationSet(item) : item;
              if (String(normalizedSet?.id || "").trim() !== setId) return normalizedSet;
              const existingRun = (Array.isArray(normalizedSet.runs) ? normalizedSet.runs : []).find((itemRun) => itemRun.id === normalizedRun.id) || null;
              const nextRun = existingRun
                ? normalizePlaygroundEvaluationRun({
                    ...existingRun,
                    ...normalizedRun,
                    targetAgentVersionId: normalizedRun.targetAgentVersionId || existingRun.targetAgentVersionId,
                    targetAgentVersionNumber: normalizedRun.targetAgentVersionNumber || existingRun.targetAgentVersionNumber,
                    targetAgentVersionLabel: normalizedRun.targetAgentVersionLabel || existingRun.targetAgentVersionLabel,
                    targetAgentVersionRevisionId: normalizedRun.targetAgentVersionRevisionId || existingRun.targetAgentVersionRevisionId,
                  })
                : normalizedRun;
              return normalizePlaygroundEvaluationSet({
                ...normalizedSet,
                ...setPatch,
                runs: [nextRun, ...(Array.isArray(normalizedSet.runs) ? normalizedSet.runs : []).filter((itemRun) => itemRun.id !== normalizedRun.id)],
                updatedAt: new Date().toISOString(),
              });
            }));
          }
          function markAgentEvaluationRunFailed(setId, runId, fallbackRun, error) {
            if (typeof normalizePlaygroundEvaluationRun !== "function") return;
            const errorMessage = error?.message || String(error || "Failed to load evaluation run.");
            upsertAgentEvaluationRun(setId, {
              ...(fallbackRun || {}),
              id: runId || fallbackRun?.id,
              status: "failed",
              error: errorMessage,
              completedAt: new Date().toISOString(),
            });
          }
          async function pollAgentEvaluationRun(setId, runId, fallbackRun) {
            const normalizedBackendUrl = String(backendUrl || "").replace(/\\/+$/, "");
            if (!normalizedBackendUrl || !runId) return;
            let consecutiveFailures = 0;
            for (let attempt = 0; attempt < 480; attempt += 1) {
              if (typeof sleepPlaygroundEvaluationFrontend === "function") {
                await sleepPlaygroundEvaluationFrontend(attempt === 0 ? 700 : 1200);
              } else {
                await new Promise((resolve) => window.setTimeout(resolve, attempt === 0 ? 700 : 1200));
              }
              try {
                const response = await fetch(normalizedBackendUrl + "/evaluations/runs/" + encodeURIComponent(runId), {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                  headers: requestHeaders || {},
                });
                const data = typeof readPlaygroundEvaluationBackendJson === "function"
                  ? await readPlaygroundEvaluationBackendJson(response, "Failed to load evaluation run.")
                  : await response.json();
                const nextRun = normalizePlaygroundEvaluationRun({
                  ...(fallbackRun || {}),
                  ...(data?.run || data?.data || data || {}),
                });
                consecutiveFailures = 0;
                if (!nextRun.id) return;
                upsertAgentEvaluationRun(setId, nextRun);
                if (!isAgentEvaluationRunActive(nextRun)) return;
              } catch (error) {
                consecutiveFailures += 1;
                if (consecutiveFailures >= 8) {
                  markAgentEvaluationRunFailed(setId, runId, fallbackRun, error);
                  return;
                }
              }
            }
          }
          function openAgentEvaluationRunModal(setId = "") {
            const targetSet = agentEvaluationSets.find((set) => set.id === String(setId || "").trim())
              || agentEvaluationSets[0]
              || null;
            const environmentChoice = getAgentEvaluationDefaultEnvironmentChoice(targetSet);
            setAgentDetailEvaluationRunForm({
              setId: targetSet?.id || "",
              name: targetSet ? (targetSet.name + " · " + (getAgentEvaluationVersionLabel({ targetAgentVersionNumber: getAgentEvaluationActiveVersion()?.version, targetAgentVersionLabel: getAgentEvaluationActiveVersion()?.label }) || "Run")) : "",
              environmentKey: environmentChoice?.key || "",
            });
            setAgentDetailEvaluationRunState({ status: "idle", error: "" });
            setAgentDetailEvaluationRunModalOpen(true);
          }
          function finishCloseAgentEvaluationRunModal() {
            if (typeof window !== "undefined") {
              if (agentEvaluationRunModalFrameRef.current) {
                window.cancelAnimationFrame(agentEvaluationRunModalFrameRef.current);
                agentEvaluationRunModalFrameRef.current = null;
              }
              if (agentEvaluationRunModalCloseTimerRef.current) {
                window.clearTimeout(agentEvaluationRunModalCloseTimerRef.current);
                agentEvaluationRunModalCloseTimerRef.current = null;
              }
            }
            setAgentDetailEvaluationRunModalVisible(false);
            setAgentDetailEvaluationRunModalClosing(false);
            setAgentDetailEvaluationRunModalOpen(false);
            setAgentDetailEvaluationRunState({ status: "idle", error: "" });
          }
          function closeAgentEvaluationRunModal(options = {}) {
            if (!options.force && agentDetailEvaluationRunState.status === "running") return;
            if (options?.animate === false || typeof window === "undefined") {
              finishCloseAgentEvaluationRunModal();
              return;
            }
            if ((!agentDetailEvaluationRunModalOpen && !agentDetailEvaluationRunModalClosing) || agentDetailEvaluationRunModalClosing) {
              return;
            }
            setAgentDetailEvaluationRunModalVisible(false);
            setAgentDetailEvaluationRunModalClosing(true);
            if (agentEvaluationRunModalCloseTimerRef.current) {
              window.clearTimeout(agentEvaluationRunModalCloseTimerRef.current);
            }
            agentEvaluationRunModalCloseTimerRef.current = window.setTimeout(() => {
              agentEvaluationRunModalCloseTimerRef.current = null;
              finishCloseAgentEvaluationRunModal();
            }, 75);
          }
          async function handleAgentEvaluationRunSubmit(event) {
            if (event?.preventDefault) event.preventDefault();
            const normalizedBackendUrl = String(backendUrl || "").replace(/\\/+$/, "");
            const targetSet = agentEvaluationSets.find((set) => set.id === String(agentDetailEvaluationRunForm?.setId || "").trim()) || null;
            const environmentChoice = (typeof getPlaygroundEvaluationEnvironmentChoiceByKey === "function"
              ? getPlaygroundEvaluationEnvironmentChoiceByKey(agentEvaluationEnvironmentChoices, agentDetailEvaluationRunForm?.environmentKey)
              : null) || getAgentEvaluationDefaultEnvironmentChoice(targetSet);
            if (!targetSet) {
              setAgentDetailEvaluationRunState({ status: "error", error: "Select an evaluation set first." });
              return;
            }
            if (!selectedAgentEvaluationAgentId) {
              setAgentDetailEvaluationRunState({ status: "error", error: "Save the agent before running an evaluation." });
              return;
            }
            if (!environmentChoice?.environmentId) {
              setAgentDetailEvaluationRunState({ status: "error", error: "Select an environment first." });
              return;
            }
            if (!normalizedBackendUrl) {
              setAgentDetailEvaluationRunState({ status: "error", error: "Evaluation backend is unavailable." });
              return;
            }
            const activeVersion = getAgentEvaluationActiveVersion();
            const evaluator = typeof normalizePlaygroundEvaluationEvaluator === "function"
              ? normalizePlaygroundEvaluationEvaluator(targetSet.evaluator)
              : targetSet.evaluator;
            const targetEnvironmentType = environmentChoice.type === "project" ? "project" : "computer";
            const targetEnvironmentId = String(environmentChoice.environmentId || "").trim();
            const targetProjectId = targetEnvironmentType === "project" ? String(environmentChoice.projectId || "").trim() : "";
            const evaluationSetSnapshot = normalizePlaygroundEvaluationSet({
              ...targetSet,
              targetAgentId: selectedAgentEvaluationAgentId,
              environmentType: targetEnvironmentType,
              environmentId: targetEnvironmentId,
              projectId: targetProjectId,
              evaluator,
            });
            const runRequestOptions = {
              id: typeof createPlaygroundEvaluationId === "function" ? createPlaygroundEvaluationId("eval_run") : ("eval_run_" + Date.now().toString(36)),
              label: String(agentDetailEvaluationRunForm?.name || "").trim(),
              targetAgentId: selectedAgentEvaluationAgentId,
              targetAgentName: String(draftAgent.name || draftAgent.label || draftAgent.title || selectedAgentEvaluationAgentId).trim(),
              targetAgentPhotoUrl: typeof getPlaygroundEvaluationAgentPhotoUrl === "function"
                ? getPlaygroundEvaluationAgentPhotoUrl(draftAgent)
                : getPlaygroundAgentRunnerPhotoUrl(draftAgent),
              targetAgentVersionId: String(activeVersion?.id || "").trim(),
              targetAgentVersionNumber: Math.max(0, Number(activeVersion?.version || 0) || 0),
              targetAgentVersionLabel: String(activeVersion?.label || (activeVersion?.version ? "Version " + activeVersion.version : "") || "").trim(),
              targetAgentVersionRevisionId: String(activeVersion?.revisionId || activeVersion?.revision_id || "").trim(),
              environmentType: targetEnvironmentType,
              environmentId: targetEnvironmentId,
              environmentName: targetEnvironmentType === "computer" ? String(environmentChoice.environmentName || environmentChoice.name || targetEnvironmentId).trim() : "",
              projectId: targetProjectId,
              projectName: targetEnvironmentType === "project" ? String(environmentChoice.projectName || environmentChoice.name || targetProjectId).trim() : "",
              evaluator,
              passThreshold: typeof normalizePlaygroundEvaluationPassThreshold === "function"
                ? normalizePlaygroundEvaluationPassThreshold(targetSet.passThreshold)
                : Number(targetSet.passThreshold || 0.8),
            };
            setAgentDetailEvaluationRunState({ status: "running", error: "" });
            try {
              const response = await fetch(normalizedBackendUrl + "/evaluations/runs", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...(requestHeaders || {}),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  evaluationSet: evaluationSetSnapshot,
                  runOptions: runRequestOptions,
                }),
              });
              const data = typeof readPlaygroundEvaluationBackendJson === "function"
                ? await readPlaygroundEvaluationBackendJson(response, "Failed to start evaluation run.")
                : await response.json();
              const run = normalizePlaygroundEvaluationRun({
                ...runRequestOptions,
                ...(data?.run || data?.data || data || {}),
              });
              if (!run.id) {
                throw new Error("Evaluation run was created but no run id was returned.");
              }
              upsertAgentEvaluationRun(targetSet.id, run, {
                targetAgentId: selectedAgentEvaluationAgentId,
                environmentType: targetEnvironmentType,
                environmentId: targetEnvironmentId,
                projectId: targetProjectId,
                evaluator,
                passThreshold: runRequestOptions.passThreshold,
              });
              setAgentDetailEvaluationSelectedSetId(targetSet.id);
              setAgentDetailEvaluationRunState({ status: "idle", error: "" });
              closeAgentEvaluationRunModal({ force: true });
              void pollAgentEvaluationRun(targetSet.id, run.id, run);
            } catch (error) {
              setAgentDetailEvaluationRunState({ status: "error", error: error?.message || String(error) });
            }
          }
          function PlaygroundAgentEvaluationVersionChart({ entries, passThreshold }) {
            const canvasRef = useRef(null);
            const chartRef = useRef(null);
            const chartSignature = JSON.stringify({
              entries: entries.map((entry) => ({
                label: entry.label,
                score: entry.score,
                passThreshold,
              })),
            });
            useEffect(() => () => {
              if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
              }
            }, []);
            useEffect(() => {
              const canvas = canvasRef.current;
              if (!canvas || typeof Chart !== "function") return undefined;
              const labels = entries.map((entry) => entry.label);
              const values = entries.map((entry) => Math.round(Math.max(0, Math.min(1, Number(entry.score || 0))) * 100));
              const thresholdValue = Math.round(Math.max(0, Math.min(1, Number(passThreshold || 0.8))) * 100);
              const makeVerticalGradient = (context, stops, fallback) => {
                const chart = context?.chart;
                const chartArea = chart?.chartArea;
                const ctx = chart?.ctx;
                if (!ctx || !chartArea) return fallback;
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
                return gradient;
              };
              const chartData = {
                labels,
                datasets: [
                  {
                    id: "score",
                    type: "bar",
                    label: "Score",
                    data: values,
                    backgroundColor: (context) => makeVerticalGradient(context, [
                      [0, "rgba(126, 255, 255, 0.82)"],
                      [1, "rgba(91, 103, 230, 0.62)"],
                    ], "rgba(102, 166, 255, 0.72)"),
                    borderWidth: 0,
                    borderRadius: 3,
                    barPercentage: 0.64,
                    categoryPercentage: 0.82,
                    maxBarThickness: 34,
                    order: 2,
                  },
                  {
                    id: "threshold",
                    type: "line",
                    label: "Pass threshold",
                    data: values.map(() => thresholdValue),
                    borderColor: "rgba(255, 255, 255, 0.48)",
                    borderDash: [5, 6],
                    borderWidth: 1,
                    pointRadius: 0,
                    tension: 0,
                    order: 1,
                  },
                ],
              };
              const chartOptions = {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                normalized: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(8, 8, 8, 0.96)",
                    borderColor: "rgba(255, 255, 255, 0.14)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    titleColor: "rgba(255, 255, 255, 0.94)",
                    bodyColor: "rgba(255, 255, 255, 0.78)",
                    padding: 10,
                    callbacks: {
                      label: (context) => String(context.dataset?.label || "Score") + ": " + Math.round(Number(context.parsed?.y || 0)) + "%",
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false, drawBorder: false },
                    border: { display: false },
                    ticks: {
                      color: "rgba(255, 255, 255, 0.42)",
                      font: { size: 11, weight: "400", family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" },
                      maxRotation: 0,
                      minRotation: 0,
                    },
                  },
                  y: {
                    min: 0,
                    max: 100,
                    border: { display: false },
                    grid: { color: "rgba(255, 255, 255, 0.07)", drawTicks: false },
                    ticks: {
                      color: "rgba(255, 255, 255, 0.34)",
                      padding: 8,
                      font: { size: 11, weight: "400", family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" },
                      callback: (value) => Math.round(Number(value || 0)) + "%",
                    },
                  },
                },
              };
              if (chartRef.current) {
                chartRef.current.data = chartData;
                chartRef.current.options = chartOptions;
                chartRef.current.update("none");
                return undefined;
              }
              chartRef.current = new Chart(canvas, { type: "bar", data: chartData, options: chartOptions });
              return undefined;
            }, [chartSignature]);
            return React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame" },
              React.createElement("canvas", {
                ref: canvasRef,
                className: "playground-project-overview-progress-combo-canvas playground-agents-detail-progress-combo-canvas",
                role: "img",
                "aria-label": "Evaluation score by agent version",
              })
            );
          }
          function renderAgentEvaluationStatusBadge(run) {
            const status = getAgentEvaluationRunStatus(run);
            return React.createElement("span", {
              className: "playground-agents-detail-evaluation-status"
                + (status === "running" ? " is-running" : "")
                + (status === "failed" ? " is-failed" : ""),
            }, status);
          }
          function renderAgentEvaluationEnvironment(run) {
            const isProject = String(run?.environmentType || "").trim().toLowerCase() === "project";
            return React.createElement("span", {
              className: "playground-agents-detail-evaluation-env",
              title: getAgentEvaluationEnvironmentLabel(run),
            },
              React.createElement(isProject ? Rocket : Monitor, { width: 13, height: 13, strokeWidth: 1.8 }),
              React.createElement("span", null, getAgentEvaluationEnvironmentLabel(run))
            );
          }
          function renderAgentEvaluationRunModal() {
            if (!agentDetailEvaluationRunModalOpen && !agentDetailEvaluationRunModalClosing) return null;
            const form = agentDetailEvaluationRunForm && typeof agentDetailEvaluationRunForm === "object" ? agentDetailEvaluationRunForm : {};
            const selectedSet = agentEvaluationSets.find((set) => set.id === String(form.setId || "").trim()) || null;
            const busy = agentDetailEvaluationRunState.status === "running";
            const selectedEnvironmentChoice = agentEvaluationEnvironmentChoices.find((choice) => choice.key === String(form.environmentKey || "").trim())
              || getAgentEvaluationDefaultEnvironmentChoice(selectedSet);
            const evaluationSelectorOptions = agentEvaluationSets
              .filter((set) => String(set?.id || "").trim())
              .map((set) => ({
                value: set.id,
                label: set.name || set.id,
                description: (Array.isArray(set.dataRows) ? set.dataRows.length : 0) + " cases",
              }));
            const environmentSelectorOptions = agentEvaluationEnvironmentChoices
              .filter((choice) => String(choice?.key || "").trim())
              .map((choice) => {
                const isProject = choice.type === "project";
                return {
                  value: choice.key,
                  label: isProject
                    ? (choice.projectName || choice.projectId || choice.key)
                    : (choice.environmentName || choice.environmentId || choice.key),
                  description: isProject
                    ? (choice.disabled ? "Project · no default computer" : "Project")
                    : "Computer",
                  leading: React.createElement(isProject ? Rocket : Monitor, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  }),
                  disabled: Boolean(choice.disabled),
                };
              });
            const selectedEnvironmentLabel = selectedEnvironmentChoice
              ? (selectedEnvironmentChoice.type === "project"
                ? (selectedEnvironmentChoice.projectName || selectedEnvironmentChoice.projectId)
                : (selectedEnvironmentChoice.environmentName || selectedEnvironmentChoice.environmentId))
              : "Select environment";
            const renderAgentRunSelector = ({
              value,
              options,
              label,
              ariaLabel,
              onValueChange,
              disabled = false,
              emptyContent = "No options available.",
            }) => React.createElement(PlatformSelector, {
              value,
              options,
              onValueChange,
              ariaLabel,
              label,
              placeholder: label,
              disabled,
              alignment: "end",
              popupAlignment: "right",
              fullWidth: true,
              emptyContent,
              popupWidth: "min(300px, calc(100vw - 48px))",
              popupMaxWidth: "calc(100vw - 48px)",
              popupMaxHeight: "min(320px, calc(100vh - 120px))",
              className: "playground-tasks-detail-central-selector",
              triggerClassName: "playground-tasks-detail-central-selector-trigger",
              popupClassName: "playground-tasks-detail-central-selector-popup",
            });
            const renderAgentRunFact = (label, control) => React.createElement("div", {
                className: "playground-tasks-detail-fact playground-evaluations-run-modal-fact",
              },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
            );
            return React.createElement(PlatformModal, {
                open: agentDetailEvaluationRunModalOpen,
                visible: agentDetailEvaluationRunModalVisible,
                closing: agentDetailEvaluationRunModalClosing,
                animationDurationMs: 75,
                portal: true,
                as: "form",
                size: "medium",
                maxHeight: "min(720px, calc(100vh - 48px))",
                scrollable: true,
                title: "Run Evaluation",
                headerVariant: "search",
                headerSearchProps: {
                  icon: Play,
                  value: form.name || "",
                  placeholder: "Run name",
                  "aria-label": "Run name",
                  autoComplete: "off",
                  disabled: busy,
                  onChange: (event) => setAgentDetailEvaluationRunForm((current) => ({ ...(current || {}), name: event.target.value })),
                },
                onClose: () => closeAgentEvaluationRunModal(),
                closeOnBackdrop: !busy,
                closeOnEscape: !busy,
                closeButtonDisabled: busy,
                closeButtonLabel: "Close run evaluation modal",
                ariaLabel: "Run agent evaluation",
                className: "playground-evaluations-run-modal playground-agents-detail-evaluation-modal",
                backdropClassName: "playground-evaluations-run-modal-backdrop playground-agents-detail-evaluation-modal-backdrop",
                bodyClassName: "playground-evaluations-run-modal-body playground-agents-detail-evaluation-modal-body",
                footerClassName: "playground-evaluations-modal-actions",
                surfaceProps: { onSubmit: handleAgentEvaluationRunSubmit },
                footer: React.createElement(React.Fragment, null,
                  React.createElement(PlatformSecondaryButton, {
                    size: "medium",
                    type: "button",
                    onClick: () => closeAgentEvaluationRunModal(),
                    disabled: busy,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    disabled: busy || !agentEvaluationSets.length,
                    "aria-busy": busy || undefined,
                  },
                    busy
                      ? React.createElement(Loader2, { className: "playground-files-state-loader", width: 14, height: 14, strokeWidth: 1.8 })
                      : React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, busy ? "Starting" : "Run Evaluation")
                  )
                ),
              },
              React.createElement("div", {
                  className: "playground-tasks-detail-facts playground-tasks-issue-details-section playground-evaluations-run-modal-settings",
                },
                React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                  renderAgentRunFact("Evaluation",
                    renderAgentRunSelector({
                      value: form.setId || "",
                      options: evaluationSelectorOptions,
                      label: React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" },
                        selectedSet?.name || selectedSet?.id || "Select evaluation"
                      ),
                      ariaLabel: "Select evaluation",
                      onValueChange: (nextValue) => {
                        const nextSet = agentEvaluationSets.find((set) => set.id === nextValue) || null;
                        const nextEnvironment = getAgentEvaluationDefaultEnvironmentChoice(nextSet);
                        setAgentDetailEvaluationRunForm((current) => ({
                          ...(current || {}),
                          setId: nextValue,
                          name: current?.name || (nextSet?.name || ""),
                          environmentKey: nextEnvironment?.key || current?.environmentKey || "",
                        }));
                      },
                      disabled: evaluationSelectorOptions.length === 0 || busy,
                      emptyContent: "No evaluation sets.",
                    })
                  ),
                  renderAgentRunFact("Environment",
                    renderAgentRunSelector({
                      value: form.environmentKey || "",
                      options: environmentSelectorOptions,
                      label: React.createElement("span", { className: "playground-tasks-detail-person-value" },
                        React.createElement(selectedEnvironmentChoice?.type === "project" ? Rocket : Monitor, {
                          width: 14,
                          height: 14,
                          strokeWidth: 1.8,
                          "aria-hidden": "true",
                        }),
                        React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, selectedEnvironmentLabel)
                      ),
                      ariaLabel: "Select evaluation environment",
                      onValueChange: (nextValue) => setAgentDetailEvaluationRunForm((current) => ({ ...(current || {}), environmentKey: nextValue })),
                      disabled: environmentSelectorOptions.length === 0 || busy,
                      emptyContent: "No environments available.",
                    })
                  )
                )
              ),
              selectedSet
                ? React.createElement("div", { className: "playground-tasks-secondary-copy" },
                    "Agent: " + (draftAgent.name || "Current agent") + " · Pass threshold " + formatAgentEvaluationPercent(selectedSet.passThreshold) + " · " + (Array.isArray(selectedSet.dataRows) ? selectedSet.dataRows.length : 0) + " cases"
                  )
                : null,
              agentDetailEvaluationRunState.error
                ? React.createElement("div", { className: "playground-agents-detail-evaluation-modal-error" }, agentDetailEvaluationRunState.error)
                : null
            );
          }
          function renderAgentEvaluationListSection() {
            const emptyAgentEvaluationsState = React.createElement(PlatformEmptyState, {
              icon: ChartColumnIncreasing,
              title: "No evaluations yet",
              description: "Run an evaluation to measure this agent's performance over time.",
            });
            return React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-agents-detail-evaluations-section",
                key: "evaluation",
                "data-section-id": "evaluation",
              },
              React.createElement(PlatformDataTable, {
                rows: agentEvaluationStatusFilteredRows,
                getRowId: (row) => row.set.id,
                ariaLabel: "Agent evaluations",
                className: "playground-agent-evaluations-platform-table",
                surface: "plain",
                variant: "minimalistic-ui",
                sticky: false,
                sorting: {
                  defaultValue: { id: "updated", direction: "desc" },
                },
                toolbar: {
                  leading: agentInsightsTableTabs,
                  search: {
                    value: agentDetailEvaluationSearchQuery,
                    onChange: setAgentDetailEvaluationSearchQuery,
                    placeholder: "Search evaluations",
                    ariaLabel: "Search agent evaluations",
                    getSearchText: getAgentEvaluationSearchText,
                  },
                  filters: [
                    {
                      id: "status",
                      label: "Status",
                      value: agentDetailEvaluationFilterMode,
                      options: [
                        { id: "all", label: "All Evaluations", description: "Show every evaluation run for this agent" },
                        { id: "passed", label: "Passed", description: "Latest run met its pass threshold" },
                        { id: "running", label: "Running", description: "Latest run is still in progress" },
                        { id: "completed", label: "Completed", description: "Latest run finished below its pass threshold" },
                        { id: "failed", label: "Failed", description: "Latest run ended with an error" },
                      ],
                      onChange: setAgentDetailEvaluationFilterMode,
                    },
                  ],
                  controlsLeading: React.createElement(PlatformSecondaryButton, {
                      size: "small",
                      type: "button",
                      onClick: () => openAgentEvaluationRunModal(filteredAgentEvaluationRows[0]?.set?.id || agentEvaluationSets[0]?.id || ""),
                      disabled: !agentEvaluationSets.length || typeof setEvaluationSets !== "function",
                    },
                    React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Run Evaluation")
                  ),
                },
                emptyState: agentDetailEvaluationFilterMode === "all"
                  ? emptyAgentEvaluationsState
                  : "No evaluations match this status filter.",
                noResultsState: "No matching evaluations for this agent.",
                columns: [
                  {
                    id: "evaluation",
                    header: "Evaluation",
                    accessor: (row) => row.set.name || "Untitled Evaluation",
                    sortable: true,
                    width: "minmax(180px, 1.5fr)",
                    cell: ({ row }) => React.createElement("div", { className: "playground-plugin-row-title" }, row.set.name || "Untitled Evaluation"),
                  },
                  {
                    id: "score",
                    header: "Score",
                    accessor: (row) => Number(row.latestRun?.averageScore || 0),
                    sortable: true,
                    sortDescFirst: true,
                    width: "minmax(80px, 0.65fr)",
                    cell: ({ row }) => React.createElement("span", { className: "playground-agents-detail-evaluation-score" }, row.latestRun ? formatAgentEvaluationPercent(row.latestRun.averageScore) : "-"),
                  },
                  {
                    id: "version",
                    header: "Version",
                    accessor: (row) => getAgentEvaluationVersionLabel(row.latestRun),
                    sortable: true,
                    width: "minmax(100px, 0.8fr)",
                    cell: ({ row }) => React.createElement("span", { className: "playground-agents-detail-evaluation-version" }, getAgentEvaluationVersionLabel(row.latestRun)),
                  },
                  { id: "runs", header: "Runs", accessor: (row) => row.runs.length, sortable: true, sortDescFirst: true, width: "minmax(70px, 0.55fr)", hideBelow: 700 },
                  {
                    id: "updated",
                    header: "Updated",
                    accessor: (row) => row.latestRun?.completedAt || row.latestRun?.createdAt || row.set.updatedAt || "",
                    sortable: true,
                    sortDescFirst: true,
                    width: "minmax(110px, 0.9fr)",
                    align: "end",
                    cell: ({ row }) => formatAgentEvaluationDate(row.latestRun?.completedAt || row.latestRun?.createdAt || row.set.updatedAt),
                  },
                ],
                onRowActivate: (row) => setAgentDetailEvaluationSelectedSetId(row.set.id),
                getRowAriaLabel: (row) => "Open evaluation " + (row.set.name || "Untitled Evaluation"),
              })
            );
          }
          function renderAgentEvaluationDetailSection(row) {
            const selectedRow = row || null;
            if (!selectedRow?.set) {
              return renderAgentEvaluationListSection();
            }
            const runs = selectedRow.runs || [];
            const latestRunsByVersion = Array.from(runs.reduce((map, run) => {
              const key = getAgentEvaluationVersionKey(run);
              const existing = map.get(key);
              if (!existing || getAgentEvaluationRunTimestampMs(run) > getAgentEvaluationRunTimestampMs(existing)) {
                map.set(key, run);
              }
              return map;
            }, new Map()).values()).sort((left, right) => {
              const leftNumber = Number(left?.targetAgentVersionNumber || 0) || 0;
              const rightNumber = Number(right?.targetAgentVersionNumber || 0) || 0;
              if (rightNumber !== leftNumber) return rightNumber - leftNumber;
              return getAgentEvaluationRunTimestampMs(right) - getAgentEvaluationRunTimestampMs(left);
            });
            const visibleLatestRunsByVersion = latestRunsByVersion.filter((run) => (
              agentDetailEvaluationRunFilterMode === "all"
              || getAgentEvaluationRunStatus(run) === agentDetailEvaluationRunFilterMode
            ));
            const latestRun = runs[0] || null;
            const bestRun = runs.reduce((best, run) => Number(run?.averageScore || 0) > Number(best?.averageScore || 0) ? run : best, latestRun || null);
            const passedRuns = runs.filter((run) => !isAgentEvaluationRunActive(run) && Number(run?.averageScore || 0) >= Number(run?.passThreshold || selectedRow.set.passThreshold || 0.8)).length;
            const passRate = runs.length > 0 ? passedRuns / runs.length : 0;
            const chartEntries = latestRunsByVersion.map((run) => ({
              label: getAgentEvaluationVersionLabel(run),
              score: run.averageScore,
            }));
            const kpis = [
              { id: "latest-score", label: "Latest Score", value: latestRun ? formatAgentEvaluationPercent(latestRun.averageScore) : "-" },
              { id: "best-score", label: "Best Score", value: bestRun ? formatAgentEvaluationPercent(bestRun.averageScore) : "-" },
              { id: "pass-rate", label: "Pass Rate", value: formatAgentEvaluationPercent(passRate) },
              { id: "versions", label: "Versions", value: String(latestRunsByVersion.length) },
            ];
            return React.createElement(React.Fragment, null,
              React.createElement("button", {
                type: "button",
                className: "playground-resource-detail-back-button playground-agents-detail-evaluation-detail-back",
                onClick: () => setAgentDetailEvaluationSelectedSetId(""),
              },
                React.createElement(ArrowLeft, { width: 12, height: 12, strokeWidth: 1.8 }),
                React.createElement("span", null, "Back")
              ),
              React.createElement("section", { className: "playground-project-overview-progress-combo-card playground-agents-detail-progress-combo-card" },
                React.createElement("div", { className: "playground-project-overview-progress-combo-topbar" },
                  React.createElement("h2", { className: "playground-project-overview-progress-combo-title" }, selectedRow.set.name || "Evaluation"),
                  React.createElement("div", { className: "playground-project-overview-progress-combo-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button playground-project-overview-toolbar-action",
                      onClick: () => openAgentEvaluationRunModal(selectedRow.set.id),
                      disabled: typeof setEvaluationSets !== "function",
                    },
                      React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Run Evaluation")
                    )
                  )
                ),
                React.createElement("div", { className: "playground-project-overview-progress-combo-metrics" },
                  kpis.map((item) =>
                    React.createElement("div", { key: item.id, className: "playground-project-overview-progress-combo-metric" },
                      React.createElement("div", { className: "playground-project-overview-progress-combo-metric-label" },
                        React.createElement("span", { className: "playground-project-overview-progress-combo-metric-dot is-" + item.id, "aria-hidden": "true" }),
                        React.createElement("span", null, item.label)
                      ),
                      React.createElement("div", { className: "playground-project-overview-progress-combo-metric-value" }, item.value)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-project-overview-progress-combo-chart" },
                  chartEntries.length > 0
                    ? React.createElement(PlaygroundAgentEvaluationVersionChart, {
                        entries: chartEntries,
                        passThreshold: selectedRow.set.passThreshold,
                      })
                    : React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame" },
                        React.createElement("div", { className: "playground-project-overview-chart-empty" }, "Run this evaluation to compare versions.")
                      )
                )
              ),
              React.createElement("section", {
                  className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-agents-detail-evaluation-version-section",
                },
                React.createElement(PlatformDataTable, {
                  rows: visibleLatestRunsByVersion,
                  getRowId: (run) => run.id,
                  ariaLabel: "Evaluation runs by agent version",
                  className: "playground-agent-evaluation-runs-platform-table",
                  surface: "plain",
                  variant: "minimalistic-ui",
                  sticky: false,
                  sorting: {
                    defaultValue: { id: "updated", direction: "desc" },
                  },
                  toolbar: {
                    title: "Runs by Version",
                    search: {
                      placeholder: "Search runs",
                      ariaLabel: "Search evaluation runs by agent version",
                      getSearchText: (run) => [
                        getAgentEvaluationVersionLabel(run),
                        formatAgentEvaluationPercent(run.averageScore),
                        getAgentEvaluationRunStatus(run),
                        getAgentEvaluationEnvironmentLabel(run),
                        formatAgentEvaluationDate(run.completedAt || run.createdAt),
                      ].join(" "),
                    },
                    filters: [
                      {
                        id: "status",
                        label: "Status",
                        value: agentDetailEvaluationRunFilterMode,
                        options: [
                          { id: "all", label: "All Runs", description: "Show the latest run for every agent version" },
                          { id: "passed", label: "Passed", description: "Only show runs that met the pass threshold" },
                          { id: "running", label: "Running", description: "Only show runs still in progress" },
                          { id: "completed", label: "Completed", description: "Only show completed runs below the pass threshold" },
                          { id: "failed", label: "Failed", description: "Only show runs that ended with an error" },
                        ],
                        onChange: setAgentDetailEvaluationRunFilterMode,
                      },
                    ],
                  },
                  emptyState: agentDetailEvaluationRunFilterMode === "all"
                    ? "No runs for this evaluation yet."
                    : "No runs match this status filter.",
                  noResultsState: "No matching evaluation runs.",
                  columns: [
                    {
                      id: "version",
                      header: "Version",
                      accessor: getAgentEvaluationVersionLabel,
                      sortable: true,
                      width: "minmax(120px, 1fr)",
                      cell: ({ row: run }) => React.createElement("span", { className: "playground-agents-detail-evaluation-version" }, getAgentEvaluationVersionLabel(run)),
                    },
                    {
                      id: "score",
                      header: "Score",
                      accessor: (run) => Number(run.averageScore || 0),
                      sortable: true,
                      sortDescFirst: true,
                      width: "minmax(80px, 0.65fr)",
                      cell: ({ row: run }) => React.createElement("span", { className: "playground-agents-detail-evaluation-score" }, formatAgentEvaluationPercent(run.averageScore)),
                    },
                    { id: "status", header: "Status", accessor: (run) => run.status || "", sortable: true, width: "minmax(100px, 0.8fr)", cell: ({ row: run }) => renderAgentEvaluationStatusBadge(run) },
                    { id: "environment", header: "Environment", accessor: getAgentEvaluationEnvironmentLabel, sortable: true, width: "minmax(130px, 1.1fr)", hideBelow: 760, cell: ({ row: run }) => renderAgentEvaluationEnvironment(run) },
                    {
                      id: "updated",
                      header: "Updated",
                      accessor: (run) => run.completedAt || run.createdAt || "",
                      sortable: true,
                      sortDescFirst: true,
                      width: "minmax(110px, 0.9fr)",
                      align: "end",
                      cell: ({ row: run }) => formatAgentEvaluationDate(run.completedAt || run.createdAt),
                    },
                  ],
                })
              )
            );
          }
          const agentEvaluationsSection = selectedAgentEvaluationRow
            ? renderAgentEvaluationDetailSection(selectedAgentEvaluationRow)
            : renderAgentEvaluationListSection();
`;

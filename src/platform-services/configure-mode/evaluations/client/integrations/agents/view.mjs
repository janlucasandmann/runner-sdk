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
          const normalizedAgentEvaluationSearch = String(agentDetailEvaluationSearchQuery || "").trim().toLowerCase();
          const filteredAgentEvaluationRows = agentEvaluationRows.filter((row) => {
            if (!normalizedAgentEvaluationSearch) return true;
            const haystack = [
              row.set?.name,
              row.set?.id,
              row.latestRun?.label,
              getAgentEvaluationVersionLabel(row.latestRun),
              getAgentEvaluationEnvironmentLabel(row.latestRun),
            ].join(" ").toLowerCase();
            return haystack.includes(normalizedAgentEvaluationSearch);
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
            return React.createElement(PlatformModalBackdrop, {
                className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-outcome-editor-backdrop playground-evaluations-run-modal-backdrop playground-agents-detail-evaluation-modal-backdrop"
                  + (agentDetailEvaluationRunModalVisible ? " is-visible" : "")
                  + (agentDetailEvaluationRunModalClosing ? " is-closing" : ""),
                role: "dialog",
                "aria-modal": "true",
                onClick: closeAgentEvaluationRunModal,
              },
              React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal playground-evaluations-run-modal playground-agents-detail-evaluation-modal"
                    + (agentDetailEvaluationRunModalVisible ? " is-visible" : "")
                    + (agentDetailEvaluationRunModalClosing ? " is-closing" : ""),
                  onClick: (event) => event.stopPropagation(),
                  onSubmit: handleAgentEvaluationRunSubmit,
                },
                React.createElement("div", { className: "playground-tasks-project-modal-top" },
                  React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                    React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                      React.createElement(Play, { width: 18, height: 18, strokeWidth: 1.8 })
                    ),
                    React.createElement("input", {
                      className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
                      value: form.name || "",
                      placeholder: "Run name",
                      onChange: (event) => setAgentDetailEvaluationRunForm((current) => ({ ...(current || {}), name: event.target.value })),
                      autoFocus: true,
                      "aria-label": "Run name",
                    })
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-settings-icon-button playground-tasks-project-modal-close",
                    onClick: closeAgentEvaluationRunModal,
                    title: "Close",
                    "aria-label": "Close run evaluation modal",
                    disabled: busy,
                  }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                ),
                React.createElement("div", { className: "playground-mission-control-modal-body playground-project-overview-outcome-editor-shell playground-evaluations-run-modal-shell" },
                  React.createElement("div", { className: "playground-mission-control-modal-context playground-project-overview-outcome-editor-body playground-evaluations-run-modal-body playground-agents-detail-evaluation-modal-body" },
                    React.createElement("div", { className: "playground-tasks-issue-modal-grid" },
                      React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                        React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Evaluation"),
                        React.createElement("select", {
                          className: "playground-tasks-issue-modal-select",
                          value: form.setId || "",
                          onChange: (event) => {
                            const nextSet = agentEvaluationSets.find((set) => set.id === event.target.value) || null;
                            const nextEnvironment = getAgentEvaluationDefaultEnvironmentChoice(nextSet);
                            setAgentDetailEvaluationRunForm((current) => ({
                              ...(current || {}),
                              setId: event.target.value,
                              name: current?.name || (nextSet?.name || ""),
                              environmentKey: nextEnvironment?.key || current?.environmentKey || "",
                            }));
                          },
                        },
                          agentEvaluationSets.length > 0
                            ? agentEvaluationSets.map((set) =>
                                React.createElement("option", { key: set.id, value: set.id }, set.name || set.id)
                              )
                            : React.createElement("option", { value: "" }, "No evaluation sets")
                        )
                      ),
                      React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                        React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Environment"),
                        React.createElement("select", {
                          className: "playground-tasks-issue-modal-select",
                          value: form.environmentKey || "",
                          onChange: (event) => setAgentDetailEvaluationRunForm((current) => ({ ...(current || {}), environmentKey: event.target.value })),
                        },
                          React.createElement("optgroup", { label: "Computers" },
                            agentEvaluationEnvironmentChoices.filter((choice) => choice.type === "computer").length > 0
                              ? agentEvaluationEnvironmentChoices.filter((choice) => choice.type === "computer").map((choice) =>
                                  React.createElement("option", { key: choice.key, value: choice.key }, choice.environmentName || choice.environmentId)
                                )
                              : React.createElement("option", { value: "", disabled: true }, "No computers available")
                          ),
                          React.createElement("optgroup", { label: "Projects" },
                            agentEvaluationEnvironmentChoices.filter((choice) => choice.type === "project").length > 0
                              ? agentEvaluationEnvironmentChoices.filter((choice) => choice.type === "project").map((choice) =>
                                  React.createElement("option", { key: choice.key, value: choice.key, disabled: choice.disabled },
                                    (choice.projectName || choice.projectId) + (choice.disabled ? " · no default computer" : "")
                                  )
                                )
                              : React.createElement("option", { value: "", disabled: true }, "No projects available")
                          )
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
                  ),
                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: closeAgentEvaluationRunModal,
                      disabled: busy,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "submit",
                      className: "playground-environments-action-button is-primary",
                      disabled: busy || !agentEvaluationSets.length,
                    },
                      busy ? React.createElement(Loader2, { className: "playground-files-state-loader", width: 14, height: 14, strokeWidth: 1.8 }) : React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, busy ? "Starting" : "Run Evaluation")
                    )
                  )
                )
              )
            );
          }
          function renderAgentEvaluationListSection() {
            return React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-agents-detail-evaluations-section",
                key: "evaluation",
                "data-section-id": "evaluation",
              },
              React.createElement("div", { className: "playground-plugins-section-header" },
                React.createElement("div", { className: "playground-plugins-section-copy" },
                  React.createElement("h3", { className: "playground-plugins-section-title" }, "Evaluation")
                )
              ),
              React.createElement("div", { className: "playground-plugins-search-row" },
                React.createElement("div", { className: "playground-plugins-search-shell" },
                  React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("input", {
                    type: "search",
                    value: agentDetailEvaluationSearchQuery,
                    onChange: (event) => setAgentDetailEvaluationSearchQuery(event.target.value),
                    className: "playground-plugins-search",
                    placeholder: "Search evaluations",
                    "aria-label": "Search agent evaluations",
                  })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-control-button playground-project-overview-toolbar-action",
                  onClick: () => openAgentEvaluationRunModal(filteredAgentEvaluationRows[0]?.set?.id || agentEvaluationSets[0]?.id || ""),
                  disabled: !agentEvaluationSets.length || typeof setEvaluationSets !== "function",
                },
                  React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Run Evaluation")
                )
              ),
              React.createElement(PlatformDataTable, {
                rows: filteredAgentEvaluationRows,
                getRowId: (row) => row.set.id,
                ariaLabel: "Agent evaluations",
                className: "playground-agent-evaluations-platform-table",
                surface: "plain",
                sticky: false,
                emptyState: normalizedAgentEvaluationSearch
                  ? "No matching evaluations for this agent."
                  : "No evaluations have been run for this agent yet.",
                columns: [
                  {
                    id: "evaluation",
                    header: "Evaluation",
                    accessor: (row) => row.set.name || "Untitled Evaluation",
                    width: "minmax(180px, 1.5fr)",
                    cell: ({ row }) => React.createElement("div", { className: "playground-plugin-row-title" }, row.set.name || "Untitled Evaluation"),
                  },
                  {
                    id: "score",
                    header: "Score",
                    accessor: (row) => Number(row.latestRun?.averageScore || 0),
                    width: "minmax(80px, 0.65fr)",
                    cell: ({ row }) => React.createElement("span", { className: "playground-agents-detail-evaluation-score" }, row.latestRun ? formatAgentEvaluationPercent(row.latestRun.averageScore) : "-"),
                  },
                  {
                    id: "version",
                    header: "Version",
                    accessor: (row) => getAgentEvaluationVersionLabel(row.latestRun),
                    width: "minmax(100px, 0.8fr)",
                    cell: ({ row }) => React.createElement("span", { className: "playground-agents-detail-evaluation-version" }, getAgentEvaluationVersionLabel(row.latestRun)),
                  },
                  { id: "runs", header: "Runs", accessor: (row) => row.runs.length, width: "minmax(70px, 0.55fr)", hideBelow: 700 },
                  {
                    id: "updated",
                    header: "Updated",
                    accessor: (row) => row.latestRun?.completedAt || row.latestRun?.createdAt || row.set.updatedAt || "",
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
                React.createElement("div", { className: "playground-plugins-section-header" },
                  React.createElement("div", { className: "playground-plugins-section-copy" },
                    React.createElement("h3", { className: "playground-plugins-section-title" }, "Runs by Version")
                  )
                ),
                React.createElement(PlatformDataTable, {
                  rows: latestRunsByVersion,
                  getRowId: (run) => run.id,
                  ariaLabel: "Evaluation runs by agent version",
                  className: "playground-agent-evaluation-runs-platform-table",
                  surface: "plain",
                  sticky: false,
                  emptyState: "No runs for this evaluation yet.",
                  columns: [
                    {
                      id: "version",
                      header: "Version",
                      accessor: getAgentEvaluationVersionLabel,
                      width: "minmax(120px, 1fr)",
                      cell: ({ row: run }) => React.createElement("span", { className: "playground-agents-detail-evaluation-version" }, getAgentEvaluationVersionLabel(run)),
                    },
                    {
                      id: "score",
                      header: "Score",
                      accessor: (run) => Number(run.averageScore || 0),
                      width: "minmax(80px, 0.65fr)",
                      cell: ({ row: run }) => React.createElement("span", { className: "playground-agents-detail-evaluation-score" }, formatAgentEvaluationPercent(run.averageScore)),
                    },
                    { id: "status", header: "Status", accessor: (run) => run.status || "", width: "minmax(100px, 0.8fr)", cell: ({ row: run }) => renderAgentEvaluationStatusBadge(run) },
                    { id: "environment", header: "Environment", accessor: getAgentEvaluationEnvironmentLabel, width: "minmax(130px, 1.1fr)", hideBelow: 760, cell: ({ row: run }) => renderAgentEvaluationEnvironment(run) },
                    {
                      id: "updated",
                      header: "Updated",
                      accessor: (run) => run.completedAt || run.createdAt || "",
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

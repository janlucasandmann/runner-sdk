export const GUARDRAILS_PAGE_EVALUATION_SCRIPT = `          const guardrailEvaluationEnvironmentChoices = typeof buildPlaygroundEvaluationEnvironmentChoices === "function"
            ? buildPlaygroundEvaluationEnvironmentChoices(runtimeEnvironments, runnerWorkspaceProjects)
            : [];
          const guardrailEvaluationAgentChoices = (Array.isArray(runtimeAgents) ? runtimeAgents : [])
            .filter((agent) => String(agent?.id || "").trim())
            .map((agent) => ({
              value: String(agent.id),
              label: String(agent.name || agent.label || agent.title || agent.id),
            }));
          const normalizeGuardrailEvaluationRun = (run, index = 0) => (
            typeof normalizePlaygroundEvaluationRun === "function"
              ? normalizePlaygroundEvaluationRun(run, index)
              : (run || {})
          );
          const normalizeGuardrailEvaluationSet = (set, index = 0) => (
            typeof normalizePlaygroundEvaluationSet === "function"
              ? normalizePlaygroundEvaluationSet(set, index)
              : (set || {})
          );
          const getGuardrailEvaluationRunTargetGuardrailId = (run) => {
            const metadata = run?.metadata && typeof run.metadata === "object" && !Array.isArray(run.metadata)
              ? run.metadata
              : {};
            const embeddedRun = metadata.run && typeof metadata.run === "object" && !Array.isArray(metadata.run)
              ? metadata.run
              : {};
            const targetType = String(
              run?.targetType
              || run?.target_type
              || metadata.targetType
              || metadata.target_type
              || embeddedRun.targetType
              || embeddedRun.target_type
              || ""
            ).trim().toLowerCase();
            const genericTargetId = ["guardrail", "guardrail_set", "guardrail-set"].includes(targetType)
              ? String(
                  run?.targetId
                  || run?.target_id
                  || metadata.targetId
                  || metadata.target_id
                  || embeddedRun.targetId
                  || embeddedRun.target_id
                  || ""
                )
              : "";
            return String(
              run?.targetGuardrailId
              || run?.target_guardrail_id
              || run?.guardrailId
              || run?.guardrail_id
              || metadata.targetGuardrailId
              || metadata.target_guardrail_id
              || metadata.guardrailId
              || metadata.guardrail_id
              || embeddedRun.targetGuardrailId
              || embeddedRun.target_guardrail_id
              || embeddedRun.guardrailId
              || embeddedRun.guardrail_id
              || genericTargetId
              || ""
            ).trim();
          };
          const getGuardrailEvaluationRunTimestamp = (run) => {
            const timestamp = Date.parse(String(run?.completedAt || run?.updatedAt || run?.createdAt || ""));
            return Number.isFinite(timestamp) ? timestamp : 0;
          };
          const isGuardrailEvaluationRunActive = (run) => {
            const status = String(run?.status || "").trim().toLowerCase();
            return ["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring"].includes(status);
          };
          const formatGuardrailEvaluationScore = (run) => {
            if (!run) return "—";
            if (isGuardrailEvaluationRunActive(run)) return "Running";
            return Math.round(Math.max(0, Math.min(1, Number(run.averageScore || 0))) * 100) + "%";
          };
          const requestGuardrailEvaluationJson = async (path, init = {}, fallbackMessage = "Evaluation request failed.") => {
            const normalizedBackendUrl = String(proxyBackendBase || "").replace(/\\\/+$/, "");
            if (!normalizedBackendUrl) throw new Error("Evaluation backend is unavailable.");
            const headers = new Headers(requestHeaders || {});
            if (init.body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
            const response = await fetch(normalizedBackendUrl + path, {
              credentials: "include",
              cache: "no-store",
              ...init,
              headers,
            });
            if (typeof readPlaygroundEvaluationBackendJson === "function") {
              try {
                return await readPlaygroundEvaluationBackendJson(response, fallbackMessage);
              } catch (error) {
                if (error && typeof error === "object" && !Number(error.status || 0)) {
                  error.status = response.status;
                }
                throw error;
              }
            }
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              const error = new Error(data?.message || data?.error || fallbackMessage);
              error.status = response.status;
              throw error;
            }
            return data;
          };
          const readGuardrailEvaluationList = (payload, keys) => (
            typeof readPlaygroundEvaluationListFromPayload === "function"
              ? readPlaygroundEvaluationListFromPayload(payload || {}, keys)
              : (Array.isArray(payload) ? payload : keys.reduce((items, key) => items.length ? items : (Array.isArray(payload?.[key]) ? payload[key] : []), []))
          );
          const normalizeGuardrailEvaluationOverviewRow = (row, index = 0) => {
            const source = row && typeof row === "object" && !Array.isArray(row) ? row : {};
            const set = normalizeGuardrailEvaluationSet(
              source.evaluation || source.set || source.evaluationSet || source.evaluation_set || {},
              index
            );
            const latestRunSource = source.latestRun || source.latest_run || null;
            const latestRun = latestRunSource
              ? normalizeGuardrailEvaluationRun(latestRunSource, index)
              : null;
            return {
              set,
              latestRun,
              runCount: Math.max(0, Number(source.runCount ?? source.run_count ?? 0) || 0),
            };
          };
          const buildLegacyGuardrailEvaluationOverview = (setsPayload, runsPayload, targetGuardrailSetId) => {
            const sets = readGuardrailEvaluationList(setsPayload, ["evaluations", "evaluationSets", "evaluation_sets"])
              .map((set, index) => normalizeGuardrailEvaluationSet(set, index))
              .filter((set) => String(set?.id || "").trim());
            const runs = readGuardrailEvaluationList(runsPayload, ["runs", "evaluationRuns", "evaluation_runs"])
              .map((run, index) => normalizeGuardrailEvaluationRun(run, index))
              .filter((run) => String(run?.id || "").trim())
              .filter((run) => getGuardrailEvaluationRunTargetGuardrailId(run) === targetGuardrailSetId);
            return sets.map((set) => {
              const matchingRuns = runs
                .filter((run) => String(run?.evaluationSetId || run?.evaluationId || "") === String(set.id))
                .sort((left, right) => getGuardrailEvaluationRunTimestamp(right) - getGuardrailEvaluationRunTimestamp(left));
              return {
                set,
                latestRun: matchingRuns[0] || null,
                runCount: matchingRuns.length,
              };
            }).filter((row) => row.runCount > 0);
          };
          const requestGuardrailEvaluationOverview = async (targetGuardrailSetId) => {
            try {
              const payload = await requestGuardrailEvaluationJson(
                "/evaluations/runs/guardrail-overview?guardrailId=" + encodeURIComponent(targetGuardrailSetId) + "&limit=500",
                { method: "GET" },
                "Failed to load guardrail evaluations."
              );
              return readGuardrailEvaluationList(payload, ["rows", "data", "guardrailEvaluationRows", "guardrail_evaluation_rows"])
                .map((row, index) => normalizeGuardrailEvaluationOverviewRow(row, index))
                .filter((row) => String(row?.set?.id || "").trim())
                .filter((row) => !row.latestRun || getGuardrailEvaluationRunTargetGuardrailId(row.latestRun) === targetGuardrailSetId);
            } catch (error) {
              if (![404, 405, 501].includes(Number(error?.status || 0))) throw error;
              const [setsPayload, runsPayload] = await Promise.all([
                requestGuardrailEvaluationJson("/evaluations?view=summary&limit=500", { method: "GET" }, "Failed to load evaluations."),
                requestGuardrailEvaluationJson("/evaluations/runs?limit=500", { method: "GET" }, "Failed to load evaluation runs.").catch(() => ({ runs: [] })),
              ]);
              return buildLegacyGuardrailEvaluationOverview(setsPayload, runsPayload, targetGuardrailSetId);
            }
          };
          const loadGuardrailEvaluationData = async (options = {}) => {
            const targetGuardrailSetId = String(selectedGuardrailSet?.id || "").trim();
            const loadStateMatchesTarget = String(guardrailEvaluationLoadState.guardrailSetId || "") === targetGuardrailSetId;
            if (!options.force && loadStateMatchesTarget && guardrailEvaluationLoadState.status === "loading") {
              return { rows: guardrailEvaluationOverviewRows };
            }
            if (!options.force && loadStateMatchesTarget && guardrailEvaluationLoadState.status === "loaded") {
              return { rows: guardrailEvaluationOverviewRows };
            }
            const requestToken = Number(guardrailEvaluationRequestRef.current?.token || 0) + 1;
            guardrailEvaluationRequestRef.current = { token: requestToken, guardrailSetId: targetGuardrailSetId };
            setGuardrailEvaluationLoadState({ status: "loading", error: "", guardrailSetId: targetGuardrailSetId });
            try {
              const rows = targetGuardrailSetId
                ? await requestGuardrailEvaluationOverview(targetGuardrailSetId)
                : [];
              const requestIsCurrent = Number(guardrailEvaluationRequestRef.current?.token || 0) === requestToken
                && String(guardrailEvaluationRequestRef.current?.guardrailSetId || "") === targetGuardrailSetId;
              if (!requestIsCurrent) return { rows };
              setGuardrailEvaluationOverviewRows(rows);
              setGuardrailEvaluationRuns([]);
              setGuardrailEvaluationLoadState({ status: "loaded", error: "", guardrailSetId: targetGuardrailSetId });
              return { rows };
            } catch (error) {
              const requestIsCurrent = Number(guardrailEvaluationRequestRef.current?.token || 0) === requestToken
                && String(guardrailEvaluationRequestRef.current?.guardrailSetId || "") === targetGuardrailSetId;
              if (requestIsCurrent) {
                setGuardrailEvaluationLoadState({
                  status: "error",
                  error: error?.message || String(error),
                  guardrailSetId: targetGuardrailSetId,
                });
              }
              return { rows: [] };
            }
          };
          const loadGuardrailEvaluationCatalog = async (options = {}) => {
            if (!options.force && guardrailEvaluationCatalogLoadState.status === "loaded") {
              return guardrailEvaluationSets;
            }
            if (!options.force && guardrailEvaluationCatalogRequestRef.current) {
              return await guardrailEvaluationCatalogRequestRef.current;
            }
            setGuardrailEvaluationCatalogLoadState({ status: "loading", error: "" });
            const request = (async () => {
              try {
                const payload = await requestGuardrailEvaluationJson(
                  "/evaluations?view=summary&limit=500",
                  { method: "GET" },
                  "Failed to load evaluations."
                );
                const sets = readGuardrailEvaluationList(payload, ["evaluations", "evaluationSets", "evaluation_sets"])
                  .map((set, index) => normalizeGuardrailEvaluationSet(set, index))
                  .filter((set) => String(set?.id || "").trim());
                setGuardrailEvaluationSets(sets);
                setGuardrailEvaluationCatalogLoadState({ status: "loaded", error: "" });
                return sets;
              } catch (error) {
                setGuardrailEvaluationCatalogLoadState({ status: "error", error: error?.message || String(error) });
                return [];
              }
            })();
            guardrailEvaluationCatalogRequestRef.current = request;
            try {
              return await request;
            } finally {
              if (guardrailEvaluationCatalogRequestRef.current === request) {
                guardrailEvaluationCatalogRequestRef.current = null;
              }
            }
          };
          const getGuardrailEvaluationDefaultAgentId = () => {
            const preferredId = String(resolvedComposerAgentId || resolvedPreferredAgentId || "").trim();
            if (preferredId && guardrailEvaluationAgentChoices.some((option) => option.value === preferredId)) return preferredId;
            return guardrailEvaluationAgentChoices[0]?.value || "";
          };
          const getGuardrailEvaluationDefaultEnvironment = () => {
            const preferredId = String(resolvedEnvironmentId || defaultShellEnvironmentId || "").trim();
            return guardrailEvaluationEnvironmentChoices.find((choice) => choice.environmentId === preferredId && !choice.disabled)
              || guardrailEvaluationEnvironmentChoices.find((choice) => !choice.disabled)
              || null;
          };
          const openGuardrailEvaluationRunModal = async (setId = "") => {
            const sets = await loadGuardrailEvaluationCatalog();
            const targetSet = sets.find((set) => set.id === String(setId || "").trim()) || sets[0] || null;
            const environment = getGuardrailEvaluationDefaultEnvironment();
            const activeVersion = getSelectedGuardrailVersion() || getSelectedGuardrailActiveVersion() || readSelectedGuardrailVersions()[0] || null;
            setGuardrailEvaluationRunForm({
              setId: targetSet?.id || "",
              agentId: getGuardrailEvaluationDefaultAgentId(),
              environmentKey: environment?.key || "",
              name: targetSet ? targetSet.name + " · " + String(activeVersion?.label || "Guardrail Run") : "",
            });
            setGuardrailEvaluationRunState({
              status: "idle",
              error: targetSet ? "" : (guardrailEvaluationCatalogLoadState.error || "No evaluations are available yet."),
            });
            setGuardrailEvaluationRunModalOpen(true);
          };
          const upsertGuardrailEvaluationRun = (run) => {
            const normalized = normalizeGuardrailEvaluationRun(run);
            const targetGuardrailSetId = String(selectedGuardrailSet?.id || "").trim();
            if (
              !normalized?.id
              || !targetGuardrailSetId
              || getGuardrailEvaluationRunTargetGuardrailId(normalized) !== targetGuardrailSetId
            ) return;
            setGuardrailEvaluationRuns((current) => [
              normalized,
              ...(Array.isArray(current) ? current : []).filter((item) => String(item?.id || "") !== String(normalized.id)),
            ]);
          };
          const pollGuardrailEvaluationRun = async (runId) => {
            let consecutiveFailures = 0;
            for (let attempt = 0; attempt < 480; attempt += 1) {
              await new Promise((resolve) => window.setTimeout(resolve, attempt === 0 ? 700 : 1200));
              try {
                const payload = await requestGuardrailEvaluationJson(
                  "/evaluations/runs/" + encodeURIComponent(runId),
                  { method: "GET" },
                  "Failed to load evaluation run."
                );
                const run = normalizeGuardrailEvaluationRun(payload?.run || payload?.data || payload);
                consecutiveFailures = 0;
                upsertGuardrailEvaluationRun(run);
                if (!isGuardrailEvaluationRunActive(run)) {
                  void loadGuardrailEvaluationData({ force: true });
                  return;
                }
              } catch {
                consecutiveFailures += 1;
                if (consecutiveFailures >= 8) return;
              }
            }
          };
          const submitGuardrailEvaluationRun = async (event) => {
            event?.preventDefault?.();
            const setId = String(guardrailEvaluationRunForm?.setId || "").trim();
            const agentId = String(guardrailEvaluationRunForm?.agentId || "").trim();
            const environment = typeof getPlaygroundEvaluationEnvironmentChoiceByKey === "function"
              ? getPlaygroundEvaluationEnvironmentChoiceByKey(guardrailEvaluationEnvironmentChoices, guardrailEvaluationRunForm?.environmentKey)
              : guardrailEvaluationEnvironmentChoices.find((choice) => choice.key === guardrailEvaluationRunForm?.environmentKey);
            if (!setId || !agentId || !environment?.environmentId) {
              setGuardrailEvaluationRunState({ status: "error", error: "Select an evaluation, agent, and environment." });
              return;
            }
            setGuardrailEvaluationRunState({ status: "running", error: "" });
            try {
              const detailPayload = await requestGuardrailEvaluationJson(
                "/evaluations/" + encodeURIComponent(setId),
                { method: "GET" },
                "Failed to load the selected evaluation."
              );
              const evaluationSet = normalizeGuardrailEvaluationSet(detailPayload?.evaluation || detailPayload?.data || detailPayload);
              const activeVersion = getSelectedGuardrailVersion() || getSelectedGuardrailActiveVersion() || readSelectedGuardrailVersions()[0] || null;
              const agent = (Array.isArray(runtimeAgents) ? runtimeAgents : []).find((item) => String(item?.id || "") === agentId) || null;
              const environmentType = environment.type === "project" ? "project" : "computer";
              const runOptions = {
                id: typeof createPlaygroundEvaluationId === "function" ? createPlaygroundEvaluationId("eval_run") : "eval_run_" + Date.now().toString(36),
                label: String(guardrailEvaluationRunForm?.name || "").trim() || evaluationSet.name + " · Guardrail Run",
                targetAgentId: agentId,
                targetAgentName: String(agent?.name || agent?.label || agentId),
                targetAgentPhotoUrl: typeof getPlaygroundEvaluationAgentPhotoUrl === "function" ? getPlaygroundEvaluationAgentPhotoUrl(agent) : "",
                targetGuardrailId: String(selectedGuardrailSet?.id || ""),
                targetGuardrailName: String(selectedGuardrailSet?.name || "Guardrail"),
                targetGuardrailVersionId: String(activeVersion?.id || ""),
                targetGuardrailVersionNumber: Math.max(0, Number(activeVersion?.version || 0) || 0),
                targetGuardrailVersionLabel: String(activeVersion?.label || ""),
                targetGuardrailSnapshot: activeVersion?.snapshot && typeof activeVersion.snapshot === "object"
                  ? activeVersion.snapshot
                  : buildPlaygroundGuardrailVersionSnapshot(selectedGuardrailSet),
                environmentType,
                environmentId: String(environment.environmentId || ""),
                environmentName: environmentType === "computer" ? String(environment.environmentName || "") : "",
                projectId: environmentType === "project" ? String(environment.projectId || "") : "",
                projectName: environmentType === "project" ? String(environment.projectName || "") : "",
                evaluator: evaluationSet.evaluator,
                passThreshold: Number(evaluationSet.passThreshold || 0.8),
              };
              const payload = await requestGuardrailEvaluationJson("/evaluations/runs", {
                method: "POST",
                body: JSON.stringify({ evaluationSet, runOptions }),
              }, "Failed to start guardrail evaluation.");
              const run = normalizeGuardrailEvaluationRun({ ...runOptions, ...(payload?.run || payload?.data || payload) });
              if (!run?.id) throw new Error("Evaluation run was created without a run id.");
              upsertGuardrailEvaluationRun(run);
              setGuardrailEvaluationRunState({ status: "idle", error: "" });
              setGuardrailEvaluationRunModalOpen(false);
              void pollGuardrailEvaluationRun(run.id);
            } catch (error) {
              setGuardrailEvaluationRunState({ status: "error", error: error?.message || String(error) });
            }
          };
          const guardrailEvaluationTargetId = String(selectedGuardrailSet?.id || "");
          const guardrailEvaluationOverlayRuns = (Array.isArray(guardrailEvaluationRuns) ? guardrailEvaluationRuns : [])
            .filter((run) => getGuardrailEvaluationRunTargetGuardrailId(run) === guardrailEvaluationTargetId);
          const guardrailEvaluationRowsBySetId = new Map();
          (Array.isArray(guardrailEvaluationOverviewRows) ? guardrailEvaluationOverviewRows : []).forEach((row) => {
            const setId = String(row?.set?.id || "");
            if (!setId) return;
            const overlayRuns = guardrailEvaluationOverlayRuns
              .filter((run) => String(run?.evaluationSetId || run?.evaluationId || "") === setId);
            const latestRun = [row.latestRun, ...overlayRuns]
              .filter(Boolean)
              .sort((left, right) => getGuardrailEvaluationRunTimestamp(right) - getGuardrailEvaluationRunTimestamp(left))[0] || null;
            const addedRunIds = new Set(
              overlayRuns
                .map((run) => String(run?.id || ""))
                .filter((id) => id && id !== String(row?.latestRun?.id || ""))
            );
            guardrailEvaluationRowsBySetId.set(setId, {
              set: row.set,
              runs: [row.latestRun, ...overlayRuns].filter(Boolean),
              latestRun,
              runCount: Math.max(0, Number(row.runCount || 0)) + addedRunIds.size,
            });
          });
          guardrailEvaluationOverlayRuns.forEach((run) => {
            const setId = String(run?.evaluationSetId || run?.evaluationId || "");
            if (!setId || guardrailEvaluationRowsBySetId.has(setId)) return;
            const set = (Array.isArray(guardrailEvaluationSets) ? guardrailEvaluationSets : [])
              .find((candidate) => String(candidate?.id || "") === setId);
            if (!set) return;
            const runs = guardrailEvaluationOverlayRuns
              .filter((candidate) => String(candidate?.evaluationSetId || candidate?.evaluationId || "") === setId)
              .sort((left, right) => getGuardrailEvaluationRunTimestamp(right) - getGuardrailEvaluationRunTimestamp(left));
            guardrailEvaluationRowsBySetId.set(setId, {
              set,
              runs,
              latestRun: runs[0] || null,
              runCount: new Set(runs.map((candidate) => String(candidate?.id || "")).filter(Boolean)).size,
            });
          });
          const guardrailEvaluationRows = Array.from(guardrailEvaluationRowsBySetId.values())
            .filter((row) => row.runCount > 0)
            .sort((left, right) => getGuardrailEvaluationRunTimestamp(right.latestRun) - getGuardrailEvaluationRunTimestamp(left.latestRun));
          const guardrailEvaluationFilteredRows = guardrailEvaluationRows.filter((row) => {
            const query = String(guardrailEvaluationSearchQuery || "").trim().toLowerCase();
            return !query || [row.set?.name, row.set?.description, row.latestRun?.label].join(" ").toLowerCase().includes(query);
          });
          const renderGuardrailEvaluationModal = () => React.createElement(PlatformModal, {
              open: guardrailEvaluationRunModalOpen,
              title: "Run Guardrail Evaluation",
              description: "Run an evaluation set against the selected guardrail version.",
              size: "medium",
              portal: true,
              onClose: () => guardrailEvaluationRunState.status !== "running" && setGuardrailEvaluationRunModalOpen(false),
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  onClick: () => setGuardrailEvaluationRunModalOpen(false),
                  disabled: guardrailEvaluationRunState.status === "running",
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  type: "submit",
                  form: "guardrail-evaluation-run-form",
                  disabled: guardrailEvaluationRunState.status === "running",
                },
                  React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, guardrailEvaluationRunState.status === "running" ? "Starting..." : "Run Evaluation")
                )
              ),
            },
            React.createElement("form", {
                id: "guardrail-evaluation-run-form",
                className: "playground-guardrails-evaluation-run-form",
                onSubmit: submitGuardrailEvaluationRun,
              },
              React.createElement("label", { className: "playground-guardrails-evaluation-field" },
                React.createElement("span", null, "Run name"),
                React.createElement("input", {
                  type: "text",
                  value: guardrailEvaluationRunForm.name,
                  onChange: (event) => setGuardrailEvaluationRunForm((current) => ({ ...current, name: event.target.value })),
                })
              ),
              React.createElement("label", { className: "playground-guardrails-evaluation-field" },
                React.createElement("span", null, "Evaluation"),
                React.createElement(PlatformSelector, {
                  value: guardrailEvaluationRunForm.setId,
                  options: guardrailEvaluationSets.map((set) => ({ value: set.id, label: set.name || "Untitled Evaluation" })),
                  onValueChange: (setId) => setGuardrailEvaluationRunForm((current) => ({ ...current, setId })),
                  ariaLabel: "Evaluation set",
                  fullWidth: true,
                })
              ),
              React.createElement("label", { className: "playground-guardrails-evaluation-field" },
                React.createElement("span", null, "Agent"),
                React.createElement(PlatformSelector, {
                  value: guardrailEvaluationRunForm.agentId,
                  options: guardrailEvaluationAgentChoices,
                  onValueChange: (agentId) => setGuardrailEvaluationRunForm((current) => ({ ...current, agentId })),
                  ariaLabel: "Evaluation agent",
                  fullWidth: true,
                })
              ),
              React.createElement("label", { className: "playground-guardrails-evaluation-field" },
                React.createElement("span", null, "Environment"),
                React.createElement(PlatformSelector, {
                  value: guardrailEvaluationRunForm.environmentKey,
                  options: guardrailEvaluationEnvironmentChoices.map((choice) => ({
                    value: choice.key,
                    label: choice.type === "project" ? choice.projectName : choice.environmentName,
                    disabled: choice.disabled,
                  })),
                  onValueChange: (environmentKey) => setGuardrailEvaluationRunForm((current) => ({ ...current, environmentKey })),
                  ariaLabel: "Evaluation environment",
                  fullWidth: true,
                })
              ),
              guardrailEvaluationRunState.error
                ? React.createElement("div", { className: "playground-guardrails-evaluation-error", role: "alert" }, guardrailEvaluationRunState.error)
                : null
            )
          );
          const renderGuardrailEvaluationSection = () => {
            const selectedGuardrailEvaluationSetId = String(selectedGuardrailSet?.id || "").trim();
            const loadStateMatchesTarget = String(guardrailEvaluationLoadState.guardrailSetId || "") === selectedGuardrailEvaluationSetId;
            const isLoading = !loadStateMatchesTarget || guardrailEvaluationLoadState.status === "loading";
            const emptyState = loadStateMatchesTarget && guardrailEvaluationLoadState.status === "error"
              ? React.createElement(PlatformEmptyState, {
                  icon: AlertCircle,
                  title: "Evaluations could not be loaded",
                  description: guardrailEvaluationLoadState.error || "Try again in a moment.",
                })
              : React.createElement(PlatformEmptyState, {
                  icon: ChartColumnIncreasing,
                  title: "No evaluation runs yet",
                  description: "Run an evaluation against this guardrail to see its results here.",
                });
            return React.createElement("section", { className: "playground-guardrails-evaluation-section" },
              React.createElement(PlatformDataTable, {
                rows: guardrailEvaluationFilteredRows,
                columns: [
                  {
                    id: "evaluation",
                    header: "Evaluation",
                    accessor: (row) => row.set?.name || "Untitled Evaluation",
                    sortable: true,
                    width: "minmax(220px, 1.5fr)",
                  },
                  {
                    id: "score",
                    header: "Latest Score",
                    accessor: (row) => Number(row.latestRun?.averageScore || 0),
                    sortable: true,
                    width: "minmax(110px, 0.7fr)",
                    cell: ({ row }) => formatGuardrailEvaluationScore(row.latestRun),
                  },
                  {
                    id: "runs",
                    header: "Runs",
                    accessor: (row) => row.runCount,
                    sortable: true,
                    width: "minmax(80px, 0.5fr)",
                  },
                  {
                    id: "updated",
                    header: "Updated",
                    accessor: (row) => row.latestRun?.completedAt || row.latestRun?.createdAt || row.set?.updatedAt || "",
                    sortable: true,
                    width: "minmax(120px, 0.75fr)",
                    align: "end",
                    cell: ({ row }) => formatGuardrailDate(row.latestRun?.completedAt || row.latestRun?.createdAt || row.set?.updatedAt),
                  },
                ],
                getRowId: (row) => row.set.id,
                ariaLabel: "Guardrail evaluations",
                variant: "minimalistic-ui",
                toolbar: {
                  title: "Evaluations",
                  search: {
                    value: guardrailEvaluationSearchQuery,
                    onChange: setGuardrailEvaluationSearchQuery,
                    placeholder: "Search evaluations",
                    ariaLabel: "Search guardrail evaluations",
                  },
                  controlsLeading: React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    size: "small",
                    onClick: () => openGuardrailEvaluationRunModal(guardrailEvaluationFilteredRows[0]?.set?.id || guardrailEvaluationSets[0]?.id || ""),
                    disabled: isLoading,
                  },
                    React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Run Evaluation")
                  ),
                },
                onRowActivate: (row) => openGuardrailEvaluationRunModal(row.set.id),
                emptyState: isLoading ? "Loading evaluations..." : emptyState,
                noResultsState: "No matching evaluations.",
              }),
              renderGuardrailEvaluationModal()
            );
          };
`;

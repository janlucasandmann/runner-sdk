export const FINE_TUNING_PAGE_CONTROLLER_ACTIONS_SCRIPT = String.raw`        async function handleCreateFineTuningJob(event) {
          event?.preventDefault?.();
          if (createBusy) return;
          const form = fineTuningCreateForm && typeof fineTuningCreateForm === "object" ? fineTuningCreateForm : {};
          const selectedSetIds = Array.isArray(form.evaluationSetIds) ? form.evaluationSetIds.map(String) : [];
          const selectedRunIds = form.evaluationRunIds && typeof form.evaluationRunIds === "object" && !Array.isArray(form.evaluationRunIds)
            ? form.evaluationRunIds
            : {};
          const selectedBaselineModes = form.evaluationBaselineModes && typeof form.evaluationBaselineModes === "object" && !Array.isArray(form.evaluationBaselineModes)
            ? form.evaluationBaselineModes
            : {};
          const selectedSets = normalizedEvaluationSets
            .filter((set) => selectedSetIds.includes(set.id))
            .map((set) => {
              const selectedRunId = normalizePlaygroundFineTuningString(selectedRunIds[set.id]);
              const selectedRun = getPlaygroundFineTuningRunById(set, selectedRunId) || null;
              return {
                ...set,
                fineTuningRunId: selectedRunId,
                fine_tuning_run_id: selectedRunId,
                selectedRun,
                selected_run: selectedRun,
              };
            });
          const targetAgent = normalizedAgents.find((agent) => (
            normalizePlaygroundFineTuningString(agent?.id) === normalizePlaygroundFineTuningString(form.targetAgentId)
          )) || null;
          const fineTunerAgent = normalizedAgents.find((agent) => (
            normalizePlaygroundFineTuningString(agent?.id) === normalizePlaygroundFineTuningString(form.fineTunerAgentId || form.agentId)
          )) || null;
          const selectedEnvironment = normalizedEnvironments.find((environment) => environment.id === form.environmentId) || normalizedEnvironments[0] || null;
          if (!targetAgent?.id) {
            setCreateError("Select the agent to optimize.");
            return;
          }
          if (isDefaultFineTuningTargetAgent(targetAgent)) {
            setCreateError("Default agents cannot be optimized. Select a custom agent.");
            return;
          }
          if (!fineTunerAgent?.id) {
            setCreateError("Select an optimizer agent.");
            return;
          }
          if (!selectedEnvironment?.id) {
            setCreateError("Select a computer.");
            return;
          }
          if (!selectedSets.length) {
            setCreateError("Select at least one evaluation set.");
            return;
          }
          const emptySet = selectedSets.find((set) => !Array.isArray(set?.dataRows) || set.dataRows.length === 0);
          if (emptySet) {
            setCreateError("Evaluation set \"" + (emptySet.name || "Untitled Evaluation") + "\" has no cases.");
            return;
          }
          const missingExistingBaseline = selectedSets.find((set) => (
            selectedBaselineModes[set.id] === "existing"
            && !normalizePlaygroundFineTuningString(selectedRunIds[set.id])
          ));
          if (missingExistingBaseline) {
            setCreateError("Choose an existing baseline run for " + (missingExistingBaseline.name || "the evaluation") + ".");
            return;
          }
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl) {
            setCreateError("Fine-tuning backend is unavailable.");
            return;
          }
          const jobId = createPlaygroundFineTuningId();
          const jobName = normalizePlaygroundFineTuningString(form.name || formatPlaygroundFineTuningDefaultJobName());
          const maximumCostIncreaseRatio = String(form.maximumCostIncreasePercent ?? "").trim()
            ? Math.max(0, Math.min(1000, Number(form.maximumCostIncreasePercent) || 0)) / 100
            : null;
          const maximumLatencyIncreaseRatio = String(form.maximumLatencyIncreasePercent ?? "").trim()
            ? Math.max(0, Math.min(1000, Number(form.maximumLatencyIncreasePercent) || 0)) / 100
            : null;
          setCreateBusy(true);
          setCreateError("");
          try {
            const response = await fetch(normalizedBackendUrl + "/fine-tuning/jobs", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...(requestHeaders || {}),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: jobId,
                name: jobName,
                targetAgent,
                fineTunerAgent,
                environment: selectedEnvironment,
                evaluationSets: selectedSets,
                evaluationRunIds: selectedRunIds,
                evaluationBaselineModes: selectedBaselineModes,
                objective: {
                  mode: form.objectiveMode === "custom" ? "custom" : "evaluation_targets",
                  successPolicy: {
                    minimumAverageScore: Math.max(0, Math.min(100, Number(form.targetScorePercent ?? 80))) / 100,
                    requiredPassRate: Math.max(0, Math.min(100, Number(form.targetPassRatePercent ?? 80))) / 100,
                    maximumCostIncreaseRatio,
                    maximumLatencyIncreaseRatio,
                  },
                  requireAllEvaluationTargets: true,
                },
                limits: {
                  maxIterations: Math.max(1, Math.min(20, Number(form.maxIterations ?? 3) || 3)),
                  budgetUsd: Math.max(0.01, Number(form.budgetUsd ?? 10) || 10),
                  maxDurationMinutes: Math.max(5, Math.min(1440, Number(form.maxDurationMinutes ?? 120) || 120)),
                  maxTransientRetries: Math.max(0, Math.min(5, Number(form.maxTransientRetries ?? 2) || 0)),
                  plateauIterations: Math.max(1, Math.min(5, Number(form.plateauIterations ?? 2) || 2)),
                  minimumIterationImprovement: Math.max(0, Math.min(100, Number(form.minimumIterationImprovementPercent ?? 1))) / 100,
                },
                publicationPolicy: {
                  mode: form.publicationMode === "auto_on_target" ? "auto_on_target" : "manual",
                  publishBestOnLimit: form.publishBestOnLimit === true,
                },
                instructions: String(form.instructions || ""),
                conductedBy: currentFineTuningUser,
                createdBy: currentFineTuningUser,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to start optimization job.");
            }
            const runtimeJob = normalizePlaygroundFineTuningJob(data?.job || data?.data || data);
            upsertFineTuningJob(runtimeJob);
            closeCreateModal({ animate: true, force: true });
            notifyFineTuningThreadStarted(runtimeJob);
            void waitForFineTuningRuntimeJob(jobId, runtimeJob)
              .then((completedJob) => {
                patchFineTuningJob(jobId, () => completedJob);
                notifyFineTuningThreadStarted(completedJob);
                if (isFineTuningRuntimeJobComplete(completedJob) && typeof onAgentsRefresh === "function") {
                  void onAgentsRefresh();
                }
              })
              .catch(() => {});
          } catch (error) {
            setCreateError(error?.message || String(error));
          } finally {
            setCreateBusy(false);
          }
        }

        function openJob(jobId) {
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          setFineTuningApprovalError("");
          const recoveredJob = scoredJobs.find((job) => job.id === normalizedJobId) || displaySourceJobs.find((job) => job.id === normalizedJobId) || null;
          if (recoveredJob && !(Array.isArray(fineTuningJobs) ? fineTuningJobs : []).some((job) => normalizePlaygroundFineTuningJob(job).id === normalizedJobId)) {
            upsertFineTuningJob(recoveredJob);
            return;
          }
          if (typeof setSelectedFineTuningJobId === "function") setSelectedFineTuningJobId(normalizedJobId);
          if (typeof setFineTuningPageMode === "function") setFineTuningPageMode("detail");
        }

        function deleteJob(jobId) {
          if (typeof setFineTuningJobs !== "function") return;
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          setFineTuningJobs((current) => (Array.isArray(current) ? current : []).filter((job) => normalizePlaygroundFineTuningJob(job).id !== normalizedJobId));
          if (selectedFineTuningJobId === normalizedJobId) {
            if (typeof setSelectedFineTuningJobId === "function") setSelectedFineTuningJobId("");
            if (typeof setFineTuningPageMode === "function") setFineTuningPageMode("overview");
          }
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (normalizedBackendUrl && normalizedJobId) {
            void fetch(normalizedBackendUrl + "/fine-tuning/jobs/" + encodeURIComponent(normalizedJobId), {
              method: "DELETE",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders || {},
            }).catch(() => {});
          }
        }

`;

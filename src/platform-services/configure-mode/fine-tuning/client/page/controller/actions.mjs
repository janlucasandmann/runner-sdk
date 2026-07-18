export const FINE_TUNING_PAGE_CONTROLLER_ACTIONS_SCRIPT = String.raw`        async function handleCreateFineTuningJob(event) {
          event?.preventDefault?.();
          if (createBusy) return;
          const form = fineTuningCreateForm && typeof fineTuningCreateForm === "object" ? fineTuningCreateForm : {};
          const selectedSetIds = Array.isArray(form.evaluationSetIds) ? form.evaluationSetIds.map(String) : [];
          const selectedRunIds = form.evaluationRunIds && typeof form.evaluationRunIds === "object" && !Array.isArray(form.evaluationRunIds)
            ? form.evaluationRunIds
            : {};
          const selectedSets = normalizedEvaluationSets
            .filter((set) => selectedSetIds.includes(set.id))
            .map((set) => {
              const latestRun = getPlaygroundFineTuningLatestRun(set);
              const selectedRunId = normalizePlaygroundFineTuningString(selectedRunIds[set.id] || latestRun?.id || latestRun?.runId || latestRun?.run_id || "");
              const selectedRun = getPlaygroundFineTuningRunById(set, selectedRunId) || latestRun || null;
              return {
                ...set,
                fineTuningRunId: normalizePlaygroundFineTuningString(selectedRun?.id || selectedRunId),
                fine_tuning_run_id: normalizePlaygroundFineTuningString(selectedRun?.id || selectedRunId),
                selectedRun,
                selected_run: selectedRun,
              };
            });
          const fineTunerAgent = normalizedAgents.find((agent) => agent.id === form.agentId) || normalizedAgents[0] || null;
          const selectedEnvironment = normalizedEnvironments.find((environment) => environment.id === form.environmentId) || normalizedEnvironments[0] || null;
          const targetResolution = resolveFineTuningTargetAgentForSelectedSets(selectedSets);
          const targetAgent = targetResolution.targetAgent;
          if (!fineTunerAgent?.id) {
            setCreateError("Select a fine-tuner agent.");
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
          if (targetResolution.error || !targetAgent?.id) {
            setCreateError(targetResolution.error || "Run an evaluation first so fine-tuning can identify the target agent.");
            return;
          }
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl) {
            setCreateError("Fine-tuning backend is unavailable.");
            return;
          }
          const jobId = createPlaygroundFineTuningId();
          const jobName = normalizePlaygroundFineTuningString(form.name || formatPlaygroundFineTuningDefaultJobName());
          const optimisticJob = buildOptimisticFineTuningJob({
            jobId,
            name: jobName,
            selectedSets,
            targetAgent,
            fineTunerAgent,
            selectedEnvironment,
            instructions: String(form.instructions || ""),
            conductedBy: currentFineTuningUser,
          });
          setCreateBusy(true);
          setCreateError("");
          upsertFineTuningJob(optimisticJob);
          closeCreateModal({ animate: true, force: true });
          setCreateBusy(false);
          void (async () => {
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
                agent: targetAgent,
                targetAgent,
                fineTunerAgent,
                environment: selectedEnvironment,
                evaluationSets: selectedSets,
                instructions: String(form.instructions || ""),
                verifyAfter: true,
                nextAgentVersionNumber: getFineTuningNextAgentVersionNumber(targetAgent),
                conductedBy: currentFineTuningUser,
                createdBy: currentFineTuningUser,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to start fine-tuning job.");
            }
            const runtimeJob = normalizePlaygroundFineTuningJob(data?.job || data?.data || data);
            patchFineTuningJob(jobId, () => runtimeJob);
            notifyFineTuningThreadStarted(runtimeJob);
            const completedRuntimeJob = isFineTuningRuntimeJobComplete(runtimeJob)
              ? runtimeJob
              : await waitForFineTuningRuntimeJob(jobId, runtimeJob);
            if (!isFineTuningRuntimeJobComplete(completedRuntimeJob)) {
              patchFineTuningJob(jobId, () => completedRuntimeJob);
              return;
            }
            const completedRuntimeStatus = normalizePlaygroundFineTuningString(completedRuntimeJob.status).toLowerCase();
            if (new Set(["cancelled", "canceled"]).has(completedRuntimeStatus)) {
              patchFineTuningJob(jobId, () => buildStoppedFineTuningJob(completedRuntimeJob), { persist: true });
              return;
            }
            if (new Set(["error", "failed"]).has(completedRuntimeStatus)) {
              throw new Error(completedRuntimeJob.error || completedRuntimeJob.agentVersionError || completedRuntimeJob.createdAgentVersion?.error || "Fine-tuning job failed.");
            }
            if (typeof onAgentsRefresh === "function") {
              await onAgentsRefresh();
            }
            const runtimeVerificationAlreadyHandled = completedRuntimeJob.evaluationRuns.some((reference) => {
              const status = normalizePlaygroundFineTuningString(reference?.status).toLowerCase();
              return Boolean(reference?.afterRunId || reference?.after_run_id)
                || (status && status !== "pending" && status !== "not_run");
            });
            if (runtimeVerificationAlreadyHandled) {
              upsertFineTuningJob(completedRuntimeJob, { persist: true });
              notifyFineTuningThreadStarted(completedRuntimeJob);
              return;
            }
            const persistedJob = await tryPersistFineTunedAgentVersion(completedRuntimeJob);
            patchFineTuningJob(jobId, () => persistedJob, { persist: true });
            const verifiedJob = isPlaygroundFineTuningAgentVersionReady(persistedJob.agentVersionCreationStatus)
              ? await startFineTuningVerificationRuns(persistedJob, selectedSets, targetAgent, selectedEnvironment)
              : normalizePlaygroundFineTuningJob({
                  ...persistedJob,
                  status: "error",
                  error: persistedJob.agentVersionError || persistedJob.createdAgentVersion?.error || "Fine-tuning finished, but no agent version was created.",
                });
            upsertFineTuningJob(verifiedJob, { persist: true });
            notifyFineTuningThreadStarted(verifiedJob);
          } catch (error) {
            const message = error?.message || String(error);
            patchFineTuningJob(jobId, (currentJob) => normalizePlaygroundFineTuningJob({
              ...currentJob,
              status: "error",
              error: message,
              analysisSummary: currentJob.analysisSummary || message,
              agentVersionCreationStatus: isPlaygroundFineTuningAgentVersionReady(currentJob.agentVersionCreationStatus) ? currentJob.agentVersionCreationStatus : "error",
              agentVersionError: isPlaygroundFineTuningAgentVersionReady(currentJob.agentVersionCreationStatus) ? currentJob.agentVersionError : message,
              createdAgentVersion: isPlaygroundFineTuningAgentVersionReady(currentJob.agentVersionCreationStatus)
                ? currentJob.createdAgentVersion
                : {
                    ...(currentJob.createdAgentVersion || {}),
                    status: "error",
                    error: message,
                },
              updatedAt: new Date().toISOString(),
            }), { persist: true });
          }
          })();
        }

        function openJob(jobId) {
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
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

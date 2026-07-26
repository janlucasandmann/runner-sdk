export const FINE_TUNING_PAGE_CONTROLLER_EDITOR_SCRIPT = String.raw`        function updateCreateForm(patch) {
          if (typeof setFineTuningCreateForm === "function") {
            setFineTuningCreateForm((current) => ({ ...(current || {}), ...(patch || {}) }));
          }
        }

        function closeCreateModal(options = {}) {
          if (createBusy && !options.force) return;
          setEvaluationSetPickerOpen(false);
          if (options.animate === false || typeof window === "undefined") {
            setModalVisible(false);
            setModalClosing(false);
            if (typeof setFineTuningCreateModalOpen === "function") setFineTuningCreateModalOpen(false);
            return;
          }
          setModalVisible(false);
          setModalClosing(true);
          if (modalCloseTimerRef.current) window.clearTimeout(modalCloseTimerRef.current);
          modalCloseTimerRef.current = window.setTimeout(() => {
            modalCloseTimerRef.current = null;
            setModalClosing(false);
            if (typeof setFineTuningCreateModalOpen === "function") setFineTuningCreateModalOpen(false);
          }, 75);
        }

        function openCreateModal() {
          const currentForm = fineTuningCreateForm && typeof fineTuningCreateForm === "object" ? fineTuningCreateForm : {};
          const availableSetIds = new Set(normalizedEvaluationSets.map((set) => normalizePlaygroundFineTuningString(set.id)));
          const currentSetIds = (Array.isArray(currentForm.evaluationSetIds) ? currentForm.evaluationSetIds : [])
            .map((setId) => normalizePlaygroundFineTuningString(setId))
            .filter((setId) => availableSetIds.has(setId));
          const defaultSetIds = currentSetIds.length
            ? currentSetIds
            : normalizedEvaluationSets[0]?.id ? [normalizedEvaluationSets[0].id] : [];
          const currentRunIds = currentForm.evaluationRunIds && typeof currentForm.evaluationRunIds === "object" && !Array.isArray(currentForm.evaluationRunIds)
            ? currentForm.evaluationRunIds
            : {};
          const currentBaselineModes = currentForm.evaluationBaselineModes && typeof currentForm.evaluationBaselineModes === "object" && !Array.isArray(currentForm.evaluationBaselineModes)
            ? currentForm.evaluationBaselineModes
            : {};
          const defaultRunIds = {};
          const defaultBaselineModes = {};
          defaultSetIds.forEach((setId) => {
            const set = normalizedEvaluationSets.find((item) => item.id === String(setId || "").trim()) || null;
            const latestRun = getPlaygroundFineTuningLatestRun(set);
            defaultRunIds[setId] = normalizePlaygroundFineTuningString(currentRunIds[setId] || latestRun?.id || latestRun?.runId || latestRun?.run_id || "");
            defaultBaselineModes[setId] = currentBaselineModes[setId] === "existing" && defaultRunIds[setId]
              ? "existing"
              : "fresh";
          });
          const customAgents = normalizedAgents.filter((agent) => !isDefaultFineTuningTargetAgent(agent));
          updateCreateForm({
            name: formatPlaygroundFineTuningDefaultJobName(),
            targetAgentId: currentForm.targetAgentId || customAgents[0]?.id || "",
            fineTunerAgentId: currentForm.fineTunerAgentId || currentForm.agentId || defaultAgentId || normalizedAgents[0]?.id || "",
            environmentId: currentForm.environmentId || defaultEnvironmentId || normalizedEnvironments[0]?.id || "",
            evaluationSetIds: defaultSetIds,
            evaluationRunIds: defaultRunIds,
            evaluationBaselineModes: defaultBaselineModes,
            objectiveMode: currentForm.objectiveMode || "evaluation_targets",
            targetScorePercent: Number(currentForm.targetScorePercent ?? 80),
            targetPassRatePercent: Number(currentForm.targetPassRatePercent ?? 80),
            maximumCostIncreasePercent: currentForm.maximumCostIncreasePercent ?? "",
            maximumLatencyIncreasePercent: currentForm.maximumLatencyIncreasePercent ?? "",
            maxIterations: Number(currentForm.maxIterations ?? 3),
            budgetUsd: Number(currentForm.budgetUsd ?? 10),
            maxDurationMinutes: Number(currentForm.maxDurationMinutes ?? 120),
            maxTransientRetries: Number(currentForm.maxTransientRetries ?? 2),
            plateauIterations: Number(currentForm.plateauIterations ?? 2),
            minimumIterationImprovementPercent: Number(currentForm.minimumIterationImprovementPercent ?? 1),
            publicationMode: currentForm.publicationMode || "manual",
            publishBestOnLimit: currentForm.publishBestOnLimit === true,
            instructions: currentForm.instructions || "",
            verifyAfter: true,
          });
          fineTuningCreateDefaultEvaluationAppliedRef.current = defaultSetIds.length > 0;
          if (typeof setFineTuningCreateModalOpen === "function") setFineTuningCreateModalOpen(true);
        }

        function upsertFineTuningJob(job, options = {}) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.id || typeof setFineTuningJobs !== "function") return normalizedJob;
          setFineTuningJobs((current) => {
            const jobs = Array.isArray(current) ? current.map((item, index) => normalizePlaygroundFineTuningJob(item, index)) : [];
            const existingJob = jobs.find((item) => item.id === normalizedJob.id) || null;
            const mergedJob = existingJob ? mergePlaygroundFineTuningJobRecords(existingJob, normalizedJob) : normalizedJob;
            if (options.persist) {
              void persistFineTuningRuntimeJob(mergedJob).catch(() => {});
            }
            return [mergedJob, ...jobs.filter((item) => item.id !== normalizedJob.id)];
          });
          if (typeof setSelectedFineTuningJobId === "function") setSelectedFineTuningJobId(normalizedJob.id);
          if (typeof setFineTuningPageMode === "function") setFineTuningPageMode("detail");
          return normalizedJob;
        }

        function patchFineTuningJob(jobId, updater, options = {}) {
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          if (!normalizedJobId || typeof setFineTuningJobs !== "function" || typeof updater !== "function") return;
          setFineTuningJobs((current) => (Array.isArray(current) ? current : []).map((item, index) => {
            const normalizedItem = normalizePlaygroundFineTuningJob(item, index);
            if (normalizedItem.id !== normalizedJobId) return item;
            const nextJob = mergePlaygroundFineTuningJobRecords(normalizedItem, updater(normalizedItem));
            if (options.persist) {
              const delayMs = Math.max(0, Number(options.delayMs || 0) || 0);
              const existingTimer = fineTuningPersistTimersRef.current.get(normalizedJobId);
              if (existingTimer && typeof window !== "undefined") window.clearTimeout(existingTimer);
              if (delayMs > 0 && typeof window !== "undefined") {
                const timerId = window.setTimeout(() => {
                  fineTuningPersistTimersRef.current.delete(normalizedJobId);
                  void persistFineTuningRuntimeJob(nextJob).catch(() => {});
                }, delayMs);
                fineTuningPersistTimersRef.current.set(normalizedJobId, timerId);
              } else {
                fineTuningPersistTimersRef.current.delete(normalizedJobId);
                void persistFineTuningRuntimeJob(nextJob).catch(() => {});
              }
            }
            return nextJob;
          }));
        }

        function buildStoppedFineTuningJob(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const cancellationReferences = normalizedJob.evaluationRuns.map((reference) => ({
            ...reference,
            status: isFineTuningEvaluationRunActive(reference.status) || reference.status === "pending"
              ? "cancelled"
              : reference.status,
          }));
          return normalizePlaygroundFineTuningJob({
            ...mergeFineTuningVerificationReferences(normalizedJob, cancellationReferences, "cancelled"),
            status: "cancelled",
            error: "",
            updatedAt: new Date().toISOString(),
          });
        }

        async function stopFineTuningJob(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedJobId = normalizePlaygroundFineTuningString(normalizedJob.id);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedJobId || !normalizedBackendUrl || fineTuningStopJobId === normalizedJobId) return;
          const stoppedJob = buildStoppedFineTuningJob(normalizedJob);
          setFineTuningStopJobId(normalizedJobId);
          patchFineTuningJob(normalizedJobId, () => stoppedJob);
          try {
            const headers = {
              ...(requestHeaders || {}),
              "Content-Type": "application/json",
            };
            const threadId = normalizePlaygroundFineTuningString(normalizedJob.threadId);
            const stopRequests = [
              fetch(normalizedBackendUrl + "/fine-tuning/jobs/" + encodeURIComponent(normalizedJobId) + "/cancel", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers,
                body: JSON.stringify({}),
              }),
            ];
            if (threadId) {
              stopRequests.push(fetch(normalizedBackendUrl + "/threads/" + encodeURIComponent(threadId) + "/cancel", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers,
                body: JSON.stringify({}),
              }));
            }
            const [jobResult] = await Promise.allSettled(stopRequests);
            let backendJob = null;
            if (jobResult.status === "fulfilled") {
              const data = await jobResult.value.json().catch(() => ({}));
              if (jobResult.value.ok) {
                backendJob = normalizePlaygroundFineTuningJob(data?.job || data?.data || data);
              }
            }
            const nextJob = backendJob?.id
              ? mergePlaygroundFineTuningJobRecords(stoppedJob, {
                  ...backendJob,
                  status: "cancelled",
                  evaluationRuns: stoppedJob.evaluationRuns,
                })
              : stoppedJob;
            patchFineTuningJob(normalizedJobId, () => nextJob, { persist: true });
          } finally {
            setFineTuningStopJobId("");
          }
        }

        async function approveFineTuningPublication(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedJobId = normalizePlaygroundFineTuningString(normalizedJob.id);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          const publicationDecision = readPlaygroundFineTuningPlainObject(
            normalizedJob.publicationDecision
          );
          const evidenceFingerprint = normalizePlaygroundFineTuningString(
            publicationDecision.evidenceFingerprint
              || publicationDecision.evidence_fingerprint
          );
          if (
            !normalizedJobId
            || !normalizedBackendUrl
            || !evidenceFingerprint
            || fineTuningApproveJobId === normalizedJobId
          ) return;
          setFineTuningApproveJobId(normalizedJobId);
          setFineTuningApprovalError("");
          try {
            const response = await fetch(
              normalizedBackendUrl
                + "/fine-tuning/jobs/"
                + encodeURIComponent(normalizedJobId)
                + "/publication-approval",
              {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...(requestHeaders || {}),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ evidenceFingerprint }),
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(
                data?.message
                  || data?.error
                  || "Failed to approve the optimized agent version."
              );
            }
            const nextJob = normalizePlaygroundFineTuningJob(
              data?.job || data?.data || data
            );
            if (!nextJob.id) {
              throw new Error("Publication approval returned no optimization job.");
            }
            upsertFineTuningJob(nextJob);
            if (
              normalizePlaygroundFineTuningString(
                nextJob.agentVersionCreationStatus
                  || nextJob.createdAgentVersion?.status
              ).toLowerCase() === "published"
            ) {
              notifyFineTunedAgentVersionCreated(nextJob, nextJob.createdAgentVersion);
              if (typeof onAgentsRefresh === "function") await onAgentsRefresh();
            } else {
              void waitForFineTuningRuntimeJob(normalizedJobId, nextJob)
                .then((completedJob) => {
                  upsertFineTuningJob(completedJob);
                  if (
                    normalizePlaygroundFineTuningString(
                      completedJob.agentVersionCreationStatus
                        || completedJob.createdAgentVersion?.status
                    ).toLowerCase() === "published"
                    && typeof onAgentsRefresh === "function"
                  ) {
                    void onAgentsRefresh();
                  }
                })
                .catch(() => {});
            }
          } catch (error) {
            setFineTuningApprovalError(error?.message || String(error));
          } finally {
            setFineTuningApproveJobId("");
          }
        }

`;

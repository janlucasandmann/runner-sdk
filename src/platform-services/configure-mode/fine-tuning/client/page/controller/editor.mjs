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
          const defaultRunIds = {};
          defaultSetIds.forEach((setId) => {
            const set = normalizedEvaluationSets.find((item) => item.id === String(setId || "").trim()) || null;
            const latestRun = getPlaygroundFineTuningLatestRun(set);
            defaultRunIds[setId] = normalizePlaygroundFineTuningString(currentRunIds[setId] || latestRun?.id || latestRun?.runId || latestRun?.run_id || "");
          });
          updateCreateForm({
            name: formatPlaygroundFineTuningDefaultJobName(),
            agentId: currentForm.agentId || defaultAgentId || normalizedAgents[0]?.id || "",
            environmentId: currentForm.environmentId || defaultEnvironmentId || normalizedEnvironments[0]?.id || "",
            evaluationSetIds: defaultSetIds,
            evaluationRunIds: defaultRunIds,
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

`;

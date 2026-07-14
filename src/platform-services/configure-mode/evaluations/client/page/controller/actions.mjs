export const EVALUATIONS_PAGE_CONTROLLER_ACTIONS_SCRIPT = String.raw`        function openSetDetail(setId) {
          const normalizedId = String(setId || "").trim();
          if (!normalizedId) return;
          setSelectedEvaluationSetId(normalizedId);
          setSelectedEvaluationRunId("");
          if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
          setEvaluationDetailTab("general");
          setEvaluationsPageMode("detail");
        }

        function openRunDetail(setId, runId) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedSetId || !normalizedRunId) return;
          setSelectedEvaluationSetId(normalizedSetId);
          setSelectedEvaluationRunId(normalizedRunId);
          if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
          setEvaluationsPageMode("run");
        }

        function openCaseDetail(setId, runId, caseId) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          const normalizedCaseId = String(caseId || "").trim();
          if (!normalizedSetId || !normalizedRunId || !normalizedCaseId) return;
          setSelectedEvaluationSetId(normalizedSetId);
          setSelectedEvaluationRunId(normalizedRunId);
          if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId(normalizedCaseId);
          setEvaluationsPageMode("case");
        }

        function buildEvaluationCreateFormDefaults() {
          return {
            name: "",
            targetAgentId: "",
            environmentId: "",
            passThreshold: "80",
            evaluatorType: "agent",
            evaluatorAgentId: getPlaygroundEvaluationDefaultId(agentOptions, defaultAgentId) || String(agentOptions[0]?.id || "").trim(),
            evaluatorCode: "",
          };
        }

        function openEvaluationCreateModal() {
          setEvaluationSetRowMenuId("");
          setEvaluationSetsToolbarPopover("");
          if (typeof setEvaluationCreateForm === "function") {
            setEvaluationCreateForm(buildEvaluationCreateFormDefaults());
          }
          if (typeof setEvaluationCreateModalOpen === "function") {
            setEvaluationCreateModalOpen(true);
          }
        }

        function finishCloseEvaluationCreateModal(options = {}) {
          if (typeof window !== "undefined") {
            if (evaluationCreateModalFrameRef.current) {
              window.cancelAnimationFrame(evaluationCreateModalFrameRef.current);
              evaluationCreateModalFrameRef.current = null;
            }
            if (evaluationCreateModalCloseTimerRef.current) {
              window.clearTimeout(evaluationCreateModalCloseTimerRef.current);
              evaluationCreateModalCloseTimerRef.current = null;
            }
          }
          setEvaluationCreateModalVisible(false);
          setEvaluationCreateModalClosing(false);
          if (typeof setEvaluationCreateModalOpen === "function") {
            setEvaluationCreateModalOpen(false);
          }
          if (options?.resetForm && typeof setEvaluationCreateForm === "function") {
            setEvaluationCreateForm(buildEvaluationCreateFormDefaults());
          }
        }

        function closeEvaluationCreateModal(options = {}) {
          if (options?.animate === false || typeof window === "undefined") {
            finishCloseEvaluationCreateModal(options);
            return;
          }
          if ((!evaluationCreateModalOpen && !evaluationCreateModalClosing) || evaluationCreateModalClosing) {
            return;
          }
          setEvaluationCreateModalVisible(false);
          setEvaluationCreateModalClosing(true);
          if (evaluationCreateModalCloseTimerRef.current) {
            window.clearTimeout(evaluationCreateModalCloseTimerRef.current);
          }
          evaluationCreateModalCloseTimerRef.current = window.setTimeout(() => {
            evaluationCreateModalCloseTimerRef.current = null;
            finishCloseEvaluationCreateModal(options);
          }, 75);
        }

        async function handleCreateEvaluation(event) {
          if (event?.preventDefault) {
            event.preventDefault();
          }
          const form = evaluationCreateForm && typeof evaluationCreateForm === "object" ? evaluationCreateForm : {};
          const name = String(form.name || "").trim() || "New Evaluation";
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "agent";
          const passThreshold = normalizePlaygroundEvaluationPassThreshold(form.passThreshold || 80);
          const nextSet = ensurePlaygroundEvaluationInitialVersion(createPlaygroundEvaluationSetDraft({
            name,
            targetAgentId: "",
            environmentId: "",
            passThreshold,
            creator: currentEvaluationCreator,
            createdBy: currentEvaluationCreator,
            evaluator: {
              type: evaluatorType,
              agentId: evaluatorType === "agent" ? String(form.evaluatorAgentId || defaultAgentId || agentOptions[0]?.id || "").trim() : "",
              code: evaluatorType === "code" ? String(form.evaluatorCode || "") : "",
            },
          }));
          try {
            const createdPayload = await requestEvaluationBackendJson(
              "/evaluations",
              {
                method: "POST",
                body: JSON.stringify(buildPlaygroundEvaluationBackendPayload(nextSet)),
              },
              "Failed to create evaluation."
            );
            const createdSet = normalizePlaygroundEvaluationSet(createdPayload?.evaluation || createdPayload?.data || createdPayload || nextSet);
            const detailedSet = await fetchBackendEvaluationSetDetails(createdSet, []);
            setEvaluationSets((current) => [detailedSet, ...(Array.isArray(current) ? current : []).filter((item) => normalizePlaygroundEvaluationSet(item).id !== detailedSet.id)]);
            evaluationSetPersistSignaturesRef.current.set(detailedSet.id, JSON.stringify(buildPlaygroundEvaluationBackendPayload(detailedSet)));
            setSelectedEvaluationSetId(detailedSet.id);
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationDetailTab("general");
            setEvaluationsPageMode("detail");
            closeEvaluationCreateModal({ resetForm: true });
          } catch (error) {
            setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            if (typeof window !== "undefined") {
              window.alert(error?.message || String(error));
            }
          }
        }

        function openRunEvaluationModal(setId) {
          const targetSet = normalizedSets.find((set) => set.id === setId) || activeSet;
          if (!targetSet) return;
          const normalizedTargetSetId = String(targetSet.id || "").trim();
          if (String(backendUrl || "").trim() && normalizedTargetSetId && !evaluationDetailsLoadedRef.current.has(normalizedTargetSetId)) {
            setEvaluationBackendSyncState({ status: "loading", error: "" });
            void reloadBackendEvaluationSet(normalizedTargetSetId, {
              clearRunSelection: false,
              select: false,
              rememberBaseline: false,
            }).then((loadedSet) => {
              setEvaluationBackendSyncState({ status: "idle", error: "" });
              if (loadedSet?.id) {
                openRunEvaluationModal(loadedSet.id);
              }
            }).catch((error) => {
              setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            });
            return;
          }
          const runSource = getEvaluationPublishedRunSource(targetSet);
          const sourceSet = runSource?.set;
          if (!sourceSet) {
            if (typeof window !== "undefined") {
              window.alert("Publish this evaluation before running it.");
            }
            return;
          }
          const evaluator = normalizePlaygroundEvaluationEvaluator(sourceSet.evaluator);
          const targetAgentId = getPlaygroundEvaluationDefaultId(agentOptions, sourceSet.targetAgentId || defaultAgentId);
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoice(environmentChoices, sourceSet, defaultEnvironmentId);
          if (typeof setEvaluationRunForm === "function") {
            setEvaluationRunForm({
              setId: targetSet.id,
              name: "Run " + ((Array.isArray(sourceSet.runs) ? sourceSet.runs.length : 0) + 1),
              targetAgentId,
              environmentKey: selectedEnvironmentChoice?.key || "",
              evaluatorType: evaluator.type,
              evaluatorAgentId: evaluator.agentId || getPlaygroundEvaluationDefaultId(agentOptions, defaultAgentId) || String(agentOptions[0]?.id || "").trim(),
              evaluatorCode: evaluator.code || "",
            });
          }
          if (typeof setEvaluationRunModalOpen === "function") {
            setEvaluationRunModalOpen(true);
          }
        }

        function finishCloseEvaluationRunModal() {
          if (typeof window !== "undefined") {
            if (evaluationRunModalFrameRef.current) {
              window.cancelAnimationFrame(evaluationRunModalFrameRef.current);
              evaluationRunModalFrameRef.current = null;
            }
            if (evaluationRunModalCloseTimerRef.current) {
              window.clearTimeout(evaluationRunModalCloseTimerRef.current);
              evaluationRunModalCloseTimerRef.current = null;
            }
          }
          setEvaluationRunModalVisible(false);
          setEvaluationRunModalClosing(false);
          if (typeof setEvaluationRunModalOpen === "function") {
            setEvaluationRunModalOpen(false);
          }
        }

        function closeEvaluationRunModal(options = {}) {
          if (options?.animate === false || typeof window === "undefined") {
            finishCloseEvaluationRunModal();
            return;
          }
          if ((!evaluationRunModalOpen && !evaluationRunModalClosing) || evaluationRunModalClosing) {
            return;
          }
          setEvaluationRunModalVisible(false);
          setEvaluationRunModalClosing(true);
          if (evaluationRunModalCloseTimerRef.current) {
            window.clearTimeout(evaluationRunModalCloseTimerRef.current);
          }
          evaluationRunModalCloseTimerRef.current = window.setTimeout(() => {
            evaluationRunModalCloseTimerRef.current = null;
            finishCloseEvaluationRunModal();
          }, 75);
        }

        async function handleRunEvaluation(setId, runOptions = {}) {
          const targetSet = normalizedSets.find((set) => set.id === setId) || activeSet;
          if (!targetSet) return;
          const runSource = getEvaluationPublishedRunSource(targetSet);
          const sourceSet = runSource?.set;
          const sourceVersion = runSource?.version;
          if (!sourceSet || !sourceVersion) {
            if (typeof window !== "undefined") {
              window.alert("Publish this evaluation before running it.");
            }
            return;
          }
          const selectedAgent = getPlaygroundEvaluationAgentRecord(agentOptions, runOptions.targetAgentId || sourceSet.targetAgentId || defaultAgentId);
          const targetAgentId = getPlaygroundEvaluationDefaultId(agentOptions, sourceSet.targetAgentId || defaultAgentId);
          const resolvedAgentId = String(runOptions.targetAgentId || selectedAgent?.id || targetAgentId || "").trim();
          const selectedEnvironmentChoice = runOptions.environmentChoice
            || getPlaygroundEvaluationEnvironmentChoice(environmentChoices, sourceSet, defaultEnvironmentId);
          const targetEnvironmentId = String(selectedEnvironmentChoice?.environmentId || sourceSet.environmentId || defaultEnvironmentId || "").trim();
          const targetProjectId = String(selectedEnvironmentChoice?.projectId || "").trim();
          const targetEnvironmentType = selectedEnvironmentChoice?.type === "project" ? "project" : "computer";
          if (!resolvedAgentId || !targetEnvironmentId) {
            if (typeof window !== "undefined") {
              window.alert("Select an agent and environment before running this evaluation.");
            }
            return;
          }
          const evaluator = normalizePlaygroundEvaluationEvaluator(runOptions.evaluator || sourceSet.evaluator);
          const selectedAgentVersion = getPlaygroundEvaluationAgentActiveVersion(selectedAgent);
          const evaluationSetSnapshot = normalizePlaygroundEvaluationSet({
            ...sourceSet,
            targetAgentId: resolvedAgentId,
            environmentType: targetEnvironmentType,
            environmentId: targetEnvironmentId,
            projectId: targetProjectId,
            evaluator,
          });
          const runRequestOptions = {
            id: createPlaygroundEvaluationId("eval_run"),
            label: String(runOptions.label || "").trim(),
            evaluationVersionId: String(sourceVersion.id || "").trim(),
            evaluationVersionNumber: Math.max(0, Number(sourceVersion.version || 0) || 0),
            evaluationVersionLabel: String(sourceVersion.label || (sourceVersion.version ? "Version " + sourceVersion.version : "") || "").trim(),
            targetAgentId: resolvedAgentId,
            targetAgentName: String(selectedAgent?.name || selectedAgent?.label || selectedAgent?.title || resolvedAgentId).trim(),
            targetAgentPhotoUrl: getPlaygroundEvaluationAgentPhotoUrl(selectedAgent),
            targetAgentVersionId: String(runOptions.targetAgentVersionId || selectedAgentVersion?.id || "").trim(),
            targetAgentVersionNumber: Math.max(0, Number(runOptions.targetAgentVersionNumber || selectedAgentVersion?.version || 0) || 0),
            targetAgentVersionLabel: String(runOptions.targetAgentVersionLabel || selectedAgentVersion?.label || (selectedAgentVersion?.version ? "Version " + selectedAgentVersion.version : "") || "").trim(),
            targetAgentVersionRevisionId: String(runOptions.targetAgentVersionRevisionId || selectedAgentVersion?.revisionId || selectedAgentVersion?.revision_id || "").trim(),
            fineTuningJobId: String(runOptions.fineTuningJobId || runOptions.fine_tuning_job_id || "").trim(),
            fine_tuning_job_id: String(runOptions.fine_tuning_job_id || runOptions.fineTuningJobId || "").trim(),
            environmentType: targetEnvironmentType,
            environmentId: targetEnvironmentId,
            environmentName: targetEnvironmentType === "computer" ? String(selectedEnvironmentChoice?.environmentName || selectedEnvironmentChoice?.name || targetEnvironmentId).trim() : "",
            projectId: targetProjectId,
            projectName: targetEnvironmentType === "project" ? String(selectedEnvironmentChoice?.projectName || selectedEnvironmentChoice?.name || targetProjectId).trim() : "",
            evaluator,
            passThreshold: normalizePlaygroundEvaluationPassThreshold(sourceSet.passThreshold),
            metadata: runOptions.metadata && typeof runOptions.metadata === "object" && !Array.isArray(runOptions.metadata)
              ? runOptions.metadata
              : null,
          };
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl) {
            if (typeof window !== "undefined") {
              window.alert("Evaluation backend is unavailable.");
            }
            return;
          }
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
            const data = await readPlaygroundEvaluationBackendJson(response, "Failed to start evaluation run.");
            const run = normalizePlaygroundEvaluationRun({
              ...runRequestOptions,
              ...(data?.run || data?.data || data || {}),
            });
            if (!run.id) {
              throw new Error("Evaluation run was created but no run id was returned.");
            }
            upsertEvaluationRun(targetSet.id, run, {
              targetAgentId: resolvedAgentId,
              environmentType: targetEnvironmentType,
              environmentId: targetEnvironmentId,
              projectId: targetProjectId,
              evaluator,
              passThreshold: normalizePlaygroundEvaluationPassThreshold(sourceSet.passThreshold),
            });
            setSelectedEvaluationSetId(targetSet.id);
            setSelectedEvaluationRunId(run.id);
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationsPageMode("run");
            void pollEvaluationRun(targetSet.id, run.id).catch((error) => {
              markEvaluationRunPollingFailed(targetSet.id, run.id, run, error);
            });
          } catch (error) {
            if (typeof window !== "undefined") {
              window.alert(error?.message || String(error));
            }
          }
        }

        function handleConfirmRunEvaluation(event) {
          if (event?.preventDefault) {
            event.preventDefault();
          }
          const form = evaluationRunForm && typeof evaluationRunForm === "object" ? evaluationRunForm : {};
          const targetSet = normalizedSets.find((set) => set.id === String(form.setId || "").trim()) || activeSet;
          if (!targetSet) return;
          const runSource = getEvaluationPublishedRunSource(targetSet);
          const sourceSet = runSource?.set || targetSet;
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoiceByKey(environmentChoices, form.environmentKey)
            || getPlaygroundEvaluationEnvironmentChoice(environmentChoices, sourceSet, defaultEnvironmentId);
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "agent";
          const evaluator = {
            type: evaluatorType,
            agentId: evaluatorType === "agent" ? String(form.evaluatorAgentId || defaultAgentId || agentOptions[0]?.id || "").trim() : "",
            code: evaluatorType === "code" ? String(form.evaluatorCode || "") : "",
          };
          closeEvaluationRunModal();
          void handleRunEvaluation(targetSet.id, {
            label: String(form.name || "").trim(),
            targetAgentId: getPlaygroundEvaluationDefaultId(agentOptions, form.targetAgentId || sourceSet.targetAgentId || defaultAgentId),
            environmentChoice: selectedEnvironmentChoice,
            evaluator,
          });
        }

        function closeEvaluationRenameDialog() {
          setEvaluationRenameState(null);
          setEvaluationRenameValue("");
          setEvaluationRenameError("");
        }

        function openEvaluationRenameDialog(set) {
          if (!set?.id) {
            return;
          }
          setEvaluationActionsPopoverOpen(false);
          setEvaluationRenameState({
            setId: set.id,
            originalName: String(set.name || ""),
          });
          setEvaluationRenameValue(String(set.name || ""));
          setEvaluationRenameError("");
        }

        function openEvaluationRunRenameDialog(set, run) {
          if (!set?.id || !run?.id) {
            return;
          }
          setEvaluationRunRowMenuId("");
          setEvaluationRenameState({
            type: "run",
            setId: set.id,
            runId: run.id,
            originalName: String(run.label || ""),
          });
          setEvaluationRenameValue(String(run.label || "Evaluation Run"));
          setEvaluationRenameError("");
        }

        function updateEvaluationRunRecord(setId, runId, updater) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedSetId || !normalizedRunId || typeof updater !== "function") {
            return;
          }
          evaluationVersionDraftTouchedRef.current = true;
          let updatedRunForPersistence = null;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalizedSet = normalizePlaygroundEvaluationSet(item);
            if (normalizedSet.id !== normalizedSetId) return normalizedSet;
            let updatedRun = null;
            const nextRuns = normalizedSet.runs.map((run) => {
              if (run.id !== normalizedRunId) return run;
              updatedRun = normalizePlaygroundEvaluationRun(updater(run));
              updatedRunForPersistence = updatedRun;
              return updatedRun;
            });
            if (!updatedRun) return normalizedSet;
            const now = new Date().toISOString();
            const nextSet = normalizePlaygroundEvaluationSet({
              ...normalizedSet,
              runs: nextRuns,
              updatedAt: now,
            });
            const versions = readSelectedEvaluationVersions(nextSet);
            if (!versions.length) return nextSet;
            const nextVersions = versions.map((version) => {
              const versionRuns = Array.isArray(version.snapshot?.runs) ? version.snapshot.runs : [];
              let versionChanged = false;
              const nextVersionRuns = versionRuns.map((run) => {
                const normalizedRun = normalizePlaygroundEvaluationRun(run);
                if (normalizedRun.id !== normalizedRunId) return normalizedRun;
                versionChanged = true;
                return normalizePlaygroundEvaluationRun(updater(normalizedRun));
              });
              if (!versionChanged) return version;
              return normalizePlaygroundEvaluationVersion({
                ...version,
                updatedAt: now,
                updated_at: now,
                runs: nextVersionRuns,
                runCount: nextVersionRuns.length,
                snapshot: {
                  ...(version.snapshot || {}),
                  runs: nextVersionRuns,
                },
              }, Math.max(0, Number(version.version || 1) - 1));
            });
            return createPlaygroundEvaluationWithVersionList(nextSet, nextVersions);
          }));
          if (updatedRunForPersistence) {
            void persistEvaluationRunToBackend(updatedRunForPersistence).catch((error) => {
              setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            });
          }
        }

        function deleteEvaluationRunCase(setId, runId, caseId) {
          const normalizedCaseId = String(caseId || "").trim();
          if (!normalizedCaseId) return;
          updateEvaluationRunRecord(setId, runId, (run) => {
            const nextCases = (Array.isArray(run.cases) ? run.cases : []).filter((caseItem) => caseItem.id !== normalizedCaseId);
            const activeCases = nextCases.filter((caseItem) => isPlaygroundEvaluationCaseActive(caseItem));
            const errorCases = nextCases.filter((caseItem) => caseItem.status === "error");
            const passThreshold = normalizePlaygroundEvaluationPassThreshold(run.passThreshold);
            const completedCases = nextCases.filter((caseItem) => !isPlaygroundEvaluationCaseActive(caseItem) && caseItem.status !== "error");
            return normalizePlaygroundEvaluationRun({
              ...run,
              cases: nextCases,
              averageScore: nextCases.length > 0
                ? nextCases.reduce((sum, caseItem) => sum + Number(caseItem.score || 0), 0) / nextCases.length
                : 0,
              passedCount: completedCases.filter((caseItem) => Number(caseItem.score || 0) >= passThreshold).length,
              totalCount: nextCases.length,
              costTokens: nextCases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationTokenCount(caseItem.costTokens), 0),
              costUsd: nextCases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationUsdCost(caseItem.costUsd), 0),
              status: activeCases.length > 0 ? "running" : errorCases.length === nextCases.length && nextCases.length > 0 ? "failed" : "completed",
              updatedAt: new Date().toISOString(),
            });
          });
        }

        function handleEvaluationRenameSubmit(event) {
          event.preventDefault();
          if (!evaluationRenameState?.setId) {
            return;
          }
          const nextName = String(evaluationRenameValue || "").trim().replace(/\s+/g, " ");
          if (!nextName) {
            setEvaluationRenameError("Evaluation name cannot be empty.");
            return;
          }
          if (nextName === evaluationRenameState.originalName) {
            closeEvaluationRenameDialog();
            return;
          }
          if (evaluationRenameState.type === "run") {
            updateEvaluationRunRecord(evaluationRenameState.setId, evaluationRenameState.runId, (run) => ({
              ...run,
              label: nextName,
              updatedAt: new Date().toISOString(),
            }));
            closeEvaluationRenameDialog();
            return;
          }
          updateEvaluationSet(evaluationRenameState.setId, (set) => ({
            ...set,
            name: nextName,
          }));
          closeEvaluationRenameDialog();
        }

        function handleDeleteEvaluationRun(setId, runId) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedSetId || !normalizedRunId) return;
          setEvaluationRunRowMenuId("");
          void deleteEvaluationRunFromBackend(normalizedRunId).catch((error) => {
            setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
          });
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalizedSet = normalizePlaygroundEvaluationSet(item);
            if (normalizedSet.id !== normalizedSetId) return normalizedSet;
            const now = new Date().toISOString();
            const nextRuns = normalizedSet.runs.filter((run) => run.id !== normalizedRunId);
            const nextSet = normalizePlaygroundEvaluationSet({
              ...normalizedSet,
              runs: nextRuns,
              updatedAt: now,
            });
            const versions = readSelectedEvaluationVersions(nextSet);
            if (!versions.length) return nextSet;
            const nextVersions = versions.map((version) => {
              const versionRuns = Array.isArray(version.snapshot?.runs) ? version.snapshot.runs : [];
              const nextVersionRuns = versionRuns
                .map((run) => normalizePlaygroundEvaluationRun(run))
                .filter((run) => run.id !== normalizedRunId);
              if (nextVersionRuns.length === versionRuns.length) return version;
              return normalizePlaygroundEvaluationVersion({
                ...version,
                updatedAt: now,
                updated_at: now,
                runs: nextVersionRuns,
                runCount: nextVersionRuns.length,
                snapshot: {
                  ...(version.snapshot || {}),
                  runs: nextVersionRuns,
                },
              }, Math.max(0, Number(version.version || 1) - 1));
            });
            return createPlaygroundEvaluationWithVersionList(nextSet, nextVersions);
          }));
          if (selectedEvaluationSetId === normalizedSetId && selectedEvaluationRunId === normalizedRunId) {
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationsPageMode("detail");
          }
        }

        function handleDeleteEvaluation(setId) {
          setEvaluationActionsPopoverOpen(false);
          closeEvaluationRenameDialog();
          const normalizedSetId = String(setId || "").trim();
          if (normalizedSetId) {
            void requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(normalizedSetId),
              { method: "DELETE" },
              "Failed to delete evaluation."
            ).catch((error) => {
              setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            });
          }
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).filter((item) => normalizePlaygroundEvaluationSet(item).id !== setId));
          if (selectedEvaluationSetId === setId) {
            setSelectedEvaluationSetId("");
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationsPageMode("overview");
          }
        }

`;


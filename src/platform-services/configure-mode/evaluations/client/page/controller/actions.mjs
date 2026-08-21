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
          evaluationCreateSubmittingRef.current = false;
          evaluationCreateAttemptedRef.current = false;
          evaluationCreateRequestIdRef.current = createPlaygroundEvaluationId("eval_create");
          evaluationCreateDraftIdRef.current = createPlaygroundEvaluationId("eval_set");
          setEvaluationCreateSubmitting(false);
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
          evaluationCreateSubmittingRef.current = false;
          evaluationCreateAttemptedRef.current = false;
          evaluationCreateRequestIdRef.current = "";
          evaluationCreateDraftIdRef.current = "";
          setEvaluationCreateSubmitting(false);
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
          if (evaluationCreateSubmittingRef.current) {
            return;
          }
          const form = evaluationCreateForm && typeof evaluationCreateForm === "object" ? evaluationCreateForm : {};
          const name = String(form.name || "").trim() || "New Evaluation";
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "agent";
          if (evaluatorType === "code") {
            if (typeof window !== "undefined") {
              window.alert("Code evaluators require the isolated grader sandbox and are not available on this deployment.");
            }
            return;
          }
          const passThreshold = normalizePlaygroundEvaluationPassThreshold(form.passThreshold || 80);
          const creationRequestId = evaluationCreateRequestIdRef.current || createPlaygroundEvaluationId("eval_create");
          const draftId = evaluationCreateDraftIdRef.current || createPlaygroundEvaluationId("eval_set");
          evaluationCreateRequestIdRef.current = creationRequestId;
          evaluationCreateDraftIdRef.current = draftId;
          const nextSet = ensurePlaygroundEvaluationInitialVersion(createPlaygroundEvaluationSetDraft({
            id: draftId,
            name,
            targetAgentId: "",
            environmentId: "",
            passThreshold,
            creator: currentEvaluationCreator,
            createdBy: currentEvaluationCreator,
            metadata: {
              owner: { ...currentEvaluationCreator, type: "user" },
              ownerId: currentEvaluationCreator.id,
              owner_id: currentEvaluationCreator.id,
              ownerUserId: currentEvaluationCreator.userId,
              owner_user_id: currentEvaluationCreator.userId,
              ownerName: currentEvaluationCreator.name,
              owner_name: currentEvaluationCreator.name,
              ownerEmail: currentEvaluationCreator.email,
              owner_email: currentEvaluationCreator.email,
              ownerAvatarUrl: currentEvaluationCreator.avatarUrl,
              owner_avatar_url: currentEvaluationCreator.avatarUrl,
              teamAccessIds: [],
              teamAccessShareIds: {},
              teamRolePermissionSets: {},
              clientRequestId: creationRequestId,
              client_request_id: creationRequestId,
            },
            evaluator: {
              type: evaluatorType,
              agentId: evaluatorType === "agent" ? String(form.evaluatorAgentId || defaultAgentId || agentOptions[0]?.id || "").trim() : "",
              code: evaluatorType === "code" ? String(form.evaluatorCode || "") : "",
            },
          }));
          evaluationCreateSubmittingRef.current = true;
          setEvaluationCreateSubmitting(true);
          let evaluationCreated = false;
          try {
            let createdSet = null;
            if (evaluationCreateAttemptedRef.current) {
              const existingPayload = await requestEvaluationBackendJson(
                "/evaluations?view=summary&limit=500",
                { method: "GET" },
                "Failed to reconcile evaluation creation."
              ).catch(() => null);
              createdSet = deduplicatePlaygroundEvaluationSets(
                readPlaygroundEvaluationListFromPayload(
                  existingPayload || {},
                  ["evaluations", "evaluationSets", "evaluation_sets"]
                )
              ).find((set) => (
                set.id === draftId
                || getPlaygroundEvaluationCreationRequestId(set) === creationRequestId
              )) || null;
            }
            evaluationCreateAttemptedRef.current = true;
            if (!createdSet) {
              const createdPayload = await requestEvaluationBackendJson(
                "/evaluations",
                {
                  method: "POST",
                  body: JSON.stringify(buildPlaygroundEvaluationBackendPayload(nextSet)),
                },
                "Failed to create evaluation."
              );
              const createdRecord = normalizePlaygroundEvaluationSet(
                createdPayload?.evaluation
                || createdPayload?.data
                || createdPayload
                || nextSet
              );
              createdSet = normalizePlaygroundEvaluationSet({
                ...nextSet,
                ...createdRecord,
                metadata: {
                  ...(nextSet.metadata || {}),
                  ...(createdRecord.metadata || {}),
                  clientRequestId: creationRequestId,
                  client_request_id: creationRequestId,
                },
              });
            }
            const detailedSet = await fetchBackendEvaluationSetDetails(createdSet, []);
            evaluationDetailsLoadedRef.current.add(detailedSet.id);
            setEvaluationSets((current) => deduplicatePlaygroundEvaluationSets([
              detailedSet,
              ...(Array.isArray(current) ? current : []),
            ]));
            evaluationSetPersistSignaturesRef.current.set(detailedSet.id, JSON.stringify(buildPlaygroundEvaluationBackendPayload(detailedSet)));
            setSelectedEvaluationSetId(detailedSet.id);
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationDetailTab("general");
            setEvaluationsPageMode("detail");
            evaluationCreated = true;
            closeEvaluationCreateModal({ resetForm: true });
          } catch (error) {
            setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            if (typeof window !== "undefined") {
              window.alert(error?.message || String(error));
            }
          } finally {
            if (!evaluationCreated) {
              evaluationCreateSubmittingRef.current = false;
              setEvaluationCreateSubmitting(false);
            }
          }
        }

        function openRunEvaluationModal(setId, options = {}) {
          const providedSet = options.set && typeof options.set === "object"
            ? ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(options.set))
            : null;
          const targetSet = providedSet || normalizedSets.find((set) => set.id === setId) || activeSet;
          if (!targetSet) return;
          const normalizedTargetSetId = String(targetSet.id || "").trim();
          if (
            options.skipHydration !== true
            && String(backendUrl || "").trim()
            && normalizedTargetSetId
            && !evaluationDetailsLoadedRef.current.has(normalizedTargetSetId)
          ) {
            setEvaluationBackendSyncState({ status: "loading", error: "" });
            void reloadBackendEvaluationSet(normalizedTargetSetId, {
              clearRunSelection: false,
              select: false,
              rememberBaseline: false,
            }).then((loadedSet) => {
              setEvaluationBackendSyncState({ status: "idle", error: "" });
              if (loadedSet?.id) {
                openRunEvaluationModal(loadedSet.id, {
                  set: loadedSet,
                  skipHydration: true,
                });
              }
            }).catch((error) => {
              setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            });
            return;
          }
          const hasDraftChanges = hasEvaluationDraftChanges(targetSet);
          if (hasDraftChanges && options.skipUnsavedPrompt !== true) {
            setEvaluationUnsavedRunDialog({
              setId: targetSet.id,
              status: "idle",
              error: "",
            });
            return;
          }
          const runSource = getEvaluationPublishedRunSource(targetSet);
          const sourceSet = runSource?.set;
          if (!sourceSet || !Array.isArray(sourceSet.dataRows) || sourceSet.dataRows.length === 0) {
            if (typeof window !== "undefined") {
              window.alert("Publish an evaluation version with at least one case before running it.");
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

        function closeEvaluationUnsavedRunDialog() {
          if (evaluationUnsavedRunDialog?.status === "saving") return;
          evaluationUnsavedRunResolvingRef.current = false;
          setEvaluationUnsavedRunDialog(null);
        }

        function runEvaluationWithoutDraftChanges() {
          const dialog = evaluationUnsavedRunDialog;
          if (!dialog?.setId || dialog.status === "saving") return;
          const targetSet = normalizedSets.find((set) => set.id === dialog.setId) || activeSet;
          const runSource = getEvaluationPublishedRunSource(targetSet);
          if (!runSource?.set || !Array.isArray(runSource.set.dataRows) || runSource.set.dataRows.length === 0) {
            setEvaluationUnsavedRunDialog((current) => current
              ? {
                  ...current,
                  error: "The last saved version has no cases. Save the current changes before running.",
                }
              : current
            );
            return;
          }
          setEvaluationUnsavedRunDialog(null);
          openRunEvaluationModal(targetSet.id, {
            set: targetSet,
            skipHydration: true,
            skipUnsavedPrompt: true,
          });
        }

        async function saveEvaluationChangesBeforeRun() {
          const dialog = evaluationUnsavedRunDialog;
          if (
            !dialog?.setId
            || dialog.status === "saving"
            || evaluationUnsavedRunResolvingRef.current
          ) {
            return;
          }
          const targetSet = normalizedSets.find((set) => set.id === dialog.setId) || activeSet;
          if (!targetSet || String(targetSet.id || "").trim() !== String(activeSet?.id || "").trim()) {
            setEvaluationUnsavedRunDialog((current) => current
              ? { ...current, error: "Open this evaluation before saving its changes." }
              : current
            );
            return;
          }
          evaluationUnsavedRunResolvingRef.current = true;
          setEvaluationUnsavedRunDialog((current) => current
            ? { ...current, status: "saving", error: "" }
            : current
          );
          try {
            const savedSet = await saveAndPublishCurrentEvaluationVersion({
              mode: "new",
              description: "Saved before evaluation run",
            });
            if (!savedSet) {
              throw new Error("The evaluation changes could not be saved.");
            }
            setEvaluationUnsavedRunDialog(null);
            openRunEvaluationModal(savedSet.id, {
              set: savedSet,
              skipHydration: true,
              skipUnsavedPrompt: true,
            });
          } catch (error) {
            setEvaluationUnsavedRunDialog((current) => current
              ? {
                  ...current,
                  status: "idle",
                  error: error?.message || String(error),
                }
              : current
            );
          } finally {
            evaluationUnsavedRunResolvingRef.current = false;
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
          const providedSet = runOptions.evaluationSet && typeof runOptions.evaluationSet === "object"
            ? ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(runOptions.evaluationSet))
            : null;
          const targetSet = providedSet || normalizedSets.find((set) => set.id === setId) || activeSet;
          if (!targetSet) return null;
          const runSource = getEvaluationPublishedRunSource(targetSet);
          const sourceSet = runSource?.set;
          const sourceVersion = runSource?.version;
          if (!sourceSet || !sourceVersion) {
            if (typeof window !== "undefined") {
              window.alert("Publish this evaluation before running it.");
            }
            return null;
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
            return null;
          }
          const evaluatorSource = normalizePlaygroundEvaluationEvaluator(runOptions.evaluator || sourceSet.evaluator);
          const selectedEvaluatorAgent = evaluatorSource.type === "agent"
            ? getPlaygroundEvaluationAgentRecord(agentOptions, evaluatorSource.agentId)
            : null;
          const selectedEvaluatorAgentVersion = selectedEvaluatorAgent
            ? getPlaygroundEvaluationAgentActiveVersion(selectedEvaluatorAgent)
            : null;
          const evaluator = normalizePlaygroundEvaluationEvaluator({
            ...evaluatorSource,
            agentVersionId: runOptions.evaluatorAgentVersionId
              || evaluatorSource.agentVersionId
              || selectedEvaluatorAgentVersion?.id,
            agentVersionNumber: runOptions.evaluatorAgentVersionNumber
              || evaluatorSource.agentVersionNumber
              || selectedEvaluatorAgentVersion?.version,
            agentVersionLabel: runOptions.evaluatorAgentVersionLabel
              || evaluatorSource.agentVersionLabel
              || selectedEvaluatorAgentVersion?.label,
            agentVersionRevisionId: runOptions.evaluatorAgentVersionRevisionId
              || evaluatorSource.agentVersionRevisionId
              || selectedEvaluatorAgentVersion?.revisionId
              || selectedEvaluatorAgentVersion?.revision_id,
          });
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
            return null;
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
            upsertEvaluationRun(targetSet.id, run);
            setSelectedEvaluationSetId(targetSet.id);
            setSelectedEvaluationRunId(run.id);
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationsPageMode("run");
            void pollEvaluationRun(targetSet.id, run.id).catch((error) => {
              markEvaluationRunPollingFailed(targetSet.id, run.id, run, error);
            });
            return run;
          } catch (error) {
            if (typeof window !== "undefined") {
              window.alert(error?.message || String(error));
            }
            return null;
          }
        }

        async function handleConfirmRunEvaluation(event) {
          if (event?.preventDefault) {
            event.preventDefault();
          }
          if (evaluationRunSubmittingRef.current) {
            return;
          }
          const form = evaluationRunForm && typeof evaluationRunForm === "object" ? evaluationRunForm : {};
          const targetSet = normalizedSets.find((set) => set.id === String(form.setId || "").trim()) || activeSet;
          if (!targetSet) return;
          evaluationRunSubmittingRef.current = true;
          setEvaluationRunSubmitting(true);
          try {
            const runnableSet = targetSet;
            const runSource = getEvaluationPublishedRunSource(runnableSet);
            const sourceSet = runSource?.set;
            if (!sourceSet || !Array.isArray(sourceSet.dataRows) || sourceSet.dataRows.length === 0) {
              throw new Error("Add at least one case before running this evaluation.");
            }
            const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoiceByKey(environmentChoices, form.environmentKey)
              || getPlaygroundEvaluationEnvironmentChoice(environmentChoices, sourceSet, defaultEnvironmentId);
            const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "agent";
            if (evaluatorType === "code") {
              throw new Error("Code evaluators require the isolated grader sandbox and are not available on this deployment.");
            }
            const evaluator = {
              type: evaluatorType,
              agentId: evaluatorType === "agent" ? String(form.evaluatorAgentId || defaultAgentId || agentOptions[0]?.id || "").trim() : "",
              code: evaluatorType === "code" ? String(form.evaluatorCode || "") : "",
            };
            const run = await handleRunEvaluation(runnableSet.id, {
              evaluationSet: runnableSet,
              label: String(form.name || "").trim(),
              targetAgentId: getPlaygroundEvaluationDefaultId(agentOptions, form.targetAgentId || sourceSet.targetAgentId || defaultAgentId),
              environmentChoice: selectedEnvironmentChoice,
              evaluator,
            });
            if (run) {
              closeEvaluationRunModal();
            }
          } catch (error) {
            if (typeof window !== "undefined") {
              window.alert(error?.message || String(error));
            }
          } finally {
            evaluationRunSubmittingRef.current = false;
            setEvaluationRunSubmitting(false);
          }
        }

        function closeEvaluationRenameDialog() {
          setEvaluationRenameState(null);
          setEvaluationRenameValue("");
          setEvaluationRenameError("");
        }

        function openEvaluationRenameDialog(set, options = {}) {
          if (!set?.id) {
            return;
          }
          const normalizedSetId = String(set.id || "").trim();
          if (
            options.skipHydration !== true
            && String(backendUrl || "").trim()
            && normalizedSetId
            && !evaluationDetailsLoadedRef.current.has(normalizedSetId)
          ) {
            setEvaluationBackendSyncState({ status: "loading", error: "" });
            void reloadBackendEvaluationSet(normalizedSetId, {
              clearRunSelection: false,
              select: false,
              rememberBaseline: false,
            }).then((loadedSet) => {
              setEvaluationBackendSyncState({ status: "idle", error: "" });
              if (loadedSet?.id) {
                openEvaluationRenameDialog(loadedSet, { skipHydration: true });
              }
            }).catch((error) => {
              setEvaluationBackendSyncState({
                status: "error",
                error: error?.message || String(error),
              });
            });
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
            const nextSet = normalizePlaygroundEvaluationSet({
              ...normalizedSet,
              runs: nextRuns,
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
          }), { persist: true });
          closeEvaluationRenameDialog();
        }

        function handleDeleteEvaluationRuns(setId, runIds) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunIds = Array.from(new Set(
            (Array.isArray(runIds) ? runIds : [])
              .map((runId) => String(runId || "").trim())
              .filter(Boolean)
          ));
          if (!normalizedSetId || !normalizedRunIds.length) return;
          const deletedRunIds = new Set(normalizedRunIds);
          setEvaluationRunRowMenuId("");
          setSelectedEvaluationRunIds(new Set());
          void Promise.allSettled(normalizedRunIds.map((runId) => deleteEvaluationRunFromBackend(runId))).then((results) => {
            const failedResult = results.find((result) => result.status === "rejected");
            if (failedResult?.status === "rejected") {
              setEvaluationBackendSyncState({
                status: "error",
                error: failedResult.reason?.message || String(failedResult.reason),
              });
            }
          });
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalizedSet = normalizePlaygroundEvaluationSet(item);
            if (normalizedSet.id !== normalizedSetId) return normalizedSet;
            const nextRuns = normalizedSet.runs.filter((run) => !deletedRunIds.has(run.id));
            const nextSet = normalizePlaygroundEvaluationSet({
              ...normalizedSet,
              runs: nextRuns,
            });
            const versions = readSelectedEvaluationVersions(nextSet);
            if (!versions.length) return nextSet;
            const nextVersions = versions.map((version) => {
              const versionRuns = Array.isArray(version.snapshot?.runs) ? version.snapshot.runs : [];
              const nextVersionRuns = versionRuns
                .map((run) => normalizePlaygroundEvaluationRun(run))
                .filter((run) => !deletedRunIds.has(run.id));
              if (nextVersionRuns.length === versionRuns.length) return version;
              return normalizePlaygroundEvaluationVersion({
                ...version,
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
          if (selectedEvaluationSetId === normalizedSetId && deletedRunIds.has(selectedEvaluationRunId)) {
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationsPageMode("detail");
          }
        }

        function handleDeleteEvaluationRun(setId, runId) {
          handleDeleteEvaluationRuns(setId, [runId]);
        }

        function handleDeleteEvaluations(setIds) {
          const normalizedSetIds = Array.from(new Set(
            (Array.isArray(setIds) ? setIds : [])
              .map((setId) => String(setId || "").trim())
              .filter(Boolean)
          ));
          if (!normalizedSetIds.length) return;
          const deletedSetIds = new Set(normalizedSetIds);
          setEvaluationActionsPopoverOpen(false);
          closeEvaluationRenameDialog();
          void Promise.allSettled(normalizedSetIds.map((setId) => (
            requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(setId),
              { method: "DELETE" },
              "Failed to delete evaluation."
            )
          ))).then((results) => {
            const failedResult = results.find((result) => result.status === "rejected");
            if (failedResult?.status === "rejected") {
              setEvaluationBackendSyncState({
                status: "error",
                error: failedResult.reason?.message || String(failedResult.reason),
              });
            }
          });
          setEvaluationSets((current) => (
            (Array.isArray(current) ? current : []).filter((item) => (
              !deletedSetIds.has(normalizePlaygroundEvaluationSet(item).id)
            ))
          ));
          setEvaluationOverviewPaginationState((current) => ({
            ...current,
            nextOffset: Math.max(
              0,
              Number(current.nextOffset || 0) - normalizedSetIds.length
            ),
          }));
          if (deletedSetIds.has(selectedEvaluationSetId)) {
            setSelectedEvaluationSetId("");
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") {
              setSelectedEvaluationCaseId("");
            }
            setEvaluationsPageMode("overview");
          }
        }

        function handleDeleteEvaluation(setId) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId) return;
          handleDeleteEvaluations([normalizedSetId]);
        }

`;

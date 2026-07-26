export const FINE_TUNING_PAGE_CONTROLLER_VERIFICATION_SCRIPT = String.raw`        function normalizeFineTuningEvaluationRun(rawRun = {}) {
          if (typeof normalizePlaygroundEvaluationRun === "function") {
            return normalizePlaygroundEvaluationRun(rawRun);
          }
          const source = rawRun && typeof rawRun === "object" && !Array.isArray(rawRun) ? rawRun : {};
          const cases = Array.isArray(source.cases) ? source.cases : [];
          const averageScore = Number(source.averageScore ?? source.average_score);
          const runCostUsd = readPlaygroundFineTuningUsdCostWithLegacyCt(source);
          const runCostTokens = normalizePlaygroundFineTuningTokenCount(
            source.costTokens
            ?? source.cost_tokens
            ?? source.costCt
            ?? source.costCT
            ?? source.cost_ct
            ?? source.computeTokens
            ?? source.compute_tokens
            ?? source.totalCT
            ?? source.totalCt
            ?? source.total_ct
            ?? source.ct
          ) || normalizePlaygroundFineTuningTokenCount(runCostUsd * PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR);
          return {
            ...source,
            id: normalizePlaygroundFineTuningString(source.id || source.runId || source.run_id),
            label: normalizePlaygroundFineTuningString(source.label || source.name || "Run"),
            averageScore: Number.isFinite(averageScore)
              ? normalizePlaygroundFineTuningScore(averageScore)
              : cases.length
                ? normalizePlaygroundFineTuningScore(cases.reduce((sum, item) => sum + Number(item?.score || 0), 0) / cases.length)
                : 0,
            costTokens: runCostTokens,
            costUsd: runCostUsd,
            status: normalizePlaygroundFineTuningString(source.status || "queued") || "queued",
          };
        }

        function isFineTuningEvaluationRunActive(status) {
          return new Set(["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring"]).has(
            normalizePlaygroundFineTuningString(status).toLowerCase()
          );
        }

        function getFineTuningEvaluationRunScore(run) {
          const normalizedRun = normalizeFineTuningEvaluationRun(run);
          return normalizePlaygroundFineTuningScore(normalizedRun.averageScore ?? normalizedRun.average_score ?? 0);
        }

        function getFineTuningEvaluationRunCostUsd(run) {
          const normalizedRun = normalizeFineTuningEvaluationRun(run);
          return readPlaygroundFineTuningUsdCostWithLegacyCt(normalizedRun);
        }

        function upsertFineTuningEvaluationRun(setId, run) {
          const normalizedSetId = normalizePlaygroundFineTuningString(setId);
          const normalizedRun = normalizeFineTuningEvaluationRun(run);
          if (!normalizedSetId || !normalizedRun.id || typeof setEvaluationSets !== "function") return;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((set, index) => {
            const normalizedSet = normalizePlaygroundFineTuningEvaluationSet(set, index);
            if (normalizePlaygroundFineTuningString(normalizedSet.id) !== normalizedSetId) return set;
            const existingRuns = Array.isArray(set?.runs) ? set.runs : [];
            return {
              ...set,
              runs: [normalizedRun, ...existingRuns.filter((existingRun) => normalizePlaygroundFineTuningString(existingRun?.id || existingRun?.runId || existingRun?.run_id) !== normalizedRun.id)],
              updatedAt: new Date().toISOString(),
            };
          }));
        }

        function mergeFineTuningVerificationReferences(job, references, statusOverride = "") {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const referenceList = Array.isArray(references) ? references : [];
          const existingReferences = normalizedJob.evaluationRuns.map((reference, index) => normalizePlaygroundFineTuningRunReference(reference, index));
          const bySetId = new Map(existingReferences.map((reference) => [reference.evaluationSetId, reference]));
          referenceList.forEach((reference, index) => {
            const normalizedReference = normalizePlaygroundFineTuningRunReference(reference, index);
            if (normalizedReference.evaluationSetId) {
              bySetId.set(normalizedReference.evaluationSetId, {
                ...(bySetId.get(normalizedReference.evaluationSetId) || {}),
                ...normalizedReference,
              });
            }
          });
          const nextReferences = Array.from(bySetId.values());
          const beforeScores = nextReferences
            .map((reference) => Number(reference.beforeScore))
            .filter((score) => Number.isFinite(score));
          const finishedAfterScores = nextReferences
            .filter((reference) => reference.afterRunId && !isFineTuningEvaluationRunActive(reference.status) && reference.status !== "error")
            .map((reference) => Number(reference.afterScore))
            .filter((score) => Number.isFinite(score));
          const beforeScore = beforeScores.length
            ? normalizePlaygroundFineTuningScore(beforeScores.reduce((sum, score) => sum + score, 0) / beforeScores.length)
            : normalizedJob.beforeScore;
          const hasActiveRuns = nextReferences.some((reference) => reference.afterRunId && isFineTuningEvaluationRunActive(reference.status));
          const hasPendingRuns = nextReferences.some((reference) => reference.status === "pending");
          const afterScore = finishedAfterScores.length
            ? normalizePlaygroundFineTuningScore(finishedAfterScores.reduce((sum, score) => sum + score, 0) / finishedAfterScores.length)
            : normalizedJob.afterScore || beforeScore;
          const status = statusOverride
            || (hasActiveRuns || hasPendingRuns ? "verifying" : normalizedJob.status || "completed");
          const verificationCostUsd = nextReferences
            .filter((reference) => reference.afterRunId && !isFineTuningEvaluationRunActive(reference.status) && reference.status !== "error")
            .reduce((sum, reference) => sum + normalizePlaygroundFineTuningUsdCost(reference.afterCostUsd), 0);
          const fineTuningCostUsd = normalizePlaygroundFineTuningUsdCost(normalizedJob.fineTuningCostUsd || readPlaygroundFineTuningUsdCostWithLegacyCt(normalizedJob));
          return normalizePlaygroundFineTuningJob({
            ...normalizedJob,
            status,
            beforeScore,
            afterScore,
            improvementScore: finishedAfterScores.length ? normalizePlaygroundFineTuningScore(Math.max(0, afterScore - beforeScore)) : 0,
            fineTuningCostUsd,
            verificationCostUsd,
            totalCostUsd: fineTuningCostUsd + verificationCostUsd,
            evaluationRuns: nextReferences,
            updatedAt: new Date().toISOString(),
          });
        }

        function buildFineTuningAgentSnapshotFromAgent(agent, instructionsOverride) {
          const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata) ? agent.metadata : {};
          const instructions = instructionsOverride === undefined
            ? String(agent?.instructions || agent?.systemPrompt || agent?.system_prompt || metadata.instructions || "")
            : String(instructionsOverride || "");
          return {
            name: normalizePlaygroundFineTuningString(agent?.name || agent?.label || agent?.title || "Agent"),
            description: String(agent?.description || metadata.description || ""),
            model: normalizePlaygroundFineTuningString(agent?.model || agent?.modelId || agent?.model_id || metadata.model || ""),
            instructions,
            enabledSkills: Array.isArray(agent?.enabledSkills) ? agent.enabledSkills : Array.isArray(agent?.enabled_skills) ? agent.enabled_skills : [],
            guardrailSetIds: Array.isArray(agent?.guardrailSetIds) ? agent.guardrailSetIds : Array.isArray(agent?.guardrail_set_ids) ? agent.guardrail_set_ids : [],
            guardrails: Array.isArray(agent?.guardrails) ? agent.guardrails : Array.isArray(metadata.guardrails) ? metadata.guardrails : [],
            promptAdaptations: Array.isArray(agent?.promptAdaptations) ? agent.promptAdaptations : Array.isArray(agent?.prompt_adaptations) ? agent.prompt_adaptations : [],
            invisiblePromptAdaptations: Array.isArray(agent?.invisiblePromptAdaptations) ? agent.invisiblePromptAdaptations : Array.isArray(agent?.invisible_prompt_adaptations) ? agent.invisible_prompt_adaptations : [],
            metadata,
          };
        }

        function preservePlaygroundFineTuningAgentName(job, snapshot = {}) {
          const source = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) ? snapshot : {};
          return {
            ...source,
            name: normalizePlaygroundFineTuningString(job?.targetAgentName || job?.agentName || source.name || "Agent") || "Agent",
          };
        }

        function buildOptimisticFineTuningJob({ jobId, name, selectedSets, targetAgent, fineTunerAgent, selectedEnvironment, instructions, conductedBy }) {
          const nowIso = new Date().toISOString();
          const evaluationRuns = (Array.isArray(selectedSets) ? selectedSets : []).map((set) => {
            const beforeRun = getPlaygroundFineTuningRunById(set, set.fineTuningRunId || set.fine_tuning_run_id)
              || getPlaygroundFineTuningLatestRun(set);
            return {
              evaluationSetId: set.id,
              evaluationSetName: set.name,
              beforeRunId: normalizePlaygroundFineTuningString(beforeRun?.id || set.fineTuningRunId || set.fine_tuning_run_id),
              beforeRunLabel: normalizePlaygroundFineTuningString(beforeRun?.label || beforeRun?.name || beforeRun?.title || "Before"),
              beforeScore: getFineTuningEvaluationRunScore(beforeRun),
              beforeCostUsd: getFineTuningEvaluationRunCostUsd(beforeRun),
              afterRunId: "",
              afterRunLabel: "",
              afterScore: 0,
              afterCostUsd: 0,
              status: "pending",
            };
          });
          const beforeScores = evaluationRuns
            .map((reference) => Number(reference.beforeScore))
            .filter((score) => Number.isFinite(score));
          const beforeScore = beforeScores.length
            ? normalizePlaygroundFineTuningScore(beforeScores.reduce((sum, score) => sum + score, 0) / beforeScores.length)
            : 0;
          const beforeSnapshot = buildFineTuningAgentSnapshotFromAgent(targetAgent);
          return normalizePlaygroundFineTuningJob({
            id: jobId,
            name,
            status: "running",
            createdAt: nowIso,
            updatedAt: nowIso,
            agentId: normalizePlaygroundFineTuningString(targetAgent?.id),
            targetAgentId: normalizePlaygroundFineTuningString(targetAgent?.id),
            agentName: normalizePlaygroundFineTuningString(targetAgent?.name || targetAgent?.label || targetAgent?.title || "Agent"),
            targetAgentName: normalizePlaygroundFineTuningString(targetAgent?.name || targetAgent?.label || targetAgent?.title || "Agent"),
            agentPhotoUrl: normalizePlaygroundFineTuningString(targetAgent?.photoUrl || targetAgent?.photoURL || targetAgent?.avatarUrl || targetAgent?.avatarURL),
            targetAgentPhotoUrl: normalizePlaygroundFineTuningString(targetAgent?.photoUrl || targetAgent?.photoURL || targetAgent?.avatarUrl || targetAgent?.avatarURL),
            conductedBy,
            createdBy: conductedBy,
            fineTunerAgentId: normalizePlaygroundFineTuningString(fineTunerAgent?.id),
            fineTunerAgentName: normalizePlaygroundFineTuningString(fineTunerAgent?.name || fineTunerAgent?.label || fineTunerAgent?.title || "Agent"),
            fineTunerAgentPhotoUrl: normalizePlaygroundFineTuningString(fineTunerAgent?.photoUrl || fineTunerAgent?.photoURL || fineTunerAgent?.avatarUrl || fineTunerAgent?.avatarURL),
            environmentId: normalizePlaygroundFineTuningString(selectedEnvironment?.id),
            environmentName: normalizePlaygroundFineTuningString(selectedEnvironment?.name || selectedEnvironment?.label || selectedEnvironment?.title || "Computer"),
            evaluationSets: (Array.isArray(selectedSets) ? selectedSets : []).map((set) => {
              const beforeRun = getPlaygroundFineTuningRunById(set, set.fineTuningRunId || set.fine_tuning_run_id)
                || getPlaygroundFineTuningLatestRun(set);
              return {
                id: set.id,
                name: set.name,
                activeVersionId: set.activeVersionId,
                activeVersionNumber: set.activeVersionNumber,
                activeVersionLabel: set.activeVersionLabel,
                fineTuningRunId: normalizePlaygroundFineTuningString(beforeRun?.id || set.fineTuningRunId || set.fine_tuning_run_id),
                fineTuningRunLabel: normalizePlaygroundFineTuningString(beforeRun?.label || beforeRun?.name || beforeRun?.title || "Before"),
                caseCount: Array.isArray(set.dataRows) ? set.dataRows.length : 0,
              };
            }),
            instructions: String(instructions || ""),
            verifyAfter: true,
            threadId: "",
            threadTitle: "Agent Optimization · " + normalizePlaygroundFineTuningString(targetAgent?.name || targetAgent?.label || targetAgent?.title || "Agent"),
            beforeScore,
            afterScore: 0,
            improvementScore: 0,
            costTokens: 0,
            costUsd: 0,
            fineTuningCostUsd: 0,
            verificationCostUsd: 0,
            analysisSummary: "",
            evaluationRuns,
            beforeAgentSnapshot: beforeSnapshot,
            afterAgentSnapshot: beforeSnapshot,
            diffFiles: [],
            createdAgentVersion: {
              id: "",
              version: getFineTuningNextAgentVersionNumber(targetAgent),
              label: "Optimized Version",
              status: "pending",
              snapshot: null,
              createdAt: nowIso,
            },
            agentVersionCreationStatus: "pending",
          });
        }

        function getFineTuningAgentVersionList(agent) {
          if (typeof readPlaygroundAgentVersions === "function") {
            return readPlaygroundAgentVersions(agent);
          }
          const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata) ? agent.metadata : {};
          const versions = agent?.agentVersions || agent?.agent_versions || agent?.versions || metadata.agentVersions || metadata.agent_versions || metadata.versions || [];
          return Array.isArray(versions) ? versions : [];
        }

        function getFineTuningNextAgentVersionNumber(agent) {
          const versions = getFineTuningAgentVersionList(agent);
          return Math.max(1, (Array.isArray(versions) ? versions : []).reduce((maxVersion, version) => Math.max(maxVersion, Number(version?.version || version?.versionNumber || version?.version_number || 0) || 0), 0) + 1);
        }

        function notifyFineTunedAgentVersionCreated(job, version) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedVersion = version && typeof version === "object" && !Array.isArray(version)
            ? {
                ...version,
                snapshot: version.snapshot || normalizedJob.createdAgentVersion?.snapshot || normalizedJob.afterAgentSnapshot || {},
              }
            : null;
          if (!normalizedJob.agentId || !normalizedVersion?.id) return;
          if (typeof onAgentVersionCreated === "function") {
            onAgentVersionCreated(normalizedJob.agentId, normalizedVersion, normalizedJob);
          }
        }

        async function readFineTuningJsonResponse(response, fallbackMessage) {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            const error = new Error(data?.message || data?.error || fallbackMessage || "Request failed.");
            error.status = Number(response.status) || 0;
            error.payload = data;
            throw error;
          }
          return data;
        }

        async function persistFineTuningRuntimeJob(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedBackendUrl || !normalizedJob.id) return normalizedJob;
          const response = await fetch(normalizedBackendUrl + "/fine-tuning/jobs/" + encodeURIComponent(normalizedJob.id), {
            method: "PATCH",
            credentials: "include",
            cache: "no-store",
            headers: {
              ...(requestHeaders || {}),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              job: buildPlaygroundFineTuningJobReferencePayload(normalizedJob),
            }),
          });
          const data = await readFineTuningJsonResponse(response, "Failed to save optimization job.");
          return mergePlaygroundFineTuningJobRecords(normalizedJob, data?.job || data?.data || data);
        }

        function isFineTuningRuntimeJobComplete(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const status = normalizePlaygroundFineTuningString(normalizedJob.status).toLowerCase();
          const phase = normalizePlaygroundFineTuningString(normalizedJob.phase).toLowerCase();
          return isPlaygroundFineTuningTerminalStatus(phase || status);
        }

        function delayFineTuningPoll(ms) {
          return new Promise((resolve) => {
            if (typeof window !== "undefined") {
              window.setTimeout(resolve, ms);
              return;
            }
            setTimeout(resolve, ms);
          });
        }

        function notifyFineTuningThreadStarted(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.threadId || typeof onFineTuningThreadStarted !== "function") return;
          if (fineTuningThreadNotificationRef.current.has(normalizedJob.threadId)) return;
          fineTuningThreadNotificationRef.current.add(normalizedJob.threadId);
          onFineTuningThreadStarted({
            id: normalizedJob.threadId,
            title: normalizedJob.threadTitle || normalizedJob.name,
            hidden: true,
            sidebarHidden: true,
            metadata: {
              fineTuning: {
                jobId: normalizedJob.id,
                agentId: normalizedJob.agentId,
                targetAgentId: normalizedJob.agentId,
                fineTunerAgentId: normalizedJob.fineTunerAgentId,
                environmentId: normalizedJob.environmentId,
                evaluationSetIds: normalizedJob.evaluationSets.map((set) => set.id),
                hidden: true,
                sidebarHidden: true,
              },
              runnerPlayground: {
                type: "fine_tuning_job",
                fineTuningJobId: normalizedJob.id,
                hidden: true,
                sidebarHidden: true,
              },
            },
          });
        }

        async function fetchFineTuningRuntimeJob(jobId, seedJob) {
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedBackendUrl || !normalizedJobId) return normalizePlaygroundFineTuningJob(seedJob);
          const response = await fetch(normalizedBackendUrl + "/fine-tuning/jobs/" + encodeURIComponent(normalizedJobId), {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: requestHeaders || {},
          });
          const data = await readFineTuningJsonResponse(response, "Failed to load optimization job.");
          const latestJob = mergePlaygroundFineTuningJobRecords(seedJob, data?.job || data?.data || data);
          if (latestJob.id) {
            patchFineTuningJob(normalizedJobId, () => latestJob);
            notifyFineTuningThreadStarted(latestJob);
          }
          return latestJob;
        }

        async function waitForFineTuningRuntimeJob(jobId, seedJob) {
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          let latestJob = normalizePlaygroundFineTuningJob(seedJob);
          if (!normalizedBackendUrl || !normalizedJobId || isFineTuningRuntimeJobComplete(latestJob)) return latestJob;
          for (let attempt = 0; attempt < 240; attempt += 1) {
            await delayFineTuningPoll(attempt < 10 ? 1000 : 1500);
            latestJob = await fetchFineTuningRuntimeJob(normalizedJobId, latestJob);
            if (isFineTuningRuntimeJobComplete(latestJob)) return latestJob;
          }
          return latestJob;
        }

        function scheduleFineTuningVerificationPoll(jobId, setId, runId) {
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          const normalizedRunId = normalizePlaygroundFineTuningString(runId);
          if (!normalizedBackendUrl || !normalizedRunId) return;
          let attempts = 0;
          const poll = async () => {
            attempts += 1;
            try {
              const response = await fetch(normalizedBackendUrl + "/evaluations/runs/" + encodeURIComponent(normalizedRunId), {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders || {},
              });
              const data = await readFineTuningJsonResponse(response, "Failed to load verification run.");
              const run = normalizeFineTuningEvaluationRun(data?.run || data?.data || data);
              if (run.id) {
                upsertFineTuningEvaluationRun(setId, run);
                patchFineTuningJob(jobId, (currentJob) => mergeFineTuningVerificationReferences(currentJob, [{
                  evaluationSetId: setId,
                  afterRunId: run.id,
                  afterRunLabel: run.label || "Verification Run",
                  afterScore: getFineTuningEvaluationRunScore(run),
                  afterCostUsd: getFineTuningEvaluationRunCostUsd(run),
                  status: normalizePlaygroundFineTuningString(currentJob?.status).toLowerCase() === "cancelled" ? "cancelled" : (run.status || "completed"),
                }]), { persist: true });
              }
              if (run.id && isFineTuningEvaluationRunActive(run.status) && attempts < 120 && typeof window !== "undefined") {
                window.setTimeout(poll, 1500);
              }
            } catch (error) {
              patchFineTuningJob(jobId, (currentJob) => {
                if (normalizePlaygroundFineTuningString(currentJob?.status).toLowerCase() === "cancelled") return currentJob;
                return mergeFineTuningVerificationReferences(currentJob, [{
                  evaluationSetId: setId,
                  afterRunId: normalizedRunId,
                  status: "error",
                }], "error");
              }, { persist: true });
            }
          };
          if (typeof window !== "undefined") {
            window.setTimeout(poll, 1200);
          }
        }

        async function startFineTuningVerificationRuns(job, selectedSets, targetAgent, selectedEnvironment) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          const version = normalizedJob.createdAgentVersion && typeof normalizedJob.createdAgentVersion === "object"
            ? normalizedJob.createdAgentVersion
            : {};
          const versionId = normalizePlaygroundFineTuningString(version.id || version.versionId || version.version_id);
          if (!normalizedBackendUrl || !versionId || !isPlaygroundFineTuningAgentVersionReady(normalizedJob.agentVersionCreationStatus)) {
            return mergeFineTuningVerificationReferences(normalizedJob, (Array.isArray(selectedSets) ? selectedSets : []).map((set) => ({
              evaluationSetId: set.id,
              evaluationSetName: set.name,
              status: "blocked",
            })), "completed");
          }
          const references = [];
          for (const set of Array.isArray(selectedSets) ? selectedSets : []) {
            const beforeRun = getPlaygroundFineTuningRunById(set, set.fineTuningRunId || set.fine_tuning_run_id)
              || getPlaygroundFineTuningLatestRun(set);
            const evaluator = set?.evaluator && typeof set.evaluator === "object" && !Array.isArray(set.evaluator)
              ? { ...set.evaluator }
              : { type: "exact", agentId: "", code: "" };
            if (String(evaluator.type || "").trim() === "agent" && !normalizePlaygroundFineTuningString(evaluator.agentId)) {
              evaluator.agentId = normalizePlaygroundFineTuningString(targetAgent?.id);
            }
            const runRequestOptions = {
              id: createPlaygroundFineTuningId("eval_run"),
              label: "Optimization Verification",
              fineTuningJobId: normalizedJob.id,
              fine_tuning_job_id: normalizedJob.id,
              evaluationVersionId: normalizePlaygroundFineTuningString(set.activeVersionId),
              evaluationVersionNumber: Math.max(0, Number(set.activeVersionNumber || 0) || 0),
              evaluationVersionLabel: normalizePlaygroundFineTuningString(set.activeVersionLabel),
              targetAgentId: normalizePlaygroundFineTuningString(targetAgent?.id),
              targetAgentName: normalizePlaygroundFineTuningString(targetAgent?.name || targetAgent?.label || targetAgent?.title || normalizedJob.agentName),
              targetAgentPhotoUrl: normalizePlaygroundFineTuningString(targetAgent?.photoUrl || targetAgent?.photoURL || targetAgent?.avatarUrl || targetAgent?.avatarURL || normalizedJob.agentPhotoUrl),
              targetAgentVersionId: versionId,
              targetAgentVersionNumber: Math.max(0, Number(version.version || version.versionNumber || version.version_number || 0) || 0),
              targetAgentVersionLabel: normalizePlaygroundFineTuningString(version.label || (version.version ? "Version " + version.version : "")),
              targetAgentVersionRevisionId: normalizePlaygroundFineTuningString(version.revisionId || version.revision_id),
              environmentType: "computer",
              environmentId: normalizePlaygroundFineTuningString(selectedEnvironment?.id),
              environmentName: normalizePlaygroundFineTuningString(selectedEnvironment?.name || selectedEnvironment?.label || selectedEnvironment?.title || normalizedJob.environmentName),
              projectId: "",
              projectName: "",
              evaluator,
              passThreshold: set.passThreshold,
              metadata: {
                fineTuningJobId: normalizedJob.id,
                fine_tuning_job_id: normalizedJob.id,
              },
            };
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
                  evaluationSet: {
                    ...set,
                    targetAgentId: runRequestOptions.targetAgentId,
                    environmentType: "computer",
                    environmentId: runRequestOptions.environmentId,
                    projectId: "",
                    evaluator,
                  },
                  runOptions: runRequestOptions,
                }),
              });
              const data = await readFineTuningJsonResponse(response, "Failed to start verification run.");
              const run = normalizeFineTuningEvaluationRun({
                ...runRequestOptions,
                ...(data?.run || data?.data || data || {}),
              });
              upsertFineTuningEvaluationRun(set.id, run);
              references.push({
                evaluationSetId: set.id,
                evaluationSetName: set.name,
                beforeRunId: beforeRun?.id || "",
                beforeRunLabel: beforeRun?.label || beforeRun?.name || "Before",
                beforeScore: getFineTuningEvaluationRunScore(beforeRun),
                afterRunId: run.id,
                afterRunLabel: run.label || "Verification Run",
                afterScore: getFineTuningEvaluationRunScore(run),
                afterCostUsd: getFineTuningEvaluationRunCostUsd(run),
                status: run.status || "queued",
              });
              if (run.id) {
                scheduleFineTuningVerificationPoll(normalizedJob.id, set.id, run.id);
              }
            } catch (error) {
              references.push({
                evaluationSetId: set.id,
                evaluationSetName: set.name,
                beforeRunId: beforeRun?.id || "",
                beforeRunLabel: beforeRun?.label || beforeRun?.name || "Before",
                beforeScore: getFineTuningEvaluationRunScore(beforeRun),
                afterRunId: "",
                afterRunLabel: "",
                afterScore: 0,
                status: "error",
              });
            }
          }
          return mergeFineTuningVerificationReferences(normalizedJob, references);
        }

        async function publishFineTunedAgentVersion(job, version, snapshot) {
          throw new Error("Optimized versions can only be published by the server-controlled publication policy.");
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedVersion = version && typeof version === "object" && !Array.isArray(version) ? version : {};
          const versionId = normalizePlaygroundFineTuningString(normalizedVersion.id || normalizedVersion.versionId || normalizedVersion.version_id);
          if (!backendUrl || !normalizedJob.agentId || !versionId) {
            return normalizedVersion;
          }
          const safeSnapshot = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
            ? preservePlaygroundFineTuningAgentName(normalizedJob, snapshot)
            : null;
          const response = await fetch(String(backendUrl).replace(/\/+$/, "") + "/agents/" + encodeURIComponent(normalizedJob.agentId) + "/versions/" + encodeURIComponent(versionId) + "/publish", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: {
              ...(requestHeaders || {}),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(safeSnapshot ? { snapshot: safeSnapshot } : {}),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to publish optimized agent version.");
          }
          const publishedVersion = data?.version || data?.data || data?.item || data;
          return {
            ...normalizedVersion,
            ...(publishedVersion && typeof publishedVersion === "object" && !Array.isArray(publishedVersion) ? publishedVersion : {}),
            id: normalizePlaygroundFineTuningString(publishedVersion?.id || versionId),
            status: normalizePlaygroundFineTuningString(publishedVersion?.status || "published") || "published",
            snapshot: preservePlaygroundFineTuningAgentName(normalizedJob, publishedVersion?.snapshot || normalizedVersion.snapshot || safeSnapshot || {}),
            metadata: {
              ...readPlaygroundFineTuningPlainObject(normalizedVersion.metadata),
              ...readPlaygroundFineTuningPlainObject(publishedVersion?.metadata),
            },
            publishedAt: normalizePlaygroundFineTuningString(publishedVersion?.publishedAt || publishedVersion?.published_at || new Date().toISOString()),
            published_at: normalizePlaygroundFineTuningString(publishedVersion?.published_at || publishedVersion?.publishedAt || new Date().toISOString()),
          };
        }

        async function tryPersistFineTunedAgentVersion(job) {
          throw new Error("Implicit browser publication is disabled. Review and publish the draft through the version workflow.");
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!backendUrl || !normalizedJob.agentId || !normalizedJob.createdAgentVersion?.snapshot) {
            return normalizedJob;
          }
          if (isPlaygroundFineTuningAgentVersionReady(normalizedJob.agentVersionCreationStatus) && normalizePlaygroundFineTuningString(normalizedJob.createdAgentVersion?.id)) {
            const publishedVersion = await publishFineTunedAgentVersion(normalizedJob, normalizedJob.createdAgentVersion, normalizedJob.createdAgentVersion.snapshot);
            const nextJob = normalizePlaygroundFineTuningJob({
              ...normalizedJob,
              agentVersionCreationStatus: "published",
              createdAgentVersion: {
                ...normalizedJob.createdAgentVersion,
                ...publishedVersion,
                status: "published",
              },
              updatedAt: new Date().toISOString(),
            });
            notifyFineTunedAgentVersionCreated(nextJob, nextJob.createdAgentVersion);
            if (typeof onAgentsRefresh === "function") {
              await onAgentsRefresh();
            }
            notifyFineTunedAgentVersionCreated(nextJob, nextJob.createdAgentVersion);
            return nextJob;
          }
          try {
            const snapshot = preservePlaygroundFineTuningAgentName(normalizedJob, normalizedJob.createdAgentVersion.snapshot);
            const response = await fetch(String(backendUrl).replace(/\/+$/, "") + "/agents/" + encodeURIComponent(normalizedJob.agentId) + "/versions", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...(requestHeaders || {}),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                label: normalizedJob.createdAgentVersion.label || "Optimized Version",
                description: normalizedJob.createdAgentVersion.description || "Generated by optimization job " + normalizedJob.id,
                status: "published",
                source: "fine_tuning",
                fineTuningJobId: normalizedJob.id,
                snapshot,
                agent: {
                  id: normalizedJob.agentId,
                  agentId: normalizedJob.agentId,
                  name: normalizePlaygroundFineTuningString(normalizedJob.agentName || snapshot.name || "Agent") || "Agent",
                  description: snapshot.description || "",
                  model: snapshot.model || "",
                  instructions: snapshot.instructions || "",
                  enabledSkills: Array.isArray(snapshot.enabledSkills) ? snapshot.enabledSkills : [],
                  guardrailSetIds: Array.isArray(snapshot.guardrailSetIds) ? snapshot.guardrailSetIds : [],
                  guardrails: Array.isArray(snapshot.guardrails) ? snapshot.guardrails : [],
                  promptAdaptations: Array.isArray(snapshot.promptAdaptations) ? snapshot.promptAdaptations : [],
                  invisiblePromptAdaptations: Array.isArray(snapshot.invisiblePromptAdaptations) ? snapshot.invisiblePromptAdaptations : [],
                  metadata: snapshot.metadata || {},
                },
                metadata: {
                  fineTuningJobId: normalizedJob.id,
                  fine_tuning_job_id: normalizedJob.id,
                  fineTuningJobName: normalizedJob.name,
                  fine_tuning_job_name: normalizedJob.name,
                  fineTuningCreatedAt: normalizedJob.createdAt,
                  fine_tuning_created_at: normalizedJob.createdAt,
                  fineTuningUpdatedAt: normalizedJob.updatedAt,
                  fine_tuning_updated_at: normalizedJob.updatedAt,
                  fineTuningStatus: normalizedJob.status,
                  fine_tuning_status: normalizedJob.status,
                  threadId: normalizedJob.threadId,
                  thread_id: normalizedJob.threadId,
                  fineTuningThreadId: normalizedJob.threadId,
                  fine_tuning_thread_id: normalizedJob.threadId,
                  threadTitle: normalizedJob.threadTitle,
                  thread_title: normalizedJob.threadTitle,
                  targetAgentId: normalizedJob.agentId,
                  target_agent_id: normalizedJob.agentId,
                  targetAgentName: normalizedJob.agentName,
                  target_agent_name: normalizedJob.agentName,
                  targetAgentPhotoUrl: normalizedJob.agentPhotoUrl,
                  target_agent_photo_url: normalizedJob.agentPhotoUrl,
                  fineTunerAgentId: normalizedJob.fineTunerAgentId,
                  fine_tuner_agent_id: normalizedJob.fineTunerAgentId,
                  fineTunerAgentName: normalizedJob.fineTunerAgentName,
                  fine_tuner_agent_name: normalizedJob.fineTunerAgentName,
                  fineTunerAgentPhotoUrl: normalizedJob.fineTunerAgentPhotoUrl,
                  fine_tuner_agent_photo_url: normalizedJob.fineTunerAgentPhotoUrl,
                  environmentId: normalizedJob.environmentId,
                  environment_id: normalizedJob.environmentId,
                  environmentName: normalizedJob.environmentName,
                  environment_name: normalizedJob.environmentName,
                  beforeScore: normalizedJob.beforeScore,
                  before_score: normalizedJob.beforeScore,
                  afterScore: normalizedJob.afterScore,
                  after_score: normalizedJob.afterScore,
                  improvementScore: normalizedJob.improvementScore,
                  improvement_score: normalizedJob.improvementScore,
                  costUsd: normalizedJob.costUsd,
                  cost_usd: normalizedJob.costUsd,
                  fineTuningCostUsd: normalizedJob.fineTuningCostUsd,
                  fine_tuning_cost_usd: normalizedJob.fineTuningCostUsd,
                  verificationCostUsd: normalizedJob.verificationCostUsd,
                  verification_cost_usd: normalizedJob.verificationCostUsd,
                  evaluationSetIds: normalizedJob.evaluationSets.map((set) => set.id),
                  evaluation_set_ids: normalizedJob.evaluationSets.map((set) => set.id),
                  evaluationRuns: normalizedJob.evaluationRuns,
                  evaluation_runs: normalizedJob.evaluationRuns,
                  conductedBy: normalizedJob.conductedBy,
                  conducted_by: normalizedJob.conductedBy,
                  createdBy: normalizedJob.createdBy,
                  created_by: normalizedJob.createdBy,
                  beforeAgentSnapshot: normalizedJob.beforeAgentSnapshot,
                  before_agent_snapshot: normalizedJob.beforeAgentSnapshot,
                },
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Version API unavailable.");
            }
            const version = data?.version || data?.data || data?.item || data;
            const publishedVersion = await publishFineTunedAgentVersion(normalizedJob, version, snapshot);
            const nextJob = normalizePlaygroundFineTuningJob({
              ...normalizedJob,
              agentVersionCreationStatus: "published",
              createdAgentVersion: {
                ...normalizedJob.createdAgentVersion,
                ...(publishedVersion && typeof publishedVersion === "object" && !Array.isArray(publishedVersion) ? publishedVersion : {}),
                status: "published",
              },
              updatedAt: new Date().toISOString(),
            });
            notifyFineTunedAgentVersionCreated(nextJob, nextJob.createdAgentVersion);
            if (typeof onAgentsRefresh === "function") {
              await onAgentsRefresh();
            }
            notifyFineTunedAgentVersionCreated(nextJob, nextJob.createdAgentVersion);
            return nextJob;
          } catch (error) {
            return normalizePlaygroundFineTuningJob({
              ...normalizedJob,
              status: "error",
              agentVersionCreationStatus: "error",
              agentVersionError: error?.message || String(error),
              createdAgentVersion: {
                ...(normalizedJob.createdAgentVersion || {}),
                status: "error",
                error: error?.message || String(error),
              },
            });
          }
        }

`;

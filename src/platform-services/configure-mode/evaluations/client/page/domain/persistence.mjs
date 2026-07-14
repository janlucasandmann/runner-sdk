export const EVALUATIONS_PAGE_PERSISTENCE_SCRIPT = String.raw`      function readPlaygroundEvaluationSetsFromStorage() {
        if (typeof window === "undefined" || !window.localStorage) {
          return [];
        }
        try {
          const parsed = JSON.parse(window.localStorage.getItem(PLAYGROUND_EVALUATIONS_STORAGE_KEY) || "[]");
          return Array.isArray(parsed)
            ? parsed.map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set)))
            : [];
        } catch {
          return [];
        }
      }

      function writePlaygroundEvaluationSetsToStorage(sets) {
        if (typeof window === "undefined" || !window.localStorage) {
          return;
        }
        try {
          window.localStorage.setItem(
            PLAYGROUND_EVALUATIONS_STORAGE_KEY,
            JSON.stringify((Array.isArray(sets) ? sets : []).map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set))))
          );
        } catch {
          // Ignore storage write failures; the in-memory editor should remain usable.
        }
      }

      function readPlaygroundEvaluationListFromPayload(payload, keys = []) {
        const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
        for (const key of keys) {
          if (Array.isArray(source[key])) return source[key];
          if (Array.isArray(source.data?.[key])) return source.data[key];
        }
        if (Array.isArray(source.data)) return source.data;
        if (Array.isArray(source.items)) return source.items;
        if (Array.isArray(source.records)) return source.records;
        return [];
      }

      function buildPlaygroundEvaluationBackendMetadata(set) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set);
        const existingMetadata = stripPlaygroundEvaluationVersionMetadata(normalizedSet.metadata);
        const creator = normalizePlaygroundEvaluationPersonIdentity(normalizedSet.creator || normalizedSet.createdBy || {});
        return {
          ...(existingMetadata && typeof existingMetadata === "object" && !Array.isArray(existingMetadata) ? existingMetadata : {}),
          evaluationGuidance: normalizedSet.evaluationGuidance,
          evaluation_guidance: normalizedSet.evaluationGuidance,
          passThreshold: normalizedSet.passThreshold,
          pass_threshold: normalizedSet.passThreshold,
          evaluator: normalizePlaygroundEvaluationEvaluator(normalizedSet.evaluator),
          targetAgentId: normalizedSet.targetAgentId,
          target_agent_id: normalizedSet.targetAgentId,
          environmentType: normalizedSet.environmentType,
          environment_type: normalizedSet.environmentType,
          environmentId: normalizedSet.environmentId,
          environment_id: normalizedSet.environmentId,
          projectId: normalizedSet.projectId,
          project_id: normalizedSet.projectId,
          creator,
          createdBy: creator,
          created_by: creator,
        };
      }

      function buildPlaygroundEvaluationBackendPayload(set) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set);
        return {
          id: normalizedSet.id,
          name: normalizedSet.name,
          description: normalizedSet.description,
          cases: normalizedSet.dataRows.map((row, index) => normalizePlaygroundEvaluationDataRow(row, index)),
          metadata: buildPlaygroundEvaluationBackendMetadata(normalizedSet),
        };
      }

      function buildPlaygroundEvaluationRunBackendPayload(run) {
        const normalizedRun = normalizePlaygroundEvaluationRun(run);
        return {
          id: normalizedRun.id,
          runId: normalizedRun.id,
          run_id: normalizedRun.id,
          agentId: normalizedRun.targetAgentId,
          agent_id: normalizedRun.targetAgentId,
          environmentId: normalizedRun.environmentId,
          environment_id: normalizedRun.environmentId,
          computerId: normalizedRun.environmentType === "computer" ? normalizedRun.environmentId : "",
          computer_id: normalizedRun.environmentType === "computer" ? normalizedRun.environmentId : "",
          versionId: normalizedRun.evaluationVersionId,
          version_id: normalizedRun.evaluationVersionId,
          status: normalizedRun.status,
          averageScore: normalizedRun.averageScore,
          average_score: normalizedRun.averageScore,
          passRate: normalizedRun.totalCount > 0 ? normalizedRun.passedCount / normalizedRun.totalCount : 0,
          pass_rate: normalizedRun.totalCount > 0 ? normalizedRun.passedCount / normalizedRun.totalCount : 0,
          costCt: normalizedRun.costTokens,
          cost_ct: normalizedRun.costTokens,
          costUsd: normalizedRun.costUsd,
          cost_usd: normalizedRun.costUsd,
          metadata: {
            ...(normalizedRun.metadata && typeof normalizedRun.metadata === "object" && !Array.isArray(normalizedRun.metadata) ? normalizedRun.metadata : {}),
            fineTuningJobId: normalizedRun.fineTuningJobId,
            fine_tuning_job_id: normalizedRun.fine_tuning_job_id,
            targetAgentVersionId: normalizedRun.targetAgentVersionId,
            target_agent_version_id: normalizedRun.targetAgentVersionId,
            targetAgentVersionNumber: normalizedRun.targetAgentVersionNumber,
            target_agent_version_number: normalizedRun.targetAgentVersionNumber,
            targetAgentVersionLabel: normalizedRun.targetAgentVersionLabel,
            target_agent_version_label: normalizedRun.targetAgentVersionLabel,
            run: normalizedRun,
          },
          run: normalizedRun,
        };
      }

      function mergePlaygroundEvaluationSetWithBackendDetails(set, versions = [], runs = []) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set);
        const normalizedRuns = (Array.isArray(runs) ? runs : [])
          .map((run, index) => normalizePlaygroundEvaluationRun(run, index))
          .filter((run) => run.id);
        const normalizedVersions = normalizePlaygroundEvaluationVersions(versions);
        const setWithRuns = normalizePlaygroundEvaluationSet({
          ...normalizedSet,
          runs: normalizedRuns,
        });
        return ensurePlaygroundEvaluationInitialVersion(
          normalizedVersions.length
            ? createPlaygroundEvaluationWithVersionList(setWithRuns, normalizedVersions)
            : setWithRuns
        );
      }

`;


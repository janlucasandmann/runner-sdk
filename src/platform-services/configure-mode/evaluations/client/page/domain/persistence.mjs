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

      const PLAYGROUND_EVALUATION_RUN_HISTORY_CACHE_PREFIX = "runner_evaluation_run_history_v1:";
      const PLAYGROUND_EVALUATION_RUN_HISTORY_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
      const PLAYGROUND_EVALUATION_RUN_HISTORY_CACHE_MAX_SETS = 100;
      const PLAYGROUND_EVALUATION_RUN_HISTORY_CACHE_MAX_RUNS_PER_SET = 50;

      function getPlaygroundEvaluationRequestHeaderValue(headers, names) {
        const normalizedNames = (Array.isArray(names) ? names : [names])
          .map((name) => String(name || "").trim().toLowerCase())
          .filter(Boolean);
        try {
          const normalizedHeaders = new Headers(headers || {});
          for (const name of normalizedNames) {
            const value = String(normalizedHeaders.get(name) || "").trim();
            if (value) return value;
          }
        } catch {
          // An invalid optional header collection should not disable evaluation loading.
        }
        return "";
      }

      function hashPlaygroundEvaluationCacheScope(value) {
        let hash = 2166136261;
        const source = String(value || "");
        for (let index = 0; index < source.length; index += 1) {
          hash ^= source.charCodeAt(index);
          hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(36);
      }

      function buildPlaygroundEvaluationRunHistoryCacheScope(options = {}) {
        const backendUrl = String(options.backendUrl || "").replace(/\/+$/, "");
        const identity = String(options.userId || options.userEmail || "").trim().toLowerCase();
        if (!backendUrl || !identity) return "";
        const organizationId = getPlaygroundEvaluationRequestHeaderValue(options.requestHeaders, [
          "x-organization-id",
          "x-organization",
          "organization-id",
        ]);
        return PLAYGROUND_EVALUATION_RUN_HISTORY_CACHE_PREFIX
          + hashPlaygroundEvaluationCacheScope([backendUrl, organizationId, identity].join("|"));
      }

      function compactPlaygroundEvaluationRunForCache(run) {
        const normalizedRun = normalizePlaygroundEvaluationRun(run);
        return {
          id: normalizedRun.id,
          evaluationId: normalizedRun.evaluationSetId,
          evaluationSetId: normalizedRun.evaluationSetId,
          label: normalizedRun.label,
          status: normalizedRun.status,
          targetAgentId: normalizedRun.targetAgentId,
          targetAgentName: normalizedRun.targetAgentName,
          targetAgentAvatarUrl: normalizedRun.targetAgentAvatarUrl,
          environmentType: normalizedRun.environmentType,
          environmentId: normalizedRun.environmentId,
          environmentName: normalizedRun.environmentName,
          projectId: normalizedRun.projectId,
          projectName: normalizedRun.projectName,
          evaluationVersionId: normalizedRun.evaluationVersionId,
          evaluationVersionNumber: normalizedRun.evaluationVersionNumber,
          evaluationVersionLabel: normalizedRun.evaluationVersionLabel,
          targetAgentVersionId: normalizedRun.targetAgentVersionId,
          targetAgentVersionNumber: normalizedRun.targetAgentVersionNumber,
          targetAgentVersionLabel: normalizedRun.targetAgentVersionLabel,
          averageScore: normalizedRun.averageScore,
          passedCount: normalizedRun.passedCount,
          totalCount: normalizedRun.totalCount,
          costTokens: normalizedRun.costTokens,
          costUsd: normalizedRun.costUsd,
          passThreshold: normalizedRun.passThreshold,
          createdAt: normalizedRun.createdAt,
          updatedAt: normalizedRun.updatedAt,
          completedAt: normalizedRun.completedAt,
          cases: [],
        };
      }

      function deduplicatePlaygroundEvaluationRuns(runs = []) {
        const runById = new Map();
        (Array.isArray(runs) ? runs : []).forEach((run, index) => {
          const normalizedRun = normalizePlaygroundEvaluationRun(run, index);
          if (!normalizedRun.id) return;
          const existingRun = runById.get(normalizedRun.id);
          const existingUpdatedAt = Date.parse(existingRun?.updatedAt || existingRun?.completedAt || existingRun?.createdAt || 0) || 0;
          const nextUpdatedAt = Date.parse(normalizedRun.updatedAt || normalizedRun.completedAt || normalizedRun.createdAt || 0) || 0;
          if (!existingRun || nextUpdatedAt >= existingUpdatedAt) {
            runById.set(normalizedRun.id, normalizedRun);
          }
        });
        return Array.from(runById.values()).sort((left, right) => (
          (Date.parse(right.createdAt || right.updatedAt || 0) || 0)
          - (Date.parse(left.createdAt || left.updatedAt || 0) || 0)
        ));
      }

      function resolvePlaygroundEvaluationRunHistorySnapshot(options = {}) {
        if (options.historyLoadSucceeded === true) {
          return deduplicatePlaygroundEvaluationRuns(options.backendRuns);
        }
        const currentSetById = new Map(
          deduplicatePlaygroundEvaluationSets(options.currentSets).map((set) => [set.id, set])
        );
        const cachedRunsBySet = options.cachedRunsBySet
          && typeof options.cachedRunsBySet === "object"
          && !Array.isArray(options.cachedRunsBySet)
            ? options.cachedRunsBySet
            : {};
        return deduplicatePlaygroundEvaluationSets(options.backendSets).flatMap((set) => (
          deduplicatePlaygroundEvaluationRuns([
            ...(Array.isArray(currentSetById.get(set.id)?.runs) ? currentSetById.get(set.id).runs : []),
            ...(Array.isArray(cachedRunsBySet[set.id]) ? cachedRunsBySet[set.id] : []),
          ])
        ));
      }

      function readPlaygroundEvaluationRunHistoryCache(scopeKey) {
        const normalizedScopeKey = String(scopeKey || "").trim();
        if (!normalizedScopeKey || typeof window === "undefined" || !window.localStorage) return {};
        try {
          const parsed = JSON.parse(window.localStorage.getItem(normalizedScopeKey) || "null");
          const updatedAt = Math.max(0, Number(parsed?.updatedAt || 0));
          if (
            !parsed
            || parsed.version !== 1
            || !parsed.runsBySet
            || typeof parsed.runsBySet !== "object"
            || Array.isArray(parsed.runsBySet)
            || !updatedAt
            || Date.now() - updatedAt > PLAYGROUND_EVALUATION_RUN_HISTORY_CACHE_MAX_AGE_MS
          ) {
            if (parsed) window.localStorage.removeItem(normalizedScopeKey);
            return {};
          }
          return Object.fromEntries(
            Object.entries(parsed.runsBySet).map(([setId, runs]) => [
              String(setId || "").trim(),
              deduplicatePlaygroundEvaluationRuns(runs),
            ]).filter(([setId]) => Boolean(setId))
          );
        } catch {
          return {};
        }
      }

      function writePlaygroundEvaluationRunHistoryCache(scopeKey, sets) {
        const normalizedScopeKey = String(scopeKey || "").trim();
        if (!normalizedScopeKey || typeof window === "undefined" || !window.localStorage) return;
        const runsBySet = {};
        deduplicatePlaygroundEvaluationSets(sets)
          .filter((set) => set.id)
          .slice(0, PLAYGROUND_EVALUATION_RUN_HISTORY_CACHE_MAX_SETS)
          .forEach((set) => {
            runsBySet[set.id] = deduplicatePlaygroundEvaluationRuns(set.runs)
              .slice(0, PLAYGROUND_EVALUATION_RUN_HISTORY_CACHE_MAX_RUNS_PER_SET)
              .map((run) => compactPlaygroundEvaluationRunForCache(run));
          });
        try {
          window.localStorage.setItem(normalizedScopeKey, JSON.stringify({
            version: 1,
            updatedAt: Date.now(),
            runsBySet,
          }));
        } catch {
          // Run history remains durable on the backend if browser storage is unavailable.
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

      function getPlaygroundEvaluationCreationRequestId(set) {
        const metadata = set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata)
          ? set.metadata
          : {};
        return String(
          metadata.clientRequestId
          || metadata.client_request_id
          || metadata.creationRequestId
          || metadata.creation_request_id
          || ""
        ).trim();
      }

      function getPlaygroundEvaluationRecordPriority(set) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set);
        const versions = readPlaygroundEvaluationVersions(normalizedSet);
        const updatedAt = Date.parse(normalizedSet.updatedAt || normalizedSet.createdAt || 0) || 0;
        return (
          versions.length * 1000000
          + normalizedSet.dataRows.length * 10000
          + normalizedSet.runs.length * 100
          + Math.min(updatedAt, 9999999999999) / 10000000000000
        );
      }

      function deduplicatePlaygroundEvaluationSets(sets) {
        const deduplicated = [];
        const indexById = new Map();
        const indexByCreationRequestId = new Map();
        (Array.isArray(sets) ? sets : []).forEach((set) => {
          const normalizedSet = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set));
          if (!normalizedSet.id) return;
          const creationRequestId = getPlaygroundEvaluationCreationRequestId(normalizedSet);
          const existingIndex = indexById.has(normalizedSet.id)
            ? indexById.get(normalizedSet.id)
            : creationRequestId && indexByCreationRequestId.has(creationRequestId)
              ? indexByCreationRequestId.get(creationRequestId)
              : -1;
          if (existingIndex >= 0) {
            const existingSet = deduplicated[existingIndex];
            if (getPlaygroundEvaluationRecordPriority(normalizedSet) > getPlaygroundEvaluationRecordPriority(existingSet)) {
              deduplicated[existingIndex] = normalizedSet;
            }
            indexById.set(normalizedSet.id, existingIndex);
            if (creationRequestId) {
              indexByCreationRequestId.set(creationRequestId, existingIndex);
            }
            return;
          }
          const nextIndex = deduplicated.length;
          deduplicated.push(normalizedSet);
          indexById.set(normalizedSet.id, nextIndex);
          if (creationRequestId) {
            indexByCreationRequestId.set(creationRequestId, nextIndex);
          }
        });
        return deduplicated;
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
          evaluationId: normalizedRun.evaluationSetId,
          evaluation_id: normalizedRun.evaluationSetId,
          evaluationSetId: normalizedRun.evaluationSetId,
          evaluation_set_id: normalizedRun.evaluationSetId,
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
            targetGuardrailId: normalizedRun.targetGuardrailId,
            target_guardrail_id: normalizedRun.targetGuardrailId,
            targetGuardrailName: normalizedRun.targetGuardrailName,
            target_guardrail_name: normalizedRun.targetGuardrailName,
            targetGuardrailVersionId: normalizedRun.targetGuardrailVersionId,
            target_guardrail_version_id: normalizedRun.targetGuardrailVersionId,
            targetGuardrailVersionNumber: normalizedRun.targetGuardrailVersionNumber,
            target_guardrail_version_number: normalizedRun.targetGuardrailVersionNumber,
            targetGuardrailVersionLabel: normalizedRun.targetGuardrailVersionLabel,
            target_guardrail_version_label: normalizedRun.targetGuardrailVersionLabel,
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

      function mergePlaygroundEvaluationRunHistory(set, runs = [], options = {}) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set);
        const normalizedSetId = String(normalizedSet.id || "").trim();
        const backendRuns = (Array.isArray(runs) ? runs : [])
          .map((run, index) => normalizePlaygroundEvaluationRun(run, index))
          .filter((run) => (
            run.id
            && (
              !normalizedSetId
              || String(run.evaluationSetId || run.evaluationId || "").trim() === normalizedSetId
            )
          ));
        const backendRunIds = new Set(backendRuns.map((run) => run.id));
        const nowMs = Number(options.nowMs) || Date.now();
        const preserveRecentLocalMs = Math.max(0, Number(options.preserveRecentLocalMs ?? 300000) || 0);
        const activeCaseStatuses = new Set([
          "queued",
          "running",
          "running_case",
          "waiting_for_case_summary",
          "running_evaluator",
          "scoring",
        ]);
        const localFallbackRuns = normalizedSet.runs.filter((run) => {
          if (!run.id || backendRunIds.has(run.id)) return false;
          const status = String(run.status || "").trim().toLowerCase();
          const hasActiveCase = Array.isArray(run.cases) && run.cases.some((caseItem) => (
            activeCaseStatuses.has(String(caseItem?.status || "").trim().toLowerCase())
          ));
          if (status === "running" || hasActiveCase) return true;
          const createdAtMs = Date.parse(run.createdAt || run.updatedAt || 0) || 0;
          return preserveRecentLocalMs > 0 && createdAtMs > 0 && nowMs - createdAtMs <= preserveRecentLocalMs;
        });
        const mergedRuns = [...backendRuns, ...localFallbackRuns]
          .sort((left, right) => (
            (Date.parse(right.createdAt || right.updatedAt || 0) || 0)
            - (Date.parse(left.createdAt || left.updatedAt || 0) || 0)
          ));
        return normalizePlaygroundEvaluationSet({
          ...normalizedSet,
          runs: mergedRuns,
        });
      }

`;

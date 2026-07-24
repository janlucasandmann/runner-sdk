export const FINE_TUNING_PAGE_EVALUATIONS_SCRIPT = String.raw`      function getPlaygroundFineTuningEvaluationVersions(set) {
        if (typeof readPlaygroundEvaluationVersions === "function") {
          return readPlaygroundEvaluationVersions(set);
        }
        const metadata = set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata) ? set.metadata : {};
        const rawVersions = set?.evaluationVersions || set?.evaluation_versions || set?.versions || metadata.evaluationVersions || metadata.evaluation_versions || metadata.versions || [];
        return Array.isArray(rawVersions) ? rawVersions : [];
      }

      function readPlaygroundFineTuningEvaluationListFromPayload(payload, keys = []) {
        const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
        for (const key of Array.isArray(keys) ? keys : []) {
          if (Array.isArray(source[key])) return source[key];
          if (Array.isArray(source.data?.[key])) return source.data[key];
        }
        if (Array.isArray(source.data)) return source.data;
        if (Array.isArray(source.items)) return source.items;
        if (Array.isArray(source.records)) return source.records;
        return [];
      }

      function normalizePlaygroundFineTuningEvaluationSet(set, fallbackIndex = 0) {
        const normalized = typeof normalizePlaygroundEvaluationSet === "function"
          ? normalizePlaygroundEvaluationSet(set)
          : {
              ...(set || {}),
              id: normalizePlaygroundFineTuningString(set?.id || "evaluation_" + (fallbackIndex + 1)),
              name: normalizePlaygroundFineTuningString(set?.name || set?.title || "Evaluation " + (fallbackIndex + 1)),
              dataRows: Array.isArray(set?.dataRows) ? set.dataRows : [],
              runs: Array.isArray(set?.runs) ? set.runs : [],
            };
        return normalized;
      }

      function mergePlaygroundFineTuningEvaluationRuns(...runLists) {
        const byId = new Map();
        runLists.flatMap((runs) => Array.isArray(runs) ? runs : []).forEach((run, index) => {
          const source = run && typeof run === "object" && !Array.isArray(run) ? run : {};
          const cases = Array.isArray(source.cases) ? source.cases : [];
          const averageScore = Number(source.averageScore ?? source.average_score);
          const fallbackRunCostUsd = readPlaygroundFineTuningUsdCostWithLegacyCt(source);
          const fallbackRunCostTokens = normalizePlaygroundFineTuningTokenCount(
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
          ) || normalizePlaygroundFineTuningTokenCount(fallbackRunCostUsd * PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR);
          const normalizedRun = typeof normalizePlaygroundEvaluationRun === "function"
            ? normalizePlaygroundEvaluationRun(source, index)
            : {
                ...source,
                id: normalizePlaygroundFineTuningString(source.id || source.runId || source.run_id),
                label: normalizePlaygroundFineTuningString(source.label || source.name || "Run"),
                averageScore: Number.isFinite(averageScore)
                  ? normalizePlaygroundFineTuningScore(averageScore)
                  : cases.length
                    ? normalizePlaygroundFineTuningScore(cases.reduce((sum, item) => sum + Number(item?.score || 0), 0) / cases.length)
                    : 0,
                costTokens: fallbackRunCostTokens,
                costUsd: fallbackRunCostUsd,
                status: normalizePlaygroundFineTuningString(source.status || "queued") || "queued",
              };
          const id = normalizePlaygroundFineTuningString(normalizedRun.id || run?.id || run?.runId || run?.run_id || "run_" + (index + 1));
          if (!id) return;
          byId.set(id, {
            ...(byId.get(id) || {}),
            ...run,
            ...normalizedRun,
            id,
          });
        });
        return Array.from(byId.values()).sort((left, right) => {
          const leftTime = Date.parse(left?.createdAt || left?.created_at || left?.completedAt || left?.completed_at || left?.updatedAt || left?.updated_at || 0) || 0;
          const rightTime = Date.parse(right?.createdAt || right?.created_at || right?.completedAt || right?.completed_at || right?.updatedAt || right?.updated_at || 0) || 0;
          return rightTime - leftTime;
        });
      }

      function getPlaygroundFineTuningRunEvaluationSetId(run) {
        const source = run && typeof run === "object" && !Array.isArray(run) ? run : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
          ? source.metadata
          : {};
        return normalizePlaygroundFineTuningString(
          source.evaluationSetId
          || source.evaluation_set_id
          || source.evaluationId
          || source.evaluation_id
          || metadata.evaluationSetId
          || metadata.evaluation_set_id
          || metadata.evaluationId
          || metadata.evaluation_id
        );
      }

      function mergePlaygroundFineTuningEvaluationSources(currentSets = [], backendSets = [], backendRuns = []) {
        const normalizedCurrentSets = (Array.isArray(currentSets) ? currentSets : [])
          .map((set, index) => normalizePlaygroundFineTuningEvaluationSet(set, index))
          .filter((set) => normalizePlaygroundFineTuningString(set?.id));
        const normalizedBackendSets = (Array.isArray(backendSets) ? backendSets : [])
          .map((set, index) => normalizePlaygroundFineTuningEvaluationSet(set, index))
          .filter((set) => normalizePlaygroundFineTuningString(set?.id));
        if (!normalizedBackendSets.length) {
          return normalizedCurrentSets.map((set, index) => resolvePlaygroundFineTuningPublishedEvaluationSource(set, index));
        }
        const currentById = new Map(normalizedCurrentSets.map((set) => [
          normalizePlaygroundFineTuningString(set.id),
          set,
        ]));
        const runsBySetId = new Map();
        (Array.isArray(backendRuns) ? backendRuns : []).forEach((run) => {
          const setId = getPlaygroundFineTuningRunEvaluationSetId(run);
          if (!setId) return;
          const setRuns = runsBySetId.get(setId) || [];
          setRuns.push(run);
          runsBySetId.set(setId, setRuns);
        });
        return normalizedBackendSets
          .map((backendSet, index) => {
            const setId = normalizePlaygroundFineTuningString(backendSet.id);
            const currentSet = currentById.get(setId) || {};
            return resolvePlaygroundFineTuningPublishedEvaluationSource({
              ...currentSet,
              ...backendSet,
              runs: mergePlaygroundFineTuningEvaluationRuns(
                runsBySetId.get(setId),
                backendSet.runs,
                currentSet.runs
              ),
            }, index);
          })
          .sort((left, right) => (
            (Date.parse(right?.updatedAt || right?.updated_at || right?.createdAt || right?.created_at || 0) || 0)
            - (Date.parse(left?.updatedAt || left?.updated_at || left?.createdAt || left?.created_at || 0) || 0)
          ));
      }

      function resolvePlaygroundFineTuningPublishedEvaluationSource(set, fallbackIndex = 0) {
        const normalizedSet = normalizePlaygroundFineTuningEvaluationSet(set, fallbackIndex);
        const versions = getPlaygroundFineTuningEvaluationVersions(normalizedSet);
        const activeVersion = (Array.isArray(versions) ? versions : []).find((version) => String(version?.status || "").trim() === "active")
          || (Array.isArray(versions) ? versions : [])[0]
          || null;
        if (activeVersion?.snapshot && typeof createPlaygroundEvaluationFromVersionSnapshot === "function") {
          const versionedSet = createPlaygroundEvaluationFromVersionSnapshot(normalizedSet, activeVersion, versions, activeVersion.id);
          const normalizedVersionedSet = normalizePlaygroundFineTuningEvaluationSet(versionedSet, fallbackIndex);
          return {
            ...normalizedVersionedSet,
            runs: mergePlaygroundFineTuningEvaluationRuns(normalizedVersionedSet.runs, normalizedSet.runs),
            activeVersionId: normalizePlaygroundFineTuningString(activeVersion.id),
            activeVersionNumber: Math.max(0, Number(activeVersion.version || 0) || 0),
            activeVersionLabel: normalizePlaygroundFineTuningString(activeVersion.label || (activeVersion.version ? "Version " + activeVersion.version : "")),
          };
        }
        return {
          ...normalizedSet,
          activeVersionId: normalizePlaygroundFineTuningString(activeVersion?.id || normalizedSet?.metadata?.activeEvaluationVersionId || normalizedSet?.metadata?.active_evaluation_version_id),
          activeVersionNumber: Math.max(0, Number(activeVersion?.version || normalizedSet?.metadata?.activeEvaluationVersionNumber || normalizedSet?.metadata?.active_evaluation_version_number || 0) || 0),
          activeVersionLabel: normalizePlaygroundFineTuningString(activeVersion?.label || ""),
        };
      }

      function getPlaygroundFineTuningLatestRun(set) {
        const runs = Array.isArray(set?.runs) ? set.runs : [];
        return runs.slice().sort((left, right) => {
          const leftTime = Date.parse(left?.createdAt || left?.created_at || left?.completedAt || left?.completed_at || 0) || 0;
          const rightTime = Date.parse(right?.createdAt || right?.created_at || right?.completedAt || right?.completed_at || 0) || 0;
          return rightTime - leftTime;
        })[0] || null;
      }

      function getPlaygroundFineTuningRuns(set) {
        return (Array.isArray(set?.runs) ? set.runs : [])
          .map((run, index) => ({
            ...run,
            id: normalizePlaygroundFineTuningString(run?.id || run?.runId || run?.run_id || "run_" + (index + 1)),
            label: normalizePlaygroundFineTuningString(run?.label || run?.name || run?.title || "Run " + (index + 1)),
          }))
          .filter((run) => run.id)
          .sort((left, right) => {
            const leftTime = Date.parse(left?.createdAt || left?.created_at || left?.completedAt || left?.completed_at || 0) || 0;
            const rightTime = Date.parse(right?.createdAt || right?.created_at || right?.completedAt || right?.completed_at || 0) || 0;
            return rightTime - leftTime;
          });
      }

      function getPlaygroundFineTuningRunById(set, runId) {
        const normalizedRunId = normalizePlaygroundFineTuningString(runId);
        return getPlaygroundFineTuningRuns(set).find((run) => run.id === normalizedRunId) || null;
      }

      function getPlaygroundFineTuningEvaluationScore(set) {
        const run = getPlaygroundFineTuningLatestRun(set);
        if (!run) return 0;
        if (Number.isFinite(Number(run.averageScore ?? run.average_score))) {
          return normalizePlaygroundFineTuningScore(run.averageScore ?? run.average_score);
        }
        const cases = Array.isArray(run.cases) ? run.cases : [];
        return cases.length
          ? normalizePlaygroundFineTuningScore(cases.reduce((sum, item) => sum + Number(item?.score || 0), 0) / cases.length)
          : 0;
      }

      function buildPlaygroundFineTuningDiffFiles(job) {
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        const rawFiles = Array.isArray(normalizedJob.diffFiles) && normalizedJob.diffFiles.length
          ? normalizedJob.diffFiles
          : [
              {
                id: "instructions",
                filePath: "agent/instructions.md",
                beforeContent: String(normalizedJob.beforeAgentSnapshot?.instructions || ""),
                afterContent: String(normalizedJob.afterAgentSnapshot?.instructions || ""),
              },
              {
                id: "configuration",
                filePath: "agent/configuration.json",
                beforeContent: JSON.stringify({
                  model: normalizedJob.beforeAgentSnapshot?.model || "",
                  enabledSkills: normalizedJob.beforeAgentSnapshot?.enabledSkills || [],
                  guardrails: normalizedJob.beforeAgentSnapshot?.guardrails || [],
                }, null, 2) + "\n",
                afterContent: JSON.stringify({
                  model: normalizedJob.afterAgentSnapshot?.model || "",
                  enabledSkills: normalizedJob.afterAgentSnapshot?.enabledSkills || [],
                  guardrails: normalizedJob.afterAgentSnapshot?.guardrails || [],
                }, null, 2) + "\n",
              },
            ];
        return rawFiles.map((file) => {
          if (typeof createPlaygroundVersionDiffFile === "function") {
            return createPlaygroundVersionDiffFile({
              id: file.id || file.filePath,
              path: file.filePath || file.path || file.label,
              beforeContent: file.beforeContent ?? file.before,
              afterContent: file.afterContent ?? file.after,
            });
          }
          return {
            id: file.id || file.filePath,
            filePath: file.filePath || file.path || "agent/change.txt",
            diffContent: file.diffContent || "",
            fileContent: file.afterContent || "",
            additions: 0,
            deletions: 0,
          };
        }).filter(Boolean);
      }

`;

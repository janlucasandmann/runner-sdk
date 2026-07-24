export const EVALUATIONS_PAGE_CONTROLLER_RUN_HISTORY_SCRIPT = String.raw`        async function reloadBackendEvaluationRunHistory(setId, options = {}) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId || typeof setEvaluationSets !== "function") return [];
          const previousToken = Number(evaluationRunHistoryRequestTokenRef.current.get(normalizedSetId) || 0);
          const requestToken = previousToken + 1;
          evaluationRunHistoryRequestTokenRef.current.set(normalizedSetId, requestToken);
          let payload = null;
          try {
            payload = await requestBackendEvaluationRunHistory(
              "/evaluations/runs?evaluationId=" + encodeURIComponent(normalizedSetId) + "&limit=500",
              { maxAttempts: Math.max(1, Number(options.maxAttempts) || 3) }
            );
          } catch (error) {
            setEvaluationRunHistorySyncState({ status: "error", error: error?.message || String(error) });
            scheduleEvaluationRunHistoryRetry();
            throw error;
          }
          if (evaluationRunHistoryRequestTokenRef.current.get(normalizedSetId) !== requestToken) {
            return [];
          }
          const backendRuns = readPlaygroundEvaluationListFromPayload(payload || {}, ["runs", "evaluationRuns", "evaluation_runs"])
            .map((run, index) => {
              const normalizedRun = normalizePlaygroundEvaluationRun(run, index);
              return normalizedRun.evaluationSetId
                ? normalizedRun
                : normalizePlaygroundEvaluationRun({
                    ...normalizedRun,
                    evaluationId: normalizedSetId,
                    evaluationSetId: normalizedSetId,
                  }, index);
            })
            .filter((run) => run.id);
          markEvaluationRunHistoryLoaded([normalizedSetId]);
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalizedSet = normalizePlaygroundEvaluationSet(item);
            return normalizedSet.id === normalizedSetId
              ? mergePlaygroundEvaluationRunHistory(normalizedSet, backendRuns)
              : normalizedSet;
          }));
          return backendRuns;
        }

`;

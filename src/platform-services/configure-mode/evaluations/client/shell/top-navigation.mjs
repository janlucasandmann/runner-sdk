export const EVALUATIONS_APP_TOP_NAVIGATION_SCRIPT = `        function renderEvaluationsPageNav() {
          const activeEvaluationSet = (Array.isArray(evaluationSets) ? evaluationSets : [])
            .map((set) => normalizePlaygroundEvaluationSet(set))
            .find((set) => set?.id === selectedEvaluationSetId);
          const activeEvaluationRun = activeEvaluationSet?.runs?.find((run) => run?.id === selectedEvaluationRunId);
          const evaluationsPathItems = [{ label: "Configure" }, { label: "Evaluations" }];
          const showEvaluationSetActions = evaluationsPageMode === "detail" && Boolean(activeEvaluationSet?.id) && !isResourcesVersionsDrawerOpen;
          if ((evaluationsPageMode === "detail" || evaluationsPageMode === "run") && activeEvaluationSet?.name) {
            evaluationsPathItems.push({ label: activeEvaluationSet.name });
          }
          if (evaluationsPageMode === "run" && activeEvaluationRun?.label) {
            evaluationsPathItems.push({ label: activeEvaluationRun.label });
          }
          return renderUnifiedTopNav({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: evaluationsPathItems,
            includeSearchDivider: showEvaluationSetActions,
            extraActions: showEvaluationSetActions
              ? React.createElement("div", {
                  id: "playground-evaluations-nav-actions",
                  className: "playground-evaluations-nav-actions",
                })
              : null,
            hideCommonActions: isResourcesVersionsDrawerOpen,
          });
        }

`;

export const EVALUATIONS_APP_TOP_NAVIGATION_SCRIPT = `        function renderEvaluationsPageNav() {
          const activeEvaluationSet = (Array.isArray(evaluationSets) ? evaluationSets : [])
            .map((set) => normalizePlaygroundEvaluationSet(set))
            .find((set) => set?.id === selectedEvaluationSetId);
          const activeEvaluationRun = activeEvaluationSet?.runs?.find((run) => run?.id === selectedEvaluationRunId);
          const evaluationsPathItems = [{ label: "Configure" }, { label: "Evaluations" }];
          const isEvaluationsOverview = evaluationsPageMode === "overview";
          const showEvaluationSetActions = evaluationsPageMode === "detail" && Boolean(activeEvaluationSet?.id) && !isResourcesVersionsDrawerOpen;
          if ((evaluationsPageMode === "detail" || evaluationsPageMode === "run") && activeEvaluationSet?.name) {
            evaluationsPathItems.push({ label: activeEvaluationSet.name });
          }
          if (evaluationsPageMode === "run" && activeEvaluationRun?.label) {
            evaluationsPathItems.push({ label: activeEvaluationRun.label });
          }
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: evaluationsPathItems,
            includeSearchDivider: isEvaluationsOverview || showEvaluationSetActions,
            extraActions: isEvaluationsOverview
              ? React.createElement("div", {
                  id: "playground-evaluations-overview-controls",
                  className: "playground-tools-overview-controls-slot",
                })
              : showEvaluationSetActions
                ? React.createElement("div", {
                    id: "playground-evaluations-nav-actions",
                    className: "playground-evaluations-nav-actions",
                  })
                : null,
            hideCommonActions: isResourcesVersionsDrawerOpen,
          });
        }

`;

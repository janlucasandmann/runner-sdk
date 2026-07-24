export const EVALUATIONS_APP_TOP_NAVIGATION_SCRIPT = `        function renderEvaluationsPageNav() {
          const activeEvaluationSet = (Array.isArray(evaluationSets) ? evaluationSets : [])
            .map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set)))
            .find((set) => set?.id === selectedEvaluationSetId);
          const activeEvaluationRun = activeEvaluationSet?.runs?.find((run) => run?.id === selectedEvaluationRunId);
          const activeEvaluationCaseIndex = Array.isArray(activeEvaluationRun?.cases)
            ? activeEvaluationRun.cases.findIndex((caseItem) => caseItem?.id === selectedEvaluationCaseId)
            : -1;
          const activeEvaluationCase = activeEvaluationCaseIndex >= 0
            ? activeEvaluationRun.cases[activeEvaluationCaseIndex]
            : null;
          const activeEvaluationCaseTitle = activeEvaluationCase
            ? String(
                activeEvaluationCase.title
                || activeEvaluationCase.label
                || activeEvaluationCase.name
                || ""
              ).trim() || ("Case " + (activeEvaluationCaseIndex + 1))
            : "";
          const evaluationVersions = activeEvaluationSet ? readPlaygroundEvaluationVersions(activeEvaluationSet) : [];
          const evaluationVersionMetadata = activeEvaluationSet?.metadata && typeof activeEvaluationSet.metadata === "object"
            ? activeEvaluationSet.metadata
            : {};
          const selectedEvaluationVersionId = String(
            evaluationVersionMetadata.restoredFromEvaluationVersionId
            || evaluationVersionMetadata.restored_from_evaluation_version_id
            || evaluationVersionMetadata.activeEvaluationVersionId
            || evaluationVersionMetadata.active_evaluation_version_id
            || ""
          ).trim();
          const selectedEvaluationVersion = evaluationVersions.find((version) => version.id === selectedEvaluationVersionId)
            || evaluationVersions.find((version) => version.status === "active")
            || evaluationVersions[0]
            || null;
          const latestEvaluationVersionNumber = evaluationVersions.reduce((latestVersion, version) => {
            const versionNumber = Number(version?.version);
            return Number.isFinite(versionNumber) ? Math.max(latestVersion, versionNumber) : latestVersion;
          }, -1);
          const evaluationsPathItems = [
            { label: "Configure" },
            {
              label: "Evaluations",
              onClick: openEvaluationsOverviewPage,
            },
          ];
          const isEvaluationsOverview = evaluationsPageMode === "overview";
          const showEvaluationSetActions = evaluationsPageMode === "detail" && Boolean(activeEvaluationSet?.id) && !isResourcesVersionsDrawerOpen;
          if (
            (evaluationsPageMode === "detail" || evaluationsPageMode === "run" || evaluationsPageMode === "case")
            && activeEvaluationSet?.name
          ) {
            evaluationsPathItems.push({
              label: activeEvaluationSet.name,
              onClick: evaluationsPageMode === "run" || evaluationsPageMode === "case"
                ? () => openEvaluationDetailPage(activeEvaluationSet.id)
                : undefined,
              trailing: evaluationsPageMode === "detail"
                ? React.createElement("span", {
                    className: "playground-evaluations-breadcrumb-actions",
                  },
                    selectedEvaluationVersion
                      ? React.createElement(PlatformVersionLabel, {
                          version: selectedEvaluationVersion.version,
                          qualifier: Number(selectedEvaluationVersion.version) === latestEvaluationVersionNumber ? "Latest" : null,
                          className: "agent-breadcrumb-version-label",
                          "aria-label": "Open evaluation version history",
                          onClick: (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setEvaluationVersionsSidebarRequestToken((current) => current + 1);
                          },
                        })
                      : null,
                    showEvaluationSetActions
                      ? React.createElement("span", {
                          id: "playground-evaluations-breadcrumb-actions",
                          className: "playground-evaluations-breadcrumb-actions-root",
                        })
                      : null
                  )
                : null,
            });
          }
          if ((evaluationsPageMode === "run" || evaluationsPageMode === "case") && activeEvaluationRun?.label) {
            evaluationsPathItems.push({
              label: activeEvaluationRun.label,
              onClick: evaluationsPageMode === "case"
                ? () => {
                    setSelectedEvaluationCaseId("");
                    setEvaluationsPageMode("run");
                  }
                : undefined,
            });
          }
          if (evaluationsPageMode === "case" && activeEvaluationCaseTitle) {
            evaluationsPathItems.push({ label: activeEvaluationCaseTitle });
          }
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: evaluationsPathItems,
            center: showEvaluationSetActions
              ? React.createElement(PlatformSwitch, {
                  className: "playground-evaluations-detail-header-switch",
                  value: evaluationDetailTab === "settings" || evaluationDetailTab === "data"
                    ? "settings"
                    : "general",
                  options: [
                    { value: "general", label: "General" },
                    { value: "settings", label: "Settings" },
                  ],
                  onValueChange: (nextTab) => setEvaluationDetailTab(nextTab === "settings" ? "settings" : "general"),
                  ariaLabel: "Evaluation section",
                })
              : null,
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

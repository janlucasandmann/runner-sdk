export const FINE_TUNING_APP_TOP_NAVIGATION_SCRIPT = String.raw`        function renderFineTuningPageNav() {
          const activeFineTuningJob = (Array.isArray(fineTuningJobs) ? fineTuningJobs : [])
            .map((job) => normalizePlaygroundFineTuningJob(job))
            .find((job) => job?.id === selectedFineTuningJobId);
          const isFineTuningDetail = fineTuningPageMode === "detail" && Boolean(activeFineTuningJob?.id);
          const fineTuningPathItems = [
            { label: "Configure" },
            {
              label: "Agent Optimization",
              onClick: isFineTuningDetail
                ? () => requestPlatformNavigation(openFineTuningOverviewPage)
                : undefined,
            },
          ];
          if (isFineTuningDetail && activeFineTuningJob?.name) {
            fineTuningPathItems.push({ label: activeFineTuningJob.name });
          }
          const isFineTuningOverview = fineTuningPageMode !== "detail";
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: fineTuningPathItems,
            center: isFineTuningDetail
              ? React.createElement(PlatformSwitch, {
                  className: "playground-fine-tuning-detail-header-switch",
                  value: ["analysis", "changes", "settings"].includes(fineTuningDetailTab)
                    ? fineTuningDetailTab
                    : "general",
                  options: [
                    { value: "general", label: "General" },
                    { value: "analysis", label: "Analysis" },
                    { value: "changes", label: "Changes" },
                    { value: "settings", label: "Settings" },
                  ],
                  onValueChange: (nextTab) => setFineTuningDetailTab(
                    ["analysis", "changes", "settings"].includes(nextTab)
                      ? nextTab
                      : "general"
                  ),
                  ariaLabel: "Agent optimization section",
                })
              : null,
            includeSearchDivider: isFineTuningOverview || isFineTuningDetail,
            extraActions: isFineTuningOverview
              ? React.createElement("div", {
                  id: "playground-fine-tuning-overview-controls",
                  className: "playground-tools-overview-controls-slot",
                })
              : isFineTuningDetail
                ? React.createElement("div", {
                    id: "playground-fine-tuning-nav-actions",
                    className: "playground-fine-tuning-nav-actions",
                  })
                : null,
          });
        }

`;

export const FINE_TUNING_APP_TOP_NAVIGATION_SCRIPT = String.raw`        function renderFineTuningPageNav() {
          const activeFineTuningJob = (Array.isArray(fineTuningJobs) ? fineTuningJobs : [])
            .map((job) => normalizePlaygroundFineTuningJob(job))
            .find((job) => job?.id === selectedFineTuningJobId);
          const fineTuningPathItems = [{ label: "Configure" }, { label: "Agent Optimization" }];
          if (fineTuningPageMode === "detail" && activeFineTuningJob?.name) {
            fineTuningPathItems.push({ label: activeFineTuningJob.name });
          }
          const isFineTuningOverview = fineTuningPageMode !== "detail";
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: fineTuningPathItems,
            includeSearchDivider: isFineTuningOverview,
            extraActions: isFineTuningOverview
              ? React.createElement("div", {
                  id: "playground-fine-tuning-overview-controls",
                  className: "playground-tools-overview-controls-slot",
                })
              : null,
          });
        }

`;

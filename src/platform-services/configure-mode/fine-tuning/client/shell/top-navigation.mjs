export const FINE_TUNING_APP_TOP_NAVIGATION_SCRIPT = String.raw`        function renderFineTuningPageNav() {
          const activeFineTuningJob = (Array.isArray(fineTuningJobs) ? fineTuningJobs : [])
            .map((job) => normalizePlaygroundFineTuningJob(job))
            .find((job) => job?.id === selectedFineTuningJobId);
          const fineTuningPathItems = [{ label: "Configure" }, { label: "Fine-Tuning" }];
          if (fineTuningPageMode === "detail" && activeFineTuningJob?.name) {
            fineTuningPathItems.push({ label: activeFineTuningJob.name });
          }
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar",
            pathItems: fineTuningPathItems,
          });
        }

`;


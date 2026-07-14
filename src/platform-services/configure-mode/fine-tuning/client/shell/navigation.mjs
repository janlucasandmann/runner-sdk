export const FINE_TUNING_APP_NAVIGATION_SCRIPT = String.raw`        function openFineTuningPage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("configure");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          const requestedJobId = String(options.jobId || options.fineTuneJobId || "").trim();
          if (requestedJobId) {
            setSelectedFineTuningJobId(requestedJobId);
          }
          setFineTuningPageMode(options.mode === "detail" || requestedJobId ? "detail" : "overview");
          setActivePage("fine-tuning");
        }

`;


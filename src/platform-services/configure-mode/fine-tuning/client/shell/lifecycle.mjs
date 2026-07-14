export const FINE_TUNING_APP_LIFECYCLE_SCRIPT = String.raw`        useEffect(() => {
          if (activePage !== "fine-tuning") {
            return;
          }
          if (selectedFineTuningJobId && fineTuningJobs.some((job) => normalizePlaygroundFineTuningJob(job).id === selectedFineTuningJobId)) {
            return;
          }
          setSelectedFineTuningJobId(fineTuningJobs[0] ? normalizePlaygroundFineTuningJob(fineTuningJobs[0]).id : "");
          if (fineTuningPageMode !== "overview") {
            setFineTuningPageMode(fineTuningJobs[0] ? "detail" : "overview");
          }
        }, [activePage, fineTuningJobs, fineTuningPageMode, selectedFineTuningJobId]);
`;


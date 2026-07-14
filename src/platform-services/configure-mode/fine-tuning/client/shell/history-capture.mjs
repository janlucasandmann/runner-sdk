export const FINE_TUNING_APP_HISTORY_CAPTURE_SCRIPT = String.raw`          if (activePage === "fine-tuning") {
            return {
              page: "fine-tuning",
              mode: fineTuningPageMode === "detail" ? "detail" : "overview",
              fineTuneJobId: selectedFineTuningJobId,
            };
          }

`;


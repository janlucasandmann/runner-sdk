export const FINE_TUNING_APP_HISTORY_RESTORE_SCRIPT = String.raw`          if (entry.page === "fine-tuning") {
            openFineTuningPage({
              mode: entry.mode === "detail" ? "detail" : "overview",
              jobId: entry.fineTuneJobId || "",
            });
            return;
          }

`;


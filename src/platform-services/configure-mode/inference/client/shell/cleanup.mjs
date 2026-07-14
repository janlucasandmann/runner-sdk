export const INFERENCE_APP_CLEANUP_SCRIPT = `            if (settingsInferenceAutosaveTimerRef.current) {
              window.clearTimeout(settingsInferenceAutosaveTimerRef.current);
              settingsInferenceAutosaveTimerRef.current = null;
            }
`;


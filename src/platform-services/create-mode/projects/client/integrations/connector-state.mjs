export const PROJECTS_CONNECTOR_STATE_RUNTIME_SCRIPT = `
      function normalizePlaygroundProjectComposerConnectorRestoreState(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          return null;
        }
        const savedAt = Number(value.savedAt || 0);
        if (!Number.isFinite(savedAt) || Date.now() - savedAt > 1000 * 60 * 20) {
          return null;
        }
        const source = getPlaygroundTaskConnectorSource(value.source) || "";
        const provider = getPlaygroundTaskConnectorSource(value.provider) || source;
        const mode = value.mode === "project-composer" ? "project-composer" : "";
        const projectDraftValue = value.projectDraft && typeof value.projectDraft === "object" && !Array.isArray(value.projectDraft)
          ? value.projectDraft
          : buildPlaygroundDefaultProjectDraft();
        const projectDraft = normalizePlaygroundProjectRecord(projectDraftValue);
        const projectComposerMode = value.projectComposerMode === "edit" && projectDraft.id ? "edit" : "create";
        if (!provider || !source || !mode) {
          return null;
        }
        return {
          provider,
          source,
          mode,
          projectComposerMode,
          projectDraft,
          savedAt,
        };
      }

      function readPlaygroundProjectComposerConnectorRestoreState() {
        try {
          const raw = sessionStorage.getItem(PLAYGROUND_PROJECT_COMPOSER_CONNECTOR_RESTORE_STATE_KEY);
          const normalized = normalizePlaygroundProjectComposerConnectorRestoreState(raw ? JSON.parse(raw) : null);
          if (!normalized) {
            sessionStorage.removeItem(PLAYGROUND_PROJECT_COMPOSER_CONNECTOR_RESTORE_STATE_KEY);
          }
          return normalized;
        } catch {
          return null;
        }
      }

      function writePlaygroundProjectComposerConnectorRestoreState(value) {
        try {
          const normalized = normalizePlaygroundProjectComposerConnectorRestoreState({
            ...(value && typeof value === "object" && !Array.isArray(value) ? value : {}),
            savedAt: Number(value?.savedAt || 0) || Date.now(),
          });
          if (normalized) {
            sessionStorage.setItem(PLAYGROUND_PROJECT_COMPOSER_CONNECTOR_RESTORE_STATE_KEY, JSON.stringify(normalized));
          }
        } catch {}
      }

      function clearPlaygroundProjectComposerConnectorRestoreState() {
        try {
          sessionStorage.removeItem(PLAYGROUND_PROJECT_COMPOSER_CONNECTOR_RESTORE_STATE_KEY);
        } catch {}
      }
`;

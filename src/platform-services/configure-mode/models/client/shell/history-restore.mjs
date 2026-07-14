export const MODELS_APP_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "models") {
            setModelsPageTab(normalizePlaygroundManagedModelsTab(entry.modelsTab));
            openModelsPage();
            return;
          }

`;

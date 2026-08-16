export const MODELS_APP_NAVIGATION_SCRIPT = `        function openModelsPage(options = {}) {
          if (!platformHasCapability("modelManagement")) {
            openResourcesView("agents", { forceOverview: true });
            return;
          }
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("configure");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          setModelsPageToolbarPopover("");
          setModelsPageToolbarPopoverClosing("");
          setModelsPageActionsMenuOpen(false);
          setActivePage("models");
          void loadModelsPageAgentModelCatalog();
        }

`;

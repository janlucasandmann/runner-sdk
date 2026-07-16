export const API_KEYS_NAVIGATION_SCRIPT = `        function openDevelopApiKeysPage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("develop");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          setActivePage("develop-api-keys");
          if (options.openCreateDialog) {
            setSettingsApiKeyDialogOpen(true);
          }
        }
`;

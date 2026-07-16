export const DEVELOP_HOME_NAVIGATION_SCRIPT = `        function openDevelopHome(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("develop");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          setActivePage("develop");
        }

        function openDevelopWebhooksPage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("develop");
          }
          setSettingsSelectedTriggerId("");
          setSettingsShowTriggerSecret(false);
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          setActivePage("develop-webhooks");
        }
`;

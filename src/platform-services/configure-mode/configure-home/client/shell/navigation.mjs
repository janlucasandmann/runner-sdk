export const CONFIGURE_HOME_NAVIGATION_SCRIPT = `        function openConfigureHome(options = {}) {
          if (options.tab === "usage") {
            openOrganizationBillingPage("usage");
            return;
          }
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          setConfigureHomeTab("overview");
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("configure");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          setActivePage("configure");
        }
`;

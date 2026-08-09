export const CONFIGURE_HOME_NAVIGATION_SCRIPT = `        function openConfigureHome(options = {}) {
          if (options.tab === "usage") {
            openOrganizationBillingPage("usage");
            return;
          }
          const isNotificationsPage = options.tab === "notifications";
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          setConfigureHomeTab(isNotificationsPage ? "notifications" : "overview");
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode(isNotificationsPage ? "admin" : "configure");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          setActivePage("configure");
        }
`;

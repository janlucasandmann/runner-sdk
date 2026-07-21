export const SECURITY_NAVIGATION_SCRIPT = `        function openDevelopSecurityPage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("develop");
          }
          setResourcesHeaderState({ mode: "overview", title: "" });
          setActivePage("develop-security");
        }
`;


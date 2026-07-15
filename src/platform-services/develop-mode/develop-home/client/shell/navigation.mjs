export const DEVELOP_HOME_NAVIGATION_SCRIPT = `        function openDevelopHome(options = {}) {
          if (String(options.section || "").trim() === "api-keys") {
            openDevelopApiKeysPage(options);
            return;
          }
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("develop");
          }
          if (typeof options.section === "string" && options.section.trim()) {
            setDevelopHomeSection(options.section.trim());
          } else if (!options.preserveDevelopSection) {
            setDevelopHomeSection("overview");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          setActivePage("develop");
        }
`;

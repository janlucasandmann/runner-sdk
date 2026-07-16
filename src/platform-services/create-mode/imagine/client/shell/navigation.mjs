export const IMAGINE_APP_NAVIGATION_SCRIPT = String.raw`
        function openImaginePage() {
          setAccountMenuOpen(false);
          setSidebarWorkspaceMode("work");
          setActivePage("imagine");
        }

        function openImagineOverviewPage() {
          setImagineActiveView("explore");
          setImagineTemplateSelectionRequest(null);
          openImaginePage();
        }

`;

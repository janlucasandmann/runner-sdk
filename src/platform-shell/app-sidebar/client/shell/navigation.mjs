export const APP_SIDEBAR_MODE_NAVIGATION_SCRIPT = `        function handleSidebarWorkspaceModeSelect(nextMode) {
          const normalizedMode = nextMode === "develop" ? "develop" : nextMode === "configure" ? "configure" : "work";
          setSidebarWorkspaceMode(normalizedMode);
          setSidebarWorkspaceMenuOpen(false);

          if (normalizedMode === "configure") {
            openConfigureHome({ preserveSidebarMode: true });
            return;
          }

          if (normalizedMode === "develop") {
            openDevelopHome({ preserveSidebarMode: true });
            return;
          }

          if (isSidebarPageAvailableForMode(normalizedMode)) {
            return;
          }

          setActivePage("thread");
        }

`;

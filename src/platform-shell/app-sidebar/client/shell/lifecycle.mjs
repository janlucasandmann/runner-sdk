export const APP_SIDEBAR_MENU_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (sidebarWorkspaceMenuAnimationTimerRef.current !== null) {
            window.clearTimeout(sidebarWorkspaceMenuAnimationTimerRef.current);
            sidebarWorkspaceMenuAnimationTimerRef.current = null;
          }

          if (sidebarWorkspaceMenuOpen) {
            setRenderedSidebarWorkspaceMenu(true);
            setSidebarWorkspaceMenuPhase("enter");
            sidebarWorkspaceMenuAnimationTimerRef.current = window.setTimeout(() => {
              setSidebarWorkspaceMenuPhase("idle");
              sidebarWorkspaceMenuAnimationTimerRef.current = null;
            }, 180);
            return;
          }

          if (!renderedSidebarWorkspaceMenu) {
            setSidebarWorkspaceMenuPhase("idle");
            return;
          }

          setSidebarWorkspaceMenuPhase("exit");
          sidebarWorkspaceMenuAnimationTimerRef.current = window.setTimeout(() => {
            setRenderedSidebarWorkspaceMenu(false);
            setSidebarWorkspaceMenuPhase("idle");
            sidebarWorkspaceMenuAnimationTimerRef.current = null;
          }, 180);
        }, [renderedSidebarWorkspaceMenu, sidebarWorkspaceMenuOpen]);
        useEffect(() => {
          return () => {
            if (sidebarWorkspaceMenuAnimationTimerRef.current !== null) {
              window.clearTimeout(sidebarWorkspaceMenuAnimationTimerRef.current);
            }
          };
        }, []);
        useEffect(() => {
          if (!sidebarWorkspaceMenuOpen) {
            return undefined;
          }

          function handleSidebarWorkspacePointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !sidebarWorkspaceMenuRef.current || sidebarWorkspaceMenuRef.current.contains(target)) {
              return;
            }
            setSidebarWorkspaceMenuOpen(false);
          }

          function handleSidebarWorkspaceKeyDown(event) {
            if (event.key === "Escape") {
              setSidebarWorkspaceMenuOpen(false);
            }
          }

          document.addEventListener("mousedown", handleSidebarWorkspacePointerDown);
          document.addEventListener("keydown", handleSidebarWorkspaceKeyDown);
          return () => {
            document.removeEventListener("mousedown", handleSidebarWorkspacePointerDown);
            document.removeEventListener("keydown", handleSidebarWorkspaceKeyDown);
          };
        }, [sidebarWorkspaceMenuOpen]);
`;

export const APP_SIDEBAR_PAGE_MODE_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if ((activePage === "team" || activePage === "organization") && sidebarWorkspaceMode !== "configure") {
            setSidebarWorkspaceMode("configure");
          }
        }, [activePage, sidebarWorkspaceMode]);

`;

export const APP_SIDEBAR_MENU_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (sidebarWorkspaceMenuAnimationTimerRef.current !== null) {
            window.clearTimeout(sidebarWorkspaceMenuAnimationTimerRef.current);
            sidebarWorkspaceMenuAnimationTimerRef.current = null;
          }

          if (sidebarWorkspaceMenuOpen) {
            if (!renderedSidebarWorkspaceMenu) {
              setRenderedSidebarWorkspaceMenu(true);
            }
            return;
          }

          if (!renderedSidebarWorkspaceMenu) {
            return;
          }

          sidebarWorkspaceMenuAnimationTimerRef.current = window.setTimeout(() => {
            setRenderedSidebarWorkspaceMenu(false);
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
          const isAdminPage = activePage === "team"
            || activePage === "organization"
            || (activePage === "configure" && configureHomeTab === "notifications");
          if (isAdminPage && sidebarWorkspaceMode !== "admin") {
            setSidebarWorkspaceMode("admin");
          }
        }, [activePage, configureHomeTab, sidebarWorkspaceMode]);

`;

export const APP_SIDEBAR_KEYBOARD_LIFECYCLE_SCRIPT = `        useEffect(() => {
          function handleSidebarShortcutKeyDown(event) {
            if (
              event.defaultPrevented
              || event.repeat
              || !(event.metaKey || event.ctrlKey)
              || event.altKey
              || event.shiftKey
              || String(event.key || "").toLowerCase() !== "b"
            ) {
              return;
            }

            event.preventDefault();
            setSidebarOpen((current) => !current);
          }

          window.addEventListener("keydown", handleSidebarShortcutKeyDown);
          return () => window.removeEventListener("keydown", handleSidebarShortcutKeyDown);
        }, []);

`;

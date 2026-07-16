export const APP_HEADER_NAVIGATION_SCRIPT = `        function openThreadSearch() {
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setThreadSearchQuery("");
          setThreadSearchOpen(true);
        }

        function closeThreadSearch() {
          setThreadSearchOpen(false);
          setThreadSearchQuery("");
        }

        function handleThreadSearchCreate() {
          requestPlatformNavigation(() => {
            closeThreadSearch();
            handleNewThread();
          });
        }

        function handleThreadSearchSelect(threadId) {
          requestPlatformNavigation(() => {
            closeThreadSearch();
            handleThreadSelect(threadId);
          });
        }

        function handleThreadSearchFileSelect(fileResult) {
          const normalizedEnvironmentId = String(fileResult?.environmentId || "").trim();
          const entry = fileResult?.entry || null;
          const normalizedPath = normalizeHistoryPath(entry?.path || "");
          if (!normalizedEnvironmentId || !normalizedPath) {
            return;
          }

          requestPlatformNavigation(() => {
            closeThreadSearch();
            setSidebarWorkspaceMode("work");
            setEnvironmentId(normalizedEnvironmentId);
            setFilesPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              environmentId: normalizedEnvironmentId,
              path: normalizedPath,
              isFolder: Boolean(entry?.isFolder),
              contentMode: "files",
            });
            setActivePage("files");
          });
        }
`;

export const FILES_PAGE_CONNECTOR_BROWSER_SCRIPT = `
        const connectedFileConnectorSources = useMemo(
          () => connectorSourceState.items.filter((source) => source.connected),
          [connectorSourceState.items]
        );
        const activeFileConnectorSource = useMemo(
          () => connectorSourceState.items.find((source) => source.id === activeConnectorSourceId) || null,
          [activeConnectorSourceId, connectorSourceState.items]
        );
        const activeFileConnectorAccounts = useMemo(
          () => Array.isArray(activeFileConnectorSource?.accounts) ? activeFileConnectorSource.accounts : [],
          [activeFileConnectorSource]
        );
        const activeFileConnectorAccount = useMemo(
          () => activeFileConnectorAccounts.find((account) => account.id === activeConnectorCredentialId)
            || activeFileConnectorAccounts.find((account) => account.isDefault)
            || activeFileConnectorAccounts[0]
            || null,
          [activeConnectorCredentialId, activeFileConnectorAccounts]
        );
        const connectorBrowserCredentialKey = activeConnectorCredentialId || "__default__";
        const connectorBrowserRequiresCredential = activeFileConnectorAccounts.some((account) => Boolean(account.id));
        const connectorBrowserLocation = connectorBrowserHistory[connectorBrowserHistoryIndex]
          || { folderId: "root", label: activeFileConnectorSource?.label || "Files" };
        const connectorBrowserLocationKey = activeConnectorSourceId
          && (!connectorBrowserRequiresCredential || activeConnectorCredentialId)
          ? activeConnectorSourceId + "::" + connectorBrowserCredentialKey + "::" + connectorBrowserLocation.folderId
          : "";
        const connectorBrowserItems = connectorItemsByLocation[connectorBrowserLocationKey] || [];
        const visibleConnectorBrowserItems = useMemo(() => {
          const normalizedQuery = connectorBrowserSearchQuery.trim().toLowerCase();
          const normalizedEntries = connectorBrowserItems.map((item) => {
            const isGithubRepository = activeConnectorSourceId === "github"
              && Boolean(item?.isFolder)
              && !String(item?.path || "").trim()
              && Boolean(String(item?.repoFullName || "").trim());
            const repoFullName = String(item?.repoFullName || "").trim();
            const selectedBranch = isGithubRepository
              ? String(connectorGithubSelectedBranchesByRepoFullName[repoFullName] || item?.ref || "").trim()
              : "";
            const effectiveItem = isGithubRepository && selectedBranch && selectedBranch !== String(item?.ref || "").trim()
              ? {
                  ...item,
                  id: createPlatformGitHubRepositoryFolderId(repoFullName, selectedBranch),
                  ref: selectedBranch,
                }
              : item;
            return {
              ...effectiveItem,
              id: activeConnectorSourceId + ":" + connectorBrowserCredentialKey + ":" + String(effectiveItem.id || effectiveItem.path || effectiveItem.name || "file"),
              path: String(effectiveItem.path || effectiveItem.id || effectiveItem.name || "file"),
              modifiedTime: effectiveItem.modifiedTime || effectiveItem.createdTime || "",
              _connectorItem: effectiveItem,
              _isGithubRepository: isGithubRepository,
            };
          });
          return sortPlaygroundEnvironmentEntries(
            normalizedEntries.filter((entry) =>
              matchesPlaygroundEnvironmentEntryFilter(entry, filterMode)
              && (
                !normalizedQuery
                || String(entry.name || "").toLowerCase().includes(normalizedQuery)
                || String(entry.path || "").toLowerCase().includes(normalizedQuery)
              )
            ),
            sortMode
          );
        }, [activeConnectorSourceId, connectorBrowserCredentialKey, connectorBrowserItems, connectorBrowserSearchQuery, connectorGithubSelectedBranchesByRepoFullName, filterMode, sortMode]);
        const connectorBrowserBreadcrumbs = connectorBrowserHistory
          .slice(0, connectorBrowserHistoryIndex + 1)
          .flatMap((entry, index) => {
            const breadcrumb = {
              id: index + ":" + entry.folderId,
              name: entry.label,
              isCurrent: index === connectorBrowserHistoryIndex,
              onSelect: index < connectorBrowserHistoryIndex
                ? () => navigateFileConnectorHistory(index)
                : undefined,
            };
            const repositoryFullName = activeConnectorSourceId === "github"
              ? String(entry?.githubRepositoryFullName || "").trim()
              : "";
            if (!repositoryFullName) return [breadcrumb];
            const selectedBranch = String(
              connectorGithubSelectedBranchesByRepoFullName[repositoryFullName]
                || entry?.githubBranch
                || "main",
            ).trim() || "main";
            const branchOptions = (connectorGithubBranchesByRepoFullName[repositoryFullName] || [])
              .map((branch) => ({
                value: String(branch?.name || "").trim(),
                label: String(branch?.name || "").trim(),
                ...(branch?.protected ? { description: "Protected" } : {}),
              }))
              .filter((option) => option.value);
            return [
              breadcrumb,
              {
                id: index + ":" + entry.folderId + ":branch",
                kind: "github-branch-selector",
                name: selectedBranch,
                value: selectedBranch,
                options: branchOptions,
                loading: connectorGithubBranchLoadingRepoFullNames.includes(repositoryFullName),
                onOpenChange: (open) => {
                  if (open) void ensureGithubConnectorBranchesLoaded(repositoryFullName, selectedBranch);
                },
                onValueChange: (branch) => handleGithubConnectorBreadcrumbBranchChange(
                  repositoryFullName,
                  branch,
                  index,
                ),
              },
            ];
          });
        const fileConnectorOrganizationId = String(organizationId || "").trim();
        function resetGithubConnectorBranchState() {
          connectorGithubBranchLoadingRepoFullNamesRef.current.clear();
          setConnectorGithubBranchesByRepoFullName({});
          setConnectorGithubSelectedBranchesByRepoFullName({});
          setConnectorGithubBranchLoadingRepoFullNames([]);
        }

        const ensureGithubConnectorBranchesLoaded = useCallback(async (repositoryFullName, fallbackRef = "") => {
          const normalizedRepositoryFullName = String(repositoryFullName || "").trim();
          if (activeConnectorSourceId !== "github" || !normalizedRepositoryFullName) return;
          const normalizedFallbackRef = String(fallbackRef || "").trim();
          const selectedBranch = String(
            connectorGithubSelectedBranchesByRepoFullName[normalizedRepositoryFullName]
              || normalizedFallbackRef
              || "main",
          ).trim() || "main";
          setConnectorGithubSelectedBranchesByRepoFullName((current) => current[normalizedRepositoryFullName]
            ? current
            : { ...current, [normalizedRepositoryFullName]: selectedBranch });
          if (
            Array.isArray(connectorGithubBranchesByRepoFullName[normalizedRepositoryFullName])
              && connectorGithubBranchesByRepoFullName[normalizedRepositoryFullName].length > 0
          ) return;
          if (connectorGithubBranchLoadingRepoFullNamesRef.current.has(normalizedRepositoryFullName)) return;

          connectorGithubBranchLoadingRepoFullNamesRef.current.add(normalizedRepositoryFullName);
          setConnectorGithubBranchLoadingRepoFullNames((current) => current.includes(normalizedRepositoryFullName)
            ? current
            : [...current, normalizedRepositoryFullName]);
          try {
            const branches = await fetchPlatformGitHubRepositoryBranches(normalizedRepositoryFullName, {
              ...(activeConnectorCredentialId ? { credentialId: activeConnectorCredentialId } : {}),
              ...(fileConnectorOrganizationId ? { organizationId: fileConnectorOrganizationId } : {}),
            });
            setConnectorGithubBranchesByRepoFullName((current) => ({
              ...current,
              [normalizedRepositoryFullName]: branches,
            }));
            if (branches.length > 0) {
              setConnectorGithubSelectedBranchesByRepoFullName((current) => current[normalizedRepositoryFullName]
                ? current
                : {
                    ...current,
                    [normalizedRepositoryFullName]: String(branches[0]?.name || selectedBranch).trim() || selectedBranch,
                  });
            }
          } catch (_error) {
            // Keep the repository usable even when branch metadata is temporarily unavailable.
            setConnectorGithubBranchesByRepoFullName((current) => ({
              ...current,
              [normalizedRepositoryFullName]: [],
            }));
          } finally {
            connectorGithubBranchLoadingRepoFullNamesRef.current.delete(normalizedRepositoryFullName);
            setConnectorGithubBranchLoadingRepoFullNames((current) => current.filter((name) => name !== normalizedRepositoryFullName));
          }
        }, [activeConnectorCredentialId, activeConnectorSourceId, connectorGithubBranchesByRepoFullName, connectorGithubSelectedBranchesByRepoFullName, fileConnectorOrganizationId]);

        function getDefaultFileConnectorCredentialId(source) {
          const accounts = Array.isArray(source?.accounts) ? source.accounts : [];
          if (accounts.some((account) => account.id === source?.defaultCredentialId)) {
            return source.defaultCredentialId;
          }
          return accounts.find((account) => account.isDefault)?.id || accounts[0]?.id || "";
        }

        function normalizeKnownFileConnectorAccounts(source, knownStatus) {
          const knownCredentials = Array.isArray(knownStatus?.credentials)
            ? knownStatus.credentials.filter((credential) => credential && credential.status !== "invalid")
            : [];
          if (knownCredentials.length > 0) {
            return knownCredentials.map((credential) => ({
              id: String(credential.id || "").trim(),
              name: String(credential.name || credential.identity || "Connected account").trim(),
              identity: String(credential.identity || credential.name || source?.identity || "Connected").trim(),
              isDefault: credential.id === knownStatus.defaultCredentialId || Boolean(credential.isDefault),
              status: credential.status || "valid",
            })).filter((account) => Boolean(account.id));
          }
          const sourceAccounts = Array.isArray(source?.accounts) ? source.accounts : [];
          if (sourceAccounts.length > 0) return sourceAccounts;
          if (!source?.connected && !knownStatus?.connected) return [];
          return [{
            id: "",
            name: "Connected account",
            identity: String(source?.identity || getPlatformPluginConnectionIdentity(source.id, knownStatus) || "Connected").trim(),
            isDefault: true,
            status: "valid",
          }];
        }

        const mergeKnownFileConnectorStatuses = useCallback((items) => items.map((source) => {
          const knownStatus = connectorConnectionStatuses?.[source.id];
          const connected = Boolean(source.connected || knownStatus?.connected);
          const accounts = normalizeKnownFileConnectorAccounts(source, knownStatus);
          const knownIdentity = knownStatus?.connected
            ? getPlatformPluginConnectionIdentity(source.id, knownStatus)
            : "";
          const defaultCredentialId = accounts.some((account) => account.id === knownStatus?.defaultCredentialId)
            ? knownStatus.defaultCredentialId
            : accounts.some((account) => account.id === source.defaultCredentialId)
              ? source.defaultCredentialId
              : accounts.find((account) => account.isDefault)?.id || accounts[0]?.id || "";
          return {
            ...source,
            accounts,
            connected,
            ...(defaultCredentialId ? { defaultCredentialId } : {}),
            identity: knownIdentity || source.identity || "Not connected",
            ...(connected ? { error: undefined } : {}),
          };
        }), [connectorConnectionStatuses]);

        const refreshFileConnectorSources = useCallback(async (forceRefresh = false) => {
          setConnectorSourceState((current) => ({ ...current, status: "loading", error: "" }));
          try {
            const fetchedItems = await fetchPlatformPluginFileSourceStatuses({
              forceRefresh,
              ...(fileConnectorOrganizationId ? { organizationId: fileConnectorOrganizationId } : {}),
            });
            const items = mergeKnownFileConnectorStatuses(fetchedItems);
            setConnectorSourceState({ status: "ready", items, error: "" });
            const connectedItems = items.filter((source) => source.connected);
            setActiveConnectorSourceId((current) => {
              if (connectedItems.some((source) => source.id === current)) return current;
              return connectedItems[0]?.id || "";
            });
          } catch (error) {
            setConnectorSourceState({
              status: "error",
              items: [],
              error: error instanceof Error ? error.message : "Unable to load connected file sources.",
            });
          }
        }, [fileConnectorOrganizationId, mergeKnownFileConnectorStatuses]);

        useEffect(() => {
          setConnectorSourceState((current) => {
            if (current.status !== "ready" || current.items.length === 0) return current;
            const items = mergeKnownFileConnectorStatuses(current.items);
            return JSON.stringify(items) === JSON.stringify(current.items)
              ? current
              : { ...current, items };
          });
        }, [mergeKnownFileConnectorStatuses]);

        useEffect(() => {
          if (!activeFileConnectorSource) {
            if (activeConnectorCredentialId) setActiveConnectorCredentialId("");
            return;
          }
          const accounts = Array.isArray(activeFileConnectorSource.accounts)
            ? activeFileConnectorSource.accounts
            : [];
          if (accounts.some((account) => account.id === activeConnectorCredentialId)) return;
          const nextCredentialId = getDefaultFileConnectorCredentialId(activeFileConnectorSource);
          if (nextCredentialId === activeConnectorCredentialId) return;
          setActiveConnectorCredentialId(nextCredentialId);
          setConnectorBrowserHistory([{ folderId: "root", label: activeFileConnectorSource.label }]);
          setConnectorBrowserHistoryIndex(0);
          setConnectorBrowserSearchQuery("");
        }, [activeConnectorCredentialId, activeFileConnectorSource]);

        useEffect(() => {
          if (toolbarPopover !== "environment" || filesEnvironmentMenuMode !== "connectors") return;
          if (connectorSourceState.status !== "idle") return;
          void refreshFileConnectorSources();
        }, [
          connectorSourceState.status,
          filesEnvironmentMenuMode,
          refreshFileConnectorSources,
          toolbarPopover,
        ]);

        const loadFileConnectorLocation = useCallback(async (sourceId, location, options = {}) => {
          const normalizedSourceId = String(sourceId || "").trim();
          const credentialId = String(options.credentialId ?? activeConnectorCredentialId).trim();
          const credentialKey = credentialId || "__default__";
          const folderId = String(location?.folderId || "root").trim() || "root";
          if (!normalizedSourceId) return;
          const locationKey = normalizedSourceId + "::" + credentialKey + "::" + folderId;
          if (!options.force && Object.prototype.hasOwnProperty.call(connectorItemsByLocation, locationKey)) {
            setConnectorBrowserLoadState({ key: locationKey, status: "ready", error: "" });
            return;
          }

          const requestToken = connectorBrowserRequestTokenRef.current + 1;
          connectorBrowserRequestTokenRef.current = requestToken;
          setConnectorBrowserLoadState({ key: locationKey, status: "loading", error: "" });
          try {
            const items = await fetchPlatformPluginFiles(normalizedSourceId, folderId, {
              ...(credentialId ? { credentialId } : {}),
              ...(fileConnectorOrganizationId ? { organizationId: fileConnectorOrganizationId } : {}),
            });
            if (connectorBrowserRequestTokenRef.current !== requestToken) return;
            setConnectorItemsByLocation((current) => ({ ...current, [locationKey]: items }));
            setConnectorBrowserLoadState({ key: locationKey, status: "ready", error: "" });
          } catch (error) {
            if (connectorBrowserRequestTokenRef.current !== requestToken) return;
            setConnectorBrowserLoadState({
              key: locationKey,
              status: "error",
              error: error instanceof Error ? error.message : "Unable to load connector files.",
            });
          }
        }, [activeConnectorCredentialId, connectorItemsByLocation, fileConnectorOrganizationId]);

        function selectFileConnectorSource(sourceId) {
          const source = connectorSourceState.items.find((item) => item.id === sourceId && item.connected);
          if (!source) return;
          setActiveConnectorSourceId(source.id);
          setActiveConnectorCredentialId(getDefaultFileConnectorCredentialId(source));
          resetGithubConnectorBranchState();
          setConnectorBrowserHistory([{ folderId: "root", label: source.label }]);
          setConnectorBrowserHistoryIndex(0);
          setConnectorBrowserSearchQuery("");
          setProjectFilterScope("");
          setProjectFilterScopeLabel("");
          setContentMode("connectors");
          setToolbarPopover("");
        }

        function selectFileConnectorAccount(credentialId) {
          if (!activeFileConnectorSource) return;
          const normalizedCredentialId = String(credentialId || "").trim();
          const account = activeFileConnectorAccounts.find((item) => item.id === normalizedCredentialId)
            || (!normalizedCredentialId ? activeFileConnectorAccounts.find((item) => !item.id) : null);
          if (!account) return;
          setActiveConnectorCredentialId(normalizedCredentialId);
          resetGithubConnectorBranchState();
          setConnectorBrowserHistory([{ folderId: "root", label: activeFileConnectorSource.label }]);
          setConnectorBrowserHistoryIndex(0);
          setConnectorBrowserSearchQuery("");
          setToolbarPopover("");
        }

        function updateGithubConnectorBranchSelection(repositoryFullName, nextBranch) {
          const normalizedRepositoryFullName = String(repositoryFullName || "").trim();
          const normalizedBranch = String(nextBranch || "").trim();
          if (!normalizedRepositoryFullName || !normalizedBranch) return "";
          const nextRootId = createPlatformGitHubRepositoryFolderId(normalizedRepositoryFullName, normalizedBranch);
          setConnectorGithubSelectedBranchesByRepoFullName((current) => ({
            ...current,
            [normalizedRepositoryFullName]: normalizedBranch,
          }));
          const rootLocationKey = activeConnectorSourceId + "::" + connectorBrowserCredentialKey + "::root";
          setConnectorItemsByLocation((current) => {
            const rootItems = current[rootLocationKey];
            if (!Array.isArray(rootItems)) return current;
            return {
              ...current,
              [rootLocationKey]: rootItems.map((rootItem) => {
                if (
                  String(rootItem?.repoFullName || "").trim() !== normalizedRepositoryFullName
                    || !rootItem?.isFolder
                    || String(rootItem?.path || "").trim()
                ) return rootItem;
                return {
                  ...rootItem,
                  id: nextRootId,
                  ref: normalizedBranch,
                };
              }),
            };
          });
          return nextRootId;
        }

        function handleGithubConnectorBranchChange(entry, nextBranch) {
          const item = entry?._connectorItem || entry;
          updateGithubConnectorBranchSelection(item?.repoFullName, nextBranch);
        }

        function handleGithubConnectorBreadcrumbBranchChange(repositoryFullName, nextBranch, repositoryHistoryIndex) {
          const normalizedRepositoryFullName = String(repositoryFullName || "").trim();
          const normalizedBranch = String(nextBranch || "").trim();
          const nextRootId = updateGithubConnectorBranchSelection(normalizedRepositoryFullName, normalizedBranch);
          if (!nextRootId) return;
          const normalizedHistoryIndex = Number.isFinite(Number(repositoryHistoryIndex))
            ? Math.max(0, Math.floor(Number(repositoryHistoryIndex)))
            : -1;
          const actualHistoryIndex = connectorBrowserHistory.findIndex((entry, index) => (
            index === normalizedHistoryIndex
              && String(entry?.githubRepositoryFullName || "").trim() === normalizedRepositoryFullName
          ));
          if (actualHistoryIndex < 0) return;
          setConnectorBrowserHistory((current) => current
            .slice(0, actualHistoryIndex + 1)
            .map((entry, index) => index === actualHistoryIndex
              ? {
                  ...entry,
                  folderId: nextRootId,
                  githubRepositoryFullName: normalizedRepositoryFullName,
                  githubBranch: normalizedBranch,
                }
              : entry));
          setConnectorBrowserHistoryIndex(actualHistoryIndex);
          setConnectorBrowserSearchQuery("");
        }

        function openFileConnectorFolder(entry) {
          const item = entry?._connectorItem || entry;
          if (!item?.isFolder || !activeConnectorSourceId) return;
          const githubRepositoryFullName = activeConnectorSourceId === "github" && entry?._isGithubRepository
            ? String(item?.repoFullName || "").trim()
            : "";
          const githubBranch = githubRepositoryFullName
            ? String(
                connectorGithubSelectedBranchesByRepoFullName[githubRepositoryFullName]
                  || item?.ref
                  || "main",
              ).trim() || "main"
            : "";
          const nextHistory = connectorBrowserHistory
            .slice(0, connectorBrowserHistoryIndex + 1)
            .concat({
              folderId: item.id,
              label: item.name || "Folder",
              ...(githubRepositoryFullName
                ? { githubRepositoryFullName, githubBranch }
                : {}),
            });
          setConnectorBrowserHistory(nextHistory);
          setConnectorBrowserHistoryIndex(nextHistory.length - 1);
          setConnectorBrowserSearchQuery("");
        }

        function navigateFileConnectorHistory(nextIndex) {
          const normalizedIndex = Math.max(0, Math.min(nextIndex, connectorBrowserHistory.length - 1));
          if (normalizedIndex === connectorBrowserHistoryIndex) return;
          setConnectorBrowserHistoryIndex(normalizedIndex);
          setConnectorBrowserSearchQuery("");
        }

        useEffect(() => {
          if (contentMode !== "connectors" || connectorSourceState.status !== "idle") return;
          void refreshFileConnectorSources();
        }, [connectorSourceState.status, contentMode, refreshFileConnectorSources]);

        useEffect(() => {
          if (contentMode !== "connectors" || !activeFileConnectorSource) return;
          const currentRoot = connectorBrowserHistory[0];
          if (!currentRoot || (connectorBrowserHistory.length === 1 && currentRoot.label !== activeFileConnectorSource.label)) {
            setConnectorBrowserHistory([{ folderId: "root", label: activeFileConnectorSource.label }]);
            setConnectorBrowserHistoryIndex(0);
          }
        }, [activeFileConnectorSource, connectorBrowserHistory, contentMode]);

        useEffect(() => {
          if (
            contentMode !== "connectors"
            || !activeConnectorSourceId
            || !connectorBrowserLocation?.folderId
            || (connectorBrowserRequiresCredential && !activeConnectorCredentialId)
          ) return;
          void loadFileConnectorLocation(activeConnectorSourceId, connectorBrowserLocation, {
            credentialId: activeConnectorCredentialId,
          });
        }, [
          activeConnectorCredentialId,
          activeConnectorSourceId,
          connectorBrowserLocation?.folderId,
          connectorBrowserRequiresCredential,
          contentMode,
          loadFileConnectorLocation,
        ]);

        useEffect(() => {
          if (typeof window === "undefined") return undefined;
          const refreshConnectors = () => {
            if (contentMode === "connectors") void refreshFileConnectorSources(true);
          };
          window.addEventListener("integrations-updated", refreshConnectors);
          return () => window.removeEventListener("integrations-updated", refreshConnectors);
        }, [contentMode, refreshFileConnectorSources]);

        function renderFileConnectorSourceIcon(source, className = "tb-file-browser-source-brand-icon") {
          if (!source?.logoUrl) {
            return React.createElement(Cloud, { className, width: 16, height: 16, strokeWidth: 1.8 });
          }
          return React.createElement("img", {
            src: source.logoUrl,
            alt: "",
            draggable: false,
            className: className + (source.id === "github" ? " is-github" : ""),
          });
        }

        function openFileConnectorEntry(entry) {
          const item = entry?._connectorItem || entry;
          if (item?.isFolder) {
            openFileConnectorFolder(entry);
            return;
          }
          if (item?.webUrl && typeof window !== "undefined") {
            window.open(item.webUrl, "_blank", "noopener,noreferrer");
          }
        }

        function renderFileConnectorItem(row) {
          const entry = row.entry;
          const connectorItem = entry?._connectorItem || entry;
          const isGithubRepository = Boolean(entry?._isGithubRepository)
            && Boolean(String(connectorItem?.repoFullName || "").trim());
          const repositoryFullName = String(connectorItem?.repoFullName || "").trim();
          const selectedBranch = String(
            connectorGithubSelectedBranchesByRepoFullName[repositoryFullName]
              || connectorItem?.ref
              || "main",
          ).trim() || "main";
          const branchOptions = (connectorGithubBranchesByRepoFullName[repositoryFullName] || []).map((branch) => ({
            value: String(branch?.name || "").trim(),
            label: String(branch?.name || "").trim(),
            ...(branch?.protected ? { description: "Protected" } : {}),
          })).filter((option) => option.value);
          const branchSelector = isGithubRepository
            ? React.createElement("div", {
                className: "playground-files-connector-branch-selector",
                onClick: (event) => event.stopPropagation(),
                onPointerDown: (event) => event.stopPropagation(),
              }, React.createElement(PlatformSelector, {
                value: selectedBranch,
                options: branchOptions,
                ariaLabel: "Select branch for " + repositoryFullName,
                placeholder: selectedBranch,
                alignment: "start",
                popupAlignment: "right",
                loading: connectorGithubBranchLoadingRepoFullNames.includes(repositoryFullName),
                loadingContent: "Loading branches...",
                emptyContent: "No branches available.",
                triggerClassName: "playground-files-connector-branch-trigger",
                popupClassName: "playground-files-connector-branch-popup",
                onOpenChange: (open) => {
                  if (open) void ensureGithubConnectorBranchesLoaded(repositoryFullName, connectorItem?.ref);
                },
                onClick: (event) => event.stopPropagation(),
                onPointerDown: (event) => event.stopPropagation(),
                onValueChange: (branch) => handleGithubConnectorBranchChange(entry, branch),
              }))
            : null;
          return renderEntryRow(row, {
            isActive: false,
            isExpanded: false,
            isFolderLoading: false,
            canExpandFolder: entry.isFolder,
            draggable: false,
            readOnly: true,
            showSelection: false,
            useThumbnail: false,
            environmentId: "",
            onSelect: (value) => openFileConnectorEntry(value),
            onOpen: (value) => openFileConnectorEntry(value),
            onToggleFolder: (value) => openFileConnectorFolder(value),
            onContextMenu: false,
            onOptionsClick: (value, event) => {
              event.preventDefault();
              event.stopPropagation();
              openFileConnectorEntry(value);
            },
            optionsLabel: entry.isFolder ? "Open folder" : "Open in " + (activeFileConnectorSource?.label || "connector"),
            renderName: (value) => React.createElement("div", { className: "playground-files-entry-name" }, value.name),
            renderMeta: isGithubRepository
              ? () => React.createElement("div", {
                  className: "playground-files-entry-meta playground-files-connector-branch-meta",
                }, branchSelector)
              : undefined,
          });
        }

        function renderFileConnectorGridItem(entry) {
          return renderGridItem(entry, {
            isActive: false,
            draggable: false,
            readOnly: true,
            useThumbnail: false,
            environmentId: "",
            onSelect: (value) => openFileConnectorEntry(value),
            onOpen: (value) => openFileConnectorEntry(value),
            onContextMenu: false,
          });
        }

        function renderFileConnectorsBrowser() {
          const isCurrentLocationLoading = connectorBrowserLoadState.key === connectorBrowserLocationKey
            && connectorBrowserLoadState.status === "loading";
          const currentLocationError = connectorBrowserLoadState.key === connectorBrowserLocationKey
            && connectorBrowserLoadState.status === "error"
              ? connectorBrowserLoadState.error
              : "";
          const hasConnectedSources = connectedFileConnectorSources.length > 0;
          if (connectorSourceState.status === "ready" && !hasConnectedSources) {
            return React.createElement(PlatformEmptyState, {
                icon: Cloud,
                iconSize: 22,
                title: "No file connectors connected",
                description: "Connect GitHub, GitLab, Google Drive, OneDrive, Notion, or SharePoint from Tags and Plugins to browse their files here.",
              });
          }
          if (connectorSourceState.status === "loading" || isCurrentLocationLoading) {
            return React.createElement(PlatformLoadingState, {
              centered: true,
              className: "playground-files-state",
              message: connectorSourceState.status === "loading" ? "Loading connectors..." : "Loading files...",
            });
          }
          if (connectorSourceState.error || currentLocationError) {
            return React.createElement("div", { className: "playground-files-state is-error" }, connectorSourceState.error || currentLocationError);
          }
          if (visibleConnectorBrowserItems.length === 0) {
            if (connectorBrowserSearchQuery.trim() || filterMode !== "all") {
              return React.createElement("div", { className: "playground-files-state" }, "No items match the current filter");
            }
            return React.createElement(PlatformEmptyState, {
              className: "playground-files-state",
              icon: Folder,
              iconSize: 20,
              title: "This folder is empty",
              description: "Files and folders added here will appear in this connected location.",
            });
          }
          return viewMode === "list"
            ? React.createElement("div", { className: "playground-files-entry-list" },
                visibleConnectorBrowserItems.map((entry) => renderFileConnectorItem({ entry, level: 0 }))
              )
            : React.createElement("div", { className: "playground-files-grid" },
                visibleConnectorBrowserItems.map(renderFileConnectorGridItem)
              );
        }
`;

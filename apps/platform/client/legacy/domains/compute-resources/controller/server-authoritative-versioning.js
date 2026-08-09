          function isAuthoritativelyVersionedServer(serverRecord = draftServer) {
            const kind = canonicalizePlaygroundServerKind(serverRecord?.kind);
            return kind === "web_app" || kind === "function";
          }

          function getServerVersionApiOptions(serverId, options = {}) {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              throw new Error("Missing resource id.");
            }
            return {
              backendUrl,
              headers: requestHeaders,
              credentials: "same-origin",
              serverId: normalizedServerId,
              signal: options?.signal,
            };
          }

          function normalizeServerVersionApiList(rawItems) {
            const items = Array.isArray(rawItems) ? rawItems : [];
            const numericVersions = items
              .map((version) => Number(version?.version ?? version?.versionNumber ?? version?.version_number))
              .filter((version) => Number.isFinite(version) && version >= 0);
            const displayOffset = numericVersions.length > 0 && Math.min(...numericVersions) >= 1 ? 1 : 0;
            return normalizePlaygroundServerVersions(items.map((version, index) => {
              const rawVersion = Number(version?.version ?? version?.versionNumber ?? version?.version_number);
              const displayVersion = Number.isFinite(rawVersion)
                ? Math.max(0, Math.floor(rawVersion) - displayOffset)
                : Math.max(0, index);
              const rawLabel = String(version?.label || version?.name || "").trim();
              const usesGeneratedLabel = !rawLabel || /^Version\s+\d+$/i.test(rawLabel);
              return {
                ...version,
                version: displayVersion,
                versionNumber: displayVersion,
                version_number: displayVersion,
                label: usesGeneratedLabel ? "Version " + displayVersion : rawLabel,
              };
            }));
          }

          async function fetchLatestServerVersionRecord(serverId) {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
            try {
              const response = await fetch(backendUrl + "/servers/" + encodeURIComponent(normalizedServerId), {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) return null;
              return getPlaygroundServerResponseRecord(data);
            } catch {
              return null;
            }
          }

          async function fetchServerVersionsApi(serverId, options = {}) {
            return normalizeServerVersionApiList(
              await serverVersionApiClient.listServerVersions(
                getServerVersionApiOptions(serverId, options)
              )
            );
          }

          async function captureCurrentServerVersionSnapshot(serverRecord = draftServer) {
            const normalizedServer = normalizePlaygroundServerRecord(
              serverRecord || buildPlaygroundDefaultServerDraft()
            );
            const serverId = String(normalizedServer.id || "").trim();
            const selectedVersion = getDraftServerSelectedVersion(normalizedServer)
              || getDraftServerActiveVersion(normalizedServer)
              || null;
            const fallbackContents = normalizePlaygroundServerVersionSourceFileContents(
              selectedVersion?.snapshot?.sourceFileContents
            );
            const currentSourceFiles = normalizePlaygroundServerVersionSourceFiles(
              Array.isArray(currentServerFiles) ? currentServerFiles : []
            );
            const fallbackSourceFiles = normalizePlaygroundServerVersionSourceFiles(
              selectedVersion?.snapshot?.sourceFiles
            );
            const sourceFiles = currentSourceFiles.length > 0
              ? currentSourceFiles
              : fallbackSourceFiles;
            const fileEntries = sourceFiles
              .filter((entry) => entry && !entry.isFolder && normalizeHistoryPath(entry.path));
            const trackedPaths = new Set(
              fileEntries.map((entry) => normalizeHistoryPath(entry.path)).filter(Boolean)
            );
            const sourceFileContents = Object.fromEntries(
              Object.entries(fallbackContents)
                .filter(([filePath]) => trackedPaths.size === 0 || trackedPaths.has(filePath))
            );
            const draftPrefix = serverId + "|";
            for (const [draftKey, draftValue] of serverSourceDraftContentsRef.current.entries()) {
              if (!String(draftKey).startsWith(draftPrefix)) continue;
              const draftPath = normalizeHistoryPath(String(draftKey).slice(draftPrefix.length));
              if (draftPath && (trackedPaths.size === 0 || trackedPaths.has(draftPath))) {
                sourceFileContents[draftPath] = String(draftValue || "");
              }
            }

            await Promise.all(fileEntries.map(async (entry) => {
              const filePath = normalizeHistoryPath(entry.path);
              if (
                serverFileEditorState.status === "ready"
                && normalizeHistoryPath(serverFileEditorState.path) === filePath
              ) {
                sourceFileContents[filePath] = String(serverFileEditorState.value || "");
                return;
              }
              if (Object.prototype.hasOwnProperty.call(sourceFileContents, filePath)) {
                return;
              }
              try {
                const response = await fetch(
                  buildPlaygroundServerFileContentUrl(backendUrl, serverId, filePath),
                  { method: "GET", headers: requestHeaders }
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok || typeof data?.content !== "string") {
                  throw new Error("Source content unavailable");
                }
                sourceFileContents[filePath] = data.content;
              } catch {
                if (Object.prototype.hasOwnProperty.call(fallbackContents, filePath)) {
                  sourceFileContents[filePath] = fallbackContents[filePath];
                }
              }
            }));

            return buildPlaygroundServerVersionSnapshot(normalizedServer, {
              sourceFiles,
              sourceFileContents,
            });
          }

          async function saveServerVersionApi(serverId, versionId, snapshot, details = {}) {
            const normalizedRequestedVersionId = String(versionId || "").trim();
            const result = await serverVersionApiClient.saveServerVersion({
              ...getServerVersionApiOptions(serverId),
              versionId: normalizedRequestedVersionId || null,
              version: {
                description: String(details.description || "").trim().slice(0, 240),
                snapshot,
              },
            });
            const normalizedVersionId = String(result.version?.id || "").trim();
            let versions = normalizeServerVersionApiList(result.versions);
            if (versions.length === 0 && normalizedVersionId) {
              const currentVersions = readDraftServerVersions();
              const existingVersion = currentVersions.find(
                (version) => version.id === normalizedVersionId
              ) || null;
              const nextVersionNumber = existingVersion
                ? normalizePlatformVersionNumber(existingVersion.version)
                : currentVersions.reduce(
                    (highest, version) => Math.max(
                      highest,
                      normalizePlatformVersionNumber(version?.version)
                    ),
                    -1
                  ) + 1;
              const publishedAt = new Date().toISOString();
              const publishedVersion = normalizePlaygroundServerVersion({
                ...(existingVersion || {}),
                ...result.version,
                id: normalizedVersionId,
                version: nextVersionNumber,
                versionNumber: nextVersionNumber,
                version_number: nextVersionNumber,
                label: "Version " + nextVersionNumber,
                description: String(details.description || "").trim().slice(0, 240),
                status: "active",
                lifecycleState: "published",
                lifecycle_state: "published",
                snapshot,
                publishedAt,
                published_at: publishedAt,
                updatedAt: publishedAt,
                updated_at: publishedAt,
              }, nextVersionNumber);
              versions = normalizePlaygroundServerVersions(
                currentVersions
                  .filter((version) => version.id !== normalizedVersionId)
                  .map((version) => (
                    version.status === "active"
                      ? {
                          ...version,
                          status: "saved",
                          lifecycleState: "saved",
                          lifecycle_state: "saved",
                          publishedAt: "",
                          published_at: "",
                        }
                      : version
                  ))
                  .concat(publishedVersion)
              );
            }
            return {
              server: normalizePlaygroundServerRecord(result.server),
              version: versions.find((version) => version.id === normalizedVersionId)
                || normalizePlaygroundServerVersion(result.version),
              versions,
            };
          }

          async function updateServerVersionApi(serverId, versionId, updates = {}) {
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) throw new Error("Missing resource version.");
            return normalizePlaygroundServerVersion(
              await serverVersionApiClient.updateServerVersion({
                ...getServerVersionApiOptions(serverId),
                versionId: normalizedVersionId,
                version: updates,
              })
            );
          }

          async function publishAuthoritativeServerVersionApi(serverId, versionId, options = {}) {
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) throw new Error("Missing resource version.");
            return normalizePlaygroundServerRecord(
              await serverVersionApiClient.publishServerVersion({
                ...getServerVersionApiOptions(serverId),
                versionId: normalizedVersionId,
                ...(Object.prototype.hasOwnProperty.call(options, "snapshot")
                  ? { snapshot: options.snapshot }
                  : {}),
                ...(Object.prototype.hasOwnProperty.call(options, "description")
                  ? { description: String(options.description || "").trim().slice(0, 240) }
                  : {}),
              })
            );
          }

          async function unpublishAuthoritativeServerVersionApi(serverId, versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) throw new Error("Missing resource version.");
            return normalizePlaygroundServerRecord(
              await serverVersionApiClient.unpublishServerVersion({
                ...getServerVersionApiOptions(serverId),
                versionId: normalizedVersionId,
              })
            );
          }

          async function deleteAuthoritativeServerVersionApi(serverId, versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) throw new Error("Missing resource version.");
            await serverVersionApiClient.deleteServerVersion({
              ...getServerVersionApiOptions(serverId),
              versionId: normalizedVersionId,
            });
          }

          function invalidateServerVersionsCache(serverId) {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId) return;
            for (const cacheKey of Array.from(serverVersionsLoadedRef.current)) {
              if (String(cacheKey).endsWith("|" + normalizedServerId)) {
                serverVersionsLoadedRef.current.delete(cacheKey);
              }
            }
          }

          function markServerVersionsCacheLoaded(serverId) {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId) return;
            serverVersionsLoadedRef.current.add([
              String(backendUrl || "").trim(),
              JSON.stringify(requestHeaders || {}),
              normalizedServerId,
            ].join("|"));
          }

          function createServerVersionSelectedResource(baseServer, versions, preferredSelectedId = "") {
            const hydratedServer = createPlaygroundServerWithVersionList(
              baseServer,
              versions,
              preferredSelectedId
            );
            const selectedVersion = readPlaygroundServerVersions(hydratedServer)
              .find((version) => version.id === String(preferredSelectedId || "").trim())
              || getDraftServerSelectedVersion(hydratedServer)
              || null;
            return selectedVersion
              ? createPlaygroundServerFromVersionSnapshot(
                  hydratedServer,
                  selectedVersion,
                  versions,
                  selectedVersion.id
                )
              : hydratedServer;
          }

          function preserveAuthoritativeServerOperationalState(candidateServer, authoritativeServer) {
            const candidate = normalizePlaygroundServerRecord(candidateServer);
            const authoritative = normalizePlaygroundServerRecord(authoritativeServer);
            return normalizePlaygroundServerRecord({
              ...candidate,
              serviceUrl: authoritative.serviceUrl,
              customDomain: authoritative.customDomain,
              cloudRunServiceName: authoritative.cloudRunServiceName,
              imageUrl: authoritative.imageUrl,
              status: authoritative.status,
              lastDeployedAt: authoritative.lastDeployedAt,
              updatedAt: authoritative.updatedAt || candidate.updatedAt,
            });
          }

          function mergeAuthoritativeServerRecordWithLoadedVersions(currentServer, authoritativeServer) {
            const authoritative = normalizePlaygroundServerRecord(authoritativeServer);
            const current = currentServer
              && String(currentServer.id || "").trim() === String(authoritative.id || "").trim()
              ? normalizePlaygroundServerRecord(currentServer)
              : null;
            const versions = current ? readPlaygroundServerVersions(current) : [];
            if (versions.length === 0) {
              return authoritative;
            }
            const selectedVersionId = String(
              getDraftServerSelectedVersion(current)?.id
              || getDraftServerActiveVersion(current)?.id
              || ""
            ).trim();
            return preserveAuthoritativeServerOperationalState(
              createServerVersionSelectedResource(
                authoritative,
                versions,
                selectedVersionId
              ),
              authoritative
            );
          }

          function syncSelectedServerVersionSource(snapshot) {
            const normalizedServerId = String(draftServer?.id || selectedServerId || "").trim();
            const normalizedSnapshot = normalizePlaygroundServerVersion({ snapshot }).snapshot;
            if (!normalizedServerId) return;
            const draftPrefix = normalizedServerId + "|";
            for (const draftKey of Array.from(serverSourceDraftContentsRef.current.keys())) {
              if (String(draftKey).startsWith(draftPrefix)) {
                serverSourceDraftContentsRef.current.delete(draftKey);
              }
            }
            setServerFileEditorHistoryByKey({});
            setServerFilesById((current) => ({
              ...current,
              [normalizedServerId]: normalizePlaygroundEnvironmentInventory(
                normalizedSnapshot.sourceFiles || []
              ),
            }));
            const editorPath = normalizeHistoryPath(serverFileEditorState.path || "");
            if (
              editorPath
              && Object.prototype.hasOwnProperty.call(
                normalizedSnapshot.sourceFileContents || {},
                editorPath
              )
            ) {
              const nextValue = String(normalizedSnapshot.sourceFileContents[editorPath] || "");
              setServerFileEditorState((current) => ({
                ...current,
                status: "ready",
                value: nextValue,
                initialValue: nextValue,
                error: "",
                saveError: "",
                saveMessage: "",
                isSaving: false,
              }));
            }
          }

          function commitAuthoritativeServerVersionState(
            serverId,
            baseServer,
            versions,
            preferredSelectedId = ""
          ) {
            const normalizedServerId = String(serverId || "").trim();
            const normalizedVersions = normalizeServerVersionApiList(versions);
            const authoritativeBase = normalizePlaygroundServerRecord(
              baseServer
              || draftServer
              || serverDetailsById[normalizedServerId]
              || selectedServerSnapshot
              || buildPlaygroundDefaultServerDraft()
            );
            const activeVersion = normalizedVersions.find((version) => version.status === "active")
              || normalizedVersions[0]
              || null;
            const authoritativeServer = createPlaygroundServerWithVersionList(
              authoritativeBase,
              normalizedVersions,
              activeVersion?.id || ""
            );
            const selectedId = String(preferredSelectedId || activeVersion?.id || "").trim();
            const selectedServer = createServerVersionSelectedResource(
              authoritativeServer,
              normalizedVersions,
              selectedId
            );
            const selectedVersion = normalizedVersions.find((version) => version.id === selectedId)
              || activeVersion;

            invalidateServerVersionsCache(normalizedServerId);
            markServerVersionsCacheLoaded(normalizedServerId);
            setServerVersionsLoadState({
              serverId: normalizedServerId,
              status: "success",
              error: "",
            });
            upsertLocalServerRecord(authoritativeServer);
            setSelectedServerId(normalizedServerId);
            setDraftServer(selectedServer);
            serverEditorDirtyRef.current = false;
            serverVersionDraftTouchedRef.current = false;
            rememberServerVersionBaseline(selectedServer, { force: true });
            if (selectedVersion?.snapshot) {
              syncSelectedServerVersionSource(selectedVersion.snapshot);
            }
            return selectedServer;
          }

          async function refreshAuthoritativeServerVersions(serverId, options = {}) {
            const normalizedServerId = String(serverId || "").trim();
            const fallbackServer = normalizePlaygroundServerRecord(
              options.baseServer
              || draftServer
              || serverDetailsById[normalizedServerId]
              || selectedServerSnapshot
              || buildPlaygroundDefaultServerDraft()
            );
            const [latestServer, versions] = await Promise.all([
              fetchLatestServerVersionRecord(normalizedServerId),
              fetchServerVersionsApi(normalizedServerId),
            ]);
            return commitAuthoritativeServerVersionState(
              normalizedServerId,
              latestServer || fallbackServer,
              versions,
              options.preferredSelectedId || ""
            );
          }

          async function refreshServerVersionsPreservingDraft(serverId, preferredSelectedId = "") {
            const normalizedServerId = String(serverId || "").trim();
            const versions = await fetchServerVersionsApi(normalizedServerId);
            invalidateServerVersionsCache(normalizedServerId);
            markServerVersionsCacheLoaded(normalizedServerId);
            setServerVersionsLoadState({
              serverId: normalizedServerId,
              status: "success",
              error: "",
            });
            setServerDetailsById((current) => {
              const currentServer = current[normalizedServerId];
              if (!currentServer) return current;
              return {
                ...current,
                [normalizedServerId]: createPlaygroundServerWithVersionList(
                  currentServer,
                  versions,
                  preferredSelectedId
                ),
              };
            });
            setDraftServer((current) => {
              if (!current || String(current.id || "").trim() !== normalizedServerId) {
                return current;
              }
              return createPlaygroundServerWithVersionList(
                current,
                versions,
                preferredSelectedId
              );
            });
            return versions;
          }

          async function runAuthoritativeServerVersionMutation(options = {}) {
            const normalizedServerId = String(options.serverId || draftServer?.id || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
              serverAutosaveTimerRef.current = null;
            }
            serverAutosaveQueuedRef.current = null;
            setServerVersionState({
              status: "loading",
              message: options.loadingMessage || "Saving resource version...",
              error: "",
            });
            setServerSaveState({ isSaving: true, error: "", message: "" });
            try {
              const mutationResult = await options.mutate();
              const selectedVersionId = typeof options.getSelectedVersionId === "function"
                ? options.getSelectedVersionId(mutationResult)
                : options.preferredSelectedId;
              const mutationVersions = Array.isArray(mutationResult?.versions)
                ? mutationResult.versions
                : null;
              const refreshedServer = mutationVersions
                ? commitAuthoritativeServerVersionState(
                    normalizedServerId,
                    mutationResult?.server || mutationResult?.resource || draftServer,
                    mutationVersions,
                    selectedVersionId || ""
                  )
                : await refreshAuthoritativeServerVersions(normalizedServerId, {
                    baseServer: mutationResult?.server
                      || mutationResult?.resource
                      || draftServer,
                    preferredSelectedId: selectedVersionId || "",
                  });
              setOpenServerVersionMenuId("");
              setServerSaveState({ isSaving: false, error: "", message: "" });
              setServerVersionState({ status: "idle", message: "", error: "" });
              if (onEnvironmentMutated) {
                void Promise.resolve()
                  .then(() => onEnvironmentMutated())
                  .catch((error) => {
                    console.warn("[Develop] Background overview refresh failed", error);
                  });
              }
              return refreshedServer;
            } catch (error) {
              const errorMessage = error instanceof Error
                ? error.message
                : options.errorMessage || "Failed to save resource version.";
              setServerSaveState({ isSaving: false, error: errorMessage, message: "" });
              setServerVersionState({ status: "error", message: "", error: errorMessage });
              if (typeof options.onError === "function") {
                options.onError(errorMessage, error);
              }
              return null;
            }
          }

          function buildAuthoritativeServerVersionSaveDialogData() {
            const versions = readDraftServerVersions();
            const selectedVersion = getDraftServerSelectedVersion()
              || getDraftServerActiveVersion()
              || versions[0]
              || null;
            const persistedServer = selectedServerSnapshot
              || serverDetailsById[String(draftServer?.id || "").trim()]
              || draftServer;
            const baseSnapshot = selectedVersion?.snapshot
              || buildPlaygroundServerVersionSnapshot(persistedServer);
            const currentSnapshot = serverVersionReviewSnapshot?.serverId === draftServer?.id
              ? serverVersionReviewSnapshot.snapshot
              : buildDraftServerVersionSnapshot(draftServer);
            const latestVersion = versions.reduce((highest, version) => {
              const parsedVersion = Number(version?.version);
              return Number.isFinite(parsedVersion) ? Math.max(highest, parsedVersion) : highest;
            }, -1);
            return {
              canSaveCurrent: Boolean(selectedVersion),
              currentVersion: selectedVersion ? Number(selectedVersion.version) : null,
              nextVersion: latestVersion + 1,
              currentDescription: String(selectedVersion?.description || "").trim(),
              diffFiles: buildServerVersionDiffFilesFromSnapshots(baseSnapshot, currentSnapshot),
            };
          }

          function openAuthoritativeServerVersionSaveDialog(options = {}) {
            if (
              !draftServer
              || serverSaveState.isSaving
              || serverVersionState.status === "loading"
              || !hasDraftServerVersionChanges()
            ) {
              return false;
            }
            const dialogKey = Date.now().toString(36) + Math.random().toString(36).slice(2);
            const serverId = String(draftServer.id || "").trim();
            setServerPublishMenuOpen(false);
            setServerVersionsHeaderMenuOpen(false);
            setServerVersionState((current) => current.status === "loading"
              ? current
              : { status: "idle", message: "", error: "" }
            );
            setServerVersionReviewSnapshot({
              serverId,
              key: dialogKey,
              status: "loading",
              snapshot: buildDraftServerVersionSnapshot(draftServer),
            });
            setServerVersionSaveDialog({
              initialMode: options.mode === "current" ? "current" : "new",
              key: dialogKey,
            });
            void captureCurrentServerVersionSnapshot(draftServer)
              .then((snapshot) => {
                setServerVersionReviewSnapshot((current) => (
                  current?.key === dialogKey
                    ? { serverId, key: dialogKey, status: "ready", snapshot }
                    : current
                ));
              })
              .catch((error) => {
                setServerVersionReviewSnapshot((current) => (
                  current?.key === dialogKey
                    ? {
                        ...current,
                        status: "error",
                        error: error instanceof Error ? error.message : "Failed to read source files.",
                      }
                    : current
                ));
              });
            return true;
          }

          function openAuthoritativeServerVersionsSidebar() {
            if (
              !draftServer?.id
              || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
              || !isAuthoritativelyVersionedServer(draftServer)
            ) {
              return;
            }
            setServerActionsPopoverOpen(false);
            setServerPublishMenuOpen(false);
            setServerVersionsHeaderMenuOpen(false);
            setOpenServerVersionMenuId("");
            setServerVersionsSidebarOpen(true);
          }

          async function saveAndPublishCurrentServerVersion(details = {}) {
            if (!draftServer || serverSaveState.isSaving || serverVersionState.status === "loading") {
              return null;
            }
            if (!hasDraftServerVersionChanges()) return null;
            const selectedVersion = getDraftServerSelectedVersion();
            const saveToCurrentVersion = details.mode === "current" && Boolean(selectedVersion);
            const versionDescription = String(details.description || "").trim().slice(0, 240);
            const serverId = String(draftServer.id || "").trim();
            const currentSnapshot = serverVersionReviewSnapshot?.serverId === serverId
              && serverVersionReviewSnapshot.status === "ready"
              && serverVersionReviewSnapshot.snapshot
              ? serverVersionReviewSnapshot.snapshot
              : await captureCurrentServerVersionSnapshot(draftServer);
            const savedServer = await runAuthoritativeServerVersionMutation({
              serverId,
              loadingMessage: "Saving resource changes...",
              errorMessage: "Failed to save resource changes.",
              mutate: () => saveServerVersionApi(
                serverId,
                saveToCurrentVersion ? selectedVersion.id : "",
                currentSnapshot,
                { description: versionDescription }
              ),
              getSelectedVersionId: (result) => result?.version?.id || selectedVersion?.id || "",
            });
            if (savedServer) {
              setServerFileEditorState((current) => (
                current.status === "ready"
                  ? {
                      ...current,
                      initialValue: current.value,
                      saveError: "",
                      saveMessage: "",
                    }
                  : current
              ));
              setServerVersionReviewSnapshot(null);
            }
            return savedServer;
          }

          function restoreAuthoritativeServerVersion(versionId) {
            if (!draftServer || serverVersionState.status === "loading") return;
            const result = serverVersionController.buildRestoreVersionResource(draftServer, versionId);
            if (!result?.resource) return;
            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
              serverAutosaveTimerRef.current = null;
            }
            serverAutosaveQueuedRef.current = null;
            serverEditorDirtyRef.current = false;
            serverVersionDraftTouchedRef.current = false;
            setDraftServer(result.resource);
            rememberServerVersionBaseline(result.resource, { force: true });
            const selectedVersion = readPlaygroundServerVersions(result.resource)
              .find((version) => version.id === String(versionId || "").trim());
            if (selectedVersion?.snapshot) syncSelectedServerVersionSource(selectedVersion.snapshot);
            setServerPublishMenuOpen(false);
            setServerVersionState({ status: "idle", message: "", error: "" });
          }

          async function publishAuthoritativeServerVersion(versionId) {
            if (!draftServer || serverVersionState.status === "loading") return;
            const targetVersion = readDraftServerVersions()
              .find((version) => version.id === String(versionId || "").trim());
            const selectedVersion = getDraftServerSelectedVersion();
            const hasChanges = hasDraftServerVersionChanges();
            if (
              targetVersion?.status === "active"
              && selectedVersion?.id === targetVersion.id
              && hasChanges
            ) {
              openAuthoritativeServerVersionSaveDialog({ mode: "current" });
              return;
            }
            if (hasChanges) {
              setServerVersionState({
                status: "error",
                message: "",
                error: "Save or revert the current changes before publishing another version.",
              });
              return;
            }
            await runAuthoritativeServerVersionMutation({
              serverId: draftServer.id,
              loadingMessage: "Publishing resource version...",
              errorMessage: "Failed to publish resource version.",
              mutate: async () => ({
                server: await publishAuthoritativeServerVersionApi(
                  draftServer.id,
                  targetVersion.id
                ),
              }),
              preferredSelectedId: targetVersion.id,
            });
          }

          async function decommissionActiveSourceServerDeployment() {
            const serverId = String(draftServer?.id || "").trim();
            const normalizedServerKind = canonicalizePlaygroundServerKind(draftServer?.kind);
            const resourceLabel = formatPlaygroundServerKindLabel(normalizedServerKind).toLowerCase();
            if (
              !draftServer
              || !["function", "web_app"].includes(normalizedServerKind)
              || !serverId
              || serverId === PLAYGROUND_SERVER_DRAFT_ID
              || serverSaveState.isSaving
              || serverVersionState.status === "loading"
              || serverDeploymentState.isDeploying
              || serverDeploymentState.isDecommissioning
              || serverDeploymentState.isInvoking
            ) {
              return;
            }

            if (hasDraftServerVersionChanges()) {
              const errorMessage = "Save or revert the current changes before decommissioning this " + resourceLabel + ".";
              setServerVersionState({ status: "error", message: "", error: errorMessage });
              setServerDeploymentState({
                isDeploying: false,
                isDecommissioning: false,
                isInvoking: false,
                error: errorMessage,
                message: "",
                lastResponseText: "",
                deployProgress: 0,
              });
              return;
            }

            let activeVersion = getDraftServerActiveVersion();
            if (!activeVersion?.id) {
              try {
                const versions = await fetchServerVersionsApi(serverId);
                activeVersion = versions.find((version) => (
                  String(version?.status || "").trim().toLowerCase() === "active"
                  || String(version?.lifecycleState || version?.lifecycle_state || "")
                    .trim()
                    .toLowerCase() === "published"
                )) || null;
              } catch (error) {
                const errorMessage = error instanceof Error
                  ? error.message
                  : "Failed to inspect the active " + resourceLabel + " deployment.";
                setServerVersionState({ status: "error", message: "", error: errorMessage });
                setServerDeploymentState({
                  isDeploying: false,
                  isDecommissioning: false,
                  isInvoking: false,
                  error: errorMessage,
                  message: "",
                  lastResponseText: "",
                  deployProgress: 0,
                });
                return;
              }
            }

            if (!activeVersion?.id) {
              const errorMessage = "This " + resourceLabel + " does not have an active deployment.";
              setServerVersionState({ status: "error", message: "", error: errorMessage });
              setServerDeploymentState({
                isDeploying: false,
                isDecommissioning: false,
                isInvoking: false,
                error: errorMessage,
                message: "",
                lastResponseText: "",
                deployProgress: 0,
              });
              return;
            }

            if (!window.confirm(
              "Decommission this " + resourceLabel + "? The live deployment will be removed, while its source files and version history will be kept."
            )) {
              return;
            }

            setServerDeploymentStatusDismissed(false);
            setServerDeploymentState({
              isDeploying: false,
              isDecommissioning: true,
              isInvoking: false,
              error: "",
              message: "Decommissioning " + resourceLabel + "...",
              lastResponseText: "",
              deployProgress: 0,
            });

            const decommissionedServer = await runAuthoritativeServerVersionMutation({
              serverId,
              loadingMessage: "Decommissioning " + resourceLabel + "...",
              errorMessage: "Failed to decommission " + resourceLabel + ".",
              mutate: async () => ({
                server: await unpublishAuthoritativeServerVersionApi(
                  serverId,
                  activeVersion.id
                ),
              }),
              preferredSelectedId: activeVersion.id,
              onError: (errorMessage) => {
                setServerDeploymentState({
                  isDeploying: false,
                  isDecommissioning: false,
                  isInvoking: false,
                  error: errorMessage,
                  message: "",
                  lastResponseText: "",
                  deployProgress: 0,
                });
              },
            });
            if (!decommissionedServer) {
              return;
            }

            setServerDeploymentState({
              isDeploying: false,
              isDecommissioning: false,
              isInvoking: false,
              error: "",
              message: formatPlaygroundServerKindLabel(normalizedServerKind) + " decommissioned",
              lastResponseText: "",
              deployProgress: 0,
            });
            void loadServerContext(serverId, { force: true });
            void loadServerAnalytics(serverId, { force: true });
            void loadServerDeployments(serverId, { force: true });
            void loadServerLogs(serverId, "deployment", { force: true });
          }

          async function deleteAuthoritativeServerVersion(versionId) {
            if (!draftServer || serverVersionState.status === "loading") return;
            const versions = readDraftServerVersions();
            if (versions.length <= 1) return;
            const normalizedVersionId = String(versionId || "").trim();
            const targetVersion = versions.find((version) => version.id === normalizedVersionId);
            if (!targetVersion) return;
            if (targetVersion.status === "active") {
              setServerVersionState({
                status: "error",
                message: "",
                error: "The published version cannot be deleted.",
              });
              return;
            }
            if (!window.confirm("Delete this resource version?")) return;
            const activeVersion = getDraftServerActiveVersion();
            await runAuthoritativeServerVersionMutation({
              serverId: draftServer.id,
              loadingMessage: "Deleting resource version...",
              errorMessage: "Failed to delete resource version.",
              mutate: async () => {
                await deleteAuthoritativeServerVersionApi(draftServer.id, normalizedVersionId);
                return {};
              },
              preferredSelectedId: activeVersion?.id || "",
            });
          }

          async function updateAuthoritativeServerVersionDetails(versionId, details = {}) {
            if (!draftServer || serverVersionState.status === "loading") return null;
            const serverId = String(draftServer.id || "").trim();
            const normalizedVersionId = String(versionId || "").trim();
            if (!serverId || !normalizedVersionId) return null;
            setServerVersionState({ status: "loading", message: "Saving version details...", error: "" });
            setServerSaveState({ isSaving: true, error: "", message: "" });
            try {
              const updatedVersion = await updateServerVersionApi(serverId, normalizedVersionId, {
                description: String(details.description || "").trim().slice(0, 240),
              });
              await refreshServerVersionsPreservingDraft(serverId, normalizedVersionId);
              setServerSaveState({ isSaving: false, error: "", message: "" });
              setServerVersionState({ status: "idle", message: "", error: "" });
              return updatedVersion;
            } catch (error) {
              const errorMessage = error instanceof Error
                ? error.message
                : "Failed to save version details.";
              setServerSaveState({ isSaving: false, error: errorMessage, message: "" });
              setServerVersionState({ status: "error", message: "", error: errorMessage });
              return null;
            }
          }

          function discardUnsavedServerDraft() {
            const selectedVersion = getDraftServerSelectedVersion()
              || getDraftServerActiveVersion()
              || readDraftServerVersions()[0]
              || null;
            if (selectedVersion) {
              restoreAuthoritativeServerVersion(selectedVersion.id);
              return;
            }
            const nextDraft = selectedServerSnapshot
              ? normalizePlaygroundServerRecord(selectedServerSnapshot)
              : null;
            const draftPrefix = String(draftServer?.id || selectedServerId || "").trim() + "|";
            for (const draftKey of Array.from(serverSourceDraftContentsRef.current.keys())) {
              if (String(draftKey).startsWith(draftPrefix)) {
                serverSourceDraftContentsRef.current.delete(draftKey);
              }
            }
            setServerFileEditorHistoryByKey({});
            serverEditorDirtyRef.current = false;
            serverVersionDraftTouchedRef.current = false;
            setDraftServer(nextDraft);
            rememberServerVersionBaseline(nextDraft, { force: true });
          }

          const serverVersionsRequestHeadersKey = JSON.stringify(requestHeaders || {});

          useEffect(() => {
            const normalizedServerId = String(draftServer?.id || selectedServerId || "").trim();
            const canLoadServerVersions = Boolean(
              resourceMode === "servers"
              && !isHomeViewActive
              && normalizedServerId
              && normalizedServerId !== PLAYGROUND_SERVER_DRAFT_ID
              && isAuthoritativelyVersionedServer(draftServer)
              && !isSelectedServerTemplatePreview
            );
            const versionLoadKey = [
              String(backendUrl || "").trim(),
              serverVersionsRequestHeadersKey,
              normalizedServerId,
            ].join("|");
            if (
              !canLoadServerVersions
              || !backendUrl
              || serverVersionsLoadedRef.current.has(versionLoadKey)
            ) {
              return undefined;
            }
            const initialServer = normalizePlaygroundServerRecord(draftServer);
            serverVersionsLoadedRef.current.add(versionLoadKey);
            setServerVersionsLoadState({
              serverId: normalizedServerId,
              status: "loading",
              error: "",
            });
            let cancelled = false;
            const abortController = new AbortController();
            void fetchServerVersionsApi(normalizedServerId, {
              signal: abortController.signal,
            })
              .then((versions) => {
                if (cancelled) return;
                setServerVersionsLoadState({
                  serverId: normalizedServerId,
                  status: "success",
                  error: "",
                });
                if (versions.length === 0) return;
                const activeVersion = versions.find((version) => version.status === "active")
                  || versions[0]
                  || null;
                setServerDetailsById((current) => {
                  const latestServer = current[normalizedServerId] || initialServer;
                  return {
                    ...current,
                    [normalizedServerId]: preserveAuthoritativeServerOperationalState(
                      createPlaygroundServerWithVersionList(
                        latestServer,
                        versions,
                        activeVersion?.id || ""
                      ),
                      latestServer
                    ),
                  };
                });
                setDraftServer((current) => {
                  if (!current || String(current.id || "").trim() !== normalizedServerId) {
                    return current;
                  }
                  if (serverEditorDirtyRef.current || serverVersionDraftTouchedRef.current) {
                    return createPlaygroundServerWithVersionList(
                      current,
                      versions,
                      getDraftServerSelectedVersion(current)?.id || activeVersion?.id || ""
                    );
                  }
                  const selectedServer = preserveAuthoritativeServerOperationalState(
                    createServerVersionSelectedResource(
                      current,
                      versions,
                      activeVersion?.id || ""
                    ),
                    current
                  );
                  rememberServerVersionBaseline(selectedServer, { force: true });
                  if (activeVersion?.snapshot) syncSelectedServerVersionSource(activeVersion.snapshot);
                  return selectedServer;
                });
              })
              .catch((error) => {
                serverVersionsLoadedRef.current.delete(versionLoadKey);
                if (!cancelled) {
                  setServerVersionsLoadState({
                    serverId: normalizedServerId,
                    status: "error",
                    error: error instanceof Error
                      ? error.message
                      : "Failed to load resource versions.",
                  });
                  console.warn("[Develop] Failed to load authoritative resource versions", error);
                }
              });
            return () => {
              cancelled = true;
              abortController.abort();
            };
          }, [
            backendUrl,
            draftServer?.id,
            isHomeViewActive,
            isSelectedServerTemplatePreview,
            resourceMode,
            selectedServerId,
            serverVersionsRequestHeadersKey,
          ]);

          const hasUnsavedServerChanges = Boolean(
            resourceMode === "servers"
            && !isHomeViewActive
            && draftServer
            && isAuthoritativelyVersionedServer(draftServer)
            && hasDraftServerVersionChanges()
          );

          usePlatformVersionNavigationGuard({
            dirty: hasUnsavedServerChanges,
            enabled: resourceMode === "servers",
            guardId: "develop-resource-details-unsaved-changes",
            resourceId: String(draftServer?.id || ""),
            resourceName: String(draftServer?.name || "").trim() || "this resource",
            resourceType: "Develop resource",
            onDiscard: discardUnsavedServerDraft,
            onNavigationGuardChange,
          });

          useEffect(() => {
            if (
              resourceMode !== "servers"
              || !isAuthoritativelyVersionedServer(draftServer)
              || !draftServer?.id
              || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
            ) {
              return undefined;
            }
            function handleAuthoritativeServerVersionShortcut(event) {
              if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
              if (String(event.key || "").toLowerCase() !== "s") return;
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation?.();
              if (!serverSaveState.isSaving && serverVersionState.status !== "loading") {
                openAuthoritativeServerVersionSaveDialog({
                  mode: event.shiftKey ? "new" : undefined,
                });
              }
            }
            window.addEventListener("keydown", handleAuthoritativeServerVersionShortcut, true);
            return () => window.removeEventListener("keydown", handleAuthoritativeServerVersionShortcut, true);
          }, [
            draftServer,
            resourceMode,
            serverSaveState.isSaving,
            serverVersionState.status,
          ]);

          const loadServers = useCallback(async (options = {}) => {
            const requestedKind = Object.prototype.hasOwnProperty.call(options, "kind")
              ? normalizePlaygroundServerOverviewKind(options.kind)
              : embeddedInResources && normalizedEmbeddedServerKind !== "database"
                ? normalizedEmbeddedServerKind
                : "";
            const requestScopeKey = databaseListScopeKey
              + "|servers|"
              + (requestedKind || "all");
            const activeRequest = serverListRequestRef.current;
            if (
              options?.force !== true
              && activeRequest.scopeKey === requestScopeKey
              && activeRequest.promise
            ) {
              return activeRequest.promise;
            }

            const requestId = activeRequest.requestId + 1;
            const useOverviewCatalog = Boolean(
              embeddedInResources
              && isHomeViewActive
              && requestedKind
            );
            const requestedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(
              developServerOperationalMetricsPeriod
            );
            const requestUrl = useOverviewCatalog
              ? backendUrl + "/servers/analytics/overview?kind="
                + encodeURIComponent(requestedKind)
                + "&period="
                + encodeURIComponent(requestedPeriod)
              : backendUrl + "/servers"
                + (requestedKind ? "?kind=" + encodeURIComponent(requestedKind) : "");
            setServerListLoading(true);
            const request = (async () => {
              let data = null;
              try {
                data = await fetchPlaygroundCachedDatabaseResourceJson(
                  requestUrl,
                  requestHeaders,
                  {
                    scopeKey: useOverviewCatalog ? databaseListScopeKey : requestScopeKey,
                    ttlMs: useOverviewCatalog
                      ? PLAYGROUND_DATABASE_ANALYTICS_CACHE_TTL_MS
                      : PLAYGROUND_DATABASE_LIST_CACHE_TTL_MS,
                    force: options?.force === true,
                    persist: true,
                    // Catalog consumers need the revalidated payload so React receives fresh rows.
                    staleWhileRevalidate: false,
                    priority: "high",
                  }
                );
              } catch (error) {
                if (!useOverviewCatalog) throw error;
                data = await fetchPlaygroundCachedDatabaseResourceJson(
                  backendUrl + "/servers?kind=" + encodeURIComponent(requestedKind),
                  requestHeaders,
                  {
                    scopeKey: requestScopeKey,
                    ttlMs: PLAYGROUND_DATABASE_LIST_CACHE_TTL_MS,
                    force: options?.force === true,
                    persist: true,
                    staleWhileRevalidate: false,
                    priority: "high",
                  }
                );
              }
              const overviewResources = useOverviewCatalog
                ? Array.isArray(data?.analytics?.resources)
                  ? data.analytics.resources
                  : Array.isArray(data?.resources)
                    ? data.resources
                    : []
                : [];
              const nextServers = useOverviewCatalog && overviewResources.length > 0
                ? overviewResources
                  .map((resource) => normalizePlaygroundServerRecord(
                    resource?.server || resource?.resource || resource
                  ))
                  .filter((server) => (
                    server?.id
                    && canonicalizePlaygroundServerKind(server.kind) === requestedKind
                  ))
                : parsePlaygroundServerListResponse(data);
              if (serverListRequestRef.current.requestId !== requestId) {
                return nextServers;
              }
              authoritativeServerListScopesRef.current.add(requestScopeKey);
              setServers((current) => {
                const currentById = new Map(current.map((server) => [server?.id, server]));
                return nextServers.map((server) => {
                  const currentServer = currentById.get(server?.id) || null;
                  return normalizePlaygroundServerRecord({
                    ...(currentServer || {}),
                    ...server,
                    lastUsedAt: server?.lastUsedAt || currentServer?.lastUsedAt || "",
                  });
                });
              });
              setHasLoadedServers(true);
              setLoadedServerListScope(requestScopeKey);
              setServerSaveState((current) => ({
                ...current,
                error: "",
              }));
              setServerDetailsById((current) => {
                const next = { ...current };
                nextServers.forEach((server) => {
                  if (!server?.id) return;
                  if (authoritativeServerDetailIdsRef.current.has(server.id)) return;
                  next[server.id] = normalizePlaygroundServerRecord({
                    ...(next[server.id] || {}),
                    ...server,
                  });
                });
                return next;
              });

              if (options?.selectId) {
                setSelectedServerId(options.selectId);
              } else if (!isHomeViewActive && !selectedServerIdRef.current && nextServers[0]?.id) {
                setSelectedServerId(nextServers[0].id);
              } else if (!isHomeViewActive && selectedServerIdRef.current && !nextServers.some((server) => server.id === selectedServerIdRef.current)) {
                setSelectedServerId(nextServers[0]?.id || "");
              }

              if (resourceMode === "servers" && !options?.skipCostRefresh) {
                const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(environmentHomeChartTimescale);
                void loadEnvironmentHomeCostSummary(normalizedPeriod, { force: true });
                void loadEnvironmentHomeCostBreakdown(normalizedPeriod, { force: true });
                void loadEnvironmentHomeChartSummaries(normalizedPeriod, { force: true });
                void loadEnvironmentHomeChartBreakdowns(normalizedPeriod, { force: true });
              }

              return nextServers;
            })();
            serverListRequestRef.current = {
              promise: request,
              requestId,
              scopeKey: requestScopeKey,
            };

            try {
              return await request;
            } catch (error) {
              if (serverListRequestRef.current.requestId !== requestId) {
                return [];
              }
              authoritativeServerListScopesRef.current.delete(requestScopeKey);
              setServerSaveState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load servers.",
              }));
              return [];
            } finally {
              if (serverListRequestRef.current.requestId === requestId) {
                serverListRequestRef.current = {
                  promise: null,
                  requestId,
                  scopeKey: requestScopeKey,
                };
                setServerListLoading(false);
              }
            }
          }, [
            backendUrl,
            databaseListScopeKey,
            developServerOperationalMetricsPeriod,
            embeddedInResources,
            environmentHomeChartTimescale,
            isHomeViewActive,
            loadEnvironmentHomeChartBreakdowns,
            loadEnvironmentHomeChartSummaries,
            loadEnvironmentHomeCostBreakdown,
            loadEnvironmentHomeCostSummary,
            normalizedEmbeddedServerKind,
            requestHeaders,
            resourceMode,
          ]);

          const loadServerDetails = useCallback(async (serverId, options = {}) => {
            if (!serverId || serverId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }

            const templatePreviewServer = resourceTemplatePreviewServerRecordById[serverId] || null;
            if (templatePreviewServer) {
              setServerDetailsById((current) => ({
                ...current,
                [serverId]: templatePreviewServer,
              }));
              if (selectedServerIdRef.current === serverId && !serverEditorDirtyRef.current) {
                setDraftServer(templatePreviewServer);
              }
              setServerSaveState((current) => ({
                ...current,
                error: "",
              }));
              return templatePreviewServer;
            }

            const activeRequest = serverDetailsRequestRef.current.get(serverId) || {
              promise: null,
              requestId: 0,
            };
            if (options?.force !== true && activeRequest.promise) {
              return activeRequest.promise.catch(() => null);
            }
            const requestId = activeRequest.requestId + 1;
            setLoadingServerId(serverId);
            const request = (async () => {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                backendUrl + "/servers/" + encodeURIComponent(serverId),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey + "|server-details",
                  ttlMs: 0,
                  force: options?.force === true,
                  priority: "high",
                }
              );

              const normalized = getPlaygroundServerResponseRecord(data);
              if (!normalized) {
                throw new Error("Server response was empty.");
              }
              if (serverDetailsRequestRef.current.get(serverId)?.requestId !== requestId) {
                return normalized;
              }

              authoritativeServerDetailIdsRef.current.add(serverId);
              setServerDetailsById((current) => {
                const merged = mergeAuthoritativeServerRecordWithLoadedVersions(
                  current[serverId],
                  normalized
                );
                return {
                  ...current,
                  [serverId]: merged,
                };
              });
              if (selectedServerIdRef.current === serverId && !serverEditorDirtyRef.current) {
                setDraftServer((current) => (
                  mergeAuthoritativeServerRecordWithLoadedVersions(current, normalized)
                ));
              }
              setServerSaveState((current) => ({
                ...current,
                error: "",
              }));
              return normalized;
            })();
            serverDetailsRequestRef.current.set(serverId, {
              promise: request,
              requestId,
            });

            try {
              return await request;
            } catch (error) {
              if (
                selectedServerIdRef.current === serverId
                && serverDetailsRequestRef.current.get(serverId)?.requestId === requestId
              ) {
                setServerSaveState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load server.",
                }));
              }
              return null;
            } finally {
              if (serverDetailsRequestRef.current.get(serverId)?.requestId === requestId) {
                serverDetailsRequestRef.current.set(serverId, {
                  promise: null,
                  requestId,
                });
                setLoadingServerId((current) => current === serverId ? "" : current);
              }
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewServerRecordById]);

          const loadServerDetailBootstrap = useCallback(async (serverId, serverKind, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            const normalizedKind = canonicalizePlaygroundServerKind(serverKind);
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              return loadServerDetails(normalizedServerId, options);
            }

            const activeRequest = serverDetailBootstrapRequestRef.current.get(normalizedServerId);
            if (options?.force !== true && activeRequest?.promise) {
              return activeRequest.promise;
            }
            const includesByKind = {
              api: ["bindings", "context"],
              auth: ["auth-users"],
              function: ["bindings", "context", "versions"],
              secrets: ["secrets"],
              web_app: ["bindings", "context", "versions"],
            };
            const includes = Array.isArray(options?.include)
              ? options.include
              : includesByKind[normalizedKind] || [];
            const versionLoadKey = [
              String(backendUrl || "").trim(),
              JSON.stringify(requestHeaders || {}),
              normalizedServerId,
            ].join("|");
            if (includes.includes("versions")) {
              serverVersionsLoadedRef.current.add(versionLoadKey);
              setServerVersionsLoadState({
                serverId: normalizedServerId,
                status: "loading",
                error: "",
              });
            }
            setLoadingServerId(normalizedServerId);
            if (includes.includes("bindings")) setLoadingServerBindingsId(normalizedServerId);
            if (includes.includes("context")) setLoadingServerContextId(normalizedServerId);
            if (includes.includes("auth-users")) setLoadingServerAuthUsersId(normalizedServerId);
            if (includes.includes("secrets")) setLoadingServerSecretsId(normalizedServerId);

            const hydrateVersions = async (rawVersions, baseServer) => {
              const sourceVersions = Array.isArray(rawVersions)
                ? rawVersions
                : Array.isArray(rawVersions?.versions)
                  ? rawVersions.versions
                  : Array.isArray(rawVersions?.data)
                    ? rawVersions.data
                    : [];
              const versions = normalizeServerVersionApiList(sourceVersions);
              if (versions.length === 0) return baseServer;
              const activeVersion = versions.find((version) => version.status === "active")
                || versions[0]
                || null;
              return preserveAuthoritativeServerOperationalState(
                createPlaygroundServerWithVersionList(
                  baseServer,
                  versions,
                  activeVersion?.id || ""
                ),
                baseServer
              );
            };

            const request = (async () => {
              try {
                const query = new URLSearchParams({ kind: normalizedKind });
                if (includes.length > 0) query.set("include", includes.join(","));
                if (includes.includes("auth-users")) query.set("authUsersLimit", "50");
                const response = await fetch(
                  backendUrl + "/servers/" + encodeURIComponent(normalizedServerId)
                    + "/bootstrap?" + query.toString(),
                  {
                    method: "GET",
                    headers: requestHeaders,
                    cache: "no-store",
                    priority: "high",
                  }
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load resource details.");
                }
                const authoritativeServer = getPlaygroundServerResponseRecord(data?.server);
                if (!authoritativeServer) throw new Error("Server response was empty.");

                const resources = data?.resources && typeof data.resources === "object"
                  ? data.resources
                  : {};
                const bindings = Array.isArray(resources?.bindings?.bindings)
                  ? resources.bindings.bindings.map(normalizePlaygroundServerBindingRecord).filter(Boolean)
                  : [];
                const context = resources.context
                  ? normalizePlaygroundServerContextRecord(resources.context)
                  : null;
                const authUsers = resources["auth-users"] && typeof resources["auth-users"] === "object"
                  ? {
                      users: Array.isArray(resources["auth-users"].users) ? resources["auth-users"].users : [],
                      projectId: String(resources["auth-users"].projectId || ""),
                      nextPageToken: String(resources["auth-users"].nextPageToken || ""),
                      loadedAt: new Date().toISOString(),
                    }
                  : null;
                const rawSecrets = Array.isArray(resources?.secrets?.secrets)
                  ? resources.secrets.secrets
                  : Array.isArray(resources?.secrets?.data)
                    ? resources.secrets.data
                    : [];
                const secrets = rawSecrets.map(normalizePlaygroundSecretRecord).filter(Boolean);
                const hydratedServer = includes.includes("versions") && !data?.errors?.versions
                  ? await hydrateVersions(resources.versions, authoritativeServer)
                  : authoritativeServer;

                authoritativeServerDetailIdsRef.current.add(normalizedServerId);
                if (includes.includes("bindings") && !data?.errors?.bindings) {
                  authoritativeServerBindingIdsRef.current.add(normalizedServerId);
                  setServerBindingsById((current) => ({ ...current, [normalizedServerId]: bindings }));
                }
                if (context && !data?.errors?.context) {
                  setServerContextsById((current) => ({ ...current, [normalizedServerId]: context }));
                  if (!includes.includes("bindings") && !authoritativeServerBindingIdsRef.current.has(normalizedServerId)) {
                    setServerBindingsById((current) => ({
                      ...current,
                      [normalizedServerId]: Array.isArray(context.bindings) ? context.bindings : [],
                    }));
                  }
                }
                if (authUsers && !data?.errors?.["auth-users"]) {
                  setServerAuthUsersById((current) => ({ ...current, [normalizedServerId]: authUsers }));
                  setServerAuthUsersState({ error: "" });
                }
                if (includes.includes("secrets") && !data?.errors?.secrets) {
                  setServerSecretsById((current) => ({ ...current, [normalizedServerId]: secrets }));
                  setServerSecretsState({ error: "" });
                }
                setServerDetailsById((current) => ({
                  ...current,
                  [normalizedServerId]: mergeAuthoritativeServerRecordWithLoadedVersions(
                    current[normalizedServerId],
                    hydratedServer
                  ),
                }));
                if (
                  selectedServerIdRef.current === normalizedServerId
                  && !serverEditorDirtyRef.current
                ) {
                  setDraftServer((current) => mergeAuthoritativeServerRecordWithLoadedVersions(
                    current,
                    hydratedServer
                  ));
                }
                setServerSaveState((current) => ({ ...current, error: "" }));
                if (includes.includes("versions")) {
                  setServerVersionsLoadState({
                    serverId: normalizedServerId,
                    status: data?.errors?.versions ? "error" : "success",
                    error: data?.errors?.versions?.message || "",
                  });
                }

                if (data?.errors?.bindings) void loadServerBindings(normalizedServerId, { force: true });
                if (data?.errors?.context) void loadServerContext(normalizedServerId, { force: true });
                if (data?.errors?.["auth-users"]) void loadServerAuthUsers(normalizedServerId, { force: true, limit: 50 });
                if (data?.errors?.secrets) void loadServerSecrets(normalizedServerId, { force: true });
                if (data?.errors?.versions) {
                  serverVersionsLoadedRef.current.delete(versionLoadKey);
                  void fetchServerVersionsApi(normalizedServerId)
                    .then((versions) => hydrateVersions(versions, authoritativeServer))
                    .then((nextServer) => {
                      markServerVersionsCacheLoaded(normalizedServerId);
                      setServerDetailsById((current) => ({ ...current, [normalizedServerId]: nextServer }));
                      if (selectedServerIdRef.current === normalizedServerId && !serverEditorDirtyRef.current) {
                        setDraftServer(nextServer);
                      }
                      setServerVersionsLoadState({ serverId: normalizedServerId, status: "success", error: "" });
                    })
                    .catch(() => undefined);
                }
                return { server: hydratedServer, bindings, context, authUsers, secrets };
              } catch (error) {
                if (includes.includes("versions")) serverVersionsLoadedRef.current.delete(versionLoadKey);
                const fallbackServer = await loadServerDetails(normalizedServerId, options);
                if (includes.includes("bindings")) void loadServerBindings(normalizedServerId);
                if (includes.includes("context")) void loadServerContext(normalizedServerId);
                if (includes.includes("auth-users")) void loadServerAuthUsers(normalizedServerId, { limit: 50 });
                if (includes.includes("secrets")) void loadServerSecrets(normalizedServerId);
                if (includes.includes("versions")) {
                  void fetchServerVersionsApi(normalizedServerId)
                    .then((versions) => hydrateVersions(versions, fallbackServer))
                    .then((nextServer) => {
                      if (!nextServer) return;
                      markServerVersionsCacheLoaded(normalizedServerId);
                      setServerDetailsById((current) => ({ ...current, [normalizedServerId]: nextServer }));
                      if (selectedServerIdRef.current === normalizedServerId && !serverEditorDirtyRef.current) {
                        setDraftServer(nextServer);
                      }
                    })
                    .catch(() => undefined);
                }
                return fallbackServer ? { server: fallbackServer } : null;
              } finally {
                setLoadingServerId((current) => current === normalizedServerId ? "" : current);
                setLoadingServerBindingsId((current) => current === normalizedServerId ? "" : current);
                setLoadingServerContextId((current) => current === normalizedServerId ? "" : current);
                setLoadingServerAuthUsersId((current) => current === normalizedServerId ? "" : current);
                setLoadingServerSecretsId((current) => current === normalizedServerId ? "" : current);
              }
            })();
            serverDetailBootstrapRequestRef.current.set(normalizedServerId, { promise: request });
            try {
              return await request;
            } finally {
              if (serverDetailBootstrapRequestRef.current.get(normalizedServerId)?.promise === request) {
                serverDetailBootstrapRequestRef.current.delete(normalizedServerId);
              }
            }
          }, [
            backendUrl,
            loadServerDetails,
            requestHeaders,
            resourceTemplatePreviewServerRecordById,
          ]);

          const loadServerFiles = useCallback(async (serverId) => {
            if (!serverId || serverId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }

            const templatePreviewFiles = resourceTemplatePreviewServerFilesById[serverId];
            if (Array.isArray(templatePreviewFiles)) {
              setServerFilesById((current) => ({
                ...current,
                [serverId]: templatePreviewFiles,
              }));
              setServerFileTransferState((current) => ({
                ...current,
                error: "",
              }));
              return templatePreviewFiles;
            }

            setLoadingServerFilesId(serverId);
            try {
              const response = await fetch(
                buildPlaygroundServerFilesListUrl(backendUrl, serverId, "", -1),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load source files.");
              }

              const files = normalizePlaygroundEnvironmentInventory(data?.files || []);
              setServerFilesById((current) => ({
                ...current,
                [serverId]: files,
              }));
              setServerFileTransferState((current) => ({
                ...current,
                error: "",
              }));
              return files;
            } catch (error) {
              if (selectedServerIdRef.current === serverId) {
                setServerFileTransferState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load source files.",
                }));
              }
              return [];
            } finally {
              setLoadingServerFilesId((current) => current === serverId ? "" : current);
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerFilesById]);

          const loadServerFileContent = useCallback(async (serverId, filePath, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            const normalizedPath = normalizeHistoryPath(filePath);
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID || !normalizedPath) {
              return null;
            }

            const templatePreviewContent = resourceTemplatePreviewServerFileContentById[normalizedServerId]?.[normalizedPath];
            if (typeof templatePreviewContent === "string") {
              const historyKey = normalizedServerId + "|" + normalizedPath;
              setServerFileEditorHistoryByKey((current) => {
                if (!Object.prototype.hasOwnProperty.call(current, historyKey)) return current;
                const next = { ...current };
                delete next[historyKey];
                return next;
              });
              setServerFileEditorState((current) => ({
                ...current,
                path: normalizedPath,
                status: "ready",
                value: templatePreviewContent,
                initialValue: templatePreviewContent,
                error: "",
                saveError: "",
                saveMessage: "",
                isSaving: false,
              }));
              return templatePreviewContent;
            }

            setServerFileEditorState((current) => ({
              ...current,
              path: normalizedPath,
              status: "loading",
              error: "",
              saveError: "",
              saveMessage: "",
            }));

            try {
              const response = await fetch(
                buildPlaygroundServerFileContentUrl(backendUrl, normalizedServerId, normalizedPath),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to open source file.");
              }

              const nextValue = typeof data?.content === "string"
                ? data.content
                : typeof options?.fallbackValue === "string"
                  ? options.fallbackValue
                  : "";
              const draftKey = normalizedServerId + "|" + normalizedPath;
              const draftValue = serverSourceDraftContentsRef.current.get(draftKey);

              setServerFileEditorState((current) => ({
                ...current,
                path: normalizedPath,
                status: "ready",
                value: typeof draftValue === "string" ? draftValue : nextValue,
                initialValue: nextValue,
                error: "",
                saveError: "",
                saveMessage: "",
              }));
              return nextValue;
            } catch (error) {
              setServerFileEditorState((current) => ({
                ...current,
                path: normalizedPath,
                status: "error",
                error: error instanceof Error ? error.message : "Failed to open source file.",
                saveError: "",
                saveMessage: "",
              }));
              return null;
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerFileContentById]);

          const loadServerAnalytics = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
            const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(options?.period || "day");
            const analyticsKind = canonicalizePlaygroundServerKind(
              options?.kind || normalizedEmbeddedServerKind
            );
            const analyticsStateKey = buildPlaygroundServerAnalyticsStateKey(normalizedServerId, normalizedPeriod);

            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              const normalizedRecord = {
                period: normalizedPeriod,
                summary: {
                  totalRequests: 0,
                  successRate: 0,
                  clientErrors: 0,
                  serverErrors: 0,
                  totalRequests24h: 0,
                  successRate24h: 0,
                  p95LatencyMs: 0,
                  clientErrors24h: 0,
                  serverErrors24h: 0,
                },
                charts: {
                  traffic: [],
                  status: [],
                  traffic24h: [],
                  status24h: [],
                },
                recentRequests: [],
                deployment: null,
                loadedAt: new Date().toISOString(),
              };
              setServerAnalyticsById((current) => ({
                ...current,
                [analyticsStateKey]: normalizedRecord,
              }));
              serverAnalyticsByIdRef.current = {
                ...serverAnalyticsByIdRef.current,
                [analyticsStateKey]: normalizedRecord,
              };
              return normalizedRecord;
            }

            const force = options?.force === true;
            if (!force && serverAnalyticsByIdRef.current[analyticsStateKey]) {
              return serverAnalyticsByIdRef.current[analyticsStateKey];
            }

            setLoadingServerAnalyticsId(analyticsStateKey);
            try {
              let data = null;
              try {
                const overviewData = await fetchPlaygroundCachedDatabaseResourceJson(
                  backendUrl + "/servers/analytics/overview?"
                    + (analyticsKind ? "kind=" + encodeURIComponent(analyticsKind) + "&" : "")
                    + "period=" + encodeURIComponent(normalizedPeriod),
                  requestHeaders,
                  {
                    scopeKey: databaseListScopeKey,
                    ttlMs: PLAYGROUND_DATABASE_ANALYTICS_CACHE_TTL_MS,
                    force,
                    persist: true,
                    staleWhileRevalidate: !force,
                    priority: "low",
                  }
                );
                const overviewResources = Array.isArray(overviewData?.analytics?.resources)
                  ? overviewData.analytics.resources
                  : Array.isArray(overviewData?.resources)
                    ? overviewData.resources
                    : [];
                const overviewResource = overviewResources.find((resource) => String(resource?.id || "") === normalizedServerId) || null;
                if (overviewResource) {
                  const traffic = Array.isArray(overviewResource?.traffic)
                    ? overviewResource.traffic
                    : Array.isArray(overviewResource?.charts?.traffic)
                      ? overviewResource.charts.traffic
                      : Array.isArray(overviewResource?.charts?.traffic24h)
                        ? overviewResource.charts.traffic24h
                        : [];
                  const status = Array.isArray(overviewResource?.status)
                    ? overviewResource.status
                    : Array.isArray(overviewResource?.charts?.status)
                      ? overviewResource.charts.status
                      : traffic.map((bucket) => {
                          const total = Math.max(0, Number(bucket?.total || 0));
                          const clientErrors = Math.max(0, Number(bucket?.clientErrors || 0));
                          const serverErrors = Math.max(0, Number(bucket?.serverErrors || 0));
                          const success = Math.max(0, total - clientErrors - serverErrors);
                          return {
                            ...bucket,
                            total,
                            success,
                            successRate: total > 0 ? Math.round((success / total) * 1000) / 10 : 0,
                            clientErrors,
                            serverErrors,
                          };
                        });
                  const trafficSummary = traffic.reduce((summary, bucket) => {
                    summary.totalRequests += Math.max(0, Number(bucket?.total || 0));
                    summary.clientErrors += Math.max(0, Number(bucket?.clientErrors || 0));
                    summary.serverErrors += Math.max(0, Number(bucket?.serverErrors || 0));
                    summary.p95LatencyMs = Math.max(summary.p95LatencyMs, Math.max(0, Number(bucket?.p95LatencyMs || 0)));
                    return summary;
                  }, {
                    totalRequests: 0,
                    clientErrors: 0,
                    serverErrors: 0,
                    p95LatencyMs: 0,
                  });
                  const overviewSummary = overviewResource?.summary && typeof overviewResource.summary === "object"
                    ? overviewResource.summary
                    : {};
                  const totalRequests = Math.max(0, Number(
                    overviewSummary.totalRequests
                    ?? overviewSummary.totalRequests24h
                    ?? overviewResource.totalRequests
                    ?? trafficSummary.totalRequests
                  ) || 0);
                  const clientErrors = Math.max(0, Number(
                    overviewSummary.clientErrors
                    ?? overviewSummary.clientErrors24h
                    ?? overviewResource.clientErrors
                    ?? trafficSummary.clientErrors
                  ) || 0);
                  const serverErrors = Math.max(0, Number(
                    overviewSummary.serverErrors
                    ?? overviewSummary.serverErrors24h
                    ?? overviewResource.serverErrors
                    ?? trafficSummary.serverErrors
                  ) || 0);
                  const successfulRequests = Math.max(0, totalRequests - clientErrors - serverErrors);
                  const successRate = Number(
                    overviewSummary.successRate
                    ?? overviewSummary.successRate24h
                    ?? overviewResource.successRate
                    ?? (totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0)
                  ) || 0;
                  const p95LatencyMs = Math.max(0, Number(
                    overviewSummary.p95LatencyMs
                    ?? overviewResource.p95LatencyMs
                    ?? trafficSummary.p95LatencyMs
                  ) || 0);
                  data = {
                    ...overviewResource,
                    period: normalizedPeriod,
                    summary: {
                      ...overviewSummary,
                      totalRequests,
                      totalRequests24h: totalRequests,
                      successRate,
                      successRate24h: successRate,
                      clientErrors,
                      clientErrors24h: clientErrors,
                      serverErrors,
                      serverErrors24h: serverErrors,
                      p95LatencyMs,
                    },
                    charts: {
                      ...(overviewResource?.charts && typeof overviewResource.charts === "object" ? overviewResource.charts : {}),
                      traffic,
                      traffic24h: traffic,
                      status,
                      status24h: status,
                    },
                  };
                }
              } catch {
                data = null;
              }

              if (!data) {
                data = await fetchPlaygroundCachedDatabaseResourceJson(
                  buildPlaygroundServerAnalyticsUrl(backendUrl, normalizedServerId, normalizedPeriod),
                  requestHeaders,
                  {
                    scopeKey: databaseListScopeKey + "|server-analytics",
                    ttlMs: PLAYGROUND_DATABASE_ANALYTICS_CACHE_TTL_MS,
                    force,
                    priority: "low",
                  }
                );
              }

              const normalizedRecord = {
                ...data,
                period: normalizePlaygroundEnvironmentHomeChartPeriod(data?.period || normalizedPeriod),
                summary: {
                  ...(data?.summary && typeof data.summary === "object" ? data.summary : {}),
                  totalRequests: Math.max(0, Number(data?.summary?.totalRequests ?? data?.summary?.totalRequests24h ?? 0) || 0),
                  successRate: Number(data?.summary?.successRate ?? data?.summary?.successRate24h ?? 0) || 0,
                  clientErrors: Math.max(0, Number(data?.summary?.clientErrors ?? data?.summary?.clientErrors24h ?? 0) || 0),
                  serverErrors: Math.max(0, Number(data?.summary?.serverErrors ?? data?.summary?.serverErrors24h ?? 0) || 0),
                },
                charts: {
                  ...(data?.charts && typeof data.charts === "object" ? data.charts : {}),
                  traffic: Array.isArray(data?.charts?.traffic)
                    ? data.charts.traffic
                    : (Array.isArray(data?.charts?.traffic24h) ? data.charts.traffic24h : []),
                  status: Array.isArray(data?.charts?.status)
                    ? data.charts.status
                    : (Array.isArray(data?.charts?.status24h) ? data.charts.status24h : []),
                },
                loadedAt: new Date().toISOString(),
              };
              setServerAnalyticsById((current) => ({
                ...current,
                [analyticsStateKey]: normalizedRecord,
              }));
              serverAnalyticsByIdRef.current = {
                ...serverAnalyticsByIdRef.current,
                [analyticsStateKey]: normalizedRecord,
              };
              return normalizedRecord;
            } catch (error) {
              setServerLogsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load analytics.",
              }));
              return null;
            } finally {
              setLoadingServerAnalyticsId((current) => current === analyticsStateKey ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, normalizedEmbeddedServerKind, requestHeaders, resourceTemplatePreviewServerRecordById]);

          const loadServerAuthUsers = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }

            const force = options?.force === true;
            const existingUsers = serverAuthUsersById[normalizedServerId]?.users;
            if (!force && Array.isArray(existingUsers)) {
              return existingUsers;
            }

            setLoadingServerAuthUsersId(normalizedServerId);
            try {
              const response = await fetch(
                buildPlaygroundServerAuthUsersUrl(backendUrl, normalizedServerId, options?.limit || 200),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load auth users.");
              }

              const users = Array.isArray(data?.users) ? data.users : [];
              const record = {
                users,
                projectId: typeof data?.projectId === "string" ? data.projectId : "",
                nextPageToken: typeof data?.nextPageToken === "string" ? data.nextPageToken : "",
                loadedAt: new Date().toISOString(),
              };
              setServerAuthUsersById((current) => ({
                ...current,
                [normalizedServerId]: record,
              }));
              setServerAuthUsersState({
                error: "",
              });
              return users;
            } catch (error) {
              if (selectedServerIdRef.current === normalizedServerId) {
                setServerAuthUsersState({
                  error: error instanceof Error ? error.message : "Failed to load auth users.",
                });
              }
              return [];
            } finally {
              setLoadingServerAuthUsersId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, serverAuthUsersById]);

          const loadServerSecrets = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }

            const force = options?.force === true;
            const existingSecrets = serverSecretsById[normalizedServerId];
            if (!force && Array.isArray(existingSecrets)) {
              return existingSecrets;
            }

            setLoadingServerSecretsId(normalizedServerId);
            try {
              const response = await fetch(
                buildPlaygroundServerSecretsUrl(backendUrl, normalizedServerId),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load secrets.");
              }

              const sourceSecrets = Array.isArray(data?.secrets)
                ? data.secrets
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              const secrets = sourceSecrets.map(normalizePlaygroundSecretRecord).filter(Boolean);
              setServerSecretsById((current) => ({
                ...current,
                [normalizedServerId]: secrets,
              }));
              setServerSecretsState({
                error: "",
              });
              return secrets;
            } catch (error) {
              if (selectedServerIdRef.current === normalizedServerId) {
                setServerSecretsState({
                  error: error instanceof Error ? error.message : "Failed to load secrets.",
                });
              }
              return [];
            } finally {
              setLoadingServerSecretsId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, serverSecretsById]);

          const loadServerAgentRuntimeRuns = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }

            const force = options?.force === true;
            const existingRuns = serverAgentRuntimeRunsById[normalizedServerId];
            if (!force && Array.isArray(existingRuns)) {
              return existingRuns;
            }

            setLoadingServerAgentRuntimeRunsId(normalizedServerId);
            setServerAgentRuntimeRunsState((current) => ({
              ...current,
              error: "",
            }));

            try {
              const response = await fetch(
                buildPlaygroundServerRunsUrl(backendUrl, normalizedServerId, options?.limit || 80),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load runs.");
              }

              const runs = Array.isArray(data?.runs)
                ? data.runs
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              setServerAgentRuntimeRunsById((current) => ({
                ...current,
                [normalizedServerId]: runs,
              }));
              return runs;
            } catch (error) {
              setServerAgentRuntimeRunsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load runs.",
              }));
              return [];
            } finally {
              setLoadingServerAgentRuntimeRunsId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, serverAgentRuntimeRunsById]);

          const loadDatabaseAnalytics = useCallback(async (databaseId, options = {}) => {
            const normalizedDatabaseId = String(databaseId || "").trim();
            if (!normalizedDatabaseId || normalizedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return null;
            }
  	      const normalizedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(options?.period);
  	      const analyticsStateKey = buildPlaygroundDatabaseAnalyticsStateKey(normalizedDatabaseId, normalizedPeriod);

            if (resourceTemplatePreviewDatabaseRecordById[normalizedDatabaseId]) {
              const collections = Array.isArray(resourceTemplatePreviewDatabaseCollectionsById[normalizedDatabaseId])
                ? resourceTemplatePreviewDatabaseCollectionsById[normalizedDatabaseId]
                : [];
              const totalDocuments = collections.reduce((sum, collection) => sum + Math.max(0, Number(collection?.documentCount || 0) || 0), 0);
              const normalizedRecord = {
  	          period: normalizedPeriod,
                summary: {
                  totalCollections: collections.length,
                  totalDocuments,
  	            reads: 0,
  	            writes: 0,
  	            deletes: 0,
                  reads24h: 0,
                  writes24h: 0,
                  deletes24h: 0,
                },
                charts: {
  	            operations: [],
  	            volume: [],
                  operations24h: [],
                },
                loadedAt: new Date().toISOString(),
              };
              setDatabaseAnalyticsById((current) => ({
                ...current,
  	          [analyticsStateKey]: normalizedRecord,
              }));
              return normalizedRecord;
            }

            const force = options?.force === true;
  	      if (!force && databaseAnalyticsByIdRef.current[analyticsStateKey]) {
  	        return databaseAnalyticsByIdRef.current[analyticsStateKey];
            }

  	      setLoadingDatabaseAnalyticsId(analyticsStateKey);
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
  	          buildPlaygroundDatabaseAnalyticsUrl(backendUrl, normalizedDatabaseId, normalizedPeriod),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_ANALYTICS_CACHE_TTL_MS,
                  force,
                }
              );

              const analyticsSource = [
                data?.analytics,
                data?.data?.analytics,
                data?.data,
                data,
              ].find((candidate) =>
                candidate
                && typeof candidate === "object"
                && !Array.isArray(candidate)
                && (
                  candidate.summary && typeof candidate.summary === "object"
                  || candidate.charts && typeof candidate.charts === "object"
                )
              ) || {};
              const existingCollections = Array.isArray(databaseCollectionsByIdRef.current[normalizedDatabaseId])
                ? databaseCollectionsByIdRef.current[normalizedDatabaseId]
                : [];
              const fallbackTotalDocuments = existingCollections.reduce((sum, collection) =>
                sum + Math.max(0, Number(collection?.documentCount || 0) || 0),
                0
              );
              const summary = analyticsSource.summary && typeof analyticsSource.summary === "object" && !Array.isArray(analyticsSource.summary)
                ? analyticsSource.summary
                : {};
              const charts = analyticsSource.charts && typeof analyticsSource.charts === "object" && !Array.isArray(analyticsSource.charts)
                ? analyticsSource.charts
                : {};
              const normalizedRecord = {
                ...analyticsSource,
  	          period: normalizePlaygroundEnvironmentHomeChartPeriod(analyticsSource.period || normalizedPeriod),
                summary: {
                  ...summary,
                  totalCollections: Math.max(0, Number(summary.totalCollections ?? existingCollections.length) || 0),
                  totalDocuments: Math.max(0, Number(summary.totalDocuments ?? fallbackTotalDocuments) || 0),
  	            reads: Math.max(0, Number(summary.reads ?? summary.reads24h ?? 0) || 0),
  	            writes: Math.max(0, Number(summary.writes ?? summary.writes24h ?? 0) || 0),
  	            deletes: Math.max(0, Number(summary.deletes ?? summary.deletes24h ?? 0) || 0),
                  reads24h: Math.max(0, Number(summary.reads24h || 0) || 0),
                  writes24h: Math.max(0, Number(summary.writes24h || 0) || 0),
                  deletes24h: Math.max(0, Number(summary.deletes24h || 0) || 0),
                },
                charts: {
                  ...charts,
  	            operations: Array.isArray(charts.operations)
  	              ? charts.operations
  	              : (Array.isArray(charts.operations24h) ? charts.operations24h : []),
  	            volume: Array.isArray(charts.volume)
  	              ? charts.volume
  	              : (Array.isArray(charts.volume24h) ? charts.volume24h : []),
                  operations24h: Array.isArray(charts.operations24h) ? charts.operations24h : [],
                  volume24h: Array.isArray(charts.volume24h) ? charts.volume24h : [],
                },
                loadedAt: new Date().toISOString(),
              };

              setDatabaseAnalyticsById((current) => ({
                ...current,
  	          [analyticsStateKey]: normalizedRecord,
              }));
              setDatabaseSaveState((current) => current.error === "Database analytics response was empty."
                ? { ...current, error: "" }
                : current
              );
              return normalizedRecord;
            } catch (error) {
              if (selectedDatabaseIdRef.current === normalizedDatabaseId) {
                setDatabaseSaveState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load database analytics.",
                }));
              }
              return null;
            } finally {
  	        setLoadingDatabaseAnalyticsId((current) => current === analyticsStateKey ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewDatabaseCollectionsById, resourceTemplatePreviewDatabaseRecordById]);

          const loadServerLogs = useCallback(async (serverId, kind = "request", options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            const normalizedKind = ["request", "runtime", "deployment"].includes(String(kind || "").trim().toLowerCase())
              ? String(kind).trim().toLowerCase()
              : "request";
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }

            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              setServerLogsById((current) => ({
                ...current,
                [normalizedServerId]: {
                  ...(current[normalizedServerId] || {}),
                  [normalizedKind]: [],
                },
              }));
              return [];
            }

            const force = options?.force === true;
            const existingLogs = serverLogsById[normalizedServerId]?.[normalizedKind];
            if (!force && Array.isArray(existingLogs)) {
              return existingLogs;
            }

            const loadingKey = normalizedServerId + ":" + normalizedKind;
            setServerLogsState((current) => ({
              ...current,
              loadingKey,
              error: "",
            }));

            try {
              const response = await fetch(
                buildPlaygroundServerLogsUrl(backendUrl, normalizedServerId, normalizedKind, options?.limit || 80),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (response.status === 404) {
                setServerLogsById((current) => ({
                  ...current,
                  [normalizedServerId]: {
                    ...(current[normalizedServerId] || {}),
                    [normalizedKind]: [],
                  },
                }));
                return [];
              }
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load logs.");
              }

              const nextLogs = Array.isArray(data?.logs) ? data.logs : [];
              setServerLogsById((current) => ({
                ...current,
                [normalizedServerId]: {
                  ...(current[normalizedServerId] || {}),
                  [normalizedKind]: nextLogs,
                },
              }));
              return nextLogs;
            } catch (error) {
              setServerLogsState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load logs.",
              }));
              return [];
            } finally {
              setServerLogsState((current) => ({
                ...current,
                loadingKey: current.loadingKey === loadingKey ? "" : current.loadingKey,
              }));
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerRecordById, serverLogsById]);

          const loadServerDeployments = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }

            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              setServerDeploymentsById((current) => ({
                ...current,
                [normalizedServerId]: [],
              }));
              return [];
            }

            const force = options?.force === true;
            const existingDeployments = serverDeploymentsById[normalizedServerId];
            if (!force && Array.isArray(existingDeployments)) {
              return existingDeployments;
            }

            setLoadingServerDeploymentsId(normalizedServerId);
            setServerDeploymentHistoryState((current) => ({
              ...current,
              error: "",
            }));

            try {
              const response = await fetch(
                buildPlaygroundServerDeploymentsUrl(backendUrl, normalizedServerId),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (response.status === 404) {
                setServerDeploymentsById((current) => ({
                  ...current,
                  [normalizedServerId]: [],
                }));
                return [];
              }
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load deployments.");
              }

              const sourceDeployments = Array.isArray(data?.deployments)
                ? data.deployments
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              const deployments = sourceDeployments
                .map(normalizePlaygroundServerDeploymentRecord)
                .filter(Boolean);
              setServerDeploymentsById((current) => ({
                ...current,
                [normalizedServerId]: deployments,
              }));
              return deployments;
            } catch (error) {
              if (selectedServerIdRef.current === normalizedServerId) {
                setServerDeploymentHistoryState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load deployments.",
                }));
              }
              return [];
            } finally {
              setLoadingServerDeploymentsId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerRecordById, serverDeploymentsById]);

          const loadServerBindings = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return [];
            }

            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              setServerBindingsById((current) => ({
                ...current,
                [normalizedServerId]: [],
              }));
              return [];
            }

            setLoadingServerBindingsId(normalizedServerId);
            setServerBindingState((current) => ({
              ...current,
              error: "",
            }));

            try {
              const response = await fetch(buildPlaygroundServerBindingsUrl(backendUrl, normalizedServerId), {
                method: "GET",
                headers: requestHeaders,
                cache: "no-store",
                priority: "high",
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load connections.");
              }

              const bindings = Array.isArray(data?.bindings)
                ? data.bindings.map(normalizePlaygroundServerBindingRecord).filter(Boolean)
                : [];
              authoritativeServerBindingIdsRef.current.add(normalizedServerId);
              setServerBindingsById((current) => ({
                ...current,
                [normalizedServerId]: bindings,
              }));
              return bindings;
            } catch (error) {
              setServerBindingState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load connections.",
              }));
              return [];
            } finally {
              setLoadingServerBindingsId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerRecordById]);

          const loadServerContext = useCallback(async (serverId, options = {}) => {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }

            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              const context = normalizePlaygroundServerContextRecord({
                serverId: normalizedServerId,
                bindings: [],
                runtime: {
                  nodejs: "22",
                  region: "europe-west1",
                  preview: true,
                },
                diagnostics: {
                  warnings: [],
                },
              });
              setServerContextsById((current) => ({
                ...current,
                [normalizedServerId]: context,
              }));
              setServerBindingsById((current) => ({
                ...current,
                [normalizedServerId]: [],
              }));
              return context;
            }

            const force = options?.force === true;
            if (!force && serverContextsById[normalizedServerId]) {
              return serverContextsById[normalizedServerId];
            }

            setLoadingServerContextId(normalizedServerId);
            setServerRuntimeState((current) => ({
              ...current,
              error: "",
            }));

            try {
              const response = await fetch(buildPlaygroundServerContextUrl(backendUrl, normalizedServerId), {
                method: "GET",
                headers: requestHeaders,
                cache: "no-store",
                priority: "high",
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load runtime context.");
              }

              const context = normalizePlaygroundServerContextRecord(data);
              if (!context) {
                throw new Error("Runtime context response was empty.");
              }

              setServerContextsById((current) => ({
                ...current,
                [normalizedServerId]: context,
              }));
              if (!authoritativeServerBindingIdsRef.current.has(normalizedServerId)) {
                setServerBindingsById((current) => ({
                  ...current,
                  [normalizedServerId]: Array.isArray(context.bindings) ? context.bindings : [],
                }));
              }
              return context;
            } catch (error) {
              setServerRuntimeState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load runtime context.",
              }));
              return null;
            } finally {
              setLoadingServerContextId((current) => current === normalizedServerId ? "" : current);
            }
          }, [backendUrl, requestHeaders, resourceTemplatePreviewServerRecordById, serverContextsById]);

          const loadDatabases = useCallback(async (options = {}) => {
            const force = options?.force === true;
            const requestState = databaseListRequestRef.current;
            const requestScopeKey = databaseListScopeKeyRef.current;
            const cachedRecord = readPlaygroundDatabaseListCache(requestScopeKey);
            if (cachedRecord && Number(cachedRecord.loadedAt || 0) > 0 && Array.isArray(cachedRecord.items)) {
              setDatabases(cachedRecord.items);
              setHasLoadedDatabases(true);
              const cacheAgeMs = Date.now() - Number(cachedRecord.loadedAt || 0);
              if (!force && cacheAgeMs >= 0 && cacheAgeMs < PLAYGROUND_DATABASE_LIST_CACHE_TTL_MS) {
                return cachedRecord.items;
              }
            }
            if (!force && requestState.promise) {
              return requestState.promise;
            }
            const requestId = requestState.requestId + 1;
            requestState.requestId = requestId;
            setDatabaseListLoading(true);
            const request = (async () => {
              try {
                const useOverviewCatalog = options?.useOverviewCatalog === true;
                let nextDatabases = [];
                if (useOverviewCatalog) {
                  try {
                    const requestedPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(
                      options?.period || developServerOperationalMetricsPeriod
                    );
                    const data = await fetchPlaygroundCachedDatabaseResourceJson(
                      backendUrl + "/databases/analytics/overview?period=" + encodeURIComponent(requestedPeriod),
                      databaseRequestHeadersRef.current,
                      {
                        scopeKey: requestScopeKey,
                        ttlMs: PLAYGROUND_DATABASE_ANALYTICS_CACHE_TTL_MS,
                        force,
                        persist: true,
                        staleWhileRevalidate: false,
                        priority: "high",
                      }
                    );
                    const resources = Array.isArray(data?.analytics?.resources)
                      ? data.analytics.resources
                      : Array.isArray(data?.resources)
                        ? data.resources
                        : [];
                    nextDatabases = resources
                      .map((resource) => normalizePlaygroundDatabaseRecord(
                        resource?.database || resource?.resource || resource
                      ))
                      .filter((database) => database?.id);
                    writePlaygroundDatabaseListCache(requestScopeKey, nextDatabases);
                  } catch {
                    nextDatabases = await fetchPlaygroundDatabaseList(backendUrl, databaseRequestHeadersRef.current, {
                      force,
                      identity: databaseListIdentity,
                    });
                  }
                } else {
                  nextDatabases = await fetchPlaygroundDatabaseList(backendUrl, databaseRequestHeadersRef.current, {
                    force,
                    identity: databaseListIdentity,
                  });
                }
                if (databaseListScopeKeyRef.current !== requestScopeKey || databaseListRequestRef.current.requestId !== requestId) {
                  return nextDatabases;
                }
                setDatabases(nextDatabases);
                setHasLoadedDatabases(true);
                requestState.retryCount = 0;
                if (requestState.retryTimer) {
                  window.clearTimeout(requestState.retryTimer);
                  requestState.retryTimer = null;
                }
                setDatabaseSaveState((current) => ({
                  ...current,
                  error: "",
                }));
                setDatabaseDetailsById((current) => {
                  const next = { ...current };
                  nextDatabases.forEach((database) => {
                    if (!database?.id) return;
                    next[database.id] = normalizePlaygroundDatabaseRecord({
                      ...(next[database.id] || {}),
                      ...database,
                    });
                  });
                  return next;
                });

                if (options?.selectId) {
                  setSelectedDatabaseId(options.selectId);
                } else if (selectedDatabaseIdRef.current && !nextDatabases.some((database) => database.id === selectedDatabaseIdRef.current)) {
                  setSelectedDatabaseId("");
                }

                return nextDatabases;
              } catch (error) {
                if (databaseListScopeKeyRef.current !== requestScopeKey || databaseListRequestRef.current.requestId !== requestId) {
                  return [];
                }
                setDatabaseSaveState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load databases.",
                }));
                const staleRecord = readPlaygroundDatabaseListCache(requestScopeKey);
                const staleItems = Number(staleRecord?.loadedAt || 0) > 0 && Array.isArray(staleRecord?.items)
                  ? staleRecord.items
                  : null;
                if (Array.isArray(staleItems)) {
                  setDatabases(staleItems);
                  setHasLoadedDatabases(true);
                }
                if (options?.retry !== false && !requestState.retryTimer) {
                  const retryDelayMs = Math.min(15000, 750 * Math.pow(2, Math.min(requestState.retryCount, 4)));
                  requestState.retryCount += 1;
                  requestState.retryTimer = window.setTimeout(() => {
                    requestState.retryTimer = null;
                    void loadDatabases({
                      retry: true,
                      force: true,
                      useOverviewCatalog: options?.useOverviewCatalog === true,
                      period: options?.period,
                    });
                  }, retryDelayMs);
                }
                return Array.isArray(staleItems) ? staleItems : [];
              } finally {
                if (databaseListRequestRef.current.requestId === requestId) {
                  setDatabaseListLoading(false);
                }
              }
            })();
            requestState.promise = request;
            void request.finally(() => {
              if (requestState.promise === request) {
                requestState.promise = null;
              }
            });
            return request;
          }, [backendUrl, databaseListIdentity, databaseListScopeKey, developServerOperationalMetricsPeriod]);

          const loadDatabaseDetails = useCallback(async (databaseId, options = {}) => {
            if (!databaseId || databaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return null;
            }

            const templatePreviewDatabase = resourceTemplatePreviewDatabaseRecordById[databaseId] || null;
            if (templatePreviewDatabase) {
              setDatabaseDetailsById((current) => ({
                ...current,
                [databaseId]: templatePreviewDatabase,
              }));
              if (selectedDatabaseIdRef.current === databaseId) {
                setDraftDatabase(templatePreviewDatabase);
              }
              setDatabaseSaveState((current) => ({
                ...current,
                error: "",
              }));
              return templatePreviewDatabase;
            }

            setLoadingDatabaseId(databaseId);
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                backendUrl + "/databases/" + encodeURIComponent(databaseId),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_DETAIL_CACHE_TTL_MS,
                  force: options?.force === true,
                }
              );

              const normalized = getPlaygroundDatabaseResponseRecord(data);
              if (!normalized) {
                throw new Error("Database response was empty.");
              }

              setDatabaseDetailsById((current) => ({
                ...current,
                [databaseId]: normalized,
              }));
              if (selectedDatabaseIdRef.current === databaseId) {
                setDraftDatabase(normalized);
              }
              return normalized;
            } catch (error) {
              if (selectedDatabaseIdRef.current === databaseId) {
                setDatabaseSaveState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load database.",
                }));
              }
              return null;
            } finally {
              setLoadingDatabaseId((current) => current === databaseId ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewDatabaseRecordById]);

          const loadDatabaseCollections = useCallback(async (databaseId, options = {}) => {
            if (!databaseId || databaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return [];
            }

            const existingCollections = databaseCollectionsByIdRef.current[databaseId];
            if (options?.force !== true && Array.isArray(existingCollections)) {
              return existingCollections;
            }

            const templatePreviewCollections = resourceTemplatePreviewDatabaseCollectionsById[databaseId];
            if (Array.isArray(templatePreviewCollections)) {
              setDatabaseCollectionsById((current) => ({
                ...current,
                [databaseId]: templatePreviewCollections,
              }));
              if (selectedDatabaseIdRef.current === databaseId) {
                const currentSelectedCollectionId = selectedDatabaseCollectionIdRef.current;
                const nextCollectionId = templatePreviewCollections.some((item) => item.id === currentSelectedCollectionId)
                  ? currentSelectedCollectionId
                  : templatePreviewCollections[0]?.id || "";
                setSelectedDatabaseCollectionId(nextCollectionId);
                if (!nextCollectionId) {
                  setSelectedDatabaseDocumentId("");
                  setDatabaseDocumentEditorState({
                    documentId: "",
                    value: "{}",
                    initialValue: "{}",
                    error: "",
                    saveError: "",
                    saveMessage: "",
                    isSaving: false,
                  });
                }
              }
              return templatePreviewCollections;
            }

            setLoadingDatabaseCollectionsId(databaseId);
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                buildPlaygroundDatabaseCollectionsUrl(backendUrl, databaseId),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_COLLECTIONS_CACHE_TTL_MS,
                  force: options?.force === true,
                  persist: true,
                  priority: "high",
                }
              );

              const collections = Array.isArray(data?.collections) ? data.collections : [];
              setDatabaseCollectionsById((current) => ({
                ...current,
                [databaseId]: collections,
              }));
              if (selectedDatabaseIdRef.current === databaseId) {
                const currentSelectedCollectionId = selectedDatabaseCollectionIdRef.current;
                const nextCollectionId = collections.some((item) => item.id === currentSelectedCollectionId)
                  ? currentSelectedCollectionId
                  : collections[0]?.id || "";
                setSelectedDatabaseCollectionId(nextCollectionId);
                if (!nextCollectionId) {
                  setSelectedDatabaseDocumentId("");
                  setDatabaseDocumentEditorState({
                    documentId: "",
                    value: "{}",
                    initialValue: "{}",
                    error: "",
                    saveError: "",
                    saveMessage: "",
                    isSaving: false,
                  });
                }
              }
              return collections;
            } catch (error) {
              setDatabaseSaveState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to load collections.",
              }));
              return [];
            } finally {
              setLoadingDatabaseCollectionsId((current) => current === databaseId ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewDatabaseCollectionsById]);

          const loadDatabaseDocumentContent = useCallback(async (databaseId, collectionId, documentId, options = {}) => {
            if (!databaseId || !collectionId || !documentId || databaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return null;
            }

            const listKey = databaseId + ":" + collectionId;
            const summary = options?.documentSummary
              || (databaseDocumentsByCollectionKeyRef.current[listKey] || []).find((entry) => entry?.id === documentId)
              || { id: documentId };
            const applyDocument = (document) => {
              if (!document) return null;
              setDatabaseDocumentsByCollectionKey((current) => ({
                ...current,
                [listKey]: (Array.isArray(current[listKey]) ? current[listKey] : []).map((entry) => (
                  entry?.id === document.id ? { ...entry, ...document } : entry
                )),
              }));
              if (
                selectedDatabaseIdRef.current === databaseId
                && selectedDatabaseCollectionIdRef.current === collectionId
                && selectedDatabaseDocumentIdRef.current === documentId
              ) {
                const value = formatPlaygroundDatabaseDocumentJson(document.data);
                setDatabaseDocumentEditorState({
                  documentId,
                  value,
                  initialValue: value,
                  error: "",
                  saveError: "",
                  saveMessage: "",
                  isLoading: false,
                  isSaving: false,
                });
              }
              return document;
            };

            if (options?.useSummaryData === true && summary?.data && typeof summary.data === "object") {
              return applyDocument(getPlaygroundDatabaseDocumentResponseRecord(summary, summary));
            }

            if (
              selectedDatabaseIdRef.current === databaseId
              && selectedDatabaseCollectionIdRef.current === collectionId
              && selectedDatabaseDocumentIdRef.current === documentId
            ) {
              setDatabaseDocumentEditorState({
                documentId,
                value: "{}",
                initialValue: "{}",
                error: "",
                saveError: "",
                saveMessage: "",
                isLoading: true,
                isSaving: false,
              });
            }

            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                buildPlaygroundDatabaseDocumentUrl(backendUrl, databaseId, collectionId, documentId),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_DOCUMENTS_CACHE_TTL_MS,
                  force: options?.force === true,
                }
              );
              const document = getPlaygroundDatabaseDocumentResponseRecord(data, summary);
              if (!document) {
                throw new Error("Document response was empty.");
              }
              return applyDocument(document);
            } catch (error) {
              if (
                selectedDatabaseIdRef.current === databaseId
                && selectedDatabaseCollectionIdRef.current === collectionId
                && selectedDatabaseDocumentIdRef.current === documentId
              ) {
                setDatabaseDocumentEditorState((current) => ({
                  ...current,
                  isLoading: false,
                  error: error instanceof Error ? error.message : "Failed to load document.",
                }));
              }
              return null;
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders]);

          const loadDatabaseDocuments = useCallback(async (databaseId, collectionId, options = {}) => {
            if (!databaseId || !collectionId || databaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return [];
            }

            const loadingKey = databaseId + ":" + collectionId;
            const applyDocumentList = (documents, useSummaryData = false) => {
              const normalizedDocuments = (Array.isArray(documents) ? documents : []).map((document) => {
                if (useSummaryData) return document;
                const { data: _documentData, ...summary } = document && typeof document === "object" ? document : {};
                return summary;
              });
              setDatabaseDocumentsByCollectionKey((current) => ({
                ...current,
                [loadingKey]: normalizedDocuments,
              }));
              if (selectedDatabaseIdRef.current === databaseId && selectedDatabaseCollectionIdRef.current === collectionId) {
                const currentSelectedDocumentId = selectedDatabaseDocumentIdRef.current;
                const nextDocument = normalizedDocuments.find((entry) => entry.id === currentSelectedDocumentId) || normalizedDocuments[0] || null;
                const nextDocumentId = String(nextDocument?.id || "").trim();
                selectedDatabaseDocumentIdRef.current = nextDocumentId;
                setSelectedDatabaseDocumentId(nextDocumentId);
                if (nextDocumentId) {
                  void loadDatabaseDocumentContent(databaseId, collectionId, nextDocumentId, {
                    documentSummary: useSummaryData
                      ? (Array.isArray(documents) ? documents : []).find((entry) => entry?.id === nextDocumentId) || nextDocument
                      : nextDocument,
                    useSummaryData,
                  });
                } else {
                  setDatabaseDocumentEditorState({
                    documentId: "",
                    value: "{}",
                    initialValue: "{}",
                    error: "",
                    saveError: "",
                    saveMessage: "",
                    isLoading: false,
                    isSaving: false,
                  });
                }
              }
              return normalizedDocuments;
            };
            const collectionRecord = (databaseCollectionsByIdRef.current[databaseId] || [])
              .find((collection) => collection?.id === collectionId) || null;
            const hasDeclaredDocumentCount = Boolean(
              collectionRecord
              && Object.prototype.hasOwnProperty.call(collectionRecord, "documentCount")
              && Number.isFinite(Number(collectionRecord.documentCount))
            );
            if (hasDeclaredDocumentCount && Number(collectionRecord.documentCount) <= 0) {
              return applyDocumentList([]);
            }
            const existingDocuments = databaseDocumentsByCollectionKeyRef.current[loadingKey];
            if (options?.force !== true && Array.isArray(existingDocuments)) {
              return applyDocumentList(existingDocuments, existingDocuments.some((entry) => entry?.data != null));
            }
            const templatePreviewDocuments = resourceTemplatePreviewDatabaseDocumentsByCollectionKey[loadingKey];
            if (Array.isArray(templatePreviewDocuments)) {
              return applyDocumentList(templatePreviewDocuments, true);
            }

            if (options?.silent !== true) {
              setLoadingDatabaseDocumentsKey(loadingKey);
            }
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                buildPlaygroundDatabaseDocumentsUrl(backendUrl, databaseId, collectionId, options?.limit || 25),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_DOCUMENTS_CACHE_TTL_MS,
                  force: options?.force === true,
                }
              );

              return applyDocumentList(Array.isArray(data?.documents) ? data.documents : []);
            } catch (error) {
              if (options?.silent !== true) {
                setDatabaseDocumentEditorState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to load documents.",
                }));
              }
              return [];
            } finally {
              if (options?.silent !== true) {
                setLoadingDatabaseDocumentsKey((current) => current === loadingKey ? "" : current);
              }
            }
          }, [backendUrl, databaseListScopeKey, loadDatabaseDocumentContent, requestHeaders, resourceTemplatePreviewDatabaseDocumentsByCollectionKey]);

          const loadDatabaseBootstrap = useCallback(async (databaseId) => {
            const normalizedDatabaseId = String(databaseId || "").trim();
            if (!normalizedDatabaseId || normalizedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return false;
            }
            if (resourceTemplatePreviewDatabaseRecordById[normalizedDatabaseId]) {
              return false;
            }

            setLoadingDatabaseCollectionsId(normalizedDatabaseId);
            try {
              const data = await fetchPlaygroundCachedDatabaseResourceJson(
                buildPlaygroundDatabaseBootstrapUrl(backendUrl, normalizedDatabaseId, 1),
                requestHeaders,
                {
                  scopeKey: databaseListScopeKey,
                  ttlMs: PLAYGROUND_DATABASE_COLLECTIONS_CACHE_TTL_MS,
                  persist: true,
                  priority: "high",
                }
              );
              const collections = Array.isArray(data?.collections) ? data.collections : [];
              const preferredCollectionId = String(data?.selectedCollectionId || "").trim();
              const selectedCollectionId = collections.some((collection) => collection?.id === preferredCollectionId)
                ? preferredCollectionId
                : String(collections[0]?.id || "").trim();
              setDatabaseCollectionsById((current) => ({
                ...current,
                [normalizedDatabaseId]: collections,
              }));
              if (selectedDatabaseIdRef.current === normalizedDatabaseId) {
                selectedDatabaseCollectionIdRef.current = selectedCollectionId;
                setSelectedDatabaseCollectionId(selectedCollectionId);
                selectedDatabaseDocumentIdRef.current = "";
                setSelectedDatabaseDocumentId("");
                setDatabaseDocumentEditorState({
                  documentId: "",
                  value: "{}",
                  initialValue: "{}",
                  error: "",
                  saveError: "",
                  saveMessage: "",
                  isLoading: false,
                  isSaving: false,
                });
              }
              setDatabaseSaveState((current) => ({ ...current, error: "" }));
              return true;
            } catch {
              return false;
            } finally {
              setLoadingDatabaseCollectionsId((current) => current === normalizedDatabaseId ? "" : current);
            }
          }, [backendUrl, databaseListScopeKey, requestHeaders, resourceTemplatePreviewDatabaseRecordById]);

          const prefetchDatabaseBootstrap = useCallback((databaseId) => {
            const normalizedDatabaseId = String(databaseId || "").trim();
            if (!normalizedDatabaseId || normalizedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return;
            }
            void fetchPlaygroundCachedDatabaseResourceJson(
              buildPlaygroundDatabaseBootstrapUrl(backendUrl, normalizedDatabaseId, 1),
              requestHeaders,
              {
                scopeKey: databaseListScopeKey,
                ttlMs: PLAYGROUND_DATABASE_COLLECTIONS_CACHE_TTL_MS,
                persist: true,
                priority: "high",
              }
            ).catch(() => {});
          }, [backendUrl, databaseListScopeKey, requestHeaders]);

          const loadEnvironmentRuntimeStatus = useCallback(async (environmentId) => {
            const normalizedEnvironmentId = String(environmentId || "").trim();
            if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              setEnvironmentRuntimeState({
                status: "idle",
                containerId: "",
                message: "",
              });
              return null;
            }

            try {
              const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/status", {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load environment status.");
              }
              if (selectedEnvironmentIdRef.current !== normalizedEnvironmentId) {
                return data;
              }
              setEnvironmentRuntimeState({
                status: String(data?.status || "stopped").trim().toLowerCase() || "stopped",
                containerId: String(data?.containerId || "").trim(),
                message: String(data?.message || "").trim(),
              });
              return data;
            } catch (error) {
              if (selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
                setEnvironmentRuntimeState({
                  status: "error",
                  containerId: "",
                  message: error instanceof Error ? error.message : "Failed to load environment status.",
                });
              }
              return null;
            }
          }, [backendUrl, requestHeaders]);

          const loadEnvironmentGuiScreenshot = useCallback(async (environmentId, options = {}) => {
            const normalizedEnvironmentId = String(environmentId || "").trim();
            if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return false;
            }

            const maxAttempts = Math.max(1, Math.min(10, Number(options?.attempts) || 1));
            const retryDelayMs = Math.max(250, Math.min(2000, Number(options?.retryDelayMs) || 500));

            setEnvironmentGuiState((current) => ({
              ...current,
              isLoading: true,
              error: "",
            }));

            let lastMessage = "Failed to open the live desktop.";

            for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
              try {
                const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/gui/session", {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                  cache: "no-store",
                });
                if (!response.ok) {
                  lastMessage = await readEnvironmentGuiErrorMessage(response, "Failed to create desktop session.");
                  if (response.status === 409 && selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
                    setEnvironmentRuntimeState({
                      status: "stopped",
                      containerId: "",
                      message: "Container not running",
                    });
                  }
                  if ((response.status === 409 || response.status === 503) && attempt < maxAttempts - 1) {
                    await new Promise((resolve) => window.setTimeout(resolve, retryDelayMs));
                    continue;
                  }
                  throw new Error(lastMessage);
                }

                const data = await response.json().catch(() => ({}));
                if (selectedEnvironmentIdRef.current !== normalizedEnvironmentId) {
                  return false;
                }

                const websocketPath = String(data?.websocketPath || "").trim();
                if (!websocketPath) {
                  throw new Error("Desktop session did not return a websocket path.");
                }

                const localViewerWsUrl = new URL("/api/real/ws/vnc", window.location.origin);
                localViewerWsUrl.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
                if (websocketPath.startsWith("/api/real/ws/vnc")) {
                  const proxiedWebsocketUrl = new URL(websocketPath, window.location.origin);
                  localViewerWsUrl.search = proxiedWebsocketUrl.search;
                } else {
                  const backendTarget = new URL(backendUrl);
                  const websocketUrl = new URL(websocketPath, backendTarget);
                  websocketUrl.protocol = websocketUrl.protocol === "https:"
                    ? "wss:"
                    : websocketUrl.protocol === "http:"
                      ? "ws:"
                      : websocketUrl.protocol;
                  localViewerWsUrl.searchParams.set("upstream", websocketUrl.toString());
                }

                const viewerUrl = new URL("/environment-gui/viewer", window.location.origin);
                viewerUrl.searchParams.set("wsUrl", localViewerWsUrl.toString());
                viewerUrl.searchParams.set("title", draftEnvironment?.name || "Environment Desktop");
                viewerUrl.searchParams.set("environmentId", normalizedEnvironmentId);
                viewerUrl.searchParams.set("ts", String(Date.now()));
                replaceEnvironmentGuiFrameUrl(viewerUrl.toString());
                setEnvironmentGuiState((current) => ({
                  ...current,
                  isLoading: false,
                  error: "",
                  lastLoadedAt: new Date().toISOString(),
                }));
                return true;
              } catch (error) {
                lastMessage = error instanceof Error ? error.message : "Failed to create desktop session.";
                if (attempt < maxAttempts - 1) {
                  await new Promise((resolve) => window.setTimeout(resolve, retryDelayMs));
                  continue;
                }
              }
            }

            if (selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
              setEnvironmentGuiState((current) => ({
                ...current,
                isLoading: false,
                error: lastMessage,
              }));
            }
            return false;
          }, [backendUrl, draftEnvironment?.name, requestHeaders]);

          const sendEnvironmentGuiAction = useCallback(async (actionPayload, options = {}) => {
            const normalizedEnvironmentId = String(options?.environmentId || selectedEnvironmentIdRef.current || "").trim();
            if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return false;
            }

            setEnvironmentGuiState((current) => ({
              ...current,
              error: "",
            }));

            try {
              const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/gui/action", {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(actionPayload),
              });
              if (!response.ok) {
                const message = await readEnvironmentGuiErrorMessage(response, "Failed to execute desktop action.");
                if (selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
                  setEnvironmentGuiState((current) => ({
                    ...current,
                    error: message,
                  }));
                }
                return false;
              }

              return true;
            } catch (error) {
              if (selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
                setEnvironmentGuiState((current) => ({
                  ...current,
                  error: error instanceof Error ? error.message : "Failed to execute desktop action.",
                }));
              }
              return false;
            }
          }, [backendUrl, requestHeaders]);

          const launchEnvironmentGuiApp = useCallback(async (app) => {
            const normalizedApp = String(app || "").trim().toLowerCase();
            if (!normalizedApp) {
              return false;
            }
            if (draftEnvironment?.guiEnabled === false) {
              setEnvironmentGuiState((current) => ({
                ...current,
                error: "GUI is disabled for this environment. Turn it on and restart the environment to use desktop apps.",
              }));
              return false;
            }
            return await sendEnvironmentGuiAction({
              action: "launch_app",
              app: normalizedApp,
            });
          }, [draftEnvironment?.guiEnabled, sendEnvironmentGuiAction]);

          const stopEnvironmentRuntime = useCallback(async (environmentId) => {
            const normalizedEnvironmentId = String(environmentId || "").trim();
            if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return false;
            }

            const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/stop", {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({}),
            });
            if (!response.ok) {
              const message = await readEnvironmentGuiErrorMessage(response, "Failed to stop the environment.");
              throw new Error(message);
            }
            if (selectedEnvironmentIdRef.current === normalizedEnvironmentId) {
              setEnvironmentRuntimeState({
                status: "stopped",
                containerId: "",
                message: "Container stopped",
              });
            }
            invalidateComputersOverviewAnalytics({
              backendUrl,
              headers: requestHeaders,
              identity: currentUserId || currentUserEmail || "session",
            });
            return true;
          }, [backendUrl, currentUserEmail, currentUserId, requestHeaders]);

          useEffect(() => {
            setEnvironmentDetailsById((current) => {
              const next = {};
              environments.forEach((environment) => {
                if (!environment?.id) return;
                next[environment.id] = normalizePlaygroundEnvironmentRecord({
                  ...(current[environment.id] || {}),
                  ...environment,
                });
              });
              return next;
            });
          }, [environments]);

          useEffect(() => {
            if (selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
            if (selectedEnvironmentId && orderedEnvironments.some((environment) => environment.id === selectedEnvironmentId)) {
              return;
            }
            const fallbackEnvironment = orderedEnvironments.find((environment) => environment.isDefault) || orderedEnvironments[0] || null;
            setSelectedEnvironmentId(fallbackEnvironment?.id || "");
          }, [orderedEnvironments, selectedEnvironmentId]);

          useEffect(() => {
            const metricsKind = normalizePlaygroundServerOverviewKind(
              developServerOperationalMetrics?.scopeKind
            );
            if (
              !embeddedInResources
              || resourceMode !== "servers"
              || !normalizedEmbeddedServerKind
              || ["database", "voice_agent"].includes(normalizedEmbeddedServerKind)
              || metricsKind !== normalizedEmbeddedServerKind
              || !Array.isArray(developServerOperationalMetrics?.resources)
            ) {
              return;
            }
            const metricServers = developServerOperationalMetrics.resources
              .map((resource) => normalizePlaygroundServerRecord(
                resource?.server || resource?.resource || resource
              ))
              .filter((server) => (
                server?.id
                && canonicalizePlaygroundServerKind(server.kind) === normalizedEmbeddedServerKind
              ));
            const metricScopeKey = databaseListScopeKey
              + "|servers|"
              + normalizedEmbeddedServerKind;
            const authoritativeCatalogReady = authoritativeServerListScopesRef.current.has(metricScopeKey)
              || (hasLoadedServers && loadedServerListScope === metricScopeKey);
            if (authoritativeCatalogReady || metricServers.length === 0) {
              return;
            }

            // Analytics can make the first paint useful, but the catalog loader owns readiness.
            setServers(metricServers);
            setServerDetailsById((current) => {
              const next = { ...current };
              metricServers.forEach((server) => {
                if (authoritativeServerDetailIdsRef.current.has(server.id)) return;
                next[server.id] = normalizePlaygroundServerRecord({
                  ...(next[server.id] || {}),
                  ...server,
                });
              });
              return next;
            });
          }, [
            databaseListScopeKey,
            developServerOperationalMetrics?.resources,
            developServerOperationalMetrics?.scopeKind,
            embeddedInResources,
            hasLoadedServers,
            loadedServerListScope,
            normalizedEmbeddedServerKind,
            resourceMode,
          ]);

          useEffect(() => {
            if (
              embeddedInResources
              && resourceMode === "servers"
              && ["database", "voice_agent"].includes(normalizedEmbeddedServerKind)
            ) {
              return;
            }
            const requestedKind = embeddedInResources && resourceMode === "servers"
              ? normalizedEmbeddedServerKind
              : "";
            const desiredScopeKey = databaseListScopeKey
              + "|servers|"
              + (requestedKind || "all");
            if (
              (hasLoadedServers && loadedServerListScope === desiredScopeKey)
              || (
                serverListRequestRef.current.scopeKey === desiredScopeKey
                && serverListRequestRef.current.promise
              )
            ) {
              return;
            }
            void loadServers({
              kind: requestedKind,
              skipCostRefresh: Boolean(embeddedInResources),
            });
          }, [
            databaseListScopeKey,
            embeddedInResources,
            hasLoadedServers,
            loadServers,
            loadedServerListScope,
            normalizedEmbeddedServerKind,
            resourceMode,
          ]);

          useEffect(() => {
            if (!embeddedInResources || resourceMode !== "servers" || normalizedEmbeddedServerKind !== "voice_agent") {
              return;
            }
            void loadVoiceAgents();
          }, [embeddedInResources, loadVoiceAgents, normalizedEmbeddedServerKind, resourceMode]);

          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (selectedServerId === PLAYGROUND_SERVER_DRAFT_ID || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return;
            }
            if (selectedServerId && visibleDisplayServerResources.some((resource) => resource.resourceType !== "database" && resource.id === selectedServerId)) {
              return;
            }
            if (!selectedServerId && selectedDatabaseId && visibleDisplayServerResources.some((resource) => resource.resourceType === "database" && resource.id === selectedDatabaseId)) {
              return;
            }
            const firstResource = visibleDisplayServerResources[0] || null;
            if (!firstResource) {
              setSelectedServerId("");
              setSelectedDatabaseId("");
              return;
            }
            if (firstResource.resourceType === "database") {
              setSelectedServerId("");
              setSelectedDatabaseId(firstResource.id);
              return;
            }
            setSelectedDatabaseId("");
            setSelectedServerId(firstResource.id || "");
          }, [orderedDatabases, orderedServers, resourceMode, selectedDatabaseId, selectedServerId, visibleDisplayServerResources]);

          useEffect(() => {
            if (!toolbarPopover) return;

            const focusFrame = toolbarPopover === "search"
              ? window.requestAnimationFrame(() => {
                  if (searchPopupInputRef.current) {
                    searchPopupInputRef.current.focus();
                    searchPopupInputRef.current.select();
                  }
                })
              : 0;

            function handleKeyDown(event) {
              if (event.key === "Escape") {
                setToolbarPopover("");
              }
            }

            window.addEventListener("keydown", handleKeyDown);
            return () => {
              if (focusFrame) {
                window.cancelAnimationFrame(focusFrame);
              }
              window.removeEventListener("keydown", handleKeyDown);
            };
          }, [toolbarPopover]);

          useEffect(() => {
            if (!resourcesOverviewToolbarPopover) return undefined;

            function handleResourcesOverviewToolbarPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !resourcesOverviewToolbarRef.current || resourcesOverviewToolbarRef.current.contains(target)) {
                return;
              }
              setResourcesOverviewToolbarPopover("");
            }

            document.addEventListener("mousedown", handleResourcesOverviewToolbarPopoverPointerDown);
            return () => document.removeEventListener("mousedown", handleResourcesOverviewToolbarPopoverPointerDown);
          }, [resourcesOverviewToolbarPopover]);

          useEffect(() => {
            if (!serverLogsToolbarPopover) return undefined;

            function handleServerLogsToolbarPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !serverLogsToolbarRef.current || serverLogsToolbarRef.current.contains(target)) {
                return;
              }
              setServerLogsToolbarPopover("");
            }

            document.addEventListener("mousedown", handleServerLogsToolbarPopoverPointerDown);
            return () => document.removeEventListener("mousedown", handleServerLogsToolbarPopoverPointerDown);
          }, [serverLogsToolbarPopover]);

          useEffect(() => {
            setResourcesOverviewFilter("all");
            setResourcesOverviewSort("name");
            setResourcesOverviewSortDirection("asc");
            setResourcesOverviewToolbarPopover("");
            closeEnvironmentListActionMenu({ animate: false });
            closeEnvironmentBulkActionMenu({ animate: false });
          }, [resourceMode]);

          useEffect(() => {
            const isDetailVisible = !(
              isHomeViewActive
              || (resourceMode === "servers" ? (!selectedServerId && !selectedDatabaseId) : !selectedEnvironmentId)
            );
            if (!isDetailVisible) {
              return;
            }
            const frameId = window.requestAnimationFrame(() => {
              [
                resourcesDetailScrollRef.current,
                environmentDetailMainRef.current?.querySelector(".playground-environments-detail-scroll"),
                serverDetailMainRef.current?.querySelector(".playground-environments-detail-scroll"),
              ].forEach((node) => {
                if (node && typeof node.scrollTop === "number") {
                  node.scrollTop = 0;
                }
              });
            });
            return () => window.cancelAnimationFrame(frameId);
          }, [isHomeViewActive, resourceMode, selectedDatabaseId, selectedEnvironmentId, selectedServerId]);

          useEffect(() => {
            if (resourceMode !== "computers") {
              return;
            }
            void loadAvailableRuntimeOptions();
          }, [loadAvailableRuntimeOptions, resourceMode]);

          useEffect(() => {
            return () => {
              if (environmentGuiClickTimerRef.current) {
                window.clearTimeout(environmentGuiClickTimerRef.current);
                environmentGuiClickTimerRef.current = null;
              }
              if (environmentGuiScrollTimerRef.current) {
                window.clearTimeout(environmentGuiScrollTimerRef.current);
                environmentGuiScrollTimerRef.current = null;
              }
              revokeEnvironmentGuiFrameUrl(environmentGuiFrameUrl);
            };
          }, [environmentGuiFrameUrl]);

          useEffect(() => {
            if (resourceMode !== "computers") {
              return;
            }
            if (!selectedEnvironmentId || selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              replaceEnvironmentGuiFrameUrl("");
              setEnvironmentGuiOpen(false);
              setEnvironmentGuiInputValue("");
              setEnvironmentGuiState({
                isStarting: false,
                isLoading: false,
                error: "",
                lastLoadedAt: "",
              });
              setEnvironmentRuntimeState({
                status: "idle",
                containerId: "",
                message: "",
              });
              return;
            }

            replaceEnvironmentGuiFrameUrl("");
            setEnvironmentGuiOpen(false);
            setEnvironmentGuiInputValue("");
            setEnvironmentGuiState({
              isStarting: false,
              isLoading: false,
              error: "",
              lastLoadedAt: "",
            });
            void loadEnvironmentRuntimeStatus(selectedEnvironmentId);
          }, [loadEnvironmentRuntimeStatus, resourceMode, selectedEnvironmentId]);

          useEffect(() => {
            if (resourceMode !== "computers") {
              return;
            }
            if (!selectedEnvironmentId || selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
            if (environmentAnalyticsById[selectedEnvironmentId]) {
              return;
            }
            void loadEnvironmentAnalytics(selectedEnvironmentId);
          }, [environmentAnalyticsById, loadEnvironmentAnalytics, resourceMode, selectedEnvironmentId]);

          useEffect(() => {
            if (resourceMode !== "computers" || !isHomeViewActive) {
              return undefined;
            }
            const period = normalizePlaygroundEnvironmentHomeChartPeriod(environmentHomeChartTimescale);
            const requestOptions = {
              backendUrl,
              headers: requestHeaders,
              identity: currentUserId || currentUserEmail || "session",
              period,
            };
            const cached = readCachedComputersOverviewAnalytics(requestOptions);
            setComputersOverviewAnalyticsState((current) => {
              const isSameScope = current.scopeKey === computersOverviewAnalyticsScopeKey;
              const currentDataByPeriod = isSameScope ? current.dataByPeriod : {};
              return {
                scopeKey: computersOverviewAnalyticsScopeKey,
                dataByPeriod: cached?.data
                  ? { ...currentDataByPeriod, [period]: cached.data }
                  : currentDataByPeriod,
                loadingPeriod: cached?.data ? "" : period,
                errorsByPeriod: isSameScope ? { ...current.errorsByPeriod, [period]: "" } : {},
              };
            });

            let isActive = true;
            void fetchComputersOverviewAnalytics(requestOptions).then((data) => {
              if (!isActive) return;
              computersOverviewAnalyticsFallbackScopeRef.current = "";
              setComputersOverviewAnalyticsState((current) => {
                if (current.scopeKey !== computersOverviewAnalyticsScopeKey) return current;
                return {
                  ...current,
                  dataByPeriod: { ...current.dataByPeriod, [period]: data },
                  loadingPeriod: current.loadingPeriod === period ? "" : current.loadingPeriod,
                  errorsByPeriod: { ...current.errorsByPeriod, [period]: "" },
                };
              });
            }).catch((error) => {
              if (!isActive) return;
              const errorMessage = error instanceof Error ? error.message : "Failed to load computer analytics.";
              const shouldUseLegacyFallback = error instanceof ComputersOverviewAnalyticsRequestError
                && (error.status === 404 || error.status === 501);
              setComputersOverviewAnalyticsState((current) => {
                if (current.scopeKey !== computersOverviewAnalyticsScopeKey) return current;
                return {
                  ...current,
                  loadingPeriod: current.loadingPeriod === period ? "" : current.loadingPeriod,
                  errorsByPeriod: { ...current.errorsByPeriod, [period]: shouldUseLegacyFallback ? "" : errorMessage },
                };
              });
              const fallbackKey = computersOverviewAnalyticsScopeKey + "|" + period;
              if (shouldUseLegacyFallback && computersOverviewAnalyticsFallbackScopeRef.current !== fallbackKey) {
                computersOverviewAnalyticsFallbackScopeRef.current = fallbackKey;
                void loadEnvironmentHomeCostSummary(period);
                void loadEnvironmentHomeCostBreakdown(period);
                void loadEnvironmentHomeChartSummaries(period);
                void loadEnvironmentHomeChartBreakdowns(period);
              }
            });

            return () => {
              isActive = false;
            };
          }, [
            backendUrl,
            computersOverviewAnalyticsScopeKey,
            currentUserEmail,
            currentUserId,
            environmentHomeChartTimescale,
            isHomeViewActive,
            loadEnvironmentHomeChartBreakdowns,
            loadEnvironmentHomeChartSummaries,
            loadEnvironmentHomeCostBreakdown,
            loadEnvironmentHomeCostSummary,
            requestHeaders,
            resourceMode,
          ]);

          useEffect(() => {
            if (resourceMode !== "computers") {
              return;
            }
            if (!selectedEnvironmentId || selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              environmentSeededSelectionRef.current = selectedEnvironmentId;
              if (selectedEnvironmentId !== PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
                setDraftEnvironment(null);
                resetEditorAuxiliaryState();
              }
              return;
            }

            if (environmentSeededSelectionRef.current === selectedEnvironmentId) {
              return;
            }
            environmentSeededSelectionRef.current = selectedEnvironmentId;

            const seedEnvironment = environmentDetailsById[selectedEnvironmentId]
              || orderedEnvironments.find((environment) => environment.id === selectedEnvironmentId)
              || null;

            resetEditorAuxiliaryState();
            setEnvironmentDetailsCollapsed(false);
            setEnvironmentDetailTab("general");
            const normalizedSeedEnvironment = seedEnvironment ? normalizePlaygroundEnvironmentRecord(seedEnvironment) : null;
            if (normalizedSeedEnvironment) {
              rememberEnvironmentVersionBaseline(normalizedSeedEnvironment, { force: true });
            }
            setDraftEnvironment(normalizedSeedEnvironment);
            void loadEnvironmentDetails(selectedEnvironmentId);
          }, [environmentDetailsById, loadEnvironmentDetails, orderedEnvironments, resourceMode, selectedEnvironmentId]);

          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              serverSeededSelectionRef.current = selectedServerId;
              if (selectedServerId !== PLAYGROUND_SERVER_DRAFT_ID) {
                setDraftServer(null);
                resetServerEditorAuxiliaryState();
              }
              return;
            }

            if (serverSeededSelectionRef.current === selectedServerId) {
              return;
            }
            serverSeededSelectionRef.current = selectedServerId;

            const seedServer = serverDetailsById[selectedServerId]
              || orderedServers.find((server) => server.id === selectedServerId)
              || null;

            resetServerEditorAuxiliaryState();
            setServerDetailsCollapsed(false);
            setDraftServer(seedServer ? normalizePlaygroundServerRecord(seedServer) : null);
            const seedServerKind = canonicalizePlaygroundServerKind(
              seedServer?.kind || normalizedEmbeddedServerKind
            );
            if (["api", "auth", "agent_runtime", "function", "payments", "secrets", "web_app"].includes(seedServerKind)) {
              void loadServerDetailBootstrap(selectedServerId, seedServerKind);
            } else {
              void loadServerDetails(selectedServerId);
              if (seedServerKind !== "voice_agent") void loadServerFiles(selectedServerId);
              if (seedServerKind !== "voice_agent") void loadServerBindings(selectedServerId);
            }
          }, [loadServerBindings, loadServerDetailBootstrap, loadServerDetails, loadServerFiles, normalizedEmbeddedServerKind, orderedServers, resourceMode, selectedServerId, serverDetailsById]);

          useEffect(() => {
            if (
              resourceMode !== "servers"
              || !selectedServerId
              || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID
            ) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            const activeServerKind = canonicalizePlaygroundServerKind(activeServer?.kind);
            if (!["function", "web_app"].includes(activeServerKind)) {
              return;
            }
            if (
              serverContextsById[selectedServerId]
              || serverDetailBootstrapRequestRef.current.get(selectedServerId)?.promise
              || loadingServerContextId === selectedServerId
            ) {
              return;
            }
            void loadServerContext(selectedServerId);
          }, [
            draftServer,
            loadServerContext,
            resourceMode,
            selectedServerId,
            selectedServerSnapshot,
            serverContextsById,
          ]);

          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (!activeServer?.id || canonicalizePlaygroundServerKind(activeServer.kind) !== "auth") {
              return;
            }
            if (authDetailTab !== "users") {
              return;
            }
            if (serverAuthUsersById[selectedServerId]?.users) {
              return;
            }
            if (
              loadingServerAuthUsersId === selectedServerId
              || serverDetailBootstrapRequestRef.current.get(selectedServerId)?.promise
            ) {
              return;
            }
            void loadServerAuthUsers(selectedServerId);
          }, [authDetailTab, draftServer, loadServerAuthUsers, loadingServerAuthUsersId, resourceMode, selectedServerId, selectedServerSnapshot, serverAuthUsersById]);

          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (!activeServer?.id || canonicalizePlaygroundServerKind(activeServer.kind) !== "secrets") {
              return;
            }
            if (secretsDetailTab !== "secrets") {
              return;
            }
            if (Array.isArray(serverSecretsById[selectedServerId])) {
              return;
            }
            if (
              loadingServerSecretsId === selectedServerId
              || serverDetailBootstrapRequestRef.current.get(selectedServerId)?.promise
            ) {
              return;
            }
            void loadServerSecrets(selectedServerId);
          }, [draftServer, loadServerSecrets, loadingServerSecretsId, resourceMode, secretsDetailTab, selectedServerId, selectedServerSnapshot, serverSecretsById]);

          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (!activeServer?.id || canonicalizePlaygroundServerKind(activeServer.kind) !== "agent_runtime") {
              return;
            }
            if (agentRuntimeDetailTab !== "threads") {
              return;
            }
            if (Array.isArray(serverAgentRuntimeRunsById[selectedServerId])) {
              return;
            }
            if (loadingServerAgentRuntimeRunsId === selectedServerId) {
              return;
            }
            void loadServerAgentRuntimeRuns(selectedServerId);
          }, [agentRuntimeDetailTab, draftServer, loadServerAgentRuntimeRuns, loadingServerAgentRuntimeRunsId, resourceMode, selectedServerId, selectedServerSnapshot, serverAgentRuntimeRunsById]);

          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (!activeServer?.id) {
              return;
            }
            if (canonicalizePlaygroundServerKind(activeServer.kind) === "voice_agent") {
              return;
            }
            const normalizedKind = canonicalizePlaygroundServerKind(activeServer.kind);
            const isSourceDeployableServer = ["web_app", "function"].includes(normalizedKind);
            const isOperationalDetailServer = ["web_app", "function", "auth", "agent_runtime", "secrets", "payments"].includes(normalizedKind);
            if (!isOperationalDetailServer && !activeServer.cloudRunServiceName && !activeServer.serviceUrl) {
              return;
            }
            if (isSourceDeployableServer && serverDetailTab !== "usage") {
              return;
            }
            if (normalizedKind === "auth" && authDetailTab !== "usage") {
              return;
            }
            if (normalizedKind === "secrets" && secretsDetailTab !== "usage") {
              return;
            }
            if (normalizedKind === "agent_runtime" && agentRuntimeDetailTab !== "usage") {
              return;
            }
            if (normalizedKind === "payments" && serverDetailTab !== "usage") {
              return;
            }
            const analyticsPeriod = isOperationalDetailServer ? serverDetailChartTimescale : "day";
            const analyticsStateKey = buildPlaygroundServerAnalyticsStateKey(selectedServerId, analyticsPeriod);
            if (serverAnalyticsByIdRef.current[analyticsStateKey]) {
              return;
            }
            void loadServerAnalytics(selectedServerId, { period: analyticsPeriod });
          }, [agentRuntimeDetailTab, authDetailTab, draftServer, loadServerAnalytics, resourceMode, secretsDetailTab, selectedServerId, selectedServerSnapshot, serverDetailChartTimescale, serverDetailTab]);

          useEffect(() => {
            if (resourceMode !== "servers" || serverAnalyticsView !== "analytics") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            if (["auth", "agent_runtime", "voice_agent", "secrets", "payments"].includes(canonicalizePlaygroundServerKind(activeServer?.kind))) {
              return;
            }
            void loadServerAnalytics(selectedServerId);
            void loadServerLogs(selectedServerId, serverLogsState.kind);
          }, [draftServer, loadServerAnalytics, loadServerLogs, resourceMode, selectedServerId, selectedServerSnapshot, serverAnalyticsView, serverLogsState.kind]);

          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            const activeServerKind = canonicalizePlaygroundServerKind(activeServer?.kind);
            if (!["web_app", "function"].includes(activeServerKind)) {
              return;
            }
            const isSourceServerUsageActivity = serverDetailTab === "usage";
            if (!isSourceServerUsageActivity) {
              return;
            }
            const activityTab = serverUsageActivityTab;
            if (activityTab === "logs") {
              void loadServerLogs(selectedServerId, serverLogsState.kind);
            } else if (activityTab === "history") {
              void loadServerDeployments(selectedServerId);
            }
          }, [draftServer, loadServerDeployments, loadServerLogs, resourceMode, selectedServerId, selectedServerSnapshot, serverDetailTab, serverLogsState.kind, serverUsageActivityTab]);

          useEffect(() => {
            if (resourceMode !== "servers" || serverDetailTab !== "code") {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const activeServer = draftServer?.id === selectedServerId ? draftServer : selectedServerSnapshot;
            const activeServerKind = canonicalizePlaygroundServerKind(activeServer?.kind);
            if (!["function", "web_app"].includes(activeServerKind)) {
              return;
            }
            if (!hasLoadedCurrentServerFiles || loadingServerFilesId === selectedServerId) {
              return;
            }
            if (serverFileEditorState.path && currentServerFiles.some((entry) => entry.path === serverFileEditorState.path)) {
              return;
            }

            const preferredSourcePath = activeServerKind === "web_app"
              ? PLAYGROUND_DEFAULT_WEB_APP_SOURCE_PATH
              : PLAYGROUND_DEFAULT_FUNCTION_SOURCE_PATH;
            const preferredEntry = currentServerFiles.find((entry) => !entry?.isFolder && entry.path === preferredSourcePath && isPlaygroundTextPreviewable(entry))
              || currentServerFiles.find((entry) => !entry?.isFolder && isPlaygroundTextPreviewable(entry))
              || null;
            if (preferredEntry?.path) {
              void loadServerFileContent(selectedServerId, preferredEntry.path);
              return;
            }
            if (activeServerKind === "function") {
              void createDefaultFunctionSourceFile(selectedServerId);
            } else if (activeServerKind === "web_app") {
              void createDefaultWebAppSourceFiles(selectedServerId);
            }
          }, [
            currentServerFiles,
            draftServer,
            hasLoadedCurrentServerFiles,
            loadServerFileContent,
            loadingServerFilesId,
            resourceMode,
            selectedServerId,
            selectedServerSnapshot,
            serverDetailTab,
            serverFileEditorState.path,
          ]);

          useEffect(() => {
            if (!serverFileEditorState.path) {
              return;
            }
            if (!selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              setServerFileEditorState({
                path: "",
                status: "idle",
                value: "",
                initialValue: "",
                error: "",
                saveError: "",
                saveMessage: "",
                isSaving: false,
                wordWrap: true,
              });
              setServerFileEditorHistoryByKey({});
              return;
            }
            if (currentServerFiles.some((entry) => entry.path === serverFileEditorState.path)) {
              return;
            }
            setServerFileEditorState({
              path: "",
              status: "idle",
              value: "",
              initialValue: "",
              error: "",
              saveError: "",
              saveMessage: "",
              isSaving: false,
              wordWrap: true,
            });
            setServerFileEditorHistoryByKey({});
          }, [currentServerFiles, selectedServerId, serverFileEditorState.path]);

          useEffect(() => {
            if (resourceMode === "servers" && serverFileEditorState.path && typeof onRequestSidebarCollapse === "function") {
              onRequestSidebarCollapse();
            }
          }, [onRequestSidebarCollapse, resourceMode, serverFileEditorState.path]);

          useEffect(() => {
            const shouldLoadDatabaseCatalog = !embeddedInResources
              || (resourceMode === "servers" && (!normalizedEmbeddedServerKind || normalizedEmbeddedServerKind === "database"));
            if (!shouldLoadDatabaseCatalog) return;
            if (databaseListInitialLoadScopeRef.current === databaseListScopeKey) return;
            const requestState = databaseListRequestRef.current;
            requestState.requestId += 1;
            requestState.promise = null;
            requestState.retryCount = 0;
            if (requestState.retryTimer) {
              window.clearTimeout(requestState.retryTimer);
              requestState.retryTimer = null;
            }
            const cachedRecord = readPlaygroundDatabaseListCache(databaseListScopeKey);
            setDatabases(cachedRecord?.items || []);
            setHasLoadedDatabases(Number(cachedRecord?.loadedAt || 0) > 0);
            databaseListInitialLoadScopeRef.current = databaseListScopeKey;
            void loadDatabases({
              retry: true,
              useOverviewCatalog: Boolean(
                embeddedInResources
                && resourceMode === "servers"
                && normalizedEmbeddedServerKind === "database"
              ),
              period: developServerOperationalMetricsPeriod,
            });
          }, [databaseListScopeKey, developServerOperationalMetricsPeriod, embeddedInResources, loadDatabases, normalizedEmbeddedServerKind, resourceMode]);

          useEffect(() => () => {
            const requestState = databaseListRequestRef.current;
            if (requestState.retryTimer) {
              window.clearTimeout(requestState.retryTimer);
              requestState.retryTimer = null;
            }
          }, []);

          useEffect(() => {
            if (resourceMode !== "servers") {
              serverResourceModeRefreshRef.current = false;
              return;
            }
            if (serverResourceModeRefreshRef.current) {
              return;
            }
            serverResourceModeRefreshRef.current = true;
            if ((!normalizedEmbeddedServerKind || normalizedEmbeddedServerKind === "database") && !databaseListLoading) {
              void loadDatabases();
            }
          }, [databaseListLoading, loadDatabases, normalizedEmbeddedServerKind, resourceMode]);

          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedDatabaseId || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              databaseSeededSelectionRef.current = selectedDatabaseId;
              setDraftDatabase(null);
              resetDatabaseEditorAuxiliaryState();
              return;
            }

            if (databaseSeededSelectionRef.current === selectedDatabaseId) {
              return;
            }
            databaseSeededSelectionRef.current = selectedDatabaseId;

            const seedDatabase = databaseDetailsById[selectedDatabaseId]
              || orderedDatabases.find((database) => database.id === selectedDatabaseId)
              || null;

            resetDatabaseEditorAuxiliaryState();
            setDraftDatabase(seedDatabase ? normalizePlaygroundDatabaseRecord(seedDatabase) : null);
            void (async () => {
              if (!seedDatabase) {
                void loadDatabaseDetails(selectedDatabaseId);
              }
              const didBootstrap = await loadDatabaseBootstrap(selectedDatabaseId);
              if (selectedDatabaseIdRef.current !== selectedDatabaseId) {
                return;
              }
              if (didBootstrap) return;
              await loadDatabaseCollections(selectedDatabaseId);
            })();
          }, [databaseDetailsById, loadDatabaseBootstrap, loadDatabaseCollections, loadDatabaseDetails, orderedDatabases, resourceMode, selectedDatabaseId]);

          useEffect(() => {
            if (
              resourceMode !== "servers"
              || databaseDetailTab !== "usage"
              || !selectedDatabaseId
              || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID
            ) {
              return;
            }
  	      void loadDatabaseAnalytics(selectedDatabaseId, { period: databaseDetailChartTimescale });
  	    }, [databaseDetailChartTimescale, databaseDetailTab, loadDatabaseAnalytics, resourceMode, selectedDatabaseId]);

          useEffect(() => {
            if (
              databaseDetailTab !== "settings"
              || !selectedDatabaseId
              || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID
            ) {
              return undefined;
            }
            const frameId = window.requestAnimationFrame(() => {
              const scrollNode = resourcesDetailScrollRef.current;
              if (scrollNode && typeof scrollNode.scrollTop === "number") {
                scrollNode.scrollTop = 0;
              }
              setDatabasePermissionChartAnimationKey((current) => current + 1);
            });
            return () => window.cancelAnimationFrame(frameId);
          }, [databaseDetailTab, databasePermissionTeamId, selectedDatabaseId]);

          useEffect(() => {
            databaseWorkspaceTeamsRequestedRef.current = false;
          }, [databaseListScopeKey]);

          useEffect(() => {
            databaseOwnerTeamMembersRequestedRef.current = new Set();
            setDatabaseOwnerTeamMembersById({});
            setDatabaseOwnerPopoverOpen(false);
  	      setDatabaseOwnerTransferTarget(null);
  	      setDatabaseOwnerTransferModalVisible(false);
  	      setDatabaseOwnerTransferModalClosing(false);
          }, [selectedDatabaseId]);

  	    useEffect(() => () => {
  	      if (databaseOwnerTransferModalCloseTimerRef.current !== null && typeof window !== "undefined") {
  	        window.clearTimeout(databaseOwnerTransferModalCloseTimerRef.current);
  	      }
  	      if (databaseOwnerTransferModalFrameRef.current !== null && typeof window !== "undefined") {
  	        window.cancelAnimationFrame(databaseOwnerTransferModalFrameRef.current);
  	      }
  	    }, []);

          useEffect(() => {
            if (
              databaseDetailTab === "data"
              || workspaceTeamsLoading
              || workspaceTeamsRequiresPlan
              || (Array.isArray(workspaceTeams) && workspaceTeams.length > 0)
              || databaseWorkspaceTeamsRequestedRef.current
              || typeof onWorkspaceTeamsRequest !== "function"
            ) {
              return;
            }
            databaseWorkspaceTeamsRequestedRef.current = true;
            onWorkspaceTeamsRequest({});
          }, [
            databaseDetailTab,
            onWorkspaceTeamsRequest,
            workspaceTeams,
            workspaceTeamsLoading,
            workspaceTeamsRequiresPlan,
          ]);

          useEffect(() => {
            if (!databaseOwnerPopoverOpen || !draftDatabase?.id) return;
            const missingTeamIds = getDatabaseSharedTeamIds(draftDatabase).filter((teamId) => (
              !Object.prototype.hasOwnProperty.call(databaseOwnerTeamMembersById, teamId)
              && !databaseOwnerTeamMembersRequestedRef.current.has(teamId)
            ));
            missingTeamIds.forEach((teamId) => {
              databaseOwnerTeamMembersRequestedRef.current.add(teamId);
              void loadDatabaseOwnerTeamMembers(teamId);
            });
          }, [databaseOwnerPopoverOpen, databaseOwnerTeamMembersById, draftDatabase]);

          useEffect(() => {
            if (!databaseTeamMenuId) {
              return undefined;
            }

            function handleDatabaseTeamMenuPointerDown(event) {
              const target = event?.target instanceof Element ? event.target : null;
              if (!target?.closest(".playground-database-team-menu-scope")) {
                setDatabaseTeamMenuId("");
              }
            }

            function handleDatabaseTeamMenuEscape(event) {
              if (event.key === "Escape") {
                setDatabaseTeamMenuId("");
              }
            }

            document.addEventListener("mousedown", handleDatabaseTeamMenuPointerDown);
            window.addEventListener("keydown", handleDatabaseTeamMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleDatabaseTeamMenuPointerDown);
              window.removeEventListener("keydown", handleDatabaseTeamMenuEscape);
            };
          }, [databaseTeamMenuId]);

          useEffect(() => {
            if (!serverTeamMenuId) return undefined;

            function handleServerAccessPopupPointerDown(event) {
              const target = event?.target instanceof Element ? event.target : null;
              if (!target?.closest(".playground-database-team-menu-scope")) setServerTeamMenuId("");
            }

            function handleServerAccessPopupEscape(event) {
              if (event.key !== "Escape") return;
              setServerTeamMenuId("");
            }

            document.addEventListener("mousedown", handleServerAccessPopupPointerDown);
            window.addEventListener("keydown", handleServerAccessPopupEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerAccessPopupPointerDown);
              window.removeEventListener("keydown", handleServerAccessPopupEscape);
            };
          }, [serverTeamMenuId]);

          useEffect(() => {
            if (!serverOwnerPopoverOpen || !draftServer?.id) return;
            getServerSharedTeamIds(draftServer).forEach((teamId) => {
              if (
                Object.prototype.hasOwnProperty.call(databaseOwnerTeamMembersById, teamId)
                || databaseOwnerTeamMembersRequestedRef.current.has(teamId)
              ) return;
              databaseOwnerTeamMembersRequestedRef.current.add(teamId);
              void loadDatabaseOwnerTeamMembers(teamId);
            });
          }, [databaseOwnerTeamMembersById, draftServer, serverOwnerPopoverOpen]);

          useEffect(() => () => {
            if (serverOwnerTransferModalCloseTimerRef.current !== null && typeof window !== "undefined") {
              window.clearTimeout(serverOwnerTransferModalCloseTimerRef.current);
            }
          }, []);

          useEffect(() => {
            if (resourceMode !== "servers") {
              return;
            }
            if (!selectedDatabaseId || selectedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID || !selectedDatabaseCollectionId) {
              return;
            }
            void loadDatabaseDocuments(selectedDatabaseId, selectedDatabaseCollectionId);
          }, [loadDatabaseDocuments, resourceMode, selectedDatabaseCollectionId, selectedDatabaseId]);

          useEffect(() => {
            setToolbarPopover("");
            setSearchPopupQuery("");
          }, [resourceMode]);

          useEffect(() => {
            if (!versionsDrawerPortalId || typeof document === "undefined") {
              setEnvironmentVersionsDrawerContainer(null);
              return undefined;
            }
            setEnvironmentVersionsDrawerContainer(document.getElementById(versionsDrawerPortalId));
            return undefined;
          }, [versionsDrawerPortalId]);

          const environmentVersionsRequestHeadersKey = JSON.stringify(requestHeaders || {});

          useEffect(() => {
            if (typeof onVersionsSidebarOpenChange !== "function") {
              return undefined;
            }
            onVersionsSidebarOpenChange(Boolean(environmentVersionsSidebarOpen || serverVersionsSidebarOpen));
            return () => onVersionsSidebarOpenChange(false);
          }, [environmentVersionsSidebarOpen, onVersionsSidebarOpenChange, serverVersionsSidebarOpen]);

          useEffect(() => {
            if (environmentVersionsSidebarOpen) {
              if (environmentDetailsCollapsedBeforeVersionsRef.current === null) {
                environmentDetailsCollapsedBeforeVersionsRef.current = Boolean(environmentDetailsCollapsed);
              }
              if (!environmentDetailsCollapsed) {
                setEnvironmentDetailsCollapsed(true);
              }
              return;
            }

            if (environmentDetailsCollapsedBeforeVersionsRef.current !== null) {
              const shouldRestoreCollapsed = Boolean(environmentDetailsCollapsedBeforeVersionsRef.current);
              environmentDetailsCollapsedBeforeVersionsRef.current = null;
              setEnvironmentDetailsCollapsed(shouldRestoreCollapsed);
            }
          }, [environmentVersionsSidebarOpen, environmentDetailsCollapsed]);

          useEffect(() => {
            if (serverVersionsSidebarOpen) {
              if (serverDetailsCollapsedBeforeVersionsRef.current === null) {
                serverDetailsCollapsedBeforeVersionsRef.current = Boolean(serverDetailsCollapsed);
              }
              if (!serverDetailsCollapsed) {
                setServerDetailsCollapsed(true);
              }
              return;
            }
            if (serverDetailsCollapsedBeforeVersionsRef.current !== null) {
              const shouldRestoreCollapsed = Boolean(serverDetailsCollapsedBeforeVersionsRef.current);
              serverDetailsCollapsedBeforeVersionsRef.current = null;
              setServerDetailsCollapsed(shouldRestoreCollapsed);
            }
          }, [serverDetailsCollapsed, serverVersionsSidebarOpen]);

          useEffect(() => {
            if (!creationOnly) {
              return;
            }
            const normalizedCreationToken = String(creationRequestToken || "").trim();
            if (
              !normalizedCreationToken
              || lastAppliedCreationRequestTokenRef.current === normalizedCreationToken
            ) {
              return;
            }
            lastAppliedCreationRequestTokenRef.current = normalizedCreationToken;
            openEnvironmentComposer();
          }, [creationOnly, creationRequestToken]);

          useEffect(() => {
            if (creationOnly) {
              return;
            }
            const normalizedTargetEnvironmentId = String(navigationTargetEnvironmentId || "").trim();
            const previousRequest = environmentNavigationRequestRef.current || {
              token: null,
              targetId: "",
              handled: false,
            };
            const requestChanged =
              previousRequest.token !== navigationToken
              || previousRequest.targetId !== normalizedTargetEnvironmentId;

            if (requestChanged) {
              environmentNavigationRequestRef.current = {
                token: navigationToken,
                targetId: normalizedTargetEnvironmentId,
                handled: false,
              };
            }

            if (normalizedTargetEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              if (
                environmentNavigationRequestRef.current.handled
                && environmentComposerOpen
              ) {
                return;
              }
              void commitDraftServerIfDirty();
              setToolbarPopover("");
              setSearchPopupQuery("");
              setEnvironmentsHomeActiveResourceCommand("");
              setEnvironmentsHomeResourceCommandRequest(null);
              setEnvironmentListActionMenuState(null);
              setEnvironmentActionsPopoverOpen(false);
              setServerActionsPopoverOpen(false);
              setServerFileActionsPopoverOpen(false);
              setDatabaseActionsPopoverOpen(false);
              setResourceMode("computers");
              setIsHomeViewActive(true);
              setSelectedEnvironmentId("");
              setSelectedServerId("");
              setSelectedDatabaseId("");
              setSelectedDatabaseCollectionId("");
              setSelectedDatabaseDocumentId("");
              openEnvironmentComposer();
              environmentNavigationRequestRef.current = {
                token: navigationToken,
                targetId: normalizedTargetEnvironmentId,
                handled: true,
              };
              return;
            }

            if (normalizedTargetEnvironmentId && orderedEnvironments.some((environment) => environment.id === normalizedTargetEnvironmentId)) {
              if (
                environmentNavigationRequestRef.current.handled
                && selectedEnvironmentIdRef.current === normalizedTargetEnvironmentId
              ) {
                return;
              }
              commitDraftEnvironmentIfDirty();
              void commitDraftServerIfDirty();
              setToolbarPopover("");
              setSearchPopupQuery("");
              setEnvironmentsHomeActiveResourceCommand("");
              setEnvironmentsHomeResourceCommandRequest(null);
              setEnvironmentListActionMenuState(null);
              setEnvironmentActionsPopoverOpen(false);
              setServerActionsPopoverOpen(false);
              setServerFileActionsPopoverOpen(false);
              setDatabaseActionsPopoverOpen(false);
              setResourceMode("computers");
              setIsHomeViewActive(false);
              setSelectedEnvironmentId(normalizedTargetEnvironmentId);
              setSelectedServerId("");
              setSelectedDatabaseId("");
              setSelectedDatabaseCollectionId("");
              setSelectedDatabaseDocumentId("");
              environmentNavigationRequestRef.current = {
                token: navigationToken,
                targetId: normalizedTargetEnvironmentId,
                handled: true,
              };
              return;
            }

            if (normalizedTargetEnvironmentId) {
              return;
            }

            if (environmentNavigationRequestRef.current.handled) {
              return;
            }

            showEnvironmentsHome();
            environmentNavigationRequestRef.current = {
              token: navigationToken,
              targetId: "",
              handled: true,
            };
          }, [creationOnly, environmentComposerOpen, navigationTargetEnvironmentId, navigationToken, orderedEnvironments]);

          useEffect(() => {
            const normalizedTargetId = String(navigationTargetResourceId || "").trim();
            const normalizedTargetType = navigationTargetResourceType === "database" ? "database" : "server";
            const previousRequest = resourceNavigationRequestRef.current || {
              token: null,
              targetType: "",
              targetId: "",
              handled: false,
            };
            const requestChanged =
              previousRequest.token !== navigationResourceToken
              || previousRequest.targetType !== normalizedTargetType
              || previousRequest.targetId !== normalizedTargetId;

            if (requestChanged) {
              resourceNavigationRequestRef.current = {
                token: navigationResourceToken,
                targetType: normalizedTargetType,
                targetId: normalizedTargetId,
                handled: false,
              };
            }

            if (!embeddedInResources || embeddedResourcesView !== "servers" || !normalizedTargetId) {
              return;
            }

            if (
              resourceNavigationRequestRef.current.handled
              && resourceNavigationRequestRef.current.targetType === normalizedTargetType
              && resourceNavigationRequestRef.current.targetId === normalizedTargetId
            ) {
              return;
            }

            if (normalizedTargetType === "database") {
              handleDatabaseSelect(normalizedTargetId);
            } else {
              if (!orderedServers.some((server) => server.id === normalizedTargetId)) {
                return;
              }
              handleServerSelect(normalizedTargetId);
            }

            resourceNavigationRequestRef.current = {
              token: navigationResourceToken,
              targetType: normalizedTargetType,
              targetId: normalizedTargetId,
              handled: true,
            };
          }, [embeddedInResources, embeddedResourcesView, navigationResourceToken, navigationTargetResourceId, navigationTargetResourceType, orderedDatabases, orderedServers]);

          useEffect(() => {
            const normalizedCreationKind = normalizePlaygroundServerOverviewKind(serverCreationRequestKind);
            const previousRequest = serverCreationRequestRef.current || {
              token: null,
              kind: "",
              handled: false,
            };
            const requestChanged =
              previousRequest.token !== serverCreationRequestToken
              || previousRequest.kind !== normalizedCreationKind;

            if (requestChanged) {
              serverCreationRequestRef.current = {
                token: serverCreationRequestToken,
                kind: normalizedCreationKind,
                handled: false,
              };
            }

            if (
              !embeddedInResources
              || embeddedResourcesView !== "servers"
              || !serverCreationRequestToken
              || !normalizedCreationKind
              || normalizedCreationKind === "voice_agent"
              || serverCreationRequestRef.current.handled
            ) {
              return;
            }

            openServerComposer(normalizedCreationKind);
            serverCreationRequestRef.current = {
              token: serverCreationRequestToken,
              kind: normalizedCreationKind,
              handled: true,
            };
          }, [embeddedInResources, embeddedResourcesView, serverCreationRequestKind, serverCreationRequestToken]);

          useEffect(() => {
            setServerAuthSearchQuery("");
            setServerAuthUserComposerState({
              open: false,
              email: "",
              password: "",
              displayName: "",
              error: "",
              isSaving: false,
            });
            setServerAuthUsersState({
              error: "",
            });
          }, [selectedServerId]);

          useEffect(() => {
            setAgentRuntimeSkillsPopoverOpen(false);
            setAgentRuntimeSkillsTab("system");
          }, [selectedServerId]);

          useEffect(() => {
            if (!serverAgentRuntimeRunComposer.open || !serverAgentRuntimeRunPromptTextareaRef.current) {
              return undefined;
            }
            const frame = window.requestAnimationFrame(() => {
              const textarea = serverAgentRuntimeRunPromptTextareaRef.current;
              if (!textarea) {
                return;
              }
              textarea.focus();
              resizeEnvironmentDescriptionTextarea(textarea);
            });
            return () => {
              window.cancelAnimationFrame(frame);
            };
          }, [serverAgentRuntimeRunComposer.open]);

          useEffect(() => {
            if (!agentRuntimeSkillsPopoverOpen) {
              return;
            }
            setServerDetailSelectPopover("");
            if (!hasLoadedRuntimeCustomSkills && !runtimeCustomSkillsLoading) {
              void loadRuntimeCustomSkills();
            }
          }, [agentRuntimeSkillsPopoverOpen, hasLoadedRuntimeCustomSkills, loadRuntimeCustomSkills, runtimeCustomSkillsLoading]);

          useEffect(() => {
            if (!agentRuntimeSkillsPopoverOpen) return undefined;

            function handleAgentRuntimeSkillsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (
                !target
                || agentRuntimeSkillsActionsRef.current?.contains(target)
                || agentRuntimeSkillsPopupSurfaceRef.current?.contains(target)
              ) {
                return;
              }
              setAgentRuntimeSkillsPopoverOpen(false);
            }

            function handleAgentRuntimeSkillsPopoverEscape(event) {
              if (event.key === "Escape") {
                setAgentRuntimeSkillsPopoverOpen(false);
              }
            }

            document.addEventListener("mousedown", handleAgentRuntimeSkillsPopoverPointerDown);
            window.addEventListener("keydown", handleAgentRuntimeSkillsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleAgentRuntimeSkillsPopoverPointerDown);
              window.removeEventListener("keydown", handleAgentRuntimeSkillsPopoverEscape);
            };
          }, [agentRuntimeSkillsPopoverOpen]);

          useEffect(() => {
            if (!environmentRuntimePopover) return undefined;

            function handleEnvironmentRuntimePopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !environmentRuntimePopoverRef.current || environmentRuntimePopoverRef.current.contains(target)) {
                return;
              }
              setEnvironmentRuntimePopover("");
            }

            function handleEnvironmentRuntimePopoverEscape(event) {
              if (event.key === "Escape") {
                setEnvironmentRuntimePopover("");
              }
            }

            document.addEventListener("mousedown", handleEnvironmentRuntimePopoverPointerDown);
            window.addEventListener("keydown", handleEnvironmentRuntimePopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleEnvironmentRuntimePopoverPointerDown);
              window.removeEventListener("keydown", handleEnvironmentRuntimePopoverEscape);
            };
          }, [environmentRuntimePopover]);

          useEffect(() => {
            if (!environmentComposerRuntimePopover) return undefined;

            function handleEnvironmentComposerRuntimePopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !environmentComposerRuntimePopoverRef.current || environmentComposerRuntimePopoverRef.current.contains(target)) {
                return;
              }
              setEnvironmentComposerRuntimePopover("");
            }

            function handleEnvironmentComposerRuntimePopoverEscape(event) {
              if (event.key === "Escape") {
                setEnvironmentComposerRuntimePopover("");
              }
            }

            document.addEventListener("mousedown", handleEnvironmentComposerRuntimePopoverPointerDown);
            window.addEventListener("keydown", handleEnvironmentComposerRuntimePopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleEnvironmentComposerRuntimePopoverPointerDown);
              window.removeEventListener("keydown", handleEnvironmentComposerRuntimePopoverEscape);
            };
          }, [environmentComposerRuntimePopover]);

          useEffect(() => {
            if (!environmentActionsPopoverOpen) return undefined;

            function handleEnvironmentActionsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !environmentActionsPopoverRef.current || environmentActionsPopoverRef.current.contains(target)) {
                return;
              }
              setEnvironmentActionsPopoverOpen(false);
            }

            function handleEnvironmentActionsPopoverEscape(event) {
              if (event.key === "Escape") {
                setEnvironmentActionsPopoverOpen(false);
              }
            }

            document.addEventListener("mousedown", handleEnvironmentActionsPopoverPointerDown);
            window.addEventListener("keydown", handleEnvironmentActionsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleEnvironmentActionsPopoverPointerDown);
              window.removeEventListener("keydown", handleEnvironmentActionsPopoverEscape);
            };
          }, [environmentActionsPopoverOpen]);

          useEffect(() => {
            if (!serverPublishMenuOpen) return undefined;

            function handleServerPublishMenuPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !serverPublishMenuRef.current || serverPublishMenuRef.current.contains(target)) {
                return;
              }
              setServerPublishMenuOpen(false);
            }

            function handleServerPublishMenuEscape(event) {
              if (event.key === "Escape") {
                setServerPublishMenuOpen(false);
              }
            }

            document.addEventListener("mousedown", handleServerPublishMenuPointerDown);
            window.addEventListener("keydown", handleServerPublishMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerPublishMenuPointerDown);
              window.removeEventListener("keydown", handleServerPublishMenuEscape);
            };
          }, [serverPublishMenuOpen]);

          useEffect(() => {
            if (!environmentShareTeamModalOpen && !environmentShareTeamModalClosing) {
              return undefined;
            }

            function handleEnvironmentShareTeamEscape(event) {
              if (event.key === "Escape") {
                closeEnvironmentShareTeamModal();
              }
            }

            window.addEventListener("keydown", handleEnvironmentShareTeamEscape);
            return () => window.removeEventListener("keydown", handleEnvironmentShareTeamEscape);
          }, [environmentShareTeamModalOpen, environmentShareTeamModalClosing, environmentShareTeamState.action]);

          useEffect(() => {
            if (!environmentApiModalOpen && !environmentApiModalClosing) {
              return undefined;
            }

            function handleEnvironmentApiModalEscape(event) {
              if (event.key === "Escape") {
                closeEnvironmentApiModal();
              }
            }

            window.addEventListener("keydown", handleEnvironmentApiModalEscape);
            return () => window.removeEventListener("keydown", handleEnvironmentApiModalEscape);
          }, [environmentApiModalOpen, environmentApiModalClosing]);

          useEffect(() => {
            if (!environmentApiModalOpen) {
              return;
            }
            const normalizedAgentId = String(environmentApiAgentId || "").trim();
            if (!normalizedAgentId || !environmentApiAgentOptions.some((agent) => String(agent?.id || "").trim() === normalizedAgentId)) {
              setEnvironmentApiAgentId(environmentApiDefaultAgentId);
            }
          }, [environmentApiAgentId, environmentApiAgentOptions, environmentApiDefaultAgentId, environmentApiModalOpen]);

          useEffect(() => {
            if (!environmentApiModalOpen || serverPreviewEditorModule || serverPreviewEditorModuleError) {
              return undefined;
            }

            let cancelled = false;

            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled) {
                  return;
                }
                if (!module) {
                  setServerPreviewEditorModuleError("Failed to load editor.");
                  return;
                }
                setServerPreviewEditorModule(module);
                setServerPreviewEditorModuleError("");
                void module.loader?.init?.()
                  .then((monaco) => {
                    if (!cancelled) {
                      ensurePlaygroundCodeEditorTheme(monaco);
                    }
                  })
                  .catch(() => {});
              })
              .catch((error) => {
                if (cancelled) {
                  return;
                }
                setServerPreviewEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
              });

            return () => {
              cancelled = true;
            };
          }, [environmentApiModalOpen, serverPreviewEditorModule, serverPreviewEditorModuleError]);

          useEffect(() => {
            if (!serverActionsPopoverOpen) return undefined;

            function handleServerActionsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (
                !target
                || serverActionsPopoverRef.current?.contains(target)
                || serverActionsPopoverSurfaceRef.current?.contains(target)
              ) {
                return;
              }
              setServerActionsPopoverOpen(false);
            }

            function handleServerActionsPopoverEscape(event) {
              if (event.key === "Escape") {
                setServerActionsPopoverOpen(false);
              }
            }

            document.addEventListener("mousedown", handleServerActionsPopoverPointerDown);
            window.addEventListener("keydown", handleServerActionsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerActionsPopoverPointerDown);
              window.removeEventListener("keydown", handleServerActionsPopoverEscape);
            };
          }, [serverActionsPopoverOpen]);

          useEffect(() => {
            if (!resourceOverviewTopNavMenuOpen) return undefined;

            function handleResourceOverviewTopNavMenuPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || resourceOverviewTopNavMenuRef.current?.contains(target)) return;
              setResourceOverviewTopNavMenuOpen(false);
            }

            function handleResourceOverviewTopNavMenuEscape(event) {
              if (event.key === "Escape") setResourceOverviewTopNavMenuOpen(false);
            }

            document.addEventListener("mousedown", handleResourceOverviewTopNavMenuPointerDown);
            window.addEventListener("keydown", handleResourceOverviewTopNavMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleResourceOverviewTopNavMenuPointerDown);
              window.removeEventListener("keydown", handleResourceOverviewTopNavMenuEscape);
            };
          }, [resourceOverviewTopNavMenuOpen]);

          useEffect(() => {
            if (!serverFileActionsPopoverOpen) return undefined;

            function handleServerFileActionsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !serverFileActionsPopoverRef.current || serverFileActionsPopoverRef.current.contains(target)) {
                return;
              }
              setServerFileActionsPopoverOpen(false);
            }

            function handleServerFileActionsPopoverEscape(event) {
              if (event.key === "Escape") {
                setServerFileActionsPopoverOpen(false);
              }
            }

            document.addEventListener("mousedown", handleServerFileActionsPopoverPointerDown);
            window.addEventListener("keydown", handleServerFileActionsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerFileActionsPopoverPointerDown);
              window.removeEventListener("keydown", handleServerFileActionsPopoverEscape);
            };
          }, [serverFileActionsPopoverOpen]);

          useEffect(() => {
            if (!serverSourceFileMenuPath) return undefined;

            function handleServerSourceFileMenuPointerDown(event) {
              const target = event?.target instanceof Element ? event.target : null;
              if (target?.closest(".playground-servers-source-file-actions-menu-shell")) {
                return;
              }
              setServerSourceFileMenuPath("");
            }

            function handleServerSourceFileMenuEscape(event) {
              if (event.key === "Escape") {
                setServerSourceFileMenuPath("");
              }
            }

            document.addEventListener("mousedown", handleServerSourceFileMenuPointerDown);
            window.addEventListener("keydown", handleServerSourceFileMenuEscape);
            return () => {
              document.removeEventListener("mousedown", handleServerSourceFileMenuPointerDown);
              window.removeEventListener("keydown", handleServerSourceFileMenuEscape);
            };
          }, [serverSourceFileMenuPath]);

          useEffect(() => {
            if (!databaseActionsPopoverOpen) return undefined;

            function handleDatabaseActionsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (
                !target
                || databaseActionsPopoverRef.current?.contains(target)
                || databaseActionsPopoverSurfaceRef.current?.contains(target)
              ) {
                return;
              }
              setDatabaseActionsPopoverOpen(false);
            }

            function handleDatabaseActionsPopoverEscape(event) {
              if (event.key === "Escape") {
                setDatabaseActionsPopoverOpen(false);
              }
            }

            document.addEventListener("mousedown", handleDatabaseActionsPopoverPointerDown);
            window.addEventListener("keydown", handleDatabaseActionsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleDatabaseActionsPopoverPointerDown);
              window.removeEventListener("keydown", handleDatabaseActionsPopoverEscape);
            };
          }, [databaseActionsPopoverOpen]);

          useEffect(() => {
            if (!environmentRenameState || !environmentRenameInputRef.current) {
              return undefined;
            }

            const focusFrame = window.requestAnimationFrame(() => {
              environmentRenameInputRef.current?.focus();
              environmentRenameInputRef.current?.select();
            });

            function handleEnvironmentRenameEscape(event) {
              if (event.key === "Escape" && !saveState.isSaving) {
                event.preventDefault();
                closeEnvironmentRenameDialog();
              }
            }

            window.addEventListener("keydown", handleEnvironmentRenameEscape);
            return () => {
              window.cancelAnimationFrame(focusFrame);
              window.removeEventListener("keydown", handleEnvironmentRenameEscape);
            };
          }, [environmentRenameState, saveState.isSaving]);

          useEffect(() => {
            if (!serverRenameState || !serverRenameInputRef.current) {
              return undefined;
            }

            const focusFrame = window.requestAnimationFrame(() => {
              serverRenameInputRef.current?.focus();
              serverRenameInputRef.current?.select();
            });

            function handleServerRenameEscape(event) {
              if (event.key === "Escape" && !serverSaveState.isSaving) {
                event.preventDefault();
                closeServerRenameDialog();
              }
            }

            window.addEventListener("keydown", handleServerRenameEscape);
            return () => {
              window.cancelAnimationFrame(focusFrame);
              window.removeEventListener("keydown", handleServerRenameEscape);
            };
          }, [serverRenameState, serverSaveState.isSaving]);

          useEffect(() => {
            if (!databaseRenameState || !databaseRenameInputRef.current) {
              return undefined;
            }

            const focusFrame = window.requestAnimationFrame(() => {
              databaseRenameInputRef.current?.focus();
              databaseRenameInputRef.current?.select();
            });

            function handleDatabaseRenameEscape(event) {
              if (event.key === "Escape" && !databaseSaveState.isSaving) {
                event.preventDefault();
                closeDatabaseRenameDialog();
              }
            }

            window.addEventListener("keydown", handleDatabaseRenameEscape);
            return () => {
              window.cancelAnimationFrame(focusFrame);
              window.removeEventListener("keydown", handleDatabaseRenameEscape);
            };
          }, [databaseRenameState, databaseSaveState.isSaving]);

          useEffect(() => () => {
            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
              serverAutosaveTimerRef.current = null;
            }
            if (environmentAutosaveTimerRef.current) {
              window.clearTimeout(environmentAutosaveTimerRef.current);
              environmentAutosaveTimerRef.current = null;
            }
            if (databaseDocumentAutosaveTimerRef.current) {
              window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
              databaseDocumentAutosaveTimerRef.current = null;
            }
            if (databasePermissionSaveTimerRef.current) {
              window.clearTimeout(databasePermissionSaveTimerRef.current);
              databasePermissionSaveTimerRef.current = null;
            }
          }, []);

          useEffect(() => {
            if (databaseDocumentViewMode !== "json" || databaseJsonEditorModule || databaseJsonEditorModuleError) {
              return;
            }

            let cancelled = false;

            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled || !module) {
                  return;
                }
                setDatabaseJsonEditorModule(module);
                setDatabaseJsonEditorModuleError("");
                void module.loader?.init?.()
                  .then((monaco) => {
                    if (!cancelled) {
                      ensurePlaygroundCodeEditorTheme(monaco);
                    }
                  })
                  .catch(() => {});
              })
              .catch((error) => {
                if (cancelled) {
                  return;
                }
                setDatabaseJsonEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
              });

            return () => {
              cancelled = true;
            };
          }, [databaseDocumentViewMode, databaseJsonEditorModule, databaseJsonEditorModuleError]);

          useEffect(() => {
            if (resourceMode !== "servers" || !selectedServerId || selectedServerId === PLAYGROUND_SERVER_DRAFT_ID || serverPreviewEditorModule || serverPreviewEditorModuleError) {
              return;
            }

            let cancelled = false;

            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled || !module) {
                  return;
                }
                setServerPreviewEditorModule(module);
                setServerPreviewEditorModuleError("");
                void module.loader?.init?.()
                  .then((monaco) => {
                    if (!cancelled) {
                      ensurePlaygroundCodeEditorTheme(monaco);
                    }
                  })
                  .catch(() => {});
              })
              .catch((error) => {
                if (cancelled) {
                  return;
                }
                setServerPreviewEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
              });

            return () => {
              cancelled = true;
            };
          }, [resourceMode, selectedServerId, serverPreviewEditorModule, serverPreviewEditorModuleError]);

          useEffect(() => {
            if (
              !draftDatabase?.id
              || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID
              || isSelectedDatabaseTemplatePreview
              || isPlaygroundResourceTemplatePreviewRecord(draftDatabase)
              || !selectedDatabaseCollectionId
              || !databaseDocumentEditorState.documentId
              || databaseDocumentViewMode === "json"
              || databaseDocumentEditorState.isSaving
              || databaseDocumentEditorState.value === databaseDocumentEditorState.initialValue
            ) {
              if (databaseDocumentAutosaveTimerRef.current) {
                window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
                databaseDocumentAutosaveTimerRef.current = null;
              }
              return;
            }

            const parsedDocument = parsePlaygroundDatabaseDocumentObject(databaseDocumentEditorState.value);
            if (!parsedDocument) {
              if (databaseDocumentAutosaveTimerRef.current) {
                window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
                databaseDocumentAutosaveTimerRef.current = null;
              }
              return;
            }

            if (databaseDocumentAutosaveTimerRef.current) {
              window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
            }

            databaseDocumentAutosaveTimerRef.current = window.setTimeout(() => {
              databaseDocumentAutosaveTimerRef.current = null;
              void handleSaveDatabaseDocument();
            }, 700);

            return () => {
              if (databaseDocumentAutosaveTimerRef.current) {
                window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
                databaseDocumentAutosaveTimerRef.current = null;
              }
            };
          }, [
            draftDatabase?.id,
            selectedDatabaseCollectionId,
            databaseDocumentViewMode,
            databaseDocumentEditorState.documentId,
            databaseDocumentEditorState.value,
            databaseDocumentEditorState.initialValue,
            databaseDocumentEditorState.isSaving,
            isSelectedDatabaseTemplatePreview,
          ]);

          useLayoutEffect(() => {
            if (!serverComposerOpen) {
              return;
            }
            resizeEnvironmentDescriptionTextarea(serverComposerDescriptionTextareaRef.current);
          }, [serverComposerDraft?.description, serverComposerOpen]);

          useEffect(() => {
            const textarea = serverDescriptionTextareaRef.current;
            const detailMain = serverDetailMainRef.current;
            if (!textarea || !detailMain) return undefined;

            let frameId = 0;
            const timeoutIds = [];
            const scheduleResize = () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              frameId = window.requestAnimationFrame(() => {
                resizeEnvironmentDescriptionTextarea(serverDescriptionTextareaRef.current);
              });
            };

            scheduleResize();
            [120, 240, 360].forEach((delay) => {
              timeoutIds.push(window.setTimeout(scheduleResize, delay));
            });

            if (typeof ResizeObserver === "undefined") {
              window.addEventListener("resize", scheduleResize);
              return () => {
                if (frameId) {
                  window.cancelAnimationFrame(frameId);
                }
                timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
                window.removeEventListener("resize", scheduleResize);
              };
            }

            const observer = new ResizeObserver(() => {
              scheduleResize();
            });
            observer.observe(detailMain);

            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
              observer.disconnect();
            };
          }, [draftServer?.id]);

          useEffect(() => {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || !serverEditorDirtyRef.current) {
              return;
            }
            if (isAuthoritativelyVersionedServer(draftServer)) {
              return;
            }
            if (isSelectedServerTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftServer)) {
              serverEditorDirtyRef.current = false;
              serverAutosaveQueuedRef.current = null;
              return;
            }

            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
            }

            serverAutosaveTimerRef.current = window.setTimeout(() => {
              serverAutosaveTimerRef.current = null;
              serverAutosaveQueuedRef.current = normalizePlaygroundServerRecord(draftServer);
              void flushQueuedServerAutosave();
            }, 700);

            return () => {
              if (serverAutosaveTimerRef.current) {
                window.clearTimeout(serverAutosaveTimerRef.current);
                serverAutosaveTimerRef.current = null;
              }
            };
          }, [draftServer]);

          useEffect(() => {
            if (
              !draftEnvironment
              || !editorDirtyRef.current
              || (
                draftEnvironment.id
                && draftEnvironment.id !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
                && !draftEnvironment.isSystem
              )
            ) {
              return;
            }

            if (environmentAutosaveTimerRef.current) {
              window.clearTimeout(environmentAutosaveTimerRef.current);
            }

            environmentAutosaveTimerRef.current = window.setTimeout(() => {
              environmentAutosaveTimerRef.current = null;
              environmentAutosaveQueuedRef.current = normalizePlaygroundEnvironmentRecord(draftEnvironment);
              void flushQueuedEnvironmentAutosave();
            }, 700);

            return () => {
              if (environmentAutosaveTimerRef.current) {
                window.clearTimeout(environmentAutosaveTimerRef.current);
                environmentAutosaveTimerRef.current = null;
              }
            };
          }, [draftEnvironment]);

          useEffect(() => {
            const normalizedEnvironmentId = String(
              draftEnvironment?.id || selectedEnvironmentId || ""
            ).trim();
            const canLoadEnvironmentVersions = Boolean(
              resourceMode !== "servers"
              && !isHomeViewActive
              && normalizedEnvironmentId
              && normalizedEnvironmentId !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
              && !draftEnvironment?.isSystem
            );
            const versionLoadKey = [
              String(backendUrl || "").trim(),
              environmentVersionsRequestHeadersKey,
              normalizedEnvironmentId,
            ].join("|");
            if (
              !canLoadEnvironmentVersions
              || !backendUrl
              || environmentVersionsLoadedRef.current.has(versionLoadKey)
            ) {
              return undefined;
            }
            const baseEnvironment = normalizePlaygroundEnvironmentRecord(draftEnvironment);
            environmentVersionsLoadedRef.current.add(versionLoadKey);
            setEnvironmentVersionsLoadState({
              environmentId: normalizedEnvironmentId,
              status: "loading",
              error: "",
            });
            let cancelled = false;
            void fetchEnvironmentVersionsApi(normalizedEnvironmentId)
              .then((versionItems) => {
                if (cancelled) return;
                setEnvironmentVersionsLoadState({
                  environmentId: normalizedEnvironmentId,
                  status: "success",
                  error: "",
                });
                if (versionItems.length === 0) return;
                const activeVersion = versionItems.find((version) => version.status === "active")
                  || versionItems[0]
                  || null;
                const environmentWithVersions = createPlaygroundEnvironmentWithVersionList(
                  baseEnvironment,
                  versionItems,
                  activeVersion?.id || ""
                );
                setEnvironmentDetailsById((current) => ({
                  ...current,
                  [normalizedEnvironmentId]: environmentWithVersions,
                }));
                setDraftEnvironment((current) => {
                  if (!current || String(current.id || "").trim() !== normalizedEnvironmentId) {
                    return current;
                  }
                  if (editorDirtyRef.current) {
                    return createPlaygroundEnvironmentWithVersionList(
                      current,
                      versionItems,
                      getDraftEnvironmentSelectedVersion(current)?.id
                        || activeVersion?.id
                        || ""
                    );
                  }
                  const selectedEnvironment = createEnvironmentVersionSelectedResource(
                    baseEnvironment,
                    versionItems,
                    activeVersion?.id || ""
                  );
                  rememberEnvironmentVersionBaseline(selectedEnvironment, { force: true });
                  return selectedEnvironment;
                });
              })
              .catch((error) => {
                environmentVersionsLoadedRef.current.delete(versionLoadKey);
                if (!cancelled) {
                  setEnvironmentVersionsLoadState({
                    environmentId: normalizedEnvironmentId,
                    status: "error",
                    error: error instanceof Error
                      ? error.message
                      : "Failed to load computer versions.",
                  });
                  console.warn("[computers] Failed to load authoritative computer versions", error);
                }
              });
            return () => {
              cancelled = true;
            };
          }, [
            backendUrl,
            draftEnvironment?.id,
            environmentVersionsRequestHeadersKey,
            isHomeViewActive,
            resourceMode,
            selectedEnvironmentId,
          ]);

          useEffect(() => {
            if (
              resourceMode === "servers"
              || !draftEnvironment?.id
              || draftEnvironment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID
              || draftEnvironment.isSystem
            ) {
              return undefined;
            }

            function handleEnvironmentVersionKeyboardShortcut(event) {
              const isCommandShortcut = Boolean(event.metaKey || event.ctrlKey);
              if (!isCommandShortcut || event.altKey) {
                return;
              }
              const key = String(event.key || "").toLowerCase();
              if (key !== "s" && key !== "p") {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation?.();
              if (
                saveState.isSaving
                || environmentVersionState.status === "loading"
                || environmentVersionModal
                || environmentVersionSaveDialog
              ) {
                return;
              }

              if (hasDraftEnvironmentVersionChanges()) {
                openEnvironmentVersionSaveDialog({
                  mode: event.shiftKey ? "new" : undefined,
                });
              }
            }

            window.addEventListener("keydown", handleEnvironmentVersionKeyboardShortcut, true);
            return () => window.removeEventListener("keydown", handleEnvironmentVersionKeyboardShortcut, true);
          }, [
            draftEnvironment,
            environmentVersionModal,
            environmentVersionSaveDialog,
            environmentVersionState.status,
            resourceMode,
            saveState.isSaving,
          ]);

          useEffect(() => {
            const normalizedKind = canonicalizePlaygroundServerKind(draftServer?.kind);
            const isDeployableServer = normalizedKind === "web_app" || normalizedKind === "function";
            if (
              resourceMode !== "servers"
              || !draftServer?.id
              || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
              || !isDeployableServer
              || isAuthoritativelyVersionedServer(draftServer)
              || isSelectedServerTemplatePreview
              || isPlaygroundResourceTemplatePreviewRecord(draftServer)
              || loadingServerId === draftServer.id
              || serverSaveState.isSaving
              || serverVersionState.status === "loading"
            ) {
              return;
            }
            if (readPlaygroundServerVersions(draftServer).length > 0) {
              rememberServerVersionBaseline(draftServer, { force: true });
              return;
            }
            const seedKey = String(draftServer.id || "").trim();
            if (!seedKey || serverInitialVersionSeededRef.current.has(seedKey)) {
              return;
            }
            serverInitialVersionSeededRef.current.add(seedKey);
            const actor = getServerVersionActor();
            const initialVersion = createPlaygroundServerVersion(draftServer, [], {
              status: "active",
              actor,
              snapshot: buildDraftServerVersionSnapshot(draftServer),
            });
            const nextServer = createPlaygroundServerWithVersionList(draftServer, [initialVersion], initialVersion.id);
            setDraftServer(nextServer);
            upsertLocalServerRecord(nextServer);
            void commitVersionedServerRecord(nextServer, {
              operation: "initialize",
              actor,
              loadingMessage: "Initializing server version...",
              successMessage: "Version initialized",
              errorMessage: "Failed to initialize server version.",
            });
          }, [
            currentServerFiles,
            draftServer,
            isSelectedServerTemplatePreview,
            loadingServerId,
            resourceMode,
            serverFileEditorState.path,
            serverFileEditorState.status,
            serverFileEditorState.value,
            serverSaveState.isSaving,
            serverVersionState.status,
          ]);

          useEffect(() => {
            const normalizedKind = canonicalizePlaygroundServerKind(draftServer?.kind);
            const isDeployableServer = normalizedKind === "web_app" || normalizedKind === "function";
            if (
              resourceMode !== "servers"
              || !isDeployableServer
              || isAuthoritativelyVersionedServer(draftServer)
              || !draftServer?.id
              || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID
            ) {
              return undefined;
            }

            function handleServerVersionKeyboardShortcut(event) {
              const isCommandShortcut = Boolean(event.metaKey || event.ctrlKey);
              if (!isCommandShortcut || event.altKey) {
                return;
              }
              const key = String(event.key || "").toLowerCase();
              if (key !== "s" && key !== "p") {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation?.();
              if (serverSaveState.isSaving || serverVersionState.status === "loading" || serverVersionModal) {
                return;
              }

              if (key === "s" && event.shiftKey) {
                openCreateServerVersionModal();
                return;
              }

              if (key === "s") {
                if (getServerVersionPrimaryActionKind() === "save" && hasDraftServerVersionChanges()) {
                  void saveCurrentServerVersion();
                }
                return;
              }

              if (key === "p" && !event.shiftKey && canPublishDraftServerSelectedVersion()) {
                void publishCurrentServerVersion();
              }
            }

            window.addEventListener("keydown", handleServerVersionKeyboardShortcut, true);
            return () => window.removeEventListener("keydown", handleServerVersionKeyboardShortcut, true);
          }, [
            draftServer,
            resourceMode,
            serverSaveState.isSaving,
            serverVersionModal,
            serverVersionState.status,
          ]);

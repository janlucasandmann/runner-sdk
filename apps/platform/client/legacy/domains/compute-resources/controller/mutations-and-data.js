          function getCurrentDevelopResourceIdentityInput() {
            return {
              id: currentUserId || currentUserEmail || "",
              userId: currentUserId || "",
              name: currentUserName || currentUserEmail || "User",
              email: currentUserEmail || "",
              avatarUrl: currentUserAvatarUrl || "",
            };
          }

          function initializeNewDevelopResourceRecord(record) {
            return initializeDevelopResourceIdentityMetadata(
              record && typeof record === "object" && !Array.isArray(record) ? record : {},
              getCurrentDevelopResourceIdentityInput(),
              { force: true }
            );
          }

          function buildSanitizedEnvironmentPayload(environment) {
            const normalizedEnvironment = normalizePlaygroundEnvironmentRecord(environment);
            const profile = getPlaygroundEnvironmentComputeProfileConfig(normalizedEnvironment.computeProfile);
            const runtimes = Object.fromEntries(
              Object.entries(normalizedEnvironment?.runtimes || {}).filter(([, value]) => typeof value === "string" && value.trim())
            );
            const packages = {
              system: (normalizedEnvironment?.packages?.system || []).map((value) => String(value || "").trim()).filter(Boolean),
              python: (normalizedEnvironment?.packages?.python || []).map((value) => String(value || "").trim()).filter(Boolean),
              node: (normalizedEnvironment?.packages?.node || []).map((value) => String(value || "").trim()).filter(Boolean),
            };
            const environmentVariables = (normalizedEnvironment?.environmentVariables || [])
              .map((item) => ({
                key: String(item?.key || "").trim(),
                value: typeof item?.value === "string" ? item.value : "",
              }))
              .filter((item) => item.key);
  
            const preparedSecrets = (normalizedEnvironment?.secrets || [])
              .map((secret) => {
                const key = String(secret?.key || "").trim();
                const isExisting = existingSecretKeys.has(key);
                const wasModified = modifiedSecrets[key] !== undefined;
                if (isExisting && !wasModified) {
                  return { key, value: "", _unchanged: true };
                }
                if (isExisting && wasModified) {
                  return { key, value: modifiedSecrets[key] };
                }
                return {
                  key,
                  value: typeof secret?.value === "string" ? secret.value : "",
                };
              })
              .filter((secret) => secret.key && !secret._unchanged);
  
            const preparedMcpServers = (normalizedEnvironment?.mcpServers || [])
              .map((server) => {
                const normalizedServer = {
                  id: server?.id,
                  name: String(server?.name || "").trim(),
                  enabled: server?.enabled !== false,
                  type: server?.type === "http" ? "http" : "stdio",
                  command: typeof server?.command === "string" ? server.command : "",
                  url: typeof server?.url === "string" ? server.url : "",
                  bearerToken: typeof server?.bearerToken === "string" ? server.bearerToken : "",
                };
                if (!normalizedServer.name) {
                  return null;
                }
                if (normalizedServer.type === "http" && existingMcpTokenServers.has(normalizedServer.name) && modifiedMcpTokens[normalizedServer.name] === undefined) {
                  normalizedServer.bearerToken = PLAYGROUND_MASKED_SECRET_VALUE;
                } else if (normalizedServer.type === "http" && modifiedMcpTokens[normalizedServer.name] !== undefined) {
                  normalizedServer.bearerToken = modifiedMcpTokens[normalizedServer.name];
                }
                return normalizedServer;
              })
              .filter(Boolean);
  
            const documentation = (normalizedEnvironment?.documentation || [])
              .map((document, index) => ({
                id: typeof document?.id === "string" && document.id.trim() ? document.id : "doc-" + index,
                name: String(document?.name || "").trim() || ("Document " + (index + 1)),
                content: typeof document?.content === "string" ? document.content : "",
                mimeType: typeof document?.mimeType === "string" && document.mimeType.trim() ? document.mimeType : "text/plain",
              }))
              .filter((document) => document.name || document.content);
  
            const metadata = stripPlaygroundEnvironmentVersionMetadata(
              clonePlaygroundEnvironmentMetadata(normalizedEnvironment?.metadata)
            );
            const pricing = metadata.pricing && typeof metadata.pricing === "object" && !Array.isArray(metadata.pricing)
              ? { ...metadata.pricing }
              : {};
            pricing.minutePrice = profile.minutePrice;
  
            return {
              name: String(normalizedEnvironment?.name || "").trim() || "Untitled Environment",
              description: typeof normalizedEnvironment?.description === "string" ? normalizedEnvironment.description : "",
              runtimes,
              packages,
              dockerfileExtensions: typeof normalizedEnvironment?.dockerfileExtensions === "string" ? normalizedEnvironment.dockerfileExtensions : "",
              environmentVariables,
              secrets: preparedSecrets,
              setupScripts: (normalizedEnvironment?.setupScripts || []).map((value) => String(value || "")).filter((value) => value.trim()),
              mcpServers: preparedMcpServers,
              documentation,
              internetAccess: normalizedEnvironment?.internetAccess !== false,
              metadata: {
                ...metadata,
                computeProfile: profile.id,
                computeResources: {
                  cpuCores: profile.cpuCores,
                  memoryMb: profile.memoryMb,
                },
                pricing,
                guiEnabled: profile.guiEnabled,
                officeAppsEnabled: normalizedEnvironment?.officeAppsEnabled === true && profile.id === "desktop",
              },
            };
          }
  
        function buildSanitizedServerPayload(server) {
            const metadata = server?.metadata && typeof server.metadata === "object" && !Array.isArray(server.metadata)
              ? JSON.parse(JSON.stringify(server.metadata))
              : null;
            if (metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)) {
              delete metadata.runnerPlayground.database;
              if (Object.keys(metadata.runnerPlayground).length === 0) {
                delete metadata.runnerPlayground;
              }
            }
            return {
              name: String(server?.name || "").trim() || "Untitled Server",
              description: typeof server?.description === "string" ? server.description : "",
              projectId: typeof server?.projectId === "string" && server.projectId.trim() ? server.projectId.trim() : null,
              kind: canonicalizePlaygroundServerKind(server?.kind),
              sourceType: ["manual", "computer", "git"].includes(server?.sourceType) ? server.sourceType : "manual",
              sourceEnvironmentId: typeof server?.sourceEnvironmentId === "string" && server.sourceEnvironmentId.trim() ? server.sourceEnvironmentId.trim() : null,
              sourcePath: typeof server?.sourcePath === "string" && server.sourcePath.trim() ? server.sourcePath : null,
              region: typeof server?.region === "string" && server.region.trim() ? server.region.trim() : "europe-west1",
              runtime: typeof server?.runtime === "string" && server.runtime.trim() ? server.runtime.trim() : "nodejs22",
              authMode: server?.authMode === "private" ? "private" : "public",
              serviceUrl: typeof server?.serviceUrl === "string" && server.serviceUrl.trim() ? server.serviceUrl.trim() : null,
              customDomain: typeof server?.customDomain === "string" && server.customDomain.trim() ? server.customDomain.trim() : null,
              cloudRunServiceName: typeof server?.cloudRunServiceName === "string" && server.cloudRunServiceName.trim() ? server.cloudRunServiceName.trim() : null,
              imageUrl: typeof server?.imageUrl === "string" && server.imageUrl.trim() ? server.imageUrl.trim() : null,
              status: ["draft", "deploying", "deployed", "failed", "inactive"].includes(server?.status) ? server.status : "draft",
              lastDeployedAt: typeof server?.lastDeployedAt === "string" && server.lastDeployedAt.trim() ? server.lastDeployedAt.trim() : null,
              metadata: metadata && Object.keys(metadata).length > 0 ? metadata : null,
            };
          }
  
          function buildSanitizedDatabasePayload(database) {
            const metadata = database?.metadata && typeof database.metadata === "object" && !Array.isArray(database.metadata)
              ? JSON.parse(JSON.stringify(database.metadata))
              : {};
            metadata.permissionSet = normalizePlaygroundPermissionSet(database?.permissionSet, "database");
            return {
              name: String(database?.name || "").trim() || "Untitled Database",
              description: typeof database?.description === "string" ? database.description : "",
              projectId: typeof database?.projectId === "string" && database.projectId.trim() ? database.projectId.trim() : null,
              location: typeof database?.location === "string" && database.location.trim() ? database.location.trim() : "eur3",
              status: ["active", "provisioning", "error"].includes(database?.status) ? database.status : "active",
              metadata,
            };
          }
  
          function preserveTransientDraftEnvironmentRows(savedEnvironment, currentDraft) {
            if (!currentDraft) {
              return savedEnvironment;
            }
  
            const transientEnvironmentVariables = (currentDraft.environmentVariables || [])
              .filter((item) => !String(item?.key || "").trim())
              .map((item) => ({
                key: "",
                value: typeof item?.value === "string" ? item.value : "",
              }));
            const transientSecrets = (currentDraft.secrets || [])
              .filter((item) => !String(item?.key || "").trim())
              .map((item) => ({
                key: "",
                value: typeof item?.value === "string" ? item.value : "",
              }));
            const transientSetupScripts = (currentDraft.setupScripts || [])
              .filter((value) => !String(value || "").trim())
              .map((value) => String(value || ""));
            const transientMcpServers = (currentDraft.mcpServers || [])
              .filter((server) => !String(server?.name || "").trim())
              .map((server, index) => ({
                id: server?.id || "mcp-transient-" + index,
                name: "",
                enabled: server?.enabled !== false,
                type: server?.type === "http" ? "http" : "stdio",
                command: typeof server?.command === "string" ? server.command : "",
                url: typeof server?.url === "string" ? server.url : "",
                bearerToken: typeof server?.bearerToken === "string" ? server.bearerToken : "",
              }));
  
            if (
              transientEnvironmentVariables.length === 0
              && transientSecrets.length === 0
              && transientSetupScripts.length === 0
              && transientMcpServers.length === 0
            ) {
              return savedEnvironment;
            }
  
            return normalizePlaygroundEnvironmentRecord({
              ...savedEnvironment,
              environmentVariables: [
                ...(savedEnvironment.environmentVariables || []),
                ...transientEnvironmentVariables,
              ],
              secrets: [
                ...(savedEnvironment.secrets || []),
                ...transientSecrets,
              ],
              setupScripts: [
                ...(savedEnvironment.setupScripts || []),
                ...transientSetupScripts,
              ],
              mcpServers: [
                ...(savedEnvironment.mcpServers || []),
                ...transientMcpServers,
              ],
            });
          }
  
          async function persistEnvironmentRecord(environmentRecord) {
            if (!environmentRecord) {
              return;
            }

            const isNewEnvironment = !String(environmentRecord.id || "").trim()
              || environmentRecord.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID;
            const preparedEnvironmentRecord = isNewEnvironment
              ? normalizePlaygroundEnvironmentRecord(initializeNewDevelopResourceRecord(environmentRecord))
              : environmentRecord;
            const payload = buildSanitizedEnvironmentPayload(preparedEnvironmentRecord);
            const result = await saveComputerResource({
              backendUrl,
              requestHeaders,
              computerId: preparedEnvironmentRecord.id,
              draftId: PLAYGROUND_ENVIRONMENT_DRAFT_ID,
              createPayload: {
                name: payload.name,
                description: payload.description,
                environmentVariables: payload.environmentVariables,
                secrets: payload.secrets,
                setupScripts: payload.setupScripts,
                mcpServers: payload.mcpServers,
                documentation: payload.documentation,
                internetAccess: payload.internetAccess,
                metadata: payload.metadata,
              },
              updatePayload: payload,
            });
            const createdEnvironment = result.createdData
              ? getPlaygroundEnvironmentResponseRecord(result.createdData)
              : null;
            const savedEnvironment = getPlaygroundEnvironmentResponseRecord(result.data)
              || normalizePlaygroundEnvironmentRecord({
                ...(createdEnvironment || preparedEnvironmentRecord),
                ...payload,
                id: result.computerId,
                ...(result.isNew ? {} : { updatedAt: new Date().toISOString() }),
              });
  
            if (!savedEnvironment) {
              throw new Error("Environment save failed.");
            }
  
            return savedEnvironment;
          }
  
          async function persistServerRecord(serverRecord) {
            if (!serverRecord) {
              return null;
            }
            if (isPlaygroundResourceTemplatePreviewRecord(serverRecord)) {
              return normalizePlaygroundServerRecord(serverRecord);
            }
            const creatingServer = !String(serverRecord.id || "").trim()
              || serverRecord.id === PLAYGROUND_SERVER_DRAFT_ID;
            const preparedServerRecord = creatingServer
              ? normalizePlaygroundServerRecord(initializeNewDevelopResourceRecord(serverRecord))
              : serverRecord;
            const payload = buildSanitizedServerPayload(preparedServerRecord);
            const { data, isNew: isNewServer } = await saveDevelopResource({
              backendUrl,
              requestHeaders,
              resourceType: "server",
              resourceId: preparedServerRecord.id,
              draftId: PLAYGROUND_SERVER_DRAFT_ID,
              payload,
            });
  
            return getPlaygroundServerResponseRecord(data) || normalizePlaygroundServerRecord({
              ...preparedServerRecord,
              ...payload,
              id: preparedServerRecord.id,
              updatedAt: new Date().toISOString(),
            });
          }
  
          async function persistDatabaseRecord(databaseRecord) {
            if (!databaseRecord) {
              return null;
            }
            if (isPlaygroundResourceTemplatePreviewRecord(databaseRecord)) {
              return normalizePlaygroundDatabaseRecord(databaseRecord);
            }
            const isNewDatabase = !String(databaseRecord.id || "").trim()
              || databaseRecord.id === PLAYGROUND_DATABASE_DRAFT_ID;
            const preparedDatabaseRecord = isNewDatabase
              ? normalizePlaygroundDatabaseRecord(initializeNewDevelopResourceRecord(databaseRecord))
              : databaseRecord;
            const payload = buildSanitizedDatabasePayload(preparedDatabaseRecord);
            const { data } = await saveDevelopResource({
              backendUrl,
              requestHeaders,
              resourceType: "database",
              resourceId: preparedDatabaseRecord.id,
              draftId: PLAYGROUND_DATABASE_DRAFT_ID,
              payload,
            });
  
            return getPlaygroundDatabaseResponseRecord(data) || normalizePlaygroundDatabaseRecord({
              ...preparedDatabaseRecord,
              ...payload,
              updatedAt: new Date().toISOString(),
            });
          }
  
          async function persistAiChatAppTemplate(serverRecord) {
            if (!serverRecord) {
              return null;
            }
            const preparedServerRecord = normalizePlaygroundServerRecord(
              initializeNewDevelopResourceRecord(serverRecord)
            );
            const response = await fetch(backendUrl + "/servers/templates/ai-chat-app", {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: String(preparedServerRecord?.name || "").trim() || "AI Chat App",
                title: String(preparedServerRecord?.name || "").trim() || "AI Chat App",
                description: typeof preparedServerRecord?.description === "string" ? preparedServerRecord.description : "",
                projectId: typeof preparedServerRecord?.projectId === "string" && preparedServerRecord.projectId.trim() ? preparedServerRecord.projectId.trim() : null,
                region: typeof preparedServerRecord?.region === "string" && preparedServerRecord.region.trim() ? preparedServerRecord.region.trim() : "europe-west1",
                location: typeof preparedServerRecord?.databaseLocation === "string" && preparedServerRecord.databaseLocation.trim() ? preparedServerRecord.databaseLocation.trim() : "eur3",
                authMode: preparedServerRecord?.authMode === "private" ? "private" : "public",
                agentId: typeof preparedServerRecord?.templateAgentId === "string" && preparedServerRecord.templateAgentId.trim() ? preparedServerRecord.templateAgentId.trim() : null,
                environmentId: typeof preparedServerRecord?.templateEnvironmentId === "string" && preparedServerRecord.templateEnvironmentId.trim() ? preparedServerRecord.templateEnvironmentId.trim() : null,
                metadata: preparedServerRecord.metadata,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to create AI chat app.");
            }
  
            const initializeTemplateResource = (resource, normalizer) => resource?.id
              ? normalizer(initializeDevelopResourceIdentityMetadata(
                  resource,
                  getCurrentDevelopResourceIdentityInput()
                ))
              : normalizer(resource || null);
            return {
              template: data?.template || "ai_chat_app",
              webApp: initializeTemplateResource(data?.webApp, normalizePlaygroundServerRecord),
              auth: initializeTemplateResource(data?.auth, normalizePlaygroundServerRecord),
              agentRuntime: initializeTemplateResource(data?.agentRuntime, normalizePlaygroundServerRecord),
              database: initializeTemplateResource(data?.database, normalizePlaygroundDatabaseRecord),
              collections: Array.isArray(data?.collections) ? data.collections : [],
              files: Array.isArray(data?.files) ? data.files : [],
            };
          }
  
          function upsertLocalServerRecord(savedServer) {
            if (!savedServer?.id) {
              return;
            }
            setServers((current) => {
              const existingIndex = current.findIndex((server) => server.id === savedServer.id);
              if (existingIndex === -1) {
                return [savedServer, ...current];
              }
              const next = [...current];
              next[existingIndex] = savedServer;
              return next;
            });
            setServerDetailsById((current) => ({
              ...current,
              [savedServer.id]: savedServer,
            }));
          }
  
          function upsertLocalDatabaseRecord(savedDatabase) {
            if (!savedDatabase?.id) {
              return;
            }
            setDatabases((current) => {
              const existingIndex = current.findIndex((database) => database.id === savedDatabase.id);
              if (existingIndex === -1) {
                const next = [savedDatabase, ...current];
                writePlaygroundDatabaseListCache(databaseListScopeKeyRef.current, next);
                return next;
              }
              const next = [...current];
              next[existingIndex] = savedDatabase;
              writePlaygroundDatabaseListCache(databaseListScopeKeyRef.current, next);
              return next;
            });
            setHasLoadedDatabases(true);
            setDatabaseDetailsById((current) => ({
              ...current,
              [savedDatabase.id]: savedDatabase,
            }));
          }
  
          async function handleServerSave() {
            if (!draftServer) {
              return null;
            }
            if (isSelectedServerTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftServer)) {
              serverEditorDirtyRef.current = false;
              setServerSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
              return draftServer;
            }
  
            setServerSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              const savedServer = await persistServerRecord(normalizePlaygroundServerRecord(draftServer));
              if (!savedServer) {
                throw new Error("Server save failed.");
              }
  
              serverEditorDirtyRef.current = false;
              upsertLocalServerRecord(savedServer);
              setSelectedServerId(savedServer.id);
              setDraftServer(savedServer);
              setServerSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
              return savedServer;
            } catch (error) {
              setServerSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to save server.",
                message: "",
              });
              return null;
            }
          }
  
          function closeServerRenameDialog() {
            setServerRenameState(null);
            setServerRenameValue("");
            setServerRenameError("");
          }
  
          function openServerRenameDialog(serverRecord) {
            if (!serverRecord?.id || serverRecord.id === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            setServerActionsPopoverOpen(false);
            setServerRenameState({
              serverId: serverRecord.id,
              originalName: String(serverRecord.name || "").trim(),
            });
            setServerRenameValue(String(serverRecord.name || ""));
            setServerRenameError("");
          }
  
          async function handleServerRenameSubmit(event) {
            event.preventDefault();
            if (!serverRenameState?.serverId) {
              return;
            }
  
            const nextName = String(serverRenameValue || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setServerRenameError("Server name cannot be empty.");
              return;
            }
  
            if (nextName === serverRenameState.originalName) {
              closeServerRenameDialog();
              return;
            }
  
            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
              serverAutosaveTimerRef.current = null;
            }
            serverAutosaveQueuedRef.current = null;
            serverEditorDirtyRef.current = false;
  
            setServerSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
            setServerRenameError("");
  
            try {
              const response = await fetch(backendUrl + "/servers/" + encodeURIComponent(serverRenameState.serverId), {
                method: "PATCH",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: nextName }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to rename server.");
              }
              const targetServer = serverDetailsById[serverRenameState.serverId]
                || orderedServers.find((server) => server.id === serverRenameState.serverId)
                || draftServer
                || {};
              const responseServer = data?.server || data?.data || data;
              const savedServer = normalizePlaygroundServerRecord({
                ...targetServer,
                ...(responseServer && typeof responseServer === "object" && !Array.isArray(responseServer) ? responseServer : {}),
                id: serverRenameState.serverId,
                name: String(responseServer?.name || nextName),
                updatedAt: responseServer?.updatedAt || new Date().toISOString(),
              });
              upsertLocalServerRecord(savedServer);
              if (selectedServerId === savedServer.id) {
                setDraftServer(savedServer);
              }
              setServerSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
              closeServerRenameDialog();
            } catch (error) {
              setServerRenameError(error instanceof Error ? error.message : "Failed to rename server.");
              setServerSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
            }
          }
  
          function renderServerRenameModal() {
            if (!serverRenameState) {
              return null;
            }
  
            return React.createElement(PlatformModalBackdrop, {
                className: "sidebar-thread-rename-scrim",
                onClick: () => {
                  if (!serverSaveState.isSaving) {
                    closeServerRenameDialog();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "sidebar-thread-rename-modal",
                  onClick: (event) => event.stopPropagation(),
                  onSubmit: (event) => {
                    void handleServerRenameSubmit(event);
                  },
                },
                  React.createElement("div", { className: "sidebar-thread-rename-title" }, "Rename Server"),
                  React.createElement("div", { className: "sidebar-thread-rename-copy" }, "Choose a new name for this server."),
                  React.createElement("input", {
                    ref: serverRenameInputRef,
                    className: "sidebar-thread-rename-input",
                    value: serverRenameValue,
                    onChange: (event) => setServerRenameValue(event.target.value),
                    placeholder: "Server name",
                    disabled: serverSaveState.isSaving,
                  }),
                  serverRenameError
                    ? React.createElement("div", { className: "sidebar-thread-rename-error" }, serverRenameError)
                    : null,
                  React.createElement("div", { className: "sidebar-thread-rename-actions" },
                    React.createElement(PlatformSecondaryButton, {
                      size: "large",
                      type: "button",
                      className: "sidebar-thread-rename-button is-secondary",
                      onClick: closeServerRenameDialog,
                      disabled: serverSaveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "submit",
                      className: "sidebar-thread-rename-button is-primary",
                      disabled: serverSaveState.isSaving,
                    }, serverSaveState.isSaving ? "Saving..." : "Save")
                  )
                )
              );
          }
  
          function renderServerAuthUserComposerModal() {
            if (!serverAuthUserComposerState.open) {
              return null;
            }
  
            return React.createElement(PlatformModalBackdrop, {
                className: "playground-tasks-project-modal-backdrop",
                onClick: () => {
                  if (!serverAuthUserComposerState.isSaving) {
                    closeServerAuthUserComposer();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                    as: "form",
                    className: "playground-tasks-project-modal playground-database-browser-modal",
                    onClick: (event) => event.stopPropagation(),
                    onSubmit: (event) => void handleSubmitServerAuthUserComposer(event),
                  },
                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
                    React.createElement("div", { className: "playground-database-browser-modal-title-row" },
                      React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                        React.createElement(User, { width: 16, height: 16, strokeWidth: 1.8 })
                      ),
                      React.createElement("div", { className: "playground-database-browser-modal-title" }, "Add User")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: closeServerAuthUserComposer,
                      title: "Close",
                      disabled: serverAuthUserComposerState.isSaving,
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-database-browser-modal-copy" }, "Create a new email/password user inside this auth module."),
                  React.createElement("div", { className: "playground-database-browser-modal-grid is-single-column" },
                    React.createElement("label", { className: "playground-tasks-project-modal-field" },
                      React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Email"),
                      React.createElement("input", {
                        type: "email",
                        className: "playground-environments-input",
                        value: serverAuthUserComposerState.email,
                        onChange: (event) => setServerAuthUserComposerState((current) => ({
                          ...current,
                          email: event.target.value,
                          error: "",
                        })),
                        placeholder: "name@example.com",
                        autoFocus: true,
                      })
                    ),
                    React.createElement("label", { className: "playground-tasks-project-modal-field" },
                      React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Password"),
                      React.createElement("input", {
                        type: "password",
                        className: "playground-environments-input",
                        value: serverAuthUserComposerState.password,
                        onChange: (event) => setServerAuthUserComposerState((current) => ({
                          ...current,
                          password: event.target.value,
                          error: "",
                        })),
                        placeholder: "At least 6 characters",
                      })
                    ),
                    React.createElement("label", { className: "playground-tasks-project-modal-field" },
                      React.createElement("div", { className: "playground-tasks-project-modal-label" }, "Display Name"),
                      React.createElement("input", {
                        type: "text",
                        className: "playground-environments-input",
                        value: serverAuthUserComposerState.displayName,
                        onChange: (event) => setServerAuthUserComposerState((current) => ({
                          ...current,
                          displayName: event.target.value,
                          error: "",
                        })),
                        placeholder: "Optional",
                      })
                    )
                  ),
                  serverAuthUserComposerState.error
                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, serverAuthUserComposerState.error)
                    : null,
                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: closeServerAuthUserComposer,
                      disabled: serverAuthUserComposerState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "submit",
                      className: "playground-environments-action-button is-primary",
                      disabled: serverAuthUserComposerState.isSaving,
                    }, serverAuthUserComposerState.isSaving ? "Creating..." : "Create User")
                  )
                )
              );
          }
  
          async function handleDatabaseSave() {
            if (!draftDatabase) {
              return;
            }
            if (isSelectedDatabaseTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftDatabase)) {
              setDatabaseSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
              return;
            }
  
            setDatabaseSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              const savedDatabase = await persistDatabaseRecord(draftDatabase);
              if (!savedDatabase) {
                throw new Error("Database save failed.");
              }
  
              upsertLocalDatabaseRecord(savedDatabase);
              setSelectedDatabaseId(savedDatabase.id);
              setDraftDatabase(savedDatabase);
              setDatabaseSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
              void loadDatabaseCollections(savedDatabase.id, { force: true });
  	          void loadDatabaseAnalytics(savedDatabase.id, { force: true, period: databaseDetailChartTimescale });
            } catch (error) {
              setDatabaseSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to save database.",
                message: "",
              });
            }
          }
  
          function closeDatabaseRenameDialog() {
            setDatabaseRenameState(null);
            setDatabaseRenameValue("");
            setDatabaseRenameError("");
          }
  
          function openDatabaseRenameDialog(databaseRecord) {
            if (!databaseRecord?.id || databaseRecord.id === PLAYGROUND_DATABASE_DRAFT_ID) {
              return;
            }
            setDatabaseActionsPopoverOpen(false);
            setDatabaseRenameState({
              databaseId: databaseRecord.id,
              originalName: String(databaseRecord.name || "").trim(),
            });
            setDatabaseRenameValue(String(databaseRecord.name || ""));
            setDatabaseRenameError("");
          }
  
          async function handleDatabaseRenameSubmit(event) {
            event.preventDefault();
            if (!databaseRenameState?.databaseId) {
              return;
            }
  
            const nextName = String(databaseRenameValue || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setDatabaseRenameError("Database name cannot be empty.");
              return;
            }
  
            if (nextName === databaseRenameState.originalName) {
              closeDatabaseRenameDialog();
              return;
            }
  
            setDatabaseSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
            setDatabaseRenameError("");
  
            try {
              const response = await fetch(backendUrl + "/databases/" + encodeURIComponent(databaseRenameState.databaseId), {
                method: "PATCH",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: nextName }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to rename database.");
              }
              const targetDatabase = databaseDetailsById[databaseRenameState.databaseId]
                || orderedDatabases.find((database) => database.id === databaseRenameState.databaseId)
                || draftDatabase
                || {};
              const responseDatabase = data?.database || data?.data || data;
              const savedDatabase = normalizePlaygroundDatabaseRecord({
                ...targetDatabase,
                ...(responseDatabase && typeof responseDatabase === "object" && !Array.isArray(responseDatabase) ? responseDatabase : {}),
                id: databaseRenameState.databaseId,
                name: String(responseDatabase?.name || nextName),
                updatedAt: responseDatabase?.updatedAt || new Date().toISOString(),
              });
              upsertLocalDatabaseRecord(savedDatabase);
              if (selectedDatabaseId === savedDatabase.id) {
                setDraftDatabase(savedDatabase);
              }
              setDatabaseSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
              closeDatabaseRenameDialog();
  	          void loadDatabaseAnalytics(savedDatabase.id, { force: true, period: databaseDetailChartTimescale });
            } catch (error) {
              setDatabaseRenameError(error instanceof Error ? error.message : "Failed to rename database.");
              setDatabaseSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
            }
          }
  
          function renderDatabaseRenameModal() {
            if (!databaseRenameState) {
              return null;
            }
  
            return React.createElement(PlatformModalBackdrop, {
                className: "sidebar-thread-rename-scrim",
                onClick: () => {
                  if (!databaseSaveState.isSaving) {
                    closeDatabaseRenameDialog();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "sidebar-thread-rename-modal",
                  onClick: (event) => event.stopPropagation(),
                  onSubmit: (event) => {
                    void handleDatabaseRenameSubmit(event);
                  },
                },
                  React.createElement("div", { className: "sidebar-thread-rename-title" }, "Rename Database"),
                  React.createElement("div", { className: "sidebar-thread-rename-copy" }, "Choose a new name for this database."),
                  React.createElement("input", {
                    ref: databaseRenameInputRef,
                    className: "sidebar-thread-rename-input",
                    value: databaseRenameValue,
                    onChange: (event) => setDatabaseRenameValue(event.target.value),
                    placeholder: "Database name",
                    disabled: databaseSaveState.isSaving,
                  }),
                  databaseRenameError
                    ? React.createElement("div", { className: "sidebar-thread-rename-error" }, databaseRenameError)
                    : null,
                  React.createElement("div", { className: "sidebar-thread-rename-actions" },
                    React.createElement(PlatformSecondaryButton, {
                      size: "large",
                      type: "button",
                      className: "sidebar-thread-rename-button is-secondary",
                      onClick: closeDatabaseRenameDialog,
                      disabled: databaseSaveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "submit",
                      className: "sidebar-thread-rename-button is-primary",
                      disabled: databaseSaveState.isSaving,
                    }, databaseSaveState.isSaving ? "Saving..." : "Save")
                  )
                )
              );
          }
  
  	        async function handleDeleteServer(serverId, options = {}) {
            if (!serverId || serverId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            if (resourceTemplatePreviewServerRecordById[serverId] || (draftServer?.id === serverId && isSelectedServerTemplatePreview)) {
              return;
            }
  	          if (!options?.skipConfirmation && !window.confirm("Delete this server?")) {
              return;
            }
  
            setServerSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              await deleteDevelopResource({
                backendUrl,
                requestHeaders,
                resourceType: "server",
                resourceId: serverId,
              });
  
  	            const nextServers = servers.filter((server) => server.id !== serverId);
  	            setServers((current) => current.filter((server) => server.id !== serverId));
              setServerDetailsById((current) => {
                const next = { ...current };
                delete next[serverId];
                return next;
              });
              setServerFilesById((current) => {
                const next = { ...current };
                delete next[serverId];
                return next;
              });
              setServerBindingsById((current) => {
                const next = { ...current };
                delete next[serverId];
                return Object.fromEntries(
                  Object.entries(next).map(([bindingServerId, bindings]) => [
                    bindingServerId,
                    Array.isArray(bindings)
                      ? bindings.filter((binding) => !(binding.targetType === "auth" && binding.targetId === serverId))
                      : [],
                  ])
                );
              });
              if (selectedServerIdRef.current === serverId) {
                setSelectedServerId(nextServers[0]?.id || "");
                setDraftServer(null);
              }
              setServerSaveState({
                isSaving: false,
                error: "",
                message: "Deleted",
              });
            } catch (error) {
              setServerSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to delete server.",
                message: "",
              });
            }
          }
  
          function closeServerAuthUserComposer() {
            setServerAuthUserComposerState({
              open: false,
              email: "",
              password: "",
              displayName: "",
              error: "",
              isSaving: false,
            });
          }
  
          function openServerAuthUserComposer() {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            setServerAuthUserComposerState({
              open: true,
              email: "",
              password: "",
              displayName: "",
              error: "",
              isSaving: false,
            });
          }
  
          async function handleSubmitServerAuthUserComposer(event) {
            event.preventDefault();
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
  
            const email = String(serverAuthUserComposerState.email || "").trim();
            const password = String(serverAuthUserComposerState.password || "");
            const displayName = String(serverAuthUserComposerState.displayName || "").trim();
  
            if (!email) {
              setServerAuthUserComposerState((current) => ({
                ...current,
                error: "Email is required.",
              }));
              return;
            }
            if (password.length < 6) {
              setServerAuthUserComposerState((current) => ({
                ...current,
                error: "Password must be at least 6 characters.",
              }));
              return;
            }
  
            setServerAuthUserComposerState((current) => ({
              ...current,
              isSaving: true,
              error: "",
            }));
  
            try {
              const response = await fetch(backendUrl + "/servers/" + encodeURIComponent(draftServer.id) + "/auth-users", {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email,
                  password,
                  displayName,
                }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to create user.");
              }
              closeServerAuthUserComposer();
              await loadServerAuthUsers(draftServer.id, { force: true });
            } catch (error) {
              setServerAuthUserComposerState((current) => ({
                ...current,
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to create user.",
              }));
            }
          }
  
  	        async function handleDeleteDatabase(databaseId, options = {}) {
            if (!databaseId || databaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              return;
            }
            if (resourceTemplatePreviewDatabaseRecordById[databaseId] || (draftDatabase?.id === databaseId && isSelectedDatabaseTemplatePreview)) {
              return;
            }
  	          if (!options?.skipConfirmation && !window.confirm("Delete this database and all of its collections/documents?")) {
              return;
            }
  
            setDatabaseSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              await deleteDevelopResource({
                backendUrl,
                requestHeaders,
                resourceType: "database",
                resourceId: databaseId,
              });
  
  	            const nextDatabases = databases.filter((database) => database.id !== databaseId);
  	            setDatabases((current) => {
  	              const next = current.filter((database) => database.id !== databaseId);
  	              writePlaygroundDatabaseListCache(databaseListScopeKeyRef.current, next);
  	              return next;
  	            });
              setDatabaseDetailsById((current) => {
                const next = { ...current };
                delete next[databaseId];
                return next;
              });
              setDatabaseCollectionsById((current) => {
                const next = { ...current };
                delete next[databaseId];
                return next;
              });
              if (selectedDatabaseIdRef.current === databaseId) {
                setSelectedDatabaseId("");
                setDraftDatabase(null);
              }
              setServerBindingsById((current) => Object.fromEntries(
                Object.entries(current).map(([serverId, bindings]) => [
                  serverId,
                  Array.isArray(bindings)
                    ? bindings.filter((binding) => !(binding.targetType === "database" && binding.targetId === databaseId))
                    : [],
                ])
              ));
              setDatabaseSaveState({
                isSaving: false,
                error: "",
                message: "Deleted",
              });
            } catch (error) {
              setDatabaseSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to delete database.",
                message: "",
              });
            }
          }
  
          function escapeDatabaseExportCsvCell(value) {
            const normalizedValue = value == null
              ? ""
              : typeof value === "object"
                ? JSON.stringify(value)
                : String(value);
            return /[",\r\n]/.test(normalizedValue)
              ? '"' + normalizedValue.replace(/"/g, '""') + '"'
              : normalizedValue;
          }
  
          function buildDatabaseCsvExport(exportPayload) {
            const fieldNames = new Set();
            const documents = [];
            (Array.isArray(exportPayload?.collections) ? exportPayload.collections : []).forEach((collection) => {
              (Array.isArray(collection?.documents) ? collection.documents : []).forEach((document) => {
                const data = document?.data && typeof document.data === "object" && !Array.isArray(document.data)
                  ? document.data
                  : {};
                Object.keys(data).forEach((fieldName) => fieldNames.add(fieldName));
                documents.push({
                  collectionId: String(collection?.id || ""),
                  collectionName: String(collection?.name || collection?.id || ""),
                  documentId: String(document?.id || ""),
                  data,
                });
              });
            });
            const sortedFieldNames = Array.from(fieldNames).sort((left, right) => left.localeCompare(right));
            const rows = [
              ["collection_id", "collection_name", "document_id", ...sortedFieldNames],
              ...documents.map((document) => [
                document.collectionId,
                document.collectionName,
                document.documentId,
                ...sortedFieldNames.map((fieldName) => document.data[fieldName]),
              ]),
            ];
            return rows.map((row) => row.map(escapeDatabaseExportCsvCell).join(",")).join("\r\n") + "\r\n";
          }
  
          function escapeDatabaseExportXml(value) {
            return String(value == null ? "" : value)
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&apos;");
          }
  
          function serializeDatabaseExportXmlValue(value) {
            if (value === null || typeof value === "undefined") {
              return '<value type="null"></value>';
            }
            if (Array.isArray(value)) {
              return '<value type="array">'
                + value.map((item) => "<item>" + serializeDatabaseExportXmlValue(item) + "</item>").join("")
                + "</value>";
            }
            if (typeof value === "object") {
              return '<value type="object">'
                + Object.entries(value).map(([fieldName, fieldValue]) => (
                  '<field name="' + escapeDatabaseExportXml(fieldName) + '">'
                  + serializeDatabaseExportXmlValue(fieldValue)
                  + "</field>"
                )).join("")
                + "</value>";
            }
            return '<value type="' + escapeDatabaseExportXml(typeof value) + '">'
              + escapeDatabaseExportXml(value)
              + "</value>";
          }
  
          function buildDatabaseXmlExport(exportPayload) {
            const database = exportPayload?.database && typeof exportPayload.database === "object" ? exportPayload.database : {};
            const collections = Array.isArray(exportPayload?.collections) ? exportPayload.collections : [];
            const collectionXml = collections.map((collection) => {
              const documents = Array.isArray(collection?.documents) ? collection.documents : [];
              const documentXml = documents.map((document) => {
                const data = document?.data && typeof document.data === "object" && !Array.isArray(document.data)
                  ? document.data
                  : {};
                const fields = Object.entries(data).map(([fieldName, fieldValue]) => (
                  '<field name="' + escapeDatabaseExportXml(fieldName) + '">'
                  + serializeDatabaseExportXmlValue(fieldValue)
                  + "</field>"
                )).join("");
                return '<document id="' + escapeDatabaseExportXml(document?.id || "") + '"><data>' + fields + "</data></document>";
              }).join("");
              return '<collection id="' + escapeDatabaseExportXml(collection?.id || "")
                + '" name="' + escapeDatabaseExportXml(collection?.name || collection?.id || "")
                + '" documentCount="' + escapeDatabaseExportXml(collection?.documentCount || 0)
                + '" truncated="' + (collection?.truncated ? "true" : "false")
                + '"><documents>' + documentXml + "</documents></collection>";
            }).join("");
            return '<?xml version="1.0" encoding="UTF-8"?>\n'
              + '<databaseExport exportedAt="' + escapeDatabaseExportXml(exportPayload?.exportedAt || "") + '">'
              + '<database id="' + escapeDatabaseExportXml(database.id || "") + '">'
              + "<name>" + escapeDatabaseExportXml(database.name || "") + "</name>"
              + "<description>" + escapeDatabaseExportXml(database.description || "") + "</description>"
              + "<location>" + escapeDatabaseExportXml(database.location || "") + "</location>"
              + "<status>" + escapeDatabaseExportXml(database.status || "") + "</status>"
              + "<createdAt>" + escapeDatabaseExportXml(database.createdAt || "") + "</createdAt>"
              + "<updatedAt>" + escapeDatabaseExportXml(database.updatedAt || "") + "</updatedAt>"
              + "</database><collections>" + collectionXml + "</collections></databaseExport>\n";
          }
  
          async function handleExportDatabase(format = "json") {
            if (!draftDatabase?.id || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID || databaseExporting) {
              return;
            }
  
            const databaseId = draftDatabase.id;
            const normalizedFormat = ["json", "csv", "xml"].includes(String(format || "").toLowerCase())
              ? String(format).toLowerCase()
              : "json";
            setDatabaseExportMenuOpen(false);
            setDatabaseExporting(true);
            setDatabaseSaveState((current) => ({
              ...current,
              error: "",
              message: "",
            }));
  
            try {
              const collectionsResponse = await fetch(buildPlaygroundDatabaseCollectionsUrl(backendUrl, databaseId), {
                method: "GET",
                headers: requestHeaders,
              });
              const collectionsPayload = await collectionsResponse.json().catch(() => ({}));
              if (!collectionsResponse.ok) {
                throw new Error(collectionsPayload?.message || collectionsPayload?.error || "Failed to load collections.");
              }
  
              const collections = Array.isArray(collectionsPayload?.collections) ? collectionsPayload.collections : [];
              const exportCollections = [];
              const nextDocumentsByCollectionKey = {};
  
              for (const collection of collections) {
                const collectionId = String(collection?.id || collection?.name || "").trim();
                if (!collectionId) {
                  continue;
                }
                const documentsResponse = await fetch(buildPlaygroundDatabaseDocumentsUrl(backendUrl, databaseId, collectionId, 250), {
                  method: "GET",
                  headers: requestHeaders,
                });
                const documentsPayload = await documentsResponse.json().catch(() => ({}));
                if (!documentsResponse.ok) {
                  throw new Error(documentsPayload?.message || documentsPayload?.error || "Failed to load documents.");
                }
  
                const documents = Array.isArray(documentsPayload?.documents) ? documentsPayload.documents : [];
                nextDocumentsByCollectionKey[databaseId + ":" + collectionId] = documents;
                const declaredDocumentCount = Math.max(0, Number(collection?.documentCount || documents.length) || 0);
                exportCollections.push({
                  id: collectionId,
                  name: collection?.name || collectionId,
                  documentCount: declaredDocumentCount,
                  truncated: declaredDocumentCount > documents.length,
                  documents: documents.map((document) => ({
                    id: document?.id || "",
                    data: document?.data && typeof document.data === "object" ? document.data : {},
                  })),
                });
              }
  
              setDatabaseCollectionsById((current) => ({
                ...current,
                [databaseId]: collections,
              }));
              setDatabaseDocumentsByCollectionKey((current) => ({
                ...current,
                ...nextDocumentsByCollectionKey,
              }));
  
              const exportedAt = new Date().toISOString();
              const exportPayload = {
                exportedAt,
                database: {
                  id: draftDatabase.id,
                  name: draftDatabase.name || "",
                  description: draftDatabase.description || "",
                  location: draftDatabase.location || "",
                  status: draftDatabase.status || "",
                  createdAt: draftDatabase.createdAt || null,
                  updatedAt: draftDatabase.updatedAt || null,
                },
                collections: exportCollections,
              };
              const exportContent = normalizedFormat === "csv"
                ? buildDatabaseCsvExport(exportPayload)
                : normalizedFormat === "xml"
                  ? buildDatabaseXmlExport(exportPayload)
                  : JSON.stringify(exportPayload, null, 2) + "\n";
              const exportContentType = normalizedFormat === "csv"
                ? "text/csv;charset=utf-8"
                : normalizedFormat === "xml"
                  ? "application/xml;charset=utf-8"
                  : "application/json;charset=utf-8";
              const exportBlob = new Blob([exportContent], { type: exportContentType });
              const filenameBase = slugifyPlaygroundAgentEmailLocalPart(draftDatabase.name || draftDatabase.id || "database");
              triggerPlaygroundBlobDownload(exportBlob, filenameBase + "-database-export." + normalizedFormat);
              setDatabaseSaveState((current) => ({
                ...current,
                error: "",
                message: "Exported " + normalizedFormat.toUpperCase(),
              }));
            } catch (error) {
              setDatabaseSaveState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to export database.",
                message: "",
              }));
            } finally {
              setDatabaseExporting(false);
            }
          }
  
          function closeDatabaseCollectionComposer() {
            setDatabaseCollectionComposerState({
              open: false,
              name: "items",
              error: "",
              isSaving: false,
            });
          }
  
          function handleCreateDatabaseCollection() {
            if (!draftDatabase?.id || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID || isSelectedDatabaseTemplatePreview) {
              return;
            }
            setDatabaseCollectionComposerState({
              open: true,
              name: "items",
              error: "",
              isSaving: false,
            });
          }
  
          async function handleSubmitDatabaseCollectionComposer(event) {
            event.preventDefault();
            if (!draftDatabase?.id || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID || isSelectedDatabaseTemplatePreview) {
              return;
            }
            const name = String(databaseCollectionComposerState.name || "").trim();
            if (!name) {
              setDatabaseCollectionComposerState((current) => ({
                ...current,
                error: "Collection name is required.",
              }));
              return;
            }
  
            setDatabaseCollectionComposerState((current) => ({
              ...current,
              isSaving: true,
              error: "",
            }));
  
            try {
              const response = await fetch(buildPlaygroundDatabaseCollectionsUrl(backendUrl, draftDatabase.id), {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to create collection.");
              }
              const collections = await loadDatabaseCollections(draftDatabase.id, { force: true });
  	          void loadDatabaseAnalytics(draftDatabase.id, { force: true, period: databaseDetailChartTimescale });
              const createdCollectionId = data?.collection?.id || collections[0]?.id || "";
              if (createdCollectionId) {
                setSelectedDatabaseCollectionId(createdCollectionId);
              }
              closeDatabaseCollectionComposer();
              setDatabaseSaveState({
                isSaving: false,
                error: "",
                message: "Collection created",
              });
            } catch (error) {
              setDatabaseCollectionComposerState((current) => ({
                ...current,
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to create collection.",
              }));
              setDatabaseSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
            }
          }
  
          async function handleDeleteDatabaseCollection(collectionId) {
            if (!draftDatabase?.id || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID || isSelectedDatabaseTemplatePreview || !collectionId) {
              return;
            }
            setDatabaseCollectionActionsOpen(false);
            if (!window.confirm("Delete this collection and all documents inside it?")) {
              return;
            }
            try {
              const response = await fetch(
                backendUrl + "/databases/" + encodeURIComponent(draftDatabase.id) + "/collections/" + encodeURIComponent(collectionId),
                {
                  method: "DELETE",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete collection.");
              }
              await loadDatabaseCollections(draftDatabase.id, { force: true });
  	          void loadDatabaseAnalytics(draftDatabase.id, { force: true, period: databaseDetailChartTimescale });
              setSelectedDatabaseCollectionId("");
              setSelectedDatabaseDocumentId("");
            } catch (error) {
              setDatabaseSaveState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to delete collection.",
              }));
            }
          }
  
          function closeDatabaseDocumentComposer() {
            setDatabaseDocumentComposerState({
              open: false,
              documentId: "",
              error: "",
              isSaving: false,
            });
          }
  
          function handleCreateDatabaseDocument() {
            if (!draftDatabase?.id || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID || isSelectedDatabaseTemplatePreview || !selectedDatabaseCollectionId) {
              return;
            }
            setDatabaseDocumentComposerState({
              open: true,
              documentId: "doc_" + Date.now().toString(36),
              error: "",
              isSaving: false,
            });
          }
  
          async function handleSubmitDatabaseDocumentComposer(event) {
            event.preventDefault();
            if (!draftDatabase?.id || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID || isSelectedDatabaseTemplatePreview || !selectedDatabaseCollectionId) {
              return;
            }
            const documentId = String(databaseDocumentComposerState.documentId || "").trim();
            if (!documentId) {
              setDatabaseDocumentComposerState((current) => ({
                ...current,
                error: "Document ID is required.",
              }));
              return;
            }
  
            setDatabaseDocumentComposerState((current) => ({
              ...current,
              isSaving: true,
              error: "",
            }));
  
            try {
              const response = await fetch(
                backendUrl + "/databases/" + encodeURIComponent(draftDatabase.id)
                  + "/collections/" + encodeURIComponent(selectedDatabaseCollectionId)
                  + "/documents",
                {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    id: documentId,
                    data: {},
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to create document.");
              }
  
              await loadDatabaseCollections(draftDatabase.id, { force: true });
              await loadDatabaseDocuments(draftDatabase.id, selectedDatabaseCollectionId, { force: true });
  	          void loadDatabaseAnalytics(draftDatabase.id, { force: true, period: databaseDetailChartTimescale });
              closeDatabaseDocumentComposer();
              setSelectedDatabaseDocumentId(documentId);
              setDatabaseDocumentEditorState({
                documentId,
                value: "{}",
                initialValue: "{}",
                error: "",
                saveError: "",
                saveMessage: "",
                isSaving: false,
              });
              setDatabaseFieldExpansionState({});
              closeDatabaseFieldComposer();
            } catch (error) {
              setDatabaseDocumentComposerState((current) => ({
                ...current,
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to create document.",
              }));
              setDatabaseDocumentEditorState((current) => ({
                ...current,
                error: "",
              }));
            }
          }
  
          function handleSelectDatabaseDocument(document) {
            const documentId = String(document?.id || "").trim();
            selectedDatabaseDocumentIdRef.current = documentId;
            setSelectedDatabaseDocumentId(documentId);
            setDatabaseDocumentEditorState({
              documentId,
              value: "{}",
              initialValue: "{}",
              error: "",
              saveError: "",
              saveMessage: "",
              isLoading: Boolean(documentId),
              isSaving: false,
            });
            setDatabaseFieldExpansionState({});
            closeDatabaseFieldComposer();
            if (draftDatabase?.id && selectedDatabaseCollectionId && documentId) {
              void loadDatabaseDocumentContent(draftDatabase.id, selectedDatabaseCollectionId, documentId, {
                documentSummary: document,
              });
            }
          }
  
          function handleDatabaseDocumentEditorChange(nextValue) {
            if (isSelectedDatabaseTemplatePreview) {
              return;
            }
            setDatabaseDocumentEditorState((current) => ({
              ...current,
              value: typeof nextValue === "string" ? nextValue : "",
              saveError: "",
              saveMessage: "",
            }));
          }
  
          function setDatabaseDocumentFromObject(nextObject, options = {}) {
            if (isSelectedDatabaseTemplatePreview) {
              return;
            }
            const nextValue = formatPlaygroundDatabaseDocumentJson(nextObject);
            setDatabaseDocumentEditorState((current) => ({
              ...current,
              value: nextValue,
              initialValue: options.preserveInitialValue ? current.initialValue : nextValue,
              error: "",
              saveError: "",
              saveMessage: "",
            }));
          }
  
          function toggleDatabaseFieldExpansion(path) {
            const pathKey = getPlaygroundDatabasePathKey(path);
            setDatabaseFieldExpansionState((current) => ({
              ...current,
              [pathKey]: current[pathKey] === false,
            }));
          }
  
          function closeDatabaseFieldComposer() {
            setDatabaseFieldComposerState({
              open: false,
              parentPath: [],
              key: "",
              type: "string",
              value: "",
              error: "",
            });
          }
  
          function openDatabaseFieldComposer(parentPath = []) {
            if (isSelectedDatabaseTemplatePreview) {
              return;
            }
            setDatabaseFieldComposerState({
              open: true,
              parentPath: Array.isArray(parentPath) ? parentPath : [],
              key: "",
              type: "string",
              value: "",
              error: "",
            });
          }
  
          function handleDatabaseFieldValueChange(path, nextValue) {
            const parsedDocument = parsePlaygroundDatabaseDocumentObject(databaseDocumentEditorState.value);
            if (!parsedDocument) {
              setDatabaseDocumentEditorState((current) => ({
                ...current,
                saveError: "Document JSON is invalid.",
                saveMessage: "",
              }));
              return;
            }
            const currentValue = getPlaygroundDatabaseValueAtPath(parsedDocument, path);
            const valueType = getPlaygroundDatabaseFieldType(currentValue);
            let resolvedValue = nextValue;
            if (valueType === "number") {
              const numericValue = Number(String(nextValue || "").trim());
              if (!Number.isFinite(numericValue)) {
                setDatabaseDocumentEditorState((current) => ({
                  ...current,
                  saveError: "Number value is invalid.",
                  saveMessage: "",
                }));
                return;
              }
              resolvedValue = numericValue;
            } else if (valueType === "boolean") {
              resolvedValue = Boolean(nextValue);
            } else if (valueType === "null") {
              resolvedValue = null;
            } else {
              resolvedValue = String(nextValue || "");
            }
            const nextDocument = setPlaygroundDatabaseValueAtPath(parsedDocument, path, resolvedValue);
            setDatabaseDocumentFromObject(nextDocument, { preserveInitialValue: true });
          }
  
          function handleDeleteDatabaseField(path) {
            if (isSelectedDatabaseTemplatePreview) {
              return;
            }
            const parsedDocument = parsePlaygroundDatabaseDocumentObject(databaseDocumentEditorState.value);
            if (!parsedDocument) {
              return;
            }
            const nextDocument = deletePlaygroundDatabaseValueAtPath(parsedDocument, path);
            setDatabaseDocumentFromObject(nextDocument, { preserveInitialValue: true });
          }
  
          function handleSubmitDatabaseFieldComposer(event) {
            event.preventDefault();
            const parsedDocument = parsePlaygroundDatabaseDocumentObject(databaseDocumentEditorState.value);
            if (!parsedDocument) {
              setDatabaseFieldComposerState((current) => ({
                ...current,
                error: "Document JSON is invalid.",
              }));
              return;
            }
  
            const fieldKey = String(databaseFieldComposerState.key || "").trim();
            if (!fieldKey) {
              setDatabaseFieldComposerState((current) => ({
                ...current,
                error: "Field is required.",
              }));
              return;
            }
  
            const parentValue = getPlaygroundDatabaseValueAtPath(parsedDocument, databaseFieldComposerState.parentPath);
            if (!isPlaygroundDatabasePlainObject(parentValue)) {
              setDatabaseFieldComposerState((current) => ({
                ...current,
                error: "Fields can only be added to object values.",
              }));
              return;
            }
  
            let fieldValue = null;
            try {
              fieldValue = createPlaygroundDatabaseFieldValue(databaseFieldComposerState.type, databaseFieldComposerState.value);
            } catch (error) {
              setDatabaseFieldComposerState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Field value is invalid.",
              }));
              return;
            }
  
            const nextDocument = setPlaygroundDatabaseValueAtPath(
              parsedDocument,
              [...databaseFieldComposerState.parentPath, fieldKey],
              fieldValue,
            );
            setDatabaseDocumentFromObject(nextDocument, { preserveInitialValue: true });
            setDatabaseFieldExpansionState((current) => ({
              ...current,
              [getPlaygroundDatabasePathKey(databaseFieldComposerState.parentPath)]: true,
            }));
            closeDatabaseFieldComposer();
          }
  
          async function handleSaveDatabaseDocument(options = {}) {
            if (!draftDatabase?.id || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID || !selectedDatabaseCollectionId || !databaseDocumentEditorState.documentId || databaseDocumentEditorState.isLoading || databaseDocumentEditorState.isSaving || databaseDocumentSaveInFlightRef.current) {
              return;
            }
            if (isSelectedDatabaseTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftDatabase)) {
              setDatabaseDocumentEditorState((current) => ({
                ...current,
                value: current.initialValue,
                saveError: "",
                saveMessage: "",
                isSaving: false,
              }));
              return;
            }
  
            if (databaseDocumentAutosaveTimerRef.current) {
              window.clearTimeout(databaseDocumentAutosaveTimerRef.current);
              databaseDocumentAutosaveTimerRef.current = null;
            }
  
            const preserveFormatting = options?.preserveFormatting === true;
            const silent = options?.silent === true;
            const preservedEditorValue = databaseDocumentEditorState.value;
            databaseDocumentSaveInFlightRef.current = true;
  
            let parsedData = null;
            try {
              parsedData = JSON.parse(databaseDocumentEditorState.value || "{}");
            } catch (error) {
              setDatabaseDocumentEditorState((current) => ({
                ...current,
                saveError: error instanceof Error ? error.message : "Document JSON is invalid.",
                saveMessage: "",
              }));
              databaseDocumentSaveInFlightRef.current = false;
              return;
            }
  
            if (!parsedData || typeof parsedData !== "object" || Array.isArray(parsedData)) {
              setDatabaseDocumentEditorState((current) => ({
                ...current,
                saveError: "Document JSON must be an object.",
                saveMessage: "",
              }));
              databaseDocumentSaveInFlightRef.current = false;
              return;
            }
  
            setDatabaseDocumentEditorState((current) => ({
              ...current,
              isSaving: true,
              saveError: "",
              saveMessage: "",
            }));
  
            try {
              const response = await fetch(
                buildPlaygroundDatabaseDocumentUrl(backendUrl, draftDatabase.id, selectedDatabaseCollectionId, databaseDocumentEditorState.documentId),
                {
                  method: "PUT",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    data: parsedData,
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save document.");
              }
  
              await loadDatabaseCollections(draftDatabase.id, { force: true });
              await loadDatabaseDocuments(draftDatabase.id, selectedDatabaseCollectionId, { force: true });
  	          void loadDatabaseAnalytics(draftDatabase.id, { force: true, period: databaseDetailChartTimescale });
              const nextValue = formatPlaygroundDatabaseDocumentJson(parsedData);
              setDatabaseDocumentEditorState((current) => ({
                ...current,
                isSaving: false,
                initialValue: preserveFormatting ? preservedEditorValue : nextValue,
                value: preserveFormatting ? preservedEditorValue : nextValue,
                saveError: "",
                saveMessage: silent ? "" : "Saved",
              }));
            } catch (error) {
              setDatabaseDocumentEditorState((current) => ({
                ...current,
                isSaving: false,
                saveError: error instanceof Error ? error.message : "Failed to save document.",
                saveMessage: "",
              }));
            } finally {
              databaseDocumentSaveInFlightRef.current = false;
            }
          }
  
          function handleDatabaseJsonEditorBlur() {
            if (databaseDocumentViewMode !== "json" || !databaseDocumentEditorState.documentId) {
              return;
            }
            if (databaseDocumentEditorState.value === databaseDocumentEditorState.initialValue) {
              return;
            }
            const parsedDocument = parsePlaygroundDatabaseDocumentObject(databaseDocumentEditorState.value);
            if (!parsedDocument) {
              return;
            }
            void handleSaveDatabaseDocument({
              silent: true,
              preserveFormatting: true,
            });
          }
  
          function switchDatabaseDocumentViewMode(nextMode) {
            const normalizedMode = nextMode === "json" ? "json" : "preview";
            if (normalizedMode === databaseDocumentViewMode) {
              return;
            }
  
            if (normalizedMode === "json") {
              setDatabaseDocumentViewMode("json");
              setDatabaseDocumentEditorState((current) => ({
                ...current,
                saveMessage: "",
              }));
              return;
            }
  
            if (databaseDocumentViewMode === "json" && databaseDocumentEditorState.documentId) {
              const parsedDocument = parsePlaygroundDatabaseDocumentObject(databaseDocumentEditorState.value);
              if (!parsedDocument) {
                return;
              }
              if (databaseDocumentEditorState.value !== databaseDocumentEditorState.initialValue) {
                void handleSaveDatabaseDocument({
                  silent: true,
                  preserveFormatting: true,
                });
              }
            }
  
            setDatabaseDocumentViewMode("preview");
          }
  
          async function handleDeleteDatabaseDocument(documentId) {
            if (!draftDatabase?.id || draftDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID || !selectedDatabaseCollectionId || !documentId) {
              return;
            }
            if (isSelectedDatabaseTemplatePreview) {
              return;
            }
            setDatabaseDocumentActionsOpen(false);
            if (!window.confirm("Delete this document?")) {
              return;
            }
  
            try {
              const response = await fetch(
                buildPlaygroundDatabaseDocumentUrl(backendUrl, draftDatabase.id, selectedDatabaseCollectionId, documentId),
                {
                  method: "DELETE",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete document.");
              }
  
              await loadDatabaseCollections(draftDatabase.id, { force: true });
              await loadDatabaseDocuments(draftDatabase.id, selectedDatabaseCollectionId, { force: true });
  	          void loadDatabaseAnalytics(draftDatabase.id, { force: true, period: databaseDetailChartTimescale });
              if (databaseDocumentEditorState.documentId === documentId) {
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
                setDatabaseFieldExpansionState({});
                closeDatabaseFieldComposer();
              }
            } catch (error) {
              setDatabaseDocumentEditorState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to delete document.",
              }));
            }
          }
  
          function openServerFileUploadPicker() {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || serverFileTransferState.isUploading) {
              return;
            }
            serverFileUploadInputRef.current?.click();
          }
  
          async function handleServerFileUploadFiles(files) {
            const normalizedFiles = Array.from(files || []).filter(Boolean);
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || isSelectedServerTemplatePreview || normalizedFiles.length === 0) {
              return;
            }
  
            setServerFileTransferState({
              isUploading: true,
              error: "",
              message: "",
            });
  
            try {
              for (const file of normalizedFiles) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("path", "");
  
                const response = await fetch(
                  backendUrl + "/servers/" + encodeURIComponent(draftServer.id) + "/files/upload",
                  {
                    method: "POST",
                    headers: requestHeaders,
                    body: formData,
                  }
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || ("Failed to upload " + file.name + "."));
                }
              }
  
              await loadServerFiles(draftServer.id);
              serverVersionDraftTouchedRef.current = true;
              setServerFileTransferState({
                isUploading: false,
                error: "",
                message: normalizedFiles.length === 1 ? "Uploaded 1 file" : "Uploaded " + normalizedFiles.length + " files",
              });
            } catch (error) {
              setServerFileTransferState({
                isUploading: false,
                error: error instanceof Error ? error.message : "Failed to upload source files.",
                message: "",
              });
            }
          }
  
          async function handleServerFileUploadSelection(event) {
            const files = Array.from(event?.target?.files || []);
            if (event?.target) {
              event.target.value = "";
            }
            if (files.length === 0) {
              return;
            }
            await handleServerFileUploadFiles(files);
          }
  
          async function handleServerFileDownload(entry) {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || !entry || entry.isFolder) {
              return;
            }
  
            try {
              const encodedPath = String(entry.path || "")
                .split("/")
                .filter(Boolean)
                .map((segment) => encodeURIComponent(segment))
                .join("/");
              const response = await fetch(
                backendUrl + "/servers/" + encodeURIComponent(draftServer.id) + "/files/download/" + encodedPath,
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.message || data?.error || "Failed to download file.");
              }
  
              const blob = await response.blob();
              const downloadUrl = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = downloadUrl;
              anchor.download = entry.name || "download";
              document.body.appendChild(anchor);
              anchor.click();
              document.body.removeChild(anchor);
              window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
            } catch (error) {
              setServerFileTransferState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to download source file.",
              }));
            }
          }
  
          async function handleServerFilesDelete(entries) {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || isSelectedServerTemplatePreview) {
              return;
            }
            const uniqueEntries = Array.from(new Map(
              (Array.isArray(entries) ? entries : [])
                .filter((entry) => entry?.path)
                .map((entry) => [normalizeHistoryPath(entry.path), entry])
            ).values());
            if (!uniqueEntries.length) return;
            setServerSourceFileMenuPath("");
            const confirmationMessage = uniqueEntries.length === 1
              ? 'Delete "' + (uniqueEntries[0].name || uniqueEntries[0].path) + '" from this server source bundle?'
              : "Delete " + uniqueEntries.length + " selected source files from this server source bundle?";
            if (!window.confirm(confirmationMessage)) {
              return;
            }
  
            try {
              const deleteResults = await Promise.all(uniqueEntries.map(async (entry) => {
                const encodedPath = String(entry.path || "")
                  .split("/")
                  .filter(Boolean)
                  .map((segment) => encodeURIComponent(segment))
                  .join("/");
                const response = await fetch(
                  backendUrl + "/servers/" + encodeURIComponent(draftServer.id) + "/files/" + encodedPath,
                  {
                    method: "DELETE",
                    headers: requestHeaders,
                  }
                );
                const data = await response.json().catch(() => ({}));
                return {
                  entry,
                  ok: response.ok,
                  message: data?.message || data?.error || "Failed to delete source file.",
                };
              }));
              const deletedEntries = deleteResults.filter((result) => result.ok);
              const failedEntries = deleteResults.filter((result) => !result.ok);
              if (deletedEntries.length) {
                await loadServerFiles(draftServer.id);
                serverVersionDraftTouchedRef.current = true;
              }
              if (failedEntries.length) {
                const failedNames = failedEntries
                  .map((result) => result.entry.name || result.entry.path)
                  .join(", ");
                throw new Error(
                  (failedEntries.length === 1 ? failedEntries[0].message : "Some source files could not be deleted.")
                  + " "
                  + failedNames
                );
              }
              setServerFileTransferState((current) => ({
                ...current,
                error: "",
                message: uniqueEntries.length === 1 ? "Deleted" : "Deleted " + uniqueEntries.length + " files",
              }));
            } catch (error) {
              setServerFileTransferState((current) => ({
                ...current,
                error: error instanceof Error ? error.message : "Failed to delete source files.",
                message: "",
              }));
            }
          }

          async function handleServerFileDelete(entry) {
            return handleServerFilesDelete([entry]);
          }
  
          async function handleServerFileRename(entry) {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || isSelectedServerTemplatePreview || !entry?.path || entry.isFolder) {
              return;
            }
            const currentPath = normalizeHistoryPath(entry.path);
            const rawNextPath = window.prompt("Rename source file", currentPath);
            const nextPath = normalizeHistoryPath(rawNextPath || "");
            setServerSourceFileMenuPath("");
            if (!nextPath || nextPath === currentPath) {
              return;
            }
  
            setServerFileTransferState({
              isUploading: false,
              error: "",
              message: "",
            });
  
            try {
              let content = "";
              if (serverFileEditorState.path === currentPath && serverFileEditorState.status === "ready") {
                content = serverFileEditorState.value;
              } else {
                const readResponse = await fetch(
                  buildPlaygroundServerFileContentUrl(backendUrl, draftServer.id, currentPath),
                  {
                    method: "GET",
                    headers: requestHeaders,
                  }
                );
                const readData = await readResponse.json().catch(() => ({}));
                if (!readResponse.ok) {
                  throw new Error(readData?.message || readData?.error || "Failed to read source file before renaming.");
                }
                content = typeof readData?.content === "string" ? readData.content : "";
              }
  
              const writeResponse = await fetch(
                buildPlaygroundServerFileContentUrl(backendUrl, draftServer.id, nextPath),
                {
                  method: "PUT",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ content }),
                }
              );
              const writeData = await writeResponse.json().catch(() => ({}));
              if (!writeResponse.ok) {
                throw new Error(writeData?.message || writeData?.error || "Failed to write renamed source file.");
              }
  
              const encodedCurrentPath = currentPath
                .split("/")
                .filter(Boolean)
                .map((segment) => encodeURIComponent(segment))
                .join("/");
              const deleteResponse = await fetch(
                backendUrl + "/servers/" + encodeURIComponent(draftServer.id) + "/files/" + encodedCurrentPath,
                {
                  method: "DELETE",
                  headers: requestHeaders,
                }
              );
              const deleteData = await deleteResponse.json().catch(() => ({}));
              if (!deleteResponse.ok) {
                throw new Error(deleteData?.message || deleteData?.error || "Renamed file was created, but the old file could not be removed.");
              }
  
              await loadServerFiles(draftServer.id);
              serverVersionDraftTouchedRef.current = true;
              if (serverFileEditorState.path === currentPath) {
                setServerFileEditorState((current) => ({
                  ...current,
                  path: nextPath,
                  status: "ready",
                  value: content,
                  initialValue: content,
                  error: "",
                  saveError: "",
                  saveMessage: "Renamed",
                }));
              }
              setServerFileTransferState({
                isUploading: false,
                error: "",
                message: "Renamed to " + nextPath,
              });
            } catch (error) {
              setServerFileTransferState({
                isUploading: false,
                error: error instanceof Error ? error.message : "Failed to rename source file.",
                message: "",
              });
            }
          }
  
          function toggleServerSourceFolderExpansion(path) {
            const normalizedPath = normalizeHistoryPath(path);
            if (!normalizedPath) {
              return;
            }
            setServerSourceExpandedFolders((current) => {
              const next = new Set(current);
              if (next.has(normalizedPath)) {
                next.delete(normalizedPath);
              } else {
                next.add(normalizedPath);
              }
              return next;
            });
          }
  
          async function handleServerFileOpen(entry) {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || !entry?.path || entry.isFolder) {
              return;
            }
            if (!isPlaygroundTextPreviewable(entry)) {
              const historyKey = String(draftServer.id || "") + "|" + normalizeHistoryPath(entry.path);
              setServerFileEditorHistoryByKey((current) => {
                if (!Object.prototype.hasOwnProperty.call(current, historyKey)) return current;
                const next = { ...current };
                delete next[historyKey];
                return next;
              });
              setServerFileEditorState({
                path: entry.path,
                status: "error",
                value: "",
                initialValue: "",
                error: "Only text-based source files can be edited inline right now.",
                saveError: "",
                saveMessage: "",
                isSaving: false,
                wordWrap: true,
              });
              return;
            }
            await loadServerFileContent(draftServer.id, entry.path);
          }

          function getActiveServerFileEditorHistoryKey() {
            const serverId = String(draftServer?.id || selectedServerId || "").trim();
            const filePath = normalizeHistoryPath(serverFileEditorState.path || "");
            return serverId && filePath ? serverId + "|" + filePath : "";
          }

          function applyServerFileEditorValue(nextValue) {
            const normalizedValue = typeof nextValue === "string" ? nextValue : "";
            const serverId = String(draftServer?.id || selectedServerId || "").trim();
            const filePath = normalizeHistoryPath(serverFileEditorState.path || "");
            if (serverId && filePath) {
              const draftKey = serverId + "|" + filePath;
              if (normalizedValue === String(serverFileEditorState.initialValue || "")) {
                serverSourceDraftContentsRef.current.delete(draftKey);
              } else {
                serverSourceDraftContentsRef.current.set(draftKey, normalizedValue);
              }
            }
            setServerFileEditorState((current) => ({
              ...current,
              value: normalizedValue,
              saveError: "",
              saveMessage: "",
            }));
            serverVersionDraftTouchedRef.current = true;
          }

          function handleServerFileEditorChange(nextValue) {
            if (isSelectedServerTemplatePreview) {
              return;
            }
            const normalizedValue = typeof nextValue === "string" ? nextValue : "";
            const currentValue = String(serverFileEditorState.value || "");
            if (normalizedValue === currentValue) {
              return;
            }
            const historyKey = getActiveServerFileEditorHistoryKey();
            if (historyKey) {
              setServerFileEditorHistoryByKey((current) => {
                const history = current[historyKey] || { past: [], future: [] };
                return {
                  ...current,
                  [historyKey]: {
                    past: [...history.past, currentValue].slice(-100),
                    future: [],
                  },
                };
              });
            }
            applyServerFileEditorValue(normalizedValue);
          }

          function handleServerFileEditorUndo() {
            const historyKey = getActiveServerFileEditorHistoryKey();
            const history = historyKey
              ? serverFileEditorHistoryByKey[historyKey] || { past: [], future: [] }
              : { past: [], future: [] };
            if (!history.past.length || isSelectedServerTemplatePreview) {
              return;
            }
            const previousValue = history.past[history.past.length - 1];
            const currentValue = String(serverFileEditorState.value || "");
            setServerFileEditorHistoryByKey((current) => ({
              ...current,
              [historyKey]: {
                past: history.past.slice(0, -1),
                future: [...history.future, currentValue].slice(-100),
              },
            }));
            applyServerFileEditorValue(previousValue);
          }

          function handleServerFileEditorRedo() {
            const historyKey = getActiveServerFileEditorHistoryKey();
            const history = historyKey
              ? serverFileEditorHistoryByKey[historyKey] || { past: [], future: [] }
              : { past: [], future: [] };
            if (!history.future.length || isSelectedServerTemplatePreview) {
              return;
            }
            const nextValue = history.future[history.future.length - 1];
            const currentValue = String(serverFileEditorState.value || "");
            setServerFileEditorHistoryByKey((current) => ({
              ...current,
              [historyKey]: {
                past: [...history.past, currentValue].slice(-100),
                future: history.future.slice(0, -1),
              },
            }));
            applyServerFileEditorValue(nextValue);
          }
  
          function handleCloseServerFileEditor() {
            setServerFileActionsPopoverOpen(false);
            setServerFileEditorHistoryByKey({});
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
          }
  
          async function handleServerFileSave() {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || !serverFileEditorState.path || serverFileEditorState.status !== "ready" || serverFileEditorState.isSaving) {
              return;
            }
            if (isSelectedServerTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftServer)) {
              setServerFileEditorState((current) => ({
                ...current,
                value: current.initialValue,
                saveError: "",
                saveMessage: "",
                isSaving: false,
              }));
              return;
            }
            if (isAuthoritativelyVersionedServer(draftServer)) {
              openAuthoritativeServerVersionSaveDialog();
              return;
            }
  
            setServerFileEditorState((current) => ({
              ...current,
              isSaving: true,
              saveError: "",
              saveMessage: "",
            }));
  
            try {
              const response = await fetch(
                buildPlaygroundServerFileContentUrl(backendUrl, draftServer.id, serverFileEditorState.path),
                {
                  method: "PUT",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    content: serverFileEditorState.value,
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save source file.");
              }
  
              setServerFileEditorState((current) => ({
                ...current,
                isSaving: false,
                initialValue: current.value,
                saveError: "",
                saveMessage: "Saved",
              }));
              serverVersionDraftTouchedRef.current = true;
              await loadServerFiles(draftServer.id);
            } catch (error) {
              setServerFileEditorState((current) => ({
                ...current,
                isSaving: false,
                saveError: error instanceof Error ? error.message : "Failed to save source file.",
                saveMessage: "",
              }));
            }
          }
  
          async function handleCreateServerFile() {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID || isSelectedServerTemplatePreview) {
              return;
            }
            const rawPath = window.prompt("New file path", "index.js");
            const normalizedPath = normalizeHistoryPath(rawPath || "");
            if (!normalizedPath) {
              return;
            }
  
            setServerFileTransferState({
              isUploading: false,
              error: "",
              message: "",
            });
  
            try {
              const response = await fetch(
                buildPlaygroundServerFileContentUrl(backendUrl, draftServer.id, normalizedPath),
                {
                  method: "PUT",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    content: "",
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to create source file.");
              }
  
              await loadServerFiles(draftServer.id);
              serverVersionDraftTouchedRef.current = true;
              setServerFileTransferState({
                isUploading: false,
                error: "",
                message: "Created " + normalizedPath,
              });
              await loadServerFileContent(draftServer.id, normalizedPath, { fallbackValue: "" });
            } catch (error) {
              setServerFileTransferState({
                isUploading: false,
                error: error instanceof Error ? error.message : "Failed to create source file.",
                message: "",
              });
            }
          }
  
          async function createDefaultServerSourceFiles(serverId, starterFiles, options = {}) {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            if (resourceTemplatePreviewServerRecordById[normalizedServerId]) {
              return;
            }
            const defaultSourceKey = normalizedServerId + ":" + String(options?.kind || "source");
            if (serverDefaultSourceCreationRef.current.has(defaultSourceKey)) {
              return;
            }
            serverDefaultSourceCreationRef.current.add(defaultSourceKey);
  
            setServerFileTransferState({
              isUploading: false,
              error: "",
              message: options?.progressMessage || "Creating starter files...",
            });
  
            try {
              for (const starterFile of starterFiles) {
                const response = await fetch(
                  buildPlaygroundServerFileContentUrl(backendUrl, normalizedServerId, starterFile.path),
                  {
                    method: "PUT",
                    headers: {
                      ...requestHeaders,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      content: starterFile.content,
                    }),
                  }
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to create " + starterFile.path + ".");
                }
              }
  
              await loadServerFiles(normalizedServerId);
              if (options?.openSource !== false) {
                await loadServerFileContent(normalizedServerId, options?.openPath || starterFiles[0]?.path || "", {
                  fallbackValue: options?.openFallbackValue || starterFiles[0]?.content || "",
                });
              }
              setServerFileTransferState({
                isUploading: false,
                error: "",
                message: options?.successMessage || "Created starter files",
              });
            } catch (error) {
              setServerFileTransferState({
                isUploading: false,
                error: error instanceof Error ? error.message : (options?.errorMessage || "Failed to create default files."),
                message: "",
              });
            }
          }
  
          async function createDefaultFunctionSourceFile(serverId, options = {}) {
            return createDefaultServerSourceFiles(serverId, [
              {
                path: PLAYGROUND_DEFAULT_FUNCTION_SOURCE_PATH,
                content: PLAYGROUND_DEFAULT_FUNCTION_SOURCE_CONTENT,
              },
              {
                path: PLAYGROUND_DEFAULT_FUNCTION_PACKAGE_PATH,
                content: PLAYGROUND_DEFAULT_FUNCTION_PACKAGE_CONTENT,
              },
            ], {
              ...options,
              kind: "function",
              progressMessage: "Creating function starter files...",
              successMessage: "Created function starter files",
              errorMessage: "Failed to create default function files.",
              openPath: PLAYGROUND_DEFAULT_FUNCTION_SOURCE_PATH,
              openFallbackValue: PLAYGROUND_DEFAULT_FUNCTION_SOURCE_CONTENT,
            });
          }
  
          async function createDefaultWebAppSourceFiles(serverId, options = {}) {
            return createDefaultServerSourceFiles(serverId, [
              {
                path: PLAYGROUND_DEFAULT_WEB_APP_SOURCE_PATH,
                content: PLAYGROUND_DEFAULT_WEB_APP_SOURCE_CONTENT,
              },
              {
                path: PLAYGROUND_DEFAULT_WEB_APP_PACKAGE_PATH,
                content: PLAYGROUND_DEFAULT_WEB_APP_PACKAGE_CONTENT,
              },
            ], {
              ...options,
              kind: "web_app",
              progressMessage: "Creating web app starter files...",
              successMessage: "Created web app starter files",
              errorMessage: "Failed to create default web app files.",
              openPath: PLAYGROUND_DEFAULT_WEB_APP_SOURCE_PATH,
              openFallbackValue: PLAYGROUND_DEFAULT_WEB_APP_SOURCE_CONTENT,
            });
          }
  
          function buildMaterializedServerFromTemplatePreview(previewServer) {
            const now = new Date().toISOString();
            return normalizePlaygroundServerRecord({
              ...previewServer,
              id: "",
              userId: "",
              serviceUrl: "",
              customDomain: "",
              cloudRunServiceName: "",
              imageUrl: "",
              status: "draft",
              lastDeployedAt: "",
              metadata: buildPlaygroundResourceTemplateMaterializedMetadata(previewServer),
              createdAt: now,
              updatedAt: now,
            });
          }
  
          async function writeTemplatePreviewServerFilesToServer(previewServerId, targetServerId) {
            const normalizedPreviewServerId = String(previewServerId || "").trim();
            const normalizedTargetServerId = String(targetServerId || "").trim();
            if (!normalizedPreviewServerId || !normalizedTargetServerId) {
              throw new Error("Template preview source files could not be resolved.");
            }
  
            const previewFiles = Array.isArray(resourceTemplatePreviewServerFilesById[normalizedPreviewServerId])
              ? resourceTemplatePreviewServerFilesById[normalizedPreviewServerId]
              : [];
            const previewContentByPath = resourceTemplatePreviewServerFileContentById[normalizedPreviewServerId] || {};
            const fileEntries = previewFiles
              .filter((file) => file && !file.isFolder)
              .map((file) => ({
                ...file,
                path: normalizeHistoryPath(file.path || ""),
              }))
              .filter((file) => file.path);
  
            if (fileEntries.length === 0) {
              throw new Error("This template preview does not include source files to deploy.");
            }
  
            setServerFileTransferState({
              isUploading: false,
              error: "",
              message: "Creating source files...",
            });
  
            for (const file of fileEntries) {
              const writeUrl = buildPlaygroundServerFileContentUrl(backendUrl, normalizedTargetServerId, file.path);
              if (!writeUrl) {
                throw new Error("Invalid template source path: " + file.path);
              }
              const content = typeof previewContentByPath[file.path] === "string" ? previewContentByPath[file.path] : "";
              const response = await fetch(writeUrl, {
                method: "PUT",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to create " + file.path + ".");
              }
            }
  
            setServerFilesById((current) => ({
              ...current,
              [normalizedTargetServerId]: fileEntries,
            }));
  
            const activePreviewEditorPath = normalizeHistoryPath(serverFileEditorState.path || "");
            const openPath = activePreviewEditorPath && Object.prototype.hasOwnProperty.call(previewContentByPath, activePreviewEditorPath)
              ? activePreviewEditorPath
              : fileEntries[0]?.path || "";
            if (openPath) {
              const openContent = typeof previewContentByPath[openPath] === "string" ? previewContentByPath[openPath] : "";
              setServerFileEditorState((current) => ({
                ...current,
                path: openPath,
                status: "ready",
                value: openContent,
                initialValue: openContent,
                error: "",
                saveError: "",
                saveMessage: "",
                isSaving: false,
              }));
            }
  
            await loadServerFiles(normalizedTargetServerId);
            setServerFileTransferState({
              isUploading: false,
              error: "",
              message: "Created source files",
            });
          }
  
          async function materializeSelectedServerTemplatePreviewForDeploy() {
            const previewServer = selectedServerTemplatePreview
              || (draftServer && isPlaygroundResourceTemplatePreviewRecord(draftServer) ? normalizePlaygroundServerRecord(draftServer) : null);
            if (!previewServer?.id) {
              throw new Error("Template preview server could not be resolved.");
            }
  
            setServerSaveState({
              isSaving: true,
              error: "",
              message: "Creating resource...",
            });
  
            const savedServer = await persistServerRecord(buildMaterializedServerFromTemplatePreview(previewServer));
            if (!savedServer?.id) {
              throw new Error("Server creation response did not include an id.");
            }
  
            upsertLocalServerRecord(savedServer);
            selectedServerIdRef.current = savedServer.id;
            serverSeededSelectionRef.current = savedServer.id;
            setSelectedDatabaseId("");
            setDraftDatabase(null);
            setIsHomeViewActive(false);
            setSelectedServerId(savedServer.id);
            setDraftServer(savedServer);
            serverEditorDirtyRef.current = false;
            serverAutosaveQueuedRef.current = null;
  
            await writeTemplatePreviewServerFilesToServer(previewServer.id, savedServer.id);
  
            setServerSaveState({
              isSaving: false,
              error: "",
              message: "",
            });
            return savedServer;
          }
  
          async function deployServerRecord(serverRecord, options = {}) {
            const serverToDeploy = normalizePlaygroundServerRecord(serverRecord || draftServer);
            const serverToDeployId = String(serverToDeploy?.id || "").trim();
            if (!serverToDeployId || serverToDeployId === PLAYGROUND_SERVER_DRAFT_ID) {
              throw new Error("No server was available to deploy.");
            }
            setServerDeploymentStatusDismissed(false);
            setServerDeploymentState({
              isDeploying: true,
              isInvoking: false,
              error: "",
              message: options.message || "",
              lastResponseText: "",
              deployProgress: Math.max(0.08, Number(options.progress || 0.08) || 0.08),
            });
            startServerDeployProgressTimer();
  
            try {
              const response = await fetch(
                backendUrl + "/servers/" + encodeURIComponent(serverToDeployId) + "/deploy",
                {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to deploy server.");
              }
  
              const updatedServer = getPlaygroundServerResponseRecord(data);
              const mergedUpdatedServer = updatedServer
                ? normalizePlaygroundServerRecord({
                    ...serverToDeploy,
                    ...updatedServer,
                    metadata: options.preserveVersionMetadata ? serverToDeploy.metadata : updatedServer.metadata,
                  })
                : null;
              if (mergedUpdatedServer) {
                upsertLocalServerRecord(mergedUpdatedServer);
                if (selectedServerIdRef.current === mergedUpdatedServer.id || serverToDeployId === mergedUpdatedServer.id) {
                  setDraftServer(mergedUpdatedServer);
                  if (options.preserveVersionMetadata) {
                    rememberServerVersionBaseline(mergedUpdatedServer, { force: true });
                  }
                }
              }
  
              clearServerDeployProgressTimer();
              setServerDeploymentState({
                isDeploying: false,
                isInvoking: false,
                error: "",
                message: data?.serviceUrl ? "Deployed to " + data.serviceUrl : "Deployment finished",
                lastResponseText: "",
                deployProgress: 1,
              });
              void loadServerContext(serverToDeployId, { force: true });
              void loadServerAnalytics(serverToDeployId, { force: true });
              void loadServerDeployments(serverToDeployId, { force: true });
              void loadServerLogs(serverToDeployId, "deployment", { force: true });
              return mergedUpdatedServer || serverToDeploy;
            } catch (error) {
              clearServerDeployProgressTimer();
              setServerSaveState((current) => ({
                ...current,
                isSaving: false,
                error: current.error,
                message: "",
              }));
              setServerDeploymentState({
                isDeploying: false,
                isInvoking: false,
                error: error instanceof Error ? error.message : "Failed to deploy server.",
                message: "",
                lastResponseText: "",
                deployProgress: 0,
              });
              throw error;
            }
          }
  
          async function handleDeployServer() {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const shouldMaterializeTemplatePreview = isSelectedServerTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftServer);
  
            if (!shouldMaterializeTemplatePreview && serverFileEditorState.status === "ready" && serverFileEditorState.path && serverFileEditorState.value !== serverFileEditorState.initialValue) {
              await handleServerFileSave();
            }
  
            if (!shouldMaterializeTemplatePreview) {
              await commitDraftServerIfDirty();
            }
  
            setServerDeploymentStatusDismissed(false);
            setServerDeploymentState({
              isDeploying: true,
              isInvoking: false,
              error: "",
              message: shouldMaterializeTemplatePreview ? "Creating resource from template..." : "",
              lastResponseText: "",
              deployProgress: 0.08,
            });
            startServerDeployProgressTimer();
  
            try {
              const serverToDeploy = shouldMaterializeTemplatePreview
                ? await materializeSelectedServerTemplatePreviewForDeploy()
                : normalizePlaygroundServerRecord(draftServer);
              const serverToDeployId = String(serverToDeploy?.id || "").trim();
              if (!serverToDeployId) {
                throw new Error("No server was available to deploy.");
              }
              if (shouldMaterializeTemplatePreview) {
                setServerDeploymentState((current) => ({
                  ...current,
                  isDeploying: true,
                  error: "",
                  message: "Deploying " + (serverToDeploy.name || "resource") + "...",
                  deployProgress: Math.max(Number(current.deployProgress || 0), 0.2),
                }));
              }
              await deployServerRecord(serverToDeploy);
            } catch (error) {
              clearServerDeployProgressTimer();
              setServerSaveState((current) => ({
                ...current,
                isSaving: false,
                error: current.error,
                message: "",
              }));
              setServerDeploymentState({
                isDeploying: false,
                isInvoking: false,
                error: error instanceof Error ? error.message : "Failed to deploy server.",
                message: "",
                lastResponseText: "",
                deployProgress: 0,
              });
            }
          }
  
          async function handleRollbackServerDeployment(deployment) {
            const normalizedServerId = String(draftServer?.id || "").trim();
            const deploymentId = String(deployment?.id || "").trim();
            const revision = String(deployment?.revision || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID || !deploymentId) {
              return;
            }
  
            const rollbackLabel = revision || deploymentId;
            const confirmed = window.confirm("Roll back " + (draftServer.name || "this server") + " to " + rollbackLabel + "?");
            if (!confirmed) {
              return;
            }
  
            setServerDeploymentHistoryState({
              error: "",
              rollingBackDeploymentId: deploymentId,
            });
            setServerDeploymentStatusDismissed(false);
            setServerDeploymentState({
              isDeploying: false,
              isInvoking: false,
              error: "",
              message: "Rolling back to " + rollbackLabel + "...",
              lastResponseText: "",
              deployProgress: 0,
            });
  
            try {
              const response = await fetch(
                buildPlaygroundServerRollbackUrl(backendUrl, normalizedServerId),
                {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ deploymentId }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to roll back deployment.");
              }
  
              const updatedServer = getPlaygroundServerResponseRecord(data);
              if (updatedServer) {
                upsertLocalServerRecord(updatedServer);
                if (selectedServerIdRef.current === updatedServer.id) {
                  setDraftServer(updatedServer);
                  serverEditorDirtyRef.current = false;
                }
              }
  
              const rollbackDeployment = normalizePlaygroundServerDeploymentRecord(data?.deployment);
              setServerDeploymentState({
                isDeploying: false,
                isInvoking: false,
                error: "",
                message: rollbackDeployment?.serviceUrl
                  ? "Rolled back to " + rollbackLabel + " at " + rollbackDeployment.serviceUrl
                  : "Rolled back to " + rollbackLabel,
                lastResponseText: "",
                deployProgress: 0,
              });
              void loadServerDeployments(normalizedServerId, { force: true });
              void loadServerContext(normalizedServerId, { force: true });
              void loadServerAnalytics(normalizedServerId, { force: true });
              void loadServerLogs(normalizedServerId, "deployment", { force: true });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to roll back deployment.";
              setServerDeploymentHistoryState((current) => ({
                ...current,
                error: errorMessage,
              }));
              setServerDeploymentState({
                isDeploying: false,
                isInvoking: false,
                error: errorMessage,
                message: "",
                lastResponseText: "",
                deployProgress: 0,
              });
            } finally {
              setServerDeploymentHistoryState((current) => ({
                ...current,
                rollingBackDeploymentId: current.rollingBackDeploymentId === deploymentId ? "" : current.rollingBackDeploymentId,
              }));
            }
          }
  
          function syncServerCustomDomainResponse(data) {
            const updatedServer = getPlaygroundServerResponseRecord(data);
            if (updatedServer?.id) {
              upsertLocalServerRecord(updatedServer);
              if (selectedServerIdRef.current === updatedServer.id) {
                setDraftServer(updatedServer);
                serverEditorDirtyRef.current = false;
              }
            }
            return {
              server: updatedServer,
              domain: data?.domain || (updatedServer ? getPlaygroundServerCustomDomainState(updatedServer) : null),
              domains: Array.isArray(data?.domains) ? data.domains : (updatedServer ? getPlaygroundServerCustomDomainStates(updatedServer) : []),
            };
          }
  
          function openServerCustomDomainModal(existingCustomDomain) {
            setServerCustomDomainModalState({
              open: true,
              domain: existingCustomDomain?.domain || draftServer?.customDomain || "",
              status: "idle",
              error: "",
              result: existingCustomDomain || null,
            });
          }
  
          function closeServerCustomDomainModal() {
            setServerCustomDomainModalState({
              open: false,
              domain: "",
              status: "idle",
              error: "",
              result: null,
            });
          }
  
          async function handleRemoveServerCustomDomain(domain) {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const normalizedDomain = String(domain || "").trim();
            if (!normalizedDomain) {
              return;
            }
            if (!window.confirm("Disconnect " + normalizedDomain + "?")) {
              return;
            }
  
            setServerCustomDomainRemoveState({
              domain: normalizedDomain,
              status: "removing",
              error: "",
            });
  
            try {
              const response = await fetch(
                backendUrl + "/servers/" + encodeURIComponent(draftServer.id) + "/custom-domain?domain=" + encodeURIComponent(normalizedDomain),
                {
                  method: "DELETE",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ domain: normalizedDomain }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to disconnect custom domain.");
              }
              syncServerCustomDomainResponse(data);
              setServerCustomDomainRemoveState({
                domain: "",
                status: "idle",
                error: "",
              });
            } catch (error) {
              setServerCustomDomainRemoveState({
                domain: normalizedDomain,
                status: "idle",
                error: error instanceof Error ? error.message : "Failed to disconnect custom domain.",
              });
            }
          }
  
          async function handleSaveServerCustomDomain() {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const domain = String(serverCustomDomainModalState.domain || "").trim();
            if (!domain) {
              setServerCustomDomainModalState((current) => ({
                ...current,
                error: "Enter a domain first.",
              }));
              return;
            }
  
            setServerCustomDomainModalState((current) => ({
              ...current,
              status: "saving",
              error: "",
            }));
  
            try {
              await commitDraftServerIfDirty();
              const response = await fetch(
                backendUrl + "/servers/" + encodeURIComponent(draftServer.id) + "/custom-domain",
                {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ domain }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to add custom domain.");
              }
  
              const synced = syncServerCustomDomainResponse(data);
              setServerCustomDomainModalState((current) => ({
                ...current,
                status: "success",
                error: "",
                result: synced.domain || current.result,
              }));
            } catch (error) {
              setServerCustomDomainModalState((current) => ({
                ...current,
                status: "idle",
                error: error instanceof Error ? error.message : "Failed to add custom domain.",
              }));
            }
          }
  
          async function handleCheckServerCustomDomain() {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const domain = String(serverCustomDomainModalState.domain || draftServer.customDomain || "").trim();
            if (!domain) {
              setServerCustomDomainModalState((current) => ({
                ...current,
                error: "Enter a domain first.",
              }));
              return;
            }
  
            setServerCustomDomainModalState((current) => ({
              ...current,
              status: "checking",
              error: "",
            }));
  
            try {
              const response = await fetch(
                backendUrl + "/servers/" + encodeURIComponent(draftServer.id) + "/custom-domain/check",
                {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ domain }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to check custom domain.");
              }
  
              const synced = syncServerCustomDomainResponse(data);
              setServerCustomDomainModalState((current) => ({
                ...current,
                status: "success",
                error: "",
                result: synced.domain || current.result,
              }));
            } catch (error) {
              setServerCustomDomainModalState((current) => ({
                ...current,
                status: "idle",
                error: error instanceof Error ? error.message : "Failed to check custom domain.",
              }));
            }
          }
  
          async function handleInvokeServer() {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            if (isSelectedServerTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftServer)) {
              return;
            }
  
            if (serverFileEditorState.status === "ready" && serverFileEditorState.path && serverFileEditorState.value !== serverFileEditorState.initialValue) {
              await handleServerFileSave();
            }
  
            setServerDeploymentStatusDismissed(false);
            setServerDeploymentState((current) => ({
              ...current,
              isInvoking: true,
              error: "",
              message: "",
              lastResponseText: "",
            }));
  
            try {
              const response = await fetch(
                backendUrl + "/servers/" + encodeURIComponent(draftServer.id) + "/invoke",
                {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    method: "GET",
                    path: "/",
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to request server.");
              }
  
              const responseText = typeof data?.text === "string"
                ? data.text
                : JSON.stringify(data?.body ?? null, null, 2);
  
              setServerDeploymentState((current) => ({
                ...current,
                isInvoking: false,
                error: "",
                message: "Invocation returned " + String(data?.status || 200),
                lastResponseText: responseText,
              }));
              void loadServerAnalytics(draftServer.id, { force: true });
              void loadServerLogs(draftServer.id, "request", { force: true });
            } catch (error) {
              setServerDeploymentState((current) => ({
                ...current,
                isInvoking: false,
                error: error instanceof Error ? error.message : "Failed to request server.",
                message: "",
                lastResponseText: "",
              }));
            }
          }
  
          function closeServerRuntimePreview() {
            setServerRuntimePreviewState({
              open: false,
              target: "",
              title: "",
              path: "",
              language: "json",
              value: "",
              loading: false,
              error: "",
            });
          }
  
          async function openServerRuntimePreview(target) {
            const normalizedServerId = String(draftServer?.id || "").trim();
            const normalizedTarget = String(target || "").trim().toLowerCase();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
  
            const isConfigTarget = normalizedTarget === "config";
            const runtimeTarget = normalizedTarget === "browser" ? "browser" : "server";
            const title = isConfigTarget
              ? "Runtime Config"
              : runtimeTarget === "browser"
                ? "Browser SDK"
                : "Server SDK";
  
            setServerRuntimePreviewState({
              open: true,
              target: normalizedTarget,
              title,
              path: isConfigTarget
                ? "computer-agents-runtime.json"
                : runtimeTarget === "browser"
                  ? "computer-agents.runtime.browser.mjs"
                  : "computer-agents.runtime.server.mjs",
              language: isConfigTarget ? "json" : "javascript",
              value: "",
              loading: true,
              error: "",
            });
  
            try {
              const response = await fetch(
                isConfigTarget
                  ? buildPlaygroundServerRuntimeConfigUrl(backendUrl, normalizedServerId)
                  : buildPlaygroundServerRuntimeSdkUrl(backendUrl, normalizedServerId, runtimeTarget),
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const payloadText = await response.text();
              const payloadJson = isConfigTarget
                ? (() => {
                    try {
                      return JSON.parse(payloadText || "{}");
                    } catch {
                      return null;
                    }
                  })()
                : null;
              if (!response.ok) {
                const message = payloadJson?.message || payloadJson?.error || payloadText || "Failed to load runtime preview.";
                throw new Error(message);
              }
  
              const nextValue = isConfigTarget
                ? JSON.stringify(payloadJson?.runtime || payloadJson || {}, null, 2)
                : payloadText;
              setServerRuntimePreviewState((current) => ({
                ...current,
                open: true,
                target: normalizedTarget,
                title,
                path: isConfigTarget
                  ? "computer-agents-runtime.json"
                  : runtimeTarget === "browser"
                    ? "computer-agents.runtime.browser.mjs"
                    : "computer-agents.runtime.server.mjs",
                language: isConfigTarget ? "json" : "javascript",
                value: nextValue,
                loading: false,
                error: "",
              }));
            } catch (error) {
              setServerRuntimePreviewState((current) => ({
                ...current,
                open: true,
                target: normalizedTarget,
                title,
                loading: false,
                error: error instanceof Error ? error.message : "Failed to load runtime preview.",
              }));
            }
          }
  
          async function handleServerComposerSubmit(event) {
            if (event?.preventDefault) {
              event.preventDefault();
            }
  
            const composerDraft = serverComposerDraft || buildPlaygroundDefaultServerDraft();
            const composerKind = canonicalizePlaygroundServerKind(composerDraft.kind);
            const isAiChatAppTemplate = composerKind === "web_app" && composerDraft.template === "ai_chat_app";
            if (!String(composerDraft.name || "").trim()) {
              setServerComposerSaveState({
                isSaving: false,
                error: "Name is required.",
              });
              return;
            }
            if (isAiChatAppTemplate && !String(composerDraft.templateAgentId || "").trim()) {
              setServerComposerSaveState({
                isSaving: false,
                error: "Choose an agent for the AI chat app template.",
              });
              return;
            }
            if (isAiChatAppTemplate && !String(composerDraft.templateEnvironmentId || "").trim()) {
              setServerComposerSaveState({
                isSaving: false,
                error: "Choose a computer for the AI chat app template.",
              });
              return;
            }
  
            setServerComposerSaveState({
              isSaving: true,
              error: "",
            });
  
            try {
              if (composerKind === "database") {
                const savedDatabase = await persistDatabaseRecord(normalizePlaygroundDatabaseRecord({
                  ...buildPlaygroundDefaultDatabaseDraft(),
                  name: composerDraft.name,
                  description: composerDraft.description,
                  location: composerDraft.databaseLocation || "eur3",
                }));
                if (!savedDatabase) {
                  throw new Error("Database creation failed.");
                }
                upsertLocalDatabaseRecord(savedDatabase);
                setSelectedServerId("");
                setSelectedDatabaseId(savedDatabase.id);
                setDraftDatabase(savedDatabase);
                closeServerComposer();
                return;
              }
  
              if (isAiChatAppTemplate) {
                const createdTemplate = await persistAiChatAppTemplate(normalizePlaygroundServerRecord(composerDraft));
                if (!createdTemplate?.webApp?.id) {
                  throw new Error("AI chat app creation failed.");
                }
                if (createdTemplate.database?.id) {
                  upsertLocalDatabaseRecord(createdTemplate.database);
                }
                [createdTemplate.webApp, createdTemplate.auth, createdTemplate.agentRuntime]
                  .filter(Boolean)
                  .forEach((server) => upsertLocalServerRecord(server));
                setSelectedDatabaseId("");
                setSelectedServerId(createdTemplate.webApp.id);
                setDraftServer(createdTemplate.webApp);
                closeServerComposer();
                return;
              }
  
              const savedServer = await persistServerRecord(normalizePlaygroundServerRecord(composerDraft));
              if (!savedServer) {
                throw new Error("Server creation failed.");
              }
  
              setServers((current) => [savedServer, ...current.filter((server) => server.id !== savedServer.id)]);
              setServerDetailsById((current) => ({
                ...current,
                [savedServer.id]: savedServer,
              }));
              setSelectedServerId(savedServer.id);
              setDraftServer(savedServer);
              if (composerKind === "function") {
                await createDefaultFunctionSourceFile(savedServer.id, { openSource: false });
              } else if (composerKind === "web_app") {
                await createDefaultWebAppSourceFiles(savedServer.id, { openSource: false });
              }
              closeServerComposer();
            } catch (error) {
              setServerComposerSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to create server.",
              });
            }
          }
  
          async function flushQueuedServerAutosave() {
            if (serverAutosaveInFlightRef.current) {
              return;
            }
  
            serverAutosaveInFlightRef.current = true;
            try {
              while (serverAutosaveQueuedRef.current) {
                let nextServerToSave = normalizePlaygroundServerRecord(serverAutosaveQueuedRef.current);
                serverAutosaveQueuedRef.current = null;
  
                setServerSaveState({
                  isSaving: true,
                  error: "",
                  message: "",
                });
  
                try {
                  const savedServer = await persistServerRecord(nextServerToSave);
                  if (!savedServer) {
                    throw new Error("Server save failed.");
                  }
  
                  const hasQueuedFollowUp = Boolean(serverAutosaveQueuedRef.current);
                  const shouldKeepServerSelected =
                    selectedServerIdRef.current === nextServerToSave.id
                    || (!nextServerToSave.id && selectedServerIdRef.current === PLAYGROUND_SERVER_DRAFT_ID);
  
                  if (hasQueuedFollowUp && serverAutosaveQueuedRef.current) {
                    serverAutosaveQueuedRef.current = normalizePlaygroundServerRecord({
                      ...serverAutosaveQueuedRef.current,
                      id: savedServer.id,
                      userId: savedServer.userId || serverAutosaveQueuedRef.current.userId,
                      createdAt: savedServer.createdAt || serverAutosaveQueuedRef.current.createdAt,
                    });
                  }
  
                  serverEditorDirtyRef.current = hasQueuedFollowUp;
                  upsertLocalServerRecord(savedServer);
                  if (shouldKeepServerSelected) {
                    setSelectedServerId(savedServer.id);
                    setDraftServer((current) => {
                      if (hasQueuedFollowUp && current) {
                        return normalizePlaygroundServerRecord({
                          ...savedServer,
                          ...current,
                          id: savedServer.id,
                          userId: savedServer.userId,
                          createdAt: savedServer.createdAt,
                        });
                      }
                      return savedServer;
                    });
                  }
  
                  setServerSaveState({
                    isSaving: false,
                    error: "",
                    message: "",
                  });
                } catch (error) {
                  serverEditorDirtyRef.current = true;
                  setServerSaveState({
                    isSaving: false,
                    error: error instanceof Error ? error.message : "Failed to save server.",
                    message: "",
                  });
                  break;
                }
              }
            } finally {
              serverAutosaveInFlightRef.current = false;
            }
          }
  
          async function flushQueuedEnvironmentAutosave() {
            if (environmentAutosaveInFlightRef.current) {
              return;
            }
  
            environmentAutosaveInFlightRef.current = true;
            try {
              while (environmentAutosaveQueuedRef.current) {
                const nextEnvironmentToSave = normalizePlaygroundEnvironmentRecord(environmentAutosaveQueuedRef.current);
                environmentAutosaveQueuedRef.current = null;
  
                setSaveState({
                  isSaving: true,
                  error: "",
                  message: "",
                });
  
                try {
                  const savedEnvironment = await persistEnvironmentRecord(nextEnvironmentToSave);
                  const hasQueuedFollowUp = Boolean(environmentAutosaveQueuedRef.current);
                  const shouldKeepEnvironmentSelected =
                    selectedEnvironmentIdRef.current === nextEnvironmentToSave.id
                    || (!nextEnvironmentToSave.id && selectedEnvironmentIdRef.current === PLAYGROUND_ENVIRONMENT_DRAFT_ID);
  
                  if (hasQueuedFollowUp && environmentAutosaveQueuedRef.current) {
                    environmentAutosaveQueuedRef.current = normalizePlaygroundEnvironmentRecord({
                      ...environmentAutosaveQueuedRef.current,
                      id: savedEnvironment.id,
                      userId: savedEnvironment.userId || environmentAutosaveQueuedRef.current.userId,
                      createdAt: savedEnvironment.createdAt || environmentAutosaveQueuedRef.current.createdAt,
                    });
                  }
  
                  editorDirtyRef.current = hasQueuedFollowUp;
                  setEnvironmentDetailsById((current) => ({
                    ...current,
                    [savedEnvironment.id]: savedEnvironment,
                  }));
                  if (shouldKeepEnvironmentSelected) {
                    setSelectedEnvironmentId(savedEnvironment.id);
                    setDraftEnvironment((current) => {
                      if (hasQueuedFollowUp && current) {
                        return normalizePlaygroundEnvironmentRecord({
                          ...savedEnvironment,
                          ...current,
                          id: savedEnvironment.id,
                          userId: savedEnvironment.userId,
                          createdAt: savedEnvironment.createdAt,
                        });
                      }
                      return preserveTransientDraftEnvironmentRows(savedEnvironment, current);
                    });
                  }
  
                  if (!hasQueuedFollowUp) {
                    setModifiedSecrets({});
                    setModifiedMcpTokens({});
                  }
  
                  setSaveState({
                    isSaving: false,
                    error: "",
                    message: "",
                  });
                  if (onEnvironmentMutated) {
                    await onEnvironmentMutated();
                  }
                } catch (error) {
                  setSaveState({
                    isSaving: false,
                    error: error instanceof Error ? error.message : "Failed to save environment.",
                    message: "",
                  });
                  break;
                }
              }
            } finally {
              environmentAutosaveInFlightRef.current = false;
            }
          }
  
          async function handleSetDefaultEnvironment() {
            if (!draftEnvironment?.id || draftEnvironment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
  
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(draftEnvironment.id) + "/set-default", {
                method: "POST",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to set default environment.");
              }
  
              const updatedEnvironment = getPlaygroundEnvironmentResponseRecord(data) || normalizePlaygroundEnvironmentRecord({
                ...draftEnvironment,
                isDefault: true,
              });
  
              setEnvironmentDetailsById((current) => {
                const next = {};
                Object.keys(current).forEach((id) => {
                  next[id] = {
                    ...current[id],
                    isDefault: id === updatedEnvironment.id,
                  };
                });
                next[updatedEnvironment.id] = updatedEnvironment;
                return next;
              });
              setDraftEnvironment((current) => current ? { ...current, isDefault: true } : current);
              setSaveState({
                isSaving: false,
                error: "",
                message: "Default updated",
              });
              if (onEnvironmentMutated) {
                await onEnvironmentMutated();
              }
            } catch (error) {
              setSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to set default environment.",
                message: "",
              });
            }
          }
  
          async function handleDeleteEnvironment(environmentId) {
            if (!environmentId || environmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
            if (!window.confirm("Delete this environment?")) {
              return;
            }
  
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              await deleteComputerResource({
                backendUrl,
                requestHeaders,
                computerId: environmentId,
              });
  
              setEnvironmentDetailsById((current) => {
                const next = { ...current };
                delete next[environmentId];
                return next;
              });
              if (selectedEnvironmentId === environmentId) {
                const remainingEnvironments = orderedEnvironments.filter((environment) => environment.id !== environmentId);
                const fallbackEnvironment = remainingEnvironments.find((environment) => environment.isDefault) || remainingEnvironments[0] || null;
                setSelectedEnvironmentId(fallbackEnvironment?.id || "");
                setDraftEnvironment(null);
              }
              setSaveState({
                isSaving: false,
                error: "",
                message: "Deleted",
              });
              if (onEnvironmentMutated) {
                await onEnvironmentMutated();
              }
            } catch (error) {
              setSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to delete environment.",
                message: "",
              });
            }
          }
  
          async function handleDeleteEnvironments(environmentRecords = []) {
            const targets = normalizeEnvironmentActionTargets(environmentRecords)
              .filter((environmentTarget) =>
                environmentTarget?.id
                && environmentTarget.id !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
                && !environmentTarget.isSystem
                && !environmentTarget.isDefault
              );
            if (targets.length === 0) {
              return;
            }
            const prompt = targets.length === 1
              ? "Delete this computer?"
              : "Delete " + targets.length + " computers?";
            if (!window.confirm(prompt)) {
              return;
            }
  
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              for (const target of targets) {
                await deleteComputerResource({
                  backendUrl,
                  requestHeaders,
                  computerId: target.id,
                });
              }
              const deletedIds = new Set(targets.map((target) => target.id));
              setEnvironmentDetailsById((current) => {
                const next = { ...current };
                deletedIds.forEach((environmentId) => {
                  delete next[environmentId];
                });
                return next;
              });
              setSelectedOverviewComputerIds((current) => {
                const next = new Set(current || []);
                deletedIds.forEach((environmentId) => next.delete(environmentId));
                return next;
              });
              if (deletedIds.has(selectedEnvironmentId)) {
                const remainingEnvironments = orderedEnvironments.filter((environment) => !deletedIds.has(environment.id));
                const fallbackEnvironment = remainingEnvironments.find((environment) => environment.isDefault) || remainingEnvironments[0] || null;
                setSelectedEnvironmentId(fallbackEnvironment?.id || "");
                setDraftEnvironment(null);
              }
              setSaveState({
                isSaving: false,
                error: "",
                message: targets.length === 1 ? "Deleted" : "Deleted " + targets.length + " computers",
              });
              if (onEnvironmentMutated) {
                await onEnvironmentMutated();
              }
            } catch (error) {
              setSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to delete environments.",
                message: "",
              });
            }
          }
  

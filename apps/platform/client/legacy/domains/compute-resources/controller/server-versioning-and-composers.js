          function handleRevertDraft() {
            clearEnvironmentAutosaveQueue();
            if (selectedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              resetEditorAuxiliaryState();
              setDraftEnvironment(buildPlaygroundDefaultEnvironmentDraft());
              return;
            }
  
            const selectedVersion = getDraftEnvironmentSelectedVersion();
            if (selectedVersion) {
              const result = environmentVersionController.buildRestoreVersionResource(draftEnvironment, selectedVersion.id);
              if (!result?.resource) {
                return;
              }
              void commitVersionedEnvironmentRecord(result.resource, {
                operation: "revert",
                actor: getEnvironmentVersionActor(),
                loadingMessage: "Reverting computer...",
                successMessage: "Reverted",
                errorMessage: "Failed to revert computer.",
              });
              return;
            }
  
            const nextDraft = selectedEnvironmentSnapshot ? normalizePlaygroundEnvironmentRecord(selectedEnvironmentSnapshot) : null;
            resetEditorAuxiliaryState();
            setDraftEnvironment(nextDraft);
            rememberEnvironmentVersionBaseline(nextDraft, { force: true });
          }
  
          function getServerMetadataRecord(serverRecord) {
            return serverRecord?.metadata && typeof serverRecord.metadata === "object" && !Array.isArray(serverRecord.metadata)
              ? serverRecord.metadata
              : {};
          }
  
          function getCurrentServerVersionSourceFileContents() {
            const normalizedServerId = String(selectedServerId || draftServer?.id || "").trim();
            const previewContents = normalizedServerId && resourceTemplatePreviewServerFileContentById[normalizedServerId]
              ? resourceTemplatePreviewServerFileContentById[normalizedServerId]
              : {};
            const contents = normalizePlaygroundServerVersionSourceFileContents(previewContents);
            if (serverFileEditorState.status === "ready" && serverFileEditorState.path) {
              contents[normalizeHistoryPath(serverFileEditorState.path)] = String(serverFileEditorState.value || "");
            }
            return normalizePlaygroundServerVersionSourceFileContents(contents);
          }
  
          function buildDraftServerVersionSnapshot(serverRecord = draftServer) {
            return buildPlaygroundServerVersionSnapshot(serverRecord, {
              sourceFiles: currentServerFiles,
              sourceFileContents: getCurrentServerVersionSourceFileContents(),
            });
          }
  
          function buildServerVersionComparableSnapshot(snapshot) {
            const normalizedSnapshot = normalizePlaygroundServerVersion({ snapshot }).snapshot;
            return {
              name: normalizedSnapshot.name,
              description: normalizedSnapshot.description,
              kind: normalizedSnapshot.kind,
              sourceType: normalizedSnapshot.sourceType,
              sourceEnvironmentId: normalizedSnapshot.sourceEnvironmentId,
              sourcePath: normalizedSnapshot.sourcePath,
              region: normalizedSnapshot.region,
              runtime: normalizedSnapshot.runtime,
              authMode: normalizedSnapshot.authMode,
              template: normalizedSnapshot.template,
              templateAgentId: normalizedSnapshot.templateAgentId,
              templateEnvironmentId: normalizedSnapshot.templateEnvironmentId,
              databaseMode: normalizedSnapshot.databaseMode,
              databaseId: normalizedSnapshot.databaseId,
              databaseName: normalizedSnapshot.databaseName,
              databaseDescription: normalizedSnapshot.databaseDescription,
              databaseLocation: normalizedSnapshot.databaseLocation,
              customDomain: normalizedSnapshot.customDomain,
              sourceFiles: normalizeEnvironmentVersionComparableList(
                normalizePlaygroundServerVersionSourceFiles(normalizedSnapshot.sourceFiles).map((file) => ({
                  path: file.path,
                  isFolder: file.isFolder === true,
                  size: file.size || 0,
                }))
              ),
              sourceFileContents: normalizePlaygroundServerVersionSourceFileContents(normalizedSnapshot.sourceFileContents),
            };
          }
  
          const serverVersionController = createPlaygroundVersionController({
            getMetadata: getServerMetadataRecord,
            readVersions: readPlaygroundServerVersions,
            normalizeVersions: normalizePlaygroundServerVersions,
            createVersion: (serverRecord, existingVersions = [], options = {}) => createPlaygroundServerVersion(serverRecord, existingVersions, {
              ...options,
              snapshot: buildDraftServerVersionSnapshot(serverRecord),
            }),
            withVersionList: createPlaygroundServerWithVersionList,
            fromVersionSnapshot: createPlaygroundServerFromVersionSnapshot,
            buildSnapshot: buildDraftServerVersionSnapshot,
            buildComparableSnapshot: buildServerVersionComparableSnapshot,
            getActiveVersionId: (metadata) => metadata.activeServerVersionId || metadata.active_server_version_id || "",
            getSelectedVersionId: (metadata, activeVersion) => (
              metadata.restoredFromServerVersionId
              || metadata.restored_from_server_version_id
              || activeVersion?.id
              || ""
            ),
            updateVersionFromResource: (version, serverRecord, options = {}) => {
              const now = new Date().toISOString();
              const normalizedVersion = normalizePlaygroundServerVersion(version || {});
              const snapshot = buildDraftServerVersionSnapshot(serverRecord);
              const nextStatus = String(options.status || "saved").trim().toLowerCase() === "active" ? "active" : "saved";
              const actor = normalizePlaygroundVersionActor(options.actor) || getServerVersionActor();
              const revisionId = createPlaygroundServerVersionRevisionId();
              const deploymentId = nextStatus === "active" ? (normalizedVersion.deploymentId || normalizedVersion.deployment_id || createPlaygroundServerDeploymentId(normalizedVersion.id)) : "";
              return normalizePlaygroundServerVersion({
                ...normalizedVersion,
                status: nextStatus,
                lifecycleState: nextStatus === "active" ? "published" : "saved",
                lifecycle_state: nextStatus === "active" ? "published" : "saved",
                revisionId,
                revision_id: revisionId,
                baseRevisionId: normalizedVersion.revisionId || normalizedVersion.revision_id || "",
                base_revision_id: normalizedVersion.revisionId || normalizedVersion.revision_id || "",
                revisionNumber: (Number(normalizedVersion.revisionNumber || normalizedVersion.revision_number || normalizedVersion.version || 0) || 0) + 1,
                revision_number: (Number(normalizedVersion.revisionNumber || normalizedVersion.revision_number || normalizedVersion.version || 0) || 0) + 1,
                updatedAt: now,
                updated_at: now,
                updatedBy: actor,
                updated_by: actor,
                publishedAt: nextStatus === "active" ? now : "",
                published_at: nextStatus === "active" ? now : "",
                publishedBy: nextStatus === "active" ? actor : null,
                published_by: nextStatus === "active" ? actor : null,
                deploymentId,
                deployment_id: deploymentId,
                deploymentStatus: nextStatus === "active" ? "published" : "",
                deployment_status: nextStatus === "active" ? "published" : "",
                name: snapshot.name,
                kind: snapshot.kind,
                runtime: snapshot.runtime,
                sourceFiles: snapshot.sourceFiles,
                sourceFileContents: snapshot.sourceFileContents,
                snapshot,
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            updateVersionMetadata: (version, details = {}) => {
              const normalizedVersion = normalizePlaygroundServerVersion(version || {});
              const actor = normalizePlaygroundVersionActor(details.actor) || getServerVersionActor();
              const now = String(details.updatedAt || new Date().toISOString()).trim();
              return normalizePlaygroundServerVersion({
                ...normalizedVersion,
                label: details.label,
                description: details.description,
                updatedAt: now,
                updated_at: now,
                updatedBy: actor,
                updated_by: actor,
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            publishVersion: (version, options = {}) => {
              const normalizedVersion = normalizePlaygroundServerVersion(version || {});
              const publishedAt = String(options.publishedAt || new Date().toISOString()).trim();
              const actor = normalizePlaygroundVersionActor(options.actor) || getServerVersionActor();
              const deploymentId = normalizedVersion.deploymentId || normalizedVersion.deployment_id || createPlaygroundServerDeploymentId(normalizedVersion.id);
              return normalizePlaygroundServerVersion({
                ...normalizedVersion,
                status: "active",
                lifecycleState: "published",
                lifecycle_state: "published",
                updatedAt: publishedAt,
                updated_at: publishedAt,
                updatedBy: actor,
                updated_by: actor,
                publishedAt,
                published_at: publishedAt,
                publishedBy: actor,
                published_by: actor,
                deploymentId,
                deployment_id: deploymentId,
                deploymentStatus: "published",
                deployment_status: "published",
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            supersedeVersion: (version, options = {}) => {
              const normalizedVersion = normalizePlaygroundServerVersion(version || {});
              const supersededAt = String(options.supersededAt || new Date().toISOString()).trim();
              return normalizePlaygroundServerVersion({
                ...normalizedVersion,
                status: "superseded",
                lifecycleState: "deprecated",
                lifecycle_state: "deprecated",
                updatedAt: supersededAt,
                updated_at: supersededAt,
                deploymentStatus: "superseded",
                deployment_status: "superseded",
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            unpublishVersion: (version, options = {}) => {
              const normalizedVersion = normalizePlaygroundServerVersion(version || {});
              const unpublishedAt = String(options.unpublishedAt || new Date().toISOString()).trim();
              const actor = normalizePlaygroundVersionActor(options.actor) || getServerVersionActor();
              return normalizePlaygroundServerVersion({
                ...normalizedVersion,
                status: "unpublished",
                lifecycleState: "unpublished",
                lifecycle_state: "unpublished",
                updatedAt: unpublishedAt,
                updated_at: unpublishedAt,
                updatedBy: actor,
                updated_by: actor,
                unpublishedAt,
                unpublished_at: unpublishedAt,
                unpublishedBy: actor,
                unpublished_by: actor,
                deploymentStatus: "unpublished",
                deployment_status: "unpublished",
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            applyUnpublishMetadata: (serverRecord, context = {}) => {
              const nextMetadata = getServerMetadataRecord(serverRecord);
              nextMetadata.unpublishedAt = context.unpublishedAt;
              nextMetadata.unpublished_at = context.unpublishedAt;
              delete nextMetadata.publishedAt;
              delete nextMetadata.published_at;
              delete nextMetadata.activeServerDeployment;
              delete nextMetadata.active_server_deployment;
              return {
                ...serverRecord,
                metadata: nextMetadata,
                publishedAt: "",
              };
            },
          });
  
          function getServerVersionMetadata(serverRecord = draftServer) {
            return serverVersionController.getMetadata(serverRecord);
          }
  
          function readDraftServerVersions(serverRecord = draftServer) {
            return serverVersionController.readVersions(serverRecord);
          }
  
          function getDraftServerActiveVersion(serverRecord = draftServer) {
            return serverVersionController.getActiveVersion(serverRecord);
          }
  
          function getDraftServerSelectedVersion(serverRecord = draftServer) {
            return serverVersionController.getSelectedVersion(serverRecord);
          }
  
          function getServerVersionActor() {
            return normalizePlaygroundVersionActor({
              id: currentUserId || currentUserEmail || "local-user",
              name: currentUserName || currentUserEmail || "User",
              email: currentUserEmail,
              avatarUrl: currentUserAvatarUrl,
            });
          }
  
          function getServerVersionActorLabel(actor) {
            const normalizedActor = normalizePlaygroundVersionActor(actor);
            if (!normalizedActor) {
              return "";
            }
            return String(normalizedActor.name || normalizedActor.email || normalizedActor.id || "").trim();
          }
  
          function getServerVersionLifecycleLabel(version) {
            const lifecycleState = String(version?.lifecycleState || version?.lifecycle_state || "").trim().toLowerCase();
            if (lifecycleState === "published" || String(version?.status || "").trim().toLowerCase() === "active") return "Published";
            if (lifecycleState === "deprecated" || String(version?.status || "").trim().toLowerCase() === "superseded") return "Superseded";
            if (lifecycleState === "unpublished" || String(version?.status || "").trim().toLowerCase() === "unpublished") return "Unpublished";
            if (lifecycleState === "archived") return "Archived";
            if (lifecycleState === "draft") return "Draft";
            return "Saved";
          }
  
          function rememberServerVersionBaseline(serverRecord = draftServer, options = {}) {
            const didUpdateBaseline = serverVersionController.rememberBaseline(serverRecord, serverVersionBaselineRef, options);
            if (didUpdateBaseline) {
              serverVersionDraftTouchedRef.current = false;
            }
          }
  
          function hasDraftServerVersionChanges() {
            return serverVersionController.hasDraftChanges(draftServer, serverVersionBaselineRef, {
              touched: serverVersionDraftTouchedRef.current,
            });
          }
  
          function canPublishDraftServerSelectedVersion() {
            const selectedVersion = getDraftServerSelectedVersion();
            if (!selectedVersion) return false;
            const hasChanges = hasDraftServerVersionChanges();
            return selectedVersion.status === "active" ? hasChanges : !hasChanges;
          }
  
          function canPublishServerVersion(version) {
            const normalizedVersionId = String(version?.id || "").trim();
            if (!normalizedVersionId) return false;
            const selectedVersion = getDraftServerSelectedVersion();
            const hasChanges = hasDraftServerVersionChanges();
            const isActiveVersion = String(version?.status || "").toLowerCase() === "active";
            if (isActiveVersion) {
              return Boolean(selectedVersion?.id === normalizedVersionId && hasChanges);
            }
            return !hasChanges;
          }
  
          function getServerVersionPrimaryActionKind() {
            return canPublishDraftServerSelectedVersion() ? "publish" : "save";
          }
  
          function getServerVersioningMetadata(serverRecord) {
            const metadata = getServerMetadataRecord(serverRecord);
            const versioning = metadata.runnerVersioning || metadata.runner_versioning || metadata.versioning || {};
            return versioning && typeof versioning === "object" && !Array.isArray(versioning) ? versioning : {};
          }
  
          function getServerVersioningRevisionId(serverRecord) {
            const versioning = getServerVersioningMetadata(serverRecord);
            return String(versioning.revisionId || versioning.revision_id || "").trim();
          }
  
          function getServerVersioningRevisionNumber(serverRecord) {
            const versioning = getServerVersioningMetadata(serverRecord);
            return Number(versioning.revisionNumber || versioning.revision_number || 0) || 0;
          }
  
          function buildServerVersioningMetadata(serverRecord, options = {}) {
            const now = new Date().toISOString();
            const metadata = getServerMetadataRecord(serverRecord);
            const currentVersioning = getServerVersioningMetadata(serverRecord);
            const actor = normalizePlaygroundVersionActor(options.actor) || getServerVersionActor();
            const operation = String(options.operation || "save-current").trim() || "save-current";
            const activeVersion = getDraftServerActiveVersion(serverRecord);
            const selectedVersion = getDraftServerSelectedVersion(serverRecord);
            const previousRevisionId = String(
              currentVersioning.revisionId
              || currentVersioning.revision_id
              || getServerVersioningRevisionId(draftServer)
              || getServerVersioningRevisionId(selectedServerSnapshot)
              || ""
            ).trim();
            const nextRevisionNumber = Math.max(
              getServerVersioningRevisionNumber(serverRecord),
              getServerVersioningRevisionNumber(draftServer),
              getServerVersioningRevisionNumber(selectedServerSnapshot)
            ) + 1;
            const nextRevisionId = createPlaygroundServerVersionRevisionId();
            const isPublishOperation = operation.includes("publish") || (operation === "initialize" && Boolean(activeVersion));
            const nextState = isPublishOperation
              ? "published"
              : operation.includes("unpublish")
                ? "unpublished"
                : "saved";
            const resourceType = canonicalizePlaygroundServerKind(serverRecord?.kind) === "function" ? "function" : "web_app";
            const nextVersioning = {
              ...currentVersioning,
              schemaVersion: 1,
              schema_version: 1,
              resourceType,
              resource_type: resourceType,
              revisionId: nextRevisionId,
              revision_id: nextRevisionId,
              baseRevisionId: previousRevisionId,
              base_revision_id: previousRevisionId,
              revisionNumber: nextRevisionNumber,
              revision_number: nextRevisionNumber,
              state: nextState,
              lastOperation: operation,
              last_operation: operation,
              activeVersionId: activeVersion?.id || "",
              active_version_id: activeVersion?.id || "",
              selectedVersionId: selectedVersion?.id || "",
              selected_version_id: selectedVersion?.id || "",
              updatedAt: now,
              updated_at: now,
              updatedBy: actor,
              updated_by: actor,
            };
            if (operation.includes("save")) {
              nextVersioning.lastSavedAt = now;
              nextVersioning.last_saved_at = now;
              nextVersioning.lastSavedBy = actor;
              nextVersioning.last_saved_by = actor;
            }
            if (isPublishOperation) {
              nextVersioning.lastPublishedAt = now;
              nextVersioning.last_published_at = now;
              nextVersioning.lastPublishedBy = actor;
              nextVersioning.last_published_by = actor;
            }
            if (operation.includes("unpublish")) {
              nextVersioning.lastUnpublishedAt = now;
              nextVersioning.last_unpublished_at = now;
              nextVersioning.lastUnpublishedBy = actor;
              nextVersioning.last_unpublished_by = actor;
            }
            const nextMetadata = {
              ...metadata,
              runnerVersioning: nextVersioning,
              runner_versioning: nextVersioning,
            };
            if (isPublishOperation && activeVersion) {
              const deploymentId = activeVersion.deploymentId || activeVersion.deployment_id || createPlaygroundServerDeploymentId(activeVersion.id);
              nextMetadata.activeServerDeployment = {
                id: deploymentId,
                versionId: activeVersion.id,
                version: activeVersion.version,
                status: "published",
                publishedAt: now,
                publishedBy: actor,
              };
              nextMetadata.active_server_deployment = nextMetadata.activeServerDeployment;
            }
            if (operation.includes("unpublish")) {
              delete nextMetadata.activeServerDeployment;
              delete nextMetadata.active_server_deployment;
            }
            return nextMetadata;
          }
  
          function prepareServerVersionedRecordForCommit(serverRecord, options = {}) {
            const normalizedServer = normalizePlaygroundServerRecord(serverRecord);
            const nextMetadata = buildServerVersioningMetadata(normalizedServer, options);
            return normalizePlaygroundServerRecord({
              ...normalizedServer,
              metadata: nextMetadata,
            });
          }
  
          async function commitVersionedServerRecord(nextServer, options = {}) {
            const normalizedNextServer = normalizePlaygroundServerRecord(nextServer);
            const loadingMessage = options.loadingMessage || "Saving server version...";
            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
              serverAutosaveTimerRef.current = null;
            }
            serverAutosaveQueuedRef.current = null;
            serverEditorDirtyRef.current = false;
            setServerVersionState({
              status: "loading",
              message: loadingMessage,
              error: "",
            });
            setServerSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              const versionedNextServer = prepareServerVersionedRecordForCommit(normalizedNextServer, {
                ...options,
                actor: options.actor || getServerVersionActor(),
              });
              const savedServer = await persistServerRecord(versionedNextServer);
              const savedHasVersionMetadata = readPlaygroundServerVersions(savedServer).length > 0
                || Boolean(savedServer?.metadata?.activeServerVersionId || savedServer?.metadata?.active_server_version_id);
              const mergedSavedServer = normalizePlaygroundServerRecord({
                ...versionedNextServer,
                ...savedServer,
                metadata: savedHasVersionMetadata ? savedServer.metadata : versionedNextServer.metadata,
                publishedAt: savedServer?.publishedAt || versionedNextServer.publishedAt || "",
              });
              upsertLocalServerRecord(mergedSavedServer);
              setSelectedServerId(mergedSavedServer.id);
              setDraftServer(mergedSavedServer);
              rememberServerVersionBaseline(mergedSavedServer, { force: true });
              setOpenServerVersionMenuId("");
              setServerSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
              setServerVersionState({
                status: "success",
                message: options.successMessage || "Saved",
                error: "",
              });
              window.setTimeout(() => {
                setServerVersionState((current) => current.status === "success"
                  ? { status: "idle", message: "", error: "" }
                  : current
                );
              }, 1800);
              return mergedSavedServer;
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : (options.errorMessage || "Failed to save server version.");
              setServerSaveState({
                isSaving: false,
                error: errorMessage,
                message: "",
              });
              setServerVersionState({
                status: "error",
                message: "",
                error: errorMessage,
              });
              return null;
            }
          }
  
          function getServerVersionPopupActions(options = {}) {
            const includeVersionHistory = options.includeVersionHistory !== false;
            const serverVersionPrimaryActionKind = getServerVersionPrimaryActionKind();
            const serverVersionHasChanges = hasDraftServerVersionChanges();
            const serverVersionCanPublish = canPublishDraftServerSelectedVersion();
            const actions = [
              serverVersionPrimaryActionKind === "publish"
                ? {
                    id: "publish",
                    label: "Publish",
                    Icon: Rocket,
                    shortcut: "⌘P",
                    disabled: !serverVersionCanPublish,
                    onClick: publishCurrentServerVersion,
                  }
                : {
                    id: "save",
                    label: "Save",
                    Icon: Save,
                    shortcut: "⌘S",
                    disabled: !serverVersionHasChanges,
                    onClick: saveCurrentServerVersion,
                  },
              {
                id: "save-new-version",
                label: "Save to new Version",
                Icon: GitBranchPlus,
                shortcut: "⇧⌘S",
                disabled: !serverVersionHasChanges,
                onClick: () => openCreateServerVersionModal(),
              },
              {
                id: "revert",
                label: "Revert to last saved Version",
                Icon: Undo2,
                disabled: !serverVersionHasChanges,
                onClick: handleRevertServerDraft,
              },
            ];
            if (includeVersionHistory) {
              actions.push({
                id: "version-history",
                label: "Version history",
                Icon: History,
                disabled: false,
                onClick: () => {
                  setServerPublishMenuOpen(false);
                  setServerVersionsHeaderMenuOpen(false);
                  openServerVersionChangesPage();
                },
              });
            }
            return actions;
          }
  
          function toggleServerVersionsSidebar() {
            if (!draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            setServerActionsPopoverOpen(false);
            setServerPublishMenuOpen(false);
            setServerVersionsHeaderMenuOpen(false);
            setOpenServerVersionMenuId("");
            setServerVersionState((current) => current.status === "loading" ? current : {
              status: "idle",
              message: "",
              error: "",
            });
            setServerVersionsSidebarOpen((current) => !current);
          }
  
          function closeServerVersionsSidebar() {
            setServerVersionsSidebarOpen(false);
            setServerPublishMenuOpen(false);
            setServerVersionsHeaderMenuOpen(false);
            finishCloseServerVersionModal();
            setServerVersionChangesState(null);
            setOpenServerVersionMenuId("");
          }
  
          async function saveCurrentServerVersion() {
            if (!draftServer || serverVersionState.status === "loading") {
              return;
            }
            if (!hasDraftServerVersionChanges()) {
              return;
            }
            const actor = getServerVersionActor();
            const result = serverVersionController.buildSaveCurrentResource(draftServer, { status: "saved", actor });
            if (!result?.resource) {
              return;
            }
            await commitVersionedServerRecord(result.resource, {
              operation: "save-current",
              actor,
              loadingMessage: "Saving current version...",
              successMessage: "Current version saved",
              errorMessage: "Failed to save current version.",
            });
          }
  
          function cancelServerVersionModalAnimation() {
            if (serverVersionModalCloseTimerRef.current) {
              window.clearTimeout(serverVersionModalCloseTimerRef.current);
              serverVersionModalCloseTimerRef.current = null;
            }
            if (serverVersionModalFrameRef.current) {
              window.cancelAnimationFrame(serverVersionModalFrameRef.current);
              serverVersionModalFrameRef.current = null;
            }
          }
  
          function finishCloseServerVersionModal() {
            cancelServerVersionModalAnimation();
            setServerVersionModal(null);
            setServerVersionModalVisible(false);
            setServerVersionModalClosing(false);
            setServerVersionNameDraft("");
            setServerVersionDescriptionDraft("");
            setIsServerVersionDescriptionEditing(false);
          }
  
          function openServerVersionModal(nextModal, draft = {}) {
            if (!draftServer || serverVersionState.status === "loading" || serverSaveState.isSaving) {
              return;
            }
            cancelServerVersionModalAnimation();
            setServerPublishMenuOpen(false);
            setServerVersionsHeaderMenuOpen(false);
            setOpenServerVersionMenuId("");
            setServerVersionState((current) => current.status === "loading" ? current : {
              status: "idle",
              message: "",
              error: "",
            });
            setServerVersionNameDraft(String(draft.name || "").trim());
            setServerVersionDescriptionDraft(String(draft.description || ""));
            setIsServerVersionDescriptionEditing(false);
            setServerVersionModal(nextModal);
            setServerVersionModalClosing(false);
            setServerVersionModalVisible(false);
            serverVersionModalFrameRef.current = window.requestAnimationFrame(() => {
              serverVersionModalFrameRef.current = window.requestAnimationFrame(() => {
                serverVersionModalFrameRef.current = null;
                setServerVersionModalVisible(true);
              });
            });
          }
  
          function openCreateServerVersionModal(options = {}) {
            if (!draftServer || serverVersionState.status === "loading" || serverSaveState.isSaving) {
              return;
            }
            const forceNewVersion = Boolean(options.force);
            if (!forceNewVersion && !hasDraftServerVersionChanges()) {
              return;
            }
            const versions = readDraftServerVersions();
            const nextVersion = versions.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), 0) + 1;
            openServerVersionModal(
              { mode: "create", force: forceNewVersion },
              {
                name: "Version " + nextVersion,
                description: "",
              }
            );
          }
  
          function openEditServerVersionModal(versionId) {
            if (!draftServer || serverVersionState.status === "loading" || serverSaveState.isSaving) {
              return;
            }
            const normalizedVersionId = String(versionId || "").trim();
            const versions = readDraftServerVersions();
            const targetVersion = versions.find((version) => version.id === normalizedVersionId);
            if (!targetVersion) {
              return;
            }
            openServerVersionModal(
              { mode: "edit", versionId: targetVersion.id },
              {
                name: String(targetVersion.label || ("Version " + targetVersion.version)).trim(),
                description: String(targetVersion.description || ""),
              }
            );
          }
  
          function closeServerVersionModal(options = {}) {
            if (serverSaveState.isSaving || serverVersionState.status === "loading") {
              return;
            }
            if (options.animate === false) {
              finishCloseServerVersionModal();
              return;
            }
            if (!serverVersionModal || serverVersionModalClosing) {
              return;
            }
            cancelServerVersionModalAnimation();
            setServerVersionModalVisible(false);
            setServerVersionModalClosing(true);
            serverVersionModalCloseTimerRef.current = window.setTimeout(() => {
              serverVersionModalCloseTimerRef.current = null;
              finishCloseServerVersionModal();
            }, typeof PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS === "number" ? PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS : 75);
          }
  
          async function saveServerToNewVersion(options = {}) {
            if (!draftServer || serverVersionState.status === "loading") {
              return null;
            }
            const forceNewVersion = Boolean(options.force);
            if (!forceNewVersion && !hasDraftServerVersionChanges()) {
              return null;
            }
            const actor = getServerVersionActor();
            const result = serverVersionController.buildNewVersionResource(draftServer, {
              label: options.label,
              description: options.description,
              actor,
            });
            if (!result?.resource) {
              return null;
            }
            return await commitVersionedServerRecord(result.resource, {
              operation: "save-new-version",
              actor,
              loadingMessage: "Saving new version...",
              successMessage: "New version saved",
              errorMessage: "Failed to save new version.",
            });
          }
  
          async function updateServerVersionDetails(versionId, versionDetails = {}) {
            if (!draftServer || serverVersionState.status === "loading") {
              return null;
            }
            const actor = getServerVersionActor();
            const result = serverVersionController.buildVersionMetadataResource(draftServer, versionId, {
              ...versionDetails,
              actor,
            });
            if (!result?.resource) {
              return null;
            }
            return await commitVersionedServerRecord(result.resource, {
              operation: "edit-version",
              actor,
              loadingMessage: "Saving version details...",
              successMessage: "Version details saved",
              errorMessage: "Failed to save version details.",
            });
          }
  
          async function commitServerVersionModal() {
            if (!serverVersionModal || serverSaveState.isSaving || serverVersionState.status === "loading") {
              return;
            }
            const label = String(serverVersionNameDraft || "").trim() || "Version";
            const description = String(serverVersionDescriptionDraft || "").trim();
            const savedServer = serverVersionModal.mode === "edit"
              ? await updateServerVersionDetails(serverVersionModal.versionId, { label, description })
              : await saveServerToNewVersion({
                  force: Boolean(serverVersionModal.force),
                  label,
                  description,
                });
            if (savedServer) {
              closeServerVersionModal();
            }
          }
  
          async function publishCurrentServerVersion() {
            if (!draftServer || serverVersionState.status === "loading") {
              return;
            }
            const selectedVersion = getDraftServerSelectedVersion();
            const hasChanges = hasDraftServerVersionChanges();
            if (hasChanges && selectedVersion?.status !== "active") {
              setServerVersionState({
                status: "error",
                message: "",
                error: "Save the current version before publishing.",
              });
              return;
            }
            if (!canPublishDraftServerSelectedVersion()) {
              return;
            }
            const actor = getServerVersionActor();
            const result = serverVersionController.buildPublishSelectedResource(draftServer, {
              actor,
              updateFromResource: hasChanges,
            });
            if (!result?.resource) {
              return;
            }
            const savedServer = await commitVersionedServerRecord(result.resource, {
              operation: "publish",
              actor,
              loadingMessage: "Publishing current version...",
              successMessage: "Published",
              errorMessage: "Failed to publish current version.",
            });
            if (savedServer) {
              await deployServerRecord(savedServer, { preserveVersionMetadata: true });
            }
          }
  
          async function restoreServerVersion(versionId) {
            if (!draftServer || serverVersionState.status === "loading") {
              return;
            }
            const result = serverVersionController.buildRestoreVersionResource(draftServer, versionId);
            if (!result?.resource) {
              return;
            }
            await commitVersionedServerRecord(result.resource, {
              operation: "restore",
              actor: getServerVersionActor(),
              loadingMessage: "Restoring server version...",
              successMessage: "Version restored",
              errorMessage: "Failed to restore server version.",
            });
          }
  
          async function publishServerVersion(versionId) {
            if (!draftServer || serverVersionState.status === "loading") {
              return;
            }
            const targetVersion = readDraftServerVersions().find((version) => version.id === String(versionId || "").trim());
            const selectedVersion = getDraftServerSelectedVersion();
            const hasChanges = hasDraftServerVersionChanges();
            const shouldRepublishCurrentEditor = Boolean(
              targetVersion
              && targetVersion.status === "active"
              && selectedVersion?.id === targetVersion.id
              && hasChanges
            );
            if (hasChanges && !shouldRepublishCurrentEditor) {
              setServerVersionState({
                status: "error",
                message: "",
                error: "Save the current version before publishing.",
              });
              return;
            }
            if (!canPublishServerVersion(targetVersion)) {
              return;
            }
            const actor = getServerVersionActor();
            const result = serverVersionController.buildPublishVersionResource(draftServer, versionId, {
              actor,
              updateFromResource: shouldRepublishCurrentEditor,
            });
            if (!result?.resource) {
              return;
            }
            const savedServer = await commitVersionedServerRecord(result.resource, {
              operation: "publish-version",
              actor,
              loadingMessage: "Publishing server version...",
              successMessage: "Published",
              errorMessage: "Failed to publish server version.",
            });
            if (savedServer) {
              await deployServerRecord(savedServer, { preserveVersionMetadata: true });
            }
          }
  
          async function deleteServerVersion(versionId) {
            if (!draftServer || serverVersionState.status === "loading") {
              return;
            }
            if (readDraftServerVersions().length <= 1) {
              return;
            }
            const result = serverVersionController.buildDeleteVersionResource(draftServer, versionId);
            if (!result?.resource) {
              return;
            }
            if (!window.confirm("Delete this server version?")) {
              return;
            }
            await commitVersionedServerRecord(result.resource, {
              operation: "delete-version",
              actor: getServerVersionActor(),
              loadingMessage: "Deleting server version...",
              successMessage: "Version deleted",
              errorMessage: "Failed to delete server version.",
            });
          }
  
          async function handleRevertServerDraft() {
            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
              serverAutosaveTimerRef.current = null;
            }
            serverAutosaveQueuedRef.current = null;
            const selectedVersion = getDraftServerSelectedVersion();
            if (selectedVersion) {
              const result = serverVersionController.buildRestoreVersionResource(draftServer, selectedVersion.id);
              if (!result?.resource) {
                return;
              }
              await commitVersionedServerRecord(result.resource, {
                operation: "revert",
                actor: getServerVersionActor(),
                loadingMessage: "Reverting server...",
                successMessage: "Reverted",
                errorMessage: "Failed to revert server.",
              });
              return;
            }
            const nextDraft = selectedServerSnapshot ? normalizePlaygroundServerRecord(selectedServerSnapshot) : null;
            setDraftServer(nextDraft);
            serverEditorDirtyRef.current = false;
            rememberServerVersionBaseline(nextDraft, { force: true });
          }
  
          function buildServerVersionConfigDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundServerVersion({ snapshot }).snapshot;
            return {
              name: normalizedSnapshot.name,
              description: normalizedSnapshot.description,
              kind: normalizedSnapshot.kind,
              sourceType: normalizedSnapshot.sourceType,
              sourceEnvironmentId: normalizedSnapshot.sourceEnvironmentId,
              sourcePath: normalizedSnapshot.sourcePath,
              region: normalizedSnapshot.region,
              runtime: normalizedSnapshot.runtime,
              authMode: normalizedSnapshot.authMode,
              template: normalizedSnapshot.template,
              templateAgentId: normalizedSnapshot.templateAgentId,
              templateEnvironmentId: normalizedSnapshot.templateEnvironmentId,
              databaseMode: normalizedSnapshot.databaseMode,
              databaseId: normalizedSnapshot.databaseId,
              databaseName: normalizedSnapshot.databaseName,
              databaseDescription: normalizedSnapshot.databaseDescription,
              databaseLocation: normalizedSnapshot.databaseLocation,
              customDomain: normalizedSnapshot.customDomain,
            };
          }
  
          function buildServerVersionSourceManifestDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundServerVersion({ snapshot }).snapshot;
            return normalizeEnvironmentVersionComparableList(
              normalizePlaygroundServerVersionSourceFiles(normalizedSnapshot.sourceFiles).map((file) => ({
                path: file.path,
                isFolder: file.isFolder === true,
                size: file.size || 0,
                modifiedTime: file.modifiedTime || "",
              }))
            );
          }
  
          function buildServerVersionDiffFilesFromSnapshots(baseSnapshot, targetSnapshot) {
            if (!baseSnapshot || !targetSnapshot) {
              return [];
            }
            const normalizedBaseSnapshot = normalizePlaygroundServerVersion({ snapshot: baseSnapshot }).snapshot;
            const normalizedTargetSnapshot = normalizePlaygroundServerVersion({ snapshot: targetSnapshot }).snapshot;
            const baseContents = normalizePlaygroundServerVersionSourceFileContents(normalizedBaseSnapshot.sourceFileContents);
            const targetContents = normalizePlaygroundServerVersionSourceFileContents(normalizedTargetSnapshot.sourceFileContents);
            const contentPaths = Array.from(new Set(Object.keys(baseContents).concat(Object.keys(targetContents)))).sort((left, right) => left.localeCompare(right));
            const files = [
              createPlaygroundVersionDiffFile({
                id: "config",
                path: "server/config.json",
                before: buildServerVersionConfigDiffPayload(normalizedBaseSnapshot),
                after: buildServerVersionConfigDiffPayload(normalizedTargetSnapshot),
              }),
              createPlaygroundVersionDiffFile({
                id: "source-files",
                path: "server/source-files.json",
                before: buildServerVersionSourceManifestDiffPayload(normalizedBaseSnapshot),
                after: buildServerVersionSourceManifestDiffPayload(normalizedTargetSnapshot),
              }),
            ];
            contentPaths.forEach((path) => {
              files.push(createPlaygroundVersionDiffFile({
                id: "source:" + path,
                path: "server/source/" + path,
                before: baseContents[path] || "",
                after: targetContents[path] || "",
              }));
            });
            return files.filter(Boolean);
          }
  
          const SERVER_VERSION_COMPARE_CURRENT_EDITOR_ID = "current-editor";
  
          function getServerVersionCompareVersionSourceId(versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            return normalizedVersionId ? "version:" + normalizedVersionId : "";
          }
  
          function getServerVersionCompareVersionLabel(version) {
            if (!version) {
              return "Version";
            }
            return String(version.label || ("Version " + version.version)).trim() || "Version";
          }
  
          function buildServerVersionCompareSources(versions) {
            const normalizedVersions = Array.isArray(versions) ? versions : [];
            return [
              {
                id: SERVER_VERSION_COMPARE_CURRENT_EDITOR_ID,
                label: "Current editor",
                snapshot: buildDraftServerVersionSnapshot(draftServer),
              },
            ].concat(normalizedVersions.map((version) => ({
              id: getServerVersionCompareVersionSourceId(version.id),
              label: getServerVersionCompareVersionLabel(version),
              snapshot: normalizePlaygroundServerVersion(version).snapshot,
            })));
          }
  
          function resolveServerVersionCompareSource(sourceId, sources, fallbackSource) {
            const normalizedSourceId = String(sourceId || "").trim();
            return sources.find((source) => source.id === normalizedSourceId) || fallbackSource || sources[0] || null;
          }
  
          function getDefaultServerVersionCompareLeftSourceId(versions) {
            const metadata = getServerVersionMetadata();
            const activeVersionId = String(metadata.activeServerVersionId || metadata.active_server_version_id || "").trim();
            const activeVersion = versions.find((version) => version.id === activeVersionId)
              || versions.find((version) => String(version.status || "").toLowerCase() === "active")
              || versions[0];
            return activeVersion ? getServerVersionCompareVersionSourceId(activeVersion.id) : SERVER_VERSION_COMPARE_CURRENT_EDITOR_ID;
          }
  
          function openServerVersionChangesPage(versionId, options = {}) {
            const normalizedVersionId = String(versionId || "").trim();
            const versions = readDraftServerVersions();
            if (!versions.length && !draftServer) {
              return;
            }
            const explicitLeftSourceId = String(options.leftSourceId || "").trim();
            const explicitRightSourceId = String(options.rightSourceId || "").trim();
            const fallbackLeftSourceId = normalizedVersionId
              ? getServerVersionCompareVersionSourceId(normalizedVersionId)
              : getDefaultServerVersionCompareLeftSourceId(versions);
            const leftSourceId = explicitLeftSourceId || fallbackLeftSourceId;
            const rightSourceId = explicitRightSourceId || SERVER_VERSION_COMPARE_CURRENT_EDITOR_ID;
            setOpenServerVersionMenuId("");
            setServerVersionsSidebarOpen(true);
            setServerVersionChangesState({
              leftSourceId,
              rightSourceId,
            });
          }
  
          function closeServerVersionChangesPage() {
            setServerVersionChangesState(null);
          }
  
          function handleServerVersionCompareSourceChange(side, sourceId) {
            const normalizedSourceId = String(sourceId || "").trim() || SERVER_VERSION_COMPARE_CURRENT_EDITOR_ID;
            setServerVersionChangesState((current) => ({
              ...(current || {}),
              [side === "left" ? "leftSourceId" : "rightSourceId"]: normalizedSourceId,
            }));
          }
  
          function applyServerVersionDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            setServerVersionDescriptionDraft(nextValue);
            window.requestAnimationFrame(() => {
              const textarea = serverVersionDescriptionTextareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeEnvironmentDescriptionTextarea(textarea);
            });
          }
  
          function handleServerVersionDescriptionFormat(formatType) {
            const textarea = serverVersionDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const value = String(serverVersionDescriptionDraft || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
            if (formatType === "bold") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildEnvironmentDescriptionListEdit(value, selectionStart, selectionEnd);
            }
            if (!edit) {
              return;
            }
            applyServerVersionDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function updateEnvironmentField(field, value) {
            updateDraftEnvironment((current) => {
              if (!current) {
                return current;
              }
              if (field === "computeProfile") {
                return applyPlaygroundEnvironmentComputeProfileDraft(current, value, {
                  officeAppsEnabled: current.officeAppsEnabled === true,
                });
              }
              if (field === "officeAppsEnabled") {
                return setPlaygroundEnvironmentOfficeAppsEnabled(current, value === true);
              }
              if (field === "guiEnabled") {
                return value === true
                  ? applyPlaygroundEnvironmentComputeProfileDraft(current, "desktop", {
                      officeAppsEnabled: current.officeAppsEnabled === true,
                    })
                  : applyPlaygroundEnvironmentComputeProfileDraft(
                      current,
                      current.isDefault ? PLAYGROUND_DEFAULT_USER_ENVIRONMENT_COMPUTE_PROFILE : PLAYGROUND_DEFAULT_CUSTOM_ENVIRONMENT_COMPUTE_PROFILE,
                      { officeAppsEnabled: false }
                    );
              }
              return {
                ...current,
                [field]: value,
              };
            });
          }
  
          function closeEnvironmentRenameDialog() {
            setEnvironmentRenameState(null);
            setEnvironmentRenameValue("");
            setEnvironmentRenameError("");
          }
  
          function updateEnvironmentComposerField(field, value) {
            setEnvironmentComposerDraft((current) => {
              const base = current || buildPlaygroundDefaultEnvironmentDraft();
              if (field === "computeProfile") {
                return applyPlaygroundEnvironmentComputeProfileDraft(base, value, {
                  officeAppsEnabled: base.officeAppsEnabled === true,
                });
              }
              if (field === "officeAppsEnabled") {
                return setPlaygroundEnvironmentOfficeAppsEnabled(base, value === true);
              }
              if (field === "guiEnabled") {
                return value === true
                  ? applyPlaygroundEnvironmentComputeProfileDraft(base, "desktop", {
                      officeAppsEnabled: base.officeAppsEnabled === true,
                    })
                  : applyPlaygroundEnvironmentComputeProfileDraft(
                      base,
                      base.isDefault ? PLAYGROUND_DEFAULT_USER_ENVIRONMENT_COMPUTE_PROFILE : PLAYGROUND_DEFAULT_CUSTOM_ENVIRONMENT_COMPUTE_PROFILE,
                      { officeAppsEnabled: false }
                    );
              }
              return {
                ...base,
                [field]: value,
              };
            });
            setEnvironmentComposerSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          function formatPlaygroundEnvironmentProfileRate(profile) {
            const rate = Number(profile?.minutePrice || 0);
            if (!Number.isFinite(rate) || rate <= 0) {
              return "$0.00 / min";
            }
            return "$" + rate.toFixed(rate < 0.01 ? 4 : 3) + " / min";
          }
  
          function formatPlaygroundEnvironmentProfileResources(profile) {
            const cpuLabel = Number(profile?.cpuCores || 0) % 1 === 0
              ? String(Number(profile?.cpuCores || 0))
              : Number(profile?.cpuCores || 0).toFixed(1).replace(/\.0$/, "");
            const memoryGb = Number(profile?.memoryMb || 0) / 1024;
            const memoryLabel = Math.abs(memoryGb - Math.round(memoryGb)) < 0.001
              ? String(Math.round(memoryGb))
              : memoryGb.toFixed(1).replace(/\.0$/, "");
            return cpuLabel + " vCPU · " + memoryLabel + " GB RAM";
          }
  
          function formatPlaygroundEnvironmentProfileMemory(profile) {
            const memoryGb = Number(profile?.memoryMb || 0) / 1024;
            if (!Number.isFinite(memoryGb) || memoryGb <= 0) {
              return "Not set";
            }
            const memoryLabel = Math.abs(memoryGb - Math.round(memoryGb)) < 0.001
              ? String(Math.round(memoryGb))
              : memoryGb.toFixed(1).replace(/\.0$/, "");
            return memoryLabel + " GB";
          }
  
          function formatPlaygroundEnvironmentProfileHourlyPrice(profile) {
            return "$" + (Number(profile?.minutePrice || 0) * 60).toFixed(2) + " / hr";
          }
  
          function renderEnvironmentComputeProfileSelector(selectedProfileId, onSelect, options = {}) {
            const disabled = options?.disabled === true;
            const compact = options?.compact === true;
            const normalizedSelectedProfileId = normalizePlaygroundEnvironmentComputeProfileId(selectedProfileId)
              || PLAYGROUND_DEFAULT_CUSTOM_ENVIRONMENT_COMPUTE_PROFILE;
            return React.createElement("div", {
                className: "playground-environment-profile-selector" + (compact ? " is-compact" : ""),
              },
              PLAYGROUND_ENVIRONMENT_COMPUTE_PROFILES.map((profile) => {
                const isSelected = profile.id === normalizedSelectedProfileId;
                return React.createElement("button", {
                    key: profile.id,
                    type: "button",
                    className: "playground-environment-profile-card" + (isSelected ? " is-selected" : ""),
                    onClick: () => onSelect(profile.id),
                    disabled,
                  },
                  React.createElement("div", { className: "playground-environment-profile-card-top" },
                    React.createElement("span", { className: "playground-environment-profile-card-label" }, profile.label),
                    React.createElement("span", { className: "playground-environment-profile-card-rate" }, formatPlaygroundEnvironmentProfileRate(profile))
                  ),
                  React.createElement("div", { className: "playground-environment-profile-card-meta" }, formatPlaygroundEnvironmentProfileResources(profile)),
                  compact
                    ? null
                    : React.createElement("div", { className: "playground-environment-profile-card-copy" }, profile.description)
                );
              })
            );
          }
  
          function updateEnvironmentComposerRuntime(key, value) {
            setEnvironmentComposerDraft((current) => {
              const base = current || buildPlaygroundDefaultEnvironmentDraft();
              const nextRuntimes = {
                ...(base.runtimes || {}),
              };
              const nextPackageVersions = {
                ...(base.packageVersions || {}),
              };
              const normalizedValue = String(value || "").trim();
              if (!normalizedValue) {
                delete nextRuntimes[key];
                delete nextPackageVersions[key];
              } else {
                nextRuntimes[key] = normalizedValue;
                nextPackageVersions[key] = normalizedValue;
              }
              return {
                ...base,
                runtimes: nextRuntimes,
                packageVersions: nextPackageVersions,
              };
            });
            setEnvironmentComposerSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          async function handleEnvironmentComposerSubmit(event) {
            event.preventDefault();
            const nextDraft = normalizePlaygroundEnvironmentRecord(environmentComposerDraft || buildPlaygroundDefaultEnvironmentDraft());
            const nextName = String(nextDraft.name || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setEnvironmentComposerSaveState({
                isSaving: false,
                error: "Environment name is required.",
              });
              return;
            }
  
            setEnvironmentComposerSaveState({
              isSaving: true,
              error: "",
            });
  
            try {
              const savedEnvironment = await persistEnvironmentRecord({
                ...nextDraft,
                name: nextName,
              });
  
              resetEditorAuxiliaryState();
              setEnvironmentDetailsCollapsed(false);
              setEnvironmentDetailTab("general");
              setEnvironmentDetailsById((current) => ({
                ...current,
                [savedEnvironment.id]: savedEnvironment,
              }));
              setSelectedEnvironmentId(savedEnvironment.id);
              setDraftEnvironment(savedEnvironment);
              if (!creationOnly) {
                setIsHomeViewActive(false);
              }
              setEnvironmentComposerOpen(false);
              setEnvironmentComposerDraft(buildPlaygroundDefaultEnvironmentDraft());
              setEnvironmentComposerSaveState({
                isSaving: false,
                error: "",
              });
  
              if (creationOnly && typeof onCreationRequestClose === "function") {
                onCreationRequestClose({
                  reason: "created",
                  resourceId: String(savedEnvironment.id || "").trim(),
                });
              }
              if (onEnvironmentMutated) {
                try {
                  await onEnvironmentMutated();
                } catch (refreshError) {
                  console.warn("Computer created, but the computer list could not be refreshed.", refreshError);
                }
              }
            } catch (error) {
              setEnvironmentComposerSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to create environment.",
              });
            }
          }
  
          function openEnvironmentRenameDialog(environment) {
            if (!environment?.id || environment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
            setEnvironmentActionsPopoverOpen(false);
            setEnvironmentRenameState({
              environmentId: environment.id,
              originalName: String(environment.name || "").trim(),
            });
            setEnvironmentRenameValue(String(environment.name || ""));
            setEnvironmentRenameError("");
          }
  
          async function handleEnvironmentRenameSubmit(event) {
            event.preventDefault();
            if (!environmentRenameState?.environmentId) {
              return;
            }
  
            const nextName = String(environmentRenameValue || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setEnvironmentRenameError("Environment name cannot be empty.");
              return;
            }
  
            if (nextName === environmentRenameState.originalName) {
              closeEnvironmentRenameDialog();
              return;
            }
  
            if (environmentAutosaveTimerRef.current) {
              window.clearTimeout(environmentAutosaveTimerRef.current);
              environmentAutosaveTimerRef.current = null;
            }
            environmentAutosaveQueuedRef.current = null;
            editorDirtyRef.current = false;
  
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
            setEnvironmentRenameError("");
  
            try {
              const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(environmentRenameState.environmentId), {
                method: "PATCH",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: nextName }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to rename environment.");
              }
              const targetEnvironment = environmentDetailsById[environmentRenameState.environmentId]
                || orderedEnvironments.find((environment) => environment.id === environmentRenameState.environmentId)
                || draftEnvironment
                || {};
              const responseEnvironment = data?.environment || data?.data || data;
              const savedEnvironment = normalizePlaygroundEnvironmentRecord({
                ...targetEnvironment,
                ...(responseEnvironment && typeof responseEnvironment === "object" && !Array.isArray(responseEnvironment) ? responseEnvironment : {}),
                id: environmentRenameState.environmentId,
                name: String(responseEnvironment?.name || nextName),
                updatedAt: responseEnvironment?.updatedAt || new Date().toISOString(),
              });
              setEnvironmentDetailsById((current) => ({
                ...current,
                [savedEnvironment.id]: savedEnvironment,
              }));
              if (selectedEnvironmentId === savedEnvironment.id) {
                setDraftEnvironment(savedEnvironment);
              }
              setModifiedSecrets({});
              setModifiedMcpTokens({});
              setSaveState({
                isSaving: false,
                error: "",
                message: "Saved",
              });
              closeEnvironmentRenameDialog();
              if (onEnvironmentMutated) {
                await onEnvironmentMutated();
              }
            } catch (error) {
              setEnvironmentRenameError(error instanceof Error ? error.message : "Failed to rename environment.");
              setSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
            }
          }
  
          function renderEnvironmentRenameModal() {
            if (!environmentRenameState) {
              return null;
            }
  
            return React.createElement(PlatformModalBackdrop, {
                className: "sidebar-thread-rename-scrim",
                onClick: () => {
                  if (!saveState.isSaving) {
                    closeEnvironmentRenameDialog();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "sidebar-thread-rename-modal",
                  onClick: (event) => event.stopPropagation(),
                  onSubmit: (event) => {
                    void handleEnvironmentRenameSubmit(event);
                  },
                },
                  React.createElement("div", { className: "sidebar-thread-rename-title" }, "Rename Environment"),
                  React.createElement("div", { className: "sidebar-thread-rename-copy" }, "Choose a new name for this environment."),
                  React.createElement("input", {
                    ref: environmentRenameInputRef,
                    className: "sidebar-thread-rename-input",
                    value: environmentRenameValue,
                    onChange: (event) => setEnvironmentRenameValue(event.target.value),
                    placeholder: "Environment name",
                    disabled: saveState.isSaving,
                  }),
                  environmentRenameError
                    ? React.createElement("div", { className: "sidebar-thread-rename-error" }, environmentRenameError)
                    : null,
                  React.createElement("div", { className: "sidebar-thread-rename-actions" },
                    React.createElement(PlatformSecondaryButton, {
                      size: "large",
                      type: "button",
                      className: "sidebar-thread-rename-button is-secondary",
                      onClick: closeEnvironmentRenameDialog,
                      disabled: saveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "submit",
                      className: "sidebar-thread-rename-button is-primary",
                      disabled: saveState.isSaving,
                    }, saveState.isSaving ? "Saving..." : "Save")
                  )
                )
              );
          }
  
          function renderEnvironmentListActionMenu() {
            if (!environmentListActionMenuState || !environmentListActionTarget) {
              return null;
            }
  
            const isProtected = Boolean(environmentListActionTarget.isSystem || environmentListActionTarget.isDefault);
            const isDeleting = saveState.isSaving && environmentListActionTarget.id === selectedEnvironmentId;
            const isCopying = fileEnvironmentMutationState.action === "fork" && fileEnvironmentMutationState.environmentId === environmentListActionTarget.id;
            const isSharing = environmentShareTeamState.action === "share";
            const menuStyle = {
              position: "fixed",
              top: environmentListActionMenuState.top + "px",
            };
            if (Number.isFinite(environmentListActionMenuState.right)) {
              menuStyle.right = environmentListActionMenuState.right + "px";
              menuStyle.left = "auto";
            } else {
              menuStyle.left = environmentListActionMenuState.left + "px";
              menuStyle.right = "auto";
            }
  
            const menuElement = React.createElement(PlatformPopupDismissLayer, {
                className: "sidebar-thread-popup-scrim",
                style: { zIndex: 360 },
                onClick: closeEnvironmentListActionMenu,
              },
                React.createElement("div", {
                  className: "playground-platform-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal playground-agents-list-action-menu-shell is-open",
                  style: menuStyle,
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement(PlatformPopupSurface, {
                    className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu" + (environmentListActionMenuClosing ? " is-closing" : " playground-tasks-toolbar-popup-menu-animate-down-in"),
                    role: "menu",
                  },
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        closeEnvironmentListActionMenu();
                        openEnvironmentRenameDialog(environmentListActionTarget);
                      },
                      disabled: isProtected || isDeleting || isCopying || isSharing,
                    },
                      React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Rename")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        closeEnvironmentListActionMenu({ animate: false });
                        openEnvironmentShareTeamModal(environmentListActionTarget);
                      },
                      disabled: isProtected || isDeleting || isCopying || isSharing,
                    },
                      React.createElement(UsersRound, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Share with Team")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        void handleCopyEnvironmentFromMenu(environmentListActionTarget);
                      },
                      disabled: isDeleting || isCopying || isSharing,
                    },
                      React.createElement(Copy, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, isCopying ? "Copying..." : "Copy")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row is-danger",
                      onClick: () => {
                        closeEnvironmentListActionMenu();
                        void handleDeleteEnvironment(environmentListActionTarget.id);
                      },
                      disabled: isProtected || isDeleting || isCopying || isSharing,
                    },
                      React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, isDeleting ? "Deleting..." : "Delete")
                      )
                    )
                  )
                )
              );
            return typeof createPortal === "function" && typeof document !== "undefined" && document.body
              ? createPortal(menuElement, document.body)
              : menuElement;
          }
  
          function renderEnvironmentBulkActionMenu() {
            if (!environmentBulkActionMenuState) {
              return null;
            }
            const bulkEnvironments = getEnvironmentActionTargetsByIds(environmentBulkActionMenuState.environmentIds);
            if (bulkEnvironments.length < 2) {
              return null;
            }
            const bulkEnvironmentIds = bulkEnvironments.map((environmentTarget) => environmentTarget.id);
            const mutableTargets = bulkEnvironments.filter((environmentTarget) => !environmentTarget?.isDefault && !environmentTarget?.isSystem);
            const isSharing = environmentShareTeamState.action === "share";
            const menuStyle = {
              position: "fixed",
              top: environmentBulkActionMenuState.top + "px",
              left: environmentBulkActionMenuState.left + "px",
              right: "auto",
            };
            if (Number.isFinite(environmentBulkActionMenuState.right)) {
              menuStyle.right = environmentBulkActionMenuState.right + "px";
              menuStyle.left = "auto";
            }
  
            const menuElement = React.createElement(PlatformPopupDismissLayer, {
                className: "sidebar-thread-popup-scrim",
                style: { zIndex: 360 },
                onClick: closeEnvironmentBulkActionMenu,
              },
                React.createElement("div", {
                  className: "playground-platform-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal playground-agents-list-action-menu-shell is-open",
                  style: menuStyle,
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement(PlatformPopupSurface, {
                    className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu" + (environmentBulkActionMenuClosing ? " is-closing" : " playground-tasks-toolbar-popup-menu-animate-down-in"),
                    role: "menu",
                  },
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        closeEnvironmentBulkActionMenu({ animate: false });
                        openEnvironmentShareTeamModal(null, { environmentIds: bulkEnvironmentIds });
                      },
                      disabled: saveState.isSaving || isSharing || mutableTargets.length === 0,
                    },
                      React.createElement(UsersRound, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Share with Team")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row is-danger",
                      onClick: () => {
                        closeEnvironmentBulkActionMenu({ animate: false });
                        void handleDeleteEnvironments(mutableTargets);
                      },
                      disabled: saveState.isSaving || isSharing || mutableTargets.length === 0,
                    },
                      React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Delete")
                      )
                    )
                  )
                )
              );
            return typeof createPortal === "function" && typeof document !== "undefined" && document.body
              ? createPortal(menuElement, document.body)
              : menuElement;
          }
  
          function renderServerResourceActionMenu() {
            if (!serverResourceActionMenuState || !serverResourceActionTarget) {
              return null;
            }
  
            const isDatabaseResource = serverResourceActionTarget.resourceType === "database";
            const isDraft = serverResourceActionTarget.id === PLAYGROUND_SERVER_DRAFT_ID || serverResourceActionTarget.id === PLAYGROUND_DATABASE_DRAFT_ID;
            const isSaving = isDatabaseResource ? databaseSaveState.isSaving : serverSaveState.isSaving;
            const isDeleting = isSaving && (
              isDatabaseResource
                ? selectedDatabaseId === serverResourceActionTarget.id
                : selectedServerId === serverResourceActionTarget.id
            );
            const menuStyle = {
              top: serverResourceActionMenuState.top + "px",
            };
            if (Number.isFinite(serverResourceActionMenuState.right)) {
              menuStyle.right = serverResourceActionMenuState.right + "px";
            } else {
              menuStyle.left = serverResourceActionMenuState.left + "px";
            }
  
            return React.createElement(PlatformPopupDismissLayer, {
                className: "sidebar-thread-popup-scrim",
                onClick: closeServerResourceActionMenu,
              },
                React.createElement(PlatformPopupSurface, {
                  className: "sidebar-thread-popup is-agent-list-action-menu",
                  style: menuStyle,
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement("div", { className: "sidebar-thread-popup-title" }, isDatabaseResource ? "Database" : "Server"),
                  React.createElement("button", {
                    type: "button",
                    className: "sidebar-thread-popup-row",
                    onClick: () => {
                      closeServerResourceActionMenu();
                      if (isDatabaseResource) {
                        openDatabaseRenameDialog(serverResourceActionTarget);
                      } else {
                        openServerRenameDialog(serverResourceActionTarget);
                      }
                    },
                    disabled: isDraft || isSaving,
                  },
                    React.createElement(SquarePen, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                    React.createElement("span", { className: "sidebar-thread-popup-row-label" }, "Rename")
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "sidebar-thread-popup-row",
                    onClick: () => {
                      closeServerResourceActionMenu();
                      openServerResourceCopyComposer(serverResourceActionTarget);
                    },
                    disabled: isSaving,
                  },
                    React.createElement(Copy, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                    React.createElement("span", { className: "sidebar-thread-popup-row-label" }, "Copy")
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "sidebar-thread-popup-row is-danger",
                    onClick: () => {
                      closeServerResourceActionMenu();
                      if (isDatabaseResource) {
                        void handleDeleteDatabase(serverResourceActionTarget.id);
                      } else {
                        void handleDeleteServer(serverResourceActionTarget.id);
                      }
                    },
                    disabled: isDraft || isSaving,
                  },
                    React.createElement(Trash2, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                    React.createElement("span", { className: "sidebar-thread-popup-row-label" }, isDeleting ? "Deleting..." : "Delete")
                  )
                )
              );
          }
  
          function renderEnvironmentComposerRuntimeSettings(composerDraft, isSaving) {
            return React.createElement("div", { className: "playground-environment-composer-runtime-facts playground-computer-creation-settings" },
              PLAYGROUND_RUNTIME_DEFINITIONS
                .filter((runtime) => runtime.key === "python" || runtime.key === "nodejs")
                .map((runtime) => {
                  const currentValue = composerDraft.runtimes?.[runtime.key] || "";
                  const runtimeOptions = currentValue && !(availableRuntimes[runtime.key] || []).includes(currentValue)
                    ? [currentValue, ...(availableRuntimes[runtime.key] || [])]
                    : (availableRuntimes[runtime.key] || []);
                  const isPopoverOpen = environmentComposerRuntimePopover === runtime.key;
  
                  return React.createElement("div", { className: "playground-tasks-detail-fact", key: runtime.key },
                    React.createElement("div", { className: "playground-tasks-detail-fact-label" }, runtime.label),
                    React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                      React.createElement("div", {
                          className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-detail-select-shell" + (isPopoverOpen ? " is-open" : ""),
                          ref: isPopoverOpen ? environmentComposerRuntimePopoverRef : null,
                        },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-runtime-value-button playground-tasks-detail-select-trigger" + (currentValue ? "" : " is-empty") + (isPopoverOpen ? " is-active" : ""),
                          onClick: () => setEnvironmentComposerRuntimePopover((current) => current === runtime.key ? "" : runtime.key),
                          disabled: isSaving,
                        },
                          React.createElement("span", { className: "playground-environments-runtime-value-label" }, currentValue || "Disabled"),
                          React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", width: 14, height: 14, strokeWidth: 1.8 })
                        ),
                        isPopoverOpen
                          ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                              React.createElement("button", {
                                  type: "button",
                                  className: "tb-popup-row tb-popup-row-select" + (!currentValue ? " selected" : ""),
                                  onClick: () => {
                                    updateEnvironmentComposerRuntime(runtime.key, "");
                                    setEnvironmentComposerRuntimePopover("");
                                  },
                                },
                                React.createElement("span", { className: "tb-popup-check-slot" },
                                  !currentValue
                                    ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                    : null
                                ),
                                React.createElement("span", null, "Disabled")
                              ),
                              runtimeOptions.map((option) =>
                                React.createElement("button", {
                                    key: runtime.key + ":" + option,
                                    type: "button",
                                    className: "tb-popup-row tb-popup-row-select" + (currentValue === option ? " selected" : ""),
                                    onClick: () => {
                                      updateEnvironmentComposerRuntime(runtime.key, option);
                                      setEnvironmentComposerRuntimePopover("");
                                    },
                                  },
                                  React.createElement("span", { className: "tb-popup-check-slot" },
                                    currentValue === option
                                      ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                      : null
                                  ),
                                  React.createElement("span", null, option)
                                )
  	                            )
  	                          )
  		                  : null
  		                )
  		              )
  		            );
  		              })
  	          );
          }
  
          function renderEnvironmentCreationSetupModal() {
            if (!environmentComposerOpen) {
              return null;
            }

            const composerDraft = environmentComposerDraft || buildPlaygroundDefaultEnvironmentDraft();
            const isSaving = Boolean(environmentComposerSaveState.isSaving);
            const hasOpenSelector = Boolean(environmentComposerRuntimePopover);

            return React.createElement(PlatformModal, {
              open: environmentComposerOpen,
              title: "Create Computer",
              description: "Configure the profile and runtime versions for the new computer.",
              headerVariant: "search",
              headerSearchProps: {
                icon: Monitor,
                inputRef: environmentCreationNameInputRef,
                value: composerDraft.name || "",
                placeholder: "New Computer",
                "aria-label": "Computer name",
                title: composerDraft.name || "Computer name",
                disabled: isSaving,
                onKeyDown: (event) => event.stopPropagation(),
                onChange: (event) => updateEnvironmentComposerField("name", event.target.value),
              },
              size: "medium",
              as: "form",
              className: "playground-agents-creation-modal playground-computer-creation-modal",
              bodyClassName: "playground-agents-creation-modal-body playground-computer-creation-modal-body",
              footerClassName: "playground-agents-creation-modal-footer playground-computer-creation-modal-footer",
              initialFocusRef: environmentCreationNameInputRef,
              closeButtonLabel: "Close computer creation",
              closeButtonDisabled: isSaving,
              closeOnBackdrop: !isSaving && !hasOpenSelector,
              closeOnEscape: !isSaving && !hasOpenSelector,
              onClose: closeEnvironmentComposer,
              surfaceProps: {
                onSubmit: (event) => void handleEnvironmentComposerSubmit(event),
              },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  onClick: closeEnvironmentComposer,
                  disabled: isSaving,
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  disabled: isSaving || !String(composerDraft.name || "").trim(),
                }, isSaving ? "Creating..." : "Create Computer")
              ),
            },
              React.createElement("div", { className: "playground-agents-creation-config-box playground-computer-creation-modal-config" },
                React.createElement("section", { className: "playground-computer-creation-field" },
                  React.createElement("div", { className: "playground-tasks-project-modal-label playground-computer-creation-label" }, "Computer Profile"),
                  renderEnvironmentComputeProfileSelector(
                    composerDraft.computeProfile,
                    (profileId) => updateEnvironmentComposerField("computeProfile", profileId),
                    { disabled: isSaving }
                  )
                ),
                composerDraft.computeProfile === "desktop"
                  ? React.createElement("section", { className: "playground-computer-creation-field" },
                      React.createElement("div", { className: "playground-tasks-project-modal-label playground-computer-creation-label" }, "Office Apps"),
                      React.createElement("div", { className: "playground-environment-composer-toggle-row" },
                        React.createElement("div", { className: "playground-environment-composer-toggle-help" },
                          "Install Writer and Calc for document and spreadsheet work."
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-toggle" + (composerDraft.officeAppsEnabled === true ? " is-active" : ""),
                          onClick: () => updateEnvironmentComposerField("officeAppsEnabled", !(composerDraft.officeAppsEnabled === true)),
                          "aria-pressed": composerDraft.officeAppsEnabled === true ? "true" : "false",
                          title: composerDraft.officeAppsEnabled === true ? "Office apps enabled" : "Office apps disabled",
                          disabled: isSaving,
                        }, React.createElement("span", { className: "playground-environments-toggle-thumb" }))
                      )
                    )
                  : null,
                React.createElement("section", { className: "playground-computer-creation-field" },
                  React.createElement("div", { className: "playground-tasks-project-modal-label playground-computer-creation-label" }, "Runtime Versions"),
                  renderEnvironmentComposerRuntimeSettings(composerDraft, isSaving)
                ),
                environmentComposerSaveState.error
                  ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, environmentComposerSaveState.error)
                  : null
              )
            );
          }
  
          function updateRuntime(key, value) {
            updateDraftEnvironment((current) => {
              const nextRuntimes = {
                ...(current.runtimes || {}),
              };
              const nextPackageVersions = {
                ...(current.packageVersions || {}),
              };
              const normalizedValue = String(value || "").trim();
              if (!normalizedValue) {
                delete nextRuntimes[key];
                delete nextPackageVersions[key];
              } else {
                nextRuntimes[key] = normalizedValue;
                nextPackageVersions[key] = normalizedValue;
              }
  
              return {
                ...current,
                runtimes: nextRuntimes,
                packageVersions: nextPackageVersions,
              };
            });
          }
  
          function addPackage(type, value) {
            const normalizedValue = String(value || "").trim();
            if (!normalizedValue) {
              return;
            }
  
            updateDraftEnvironment((current) => {
              const currentList = (current.packages?.[type] || []).map((item) => String(item || "").trim()).filter(Boolean);
              if (currentList.includes(normalizedValue)) {
                return current;
              }
              return {
                ...current,
                packages: {
                  ...(current.packages || { system: [], python: [], node: [] }),
                  [type]: [...currentList, normalizedValue],
                },
              };
            });
            setPackageComposerState((current) => current.type === type
              ? { type: "", value: "" }
              : current
            );
          }
  
          function openPackageComposer(type) {
            setPackageComposerState({
              type,
              value: "",
            });
          }
  
          function closePackageComposer() {
            setPackageComposerState({
              type: "",
              value: "",
            });
          }
  
          function removePackage(type, index) {
            updateDraftEnvironment((current) => ({
              ...current,
              packages: {
                ...(current.packages || { system: [], python: [], node: [] }),
                [type]: (current.packages?.[type] || []).filter((_, itemIndex) => itemIndex !== index),
              },
            }));
          }
  
          function addEnvironmentVariable() {
            updateDraftEnvironment((current) => ({
              ...current,
              environmentVariables: [...(current.environmentVariables || []), { key: "", value: "" }],
            }));
          }
  
          function updateEnvironmentVariable(index, field, value) {
            updateDraftEnvironment((current) => {
              const nextVariables = [...(current.environmentVariables || [])];
              nextVariables[index] = {
                ...(nextVariables[index] || { key: "", value: "" }),
                [field]: value,
              };
              return {
                ...current,
                environmentVariables: nextVariables,
              };
            });
          }
  
          function removeEnvironmentVariable(index) {
            updateDraftEnvironment((current) => ({
              ...current,
              environmentVariables: (current.environmentVariables || []).filter((_, itemIndex) => itemIndex !== index),
            }));
          }
  
          function addSecret() {
            updateDraftEnvironment((current) => ({
              ...current,
              secrets: [...(current.secrets || []), { key: "", value: "" }],
            }));
          }
  
          function updateSecret(index, field, value) {
            updateDraftEnvironment((current) => {
              const nextSecrets = [...(current.secrets || [])];
              const currentSecret = nextSecrets[index] || { key: "", value: "" };
              if (field === "value") {
                if (currentSecret.key) {
                  setModifiedSecrets((currentValues) => ({
                    ...currentValues,
                    [currentSecret.key]: value,
                  }));
                }
                nextSecrets[index] = {
                  ...currentSecret,
                  value,
                };
              } else {
                const previousKey = currentSecret.key;
                if (previousKey && modifiedSecrets[previousKey] !== undefined) {
                  setModifiedSecrets((currentValues) => {
                    const nextValues = { ...currentValues };
                    nextValues[value] = currentValues[previousKey];
                    delete nextValues[previousKey];
                    return nextValues;
                  });
                }
                nextSecrets[index] = {
                  ...currentSecret,
                  key: value,
                };
              }
  
              return {
                ...current,
                secrets: nextSecrets,
              };
            });
          }
  
          function removeSecret(index) {
            const secretKey = draftEnvironment?.secrets?.[index]?.key || "";
            if (secretKey) {
              setModifiedSecrets((current) => {
                const next = { ...current };
                delete next[secretKey];
                return next;
              });
            }
  
            updateDraftEnvironment((current) => ({
              ...current,
              secrets: (current.secrets || []).filter((_, itemIndex) => itemIndex !== index),
            }));
          }
  
          function addSetupScript() {
            updateDraftEnvironment((current) => ({
              ...current,
              setupScripts: [...(current.setupScripts || []), ""],
            }));
          }
  
          function updateSetupScript(index, value) {
            updateDraftEnvironment((current) => {
              const nextScripts = [...(current.setupScripts || [])];
              nextScripts[index] = value;
              return {
                ...current,
                setupScripts: nextScripts,
              };
            });
          }
  
          function removeSetupScript(index) {
            updateDraftEnvironment((current) => ({
              ...current,
              setupScripts: (current.setupScripts || []).filter((_, itemIndex) => itemIndex !== index),
            }));
          }
  
          function addMcpServer() {
            updateDraftEnvironment((current) => ({
              ...current,
              mcpServers: [
                ...(current.mcpServers || []),
                {
                  id: "mcp-" + Date.now().toString(36),
                  name: "",
                  enabled: true,
                  type: "stdio",
                  command: "",
                  url: "",
                  bearerToken: "",
                },
              ],
            }));
          }
  
          function updateMcpServer(index, updater) {
            updateDraftEnvironment((current) => {
              const nextServers = [...(current.mcpServers || [])];
              const currentServer = nextServers[index] || {
                id: "mcp-" + index,
                name: "",
                enabled: true,
                type: "stdio",
                command: "",
                url: "",
                bearerToken: "",
              };
              nextServers[index] = typeof updater === "function" ? updater(currentServer) : updater;
              return {
                ...current,
                mcpServers: nextServers,
              };
            });
          }
  
          function removeMcpServer(index) {
            const serverName = draftEnvironment?.mcpServers?.[index]?.name || "";
            if (serverName) {
              setModifiedMcpTokens((current) => {
                const next = { ...current };
                delete next[serverName];
                return next;
              });
            }
  
            updateDraftEnvironment((current) => ({
              ...current,
              mcpServers: (current.mcpServers || []).filter((_, itemIndex) => itemIndex !== index),
            }));
          }
  
          function updateMcpBearerToken(index, value) {
            const serverName = draftEnvironment?.mcpServers?.[index]?.name || "";
            if (serverName) {
              setModifiedMcpTokens((current) => ({
                ...current,
                [serverName]: value,
              }));
            }
            updateMcpServer(index, (server) => ({
              ...server,
              bearerToken: value,
            }));
          }
  
          function addDocumentationFile() {
            updateDraftEnvironment((current) => ({
              ...current,
              documentation: [
                ...(current.documentation || []),
                {
                  id: "doc-" + Date.now().toString(36),
                  name: "New Document",
                  content: "",
                  mimeType: "text/plain",
                },
              ],
            }));
          }
  
          function updateDocumentationFile(index, updater) {
            updateDraftEnvironment((current) => {
              const nextFiles = [...(current.documentation || [])];
              const currentFile = nextFiles[index] || {
                id: "doc-" + index,
                name: "Document " + (index + 1),
                content: "",
                mimeType: "text/plain",
              };
              nextFiles[index] = typeof updater === "function" ? updater(currentFile) : updater;
              return {
                ...current,
                documentation: nextFiles,
              };
            });
          }
  
          function removeDocumentationFile(index) {
            updateDraftEnvironment((current) => ({
              ...current,
              documentation: (current.documentation || []).filter((_, itemIndex) => itemIndex !== index),
            }));
          }
  
          function updateGitField(field, value) {
            updateDraftEnvironment((current) => {
              const nextVariables = [...(current.environmentVariables || [])];
              const existingIndex = nextVariables.findIndex((item) => item.key === field);
              if (value) {
                if (existingIndex === -1) {
                  nextVariables.push({ key: field, value });
                } else {
                  nextVariables[existingIndex] = {
                    ...nextVariables[existingIndex],
                    value,
                  };
                }
              } else if (existingIndex !== -1) {
                nextVariables.splice(existingIndex, 1);
              }
              return {
                ...current,
                environmentVariables: nextVariables,
              };
            });
          }
  
          function updateGitToken(value) {
            updateDraftEnvironment((current) => {
              const nextSecrets = [...(current.secrets || [])];
              const existingIndex = nextSecrets.findIndex((item) => item.key === "GITHUB_TOKEN");
              if (value) {
                if (existingIndex === -1) {
                  nextSecrets.push({ key: "GITHUB_TOKEN", value });
                } else {
                  nextSecrets[existingIndex] = {
                    ...nextSecrets[existingIndex],
                    value,
                  };
                }
                setModifiedSecrets((currentValues) => ({
                  ...currentValues,
                  GITHUB_TOKEN: value,
                }));
              } else if (existingIndex !== -1) {
                nextSecrets.splice(existingIndex, 1);
                setModifiedSecrets((currentValues) => {
                  const nextValues = { ...currentValues };
                  delete nextValues.GITHUB_TOKEN;
                  return nextValues;
                });
              }
              return {
                ...current,
                secrets: nextSecrets,
              };
            });
          }
  
          function getDraftEnvironmentVariableValue(key) {
            return draftEnvironment?.environmentVariables?.find((item) => item.key === key)?.value || "";
          }
  
          function getDraftGitTokenValue() {
            const draftSecret = draftEnvironment?.secrets?.find((item) => item.key === "GITHUB_TOKEN");
            if (!draftSecret) return "";
            if (existingSecretKeys.has("GITHUB_TOKEN")) {
              return modifiedSecrets.GITHUB_TOKEN !== undefined ? modifiedSecrets.GITHUB_TOKEN : "";
            }
            return draftSecret.value || "";
          }
  
          function copyDockerfilePreview() {
            if (!generatedDockerfile) {
              return;
            }
            navigator.clipboard.writeText(generatedDockerfile)
              .then(() => {
                setDockerfileState((current) => ({
                  ...current,
                  copied: true,
                }));
              })
              .catch(() => {
              });
          }
  
          function renderPackageGroup(type, label, placeholder) {
            const values = (draftEnvironment?.packages?.[type] || [])
              .map((value) => String(value || "").trim())
              .filter(Boolean);
            const isComposerOpen = packageComposerState.type === type;
            return React.createElement("div", { className: "playground-environments-package-group", key: type },
              values.length > 0
                ? React.createElement("div", { className: "playground-tasks-skills-list" },
                    values.map((value, index) =>
                      React.createElement("div", { className: "playground-tasks-skill-pill", key: type + ":" + index },
                        React.createElement("span", { className: "playground-tasks-skill-pill-label" }, value),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-skill-pill-remove",
                          onClick: () => removePackage(type, index),
                          "aria-label": "Remove " + label + " package",
                        }, React.createElement(X, { width: 12, height: 12, strokeWidth: 1.9 }))
                      )
                    )
                  )
                : !isComposerOpen
                  ? React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No " + label.toLowerCase() + " packages.")
                  : null,
              isComposerOpen
                ? React.createElement("div", { className: "playground-environments-package-composer" },
                    React.createElement("input", {
                      type: "text",
                      className: "playground-environments-input",
                      value: packageComposerState.value,
                      onChange: (event) => setPackageComposerState((current) => ({
                        ...current,
                        value: event.target.value,
                      })),
                      onKeyDown: (event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addPackage(type, packageComposerState.value);
                        } else if (event.key === "Escape") {
                          event.preventDefault();
                          closePackageComposer();
                        }
                      },
                      placeholder,
                      autoFocus: true,
                    }),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: () => addPackage(type, packageComposerState.value),
                    }, "Add"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-package-composer-cancel",
                      onClick: closePackageComposer,
                      "aria-label": "Cancel package add",
                    }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.9 }))
                  )
                : null
            );
          }
  
          async function handleOpenEnvironmentGui(options = {}) {
            const normalizedEnvironmentId = String(draftEnvironment?.id || "").trim();
            if (!normalizedEnvironmentId || normalizedEnvironmentId === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
            if (draftEnvironment?.guiEnabled === false) {
              setEnvironmentGuiState((current) => ({
                ...current,
                isStarting: false,
                error: "GUI is disabled for this environment. Turn it on and restart the environment to use the desktop.",
              }));
              return;
            }
            const forceRestart = Boolean(options?.forceRestart);
  
            setEnvironmentGuiOpen(true);
            replaceEnvironmentGuiFrameUrl("");
            setEnvironmentGuiState((current) => ({
              ...current,
              isStarting: true,
              error: "",
            }));
            setEnvironmentRuntimeState((current) => ({
              status: current.status === "running" ? "running" : "starting",
              containerId: current.containerId || "",
              message: "",
            }));
  
            try {
              if (forceRestart) {
                await stopEnvironmentRuntime(normalizedEnvironmentId);
              }
  
              const currentStatus = await loadEnvironmentRuntimeStatus(normalizedEnvironmentId);
              const normalizedStatus = String(currentStatus?.status || environmentRuntimeState.status || "").trim().toLowerCase();
  
              if (normalizedStatus !== "running") {
                const response = await fetch(backendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/start", {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                });
                if (!response.ok) {
                  const message = await readEnvironmentGuiErrorMessage(response, "Failed to start the environment.");
                  throw new Error(message);
                }
              }
  
              await loadEnvironmentRuntimeStatus(normalizedEnvironmentId);
              await sendEnvironmentGuiAction({
                action: "bootstrap",
              }, {
                environmentId: normalizedEnvironmentId,
              });
              const didOpenViewer = await loadEnvironmentGuiScreenshot(normalizedEnvironmentId, {
                attempts: 8,
                retryDelayMs: 650,
              });
              if (!didOpenViewer) {
                throw new Error("Failed to connect the live desktop viewer.");
              }
              setEnvironmentGuiState((current) => ({
                ...current,
                isStarting: false,
                error: "",
              }));
            } catch (error) {
              setEnvironmentGuiState((current) => ({
                ...current,
                isStarting: false,
                error: error instanceof Error ? error.message : "Failed to open the desktop.",
              }));
              void loadEnvironmentRuntimeStatus(normalizedEnvironmentId);
            }
          }
  
          function buildEnvironmentGuiPoint(event) {
            const imageElement = environmentGuiImageRef.current;
            if (!imageElement) {
              return null;
            }
            const rect = imageElement.getBoundingClientRect();
            if (!rect.width || !rect.height) {
              return null;
            }
            const naturalWidth = imageElement.naturalWidth || rect.width;
            const naturalHeight = imageElement.naturalHeight || rect.height;
            const relativeX = (event.clientX - rect.left) / rect.width;
            const relativeY = (event.clientY - rect.top) / rect.height;
            const x = Math.max(0, Math.min(Math.round(relativeX * naturalWidth), Math.max(0, naturalWidth - 1)));
            const y = Math.max(0, Math.min(Math.round(relativeY * naturalHeight), Math.max(0, naturalHeight - 1)));
            return { x, y };
          }
  
          function handleEnvironmentGuiImageClick(event) {
            const point = buildEnvironmentGuiPoint(event);
            if (!point) {
              return;
            }
            if (environmentGuiClickTimerRef.current) {
              window.clearTimeout(environmentGuiClickTimerRef.current);
            }
            environmentGuiClickTimerRef.current = window.setTimeout(() => {
              environmentGuiClickTimerRef.current = null;
              void sendEnvironmentGuiAction({
                action: "click",
                x: point.x,
                y: point.y,
              });
            }, 180);
          }
  
          function handleEnvironmentGuiImageDoubleClick(event) {
            const point = buildEnvironmentGuiPoint(event);
            if (!point) {
              return;
            }
            if (environmentGuiClickTimerRef.current) {
              window.clearTimeout(environmentGuiClickTimerRef.current);
              environmentGuiClickTimerRef.current = null;
            }
            void sendEnvironmentGuiAction({
              action: "double_click",
              x: point.x,
              y: point.y,
            });
          }
  
          function handleEnvironmentGuiImageContextMenu(event) {
            event.preventDefault();
            const point = buildEnvironmentGuiPoint(event);
            if (!point) {
              return;
            }
            if (environmentGuiClickTimerRef.current) {
              window.clearTimeout(environmentGuiClickTimerRef.current);
              environmentGuiClickTimerRef.current = null;
            }
            void sendEnvironmentGuiAction({
              action: "right_click",
              x: point.x,
              y: point.y,
            });
          }
  
          function handleEnvironmentGuiImageWheel(event) {
            event.preventDefault();
            if (environmentGuiScrollTimerRef.current) {
              return;
            }
            const point = buildEnvironmentGuiPoint(event);
            const payload = {
              action: "scroll",
              deltaY: event.deltaY,
              ...(point ? { x: point.x, y: point.y } : {}),
            };
            void sendEnvironmentGuiAction(payload);
            environmentGuiScrollTimerRef.current = window.setTimeout(() => {
              environmentGuiScrollTimerRef.current = null;
            }, 120);
          }
  
          async function handleEnvironmentGuiTypeSubmit() {
            const nextText = String(environmentGuiInputValue || "");
            if (!nextText.trim()) {
              return;
            }
            const didSend = await sendEnvironmentGuiAction({
              action: "type",
              text: nextText,
            });
            if (didSend) {
              setEnvironmentGuiInputValue("");
            }
          }
  
  	        function handleEnvironmentGuiInputKeyDown(event) {
  	          if (event.key === "Enter" && !event.shiftKey) {
  	            event.preventDefault();
  	            void handleEnvironmentGuiTypeSubmit();
  	          }
  	        }
  
  	        function getServerCreationCopy(serverKind) {
  	          const normalizedKind = canonicalizePlaygroundServerKind(serverKind);
  	          if (normalizedKind === "function") {
  	            return {
  	              title: "Create a new Function",
  	              subtitle: "Functions give projects API endpoints and background handlers that agents and apps can call.",
  	              namePlaceholder: "Function name",
  	              descriptionPlaceholder: "Describe what this function should execute.",
  	              submitLabel: "Create Function",
  	            };
  	          }
  	          if (normalizedKind === "database") {
  	            return {
  	              title: "Create a new Database",
  	              subtitle: "Databases store structured application data for web apps, functions, and agent workflows.",
  	              namePlaceholder: "Database name",
  	              descriptionPlaceholder: "Describe what this database will store.",
  	              submitLabel: "Create Database",
  	            };
  	          }
  	          if (normalizedKind === "api") {
  	            return {
  	              title: "Create a new API",
  	              subtitle: "APIs expose managed endpoints that connect Computer Agents resources to external systems.",
  	              namePlaceholder: "API name",
  	              descriptionPlaceholder: "Describe what this API should publish.",
  	              submitLabel: "Create API",
  	            };
  	          }
  	          if (normalizedKind === "auth") {
  	            return {
  	              title: "Create a new Authentication Resource",
  	              subtitle: "Authentication resources secure user access for web apps, APIs, and functions.",
  	              namePlaceholder: "Authentication name",
  	              descriptionPlaceholder: "Describe how this authentication resource will be used.",
  	              submitLabel: "Create Authentication",
  	            };
  	          }
  	          if (normalizedKind === "agent_runtime") {
  	            return {
  	              title: "Create a new Agent Runtime",
  	              subtitle: "Agent runtimes execute agent-powered backend workflows behind applications and internal tools.",
  	              namePlaceholder: "Agent runtime name",
  	              descriptionPlaceholder: "Describe what this agent runtime will execute.",
  	              submitLabel: "Create Agent Runtime",
  	            };
  	          }
  	          if (normalizedKind === "secrets") {
  	            return {
  	              title: "Create a new Secrets Vault",
  	              subtitle: "Secrets vaults store sensitive keys and configuration for web apps, functions, and runtimes.",
  	              namePlaceholder: "Secrets vault name",
  	              descriptionPlaceholder: "Describe which secrets this vault will store.",
  	              submitLabel: "Create Secrets",
  	            };
  	          }
  	          if (normalizedKind === "payments") {
  	            return {
  	              title: "Create a new Payments Resource",
  	              subtitle: "Payments resources connect Stripe accounts to web apps and functions so products can accept money.",
  	              namePlaceholder: "Payments resource name",
  	              descriptionPlaceholder: "Describe what this payments resource will monetize.",
  	              submitLabel: "Create Payments",
  	            };
  	          }
  	          return {
  	            title: "Create a new Web App",
  	            subtitle: "Web apps publish hosted user interfaces from project workspaces with preview URLs and custom domains.",
  	            namePlaceholder: "Web app name",
  	            descriptionPlaceholder: "Describe what this web app should publish.",
  	            submitLabel: "Create Web App",
  	          };
  	        }
  
  	        function renderServerComposerDescriptionSection(composerDraft, isSaving, placeholder) {
  	          return React.createElement("div", {
  	              className: "playground-tasks-detail-description playground-tasks-project-modal-description playground-environments-editor-description playground-server-creation-description",
  	            },
  	            React.createElement("div", { className: "playground-tasks-detail-section-header" },
  	              React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
  	              React.createElement("div", { className: "playground-tasks-detail-format-actions" },
  	                [
  	                  { id: "bold", label: "Bold", icon: Bold },
  	                  { id: "italic", label: "Italic", icon: Italic },
  	                  { id: "underline", label: "Underline", icon: Underline },
  	                  { id: "list", label: "List", icon: List },
  	                ].map((action) =>
  	                  React.createElement("button", {
  	                    key: action.id,
  	                    type: "button",
  	                    className: "playground-tasks-detail-format-button",
  	                    title: action.label,
  	                    "aria-label": action.label,
  	                    disabled: isSaving,
  	                    onMouseDown: (event) => event.preventDefault(),
  	                    onClick: () => handleServerComposerDescriptionFormat(action.id),
  	                  }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
  	                )
  	              )
  	            ),
  	            React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isServerComposerDescriptionEditing ? " is-editing" : " is-preview") },
  	              !isServerComposerDescriptionEditing
  	                ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
  	                    String(composerDraft.description || "").trim()
  	                      ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
  	                          content: composerDraft.description,
  	                          className: "playground-tasks-detail-description-preview tb-message-markdown",
  	                        })
  	                      : React.createElement("div", {
  	                          className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
  	                        }, placeholder)
  	                  )
  	                : null,
  	              React.createElement("textarea", {
  	                ref: serverComposerDescriptionTextareaRef,
  	                className: "playground-tasks-detail-description-input " + (isServerComposerDescriptionEditing ? "is-editing" : "is-preview"),
  	                rows: 1,
  	                placeholder: isServerComposerDescriptionEditing ? placeholder : "",
  	                value: composerDraft.description || "",
  	                disabled: isSaving,
  	                onFocus: () => setIsServerComposerDescriptionEditing(true),
  	                onChange: (event) => {
  	                  updateServerComposerField("description", event.target.value);
  	                  resizeEnvironmentDescriptionTextarea(event.currentTarget);
  	                },
  	                onBlur: () => setIsServerComposerDescriptionEditing(false),
  	              })
  	            )
  	          );
  	        }
  
  	        function renderServerCreationSettings(composerDraft, isSaving) {
  	          const composerKind = canonicalizePlaygroundServerKind(composerDraft.kind);
  	          const isDatabaseComposer = composerKind === "database";
  	          const isAuthComposer = composerKind === "auth";
  	          const isAgentRuntimeComposer = composerKind === "agent_runtime";
  	          const isSecretsComposer = composerKind === "secrets";
  	          const isPaymentsComposer = composerKind === "payments";
  	          const isAiChatAppTemplate = composerKind === "web_app" && composerDraft.template === "ai_chat_app";
  	          const orderedComposerAgentOptions = [...serverAgentOptions].sort((left, right) => String(left?.name || "").localeCompare(String(right?.name || "")));
  	          const renderServerCreationFactRow = (key, label, control) => React.createElement("div", { className: "playground-tasks-detail-fact", key },
  	            React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
  	            React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
  	          );
  	          const settingRows = [
  	            renderServerCreationFactRow(
  	              "kind",
  	              "Type",
  	              React.createElement("span", { className: "playground-environments-editor-fact-value" }, formatPlaygroundServerKindLabel(composerKind))
  	            ),
  	          ];
  
  	          if (composerKind === "web_app") {
  	            settingRows.push(renderServerCreationFactRow(
  	              "template",
  	              "Template",
  	              React.createElement("select", {
  	                className: "playground-environments-input playground-tasks-detail-fact-select",
  	                value: composerDraft.template || "blank",
  	                disabled: isSaving,
  	                onChange: (event) => updateServerComposerField("template", event.target.value),
  	              },
  	                React.createElement("option", { value: "blank" }, "Blank Web App"),
  	                React.createElement("option", { value: "ai_chat_app" }, "AI Chat App")
  	              )
  	            ));
  	          }
  
  	          if (isAiChatAppTemplate) {
  	            settingRows.push(
  	              renderServerCreationFactRow(
  	                "agent",
  	                "Agent",
  	                React.createElement("select", {
  	                  className: "playground-environments-input playground-tasks-detail-fact-select",
  	                  value: composerDraft.templateAgentId || "",
  	                  disabled: isSaving,
  	                  onChange: (event) => updateServerComposerField("templateAgentId", event.target.value),
  	                },
  	                  React.createElement("option", { value: "" }, serverAgentOptionsLoading ? "Loading agents..." : "Choose agent"),
  	                  orderedComposerAgentOptions.map((agent) =>
  	                    React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.id)
  	                  )
  	                )
  	              ),
  	              renderServerCreationFactRow(
  	                "computer",
  	                "Computer",
  	                React.createElement("select", {
  	                  className: "playground-environments-input playground-tasks-detail-fact-select",
  	                  value: composerDraft.templateEnvironmentId || "",
  	                  disabled: isSaving,
  	                  onChange: (event) => updateServerComposerField("templateEnvironmentId", event.target.value),
  	                },
  	                  React.createElement("option", { value: "" }, orderedEnvironments.length === 0 ? "No computers available" : "Choose computer"),
  	                  orderedEnvironments.map((environment) =>
  	                    React.createElement("option", { key: environment.id, value: environment.id }, environment.name || environment.id)
  	                  )
  	                )
  	              )
  	            );
  	          }
  
  	          if (isDatabaseComposer) {
  	            settingRows.push(renderServerCreationFactRow(
  	              "location",
  	              "Location",
  	              React.createElement("input", {
  	                type: "text",
  	                className: "playground-environments-input playground-tasks-detail-fact-select",
  	                value: composerDraft.databaseLocation || "eur3",
  	                disabled: isSaving,
  	                onChange: (event) => updateServerDatabaseField("databaseLocation", event.target.value, "composer"),
  	                placeholder: "eur3",
  	              })
  	            ));
  		          } else if (!isAuthComposer && !isAgentRuntimeComposer && !isSecretsComposer && !isPaymentsComposer) {
  	            settingRows.push(renderServerCreationFactRow(
  	              "auth",
  	              "Auth",
  	              React.createElement("select", {
  	                className: "playground-environments-input playground-tasks-detail-fact-select",
  	                value: composerDraft.authMode,
  	                disabled: isSaving,
  	                onChange: (event) => updateServerComposerField("authMode", event.target.value),
  	              },
  	                React.createElement("option", { value: "public" }, "Public"),
  	                React.createElement("option", { value: "private" }, "Private")
  	              )
  	            ));
  	          }
  
  	          if (isAiChatAppTemplate) {
  	            settingRows.push(renderServerCreationFactRow(
  	              "database-location",
  	              "Database Location",
  	              React.createElement("input", {
  	                type: "text",
  	                className: "playground-environments-input playground-tasks-detail-fact-select",
  	                value: composerDraft.databaseLocation || "eur3",
  	                disabled: isSaving,
  	                onChange: (event) => updateServerDatabaseField("databaseLocation", event.target.value, "composer"),
  	                placeholder: "eur3",
  	              })
  	            ));
  	          }
  
  	          if (!isDatabaseComposer && !isAuthComposer && !isAgentRuntimeComposer && !isSecretsComposer && !isPaymentsComposer) {
  	            settingRows.push(renderServerCreationFactRow(
  	              "region",
  	              "Region",
  	              React.createElement("input", {
  	                type: "text",
  	                className: "playground-environments-input playground-tasks-detail-fact-select",
  	                value: composerDraft.region || "",
  	                disabled: isSaving,
  	                onChange: (event) => updateServerComposerField("region", event.target.value),
  	                placeholder: "europe-west1",
  	              })
  	            ));
  	          }
  
  	          return React.createElement("div", { className: "playground-environments-editor-surface playground-computer-creation-settings" },
  	            React.createElement("div", { className: "playground-tasks-detail-facts playground-environments-editor-facts" },
  	              React.createElement("div", { className: "playground-tasks-detail-facts-body" }, settingRows)
  	            )
  	          );
  	        }
  
  	        function renderServerCreationSetupPage() {
  	          const composerDraft = serverComposerDraft || buildPlaygroundDefaultServerDraft();
  	          const composerKind = canonicalizePlaygroundServerKind(composerDraft.kind);
  	          const isSaving = serverComposerSaveState.isSaving;
  	          const creationCopy = getServerCreationCopy(composerKind);
  	          const isAiChatAppTemplate = composerKind === "web_app" && composerDraft.template === "ai_chat_app";
  
  	          return React.createElement("div", {
  	              className: "playground-environments-detail-scroll playground-settings-detail-scroll playground-computer-creation-scroll playground-server-creation-scroll",
  	              ref: resourcesDetailScrollRef,
  	            },
  	            React.createElement("form", {
  	                className: "playground-resources-detail-content playground-agents-creation-form playground-computer-creation-form playground-server-creation-form",
  	                onKeyDown: handleComposerSubmitShortcut,
  	                onSubmit: (event) => void handleServerComposerSubmit(event),
  	              },
  	              React.createElement("div", { className: "playground-computer-creation-header" },
  	                React.createElement("h2", { className: "playground-computer-creation-title" }, creationCopy.title),
  	                React.createElement("p", { className: "playground-computer-creation-subtitle" }, creationCopy.subtitle)
  	              ),
  	              React.createElement("div", { className: "playground-agents-creation-config-box playground-computer-creation-config-box" },
  	                React.createElement("div", { className: "playground-computer-creation-name-row" },
  	                  React.createElement("input", {
  	                    type: "text",
  	                    className: "playground-content-title playground-tasks-detail-navbar-title-input playground-environments-editor-title-input playground-agents-profile-name-input playground-computer-creation-name-input",
  	                    value: composerDraft.name || "",
  	                    placeholder: creationCopy.namePlaceholder,
  	                    "aria-label": creationCopy.namePlaceholder,
  	                    title: composerDraft.name || creationCopy.namePlaceholder,
  	                    autoFocus: true,
  	                    disabled: isSaving,
  	                    onKeyDown: (event) => event.stopPropagation(),
  	                    onChange: (event) => updateServerComposerField("name", event.target.value),
  	                  })
  	                ),
  	                renderServerComposerDescriptionSection(composerDraft, isSaving, creationCopy.descriptionPlaceholder),
  	                React.createElement("div", { className: "playground-computer-creation-field" },
  	                  React.createElement("div", { className: "playground-tasks-project-modal-label playground-computer-creation-label" }, "Settings"),
  	                  renderServerCreationSettings(composerDraft, isSaving)
  	                ),
  	                React.createElement("div", { className: "playground-agents-creation-actions playground-computer-creation-actions" },
  	                  React.createElement(PlatformSecondaryButton, {
  	                    size: "medium",
  	                    type: "button",
  	                    className: "playground-agents-creation-action-button is-secondary",
  	                    disabled: isSaving,
  	                    onClick: () => {
  	                      closeServerComposer();
  	                      setIsHomeViewActive(true);
  	                    },
  	                  }, "Cancel"),
  	                  React.createElement(PlatformPrimaryButton, {
  	                    size: "medium",
  	                    type: "submit",
  	                    className: "playground-agents-creation-action-button is-primary",
  	                    disabled: isSaving || !String(composerDraft.name || "").trim() || (isAiChatAppTemplate && (!String(composerDraft.templateAgentId || "").trim() || !String(composerDraft.templateEnvironmentId || "").trim())),
  	                  }, isSaving ? "Creating..." : creationCopy.submitLabel)
  	                )
  	              ),
  	              serverComposerSaveState.error
  	                ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, serverComposerSaveState.error)
  	                : null
  	            )
  	          );
  	        }
  
  	        function renderServerComposerDialog() {
  	          if (!serverComposerOpen || (embeddedInResources && isServersMode && normalizedEmbeddedServerKind)) {
  	            return null;
  	          }
  
            const composerDraft = serverComposerDraft || buildPlaygroundDefaultServerDraft();
            const composerKind = canonicalizePlaygroundServerKind(composerDraft.kind);
            const isDatabaseComposer = composerKind === "database";
            const isAuthComposer = composerKind === "auth";
            const isAgentRuntimeComposer = composerKind === "agent_runtime";
            const isSecretsComposer = composerKind === "secrets";
            const isPaymentsComposer = composerKind === "payments";
            const isAiChatAppTemplate = composerKind === "web_app" && composerDraft.template === "ai_chat_app";
            const orderedComposerAgentOptions = [...serverAgentOptions].sort((left, right) => String(left?.name || "").localeCompare(String(right?.name || "")));
            const composerNamePlaceholder = isDatabaseComposer
              ? "Database name"
              : isAuthComposer
                ? "Auth name"
              : isAgentRuntimeComposer
                ? "Agent runtime name"
              : isSecretsComposer
                ? "Secrets vault name"
              : isPaymentsComposer
                ? "Payments resource name"
              : "Server name";
            const composerDescriptionPlaceholder = isDatabaseComposer
              ? "Describe what this database will store."
              : isAuthComposer
                ? "Describe how this auth module will be used."
              : isAgentRuntimeComposer
                ? "Describe what this agent runtime will execute."
              : isSecretsComposer
                ? "Describe which secrets this vault will store."
              : isPaymentsComposer
                ? "Describe what this payments resource will monetize."
              : "Describe what this server will publish.";
  
            return React.createElement(PlatformModalBackdrop, {
                className: "playground-tasks-project-modal-backdrop",
                onClick: () => {
                  if (!serverComposerSaveState.isSaving) {
                    closeServerComposer();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                    as: "form",
                    className: "playground-tasks-project-modal playground-environment-composer-modal",
                    onClick: (event) => event.stopPropagation(),
                    onKeyDown: handleComposerSubmitShortcut,
                    onSubmit: (event) => void handleServerComposerSubmit(event),
                  },
                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                      React.createElement("div", {
                        className: "playground-tasks-project-modal-icon-trigger",
                        "aria-hidden": "true",
                      },
                        isDatabaseComposer
                          ? React.createElement(Database, { width: 18, height: 18, strokeWidth: 1.9 })
                          : isAuthComposer
                            ? React.createElement(Shield, { width: 18, height: 18, strokeWidth: 1.9 })
                          : isAgentRuntimeComposer
                            ? React.createElement(Bot, { width: 18, height: 18, strokeWidth: 1.9 })
                          : isSecretsComposer
                            ? React.createElement(Key, { width: 18, height: 18, strokeWidth: 1.9 })
                          : isPaymentsComposer
                            ? React.createElement(ReceiptText, { width: 18, height: 18, strokeWidth: 1.9 })
                          : React.createElement(Server, { width: 18, height: 18, strokeWidth: 1.9 })
                      ),
                      React.createElement("input", {
                        className: "playground-tasks-project-modal-name-input",
                        value: composerDraft.name,
                        onChange: (event) => updateServerComposerField("name", event.target.value),
                        placeholder: composerNamePlaceholder,
                        autoFocus: true,
                        disabled: serverComposerSaveState.isSaving,
                      })
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: closeServerComposer,
                      title: "Close",
                      disabled: serverComposerSaveState.isSaving,
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-environment-composer-modal-body" },
                    React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-modal-description" },
                      React.createElement("div", { className: "playground-tasks-detail-section-header" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                        React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                          [
                            { id: "bold", label: "Bold", icon: Bold },
                            { id: "italic", label: "Italic", icon: Italic },
                            { id: "underline", label: "Underline", icon: Underline },
                            { id: "list", label: "List", icon: List },
                          ].map((action) =>
                            React.createElement("button", {
                              key: action.id,
                              type: "button",
                              className: "playground-tasks-detail-format-button",
                              title: action.label,
                              "aria-label": action.label,
                              disabled: serverComposerSaveState.isSaving,
                              onMouseDown: (event) => event.preventDefault(),
                              onClick: () => handleServerComposerDescriptionFormat(action.id),
                            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isServerComposerDescriptionEditing ? " is-editing" : " is-preview") },
                        !isServerComposerDescriptionEditing
                          ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                              String(composerDraft.description || "").trim()
                                ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                    content: composerDraft.description,
                                    className: "playground-tasks-detail-description-preview tb-message-markdown",
                                  })
                                : React.createElement("div", {
                                    className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                  }, composerDescriptionPlaceholder)
                            )
                          : null,
                        React.createElement("textarea", {
                          ref: serverComposerDescriptionTextareaRef,
                          className: "playground-tasks-detail-description-input " + (isServerComposerDescriptionEditing ? "is-editing" : "is-preview"),
                          rows: 1,
                          placeholder: isServerComposerDescriptionEditing ? composerDescriptionPlaceholder : "",
                          value: composerDraft.description || "",
                          disabled: serverComposerSaveState.isSaving,
                          onFocus: () => setIsServerComposerDescriptionEditing(true),
                          onChange: (event) => {
                            updateServerComposerField("description", event.target.value);
                            resizeEnvironmentDescriptionTextarea(event.currentTarget);
                          },
                          onBlur: () => setIsServerComposerDescriptionEditing(false),
                        })
                      )
                    ),
                    React.createElement("div", { className: "playground-environments-editor-surface" },
                      React.createElement("div", { className: "playground-tasks-detail-facts playground-environments-editor-facts" },
                          React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Kind"),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              React.createElement("select", {
                                className: "playground-environments-input playground-tasks-detail-fact-select",
                                value: composerDraft.kind,
                                disabled: serverComposerSaveState.isSaving,
                                onChange: (event) => updateServerComposerField("kind", event.target.value),
                              },
                                React.createElement("option", { value: "web_app" }, "Web App"),
                                React.createElement("option", { value: "function" }, "Function"),
                                React.createElement("option", { value: "database" }, "Database"),
                                React.createElement("option", { value: "api" }, "API"),
                                React.createElement("option", { value: "auth" }, "Auth"),
                                React.createElement("option", { value: "agent_runtime" }, "Agent Runtime"),
                                React.createElement("option", { value: "secrets" }, "Secrets"),
                                React.createElement("option", { value: "payments" }, "Payments")
                              )
                            )
                          ),
                          composerKind === "web_app"
                            ? React.createElement("div", { className: "playground-tasks-detail-fact" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Template"),
                                React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                  React.createElement("select", {
                                    className: "playground-environments-input playground-tasks-detail-fact-select",
                                    value: composerDraft.template || "blank",
                                    disabled: serverComposerSaveState.isSaving,
                                    onChange: (event) => updateServerComposerField("template", event.target.value),
                                  },
                                    React.createElement("option", { value: "blank" }, "Blank Web App"),
                                    React.createElement("option", { value: "ai_chat_app" }, "AI Chat App")
                                  )
                                )
                              )
                            : null,
                          isAiChatAppTemplate
                            ? React.createElement("div", { className: "playground-tasks-detail-fact" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Agent"),
                                React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                  React.createElement("select", {
                                    className: "playground-environments-input playground-tasks-detail-fact-select",
                                    value: composerDraft.templateAgentId || "",
                                    disabled: serverComposerSaveState.isSaving,
                                    onChange: (event) => updateServerComposerField("templateAgentId", event.target.value),
                                  },
                                    React.createElement("option", { value: "" }, serverAgentOptionsLoading ? "Loading agents..." : "Choose agent"),
                                    orderedComposerAgentOptions.map((agent) =>
                                      React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.id)
                                    )
                                  )
                                )
                              )
                            : null,
                          isAiChatAppTemplate
                            ? React.createElement("div", { className: "playground-tasks-detail-fact" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Computer"),
                                React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                  React.createElement("select", {
                                    className: "playground-environments-input playground-tasks-detail-fact-select",
                                    value: composerDraft.templateEnvironmentId || "",
                                    disabled: serverComposerSaveState.isSaving,
                                    onChange: (event) => updateServerComposerField("templateEnvironmentId", event.target.value),
                                  },
                                    React.createElement("option", { value: "" }, orderedEnvironments.length === 0 ? "No computers available" : "Choose computer"),
                                    orderedEnvironments.map((environment) =>
                                      React.createElement("option", { key: environment.id, value: environment.id }, environment.name || environment.id)
                                    )
                                  )
                                )
                              )
                            : null,
                          isDatabaseComposer
                            ? React.createElement("div", { className: "playground-tasks-detail-fact" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Location"),
                                React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                  React.createElement("input", {
                                    type: "text",
                                    className: "playground-environments-input playground-tasks-detail-fact-select",
                                    value: composerDraft.databaseLocation || "eur3",
                                    disabled: serverComposerSaveState.isSaving,
                                    onChange: (event) => updateServerDatabaseField("databaseLocation", event.target.value, "composer"),
                                    placeholder: "eur3",
                                  })
                                )
                              )
  	                          : !isAuthComposer && !isAgentRuntimeComposer && !isSecretsComposer && !isPaymentsComposer
                              ? React.createElement("div", { className: "playground-tasks-detail-fact" },
                                  React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Auth"),
                                  React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                    React.createElement("select", {
                                      className: "playground-environments-input playground-tasks-detail-fact-select",
                                      value: composerDraft.authMode,
                                      disabled: serverComposerSaveState.isSaving,
                                      onChange: (event) => updateServerComposerField("authMode", event.target.value),
                                    },
                                      React.createElement("option", { value: "public" }, "Public"),
                                      React.createElement("option", { value: "private" }, "Private")
                                    )
                                )
                              )
                            : null,
                          isAiChatAppTemplate
                            ? React.createElement("div", { className: "playground-tasks-detail-fact" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Database Location"),
                                React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                  React.createElement("input", {
                                    type: "text",
                                    className: "playground-environments-input playground-tasks-detail-fact-select",
                                    value: composerDraft.databaseLocation || "eur3",
                                    disabled: serverComposerSaveState.isSaving,
                                    onChange: (event) => updateServerDatabaseField("databaseLocation", event.target.value, "composer"),
                                    placeholder: "eur3",
                                  })
                                )
                              )
                            : null,
                          !isDatabaseComposer
                            && !isAuthComposer
                            && !isAgentRuntimeComposer
                            && !isSecretsComposer
                            && !isPaymentsComposer
                            ? React.createElement("div", { className: "playground-tasks-detail-fact" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Region"),
                                React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                  React.createElement("input", {
                                    type: "text",
                                    className: "playground-environments-input playground-tasks-detail-fact-select",
                                    value: composerDraft.region || "",
                                    disabled: serverComposerSaveState.isSaving,
                                    onChange: (event) => updateServerComposerField("region", event.target.value),
                                    placeholder: "europe-west1",
                                  })
                                )
                              )
                            : null,
                        )
                      )
                    )
                  ),
                  serverComposerSaveState.error
                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, serverComposerSaveState.error)
                    : null,
                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: closeServerComposer,
                      disabled: serverComposerSaveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "submit",
                      className: "playground-environments-action-button is-primary",
                      disabled: serverComposerSaveState.isSaving || !String(composerDraft.name || "").trim() || (isAiChatAppTemplate && (!String(composerDraft.templateAgentId || "").trim() || !String(composerDraft.templateEnvironmentId || "").trim())),
                    }, serverComposerSaveState.isSaving ? "Creating..." : (
                      isDatabaseComposer
                        ? "Create Database"
                        : isSecretsComposer
                          ? "Create Secrets"
                        : isPaymentsComposer
                          ? "Create Payments"
                        : (isAiChatAppTemplate ? "Create AI Chat App" : "Create")
                    ))
                  )
                )
              );
          }
  

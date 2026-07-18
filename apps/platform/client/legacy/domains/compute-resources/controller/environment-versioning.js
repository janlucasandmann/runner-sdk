          function clearEnvironmentAutosaveQueue() {
            if (environmentAutosaveTimerRef.current) {
              window.clearTimeout(environmentAutosaveTimerRef.current);
              environmentAutosaveTimerRef.current = null;
            }
            environmentAutosaveQueuedRef.current = null;
          }
  
          async function saveDraftEnvironmentImmediate(options = {}) {
            if (!draftEnvironment) {
              return null;
            }
            const normalizedEnvironment = normalizePlaygroundEnvironmentRecord(draftEnvironment);
            clearEnvironmentAutosaveQueue();
            editorDirtyRef.current = false;
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
            try {
              const savedEnvironment = await persistEnvironmentRecord(normalizedEnvironment);
              setEnvironmentDetailsById((current) => ({
                ...current,
                [savedEnvironment.id]: savedEnvironment,
              }));
              setSelectedEnvironmentId(savedEnvironment.id);
              setDraftEnvironment(savedEnvironment);
              setModifiedSecrets({});
              setModifiedMcpTokens({});
              setSaveState({
                isSaving: false,
                error: "",
                message: options.successMessage || "Saved",
              });
              if (onEnvironmentMutated) {
                await onEnvironmentMutated();
              }
              return savedEnvironment;
            } catch (error) {
              setSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : (options.errorMessage || "Failed to save computer."),
                message: "",
              });
              return null;
            }
          }
  
          function formatEnvironmentVersionTimestamp(value) {
            if (!value) return "Not published yet";
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "Not published yet";
            return date.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
  
          function getEnvironmentVersionMetadata(environmentRecord = draftEnvironment) {
            return environmentVersionController.getMetadata(environmentRecord);
          }
  
          function readDraftEnvironmentVersions(environmentRecord = draftEnvironment) {
            return environmentVersionController.readVersions(environmentRecord);
          }
  
          function getDraftEnvironmentActiveVersion(environmentRecord = draftEnvironment) {
            return environmentVersionController.getActiveVersion(environmentRecord);
          }
  
          function getDraftEnvironmentSelectedVersion(environmentRecord = draftEnvironment) {
            return environmentVersionController.getSelectedVersion(environmentRecord);
          }
  
          function getEnvironmentVersionActor() {
            return normalizePlaygroundVersionActor({
              id: currentUserId || currentUserEmail || "local-user",
              name: currentUserName || currentUserEmail || "User",
              email: currentUserEmail,
              avatarUrl: currentUserAvatarUrl,
            });
          }
  
          function getEnvironmentVersionActorLabel(actor) {
            const normalizedActor = normalizePlaygroundVersionActor(actor);
            if (!normalizedActor) {
              return "";
            }
            return String(normalizedActor.name || normalizedActor.email || normalizedActor.id || "").trim();
          }
  
          function getEnvironmentVersionLifecycleLabel(version) {
            const lifecycleState = String(version?.lifecycleState || version?.lifecycle_state || "").trim().toLowerCase();
            if (lifecycleState === "published" || String(version?.status || "").trim().toLowerCase() === "active") return "Published";
            if (lifecycleState === "deprecated" || String(version?.status || "").trim().toLowerCase() === "superseded") return "Superseded";
            if (lifecycleState === "unpublished" || String(version?.status || "").trim().toLowerCase() === "unpublished") return "Unpublished";
            if (lifecycleState === "archived") return "Archived";
            if (lifecycleState === "draft") return "Draft";
            return "Saved";
          }
  
          function getEnvironmentVersioningMetadata(environmentRecord) {
            const metadata = getEnvironmentMetadataRecord(environmentRecord);
            const versioning = metadata.runnerVersioning || metadata.runner_versioning || metadata.versioning || {};
            return versioning && typeof versioning === "object" && !Array.isArray(versioning) ? versioning : {};
          }
  
          function getEnvironmentVersioningRevisionId(environmentRecord) {
            const versioning = getEnvironmentVersioningMetadata(environmentRecord);
            return String(versioning.revisionId || versioning.revision_id || "").trim();
          }
  
          function getEnvironmentVersioningRevisionNumber(environmentRecord) {
            const versioning = getEnvironmentVersioningMetadata(environmentRecord);
            return Number(versioning.revisionNumber || versioning.revision_number || 0) || 0;
          }
  
          function buildEnvironmentVersioningMetadata(environmentRecord, options = {}) {
            const now = new Date().toISOString();
            const metadata = getEnvironmentMetadataRecord(environmentRecord);
            const currentVersioning = getEnvironmentVersioningMetadata(environmentRecord);
            const actor = normalizePlaygroundVersionActor(options.actor) || getEnvironmentVersionActor();
            const operation = String(options.operation || "save-current").trim() || "save-current";
            const activeVersion = getDraftEnvironmentActiveVersion(environmentRecord);
            const selectedVersion = getDraftEnvironmentSelectedVersion(environmentRecord);
            const previousRevisionId = String(
              currentVersioning.revisionId
              || currentVersioning.revision_id
              || getEnvironmentVersioningRevisionId(draftEnvironment)
              || getEnvironmentVersioningRevisionId(selectedEnvironmentSnapshot)
              || ""
            ).trim();
            const nextRevisionNumber = Math.max(
              getEnvironmentVersioningRevisionNumber(environmentRecord),
              getEnvironmentVersioningRevisionNumber(draftEnvironment),
              getEnvironmentVersioningRevisionNumber(selectedEnvironmentSnapshot)
            ) + 1;
            const nextRevisionId = createPlaygroundEnvironmentVersionRevisionId();
            const isPublishOperation = operation.includes("publish") || (operation === "initialize" && Boolean(activeVersion));
            const nextState = isPublishOperation
              ? "published"
              : operation.includes("unpublish")
                ? "unpublished"
                : "saved";
            const nextVersioning = {
              ...currentVersioning,
              schemaVersion: 1,
              schema_version: 1,
              resourceType: "computer",
              resource_type: "computer",
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
              const deploymentId = activeVersion.deploymentId || activeVersion.deployment_id || createPlaygroundEnvironmentDeploymentId(activeVersion.id);
              nextMetadata.activeComputerDeployment = {
                id: deploymentId,
                versionId: activeVersion.id,
                version: activeVersion.version,
                status: "published",
                publishedAt: now,
                publishedBy: actor,
              };
              nextMetadata.active_computer_deployment = nextMetadata.activeComputerDeployment;
            }
            if (operation.includes("unpublish")) {
              delete nextMetadata.activeComputerDeployment;
              delete nextMetadata.active_computer_deployment;
            }
            return nextMetadata;
          }
  
          function prepareEnvironmentVersionedRecordForCommit(environmentRecord, options = {}) {
            const normalizedEnvironment = normalizePlaygroundEnvironmentRecord(environmentRecord);
            const nextMetadata = buildEnvironmentVersioningMetadata(normalizedEnvironment, options);
            return normalizePlaygroundEnvironmentRecord({
              ...normalizedEnvironment,
              metadata: nextMetadata,
            });
          }
  
          function normalizeEnvironmentVersionComparableList(value) {
            return (Array.isArray(value) ? value : [])
              .filter((entry) => entry !== null && entry !== undefined && String(typeof entry === "object" ? stringifyPlaygroundVersionComparableValue(entry) : entry).trim())
              .slice()
              .sort((left, right) => stringifyPlaygroundVersionComparableValue(left).localeCompare(stringifyPlaygroundVersionComparableValue(right)));
          }
  
          function buildEnvironmentVersionComparableSnapshot(snapshot) {
            const normalizedSnapshot = normalizePlaygroundEnvironmentVersion({ snapshot }).snapshot;
            return {
              name: normalizedSnapshot.name,
              description: normalizedSnapshot.description,
              computeProfile: normalizedSnapshot.computeProfile,
              runtimes: Object.fromEntries(Object.entries(normalizedSnapshot.runtimes || {}).sort(([left], [right]) => left.localeCompare(right))),
              packages: {
                system: normalizeEnvironmentVersionComparableList(normalizedSnapshot.packages?.system),
                python: normalizeEnvironmentVersionComparableList(normalizedSnapshot.packages?.python),
                node: normalizeEnvironmentVersionComparableList(normalizedSnapshot.packages?.node),
              },
              environmentVariables: normalizeEnvironmentVersionComparableList(
                normalizePlaygroundEnvironmentVariables(normalizedSnapshot.environmentVariables).map((item) => ({
                  key: item.key,
                  value: item.value,
                }))
              ),
              secrets: normalizeEnvironmentVersionComparableList(
                normalizePlaygroundEnvironmentVariables(normalizedSnapshot.secrets).map((item) => ({ key: item.key }))
              ),
              setupScripts: normalizeEnvironmentVersionComparableList(normalizedSnapshot.setupScripts),
              mcpServers: normalizeEnvironmentVersionComparableList(
                normalizePlaygroundMcpServers(normalizedSnapshot.mcpServers).map((server) => ({
                  name: server.name,
                  type: server.type,
                  url: server.url || "",
                  command: server.command || "",
                  enabled: server.enabled !== false,
                }))
              ),
              documentation: normalizeEnvironmentVersionComparableList(
                normalizePlaygroundDocumentationFiles(normalizedSnapshot.documentation).map((file) => ({
                  name: file.name,
                  url: file.url,
                }))
              ),
              internetAccess: normalizedSnapshot.internetAccess !== false,
              guiEnabled: normalizedSnapshot.guiEnabled === true,
              officeAppsEnabled: normalizedSnapshot.officeAppsEnabled === true,
              dockerfileExtensions: normalizedSnapshot.dockerfileExtensions || "",
              baseImage: normalizedSnapshot.baseImage || "",
            };
          }
  
          const environmentVersionController = createPlaygroundVersionController({
            getMetadata: (environmentRecord) => (
              environmentRecord?.metadata && typeof environmentRecord.metadata === "object" && !Array.isArray(environmentRecord.metadata)
                ? environmentRecord.metadata
                : {}
            ),
            readVersions: readPlaygroundEnvironmentVersions,
            normalizeVersions: normalizePlaygroundEnvironmentVersions,
            createVersion: createPlaygroundEnvironmentVersion,
            withVersionList: createPlaygroundEnvironmentWithVersionList,
            fromVersionSnapshot: createPlaygroundEnvironmentFromVersionSnapshot,
            buildSnapshot: buildPlaygroundEnvironmentVersionSnapshot,
            buildComparableSnapshot: buildEnvironmentVersionComparableSnapshot,
            getActiveVersionId: (metadata) => (
              metadata.activeEnvironmentVersionId
              || metadata.active_environment_version_id
              || metadata.activeComputerVersionId
              || metadata.active_computer_version_id
              || ""
            ),
            getSelectedVersionId: (metadata, activeVersion) => (
              metadata.restoredFromEnvironmentVersionId
              || metadata.restored_from_environment_version_id
              || metadata.restoredFromComputerVersionId
              || metadata.restored_from_computer_version_id
              || activeVersion?.id
              || ""
            ),
            updateVersionFromResource: (version, environmentRecord, options = {}) => {
              const now = new Date().toISOString();
              const normalizedVersion = normalizePlaygroundEnvironmentVersion(version || {});
              const snapshot = buildPlaygroundEnvironmentVersionSnapshot(environmentRecord);
              const nextStatus = String(options.status || "saved").trim().toLowerCase() === "active" ? "active" : "saved";
              const actor = normalizePlaygroundVersionActor(options.actor) || getEnvironmentVersionActor();
              const revisionId = createPlaygroundEnvironmentVersionRevisionId();
              const deploymentId = nextStatus === "active" ? (normalizedVersion.deploymentId || normalizedVersion.deployment_id || createPlaygroundEnvironmentDeploymentId(normalizedVersion.id)) : "";
              return normalizePlaygroundEnvironmentVersion({
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
                computeProfile: snapshot.computeProfile,
                runtimes: snapshot.runtimes,
                runtimeCount: Object.keys(snapshot.runtimes || {}).length,
                snapshot,
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            updateVersionMetadata: (version, details = {}) => {
              const normalizedVersion = normalizePlaygroundEnvironmentVersion(version || {});
              const actor = normalizePlaygroundVersionActor(details.actor) || getEnvironmentVersionActor();
              const now = String(details.updatedAt || new Date().toISOString()).trim();
              return normalizePlaygroundEnvironmentVersion({
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
              const normalizedVersion = normalizePlaygroundEnvironmentVersion(version || {});
              const publishedAt = String(options.publishedAt || new Date().toISOString()).trim();
              const actor = normalizePlaygroundVersionActor(options.actor) || getEnvironmentVersionActor();
              const deploymentId = normalizedVersion.deploymentId || normalizedVersion.deployment_id || createPlaygroundEnvironmentDeploymentId(normalizedVersion.id);
              return normalizePlaygroundEnvironmentVersion({
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
              const normalizedVersion = normalizePlaygroundEnvironmentVersion(version || {});
              const supersededAt = String(options.supersededAt || new Date().toISOString()).trim();
              return normalizePlaygroundEnvironmentVersion({
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
              const normalizedVersion = normalizePlaygroundEnvironmentVersion(version || {});
              const unpublishedAt = String(options.unpublishedAt || new Date().toISOString()).trim();
              const actor = normalizePlaygroundVersionActor(options.actor) || getEnvironmentVersionActor();
              return normalizePlaygroundEnvironmentVersion({
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
            applyUnpublishMetadata: (environmentRecord, context = {}) => {
              const nextMetadata = getEnvironmentMetadataRecord(environmentRecord);
              nextMetadata.unpublishedAt = context.unpublishedAt;
              nextMetadata.unpublished_at = context.unpublishedAt;
              delete nextMetadata.publishedAt;
              delete nextMetadata.published_at;
              return {
                ...environmentRecord,
                metadata: nextMetadata,
                publishedAt: "",
              };
            },
          });
  
          function rememberEnvironmentVersionBaseline(environmentRecord = draftEnvironment, options = {}) {
            const didUpdateBaseline = environmentVersionController.rememberBaseline(environmentRecord, environmentVersionBaselineRef, options);
            if (didUpdateBaseline) {
              environmentVersionDraftTouchedRef.current = false;
            }
          }
  
          function hasDraftEnvironmentVersionChanges() {
            return environmentVersionController.hasDraftChanges(draftEnvironment, environmentVersionBaselineRef, {
              touched: environmentVersionDraftTouchedRef.current,
            });
          }
  
          function canPublishEnvironmentVersion(version) {
            const normalizedVersionId = String(version?.id || "").trim();
            if (!normalizedVersionId) return false;
            const selectedVersion = getDraftEnvironmentSelectedVersion();
            const hasChanges = hasDraftEnvironmentVersionChanges();
            const isActiveVersion = String(version?.status || "").toLowerCase() === "active";
            if (isActiveVersion) {
              return Boolean(selectedVersion?.id === normalizedVersionId && hasChanges);
            }
            return !hasChanges;
          }
  
          function getEnvironmentVersionPopupActions(options = {}) {
            const includeVersionHistory = options.includeVersionHistory === true;
            const environmentVersionHasChanges = hasDraftEnvironmentVersionChanges();
            const actions = [
              {
                id: "save-new-version",
                label: "Save to new Version",
                Icon: GitBranchPlus,
                shortcut: "⇧⌘S",
                disabled: !environmentVersionHasChanges,
                onClick: () => openCreateEnvironmentVersionModal(),
              },
              {
                id: "revert",
                label: "Revert to last saved Version",
                Icon: Undo2,
                disabled: !environmentVersionHasChanges,
                onClick: handleRevertDraft,
              },
            ];
            if (includeVersionHistory) {
              actions.push({
                id: "version-history",
                label: "Version history",
                Icon: History,
                disabled: false,
                onClick: () => {
                  setEnvironmentPublishMenuOpen(false);
                  setEnvironmentVersionSelectorMenuOpen(false);
                  setEnvironmentVersionsHeaderMenuOpen(false);
                  openEnvironmentVersionChangesPage();
                },
              });
            }
            return actions;
          }
  
          async function commitVersionedEnvironmentRecord(nextEnvironment, options = {}) {
            const normalizedNextEnvironment = normalizePlaygroundEnvironmentRecord(nextEnvironment);
            const loadingMessage = options.loadingMessage || "Saving computer version...";
            clearEnvironmentAutosaveQueue();
            editorDirtyRef.current = false;
            setEnvironmentVersionState({
              status: "loading",
              message: loadingMessage,
              error: "",
            });
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              const versionedNextEnvironment = prepareEnvironmentVersionedRecordForCommit(normalizedNextEnvironment, {
                ...options,
                actor: options.actor || getEnvironmentVersionActor(),
              });
              const savedEnvironment = await persistEnvironmentRecord(versionedNextEnvironment);
              const savedHasVersionMetadata = readPlaygroundEnvironmentVersions(savedEnvironment).length > 0
                || Boolean(
                  savedEnvironment?.metadata?.activeEnvironmentVersionId
                  || savedEnvironment?.metadata?.active_environment_version_id
                  || savedEnvironment?.metadata?.activeComputerVersionId
                  || savedEnvironment?.metadata?.active_computer_version_id
              );
              const mergedSavedEnvironment = normalizePlaygroundEnvironmentRecord({
                ...versionedNextEnvironment,
                ...savedEnvironment,
                metadata: savedHasVersionMetadata ? savedEnvironment.metadata : versionedNextEnvironment.metadata,
                publishedAt: savedEnvironment?.publishedAt || versionedNextEnvironment.publishedAt || "",
              });
              setEnvironmentDetailsById((current) => ({
                ...current,
                [mergedSavedEnvironment.id]: mergedSavedEnvironment,
              }));
              setSelectedEnvironmentId(mergedSavedEnvironment.id);
              setDraftEnvironment(mergedSavedEnvironment);
              rememberEnvironmentVersionBaseline(mergedSavedEnvironment, { force: true });
              setOpenEnvironmentVersionMenuId("");
              setModifiedSecrets({});
              setModifiedMcpTokens({});
              setSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
              setEnvironmentVersionState({
                status: "success",
                message: options.successMessage || "Saved",
                error: "",
              });
              if (onEnvironmentMutated) {
                await onEnvironmentMutated();
              }
              window.setTimeout(() => {
                setEnvironmentVersionState((current) => current.status === "success"
                  ? { status: "idle", message: "", error: "" }
                  : current
                );
              }, 1800);
              return mergedSavedEnvironment;
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : (options.errorMessage || "Failed to save computer version.");
              setSaveState({
                isSaving: false,
                error: errorMessage,
                message: "",
              });
              setEnvironmentVersionState({
                status: "error",
                message: "",
                error: errorMessage,
              });
              return null;
            }
          }
  
          function toggleEnvironmentVersionsSidebar() {
            if (!draftEnvironment?.id || draftEnvironment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
            setEnvironmentActionsPopoverOpen(false);
            setEnvironmentPublishMenuOpen(false);
            setEnvironmentVersionSelectorMenuOpen(false);
            setEnvironmentVersionsHeaderMenuOpen(false);
            setOpenEnvironmentVersionMenuId("");
            setEnvironmentVersionState((current) => current.status === "loading" ? current : {
              status: "idle",
              message: "",
              error: "",
            });
            setEnvironmentVersionsSidebarOpen((current) => !current);
          }
  
          function closeEnvironmentVersionsSidebar() {
            setEnvironmentVersionsSidebarOpen(false);
            setEnvironmentPublishMenuOpen(false);
            setEnvironmentVersionSelectorMenuOpen(false);
            setEnvironmentVersionsHeaderMenuOpen(false);
            finishCloseEnvironmentVersionModal();
            setEnvironmentVersionChangesState(null);
            setOpenEnvironmentVersionMenuId("");
          }
  
          function cancelEnvironmentVersionModalAnimation() {
            if (environmentVersionModalCloseTimerRef.current) {
              window.clearTimeout(environmentVersionModalCloseTimerRef.current);
              environmentVersionModalCloseTimerRef.current = null;
            }
            if (environmentVersionModalFrameRef.current) {
              window.cancelAnimationFrame(environmentVersionModalFrameRef.current);
              environmentVersionModalFrameRef.current = null;
            }
          }
  
          function finishCloseEnvironmentVersionModal() {
            cancelEnvironmentVersionModalAnimation();
            setEnvironmentVersionModal(null);
            setEnvironmentVersionModalVisible(false);
            setEnvironmentVersionModalClosing(false);
            setEnvironmentVersionNameDraft("");
            setEnvironmentVersionDescriptionDraft("");
            setIsEnvironmentVersionDescriptionEditing(false);
          }
  
          function openEnvironmentVersionModal(nextModal, draft = {}) {
            if (!draftEnvironment || environmentVersionState.status === "loading" || saveState.isSaving) {
              return;
            }
            cancelEnvironmentVersionModalAnimation();
            setEnvironmentPublishMenuOpen(false);
            setEnvironmentVersionSelectorMenuOpen(false);
            setEnvironmentVersionsHeaderMenuOpen(false);
            setOpenEnvironmentVersionMenuId("");
            setEnvironmentVersionState((current) => current.status === "loading" ? current : {
              status: "idle",
              message: "",
              error: "",
            });
            setEnvironmentVersionNameDraft(String(draft.name || "").trim());
            setEnvironmentVersionDescriptionDraft(String(draft.description || ""));
            setIsEnvironmentVersionDescriptionEditing(false);
            setEnvironmentVersionModal(nextModal);
            setEnvironmentVersionModalClosing(false);
            setEnvironmentVersionModalVisible(false);
            environmentVersionModalFrameRef.current = window.requestAnimationFrame(() => {
              environmentVersionModalFrameRef.current = window.requestAnimationFrame(() => {
                environmentVersionModalFrameRef.current = null;
                setEnvironmentVersionModalVisible(true);
              });
            });
          }
  
          function openCreateEnvironmentVersionModal(options = {}) {
            if (!draftEnvironment || environmentVersionState.status === "loading" || saveState.isSaving) {
              return;
            }
            const forceNewVersion = Boolean(options.force);
            if (!forceNewVersion && !hasDraftEnvironmentVersionChanges()) {
              return;
            }
            const versions = readDraftEnvironmentVersions();
            const nextVersion = versions.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), 0) + 1;
            openEnvironmentVersionModal(
              { mode: "create", force: forceNewVersion },
              {
                name: "Version " + nextVersion,
                description: "",
              }
            );
          }
  
          function openEditEnvironmentVersionModal(versionId) {
            if (!draftEnvironment || environmentVersionState.status === "loading" || saveState.isSaving) {
              return;
            }
            const normalizedVersionId = String(versionId || "").trim();
            const versions = readDraftEnvironmentVersions();
            const targetVersion = versions.find((version) => version.id === normalizedVersionId);
            if (!targetVersion) {
              return;
            }
            openEnvironmentVersionModal(
              { mode: "edit", versionId: targetVersion.id },
              {
                name: String(targetVersion.label || ("Version " + targetVersion.version)).trim(),
                description: String(targetVersion.description || ""),
              }
            );
          }
  
          function closeEnvironmentVersionModal(options = {}) {
            if (saveState.isSaving || environmentVersionState.status === "loading") {
              return;
            }
            if (options.animate === false) {
              finishCloseEnvironmentVersionModal();
              return;
            }
            if (!environmentVersionModal || environmentVersionModalClosing) {
              return;
            }
            cancelEnvironmentVersionModalAnimation();
            setEnvironmentVersionModalVisible(false);
            setEnvironmentVersionModalClosing(true);
            environmentVersionModalCloseTimerRef.current = window.setTimeout(() => {
              environmentVersionModalCloseTimerRef.current = null;
              finishCloseEnvironmentVersionModal();
            }, typeof PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS === "number" ? PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS : 75);
          }
  
          async function saveEnvironmentToNewVersion(options = {}) {
            if (!draftEnvironment || environmentVersionState.status === "loading") {
              return null;
            }
            const forceNewVersion = Boolean(options.force);
            if (!forceNewVersion && !hasDraftEnvironmentVersionChanges()) {
              return null;
            }
            const actor = getEnvironmentVersionActor();
            const result = environmentVersionController.buildNewVersionResource(draftEnvironment, {
              label: options.label,
              description: options.description,
              actor,
            });
            if (!result?.resource) {
              return null;
            }
            return await commitVersionedEnvironmentRecord(result.resource, {
              operation: "save-new-version",
              actor,
              loadingMessage: "Saving new version...",
              successMessage: "New version saved",
              errorMessage: "Failed to save new version.",
            });
          }
  
          async function updateEnvironmentVersionDetails(versionId, versionDetails = {}) {
            if (!draftEnvironment || environmentVersionState.status === "loading") {
              return null;
            }
            const actor = getEnvironmentVersionActor();
            const result = environmentVersionController.buildVersionMetadataResource(draftEnvironment, versionId, {
              ...versionDetails,
              actor,
            });
            if (!result?.resource) {
              return null;
            }
            return await commitVersionedEnvironmentRecord(result.resource, {
              operation: "edit-version",
              actor,
              loadingMessage: "Saving version details...",
              successMessage: "Version details saved",
              errorMessage: "Failed to save version details.",
            });
          }
  
          async function commitEnvironmentVersionModal() {
            if (!environmentVersionModal || saveState.isSaving || environmentVersionState.status === "loading") {
              return;
            }
            const label = String(environmentVersionNameDraft || "").trim() || "Version";
            const description = String(environmentVersionDescriptionDraft || "").trim();
            const savedEnvironment = environmentVersionModal.mode === "edit"
              ? await updateEnvironmentVersionDetails(environmentVersionModal.versionId, { label, description })
              : await saveEnvironmentToNewVersion({
                  force: Boolean(environmentVersionModal.force),
                  label,
                  description,
                });
            if (savedEnvironment) {
              closeEnvironmentVersionModal();
            }
          }
  
          async function saveAndPublishCurrentEnvironmentVersion() {
            if (!draftEnvironment || saveState.isSaving || environmentVersionState.status === "loading") {
              return;
            }
            if (!hasDraftEnvironmentVersionChanges()) {
              return;
            }
            const selectedVersion = getDraftEnvironmentSelectedVersion();
            const actor = getEnvironmentVersionActor();
            const publishResult = selectedVersion
              ? environmentVersionController.buildPublishSelectedResource(draftEnvironment, {
                  actor,
                  updateFromResource: true,
                })
              : (() => {
                  const saveResult = environmentVersionController.buildSaveCurrentResource(draftEnvironment, { status: "saved", actor });
                  if (!saveResult?.resource) {
                    return null;
                  }
                  return environmentVersionController.buildPublishSelectedResource(saveResult.resource, {
                    actor,
                    updateFromResource: true,
                  });
                })();
            if (!publishResult?.resource) {
              return;
            }
            setEnvironmentPublishMenuOpen(false);
            setEnvironmentVersionSelectorMenuOpen(false);
            setEnvironmentVersionsHeaderMenuOpen(false);
            await commitVersionedEnvironmentRecord(publishResult.resource, {
              operation: "save-publish",
              actor,
              loadingMessage: "Saving & publishing computer...",
              successMessage: "Saved & published",
              errorMessage: "Failed to save and publish computer.",
            });
          }
  
          async function restoreEnvironmentVersion(versionId) {
            if (!draftEnvironment || environmentVersionState.status === "loading") {
              return;
            }
            const result = environmentVersionController.buildRestoreVersionResource(draftEnvironment, versionId);
            if (!result?.resource) {
              return;
            }
            await commitVersionedEnvironmentRecord(result.resource, {
              operation: "restore",
              actor: getEnvironmentVersionActor(),
              loadingMessage: "Restoring computer version...",
              successMessage: "Version restored",
              errorMessage: "Failed to restore computer version.",
            });
          }
  
          async function publishEnvironmentVersion(versionId) {
            if (!draftEnvironment || environmentVersionState.status === "loading") {
              return;
            }
            const targetVersion = readDraftEnvironmentVersions().find((version) => version.id === String(versionId || "").trim());
            const selectedVersion = getDraftEnvironmentSelectedVersion();
            const hasChanges = hasDraftEnvironmentVersionChanges();
            const shouldRepublishCurrentEditor = Boolean(
              targetVersion
              && targetVersion.status === "active"
              && selectedVersion?.id === targetVersion.id
              && hasChanges
            );
            if (hasChanges && !shouldRepublishCurrentEditor) {
              setEnvironmentVersionState({
                status: "error",
                message: "",
                error: "Save the current version before publishing.",
              });
              return;
            }
            if (!canPublishEnvironmentVersion(targetVersion)) {
              return;
            }
            const actor = getEnvironmentVersionActor();
            const result = environmentVersionController.buildPublishVersionResource(draftEnvironment, versionId, {
              actor,
              updateFromResource: shouldRepublishCurrentEditor,
            });
            if (!result?.resource) {
              return;
            }
            await commitVersionedEnvironmentRecord(result.resource, {
              operation: "publish-version",
              actor,
              loadingMessage: "Publishing computer version...",
              successMessage: "Published",
              errorMessage: "Failed to publish computer version.",
            });
          }
  
          async function deleteEnvironmentVersion(versionId) {
            if (!draftEnvironment || environmentVersionState.status === "loading") {
              return;
            }
            if (readDraftEnvironmentVersions().length <= 1) {
              return;
            }
            const result = environmentVersionController.buildDeleteVersionResource(draftEnvironment, versionId);
            if (!result?.resource) {
              return;
            }
            if (!window.confirm("Delete this computer version?")) {
              return;
            }
            await commitVersionedEnvironmentRecord(result.resource, {
              operation: "delete-version",
              actor: getEnvironmentVersionActor(),
              loadingMessage: "Deleting computer version...",
              successMessage: "Version deleted",
              errorMessage: "Failed to delete computer version.",
            });
          }
  
          async function unpublishActiveEnvironmentVersion() {
            if (!draftEnvironment || environmentVersionState.status === "loading") {
              return;
            }
            const actor = getEnvironmentVersionActor();
            const result = environmentVersionController.buildUnpublishActiveResource(draftEnvironment, { actor });
            if (!result?.resource) {
              return;
            }
            if (!window.confirm("Unpublish this computer? Version history will be kept.")) {
              return;
            }
            await commitVersionedEnvironmentRecord(result.resource, {
              operation: "unpublish",
              actor,
              loadingMessage: "Unpublishing computer...",
              successMessage: "Unpublished",
              errorMessage: "Failed to unpublish computer.",
            });
          }
  
          function buildEnvironmentVersionConfigDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundEnvironmentVersion({ snapshot }).snapshot;
            const profile = getPlaygroundEnvironmentComputeProfileConfig(normalizedSnapshot.computeProfile);
            return {
              name: normalizedSnapshot.name,
              description: normalizedSnapshot.description,
              computeProfile: {
                id: normalizedSnapshot.computeProfile,
                label: profile?.label || normalizedSnapshot.computeProfile || "",
              },
              internetAccess: normalizedSnapshot.internetAccess !== false,
              guiEnabled: normalizedSnapshot.guiEnabled === true,
              officeAppsEnabled: normalizedSnapshot.officeAppsEnabled === true,
              baseImage: normalizedSnapshot.baseImage || "",
            };
          }
  
          function buildEnvironmentVersionRuntimeDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundEnvironmentVersion({ snapshot }).snapshot;
            return Object.fromEntries(Object.entries(normalizedSnapshot.runtimes || {}).sort(([left], [right]) => left.localeCompare(right)));
          }
  
          function buildEnvironmentVersionPackagesDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundEnvironmentVersion({ snapshot }).snapshot;
            return {
              system: normalizeEnvironmentVersionComparableList(normalizedSnapshot.packages?.system),
              python: normalizeEnvironmentVersionComparableList(normalizedSnapshot.packages?.python),
              node: normalizeEnvironmentVersionComparableList(normalizedSnapshot.packages?.node),
            };
          }
  
          function buildEnvironmentVersionVariablesDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundEnvironmentVersion({ snapshot }).snapshot;
            return normalizeEnvironmentVersionComparableList(
              normalizePlaygroundEnvironmentVariables(normalizedSnapshot.environmentVariables).map((item) => ({
                key: item.key,
                value: item.value,
              }))
            );
          }
  
          function buildEnvironmentVersionSecretsDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundEnvironmentVersion({ snapshot }).snapshot;
            return normalizeEnvironmentVersionComparableList(
              normalizePlaygroundEnvironmentVariables(normalizedSnapshot.secrets).map((item) => ({ key: item.key }))
            );
          }
  
          function buildEnvironmentVersionMcpDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundEnvironmentVersion({ snapshot }).snapshot;
            return normalizeEnvironmentVersionComparableList(
              normalizePlaygroundMcpServers(normalizedSnapshot.mcpServers).map((server) => ({
                name: server.name,
                type: server.type,
                url: server.url || "",
                command: server.command || "",
                enabled: server.enabled !== false,
              }))
            );
          }
  
          function buildEnvironmentVersionDocsDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundEnvironmentVersion({ snapshot }).snapshot;
            return normalizeEnvironmentVersionComparableList(
              normalizePlaygroundDocumentationFiles(normalizedSnapshot.documentation).map((file) => ({
                name: file.name,
                url: file.url,
              }))
            );
          }
  
          function buildEnvironmentVersionDiffFilesFromSnapshots(baseSnapshot, targetSnapshot) {
            if (!baseSnapshot || !targetSnapshot) {
              return [];
            }
            const normalizedBaseSnapshot = normalizePlaygroundEnvironmentVersion({ snapshot: baseSnapshot }).snapshot;
            const normalizedTargetSnapshot = normalizePlaygroundEnvironmentVersion({ snapshot: targetSnapshot }).snapshot;
            return [
              createPlaygroundVersionDiffFile({
                id: "config",
                path: "computer/config.json",
                before: buildEnvironmentVersionConfigDiffPayload(normalizedBaseSnapshot),
                after: buildEnvironmentVersionConfigDiffPayload(normalizedTargetSnapshot),
              }),
              createPlaygroundVersionDiffFile({
                id: "runtimes",
                path: "computer/runtimes.json",
                before: buildEnvironmentVersionRuntimeDiffPayload(normalizedBaseSnapshot),
                after: buildEnvironmentVersionRuntimeDiffPayload(normalizedTargetSnapshot),
              }),
              createPlaygroundVersionDiffFile({
                id: "packages",
                path: "computer/packages.json",
                before: buildEnvironmentVersionPackagesDiffPayload(normalizedBaseSnapshot),
                after: buildEnvironmentVersionPackagesDiffPayload(normalizedTargetSnapshot),
              }),
              createPlaygroundVersionDiffFile({
                id: "environment-variables",
                path: "computer/environment-variables.json",
                before: buildEnvironmentVersionVariablesDiffPayload(normalizedBaseSnapshot),
                after: buildEnvironmentVersionVariablesDiffPayload(normalizedTargetSnapshot),
              }),
              createPlaygroundVersionDiffFile({
                id: "secrets",
                path: "computer/secrets.json",
                before: buildEnvironmentVersionSecretsDiffPayload(normalizedBaseSnapshot),
                after: buildEnvironmentVersionSecretsDiffPayload(normalizedTargetSnapshot),
              }),
              createPlaygroundVersionDiffFile({
                id: "setup-scripts",
                path: "computer/setup-scripts.json",
                before: normalizeEnvironmentVersionComparableList(normalizedBaseSnapshot.setupScripts),
                after: normalizeEnvironmentVersionComparableList(normalizedTargetSnapshot.setupScripts),
              }),
              createPlaygroundVersionDiffFile({
                id: "mcp",
                path: "computer/mcp-servers.json",
                before: buildEnvironmentVersionMcpDiffPayload(normalizedBaseSnapshot),
                after: buildEnvironmentVersionMcpDiffPayload(normalizedTargetSnapshot),
              }),
              createPlaygroundVersionDiffFile({
                id: "documentation",
                path: "computer/documentation.json",
                before: buildEnvironmentVersionDocsDiffPayload(normalizedBaseSnapshot),
                after: buildEnvironmentVersionDocsDiffPayload(normalizedTargetSnapshot),
              }),
              createPlaygroundVersionDiffFile({
                id: "dockerfile",
                path: "computer/dockerfile-extension.dockerfile",
                before: normalizedBaseSnapshot.dockerfileExtensions || "",
                after: normalizedTargetSnapshot.dockerfileExtensions || "",
              }),
            ].filter(Boolean);
          }
  
          const ENVIRONMENT_VERSION_COMPARE_CURRENT_EDITOR_ID = "current-editor";
  
          function getEnvironmentVersionCompareVersionSourceId(versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            return normalizedVersionId ? "version:" + normalizedVersionId : "";
          }
  
          function getEnvironmentVersionCompareVersionLabel(version) {
            if (!version) {
              return "Version";
            }
            return String(version.label || ("Version " + version.version)).trim() || "Version";
          }
  
          function buildEnvironmentVersionCompareSources(versions) {
            const normalizedVersions = Array.isArray(versions) ? versions : [];
            return [
              {
                id: ENVIRONMENT_VERSION_COMPARE_CURRENT_EDITOR_ID,
                label: "Current editor",
                snapshot: buildPlaygroundEnvironmentVersionSnapshot(draftEnvironment),
              },
            ].concat(normalizedVersions.map((version) => ({
              id: getEnvironmentVersionCompareVersionSourceId(version.id),
              label: getEnvironmentVersionCompareVersionLabel(version),
              snapshot: normalizePlaygroundEnvironmentVersion(version).snapshot,
            })));
          }
  
          function resolveEnvironmentVersionCompareSource(sourceId, sources, fallbackSource) {
            const normalizedSourceId = String(sourceId || "").trim();
            return sources.find((source) => source.id === normalizedSourceId) || fallbackSource || sources[0] || null;
          }
  
          function getDefaultEnvironmentVersionCompareLeftSourceId(versions) {
            const metadata = getEnvironmentVersionMetadata();
            const activeVersionId = String(
              metadata.activeEnvironmentVersionId
              || metadata.active_environment_version_id
              || metadata.activeComputerVersionId
              || metadata.active_computer_version_id
              || ""
            ).trim();
            const activeVersion = versions.find((version) => version.id === activeVersionId)
              || versions.find((version) => String(version.status || "").toLowerCase() === "active")
              || versions[0];
            return activeVersion ? getEnvironmentVersionCompareVersionSourceId(activeVersion.id) : ENVIRONMENT_VERSION_COMPARE_CURRENT_EDITOR_ID;
          }
  
          function openEnvironmentVersionChangesPage(versionId, options = {}) {
            const normalizedVersionId = String(versionId || "").trim();
            const versions = readDraftEnvironmentVersions();
            if (!versions.length && !draftEnvironment) {
              return;
            }
            const explicitLeftSourceId = String(options.leftSourceId || "").trim();
            const explicitRightSourceId = String(options.rightSourceId || "").trim();
            const fallbackLeftSourceId = normalizedVersionId
              ? getEnvironmentVersionCompareVersionSourceId(normalizedVersionId)
              : getDefaultEnvironmentVersionCompareLeftSourceId(versions);
            const leftSourceId = explicitLeftSourceId || fallbackLeftSourceId;
            const rightSourceId = explicitRightSourceId || ENVIRONMENT_VERSION_COMPARE_CURRENT_EDITOR_ID;
            setOpenEnvironmentVersionMenuId("");
            setEnvironmentVersionsSidebarOpen(true);
            setEnvironmentVersionChangesState({
              leftSourceId,
              rightSourceId,
            });
          }
  
          function closeEnvironmentVersionChangesPage() {
            setEnvironmentVersionChangesState(null);
          }
  
          function handleEnvironmentVersionCompareSourceChange(side, sourceId) {
            const normalizedSourceId = String(sourceId || "").trim() || ENVIRONMENT_VERSION_COMPARE_CURRENT_EDITOR_ID;
            setEnvironmentVersionChangesState((current) => ({
              ...(current || {}),
              [side === "left" ? "leftSourceId" : "rightSourceId"]: normalizedSourceId,
            }));
          }
  
          function applyEnvironmentVersionDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            setEnvironmentVersionDescriptionDraft(nextValue);
            window.requestAnimationFrame(() => {
              const textarea = environmentVersionDescriptionTextareaRef.current;
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
  
          function handleEnvironmentVersionDescriptionFormat(formatType) {
            const textarea = environmentVersionDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const value = String(environmentVersionDescriptionDraft || "");
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
            applyEnvironmentVersionDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function applyEnvironmentSharedTeam(environmentRecord, teamId) {
            const normalizedEnvironment = normalizePlaygroundEnvironmentRecord(environmentRecord || buildPlaygroundDefaultEnvironmentDraft());
            const normalizedTeamId = String(teamId || "").trim();
            if (!normalizedTeamId) {
              return normalizedEnvironment;
            }
            const metadata = getEnvironmentMetadataRecord(normalizedEnvironment);
            const nextTeamIds = Array.from(new Set([
              ...getEnvironmentSharedTeamIds(normalizedEnvironment),
              normalizedTeamId,
            ]));
            metadata.sharedTeamIds = nextTeamIds;
            metadata.teamAccessIds = nextTeamIds;
            return normalizePlaygroundEnvironmentRecord({
              ...normalizedEnvironment,
              metadata,
            });
          }
  
          function buildEnvironmentTeamSharePayload(environmentRecord, teamRecord) {
            const normalizedEnvironment = normalizePlaygroundEnvironmentRecord(environmentRecord || buildPlaygroundDefaultEnvironmentDraft());
            const normalizedTeam = teamRecord && typeof teamRecord === "object" && !Array.isArray(teamRecord) ? teamRecord : {};
            const metadata = getEnvironmentMetadataRecord(normalizedEnvironment);
            const computerSnapshot = {
              id: normalizedEnvironment.id,
              name: normalizedEnvironment.name,
              description: normalizedEnvironment.description || "",
              computeProfile: normalizedEnvironment.computeProfile,
              runtimes: normalizedEnvironment.runtimes || {},
            };
            return {
              resourceType: "computer",
              resourceId: normalizedEnvironment.id,
              resourceName: normalizedEnvironment.name || "Computer",
              accessLevel: "use",
              title: normalizedEnvironment.name || "Computer",
              description: normalizedEnvironment.description || "",
              metadata: {
                ...metadata,
                resourceType: "computer",
                resourceKind: "computer",
                sharedTeamId: normalizedTeam.id || "",
                sharedTeamName: normalizedTeam.name || "",
                computer: computerSnapshot,
                environment: computerSnapshot,
              },
            };
          }
  
          function openEnvironmentShareTeamModal(environmentRecord = null, options = {}) {
            const targetEnvironmentIds = Array.isArray(options?.environmentIds)
              ? options.environmentIds.map((environmentId) => String(environmentId || "").trim()).filter(Boolean)
              : [];
            const targetEnvironments = (targetEnvironmentIds.length > 0
              ? getEnvironmentActionTargetsByIds(targetEnvironmentIds)
              : normalizeEnvironmentActionTargets([environmentRecord || draftEnvironment])
            ).filter((environmentTarget) =>
              environmentTarget?.id
              && environmentTarget.id !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
              && !environmentTarget.isSystem
              && !environmentTarget.isDefault
            );
            if (targetEnvironments.length === 0) {
              return;
            }
            if (typeof onWorkspaceTeamsRequest === "function") {
              onWorkspaceTeamsRequest({});
            }
            if (environmentShareTeamModalCloseTimerRef.current) {
              window.clearTimeout(environmentShareTeamModalCloseTimerRef.current);
              environmentShareTeamModalCloseTimerRef.current = null;
            }
            if (environmentShareTeamModalFrameRef.current) {
              window.cancelAnimationFrame(environmentShareTeamModalFrameRef.current);
              environmentShareTeamModalFrameRef.current = null;
            }
            setEnvironmentShareTeamError("");
            setEnvironmentShareTeamTargetEnvironment(targetEnvironmentIds.length > 0 ? null : targetEnvironments[0]);
            setEnvironmentShareTeamTargetEnvironmentIds(targetEnvironmentIds.length > 0 ? targetEnvironments.map((environmentTarget) => environmentTarget.id) : []);
            setEnvironmentShareTeamPickerValue(getDefaultEnvironmentShareTeamIdForEnvironments(targetEnvironments));
            setEnvironmentShareTeamModalVisible(false);
            setEnvironmentShareTeamModalClosing(false);
            setEnvironmentShareTeamModalOpen(true);
            environmentShareTeamModalFrameRef.current = window.requestAnimationFrame(() => {
              environmentShareTeamModalFrameRef.current = window.requestAnimationFrame(() => {
                environmentShareTeamModalFrameRef.current = null;
                setEnvironmentShareTeamModalVisible(true);
              });
            });
          }
  
          function finishCloseEnvironmentShareTeamModal() {
            if (environmentShareTeamModalCloseTimerRef.current) {
              window.clearTimeout(environmentShareTeamModalCloseTimerRef.current);
              environmentShareTeamModalCloseTimerRef.current = null;
            }
            if (environmentShareTeamModalFrameRef.current) {
              window.cancelAnimationFrame(environmentShareTeamModalFrameRef.current);
              environmentShareTeamModalFrameRef.current = null;
            }
            setEnvironmentShareTeamModalVisible(false);
            setEnvironmentShareTeamModalClosing(false);
            setEnvironmentShareTeamModalOpen(false);
            setEnvironmentShareTeamTargetEnvironment(null);
            setEnvironmentShareTeamTargetEnvironmentIds([]);
            setEnvironmentShareTeamPickerValue("");
            setEnvironmentShareTeamError("");
            setEnvironmentShareTeamState({
              teamId: "",
              action: "",
              error: "",
            });
          }
  
          function closeEnvironmentShareTeamModal(options = {}) {
            if (!options.force && environmentShareTeamState.action === "share") {
              return;
            }
            if (options?.animate === false || (!environmentShareTeamModalOpen && !environmentShareTeamModalVisible && !environmentShareTeamModalClosing)) {
              finishCloseEnvironmentShareTeamModal();
              return;
            }
            if (environmentShareTeamModalClosing) {
              return;
            }
            if (environmentShareTeamModalFrameRef.current) {
              window.cancelAnimationFrame(environmentShareTeamModalFrameRef.current);
              environmentShareTeamModalFrameRef.current = null;
            }
            setEnvironmentShareTeamModalVisible(false);
            setEnvironmentShareTeamModalClosing(true);
            if (environmentShareTeamModalCloseTimerRef.current) {
              window.clearTimeout(environmentShareTeamModalCloseTimerRef.current);
            }
            environmentShareTeamModalCloseTimerRef.current = window.setTimeout(() => {
              environmentShareTeamModalCloseTimerRef.current = null;
              finishCloseEnvironmentShareTeamModal();
            }, 75);
          }
  
          async function handleEnvironmentShareTeamSubmit(event) {
            event.preventDefault();
            const targetEnvironments = getEnvironmentShareTeamTargets()
              .filter((environmentTarget) =>
                environmentTarget?.id
                && environmentTarget.id !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
                && !environmentTarget.isSystem
                && !environmentTarget.isDefault
              );
            if (targetEnvironments.length === 0) {
              setEnvironmentShareTeamError("Save this computer before sharing it with a team.");
              return;
            }
            const normalizedTeamId = String(environmentShareTeamPickerValue || "").trim();
            if (!normalizedTeamId) {
              setEnvironmentShareTeamError("Choose a team first.");
              return;
            }
            const shareTargets = targetEnvironments.filter((environmentTarget) => !getEnvironmentSharedTeamIds(environmentTarget).includes(normalizedTeamId));
            if (shareTargets.length === 0) {
              setEnvironmentShareTeamError(targetEnvironments.length > 1 ? "These computers are already shared with that team." : "This computer is already shared with that team.");
              return;
            }
            const selectedTeam = availableEnvironmentShareTeams.find((team) => team.id === normalizedTeamId) || null;
            if (!selectedTeam) {
              setEnvironmentShareTeamError("Choose a team you can manage.");
              return;
            }
            setEnvironmentShareTeamError("");
            setEnvironmentShareTeamState({
              teamId: normalizedTeamId,
              action: "share",
              error: "",
            });
            try {
              for (const targetEnvironment of shareTargets) {
                const payload = buildEnvironmentTeamSharePayload(targetEnvironment, selectedTeam);
                const { response, data } = await fetchJsonWithTimeout(backendUrl + "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares", {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                }, 8000);
                if (!response.ok && Number(response.status || 0) !== 409) {
                  throw new Error(data?.message || data?.error || "Failed to share computer with team.");
                }
                const nextEnvironment = applyEnvironmentSharedTeam(targetEnvironment, normalizedTeamId);
                const savedEnvironment = await persistEnvironmentRecord(nextEnvironment);
                const mergedEnvironment = normalizePlaygroundEnvironmentRecord({
                  ...nextEnvironment,
                  ...savedEnvironment,
                  metadata: savedEnvironment?.metadata || nextEnvironment.metadata,
                });
                setEnvironmentDetailsById((current) => ({
                  ...current,
                  [mergedEnvironment.id]: mergedEnvironment,
                }));
                if (selectedEnvironmentId === mergedEnvironment.id) {
                  setDraftEnvironment(mergedEnvironment);
                  rememberEnvironmentVersionBaseline(mergedEnvironment, { force: true });
                }
              }
              if (typeof onEnvironmentMutated === "function") {
                await onEnvironmentMutated();
              }
              if (typeof onWorkspaceTeamsRequest === "function") {
                onWorkspaceTeamsRequest({
                  selectedTeamId: normalizedTeamId,
                  teamId: normalizedTeamId,
                });
              }
              closeEnvironmentShareTeamModal({ force: true });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to share computer with team.";
              setEnvironmentShareTeamError(message);
              setEnvironmentShareTeamState({
                teamId: normalizedTeamId,
                action: "",
                error: message,
              });
            }
          }
  
          function renderEnvironmentShareTeamModalElement() {
            if (!environmentShareTeamModalOpen) {
              return null;
            }
            const targetEnvironments = getEnvironmentShareTeamTargets()
              .filter((environmentTarget) =>
                environmentTarget?.id
                && environmentTarget.id !== PLAYGROUND_ENVIRONMENT_DRAFT_ID
                && !environmentTarget.isSystem
                && !environmentTarget.isDefault
              );
            const targetEnvironmentCount = targetEnvironments.length;
            const isSharingEnvironmentToTeam = environmentShareTeamState.action === "share";
            const selectedTeamId = String(environmentShareTeamPickerValue || "").trim();
            const selectedTeamAlreadyShared = targetEnvironmentCount > 0 && targetEnvironments.every((environmentTarget) => getEnvironmentSharedTeamIds(environmentTarget).includes(selectedTeamId));
            const hasManageableTeams = availableEnvironmentShareTeams.length > 0;
            const showTeamsLoading = workspaceTeamsLoading && !hasManageableTeams;
            const selectedTeam = availableEnvironmentShareTeams.find((team) => team.id === environmentShareTeamPickerValue) || null;
            const modal = renderPlaygroundPlatformModal({
              open: environmentShareTeamModalOpen,
              visible: environmentShareTeamModalVisible,
              closing: environmentShareTeamModalClosing,
              onClose: () => closeEnvironmentShareTeamModal(),
              as: "form",
              backdropClassName: "playground-tasks-project-issue-backdrop playground-agents-send-team-modal-backdrop playground-computer-share-team-modal-backdrop",
              className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-agents-send-team-modal playground-computer-share-team-modal",
              ariaLabel: targetEnvironmentCount > 1 ? "Share computers with team" : "Share computer with team",
              surfaceProps: {
                onSubmit: (event) => {
                  void handleEnvironmentShareTeamSubmit(event);
                },
              },
              children: React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-tasks-project-modal-top" },
                  React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                    React.createElement("div", {
                      className: "playground-content-title playground-tasks-project-modal-name-input",
                      style: { display: "flex", alignItems: "center" },
                    }, targetEnvironmentCount > 1 ? "Share " + targetEnvironmentCount + " Computers with Team" : "Share with Team"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: () => closeEnvironmentShareTeamModal(),
                      disabled: isSharingEnvironmentToTeam,
                      title: "Close",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  )
                ),
                React.createElement("div", { className: "playground-tasks-issue-modal-body playground-agents-send-team-modal-body" },
                  showTeamsLoading
                    ? React.createElement("div", { className: "playground-agents-send-team-empty" },
                        React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                        React.createElement("span", null, "Loading teams...")
                      )
                    : workspaceTeamsRequiresPlan
                      ? React.createElement("div", { className: "playground-agents-send-team-empty" }, "Teams are not available on this workspace plan.")
                      : hasManageableTeams
                        ? React.createElement("div", { className: "playground-agents-send-team-list", role: "radiogroup", "aria-label": "Teams" },
                            availableEnvironmentShareTeams.map((team) => {
                              const isSelected = team.id === environmentShareTeamPickerValue;
                              const sharedCount = targetEnvironments.filter((environmentTarget) => getEnvironmentSharedTeamIds(environmentTarget).includes(team.id)).length;
                              const isShared = targetEnvironmentCount > 0 && sharedCount === targetEnvironmentCount;
                              const teamMeta = targetEnvironmentCount > 1
                                ? (sharedCount > 0 ? sharedCount + "/" + targetEnvironmentCount + " already shared" : team.roleLabel)
                                : (isShared ? "Already shared" : team.roleLabel);
                              return React.createElement("button", {
                                  key: team.id,
                                  type: "button",
                                  className: "playground-agents-send-team-option" + (isSelected ? " is-selected" : "") + (isShared ? " is-shared" : ""),
                                  onClick: () => setEnvironmentShareTeamPickerValue(team.id),
                                  disabled: isSharingEnvironmentToTeam,
                                  role: "radio",
                                  "aria-checked": isSelected ? "true" : "false",
                                },
                                React.createElement("span", { className: "playground-agents-send-team-option-icon", "aria-hidden": "true" },
                                  React.createElement(UsersRound, { width: 15, height: 15, strokeWidth: 1.85 })
                                ),
                                React.createElement("span", { className: "playground-agents-send-team-option-copy" },
                                  React.createElement("span", { className: "playground-agents-send-team-option-title" }, team.name),
                                  React.createElement("span", { className: "playground-agents-send-team-option-meta" }, teamMeta)
                                ),
                                isSelected
                                  ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                                  : null
                              );
                            })
                          )
                        : React.createElement("div", { className: "playground-agents-send-team-empty" }, "No teams are available yet.")
                ),
                environmentShareTeamError
                  ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, environmentShareTeamError)
                  : null,
                React.createElement("div", { className: "playground-tasks-project-modal-actions playground-agents-send-team-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => closeEnvironmentShareTeamModal(),
                    disabled: isSharingEnvironmentToTeam,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                    disabled: isSharingEnvironmentToTeam || !selectedTeam || selectedTeamAlreadyShared,
                  }, isSharingEnvironmentToTeam ? "Sharing..." : "Share")
                )
              )
            });
            return modal && typeof createPortal === "function" && typeof document !== "undefined" && document.body
              ? createPortal(modal, document.body)
              : modal;
          }
  
          function openEnvironmentApiModal() {
            if (!draftEnvironment?.id || draftEnvironment.id === PLAYGROUND_ENVIRONMENT_DRAFT_ID) {
              return;
            }
            if (environmentApiModalCloseTimerRef.current) {
              window.clearTimeout(environmentApiModalCloseTimerRef.current);
              environmentApiModalCloseTimerRef.current = null;
            }
            if (environmentApiModalFrameRef.current) {
              window.cancelAnimationFrame(environmentApiModalFrameRef.current);
              environmentApiModalFrameRef.current = null;
            }
            setCopiedEnvironmentApiSnippet("");
            setEnvironmentApiAgentId((current) => {
              const normalizedCurrent = String(current || "").trim();
              return normalizedCurrent && environmentApiAgentOptions.some((agent) => String(agent?.id || "").trim() === normalizedCurrent)
                ? normalizedCurrent
                : environmentApiDefaultAgentId;
            });
            setEnvironmentApiModalVisible(false);
            setEnvironmentApiModalClosing(false);
            setEnvironmentApiModalOpen(true);
            environmentApiModalFrameRef.current = window.requestAnimationFrame(() => {
              environmentApiModalFrameRef.current = window.requestAnimationFrame(() => {
                environmentApiModalFrameRef.current = null;
                setEnvironmentApiModalVisible(true);
              });
            });
          }
  
          function finishCloseEnvironmentApiModal() {
            if (environmentApiModalCloseTimerRef.current) {
              window.clearTimeout(environmentApiModalCloseTimerRef.current);
              environmentApiModalCloseTimerRef.current = null;
            }
            if (environmentApiModalFrameRef.current) {
              window.cancelAnimationFrame(environmentApiModalFrameRef.current);
              environmentApiModalFrameRef.current = null;
            }
            setEnvironmentApiModalVisible(false);
            setEnvironmentApiModalClosing(false);
            setEnvironmentApiModalOpen(false);
            setCopiedEnvironmentApiSnippet("");
          }
  
          function closeEnvironmentApiModal(options = {}) {
            if (options?.animate === false || (!environmentApiModalOpen && !environmentApiModalVisible && !environmentApiModalClosing)) {
              finishCloseEnvironmentApiModal();
              return;
            }
            if (environmentApiModalClosing) {
              return;
            }
            if (environmentApiModalFrameRef.current) {
              window.cancelAnimationFrame(environmentApiModalFrameRef.current);
              environmentApiModalFrameRef.current = null;
            }
            setEnvironmentApiModalVisible(false);
            setEnvironmentApiModalClosing(true);
            if (environmentApiModalCloseTimerRef.current) {
              window.clearTimeout(environmentApiModalCloseTimerRef.current);
            }
            environmentApiModalCloseTimerRef.current = window.setTimeout(() => {
              environmentApiModalCloseTimerRef.current = null;
              finishCloseEnvironmentApiModal();
            }, 75);
          }
  
          function buildEnvironmentApiSnippets(environmentRecord = draftEnvironment, agentId = environmentApiAgentId) {
            const normalizedEnvironment = normalizePlaygroundEnvironmentRecord(environmentRecord || buildPlaygroundDefaultEnvironmentDraft());
            const apiOrigin = "https://api.computer-agents.com/v1";
            const environmentId = String(normalizedEnvironment.id || "computer_id").trim() || "computer_id";
            const normalizedAgentId = String(agentId || environmentApiDefaultAgentId || "agent_assistant").trim() || "agent_assistant";
            const payload = {
              title: "Run on " + (normalizedEnvironment.name || "Computer"),
              messages: [
                {
                  role: "user",
                  content: "Use this computer to inspect the project and summarize the current state.",
                },
              ],
              agentId: normalizedAgentId,
              environmentId,
            };
            const payloadJson = JSON.stringify(payload, null, 2);
            return {
              curl: [
                "curl -sS -X POST '" + apiOrigin + "/threads' \\",
                "  -H \"Authorization: Bearer $COMPUTER_AGENTS_API_KEY\" \\",
                "  -H 'Content-Type: application/json' \\",
                "  --data '" + payloadJson.replace(/'/g, "'\\''") + "'",
              ].join("\n"),
              python: [
                "import os",
                "import requests",
                "",
                "api_key = os.environ['COMPUTER_AGENTS_API_KEY']",
                "response = requests.post(",
                "    '" + apiOrigin + "/threads',",
                "    headers={",
                "        'Authorization': f'Bearer {api_key}',",
                "        'Content-Type': 'application/json',",
                "    },",
                "    json=" + JSON.stringify(payload, null, 4).replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None") + ",",
                ")",
                "response.raise_for_status()",
                "print(response.json())",
              ].join("\n"),
              javascript: [
                "const apiKey = process.env.COMPUTER_AGENTS_API_KEY;",
                "",
                "const response = await fetch('" + apiOrigin + "/threads', {",
                "  method: 'POST',",
                "  headers: {",
                "    Authorization: 'Bearer ' + apiKey,",
                "    'Content-Type': 'application/json',",
                "  },",
                "  body: JSON.stringify(" + payloadJson.replace(/\n/g, "\n  ") + "),",
                "});",
                "",
                "if (!response.ok) {",
                "  throw new Error(await response.text());",
                "}",
                "",
                "console.log(await response.json());",
              ].join("\n"),
            };
          }
  
          async function copyEnvironmentApiSnippet(snippetKey, snippetValue) {
            try {
              await navigator.clipboard?.writeText(String(snippetValue || ""));
              setCopiedEnvironmentApiSnippet(snippetKey);
              window.setTimeout(() => {
                setCopiedEnvironmentApiSnippet((current) => current === snippetKey ? "" : current);
              }, 1400);
            } catch {
              setCopiedEnvironmentApiSnippet("");
            }
          }
  

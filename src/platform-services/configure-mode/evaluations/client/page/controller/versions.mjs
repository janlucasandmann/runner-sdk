export const EVALUATIONS_PAGE_CONTROLLER_VERSIONS_SCRIPT = String.raw`        function updateEvaluationSet(setId, updater, options = {}) {
          if (typeof setEvaluationSets !== "function") return;
          if (options.markVersionTouched !== false) {
            evaluationVersionDraftTouchedRef.current = true;
          }
          let nextSetForPersistence = null;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalized = normalizePlaygroundEvaluationSet(item);
            if (normalized.id !== setId) {
              return normalized;
            }
            const nextSet = typeof updater === "function" ? updater(normalized) : normalized;
            nextSetForPersistence = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet({ ...nextSet, updatedAt: new Date().toISOString() }));
            return nextSetForPersistence;
          }));
          if (nextSetForPersistence) {
            schedulePersistEvaluationSet(nextSetForPersistence, options);
          }
        }

        function replaceEvaluationSet(nextSet, options = {}) {
          const normalizedNextSet = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(nextSet));
          if (!normalizedNextSet.id || typeof setEvaluationSets !== "function") return normalizedNextSet;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => (
            normalizePlaygroundEvaluationSet(item).id === normalizedNextSet.id ? normalizedNextSet : item
          )));
          if (options.select !== false) {
            setSelectedEvaluationSetId(normalizedNextSet.id);
          }
          if (options.clearRunSelection !== false) {
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
          }
          if (options.rememberBaseline !== false) {
            playgroundEvaluationVersionController.rememberBaseline(normalizedNextSet, evaluationVersionBaselineRef, { force: true });
            evaluationVersionDraftTouchedRef.current = false;
          }
          if (options.persist === true) {
            schedulePersistEvaluationSet(normalizedNextSet, { delayMs: 0 });
          }
          return normalizedNextSet;
        }

        async function persistEvaluationSetToBackend(set) {
          const normalizedSet = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set));
          if (!normalizedSet.id) return null;
          const payload = buildPlaygroundEvaluationBackendPayload(normalizedSet);
          const signature = JSON.stringify(payload);
          if (evaluationSetPersistSignaturesRef.current.get(normalizedSet.id) === signature) {
            return normalizedSet;
          }
          const data = await requestEvaluationBackendJson(
            "/evaluations/" + encodeURIComponent(normalizedSet.id),
            {
              method: "PATCH",
              body: JSON.stringify(payload),
            },
            "Failed to save evaluation."
          );
          evaluationSetPersistSignaturesRef.current.set(normalizedSet.id, signature);
          return normalizePlaygroundEvaluationSet(data?.evaluation || data?.data || data || normalizedSet);
        }

        function schedulePersistEvaluationSet(set, options = {}) {
          const normalizedSet = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set));
          if (!normalizedSet.id || !String(backendUrl || "").trim()) return;
          if (options.persist === false) return;
          const delayMs = Math.max(0, Number(options.delayMs ?? 450) || 0);
          const existingTimer = evaluationSetPersistTimersRef.current.get(normalizedSet.id);
          if (existingTimer) {
            if (typeof window !== "undefined") {
              window.clearTimeout(existingTimer);
            } else {
              clearTimeout(existingTimer);
            }
          }
          const runPersist = () => {
            evaluationSetPersistTimersRef.current.delete(normalizedSet.id);
            void persistEvaluationSetToBackend(normalizedSet).catch((error) => {
              setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            });
          };
          if (delayMs === 0) {
            runPersist();
            return;
          }
          const timer = typeof window !== "undefined"
            ? window.setTimeout(runPersist, delayMs)
            : setTimeout(runPersist, delayMs);
          evaluationSetPersistTimersRef.current.set(normalizedSet.id, timer);
        }

        async function persistEvaluationRunToBackend(run) {
          const normalizedRun = normalizePlaygroundEvaluationRun(run);
          if (!normalizedRun.id) return null;
          const data = await requestEvaluationBackendJson(
            "/evaluations/runs/" + encodeURIComponent(normalizedRun.id),
            {
              method: "PATCH",
              body: JSON.stringify(buildPlaygroundEvaluationRunBackendPayload(normalizedRun)),
            },
            "Failed to save evaluation run."
          );
          return normalizePlaygroundEvaluationRun(data?.run || data?.data || data || normalizedRun);
        }

        async function deleteEvaluationRunFromBackend(runId) {
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedRunId) return false;
          const data = await requestEvaluationBackendJson(
            "/evaluations/runs/" + encodeURIComponent(normalizedRunId),
            { method: "DELETE" },
            "Failed to delete evaluation run."
          );
          return data?.deleted !== false;
        }

        function getEvaluationVersionMetadata(set = activeSet) {
          return playgroundEvaluationVersionController.getMetadata(set);
        }

        function readSelectedEvaluationVersions(set = activeSet) {
          return playgroundEvaluationVersionController.readVersions(set);
        }

        function getSelectedEvaluationActiveVersion(set = activeSet) {
          return playgroundEvaluationVersionController.getActiveVersion(set);
        }

        function getSelectedEvaluationVersion(set = activeSet) {
          return playgroundEvaluationVersionController.getSelectedVersion(set);
        }

        function getEvaluationPublishedRunSource(set = activeSet) {
          if (!set) return null;
          const normalizedSet = normalizePlaygroundEvaluationSet(set);
          if (String(backendUrl || "").trim() && normalizedSet.id && !evaluationDetailsLoadedRef.current.has(normalizedSet.id)) {
            return null;
          }
          const activeVersion = getSelectedEvaluationActiveVersion(normalizedSet);
          if (!activeVersion || activeVersion.status !== "active") {
            return null;
          }
          const versions = readSelectedEvaluationVersions(normalizedSet);
          return {
            version: activeVersion,
            set: createPlaygroundEvaluationFromVersionSnapshot(normalizedSet, activeVersion, versions, activeVersion.id),
          };
        }

        function getEvaluationRunnableCaseCount(set = activeSet) {
          const runSource = getEvaluationPublishedRunSource(set);
          return Array.isArray(runSource?.set?.dataRows) ? runSource.set.dataRows.length : 0;
        }

        function hasSelectedEvaluationVersionChanges() {
          return playgroundEvaluationVersionController.hasDraftChanges(activeSet, evaluationVersionBaselineRef, {
            touched: evaluationVersionDraftTouchedRef.current,
          });
        }

        function canPublishSelectedEvaluationVersion() {
          const selectedVersion = getSelectedEvaluationVersion();
          if (!selectedVersion) return false;
          const hasChanges = hasSelectedEvaluationVersionChanges();
          return selectedVersion.status === "active" ? hasChanges : !hasChanges;
        }

        function canPublishEvaluationVersion(version) {
          const normalizedVersionId = String(version?.id || "").trim();
          if (!normalizedVersionId) return false;
          const selectedVersion = getSelectedEvaluationVersion();
          const hasChanges = hasSelectedEvaluationVersionChanges();
          const isActiveVersion = String(version?.status || "").toLowerCase() === "active";
          if (isActiveVersion) {
            return Boolean(selectedVersion?.id === normalizedVersionId && hasChanges);
          }
          return !hasChanges;
        }

        function buildEvaluationSetForRepublish() {
          return normalizePlaygroundEvaluationSet({
            ...activeSet,
            runs: [],
            updatedAt: new Date().toISOString(),
          });
        }

        function applyEvaluationVersionResult(result, options = {}) {
          if (!result?.resource) return null;
          const nextSet = replaceEvaluationSet(result.resource, options);
          setEvaluationVersionState({ status: "idle", message: "", error: "" });
          setOpenEvaluationVersionMenuId("");
          setEvaluationVersionsHeaderMenuOpen(false);
          return nextSet;
        }

        async function saveCurrentEvaluationVersion() {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          if (!hasSelectedEvaluationVersionChanges()) return null;
          const selectedVersion = getSelectedEvaluationVersion();
          const result = playgroundEvaluationVersionController.buildSaveCurrentResource(activeSet, { status: "saved" });
          const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: false, persist: false });
          if (!nextSet) return null;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await persistEvaluationSetToBackend(nextSet);
            if (selectedVersion?.id && selectedVersion.status !== "active") {
              await requestEvaluationBackendJson(
                "/evaluations/" + encodeURIComponent(nextSet.id) + "/versions/" + encodeURIComponent(selectedVersion.id),
                {
                  method: "PATCH",
                  body: JSON.stringify({
                    label: selectedVersion.label,
                    description: selectedVersion.description,
                    snapshot: buildPlaygroundEvaluationVersionSnapshot(nextSet),
                  }),
                },
                "Failed to save evaluation version."
              ).catch(() => null);
            }
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet.id, { clearRunSelection: false, select: false });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return nextSet;
          }
        }

        async function createEvaluationNewVersionResource(versionDetails = {}, options = {}) {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          if (!options.force && !hasSelectedEvaluationVersionChanges()) return null;
          const resetSet = normalizePlaygroundEvaluationSet({
            ...activeSet,
            runs: [],
            updatedAt: new Date().toISOString(),
          });
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await persistEvaluationSetToBackend(resetSet);
            const versionPayload = await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(resetSet.id) + "/versions",
              {
                method: "POST",
                body: JSON.stringify({
                  label: versionDetails.label,
                  name: versionDetails.label,
                  description: versionDetails.description,
                  snapshot: buildPlaygroundEvaluationVersionSnapshot(resetSet),
                  metadata: buildPlaygroundEvaluationBackendMetadata(resetSet),
                }),
              },
              "Failed to create evaluation version."
            );
            const createdVersion = normalizePlaygroundEvaluationVersion(versionPayload?.version || versionPayload?.data || versionPayload);
            const versions = [
              createdVersion,
              ...readSelectedEvaluationVersions(resetSet).filter((version) => version.id !== createdVersion.id),
            ];
            const nextSet = createPlaygroundEvaluationWithVersionList(resetSet, versions, createdVersion.id);
            replaceEvaluationSet(nextSet, { clearRunSelection: true, rememberBaseline: true, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet.id, { clearRunSelection: true });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function updateEvaluationVersionDetails(versionId, versionDetails = {}) {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedVersionId) return null;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(activeSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId),
              {
                method: "PATCH",
                body: JSON.stringify({
                  label: versionDetails.label,
                  name: versionDetails.label,
                  description: versionDetails.description,
                }),
              },
              "Failed to update evaluation version."
            );
            const result = playgroundEvaluationVersionController.buildVersionMetadataResource(activeSet, normalizedVersionId, versionDetails);
            const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: false, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet?.id || activeSet.id, { clearRunSelection: false });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function publishCurrentEvaluationVersion() {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          const selectedVersion = getSelectedEvaluationVersion();
          const hasChanges = hasSelectedEvaluationVersionChanges();
          if (hasChanges && selectedVersion?.status !== "active") {
            setEvaluationVersionState({
              status: "error",
              message: "",
              error: "Save this version before publishing.",
            });
            return null;
          }
          if (!canPublishSelectedEvaluationVersion()) return null;
          const sourceSet = hasChanges ? buildEvaluationSetForRepublish() : activeSet;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await persistEvaluationSetToBackend(sourceSet);
            await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(sourceSet.id) + "/versions/" + encodeURIComponent(selectedVersion.id) + "/publish",
              {
                method: "POST",
                body: JSON.stringify({
                  snapshot: buildPlaygroundEvaluationVersionSnapshot(sourceSet),
                }),
              },
              "Failed to publish evaluation version."
            );
            const result = playgroundEvaluationVersionController.buildPublishSelectedResource(sourceSet, {
              updateFromResource: hasChanges,
            });
            const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: true, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet?.id || sourceSet.id, { clearRunSelection: true });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function restoreEvaluationVersion(versionId) {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedVersionId) return null;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(activeSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId) + "/restore",
              { method: "POST" },
              "Failed to restore evaluation version."
            );
            const result = playgroundEvaluationVersionController.buildRestoreVersionResource(activeSet, normalizedVersionId);
            const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: true, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet?.id || activeSet.id, { clearRunSelection: true });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function publishEvaluationVersion(versionId) {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          const normalizedVersionId = String(versionId || "").trim();
          const selectedVersion = getSelectedEvaluationVersion();
          const targetVersion = readSelectedEvaluationVersions().find((version) => version.id === normalizedVersionId);
          const hasChanges = hasSelectedEvaluationVersionChanges();
          const shouldRepublishCurrentEditor = Boolean(
            targetVersion
            && targetVersion.status === "active"
            && selectedVersion?.id === targetVersion.id
            && hasChanges
          );
          if (hasChanges && !shouldRepublishCurrentEditor) {
            setEvaluationVersionState({
              status: "error",
              message: "",
              error: "Save this version before publishing.",
            });
            return null;
          }
          if (!canPublishEvaluationVersion(targetVersion)) return null;
          const sourceSet = shouldRepublishCurrentEditor ? buildEvaluationSetForRepublish() : activeSet;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            if (shouldRepublishCurrentEditor) {
              await persistEvaluationSetToBackend(sourceSet);
            }
            await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(sourceSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId) + "/publish",
              {
                method: "POST",
                body: JSON.stringify({
                  snapshot: shouldRepublishCurrentEditor ? buildPlaygroundEvaluationVersionSnapshot(sourceSet) : undefined,
                }),
              },
              "Failed to publish evaluation version."
            );
            const result = playgroundEvaluationVersionController.buildPublishVersionResource(sourceSet, normalizedVersionId, {
              updateFromResource: shouldRepublishCurrentEditor,
            });
            const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: true, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet?.id || sourceSet.id, { clearRunSelection: true });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function deleteEvaluationVersion(versionId) {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          if (readSelectedEvaluationVersions().length <= 1) return null;
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedVersionId) return null;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(activeSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId),
              { method: "DELETE" },
              "Failed to delete evaluation version."
            );
            const result = playgroundEvaluationVersionController.buildDeleteVersionResource(activeSet, normalizedVersionId);
            const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: true, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet?.id || activeSet.id, { clearRunSelection: true });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function revertEvaluationVersionDraft() {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          const selectedVersion = getSelectedEvaluationVersion();
          if (!selectedVersion) return null;
          return await restoreEvaluationVersion(selectedVersion.id);
        }

        function getEvaluationVersionPopupActions(options = {}) {
          const hasChanges = hasSelectedEvaluationVersionChanges();
          const canPublish = canPublishSelectedEvaluationVersion();
          const includeVersionHistory = options.includeVersionHistory !== false;
          return [
            {
              id: "publish",
              label: "Publish",
              Icon: Rocket,
              shortcut: "⌘P",
              disabled: !canPublish,
              onClick: publishCurrentEvaluationVersion,
            },
            {
              id: "save",
              label: "Save",
              Icon: Save,
              shortcut: "⌘S",
              disabled: !hasChanges,
              onClick: saveCurrentEvaluationVersion,
            },
            {
              id: "save-new",
              label: "Save to new Version",
              Icon: GitBranchPlus,
              shortcut: "⇧⌘S",
              disabled: !hasChanges,
              onClick: () => openCreateEvaluationVersionModal(),
            },
            {
              id: "revert",
              label: "Revert to last saved Version",
              Icon: Undo2,
              disabled: !hasChanges,
              onClick: revertEvaluationVersionDraft,
            },
            includeVersionHistory
              ? {
                  id: "history",
                  label: "Open version history",
                  Icon: History,
                  onClick: () => {
                    setEvaluationPublishMenuOpen(false);
                    setEvaluationVersionsHeaderMenuOpen(false);
                    openEvaluationVersionChangesPage();
                  },
                }
              : null,
          ].filter(Boolean);
        }

        function cancelEvaluationVersionModalAnimation() {
          if (typeof window === "undefined") return;
          if (evaluationVersionModalCloseTimerRef.current) {
            window.clearTimeout(evaluationVersionModalCloseTimerRef.current);
            evaluationVersionModalCloseTimerRef.current = null;
          }
          if (evaluationVersionModalFrameRef.current) {
            window.cancelAnimationFrame(evaluationVersionModalFrameRef.current);
            evaluationVersionModalFrameRef.current = null;
          }
        }

        function finishCloseEvaluationVersionModal() {
          cancelEvaluationVersionModalAnimation();
          setEvaluationVersionModal(null);
          setEvaluationVersionModalVisible(false);
          setEvaluationVersionModalClosing(false);
          setEvaluationVersionNameDraft("");
          setEvaluationVersionDescriptionDraft("");
          setIsEvaluationVersionDescriptionEditing(false);
        }

        function openEvaluationVersionModal(nextModal, draft = {}) {
          if (!activeSet || evaluationVersionState.status === "loading") return;
          cancelEvaluationVersionModalAnimation();
          setEvaluationPublishMenuOpen(false);
          setEvaluationVersionsHeaderMenuOpen(false);
          setOpenEvaluationVersionMenuId("");
          setEvaluationVersionState((current) => current.status === "loading" ? current : {
            status: "idle",
            message: "",
            error: "",
          });
          setEvaluationVersionNameDraft(String(draft.name || "").trim());
          setEvaluationVersionDescriptionDraft(String(draft.description || ""));
          setIsEvaluationVersionDescriptionEditing(false);
          setEvaluationVersionModal(nextModal);
          setEvaluationVersionModalClosing(false);
          setEvaluationVersionModalVisible(false);
          if (typeof window === "undefined") {
            setEvaluationVersionModalVisible(true);
            return;
          }
          evaluationVersionModalFrameRef.current = window.requestAnimationFrame(() => {
            evaluationVersionModalFrameRef.current = window.requestAnimationFrame(() => {
              evaluationVersionModalFrameRef.current = null;
              setEvaluationVersionModalVisible(true);
            });
          });
        }

        function openCreateEvaluationVersionModal(options = {}) {
          if (!activeSet || evaluationVersionState.status === "loading") return;
          const forceNewVersion = Boolean(options.force);
          if (!forceNewVersion && !hasSelectedEvaluationVersionChanges()) return;
          const versions = readSelectedEvaluationVersions();
          const nextVersionNumber = versions.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), 0) + 1;
          openEvaluationVersionModal(
            { mode: "create", force: forceNewVersion },
            { name: "Version " + nextVersionNumber, description: "" }
          );
        }

        function openEditEvaluationVersionModal(versionId) {
          if (!activeSet || evaluationVersionState.status === "loading") return;
          const normalizedVersionId = String(versionId || "").trim();
          const targetVersion = readSelectedEvaluationVersions().find((version) => version.id === normalizedVersionId);
          if (!targetVersion) return;
          openEvaluationVersionModal(
            { mode: "edit", versionId: normalizedVersionId },
            {
              name: targetVersion.label || ("Version " + targetVersion.version),
              description: targetVersion.description || "",
            }
          );
        }

        function closeEvaluationVersionModal(options = {}) {
          if (evaluationVersionState.status === "loading") return;
          if (options?.animate === false || typeof window === "undefined") {
            finishCloseEvaluationVersionModal();
            return;
          }
          if (!evaluationVersionModal || evaluationVersionModalClosing) return;
          cancelEvaluationVersionModalAnimation();
          setEvaluationVersionModalVisible(false);
          setEvaluationVersionModalClosing(true);
          evaluationVersionModalCloseTimerRef.current = window.setTimeout(() => {
            evaluationVersionModalCloseTimerRef.current = null;
            finishCloseEvaluationVersionModal();
          }, 90);
        }

        async function commitEvaluationVersionModal() {
          if (!evaluationVersionModal || evaluationVersionState.status === "loading") return;
          const label = String(evaluationVersionNameDraft || "").trim() || "Version";
          const description = String(evaluationVersionDescriptionDraft || "").trim();
          const savedSet = evaluationVersionModal.mode === "edit"
            ? await updateEvaluationVersionDetails(evaluationVersionModal.versionId, { label, description })
            : await createEvaluationNewVersionResource({ label, description }, {
                force: Boolean(evaluationVersionModal.force),
              });
          if (savedSet) {
            closeEvaluationVersionModal();
          }
        }

        function applyEvaluationVersionDescriptionMarkdownFormat(formatType) {
          const textarea = evaluationVersionDescriptionTextareaRef.current;
          const value = String(evaluationVersionDescriptionDraft || "");
          const selectionStart = textarea && typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = textarea && typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;
          if (formatType === "bold") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildEvaluationMarkdownListEdit(value, selectionStart, selectionEnd, "unordered");
          }
          if (!edit) return;
          setEvaluationVersionDescriptionDraft(edit.value);
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const nextTextarea = evaluationVersionDescriptionTextareaRef.current;
            if (!nextTextarea) return;
            const maxLength = edit.value.length;
            const safeSelectionStart = Math.max(0, Math.min(edit.selectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(edit.selectionEnd, maxLength));
            nextTextarea.focus();
            nextTextarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeEvaluationGuidanceTextarea(nextTextarea);
          });
        }

        const EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID = "current_editor";
        const getEvaluationVersionCompareVersionSourceId = (versionId) => {
          const normalizedVersionId = String(versionId || "").trim();
          return normalizedVersionId ? "version:" + normalizedVersionId : "";
        };
        const getEvaluationVersionCompareVersionLabel = (version) => String(version?.label || ("Version " + version?.version)).trim() || "Version";
        const buildEvaluationVersionCompareSources = (versions) => [
          {
            id: EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID,
            label: "Current editor",
            snapshot: buildPlaygroundEvaluationVersionSnapshot(activeSet),
          },
          ...(Array.isArray(versions) ? versions : []).map((version) => ({
            id: getEvaluationVersionCompareVersionSourceId(version.id),
            label: getEvaluationVersionCompareVersionLabel(version),
            snapshot: normalizePlaygroundEvaluationVersion(version).snapshot,
          })),
        ];
        const resolveEvaluationVersionCompareSource = (sourceId, sources, fallbackSource) => {
          const normalizedSourceId = String(sourceId || "").trim();
          return sources.find((source) => source.id === normalizedSourceId) || fallbackSource || sources[0] || null;
        };
        const getDefaultEvaluationVersionCompareLeftSourceId = (versions) => {
          const activeVersion = getSelectedEvaluationActiveVersion();
          return activeVersion ? getEvaluationVersionCompareVersionSourceId(activeVersion.id) : EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID;
        };

        function openEvaluationVersionChangesPage(versionId, options = {}) {
          if (!activeSet) return;
          const versions = readSelectedEvaluationVersions();
          const normalizedVersionId = String(versionId || "").trim();
          const leftSourceId = String(options.leftSourceId || "").trim()
            || (normalizedVersionId
              ? getEvaluationVersionCompareVersionSourceId(normalizedVersionId)
              : getDefaultEvaluationVersionCompareLeftSourceId(versions));
          const rightSourceId = String(options.rightSourceId || "").trim() || EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID;
          setOpenEvaluationVersionMenuId("");
          setEvaluationPublishMenuOpen(false);
          setEvaluationVersionsHeaderMenuOpen(false);
          setEvaluationVersionsSidebarOpen(true);
          setEvaluationVersionChangesState({ leftSourceId, rightSourceId });
        }

        function closeEvaluationVersionChangesPage() {
          setEvaluationVersionChangesState(null);
        }

        function handleEvaluationVersionCompareSourceChange(side, sourceId) {
          const normalizedSide = side === "left" ? "leftSourceId" : "rightSourceId";
          setEvaluationVersionChangesState((current) => ({
            ...(current || {}),
            [normalizedSide]: sourceId,
          }));
        }

        function closeEvaluationVersionsSidebar() {
          setEvaluationVersionsSidebarOpen(false);
          setEvaluationPublishMenuOpen(false);
          setEvaluationVersionsHeaderMenuOpen(false);
          finishCloseEvaluationVersionModal();
          setEvaluationVersionChangesState(null);
          setOpenEvaluationVersionMenuId("");
        }

`;


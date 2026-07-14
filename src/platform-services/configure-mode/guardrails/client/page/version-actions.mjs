export const GUARDRAILS_PAGE_VERSION_ACTIONS_SCRIPT = `          function getGuardrailVersionMetadata(set = selectedGuardrailSet) {
            return playgroundGuardrailVersionController.getMetadata(set);
          }

          function readSelectedGuardrailVersions(set = selectedGuardrailSet) {
            return playgroundGuardrailVersionController.readVersions(set);
          }

          function getSelectedGuardrailActiveVersion(set = selectedGuardrailSet) {
            return playgroundGuardrailVersionController.getActiveVersion(set);
          }

          function getSelectedGuardrailVersion(set = selectedGuardrailSet) {
            return playgroundGuardrailVersionController.getSelectedVersion(set);
          }

          function rememberGuardrailVersionBaseline(set = selectedGuardrailSet, options = {}) {
            const didUpdateBaseline = playgroundGuardrailVersionController.rememberBaseline(set, guardrailVersionBaselineRef, options);
            if (didUpdateBaseline) {
              guardrailVersionDraftTouchedRef.current = false;
            }
          }

          function hasSelectedGuardrailVersionChanges() {
            return playgroundGuardrailVersionController.hasDraftChanges(selectedGuardrailSet, guardrailVersionBaselineRef, {
              requireTouched: false,
              touched: guardrailVersionDraftTouchedRef.current,
            });
          }

          function canPublishSelectedGuardrailVersion() {
            const selectedVersion = getSelectedGuardrailVersion();
            if (!selectedVersion) return false;
            const hasChanges = hasSelectedGuardrailVersionChanges();
            return selectedVersion.status === "active" ? hasChanges : !hasChanges;
          }

          function canPublishGuardrailVersion(version) {
            const normalizedVersionId = String(version?.id || "").trim();
            if (!normalizedVersionId) return false;
            const selectedVersion = getSelectedGuardrailVersion();
            const hasChanges = hasSelectedGuardrailVersionChanges();
            const isActiveVersion = String(version?.status || "").toLowerCase() === "active";
            if (isActiveVersion) {
              return Boolean(selectedVersion?.id === normalizedVersionId && hasChanges);
            }
            return !hasChanges;
          }

          function getGuardrailVersionPrimaryActionKind() {
            return canPublishSelectedGuardrailVersion() ? "publish" : "save";
          }

          function getGuardrailVersionPopupActions(options = {}) {
            const includeVersionHistory = options.includeVersionHistory !== false;
            const primaryActionKind = getGuardrailVersionPrimaryActionKind();
            const hasChanges = hasSelectedGuardrailVersionChanges();
            const canPublish = canPublishSelectedGuardrailVersion();
            const actions = [
              primaryActionKind === "publish"
                ? {
                    id: "publish",
                    label: "Publish",
                    Icon: Rocket,
                    shortcut: "⌘P",
                    disabled: !canPublish,
                    onClick: publishCurrentGuardrailVersion,
                  }
                : {
                    id: "save",
                    label: "Save",
                    Icon: Save,
                    shortcut: "⌘S",
                    disabled: !hasChanges,
                    onClick: saveCurrentGuardrailVersion,
                  },
              {
                id: "save-new-version",
                label: "Save to new Version",
                Icon: GitBranchPlus,
                shortcut: "⇧⌘S",
                disabled: !hasChanges,
                onClick: () => openCreateGuardrailVersionModal(),
              },
              {
                id: "revert",
                label: "Revert to last saved Version",
                Icon: Undo2,
                disabled: !hasChanges,
                onClick: handleRevertGuardrailDraft,
              },
            ];
            if (includeVersionHistory) {
              actions.push({
                id: "version-history",
                label: "Version history",
                Icon: History,
                disabled: false,
                onClick: () => {
                  setGuardrailPublishMenuOpen(false);
                  setGuardrailVersionsHeaderMenuOpen(false);
                  openGuardrailVersionChangesPage();
                },
              });
            }
            return actions;
          }

          function buildGuardrailSetForRepublish() {
            return normalizePlaygroundGuardrailSet({
              ...selectedGuardrailSet,
              updatedAt: new Date().toISOString(),
            });
          }

          async function saveCurrentGuardrailVersion() {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return null;
            if (!hasSelectedGuardrailVersionChanges()) return null;
            const selectedVersion = getSelectedGuardrailVersion();
            const result = playgroundGuardrailVersionController.buildSaveCurrentResource(selectedGuardrailSet, { status: "saved" });
            const nextSet = applyGuardrailVersionResult(result, { select: false, rememberBaseline: false });
            if (!nextSet) return null;
            setGuardrailVersionState({ status: "loading", message: "", error: "" });
            try {
              await persistGuardrailSetToBackend(nextSet);
              if (selectedVersion?.id && selectedVersion.status !== "active") {
                await requestGuardrailBackendJson(
                  "/guardrails/" + encodeURIComponent(nextSet.id) + "/versions/" + encodeURIComponent(selectedVersion.id),
                  {
                    method: "PATCH",
                    body: JSON.stringify({
                      label: selectedVersion.label,
                      description: selectedVersion.description,
                      snapshot: buildPlaygroundGuardrailVersionSnapshot(nextSet),
                      metadata: buildPlaygroundGuardrailBackendMetadata(nextSet),
                    }),
                  },
                  "Failed to save guardrail version."
                ).catch(() => null);
              }
              setGuardrailVersionState({ status: "idle", message: "", error: "" });
              return await reloadBackendGuardrailSet(nextSet.id, { select: false, rememberBaseline: true });
            } catch (error) {
              setGuardrailVersionState({ status: "error", message: "", error: error?.message || String(error) });
              return nextSet;
            }
          }

          function cancelGuardrailVersionModalAnimation() {
            if (guardrailVersionModalCloseTimerRef.current) {
              window.clearTimeout(guardrailVersionModalCloseTimerRef.current);
              guardrailVersionModalCloseTimerRef.current = null;
            }
            if (guardrailVersionModalFrameRef.current) {
              window.cancelAnimationFrame(guardrailVersionModalFrameRef.current);
              guardrailVersionModalFrameRef.current = null;
            }
          }

          function finishCloseGuardrailVersionModal() {
            cancelGuardrailVersionModalAnimation();
            setGuardrailVersionModal(null);
            setGuardrailVersionModalVisible(false);
            setGuardrailVersionModalClosing(false);
            setGuardrailVersionNameDraft("");
            setGuardrailVersionDescriptionDraft("");
            setIsGuardrailVersionDescriptionEditing(false);
          }

          function openGuardrailVersionModal(nextModal, draft = {}) {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return;
            cancelGuardrailVersionModalAnimation();
            setGuardrailPublishMenuOpen(false);
            setGuardrailVersionsHeaderMenuOpen(false);
            setOpenGuardrailVersionMenuId("");
            setGuardrailVersionState((current) => current.status === "loading" ? current : {
              status: "idle",
              message: "",
              error: "",
            });
            setGuardrailVersionNameDraft(String(draft.name || "").trim());
            setGuardrailVersionDescriptionDraft(String(draft.description || ""));
            setIsGuardrailVersionDescriptionEditing(false);
            setGuardrailVersionModal(nextModal);
            setGuardrailVersionModalClosing(false);
            setGuardrailVersionModalVisible(false);
            guardrailVersionModalFrameRef.current = window.requestAnimationFrame(() => {
              guardrailVersionModalFrameRef.current = window.requestAnimationFrame(() => {
                guardrailVersionModalFrameRef.current = null;
                setGuardrailVersionModalVisible(true);
              });
            });
          }

          function openCreateGuardrailVersionModal(options = {}) {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return;
            const forceNewVersion = Boolean(options.force);
            if (!forceNewVersion && !hasSelectedGuardrailVersionChanges()) return;
            const versions = readSelectedGuardrailVersions();
            const nextVersion = versions.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), 0) + 1;
            openGuardrailVersionModal(
              { mode: "create", force: forceNewVersion },
              { name: "Version " + nextVersion, description: "" }
            );
          }

          function openEditGuardrailVersionModal(versionId) {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return;
            const normalizedVersionId = String(versionId || "").trim();
            const targetVersion = readSelectedGuardrailVersions().find((version) => version.id === normalizedVersionId);
            if (!targetVersion) return;
            openGuardrailVersionModal(
              { mode: "edit", versionId: targetVersion.id },
              {
                name: String(targetVersion.label || ("Version " + targetVersion.version)).trim(),
                description: String(targetVersion.description || ""),
              }
            );
          }

          function closeGuardrailVersionModal(options = {}) {
            if (guardrailVersionState.status === "loading") return;
            if (options.animate === false) {
              finishCloseGuardrailVersionModal();
              return;
            }
            if (!guardrailVersionModal || guardrailVersionModalClosing) return;
            cancelGuardrailVersionModalAnimation();
            setGuardrailVersionModalVisible(false);
            setGuardrailVersionModalClosing(true);
            guardrailVersionModalCloseTimerRef.current = window.setTimeout(() => {
              guardrailVersionModalCloseTimerRef.current = null;
              finishCloseGuardrailVersionModal();
            }, typeof PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS === "number" ? PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS : 75);
          }

          async function saveGuardrailToNewVersion(options = {}) {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return null;
            const forceNewVersion = Boolean(options.force);
            if (!forceNewVersion && !hasSelectedGuardrailVersionChanges()) return null;
            const sourceSet = normalizePlaygroundGuardrailSet({
              ...selectedGuardrailSet,
              updatedAt: new Date().toISOString(),
            });
            setGuardrailVersionState({ status: "loading", message: "", error: "" });
            try {
              await persistGuardrailSetToBackend(sourceSet);
              const versionPayload = await requestGuardrailBackendJson(
                "/guardrails/" + encodeURIComponent(sourceSet.id) + "/versions",
                {
                  method: "POST",
                  body: JSON.stringify({
                    label: options.label,
                    name: options.label,
                    description: options.description,
                    snapshot: buildPlaygroundGuardrailVersionSnapshot(sourceSet),
                    metadata: buildPlaygroundGuardrailBackendMetadata(sourceSet),
                  }),
                },
                "Failed to create guardrail version."
              );
              const createdVersion = normalizePlaygroundGuardrailVersion(versionPayload?.version || versionPayload?.data || versionPayload);
              const versions = [
                createdVersion,
                ...readSelectedGuardrailVersions(sourceSet).filter((version) => version.id !== createdVersion.id),
              ];
              const nextSet = createPlaygroundGuardrailWithVersionList(sourceSet, versions, createdVersion.id);
              applyGuardrailVersionResult({ resource: nextSet }, { select: false, rememberBaseline: true });
              setGuardrailVersionState({ status: "idle", message: "", error: "" });
              return await reloadBackendGuardrailSet(nextSet.id, { select: false, rememberBaseline: true });
            } catch (error) {
              setGuardrailVersionState({ status: "error", message: "", error: error?.message || String(error) });
              return null;
            }
          }

          async function updateGuardrailVersionDetails(versionId, versionDetails = {}) {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return null;
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) return null;
            setGuardrailVersionState({ status: "loading", message: "", error: "" });
            try {
              await requestGuardrailBackendJson(
                "/guardrails/" + encodeURIComponent(selectedGuardrailSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId),
                {
                  method: "PATCH",
                  body: JSON.stringify({
                    label: versionDetails.label,
                    name: versionDetails.label,
                    description: versionDetails.description,
                  }),
                },
                "Failed to update guardrail version."
              );
              const result = playgroundGuardrailVersionController.buildVersionMetadataResource(selectedGuardrailSet, normalizedVersionId, versionDetails);
              const nextSet = applyGuardrailVersionResult(result, { select: false, rememberBaseline: true });
              setGuardrailVersionState({ status: "idle", message: "", error: "" });
              return await reloadBackendGuardrailSet(nextSet?.id || selectedGuardrailSet.id, { select: false, rememberBaseline: true });
            } catch (error) {
              setGuardrailVersionState({ status: "error", message: "", error: error?.message || String(error) });
              return null;
            }
          }

          async function commitGuardrailVersionModal() {
            if (!guardrailVersionModal || guardrailVersionState.status === "loading") return;
            const label = String(guardrailVersionNameDraft || "").trim() || "Version";
            const description = String(guardrailVersionDescriptionDraft || "").trim();
            const savedSet = guardrailVersionModal.mode === "edit"
              ? await updateGuardrailVersionDetails(guardrailVersionModal.versionId, { label, description })
              : await saveGuardrailToNewVersion({
                  force: Boolean(guardrailVersionModal.force),
                  label,
                  description,
                });
            if (savedSet) {
              closeGuardrailVersionModal();
            }
          }

          async function publishCurrentGuardrailVersion() {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return null;
            const selectedVersion = getSelectedGuardrailVersion();
            const hasChanges = hasSelectedGuardrailVersionChanges();
            if (hasChanges && selectedVersion?.status !== "active") {
              setGuardrailVersionState({
                status: "error",
                message: "",
                error: "Save the current version before publishing.",
              });
              return null;
            }
            if (!canPublishSelectedGuardrailVersion()) return null;
            const sourceSet = hasChanges ? buildGuardrailSetForRepublish() : selectedGuardrailSet;
            setGuardrailVersionState({ status: "loading", message: "", error: "" });
            try {
              await persistGuardrailSetToBackend(sourceSet);
              await requestGuardrailBackendJson(
                "/guardrails/" + encodeURIComponent(sourceSet.id) + "/versions/" + encodeURIComponent(selectedVersion.id) + "/publish",
                {
                  method: "POST",
                  body: JSON.stringify({ snapshot: buildPlaygroundGuardrailVersionSnapshot(sourceSet) }),
                },
                "Failed to publish guardrail version."
              );
              const result = playgroundGuardrailVersionController.buildPublishSelectedResource(sourceSet, {
                updateFromResource: hasChanges,
              });
              const nextSet = applyGuardrailVersionResult(result, { select: false, rememberBaseline: true });
              setGuardrailVersionState({ status: "idle", message: "", error: "" });
              return await reloadBackendGuardrailSet(nextSet?.id || sourceSet.id, { select: false, rememberBaseline: true });
            } catch (error) {
              setGuardrailVersionState({ status: "error", message: "", error: error?.message || String(error) });
              return null;
            }
          }

          async function restoreGuardrailVersion(versionId) {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return null;
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) return null;
            setGuardrailVersionState({ status: "loading", message: "", error: "" });
            try {
              await requestGuardrailBackendJson(
                "/guardrails/" + encodeURIComponent(selectedGuardrailSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId) + "/restore",
                { method: "POST" },
                "Failed to restore guardrail version."
              );
              const result = playgroundGuardrailVersionController.buildRestoreVersionResource(selectedGuardrailSet, normalizedVersionId);
              const nextSet = applyGuardrailVersionResult(result, { select: false, rememberBaseline: true });
              setGuardrailVersionState({ status: "idle", message: "", error: "" });
              return await reloadBackendGuardrailSet(nextSet?.id || selectedGuardrailSet.id, { select: false, rememberBaseline: true });
            } catch (error) {
              setGuardrailVersionState({ status: "error", message: "", error: error?.message || String(error) });
              return null;
            }
          }

          async function publishGuardrailVersion(versionId) {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return null;
            const normalizedVersionId = String(versionId || "").trim();
            const targetVersion = readSelectedGuardrailVersions().find((version) => version.id === normalizedVersionId);
            const selectedVersion = getSelectedGuardrailVersion();
            const hasChanges = hasSelectedGuardrailVersionChanges();
            const shouldRepublishCurrentEditor = Boolean(
              targetVersion
              && targetVersion.status === "active"
              && selectedVersion?.id === targetVersion.id
              && hasChanges
            );
            if (hasChanges && !shouldRepublishCurrentEditor) {
              setGuardrailVersionState({
                status: "error",
                message: "",
                error: "Save the current version before publishing.",
              });
              return null;
            }
            if (!canPublishGuardrailVersion(targetVersion)) return null;
            const sourceSet = shouldRepublishCurrentEditor ? buildGuardrailSetForRepublish() : selectedGuardrailSet;
            setGuardrailVersionState({ status: "loading", message: "", error: "" });
            try {
              if (shouldRepublishCurrentEditor) {
                await persistGuardrailSetToBackend(sourceSet);
              }
              await requestGuardrailBackendJson(
                "/guardrails/" + encodeURIComponent(sourceSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId) + "/publish",
                {
                  method: "POST",
                  body: JSON.stringify({
                    snapshot: shouldRepublishCurrentEditor ? buildPlaygroundGuardrailVersionSnapshot(sourceSet) : undefined,
                  }),
                },
                "Failed to publish guardrail version."
              );
              const result = playgroundGuardrailVersionController.buildPublishVersionResource(sourceSet, normalizedVersionId, {
                updateFromResource: shouldRepublishCurrentEditor,
              });
              const nextSet = applyGuardrailVersionResult(result, { select: false, rememberBaseline: true });
              setGuardrailVersionState({ status: "idle", message: "", error: "" });
              return await reloadBackendGuardrailSet(nextSet?.id || sourceSet.id, { select: false, rememberBaseline: true });
            } catch (error) {
              setGuardrailVersionState({ status: "error", message: "", error: error?.message || String(error) });
              return null;
            }
          }

          async function deleteGuardrailVersion(versionId) {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return null;
            if (readSelectedGuardrailVersions().length <= 1) return null;
            const confirmed = typeof window === "undefined" || window.confirm("Delete this guardrail version?");
            if (!confirmed) return null;
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) return null;
            setGuardrailVersionState({ status: "loading", message: "", error: "" });
            try {
              await requestGuardrailBackendJson(
                "/guardrails/" + encodeURIComponent(selectedGuardrailSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId),
                { method: "DELETE" },
                "Failed to delete guardrail version."
              );
              const result = playgroundGuardrailVersionController.buildDeleteVersionResource(selectedGuardrailSet, normalizedVersionId);
              const nextSet = applyGuardrailVersionResult(result, { select: false, rememberBaseline: true });
              setGuardrailVersionState({ status: "idle", message: "", error: "" });
              return await reloadBackendGuardrailSet(nextSet?.id || selectedGuardrailSet.id, { select: false, rememberBaseline: true });
            } catch (error) {
              setGuardrailVersionState({ status: "error", message: "", error: error?.message || String(error) });
              return null;
            }
          }

          async function unpublishActiveGuardrailVersion() {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return null;
            const activeVersion = getSelectedGuardrailActiveVersion();
            if (!activeVersion?.id) return null;
            const confirmed = typeof window === "undefined" || window.confirm("Unpublish this guardrail set?");
            if (!confirmed) return null;
            setGuardrailVersionState({ status: "loading", message: "", error: "" });
            try {
              await requestGuardrailBackendJson(
                "/guardrails/" + encodeURIComponent(selectedGuardrailSet.id) + "/versions/" + encodeURIComponent(activeVersion.id) + "/unpublish",
                { method: "POST" },
                "Failed to unpublish guardrail set."
              );
              const result = playgroundGuardrailVersionController.buildUnpublishActiveResource(selectedGuardrailSet);
              const nextSet = applyGuardrailVersionResult(result, { select: false, rememberBaseline: true });
              setGuardrailVersionState({ status: "idle", message: "", error: "" });
              return await reloadBackendGuardrailSet(nextSet?.id || selectedGuardrailSet.id, { select: false, rememberBaseline: true });
            } catch (error) {
              setGuardrailVersionState({ status: "error", message: "", error: error?.message || String(error) });
              return null;
            }
          }

          async function handleRevertGuardrailDraft() {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly || guardrailVersionState.status === "loading") return null;
            const selectedVersion = getSelectedGuardrailVersion();
            if (!selectedVersion) return null;
            return await restoreGuardrailVersion(selectedVersion.id);
          }

`;

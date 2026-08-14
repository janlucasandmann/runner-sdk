export const GUARDRAILS_PAGE_VERSION_VIEWS_SCRIPT = `          const GUARDRAIL_VERSION_COMPARE_CURRENT_EDITOR_ID = "current-editor";
          const getGuardrailVersionCompareVersionSourceId = (versionId) => {
            const normalizedVersionId = String(versionId || "").trim();
            return normalizedVersionId ? "version:" + normalizedVersionId : "";
          };
          const getGuardrailVersionCompareVersionLabel = (version) => String(version?.label || ("Version " + version?.version)).trim() || "Version";
          const buildGuardrailVersionCompareSources = (versions) => [
            {
              id: GUARDRAIL_VERSION_COMPARE_CURRENT_EDITOR_ID,
              label: "Current editor",
              snapshot: buildPlaygroundGuardrailVersionSnapshot(selectedGuardrailSet),
            },
          ].concat((Array.isArray(versions) ? versions : []).map((version) => ({
            id: getGuardrailVersionCompareVersionSourceId(version.id),
            label: getGuardrailVersionCompareVersionLabel(version),
            snapshot: normalizePlaygroundGuardrailVersion(version).snapshot,
          })));
          const resolveGuardrailVersionCompareSource = (sourceId, sources, fallbackSource) => {
            const normalizedSourceId = String(sourceId || "").trim();
            return sources.find((source) => source.id === normalizedSourceId) || fallbackSource || sources[0] || null;
          };
          const getDefaultGuardrailVersionCompareLeftSourceId = (versions) => {
            const activeVersion = getSelectedGuardrailActiveVersion()
              || (Array.isArray(versions) ? versions[0] : null);
            return activeVersion ? getGuardrailVersionCompareVersionSourceId(activeVersion.id) : GUARDRAIL_VERSION_COMPARE_CURRENT_EDITOR_ID;
          };

          function openGuardrailVersionChangesPage(versionId, options = {}) {
            if (!selectedGuardrailSet || selectedGuardrailSetReadonly) return;
            const normalizedVersionId = String(versionId || "").trim();
            const versions = readSelectedGuardrailVersions();
            const leftSourceId = String(options.leftSourceId || "").trim()
              || (normalizedVersionId
                ? getGuardrailVersionCompareVersionSourceId(normalizedVersionId)
                : getDefaultGuardrailVersionCompareLeftSourceId(versions));
            const rightSourceId = String(options.rightSourceId || "").trim() || GUARDRAIL_VERSION_COMPARE_CURRENT_EDITOR_ID;
            setOpenGuardrailVersionMenuId("");
            setGuardrailPublishMenuOpen(false);
            setGuardrailVersionsHeaderMenuOpen(false);
            setGuardrailVersionsSidebarOpen(true);
            setGuardrailVersionChangesState({ leftSourceId, rightSourceId });
          }

          function closeGuardrailVersionChangesPage() {
            setGuardrailVersionChangesState(null);
          }

          function handleGuardrailVersionCompareSourceChange(side, sourceId) {
            const normalizedSourceId = String(sourceId || "").trim() || GUARDRAIL_VERSION_COMPARE_CURRENT_EDITOR_ID;
            setGuardrailVersionChangesState((current) => ({
              ...(current || {}),
              [side === "left" ? "leftSourceId" : "rightSourceId"]: normalizedSourceId,
            }));
          }

          function closeGuardrailVersionsSidebar() {
            setGuardrailVersionsSidebarOpen(false);
            setGuardrailPublishMenuOpen(false);
            setGuardrailVersionsHeaderMenuOpen(false);
            finishCloseGuardrailVersionModal();
            setOpenGuardrailVersionMenuId("");
          }

          function renderGuardrailVersionsSidebar(options = {}) {
            if (!isGuardrailsDetailPage || selectedGuardrailSetReadonly || !guardrailVersionsSidebarOpen) {
              return null;
            }
            const versions = readSelectedGuardrailVersions();
            const metadata = getGuardrailVersionMetadata();
            const activeVersion = getSelectedGuardrailActiveVersion();
            const activeVersionId = String(activeVersion?.id || metadata.activeGuardrailVersionId || metadata.active_guardrail_version_id || "").trim();
            const selectedVersionId = String(
              metadata.restoredFromGuardrailVersionId
              || metadata.restored_from_guardrail_version_id
              || activeVersionId
              || ""
            ).trim();
            const normalizedSetId = String(selectedGuardrailSet?.id || "").trim();
            const versionsLoaded = Boolean(
              normalizedSetId && guardrailDetailsLoadedRef.current.has(normalizedSetId)
            );
            const versionsError = !versionsLoaded && guardrailsBackendSyncState.status === "error"
              ? guardrailsBackendSyncState.error
              : "";
            const mutationStateContent = guardrailVersionState.status === "loading"
              ? React.createElement("div", { className: "platform-version-history-sidebar__state" },
                  guardrailVersionState.message || "Saving guardrail version..."
                )
              : guardrailVersionState.status === "error" && guardrailVersionState.error
                ? React.createElement("div", {
                    className: "platform-version-history-sidebar__state is-error",
                    role: "alert",
                  }, guardrailVersionState.error)
                : null;
            return React.createElement(PlatformVersionHistorySidebar, {
              open: guardrailVersionsSidebarOpen,
              title: "Version history",
              sectionTitle: "All Versions",
              className: "playground-guardrails-versions-sidebar",
              width: "var(--playground-thread-task-detail-width)",
              portal: Boolean(options.portal),
              portalTarget: options.portalTarget || null,
              versions,
              activeVersionId,
              selectedVersionId,
              loading: !versionsLoaded && !versionsError,
              loadingMessage: "Loading versions",
              error: versionsError || null,
              emptyDescription: "Save changes to create this guardrail's first version.",
              busy: guardrailVersionState.status === "loading",
              stateContent: mutationStateContent,
              onClose: () => {
                setGuardrailVersionChangesState(null);
                closeGuardrailVersionsSidebar();
              },
              onSelectVersion: (versionId) => void restoreGuardrailVersion(versionId),
              onPublishVersion: (versionId) => void publishGuardrailVersion(versionId),
              canPublishVersion: (version) => canPublishGuardrailVersion(version),
              onViewChanges: () => openGuardrailVersionChangesPage(),
              getVersionCreatedAt: (version) => {
                const timestamp = version.createdAt || version.updatedAt || version.publishedAt;
                return timestamp ? formatGuardrailVersionTimestamp(timestamp) : "-";
              },
              getVersionActions: (version) => [
                {
                  id: "edit",
                  label: "Edit description",
                  icon: SquarePen,
                  onSelect: () => openEditGuardrailVersionModal(version.id),
                },
                {
                  id: "compare",
                  label: "View Changes",
                  icon: Code2,
                  onSelect: () => openGuardrailVersionChangesPage(version.id),
                },
                {
                  id: "delete",
                  label: "Delete version",
                  icon: Trash2,
                  danger: true,
                  disabled: version.status === "active" || versions.length <= 1,
                  onSelect: () => void deleteGuardrailVersion(version.id),
                },
              ],
            });
          }

          function renderGuardrailVersionsSidebarPortal() {
            const drawerContainer = typeof document !== "undefined"
              ? document.getElementById("playground-agent-versions-drawer-root")
              : null;
            if (drawerContainer) {
              return renderGuardrailVersionsSidebar({
                portal: true,
                portalTarget: drawerContainer,
              });
            }
            return renderGuardrailVersionsSidebar();
          }

          function renderGuardrailPublishSplitButton() {
            const isBusy = guardrailVersionState.status === "loading";
            const normalizedSetId = String(selectedGuardrailSet?.id || "").trim();
            const versionsLoaded = Boolean(
              normalizedSetId && guardrailDetailsLoadedRef.current.has(normalizedSetId)
            );
            const versionHasChanges = hasSelectedGuardrailVersionChanges();
            const isPublishControlDisabled = Boolean(isBusy || !versionsLoaded || !versionHasChanges);
            const actions = getGuardrailVersionPopupActions();
            return React.createElement(PlatformVersionPublishControl, {
              open: guardrailPublishMenuOpen,
              actions,
              rootRef: guardrailPublishMenuRef,
              active: guardrailPublishMenuOpen,
              disabled: isPublishControlDisabled,
              menuDisabled: isPublishControlDisabled,
              label: "Save Changes",
              leading: React.createElement(Bookmark, { strokeWidth: 1.8 }),
              publishAriaLabel: "Save guardrail changes",
              className: "playground-guardrails-publish-control",
              popupClassName: "playground-guardrails-publish-menu",
              onOpenChange: (nextOpen) => {
                setGuardrailVersionsHeaderMenuOpen(false);
                setGuardrailPublishMenuOpen(nextOpen);
              },
              onPublish: () => openGuardrailVersionSaveDialog(),
            });
          }

          function renderGuardrailVersionChangesPage() {
            if (!guardrailVersionChangesState || !selectedGuardrailSet) {
              return null;
            }
            const versions = readSelectedGuardrailVersions();
            const sources = buildGuardrailVersionCompareSources(versions);
            const requestedLeftSourceId = String(guardrailVersionChangesState.leftSourceId || "").trim()
              || getDefaultGuardrailVersionCompareLeftSourceId(versions);
            const requestedRightSourceId = String(guardrailVersionChangesState.rightSourceId || "").trim()
              || GUARDRAIL_VERSION_COMPARE_CURRENT_EDITOR_ID;
            const currentEditorSource = sources.find((source) => source.id === GUARDRAIL_VERSION_COMPARE_CURRENT_EDITOR_ID) || sources[0] || null;
            const leftSource = resolveGuardrailVersionCompareSource(requestedLeftSourceId, sources, sources[1] || currentEditorSource);
            const rightSource = resolveGuardrailVersionCompareSource(requestedRightSourceId, sources, currentEditorSource);
            if (!leftSource || !rightSource) {
              return null;
            }
            const diffFiles = buildPlaygroundGuardrailVersionDiffFilesFromSnapshots(leftSource.snapshot, rightSource.snapshot);
            const compareOptions = sources.map((source) => ({
              value: source.id,
              label: source.label,
            }));
            return renderPlaygroundVersionChangesPage({
              title: "Changes",
              leftSelector: {
                value: leftSource.id,
                options: compareOptions,
                onValueChange: (value) => handleGuardrailVersionCompareSourceChange("left", value),
                ariaLabel: "Select base guardrail version",
              },
              rightSelector: {
                value: rightSource.id,
                options: compareOptions,
                onValueChange: (value) => handleGuardrailVersionCompareSourceChange("right", value),
                ariaLabel: "Select target guardrail version",
              },
              actions: renderGuardrailPublishSplitButton(),
              files: diffFiles,
              backIcon: ArrowLeft,
              backText: "Back",
              backLabel: "Back to guardrail set",
              onBack: closeGuardrailVersionChangesPage,
              emptyMessage: "No differences from the current editor.",
              className: "playground-guardrails-version-changes-page",
            });
          }

`;

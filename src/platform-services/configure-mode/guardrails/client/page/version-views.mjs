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
            setGuardrailVersionChangesState(null);
            setOpenGuardrailVersionMenuId("");
          }

          function renderGuardrailVersionsSidebar() {
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
            return React.createElement(PlaygroundVersionSidebar, {
              className: "playground-guardrails-versions-sidebar",
              open: guardrailVersionsSidebarOpen,
              title: "Publish Guardrail",
              versions,
              activeVersionId,
              selectedVersionId,
              state: guardrailVersionState,
              busy: guardrailVersionState.status === "loading",
              openMenuId: openGuardrailVersionMenuId,
              onOpenMenuIdChange: setOpenGuardrailVersionMenuId,
              headerMenuOpen: guardrailVersionsHeaderMenuOpen,
              headerMenuActions: getGuardrailVersionPopupActions({ includeVersionHistory: false }),
              headerMenuDisabled: guardrailVersionState.status === "loading",
              onHeaderMenuOpenChange: setGuardrailVersionsHeaderMenuOpen,
              onClose: closeGuardrailVersionsSidebar,
              onSaveVersion: () => openCreateGuardrailVersionModal({ force: true }),
              onRestoreVersion: (versionId) => restoreGuardrailVersion(versionId),
              onPublishVersion: (versionId) => publishGuardrailVersion(versionId),
              canPublishVersion: (version) => canPublishGuardrailVersion(version),
              onDeleteVersion: (versionId) => deleteGuardrailVersion(versionId),
              versionsSectionFooter: React.createElement("div", { className: "playground-metronome-publish-section-footer playground-agents-version-compare-footer" },
                React.createElement(PlatformSecondaryButton, {
                  size: "large",
                  type: "button",
                  className: "playground-metronome-secondary-button playground-metronome-publish-new-button playground-agents-version-compare-button",
                  disabled: guardrailVersionState.status === "loading" || !versions.length,
                  onClick: () => openGuardrailVersionChangesPage(),
                },
                  React.createElement(Code2, { width: 13, height: 13, strokeWidth: 1.8 }),
                  React.createElement("span", null, "View Changes")
                )
              ),
              getRowMenuItems: (version) => [
                {
                  id: "edit",
                  label: "Edit version",
                  icon: SquarePen,
                  onClick: () => openEditGuardrailVersionModal(version.id),
                },
                {
                  id: "compare",
                  label: "View Changes",
                  icon: Code2,
                  onClick: () => openGuardrailVersionChangesPage(version.id),
                },
                {
                  id: "restore",
                  label: "Restore version",
                  icon: RotateCcw,
                  onClick: () => restoreGuardrailVersion(version.id),
                },
                {
                  id: "delete",
                  label: "Delete version",
                  icon: Trash2,
                  danger: true,
                  onClick: () => deleteGuardrailVersion(version.id),
                },
              ],
              unpublishLabel: "Unpublish guardrail set",
              getVersionTitle: (version) => String(version.label || ("Version " + version.version)).trim(),
              getVersionDescription: () => "",
              getVersionMeta: (version) => {
                const lifecycleLabel = version.status === "active"
                  ? "Published"
                  : version.status === "superseded"
                    ? "Superseded"
                    : version.status === "unpublished"
                      ? "Unpublished"
                      : "Saved";
                return lifecycleLabel + " " + formatGuardrailVersionTimestamp(version.publishedAt || version.updatedAt || version.createdAt);
              },
            });
          }

          function renderGuardrailVersionsSidebarPortal() {
            const sidebar = renderGuardrailVersionsSidebar();
            if (!sidebar) {
              return null;
            }
            const drawerContainer = typeof document !== "undefined"
              ? document.getElementById("playground-agent-versions-drawer-root")
              : null;
            if (drawerContainer && typeof createPortal === "function") {
              return createPortal(sidebar, drawerContainer);
            }
            return React.createElement("aside", {
                className: "playground-metronome-node-drawer playground-agent-versions-inline-drawer is-open",
              },
              sidebar
            );
          }

          function renderGuardrailPublishSplitButton() {
            const isBusy = guardrailVersionState.status === "loading";
            const actions = getGuardrailVersionPopupActions();
            return renderPlaygroundPlatformPopup({
              open: guardrailPublishMenuOpen,
              shellRef: guardrailPublishMenuRef,
              shellClassName: "playground-agents-detail-publish-split-shell playground-guardrails-publish-split-shell",
              menuClassName: "playground-agents-detail-publish-menu playground-guardrails-publish-menu",
              trigger: React.createElement("div", {
                  className: "playground-metronome-create-button playground-metronome-publish-button playground-guardrails-publish-button playground-agents-detail-publish-split-control"
                    + (guardrailVersionsSidebarOpen ? " is-active" : "")
                    + (isBusy ? " is-disabled" : ""),
                },
                React.createElement("button", {
                    type: "button",
                    className: "playground-agents-detail-publish-main",
                    title: "Open guardrail versions",
                    "aria-label": "Open guardrail versions",
                    "aria-expanded": guardrailVersionsSidebarOpen ? "true" : "false",
                    disabled: isBusy,
                    onClick: () => {
                      setGuardrailPublishMenuOpen(false);
                      setGuardrailVersionsHeaderMenuOpen(false);
                      setGuardrailVersionsSidebarOpen(true);
                    },
                  },
                  React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Publish")
                ),
                React.createElement("span", { className: "playground-agents-detail-publish-divider", "aria-hidden": "true" }),
                React.createElement("button", {
                    type: "button",
                    className: "playground-agents-detail-publish-chevron",
                    title: "Version save options",
                    "aria-label": "Version save options",
                    "aria-haspopup": "menu",
                    "aria-expanded": guardrailPublishMenuOpen ? "true" : "false",
                    disabled: isBusy,
                    onClick: (event) => {
                      event.stopPropagation();
                      setGuardrailPublishMenuOpen((current) => !current);
                    },
                  },
                  React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                )
              ),
              menuProps: {
                role: "menu",
                onClick: (event) => event.stopPropagation(),
              },
              children: React.createElement(React.Fragment, null,
                actions.map((action) => React.createElement("button", {
                    key: action.id,
                    type: "button",
                    className: "tb-popup-row",
                    role: "menuitem",
                    disabled: isBusy || action.disabled,
                    onClick: () => {
                      setGuardrailPublishMenuOpen(false);
                      action.onClick();
                    },
                  },
                  React.createElement(getPlaygroundSafeIconComponent(action.Icon, Circle), { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.15 }),
                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                    React.createElement("span", null, action.label)
                  ),
                  action.shortcut
                    ? React.createElement("span", {
                        className: "playground-agents-detail-publish-menu-shortcut",
                        "aria-hidden": "true",
                      }, action.shortcut)
                    : null
                ))
              )
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
            const compareOptions = sources.map((source) =>
              React.createElement("option", { key: source.id, value: source.id }, source.label)
            );
            const renderCompareSelect = (value, side) =>
              React.createElement("label", { className: "playground-version-changes-select-shell" },
                React.createElement("span", { className: "playground-version-changes-select-control-wrap" },
                  React.createElement("select", {
                    className: "playground-version-changes-select-control",
                    value,
                    onChange: (event) => handleGuardrailVersionCompareSourceChange(side, event.target.value),
                  }, compareOptions),
                  React.createElement(ChevronDown, { width: 13, height: 13, strokeWidth: 1.8, "aria-hidden": "true" })
                )
              );
            return renderPlaygroundVersionChangesPage({
              title: "Changes",
              compareControls: React.createElement(React.Fragment, null,
                renderCompareSelect(leftSource.id, "left"),
                React.createElement("span", { className: "playground-version-changes-select-arrow", "aria-hidden": "true" }, "→"),
                renderCompareSelect(rightSource.id, "right")
              ),
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

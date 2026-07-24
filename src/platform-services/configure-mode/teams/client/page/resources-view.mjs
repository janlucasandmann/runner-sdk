export const TEAMS_PAGE_RESOURCES_VIEW_SCRIPT = `          const openTeamResourceRow = (row) => {
            const normalizedType = getTeamResourceUiShareType(row?.type || row?.resourceType || "");
            const resourceId = getTeamResourceRowResourceId(row);
            const record = getTeamResourceRowRecord(row);
            if (normalizedType === "project") {
              openTeamProjectResourceSource(row.projectId || row.resourceId || row.record?.resourceId || row.record?.id);
              return;
            }
            if (normalizedType === "environment" || normalizedType === "computer") {
              if (resourceId) {
                setEnvironmentId(resourceId);
                openResourcesView("computers");
                setEnvironmentsNavigationTargetId(resourceId);
                setEnvironmentsOpenToken((current) => current + 1);
                return;
              }
              openTeamResourceProjectFallback(row);
              return;
            }
            if (normalizedType === "agent") {
              if (resourceId) {
                openResourcesView("agents");
                setAgentPageSelectionRequest({
                  agentId: resourceId,
                  token: createPlaygroundPlatformNavigationToken(),
                });
                return;
              }
              openTeamResourceProjectFallback(row);
              return;
            }
            if (normalizedType === "file") {
              if (openTeamResourceFilesRow(row)) {
                return;
              }
              openTeamResourceProjectFallback(row);
              return;
            }
            if (normalizedType === "metronome") {
              if (isTeamResourceTemplateOnlyRow(row)) {
                openResourceTemplatesPage({
                  type: "metronome",
                  templateId: String(record.templateId || record.template_id || "").trim(),
                });
                return;
              }
              const workflowId = String(
                resourceId
                || record.workflowId
                || record.workflow_id
                || record.metronomeId
                || record.metronome_id
                || ""
              ).trim();
              if (workflowId) {
                openMetronomePage({
                  projectId: String(row?.projectId || record.projectId || "").trim(),
                  workflowId,
                });
                return;
              }
              openTeamResourceProjectFallback(row);
              return;
            }
            if (normalizedType === "imagine" || normalizedType === "imagine_template") {
              openTeamResourceImagineTemplateRow(row);
              return;
            }
            const serverKind = getTeamResourceRowServerKind(row);
            if (serverKind && resourceId && !isTeamResourceTemplateOnlyRow(row)) {
              openResourcesView("servers", {
                serverKind,
                resourceType: serverKind === "database" ? "database" : "server",
                resourceId,
              });
              return;
            }
            if (isTeamResourceTemplateOnlyRow(row) && normalizedType) {
              openResourceTemplatesPage({
                type: normalizedType,
                templateId: String(record.templateId || record.template_id || "").trim(),
              });
              return;
            }
            openTeamResourceProjectFallback(row);
          };
          const buildTeamResourceFileIconEntry = (row) => {
            const record = row?.record && typeof row.record === "object" && !Array.isArray(row.record) ? row.record : {};
            const path = normalizeHistoryPath(
              row?.path
              || record.path
              || record.sourcePath
              || record.workspacePath
              || ""
            );
            const name = String(
              record.name
              || record.filename
              || row?.title
              || getHistoryPathName(path)
              || "File"
            ).trim() || "File";
            return {
              ...record,
              name,
              path,
              mimeType: String(record.mimeType || record.contentType || record.type || "").trim(),
              isFolder: Boolean(record.isFolder || record.kind === "folder" || record.mimeType === "inode/directory"),
            };
          };
          const renderTeamResourceIcon = (row, meta) => {
            if (row?.type === "file") {
              const entry = buildTeamResourceFileIconEntry(row);
              const environmentId = String(row?.environmentId || row?.record?.environmentId || row?.record?.sourceEnvironmentId || "").trim();
              return React.createElement("span", { className: "playground-project-resource-title-icon playground-team-resource-file-icon" },
                React.createElement(PlaygroundFileIcon, {
                  entry,
                  environmentId,
                  backendUrl: proxyBackendBase,
                  useThumbnail: true,
                })
              );
            }
            const ResourceIcon = meta?.Icon || Layers;
            return React.createElement("span", { className: "playground-project-resource-title-icon" },
              React.createElement(ResourceIcon, { width: 16, height: 16, strokeWidth: 1.8 })
            );
          };
          const renderTeamResourceAccess = (row) =>
            React.createElement("span", { className: "playground-team-badge playground-team-resource-access-label" }, row?.accessLabel || formatAccess(row?.accessLevel));
          const renderTeamResourceSource = (row) =>
            React.createElement("span", {
              className: "playground-team-badge playground-team-resource-source-badge playground-team-resource-source-label",
              title: row?.sourceTooltip || row?.sourceLabel || "",
            }, row?.sourceLabel || "Unknown");
          const renderTeamResourceOwner = (row) => {
            const ownerLabel = String(row?.ownerLabel || "").trim();
            const ownerAvatarUrl = normalizeSessionPhotoUrl(row?.ownerAvatarUrl || "");
            return React.createElement("span", {
                className: "playground-team-resource-owner-cell",
                title: ownerLabel || "",
              },
              ownerLabel
                ? renderAccountAvatar(
                    "playground-team-resource-owner-avatar",
                    "playground-team-resource-owner-avatar-image",
                    getAccountInitials(ownerLabel),
                    ownerAvatarUrl
                  )
                : null,
              React.createElement("span", {
                className: "playground-team-badge playground-team-resource-owner-label",
              }, ownerLabel || "-")
            );
          };
	          const renderTeamResourceRowMenu = (row, options = {}) => {
	            const share = row?.directShare || row?.record || {};
	            const menuId = getTeamResourceRowMenuId(row);
	            if (!menuId || teamPageResourceMenuId !== menuId) {
	              return null;
	            }
	            const directShare = row?.directShare || null;
	            const canEditDirectShareAccess = Boolean(directShare && canManageTeam && String(row?.type || row?.resourceType || "").trim() !== "project");
	            const projectSources = (Array.isArray(row?.sources) ? row.sources : [])
	              .filter((source) => source.kind === "project" || source.kind === "project_access");
	            const isAccessUpdating = teamPageActionId === "share-access:" + share.id;
	            const isDeleting = teamPageActionId === "share-delete:" + share.id || teamPageActionId === "share-bulk-delete";
	            return React.createElement(PlatformPopupSurface, {
	                className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu playground-project-resources-action-menu"
	                  + (options?.closing ? " is-closing" : " playground-tasks-toolbar-popup-menu-animate-down-in"),
	                role: "menu",
	                onClick: (event) => event.stopPropagation(),
	              },
              canEditDirectShareAccess
                ? accessOptions.map((option) => {
                    const isActive = String(row?.accessLevel || "use") === option.value;
                    return React.createElement("button", {
                        key: option.value,
                        type: "button",
	                        className: "tb-popup-row tb-popup-row-select" + (isActive ? " selected" : ""),
	                        role: "menuitem",
	                        disabled: isAccessUpdating || isDeleting,
	                        onClick: () => {
	                          closeTeamPageResourceActionMenu({ animate: false });
	                          handleUpdateTeamResourceShareAccess(share, option.value);
	                        },
                      },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        isActive
                          ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                          : null
                      ),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, option.label),
                        React.createElement("span", { className: "playground-team-access-option-description" }, option.description)
                      )
                    );
                  })
                : null,
              canEditDirectShareAccess
                ? React.createElement("div", { className: "playground-project-resources-menu-divider" })
                : null,
              projectSources.length > 0
                ? projectSources.slice(0, 4).map((source) =>
                    React.createElement("button", {
	                        key: "source:" + String(source.projectId || source.label || ""),
	                        type: "button",
	                        className: "tb-popup-row playground-project-team-menu-item",
	                        role: "menuitem",
	                        onClick: () => {
	                          closeTeamPageResourceActionMenu({ animate: false });
	                          openTeamProjectResourceSource(source.projectId);
	                        },
	                      },
	                      React.createElement(LayoutDashboard, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
	                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
	                        React.createElement("span", null, source.kind === "project_access" ? "Open project" : "Open " + (source.projectName || "project"))
	                      )
	                    )
	                  )
                : null,
              directShare && canManageTeam
                ? React.createElement("button", {
	                    type: "button",
	                    className: "tb-popup-row playground-project-team-menu-item is-danger",
	                    role: "menuitem",
	                    disabled: isAccessUpdating || isDeleting,
	                    onClick: () => {
	                      closeTeamPageResourceActionMenu({ animate: false });
	                      handleDeleteTeamResourceShare(share.id);
	                    },
	                  },
	                  React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
	                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
	                    React.createElement("span", null, isDeleting ? "Removing..." : "Remove from team")
	                  )
	                )
	                : projectSources.length === 0
	                  ? React.createElement("button", {
	                      type: "button",
	                      className: "tb-popup-row playground-project-team-menu-item",
	                      role: "menuitem",
	                      disabled: true,
	                    }, "No resource actions")
	                  : null
	            );
	          };
	          const renderTeamResourceActionMenuPortal = () => {
	            if (!teamPageResourceActionMenuState) {
	              return null;
	            }
	            const row = teamPageResourceActionMenuState.row || null;
	            const menuElement = React.createElement(PlatformPopupDismissLayer, {
	                className: "sidebar-thread-popup-scrim",
	                style: { zIndex: 360 },
	                onClick: closeTeamPageResourceActionMenu,
	              },
	              React.createElement("div", {
	                className: "playground-platform-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal playground-agents-list-action-menu-shell is-open",
	                style: getTeamResourceActionMenuStyle(teamPageResourceActionMenuState),
	                onClick: (event) => event.stopPropagation(),
	              },
	                renderTeamResourceRowMenu(row, { closing: teamPageResourceActionMenuClosing })
	              )
	            );
	            return typeof createPortal === "function" && typeof document !== "undefined" && document.body
	              ? createPortal(menuElement, document.body)
	              : menuElement;
	          };
	          const renderTeamResourceBulkActionMenuPortal = () => {
	            if (!teamPageResourceBulkActionMenuState) {
	              return null;
	            }
	            const targets = getTeamResourceActionTargetsByIds(teamPageResourceBulkActionMenuState.resourceIds);
	            if (targets.length < 2) {
	              return null;
	            }
	            const removableTargets = targets.filter(canRemoveTeamResourceRow);
	            const isRemoving = teamPageActionId === "share-bulk-delete";
	            const menuElement = React.createElement(PlatformPopupDismissLayer, {
	                className: "sidebar-thread-popup-scrim",
	                style: { zIndex: 360 },
	                onClick: closeTeamPageResourceBulkActionMenu,
	              },
	              React.createElement("div", {
	                className: "playground-platform-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal playground-agents-list-action-menu-shell is-open",
	                style: getTeamResourceActionMenuStyle(teamPageResourceBulkActionMenuState),
	                onClick: (event) => event.stopPropagation(),
	              },
	                React.createElement(PlatformPopupSurface, {
	                  className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu"
	                    + (teamPageResourceBulkActionMenuClosing ? " is-closing" : " playground-tasks-toolbar-popup-menu-animate-down-in"),
	                  role: "menu",
	                },
	                  React.createElement("button", {
	                    type: "button",
	                    role: "menuitem",
	                    className: "tb-popup-row is-danger",
	                    disabled: isRemoving || removableTargets.length === 0,
	                    onClick: () => {
	                      void handleDeleteTeamResourceRows(removableTargets);
	                    },
	                  },
	                    React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
	                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
	                      React.createElement("span", null, isRemoving ? "Removing..." : "Remove selected")
	                    )
	                  )
	                )
	              )
	            );
	            return typeof createPortal === "function" && typeof document !== "undefined" && document.body
	              ? createPortal(menuElement, document.body)
	              : menuElement;
	          };
	          const teamResourceDataTableColumns = [
	            {
	              id: "resource",
	              header: "Resource",
	              accessor: (row) => row?.title || "Untitled resource",
	              sortable: true,
	              width: "minmax(220px, 1.45fr)",
	              cell: ({ row }) => {
	                const meta = getTeamResourceTypeMeta(row?.type || row?.resourceType || "") || { label: "Resource", Icon: Layers };
	                return React.createElement("div", { className: "playground-project-resource-title-cell" },
	                  renderTeamResourceIcon(row, meta),
	                  React.createElement("span", { className: "playground-project-resource-title-copy" },
	                    React.createElement("span", { className: "playground-project-resource-title-main" }, row?.title || "Untitled resource")
	                  )
	                );
	              },
	            },
	            {
	              id: "access",
	              header: "Access",
	              accessor: (row) => row?.accessLabel || row?.accessLevel || "",
	              sortable: true,
	              width: "minmax(120px, 0.78fr)",
	              cell: ({ row }) => renderTeamResourceAccess(row),
	            },
	            {
	              id: "source",
	              header: "Shared Through",
	              accessor: (row) => row?.sourceLabel || "",
	              sortable: true,
	              width: "minmax(135px, 0.82fr)",
	              hideBelow: 820,
	              cell: ({ row }) => renderTeamResourceSource(row),
	            },
	            {
	              id: "updated",
	              header: "Updated",
	              accessor: (row) => row?.updatedAt || row?.updatedLabel || "",
	              sortable: true,
	              sortDescFirst: true,
	              width: "minmax(120px, 0.72fr)",
	              hideBelow: 680,
	              cell: ({ row }) => row?.updatedLabel || "-",
	            },
	            {
	              id: "owner",
	              header: "Owner",
	              accessor: (row) => row?.ownerLabel || "",
	              sortable: true,
	              width: "minmax(135px, 0.85fr)",
	              hideBelow: 940,
	              cell: ({ row }) => renderTeamResourceOwner(row),
	            },
	          ];
	          const teamResourcesDataTable = React.createElement(PlatformDataTable, {
	            rows: teamResourceRows,
	            columns: teamResourceDataTableColumns,
	            getRowId: getTeamResourceSelectionId,
	            ariaLabel: "Team resources",
	            className: "playground-team-resources-platform-data-table",
	            surface: "plain",
	            variant: "minimalistic-ui",
	            sticky: false,
	            sorting: {
	              value: { id: teamPageResourceSort, direction: teamPageResourceSortDirection === "desc" ? "desc" : "asc" },
	              manual: true,
	              onChange: (nextSorting) => {
	                if (nextSorting) handleTeamResourceSortChange(nextSorting.id, nextSorting.direction);
	              },
	            },
	            selection: {
	              enabled: true,
	              value: selectedTeamPageResourceIds,
	              onChange: ({ selectedIds }) => setSelectedTeamPageResourceIds(new Set(selectedIds)),
	              ariaLabel: (row) => "Select " + (row?.title || "resource"),
	            },
	            toolbar: {
	              title: "All Resources",
	              search: {
	                value: teamPageResourceSearchQuery,
	                onChange: setTeamPageResourceSearchQuery,
	                placeholder: "Search resources",
	                ariaLabel: "Search team resources",
	                manual: true,
	              },
	              filters: [{
	                id: "resource-type",
	                label: "Type",
	                value: teamPageResourceFilter,
	                options: teamResourceTypeFilters,
	                onChange: setTeamPageResourceFilter,
	              }],
	            },
	            onRowActivate: openTeamResourceRow,
	            onRowActionTrigger: (event, row) => {
	              const selectionId = getTeamResourceSelectionId(row);
	              if (selectionId && selectedTeamPageResourceIds.has(selectionId) && selectedTeamPageResourceIds.size > 1) {
	                openTeamPageResourceBulkActionMenu(event, Array.from(selectedTeamPageResourceIds));
	                return;
	              }
	              openTeamPageResourceActionMenu(event, row, { openLeft: true });
	            },
	            isRowActionOpen: (row) => Boolean(
	              teamPageResourceActionMenuState?.menuId
	              && getTeamResourceRowMenuId(row) === teamPageResourceActionMenuState.menuId
	            ),
	            onRowContextMenu: (event, row) => {
	              const selectionId = getTeamResourceSelectionId(row);
	              if (selectionId && selectedTeamPageResourceIds.has(selectionId) && selectedTeamPageResourceIds.size > 1) {
	                openTeamPageResourceBulkActionMenu(event, Array.from(selectedTeamPageResourceIds));
	                return;
	              }
	              openTeamPageResourceActionMenu(event, row, { context: true });
	            },
	            loading: teamPageLoading && teamResourceRowsAll.length === 0,
	            emptyState: teamResourceRowsAll.length === 0
	              ? "No resources shared yet."
	              : "No shared resources match this view yet.",
	          });
	          const renderResourcesTab = () => React.createElement("div", { className: "playground-team-detail-panel playground-team-resources-panel" },
	            React.createElement(React.Fragment, null,
	              teamResourcesDataTable,
	              renderTeamResourceActionMenuPortal(),
	              renderTeamResourceBulkActionMenuPortal()
	            )
	          );

`;

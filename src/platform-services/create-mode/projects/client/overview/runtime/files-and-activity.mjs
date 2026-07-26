export const PROJECT_OVERVIEW_FILES_ACTIVITY_FRAGMENT = String.raw`
          function renderProjectOverviewFilesToolbar() {
            return React.createElement("div", { className: "playground-plugins-search-row", ref: projectOverviewFilesToolbarRef },
              React.createElement("div", { className: "playground-plugins-search-shell" },
                React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("input", {
                  type: "search",
                  value: projectOverviewFileSearchQuery,
                  onChange: (event) => setProjectOverviewFileSearchQuery(event.target.value),
                  className: "playground-plugins-search",
                  placeholder: "Search files",
                  "aria-label": "Search project files",
                })
              ),
              React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-sort" + (projectOverviewFileToolbarPopover === "sort" || projectOverviewFileSortMode !== "recent-desc" ? " is-active" : ""),
                    onClick: () => setProjectOverviewFileToolbarPopover((current) => current === "sort" ? "" : "sort"),
                    title: activeProjectOverviewFileSortOption.label,
                  },
                    React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Sort")
                  ),
                  projectOverviewFileToolbarPopover === "sort"
                    ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        projectOverviewFileSortOptions.map((option) =>
                          renderProjectOverviewTaskToolbarOption({
                            option,
                            active: projectOverviewFileSortMode === option.id,
                            onClick: () => {
                              setProjectOverviewFileSortMode(option.id);
                              setProjectOverviewFileToolbarPopover("");
                            },
                          })
                        )
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-filter" + (projectOverviewFileToolbarPopover === "filter" || projectOverviewFileFilterMode !== "all" ? " is-active" : ""),
                    onClick: () => setProjectOverviewFileToolbarPopover((current) => current === "filter" ? "" : "filter"),
                    title: activeProjectOverviewFileFilterOption.label,
                  },
                    React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Filter")
                  ),
                  projectOverviewFileToolbarPopover === "filter"
                    ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        projectOverviewFileFilterOptions.map((option) =>
                          renderProjectOverviewTaskToolbarOption({
                            option,
                            active: projectOverviewFileFilterMode === option.id,
                            onClick: () => {
                              setProjectOverviewFileFilterMode(option.id);
                              setProjectOverviewFileToolbarPopover("");
                            },
                          })
                        )
                      )
                    : null
                )
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-files-control-button playground-project-overview-toolbar-action",
                onClick: () => {
                  const normalizedProjectId = String(selectedProjectId || "").trim();
                  const normalizedEnvironmentId = String(
                    selectedProject?.defaultEnvironmentId
                    || activeProjectAttachmentEnvironmentId
                    || ""
                  ).trim();
                  if (typeof onOpenFilesPage === "function") {
                    onOpenFilesPage({
                      token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                      projectId: normalizedProjectId,
                      environmentId: normalizedEnvironmentId,
                    });
                  }
                },
              },
                React.createElement(FolderOpen, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Open Files")
              )
            );
          }

          function renderProjectOverviewFilesActivityPanel() {
            return React.createElement(React.Fragment, null,
              React.createElement("div", { className: "playground-project-overview-files-activity" },
                React.createElement(PlatformDataTable, {
                  rows: filteredProjectFileActivityItems,
                  getRowId: (row) => String(row?.id || [row?.threadId, row?.stepId, row?.path].filter(Boolean).join(":")),
                  ariaLabel: "Project file activity",
                  className: "playground-project-files-platform-table",
                  surface: "plain",
                  sticky: false,
                  loading: projectOverviewFileActivityState?.status === "loading",
                  error: projectOverviewFileActivityState?.status === "error"
                    ? (projectOverviewFileActivityState.error || "Failed to load project file activity.")
                    : null,
                  emptyState: hasProjectOverviewFileListFilters ? "No matching project file activity." : "No project file activity yet.",
                  columns: [
                    {
                      id: "title",
                      header: "File Title",
                      accessor: (row) => row?.title || "Untitled file",
                      width: "minmax(180px, 1.5fr)",
                      cell: ({ row }) => React.createElement("div", { className: "playground-plugin-row-title" }, row?.title || "Untitled file"),
                    },
                    { id: "operation", header: "Operation", accessor: (row) => row?.operation || "Modified", width: "minmax(90px, 0.75fr)" },
                    {
                      id: "modified-by",
                      header: "Modified by",
                      accessor: (row) => row?.assignee || "No agent",
                      width: "minmax(130px, 1fr)",
                      cell: ({ row }) => {
                        const assigneeId = String(row?.assigneeId || "").trim();
                        const assigneeAgent = assigneeId && agentsById && agentsById[assigneeId] ? agentsById[assigneeId] : null;
                        const assigneePhotoUrl = assigneeAgent ? normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(assigneeAgent)) : "";
                        return React.createElement("div", { className: "playground-project-overview-file-assignee" },
                          row?.assignee ? renderAgentNameAvatar(row.assignee, "playground-project-overview-agent-avatar", assigneePhotoUrl) : null,
                          React.createElement("div", { className: "playground-project-overview-file-assignee-name" }, row?.assignee || "No agent")
                        );
                      },
                    },
                    {
                      id: "task",
                      header: "Task",
                      accessor: (row) => row?.taskTicketNumber || "—",
                      width: "minmax(80px, 0.65fr)",
                      hideBelow: 760,
                      cell: ({ row }) => {
                        const taskId = String(row?.taskId || "").trim();
                        const taskLabel = String(row?.taskTicketNumber || "").trim() || "—";
                        return taskId
                          ? React.createElement("button", {
                              type: "button",
                              className: "playground-project-overview-file-task-button",
                              onClick: (event) => {
                                event.stopPropagation();
                                if (typeof handleSelectTask === "function") handleSelectTask(taskId);
                              },
                            }, taskLabel)
                          : taskLabel;
                      },
                    },
                    { id: "date", header: "Date", accessor: (row) => row?.dateLabel || "—", width: "minmax(100px, 0.8fr)", align: "end" },
                  ],
                  onRowActivate: (row) => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(row),
                  getRowAriaLabel: (row) => "Open file " + (row?.title || "Untitled file"),
                  getRowActions: (row) => {
                    const rowId = String(row?.id || "").trim();
                    const isRowMutating = projectOverviewFileMutationState?.rowId === rowId;
                    const isRenaming = isRowMutating && projectOverviewFileMutationState?.action === "rename";
                    const isReverting = isRowMutating && projectOverviewFileMutationState?.action === "revert";
                    const isDeleting = isRowMutating && projectOverviewFileMutationState?.action === "delete";
                    const busy = isRenaming || isReverting || isDeleting;
                    return [
                      { id: "rename", label: isRenaming ? "Renaming..." : "Rename file", icon: SquarePen, disabled: busy, onSelect: () => handleProjectOverviewFileRename?.(row) },
                      { id: "revert", label: isReverting ? "Reverting..." : "Revert changes", icon: History, disabled: busy || !String(row?.revertTargetStepId || "").trim(), onSelect: () => handleProjectOverviewFileRevert?.(row) },
                      { id: "show-file", label: "Show in Files", icon: FolderOpen, disabled: busy, onSelect: () => navigateProjectOverviewFileToFiles?.(row) },
                      { id: "show-task", label: "Show Task", icon: ListTodo, disabled: busy || !String(row?.taskId || "").trim(), onSelect: () => handleSelectTask?.(String(row.taskId).trim()) },
                      { id: "delete", label: isDeleting ? "Deleting..." : "Delete", icon: Trash2, danger: true, separatorBefore: true, disabled: busy, onSelect: () => handleProjectOverviewFileDelete?.(row) },
                    ];
                  },
                })
              ),
              projectOverviewFileMutationState?.error
                ? React.createElement("div", { className: "playground-environments-error" }, projectOverviewFileMutationState.error)
                : null
            );
          }

          function renderProjectOverviewAttachmentsPanel() {
            return React.createElement("div", { className: "playground-tasks-attachments" },
              React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Attachments"),
                React.createElement("div", { className: "playground-tasks-attachments-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                    onClick: openProjectEnvironmentFilePicker,
                    disabled: projectAttachmentTransferState.isProcessing || !activeProjectAttachmentEnvironmentId,
                    title: activeProjectAttachmentEnvironmentId
                      ? "Add files from " + (activeProjectAttachmentEnvironment?.name || "the selected environment")
                      : "Select an environment first",
                  }, "From Environment")
                )
              ),
              React.createElement("input", {
                ref: projectAttachmentInputRef,
                type: "file",
                multiple: true,
                hidden: true,
                onChange: (event) => void handleProjectAttachmentInputChange(event),
              }),
              React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                React.createElement("div", {
                  className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isProjectAttachmentDragging ? " dragging" : "") + (hasOverviewProjectAttachments ? " is-filled" : ""),
                  onDragOver: (event) => {
                    event.preventDefault();
                    if (!activeProjectAttachmentEnvironmentId) {
                      return;
                    }
                    setIsProjectAttachmentDragging(true);
                  },
                  onDragLeave: (event) => {
                    if (event.currentTarget.contains(event.relatedTarget)) {
                      return;
                    }
                    setIsProjectAttachmentDragging(false);
                  },
                  onDrop: (event) => void handleProjectAttachmentDrop(event),
                },
                  hasOverviewProjectAttachments
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-tasks-attachments-topline" },
                          React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                          React.createElement("span", null, isProjectAttachmentDragging ? "Drop files here" : "Drop files to attach, or"),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-tasks-attachments-browse",
                            onClick: openProjectAttachmentPicker,
                          }, "browse.")
                        ),
                        React.createElement("div", { className: "runner-attachments" },
                          overviewProjectAttachments.map((attachment) =>
                            renderTaskAttachmentChip(attachment, {
                              removable: true,
                              activeAttachmentId: projectPreviewedAttachmentId,
                              onPreview: openOverviewAttachmentInFiles,
                              onRemove: handleRemoveProjectAttachment,
                            })
                          )
                        )
                      )
                    : React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-attachments-empty-button",
                        onClick: openProjectAttachmentPicker,
                      },
                        React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                        React.createElement("span", { className: "tb-popup-dropzone-title" }, isProjectAttachmentDragging ? "Drop files here" : "Drag & drop files here"),
                        React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                      )
                )
              ),
              projectAttachmentTransferState.isProcessing
                ? React.createElement("div", { className: "playground-tasks-attachments-status" }, "Uploading attachments...")
                : null,
              projectAttachmentTransferState.error
                ? React.createElement("div", { className: "playground-environments-error" }, projectAttachmentTransferState.error)
                : null
            );
          }

          function renderProjectOverviewServerResourcesPanel(resourceItems = overviewResourceItems, emptyLabel = "No project resources have been created yet.") {
            const visibleResourceItems = Array.isArray(resourceItems) ? resourceItems : [];
            return React.createElement("div", { className: "playground-project-overview-resources-block" },
              React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Server Resources")
              ),
              React.createElement(PlatformDataTable, {
                rows: visibleResourceItems.slice(0, 12),
                getRowId: (resource) => String(resource.id || resource.title),
                ariaLabel: "Project server resources",
                className: "playground-project-resources-platform-table",
                surface: "plain",
                sticky: false,
                loading: projectOverviewServerResourcesState?.status === "loading",
                error: projectOverviewServerResourcesState?.status === "error"
                  ? (projectOverviewServerResourcesState.error || "Failed to load project resources.")
                  : null,
                emptyState: normalizedSearchQuery ? "No matching resources." : emptyLabel,
                columns: [
                  {
                    id: "title",
                    header: "Title",
                    accessor: (resource) => resource?.title || "Untitled Resource",
                    width: "minmax(180px, 1.5fr)",
                    cell: ({ row: resource }) => React.createElement("div", { className: "playground-plugin-row-title" }, resource?.title || "Untitled Resource"),
                  },
                  { id: "endpoint", header: "Endpoint", accessor: (resource) => resource?.endpoint || "Internal", width: "minmax(160px, 1.3fr)", hideBelow: 720 },
                  {
                    id: "creator",
                    header: "Creator",
                    width: "minmax(130px, 1fr)",
                    cell: ({ row: resource }) => renderProjectOverviewResourceCreator({ record: resource }),
                  },
                  {
                    id: "date",
                    header: "Date",
                    accessor: (resource) => resource?.updatedAt || "",
                    width: "minmax(100px, 0.8fr)",
                    align: "end",
                    cell: ({ row: resource }) => (typeof formatThreadSearchTimestamp === "function" ? formatThreadSearchTimestamp(resource?.updatedAt || "") : null) || formatRelativeThreadTime(resource?.updatedAt || "") || "—",
                  },
                ],
              })
            );
          }

          function renderProjectOverviewImagineResourceCard(resource) {
            const resourcePath = String(resource?.path || resource?.sourcePath || resource?.workspacePath || "").trim();
            const resourceTitle = String(resource?.title || resource?.filename || getHistoryPathName(resourcePath) || "Untitled visual").trim();
            const candidate = [resource?.mimeType, resource?.contentType, resource?.type, resource?.fileType, resourcePath, resourceTitle].join(" ");
            const isVideoResource = /^video\//i.test(String(candidate || "")) || /\.(m4v|mkv|mov|mp4|webm)$/i.test(String(candidate || ""));
            return React.createElement("button", {
                key: String(resource?.id || resourcePath || resourceTitle),
                type: "button",
                className: "playground-project-overview-imagine-card",
                onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(resource),
              },
              React.createElement("span", { className: "playground-project-overview-imagine-card-icon" },
                React.createElement(isVideoResource ? Film : ImageIcon, { width: 16, height: 16, strokeWidth: 1.8 })
              ),
              React.createElement("span", { className: "playground-project-overview-imagine-card-body" },
                React.createElement("span", { className: "playground-project-overview-imagine-card-title" }, resourceTitle),
                resourcePath
                  ? React.createElement("span", { className: "playground-project-overview-imagine-card-path" }, resourcePath)
                  : null,
                React.createElement("span", { className: "playground-project-overview-imagine-card-meta" },
                  [resource?.operation || "Created", resource?.dateLabel || ""].filter(Boolean).join(" · ")
                )
              )
            );
          }

          function renderProjectOverviewImagineResourcesPanel() {
            if (projectOverviewFileActivityState?.status === "loading") {
              return React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Loading imagine resources...");
            }
            if (projectOverviewFileActivityState?.status === "error") {
              return React.createElement("div", { className: "playground-environments-error" }, projectOverviewFileActivityState.error || "Failed to load imagine resources.");
            }
            if (projectOverviewImagineResources.length > 0) {
              return React.createElement("div", { className: "playground-project-overview-imagine-grid" },
                projectOverviewImagineResources.map((resource) => renderProjectOverviewImagineResourceCard(resource))
              );
            }
            return React.createElement("div", { className: "playground-project-overview-imagine-empty" },
              React.createElement(ImageIcon, { width: 22, height: 22, strokeWidth: 1.7 }),
              React.createElement("div", null, "No imagine resources yet."),
              React.createElement("div", null, "Images and visual assets created from this project will appear here.")
            );
          }

          function renderProjectOverviewFilesSubviewHeader(title, description) {
            return React.createElement("div", { className: "playground-project-overview-files-subview-header" },
              React.createElement("div", null,
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-files-subview-back",
                  onClick: () => typeof setProjectOverviewFilesSubview === "function" && setProjectOverviewFilesSubview("overview"),
                },
                  React.createElement(ChevronLeft, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Back to Resources")
                ),
                React.createElement("div", { className: "playground-project-overview-files-subview-title" }, title),
                description
                  ? React.createElement("div", { className: "playground-project-overview-files-subview-copy" }, description)
                  : null
              )
            );
          }

          function getProjectOverviewResourceSubviewInfo(subviewId) {
            const id = String(subviewId || "").trim();
            if (id === "web-apps") {
              return {
                title: "Web Apps",
                description: "Project web apps connected to this workspace.",
                emptyLabel: "No web apps have been created for this project yet.",
              };
            }
            if (id === "functions") {
              return {
                title: "Functions",
                description: "Project functions connected to this workspace.",
                emptyLabel: "No functions have been created for this project yet.",
              };
            }
            if (id === "databases") {
              return {
                title: "Databases",
                description: "Project databases connected to this workspace.",
                emptyLabel: "No databases have been created for this project yet.",
              };
            }
            return {
              title: "Server Resources",
              description: "Track the deployable resources connected to this project.",
              emptyLabel: "No project resources have been created yet.",
            };
          }

          function getProjectOverviewResourcesForSubview(subviewId) {
            const id = String(subviewId || "").trim();
            if (id === "web-apps") {
              return overviewResourceItems.filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewWebAppResource(item));
            }
            if (id === "functions") {
              return overviewResourceItems.filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewFunctionResource(item));
            }
            if (id === "databases") {
              return overviewResourceItems.filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewDatabaseResource(item));
            }
            return overviewResourceItems;
          }

          function renderProjectOverviewFilesConnectorBadge(row) {
            return React.createElement("span", {
                key: row.id || row.source || row.label,
                className: "playground-project-overview-files-connector-pill",
                title: row.label,
              },
              renderTaskConnectorServiceIcon(row.source, "playground-project-overview-files-connector-icon")
            );
          }

          function renderProjectOverviewFilesNavCard({ id, title, copy, Icon, onClick }) {
            return React.createElement("button", {
                key: id,
                type: "button",
                className: "playground-project-overview-files-nav-card",
                onClick: typeof onClick === "function"
                  ? onClick
                  : () => typeof setProjectOverviewFilesSubview === "function" && setProjectOverviewFilesSubview(id),
              },
              React.createElement("div", { className: "playground-project-overview-files-nav-card-icon" },
                React.createElement(Icon, { width: 17, height: 17, strokeWidth: 1.8 })
              ),
              React.createElement("div", { className: "playground-project-overview-files-nav-card-title" }, title),
              React.createElement("div", { className: "playground-project-overview-files-nav-card-copy" }, copy)
            );
          }

          function renderProjectOverviewFilesNavCards() {
            return React.createElement("div", { className: "playground-project-overview-files-card-grid" },
              renderProjectOverviewFilesNavCard({
                id: "files",
                title: "Files",
                copy: "Open project-scoped files, attachments, and generated artifacts.",
                Icon: FolderOpen,
                onClick: () => {
                  if (typeof onOpenFilesPage !== "function") return;
                  onOpenFilesPage({
                    token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                    projectId: normalizedSelectedProjectId,
                    environmentId: activeProjectAttachmentEnvironmentId || selectedProject?.defaultEnvironmentId || "",
                  });
                },
              }),
              renderProjectOverviewFilesNavCard({
                id: "metronomes",
                title: "Metronomes",
                copy: "Manage recurring project workflows and automated agent routines.",
                Icon: Metronome,
                onClick: () => {
                  if (typeof onOpenProjectMetronomes !== "function") return;
                  onOpenProjectMetronomes({
                    projectId: normalizedSelectedProjectId,
                  });
                },
              }),
              renderProjectOverviewFilesNavCard({
                id: "resources",
                title: "Server Resources",
                copy: "Inspect web apps, functions, databases, auth, and secrets.",
                Icon: Server,
                onClick: () => typeof setProjectOverviewFilesSubview === "function" && setProjectOverviewFilesSubview("resources"),
              }),
              renderProjectOverviewFilesNavCard({
                id: "imagine",
                title: "Imagine Resources",
                copy: "Review images and visual assets created in this project.",
                Icon: Clapperboard,
                onClick: () => typeof setProjectOverviewFilesSubview === "function" && setProjectOverviewFilesSubview("imagine"),
              })
            );
          }

          function renderProjectOverviewFilesTab() {
            if (projectOverviewFilesSubviewId === "overview") {
              return null;
            }
            if (projectOverviewFilesSubviewId === "resources") {
              const resourceSubviewInfo = getProjectOverviewResourceSubviewInfo(projectOverviewFilesSubviewId);
              return React.createElement("section", { className: "playground-tasks-project-panel playground-project-overview-files-section" },
                renderProjectOverviewFilesSubviewHeader(resourceSubviewInfo.title, resourceSubviewInfo.description),
                renderProjectOverviewServerResourcesPanel(getProjectOverviewResourcesForSubview(projectOverviewFilesSubviewId), resourceSubviewInfo.emptyLabel)
              );
            }
            if (projectOverviewFilesSubviewId === "web-apps" || projectOverviewFilesSubviewId === "functions" || projectOverviewFilesSubviewId === "databases") {
              const resourceSubviewInfo = getProjectOverviewResourceSubviewInfo(projectOverviewFilesSubviewId);
              return React.createElement("section", { className: "playground-tasks-project-panel playground-project-overview-files-section" },
                renderProjectOverviewFilesSubviewHeader(resourceSubviewInfo.title, resourceSubviewInfo.description),
                renderProjectOverviewServerResourcesPanel(getProjectOverviewResourcesForSubview(projectOverviewFilesSubviewId), resourceSubviewInfo.emptyLabel)
              );
            }
            if (projectOverviewFilesSubviewId === "imagine") {
              return React.createElement("section", { className: "playground-tasks-project-panel playground-project-overview-files-section" },
                renderProjectOverviewFilesSubviewHeader("Imagine Resources", "Visual resources created in the scope of this project."),
                renderProjectOverviewImagineResourcesPanel()
              );
            }
            return null;
          }

          function renderProjectOverviewHeaderResource(resource) {
            return React.createElement("div", {
                key: "resource:" + resource.id,
                className: "playground-project-overview-summary-resource-item",
              },
              React.createElement("div", { className: "playground-project-overview-summary-resource-label" },
                React.createElement("span", null, resource.label),
                React.createElement("span", { className: "playground-project-overview-summary-resource-chip" }, resource.chip)
              ),
              React.createElement("div", { className: "playground-project-overview-summary-resource-endpoint" },
                String(resource.endpoint || "").trim() || String(resource.description || "").trim() || "Internal project resource"
              )
            );
          }

          function renderProjectOverviewActorPill(entry) {
            return React.createElement("div", {
                key: "actor:" + entry.id,
                className: "playground-project-overview-summary-actor-pill",
              },
              typeof renderAgentNameAvatar === "function"
                ? renderAgentNameAvatar(entry.name, "playground-project-overview-agent-avatar playground-project-overview-summary-actor-avatar", entry.photoUrl)
                : null,
              React.createElement("span", { className: "playground-project-overview-summary-actor-name" }, entry.name),
              React.createElement("span", { className: "playground-project-overview-summary-actor-count" }, entry.openCount + " open")
            );
          }

          function renderOverviewTaskRow(task) {
            const taskId = String(task?.id || "").trim();
            const ticketNumber = taskTicketNumbersById[taskId] || task?.ticketNumber || "000";
            const isSubtask = typeof isPlaygroundSubtaskRecord === "function" ? isPlaygroundSubtaskRecord(task) : false;
            const TaskTypeIcon = isSubtask ? Check : Bookmark;
            const openTaskDetail = () => {
              if (!taskId) {
                return;
              }
              if (typeof openProjectTaskDetailScreen === "function") {
                openProjectTaskDetailScreen(taskId);
                return;
              }
              if (typeof handleSelectTask === "function") {
                handleSelectTask(taskId, { screen: true });
              }
            };

            return React.createElement(PlatformTicketItem, {
                key: taskId || ticketNumber,
                variant: "list",
                taskType: isSubtask ? "subtask" : "task",
                typeIcon: React.createElement(TaskTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 }),
                priority: typeof renderPlaygroundTaskPriorityIcon === "function"
                  ? renderPlaygroundTaskPriorityIcon(task?.priority, "playground-tasks-backlog-priority")
                  : null,
                ticketNumber,
                title: task?.title || "Untitled Task",
                completed: String(task?.status || "").trim() === "done",
                status: typeof renderTaskPreviewStatusControl === "function"
                  ? renderTaskPreviewStatusControl(task)
                  : null,
                assignee: typeof renderTaskAssigneeAvatar === "function"
                  ? renderTaskAssigneeAvatar(task, "playground-tasks-backlog-assignee-avatar")
                  : null,
                className: typeof isTaskPreviewStatusMenuOpen === "function" && isTaskPreviewStatusMenuOpen(taskId)
                  ? "is-status-menu-open"
                  : "",
                role: "button",
                tabIndex: 0,
                style: typeof getPlaygroundTaskColorStyle === "function" ? getPlaygroundTaskColorStyle(task?.taskColor) : undefined,
                onClick: openTaskDetail,
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openTaskDetail();
                  }
                },
              });
          }

          function getProjectOverviewThreadRecordObject(value) {
            return value && typeof value === "object" && !Array.isArray(value) ? value : {};
          }

          function getProjectOverviewThreadMetadataParts(thread) {
            const normalizedThread = getProjectOverviewThreadRecordObject(thread);
            const rawThread = getProjectOverviewThreadRecordObject(normalizedThread.rawThread);
            const metadata = getProjectOverviewThreadRecordObject(rawThread.metadata || normalizedThread.metadata);
            const runnerPlayground = getProjectOverviewThreadRecordObject(metadata.runnerPlayground);
            const runnerPlaygroundSnake = getProjectOverviewThreadRecordObject(metadata.runner_playground);
            const runner = Object.keys(runnerPlayground).length > 0 ? runnerPlayground : runnerPlaygroundSnake;
            const taskPreview = getProjectOverviewThreadRecordObject(runner.taskPreview || runner.task_preview);
            const missionControl = getProjectOverviewThreadRecordObject(runner.missionControl || runner.mission_control);
            const agentAssistant = getProjectOverviewThreadRecordObject(runner.agentAssistant || runner.agent_assistant);
            const metronome = getProjectOverviewThreadRecordObject(
              metadata.metronome
              || metadata.metronomeWorkflow
              || metadata.metronome_workflow
              || runner.metronome
              || runner.metronomeWorkflow
              || runner.metronome_workflow
            );
            const sourceRecord = getProjectOverviewThreadRecordObject(rawThread.source || metadata.source || runner.source);
            const triggerRecord = getProjectOverviewThreadRecordObject(rawThread.trigger || metadata.trigger || runner.trigger);
            return {
              rawThread,
              normalizedThread,
              metadata,
              runner,
              taskPreview,
              missionControl,
              agentAssistant,
              metronome,
              sourceRecord,
              triggerRecord,
            };
          }

          function readProjectOverviewThreadStringFromSources(sources, keys) {
            for (const source of sources) {
              if (!source || typeof source !== "object" || Array.isArray(source)) {
                continue;
              }
              for (const key of keys) {
                const value = source[key];
                if (typeof value === "string" && value.trim()) {
                  return value.trim();
                }
                if (typeof value === "number" && Number.isFinite(value)) {
                  return String(value);
                }
              }
            }
            return "";
          }

          function formatProjectOverviewThreadSourceLabel(value) {
            const rawValue = String(value || "").trim();
            const normalizedValue = rawValue.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
            if (!normalizedValue) {
              return "";
            }
            if (normalizedValue.includes("mission_control")) return "Mission Control";
            if (normalizedValue.includes("metronome") || normalizedValue.includes("workflow")) return "Metronome";
            if (normalizedValue.includes("email") || normalizedValue.includes("gmail") || normalizedValue === "mail" || normalizedValue.includes("inbox")) return "Email";
            if (normalizedValue.includes("slack")) return "Slack";
            if (normalizedValue.includes("discord")) return "Discord";
            if (normalizedValue.includes("telegram")) return "Telegram";
            if (normalizedValue.includes("webhook")) return "Webhook";
            if (normalizedValue.includes("api")) return "API";
            if (normalizedValue.includes("schedule") || normalizedValue.includes("cron")) return "Schedule";
            if (normalizedValue.includes("github")) return "GitHub";
            if (normalizedValue.includes("gitlab")) return "GitLab";
            if (
              normalizedValue.includes("chat")
              || normalizedValue.includes("thread")
              || normalizedValue.includes("assistant")
              || normalizedValue.includes("manual")
              || normalizedValue.includes("composer")
              || normalizedValue.includes("input")
              || normalizedValue.includes("sidebar")
              || normalizedValue.includes("private")
              || normalizedValue === "runner_web_sdk"
              || normalizedValue.includes("runner_web_sdk")
              || normalizedValue.includes("runner_web")
            ) {
              return "Chat";
            }
            return normalizedValue
              .split("_")
              .filter(Boolean)
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ");
          }

          function getProjectOverviewThreadSourceLabel(thread) {
            const parts = getProjectOverviewThreadMetadataParts(thread);
            const sourceSources = [
              parts.rawThread,
              parts.normalizedThread,
              parts.metadata,
              parts.runner,
              parts.taskPreview,
              parts.missionControl,
              parts.agentAssistant,
              parts.metronome,
              parts.sourceRecord,
              parts.triggerRecord,
            ];
            const metronomeCue = readProjectOverviewThreadStringFromSources(sourceSources, [
              "metronomeId",
              "metronome_id",
              "metronomeWorkflowId",
              "metronome_workflow_id",
              "workflowId",
              "workflow_id",
              "workflowRunId",
              "workflow_run_id",
            ]);
            if ((typeof getThreadMetronomeMetadata === "function" && getThreadMetronomeMetadata(thread)) || metronomeCue || Object.keys(parts.metronome).length > 0) {
              return "Metronome";
            }
            const explicitSource = readProjectOverviewThreadStringFromSources(sourceSources, [
              "source",
              "sourceType",
              "source_type",
              "triggerSource",
              "trigger_source",
              "trigger",
              "triggerType",
              "trigger_type",
              "origin",
              "originType",
              "origin_type",
              "channel",
              "channelType",
              "channel_type",
              "connector",
              "connectorType",
              "connector_type",
              "integration",
              "provider",
              "providerId",
              "provider_id",
              "resourceType",
              "resource_type",
              "runKind",
              "run_kind",
              "app",
              "appId",
              "app_id",
              "type",
              "kind",
            ]);
            return formatProjectOverviewThreadSourceLabel(explicitSource) || "Chat";
          }

          function getProjectOverviewThreadEnvironmentLabel(thread) {
            const parts = getProjectOverviewThreadMetadataParts(thread);
            const taskPreview = typeof getThreadTaskPreview === "function" ? (getThreadTaskPreview(thread) || parts.taskPreview) : parts.taskPreview;
            const missionControl = typeof getThreadMissionControlMetadata === "function" ? (getThreadMissionControlMetadata(thread) || parts.missionControl) : parts.missionControl;
            const projectRecord = getProjectOverviewThreadRecordObject(
              parts.rawThread.project
              || parts.metadata.project
              || parts.runner.project
              || taskPreview.project
              || missionControl.project
            );
            const environmentRecord = getProjectOverviewThreadRecordObject(
              parts.rawThread.environment
              || parts.rawThread.computer
              || parts.metadata.environment
              || parts.metadata.computer
              || parts.runner.environment
              || parts.runner.computer
              || taskPreview.environment
            );
            const projectName = readProjectOverviewThreadStringFromSources([projectRecord], [
              "projectName",
              "project_name",
              "displayName",
              "display_name",
              "name",
              "title",
            ]) || readProjectOverviewThreadStringFromSources([
              taskPreview,
              missionControl,
              parts.rawThread,
              parts.normalizedThread,
              parts.metadata,
              parts.runner,
            ], [
              "projectName",
              "project_name",
            ]);
            if (projectName) {
              return projectName;
            }
            const environmentId = readProjectOverviewThreadStringFromSources([environmentRecord], [
              "environmentId",
              "environment_id",
              "computerId",
              "computer_id",
              "id",
            ]) || readProjectOverviewThreadStringFromSources([
              taskPreview,
              parts.rawThread,
              parts.normalizedThread,
              parts.metadata,
              parts.runner,
            ], [
              "environmentId",
              "environment_id",
              "computerId",
              "computer_id",
            ]);
            const listedEnvironment = environmentId && environmentsById ? environmentsById[environmentId] || null : null;
            const environmentName = readProjectOverviewThreadStringFromSources([
              environmentRecord,
              listedEnvironment,
            ], [
              "environmentName",
              "environment_name",
              "computerName",
              "computer_name",
              "displayName",
              "display_name",
              "name",
              "title",
            ]) || readProjectOverviewThreadStringFromSources([
              taskPreview,
              parts.rawThread,
              parts.normalizedThread,
              parts.metadata,
              parts.runner,
            ], [
              "environmentName",
              "environment_name",
              "computerName",
              "computer_name",
            ]);
            if (environmentName) {
              return environmentName;
            }
            const projectId = readProjectOverviewThreadStringFromSources([projectRecord], [
              "projectId",
              "project_id",
              "id",
            ]) || readProjectOverviewThreadStringFromSources([
              taskPreview,
              missionControl,
              parts.rawThread,
              parts.normalizedThread,
              parts.metadata,
              parts.runner,
            ], [
              "projectId",
              "project_id",
            ]);
            return projectId || environmentId || String(selectedProject?.name || selectedProject?.title || "").trim() || "Workspace";
          }

          function getProjectOverviewThreadIdentitySources(value) {
            const source = getProjectOverviewThreadRecordObject(value);
            return [
              source,
              getProjectOverviewThreadRecordObject(source.user),
              getProjectOverviewThreadRecordObject(source.profile),
              getProjectOverviewThreadRecordObject(source.account),
              getProjectOverviewThreadRecordObject(source.identity),
              getProjectOverviewThreadRecordObject(source.member),
            ].filter((entry) => Object.keys(entry).length > 0);
          }

          function normalizeProjectOverviewThreadPersonIdentity(record, fallback = {}) {
            const sources = [
              ...getProjectOverviewThreadIdentitySources(record),
              getProjectOverviewThreadRecordObject(fallback),
            ];
            const email = readProjectOverviewThreadStringFromSources(sources, [
              "email",
              "emailAddress",
              "email_address",
              "mail",
              "userEmail",
              "user_email",
            ]).toLowerCase();
            const name = readProjectOverviewThreadStringFromSources(sources, [
              "displayName",
              "display_name",
              "name",
              "fullName",
              "full_name",
              "label",
              "userName",
              "user_name",
            ]);
            const userId = readProjectOverviewThreadStringFromSources(sources, [
              "userId",
              "user_id",
              "uid",
              "firebaseUid",
              "firebase_uid",
              "accountId",
              "account_id",
              "id",
            ]);
            const avatarUrl = readProjectOverviewThreadStringFromSources(sources, [
              "avatarUrl",
              "avatarURL",
              "avatar_url",
              "photoURL",
              "photoUrl",
              "photo_url",
              "picture",
              "imageUrl",
              "image_url",
              "profileImageUrl",
              "profile_image_url",
            ]);
            return {
              name,
              email,
              userId,
              id: userId,
              avatarUrl: typeof normalizeSessionPhotoUrl === "function" ? normalizeSessionPhotoUrl(avatarUrl) : avatarUrl,
            };
          }

          function getProjectOverviewThreadPersonMatchKeys(identity) {
            const source = getProjectOverviewThreadRecordObject(identity);
            return [
              String(source.email || "").trim().toLowerCase(),
              String(source.userId || "").trim(),
              String(source.id || "").trim(),
            ].filter(Boolean);
          }

          const projectOverviewThreadPersonCandidates = [
            normalizeProjectOverviewThreadPersonIdentity({
              name: currentUserName,
              email: currentUserEmail,
              userId: currentUserId,
              avatarUrl: currentUserAvatarUrl,
            }),
            ...projectOverviewSharedTeamMemberRows.map((member) => normalizeProjectOverviewThreadPersonIdentity(member)),
          ].filter((identity) => getProjectOverviewThreadPersonMatchKeys(identity).length > 0 || String(identity.name || "").trim());

          function findProjectOverviewThreadPersonMatch(identity) {
            const keys = new Set(getProjectOverviewThreadPersonMatchKeys(identity));
            if (keys.size === 0) {
              return null;
            }
            return projectOverviewThreadPersonCandidates.find((candidate) =>
              getProjectOverviewThreadPersonMatchKeys(candidate).some((key) => keys.has(key))
            ) || null;
          }

          function resolveProjectOverviewThreadPersonIdentity(record, fallback = {}) {
            const identity = normalizeProjectOverviewThreadPersonIdentity(record, fallback);
            const matchingIdentity = findProjectOverviewThreadPersonMatch(identity);
            if (!matchingIdentity) {
              return identity;
            }
            return {
              ...identity,
              name: identity.name || matchingIdentity.name || "",
              email: identity.email || matchingIdentity.email || "",
              userId: identity.userId || matchingIdentity.userId || "",
              id: identity.id || matchingIdentity.id || "",
              avatarUrl: identity.avatarUrl || matchingIdentity.avatarUrl || "",
            };
          }

          function getProjectOverviewThreadPersonLabel(identity) {
            const source = getProjectOverviewThreadRecordObject(identity);
            const email = String(source.email || "").trim().toLowerCase();
            const name = String(source.name || source.displayName || source.display_name || "").trim();
            return (typeof getTrustedDisplayName === "function" ? getTrustedDisplayName(name, email) : name)
              || (email && typeof formatAccountDisplayName === "function" ? formatAccountDisplayName("", email, "") : "")
              || name
              || String(source.userId || source.id || "").trim();
          }

          function getProjectOverviewThreadTriggeredByIdentity(thread) {
            const parts = getProjectOverviewThreadMetadataParts(thread);
            const identitySources = [
              parts.rawThread.triggeredBy,
              parts.rawThread.triggered_by,
              parts.rawThread.createdBy,
              parts.rawThread.created_by,
              parts.rawThread.creator,
              parts.rawThread.author,
              parts.rawThread.user,
              parts.rawThread.actor,
              parts.rawThread.initiator,
              parts.rawThread.requestedBy,
              parts.rawThread.requested_by,
              parts.metadata.triggeredBy,
              parts.metadata.triggered_by,
              parts.metadata.createdBy,
              parts.metadata.created_by,
              parts.metadata.creator,
              parts.metadata.author,
              parts.metadata.user,
              parts.metadata.actor,
              parts.metadata.initiator,
              parts.metadata.requestedBy,
              parts.metadata.requested_by,
              parts.runner.triggeredBy,
              parts.runner.triggered_by,
              parts.runner.createdBy,
              parts.runner.created_by,
              parts.runner.creator,
              parts.runner.author,
              parts.runner.user,
              parts.runner.actor,
              parts.runner.initiator,
              parts.runner.requestedBy,
              parts.runner.requested_by,
            ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
            for (const identitySource of identitySources) {
              const resolvedIdentity = resolveProjectOverviewThreadPersonIdentity(identitySource, identitySource);
              if (getProjectOverviewThreadPersonLabel(resolvedIdentity)) {
                return resolvedIdentity;
              }
            }
            const directSources = [
              parts.rawThread,
              parts.metadata,
              parts.runner,
              parts.sourceRecord,
              parts.triggerRecord,
              parts.missionControl,
              parts.agentAssistant,
            ];
            const displayName = readProjectOverviewThreadStringFromSources(directSources, [
              "triggeredByDisplayName",
              "triggered_by_display_name",
              "triggeredByName",
              "triggered_by_name",
              "createdByDisplayName",
              "created_by_display_name",
              "createdByName",
              "created_by_name",
              "creatorDisplayName",
              "creator_display_name",
              "creatorName",
              "creator_name",
              "authorName",
              "author_name",
              "userDisplayName",
              "user_display_name",
              "userName",
              "user_name",
              "requestedByName",
              "requested_by_name",
              "operatorName",
              "operator_name",
            ]);
            const email = readProjectOverviewThreadStringFromSources(directSources, [
              "triggeredByEmail",
              "triggered_by_email",
              "createdByEmail",
              "created_by_email",
              "creatorEmail",
              "creator_email",
              "authorEmail",
              "author_email",
              "userEmail",
              "user_email",
              "requestedByEmail",
              "requested_by_email",
              "operatorEmail",
              "operator_email",
            ]);
            const avatarUrl = readProjectOverviewThreadStringFromSources(directSources, [
              "triggeredByAvatarUrl",
              "triggered_by_avatar_url",
              "createdByAvatarUrl",
              "created_by_avatar_url",
              "creatorAvatarUrl",
              "creator_avatar_url",
              "authorAvatarUrl",
              "author_avatar_url",
              "userAvatarUrl",
              "user_avatar_url",
              "photoURL",
              "photoUrl",
              "photo_url",
              "avatarUrl",
              "avatar_url",
            ]);
            const identityKey = readProjectOverviewThreadStringFromSources(directSources, [
              "triggeredByUserId",
              "triggered_by_user_id",
              "triggeredBy",
              "triggered_by",
              "createdByUserId",
              "created_by_user_id",
              "creatorUserId",
              "creator_user_id",
              "authorUserId",
              "author_user_id",
              "userId",
              "user_id",
              "requestedByUserId",
              "requested_by_user_id",
              "operatorUserId",
              "operator_user_id",
              "createdBy",
              "created_by",
              "creatorId",
              "creator_id",
            ]);
            const keyIsEmail = identityKey.includes("@");
            const resolvedIdentity = resolveProjectOverviewThreadPersonIdentity({
              name: displayName,
              email: email || (keyIsEmail ? identityKey : ""),
              userId: keyIsEmail ? "" : identityKey,
              id: identityKey,
              avatarUrl,
            }, {
              name: displayName,
              email,
              userId: keyIsEmail ? "" : identityKey,
              id: identityKey,
              avatarUrl,
            });
            return getProjectOverviewThreadPersonLabel(resolvedIdentity) ? resolvedIdentity : null;
          }

          const projectOverviewThreadTableRowOptions = {
            getSourceLabel: getProjectOverviewThreadSourceLabel,
            getEnvironmentLabel: getProjectOverviewThreadEnvironmentLabel,
            getTriggeredByLabel: (thread) => getProjectOverviewThreadPersonLabel(getProjectOverviewThreadTriggeredByIdentity(thread)) || "-",
            getTriggeredByAvatarUrl: (thread) => {
              const identity = getProjectOverviewThreadTriggeredByIdentity(thread);
              return identity?.avatarUrl || identity?.photoURL || "";
            },
            getDateLabel: (thread, safeThread) => (
              (typeof formatThreadSearchTimestamp === "function"
                ? formatThreadSearchTimestamp(typeof resolveThreadSortTimestamp === "function" ? resolveThreadSortTimestamp(safeThread) : (safeThread?.updatedAt || safeThread?.createdAt || ""))
                : "")
              || (typeof formatRelativeThreadTime === "function" ? formatRelativeThreadTime(safeThread?.updatedAt || safeThread?.createdAt) : "")
              || "—"
            ),
            onOpenThread: (threadId, safeThread) => {
              if (typeof upsertRealThreadRecord === "function") {
                upsertRealThreadRecord(safeThread);
              }
              if (typeof onThreadOpen === "function") {
                onThreadOpen(threadId, { threadRecord: safeThread });
              } else if (typeof handleThreadSelect === "function") {
                handleThreadSelect(threadId);
              }
            },
            onThreadActions: (event, threadId, safeThread) => {
              if (typeof onThreadOptionsOpen === "function") {
                onThreadOptionsOpen(event, threadId, { threadRecord: safeThread });
                return;
              }
              if (typeof upsertRealThreadRecord === "function") {
                upsertRealThreadRecord(safeThread);
              }
              if (typeof openThreadActionMenu === "function") {
                openThreadActionMenu(event, threadId, safeThread);
              }
            },
          };



          function renderProjectOverviewFileMenu() {
            if (!projectOverviewFileMenuState?.row) {
              return null;
            }
            const targetRow = projectOverviewFileMenuState.row;
            const targetRowId = String(targetRow?.id || "").trim();
            const isRowMutating = projectOverviewFileMutationState?.rowId === targetRowId;
            const isRenaming = isRowMutating && projectOverviewFileMutationState?.action === "rename";
            const isReverting = isRowMutating && projectOverviewFileMutationState?.action === "revert";
            const isDeleting = isRowMutating && projectOverviewFileMutationState?.action === "delete";
            const canRevert = Boolean(String(targetRow?.revertTargetStepId || "").trim());

            const content = React.createElement(PlatformPopupDismissLayer, {
                className: "sidebar-thread-popup-scrim",
                onClick: () => typeof closeProjectOverviewFileMenu === "function" && closeProjectOverviewFileMenu(),
              },
              React.createElement(PlatformPopupSurface, {
                className: "sidebar-thread-popup",
                style: {
                  top: projectOverviewFileMenuState.top + "px",
                  left: projectOverviewFileMenuState.left + "px",
                },
                onClick: (event) => event.stopPropagation(),
              },
                React.createElement("div", { className: "sidebar-thread-popup-title" }, "File"),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-popup-row",
                  onClick: () => typeof handleProjectOverviewFileRename === "function" && handleProjectOverviewFileRename(targetRow),
                  disabled: isRenaming || isReverting || isDeleting,
                },
                  React.createElement(SquarePen, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, isRenaming ? "Renaming..." : "Rename file")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-popup-row",
                  onClick: () => typeof handleProjectOverviewFileRevert === "function" && handleProjectOverviewFileRevert(targetRow),
                  disabled: !canRevert || isRenaming || isReverting || isDeleting,
                },
                  React.createElement(History, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, isReverting ? "Reverting..." : "Revert changes")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-popup-row",
                  onClick: () => typeof navigateProjectOverviewFileToFiles === "function" && navigateProjectOverviewFileToFiles(targetRow),
                  disabled: isRenaming || isReverting || isDeleting,
                },
                  React.createElement(FolderOpen, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, "Show in Files")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-popup-row",
                  onClick: () => {
                    if (String(targetRow?.taskId || "").trim() && typeof handleSelectTask === "function") {
                      handleSelectTask(String(targetRow.taskId).trim());
                    }
                    typeof closeProjectOverviewFileMenu === "function" && closeProjectOverviewFileMenu();
                  },
                  disabled: !String(targetRow?.taskId || "").trim() || isRenaming || isReverting || isDeleting,
                },
                  React.createElement(ListTodo, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, "Show Task")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-popup-row is-danger",
                  onClick: () => typeof handleProjectOverviewFileDelete === "function" && handleProjectOverviewFileDelete(targetRow),
                  disabled: isRenaming || isReverting || isDeleting,
                },
                  React.createElement(Trash2, { className: "sidebar-thread-popup-row-icon", strokeWidth: 1.75 }),
                  React.createElement("span", { className: "sidebar-thread-popup-row-label" }, isDeleting ? "Deleting..." : "Delete")
                )
              )
            );
            if (typeof document !== "undefined" && document.body) {
              return createPortal(content, document.body);
            }
            return content;
          }

          function renderProjectOverviewObservabilityChart() {
            return React.createElement("div", { className: "playground-project-overview-chart-surface" },
              React.createElement("div", { className: "playground-project-overview-chart-grid" },
                React.createElement("section", {
                  className: "playground-settings-usage-chart-card playground-project-overview-chart-card" + (!projectHasCostData ? " is-cost-empty" : ""),
                },
                  React.createElement("div", { className: "playground-project-overview-summary-kpis playground-project-overview-chart-kpis" },
                    projectOverviewKpis.map((item) =>
                      React.createElement("div", { key: item.id, className: "playground-project-overview-summary-kpi" },
                        React.createElement("div", { className: "playground-project-overview-summary-kpi-heading" },
                          React.createElement("div", { className: "playground-project-overview-summary-kpi-label" }, item.label)
                        ),
                        React.createElement("div", { className: "playground-project-overview-summary-kpi-value" }, item.value)
                      )
                    )
                  ),
                  React.createElement("div", { className: "playground-project-overview-chart-header" },
                    React.createElement("div", { className: "playground-project-overview-chart-header-main" },
                      React.createElement("div", { className: "playground-project-overview-chart-title" }, "Cost by Resource")
                    )
                  ),
                  React.createElement(React.Fragment, null,
                    renderProjectOverviewMultiStackedChart({
                      labels: projectThreadTimeline.map((bucket) => bucket.label),
                      series: projectComputeSeries,
                      yMax: maxProjectDailyCt,
                      tickFormatter: formatProjectOverviewAxisCt,
                      tall: true,
                      ariaLabel: "Project cost by resource type",
                      emptyText: "No project cost yet",
                      emptyContent: renderProjectOverviewCostEmptyState(),
                    }),
                    React.createElement("div", { className: "playground-project-overview-chart-footer-row" },
                      projectHasCostData
                        ? React.createElement("div", {
                            className: "playground-settings-usage-inline-legend",
                          },
                            projectComputeSeries.map((entry) =>
                              React.createElement("div", { key: entry.id, className: "playground-settings-usage-legend-item" },
                                React.createElement("span", {
                                  className: "playground-settings-usage-legend-swatch",
                                  style: { background: entry.color },
                                }),
                                React.createElement("span", null, entry.label)
                              )
                            )
                          )
                        : React.createElement("div", { className: "playground-settings-usage-inline-legend" }),
                      React.createElement("div", { className: "playground-environments-home-comparison-timescale" },
                        React.createElement("select", {
                          className: "playground-environments-home-comparison-timescale-select",
                          value: projectOverviewChartTimescale,
                          "aria-label": "Project overview chart timeframe",
                          onChange: (event) => setProjectOverviewChartTimescale(String(event.target.value || "month")),
                        },
                          React.createElement("option", { value: "day" }, "Daily"),
                          React.createElement("option", { value: "week" }, "Weekly"),
                          React.createElement("option", { value: "month" }, "Monthly")
                        )
                      )
                    )
                  ),
                  renderProjectOverviewFilesNavCards()
                )
              )
            );
          }

          function renderProjectOverviewThreadsSection(options = {}) {
            const isEmbedded = options?.embedded === true;
            return React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-overview-list-section playground-agents-overview-table-section"
                  + (isEmbedded ? " is-embedded" : ""),
              },
              renderPlaygroundThreadOverviewTable({
                threads: projectOverviewFilteredThreads,
                tableOptions: {
                  key: "project-overview-threads-" + String(selectedProject?.id || ""),
                  ariaLabel: "Project threads",
                  variant: "minimalistic-ui",
                  toolbar: {
                    className: isEmbedded
                      ? "playground-project-overview-threads-tabs-toolbar"
                      : undefined,
                    ...(isEmbedded
                      ? { leading: options?.toolbarLeading || null }
                      : { title: "Threads" }),
                    search: {
                      value: projectOverviewThreadSearchQuery,
                      onChange: setProjectOverviewThreadSearchQuery,
                      placeholder: "Search threads",
                      ariaLabel: "Search project threads",
                      manual: true,
                    },
                    filters: isEmbedded ? [] : [
                      {
                        id: "sort",
                        label: "Sort",
                        value: projectOverviewThreadSortMode,
                        options: projectOverviewThreadSortOptions,
                        onChange: setProjectOverviewThreadSortMode,
                      },
                      {
                        id: "status",
                        label: "Status",
                        value: projectOverviewThreadFilterMode,
                        options: projectOverviewThreadFilterOptions,
                        onChange: setProjectOverviewThreadFilterMode,
                      },
                    ],
                  },
                  emptyState: hasProjectOverviewThreadListFilters ? "No matching project threads." : "No project threads yet.",
                  noResultsState: "No matching project threads.",
                  pagination: {
                    value: projectOverviewThreadPagination,
                    onChange: setProjectOverviewThreadPagination,
                    pageSizeOptions: [5],
                  },
                },
                rowOptions: {
                  ...projectOverviewThreadTableRowOptions,
                  useAgentsOverviewTable: true,
                  selectable: true,
                  selectedIds: selectedProjectOverviewThreadIds,
                  allVisibleSelected: allVisibleProjectThreadsSelected,
                  partialSelection: hasPartialVisibleProjectThreadSelection,
                  onToggleSelection: toggleProjectOverviewThreadSelection,
                  onToggleVisibleSelection: toggleVisibleProjectOverviewThreadSelection,
                },
              })
            );
          }

          function renderProjectOverviewObservabilityPanel() {
            if (isProjectOverviewResourceSubviewOpen) {
              return React.createElement("div", { className: "playground-tasks-project-panel-grid" },
                renderProjectOverviewFilesTab(),
                renderProjectOverviewFileMenu()
              );
            }
            return React.createElement(React.Fragment, null,
              renderProjectOverviewObservabilityChart(),
              React.createElement("div", { className: "playground-tasks-project-panel-grid" },
                renderProjectOverviewThreadsSection()
              )
            );
          }

          function renderProjectOverviewProgressChart() {
            const scopeCount = Math.max(
              0,
              Number(selectedProjectTaskStatusOverview?.total) || 0,
              Number(selectedProjectSummary?.tasksCount) || 0,
              normalizedOverviewTasks.length
            );
            const completedCount = Math.max(0, Math.min(scopeCount, Number(selectedProjectTaskStatusOverview?.done) || 0));
            const startedCount = Math.max(0, Math.min(
              scopeCount,
              completedCount + (Number(selectedProjectTaskStatusOverview?.inProgress) || 0)
            ));
            const rowData = [
              { id: "scope", label: "Scope", value: scopeCount, percent: 100 },
              { id: "started", label: "Started", value: startedCount, percent: scopeCount > 0 ? Math.round((startedCount / scopeCount) * 100) : 0 },
              { id: "completed", label: "Completed", value: completedCount, percent: scopeCount > 0 ? Math.round((completedCount / scopeCount) * 100) : 0 },
            ];
            const chartWidth = 1000;
            const chartHeight = 220;
            const paddingX = 8;
            const paddingTop = 18;
            const paddingBottom = 36;
            const maxValue = Math.max(1, scopeCount, startedCount, completedCount);
            const pointCount = 6;
            function makeValues(target, curve) {
              return curve.map((factor) => Math.round(Math.max(0, target) * factor));
            }
            const series = [
              { id: "scope", values: makeValues(scopeCount, [0, 0.22, 0.4, 0.58, 0.8, 1]) },
              { id: "started", values: makeValues(startedCount, [0, 0.18, 0.56, 0.78, 0.9, 1]) },
              { id: "completed", values: makeValues(completedCount, [0, 0.08, 0.28, 0.54, 0.78, 1]) },
            ];
            function getPoint(value, index) {
              const x = paddingX + (index / Math.max(1, pointCount - 1)) * (chartWidth - paddingX * 2);
              const y = paddingTop + (1 - (value / maxValue)) * (chartHeight - paddingTop - paddingBottom);
              return { x, y };
            }
            function buildPath(values) {
              return values.map((value, index) => {
                const point = getPoint(value, index);
                return (index === 0 ? "M" : "L") + point.x.toFixed(1) + " " + point.y.toFixed(1);
              }).join(" ");
            }
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            const startLabel = startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            const endLabel = endDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });

            return React.createElement("div", { className: "playground-project-overview-progress-chart" },
              React.createElement("svg", {
                className: "playground-project-overview-progress-svg",
                viewBox: "0 0 " + chartWidth + " " + chartHeight,
                preserveAspectRatio: "none",
                role: "img",
                "aria-label": "Project progress by task status",
              },
                [0.25, 0.5, 0.75].map((fraction) =>
                  React.createElement("line", {
                    key: "guide:" + fraction,
                    className: "playground-project-overview-progress-guide",
                    x1: paddingX,
                    x2: chartWidth - paddingX,
                    y1: paddingTop + (chartHeight - paddingTop - paddingBottom) * fraction,
                    y2: paddingTop + (chartHeight - paddingTop - paddingBottom) * fraction,
                  })
                ),
                React.createElement("line", {
                  className: "playground-project-overview-progress-axis",
                  x1: paddingX,
                  x2: chartWidth - paddingX,
                  y1: chartHeight - paddingBottom,
                  y2: chartHeight - paddingBottom,
                }),
                series.map((entry) =>
                  React.createElement("path", {
                    key: entry.id,
                    className: "playground-project-overview-progress-line is-" + entry.id,
                    d: buildPath(entry.values),
                  })
                ),
                series.map((entry) => {
                  const point = getPoint(entry.values[entry.values.length - 1] || 0, entry.values.length - 1);
                  return React.createElement("circle", {
                    key: "dot:" + entry.id,
                    className: "playground-project-overview-progress-dot is-" + entry.id,
                    cx: point.x,
                    cy: point.y,
                    r: 6,
                    fill: entry.id === "completed" ? "rgb(56, 204, 164)" : entry.id === "started" ? "rgb(122, 126, 255)" : "rgba(255, 255, 255, 0.7)",
                  });
                })
              ),
              React.createElement("div", { className: "playground-project-overview-progress-labels" },
                React.createElement("span", null, startLabel),
                React.createElement("span", null, endLabel)
              ),
              React.createElement("div", { className: "playground-project-overview-progress-legend" },
                rowData.map((row) =>
                  React.createElement("div", { key: row.id, className: "playground-project-overview-progress-legend-row" },
                    React.createElement("div", { className: "playground-project-overview-progress-legend-name" },
                      React.createElement("span", { className: "playground-project-overview-progress-swatch is-" + row.id }),
                      React.createElement("span", null, row.label)
                    ),
                    React.createElement("div", { className: "playground-project-overview-progress-legend-percent" }, row.percent + "%"),
                    React.createElement("div", { className: "playground-project-overview-progress-legend-count" }, row.value)
                  )
                )
              )
            );
          }

          function readProjectOverviewActivityActorString(source, keys) {
            if (!source || typeof source !== "object" || Array.isArray(source)) {
              return "";
            }
            for (const key of keys) {
              const value = source[key];
              if (typeof value === "string" && value.trim()) {
                return value.trim();
              }
              if (typeof value === "number" && Number.isFinite(value)) {
                return String(value);
              }
            }
            return "";
          }

          function getProjectOverviewActivityActorSnapshot(source) {
            const metadata = source?.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
              ? source.metadata
              : {};
            const runnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
              ? metadata.runnerPlayground
              : {};
            const taskPreview = runnerPlayground?.taskPreview && typeof runnerPlayground.taskPreview === "object" && !Array.isArray(runnerPlayground.taskPreview)
              ? runnerPlayground.taskPreview
              : {};
            const nestedAgent = source?.agent && typeof source.agent === "object" && !Array.isArray(source.agent)
              ? source.agent
              : {};
            return {
              id: readProjectOverviewActivityActorString(source, ["agentId", "agent_id", "assigneeId", "assigneeAgentId"])
                || readProjectOverviewActivityActorString(metadata, ["agentId", "agent_id", "assigneeId", "assigneeAgentId"])
                || readProjectOverviewActivityActorString(runnerPlayground, ["agentId", "agent_id"])
                || readProjectOverviewActivityActorString(taskPreview, ["agentId", "agent_id"]),
              name: readProjectOverviewActivityActorString(source, ["name", "agentName", "agent_name", "assigneeName", "assignee", "actorName", "label", "displayName"])
                || readProjectOverviewActivityActorString(metadata, ["agentName", "agent_name", "assigneeName", "actorName"])
                || readProjectOverviewActivityActorString(runnerPlayground, ["agentName", "agent_name"])
                || readProjectOverviewActivityActorString(taskPreview, ["agentName", "agent_name"])
                || readProjectOverviewActivityActorString(nestedAgent, ["name", "label", "displayName"]),
              photoUrl: readProjectOverviewActivityActorString(source, ["photoUrl", "profilePhotoUrl", "avatarUrl", "agentPhotoUrl", "agent_photo_url", "agentAvatarUrl", "agent_avatar_url", "assigneePhotoUrl", "assigneeAvatarUrl", "actorAvatarUrl"])
                || readProjectOverviewActivityActorString(metadata, ["agentPhotoUrl", "agent_photo_url", "agentAvatarUrl", "agent_avatar_url", "assigneePhotoUrl", "actorAvatarUrl"])
                || readProjectOverviewActivityActorString(runnerPlayground, ["agentPhotoUrl", "agent_photo_url", "agentAvatarUrl", "agent_avatar_url"])
                || readProjectOverviewActivityActorString(taskPreview, ["agentPhotoUrl", "agent_photo_url", "agentAvatarUrl", "agent_avatar_url"])
                || readProjectOverviewActivityActorString(nestedAgent, ["profilePhotoUrl", "photoUrl", "avatarUrl", "picture"]),
            };
          }
`;

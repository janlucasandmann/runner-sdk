export const METRONOME_PAGE_OVERVIEW_SCRIPT = String.raw`
          const renderOverview = () => {
            const templates = Array.isArray(METRONOME_TEMPLATE_WORKFLOWS) ? METRONOME_TEMPLATE_WORKFLOWS : [];
            const activeTemplate = templates.length ? templates[metronomeTemplateSlideIndex % templates.length] : null;
            const outgoingTemplate = templates.length > 1 ? templates[(metronomeTemplateSlideIndex + templates.length - 1) % templates.length] : null;
            const renderTemplatePill = (template, className) => {
              if (!template) return null;
              const TemplateIcon = template.Icon || Metronome;
              return React.createElement("div", { className },
                React.createElement("span", { className: "playground-metronome-hero-pill-icon" },
                  React.createElement(TemplateIcon, { width: 13, height: 13, strokeWidth: 1.9 })
                ),
                React.createElement("span", null, template.title)
              );
            };
            const formatWorkflowTriggerColumn = (workflow) => {
              const triggerNode = Array.isArray(workflow?.nodes)
                ? workflow.nodes.find((node) => node?.data?.kind === "trigger" || node?.kind === "trigger")
                : null;
              const triggerData = triggerNode?.data && typeof triggerNode.data === "object" ? triggerNode.data : triggerNode;
              const triggerConfig = triggerData?.config && typeof triggerData.config === "object" ? triggerData.config : {};
              const triggerType = String(triggerConfig.triggerType || triggerData?.subtype || "").trim();
              if (triggerType === "email") return "Email";
              const summary = String(workflow?.triggerSummary || deriveMetronomeTriggerSummary(workflow?.nodes || []) || "Manual").trim() || "Manual";
              const normalizedSummary = summary.toLowerCase();
              return normalizedSummary.startsWith("email:") || normalizedSummary.includes("@" + METRONOME_EMAIL_DOMAIN)
                ? "Email"
                : summary;
            };
            const renderWorkflowCreatorColumn = (workflow) => {
              const isBuiltInWorkflow = isMetronomeWorkflowBuiltIn(workflow);
              const isTeamSharedWorkflow = isMetronomeWorkflowTeamShared(workflow);
              const workflowCreator = normalizeMetronomeWorkflowCreator(workflow);
              const creatorAgentId = String(workflowCreator?.agentId || (workflowCreator?.type === "agent" ? workflowCreator?.id : "") || "").trim();
              const creatorName = String(workflowCreator?.name || "").trim();
              const creatorId = String(workflowCreator?.id || "").trim();
              const normalizedCreatorName = creatorName.toLowerCase();
              const normalizedCreatorId = creatorId.toLowerCase();
              const creatorAgent = isBuiltInWorkflow
                ? null
                : metronomeAgentOptions.find((agent) => {
                    const agentId = String(agent?.id || "").trim();
                    const agentName = String(agent?.name || "").trim();
                    const agentEmail = String(agent?.email || agent?.profile?.email || "").trim();
                    return Boolean(
                      creatorAgentId && agentId === creatorAgentId
                      || normalizedCreatorId && (
                        agentId.toLowerCase() === normalizedCreatorId
                        || agentName.toLowerCase() === normalizedCreatorId
                        || agentEmail.toLowerCase() === normalizedCreatorId
                      )
                      || normalizedCreatorName && agentName.toLowerCase() === normalizedCreatorName
                    );
                  }) || null;
              const isAgentCreator = Boolean(
                !isBuiltInWorkflow
                && (
                  workflowCreator?.type === "agent"
                  || creatorAgentId
                  || creatorAgent && (creatorId || creatorName)
                )
              );
              const isSharedUserCreator = Boolean(
                isTeamSharedWorkflow
                && !isAgentCreator
                && workflowCreator
                && (
                  workflowCreator.type === "user"
                  || workflowCreator.userId
                  || creatorName
                  || creatorId
                )
              );
              const creatorLabel = isBuiltInWorkflow
                ? "Computer Agents"
                : isAgentCreator
                  ? (creatorAgent?.name || creatorName || "Agent")
                  : isSharedUserCreator
                    ? (creatorName || workflowCreator?.email || creatorId || "User")
                  : "Me";
              const creatorIdentity = isBuiltInWorkflow
                ? "Computer Agents"
                : isAgentCreator
                  ? (creatorAgent?.name || creatorName || creatorId || "Agent")
                  : isSharedUserCreator
                    ? (creatorName || workflowCreator?.email || creatorId || "User")
                  : (currentUserName || currentUserEmail || "Me");
              const creatorAvatarUrl = isBuiltInWorkflow
                ? METRONOME_RUNNER_TRANSPARENT_LOGO_URL
                : isAgentCreator
                  ? (workflowCreator?.avatarUrl || getMetronomeProfileImageUrl(creatorAgent) || "")
                  : isSharedUserCreator
                    ? (workflowCreator?.avatarUrl || workflowCreator?.photoUrl || "")
                  : currentUserAvatarUrl;
              const normalizedCreatorAvatarUrl = canRenderMetronomeAvatarImage(creatorAvatarUrl)
                ? normalizeMetronomeAvatarUrl(creatorAvatarUrl)
                : "";
              const creatorInitials = getMetronomeOwnerInitials(creatorIdentity, isBuiltInWorkflow ? "" : isAgentCreator ? "AG" : "ME");
              return React.createElement("span", {
                className: "playground-metronome-table-owner",
                title: creatorLabel,
              },
                React.createElement("span", {
                  className: "playground-metronome-table-owner-avatar" + (isBuiltInWorkflow ? " is-computer-agents" : ""),
                  "aria-hidden": "true",
                },
                  isBuiltInWorkflow
                    ? null
                    : React.createElement("span", { className: "playground-metronome-table-owner-avatar-fallback" }, creatorInitials),
                  normalizedCreatorAvatarUrl
                    ? React.createElement("img", {
                        className: "playground-metronome-table-owner-avatar-image",
                        src: normalizedCreatorAvatarUrl,
                        alt: "",
                        referrerPolicy: "no-referrer",
                        onError: (event) => {
                          event.currentTarget.style.display = "none";
                        },
                      })
                    : null
                ),
                React.createElement("span", { className: "playground-metronome-table-owner-label" }, creatorLabel)
              );
            };
            const renderWorkflowRowActions = (workflow) => {
              const workflowId = String(workflow?.id || "").trim();
              if (!workflowId) return null;
              const isBuiltInWorkflow = isMetronomeWorkflowBuiltIn(workflow);
              const isTeamSharedWorkflow = isMetronomeWorkflowTeamShared(workflow);
              const canEditSharedWorkflow = canEditMetronomeTeamSharedWorkflow(workflow);
              const teamSharedHiddenKey = isTeamSharedWorkflow ? getMetronomeTeamSharedWorkflowHiddenKey(workflow) : "";
              const isHiddenTeamSharedWorkflow = Boolean(teamSharedHiddenKey && hiddenTeamSharedMetronomeWorkflowKeySet.has(teamSharedHiddenKey));
              const isOpen = openMetronomeOverviewMenuWorkflowId === workflowId;
              const menuRows = isBuiltInWorkflow
                ? [
                    { id: "duplicate", label: "Duplicate", icon: Copy, action: () => void duplicateWorkflow(workflow) },
                  ]
                : isTeamSharedWorkflow
                  ? isHiddenTeamSharedWorkflow
                    ? [
                        { id: "restore-to-list", label: "Restore to list", icon: RotateCcw, action: () => restoreTeamSharedMetronomeWorkflowToList(workflow) },
                        { id: "duplicate", label: "Duplicate", icon: Copy, action: () => void duplicateWorkflow(workflow) },
                      ]
                    : [
                        ...(canEditSharedWorkflow ? [{ id: "rename", label: "Edit", icon: SquarePen, action: () => openEditWorkflowModalForWorkflow(workflow) }] : []),
                        { id: "duplicate", label: "Duplicate", icon: Copy, action: () => void duplicateWorkflow(workflow) },
                        { id: "remove-from-list", label: "Remove from list", icon: Trash2, action: () => hideTeamSharedMetronomeWorkflowFromList(workflow) },
                      ]
                : [
                    { id: "rename", label: "Edit", icon: SquarePen, action: () => openEditWorkflowModalForWorkflow(workflow) },
                    { id: "duplicate", label: "Duplicate", icon: Copy, action: () => void duplicateWorkflow(workflow) },
                    { id: "share", label: "Share", icon: UsersRound, action: () => openMetronomeShareWorkflowModal(workflow) },
                    { id: "delete", label: "Delete", icon: Trash2, action: () => deleteWorkflow(workflow), danger: true },
                  ];
              return React.createElement("div", {
                className: "playground-metronome-table-menu-shell playground-tasks-toolbar-popup-shell playground-metronome-overview-action-shell",
                onClick: (event) => event.stopPropagation(),
                onKeyDown: (event) => event.stopPropagation(),
              },
                React.createElement("button", {
                  type: "button",
                  className: "playground-overview-table-action-button" + (isOpen ? " is-open" : ""),
                  title: "Workflow options",
                  "aria-label": "Workflow options",
                  "aria-expanded": isOpen ? "true" : "false",
                  onClick: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setMetronomeWorkflowToolbarPopover("");
                    setOpenMetronomeOverviewMenuWorkflowId((current) => current === workflowId ? "" : workflowId);
                  },
                }, React.createElement(EllipsisVertical, { className: "playground-overview-table-action-icon", strokeWidth: 1.8 })),
                isOpen
                  ? React.createElement(PlatformPopupSurface, {
                      className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu playground-agents-overview-toolbar-menu playground-tasks-toolbar-popup-menu-animate-down-in playground-metronome-top-nav-menu playground-metronome-table-row-menu",
                      role: "menu",
                    },
                      menuRows.map((row) => {
                        const Icon = row.icon || Copy;
                        return React.createElement("button", {
                          key: row.id,
                          type: "button",
                          className: "tb-popup-row" + (row.danger ? " is-danger" : ""),
                          role: "menuitem",
                          onClick: (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setOpenMetronomeOverviewMenuWorkflowId("");
                            row.action();
                          },
                        },
                          React.createElement(Icon, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, row.label)
                        );
                      })
                    )
                  : null
              );
            };
            const visibleMetronomeOverviewWorkflowIds = (Array.isArray(visibleWorkflowRows) ? visibleWorkflowRows : [])
              .map((workflow) => String(workflow?.id || "").trim())
              .filter(Boolean);
            const selectedVisibleMetronomeOverviewWorkflowIds = visibleMetronomeOverviewWorkflowIds
              .filter((workflowId) => selectedMetronomeOverviewWorkflowIds.has(workflowId));
            const allVisibleMetronomeWorkflowsSelected = visibleMetronomeOverviewWorkflowIds.length > 0
              && selectedVisibleMetronomeOverviewWorkflowIds.length === visibleMetronomeOverviewWorkflowIds.length;
            const renderMetronomeWorkflowEmptyContent = () => React.createElement("div", { className: "playground-metronome-table-main" },
              React.createElement("div", { className: "playground-metronome-table-title" },
                normalizedMetronomeWorkflowSearchQuery && metronomeWorkflowRowsAvailableForCurrentView.length
                  ? "No matching Metronomes"
                  : metronomeWorkflowFilter === "removed"
                    ? "No removed shared Metronomes"
                    : selectedMetronomeProjectFilter ? "No Metronomes in this project yet" : "No Metronomes yet"
              ),
              React.createElement("div", { className: "playground-metronome-table-subtitle" },
                normalizedMetronomeWorkflowSearchQuery && metronomeWorkflowRowsAvailableForCurrentView.length
                  ? "Try a different search term or filter."
                  : metronomeWorkflowFilter === "removed"
                    ? "Shared workflows removed from your list will appear here and can be restored from the row menu."
                    : selectedMetronomeProjectFilter
                      ? "Create a workflow that belongs to this project and can reuse its tickets, resources, files, and context."
                      : "Create a workflow that starts from a schedule, thread, ticket, connector event, or database change."
              )
            );
            const getMetronomeWorkflowPresentation = (workflow) => {
              const isBuiltInWorkflow = isMetronomeWorkflowBuiltIn(workflow);
              const isTeamSharedWorkflow = isMetronomeWorkflowTeamShared(workflow);
              const teamSharedHiddenKey = isTeamSharedWorkflow ? getMetronomeTeamSharedWorkflowHiddenKey(workflow) : "";
              const isHiddenTeamSharedWorkflow = Boolean(teamSharedHiddenKey && hiddenTeamSharedMetronomeWorkflowKeySet.has(teamSharedHiddenKey));
              const workflowMetadata = readMetronomeWorkflowMetadata(workflow);
              const teamShare = workflowMetadata.teamShare && typeof workflowMetadata.teamShare === "object" && !Array.isArray(workflowMetadata.teamShare)
                ? workflowMetadata.teamShare
                : {};
              const sharedTeamName = String(teamShare.teamName || "Team").trim() || "Team";
              const subtitlePrefix = isBuiltInWorkflow
                ? "Default workflow · "
                : isHiddenTeamSharedWorkflow
                  ? "Removed from list · Shared via " + sharedTeamName + " · "
                  : isTeamSharedWorkflow
                    ? "Shared via " + sharedTeamName + " · "
                    : "";
              return {
                isBuiltInWorkflow,
                isTeamSharedWorkflow,
                isHiddenTeamSharedWorkflow,
                sharedTeamName,
                title: workflow?.name || "Untitled Metronome",
                subtitle: subtitlePrefix + (workflow?.nodes?.length || 0) + " nodes · " + (workflow?.edges?.length || 0) + " connections",
                statusLabel: isBuiltInWorkflow ? "Default" : isHiddenTeamSharedWorkflow ? "Removed" : isTeamSharedWorkflow ? "Shared" : workflow?.status === "active" ? "Active" : "Draft",
                updatedLabel: isBuiltInWorkflow ? "Ready to run" : isHiddenTeamSharedWorkflow ? "Hidden locally" : formatMetronomeDate(workflow?.lastRunAt),
              };
            };
            const getMetronomeWorkflowInteractiveProps = (workflow, presentation = getMetronomeWorkflowPresentation(workflow)) => {
              if (presentation.isHiddenTeamSharedWorkflow) {
                return { className: "is-removed-shared" };
              }
              return {
                className: "is-clickable" + (presentation.isBuiltInWorkflow ? " is-built-in" : ""),
                tabIndex: 0,
                role: "button",
                onClick: () => openMetronomeWorkflow(workflow),
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openMetronomeWorkflow(workflow);
                  }
                },
              };
            };
            const getMetronomeWorkflowPreviewLayout = (workflow) => {
              const workflowNodes = (Array.isArray(workflow?.nodes) ? workflow.nodes : [])
                .filter((node) => node && typeof node === "object" && String(node.id || "").trim());
              if (!workflowNodes.length) {
                return { nodes: [], edges: [] };
              }
              const nodeMap = new Map(workflowNodes.map((node) => [String(node.id || ""), node]));
              const positionedNodes = workflowNodes.map((node, index) => {
                const position = getMetronomeNodeAbsolutePosition(node, nodeMap);
                const dimensions = getMetronomeNodeDimensions(node);
                const kind = String(node?.data?.kind || node?.kind || "action").trim() || "action";
                const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
                return {
                  id: String(node.id || "node_" + index),
                  kind,
                  label: getMetronomeNodeDisplayLabel(node?.data || node),
                  color: meta?.color || "#66a6ff",
                  gradient: meta?.gradient || "",
                  iconColor: meta?.iconColor || (kind === "loop" || kind === "note" ? "#050505" : "#fff"),
                  iconShadow: meta?.iconShadow || "",
                  Icon: meta?.Icon || Circle,
                  x: position.x + dimensions.width / 2,
                  y: position.y + dimensions.height / 2,
                };
              });
              const minX = Math.min(...positionedNodes.map((node) => node.x));
              const maxX = Math.max(...positionedNodes.map((node) => node.x));
              const minY = Math.min(...positionedNodes.map((node) => node.y));
              const maxY = Math.max(...positionedNodes.map((node) => node.y));
              const spanX = Math.max(1, maxX - minX);
              const spanY = Math.max(1, maxY - minY);
              const mappedNodes = positionedNodes.map((node) => {
                const x = spanX <= 1 ? 50 : 10 + ((node.x - minX) / spanX) * 80;
                const y = spanY <= 1 ? 50 : 18 + ((node.y - minY) / spanY) * 64;
                return {
                  ...node,
                  x,
                  y,
                };
              });
              const mappedNodeById = new Map(mappedNodes.map((node) => [node.id, node]));
              const edges = (Array.isArray(workflow?.edges) ? workflow.edges : [])
                .map((edge, index) => {
                  const source = mappedNodeById.get(String(edge?.source || ""));
                  const target = mappedNodeById.get(String(edge?.target || ""));
                  if (!source || !target) return null;
                  const bend = Math.max(10, Math.abs(target.x - source.x) * 0.42);
                  return {
                    id: String(edge?.id || "edge_" + index),
                    path: "M " + source.x.toFixed(2) + " " + source.y.toFixed(2)
                      + " C " + (source.x + bend).toFixed(2) + " " + source.y.toFixed(2)
                      + ", " + (target.x - bend).toFixed(2) + " " + target.y.toFixed(2)
                      + ", " + target.x.toFixed(2) + " " + target.y.toFixed(2),
                  };
                })
                .filter(Boolean)
                .slice(0, 64);
              return {
                nodes: mappedNodes.slice(0, 48),
                edges,
              };
            };
            const renderMetronomeWorkflowGraphPreview = (workflow) => {
              const layout = getMetronomeWorkflowPreviewLayout(workflow);
              return React.createElement("div", {
                className: "playground-metronome-workflow-card-preview",
                "aria-hidden": "true",
              },
                layout.edges.length
                  ? React.createElement("svg", {
                      className: "playground-metronome-workflow-card-preview-svg",
                      viewBox: "0 0 100 100",
                      preserveAspectRatio: "none",
                    },
                      layout.edges.map((edge) =>
                        React.createElement("path", {
                          key: edge.id,
                          className: "playground-metronome-workflow-card-preview-edge",
                          d: edge.path,
                        })
                      )
                    )
                  : null,
                layout.nodes.length
                  ? layout.nodes.map((node) => {
                      const NodeIcon = node.Icon || Circle;
                      return React.createElement("span", {
                        key: node.id,
                        className: "playground-metronome-workflow-card-preview-node is-" + node.kind,
                        title: node.label,
                        style: {
                          left: node.x.toFixed(2) + "%",
                          top: node.y.toFixed(2) + "%",
                          background: node.gradient || node.color,
                          color: node.iconColor,
                          "--metronome-preview-icon-shadow": node.iconShadow || "none",
                        },
                      }, React.createElement(NodeIcon, { width: 13, height: 13, strokeWidth: 1.9 }));
                    })
                  : React.createElement("span", { className: "playground-metronome-workflow-card-preview-empty" },
                      React.createElement(Metronome, { width: 24, height: 24, strokeWidth: 1.7 })
                    )
              );
            };
            const renderWorkflowsGrid = () => {
              if (isLoadingMetronomes) {
                return React.createElement("div", { className: "playground-project-resources-empty" },
                  React.createElement("div", { className: "playground-metronome-table-subtitle" }, "Loading persisted workflow drafts and published automations...")
                );
              }
              if (!visibleWorkflowRows.length) {
                return React.createElement("div", { className: "playground-project-resources-empty" },
                  renderMetronomeWorkflowEmptyContent()
                );
              }
              return React.createElement("div", { className: "playground-project-resources-grid playground-metronome-workflow-grid" },
                visibleWorkflowRows.map((workflow) => {
                  const presentation = getMetronomeWorkflowPresentation(workflow);
                  const interactiveProps = getMetronomeWorkflowInteractiveProps(workflow, presentation);
                  return React.createElement("div", {
                    key: workflow?.id || presentation.title,
                    ...interactiveProps,
                    className: "playground-project-resources-grid-card playground-metronome-workflow-grid-card " + (interactiveProps.className || ""),
                  },
                    React.createElement("div", {
                      className: "playground-metronome-workflow-card-hero",
                      style: { "--metronome-workflow-wallpaper-image": buildMetronomeWorkflowWallpaperImage(workflow) },
                    },
                      React.createElement("div", { className: "playground-metronome-workflow-card-hero-top" },
                        React.createElement("span", { className: "playground-metronome-workflow-card-hero-title" }, presentation.title),
                        renderWorkflowRowActions(workflow)
                      )
                    ),
                    React.createElement("div", { className: "playground-metronome-workflow-card-body" },
                      renderMetronomeWorkflowGraphPreview(workflow),
                      React.createElement("div", { className: "playground-metronome-workflow-grid-meta" },
                        React.createElement("div", { className: "playground-metronome-workflow-grid-meta-item" },
                          React.createElement("span", { className: "playground-metronome-workflow-grid-meta-label" }, "Status"),
                          React.createElement("span", { className: "playground-metronome-table-status" }, presentation.statusLabel)
                        ),
                        React.createElement("div", { className: "playground-metronome-workflow-grid-meta-item" },
                          React.createElement("span", { className: "playground-metronome-workflow-grid-meta-label" }, "Trigger"),
                          React.createElement("span", { className: "playground-metronome-table-subtitle" }, formatWorkflowTriggerColumn(workflow))
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-workflow-grid-card-footer" },
                        renderWorkflowCreatorColumn(workflow)
                      )
                    )
                  );
                })
              );
            };
            const renderMetronomeWorkflowStatusLabel = (presentation) => {
              const normalizedStatus = String(presentation?.statusLabel || "Draft").trim().toLowerCase().replace(/\s+/g, "-");
              return React.createElement("span", {
                className: "playground-metronome-table-status playground-metronome-overview-status-label is-" + normalizedStatus,
              }, presentation?.statusLabel || "Draft");
            };
            const renderWorkflowsTable = () => {
              const columns = [
                {
                  id: "name",
                  header: "Name",
                  accessor: (workflow) => workflow?.name || "Untitled Metronome",
                  sortable: true,
                  width: "minmax(220px, 1.35fr)",
                  cell: ({ row: workflow }) => {
                    const presentation = getMetronomeWorkflowPresentation(workflow);
                    return React.createElement("div", { className: "playground-agents-overview-name-cell playground-metronome-overview-name-cell", title: presentation.title },
                      React.createElement("div", { className: "playground-agents-overview-name-copy" },
                        React.createElement("div", { className: "playground-agents-overview-name-title playground-plugin-row-title" }, presentation.title)
                      )
                    );
                  },
                },
                {
                  id: "status",
                  header: "Status",
                  accessor: (workflow) => getMetronomeWorkflowPresentation(workflow).statusLabel,
                  sortable: true,
                  sortingFn: (left, right) => {
                    const leftWorkflow = left.original;
                    const rightWorkflow = right.original;
                    const leftKey = isMetronomeWorkflowTeamShared(leftWorkflow) ? getMetronomeTeamSharedWorkflowHiddenKey(leftWorkflow) : "";
                    const rightKey = isMetronomeWorkflowTeamShared(rightWorkflow) ? getMetronomeTeamSharedWorkflowHiddenKey(rightWorkflow) : "";
                    return getMetronomeWorkflowStatusSortRank(leftWorkflow, Boolean(leftKey && hiddenTeamSharedMetronomeWorkflowKeySet.has(leftKey)))
                      - getMetronomeWorkflowStatusSortRank(rightWorkflow, Boolean(rightKey && hiddenTeamSharedMetronomeWorkflowKeySet.has(rightKey)));
                  },
                  width: "minmax(105px, 0.62fr)",
                  cell: ({ row: workflow }) => renderMetronomeWorkflowStatusLabel(getMetronomeWorkflowPresentation(workflow)),
                },
                {
                  id: "trigger",
                  header: "Trigger",
                  accessor: formatWorkflowTriggerColumn,
                  sortable: true,
                  width: "minmax(120px, 0.72fr)",
                  hideBelow: 720,
                  cell: ({ row: workflow }) => React.createElement("span", { className: "playground-agents-overview-table-value" }, formatWorkflowTriggerColumn(workflow)),
                },
                {
                  id: "creator",
                  header: "Creator",
                  accessor: getMetronomeWorkflowCreatorSortLabel,
                  sortable: true,
                  width: "minmax(155px, 0.9fr)",
                  hideBelow: 860,
                  cell: ({ row: workflow }) => renderWorkflowCreatorColumn(workflow),
                },
                {
                  id: "recent",
                  header: "Last run",
                  accessor: getMetronomeWorkflowSortTimestamp,
                  sortable: true,
                  sortDescFirst: true,
                  width: "minmax(125px, 0.72fr)",
                  align: "end",
                  cell: ({ row: workflow }) => {
                    const presentation = getMetronomeWorkflowPresentation(workflow);
                    return React.createElement("span", { className: "playground-agents-overview-table-value", title: presentation.updatedLabel }, presentation.updatedLabel);
                  },
                },
              ];
              const getWorkflowActions = (workflow) => {
                const isBuiltInWorkflow = isMetronomeWorkflowBuiltIn(workflow);
                const isTeamSharedWorkflow = isMetronomeWorkflowTeamShared(workflow);
                const canEditSharedWorkflow = canEditMetronomeTeamSharedWorkflow(workflow);
                const hiddenKey = isTeamSharedWorkflow ? getMetronomeTeamSharedWorkflowHiddenKey(workflow) : "";
                const isHiddenSharedWorkflow = Boolean(hiddenKey && hiddenTeamSharedMetronomeWorkflowKeySet.has(hiddenKey));
                if (isBuiltInWorkflow) {
                  return [{ id: "duplicate", label: "Duplicate", icon: Copy, onSelect: () => void duplicateWorkflow(workflow) }];
                }
                if (isTeamSharedWorkflow && isHiddenSharedWorkflow) {
                  return [
                    { id: "restore", label: "Restore to list", icon: RotateCcw, onSelect: () => restoreTeamSharedMetronomeWorkflowToList(workflow) },
                    { id: "duplicate", label: "Duplicate", icon: Copy, onSelect: () => void duplicateWorkflow(workflow) },
                  ];
                }
                if (isTeamSharedWorkflow) {
                  return [
                    ...(canEditSharedWorkflow ? [{ id: "edit", label: "Edit", icon: SquarePen, onSelect: () => openEditWorkflowModalForWorkflow(workflow) }] : []),
                    { id: "duplicate", label: "Duplicate", icon: Copy, onSelect: () => void duplicateWorkflow(workflow) },
                    { id: "remove", label: "Remove from list", icon: Trash2, danger: true, onSelect: () => hideTeamSharedMetronomeWorkflowFromList(workflow) },
                  ];
                }
                return [
                  { id: "edit", label: "Edit", icon: SquarePen, onSelect: () => openEditWorkflowModalForWorkflow(workflow) },
                  { id: "duplicate", label: "Duplicate", icon: Copy, onSelect: () => void duplicateWorkflow(workflow) },
                  { id: "share", label: "Share", icon: UsersRound, onSelect: () => openMetronomeShareWorkflowModal(workflow) },
                  { id: "delete", label: "Delete", icon: Trash2, danger: true, onSelect: () => deleteWorkflow(workflow) },
                ];
              };
              return React.createElement(PlatformDataTable, {
                rows: visibleWorkflowRows,
                columns,
                getRowId: (workflow) => String(workflow?.id || workflow?.name || ""),
                ariaLabel: "Metronome workflows",
                className: "playground-metronome-platform-data-table",
                sorting: {
                  value: { id: metronomeWorkflowSort, direction: metronomeWorkflowSortDirection },
                  onChange: (next) => {
                    if (!next) {
                      setMetronomeWorkflowSort("recent");
                      setMetronomeWorkflowSortDirection("desc");
                      return;
                    }
                    setMetronomeWorkflowSort(next.id);
                    setMetronomeWorkflowSortDirection(next.direction);
                  },
                },
                selection: {
                  enabled: true,
                  value: selectedMetronomeOverviewWorkflowIds,
                  onChange: ({ selectedIds }) => setSelectedMetronomeOverviewWorkflowIds(new Set(selectedIds)),
                  ariaLabel: (workflow) => "Select " + (workflow?.name || "metronome"),
                },
                toolbar: {
                  search: {
                    value: metronomeWorkflowSearchQuery,
                    onChange: setMetronomeWorkflowSearchQuery,
                    placeholder: "Search metronomes",
                    manual: true,
                  },
                  filters: [{
                    id: "workflow-ownership",
                    label: "Filter",
                    value: metronomeWorkflowFilter,
                    onChange: setMetronomeWorkflowFilter,
                    options: METRONOME_WORKFLOW_FILTER_OPTIONS.map((option) => ({
                      ...option,
                      label: option.id === "removed" && hasRemovedSharedMetronomeWorkflows
                        ? option.label + " (" + removedUniqueSharedMetronomeWorkflows.length + ")"
                        : option.label,
                    })),
                  }],
                  primaryAction: {
                    label: "New Metronome",
                    icon: Plus,
                    onClick: openCreateWorkflowModal,
                  },
                },
                onRowActivate: (workflow) => {
                  const presentation = getMetronomeWorkflowPresentation(workflow);
                  if (!presentation.isHiddenTeamSharedWorkflow) openMetronomeWorkflow(workflow);
                },
                isRowDisabled: (workflow) => getMetronomeWorkflowPresentation(workflow).isHiddenTeamSharedWorkflow,
                getRowClassName: (workflow) => {
                  const presentation = getMetronomeWorkflowPresentation(workflow);
                  return presentation.isHiddenTeamSharedWorkflow
                    ? "is-removed-shared"
                    : presentation.isBuiltInWorkflow ? "is-built-in" : "";
                },
                getRowActions: getWorkflowActions,
                loading: isLoadingMetronomes,
                emptyState: React.createElement("div", { className: "playground-metronome-overview-empty-row" }, renderMetronomeWorkflowEmptyContent()),
                noResultsState: React.createElement("div", { className: "playground-metronome-overview-empty-row" }, renderMetronomeWorkflowEmptyContent()),
              });
            };
            return React.createElement("div", { className: "playground-metronome-overview playground-plugins-page playground-team-overview-page playground-agents-overview-page is-develop-configure-page" },
              React.createElement("h2", { className: "playground-metronome-hero-heading playground-tools-overview-heading" }, "Automate agent work across ACP"),
              React.createElement("section", { className: "playground-plugins-hero-slider playground-metronome-hero-slider" },
                React.createElement("div", { className: "playground-plugins-hero-slide" },
                  React.createElement("div", { className: "playground-metronome-hero-slide-content" },
                    React.createElement("div", { className: "playground-metronome-hero-pills" },
                      outgoingTemplate
                        ? renderTemplatePill(outgoingTemplate, "playground-metronome-hero-pill is-outgoing")
                        : null,
                      renderTemplatePill(activeTemplate, "playground-metronome-hero-pill is-incoming")
                    ),
                    activeTemplate?.copy
                      ? React.createElement("p", { className: "playground-metronome-hero-copy" }, activeTemplate.copy)
                      : null
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-hero-cta",
                    onClick: () => createWorkflowFromTemplate(activeTemplate),
                  },
                    React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.9 }),
                    React.createElement("span", null, "Use as draft")
                  ),
                  templates.length > 1
                    ? React.createElement("div", { className: "playground-plugins-hero-dots" },
                        templates.map((template, index) => React.createElement("button", {
                          key: template.id,
                          type: "button",
                          className: "playground-metronome-hero-dot" + (index === metronomeTemplateSlideIndex % templates.length ? " is-active" : ""),
                          "aria-label": "Show " + template.title,
                          onClick: () => setMetronomeTemplateSlideIndex(index),
                        }))
                      )
                    : null
                )
              ),
              React.createElement("section", {
                  className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-team-overview-table-section playground-team-grid-table-section playground-metronome-list-section playground-metronome-overview-table-section",
                },
                renderWorkflowsTable()
              )
            );
          };

          const renderPalette = () => React.createElement("aside", {
            className: "playground-metronome-node-palette",
          },
            React.createElement("div", { className: "playground-metronome-palette-header" },
              React.createElement("button", { type: "button", className: "playground-metronome-palette-back-button", onClick: () => setActiveWorkflowId("") },
                React.createElement(ArrowLeft, { width: 16, height: 16, strokeWidth: 1.9 })
              ),
              React.createElement("div", { className: "playground-metronome-palette-title" }, activeWorkflow?.name || "Metronome")
            ),
            isActiveWorkflowBuiltIn
              ? null
              : React.createElement("div", { className: "playground-metronome-palette-list" },
              visibleMetronomeNodePaletteGroups.map((group) => React.createElement("div", {
                key: group.title,
                className: "playground-metronome-palette-section",
              },
                React.createElement("div", { className: "playground-metronome-palette-section-title" }, group.title),
                group.items.map((item) => {
                  const meta = METRONOME_NODE_KIND_META[item.kind] || METRONOME_NODE_KIND_META.action;
                  const Icon = item.Icon || meta.Icon || Play;
                  const color = item.color || meta.color || "#66a6ff";
                  const gradient = item.gradient || meta.gradient || "";
                  const iconColor = item.iconColor || meta.iconColor || "#050505";
                  const iconShadow = item.iconShadow || meta.iconShadow || "";
                  return React.createElement("button", {
                    key: item.id || item.kind + "-" + item.label,
                    type: "button",
                    className: "playground-metronome-palette-item",
                    draggable: true,
                    onDragStart: (event) => handleDragStart(event, item),
                    onClick: () => {
                      const nextNode = createMetronomeNodeFromPaletteItem(item, { x: 260 + nodes.length * 28, y: 160 + nodes.length * 18 });
                      handleCreateNode(nextNode);
                    },
                  },
                    React.createElement("span", {
                      className: "playground-metronome-palette-item-icon",
                      style: gradient
                        ? { background: gradient, color: iconColor }
                        : { backgroundColor: color, color: iconColor },
                    }, React.createElement(Icon, {
                      width: 14,
                      height: 14,
                      strokeWidth: 2,
                      style: iconShadow ? { filter: iconShadow } : undefined,
                    })),
                    React.createElement("span", { className: "playground-metronome-palette-item-text" },
                      React.createElement("span", { className: "playground-metronome-palette-item-label" }, item.label),
                      React.createElement("span", { className: "playground-metronome-palette-item-copy" }, item.copy)
                    )
                  );
                })
              ))
            )
          );
`;

export const METRONOME_PAGE_OVERVIEW_SCRIPT = String.raw`
          const renderOverview = () => {
            const overviewWorkflows = [
              ...(Array.isArray(metronomeAvailableWorkflowRows) ? metronomeAvailableWorkflowRows : []),
              ...(Array.isArray(removedUniqueSharedMetronomeWorkflows) ? removedUniqueSharedMetronomeWorkflows : []),
            ];
            const workflowById = new Map(overviewWorkflows.map((workflow) => [
              String(workflow?.id || "").trim(),
              workflow,
            ]));
            const formatWorkflowTrigger = (workflow) => {
              const triggerNode = Array.isArray(workflow?.nodes)
                ? workflow.nodes.find((node) => node?.data?.kind === "trigger" || node?.kind === "trigger")
                : null;
              const triggerData = triggerNode?.data && typeof triggerNode.data === "object"
                ? triggerNode.data
                : triggerNode;
              const triggerConfig = triggerData?.config && typeof triggerData.config === "object"
                ? triggerData.config
                : {};
              const triggerType = String(triggerConfig.triggerType || triggerData?.subtype || "").trim();
              if (triggerType === "email") return "Email";
              const summary = String(
                workflow?.triggerSummary
                || deriveMetronomeTriggerSummary(workflow?.nodes || [])
                || "Manual"
              ).trim() || "Manual";
              const normalizedSummary = summary.toLowerCase();
              return normalizedSummary.startsWith("email:")
                || normalizedSummary.includes("@" + METRONOME_EMAIL_DOMAIN)
                ? "Email"
                : summary;
            };
            const getWorkflowCreator = (workflow, isBuiltInWorkflow, isTeamSharedWorkflow) => {
              const workflowCreator = normalizeMetronomeWorkflowCreator(workflow);
              const creatorAgentId = String(
                workflowCreator?.agentId
                || (workflowCreator?.type === "agent" ? workflowCreator?.id : "")
                || ""
              ).trim();
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
              const name = isBuiltInWorkflow
                ? "Computer Agents"
                : isAgentCreator
                  ? (creatorAgent?.name || creatorName || "Agent")
                  : isSharedUserCreator
                    ? (creatorName || workflowCreator?.email || creatorId || "User")
                    : "Me";
              const identity = isBuiltInWorkflow
                ? "Computer Agents"
                : isAgentCreator
                  ? (creatorAgent?.name || creatorName || creatorId || "Agent")
                  : isSharedUserCreator
                    ? (creatorName || workflowCreator?.email || creatorId || "User")
                    : (currentUserName || currentUserEmail || "Me");
              const avatarUrl = isBuiltInWorkflow
                ? METRONOME_COMPUTER_AGENTS_CREATOR_PROFILE_URL
                : isAgentCreator
                  ? (workflowCreator?.avatarUrl || getMetronomeProfileImageUrl(creatorAgent) || "")
                  : isSharedUserCreator
                    ? (workflowCreator?.avatarUrl || workflowCreator?.photoUrl || "")
                    : currentUserAvatarUrl;
              return {
                name,
                avatarUrl: canRenderMetronomeAvatarImage(avatarUrl)
                  ? normalizeMetronomeAvatarUrl(avatarUrl)
                  : "",
                fallback: getMetronomeOwnerInitials(
                  identity,
                  isBuiltInWorkflow ? "CA" : isAgentCreator ? "AG" : "ME"
                ),
              };
            };
            const rows = overviewWorkflows
              .map((workflow) => {
                const id = String(workflow?.id || "").trim();
                if (!id) return null;
                const isBuiltInWorkflow = isMetronomeWorkflowBuiltIn(workflow);
                const isTeamSharedWorkflow = isMetronomeWorkflowTeamShared(workflow);
                const hiddenKey = isTeamSharedWorkflow
                  ? getMetronomeTeamSharedWorkflowHiddenKey(workflow)
                  : "";
                const isHiddenTeamSharedWorkflow = Boolean(
                  hiddenKey && hiddenTeamSharedMetronomeWorkflowKeySet.has(hiddenKey)
                );
                const normalizedStatus = isBuiltInWorkflow
                  ? "default"
                  : isHiddenTeamSharedWorkflow
                    ? "removed"
                    : isTeamSharedWorkflow
                      ? "shared"
                      : workflow?.status === "active"
                        ? "active"
                        : workflow?.status === "paused"
                          ? "paused"
                          : "draft";
                const statusLabel = normalizedStatus === "default"
                  ? "Default"
                  : normalizedStatus === "removed"
                    ? "Removed"
                    : normalizedStatus === "shared"
                      ? "Shared"
                      : normalizedStatus === "active"
                        ? "Active"
                        : normalizedStatus === "paused"
                          ? "Paused"
                          : "Draft";
                const statusRank = normalizedStatus === "default"
                  ? 0
                  : normalizedStatus === "active"
                    ? 1
                    : normalizedStatus === "paused" || normalizedStatus === "draft"
                      ? 2
                      : normalizedStatus === "shared"
                        ? 3
                        : 4;
                const creator = getWorkflowCreator(
                  workflow,
                  isBuiltInWorkflow,
                  isTeamSharedWorkflow
                );
                const rawLastRunAt = workflow?.lastRunAt
                  ? new Date(workflow.lastRunAt).getTime()
                  : 0;
                const lastRunAt = Number.isFinite(rawLastRunAt) ? rawLastRunAt : 0;
                const lastRunLabel = isBuiltInWorkflow
                  ? "Ready to run"
                  : isHiddenTeamSharedWorkflow
                    ? "Hidden locally"
                    : formatMetronomeDate(workflow?.lastRunAt);
                return {
                  id,
                  name: String(workflow?.name || "Untitled Metronome"),
                  searchText: [
                    getMetronomeWorkflowSearchText(workflow),
                    statusLabel,
                    formatWorkflowTrigger(workflow),
                    creator.name,
                  ].join(" "),
                  status: normalizedStatus,
                  statusLabel,
                  statusRank,
                  triggerLabel: formatWorkflowTrigger(workflow),
                  creatorName: creator.name,
                  creatorAvatarUrl: creator.avatarUrl,
                  creatorFallback: creator.fallback,
                  lastRunAt,
                  sortTimestamp: getMetronomeWorkflowSortTimestamp(workflow),
                  lastRunLabel,
                  lastRunTitle: lastRunAt
                    ? new Date(lastRunAt).toLocaleString()
                    : lastRunLabel,
                  runsToday: Number(workflow?.runsToday || 0) || 0,
                  waitingApprovals: Number(workflow?.waitingApprovals || 0) || 0,
                  isBuiltIn: isBuiltInWorkflow,
                  isTeamShared: isTeamSharedWorkflow,
                  isHiddenTeamShared: isHiddenTeamSharedWorkflow,
                  canEditShared: isTeamSharedWorkflow
                    && canEditMetronomeTeamSharedWorkflow(workflow),
                };
              })
              .filter(Boolean);
            const resolveWorkflow = (row) => workflowById.get(String(row?.id || "").trim()) || null;

            return React.createElement(MetronomesOverviewPage, {
              rows,
              controlsPortalId: overviewControlsPortalId,
              loading: isLoadingMetronomes,
              onOpen: (row) => {
                const workflow = resolveWorkflow(row);
                if (workflow && !row?.isHiddenTeamShared) openMetronomeWorkflow(workflow);
              },
              onCreate: openCreateWorkflowModal,
              onEdit: (row) => {
                const workflow = resolveWorkflow(row);
                if (workflow) openEditWorkflowModalForWorkflow(workflow);
              },
              onDuplicate: (row) => {
                const workflow = resolveWorkflow(row);
                if (workflow) return duplicateWorkflow(workflow);
              },
              onShare: (row) => {
                const workflow = resolveWorkflow(row);
                if (workflow) openMetronomeShareWorkflowModal(workflow);
              },
              onDelete: (row) => {
                const workflow = resolveWorkflow(row);
                if (workflow) deleteWorkflow(workflow);
              },
              onRemoveShared: (row) => {
                const workflow = resolveWorkflow(row);
                if (workflow) hideTeamSharedMetronomeWorkflowFromList(workflow);
              },
              onRestoreShared: (row) => {
                const workflow = resolveWorkflow(row);
                if (workflow) restoreTeamSharedMetronomeWorkflowToList(workflow);
              },
            });
          };

          const renderPalette = () => React.createElement("aside", {
            className: "playground-metronome-node-palette",
          },
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

export const TEAMS_PAGE_SETUP_SCRIPT = `        function renderTeamPage() {
          const accessOptions = [
            { value: "use", label: "Use", description: "Can use this resource." },
            { value: "edit", label: "Edit", description: "Can edit this resource." },
            { value: "manage", label: "Manage", description: "Can manage access." },
          ];
          const resourceTypeOptions = [
            { value: "project", label: "Projects", createLabel: "Create new project" },
            { value: "metronome", label: "Metronome Workflow", createLabel: "Create new workflow" },
            { value: "environment", label: "Computers", createLabel: "Create new computer" },
            { value: "agent", label: "Agents", createLabel: "Create new agent" },
            { value: "imagine_template", label: "Imagine templates", createLabel: "Create new template" },
          ];
          const formatDate = (value) => {
            if (!value) return "";
            try {
              return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
            } catch {
              return String(value || "");
            }
          };
          const teamPageImagineTemplateOptions = readTeamPageCustomImagineTemplates().map((template) => ({
            id: String(template.id || ""),
            label: String(template.title || template.name || "Untitled template"),
            meta: template.updatedAt || template.createdAt ? "Updated " + formatDate(template.updatedAt || template.createdAt) : "Imagine template",
          })).filter((item) => item.id);
          const teamPageMetronomeWorkflowOptions = (() => {
            const optionsById = new Map();
            const projectNameById = new Map((Array.isArray(realProjects) ? realProjects : [])
              .map((project) => {
                const normalizedProject = normalizePlaygroundProjectRecord(project);
                return [
                  String(normalizedProject.id || "").trim(),
                  String(normalizedProject.name || normalizedProject.title || "Untitled project").trim(),
                ];
              })
              .filter(([projectId]) => projectId));
            const addWorkflowOption = (workflow, fallback = {}) => {
              const source = workflow && typeof workflow === "object" && !Array.isArray(workflow) ? workflow : {};
              const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
                ? source.metadata
                : {};
              const workflowId = String(
                source.id
                || source.workflowId
                || source.workflow_id
                || source.metronomeId
                || source.metronome_id
                || source.resourceId
                || source.resource_id
                || fallback.id
                || ""
              ).trim();
              if (!workflowId) {
                return;
              }
              const projectId = String(
                source.projectId
                || source.project_id
                || metadata.projectId
                || metadata.project_id
                || fallback.projectId
                || ""
              ).trim();
              const projectName = String(
                source.projectName
                || source.project_name
                || metadata.projectName
                || metadata.project_name
                || fallback.projectName
                || projectNameById.get(projectId)
                || ""
              ).trim();
              const title = String(
                source.name
                || source.title
                || source.label
                || source.workflowName
                || source.metronomeName
                || metadata.name
                || metadata.title
                || metadata.workflowName
                || workflowId
              ).trim() || "Untitled workflow";
              const updatedAt = String(
                source.updatedAt
                || source.updated_at
                || metadata.updatedAt
                || metadata.updated_at
                || source.createdAt
                || source.created_at
                || ""
              ).trim();
              const schedule = String(
                source.schedule
                || source.cron
                || source.cronExpression
                || source.cron_expression
                || metadata.schedule
                || metadata.cron
                || ""
              ).trim();
              const metaParts = [];
              if (projectName) {
                metaParts.push("Project: " + projectName);
              }
              if (updatedAt) {
                metaParts.push("Updated " + formatDate(updatedAt));
              } else if (schedule) {
                metaParts.push(schedule);
              }
              optionsById.set(workflowId, {
                id: workflowId,
                label: title,
                meta: metaParts.join(" · ") || "Metronome workflow",
                projectId,
                projectName,
                record: source,
              });
            };
            (Array.isArray(teamPageMetronomeWorkflows) ? teamPageMetronomeWorkflows : [])
              .forEach((workflow) => addWorkflowOption(workflow));
            (Array.isArray(realProjects) ? realProjects : []).forEach((project) => {
              const normalizedProject = normalizePlaygroundProjectRecord(project);
              const projectId = String(normalizedProject.id || "").trim();
              const projectName = String(normalizedProject.name || normalizedProject.title || "Untitled project").trim();
              const resourceIndex = projectId ? teamPageProjectResourceIndexes[projectId]?.data || null : null;
              getTeamProjectResourceIndexArray(resourceIndex, ["metronomes", "workflows", "schedules"])
                .forEach((workflow) => addWorkflowOption(workflow, { projectId, projectName }));
            });
            (Array.isArray(teamPageShares) ? teamPageShares : [])
              .filter((share) => getTeamResourceUiShareType(share) === "metronome")
              .forEach((share) => {
                const metadata = share?.metadata && typeof share.metadata === "object" && !Array.isArray(share.metadata)
                  ? share.metadata
                  : {};
                const workflowMetadata = metadata.workflow && typeof metadata.workflow === "object" && !Array.isArray(metadata.workflow)
                  ? metadata.workflow
                  : metadata.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
                    ? metadata.metronomeWorkflow
                    : metadata.metronome && typeof metadata.metronome === "object" && !Array.isArray(metadata.metronome)
                      ? metadata.metronome
                      : {};
                addWorkflowOption({
                  ...workflowMetadata,
                  resourceId: String(share?.resourceId || workflowMetadata.id || "").trim(),
                  id: String(workflowMetadata.id || share?.resourceId || "").trim(),
                  updatedAt: share?.updatedAt || workflowMetadata.updatedAt,
                });
              });
            return Array.from(optionsById.values())
              .sort((left, right) => String(left.label || "").localeCompare(String(right.label || "")));
          })();
          const selectedTeam = teamPageTeams.find((team) => team.id === teamPageSelectedTeamId) || null;
          const currentSessionUserId = String(sessionState.userId || "").trim();
          const currentSessionEmail = String(accountEmail || sessionState.email || "").trim().toLowerCase();
          const currentMember = teamPageMembers.find((member) => {
            const memberUserId = String(
              member?.userId
              || member?.user_id
              || member?.uid
              || member?.localId
              || member?.local_id
              || member?.user?.id
              || member?.user?.uid
              || member?.user?.userId
              || member?.user?.user_id
              || member?.profile?.id
              || member?.profile?.uid
              || member?.profile?.userId
              || member?.profile?.user_id
              || ""
            ).trim();
            const memberEmail = readTeamPageIdentityEmail(member);
            return Boolean(
              (currentSessionUserId && memberUserId && memberUserId === currentSessionUserId)
              || (currentSessionEmail && memberEmail && memberEmail === currentSessionEmail)
            );
          }) || null;
          const currentViewerRoleValue = String(
            selectedTeam?.currentUserRole
            || selectedTeam?.current_user_role
            || selectedTeam?.viewerRole
            || selectedTeam?.viewer_role
            || selectedTeam?.myRole
            || selectedTeam?.my_role
            || selectedTeam?.memberRole
            || selectedTeam?.member_role
            || selectedTeam?.membershipRole
            || selectedTeam?.membership_role
            || ""
          ).trim();
          const currentMemberRoleId = normalizePlaygroundTeamRoleId(
            currentMember ? currentMember.role : currentViewerRoleValue,
            "member"
          );
          const selectedTeamOwnerId = String(
            selectedTeam?.ownerUserId
            || selectedTeam?.ownerId
            || selectedTeam?.createdByUserId
            || selectedTeam?.owner?.userId
            || selectedTeam?.owner?.id
            || ""
          ).trim();
          const canManageTeam = currentMemberRoleId === "owner"
            || currentMemberRoleId === "admin"
            || Boolean(currentSessionUserId && selectedTeamOwnerId && selectedTeamOwnerId === currentSessionUserId);
          const requestedTeamRoleId = normalizePlaygroundTeamRoleId(teamPageSelectedRoleId, "");
          const selectedTeamRoleId = canManageTeam
            ? normalizePlaygroundTeamRoleId(teamPageSelectedRoleId, "member")
            : requestedTeamRoleId === "owner"
              ? "owner"
              : currentMemberRoleId;
          const resourceOptionsByType = {
            project: realProjects.map((project) => ({
              id: project.id,
              label: project.name || project.title || "Untitled project",
              meta: project.updatedAt || project.createdAt ? "Updated " + formatDate(project.updatedAt || project.createdAt) : "Project",
            })).filter((item) => item.id),
            environment: realEnvironments.map((environment) => ({
              id: environment.id,
              label: environment.name || environment.title || "Untitled computer",
              meta: environment.id || "Computer",
            })).filter((item) => item.id),
            agent: runtimeAgents.map((agent) => ({
              id: agent.id,
              label: agent.name || agent.title || "Untitled agent",
              meta: agent.description || agent.model || "Agent",
            })).filter((item) => item.id),
            metronome: teamPageMetronomeWorkflowOptions,
            imagine_template: teamPageImagineTemplateOptions,
          };
          const directlySharedResourceKeys = new Set((Array.isArray(teamPageShares) ? teamPageShares : [])
            .map((share) => getTeamResourceUiShareType(share) + ":" + String(share?.resourceId || "").trim())
            .filter((key) => !key.endsWith(":")));
          const selectedResourceOptions = (resourceOptionsByType[teamPageShareResourceType] || [])
            .filter((resource) => !directlySharedResourceKeys.has(String(teamPageShareResourceType || "").trim() + ":" + String(resource?.id || "").trim()));
          const resourceNameByKey = new Map();
          resourceTypeOptions.forEach((typeOption) => {
            (resourceOptionsByType[typeOption.value] || []).forEach((resource) => {
              resourceNameByKey.set(typeOption.value + ":" + resource.id, resource.label);
            });
          });
          const formatRole = (role) => getPlaygroundTeamRoleDefinition(role).label;
          const formatAccess = (accessLevel) => accessOptions.find((option) => option.value === accessLevel)?.label || String(accessLevel || "Use");
          const formatResourceType = (resourceType) => resourceTypeOptions.find((option) => option.value === resourceType)?.label || String(resourceType || "Resource");
          const getTeamResourceShareMetadataTitle = (share) => {
            const metadata = parseTeamResourceShareMetadata(share);
            const workflow = metadata.workflow && typeof metadata.workflow === "object" && !Array.isArray(metadata.workflow)
              ? metadata.workflow
              : metadata.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
                ? metadata.metronomeWorkflow
                : metadata.metronome && typeof metadata.metronome === "object" && !Array.isArray(metadata.metronome)
                  ? metadata.metronome
                  : {};
            const template = metadata.template && typeof metadata.template === "object" && !Array.isArray(metadata.template)
              ? metadata.template
              : metadata.imagineTemplate && typeof metadata.imagineTemplate === "object" && !Array.isArray(metadata.imagineTemplate)
                ? metadata.imagineTemplate
                : {};
            return String(
              workflow.name
              || workflow.title
              || workflow.workflowName
              || workflow.metronomeName
              || template.title
              || template.name
              || metadata.resourceName
              || metadata.resource_name
              || ""
            ).trim();
          };

	          const renderRoleSelect = (props = {}) => {
	            const { variant, className, ...selectProps } = props || {};
	            const isMemberRowVariant = variant === "member-row";
	            const selectElement = React.createElement("select", {
	              className: "playground-team-select"
	                + (isMemberRowVariant ? " playground-team-member-role-select" : "")
	                + (className ? " " + className : ""),
	              ...selectProps,
	              value: normalizePlaygroundTeamRoleId(props?.value, "member"),
	            }, PLAYGROUND_ASSIGNABLE_TEAM_ROLE_DEFINITIONS.map((option) =>
	              React.createElement("option", { key: option.id, value: option.id }, option.label)
	            ));
	            return isMemberRowVariant
	              ? React.createElement("span", { className: "playground-team-member-role-select-shell" },
	                  selectElement,
	                  React.createElement(ChevronsUpDown, {
	                    className: "playground-team-member-role-select-icon",
	                    width: 13,
	                    height: 13,
	                    strokeWidth: 1.55,
	                    "aria-hidden": "true",
	                  })
	                )
	              : selectElement;
	          };

          const renderEmpty = (text) => React.createElement("div", { className: "playground-team-empty" }, text);

          if (teamPageRequiresPlan) {
            return React.createElement("div", { className: "playground-team-page" },
              React.createElement("div", { className: "playground-team-shell is-plan-empty" },
                React.createElement("div", { className: "playground-team-plan-empty" },
                  React.createElement("img", {
                    className: "playground-team-plan-empty-visual",
                    src: "/img/empty-state/no-users-yet.avif",
                    alt: "",
                    draggable: false,
                  }),
                  React.createElement("h1", { className: "playground-team-plan-empty-title" }, "Teams are available on the Team plan"),
                  React.createElement("p", { className: "playground-team-plan-empty-copy" }, "Upgrade to invite people, share projects, computers, agents, and Imagine templates, and keep everyone working inside one shared workspace."),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-team-plan-empty-button",
                    onClick: () => openSettingsPage("costs-plans"),
                  }, "View plans")
                )
              )
            );
          }

          const openTeamDetail = (teamId) => {
            const normalizedTeamId = String(teamId || "").trim();
            if (!normalizedTeamId) {
              return;
            }
            setTeamPageActiveTab("members");
            setTeamPageSelectedRoleId("member");
            setTeamPageSelectedTeamId(normalizedTeamId);
            setTeamPageMembers([]);
            setTeamPageInvitations([]);
            setTeamPageShares([]);
            setTeamPageResourceFilter("all");
            setTeamPageResourceSearchQuery("");
            setTeamPageResourceToolbarPopover("");
            setTeamPageResourceMenuId("");
          };

          const renderTeamActionButton = (label, onClick, options = {}) => React.createElement(PlatformButton, {
            variant: options.primary ? "primary" : "secondary",
            type: "button",
            className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-team-action-button" + (options.primary ? " is-primary" : ""),
            onClick,
            disabled: Boolean(options.disabled),
          }, options.icon || null, label);

          const closeCreateTeamModal = () => {
            if (teamPageActionId === "create-team") {
              return;
            }
            setTeamPageCreateModalOpen(false);
          };

          const renderCreateTeamModal = () => teamPageCreateModalOpen
            ? React.createElement(PlatformModalBackdrop, {
                className: "playground-team-modal-backdrop",
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget) {
                    closeCreateTeamModal();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                  className: "playground-team-modal",
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-labelledby": "team-create-modal-title",
                },
                  React.createElement("div", { className: "playground-team-modal-header" },
                    React.createElement("div", null,
                      React.createElement("h2", { id: "team-create-modal-title", className: "playground-team-modal-title" }, "Create team"),
                      React.createElement("p", { className: "playground-team-modal-subtitle" }, "Create a workspace and invite the first people in one step.")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-team-modal-close",
                      onClick: closeCreateTeamModal,
                      "aria-label": "Close create team modal",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-team-modal-form" },
                    React.createElement("div", { className: "playground-team-modal-field" },
                      React.createElement("label", { className: "playground-team-modal-label", htmlFor: "team-create-name" }, "Team name"),
                      React.createElement("input", {
                        id: "team-create-name",
                        className: "playground-team-input",
                        value: teamPageCreateName,
                        onChange: (event) => setTeamPageCreateName(event.target.value),
                        placeholder: "Acme product team",
                        disabled: teamPageActionId === "create-team",
                      })
                    ),
                    React.createElement("div", { className: "playground-team-modal-field" },
                      React.createElement("label", { className: "playground-team-modal-label", htmlFor: "team-create-invites" }, "Invite emails"),
                      React.createElement("textarea", {
                        id: "team-create-invites",
                        className: "playground-team-input playground-team-textarea",
                        value: teamPageCreateInviteEmails,
                        onChange: (event) => setTeamPageCreateInviteEmails(event.target.value),
                        placeholder: "jan@company.com, sarah@company.com",
                        disabled: teamPageActionId === "create-team",
                      })
                    ),
                    React.createElement("div", { className: "playground-team-modal-field" },
                      React.createElement("label", { className: "playground-team-modal-label" }, "Initial role"),
                      renderRoleSelect({
                        value: teamPageCreateInviteRole,
                        onChange: (event) => setTeamPageCreateInviteRole(event.target.value),
                        disabled: teamPageActionId === "create-team",
                      })
                    ),
                    React.createElement("div", { className: "playground-team-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-team-button",
                        onClick: closeCreateTeamModal,
                        disabled: teamPageActionId === "create-team",
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "large",
                        type: "button",
                        className: "playground-team-button is-primary",
                        onClick: handleCreateTeam,
                        disabled: teamPageActionId === "create-team" || !String(teamPageCreateName || "").trim(),
                      }, teamPageActionId === "create-team" ? "Creating..." : "Create team")
                    )
                  )
                )
              )
            : null;

          const closeRenameTeamModal = () => {
            closeTeamPageRenameModal();
          };

          const renderRenameTeamModal = () => {
            if (!teamPageRenameModalOpen && !teamPageRenameModalClosing) {
              return null;
            }
            const modalElement = React.createElement(PlatformModalBackdrop, {
                className: "playground-team-modal-backdrop playground-team-mission-modal-backdrop"
                  + (teamPageRenameModalVisible ? " is-visible" : "")
                  + (teamPageRenameModalClosing ? " is-closing" : ""),
                onClick: closeRenameTeamModal,
              },
                React.createElement(PlatformModalSurface, {
                  className: "playground-team-modal playground-team-mission-modal"
                    + (teamPageRenameModalVisible ? " is-visible" : "")
                    + (teamPageRenameModalClosing ? " is-closing" : ""),
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-labelledby": "team-rename-modal-title",
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement("div", { className: "playground-team-modal-header" },
                    React.createElement("div", null,
                      React.createElement("h2", { id: "team-rename-modal-title", className: "playground-team-modal-title" }, "Edit team"),
                      React.createElement("p", { className: "playground-team-modal-subtitle" }, "Rename this workspace for everyone on the team.")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-team-modal-close",
                      onClick: closeRenameTeamModal,
                      disabled: teamPageActionId === "rename-team" || teamPageActionId === "delete-team",
                      "aria-label": "Close edit team modal",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-team-modal-form" },
                    React.createElement("div", { className: "playground-team-modal-field" },
                      React.createElement("label", { className: "playground-team-modal-label", htmlFor: "team-rename-name" }, "Team name"),
                      React.createElement("input", {
                        id: "team-rename-name",
                        className: "playground-team-input",
                        value: teamPageRenameName,
                        onChange: (event) => setTeamPageRenameName(event.target.value),
                        placeholder: "Acme product team",
                        disabled: teamPageActionId === "rename-team" || teamPageActionId === "delete-team",
                      })
                    ),
                    React.createElement("div", { className: "playground-team-modal-actions is-split" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-team-button is-danger",
                        onClick: handleDeleteTeam,
                        disabled: teamPageActionId === "rename-team" || teamPageActionId === "delete-team",
                      }, teamPageActionId === "delete-team" ? "Deleting..." : "Delete team"),
                      React.createElement("div", { className: "playground-team-modal-action-group" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-team-button",
                          onClick: closeRenameTeamModal,
                          disabled: teamPageActionId === "rename-team" || teamPageActionId === "delete-team",
                        }, "Cancel"),
                        React.createElement(PlatformPrimaryButton, {
                          size: "large",
                          type: "button",
                          className: "playground-team-button is-primary",
                          onClick: handleRenameTeam,
                          disabled: teamPageActionId === "rename-team" || teamPageActionId === "delete-team" || !String(teamPageRenameName || "").trim(),
                        }, teamPageActionId === "rename-team" ? "Saving..." : "Save changes")
                      )
                    )
                  )
                )
              );
            return typeof document !== "undefined" && document.body
              ? createPortal(modalElement, document.body)
              : modalElement;
          };

          const closeInviteTeamModal = () => {
            closeTeamPageInviteModal();
          };

          const renderInviteTeamModal = () => {
            if (!teamPageInviteModalOpen && !teamPageInviteModalClosing) {
              return null;
            }
            const modalElement = React.createElement(PlatformModalBackdrop, {
                className: "playground-team-modal-backdrop playground-team-mission-modal-backdrop"
                  + (teamPageInviteModalVisible ? " is-visible" : "")
                  + (teamPageInviteModalClosing ? " is-closing" : ""),
                onClick: closeInviteTeamModal,
              },
                React.createElement(PlatformModalSurface, {
                  className: "playground-team-modal playground-team-mission-modal"
                    + (teamPageInviteModalVisible ? " is-visible" : "")
                    + (teamPageInviteModalClosing ? " is-closing" : ""),
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-labelledby": "team-invite-modal-title",
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement("div", { className: "playground-team-modal-header" },
                    React.createElement("div", null,
                      React.createElement("h2", { id: "team-invite-modal-title", className: "playground-team-modal-title" }, "Invite member"),
                      React.createElement("p", { className: "playground-team-modal-subtitle" }, "Send an invitation and choose the team role for this person.")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-team-modal-close",
                      onClick: closeInviteTeamModal,
                      "aria-label": "Close invite member modal",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-team-modal-form" },
                    React.createElement("div", { className: "playground-team-modal-field" },
                      React.createElement("label", { className: "playground-team-modal-label", htmlFor: "team-invite-email" }, "Email"),
                      React.createElement("input", {
                        id: "team-invite-email",
                        className: "playground-team-input",
                        type: "email",
                        value: teamPageInviteEmail,
                        onChange: (event) => setTeamPageInviteEmail(event.target.value),
                        placeholder: "name@company.com",
                        disabled: teamPageActionId === "invite",
                      })
                    ),
                    React.createElement("div", { className: "playground-team-modal-field" },
                      React.createElement("label", { className: "playground-team-modal-label" }, "Role"),
                      renderRoleSelect({
                        value: teamPageInviteRole,
                        onChange: (event) => setTeamPageInviteRole(event.target.value),
                        disabled: teamPageActionId === "invite",
                      })
                    ),
                    React.createElement("div", { className: "playground-team-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-team-button",
                        onClick: closeInviteTeamModal,
                        disabled: teamPageActionId === "invite",
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "large",
                        type: "button",
                        className: "playground-team-button is-primary",
                        onClick: handleSendTeamInvite,
                        disabled: teamPageActionId === "invite" || !String(teamPageInviteEmail || "").trim(),
                      }, teamPageActionId === "invite" ? "Sending..." : "Send invite")
                    )
                  )
                )
              );
            return typeof document !== "undefined" && document.body
              ? createPortal(modalElement, document.body)
              : modalElement;
          };

          const closeShareTeamModal = () => {
            closeTeamPageShareModal();
          };

          const openTeamShareResourceCreation = (resourceType) => {
            const normalizedType = String(resourceType || teamPageShareResourceType || "").trim();
            closeTeamPageShareModal({ force: true });
            setTeamPageResourceToolbarPopover("");
            setTeamPageResourceMenuId("");
            if (normalizedType === "project") {
              setSidebarWorkspaceMode("work");
              setTasksPageNavigationRequest({
                token: createPlaygroundPlatformNavigationToken(),
                projectId: "",
                view: "overview",
                missionControlAction: "",
                projectComposerAction: "create",
              });
              setActivePage("tasks");
              return;
            }
            if (normalizedType === "environment") {
              setEnvironmentsNavigationTargetId(PLAYGROUND_ENVIRONMENT_DRAFT_ID);
              setSidebarWorkspaceMode("configure");
              setResourcesView("computers");
              setResourcesHeaderState({
                mode: "overview",
                title: "",
              });
              setActivePage("resources");
              setEnvironmentsOpenToken((current) => current + 1);
              return;
            }
            if (normalizedType === "agent") {
              setAgentPageSelectionRequest(null);
              setSidebarWorkspaceMode("work");
              setResourcesView("agents");
              setResourcesHeaderState({
                mode: "overview",
                title: "",
              });
              setActivePage("resources");
              setAgentCreationPageRequestToken((current) => current + 1);
              return;
            }
            if (normalizedType === "metronome") {
              openMetronomePage({
                projectId: "",
                workflowId: "",
              });
              return;
            }
            if (normalizedType === "imagine_template") {
              setImagineActiveView("create-template");
              openImaginePage();
            }
          };

          const renderShareResourceModal = () => {
            if (!teamPageShareModalOpen && !teamPageShareModalClosing) {
              return null;
            }
            const selectedTypeOption = resourceTypeOptions.find((option) => option.value === teamPageShareResourceType) || resourceTypeOptions[0];
            const selectedTypeMeta = getTeamResourceTypeMeta(selectedTypeOption?.value || teamPageShareResourceType);
            const SelectedTypeIcon = selectedTypeMeta?.Icon || Layers;
            const isProjectShareType = String(teamPageShareResourceType || "").trim() === "project";
            const selectedResourceOption = selectedResourceOptions.find((resource) =>
              String(resource?.id || "").trim() === String(teamPageShareResourceId || "").trim()
            ) || null;
            const resourceTypeLabel = String(selectedTypeOption?.label || selectedTypeMeta?.label || "resources").trim();
            const resourceSingularLabel = String(selectedTypeMeta?.label || resourceTypeLabel || "Resource").trim();
            const resourceAccentByType = {
              project: "#ffffff",
              environment: "#ffffff",
              agent: "#ffffff",
              metronome: "#ffffff",
              imagine_template: "#ffffff",
            };
            const selectedResourceTriggerTitle = selectedResourceOption?.label || "Select " + resourceSingularLabel.toLowerCase();
            const selectedResourceTriggerDescription = selectedResourceOption?.meta
              || (selectedResourceOptions.length > 0
                ? "Choose an existing " + resourceSingularLabel.toLowerCase()
                : "No existing " + resourceTypeLabel.toLowerCase() + " available");
            const resourceAccent = resourceAccentByType[String(teamPageShareResourceType || "").trim()] || "#ffffff";
            const modalElement = React.createElement(PlatformModalBackdrop, {
                className: "playground-team-modal-backdrop playground-team-mission-modal-backdrop"
                  + (teamPageShareModalVisible ? " is-visible" : "")
                  + (teamPageShareModalClosing ? " is-closing" : ""),
                onClick: closeShareTeamModal,
              },
                React.createElement(PlatformModalSurface, {
                  className: "playground-team-modal playground-team-mission-modal is-share-resource"
                    + (teamPageShareModalVisible ? " is-visible" : "")
                    + (teamPageShareModalClosing ? " is-closing" : ""),
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-labelledby": "team-share-modal-title",
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement("div", { className: "playground-team-modal-header" },
                    React.createElement("div", null,
                      React.createElement("h2", { id: "team-share-modal-title", className: "playground-team-modal-title" }, "Add " + (selectedTypeOption?.label || "resources"))
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-team-modal-close",
                      onClick: closeShareTeamModal,
                      disabled: teamPageActionId === "share",
                      "aria-label": "Close add resource modal",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-team-share-picker" },
                    React.createElement("div", { className: "playground-team-share-picker-bar" },
                      isProjectShareType
                        ? null
                        : React.createElement("div", {
                            className: "playground-team-share-access-row",
                          },
                          React.createElement("span", { className: "playground-team-share-access-label" }, "Access"),
                          React.createElement("div", {
                            className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-detail-select-shell playground-team-share-access-shell"
                              + (teamPageShareAccessPickerOpen ? " is-open" : ""),
                          },
                            React.createElement("button", {
                              type: "button",
                              className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger" + (teamPageShareAccessPickerOpen ? " is-active" : ""),
                              disabled: teamPageActionId === "share",
                              onClick: () => {
                                setTeamPageShareResourcePickerOpen(false);
                                setTeamPageShareAccessPickerOpen((current) => !current);
                              },
                              title: formatAccess(teamPageShareAccessLevel),
                              "aria-expanded": teamPageShareAccessPickerOpen ? "true" : "false",
                            },
                              React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, formatAccess(teamPageShareAccessLevel)),
                              React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
                            ),
                            teamPageShareAccessPickerOpen
                              ? React.createElement(PlatformPopupSurface, {
                                  className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                                },
                                  accessOptions.map((option) => {
                                    const isSelected = String(teamPageShareAccessLevel || "use") === option.value;
                                    return React.createElement("button", {
                                        key: option.value,
                                        type: "button",
                                        className: "tb-popup-row tb-popup-row-select" + (isSelected ? " selected" : ""),
                                        onClick: () => {
                                          setTeamPageShareAccessLevel(option.value);
                                          setTeamPageShareAccessPickerOpen(false);
                                        },
                                      },
                                      React.createElement("span", { className: "tb-popup-check-slot" },
                                        isSelected
                                          ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                          : null
                                      ),
                                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                        React.createElement("span", null, option.label),
                                        React.createElement("span", { className: "playground-team-access-option-description" }, option.description)
                                      )
                                    );
                                  })
                                )
                              : null
                          )
                        )
                    ),
                    React.createElement("div", {
                        className: "playground-tasks-project-blueprint-section playground-tasks-toolbar-popup-shell playground-team-share-resource-selector"
                          + (teamPageShareResourcePickerOpen ? " is-open" : ""),
                      },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-project-blueprint-trigger",
                        onClick: () => {
                          setTeamPageShareAccessPickerOpen(false);
                          setTeamPageShareResourcePickerOpen((current) => !current);
                        },
                        disabled: teamPageActionId === "share" || selectedResourceOptions.length === 0,
                        "aria-haspopup": "listbox",
                        "aria-expanded": teamPageShareResourcePickerOpen ? "true" : "false",
                      },
                        React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-main" },
                          React.createElement("span", {
                            className: "playground-tasks-project-blueprint-icon",
                            style: { "--project-blueprint-accent": resourceAccent },
                            "aria-hidden": "true",
                          }, React.createElement(SelectedTypeIcon, { width: 15, height: 15, strokeWidth: 1.85 })),
                          React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-copy" },
                            React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-title" }, selectedResourceTriggerTitle),
                            React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-description" }, selectedResourceTriggerDescription)
                          )
                        ),
                        React.createElement(ChevronDown, { className: "playground-tasks-project-blueprint-chevron", strokeWidth: 1.8 })
                      ),
                      teamPageShareResourcePickerOpen
                        ? React.createElement(PlatformPopupSurface, {
                            className: "playground-tasks-toolbar-popup-menu playground-tasks-project-blueprint-popover playground-tasks-toolbar-popup-menu-animate-down-in",
                            role: "listbox",
                          },
                            React.createElement("div", { className: "playground-tasks-project-blueprint-grid" },
                              selectedResourceOptions.map((resource) => {
                                const resourceId = String(resource?.id || "").trim();
                                const isSelected = resourceId && teamPageShareResourceId === resourceId;
                                return React.createElement("button", {
                                    key: resourceId,
                                    type: "button",
                                    className: "playground-tasks-project-blueprint-option" + (isSelected ? " is-active" : ""),
                                    onClick: () => {
                                      setTeamPageShareResourceId(resourceId);
                                      setTeamPageShareResourcePickerOpen(false);
                                    },
                                  },
                                  React.createElement("span", {
                                    className: "playground-tasks-project-blueprint-icon",
                                    style: { "--project-blueprint-accent": resourceAccent },
                                    "aria-hidden": "true",
                                  }, React.createElement(SelectedTypeIcon, { width: 15, height: 15, strokeWidth: 1.85 })),
                                  React.createElement("span", { className: "playground-tasks-project-blueprint-copy" },
                                    React.createElement("span", { className: "playground-tasks-project-blueprint-title" }, resource?.label || "Untitled resource"),
                                    React.createElement("span", { className: "playground-tasks-project-blueprint-description" }, resource?.meta || formatResourceType(teamPageShareResourceType))
                                  )
                                );
                              })
                            )
                          )
                        : null
                    ),
                    teamPageShareResourceType === "imagine_template"
                      ? React.createElement("p", { className: "playground-team-modal-help" }, "Only custom templates from Imagine My Templates can be shared.")
                      : null,
                    React.createElement("button", {
                      type: "button",
                      className: "playground-team-share-create-new",
                      onClick: () => openTeamShareResourceCreation(teamPageShareResourceType),
                      disabled: teamPageActionId === "share",
                    },
                      React.createElement("span", null, selectedTypeOption?.createLabel || "Create new resource"),
                      React.createElement(ArrowRight, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("div", { className: "playground-team-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-team-button",
                        onClick: closeShareTeamModal,
                        disabled: teamPageActionId === "share",
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "large",
                        type: "button",
                        className: "playground-team-button is-primary",
                        onClick: handleCreateTeamResourceShare,
                        disabled: teamPageActionId === "share" || !teamPageShareResourceId,
                      }, teamPageActionId === "share" ? "Adding..." : "Add to team")
                    )
                  )
                )
              );
            return typeof document !== "undefined" && document.body
              ? createPortal(modalElement, document.body)
              : modalElement;
          };

          const normalizeTeamOverviewSortDirection = (direction) =>
            direction === "desc" ? "desc" : "asc";
          const normalizedTeamOverviewSortDirection = normalizeTeamOverviewSortDirection(teamOverviewSortDirection);
          const getTeamOverviewDisplayName = (team) => String(team?.name || "Untitled team").trim();
          const getTeamOverviewCreatedTimestamp = (team) => {
            const timestamp = Date.parse(String(team?.createdAt || team?.created_at || ""));
            return Number.isFinite(timestamp) ? timestamp : 0;
          };
          const getTeamOverviewOwnerLabel = (team) => {
            const ownerName = String(
              team?.ownerName
              || team?.owner_name
              || team?.owner?.name
              || team?.owner?.displayName
              || team?.createdByName
              || team?.created_by_name
              || ""
            ).trim();
            const ownerEmail = String(
              team?.ownerEmail
              || team?.owner_email
              || team?.owner?.email
              || team?.createdByEmail
              || team?.created_by_email
              || ""
            ).trim();
            if (ownerName) {
              return ownerName;
            }
            if (ownerEmail) {
              return ownerEmail;
            }
            if (String(team?.ownerUserId || team?.ownerId || "").trim() === String(sessionState.userId || "").trim()) {
              return "You";
            }
            return "Team";
          };
          const getTeamOverviewRoleLabel = (team) => formatRole(team?.role);
          const getTeamOverviewSortValue = (team, sortKey) => {
            switch (sortKey) {
              case "role":
                return getTeamOverviewRoleLabel(team);
              case "owner":
                return getTeamOverviewOwnerLabel(team);
              case "created":
                return getTeamOverviewCreatedTimestamp(team);
              case "name":
              default:
                return getTeamOverviewDisplayName(team);
            }
          };
          const compareTeamOverviewSortValues = (left, right, sortKey) => {
            const leftValue = getTeamOverviewSortValue(left, sortKey);
            const rightValue = getTeamOverviewSortValue(right, sortKey);
            if (typeof leftValue === "number" || typeof rightValue === "number") {
              const leftNumber = typeof leftValue === "number" && Number.isFinite(leftValue) ? leftValue : 0;
              const rightNumber = typeof rightValue === "number" && Number.isFinite(rightValue) ? rightValue : 0;
              if (leftNumber !== rightNumber) {
                return leftNumber - rightNumber;
              }
            } else {
              const textComparison = String(leftValue || "").localeCompare(String(rightValue || ""), undefined, {
                numeric: true,
                sensitivity: "base",
              });
              if (textComparison !== 0) {
                return textComparison;
              }
            }
            return getTeamOverviewDisplayName(left).localeCompare(getTeamOverviewDisplayName(right), undefined, {
              numeric: true,
              sensitivity: "base",
            });
          };
          const normalizedTeamOverviewSearchQuery = String(teamOverviewSearchQuery || "").trim().toLowerCase();
          const visibleOverviewTeams = (Array.isArray(teamPageTeams) ? teamPageTeams : [])
            .filter((team) => {
              if (teamOverviewFilter === "owned" && String(team?.ownerUserId || team?.ownerId || "").trim() !== String(sessionState.userId || "").trim()) {
                return false;
              }
              if (teamOverviewFilter === "member" && String(team?.ownerUserId || team?.ownerId || "").trim() === String(sessionState.userId || "").trim()) {
                return false;
              }
              if (!normalizedTeamOverviewSearchQuery) {
                return true;
              }
              const haystack = [
                getTeamOverviewDisplayName(team),
                getTeamOverviewRoleLabel(team),
                getTeamOverviewOwnerLabel(team),
                team?.id || "",
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedTeamOverviewSearchQuery);
            })
            .slice()
            .sort((left, right) => {
              const baseComparison = compareTeamOverviewSortValues(left, right, teamOverviewSort);
              return normalizedTeamOverviewSortDirection === "desc" ? -baseComparison : baseComparison;
            });
          const visibleOverviewTeamIds = visibleOverviewTeams.map((team) => String(team?.id || "").trim()).filter(Boolean);
          const selectedVisibleTeamOverviewIds = visibleOverviewTeamIds.filter((teamId) => selectedTeamOverviewIds.has(teamId));
          const allVisibleTeamsSelected = visibleOverviewTeamIds.length > 0 && selectedVisibleTeamOverviewIds.length === visibleOverviewTeamIds.length;
          const teamOverviewFilterOptions = [
            { id: "all", label: "All Teams", description: "Show every team workspace" },
            { id: "owned", label: "Owned by You", description: "Only show teams you own" },
            { id: "member", label: "Member Teams", description: "Only show teams where you are a member" },
          ];
	          const teamOverviewColumns = [
	            {
	              id: "name",
	              header: "Name",
	              accessor: getTeamOverviewDisplayName,
	              sortable: true,
	              width: "minmax(220px, 1.35fr)",
	              cell: ({ row: team }) => React.createElement("div", { className: "playground-agents-overview-name-title" }, getTeamOverviewDisplayName(team)),
	            },
	            {
	              id: "role",
	              header: "Role",
	              accessor: getTeamOverviewRoleLabel,
	              sortable: true,
	              width: "minmax(105px, 0.55fr)",
	              cell: ({ row: team }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, getTeamOverviewRoleLabel(team)),
	            },
	            {
	              id: "owner",
	              header: "Owner",
	              accessor: getTeamOverviewOwnerLabel,
	              sortable: true,
	              width: "minmax(170px, 0.85fr)",
	              hideBelow: 760,
	              cell: ({ row: team }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, getTeamOverviewOwnerLabel(team)),
	            },
	            {
	              id: "created",
	              header: "Created",
	              accessor: getTeamOverviewCreatedTimestamp,
	              sortable: true,
	              sortDescFirst: true,
	              width: "minmax(120px, 0.6fr)",
	              align: "end",
	              hideBelow: 900,
	              cell: ({ row: team }) => {
	                const createdAt = team?.createdAt || team?.created_at || "";
	                return React.createElement("div", {
	                  className: "playground-agents-overview-table-value is-right",
	                  title: createdAt ? formatPlaygroundExactDate(createdAt) : "",
	                }, formatDate(createdAt) || "-");
	              },
	            },
	          ];
	          const getTeamOverviewActions = (team) => [
	            { id: "open", label: "Open", icon: ChevronRight, onSelect: () => openTeamDetail(team.id) },
	            {
	              id: "rename",
	              label: "Rename",
	              icon: SquarePen,
	              onSelect: () => {
	                setTeamPageSelectedTeamId(String(team?.id || ""));
	                setTeamPageRenameName(team?.name || "");
	                setTeamPageRenameModalOpen(true);
	              },
	            },
	          ];
	          const teamOverviewDataTable = React.createElement(PlatformDataTable, {
	            rows: visibleOverviewTeams,
	            columns: teamOverviewColumns,
	            getRowId: (team) => String(team?.id || ""),
	            ariaLabel: "Teams",
	            className: "playground-teams-platform-data-table",
	            surface: "plain",
	            sorting: {
	              value: { id: teamOverviewSort, direction: normalizedTeamOverviewSortDirection },
	              manual: true,
	              onChange: (nextSorting) => {
	                if (!nextSorting) return;
	                setTeamOverviewSort(nextSorting.id);
	                setTeamOverviewSortDirection(nextSorting.direction);
	                setTeamOverviewToolbarPopover("");
	              },
	            },
	            selection: {
	              enabled: true,
	              value: selectedTeamOverviewIds,
	              onChange: ({ selectedIds }) => setSelectedTeamOverviewIds(new Set(selectedIds)),
	              ariaLabel: (team) => "Select " + getTeamOverviewDisplayName(team),
	            },
	            toolbar: {
	              search: { value: teamOverviewSearchQuery, onChange: setTeamOverviewSearchQuery, placeholder: "Search teams", manual: true },
	              filters: [{ id: "ownership", label: "Ownership", value: teamOverviewFilter, options: teamOverviewFilterOptions, onChange: setTeamOverviewFilter }],
	              primaryAction: { label: "New Team", icon: Plus, onClick: () => setTeamPageCreateModalOpen(true) },
	            },
	            getRowActions: getTeamOverviewActions,
	            getRowAriaLabel: getTeamOverviewDisplayName,
	            onRowActivate: (team) => openTeamDetail(team.id),
	            loading: teamPageLoading && visibleOverviewTeams.length === 0,
	            emptyState: normalizedTeamOverviewSearchQuery ? "No matching teams found." : "No teams yet.",
	          });
`;

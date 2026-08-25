export const PROJECTS_ACTIONS_03_FRAGMENT = `            leadUserId: normalizedProjectLead.userId,
            leadName: normalizedProjectLead.name,
            leadEmail: normalizedProjectLead.email,
            leadAvatarUrl: normalizedProjectLead.avatarUrl,
            lead: normalizedProjectLead.userId || normalizedProjectLead.name || normalizedProjectLead.email
              ? normalizedProjectLead
              : null,
	            attachments: normalizedProjectAttachments,
	            connectors: hasPlaygroundTaskConnectorSelections(normalizedProjectConnectors) ? normalizedProjectConnectors : null,
	            projectRules: normalizedProjectRules,
	            permissionSet: normalizedProjectPermissionSet,
	          };
          if (hasKnownMissionControlMetadata || hasMeaningfulPlaygroundProjectMissionControlRecord(normalizedProjectMissionControl)) {
            metadataPayload.missionControl = buildPlaygroundProjectMissionControlStorageRecord(normalizedProjectMissionControl);
          }
	          return {
	            name: normalizedProject.name || "Project",
	            description: normalizedProject.description,
            color: normalizedProject.color || getPlaygroundProjectAccent(normalizedProject, projectIndex),
            status: normalizedProjectStatus,
            priority: normalizedProjectPriority,
	            defaultEnvironmentId: normalizedProject.defaultEnvironmentId || undefined,
            leadUserId: normalizedProjectLead.userId || undefined,
            leadName: normalizedProjectLead.name || undefined,
            leadEmail: normalizedProjectLead.email || undefined,
            leadAvatarUrl: normalizedProjectLead.avatarUrl || undefined,
            lead: normalizedProjectLead.userId || normalizedProjectLead.name || normalizedProjectLead.email
              ? normalizedProjectLead
              : undefined,
	            permissionSet: normalizedProjectPermissionSet,
	            attachments: normalizedProjectAttachments,
	            metadata: metadataPayload,
		          };
		        }

		        function applyProjectPermissionSetLocally(
		          projectId,
		          permissionSet,
		          principalId = PLATFORM_ALL_AGENTS_PRINCIPAL_ID
		        ) {
	          const normalizedProjectId = String(projectId || "").trim();
	          if (!normalizedProjectId) {
	            return;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "project");
		          const normalizedPrincipalId = normalizePlatformAccessPrincipalId(principalId);
		          const mergePermissionSet = (project) => {
		            const currentMetadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
		              ? project.metadata
		              : {};
		            const nextMetadata = buildPlatformSystemPrincipalPermissionMetadata(
		              currentMetadata,
		              normalizedPrincipalId,
		              normalizedPermissionSet,
		              "project"
		            );
		            return normalizePlaygroundProjectRecord({
		              ...(project && typeof project === "object" ? project : {}),
		              ...(normalizedPrincipalId === PLATFORM_ALL_AGENTS_PRINCIPAL_ID
		                ? { permissionSet: normalizedPermissionSet }
		                : {}),
		              metadata: nextMetadata,
		            });
		          };

	          setProjects((current) => current.map((project) =>
	            project.id === normalizedProjectId ? mergePermissionSet(project) : project
	          ));
	          setProjectDraft((current) =>
	            current?.id === normalizedProjectId ? mergePermissionSet(current) : current
	          );
	          setSelectedProjectDetail((current) => {
	            if (current?.project?.id !== normalizedProjectId) {
	              return current;
	            }
	            return {
	              ...current,
	              project: mergePermissionSet(current.project),
	            };
	          });
	        }

		        async function persistProjectPermissionSet(
		          nextPermissionSet,
		          principalId = PLATFORM_ALL_AGENTS_PRINCIPAL_ID
		        ) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          if (!normalizedProjectId) {
	            return null;
		          }
		          const normalizedPermissionSet = normalizePlaygroundPermissionSet(nextPermissionSet, "project");
		          const normalizedPrincipalId = normalizePlatformAccessPrincipalId(principalId);
		          const nextMetadata = buildPlatformSystemPrincipalPermissionMetadata(
		            normalizedProject.metadata,
		            normalizedPrincipalId,
		            normalizedPermissionSet,
		            "project"
		          );
		          const nextProjectRecord = normalizePlaygroundProjectRecord({
		            ...normalizedProject,
		            ...(normalizedPrincipalId === PLATFORM_ALL_AGENTS_PRINCIPAL_ID
		              ? { permissionSet: normalizedPermissionSet }
		              : {}),
		            metadata: nextMetadata,
		          });
		          const savePayload = buildPlaygroundProjectSavePayload(nextProjectRecord, nextMetadata);

	          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
	            method: "PATCH",
	            headers: {
	              ...requestHeaders,
	              "Content-Type": "application/json",
	            },
	            body: JSON.stringify(savePayload),
	          });
	          const data = await response.json().catch(() => ({}));
	          if (!response.ok) {
	            throw new Error(data?.message || data?.error || "Failed to update project permissions.");
	          }
	          const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
	          if (updatedProject?.id) {
	            commitLocalProjectRecord(updatedProject, {
	              summary: updatedProject.summary || selectedProjectSummary,
	              environments: selectedProjectEnvironments,
	              recentThreads: selectedProjectRecentThreads,
	              threads: selectedProjectRecentThreads,
	              selectImmediately: true,
	            });
	          }
	          return updatedProject;
	        }

		        function updateProjectPermissionSet(updater) {
		          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
		          const normalizedProjectId = String(normalizedProject.id || "").trim();
		          const principalId = isPlatformSystemAccessPrincipalId(projectOverviewPermissionTeamId)
		            ? normalizePlatformAccessPrincipalId(projectOverviewPermissionTeamId)
		            : PLATFORM_ALL_AGENTS_PRINCIPAL_ID;
		          const currentPermissionSet = getPlatformSystemPrincipalPermissionSet(
		            normalizedProject.metadata,
		            principalId,
		            "project",
		            normalizedProject.permissionSet || normalizedProject.metadata?.permissionSet
		          );
	          const nextPermissionSet = normalizePlaygroundPermissionSet(
	            typeof updater === "function" ? updater(currentPermissionSet) : updater,
	            "project"
		          );
		          if (normalizedProjectId) {
		            applyProjectPermissionSetLocally(normalizedProjectId, nextPermissionSet, principalId);
		          }
		          void persistProjectPermissionSet(nextPermissionSet, principalId).catch((error) => {
	            console.warn("Failed to save project permissions", error);
	            setProjectSaveState({
	              isSaving: false,
	              error: error?.message || "Failed to save project permissions.",
	            });
	          });
	        }

	        function updateProjectPermissionRingAccess(ringId, nextAccess) {
	          const ringDefinition = getPlaygroundPermissionRingDefinition(ringId);
	          updateProjectPermissionSet((currentPermissionSet) => {
	            const currentRings = currentPermissionSet.rings && typeof currentPermissionSet.rings === "object"
	              ? currentPermissionSet.rings
	              : {};
	            const currentRingPolicy = currentRings[ringDefinition.id] || {
	              defaultAccess: ringDefinition.defaultAccess,
	            };
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project",
	              rings: {
	                ...currentRings,
	                [ringDefinition.id]: {
	                  ...currentRingPolicy,
	                  defaultAccess: normalizePlaygroundPermissionAccess(nextAccess, ringDefinition.defaultAccess),
	                },
	              },
	            };
	          });
	        }

	        function updateProjectPermissionActionRing(actionId, nextRingId) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectPermissionSet((currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
	                  currentPermissionSet,
	                  actionDefinition,
	                  currentActionPolicy,
	                  explicitAccess,
	                  normalizePlaygroundPermissionRingId(nextRingId, actionDefinition.ringId)
	                ),
	              },
	            };
	          });
	        }

	        function updateProjectPermissionActionAccess(actionId, nextAccess) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectPermissionSet((currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const nextPolicy = buildPlaygroundPermissionActionPolicy(
	              currentPermissionSet,
	              actionDefinition,
	              currentActionPolicy,
	              nextAccess
	            );
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: nextPolicy,
	              },
	            };
	          });
	        }

	        function getProjectTeamPermissionSets(project) {
	          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	            ? project.metadata
	            : {};
	          const source = metadata.teamPermissionSets && typeof metadata.teamPermissionSets === "object" && !Array.isArray(metadata.teamPermissionSets)
	            ? metadata.teamPermissionSets
	            : {};
	          return Object.entries(source).reduce((result, [teamId, permissionSet]) => {
	            const normalizedTeamId = String(teamId || "").trim();
	            if (normalizedTeamId) {
	              result[normalizedTeamId] = normalizePlaygroundPermissionSet(permissionSet, "team");
	            }
	            return result;
	          }, {});
	        }

	        function getProjectTeamPermissionSet(project, teamId, fallbackPermissionSet = null) {
	          const normalizedTeamId = String(teamId || "").trim();
	          const projectTeamPermissionSets = getProjectTeamPermissionSets(project);
	          return normalizePlaygroundPermissionSet(
	            normalizedTeamId && projectTeamPermissionSets[normalizedTeamId]
	              ? projectTeamPermissionSets[normalizedTeamId]
	              : fallbackPermissionSet,
	            "team"
	          );
	        }

	        function getProjectTeamRolePermissionSetsMap(project) {
	          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	            ? project.metadata
	            : {};
	          const source = metadata.teamRolePermissionSets && typeof metadata.teamRolePermissionSets === "object" && !Array.isArray(metadata.teamRolePermissionSets)
	            ? metadata.teamRolePermissionSets
	            : {};
	          return Object.entries(source).reduce((result, [teamId, rolePermissionSets]) => {
	            const normalizedTeamId = String(teamId || "").trim();
	            if (!normalizedTeamId || !rolePermissionSets || typeof rolePermissionSets !== "object" || Array.isArray(rolePermissionSets)) {
	              return result;
	            }
	            result[normalizedTeamId] = PLAYGROUND_TEAM_ROLE_DEFINITIONS.reduce((sets, role) => {
	              if (role.id === "owner") {
	                sets[role.id] = createPlaygroundProjectTeamRolePermissionSet(role.id);
	                return sets;
	              }
	              if (rolePermissionSets[role.id]) {
	                sets[role.id] = normalizePlaygroundRolePermissionSet(
	                  rolePermissionSets[role.id],
	                  "project_team_role",
	                  role.id
	                );
	              }
	              return sets;
	            }, {});
	            return result;
	          }, {});
	        }

	        function getProjectTeamLegacyPermissionSet(project, teamId) {
	          const normalizedTeamId = String(teamId || "").trim();
	          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	            ? project.metadata
	            : {};
	          const source = metadata.teamPermissionSets && typeof metadata.teamPermissionSets === "object" && !Array.isArray(metadata.teamPermissionSets)
	            ? metadata.teamPermissionSets
	            : {};
	          return normalizedTeamId && source[normalizedTeamId]
	            ? normalizePlaygroundPermissionSet(source[normalizedTeamId], "project_team_role")
	            : null;
	        }

	        function getProjectTeamRolePermissionSets(project, teamId) {
	          const normalizedTeamId = String(teamId || "").trim();
	          const allRolePermissionSets = getProjectTeamRolePermissionSetsMap(project);
	          const currentRolePermissionSets = normalizedTeamId && allRolePermissionSets[normalizedTeamId]
	            ? allRolePermissionSets[normalizedTeamId]
	            : {};
	          const legacyPermissionSet = getProjectTeamLegacyPermissionSet(project, normalizedTeamId);
	          return PLAYGROUND_TEAM_ROLE_DEFINITIONS.reduce((rolePermissionSets, role) => {
	            if (role.id === "owner") {
	              rolePermissionSets[role.id] = createPlaygroundProjectTeamRolePermissionSet(role.id);
	              return rolePermissionSets;
	            }
	            rolePermissionSets[role.id] = normalizePlaygroundRolePermissionSet(
	              currentRolePermissionSets[role.id]
	                || legacyPermissionSet,
	              "project_team_role",
	              role.id
	            );
	            return rolePermissionSets;
	          }, {});
	        }

	        function getProjectTeamRolePermissionSet(project, teamId, roleId) {
	          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
	          const rolePermissionSets = getProjectTeamRolePermissionSets(project, teamId);
	          return normalizePlaygroundRolePermissionSet(
	            rolePermissionSets[normalizedRoleId],
	            "project_team_role",
	            normalizedRoleId
	          );
	        }

	        function normalizeProjectAccessRoleId(principalId, roleId, fallback = "member") {
	          const normalizedPrincipalId = normalizePlatformAccessPrincipalId(principalId);
	          if (!isPlatformRoleScopedSystemAccessPrincipalId(normalizedPrincipalId)) {
	            return normalizePlaygroundTeamRoleId(roleId, fallback);
	          }
	          const normalizedRoleId = String(roleId || "").trim().toLowerCase();
	          return ["owner", "admin", "developer", "member", "billing", "viewer"].includes(normalizedRoleId)
	            ? normalizedRoleId
	            : fallback;
	        }

	        function getProjectSystemRolePermissionSet(project, principalId, roleId) {
	          return getPlatformSystemPrincipalRolePermissionSet(
	            project?.metadata,
	            principalId,
	            roleId,
	            "project_team_role"
	          );
	        }

	        function getProjectRemovedTeamIds(project) {
	          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	            ? project.metadata
	            : {};
	          const source = Array.isArray(metadata.teamAccessRemovedIds)
	            ? metadata.teamAccessRemovedIds
	            : Array.isArray(metadata.removedTeamIds)
	              ? metadata.removedTeamIds
	              : [];
	          return source
	            .map((teamId) => String(teamId || "").trim())
	            .filter(Boolean);
	        }

	        function getProjectTeamAccessIds(project) {
	          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	            ? project.metadata
	            : {};
	          const source = Array.isArray(metadata.teamAccessIds)
	            ? metadata.teamAccessIds
	            : Array.isArray(metadata.sharedTeamIds)
	              ? metadata.sharedTeamIds
	              : [];
	          return source
	            .map((teamId) => String(teamId || "").trim())
	            .filter(Boolean);
	        }

	        function applyProjectTeamPermissionSetLocally(projectId, teamId, permissionSet) {
	          const normalizedProjectId = String(projectId || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          if (!normalizedProjectId || !normalizedTeamId) {
	            return;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "team");
	          const mergeTeamPermissionSet = (project) => {
	            const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	              ? project.metadata
	              : {};
	            const currentTeamPermissionSets = getProjectTeamPermissionSets(project);
	            return normalizePlaygroundProjectRecord({
	              ...(project && typeof project === "object" ? project : {}),
	              metadata: {
	                ...metadata,
	                teamPermissionSets: {
	                  ...currentTeamPermissionSets,
	                  [normalizedTeamId]: normalizedPermissionSet,
	                },
	              },
	            });
	          };

	          setProjects((current) => current.map((project) =>
	            project.id === normalizedProjectId ? mergeTeamPermissionSet(project) : project
	          ));
	          setProjectDraft((current) =>
	            current?.id === normalizedProjectId ? mergeTeamPermissionSet(current) : current
	          );
	          setSelectedProjectDetail((current) => {
	            if (current?.project?.id !== normalizedProjectId) {
	              return current;
	            }
	            return {
	              ...current,
	              project: mergeTeamPermissionSet(current.project),
	            };
	          });
	        }

	        function applyProjectTeamWorkspaceMembershipLocally(projectId, teamId, action) {
	          const normalizedProjectId = String(projectId || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedAction = action === "add" ? "add" : "remove";
	          if (!normalizedProjectId || !normalizedTeamId || isPlatformSystemAccessPrincipalId(normalizedTeamId)) {
	            return;
	          }
	          const mergeTeamMembership = (project) => {
	            const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	              ? project.metadata
	              : {};
	            const currentTeamPermissionSets = getProjectTeamPermissionSets(project);
	            const nextTeamPermissionSets = { ...currentTeamPermissionSets };
	            const currentTeamRolePermissionSets = getProjectTeamRolePermissionSetsMap(project);
	            const nextTeamRolePermissionSets = { ...currentTeamRolePermissionSets };
	            const removedTeamIds = new Set(getProjectRemovedTeamIds(project));
	            const teamAccessIds = new Set(getProjectTeamAccessIds(project));
	            if (normalizedAction === "remove") {
	              delete nextTeamPermissionSets[normalizedTeamId];
	              delete nextTeamRolePermissionSets[normalizedTeamId];
	              teamAccessIds.delete(normalizedTeamId);
	              removedTeamIds.add(normalizedTeamId);
	            } else {
	              teamAccessIds.add(normalizedTeamId);
	              removedTeamIds.delete(normalizedTeamId);
	            }
	            return normalizePlaygroundProjectRecord({
	              ...(project && typeof project === "object" ? project : {}),
	              metadata: {
	                ...metadata,
	                teamAccessIds: Array.from(teamAccessIds),
	                teamPermissionSets: nextTeamPermissionSets,
	                teamRolePermissionSets: nextTeamRolePermissionSets,
	                teamAccessRemovedIds: Array.from(removedTeamIds),
	              },
	            });
	          };

	          setProjects((current) => current.map((project) =>
	            project.id === normalizedProjectId ? mergeTeamMembership(project) : project
	          ));
	          setProjectDraft((current) =>
	            current?.id === normalizedProjectId ? mergeTeamMembership(current) : current
	          );
	          setSelectedProjectDetail((current) => {
	            if (current?.project?.id !== normalizedProjectId) {
	              return current;
	            }
	            return {
	              ...current,
	              project: mergeTeamMembership(current.project),
	            };
	          });
	        }

	        async function persistProjectTeamWorkspaceMembership(teamId, action) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedAction = action === "add" ? "add" : "remove";
	          if (!normalizedProjectId || !normalizedTeamId || isPlatformSystemAccessPrincipalId(normalizedTeamId)) {
	            return null;
	          }
	          const currentTeamPermissionSets = getProjectTeamPermissionSets(normalizedProject);
	          const nextTeamPermissionSets = { ...currentTeamPermissionSets };
	          const currentTeamRolePermissionSets = getProjectTeamRolePermissionSetsMap(normalizedProject);
	          const nextTeamRolePermissionSets = { ...currentTeamRolePermissionSets };
	          const removedTeamIds = new Set(getProjectRemovedTeamIds(normalizedProject));
	          const teamAccessIds = new Set(getProjectTeamAccessIds(normalizedProject));
	          if (normalizedAction === "remove") {
	            delete nextTeamPermissionSets[normalizedTeamId];
	            delete nextTeamRolePermissionSets[normalizedTeamId];
	            teamAccessIds.delete(normalizedTeamId);
	            removedTeamIds.add(normalizedTeamId);
	          } else {
	            teamAccessIds.add(normalizedTeamId);
	            removedTeamIds.delete(normalizedTeamId);
	          }
	          const nextTeamAccessIds = Array.from(teamAccessIds);
	          const nextRemovedTeamIds = Array.from(removedTeamIds);
	          const nextProjectRecord = normalizePlaygroundProjectRecord({
	            ...normalizedProject,
	            metadata: {
	              ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
	              teamAccessIds: nextTeamAccessIds,
	              teamPermissionSets: nextTeamPermissionSets,
	              teamRolePermissionSets: nextTeamRolePermissionSets,
	              teamAccessRemovedIds: nextRemovedTeamIds,
	            },
	          });
	          const savePayload = buildPlaygroundProjectSavePayload(nextProjectRecord, {
	            teamAccessIds: nextTeamAccessIds,
	            teamPermissionSets: nextTeamPermissionSets,
	            teamRolePermissionSets: nextTeamRolePermissionSets,
	            teamAccessRemovedIds: nextRemovedTeamIds,
	          });

	          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
	            method: "PATCH",
	            headers: {
	              ...requestHeaders,
	              "Content-Type": "application/json",
	            },
	            body: JSON.stringify(savePayload),
	          });
	          const data = await response.json().catch(() => ({}));
	          if (!response.ok) {
	            throw new Error(data?.message || data?.error || "Failed to update project team access.");
	          }
	          const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
	          if (updatedProject?.id) {
	            commitLocalProjectRecord(updatedProject, {
	              summary: updatedProject.summary || selectedProjectSummary,
	              environments: selectedProjectEnvironments,
	              recentThreads: selectedProjectRecentThreads,
	              threads: selectedProjectRecentThreads,
	              selectImmediately: true,
	            });
	          }
	          return updatedProject;
	        }

	        function updateProjectTeamWorkspaceMembership(teamId, action) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedAction = action === "add" ? "add" : "remove";
	          if (!hasRealAccess || !normalizedProjectId || !normalizedTeamId || isPlatformSystemAccessPrincipalId(normalizedTeamId)) {
	            return;
	          }
	          const previousTeamPermissionSets = getProjectTeamPermissionSets(normalizedProject);
	          const previousTeamRolePermissionSets = getProjectTeamRolePermissionSetsMap(normalizedProject);
	          const previousTeamAccessIds = getProjectTeamAccessIds(normalizedProject);
	          const previousRemovedTeamIds = getProjectRemovedTeamIds(normalizedProject);
	          applyProjectTeamWorkspaceMembershipLocally(normalizedProjectId, normalizedTeamId, normalizedAction);
	          void persistProjectTeamWorkspaceMembership(normalizedTeamId, normalizedAction).catch((error) => {
	            console.warn("Failed to update project team access", error);
	            const restoreProjectTeamMembership = (project) => normalizePlaygroundProjectRecord({
	              ...(project && typeof project === "object" ? project : {}),
	              metadata: {
	                ...(project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata) ? project.metadata : {}),
	                teamAccessIds: previousTeamAccessIds,
	                teamPermissionSets: previousTeamPermissionSets,
	                teamRolePermissionSets: previousTeamRolePermissionSets,
	                teamAccessRemovedIds: previousRemovedTeamIds,
	              },
	            });
	            setProjects((current) => current.map((project) =>
	              project.id === normalizedProjectId ? restoreProjectTeamMembership(project) : project
	            ));
	            setProjectDraft((current) =>
	              current?.id === normalizedProjectId ? restoreProjectTeamMembership(current) : current
	            );
	            setSelectedProjectDetail((current) => {
	              if (current?.project?.id !== normalizedProjectId) {
	                return current;
	              }
	              return {
	                ...current,
	                project: restoreProjectTeamMembership(current.project),
	              };
	            });
	            setProjectSaveState({
	              isSaving: false,
	              error: error?.message || "Failed to update project team access.",
	            });
	          });
	        }

	        async function persistProjectTeamPermissionSet(teamId, nextPermissionSet) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          if (!normalizedProjectId || !normalizedTeamId) {
	            return null;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(nextPermissionSet, "team");
	          const currentTeamPermissionSets = getProjectTeamPermissionSets(normalizedProject);
	          const nextTeamPermissionSets = {
	            ...currentTeamPermissionSets,
	            [normalizedTeamId]: normalizedPermissionSet,
	          };
	          const nextProjectRecord = normalizePlaygroundProjectRecord({
	            ...normalizedProject,
	            metadata: {
	              ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
	              teamPermissionSets: nextTeamPermissionSets,
	            },
	          });
	          const savePayload = buildPlaygroundProjectSavePayload(nextProjectRecord, {
	            teamPermissionSets: nextTeamPermissionSets,
	          });

	          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
	            method: "PATCH",
	            headers: {
	              ...requestHeaders,
	              "Content-Type": "application/json",
	            },
	            body: JSON.stringify(savePayload),
	          });
	          const data = await response.json().catch(() => ({}));
	          if (!response.ok) {
	            throw new Error(data?.message || data?.error || "Failed to update project team permissions.");
	          }
	          const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
	          if (updatedProject?.id) {
	            commitLocalProjectRecord(updatedProject, {
	              summary: updatedProject.summary || selectedProjectSummary,
	              environments: selectedProjectEnvironments,
	              recentThreads: selectedProjectRecentThreads,
	              threads: selectedProjectRecentThreads,
	              selectImmediately: true,
	            });
	          }
	          return updatedProject;
	        }

	        function updateProjectTeamPermissionSet(teamId, updater) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          if (!normalizedProjectId || !normalizedTeamId) {
	            return;
	          }
	          const selectedTeam = Array.isArray(workspaceTeams)
	            ? workspaceTeams.find((team) => String(team?.id || "") === normalizedTeamId) || null
	            : null;
	          const currentPermissionSet = getProjectTeamPermissionSet(normalizedProject, normalizedTeamId, selectedTeam?.permissionSet);
	          const nextPermissionSet = normalizePlaygroundPermissionSet(
	            typeof updater === "function" ? updater(currentPermissionSet) : updater,
	            "team"
	          );
	          applyProjectTeamPermissionSetLocally(normalizedProjectId, normalizedTeamId, nextPermissionSet);
	          void persistProjectTeamPermissionSet(normalizedTeamId, nextPermissionSet).catch((error) => {
	            console.warn("Failed to save project team permissions", error);
	            applyProjectTeamPermissionSetLocally(normalizedProjectId, normalizedTeamId, currentPermissionSet);
	            setProjectSaveState({
	              isSaving: false,
	              error: error?.message || "Failed to save project team permissions.",
	            });
	          });
	        }

	        function updateProjectTeamPermissionRingAccess(teamId, ringId, nextAccess) {
	          const ringDefinition = getPlaygroundPermissionRingDefinition(ringId);
	          updateProjectTeamPermissionSet(teamId, (currentPermissionSet) => {
	            const currentRings = currentPermissionSet.rings && typeof currentPermissionSet.rings === "object"
	              ? currentPermissionSet.rings
	              : {};
	            const currentRingPolicy = currentRings[ringDefinition.id] || {
	              defaultAccess: ringDefinition.defaultAccess,
	            };
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "team",
	              rings: {
	                ...currentRings,
	                [ringDefinition.id]: {
	                  ...currentRingPolicy,
	                  defaultAccess: normalizePlaygroundPermissionAccess(nextAccess, ringDefinition.defaultAccess),
	                },
	              },
	            };
	          });
	        }

	        function updateProjectTeamPermissionActionRing(teamId, actionId, nextRingId) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectTeamPermissionSet(teamId, (currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "team",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
	                  currentPermissionSet,
	                  actionDefinition,
	                  currentActionPolicy,
	                  explicitAccess,
	                  normalizePlaygroundPermissionRingId(nextRingId, actionDefinition.ringId)
	                ),
	              },
	            };
	          });
	        }

	        function updateProjectTeamPermissionActionAccess(teamId, actionId, nextAccess) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectTeamPermissionSet(teamId, (currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const nextPolicy = buildPlaygroundPermissionActionPolicy(
	              currentPermissionSet,
	              actionDefinition,
	              currentActionPolicy,
	              nextAccess
	            );
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "team",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: nextPolicy,
	              },
	            };
	          });
	        }

	        function applyProjectSystemRolePermissionSetLocally(projectId, principalId, roleId, permissionSet) {
	          const normalizedProjectId = String(projectId || "").trim();
	          const normalizedPrincipalId = normalizePlatformAccessPrincipalId(principalId);
	          const normalizedRoleId = normalizeProjectAccessRoleId(normalizedPrincipalId, roleId, "member");
	          if (
	            !normalizedProjectId
	            || !isPlatformRoleScopedSystemAccessPrincipalId(normalizedPrincipalId)
	            || normalizedRoleId === "owner"
	          ) {
	            return;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(
	            permissionSet,
	            "project_team_role"
	          );
	          const mergeSystemRolePermissionSet = (project) => {
	            const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	              ? project.metadata
	              : {};
	            return normalizePlaygroundProjectRecord({
	              ...(project && typeof project === "object" ? project : {}),
	              metadata: buildPlatformSystemPrincipalRolePermissionMetadata(
	                metadata,
	                normalizedPrincipalId,
	                normalizedRoleId,
	                normalizedPermissionSet,
	                "project_team_role"
	              ),
	            });
	          };

	          setProjects((current) => current.map((project) =>
	            project.id === normalizedProjectId ? mergeSystemRolePermissionSet(project) : project
	          ));
	          setProjectDraft((current) =>
	            current?.id === normalizedProjectId ? mergeSystemRolePermissionSet(current) : current
	          );
	          setSelectedProjectDetail((current) => {
	            if (current?.project?.id !== normalizedProjectId) {
	              return current;
	            }
	            return {
	              ...current,
	              project: mergeSystemRolePermissionSet(current.project),
	            };
	          });
	        }

	        async function persistProjectSystemRolePermissionSet(principalId, roleId, nextPermissionSet) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedPrincipalId = normalizePlatformAccessPrincipalId(principalId);
	          const normalizedRoleId = normalizeProjectAccessRoleId(normalizedPrincipalId, roleId, "member");
	          if (
	            !normalizedProjectId
	            || !isPlatformRoleScopedSystemAccessPrincipalId(normalizedPrincipalId)
	            || normalizedRoleId === "owner"
	          ) {
	            return null;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(
	            nextPermissionSet,
	            "project_team_role"
	          );
	          const nextMetadata = buildPlatformSystemPrincipalRolePermissionMetadata(
	            normalizedProject.metadata,
	            normalizedPrincipalId,
	            normalizedRoleId,
	            normalizedPermissionSet,
	            "project_team_role"
	          );
	          const nextProjectRecord = normalizePlaygroundProjectRecord({
	            ...normalizedProject,
	            metadata: nextMetadata,
	          });
	          const savePayload = buildPlaygroundProjectSavePayload(
	            nextProjectRecord,
	            nextMetadata
	          );

	          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
	            method: "PATCH",
	            headers: {
	              ...requestHeaders,
	              "Content-Type": "application/json",
	            },
	            body: JSON.stringify(savePayload),
	          });
	          const data = await response.json().catch(() => ({}));
	          if (!response.ok) {
	            throw new Error(data?.message || data?.error || "Failed to update organization member role permissions.");
	          }
	          const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
	          if (updatedProject?.id) {
	            commitLocalProjectRecord(updatedProject, {
	              summary: updatedProject.summary || selectedProjectSummary,
	              environments: selectedProjectEnvironments,
	              recentThreads: selectedProjectRecentThreads,
	              threads: selectedProjectRecentThreads,
	              selectImmediately: true,
	            });
	          }
	          return updatedProject;
	        }

	        function updateProjectSystemRolePermissionSet(roleId, updater) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedPrincipalId = normalizePlatformAccessPrincipalId(
	            projectOverviewPermissionTeamId
	          );
	          const normalizedRoleId = normalizeProjectAccessRoleId(normalizedPrincipalId, roleId, "member");
	          if (
	            !normalizedProjectId
	            || !isPlatformRoleScopedSystemAccessPrincipalId(normalizedPrincipalId)
	            || normalizedRoleId === "owner"
	          ) {
	            return;
	          }
	          const currentPermissionSet = getProjectSystemRolePermissionSet(
	            normalizedProject,
	            normalizedPrincipalId,
	            normalizedRoleId
	          );
	          const nextPermissionSet = normalizePlaygroundPermissionSet(
	            typeof updater === "function" ? updater(currentPermissionSet) : updater,
	            "project_team_role"
	          );
	          applyProjectSystemRolePermissionSetLocally(
	            normalizedProjectId,
	            normalizedPrincipalId,
	            normalizedRoleId,
	            nextPermissionSet
	          );
	          void persistProjectSystemRolePermissionSet(
	            normalizedPrincipalId,
	            normalizedRoleId,
	            nextPermissionSet
	          ).catch((error) => {
	            console.warn("Failed to save organization member role permissions", error);
	            applyProjectSystemRolePermissionSetLocally(
	              normalizedProjectId,
	              normalizedPrincipalId,
	              normalizedRoleId,
	              currentPermissionSet
	            );
	            setProjectSaveState({
	              isSaving: false,
	              error: error?.message || "Failed to save organization member role permissions.",
	            });
	          });
	        }

	        function applyProjectTeamRolePermissionSetLocally(projectId, teamId, roleId, permissionSet) {
	          const normalizedProjectId = String(projectId || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
	          if (!normalizedProjectId || !normalizedTeamId || normalizedRoleId === "owner") {
	            return;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "project_team_role");
	          const mergeTeamRolePermissionSet = (project) => {
	            const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	              ? project.metadata
	              : {};
	            const currentTeamRolePermissionSets = getProjectTeamRolePermissionSetsMap(project);
	            const currentRolePermissionSets = getProjectTeamRolePermissionSets(project, normalizedTeamId);
	            return normalizePlaygroundProjectRecord({
	              ...(project && typeof project === "object" ? project : {}),
	              metadata: {
	                ...metadata,
	                teamRolePermissionSets: {
	                  ...currentTeamRolePermissionSets,
	                  [normalizedTeamId]: {
	                    ...currentRolePermissionSets,
	                    [normalizedRoleId]: normalizedPermissionSet,
	                  },
	                },
	              },
	            });
	          };

	          setProjects((current) => current.map((project) =>
	            project.id === normalizedProjectId ? mergeTeamRolePermissionSet(project) : project
	          ));
	          setProjectDraft((current) =>
	            current?.id === normalizedProjectId ? mergeTeamRolePermissionSet(current) : current
	          );
	          setSelectedProjectDetail((current) => {
	            if (current?.project?.id !== normalizedProjectId) {
	              return current;
	            }
	            return {
	              ...current,
	              project: mergeTeamRolePermissionSet(current.project),
	            };
	          });
	        }

	        async function persistProjectTeamRolePermissionSet(teamId, roleId, nextPermissionSet) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
	          if (!normalizedProjectId || !normalizedTeamId || normalizedRoleId === "owner") {
	            return null;
	          }
	          const normalizedPermissionSet = normalizePlaygroundPermissionSet(nextPermissionSet, "project_team_role");
	          const currentTeamRolePermissionSets = getProjectTeamRolePermissionSetsMap(normalizedProject);
	          const currentRolePermissionSets = getProjectTeamRolePermissionSets(normalizedProject, normalizedTeamId);
	          const nextTeamRolePermissionSets = {
	            ...currentTeamRolePermissionSets,
	            [normalizedTeamId]: {
	              ...currentRolePermissionSets,
	              [normalizedRoleId]: normalizedPermissionSet,
	            },
	          };
	          const nextProjectRecord = normalizePlaygroundProjectRecord({
	            ...normalizedProject,
	            metadata: {
	              ...(normalizedProject.metadata && typeof normalizedProject.metadata === "object" ? normalizedProject.metadata : {}),
	              teamRolePermissionSets: nextTeamRolePermissionSets,
	            },
	          });
	          const savePayload = buildPlaygroundProjectSavePayload(nextProjectRecord, {
	            teamRolePermissionSets: nextTeamRolePermissionSets,
	          });

	          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
	            method: "PATCH",
	            headers: {
	              ...requestHeaders,
	              "Content-Type": "application/json",
	            },
	            body: JSON.stringify(savePayload),
	          });
	          const data = await response.json().catch(() => ({}));
	          if (!response.ok) {
	            throw new Error(data?.message || data?.error || "Failed to update project team role permissions.");
	          }
	          const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
	          if (updatedProject?.id) {
	            commitLocalProjectRecord(updatedProject, {
	              summary: updatedProject.summary || selectedProjectSummary,
	              environments: selectedProjectEnvironments,
	              recentThreads: selectedProjectRecentThreads,
	              threads: selectedProjectRecentThreads,
	              selectImmediately: true,
	            });
	          }
	          return updatedProject;
	        }

	        function updateProjectTeamRolePermissionSet(teamId, roleId, updater) {
	          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
	          const normalizedProjectId = String(normalizedProject.id || "").trim();
	          const normalizedTeamId = String(teamId || "").trim();
	          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
	          if (!normalizedProjectId || !normalizedTeamId || normalizedRoleId === "owner") {
	            return;
	          }
	          const currentPermissionSet = getProjectTeamRolePermissionSet(normalizedProject, normalizedTeamId, normalizedRoleId);
	          const nextPermissionSet = normalizePlaygroundPermissionSet(
	            typeof updater === "function" ? updater(currentPermissionSet) : updater,
	            "project_team_role"
	          );
	          applyProjectTeamRolePermissionSetLocally(normalizedProjectId, normalizedTeamId, normalizedRoleId, nextPermissionSet);
	          void persistProjectTeamRolePermissionSet(normalizedTeamId, normalizedRoleId, nextPermissionSet).catch((error) => {
	            console.warn("Failed to save project team role permissions", error);
	            applyProjectTeamRolePermissionSetLocally(normalizedProjectId, normalizedTeamId, normalizedRoleId, currentPermissionSet);
	            setProjectSaveState({
	              isSaving: false,
	              error: error?.message || "Failed to save project team role permissions.",
	            });
	          });
	        }

	        function updateProjectTeamRolePermissionRingAccess(teamId, roleId, ringId, nextAccess) {
	          const ringDefinition = getPlaygroundPermissionRingDefinition(ringId);
	          updateProjectTeamRolePermissionSet(teamId, roleId, (currentPermissionSet) => {
	            const currentRings = currentPermissionSet.rings && typeof currentPermissionSet.rings === "object"
	              ? currentPermissionSet.rings
	              : {};
	            const currentRingPolicy = currentRings[ringDefinition.id] || {
	              defaultAccess: ringDefinition.defaultAccess,
	            };
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project_team_role",
	              rings: {
	                ...currentRings,
	                [ringDefinition.id]: {
	                  ...currentRingPolicy,
	                  defaultAccess: normalizePlaygroundPermissionAccess(nextAccess, ringDefinition.defaultAccess),
	                },
	              },
	            };
	          });
	        }

	        function updateProjectTeamRolePermissionActionRing(teamId, roleId, actionId, nextRingId) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectTeamRolePermissionSet(teamId, roleId, (currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project_team_role",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
	                  currentPermissionSet,
	                  actionDefinition,
	                  currentActionPolicy,
	                  explicitAccess,
	                  normalizePlaygroundPermissionRingId(nextRingId, actionDefinition.ringId)
	                ),
	              },
	            };
	          });
	        }

	        function updateProjectTeamRolePermissionActionAccess(teamId, roleId, actionId, nextAccess) {
	          const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
	          if (!actionDefinition) {
	            return;
	          }
	          updateProjectTeamRolePermissionSet(teamId, roleId, (currentPermissionSet) => {
	            const currentActions = currentPermissionSet.actions && typeof currentPermissionSet.actions === "object"
	              ? currentPermissionSet.actions
	              : {};
	            const currentActionPolicy = currentActions[actionDefinition.id] || {
	              ringId: actionDefinition.ringId,
	            };
	            const nextPolicy = buildPlaygroundPermissionActionPolicy(
	              currentPermissionSet,
	              actionDefinition,
	              currentActionPolicy,
	              nextAccess
	            );
	            return {
	              ...currentPermissionSet,
	              version: 1,
	              subjectType: "project_team_role",
	              actions: {
	                ...currentActions,
	                [actionDefinition.id]: nextPolicy,
	              },
	            };
	          });
	        }

        function buildMissionControlRecordForSave(overrides = {}) {
          const baseMissionControl = normalizePlaygroundProjectMissionControlRecord(
            selectedProjectMissionControlRef.current || selectedProjectMissionControl
          );
          return normalizePlaygroundProjectMissionControlRecord({
            ...baseMissionControl,
            ...(overrides && typeof overrides === "object" ? overrides : {}),
            // Strategy and documentation are Knowledge resources. Never emit
            // the retired project-local fields on an active save path.
            document: "",
            strategyBrief: buildEmptyPlaygroundProjectStrategyBrief(),
          });
        }

        async function persistProjectMissionControlRecord(projectId, missionControlRecord, options = {}) {
          const normalizedProjectId = String(projectId || "").trim();
          if (!normalizedProjectId) {
            return null;
          }

          let baseProject = normalizePlaygroundProjectRecord(
            (selectedProject?.id === normalizedProjectId ? selectedProject : null)
            || projectsById[normalizedProjectId]
            || {
              id: normalizedProjectId,
              name: "Project",
            }
          );
          const shouldRefreshBaseProjectBeforePatch = options.refreshBaseProject !== false;
          if (shouldRefreshBaseProjectBeforePatch) {
            try {
              const projectResponse = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
                method: "GET",
                headers: requestHeaders,
              });
              const projectData = await projectResponse.json().catch(() => ({}));
              if (projectResponse.ok) {
                const refreshedProject = getPlaygroundProjectResponseRecord(projectData, baseProject);
                if (refreshedProject?.id === normalizedProjectId) {
                  baseProject = refreshedProject;
                }
              }
            } catch {}
          }
          const refreshedBaseMissionControl = getPlaygroundProjectMissionControlRecord(baseProject);
          const normalizedMissionControlRecord = normalizePlaygroundProjectMissionControlRecord({
            ...refreshedBaseMissionControl,
            ...(missionControlRecord && typeof missionControlRecord === "object" ? missionControlRecord : {}),
          });
          if (
            refreshedBaseMissionControl.deliveryContract
            && (!missionControlRecord?.deliveryContract || typeof missionControlRecord.deliveryContract !== "object")
          ) {
            normalizedMissionControlRecord.deliveryContract = clonePlaygroundProjectBlueprintValue(
              refreshedBaseMissionControl.deliveryContract
            );
          }
          if (
            refreshedBaseMissionControl.deliveryPlan
            && (!missionControlRecord?.deliveryPlan || typeof missionControlRecord.deliveryPlan !== "object")
          ) {
            normalizedMissionControlRecord.deliveryPlan = clonePlaygroundProjectBlueprintValue(
              refreshedBaseMissionControl.deliveryPlan
            );
          }
          if (
            refreshedBaseMissionControl.deliveryExecution
            && (!missionControlRecord?.deliveryExecution || typeof missionControlRecord.deliveryExecution !== "object")
          ) {
            normalizedMissionControlRecord.deliveryExecution = clonePlaygroundProjectBlueprintValue(
              refreshedBaseMissionControl.deliveryExecution
            );
          }
          if (
            missionControlRecord
            && typeof missionControlRecord === "object"
            && !Array.isArray(missionControlRecord)
            && missionControlRecord.strategyBriefReplace === true
          ) {
            normalizedMissionControlRecord.strategyBriefReplace = true;
          }
          const nextProjectRecord = normalizePlaygroundProjectRecord({
            ...baseProject,
            ...(options.projectOverrides && typeof options.projectOverrides === "object" ? options.projectOverrides : {}),
            missionControl: normalizedMissionControlRecord,
          });
          const savePayload = buildPlaygroundProjectSavePayload(nextProjectRecord, {
            missionControl: normalizedMissionControlRecord,
            ...(options.metadataOverrides && typeof options.metadataOverrides === "object" ? options.metadataOverrides : {}),
          });
          if (!options.quiet) {
            setMissionControlSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
          }
          const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
            method: "PATCH",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(savePayload),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            if (!options.quiet) {
              setMissionControlSaveState({
                isSaving: false,
                error: data?.message || data?.error || options.errorMessage || "Failed to update Mission Control.",
                message: "",
              });
            }
            throw new Error(data?.message || data?.error || "Failed to update Mission Control.");
          }

          const updatedProject = getPlaygroundProjectResponseRecord(data, {
            ...nextProjectRecord,
            missionControl: normalizedMissionControlRecord,
            metadata: savePayload.metadata,
          });
          if (updatedProject?.id) {
            commitLocalProjectRecord(updatedProject, {
              summary: updatedProject.summary || selectedProjectSummary,
              environments: selectedProjectEnvironments,
              recentThreads: selectedProjectRecentThreads,
              threads: selectedProjectRecentThreads,
              selectImmediately: true,
            });
            setProjectDraft((current) => current?.id === updatedProject.id
              ? normalizePlaygroundProjectRecord({
                  ...current,
                  ...updatedProject,
                })
              : current
            );
          }
          if (!options.quiet) {
            setMissionControlSaveState({
              isSaving: false,
              error: "",
              message: options.successMessage || "",
            });
          }
          return updatedProject;
        }

        async function flushQueuedMissionControlAutosave() {
          if (missionControlAutosaveInFlightRef.current) {
            return;
          }

          missionControlAutosaveInFlightRef.current = true;
          try {
            while (missionControlAutosaveQueuedRef.current) {
              const nextQueuedSave = missionControlAutosaveQueuedRef.current;
              missionControlAutosaveQueuedRef.current = null;
              try {
                await persistProjectMissionControlRecord(nextQueuedSave.projectId, nextQueuedSave.record, {
                  quiet: true,
                });
              } catch (error) {
                console.warn("Failed to save Mission Control document", error);
                break;
              }
            }
          } finally {
            missionControlAutosaveInFlightRef.current = false;
          }
        }

        function queueMissionControlAutosave(nextDocument) {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedProjectId) {
            return;
          }

          missionControlAutosaveQueuedRef.current = {
            projectId: normalizedProjectId,
            record: buildMissionControlRecordForSave({
              document: String(nextDocument || ""),
              updatedAt: new Date().toISOString(),
            }),
          };
          void flushQueuedMissionControlAutosave();
        }

        function commitMissionControlDocumentIfDirty() {
          const nextDocument = String(missionControlDocumentDraft || "");
          if (!String(selectedProjectId || "").trim()) {
            return;
          }
          if (nextDocument === String(selectedProjectMissionControl.document || "")) {
            return;
          }
          queueMissionControlAutosave(nextDocument);
        }

        async function commitMissionControlInstructionsIfDirty() {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedProjectId) {
            return;
          }
          const nextInstructions = String(missionControlInstructionsDraft || "");
          const currentInstructions = String(selectedProjectMissionInstructions || "");
          if (nextInstructions === currentInstructions) {
            return;
          }
          try {
            await persistProjectMissionControlRecord(normalizedProjectId, {
              ...buildMissionControlRecordForSave(),
              instructions: nextInstructions,
              updatedAt: new Date().toISOString(),
            }, {
              successMessage: "",
            });
          } catch {}
        }

        function commitMissionControlDeliveryExecution(execution) {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          const normalizedExecution = execution
            && typeof execution === "object"
            && !Array.isArray(execution)
            ? execution
            : null;
          setMissionControlDeliveryExecutionState({
            projectId: normalizedProjectId,
            status: "ready",
            execution: normalizedExecution,
            error: "",
          });
          return normalizedExecution;
        }

        async function requestMissionControlDeliveryAction(action) {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          const normalizedAction = String(action || "").trim().toLowerCase();
          if (
            !normalizedProjectId
            || !["start", "reconcile", "retry", "cancel"].includes(normalizedAction)
            || missionControlDeliveryActionState.action
          ) {
            return null;
          }
          setMissionControlDeliveryActionState({
            action: normalizedAction,
            error: "",
          });
          try {
            const response = await fetch(
              backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId)
                + "/delivery-plan/execution/" + normalizedAction,
              {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: "{}",
              },
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(
                data?.message
                || data?.error
                || "Failed to update the delivery execution.",
              );
            }
            const execution = commitMissionControlDeliveryExecution(
              data?.deliveryExecution,
            );
            setMissionControlDeliveryActionState({
              action: "",
              error: "",
            });
            return execution;
          } catch (error) {
            setMissionControlDeliveryActionState({
              action: "",
              error: error instanceof Error
                ? error.message
                : "Failed to update the delivery execution.",
            });
            return null;
          }
        }

        async function approveMissionControlDeliveryAssurance() {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          const deliveryExecution = selectedProjectDeliveryExecution
            && typeof selectedProjectDeliveryExecution === "object"
            && !Array.isArray(selectedProjectDeliveryExecution)
            ? selectedProjectDeliveryExecution
            : {};
          const assuranceStage = deliveryExecution?.stages?.assure
            && typeof deliveryExecution.stages.assure === "object"
            ? deliveryExecution.stages.assure
            : {};
          const assuranceRunId = String(
            deliveryExecution?.bindings?.assuranceRunId || "",
          ).trim();
          const evidenceFingerprint = String(
            assuranceStage?.evidence?.evidenceFingerprint || "",
          ).trim();
          if (
            !assuranceRunId
            || !evidenceFingerprint
            || !normalizedProjectId
            || missionControlDeliveryActionState.action
          ) {
            return null;
          }
          setMissionControlDeliveryActionState({
            action: "approve",
            error: "",
          });
          try {
            const approvalResponse = await fetch(
              backendUrl + "/assurance/runs/" + encodeURIComponent(assuranceRunId) + "/approve",
              {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ evidenceFingerprint }),
              },
            );
            const approvalData = await approvalResponse.json().catch(() => ({}));
            if (!approvalResponse.ok) {
              throw new Error(
                approvalData?.message
                || approvalData?.error
                || "Failed to approve the Assurance evidence.",
              );
            }
            const reconcileResponse = await fetch(
              backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId)
                + "/delivery-plan/execution/reconcile",
              {
                method: "POST",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: "{}",
              },
            );
            const reconcileData = await reconcileResponse.json().catch(() => ({}));
            if (!reconcileResponse.ok) {
              throw new Error(
                reconcileData?.message
                || reconcileData?.error
                || "Approval was recorded, but delivery reconciliation failed.",
              );
            }
            const execution = commitMissionControlDeliveryExecution(
              reconcileData?.deliveryExecution,
            );
            setMissionControlDeliveryActionState({
              action: "",
              error: "",
            });
            return execution;
          } catch (error) {
            setMissionControlDeliveryActionState({
              action: "",
              error: error instanceof Error
                ? error.message
                : "Failed to approve the Assurance evidence.",
            });
            return null;
          }
        }

        function serializePlaygroundStrategyListForInput(values) {
          return normalizePlaygroundStrategyTextList(values).join(String.fromCharCode(10));
        }

        function buildMissionControlSetupStrategyBriefFromDraft() {
          const currentStrategyBrief = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraftRef.current || missionControlStrategyDraft);
          const projectGoal = String(
            projectDescriptionTextareaRef.current
              ? projectDescriptionTextareaRef.current.value
              : projectDraft.description || ""
          ).replaceAll(String.fromCharCode(13), "").trim();
          return normalizePlaygroundProjectStrategyBrief({
            ...currentStrategyBrief,
            mission: projectGoal,
          });
        }

        async function saveMissionControlStrategyBrief(nextStrategyBrief, options = {}) {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedProjectId) {
            return null;
          }
          const normalizedStrategyBrief = normalizePlaygroundProjectStrategyBrief(nextStrategyBrief);
          const currentStrategyBrief = normalizePlaygroundProjectStrategyBrief(
            (selectedProjectMissionControlRef.current || selectedProjectMissionControl).strategyBrief
          );
          if (JSON.stringify(normalizedStrategyBrief) === JSON.stringify(currentStrategyBrief)) {
            return null;
          }
          try {
            const updatedProject = await persistProjectMissionControlRecord(normalizedProjectId, {
              ...buildMissionControlRecordForSave(),
              strategyBrief: normalizedStrategyBrief,
              updatedAt: new Date().toISOString(),
            }, {
              successMessage: "",
            });
            if (updatedProject?.id) {
              const savedStrategyBrief = getPlaygroundProjectStrategyBriefRecord(updatedProject);
              if (JSON.stringify(savedStrategyBrief) !== JSON.stringify(normalizedStrategyBrief)) {
                throw new Error("Strategy changes were not confirmed by the project API.");
              }
            }
            return updatedProject;
          } catch (error) {
            if (options?.throwOnError) {
              throw error;
            }
            return null;
          }
        }

        function updateMissionControlStrategyDraft(nextStrategyBrief) {
          setMissionControlStrategyDraft(normalizePlaygroundProjectStrategyBrief(nextStrategyBrief));
        }

        function updateMissionControlStrategyTextField(field, value) {
`;

export const FINE_TUNING_PAGE_CONTROLLER_ACCESS_SCRIPT = String.raw`        function getFineTuningAccessMetadata(job = selectedJob) {
          return job?.metadata && typeof job.metadata === "object" && !Array.isArray(job.metadata)
            ? job.metadata
            : {};
        }

        function updateFineTuningAccessMetadata(jobId, updater) {
          patchFineTuningJob(jobId, (currentJob) => {
            const metadata = getFineTuningAccessMetadata(currentJob);
            const nextMetadata = typeof updater === "function" ? updater(metadata) : updater;
            return {
              ...currentJob,
              metadata: {
                ...metadata,
                ...(nextMetadata && typeof nextMetadata === "object" ? nextMetadata : {}),
              },
            };
          }, { persist: true });
        }

        function getFineTuningOwnerIdentity(job = selectedJob) {
          const metadata = getFineTuningAccessMetadata(job);
          const owner = [
            metadata.owner,
            job?.owner,
            job?.createdBy,
            job?.conductedBy,
            currentFineTuningUser,
          ]
            .map(normalizePlaygroundFineTuningPersonIdentity)
            .find((candidate) => candidate.id || candidate.userId || candidate.email || candidate.name);
          return owner || normalizePlaygroundFineTuningPersonIdentity(currentFineTuningUser);
        }

        function getFineTuningIdentityKeys(identity) {
          const normalized = normalizePlaygroundFineTuningPersonIdentity(identity);
          return Array.from(new Set([
            normalized.userId,
            normalized.id,
            String(normalized.email || "").toLowerCase(),
          ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)));
        }

        function getFineTuningIdentityKey(identity) {
          return getFineTuningIdentityKeys(identity)[0]
            || String(normalizePlaygroundFineTuningPersonIdentity(identity).name || "").trim().toLowerCase();
        }

        function isCurrentFineTuningOwner(job = selectedJob) {
          const ownerKeys = new Set(getFineTuningIdentityKeys(getFineTuningOwnerIdentity(job)));
          return getFineTuningIdentityKeys(currentFineTuningUser).some((key) => ownerKeys.has(key));
        }

        function getFineTuningAccessTeamIds(job = selectedJob) {
          const metadata = getFineTuningAccessMetadata(job);
          return Array.from(new Set((Array.isArray(metadata.teamAccessIds) ? metadata.teamAccessIds : [])
            .map((value) => String(value || "").trim())
            .filter(Boolean)));
        }

        function getFineTuningAccessShareIds(job = selectedJob) {
          const value = getFineTuningAccessMetadata(job).teamAccessShareIds;
          return value && typeof value === "object" && !Array.isArray(value) ? value : {};
        }

        function mergeFineTuningOwnerCandidates(candidates) {
          const byKey = new Map();
          (Array.isArray(candidates) ? candidates : []).forEach((candidate) => {
            const normalized = normalizePlaygroundFineTuningPersonIdentity(candidate);
            const key = getFineTuningIdentityKey(normalized);
            if (!key) return;
            const current = byKey.get(key) || {};
            byKey.set(key, {
              ...current,
              ...normalized,
              id: normalized.id || current.id || "",
              userId: normalized.userId || current.userId || "",
              name: normalized.name || current.name || normalized.email || current.email || "Team member",
              email: normalized.email || current.email || "",
              avatarUrl: normalized.avatarUrl || current.avatarUrl || "",
            });
          });
          return Array.from(byKey.values()).sort((left, right) =>
            String(left.name || left.email || "").localeCompare(String(right.name || right.email || ""))
          );
        }

        function getFineTuningOwnerCandidates(job = selectedJob) {
          const cached = fineTuningOwnerCandidatesByJobId?.[job?.id]?.candidates;
          return mergeFineTuningOwnerCandidates([
            getFineTuningOwnerIdentity(job),
            job?.createdBy,
            job?.conductedBy,
            currentFineTuningUser,
            ...(Array.isArray(cached) ? cached : []),
          ]);
        }

        async function requestFineTuningAccessJson(path, options = {}, fallbackMessage = "Fine-tuning access request failed.") {
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedBackendUrl) throw new Error("Fine-tuning backend is unavailable.");
          const response = await fetch(normalizedBackendUrl + path, {
            credentials: "include",
            cache: "no-store",
            ...options,
            headers: {
              ...(requestHeaders || {}),
              ...(options?.body ? { "Content-Type": "application/json" } : {}),
              ...(options?.headers || {}),
            },
          });
          return readFineTuningJsonResponse(response, fallbackMessage);
        }

        async function loadFineTuningOwnerCandidates(job = selectedJob) {
          const jobId = String(job?.id || "").trim();
          if (!jobId) return;
          const teamIds = getFineTuningAccessTeamIds(job).slice().sort();
          const signature = teamIds.join("|");
          const currentState = fineTuningOwnerCandidatesByJobId?.[jobId];
          if (currentState?.signature === signature && ["loading", "ready"].includes(currentState.status)) return;
          setFineTuningOwnerCandidatesByJobId((current) => ({
            ...current,
            [jobId]: { signature, status: "loading", candidates: current?.[jobId]?.candidates || [] },
          }));
          const memberGroups = await Promise.all(teamIds.map(async (teamId) => {
            try {
              const payload = await requestFineTuningAccessJson(
                "/teams/" + encodeURIComponent(teamId) + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
                { method: "GET" },
                "Failed to load team members."
              );
              const members = Array.isArray(payload?.members)
                ? payload.members
                : Array.isArray(payload?.data?.members)
                  ? payload.data.members
                  : Array.isArray(payload?.data)
                    ? payload.data
                    : [];
              return members
                .filter((member) => !["revoked", "removed"].includes(String(member?.status || "").trim().toLowerCase()))
                .map(normalizePlaygroundFineTuningPersonIdentity)
                .filter((member) => getFineTuningIdentityKey(member));
            } catch {
              return [];
            }
          }));
          setFineTuningOwnerCandidatesByJobId((current) => ({
            ...current,
            [jobId]: { signature, status: "ready", candidates: mergeFineTuningOwnerCandidates(memberGroups.flat()) },
          }));
        }

        function updateFineTuningOwner(job, ownerIdentity) {
          if (!job?.id || !isCurrentFineTuningOwner(job)) return;
          const owner = normalizePlaygroundFineTuningPersonIdentity(ownerIdentity);
          if (!getFineTuningIdentityKey(owner)) return;
          updateFineTuningAccessMetadata(job.id, {
            owner: { ...owner, type: "user" },
            ownerId: owner.id,
            ownerUserId: owner.userId,
            ownerName: owner.name,
            ownerEmail: owner.email,
            ownerAvatarUrl: owner.avatarUrl,
          });
          setFineTuningOwnerSelectorOpen(false);
        }

        function renderFineTuningOwnerSelector(job = selectedJob) {
          const owner = getFineTuningOwnerIdentity(job);
          const ownerLabel = String(owner.name || owner.email || owner.id || "Owner").trim();
          const options = getFineTuningOwnerCandidates(job).map((candidate) => ({
            value: getFineTuningIdentityKey(candidate),
            label: candidate.name || candidate.email || "Team member",
            description: candidate.email && candidate.name !== candidate.email ? candidate.email : undefined,
            leading: React.createElement(AccountAvatar, {
              className: "playground-fine-tuning-owner-option-avatar",
              imageClassName: "playground-fine-tuning-owner-option-avatar-image",
              fallbackLabel: getAccountInitials(candidate.name || candidate.email || "Owner"),
              photoUrl: candidate.avatarUrl || "",
            }),
            candidate,
          }));
          const ownerKeys = new Set(getFineTuningIdentityKeys(owner));
          const selectedOption = options.find((option) =>
            getFineTuningIdentityKeys(option.candidate).some((key) => ownerKeys.has(key))
          );
          const candidateState = fineTuningOwnerCandidatesByJobId?.[job?.id] || {};
          return React.createElement(PlatformSelector, {
            value: selectedOption?.value || getFineTuningIdentityKey(owner),
            options,
            open: fineTuningOwnerSelectorOpen,
            onOpenChange: (nextOpen) => {
              if (nextOpen && !isCurrentFineTuningOwner(job)) return;
              setFineTuningOwnerSelectorOpen(Boolean(nextOpen));
              if (nextOpen) void loadFineTuningOwnerCandidates(job);
            },
            onValueChange: (nextValue) => {
              const nextOwner = options.find((option) => option.value === nextValue)?.candidate;
              if (nextOwner) updateFineTuningOwner(job, nextOwner);
            },
            ariaLabel: "Choose optimization owner",
            label: React.createElement("span", { className: "playground-fine-tuning-owner-value" },
              React.createElement(AccountAvatar, {
                className: "playground-team-member-avatar playground-fine-tuning-owner-avatar",
                imageClassName: "playground-team-member-avatar-image",
                fallbackLabel: getAccountInitials(ownerLabel),
                photoUrl: owner.avatarUrl || "",
              }),
              React.createElement("span", { title: owner.email ? ownerLabel + " · " + owner.email : ownerLabel }, ownerLabel)
            ),
            alignment: "start",
            popupAlignment: "right",
            disabled: !isCurrentFineTuningOwner(job),
            loading: candidateState.status === "loading",
            loadingContent: "Loading team members...",
            emptyContent: "No human team members are available.",
            popupWidth: 260,
            className: "playground-fine-tuning-owner-selector",
            triggerClassName: "playground-fine-tuning-owner-trigger",
            popupClassName: "playground-agents-detail-owner-menu playground-fine-tuning-owner-menu",
            optionClassName: "playground-agents-detail-owner-option",
          });
        }

        function getFineTuningPermissionSet(job = selectedJob, principalId = PLATFORM_ALL_AGENTS_PRINCIPAL_ID) {
          return getPlatformSystemPrincipalPermissionSet(
            getFineTuningAccessMetadata(job),
            principalId,
            "fine_tuning",
            job?.permissionSet || getFineTuningAccessMetadata(job).permissionSet
          );
        }

        function getFineTuningSystemRolePermissionSet(job, principalId, roleId) {
          return getPlatformSystemPrincipalRolePermissionSet(
            getFineTuningAccessMetadata(job),
            principalId,
            normalizePlaygroundTeamRoleId(roleId, "member"),
            "fine_tuning_team_role"
          );
        }

        function getFineTuningTeamRolePermissionSet(job, teamId, roleId) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
          const source = getFineTuningAccessMetadata(job).teamRolePermissionSets;
          return normalizePlaygroundRolePermissionSet(
            source?.[teamId]?.[normalizedRoleId],
            "fine_tuning_team_role",
            normalizedRoleId
          );
        }

        function updateFineTuningPermissionSet(job, updater) {
          const principalId = isPlatformSystemAccessPrincipalId(fineTuningAccessTeamId)
            ? normalizePlatformAccessPrincipalId(fineTuningAccessTeamId)
            : PLATFORM_ALL_AGENTS_PRINCIPAL_ID;
          const current = getFineTuningPermissionSet(job, principalId);
          const next = normalizePlaygroundPermissionSet(
            typeof updater === "function" ? updater(current) : updater,
            "fine_tuning"
          );
          updateFineTuningAccessMetadata(job.id, (metadata) =>
            buildPlatformSystemPrincipalPermissionMetadata(metadata, principalId, next, "fine_tuning")
          );
        }

        function updateFineTuningSystemRolePermissionSet(job, principalId, roleId, updater) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
          if (!isPlatformRoleScopedSystemAccessPrincipalId(principalId) || normalizedRoleId === "owner") return;
          const current = getFineTuningSystemRolePermissionSet(
            job,
            principalId,
            normalizedRoleId
          );
          const next = normalizePlaygroundPermissionSet(
            typeof updater === "function" ? updater(current) : updater,
            "fine_tuning_team_role"
          );
          updateFineTuningAccessMetadata(job.id, (metadata) =>
            buildPlatformSystemPrincipalRolePermissionMetadata(
              metadata,
              principalId,
              normalizedRoleId,
              next,
              "fine_tuning_team_role"
            )
          );
        }

        function updateFineTuningPermissionRing(job, ringId, access) {
          const ring = getPlaygroundPermissionRingDefinition(ringId);
          updateFineTuningPermissionSet(job, (current) => ({
            ...current,
            rings: {
              ...(current.rings || {}),
              [ring.id]: {
                ...(current.rings?.[ring.id] || {}),
                defaultAccess: normalizePlaygroundPermissionAccess(access, ring.defaultAccess),
              },
            },
          }));
        }

        function updateFineTuningPermissionAction(job, actionId, options = {}) {
          const action = getPlaygroundPermissionActionDefinition(actionId);
          if (!action) return;
          updateFineTuningPermissionSet(job, (current) => ({
            ...current,
            actions: {
              ...(current.actions || {}),
              [action.id]: buildPlaygroundPermissionActionPolicy(
                current,
                action,
                current.actions?.[action.id] || { ringId: action.ringId },
                options.access !== undefined
                  ? options.access
                  : getPlaygroundPermissionActionExplicitAccess(current, action),
                options.ringId !== undefined
                  ? normalizePlaygroundPermissionRingId(options.ringId, action.ringId)
                  : undefined
              ),
            },
          }));
        }

        function updateFineTuningTeamRolePermissionSet(job, teamId, roleId, updater) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
          if (!teamId || normalizedRoleId === "owner") return;
          const current = getFineTuningTeamRolePermissionSet(job, teamId, normalizedRoleId);
          const next = normalizePlaygroundPermissionSet(
            typeof updater === "function" ? updater(current) : updater,
            "fine_tuning_team_role"
          );
          updateFineTuningAccessMetadata(job.id, (metadata) => ({
            teamRolePermissionSets: {
              ...(metadata.teamRolePermissionSets || {}),
              [teamId]: {
                ...(metadata.teamRolePermissionSets?.[teamId] || {}),
                [normalizedRoleId]: next,
              },
            },
          }));
        }

        function updateFineTuningTeamRoleRing(job, teamId, roleId, ringId, access) {
          const ring = getPlaygroundPermissionRingDefinition(ringId);
          updateFineTuningTeamRolePermissionSet(job, teamId, roleId, (current) => ({
            ...current,
            rings: {
              ...(current.rings || {}),
              [ring.id]: {
                ...(current.rings?.[ring.id] || {}),
                defaultAccess: normalizePlaygroundPermissionAccess(access, ring.defaultAccess),
              },
            },
          }));
        }

        function updateFineTuningTeamRoleAction(job, teamId, roleId, actionId, options = {}) {
          const action = getPlaygroundPermissionActionDefinition(actionId);
          if (!action) return;
          updateFineTuningTeamRolePermissionSet(job, teamId, roleId, (current) => ({
            ...current,
            actions: {
              ...(current.actions || {}),
              [action.id]: buildPlaygroundPermissionActionPolicy(
                current,
                action,
                current.actions?.[action.id] || { ringId: action.ringId },
                options.access !== undefined
                  ? options.access
                  : getPlaygroundPermissionActionExplicitAccess(current, action),
                options.ringId !== undefined
                  ? normalizePlaygroundPermissionRingId(options.ringId, action.ringId)
                  : undefined
              ),
            },
          }));
        }

        async function addFineTuningTeamAccess(job, team) {
          const teamId = String(team?.id || "").trim();
          if (!job?.id || !teamId || fineTuningAccessActionId) return;
          setFineTuningAccessActionId("add:" + teamId);
          try {
            const owner = getFineTuningOwnerIdentity(job);
            const payload = await requestFineTuningAccessJson(
              "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
              {
                method: "POST",
                body: JSON.stringify({
                  resourceType: "fine_tuning",
                  resourceId: job.id,
                  accessLevel: "use",
                  ownerId: owner.id,
                  ownerUserId: owner.userId,
                  ownerName: owner.name,
                  ownerEmail: owner.email,
                  ownerAvatarUrl: owner.avatarUrl,
                  metadata: {
                    resourceType: "fine_tuning",
                    resourceKind: "fine_tuning",
                    resourceName: job.name || "Untitled Optimization",
                    sharedTeamId: teamId,
                    sharedTeamName: team?.name || "",
                    owner,
                  },
                }),
              },
              "Failed to give the team access to this optimization job."
            ).catch((error) => {
              if (Number(error?.status) === 409) return {};
              throw error;
            });
            const share = payload?.data || payload?.share || payload || {};
            const shareId = String(share?.id || share?.shareId || share?.share_id || "").trim();
            updateFineTuningAccessMetadata(job.id, (metadata) => ({
              teamAccessIds: Array.from(new Set([...(metadata.teamAccessIds || []), teamId])),
              teamAccessShareIds: {
                ...(metadata.teamAccessShareIds || {}),
                ...(shareId ? { [teamId]: shareId } : {}),
              },
            }));
            setFineTuningAccessMenuOpen(false);
          } finally {
            setFineTuningAccessActionId("");
          }
        }

        async function removeFineTuningTeamAccess(job, teamId) {
          const normalizedTeamId = String(teamId || "").trim();
          if (!job?.id || !normalizedTeamId || fineTuningAccessActionId) return;
          setFineTuningAccessActionId("remove:" + normalizedTeamId);
          try {
            let shareId = String(getFineTuningAccessShareIds(job)?.[normalizedTeamId] || "").trim();
            if (!shareId) {
              const payload = await requestFineTuningAccessJson(
                "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares",
                { method: "GET" },
                "Failed to load team access."
              );
              const shares = Array.isArray(payload?.shares)
                ? payload.shares
                : Array.isArray(payload?.data?.shares)
                  ? payload.data.shares
                  : Array.isArray(payload?.data)
                    ? payload.data
                    : [];
              const match = shares.find((share) =>
                String(share?.resourceType || share?.resource_type || "").trim() === "fine_tuning"
                && String(share?.resourceId || share?.resource_id || "").trim() === job.id
              );
              shareId = String(match?.id || match?.shareId || match?.share_id || "").trim();
            }
            if (shareId) {
              await requestFineTuningAccessJson(
                "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares/" + encodeURIComponent(shareId),
                { method: "DELETE" },
                "Failed to remove team access."
              );
            }
            updateFineTuningAccessMetadata(job.id, (metadata) => {
              const nextRoleSets = { ...(metadata.teamRolePermissionSets || {}) };
              const nextShareIds = { ...(metadata.teamAccessShareIds || {}) };
              delete nextRoleSets[normalizedTeamId];
              delete nextShareIds[normalizedTeamId];
              return {
                teamAccessIds: (metadata.teamAccessIds || []).filter((value) => String(value || "").trim() !== normalizedTeamId),
                teamRolePermissionSets: nextRoleSets,
                teamAccessShareIds: nextShareIds,
              };
            });
            if (fineTuningAccessTeamId === normalizedTeamId) setFineTuningAccessTeamId("");
          } finally {
            setFineTuningAccessActionId("");
          }
        }

        function renderFineTuningAccessSettings(job) {
          const teamIds = getFineTuningAccessTeamIds(job);
          const teams = (Array.isArray(workspaceTeams) ? workspaceTeams : []).filter((team) => String(team?.id || "").trim());
          const sharedTeams = teamIds.map((teamId) => {
            const team = teams.find((candidate) => String(candidate.id) === teamId);
            return {
              id: teamId,
              name: team?.name || "Shared team",
              profileImageUrl: getPlatformAccessPrincipalProfileImageUrl(team),
              createdAt: team?.createdAt || job.updatedAt || "",
              description: "Team role permissions",
            };
          });
          const rows = composePlatformAccessPrincipalRows(sharedTeams);
          const selectedRow = rows.find((row) => row.id === fineTuningAccessTeamId) || null;
          if (selectedRow) {
            const systemPrincipal = getPlatformSystemAccessPrincipal(selectedRow.id);
            const roleScopedSystemPrincipal = systemPrincipal
              && isPlatformRoleScopedSystemAccessPrincipalId(systemPrincipal.id);
            const selectedRole = getPlaygroundTeamRoleDefinition(fineTuningAccessRoleId);
            return React.createElement("section", { className: "playground-fine-tuning-access-detail" },
              React.createElement("div", { className: "playground-project-team-permissions-header" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-team-permissions-back",
                  onClick: () => setFineTuningAccessTeamId(""),
                },
                  React.createElement(ArrowLeft, { width: 13, height: 13, strokeWidth: 1.9 }),
                  React.createElement("span", null, "Settings")
                ),
                React.createElement("div", { className: "playground-project-team-permissions-title" },
                  systemPrincipal ? systemPrincipal.name + " Permissions" : selectedRow.name + " Access"
                )
              ),
              systemPrincipal && !roleScopedSystemPrincipal
                ? React.createElement(PlatformPermissionsPage, {
                    permissionSet: getFineTuningPermissionSet(job, systemPrincipal.id),
                    accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
                    ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
                    actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
                    subjectType: "fine_tuning",
                    onRingAccessChange: (ringId, access) => updateFineTuningPermissionRing(job, ringId, access),
                    onActionRingChange: (actionId, ringId) => updateFineTuningPermissionAction(job, actionId, { ringId }),
                    onActionAccessChange: (actionId, access) => updateFineTuningPermissionAction(job, actionId, { access }),
                  })
                : React.createElement(PlatformRolePermissionsPage, {
                    roles: PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => ({
                      id: role.id,
                      label: role.label,
                      description: role.description,
                      meta: "Fine-tuning access",
                    })),
                    value: selectedRole.id,
                    onValueChange: setFineTuningAccessRoleId,
                    roleAriaLabel: "Fine-tuning team roles",
                    roleKicker: "Fine-tuning role",
                    roleDescription: "Fine-tuning-specific permissions for " + selectedRole.label.toLowerCase() + "s in " + selectedRow.name + ".",
                    readOnly: selectedRole.id === "owner",
                    permissionSet: roleScopedSystemPrincipal
                      ? getFineTuningSystemRolePermissionSet(job, systemPrincipal.id, selectedRole.id)
                      : getFineTuningTeamRolePermissionSet(job, selectedRow.id, selectedRole.id),
                    accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
                    ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
                    actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
                    subjectType: "fine_tuning_team_role",
                    onRingAccessChange: (ringId, access) => (
                      roleScopedSystemPrincipal
                        ? updateFineTuningSystemRolePermissionSet(job, systemPrincipal.id, selectedRole.id, (current) => ({
                            ...current,
                            rings: {
                              ...(current.rings || {}),
                              [ringId]: {
                                ...(current.rings?.[ringId] || {}),
                                defaultAccess: access,
                              },
                            },
                          }))
                        : updateFineTuningTeamRoleRing(job, selectedRow.id, selectedRole.id, ringId, access)
                    ),
                    onActionRingChange: (actionId, ringId) => (
                      roleScopedSystemPrincipal
                        ? updateFineTuningSystemRolePermissionSet(job, systemPrincipal.id, selectedRole.id, (current) => {
                            const action = getPlaygroundPermissionActionDefinition(actionId);
                            if (!action) return current;
                            return {
                              ...current,
                              actions: {
                                ...(current.actions || {}),
                                [action.id]: buildPlaygroundPermissionActionPolicy(
                                  current,
                                  action,
                                  current.actions?.[action.id] || { ringId: action.ringId },
                                  getPlaygroundPermissionActionExplicitAccess(current, action),
                                  normalizePlaygroundPermissionRingId(ringId, action.ringId)
                                ),
                              },
                            };
                          })
                        : updateFineTuningTeamRoleAction(job, selectedRow.id, selectedRole.id, actionId, { ringId })
                    ),
                    onActionAccessChange: (actionId, access) => (
                      roleScopedSystemPrincipal
                        ? updateFineTuningSystemRolePermissionSet(job, systemPrincipal.id, selectedRole.id, (current) => {
                            const action = getPlaygroundPermissionActionDefinition(actionId);
                            if (!action) return current;
                            return {
                              ...current,
                              actions: {
                                ...(current.actions || {}),
                                [action.id]: buildPlaygroundPermissionActionPolicy(
                                  current,
                                  action,
                                  current.actions?.[action.id] || { ringId: action.ringId },
                                  access
                                ),
                              },
                            };
                          })
                        : updateFineTuningTeamRoleAction(job, selectedRow.id, selectedRole.id, actionId, { access })
                    ),
                  })
            );
          }
          const availableTeams = teams.filter((team) => !teamIds.includes(String(team.id)));
          const addTeamsControl = React.createElement(PlatformPopup, {
            open: fineTuningAccessMenuOpen,
            variant: "minimal",
            portal: true,
            placement: "bottom-end",
            portalOffset: 6,
            animation: "down-in",
            surfaceProps: { role: "menu", "aria-label": "Add teams to optimization job" },
            trigger: React.createElement(PlatformSecondaryButton, {
              type: "button",
              size: "small",
              disabled: Boolean(fineTuningAccessActionId),
              onClick: () => {
                if (!teams.length && typeof onWorkspaceTeamsRequest === "function") {
                  onWorkspaceTeamsRequest({ selectedTeamId: "" });
                }
                setFineTuningAccessMenuOpen((current) => !current);
              },
            },
              React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("span", null, "Add Teams")
            ),
          },
            availableTeams.length
              ? availableTeams.map((team) => React.createElement("button", {
                  key: team.id,
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  disabled: Boolean(fineTuningAccessActionId),
                  onClick: () => void addFineTuningTeamAccess(job, team),
                },
                  React.createElement(UsersRound, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, team.name || "Untitled team")
                ))
              : React.createElement("button", { type: "button", role: "menuitem", className: "tb-popup-row", disabled: true },
                  workspaceTeamsLoading ? "Loading teams..." : "All teams already have access"
                )
          );
          return React.createElement("section", { className: "playground-fine-tuning-access-settings" },
            React.createElement(PlatformResourceAccessTable, {
              teams: sharedTeams,
              resourceLabel: "Fine-tuning job",
              trailing: addTeamsControl,
              busy: Boolean(fineTuningAccessActionId),
              onOpenPermissions: (row) => {
                setFineTuningAccessTeamId(String(row?.id || ""));
                setFineTuningAccessRoleId("member");
                setFineTuningAccessMenuOpen(false);
              },
              onRemoveTeams: (selectedTeams) => selectedTeams.forEach((team) => void removeFineTuningTeamAccess(job, team.id)),
              formatCreatedAt: formatPlaygroundFineTuningDateTime,
            })
          );
        }
`;

export const TEAMS_PERMISSION_ACTIONS_SCRIPT = `        function applyTeamPermissionSetLocally(teamId, permissionSet) {
          const normalizedTeamId = String(teamId || "").trim();
          if (!normalizedTeamId) {
            return;
          }
          const normalizedPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "team");
          setTeamPageTeams((current) => (Array.isArray(current) ? current : []).map((team) =>
            String(team?.id || "") === normalizedTeamId
              ? normalizeTeamPageTeamRecord({
                  ...team,
                  permissionSet: normalizedPermissionSet,
                })
              : normalizeTeamPageTeamRecord(team)
          ));
        }

        async function persistTeamPermissionSet(teamId, permissionSet) {
          const normalizedTeamId = String(teamId || "").trim();
          if (!normalizedTeamId) {
            return null;
          }
          const normalizedPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "team");
          const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(normalizedTeamId), {
            method: "PATCH",
            credentials: "include",
            cache: "no-store",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ permissionSet: normalizedPermissionSet }),
          }, 8000);
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to update team permissions.");
          }
          const updatedTeam = normalizeTeamPageTeamRecord(data?.data || data?.team || data);
          if (updatedTeam?.id) {
            setTeamPageTeams((current) => (Array.isArray(current) ? current : []).map((team) =>
              String(team?.id || "") === String(updatedTeam.id || "") ? updatedTeam : normalizeTeamPageTeamRecord(team)
            ));
          }
          return updatedTeam;
        }

        function updateTeamPermissionSet(updater) {
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const selectedTeam = teamPageTeams.find((team) => String(team?.id || "") === teamId) || null;
          if (!teamId || !selectedTeam) {
            return;
          }
          const currentPermissionSet = normalizePlaygroundPermissionSet(selectedTeam.permissionSet, "team");
          const nextPermissionSet = normalizePlaygroundPermissionSet(
            typeof updater === "function" ? updater(currentPermissionSet) : updater,
            "team"
          );
          applyTeamPermissionSetLocally(teamId, nextPermissionSet);
          setTeamPageActionId("team-permissions");
          setTeamPageError("");
          void persistTeamPermissionSet(teamId, nextPermissionSet)
            .catch((error) => {
              applyTeamPermissionSetLocally(teamId, currentPermissionSet);
              setTeamPageError(error instanceof Error ? error.message : "Failed to update team permissions.");
            })
            .finally(() => {
              setTeamPageActionId((current) => current === "team-permissions" ? "" : current);
            });
        }

        function updateTeamPermissionRingAccess(ringId, nextAccess) {
          const normalizedRingId = String(ringId || "").trim();
          const normalizedAccess = normalizePlaygroundPermissionAccess(nextAccess);
          if (!normalizedRingId) {
            return;
          }
          updateTeamPermissionSet((currentPermissionSet) => ({
            ...currentPermissionSet,
            rings: {
              ...(currentPermissionSet.rings || {}),
              [normalizedRingId]: {
                ...((currentPermissionSet.rings || {})[normalizedRingId] || {}),
                defaultAccess: normalizedAccess,
              },
            },
          }));
        }

        function updateTeamPermissionActionRing(actionId, nextRingId) {
          const normalizedActionId = String(actionId || "").trim();
          const normalizedRingId = String(nextRingId || "").trim();
          const actionDefinition = getPlaygroundPermissionActionDefinition(normalizedActionId);
          if (!normalizedActionId || !normalizedRingId || !actionDefinition) {
            return;
          }
          updateTeamPermissionSet((currentPermissionSet) => {
            const existingAction = (currentPermissionSet.actions || {})[normalizedActionId] || {};
            const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
            return {
              ...currentPermissionSet,
              actions: {
                ...(currentPermissionSet.actions || {}),
                [normalizedActionId]: buildPlaygroundPermissionActionPolicy(
                  currentPermissionSet,
                  actionDefinition,
                  existingAction,
                  explicitAccess,
                  normalizedRingId
                ),
              },
            };
          });
        }

        function updateTeamPermissionActionAccess(actionId, nextAccess) {
          const normalizedActionId = String(actionId || "").trim();
          const normalizedAccess = normalizePlaygroundPermissionAccess(nextAccess, "");
          if (!normalizedActionId) {
            return;
          }
          updateTeamPermissionSet((currentPermissionSet) => {
            const existingAction = (currentPermissionSet.actions || {})[normalizedActionId] || {};
            const actionDefinition = getPlaygroundPermissionActionDefinition(normalizedActionId);
            if (!actionDefinition) {
              return currentPermissionSet;
            }
            return {
              ...currentPermissionSet,
              actions: {
                ...(currentPermissionSet.actions || {}),
                [normalizedActionId]: buildPlaygroundPermissionActionPolicy(
                  currentPermissionSet,
                  actionDefinition,
                  existingAction,
                  normalizedAccess
                ),
              },
            };
          });
        }

        function applyTeamRolePermissionSetLocally(teamId, roleId, permissionSet) {
          const normalizedTeamId = String(teamId || "").trim();
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "");
          if (!normalizedTeamId || !normalizedRoleId || normalizedRoleId === "owner") {
            return;
          }
          const normalizedPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "team_role");
          setTeamPageTeams((current) => (Array.isArray(current) ? current : []).map((team) => {
            if (String(team?.id || "") !== normalizedTeamId) {
              return normalizeTeamPageTeamRecord(team);
            }
            const rolePermissionSets = normalizePlaygroundTeamRolePermissionSets(team.rolePermissionSets);
            return normalizeTeamPageTeamRecord({
              ...team,
              rolePermissionSets: {
                ...rolePermissionSets,
                [normalizedRoleId]: normalizedPermissionSet,
              },
            });
          }));
        }

        async function persistTeamRolePermissionSet(teamId, roleId, permissionSet) {
          const normalizedTeamId = String(teamId || "").trim();
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "");
          if (!normalizedTeamId || !normalizedRoleId || normalizedRoleId === "owner") {
            return null;
          }
          const selectedTeam = teamPageTeams.find((team) => String(team?.id || "") === normalizedTeamId) || null;
          const currentRolePermissionSets = normalizePlaygroundTeamRolePermissionSets(selectedTeam?.rolePermissionSets);
          const nextRolePermissionSets = {
            ...currentRolePermissionSets,
            [normalizedRoleId]: normalizePlaygroundPermissionSet(permissionSet, "team_role"),
          };
          const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(normalizedTeamId), {
            method: "PATCH",
            credentials: "include",
            cache: "no-store",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ rolePermissionSets: nextRolePermissionSets }),
          }, 8000);
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to update role permissions.");
          }
          const updatedTeamSource = data?.data || data?.team || data;
          const updatedTeam = normalizeTeamPageTeamRecord({
            ...(selectedTeam || {}),
            ...(updatedTeamSource && typeof updatedTeamSource === "object" && !Array.isArray(updatedTeamSource) ? updatedTeamSource : {}),
            rolePermissionSets: updatedTeamSource?.rolePermissionSets || nextRolePermissionSets,
          });
          if (updatedTeam?.id) {
            setTeamPageTeams((current) => (Array.isArray(current) ? current : []).map((team) =>
              String(team?.id || "") === String(updatedTeam.id || "") ? updatedTeam : normalizeTeamPageTeamRecord(team)
            ));
          }
          return updatedTeam;
        }

        function updateTeamRolePermissionSet(roleId, updater) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "");
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const selectedTeam = teamPageTeams.find((team) => String(team?.id || "") === teamId) || null;
          if (!teamId || !selectedTeam || !normalizedRoleId || normalizedRoleId === "owner") {
            return;
          }
          const currentRolePermissionSets = normalizePlaygroundTeamRolePermissionSets(selectedTeam.rolePermissionSets);
          const currentPermissionSet = normalizePlaygroundPermissionSet(currentRolePermissionSets[normalizedRoleId], "team_role");
          const nextPermissionSet = normalizePlaygroundPermissionSet(
            typeof updater === "function" ? updater(currentPermissionSet) : updater,
            "team_role"
          );
          applyTeamRolePermissionSetLocally(teamId, normalizedRoleId, nextPermissionSet);
          setTeamPageActionId("team-role-permissions:" + normalizedRoleId);
          setTeamPageError("");
          void persistTeamRolePermissionSet(teamId, normalizedRoleId, nextPermissionSet)
            .catch((error) => {
              applyTeamRolePermissionSetLocally(teamId, normalizedRoleId, currentPermissionSet);
              setTeamPageError(error instanceof Error ? error.message : "Failed to update role permissions.");
            })
            .finally(() => {
              setTeamPageActionId((current) => current === "team-role-permissions:" + normalizedRoleId ? "" : current);
            });
        }

        function updateTeamRolePermissionRingAccess(roleId, ringId, nextAccess) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "");
          const normalizedRingId = String(ringId || "").trim();
          const normalizedAccess = normalizePlaygroundPermissionAccess(nextAccess);
          if (!normalizedRoleId || !normalizedRingId) {
            return;
          }
          updateTeamRolePermissionSet(normalizedRoleId, (currentPermissionSet) => ({
            ...currentPermissionSet,
            rings: {
              ...(currentPermissionSet.rings || {}),
              [normalizedRingId]: {
                ...((currentPermissionSet.rings || {})[normalizedRingId] || {}),
                defaultAccess: normalizedAccess,
              },
            },
          }));
        }

        function updateTeamRolePermissionActionRing(roleId, actionId, nextRingId) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "");
          const normalizedActionId = String(actionId || "").trim();
          const normalizedRingId = String(nextRingId || "").trim();
          const actionDefinition = getPlaygroundPermissionActionDefinition(normalizedActionId);
          if (!normalizedRoleId || !normalizedActionId || !normalizedRingId || !actionDefinition) {
            return;
          }
          updateTeamRolePermissionSet(normalizedRoleId, (currentPermissionSet) => {
            const existingAction = (currentPermissionSet.actions || {})[normalizedActionId] || {};
            const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
            return {
              ...currentPermissionSet,
              actions: {
                ...(currentPermissionSet.actions || {}),
                [normalizedActionId]: buildPlaygroundPermissionActionPolicy(
                  currentPermissionSet,
                  actionDefinition,
                  existingAction,
                  explicitAccess,
                  normalizedRingId
                ),
              },
            };
          });
        }

        function updateTeamRolePermissionActionAccess(roleId, actionId, nextAccess) {
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "");
          const normalizedActionId = String(actionId || "").trim();
          const normalizedAccess = normalizePlaygroundPermissionAccess(nextAccess, "");
          if (!normalizedRoleId || !normalizedActionId) {
            return;
          }
          updateTeamRolePermissionSet(normalizedRoleId, (currentPermissionSet) => {
            const existingAction = (currentPermissionSet.actions || {})[normalizedActionId] || {};
            const actionDefinition = getPlaygroundPermissionActionDefinition(normalizedActionId);
            if (!actionDefinition) {
              return currentPermissionSet;
            }
            const nextAction = buildPlaygroundPermissionActionPolicy(
              currentPermissionSet,
              actionDefinition,
              existingAction,
              normalizedAccess
            );
            return {
              ...currentPermissionSet,
              actions: {
                ...(currentPermissionSet.actions || {}),
                [normalizedActionId]: nextAction,
              },
            };
          });
        }

`;


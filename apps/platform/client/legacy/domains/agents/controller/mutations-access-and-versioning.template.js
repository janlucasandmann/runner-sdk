          function clearAgentListActionMenuCloseTimer() {
            if (agentListActionMenuCloseTimerRef.current !== null && typeof window !== "undefined") {
              window.clearTimeout(agentListActionMenuCloseTimerRef.current);
              agentListActionMenuCloseTimerRef.current = null;
            }
          }
  
          function clearAgentBulkActionMenuCloseTimer() {
            if (agentBulkActionMenuCloseTimerRef.current !== null && typeof window !== "undefined") {
              window.clearTimeout(agentBulkActionMenuCloseTimerRef.current);
              agentBulkActionMenuCloseTimerRef.current = null;
            }
          }
  
          function closeAgentListActionMenu(options = {}) {
            if (!agentListActionMenuState) {
              return;
            }
            clearAgentListActionMenuCloseTimer();
            if (options?.animate === false || typeof window === "undefined") {
              setAgentListActionMenuClosing(false);
              setAgentListActionMenuState(null);
              return;
            }
            setAgentListActionMenuClosing(true);
            agentListActionMenuCloseTimerRef.current = window.setTimeout(() => {
              agentListActionMenuCloseTimerRef.current = null;
              setAgentListActionMenuClosing(false);
              setAgentListActionMenuState(null);
            }, 90);
          }
  
          function closeAgentBulkActionMenu(options = {}) {
            if (!agentBulkActionMenuState) {
              return;
            }
            clearAgentBulkActionMenuCloseTimer();
            if (options?.animate === false || typeof window === "undefined") {
              setAgentBulkActionMenuClosing(false);
              setAgentBulkActionMenuState(null);
              return;
            }
            setAgentBulkActionMenuClosing(true);
            agentBulkActionMenuCloseTimerRef.current = window.setTimeout(() => {
              agentBulkActionMenuCloseTimerRef.current = null;
              setAgentBulkActionMenuClosing(false);
              setAgentBulkActionMenuState(null);
            }, 90);
          }
  
          function getAgentOverviewActionMenuPosition(event, menuHeight = 184, options = {}) {
            if (options?.openLeft) {
              const rect = event.currentTarget.getBoundingClientRect();
              const menuWidth = 220;
              const viewportWidth = window.innerWidth || document.documentElement?.clientWidth || 0;
              const viewportHeight = window.innerHeight || document.documentElement?.clientHeight || 0;
              const gutter = 12;
              const sideGap = 8;
              const maxRight = Math.max(gutter, viewportWidth - menuWidth - gutter);
              const maxTop = Math.max(gutter, viewportHeight - menuHeight - gutter);
              const preferredRight = viewportWidth - rect.left + sideGap;
              return {
                top: Math.max(gutter, Math.min(maxTop, rect.top + rect.height / 2 - menuHeight / 2)),
                right: Math.max(gutter, Math.min(maxRight, preferredRight)),
              };
            }
            return getSideActionMenuPosition(event, menuHeight, 220);
          }
  
          function getAgentOverviewContextMenuPosition(event, menuHeight = 184) {
            const menuWidth = 220;
            const viewportWidth = window.innerWidth || document.documentElement?.clientWidth || 0;
            const viewportHeight = window.innerHeight || document.documentElement?.clientHeight || 0;
            const gutter = 12;
            const maxLeft = Math.max(gutter, viewportWidth - menuWidth - gutter);
            const maxTop = Math.max(gutter, viewportHeight - menuHeight - gutter);
            return {
              top: Math.max(gutter, Math.min(maxTop, Number(event?.clientY || 0))),
              left: Math.max(gutter, Math.min(maxLeft, Number(event?.clientX || 0))),
            };
          }
  
          function openAgentListActionMenu(event, agent, options = {}) {
            if (!agent?.id) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            const position = options?.context
              ? getAgentOverviewContextMenuPosition(event, 256)
              : getAgentOverviewActionMenuPosition(event, 256, options);
            if (!options?.context && agentListActionMenuState?.agentId === agent.id && !agentListActionMenuClosing) {
              closeAgentListActionMenu();
              return;
            }
            clearAgentListActionMenuCloseTimer();
            closeAgentBulkActionMenu({ animate: false });
            setAgentListActionMenuClosing(false);
            setAgentListActionMenuState({
              agentId: agent.id,
              agentRecord: agent,
              ...position,
            });
          }
  
  
          function closeAgentRenameDialog() {
            setAgentRenameState(null);
            setAgentRenameValue("");
            setAgentRenameError("");
          }
  
          function updateAgentComposerField(field, value) {
            setAgentComposerDraft((current) => ({
              ...(current || buildPlaygroundDefaultAgentDraft()),
              [field]: value,
            }));
            setAgentComposerSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          function updateAgentComposerTeamOrchestrator(agentId) {
            setAgentComposerDraft((current) => {
              const base = current || buildPlaygroundDefaultAgentDraft("team");
              const normalizedId = String(agentId || "").trim();
              return {
                ...base,
                teamOrchestratorAgentId: normalizedId,
                teamSubagentIds: dedupePlaygroundAgentIds(base.teamSubagentIds).filter((value) => value !== normalizedId),
                model: availableTeamMemberAgentsById[normalizedId]?.model || base.model,
              };
            });
            setAgentComposerSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          function toggleAgentComposerTeamSubagent(agentId) {
            setAgentComposerDraft((current) => {
              const base = current || buildPlaygroundDefaultAgentDraft("team");
              const normalizedId = String(agentId || "").trim();
              const orchestratorAgentId = String(base.teamOrchestratorAgentId || "").trim();
              if (!normalizedId || normalizedId === orchestratorAgentId) {
                return base;
              }
  
              const currentIds = dedupePlaygroundAgentIds(base.teamSubagentIds).filter((value) => value !== orchestratorAgentId);
              const nextIds = currentIds.includes(normalizedId)
                ? currentIds.filter((value) => value !== normalizedId)
                : currentIds.concat(normalizedId);
  
              return {
                ...base,
                teamSubagentIds: nextIds,
              };
            });
            setAgentComposerSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          function applyAgentComposerMarkdownSelection(field, textareaRef, nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            updateAgentComposerField(field, nextValue);
            window.requestAnimationFrame(() => {
              const textarea = textareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeAgentDescriptionTextarea(textarea);
            });
          }
  
          function handleAgentComposerMarkdownFormat(field, textareaRef, formatType) {
            const textarea = textareaRef.current;
            if (!textarea) {
              return;
            }
            const value = String(agentComposerDraft?.[field] || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
  
            if (formatType === "bold") {
              edit = buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedAgentMarkdownEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildAgentMarkdownListEdit(value, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            applyAgentComposerMarkdownSelection(field, textareaRef, edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function buildSingleAgentCopyDraft(agent) {
            const normalizedCurrentAgent = normalizePlaygroundAgentRecord(
              agent || buildPlaygroundDefaultAgentDraft("single")
            );
            const sanitizedMetadata = buildPlaygroundAgentPersistedMetadata({
              ...normalizedCurrentAgent,
              agentType: "single",
              teamOrchestratorAgentId: "",
              teamSubagentIds: [],
              teamExecutionMode: "",
              isSystem: false,
              isDefault: false,
            });
            return {
              name: String(normalizedCurrentAgent.name || "").trim()
                ? String(normalizedCurrentAgent.name || "").trim() + " Copy"
                : "New Agent",
              description: normalizedCurrentAgent.description || "",
              instructions: normalizedCurrentAgent.instructions || "",
              model: normalizedCurrentAgent.model || buildPlaygroundDefaultAgentDraft("single").model,
              binary: normalizedCurrentAgent.binary || "Claude Code CLI",
              reasoningEffort: normalizedCurrentAgent.reasoningEffort || "medium",
              enabledSkills: isPlaygroundTeamAgent(normalizedCurrentAgent)
                ? []
                : (Array.isArray(normalizedCurrentAgent.enabledSkills) ? [...normalizedCurrentAgent.enabledSkills] : []),
              guardrailSetIds: normalizePlaygroundGuardrailSetIds(normalizedCurrentAgent.guardrailSetIds),
              deepResearchModel: normalizedCurrentAgent.deepResearchModel || buildPlaygroundDefaultAgentDraft("single").deepResearchModel,
              permissionSet: normalizePlaygroundPermissionSet(normalizedCurrentAgent.permissionSet, "agent"),
              metadata: sanitizedMetadata,
            };
          }

          function openCurrentAgentCopyModal() {
            openAgentCreationSetupOverlay(
              buildSingleAgentCopyDraft(draftAgent || buildPlaygroundDefaultAgentDraft("single"))
            );
          }
  
          function openAgentCopyModal(agent) {
            const normalizedAgent = normalizePlaygroundAgentRecord(agent);
            const isTeamCopy = normalizedAgent.agentType === "team" || isPlaygroundTeamAgent(normalizedAgent);
            if (!isTeamCopy) {
              openAgentDraftDetail("single", {
                draft: buildSingleAgentCopyDraft(normalizedAgent),
                preserveDraftName: true,
              });
              return;
            }
            const nextName = String(normalizedAgent.name || "").trim()
              ? String(normalizedAgent.name || "").trim() + " Copy"
              : "New Squad";
            const sanitizedMetadata = buildPlaygroundAgentPersistedMetadata({
              ...normalizedAgent,
              name: nextName,
              isSystem: false,
              isDefault: false,
            });
            openAgentComposer("team", {
              draft: {
                name: nextName,
                instructions: "",
                model: normalizedAgent.model || buildPlaygroundDefaultAgentDraft("team").model,
                binary: normalizedAgent.binary || "Claude Code CLI",
                reasoningEffort: normalizedAgent.reasoningEffort || "medium",
                enabledSkills: [],
                guardrailSetIds: normalizePlaygroundGuardrailSetIds(normalizedAgent.guardrailSetIds),
                deepResearchModel: null,
                permissionSet: normalizePlaygroundPermissionSet(normalizedAgent.permissionSet, "agent"),
                teamOrchestratorAgentId: normalizedAgent.teamOrchestratorAgentId,
                teamSubagentIds: [...dedupePlaygroundAgentIds(normalizedAgent.teamSubagentIds)],
                teamExecutionMode: PLAYGROUND_AGENT_TEAM_EXECUTION_MODE,
                metadata: sanitizedMetadata,
              },
            });
          }
  
          function openTeamComposerFromCurrentAgent() {
            const normalizedCurrentAgent = draftAgent ? normalizePlaygroundAgentRecord(draftAgent) : null;
            const preferredOrchestratorId = normalizedCurrentAgent
              ? (
                  isPlaygroundTeamAgent(normalizedCurrentAgent)
                    ? String(normalizedCurrentAgent.teamOrchestratorAgentId || "").trim()
                    : String(normalizedCurrentAgent.id || "").trim()
                )
              : "";
            openAgentComposer("team", {
              draft: {
                teamOrchestratorAgentId: preferredOrchestratorId,
                model: preferredOrchestratorId && availableTeamMemberAgentsById[preferredOrchestratorId]?.model
                  ? availableTeamMemberAgentsById[preferredOrchestratorId].model
                  : buildPlaygroundDefaultAgentDraft("team").model,
              },
            });
          }
  
          function handleAgentProfileNewThread() {
            const normalizedAgentId = String(draftAgent?.id || "").trim();
            if (!normalizedAgentId || typeof onStartThreadWithAgent !== "function") {
              return;
            }
            onStartThreadWithAgent(normalizedAgentId);
          }
  
          function requestAgentWorkspaceTeams(options = {}) {
            if (workspaceTeamsRequiresPlan || workspaceTeamsLoading || typeof onWorkspaceTeamsRequestRef.current !== "function") {
              return;
            }
            onWorkspaceTeamsRequestRef.current(options);
          }
  
          async function fetchAgentTeamMemberProfilePayload(teamId, members = []) {
            const normalizedTeamId = String(teamId || "").trim();
            const baseUrl = String(backendUrl || "").replace(/\/+$/, "");
            const memberPayload = Array.isArray(members) ? members : [];
            if (!normalizedTeamId && memberPayload.length === 0) {
              return null;
            }
            try {
              const { response, data } = await fetchJsonWithTimeout(baseUrl + "/team-member-profiles/lookup", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  teamId: normalizedTeamId,
                  members: memberPayload,
                }),
              }, 8000);
              if (response.ok) {
                const profiles = Array.isArray(data?.profiles)
                  ? data.profiles
                  : Array.isArray(data?.data)
                    ? data.data
                    : [];
                if (profiles.length > 0) {
                  return data;
                }
              }
            } catch {}
            if (!normalizedTeamId) {
              return null;
            }
            const profilePaths = [
              "/teams/" + encodeURIComponent(normalizedTeamId) + "/member-profiles",
              "/teams/" + encodeURIComponent(normalizedTeamId) + "/members/profiles",
            ];
            for (const path of profilePaths) {
              try {
                const { response, data } = await fetchJsonWithTimeout(baseUrl + path, {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                  headers: requestHeaders,
                }, 5000);
                if (response.ok) {
                  return data;
                }
              } catch {}
            }
            return null;
          }
  
          async function loadAgentWorkspaceTeamMembers(teamId) {
            const normalizedTeamId = String(teamId || "").trim();
            if (!normalizedTeamId) {
              return;
            }
            const baseUrl = String(backendUrl || "").replace(/\/+$/, "");
            try {
              const { response, data } = await fetchJsonWithTimeout(
                baseUrl + "/teams/" + encodeURIComponent(normalizedTeamId) + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
                {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                  headers: requestHeaders,
                },
                15000
              );
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load team members.");
              }
              const rawMembers = Array.isArray(data?.data) ? data.data : [];
              const profilePayload = await fetchAgentTeamMemberProfilePayload(normalizedTeamId, rawMembers);
              const mergedMembers = mergeAgentTeamMemberProfiles(rawMembers, data, profilePayload);
              setAgentWorkspaceTeamMembersById((current) => ({
                ...current,
                [normalizedTeamId]: mergedMembers,
              }));
            } catch {
              setAgentWorkspaceTeamMembersById((current) => (
                Object.prototype.hasOwnProperty.call(current, normalizedTeamId)
                  ? current
                  : { ...current, [normalizedTeamId]: [] }
              ));
            }
          }
  
          function buildAgentOwnerRecord(ownerIdentity) {
            const identity = normalizeAgentPersonIdentity(ownerIdentity);
            return {
              type: "user",
              id: String(identity.id || identity.userId || identity.email || "").trim(),
              userId: String(identity.userId || "").trim(),
              name: String(identity.name || identity.email || "Owner").trim(),
              email: String(identity.email || "").trim(),
              avatarUrl: String(identity.avatarUrl || "").trim(),
              photoUrl: String(identity.avatarUrl || "").trim(),
            };
          }
  
          function applyAgentOwnerIdentity(agentRecord, ownerIdentity) {
            const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord || buildPlaygroundDefaultAgentDraft());
            const metadata = {
              ...getAgentMetadataRecord(normalizedAgent),
            };
            const owner = buildAgentOwnerRecord(ownerIdentity);
            metadata.owner = owner;
            metadata.ownerId = owner.id;
            metadata.owner_id = owner.id;
            metadata.ownerUserId = owner.userId;
            metadata.owner_user_id = owner.userId;
            metadata.ownerName = owner.name;
            metadata.owner_name = owner.name;
            metadata.ownerEmail = owner.email;
            metadata.owner_email = owner.email;
            metadata.ownerAvatarUrl = owner.avatarUrl;
            metadata.owner_avatar_url = owner.avatarUrl;
            return normalizePlaygroundAgentRecord({
              ...normalizedAgent,
              metadata,
            });
          }
  
          function applyAgentSharedTeam(agentRecord, teamId) {
            const normalizedTeamId = String(teamId || "").trim();
            const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord || buildPlaygroundDefaultAgentDraft());
            if (!normalizedTeamId) {
              return normalizedAgent;
            }
            return normalizePlaygroundAgentRecord({
              ...normalizedAgent,
              metadata: buildPlatformTeamAccessMetadata(
                getAgentMetadataRecord(normalizedAgent),
                normalizedTeamId,
                true,
                "agent_team_role",
                PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id)
              ),
            });
          }

          function buildAgentTeamAccessRecord(agentRecord, teamId, shouldInclude) {
            const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord || buildPlaygroundDefaultAgentDraft());
            return normalizePlaygroundAgentRecord({
              ...normalizedAgent,
              metadata: buildPlatformTeamAccessMetadata(
                getAgentMetadataRecord(normalizedAgent),
                teamId,
                shouldInclude,
                "agent_team_role",
                PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id)
              ),
            });
          }

          function getAgentTeamRolePermissionSet(agentRecord, teamId, roleId) {
            return getPlatformTeamRolePermissionSet(
              getAgentMetadataRecord(agentRecord),
              teamId,
              roleId,
              "agent_team_role",
              PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id)
            );
          }

          function getAgentSystemRolePermissionSet(agentRecord, principalId, roleId) {
            return getPlatformSystemPrincipalRolePermissionSet(
              getAgentMetadataRecord(agentRecord),
              principalId,
              roleId,
              "agent_team_role"
            );
          }

          async function flushQueuedAgentAccessPermissionSave() {
            if (agentAccessPermissionSaveInFlightRef.current) return;
            agentAccessPermissionSaveInFlightRef.current = true;
            try {
              while (agentAccessPermissionSaveQueuedRef.current) {
                const queuedSave = agentAccessPermissionSaveQueuedRef.current;
                const agentToSave = normalizePlaygroundAgentRecord(queuedSave?.agent || queuedSave);
                const teamIds = Array.from(new Set(
                  (Array.isArray(queuedSave?.teamIds) ? queuedSave.teamIds : [queuedSave?.teamId])
                    .map((teamId) => String(teamId || "").trim())
                    .filter(Boolean)
                ));
                agentAccessPermissionSaveQueuedRef.current = null;
                try {
                  const savedAgent = await persistAgentRecordFromAction(
                    agentToSave,
                    "Failed to save agent access permissions."
                  );
                  for (const teamId of teamIds) {
                    await syncAgentTeamResourceShare(savedAgent, teamId);
                  }
                } catch (error) {
                  setAgentAccessState({
                    teamId: "",
                    action: "",
                    error: error instanceof Error ? error.message : "Failed to save agent access permissions.",
                  });
                  return;
                }
              }
            } finally {
              agentAccessPermissionSaveInFlightRef.current = false;
            }
          }

          function queueAgentAccessPermissionSave(agentRecord, teamId = "") {
            const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord || buildPlaygroundDefaultAgentDraft());
            if (!normalizedAgent?.id || normalizedAgent.id === PLAYGROUND_AGENT_DRAFT_ID) return;
            const queuedTeamIds = Array.isArray(agentAccessPermissionSaveQueuedRef.current?.teamIds)
              ? agentAccessPermissionSaveQueuedRef.current.teamIds
              : [agentAccessPermissionSaveQueuedRef.current?.teamId];
            const normalizedTeamId = String(teamId || "").trim();
            agentAccessPermissionSaveQueuedRef.current = {
              agent: normalizedAgent,
              teamIds: Array.from(new Set([
                ...queuedTeamIds.map((queuedTeamId) => String(queuedTeamId || "").trim()).filter(Boolean),
                ...(normalizedTeamId ? [normalizedTeamId] : []),
              ])),
            };
            setAgentDetailsById((current) => ({
              ...current,
              [normalizedAgent.id]: normalizedAgent,
            }));
            if (selectedAgentIdRef.current === normalizedAgent.id) {
              setDraftAgent(normalizedAgent);
            }
            setAgentAccessState({ teamId: "", action: "saving", error: "" });
            if (agentAccessPermissionSaveTimerRef.current) {
              window.clearTimeout(agentAccessPermissionSaveTimerRef.current);
            }
            agentAccessPermissionSaveTimerRef.current = window.setTimeout(() => {
              agentAccessPermissionSaveTimerRef.current = null;
              void flushQueuedAgentAccessPermissionSave().finally(() => {
                if (!agentAccessPermissionSaveQueuedRef.current) {
                  setAgentAccessState((current) => current.error
                    ? current
                    : { teamId: "", action: "", error: "" });
                }
              });
            }, 450);
          }

          function updateAgentSystemAccessPermissionSet(permissionSet) {
            const currentAgent = normalizePlaygroundAgentRecord(draftAgent || selectedAgentSnapshot || buildPlaygroundDefaultAgentDraft());
            const principalId = isPlatformSystemAccessPrincipalId(agentAccessPrincipalId)
              ? normalizePlatformAccessPrincipalId(agentAccessPrincipalId)
              : PLATFORM_ALL_AGENTS_PRINCIPAL_ID;
            const nextPermissionSet = normalizePlaygroundPermissionSet(permissionSet, "agent_resource");
            const nextAgent = normalizePlaygroundAgentRecord({
              ...currentAgent,
              metadata: buildPlatformSystemPrincipalPermissionMetadata(
                getAgentMetadataRecord(currentAgent),
                principalId,
                nextPermissionSet,
                "agent_resource"
              ),
            });
            queueAgentAccessPermissionSave(nextAgent);
          }

          function updateAgentSystemRoleAccessPermissionSet(roleId, permissionSet) {
            const principalId = normalizePlatformAccessPrincipalId(agentAccessPrincipalId);
            const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
            if (
              !isPlatformRoleScopedSystemAccessPrincipalId(principalId)
              || normalizedRoleId === "owner"
            ) {
              return;
            }
            const currentAgent = normalizePlaygroundAgentRecord(
              draftAgent || selectedAgentSnapshot || buildPlaygroundDefaultAgentDraft()
            );
            const nextAgent = normalizePlaygroundAgentRecord({
              ...currentAgent,
              metadata: buildPlatformSystemPrincipalRolePermissionMetadata(
                getAgentMetadataRecord(currentAgent),
                principalId,
                normalizedRoleId,
                normalizePlaygroundPermissionSet(permissionSet, "agent_team_role"),
                "agent_team_role"
              ),
            });
            queueAgentAccessPermissionSave(nextAgent);
          }

          function updateAgentTeamRoleAccessPermissionSet(roleId, permissionSet) {
            const normalizedTeamId = String(agentAccessPrincipalId || "").trim();
            const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
            if (!normalizedTeamId || isPlatformSystemAccessPrincipalId(normalizedTeamId) || normalizedRoleId === "owner") {
              return;
            }
            const currentAgent = normalizePlaygroundAgentRecord(draftAgent || selectedAgentSnapshot || buildPlaygroundDefaultAgentDraft());
            const nextAgent = normalizePlaygroundAgentRecord({
              ...currentAgent,
              metadata: buildPlatformTeamRolePermissionMetadata(
                getAgentMetadataRecord(currentAgent),
                normalizedTeamId,
                normalizedRoleId,
                normalizePlaygroundPermissionSet(permissionSet, "agent_team_role"),
                "agent_team_role",
                PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id)
              ),
            });
            queueAgentAccessPermissionSave(nextAgent, normalizedTeamId);
          }
  
          function buildAgentTeamSharePayload(agentRecord, teamRecord) {
            const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord || buildPlaygroundDefaultAgentDraft());
            const normalizedTeam = normalizeAgentWorkspaceTeamOption(teamRecord) || {};
            const owner = buildAgentOwnerRecord(readAgentOwnerIdentity(normalizedAgent));
            const profile = getPlaygroundAgentProfileMetadata(normalizedAgent.metadata) || {};
            const agentSnapshot = {
              id: String(normalizedAgent.id || "").trim(),
              name: String(normalizedAgent.name || "Untitled Agent").trim(),
              description: String(normalizedAgent.description || "").trim(),
              model: String(normalizedAgent.model || "").trim(),
              agentType: normalizedAgent.agentType === "team" ? "team" : "single",
              profile,
              owner,
              ownerId: owner.id,
              ownerUserId: owner.userId,
              ownerName: owner.name,
              ownerEmail: owner.email,
              ownerAvatarUrl: owner.avatarUrl,
            };
            return {
              resourceType: "agent",
              resourceId: agentSnapshot.id,
              accessLevel: "use",
              ownerId: owner.id,
              ownerUserId: owner.userId,
              ownerName: owner.name,
              ownerEmail: owner.email,
              ownerAvatarUrl: owner.avatarUrl,
              metadata: {
                resourceType: "agent",
                resourceKind: "agent",
                sharedTeamId: normalizedTeam.id || "",
                sharedTeamName: normalizedTeam.name || "",
                permissionSet: getPlatformTeamPermissionSet(
                  getAgentMetadataRecord(normalizedAgent),
                  normalizedTeam.id,
                  "agent_team_role"
                ),
                rolePermissionSets: getPlatformTeamRolePermissionSets(
                  getAgentMetadataRecord(normalizedAgent),
                  normalizedTeam.id,
                  "agent_team_role",
                  PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => role.id)
                ),
                owner,
                ownerId: owner.id,
                ownerUserId: owner.userId,
                ownerName: owner.name,
                ownerEmail: owner.email,
                ownerAvatarUrl: owner.avatarUrl,
                agent: agentSnapshot,
              },
            };
          }

          async function syncAgentTeamResourceShare(agentRecord, teamId) {
            const normalizedTeamId = String(teamId || "").trim();
            if (!normalizedTeamId) return;
            const teamRecord = availableAgentShareTeams.find((team) => (
              String(team?.id || "").trim() === normalizedTeamId
            )) || { id: normalizedTeamId };
            const { response, data } = await fetchJsonWithTimeout(
              backendUrl + "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares",
              {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(buildAgentTeamSharePayload(agentRecord, teamRecord)),
              },
              8000
            );
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update agent team permissions.");
            }
          }

          async function findAgentTeamResourceShare(teamId, agentId) {
            const { response, data } = await fetchJsonWithTimeout(
              backendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
              {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders,
              },
              8000
            );
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load agent team access.");
            }
            const shares = Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.shares)
                ? data.shares
                : [];
            return shares.find((share) => (
              String(share?.resourceType || share?.resource_type || "") === "agent"
              && String(share?.resourceId || share?.resource_id || "") === String(agentId || "")
            )) || null;
          }

          async function handleAddAgentTeamAccess(team) {
            const teamId = String(team?.id || "").trim();
            const currentAgent = normalizePlaygroundAgentRecord(draftAgent || selectedAgentSnapshot || buildPlaygroundDefaultAgentDraft());
            if (
              !teamId
              || !currentAgent.id
              || currentAgent.id === PLAYGROUND_AGENT_DRAFT_ID
              || getAgentSharedTeamIds(currentAgent).includes(teamId)
            ) {
              return;
            }
            const nextAgent = buildAgentTeamAccessRecord(currentAgent, teamId, true);
            setAgentAccessState({ teamId, action: "adding", error: "" });
            setDraftAgent(nextAgent);
            try {
              const { response, data } = await fetchJsonWithTimeout(
                backendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
                {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(buildAgentTeamSharePayload(nextAgent, team)),
                },
                8000
              );
              if (!response.ok && Number(response.status || 0) !== 409) {
                throw new Error(data?.message || data?.error || "Failed to add team access.");
              }
              await persistAgentRecordFromAction(nextAgent, "Failed to save agent team access.");
              setAgentAccessTeamMenuOpen(false);
            } catch (error) {
              setDraftAgent(currentAgent);
              setAgentAccessState({
                teamId: "",
                action: "",
                error: error instanceof Error ? error.message : "Failed to add team access.",
              });
              return;
            }
            setAgentAccessState({ teamId: "", action: "", error: "" });
          }

          async function handleRemoveAgentTeamsAccess(teams) {
            const requestedTeams = (Array.isArray(teams) ? teams : [teams])
              .filter((team) => team?.id && !isPlatformSystemAccessPrincipalId(team.id));
            if (!requestedTeams.length) return;
            const currentAgent = normalizePlaygroundAgentRecord(draftAgent || selectedAgentSnapshot || buildPlaygroundDefaultAgentDraft());
            let nextAgent = currentAgent;
            requestedTeams.forEach((team) => {
              nextAgent = buildAgentTeamAccessRecord(nextAgent, team.id, false);
            });
            setAgentAccessState({ teamId: "", action: "removing", error: "" });
            try {
              await Promise.all(requestedTeams.map(async (team) => {
                const share = await findAgentTeamResourceShare(team.id, currentAgent.id);
                if (!share?.id) return;
                const { response, data } = await fetchJsonWithTimeout(
                  backendUrl + "/teams/" + encodeURIComponent(team.id) + "/resource-shares/" + encodeURIComponent(share.id),
                  {
                    method: "DELETE",
                    credentials: "include",
                    cache: "no-store",
                    headers: requestHeaders,
                  },
                  8000
                );
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to remove team access.");
                }
              }));
              await persistAgentRecordFromAction(nextAgent, "Failed to save agent team access.");
              setSelectedAgentAccessTeamIds(new Set());
              if (requestedTeams.some((team) => String(team.id) === String(agentAccessPrincipalId))) {
                setAgentAccessPrincipalId("");
              }
            } catch (error) {
              setAgentAccessState({
                teamId: "",
                action: "",
                error: error instanceof Error ? error.message : "Failed to remove team access.",
              });
              return;
            }
            setAgentAccessState({ teamId: "", action: "", error: "" });
          }
  
          function handleAgentOwnerPopoverOpenChange(nextOpen) {
            if (nextOpen) {
              if (!draftAgent) {
                return;
              }
              requestAgentWorkspaceTeams();
            }
            setAgentOwnerPopoverOpen(Boolean(nextOpen));
          }
  
          function handleAgentOwnerSelect(ownerIdentity) {
            if (!draftAgent) {
              return;
            }
            setAgentOwnerPopoverOpen(false);
            const nextAgent = applyAgentOwnerIdentity(draftAgent, ownerIdentity);
            updateDraftAgent(nextAgent);
          }
  
          function openAgentSendToTeamModal(agentRecord = null, options = {}) {
            const targetAgentIds = Array.isArray(options?.agentIds)
              ? options.agentIds.map((agentId) => String(agentId || "").trim()).filter(Boolean)
              : [];
            const targetAgents = targetAgentIds.length > 0
              ? getAgentActionTargetsByIds(targetAgentIds)
              : normalizeAgentActionTargets([agentRecord || draftAgent]);
            if (targetAgents.length === 0) {
              return;
            }
            requestAgentWorkspaceTeams();
            if (agentSendTeamModalCloseTimerRef.current) {
              window.clearTimeout(agentSendTeamModalCloseTimerRef.current);
              agentSendTeamModalCloseTimerRef.current = null;
            }
            if (agentSendTeamModalFrameRef.current) {
              window.cancelAnimationFrame(agentSendTeamModalFrameRef.current);
              agentSendTeamModalFrameRef.current = null;
            }
            setAgentSendTeamError("");
            setAgentSendTeamTargetAgent(targetAgentIds.length > 0 ? null : targetAgents[0]);
            setAgentSendTeamTargetAgentIds(targetAgentIds.length > 0 ? targetAgents.map((agent) => agent.id) : []);
            setAgentSendTeamPickerValue(getDefaultAgentShareTeamIdForAgents(targetAgents) || defaultAgentShareTeamId);
            setAgentSendTeamModalVisible(false);
            setAgentSendTeamModalClosing(false);
            setAgentSendTeamModalOpen(true);
            agentSendTeamModalFrameRef.current = window.requestAnimationFrame(() => {
              agentSendTeamModalFrameRef.current = window.requestAnimationFrame(() => {
                agentSendTeamModalFrameRef.current = null;
                setAgentSendTeamModalVisible(true);
              });
            });
          }
  
          function finishCloseAgentSendToTeamModal() {
            if (agentSendTeamModalCloseTimerRef.current) {
              window.clearTimeout(agentSendTeamModalCloseTimerRef.current);
              agentSendTeamModalCloseTimerRef.current = null;
            }
            if (agentSendTeamModalFrameRef.current) {
              window.cancelAnimationFrame(agentSendTeamModalFrameRef.current);
              agentSendTeamModalFrameRef.current = null;
            }
            setAgentSendTeamModalVisible(false);
            setAgentSendTeamModalClosing(false);
            setAgentSendTeamModalOpen(false);
            setAgentSendTeamTargetAgent(null);
            setAgentSendTeamTargetAgentIds([]);
            setAgentSendTeamPickerValue("");
            setAgentSendTeamError("");
            setAgentSendTeamShareState({
              teamId: "",
              action: "",
              error: "",
            });
          }
  
          function closeAgentSendToTeamModal(options = {}) {
            if (!options.force && agentSendTeamShareState.action === "share") {
              return;
            }
            if (options?.animate === false || (!agentSendTeamModalOpen && !agentSendTeamModalVisible && !agentSendTeamModalClosing)) {
              finishCloseAgentSendToTeamModal();
              return;
            }
            if (agentSendTeamModalClosing) {
              return;
            }
            if (agentSendTeamModalFrameRef.current) {
              window.cancelAnimationFrame(agentSendTeamModalFrameRef.current);
              agentSendTeamModalFrameRef.current = null;
            }
            setAgentSendTeamModalVisible(false);
            setAgentSendTeamModalClosing(true);
            if (agentSendTeamModalCloseTimerRef.current) {
              window.clearTimeout(agentSendTeamModalCloseTimerRef.current);
            }
            agentSendTeamModalCloseTimerRef.current = window.setTimeout(() => {
              agentSendTeamModalCloseTimerRef.current = null;
              finishCloseAgentSendToTeamModal();
            }, 75);
          }
  
          function openAgentAddToSquadModal(agentRecord = null, options = {}) {
            const targetAgentIds = Array.isArray(options?.agentIds)
              ? options.agentIds.map((agentId) => String(agentId || "").trim()).filter(Boolean)
              : [];
            const targetAgents = (targetAgentIds.length > 0
              ? getAgentActionTargetsByIds(targetAgentIds)
              : normalizeAgentActionTargets([agentRecord])
            ).filter((agent) => !isPlaygroundTeamAgent(agent));
            if (targetAgents.length === 0) {
              return;
            }
            if (agentAddSquadModalCloseTimerRef.current) {
              window.clearTimeout(agentAddSquadModalCloseTimerRef.current);
              agentAddSquadModalCloseTimerRef.current = null;
            }
            if (agentAddSquadModalFrameRef.current) {
              window.cancelAnimationFrame(agentAddSquadModalFrameRef.current);
              agentAddSquadModalFrameRef.current = null;
            }
            setAgentAddSquadError("");
            setAgentAddSquadTargetAgent(targetAgentIds.length > 0 ? null : targetAgents[0]);
            setAgentAddSquadTargetAgentIds(targetAgentIds.length > 0 ? targetAgents.map((agent) => agent.id) : []);
            setAgentAddSquadPickerValue(getDefaultAgentSquadIdForAgent(targetAgents));
            setAgentAddSquadModalVisible(false);
            setAgentAddSquadModalClosing(false);
            setAgentAddSquadModalOpen(true);
            agentAddSquadModalFrameRef.current = window.requestAnimationFrame(() => {
              agentAddSquadModalFrameRef.current = window.requestAnimationFrame(() => {
                agentAddSquadModalFrameRef.current = null;
                setAgentAddSquadModalVisible(true);
              });
            });
          }
  
          function finishCloseAgentAddSquadModal() {
            if (agentAddSquadModalCloseTimerRef.current) {
              window.clearTimeout(agentAddSquadModalCloseTimerRef.current);
              agentAddSquadModalCloseTimerRef.current = null;
            }
            if (agentAddSquadModalFrameRef.current) {
              window.cancelAnimationFrame(agentAddSquadModalFrameRef.current);
              agentAddSquadModalFrameRef.current = null;
            }
            setAgentAddSquadModalVisible(false);
            setAgentAddSquadModalClosing(false);
            setAgentAddSquadModalOpen(false);
            setAgentAddSquadTargetAgent(null);
            setAgentAddSquadTargetAgentIds([]);
            setAgentAddSquadPickerValue("");
            setAgentAddSquadError("");
            setAgentAddSquadState({
              squadId: "",
              action: "",
              error: "",
            });
          }
  
          function closeAgentAddSquadModal(options = {}) {
            if (!options.force && agentAddSquadState.action === "add") {
              return;
            }
            if (options?.animate === false || (!agentAddSquadModalOpen && !agentAddSquadModalVisible && !agentAddSquadModalClosing)) {
              finishCloseAgentAddSquadModal();
              return;
            }
            if (agentAddSquadModalClosing) {
              return;
            }
            if (agentAddSquadModalFrameRef.current) {
              window.cancelAnimationFrame(agentAddSquadModalFrameRef.current);
              agentAddSquadModalFrameRef.current = null;
            }
            setAgentAddSquadModalVisible(false);
            setAgentAddSquadModalClosing(true);
            if (agentAddSquadModalCloseTimerRef.current) {
              window.clearTimeout(agentAddSquadModalCloseTimerRef.current);
            }
            agentAddSquadModalCloseTimerRef.current = window.setTimeout(() => {
              agentAddSquadModalCloseTimerRef.current = null;
              finishCloseAgentAddSquadModal();
            }, 75);
          }
  
          function openAgentApiModal() {
            if (!draftAgent?.id || draftAgent.id === PLAYGROUND_AGENT_DRAFT_ID) {
              return;
            }
            if (agentApiModalCloseTimerRef.current) {
              window.clearTimeout(agentApiModalCloseTimerRef.current);
              agentApiModalCloseTimerRef.current = null;
            }
            if (agentApiModalFrameRef.current) {
              window.cancelAnimationFrame(agentApiModalFrameRef.current);
              agentApiModalFrameRef.current = null;
            }
            setCopiedAgentApiSnippet("");
            setAgentApiEnvironmentId((current) => {
              const normalizedCurrent = String(current || "").trim();
              return normalizedCurrent && orderedAgentApiEnvironments.some((environment) => String(environment?.id || "").trim() === normalizedCurrent)
                ? normalizedCurrent
                : agentApiDefaultEnvironmentId;
            });
            setAgentApiModalVisible(false);
            setAgentApiModalClosing(false);
            setAgentApiModalOpen(true);
            agentApiModalFrameRef.current = window.requestAnimationFrame(() => {
              agentApiModalFrameRef.current = window.requestAnimationFrame(() => {
                agentApiModalFrameRef.current = null;
                setAgentApiModalVisible(true);
              });
            });
          }
  
          function finishCloseAgentApiModal() {
            if (agentApiModalCloseTimerRef.current) {
              window.clearTimeout(agentApiModalCloseTimerRef.current);
              agentApiModalCloseTimerRef.current = null;
            }
            if (agentApiModalFrameRef.current) {
              window.cancelAnimationFrame(agentApiModalFrameRef.current);
              agentApiModalFrameRef.current = null;
            }
            setAgentApiModalVisible(false);
            setAgentApiModalClosing(false);
            setAgentApiModalOpen(false);
            setCopiedAgentApiSnippet("");
            setAgentModelPopover("");
          }
  
          function closeAgentApiModal(options = {}) {
            if (options?.animate === false || (!agentApiModalOpen && !agentApiModalVisible && !agentApiModalClosing)) {
              finishCloseAgentApiModal();
              return;
            }
            if (agentApiModalClosing) {
              return;
            }
            if (agentApiModalFrameRef.current) {
              window.cancelAnimationFrame(agentApiModalFrameRef.current);
              agentApiModalFrameRef.current = null;
            }
            setAgentApiModalVisible(false);
            setAgentApiModalClosing(true);
            if (agentApiModalCloseTimerRef.current) {
              window.clearTimeout(agentApiModalCloseTimerRef.current);
            }
            agentApiModalCloseTimerRef.current = window.setTimeout(() => {
              agentApiModalCloseTimerRef.current = null;
              finishCloseAgentApiModal();
            }, 75);
          }
  
          function buildAgentApiSnippets(agentRecord = draftAgent, environmentId = agentApiEnvironmentId) {
            const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord || buildPlaygroundDefaultAgentDraft());
            const apiOrigin = ${JSON.stringify(defaultUpstreamOrigin)};
            const agentId = String(normalizedAgent.id || "agent_id").trim() || "agent_id";
            const normalizedEnvironmentId = String(environmentId || agentApiDefaultEnvironmentId || "computer_id").trim() || "computer_id";
            const payload = {
              title: "Run " + (normalizedAgent.name || "Agent"),
              messages: [
                {
                  role: "user",
                  content: "Use this agent and computer to inspect the project and summarize the current state.",
                },
              ],
              agentId,
              environmentId: normalizedEnvironmentId,
            };
            const payloadJson = JSON.stringify(payload, null, 2);
            return {
              curl: [
                "curl -sS -X POST '" + apiOrigin + "/threads' \\",
                "  -H \"Authorization: Bearer $COMPUTER_AGENTS_API_KEY\" \\",
                "  -H 'Content-Type: application/json' \\",
                "  --data '" + payloadJson.replace(/'/g, "'\\''") + "'",
              ].join("\n"),
              python: [
                "import os",
                "import requests",
                "",
                "api_key = os.environ['COMPUTER_AGENTS_API_KEY']",
                "response = requests.post(",
                "    '" + apiOrigin + "/threads',",
                "    headers={",
                "        'Authorization': f'Bearer {api_key}',",
                "        'Content-Type': 'application/json',",
                "    },",
                "    json=" + JSON.stringify(payload, null, 4).replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None") + ",",
                ")",
                "response.raise_for_status()",
                "print(response.json())",
              ].join("\n"),
              javascript: [
                "const apiKey = process.env.COMPUTER_AGENTS_API_KEY;",
                "",
                "const response = await fetch('" + apiOrigin + "/threads', {",
                "  method: 'POST',",
                "  headers: {",
                "    Authorization: 'Bearer ' + apiKey,",
                "    'Content-Type': 'application/json',",
                "  },",
                "  body: JSON.stringify(" + payloadJson.replace(/\n/g, "\n  ") + "),",
                "});",
                "",
                "if (!response.ok) {",
                "  throw new Error(await response.text());",
                "}",
                "",
                "console.log(await response.json());",
              ].join("\n"),
            };
          }
  
          async function copyAgentApiSnippet(snippetKey, snippetValue) {
            try {
              await navigator.clipboard?.writeText(String(snippetValue || ""));
              setCopiedAgentApiSnippet(snippetKey);
              window.setTimeout(() => {
                setCopiedAgentApiSnippet((current) => current === snippetKey ? "" : current);
              }, 1400);
            } catch {
              setCopiedAgentApiSnippet("");
            }
          }
  
          async function handleAgentSendToTeamSubmit(event) {
            event.preventDefault();
            const targetAgents = agentSendTeamTargetAgentIds.length > 0
              ? getAgentActionTargetsByIds(agentSendTeamTargetAgentIds)
              : normalizeAgentActionTargets([agentSendTeamTargetAgent || draftAgent]);
            if (targetAgents.length === 0) {
              setAgentSendTeamError("Save this agent before sharing it with a team.");
              return;
            }
            const normalizedTeamId = String(agentSendTeamPickerValue || "").trim();
            if (!normalizedTeamId) {
              setAgentSendTeamError("Choose a team first.");
              return;
            }
            const shareTargets = targetAgents.filter((agent) => !getAgentSharedTeamIds(agent).includes(normalizedTeamId));
            if (shareTargets.length === 0) {
              setAgentSendTeamError(targetAgents.length > 1 ? "These agents are already shared with that team." : "This agent is already shared with that team.");
              return;
            }
            const selectedTeam = availableAgentShareTeams.find((team) => team.id === normalizedTeamId) || null;
            if (!selectedTeam) {
              setAgentSendTeamError("Choose a team you can manage.");
              return;
            }
            setAgentSendTeamError("");
            setAgentSendTeamShareState({
              teamId: normalizedTeamId,
              action: "share",
              error: "",
            });
            try {
              for (const targetAgent of shareTargets) {
                const payload = buildAgentTeamSharePayload(targetAgent, selectedTeam);
                const { response, data } = await fetchJsonWithTimeout(backendUrl + "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares", {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                }, 8000);
                if (!response.ok && Number(response.status || 0) !== 409) {
                  throw new Error(data?.message || data?.error || "Failed to share agent with team.");
                }
                const nextAgent = applyAgentSharedTeam(targetAgent, normalizedTeamId);
                await persistAgentRecordFromAction(nextAgent, "Agent was shared, but local sharing metadata could not be saved.");
              }
              requestAgentWorkspaceTeams({
                selectedTeamId: normalizedTeamId,
                teamId: normalizedTeamId,
              });
              closeAgentSendToTeamModal({ force: true });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to share agent with team.";
              setAgentSendTeamError(message);
              setAgentSendTeamShareState({
                teamId: normalizedTeamId,
                action: "",
                error: message,
              });
            }
          }
  
          async function handleAgentAddToSquadSubmit(event) {
            event.preventDefault();
            const targetAgents = (agentAddSquadTargetAgentIds.length > 0
              ? getAgentActionTargetsByIds(agentAddSquadTargetAgentIds)
              : normalizeAgentActionTargets([agentAddSquadTargetAgent])
            ).filter((agent) => !isPlaygroundTeamAgent(agent));
            if (targetAgents.length === 0) {
              setAgentAddSquadError("Choose a saved agent before adding it to a squad.");
              return;
            }
            const normalizedSquadId = String(agentAddSquadPickerValue || "").trim();
            if (!normalizedSquadId) {
              setAgentAddSquadError("Choose a squad first.");
              return;
            }
            const selectedSquad = normalizeAgentActionTarget({ id: normalizedSquadId }) || availableAgentSquads.find((squad) => squad.id === normalizedSquadId) || null;
            if (!selectedSquad || !isPlaygroundTeamAgent(selectedSquad)) {
              setAgentAddSquadError("Choose an existing squad.");
              return;
            }
            if (selectedSquad.isDefault || selectedSquad.isSystem) {
              setAgentAddSquadError("System squads cannot be edited.");
              return;
            }
            const targetIds = targetAgents.map((agent) => String(agent.id || "").trim()).filter(Boolean);
            const orchestratorId = String(selectedSquad.teamOrchestratorAgentId || "").trim();
            const currentSubagentIds = dedupePlaygroundAgentIds(selectedSquad.teamSubagentIds).filter((agentId) => agentId !== orchestratorId);
            const addableTargetIds = targetIds.filter((targetId) => orchestratorId !== targetId && !currentSubagentIds.includes(targetId));
            if (addableTargetIds.length === 0 && targetIds.some((targetId) => orchestratorId === targetId)) {
              setAgentAddSquadError(targetIds.length > 1 ? "These agents are already in that squad or one is the orchestrator." : "This agent is already the orchestrator for that squad.");
              return;
            }
            if (addableTargetIds.length === 0) {
              setAgentAddSquadError(targetIds.length > 1 ? "These agents are already in that squad." : "This agent is already in that squad.");
              return;
            }
            const nextSubagentIds = dedupePlaygroundAgentIds([...currentSubagentIds, ...addableTargetIds]);
            const selectedSquadMetadata = {
              ...getAgentMetadataRecord(selectedSquad),
            };
            selectedSquadMetadata.kind = "team";
            selectedSquadMetadata.executionMode = PLAYGROUND_AGENT_TEAM_EXECUTION_MODE;
            selectedSquadMetadata.team = {
              ...(selectedSquadMetadata.team && typeof selectedSquadMetadata.team === "object" && !Array.isArray(selectedSquadMetadata.team) ? selectedSquadMetadata.team : {}),
              version: 1,
              orchestratorAgentId,
              subagentIds: nextSubagentIds,
            };
            const nextSquad = normalizePlaygroundAgentRecord({
              ...selectedSquad,
              agentType: "team",
              teamExecutionMode: PLAYGROUND_AGENT_TEAM_EXECUTION_MODE,
              teamSubagentIds: nextSubagentIds,
              metadata: selectedSquadMetadata,
            });
            setAgentAddSquadError("");
            setAgentAddSquadState({
              squadId: normalizedSquadId,
              action: "add",
              error: "",
            });
            try {
              await persistAgentRecordFromAction(nextSquad, "Failed to add agent to squad.");
              closeAgentAddSquadModal({ force: true });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to add agent to squad.";
              setAgentAddSquadError(message);
              setAgentAddSquadState({
                squadId: normalizedSquadId,
                action: "",
                error: message,
              });
            }
          }
  
          function openAgentRenameDialog(agent) {
            if (!agent?.id || agent.id === PLAYGROUND_AGENT_DRAFT_ID || agent.isSystem) {
              return;
            }
            setAgentActionsPopoverOpen(false);
            setAgentRenameState({
              agentId: agent.id,
              originalName: String(agent.name || "").trim(),
            });
            setAgentRenameValue(String(agent.name || ""));
            setAgentRenameError("");
          }
  
          function buildPlaygroundAgentPersistedMetadata(agent) {
            const agentType = agent?.agentType === "team" ? "team" : "single";
            const currentMetadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata)
              ? { ...agent.metadata }
              : {};
            const profileMetadata = buildPlaygroundAgentProfileMetadata(agent);
            const guardrailBundle = buildPlaygroundAgentGuardrailBundle(agent, guardrailSets);
            const guardrailSetIds = guardrailBundle.guardrailSetIds;
            if (guardrailSetIds.length > 0) {
              currentMetadata.guardrailSetIds = guardrailSetIds;
              currentMetadata.guardrail_set_ids = guardrailSetIds;
              currentMetadata.guardrails = guardrailBundle.guardrails;
              currentMetadata.promptAdaptations = guardrailBundle.promptAdaptations;
              currentMetadata.prompt_adaptations = guardrailBundle.promptAdaptations;
              currentMetadata.promptAdaptions = guardrailBundle.promptAdaptations;
              currentMetadata.prompt_adaptions = guardrailBundle.promptAdaptations;
              currentMetadata.invisiblePromptAdaptations = guardrailBundle.promptAdaptations;
              currentMetadata.invisible_prompt_adaptations = guardrailBundle.promptAdaptations;
              currentMetadata.invisiblePromptAdaptions = guardrailBundle.promptAdaptations;
              currentMetadata.invisible_prompt_adaptions = guardrailBundle.promptAdaptations;
              currentMetadata.runnerGuardrails = {
                version: 1,
                guardrailSetIds,
                guardrails: guardrailBundle.guardrails,
                promptAdaptations: guardrailBundle.promptAdaptations,
              };
            } else {
              delete currentMetadata.guardrailSetIds;
              delete currentMetadata.guardrail_set_ids;
              delete currentMetadata.guardrails;
              delete currentMetadata.promptAdaptations;
              delete currentMetadata.prompt_adaptations;
              delete currentMetadata.promptAdaptions;
              delete currentMetadata.prompt_adaptions;
              delete currentMetadata.invisiblePromptAdaptations;
              delete currentMetadata.invisible_prompt_adaptations;
              delete currentMetadata.invisiblePromptAdaptions;
              delete currentMetadata.invisible_prompt_adaptions;
              delete currentMetadata.runnerGuardrails;
            }
            if (agentType !== "team") {
              delete currentMetadata.kind;
              delete currentMetadata.executionMode;
              delete currentMetadata.team;
              if (profileMetadata) {
                currentMetadata.profile = profileMetadata;
              } else {
                delete currentMetadata.profile;
              }
              return Object.keys(currentMetadata).length > 0 ? currentMetadata : null;
            }
  
            currentMetadata.kind = "team";
            currentMetadata.executionMode = PLAYGROUND_AGENT_TEAM_EXECUTION_MODE;
            currentMetadata.team = {
              version: 1,
              orchestratorAgentId: String(agent?.teamOrchestratorAgentId || "").trim(),
              subagentIds: dedupePlaygroundAgentIds(agent?.teamSubagentIds).filter((value) => value !== String(agent?.teamOrchestratorAgentId || "").trim()),
            };
            if (profileMetadata) {
              currentMetadata.profile = profileMetadata;
            } else {
              delete currentMetadata.profile;
            }
            return currentMetadata;
          }
  
          function buildSanitizedAgentPayload(agent) {
            const metadata = buildPlaygroundAgentPersistedMetadata(agent);
            const isTeamAgent = agent?.agentType === "team";
            const orchestratorAgentId = metadata?.team?.orchestratorAgentId || "";
            const orchestratorAgent = orchestratorAgentId ? availableTeamMemberAgentsById[orchestratorAgentId] : null;
            const guardrailBundle = buildPlaygroundAgentGuardrailBundle(agent, guardrailSets);
            const voicePayload = buildPlaygroundVoiceAgentUpdatePayload(agent);
  
            return {
              name: String(agent?.name || "").trim() || (isTeamAgent ? "New Squad" : "New Agent"),
              model: getPlaygroundAgentModelMeta(
                typeof orchestratorAgent?.model === "string" && orchestratorAgent.model
                  ? orchestratorAgent.model
                  : typeof agent?.model === "string"
                    ? agent.model
                    : ""
              , resolvedAgentModelOptions).id,
              instructions: typeof agent?.instructions === "string" ? agent.instructions : "",
              binary: typeof orchestratorAgent?.binary === "string" && orchestratorAgent.binary.trim()
                ? orchestratorAgent.binary
                : typeof agent?.binary === "string" && agent.binary.trim()
                  ? agent.binary
                  : "Claude Code CLI",
              reasoningEffort: ["minimal", "low", "medium", "high"].includes(orchestratorAgent?.reasoningEffort)
                ? orchestratorAgent.reasoningEffort
                : ["minimal", "low", "medium", "high"].includes(agent?.reasoningEffort)
                  ? agent.reasoningEffort
                  : "medium",
              enabledSkills: isTeamAgent
                ? []
                : (Array.isArray(agent?.enabledSkills) ? agent.enabledSkills : []).map((value) => String(value || "").trim()).filter(Boolean),
              deepResearchModel: !isTeamAgent && PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.some((option) => option.id === agent?.deepResearchModel)
                ? agent.deepResearchModel
                : null,
              permissionSet: normalizePlaygroundPermissionSet(agent?.permissionSet, "agent"),
              guardrailSetIds: guardrailBundle.guardrailSetIds,
              guardrail_set_ids: guardrailBundle.guardrailSetIds,
              guardrails: guardrailBundle.guardrails,
              promptAdaptations: guardrailBundle.promptAdaptations,
              prompt_adaptations: guardrailBundle.promptAdaptations,
              promptAdaptions: guardrailBundle.promptAdaptations,
              prompt_adaptions: guardrailBundle.promptAdaptations,
              invisiblePromptAdaptations: guardrailBundle.promptAdaptations,
              invisible_prompt_adaptations: guardrailBundle.promptAdaptations,
              invisiblePromptAdaptions: guardrailBundle.promptAdaptations,
              invisible_prompt_adaptions: guardrailBundle.promptAdaptations,
              ...voicePayload,
              metadata,
            };
          }
  
          async function persistAgentRecord(agentRecord) {
            if (!agentRecord) {
              throw new Error("Agent save failed.");
            }
  
            const payload = buildSanitizedAgentPayload(agentRecord);
            if (agentRecord.agentType === "team") {
              const orchestratorAgentId = String(payload?.metadata?.team?.orchestratorAgentId || "").trim();
              const subagentIds = Array.isArray(payload?.metadata?.team?.subagentIds)
                ? payload.metadata.team.subagentIds
                : [];
  
              if (!orchestratorAgentId) {
                throw new Error("Choose an orchestrator agent for the squad.");
              }
  
              if (subagentIds.length === 0) {
                throw new Error("Select at least one fixed subagent for the squad.");
              }
            }
            if (!payload.enabledSkills.includes("deep_research")) {
              payload.deepResearchModel = null;
            }
  
            const isCreating = agentRecord.id === PLAYGROUND_AGENT_DRAFT_ID || !agentRecord.id;
            if (isCreating && !canCreateAgentOnCurrentPlan()) {
              throw new Error("Upgrade to Builder to create custom agents and squads.");
            }
            const response = await fetch(
              isCreating
                ? backendUrl + "/agents"
                : backendUrl + "/agents/" + encodeURIComponent(agentRecord.id),
              {
                method: isCreating ? "POST" : "PATCH",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              },
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              if (data?.code === "AGENT_PLAN_REQUIRED") {
                openAgentUpgradeModal();
              }
              throw new Error(data?.message || data?.error || "Failed to save agent.");
            }
  
            const requestedGuardrailBundle = buildPlaygroundAgentGuardrailBundle(agentRecord, guardrailSets);
            const requestedGuardrailSetIds = requestedGuardrailBundle.guardrailSetIds;
            const responseAgent = getPlaygroundAgentResponseRecord(data) || normalizePlaygroundAgentRecord({
              ...agentRecord,
              ...payload,
              updatedAt: new Date().toISOString(),
            });
            const responseMetadata = {
              ...getAgentMetadataRecord(responseAgent),
            };
            if (requestedGuardrailSetIds.length > 0) {
              responseMetadata.guardrailSetIds = requestedGuardrailSetIds;
              responseMetadata.guardrail_set_ids = requestedGuardrailSetIds;
              responseMetadata.guardrails = requestedGuardrailBundle.guardrails;
              responseMetadata.promptAdaptations = requestedGuardrailBundle.promptAdaptations;
              responseMetadata.prompt_adaptations = requestedGuardrailBundle.promptAdaptations;
              responseMetadata.promptAdaptions = requestedGuardrailBundle.promptAdaptations;
              responseMetadata.prompt_adaptions = requestedGuardrailBundle.promptAdaptations;
              responseMetadata.invisiblePromptAdaptations = requestedGuardrailBundle.promptAdaptations;
              responseMetadata.invisible_prompt_adaptations = requestedGuardrailBundle.promptAdaptations;
              responseMetadata.invisiblePromptAdaptions = requestedGuardrailBundle.promptAdaptations;
              responseMetadata.invisible_prompt_adaptions = requestedGuardrailBundle.promptAdaptations;
              responseMetadata.runnerGuardrails = {
                version: 1,
                guardrailSetIds: requestedGuardrailSetIds,
                guardrails: requestedGuardrailBundle.guardrails,
                promptAdaptations: requestedGuardrailBundle.promptAdaptations,
              };
            } else {
              delete responseMetadata.guardrailSetIds;
              delete responseMetadata.guardrail_set_ids;
              delete responseMetadata.guardrails;
              delete responseMetadata.promptAdaptations;
              delete responseMetadata.prompt_adaptations;
              delete responseMetadata.promptAdaptions;
              delete responseMetadata.prompt_adaptions;
              delete responseMetadata.invisiblePromptAdaptations;
              delete responseMetadata.invisible_prompt_adaptations;
              delete responseMetadata.invisiblePromptAdaptions;
              delete responseMetadata.invisible_prompt_adaptions;
              delete responseMetadata.runnerGuardrails;
            }
            const savedAgent = normalizePlaygroundAgentRecord({
              ...responseAgent,
              guardrailSetIds: requestedGuardrailSetIds,
              guardrails: requestedGuardrailBundle.guardrails,
              promptAdaptations: requestedGuardrailBundle.promptAdaptations,
              invisiblePromptAdaptations: requestedGuardrailBundle.promptAdaptations,
              metadata: Object.keys(responseMetadata).length > 0 ? responseMetadata : null,
            });
            if (!savedAgent?.id) {
              throw new Error("Agent save failed.");
            }
  
            return savedAgent;
          }
  
          async function persistAgentRecordFromAction(agentRecord, fallbackMessage = "Failed to save agent.") {
            const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord || buildPlaygroundDefaultAgentDraft());
            if (!normalizedAgent?.id || normalizedAgent.id === PLAYGROUND_AGENT_DRAFT_ID) {
              throw new Error(fallbackMessage);
            }
            const previousAgent = getKnownAgentById(normalizedAgent.id);
            setAgentDetailsById((current) => ({
              ...current,
              [normalizedAgent.id]: normalizedAgent,
            }));
            if (draftAgent?.id === normalizedAgent.id) {
              setDraftAgent(normalizedAgent);
            }
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
            try {
              const savedAgent = await persistAgentRecord(normalizedAgent);
              const mergedSavedAgent = normalizePlaygroundAgentRecord({
                ...normalizedAgent,
                ...savedAgent,
                metadata: {
                  ...getAgentMetadataRecord(normalizedAgent),
                  ...getAgentMetadataRecord(savedAgent),
                },
              });
              setAgentDetailsById((current) => ({
                ...current,
                [mergedSavedAgent.id]: mergedSavedAgent,
              }));
              if (draftAgent?.id === mergedSavedAgent.id) {
                setDraftAgent(mergedSavedAgent);
                rememberAgentVersionBaseline(mergedSavedAgent, { force: true });
              }
              setSaveState({
                isSaving: false,
                error: "",
                message: "Saved",
              });
              if (onAgentMutated) {
                await onAgentMutated();
              }
              return mergedSavedAgent;
            } catch (error) {
              if (previousAgent?.id) {
                setAgentDetailsById((current) => ({
                  ...current,
                  [previousAgent.id]: previousAgent,
                }));
                if (draftAgent?.id === previousAgent.id) {
                  setDraftAgent(previousAgent);
                }
              }
              setSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : fallbackMessage,
                message: "",
              });
              throw error;
            }
          }
  
          function clearAgentAutosaveQueue() {
            if (agentAutosaveTimerRef.current) {
              window.clearTimeout(agentAutosaveTimerRef.current);
              agentAutosaveTimerRef.current = 0;
            }
            agentAutosaveQueuedRef.current = null;
          }
  
          async function handleAgentComposerSubmit(event) {
            event.preventDefault();
            const composerDraft = normalizePlaygroundAgentRecord(agentComposerDraft || buildPlaygroundDefaultAgentDraft());
            const nextName = String(composerDraft.name || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setAgentComposerSaveState({
                isSaving: false,
                error: composerDraft.agentType === "team" ? "Squad name is required." : "Agent name is required.",
              });
              return;
            }
  
            setAgentComposerSaveState({
              isSaving: true,
              error: "",
            });
  
            try {
              const creationDraft = normalizePlaygroundAgentRecord({
                ...composerDraft,
                name: nextName,
              });
              const initialVersion = createPlaygroundAgentVersion(creationDraft, [], { status: "active", actor: getAgentVersionActor() });
              const versionedCreationDraft = createPlaygroundAgentWithVersionList(creationDraft, [initialVersion], initialVersion.id);
              const versionedCreationCommitDraft = prepareAgentVersionedRecordForCommit(versionedCreationDraft, {
                operation: "initialize",
                actor: getAgentVersionActor(),
              });
              const persistedAgent = await persistAgentRecord(versionedCreationCommitDraft);
              const savedAgent = readPlaygroundAgentVersions(persistedAgent).length > 0
                ? persistedAgent
                : normalizePlaygroundAgentRecord({
                    ...versionedCreationCommitDraft,
                    ...persistedAgent,
                    metadata: getAgentMetadataRecord(versionedCreationCommitDraft),
                    publishedAt: versionedCreationCommitDraft.publishedAt || persistedAgent.publishedAt || "",
                  });
              setAgentDetailsById((current) => ({
                ...current,
                [savedAgent.id]: savedAgent,
              }));
              setSelectedAgentId(savedAgent.id);
              setAgentListMode(getPlaygroundAgentListMode(savedAgent));
              setDraftAgent(savedAgent);
              setAgentComposerOpen(false);
              setAgentComposerDraft(buildPlaygroundDefaultAgentDraft());
              setAgentComposerSaveState({
                isSaving: false,
                error: "",
              });
              setIsAgentComposerInstructionsEditing(false);
              setAgentComposerModelPopover("");
              if (onAgentMutated) {
                await onAgentMutated();
              }
            } catch (error) {
              setAgentComposerSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to create agent.",
              });
            }
          }
  
          async function handleAgentRenameSubmit(event) {
            event.preventDefault();
            if (!agentRenameState?.agentId) {
              return;
            }
  
            const nextName = String(agentRenameValue || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setAgentRenameError("Agent name cannot be empty.");
              return;
            }
  
            if (nextName === agentRenameState.originalName) {
              closeAgentRenameDialog();
              return;
            }
  
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
            setAgentRenameError("");
  
            try {
              const response = await fetch(backendUrl + "/agents/" + encodeURIComponent(agentRenameState.agentId), {
                method: "PATCH",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: nextName }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to rename agent.");
              }
              const targetAgent = agentDetailsById[agentRenameState.agentId]
                || orderedAgents.find((agent) => agent.id === agentRenameState.agentId)
                || selectedAgentSnapshot
                || draftAgent
                || {};
              const responseAgent = data?.agent || data?.data || data;
              const savedAgent = normalizePlaygroundAgentRecord({
                ...targetAgent,
                ...(responseAgent && typeof responseAgent === "object" && !Array.isArray(responseAgent) ? responseAgent : {}),
                id: agentRenameState.agentId,
                name: String(responseAgent?.name || nextName),
                updatedAt: responseAgent?.updatedAt || new Date().toISOString(),
              });
              setAgentDetailsById((current) => ({
                ...current,
                [savedAgent.id]: savedAgent,
              }));
              setDraftAgent((current) => current && current.id === savedAgent.id
                ? normalizePlaygroundAgentRecord({
                    ...current,
                    name: savedAgent.name,
                    updatedAt: savedAgent.updatedAt,
                    isDefault: savedAgent.isDefault,
                    isSystem: savedAgent.isSystem,
                  })
                : savedAgent
              );
              setSaveState({
                isSaving: false,
                error: "",
                message: "Saved",
              });
              closeAgentRenameDialog();
              if (onAgentMutated) {
                await onAgentMutated();
              }
            } catch (error) {
              setAgentRenameError(error instanceof Error ? error.message : "Failed to rename agent.");
              setSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
            }
          }
  
          async function handleDeleteAgent(agentId) {
            if (!agentId || agentId === PLAYGROUND_AGENT_DRAFT_ID) {
              handleCreateAgent();
              return;
            }
  
            if (!window.confirm("Delete this agent?")) {
              return;
            }
  
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              const response = await fetch(backendUrl + "/agents/" + encodeURIComponent(agentId), {
                method: "DELETE",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete agent.");
              }
  
              setAgentDetailsById((current) => {
                const next = { ...current };
                delete next[agentId];
                return next;
              });
              setSelectedOverviewAgentIds((current) => {
                const next = new Set(current || []);
                next.delete(agentId);
                return next;
              });
              setDraftAgent(null);
              setSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
              if (selectedAgentId === agentId) {
                setSelectedAgentId("");
              }
              if (onAgentMutated) {
                await onAgentMutated();
              }
            } catch (error) {
              setSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to delete agent.",
                message: "",
              });
            }
          }
  
          async function handleDeleteAgents(agentRecords = []) {
            const deleteTargets = normalizeAgentActionTargets(agentRecords)
              .filter((agent) => agent?.id && agent.id !== PLAYGROUND_AGENT_DRAFT_ID && !agent.isDefault && !agent.isSystem);
            if (deleteTargets.length === 0) {
              return;
            }
            const confirmLabel = deleteTargets.length === 1
              ? "Delete this agent?"
              : "Delete " + deleteTargets.length + " selected agents?";
            if (!window.confirm(confirmLabel)) {
              return;
            }
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
            try {
              for (const agent of deleteTargets) {
                const response = await fetch(backendUrl + "/agents/" + encodeURIComponent(agent.id), {
                  method: "DELETE",
                  headers: requestHeaders,
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to delete selected agents.");
                }
              }
              const deletedIds = new Set(deleteTargets.map((agent) => String(agent.id || "").trim()).filter(Boolean));
              setAgentDetailsById((current) => {
                const next = { ...current };
                deletedIds.forEach((agentId) => {
                  delete next[agentId];
                });
                return next;
              });
              setSelectedOverviewAgentIds((current) => {
                const next = new Set(current || []);
                deletedIds.forEach((agentId) => next.delete(agentId));
                return next;
              });
              if (draftAgent?.id && deletedIds.has(draftAgent.id)) {
                setDraftAgent(null);
              }
              if (selectedAgentId && deletedIds.has(selectedAgentId)) {
                setSelectedAgentId("");
              }
              setSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
              if (onAgentMutated) {
                await onAgentMutated();
              }
            } catch (error) {
              setSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to delete selected agents.",
                message: "",
              });
            }
          }
  
          function formatAgentVersionTimestamp(value) {
            if (!value) return "Not published yet";
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "Not published yet";
            return date.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
  
          function getAgentVersionActor() {
            return normalizePlaygroundVersionActor({
              id: currentUserId || currentUserEmail || "local-user",
              name: currentUserName || currentUserEmail || "User",
              email: currentUserEmail,
              avatarUrl: currentUserAvatarUrl,
            });
          }
  
          function getAgentVersionActorLabel(actor) {
            const normalizedActor = normalizePlaygroundVersionActor(actor);
            if (!normalizedActor) {
              return "";
            }
            return String(normalizedActor.name || normalizedActor.email || normalizedActor.id || "").trim();
          }
  
          function getAgentVersioningMetadata(agentRecord) {
            const metadata = getAgentMetadataRecord(agentRecord);
            const versioning = metadata.runnerVersioning || metadata.runner_versioning || metadata.versioning || {};
            return versioning && typeof versioning === "object" && !Array.isArray(versioning) ? versioning : {};
          }
  
          function getAgentVersioningRevisionId(agentRecord) {
            const versioning = getAgentVersioningMetadata(agentRecord);
            return String(versioning.revisionId || versioning.revision_id || "").trim();
          }
  
          function getAgentVersioningRevisionNumber(agentRecord) {
            const versioning = getAgentVersioningMetadata(agentRecord);
            return Number(versioning.revisionNumber || versioning.revision_number || 0) || 0;
          }
  
          function getAgentVersionLifecycleLabel(version) {
            const lifecycleState = normalizePlaygroundAgentVersionLifecycleState(version, version?.status);
            if (lifecycleState === "published") return "Published";
            if (lifecycleState === "deprecated") return "Superseded";
            if (lifecycleState === "unpublished") return "Unpublished";
            if (lifecycleState === "archived") return "Archived";
            if (lifecycleState === "draft") return "Draft";
            return "Saved";
          }
  
          function buildAgentVersioningMetadata(agentRecord, options = {}) {
            const now = new Date().toISOString();
            const metadata = getAgentMetadataRecord(agentRecord);
            const currentVersioning = getAgentVersioningMetadata(agentRecord);
            const actor = normalizePlaygroundVersionActor(options.actor) || getAgentVersionActor();
            const operation = String(options.operation || "save-current").trim() || "save-current";
            const activeVersion = getDraftAgentActiveVersion(agentRecord);
            const selectedVersion = getDraftAgentSelectedVersion(agentRecord);
            const previousRevisionId = String(
              currentVersioning.revisionId
              || currentVersioning.revision_id
              || getAgentVersioningRevisionId(draftAgent)
              || getAgentVersioningRevisionId(selectedAgentSnapshot)
              || ""
            ).trim();
            const nextRevisionNumber = Math.max(
              getAgentVersioningRevisionNumber(agentRecord),
              getAgentVersioningRevisionNumber(draftAgent),
              getAgentVersioningRevisionNumber(selectedAgentSnapshot)
            ) + 1;
            const nextRevisionId = createPlaygroundAgentVersionRevisionId();
            const isPublishOperation = operation.includes("publish") || (operation === "initialize" && Boolean(activeVersion));
            const nextState = isPublishOperation
              ? "published"
              : operation.includes("unpublish")
                ? "unpublished"
                : "saved";
            const nextVersioning = {
              ...currentVersioning,
              schemaVersion: 1,
              schema_version: 1,
              resourceType: "agent",
              resource_type: "agent",
              revisionId: nextRevisionId,
              revision_id: nextRevisionId,
              baseRevisionId: previousRevisionId,
              base_revision_id: previousRevisionId,
              revisionNumber: nextRevisionNumber,
              revision_number: nextRevisionNumber,
              state: nextState,
              lastOperation: operation,
              last_operation: operation,
              activeVersionId: activeVersion?.id || "",
              active_version_id: activeVersion?.id || "",
              selectedVersionId: selectedVersion?.id || "",
              selected_version_id: selectedVersion?.id || "",
              updatedAt: now,
              updated_at: now,
              updatedBy: actor,
              updated_by: actor,
            };
            if (operation.includes("save")) {
              nextVersioning.lastSavedAt = now;
              nextVersioning.last_saved_at = now;
              nextVersioning.lastSavedBy = actor;
              nextVersioning.last_saved_by = actor;
            }
            if (isPublishOperation) {
              nextVersioning.lastPublishedAt = now;
              nextVersioning.last_published_at = now;
              nextVersioning.lastPublishedBy = actor;
              nextVersioning.last_published_by = actor;
            }
            if (operation.includes("unpublish")) {
              nextVersioning.lastUnpublishedAt = now;
              nextVersioning.last_unpublished_at = now;
              nextVersioning.lastUnpublishedBy = actor;
              nextVersioning.last_unpublished_by = actor;
            }
            const nextMetadata = {
              ...metadata,
              runnerVersioning: nextVersioning,
              runner_versioning: nextVersioning,
            };
            if (isPublishOperation && activeVersion) {
              const deploymentId = activeVersion.deploymentId || activeVersion.deployment_id || createPlaygroundAgentDeploymentId(activeVersion.id);
              nextMetadata.activeAgentDeployment = {
                id: deploymentId,
                versionId: activeVersion.id,
                version: activeVersion.version,
                status: "published",
                publishedAt: now,
                publishedBy: actor,
              };
              nextMetadata.active_agent_deployment = nextMetadata.activeAgentDeployment;
            }
            if (operation.includes("unpublish")) {
              delete nextMetadata.activeAgentDeployment;
              delete nextMetadata.active_agent_deployment;
            }
            return nextMetadata;
          }
  
          function prepareAgentVersionedRecordForCommit(agentRecord, options = {}) {
            const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord);
            const nextMetadata = buildAgentVersioningMetadata(normalizedAgent, options);
            return normalizePlaygroundAgentRecord({
              ...normalizedAgent,
              metadata: nextMetadata,
            });
          }
  
          async function fetchLatestAgentVersionRecord(agentId) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId || normalizedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              return null;
            }
            try {
              const response = await fetch(backendUrl + "/agents/" + encodeURIComponent(normalizedAgentId), {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                return null;
              }
              return getPlaygroundAgentResponseRecord(data);
            } catch {
              return null;
            }
          }

          function getAgentVersionApiOptions(agentId) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId || normalizedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              throw new Error("Missing agent id.");
            }
            return {
              backendUrl,
              headers: requestHeaders,
              credentials: "same-origin",
              agentId: normalizedAgentId,
            };
          }

          function normalizeAgentVersionApiList(rawItems) {
            const items = Array.isArray(rawItems) ? rawItems : [];
            const numericVersions = items
              .map((version) => Number(version?.version ?? version?.versionNumber ?? version?.version_number))
              .filter((version) => Number.isFinite(version) && version >= 0);
            const displayOffset = numericVersions.length > 0 && Math.min(...numericVersions) >= 1 ? 1 : 0;
            return normalizePlaygroundAgentVersions(items.map((version, index) => {
              const rawVersion = Number(version?.version ?? version?.versionNumber ?? version?.version_number);
              const displayVersion = Number.isFinite(rawVersion)
                ? Math.max(0, Math.floor(rawVersion) - displayOffset)
                : Math.max(0, index);
              const rawLabel = String(version?.label || version?.name || "").trim();
              const usesGeneratedLabel = !rawLabel || /^Version\s+\d+$/i.test(rawLabel);
              const snapshotName = String(version?.snapshot?.name || "").trim();
              return {
                ...version,
                version: displayVersion,
                versionNumber: displayVersion,
                version_number: displayVersion,
                label: usesGeneratedLabel ? "Version " + displayVersion : rawLabel,
                name: snapshotName,
              };
            }));
          }

          async function fetchAgentVersionsApi(agentId) {
            return normalizeAgentVersionApiList(
              await agentVersionApiClient.listAgentVersions(getAgentVersionApiOptions(agentId))
            );
          }

          async function createAgentVersionApi(agentId, snapshot, details = {}) {
            const version = await agentVersionApiClient.createAgentVersion({
              ...getAgentVersionApiOptions(agentId),
              version: {
                description: String(details.description || "").trim().slice(0, 240),
                snapshot,
              },
            });
            return normalizePlaygroundAgentVersion(version);
          }

          async function updateAgentVersionApi(agentId, versionId, updates = {}) {
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) {
              throw new Error("Missing agent version.");
            }
            const version = await agentVersionApiClient.updateAgentVersion({
              ...getAgentVersionApiOptions(agentId),
              versionId: normalizedVersionId,
              version: updates,
            });
            return normalizePlaygroundAgentVersion(version);
          }

          async function publishAgentVersionApi(agentId, versionId, options = {}) {
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) {
              throw new Error("Missing agent version.");
            }
            return {
              agent: normalizePlaygroundAgentRecord(await agentVersionApiClient.publishAgentVersion({
                ...getAgentVersionApiOptions(agentId),
                versionId: normalizedVersionId,
                ...(Object.prototype.hasOwnProperty.call(options, "snapshot")
                  ? { snapshot: options.snapshot }
                  : {}),
                ...(Object.prototype.hasOwnProperty.call(options, "description")
                  ? { description: String(options.description || "").trim().slice(0, 240) }
                  : {}),
              })),
            };
          }

          async function unpublishAgentVersionApi(agentId, versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) {
              throw new Error("Missing agent version.");
            }
            return normalizePlaygroundAgentRecord(await agentVersionApiClient.unpublishAgentVersion({
              ...getAgentVersionApiOptions(agentId),
              versionId: normalizedVersionId,
            }));
          }

          async function deleteAgentVersionApi(agentId, versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            if (!normalizedVersionId) {
              throw new Error("Missing agent version.");
            }
            await agentVersionApiClient.deleteAgentVersion({
              ...getAgentVersionApiOptions(agentId),
              versionId: normalizedVersionId,
            });
          }

          function invalidateAgentVersionsCache(agentId) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId) return;
            for (const cacheKey of Array.from(agentVersionsLoadedRef.current)) {
              if (String(cacheKey).endsWith("|" + normalizedAgentId)) {
                agentVersionsLoadedRef.current.delete(cacheKey);
              }
            }
          }

          function markAgentVersionsCacheLoaded(agentId) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId) return;
            agentVersionsLoadedRef.current.add([
              String(backendUrl || "").trim(),
              JSON.stringify(requestHeaders || {}),
              normalizedAgentId,
            ].join("|"));
          }

          function createAgentVersionSelectedResource(baseAgent, versions, preferredSelectedId = "") {
            const hydratedAgent = createPlaygroundAgentWithVersionList(baseAgent, versions, preferredSelectedId);
            const selectedVersion = readPlaygroundAgentVersions(hydratedAgent)
              .find((version) => version.id === String(preferredSelectedId || "").trim())
              || getDraftAgentSelectedVersion(hydratedAgent)
              || null;
            return selectedVersion
              ? createPlaygroundAgentFromVersionSnapshot(
                  hydratedAgent,
                  selectedVersion,
                  versions,
                  selectedVersion.id
                )
              : hydratedAgent;
          }

          async function refreshAuthoritativeAgentVersions(agentId, options = {}) {
            const normalizedAgentId = String(agentId || "").trim();
            const fallbackAgent = normalizePlaygroundAgentRecord(
              options.baseAgent
              || draftAgent
              || agentDetailsById[normalizedAgentId]
              || selectedAgentSnapshot
              || buildPlaygroundDefaultAgentDraft()
            );
            const [latestAgent, versions] = await Promise.all([
              fetchLatestAgentVersionRecord(normalizedAgentId),
              fetchAgentVersionsApi(normalizedAgentId),
            ]);
            const authoritativeBase = normalizePlaygroundAgentRecord(latestAgent || fallbackAgent);
            const activeVersion = versions.find((version) => version.status === "active") || versions[0] || null;
            const authoritativeAgent = createPlaygroundAgentWithVersionList(
              authoritativeBase,
              versions,
              activeVersion?.id || ""
            );
            const preferredSelectedId = String(options.preferredSelectedId || activeVersion?.id || "").trim();
            const selectedAgent = createAgentVersionSelectedResource(
              authoritativeAgent,
              versions,
              preferredSelectedId
            );

            invalidateAgentVersionsCache(normalizedAgentId);
            markAgentVersionsCacheLoaded(normalizedAgentId);
            setAgentVersionsLoadState({
              agentId: normalizedAgentId,
              status: "success",
              error: "",
            });
            setAgentDetailsById((current) => ({
              ...current,
              [normalizedAgentId]: authoritativeAgent,
            }));
            setAgentListMode(getPlaygroundAgentListMode(authoritativeAgent));
            setSelectedAgentId(normalizedAgentId);
            setDraftAgent(selectedAgent);
            rememberAgentVersionBaseline(selectedAgent, { force: true });
            return selectedAgent;
          }

          async function refreshAgentVersionsPreservingDraft(agentId, preferredSelectedId = "") {
            const normalizedAgentId = String(agentId || "").trim();
            const versions = await fetchAgentVersionsApi(normalizedAgentId);
            invalidateAgentVersionsCache(normalizedAgentId);
            markAgentVersionsCacheLoaded(normalizedAgentId);
            setAgentVersionsLoadState({
              agentId: normalizedAgentId,
              status: "success",
              error: "",
            });
            setAgentDetailsById((current) => {
              const currentAgent = current[normalizedAgentId];
              if (!currentAgent) return current;
              return {
                ...current,
                [normalizedAgentId]: createPlaygroundAgentWithVersionList(
                  currentAgent,
                  versions,
                  preferredSelectedId
                ),
              };
            });
            setDraftAgent((current) => {
              if (!current || String(current.id || "").trim() !== normalizedAgentId) {
                return current;
              }
              return createPlaygroundAgentWithVersionList(
                current,
                versions,
                preferredSelectedId
              );
            });
            return versions;
          }

          async function runAgentVersionApiMutation(options = {}) {
            const normalizedAgentId = String(options.agentId || draftAgent?.id || "").trim();
            if (!normalizedAgentId || normalizedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              return null;
            }
            clearAgentAutosaveQueue();
            setAgentVersionState({
              status: "loading",
              message: options.loadingMessage || "Saving agent version...",
              error: "",
            });
            setSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
            try {
              const mutationResult = await options.mutate();
              const selectedVersionId = typeof options.getSelectedVersionId === "function"
                ? options.getSelectedVersionId(mutationResult)
                : options.preferredSelectedId;
              const refreshedAgent = await refreshAuthoritativeAgentVersions(normalizedAgentId, {
                baseAgent: mutationResult?.agent || mutationResult?.resource || draftAgent,
                preferredSelectedId: selectedVersionId || "",
              });
              editorDirtyRef.current = false;
              agentVersionDraftTouchedRef.current = false;
              setOpenAgentVersionMenuId("");
              setSaveState({
                isSaving: false,
                error: "",
                message: options.successMessage || "Saved",
              });
              setAgentVersionState({
                status: "success",
                message: options.successMessage || "Saved",
                error: "",
              });
              if (onAgentMutated) {
                await onAgentMutated();
              }
              window.setTimeout(() => {
                setAgentVersionState((current) => current.status === "success"
                  ? { status: "idle", message: "", error: "" }
                  : current
                );
              }, 1800);
              return refreshedAgent;
            } catch (error) {
              const errorMessage = error instanceof Error
                ? error.message
                : options.errorMessage || "Failed to save agent version.";
              setSaveState({
                isSaving: false,
                error: errorMessage,
                message: "",
              });
              setAgentVersionState({
                status: "error",
                message: "",
                error: errorMessage,
              });
              return null;
            }
          }
  
          function validateAgentVersionForPublish(agentRecord, version) {
            const normalizedVersion = version ? normalizePlaygroundAgentVersion(version) : null;
            const snapshot = normalizedVersion?.snapshot || buildPlaygroundAgentVersionSnapshot(agentRecord);
            const issues = [];
            const name = String(snapshot.name || agentRecord?.name || "").trim();
            const modelId = getPlaygroundAgentModelMeta(snapshot.model || agentRecord?.model || "", resolvedAgentModelOptions).id;
            if (!name) {
              issues.push("Add an agent name.");
            }
            if (!modelId) {
              issues.push("Choose a model.");
            }
            if (snapshot.agentType === "team") {
              if (!String(snapshot.teamOrchestratorAgentId || "").trim()) {
                issues.push("Choose an orchestrator agent.");
              }
              if (!Array.isArray(snapshot.teamSubagentIds) || snapshot.teamSubagentIds.length === 0) {
                issues.push("Add at least one team member.");
              }
            } else if (!String(snapshot.instructions || "").trim()) {
              issues.push("Add instructions before publishing.");
            }
            const availableGuardrailIds = new Set((Array.isArray(guardrailSets) ? guardrailSets : [])
              .map((guardrailSet) => String(guardrailSet?.id || "").trim())
              .filter(Boolean));
            const missingGuardrailIds = normalizePlaygroundGuardrailSetIds(snapshot.guardrailSetIds)
              .filter((guardrailSetId) => availableGuardrailIds.size > 0 && !availableGuardrailIds.has(guardrailSetId));
            if (missingGuardrailIds.length > 0) {
              issues.push("Remove unavailable guardrail sets before publishing.");
            }
            return {
              ok: issues.length === 0,
              issues,
              message: issues.slice(0, 3).join(" "),
            };
          }
  
          function normalizeAgentVersionComparableList(value) {
            return normalizePlaygroundVersionComparableList(value);
          }
  
          function normalizeAgentVersionComparablePromptAdaptations(value) {
            return normalizePlaygroundPromptAdaptations(value)
              .map((entry) => ({
                id: entry.id,
                title: entry.title,
                content: entry.content,
                guardrailSetId: entry.guardrailSetId,
                source: entry.source,
              }))
              .sort((left, right) => (
                String(left.guardrailSetId || "").localeCompare(String(right.guardrailSetId || ""))
                || String(left.id || "").localeCompare(String(right.id || ""))
                || String(left.content || "").localeCompare(String(right.content || ""))
              ));
          }
  
          function buildAgentVersionComparableSnapshot(snapshot) {
            const normalizedSnapshot = normalizePlaygroundAgentVersion({ snapshot }).snapshot;
            return {
              name: normalizedSnapshot.name,
              description: normalizedSnapshot.description,
              model: normalizedSnapshot.model,
              instructions: normalizedSnapshot.instructions,
              binary: normalizedSnapshot.binary,
              reasoningEffort: normalizedSnapshot.reasoningEffort,
              enabledSkills: normalizeAgentVersionComparableList(normalizedSnapshot.enabledSkills),
              guardrailSetIds: normalizeAgentVersionComparableList(normalizedSnapshot.guardrailSetIds),
              promptAdaptations: normalizeAgentVersionComparablePromptAdaptations(
                normalizedSnapshot.promptAdaptations || normalizedSnapshot.invisiblePromptAdaptations
              ),
              deepResearchModel: normalizedSnapshot.deepResearchModel || null,
              permissionSet: normalizePlaygroundPermissionSet(normalizedSnapshot.permissionSet, "agent"),
              agentType: normalizedSnapshot.agentType === "team" ? "team" : "single",
              teamOrchestratorAgentId: String(normalizedSnapshot.teamOrchestratorAgentId || "").trim(),
              teamSubagentIds: normalizeAgentVersionComparableList(normalizedSnapshot.teamSubagentIds),
              teamExecutionMode: normalizedSnapshot.agentType === "team" ? PLAYGROUND_AGENT_TEAM_EXECUTION_MODE : "",
            };
          }
  
          const agentVersionController = createPlaygroundVersionController({
            getMetadata: (agentRecord) => (
              agentRecord?.metadata && typeof agentRecord.metadata === "object" && !Array.isArray(agentRecord.metadata)
                ? agentRecord.metadata
                : {}
            ),
            readVersions: readPlaygroundAgentVersions,
            normalizeVersions: normalizePlaygroundAgentVersions,
            createVersion: createPlaygroundAgentVersion,
            withVersionList: createPlaygroundAgentWithVersionList,
            fromVersionSnapshot: createPlaygroundAgentFromVersionSnapshot,
            buildSnapshot: buildPlaygroundAgentVersionSnapshot,
            buildComparableSnapshot: buildAgentVersionComparableSnapshot,
            getActiveVersionId: (metadata) => metadata.activeAgentVersionId || metadata.active_agent_version_id || "",
            getSelectedVersionId: (metadata, activeVersion) => (
              metadata.restoredFromAgentVersionId
              || metadata.restored_from_agent_version_id
              || activeVersion?.id
              || ""
            ),
            updateVersionFromResource: (version, agentRecord, options = {}) => {
              const now = new Date().toISOString();
              const normalizedVersion = normalizePlaygroundAgentVersion(version || {});
              const snapshot = buildPlaygroundAgentVersionSnapshot(agentRecord);
              const nextStatus = String(options.status || "saved").trim().toLowerCase() === "active" ? "active" : "saved";
              const actor = normalizePlaygroundVersionActor(options.actor) || getAgentVersionActor();
              const revisionId = createPlaygroundAgentVersionRevisionId();
              const deploymentId = nextStatus === "active" ? (normalizedVersion.deploymentId || normalizedVersion.deployment_id || createPlaygroundAgentDeploymentId(normalizedVersion.id)) : "";
              return normalizePlaygroundAgentVersion({
                ...normalizedVersion,
                status: nextStatus,
                lifecycleState: nextStatus === "active" ? "published" : "saved",
                lifecycle_state: nextStatus === "active" ? "published" : "saved",
                revisionId,
                revision_id: revisionId,
                baseRevisionId: normalizedVersion.revisionId || normalizedVersion.revision_id || "",
                base_revision_id: normalizedVersion.revisionId || normalizedVersion.revision_id || "",
                revisionNumber: (Number(normalizedVersion.revisionNumber || normalizedVersion.revision_number || normalizedVersion.version || 0) || 0) + 1,
                revision_number: (Number(normalizedVersion.revisionNumber || normalizedVersion.revision_number || normalizedVersion.version || 0) || 0) + 1,
                updatedAt: now,
                updated_at: now,
                updatedBy: actor,
                updated_by: actor,
                publishedAt: nextStatus === "active" ? now : "",
                published_at: nextStatus === "active" ? now : "",
                publishedBy: nextStatus === "active" ? actor : null,
                published_by: nextStatus === "active" ? actor : null,
                deploymentId,
                deployment_id: deploymentId,
                deploymentStatus: nextStatus === "active" ? "published" : "",
                deployment_status: nextStatus === "active" ? "published" : "",
                name: snapshot.name,
                model: snapshot.model,
                enabledSkills: snapshot.enabledSkills,
                guardrailSetIds: snapshot.guardrailSetIds,
                permissionSet: snapshot.permissionSet,
                snapshot,
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            updateVersionMetadata: (version, details = {}) => {
              const normalizedVersion = normalizePlaygroundAgentVersion(version || {});
              const actor = normalizePlaygroundVersionActor(details.actor) || getAgentVersionActor();
              const now = String(details.updatedAt || new Date().toISOString()).trim();
              return normalizePlaygroundAgentVersion({
                ...normalizedVersion,
                label: details.label,
                description: details.description,
                updatedAt: now,
                updated_at: now,
                updatedBy: actor,
                updated_by: actor,
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            publishVersion: (version, options = {}) => {
              const normalizedVersion = normalizePlaygroundAgentVersion(version || {});
              const publishedAt = String(options.publishedAt || new Date().toISOString()).trim();
              const actor = normalizePlaygroundVersionActor(options.actor) || getAgentVersionActor();
              const deploymentId = normalizedVersion.deploymentId || normalizedVersion.deployment_id || createPlaygroundAgentDeploymentId(normalizedVersion.id);
              return normalizePlaygroundAgentVersion({
                ...normalizedVersion,
                status: "active",
                lifecycleState: "published",
                lifecycle_state: "published",
                updatedAt: publishedAt,
                updated_at: publishedAt,
                updatedBy: actor,
                updated_by: actor,
                publishedAt,
                published_at: publishedAt,
                publishedBy: actor,
                published_by: actor,
                deploymentId,
                deployment_id: deploymentId,
                deploymentStatus: "published",
                deployment_status: "published",
                deployment: {
                  id: deploymentId,
                  versionId: normalizedVersion.id,
                  status: "published",
                  publishedAt,
                  publishedBy: actor,
                },
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            supersedeVersion: (version, options = {}) => {
              const normalizedVersion = normalizePlaygroundAgentVersion(version || {});
              const supersededAt = String(options.supersededAt || new Date().toISOString()).trim();
              return normalizePlaygroundAgentVersion({
                ...normalizedVersion,
                status: "superseded",
                lifecycleState: "deprecated",
                lifecycle_state: "deprecated",
                updatedAt: supersededAt,
                updated_at: supersededAt,
                deploymentStatus: "superseded",
                deployment_status: "superseded",
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            unpublishVersion: (version, options = {}) => {
              const normalizedVersion = normalizePlaygroundAgentVersion(version || {});
              const unpublishedAt = String(options.unpublishedAt || new Date().toISOString()).trim();
              const actor = normalizePlaygroundVersionActor(options.actor) || getAgentVersionActor();
              return normalizePlaygroundAgentVersion({
                ...normalizedVersion,
                status: "unpublished",
                lifecycleState: "unpublished",
                lifecycle_state: "unpublished",
                updatedAt: unpublishedAt,
                updated_at: unpublishedAt,
                updatedBy: actor,
                updated_by: actor,
                unpublishedAt,
                unpublished_at: unpublishedAt,
                unpublishedBy: actor,
                unpublished_by: actor,
                deploymentStatus: "unpublished",
                deployment_status: "unpublished",
              }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
            },
            applyUnpublishMetadata: (agentRecord, context = {}) => {
              const nextMetadata = agentRecord?.metadata && typeof agentRecord.metadata === "object" && !Array.isArray(agentRecord.metadata)
                ? { ...agentRecord.metadata, unpublishedAt: context.unpublishedAt, unpublished_at: context.unpublishedAt }
                : { unpublishedAt: context.unpublishedAt, unpublished_at: context.unpublishedAt };
              delete nextMetadata.publishedAt;
              delete nextMetadata.published_at;
              return {
                ...agentRecord,
                metadata: nextMetadata,
                publishedAt: "",
              };
            },
          });
  
          function getAgentVersionMetadata(agentRecord = draftAgent) {
            return agentVersionController.getMetadata(agentRecord);
          }
  
          function readDraftAgentVersions(agentRecord = draftAgent) {
            return agentVersionController.readVersions(agentRecord);
          }
  
          function getDraftAgentActiveVersion(agentRecord = draftAgent) {
            return agentVersionController.getActiveVersion(agentRecord);
          }
  
          function getDraftAgentSelectedVersion(agentRecord = draftAgent) {
            return agentVersionController.getSelectedVersion(agentRecord);
          }
  
          function rememberAgentVersionBaseline(agentRecord = draftAgent, options = {}) {
            const didUpdateBaseline = agentVersionController.rememberBaseline(agentRecord, agentVersionBaselineRef, options);
            if (didUpdateBaseline) {
              agentVersionDraftTouchedRef.current = false;
            }
          }
  
          function hasDraftAgentVersionChanges() {
            return agentVersionController.hasDraftChanges(draftAgent, agentVersionBaselineRef, {
              touched: agentVersionDraftTouchedRef.current,
            });
          }

          function buildAgentVersionSaveDialogData() {
            const versions = readDraftAgentVersions();
            const selectedVersion = getDraftAgentSelectedVersion()
              || getDraftAgentActiveVersion()
              || versions[0]
              || null;
            const persistedAgent = selectedAgentSnapshot
              || agentDetailsById[String(draftAgent?.id || "").trim()]
              || draftAgent;
            const baseSnapshot = selectedVersion?.snapshot
              || buildPlaygroundAgentVersionSnapshot(persistedAgent);
            const currentSnapshot = buildPlaygroundAgentVersionSnapshot(draftAgent);
            const latestVersion = versions.reduce((highest, version) => {
              const parsedVersion = Number(version?.version);
              return Number.isFinite(parsedVersion)
                ? Math.max(highest, parsedVersion)
                : highest;
            }, -1);
            return {
              canSaveCurrent: Boolean(selectedVersion),
              currentVersion: selectedVersion
                ? Number(selectedVersion.version)
                : null,
              nextVersion: latestVersion + 1,
              currentDescription: String(selectedVersion?.description || "").trim(),
              diffFiles: buildAgentVersionDiffFilesFromSnapshots(baseSnapshot, currentSnapshot),
            };
          }

          function openAgentVersionSaveDialog(options = {}) {
            if (
              !draftAgent
              || saveState.isSaving
              || agentVersionState.status === "loading"
              || !hasDraftAgentVersionChanges()
            ) {
              return false;
            }
            setAgentActionsPopoverOpen(false);
            setAgentPublishMenuOpen(false);
            setAgentVersionSelectorMenuOpen(false);
            setAgentVersionsHeaderMenuOpen(false);
            setAgentVersionState((current) => current.status === "loading"
              ? current
              : { status: "idle", message: "", error: "" }
            );
            setAgentVersionSaveDialog({
              initialMode: options.mode === "current" ? "current" : "new",
              key: Date.now().toString(36) + Math.random().toString(36).slice(2),
            });
            return true;
          }
  
          const hasUnsavedAgentChanges = Boolean(
            !isHomeViewActive
            && draftAgent
            && editorDirtyRef.current
            && (
              draftAgent.id === PLAYGROUND_AGENT_DRAFT_ID
                ? agentVersionDraftTouchedRef.current
                : hasDraftAgentVersionChanges()
            )
          );
  
          useEffect(() => {
            if (typeof onNavigationGuardChange !== "function") {
              return;
            }
            const agentName = String(draftAgent?.name || "").trim() || "this agent";
            onNavigationGuardChange(hasUnsavedAgentChanges
              ? {
                  id: "agent-details-unsaved-changes",
                  active: true,
                  title: "Leave without saving?",
                  description: "Your changes to " + agentName + " have not been saved. If you leave now, they will be lost.",
                  onDiscard: discardUnsavedAgentDraft,
                }
              : null
            );
          }, [draftAgent?.id, draftAgent?.name, hasUnsavedAgentChanges, onNavigationGuardChange]);
  
          useEffect(() => {
            if (typeof onNavigationGuardChange !== "function") {
              return undefined;
            }
            return () => onNavigationGuardChange(null);
          }, [onNavigationGuardChange]);
  
          function isDraftAgentSelectedVersionPublished() {
            const selectedVersion = getDraftAgentSelectedVersion();
            return Boolean(selectedVersion && selectedVersion.status === "active");
          }
  
          function canPublishAgentVersion(version) {
            const normalizedVersionId = String(version?.id || "").trim();
            if (!normalizedVersionId) return false;
            const selectedVersion = getDraftAgentSelectedVersion();
            const hasChanges = hasDraftAgentVersionChanges();
            const isActiveVersion = String(version?.status || "").toLowerCase() === "active";
            if (isActiveVersion) {
              return Boolean(selectedVersion?.id === normalizedVersionId && hasChanges);
            }
            return !hasChanges;
          }
  
          function getAgentVersionPopupActions() {
            const agentVersionHasChanges = hasDraftAgentVersionChanges();
            return [
              {
                id: "revert",
                label: "Revert Changes",
                icon: Undo2,
                disabled: !agentVersionHasChanges,
                onClick: handleRevertDraft,
              },
            ];
          }
  
          function openAgentVersionsSidebar() {
            if (!canShowAgentVersions) {
              return;
            }
            setAgentActionsPopoverOpen(false);
            setAgentPublishMenuOpen(false);
            setAgentVersionSelectorMenuOpen(false);
            setAgentVersionsHeaderMenuOpen(false);
            setAgentAssistantOpen(false);
            setOpenAgentVersionMenuId("");
            setAgentVersionState((current) => current.status === "loading" ? current : {
              status: "idle",
              message: "",
              error: "",
            });
            setAgentVersionsSidebarOpen(true);
          }

          function toggleAgentVersionsSidebar() {
            if (agentVersionsSidebarOpen) {
              closeAgentVersionsSidebar();
              return;
            }
            openAgentVersionsSidebar();
          }
  
          function closeAgentVersionsSidebar() {
            setAgentVersionsSidebarOpen(false);
            setAgentPublishMenuOpen(false);
            setAgentVersionSelectorMenuOpen(false);
            setAgentVersionsHeaderMenuOpen(false);
            finishCloseAgentVersionModal();
            setOpenAgentVersionMenuId("");
          }
  
          function cancelAgentVersionModalAnimation() {
            if (agentVersionModalCloseTimerRef.current) {
              window.clearTimeout(agentVersionModalCloseTimerRef.current);
              agentVersionModalCloseTimerRef.current = null;
            }
            if (agentVersionModalFrameRef.current) {
              window.cancelAnimationFrame(agentVersionModalFrameRef.current);
              agentVersionModalFrameRef.current = null;
            }
          }
  
          function finishCloseAgentVersionModal() {
            cancelAgentVersionModalAnimation();
            setAgentVersionModal(null);
            setAgentVersionModalVisible(false);
            setAgentVersionModalClosing(false);
            setAgentVersionDescriptionDraft("");
            setIsAgentVersionDescriptionEditing(false);
          }

          function openAgentVersionModal(nextModal, description = "") {
            if (!draftAgent || agentVersionState.status === "loading" || saveState.isSaving) {
              return;
            }
            cancelAgentVersionModalAnimation();
            setAgentPublishMenuOpen(false);
            setAgentVersionsHeaderMenuOpen(false);
            setOpenAgentVersionMenuId("");
            setAgentVersionState((current) => current.status === "loading" ? current : {
              status: "idle",
              message: "",
              error: "",
            });
            setAgentVersionDescriptionDraft(String(description || ""));
            setIsAgentVersionDescriptionEditing(false);
            setAgentVersionModal(nextModal);
            setAgentVersionModalClosing(false);
            setAgentVersionModalVisible(false);
            agentVersionModalFrameRef.current = window.requestAnimationFrame(() => {
              agentVersionModalFrameRef.current = window.requestAnimationFrame(() => {
                agentVersionModalFrameRef.current = null;
                setAgentVersionModalVisible(true);
              });
            });
          }

          function openEditAgentVersionModal(versionId) {
            if (!draftAgent || agentVersionState.status === "loading" || saveState.isSaving) {
              return;
            }
            const normalizedVersionId = String(versionId || "").trim();
            const versions = readDraftAgentVersions();
            const targetVersion = versions.find((version) => version.id === normalizedVersionId);
            if (!targetVersion) {
              return;
            }
            openAgentVersionModal(
              {
                mode: "edit",
                versionId: targetVersion.id,
                version: targetVersion.version,
              },
              String(targetVersion.description || "")
            );
          }
  
          function closeAgentVersionModal(options = {}) {
            if (saveState.isSaving || agentVersionState.status === "loading") {
              return;
            }
            if (options.animate === false) {
              finishCloseAgentVersionModal();
              return;
            }
            if (!agentVersionModal || agentVersionModalClosing) {
              return;
            }
            cancelAgentVersionModalAnimation();
            setAgentVersionModalVisible(false);
            setAgentVersionModalClosing(true);
            agentVersionModalCloseTimerRef.current = window.setTimeout(() => {
              agentVersionModalCloseTimerRef.current = null;
              finishCloseAgentVersionModal();
            }, typeof PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS === "number" ? PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS : 75);
          }
  
          async function updateAgentVersionDetails(versionId, versionDetails = {}) {
            if (!draftAgent || agentVersionState.status === "loading") {
              return null;
            }
            const agentId = String(draftAgent.id || "").trim();
            const normalizedVersionId = String(versionId || "").trim();
            if (!agentId || !normalizedVersionId) {
              return null;
            }
            setAgentVersionState({
              status: "loading",
              message: "Saving version details...",
              error: "",
            });
            setSaveState({ isSaving: true, error: "", message: "" });
            try {
              const updatedVersion = await updateAgentVersionApi(agentId, normalizedVersionId, {
                description: String(versionDetails.description || "").trim().slice(0, 240),
              });
              await refreshAgentVersionsPreservingDraft(agentId, normalizedVersionId);
              setSaveState({ isSaving: false, error: "", message: "Version details saved" });
              setAgentVersionState({
                status: "success",
                message: "Version details saved",
                error: "",
              });
              if (onAgentMutated) {
                await onAgentMutated();
              }
              return updatedVersion;
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to save version details.";
              setSaveState({ isSaving: false, error: errorMessage, message: "" });
              setAgentVersionState({ status: "error", message: "", error: errorMessage });
              return null;
            }
          }
  
          async function commitAgentVersionModal() {
            if (!agentVersionModal || saveState.isSaving || agentVersionState.status === "loading") {
              return;
            }
            const description = String(agentVersionDescriptionDraft || "").trim();
            const savedAgent = await updateAgentVersionDetails(
              agentVersionModal.versionId,
              { description }
            );
            if (savedAgent) {
              closeAgentVersionModal();
            }
          }
  
          async function saveAndPublishCurrentAgentVersion(details = {}) {
            if (!draftAgent || saveState.isSaving || agentVersionState.status === "loading") {
              return null;
            }
            if (!hasDraftAgentVersionChanges()) {
              return null;
            }
            const selectedVersion = getDraftAgentSelectedVersion();
            const saveToCurrentVersion = details.mode === "current" && Boolean(selectedVersion);
            const versionDescription = String(details.description || "").trim().slice(0, 240);
            const currentSnapshot = buildPlaygroundAgentVersionSnapshot(draftAgent);
            const validation = validateAgentVersionForPublish(
              draftAgent,
              selectedVersion
                ? { ...selectedVersion, snapshot: currentSnapshot }
                : { snapshot: currentSnapshot }
            );
            if (!validation.ok) {
              setAgentVersionState({
                status: "error",
                message: "",
                error: validation.message || "Resolve validation issues before publishing.",
              });
              return null;
            }
            const agentId = String(draftAgent.id || "").trim();
            setAgentPublishMenuOpen(false);
            setAgentVersionSelectorMenuOpen(false);
            setAgentVersionsHeaderMenuOpen(false);
            return await runAgentVersionApiMutation({
              agentId,
              loadingMessage: "Saving agent changes...",
              successMessage: "Changes saved",
              errorMessage: "Failed to save agent changes.",
              mutate: async () => {
                let version = selectedVersion;
                if (!saveToCurrentVersion) {
                  version = await createAgentVersionApi(agentId, currentSnapshot, {
                    description: versionDescription,
                  });
                } else if (selectedVersion.status !== "active") {
                  version = await updateAgentVersionApi(agentId, selectedVersion.id, {
                    description: versionDescription,
                    snapshot: currentSnapshot,
                  });
                }
                if (!version?.id) {
                  throw new Error("Agent version could not be resolved.");
                }
                const published = await publishAgentVersionApi(agentId, version.id, {
                  snapshot: currentSnapshot,
                  description: versionDescription,
                });
                return {
                  ...published,
                  version,
                };
              },
              getSelectedVersionId: (result) => result?.version?.id || selectedVersion?.id || "",
            });
          }
  
          async function restoreAgentVersion(versionId) {
            if (!draftAgent || agentVersionState.status === "loading") {
              return;
            }
            const result = agentVersionController.buildRestoreVersionResource(draftAgent, versionId);
            if (!result?.resource) {
              return;
            }
            clearAgentAutosaveQueue();
            editorDirtyRef.current = false;
            agentVersionDraftTouchedRef.current = false;
            setDraftAgent(result.resource);
            rememberAgentVersionBaseline(result.resource, { force: true });
            setAgentPublishMenuOpen(false);
            setAgentVersionState({ status: "idle", message: "", error: "" });
          }
  
          async function publishAgentVersion(versionId) {
            if (!draftAgent || agentVersionState.status === "loading") {
              return;
            }
            const targetVersion = readDraftAgentVersions().find((version) => version.id === String(versionId || "").trim());
            const selectedVersion = getDraftAgentSelectedVersion();
            const hasChanges = hasDraftAgentVersionChanges();
            const isChangedActiveVersion = Boolean(
              targetVersion
              && targetVersion.status === "active"
              && selectedVersion?.id === targetVersion.id
              && hasChanges
            );
            if (isChangedActiveVersion) {
              openAgentVersionSaveDialog({ mode: "current" });
              return;
            }
            if (hasChanges) {
              setAgentVersionState({
                status: "error",
                message: "",
                error: "Save the current version before publishing.",
              });
              return;
            }
            if (!canPublishAgentVersion(targetVersion)) {
              return;
            }
            const validation = validateAgentVersionForPublish(draftAgent, targetVersion);
            if (!validation.ok) {
              setAgentVersionState({
                status: "error",
                message: "",
                error: validation.message || "Resolve validation issues before publishing.",
              });
              return;
            }
            const agentId = String(draftAgent.id || "").trim();
            await runAgentVersionApiMutation({
              agentId,
              loadingMessage: "Publishing agent version...",
              successMessage: "Published",
              errorMessage: "Failed to publish agent version.",
              mutate: () => publishAgentVersionApi(agentId, targetVersion.id),
              preferredSelectedId: targetVersion.id,
            });
          }
  
          async function deleteAgentVersion(versionId) {
            if (!draftAgent || agentVersionState.status === "loading") {
              return;
            }
            if (readDraftAgentVersions().length <= 1) {
              return;
            }
            const normalizedVersionId = String(versionId || "").trim();
            const targetVersion = readDraftAgentVersions().find((version) => version.id === normalizedVersionId);
            if (!targetVersion) {
              return;
            }
            if (targetVersion.status === "active") {
              setAgentVersionState({
                status: "error",
                message: "",
                error: "The published version cannot be deleted.",
              });
              return;
            }
            if (hasDraftAgentVersionChanges() && getDraftAgentSelectedVersion()?.id === normalizedVersionId) {
              setAgentVersionState({
                status: "error",
                message: "",
                error: "Revert or save the current changes before deleting this version.",
              });
              return;
            }
            if (!window.confirm("Delete this agent version?")) {
              return;
            }
            const activeVersion = getDraftAgentActiveVersion();
            await runAgentVersionApiMutation({
              agentId: draftAgent.id,
              loadingMessage: "Deleting agent version...",
              successMessage: "Version deleted",
              errorMessage: "Failed to delete agent version.",
              mutate: async () => {
                await deleteAgentVersionApi(draftAgent.id, normalizedVersionId);
                return {};
              },
              preferredSelectedId: activeVersion?.id || "",
            });
          }
  
          async function unpublishActiveAgentVersion() {
            if (!draftAgent || agentVersionState.status === "loading") {
              return;
            }
            const activeVersion = getDraftAgentActiveVersion();
            if (!activeVersion?.id) {
              return;
            }
            if (!window.confirm("Unpublish this agent? Version history will be kept.")) {
              return;
            }
            await runAgentVersionApiMutation({
              agentId: draftAgent.id,
              loadingMessage: "Unpublishing agent...",
              successMessage: "Unpublished",
              errorMessage: "Failed to unpublish agent.",
              mutate: async () => ({
                agent: await unpublishAgentVersionApi(draftAgent.id, activeVersion.id),
              }),
              preferredSelectedId: activeVersion.id,
            });
          }
  
          async function handleRevertDraft() {
            clearAgentAutosaveQueue();
            if (selectedAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              setDraftAgent(buildPlaygroundDefaultAgentDraft(draftAgent?.agentType === "team" ? "team" : "single"));
              resetEditorAuxiliaryState();
              return;
            }
            const selectedVersion = getDraftAgentSelectedVersion();
            if (selectedVersion) {
              const result = agentVersionController.buildRestoreVersionResource(draftAgent, selectedVersion.id);
              if (!result?.resource) {
                return;
              }
              editorDirtyRef.current = false;
              agentVersionDraftTouchedRef.current = false;
              setDraftAgent(result.resource);
              rememberAgentVersionBaseline(result.resource, { force: true });
              setAgentPublishMenuOpen(false);
              setAgentVersionState({ status: "idle", message: "", error: "" });
              return;
            }
            const nextDraft = selectedAgentSnapshot ? normalizePlaygroundAgentRecord(selectedAgentSnapshot) : null;
            setDraftAgent(nextDraft);
            resetEditorAuxiliaryState();
          }
  
          function getAgentVersionSkillDiffItems(snapshot) {
            const skillNamesById = new Map((Array.isArray(skills) ? skills : [])
              .map((skill) => [String(skill?.id || "").trim(), String(skill?.name || skill?.label || skill?.id || "").trim()])
            );
            return normalizeAgentVersionComparableList(snapshot?.enabledSkills)
              .map((skillId) => ({
                id: skillId,
                label: skillNamesById.get(skillId) || skillId,
              }));
          }
  
  ${GUARDRAILS_AGENT_SCRIPT_FRAGMENTS.versionDiffItems}        function getAgentVersionTeamMemberDiffItems(snapshot) {
            const agentNamesById = new Map(allKnownAgents.map((agent) => [String(agent?.id || "").trim(), String(agent?.name || agent?.id || "").trim()]));
            return normalizeAgentVersionComparableList(snapshot?.teamSubagentIds)
              .map((agentId) => ({
                id: agentId,
                label: agentNamesById.get(agentId) || agentId,
              }));
          }
  
          function getAgentVersionOrchestratorDiffItem(snapshot) {
            const agentId = String(snapshot?.teamOrchestratorAgentId || "").trim();
            const agent = agentId ? allKnownAgents.find((entry) => String(entry?.id || "").trim() === agentId) : null;
            return agentId
              ? { id: agentId, label: String(agent?.name || agentId).trim() }
              : null;
          }
  
          function buildAgentVersionConfigDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundAgentVersion({ snapshot }).snapshot;
            return {
              name: normalizedSnapshot.name,
              description: normalizedSnapshot.description,
              model: {
                id: normalizedSnapshot.model,
                label: getPlaygroundAgentModelMeta(normalizedSnapshot.model || "", resolvedAgentModelOptions)?.label || normalizedSnapshot.model || "",
              },
              runtime: normalizedSnapshot.binary,
              reasoningEffort: normalizedSnapshot.reasoningEffort,
              deepResearchModel: normalizedSnapshot.deepResearchModel || null,
              type: normalizedSnapshot.agentType,
            };
          }
  
          function buildAgentVersionTeamDiffPayload(snapshot) {
            const normalizedSnapshot = normalizePlaygroundAgentVersion({ snapshot }).snapshot;
            return {
              orchestrator: getAgentVersionOrchestratorDiffItem(normalizedSnapshot),
              members: getAgentVersionTeamMemberDiffItems(normalizedSnapshot),
              executionMode: normalizedSnapshot.teamExecutionMode || "",
            };
          }
  
  ${GUARDRAILS_AGENT_SCRIPT_FRAGMENTS.versionDiffPayload}        function buildAgentVersionDiffFilesFromSnapshots(baseSnapshot, targetSnapshot) {
            if (!baseSnapshot || !targetSnapshot) {
              return [];
            }
            const normalizedBaseSnapshot = normalizePlaygroundAgentVersion({ snapshot: baseSnapshot }).snapshot;
            const normalizedTargetSnapshot = normalizePlaygroundAgentVersion({ snapshot: targetSnapshot }).snapshot;
            const files = [
              createPlaygroundVersionDiffFile({
                id: "config",
                path: "agent/config.json",
                before: buildAgentVersionConfigDiffPayload(normalizedBaseSnapshot),
                after: buildAgentVersionConfigDiffPayload(normalizedTargetSnapshot),
              }),
              createPlaygroundVersionDiffFile({
                id: "instructions",
                path: "agent/instructions.md",
                before: normalizedBaseSnapshot.instructions || "",
                after: normalizedTargetSnapshot.instructions || "",
              }),
              createPlaygroundVersionDiffFile({
                id: "permissions",
                path: "agent/permissions.json",
                before: normalizePlaygroundPermissionSet(normalizedBaseSnapshot.permissionSet, "agent"),
                after: normalizePlaygroundPermissionSet(normalizedTargetSnapshot.permissionSet, "agent"),
              }),
              createPlaygroundVersionDiffFile({
                id: "skills",
                path: "agent/skills.json",
                before: getAgentVersionSkillDiffItems(normalizedBaseSnapshot),
                after: getAgentVersionSkillDiffItems(normalizedTargetSnapshot),
              }),
              createPlaygroundVersionDiffFile({
                id: "guardrails",
                path: "agent/guardrails.json",
                before: buildAgentVersionGuardrailDiffPayload(normalizedBaseSnapshot),
                after: buildAgentVersionGuardrailDiffPayload(normalizedTargetSnapshot),
              }),
            ];
            if (normalizedBaseSnapshot.agentType === "team" || normalizedTargetSnapshot.agentType === "team") {
              files.push(createPlaygroundVersionDiffFile({
                id: "team",
                path: "agent/team.json",
                before: buildAgentVersionTeamDiffPayload(normalizedBaseSnapshot),
                after: buildAgentVersionTeamDiffPayload(normalizedTargetSnapshot),
              }));
            }
            return files.filter(Boolean);
          }
  
          const AGENT_VERSION_COMPARE_CURRENT_EDITOR_ID = "current-editor";
  
          function getAgentVersionCompareVersionSourceId(versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            return normalizedVersionId ? "version:" + normalizedVersionId : "";
          }
  
          function getAgentVersionCompareVersionId(sourceId) {
            const normalizedSourceId = String(sourceId || "").trim();
            return normalizedSourceId.startsWith("version:") ? normalizedSourceId.slice("version:".length).trim() : "";
          }
  
          function getAgentVersionCompareVersionLabel(version) {
            if (!version) {
              return "Version";
            }
            return String(version.label || ("Version " + version.version)).trim() || "Version";
          }
  
          function buildAgentVersionCompareSources(versions) {
            const normalizedVersions = Array.isArray(versions) ? versions : [];
            return [
              {
                id: AGENT_VERSION_COMPARE_CURRENT_EDITOR_ID,
                label: "Current editor",
                snapshot: buildPlaygroundAgentVersionSnapshot(draftAgent),
                version: null,
              },
            ].concat(normalizedVersions.map((version) => ({
              id: getAgentVersionCompareVersionSourceId(version.id),
              label: getAgentVersionCompareVersionLabel(version),
              snapshot: normalizePlaygroundAgentVersion(version).snapshot,
              version,
            })));
          }
  
          function resolveAgentVersionCompareSource(sourceId, sources, fallbackSource) {
            const normalizedSourceId = String(sourceId || "").trim();
            return sources.find((source) => source.id === normalizedSourceId) || fallbackSource || sources[0] || null;
          }
  
          function compareAgentVersionCompareSourceChronology(leftSource, rightSource) {
            const leftVersionId = getAgentVersionCompareVersionId(leftSource?.id);
            const rightVersionId = getAgentVersionCompareVersionId(rightSource?.id);
            if (!leftVersionId || !rightVersionId) {
              return 0;
            }
            const leftVersionNumber = Number(leftSource?.version?.version || 0);
            const rightVersionNumber = Number(rightSource?.version?.version || 0);
            if (leftVersionNumber && rightVersionNumber && leftVersionNumber !== rightVersionNumber) {
              return leftVersionNumber - rightVersionNumber;
            }
            const leftTimestamp = Date.parse(String(leftSource?.version?.publishedAt || leftSource?.version?.updatedAt || leftSource?.version?.createdAt || ""));
            const rightTimestamp = Date.parse(String(rightSource?.version?.publishedAt || rightSource?.version?.updatedAt || rightSource?.version?.createdAt || ""));
            if (Number.isFinite(leftTimestamp) && Number.isFinite(rightTimestamp) && leftTimestamp !== rightTimestamp) {
              return leftTimestamp - rightTimestamp;
            }
            return String(leftVersionId).localeCompare(String(rightVersionId));
          }
  
          function orderAgentVersionCompareSourcesForDiff(leftSource, rightSource) {
            if (compareAgentVersionCompareSourceChronology(leftSource, rightSource) > 0) {
              return {
                leftSource: rightSource,
                rightSource: leftSource,
                leftStateSide: "right",
                rightStateSide: "left",
              };
            }
            return {
              leftSource,
              rightSource,
              leftStateSide: "left",
              rightStateSide: "right",
            };
          }
  
          function getDefaultAgentVersionCompareLeftSourceId(versions) {
            const metadata = getAgentVersionMetadata();
            const activeVersionId = String(metadata.activeAgentVersionId || metadata.active_agent_version_id || "").trim();
            const activeVersion = versions.find((version) => version.id === activeVersionId)
              || versions.find((version) => String(version.status || "").toLowerCase() === "active")
              || versions[0];
            return activeVersion ? getAgentVersionCompareVersionSourceId(activeVersion.id) : AGENT_VERSION_COMPARE_CURRENT_EDITOR_ID;
          }
  
          function openAgentVersionChangesPage(versionId, options = {}) {
            const normalizedVersionId = String(versionId || "").trim();
            const versions = readDraftAgentVersions();
            if (!versions.length && !draftAgent) {
              return;
            }
            const explicitLeftSourceId = String(options.leftSourceId || "").trim();
            const explicitRightSourceId = String(options.rightSourceId || "").trim();
            const fallbackLeftSourceId = normalizedVersionId
              ? getAgentVersionCompareVersionSourceId(normalizedVersionId)
              : getDefaultAgentVersionCompareLeftSourceId(versions);
            const leftSourceId = explicitLeftSourceId || fallbackLeftSourceId;
            const rightSourceId = explicitRightSourceId || AGENT_VERSION_COMPARE_CURRENT_EDITOR_ID;
            setOpenAgentVersionMenuId("");
            setAgentVersionsSidebarOpen(true);
            setAgentVersionChangesState({
              leftSourceId,
              rightSourceId,
            });
          }
  
          function closeAgentVersionChangesPage() {
            setAgentVersionChangesState(null);
          }
  
          function handleAgentVersionCompareSourceChange(side, sourceId) {
            const normalizedSourceId = String(sourceId || "").trim() || AGENT_VERSION_COMPARE_CURRENT_EDITOR_ID;
            setAgentVersionChangesState((current) => ({
              ...(current || {}),
              [side === "left" ? "leftSourceId" : "rightSourceId"]: normalizedSourceId,
            }));
          }
  

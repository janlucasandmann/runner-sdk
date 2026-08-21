export const GUARDRAILS_PAGE_ACCESS_SCRIPT = `          const getGuardrailAccessMetadata = (set = selectedGuardrailSet) => (
            set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata)
              ? set.metadata
              : {}
          );
          const getGuardrailPermissionSet = (
            set = selectedGuardrailSet,
            principalId = PLATFORM_ALL_AGENTS_PRINCIPAL_ID
          ) => getPlatformSystemPrincipalPermissionSet(
            getGuardrailAccessMetadata(set),
            principalId,
            "guardrail",
            set?.permissionSet || getGuardrailAccessMetadata(set).permissionSet
          );
          const getGuardrailSystemRolePermissionSet = (
            principalId,
            roleId,
            set = selectedGuardrailSet
          ) => getPlatformSystemPrincipalRolePermissionSet(
            getGuardrailAccessMetadata(set),
            principalId,
            normalizePlaygroundTeamRoleId(roleId, "member"),
            "guardrail_team_role"
          );
          const getGuardrailAccessTeamIds = (set = selectedGuardrailSet) => getPlatformSharedTeamIds({
            ...getGuardrailAccessMetadata(set),
            sharedTeamIds: getGuardrailAccessMetadata(set).teamAccessIds,
          });
          const getGuardrailPersonIdentitySources = (record) => {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
            const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
              ? source.metadata
              : {};
            return [
              source,
              source.owner,
              source.user,
              source.profile,
              source.account,
              source.member,
              source.identity,
              metadata,
              metadata.owner,
              metadata.user,
              metadata.profile,
              metadata.account,
              metadata.member,
              metadata.identity,
            ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
          };
          const readGuardrailPersonIdentityValue = (record, keys) => {
            for (const source of getGuardrailPersonIdentitySources(record)) {
              for (const key of keys) {
                const value = String(source?.[key] || "").trim();
                if (value) return value;
              }
            }
            return "";
          };
          const normalizeGuardrailPersonIdentity = (record) => {
            const email = readGuardrailPersonIdentityValue(record, [
              "email", "emailAddress", "email_address", "mail", "primaryEmail", "primary_email",
            ]).toLowerCase();
            const name = readGuardrailPersonIdentityValue(record, [
              "displayName", "display_name", "name", "fullName", "full_name", "username", "userName",
            ]);
            const userId = readGuardrailPersonIdentityValue(record, [
              "userId", "user_id", "uid", "accountId", "account_id",
            ]);
            const id = readGuardrailPersonIdentityValue(record, [
              "ownerId", "owner_id", "id", "memberId", "member_id",
            ]);
            const avatarUrl = readGuardrailPersonIdentityValue(record, [
              "avatarUrl", "avatar_url", "photoUrl", "photoURL", "photo_url", "imageUrl", "imageURL", "picture",
            ]);
            return {
              id: String(id || userId || email || "").trim(),
              userId: String(userId || "").trim(),
              name: String(name || email || "").trim(),
              email,
              avatarUrl: String(avatarUrl || "").trim(),
            };
          };
          const getGuardrailPersonIdentityKeys = (identity) => {
            const normalized = normalizeGuardrailPersonIdentity(identity);
            return Array.from(new Set([
              normalized.userId,
              normalized.email.toLowerCase(),
              normalized.id,
            ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)));
          };
          const getGuardrailOwnerCandidateKey = (identity) => (
            getGuardrailPersonIdentityKeys(identity)[0]
            || String(normalizeGuardrailPersonIdentity(identity).name || "").trim().toLowerCase()
          );
          const getGuardrailOwnerIdentity = (set = selectedGuardrailSet) => {
            if (isGuardrailSetReadonly(set)) {
              return getGuardrailCreatorIdentity(set);
            }
            const metadata = getGuardrailAccessMetadata(set);
            const ownerSource = set?.owner && typeof set.owner === "object" && !Array.isArray(set.owner)
              ? set.owner
              : metadata.owner && typeof metadata.owner === "object" && !Array.isArray(metadata.owner)
                ? metadata.owner
                : {
                    id: set?.ownerId || set?.owner_id || metadata.ownerId || metadata.owner_id,
                    userId: set?.ownerUserId || set?.owner_user_id || metadata.ownerUserId || metadata.owner_user_id,
                    name: set?.ownerName || set?.owner_name || metadata.ownerName || metadata.owner_name,
                    email: set?.ownerEmail || set?.owner_email || metadata.ownerEmail || metadata.owner_email,
                    avatarUrl: set?.ownerAvatarUrl || set?.owner_avatar_url || metadata.ownerAvatarUrl || metadata.owner_avatar_url,
                  };
            const owner = normalizeGuardrailPersonIdentity(ownerSource);
            return getGuardrailPersonIdentityKeys(owner).length || owner.name
              ? owner
              : getGuardrailCreatorIdentity(set);
          };
          const getCurrentGuardrailUserIdentity = () => normalizeGuardrailPersonIdentity({
            id: sessionState.userId || accountEmail || accountName || "",
            userId: sessionState.userId || "",
            name: accountName || accountEmail || "Me",
            email: accountEmail || "",
            avatarUrl: accountAvatarUrl || "",
          });
          const mergeGuardrailOwnerCandidates = (candidates) => {
            const candidatesByKey = new Map();
            (Array.isArray(candidates) ? candidates : []).forEach((candidate) => {
              const normalized = normalizeGuardrailPersonIdentity(candidate);
              const key = getGuardrailOwnerCandidateKey(normalized);
              if (!key) return;
              const existing = candidatesByKey.get(key) || {};
              const teamNames = Array.from(new Set([
                ...(Array.isArray(existing.teamNames) ? existing.teamNames : []),
                ...(Array.isArray(candidate?.teamNames) ? candidate.teamNames : []),
              ].map((value) => String(value || "").trim()).filter(Boolean)));
              candidatesByKey.set(key, {
                ...existing,
                ...normalized,
                id: normalized.id || existing.id || "",
                userId: normalized.userId || existing.userId || "",
                name: normalized.name || existing.name || normalized.email || existing.email || "Team member",
                email: normalized.email || existing.email || "",
                avatarUrl: normalized.avatarUrl || existing.avatarUrl || "",
                teamNames,
              });
            });
            return Array.from(candidatesByKey.values()).sort((left, right) =>
              String(left.name || left.email || "").localeCompare(String(right.name || right.email || ""))
            );
          };
          const getGuardrailOwnerCandidates = (set = selectedGuardrailSet) => {
            const setId = String(set?.id || "").trim();
            const cachedCandidates = guardrailOwnerCandidateStateBySetId?.[setId]?.candidates;
            return mergeGuardrailOwnerCandidates([
              getGuardrailOwnerIdentity(set),
              getGuardrailCreatorIdentity(set),
              getCurrentGuardrailUserIdentity(),
              ...(Array.isArray(cachedCandidates) ? cachedCandidates : []),
            ]);
          };
          const isCurrentGuardrailOwner = (set = selectedGuardrailSet) => {
            if (isGuardrailSetReadonly(set)) return false;
            const ownerKeys = new Set(getGuardrailPersonIdentityKeys(getGuardrailOwnerIdentity(set)));
            return getGuardrailPersonIdentityKeys(getCurrentGuardrailUserIdentity())
              .some((key) => ownerKeys.has(key));
          };
          const loadGuardrailOwnerCandidates = async (set = selectedGuardrailSet) => {
            const setId = String(set?.id || "").trim();
            if (!setId || isGuardrailSetReadonly(set)) return;
            const teamIds = getGuardrailAccessTeamIds(set).slice().sort();
            const signature = teamIds.join("|");
            const currentState = guardrailOwnerCandidateStateBySetId?.[setId];
            if (currentState?.signature === signature && ["loading", "ready"].includes(currentState.status)) return;
            setGuardrailOwnerCandidateStateBySetId((current) => ({
              ...current,
              [setId]: { signature, status: "loading", candidates: current?.[setId]?.candidates || [] },
            }));
            const teamRecords = Array.isArray(teamPageTeams) ? teamPageTeams : [];
            const memberGroups = await Promise.all(teamIds.map(async (teamId) => {
              try {
                const payload = await requestGuardrailBackendJson(
                  "/teams/" + encodeURIComponent(teamId) + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
                  { method: "GET" },
                  "Failed to load team members."
                );
                const members = readPlaygroundGuardrailListFromPayload(payload, ["members", "teamMembers", "team_members"]);
                const teamName = String(teamRecords.find((team) => String(team?.id || "") === teamId)?.name || "Shared team").trim();
                return members
                  .filter((member) => !["revoked", "removed"].includes(String(member?.status || "").trim().toLowerCase()))
                  .map((member) => ({ ...normalizeGuardrailPersonIdentity(member), teamNames: [teamName] }))
                  .filter((member) => getGuardrailOwnerCandidateKey(member));
              } catch {
                return [];
              }
            }));
            const candidates = mergeGuardrailOwnerCandidates(memberGroups.flat());
            setGuardrailOwnerCandidateStateBySetId((current) => ({
              ...current,
              [setId]: { signature, status: "ready", candidates },
            }));
          };
          const updateGuardrailOwner = (ownerIdentity) => {
            if (!selectedGuardrailSet?.id || selectedGuardrailSetReadonly || !isCurrentGuardrailOwner()) return;
            const owner = normalizeGuardrailPersonIdentity(ownerIdentity);
            if (!getGuardrailOwnerCandidateKey(owner)) return;
            updateGuardrailAccessMetadata((metadata) => ({
              owner: { ...owner, type: "user" },
              ownerId: owner.id,
              owner_id: owner.id,
              ownerUserId: owner.userId,
              owner_user_id: owner.userId,
              ownerName: owner.name,
              owner_name: owner.name,
              ownerEmail: owner.email,
              owner_email: owner.email,
              ownerAvatarUrl: owner.avatarUrl,
              owner_avatar_url: owner.avatarUrl,
            }));
            setGuardrailOwnerSelectorOpen(false);
          };
          const handleGuardrailOwnerSelectorOpenChange = (nextOpen) => {
            if (nextOpen && (!selectedGuardrailSet?.id || selectedGuardrailSetReadonly || !isCurrentGuardrailOwner())) return;
            setGuardrailOwnerSelectorOpen(Boolean(nextOpen));
            if (nextOpen) void loadGuardrailOwnerCandidates(selectedGuardrailSet);
          };
          const getGuardrailTeamRolePermissionSets = (set = selectedGuardrailSet) => {
            const source = getGuardrailAccessMetadata(set).teamRolePermissionSets;
            return source && typeof source === "object" && !Array.isArray(source) ? source : {};
          };
          const createGuardrailRolePermissionSet = (roleId) => {
            const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
            return createPlaygroundRolePermissionSet("guardrail_team_role", normalizedRoleId);
          };
          const getGuardrailTeamRolePermissionSet = (teamId, roleId, set = selectedGuardrailSet) => {
            const normalizedTeamId = String(teamId || "").trim();
            const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
            const teamRoleSets = getGuardrailTeamRolePermissionSets(set);
            return normalizePlaygroundRolePermissionSet(
              teamRoleSets?.[normalizedTeamId]?.[normalizedRoleId],
              "guardrail_team_role",
              normalizedRoleId
            );
          };
          const updateGuardrailAccessMetadata = (metadataPatch) => {
            if (!selectedGuardrailSet?.id || selectedGuardrailSetReadonly) return;
            updateGuardrailSet(selectedGuardrailSet.id, (currentSet) => ({
              ...currentSet,
              metadata: {
                ...(currentSet?.metadata && typeof currentSet.metadata === "object" && !Array.isArray(currentSet.metadata)
                  ? currentSet.metadata
                  : {}),
                ...(typeof metadataPatch === "function"
                  ? metadataPatch(currentSet?.metadata && typeof currentSet.metadata === "object" ? currentSet.metadata : {})
                  : metadataPatch),
              },
            }), { markVersionTouched: false });
          };
          const updateGuardrailPermissionSet = (updater) => {
            const principalId = isPlatformSystemAccessPrincipalId(guardrailAccessTeamId)
              ? normalizePlatformAccessPrincipalId(guardrailAccessTeamId)
              : PLATFORM_ALL_AGENTS_PRINCIPAL_ID;
            const currentPermissionSet = getGuardrailPermissionSet(selectedGuardrailSet, principalId);
            const nextPermissionSet = normalizePlaygroundPermissionSet(
              typeof updater === "function" ? updater(currentPermissionSet) : updater,
              "guardrail"
            );
            updateGuardrailAccessMetadata((metadata) => buildPlatformSystemPrincipalPermissionMetadata(
              metadata,
              principalId,
              nextPermissionSet,
              "guardrail"
            ));
          };
          const updateGuardrailSystemRolePermissionSet = (principalId, roleId, updater) => {
            const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
            if (!isPlatformRoleScopedSystemAccessPrincipalId(principalId) || normalizedRoleId === "owner") return;
            const currentPermissionSet = getGuardrailSystemRolePermissionSet(
              principalId,
              normalizedRoleId
            );
            const nextPermissionSet = normalizePlaygroundPermissionSet(
              typeof updater === "function" ? updater(currentPermissionSet) : updater,
              "guardrail_team_role"
            );
            updateGuardrailAccessMetadata((metadata) =>
              buildPlatformSystemPrincipalRolePermissionMetadata(
                metadata,
                principalId,
                normalizedRoleId,
                nextPermissionSet,
                "guardrail_team_role"
              )
            );
          };
          const updateGuardrailPermissionRingAccess = (ringId, nextAccess) => {
            const ring = getPlaygroundPermissionRingDefinition(ringId);
            updateGuardrailPermissionSet((current) => ({
              ...current,
              rings: {
                ...(current.rings || {}),
                [ring.id]: {
                  ...(current.rings?.[ring.id] || {}),
                  defaultAccess: normalizePlaygroundPermissionAccess(nextAccess, ring.defaultAccess),
                },
              },
            }));
          };
          const updateGuardrailPermissionActionRing = (actionId, nextRingId) => {
            const action = getPlaygroundPermissionActionDefinition(actionId);
            if (!action) return;
            updateGuardrailPermissionSet((current) => {
              const currentPolicy = current.actions?.[action.id] || { ringId: action.ringId };
              return {
                ...current,
                actions: {
                  ...(current.actions || {}),
                  [action.id]: buildPlaygroundPermissionActionPolicy(
                    current,
                    action,
                    currentPolicy,
                    getPlaygroundPermissionActionExplicitAccess(current, action),
                    normalizePlaygroundPermissionRingId(nextRingId, action.ringId)
                  ),
                },
              };
            });
          };
          const updateGuardrailPermissionActionAccess = (actionId, nextAccess) => {
            const action = getPlaygroundPermissionActionDefinition(actionId);
            if (!action) return;
            updateGuardrailPermissionSet((current) => ({
              ...current,
              actions: {
                ...(current.actions || {}),
                [action.id]: buildPlaygroundPermissionActionPolicy(
                  current,
                  action,
                  current.actions?.[action.id] || { ringId: action.ringId },
                  nextAccess
                ),
              },
            }));
          };
          const updateGuardrailTeamRolePermissionSet = (teamId, roleId, updater) => {
            const normalizedTeamId = String(teamId || "").trim();
            const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
            if (!normalizedTeamId || normalizedRoleId === "owner") return;
            const currentSet = getGuardrailTeamRolePermissionSet(normalizedTeamId, normalizedRoleId);
            const nextSet = normalizePlaygroundPermissionSet(
              typeof updater === "function" ? updater(currentSet) : updater,
              "guardrail_team_role"
            );
            updateGuardrailAccessMetadata((metadata) => ({
              teamRolePermissionSets: {
                ...(metadata.teamRolePermissionSets && typeof metadata.teamRolePermissionSets === "object" ? metadata.teamRolePermissionSets : {}),
                [normalizedTeamId]: {
                  ...(metadata.teamRolePermissionSets?.[normalizedTeamId] || {}),
                  [normalizedRoleId]: nextSet,
                },
              },
            }));
          };
          const updateGuardrailTeamRoleRingAccess = (teamId, roleId, ringId, nextAccess) => {
            const ring = getPlaygroundPermissionRingDefinition(ringId);
            updateGuardrailTeamRolePermissionSet(teamId, roleId, (current) => ({
              ...current,
              rings: {
                ...(current.rings || {}),
                [ring.id]: {
                  ...(current.rings?.[ring.id] || {}),
                  defaultAccess: normalizePlaygroundPermissionAccess(nextAccess, ring.defaultAccess),
                },
              },
            }));
          };
          const updateGuardrailTeamRoleActionRing = (teamId, roleId, actionId, nextRingId) => {
            const action = getPlaygroundPermissionActionDefinition(actionId);
            if (!action) return;
            updateGuardrailTeamRolePermissionSet(teamId, roleId, (current) => ({
              ...current,
              actions: {
                ...(current.actions || {}),
                [action.id]: buildPlaygroundPermissionActionPolicy(
                  current,
                  action,
                  current.actions?.[action.id] || { ringId: action.ringId },
                  getPlaygroundPermissionActionExplicitAccess(current, action),
                  normalizePlaygroundPermissionRingId(nextRingId, action.ringId)
                ),
              },
            }));
          };
          const updateGuardrailTeamRoleActionAccess = (teamId, roleId, actionId, nextAccess) => {
            const action = getPlaygroundPermissionActionDefinition(actionId);
            if (!action) return;
            updateGuardrailTeamRolePermissionSet(teamId, roleId, (current) => ({
              ...current,
              actions: {
                ...(current.actions || {}),
                [action.id]: buildPlaygroundPermissionActionPolicy(
                  current,
                  action,
                  current.actions?.[action.id] || { ringId: action.ringId },
                  nextAccess
                ),
              },
            }));
          };
          const guardrailAccessTeamIds = getGuardrailAccessTeamIds();
          const guardrailWorkspaceTeams = (Array.isArray(teamPageTeams) ? teamPageTeams : [])
            .filter((team) => String(team?.id || "").trim());
          const guardrailSharedTeams = guardrailAccessTeamIds.map((teamId) => {
            const team = guardrailWorkspaceTeams.find((candidate) => String(candidate.id) === teamId);
            const roleId = String(
              team?.roleId
                || team?.role
                || team?.membershipRole
                || team?.membership_role
                || team?.currentUserRole
                || team?.current_user_role
                || "member"
            ).trim().toLowerCase();
            return {
              ...(team && typeof team === "object" ? team : {}),
              id: teamId,
              name: team?.name || "Shared team",
              kind: "team",
              roleId,
              roleLabel: String(team?.roleLabel || team?.role_label || (roleId.charAt(0).toUpperCase() + roleId.slice(1))),
              profileImageUrl: getPlatformAccessPrincipalProfileImageUrl(team),
              createdAt: team?.createdAt || selectedGuardrailSet?.updatedAt || "",
              meta: "Team role permissions",
              locked: false,
            };
          });
          const guardrailAccessRows = composePlatformAccessPrincipalRows(guardrailSharedTeams);
          const availableGuardrailTeams = guardrailWorkspaceTeams.filter((team) => !guardrailAccessTeamIds.includes(String(team.id)));
          const closeGuardrailShareTeamModal = () => {
            if (guardrailShareTeamState.status === "sharing") return;
            setGuardrailShareTeamModalOpen(false);
            setGuardrailShareTeamId("");
            setGuardrailShareTeamState({ status: "idle", error: "" });
          };
          const openGuardrailShareTeamModal = () => {
            if (!selectedGuardrailSet?.id || selectedGuardrailSetReadonly) return;
            setGuardrailShareTeamId(String(availableGuardrailTeams[0]?.id || ""));
            setGuardrailShareTeamState({ status: "idle", error: "" });
            setGuardrailShareTeamModalOpen(true);
            if (typeof loadTeamPageData === "function") {
              void loadTeamPageData({ selectedTeamId: "" });
            }
          };
          const buildGuardrailTeamSharePayload = (team) => {
            const owner = getGuardrailOwnerIdentity(selectedGuardrailSet);
            const guardrailSnapshot = {
              id: String(selectedGuardrailSet?.id || "").trim(),
              name: String(selectedGuardrailSet?.name || "Untitled Guardrail Set").trim(),
              description: String(selectedGuardrailSet?.description || "").trim(),
              promptCount: Array.isArray(selectedGuardrailSet?.prompts) ? selectedGuardrailSet.prompts.length : 0,
            };
            return {
              resourceType: "guardrail",
              resourceId: guardrailSnapshot.id,
              accessLevel: "use",
              ownerId: owner.id,
              ownerUserId: owner.userId,
              ownerName: owner.name,
              ownerEmail: owner.email,
              ownerAvatarUrl: owner.avatarUrl,
              metadata: {
                resourceType: "guardrail",
                resourceKind: "guardrail",
                resourceName: guardrailSnapshot.name,
                sharedTeamId: String(team?.id || "").trim(),
                sharedTeamName: String(team?.name || "").trim(),
                owner,
                ownerId: owner.id,
                ownerUserId: owner.userId,
                ownerName: owner.name,
                ownerEmail: owner.email,
                ownerAvatarUrl: owner.avatarUrl,
                guardrail: guardrailSnapshot,
              },
            };
          };
          const submitGuardrailShareTeam = async (event) => {
            event.preventDefault();
            if (!selectedGuardrailSet?.id || selectedGuardrailSetReadonly) return;
            const teamId = String(guardrailShareTeamId || "").trim();
            const selectedTeam = guardrailWorkspaceTeams.find((team) => String(team?.id || "").trim() === teamId) || null;
            if (!selectedTeam) {
              setGuardrailShareTeamState({ status: "error", error: "Choose a team first." });
              return;
            }
            if (guardrailAccessTeamIds.includes(teamId)) {
              setGuardrailShareTeamState({ status: "error", error: "This guardrail is already shared with that team." });
              return;
            }
            setGuardrailShareTeamState({ status: "sharing", error: "" });
            try {
              const normalizedBackendUrl = String(proxyBackendBase || "").replace(/\\\/+$/, "");
              if (!normalizedBackendUrl) throw new Error("Guardrail backend is unavailable.");
              const { response, data } = await fetchJsonWithTimeout(
                normalizedBackendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
                {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(buildGuardrailTeamSharePayload(selectedTeam)),
                },
                8000
              );
              if (!response.ok && Number(response.status || 0) !== 409) {
                throw new Error(data?.message || data?.error || "Failed to share guardrail with team.");
              }
              updateGuardrailAccessMetadata((metadata) => ({
                teamAccessIds: Array.from(new Set([
                  ...(Array.isArray(metadata.teamAccessIds) ? metadata.teamAccessIds : []),
                  teamId,
                ])),
              }));
              setGuardrailShareTeamState({ status: "idle", error: "" });
              setGuardrailShareTeamModalOpen(false);
              setGuardrailShareTeamId("");
              if (typeof loadTeamPageData === "function") {
                void loadTeamPageData({ selectedTeamId: teamId, teamId });
              }
            } catch (error) {
              setGuardrailShareTeamState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to share guardrail with team.",
              });
            }
          };
          const renderGuardrailShareTeamModal = () => {
            if (!guardrailShareTeamModalOpen) return null;
            const isSharing = guardrailShareTeamState.status === "sharing";
            const hasTeams = guardrailWorkspaceTeams.length > 0;
            return React.createElement(PlatformModal, {
                open: guardrailShareTeamModalOpen,
                portal: true,
                as: "form",
                size: "medium",
                title: "Share with Team",
                description: "Give a team access to use this guardrail in its agents.",
                onClose: closeGuardrailShareTeamModal,
                className: "playground-agents-send-team-modal playground-guardrails-share-team-modal",
                bodyClassName: "playground-agents-send-team-modal-body",
                footerClassName: "playground-agents-send-team-actions",
                closeButtonDisabled: isSharing,
                closeButtonLabel: "Close team selector",
                ariaLabel: "Share guardrail with team",
                surfaceProps: { onSubmit: submitGuardrailShareTeam },
                footer: React.createElement(React.Fragment, null,
                  React.createElement(PlatformSecondaryButton, {
                    size: "medium",
                    type: "button",
                    onClick: closeGuardrailShareTeamModal,
                    disabled: isSharing,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    disabled: isSharing || !guardrailShareTeamId || guardrailAccessTeamIds.includes(guardrailShareTeamId),
                  }, isSharing ? "Sharing..." : "Share")
                ),
              },
              teamPageLoading && !hasTeams
                ? React.createElement("div", { className: "playground-agents-send-team-empty" },
                    React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                    React.createElement("span", null, "Loading teams...")
                  )
                : hasTeams
                  ? React.createElement("div", { className: "playground-agents-send-team-list", role: "radiogroup", "aria-label": "Teams" },
                      guardrailWorkspaceTeams.map((team) => {
                        const teamId = String(team?.id || "").trim();
                        const isSelected = teamId === guardrailShareTeamId;
                        const isShared = guardrailAccessTeamIds.includes(teamId);
                        return React.createElement("button", {
                            key: teamId,
                            type: "button",
                            className: "playground-agents-send-team-option" + (isSelected ? " is-selected" : "") + (isShared ? " is-shared" : ""),
                            onClick: () => setGuardrailShareTeamId(teamId),
                            disabled: isSharing || isShared,
                            role: "radio",
                            "aria-checked": isSelected ? "true" : "false",
                          },
                          React.createElement("span", { className: "playground-agents-send-team-option-icon", "aria-hidden": "true" },
                            React.createElement(UsersRound, { width: 15, height: 15, strokeWidth: 1.85 })
                          ),
                          React.createElement("span", { className: "playground-agents-send-team-option-copy" },
                            React.createElement("span", { className: "playground-agents-send-team-option-title" }, team?.name || "Untitled team"),
                            React.createElement("span", { className: "playground-agents-send-team-option-meta" }, isShared ? "Already shared" : (team?.roleLabel || team?.role || "Team"))
                          ),
                          isSelected ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 }) : null
                        );
                      })
                    )
                  : React.createElement("div", { className: "playground-agents-send-team-empty" }, "No teams are available yet."),
              guardrailShareTeamState.error
                ? React.createElement("div", { className: "playground-tasks-project-modal-error", role: "alert" }, guardrailShareTeamState.error)
                : null
            );
          };
          const addGuardrailTeamAccess = (team) => {
            const teamId = String(team?.id || "").trim();
            if (!teamId) return;
            updateGuardrailAccessMetadata((metadata) => ({
              teamAccessIds: Array.from(new Set([
                ...(Array.isArray(metadata.teamAccessIds) ? metadata.teamAccessIds : []),
                teamId,
              ])),
            }));
            setGuardrailAccessMenuOpen(false);
          };
          const removeGuardrailTeamAccess = (teamId) => {
            const normalizedTeamId = String(teamId || "").trim();
            updateGuardrailAccessMetadata((metadata) => {
              const nextRoleSets = { ...(metadata.teamRolePermissionSets || {}) };
              delete nextRoleSets[normalizedTeamId];
              return {
                teamAccessIds: (Array.isArray(metadata.teamAccessIds) ? metadata.teamAccessIds : [])
                  .filter((value) => String(value || "").trim() !== normalizedTeamId),
                teamRolePermissionSets: nextRoleSets,
              };
            });
            if (guardrailAccessTeamId === normalizedTeamId) setGuardrailAccessTeamId("");
          };
          const openGuardrailAccessDetail = (row) => {
            setGuardrailAccessTeamId(String(row?.id || ""));
            setGuardrailAccessRoleId("member");
            setGuardrailAccessMenuOpen(false);
          };
          const renderGuardrailAccessSettings = () => {
            const selectedAccessRow = guardrailAccessRows.find((row) => row.id === guardrailAccessTeamId) || null;
            if (selectedAccessRow) {
              const systemPrincipal = getPlatformSystemAccessPrincipal(selectedAccessRow.id);
              const roleScopedSystemPrincipal = systemPrincipal
                && isPlatformRoleScopedSystemAccessPrincipalId(systemPrincipal.id);
              const selectedRole = getPlaygroundTeamRoleDefinition(guardrailAccessRoleId);
              return React.createElement("section", { className: "playground-guardrails-access-detail" },
                React.createElement("div", { className: "playground-project-team-permissions-header" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-project-team-permissions-back",
                    onClick: () => setGuardrailAccessTeamId(""),
                  },
                    React.createElement(ArrowLeft, { width: 13, height: 13, strokeWidth: 1.9 }),
                    React.createElement("span", null, "Settings")
                  ),
                  React.createElement("div", { className: "playground-project-team-permissions-title" },
                    systemPrincipal ? systemPrincipal.name + " Permissions" : selectedAccessRow.name + " Access"
                  )
                ),
                systemPrincipal && !roleScopedSystemPrincipal
                  ? React.createElement(PlatformPermissionsPage, {
                      permissionSet: getGuardrailPermissionSet(selectedGuardrailSet, systemPrincipal.id),
                      accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
                      ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
                      actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
                      subjectType: "guardrail",
                      disabled: selectedGuardrailSetReadonly,
                      onRingAccessChange: updateGuardrailPermissionRingAccess,
                      onActionRingChange: updateGuardrailPermissionActionRing,
                      onActionAccessChange: updateGuardrailPermissionActionAccess,
                    })
                  : React.createElement(PlatformRolePermissionsPage, {
                      roles: PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => ({
                        id: role.id,
                        label: role.label,
                      })),
                      value: selectedRole.id,
                      onValueChange: setGuardrailAccessRoleId,
                      roleAriaLabel: "Guardrail team roles",
                      readOnly: selectedRole.id === "owner" || selectedGuardrailSetReadonly,
                      permissionSet: roleScopedSystemPrincipal
                        ? getGuardrailSystemRolePermissionSet(systemPrincipal.id, selectedRole.id)
                        : getGuardrailTeamRolePermissionSet(selectedAccessRow.id, selectedRole.id),
                      accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
                      ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
                      actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
                      subjectType: "guardrail_team_role",
                      onRingAccessChange: (ringId, access) => (
                        roleScopedSystemPrincipal
                          ? updateGuardrailSystemRolePermissionSet(systemPrincipal.id, selectedRole.id, (current) => ({
                              ...current,
                              rings: {
                                ...(current.rings || {}),
                                [ringId]: {
                                  ...(current.rings?.[ringId] || {}),
                                  defaultAccess: access,
                                },
                              },
                            }))
                          : updateGuardrailTeamRoleRingAccess(selectedAccessRow.id, selectedRole.id, ringId, access)
                      ),
                      onActionRingChange: (actionId, ringId) => (
                        roleScopedSystemPrincipal
                          ? updateGuardrailSystemRolePermissionSet(systemPrincipal.id, selectedRole.id, (current) => {
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
                          : updateGuardrailTeamRoleActionRing(selectedAccessRow.id, selectedRole.id, actionId, ringId)
                      ),
                      onActionAccessChange: (actionId, access) => (
                        roleScopedSystemPrincipal
                          ? updateGuardrailSystemRolePermissionSet(systemPrincipal.id, selectedRole.id, (current) => {
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
                          : updateGuardrailTeamRoleActionAccess(selectedAccessRow.id, selectedRole.id, actionId, access)
                      ),
                    })
              );
            }
            const addTeamsControl = selectedGuardrailSetReadonly
              ? null
              : React.createElement(PlatformResourceAccessAddTeams, {
                  teams: availableGuardrailTeams,
                  totalTeamCount: guardrailWorkspaceTeams.length,
                  loading: teamPageLoading,
                  popupAriaLabel: "Add teams with Guardrail access",
                  onRequestTeams: () => loadTeamPageData?.({ selectedTeamId: "" }),
                  onAddTeam: addGuardrailTeamAccess,
                });
            return React.createElement("section", { className: "playground-guardrails-access-settings" },
              React.createElement(PlatformResourceAccessTable, {
                teams: guardrailSharedTeams.map((team) => ({ ...team, description: team.meta })),
                resourceLabel: "Guardrail",
                trailing: addTeamsControl,
                busy: selectedGuardrailSetReadonly,
                onOpenPermissions: openGuardrailAccessDetail,
                onRemoveTeams: selectedGuardrailSetReadonly
                  ? undefined
                  : (teams) => teams.forEach((team) => removeGuardrailTeamAccess(team.id)),
                formatCreatedAt: formatGuardrailDate,
              })
            );
          };
`;

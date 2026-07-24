export const EVALUATIONS_PAGE_CONTROLLER_ACCESS_SCRIPT = String.raw`        const getEvaluationAccessMetadata = (set = activeSet) => (
          set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata)
            ? set.metadata
            : {}
        );
        const getEvaluationPermissionSet = (
          set = activeSet,
          principalId = PLATFORM_ALL_AGENTS_PRINCIPAL_ID
        ) => getPlatformSystemPrincipalPermissionSet(
          getEvaluationAccessMetadata(set),
          principalId,
          "evaluation",
          set?.permissionSet || getEvaluationAccessMetadata(set).permissionSet
        );
        const getEvaluationAccessTeamIds = (set = activeSet) => getPlatformSharedTeamIds({
          ...getEvaluationAccessMetadata(set),
          sharedTeamIds: getEvaluationAccessMetadata(set).teamAccessIds,
        });
        const getEvaluationAccessShareIds = (set = activeSet) => {
          const source = getEvaluationAccessMetadata(set).teamAccessShareIds;
          return source && typeof source === "object" && !Array.isArray(source) ? source : {};
        };
        const getEvaluationPersonIdentitySources = (record) => {
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
        const readEvaluationPersonIdentityValue = (record, keys) => {
          for (const source of getEvaluationPersonIdentitySources(record)) {
            for (const key of keys) {
              const value = String(source?.[key] || "").trim();
              if (value) return value;
            }
          }
          return "";
        };
        const normalizeEvaluationPersonIdentity = (record) => {
          const email = readEvaluationPersonIdentityValue(record, [
            "email", "emailAddress", "email_address", "mail", "primaryEmail", "primary_email",
          ]).toLowerCase();
          const name = readEvaluationPersonIdentityValue(record, [
            "displayName", "display_name", "name", "fullName", "full_name", "username", "userName",
          ]);
          const userId = readEvaluationPersonIdentityValue(record, [
            "userId", "user_id", "uid", "accountId", "account_id",
          ]);
          const id = readEvaluationPersonIdentityValue(record, [
            "ownerId", "owner_id", "id", "memberId", "member_id",
          ]);
          const avatarUrl = readEvaluationPersonIdentityValue(record, [
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
        const getEvaluationPersonIdentityKeys = (identity) => {
          const normalized = normalizeEvaluationPersonIdentity(identity);
          return Array.from(new Set([
            normalized.userId,
            normalized.email.toLowerCase(),
            normalized.id,
          ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)));
        };
        const getEvaluationOwnerCandidateKey = (identity) => (
          getEvaluationPersonIdentityKeys(identity)[0]
          || String(normalizeEvaluationPersonIdentity(identity).name || "").trim().toLowerCase()
        );
        const getEvaluationOwnerIdentity = (set = activeSet) => {
          const metadata = getEvaluationAccessMetadata(set);
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
          const owner = normalizeEvaluationPersonIdentity(ownerSource);
          return getEvaluationPersonIdentityKeys(owner).length || owner.name
            ? owner
            : normalizeEvaluationPersonIdentity(set?.creator || set?.createdBy || currentEvaluationCreator);
        };
        const getCurrentEvaluationUserIdentity = () => normalizeEvaluationPersonIdentity(currentEvaluationCreator);
        const mergeEvaluationOwnerCandidates = (candidates) => {
          const candidatesByKey = new Map();
          (Array.isArray(candidates) ? candidates : []).forEach((candidate) => {
            const normalized = normalizeEvaluationPersonIdentity(candidate);
            const key = getEvaluationOwnerCandidateKey(normalized);
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
        const getEvaluationOwnerCandidates = (set = activeSet) => {
          const setId = String(set?.id || "").trim();
          const cachedCandidates = evaluationOwnerCandidateStateBySetId?.[setId]?.candidates;
          return mergeEvaluationOwnerCandidates([
            getEvaluationOwnerIdentity(set),
            normalizeEvaluationPersonIdentity(set?.creator || set?.createdBy || {}),
            getCurrentEvaluationUserIdentity(),
            ...(Array.isArray(cachedCandidates) ? cachedCandidates : []),
          ]);
        };
        const isCurrentEvaluationOwner = (set = activeSet) => {
          const ownerKeys = new Set(getEvaluationPersonIdentityKeys(getEvaluationOwnerIdentity(set)));
          return getEvaluationPersonIdentityKeys(getCurrentEvaluationUserIdentity())
            .some((key) => ownerKeys.has(key));
        };
        const loadEvaluationOwnerCandidates = async (set = activeSet) => {
          const setId = String(set?.id || "").trim();
          if (!setId) return;
          const teamIds = getEvaluationAccessTeamIds(set).slice().sort();
          const signature = teamIds.join("|");
          const currentState = evaluationOwnerCandidateStateBySetId?.[setId];
          if (currentState?.signature === signature && ["loading", "ready"].includes(currentState.status)) return;
          setEvaluationOwnerCandidateStateBySetId((current) => ({
            ...current,
            [setId]: { signature, status: "loading", candidates: current?.[setId]?.candidates || [] },
          }));
          const teamRecords = Array.isArray(workspaceTeams) ? workspaceTeams : [];
          const memberGroups = await Promise.all(teamIds.map(async (teamId) => {
            try {
              const payload = await requestEvaluationBackendJson(
                "/teams/" + encodeURIComponent(teamId) + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
                { method: "GET" },
                "Failed to load team members."
              );
              const members = readPlaygroundEvaluationListFromPayload(payload, ["members", "teamMembers", "team_members"]);
              const teamName = String(teamRecords.find((team) => String(team?.id || "") === teamId)?.name || "Shared team").trim();
              return members
                .filter((member) => !["revoked", "removed"].includes(String(member?.status || "").trim().toLowerCase()))
                .map((member) => ({ ...normalizeEvaluationPersonIdentity(member), teamNames: [teamName] }))
                .filter((member) => getEvaluationOwnerCandidateKey(member));
            } catch {
              return [];
            }
          }));
          const candidates = mergeEvaluationOwnerCandidates(memberGroups.flat());
          setEvaluationOwnerCandidateStateBySetId((current) => ({
            ...current,
            [setId]: { signature, status: "ready", candidates },
          }));
        };
        const updateEvaluationAccessMetadata = (metadataPatch) => {
          if (!activeSet?.id) return;
          updateEvaluationSet(activeSet.id, (currentSet) => ({
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
        const updateEvaluationOwner = (ownerIdentity) => {
          if (!activeSet?.id || !isCurrentEvaluationOwner()) return;
          const owner = normalizeEvaluationPersonIdentity(ownerIdentity);
          if (!getEvaluationOwnerCandidateKey(owner)) return;
          updateEvaluationAccessMetadata((metadata) => ({
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
          setEvaluationOwnerSelectorOpen(false);
        };
        const handleEvaluationOwnerSelectorOpenChange = (nextOpen) => {
          if (nextOpen && (!activeSet?.id || !isCurrentEvaluationOwner())) return;
          setEvaluationOwnerSelectorOpen(Boolean(nextOpen));
          if (nextOpen) void loadEvaluationOwnerCandidates(activeSet);
        };
        const renderEvaluationOwnerSelector = (set = activeSet) => {
          const ownerIdentity = getEvaluationOwnerIdentity(set);
          const ownerLabel = String(ownerIdentity.name || ownerIdentity.email || ownerIdentity.id || "Owner").trim();
          const ownerOptions = getEvaluationOwnerCandidates(set).map((candidate) => {
            const value = getEvaluationOwnerCandidateKey(candidate);
            const label = String(candidate.name || candidate.email || "Team member").trim();
            const description = candidate.email && label.toLowerCase() !== candidate.email.toLowerCase()
              ? candidate.email
              : Array.isArray(candidate.teamNames) && candidate.teamNames.length
                ? candidate.teamNames.join(", ")
                : "";
            return {
              value,
              label,
              description: description || undefined,
              ariaLabel: description ? label + ", " + description : label,
              leading: React.createElement(AccountAvatar, {
                className: "playground-agents-detail-owner-option-avatar",
                imageClassName: "playground-agents-detail-owner-option-avatar-image",
                fallbackLabel: getAccountInitials(label),
                photoUrl: candidate.avatarUrl || "",
              }),
              candidate,
            };
          });
          const ownerIdentityKeys = new Set(getEvaluationPersonIdentityKeys(ownerIdentity));
          const selectedOption = ownerOptions.find((option) =>
            getEvaluationPersonIdentityKeys(option.candidate).some((key) => ownerIdentityKeys.has(key))
          ) || null;
          const candidateState = evaluationOwnerCandidateStateBySetId?.[set?.id] || {};
          return React.createElement(PlatformSelector, {
            value: selectedOption?.value || getEvaluationOwnerCandidateKey(ownerIdentity),
            options: ownerOptions,
            open: evaluationOwnerSelectorOpen,
            onOpenChange: handleEvaluationOwnerSelectorOpenChange,
            onValueChange: (nextValue) => {
              const nextOwner = ownerOptions.find((option) => option.value === nextValue)?.candidate;
              if (nextOwner) updateEvaluationOwner(nextOwner);
            },
            ariaLabel: "Choose evaluation owner",
            label: React.createElement("span", { className: "playground-evaluations-detail-owner-value" },
              React.createElement(AccountAvatar, {
                className: "playground-team-member-avatar playground-evaluations-detail-owner-avatar",
                imageClassName: "playground-team-member-avatar-image",
                fallbackLabel: getAccountInitials(ownerLabel),
                photoUrl: ownerIdentity.avatarUrl || "",
              }),
              React.createElement("span", {
                className: "playground-evaluations-detail-owner-name",
                title: ownerIdentity.email ? ownerLabel + " · " + ownerIdentity.email : ownerLabel,
              }, ownerLabel)
            ),
            alignment: "end",
            popupAlignment: "right",
            disabled: !isCurrentEvaluationOwner(set),
            loading: candidateState.status === "loading",
            loadingContent: "Loading team members...",
            emptyContent: "No human team members are available.",
            popupWidth: 260,
            popupMaxHeight: "min(320px, calc(100vh - 180px))",
            className: "playground-evaluations-detail-owner-selector",
            triggerClassName: "playground-evaluations-detail-owner-trigger",
            popupClassName: "playground-agents-detail-owner-menu playground-evaluations-detail-owner-menu",
            optionClassName: "playground-agents-detail-owner-option",
          });
        };
        const getEvaluationTeamRolePermissionSets = (set = activeSet) => {
          const source = getEvaluationAccessMetadata(set).teamRolePermissionSets;
          return source && typeof source === "object" && !Array.isArray(source) ? source : {};
        };
        const getEvaluationTeamRolePermissionSet = (teamId, roleId, set = activeSet) => {
          const normalizedTeamId = String(teamId || "").trim();
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
          const teamRoleSets = getEvaluationTeamRolePermissionSets(set);
          return normalizePlaygroundRolePermissionSet(
            teamRoleSets?.[normalizedTeamId]?.[normalizedRoleId],
            "evaluation_team_role",
            normalizedRoleId
          );
        };
        const updateEvaluationPermissionSet = (updater) => {
          const principalId = isPlatformSystemAccessPrincipalId(evaluationAccessTeamId)
            ? normalizePlatformAccessPrincipalId(evaluationAccessTeamId)
            : PLATFORM_ALL_AGENTS_PRINCIPAL_ID;
          const currentPermissionSet = getEvaluationPermissionSet(activeSet, principalId);
          const nextPermissionSet = normalizePlaygroundPermissionSet(
            typeof updater === "function" ? updater(currentPermissionSet) : updater,
            "evaluation"
          );
          updateEvaluationAccessMetadata((metadata) => buildPlatformSystemPrincipalPermissionMetadata(
            metadata,
            principalId,
            nextPermissionSet,
            "evaluation"
          ));
        };
        const updateEvaluationPermissionRingAccess = (ringId, nextAccess) => {
          const ring = getPlaygroundPermissionRingDefinition(ringId);
          updateEvaluationPermissionSet((current) => ({
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
        const updateEvaluationPermissionActionRing = (actionId, nextRingId) => {
          const action = getPlaygroundPermissionActionDefinition(actionId);
          if (!action) return;
          updateEvaluationPermissionSet((current) => ({
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
        const updateEvaluationPermissionActionAccess = (actionId, nextAccess) => {
          const action = getPlaygroundPermissionActionDefinition(actionId);
          if (!action) return;
          updateEvaluationPermissionSet((current) => ({
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
        const updateEvaluationTeamRolePermissionSet = (teamId, roleId, updater) => {
          const normalizedTeamId = String(teamId || "").trim();
          const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
          if (!normalizedTeamId || normalizedRoleId === "owner") return;
          const currentSet = getEvaluationTeamRolePermissionSet(normalizedTeamId, normalizedRoleId);
          const nextSet = normalizePlaygroundPermissionSet(
            typeof updater === "function" ? updater(currentSet) : updater,
            "evaluation_team_role"
          );
          updateEvaluationAccessMetadata((metadata) => ({
            teamRolePermissionSets: {
              ...(metadata.teamRolePermissionSets && typeof metadata.teamRolePermissionSets === "object" ? metadata.teamRolePermissionSets : {}),
              [normalizedTeamId]: {
                ...(metadata.teamRolePermissionSets?.[normalizedTeamId] || {}),
                [normalizedRoleId]: nextSet,
              },
            },
          }));
        };
        const updateEvaluationTeamRoleRingAccess = (teamId, roleId, ringId, nextAccess) => {
          const ring = getPlaygroundPermissionRingDefinition(ringId);
          updateEvaluationTeamRolePermissionSet(teamId, roleId, (current) => ({
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
        const updateEvaluationTeamRoleActionRing = (teamId, roleId, actionId, nextRingId) => {
          const action = getPlaygroundPermissionActionDefinition(actionId);
          if (!action) return;
          updateEvaluationTeamRolePermissionSet(teamId, roleId, (current) => ({
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
        const updateEvaluationTeamRoleActionAccess = (teamId, roleId, actionId, nextAccess) => {
          const action = getPlaygroundPermissionActionDefinition(actionId);
          if (!action) return;
          updateEvaluationTeamRolePermissionSet(teamId, roleId, (current) => ({
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
        const evaluationAccessTeamIds = getEvaluationAccessTeamIds();
        const evaluationWorkspaceTeams = (Array.isArray(workspaceTeams) ? workspaceTeams : [])
          .filter((team) => String(team?.id || "").trim());
        const evaluationAccessShareIds = getEvaluationAccessShareIds();
        const evaluationSharedTeams = evaluationAccessTeamIds.map((teamId) => {
          const team = evaluationWorkspaceTeams.find((candidate) => String(candidate.id) === teamId);
          return {
            id: teamId,
            name: team?.name || "Shared team",
            profileImageUrl: getPlatformAccessPrincipalProfileImageUrl(team),
            createdAt: team?.createdAt || activeSet?.updatedAt || "",
            meta: "Team role permissions",
            locked: false,
          };
        });
        const evaluationAccessRows = composePlatformAccessPrincipalRows(evaluationSharedTeams);
        const availableEvaluationTeams = evaluationWorkspaceTeams.filter((team) => !evaluationAccessTeamIds.includes(String(team.id)));
        const buildEvaluationTeamSharePayload = (team) => {
          const owner = getEvaluationOwnerIdentity(activeSet);
          const evaluationSnapshot = {
            id: String(activeSet?.id || "").trim(),
            name: String(activeSet?.name || "Untitled Evaluation").trim(),
            description: String(activeSet?.description || "").trim(),
            caseCount: Array.isArray(activeSet?.dataRows) ? activeSet.dataRows.length : 0,
          };
          return {
            resourceType: "evaluation",
            resourceId: evaluationSnapshot.id,
            accessLevel: "use",
            ownerId: owner.id,
            ownerUserId: owner.userId,
            ownerName: owner.name,
            ownerEmail: owner.email,
            ownerAvatarUrl: owner.avatarUrl,
            metadata: {
              resourceType: "evaluation",
              resourceKind: "evaluation",
              resourceName: evaluationSnapshot.name,
              sharedTeamId: String(team?.id || "").trim(),
              sharedTeamName: String(team?.name || "").trim(),
              owner,
              evaluation: evaluationSnapshot,
            },
          };
        };
        const addEvaluationTeamAccess = async (team) => {
          const teamId = String(team?.id || "").trim();
          if (!teamId || !activeSet?.id || evaluationAccessActionId) return;
          setEvaluationAccessActionId("add:" + teamId);
          setEvaluationBackendSyncState({ status: "idle", error: "" });
          try {
            const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
            if (!normalizedBackendUrl) throw new Error("Evaluation backend is unavailable.");
            const { response, data } = await fetchJsonWithTimeout(
              normalizedBackendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
              {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: { ...requestHeaders, "Content-Type": "application/json" },
                body: JSON.stringify(buildEvaluationTeamSharePayload(team)),
              },
              8000
            );
            if (!response.ok && Number(response.status || 0) !== 409) {
              throw new Error(data?.message || data?.error || "Failed to give the team access to this evaluation.");
            }
            const responseShare = data?.data && typeof data.data === "object" && !Array.isArray(data.data)
              ? data.data
              : data?.share && typeof data.share === "object" && !Array.isArray(data.share)
                ? data.share
                : data && typeof data === "object" && !Array.isArray(data)
                  ? data
                  : {};
            const shareId = String(responseShare?.id || responseShare?.shareId || responseShare?.share_id || "").trim();
            updateEvaluationAccessMetadata((metadata) => ({
              teamAccessIds: Array.from(new Set([
                ...(Array.isArray(metadata.teamAccessIds) ? metadata.teamAccessIds : []),
                teamId,
              ])),
              teamAccessShareIds: {
                ...(metadata.teamAccessShareIds && typeof metadata.teamAccessShareIds === "object" ? metadata.teamAccessShareIds : {}),
                ...(shareId ? { [teamId]: shareId } : {}),
              },
            }));
            setEvaluationAccessMenuOpen(false);
          } catch (error) {
            setEvaluationBackendSyncState({
              status: "error",
              error: error instanceof Error ? error.message : "Failed to give the team access to this evaluation.",
            });
          } finally {
            setEvaluationAccessActionId("");
          }
        };
        const resolveEvaluationTeamShareId = async (teamId) => {
          const storedShareId = String(evaluationAccessShareIds?.[teamId] || "").trim();
          if (storedShareId) return storedShareId;
          const payload = await requestEvaluationBackendJson(
            "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
            { method: "GET" },
            "Failed to load team access."
          );
          const shares = readPlaygroundEvaluationListFromPayload(payload, ["shares", "resourceShares", "resource_shares"]);
          const match = shares.find((share) => (
            String(share?.resourceType || share?.resource_type || "").trim() === "evaluation"
            && String(share?.resourceId || share?.resource_id || "").trim() === String(activeSet?.id || "").trim()
          ));
          return String(match?.id || match?.shareId || match?.share_id || "").trim();
        };
        const removeEvaluationTeamAccess = async (teamId) => {
          const normalizedTeamId = String(teamId || "").trim();
          if (!normalizedTeamId || evaluationAccessActionId) return;
          setEvaluationAccessActionId("remove:" + normalizedTeamId);
          setEvaluationBackendSyncState({ status: "idle", error: "" });
          try {
            const shareId = await resolveEvaluationTeamShareId(normalizedTeamId);
            if (shareId) {
              await requestEvaluationBackendJson(
                "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares/" + encodeURIComponent(shareId),
                { method: "DELETE" },
                "Failed to remove team access."
              );
            }
            updateEvaluationAccessMetadata((metadata) => {
              const nextRoleSets = { ...(metadata.teamRolePermissionSets || {}) };
              const nextShareIds = { ...(metadata.teamAccessShareIds || {}) };
              delete nextRoleSets[normalizedTeamId];
              delete nextShareIds[normalizedTeamId];
              return {
                teamAccessIds: (Array.isArray(metadata.teamAccessIds) ? metadata.teamAccessIds : [])
                  .filter((value) => String(value || "").trim() !== normalizedTeamId),
                teamRolePermissionSets: nextRoleSets,
                teamAccessShareIds: nextShareIds,
              };
            });
            if (evaluationAccessTeamId === normalizedTeamId) setEvaluationAccessTeamId("");
          } catch (error) {
            setEvaluationBackendSyncState({
              status: "error",
              error: error instanceof Error ? error.message : "Failed to remove team access.",
            });
          } finally {
            setEvaluationAccessActionId("");
          }
        };
        const openEvaluationAccessDetail = (row) => {
          setEvaluationAccessTeamId(String(row?.id || ""));
          setEvaluationAccessRoleId("member");
          setEvaluationAccessMenuOpen(false);
        };
        const renderEvaluationAccessSettings = () => {
          const selectedAccessRow = evaluationAccessRows.find((row) => row.id === evaluationAccessTeamId) || null;
          if (selectedAccessRow) {
            const systemPrincipal = getPlatformSystemAccessPrincipal(selectedAccessRow.id);
            const selectedRole = getPlaygroundTeamRoleDefinition(evaluationAccessRoleId);
            return React.createElement("section", { className: "playground-evaluations-access-detail" },
              React.createElement("div", { className: "playground-project-team-permissions-header" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-team-permissions-back",
                  onClick: () => setEvaluationAccessTeamId(""),
                },
                  React.createElement(ArrowLeft, { width: 13, height: 13, strokeWidth: 1.9 }),
                  React.createElement("span", null, "Settings")
                ),
                React.createElement("div", { className: "playground-project-team-permissions-title" },
                  systemPrincipal ? systemPrincipal.name + " Permissions" : selectedAccessRow.name + " Access"
                )
              ),
              systemPrincipal
                ? React.createElement(PlatformPermissionsPage, {
                    permissionSet: getEvaluationPermissionSet(activeSet, systemPrincipal.id),
                    accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
                    ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
                    actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
                    subjectType: "evaluation",
                    onRingAccessChange: updateEvaluationPermissionRingAccess,
                    onActionRingChange: updateEvaluationPermissionActionRing,
                    onActionAccessChange: updateEvaluationPermissionActionAccess,
                  })
                : React.createElement(PlatformRolePermissionsPage, {
                    roles: PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => ({
                      id: role.id,
                      label: role.label,
                      description: role.description,
                      meta: "Evaluation access",
                    })),
                    value: selectedRole.id,
                    onValueChange: setEvaluationAccessRoleId,
                    roleAriaLabel: "Evaluation team roles",
                    roleKicker: "Evaluation role",
                    roleDescription: "Evaluation-specific permissions for " + selectedRole.label.toLowerCase() + "s in " + selectedAccessRow.name + ".",
                    readOnly: selectedRole.id === "owner",
                    permissionSet: getEvaluationTeamRolePermissionSet(selectedAccessRow.id, selectedRole.id),
                    accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
                    ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
                    actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
                    subjectType: "evaluation_team_role",
                    onRingAccessChange: (ringId, access) => updateEvaluationTeamRoleRingAccess(selectedAccessRow.id, selectedRole.id, ringId, access),
                    onActionRingChange: (actionId, ringId) => updateEvaluationTeamRoleActionRing(selectedAccessRow.id, selectedRole.id, actionId, ringId),
                    onActionAccessChange: (actionId, access) => updateEvaluationTeamRoleActionAccess(selectedAccessRow.id, selectedRole.id, actionId, access),
                  })
            );
          }
          const addTeamsControl = React.createElement(PlatformPopup, {
            open: evaluationAccessMenuOpen,
            variant: "minimal",
            portal: true,
            placement: "bottom-end",
            portalOffset: 6,
            animation: "down-in",
            surfaceProps: { role: "menu", "aria-label": "Add teams to evaluation" },
            trigger: React.createElement(PlatformSecondaryButton, {
              type: "button",
              size: "small",
              disabled: Boolean(evaluationAccessActionId),
              onClick: () => {
                if (!evaluationWorkspaceTeams.length && typeof onWorkspaceTeamsRequest === "function") {
                  onWorkspaceTeamsRequest({ selectedTeamId: "" });
                }
                setEvaluationAccessMenuOpen((current) => !current);
              },
            },
              React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("span", null, "Add Teams")
            ),
          },
            availableEvaluationTeams.length
              ? availableEvaluationTeams.map((team) => React.createElement("button", {
                  key: team.id,
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  disabled: Boolean(evaluationAccessActionId),
                  onClick: () => void addEvaluationTeamAccess(team),
                },
                  React.createElement(UsersRound, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, team.name || "Untitled team")
                ))
              : React.createElement("button", { type: "button", role: "menuitem", className: "tb-popup-row", disabled: true },
                  workspaceTeamsLoading ? "Loading teams..." : "All teams already have access"
                )
          );
          return React.createElement("section", { className: "playground-evaluations-access-settings" },
            React.createElement(PlatformResourceAccessTable, {
              teams: evaluationSharedTeams.map((team) => ({ ...team, description: team.meta })),
              resourceLabel: "Evaluation",
              trailing: addTeamsControl,
              busy: Boolean(evaluationAccessActionId),
              onOpenPermissions: openEvaluationAccessDetail,
              onRemoveTeams: (teams) => teams.forEach((team) => void removeEvaluationTeamAccess(team.id)),
              formatCreatedAt: formatPlaygroundEvaluationDate,
            })
          );
        };
`;

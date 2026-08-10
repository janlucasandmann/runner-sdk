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
        const hasEvaluationPersonIdentity = (identity) => {
          const normalized = normalizeEvaluationPersonIdentity(identity);
          return Boolean(getEvaluationPersonIdentityKeys(normalized).length || normalized.name);
        };
        const mergeEvaluationPersonIdentity = (...identities) => identities.reduce((merged, identity) => {
          const normalized = normalizeEvaluationPersonIdentity(identity);
          return {
            id: merged.id || normalized.id,
            userId: merged.userId || normalized.userId,
            name: merged.name || normalized.name,
            email: merged.email || normalized.email,
            avatarUrl: merged.avatarUrl || normalized.avatarUrl,
          };
        }, { id: "", userId: "", name: "", email: "", avatarUrl: "" });
        const getEvaluationExplicitOwnerIdentity = (set = activeSet) => {
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
          return normalizeEvaluationPersonIdentity(ownerSource);
        };
        const getEvaluationOrganizationRecord = (set = activeSet) => {
          const metadata = getEvaluationAccessMetadata(set);
          const setOrganizationId = String(
            set?.organizationId
            || set?.organization_id
            || metadata.organizationId
            || metadata.organization_id
            || normalizedActiveEvaluationOrganizationId
            || ""
          ).trim();
          if (setOrganizationId) {
            const matchingOrganization = evaluationOrganizations.find((organization) => (
              String(organization?.id || organization?.organizationId || organization?.organization_id || "").trim()
                === setOrganizationId
            ));
            if (matchingOrganization) return matchingOrganization;
            return { id: setOrganizationId };
          }
          return evaluationOrganizations.find((organization) => (
            String(organization?.type || "").trim().toLowerCase() === "personal"
          )) || evaluationOrganizations.find((organization) => (
            String(
              organization?.ownerUserId
              || organization?.owner_user_id
              || organization?.ownerId
              || organization?.owner_id
              || ""
            ).trim() === String(currentEvaluationCreator.userId || currentEvaluationCreator.id || "").trim()
          )) || null;
        };
        const getEvaluationOrganizationOwnerIdentity = (set = activeSet) => {
          const organization = getEvaluationOrganizationRecord(set);
          const organizationMetadata = organization?.metadata
            && typeof organization.metadata === "object"
            && !Array.isArray(organization.metadata)
            ? organization.metadata
            : {};
          const organizationOwnerSource = organization?.owner
            && typeof organization.owner === "object"
            && !Array.isArray(organization.owner)
            ? organization.owner
            : organizationMetadata.owner
              && typeof organizationMetadata.owner === "object"
              && !Array.isArray(organizationMetadata.owner)
              ? organizationMetadata.owner
              : {};
          const ownerUserId = String(
            organization?.ownerUserId
            || organization?.owner_user_id
            || organization?.ownerId
            || organization?.owner_id
            || organizationOwnerSource.userId
            || organizationOwnerSource.user_id
            || organizationOwnerSource.id
            || ""
          ).trim();
          const organizationId = String(
            organization?.id
            || organization?.organizationId
            || organization?.organization_id
            || ""
          ).trim();
          const storedOwner = normalizeEvaluationPersonIdentity({
            ...organizationOwnerSource,
            id: ownerUserId || organizationOwnerSource.id,
            userId: ownerUserId || organizationOwnerSource.userId || organizationOwnerSource.user_id,
            name: organization?.ownerName || organization?.owner_name || organizationMetadata.ownerName || organizationMetadata.owner_name || organizationOwnerSource.name,
            email: organization?.ownerEmail || organization?.owner_email || organizationMetadata.ownerEmail || organizationMetadata.owner_email || organizationOwnerSource.email,
            avatarUrl: organization?.ownerAvatarUrl || organization?.owner_avatar_url || organizationMetadata.ownerAvatarUrl || organizationMetadata.owner_avatar_url || organizationOwnerSource.avatarUrl || organizationOwnerSource.avatar_url,
          });
          const loadedOwner = normalizeEvaluationPersonIdentity(
            evaluationOrganizationOwnerStateById?.[organizationId]?.identity || {}
          );
          const currentOrganizationRole = String(
            organization?.role
            || organization?.currentUserRole
            || organization?.viewerRole
            || organization?.membership?.role
            || ""
          ).trim().toLowerCase();
          const currentUserKeys = new Set(getEvaluationPersonIdentityKeys(currentEvaluationCreator));
          const isCurrentUserOrganizationOwner = currentOrganizationRole === "owner"
            || getEvaluationPersonIdentityKeys(storedOwner).some((key) => currentUserKeys.has(key));
          const resolvedOwner = mergeEvaluationPersonIdentity(
            loadedOwner,
            isCurrentUserOrganizationOwner ? currentEvaluationCreator : {},
            storedOwner,
          );
          if (!resolvedOwner.name && (resolvedOwner.id || resolvedOwner.userId)) {
            resolvedOwner.name = "Organization owner";
          }
          return resolvedOwner;
        };
        const getEvaluationOwnerIdentity = (set = activeSet) => {
          const explicitOwner = getEvaluationExplicitOwnerIdentity(set);
          if (hasEvaluationPersonIdentity(explicitOwner)) return explicitOwner;
          const creator = normalizeEvaluationPersonIdentity(set?.creator || set?.createdBy || {});
          if (hasEvaluationPersonIdentity(creator)) return creator;
          return getEvaluationOrganizationOwnerIdentity(set);
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
        const loadEvaluationOrganizationOwner = async (set = activeSet) => {
          const explicitOwner = getEvaluationExplicitOwnerIdentity(set);
          const creator = normalizeEvaluationPersonIdentity(set?.creator || set?.createdBy || {});
          if (hasEvaluationPersonIdentity(explicitOwner) || hasEvaluationPersonIdentity(creator)) return;
          const organization = getEvaluationOrganizationRecord(set);
          const organizationId = String(
            organization?.id
            || organization?.organizationId
            || organization?.organization_id
            || ""
          ).trim();
          if (!organizationId) return;
          const fallbackOwner = getEvaluationOrganizationOwnerIdentity(set);
          const ownerKey = getEvaluationOwnerCandidateKey(fallbackOwner);
          const currentState = evaluationOrganizationOwnerStateById?.[organizationId];
          if (
            currentState?.ownerKey === ownerKey
            && ["loading", "ready"].includes(currentState.status)
          ) return;
          if (
            ownerKey
            && getEvaluationPersonIdentityKeys(fallbackOwner).some((key) => (
              getEvaluationPersonIdentityKeys(currentEvaluationCreator).includes(key)
            ))
          ) {
            setEvaluationOrganizationOwnerStateById((current) => ({
              ...current,
              [organizationId]: {
                status: "ready",
                ownerKey,
                identity: mergeEvaluationPersonIdentity(currentEvaluationCreator, fallbackOwner),
              },
            }));
            return;
          }
          setEvaluationOrganizationOwnerStateById((current) => ({
            ...current,
            [organizationId]: {
              status: "loading",
              ownerKey,
              identity: current?.[organizationId]?.identity || fallbackOwner,
            },
          }));
          try {
            const payload = await requestEvaluationBackendJson(
              "/organizations/" + encodeURIComponent(organizationId) + "/members",
              { method: "GET" },
              "Failed to load the organization owner."
            );
            const members = readPlaygroundEvaluationListFromPayload(payload, ["members", "organizationMembers", "organization_members"]);
            const matchingOwner = members.find((member) => (
              String(member?.role || "").trim().toLowerCase() === "owner"
            )) || members.find((member) => (
              getEvaluationPersonIdentityKeys(member).some((key) => (
                getEvaluationPersonIdentityKeys(fallbackOwner).includes(key)
              ))
            ));
            const resolvedOwner = mergeEvaluationPersonIdentity(
              normalizeEvaluationPersonIdentity(matchingOwner || {}),
              fallbackOwner,
            );
            setEvaluationOrganizationOwnerStateById((current) => ({
              ...current,
              [organizationId]: {
                status: "ready",
                ownerKey: getEvaluationOwnerCandidateKey(resolvedOwner) || ownerKey,
                identity: resolvedOwner,
              },
            }));
          } catch (error) {
            setEvaluationOrganizationOwnerStateById((current) => ({
              ...current,
              [organizationId]: {
                status: "error",
                ownerKey,
                identity: fallbackOwner,
                error: String(error?.message || error || "Failed to load the organization owner."),
              },
            }));
          }
        };
        useEffect(() => {
          if (!activeSet?.id || normalizedMode !== "detail") return;
          void loadEvaluationOrganizationOwner(activeSet);
        }, [
          activeSet?.id,
          activeSet?.updatedAt,
          normalizedMode,
          normalizedActiveEvaluationOrganizationId,
          evaluationOrganizations.length,
        ]);
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
              name: label,
              email: candidate.email || "",
              avatarUrl: candidate.avatarUrl || "",
              description: description || undefined,
              ariaLabel: description ? label + ", " + description : label,
              data: { candidate },
            };
          });
          const ownerIdentityKeys = new Set(getEvaluationPersonIdentityKeys(ownerIdentity));
          const selectedOption = ownerOptions.find((option) =>
            getEvaluationPersonIdentityKeys(option.data?.candidate).some((key) => ownerIdentityKeys.has(key))
          ) || null;
          const candidateState = evaluationOwnerCandidateStateBySetId?.[set?.id] || {};
          return React.createElement(PlatformOwnerSelector, {
            owner: {
              value: selectedOption?.value || getEvaluationOwnerCandidateKey(ownerIdentity),
              name: ownerLabel,
              email: ownerIdentity.email || "",
              avatarUrl: ownerIdentity.avatarUrl || "",
            },
            options: ownerOptions,
            open: evaluationOwnerSelectorOpen,
            onOpenChange: handleEvaluationOwnerSelectorOpenChange,
            onTransfer: (_nextValue, option) => {
              const nextOwner = option?.data?.candidate;
              if (nextOwner) updateEvaluationOwner(nextOwner);
            },
            ariaLabel: "Choose evaluation owner",
            resourceLabel: "evaluation",
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
        const getEvaluationTeamRolePermissionSet = (teamId, roleId, set = activeSet) => {
          return getPlatformTeamRolePermissionSet(
            getEvaluationAccessMetadata(set),
            teamId,
            roleId,
            "evaluation_team_role",
          );
        };
        const getEvaluationSystemRolePermissionSet = (
          principalId,
          roleId,
          set = activeSet
        ) => getPlatformSystemPrincipalRolePermissionSet(
          getEvaluationAccessMetadata(set),
          principalId,
          roleId,
          "evaluation_team_role"
        );
        const updateEvaluationSystemPermissionSet = (principalId, permissionSet) => {
          updateEvaluationAccessMetadata((metadata) => buildPlatformSystemPrincipalPermissionMetadata(
            metadata,
            principalId,
            permissionSet,
            "evaluation"
          ));
        };
        const updateEvaluationSystemRolePermissionSet = (principalId, roleId, permissionSet) => {
          updateEvaluationAccessMetadata((metadata) => buildPlatformSystemPrincipalRolePermissionMetadata(
            metadata,
            principalId,
            roleId,
            permissionSet,
            "evaluation_team_role"
          ));
        };
        const updateEvaluationTeamRolePermissionSet = (teamId, roleId, permissionSet) => {
          updateEvaluationAccessMetadata((metadata) => buildPlatformTeamRolePermissionMetadata(
            metadata,
            teamId,
            roleId,
            permissionSet,
            "evaluation_team_role"
          ));
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
        const renderEvaluationAccessSettings = () => {
          const selectedSystemPrincipal = getPlatformSystemAccessPrincipal(evaluationAccessTeamId);
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
            React.createElement(PlatformResourceAccessSettings, {
              teams: evaluationSharedTeams,
              resourceLabel: "Evaluation",
              selectedPrincipalId: evaluationAccessTeamId,
              onSelectedPrincipalIdChange: (nextPrincipalId) => {
                setEvaluationAccessTeamId(String(nextPrincipalId || ""));
                setEvaluationAccessRoleId("member");
                setEvaluationAccessMenuOpen(false);
              },
              subjectType: "evaluation",
              teamSubjectType: "evaluation_team_role",
              systemPermissionSet: selectedSystemPrincipal
                ? getEvaluationPermissionSet(activeSet, selectedSystemPrincipal.id)
                : null,
              onSystemPermissionSetChange: selectedSystemPrincipal
                ? (permissionSet) => updateEvaluationSystemPermissionSet(
                    selectedSystemPrincipal.id,
                    permissionSet
                  )
                : undefined,
              systemRolePermissionSet: selectedSystemPrincipal
                ? getEvaluationSystemRolePermissionSet(
                    selectedSystemPrincipal.id,
                    evaluationAccessRoleId
                  )
                : null,
              onSystemRolePermissionSetChange: selectedSystemPrincipal
                ? (roleId, permissionSet) => updateEvaluationSystemRolePermissionSet(
                    selectedSystemPrincipal.id,
                    roleId,
                    permissionSet
                  )
                : undefined,
              selectedRoleId: evaluationAccessRoleId,
              onSelectedRoleIdChange: setEvaluationAccessRoleId,
              teamPermissionSet: evaluationAccessTeamId && !selectedSystemPrincipal
                ? getEvaluationTeamRolePermissionSet(
                    evaluationAccessTeamId,
                    evaluationAccessRoleId
                  )
                : null,
              onTeamPermissionSetChange: evaluationAccessTeamId && !selectedSystemPrincipal
                ? (roleId, permissionSet) => updateEvaluationTeamRolePermissionSet(
                    evaluationAccessTeamId,
                    roleId,
                    permissionSet
                  )
                : undefined,
              actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
              backLabel: "Settings",
              tableProps: {
                trailing: addTeamsControl,
                busy: Boolean(evaluationAccessActionId),
                onRemoveTeams: (teams) => teams.forEach((team) => void removeEvaluationTeamAccess(team.id)),
                formatCreatedAt: formatPlaygroundEvaluationDate,
              },
            })
          );
        };
`;

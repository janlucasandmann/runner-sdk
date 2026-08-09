          function handleEnvironmentSelect(environmentId) {
            const normalizedEnvironmentId = String(environmentId || "").trim();
            if (!normalizedEnvironmentId) {
              return;
            }
            if (
              !isHomeViewActive
              && normalizedEnvironmentId === String(selectedEnvironmentId || "").trim()
            ) {
              return;
            }
            requestEnvironmentNavigation(() => {
              discardUnsavedEnvironmentDraft();
              setToolbarPopover("");
              setSearchPopupQuery("");
              setEnvironmentListActionMenuState(null);
              setServerResourceActionMenuState(null);
              setIsHomeViewActive(false);
              setSelectedEnvironmentId(normalizedEnvironmentId);
            });
          }
  
          function openEnvironmentComposer() {
            requestEnvironmentNavigation(() => {
              discardUnsavedEnvironmentDraft();
              resetEditorAuxiliaryState();
              setToolbarPopover("");
              setSearchPopupQuery("");
              setEnvironmentListActionMenuState(null);
              setServerResourceActionMenuState(null);
              setEnvironmentComposerSaveState({
                isSaving: false,
                error: "",
              });
              setEnvironmentComposerDraft({
                ...buildPlaygroundDefaultEnvironmentDraft(),
                name: "",
              });
              setEnvironmentComposerOpen(true);
            });
          }
  
          function closeEnvironmentComposer() {
            if (environmentComposerSaveState.isSaving) {
              return;
            }
            setEnvironmentComposerOpen(false);
            setIsEnvironmentComposerDescriptionEditing(false);
            setEnvironmentComposerRuntimePopover("");
            setEnvironmentComposerSaveState({
              isSaving: false,
              error: "",
            });
            setEnvironmentComposerDraft(buildPlaygroundDefaultEnvironmentDraft());
            if (creationOnly && typeof onCreationRequestClose === "function") {
              onCreationRequestClose({ reason: "cancelled" });
            }
          }
  
          function handleCreateEnvironment() {
            openEnvironmentComposer();
          }
  
          function clearEnvironmentListActionMenuCloseTimer() {
            if (environmentListActionMenuCloseTimerRef.current !== null && typeof window !== "undefined") {
              window.clearTimeout(environmentListActionMenuCloseTimerRef.current);
              environmentListActionMenuCloseTimerRef.current = null;
            }
          }
  
          function clearEnvironmentBulkActionMenuCloseTimer() {
            if (environmentBulkActionMenuCloseTimerRef.current !== null && typeof window !== "undefined") {
              window.clearTimeout(environmentBulkActionMenuCloseTimerRef.current);
              environmentBulkActionMenuCloseTimerRef.current = null;
            }
          }
  
          function closeEnvironmentListActionMenu(options = {}) {
            if (!environmentListActionMenuState) {
              return;
            }
            clearEnvironmentListActionMenuCloseTimer();
            if (options?.animate === false || typeof window === "undefined") {
              setEnvironmentListActionMenuClosing(false);
              setEnvironmentListActionMenuState(null);
              return;
            }
            setEnvironmentListActionMenuClosing(true);
            environmentListActionMenuCloseTimerRef.current = window.setTimeout(() => {
              environmentListActionMenuCloseTimerRef.current = null;
              setEnvironmentListActionMenuClosing(false);
              setEnvironmentListActionMenuState(null);
            }, 90);
          }
  
          function closeEnvironmentBulkActionMenu(options = {}) {
            if (!environmentBulkActionMenuState) {
              return;
            }
            clearEnvironmentBulkActionMenuCloseTimer();
            if (options?.animate === false || typeof window === "undefined") {
              setEnvironmentBulkActionMenuClosing(false);
              setEnvironmentBulkActionMenuState(null);
              return;
            }
            setEnvironmentBulkActionMenuClosing(true);
            environmentBulkActionMenuCloseTimerRef.current = window.setTimeout(() => {
              environmentBulkActionMenuCloseTimerRef.current = null;
              setEnvironmentBulkActionMenuClosing(false);
              setEnvironmentBulkActionMenuState(null);
            }, 90);
          }
  
          function getOverviewActionMenuPosition(event, menuHeight = 184, options = {}) {
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
  
          function getOverviewContextMenuPosition(event, menuHeight = 184) {
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
  
          function openEnvironmentListActionMenu(event, environment, options = {}) {
            if (!environment?.id) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            const position = options?.context
              ? getOverviewContextMenuPosition(event, 224)
              : getOverviewActionMenuPosition(event, 224, options);
            if (!options?.context && environmentListActionMenuState?.environmentId === environment.id && !environmentListActionMenuClosing) {
              closeEnvironmentListActionMenu();
              return;
            }
            clearEnvironmentListActionMenuCloseTimer();
            closeEnvironmentBulkActionMenu({ animate: false });
            setEnvironmentListActionMenuClosing(false);
            setEnvironmentListActionMenuState({
              environmentId: environment.id,
              environmentRecord: environment,
              ...position,
            });
            setServerResourceActionMenuState(null);
          }
  
          function openEnvironmentBulkActionMenu(event, environmentIds = [], options = {}) {
            const selectedIds = Array.isArray(environmentIds)
              ? environmentIds.map((environmentId) => String(environmentId || "").trim()).filter(Boolean)
              : [];
            if (selectedIds.length < 2) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            const position = options?.context
              ? getOverviewContextMenuPosition(event, 132)
              : getOverviewActionMenuPosition(event, 132, options);
            clearEnvironmentBulkActionMenuCloseTimer();
            closeEnvironmentListActionMenu({ animate: false });
            setEnvironmentBulkActionMenuClosing(false);
            setEnvironmentBulkActionMenuState({
              environmentIds: selectedIds,
              ...position,
            });
            setServerResourceActionMenuState(null);
          }
  
          function closeServerResourceActionMenu() {
            setServerResourceActionMenuState(null);
          }
  
          function openServerResourceActionMenu(event, resource, options = {}) {
            if (!resource?.id) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            const normalizedResourceType = resource.resourceType === "database" ? "database" : "server";
            const position = getOverviewActionMenuPosition(event, 184, options);
            setServerResourceActionMenuState((current) =>
              current?.resourceId === resource.id && current?.resourceType === normalizedResourceType
                ? null
                : {
                    resourceId: resource.id,
                    resourceType: normalizedResourceType,
                    resourceRecord: resource,
                    ...position,
                  }
            );
            setEnvironmentListActionMenuState(null);
          }
  
          function handleServerSelect(serverId) {
            void commitDraftServerIfDirty();
            setToolbarPopover("");
            setSearchPopupQuery("");
            setServerActionsPopoverOpen(false);
            setServerResourceActionMenuState(null);
            setServerDetailTab("usage");
            setServerUsageActivityTab("logs");
            setSourceServerSettingsTableTab("access");
            setAuthDetailTab("users");
  	          setSecretsDetailTab("secrets");
            setAgentRuntimeDetailTab("usage");
            setServerBindingState({
              savingKey: "",
              error: "",
            });
            setIsHomeViewActive(false);
            setSelectedDatabaseId("");
            setDraftDatabase(null);
            setSelectedServerId(serverId);
          }
  
          function handleDatabaseSelect(databaseId) {
            void commitDraftServerIfDirty();
            setToolbarPopover("");
            setSearchPopupQuery("");
            setServerActionsPopoverOpen(false);
            setDatabaseActionsPopoverOpen(false);
            setServerResourceActionMenuState(null);
            setIsHomeViewActive(false);
            setSelectedServerId("");
            setSelectedDatabaseId(databaseId);
          }
  
          function updateDraftDatabase(updater) {
            if (isSelectedDatabaseTemplatePreview) {
              return;
            }
            setDraftDatabase((current) => {
              const base = current || normalizePlaygroundDatabaseRecord(selectedDatabaseSnapshot || buildPlaygroundDefaultDatabaseDraft());
              return typeof updater === "function" ? updater(base) : updater;
            });
            setDatabaseSaveState((current) => ({
              ...current,
              error: "",
              message: "",
            }));
          }
  
          function updateDatabaseField(field, value) {
            updateDraftDatabase((current) => ({
              ...current,
              [field]: value,
            }));
          }
  
          function getDatabaseMetadataRecord(database) {
            return database?.metadata && typeof database.metadata === "object" && !Array.isArray(database.metadata)
              ? database.metadata
              : {};
          }
  
          function getDatabaseSharedTeamIds(database) {
            const metadata = getDatabaseMetadataRecord(database);
            const configuredTeamIds = [
              ...(Array.isArray(metadata.sharedTeamIds) ? metadata.sharedTeamIds : []),
              ...(Array.isArray(metadata.teamAccessIds) ? metadata.teamAccessIds : []),
            ];
            const teamPermissionSets = metadata.teamPermissionSets && typeof metadata.teamPermissionSets === "object" && !Array.isArray(metadata.teamPermissionSets)
              ? metadata.teamPermissionSets
              : {};
            const teamRolePermissionSets = metadata.teamRolePermissionSets && typeof metadata.teamRolePermissionSets === "object" && !Array.isArray(metadata.teamRolePermissionSets)
              ? metadata.teamRolePermissionSets
              : {};
            return Array.from(new Set([
              ...configuredTeamIds,
              ...Object.keys(teamPermissionSets),
              ...Object.keys(teamRolePermissionSets),
            ].map((teamId) => String(teamId || "").trim()).filter(Boolean)));
          }
  
          function getDatabaseOwnerIdentitySources(record) {
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
          }
  
          function readDatabaseOwnerIdentityValue(record, keys = []) {
            for (const source of getDatabaseOwnerIdentitySources(record)) {
              for (const key of keys) {
                const value = String(source?.[key] || "").trim();
                if (value) return value;
              }
            }
            return "";
          }
  
          function normalizeDatabaseOwnerIdentity(record, fallback = {}) {
            const email = (readDatabaseOwnerIdentityValue(record, [
              "email", "emailAddress", "email_address", "mail", "primaryEmail", "primary_email",
            ]) || String(fallback.email || "")).trim().toLowerCase();
            const userId = readDatabaseOwnerIdentityValue(record, [
              "userId", "user_id", "uid", "localId", "local_id", "firebaseUid", "firebase_uid",
              "ownerUserId", "owner_user_id",
            ]) || String(fallback.userId || "").trim();
            const id = readDatabaseOwnerIdentityValue(record, [
              "id", "memberId", "member_id", "ownerId", "owner_id",
            ]) || userId || email || String(fallback.id || "").trim();
            const name = readDatabaseOwnerIdentityValue(record, [
              "displayName", "display_name", "name", "fullName", "full_name", "memberName", "member_name",
              "ownerName", "owner_name",
            ]) || String(fallback.name || "").trim() || email || "Owner";
            const rawAvatarUrl = readDatabaseOwnerIdentityValue(record, [
              "photoURL", "photoUrl", "photo_url", "avatarUrl", "avatar_url", "avatar", "picture",
              "imageUrl", "image_url", "ownerAvatarUrl", "owner_avatar_url",
            ]) || String(fallback.avatarUrl || "").trim();
            const avatarUrl = normalizeSessionPhotoUrl(rawAvatarUrl || "");
            return {
              type: "user",
              id,
              userId,
              name,
              email,
              avatarUrl: canRenderAvatarImage(avatarUrl) ? avatarUrl : "",
            };
          }
  
          function getDatabaseOwnerIdentityKey(identity) {
            const normalizedIdentity = normalizeDatabaseOwnerIdentity(identity);
            return String(normalizedIdentity.email || normalizedIdentity.userId || normalizedIdentity.id || "").trim().toLowerCase();
          }
  
          function getDatabaseOwnerIdentityKeys(record) {
            const identity = normalizeDatabaseOwnerIdentity(record);
            const keys = [identity.email, identity.userId, identity.id];
            getDatabaseOwnerIdentitySources(record).forEach((source) => {
              [
                source.email,
                source.emailAddress,
                source.email_address,
                source.userId,
                source.user_id,
                source.uid,
                source.localId,
                source.local_id,
                source.id,
                source.memberId,
                source.member_id,
              ].forEach((value) => keys.push(value));
            });
            return Array.from(new Set(
              keys.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)
            ));
          }
  
          function buildDatabaseOwnerProfileMap(payload) {
            const profileMap = new Map();
            const addProfile = (profile, explicitKey = "") => {
              if (!profile || typeof profile !== "object" || Array.isArray(profile)) return;
              const normalizedProfile = explicitKey ? { id: explicitKey, ...profile } : profile;
              getDatabaseOwnerIdentityKeys(normalizedProfile).forEach((key) => profileMap.set(key, normalizedProfile));
            };
            const addProfiles = (value) => {
              if (Array.isArray(value)) {
                value.forEach((profile) => addProfile(profile));
                return;
              }
              if (!value || typeof value !== "object") return;
              if (getDatabaseOwnerIdentityKeys(value).length > 0) addProfile(value);
              if (Array.isArray(value.data)) {
                value.data.forEach((profile) => addProfile(profile));
                return;
              }
              Object.entries(value).forEach(([key, profile]) => addProfile(profile, key));
            };
            [
              payload,
              payload?.profile,
              payload?.user,
              payload?.account,
              payload?.profiles,
              payload?.memberProfiles,
              payload?.member_profiles,
              payload?.users,
              payload?.accounts,
              payload?.data,
              payload?.data?.profiles,
              payload?.data?.memberProfiles,
              payload?.data?.member_profiles,
              payload?.data?.users,
              payload?.data?.accounts,
              payload?.included?.profiles,
              payload?.included?.users,
              payload?.included?.accounts,
            ].forEach(addProfiles);
            return profileMap;
          }
  
          function mergeDatabaseOwnerMemberProfiles(members, ...profilePayloads) {
            const profileMap = new Map();
            profilePayloads.forEach((payload) => {
              buildDatabaseOwnerProfileMap(payload).forEach((profile, key) => profileMap.set(key, profile));
            });
            return (Array.isArray(members) ? members : []).map((member) => {
              const matchingProfile = getDatabaseOwnerIdentityKeys(member)
                .map((key) => profileMap.get(key))
                .find(Boolean);
              if (!matchingProfile) return member;
              const mergedIdentity = normalizeDatabaseOwnerIdentity({
                ...member,
                profile: {
                  ...(member?.profile && typeof member.profile === "object" && !Array.isArray(member.profile) ? member.profile : {}),
                  ...matchingProfile,
                },
                user: {
                  ...(member?.user && typeof member.user === "object" && !Array.isArray(member.user) ? member.user : {}),
                  ...matchingProfile,
                },
              });
              return {
                ...member,
                name: mergedIdentity.name,
                displayName: mergedIdentity.name,
                email: mergedIdentity.email,
                photoURL: mergedIdentity.avatarUrl,
                photoUrl: mergedIdentity.avatarUrl,
                avatarUrl: mergedIdentity.avatarUrl,
                profile: {
                  ...(member?.profile && typeof member.profile === "object" && !Array.isArray(member.profile) ? member.profile : {}),
                  ...matchingProfile,
                },
                user: {
                  ...(member?.user && typeof member.user === "object" && !Array.isArray(member.user) ? member.user : {}),
                  ...matchingProfile,
                },
              };
            });
          }
  
          async function fetchDatabaseOwnerMemberProfilePayload(teamId, members = []) {
            const normalizedTeamId = String(teamId || "").trim();
            const memberPayload = Array.isArray(members) ? members : [];
            try {
              const { response, data } = await fetchJsonWithTimeout(backendUrl + "/team-member-profiles/lookup", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ teamId: normalizedTeamId, members: memberPayload }),
              }, 8000);
              const profiles = Array.isArray(data?.profiles) ? data.profiles : Array.isArray(data?.data) ? data.data : [];
              if (response.ok && profiles.length > 0) return data;
            } catch {}
            for (const path of [
              "/teams/" + encodeURIComponent(normalizedTeamId) + "/member-profiles",
              "/teams/" + encodeURIComponent(normalizedTeamId) + "/members/profiles",
            ]) {
              try {
                const { response, data } = await fetchJsonWithTimeout(backendUrl + path, {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                  headers: requestHeaders,
                }, 5000);
                if (response.ok) return data;
              } catch {}
            }
            return null;
          }
  
          function isHumanDatabaseOwnerCandidate(record) {
            const sources = getDatabaseOwnerIdentitySources(record);
            const identityType = readDatabaseOwnerIdentityValue(record, [
              "type", "identityType", "identity_type", "memberType", "member_type", "accountType", "account_type",
            ]).toLowerCase();
            const status = readDatabaseOwnerIdentityValue(record, ["status", "membershipStatus", "membership_status"]).toLowerCase();
            if (["revoked", "removed", "disabled", "deleted"].includes(status)) return false;
            if (["bot", "agent", "service", "service_account", "machine", "integration"].includes(identityType)) return false;
            if (sources.some((source) => source.isBot === true || source.is_bot === true || source.bot === true || source.serviceAccount === true)) {
              return false;
            }
            const identity = normalizeDatabaseOwnerIdentity(record);
            return Boolean(identity.id || identity.userId || identity.email);
          }
  
          function getDatabaseOwnerIdentity(database) {
            const metadata = getDatabaseMetadataRecord(database);
            const fallbackIdentity = {
              id: metadata.ownerId || metadata.owner_id || database?.userId || currentUserId || "",
              userId: metadata.ownerUserId || metadata.owner_user_id || database?.userId || currentUserId || "",
              name: metadata.ownerName || metadata.owner_name || currentUserName || "Owner",
              email: metadata.ownerEmail || metadata.owner_email || currentUserEmail || "",
              avatarUrl: metadata.ownerAvatarUrl || metadata.owner_avatar_url || currentUserAvatarUrl || "",
            };
            return normalizeDatabaseOwnerIdentity(metadata.owner || database?.owner || null, fallbackIdentity);
          }

          function getDatabaseCreatorIdentity(database) {
            return normalizeDatabaseOwnerIdentity(
              getDevelopResourceCreatorIdentity(database, getCurrentDevelopResourceIdentityInput())
            );
          }

          function renderDevelopResourceIdentityValue(identity) {
            const normalizedIdentity = normalizeDatabaseOwnerIdentity(identity);
            const label = String(
              normalizedIdentity.name || normalizedIdentity.email || normalizedIdentity.userId || "Unknown"
            ).trim();
            return React.createElement("span", { className: "playground-team-member-cell playground-develop-resource-identity-value" },
              React.createElement(AccountAvatar, {
                className: "playground-team-member-avatar",
                imageClassName: "playground-team-member-avatar-image",
                fallbackLabel: getAccountInitials(label),
                photoUrl: normalizedIdentity.avatarUrl || "",
              }),
              React.createElement("span", { className: "playground-team-member-copy" },
                React.createElement("span", { className: "playground-team-table-title" }, label)
              )
            );
          }
  
          function isCurrentUserDatabaseOwner(database) {
            const ownerKeys = new Set(getDatabaseOwnerIdentityKeys(getDatabaseOwnerIdentity(database)));
            const viewerKeys = getDatabaseOwnerIdentityKeys({
              id: currentUserId,
              userId: currentUserId,
              name: currentUserName,
              email: currentUserEmail,
              avatarUrl: currentUserAvatarUrl,
            });
            return viewerKeys.some((key) => ownerKeys.has(key));
          }
  
          function applyDatabaseOwnerIdentity(database, ownerIdentity) {
            const normalizedDatabase = normalizePlaygroundDatabaseRecord(database);
            const owner = normalizeDatabaseOwnerIdentity(ownerIdentity);
            const metadata = {
              ...getDatabaseMetadataRecord(normalizedDatabase),
              owner,
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
            };
            return normalizePlaygroundDatabaseRecord({
              ...normalizedDatabase,
              metadata,
            });
          }

          function applyEnvironmentOwnerIdentity(environmentRecord, ownerIdentity) {
            const normalizedEnvironment = normalizePlaygroundEnvironmentRecord(environmentRecord);
            const owner = normalizeDatabaseOwnerIdentity(ownerIdentity);
            const metadata = {
              ...getEnvironmentMetadataRecord(normalizedEnvironment),
              owner,
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
            };
            return normalizePlaygroundEnvironmentRecord({
              ...normalizedEnvironment,
              metadata,
            });
          }
  
          async function loadDatabaseOwnerTeamMembers(teamId) {
            const normalizedTeamId = String(teamId || "").trim();
            if (!normalizedTeamId) return;
            try {
              const { response, data } = await fetchJsonWithTimeout(
                backendUrl + "/teams/" + encodeURIComponent(normalizedTeamId)
                  + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
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
              const members = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.members)
                  ? data.members
                  : [];
  	            const initialMembers = mergeDatabaseOwnerMemberProfiles(members, data);
              setDatabaseOwnerTeamMembersById((current) => ({
                ...current,
  	              [normalizedTeamId]: initialMembers,
              }));
  	            const profilePayload = await fetchDatabaseOwnerMemberProfilePayload(normalizedTeamId, members);
  	            if (profilePayload) {
  	              const enrichedMembers = mergeDatabaseOwnerMemberProfiles(members, data, profilePayload);
  	              setDatabaseOwnerTeamMembersById((current) => ({
  	                ...current,
  	                [normalizedTeamId]: enrichedMembers,
  	              }));
  	            }
            } catch {
              setDatabaseOwnerTeamMembersById((current) => ({
                ...current,
                [normalizedTeamId]: Array.isArray(current[normalizedTeamId]) ? current[normalizedTeamId] : [],
              }));
            }
          }

          async function loadEnvironmentOwnerTeamMembers(teamId) {
            const normalizedTeamId = String(teamId || "").trim();
            if (!normalizedTeamId) return;
            try {
              const { response, data } = await fetchJsonWithTimeout(
                backendUrl + "/teams/" + encodeURIComponent(normalizedTeamId)
                  + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
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
              const members = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.members)
                  ? data.members
                  : [];
              const initialMembers = mergeDatabaseOwnerMemberProfiles(members, data);
              setEnvironmentOwnerTeamMembersById((current) => ({
                ...current,
                [normalizedTeamId]: initialMembers,
              }));
              const profilePayload = await fetchDatabaseOwnerMemberProfilePayload(normalizedTeamId, members);
              if (profilePayload) {
                const enrichedMembers = mergeDatabaseOwnerMemberProfiles(members, data, profilePayload);
                setEnvironmentOwnerTeamMembersById((current) => ({
                  ...current,
                  [normalizedTeamId]: enrichedMembers,
                }));
              }
            } catch {
              setEnvironmentOwnerTeamMembersById((current) => ({
                ...current,
                [normalizedTeamId]: Array.isArray(current[normalizedTeamId]) ? current[normalizedTeamId] : [],
              }));
            }
          }
  
          function getDatabaseTeamPermissionSets(database) {
            const metadata = getDatabaseMetadataRecord(database);
            return metadata.teamPermissionSets && typeof metadata.teamPermissionSets === "object" && !Array.isArray(metadata.teamPermissionSets)
              ? metadata.teamPermissionSets
              : {};
          }
  
          function getDatabaseTeamPermissionSet(database, teamId) {
            const normalizedTeamId = String(teamId || "").trim();
            const permissionSets = getDatabaseTeamPermissionSets(database);
            return normalizePlaygroundPermissionSet(permissionSets[normalizedTeamId], "database");
          }
  
          function getDatabaseTeamRolePermissionSetsMap(database) {
            const metadata = getDatabaseMetadataRecord(database);
            return metadata.teamRolePermissionSets && typeof metadata.teamRolePermissionSets === "object" && !Array.isArray(metadata.teamRolePermissionSets)
              ? metadata.teamRolePermissionSets
              : {};
          }
  
          function getDatabaseTeamRolePermissionSets(database, teamId) {
            const normalizedTeamId = String(teamId || "").trim();
            const configuredSets = getDatabaseTeamRolePermissionSetsMap(database)[normalizedTeamId];
            const legacyPermissionSet = getDatabaseTeamPermissionSets(database)[normalizedTeamId];
            const source = configuredSets && typeof configuredSets === "object" && !Array.isArray(configuredSets)
              ? configuredSets
              : {};
            return PLAYGROUND_TEAM_ROLE_DEFINITIONS.reduce((result, role) => {
              result[role.id] = role.id === "owner"
                ? createPlaygroundDatabaseTeamRolePermissionSet(role.id)
                : normalizePlaygroundRolePermissionSet(
                    source[role.id] || legacyPermissionSet,
                    "database",
                    role.id
                  );
              return result;
            }, {});
          }
  
          function getDatabaseTeamRolePermissionSet(database, teamId, roleId) {
            const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
            return getDatabaseTeamRolePermissionSets(database, teamId)[normalizedRoleId];
          }
  
          async function flushQueuedDatabasePermissionSave() {
            if (databasePermissionSaveInFlightRef.current) {
              return;
            }
  
            databasePermissionSaveInFlightRef.current = true;
            try {
              while (databasePermissionSaveQueuedRef.current) {
                const databaseToSave = normalizePlaygroundDatabaseRecord(databasePermissionSaveQueuedRef.current);
                databasePermissionSaveQueuedRef.current = null;
                setDatabaseSaveState({
                  isSaving: true,
                  error: "",
                  message: "",
                });
  
                try {
                  const savedDatabase = await persistDatabaseRecord(databaseToSave);
                  if (!savedDatabase) {
                    throw new Error("Database permissions save failed.");
                  }
                  upsertLocalDatabaseRecord(savedDatabase);
                  if (selectedDatabaseIdRef.current === savedDatabase.id) {
                    setDraftDatabase((current) => {
                      if (current?.id !== savedDatabase.id) {
                        return current;
                      }
                      const currentMetadata = getDatabaseMetadataRecord(current);
                      const savedMetadata = getDatabaseMetadataRecord(savedDatabase);
                      return normalizePlaygroundDatabaseRecord({
                        ...savedDatabase,
                        permissionSet: current.permissionSet,
                        metadata: {
                          ...savedMetadata,
                          sharedTeamIds: currentMetadata.sharedTeamIds || [],
                          teamAccessIds: currentMetadata.teamAccessIds || [],
                          teamPermissionSets: currentMetadata.teamPermissionSets || {},
                          teamRolePermissionSets: currentMetadata.teamRolePermissionSets || {},
                        },
                      });
                    });
                  }
                } catch (error) {
                  setDatabaseSaveState({
                    isSaving: false,
                    error: error instanceof Error ? error.message : "Failed to save database permissions.",
                    message: "",
                  });
                  return;
                }
              }
  
              setDatabaseSaveState({
                isSaving: false,
                error: "",
                message: "",
              });
            } finally {
              databasePermissionSaveInFlightRef.current = false;
              if (databasePermissionSaveQueuedRef.current && !databasePermissionSaveTimerRef.current) {
                databasePermissionSaveTimerRef.current = window.setTimeout(() => {
                  databasePermissionSaveTimerRef.current = null;
                  void flushQueuedDatabasePermissionSave();
                }, 0);
              }
            }
          }
  
          function queueDatabasePermissionSave(database) {
            if (
              !database?.id
              || database.id === PLAYGROUND_DATABASE_DRAFT_ID
              || isSelectedDatabaseTemplatePreview
              || isPlaygroundResourceTemplatePreviewRecord(database)
            ) {
              return;
            }
            databasePermissionSaveQueuedRef.current = normalizePlaygroundDatabaseRecord(database);
            if (databasePermissionSaveTimerRef.current) {
              window.clearTimeout(databasePermissionSaveTimerRef.current);
            }
            databasePermissionSaveTimerRef.current = window.setTimeout(() => {
              databasePermissionSaveTimerRef.current = null;
              void flushQueuedDatabasePermissionSave();
            }, 500);
          }
  
          function updateDatabasePermissionSet(updater) {
            if (isSelectedDatabaseTemplatePreview) {
              return;
            }
            const currentDatabase = normalizePlaygroundDatabaseRecord(
              draftDatabase || selectedDatabaseSnapshot || buildPlaygroundDefaultDatabaseDraft()
            );
            const principalId = isPlatformSystemAccessPrincipalId(databasePermissionTeamId)
              ? normalizePlatformAccessPrincipalId(databasePermissionTeamId)
              : PLATFORM_ALL_AGENTS_PRINCIPAL_ID;
            const currentPermissionSet = getPlatformSystemPrincipalPermissionSet(
              currentDatabase.metadata,
              principalId,
              "database",
              currentDatabase.permissionSet
            );
            const nextPermissionSet = normalizePlaygroundPermissionSet(
              typeof updater === "function" ? updater(currentPermissionSet) : updater,
              "database"
            );
            const nextDatabase = principalId === PLATFORM_ALL_AGENTS_PRINCIPAL_ID
              ? {
                  ...currentDatabase,
                  permissionSet: nextPermissionSet,
                }
              : {
                  ...currentDatabase,
                  metadata: buildPlatformSystemPrincipalPermissionMetadata(
                    currentDatabase.metadata,
                    principalId,
                    nextPermissionSet,
                    "database"
                  ),
                };
            updateDraftDatabase(nextDatabase);
            queueDatabasePermissionSave(nextDatabase);
          }
  
          function updateDatabasePermissionRingAccess(ringId, access) {
            const normalizedRingId = normalizePlaygroundPermissionRingId(ringId, "");
            if (!normalizedRingId) {
              return;
            }
            const nextAccess = normalizePlaygroundPermissionAccess(access);
            updateDatabasePermissionSet((currentPermissionSet) => {
              const currentRings = currentPermissionSet.rings || createPlaygroundDefaultPermissionRings();
              const currentRingPolicy = currentRings[normalizedRingId] || {
                defaultAccess: getPlaygroundPermissionRingDefinition(normalizedRingId).defaultAccess,
              };
              return {
                ...currentPermissionSet,
                version: 1,
                subjectType: "database",
                rings: {
                  ...currentRings,
                  [normalizedRingId]: {
                    ...currentRingPolicy,
                    defaultAccess: nextAccess,
                  },
                },
              };
            });
          }
  
          function updateDatabasePermissionActionRing(actionId, ringId) {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            if (!actionDefinition || !actionDefinition.subjectTypes?.includes("database")) {
              return;
            }
            const nextRingId = normalizePlaygroundPermissionRingId(ringId, actionDefinition.ringId);
            updateDatabasePermissionSet((currentPermissionSet) => {
              const currentActions = currentPermissionSet.actions || createPlaygroundDefaultPermissionActions();
              const currentActionPolicy = currentActions[actionDefinition.id] || {
                ringId: actionDefinition.ringId,
              };
              const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
              return {
                ...currentPermissionSet,
                version: 1,
                subjectType: "database",
                actions: {
                  ...currentActions,
                  [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
                    currentPermissionSet,
                    actionDefinition,
                    currentActionPolicy,
                    explicitAccess,
                    nextRingId
                  ),
                },
              };
            });
          }
  
          function updateDatabasePermissionActionAccess(actionId, access) {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            if (!actionDefinition || !actionDefinition.subjectTypes?.includes("database")) {
              return;
            }
            const shouldInherit = !String(access || "").trim();
            const nextAccess = shouldInherit ? "" : normalizePlaygroundPermissionAccess(access);
            updateDatabasePermissionSet((currentPermissionSet) => {
              const currentActions = currentPermissionSet.actions || createPlaygroundDefaultPermissionActions();
              const currentActionPolicy = currentActions[actionDefinition.id] || {
                ringId: actionDefinition.ringId,
              };
              return {
                ...currentPermissionSet,
                version: 1,
                subjectType: "database",
                actions: {
                  ...currentActions,
                  [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
                    currentPermissionSet,
                    actionDefinition,
                    currentActionPolicy,
                    shouldInherit ? "" : nextAccess
                  ),
                },
              };
            });
          }
  
          function updateDatabaseTeamPermissionSet(teamId, updater) {
            const normalizedTeamId = String(teamId || "").trim();
            if (!normalizedTeamId || isSelectedDatabaseTemplatePreview) {
              return;
            }
            const currentDatabase = normalizePlaygroundDatabaseRecord(
              draftDatabase || selectedDatabaseSnapshot || buildPlaygroundDefaultDatabaseDraft()
            );
            const currentPermissionSets = getDatabaseTeamPermissionSets(currentDatabase);
            const currentPermissionSet = getDatabaseTeamPermissionSet(currentDatabase, normalizedTeamId);
            const nextPermissionSet = normalizePlaygroundPermissionSet(
              typeof updater === "function" ? updater(currentPermissionSet) : updater,
              "database"
            );
            const metadata = {
              ...getDatabaseMetadataRecord(currentDatabase),
              teamPermissionSets: {
                ...currentPermissionSets,
                [normalizedTeamId]: nextPermissionSet,
              },
            };
            const nextDatabase = normalizePlaygroundDatabaseRecord({
              ...currentDatabase,
              metadata,
            });
            updateDraftDatabase(nextDatabase);
            queueDatabasePermissionSave(nextDatabase);
          }
  
          function updateDatabaseTeamPermissionRingAccess(teamId, ringId, access) {
            const normalizedRingId = normalizePlaygroundPermissionRingId(ringId, "");
            if (!normalizedRingId) {
              return;
            }
            const nextAccess = normalizePlaygroundPermissionAccess(access);
            updateDatabaseTeamPermissionSet(teamId, (currentPermissionSet) => {
              const currentRings = currentPermissionSet.rings || createPlaygroundDefaultPermissionRings();
              const currentRingPolicy = currentRings[normalizedRingId] || {
                defaultAccess: getPlaygroundPermissionRingDefinition(normalizedRingId).defaultAccess,
              };
              return {
                ...currentPermissionSet,
                version: 1,
                subjectType: "database",
                rings: {
                  ...currentRings,
                  [normalizedRingId]: {
                    ...currentRingPolicy,
                    defaultAccess: nextAccess,
                  },
                },
              };
            });
          }
  
          function updateDatabaseTeamPermissionActionRing(teamId, actionId, ringId) {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            if (!actionDefinition || !actionDefinition.subjectTypes?.includes("database")) {
              return;
            }
            const nextRingId = normalizePlaygroundPermissionRingId(ringId, actionDefinition.ringId);
            updateDatabaseTeamPermissionSet(teamId, (currentPermissionSet) => {
              const currentActions = currentPermissionSet.actions || createPlaygroundDefaultPermissionActions();
              const currentActionPolicy = currentActions[actionDefinition.id] || {
                ringId: actionDefinition.ringId,
              };
              const explicitAccess = getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition);
              return {
                ...currentPermissionSet,
                version: 1,
                subjectType: "database",
                actions: {
                  ...currentActions,
                  [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
                    currentPermissionSet,
                    actionDefinition,
                    currentActionPolicy,
                    explicitAccess,
                    nextRingId
                  ),
                },
              };
            });
          }
  
          function updateDatabaseTeamPermissionActionAccess(teamId, actionId, access) {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            if (!actionDefinition || !actionDefinition.subjectTypes?.includes("database")) {
              return;
            }
            const shouldInherit = !String(access || "").trim();
            const nextAccess = shouldInherit ? "" : normalizePlaygroundPermissionAccess(access);
            updateDatabaseTeamPermissionSet(teamId, (currentPermissionSet) => {
              const currentActions = currentPermissionSet.actions || createPlaygroundDefaultPermissionActions();
              const currentActionPolicy = currentActions[actionDefinition.id] || {
                ringId: actionDefinition.ringId,
              };
              return {
                ...currentPermissionSet,
                version: 1,
                subjectType: "database",
                actions: {
                  ...currentActions,
                  [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
                    currentPermissionSet,
                    actionDefinition,
                    currentActionPolicy,
                    shouldInherit ? "" : nextAccess
                  ),
                },
              };
            });
          }
  
          function updateDatabaseTeamRolePermissionSet(teamId, roleId, updater) {
            const normalizedTeamId = String(teamId || "").trim();
            const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
            if (!normalizedTeamId || normalizedRoleId === "owner" || isSelectedDatabaseTemplatePreview) return;
            const currentDatabase = normalizePlaygroundDatabaseRecord(
              draftDatabase || selectedDatabaseSnapshot || buildPlaygroundDefaultDatabaseDraft()
            );
            const currentRoleSetsMap = getDatabaseTeamRolePermissionSetsMap(currentDatabase);
            const currentTeamRoleSets = getDatabaseTeamRolePermissionSets(currentDatabase, normalizedTeamId);
            const currentPermissionSet = getDatabaseTeamRolePermissionSet(currentDatabase, normalizedTeamId, normalizedRoleId);
            const nextPermissionSet = normalizePlaygroundPermissionSet(
              typeof updater === "function" ? updater(currentPermissionSet) : updater,
              "database"
            );
            const nextDatabase = normalizePlaygroundDatabaseRecord({
              ...currentDatabase,
              metadata: {
                ...getDatabaseMetadataRecord(currentDatabase),
                teamRolePermissionSets: {
                  ...currentRoleSetsMap,
                  [normalizedTeamId]: {
                    ...currentTeamRoleSets,
                    [normalizedRoleId]: nextPermissionSet,
                  },
                },
              },
            });
            updateDraftDatabase(nextDatabase);
            queueDatabasePermissionSave(nextDatabase);
          }
  
          function updateDatabaseTeamRolePermissionRingAccess(teamId, roleId, ringId, access) {
            const normalizedRingId = normalizePlaygroundPermissionRingId(ringId, "");
            if (!normalizedRingId) return;
            updateDatabaseTeamRolePermissionSet(teamId, roleId, (currentPermissionSet) => ({
              ...currentPermissionSet,
              version: 1,
              subjectType: "database",
              rings: {
                ...(currentPermissionSet.rings || createPlaygroundDefaultPermissionRings()),
                [normalizedRingId]: {
                  ...(currentPermissionSet.rings?.[normalizedRingId] || {}),
                  defaultAccess: normalizePlaygroundPermissionAccess(access),
                },
              },
            }));
          }
  
          function updateDatabaseTeamRolePermissionActionRing(teamId, roleId, actionId, ringId) {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            if (!actionDefinition?.subjectTypes?.includes("database")) return;
            updateDatabaseTeamRolePermissionSet(teamId, roleId, (currentPermissionSet) => {
              const currentActions = currentPermissionSet.actions || createPlaygroundDefaultPermissionActions();
              const currentActionPolicy = currentActions[actionDefinition.id] || { ringId: actionDefinition.ringId };
              return {
                ...currentPermissionSet,
                version: 1,
                subjectType: "database",
                actions: {
                  ...currentActions,
                  [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
                    currentPermissionSet,
                    actionDefinition,
                    currentActionPolicy,
                    getPlaygroundPermissionActionExplicitAccess(currentPermissionSet, actionDefinition),
                    normalizePlaygroundPermissionRingId(ringId, actionDefinition.ringId)
                  ),
                },
              };
            });
          }
  
          function updateDatabaseTeamRolePermissionActionAccess(teamId, roleId, actionId, access) {
            const actionDefinition = getPlaygroundPermissionActionDefinition(actionId);
            if (!actionDefinition?.subjectTypes?.includes("database")) return;
            updateDatabaseTeamRolePermissionSet(teamId, roleId, (currentPermissionSet) => {
              const currentActions = currentPermissionSet.actions || createPlaygroundDefaultPermissionActions();
              const currentActionPolicy = currentActions[actionDefinition.id] || { ringId: actionDefinition.ringId };
              return {
                ...currentPermissionSet,
                version: 1,
                subjectType: "database",
                actions: {
                  ...currentActions,
                  [actionDefinition.id]: buildPlaygroundPermissionActionPolicy(
                    currentPermissionSet,
                    actionDefinition,
                    currentActionPolicy,
                    access
                  ),
                },
              };
            });
          }
  
          function buildDatabaseTeamAccessRecord(database, teamId, shouldInclude) {
            const normalizedDatabase = normalizePlaygroundDatabaseRecord(database);
            const normalizedTeamId = String(teamId || "").trim();
            const metadata = getDatabaseMetadataRecord(normalizedDatabase);
            const currentPermissionSets = getDatabaseTeamPermissionSets(normalizedDatabase);
            const currentRolePermissionSets = getDatabaseTeamRolePermissionSetsMap(normalizedDatabase);
            const nextTeamIds = getDatabaseSharedTeamIds(normalizedDatabase)
              .filter((currentTeamId) => currentTeamId !== normalizedTeamId);
            const nextPermissionSets = { ...currentPermissionSets };
            const nextRolePermissionSets = { ...currentRolePermissionSets };
            if (shouldInclude) {
              nextTeamIds.push(normalizedTeamId);
              nextPermissionSets[normalizedTeamId] = getDatabaseTeamPermissionSet(normalizedDatabase, normalizedTeamId);
              nextRolePermissionSets[normalizedTeamId] = getDatabaseTeamRolePermissionSets(normalizedDatabase, normalizedTeamId);
            } else {
              delete nextPermissionSets[normalizedTeamId];
              delete nextRolePermissionSets[normalizedTeamId];
            }
            const uniqueTeamIds = Array.from(new Set(nextTeamIds.filter(Boolean)));
            return normalizePlaygroundDatabaseRecord({
              ...normalizedDatabase,
              metadata: {
                ...metadata,
                sharedTeamIds: uniqueTeamIds,
                teamAccessIds: uniqueTeamIds,
                teamPermissionSets: nextPermissionSets,
                teamRolePermissionSets: nextRolePermissionSets,
              },
            });
          }
  
          async function persistDatabaseTeamAccessRecord(database) {
            const savedDatabase = await persistDatabaseRecord(database);
            if (!savedDatabase) {
              throw new Error("Failed to save database team access.");
            }
            upsertLocalDatabaseRecord(savedDatabase);
            if (selectedDatabaseIdRef.current === savedDatabase.id) {
              setDraftDatabase(savedDatabase);
            }
            return savedDatabase;
          }
  
  	    function openDatabaseOwnerTransferModal(ownerIdentity) {
  	      const target = normalizeDatabaseOwnerIdentity(ownerIdentity);
  	      if (!getDatabaseOwnerIdentityKey(target) || !isCurrentUserDatabaseOwner(draftDatabase)) return;
  	      if (databaseOwnerTransferModalCloseTimerRef.current !== null) {
  	        window.clearTimeout(databaseOwnerTransferModalCloseTimerRef.current);
  	        databaseOwnerTransferModalCloseTimerRef.current = null;
  	      }
  	      if (databaseOwnerTransferModalFrameRef.current !== null) {
  	        window.cancelAnimationFrame(databaseOwnerTransferModalFrameRef.current);
  	        databaseOwnerTransferModalFrameRef.current = null;
  	      }
  	      setDatabaseOwnerPopoverOpen(false);
  	      setDatabaseSaveState((current) => ({ ...current, error: "", message: "" }));
  	      setDatabaseOwnerTransferTarget(target);
  	      setDatabaseOwnerTransferModalClosing(false);
  	      setDatabaseOwnerTransferModalVisible(false);
  	      databaseOwnerTransferModalFrameRef.current = window.requestAnimationFrame(() => {
  	        databaseOwnerTransferModalFrameRef.current = window.requestAnimationFrame(() => {
  	          databaseOwnerTransferModalFrameRef.current = null;
  	          setDatabaseOwnerTransferModalVisible(true);
  	        });
  	      });
  	    }
  
  	    function closeDatabaseOwnerTransferModal(options = {}) {
  	      if (databaseSaveState.isSaving && options.force !== true) return;
  	      if (databaseOwnerTransferModalFrameRef.current !== null) {
  	        window.cancelAnimationFrame(databaseOwnerTransferModalFrameRef.current);
  	        databaseOwnerTransferModalFrameRef.current = null;
  	      }
  	      if (databaseOwnerTransferModalCloseTimerRef.current !== null) {
  	        window.clearTimeout(databaseOwnerTransferModalCloseTimerRef.current);
  	        databaseOwnerTransferModalCloseTimerRef.current = null;
  	      }
  	      if (options.force === true || typeof window === "undefined") {
  	        setDatabaseOwnerTransferModalVisible(false);
  	        setDatabaseOwnerTransferModalClosing(false);
  	        setDatabaseOwnerTransferTarget(null);
  	        return;
  	      }
  	      setDatabaseOwnerTransferModalVisible(false);
  	      setDatabaseOwnerTransferModalClosing(true);
  	      databaseOwnerTransferModalCloseTimerRef.current = window.setTimeout(() => {
  	        databaseOwnerTransferModalCloseTimerRef.current = null;
  	        setDatabaseOwnerTransferModalClosing(false);
  	        setDatabaseOwnerTransferTarget(null);
  	      }, 90);
  	    }
  
          async function handleDatabaseOwnerSelect(ownerIdentity) {
            const currentDatabase = normalizePlaygroundDatabaseRecord(draftDatabase);
            if (!currentDatabase.id || currentDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID || isSelectedDatabaseTemplatePreview) {
              return;
            }
  	      if (!isCurrentUserDatabaseOwner(currentDatabase)) {
  	        setDatabaseSaveState({
  	          isSaving: false,
  	          error: "Only the current database owner can transfer ownership.",
  	          message: "",
  	        });
  	        return null;
  	      }
  	      const targetIdentityKey = getDatabaseOwnerIdentityKey(ownerIdentity);
  	      const targetIsAccessibleTeamMember = getDatabaseSharedTeamIds(currentDatabase).some((teamId) => (
  	        (Array.isArray(databaseOwnerTeamMembersById[teamId]) ? databaseOwnerTeamMembersById[teamId] : [])
  	          .filter(isHumanDatabaseOwnerCandidate)
  	          .some((member) => getDatabaseOwnerIdentityKey(member) === targetIdentityKey)
  	      ));
  	      if (!targetIdentityKey || !targetIsAccessibleTeamMember) {
  	        setDatabaseSaveState({
  	          isSaving: false,
  	          error: "The new owner must be a human member of a team with database access.",
  	          message: "",
  	        });
  	        return null;
  	      }
            const nextDatabase = applyDatabaseOwnerIdentity(currentDatabase, ownerIdentity);
            setDatabaseOwnerPopoverOpen(false);
            setDatabaseSaveState({ isSaving: true, error: "", message: "" });
            setDraftDatabase(nextDatabase);
            upsertLocalDatabaseRecord(nextDatabase);
            try {
              const savedDatabase = await persistDatabaseTeamAccessRecord(nextDatabase);
              setDatabaseSaveState({ isSaving: false, error: "", message: "Saved" });
              return savedDatabase;
            } catch (error) {
              setDraftDatabase(currentDatabase);
              upsertLocalDatabaseRecord(currentDatabase);
              setDatabaseSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to update database owner.",
                message: "",
              });
              return null;
            }
          }
  
  	    async function handleDatabaseOwnerTransferConfirm() {
  	      if (!databaseOwnerTransferTarget || databaseSaveState.isSaving) return;
  	      const savedDatabase = await handleDatabaseOwnerSelect(databaseOwnerTransferTarget);
  	      if (savedDatabase) closeDatabaseOwnerTransferModal({ force: true });
  	    }
  
          async function findDatabaseTeamResourceShare(teamId, databaseId) {
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
              throw new Error(data?.message || data?.error || "Failed to load database team access.");
            }
            const shares = Array.isArray(data?.data) ? data.data : Array.isArray(data?.shares) ? data.shares : [];
            return shares.find((share) =>
              String(share?.resourceType || share?.resource_type || "").trim() === "database"
              && String(share?.resourceId || share?.resource_id || "").trim() === String(databaseId || "").trim()
            ) || null;
          }
  
          async function upsertDatabaseTeamResourceShare(team, database, databaseIdOverride = "") {
            const normalizedTeamId = String(team?.id || "").trim();
            const normalizedDatabase = normalizePlaygroundDatabaseRecord(database);
            const normalizedDatabaseId = String(databaseIdOverride || normalizedDatabase.id || "").trim();
            if (!normalizedTeamId || !normalizedDatabaseId || normalizedDatabaseId === PLAYGROUND_DATABASE_DRAFT_ID) {
              throw new Error("A saved database and team are required to add access.");
            }
            const permissionSet = getDatabaseTeamPermissionSet(normalizedDatabase, normalizedTeamId);
            const rolePermissionSets = getDatabaseTeamRolePermissionSets(normalizedDatabase, normalizedTeamId);
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
                body: JSON.stringify({
                  resourceType: "database",
                  resourceId: normalizedDatabaseId,
                  accessLevel: "manage",
                  metadata: {
                    resourceType: "database",
                    resourceKind: "database",
                    resourceName: normalizedDatabase.name || "Database",
                    sharedTeamId: normalizedTeamId,
                    sharedTeamName: String(team?.name || "").trim(),
                    permissionSet,
                    rolePermissionSets,
                  },
                }),
              },
              8000
            );
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to share database with team.");
            }
            return data?.data || data?.share || null;
          }
  
          async function handleAddDatabaseTeamAccess(team) {
            const normalizedTeamId = String(team?.id || "").trim();
            const currentDatabase = normalizePlaygroundDatabaseRecord(draftDatabase);
            if (!normalizedTeamId || !currentDatabase.id || currentDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID) {
              return;
            }
            if (databasePermissionSaveTimerRef.current) {
              window.clearTimeout(databasePermissionSaveTimerRef.current);
              databasePermissionSaveTimerRef.current = null;
            }
            databasePermissionSaveQueuedRef.current = null;
            const nextDatabase = buildDatabaseTeamAccessRecord(currentDatabase, normalizedTeamId, true);
            setDatabaseTeamMenuId("");
            setDatabaseTeamAccessState({ teamId: normalizedTeamId, action: "add", error: "" });
            setDatabaseSaveState({ isSaving: true, error: "", message: "" });
            try {
              const savedDatabase = await persistDatabaseTeamAccessRecord(nextDatabase);
              await upsertDatabaseTeamResourceShare(team, savedDatabase, currentDatabase.id);
              setDatabaseTeamAccessState({ teamId: "", action: "", error: "" });
              setDatabaseSaveState({ isSaving: false, error: "", message: "" });
            } catch (error) {
              try {
                await persistDatabaseTeamAccessRecord(currentDatabase);
              } catch {}
              const message = error instanceof Error ? error.message : "Failed to add database team access.";
              setDatabaseTeamAccessState({ teamId: normalizedTeamId, action: "", error: message });
              setDatabaseSaveState({ isSaving: false, error: "", message: "" });
            }
          }
  
          async function handleRemoveDatabaseTeamAccess(team) {
            const normalizedTeamId = String(team?.id || "").trim();
            const currentDatabase = normalizePlaygroundDatabaseRecord(draftDatabase);
            if (!normalizedTeamId || !currentDatabase.id || currentDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID) {
              return;
            }
            if (databasePermissionSaveTimerRef.current) {
              window.clearTimeout(databasePermissionSaveTimerRef.current);
              databasePermissionSaveTimerRef.current = null;
            }
            databasePermissionSaveQueuedRef.current = null;
            const nextDatabase = buildDatabaseTeamAccessRecord(currentDatabase, normalizedTeamId, false);
            setDatabaseTeamMenuId("");
            setDatabaseTeamAccessState({ teamId: normalizedTeamId, action: "remove", error: "" });
            setDatabaseSaveState({ isSaving: true, error: "", message: "" });
            try {
              const share = await findDatabaseTeamResourceShare(normalizedTeamId, currentDatabase.id);
              const savedDatabase = await persistDatabaseTeamAccessRecord(nextDatabase);
              if (share?.id) {
                const { response, data } = await fetchJsonWithTimeout(
                  backendUrl + "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares/" + encodeURIComponent(share.id),
                  {
                    method: "DELETE",
                    credentials: "include",
                    cache: "no-store",
                    headers: requestHeaders,
                  },
                  8000
                );
                if (!response.ok && response.status !== 404) {
                  throw new Error(data?.message || data?.error || "Failed to remove database from team.");
                }
              }
              if (String(databasePermissionTeamId || "") === normalizedTeamId) {
                setDatabasePermissionTeamId("");
              }
  	        setSelectedDatabaseAccessTeamIds((current) => {
  	          const next = new Set(current || []);
  	          next.delete(normalizedTeamId);
  	          return next;
  	        });
              setDraftDatabase(savedDatabase);
              setDatabaseTeamAccessState({ teamId: "", action: "", error: "" });
              setDatabaseSaveState({ isSaving: false, error: "", message: "" });
            } catch (error) {
              try {
                const restoredDatabase = await persistDatabaseTeamAccessRecord(currentDatabase);
                await upsertDatabaseTeamResourceShare(team, restoredDatabase, currentDatabase.id);
              } catch {}
              const message = error instanceof Error ? error.message : "Failed to remove database team access.";
              setDatabaseTeamAccessState({ teamId: normalizedTeamId, action: "", error: message });
              setDatabaseSaveState({ isSaving: false, error: "", message: "" });
            }
          }
  
          async function handleRemoveDatabaseTeamAccessBulk(teams) {
            const removableTeams = (Array.isArray(teams) ? teams : [])
              .filter((team) => team && !team.locked && String(team.id || "").trim());
            const removableTeamIds = Array.from(new Set(removableTeams.map((team) => String(team.id).trim())));
            const currentDatabase = normalizePlaygroundDatabaseRecord(draftDatabase);
            if (!removableTeamIds.length || !currentDatabase.id || currentDatabase.id === PLAYGROUND_DATABASE_DRAFT_ID) return;
  
            if (databasePermissionSaveTimerRef.current) {
              window.clearTimeout(databasePermissionSaveTimerRef.current);
              databasePermissionSaveTimerRef.current = null;
            }
            databasePermissionSaveQueuedRef.current = null;
            const nextDatabase = removableTeamIds.reduce(
              (database, teamId) => buildDatabaseTeamAccessRecord(database, teamId, false),
              currentDatabase
            );
            setDatabaseTeamMenuId("");
            setDatabaseTeamAccessState({ teamId: "bulk", teamIds: removableTeamIds, action: "remove", error: "" });
            setDatabaseSaveState({ isSaving: true, error: "", message: "" });
  
            try {
              const shares = await Promise.all(removableTeamIds.map(async (teamId) => ({
                teamId,
                share: await findDatabaseTeamResourceShare(teamId, currentDatabase.id),
              })));
              const savedDatabase = await persistDatabaseTeamAccessRecord(nextDatabase);
              await Promise.all(shares.map(async ({ teamId, share }) => {
                if (!share?.id) return;
                const { response, data } = await fetchJsonWithTimeout(
                  backendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares/" + encodeURIComponent(share.id),
                  {
                    method: "DELETE",
                    credentials: "include",
                    cache: "no-store",
                    headers: requestHeaders,
                  },
                  8000
                );
                if (!response.ok && response.status !== 404) {
                  throw new Error(data?.message || data?.error || "Failed to remove database from team.");
                }
              }));
  
              if (removableTeamIds.includes(String(databasePermissionTeamId || ""))) setDatabasePermissionTeamId("");
              setSelectedDatabaseAccessTeamIds((current) => {
                const next = new Set(current || []);
                removableTeamIds.forEach((teamId) => next.delete(teamId));
                return next;
              });
              setDraftDatabase(savedDatabase);
              setDatabaseTeamAccessState({ teamId: "", action: "", error: "" });
              setDatabaseSaveState({ isSaving: false, error: "", message: "" });
            } catch (error) {
              try {
                const restoredDatabase = await persistDatabaseTeamAccessRecord(currentDatabase);
                await Promise.allSettled(removableTeams.map((team) =>
                  upsertDatabaseTeamResourceShare(team, restoredDatabase, currentDatabase.id)
                ));
              } catch {}
              const message = error instanceof Error ? error.message : "Failed to remove database team access.";
              setDatabaseTeamAccessState({ teamId: "bulk", teamIds: removableTeamIds, action: "", error: message });
              setDatabaseSaveState({ isSaving: false, error: "", message: "" });
            }
          }
  
          function openServerComposer(serverKind = "") {
            void commitDraftServerIfDirty();
            resetServerEditorAuxiliaryState();
            setToolbarPopover("");
            setSearchPopupQuery("");
            setIsHomeViewActive(false);
            setServerComposerSaveState({
              isSaving: false,
              error: "",
            });
            const normalizedServerKind = normalizePlaygroundServerOverviewKind(serverKind);
            setServerComposerDraft({
              ...buildPlaygroundDefaultServerDraft(),
              ...(normalizedServerKind ? { kind: normalizedServerKind } : {}),
              ...(normalizedServerKind === "agent_runtime" && defaultAgentRuntimeEnvironmentId
                ? { sourceEnvironmentId: defaultAgentRuntimeEnvironmentId, authMode: "private" }
                : {}),
            });
            setServerComposerOpen(true);
          }
  
          function closeServerComposer() {
            if (serverComposerSaveState.isSaving) {
              return;
            }
            setServerComposerOpen(false);
            setIsServerComposerDescriptionEditing(false);
            setServerComposerSaveState({
              isSaving: false,
              error: "",
            });
            setServerComposerDraft(buildPlaygroundDefaultServerDraft());
          }
  
          function handleCreateServer(serverKind = "") {
            openServerComposer(serverKind);
          }
  
          function openServerResourceCopyComposer(resource) {
            if (!resource?.id) {
              return;
            }

            void commitDraftServerIfDirty();
            resetServerEditorAuxiliaryState();
            setToolbarPopover("");
            setSearchPopupQuery("");
            setServerResourceActionMenuState(null);
            setIsHomeViewActive(false);
            setServerComposerSaveState({
              isSaving: false,
              error: "",
            });
  
            if (resource.resourceType === "database") {
              setServerComposerDraft({
                ...buildPlaygroundDefaultServerDraft(),
                kind: "database",
                name: ((resource.name || "Database").trim() || "Database") + " Copy",
                description: resource.description || "",
                databaseLocation: resource.location || "eur3",
              });
              setServerComposerOpen(true);
              return;
            }
  
            const now = new Date().toISOString();
            const normalizedServer = normalizePlaygroundServerRecord(resource);
            setServerComposerDraft(normalizePlaygroundServerRecord({
              ...normalizedServer,
              id: "",
              userId: "",
              name: ((normalizedServer.name || "Server").trim() || "Server") + " Copy",
              serviceUrl: "",
              customDomain: "",
              cloudRunServiceName: "",
              imageUrl: "",
              status: "draft",
              lastDeployedAt: "",
              createdAt: now,
              updatedAt: now,
            }));
            setServerComposerOpen(true);
          }
  
          function openAiChatAppComposer() {
            void commitDraftServerIfDirty();
            if (!serverAgentOptionsLoading && serverAgentOptions.length === 0) {
              void loadServerAgentOptions();
            }
            resetServerEditorAuxiliaryState();
            setToolbarPopover("");
            setSearchPopupQuery("");
            setResourceMode("servers");
            setIsHomeViewActive(false);
            setServerComposerSaveState({
              isSaving: false,
              error: "",
            });
            setServerComposerDraft(normalizePlaygroundServerRecord({
              ...buildPlaygroundDefaultServerDraft(),
              kind: "web_app",
              name: "AI Chat App",
              template: "ai_chat_app",
            }));
            setServerComposerOpen(true);
          }
  
          function stageEnvironmentsHomeResourceCommand(commandType) {
            const normalizedCommandType = String(commandType || "").trim().toLowerCase();
            if (normalizedCommandType !== "computer" && normalizedCommandType !== "app" && normalizedCommandType !== "function") {
              return;
            }
            setToolbarPopover("");
            setSearchPopupQuery("");
            setEnvironmentsHomeActiveResourceCommand(normalizedCommandType);
            setEnvironmentsHomeResourceCommandRequest({
              type: normalizedCommandType,
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
            });
          }
  
          function buildEnvironmentsHomeResourceHiddenPrompt(commandType) {
            if (commandType === "computer") {
              return [
                "The user is asking you to create a new ACP computer.",
                "Use the Computer Agents skill to inspect the live platform and create the requested computer instead of inventing IDs or writing raw API calls.",
                "If essential details are missing, ask concise clarifying questions before creating anything. Focus on operating system, runtime, Dockerfile or base image, packages, GUI requirements, secrets, and integrations.",
                "Once the request is specific enough, create the computer and clearly summarize what you configured."
              ].join(" ");
            }
            if (commandType === "app") {
              return [
                "The user is asking you to create a new ACP web app resource.",
                "Use the Computer Agents skill to inspect the live platform and create the requested app.",
                "If the specification is incomplete, ask concise clarifying questions before creating anything. Focus on framework, source or runtime choice, build and start behavior, environment variables, route or domain expectations, and any required bindings.",
                "Once the request is specific enough, create the app resource and clearly summarize what you configured."
              ].join(" ");
            }
            if (commandType === "function") {
              return [
                "The user is asking you to create a new ACP function resource.",
                "Use the Computer Agents skill to inspect the live platform and create the requested function.",
                "If the specification is incomplete, ask concise clarifying questions before creating anything. Focus on runtime, trigger shape, request and response contract, dependencies, environment variables, and any required bindings.",
                "Once the request is specific enough, create the function resource and clearly summarize what you configured."
              ].join(" ");
            }
            return "";
          }
  
          function performShowEnvironmentsHome() {
            discardUnsavedEnvironmentDraft();
            void commitDraftServerIfDirty();
            setToolbarPopover("");
            setResourcesOverviewToolbarPopover("");
            setSearchPopupQuery("");
            setEnvironmentsHomeActiveResourceCommand("");
            setEnvironmentsHomeResourceCommandRequest(null);
            setEnvironmentListActionMenuState(null);
            setEnvironmentActionsPopoverOpen(false);
            setServerActionsPopoverOpen(false);
            setServerFileActionsPopoverOpen(false);
            setDatabaseActionsPopoverOpen(false);
            setDatabaseExportMenuOpen(false);
            setSelectedEnvironmentId("");
            setSelectedServerId("");
            setSelectedDatabaseId("");
            setSelectedDatabaseCollectionId("");
            setSelectedDatabaseDocumentId("");
            setDraftEnvironment(null);
            setDraftServer(null);
            setDraftDatabase(null);
            setEnvironmentComposerOpen(false);
            setServerComposerOpen(false);
            setServerAgentRuntimeRunComposer({
              open: false,
              title: "",
              prompt: "",
              mode: "async",
              error: "",
              isSubmitting: false,
            });
            resetEditorAuxiliaryState();
            resetServerEditorAuxiliaryState();
            resetDatabaseEditorAuxiliaryState();
            setIsHomeViewActive(true);
          }

          function showEnvironmentsHome() {
            requestEnvironmentNavigation(performShowEnvironmentsHome);
          }
  
          useEffect(() => {
            const previousKind = previousEmbeddedServerKindRef.current;
            previousEmbeddedServerKindRef.current = normalizedEmbeddedServerKind;
            if (!previousKind || !normalizedEmbeddedServerKind || previousKind === normalizedEmbeddedServerKind) {
              return;
            }
            showEnvironmentsHome();
          }, [normalizedEmbeddedServerKind]);
  
          function updateDraftServer(updater) {
            if (isSelectedServerTemplatePreview) {
              return;
            }
            setDraftServer((current) => {
              const base = current || normalizePlaygroundServerRecord(selectedServerSnapshot || buildPlaygroundDefaultServerDraft());
              return typeof updater === "function" ? updater(base) : updater;
            });
            serverEditorDirtyRef.current = true;
            serverVersionDraftTouchedRef.current = true;
            setServerSaveState((current) => ({
              ...current,
              error: "",
              message: "",
            }));
          }
  
          function updateServerField(field, value) {
            updateDraftServer((current) => ({
              ...current,
              [field]: value,
            }));
          }
  
          function getServerAccessMetadataRecord(server) {
            return server?.metadata && typeof server.metadata === "object" && !Array.isArray(server.metadata)
              ? server.metadata
              : {};
          }

          function getServerPermissionSubjectType(server) {
            const kind = canonicalizePlaygroundServerKind(server?.kind);
            return ["web_app", "function", "auth", "secrets", "payments", "agent_runtime"].includes(kind)
              ? kind
              : "server";
          }
  
          function getServerPermissionSet(server) {
            return normalizePlaygroundPermissionSet(
              getServerAccessMetadataRecord(server).permissionSet,
              getServerPermissionSubjectType(server)
            );
          }
  
          function getServerOwnerIdentity(server) {
            const metadata = getServerAccessMetadataRecord(server);
            return normalizeDatabaseOwnerIdentity(metadata.owner || server?.owner || null, {
              id: metadata.ownerId || metadata.owner_id || server?.userId || currentUserId || "",
              userId: metadata.ownerUserId || metadata.owner_user_id || server?.userId || currentUserId || "",
              name: metadata.ownerName || metadata.owner_name || currentUserName || "Owner",
              email: metadata.ownerEmail || metadata.owner_email || currentUserEmail || "",
              avatarUrl: metadata.ownerAvatarUrl || metadata.owner_avatar_url || currentUserAvatarUrl || "",
            });
          }

          function getServerCreatorIdentity(server) {
            return normalizeDatabaseOwnerIdentity(
              getDevelopResourceCreatorIdentity(server, getCurrentDevelopResourceIdentityInput())
            );
          }
  
          function isCurrentUserServerOwner(server) {
            const ownerKeys = new Set(getDatabaseOwnerIdentityKeys(getServerOwnerIdentity(server)));
            return getDatabaseOwnerIdentityKeys({
              id: currentUserId,
              userId: currentUserId,
              name: currentUserName,
              email: currentUserEmail,
              avatarUrl: currentUserAvatarUrl,
            }).some((key) => ownerKeys.has(key));
          }
  
          function applyServerOwnerIdentity(server, ownerIdentity) {
            const normalizedServer = normalizePlaygroundServerRecord(server);
            const owner = normalizeDatabaseOwnerIdentity(ownerIdentity);
            return normalizePlaygroundServerRecord({
              ...normalizedServer,
              metadata: {
                ...getServerAccessMetadataRecord(normalizedServer),
                owner,
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
              },
            });
          }
  
          function getServerSharedTeamIds(server) {
            const metadata = getServerAccessMetadataRecord(server);
            const permissionSets = metadata.teamPermissionSets && typeof metadata.teamPermissionSets === "object" && !Array.isArray(metadata.teamPermissionSets)
              ? metadata.teamPermissionSets
              : {};
            const rolePermissionSets = metadata.teamRolePermissionSets && typeof metadata.teamRolePermissionSets === "object" && !Array.isArray(metadata.teamRolePermissionSets)
              ? metadata.teamRolePermissionSets
              : {};
            return Array.from(new Set([
              ...(Array.isArray(metadata.sharedTeamIds) ? metadata.sharedTeamIds : []),
              ...(Array.isArray(metadata.teamAccessIds) ? metadata.teamAccessIds : []),
              ...Object.keys(permissionSets),
              ...Object.keys(rolePermissionSets),
            ].map((teamId) => String(teamId || "").trim()).filter(Boolean)));
          }
  
          function getServerTeamPermissionSets(server) {
            const value = getServerAccessMetadataRecord(server).teamPermissionSets;
            return value && typeof value === "object" && !Array.isArray(value) ? value : {};
          }
  
          function getServerTeamPermissionSet(server, teamId) {
            const normalizedTeamId = String(teamId || "").trim();
            const subjectType = getServerPermissionSubjectType(server);
            return normalizePlaygroundPermissionSet(
              getServerTeamPermissionSets(server)[normalizedTeamId] || createPlaygroundServerTeamRolePermissionSet("member", subjectType),
              subjectType
            );
          }
  
          function getServerTeamRolePermissionSetsMap(server) {
            const value = getServerAccessMetadataRecord(server).teamRolePermissionSets;
            return value && typeof value === "object" && !Array.isArray(value) ? value : {};
          }
  
          function getServerTeamRolePermissionSets(server, teamId) {
            const normalizedTeamId = String(teamId || "").trim();
            const subjectType = getServerPermissionSubjectType(server);
            const configured = getServerTeamRolePermissionSetsMap(server)[normalizedTeamId];
            const source = configured && typeof configured === "object" && !Array.isArray(configured) ? configured : {};
            const legacyPermissionSet = getServerTeamPermissionSets(server)[normalizedTeamId];
            return PLAYGROUND_TEAM_ROLE_DEFINITIONS.reduce((result, role) => {
              result[role.id] = role.id === "owner"
                ? createPlaygroundServerTeamRolePermissionSet(role.id, subjectType)
                : normalizePlaygroundRolePermissionSet(
                    source[role.id] || legacyPermissionSet,
                    subjectType,
                    role.id
                  );
              return result;
            }, {});
          }
  
          function getServerTeamRolePermissionSet(server, teamId, roleId) {
            return getServerTeamRolePermissionSets(server, teamId)[normalizePlaygroundTeamRoleId(roleId, "member")];
          }
  
          async function flushQueuedServerPermissionSave() {
            if (serverPermissionSaveInFlightRef.current) return;
            serverPermissionSaveInFlightRef.current = true;
            try {
              while (serverPermissionSaveQueuedRef.current) {
                const serverToSave = normalizePlaygroundServerRecord(serverPermissionSaveQueuedRef.current);
                serverPermissionSaveQueuedRef.current = null;
                setServerSaveState({ isSaving: true, error: "", message: "" });
                try {
                  const savedServer = await persistServerRecord(serverToSave);
                  if (!savedServer) throw new Error("Server permissions save failed.");
                  upsertLocalServerRecord(savedServer);
                  if (selectedServerIdRef.current === savedServer.id) setDraftServer(savedServer);
                } catch (error) {
                  setServerSaveState({
                    isSaving: false,
                    error: error instanceof Error ? error.message : "Failed to save server permissions.",
                    message: "",
                  });
                  return;
                }
              }
              setServerSaveState({ isSaving: false, error: "", message: "Saved" });
            } finally {
              serverPermissionSaveInFlightRef.current = false;
            }
          }
  
          function queueServerPermissionSave(server) {
            if (!server?.id || server.id === PLAYGROUND_SERVER_DRAFT_ID || isSelectedServerTemplatePreview) return;
            serverPermissionSaveQueuedRef.current = normalizePlaygroundServerRecord(server);
            if (serverPermissionSaveTimerRef.current) window.clearTimeout(serverPermissionSaveTimerRef.current);
            serverPermissionSaveTimerRef.current = window.setTimeout(() => {
              serverPermissionSaveTimerRef.current = null;
              void flushQueuedServerPermissionSave();
            }, 500);
          }
  
          function updateServerPermissionSet(updater) {
            if (isSelectedServerTemplatePreview) return;
            const currentServer = normalizePlaygroundServerRecord(draftServer || selectedServerSnapshot || buildPlaygroundDefaultServerDraft());
            const subjectType = getServerPermissionSubjectType(currentServer);
            const principalId = isPlatformSystemAccessPrincipalId(serverPermissionTeamId)
              ? normalizePlatformAccessPrincipalId(serverPermissionTeamId)
              : PLATFORM_ALL_AGENTS_PRINCIPAL_ID;
            const currentMetadata = getServerAccessMetadataRecord(currentServer);
            const currentPermissionSet = getPlatformSystemPrincipalPermissionSet(
              currentMetadata,
              principalId,
              subjectType,
              getServerPermissionSet(currentServer)
            );
            const nextPermissionSet = normalizePlaygroundPermissionSet(
              typeof updater === "function" ? updater(currentPermissionSet) : updater,
              subjectType
            );
            const nextServer = normalizePlaygroundServerRecord({
              ...currentServer,
              metadata: principalId === PLATFORM_ALL_AGENTS_PRINCIPAL_ID
                ? { ...currentMetadata, permissionSet: nextPermissionSet }
                : buildPlatformSystemPrincipalPermissionMetadata(
                    currentMetadata,
                    principalId,
                    nextPermissionSet,
                    subjectType
                  ),
            });
            updateDraftServer(nextServer);
            queueServerPermissionSave(nextServer);
          }
  
          function updateServerPermissionRingAccess(ringId, access) {
            const normalizedRingId = normalizePlaygroundPermissionRingId(ringId, "");
            if (!normalizedRingId) return;
            updateServerPermissionSet((current) => ({
              ...current,
              subjectType: getServerPermissionSubjectType(draftServer),
              rings: {
                ...(current.rings || createPlaygroundDefaultPermissionRings()),
                [normalizedRingId]: {
                  ...(current.rings?.[normalizedRingId] || {}),
                  defaultAccess: normalizePlaygroundPermissionAccess(access),
                },
              },
            }));
          }
  
          function updateServerPermissionActionRing(actionId, ringId) {
            const definition = getPlaygroundPermissionActionDefinition(actionId);
            const subjectType = getServerPermissionSubjectType(draftServer);
            if (!definition?.subjectTypes?.includes(subjectType)) return;
            updateServerPermissionSet((current) => ({
              ...current,
              subjectType,
              actions: {
                ...(current.actions || createPlaygroundDefaultPermissionActions()),
                [definition.id]: buildPlaygroundPermissionActionPolicy(
                  current,
                  definition,
                  current.actions?.[definition.id] || { ringId: definition.ringId },
                  getPlaygroundPermissionActionExplicitAccess(current, definition),
                  normalizePlaygroundPermissionRingId(ringId, definition.ringId)
                ),
              },
            }));
          }
  
          function updateServerPermissionActionAccess(actionId, access) {
            const definition = getPlaygroundPermissionActionDefinition(actionId);
            const subjectType = getServerPermissionSubjectType(draftServer);
            if (!definition?.subjectTypes?.includes(subjectType)) return;
            updateServerPermissionSet((current) => ({
              ...current,
              subjectType,
              actions: {
                ...(current.actions || createPlaygroundDefaultPermissionActions()),
                [definition.id]: buildPlaygroundPermissionActionPolicy(
                  current,
                  definition,
                  current.actions?.[definition.id] || { ringId: definition.ringId },
                  String(access || "").trim() ? normalizePlaygroundPermissionAccess(access) : ""
                ),
              },
            }));
          }
  
          function updateServerTeamRolePermissionSet(teamId, roleId, updater) {
            const normalizedTeamId = String(teamId || "").trim();
            const normalizedRoleId = normalizePlaygroundTeamRoleId(roleId, "member");
            if (!normalizedTeamId || normalizedRoleId === "owner" || isSelectedServerTemplatePreview) return;
            const currentServer = normalizePlaygroundServerRecord(draftServer || selectedServerSnapshot || buildPlaygroundDefaultServerDraft());
            const roleSetsMap = getServerTeamRolePermissionSetsMap(currentServer);
            const teamRoleSets = getServerTeamRolePermissionSets(currentServer, normalizedTeamId);
            const currentPermissionSet = getServerTeamRolePermissionSet(currentServer, normalizedTeamId, normalizedRoleId);
            const subjectType = getServerPermissionSubjectType(currentServer);
            const nextPermissionSet = normalizePlaygroundPermissionSet(
              typeof updater === "function" ? updater(currentPermissionSet) : updater,
              subjectType
            );
            const nextServer = normalizePlaygroundServerRecord({
              ...currentServer,
              metadata: {
                ...getServerAccessMetadataRecord(currentServer),
                teamRolePermissionSets: {
                  ...roleSetsMap,
                  [normalizedTeamId]: { ...teamRoleSets, [normalizedRoleId]: nextPermissionSet },
                },
              },
            });
            updateDraftServer(nextServer);
            queueServerPermissionSave(nextServer);
          }
  
          function updateServerTeamRolePermissionRingAccess(teamId, roleId, ringId, access) {
            const normalizedRingId = normalizePlaygroundPermissionRingId(ringId, "");
            if (!normalizedRingId) return;
            updateServerTeamRolePermissionSet(teamId, roleId, (current) => ({
              ...current,
              subjectType: getServerPermissionSubjectType(draftServer),
              rings: {
                ...(current.rings || createPlaygroundDefaultPermissionRings()),
                [normalizedRingId]: {
                  ...(current.rings?.[normalizedRingId] || {}),
                  defaultAccess: normalizePlaygroundPermissionAccess(access),
                },
              },
            }));
          }
  
          function updateServerTeamRolePermissionActionRing(teamId, roleId, actionId, ringId) {
            const definition = getPlaygroundPermissionActionDefinition(actionId);
            const subjectType = getServerPermissionSubjectType(draftServer);
            if (!definition?.subjectTypes?.includes(subjectType)) return;
            updateServerTeamRolePermissionSet(teamId, roleId, (current) => ({
              ...current,
              subjectType,
              actions: {
                ...(current.actions || createPlaygroundDefaultPermissionActions()),
                [definition.id]: buildPlaygroundPermissionActionPolicy(
                  current,
                  definition,
                  current.actions?.[definition.id] || { ringId: definition.ringId },
                  getPlaygroundPermissionActionExplicitAccess(current, definition),
                  normalizePlaygroundPermissionRingId(ringId, definition.ringId)
                ),
              },
            }));
          }
  
          function updateServerTeamRolePermissionActionAccess(teamId, roleId, actionId, access) {
            const definition = getPlaygroundPermissionActionDefinition(actionId);
            const subjectType = getServerPermissionSubjectType(draftServer);
            if (!definition?.subjectTypes?.includes(subjectType)) return;
            updateServerTeamRolePermissionSet(teamId, roleId, (current) => ({
              ...current,
              subjectType,
              actions: {
                ...(current.actions || createPlaygroundDefaultPermissionActions()),
                [definition.id]: buildPlaygroundPermissionActionPolicy(
                  current,
                  definition,
                  current.actions?.[definition.id] || { ringId: definition.ringId },
                  String(access || "").trim() ? normalizePlaygroundPermissionAccess(access) : ""
                ),
              },
            }));
          }
  
          function buildServerTeamAccessRecord(server, teamId, shouldInclude) {
            const normalizedServer = normalizePlaygroundServerRecord(server);
            const normalizedTeamId = String(teamId || "").trim();
            const metadata = getServerAccessMetadataRecord(normalizedServer);
            const permissionSets = { ...getServerTeamPermissionSets(normalizedServer) };
            const rolePermissionSets = { ...getServerTeamRolePermissionSetsMap(normalizedServer) };
            const teamIds = getServerSharedTeamIds(normalizedServer).filter((id) => id !== normalizedTeamId);
            if (shouldInclude) {
              teamIds.push(normalizedTeamId);
              permissionSets[normalizedTeamId] = getServerTeamPermissionSet(normalizedServer, normalizedTeamId);
              rolePermissionSets[normalizedTeamId] = getServerTeamRolePermissionSets(normalizedServer, normalizedTeamId);
            } else {
              delete permissionSets[normalizedTeamId];
              delete rolePermissionSets[normalizedTeamId];
            }
            const uniqueTeamIds = Array.from(new Set(teamIds.filter(Boolean)));
            return normalizePlaygroundServerRecord({
              ...normalizedServer,
              metadata: {
                ...metadata,
                sharedTeamIds: uniqueTeamIds,
                teamAccessIds: uniqueTeamIds,
                teamPermissionSets: permissionSets,
                teamRolePermissionSets: rolePermissionSets,
              },
            });
          }
  
          async function persistServerTeamAccessRecord(server) {
            const savedServer = await persistServerRecord(server);
            if (!savedServer) throw new Error("Failed to save team access.");
            upsertLocalServerRecord(savedServer);
            if (selectedServerIdRef.current === savedServer.id) setDraftServer(savedServer);
            return savedServer;
          }
  
          async function findServerTeamResourceShare(teamId, serverId) {
            const { response, data } = await fetchJsonWithTimeout(
              backendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
              { method: "GET", credentials: "include", cache: "no-store", headers: requestHeaders },
              8000
            );
            if (!response.ok) throw new Error(data?.message || data?.error || "Failed to load team access.");
            const shares = Array.isArray(data?.data) ? data.data : Array.isArray(data?.shares) ? data.shares : [];
            return shares.find((share) =>
              String(share?.resourceType || share?.resource_type || "") === "server"
              && String(share?.resourceId || share?.resource_id || "") === String(serverId || "")
            ) || null;
          }
  
          async function upsertServerTeamResourceShare(team, server) {
            const teamId = String(team?.id || "").trim();
            const normalizedServer = normalizePlaygroundServerRecord(server);
            if (!teamId || !normalizedServer.id || normalizedServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
              throw new Error("A saved resource and team are required to add access.");
            }
            const { response, data } = await fetchJsonWithTimeout(
              backendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
              {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: { ...requestHeaders, "Content-Type": "application/json" },
                body: JSON.stringify({
                  resourceType: "server",
                  resourceId: normalizedServer.id,
                  accessLevel: "manage",
                  metadata: {
                    resourceType: "server",
                    resourceKind: canonicalizePlaygroundServerKind(normalizedServer.kind),
                    resourceName: normalizedServer.name || "Resource",
                    sharedTeamId: teamId,
                    sharedTeamName: String(team?.name || "").trim(),
                    permissionSet: getServerTeamPermissionSet(normalizedServer, teamId),
                    rolePermissionSets: getServerTeamRolePermissionSets(normalizedServer, teamId),
                  },
                }),
              },
              8000
            );
            if (!response.ok) throw new Error(data?.message || data?.error || "Failed to share resource with team.");
            return data?.data || data?.share || null;
          }
  
          async function handleAddServerTeamAccess(team) {
            const teamId = String(team?.id || "").trim();
            const currentServer = normalizePlaygroundServerRecord(draftServer);
            if (!teamId || !currentServer.id || getServerSharedTeamIds(currentServer).includes(teamId)) return;
            const nextServer = buildServerTeamAccessRecord(currentServer, teamId, true);
            setServerTeamAccessState({ teamId, action: "adding", error: "" });
            setDraftServer(nextServer);
            try {
              await upsertServerTeamResourceShare(team, nextServer);
              await persistServerTeamAccessRecord(nextServer);
              setServerTeamMenuId("");
            } catch (error) {
              setDraftServer(currentServer);
              setServerTeamAccessState({ teamId: "", action: "", error: error instanceof Error ? error.message : "Failed to add team access." });
              return;
            }
            setServerTeamAccessState({ teamId: "", action: "", error: "" });
          }
  
          async function handleRemoveServerTeamAccess(team) {
            const teamId = String(team?.id || "").trim();
            const currentServer = normalizePlaygroundServerRecord(draftServer);
            if (!teamId || !currentServer.id || !getServerSharedTeamIds(currentServer).includes(teamId)) return;
            const nextServer = buildServerTeamAccessRecord(currentServer, teamId, false);
            setServerTeamAccessState({ teamId, action: "removing", error: "" });
            try {
              const share = await findServerTeamResourceShare(teamId, currentServer.id);
              if (share?.id) {
                const { response, data } = await fetchJsonWithTimeout(
                  backendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares/" + encodeURIComponent(share.id),
                  { method: "DELETE", credentials: "include", cache: "no-store", headers: requestHeaders },
                  8000
                );
                if (!response.ok) throw new Error(data?.message || data?.error || "Failed to remove team access.");
              }
              await persistServerTeamAccessRecord(nextServer);
              setSelectedServerAccessTeamIds((current) => {
                const next = new Set(current);
                next.delete(teamId);
                return next;
              });
              if (serverPermissionTeamId === teamId) setServerPermissionTeamId("");
            } catch (error) {
              setServerTeamAccessState({ teamId: "", action: "", error: error instanceof Error ? error.message : "Failed to remove team access." });
              return;
            }
            setServerTeamAccessState({ teamId: "", action: "", error: "" });
          }
  
          async function handleRemoveServerTeamsAccess(teams) {
            const requestedTeams = (Array.isArray(teams) ? teams : [teams])
              .filter((team) => team?.id && !isPlatformSystemAccessPrincipalId(team.id));
            if (!requestedTeams.length) return;
            const currentServer = normalizePlaygroundServerRecord(draftServer);
            let nextServer = currentServer;
            requestedTeams.forEach((team) => {
              nextServer = buildServerTeamAccessRecord(nextServer, team.id, false);
            });
            setServerTeamAccessState({ teamId: "", action: "removing", error: "" });
            try {
              await Promise.all(requestedTeams.map(async (team) => {
                const share = await findServerTeamResourceShare(team.id, currentServer.id);
                if (!share?.id) return;
                const { response, data } = await fetchJsonWithTimeout(
                  backendUrl + "/teams/" + encodeURIComponent(team.id) + "/resource-shares/" + encodeURIComponent(share.id),
                  { method: "DELETE", credentials: "include", cache: "no-store", headers: requestHeaders },
                  8000
                );
                if (!response.ok) throw new Error(data?.message || data?.error || "Failed to remove team access.");
              }));
              await persistServerTeamAccessRecord(nextServer);
              setSelectedServerAccessTeamIds(new Set());
              if (requestedTeams.some((team) => String(team.id) === String(serverPermissionTeamId))) {
                setServerPermissionTeamId("");
              }
            } catch (error) {
              setServerTeamAccessState({ teamId: "", action: "", error: error instanceof Error ? error.message : "Failed to remove team access." });
              return;
            }
            setServerTeamAccessState({ teamId: "", action: "", error: "" });
          }
  
          function openServerOwnerTransferModal(ownerIdentity) {
            const target = normalizeDatabaseOwnerIdentity(ownerIdentity);
            if (!getDatabaseOwnerIdentityKey(target) || !isCurrentUserServerOwner(draftServer)) return;
            if (serverOwnerTransferModalCloseTimerRef.current !== null) {
              window.clearTimeout(serverOwnerTransferModalCloseTimerRef.current);
              serverOwnerTransferModalCloseTimerRef.current = null;
            }
            setServerOwnerPopoverOpen(false);
            setServerOwnerTransferModalClosing(false);
            setServerOwnerTransferTarget(target);
          }
  
          function closeServerOwnerTransferModal(options = {}) {
            if (!serverOwnerTransferTarget) return;
            if (serverOwnerTransferModalCloseTimerRef.current !== null) {
              window.clearTimeout(serverOwnerTransferModalCloseTimerRef.current);
              serverOwnerTransferModalCloseTimerRef.current = null;
            }
            if (options.animate === false || typeof window === "undefined") {
              setServerOwnerTransferModalClosing(false);
              setServerOwnerTransferTarget(null);
              return;
            }
            setServerOwnerTransferModalClosing(true);
            serverOwnerTransferModalCloseTimerRef.current = window.setTimeout(() => {
              serverOwnerTransferModalCloseTimerRef.current = null;
              setServerOwnerTransferModalClosing(false);
              setServerOwnerTransferTarget(null);
            }, 90);
          }
  
          async function handleServerOwnerTransferConfirm() {
            if (!serverOwnerTransferTarget || serverSaveState.isSaving) return;
            const currentServer = normalizePlaygroundServerRecord(draftServer);
            if (!isCurrentUserServerOwner(currentServer)) {
              setServerSaveState({ isSaving: false, error: "Only the current owner can transfer ownership.", message: "" });
              return;
            }
            const targetKey = getDatabaseOwnerIdentityKey(serverOwnerTransferTarget);
            const targetHasAccess = getServerSharedTeamIds(currentServer).some((teamId) => (
              (Array.isArray(databaseOwnerTeamMembersById[teamId]) ? databaseOwnerTeamMembersById[teamId] : [])
                .filter(isHumanDatabaseOwnerCandidate)
                .some((member) => getDatabaseOwnerIdentityKey(member) === targetKey)
            ));
            if (!targetHasAccess) {
              setServerSaveState({ isSaving: false, error: "The new owner must be a human member of a team with access.", message: "" });
              return;
            }
            const nextServer = applyServerOwnerIdentity(currentServer, serverOwnerTransferTarget);
            setServerSaveState({ isSaving: true, error: "", message: "" });
            setDraftServer(nextServer);
            try {
              await persistServerTeamAccessRecord(nextServer);
              setServerSaveState({ isSaving: false, error: "", message: "Saved" });
              closeServerOwnerTransferModal({ animate: false });
            } catch (error) {
              setDraftServer(currentServer);
              setServerSaveState({ isSaving: false, error: error instanceof Error ? error.message : "Failed to transfer ownership.", message: "" });
            }
          }
  
          function updateServerAgentRuntimeField(field, value) {
            updateDraftServer((current) => {
              const normalized = normalizePlaygroundServerRecord(current || buildPlaygroundDefaultServerDraft());
              const metadata = normalized?.metadata && typeof normalized.metadata === "object" && !Array.isArray(normalized.metadata)
                ? { ...normalized.metadata }
                : {};
              const agentRuntime = metadata.agentRuntime && typeof metadata.agentRuntime === "object" && !Array.isArray(metadata.agentRuntime)
                ? { ...metadata.agentRuntime }
                : {};
              agentRuntime[field] = value;
              metadata.agentRuntime = agentRuntime;
              return {
                ...normalized,
                metadata,
              };
            });
          }
  
          function updateServerAgentRuntimeSkills(updater) {
            updateDraftServer((current) => {
              const normalized = normalizePlaygroundServerRecord(current || buildPlaygroundDefaultServerDraft());
              const metadata = normalized?.metadata && typeof normalized.metadata === "object" && !Array.isArray(normalized.metadata)
                ? { ...normalized.metadata }
                : {};
              const agentRuntime = metadata.agentRuntime && typeof metadata.agentRuntime === "object" && !Array.isArray(metadata.agentRuntime)
                ? { ...metadata.agentRuntime }
                : {};
              const currentSkills = agentRuntime.skills && typeof agentRuntime.skills === "object" && !Array.isArray(agentRuntime.skills)
                ? {
                    mode: agentRuntime.skills.mode === "override" ? "override" : "inherit",
                    enabledSkills: normalizePlaygroundEnabledSkillIds(agentRuntime.skills.enabledSkills),
                  }
                : {
                    mode: "inherit",
                    enabledSkills: [],
                  };
              const nextSkillsInput = typeof updater === "function" ? updater(currentSkills) : updater;
              const nextMode = nextSkillsInput?.mode === "override" ? "override" : "inherit";
              const nextEnabledSkills = normalizePlaygroundEnabledSkillIds(nextSkillsInput?.enabledSkills);
              if (nextMode === "inherit" && nextEnabledSkills.length === 0) {
                delete agentRuntime.skills;
              } else {
                agentRuntime.skills = {
                  mode: nextMode,
                  enabledSkills: nextEnabledSkills,
                };
              }
              metadata.agentRuntime = agentRuntime;
              return {
                ...normalized,
                metadata,
              };
            });
          }
  
          function updateServerAgentRuntimeSkillsMode(mode) {
            updateServerAgentRuntimeSkills((current) => ({
              ...current,
              mode: mode === "override" ? "override" : "inherit",
            }));
          }
  
          function toggleServerAgentRuntimeSkill(skillId, fallbackSkillIds) {
            const normalizedSkillId = normalizePlaygroundEnabledSkillIds([skillId])[0] || String(skillId || "").trim();
            if (!normalizedSkillId) {
              return;
            }
            updateServerAgentRuntimeSkills((current) => {
              const currentSkillIds = current?.mode === "override"
                ? normalizePlaygroundEnabledSkillIds(current?.enabledSkills)
                : normalizePlaygroundEnabledSkillIds(fallbackSkillIds);
              return {
                mode: "override",
                enabledSkills: currentSkillIds.includes(normalizedSkillId)
                  ? currentSkillIds.filter((value) => value !== normalizedSkillId)
                  : currentSkillIds.concat(normalizedSkillId),
              };
            });
          }
  
          function applyServerAgentRuntimeRunPromptSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            setIsServerAgentRuntimeRunPromptEditing(true);
            setServerAgentRuntimeRunComposer((current) => ({
              ...current,
              prompt: nextValue,
            }));
            window.requestAnimationFrame(() => {
              const textarea = serverAgentRuntimeRunPromptTextareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeEnvironmentDescriptionTextarea(textarea);
            });
          }
  
          function handleServerAgentRuntimeRunPromptFormat(formatType) {
            const textarea = serverAgentRuntimeRunPromptTextareaRef.current;
            if (!textarea) {
              return;
            }
            const value = String(serverAgentRuntimeRunComposer?.prompt || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
  
            if (formatType === "bold") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildEnvironmentDescriptionListEdit(value, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            applyServerAgentRuntimeRunPromptSelection(edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function updateServerDescriptionValue(nextValue, { recordHistory = true } = {}) {
            const normalizedNextValue = String(nextValue ?? "");
            const previousValue = String(draftServer?.description || "");
            if (normalizedNextValue === previousValue) return;
            if (recordHistory) {
              setServerDescriptionHistory((current) => ({
                past: [...(Array.isArray(current.past) ? current.past : []), previousValue].slice(-80),
                future: [],
              }));
            }
            updateServerField("description", normalizedNextValue);
          }
  
          function applyServerDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart, options = {}) {
            updateServerDescriptionValue(nextValue, options);
            window.requestAnimationFrame(() => {
              const textarea = serverDescriptionTextareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeEnvironmentDescriptionTextarea(textarea);
            });
          }
  
          function handleServerDescriptionUndo() {
            const historyPast = Array.isArray(serverDescriptionHistory.past) ? serverDescriptionHistory.past : [];
            if (!historyPast.length || isSelectedServerTemplatePreview) return;
            const currentValue = String(draftServer?.description || "");
            const previousValue = historyPast[historyPast.length - 1];
            setServerDescriptionHistory((current) => ({
              past: (Array.isArray(current.past) ? current.past : []).slice(0, -1),
              future: [currentValue, ...(Array.isArray(current.future) ? current.future : [])].slice(0, 80),
            }));
            applyServerDescriptionSelection(previousValue, previousValue.length, previousValue.length, { recordHistory: false });
          }
  
          function handleServerDescriptionRedo() {
            const historyFuture = Array.isArray(serverDescriptionHistory.future) ? serverDescriptionHistory.future : [];
            if (!historyFuture.length || isSelectedServerTemplatePreview) return;
            const currentValue = String(draftServer?.description || "");
            const nextValue = historyFuture[0];
            setServerDescriptionHistory((current) => ({
              past: [...(Array.isArray(current.past) ? current.past : []), currentValue].slice(-80),
              future: (Array.isArray(current.future) ? current.future : []).slice(1),
            }));
            applyServerDescriptionSelection(nextValue, nextValue.length, nextValue.length, { recordHistory: false });
          }
  
          function handleServerDescriptionFormat(formatType) {
            const textarea = serverDescriptionTextareaRef.current;
            if (!textarea || !draftServer) {
              return;
            }
            const value = String(draftServer?.description || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
  
            if (formatType === "bold") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildEnvironmentDescriptionListEdit(value, selectionStart, selectionEnd);
            } else if (formatType === "ordered-list") {
              edit = buildEnvironmentDescriptionOrderedListEdit(value, selectionStart, selectionEnd);
            } else if (formatType === "code") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, String.fromCharCode(96));
            } else if (formatType === "link") {
              edit = buildEnvironmentDescriptionLinkEdit(value, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            applyServerDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          async function commitDraftServerIfDirty() {
            if (!serverEditorDirtyRef.current || !draftServer?.id || draftServer.id === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            if (isAuthoritativelyVersionedServer(draftServer)) {
              return;
            }
            if (isSelectedServerTemplatePreview || isPlaygroundResourceTemplatePreviewRecord(draftServer)) {
              serverEditorDirtyRef.current = false;
              serverAutosaveQueuedRef.current = null;
              return;
            }
            if (serverAutosaveTimerRef.current) {
              window.clearTimeout(serverAutosaveTimerRef.current);
              serverAutosaveTimerRef.current = null;
            }
            const normalizedDraftServer = normalizePlaygroundServerRecord(draftServer);
            serverAutosaveQueuedRef.current = canonicalizePlaygroundServerKind(normalizedDraftServer.kind) === "agent_runtime"
              && !normalizedDraftServer.sourceEnvironmentId
              && defaultAgentRuntimeEnvironmentId
                ? {
                    ...normalizedDraftServer,
                    sourceEnvironmentId: defaultAgentRuntimeEnvironmentId,
                    authMode: "private",
                  }
                : normalizedDraftServer;
            await flushQueuedServerAutosave();
          }
  
          function applyDatabaseSelectionToServerDraft(databaseId, scope = "editor") {
            const normalizedDatabaseId = String(databaseId || "").trim();
            const selectedDatabase = normalizedDatabaseId
              ? (databaseDetailsById[normalizedDatabaseId] || databases.find((database) => database.id === normalizedDatabaseId) || null)
              : null;
            const nextServerRecord = selectedDatabase
              ? buildPlaygroundServerWithLinkedDatabase(
                  scope === "composer" ? (serverComposerDraft || buildPlaygroundDefaultServerDraft()) : (draftServer || buildPlaygroundDefaultServerDraft()),
                  selectedDatabase,
                  "existing",
                )
              : clearPlaygroundServerDatabaseBinding(scope === "composer" ? (serverComposerDraft || buildPlaygroundDefaultServerDraft()) : (draftServer || buildPlaygroundDefaultServerDraft()));
  
            if (scope === "composer") {
              setServerComposerDraft(nextServerRecord);
              setServerComposerSaveState((current) => ({
                ...current,
                error: "",
              }));
            } else {
              setDraftServer(nextServerRecord);
              setServerSaveState((current) => ({
                ...current,
                error: "",
                message: "",
              }));
            }
          }
  
          function updateServerDatabaseMode(mode, scope = "editor") {
            const normalizedMode = mode === "create" || mode === "existing" ? mode : "none";
            const updateTarget = (current) => {
              const base = normalizePlaygroundServerRecord(current || buildPlaygroundDefaultServerDraft());
              if (normalizedMode === "none") {
                return clearPlaygroundServerDatabaseBinding(base);
              }
              if (normalizedMode === "existing") {
                return normalizePlaygroundServerRecord({
                  ...base,
                  databaseMode: "existing",
                  databaseId: normalizedMode === "existing" ? base.databaseId : "",
                });
              }
              return normalizePlaygroundServerRecord({
                ...base,
                databaseMode: "create",
                databaseId: "",
                databaseName: base.databaseName || (String(base.name || "").trim() ? String(base.name || "").trim() + " Database" : ""),
                databaseDescription: base.databaseDescription || "",
                databaseLocation: base.databaseLocation || "eur3",
              });
            };
  
            if (scope === "composer") {
              setServerComposerDraft((current) => updateTarget(current));
              setServerComposerSaveState((current) => ({
                ...current,
                error: "",
              }));
              return;
            }
  
            setDraftServer((current) => updateTarget(current));
            setServerSaveState((current) => ({
              ...current,
              error: "",
              message: "",
            }));
          }
  
          function updateServerDatabaseField(field, value, scope = "editor") {
            const updater = (current) => ({
              ...normalizePlaygroundServerRecord(current || buildPlaygroundDefaultServerDraft()),
              [field]: value,
            });
            if (scope === "composer") {
              setServerComposerDraft((current) => updater(current));
              setServerComposerSaveState((current) => ({
                ...current,
                error: "",
              }));
              return;
            }
            setDraftServer((current) => updater(current));
            setServerSaveState((current) => ({
              ...current,
              error: "",
              message: "",
            }));
          }
  
          function updateServerComposerField(field, value) {
            setServerComposerDraft((current) => ({
              ...(current || buildPlaygroundDefaultServerDraft()),
              [field]: value,
            }));
            setServerComposerSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          function applyServerComposerDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            setIsServerComposerDescriptionEditing(true);
            updateServerComposerField("description", nextValue);
            window.requestAnimationFrame(() => {
              const textarea = serverComposerDescriptionTextareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeEnvironmentDescriptionTextarea(textarea);
            });
          }
  
          function handleServerComposerDescriptionFormat(formatType) {
            const textarea = serverComposerDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const value = String(serverComposerDraft?.description || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
  
            if (formatType === "bold") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedEnvironmentDescriptionEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildEnvironmentDescriptionListEdit(value, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            applyServerComposerDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function getCurrentServerBindingByType(targetType) {
            return currentServerBindings.find((binding) => binding.targetType === targetType) || null;
          }
  
          async function upsertServerConnection(targetType, targetId) {
            const normalizedServerId = String(draftServer?.id || "").trim();
            const normalizedTargetType = String(targetType || "").trim().toLowerCase();
            const normalizedTargetId = String(targetId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID || !normalizedTargetId) {
              return null;
            }
  
            const savingKey = normalizedTargetType + ":" + normalizedTargetId;
            setServerBindingState({
              savingKey,
              error: "",
            });
  
            try {
              const response = await fetch(
                buildPlaygroundServerBindingTargetUrl(backendUrl, normalizedServerId, normalizedTargetType),
                {
                  method: "PUT",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    targetId: normalizedTargetId,
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save connection.");
              }
              const bindings = Array.isArray(data?.bindings)
                ? data.bindings.map(normalizePlaygroundServerBindingRecord).filter(Boolean)
                : [];
              setServerBindingsById((current) => ({
                ...current,
                [normalizedServerId]: bindings,
              }));
              void loadServerContext(normalizedServerId, { force: true });
              setServerBindingState({
                savingKey: "",
                error: "",
              });
              return bindings.find((binding) => binding.targetType === normalizedTargetType) || null;
            } catch (error) {
              setServerBindingState({
                savingKey: "",
                error: error instanceof Error ? error.message : "Failed to save connection.",
              });
              return null;
            }
          }
  
          async function removeServerConnection(targetType) {
            const normalizedServerId = String(draftServer?.id || "").trim();
            const normalizedTargetType = String(targetType || "").trim().toLowerCase();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return false;
            }
  
            setServerBindingState({
              savingKey: normalizedTargetType,
              error: "",
            });
  
            try {
              const response = await fetch(
                buildPlaygroundServerBindingTargetUrl(backendUrl, normalizedServerId, normalizedTargetType),
                {
                  method: "DELETE",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to remove connection.");
              }
              const bindings = Array.isArray(data?.bindings)
                ? data.bindings.map(normalizePlaygroundServerBindingRecord).filter(Boolean)
                : [];
              setServerBindingsById((current) => ({
                ...current,
                [normalizedServerId]: bindings,
              }));
              void loadServerContext(normalizedServerId, { force: true });
              setServerBindingState({
                savingKey: "",
                error: "",
              });
              return true;
            } catch (error) {
              setServerBindingState({
                savingKey: "",
                error: error instanceof Error ? error.message : "Failed to remove connection.",
              });
              return false;
            }
          }
  
          async function createAndConnectDatabase() {
            setServerBindingState({
              savingKey: "database:create",
              error: "",
            });
            try {
              const normalizedServer = normalizePlaygroundServerRecord(draftServer);
              const nextDatabase = await persistDatabaseRecord(normalizePlaygroundDatabaseRecord({
                ...buildPlaygroundDefaultDatabaseDraft(),
                projectId: normalizedServer.projectId,
                name: (String(normalizedServer.name || "").trim() || "New Resource") + " Database",
                description: "Connected to " + (String(normalizedServer.name || "").trim() || "this server") + ".",
                location: "eur3",
              }));
              if (!nextDatabase?.id) {
                throw new Error("Database creation failed.");
              }
              upsertLocalDatabaseRecord(nextDatabase);
              await upsertServerConnection("database", nextDatabase.id);
              return nextDatabase;
            } catch (error) {
              setServerBindingState({
                savingKey: "",
                error: error instanceof Error ? error.message : "Failed to create database connection.",
              });
              return null;
            }
          }
  
          async function createAndConnectAuth() {
            setServerBindingState({
              savingKey: "auth:create",
              error: "",
            });
            try {
              const normalizedServer = normalizePlaygroundServerRecord(draftServer);
              const nextAuth = await persistServerRecord(normalizePlaygroundServerRecord({
                ...buildPlaygroundDefaultServerDraft(),
                projectId: normalizedServer.projectId,
                name: (String(normalizedServer.name || "").trim() || "New Resource") + " Auth",
                description: "Authentication for " + (String(normalizedServer.name || "").trim() || "this server") + ".",
                kind: "auth",
              }));
              if (!nextAuth?.id) {
                throw new Error("Auth module creation failed.");
              }
              upsertLocalServerRecord(nextAuth);
              await upsertServerConnection("auth", nextAuth.id);
              return nextAuth;
            } catch (error) {
              setServerBindingState({
                savingKey: "",
                error: error instanceof Error ? error.message : "Failed to create auth connection.",
              });
              return null;
            }
          }
  
          async function createAndConnectAgentRuntime() {
            setServerBindingState({
              savingKey: "agent_runtime:create",
              error: "",
            });
            try {
              const normalizedServer = normalizePlaygroundServerRecord(draftServer);
              const nextAgentRuntime = await persistServerRecord(normalizePlaygroundServerRecord({
                ...buildPlaygroundDefaultServerDraft(),
                projectId: normalizedServer.projectId,
  	              name: (String(normalizedServer.name || "").trim() || "New Resource") + " Agent Runtime",
  	              description: "Agent runtime for " + (String(normalizedServer.name || "").trim() || "this server") + ".",
  	              kind: "agent_runtime",
  	              sourceEnvironmentId: normalizedServer.sourceEnvironmentId || defaultAgentRuntimeEnvironmentId || null,
  	              authMode: "private",
  	            }));
              if (!nextAgentRuntime?.id) {
                throw new Error("Agent runtime creation failed.");
              }
              upsertLocalServerRecord(nextAgentRuntime);
              await upsertServerConnection("agent_runtime", nextAgentRuntime.id);
              return nextAgentRuntime;
            } catch (error) {
              setServerBindingState({
                savingKey: "",
                error: error instanceof Error ? error.message : "Failed to create agent runtime connection.",
              });
              return null;
            }
          }
  
          async function createAndConnectSecrets() {
            setServerBindingState({
              savingKey: "secrets:create",
              error: "",
            });
            try {
              const normalizedServer = normalizePlaygroundServerRecord(draftServer);
              const nextSecrets = await persistServerRecord(normalizePlaygroundServerRecord({
                ...buildPlaygroundDefaultServerDraft(),
                projectId: normalizedServer.projectId,
                name: (String(normalizedServer.name || "").trim() || "New Resource") + " Secrets",
                description: "Secrets vault for " + (String(normalizedServer.name || "").trim() || "this server") + ".",
                kind: "secrets",
                status: "deployed",
                metadata: {
                  secretVault: {
                    version: 1,
                    documents: [],
                  },
                },
              }));
              if (!nextSecrets?.id) {
                throw new Error("Secrets vault creation failed.");
              }
              upsertLocalServerRecord(nextSecrets);
              setServerSecretsById((current) => ({
                ...current,
                [nextSecrets.id]: [],
              }));
              await upsertServerConnection("secrets", nextSecrets.id);
              return nextSecrets;
            } catch (error) {
              setServerBindingState({
                savingKey: "",
                error: error instanceof Error ? error.message : "Failed to create secrets connection.",
              });
              return null;
            }
          }
  
          async function createAndConnectPayments() {
            setServerBindingState({
              savingKey: "payments:create",
              error: "",
            });
            try {
              const normalizedServer = normalizePlaygroundServerRecord(draftServer);
              const nextPayments = await persistServerRecord(normalizePlaygroundServerRecord({
                ...buildPlaygroundDefaultServerDraft(),
                projectId: normalizedServer.projectId,
                name: (String(normalizedServer.name || "").trim() || "New Resource") + " Payments",
                description: "Stripe payments for " + (String(normalizedServer.name || "").trim() || "this server") + ".",
                kind: "payments",
                status: "deployed",
                metadata: {
                  payments: {
                    version: 1,
                    provider: "stripe",
                    mode: "test",
                    onboardingStatus: "not_started",
                    chargesEnabled: false,
                    payoutsEnabled: false,
                    currency: "usd",
                    totalEarnedCents: 0,
                    totalPaymentCount: 0,
                  },
                },
              }));
              if (!nextPayments?.id) {
                throw new Error("Payments resource creation failed.");
              }
              upsertLocalServerRecord(nextPayments);
              await upsertServerConnection("payments", nextPayments.id);
              return nextPayments;
            } catch (error) {
              setServerBindingState({
                savingKey: "",
                error: error instanceof Error ? error.message : "Failed to create payments connection.",
              });
              return null;
            }
          }
  
          async function syncPaymentsResource(serverId) {
            const normalizedServerId = String(serverId || draftServer?.id || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
  
            setServerSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              const response = await fetch(
                buildPlaygroundServerPaymentsSyncUrl(backendUrl, normalizedServerId),
                {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to sync payments.");
              }
              const updatedServer = getPlaygroundServerResponseRecord(data);
              if (updatedServer) {
                upsertLocalServerRecord(updatedServer);
                if (selectedServerIdRef.current === updatedServer.id) {
                  setDraftServer(updatedServer);
                  serverEditorDirtyRef.current = false;
                }
              }
              setServerSaveState({
                isSaving: false,
                error: "",
                message: "Payments status synced.",
              });
              return updatedServer;
            } catch (error) {
              setServerSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to sync payments.",
                message: "",
              });
              return null;
            }
          }
  
          async function connectPaymentsResource(serverId) {
            const normalizedServerId = String(serverId || draftServer?.id || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
  
            setServerSaveState({
              isSaving: true,
              error: "",
              message: "",
            });
  
            try {
              const response = await fetch(
                buildPlaygroundServerPaymentsConnectUrl(backendUrl, normalizedServerId),
                {
                  method: "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to connect Stripe.");
              }
              const updatedServer = getPlaygroundServerResponseRecord(data);
              if (updatedServer) {
                upsertLocalServerRecord(updatedServer);
                if (selectedServerIdRef.current === updatedServer.id) {
                  setDraftServer(updatedServer);
                  serverEditorDirtyRef.current = false;
                }
              }
              const paymentsOnboardingUrl = typeof data?.onboardingUrl === "string" && data.onboardingUrl.trim()
                ? data.onboardingUrl.trim()
                : typeof data?.url === "string" && data.url.trim()
                  ? data.url.trim()
                  : "";
              if (paymentsOnboardingUrl) {
                window.location.href = paymentsOnboardingUrl;
                return updatedServer;
              }
              setServerSaveState({
                isSaving: false,
                error: "",
                message: "Stripe account connected.",
              });
              return updatedServer;
            } catch (error) {
              setServerSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to connect Stripe.",
                message: "",
              });
              return null;
            }
          }
  
          function openServerSecretComposer(secret = null) {
            const normalizedSecret = secret ? normalizePlaygroundSecretRecord(secret) : null;
            setServerSecretComposerState({
              open: true,
              secretId: normalizedSecret?.id || "",
              name: normalizedSecret?.name || "",
              description: normalizedSecret?.description || "",
              value: "",
              error: "",
              isSaving: false,
            });
          }
  
          function closeServerSecretComposer() {
            setServerSecretComposerState({
              open: false,
              secretId: "",
              name: "",
              description: "",
              value: "",
              error: "",
              isSaving: false,
            });
          }
  
          async function handleServerSecretComposerSubmit(event) {
            if (event?.preventDefault) {
              event.preventDefault();
            }
            const normalizedServerId = String(draftServer?.id || "").trim();
            const normalizedName = String(serverSecretComposerState.name || "").trim();
            const normalizedValue = String(serverSecretComposerState.value || "");
            const isEditingSecret = Boolean(serverSecretComposerState.secretId);
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            if (!normalizedName) {
              setServerSecretComposerState((current) => ({
                ...current,
                error: "Name is required.",
              }));
              return;
            }
            if (!isEditingSecret && !normalizedValue) {
              setServerSecretComposerState((current) => ({
                ...current,
                error: "Secret value is required.",
              }));
              return;
            }
  
            setServerSecretComposerState((current) => ({
              ...current,
              isSaving: true,
              error: "",
            }));
  
            try {
              const body = {
                name: normalizedName,
                description: String(serverSecretComposerState.description || ""),
              };
              if (!isEditingSecret || normalizedValue) {
                body.value = normalizedValue;
              }
              const response = await fetch(
                isEditingSecret
                  ? buildPlaygroundServerSecretUrl(backendUrl, normalizedServerId, serverSecretComposerState.secretId)
                  : buildPlaygroundServerSecretsUrl(backendUrl, normalizedServerId),
                {
                  method: isEditingSecret ? "PUT" : "POST",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(body),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save secret.");
              }
              const sourceSecrets = Array.isArray(data?.secrets) ? data.secrets : [];
              const secrets = sourceSecrets.map(normalizePlaygroundSecretRecord).filter(Boolean);
              setServerSecretsById((current) => ({
                ...current,
                [normalizedServerId]: secrets,
              }));
              setServerSecretsState({ error: "" });
              closeServerSecretComposer();
            } catch (error) {
              setServerSecretComposerState((current) => ({
                ...current,
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to save secret.",
              }));
            }
          }
  
          async function handleDeleteServerSecret(secret) {
            const normalizedSecret = normalizePlaygroundSecretRecord(secret);
            const normalizedServerId = String(draftServer?.id || "").trim();
            if (!normalizedSecret?.id || !normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return;
            }
            const confirmed = window.confirm('Delete secret "' + normalizedSecret.name + '"? Connected apps will no longer be able to read it.');
            if (!confirmed) {
              return;
            }
            setServerSecretsState({ error: "" });
            try {
              const response = await fetch(
                buildPlaygroundServerSecretUrl(backendUrl, normalizedServerId, normalizedSecret.id),
                {
                  method: "DELETE",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete secret.");
              }
              const sourceSecrets = Array.isArray(data?.secrets) ? data.secrets : [];
              const secrets = sourceSecrets.map(normalizePlaygroundSecretRecord).filter(Boolean);
              setServerSecretsById((current) => ({
                ...current,
                [normalizedServerId]: secrets,
              }));
            } catch (error) {
              setServerSecretsState({
                error: error instanceof Error ? error.message : "Failed to delete secret.",
              });
            }
          }
  
          async function createServerAgentRuntimeRun(serverId, input) {
            const normalizedServerId = String(serverId || "").trim();
            if (!normalizedServerId || normalizedServerId === PLAYGROUND_SERVER_DRAFT_ID) {
              return null;
            }
  
            setServerAgentRuntimeRunsState({
              error: "",
              message: "",
            });
  
            const response = await fetch(buildPlaygroundServerRunsUrl(backendUrl, normalizedServerId), {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(input || {}),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to start run.");
            }
            await loadServerAgentRuntimeRuns(normalizedServerId, { force: true });
            setServerAgentRuntimeRunsState({
              error: "",
              message: "Run started.",
            });
            return data?.run || null;
          }
  
          async function cancelServerAgentRuntimeRun(serverId, runId) {
            const normalizedServerId = String(serverId || "").trim();
            const normalizedRunId = String(runId || "").trim();
            if (!normalizedServerId || !normalizedRunId) {
              return false;
            }
  
            const response = await fetch(buildPlaygroundServerRunCancelUrl(backendUrl, normalizedServerId, normalizedRunId), {
              method: "POST",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to cancel run.");
            }
            await loadServerAgentRuntimeRuns(normalizedServerId, { force: true });
            setServerAgentRuntimeRunsState({
              error: "",
              message: "Run cancelled.",
            });
            return true;
          }
  

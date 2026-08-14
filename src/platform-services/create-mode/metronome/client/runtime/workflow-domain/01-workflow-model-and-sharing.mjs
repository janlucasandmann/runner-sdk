export const METRONOME_WORKFLOW_DOMAIN_01_FRAGMENT = String.raw`
        function readMetronomeWorkflowMetadata(rawWorkflow) {
          const workflow = rawWorkflow && typeof rawWorkflow === "object" ? rawWorkflow : {};
          const definition = workflow.definition && typeof workflow.definition === "object" ? workflow.definition : {};
          const metadata = workflow.metadata && typeof workflow.metadata === "object" ? workflow.metadata : {};
          const definitionMetadata = definition.metadata && typeof definition.metadata === "object" ? definition.metadata : {};
          return {
            ...definitionMetadata,
            ...metadata,
          };
        }

        function parseMetronomeTeamResourceShareMetadata(share) {
          const metadata = share?.metadata;
          if (!metadata) return {};
          if (typeof metadata === "string") {
            try {
              const parsed = JSON.parse(metadata);
              return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
            } catch {
              return {};
            }
          }
          return metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {};
        }

        function readMetronomeTeamResourceShareWorkflowMetadata(metadata) {
          const source = metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {};
          return source.workflow && typeof source.workflow === "object" && !Array.isArray(source.workflow)
            ? source.workflow
            : source.metronomeWorkflow && typeof source.metronomeWorkflow === "object" && !Array.isArray(source.metronomeWorkflow)
              ? source.metronomeWorkflow
              : source.metronome && typeof source.metronome === "object" && !Array.isArray(source.metronome)
                ? source.metronome
                : {};
        }

        function isMetronomeTeamResourceWorkflowShare(share) {
          const normalizedType = String(share?.resourceType || share?.resource_type || "").trim();
          const metadata = parseMetronomeTeamResourceShareMetadata(share);
          const metadataType = String(
            metadata.resourceType
            || metadata.resource_type
            || metadata.resourceKind
            || metadata.resource_kind
            || metadata.kind
            || metadata.type
            || ""
          ).trim();
          return normalizedType === "metronome_workflow"
            || metadataType === "metronome_workflow"
            || metadataType === "metronome";
        }

        function isMetronomeWorkflowTeamShared(workflow) {
          const metadata = readMetronomeWorkflowMetadata(workflow);
          return Boolean(
            metadata.teamShare
            || metadata.team_share
            || metadata.sharedViaTeam
            || metadata.shared_via_team
          );
        }

        function getMetronomeTeamShareAccessLevel(workflow) {
          const metadata = readMetronomeWorkflowMetadata(workflow);
          const teamShare = metadata.teamShare && typeof metadata.teamShare === "object" && !Array.isArray(metadata.teamShare)
            ? metadata.teamShare
            : metadata.team_share && typeof metadata.team_share === "object" && !Array.isArray(metadata.team_share)
              ? metadata.team_share
              : {};
          const accessLevel = String(
            teamShare.accessLevel
            || teamShare.access_level
            || metadata.teamShareAccessLevel
            || metadata.team_share_access_level
            || metadata.accessLevel
            || metadata.access_level
            || ""
          ).trim().toLowerCase();
          return ["use", "edit", "manage"].includes(accessLevel) ? accessLevel : "use";
        }

        function normalizeMetronomeIdentityKey(value) {
          return String(value || "").trim().toLowerCase();
        }

        function createMetronomeIdentityKeySet(values) {
          return new Set((Array.isArray(values) ? values : [])
            .map(normalizeMetronomeIdentityKey)
            .filter(Boolean));
        }

        function getMetronomeWorkflowOwnerIdentityKeys(workflow) {
          const source = workflow && typeof workflow === "object" && !Array.isArray(workflow) ? workflow : {};
          const metadata = readMetronomeWorkflowMetadata(source);
          const owner = source.owner && typeof source.owner === "object" && !Array.isArray(source.owner)
            ? source.owner
            : metadata.owner && typeof metadata.owner === "object" && !Array.isArray(metadata.owner)
              ? metadata.owner
              : {};
          return createMetronomeIdentityKeySet([
            source.userId,
            source.user_id,
            source.ownerUserId,
            source.owner_user_id,
            metadata.userId,
            metadata.user_id,
            metadata.ownerUserId,
            metadata.owner_user_id,
            owner.userId,
            owner.user_id,
            owner.id,
            owner.email,
          ]);
        }

        function isMetronomeWorkflowOwnedByIdentityKeys(workflow, identityKeys) {
          if (!workflow || !identityKeys || !identityKeys.size) return false;
          for (const ownerKey of getMetronomeWorkflowOwnerIdentityKeys(workflow)) {
            if (identityKeys.has(ownerKey)) return true;
          }
          return false;
        }

        function getMetronomeEffectiveTeamShareAccessLevel(workflow, identityKeys) {
          return isMetronomeWorkflowOwnedByIdentityKeys(workflow, identityKeys)
            ? "manage"
            : getMetronomeTeamShareAccessLevel(workflow);
        }

        function canEditMetronomeTeamSharedWorkflow(workflow) {
          if (!isMetronomeWorkflowTeamShared(workflow)) return false;
          const accessLevel = getMetronomeTeamShareAccessLevel(workflow);
          return accessLevel === "edit" || accessLevel === "manage";
        }

        function canManageMetronomeTeamSharedWorkflow(workflow) {
          return isMetronomeWorkflowTeamShared(workflow) && getMetronomeTeamShareAccessLevel(workflow) === "manage";
        }

        function getMetronomeTeamShareMissingGraphMessage(workflow) {
          const workflowName = String(workflow?.name || "this Metronome workflow").trim() || "this Metronome workflow";
          return "The team share for \"" + workflowName + "\" does not include a workflow graph snapshot, and the source workflow could not be loaded with your current access.";
        }

        function getMetronomeHiddenTeamSharedWorkflowsStorageKey(scope) {
          const normalizedScope = String(scope || "anonymous").trim().toLowerCase() || "anonymous";
          return METRONOME_HIDDEN_TEAM_SHARED_WORKFLOWS_STORAGE_PREFIX + normalizedScope;
        }

        function getMetronomeTeamSharedWorkflowHiddenKey(workflow) {
          const metadata = readMetronomeWorkflowMetadata(workflow);
          const teamShare = metadata.teamShare && typeof metadata.teamShare === "object" && !Array.isArray(metadata.teamShare)
            ? metadata.teamShare
            : metadata.team_share && typeof metadata.team_share === "object" && !Array.isArray(metadata.team_share)
              ? metadata.team_share
              : {};
          const workflowId = String(
            workflow?.id
            || metadata.workflowId
            || metadata.workflow_id
            || teamShare.workflowId
            || teamShare.workflow_id
            || ""
          ).trim();
          if (workflowId) return "workflow:" + workflowId;
          const shareId = String(
            teamShare.id
            || teamShare.shareId
            || teamShare.share_id
            || metadata.teamShareId
            || metadata.team_share_id
            || ""
          ).trim();
          return shareId ? "share:" + shareId : "";
        }

        function normalizeMetronomeHiddenTeamSharedWorkflowKeys(keys) {
          return Array.from(new Set((Array.isArray(keys) ? keys : [])
            .map((key) => String(key || "").trim())
            .filter(Boolean)));
        }

        function readMetronomeHiddenTeamSharedWorkflowKeys(scope) {
          try {
            if (typeof window === "undefined" || !window.localStorage) return [];
            const parsed = JSON.parse(window.localStorage.getItem(getMetronomeHiddenTeamSharedWorkflowsStorageKey(scope)) || "[]");
            return normalizeMetronomeHiddenTeamSharedWorkflowKeys(parsed);
          } catch {
            return [];
          }
        }

        function writeMetronomeHiddenTeamSharedWorkflowKeys(scope, keys) {
          try {
            if (typeof window === "undefined" || !window.localStorage) return;
            window.localStorage.setItem(
              getMetronomeHiddenTeamSharedWorkflowsStorageKey(scope),
              JSON.stringify(normalizeMetronomeHiddenTeamSharedWorkflowKeys(keys))
            );
          } catch {}
        }

        function getMetronomeWorkflowSearchText(workflow) {
          const metadata = readMetronomeWorkflowMetadata(workflow);
          const teamShare = metadata.teamShare && typeof metadata.teamShare === "object" && !Array.isArray(metadata.teamShare)
            ? metadata.teamShare
            : metadata.team_share && typeof metadata.team_share === "object" && !Array.isArray(metadata.team_share)
              ? metadata.team_share
              : {};
          const creator = normalizeMetronomeWorkflowCreator(workflow) || {};
          return [
            workflow?.name,
            workflow?.description,
            workflow?.status,
            workflow?.triggerSummary,
            metadata.projectName,
            metadata.project_name,
            teamShare.teamName,
            teamShare.team_name,
            creator.name,
            creator.email,
            creator.userId,
          ].map((value) => String(value || "").trim()).filter(Boolean).join(" ").toLowerCase();
        }

        function doesMetronomeWorkflowMatchSearch(workflow, normalizedQuery) {
          const query = String(normalizedQuery || "").trim().toLowerCase();
          if (!query) return true;
          return getMetronomeWorkflowSearchText(workflow).includes(query);
        }

        function getMetronomeWorkflowSortTimestamp(workflow) {
          const candidates = [
            workflow?.lastRunAt,
            workflow?.updatedAt,
            workflow?.publishedAt,
            workflow?.createdAt,
          ];
          for (const candidate of candidates) {
            const time = candidate ? new Date(candidate).getTime() : NaN;
            if (Number.isFinite(time)) return time;
          }
          return 0;
        }

        function getMetronomeWorkflowCreatorSortLabel(workflow) {
          const creator = normalizeMetronomeWorkflowCreator(workflow) || {};
          return String(creator.name || creator.email || creator.userId || "").trim().toLowerCase();
        }

        function getMetronomeWorkflowStatusSortRank(workflow, isHiddenTeamSharedWorkflow = false) {
          if (isHiddenTeamSharedWorkflow) return 4;
          if (isMetronomeWorkflowBuiltIn(workflow)) return 0;
          if (isMetronomeWorkflowTeamShared(workflow)) return 3;
          return workflow?.status === "active" ? 1 : 2;
        }

        function sortMetronomeWorkflowRows(rows, sortMode, hiddenKeySet = new Set()) {
          const normalizedSortMode = String(sortMode || "recent").trim() || "recent";
          return [...(Array.isArray(rows) ? rows : [])].sort((left, right) => {
            const leftHiddenKey = isMetronomeWorkflowTeamShared(left) ? getMetronomeTeamSharedWorkflowHiddenKey(left) : "";
            const rightHiddenKey = isMetronomeWorkflowTeamShared(right) ? getMetronomeTeamSharedWorkflowHiddenKey(right) : "";
            const leftHidden = Boolean(leftHiddenKey && hiddenKeySet.has(leftHiddenKey));
            const rightHidden = Boolean(rightHiddenKey && hiddenKeySet.has(rightHiddenKey));
            if (normalizedSortMode === "name") {
              return String(left?.name || "").localeCompare(String(right?.name || ""), undefined, { sensitivity: "base" });
            }
            if (normalizedSortMode === "status") {
              const statusDelta = getMetronomeWorkflowStatusSortRank(left, leftHidden) - getMetronomeWorkflowStatusSortRank(right, rightHidden);
              if (statusDelta) return statusDelta;
              return String(left?.name || "").localeCompare(String(right?.name || ""), undefined, { sensitivity: "base" });
            }
            if (normalizedSortMode === "creator") {
              const creatorDelta = getMetronomeWorkflowCreatorSortLabel(left).localeCompare(getMetronomeWorkflowCreatorSortLabel(right), undefined, { sensitivity: "base" });
              if (creatorDelta) return creatorDelta;
              return String(left?.name || "").localeCompare(String(right?.name || ""), undefined, { sensitivity: "base" });
            }
            const timestampDelta = getMetronomeWorkflowSortTimestamp(right) - getMetronomeWorkflowSortTimestamp(left);
            if (timestampDelta) return timestampDelta;
            return String(left?.name || "").localeCompare(String(right?.name || ""), undefined, { sensitivity: "base" });
          });
        }

        function normalizeMetronomeTeamRecord(rawTeam) {
          const id = String(rawTeam?.id || rawTeam?.teamId || rawTeam?.team_id || "").trim();
          if (!id) return null;
          return {
            ...rawTeam,
            id,
            name: String(rawTeam?.name || rawTeam?.title || "Untitled team").trim() || "Untitled team",
          };
        }

        function getMetronomeTeamIdentitySources(record) {
          const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
          const sources = [source];
          ["profile", "user", "account", "member", "publicProfile", "public_profile", "metadata"].forEach((key) => {
            if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) sources.push(source[key]);
          });
          [source.providerData, source.provider_data, source.providers].forEach((items) => {
            if (Array.isArray(items)) {
              items.forEach((item) => {
                if (item && typeof item === "object" && !Array.isArray(item)) sources.push(item);
              });
            }
          });
          return sources;
        }

        function readMetronomeTeamIdentityString(record, keys = []) {
          for (const source of getMetronomeTeamIdentitySources(record)) {
            for (const key of keys) {
              const value = String(source?.[key] || "").replace(/\\s+/g, " ").trim();
              if (value) return value;
            }
          }
          return "";
        }

        function readMetronomeTeamIdentityDisplayName(record) {
          const directName = readMetronomeTeamIdentityString(record, [
            "displayName",
            "display_name",
            "name",
            "fullName",
            "full_name",
            "accountDisplayName",
            "accountName",
            "memberDisplayName",
            "memberName",
            "firebaseDisplayName",
            "providerDisplayName",
            "publicName",
            "username",
            "userName",
          ]);
          if (directName) return directName;
          for (const source of getMetronomeTeamIdentitySources(record)) {
            const firstName = String(source.firstName || source.first_name || source.givenName || source.given_name || "").trim();
            const lastName = String(source.lastName || source.last_name || source.familyName || source.family_name || "").trim();
            const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
            if (fullName) return fullName;
          }
          return "";
        }

        function readMetronomeTeamIdentityEmail(record) {
          return readMetronomeTeamIdentityString(record, [
            "email",
            "emailAddress",
            "email_address",
            "mail",
            "primaryEmail",
            "primary_email",
          ]).toLowerCase();
        }

        function readMetronomeTeamIdentityAvatarUrl(record) {
          return readMetronomeTeamIdentityString(record, [
            "photoURL",
            "photoUrl",
            "photo_url",
            "avatarUrl",
            "avatarURL",
            "avatar",
            "picture",
            "imageUrl",
            "profileImageUrl",
            "profile_image_url",
          ]);
        }

        function getMetronomeTrustedDisplayName(displayName, email = "") {
          const normalizedName = String(displayName || "").replace(/\\s+/g, " ").trim();
          if (!normalizedName) return "";
          const normalizedEmail = String(email || "").trim().toLowerCase();
          const normalizedNameLower = normalizedName.toLowerCase();
          if (normalizedEmail && normalizedNameLower === normalizedEmail) return "";
          if (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(normalizedNameLower)) return "";
          return normalizedName;
        }

        function getMetronomeTeamIdentityKeyCandidates(record) {
          const values = [];
          getMetronomeTeamIdentitySources(record).forEach((source) => {
            values.push(
              source.userId,
              source.user_id,
              source.uid,
              source.id,
              source.localId,
              source.local_id,
              source.memberId,
              source.member_id,
              source.email,
              source.emailAddress,
              source.email_address,
              source.mail,
            );
          });
          return values.map((value) => String(value || "").trim()).filter(Boolean);
        }

        function buildMetronomeTeamMemberCreator(record, fallbackUserId = "") {
          const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
          const userId = String(
            fallbackUserId
            || source.userId
            || source.user_id
            || source.uid
            || source.id
            || ""
          ).trim();
          const email = readMetronomeTeamIdentityEmail(source);
          const name = getMetronomeTrustedDisplayName(readMetronomeTeamIdentityDisplayName(source), email) || email || userId;
          const avatarUrl = readMetronomeTeamIdentityAvatarUrl(source);
          if (!userId && !email && !name && !avatarUrl) return null;
          return {
            type: "user",
            id: userId || email || name,
            userId: userId || "",
            email,
            name,
            avatarUrl,
            photoUrl: avatarUrl,
          };
        }

        function addMetronomeTeamMemberCreatorsToMap(map, value) {
          if (!value) return;
          if (Array.isArray(value)) {
            value.forEach((item) => addMetronomeTeamMemberCreatorsToMap(map, item));
            return;
          }
          if (typeof value !== "object") return;
          const creator = buildMetronomeTeamMemberCreator(value);
          if (creator) {
            getMetronomeTeamIdentityKeyCandidates(value).forEach((key) => {
              map.set(key.toLowerCase(), creator);
            });
            if (creator.id) map.set(String(creator.id).toLowerCase(), creator);
            if (creator.userId) map.set(String(creator.userId).toLowerCase(), creator);
            if (creator.email) map.set(String(creator.email).toLowerCase(), creator);
          }
          [
            value.profile,
            value.user,
            value.account,
            value.member,
            value.profiles,
            value.memberProfiles,
            value.member_profiles,
            value.users,
            value.accounts,
            value.items,
            value.results,
            value.data,
            value.included?.profiles,
            value.included?.users,
            value.included?.accounts,
          ].forEach((entry) => addMetronomeTeamMemberCreatorsToMap(map, entry));
        }

        function buildMetronomeTeamMemberCreatorMap(...payloads) {
          const map = new Map();
          payloads.forEach((payload) => addMetronomeTeamMemberCreatorsToMap(map, payload));
          return map;
        }

        function buildMetronomeTeamShareCreatorMap(members = [], ...profilePayloads) {
          const profileCreatorMap = buildMetronomeTeamMemberCreatorMap(...profilePayloads);
          const creatorMap = buildMetronomeTeamMemberCreatorMap(...profilePayloads);
          (Array.isArray(members) ? members : []).forEach((member) => {
            const memberCreator = buildMetronomeTeamMemberCreator(member);
            const profileCreator = getMetronomeTeamIdentityKeyCandidates(member)
              .map((key) => profileCreatorMap.get(String(key || "").trim().toLowerCase()))
              .find(Boolean) || null;
            const mergedCreator = {
              ...(memberCreator || {}),
              ...(profileCreator || {}),
            };
            const mergedEmail = profileCreator?.email || memberCreator?.email || "";
            const mergedUserId = profileCreator?.userId || memberCreator?.userId || "";
            const mergedId = profileCreator?.id || memberCreator?.id || mergedUserId || mergedEmail || "";
            const mergedName = getMetronomeTrustedDisplayName(profileCreator?.name, mergedEmail)
              || getMetronomeTrustedDisplayName(memberCreator?.name, mergedEmail)
              || mergedEmail
              || mergedUserId
              || mergedId;
            const mergedAvatarUrl = profileCreator?.avatarUrl || profileCreator?.photoUrl || memberCreator?.avatarUrl || memberCreator?.photoUrl || "";
            const creator = {
              ...mergedCreator,
              type: mergedCreator.type || "user",
              id: mergedId,
              userId: mergedUserId,
              email: mergedEmail,
              name: mergedName,
              avatarUrl: mergedAvatarUrl,
              photoUrl: mergedAvatarUrl,
            };
            if (!creator.id && !creator.email && !creator.name && !creator.avatarUrl) return;
            const keys = [
              ...getMetronomeTeamIdentityKeyCandidates(member),
              creator.id,
              creator.userId,
              creator.email,
            ].map((key) => String(key || "").trim().toLowerCase()).filter(Boolean);
            keys.forEach((key) => creatorMap.set(key, creator));
          });
          return creatorMap;
        }

        function buildMetronomeTeamOwnerCandidates(members = [], ...profilePayloads) {
          const creatorMap = buildMetronomeTeamShareCreatorMap(members, ...profilePayloads);
          const candidatesByUserId = new Map();
          Array.from(creatorMap.values()).forEach((creator) => {
            const userId = String(creator?.userId || "").trim();
            if (!userId || candidatesByUserId.has(userId)) return;
            candidatesByUserId.set(userId, {
              userId,
              value: userId,
              name: String(creator?.name || creator?.email || "Organization member").trim(),
              email: String(creator?.email || "").trim(),
              avatarUrl: String(creator?.avatarUrl || creator?.photoUrl || "").trim(),
            });
          });
          return Array.from(candidatesByUserId.values());
        }

        async function fetchMetronomeTeamMemberProfilePayload(normalizedBackendUrl, teamId, members = [], headers = new Headers()) {
          const normalizedTeamId = String(teamId || "").trim();
          if (!normalizedTeamId) return null;
          const jsonHeaders = new Headers(headers || {});
          jsonHeaders.set("Content-Type", "application/json");
          try {
            const response = await fetch(normalizedBackendUrl + "/team-member-profiles/lookup", {
              method: "POST",
              headers: jsonHeaders,
              credentials: "include",
              cache: "no-store",
              body: JSON.stringify({
                teamId: normalizedTeamId,
                members: Array.isArray(members) ? members : [],
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok) {
              const profiles = Array.isArray(data?.profiles)
                ? data.profiles
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              if (profiles.length > 0) return data;
            }
          } catch {}
          const profilePaths = [
            "/teams/" + encodeURIComponent(normalizedTeamId) + "/member-profiles",
            "/teams/" + encodeURIComponent(normalizedTeamId) + "/members/profiles",
          ];
          for (const path of profilePaths) {
            try {
              const response = await fetch(normalizedBackendUrl + path, {
                method: "GET",
                headers,
                credentials: "include",
                cache: "no-store",
              });
              const data = await response.json().catch(() => ({}));
              if (response.ok) return data;
            } catch {}
          }
          return null;
        }

        function findMetronomeTeamShareCreator(share, creatorMap) {
          const keys = [
            share?.createdByUserId,
            share?.created_by_user_id,
            share?.creatorUserId,
            share?.creator_user_id,
            share?.userId,
            share?.user_id,
          ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
          for (const key of keys) {
            const creator = creatorMap?.get?.(key);
            if (creator) return creator;
          }
          const fallbackUserId = keys[0] || "";
          return fallbackUserId ? buildMetronomeTeamMemberCreator({ userId: fallbackUserId }, fallbackUserId) : null;
        }

        function buildMetronomeWorkflowFromTeamResourceShare(share, team = null, shareCreator = null) {
          if (!isMetronomeTeamResourceWorkflowShare(share)) return null;
          const metadata = parseMetronomeTeamResourceShareMetadata(share);
          const workflowMetadata = readMetronomeTeamResourceShareWorkflowMetadata(metadata);
          const existingCreator = normalizeMetronomeWorkflowCreator(workflowMetadata, metadata);
          const profileCreator = normalizeMetronomeWorkflowCreator({ creator: shareCreator });
          const creator = existingCreator && profileCreator
            ? {
                ...existingCreator,
                id: existingCreator.id || profileCreator.id,
                userId: existingCreator.userId || profileCreator.userId,
                name: getMetronomeTrustedDisplayName(existingCreator.name, profileCreator.email)
                  || getMetronomeTrustedDisplayName(profileCreator.name, profileCreator.email)
                  || existingCreator.name
                  || profileCreator.name,
                avatarUrl: existingCreator.avatarUrl || profileCreator.avatarUrl,
                photoUrl: existingCreator.photoUrl || profileCreator.photoUrl || existingCreator.avatarUrl || profileCreator.avatarUrl,
              }
            : existingCreator || profileCreator || null;
          const definition = workflowMetadata.definition && typeof workflowMetadata.definition === "object" && !Array.isArray(workflowMetadata.definition)
            ? workflowMetadata.definition
            : metadata.definition && typeof metadata.definition === "object" && !Array.isArray(metadata.definition)
              ? metadata.definition
              : metadata.workflowDefinition && typeof metadata.workflowDefinition === "object" && !Array.isArray(metadata.workflowDefinition)
                ? metadata.workflowDefinition
                : metadata.workflow_definition && typeof metadata.workflow_definition === "object" && !Array.isArray(metadata.workflow_definition)
                  ? metadata.workflow_definition
                  : metadata.workflowGraphSnapshot?.definition && typeof metadata.workflowGraphSnapshot.definition === "object" && !Array.isArray(metadata.workflowGraphSnapshot.definition)
                    ? metadata.workflowGraphSnapshot.definition
                    : metadata.graphSnapshot?.definition && typeof metadata.graphSnapshot.definition === "object" && !Array.isArray(metadata.graphSnapshot.definition)
                      ? metadata.graphSnapshot.definition
                      : {};
          const graphSnapshot = metadata.workflowGraphSnapshot && typeof metadata.workflowGraphSnapshot === "object" && !Array.isArray(metadata.workflowGraphSnapshot)
            ? metadata.workflowGraphSnapshot
            : metadata.graphSnapshot && typeof metadata.graphSnapshot === "object" && !Array.isArray(metadata.graphSnapshot)
              ? metadata.graphSnapshot
              : {};
          const workflowId = String(
            workflowMetadata.id
            || workflowMetadata.workflowId
            || workflowMetadata.workflow_id
            || workflowMetadata.metronomeId
            || workflowMetadata.metronome_id
            || share?.resourceId
            || share?.resource_id
            || ""
          ).trim();
          if (!workflowId) return null;
          const projectId = String(
            workflowMetadata.projectId
            || workflowMetadata.project_id
            || metadata.projectId
            || metadata.project_id
            || ""
          ).trim();
          const projectName = String(
            workflowMetadata.projectName
            || workflowMetadata.project_name
            || metadata.projectName
            || metadata.project_name
            || ""
          ).trim();
          const deployments = normalizeMetronomeDeployments(
            workflowMetadata.deployments
            || workflowMetadata.metronomeDeployments
            || workflowMetadata.metronome_deployments
            || workflowMetadata.versions
            || metadata.deployments
            || metadata.metronomeDeployments
            || metadata.metronome_deployments
            || metadata.versions
            || []
          );
          const activeDeployment = deployments.find((deployment) => deployment.status === "active")
            || deployments.find((deployment) => deployment.id === String(metadata.activeDeploymentId || metadata.active_deployment_id || workflowMetadata.activeDeploymentId || workflowMetadata.active_deployment_id || "").trim())
            || null;
          const normalizedWorkflow = normalizeMetronomeWorkflow({
            ...workflowMetadata,
            id: workflowId,
            name: workflowMetadata.name || workflowMetadata.title || workflowMetadata.workflowName || workflowMetadata.metronomeName || metadata.name || metadata.title || "Untitled Metronome",
            description: workflowMetadata.description || metadata.description || "",
            status: workflowMetadata.status || metadata.status || "draft",
            triggerSummary: workflowMetadata.triggerSummary || workflowMetadata.trigger_summary || metadata.triggerSummary || metadata.trigger_summary || "Manual",
            projectId,
            projectName,
            ...(creator ? { creator } : {}),
            definition,
            nodes: Array.isArray(workflowMetadata.nodes) ? workflowMetadata.nodes : Array.isArray(definition.nodes) ? definition.nodes : Array.isArray(metadata.nodes) ? metadata.nodes : Array.isArray(graphSnapshot.nodes) ? graphSnapshot.nodes : [],
            edges: Array.isArray(workflowMetadata.edges) ? workflowMetadata.edges : Array.isArray(definition.edges) ? definition.edges : Array.isArray(metadata.edges) ? metadata.edges : Array.isArray(graphSnapshot.edges) ? graphSnapshot.edges : [],
            deployments,
            metronomeDeployments: deployments,
            activeDeploymentId: String(workflowMetadata.activeDeploymentId || workflowMetadata.active_deployment_id || metadata.activeDeploymentId || metadata.active_deployment_id || activeDeployment?.id || "").trim(),
            activeDeploymentVersion: normalizeMetronomeVersionNumber(
              workflowMetadata.activeDeploymentVersion
              ?? workflowMetadata.active_deployment_version
              ?? metadata.activeDeploymentVersion
              ?? metadata.active_deployment_version
              ?? activeDeployment?.version,
              0
            ),
            publishedAt: String(workflowMetadata.publishedAt || workflowMetadata.published_at || metadata.publishedAt || metadata.published_at || activeDeployment?.publishedAt || "").trim(),
            lastRunAt: workflowMetadata.lastRunAt || workflowMetadata.last_run_at || metadata.lastRunAt || metadata.last_run_at || "",
            createdAt: workflowMetadata.createdAt || workflowMetadata.created_at || share?.createdAt || share?.created_at || "",
            updatedAt: workflowMetadata.updatedAt || workflowMetadata.updated_at || share?.updatedAt || share?.updated_at || "",
            metadata: {
              ...metadata,
              ...(workflowMetadata.metadata && typeof workflowMetadata.metadata === "object" && !Array.isArray(workflowMetadata.metadata) ? workflowMetadata.metadata : {}),
              ...buildMetronomeWorkflowCreatorMetadata(creator),
              deployments,
              metronomeDeployments: deployments,
              resourceType: "metronome_workflow",
              resourceKind: "metronome_workflow",
              teamShare: {
                id: String(share?.id || share?.shareId || share?.share_id || "").trim(),
                teamId: String(team?.id || share?.teamId || share?.team_id || "").trim(),
                teamName: String(team?.name || share?.teamName || share?.team_name || "Team").trim() || "Team",
                accessLevel: String(share?.accessLevel || share?.access_level || "use").trim() || "use",
              },
              sharedViaTeam: true,
            },
          });
          return normalizedWorkflow.id ? normalizedWorkflow : null;
        }

        async function fetchMetronomeSharedWorkflowsFromTeamsApi(options = {}) {
          let normalizedBackendUrl = String(options.backendUrl || "/api/real").trim() || "/api/real";
          normalizedBackendUrl = normalizedBackendUrl.replace(new RegExp("/+$"), "");
          if (!normalizedBackendUrl) return [];
          const headers = new Headers(options.requestHeaders || {});
          if (options.apiKey) headers.set("X-API-Key", options.apiKey);
          const teamsResponse = await fetch(normalizedBackendUrl + "/teams", {
            method: "GET",
            headers,
            credentials: "include",
            cache: "no-store",
          });
          const teamsData = await teamsResponse.json().catch(() => ({}));
          if (!teamsResponse.ok) {
            if (teamsResponse.status === 402 || teamsResponse.status === 404) return [];
            throw new Error(teamsData?.message || teamsData?.error || "Failed to load shared Metronome teams.");
          }
          const teams = (Array.isArray(teamsData?.data) ? teamsData.data : Array.isArray(teamsData?.teams) ? teamsData.teams : [])
            .map(normalizeMetronomeTeamRecord)
            .filter(Boolean);
          const workflowRows = [];
          await Promise.all(teams.map(async (team) => {
            try {
              const [sharesResponse, membersResponse] = await Promise.all([
                fetch(normalizedBackendUrl + "/teams/" + encodeURIComponent(team.id) + "/resource-shares", {
                  method: "GET",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                }),
                fetch(normalizedBackendUrl + "/teams/" + encodeURIComponent(team.id) + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account", {
                  method: "GET",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                }),
              ]);
              const data = await sharesResponse.json().catch(() => ({}));
              const membersData = await membersResponse.json().catch(() => ({}));
              if (!sharesResponse.ok) return;
              const shares = Array.isArray(data?.data) ? data.data : Array.isArray(data?.shares) ? data.shares : Array.isArray(data?.resourceShares) ? data.resourceShares : [];
              const members = Array.isArray(membersData?.data) ? membersData.data : Array.isArray(membersData?.members) ? membersData.members : [];
              const memberProfilesPayload = await fetchMetronomeTeamMemberProfilePayload(normalizedBackendUrl, team.id, members, headers);
              const creatorMap = buildMetronomeTeamShareCreatorMap(members, membersData, memberProfilesPayload);
              shares.forEach((share) => {
                const shareCreator = findMetronomeTeamShareCreator(share, creatorMap);
                const workflow = buildMetronomeWorkflowFromTeamResourceShare(share, team, shareCreator);
                if (workflow) workflowRows.push(workflow);
              });
            } catch (error) {
              console.warn("[Metronome] Failed to load team resource shares", error);
              try {
                const response = await fetch(normalizedBackendUrl + "/teams/" + encodeURIComponent(team.id) + "/resource-shares", {
                  method: "GET",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) return;
                const shares = Array.isArray(data?.data) ? data.data : Array.isArray(data?.shares) ? data.shares : Array.isArray(data?.resourceShares) ? data.resourceShares : [];
                shares.forEach((share) => {
                  const workflow = buildMetronomeWorkflowFromTeamResourceShare(share, team, findMetronomeTeamShareCreator(share, new Map()));
                  if (workflow) workflowRows.push(workflow);
                });
              } catch (fallbackError) {
                console.warn("[Metronome] Failed to load fallback team resource shares", fallbackError);
              }
            }
          }));
          const workflowsById = new Map();
          workflowRows.forEach((workflow) => {
            const workflowId = String(workflow?.id || "").trim();
            if (!workflowId || workflowsById.has(workflowId)) return;
            workflowsById.set(workflowId, workflow);
          });
          return Array.from(workflowsById.values());
        }
        function readMetronomeWorkflowProjectId(rawWorkflow) {
          const workflow = rawWorkflow && typeof rawWorkflow === "object" ? rawWorkflow : {};
          const definition = workflow.definition && typeof workflow.definition === "object" ? workflow.definition : {};
          const metadata = readMetronomeWorkflowMetadata(workflow);
          return String(
            workflow.projectId
            || workflow.project_id
            || definition.projectId
            || definition.project_id
            || metadata.projectId
            || metadata.project_id
            || ""
          ).trim();
        }

        function readMetronomeWorkflowProjectName(rawWorkflow) {
          const workflow = rawWorkflow && typeof rawWorkflow === "object" ? rawWorkflow : {};
          const definition = workflow.definition && typeof workflow.definition === "object" ? workflow.definition : {};
          const metadata = readMetronomeWorkflowMetadata(workflow);
          return String(
            workflow.projectName
            || workflow.project_name
            || definition.projectName
            || definition.project_name
            || metadata.projectName
            || metadata.project_name
            || ""
          ).trim();
        }

        function readMetronomeCreatorString(record, keys = []) {
          const source = record && typeof record === "object" && !Array.isArray(record) ? record : null;
          if (!source) return "";
          for (const key of keys) {
            const value = source[key];
            if (typeof value === "string" && value.trim()) return value.trim();
            if (typeof value === "number" && Number.isFinite(value)) return String(value);
          }
          return "";
        }

        function readMetronomeCreatorObject(record, keys = []) {
          const source = record && typeof record === "object" && !Array.isArray(record) ? record : null;
          if (!source) return null;
          for (const key of keys) {
            const value = source[key];
            if (value && typeof value === "object" && !Array.isArray(value)) return value;
          }
          return null;
        }

        function normalizeMetronomeWorkflowCreator(rawWorkflow, rawMetadata = null) {
          const workflow = rawWorkflow && typeof rawWorkflow === "object" && !Array.isArray(rawWorkflow) ? rawWorkflow : {};
          const definition = workflow.definition && typeof workflow.definition === "object" && !Array.isArray(workflow.definition) ? workflow.definition : {};
          const metadata = rawMetadata && typeof rawMetadata === "object" && !Array.isArray(rawMetadata)
            ? rawMetadata
            : readMetronomeWorkflowMetadata(workflow);
          const creator = readMetronomeCreatorObject(workflow, ["creator", "createdBy", "created_by", "author"])
            || readMetronomeCreatorObject(metadata, ["creator", "createdBy", "created_by", "author"])
            || readMetronomeCreatorObject(definition, ["creator", "createdBy", "created_by", "author"])
            || {};
          const rawCreatedBy = readMetronomeCreatorString(workflow, ["createdBy", "created_by"])
            || readMetronomeCreatorString(metadata, ["createdBy", "created_by"])
            || readMetronomeCreatorString(definition, ["createdBy", "created_by"]);
          const rawType = readMetronomeCreatorString(creator, ["type", "kind", "creatorType", "creator_type", "role"])
            || readMetronomeCreatorString(workflow, ["creatorType", "creator_type", "createdByType", "created_by_type"])
            || readMetronomeCreatorString(metadata, ["creatorType", "creator_type", "createdByType", "created_by_type"])
            || readMetronomeCreatorString(definition, ["creatorType", "creator_type", "createdByType", "created_by_type"]);
          const agentId = readMetronomeCreatorString(creator, ["agentId", "agent_id"])
            || readMetronomeCreatorString(workflow, ["creatorAgentId", "creator_agent_id", "createdByAgentId", "created_by_agent_id"])
            || readMetronomeCreatorString(metadata, ["creatorAgentId", "creator_agent_id", "createdByAgentId", "created_by_agent_id"])
            || readMetronomeCreatorString(definition, ["creatorAgentId", "creator_agent_id", "createdByAgentId", "created_by_agent_id"]);
          const userId = readMetronomeCreatorString(creator, ["userId", "user_id"])
            || readMetronomeCreatorString(workflow, ["creatorUserId", "creator_user_id", "createdByUserId", "created_by_user_id"])
            || readMetronomeCreatorString(metadata, ["creatorUserId", "creator_user_id", "createdByUserId", "created_by_user_id"])
            || readMetronomeCreatorString(definition, ["creatorUserId", "creator_user_id", "createdByUserId", "created_by_user_id"]);
          const email = readMetronomeCreatorString(creator, ["email", "mail"])
            || readMetronomeCreatorString(workflow, ["creatorEmail", "creator_email", "createdByEmail", "created_by_email", "email"])
            || readMetronomeCreatorString(metadata, ["creatorEmail", "creator_email", "createdByEmail", "created_by_email", "email"])
            || readMetronomeCreatorString(definition, ["creatorEmail", "creator_email", "createdByEmail", "created_by_email", "email"]);
          const id = readMetronomeCreatorString(creator, ["id"])
            || agentId
            || userId
            || email
            || readMetronomeCreatorString(workflow, ["creatorId", "creator_id"])
            || readMetronomeCreatorString(metadata, ["creatorId", "creator_id"])
            || rawCreatedBy;
          const name = readMetronomeCreatorString(creator, ["name", "displayName", "display_name", "label", "email"])
            || readMetronomeCreatorString(workflow, ["creatorName", "creator_name", "createdByName", "created_by_name", "createdByLabel", "created_by_label"])
            || readMetronomeCreatorString(metadata, ["creatorName", "creator_name", "createdByName", "created_by_name", "createdByLabel", "created_by_label"])
            || readMetronomeCreatorString(definition, ["creatorName", "creator_name", "createdByName", "created_by_name", "createdByLabel", "created_by_label"])
            || (!agentId && !userId ? rawCreatedBy : "");
          const avatarUrl = readMetronomeCreatorString(creator, ["photoUrl", "photoURL", "avatarUrl", "avatarURL", "avatar", "picture"])
            || readMetronomeCreatorString(workflow, ["creatorAvatarUrl", "creator_avatar_url", "creatorPhotoUrl", "creator_photo_url"])
            || readMetronomeCreatorString(metadata, ["creatorAvatarUrl", "creator_avatar_url", "creatorPhotoUrl", "creator_photo_url"])
            || readMetronomeCreatorString(definition, ["creatorAvatarUrl", "creator_avatar_url", "creatorPhotoUrl", "creator_photo_url"]);
          const normalizedType = String(rawType || "").trim().toLowerCase();
          const type = normalizedType.includes("agent")
            ? "agent"
            : normalizedType.includes("user") || normalizedType.includes("human")
              ? "user"
              : agentId
                ? "agent"
                : userId
                  ? "user"
                  : "";
          if (!type && !id && !name && !avatarUrl) return null;
          return {
            type,
            id,
            agentId,
            userId,
            email,
            name,
            avatarUrl,
            photoUrl: avatarUrl,
          };
        }

        function buildMetronomeWorkflowCreatorMetadata(creator) {
          const normalizedCreator = normalizeMetronomeWorkflowCreator({ creator });
          if (!normalizedCreator) return {};
          const isAgentCreator = normalizedCreator.type === "agent";
          const isUserCreator = normalizedCreator.type === "user";
          return {
            creator: normalizedCreator,
            ...(normalizedCreator.type ? { creatorType: normalizedCreator.type, creator_type: normalizedCreator.type } : {}),
            ...(normalizedCreator.id ? { creatorId: normalizedCreator.id, creator_id: normalizedCreator.id } : {}),
            ...(normalizedCreator.name ? { creatorName: normalizedCreator.name, creator_name: normalizedCreator.name } : {}),
            ...(normalizedCreator.email ? { creatorEmail: normalizedCreator.email, creator_email: normalizedCreator.email } : {}),
            ...(normalizedCreator.avatarUrl ? { creatorAvatarUrl: normalizedCreator.avatarUrl, creator_avatar_url: normalizedCreator.avatarUrl } : {}),
            ...(isAgentCreator && normalizedCreator.agentId ? { creatorAgentId: normalizedCreator.agentId, creator_agent_id: normalizedCreator.agentId } : {}),
            ...(isUserCreator && normalizedCreator.userId ? { creatorUserId: normalizedCreator.userId, creator_user_id: normalizedCreator.userId } : {}),
          };
        }

        function buildMetronomeWorkflowProjectMetadata(rawWorkflow) {
          const metadata = readMetronomeWorkflowMetadata(rawWorkflow);
          const projectId = readMetronomeWorkflowProjectId(rawWorkflow);
          const projectName = readMetronomeWorkflowProjectName(rawWorkflow);
          const creator = normalizeMetronomeWorkflowCreator(rawWorkflow, metadata);
          const wallpaperId = resolveMetronomeWorkflowWallpaperId(rawWorkflow, metadata.wallpaperId || metadata.workflowWallpaperId || "");
          return {
            ...metadata,
            ...buildMetronomeWorkflowCreatorMetadata(creator),
            ...(projectId ? { projectId, project_id: projectId } : {}),
            ...(projectName ? { projectName, project_name: projectName } : {}),
            ...(wallpaperId ? { wallpaperId, workflowWallpaperId: wallpaperId } : {}),
          };
        }

        function stripMetronomeDeploymentMetadata(metadata) {
          const source = metadata && typeof metadata === "object" ? metadata : {};
          const {
            deployments,
            metronomeDeployments,
            activeDeploymentId,
            active_deployment_id,
            activeDeploymentVersion,
            active_deployment_version,
            publishedAt,
            published_at,
            ...rest
          } = source;
          return rest;
        }

        function normalizeMetronomeVersionNumber(value, fallback = 0) {
          if (typeof value === "string") {
            const match = value.trim().match(/^(?:v|version\s*)?(\d+)$/i);
            if (match) return Number(match[1]);
          }
          const parsed = Number(value);
          if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
          const parsedFallback = Number(fallback);
          return Number.isFinite(parsedFallback) && parsedFallback >= 0
            ? Math.floor(parsedFallback)
            : 0;
        }

        function formatMetronomeVersionLabel(value) {
          return "v" + normalizeMetronomeVersionNumber(value);
        }

        function formatMetronomeVersionTitle(value, description = "") {
          const label = formatMetronomeVersionLabel(value);
          const normalizedDescription = String(description || "").trim();
          return normalizedDescription ? label + " | " + normalizedDescription : label;
        }

        function normalizeMetronomeDeploymentVersion(rawDeployment, fallbackIndex = 0) {
          const deployment = rawDeployment && typeof rawDeployment === "object" ? rawDeployment : {};
          const definition = deployment.definition && typeof deployment.definition === "object" ? deployment.definition : {};
          const rawNodes = Array.isArray(deployment.nodes)
            ? deployment.nodes
            : Array.isArray(definition.nodes)
              ? definition.nodes
              : [];
          const rawEdges = Array.isArray(deployment.edges)
            ? deployment.edges
            : Array.isArray(definition.edges)
              ? definition.edges
              : [];
          const nodes = createMetronomePersistedNodes(rawNodes);
          const edges = createMetronomePersistedEdges(rawEdges);
          const createdAt = String(deployment.createdAt || deployment.created_at || deployment.publishedAt || deployment.published_at || new Date().toISOString()).trim();
          const id = String(deployment.id || deployment.deploymentId || deployment.deployment_id || ("mdep_" + (fallbackIndex + 1))).trim();
          const versionNumber = normalizeMetronomeVersionNumber(
            deployment.version ?? deployment.versionNumber ?? deployment.version_number,
            fallbackIndex
          );
          const rawStatus = String(deployment.status || "").trim().toLowerCase();
          const status = ["active", "saved", "superseded", "unpublished"].includes(rawStatus) ? rawStatus : "saved";
          return {
            id,
            version: versionNumber,
            label: formatMetronomeVersionLabel(versionNumber),
            description: String(deployment.description || deployment.summary || "").trim(),
            status,
            createdAt,
            updatedAt: String(deployment.updatedAt || deployment.updated_at || "").trim(),
            publishedAt: String(deployment.publishedAt || deployment.published_at || "").trim(),
            triggerSummary: String(deployment.triggerSummary || deployment.trigger_summary || deriveMetronomeTriggerSummary(nodes) || "Manual").trim(),
            nodeCount: Number(deployment.nodeCount || deployment.node_count || nodes.length) || nodes.length,
            edgeCount: Number(deployment.edgeCount || deployment.edge_count || edges.length) || edges.length,
            nodes,
            edges,
            definition: {
              ...definition,
              nodes,
              edges,
            },
          };
        }

        function normalizeMetronomeDeployments(value) {
          const rawItems = Array.isArray(value) ? value : [];
          return rawItems
            .map((deployment, index) => normalizeMetronomeDeploymentVersion(deployment, index))
            .filter((deployment) => deployment.id)
            .sort((a, b) => {
              const versionDelta = Number(b.version || 0) - Number(a.version || 0);
              if (versionDelta) return versionDelta;
              return new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime();
            });
        }

        function readMetronomeWorkflowDeployments(rawWorkflow) {
          const workflow = rawWorkflow && typeof rawWorkflow === "object" ? rawWorkflow : {};
          const definition = workflow.definition && typeof workflow.definition === "object" ? workflow.definition : {};
          const metadata = readMetronomeWorkflowMetadata(workflow);
          return normalizeMetronomeDeployments(
            workflow.deployments
            || workflow.versions
            || workflow.deploymentVersions
            || workflow.deployment_versions
            || metadata.deployments
            || metadata.metronomeDeployments
            || definition.deployments
            || definition.versions
            || []
          );
        }

        function createMetronomeDeploymentId() {
          return "mdep_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
        }

        function createMetronomeDeploymentVersion(workflow, nodes, edges, existingDeployments = [], options = {}) {
          const now = new Date().toISOString();
          const requestedStatus = String(options?.status || "saved").trim().toLowerCase();
          const status = requestedStatus || "saved";
          const persistedNodes = createMetronomePersistedNodes(nodes);
          const persistedEdges = createMetronomePersistedEdges(edges);
          const normalizedExisting = normalizeMetronomeDeployments(existingDeployments);
          const nextVersion = normalizedExisting.reduce(
            (maxVersion, deployment) => Math.max(
              maxVersion,
              normalizeMetronomeVersionNumber(deployment.version, 0)
            ),
            -1
          ) + 1;
          const sanitizedWorkflow = {
            ...(workflow && typeof workflow === "object" ? workflow : {}),
            metadata: stripMetronomeDeploymentMetadata(buildMetronomeWorkflowProjectMetadata(workflow)),
          };
          const definition = createMetronomeWorkflowDefinition(sanitizedWorkflow, persistedNodes, persistedEdges);
          return normalizeMetronomeDeploymentVersion({
            id: createMetronomeDeploymentId(),
            version: nextVersion,
            label: formatMetronomeVersionLabel(nextVersion),
            description: String(options?.description || "").trim(),
            status,
            createdAt: now,
            publishedAt: status === "active" ? now : "",
            triggerSummary: deriveMetronomeTriggerSummary(persistedNodes),
            nodeCount: persistedNodes.length,
            edgeCount: persistedEdges.length,
            nodes: persistedNodes,
            edges: persistedEdges,
            definition,
          }, nextVersion);
        }

        function formatMetronomeDeploymentTimestamp(value) {
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

        function normalizeMetronomeDeploymentEvent(rawEvent) {
          const event = rawEvent && typeof rawEvent === "object" ? rawEvent : {};
          const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
          const definition = event.definition && typeof event.definition === "object" ? event.definition : {};
          const rawAction = String(event.action || metadata.action || "").trim().toLowerCase();
          const action = rawAction === "unpublish" ? "unpublish" : "publish";
          const rawStatus = String(event.status || metadata.status || "").trim().toLowerCase();
          const status = rawStatus || (action === "unpublish" ? "unpublished" : "published");
          const rawVersionNumber = event.version
            ?? event.versionNumber
            ?? event.version_number
            ?? metadata.versionNumber
            ?? metadata.version_number
            ?? metadata.version;
          const hasVersionNumber = rawVersionNumber !== undefined
            && rawVersionNumber !== null
            && String(rawVersionNumber).trim() !== "";
          const versionNumber = normalizeMetronomeVersionNumber(rawVersionNumber, 0);
          const id = String(event.id || metadata.id || "").trim();
          return {
            id,
            metronomeId: String(event.metronomeId || event.metronome_id || "").trim(),
            versionId: String(event.versionId || event.version_id || "").trim(),
            action,
            status,
            version: versionNumber,
            label: hasVersionNumber
              ? formatMetronomeVersionLabel(versionNumber)
              : String(event.label || event.name || metadata.versionName || metadata.version_name || "").trim(),
            triggerSummary: String(event.triggerSummary || event.trigger_summary || metadata.triggerSummary || metadata.trigger_summary || deriveMetronomeTriggerSummary(definition.nodes || event.nodes || []) || "").trim(),
            nodeCount: Number(event.nodeCount || event.node_count || (Array.isArray(event.nodes) ? event.nodes.length : Array.isArray(definition.nodes) ? definition.nodes.length : 0)) || 0,
            edgeCount: Number(event.edgeCount || event.edge_count || (Array.isArray(event.edges) ? event.edges.length : Array.isArray(definition.edges) ? definition.edges.length : 0)) || 0,
            createdAt: String(event.createdAt || event.created_at || "").trim(),
            metadata,
          };
        }

        function normalizeMetronomeDeploymentEvents(value) {
          const rawItems = Array.isArray(value) ? value : [];
          return rawItems
            .map(normalizeMetronomeDeploymentEvent)
            .filter((event) => event.id)
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        }

        function filterMetronomeWorkflowsByProject(workflows, projectId = "") {
          const normalizedProjectId = String(projectId || "").trim();
          const rows = Array.isArray(workflows) ? workflows : [];
          if (!normalizedProjectId) return rows;
          return rows.filter((workflow) => readMetronomeWorkflowProjectId(workflow) === normalizedProjectId);
        }

        function createDefaultMetronomeWorkflow(name = "Project operating rhythm", options = {}) {
          const graphFactory = typeof options?.graphFactory === "function" ? options.graphFactory : createDefaultMetronomeGraph;
          const graph = graphFactory(options);
          const projectId = String(options?.projectId || "").trim();
          const projectName = String(options?.projectName || "").trim();
          const creator = normalizeMetronomeWorkflowCreator({ creator: options?.creator });
          const metadata = buildMetronomeWorkflowProjectMetadata({
            metadata: {
              ...(options?.metadata && typeof options.metadata === "object" ? options.metadata : {}),
              ...(options?.templateId ? { templateId: String(options.templateId), template_id: String(options.templateId) } : {}),
              ...(options?.templateName ? { templateName: String(options.templateName), template_name: String(options.templateName) } : {}),
              ...buildMetronomeWorkflowCreatorMetadata(creator),
            },
            projectId,
            projectName,
          });
          const wallpaperId = resolveMetronomeWorkflowWallpaperId({ metadata }, metadata.wallpaperId || metadata.workflowWallpaperId || "");
          return {
            id: "met_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7),
            name,
            status: "draft",
            triggerSummary: deriveMetronomeTriggerSummary(graph.nodes),
            lastRunAt: "",
            runsToday: 0,
            waitingApprovals: 0,
            projectId,
            projectName,
            ...(creator ? { creator } : {}),
            ...(wallpaperId ? { wallpaperId, workflowWallpaperId: wallpaperId } : {}),
            metadata,
            nodes: graph.nodes,
            edges: graph.edges,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        function isMetronomeWorkflowBuiltIn(workflow) {
          if (!workflow || typeof workflow !== "object") return false;
          const metadata = workflow.metadata && typeof workflow.metadata === "object" ? workflow.metadata : {};
          return Boolean(
            metadata.builtIn
            || metadata.built_in
            || metadata.defaultWorkflow
            || metadata.default_workflow
            || String(workflow.id || "").startsWith("builtin_")
          );
        }

        function createBuiltInMetronomeWorkflow(definition, options = {}) {
          const sourceDefinition = definition && typeof definition === "object" ? definition : {};
          const graphFactory = typeof sourceDefinition.graphFactory === "function" ? sourceDefinition.graphFactory : createDefaultMetronomeGraph;
          const graph = graphFactory(options);
          const projectId = String(options?.projectId || "").trim();
          const projectName = String(options?.projectName || "").trim();
          const sourceMetadata = sourceDefinition.metadata && typeof sourceDefinition.metadata === "object" && !Array.isArray(sourceDefinition.metadata)
            ? sourceDefinition.metadata
            : {};
          return normalizeMetronomeWorkflow({
            id: String(sourceDefinition.id || "builtin_workflow"),
            name: String(sourceDefinition.title || sourceDefinition.name || "Default workflow"),
            description: String(sourceDefinition.copy || sourceDefinition.description || ""),
            status: "draft",
            triggerSummary: sourceDefinition.triggerSummary || deriveMetronomeTriggerSummary(graph.nodes),
            lastRunAt: "",
            runsToday: 0,
            waitingApprovals: 0,
            projectId,
            projectName,
            metadata: {
              builtIn: true,
              built_in: true,
              defaultWorkflow: true,
              default_workflow: true,
              readOnly: true,
              read_only: true,
              copyOnly: true,
              copy_only: true,
              defaultWorkflowId: String(sourceDefinition.id || "builtin_workflow"),
              default_workflow_id: String(sourceDefinition.id || "builtin_workflow"),
              ...sourceMetadata,
              ...(projectId ? { projectId, project_id: projectId } : {}),
              ...(projectName ? { projectName, project_name: projectName } : {}),
            },
            nodes: graph.nodes,
            edges: graph.edges,
            createdAt: "",
            updatedAt: "",
          });
        }

        function getMetronomeResourceTemplateWorkflowId(templateId) {
          const normalizedTemplateId = String(templateId || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
          return normalizedTemplateId ? "builtin_template_" + normalizedTemplateId : "";
        }

        function getMetronomeResourceTemplateGraphFactory(templateId) {
          const normalizedTemplateId = String(templateId || "").trim();
          return METRONOME_RESOURCE_TEMPLATE_GRAPH_FACTORIES[normalizedTemplateId] || createDefaultMetronomeGraph;
        }

        function createResourceTemplateMetronomePreviewWorkflow(template, options = {}) {
          const sourceTemplate = template && typeof template === "object" ? template : {};
          const templateId = String(sourceTemplate.id || "").trim();
          if (!templateId || String(sourceTemplate.type || "").trim() !== "metronome") {
            return null;
          }
          const workflowId = getMetronomeResourceTemplateWorkflowId(templateId);
          if (!workflowId) {
            return null;
          }
          const graphFactory = getMetronomeResourceTemplateGraphFactory(templateId);
          return createBuiltInMetronomeWorkflow({
            id: workflowId,
            title: String(sourceTemplate.title || "Metronome template").trim() || "Metronome template",
            copy: String(sourceTemplate.description || sourceTemplate.summary || "").trim(),
            graphFactory: (graphOptions) => graphFactory({
              ...(graphOptions || {}),
              resourceTemplate: sourceTemplate,
            }),
            metadata: {
              templatePreview: true,
              template_preview: true,
              resourceTemplateId: templateId,
              resource_template_id: templateId,
              resourceTemplateType: "metronome",
              resource_template_type: "metronome",
            },
          }, options);
        }

        function removeMetronomeBuiltInMetadata(metadata) {
          const nextMetadata = metadata && typeof metadata === "object" ? { ...metadata } : {};
          [
            "builtIn",
            "built_in",
            "defaultWorkflow",
            "default_workflow",
            "readOnly",
            "read_only",
            "copyOnly",
            "copy_only",
            "defaultWorkflowId",
            "default_workflow_id",
          ].forEach((key) => {
            delete nextMetadata[key];
          });
          return nextMetadata;
        }

        function cloneMetronomeJsonValue(value, fallback) {
          try {
            return JSON.parse(JSON.stringify(value ?? fallback));
          } catch {
            return fallback;
          }
        }

        function createMetronomeWorkflowCopy(sourceWorkflow, options = {}) {
          const source = normalizeMetronomeWorkflow(sourceWorkflow);
          const now = new Date().toISOString();
          const sourceNodes = Array.isArray(options.nodes)
            ? options.nodes
            : source.nodes;
          const sourceEdges = Array.isArray(options.edges)
            ? options.edges
            : source.edges;
          const persistedNodes = createMetronomePersistedNodes(cloneMetronomeJsonValue(sourceNodes, []));
          const persistedEdges = createMetronomePersistedEdges(cloneMetronomeJsonValue(sourceEdges, []));
          const projectId = options.projectId !== undefined
            ? String(options.projectId || "").trim()
            : readMetronomeWorkflowProjectId(source);
          const projectName = options.projectName !== undefined
            ? String(options.projectName || "").trim()
            : readMetronomeWorkflowProjectName(source);
          const sourceMetadata = removeMetronomeBuiltInMetadata(stripMetronomeDeploymentMetadata(buildMetronomeWorkflowProjectMetadata({
            ...source,
            projectId,
            projectName,
          })));
          const creator = normalizeMetronomeWorkflowCreator({ creator: options?.creator }) || normalizeMetronomeWorkflowCreator(source);
          const sourceId = String(source.id || "").trim();
          const metadata = {
            ...sourceMetadata,
            ...buildMetronomeWorkflowCreatorMetadata(creator),
            ...(projectId ? { projectId, project_id: projectId } : {}),
            ...(projectName ? { projectName, project_name: projectName } : {}),
            ...(sourceId ? { copiedFromWorkflowId: sourceId, copied_from_workflow_id: sourceId } : {}),
`;

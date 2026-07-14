export const METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT = String.raw`
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
          const creator = normalizeMetronomeWorkflowCreator(source, metadata) || {};
          const userCreatorId = creator.type === "user" ? creator.id : "";
          return createMetronomeIdentityKeySet([
            source.userId,
            source.user_id,
            source.ownerUserId,
            source.owner_user_id,
            source.createdByUserId,
            source.created_by_user_id,
            metadata.userId,
            metadata.user_id,
            metadata.ownerUserId,
            metadata.owner_user_id,
            metadata.createdByUserId,
            metadata.created_by_user_id,
            metadata.creatorUserId,
            metadata.creator_user_id,
            creator.userId,
            creator.email,
            userCreatorId,
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
            const mergedEmail = memberCreator?.email || profileCreator?.email || "";
            const mergedUserId = memberCreator?.userId || profileCreator?.userId || "";
            const mergedId = memberCreator?.id || profileCreator?.id || mergedUserId || mergedEmail || "";
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
            activeDeploymentVersion: Number(workflowMetadata.activeDeploymentVersion || workflowMetadata.active_deployment_version || metadata.activeDeploymentVersion || metadata.active_deployment_version || activeDeployment?.version || 0) || 0,
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
          const versionNumber = Number(deployment.version || deployment.versionNumber || deployment.version_number || 0) || (fallbackIndex + 1);
          const rawStatus = String(deployment.status || "").trim().toLowerCase();
          const status = ["active", "saved", "superseded", "unpublished"].includes(rawStatus) ? rawStatus : "saved";
          return {
            id,
            version: versionNumber,
            label: String(deployment.label || ("Version " + versionNumber)).trim(),
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
          const nextVersion = normalizedExisting.reduce((maxVersion, deployment) => Math.max(maxVersion, Number(deployment.version || 0)), 0) + 1;
          const sanitizedWorkflow = {
            ...(workflow && typeof workflow === "object" ? workflow : {}),
            metadata: stripMetronomeDeploymentMetadata(buildMetronomeWorkflowProjectMetadata(workflow)),
          };
          const definition = createMetronomeWorkflowDefinition(sanitizedWorkflow, persistedNodes, persistedEdges);
          return normalizeMetronomeDeploymentVersion({
            id: createMetronomeDeploymentId(),
            version: nextVersion,
            label: String(options?.label || ("Version " + nextVersion)).trim(),
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
          }, nextVersion - 1);
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
          const versionNumber = Number(
            event.version
            || event.versionNumber
            || event.version_number
            || metadata.versionNumber
            || metadata.version_number
            || metadata.version
            || 0
          ) || 0;
          const id = String(event.id || metadata.id || "").trim();
          return {
            id,
            metronomeId: String(event.metronomeId || event.metronome_id || "").trim(),
            versionId: String(event.versionId || event.version_id || "").trim(),
            action,
            status,
            version: versionNumber,
            label: String(event.label || event.name || metadata.versionName || metadata.version_name || (versionNumber ? "Version " + versionNumber : "")).trim(),
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
            ...(isMetronomeWorkflowBuiltIn(source) && sourceId ? { copiedFromDefaultWorkflowId: sourceId, copied_from_default_workflow_id: sourceId } : {}),
          };
          return normalizeMetronomeWorkflow({
            ...source,
            id: "met_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7),
            name: String(options.name || ((source.name || "Untitled Metronome") + " copy")).trim(),
            status: "draft",
            triggerSummary: deriveMetronomeTriggerSummary(persistedNodes),
            lastRunAt: "",
            runsToday: 0,
            waitingApprovals: 0,
            projectId,
            projectName,
            ...(creator ? { creator } : {}),
            metadata,
            deployments: [],
            activeDeploymentId: "",
            activeDeploymentVersion: 0,
            publishedAt: "",
            nodes: persistedNodes,
            edges: persistedEdges,
            createdAt: now,
            updatedAt: now,
          });
        }

        function readMetronomeWorkflowsFromStorage() {
          try {
            const parsed = JSON.parse(localStorage.getItem(METRONOME_STORAGE_KEY) || "[]");
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
          } catch {
            return [];
          }
        }

        function writeMetronomeWorkflowsToStorage(workflows) {
          try {
            localStorage.setItem(METRONOME_STORAGE_KEY, JSON.stringify(Array.isArray(workflows) ? workflows : []));
          } catch {}
        }

        function normalizeMetronomeNodes(nodes) {
          const normalizedNodes = (Array.isArray(nodes) ? nodes : [])
            .filter((node) => node && typeof node === "object")
            .map((node, index) => {
              const nodeData = node.data && typeof node.data === "object" ? node.data : {};
              if (nodeData.kind) {
                const normalizedKind = nodeData.kind === "approval" ? "end" : nodeData.kind;
                const normalizedNodeData = nodeData.kind === "approval"
                  ? {
                      ...nodeData,
                      kind: "end",
                      subtype: "complete",
                      label: "End",
                      description: "Finish the workflow.",
                      config: {},
                    }
                  : nodeData;
                return {
                  ...node,
                  type: node.type || "metronome",
                  style: normalizedKind === "loop"
                    ? normalizeMetronomeLoopNodeStyle(node.style)
                    : normalizedKind === "note"
                      ? normalizeMetronomeNoteNodeStyle(node.style)
                    : node.style && typeof node.style === "object"
                      ? node.style
                      : undefined,
                  position: node.position && typeof node.position === "object"
                    ? node.position
                    : { x: 120 + index * 260, y: 160 },
                  ...(node.parentId || node.parentNode ? { parentId: String(node.parentId || node.parentNode), extent: node.extent || "parent" } : {}),
                  data: {
                    ...normalizedNodeData,
                    config: normalizedNodeData.config && typeof normalizedNodeData.config === "object" ? normalizedNodeData.config : {},
                  },
                };
              }
              const rawKind = String(node.kind || "").trim() || "action";
              const kind = rawKind === "approval" ? "end" : rawKind;
              const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
              return createMetronomeNode(kind, node.position && typeof node.position === "object"
                ? node.position
                : { x: 120 + index * 260, y: 160 }, {
                id: String(node.id || "node_" + index),
                subtype: rawKind === "approval" ? "complete" : String(node.subtype || ""),
                label: rawKind === "approval" ? "End" : String(node.label || meta.label),
                description: rawKind === "approval" ? "Finish the workflow." : String(node.description || ""),
                config: rawKind === "approval" ? {} : (node.config && typeof node.config === "object" ? node.config : {}),
                style: node.style && typeof node.style === "object" ? node.style : undefined,
                parentId: node.parentId || node.parentNode || undefined,
                extent: node.extent || undefined,
              });
            })
            .map((node) => {
              if (node?.data?.kind === "loop") {
                return { ...node, style: normalizeMetronomeLoopNodeStyle(node.style) };
              }
              if (node?.data?.kind === "note") {
                return { ...node, style: normalizeMetronomeNoteNodeStyle(node.style) };
              }
              return node;
            });
          return normalizeMetronomeNodeOrder(normalizedNodes);
        }

        function normalizeMetronomeWorkflow(rawWorkflow) {
          const workflow = rawWorkflow && typeof rawWorkflow === "object" ? rawWorkflow : {};
          const definition = workflow.definition && typeof workflow.definition === "object" ? workflow.definition : {};
          const rawNodes = Array.isArray(workflow.nodes)
            ? workflow.nodes
            : Array.isArray(definition.nodes)
              ? definition.nodes
              : [];
          const rawEdges = Array.isArray(workflow.edges)
            ? workflow.edges
            : Array.isArray(definition.edges)
              ? definition.edges
              : [];
          const projectId = readMetronomeWorkflowProjectId(workflow);
          const projectName = readMetronomeWorkflowProjectName(workflow);
          const metadata = buildMetronomeWorkflowProjectMetadata(workflow);
          const creator = normalizeMetronomeWorkflowCreator(workflow, metadata);
          const userId = String(
            workflow.userId
            || workflow.user_id
            || workflow.ownerUserId
            || workflow.owner_user_id
            || metadata.userId
            || metadata.user_id
            || metadata.ownerUserId
            || metadata.owner_user_id
            || creator?.userId
            || ""
          ).trim();
          const deployments = readMetronomeWorkflowDeployments(workflow);
          const selectedDeploymentFromMetadata = String(
            workflow.restoredFromDeploymentId
            || workflow.restored_from_deployment_id
            || metadata.restoredFromDeploymentId
            || metadata.restored_from_deployment_id
            || ""
          ).trim();
          const activeDeploymentFromMetadata = String(
            workflow.activeDeploymentId
            || workflow.active_deployment_id
            || metadata.activeDeploymentId
            || metadata.active_deployment_id
            || ""
          ).trim();
          const selectedDeployment = deployments.find((deployment) => deployment.id === selectedDeploymentFromMetadata)
            || deployments.find((deployment) => deployment.id === activeDeploymentFromMetadata)
            || deployments.find((deployment) => deployment.status === "active")
            || null;
          const activeDeployment = deployments.find((deployment) => deployment.id === activeDeploymentFromMetadata)
            || deployments.find((deployment) => deployment.status === "active")
            || null;
          const graphDeployment = selectedDeployment && (
            (Array.isArray(selectedDeployment.nodes) && selectedDeployment.nodes.length)
            || (Array.isArray(selectedDeployment.edges) && selectedDeployment.edges.length)
          )
            ? selectedDeployment
            : null;
          const graphRawNodes = graphDeployment && Array.isArray(graphDeployment.nodes) && graphDeployment.nodes.length
            ? graphDeployment.nodes
            : rawNodes;
          const graphRawEdges = graphDeployment && Array.isArray(graphDeployment.edges) && graphDeployment.edges.length
            ? graphDeployment.edges
            : rawEdges;
          const nodes = normalizeMetronomeNodes(graphRawNodes);
          const edges = normalizeMetronomeEdgesForNodes(graphRawEdges, nodes);
          const activeDeploymentId = activeDeployment?.id || activeDeploymentFromMetadata;
          const activeDeploymentVersion = activeDeployment?.version || Number(metadata.activeDeploymentVersion || metadata.active_deployment_version || 0) || 0;
          const publishedAt = String(
            workflow.publishedAt
            || workflow.published_at
            || metadata.publishedAt
            || metadata.published_at
            || activeDeployment?.publishedAt
            || ""
          ).trim();
          const wallpaperId = resolveMetronomeWorkflowWallpaperId({ ...workflow, metadata }, metadata.wallpaperId || metadata.workflowWallpaperId || "");
          return {
            id: String(workflow.id || ""),
            name: String(workflow.name || "Untitled Metronome"),
            description: String(workflow.description || ""),
            status: workflow.status === "active" ? "active" : workflow.status === "paused" ? "paused" : "draft",
            triggerSummary: String(workflow.triggerSummary || workflow.trigger_summary || deriveMetronomeTriggerSummary(nodes) || "Manual"),
            lastRunAt: workflow.lastRunAt || workflow.last_run_at || "",
            runsToday: Number(workflow.runsToday || workflow.runs_today || 0) || 0,
            waitingApprovals: Number(workflow.waitingApprovals || workflow.waiting_approvals || 0) || 0,
            userId,
            projectId,
            projectName,
            ...(creator ? { creator } : {}),
            ...(wallpaperId ? { wallpaperId, workflowWallpaperId: wallpaperId } : {}),
            metadata: {
              ...metadata,
              ...buildMetronomeWorkflowCreatorMetadata(creator),
              ...(userId ? { userId, user_id: userId, ownerUserId: userId, owner_user_id: userId } : {}),
              ...(wallpaperId ? { wallpaperId, workflowWallpaperId: wallpaperId } : {}),
              deployments,
              metronomeDeployments: deployments,
              ...(activeDeploymentId ? { activeDeploymentId, active_deployment_id: activeDeploymentId } : {}),
              ...(activeDeploymentVersion ? { activeDeploymentVersion, active_deployment_version: activeDeploymentVersion } : {}),
              ...(publishedAt ? { publishedAt, published_at: publishedAt } : {}),
            },
            deployments,
            activeDeploymentId,
            activeDeploymentVersion,
            publishedAt,
            nodes,
            edges,
            createdAt: workflow.createdAt || workflow.created_at || "",
            updatedAt: workflow.updatedAt || workflow.updated_at || "",
          };
        }

        function normalizeMetronomeEdges(edges) {
          return (Array.isArray(edges) ? edges : [])
            .filter((edge) => edge && typeof edge === "object")
            .map((edge, index) => {
              const {
                label,
                labelBgPadding,
                labelBgBorderRadius,
                labelBgStyle,
                labelStyle,
                markerEnd,
                markerStart,
                animated,
                ...rest
              } = edge;
              return {
                ...rest,
                id: String(rest.id || "edge_" + String(rest.source || "") + "_" + String(rest.target || "") + "_" + index).trim() || "edge_" + index,
                source: String(rest.source || rest.sourceId || rest.source_id || "").trim(),
                target: String(rest.target || rest.targetId || rest.target_id || "").trim(),
                type: "metronomeOutput",
              };
            })
            .filter((edge) => edge.source && edge.target);
        }

        function getMetronomeSourceHandleIdsForNode(node) {
          const kind = String(node?.data?.kind || "").trim();
          if (kind === "end" || kind === "note") return [];
          if (kind === "loop") return ["loop-left", "loop-right"];
          if (kind === "condition" || kind === "approval") {
            const conditions = kind === "approval"
              ? normalizeMetronomeApprovalBranches(node?.data?.config?.conditions)
              : normalizeMetronomeConditionBranches(node?.data?.config?.conditions, node?.data?.config?.conditionType || node?.data?.subtype);
            return conditions.map((branch) => String(branch?.id || "").trim()).filter(Boolean);
          }
          return ["node-output"];
        }

        function getMetronomeTargetHandleIdsForNode(node) {
          const kind = String(node?.data?.kind || "").trim();
          if (kind === "loop") return ["loop-left", "loop-right"];
          if (kind === "note") return [];
          return ["node-input"];
        }

	        function normalizeMetronomeEdgesForNodes(edges, nodes) {
	          const normalizedEdges = normalizeMetronomeEdges(edges);
	          const nodeById = new Map((Array.isArray(nodes) ? nodes : []).map((node) => [String(node?.id || ""), node]));
	          const seenEdges = new Set();
	          return normalizedEdges
	            .flatMap((edge, index) => repairMetronomeLoopBoundaryEdge(edge, nodeById, index))
	            .map((edge) => {
	              const sourceNode = nodeById.get(String(edge.source || ""));
	              const targetNode = nodeById.get(String(edge.target || ""));
              if (!sourceNode || !targetNode) return null;
              const sourceHandles = getMetronomeSourceHandleIdsForNode(sourceNode);
              const targetHandles = getMetronomeTargetHandleIdsForNode(targetNode);
              if (sourceHandles.length === 0 || targetHandles.length === 0) return null;
              const currentSourceHandle = String(edge.sourceHandle || "").trim();
              const currentTargetHandle = String(edge.targetHandle || "").trim();
              const sourceHandle = sourceHandles.includes(currentSourceHandle)
                ? currentSourceHandle
                : sourceHandles[0];
              const targetHandle = targetHandles.includes(currentTargetHandle)
                ? currentTargetHandle
                : targetHandles[0];
              return {
                ...edge,
                sourceHandle,
                targetHandle,
	                type: "metronomeOutput",
	              };
	            })
	            .filter((edge) => {
	              if (!edge) return false;
	              const key = [edge.source, edge.sourceHandle, edge.target, edge.targetHandle].map((value) => String(value || "")).join("::");
	              if (seenEdges.has(key)) return false;
	              seenEdges.add(key);
	              return true;
	            });
	        }

        function sanitizeMetronomeNodeForPersistence(node) {
          if (!node || typeof node !== "object") return node;
          const {
            selected,
            dragging,
            resizing,
            positionAbsolute,
            measured,
            width,
            height,
            ...rest
          } = node;
          return rest;
        }

        function sanitizeMetronomeEdgeForPersistence(edge) {
          if (!edge || typeof edge !== "object") return edge;
          const {
            selected,
            className,
            style,
            animated,
            markerEnd,
            markerStart,
            label,
            labelStyle,
            labelBgStyle,
            labelBgPadding,
            labelBgBorderRadius,
            ...rest
          } = edge;
          return rest;
        }

        function createMetronomePersistedNodes(nodes) {
          return normalizeMetronomeNodes((Array.isArray(nodes) ? nodes : []).map(sanitizeMetronomeNodeForPersistence));
        }

        function createMetronomePersistedEdges(edges) {
          return normalizeMetronomeEdges((Array.isArray(edges) ? edges : []).map(sanitizeMetronomeEdgeForPersistence));
        }

        function createMetronomePersistedWorkflowSnapshot(workflow, nodes, edges) {
          const baseWorkflow = workflow && typeof workflow === "object" ? workflow : {};
          const persistedNodes = createMetronomePersistedNodes(nodes);
          const persistedEdges = normalizeMetronomeEdgesForNodes(
            (Array.isArray(edges) ? edges : []).map(sanitizeMetronomeEdgeForPersistence),
            persistedNodes
          );
          return normalizeMetronomeWorkflow({
            ...baseWorkflow,
            nodes: persistedNodes,
            edges: persistedEdges,
            triggerSummary: deriveMetronomeTriggerSummary(persistedNodes),
          });
        }

        function readMetronomeSelectedDeploymentId(workflow) {
          const source = workflow && typeof workflow === "object" ? workflow : {};
          const metadata = source.metadata && typeof source.metadata === "object" ? source.metadata : {};
          return String(
            metadata.restoredFromDeploymentId
            || metadata.restored_from_deployment_id
            || source.restoredFromDeploymentId
            || source.restored_from_deployment_id
            || source.activeDeploymentId
            || metadata.activeDeploymentId
            || metadata.active_deployment_id
            || ""
          ).trim();
        }

        function createMetronomeWorkflowWithSelectedVersionSnapshot(workflow, nodes, edges) {
          const baseWorkflow = createMetronomePersistedWorkflowSnapshot(workflow, nodes, edges);
          const deployments = readMetronomeWorkflowDeployments(workflow);
          const selectedDeploymentId = readMetronomeSelectedDeploymentId(workflow);
          const selectedDeployment = selectedDeploymentId
            ? deployments.find((deployment) => deployment.id === selectedDeploymentId)
            : null;
          const selectedDeploymentIsEditable = Boolean(
            selectedDeployment
            && String(selectedDeployment.status || "").toLowerCase() !== "active"
            && !String(selectedDeployment.publishedAt || "").trim()
          );
          if (!selectedDeployment || !selectedDeploymentIsEditable) {
            return baseWorkflow;
          }
          const now = new Date().toISOString();
          const persistedNodes = createMetronomePersistedNodes(baseWorkflow.nodes);
          const persistedEdges = createMetronomePersistedEdges(baseWorkflow.edges);
          const triggerSummary = deriveMetronomeTriggerSummary(persistedNodes);
          const updatedDeployment = normalizeMetronomeDeploymentVersion({
            ...selectedDeployment,
            nodes: persistedNodes,
            edges: persistedEdges,
            definition: createMetronomeWorkflowDefinition(baseWorkflow, persistedNodes, persistedEdges),
            triggerSummary,
            nodeCount: persistedNodes.length,
            edgeCount: persistedEdges.length,
            updatedAt: now,
            updated_at: now,
          });
          const nextDeployments = normalizeMetronomeDeployments(deployments.map((deployment) => (
            deployment.id === selectedDeploymentId ? updatedDeployment : deployment
          )));
          const metadata = baseWorkflow.metadata && typeof baseWorkflow.metadata === "object" ? baseWorkflow.metadata : {};
          const nextMetadata = {
            ...metadata,
            deployments: nextDeployments,
            metronomeDeployments: nextDeployments,
            restoredFromDeploymentId: updatedDeployment.id,
            restored_from_deployment_id: updatedDeployment.id,
            restoredFromDeploymentVersion: updatedDeployment.version,
            restored_from_deployment_version: updatedDeployment.version,
          };
          return normalizeMetronomeWorkflow({
            ...baseWorkflow,
            deployments: nextDeployments,
            metadata: nextMetadata,
          });
        }

        function createMetronomeWorkflowWithVersionList(workflow, versions, preferredSelectedId = "") {
          const baseWorkflow = normalizeMetronomeWorkflow(workflow || {});
          const deployments = normalizeMetronomeDeployments(versions);
          const previousSelectedId = readMetronomeSelectedDeploymentId(baseWorkflow);
          const selectedDeployment = deployments.find((deployment) => deployment.id === String(preferredSelectedId || "").trim())
            || deployments.find((deployment) => deployment.id === previousSelectedId)
            || deployments.find((deployment) => deployment.status === "active")
            || deployments[0]
            || null;
          const activeDeployment = deployments.find((deployment) => deployment.status === "active")
            || deployments.find((deployment) => deployment.id === String(baseWorkflow.activeDeploymentId || baseWorkflow.metadata?.activeDeploymentId || "").trim())
            || null;
          const nextMetadata = {
            ...(baseWorkflow.metadata && typeof baseWorkflow.metadata === "object" ? baseWorkflow.metadata : {}),
            deployments,
            metronomeDeployments: deployments,
            activeDeploymentId: activeDeployment?.id || "",
            active_deployment_id: activeDeployment?.id || "",
            activeDeploymentVersion: activeDeployment?.version || 0,
            active_deployment_version: activeDeployment?.version || 0,
            restoredFromDeploymentId: selectedDeployment?.id || "",
            restored_from_deployment_id: selectedDeployment?.id || "",
            restoredFromDeploymentVersion: selectedDeployment?.version || 0,
            restored_from_deployment_version: selectedDeployment?.version || 0,
            ...(activeDeployment?.publishedAt ? { publishedAt: activeDeployment.publishedAt, published_at: activeDeployment.publishedAt } : {}),
          };
          const selectedNodes = selectedDeployment && Array.isArray(selectedDeployment.nodes) && selectedDeployment.nodes.length
            ? selectedDeployment.nodes
            : baseWorkflow.nodes;
          const selectedEdges = selectedDeployment && Array.isArray(selectedDeployment.edges) && selectedDeployment.edges.length
            ? selectedDeployment.edges
            : baseWorkflow.edges;
          return normalizeMetronomeWorkflow({
            ...baseWorkflow,
            deployments,
            activeDeploymentId: activeDeployment?.id || "",
            activeDeploymentVersion: activeDeployment?.version || 0,
            publishedAt: activeDeployment?.publishedAt || "",
            metadata: nextMetadata,
            nodes: selectedNodes,
            edges: selectedEdges,
          });
        }

        function createMetronomePersistedWorkflowKey(workflow, nodes, edges) {
          const baseWorkflow = workflow && typeof workflow === "object" ? workflow : {};
          return JSON.stringify({
            id: String(baseWorkflow.id || ""),
            name: String(baseWorkflow.name || ""),
            description: String(baseWorkflow.description || ""),
            status: String(baseWorkflow.status || "draft"),
            projectId: readMetronomeWorkflowProjectId(baseWorkflow),
            projectName: readMetronomeWorkflowProjectName(baseWorkflow),
            nodes: createMetronomePersistedNodes(nodes),
            edges: createMetronomePersistedEdges(edges),
          });
        }

        function deriveMetronomeTriggerSummary(nodes) {
          const triggerNode = Array.isArray(nodes)
            ? nodes.find((node) => node?.data?.kind === "trigger" || node?.kind === "trigger")
            : null;
          if (!triggerNode) return "Manual";
          const triggerData = triggerNode.data && typeof triggerNode.data === "object" ? triggerNode.data : triggerNode;
          const triggerConfig = triggerData?.config && typeof triggerData.config === "object" ? triggerData.config : {};
          const triggerType = String(triggerConfig.triggerType || triggerData?.subtype || "").trim();
          if (triggerType === "periodic") {
            return formatMetronomeScheduleSummary(triggerConfig);
          }
          if (triggerType === "email") {
            const emailConfig = buildDefaultMetronomeEmailTriggerConfig(null, triggerNode, triggerConfig);
            return "Email: " + (triggerConfig.emailAddress || buildMetronomeEmailAddress(emailConfig.emailLocalPart));
          }
          if (triggerType === "telegram") {
            const telegramConfig = buildDefaultMetronomeTelegramTriggerConfig(null, triggerNode, triggerConfig);
            return "Telegram: " + (triggerConfig.telegramCommand || telegramConfig.telegramCommand);
          }
          if (triggerType === "function") {
            const functionConfig = buildDefaultMetronomeFunctionTriggerConfig(null, triggerNode, triggerConfig);
            const endpoint = String(functionConfig.functionEndpointUrl || functionConfig.functionEndpointPath || functionConfig.endpointUrl || functionConfig.endpointPath || "").trim();
            return "Function: " + (endpoint || functionConfig.functionSlug || "Callable endpoint");
          }
          if (triggerType === "github") {
            const githubConfig = buildDefaultMetronomeGitHubTriggerConfig(triggerConfig);
            const eventOption = METRONOME_GITHUB_EVENT_OPTIONS.find((option) => option.id === githubConfig.githubEventType);
            const repository = String(triggerConfig.githubRepositoryContains || "").trim();
            return "GitHub: " + (eventOption?.label || "GitHub event") + (repository ? " · " + repository : "");
          }
          if (triggerType === "project_ticket") {
            const ticketConfig = buildDefaultMetronomeProjectTicketTriggerConfig(triggerConfig);
            const eventOption = METRONOME_PROJECT_TICKET_EVENT_OPTIONS.find((option) => option.id === ticketConfig.ticketEventType);
            const project = String(ticketConfig.ticketProjectName || ticketConfig.ticketProjectId || "").trim();
            if (ticketConfig.ticketEventType === "status_changed") {
              const fromLabel = METRONOME_PROJECT_TICKET_STATUS_OPTIONS.find((option) => option.id === ticketConfig.ticketFromStatus)?.label || "Any status";
              const toLabel = METRONOME_PROJECT_TICKET_STATUS_OPTIONS.find((option) => option.id === ticketConfig.ticketToStatus)?.label || "Any status";
              return "Ticket: " + fromLabel + " -> " + toLabel + (project ? " · " + project : "");
            }
            return "Ticket: " + (eventOption?.label || "Project ticket event") + (project ? " · " + project : "");
          }
          return triggerData?.label || getMetronomeSubtypeLabel("trigger", triggerData?.subtype) || "Trigger";
        }

        function createMetronomeApiPayload(workflow) {
          const metadata = buildMetronomeWorkflowProjectMetadata(workflow);
          const deployments = readMetronomeWorkflowDeployments(workflow);
          const activeDeploymentId = String(workflow?.activeDeploymentId || metadata.activeDeploymentId || metadata.active_deployment_id || deployments.find((deployment) => deployment.status === "active")?.id || "").trim();
          const activeDeployment = deployments.find((deployment) => deployment.id === activeDeploymentId) || null;
          const activeDeploymentVersion = Number(workflow?.activeDeploymentVersion || metadata.activeDeploymentVersion || metadata.active_deployment_version || activeDeployment?.version || 0) || 0;
          const publishedAt = String(workflow?.publishedAt || metadata.publishedAt || metadata.published_at || activeDeployment?.publishedAt || "").trim();
          const enrichedMetadata = {
            ...metadata,
            deployments,
            metronomeDeployments: deployments,
            ...(activeDeploymentId ? { activeDeploymentId, active_deployment_id: activeDeploymentId } : {}),
            ...(activeDeploymentVersion ? { activeDeploymentVersion, active_deployment_version: activeDeploymentVersion } : {}),
            ...(publishedAt ? { publishedAt, published_at: publishedAt } : {}),
          };
          return {
            name: workflow?.name || "Untitled Metronome",
            description: workflow?.description || "",
            status: workflow?.status || "draft",
            triggerSummary: workflow?.triggerSummary || deriveMetronomeTriggerSummary(workflow?.nodes || []),
            ...(metadata.projectId ? { projectId: metadata.projectId, project_id: metadata.projectId } : {}),
            ...(metadata.projectName ? { projectName: metadata.projectName, project_name: metadata.projectName } : {}),
            metadata: enrichedMetadata,
            definition: createMetronomeWorkflowDefinition(workflow, workflow?.nodes || [], workflow?.edges || []),
          };
        }

        function buildMetronomeApiHeaders(options = {}, extraHeaders = {}) {
          const headers = new Headers(options.requestHeaders || {});
          if (options.apiKey && !headers.has("X-API-Key")) {
            headers.set("X-API-Key", options.apiKey);
          }
          Object.entries(extraHeaders || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              headers.set(key, value);
            }
          });
          return headers;
        }

        function getMetronomeApiBaseUrl(options = {}) {
          return String(options.backendUrl || "/api/real").trim().replace(new RegExp("/+$"), "") || "/api/real";
        }

        async function fetchMetronomeWorkflowsFromApi(projectId = "", options = {}) {
          const normalizedProjectId = String(projectId || "").trim();
          const requestTarget = new URL(getMetronomeApiBaseUrl(options) + "/metronomes", window.location.origin);
          requestTarget.searchParams.set("includeArchived", "false");
          if (normalizedProjectId) {
            requestTarget.searchParams.set("projectId", normalizedProjectId);
          }
          const response = await fetch(requestTarget.toString(), {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: buildMetronomeApiHeaders(options),
          });
          if (!response.ok) {
            throw new Error("Failed to load Metronomes");
          }
          const data = await response.json();
          const rawItems = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.metronomes)
              ? data.metronomes
              : Array.isArray(data?.workflows)
                ? data.workflows
                : [];
          const items = rawItems.map(normalizeMetronomeWorkflow);
          return filterMetronomeWorkflowsByProject(items, normalizedProjectId);
        }

        async function fetchMetronomeWorkflowFromApi(workflowId) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) {
            throw new Error("Missing Metronome id");
          }
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId), {
            method: "GET",
            credentials: "same-origin",
          });
          const data = await readMetronomeApiJson(response, "Failed to load Metronome");
          const rawWorkflow = data?.data && typeof data.data === "object"
            ? data.data
            : data?.metronome && typeof data.metronome === "object"
              ? data.metronome
              : data?.workflow && typeof data.workflow === "object"
                ? data.workflow
                : data;
          return normalizeMetronomeWorkflow(rawWorkflow);
        }

        async function fetchMetronomeWorkflowWithGraphFromApi(workflowId, preferredSelectedVersionId = "") {
          const workflow = await fetchMetronomeWorkflowFromApi(workflowId);
          try {
            const versions = await fetchMetronomeVersionsApi(workflow.id || workflowId);
            if (Array.isArray(versions) && versions.length) {
              return createMetronomeWorkflowWithVersionList(workflow, versions, preferredSelectedVersionId);
            }
          } catch (error) {
            console.warn("[Metronome] Failed to hydrate workflow graph from versions", error);
          }
          return workflow;
        }

        async function readMetronomeApiJson(response, fallbackMessage) {
          const text = await response.text();
          let data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch {
            data = { message: text };
          }
          if (!response.ok) {
            throw createMetronomeApiError(fallbackMessage, response, data);
          }
          return data;
        }

        async function createMetronomeWorkflowApi(workflow) {
          const response = await fetch("/api/real/metronomes", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeApiPayload(workflow)),
          });
          const data = await readMetronomeApiJson(response, "Failed to create Metronome");
          return mergeMetronomeWorkflowApiResponse(workflow, data?.data || data);
        }

        function createMetronomeApiError(message, response, data) {
          const upstreamMessage = String(data?.message || data?.error || "").trim();
          const error = new Error(upstreamMessage ? String(message || "Metronome request failed.") + ": " + upstreamMessage : (message || "Metronome request failed."));
          error.status = Number(response?.status || 0) || 0;
          error.data = data || null;
          return error;
        }

        function getMetronomePublishErrorState(error) {
          const issues = Array.isArray(error?.data?.issues)
            ? error.data.issues
                .filter((issue) => issue && typeof issue === "object")
                .map((issue) => ({
                  code: String(issue.code || "validation_error"),
                  message: String(issue.message || "Resolve this workflow issue before publishing."),
                  nodeId: String(issue.nodeId || ""),
                  edgeId: String(issue.edgeId || ""),
                  severity: String(issue.severity || "error"),
                }))
            : [];
          const message = String(error?.data?.details || error?.data?.message || error?.data?.error || error?.message || "Failed to publish Metronome").trim();
          return {
            status: "error",
            message,
            issues,
          };
        }

        function normalizeMetronomeValidationIssues(value) {
          return Array.isArray(value)
            ? value
                .filter((issue) => issue && typeof issue === "object")
                .map((issue) => ({
                  code: String(issue.code || "validation_error"),
                  message: String(issue.message || "Resolve this workflow issue before publishing."),
                  nodeId: String(issue.nodeId || issue.node_id || ""),
                  edgeId: String(issue.edgeId || issue.edge_id || ""),
                  severity: String(issue.severity || "error"),
                }))
            : [];
        }

        function normalizeMetronomeValidationResult(value) {
          const source = value?.data && typeof value.data === "object" ? value.data : value && typeof value === "object" ? value : {};
          const issues = normalizeMetronomeValidationIssues(source.issues);
          return {
            ok: Boolean(source.ok) && !issues.length,
            mode: String(source.mode || "publish"),
            issues,
          };
        }

        async function validateMetronomeDefinitionApi(definition, mode = "publish") {
          const response = await fetch("/api/real/metronomes/validate", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode,
              definition: definition && typeof definition === "object" ? definition : { nodes: [], edges: [] },
            }),
          });
          const data = await readMetronomeApiJson(response, "Failed to validate Metronome workflow");
          return normalizeMetronomeValidationResult(data);
        }

        async function updateMetronomeWorkflowApi(workflow) {
          const workflowId = String(workflow?.id || "").trim();
          if (!workflowId) throw new Error("Missing Metronome id");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(workflowId), {
            method: "PATCH",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeApiPayload(workflow)),
          });
          const data = await readMetronomeApiJson(response, "Failed to save Metronome");
          return mergeMetronomeWorkflowApiResponse(workflow, data?.data || data);
        }

        function mergeMetronomeWorkflowApiResponse(sourceWorkflow, responseWorkflow) {
          const source = sourceWorkflow && typeof sourceWorkflow === "object" ? sourceWorkflow : {};
          const response = responseWorkflow && typeof responseWorkflow === "object" ? responseWorkflow : {};
          const sourceMetadata = source.metadata && typeof source.metadata === "object" ? source.metadata : {};
          const responseMetadata = response.metadata && typeof response.metadata === "object" ? response.metadata : {};
          return normalizeMetronomeWorkflow({
            ...source,
            ...response,
            projectId: response.projectId || response.project_id || source.projectId || source.project_id || sourceMetadata.projectId || sourceMetadata.project_id || "",
            projectName: response.projectName || response.project_name || source.projectName || source.project_name || sourceMetadata.projectName || sourceMetadata.project_name || "",
            metadata: {
              ...sourceMetadata,
              ...responseMetadata,
            },
          });
        }

        async function saveMetronomeWorkflowApi(workflow, options = {}) {
          const workflowId = String(workflow?.id || "").trim();
          if (!workflowId) return createMetronomeWorkflowApi(workflow);
          const createOnNotFound = options?.createOnNotFound !== false;
          try {
            return await updateMetronomeWorkflowApi(workflow);
          } catch (error) {
            if (error?.status === 404 && createOnNotFound) {
              return createMetronomeWorkflowApi(workflow);
            }
            throw error;
          }
        }

        async function publishMetronomeWorkflowApi(workflowId, active, workflow) {
          const body = { active: Boolean(active) };
          if (active && workflow && typeof workflow === "object") {
            const payload = createMetronomeApiPayload(workflow);
            body.definition = payload.definition;
            body.name = workflow.name || payload.name || "";
            body.label = workflow.name || payload.name || "";
            body.description = workflow.description || payload.description || "";
          }
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(workflowId) + "/publish", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await readMetronomeApiJson(response, "Failed to update Metronome status");
          return normalizeMetronomeWorkflow(data?.data || data);
        }

        const metronomeVersionSnapshotCache = new Map();
        const metronomeVersionHydrationRequests = new Map();

        function emitMetronomeVersionsLoaded(workflowId, versions) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId || typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
          window.dispatchEvent(new CustomEvent("playground:metronome-versions-loaded", {
            detail: {
              workflowId: normalizedWorkflowId,
              versions: Array.isArray(versions) ? versions : [],
            },
          }));
        }

        async function fetchMetronomeVersionsApi(workflowId, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) return [];
          const response = await fetch(getMetronomeApiBaseUrl(options) + "/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: buildMetronomeApiHeaders(options),
          });
          const data = await readMetronomeApiJson(response, "Failed to load workflow versions");
          const rawItems = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          const versions = normalizeMetronomeDeployments(rawItems);
          metronomeVersionSnapshotCache.set(normalizedWorkflowId, versions);
          emitMetronomeVersionsLoaded(normalizedWorkflowId, versions);
          return versions;
        }

        function hydrateMetronomeVersionsApi(workflowId, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) return Promise.resolve([]);
          if (metronomeVersionSnapshotCache.has(normalizedWorkflowId)) {
            return Promise.resolve(metronomeVersionSnapshotCache.get(normalizedWorkflowId) || []);
          }
          const existingRequest = metronomeVersionHydrationRequests.get(normalizedWorkflowId);
          if (existingRequest) return existingRequest;
          const request = fetchMetronomeVersionsApi(normalizedWorkflowId, options)
            .finally(() => {
              if (metronomeVersionHydrationRequests.get(normalizedWorkflowId) === request) {
                metronomeVersionHydrationRequests.delete(normalizedWorkflowId);
              }
            });
          metronomeVersionHydrationRequests.set(normalizedWorkflowId, request);
          return request;
        }

        function createMetronomeVersionApiPayload(workflow, nodes, edges, details = {}, options = {}) {
          const persistedNodes = createMetronomePersistedNodes(nodes || workflow?.nodes || []);
          const persistedEdges = createMetronomePersistedEdges(edges || workflow?.edges || []);
          const includeDefinition = options.includeDefinition !== false;
          const label = String(details?.label || details?.name || "").trim();
          const description = String(details?.description || "").trim();
          return {
            ...(label ? { label, name: label } : {}),
            description,
            ...(includeDefinition
              ? {
                  definition: createMetronomeWorkflowDefinition(workflow, persistedNodes, persistedEdges),
                }
              : {}),
          };
        }

        async function createMetronomeVersionApi(workflowId, workflow, nodes, edges, details = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Missing Metronome id");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeVersionApiPayload(workflow, nodes, edges, details)),
          });
          const data = await readMetronomeApiJson(response, "Failed to create workflow version");
          return normalizeMetronomeDeploymentVersion(data?.data || data);
        }

        async function updateMetronomeVersionApi(workflowId, versionId, workflow, nodes, edges, details = {}, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedWorkflowId || !normalizedVersionId) throw new Error("Missing workflow version");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions/" + encodeURIComponent(normalizedVersionId), {
            method: "PATCH",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeVersionApiPayload(workflow, nodes, edges, details, options)),
          });
          const data = await readMetronomeApiJson(response, "Failed to update workflow version");
          return normalizeMetronomeDeploymentVersion(data?.data || data);
        }

        async function deleteMetronomeVersionApi(workflowId, versionId) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedWorkflowId || !normalizedVersionId) throw new Error("Missing workflow version");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions/" + encodeURIComponent(normalizedVersionId), {
            method: "DELETE",
            credentials: "same-origin",
          });
          await readMetronomeApiJson(response, "Failed to delete workflow version");
          return true;
        }

        async function publishMetronomeVersionApi(workflowId, versionId, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedWorkflowId || !normalizedVersionId) throw new Error("Missing workflow version");
          const body = options && typeof options === "object" && !Array.isArray(options)
            ? options
            : {};
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions/" + encodeURIComponent(normalizedVersionId) + "/publish", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await readMetronomeApiJson(response, "Failed to publish workflow version");
          return normalizeMetronomeWorkflow(data?.data || data);
        }

        function normalizeMetronomeNodeSchemaRegistry(rawRegistry) {
          const registry = rawRegistry && typeof rawRegistry === "object" ? rawRegistry : {};
          const normalizeList = (value) => Array.isArray(value)
            ? value.map((item) => String(item || "").trim()).filter(Boolean)
            : [];
          return {
            version: Number(registry.version || 0) || 0,
            nodeKinds: normalizeList(registry.nodeKinds || registry.node_kinds),
            triggerTypes: normalizeList(registry.triggerTypes || registry.trigger_types),
            conditionTypes: normalizeList(registry.conditionTypes || registry.condition_types),
            loopTypes: normalizeList(registry.loopTypes || registry.loop_types),
            ticketOperations: normalizeList(registry.ticketOperations || registry.ticket_operations),
            resourceEventTypes: normalizeList(registry.resourceEventTypes || registry.resource_event_types),
            projectTicketEventTypes: normalizeList(registry.projectTicketEventTypes || registry.project_ticket_event_types),
          };
        }

        async function fetchMetronomeNodeSchemasApi() {
          const response = await fetch("/api/real/metronomes/node-schemas", {
            method: "GET",
            credentials: "same-origin",
          });
          const data = await readMetronomeApiJson(response, "Failed to load Metronome node schemas");
          return normalizeMetronomeNodeSchemaRegistry(data?.data || data);
        }

        async function deleteMetronomeWorkflowApi(workflowId) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Missing Metronome id");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId), {
            method: "DELETE",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to delete Metronome");
          }
          return true;
        }

        function normalizeMetronomeServerKind(value) {
          return String(value || "").toLowerCase().replace(/[-\s]+/g, "_");
        }

        function getMetronomeServerKindCandidates(item) {
          if (!item || typeof item !== "object") return [];
          const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
          const config = item.config && typeof item.config === "object" ? item.config : {};
          const details = item.details && typeof item.details === "object" ? item.details : {};
          return [
            item.kind,
            item.type,
            item.serverKind,
            item.server_kind,
            item.resourceKind,
            item.resource_kind,
            item.resourceType,
            item.resource_type,
            item.category,
            item.subtype,
            item.slug,
            metadata.kind,
            metadata.serverKind,
            metadata.server_kind,
            metadata.resourceKind,
            metadata.resource_kind,
            metadata.resourceType,
            metadata.resource_type,
            metadata.type,
            metadata.category,
            metadata.subtype,
            metadata.runtime,
            config.kind,
            config.serverKind,
            config.server_kind,
            config.type,
            config.category,
            config.subtype,
            config.runtime,
            details.kind,
            details.serverKind,
            details.server_kind,
            details.type,
            details.category,
            details.subtype,
            details.runtime,
          ].map(normalizeMetronomeServerKind).filter(Boolean);
        }

        function isMetronomeDatabaseServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "database",
            "databases",
            "db",
            "sql",
            "sql_database",
            "document_database",
            "collection_database",
            "postgres",
            "postgresql",
            "postgres_database",
            "postgresql_database",
            "server_database",
            "database_server",
          ].includes(kind) || kind.endsWith("_database") || kind.endsWith("_databases");
        }

        function isMetronomeFunctionServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "function",
            "functions",
            "cloud_function",
            "cloud_functions",
            "server_function",
            "edge_function",
            "edge_functions",
            "node_function",
            "nodejs_function",
            "javascript_function",
            "typescript_function",
          ].includes(kind) || kind.endsWith("_function") || kind.endsWith("_functions");
        }

        function isMetronomeWebAppServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "web_app",
            "webapp",
            "website",
            "site",
            "frontend",
            "static_site",
            "hosted_app",
          ].includes(kind) || kind.endsWith("_web_app") || kind.endsWith("_website");
        }

        function isMetronomeAuthServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "auth",
            "authentication",
            "auth_module",
            "user_auth",
            "identity",
          ].includes(kind) || kind.endsWith("_auth");
        }

        function isMetronomeSecretsServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "secret",
            "secrets",
            "secret_store",
            "secrets_store",
            "secret_vault",
            "secrets_vault",
            "vault",
          ].includes(kind) || kind.endsWith("_secret") || kind.endsWith("_secrets") || kind.endsWith("_secret_vault") || kind.endsWith("_secrets_vault");
        }

        function decodeMetronomeCredentialPart(value) {
          const normalized = String(value || "").trim();
          if (!normalized) return "";
          try {
            return decodeURIComponent(normalized);
          } catch (_error) {
            return normalized;
          }
        }

        function encodeMetronomeCredentialPart(value) {
          return encodeURIComponent(String(value || "").trim());
        }

        function parseMetronomeSecretCredentialRef(value) {
          const normalized = String(value || "").trim();
          const parts = normalized.split(":");
          if (parts[0] !== "secrets" || parts.length < 3) {
            return { vaultId: "", secretId: "", legacyRef: normalized };
          }
          return {
            vaultId: decodeMetronomeCredentialPart(parts[1]),
            secretId: decodeMetronomeCredentialPart(parts.slice(2).join(":")),
            legacyRef: "",
          };
        }

        function buildMetronomeSecretCredentialRef(vaultId, secretId) {
          const normalizedVaultId = String(vaultId || "").trim();
          const normalizedSecretId = String(secretId || "").trim();
          if (!normalizedVaultId || !normalizedSecretId) {
            return "";
          }
          return "secrets:" + encodeMetronomeCredentialPart(normalizedVaultId) + ":" + encodeMetronomeCredentialPart(normalizedSecretId);
        }

        function isMetronomeFunctionResourceRecord(item, normalizedKind = "") {
          if (!item || typeof item !== "object") return false;
          if (isMetronomeFunctionServerKind(normalizedKind)) return true;
          const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
          const config = item.config && typeof item.config === "object" ? item.config : {};
          const details = item.details && typeof item.details === "object" ? item.details : {};
          const searchable = [
            item.id,
            item.name,
            item.title,
            item.label,
            item.slug,
            item.path,
            item.url,
            item.endpoint,
            item.runtime,
            metadata.name,
            metadata.title,
            metadata.slug,
            metadata.path,
            metadata.url,
            metadata.endpoint,
            metadata.runtime,
            config.name,
            config.title,
            config.slug,
            config.path,
            config.url,
            config.endpoint,
            config.runtime,
            details.name,
            details.title,
            details.slug,
            details.path,
            details.url,
            details.endpoint,
            details.runtime,
          ].map((value) => String(value || "").toLowerCase()).join(" ");
          return /\b(function|functions|edge function|cloud function|nodejs|node\.js|javascript|typescript)\b/.test(searchable)
            || String(item.id || "").startsWith("fn_");
        }

        async function fetchMetronomeServerResourcesApi() {
          const response = await fetch("/api/real/servers", {
            method: "GET",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to load server resources");
          }
          const data = await response.json();
          const rawItems = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.servers)
              ? data.data.servers
            : Array.isArray(data?.data?.items)
              ? data.data.items
            : Array.isArray(data?.data?.resources)
              ? data.data.resources
            : Array.isArray(data?.servers)
              ? data.servers
            : Array.isArray(data?.items)
              ? data.items
            : Array.isArray(data?.resources)
              ? data.resources
              : Array.isArray(data)
                ? data
                : [];
          return rawItems
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const id = String(item.id || item.serverId || item.server_id || "").trim();
              if (!id) return null;
              const name = String(item.name || item.title || item.label || id).trim();
              const kindCandidates = getMetronomeServerKindCandidates(item);
              const inferredFunctionKind = isMetronomeFunctionResourceRecord(item, kindCandidates[0]) ? "function" : "";
              const kind = kindCandidates.find(isMetronomeFunctionServerKind)
                || kindCandidates.find(isMetronomeDatabaseServerKind)
                || kindCandidates.find(isMetronomeWebAppServerKind)
                || kindCandidates.find(isMetronomeAuthServerKind)
                || kindCandidates.find(isMetronomeSecretsServerKind)
                || inferredFunctionKind
                || kindCandidates[0]
                || "";
              return { id, name: name || id, kind, raw: item };
            })
            .filter(Boolean);
        }

        async function fetchMetronomeSecretVaultSecretsApi(vaultId) {
          const normalizedVaultId = String(vaultId || "").trim();
          if (!normalizedVaultId) return [];
          const response = await fetch("/api/real/servers/" + encodeURIComponent(normalizedVaultId) + "/secrets", {
            method: "GET",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to load secrets");
          }
          const data = await response.json();
          const rawItems = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.secrets)
              ? data.secrets
              : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data)
                  ? data
                  : [];
          return rawItems
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const id = String(item.id || item.secretId || item.secret_id || "").trim();
              const name = String(item.name || item.label || id).trim();
              if (!id || !name) return null;
              return {
                id,
                name,
                description: String(item.description || "").trim(),
                maskedValue: String(item.maskedValue || item.masked_value || "").trim(),
              };
            })
            .filter(Boolean);
        }

        async function invokeMetronomeFunctionResourceApi(functionId, payloadJson) {
          const normalizedFunctionId = String(functionId || "").trim();
          if (!normalizedFunctionId) {
            throw new Error("Select a function before testing.");
          }
          const normalizedPayloadText = String(payloadJson || "").trim();
          let parsedPayload = {};
          if (normalizedPayloadText) {
            try {
              parsedPayload = JSON.parse(normalizedPayloadText);
            } catch (error) {
              throw new Error("Request payload must be valid JSON.");
            }
          }
          const response = await fetch("/api/real/servers/" + encodeURIComponent(normalizedFunctionId) + "/invoke", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method: "POST",
              path: "/",
              body: parsedPayload,
            }),
          });
          const responseText = await response.text();
          let data = null;
          try {
            data = responseText ? JSON.parse(responseText) : null;
          } catch {
            data = { text: responseText };
          }
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to invoke function.");
          }
          return data;
        }

        async function testRunMetronomeWorkflowApi(workflowId, definition, options = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Save this Metronome before running a test.");
          const triggerType = String(options?.triggerType || "").trim();
          const inputs = options?.inputs && typeof options.inputs === "object" ? options.inputs : {};
          const runInputs = {
            source: "manual_trigger_test",
            ...(triggerType ? { triggerType } : {}),
            ...inputs,
          };
          const executionPayload = createMetronomeExecutionPayload(
            { id: normalizedWorkflowId, name: definition?.name || "Metronome" },
            definition,
            runInputs,
            { triggerType }
          );
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/test-run", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(executionPayload),
          });
          if (!response.ok) {
            throw createMetronomeApiError("Test run is not available on this backend yet.", response);
          }
          const data = await response.json();
          return normalizeMetronomeRun(data?.data || data);
        }
`;

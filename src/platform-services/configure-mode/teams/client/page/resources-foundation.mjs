export const TEAMS_PAGE_RESOURCES_FOUNDATION_SCRIPT = `          const getTeamResourceTypeMeta = (resourceType) => {
            const normalizedType = String(resourceType || "").trim();
            const metaByType = {
              project: { label: "Project", Icon: Rocket },
              environment: { label: "Computer", Icon: Monitor },
              agent: { label: "Agent", Icon: Bot },
              guardrail: { label: "Guardrail", Icon: Shield },
              evaluation: { label: "Evaluation", Icon: ChartColumnIncreasing },
              security_repository: { label: "Security Agent repository", Icon: Shield },
              file: { label: "File", Icon: FileText },
              metronome: { label: "Metronome Workflow", Icon: Metronome },
              metronome_workflow: { label: "Metronome Workflow", Icon: Metronome },
              batch_job: { label: "Batch", Icon: Truck },
              web_app: { label: "Web App", Icon: Monitor },
              function: { label: "Function", Icon: FunctionSquare },
              database: { label: "Database", Icon: Database },
              imagine: { label: "Imagine", Icon: Clapperboard },
              imagine_template: { label: "Imagine template", Icon: Clapperboard },
              inference_endpoint: { label: "Inference Endpoint", Icon: Cpu },
            };
            return metaByType[normalizedType] || { label: "Resource", Icon: Layers };
          };

          function getTeamResourceSourceLabel(row) {
            const sources = Array.isArray(row?.sources) ? row.sources : [];
            const hasDirect = sources.some((source) => source.kind === "direct");
            const projectSources = sources.filter((source) => source.kind === "project");
            const projectAccessSources = sources.filter((source) => source.kind === "project_access");
            if (hasDirect && projectSources.length > 0) {
              return "Direct + " + String(projectSources.length) + " project" + (projectSources.length === 1 ? "" : "s");
            }
            if (hasDirect) {
              return "Direct team share";
            }
            if (projectSources.length === 1) {
              return "Project: " + (projectSources[0].projectName || "Untitled project");
            }
            if (projectSources.length > 1) {
              return String(projectSources.length) + " projects";
            }
            if (projectAccessSources.length > 0) {
              return "Project settings";
            }
            return "Unknown";
          }

          function getTeamResourceSourceTooltip(row) {
            const sources = Array.isArray(row?.sources) ? row.sources : [];
            return sources
              .map((source) => source.label || (source.kind === "project" ? ("Project: " + (source.projectName || "Untitled project")) : "Direct team share"))
              .filter(Boolean)
              .join("\\n");
          }

          function getTeamResourceOwnerLabelFromPerson(person) {
            if (!person || typeof person !== "object" || Array.isArray(person)) {
              return "";
            }
            const name = String(
              person.displayName
              || person.name
              || person.fullName
              || person.username
              || person.userName
              || ""
            ).trim();
            const email = String(person.email || person.emailAddress || person.mail || "").trim();
            if (!name && !email) {
              return "";
            }
            return formatAccountDisplayName(name, email, name || email);
          }

          function getTeamResourceOwnerLabelFromRecord(record) {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
            const name = String(
              source.ownerName
              || source.createdByName
              || source.creatorName
              || source.authorName
              || source.leadName
              || source.userDisplayName
              || source.userName
              || ""
            ).trim();
            const email = String(
              source.ownerEmail
              || source.createdByEmail
              || source.creatorEmail
              || source.authorEmail
              || source.leadEmail
              || source.userEmail
              || ""
            ).trim();
            if (name || email) {
              return formatAccountDisplayName(name, email, name || email);
            }
            const nestedOwnerLabel = [
              source.owner,
              source.creator,
              source.createdBy,
              source.created_by,
              source.author,
              source.lead,
              source.user,
              source.account,
              source.profile,
              source.member,
            ].map(getTeamResourceOwnerLabelFromPerson).find(Boolean);
            return nestedOwnerLabel || "";
          }

          function getTeamResourceOwnerIdentityRecords(record) {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
            const ownerIdentity = {
              userId: source.ownerUserId
                || source.owner_user_id
                || source.ownerId
                || source.owner_id
                || source.createdByUserId
                || source.created_by_user_id
                || source.createdById
                || source.created_by_id
                || source.creatorUserId
                || source.creator_user_id
                || source.creatorId
                || source.creator_id
                || source.authorUserId
                || source.author_user_id
                || source.authorId
                || source.author_id
                || source.leadUserId
                || source.lead_user_id
                || source.leadId
                || source.lead_id
                || "",
              displayName: source.ownerName
                || source.ownerDisplayName
                || source.createdByName
                || source.creatorName
                || source.authorName
                || source.leadName
                || source.userDisplayName
                || source.userName
                || "",
              email: source.ownerEmail
                || source.createdByEmail
                || source.creatorEmail
                || source.authorEmail
                || source.leadEmail
                || source.userEmail
                || "",
              photoURL: source.ownerPhotoURL
                || source.ownerPhotoUrl
                || source.ownerAvatarUrl
                || source.createdByPhotoURL
                || source.createdByPhotoUrl
                || source.createdByAvatarUrl
                || source.creatorPhotoURL
                || source.creatorPhotoUrl
                || source.creatorAvatarUrl
                || source.authorPhotoURL
                || source.authorPhotoUrl
                || source.authorAvatarUrl
                || source.leadAvatarUrl
                || source.userPhotoURL
                || source.userPhotoUrl
                || source.userAvatarUrl
                || "",
            };
            return [
              ownerIdentity,
              source.owner,
              source.creator,
              source.createdBy,
              source.created_by,
              source.author,
              source.lead,
              source.user,
              source.account,
              source.profile,
              source.member,
            ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
          }

          function findTeamResourceOwnerMemberRow(record) {
            const ownerRecords = getTeamResourceOwnerIdentityRecords(record);
            const ownerKeys = new Set();
            const ownerEmails = new Set();
            const ownerLabels = new Set();
            ownerRecords.forEach((ownerRecord) => {
              getTeamPageMemberProfileKeyCandidates(ownerRecord).forEach((key) => {
                ownerKeys.add(String(key || "").trim().toLowerCase());
              });
              const email = readTeamPageIdentityEmail(ownerRecord);
              if (email) {
                ownerEmails.add(email);
                ownerKeys.add(email);
              }
              const ownerLabel = getTeamResourceOwnerLabelFromPerson(ownerRecord);
              if (ownerLabel) {
                ownerLabels.add(ownerLabel.toLowerCase());
              }
            });
            const recordOwnerLabel = getTeamResourceOwnerLabelFromRecord(record);
            if (recordOwnerLabel) {
              ownerLabels.add(recordOwnerLabel.toLowerCase());
            }
            if (ownerKeys.size === 0 && ownerLabels.size === 0) {
              return null;
            }
            return memberRows.find((row) => {
              if (row.kind !== "member") {
                return false;
              }
              const item = row.item || {};
              const itemKeys = getTeamPageMemberProfileKeyCandidates(item)
                .map((key) => String(key || "").trim().toLowerCase())
                .filter(Boolean);
              if (itemKeys.some((key) => ownerKeys.has(key))) {
                return true;
              }
              const itemEmail = getTeamMemberEmail(item);
              if (itemEmail && ownerEmails.has(itemEmail)) {
                return true;
              }
              const itemDisplayName = getTeamMemberRowDisplayName(row);
              return Boolean(itemDisplayName && ownerLabels.has(itemDisplayName.toLowerCase()));
            }) || null;
          }

          function getTeamResourceOwnerAvatarUrlFromRecord(record) {
            const explicitAvatarUrl = getTeamResourceOwnerIdentityRecords(record)
              .map((ownerRecord) => readTeamPageIdentityAvatarUrl(ownerRecord))
              .map((value) => normalizeSessionPhotoUrl(value))
              .find((value) => canRenderAvatarImage(value));
            if (explicitAvatarUrl) {
              return explicitAvatarUrl;
            }
            const ownerRow = findTeamResourceOwnerMemberRow(record);
            return ownerRow ? getTeamMemberAvatarUrl(ownerRow.item, false) : "";
          }

          function getTeamProjectOwnerLabel(project) {
            const normalizedProject = normalizePlaygroundProjectRecord(project);
            return getTeamResourceOwnerLabelFromRecord({
              ownerUserId: normalizedProject.leadUserId,
              ownerName: normalizedProject.leadName,
              ownerEmail: normalizedProject.leadEmail,
              ownerAvatarUrl: normalizedProject.leadAvatarUrl,
              owner: normalizedProject.lead || normalizedProject.metadata?.lead,
            });
          }

          function getTeamProjectOwnerAvatarUrl(project) {
            const normalizedProject = normalizePlaygroundProjectRecord(project);
            return getTeamResourceOwnerAvatarUrlFromRecord({
              ownerUserId: normalizedProject.leadUserId,
              ownerName: normalizedProject.leadName,
              ownerEmail: normalizedProject.leadEmail,
              ownerAvatarUrl: normalizedProject.leadAvatarUrl,
              owner: normalizedProject.lead || normalizedProject.metadata?.lead,
            });
          }

          function getSelectedTeamOwnerLabel() {
            const ownerRow = memberRows.find((row) => row.kind === "member" && isTeamOwnerMember(row.item, false));
            if (ownerRow) {
              return getTeamMemberRowDisplayName(ownerRow);
            }
            if (selectedTeamOwnerUserId && selectedTeamOwnerUserId === String(sessionState.userId || "").trim()) {
              return formatAccountDisplayName(accountName, currentAccountEmail, "You");
            }
            if (selectedTeamOwnerEmail && selectedTeamOwnerEmail === currentAccountEmail) {
              return formatAccountDisplayName(accountName, currentAccountEmail, "You");
            }
            return getTeamResourceOwnerLabelFromRecord(selectedTeam);
          }

          function getSelectedTeamOwnerAvatarUrl() {
            const ownerRow = memberRows.find((row) => row.kind === "member" && isTeamOwnerMember(row.item, false));
            if (ownerRow) {
              return getTeamMemberAvatarUrl(ownerRow.item, false);
            }
            if (selectedTeamOwnerUserId && selectedTeamOwnerUserId === String(sessionState.userId || "").trim()) {
              return canRenderAvatarImage(accountAvatarUrl) ? accountAvatarUrl : "";
            }
            if (selectedTeamOwnerEmail && selectedTeamOwnerEmail === currentAccountEmail) {
              return canRenderAvatarImage(accountAvatarUrl) ? accountAvatarUrl : "";
            }
            return getTeamResourceOwnerAvatarUrlFromRecord(selectedTeam);
          }

          function classifyTeamProjectFileResource(item) {
            return "file";
          }

          function getTeamProjectResourceIndexArray(resourceIndex, keys = []) {
            if (Array.isArray(resourceIndex)) {
              return resourceIndex;
            }
            if (!resourceIndex || typeof resourceIndex !== "object") {
              return [];
            }
            for (const key of keys) {
              if (Array.isArray(resourceIndex[key])) {
                return resourceIndex[key];
              }
            }
            if (Array.isArray(resourceIndex.data)) {
              return resourceIndex.data;
            }
            if (Array.isArray(resourceIndex.items)) {
              return resourceIndex.items;
            }
            if (Array.isArray(resourceIndex.results)) {
              return resourceIndex.results;
            }
            return [];
          }

          function classifyTeamProjectRuntimeResource(item) {
            const normalizedKind = canonicalizePlaygroundServerKind(
              item?.kind
              || item?.serverKind
              || item?.resourceKind
              || item?.type
              || item?.resourceType
              || ""
            );
            if (normalizedKind === "function") return "function";
            if (normalizedKind === "database") return "database";
            return "web_app";
          }

          function getTeamProjectMetadata(project) {
            return project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
              ? project.metadata
              : {};
          }

          function projectHasTeamAccess(project, teamId, directProjectShareIds) {
            const normalizedProjectId = String(project?.id || "").trim();
            const normalizedTeamId = String(teamId || "").trim();
            if (!normalizedProjectId || !normalizedTeamId) {
              return false;
            }
            if (directProjectShareIds.has(normalizedProjectId)) {
              return true;
            }
            const metadata = getTeamProjectMetadata(project);
            const removedTeamIds = new Set(
              (Array.isArray(metadata.teamAccessRemovedIds) ? metadata.teamAccessRemovedIds : [])
                .map((value) => String(value || "").trim())
                .filter(Boolean)
            );
            if (removedTeamIds.has(normalizedTeamId)) {
              return false;
            }
            const teamAccessIds = new Set(
              (Array.isArray(metadata.teamAccessIds) ? metadata.teamAccessIds : [])
                .map((value) => String(value || "").trim())
                .filter(Boolean)
            );
            const sharedTeamIds = new Set(
              (Array.isArray(metadata.sharedTeamIds) ? metadata.sharedTeamIds : [])
                .map((value) => String(value || "").trim())
                .filter(Boolean)
            );
            if (teamAccessIds.has(normalizedTeamId) || sharedTeamIds.has(normalizedTeamId)) {
              return true;
            }
            const rolePermissionSets = metadata.teamRolePermissionSets && typeof metadata.teamRolePermissionSets === "object" && !Array.isArray(metadata.teamRolePermissionSets)
              ? metadata.teamRolePermissionSets
              : {};
            const teamPermissionSets = metadata.teamPermissionSets && typeof metadata.teamPermissionSets === "object" && !Array.isArray(metadata.teamPermissionSets)
              ? metadata.teamPermissionSets
              : {};
            return Boolean(rolePermissionSets[normalizedTeamId] || teamPermissionSets[normalizedTeamId]);
          }

          function buildTeamProjectResourceRows(project, source, resourceIndex = null) {
            const normalizedProject = normalizePlaygroundProjectRecord(project);
            const metadata = getTeamProjectMetadata(normalizedProject);
            const projectName = String(normalizedProject.name || "Untitled project").trim();
            const projectOwnerLabel = getTeamProjectOwnerLabel(normalizedProject);
            const projectOwnerAvatarUrl = getTeamProjectOwnerAvatarUrl(normalizedProject);
            const resourceRows = [];
            const resourceRowKeys = new Set();
            const pushResourceRow = (row) => {
              const normalizedType = String(row?.type || "resource").trim() || "resource";
              const normalizedKey = String(row?.key || row?.id || row?.title || "").trim();
              if (!normalizedKey) {
                return;
              }
              const finalKey = normalizedType + ":" + normalizedKey;
              if (resourceRowKeys.has(finalKey)) {
                return;
              }
              resourceRowKeys.add(finalKey);
              resourceRows.push(row);
            };
            const projectAttachmentCandidates = [
              ...normalizePlaygroundTaskAttachmentList(normalizedProject.attachments || metadata.attachments),
              ...normalizePlaygroundTaskAttachmentList(getTeamProjectResourceIndexArray(resourceIndex, ["files", "attachments"])),
            ];
            projectAttachmentCandidates.forEach((attachment, index) => {
              const path = normalizeHistoryPath(attachment?.sourcePath || attachment?.workspacePath || attachment?.path || "");
              const environmentId = String(attachment?.environmentId || normalizedProject.defaultEnvironmentId || "").trim();
              const title = String(attachment?.filename || getHistoryPathName(path) || attachment?.title || "Untitled file").trim();
              const type = classifyTeamProjectFileResource(attachment);
              pushResourceRow({
                key: type + ":" + (environmentId || "project") + ":" + (path || attachment?.id || index),
                type,
                title,
                subtitle: path || "Project attachment",
                status: "Project role based",
                accessLevel: "project_role_based",
                accessLabel: "Project role based",
                updatedLabel: attachment?.updatedAt || attachment?.createdAt ? formatDate(attachment.updatedAt || attachment.createdAt) : "-",
                ownerLabel: projectOwnerLabel,
                ownerAvatarUrl: getTeamResourceOwnerAvatarUrlFromRecord(attachment) || projectOwnerAvatarUrl,
                record: attachment,
                environmentId,
                path,
                projectId: normalizedProject.id,
                projectName,
                sources: [source],
              });
            });
            getTeamProjectResourceIndexArray(resourceIndex, ["serverResources", "servers", "resources"]).forEach((item, index) => {
              const type = classifyTeamProjectRuntimeResource(item);
              const normalizedKind = canonicalizePlaygroundServerKind(item?.kind || item?.serverKind || item?.resourceKind || item?.type || item?.resourceType || "");
              const endpoint = String(item?.endpoint || item?.url || item?.serviceUrl || item?.customDomain || item?.cloudRunServiceName || "").trim();
              const title = String(item?.title || item?.name || item?.label || item?.id || formatPlaygroundServerKindLabel(normalizedKind)).trim();
              pushResourceRow({
                key: (item?.id || normalizedKind + ":" + title + ":" + index),
                type,
                title,
                subtitle: endpoint || formatPlaygroundServerKindLabel(normalizedKind),
                status: String(item?.status || item?.state || "Linked").trim() || "Linked",
                accessLevel: "project_role_based",
                accessLabel: "Project role based",
                updatedLabel: item?.updatedAt || item?.createdAt ? formatDate(item.updatedAt || item.createdAt) : "-",
                ownerLabel: getTeamResourceOwnerLabelFromRecord(item) || projectOwnerLabel,
                ownerAvatarUrl: getTeamResourceOwnerAvatarUrlFromRecord(item) || projectOwnerAvatarUrl,
                record: item,
                resourceId: item?.id || "",
                projectId: normalizedProject.id,
                projectName,
                sources: [source],
              });
            });
            getTeamProjectResourceIndexArray(resourceIndex, ["metronomes", "workflows", "schedules"]).forEach((item, index) => {
              const title = String(item?.title || item?.name || item?.label || item?.id || "Metronome").trim();
              pushResourceRow({
                key: (item?.id || title + ":" + index),
                type: "metronome",
                title,
                subtitle: String(item?.description || item?.schedule || item?.cron || "Project metronome").trim(),
                status: String(item?.status || item?.state || "Linked").trim() || "Linked",
                accessLevel: "project_role_based",
                accessLabel: "Project role based",
                updatedLabel: item?.updatedAt || item?.createdAt ? formatDate(item.updatedAt || item.createdAt) : "-",
                ownerLabel: getTeamResourceOwnerLabelFromRecord(item) || projectOwnerLabel,
                ownerAvatarUrl: getTeamResourceOwnerAvatarUrlFromRecord(item) || projectOwnerAvatarUrl,
                record: item,
                resourceId: item?.id || "",
                projectId: normalizedProject.id,
                projectName,
                sources: [source],
              });
            });
            const publishedTemplates = Array.isArray(metadata.resourceTemplates) ? metadata.resourceTemplates : [];
            publishedTemplates.forEach((item, index) => {
              const templateId = String(item?.templateId || item?.id || "").trim();
              const catalogTemplate = Array.isArray(PLAYGROUND_RESOURCE_TEMPLATE_DATA)
                ? PLAYGROUND_RESOURCE_TEMPLATE_DATA.find((template) => String(template?.id || "").trim() === templateId)
                : null;
              const template = {
                ...(catalogTemplate && typeof catalogTemplate === "object" ? catalogTemplate : {}),
                ...(item && typeof item === "object" ? item : {}),
              };
              const type = String(template.type || "file").trim() || "file";
              pushResourceRow({
                key: type + ":" + (templateId || String(template.title || type) + ":" + index),
                type,
                title: String(template.title || "Published template").trim() || "Published template",
                subtitle: String(template.summary || template.description || "Project resource template").trim(),
                status: "Project role based",
                accessLevel: "project_role_based",
                accessLabel: "Project role based",
                updatedLabel: template.publishedAt ? formatDate(template.publishedAt) : "-",
                ownerLabel: getTeamResourceOwnerLabelFromRecord(template) || projectOwnerLabel,
                ownerAvatarUrl: getTeamResourceOwnerAvatarUrlFromRecord(template) || projectOwnerAvatarUrl,
                record: template,
                projectId: normalizedProject.id,
                projectName,
                sources: [source],
              });
            });
            return resourceRows;
          }

          const directProjectShareIds = new Set(
            teamPageShares
              .filter((share) => String(share?.resourceType || "").trim() === "project")
              .map((share) => String(share?.resourceId || "").trim())
              .filter(Boolean)
          );
          const accessibleTeamProjects = realProjects.filter((project) =>
            projectHasTeamAccess(project, selectedTeam?.id || teamPageSelectedTeamId, directProjectShareIds)
          );
          const teamResourceRowsByKey = new Map();
          const selectedTeamOwnerLabel = getSelectedTeamOwnerLabel();
          const selectedTeamOwnerAvatarUrl = getSelectedTeamOwnerAvatarUrl();
          const upsertTeamResourceRow = (row) => {
            const normalizedType = String(row?.type || row?.resourceType || "resource").trim() || "resource";
            const dedupeKey = normalizedType + ":" + String(row?.key || row?.id || row?.resourceId || row?.title || "").trim();
            if (!dedupeKey || dedupeKey === normalizedType + ":") {
              return;
            }
            const nextRow = {
              ...row,
              key: dedupeKey,
              type: normalizedType,
              sources: Array.isArray(row?.sources) ? row.sources : [],
            };
            const existing = teamResourceRowsByKey.get(dedupeKey);
            if (!existing) {
              teamResourceRowsByKey.set(dedupeKey, nextRow);
              return;
            }
            const sourcesByKey = new Map();
            [...(Array.isArray(existing.sources) ? existing.sources : []), ...nextRow.sources].forEach((source) => {
              const sourceKey = String(source?.kind || "source") + ":" + String(source?.projectId || source?.shareId || source?.label || "");
              sourcesByKey.set(sourceKey, source);
            });
            teamResourceRowsByKey.set(dedupeKey, {
              ...existing,
              ...(!existing.directShare && nextRow.directShare ? nextRow : {}),
              title: existing.title || nextRow.title,
              subtitle: existing.subtitle || nextRow.subtitle,
              updatedLabel: existing.updatedLabel && existing.updatedLabel !== "-" ? existing.updatedLabel : nextRow.updatedLabel,
              ownerLabel: existing.ownerLabel || nextRow.ownerLabel,
              ownerAvatarUrl: existing.ownerAvatarUrl || nextRow.ownerAvatarUrl,
              sources: Array.from(sourcesByKey.values()),
            });
          };

          teamPageShares.forEach((share, index) => {
            const resourceType = getTeamResourceUiShareType(share) || "resource";
            const resourceId = String(share?.resourceId || "").trim();
            const isProjectResourceShare = resourceType === "project";
            const resourceTitle = String(resourceNameByKey.get(resourceType + ":" + resourceId) || getTeamResourceShareMetadataTitle(share) || resourceId || "Untitled resource").trim();
            upsertTeamResourceRow({
              key: resourceId || String(share?.id || index),
              type: resourceType,
              title: resourceTitle,
              subtitle: formatResourceType(resourceType),
              status: isProjectResourceShare ? "Project role based" : formatAccess(share?.accessLevel),
              accessLevel: isProjectResourceShare ? "project_role_based" : (share?.accessLevel || "use"),
              accessLabel: isProjectResourceShare ? "Project role based" : formatAccess(share?.accessLevel),
              updatedLabel: share?.updatedAt ? formatDate(share.updatedAt) : "-",
              ownerLabel: getTeamResourceOwnerLabelFromRecord(share) || selectedTeamOwnerLabel,
              ownerAvatarUrl: getTeamResourceOwnerAvatarUrlFromRecord(share) || selectedTeamOwnerAvatarUrl,
              record: share,
              directShare: share,
              resourceId,
              sources: [{
                kind: "direct",
                label: "Direct team share",
                shareId: String(share?.id || resourceType + ":" + resourceId),
              }],
            });
          });

          accessibleTeamProjects.forEach((project) => {
            const normalizedProject = normalizePlaygroundProjectRecord(project);
            const projectName = String(normalizedProject.name || "Untitled project").trim();
            const hasDirectProjectShare = directProjectShareIds.has(String(normalizedProject.id || "").trim());
            if (!hasDirectProjectShare) {
              upsertTeamResourceRow({
                key: normalizedProject.id,
                type: "project",
                title: projectName,
                subtitle: "Project",
                status: "Project role based",
                accessLevel: "project_role_based",
                accessLabel: "Project role based",
                updatedLabel: normalizedProject.updatedAt ? formatDate(normalizedProject.updatedAt) : "-",
                ownerLabel: getTeamProjectOwnerLabel(normalizedProject),
                ownerAvatarUrl: getTeamProjectOwnerAvatarUrl(normalizedProject),
                record: normalizedProject,
                resourceId: normalizedProject.id,
                projectId: normalizedProject.id,
                projectName,
                sources: [{
                  kind: "project_access",
                  label: "Project settings",
                  projectId: normalizedProject.id,
                  projectName,
                }],
              });
            }
            const projectSource = {
              kind: "project",
              label: "Project: " + projectName,
              projectId: normalizedProject.id,
              projectName,
            };
            const projectResourceIndex = teamPageProjectResourceIndexes[String(normalizedProject.id || "").trim()]?.data || null;
            buildTeamProjectResourceRows(normalizedProject, projectSource, projectResourceIndex).forEach(upsertTeamResourceRow);
          });

          function getTeamResourceTypeSortRank(row) {
            const normalizedType = getTeamResourceUiShareType(row?.type || row?.resourceType || "");
            if (normalizedType === "project") return 0;
            if (["web_app", "function", "database", "metronome", "environment", "agent"].includes(normalizedType)) return 1;
            if (normalizedType === "imagine" || normalizedType === "imagine_template") return 2;
            if (normalizedType === "file") return 3;
            return 4;
          }

          const teamResourceRowsAll = Array.from(teamResourceRowsByKey.values())
            .map((row) => ({
              ...row,
              sourceLabel: getTeamResourceSourceLabel(row),
              sourceTooltip: getTeamResourceSourceTooltip(row),
            }))
            .sort((left, right) => {
              const rankDelta = getTeamResourceTypeSortRank(left) - getTeamResourceTypeSortRank(right);
              if (rankDelta !== 0) {
                return rankDelta;
              }
              const typeDelta = String(left.type || "").localeCompare(String(right.type || ""));
              if (typeDelta !== 0) {
                return typeDelta;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
	          const teamResourceTypeFilters = [
	            { id: "all", label: "All" },
	            { id: "project", label: "Projects" },
            { id: "environment", label: "Computers" },
            { id: "agent", label: "Agents" },
            { id: "guardrail", label: "Guardrails" },
            { id: "evaluation", label: "Evaluations" },
            { id: "file", label: "Files" },
	            { id: "metronome", label: "Metronomes" },
            { id: "batch_job", label: "Batches" },
            { id: "web_app", label: "Web Apps" },
            { id: "function", label: "Functions" },
            { id: "database", label: "Databases" },
            { id: "imagine", label: "Imagine" },
            { id: "imagine_template", label: "Imagine templates" },
            { id: "inference_endpoint", label: "Inference Endpoints" },
	          ].filter((filterOption) => (
	            filterOption.id === "all" || teamResourceRowsAll.some((row) => row.type === filterOption.id)
	          ));
	          const getTeamResourceSortValue = (row, sortKey) => {
	            const record = row?.record && typeof row.record === "object" && !Array.isArray(row.record) ? row.record : {};
	            switch (String(sortKey || "resource")) {
	              case "access":
	                return row?.accessLabel || row?.status || "";
	              case "source":
	                return row?.sourceLabel || "";
	              case "updated": {
	                const timestamp = Date.parse(String(
	                  row?.updatedAt
	                  || row?.directShare?.updatedAt
	                  || record.updatedAt
	                  || record.updated_at
	                  || record.createdAt
	                  || record.created_at
	                  || ""
	                ));
	                return Number.isFinite(timestamp) ? timestamp : 0;
	              }
	              case "owner":
	                return row?.ownerLabel || "";
	              case "resource":
	              default:
	                return row?.title || "";
	            }
	          };
	          const compareTeamResourceRows = (left, right, sortKey) => {
	            const leftValue = getTeamResourceSortValue(left, sortKey);
	            const rightValue = getTeamResourceSortValue(right, sortKey);
	            if (typeof leftValue === "number" || typeof rightValue === "number") {
	              const leftNumber = typeof leftValue === "number" && Number.isFinite(leftValue) ? leftValue : 0;
	              const rightNumber = typeof rightValue === "number" && Number.isFinite(rightValue) ? rightValue : 0;
	              if (leftNumber !== rightNumber) {
	                return leftNumber - rightNumber;
	              }
	            } else {
	              const textComparison = String(leftValue || "").localeCompare(String(rightValue || ""), undefined, {
	                numeric: true,
	                sensitivity: "base",
	              });
	              if (textComparison !== 0) {
	                return textComparison;
	              }
	            }
	            return String(left?.title || "").localeCompare(String(right?.title || ""), undefined, {
	              numeric: true,
	              sensitivity: "base",
	            });
	          };
	          const handleTeamResourceSortChange = (nextSortKey) => {
	            const normalizedSortKey = String(nextSortKey || "resource").trim() || "resource";
	            setTeamPageResourceToolbarPopover("");
	            setTeamPageResourceMenuId("");
	            setTeamPageResourceSortDirection((currentDirection) => {
	              if (teamPageResourceSort !== normalizedSortKey) {
	                return normalizedSortKey === "updated" ? "desc" : "asc";
	              }
	              return String(currentDirection || "asc").toLowerCase() === "asc" ? "desc" : "asc";
	            });
	            setTeamPageResourceSort(normalizedSortKey);
	          };
	          const teamResourceRows = teamResourceRowsAll
	            .filter((row) => String(teamPageResourceFilter || "all") === "all" || row.type === teamPageResourceFilter)
	            .filter((row) => {
              const query = String(teamPageResourceSearchQuery || "").trim().toLowerCase();
              if (!query) {
                return true;
              }
              return [
                row.title,
                row.subtitle,
                row.status,
                row.sourceLabel,
                row.ownerLabel,
	                row.record?.resourceId || "",
	              ].join(" ").toLowerCase().includes(query);
	            })
	            .slice()
	            .sort((left, right) => {
	              const comparison = compareTeamResourceRows(left, right, teamPageResourceSort);
	              return String(teamPageResourceSortDirection || "asc").toLowerCase() === "desc" ? -comparison : comparison;
	            });
	          const getTeamResourceSelectionId = (row) => String(row?.key || row?.id || row?.resourceId || row?.title || "").trim();
	          const toggleTeamPageResourceSelection = (resourceId) => {
	            const normalizedResourceId = String(resourceId || "").trim();
	            if (!normalizedResourceId) return;
	            setSelectedTeamPageResourceIds((current) => {
	              const next = new Set(current || []);
	              if (next.has(normalizedResourceId)) {
	                next.delete(normalizedResourceId);
	              } else {
	                next.add(normalizedResourceId);
	              }
	              return next;
	            });
	          };
	          const toggleVisibleTeamPageResourceSelection = (resourceIds = [], shouldSelect = true) => {
	            const normalizedResourceIds = (Array.isArray(resourceIds) ? resourceIds : [])
	              .map((resourceId) => String(resourceId || "").trim())
	              .filter(Boolean);
	            if (!normalizedResourceIds.length) {
	              return;
	            }
	            setSelectedTeamPageResourceIds((current) => {
	              const next = new Set(current || []);
	              normalizedResourceIds.forEach((resourceId) => {
	                if (shouldSelect) {
	                  next.add(resourceId);
	                } else {
	                  next.delete(resourceId);
	                }
	              });
	              return next;
	            });
		          };
		          const getTeamResourceRowMenuId = (row) => "team-resource:" + String(row?.key || "").trim();
		          const canRemoveTeamResourceRow = (row) => Boolean((row?.directShare || row?.record || {})?.id && canManageTeam);
		          const getTeamResourceActionTargetsByIds = (resourceIds = []) => {
		            const normalizedIds = new Set((Array.isArray(resourceIds) ? resourceIds : [])
		              .map((resourceId) => String(resourceId || "").trim())
		              .filter(Boolean));
		            if (!normalizedIds.size) {
		              return [];
		            }
		            const sourceRows = Array.isArray(teamResourceRowsAll) ? teamResourceRowsAll : teamResourceRows;
		            return sourceRows.filter((row) => normalizedIds.has(getTeamResourceSelectionId(row)));
		          };
		          function clearTeamPageResourceActionMenuCloseTimer() {
		            if (teamPageResourceActionMenuCloseTimerRef.current !== null && typeof window !== "undefined") {
		              window.clearTimeout(teamPageResourceActionMenuCloseTimerRef.current);
		              teamPageResourceActionMenuCloseTimerRef.current = null;
		            }
		          }
		          function clearTeamPageResourceBulkActionMenuCloseTimer() {
		            if (teamPageResourceBulkActionMenuCloseTimerRef.current !== null && typeof window !== "undefined") {
		              window.clearTimeout(teamPageResourceBulkActionMenuCloseTimerRef.current);
		              teamPageResourceBulkActionMenuCloseTimerRef.current = null;
		            }
		          }
		          function closeTeamPageResourceActionMenu(options = {}) {
		            if (!teamPageResourceActionMenuState) {
		              return;
		            }
		            clearTeamPageResourceActionMenuCloseTimer();
		            if (options?.animate === false || typeof window === "undefined") {
		              setTeamPageResourceActionMenuClosing(false);
		              setTeamPageResourceActionMenuState(null);
		              setTeamPageResourceMenuId("");
		              return;
		            }
		            setTeamPageResourceActionMenuClosing(true);
		            teamPageResourceActionMenuCloseTimerRef.current = window.setTimeout(() => {
		              teamPageResourceActionMenuCloseTimerRef.current = null;
		              setTeamPageResourceActionMenuClosing(false);
		              setTeamPageResourceActionMenuState(null);
		              setTeamPageResourceMenuId("");
		            }, 90);
		          }
		          function closeTeamPageResourceBulkActionMenu(options = {}) {
		            if (!teamPageResourceBulkActionMenuState) {
		              return;
		            }
		            clearTeamPageResourceBulkActionMenuCloseTimer();
		            if (options?.animate === false || typeof window === "undefined") {
		              setTeamPageResourceBulkActionMenuClosing(false);
		              setTeamPageResourceBulkActionMenuState(null);
		              return;
		            }
		            setTeamPageResourceBulkActionMenuClosing(true);
		            teamPageResourceBulkActionMenuCloseTimerRef.current = window.setTimeout(() => {
		              teamPageResourceBulkActionMenuCloseTimerRef.current = null;
		              setTeamPageResourceBulkActionMenuClosing(false);
		              setTeamPageResourceBulkActionMenuState(null);
		            }, 90);
		          }
		          function getTeamResourceContextMenuPosition(event, menuHeight = 184) {
		            const menuWidth = 240;
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
		          function getTeamResourceActionMenuStyle(menuState) {
		            const menuStyle = {
		              position: "fixed",
		              top: Number(menuState?.top || 0) + "px",
		            };
		            if (Number.isFinite(menuState?.right)) {
		              menuStyle.right = Number(menuState.right) + "px";
		              menuStyle.left = "auto";
		            } else {
		              menuStyle.left = Number(menuState?.left || 0) + "px";
		              menuStyle.right = "auto";
		            }
		            return menuStyle;
		          }
		          function openTeamPageResourceBulkActionMenu(event, resourceIds = []) {
		            const selectedIds = (Array.isArray(resourceIds) ? resourceIds : [])
		              .map((resourceId) => String(resourceId || "").trim())
		              .filter(Boolean);
		            if (selectedIds.length < 2) {
		              return false;
		            }
		            event.preventDefault();
		            event.stopPropagation();
		            const position = getTeamResourceContextMenuPosition(event, 96);
		            clearTeamPageResourceBulkActionMenuCloseTimer();
		            closeTeamPageResourceActionMenu({ animate: false });
		            closeTeamPageMemberActionMenu({ animate: false });
		            closeTeamPageMemberBulkActionMenu({ animate: false });
		            setTeamPageResourceMenuId("");
		            setTeamPageResourceToolbarPopover("");
		            setTeamPageMemberMenuId("");
		            setTeamPageResourceBulkActionMenuClosing(false);
		            setTeamPageResourceBulkActionMenuState({
		              resourceIds: selectedIds,
		              ...position,
		            });
		            return true;
		          }
		          function openTeamPageResourceActionMenu(event, row, options = {}) {
		            const menuId = getTeamResourceRowMenuId(row);
		            if (!menuId) {
		              return;
		            }
		            event.preventDefault();
		            event.stopPropagation();
		            const resourceSelectionId = getTeamResourceSelectionId(row);
		            if (
		              options?.context
		              && resourceSelectionId
		              && selectedTeamPageResourceIds.has(resourceSelectionId)
		              && selectedTeamPageResourceIds.size > 1
		            ) {
		              openTeamPageResourceBulkActionMenu(event, Array.from(selectedTeamPageResourceIds || []));
		              return;
		            }
		            const position = options?.context
		              ? getTeamResourceContextMenuPosition(event, 184)
		              : getSideActionMenuPosition(event, 184, 240);
		            if (!options?.context && teamPageResourceActionMenuState?.menuId === menuId && !teamPageResourceActionMenuClosing) {
		              closeTeamPageResourceActionMenu();
		              return;
		            }
		            clearTeamPageResourceActionMenuCloseTimer();
		            closeTeamPageResourceBulkActionMenu({ animate: false });
		            closeTeamPageMemberActionMenu({ animate: false });
		            closeTeamPageMemberBulkActionMenu({ animate: false });
		            setTeamPageMemberMenuId("");
		            setTeamPageResourceToolbarPopover("");
		            setTeamPageResourceMenuId(menuId);
		            setTeamPageResourceActionMenuClosing(false);
		            setTeamPageResourceActionMenuState({
		              menuId,
		              row,
		              ...position,
		            });
		          }
		          async function handleDeleteTeamResourceRows(rows = []) {
		            const targets = (Array.isArray(rows) ? rows : []).filter(canRemoveTeamResourceRow);
		            if (!targets.length) {
		              return;
		            }
		            const confirmed = window.confirm("Remove " + targets.length + " selected " + (targets.length === 1 ? "resource" : "resources") + " from the team?");
		            if (!confirmed) {
		              return;
		            }
		            const teamId = String(teamPageSelectedTeamId || "").trim();
		            if (!teamId) {
		              return;
		            }
		            closeTeamPageResourceBulkActionMenu({ animate: false });
		            closeTeamPageResourceActionMenu({ animate: false });
		            setTeamPageActionId("share-bulk-delete");
		            setTeamPageError("");
		            try {
		              for (const row of targets) {
		                const shareId = String((row?.directShare || row?.record || {})?.id || "").trim();
		                if (!shareId) {
		                  continue;
		                }
		                const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/resource-shares/" + encodeURIComponent(shareId), {
		                  method: "DELETE",
		                  credentials: "include",
		                  cache: "no-store",
		                  headers: requestHeaders,
		                }, 8000);
		                if (!response.ok) {
		                  throw new Error(data?.message || data?.error || "Failed to remove shared resource.");
		                }
		              }
		              setSelectedTeamPageResourceIds(new Set());
		              await loadTeamPageData();
		            } catch (error) {
		              setTeamPageError(error instanceof Error ? error.message : "Failed to remove selected shared resources.");
		            } finally {
		              setTeamPageActionId("");
		            }
		          }
	          const openTeamShareResourceModal = (resourceType = "") => {
            const normalizedType = String(resourceType || "").trim();
            if (normalizedType) {
              setTeamPageShareResourceType(normalizedType);
              setTeamPageShareResourceId("");
            }
            setTeamPageShareResourcePickerOpen(false);
            setTeamPageShareAccessPickerOpen(false);
            setTeamPageResourceToolbarPopover("");
            setTeamPageResourceMenuId("");
            setTeamPageShareModalOpen(true);
          };
          const openTeamProjectResourceSource = (projectId) => {
            const normalizedProjectId = String(projectId || "").trim();
            if (!normalizedProjectId) {
              return;
            }
            setLatestInteractedProjectId(normalizedProjectId);
            setTasksPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              projectId: normalizedProjectId,
              view: "overview",
              missionControlAction: "",
              projectComposerAction: "",
            });
            setActivePage("tasks");
          };
          const getTeamResourcePrimaryProjectSource = (row) => {
            const sources = Array.isArray(row?.sources) ? row.sources : [];
            return sources.find((source) => source.kind === "project")
              || sources.find((source) => source.kind === "project_access")
              || null;
          };

          function getTeamResourceRowRecord(row) {
            return row?.record && typeof row.record === "object" && !Array.isArray(row.record)
              ? row.record
              : {};
          }

          function getTeamResourceRowResourceId(row) {
            const record = getTeamResourceRowRecord(row);
            const candidates = [
              row?.resourceId,
              row?.directShare?.resourceId,
              record.resourceId,
              record.resource_id,
              record.serverId,
              record.server_id,
              record.webAppId,
              record.web_app_id,
              record.functionId,
              record.function_id,
              record.databaseId,
              record.database_id,
              record.environmentId,
              record.environment_id,
              record.agentId,
              record.agent_id,
              record.workflowId,
              record.workflow_id,
              record.metronomeId,
              record.metronome_id,
              record.id,
            ];
            const directId = candidates.map((value) => String(value || "").trim()).find(Boolean);
            if (directId) {
              return directId;
            }
            const normalizedType = String(row?.type || row?.resourceType || "").trim();
            const rowKey = String(row?.key || "").trim();
            const typePrefix = normalizedType ? normalizedType + ":" : "";
            return typePrefix && rowKey.startsWith(typePrefix)
              ? rowKey.slice(typePrefix.length).trim()
              : rowKey;
          }

          function getTeamResourceRowServerKind(row) {
            const record = getTeamResourceRowRecord(row);
            const normalizedType = normalizePlaygroundServerOverviewKind(row?.type || row?.resourceType || "");
            if (normalizedType) {
              return normalizedType;
            }
            return normalizePlaygroundServerOverviewKind(
              row?.serverKind
              || row?.resourceKind
              || record.kind
              || record.serverKind
              || record.resourceKind
              || record.resourceType
              || record.type
              || ""
            );
          }

          function isTeamResourceTemplateOnlyRow(row) {
            const record = getTeamResourceRowRecord(row);
            const templateId = String(record.templateId || record.template_id || "").trim();
            if (!templateId) {
              return false;
            }
            return ![
              row?.resourceId,
              row?.directShare?.resourceId,
              record.resourceId,
              record.resource_id,
              record.serverId,
              record.server_id,
              record.databaseId,
              record.database_id,
              record.workflowId,
              record.workflow_id,
              record.metronomeId,
              record.metronome_id,
            ].some((value) => String(value || "").trim());
          }

          function openTeamResourceProjectFallback(row) {
            const projectSource = getTeamResourcePrimaryProjectSource(row);
            if (projectSource?.projectId) {
              openTeamProjectResourceSource(projectSource.projectId);
              return true;
            }
            const projectId = String(row?.projectId || getTeamResourceRowRecord(row).projectId || "").trim();
            if (projectId) {
              openTeamProjectResourceSource(projectId);
              return true;
            }
            return false;
          }

          function openTeamResourceFilesRow(row) {
            const record = getTeamResourceRowRecord(row);
            const path = normalizeHistoryPath(
              row?.path
              || record.path
              || record.sourcePath
              || record.workspacePath
              || ""
            );
            const environmentId = String(
              row?.environmentId
              || record.environmentId
              || record.environment_id
              || record.sourceEnvironmentId
              || record.source_environment_id
              || ""
            ).trim();
            if (!path || !environmentId) {
              return false;
            }
            const projectId = String(row?.projectId || record.projectId || "").trim();
            const projectName = String(row?.projectName || record.projectName || "").trim();
            setEnvironmentId(environmentId);
            setFilesPageNavigationRequest({
              token: createPlaygroundPlatformNavigationToken(),
              projectId,
              projectName,
              environmentId,
              path,
              isFolder: Boolean(record.isFolder || record.kind === "folder" || record.mimeType === "inode/directory"),
              contentMode: "files",
            });
            setSidebarWorkspaceMode("work");
            setActivePage("files");
            return true;
          }

`;

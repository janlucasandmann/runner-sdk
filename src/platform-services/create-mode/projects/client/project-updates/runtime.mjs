export const PROJECT_UPDATES_RUNTIME_FRAGMENT = String.raw`
          const PROJECT_OVERVIEW_UPDATE_STATUS_OPTIONS = [
            { value: "on_track", label: "On track", tone: "on-track" },
            { value: "at_risk", label: "At risk", tone: "at-risk" },
            { value: "off_track", label: "Off track", tone: "off-track" },
            { value: "complete", label: "Complete", tone: "complete" },
          ];

          function normalizeProjectOverviewUpdateStatus(value) {
            const normalizedValue = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
            return PROJECT_OVERVIEW_UPDATE_STATUS_OPTIONS.some((option) => option.value === normalizedValue)
              ? normalizedValue
              : "on_track";
          }

          function getProjectOverviewUpdateStatusOption(value) {
            const normalizedValue = normalizeProjectOverviewUpdateStatus(value);
            return PROJECT_OVERVIEW_UPDATE_STATUS_OPTIONS.find((option) => option.value === normalizedValue)
              || PROJECT_OVERVIEW_UPDATE_STATUS_OPTIONS[0];
          }

          function normalizeProjectOverviewUpdateKind(value) {
            const normalizedValue = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
            return ["comment", "project_comment", "discussion"].includes(normalizedValue)
              ? "comment"
              : "update";
          }

          function normalizeProjectOverviewUpdateComment(value, includeReplies = true) {
            if (!value || typeof value !== "object" || Array.isArray(value)) {
              return null;
            }
            const author = value.author && typeof value.author === "object" && !Array.isArray(value.author)
              ? value.author
              : {};
            const body = String(value.body || value.text || value.message || value.content || "").trim();
            if (!body) {
              return null;
            }
            const createdAt = String(value.createdAt || value.created_at || value.timestamp || "").trim();
            const replies = includeReplies
              ? (Array.isArray(value.replies) ? value.replies : [])
                  .map((reply) => normalizeProjectOverviewUpdateComment(reply, false))
                  .filter(Boolean)
                  .sort((left, right) => {
                    const leftTime = Date.parse(left.createdAt || left.updatedAt || "");
                    const rightTime = Date.parse(right.createdAt || right.updatedAt || "");
                    return (Number.isFinite(leftTime) ? leftTime : 0)
                      - (Number.isFinite(rightTime) ? rightTime : 0);
                  })
              : [];
            return {
              id: String(value.id || value.commentId || value.comment_id || "").trim(),
              parentCommentId: String(
                value.parentCommentId
                  || value.parent_comment_id
                  || value.replyToCommentId
                  || ""
              ).trim(),
              body,
              attachments: normalizePlaygroundTaskAttachmentList(value.attachments),
              replies,
              createdAt,
              updatedAt: String(value.updatedAt || value.updated_at || createdAt).trim(),
              authorUserId: String(
                value.authorUserId
                  || value.author_user_id
                  || author.userId
                  || author.user_id
                  || author.id
                  || ""
              ).trim(),
              authorName: String(
                value.authorName
                  || value.actorName
                  || author.name
                  || author.displayName
                  || ""
              ).trim(),
              authorEmail: String(value.authorEmail || author.email || "").trim(),
              authorAvatarUrl: String(
                value.authorAvatarUrl
                  || value.actorAvatarUrl
                  || author.avatarUrl
                  || author.avatar_url
                  || author.photoUrl
                  || ""
              ).trim(),
            };
          }

          function isProjectOverviewUpdateCommentByCurrentUser(comment) {
            const authorUserId = String(comment?.authorUserId || "").trim();
            const viewerUserId = String(currentUserId || "").trim();
            return Boolean(authorUserId && viewerUserId && authorUserId === viewerUserId);
          }

          function normalizeProjectOverviewUpdateReaction(value) {
            if (!value || typeof value !== "object" || Array.isArray(value)) {
              return null;
            }
            const emoji = String(value.emoji || value.reaction || "").trim();
            if (!emoji) {
              return null;
            }
            const userIds = Array.from(new Set(
              (Array.isArray(value.userIds) ? value.userIds : [])
                .map((userId) => String(userId || "").trim())
                .filter(Boolean)
            ));
            const count = Math.max(userIds.length, Number(value.count) || 0);
            return count > 0 ? { emoji, userIds, count } : null;
          }

          function normalizeProjectOverviewUpdateRecord(value) {
            if (typeof value === "string") {
              const body = value.trim();
              return body
                ? {
                    id: "",
                    body,
                    status: "on_track",
                    attachments: [],
                    comments: [],
                    reactions: [],
                    createdAt: "",
                    updatedAt: "",
                    authorUserId: "",
                    authorName: "",
                    authorEmail: "",
                    authorAvatarUrl: "",
                    kind: "update",
                    isSynthetic: false,
                  }
                : null;
            }
            if (!value || typeof value !== "object" || Array.isArray(value)) {
              return null;
            }
            const author = value.author && typeof value.author === "object" && !Array.isArray(value.author)
              ? value.author
              : {};
            const body = String(
              value.body
                || value.text
                || value.message
                || value.content
                || value.markdown
                || ""
            ).trim();
            const createdAt = String(
              value.createdAt
                || value.created_at
                || value.timestamp
                || value.date
                || ""
            ).trim();
            const updatedAt = String(value.updatedAt || value.updated_at || createdAt).trim();
            if (!body && !createdAt) {
              return null;
            }
            return {
              id: String(value.id || value.updateId || value.update_id || "").trim(),
              body,
              status: normalizeProjectOverviewUpdateStatus(value.status || value.health || value.healthStatus),
              attachments: normalizePlaygroundTaskAttachmentList(value.attachments),
              comments: (Array.isArray(value.comments) ? value.comments : [])
                .map(normalizeProjectOverviewUpdateComment)
                .filter(Boolean)
                .sort((left, right) => {
                  const leftTime = Date.parse(left.createdAt || left.updatedAt || "");
                  const rightTime = Date.parse(right.createdAt || right.updatedAt || "");
                  return (Number.isFinite(leftTime) ? leftTime : 0)
                    - (Number.isFinite(rightTime) ? rightTime : 0);
                }),
              reactions: (Array.isArray(value.reactions) ? value.reactions : [])
                .map(normalizeProjectOverviewUpdateReaction)
                .filter(Boolean),
              createdAt,
              updatedAt,
              authorUserId: String(
                value.authorUserId
                  || value.author_user_id
                  || value.actorUserId
                  || author.userId
                  || author.id
                  || ""
              ).trim(),
              authorName: String(
                value.authorName
                  || value.actorName
                  || value.userName
                  || author.name
                  || author.displayName
                  || ""
              ).trim(),
              authorEmail: String(value.authorEmail || author.email || "").trim(),
              authorAvatarUrl: String(
                value.authorAvatarUrl
                  || value.actorAvatarUrl
                  || value.avatarUrl
                  || value.photoUrl
                  || author.avatarUrl
                  || author.photoUrl
                  || ""
              ).trim(),
              kind: normalizeProjectOverviewUpdateKind(
                value.kind
                  || value.eventType
                  || value.event_type
                  || value.type
              ),
              isSynthetic: value.isSynthetic === true,
            };
          }

          function getProjectOverviewUpdateStableId(record, index = 0) {
            const explicitId = String(record?.id || "").trim();
            if (explicitId) return explicitId;
            const seed = [
              record?.createdAt,
              record?.authorUserId,
              record?.authorEmail,
              record?.body,
              index,
            ].map((value) => String(value || "")).join("|");
            let hash = 2166136261;
            for (let characterIndex = 0; characterIndex < seed.length; characterIndex += 1) {
              hash ^= seed.charCodeAt(characterIndex);
              hash = Math.imul(hash, 16777619);
            }
            return "project_update_legacy_" + (hash >>> 0).toString(36);
          }

          function isGenericProjectOverviewIdentityName(value) {
            return ["project owner", "project member", "organization member"].includes(
              String(value || "").trim().toLowerCase()
            );
          }

          function resolveProjectOverviewUpdateAuthorIdentity(value = {}) {
            const activeProjectRecord = projectOverviewDraft || selectedProject || {};
            const activeProjectMetadata = activeProjectRecord?.metadata
              && typeof activeProjectRecord.metadata === "object"
              && !Array.isArray(activeProjectRecord.metadata)
                ? activeProjectRecord.metadata
                : {};
            const normalizedUpdateId = String(value?.id || "").trim().toLowerCase();
            const normalizedUpdateBody = String(value?.body || "").trim().toLowerCase();
            const isProjectCreationUpdate = normalizedUpdateId.startsWith("project_created_")
              || normalizedUpdateBody.endsWith("created this project.")
              || normalizedUpdateBody.endsWith("created the project.");
            const authorUserId = String(
              value?.authorUserId
              || (isProjectCreationUpdate
                ? (
                    activeProjectRecord?.createdByUserId
                    || activeProjectRecord?.creatorUserId
                    || activeProjectMetadata.createdByUserId
                    || activeProjectMetadata.creatorUserId
                    || activeProjectRecord?.ownerUserId
                    || activeProjectMetadata.ownerUserId
                  )
                : "")
              || ""
            ).trim();
            const explicitAuthorName = String(value?.authorName || "").trim();
            const projectCreationAuthorName = String(
              isProjectCreationUpdate
                ? (
                    activeProjectRecord?.createdByName
                    || activeProjectRecord?.creatorName
                    || activeProjectMetadata.createdByName
                    || activeProjectMetadata.creatorName
                    || activeProjectRecord?.ownerName
                    || activeProjectMetadata.ownerName
                    || ""
                  )
                : ""
            ).trim();
            const storedAuthorName = String(
              (isProjectCreationUpdate && isGenericProjectOverviewIdentityName(explicitAuthorName)
                ? projectCreationAuthorName
                : explicitAuthorName)
              || projectCreationAuthorName
              || explicitAuthorName
              || ""
            ).trim();
            const authorEmail = String(
              value?.authorEmail
                || (isProjectCreationUpdate
                  ? (
                      activeProjectRecord?.createdByEmail
                      || activeProjectRecord?.creatorEmail
                      || activeProjectMetadata.createdByEmail
                      || activeProjectMetadata.creatorEmail
                      || activeProjectRecord?.ownerEmail
                      || activeProjectMetadata.ownerEmail
                    )
                  : "")
                || (storedAuthorName.includes("@") ? storedAuthorName : "")
                || ""
            ).trim();
            const viewerUserId = String(currentUserId || "").trim();
            const viewerEmail = String(currentUserEmail || "").trim().toLowerCase();
            const isCurrentUser = Boolean(
              (authorUserId && viewerUserId && authorUserId === viewerUserId)
              || (authorEmail && viewerEmail && authorEmail.toLowerCase() === viewerEmail)
            );
            let workspaceMember = typeof getTaskWorkspaceMemberByUserId === "function"
              ? getTaskWorkspaceMemberByUserId(authorUserId)
              : null;
            if (
              !workspaceMember
              && authorEmail
              && Array.isArray(workspaceTeamMembers)
              && typeof readTaskCommentMemberIdentityValue === "function"
            ) {
              workspaceMember = workspaceTeamMembers.find((member) => (
                readTaskCommentMemberIdentityValue(member, [
                  "email",
                  "emailAddress",
                  "email_address",
                ]).toLowerCase() === authorEmail.toLowerCase()
              )) || null;
            }
            const readMemberValue = (keys) => (
              typeof readTaskCommentMemberIdentityValue === "function"
                ? readTaskCommentMemberIdentityValue(workspaceMember, keys)
                : ""
            );
            const ownerCandidate = projectOverviewOwnerCandidatesState?.projectId === String(activeProjectRecord?.id || "").trim()
              && Array.isArray(projectOverviewOwnerCandidatesState?.items)
                ? projectOverviewOwnerCandidatesState.items.find((candidate) => {
                    const candidateUserId = String(candidate?.userId || candidate?.id || "").trim();
                    const candidateEmail = String(candidate?.email || "").trim().toLowerCase();
                    return (authorUserId && candidateUserId === authorUserId)
                      || (authorEmail && candidateEmail === authorEmail.toLowerCase());
                  }) || null
                : null;
            const memberName = readMemberValue([
              "displayName",
              "display_name",
              "name",
              "fullName",
              "full_name",
            ]) || String(ownerCandidate?.name || ownerCandidate?.displayName || "").trim();
            const memberAvatarUrl = readMemberValue([
              "photoURL",
              "photoUrl",
              "photo_url",
              "avatarURL",
              "avatarUrl",
              "avatar_url",
              "avatar",
              "picture",
              "imageUrl",
              "image_url",
            ]) || String(
              ownerCandidate?.avatarUrl
                || ownerCandidate?.photoUrl
                || ownerCandidate?.photoURL
                || ""
            ).trim();
            const rawName = String(
              (isCurrentUser ? currentUserName : "")
                || memberName
                || (storedAuthorName.includes("@") ? "" : storedAuthorName)
                || ""
            ).trim();
            const fallbackNameSource = rawName || authorEmail;
            const derivedName = fallbackNameSource.includes("@")
              ? fallbackNameSource
                  .split("@")[0]
                  .replace(/[._-]+/g, " ")
                  .replace(/\b\w/g, (character) => character.toUpperCase())
              : fallbackNameSource;
            const name = typeof formatAccountDisplayName === "function"
              ? formatAccountDisplayName(rawName, authorEmail, derivedName || "Project member")
              : (derivedName || "Project member");
            const rawAvatarUrl = String(
              (isCurrentUser ? currentUserAvatarUrl : "")
                || memberAvatarUrl
                || value?.authorAvatarUrl
                || (isProjectCreationUpdate
                  ? (
                      activeProjectRecord?.createdByAvatarUrl
                      || activeProjectMetadata.createdByAvatarUrl
                      || activeProjectRecord?.ownerAvatarUrl
                      || activeProjectMetadata.ownerAvatarUrl
                    )
                  : "")
                || ""
            ).trim();
            return {
              userId: authorUserId,
              name,
              email: authorEmail,
              avatarUrl: typeof normalizeSessionPhotoUrl === "function"
                ? normalizeSessionPhotoUrl(rawAvatarUrl)
                : rawAvatarUrl,
            };
          }

          function getProjectOverviewCreationUpdate(projectRecord = projectOverviewDraft || selectedProject) {
            const projectId = String(projectRecord?.id || "").trim();
            if (!projectId) {
              return null;
            }
            const metadata = projectRecord?.metadata
              && typeof projectRecord.metadata === "object"
              && !Array.isArray(projectRecord.metadata)
                ? projectRecord.metadata
                : {};
            const storedUpdateCandidates = [
              ...(Array.isArray(metadata.projectUpdates) ? metadata.projectUpdates : []),
              ...(Array.isArray(projectRecord?.projectUpdates) ? projectRecord.projectUpdates : []),
              metadata.latestUpdate,
              projectRecord?.latestUpdate,
            ].filter((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate));
            const hasStoredCreationUpdate = storedUpdateCandidates.some((candidate) => {
              const candidateId = String(candidate.id || candidate.updateId || candidate.update_id || "").trim().toLowerCase();
              const candidateKind = String(candidate.kind || candidate.eventType || candidate.event_type || candidate.type || "")
                .trim()
                .toLowerCase()
                .replace(/[\s-]+/g, "_");
              const candidateBody = String(candidate.body || candidate.text || candidate.message || candidate.content || "")
                .trim()
                .toLowerCase();
              return candidateId.startsWith("project_created_")
                || candidateKind === "project_created"
                || candidateBody.endsWith("created this project.")
                || candidateBody.endsWith("created the project.");
            });
            if (hasStoredCreationUpdate) {
              return null;
            }
            const identityCandidates = [
              projectRecord?.createdBy,
              projectRecord?.creator,
              metadata.createdBy,
              metadata.creator,
              projectRecord?.owner,
              metadata.owner,
            ].filter((candidate) => (
              candidate
              && typeof candidate === "object"
              && !Array.isArray(candidate)
            ));
            const readIdentityValue = (keys, fallbackValues = []) => {
              for (const candidate of identityCandidates) {
                for (const key of keys) {
                  const value = String(candidate?.[key] || "").trim();
                  if (value) return value;
                }
              }
              for (const fallbackValue of fallbackValues) {
                const value = String(fallbackValue || "").trim();
                if (value) return value;
              }
              return "";
            };
            const authorUserId = readIdentityValue(
              ["userId", "user_id", "id", "uid"],
              [
                projectRecord?.createdByUserId,
                projectRecord?.creatorUserId,
                metadata.createdByUserId,
                metadata.creatorUserId,
                projectRecord?.ownerUserId,
                metadata.ownerUserId,
              ]
            );
            const authorName = readIdentityValue(
              ["name", "displayName", "display_name"],
              [
                projectRecord?.createdByName,
                projectRecord?.creatorName,
                metadata.createdByName,
                metadata.creatorName,
                projectRecord?.ownerName,
                metadata.ownerName,
                projectRecord?.leadName,
                metadata.leadName,
              ]
            );
            const authorEmail = readIdentityValue(
              ["email"],
              [
                projectRecord?.createdByEmail,
                projectRecord?.creatorEmail,
                metadata.createdByEmail,
                metadata.creatorEmail,
                projectRecord?.ownerEmail,
                metadata.ownerEmail,
              ]
            );
            const authorAvatarUrl = readIdentityValue(
              ["avatarUrl", "avatar_url", "photoUrl", "photo_url", "picture"],
              [
                projectRecord?.createdByAvatarUrl,
                projectRecord?.creatorAvatarUrl,
                metadata.createdByAvatarUrl,
                metadata.creatorAvatarUrl,
                projectRecord?.ownerAvatarUrl,
                metadata.ownerAvatarUrl,
              ]
            );
            const rawCreatedAt = projectRecord?.createdAt || metadata.createdAt || "";
            const numericCreatedAt = Number(rawCreatedAt);
            const createdAt = Number.isFinite(numericCreatedAt) && numericCreatedAt > 0
              ? new Date(numericCreatedAt < 100000000000 ? numericCreatedAt * 1000 : numericCreatedAt).toISOString()
              : String(rawCreatedAt || "").trim();
            if (!createdAt || !Number.isFinite(Date.parse(createdAt))) {
              return null;
            }
            const authorIdentity = resolveProjectOverviewUpdateAuthorIdentity({
              authorUserId,
              authorName,
              authorEmail,
              authorAvatarUrl,
            });
            const normalizedAuthorName = String(authorIdentity.name || "").trim().toLowerCase();
            if (
              !authorIdentity.userId
              && !authorIdentity.email
              && (!normalizedAuthorName || isGenericProjectOverviewIdentityName(normalizedAuthorName))
            ) {
              return null;
            }
            return {
              id: "project_created_" + projectId,
              body: authorIdentity.name + " created this project.",
              status: "on_track",
              attachments: [],
              comments: [],
              reactions: [],
              createdAt,
              updatedAt: createdAt,
              authorUserId: authorIdentity.userId,
              authorName: authorIdentity.name,
              authorEmail: authorIdentity.email,
              authorAvatarUrl: authorIdentity.avatarUrl,
              kind: "project_created",
              isSynthetic: false,
            };
          }

          function getProjectOverviewUpdateRecords(projectRecord = projectOverviewDraft || selectedProject) {
            const metadata = projectRecord?.metadata
              && typeof projectRecord.metadata === "object"
              && !Array.isArray(projectRecord.metadata)
                ? projectRecord.metadata
                : {};
            const candidates = [];
            if (Array.isArray(metadata.projectUpdates)) {
              candidates.push(...metadata.projectUpdates);
            }
            if (Array.isArray(projectRecord?.projectUpdates)) {
              candidates.push(...projectRecord.projectUpdates);
            }
            if (metadata.latestUpdate) {
              candidates.push(metadata.latestUpdate);
            }
            if (projectRecord?.latestUpdate) {
              candidates.push(projectRecord.latestUpdate);
            }
            const seen = new Set();
            return candidates
              .map((candidate, index) => {
                const record = normalizeProjectOverviewUpdateRecord(candidate);
                return record
                  ? { ...record, id: getProjectOverviewUpdateStableId(record, index) }
                  : null;
              })
              .filter((record) => {
                if (!record?.body) return false;
                const key = record.id
                  || [record.createdAt, record.authorUserId, record.body].join(":");
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              })
              .sort((left, right) => {
                const leftTime = Date.parse(left.createdAt || left.updatedAt || "");
                const rightTime = Date.parse(right.createdAt || right.updatedAt || "");
                return (Number.isFinite(rightTime) ? rightTime : 0)
                  - (Number.isFinite(leftTime) ? leftTime : 0);
              });
          }

          function getProjectOverviewUpdateRecordById(updateId) {
            const normalizedUpdateId = String(updateId || "").trim();
            if (!normalizedUpdateId) {
              return null;
            }
            const storedUpdate = getProjectOverviewUpdateRecords().find(
              (record) => record.id === normalizedUpdateId
            );
            if (storedUpdate) {
              return storedUpdate;
            }
            const creationUpdate = getProjectOverviewCreationUpdate();
            return creationUpdate?.id === normalizedUpdateId
              ? creationUpdate
              : null;
          }

          function buildProjectOverviewUpdateActivityEvents() {
            return getProjectOverviewUpdateRecords().map((record, index) => {
              const authorIdentity = resolveProjectOverviewUpdateAuthorIdentity(record);
              return {
                id: record.id || "project-update-" + index + "-" + String(record.createdAt || ""),
                eventType: "project_update_posted",
                createdAt: record.createdAt || record.updatedAt,
                actorType: "user",
                actorUserId: authorIdentity.userId,
                actorName: authorIdentity.name,
                actorAvatarUrl: authorIdentity.avatarUrl,
                projectUpdate: record,
              };
            });
          }

          function createProjectOverviewUpdateClientRecord(draft) {
            const now = new Date().toISOString();
            const randomPart = Math.random().toString(36).slice(2, 10);
            const authorIdentity = resolveProjectOverviewUpdateAuthorIdentity({
              authorUserId: currentUserId,
              authorName: currentUserName,
              authorEmail: currentUserEmail,
              authorAvatarUrl: currentUserAvatarUrl,
            });
            return {
              id: "project_update_" + Date.now().toString(36) + randomPart,
              body: String(draft?.body || "").trim(),
              kind: normalizeProjectOverviewUpdateKind(draft?.kind),
              status: normalizeProjectOverviewUpdateStatus(draft?.status),
              attachments: normalizePlaygroundTaskAttachmentList(draft?.attachments),
              comments: [],
              reactions: [],
              createdAt: now,
              updatedAt: now,
              authorUserId: authorIdentity.userId,
              authorName: authorIdentity.name,
              authorEmail: authorIdentity.email,
              authorAvatarUrl: authorIdentity.avatarUrl,
            };
          }

          function openProjectOverviewUpdateComposer() {
            setProjectOverviewUpdateComposerState({
              open: true,
              isSaving: false,
              error: "",
              draft: {
                body: "",
                kind: "update",
                status: "on_track",
                attachments: [],
                mentions: [],
              },
            });
          }

          function closeProjectOverviewUpdateComposer() {
            setProjectOverviewUpdateComposerState((current) => (
              current?.isSaving
                ? current
                : {
                    open: false,
                    isSaving: false,
                    error: "",
                    draft: {
                      body: "",
                      kind: "update",
                      status: "on_track",
                      attachments: [],
                      mentions: [],
                    },
                  }
            ));
          }

          function updateProjectOverviewUpdateDraft(updates) {
            setProjectOverviewUpdateComposerState((current) => ({
              ...current,
              error: "",
              draft: {
                ...(current?.draft || {}),
                ...(typeof updates === "function"
                  ? updates(current?.draft || {})
                  : updates),
              },
            }));
          }

          function getProjectOverviewUpdateUploadedAttachments(context) {
            return normalizePlaygroundTaskAttachmentList(
              (Array.isArray(context?.uploadedFiles) ? context.uploadedFiles : [])
                .map((file) => file?.metadata?.taskAttachment)
                .filter(Boolean)
            );
          }

          function handleProjectOverviewUpdateEditorChange(nextValue, context = {}) {
            updateProjectOverviewUpdateDraft((current) => {
              const currentAttachments = normalizePlaygroundTaskAttachmentList(current?.attachments);
              const uploadedAttachments = getProjectOverviewUpdateUploadedAttachments(context);
              const candidateAttachments = normalizePlaygroundTaskAttachmentList(
                currentAttachments.concat(uploadedAttachments)
              );
              return {
                ...current,
                body: String(nextValue || ""),
                attachments: reconcileTaskDescriptionAttachments(
                  String(nextValue || ""),
                  candidateAttachments
                ),
              };
            });
          }

          async function uploadProjectOverviewUpdateFiles(files) {
            const environmentId = typeof getPlaygroundProjectDefaultEnvironmentId === "function"
              ? getPlaygroundProjectDefaultEnvironmentId(projectOverviewDraft || selectedProject)
              : String(selectedProject?.defaultEnvironmentId || "").trim();
            const uploadedAttachments = await uploadTaskAttachmentFiles(files, {
              environmentId,
              allowWithoutEnvironment: true,
            });
            return buildTaskDescriptionUploadedFiles(uploadedAttachments);
          }

          function handleRenameProjectOverviewUpdateFile(file, nextName) {
            const attachmentId = String(file?.attachmentId || "").trim();
            const normalizedName = String(nextName || "").trim();
            if (!attachmentId || !normalizedName) return;
            updateProjectOverviewUpdateDraft((current) => ({
              ...current,
              attachments: normalizePlaygroundTaskAttachmentList(current?.attachments).map((attachment) =>
                attachment.id === attachmentId
                  ? { ...attachment, filename: normalizedName }
                  : attachment
              ),
            }));
          }

          function handleRemoveProjectOverviewUpdateFile(file) {
            const attachmentId = String(file?.attachmentId || "").trim();
            if (!attachmentId) return;
            updateProjectOverviewUpdateDraft((current) => ({
              ...current,
              attachments: normalizePlaygroundTaskAttachmentList(current?.attachments).filter(
                (attachment) => attachment.id !== attachmentId
              ),
            }));
          }

          async function persistProjectOverviewUpdateFallback(record) {
            const existingRecords = getProjectOverviewUpdateRecords();
            const projectUpdates = [record]
              .concat(existingRecords.filter((entry) => entry.id !== record.id))
              .slice(0, 100);
            return persistProjectOverviewSidebarProjectUpdate({}, {
              projectUpdates,
              latestUpdate: record,
            });
          }

          async function postProjectOverviewUpdate(event, options = {}) {
            event?.preventDefault?.();
            const draft = projectOverviewUpdateComposerState?.draft || {};
            const body = String(draft.body || "").trim();
            const submissionKind = normalizeProjectOverviewUpdateKind(options.kind || draft.kind);
            const projectId = String(selectedProjectId || selectedProject?.id || "").trim();
            if (!body || !projectId || projectOverviewUpdateComposerState?.isSaving) {
              if (!body) {
                setProjectOverviewUpdateComposerState((current) => ({
                  ...current,
                  error: submissionKind === "comment"
                    ? "Write a comment before posting."
                    : "Write an update before posting.",
                }));
              }
              return false;
            }
            setProjectOverviewUpdateComposerState((current) => ({
              ...current,
              isSaving: true,
              error: "",
            }));
            try {
              const uploadedFiles = Array.isArray(options.files) && options.files.length
                ? await uploadProjectOverviewUpdateFiles(options.files)
                : [];
              const submissionAttachments = normalizePlaygroundTaskAttachmentList(
                normalizePlaygroundTaskAttachmentList(draft.attachments).concat(
                  getProjectOverviewUpdateUploadedAttachments({ uploadedFiles })
                )
              );
              const clientRecord = createProjectOverviewUpdateClientRecord({
                ...draft,
                kind: submissionKind,
                attachments: submissionAttachments,
              });
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(
                backendUrl + "/projects/" + encodeURIComponent(projectId) + "/updates",
                {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    idempotencyKey: clientRecord.id,
                    body: clientRecord.body,
                    kind: clientRecord.kind,
                    status: clientRecord.status,
                    attachments: clientRecord.attachments,
                    mentions: Array.isArray(options.mentions)
                      ? options.mentions
                      : Array.isArray(draft.mentions)
                        ? draft.mentions
                        : [],
                  }),
                }
              );
              let data = {};
              const responseText = await response.text();
              if (responseText) {
                try {
                  data = JSON.parse(responseText);
                } catch {}
              }
              if (!response.ok && response.status !== 404 && response.status !== 405) {
                throw new Error(data?.message || data?.error || "Failed to post project update.");
              }
              if (response.ok) {
                reconcileProjectMentionDispatches(data, {
                  project: selectedProject,
                  projectId,
                  body: clientRecord.body,
                  source: {
                    type: "project_update",
                    updateId: data?.update?.id || clientRecord.id,
                  },
                });
              }
              let updatedProject = null;
              if (response.ok) {
                const updateRecord = {
                  ...(normalizeProjectOverviewUpdateRecord(data?.update) || clientRecord),
                  kind: clientRecord.kind,
                };
                const responseProject = getPlaygroundProjectResponseRecord(data, null);
                if (responseProject?.id) {
                  commitProjectOverviewSidebarProjectRecord(responseProject);
                  const requiresKindReconciliation = submissionKind === "comment"
                    || getProjectOverviewUpdateRecords().some(
                      (record) => normalizeProjectOverviewUpdateKind(record.kind) === "comment"
                    );
                  updatedProject = requiresKindReconciliation
                    ? await persistProjectOverviewUpdateFallback(updateRecord)
                    : responseProject;
                } else {
                  updatedProject = await persistProjectOverviewUpdateFallback(updateRecord);
                }
              } else {
                updatedProject = await persistProjectOverviewUpdateFallback(clientRecord);
              }
              if (!updatedProject?.id) {
                throw new Error("Failed to post project update.");
              }
              setProjectOverviewUpdateComposerState({
                open: false,
                isSaving: false,
                error: "",
                draft: {
                  body: "",
                  kind: options.preserveKind === true ? submissionKind : "update",
                  status: "on_track",
                  attachments: [],
                  mentions: [],
                },
              });
              return true;
            } catch (error) {
              setProjectOverviewUpdateComposerState((current) => ({
                ...current,
                isSaving: false,
                error: error instanceof Error
                  ? error.message
                  : submissionKind === "comment"
                    ? "Failed to post project comment."
                    : "Failed to post project update.",
              }));
              return false;
            }
          }

          function buildProjectOverviewUpdateMutationRecord(updateId, mutation) {
            const currentRecord = getProjectOverviewUpdateRecordById(updateId);
            if (!currentRecord) {
              return null;
            }
            return normalizeProjectOverviewUpdateRecord({
              ...currentRecord,
              ...(typeof mutation === "function" ? mutation(currentRecord) : mutation),
              id: currentRecord.id,
              updatedAt: new Date().toISOString(),
            });
          }

          function commitProjectOverviewUpdateLocalRecord(nextUpdate) {
            if (!nextUpdate?.id) return null;
            const baseProject = normalizePlaygroundProjectRecord(projectOverviewDraft || selectedProject);
            const currentRecords = getProjectOverviewUpdateRecords(baseProject);
            const nextRecords = currentRecords
              .map((record) => record.id === nextUpdate.id ? nextUpdate : record)
              .concat(currentRecords.some((record) => record.id === nextUpdate.id) ? [] : [nextUpdate])
              .sort((left, right) => {
                const leftTime = Date.parse(left.createdAt || left.updatedAt || "");
                const rightTime = Date.parse(right.createdAt || right.updatedAt || "");
                return (Number.isFinite(rightTime) ? rightTime : 0)
                  - (Number.isFinite(leftTime) ? leftTime : 0);
              })
              .slice(0, 100);
            const metadata = baseProject?.metadata
              && typeof baseProject.metadata === "object"
              && !Array.isArray(baseProject.metadata)
                ? baseProject.metadata
                : {};
            const nextProject = normalizePlaygroundProjectRecord({
              ...baseProject,
              metadata: {
                ...metadata,
                projectUpdates: nextRecords,
                latestUpdate: nextRecords[0] || null,
              },
            });
            commitProjectOverviewSidebarProjectRecord(nextProject);
            return nextProject;
          }

          async function persistProjectOverviewUpdateMutationFallback(nextUpdate) {
            const materializedUpdate = normalizeProjectOverviewUpdateRecord({
              ...nextUpdate,
              isSynthetic: false,
            });
            const nextProject = commitProjectOverviewUpdateLocalRecord(materializedUpdate);
            if (!nextProject?.id) return null;
            const metadata = nextProject.metadata
              && typeof nextProject.metadata === "object"
              && !Array.isArray(nextProject.metadata)
                ? nextProject.metadata
                : {};
            return persistProjectOverviewSidebarProjectUpdate({}, {
              projectUpdates: metadata.projectUpdates || [],
              latestUpdate: metadata.latestUpdate || null,
            });
          }

          async function applyProjectOverviewUpdateMutationResponse(data, fallbackUpdate) {
            const responseProject = getPlaygroundProjectResponseRecord(data, null);
            if (responseProject?.id) {
              commitProjectOverviewSidebarProjectRecord(responseProject);
              return responseProject;
            }
            const responseUpdate = normalizeProjectOverviewUpdateRecord(data?.update) || fallbackUpdate;
            return responseUpdate?.id
              ? persistProjectOverviewUpdateMutationFallback(responseUpdate)
              : null;
          }

          function setProjectOverviewUpdateCommentOpen(updateId, open) {
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: String(updateId || "").trim(),
              commentOpen: Boolean(open),
              emojiOpen: false,
              error: "",
            }));
          }

          function setProjectOverviewUpdateEmojiOpen(updateId, open) {
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: String(updateId || "").trim(),
              emojiOpen: Boolean(open),
              commentOpen: current.updateId === String(updateId || "").trim()
                ? current.commentOpen
                : false,
              error: "",
            }));
          }

          async function persistProjectOverviewUpdateComment({
            updateId,
            body: rawBody,
            files = [],
            parentCommentId = "",
            mentions = [],
            throwOnError = false,
          }) {
            const normalizedUpdateId = String(updateId || "").trim();
            const normalizedParentCommentId = String(parentCommentId || "").trim();
            const body = String(rawBody || "").trim();
            const projectId = String(selectedProjectId || selectedProject?.id || "").trim();
            if (!normalizedUpdateId || !projectId || !body || projectOverviewUpdateInteractionState?.isSaving) {
              if (throwOnError) {
                throw new Error("The reply could not be added.");
              }
              return false;
            }
            const now = new Date().toISOString();
            const clientCommentId = "project_update_comment_" + Date.now().toString(36)
              + Math.random().toString(36).slice(2, 10);
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: normalizedUpdateId,
              isSaving: true,
              error: "",
            }));
            try {
              const environmentId = typeof getPlaygroundProjectDefaultEnvironmentId === "function"
                ? getPlaygroundProjectDefaultEnvironmentId(projectOverviewDraft || selectedProject)
                : String(selectedProject?.defaultEnvironmentId || "").trim();
              const uploadedAttachments = files.length
                ? await uploadTaskAttachmentFiles(files, {
                    environmentId,
                    allowWithoutEnvironment: true,
                  })
                : [];
              const attachments = normalizePlaygroundTaskAttachmentList(uploadedAttachments);
              const commentAuthorIdentity = resolveProjectOverviewUpdateAuthorIdentity({
                authorUserId: currentUserId,
                authorName: currentUserName,
                authorEmail: currentUserEmail,
                authorAvatarUrl: currentUserAvatarUrl,
              });
              const clientComment = normalizeProjectOverviewUpdateComment({
                id: clientCommentId,
                parentCommentId: normalizedParentCommentId,
                body,
                attachments,
                replies: [],
                createdAt: now,
                updatedAt: now,
                author: {
                  userId: commentAuthorIdentity.userId,
                  name: commentAuthorIdentity.name,
                  email: commentAuthorIdentity.email,
                  avatarUrl: commentAuthorIdentity.avatarUrl,
                },
              }, false);
              let parentCommentFound = !normalizedParentCommentId;
              const fallbackUpdate = buildProjectOverviewUpdateMutationRecord(normalizedUpdateId, (current) => {
                const comments = Array.isArray(current.comments) ? current.comments : [];
                if (!normalizedParentCommentId) {
                  return {
                    comments: comments.concat(clientComment ? [clientComment] : []),
                  };
                }
                return {
                  comments: comments.map((comment) => {
                    if (comment.id !== normalizedParentCommentId) {
                      return comment;
                    }
                    parentCommentFound = true;
                    return {
                      ...comment,
                      replies: (Array.isArray(comment.replies) ? comment.replies : []).concat(
                        clientComment ? [clientComment] : []
                      ),
                    };
                  }),
                };
              });
              if (!fallbackUpdate || !clientComment || !parentCommentFound) {
                throw new Error("Project update is unavailable.");
              }
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(
                backendUrl + "/projects/" + encodeURIComponent(projectId)
                  + "/updates/" + encodeURIComponent(normalizedUpdateId) + "/comments",
                {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    idempotencyKey: clientCommentId,
                    body,
                    attachments,
                    mentions: Array.isArray(mentions) ? mentions : [],
                    ...(normalizedParentCommentId
                      ? { parentCommentId: normalizedParentCommentId }
                      : {}),
                  }),
                }
              );
              let data = {};
              const responseText = await response.text();
              if (responseText) {
                try {
                  data = JSON.parse(responseText);
                } catch {}
              }
              if (!response.ok && response.status !== 404 && response.status !== 405) {
                throw new Error(
                  data?.message
                    || data?.error
                    || (normalizedParentCommentId
                      ? "Failed to add reply."
                      : "Failed to add comment.")
                );
              }
              if (response.ok) {
                reconcileProjectMentionDispatches(data, {
                  project: selectedProject,
                  projectId,
                  body,
                  source: {
                    type: "project_update_comment",
                    updateId: normalizedUpdateId,
                    commentId: data?.comment?.id || clientCommentId,
                    ...(normalizedParentCommentId
                      ? { parentCommentId: normalizedParentCommentId }
                      : {}),
                  },
                });
              }
              const updatedProject = response.ok
                ? await applyProjectOverviewUpdateMutationResponse(data, fallbackUpdate)
                : await persistProjectOverviewUpdateMutationFallback(fallbackUpdate);
              if (!updatedProject?.id) {
                throw new Error(
                  normalizedParentCommentId
                    ? "Failed to add reply."
                    : "Failed to add comment."
                );
              }
              setProjectOverviewUpdateInteractionState((current) => ({
                ...current,
                updateId: normalizedUpdateId,
                commentValue: "",
                commentOpen: false,
                isSaving: false,
                error: "",
              }));
              return true;
            } catch (error) {
              const errorMessage = error instanceof Error
                ? error.message
                : normalizedParentCommentId
                  ? "Failed to add reply."
                  : "Failed to add comment.";
              setProjectOverviewUpdateInteractionState((current) => ({
                ...current,
                updateId: normalizedUpdateId,
                isSaving: false,
                error: throwOnError ? "" : errorMessage,
              }));
              if (throwOnError) {
                throw new Error(errorMessage);
              }
              return false;
            }
          }

          async function postProjectOverviewUpdateComment(
            updateId,
            files = [],
            mentions = [],
            submittedBody = ""
          ) {
            return persistProjectOverviewUpdateComment({
              updateId,
              body: submittedBody || projectOverviewUpdateInteractionState?.commentValue || "",
              files,
              mentions,
            });
          }

          async function postProjectOverviewUpdateReply(updateId, parentCommentId, body, mentions = []) {
            return persistProjectOverviewUpdateComment({
              updateId,
              parentCommentId,
              body,
              mentions,
              throwOnError: true,
            });
          }

          async function mutateProjectOverviewUpdateComment({
            updateId,
            commentId,
            operation,
            body: rawBody = "",
          }) {
            const normalizedUpdateId = String(updateId || "").trim();
            const normalizedCommentId = String(commentId || "").trim();
            const projectId = String(selectedProjectId || selectedProject?.id || "").trim();
            const body = String(rawBody || "").trim();
            if (
              !normalizedUpdateId
              || !normalizedCommentId
              || !projectId
              || (operation === "edit" && !body)
              || projectOverviewUpdateInteractionState?.isSaving
            ) {
              throw new Error(
                operation === "delete"
                  ? "The comment could not be deleted."
                  : "The comment could not be updated."
              );
            }
            const currentRecord = getProjectOverviewUpdateRecordById(normalizedUpdateId);
            const currentComment = (Array.isArray(currentRecord?.comments)
              ? currentRecord.comments
              : []
            ).find((comment) => comment.id === normalizedCommentId);
            if (!currentRecord || !currentComment) {
              throw new Error("The comment is no longer available.");
            }
            if (!isProjectOverviewUpdateCommentByCurrentUser(currentComment)) {
              throw new Error("Only the comment author can change this comment.");
            }

            const now = new Date().toISOString();
            const optimisticUpdate = buildProjectOverviewUpdateMutationRecord(
              normalizedUpdateId,
              (record) => {
                const comments = Array.isArray(record.comments) ? record.comments : [];
                return {
                  comments: operation === "delete"
                    ? comments.filter((comment) => comment.id !== normalizedCommentId)
                    : comments.map((comment) => comment.id === normalizedCommentId
                      ? { ...comment, body, updatedAt: now }
                      : comment),
                };
              }
            );
            if (!optimisticUpdate) {
              throw new Error("Project update is unavailable.");
            }

            commitProjectOverviewUpdateLocalRecord(optimisticUpdate);
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: normalizedUpdateId,
              isSaving: true,
              error: "",
            }));
            try {
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(
                backendUrl + "/projects/" + encodeURIComponent(projectId)
                  + "/updates/" + encodeURIComponent(normalizedUpdateId)
                  + "/comments/" + encodeURIComponent(normalizedCommentId),
                {
                  method: operation === "delete" ? "DELETE" : "PATCH",
                  headers,
                  ...(operation === "edit"
                    ? { body: JSON.stringify({ body }) }
                    : {}),
                }
              );
              let data = {};
              const responseText = await response.text();
              if (responseText) {
                try {
                  data = JSON.parse(responseText);
                } catch {}
              }
              if (!response.ok && response.status !== 404 && response.status !== 405) {
                throw new Error(
                  data?.message
                    || data?.error
                    || (operation === "delete"
                      ? "Failed to delete comment."
                      : "Failed to update comment.")
                );
              }
              const updatedProject = response.ok
                ? await applyProjectOverviewUpdateMutationResponse(data, optimisticUpdate)
                : await persistProjectOverviewUpdateMutationFallback(optimisticUpdate);
              if (!updatedProject?.id) {
                throw new Error(
                  operation === "delete"
                    ? "Failed to delete comment."
                    : "Failed to update comment."
                );
              }
              setProjectOverviewUpdateInteractionState((current) => ({
                ...current,
                updateId: normalizedUpdateId,
                isSaving: false,
                error: "",
              }));
              return true;
            } catch (error) {
              commitProjectOverviewUpdateLocalRecord(currentRecord);
              setProjectOverviewUpdateInteractionState((current) => ({
                ...current,
                updateId: normalizedUpdateId,
                isSaving: false,
                error: "",
              }));
              throw error instanceof Error
                ? error
                : new Error(
                    operation === "delete"
                      ? "Failed to delete comment."
                      : "Failed to update comment."
                  );
            }
          }

          function editProjectOverviewUpdateComment(updateId, commentId, body) {
            return mutateProjectOverviewUpdateComment({
              updateId,
              commentId,
              operation: "edit",
              body,
            });
          }

          function deleteProjectOverviewUpdateComment(updateId, commentId) {
            return mutateProjectOverviewUpdateComment({
              updateId,
              commentId,
              operation: "delete",
            });
          }

          async function toggleProjectOverviewUpdateReaction(updateId, emoji) {
            const normalizedUpdateId = String(updateId || "").trim();
            const normalizedEmoji = String(emoji || "").trim();
            const projectId = String(selectedProjectId || selectedProject?.id || "").trim();
            if (!normalizedUpdateId || !normalizedEmoji || !projectId) return;
            const currentRecord = getProjectOverviewUpdateRecordById(normalizedUpdateId);
            if (!currentRecord) return;
            const previousRecord = currentRecord;
            const currentReactions = Array.isArray(currentRecord.reactions) ? currentRecord.reactions : [];
            const existingReaction = currentReactions.find(
              (reaction) => reaction.emoji === normalizedEmoji
            );
            const currentReactionUserIds = new Set(
              Array.isArray(existingReaction?.userIds) ? existingReaction.userIds : []
            );
            if (currentReactionUserIds.has(currentUserId)) {
              currentReactionUserIds.delete(currentUserId);
            } else {
              currentReactionUserIds.add(currentUserId);
            }
            const nextReaction = normalizeProjectOverviewUpdateReaction({
              emoji: normalizedEmoji,
              userIds: Array.from(currentReactionUserIds),
            });
            const optimisticUpdate = buildProjectOverviewUpdateMutationRecord(normalizedUpdateId, {
              reactions: currentReactions
                .filter((reaction) => reaction.emoji !== normalizedEmoji)
                .concat(nextReaction ? [nextReaction] : []),
            });
            if (!optimisticUpdate) return;
            commitProjectOverviewUpdateLocalRecord(optimisticUpdate);
            setProjectOverviewUpdateInteractionState((current) => ({
              ...current,
              updateId: normalizedUpdateId,
              emojiOpen: false,
              reactionSaving: normalizedEmoji,
              error: "",
            }));
            try {
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(
                backendUrl + "/projects/" + encodeURIComponent(projectId)
                  + "/updates/" + encodeURIComponent(normalizedUpdateId) + "/reactions",
                {
                  method: "PUT",
                  headers,
                  body: JSON.stringify({ emoji: normalizedEmoji }),
                }
              );
              let data = {};
              const responseText = await response.text();
              if (responseText) {
                try {
                  data = JSON.parse(responseText);
                } catch {}
              }
              if (!response.ok && response.status !== 404 && response.status !== 405) {
                throw new Error(data?.message || data?.error || "Failed to update reaction.");
              }
              const updatedProject = response.ok
                ? await applyProjectOverviewUpdateMutationResponse(data, optimisticUpdate)
                : await persistProjectOverviewUpdateMutationFallback(optimisticUpdate);
              if (!updatedProject?.id) {
                throw new Error("Failed to update reaction.");
              }
              setProjectOverviewUpdateInteractionState((current) => ({
                ...current,
                reactionSaving: "",
                error: "",
              }));
            } catch (error) {
              commitProjectOverviewUpdateLocalRecord(previousRecord);
              setProjectOverviewUpdateInteractionState((current) => ({
                ...current,
                reactionSaving: "",
                error: error instanceof Error ? error.message : "Failed to update reaction.",
              }));
            }
          }

          function renderProjectOverviewUpdateStatus(status, className = "") {
            const option = getProjectOverviewUpdateStatusOption(status);
            return React.createElement("span", {
                className: (
                  "platform-project-update-status is-" + option.tone + (className ? " " + className : "")
                ).trim(),
              },
              React.createElement("span", {
                className: "platform-project-update-status__icon",
                "aria-hidden": "true",
              }, React.createElement(CircleCheckBig, { width: 14, height: 14, strokeWidth: 2 })),
              React.createElement("span", null, option.label)
            );
          }

          function renderProjectOverviewUpdateComposerModal() {
            const draft = projectOverviewUpdateComposerState?.draft || {};
            const statusOption = getProjectOverviewUpdateStatusOption(draft.status);
            return React.createElement(PlatformModal, {
                open: Boolean(projectOverviewUpdateComposerState?.open),
                onClose: closeProjectOverviewUpdateComposer,
                as: "form",
                size: "large",
                maxHeight: "84vh",
                title: "Post project update",
                className: "playground-new-issue-modal playground-project-command-modal platform-project-update-modal",
                bodyClassName: "playground-new-issue-modal__body playground-project-command-modal__body platform-project-update-modal__body",
                footerClassName: "playground-new-issue-modal__footer platform-project-update-modal__footer",
                surfaceProps: {
                  onSubmit: postProjectOverviewUpdate,
                },
                footer: React.createElement(React.Fragment, null,
                  React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    size: "medium",
                    disabled: projectOverviewUpdateComposerState?.isSaving,
                    onClick: closeProjectOverviewUpdateComposer,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    type: "submit",
                    size: "medium",
                    disabled: projectOverviewUpdateComposerState?.isSaving || !String(draft.body || "").trim(),
                  }, projectOverviewUpdateComposerState?.isSaving ? "Posting..." : "Post Update")
                ),
              },
              React.createElement(PlatformInstructionsEditor, {
                value: resolveTaskDescriptionAttachmentFiles(
                  String(draft.body || ""),
                  draft.attachments
                ),
                onChange: handleProjectOverviewUpdateEditorChange,
                title: "Update",
                placeholder: "Share progress, decisions, risks, and what happens next.",
                ariaLabel: "Project update",
                historyKey: "project-update:" + String(selectedProjectId || selectedProject?.id || "project"),
                stickyHeader: false,
                autoFocus: true,
                variant: "minimalistic-ui",
                contentVariant: "file-enabled",
                fileUpload: {
                  upload: uploadProjectOverviewUpdateFiles,
                  resolvePreviewSource: resolveTaskDescriptionFilePreviewSource,
                  disabled: projectOverviewUpdateComposerState?.isSaving || taskAttachmentTransferState?.isProcessing,
                  onRename: handleRenameProjectOverviewUpdateFile,
                onRemove: handleRemoveProjectOverviewUpdateFile,
                },
                ...getProjectMentionComposerProps(),
                onMentionSelect: (mention) => updateProjectOverviewUpdateDraft((current) => ({
                  ...current,
                  mentions: mergeProjectMentionReference(current?.mentions, mention),
                })),
                className: "playground-new-issue-modal__description playground-project-command-modal__instructions platform-project-update-modal__editor",
              }),
              React.createElement("div", { className: "platform-project-update-modal__status-row" },
                React.createElement("span", { className: "platform-project-update-modal__status-label" }, "Health"),
                React.createElement(PlatformSelector, {
                  value: statusOption.value,
                  options: PROJECT_OVERVIEW_UPDATE_STATUS_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                    leading: React.createElement("span", {
                      className: "platform-project-update-status__dot is-" + option.tone,
                      "aria-hidden": "true",
                    }),
                  })),
                  onValueChange: (nextStatus) => updateProjectOverviewUpdateDraft({
                    status: normalizeProjectOverviewUpdateStatus(nextStatus),
                  }),
                  ariaLabel: "Project health",
                  label: renderProjectOverviewUpdateStatus(statusOption.value),
                  popupAlignment: "right",
                  popupWidth: "180px",
                  className: "platform-project-update-modal__status-selector",
                  triggerClassName: "platform-project-update-modal__status-trigger",
                  popupClassName: "platform-project-update-modal__status-popup",
                })
              ),
              projectOverviewUpdateComposerState?.error
                ? React.createElement("div", {
                    className: "platform-project-update-modal__error",
                    role: "alert",
                  }, projectOverviewUpdateComposerState.error)
                : null
            );
          }

          function renderProjectOverviewUpdateCard(update, options = {}) {
            const updateBody = String(update?.body || "").trim();
            const updateComments = Array.isArray(update?.comments) ? update.comments : [];
            const updateReactions = Array.isArray(update?.reactions) ? update.reactions : [];
            const updateInteractionActive = projectOverviewUpdateInteractionState?.updateId === update?.id;
            const commentComposerOpen = updateInteractionActive
              && Boolean(projectOverviewUpdateInteractionState?.commentOpen);
            const emojiPickerOpen = updateInteractionActive
              && Boolean(projectOverviewUpdateInteractionState?.emojiOpen);
            const updateAuthorIdentity = resolveProjectOverviewUpdateAuthorIdentity(update);
            const actorName = updateAuthorIdentity.name;
            const timeLabel = update?.createdAt && typeof formatRelativeThreadTime === "function"
              ? formatRelativeThreadTime(update.createdAt)
              : "";
            return React.createElement(React.Fragment, null,
              React.createElement("section", {
                  className: "platform-project-update-card"
                    + (options.className ? " " + String(options.className).trim() : "")
                    + (updateBody ? "" : " is-empty"),
                },
                React.createElement("div", { className: "platform-project-update-card__header" },
                  React.createElement("div", { className: "platform-project-update-card__meta" },
                    options.showStatus === false
                      ? null
                      : renderProjectOverviewUpdateStatus(update.status),
                    React.createElement("span", { className: "platform-project-update-card__author" },
                      renderProjectOverviewSidebarAvatar(
                        actorName,
                        updateAuthorIdentity.avatarUrl
                      ),
                      React.createElement("span", null, actorName)
                    ),
                    timeLabel
                      ? React.createElement("span", { className: "platform-project-update-card__time" }, timeLabel)
                      : null
                  ),
                  options.showUpdateAction === false
                    ? null
                    : React.createElement(PlatformSecondaryButton, {
                        type: "button",
                        size: "small",
                        className: "platform-project-update-card__action",
                        onClick: openProjectOverviewUpdateComposer,
                      },
                        React.createElement(SquarePen, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Update")
                      )
                ),
                updateBody
                  ? React.createElement(React.Fragment, null,
                      React.createElement(PlatformInstructionsEditor, {
                        value: resolveTaskDescriptionAttachmentFiles(updateBody, update.attachments),
                        onChange: () => {},
                        title: null,
                        placeholder: "",
                        ariaLabel: options.ariaLabel || "Project update",
                        readOnly: true,
                        stickyHeader: false,
                        historyKey: "project-update:" + String(update.id || selectedProjectId || "project"),
                        variant: "minimalistic-ui",
                        contentVariant: "file-enabled",
                        fileUpload: {
                          upload: async () => [],
                          resolvePreviewSource: resolveTaskDescriptionFilePreviewSource,
                        },
                        className: "platform-project-update-card__content",
                      }),
                      React.createElement("div", {
                          className: "platform-project-update-card__interaction-actions",
                        },
                        React.createElement(PlatformIconButton, {
                            type: "button",
                            size: "small",
                            className: "platform-project-update-card__interaction-button"
                              + (commentComposerOpen ? " is-active" : ""),
                            title: updateComments.length ? "Reply" : "Comment",
                            "aria-label": updateComments.length
                              ? "Reply to update comment"
                              : "Comment on update",
                            "aria-expanded": commentComposerOpen,
                            onClick: () => setProjectOverviewUpdateCommentOpen(
                              update.id,
                              updateComments.length ? true : !commentComposerOpen
                            ),
                          },
                          React.createElement(MessageCircle, {
                            width: 15,
                            height: 15,
                            strokeWidth: 1.8,
                            "aria-hidden": "true",
                          })
                        ),
                        updateReactions.length
                          ? React.createElement("div", {
                              className: "platform-project-update-card__reactions",
                              "aria-label": "Update reactions",
                            },
                            updateReactions.map((reaction) => {
                              const selected = Array.isArray(reaction.userIds)
                                && reaction.userIds.includes(currentUserId);
                              return React.createElement("button", {
                                  type: "button",
                                  key: reaction.emoji,
                                  className: "platform-project-update-card__reaction"
                                    + (selected ? " is-selected" : ""),
                                  "aria-pressed": selected,
                                  disabled: updateInteractionActive
                                    && projectOverviewUpdateInteractionState?.reactionSaving === reaction.emoji,
                                  onClick: () => void toggleProjectOverviewUpdateReaction(
                                    update.id,
                                    reaction.emoji
                                  ),
                                },
                                React.createElement("span", {
                                  className: "platform-project-update-card__reaction-emoji",
                                  "aria-hidden": "true",
                                }, reaction.emoji),
                                React.createElement("span", null, String(reaction.count || reaction.userIds?.length || 0))
                              );
                            })
                          )
                          : null,
                        React.createElement(PlatformEmojiPicker, {
                          open: emojiPickerOpen,
                          onOpenChange: (open) => setProjectOverviewUpdateEmojiOpen(update.id, open),
                          onSelect: (emoji) => toggleProjectOverviewUpdateReaction(update.id, emoji),
                          placement: "bottom-end",
                          ariaLabel: "React to update",
                          className: "platform-project-update-card__emoji-picker",
                        })
                      ),
                      updateComments.length || commentComposerOpen
                        ? React.createElement("div", {
                            className: "platform-project-update-card__comments",
                          },
                          updateComments.map((comment, commentIndex) => {
                            const commentAuthorName = String(
                              comment.authorName
                                || comment.authorEmail
                                || "Project member"
                            ).trim();
                            const commentTimeLabel = comment.createdAt
                              && typeof formatRelativeThreadTime === "function"
                                ? formatRelativeThreadTime(comment.createdAt)
                                : "";
                            const replies = (Array.isArray(comment.replies) ? comment.replies : [])
                              .map((reply) => {
                                const replyAuthorName = String(
                                  reply.authorName
                                    || reply.authorEmail
                                    || "Project member"
                                ).trim();
                                const replyTimeLabel = reply.createdAt
                                  && typeof formatRelativeThreadTime === "function"
                                    ? formatRelativeThreadTime(reply.createdAt)
                                    : "";
                                return {
                                  id: reply.id || reply.createdAt + reply.body,
                                  author: replyAuthorName,
                                  timestamp: replyTimeLabel,
                                  avatar: renderProjectOverviewSidebarAvatar(
                                    replyAuthorName,
                                    reply.authorAvatarUrl
                                  ),
                                  content: React.createElement(React.Fragment, null,
                                    React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                      content: reply.body,
                                      className: "platform-project-update-card__comment-text tb-message-markdown",
                                    }),
                                    Array.isArray(reply.attachments) && reply.attachments.length
                                      ? React.createElement("div", {
                                          className: "platform-project-update-card__comment-attachments",
                                        }, reply.attachments.map((attachment) =>
                                          renderTaskAttachmentChip(attachment, { removable: false })
                                        ))
                                      : null
                                  ),
                                };
                              });
                            return React.createElement(PlatformCommentCard, {
                              key: comment.id || comment.createdAt + comment.body,
                              className: "platform-project-update-card__comment",
                              author: commentAuthorName,
                              timestamp: commentTimeLabel,
                              avatar: renderProjectOverviewSidebarAvatar(
                                commentAuthorName,
                                comment.authorAvatarUrl
                              ),
                              content: React.createElement(React.Fragment, null,
                                React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                  content: comment.body,
                                  className: "platform-project-update-card__comment-text tb-message-markdown",
                                }),
                                Array.isArray(comment.attachments) && comment.attachments.length
                                  ? React.createElement("div", {
                                      className: "platform-project-update-card__comment-attachments",
                                    }, comment.attachments.map((attachment) =>
                                      renderTaskAttachmentChip(attachment, { removable: false })
                                    ))
                                  : null
                              ),
                              replies,
                              replyComposer: {
                                avatar: renderProjectOverviewSidebarAvatar(
                                  currentUserName || currentUserEmail || "Project member",
                                  currentUserAvatarUrl
                                ),
                                placeholder: "Leave a reply...",
                                ariaLabel: "Reply to project update comment",
                                disabled: Boolean(projectOverviewUpdateInteractionState?.isSaving),
                                autoFocus: commentComposerOpen
                                  && commentIndex === updateComments.length - 1,
                                ...getProjectMentionComposerProps(),
                                onSubmit: (value, mentions) => postProjectOverviewUpdateReply(
                                  update.id,
                                  comment.id,
                                  value,
                                  mentions
                                ),
                              },
                              actions: isProjectOverviewUpdateCommentByCurrentUser(comment)
                                ? {
                                    editableValue: comment.body,
                                    disabled: Boolean(projectOverviewUpdateInteractionState?.isSaving),
                                    onEdit: (nextBody) => editProjectOverviewUpdateComment(
                                      update.id,
                                      comment.id,
                                      nextBody
                                    ),
                                    onDelete: () => deleteProjectOverviewUpdateComment(
                                      update.id,
                                      comment.id
                                    ),
                                  }
                                : undefined,
                            });
                          }),
                          commentComposerOpen && !updateComments.length
                            ? React.createElement(PlatformCommentComposer, {
                                ...getProjectMentionComposerProps(),
                                value: projectOverviewUpdateInteractionState?.commentValue || "",
                                onChange: (nextValue) => setProjectOverviewUpdateInteractionState((current) => ({
                                  ...current,
                                  updateId: update.id,
                                  commentValue: nextValue,
                                  error: "",
                                })),
                                onSubmit: (files, mentions, body) => postProjectOverviewUpdateComment(
                                  update.id,
                                  files,
                                  mentions,
                                  body
                                ),
                                allowAttachments: true,
                                submitting: projectOverviewUpdateInteractionState?.isSaving,
                                errorMessage: projectOverviewUpdateInteractionState?.error,
                                placeholder: "Leave a comment...",
                                ariaLabel: "Project update comment",
                                autoFocus: true,
                                className: "platform-project-update-card__comment-composer",
                              })
                            : null
                        )
                        : null,
                      updateInteractionActive
                        && !commentComposerOpen
                        && projectOverviewUpdateInteractionState?.error
                        ? React.createElement("div", {
                            className: "platform-project-update-card__interaction-error",
                            role: "alert",
                          }, projectOverviewUpdateInteractionState.error)
                        : null
                    )
                  : null
              ),
              options.includeComposerModal === true
                ? renderProjectOverviewUpdateComposerModal()
                : null
            );
          }

`;

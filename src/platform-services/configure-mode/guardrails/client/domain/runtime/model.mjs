export const GUARDRAILS_MODEL_SCRIPT = `      function createPlaygroundGuardrailId(prefix = "guardrail") {
        return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      }

      function createPlaygroundGuardrailPromptDraft(overrides = {}) {
        const nowIso = new Date().toISOString();
        const rawTitle = typeof overrides.title === "string" ? overrides.title : "";
        return {
          id: String(overrides.id || "").trim() || createPlaygroundGuardrailId("prompt"),
          title: rawTitle.length > 0 ? rawTitle : "Instruction",
          prompt: String(overrides.prompt || ""),
          createdAt: String(overrides.createdAt || nowIso),
          updatedAt: String(overrides.updatedAt || nowIso),
        };
      }

      function isPlaygroundDefaultGuardrailSet(record) {
        if (!record || typeof record !== "object" || Array.isArray(record)) {
          return false;
        }
        const source = String(record.source || "").trim().toLowerCase();
        const id = String(record.id || "").trim();
        return Boolean(record.isDefault || record.readOnly || record.readonly || source === "default" || id.startsWith("default_guardrail_"));
      }

      function normalizePlaygroundGuardrailSet(record) {
        const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
        const nowIso = new Date().toISOString();
        const isDefaultSet = isPlaygroundDefaultGuardrailSet(source);
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
          ? { ...source.metadata }
          : {};
        const sourceCreator = source.creator && typeof source.creator === "object" && !Array.isArray(source.creator)
          ? source.creator
          : source.createdBy && typeof source.createdBy === "object" && !Array.isArray(source.createdBy)
            ? source.createdBy
            : source.created_by && typeof source.created_by === "object" && !Array.isArray(source.created_by)
              ? source.created_by
              : {};
        const metadataCreator = metadata.creator && typeof metadata.creator === "object" && !Array.isArray(metadata.creator)
          ? metadata.creator
          : metadata.createdBy && typeof metadata.createdBy === "object" && !Array.isArray(metadata.createdBy)
            ? metadata.createdBy
            : metadata.created_by && typeof metadata.created_by === "object" && !Array.isArray(metadata.created_by)
              ? metadata.created_by
              : {};
        const creatorIdentity = {
          id: String(sourceCreator.id || metadataCreator.id || source.creatorId || source.creator_id || source.createdById || source.created_by_id || metadata.creatorId || metadata.creator_id || metadata.createdById || metadata.created_by_id || "").trim(),
          userId: String(sourceCreator.userId || sourceCreator.user_id || metadataCreator.userId || metadataCreator.user_id || source.creatorUserId || source.creator_user_id || metadata.creatorUserId || metadata.creator_user_id || "").trim(),
          name: String(sourceCreator.name || sourceCreator.displayName || sourceCreator.display_name || metadataCreator.name || metadataCreator.displayName || metadataCreator.display_name || source.creatorName || source.creator_name || source.createdByName || source.created_by_name || metadata.creatorName || metadata.creator_name || metadata.createdByName || metadata.created_by_name || "").trim(),
          email: String(sourceCreator.email || sourceCreator.mail || metadataCreator.email || metadataCreator.mail || source.creatorEmail || source.creator_email || source.createdByEmail || source.created_by_email || metadata.creatorEmail || metadata.creator_email || metadata.createdByEmail || metadata.created_by_email || "").trim(),
          avatarUrl: String(sourceCreator.avatarUrl || sourceCreator.avatar_url || sourceCreator.photoUrl || sourceCreator.photoURL || sourceCreator.imageUrl || sourceCreator.imageURL || metadataCreator.avatarUrl || metadataCreator.avatar_url || metadataCreator.photoUrl || metadataCreator.photoURL || metadataCreator.imageUrl || metadataCreator.imageURL || source.creatorAvatarUrl || source.creator_avatar_url || source.createdByAvatarUrl || source.created_by_avatar_url || metadata.creatorAvatarUrl || metadata.creator_avatar_url || metadata.createdByAvatarUrl || metadata.created_by_avatar_url || "").trim(),
        };
        if (creatorIdentity.id || creatorIdentity.userId || creatorIdentity.name || creatorIdentity.email || creatorIdentity.avatarUrl) {
          metadata.creator = {
            ...metadataCreator,
            ...(creatorIdentity.id ? { id: creatorIdentity.id } : {}),
            ...(creatorIdentity.userId ? { userId: creatorIdentity.userId, user_id: creatorIdentity.userId } : {}),
            ...(creatorIdentity.name ? { name: creatorIdentity.name, displayName: creatorIdentity.name, display_name: creatorIdentity.name } : {}),
            ...(creatorIdentity.email ? { email: creatorIdentity.email } : {}),
            ...(creatorIdentity.avatarUrl ? { avatarUrl: creatorIdentity.avatarUrl, avatar_url: creatorIdentity.avatarUrl, photoUrl: creatorIdentity.avatarUrl, photoURL: creatorIdentity.avatarUrl } : {}),
          };
          if (creatorIdentity.id) {
            metadata.creatorId = creatorIdentity.id;
            metadata.creator_id = creatorIdentity.id;
          }
          if (creatorIdentity.userId) {
            metadata.creatorUserId = creatorIdentity.userId;
            metadata.creator_user_id = creatorIdentity.userId;
          }
          if (creatorIdentity.name) {
            metadata.creatorName = creatorIdentity.name;
            metadata.creator_name = creatorIdentity.name;
          }
          if (creatorIdentity.email) {
            metadata.creatorEmail = creatorIdentity.email;
            metadata.creator_email = creatorIdentity.email;
          }
          if (creatorIdentity.avatarUrl) {
            metadata.creatorAvatarUrl = creatorIdentity.avatarUrl;
            metadata.creator_avatar_url = creatorIdentity.avatarUrl;
          }
        }
        const rawName = typeof source.name === "string"
          ? source.name
          : typeof source.title === "string"
            ? source.title
            : "";
        const prompts = Array.isArray(source.prompts)
          ? source.prompts.map((prompt) => createPlaygroundGuardrailPromptDraft(prompt))
          : [];
        return {
          id: String(source.id || "").trim() || createPlaygroundGuardrailId("guardrail"),
          name: rawName.length > 0 ? rawName : "Untitled Guardrail Set",
          description: String(source.description || ""),
          prompts,
          createdAt: String(source.createdAt || nowIso),
          updatedAt: String(source.updatedAt || nowIso),
          publishedAt: String(source.publishedAt || source.published_at || metadata.publishedAt || metadata.published_at || ""),
          metadata: Object.keys(metadata).length > 0 ? metadata : null,
          source: isDefaultSet ? "default" : "custom",
          isDefault: isDefaultSet,
          readOnly: isDefaultSet,
        };
      }

      function getPlaygroundDefaultGuardrailSets() {
        return PLAYGROUND_DEFAULT_GUARDRAIL_SETS.map((set) => normalizePlaygroundGuardrailSet(set));
      }

      function getPlaygroundAllGuardrailSets(customSets) {
        const defaultSets = getPlaygroundDefaultGuardrailSets();
        const defaultIds = new Set(defaultSets.map((set) => set.id));
        const normalizedCustomSets = (Array.isArray(customSets) ? customSets : [])
          .map((set) => normalizePlaygroundGuardrailSet({ ...set, source: "custom", isDefault: false, readOnly: false, readonly: false }))
          .filter((set) => set?.id && !defaultIds.has(set.id));
        return [...defaultSets, ...normalizedCustomSets];
      }

      function createPlaygroundGuardrailSetDraft(overrides = {}) {
        const nowIso = new Date().toISOString();
        return normalizePlaygroundGuardrailSet({
          id: createPlaygroundGuardrailId("guardrail"),
          name: "New Guardrail Set",
          description: "Invisible prompt adaptations applied to agents that include this set.",
          prompts: [createPlaygroundGuardrailPromptDraft({
            title: "System boundary",
            prompt: "",
            createdAt: nowIso,
            updatedAt: nowIso,
          })],
          createdAt: nowIso,
          updatedAt: nowIso,
          ...overrides,
        });
      }

      function stripPlaygroundGuardrailVersionMetadata(metadata) {
        const source = metadata && typeof metadata === "object" && !Array.isArray(metadata)
          ? { ...metadata }
          : {};
        delete source.guardrailVersions;
        delete source.guardrail_versions;
        delete source.versions;
        delete source.activeGuardrailVersionId;
        delete source.active_guardrail_version_id;
        delete source.activeGuardrailVersionNumber;
        delete source.active_guardrail_version_number;
        delete source.restoredFromGuardrailVersionId;
        delete source.restored_from_guardrail_version_id;
        delete source.restoredFromGuardrailVersionNumber;
        delete source.restored_from_guardrail_version_number;
        delete source.publishedAt;
        delete source.published_at;
        delete source.unpublishedAt;
        delete source.unpublished_at;
        return source;
      }

`;

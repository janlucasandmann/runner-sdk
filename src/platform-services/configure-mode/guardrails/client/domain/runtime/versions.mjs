export const GUARDRAILS_VERSIONS_SCRIPT = `      function createPlaygroundGuardrailVersionId() {
        return "guardrail_version_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      }

      function buildPlaygroundGuardrailVersionSnapshot(set) {
        const normalizedSet = normalizePlaygroundGuardrailSet(set || createPlaygroundGuardrailSetDraft());
        return {
          name: String(normalizedSet.name || "").trim() || "Untitled Guardrail Set",
          description: typeof normalizedSet.description === "string" ? normalizedSet.description : "",
          prompts: Array.isArray(normalizedSet.prompts)
            ? normalizedSet.prompts.map((prompt) => createPlaygroundGuardrailPromptDraft(prompt))
            : [],
          metadata: stripPlaygroundGuardrailVersionMetadata(normalizedSet.metadata),
        };
      }

      function normalizePlaygroundGuardrailVersion(rawVersion, fallbackIndex = 0) {
        const version = rawVersion && typeof rawVersion === "object" && !Array.isArray(rawVersion) ? rawVersion : {};
        const snapshot = version.snapshot && typeof version.snapshot === "object" && !Array.isArray(version.snapshot)
          ? version.snapshot
          : {};
        const createdAt = String(version.createdAt || version.created_at || version.publishedAt || version.published_at || new Date().toISOString()).trim();
        const id = String(version.id || version.versionId || version.version_id || ("guardrail_version_" + (fallbackIndex + 1))).trim();
        const versionNumber = Number(version.version || version.versionNumber || version.version_number || 0) || (fallbackIndex + 1);
        const rawStatus = String(version.status || "").trim().toLowerCase();
        const status = ["active", "saved", "superseded", "unpublished"].includes(rawStatus) ? rawStatus : "saved";
        const promptSource = Array.isArray(version.prompts)
          ? version.prompts
          : Array.isArray(snapshot.prompts)
            ? snapshot.prompts
            : [];
        const normalizedSnapshot = {
          name: String(version.name || snapshot.name || "").trim(),
          description: typeof version.description === "string"
            ? version.description
            : typeof snapshot.description === "string"
              ? snapshot.description
              : "",
          prompts: promptSource.map((prompt) => createPlaygroundGuardrailPromptDraft(prompt)),
          metadata: stripPlaygroundGuardrailVersionMetadata(snapshot.metadata),
        };
        return {
          id,
          version: versionNumber,
          label: String(version.label || version.name || ("Version " + versionNumber)).trim(),
          description: String(version.description || version.summary || "").trim(),
          status,
          createdAt,
          updatedAt: String(version.updatedAt || version.updated_at || "").trim(),
          publishedAt: String(version.publishedAt || version.published_at || "").trim(),
          name: normalizedSnapshot.name,
          promptCount: normalizedSnapshot.prompts.length,
          snapshot: normalizedSnapshot,
        };
      }

      function normalizePlaygroundGuardrailVersions(value) {
        const rawItems = Array.isArray(value) ? value : [];
        return rawItems
          .map((version, index) => normalizePlaygroundGuardrailVersion(version, index))
          .filter((version) => version.id)
          .sort((a, b) => {
            const versionDelta = Number(b.version || 0) - Number(a.version || 0);
            if (versionDelta) return versionDelta;
            return new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime();
          });
      }

      function readPlaygroundGuardrailVersions(set) {
        const metadata = set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata)
          ? set.metadata
          : {};
        return normalizePlaygroundGuardrailVersions(
          set?.guardrailVersions
          || set?.versions
          || metadata.guardrailVersions
          || metadata.guardrail_versions
          || metadata.versions
          || []
        );
      }

      function createPlaygroundGuardrailVersion(set, existingVersions = [], options = {}) {
        const now = new Date().toISOString();
        const normalizedExisting = normalizePlaygroundGuardrailVersions(existingVersions);
        const nextVersion = normalizedExisting.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), 0) + 1;
        const requestedStatus = String(options?.status || "saved").trim().toLowerCase();
        const status = requestedStatus === "active" ? "active" : "saved";
        const snapshot = buildPlaygroundGuardrailVersionSnapshot(set);
        return normalizePlaygroundGuardrailVersion({
          id: createPlaygroundGuardrailVersionId(),
          version: nextVersion,
          label: String(options?.label || ("Version " + nextVersion)).trim(),
          description: String(options?.description || "").trim(),
          status,
          createdAt: now,
          publishedAt: status === "active" ? now : "",
          name: snapshot.name,
          prompts: snapshot.prompts,
          snapshot,
        }, nextVersion - 1);
      }

      function createPlaygroundGuardrailWithVersionList(set, versions, preferredSelectedId = "") {
        const baseSet = normalizePlaygroundGuardrailSet(set || createPlaygroundGuardrailSetDraft());
        const normalizedVersions = normalizePlaygroundGuardrailVersions(versions);
        const metadata = baseSet.metadata && typeof baseSet.metadata === "object" && !Array.isArray(baseSet.metadata)
          ? { ...baseSet.metadata }
          : {};
        const previousSelectedId = String(metadata.restoredFromGuardrailVersionId || metadata.restored_from_guardrail_version_id || metadata.activeGuardrailVersionId || metadata.active_guardrail_version_id || "").trim();
        const selectedVersion = normalizedVersions.find((version) => version.id === String(preferredSelectedId || "").trim())
          || normalizedVersions.find((version) => version.id === previousSelectedId)
          || normalizedVersions.find((version) => version.status === "active")
          || normalizedVersions[0]
          || null;
        const activeVersion = normalizedVersions.find((version) => version.status === "active")
          || normalizedVersions.find((version) => version.id === String(metadata.activeGuardrailVersionId || metadata.active_guardrail_version_id || "").trim())
          || null;
        metadata.guardrailVersions = normalizedVersions;
        metadata.guardrail_versions = normalizedVersions;
        metadata.activeGuardrailVersionId = activeVersion?.id || "";
        metadata.active_guardrail_version_id = activeVersion?.id || "";
        metadata.activeGuardrailVersionNumber = activeVersion?.version || 0;
        metadata.active_guardrail_version_number = activeVersion?.version || 0;
        metadata.restoredFromGuardrailVersionId = selectedVersion?.id || "";
        metadata.restored_from_guardrail_version_id = selectedVersion?.id || "";
        metadata.restoredFromGuardrailVersionNumber = selectedVersion?.version || 0;
        metadata.restored_from_guardrail_version_number = selectedVersion?.version || 0;
        if (activeVersion?.publishedAt) {
          metadata.publishedAt = activeVersion.publishedAt;
          metadata.published_at = activeVersion.publishedAt;
        } else {
          delete metadata.publishedAt;
          delete metadata.published_at;
        }
        return normalizePlaygroundGuardrailSet({
          ...baseSet,
          metadata,
          publishedAt: activeVersion?.publishedAt || "",
        });
      }

      function createPlaygroundGuardrailFromVersionSnapshot(set, version, versions, preferredSelectedId = "") {
        const baseSet = normalizePlaygroundGuardrailSet(set || createPlaygroundGuardrailSetDraft());
        const normalizedVersion = normalizePlaygroundGuardrailVersion(version || {});
        const snapshot = normalizedVersion.snapshot || {};
        const baseMetadata = stripPlaygroundGuardrailVersionMetadata(baseSet.metadata);
        const snapshotMetadata = stripPlaygroundGuardrailVersionMetadata(snapshot.metadata);
        const nextSet = normalizePlaygroundGuardrailSet({
          ...baseSet,
          name: snapshot.name || baseSet.name,
          description: typeof snapshot.description === "string" ? snapshot.description : baseSet.description,
          prompts: Array.isArray(snapshot.prompts) ? snapshot.prompts : baseSet.prompts,
          metadata: {
            ...baseMetadata,
            ...snapshotMetadata,
          },
        });
        return createPlaygroundGuardrailWithVersionList(nextSet, versions, preferredSelectedId || normalizedVersion.id);
      }

      function buildPlaygroundGuardrailVersionComparableSnapshot(snapshot) {
        const normalizedSnapshot = normalizePlaygroundGuardrailVersion({ snapshot }).snapshot;
        return {
          name: String(normalizedSnapshot.name || "").trim(),
          description: String(normalizedSnapshot.description || ""),
          prompts: (Array.isArray(normalizedSnapshot.prompts) ? normalizedSnapshot.prompts : [])
            .map((prompt, index) => ({
              id: String(prompt?.id || ("prompt_" + (index + 1))).trim(),
              title: String(prompt?.title || "").trim(),
              prompt: String(prompt?.prompt || ""),
            })),
        };
      }

      function updatePlaygroundGuardrailVersionFromSet(version, set, options = {}) {
        const now = String(options.updatedAt || new Date().toISOString()).trim();
        const normalizedVersion = normalizePlaygroundGuardrailVersion(version || {});
        const snapshot = buildPlaygroundGuardrailVersionSnapshot(set);
        const requestedStatus = String(options.status || normalizedVersion.status || "saved").trim().toLowerCase();
        const status = requestedStatus === "active" ? "active" : "saved";
        return normalizePlaygroundGuardrailVersion({
          ...normalizedVersion,
          status,
          updatedAt: now,
          updated_at: now,
          publishedAt: status === "active" ? String(options.publishedAt || normalizedVersion.publishedAt || now).trim() : "",
          published_at: status === "active" ? String(options.publishedAt || normalizedVersion.publishedAt || now).trim() : "",
          name: snapshot.name,
          prompts: snapshot.prompts,
          promptCount: snapshot.prompts.length,
          snapshot,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function updatePlaygroundGuardrailVersionMetadata(version, details = {}) {
        const normalizedVersion = normalizePlaygroundGuardrailVersion(version || {});
        const now = String(details.updatedAt || new Date().toISOString()).trim();
        return normalizePlaygroundGuardrailVersion({
          ...normalizedVersion,
          label: String(details.label || "").trim() || String(normalizedVersion.label || ("Version " + normalizedVersion.version)).trim(),
          description: String(details.description || "").trim(),
          updatedAt: now,
          updated_at: now,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function publishPlaygroundGuardrailVersion(version, options = {}) {
        const normalizedVersion = normalizePlaygroundGuardrailVersion(version || {});
        const publishedAt = String(options.publishedAt || new Date().toISOString()).trim();
        return normalizePlaygroundGuardrailVersion({
          ...normalizedVersion,
          status: "active",
          updatedAt: publishedAt,
          updated_at: publishedAt,
          publishedAt,
          published_at: publishedAt,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function supersedePlaygroundGuardrailVersion(version, options = {}) {
        const normalizedVersion = normalizePlaygroundGuardrailVersion(version || {});
        const supersededAt = String(options.supersededAt || new Date().toISOString()).trim();
        return normalizePlaygroundGuardrailVersion({
          ...normalizedVersion,
          status: "superseded",
          updatedAt: supersededAt,
          updated_at: supersededAt,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function unpublishPlaygroundGuardrailVersion(version, options = {}) {
        const normalizedVersion = normalizePlaygroundGuardrailVersion(version || {});
        const unpublishedAt = String(options.unpublishedAt || new Date().toISOString()).trim();
        return normalizePlaygroundGuardrailVersion({
          ...normalizedVersion,
          status: "unpublished",
          updatedAt: unpublishedAt,
          updated_at: unpublishedAt,
          publishedAt: "",
          published_at: "",
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function ensurePlaygroundGuardrailInitialVersion(set) {
        const normalizedSet = normalizePlaygroundGuardrailSet(set || createPlaygroundGuardrailSetDraft());
        const versions = readPlaygroundGuardrailVersions(normalizedSet);
        if (versions.length > 0) {
          return createPlaygroundGuardrailWithVersionList(normalizedSet, versions);
        }
        const initialVersion = createPlaygroundGuardrailVersion(normalizedSet, [], {
          status: "active",
          label: "Version 1",
          description: "Initial version",
        });
        return createPlaygroundGuardrailWithVersionList(normalizedSet, [initialVersion], initialVersion.id);
      }

      const playgroundGuardrailVersionController = createPlaygroundVersionController({
        getMetadata: (set) => (
          set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata)
            ? set.metadata
            : {}
        ),
        readVersions: readPlaygroundGuardrailVersions,
        normalizeVersions: normalizePlaygroundGuardrailVersions,
        createVersion: createPlaygroundGuardrailVersion,
        withVersionList: createPlaygroundGuardrailWithVersionList,
        fromVersionSnapshot: createPlaygroundGuardrailFromVersionSnapshot,
        buildSnapshot: buildPlaygroundGuardrailVersionSnapshot,
        buildComparableSnapshot: buildPlaygroundGuardrailVersionComparableSnapshot,
        getActiveVersionId: (metadata) => (
          metadata.activeGuardrailVersionId
          || metadata.active_guardrail_version_id
          || ""
        ),
        getSelectedVersionId: (metadata, activeVersion) => (
          metadata.restoredFromGuardrailVersionId
          || metadata.restored_from_guardrail_version_id
          || activeVersion?.id
          || ""
        ),
        updateVersionFromResource: updatePlaygroundGuardrailVersionFromSet,
        updateVersionMetadata: updatePlaygroundGuardrailVersionMetadata,
        publishVersion: publishPlaygroundGuardrailVersion,
        supersedeVersion: supersedePlaygroundGuardrailVersion,
        unpublishVersion: unpublishPlaygroundGuardrailVersion,
        applyUnpublishMetadata: (set) => {
          const normalizedSet = normalizePlaygroundGuardrailSet(set);
          const metadata = normalizedSet.metadata && typeof normalizedSet.metadata === "object" && !Array.isArray(normalizedSet.metadata)
            ? { ...normalizedSet.metadata }
            : {};
          delete metadata.publishedAt;
          delete metadata.published_at;
          return normalizePlaygroundGuardrailSet({
            ...normalizedSet,
            metadata,
            publishedAt: "",
          });
        },
      });

`;

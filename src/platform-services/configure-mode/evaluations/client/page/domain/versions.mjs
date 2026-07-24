export const EVALUATIONS_PAGE_VERSIONS_SCRIPT = String.raw`      function stripPlaygroundEvaluationVersionMetadata(metadata) {
        const source = metadata && typeof metadata === "object" && !Array.isArray(metadata)
          ? { ...metadata }
          : {};
        delete source.evaluationVersions;
        delete source.evaluation_versions;
        delete source.versions;
        delete source.activeEvaluationVersionId;
        delete source.active_evaluation_version_id;
        delete source.activeEvaluationVersionNumber;
        delete source.active_evaluation_version_number;
        delete source.restoredFromEvaluationVersionId;
        delete source.restored_from_evaluation_version_id;
        delete source.restoredFromEvaluationVersionNumber;
        delete source.restored_from_evaluation_version_number;
        delete source.publishedAt;
        delete source.published_at;
        delete source.unpublishedAt;
        delete source.unpublished_at;
        return source;
      }

      function stripPlaygroundEvaluationAccessMetadata(metadata) {
        const source = metadata && typeof metadata === "object" && !Array.isArray(metadata)
          ? { ...metadata }
          : {};
        [
          "owner",
          "ownerId", "owner_id",
          "ownerUserId", "owner_user_id",
          "ownerName", "owner_name",
          "ownerEmail", "owner_email",
          "ownerAvatarUrl", "owner_avatar_url",
          "teamAccessIds", "team_access_ids",
          "teamAccessShareIds", "team_access_share_ids",
          "teamRolePermissionSets", "team_role_permission_sets",
          "permissionSet", "permission_set",
        ].forEach((key) => delete source[key]);
        return source;
      }

      function createPlaygroundEvaluationVersionId() {
        return "evaluation_version_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      }

      function buildPlaygroundEvaluationVersionSnapshot(set) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set || createPlaygroundEvaluationSetDraft());
        const dataRows = (Array.isArray(normalizedSet.dataRows) ? normalizedSet.dataRows : [])
          .map((row, index) => normalizePlaygroundEvaluationDataRow(row, index));
        return {
          name: String(normalizedSet.name || "").trim() || "Untitled Evaluation",
          description: String(normalizedSet.description || ""),
          evaluationGuidance: String(normalizedSet.evaluationGuidance || ""),
          passThreshold: normalizePlaygroundEvaluationPassThreshold(normalizedSet.passThreshold),
          evaluator: normalizePlaygroundEvaluationEvaluator(normalizedSet.evaluator),
          targetAgentId: String(normalizedSet.targetAgentId || "").trim(),
          environmentType: String(normalizedSet.environmentType || "").trim() === "project" ? "project" : "computer",
          environmentId: String(normalizedSet.environmentId || "").trim(),
          projectId: String(normalizedSet.projectId || "").trim(),
          dataRows,
          cases: dataRows,
          runs: (Array.isArray(normalizedSet.runs) ? normalizedSet.runs : [])
            .map((run, index) => normalizePlaygroundEvaluationRun(run, index)),
          creator: normalizePlaygroundEvaluationPersonIdentity(normalizedSet.creator || normalizedSet.createdBy || {}),
          metadata: stripPlaygroundEvaluationAccessMetadata(
            stripPlaygroundEvaluationVersionMetadata(normalizedSet.metadata)
          ),
        };
      }

      function normalizePlaygroundEvaluationVersion(rawVersion, fallbackIndex = 0) {
        const version = rawVersion && typeof rawVersion === "object" && !Array.isArray(rawVersion) ? rawVersion : {};
        const snapshot = version.snapshot && typeof version.snapshot === "object" && !Array.isArray(version.snapshot)
          ? version.snapshot
          : {};
        const createdAt = String(version.createdAt || version.created_at || version.publishedAt || version.published_at || new Date().toISOString()).trim();
        const id = String(version.id || version.versionId || version.version_id || ("evaluation_version_" + (fallbackIndex + 1))).trim();
        const versionNumber = Number(version.version || version.versionNumber || version.version_number || 0) || (fallbackIndex + 1);
        const rawStatus = String(version.status || "").trim().toLowerCase();
        const status = rawStatus === "published"
          ? "active"
          : ["active", "saved", "superseded", "unpublished"].includes(rawStatus) ? rawStatus : "saved";
        const normalizedSnapshot = {
          name: String(version.name || snapshot.name || "").trim() || "Untitled Evaluation",
          description: typeof version.description === "string"
            ? version.description
            : typeof snapshot.description === "string"
              ? snapshot.description
              : "",
          evaluationGuidance: String(snapshot.evaluationGuidance || snapshot.evaluation_guidance || version.evaluationGuidance || version.evaluation_guidance || ""),
          passThreshold: normalizePlaygroundEvaluationPassThreshold(snapshot.passThreshold ?? snapshot.pass_threshold ?? version.passThreshold ?? version.pass_threshold ?? 0.8),
          evaluator: normalizePlaygroundEvaluationEvaluator(snapshot.evaluator || version.evaluator || {}),
          targetAgentId: String(snapshot.targetAgentId || snapshot.target_agent_id || version.targetAgentId || version.target_agent_id || "").trim(),
          environmentType: String(snapshot.environmentType || snapshot.environment_type || version.environmentType || version.environment_type || "").trim().toLowerCase() === "project" ? "project" : "computer",
          environmentId: String(snapshot.environmentId || snapshot.environment_id || version.environmentId || version.environment_id || "").trim(),
          projectId: String(snapshot.projectId || snapshot.project_id || version.projectId || version.project_id || "").trim(),
          dataRows: (Array.isArray(version.dataRows)
            ? version.dataRows
            : Array.isArray(snapshot.dataRows)
              ? snapshot.dataRows
              : Array.isArray(snapshot.data_rows)
                ? snapshot.data_rows
                : Array.isArray(snapshot.cases)
                  ? snapshot.cases
                  : []
          ).map((row, index) => normalizePlaygroundEvaluationDataRow(row, index)),
          runs: (Array.isArray(version.runs)
            ? version.runs
            : Array.isArray(snapshot.runs)
              ? snapshot.runs
              : []
          ).map((run, index) => normalizePlaygroundEvaluationRun(run, index)),
          creator: normalizePlaygroundEvaluationPersonIdentity(snapshot.creator || snapshot.createdBy || version.creator || version.createdBy || {}),
          metadata: stripPlaygroundEvaluationAccessMetadata(
            stripPlaygroundEvaluationVersionMetadata(snapshot.metadata)
          ),
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
          runCount: normalizedSnapshot.runs.length,
          caseCount: normalizedSnapshot.dataRows.length,
          snapshot: normalizedSnapshot,
        };
      }

      function normalizePlaygroundEvaluationVersions(value) {
        const rawItems = Array.isArray(value) ? value : [];
        return rawItems
          .map((version, index) => normalizePlaygroundEvaluationVersion(version, index))
          .filter((version) => version.id)
          .sort((a, b) => {
            const versionDelta = Number(b.version || 0) - Number(a.version || 0);
            if (versionDelta) return versionDelta;
            return new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime();
          });
      }

      function readPlaygroundEvaluationVersions(set) {
        const metadata = set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata)
          ? set.metadata
          : {};
        return normalizePlaygroundEvaluationVersions(
          set?.evaluationVersions
          || set?.evaluation_versions
          || set?.versions
          || metadata.evaluationVersions
          || metadata.evaluation_versions
          || metadata.versions
          || []
        );
      }

      function createPlaygroundEvaluationVersion(set, existingVersions = [], options = {}) {
        const now = new Date().toISOString();
        const normalizedExisting = normalizePlaygroundEvaluationVersions(existingVersions);
        const nextVersion = normalizedExisting.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), 0) + 1;
        const requestedStatus = String(options?.status || "saved").trim().toLowerCase();
        const status = requestedStatus === "active" ? "active" : "saved";
        const snapshot = buildPlaygroundEvaluationVersionSnapshot(set);
        return normalizePlaygroundEvaluationVersion({
          id: createPlaygroundEvaluationVersionId(),
          version: nextVersion,
          label: String(options?.label || ("Version " + nextVersion)).trim(),
          description: String(options?.description || "").trim(),
          status,
          createdAt: now,
          publishedAt: status === "active" ? now : "",
          name: snapshot.name,
          dataRows: snapshot.dataRows,
          runs: snapshot.runs,
          snapshot,
        }, nextVersion - 1);
      }

      function createPlaygroundEvaluationWithVersionList(set, versions, preferredSelectedId = "") {
        const baseSet = normalizePlaygroundEvaluationSet(set || createPlaygroundEvaluationSetDraft());
        const normalizedVersions = normalizePlaygroundEvaluationVersions(versions);
        const metadata = baseSet.metadata && typeof baseSet.metadata === "object" && !Array.isArray(baseSet.metadata)
          ? { ...baseSet.metadata }
          : {};
        const previousSelectedId = String(metadata.restoredFromEvaluationVersionId || metadata.restored_from_evaluation_version_id || metadata.activeEvaluationVersionId || metadata.active_evaluation_version_id || "").trim();
        const selectedVersion = normalizedVersions.find((version) => version.id === String(preferredSelectedId || "").trim())
          || normalizedVersions.find((version) => version.id === previousSelectedId)
          || normalizedVersions.find((version) => version.status === "active")
          || normalizedVersions[0]
          || null;
        const activeVersion = normalizedVersions.find((version) => version.status === "active")
          || normalizedVersions.find((version) => version.id === String(metadata.activeEvaluationVersionId || metadata.active_evaluation_version_id || "").trim())
          || null;
        metadata.evaluationVersions = normalizedVersions;
        metadata.evaluation_versions = normalizedVersions;
        metadata.activeEvaluationVersionId = activeVersion?.id || "";
        metadata.active_evaluation_version_id = activeVersion?.id || "";
        metadata.activeEvaluationVersionNumber = activeVersion?.version || 0;
        metadata.active_evaluation_version_number = activeVersion?.version || 0;
        metadata.restoredFromEvaluationVersionId = selectedVersion?.id || "";
        metadata.restored_from_evaluation_version_id = selectedVersion?.id || "";
        metadata.restoredFromEvaluationVersionNumber = selectedVersion?.version || 0;
        metadata.restored_from_evaluation_version_number = selectedVersion?.version || 0;
        if (activeVersion?.publishedAt) {
          metadata.publishedAt = activeVersion.publishedAt;
          metadata.published_at = activeVersion.publishedAt;
        } else {
          delete metadata.publishedAt;
          delete metadata.published_at;
        }
        return normalizePlaygroundEvaluationSet({
          ...baseSet,
          metadata,
          publishedAt: activeVersion?.publishedAt || "",
        });
      }

      function createPlaygroundEvaluationFromVersionSnapshot(set, version, versions, preferredSelectedId = "") {
        const baseSet = normalizePlaygroundEvaluationSet(set || createPlaygroundEvaluationSetDraft());
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const snapshot = normalizedVersion.snapshot || {};
        const baseMetadata = stripPlaygroundEvaluationVersionMetadata(baseSet.metadata);
        const snapshotMetadata = stripPlaygroundEvaluationAccessMetadata(
          stripPlaygroundEvaluationVersionMetadata(snapshot.metadata)
        );
        const nextSet = normalizePlaygroundEvaluationSet({
          ...baseSet,
          name: snapshot.name || baseSet.name,
          description: typeof snapshot.description === "string" ? snapshot.description : baseSet.description,
          evaluationGuidance: typeof snapshot.evaluationGuidance === "string" ? snapshot.evaluationGuidance : baseSet.evaluationGuidance,
          passThreshold: snapshot.passThreshold ?? baseSet.passThreshold,
          evaluator: snapshot.evaluator || baseSet.evaluator,
          targetAgentId: snapshot.targetAgentId || baseSet.targetAgentId,
          environmentType: snapshot.environmentType || baseSet.environmentType,
          environmentId: snapshot.environmentId || baseSet.environmentId,
          projectId: snapshot.projectId || baseSet.projectId,
          dataRows: Array.isArray(snapshot.dataRows) ? snapshot.dataRows : baseSet.dataRows,
          runs: Array.isArray(snapshot.runs) ? snapshot.runs : [],
          creator: snapshot.creator || baseSet.creator,
          createdBy: snapshot.creator || baseSet.createdBy,
          metadata: {
            ...baseMetadata,
            ...snapshotMetadata,
          },
        });
        return createPlaygroundEvaluationWithVersionList(nextSet, versions, preferredSelectedId || normalizedVersion.id);
      }

      function buildPlaygroundEvaluationVersionComparableSnapshot(snapshot) {
        const normalizedSnapshot = normalizePlaygroundEvaluationVersion({ snapshot }).snapshot;
        return {
          name: String(normalizedSnapshot.name || "").trim(),
          description: String(normalizedSnapshot.description || ""),
          evaluationGuidance: String(normalizedSnapshot.evaluationGuidance || ""),
          passThreshold: normalizePlaygroundEvaluationPassThreshold(normalizedSnapshot.passThreshold),
          evaluator: normalizePlaygroundEvaluationEvaluator(normalizedSnapshot.evaluator),
          targetAgentId: String(normalizedSnapshot.targetAgentId || "").trim(),
          environmentType: String(normalizedSnapshot.environmentType || "").trim(),
          environmentId: String(normalizedSnapshot.environmentId || "").trim(),
          projectId: String(normalizedSnapshot.projectId || "").trim(),
          dataRows: (Array.isArray(normalizedSnapshot.dataRows) ? normalizedSnapshot.dataRows : [])
            .map((row, index) => ({
              id: String(row?.id || ("row_" + (index + 1))).trim(),
              input: String(row?.input || ""),
              expectedOutput: String(row?.expectedOutput || ""),
              evaluationGuidance: String(row?.evaluationGuidance || ""),
              runCount: normalizePlaygroundEvaluationCaseRunCount(row?.runCount),
            })),
        };
      }

      function updatePlaygroundEvaluationVersionFromSet(version, set, options = {}) {
        const now = String(options.updatedAt || new Date().toISOString()).trim();
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const snapshot = buildPlaygroundEvaluationVersionSnapshot(set);
        const requestedStatus = String(options.status || normalizedVersion.status || "saved").trim().toLowerCase();
        const status = requestedStatus === "active" ? "active" : "saved";
        return normalizePlaygroundEvaluationVersion({
          ...normalizedVersion,
          status,
          updatedAt: now,
          updated_at: now,
          publishedAt: status === "active" ? String(options.publishedAt || normalizedVersion.publishedAt || now).trim() : "",
          published_at: status === "active" ? String(options.publishedAt || normalizedVersion.publishedAt || now).trim() : "",
          name: snapshot.name,
          dataRows: snapshot.dataRows,
          runs: snapshot.runs,
          runCount: snapshot.runs.length,
          caseCount: snapshot.dataRows.length,
          snapshot,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function updatePlaygroundEvaluationVersionMetadata(version, details = {}) {
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const now = String(details.updatedAt || new Date().toISOString()).trim();
        return normalizePlaygroundEvaluationVersion({
          ...normalizedVersion,
          label: String(details.label || "").trim() || String(normalizedVersion.label || ("Version " + normalizedVersion.version)).trim(),
          description: String(details.description || "").trim(),
          updatedAt: now,
          updated_at: now,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function publishPlaygroundEvaluationVersion(version, options = {}) {
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const publishedAt = String(options.publishedAt || new Date().toISOString()).trim();
        return normalizePlaygroundEvaluationVersion({
          ...normalizedVersion,
          status: "active",
          updatedAt: publishedAt,
          updated_at: publishedAt,
          publishedAt,
          published_at: publishedAt,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function supersedePlaygroundEvaluationVersion(version, options = {}) {
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const supersededAt = String(options.supersededAt || new Date().toISOString()).trim();
        return normalizePlaygroundEvaluationVersion({
          ...normalizedVersion,
          status: "superseded",
          updatedAt: supersededAt,
          updated_at: supersededAt,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function unpublishPlaygroundEvaluationVersion(version, options = {}) {
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const unpublishedAt = String(options.unpublishedAt || new Date().toISOString()).trim();
        return normalizePlaygroundEvaluationVersion({
          ...normalizedVersion,
          status: "unpublished",
          updatedAt: unpublishedAt,
          updated_at: unpublishedAt,
          publishedAt: "",
          published_at: "",
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function ensurePlaygroundEvaluationInitialVersion(set) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set || createPlaygroundEvaluationSetDraft());
        const versions = readPlaygroundEvaluationVersions(normalizedSet);
        if (versions.length > 0) {
          return createPlaygroundEvaluationWithVersionList(normalizedSet, versions);
        }
        const initialVersion = createPlaygroundEvaluationVersion(normalizedSet, [], {
          status: "active",
          label: "Version 1",
          description: "Initial version",
        });
        return createPlaygroundEvaluationWithVersionList(normalizedSet, [initialVersion], initialVersion.id);
      }

      const playgroundEvaluationVersionController = createPlaygroundVersionController({
        getMetadata: (set) => (
          set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata)
            ? set.metadata
            : {}
        ),
        readVersions: readPlaygroundEvaluationVersions,
        normalizeVersions: normalizePlaygroundEvaluationVersions,
        createVersion: createPlaygroundEvaluationVersion,
        withVersionList: createPlaygroundEvaluationWithVersionList,
        fromVersionSnapshot: createPlaygroundEvaluationFromVersionSnapshot,
        buildSnapshot: buildPlaygroundEvaluationVersionSnapshot,
        buildComparableSnapshot: buildPlaygroundEvaluationVersionComparableSnapshot,
        getActiveVersionId: (metadata) => (
          metadata.activeEvaluationVersionId
          || metadata.active_evaluation_version_id
          || ""
        ),
        getSelectedVersionId: (metadata, activeVersion) => (
          metadata.restoredFromEvaluationVersionId
          || metadata.restored_from_evaluation_version_id
          || activeVersion?.id
          || ""
        ),
        updateVersionFromResource: updatePlaygroundEvaluationVersionFromSet,
        updateVersionMetadata: updatePlaygroundEvaluationVersionMetadata,
        publishVersion: publishPlaygroundEvaluationVersion,
        supersedeVersion: supersedePlaygroundEvaluationVersion,
        unpublishVersion: unpublishPlaygroundEvaluationVersion,
        applyUnpublishMetadata: (set) => {
          const normalizedSet = normalizePlaygroundEvaluationSet(set);
          const metadata = normalizedSet.metadata && typeof normalizedSet.metadata === "object" && !Array.isArray(normalizedSet.metadata)
            ? { ...normalizedSet.metadata }
            : {};
          delete metadata.publishedAt;
          delete metadata.published_at;
          return normalizePlaygroundEvaluationSet({
            ...normalizedSet,
            metadata,
            publishedAt: "",
          });
        },
      });

      function createPlaygroundEvaluationVersionRowSlug(row, index = 0) {
        const source = String(row?.input || row?.id || ("case " + (index + 1))).trim().toLowerCase();
        const slug = source
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60);
        return slug || ("case-" + (index + 1));
      }

      function buildPlaygroundEvaluationVersionDiffFilesFromSnapshots(baseSnapshot, targetSnapshot) {
        if (!baseSnapshot || !targetSnapshot) {
          return [];
        }
        const normalizedBaseSnapshot = normalizePlaygroundEvaluationVersion({ snapshot: baseSnapshot }).snapshot;
        const normalizedTargetSnapshot = normalizePlaygroundEvaluationVersion({ snapshot: targetSnapshot }).snapshot;
        const baseRows = Array.isArray(normalizedBaseSnapshot.dataRows) ? normalizedBaseSnapshot.dataRows : [];
        const targetRows = Array.isArray(normalizedTargetSnapshot.dataRows) ? normalizedTargetSnapshot.dataRows : [];
        const rowIds = Array.from(new Set(baseRows.concat(targetRows).map((row, index) => (
          String(row?.id || ("row_" + (index + 1))).trim()
        )))).filter(Boolean);
        const files = [
          createPlaygroundVersionDiffFile({
            id: "config",
            path: "evaluation/config.json",
            before: {
              name: normalizedBaseSnapshot.name,
              passThreshold: normalizedBaseSnapshot.passThreshold,
              evaluator: normalizedBaseSnapshot.evaluator,
              targetAgentId: normalizedBaseSnapshot.targetAgentId,
              environmentType: normalizedBaseSnapshot.environmentType,
              environmentId: normalizedBaseSnapshot.environmentId,
              projectId: normalizedBaseSnapshot.projectId,
              cases: baseRows.map((row, index) => ({
                id: String(row?.id || ("row_" + (index + 1))).trim(),
                runCount: normalizePlaygroundEvaluationCaseRunCount(row?.runCount),
              })),
            },
            after: {
              name: normalizedTargetSnapshot.name,
              passThreshold: normalizedTargetSnapshot.passThreshold,
              evaluator: normalizedTargetSnapshot.evaluator,
              targetAgentId: normalizedTargetSnapshot.targetAgentId,
              environmentType: normalizedTargetSnapshot.environmentType,
              environmentId: normalizedTargetSnapshot.environmentId,
              projectId: normalizedTargetSnapshot.projectId,
              cases: targetRows.map((row, index) => ({
                id: String(row?.id || ("row_" + (index + 1))).trim(),
                runCount: normalizePlaygroundEvaluationCaseRunCount(row?.runCount),
              })),
            },
          }),
          createPlaygroundVersionDiffFile({
            id: "description",
            path: "evaluation/description.md",
            before: normalizedBaseSnapshot.description || "",
            after: normalizedTargetSnapshot.description || "",
          }),
          createPlaygroundVersionDiffFile({
            id: "guidance",
            path: "evaluation/guidance.md",
            before: normalizedBaseSnapshot.evaluationGuidance || "",
            after: normalizedTargetSnapshot.evaluationGuidance || "",
          }),
        ];
        rowIds.forEach((rowId, index) => {
          const baseRow = baseRows.find((row) => String(row?.id || "").trim() === rowId) || null;
          const targetRow = targetRows.find((row) => String(row?.id || "").trim() === rowId) || null;
          const displayRow = targetRow || baseRow || {};
          files.push(createPlaygroundVersionDiffFile({
            id: "case:" + rowId,
            path: "evaluation/cases/" + createPlaygroundEvaluationVersionRowSlug(displayRow, index) + ".json",
            before: baseRow ? {
              input: baseRow.input,
              expectedOutput: baseRow.expectedOutput,
              evaluationGuidance: baseRow.evaluationGuidance,
              runCount: normalizePlaygroundEvaluationCaseRunCount(baseRow.runCount),
            } : null,
            after: targetRow ? {
              input: targetRow.input,
              expectedOutput: targetRow.expectedOutput,
              evaluationGuidance: targetRow.evaluationGuidance,
              runCount: normalizePlaygroundEvaluationCaseRunCount(targetRow.runCount),
            } : null,
          }));
        });
        return files.filter(Boolean);
      }

`;

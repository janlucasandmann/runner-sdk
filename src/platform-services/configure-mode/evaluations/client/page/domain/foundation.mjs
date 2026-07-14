export const EVALUATIONS_PAGE_FOUNDATION_SCRIPT = String.raw`
      const PLAYGROUND_EVALUATIONS_STORAGE_KEY = "runner_demo_evaluation_sets_v1";

      function createPlaygroundEvaluationId(prefix = "eval") {
        return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      }

      function normalizePlaygroundEvaluationPassThreshold(value, fallback = 0.8) {
        const fallbackScore = Math.max(0, Math.min(1, Number(fallback) || 0.8));
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) return fallbackScore;
        const normalizedValue = numericValue > 1 ? numericValue / 100 : numericValue;
        return Math.max(0, Math.min(1, normalizedValue));
      }

      function normalizePlaygroundEvaluationTokenCount(value) {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue)) : 0;
      }

      function normalizePlaygroundEvaluationUsdCost(value) {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
      }

      function readPlaygroundEvaluationUsdCost(source) {
        const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
        const usage = record.usage && typeof record.usage === "object" && !Array.isArray(record.usage) ? record.usage : {};
        const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
        const candidates = [
          record.costUsd,
          record.costUSD,
          record.cost_usd,
          record.usdCost,
          record.usd_cost,
          record.totalCostUsd,
          record.totalCostUSD,
          record.total_cost_usd,
          record.totalUsd,
          record.totalUSD,
          record.total_usd,
          usage.costUsd,
          usage.costUSD,
          usage.cost_usd,
          usage.usdCost,
          usage.usd_cost,
          usage.totalCostUsd,
          usage.totalCostUSD,
          usage.total_cost_usd,
          usage.totalUsd,
          usage.totalUSD,
          usage.total_usd,
          metadata.costUsd,
          metadata.costUSD,
          metadata.cost_usd,
          metadata.usdCost,
          metadata.usd_cost,
          metadata.totalCostUsd,
          metadata.totalCostUSD,
          metadata.total_cost_usd,
          metadata.totalUsd,
          metadata.totalUSD,
          metadata.total_usd,
        ];
        for (const candidate of candidates) {
          const numericValue = Number(candidate);
          if (Number.isFinite(numericValue) && numericValue > 0) {
            return numericValue;
          }
        }
        const legacyTokens = normalizePlaygroundEvaluationTokenCount(
          record.costTokens
          ?? record.cost_tokens
          ?? record.costCt
          ?? record.costCT
          ?? record.cost_ct
          ?? record.computeTokens
          ?? record.compute_tokens
          ?? record.totalCT
          ?? record.totalCt
          ?? record.total_ct
          ?? record.ct
        );
        return legacyTokens > 0 ? legacyTokens / 100 : 0;
      }

      function normalizePlaygroundEvaluationCaseRunCount(value, fallback = 1) {
        const fallbackCount = Math.max(1, Math.min(50, Math.round(Number(fallback) || 1)));
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) return fallbackCount;
        return Math.max(1, Math.min(50, Math.round(numericValue)));
      }

      function normalizePlaygroundEvaluationEvaluator(rawEvaluator = {}) {
        const source = rawEvaluator && typeof rawEvaluator === "object" && !Array.isArray(rawEvaluator) ? rawEvaluator : {};
        const rawType = String(source.type || source.evaluatorType || "").trim().toLowerCase();
        const type = ["agent", "code", "exact"].includes(rawType) ? rawType : "agent";
        return {
          type,
          agentId: String(source.agentId || source.agent_id || "").trim(),
          code: String(source.code || ""),
        };
      }

      function getPlaygroundEvaluationEvaluatorLabel(evaluator, agents = []) {
        const normalized = normalizePlaygroundEvaluationEvaluator(evaluator);
        if (normalized.type === "agent") {
          const agent = (Array.isArray(agents) ? agents : []).find((item) => String(item?.id || "").trim() === normalized.agentId);
          return agent?.name || agent?.label || normalized.agentId || "Agent evaluator";
        }
        if (normalized.type === "code") {
          return "Code evaluator";
        }
        return "Exact output";
      }

      function normalizePlaygroundEvaluationPersonIdentity(rawValue = {}) {
        if (typeof rawValue === "string") {
          const value = rawValue.trim();
          return {
            id: value,
            userId: "",
            name: value.includes("@") ? "" : value,
            email: value.includes("@") ? value : "",
            avatarUrl: "",
          };
        }
        const source = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) ? rawValue : {};
        return {
          id: String(source.id || source.userId || source.user_id || source.uid || source.email || "").trim(),
          userId: String(source.userId || source.user_id || source.uid || "").trim(),
          name: String(source.name || source.displayName || source.display_name || source.label || source.title || "").trim(),
          email: String(source.email || source.mail || "").trim(),
          avatarUrl: String(source.avatarUrl || source.avatar_url || source.photoUrl || source.photoURL || source.imageUrl || source.imageURL || source.avatar || "").trim(),
        };
      }

      function getPlaygroundEvaluationCreatorIdentity(source = {}) {
        const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
        const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
        const nested = record.creator || record.createdBy || record.created_by || metadata.creator || metadata.createdBy || metadata.created_by || record.owner || metadata.owner || null;
        const direct = normalizePlaygroundEvaluationPersonIdentity({
          id: record.creatorId || record.creator_id || record.createdById || record.created_by_id || metadata.creatorId || metadata.creator_id || metadata.createdById || metadata.created_by_id || record.userId || record.user_id,
          userId: record.creatorUserId || record.creator_user_id || metadata.creatorUserId || metadata.creator_user_id || record.userId || record.user_id,
          name: record.creatorName || record.creator_name || record.createdByName || record.created_by_name || metadata.creatorName || metadata.creator_name || metadata.createdByName || metadata.created_by_name,
          email: record.creatorEmail || record.creator_email || record.createdByEmail || record.created_by_email || metadata.creatorEmail || metadata.creator_email || metadata.createdByEmail || metadata.created_by_email,
          avatarUrl: record.creatorAvatarUrl || record.creator_avatar_url || record.createdByAvatarUrl || record.created_by_avatar_url || metadata.creatorAvatarUrl || metadata.creator_avatar_url || metadata.createdByAvatarUrl || metadata.created_by_avatar_url,
        });
        const nestedIdentity = normalizePlaygroundEvaluationPersonIdentity(nested || {});
        return {
          id: nestedIdentity.id || direct.id,
          userId: nestedIdentity.userId || direct.userId,
          name: nestedIdentity.name || direct.name,
          email: nestedIdentity.email || direct.email,
          avatarUrl: nestedIdentity.avatarUrl || direct.avatarUrl,
        };
      }

      function getPlaygroundEvaluationCreatorLabel(creator) {
        const identity = normalizePlaygroundEvaluationPersonIdentity(creator);
        return String(identity.name || identity.email || identity.id || identity.userId || "").trim();
      }

      function normalizePlaygroundEvaluationDataRow(row, fallbackIndex = 0) {
        const source = row && typeof row === "object" && !Array.isArray(row) ? row : {};
        const input = typeof source.input === "string"
          ? source.input
          : typeof source.prompt === "string"
            ? source.prompt
            : source.input !== undefined
              ? JSON.stringify(source.input)
              : "";
        const expectedOutput = typeof source.expectedOutput === "string"
          ? source.expectedOutput
          : typeof source.expected_output === "string"
            ? source.expected_output
            : typeof source.output === "string"
              ? source.output
              : source.expected !== undefined
                ? JSON.stringify(source.expected)
                : "";
        return {
          id: String(source.id || source.caseId || source.case_id || "").trim() || createPlaygroundEvaluationId("eval_case"),
          input,
          expectedOutput,
          evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || source.rubric || ""),
          runCount: normalizePlaygroundEvaluationCaseRunCount(source.runCount ?? source.run_count ?? source.runs ?? source.repeatCount ?? source.repeat_count ?? source.repetitions ?? 1),
          sourceThreadId: String(source.sourceThreadId || source.source_thread_id || source.metadata?.sourceThreadId || source.metadata?.source_thread_id || "").trim(),
          sourceThreadTitle: String(source.sourceThreadTitle || source.source_thread_title || source.metadata?.sourceThreadTitle || source.metadata?.source_thread_title || "").trim(),
          sourceAgentId: String(source.sourceAgentId || source.source_agent_id || source.metadata?.sourceAgentId || source.metadata?.source_agent_id || "").trim(),
          sourceAgentName: String(source.sourceAgentName || source.source_agent_name || source.metadata?.sourceAgentName || source.metadata?.source_agent_name || "").trim(),
          sourceEnvironmentId: String(source.sourceEnvironmentId || source.source_environment_id || source.metadata?.sourceEnvironmentId || source.metadata?.source_environment_id || "").trim(),
          sourceEnvironmentName: String(source.sourceEnvironmentName || source.source_environment_name || source.metadata?.sourceEnvironmentName || source.metadata?.source_environment_name || "").trim(),
          sourceCreatedAt: String(source.sourceCreatedAt || source.source_created_at || source.metadata?.sourceCreatedAt || source.metadata?.source_created_at || "").trim(),
          sourceUpdatedAt: String(source.sourceUpdatedAt || source.source_updated_at || source.metadata?.sourceUpdatedAt || source.metadata?.source_updated_at || "").trim(),
          reviewStatus: ["draft", "ready", "needs_review"].includes(String(source.reviewStatus || source.review_status || "").trim().toLowerCase())
            ? String(source.reviewStatus || source.review_status || "").trim().toLowerCase()
            : "",
          metadata: source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : null,
          createdAt: String(source.createdAt || source.created_at || new Date(Date.now() + fallbackIndex).toISOString()),
          updatedAt: String(source.updatedAt || source.updated_at || source.createdAt || source.created_at || new Date().toISOString()),
        };
      }

      function normalizePlaygroundEvaluationRunCase(rawCase, fallbackIndex = 0) {
        const source = rawCase && typeof rawCase === "object" && !Array.isArray(rawCase) ? rawCase : {};
        const score = Number(source.score);
        return {
          id: String(source.id || source.caseRunId || source.case_run_id || "").trim() || createPlaygroundEvaluationId("eval_run_case"),
          dataRowId: String(source.dataRowId || source.data_row_id || source.caseId || source.case_id || "").trim(),
          dataRowRunIndex: normalizePlaygroundEvaluationCaseRunCount(source.dataRowRunIndex ?? source.data_row_run_index ?? source.repeatIndex ?? source.repeat_index ?? 1),
          dataRowRunCount: normalizePlaygroundEvaluationCaseRunCount(source.dataRowRunCount ?? source.data_row_run_count ?? source.repeatCount ?? source.repeat_count ?? 1),
          threadId: String(source.threadId || source.thread_id || "").trim(),
          evaluatorThreadId: String(source.evaluatorThreadId || source.evaluator_thread_id || "").trim(),
          input: String(source.input || ""),
          expectedOutput: String(source.expectedOutput || source.expected_output || ""),
          evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || source.rubric || ""),
          actualOutput: String(source.actualOutput || source.actual_output || ""),
          evaluatorOutput: String(source.evaluatorOutput || source.evaluator_output || ""),
          evaluatorReason: String(source.evaluatorReason || source.evaluator_reason || ""),
          evaluatorParseStatus: String(source.evaluatorParseStatus || source.evaluator_parse_status || ""),
          snapshotVersion: String(source.snapshotVersion || source.snapshot_version || ""),
          score: Number.isFinite(score) ? Math.max(0, Math.min(1, score)) : 0,
          costTokens: normalizePlaygroundEvaluationTokenCount(
            source.costTokens
            ?? source.cost_tokens
            ?? source.costCt
            ?? source.costCT
            ?? source.cost_ct
            ?? source.computeTokens
            ?? source.compute_tokens
            ?? source.totalCT
            ?? source.totalCt
            ?? source.total_ct
            ?? source.ct
            ?? source.usage?.costCt
            ?? source.usage?.costCT
            ?? source.usage?.cost_ct
            ?? source.usage?.computeTokens
            ?? source.usage?.compute_tokens
            ?? source.usage?.totalCT
            ?? source.usage?.totalCt
            ?? source.usage?.total_ct
            ?? source.usage?.ct
          ),
          costUsd: readPlaygroundEvaluationUsdCost(source),
          costSource: String(source.costSource || source.cost_source || ""),
          status: ["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring", "completed", "passed", "failed", "error"].includes(String(source.status || "").trim().toLowerCase())
            ? String(source.status || "").trim().toLowerCase()
            : "queued",
          latencyMs: Math.max(0, Number(source.latencyMs || source.latency_ms || 0) || 0),
          error: String(source.error || ""),
        };
      }

      function normalizePlaygroundEvaluationRun(rawRun, fallbackIndex = 0) {
        const source = rawRun && typeof rawRun === "object" && !Array.isArray(rawRun) ? rawRun : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
        const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : {};
        const cases = Array.isArray(source.cases) ? source.cases.map((item, index) => normalizePlaygroundEvaluationRunCase(item, index)) : [];
        const passThreshold = normalizePlaygroundEvaluationPassThreshold(source.passThreshold ?? source.pass_threshold ?? source.threshold ?? 0.8);
        const averageScore = cases.length > 0
          ? cases.reduce((sum, item) => sum + Number(item.score || 0), 0) / cases.length
          : Number(source.averageScore || source.average_score || 0) || 0;
        const activeStatuses = new Set(["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring"]);
        const passedCount = cases.filter((item) => !activeStatuses.has(item.status) && item.status !== "error" && Number(item.score || 0) >= passThreshold).length;
        const costTokens = normalizePlaygroundEvaluationTokenCount(
          source.costTokens
          ?? source.cost_tokens
          ?? source.costCt
          ?? source.costCT
          ?? source.cost_ct
          ?? source.computeTokens
          ?? source.compute_tokens
          ?? source.totalCT
          ?? source.totalCt
          ?? source.total_ct
          ?? source.ct
          ?? cases.reduce((sum, item) => sum + normalizePlaygroundEvaluationTokenCount(item.costTokens), 0)
        );
        const costUsd = normalizePlaygroundEvaluationUsdCost(
          readPlaygroundEvaluationUsdCost(source)
          || cases.reduce((sum, item) => sum + normalizePlaygroundEvaluationUsdCost(item.costUsd), 0)
        );
        return {
          id: String(source.id || source.runId || source.run_id || "").trim() || createPlaygroundEvaluationId("eval_run"),
          evaluationSetId: String(source.evaluationSetId || source.evaluation_set_id || "").trim(),
          evaluationVersionId: String(source.evaluationVersionId || source.evaluation_version_id || "").trim(),
          evaluationVersionNumber: Math.max(0, Number(source.evaluationVersionNumber || source.evaluation_version_number || 0) || 0),
          evaluationVersionLabel: String(source.evaluationVersionLabel || source.evaluation_version_label || "").trim(),
          label: String(source.label || source.name || ("Run " + (fallbackIndex + 1))).trim(),
          status: ["queued", "running", "completed", "failed"].includes(String(source.status || "").trim().toLowerCase())
            ? String(source.status || "").trim().toLowerCase()
            : "completed",
          createdAt: String(source.createdAt || source.created_at || new Date().toISOString()),
          completedAt: String(source.completedAt || source.completed_at || source.updatedAt || source.updated_at || new Date().toISOString()),
          targetAgentId: String(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id || "").trim(),
          targetAgentName: String(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name || "").trim(),
          targetAgentPhotoUrl: String(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL || "").trim(),
          targetAgentVersionId: String(source.targetAgentVersionId || source.target_agent_version_id || source.agentVersionId || source.agent_version_id || runnerPlayground.targetAgentVersionId || runnerPlayground.target_agent_version_id || runnerPlayground.agentVersionId || runnerPlayground.agent_version_id || metadata.targetAgentVersionId || metadata.target_agent_version_id || metadata.agentVersionId || metadata.agent_version_id || "").trim(),
          targetAgentVersionNumber: Math.max(0, Number(source.targetAgentVersionNumber || source.target_agent_version_number || source.agentVersionNumber || source.agent_version_number || source.versionNumber || source.version_number || runnerPlayground.targetAgentVersionNumber || runnerPlayground.target_agent_version_number || metadata.targetAgentVersionNumber || metadata.target_agent_version_number || 0) || 0),
          targetAgentVersionLabel: String(source.targetAgentVersionLabel || source.target_agent_version_label || source.agentVersionLabel || source.agent_version_label || source.versionLabel || source.version_label || runnerPlayground.targetAgentVersionLabel || runnerPlayground.target_agent_version_label || metadata.targetAgentVersionLabel || metadata.target_agent_version_label || "").trim(),
          targetAgentVersionRevisionId: String(source.targetAgentVersionRevisionId || source.target_agent_version_revision_id || source.agentVersionRevisionId || source.agent_version_revision_id || source.revisionId || source.revision_id || runnerPlayground.targetAgentVersionRevisionId || runnerPlayground.target_agent_version_revision_id || metadata.targetAgentVersionRevisionId || metadata.target_agent_version_revision_id || "").trim(),
          fineTuningJobId: String(source.fineTuningJobId || source.fine_tuning_job_id || runnerPlayground.fineTuningJobId || runnerPlayground.fine_tuning_job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id || "").trim(),
          fine_tuning_job_id: String(source.fine_tuning_job_id || source.fineTuningJobId || runnerPlayground.fine_tuning_job_id || runnerPlayground.fineTuningJobId || metadata.fine_tuning_job_id || metadata.fineTuningJobId || "").trim(),
          environmentType: String(source.environmentType || source.environment_type || source.targetEnvironmentType || source.target_environment_type || "").trim().toLowerCase() === "project" ? "project" : "computer",
          environmentId: String(source.environmentId || source.environment_id || source.computerId || source.computer_id || "").trim(),
          environmentName: String(source.environmentName || source.environment_name || source.computerName || source.computer_name || "").trim(),
          projectId: String(source.projectId || source.project_id || "").trim(),
          projectName: String(source.projectName || source.project_name || "").trim(),
          evaluator: normalizePlaygroundEvaluationEvaluator(source.evaluator),
          passThreshold,
          datasetVersion: String(source.datasetVersion || source.dataset_version || ""),
          evaluatorVersion: String(source.evaluatorVersion || source.evaluator_version || ""),
          averageScore: Math.max(0, Math.min(1, averageScore)),
          passedCount,
          totalCount: cases.length,
          costTokens,
          costUsd,
          costSource: String(source.costSource || source.cost_source || ""),
          metadata: Object.keys(metadata).length ? metadata : null,
          cases,
        };
      }

      function normalizePlaygroundEvaluationSet(record) {
        const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
        const nowIso = new Date().toISOString();
        const dataRows = Array.isArray(source.dataRows)
          ? source.dataRows
          : Array.isArray(source.data_rows)
            ? source.data_rows
            : Array.isArray(source.data)
              ? source.data
              : Array.isArray(source.cases)
                ? source.cases
                : [];
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : null;
        const runs = Array.isArray(source.runs)
          ? source.runs
          : Array.isArray(source.evaluationRuns)
            ? source.evaluationRuns
            : Array.isArray(source.evaluation_runs)
              ? source.evaluation_runs
              : Array.isArray(metadata?.runs)
                ? metadata.runs
                : Array.isArray(metadata?.evaluationRuns)
                  ? metadata.evaluationRuns
                  : Array.isArray(metadata?.evaluation_runs)
                    ? metadata.evaluation_runs
                    : [];
        const creator = getPlaygroundEvaluationCreatorIdentity(source);
        const metadataRecord = metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {};
        const passThreshold = normalizePlaygroundEvaluationPassThreshold(source.passThreshold ?? source.pass_threshold ?? metadataRecord.passThreshold ?? metadataRecord.pass_threshold ?? source.threshold ?? metadataRecord.threshold ?? 0.8);
        return {
          id: String(source.id || source.evaluationId || source.evaluation_id || "").trim() || createPlaygroundEvaluationId("eval_set"),
          name: String(source.name || source.title || "Untitled Evaluation").trim() || "Untitled Evaluation",
          description: String(source.description || ""),
          evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || metadataRecord.evaluationGuidance || metadataRecord.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || metadataRecord.scoringGuidance || metadataRecord.scoring_guidance || source.rubric || metadataRecord.rubric || ""),
          passThreshold,
          evaluator: normalizePlaygroundEvaluationEvaluator(source.evaluator || metadataRecord.evaluator || {}),
          targetAgentId: String(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id || metadataRecord.targetAgentId || metadataRecord.target_agent_id || metadataRecord.agentId || metadataRecord.agent_id || "").trim(),
          environmentType: String(source.environmentType || source.environment_type || metadataRecord.environmentType || metadataRecord.environment_type || "").trim().toLowerCase() === "project" ? "project" : "computer",
          environmentId: String(source.environmentId || source.environment_id || source.computerId || source.computer_id || metadataRecord.environmentId || metadataRecord.environment_id || metadataRecord.computerId || metadataRecord.computer_id || "").trim(),
          projectId: String(source.projectId || source.project_id || metadataRecord.projectId || metadataRecord.project_id || "").trim(),
          dataRows: dataRows.map((row, index) => normalizePlaygroundEvaluationDataRow(row, index)),
          runs: runs.map((run, index) => normalizePlaygroundEvaluationRun({ passThreshold, ...(run || {}) }, index)),
          creator,
          createdBy: creator,
          metadata,
          createdAt: String(source.createdAt || source.created_at || nowIso),
          updatedAt: String(source.updatedAt || source.updated_at || nowIso),
        };
      }

      function createPlaygroundEvaluationSetDraft(overrides = {}) {
        const nowIso = new Date().toISOString();
        return normalizePlaygroundEvaluationSet({
          id: createPlaygroundEvaluationId("eval_set"),
          name: "New Evaluation",
          description: "",
          passThreshold: 0.8,
          evaluator: { type: "agent" },
          targetAgentId: "",
          environmentType: "computer",
          environmentId: "",
          projectId: "",
          dataRows: [
            {
              input: "Summarize the customer request in one sentence.",
              expectedOutput: "A concise one-sentence summary of the request.",
              evaluationGuidance: "",
              createdAt: nowIso,
              updatedAt: nowIso,
            },
          ],
          runs: [],
          createdAt: nowIso,
          updatedAt: nowIso,
          ...overrides,
        });
      }

`;


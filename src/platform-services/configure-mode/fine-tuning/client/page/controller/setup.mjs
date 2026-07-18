export const FINE_TUNING_PAGE_CONTROLLER_SETUP_SCRIPT = String.raw`      function renderPlaygroundFineTuningPage(props = {}) {
        const {
          backendUrl = "",
          requestHeaders = {},
          agents = [],
          environments = [],
          evaluationSets = [],
          setEvaluationSets,
          fineTuningJobs = [],
          setFineTuningJobs,
          selectedFineTuningJobId = "",
          setSelectedFineTuningJobId,
          fineTuningPageMode = "overview",
          setFineTuningPageMode,
          fineTuningCreateModalOpen = false,
          setFineTuningCreateModalOpen,
          fineTuningCreateForm = {},
          setFineTuningCreateForm,
          defaultAgentId = "",
          defaultEnvironmentId = "",
          onOpenThread,
          onOpenEvaluationRun,
          onFineTuningThreadStarted,
          onAgentsRefresh,
          onAgentVersionCreated,
          currentUserId = "",
          currentUserName = "",
          currentUserEmail = "",
          currentUserAvatarUrl = "",
          shouldLoadData = false,
        } = props;

        const modalFrameRef = useRef(null);
        const modalCloseTimerRef = useRef(null);
        const fineTuningInstructionsTextareaRef = useRef(null);
        const evaluationSetPickerRef = useRef(null);
        const fineTuningVersionRetryRef = useRef(new Set());
        const fineTuningRuntimeHydrationRef = useRef(new Set());
        const fineTuningThreadNotificationRef = useRef(new Set());
        const fineTuningJobListLoadRef = useRef("");
        const [modalVisible, setModalVisible] = useState(false);
        const [modalClosing, setModalClosing] = useState(false);
        const [createError, setCreateError] = useState("");
        const [createBusy, setCreateBusy] = useState(false);
        const [fineTuningJobsLoading, setFineTuningJobsLoading] = useState(false);
        const [fineTuningDetailTab, setFineTuningDetailTab] = useState("analysis");
        const [fineTuningStopJobId, setFineTuningStopJobId] = useState("");
        const [evaluationSetPickerOpen, setEvaluationSetPickerOpen] = useState(false);
        const [isFineTuningInstructionsEditing, setIsFineTuningInstructionsEditing] = useState(false);
        const [fineTuningInstructionsHistory, setFineTuningInstructionsHistory] = useState({ past: [], future: [] });
        const requestHeadersSignature = useMemo(() => JSON.stringify(requestHeaders || {}), [requestHeaders]);

        const normalizedJobs = useMemo(() => (Array.isArray(fineTuningJobs) ? fineTuningJobs : [])
          .map((job, index) => normalizePlaygroundFineTuningJob(job, index))
          .sort((left, right) => (Date.parse(right.updatedAt || 0) || 0) - (Date.parse(left.updatedAt || 0) || 0)), [fineTuningJobs]);
        const normalizedSelectedFineTuningJobId = useMemo(
          () => normalizePlaygroundFineTuningString(selectedFineTuningJobId),
          [selectedFineTuningJobId]
        );
        const normalizedAgents = useMemo(() => (Array.isArray(agents) ? agents : []).filter((agent) => normalizePlaygroundFineTuningString(agent?.id)), [agents]);
        const normalizedEnvironments = useMemo(() => (Array.isArray(environments) ? environments : []).filter((environment) => normalizePlaygroundFineTuningString(environment?.id)), [environments]);
        const normalizedEvaluationSets = useMemo(() => (Array.isArray(evaluationSets) ? evaluationSets : [])
          .map((set, index) => resolvePlaygroundFineTuningPublishedEvaluationSource(set, index))
          .filter((set) => normalizePlaygroundFineTuningString(set?.id)), [evaluationSets]);
        function getFineTuningRunTimestamp(run) {
          return Date.parse(String(run?.createdAt || run?.created_at || run?.completedAt || run?.completed_at || run?.updatedAt || run?.updated_at || "")) || 0;
        }
        function findFineTuningVerificationRun(job, reference, set) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedReference = normalizePlaygroundFineTuningRunReference(reference);
          const normalizedSet = set && typeof set === "object" && !Array.isArray(set) ? set : null;
          if (!normalizedSet) return null;
          if (normalizedReference.afterRunId) {
            const exactRun = getPlaygroundFineTuningRunById(normalizedSet, normalizedReference.afterRunId);
            if (exactRun) return exactRun;
          }
          const versionId = normalizePlaygroundFineTuningString(normalizedJob.createdAgentVersion?.id || normalizedJob.createdAgentVersionId || normalizedJob.created_agent_version_id);
          const jobCreatedAt = Date.parse(String(normalizedJob.createdAt || "")) || 0;
          const candidates = getPlaygroundFineTuningRuns(normalizedSet)
            .map((run) => normalizeFineTuningEvaluationRun(run))
            .filter((run) => {
              const runVersionId = normalizePlaygroundFineTuningString(run.targetAgentVersionId || run.target_agent_version_id || run.agentVersionId || run.agent_version_id);
              const metadata = run.metadata && typeof run.metadata === "object" && !Array.isArray(run.metadata) ? run.metadata : {};
              const runJobId = normalizePlaygroundFineTuningString(run.fineTuningJobId || run.fine_tuning_job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id);
              const runLabel = normalizePlaygroundFineTuningString(run.label || run.name || run.title).toLowerCase();
              const runTime = getFineTuningRunTimestamp(run);
              const matchesJob = runJobId && runJobId === normalizedJob.id;
              const matchesVersion = versionId && runVersionId && runVersionId === versionId;
              const looksLikeVerification = runLabel.includes("fine-tune verification") || runLabel.includes("fine tuning verification") || runLabel.includes("verification");
              const isAfterJob = !jobCreatedAt || !runTime || runTime >= jobCreatedAt - 60000;
              return matchesJob || matchesVersion || (looksLikeVerification && isAfterJob);
            })
            .sort((left, right) => getFineTuningRunTimestamp(right) - getFineTuningRunTimestamp(left));
          return candidates[0] || null;
        }
        function resolveFineTuningJobScoresFromEvaluationRuns(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const nextReferences = normalizedJob.evaluationRuns.map((reference, index) => {
            const normalizedReference = normalizePlaygroundFineTuningRunReference(reference, index);
            const set = normalizedEvaluationSets.find((item) => normalizePlaygroundFineTuningString(item?.id) === normalizedReference.evaluationSetId) || null;
            const beforeRun = normalizedReference.beforeRunId && set ? getPlaygroundFineTuningRunById(set, normalizedReference.beforeRunId) : null;
            const afterRun = findFineTuningVerificationRun(normalizedJob, normalizedReference, set);
            const nextReference = {
              ...normalizedReference,
              evaluationSetName: normalizedReference.evaluationSetName || normalizePlaygroundFineTuningString(set?.name),
            };
            if (beforeRun) {
              nextReference.beforeRunId = normalizePlaygroundFineTuningString(beforeRun.id || nextReference.beforeRunId);
              nextReference.beforeRunLabel = normalizePlaygroundFineTuningString(beforeRun.label || beforeRun.name || beforeRun.title || nextReference.beforeRunLabel);
              nextReference.beforeScore = getFineTuningEvaluationRunScore(beforeRun);
              nextReference.beforeCostUsd = getFineTuningEvaluationRunCostUsd(beforeRun);
            }
            if (afterRun) {
              nextReference.afterRunId = normalizePlaygroundFineTuningString(afterRun.id || nextReference.afterRunId);
              nextReference.afterRunLabel = normalizePlaygroundFineTuningString(afterRun.label || afterRun.name || afterRun.title || nextReference.afterRunLabel || "Verification Run");
              nextReference.afterScore = getFineTuningEvaluationRunScore(afterRun);
              nextReference.afterCostUsd = getFineTuningEvaluationRunCostUsd(afterRun);
              nextReference.status = normalizePlaygroundFineTuningString(afterRun.status || nextReference.status || "completed");
            }
            return nextReference;
          });
          if (!nextReferences.length) return normalizedJob;
          const beforeScores = nextReferences
            .map((reference) => Number(reference.beforeScore))
            .filter((score) => Number.isFinite(score));
          const finishedAfterScores = nextReferences
            .filter((reference) => hasPlaygroundFineTuningAfterResult({ status: normalizedJob.status, evaluationRuns: [reference] }))
            .map((reference) => Number(reference.afterScore))
            .filter((score) => Number.isFinite(score));
          const hasActiveRuns = nextReferences.some((reference) => reference.afterRunId && isPlaygroundFineTuningActiveStatus(reference.status));
          const allReferencesFinished = nextReferences.length > 0 && nextReferences.every((reference) => hasPlaygroundFineTuningAfterResult({ status: normalizedJob.status, evaluationRuns: [reference] }));
          const beforeScore = beforeScores.length
            ? normalizePlaygroundFineTuningScore(beforeScores.reduce((sum, score) => sum + score, 0) / beforeScores.length)
            : normalizedJob.beforeScore;
          const afterScore = finishedAfterScores.length
            ? normalizePlaygroundFineTuningScore(finishedAfterScores.reduce((sum, score) => sum + score, 0) / finishedAfterScores.length)
            : normalizedJob.afterScore;
          const nextStatus = allReferencesFinished
            ? "completed"
            : hasActiveRuns
              ? "verifying"
              : normalizedJob.status;
          const verificationCostUsd = nextReferences
            .filter((reference) => hasPlaygroundFineTuningAfterResult({ status: nextStatus, evaluationRuns: [reference] }))
            .reduce((sum, reference) => sum + normalizePlaygroundFineTuningUsdCost(reference.afterCostUsd), 0);
          const fineTuningCostUsd = normalizePlaygroundFineTuningUsdCost(normalizedJob.fineTuningCostUsd || readPlaygroundFineTuningUsdCostWithLegacyCt(normalizedJob));
          return normalizePlaygroundFineTuningJob({
            ...normalizedJob,
            status: nextStatus,
            beforeScore,
            afterScore,
            improvementScore: finishedAfterScores.length ? normalizePlaygroundFineTuningScore(Math.max(0, afterScore - beforeScore)) : normalizedJob.improvementScore,
            fineTuningCostUsd,
            verificationCostUsd,
            totalCostUsd: fineTuningCostUsd + verificationCostUsd,
            evaluationRuns: nextReferences,
          });
        }
        const shouldRecoverFineTuningJobsFromVersions = useMemo(() => {
          if (normalizedJobs.length === 0) return true;
          if (!normalizedSelectedFineTuningJobId) return false;
          return !normalizedJobs.some((job) => job.id === normalizedSelectedFineTuningJobId);
        }, [normalizedJobs, normalizedSelectedFineTuningJobId]);
        const versionRecoveredJobs = useMemo(
          () => shouldRecoverFineTuningJobsFromVersions ? buildFineTuningJobsFromAgentVersions() : [],
          [normalizedAgents, shouldRecoverFineTuningJobsFromVersions]
        );
        const displaySourceJobs = useMemo(() => mergeFineTuningJobLists(normalizedJobs, versionRecoveredJobs), [normalizedJobs, versionRecoveredJobs]);
        const versionEnrichedJobs = useMemo(() => displaySourceJobs.map((job) => (
          needsFineTuningAgentVersionEnrichment(job)
            ? enrichFineTuningJobFromAgentVersions(job)
            : normalizePlaygroundFineTuningJob(job)
        )), [displaySourceJobs, normalizedAgents, normalizedSelectedFineTuningJobId]);
        const scoredJobs = useMemo(() => versionEnrichedJobs.map((job) => (
          needsFineTuningEvaluationScoreResolution(job)
            ? resolveFineTuningJobScoresFromEvaluationRuns(job)
            : normalizePlaygroundFineTuningJob(job)
        )), [versionEnrichedJobs, normalizedEvaluationSets, normalizedSelectedFineTuningJobId]);
        const currentFineTuningUser = useMemo(() => normalizePlaygroundFineTuningPersonIdentity({
          id: currentUserId || currentUserEmail || "",
          userId: currentUserId || "",
          name: currentUserName || "",
          email: currentUserEmail || "",
          avatarUrl: currentUserAvatarUrl || "",
        }), [currentUserId, currentUserName, currentUserEmail, currentUserAvatarUrl]);
        const selectedJob = scoredJobs.find((job) => job.id === selectedFineTuningJobId) || scoredJobs[0] || null;

        function isDefaultFineTuningTargetAgent(agent) {
          const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata) ? agent.metadata : {};
          const normalizedId = normalizePlaygroundFineTuningString(agent?.id || agent?.agentId || agent?.agent_id).toLowerCase();
          return Boolean(
            agent?.isDefault === true
            || agent?.is_default === true
            || agent?.isSystem === true
            || agent?.is_system === true
            || metadata.isDefault === true
            || metadata.is_default === true
            || metadata.isSystem === true
            || metadata.is_system === true
            || normalizedId === "agent_assistant"
            || normalizedId === "agent_default"
            || normalizedId === "agent_research"
            || normalizedId.startsWith("agent-default-")
          );
        }

        function getFineTuningRunTargetAgentInfo(set, run) {
          const sourceRun = run && typeof run === "object" && !Array.isArray(run) ? run : {};
          const sourceSet = set && typeof set === "object" && !Array.isArray(set) ? set : {};
          const id = normalizePlaygroundFineTuningString(
            sourceRun.targetAgentId
            || sourceRun.target_agent_id
            || sourceRun.agentId
            || sourceRun.agent_id
            || sourceSet.targetAgentId
            || sourceSet.target_agent_id
            || sourceSet.agentId
            || sourceSet.agent_id
          );
          return {
            id,
            name: normalizePlaygroundFineTuningString(
              sourceRun.targetAgentName
              || sourceRun.target_agent_name
              || sourceRun.agentName
              || sourceRun.agent_name
              || sourceSet.targetAgentName
              || sourceSet.target_agent_name
              || sourceSet.agentName
              || sourceSet.agent_name
            ),
            photoUrl: normalizePlaygroundFineTuningString(
              sourceRun.targetAgentPhotoUrl
              || sourceRun.target_agent_photo_url
              || sourceRun.agentPhotoUrl
              || sourceRun.agent_photo_url
              || sourceRun.photoUrl
              || sourceRun.photoURL
              || sourceSet.targetAgentPhotoUrl
              || sourceSet.target_agent_photo_url
              || sourceSet.agentPhotoUrl
              || sourceSet.agent_photo_url
              || sourceSet.photoUrl
              || sourceSet.photoURL
            ),
          };
        }

        function findFineTuningAgentById(agentId) {
          const normalizedAgentId = normalizePlaygroundFineTuningString(agentId);
          if (!normalizedAgentId) return null;
          return normalizedAgents.find((agent) => normalizePlaygroundFineTuningString(agent?.id) === normalizedAgentId) || null;
        }

        function resolveFineTuningTargetAgentForSelectedSets(selectedSets) {
          const targets = (Array.isArray(selectedSets) ? selectedSets : [])
            .map((set) => {
              const selectedRun = set?.selectedRun || set?.selected_run || getPlaygroundFineTuningRunById(set, set?.fineTuningRunId || set?.fine_tuning_run_id) || getPlaygroundFineTuningLatestRun(set);
              const target = getFineTuningRunTargetAgentInfo(set, selectedRun);
              return {
                ...target,
                evaluationSetId: normalizePlaygroundFineTuningString(set?.id),
                evaluationSetName: normalizePlaygroundFineTuningString(set?.name),
                runId: normalizePlaygroundFineTuningString(selectedRun?.id || selectedRun?.runId || selectedRun?.run_id),
              };
            })
            .filter((target) => target.id);
          const uniqueTargetIds = Array.from(new Set(targets.map((target) => target.id)));
          if (uniqueTargetIds.length > 1) {
            return {
              error: "Select evaluation runs from one target agent.",
              targetAgent: null,
              targets,
            };
          }
          const target = targets[0] || null;
          if (!target?.id) {
            return {
              error: "Run an evaluation first so fine-tuning can identify the target agent.",
              targetAgent: null,
              targets,
            };
          }
          const knownAgent = findFineTuningAgentById(target.id);
          const targetAgent = {
            ...(knownAgent || {}),
            id: target.id,
            name: target.name || knownAgent?.name || knownAgent?.label || knownAgent?.title || "Target Agent",
            photoUrl: target.photoUrl || knownAgent?.photoUrl || knownAgent?.photoURL || knownAgent?.avatarUrl || knownAgent?.avatarURL || "",
          };
          if (isDefaultFineTuningTargetAgent(targetAgent)) {
            return {
              error: "Default agents cannot be fine-tuned. Create a custom agent and run the evaluation against it first.",
              targetAgent,
              targets,
            };
          }
          return {
            error: "",
            targetAgent,
            targets,
          };
        }

        function findFineTunedAgentVersionForJob(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.id) return null;
          const targetAgentId = normalizePlaygroundFineTuningString(normalizedJob.agentId || normalizedJob.targetAgentId);
          const targetAgent = normalizedAgents.find((agent) => normalizePlaygroundFineTuningString(agent?.id || agent?.agentId || agent?.agent_id) === targetAgentId) || null;
          const versions = getFineTuningAgentVersionList(targetAgent);
          return (Array.isArray(versions) ? versions : []).find((version) => {
            const metadata = readPlaygroundFineTuningPlainObject(version?.metadata);
            return normalizePlaygroundFineTuningString(version?.fineTuningJobId || version?.fine_tuning_job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id) === normalizedJob.id;
          }) || null;
        }

        function enrichFineTuningJobFromAgentVersions(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const version = findFineTunedAgentVersionForJob(normalizedJob);
          if (!version) return normalizedJob;
          const metadata = readPlaygroundFineTuningPlainObject(version.metadata);
          return mergePlaygroundFineTuningJobRecords(normalizedJob, {
            createdAgentVersion: version,
            createdAgentVersionId: normalizePlaygroundFineTuningString(version.id || version.versionId || version.version_id),
            agentVersionCreationStatus: normalizePlaygroundFineTuningString(version.status || normalizedJob.agentVersionCreationStatus || "published"),
            threadId: normalizePlaygroundFineTuningString(metadata.threadId || metadata.thread_id || metadata.fineTuningThreadId || metadata.fine_tuning_thread_id),
            beforeAgentSnapshot: readFirstPlaygroundFineTuningObject(
              metadata.beforeAgentSnapshot,
              metadata.before_agent_snapshot,
              metadata.beforeSnapshot,
              metadata.before_snapshot,
              metadata.baseAgentSnapshot,
              metadata.base_agent_snapshot
            ),
            afterAgentSnapshot: readFirstPlaygroundFineTuningObject(
              version.snapshot,
              metadata.afterAgentSnapshot,
              metadata.after_agent_snapshot,
              metadata.afterSnapshot,
              metadata.after_snapshot
            ),
            diffFiles: readFirstPlaygroundFineTuningArray(metadata.diffFiles, metadata.diff_files, version.diffFiles, version.diff_files),
          });
        }

        function needsFineTuningAgentVersionEnrichment(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.id) return false;
          if (normalizedJob.id !== normalizedSelectedFineTuningJobId && !isPlaygroundFineTuningActiveStatus(normalizedJob.status)) {
            return false;
          }
          return !normalizedJob.createdAgentVersionId
            || !normalizedJob.afterAgentSnapshot
            || !Array.isArray(normalizedJob.diffFiles)
            || normalizedJob.diffFiles.length === 0;
        }

        function needsFineTuningEvaluationScoreResolution(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.id || !normalizedJob.evaluationRuns.length) return false;
          if (normalizedJob.id === normalizedSelectedFineTuningJobId || isPlaygroundFineTuningActiveStatus(normalizedJob.status)) return true;
          if (!hasPlaygroundFineTuningAfterResult(normalizedJob)) return true;
          return normalizedJob.evaluationRuns.some((reference, index) => {
            const normalizedReference = normalizePlaygroundFineTuningRunReference(reference, index);
            return !normalizedReference.evaluationSetName
              || !Number.isFinite(Number(normalizedReference.beforeScore))
              || (normalizedReference.afterRunId && !Number.isFinite(Number(normalizedReference.afterScore)));
          });
        }

        function buildFineTuningJobFromAgentVersion(agent, version, fallbackIndex = 0) {
          const metadata = readPlaygroundFineTuningPlainObject(version?.metadata);
          const fineTuningJobId = normalizePlaygroundFineTuningString(version?.fineTuningJobId || version?.fine_tuning_job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id);
          if (!fineTuningJobId) return null;
          const agentId = normalizePlaygroundFineTuningString(metadata.targetAgentId || metadata.target_agent_id || agent?.id || agent?.agentId || agent?.agent_id);
          const createdAt = normalizePlaygroundFineTuningString(metadata.fineTuningCreatedAt || metadata.fine_tuning_created_at || version?.createdAt || version?.created_at || version?.publishedAt || version?.published_at || new Date().toISOString());
          const updatedAt = normalizePlaygroundFineTuningString(metadata.fineTuningUpdatedAt || metadata.fine_tuning_updated_at || version?.updatedAt || version?.updated_at || version?.publishedAt || version?.published_at || createdAt);
          const beforeSnapshot = readFirstPlaygroundFineTuningObject(
            metadata.beforeAgentSnapshot,
            metadata.before_agent_snapshot,
            metadata.beforeSnapshot,
            metadata.before_snapshot,
            metadata.baseAgentSnapshot,
            metadata.base_agent_snapshot
          );
          const afterSnapshot = readFirstPlaygroundFineTuningObject(
            version?.snapshot,
            metadata.afterAgentSnapshot,
            metadata.after_agent_snapshot,
            metadata.afterSnapshot,
            metadata.after_snapshot
          );
          const evaluationSetIds = Array.isArray(metadata.evaluationSetIds)
            ? metadata.evaluationSetIds
            : Array.isArray(metadata.evaluation_set_ids)
              ? metadata.evaluation_set_ids
              : [];
          return normalizePlaygroundFineTuningJob({
            id: fineTuningJobId,
            name: normalizePlaygroundFineTuningString(metadata.fineTuningJobName || metadata.fine_tuning_job_name || version?.fineTuningJobName || version?.label)
              || ("Fine-Tune " + formatPlaygroundFineTuningDateTime(createdAt)),
            status: normalizePlaygroundFineTuningString(metadata.fineTuningStatus || metadata.fine_tuning_status || "completed") || "completed",
            createdAt,
            updatedAt,
            agentId,
            targetAgentId: agentId,
            agentName: normalizePlaygroundFineTuningString(metadata.targetAgentName || metadata.target_agent_name || agent?.name || agent?.label || agent?.title || "Agent"),
            targetAgentName: normalizePlaygroundFineTuningString(metadata.targetAgentName || metadata.target_agent_name || agent?.name || agent?.label || agent?.title || "Agent"),
            agentPhotoUrl: normalizePlaygroundFineTuningString(metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url || agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL),
            targetAgentPhotoUrl: normalizePlaygroundFineTuningString(metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url || agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL),
            conductedBy: metadata.conductedBy || metadata.conducted_by || {},
            createdBy: metadata.createdBy || metadata.created_by || metadata.conductedBy || metadata.conducted_by || {},
            fineTunerAgentId: normalizePlaygroundFineTuningString(metadata.fineTunerAgentId || metadata.fine_tuner_agent_id),
            fineTunerAgentName: normalizePlaygroundFineTuningString(metadata.fineTunerAgentName || metadata.fine_tuner_agent_name),
            fineTunerAgentPhotoUrl: normalizePlaygroundFineTuningString(metadata.fineTunerAgentPhotoUrl || metadata.fine_tuner_agent_photo_url),
            environmentId: normalizePlaygroundFineTuningString(metadata.environmentId || metadata.environment_id),
            environmentName: normalizePlaygroundFineTuningString(metadata.environmentName || metadata.environment_name || "Computer"),
            evaluationSets: evaluationSetIds.map((setId, index) => ({
              id: normalizePlaygroundFineTuningString(setId || "evaluation_" + (index + 1)),
              name: "Evaluation " + (index + 1),
            })),
            threadId: normalizePlaygroundFineTuningString(metadata.threadId || metadata.thread_id || metadata.fineTuningThreadId || metadata.fine_tuning_thread_id),
            threadTitle: normalizePlaygroundFineTuningString(metadata.threadTitle || metadata.thread_title || "Fine-Tuning Thread"),
            beforeScore: normalizePlaygroundFineTuningScore(metadata.beforeScore ?? metadata.before_score ?? 0),
            afterScore: normalizePlaygroundFineTuningScore(metadata.afterScore ?? metadata.after_score ?? 0),
            improvementScore: normalizePlaygroundFineTuningScore(metadata.improvementScore ?? metadata.improvement_score ?? 0),
            costUsd: normalizePlaygroundFineTuningUsdCost(metadata.totalCostUsd ?? metadata.total_cost_usd ?? metadata.costUsd ?? metadata.cost_usd ?? 0),
            fineTuningCostUsd: normalizePlaygroundFineTuningUsdCost(metadata.fineTuningCostUsd ?? metadata.fine_tuning_cost_usd ?? 0),
            verificationCostUsd: normalizePlaygroundFineTuningUsdCost(metadata.verificationCostUsd ?? metadata.verification_cost_usd ?? 0),
            analysisSummary: sanitizePlaygroundFineTuningAnalysisSummary(metadata.analysisSummary || metadata.analysis_summary || ""),
            evaluationRuns: Array.isArray(metadata.evaluationRuns) ? metadata.evaluationRuns : Array.isArray(metadata.evaluation_runs) ? metadata.evaluation_runs : [],
            beforeAgentSnapshot: beforeSnapshot,
            afterAgentSnapshot: afterSnapshot,
            diffFiles: readFirstPlaygroundFineTuningArray(metadata.diffFiles, metadata.diff_files, version?.diffFiles, version?.diff_files),
            createdAgentVersion: version,
            createdAgentVersionId: normalizePlaygroundFineTuningString(version?.id || version?.versionId || version?.version_id),
            agentVersionCreationStatus: normalizePlaygroundFineTuningString(version?.status || "published") || "published",
            metadata,
          }, fallbackIndex);
        }

        function buildFineTuningJobsFromAgentVersions() {
          return normalizedAgents.flatMap((agent, agentIndex) => {
            const versions = getFineTuningAgentVersionList(agent);
            return (Array.isArray(versions) ? versions : [])
              .map((version, versionIndex) => buildFineTuningJobFromAgentVersion(agent, version, agentIndex + versionIndex))
              .filter(Boolean);
          });
        }

        function mergeFineTuningJobLists(primaryJobs, recoveredJobs) {
          const byId = new Map();
          [...(Array.isArray(recoveredJobs) ? recoveredJobs : []), ...(Array.isArray(primaryJobs) ? primaryJobs : [])].forEach((job) => {
            const normalizedJob = normalizePlaygroundFineTuningJob(job);
            if (!normalizedJob.id) return;
            const existingJob = byId.get(normalizedJob.id);
            byId.set(normalizedJob.id, existingJob ? mergePlaygroundFineTuningJobRecords(existingJob, normalizedJob) : normalizedJob);
          });
          return Array.from(byId.values()).sort((left, right) => (Date.parse(right.updatedAt || right.createdAt || 0) || 0) - (Date.parse(left.updatedAt || left.createdAt || 0) || 0));
        }

        useEffect(() => {
          if (!fineTuningCreateModalOpen) return;
          setCreateError("");
          setModalClosing(false);
          setModalVisible(false);
          setEvaluationSetPickerOpen(false);
          setIsFineTuningInstructionsEditing(false);
          setFineTuningInstructionsHistory({ past: [], future: [] });
          if (modalFrameRef.current && typeof window !== "undefined") {
            window.cancelAnimationFrame(modalFrameRef.current);
          }
          if (typeof window !== "undefined") {
            modalFrameRef.current = window.requestAnimationFrame(() => {
              modalFrameRef.current = window.requestAnimationFrame(() => {
                modalFrameRef.current = null;
                setModalVisible(true);
              });
            });
          } else {
            setModalVisible(true);
          }
        }, [fineTuningCreateModalOpen]);

        useEffect(() => () => {
          if (modalFrameRef.current && typeof window !== "undefined") window.cancelAnimationFrame(modalFrameRef.current);
          if (modalCloseTimerRef.current && typeof window !== "undefined") window.clearTimeout(modalCloseTimerRef.current);
        }, []);

        useEffect(() => {
          if (!shouldLoadData) return undefined;
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedBackendUrl || typeof setFineTuningJobs !== "function") return undefined;
          const loadKey = normalizedBackendUrl + "|" + requestHeadersSignature;
          if (fineTuningJobListLoadRef.current === loadKey) return undefined;
          fineTuningJobListLoadRef.current = loadKey;
          let cancelled = false;
          setFineTuningJobsLoading(true);
          void (async () => {
            try {
              const response = await fetch(normalizedBackendUrl + "/fine-tuning/jobs", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders || {},
              });
              const data = await readFineTuningJsonResponse(response, "Failed to load fine-tuning jobs.");
              if (cancelled) return;
              const backendJobs = readPlaygroundFineTuningJobListFromPayload(data);
              setFineTuningJobs((current) => mergeFineTuningJobLists(current, backendJobs));
            } catch {
              if (!cancelled) fineTuningJobListLoadRef.current = "";
            } finally {
              if (!cancelled) setFineTuningJobsLoading(false);
            }
          })();
          return () => {
            cancelled = true;
          };
        }, [backendUrl, requestHeadersSignature, setFineTuningJobs, shouldLoadData]);

        useEffect(() => {
          if (!evaluationSetPickerOpen || typeof document === "undefined") return undefined;
          const handlePointerDown = (event) => {
            if (evaluationSetPickerRef.current && evaluationSetPickerRef.current.contains(event.target)) return;
            setEvaluationSetPickerOpen(false);
          };
          const handleKeyDown = (event) => {
            if (event.key === "Escape") setEvaluationSetPickerOpen(false);
          };
          document.addEventListener("pointerdown", handlePointerDown);
          document.addEventListener("keydown", handleKeyDown);
          return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
          };
        }, [evaluationSetPickerOpen]);

        useEffect(() => {
          const job = selectedJob ? normalizePlaygroundFineTuningJob(selectedJob) : null;
          if (!job?.id || isPlaygroundFineTuningAgentVersionReady(job.agentVersionCreationStatus) || !job.createdAgentVersion?.snapshot) return undefined;
          if (!backendUrl || fineTuningVersionRetryRef.current.has(job.id)) return undefined;
          fineTuningVersionRetryRef.current.add(job.id);
          let cancelled = false;
          void (async () => {
            const persistedJob = await tryPersistFineTunedAgentVersion(job);
            if (cancelled || !isPlaygroundFineTuningAgentVersionReady(persistedJob.agentVersionCreationStatus)) return;
            patchFineTuningJob(job.id, () => persistedJob, { persist: true });
          })();
          return () => {
            cancelled = true;
          };
        }, [backendUrl, selectedJob?.id, selectedJob?.agentVersionCreationStatus]);

        useEffect(() => {
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedBackendUrl || !displaySourceJobs.length) return undefined;
          displaySourceJobs
            .filter((job) => job.id && needsPlaygroundFineTuningRuntimeDetailsHydration(job))
            .forEach((job) => {
              const isComplete = isFineTuningRuntimeJobComplete(job);
              const hydrationKey = job.id + ":" + (isComplete ? "details" : "poll");
              if (fineTuningRuntimeHydrationRef.current.has(hydrationKey)) return;
              fineTuningRuntimeHydrationRef.current.add(hydrationKey);
              const hydrationPromise = isComplete
                ? fetchFineTuningRuntimeJob(job.id, job)
                : waitForFineTuningRuntimeJob(job.id, job);
              void hydrationPromise.catch(() => {
                if (!isComplete) fineTuningRuntimeHydrationRef.current.delete(hydrationKey);
              });
            });
          return undefined;
        }, [backendUrl, displaySourceJobs.map((job) => job.id + ":" + job.status + ":" + (job.threadId || "") + ":" + (Array.isArray(job.diffFiles) ? job.diffFiles.length : 0)).join("|")]);

`;

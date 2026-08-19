import {
  FINE_TUNING_JOB_TTL_MS,
  clampScore,
  computeTokensToUsd,
  createFineTuningId,
  createRuntimeError,
  hasPlainObjectContent,
  isFineTuningRuntimeActiveStatus,
  normalizePersonIdentity,
  normalizeResponseArray,
  normalizeString,
  normalizeTokenCount,
  normalizeUsdCost,
  readFirstPlainObject,
  readPlainObject,
} from "./domain/primitives.mjs";
import {
  compactFineTuningJobRecord,
  compactFineTuningJobOverviewRecord,
  mergeFineTuningJobRecords,
} from "./domain/jobs.mjs";
import {
  extractFineTuningThreadSummaryFromRecords,
  extractThreadCosts,
  getRecordType,
  readFineTuningRecordText,
  readUsdCostValue,
} from "./domain/thread-data.mjs";
import {
  calculateAverageScore,
  getFineTuningBaselineRun,
  isProtectedFineTuningTargetAgent,
  normalizeAgent,
  normalizeEnvironment,
  normalizeEvaluationRun,
  normalizeEvaluationSet,
  resolveFineTuningTargetFromEvaluationSets,
} from "./domain/evaluations.mjs";
import {
  buildAgentSnapshot,
  buildEvaluationRunReferences,
  buildFineTuningDiffFiles,
  buildFineTuningDiffFilesFromSnapshots,
  buildFineTuningPrompt,
  buildProposedInstructions,
  extractStreamSummary,
  preserveFineTuningAgentName,
  sanitizeFineTuningAnalysisText,
} from "./domain/orchestration.mjs";
import {
  isFineTuningPhaseActive,
  normalizeFineTuningConfiguration,
} from "./domain/iterations.mjs";
import {
  resolveFineTuningPublicationCandidate,
} from "./domain/publication.mjs";
import {
  extractAgentVersionRecord,
  extractAgentVersionRecords,
  extractThreadRecord,
  findFineTuningVersionInList,
  readJsonResponse,
} from "./domain/responses.mjs";
import { createFineTuningJobPersistenceCoordinator } from "./job-persistence.mjs";
import { createFineTuningJobOrchestrator } from "./application/job-orchestrator.mjs";
import {
  knowledgeContextFromMetadata,
  normalizeKnowledgeContext,
} from "../../knowledge/server/knowledge-context.mjs";

const FINE_TUNING_JOB_LEASE_TTL_MS = 90_000;
const FINE_TUNING_JOB_HEARTBEAT_MS = 25_000;

export function createPlaygroundFineTuningRuntime(deps = {}) {
  const {
    sendJson,
    readRequestBody,
    parseUpstreamUrl,
    readOptionalApiKey,
    withProxyOrganizationHeader,
    hasAiosSession,
    fetchAiosApi,
    fetchAiosCloud,
    enrichThreadPayloadWithAgentGuardrails,
    evaluationRuns,
  } = deps;
  const jobsById = new Map();
  const deletedJobIds = new Set();
  const executionRecordsByJobId = new Map();
  const activeJobExecutions = new Map();
  const jobLeasesById = new Map();
  const evaluationRunJobIds = new Map();
  const optimizerThreadJobIds = new Map();
  const executionOwnerId = normalizeString(deps.executionOwnerId)
    || createFineTuningId("optimization_worker");
  const jobPersistence = createFineTuningJobPersistenceCoordinator({
    ...(deps.fineTuningPersistenceOptions || {}),
    persist: (record, job) => persistBackendFineTuningJob(record, job),
    onError(error, context) {
      console.error("[fine-tuning] Failed to persist fine-tuning job", {
        jobId: context?.jobId || "",
        message: error instanceof Error ? error.message : String(error),
      });
    },
  });

  function pruneJobs() {
    const now = Date.now();
    for (const [jobId, record] of jobsById.entries()) {
      if (now - Number(record.updatedAtMs || 0) > FINE_TUNING_JOB_TTL_MS) {
        jobsById.delete(jobId);
        jobPersistence.forget(jobId);
      }
    }
  }

  function storeJob(job) {
    const compactJob = compactFineTuningJobRecord(job);
    if (!compactJob.id) return null;
    deletedJobIds.delete(compactJob.id);
    jobsById.set(compactJob.id, {
      job: compactJob,
      updatedAtMs: Date.now(),
    });
    return compactJob;
  }

  async function ensureJobPersisted(record, job) {
    const normalizedJob = compactFineTuningJobRecord(job);
    if (!normalizedJob.id) return null;
    try {
      await jobPersistence.waitForIdle(normalizedJob.id);
      return normalizedJob;
    } catch {
      const latestJob = jobsById.get(normalizedJob.id)?.job || normalizedJob;
      await jobPersistence.enqueue(record, latestJob);
      return latestJob;
    }
  }

  async function requestBackendJson(record, path, init = {}, fallbackMessage = "Backend request failed.") {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const method = init.method || "GET";
    const headers = init.headers || {};
    if (apiKey) {
      const response = await fetch(`${upstreamUrl}${path}`, {
        method,
        headers: withProxyOrganizationHeader(requestContext, body, {
          "X-API-Key": apiKey,
          ...headers,
        }),
        body: init.body,
      });
      return await readJsonResponse(response, fallbackMessage);
    }
    if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      const response = cloudFetch
        ? await cloudFetch(requestContext, path, {
            method,
            headers,
            body: init.body,
          })
        : await fetchAiosApi(requestContext, `/api${path}`, {
            method,
            headers,
            body: init.body,
          });
      return await readJsonResponse(response, fallbackMessage);
    }
    throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
  }

  async function fetchBackendJson(record, path) {
    return await requestBackendJson(record, path, { method: "GET" }, "Failed to load backend resource.");
  }

  async function requestPlatformRuntimeJson(record, path, init = {}, fallbackMessage = "Platform runtime request failed.") {
    const requestContext = record?.requestContext;
    const host = normalizeString(requestContext?.headers?.host);
    if (!host) {
      throw createRuntimeError("Platform runtime host is unavailable.", 502);
    }
    const forwardedProto = normalizeString(requestContext?.headers?.["x-forwarded-proto"]).split(",")[0].trim();
    const protocol = forwardedProto || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
    const headers = {
      ...(requestContext?.headers?.cookie ? { cookie: requestContext.headers.cookie } : {}),
      ...(requestContext?.headers?.authorization ? { authorization: requestContext.headers.authorization } : {}),
      ...(record?.apiKey ? { "X-API-Key": record.apiKey } : {}),
      ...(requestContext?.headers?.["x-active-organization-id"] ? { "x-active-organization-id": requestContext.headers["x-active-organization-id"] } : {}),
      ...(requestContext?.headers?.["x-organization-id"] ? { "x-organization-id": requestContext.headers["x-organization-id"] } : {}),
      ...(init.headers || {}),
    };
    const response = await fetch(`${protocol}://${host}${path}`, {
      method: init.method || "GET",
      headers,
      body: init.body,
    });
    return await readJsonResponse(response, fallbackMessage);
  }

  function extractFineTuningJobRecords(payload) {
    return normalizeResponseArray(payload, ["jobs", "fineTuningJobs", "fine_tuning_jobs"])
      .map((job) => compactFineTuningJobRecord(job))
      .filter((job) => job.id);
  }

  function extractFineTuningJobRecord(payload) {
    const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
    const candidates = [
      source.job,
      source.fineTuningJob,
      source.fine_tuning_job,
      source.data?.job,
      source.data?.fineTuningJob,
      source.data?.fine_tuning_job,
      source.data,
      source.item,
      source.record,
      source,
    ];
    for (const candidate of candidates) {
      if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
        const compactJob = compactFineTuningJobRecord(candidate);
        if (compactJob.id) return compactJob;
      }
    }
    return null;
  }

  async function fetchBackendFineTuningJobs(record, search = "") {
    const data = await requestBackendJson(
      record,
      `/fine-tuning/jobs${search || ""}`,
      { method: "GET" },
      "Failed to load optimization jobs."
    );
    return extractFineTuningJobRecords(data);
  }

  async function fetchBackendFineTuningJob(record, jobId) {
    const normalizedJobId = normalizeString(jobId);
    if (!normalizedJobId) return null;
    const data = await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(normalizedJobId)}`,
      { method: "GET" },
      "Failed to load optimization job."
    );
    return extractFineTuningJobRecord(data);
  }

  async function createBackendFineTuningJob(record, job) {
    const compactJob = compactFineTuningJobRecord(job);
    if (!compactJob.id) return null;
    const data = await requestBackendJson(
      record,
      "/fine-tuning/jobs",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(compactJob),
      },
      "Failed to create optimization job."
    );
    return extractFineTuningJobRecord(data);
  }

  async function updateBackendFineTuningJob(record, job) {
    const compactJob = compactFineTuningJobRecord(job);
    if (!compactJob.id) return null;
    const executionLease = jobLeasesById.get(compactJob.id);
    const data = await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(compactJob.id)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          job: compactJob,
          ...(executionLease ? {
            executionLease: {
              owner: executionLease.owner,
              token: executionLease.token,
            },
          } : {}),
        }),
      },
      "Failed to update optimization job."
    );
    return extractFineTuningJobRecord(data);
  }

  async function persistBackendFineTuningJob(record, job) {
    const compactJob = compactFineTuningJobRecord(job);
    if (!compactJob.id) return null;
    try {
      return await updateBackendFineTuningJob(record, compactJob);
    } catch (error) {
      if (Number(error?.status || 0) !== 404) throw error;
      if (jobLeasesById.has(compactJob.id)) {
        throw createRuntimeError(
          "The leased optimization job no longer exists and cannot be recreated by its worker.",
          409,
        );
      }
      await createBackendFineTuningJob(record, compactJob);
      return await updateBackendFineTuningJob(record, compactJob);
    }
  }

  async function acquireFineTuningJobLease(record, jobId, claimId) {
    const payload = await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(jobId)}/lease`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          owner: claimId,
          ttlMs: FINE_TUNING_JOB_LEASE_TTL_MS,
        }),
      },
      "Failed to acquire the optimization job execution lease.",
    );
    const lease = payload?.lease && typeof payload.lease === "object"
      ? payload.lease
      : null;
    if (!normalizeString(lease?.token) || !normalizeString(lease?.expiresAt)) {
      throw createRuntimeError("The optimization job lease response was incomplete.", 502);
    }
    return {
      lease: {
        owner: normalizeString(lease.owner) || claimId,
        token: normalizeString(lease.token),
        attempt: Math.max(1, Number(lease.attempt || 1) || 1),
        expiresAt: normalizeString(lease.expiresAt),
        lost: false,
      },
      job: extractFineTuningJobRecord(payload),
    };
  }

  async function heartbeatFineTuningJobLease(record, jobId, lease) {
    const payload = await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(jobId)}/lease/heartbeat`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          owner: lease.owner,
          token: lease.token,
          ttlMs: FINE_TUNING_JOB_LEASE_TTL_MS,
        }),
      },
      "Failed to renew the optimization job execution lease.",
    );
    const nextLease = payload?.lease && typeof payload.lease === "object"
      ? payload.lease
      : {};
    lease.expiresAt = normalizeString(nextLease.expiresAt) || lease.expiresAt;
    return lease;
  }

  async function releaseFineTuningJobLease(record, jobId, lease) {
    if (!lease?.owner || !lease?.token) return;
    await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(jobId)}/lease`,
      {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          owner: lease.owner,
          token: lease.token,
        }),
      },
      "Failed to release the optimization job execution lease.",
    );
  }

  function assertFineTuningJobLease(jobId) {
    const lease = jobLeasesById.get(normalizeString(jobId));
    const expiresAtMs = Date.parse(normalizeString(lease?.expiresAt));
    if (
      !lease
      || lease.lost
      || !Number.isFinite(expiresAtMs)
      || expiresAtMs <= Date.now()
    ) {
      throw createRuntimeError("The optimization job execution lease was lost.", 409);
    }
    return lease;
  }

  function startFineTuningJobLeaseHeartbeat(record, jobId, lease) {
    let heartbeatInFlight = false;
    const timer = setInterval(() => {
      if (heartbeatInFlight || lease.lost) return;
      heartbeatInFlight = true;
      heartbeatFineTuningJobLease(record, jobId, lease)
        .catch((error) => {
          const status = Number(error?.status || 0);
          const expiresAtMs = Date.parse(normalizeString(lease.expiresAt));
          if (
            status === 401
            || status === 403
            || status === 404
            || status === 409
            || !Number.isFinite(expiresAtMs)
            || expiresAtMs <= Date.now()
          ) {
            lease.lost = true;
          }
          console.error("[fine-tuning] Optimization job lease heartbeat failed", {
            jobId,
            status,
            leaseLost: lease.lost,
            message: error instanceof Error ? error.message : String(error),
          });
        })
        .finally(() => {
          heartbeatInFlight = false;
        });
    }, FINE_TUNING_JOB_HEARTBEAT_MS);
    timer.unref?.();
    return timer;
  }

  async function cancelBackendFineTuningJob(record, jobId) {
    const normalizedJobId = normalizeString(jobId);
    if (!normalizedJobId) return null;
    const data = await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(normalizedJobId)}/cancel`,
      { method: "POST" },
      "Failed to cancel optimization job."
    );
    return extractFineTuningJobRecord(data);
  }

  async function approveBackendFineTuningPublication(
    record,
    jobId,
    evidenceFingerprint,
  ) {
    const normalizedJobId = normalizeString(jobId);
    if (!normalizedJobId) return null;
    const data = await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(normalizedJobId)}/publication-approval`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          evidenceFingerprint: normalizeString(evidenceFingerprint),
        }),
      },
      "Failed to approve the optimized agent version for publication.",
    );
    return extractFineTuningJobRecord(data);
  }

  async function deleteBackendFineTuningJob(record, jobId) {
    const normalizedJobId = normalizeString(jobId);
    if (!normalizedJobId) return null;
    return await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(normalizedJobId)}`,
      { method: "DELETE" },
      "Failed to delete optimization job."
    );
  }

  async function fetchFineTuningAgentList(record) {
    const data = await fetchBackendJson(record, "/agents").catch(() => ({}));
    return normalizeResponseArray(data, ["agents"])
      .map((agent) => normalizeAgent(agent))
      .filter((agent) => agent.id);
  }

  function buildFineTuningJobFromAgentVersion(agent, version, fallbackIndex = 0) {
    const metadata = readPlainObject(version?.metadata);
    const fineTuningJobId = normalizeString(version?.fineTuningJobId || version?.fine_tuning_job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id);
    if (!fineTuningJobId) return null;
    const createdAt = normalizeString(metadata.fineTuningCreatedAt || metadata.fine_tuning_created_at || version?.createdAt || version?.created_at || version?.publishedAt || version?.published_at || new Date().toISOString());
    const updatedAt = normalizeString(metadata.fineTuningUpdatedAt || metadata.fine_tuning_updated_at || version?.updatedAt || version?.updated_at || version?.publishedAt || version?.published_at || createdAt);
    const evaluationSetIds = Array.isArray(metadata.evaluationSetIds)
      ? metadata.evaluationSetIds
      : Array.isArray(metadata.evaluation_set_ids)
        ? metadata.evaluation_set_ids
        : [];
    return compactFineTuningJobRecord({
      id: fineTuningJobId,
      name: normalizeString(metadata.fineTuningJobName || metadata.fine_tuning_job_name || version?.label) || "Optimization Job " + (fallbackIndex + 1),
      status: normalizeString(metadata.fineTuningStatus || metadata.fine_tuning_status || version?.status || "completed") || "completed",
      createdAt,
      updatedAt,
      agentId: normalizeString(metadata.targetAgentId || metadata.target_agent_id || agent?.id),
      targetAgentId: normalizeString(metadata.targetAgentId || metadata.target_agent_id || agent?.id),
      agentName: normalizeString(metadata.targetAgentName || metadata.target_agent_name || agent?.name || "Agent"),
      targetAgentName: normalizeString(metadata.targetAgentName || metadata.target_agent_name || agent?.name || "Agent"),
      agentPhotoUrl: normalizeString(metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url || agent?.photoUrl),
      targetAgentPhotoUrl: normalizeString(metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url || agent?.photoUrl),
      conductedBy: metadata.conductedBy || metadata.conducted_by || {},
      createdBy: metadata.createdBy || metadata.created_by || metadata.conductedBy || metadata.conducted_by || {},
      fineTunerAgentId: normalizeString(metadata.fineTunerAgentId || metadata.fine_tuner_agent_id),
      fineTunerAgentName: normalizeString(metadata.fineTunerAgentName || metadata.fine_tuner_agent_name),
      fineTunerAgentPhotoUrl: normalizeString(metadata.fineTunerAgentPhotoUrl || metadata.fine_tuner_agent_photo_url),
      environmentId: normalizeString(metadata.environmentId || metadata.environment_id),
      environmentName: normalizeString(metadata.environmentName || metadata.environment_name || "Computer"),
      evaluationSets: evaluationSetIds.map((setId, index) => ({
        id: normalizeString(setId),
        name: "Evaluation " + (index + 1),
      })).filter((set) => set.id),
      threadId: normalizeString(metadata.threadId || metadata.thread_id || metadata.fineTuningThreadId || metadata.fine_tuning_thread_id),
      threadTitle: normalizeString(metadata.threadTitle || metadata.thread_title || "Optimization Thread"),
      beforeScore: metadata.beforeScore ?? metadata.before_score ?? 0,
      afterScore: metadata.afterScore ?? metadata.after_score ?? 0,
      improvementScore: metadata.improvementScore ?? metadata.improvement_score ?? 0,
      costUsd: metadata.totalCostUsd ?? metadata.total_cost_usd ?? metadata.costUsd ?? metadata.cost_usd ?? 0,
      fineTuningCostUsd: metadata.fineTuningCostUsd ?? metadata.fine_tuning_cost_usd ?? 0,
      verificationCostUsd: metadata.verificationCostUsd ?? metadata.verification_cost_usd ?? 0,
      analysisSummary: metadata.analysisSummary || metadata.analysis_summary || "",
      evaluationRuns: Array.isArray(metadata.evaluationRuns) ? metadata.evaluationRuns : Array.isArray(metadata.evaluation_runs) ? metadata.evaluation_runs : [],
      createdAgentVersion: version,
      createdAgentVersionId: normalizeString(version?.id || version?.versionId || version?.version_id),
      agentVersionCreationStatus: normalizeString(version?.status || "published") || "published",
      metadata,
    });
  }

  async function recoverFineTuningJobsFromAgentVersions(record) {
    const agents = await fetchFineTuningAgentList(record);
    return agents.flatMap((agent, agentIndex) => {
      const versions = Array.isArray(agent.agentVersions)
        ? agent.agentVersions
        : Array.isArray(agent.agent_versions)
          ? agent.agent_versions
          : Array.isArray(agent.versions)
            ? agent.versions
            : Array.isArray(agent.metadata?.agentVersions)
              ? agent.metadata.agentVersions
              : Array.isArray(agent.metadata?.versions)
                ? agent.metadata.versions
                : [];
      return extractAgentVersionRecords({ versions })
        .map((version, versionIndex) => buildFineTuningJobFromAgentVersion(agent, version, agentIndex + versionIndex))
        .filter(Boolean);
    });
  }

  function mapFineTuningThreadStatus(status) {
    const normalizedStatus = normalizeString(status).toLowerCase();
    if (normalizedStatus === "completed") return "completed";
    if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") return "cancelled";
    if (normalizedStatus === "failed" || normalizedStatus === "error") return "error";
    return "running";
  }

  async function recoverFineTuningJobsFromThreads(record) {
    const data = await requestBackendJson(
      record,
      "/threads?appId=runner-web-sdk-demo&limit=250",
      { method: "GET" },
      "Failed to inspect fine-tuning threads."
    );
    return normalizeResponseArray(data, ["threads", "data", "items"])
      .map((thread, index) => {
        const metadata = readPlainObject(thread?.metadata);
        const fineTuning = readPlainObject(metadata.fineTuning || metadata.fine_tuning);
        const runnerPlayground = readPlainObject(metadata.runnerPlayground || metadata.runner_playground);
        const jobId = normalizeString(
          fineTuning.jobId
          || fineTuning.job_id
          || runnerPlayground.fineTuningJobId
          || runnerPlayground.fine_tuning_job_id
        );
        if (!jobId) return null;
        const threadId = normalizeString(thread?.id || thread?.threadId || thread?.thread_id);
        const createdAt = normalizeString(thread?.createdAt || thread?.created_at || new Date().toISOString());
        const updatedAt = normalizeString(thread?.updatedAt || thread?.updated_at || thread?.completedAt || thread?.completed_at || createdAt);
        const targetAgentId = normalizeString(fineTuning.targetAgentId || fineTuning.target_agent_id || fineTuning.agentId || fineTuning.agent_id);
        const fineTunerAgentId = normalizeString(fineTuning.fineTunerAgentId || fineTuning.fine_tuner_agent_id || thread?.agentId || thread?.agent_id);
        const environmentId = normalizeString(fineTuning.environmentId || fineTuning.environment_id || thread?.environmentId || thread?.environment_id);
        const evaluationSetIds = Array.isArray(fineTuning.evaluationSetIds)
          ? fineTuning.evaluationSetIds
          : Array.isArray(fineTuning.evaluation_set_ids)
            ? fineTuning.evaluation_set_ids
            : [];
        const status = mapFineTuningThreadStatus(thread?.status);
        const targetAgentName = normalizeString(fineTuning.targetAgentName || fineTuning.target_agent_name || "Agent");
        return compactFineTuningJobRecord({
          id: jobId,
          name: normalizeString(fineTuning.jobName || fineTuning.job_name || thread?.title) || "Optimization Job " + (index + 1),
          status,
          createdAt,
          updatedAt,
          agentId: targetAgentId,
          targetAgentId,
          agentName: targetAgentName,
          targetAgentName,
          fineTunerAgentId,
          fineTunerAgentName: normalizeString(fineTuning.fineTunerAgentName || fineTuning.fine_tuner_agent_name || thread?.agentName || thread?.agent_name),
          environmentId,
          environmentName: normalizeString(fineTuning.environmentName || fineTuning.environment_name || thread?.environmentName || thread?.environment_name || "Computer"),
          evaluationSets: evaluationSetIds.map((setId, setIndex) => ({
            id: normalizeString(setId),
            name: "Evaluation " + (setIndex + 1),
          })).filter((set) => set.id),
          threadId,
          threadTitle: normalizeString(thread?.title || "Optimization Thread"),
          analysisSummary: status === "running"
            ? "Fine-tuning analysis is running."
            : "Recovered from the fine-tuning execution thread.",
          metadata: {
            recoveredFromThread: true,
            recovered_from_thread: true,
          },
        });
      })
      .filter(Boolean);
  }

  function mergeFineTuningJobLists(...jobLists) {
    const byId = new Map();
    jobLists.flatMap((jobs) => Array.isArray(jobs) ? jobs : []).forEach((job) => {
      const compactJob = compactFineTuningJobRecord(job);
      if (!compactJob.id) return;
      const existingJob = byId.get(compactJob.id);
      byId.set(compactJob.id, existingJob ? mergeFineTuningJobRecords(existingJob, compactJob) : compactJob);
    });
    return Array.from(byId.values()).sort((left, right) => (Date.parse(right.updatedAt || right.createdAt || 0) || 0) - (Date.parse(left.updatedAt || left.createdAt || 0) || 0));
  }

  function filterFineTuningJobs(jobs, url) {
    const search = url?.searchParams || new URLSearchParams();
    const agentId = normalizeString(search.get("agentId") || search.get("targetAgentId"));
    const evaluationSetId = normalizeString(search.get("evaluationSetId"));
    const status = normalizeString(search.get("status")).toLowerCase();
    const query = normalizeString(search.get("q")).toLowerCase();
    const offset = Math.max(0, Number(search.get("offset") || 0) || 0);
    const limit = Math.max(0, Number(search.get("limit") || 0) || 0);
    const filtered = (Array.isArray(jobs) ? jobs : []).filter((job) => {
      if (agentId && job.agentId !== agentId && job.targetAgentId !== agentId) return false;
      if (evaluationSetId && !((Array.isArray(job.evaluationSets) ? job.evaluationSets : []).some((set) => set.id === evaluationSetId))) return false;
      if (status && normalizeString(job.status).toLowerCase() !== status) return false;
      if (query) {
        const haystack = [
          job.name,
          job.agentName,
          job.targetAgentName,
          job.fineTunerAgentName,
          job.environmentName,
          job.threadId,
        ].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    return limit > 0 ? filtered.slice(offset, offset + limit) : filtered.slice(offset);
  }

  function shouldRecoverLegacyOverviewJobs(url, backendJobs) {
    if (Array.isArray(backendJobs) && backendJobs.length > 0) return false;
    const search = url?.searchParams || new URLSearchParams();
    return ![
      "agentId",
      "targetAgentId",
      "evaluationSetId",
      "status",
      "q",
      "offset",
    ].some((parameter) => normalizeString(search.get(parameter)));
  }

  function migrateRecoveredFineTuningJobs(record, jobs) {
    const recoveredJobs = mergeFineTuningJobLists(jobs)
      .filter((job) => job.id && !deletedJobIds.has(job.id));
    if (!recoveredJobs.length) return [];

    recoveredJobs.forEach((job) => {
      storeJob(job);
    });
    void Promise.allSettled(
      recoveredJobs.map((job) => jobPersistence.enqueue(record, job)),
    ).then((results) => {
      const failedWrites = results.filter((result) => result.status === "rejected");
      if (!failedWrites.length) return;
      console.error("[fine-tuning] Failed to migrate some legacy fine-tuning jobs", {
        recovered: recoveredJobs.length,
        failed: failedWrites.length,
      });
    });
    return recoveredJobs;
  }

  async function fetchFineTuningThreadCosts(record, threadId) {
    const normalizedThreadId = normalizeString(threadId);
    if (!normalizedThreadId) return { costTokens: 0, costUsd: 0 };
    const encodedThreadId = encodeURIComponent(normalizedThreadId);
    const [threadResult, stepsResult, logsResult, messagesResult] = await Promise.allSettled([
      fetchBackendJson(record, `/threads/${encodedThreadId}`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=160&compact=1`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=160`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=80&compact=1`),
    ]);
    const thread = threadResult.status === "fulfilled" ? (threadResult.value?.thread || threadResult.value?.data || threadResult.value) : null;
    const steps = stepsResult.status === "fulfilled" ? normalizeResponseArray(stepsResult.value, ["steps"]) : [];
    const logs = logsResult.status === "fulfilled" ? normalizeResponseArray(logsResult.value, ["logs"]) : [];
    const messages = messagesResult.status === "fulfilled" ? normalizeResponseArray(messagesResult.value, ["messages"]) : [];
    return extractThreadCosts([thread, ...steps, ...logs, ...messages].filter(Boolean));
  }

  async function fetchFineTuningThreadSummary(record, threadId) {
    const normalizedThreadId = normalizeString(threadId);
    if (!normalizedThreadId) return "";
    const encodedThreadId = encodeURIComponent(normalizedThreadId);
    const [threadResult, stepsResult, logsResult, messagesResult] = await Promise.allSettled([
      fetchBackendJson(record, `/threads/${encodedThreadId}`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=180&compact=1`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=180`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=160&compact=1`),
    ]);
    const thread = threadResult.status === "fulfilled" ? (threadResult.value?.thread || threadResult.value?.data || threadResult.value) : null;
    const steps = stepsResult.status === "fulfilled" ? normalizeResponseArray(stepsResult.value, ["steps"]) : [];
    const logs = logsResult.status === "fulfilled" ? normalizeResponseArray(logsResult.value, ["logs"]) : [];
    const messages = messagesResult.status === "fulfilled" ? normalizeResponseArray(messagesResult.value, ["messages"]) : [];
    return extractFineTuningThreadSummaryFromRecords([thread, ...steps, ...logs, ...messages].filter(Boolean));
  }

  async function fetchFineTuningAgentVersions(record, agentId) {
    const normalizedAgentId = normalizeString(agentId);
    if (!normalizedAgentId) return [];
    const data = await fetchBackendJson(record, `/agents/${encodeURIComponent(normalizedAgentId)}/versions`);
    return extractAgentVersionRecords(data);
  }

  function getFineTuningVersionNumber(version) {
    return Math.max(0, Number(version?.version || version?.versionNumber || version?.version_number || 0) || 0);
  }

  function buildFineTuningDiffFilesFromVersion(version, versions = []) {
    const metadata = readPlainObject(version?.metadata);
    const beforeSnapshot = readFirstPlainObject(
      metadata.beforeAgentSnapshot,
      metadata.before_agent_snapshot,
      metadata.beforeSnapshot,
      metadata.before_snapshot,
      metadata.baseAgentSnapshot,
      metadata.base_agent_snapshot
    );
    let resolvedBeforeSnapshot = beforeSnapshot;
    if (!hasPlainObjectContent(resolvedBeforeSnapshot)) {
      const currentVersionNumber = getFineTuningVersionNumber(version);
      const previousVersion = (Array.isArray(versions) ? versions : [])
        .filter((candidate) => normalizeString(candidate?.id || candidate?.versionId || candidate?.version_id) !== normalizeString(version?.id || version?.versionId || version?.version_id))
        .filter((candidate) => getFineTuningVersionNumber(candidate) > 0 && (!currentVersionNumber || getFineTuningVersionNumber(candidate) < currentVersionNumber))
        .sort((left, right) => getFineTuningVersionNumber(right) - getFineTuningVersionNumber(left))[0];
      resolvedBeforeSnapshot = readPlainObject(previousVersion?.snapshot);
    }
    const afterSnapshot = readFirstPlainObject(
      version?.snapshot,
      metadata.afterAgentSnapshot,
      metadata.after_agent_snapshot,
      metadata.afterSnapshot,
      metadata.after_snapshot
    );
    if (!hasPlainObjectContent(resolvedBeforeSnapshot) || !hasPlainObjectContent(afterSnapshot)) return [];
    return buildFineTuningDiffFilesFromSnapshots(resolvedBeforeSnapshot, afterSnapshot);
  }

  async function hydrateFineTuningJobDetails(record, job) {
    const normalizedJob = compactFineTuningJobRecord(job);
    if (!normalizedJob.id) return normalizedJob;
    let hydratedJob = normalizedJob;
    const versions = await fetchFineTuningAgentVersions(record, normalizedJob.agentId || normalizedJob.targetAgentId).catch(() => []);
    const version = findFineTuningVersionInList(versions, normalizedJob.id);
    if (version?.id) {
      const diffFiles = hydratedJob.diffFiles.length ? hydratedJob.diffFiles : buildFineTuningDiffFilesFromVersion(version, versions);
      hydratedJob = mergeFineTuningJobRecords(hydratedJob, {
        createdAgentVersion: version,
        createdAgentVersionId: version.id,
        agentVersionCreationStatus: normalizeString(version.status || hydratedJob.agentVersionCreationStatus || "published"),
        diffFiles,
      });
    }
    if (!hydratedJob.analysisSummary && hydratedJob.threadId) {
      const analysisSummary = await fetchFineTuningThreadSummary(record, hydratedJob.threadId).catch(() => "");
      if (analysisSummary) {
        hydratedJob = mergeFineTuningJobRecords(hydratedJob, { analysisSummary });
      }
    }
    return hydratedJob;
  }

  function readOptimizerThreadIdentity(thread) {
    const metadata = readPlainObject(thread?.metadata);
    const fineTuning = readPlainObject(metadata.fineTuning || metadata.fine_tuning);
    const runnerPlayground = readPlainObject(
      metadata.runnerPlayground || metadata.runner_playground,
    );
    return {
      jobId: normalizeString(
        fineTuning.jobId
          || fineTuning.job_id
          || runnerPlayground.fineTuningJobId
          || runnerPlayground.fine_tuning_job_id,
      ),
      iterationNumber: Math.max(0, Number(
        fineTuning.iterationNumber
          || fineTuning.iteration_number
          || runnerPlayground.fineTuningIteration
          || runnerPlayground.fine_tuning_iteration
          || 0,
      ) || 0),
      kind: normalizeString(
        runnerPlayground.type
          || fineTuning.type
          || fineTuning.kind,
      ).toLowerCase(),
    };
  }

  async function findExistingOptimizerThread(record, jobId, iterationNumber) {
    const payload = await fetchBackendJson(
      record,
      "/threads?appId=runner-web-sdk-demo&limit=500",
    ).catch(() => null);
    const threads = normalizeResponseArray(payload, ["threads"]);
    return threads
      .filter((thread) => {
        const identity = readOptimizerThreadIdentity(thread);
        return identity.jobId === normalizeString(jobId)
          && identity.iterationNumber === Math.max(0, Number(iterationNumber) || 0)
          && (!identity.kind || identity.kind === "fine_tuning_optimizer");
      })
      .sort((left, right) => (
        (Date.parse(normalizeString(right?.updatedAt || right?.updated_at || right?.createdAt || right?.created_at)) || 0)
        - (Date.parse(normalizeString(left?.updatedAt || left?.updated_at || left?.createdAt || left?.created_at)) || 0)
      ))[0] || null;
  }

  function isUserThreadRecord(record) {
    const role = normalizeString(
      record?.role
        || record?.messageRole
        || record?.message_role
        || record?.author?.role,
    ).toLowerCase();
    if (role === "user" || role === "human") return true;
    const type = getRecordType(record);
    return type === "user"
      || type === "user_message"
      || type === "input"
      || type === "task"
      || type.includes("user_message");
  }

  async function inspectOptimizerThreadDispatch(record, threadId, prompt) {
    const encodedThreadId = encodeURIComponent(threadId);
    const [messagesResult, stepsResult, logsResult, threadResult] = await Promise.allSettled([
      fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=160&compact=1`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=180&compact=1`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=180`),
      fetchBackendJson(record, `/threads/${encodedThreadId}`),
    ]);
    const messages = messagesResult.status === "fulfilled"
      ? normalizeResponseArray(messagesResult.value, ["messages"])
      : [];
    const steps = stepsResult.status === "fulfilled"
      ? normalizeResponseArray(stepsResult.value, ["steps"])
      : [];
    const logs = logsResult.status === "fulfilled"
      ? normalizeResponseArray(logsResult.value, ["logs"])
      : [];
    const expectedPrompt = normalizeString(prompt);
    const promptPersisted = messages.some((message) => (
      isUserThreadRecord(message)
      && normalizeString(readFineTuningRecordText(message)) === expectedPrompt
    ));
    const thread = threadResult.status === "fulfilled"
      ? (threadResult.value?.thread || threadResult.value?.data || threadResult.value)
      : null;
    return {
      messages,
      promptPersisted,
      status: normalizeString(thread?.status).toLowerCase(),
      summary: extractFineTuningThreadSummaryFromRecords([
        ...messages,
        ...steps,
        ...logs,
        thread,
      ].filter(Boolean)),
    };
  }

  async function waitForExistingOptimizerThread(record, threadId, prompt) {
    const maxAttempts = Math.max(
      1,
      Number(deps.optimizerRecoveryPollAttempts) || 120,
    );
    const pollMs = Math.max(
      50,
      Number(deps.optimizerRecoveryPollMs) || 2_500,
    );
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const inspection = await inspectOptimizerThreadDispatch(
        record,
        threadId,
        prompt,
      );
      if (["failed", "cancelled", "canceled"].includes(inspection.status)) {
        throw createRuntimeError(
          `The optimizer thread ended with status ${inspection.status}.`,
          502,
        );
      }
      if (
        inspection.summary
        && (
          inspection.status === "completed"
          || !["queued", "running", "permission_asked"].includes(inspection.status)
        )
      ) {
        return inspection.summary;
      }
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, pollMs));
      }
    }
    throw createRuntimeError(
      "The optimizer thread did not reach a durable terminal state before the recovery timeout.",
      504,
    );
  }

  async function runOptimizerThreadMessageOnce(record, threadId, prompt) {
    const inspection = await inspectOptimizerThreadDispatch(record, threadId, prompt);
    if (
      inspection.promptPersisted
      || ["queued", "running", "permission_asked", "completed"].includes(inspection.status)
    ) {
      if (inspection.summary && inspection.status === "completed") {
        return inspection.summary;
      }
      return await waitForExistingOptimizerThread(record, threadId, prompt);
    }
    return await runThreadMessage(record, threadId, prompt);
  }

  async function createHiddenThread(record, { title, agentId, environmentId, projectId = "", metadata }) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const knowledgeContext = normalizeKnowledgeContext(
      knowledgeContextFromMetadata(metadata),
      { source: "optimization" },
    );
    const payload = {
      title,
      appId: "runner-web-sdk-demo",
      agentId,
      environmentId,
      ...(projectId ? { projectId } : {}),
      hidden: true,
      sidebarHidden: true,
      enabledSkills: {
        computerAgents: true,
      },
      ...(knowledgeContext ? { knowledgeContext } : {}),
      metadata: {
        ...(metadata || {}),
        ...(knowledgeContext ? { knowledgeContext } : {}),
      },
    };
    const enrichedPayload = typeof enrichThreadPayloadWithAgentGuardrails === "function"
      ? await enrichThreadPayloadWithAgentGuardrails(requestContext, upstreamUrl, apiKey, payload)
      : payload;
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/threads`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(enrichedPayload),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, "/threads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(enrichedPayload),
          })
        : await fetchAiosApi(requestContext, "/api/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(enrichedPayload),
      });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const data = await readJsonResponse(response, "Failed to create fine-tuning thread.");
    const thread = extractThreadRecord(data);
    if (!thread?.id) {
      throw createRuntimeError("Thread creation succeeded but no thread id was returned.", 502);
    }
    return {
      ...thread,
      hidden: true,
      sidebarHidden: true,
      metadata: {
        ...(metadata || {}),
        ...(thread.metadata && typeof thread.metadata === "object" ? thread.metadata : {}),
      },
    };
  }

  async function runThreadMessage(record, threadId, content) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const payload = {
      content,
      task: content,
      enabledSkills: {
        computerAgents: true,
      },
    };
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/threads/${encodeURIComponent(threadId)}/messages`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(payload),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, `/threads/${encodeURIComponent(threadId)}/messages`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchAiosApi(requestContext, `/api/threads/${encodeURIComponent(threadId)}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    if (!response.ok) {
      await readJsonResponse(response, "Failed to start fine-tuning thread.");
    }
    const text = await response.text().catch(() => "");
    return extractStreamSummary(text);
  }

  async function findExistingAgentVersionForFineTuning(record, agent, fineTuningJobId, candidateKey = "") {
    const normalizedJobId = normalizeString(fineTuningJobId);
    if (!agent?.id || !normalizedJobId) return null;
    const { requestContext, upstreamUrl, apiKey, body } = record;
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/agents/${encodeURIComponent(agent.id)}/versions`, {
        method: "GET",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, `/agents/${encodeURIComponent(agent.id)}/versions`, {
            method: "GET",
            headers: { "content-type": "application/json" },
          })
        : await fetchAiosApi(requestContext, `/api/agents/${encodeURIComponent(agent.id)}/versions`, {
            method: "GET",
            headers: { "content-type": "application/json" },
          });
    } else {
      return null;
    }
    if (!response.ok) {
      return null;
    }
    const data = await response.json().catch(() => ({}));
    const versions = extractAgentVersionRecords(data);
    const normalizedCandidateKey = normalizeString(candidateKey);
    if (normalizedCandidateKey) {
      return versions.find((version) => {
        const metadata = readPlainObject(version?.metadata);
        return normalizeString(
          version?.fineTuningCandidateKey
            || version?.fine_tuning_candidate_key
            || metadata.fineTuningCandidateKey
            || metadata.fine_tuning_candidate_key,
        ) === normalizedCandidateKey;
      }) || null;
    }
    return findFineTuningVersionInList(versions, normalizedJobId);
  }

  async function createAgentVersion(record, agent, versionDraft) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const fineTuningJobId = normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id);
    const candidateKey = normalizeString(versionDraft?.candidateKey || versionDraft?.candidate_key);
    const existingVersion = await findExistingAgentVersionForFineTuning(
      record,
      agent,
      fineTuningJobId,
      candidateKey,
    ).catch(() => null);
    if (existingVersion?.id) {
      return existingVersion;
    }
    const snapshot = preserveFineTuningAgentName(agent, versionDraft?.snapshot);
    const payload = {
      label: normalizeString(versionDraft?.label || "Optimized Version"),
      description: normalizeString(versionDraft?.description || ""),
      status: normalizeString(versionDraft?.status || "draft") || "draft",
      source: "fine_tuning",
      fineTuningJobId: normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id),
      snapshot,
      agent: {
        id: agent.id,
        agentId: agent.id,
        name: normalizeString(agent.name || snapshot.name || "Agent") || "Agent",
        description: snapshot.description || agent.description || "",
        model: snapshot.model || agent.model || "",
        instructions: snapshot.instructions || "",
        enabledSkills: Array.isArray(snapshot.enabledSkills) ? snapshot.enabledSkills : [],
        guardrailSetIds: Array.isArray(snapshot.guardrailSetIds) ? snapshot.guardrailSetIds : [],
        guardrails: Array.isArray(snapshot.guardrails) ? snapshot.guardrails : [],
        promptAdaptations: Array.isArray(snapshot.promptAdaptations) ? snapshot.promptAdaptations : [],
        invisiblePromptAdaptations: Array.isArray(snapshot.invisiblePromptAdaptations) ? snapshot.invisiblePromptAdaptations : [],
        metadata: snapshot.metadata || {},
      },
      metadata: {
        ...(versionDraft?.metadata && typeof versionDraft.metadata === "object" && !Array.isArray(versionDraft.metadata) ? versionDraft.metadata : {}),
        fineTuningJobId: normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id),
        fine_tuning_job_id: normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id),
        fineTuningCandidateKey: candidateKey,
        fine_tuning_candidate_key: candidateKey,
      },
    };
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/agents/${encodeURIComponent(agent.id)}/versions`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(payload),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, `/agents/${encodeURIComponent(agent.id)}/versions`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchAiosApi(requestContext, `/api/agents/${encodeURIComponent(agent.id)}/versions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const data = await readJsonResponse(response, "Failed to create optimized agent version.");
    const version = extractAgentVersionRecord(data);
    if (!version?.id) {
      throw createRuntimeError("Agent version creation succeeded but no version id was returned.", 502);
    }
    return version;
  }

  async function publishAgentVersion(record, agent, version, snapshot) {
    const versionId = normalizeString(version?.id || version?.versionId || version?.version_id);
    if (!agent?.id || !versionId) {
      throw createRuntimeError("Agent version publish failed because no version id was returned.", 502);
    }
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const safeSnapshot = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
      ? preserveFineTuningAgentName(agent, snapshot)
      : null;
    const payload = safeSnapshot
      ? { snapshot: safeSnapshot }
      : {};
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/agents/${encodeURIComponent(agent.id)}/versions/${encodeURIComponent(versionId)}/publish`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(payload),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, `/agents/${encodeURIComponent(agent.id)}/versions/${encodeURIComponent(versionId)}/publish`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchAiosApi(requestContext, `/api/agents/${encodeURIComponent(agent.id)}/versions/${encodeURIComponent(versionId)}/publish`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const data = await readJsonResponse(response, "Failed to publish optimized agent version.");
    const publishedVersion = extractAgentVersionRecord(data);
    return {
      ...(version && typeof version === "object" && !Array.isArray(version) ? version : {}),
      ...(publishedVersion || {}),
      id: publishedVersion?.id || versionId,
      status: normalizeString(publishedVersion?.status || "published") || "published",
      snapshot: preserveFineTuningAgentName(agent, publishedVersion?.snapshot || version?.snapshot || safeSnapshot || {}),
      metadata: {
        ...(version?.metadata && typeof version.metadata === "object" && !Array.isArray(version.metadata) ? version.metadata : {}),
        ...(publishedVersion?.metadata && typeof publishedVersion.metadata === "object" && !Array.isArray(publishedVersion.metadata) ? publishedVersion.metadata : {}),
      },
      publishedAt: normalizeString(publishedVersion?.publishedAt || publishedVersion?.published_at || new Date().toISOString()),
      published_at: normalizeString(publishedVersion?.published_at || publishedVersion?.publishedAt || new Date().toISOString()),
    };
  }

  function delayRuntime(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function normalizeFineTuningRunReference(rawReference = {}, fallbackIndex = 0) {
    const source = readPlainObject(rawReference);
    return {
      evaluationSetId: normalizeString(source.evaluationSetId || source.evaluation_set_id),
      evaluationSetName: normalizeString(source.evaluationSetName || source.evaluation_set_name || "Evaluation " + (fallbackIndex + 1)),
      beforeRunId: normalizeString(source.beforeRunId || source.before_run_id),
      beforeRunLabel: normalizeString(source.beforeRunLabel || source.before_run_label || "Before"),
      beforeScore: clampScore(source.beforeScore ?? source.before_score ?? 0),
      beforeCostUsd: normalizeUsdCost(source.beforeCostUsd ?? source.before_cost_usd ?? 0),
      afterRunId: normalizeString(source.afterRunId || source.after_run_id),
      afterRunLabel: normalizeString(source.afterRunLabel || source.after_run_label || "After"),
      afterScore: clampScore(source.afterScore ?? source.after_score ?? 0),
      afterCostUsd: normalizeUsdCost(source.afterCostUsd ?? source.after_cost_usd ?? 0),
      status: normalizeString(source.status || "not_run") || "not_run",
      error: normalizeString(source.error || source.message),
    };
  }

  function isFineTuningEvaluationRunActive(status) {
    return isFineTuningRuntimeActiveStatus(status);
  }

  function mergeFineTuningVerificationReferences(job, references, statusOverride = "") {
    const normalizedJob = compactFineTuningJobRecord(job);
    const existingReferences = (Array.isArray(normalizedJob.evaluationRuns) ? normalizedJob.evaluationRuns : [])
      .map((reference, index) => normalizeFineTuningRunReference(reference, index));
    const bySetId = new Map(existingReferences.map((reference) => [reference.evaluationSetId, reference]));
    (Array.isArray(references) ? references : []).forEach((reference, index) => {
      const normalizedReference = normalizeFineTuningRunReference(reference, index);
      if (!normalizedReference.evaluationSetId) return;
      bySetId.set(normalizedReference.evaluationSetId, {
        ...(bySetId.get(normalizedReference.evaluationSetId) || {}),
        ...normalizedReference,
      });
    });
    const nextReferences = Array.from(bySetId.values());
    const beforeScores = nextReferences
      .map((reference) => Number(reference.beforeScore))
      .filter((score) => Number.isFinite(score));
    const finishedReferences = nextReferences.filter((reference) => {
      const status = normalizeString(reference.status).toLowerCase();
      if (!reference.afterRunId) return false;
      if (status === "pending" || status === "not_run") return false;
      return !isFineTuningEvaluationRunActive(status);
    });
    const finishedAfterScores = finishedReferences
      .map((reference) => Number(reference.afterScore))
      .filter((score) => Number.isFinite(score));
    const activeOrPending = nextReferences.some((reference) => {
      const status = normalizeString(reference.status).toLowerCase();
      return status === "pending" || (reference.afterRunId && isFineTuningEvaluationRunActive(status));
    });
    const failedReferences = nextReferences.filter((reference) => {
      const status = normalizeString(reference.status).toLowerCase();
      return status === "error" || status === "failed" || status === "blocked";
    });
    const beforeScore = beforeScores.length
      ? clampScore(beforeScores.reduce((sum, score) => sum + score, 0) / beforeScores.length)
      : normalizedJob.beforeScore;
    const afterScore = finishedAfterScores.length
      ? clampScore(finishedAfterScores.reduce((sum, score) => sum + score, 0) / finishedAfterScores.length)
      : normalizedJob.afterScore || beforeScore;
    const nextStatus = statusOverride
      || (activeOrPending
        ? "verifying"
        : finishedReferences.length || nextReferences.length > failedReferences.length
          ? "completed"
          : failedReferences.length
            ? "error"
            : normalizedJob.status || "completed");
    const verificationCostUsd = finishedReferences
      .reduce((sum, reference) => sum + normalizeUsdCost(reference.afterCostUsd), 0);
    const fineTuningCostUsd = normalizeUsdCost(normalizedJob.fineTuningCostUsd || normalizedJob.costUsd);
    return compactFineTuningJobRecord({
      ...normalizedJob,
      status: nextStatus,
      beforeScore,
      afterScore,
      improvementScore: finishedAfterScores.length ? clampScore(Math.max(0, afterScore - beforeScore)) : normalizedJob.improvementScore,
      fineTuningCostUsd,
      verificationCostUsd,
      costUsd: fineTuningCostUsd + verificationCostUsd,
      evaluationRuns: nextReferences,
      updatedAt: new Date().toISOString(),
    });
  }

  function extractEvaluationRunRecord(payload, fallback = {}) {
    const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
    const candidates = [
      source.run,
      source.evaluationRun,
      source.evaluation_run,
      source.data?.run,
      source.data?.evaluationRun,
      source.data?.evaluation_run,
      source.data,
      source.item,
      source.record,
      source,
    ];
    for (const candidate of candidates) {
      if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
        const run = normalizeEvaluationRun({
          ...(fallback && typeof fallback === "object" && !Array.isArray(fallback) ? fallback : {}),
          ...candidate,
        });
        if (run.id) return run;
      }
    }
    return normalizeEvaluationRun(fallback);
  }

  async function createFineTuningEvaluationRun(record, evaluationSet, runOptions) {
    let data;
    try {
      data = await requestPlatformRuntimeJson(
        record,
        "/api/real/evaluations/runs",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            evaluationSet,
            runOptions,
          }),
        },
        "Failed to start fine-tuning verification run."
      );
    } catch (runtimeError) {
      try {
        if (Number(runtimeError?.status || 0) !== 404) {
          throw runtimeError;
        }
        data = await requestBackendJson(
          record,
          `/evaluations/${encodeURIComponent(evaluationSet.id)}/runs`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              id: runOptions.id,
              runId: runOptions.id,
              run_id: runOptions.id,
              ...(runOptions.targetBinding
                && typeof runOptions.targetBinding === "object"
                && !Array.isArray(runOptions.targetBinding)
                ? {
                    target: {
                      kind: normalizeString(runOptions.targetBinding.kind),
                      id: normalizeString(
                        runOptions.targetBinding.id
                          || runOptions.targetBinding.targetId
                          || runOptions.targetBinding.target_id,
                      ),
                      versionId: normalizeString(
                        runOptions.targetBinding.versionId
                          || runOptions.targetBinding.version_id
                          || runOptions.targetBinding.targetVersionId
                          || runOptions.targetBinding.target_version_id,
                      ) || undefined,
                      environmentId: normalizeString(
                        runOptions.targetBinding.environmentId
                          || runOptions.targetBinding.environment_id,
                      ) || undefined,
                      ...(runOptions.targetBinding.candidateAuthority
                        && typeof runOptions.targetBinding.candidateAuthority === "object"
                        && !Array.isArray(runOptions.targetBinding.candidateAuthority)
                        ? {
                            candidateAuthority:
                              runOptions.targetBinding.candidateAuthority,
                          }
                        : {}),
                    },
                  }
                : {}),
              agentId: runOptions.targetAgentId,
              environmentId: runOptions.environmentId,
              computerId: runOptions.environmentId,
              versionId: runOptions.evaluationVersionId || evaluationSet.activeVersionId || "",
              status: "queued",
              metadata: {
                ...(runOptions.metadata || {}),
                fineTuningJobId: runOptions.fineTuningJobId,
                fine_tuning_job_id: runOptions.fine_tuning_job_id,
                targetAgentVersionId: runOptions.targetAgentVersionId,
                target_agent_version_id: runOptions.targetAgentVersionId,
                targetAgentVersionNumber: runOptions.targetAgentVersionNumber,
                target_agent_version_number: runOptions.targetAgentVersionNumber,
                targetAgentVersionLabel: runOptions.targetAgentVersionLabel,
                target_agent_version_label: runOptions.targetAgentVersionLabel,
              },
              run: runOptions,
            }),
          },
          "Failed to start fine-tuning verification run."
        );
      } catch (error) {
        throw error;
      }
    }
    return extractEvaluationRunRecord(data, runOptions);
  }

  async function fetchFineTuningEvaluationRun(record, runId) {
    const normalizedRunId = normalizeString(runId);
    if (!normalizedRunId) return null;
    let data;
    try {
      data = await requestPlatformRuntimeJson(
        record,
        `/api/real/evaluations/runs/${encodeURIComponent(normalizedRunId)}`,
        { method: "GET" },
        "Failed to load fine-tuning verification run."
      );
    } catch {
      data = await requestBackendJson(
        record,
        `/evaluations/runs/${encodeURIComponent(normalizedRunId)}`,
        { method: "GET" },
        "Failed to load fine-tuning verification run."
      );
    }
    return extractEvaluationRunRecord(data, { id: normalizedRunId });
  }

  async function waitForFineTuningEvaluationRun(record, initialRun, options = {}) {
    let latestRun = normalizeEvaluationRun(initialRun);
    const maxAttempts = Math.max(1, Number(options.maxAttempts || 360) || 360);
    const intervalMs = Math.max(500, Number(options.intervalMs || 2000) || 2000);
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (latestRun.id && !isFineTuningEvaluationRunActive(latestRun.status)) {
        return latestRun;
      }
      await delayRuntime(intervalMs);
      try {
        const fetchedRun = await fetchFineTuningEvaluationRun(record, latestRun.id);
        if (fetchedRun?.id) {
          latestRun = {
            ...latestRun,
            ...fetchedRun,
          };
        }
      } catch {
        // Keep polling. A transient read error should not strand the fine-tune job.
      }
    }
    return {
      ...latestRun,
      status: "error",
      error: "Verification run did not finish before the fine-tuning timeout.",
    };
  }

  async function waitForFineTuningAgentVersion(record, agent, fineTuningJobId, options = {}) {
    const normalizedJobId = normalizeString(fineTuningJobId);
    if (!agent?.id || !normalizedJobId) return null;
    const maxAttempts = Math.max(1, Number(options.maxAttempts || 300) || 300);
    const intervalMs = Math.max(500, Number(options.intervalMs || 2000) || 2000);
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const version = await findExistingAgentVersionForFineTuning(record, agent, normalizedJobId).catch(() => null);
      if (version?.id) return version;
      await delayRuntime(intervalMs);
    }
    return null;
  }

  async function resolveFineTuningThreadOutcome(record, thread, prompt, targetAgent, jobId, fallbackMessage) {
    const analysisPromise = thread?.id
      ? runThreadMessage(record, thread.id, prompt)
          .then((summary) => ({ type: "analysis", summary: sanitizeFineTuningAnalysisText(summary) }))
          .catch((error) => ({ type: "analysis", summary: "Fine-tuning analysis thread was created, but the analysis response was not available: " + (error?.message || String(error)) }))
      : Promise.resolve({ type: "analysis", summary: fallbackMessage });
    const versionPromise = thread?.id
      ? waitForFineTuningAgentVersion(record, targetAgent, jobId)
          .then((version) => ({ type: "version", version }))
      : Promise.resolve({ type: "version", version: null });
    const firstResult = await Promise.race([analysisPromise, versionPromise]);
    if (firstResult?.type === "version" && firstResult.version?.id) {
      return {
        analysisSummary: "Fine-tuning agent published version " + firstResult.version.id + ".",
        createdAgentVersion: firstResult.version,
      };
    }
    const analysisSummary = firstResult?.type === "analysis"
      ? firstResult.summary
      : fallbackMessage;
    const createdAgentVersion = await findExistingAgentVersionForFineTuning(record, targetAgent, jobId).catch(() => null);
    return {
      analysisSummary,
      createdAgentVersion,
    };
  }

  async function startFineTuningVerificationRuns(record, job, evaluationSets, targetAgent, environment) {
    const normalizedJob = compactFineTuningJobRecord(job);
    const version = readPlainObject(normalizedJob.createdAgentVersion);
    const versionId = normalizeString(version.id || version.versionId || version.version_id || normalizedJob.createdAgentVersionId);
    if (!versionId) {
      return mergeFineTuningVerificationReferences(normalizedJob, (Array.isArray(evaluationSets) ? evaluationSets : []).map((set) => ({
        evaluationSetId: set.id,
        evaluationSetName: set.name,
        status: "blocked",
        error: "Fine-tuning finished without a published agent version.",
      })), "error");
    }

    const startedRuns = [];
    const references = [];
    for (const set of Array.isArray(evaluationSets) ? evaluationSets : []) {
      const beforeRun = getFineTuningBaselineRun(set);
      const evaluatorSource = readPlainObject(set.evaluator);
      const evaluator = {
        type: normalizeString(evaluatorSource.type || "exact") || "exact",
        agentId: normalizeString(evaluatorSource.agentId || evaluatorSource.agent_id),
        agentVersionId: normalizeString(
          evaluatorSource.agentVersionId || evaluatorSource.agent_version_id,
        ),
        agentVersionNumber: Math.max(
          0,
          Number(
            evaluatorSource.agentVersionNumber
              || evaluatorSource.agent_version_number
              || 0,
          ) || 0,
        ),
        agentVersionLabel: normalizeString(
          evaluatorSource.agentVersionLabel
            || evaluatorSource.agent_version_label,
        ),
        agentVersionRevisionId: normalizeString(
          evaluatorSource.agentVersionRevisionId
            || evaluatorSource.agent_version_revision_id,
        ),
        code: String(evaluatorSource.code || ""),
      };
      if (evaluator.type === "agent" && !evaluator.agentId) {
        evaluator.agentId = targetAgent.id;
      }
      const runRequestOptions = {
        id: createFineTuningId("eval_run"),
        label: "Optimization Verification",
        fineTuningJobId: normalizedJob.id,
        fine_tuning_job_id: normalizedJob.id,
        evaluationVersionId: normalizeString(set.activeVersionId),
        evaluationVersionNumber: Math.max(0, Number(set.activeVersionNumber || 0) || 0),
        evaluationVersionLabel: normalizeString(set.activeVersionLabel),
        targetAgentId: targetAgent.id,
        targetAgentName: targetAgent.name || normalizedJob.agentName,
        targetAgentPhotoUrl: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || normalizedJob.agentPhotoUrl),
        targetAgentVersionId: versionId,
        targetAgentVersionNumber: Math.max(0, Number(version.version || version.versionNumber || version.version_number || 0) || 0),
        targetAgentVersionLabel: normalizeString(version.label || (version.version ? "Version " + version.version : "")),
        targetAgentVersionRevisionId: normalizeString(version.revisionId || version.revision_id),
        environmentType: "computer",
        environmentId: environment.id,
        environmentName: environment.name || normalizedJob.environmentName,
        projectId: "",
        projectName: "",
        evaluator,
        passThreshold: set.passThreshold,
        metadata: {
          fineTuningJobId: normalizedJob.id,
          fine_tuning_job_id: normalizedJob.id,
        },
      };
      try {
        const run = await createFineTuningEvaluationRun(record, {
          ...set,
          targetAgentId: runRequestOptions.targetAgentId,
          targetAgentName: runRequestOptions.targetAgentName,
          environmentType: "computer",
          environmentId: runRequestOptions.environmentId,
          environmentName: runRequestOptions.environmentName,
          projectId: "",
          evaluator,
        }, runRequestOptions);
        startedRuns.push({ set, beforeRun, run });
        references.push({
          evaluationSetId: set.id,
          evaluationSetName: set.name,
          beforeRunId: beforeRun?.id || "",
          beforeRunLabel: beforeRun?.label || beforeRun?.name || "Before",
          beforeScore: clampScore(beforeRun?.averageScore || 0),
          beforeCostUsd: normalizeUsdCost(beforeRun?.costUsd || beforeRun?.cost_usd) || computeTokensToUsd(beforeRun?.costTokens || beforeRun?.cost_tokens),
          afterRunId: run.id,
          afterRunLabel: run.label || "Optimization Verification",
          afterScore: clampScore(run.averageScore || 0),
          afterCostUsd: normalizeUsdCost(run.costUsd || run.cost_usd),
          status: run.status || "running",
        });
      } catch (error) {
        references.push({
          evaluationSetId: set.id,
          evaluationSetName: set.name,
          beforeRunId: beforeRun?.id || "",
          beforeRunLabel: beforeRun?.label || beforeRun?.name || "Before",
          beforeScore: clampScore(beforeRun?.averageScore || 0),
          beforeCostUsd: normalizeUsdCost(beforeRun?.costUsd || beforeRun?.cost_usd) || computeTokensToUsd(beforeRun?.costTokens || beforeRun?.cost_tokens),
          afterRunId: "",
          afterRunLabel: "",
          afterScore: 0,
          afterCostUsd: 0,
          status: "error",
          error: error?.message || String(error),
        });
      }
    }

    let currentJob = storeJob(mergeFineTuningVerificationReferences(normalizedJob, references)) || normalizedJob;
    await jobPersistence.enqueue(record, currentJob);

    for (const startedRun of startedRuns) {
      const completedRun = await waitForFineTuningEvaluationRun(record, startedRun.run);
      const nextReference = {
        evaluationSetId: startedRun.set.id,
        evaluationSetName: startedRun.set.name,
        beforeRunId: startedRun.beforeRun?.id || "",
        beforeRunLabel: startedRun.beforeRun?.label || startedRun.beforeRun?.name || "Before",
        beforeScore: clampScore(startedRun.beforeRun?.averageScore || 0),
        beforeCostUsd: normalizeUsdCost(startedRun.beforeRun?.costUsd || startedRun.beforeRun?.cost_usd) || computeTokensToUsd(startedRun.beforeRun?.costTokens || startedRun.beforeRun?.cost_tokens),
        afterRunId: completedRun.id,
        afterRunLabel: completedRun.label || "Optimization Verification",
        afterScore: clampScore(completedRun.averageScore || 0),
        afterCostUsd: normalizeUsdCost(completedRun.costUsd || completedRun.cost_usd),
        status: completedRun.status || "completed",
        error: completedRun.error || "",
      };
      currentJob = storeJob(mergeFineTuningVerificationReferences(currentJob, [nextReference])) || currentJob;
      await jobPersistence.enqueue(record, currentJob);
    }

    const finalJob = storeJob(mergeFineTuningVerificationReferences(currentJob, [], "")) || currentJob;
    await jobPersistence.enqueue(record, finalJob);
    return finalJob;
  }

  const fineTuningOrchestrator = createFineTuningJobOrchestrator({
    async getJob(jobId) {
      const memoryJob = jobsById.get(jobId)?.job || null;
      const record = executionRecordsByJobId.get(jobId);
      if (!record) return memoryJob;
      assertFineTuningJobLease(jobId);
      const backendJob = await fetchBackendFineTuningJob(record, jobId).catch(() => null);
      if (!backendJob) return memoryJob;
      return storeJob(
        memoryJob
          ? mergeFineTuningJobRecords(memoryJob, backendJob)
          : backendJob,
      );
    },
    async saveJob(job) {
      const record = executionRecordsByJobId.get(job.id);
      if (!record) {
        throw createRuntimeError("Fine-tuning execution context is unavailable.", 503);
      }
      assertFineTuningJobLease(job.id);
      const storedJob = storeJob(job) || compactFineTuningJobRecord(job);
      const persistedJob = await jobPersistence.enqueue(record, storedJob);
      return persistedJob
        ? (storeJob(mergeFineTuningJobRecords(storedJob, persistedJob)) || storedJob)
        : storedJob;
    },
    async createEvaluationRun(evaluationSet, runOptions) {
      const jobId = normalizeString(runOptions?.fineTuningJobId || runOptions?.fine_tuning_job_id);
      const record = executionRecordsByJobId.get(jobId);
      if (!record) throw createRuntimeError("Fine-tuning evaluation context is unavailable.", 503);
      assertFineTuningJobLease(jobId);
      if (evaluationRuns && typeof evaluationRuns.create === "function") {
        const result = await evaluationRuns.create(record.requestContext, {
          evaluationSet,
          runOptions,
        });
        const run = normalizeEvaluationRun(result?.run || result);
        if (run.id) evaluationRunJobIds.set(run.id, jobId);
        return run;
      }
      const run = await createFineTuningEvaluationRun(record, evaluationSet, runOptions);
      if (run.id) evaluationRunJobIds.set(run.id, jobId);
      return run;
    },
    async getEvaluationRun(jobId, runId) {
      const normalizedJobId = normalizeString(jobId) || evaluationRunJobIds.get(normalizeString(runId));
      const record = executionRecordsByJobId.get(normalizedJobId);
      if (!record) throw createRuntimeError("Fine-tuning evaluation context is unavailable.", 503);
      assertFineTuningJobLease(normalizedJobId);
      if (evaluationRuns && typeof evaluationRuns.get === "function") {
        return normalizeEvaluationRun(await evaluationRuns.get(record.requestContext, runId));
      }
      return await fetchFineTuningEvaluationRun(record, runId);
    },
    async createOptimizerThread(job, iterationNumber) {
      const record = executionRecordsByJobId.get(job.id);
      if (!record) throw createRuntimeError("Fine-tuning execution context is unavailable.", 503);
      assertFineTuningJobLease(job.id);
      const configuration = job.configuration;
      const recoveredThread = await findExistingOptimizerThread(
        record,
        job.id,
        iterationNumber,
      );
      const thread = extractThreadRecord(recoveredThread) || await createHiddenThread(record, {
          title: `Agent Optimization · ${configuration.targetAgent.name} · Iteration ${iterationNumber}`,
          agentId: configuration.fineTunerAgent.id,
          environmentId: configuration.environment.id,
          projectId: configuration.environment.projectId,
          metadata: {
            fineTuning: {
              jobId: job.id,
              jobName: job.name,
              iterationNumber,
              targetAgentId: configuration.targetAgent.id,
              fineTunerAgentId: configuration.fineTunerAgent.id,
              environmentId: configuration.environment.id,
              evaluationSetIds: configuration.evaluationTargets.map((target) => target.evaluationSetId),
              ...(configuration.knowledgeContext
                ? { knowledgeContext: configuration.knowledgeContext }
                : {}),
              hidden: true,
              sidebarHidden: true,
            },
            runnerPlayground: {
              type: "fine_tuning_optimizer",
              fineTuningJobId: job.id,
              fineTuningIteration: iterationNumber,
              ...(configuration.knowledgeContext
                ? { knowledgeContext: configuration.knowledgeContext }
                : {}),
              hidden: true,
              sidebarHidden: true,
            },
          },
        });
      optimizerThreadJobIds.set(thread.id, job.id);
      return thread;
    },
    async runOptimizerThread(threadId, prompt) {
      const jobId = optimizerThreadJobIds.get(normalizeString(threadId));
      const record = executionRecordsByJobId.get(jobId);
      if (!record) throw createRuntimeError("Fine-tuning execution context is unavailable.", 503);
      assertFineTuningJobLease(jobId);
      return await runOptimizerThreadMessageOnce(record, threadId, prompt);
    },
    async readOptimizerThreadCosts(threadId) {
      const record = executionRecordsByJobId.get(optimizerThreadJobIds.get(normalizeString(threadId)));
      if (!record) return { costTokens: 0, costUsd: 0 };
      return await fetchFineTuningThreadCosts(record, threadId);
    },
    async createCandidateVersion(job, candidate) {
      const record = executionRecordsByJobId.get(job.id);
      if (!record) throw createRuntimeError("Fine-tuning execution context is unavailable.", 503);
      assertFineTuningJobLease(job.id);
      const targetAgent = normalizeAgent({
        ...job.configuration.targetAgent.snapshot,
        id: job.configuration.targetAgent.id,
        name: job.configuration.targetAgent.name,
        photoUrl: job.configuration.targetAgent.photoUrl,
      });
      return await createAgentVersion(record, targetAgent, {
        status: "draft",
        label: `Optimized Candidate ${candidate.iterationNumber}`,
        description: `Draft candidate generated by ${job.name}.`,
        fineTuningJobId: job.id,
        candidateKey: `${job.id}:iteration:${candidate.iterationNumber}`,
        snapshot: candidate.snapshot,
        metadata: {
          fineTuningJobId: job.id,
          fine_tuning_job_id: job.id,
          fineTuningIteration: candidate.iterationNumber,
          fine_tuning_iteration: candidate.iterationNumber,
          analysisSummary: candidate.analysisSummary,
        },
      });
    },
    async publishCandidateVersion(job, version, snapshot) {
      const record = executionRecordsByJobId.get(job.id);
      if (!record) throw createRuntimeError("Fine-tuning execution context is unavailable.", 503);
      assertFineTuningJobLease(job.id);
      const targetAgent = normalizeAgent({
        ...job.configuration.targetAgent.snapshot,
        id: job.configuration.targetAgent.id,
        name: job.configuration.targetAgent.name,
        photoUrl: job.configuration.targetAgent.photoUrl,
      });
      return await publishAgentVersion(record, targetAgent, version, snapshot);
    },
    buildFallbackInstructions({ job, evaluationRuns: runs, analysisSummary, currentInstructions }) {
      const targetAgent = normalizeAgent({
        ...job.configuration.targetAgent.snapshot,
        id: job.configuration.targetAgent.id,
        name: job.configuration.targetAgent.name,
        instructions: currentInstructions,
      });
      return buildProposedInstructions(
        targetAgent,
        job.configuration.evaluationTargets.map((target, index) => ({
          ...target.evaluationSetSnapshot,
          selectedRun: runs[index],
          runs: runs[index] ? [runs[index]] : [],
        })),
        job.configuration.instructions,
        analysisSummary,
      );
    },
  });

  async function executeFineTuningJobWithLease(job, record) {
    const jobId = normalizeString(job?.id);
    if (!jobId) return null;
    const claimId = `${executionOwnerId}:${jobId}`;
    let lease = null;
    let heartbeatTimer = null;
    try {
      const acquisition = await acquireFineTuningJobLease(record, jobId, claimId);
      lease = acquisition.lease;
      jobLeasesById.set(jobId, lease);
      if (acquisition.job) {
        const currentJob = jobsById.get(jobId)?.job || job;
        storeJob(mergeFineTuningJobRecords(currentJob, acquisition.job));
      }
      heartbeatTimer = startFineTuningJobLeaseHeartbeat(record, jobId, lease);
      return await fineTuningOrchestrator.start(jobId);
    } catch (error) {
      if (Number(error?.status || 0) !== 409) {
        console.error("[fine-tuning] Optimization job execution failed", {
          jobId,
          message: error instanceof Error ? error.message : String(error),
        });
      }
      return null;
    } finally {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      jobLeasesById.delete(jobId);
      if (lease) {
        await releaseFineTuningJobLease(record, jobId, lease).catch((error) => {
          console.error("[fine-tuning] Failed to release optimization job lease", {
            jobId,
            message: error instanceof Error ? error.message : String(error),
          });
        });
      }
    }
  }

  function scheduleFineTuningJob(job, record) {
    const normalizedJob = compactFineTuningJobRecord(job);
    if (
      !normalizedJob.id
      || !isFineTuningPhaseActive(normalizedJob.phase)
      || ["cancelled", "completed", "failed", "error"].includes(
        normalizeString(normalizedJob.status).toLowerCase(),
      )
    ) return null;
    if (activeJobExecutions.has(normalizedJob.id)) {
      return activeJobExecutions.get(normalizedJob.id);
    }
    executionRecordsByJobId.set(normalizedJob.id, record);
    const execution = Promise.resolve()
      .then(() => executeFineTuningJobWithLease(normalizedJob, record))
      .finally(() => {
        activeJobExecutions.delete(normalizedJob.id);
        executionRecordsByJobId.delete(normalizedJob.id);
      });
    activeJobExecutions.set(normalizedJob.id, execution);
    return execution;
  }

  function buildClientFineTuningJobPatch(existingJob, incomingJob, jobId) {
    const existing = compactFineTuningJobRecord(existingJob);
    const incoming = readPlainObject(incomingJob);
    const normalizedId = normalizeString(
      incoming.id || incoming.jobId || incoming.job_id || jobId,
    ) || jobId;
    const patch = {
      ...existing,
      id: normalizedId,
      updatedAt: new Date().toISOString(),
    };
    if (Object.prototype.hasOwnProperty.call(incoming, "name")) {
      patch.name = normalizeString(incoming.name) || existing.name;
    }
    if (Object.prototype.hasOwnProperty.call(incoming, "description")) {
      patch.description = String(incoming.description || "");
    }
    if (Object.prototype.hasOwnProperty.call(incoming, "metadata")) {
      patch.metadata = {
        ...readPlainObject(existing.metadata),
        ...readPlainObject(incoming.metadata),
      };
    }
    return patch;
  }

  async function handleCreateJob(req, res) {
    try {
      pruneJobs();
      const body = await readRequestBody(req);
      const upstreamUrl = parseUpstreamUrl(req, body);
      const apiKey = readOptionalApiKey(req, body);
      const requestContext = req;
      if (!apiKey && !hasAiosSession(requestContext)) {
        return sendJson(res, 401, {
          error: "Unauthorized",
          message: "Sign in to Computer Agents or provide an API key.",
        });
      }
      const record = {
        requestContext,
        upstreamUrl,
        apiKey,
        body,
      };
      const submittedAgent = normalizeAgent(body.agent || {});
      const targetAgent = normalizeAgent(
        body.targetAgent
          || body.target_agent
          || body.agentToTune
          || body.agent_to_tune
          || submittedAgent,
      );
      const fineTunerAgent = normalizeAgent(
        body.fineTunerAgent
          || body.fine_tuner_agent
          || body.runnerAgent
          || body.runner_agent
          || submittedAgent,
      );
      const rawEnvironment = readPlainObject(body.environment);
      const environment = normalizeEnvironment(rawEnvironment);
      const evaluationSets = (Array.isArray(body.evaluationSets) ? body.evaluationSets : [])
        .map((set, index) => normalizeEvaluationSet(set, index))
        .filter((set) => set.id);
      if (!fineTunerAgent.id) {
        return sendJson(res, 400, { error: "Select an optimizer agent before starting optimization." });
      }
      if (!targetAgent.id) {
        return sendJson(res, 400, { error: "Select the agent to optimize before starting fine-tuning." });
      }
      if (isProtectedFineTuningTargetAgent(targetAgent)) {
        return sendJson(res, 400, { error: "Default agents cannot be optimized. Create or select a custom agent first." });
      }
      if (!environment.id) {
        return sendJson(res, 400, { error: "Select an environment before starting fine-tuning." });
      }
      if (!evaluationSets.length) {
        return sendJson(res, 400, { error: "Select at least one evaluation set." });
      }
      const emptyEvaluationSet = evaluationSets.find((set) => !Array.isArray(set.dataRows) || set.dataRows.length === 0);
      if (emptyEvaluationSet) {
        return sendJson(res, 400, {
          error: `Evaluation set "${emptyEvaluationSet.name}" has no cases.`,
        });
      }
      const jobId = normalizeString(body.id || body.jobId || body.job_id) || createFineTuningId();
      const existingJob = jobsById.get(jobId)?.job
        || await fetchBackendFineTuningJob(record, jobId).catch(() => null);
      if (existingJob) {
        const storedExistingJob = storeJob(existingJob) || existingJob;
        scheduleFineTuningJob(storedExistingJob, record);
        return sendJson(res, 200, {
          object: "fine_tuning_job",
          job: storedExistingJob,
          idempotent: true,
        });
      }
      const nowIso = new Date().toISOString();
      const conductedBy = normalizePersonIdentity(
        body.conductedBy
          || body.conducted_by
          || body.createdBy
          || body.created_by
          || {},
      );
      const selectedRunIds = readPlainObject(
        body.evaluationRunIds
          || body.evaluation_run_ids,
      );
      const baselineModes = readPlainObject(
        body.evaluationBaselineModes
          || body.evaluation_baseline_modes,
      );
      const targetSnapshot = buildAgentSnapshot(
        targetAgent,
        String(targetAgent.instructions || ""),
      );
      const configuration = normalizeFineTuningConfiguration({
        targetAgent: {
          id: targetAgent.id,
          name: targetAgent.name,
          photoUrl: targetAgent.photoUrl,
          versionId: normalizeString(
            body.targetAgentVersionId
              || body.target_agent_version_id
              || targetAgent.activeVersionId
              || targetAgent.active_version_id,
          ),
          versionNumber: Math.max(0, Number(
            body.targetAgentVersionNumber
              || body.target_agent_version_number
              || targetAgent.activeVersionNumber
              || targetAgent.active_version_number
              || 0,
          ) || 0),
          versionLabel: normalizeString(
            body.targetAgentVersionLabel
              || body.target_agent_version_label
              || targetAgent.activeVersionLabel
              || targetAgent.active_version_label,
          ),
          snapshot: targetSnapshot,
        },
        fineTunerAgent: {
          id: fineTunerAgent.id,
          name: fineTunerAgent.name,
          photoUrl: fineTunerAgent.photoUrl,
        },
        environment: {
          id: environment.id,
          name: environment.name,
          type: normalizeString(
            rawEnvironment.type
              || rawEnvironment.environmentType
              || rawEnvironment.environment_type,
          ).toLowerCase() === "project" ? "project" : "computer",
          projectId: normalizeString(
            rawEnvironment.projectId
              || rawEnvironment.project_id
              || body.projectId
              || body.project_id,
          ),
          revisionId: normalizeString(
            rawEnvironment.revisionId
              || rawEnvironment.revision_id
              || rawEnvironment.versionId
              || rawEnvironment.version_id,
          ),
          imageDigest: normalizeString(
            rawEnvironment.imageDigest
              || rawEnvironment.image_digest
              || rawEnvironment.containerImageDigest
              || rawEnvironment.container_image_digest,
          ),
        },
        evaluationTargets: evaluationSets.map((set) => {
          const selectedRunId = normalizeString(selectedRunIds[set.id]);
          const baselineMode = normalizeString(baselineModes[set.id]).toLowerCase() === "existing"
            && selectedRunId
            ? "existing"
            : "fresh";
          const selectedRun = (Array.isArray(set.runs) ? set.runs : [])
            .find((run) => normalizeString(run.id) === selectedRunId);
          return {
            evaluationSetId: set.id,
            evaluationSetName: set.name,
            evaluationVersionId: set.activeVersionId,
            evaluationVersionNumber: set.activeVersionNumber,
            evaluationVersionLabel: set.activeVersionLabel,
            baselineMode,
            baselineRunId: baselineMode === "existing" ? selectedRunId : "",
            baselineRunLabel: selectedRun?.label || "",
            caseCount: set.dataRows.length,
            passThreshold: set.passThreshold,
            successPolicy: readPlainObject(
              body.successPolicies?.[set.id]
                || body.success_policies?.[set.id],
            ),
            evaluationSetSnapshot: set,
          };
        }),
        knowledgeContext: normalizeKnowledgeContext(
          body.knowledgeContext
            || body.knowledge_context
            || body.metadata?.knowledgeContext
            || body.metadata?.knowledge_context,
          { source: "optimization" },
        ),
        objective: body.objective,
        limits: body.limits,
        publicationPolicy: body.publicationPolicy || body.publication_policy,
        instructions: String(body.instructions || body.focus || ""),
      });
      const name = normalizeString(body.name || `Optimize ${targetAgent.name}`);
      const initialJob = compactFineTuningJobRecord({
        id: jobId,
        schemaVersion: 2,
        kind: "agent_optimization",
        name,
        status: "running",
        phase: "queued",
        createdAt: nowIso,
        updatedAt: nowIso,
        conductedBy,
        createdBy: conductedBy,
        configuration,
        iterations: [],
        events: [{
          type: "job_queued",
          phase: "queued",
          message: "Fine-tuning job queued.",
          createdAt: nowIso,
        }],
        costLedger: [],
        beforeAgentSnapshot: targetSnapshot,
        afterAgentSnapshot: targetSnapshot,
        description: String(body.description || ""),
        instructions: configuration.instructions,
        analysisSummary: "Preparing baseline evaluations.",
        agentVersionCreationStatus: "not_created",
        execution: {
          startedAt: "",
          deadlineAt: new Date(
            Date.now() + configuration.limits.maxDurationMinutes * 60 * 1000,
          ).toISOString(),
        },
      });
      const storedInitialJob = storeJob(initialJob) || initialJob;
      try {
        await jobPersistence.enqueue(record, storedInitialJob);
      } catch (error) {
        jobsById.delete(storedInitialJob.id);
        jobPersistence.forget(storedInitialJob.id);
        throw createRuntimeError(
          `The optimization job could not be durably created: ${error instanceof Error ? error.message : String(error)}`,
          Number(error?.status || 502) >= 500 ? Number(error?.status || 502) : 502,
        );
      }
      sendJson(res, 202, {
        object: "fine_tuning_job",
        job: storedInitialJob,
      });
      scheduleFineTuningJob(storedInitialJob, record);
      return;
    } catch (error) {
      return sendJson(res, Number(error?.status || 500), {
        error: "Failed to start optimization job",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function handleCreateJobLegacy(req, res) {
    throw createRuntimeError(
      "The legacy browser-driven optimization workflow is disabled. Use the durable Agent Optimization orchestrator.",
      410,
    );
    try {
      pruneJobs();
      const body = await readRequestBody(req);
      const upstreamUrl = parseUpstreamUrl(req, body);
      const apiKey = readOptionalApiKey(req, body);
      const requestContext = req;
      if (!apiKey && !hasAiosSession(requestContext)) {
        return sendJson(res, 401, {
          error: "Unauthorized",
          message: "Sign in to Computer Agents or provide an API key.",
        });
      }
      const record = {
        requestContext,
        upstreamUrl,
        apiKey,
        body,
      };
      const submittedAgent = normalizeAgent(body.agent || {});
      const fineTunerAgent = normalizeAgent(body.fineTunerAgent || body.fine_tuner_agent || body.runnerAgent || body.runner_agent || body.agent || {});
      const environment = normalizeEnvironment(body.environment || {});
      const evaluationSets = (Array.isArray(body.evaluationSets) ? body.evaluationSets : [])
        .map((set, index) => normalizeEvaluationSet(set, index))
        .filter((set) => set.id);
      const instructions = String(body.instructions || body.focus || "");
      const verifyAfter = true;
      const evaluationTarget = resolveFineTuningTargetFromEvaluationSets(evaluationSets);
      if (evaluationTarget.error) {
        return sendJson(res, 400, { error: evaluationTarget.error });
      }
      const explicitTargetAgent = normalizeAgent(body.targetAgent || body.target_agent || {});
      const targetFromRun = evaluationTarget.target || null;
      if (targetFromRun?.id && explicitTargetAgent.id && explicitTargetAgent.id !== targetFromRun.id) {
        return sendJson(res, 400, { error: "The submitted target agent does not match the selected evaluation run target." });
      }
      const targetAgentSource = targetFromRun
        ? {
            ...(submittedAgent.id === targetFromRun.id ? submittedAgent : {}),
            ...(explicitTargetAgent.id === targetFromRun.id ? explicitTargetAgent : {}),
            id: targetFromRun.id,
            name: targetFromRun.name || explicitTargetAgent.name || submittedAgent.name || "Target Agent",
            photoUrl: targetFromRun.photoUrl || explicitTargetAgent.photoUrl || submittedAgent.photoUrl || "",
          }
        : explicitTargetAgent.id
          ? explicitTargetAgent
          : submittedAgent;
      const targetAgent = normalizeAgent(targetAgentSource);
      if (!fineTunerAgent.id) {
        return sendJson(res, 400, { error: "Select an optimizer agent before starting optimization." });
      }
      if (!targetAgent.id) {
        return sendJson(res, 400, { error: "The selected evaluation run does not contain a target agent. Run the evaluation first, then start fine-tuning from that run." });
      }
      if (isProtectedFineTuningTargetAgent(targetAgent)) {
        return sendJson(res, 400, { error: "Default agents cannot be optimized. Create or select a custom agent evaluation run first." });
      }
      if (!environment.id) {
        return sendJson(res, 400, { error: "Select a computer before starting fine-tuning." });
      }
      if (!evaluationSets.length) {
        return sendJson(res, 400, { error: "Select at least one evaluation set." });
      }
      const nowIso = new Date().toISOString();
      const jobId = normalizeString(body.id || body.jobId || body.job_id) || createFineTuningId();
      const conductedBy = normalizePersonIdentity(body.conductedBy || body.conducted_by || body.createdBy || body.created_by || {});
      const knowledgeContext = normalizeKnowledgeContext(
        body.knowledgeContext
          || body.knowledge_context
          || body.metadata?.knowledgeContext
          || body.metadata?.knowledge_context,
        { source: "optimization" },
      );
      const metadata = {
        ...(knowledgeContext ? { knowledgeContext } : {}),
        fineTuning: {
          jobId,
          jobName: normalizeString(body.name || "Optimize " + targetAgent.name),
          agentId: targetAgent.id,
          targetAgentId: targetAgent.id,
          targetAgentName: targetAgent.name,
          fineTunerAgentId: fineTunerAgent.id,
          fineTunerAgentName: fineTunerAgent.name,
          environmentId: environment.id,
          environmentName: environment.name,
          evaluationSetIds: evaluationSets.map((set) => set.id),
          ...(knowledgeContext ? { knowledgeContext } : {}),
          hidden: true,
          sidebarHidden: true,
        },
        runnerPlayground: {
          type: "fine_tuning_job",
          fineTuningJobId: jobId,
          ...(knowledgeContext ? { knowledgeContext } : {}),
          hidden: true,
          sidebarHidden: true,
        },
      };
      let thread = {
        id: "",
        title: "Agent Optimization · " + targetAgent.name,
      };
      let threadStartupError = "";
      try {
        thread = await createHiddenThread(record, {
          title: "Agent Optimization · " + targetAgent.name,
          agentId: fineTunerAgent.id,
          environmentId: environment.id,
          metadata,
        });
      } catch (error) {
        threadStartupError = error?.message || String(error);
      }
      const prompt = buildFineTuningPrompt({
        targetAgent,
        fineTunerAgent,
        environment,
        evaluationSets,
        instructions,
        verifyAfter,
        jobId,
        nextVersionNumber: Number(body.nextAgentVersionNumber || body.next_agent_version_number || 0) || 0,
      });
      const beforeScore = calculateAverageScore(evaluationSets);
      const improvementScore = 0;
      const afterScore = verifyAfter ? beforeScore : 0;
      const beforeSnapshot = buildAgentSnapshot(targetAgent, String(targetAgent.instructions || ""));
      const nextVersionNumber = Math.max(
        1,
        Number(body.nextAgentVersionNumber || body.next_agent_version_number || 0) || 0
      ) || 1;
      const evaluationRuns = buildEvaluationRunReferences(evaluationSets, verifyAfter, improvementScore);
      const initialVersion = {
        id: createFineTuningId("agent_version"),
        version: nextVersionNumber,
        label: "Optimized Version",
        description: "Generated by optimization job " + jobId,
        status: "pending",
        snapshot: null,
        createdAt: nowIso,
        fineTuningJobId: jobId,
        metadata: {
          fineTuningJobId: jobId,
          fine_tuning_job_id: jobId,
          fineTuningJobName: normalizeString(body.name || "Optimize " + targetAgent.name),
          fine_tuning_job_name: normalizeString(body.name || "Optimize " + targetAgent.name),
          fineTuningCreatedAt: nowIso,
          fine_tuning_created_at: nowIso,
          fineTuningStatus: "running",
          fine_tuning_status: "running",
          targetAgentId: targetAgent.id,
          target_agent_id: targetAgent.id,
          targetAgentName: targetAgent.name,
          target_agent_name: targetAgent.name,
          targetAgentPhotoUrl: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || targetAgent.avatarUrl || targetAgent.avatarURL),
          target_agent_photo_url: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || targetAgent.avatarUrl || targetAgent.avatarURL),
          fineTunerAgentId: fineTunerAgent.id,
          fine_tuner_agent_id: fineTunerAgent.id,
          fineTunerAgentName: fineTunerAgent.name,
          fine_tuner_agent_name: fineTunerAgent.name,
          fineTunerAgentPhotoUrl: normalizeString(fineTunerAgent.photoUrl || fineTunerAgent.photoURL || fineTunerAgent.avatarUrl || fineTunerAgent.avatarURL),
          fine_tuner_agent_photo_url: normalizeString(fineTunerAgent.photoUrl || fineTunerAgent.photoURL || fineTunerAgent.avatarUrl || fineTunerAgent.avatarURL),
          environmentId: environment.id,
          environment_id: environment.id,
          environmentName: environment.name,
          environment_name: environment.name,
          threadId: thread.id,
          thread_id: thread.id,
          fineTuningThreadId: thread.id,
          fine_tuning_thread_id: thread.id,
          threadTitle: thread.title || "Agent Optimization · " + targetAgent.name,
          thread_title: thread.title || "Agent Optimization · " + targetAgent.name,
          evaluationSetIds: evaluationSets.map((set) => set.id),
          evaluation_set_ids: evaluationSets.map((set) => set.id),
          conductedBy,
          conducted_by: conductedBy,
          createdBy: conductedBy,
          created_by: conductedBy,
          beforeAgentSnapshot: beforeSnapshot,
          before_agent_snapshot: beforeSnapshot,
        },
      };
      const initialCostTokens = 0;
      const initialCostUsd = 0;
      const initialJob = {
        id: jobId,
        name: normalizeString(body.name || "Optimize " + targetAgent.name),
        status: "running",
        createdAt: nowIso,
        updatedAt: nowIso,
        agentId: targetAgent.id,
        targetAgentId: targetAgent.id,
        agentName: targetAgent.name,
        targetAgentName: targetAgent.name,
        agentPhotoUrl: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || targetAgent.avatarUrl || targetAgent.avatarURL),
        targetAgentPhotoUrl: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || targetAgent.avatarUrl || targetAgent.avatarURL),
        conductedBy,
        createdBy: conductedBy,
        fineTunerAgentId: fineTunerAgent.id,
        fineTunerAgentName: fineTunerAgent.name,
        fineTunerAgentPhotoUrl: normalizeString(fineTunerAgent.photoUrl || fineTunerAgent.photoURL || fineTunerAgent.avatarUrl || fineTunerAgent.avatarURL),
        environmentId: environment.id,
        environmentName: environment.name,
        evaluationSets: evaluationSets.map((set) => ({
          id: set.id,
          name: set.name,
          activeVersionId: set.activeVersionId,
          activeVersionNumber: set.activeVersionNumber,
          activeVersionLabel: set.activeVersionLabel,
          fineTuningRunId: normalizeString(getFineTuningBaselineRun(set)?.id || set.selectedRunId || ""),
          fineTuningRunLabel: normalizeString(getFineTuningBaselineRun(set)?.label || ""),
          caseCount: Array.isArray(set.dataRows) ? set.dataRows.length : 0,
        })),
        instructions,
        verifyAfter,
        threadId: thread.id,
        threadTitle: thread.title || "Agent Optimization · " + targetAgent.name,
        beforeScore,
        afterScore: 0,
        improvementScore: 0,
        costTokens: initialCostTokens,
        costUsd: initialCostUsd,
        fineTuningCostUsd: initialCostUsd,
        verificationCostUsd: 0,
        analysisSummary: thread.id
          ? "Fine-tuning analysis is running."
          : "Fine-tuning analysis thread could not be created: " + threadStartupError,
        evaluationRuns,
        beforeAgentSnapshot: beforeSnapshot,
        afterAgentSnapshot: beforeSnapshot,
        diffFiles: [],
        createdAgentVersion: initialVersion,
        createdAgentVersionId: "",
        agentVersionCreationStatus: "pending",
      };
      const storedInitialJob = storeJob(initialJob) || initialJob;
      try {
        await jobPersistence.enqueue(record, storedInitialJob);
      } catch (error) {
        jobsById.delete(storedInitialJob.id);
        jobPersistence.forget(storedInitialJob.id);
        throw createRuntimeError(
          `The optimization job could not be durably created: ${error instanceof Error ? error.message : String(error)}`,
          Number(error?.status || 502) >= 500 ? Number(error?.status || 502) : 502,
        );
      }
      sendJson(res, 202, {
        object: "fine_tuning_job",
        job: storedInitialJob,
      });
      void (async () => {
        try {
          const threadOutcome = await resolveFineTuningThreadOutcome(
            record,
            thread,
            prompt,
            targetAgent,
            jobId,
            "Fine-tuning analysis thread could not be created, so a version was generated from the selected evaluation context: " + threadStartupError
          );
          const analysisSummary = threadOutcome.analysisSummary || "";
          const jobAfterAnalysis = jobsById.get(jobId)?.job || null;
          if (normalizeString(jobAfterAnalysis?.status).toLowerCase() === "cancelled") {
            await jobPersistence.enqueue(record, jobAfterAnalysis);
            return;
          }
          const proposedInstructions = buildProposedInstructions(targetAgent, evaluationSets, instructions, analysisSummary);
          const diffFiles = buildFineTuningDiffFiles(targetAgent, proposedInstructions);
          const afterSnapshot = buildAgentSnapshot(targetAgent, proposedInstructions);
          const finishedAtIso = new Date().toISOString();
          const hydratedThreadCosts = thread.id
            ? await fetchFineTuningThreadCosts(record, thread.id).catch(() => ({ costTokens: 0, costUsd: 0 }))
            : { costTokens: 0, costUsd: 0 };
          const fineTuningCostTokens = normalizeTokenCount(hydratedThreadCosts.costTokens);
          const fineTuningCostUsd = normalizeUsdCost(hydratedThreadCosts.costUsd);
          const proposedVersion = {
            ...initialVersion,
            status: "proposed",
            snapshot: afterSnapshot,
            metadata: {
              ...(initialVersion.metadata || {}),
              fineTuningUpdatedAt: finishedAtIso,
              fine_tuning_updated_at: finishedAtIso,
              fineTuningStatus: verifyAfter ? "verifying" : "completed",
              fine_tuning_status: verifyAfter ? "verifying" : "completed",
              beforeScore,
              before_score: beforeScore,
              afterScore,
              after_score: afterScore,
              improvementScore: verifyAfter ? clampScore(afterScore - beforeScore) : 0,
              improvement_score: verifyAfter ? clampScore(afterScore - beforeScore) : 0,
              costUsd: fineTuningCostUsd,
              cost_usd: fineTuningCostUsd,
              fineTuningCostUsd,
              fine_tuning_cost_usd: fineTuningCostUsd,
              verificationCostUsd: 0,
              verification_cost_usd: 0,
              evaluationRuns,
              evaluation_runs: evaluationRuns,
            },
          };
          let createdAgentVersion = proposedVersion;
          let agentVersionCreationStatus = "proposed";
          let agentVersionError = "";
          const threadCreatedVersion = threadOutcome.createdAgentVersion && typeof threadOutcome.createdAgentVersion === "object" && !Array.isArray(threadOutcome.createdAgentVersion)
            ? threadOutcome.createdAgentVersion
            : null;
          if (threadCreatedVersion?.id) {
            createdAgentVersion = {
              ...proposedVersion,
              ...threadCreatedVersion,
              id: threadCreatedVersion.id,
              status: normalizeString(threadCreatedVersion.status || "published") || "published",
              snapshot: preserveFineTuningAgentName(targetAgent, threadCreatedVersion.snapshot || proposedVersion.snapshot),
              metadata: {
                ...(proposedVersion.metadata || {}),
                ...readPlainObject(threadCreatedVersion.metadata),
                fineTuningStatus: verifyAfter ? "verifying" : "completed",
                fine_tuning_status: verifyAfter ? "verifying" : "completed",
              },
            };
            agentVersionCreationStatus = "published";
          } else {
            try {
              const savedVersion = await createAgentVersion(record, targetAgent, proposedVersion);
              const publishedVersion = await publishAgentVersion(record, targetAgent, savedVersion, proposedVersion.snapshot);
              createdAgentVersion = {
                ...proposedVersion,
                ...publishedVersion,
                status: normalizeString(publishedVersion.status || "published") || "published",
                snapshot: preserveFineTuningAgentName(targetAgent, publishedVersion.snapshot || savedVersion.snapshot || proposedVersion.snapshot),
              };
              agentVersionCreationStatus = "published";
            } catch (error) {
              agentVersionError = error?.message || String(error);
              createdAgentVersion = {
                ...proposedVersion,
                status: "error",
                error: agentVersionError,
              };
              agentVersionCreationStatus = "error";
            }
          }
          const publishedSnapshot = createdAgentVersion?.snapshot && typeof createdAgentVersion.snapshot === "object" && !Array.isArray(createdAgentVersion.snapshot)
            ? preserveFineTuningAgentName(targetAgent, createdAgentVersion.snapshot)
            : preserveFineTuningAgentName(targetAgent, afterSnapshot);
          const publishedDiffFiles = buildFineTuningDiffFilesFromSnapshots(beforeSnapshot, publishedSnapshot);
          const jobBeforeCompletion = jobsById.get(jobId)?.job || null;
          if (normalizeString(jobBeforeCompletion?.status).toLowerCase() === "cancelled") {
            await jobPersistence.enqueue(record, jobBeforeCompletion);
            return;
          }
          const versionReadyJob = storeJob({
            ...initialJob,
            status: agentVersionCreationStatus === "published"
              ? (verifyAfter ? "verifying" : "completed")
              : "error",
            updatedAt: finishedAtIso,
            afterScore,
            improvementScore: verifyAfter ? clampScore(afterScore - beforeScore) : 0,
            costTokens: fineTuningCostTokens,
            costUsd: fineTuningCostUsd,
            fineTuningCostUsd,
            verificationCostUsd: 0,
            analysisSummary,
            evaluationRuns,
            afterAgentSnapshot: publishedSnapshot,
            diffFiles: publishedDiffFiles.length ? publishedDiffFiles : diffFiles,
            createdAgentVersion,
            createdAgentVersionId: createdAgentVersion.id || "",
            agentVersionCreationStatus,
            agentVersionError,
            error: agentVersionError,
          }) || initialJob;
          await jobPersistence.enqueue(record, versionReadyJob);
          if (agentVersionCreationStatus !== "published") {
            return;
          }
          if (verifyAfter) {
            await startFineTuningVerificationRuns(record, versionReadyJob, evaluationSets, targetAgent, environment);
          }
        } catch (error) {
          const currentJob = jobsById.get(jobId)?.job || initialJob;
          const message = error?.message || String(error);
          const failedJob = storeJob({
            ...currentJob,
            status: "error",
            error: message,
            analysisSummary: currentJob.analysisSummary || message,
            agentVersionCreationStatus: ["saved", "published"].includes(currentJob.agentVersionCreationStatus) ? currentJob.agentVersionCreationStatus : "error",
            agentVersionError: ["saved", "published"].includes(currentJob.agentVersionCreationStatus) ? currentJob.agentVersionError : message,
            createdAgentVersion: ["saved", "published"].includes(currentJob.agentVersionCreationStatus)
              ? currentJob.createdAgentVersion
              : {
                  ...(currentJob.createdAgentVersion || initialVersion),
                status: "error",
                error: message,
              },
            updatedAt: new Date().toISOString(),
          }) || currentJob;
          void jobPersistence.enqueue(record, failedJob).catch(() => {});
        }
      })();
      return;
    } catch (error) {
      return sendJson(res, Number(error?.status || 500), {
        error: "Failed to start optimization job",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function wakeJobForService(req, jobId) {
    pruneJobs();
    const normalizedJobId = normalizeString(jobId);
    if (!normalizedJobId || deletedJobIds.has(normalizedJobId)) {
      throw createRuntimeError("Optimization job not found.", 404);
    }
    const body = {};
    const record = {
      requestContext: req,
      upstreamUrl: parseUpstreamUrl(req, body),
      apiKey: readOptionalApiKey(req, body),
      body,
    };
    if (!record.apiKey && !hasAiosSession(req)) {
      throw createRuntimeError(
        "Sign in to Computer Agents or provide an API key.",
        401,
      );
    }
    const memoryJob = jobsById.get(normalizedJobId)?.job || null;
    const backendJob = await fetchBackendFineTuningJob(record, normalizedJobId);
    if (!backendJob?.id) {
      throw createRuntimeError("Optimization job not found.", 404);
    }
    let job = memoryJob
      ? mergeFineTuningJobRecords(memoryJob, backendJob)
      : backendJob;
    job = await hydrateFineTuningJobDetails(record, job).catch(() => job);
    job = storeJob(job) || job;
    const execution = scheduleFineTuningJob(job, record);
    if (execution) await execution;
    const latest = jobsById.get(normalizedJobId)?.job || job;
    await ensureJobPersisted(record, latest);
    if (
      isFineTuningPhaseActive(latest.phase)
      && !["cancelled", "completed", "failed", "error"].includes(
        normalizeString(latest.status).toLowerCase(),
      )
    ) {
      throw createRuntimeError(
        "The optimization job remains active because its execution lease is held by another worker.",
        409,
      );
    }
    return latest;
  }

  function handleRequest(req, res, url) {
    if (req.method === "GET" && url.pathname === "/api/real/fine-tuning/jobs") {
      void (async () => {
        try {
          pruneJobs();
          const isOverviewRequest = normalizeString(url.searchParams.get("view")).toLowerCase() === "overview";
          const includeLegacyJobs = url.searchParams.get("includeLegacy") === "1";
          const body = {};
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          if (!record.apiKey && !hasAiosSession(req)) {
            sendJson(res, 401, {
              error: "Unauthorized",
              message: "Sign in to Computer Agents or provide an API key.",
            });
            return;
          }
          let backendLoadError = null;
          const backendJobs = await fetchBackendFineTuningJobs(record, url.search).catch((error) => {
            backendLoadError = error;
            console.error("[fine-tuning] Failed to load durable fine-tuning jobs", {
              message: error instanceof Error ? error.message : String(error),
            });
            return [];
          });
          if (!isOverviewRequest) {
            backendJobs.forEach((job) => {
              const memoryJob = jobsById.get(job.id)?.job || null;
              const storedJob = storeJob(
                memoryJob ? mergeFineTuningJobRecords(job, memoryJob) : job,
              );
              if (storedJob) scheduleFineTuningJob(storedJob, record);
            });
          }
          const memoryJobs = Array.from(jobsById.values()).map((record) => record.job);
          const recoverEmptyOverview = isOverviewRequest
            && shouldRecoverLegacyOverviewJobs(url, backendJobs);
          const shouldRecoverLegacyJobs = !isOverviewRequest
            || includeLegacyJobs
            || recoverEmptyOverview;
          const versionJobs = shouldRecoverLegacyJobs
            ? await recoverFineTuningJobsFromAgentVersions(record).catch(() => [])
            : [];
          const threadJobs = shouldRecoverLegacyJobs
            && !backendJobs.length
            && !memoryJobs.length
            && !versionJobs.length
            ? await recoverFineTuningJobsFromThreads(record).catch(() => [])
            : [];
          if (recoverEmptyOverview) {
            migrateRecoveredFineTuningJobs(record, [...versionJobs, ...threadJobs]);
          }
          if (backendLoadError && !memoryJobs.length && !versionJobs.length && !threadJobs.length) {
            throw backendLoadError;
          }
          const jobs = mergeFineTuningJobLists(backendJobs, versionJobs, threadJobs, memoryJobs).filter((job) => !deletedJobIds.has(job.id));
          const filteredJobs = filterFineTuningJobs(jobs, url);
          sendJson(res, 200, {
            object: "list",
            view: isOverviewRequest ? "overview" : "full",
            jobs: isOverviewRequest
              ? filteredJobs.map((job) => compactFineTuningJobOverviewRecord(job))
              : filteredJobs,
            total: jobs.length,
          });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to load optimization jobs",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    if (req.method === "POST" && url.pathname === "/api/real/fine-tuning/jobs") {
      void handleCreateJob(req, res);
      return true;
    }
    const jobMatch = url.pathname.match(/^\/api\/real\/fine-tuning\/jobs\/([^/]+)$/);
    if (req.method === "GET" && jobMatch) {
      void (async () => {
        try {
          pruneJobs();
          const jobId = decodeURIComponent(jobMatch[1]);
          if (deletedJobIds.has(jobId)) {
            sendJson(res, 404, { error: "Fine-tuning job not found." });
            return;
          }
          const body = {};
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          let job = jobsById.get(jobId)?.job || null;
          let backendLoadError = null;
          const backendJob = await fetchBackendFineTuningJob(record, jobId).catch((error) => {
            backendLoadError = error;
            return null;
          });
          if (backendJob) {
            job = job ? mergeFineTuningJobRecords(backendJob, job) : backendJob;
          }
          const versionJobs = await recoverFineTuningJobsFromAgentVersions(record).catch(() => []);
          const versionJob = versionJobs.find((item) => item.id === jobId) || null;
          if (versionJob) {
            job = job ? mergeFineTuningJobRecords(job, versionJob) : versionJob;
          }
          if (!job) {
            const threadJobs = await recoverFineTuningJobsFromThreads(record).catch(() => []);
            job = threadJobs.find((item) => item.id === jobId) || null;
          }
          if (job) {
            job = await hydrateFineTuningJobDetails(record, job).catch(() => job);
          }
          if (job) {
            job = storeJob(job) || job;
            scheduleFineTuningJob(job, record);
          }
          if (!job) {
            if (backendLoadError && Number(backendLoadError?.status || 0) !== 404) {
              throw backendLoadError;
            }
            sendJson(res, 404, { error: "Fine-tuning job not found." });
            return;
          }
          sendJson(res, 200, { object: "fine_tuning_job", job });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to load optimization job",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    if ((req.method === "PATCH" || req.method === "PUT") && jobMatch) {
      void (async () => {
        try {
          pruneJobs();
          const jobId = decodeURIComponent(jobMatch[1]);
          const body = await readRequestBody(req);
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          const backendJob = await fetchBackendFineTuningJob(record, jobId).catch(() => null);
          const existingJob = mergeFineTuningJobRecords(backendJob || { id: jobId }, jobsById.get(jobId)?.job || { id: jobId });
          const incomingJob = body?.job && typeof body.job === "object" && !Array.isArray(body.job)
            ? body.job
            : body;
          const mergedJob = mergeFineTuningJobRecords(
            existingJob,
            buildClientFineTuningJobPatch(existingJob, incomingJob, jobId),
          );
          const storedJob = storeJob(mergedJob) || mergedJob;
          const persistedJob = await jobPersistence.enqueue(record, storedJob);
          const responseJob = persistedJob ? (storeJob(mergeFineTuningJobRecords(storedJob, persistedJob)) || persistedJob) : storedJob;
          scheduleFineTuningJob(responseJob, record);
          sendJson(res, 200, { object: "fine_tuning_job", job: responseJob });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to update optimization job",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    const cancelMatch = url.pathname.match(/^\/api\/real\/fine-tuning\/jobs\/([^/]+)\/cancel$/);
    if (req.method === "POST" && cancelMatch) {
      void (async () => {
        try {
          pruneJobs();
          const jobId = decodeURIComponent(cancelMatch[1]);
          const body = {};
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          const backendJob = await fetchBackendFineTuningJob(record, jobId).catch(() => null);
          const existingJob = mergeFineTuningJobRecords(backendJob || { id: jobId }, jobsById.get(jobId)?.job || { id: jobId });
          await ensureJobPersisted(record, existingJob);
          const cancelledEvaluationRuns = (Array.isArray(existingJob.evaluationRuns) ? existingJob.evaluationRuns : []).map((reference) => ({
            ...reference,
            status: isFineTuningRuntimeActiveStatus(reference?.status) ? "cancelled" : reference?.status,
          }));
          const mergedJob = mergeFineTuningJobRecords(existingJob, {
            id: jobId,
            status: "cancelled",
            phase: "cancelled",
            stopReason: "cancelled",
            evaluationRuns: cancelledEvaluationRuns,
            events: [
              ...(Array.isArray(existingJob.events) ? existingJob.events : []),
              {
                type: "job_cancelled",
                phase: "cancelled",
                message: "Fine-tuning job cancelled.",
                createdAt: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          });
          const storedJob = storeJob(mergedJob) || mergedJob;
          const threadIds = Array.from(new Set([
            storedJob.threadId,
            existingJob.threadId,
            ...(Array.isArray(storedJob.iterations)
              ? storedJob.iterations.map((iteration) => iteration?.optimizerThreadId)
              : []),
          ].map(normalizeString).filter(Boolean)));
          await Promise.all(threadIds.map((threadId) => requestBackendJson(
              record,
              `/threads/${encodeURIComponent(threadId)}/cancel`,
              {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({}),
              },
              "Failed to cancel fine-tuning thread."
            ).catch(() => null)));
          let persistedJob;
          try {
            persistedJob = await cancelBackendFineTuningJob(record, jobId);
          } catch (error) {
            storeJob(existingJob);
            throw error;
          }
          jobPersistence.forget(jobId);
          const responseJob = persistedJob
            ? (storeJob(mergeFineTuningJobRecords(storedJob, {
                ...persistedJob,
                status: "cancelled",
                phase: "cancelled",
                stopReason: "cancelled",
                evaluationRuns: cancelledEvaluationRuns,
              })) || persistedJob)
            : storedJob;
          sendJson(res, 200, { object: "fine_tuning_job", job: responseJob });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to cancel optimization job",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    const publicationApprovalMatch = url.pathname.match(
      /^\/api\/real\/fine-tuning\/jobs\/([^/]+)\/publication-approval$/,
    );
    if (req.method === "POST" && publicationApprovalMatch) {
      void (async () => {
        try {
          pruneJobs();
          const jobId = decodeURIComponent(publicationApprovalMatch[1]);
          const body = await readRequestBody(req);
          const evidenceFingerprint = normalizeString(
            body?.evidenceFingerprint || body?.evidence_fingerprint,
          );
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          const backendJob = await fetchBackendFineTuningJob(record, jobId);
          const memoryJob = jobsById.get(jobId)?.job || null;
          const existingJob = memoryJob
            ? mergeFineTuningJobRecords(memoryJob, backendJob)
            : backendJob;
          if (!existingJob?.id) {
            throw createRuntimeError("Optimization job not found.", 404);
          }
          resolveFineTuningPublicationCandidate(
            existingJob,
            evidenceFingerprint,
          );
          const approvedJob = await approveBackendFineTuningPublication(
            record,
            jobId,
            evidenceFingerprint,
          );
          if (!approvedJob) {
            throw createRuntimeError(
              "Publication approval succeeded but no optimization job was returned.",
              502,
            );
          }
          const storedJob = storeJob(
            mergeFineTuningJobRecords(existingJob, approvedJob),
          ) || approvedJob;
          const execution = scheduleFineTuningJob(storedJob, record);
          if (execution) await execution;
          const responseJob = jobsById.get(jobId)?.job || storedJob;
          const published = normalizeString(
            responseJob.agentVersionCreationStatus
              || responseJob.createdAgentVersion?.status,
          ).toLowerCase() === "published";
          sendJson(res, published ? 200 : 202, {
            object: "fine_tuning_job",
            job: responseJob,
          });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to approve optimization publication",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    if (req.method === "DELETE" && jobMatch) {
      void (async () => {
        try {
          pruneJobs();
          const jobId = decodeURIComponent(jobMatch[1]);
          const body = {};
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          const existingJob = jobsById.get(jobId)?.job || null;
          if (existingJob) {
            await ensureJobPersisted(record, existingJob);
          } else {
            await jobPersistence.waitForIdle(jobId);
          }
          await deleteBackendFineTuningJob(record, jobId);
          jobPersistence.forget(jobId);
          jobsById.delete(jobId);
          deletedJobIds.add(jobId);
          sendJson(res, 200, { object: "fine_tuning_job.deleted", deleted: true });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to delete optimization job",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    return false;
  }

  return {
    handleRequest,
    jobs: Object.freeze({
      wake: wakeJobForService,
    }),
  };
}

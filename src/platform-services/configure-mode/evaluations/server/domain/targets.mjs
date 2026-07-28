import { createHash } from "node:crypto";
import {
  normalizeString,
  stableSerializeEvaluationValue,
} from "./primitives.mjs";
import { createRuntimeError } from "./scoring.mjs";

const TARGET_KINDS = new Set([
  "agent",
  "function",
  "metronome",
  "service_topology",
  "none",
]);
const TERMINAL_METRONOME_STATUSES = new Set([
  "completed",
  "failed",
  "cancelled",
  "skipped",
]);
const SUCCESSFUL_METRONOME_STATUSES = new Set(["completed", "skipped"]);
const SOURCE_URI_PATTERN =
  /^evaluation-source-asset:\/\/([^/]+)\/sha256\/([a-f0-9]{64})$/;

function readPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeInvocation(value) {
  const source = readPlainObject(value);
  const method = normalizeString(source.method || "POST").toUpperCase();
  const path = normalizeString(source.path || "/");
  const timeoutMs = Math.max(
    1_000,
    Math.min(30 * 60_000, Number(source.timeoutMs || 15 * 60_000) || 15 * 60_000),
  );
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    throw createRuntimeError(
      `Unsupported Evaluation target invocation method "${method}".`,
      409,
    );
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    throw createRuntimeError(
      "The Evaluation target invocation path is invalid.",
      409,
    );
  }
  return { method, path, timeoutMs };
}

export function normalizeEvaluationTargetBinding(value) {
  const source = readPlainObject(value);
  const kind = normalizeString(source.kind).toLowerCase() || "none";
  if (!TARGET_KINDS.has(kind)) {
    throw createRuntimeError(
      `Unsupported Evaluation target kind "${kind}".`,
      409,
    );
  }
  const snapshot = readPlainObject(source.snapshot);
  const binding = {
    bindingStatus: normalizeString(
      source.bindingStatus || source.binding_status,
    ),
    kind,
    targetId: normalizeString(
      source.targetId || source.target_id || source.id,
    ),
    targetVersionId: normalizeString(
      source.targetVersionId
        || source.target_version_id
        || source.versionId
        || source.version_id,
    ),
    targetVersionNumber: Math.max(
      0,
      Number(
        source.targetVersionNumber
          || source.target_version_number
          || source.versionNumber
          || source.version_number
          || 0,
      ) || 0,
    ),
    targetFingerprint: normalizeString(
      source.targetFingerprint || source.target_fingerprint,
    ),
    environmentId: normalizeString(
      source.environmentId || source.environment_id,
    ),
    invocation: kind === "agent" || kind === "none"
      ? null
      : normalizeInvocation(source.invocation || snapshot.invocation),
    snapshot,
  };
  if (
    !["none"].includes(kind)
    && binding.bindingStatus !== "control_plane_pinned"
  ) {
    throw createRuntimeError(
      "Non-legacy Evaluation targets must be pinned by the platform control plane.",
      409,
    );
  }
  if (
    ["agent", "function", "metronome"].includes(kind)
    && !binding.targetId
  ) {
    throw createRuntimeError(
      `The pinned Evaluation ${kind} target has no resource id.`,
      409,
    );
  }
  if (
    ["function", "metronome", "service_topology"].includes(kind)
    && !binding.targetVersionId
  ) {
    throw createRuntimeError(
      `The pinned Evaluation ${kind} target has no immutable version id.`,
      409,
    );
  }
  return binding;
}

function stableOutput(value) {
  if (typeof value === "string") return value;
  if (value === undefined) return "";
  return stableSerializeEvaluationValue(value);
}

function parseCaseInput(value) {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text) return "";
  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
}

function readMetronomeRun(value) {
  const source = readPlainObject(value);
  return readPlainObject(
    source.run
      || source.metronomeRun
      || source.metronome_run
      || source.data
      || source,
  );
}

function readListData(value) {
  if (Array.isArray(value)) return value;
  const source = readPlainObject(value);
  if (Array.isArray(source.data)) return source.data;
  return [];
}

function parseStructuredText(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = (fenced?.[1] || text).trim();
  try {
    const parsed = JSON.parse(candidate);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function metronomeThreadIds(metronomeRun) {
  const output = readPlainObject(metronomeRun.output);
  const threads = Array.isArray(output.threads) ? output.threads : [];
  const ids = [];
  const seen = new Set();
  for (const value of threads) {
    const thread = readPlainObject(value);
    const id = normalizeString(
      thread.id || thread.threadId || thread.thread_id,
    );
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function structuredMetronomeStepOutput(metronomeRun) {
  const output = readPlainObject(metronomeRun.output);
  const steps = Array.isArray(output.steps) ? output.steps : [];
  for (const value of [...steps].reverse()) {
    const step = readPlainObject(value);
    const stepOutput = readPlainObject(step.output);
    const candidates = [
      readPlainObject(stepOutput.structuredOutput).data,
      readPlainObject(stepOutput.structured_output).data,
      stepOutput.structuredOutput,
      stepOutput.structured_output,
    ];
    for (const candidate of candidates) {
      const parsed = parseStructuredText(candidate);
      if (parsed) return parsed;
    }
  }
  return null;
}

async function recoverMetronomeActualOutput({
  metronomeRun,
  requestJson,
}) {
  const stepOutput = structuredMetronomeStepOutput(metronomeRun);
  if (stepOutput) {
    return { output: stepOutput, source: "metronome_step" };
  }

  const threadIds = metronomeThreadIds(metronomeRun);
  for (const threadId of [...threadIds].reverse()) {
    const response = await requestJson(
      `/threads/${encodeURIComponent(threadId)}/messages?limit=50&order=desc`,
      { method: "GET" },
      "The Evaluation Metronome result thread could not be read.",
    );
    const messages = readListData(response);
    const assistantMessages = messages.filter((value) => {
      const message = readPlainObject(value);
      return ["assistant", "agent"].includes(
        normalizeString(message.role).toLowerCase(),
      );
    });
    for (const value of assistantMessages) {
      const message = readPlainObject(value);
      const parsed = parseStructuredText(
        message.content ?? message.text ?? message.output,
      );
      if (parsed) {
        return { output: parsed, source: "metronome_thread" };
      }
    }
    const latest = readPlainObject(assistantMessages[0]);
    const raw = latest.content ?? latest.text ?? latest.output;
    if (raw !== undefined && raw !== null && stableOutput(raw)) {
      return { output: raw, source: "metronome_thread_raw" };
    }
  }

  return {
    output: metronomeRun.output === undefined
      ? metronomeRun
      : metronomeRun.output,
    source: "metronome_run",
  };
}

function resolveTopologyEntrypoint(binding) {
  const snapshot = binding.snapshot;
  const entrypoint = normalizeString(snapshot.entrypoint);
  const resources = Array.isArray(snapshot.resources)
    ? snapshot.resources.map(readPlainObject)
    : [];
  const resource = resources.find(
    (candidate) => normalizeString(candidate.key) === entrypoint,
  );
  if (!entrypoint || !resource) {
    throw createRuntimeError(
      "The pinned Evaluation service topology has no valid entrypoint.",
      409,
    );
  }
  return normalizeEvaluationTargetBinding({
    bindingStatus: "control_plane_pinned",
    kind: resource.kind,
    targetId: resource.id,
    targetVersionId: resource.versionId,
    targetVersionNumber: resource.versionNumber,
    targetFingerprint: resource.fingerprint,
    environmentId: binding.environmentId,
    invocation: binding.invocation || snapshot.invocation,
    snapshot: resource.snapshot,
  });
}

function topologyAgentVersionBindings(binding) {
  if (binding.kind !== "service_topology") return {};
  const resources = Array.isArray(binding.snapshot.resources)
    ? binding.snapshot.resources.map(readPlainObject)
    : [];
  const agentResources = resources
    .filter((resource) => normalizeString(resource.kind) === "agent");
  const bindings = {};
  for (const resource of agentResources) {
    const agentId = normalizeString(resource.id);
    const versionId = normalizeString(resource.versionId);
    if (!agentId || !versionId) {
      throw createRuntimeError(
        "The pinned Evaluation topology contains an Agent without an immutable version.",
        409,
      );
    }
    if (bindings[agentId] && bindings[agentId] !== versionId) {
      throw createRuntimeError(
        `The Evaluation topology binds Agent ${agentId} to conflicting versions.`,
        409,
      );
    }
    bindings[agentId] = versionId;
  }
  return bindings;
}

async function executeFunctionTarget({
  binding,
  input,
  requestJson,
}) {
  const deployment = readPlainObject(binding.snapshot.deployment);
  const expectedRevision = normalizeString(deployment.revision);
  if (!expectedRevision) {
    throw createRuntimeError(
      "The pinned Function target has no deployment revision.",
      409,
    );
  }
  const response = await requestJson(
    `/servers/${encodeURIComponent(binding.targetId)}/invoke`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        method: binding.invocation.method,
        path: binding.invocation.path,
        body: input,
        expectedRevision,
      }),
    },
    "The Evaluation Function target could not be invoked.",
  );
  const actualRevision = normalizeString(
    response?.deploymentRevision || response?.deployment_revision,
  );
  if (actualRevision !== expectedRevision) {
    throw createRuntimeError(
      "The Function deployment changed after the Evaluation target was pinned.",
      409,
    );
  }
  const upstreamStatus = Number(response?.status || 0);
  if (
    response?.ok === false
    || (Number.isFinite(upstreamStatus) && upstreamStatus >= 400)
  ) {
    throw createRuntimeError(
      `The Evaluation Function returned HTTP ${upstreamStatus || "error"}.`,
      502,
    );
  }
  return {
    actualOutput: stableOutput(response?.body),
    execution: {
      kind: "function",
      targetId: binding.targetId,
      targetVersionId: binding.targetVersionId,
      deploymentRevision: actualRevision,
      upstreamStatus,
    },
  };
}

async function executeMetronomeTarget({
  binding,
  pinnedAgentVersions,
  input,
  requestJson,
  runId,
  caseId,
  pollAttempts,
  pollMs,
}) {
  const definition = readPlainObject(binding.snapshot.definition);
  if (!Object.keys(definition).length) {
    throw createRuntimeError(
      "The pinned Metronome target has no immutable definition.",
      409,
    );
  }
  const created = await requestJson(
    `/metronomes/${encodeURIComponent(binding.targetId)}/test-run`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        definition,
        input,
        pinnedAgentVersions,
        versionId: binding.targetVersionId,
        triggerType: "evaluation",
        idempotencyKey: `evaluation:${runId}:${caseId}`,
        timeoutMs: binding.invocation.timeoutMs,
        executeImmediately: false,
      }),
    },
    "The Evaluation Metronome target could not be started.",
  );
  let metronomeRun = readMetronomeRun(created);
  const metronomeRunId = normalizeString(metronomeRun.id);
  if (!metronomeRunId) {
    throw createRuntimeError(
      "The Metronome target did not return a run id.",
      502,
    );
  }
  const intervalMs = Math.max(25, Number(pollMs || 5_000) || 5_000);
  const configuredAttempts = Number(pollAttempts || 0);
  const attempts = configuredAttempts > 0
    ? Math.max(1, configuredAttempts)
    : Math.max(
        2,
        Math.ceil((binding.invocation.timeoutMs + 60_000) / intervalMs) + 1,
      );
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const status = normalizeString(metronomeRun.status).toLowerCase();
    if (TERMINAL_METRONOME_STATUSES.has(status)) break;
    if (attempt >= attempts - 1) {
      throw createRuntimeError(
        "The Metronome target did not finish before the Evaluation timeout.",
        504,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    metronomeRun = readMetronomeRun(await requestJson(
      `/metronomes/${encodeURIComponent(binding.targetId)}/runs/${encodeURIComponent(metronomeRunId)}?view=status`,
      { method: "GET" },
      "The Evaluation Metronome run could not be read.",
    ));
  }
  const status = normalizeString(metronomeRun.status).toLowerCase();
  if (!SUCCESSFUL_METRONOME_STATUSES.has(status)) {
    throw createRuntimeError(
      normalizeString(metronomeRun.error)
        || `The Evaluation Metronome run ended with status ${status || "unknown"}.`,
      502,
    );
  }
  const metronomeOutput = readPlainObject(metronomeRun.output);
  const requestedPins = readPlainObject(
    metronomeOutput.pinnedAgentVersions
      || metronomeOutput.pinned_agent_versions,
  );
  const exercisedPins = readPlainObject(
    metronomeOutput.exercisedPinnedAgentVersions
      || metronomeOutput.exercised_pinned_agent_versions,
  );
  for (const [agentId, versionId] of Object.entries(pinnedAgentVersions)) {
    if (
      normalizeString(requestedPins[agentId]) !== versionId
      || normalizeString(exercisedPins[agentId]) !== versionId
    ) {
      throw createRuntimeError(
        `The Metronome run did not attest execution of pinned Agent ${agentId} at version ${versionId}.`,
        409,
      );
    }
  }
  const recoveredOutput = await recoverMetronomeActualOutput({
    metronomeRun,
    requestJson,
  });
  return {
    actualOutput: stableOutput(recoveredOutput.output),
    execution: {
      kind: "metronome",
      targetId: binding.targetId,
      targetVersionId: binding.targetVersionId,
      metronomeRunId,
      status,
      outputSource: recoveredOutput.source,
      exercisedPinnedAgentVersions: exercisedPins,
    },
  };
}

export async function executeEvaluationTarget(input) {
  const requestedBinding = normalizeEvaluationTargetBinding(input.binding);
  const pinnedAgentVersions = topologyAgentVersionBindings(
    requestedBinding,
  );
  const binding = requestedBinding.kind === "service_topology"
    ? resolveTopologyEntrypoint(requestedBinding)
    : requestedBinding;
  if (!["function", "metronome"].includes(binding.kind)) {
    throw createRuntimeError(
      `Evaluation target execution does not support "${binding.kind}".`,
      409,
    );
  }
  const invocationInput = parseCaseInput(input.caseInput);
  const result = binding.kind === "function"
    ? await executeFunctionTarget({
        binding,
        input: invocationInput,
        requestJson: input.requestJson,
      })
    : await executeMetronomeTarget({
        binding,
        pinnedAgentVersions,
        input: invocationInput,
        requestJson: input.requestJson,
        runId: input.runId,
        caseId: input.caseId,
        pollAttempts: input.pollAttempts,
        pollMs: input.pollMs,
      });
  return {
    ...result,
    execution: {
      ...result.execution,
      requestedTargetKind: requestedBinding.kind,
      targetFingerprint: requestedBinding.targetFingerprint,
      pinnedAgentVersions,
    },
  };
}

function collectSourceUris(value, target, seen = new WeakSet()) {
  if (typeof value === "string") {
    const match = value.match(SOURCE_URI_PATTERN);
    if (match) target.add(value);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      for (const item of value) collectSourceUris(item, target, seen);
      return;
    }
    for (const nested of Object.values(value)) {
      collectSourceUris(nested, target, seen);
    }
  } finally {
    seen.delete(value);
  }
}

function sourceAssetIndex(evaluationBinding) {
  const snapshot = readPlainObject(evaluationBinding?.snapshot);
  const metadata = readPlainObject(snapshot.metadata);
  const datasets = Array.isArray(metadata.datasetAssets)
    ? metadata.datasetAssets.map(readPlainObject)
    : [];
  const index = new Map();
  for (const dataset of datasets) {
    const assets = Array.isArray(dataset.sourceAssets)
      ? dataset.sourceAssets.map(readPlainObject)
      : [];
    for (const asset of assets) {
      const immutableUri = normalizeString(asset.immutableUri);
      if (!immutableUri) continue;
      index.set(immutableUri, {
        datasetAssetId: normalizeString(dataset.id),
        sourceAssetId: normalizeString(asset.id),
        logicalId: normalizeString(asset.logicalId),
        filename: normalizeString(asset.filename || asset.logicalId),
        contentType: normalizeString(asset.contentType)
          || "application/octet-stream",
        sha256: normalizeString(asset.sha256),
        immutableUri,
        sizeBytes: Math.max(0, Number(asset.sizeBytes || 0) || 0),
      });
    }
  }
  return index;
}

export async function hydrateEvaluationSourceAssets({
  evaluationBinding,
  caseInput,
  caseMetadata,
  requestBytes,
  maximumBytes = 150 * 1024 * 1024,
}) {
  const parsedInput = parseCaseInput(caseInput);
  const sourceUris = new Set();
  collectSourceUris(parsedInput, sourceUris);
  collectSourceUris(caseMetadata, sourceUris);
  if (!sourceUris.size) {
    return {
      input: parsedInput,
      sourceAssets: [],
    };
  }
  const manifests = sourceAssetIndex(evaluationBinding);
  const sourceAssets = [];
  let totalBytes = 0;
  for (const immutableUri of [...sourceUris].sort()) {
    const manifest = manifests.get(immutableUri);
    if (
      !manifest
      || !manifest.datasetAssetId
      || !manifest.sourceAssetId
      || !manifest.sha256
    ) {
      throw createRuntimeError(
        `The immutable Evaluation source "${immutableUri}" has no control-plane manifest.`,
        409,
      );
    }
    const uriMatch = immutableUri.match(SOURCE_URI_PATTERN);
    const expectedSha = uriMatch ? `sha256:${uriMatch[2]}` : "";
    if (manifest.sha256 !== expectedSha) {
      throw createRuntimeError(
        `The immutable Evaluation source "${immutableUri}" has inconsistent digests.`,
        409,
      );
    }
    const content = await requestBytes(
      `/evaluations/${encodeURIComponent(evaluationBinding.evaluationId)}/dataset-assets/${encodeURIComponent(manifest.datasetAssetId)}/source-assets/${encodeURIComponent(manifest.sourceAssetId)}/content`,
      "The immutable Evaluation source could not be loaded.",
    );
    const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content);
    totalBytes += bytes.byteLength;
    if (totalBytes > maximumBytes) {
      throw createRuntimeError(
        "The Evaluation case source bundle exceeds the runtime hydration limit.",
        413,
      );
    }
    const actualSha = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
    if (actualSha !== manifest.sha256) {
      throw createRuntimeError(
        `The immutable Evaluation source "${immutableUri}" failed digest verification.`,
        409,
      );
    }
    sourceAssets.push({
      logicalId: manifest.logicalId,
      filename: manifest.filename,
      contentType: manifest.contentType,
      immutableUri,
      sha256: actualSha,
      sizeBytes: bytes.byteLength,
      dataBase64: bytes.toString("base64"),
    });
  }
  const envelope = parsedInput
    && typeof parsedInput === "object"
    && !Array.isArray(parsedInput)
    ? { ...parsedInput }
    : { input: parsedInput };
  return {
    input: {
      ...envelope,
      evaluationSourceAssets: sourceAssets,
    },
    sourceAssets: sourceAssets.map(({ dataBase64: _dataBase64, ...asset }) => asset),
  };
}

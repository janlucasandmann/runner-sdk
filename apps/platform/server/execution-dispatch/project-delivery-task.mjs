const BUILD_SCHEMA_VERSION =
  "computer_agents_project_delivery_build_evidence_v1";
const HANDOFF_SCHEMA_VERSION =
  "computer_agents_project_delivery_handoff_evidence_v1";
const COMMIT_SHA_PATTERN = /^[a-f0-9]{7,64}$/i;
const SHA256_PATTERN = /^(?:sha256:)?[a-f0-9]{64}$/i;

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function stringValue(value, maximum = 4_000) {
  return String(value || "").trim().slice(0, maximum);
}

function stringList(value, maximum = 100) {
  return (Array.isArray(value) ? value : [])
    .map((entry) => stringValue(entry, 1_000))
    .filter(Boolean)
    .slice(0, maximum);
}

function assertKnownKeys(value, allowed, path) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length) {
    throw new Error(
      `${path} contains unsupported fields: ${unknown.sort().join(", ")}.`,
    );
  }
}

function parseJsonEvidence(value, label) {
  const text = stringValue(value, 250_000);
  const expression = new RegExp(
    "```" + label + "\\s*([\\s\\S]*?)```",
    "i",
  );
  const match = text.match(expression);
  if (!match?.[1]) {
    throw new Error(`Agent response is missing the ${label} evidence block.`);
  }
  try {
    return asRecord(JSON.parse(match[1].trim()));
  } catch {
    throw new Error(`Agent response contains invalid ${label} JSON.`);
  }
}

function normalizeResources(value) {
  return (Array.isArray(value) ? value : []).map((entry, index) => {
    const source = asRecord(entry);
    assertKnownKeys(
      source,
      new Set(["id", "revision", "status", "url"]),
      `resources[${index}]`,
    );
    const id = stringValue(source.id, 300);
    const revision = stringValue(source.revision, 300);
    const status = stringValue(source.status, 100).toLowerCase();
    const url = stringValue(source.url, 2_000) || null;
    if (!id || !revision || !status) {
      throw new Error(
        `resources[${index}] requires id, revision, and status.`,
      );
    }
    return { id, revision, status, url };
  });
}

function normalizeArtifacts(value) {
  return (Array.isArray(value) ? value : []).map((entry, index) => {
    const source = asRecord(entry);
    assertKnownKeys(
      source,
      new Set(["name", "uri", "sha256"]),
      `artifacts[${index}]`,
    );
    const name = stringValue(source.name, 500);
    const uri = stringValue(source.uri, 2_000);
    const sha256 = stringValue(source.sha256, 200) || null;
    if (!name || !uri) {
      throw new Error(`artifacts[${index}] requires name and uri.`);
    }
    if (sha256 && !SHA256_PATTERN.test(sha256)) {
      throw new Error(`artifacts[${index}].sha256 is invalid.`);
    }
    return { name, uri, sha256 };
  });
}

function normalizeHealthChecks(value) {
  const checks = (Array.isArray(value) ? value : []).map((entry, index) => {
    const source = asRecord(entry);
    assertKnownKeys(
      source,
      new Set(["name", "status", "url"]),
      `healthChecks[${index}]`,
    );
    const name = stringValue(source.name, 500);
    const status = stringValue(source.status, 100).toLowerCase();
    const url = stringValue(source.url, 2_000) || null;
    if (!name || !status) {
      throw new Error(`healthChecks[${index}] requires name and status.`);
    }
    return { name, status, url };
  });
  if (!checks.length || checks.some((check) => check.status !== "passed")) {
    throw new Error("Every build health check must be present and passed.");
  }
  return checks;
}

export function normalizeProjectDeliveryTaskEvidence(value, metadataValue) {
  const metadata = asRecord(metadataValue);
  const stage = stringValue(metadata.deliveryStageId, 100).toLowerCase();
  if (stage === "build") {
    const source = parseJsonEvidence(value, "project_delivery_build_json");
    assertKnownKeys(
      source,
      new Set([
        "schemaVersion",
        "summary",
        "commitSha",
        "resources",
        "healthChecks",
        "artifacts",
      ]),
      "build evidence",
    );
    if (source.schemaVersion !== BUILD_SCHEMA_VERSION) {
      throw new Error("Build evidence schemaVersion is invalid.");
    }
    const commitSha = stringValue(source.commitSha, 100);
    if (!COMMIT_SHA_PATTERN.test(commitSha)) {
      throw new Error("Build evidence requires a valid Git commit SHA.");
    }
    const resources = normalizeResources(source.resources);
    const expectedResourceIds = stringList(metadata.resourceIds);
    const present = new Set(resources.map((resource) => resource.id));
    const missing = expectedResourceIds.filter((id) => !present.has(id));
    if (missing.length) {
      throw new Error(
        `Build evidence is missing required resources: ${missing.join(", ")}.`,
      );
    }
    const allowedStatuses = new Set([
      "active",
      "deployed",
      "healthy",
      "published",
      "saved",
    ]);
    if (resources.some((resource) => !allowedStatuses.has(resource.status))) {
      throw new Error("Every build resource must have a releasable status.");
    }
    return {
      schemaVersion: BUILD_SCHEMA_VERSION,
      summary: stringValue(source.summary, 10_000),
      commitSha,
      resources,
      healthChecks: normalizeHealthChecks(source.healthChecks),
      artifacts: normalizeArtifacts(source.artifacts),
    };
  }
  if (stage === "deliver") {
    const source = parseJsonEvidence(value, "project_delivery_handoff_json");
    assertKnownKeys(
      source,
      new Set([
        "schemaVersion",
        "summary",
        "assuranceRunId",
        "resources",
        "handoff",
        "residualRisks",
      ]),
      "handoff evidence",
    );
    if (source.schemaVersion !== HANDOFF_SCHEMA_VERSION) {
      throw new Error("Handoff evidence schemaVersion is invalid.");
    }
    const assuranceRunId = stringValue(source.assuranceRunId, 300);
    const expectedRunId = stringValue(metadata.assuranceRunId, 300);
    if (!assuranceRunId || assuranceRunId !== expectedRunId) {
      throw new Error(
        "Handoff evidence must reference the passed Assurance Run.",
      );
    }
    const summary = stringValue(source.summary, 10_000);
    const handoff = stringList(source.handoff);
    if (!summary || !handoff.length) {
      throw new Error("Handoff evidence requires a summary and handoff items.");
    }
    const resources = normalizeResources(source.resources);
    const expectedResourceIds = stringList(metadata.resourceIds);
    const present = new Set(resources.map((resource) => resource.id));
    const missing = expectedResourceIds.filter((id) => !present.has(id));
    if (missing.length) {
      throw new Error(
        `Handoff evidence is missing required resources: ${missing.join(", ")}.`,
      );
    }
    return {
      schemaVersion: HANDOFF_SCHEMA_VERSION,
      summary,
      assuranceRunId,
      resources,
      handoff,
      residualRisks: stringList(source.residualRisks),
    };
  }
  throw new Error(`Unsupported project delivery task stage: ${stage || "unknown"}.`);
}

export function buildProjectDeliveryTaskPrompt(metadataValue) {
  const metadata = asRecord(metadataValue);
  const stage = stringValue(metadata.deliveryStageId, 100).toLowerCase();
  const goal = stringValue(metadata.goal, 10_000);
  if (stage === "build") {
    return [
      "Execute this Mission Control build ticket autonomously.",
      goal ? `Project goal: ${goal}` : "",
      "Implement and deploy every bound project resource, run real health checks, and retain immutable artifact references.",
      "Do not claim success from plans, comments, or simulated output.",
      "Finish with exactly one fenced project_delivery_build_json block using this strict shape:",
      "```project_delivery_build_json",
      JSON.stringify({
        schemaVersion: BUILD_SCHEMA_VERSION,
        summary: "What was built and verified.",
        commitSha: "full Git commit SHA",
        resources: [{
          id: "bound resource id",
          revision: "immutable deployed revision",
          status: "deployed",
          url: "https://optional-health-url.example",
        }],
        healthChecks: [{
          name: "health check",
          status: "passed",
          url: "https://optional-health-url.example",
        }],
        artifacts: [{
          name: "artifact",
          uri: "workspace://or-storage-reference",
          sha256: null,
        }],
      }, null, 2),
      "```",
    ].filter(Boolean).join("\n\n");
  }
  if (stage === "deliver") {
    return [
      "Prepare the final operational handoff for this Mission Control delivery.",
      goal ? `Project goal: ${goal}` : "",
      `Canonical Assurance Run: ${stringValue(metadata.assuranceRunId, 300)}`,
      "Inspect the delivered resources and canonical evidence. Record deployment, operation, rollback, ownership, and residual-risk guidance.",
      "Finish with exactly one fenced project_delivery_handoff_json block using this strict shape:",
      "```project_delivery_handoff_json",
      JSON.stringify({
        schemaVersion: HANDOFF_SCHEMA_VERSION,
        summary: "Delivery summary.",
        assuranceRunId: stringValue(metadata.assuranceRunId, 300),
        resources: stringList(metadata.resourceIds).map((id) => ({
          id,
          revision: "immutable delivered revision",
          status: "deployed",
          url: null,
        })),
        handoff: ["Operational instruction"],
        residualRisks: [],
      }, null, 2),
      "```",
    ].filter(Boolean).join("\n\n");
  }
  throw new Error(`Unsupported project delivery task stage: ${stage || "unknown"}.`);
}

export const PROJECT_DELIVERY_BUILD_EVIDENCE_SCHEMA_VERSION =
  BUILD_SCHEMA_VERSION;
export const PROJECT_DELIVERY_HANDOFF_EVIDENCE_SCHEMA_VERSION =
  HANDOFF_SCHEMA_VERSION;

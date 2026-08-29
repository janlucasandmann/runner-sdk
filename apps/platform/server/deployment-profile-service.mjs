import { createHash } from "node:crypto";

const PROFILE_IDS = new Set([
  "cloud-saas-v1",
  "dgx-spark-appliance-v1",
]);
const STAGES = new Set(["dev", "cons", "prod"]);
const TOPOLOGIES = new Set(["gcp_saas", "on_prem"]);
const EDITIONS = new Set(["cloud", "appliance"]);
const READINESS_VALUES = new Set(["available", "foundation"]);
const INFERENCE_MODES = new Set(["managed_catalog", "deployment_fixed"]);
const COMMERCE_MODES = new Set(["subscription", "none"]);
const ENTITLEMENT_SOURCES = new Set([
  "subscription_catalog",
  "deployment_license",
]);
const USAGE_MODES = new Set(["billable", "observability_only"]);
const BUILT_IN_AGENTS = new Set(["spark", "forge", "foundry"]);
const CAPABILITY_KEYS = Object.freeze([
  "platform",
  "agentExecution",
  "schedules",
  "metronomes",
  "localInference",
  "deployableResources",
  "modelManagement",
  "modelSelection",
  "subscriptions",
  "billing",
  "pricing",
  "commercialUsageLimits",
]);

export class DeploymentProfileIntegrityError extends Error {
  constructor(message) {
    super(message);
    this.name = "DeploymentProfileIntegrityError";
  }
}

function assertRecord(value, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new DeploymentProfileIntegrityError(`${path} must be an object.`);
  }
  return value;
}

function assertEnum(value, allowed, path) {
  if (typeof value !== "string" || !allowed.has(value)) {
    throw new DeploymentProfileIntegrityError(`${path} has an unsupported value.`);
  }
  return value;
}

function assertBoolean(value, path) {
  if (typeof value !== "boolean") {
    throw new DeploymentProfileIntegrityError(`${path} must be a boolean.`);
  }
  return value;
}

function assertString(value, path, pattern, maximumLength = 120) {
  if (
    typeof value !== "string"
    || !value.trim()
    || value.trim().length > maximumLength
    || !pattern.test(value.trim())
  ) {
    throw new DeploymentProfileIntegrityError(`${path} is invalid.`);
  }
  return value.trim();
}

function assertCoordinate(value, path, minimum, maximum) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new DeploymentProfileIntegrityError(
      `${path} must be a finite number between ${minimum} and ${maximum}.`,
    );
  }
  return value;
}

function validateDeploymentEndpoint(value, path) {
  if (value === null) return null;
  const endpoint = assertRecord(value, path);
  const principal = assertRecord(endpoint.principal, `${path}.principal`);
  const region = assertRecord(endpoint.region, `${path}.region`);
  if (endpoint.id !== "deployment-inference-endpoint") {
    throw new DeploymentProfileIntegrityError(`${path}.id is unsupported.`);
  }
  if (principal.type !== "appliance") {
    throw new DeploymentProfileIntegrityError(`${path}.principal.type is unsupported.`);
  }
  return {
    id: "deployment-inference-endpoint",
    name: assertString(endpoint.name, `${path}.name`, /^[^\r\n\0]+$/),
    principal: {
      type: "appliance",
      id: assertString(
        principal.id,
        `${path}.principal.id`,
        /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/,
        160,
      ),
      name: assertString(principal.name, `${path}.principal.name`, /^[^\r\n\0]+$/),
    },
    region: {
      code: assertString(
        region.code,
        `${path}.region.code`,
        /^[a-z0-9][a-z0-9._-]{0,63}$/,
        64,
      ),
      label: assertString(region.label, `${path}.region.label`, /^[^\r\n\0]+$/),
      latitude: assertCoordinate(region.latitude, `${path}.region.latitude`, -90, 90),
      longitude: assertCoordinate(region.longitude, `${path}.region.longitude`, -180, 180),
    },
  };
}

function assertAgentList(value, path) {
  if (
    !Array.isArray(value)
    || value.some((entry) => typeof entry !== "string" || !BUILT_IN_AGENTS.has(entry))
    || new Set(value).size !== value.length
  ) {
    throw new DeploymentProfileIntegrityError(`${path} must contain unique supported built-in agents.`);
  }
  return [...value];
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value;
}

export function hashPublicDeploymentProfile(profile) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(profile)))
    .digest("hex");
}

function freezeRecursively(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const entry of Object.values(value)) freezeRecursively(entry);
  return Object.freeze(value);
}

export function validatePublicDeploymentProfileEnvelope(
  envelope,
  {
    expectedProfileId,
    expectedTopology,
    expectedStage,
  } = {},
) {
  const envelopeRecord = assertRecord(envelope, "deployment profile envelope");
  const rawProfile = assertRecord(envelopeRecord.profile, "deployment profile");
  const rawCapabilities = assertRecord(rawProfile.capabilities, "deployment profile capabilities");
  const rawProduct = assertRecord(rawProfile.product, "deployment product profile");
  const rawInference = assertRecord(rawProduct.inference, "deployment inference profile");
  const rawAgents = assertRecord(rawProduct.agents, "deployment agent profile");
  const rawDefaultTeam = assertRecord(rawAgents.defaultTeam, "deployment default-team profile");
  const rawCommerce = assertRecord(rawProduct.commerce, "deployment commerce profile");
  const rawUsage = assertRecord(rawProduct.usage, "deployment usage profile");

  if (rawProfile.schemaVersion !== 2) {
    throw new DeploymentProfileIntegrityError("Unsupported deployment profile schema version.");
  }

  const capabilities = Object.fromEntries(
    CAPABILITY_KEYS.map((key) => [
      key,
      assertBoolean(rawCapabilities[key], `deployment profile capabilities.${key}`),
    ]),
  );
  const fixedModelId = rawInference.fixedModelId;
  const inferenceMode = assertEnum(
    rawInference.mode,
    INFERENCE_MODES,
    "deployment inference profile.mode",
  );
  const hasDeploymentEndpoint = Object.prototype.hasOwnProperty.call(
    rawInference,
    "deploymentEndpoint",
  );
  if (fixedModelId !== null && (typeof fixedModelId !== "string" || !fixedModelId.trim())) {
    throw new DeploymentProfileIntegrityError(
      "deployment inference profile.fixedModelId must be null or a non-empty string.",
    );
  }

  const profile = {
    schemaVersion: 2,
    profileId: assertEnum(rawProfile.profileId, PROFILE_IDS, "deployment profile.profileId"),
    edition: assertEnum(rawProfile.edition, EDITIONS, "deployment profile.edition"),
    stage: assertEnum(rawProfile.stage, STAGES, "deployment profile.stage"),
    topology: assertEnum(rawProfile.topology, TOPOLOGIES, "deployment profile.topology"),
    readiness: assertEnum(rawProfile.readiness, READINESS_VALUES, "deployment profile.readiness"),
    capabilities,
    product: {
      inference: {
        mode: inferenceMode,
        fixedModelId: fixedModelId === null ? null : fixedModelId.trim(),
        deploymentEndpoint: !hasDeploymentEndpoint && inferenceMode === "managed_catalog"
          ? null
          : validateDeploymentEndpoint(
            rawInference.deploymentEndpoint,
            "deployment inference profile.deploymentEndpoint",
          ),
      },
      agents: {
        visibleBuiltIns: assertAgentList(
          rawAgents.visibleBuiltIns,
          "deployment agent profile.visibleBuiltIns",
        ),
        defaultBuiltIn: assertEnum(
          rawAgents.defaultBuiltIn,
          BUILT_IN_AGENTS,
          "deployment agent profile.defaultBuiltIn",
        ),
        defaultTeam: {
          enabled: assertBoolean(
            rawDefaultTeam.enabled,
            "deployment default-team profile.enabled",
          ),
          builtIns: assertAgentList(
            rawDefaultTeam.builtIns,
            "deployment default-team profile.builtIns",
          ),
        },
        customAgents: assertBoolean(
          rawAgents.customAgents,
          "deployment agent profile.customAgents",
        ),
      },
      commerce: {
        mode: assertEnum(rawCommerce.mode, COMMERCE_MODES, "deployment commerce profile.mode"),
        entitlementSource: assertEnum(
          rawCommerce.entitlementSource,
          ENTITLEMENT_SOURCES,
          "deployment commerce profile.entitlementSource",
        ),
        commercialLimits: assertBoolean(
          rawCommerce.commercialLimits,
          "deployment commerce profile.commercialLimits",
        ),
      },
      usage: {
        mode: assertEnum(rawUsage.mode, USAGE_MODES, "deployment usage profile.mode"),
      },
    },
  };

  if (expectedProfileId && profile.profileId !== expectedProfileId) {
    throw new DeploymentProfileIntegrityError(
      `Control API returned deployment profile "${profile.profileId}"; platform expects "${expectedProfileId}".`,
    );
  }
  if (expectedTopology && profile.topology !== expectedTopology) {
    throw new DeploymentProfileIntegrityError(
      `Control API returned topology "${profile.topology}"; platform expects "${expectedTopology}".`,
    );
  }
  if (expectedStage && profile.stage !== expectedStage) {
    throw new DeploymentProfileIntegrityError(
      `Control API returned stage "${profile.stage}"; platform expects "${expectedStage}".`,
    );
  }

  const profileHash = hashPublicDeploymentProfile(profile);
  const acceptedProfileHashes = new Set([profileHash]);
  if (
    !hasDeploymentEndpoint
    && profile.profileId === "cloud-saas-v1"
    && profile.product.inference.mode === "managed_catalog"
  ) {
    const legacyCloudProfile = {
      ...profile,
      product: {
        ...profile.product,
        inference: {
          mode: profile.product.inference.mode,
          fixedModelId: profile.product.inference.fixedModelId,
        },
      },
    };
    acceptedProfileHashes.add(hashPublicDeploymentProfile(legacyCloudProfile));
  }
  if (
    typeof envelopeRecord.hash !== "string"
    || !/^[a-f0-9]{64}$/.test(envelopeRecord.hash)
    || !acceptedProfileHashes.has(envelopeRecord.hash)
  ) {
    throw new DeploymentProfileIntegrityError("Deployment profile integrity hash mismatch.");
  }

  const isAppliance = profile.profileId === "dgx-spark-appliance-v1";
  if (
    isAppliance
    && (
      profile.edition !== "appliance"
      || profile.topology !== "on_prem"
      || profile.product.inference.mode !== "deployment_fixed"
      || !profile.product.inference.fixedModelId
      || !profile.product.inference.deploymentEndpoint
      || profile.product.commerce.mode !== "none"
      || profile.product.commerce.entitlementSource !== "deployment_license"
      || profile.product.usage.mode !== "observability_only"
      || !profile.capabilities.deployableResources
      || profile.capabilities.modelManagement
      || profile.capabilities.modelSelection
      || profile.capabilities.subscriptions
      || profile.capabilities.billing
      || profile.capabilities.pricing
      || profile.capabilities.commercialUsageLimits
      || profile.product.agents.visibleBuiltIns.length !== 1
      || profile.product.agents.visibleBuiltIns[0] !== "spark"
    )
  ) {
    throw new DeploymentProfileIntegrityError(
      "DGX Spark deployment profile contains an unsafe product capability combination.",
    );
  }

  return Object.freeze({
    profile: freezeRecursively(profile),
    hash: envelopeRecord.hash,
  });
}

export function createCloudCompatibilityDeploymentProfile(stage = "prod") {
  const profile = {
    schemaVersion: 2,
    profileId: "cloud-saas-v1",
    edition: "cloud",
    stage: assertEnum(stage, STAGES, "deployment profile.stage"),
    topology: "gcp_saas",
    readiness: "available",
    capabilities: {
      platform: true,
      agentExecution: true,
      schedules: true,
      metronomes: true,
      localInference: false,
      deployableResources: true,
      modelManagement: true,
      modelSelection: true,
      subscriptions: true,
      billing: true,
      pricing: true,
      commercialUsageLimits: true,
    },
    product: {
      inference: {
        mode: "managed_catalog",
        fixedModelId: null,
        deploymentEndpoint: null,
      },
      agents: {
        visibleBuiltIns: ["spark", "forge", "foundry"],
        defaultBuiltIn: "spark",
        defaultTeam: {
          enabled: true,
          builtIns: ["spark", "forge", "foundry"],
        },
        customAgents: true,
      },
      commerce: {
        mode: "subscription",
        entitlementSource: "subscription_catalog",
        commercialLimits: true,
      },
      usage: { mode: "billable" },
    },
  };
  return validatePublicDeploymentProfileEnvelope(
    { profile, hash: hashPublicDeploymentProfile(profile) },
    {
      expectedProfileId: "cloud-saas-v1",
      expectedTopology: "gcp_saas",
      expectedStage: stage,
    },
  );
}

function deploymentProfileUrl(upstreamOrigin) {
  const url = new URL(upstreamOrigin);
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/deployment-profile`;
  url.search = "";
  url.hash = "";
  return url;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchProfileEnvelope(url, { fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Control API returned HTTP ${response.status}.`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function loadPublicDeploymentProfile({
  upstreamOrigin,
  expectedProfileId,
  expectedTopology,
  expectedStage,
  fallbackEnvelope = null,
  fetchImpl = globalThis.fetch,
  attempts = 1,
  retryDelayMs = 500,
  timeoutMs = 2_000,
  waitImpl = wait,
}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("A fetch implementation is required to load the deployment profile.");
  }
  const url = deploymentProfileUrl(upstreamOrigin);
  let lastError;
  for (let attempt = 1; attempt <= Math.max(1, attempts); attempt += 1) {
    try {
      const envelope = await fetchProfileEnvelope(url, { fetchImpl, timeoutMs });
      const validated = validatePublicDeploymentProfileEnvelope(envelope, {
        expectedProfileId,
        expectedTopology,
        expectedStage,
      });
      return Object.freeze({ ...validated, source: "control_api" });
    } catch (error) {
      if (error instanceof DeploymentProfileIntegrityError) throw error;
      lastError = error;
      if (attempt < attempts) await waitImpl(retryDelayMs);
    }
  }

  if (fallbackEnvelope) {
    const validatedFallback = validatePublicDeploymentProfileEnvelope(
      fallbackEnvelope,
      { expectedProfileId, expectedTopology, expectedStage },
    );
    return Object.freeze({ ...validatedFallback, source: "compatibility_fallback" });
  }

  throw new Error(
    `Unable to load deployment profile from ${url.origin}${url.pathname}.`,
    { cause: lastError },
  );
}

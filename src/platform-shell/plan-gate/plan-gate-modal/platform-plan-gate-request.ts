export const PLATFORM_PLAN_GATE_REQUEST_EVENT = "computer-agents:plan-gate-request";

export type PlatformPlanGateMode = "feature" | "budget";

export interface PlatformPlanGateRequest {
  mode?: PlatformPlanGateMode;
  entitlement?: string;
  requiredPlan?: string;
  featureName?: string;
  title?: string;
  description?: string;
  message?: string;
  actionLabel?: string;
  source?: string;
  token?: string;
}

export interface PlatformPlanGateResponseDefaults extends PlatformPlanGateRequest {}

interface PlatformPlanGateResponseLike {
  status?: number;
  ok?: boolean;
}

const LEGACY_GATE_CODES: Readonly<Record<string, PlatformPlanGateRequest>> = Object.freeze({
  AGENT_PLAN_REQUIRED: {
    entitlement: "agents.custom.create",
    requiredPlan: "builder",
    featureName: "custom agents",
  },
  PREMIUM_MODEL_REQUIRED: {
    entitlement: "agents.custom.create",
    requiredPlan: "builder",
    featureName: "premium models",
  },
  EXTERNAL_MODEL_PLAN_REQUIRED: {
    entitlement: "inference.byo",
    requiredPlan: "team",
    featureName: "custom inference endpoints",
  },
});

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function normalizeMode(value: unknown): PlatformPlanGateMode {
  return value === "budget" ? "budget" : "feature";
}

function normalizePlatformPlanGateRequest(
  request: PlatformPlanGateRequest = {},
): PlatformPlanGateRequest {
  return {
    mode: normalizeMode(request.mode),
    entitlement: normalizeText(request.entitlement),
    requiredPlan: normalizeText(request.requiredPlan),
    featureName: normalizeText(request.featureName),
    title: normalizeText(request.title),
    description: normalizeText(request.description),
    message: normalizeText(request.message),
    actionLabel: normalizeText(request.actionLabel),
    source: normalizeText(request.source),
    token: normalizeText(request.token),
  };
}

function getResponseCode(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "";
  return normalizeText((payload as Record<string, unknown>).code).toUpperCase();
}

function getResponseText(payload: unknown, key: string): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "";
  return normalizeText((payload as Record<string, unknown>)[key]);
}

export function isPlatformPlanGateResponse(
  response: PlatformPlanGateResponseLike | null | undefined,
  payload: unknown,
): boolean {
  const responseCode = getResponseCode(payload);
  return Number(response?.status) === 402
    || responseCode === "BILLING_ENTITLEMENT_REQUIRED"
    || Object.prototype.hasOwnProperty.call(LEGACY_GATE_CODES, responseCode);
}

export function requestPlatformPlanGate(
  request: PlatformPlanGateRequest = {},
): boolean {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
    return false;
  }
  const normalizedRequest = normalizePlatformPlanGateRequest(request);
  window.dispatchEvent(new CustomEvent<PlatformPlanGateRequest>(
    PLATFORM_PLAN_GATE_REQUEST_EVENT,
    { detail: normalizedRequest },
  ));
  return true;
}

export function requestPlatformPlanGateFromResponse(
  response: PlatformPlanGateResponseLike | null | undefined,
  payload: unknown,
  defaults: PlatformPlanGateResponseDefaults = {},
): boolean {
  if (!isPlatformPlanGateResponse(response, payload)) {
    return false;
  }

  const responseCode = getResponseCode(payload);
  const legacyDefaults = LEGACY_GATE_CODES[responseCode] || {};
  const isEntitlementGate = responseCode === "BILLING_ENTITLEMENT_REQUIRED"
    || Boolean(legacyDefaults.entitlement)
    || Boolean(getResponseText(payload, "entitlement"));
  return requestPlatformPlanGate({
    ...defaults,
    ...legacyDefaults,
    mode: defaults.mode || (isEntitlementGate ? "feature" : "budget"),
    entitlement: getResponseText(payload, "entitlement")
      || legacyDefaults.entitlement
      || defaults.entitlement,
    requiredPlan: getResponseText(payload, "requiredPlan")
      || legacyDefaults.requiredPlan
      || defaults.requiredPlan,
    featureName: getResponseText(payload, "featureName")
      || legacyDefaults.featureName
      || defaults.featureName,
    title: getResponseText(payload, "title") || defaults.title,
    description: getResponseText(payload, "description") || defaults.description,
    actionLabel: getResponseText(payload, "actionLabel") || defaults.actionLabel,
    source: getResponseText(payload, "source") || defaults.source,
    message: getResponseText(payload, "message")
      || getResponseText(payload, "error")
      || defaults.message,
  });
}

export function subscribePlatformPlanGateRequests(
  listener: (request: PlatformPlanGateRequest) => void,
): () => void {
  if (typeof window === "undefined" || typeof listener !== "function") {
    return () => {};
  }
  const handleRequest = (event: Event) => {
    const requestEvent = event as CustomEvent<PlatformPlanGateRequest>;
    listener(normalizePlatformPlanGateRequest(requestEvent.detail || {}));
  };
  window.addEventListener(PLATFORM_PLAN_GATE_REQUEST_EVENT, handleRequest);
  return () => window.removeEventListener(PLATFORM_PLAN_GATE_REQUEST_EVENT, handleRequest);
}

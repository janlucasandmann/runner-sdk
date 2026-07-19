import type { PlatformLabelVariant } from "../../../../../platform-ui/components/ui/label/index.js";

export const ORGANIZATION_INFERENCE_ENDPOINT_ID = "organization-inference-endpoint";

export type InferenceEndpointKind = "external" | "local";
export type InferenceEndpointStatus = "healthy" | "error" | "idle" | "offline" | "disabled";

export interface InferenceSettingsSnapshot {
  id?: string;
  name?: string;
  isDefault?: boolean;
  enabled?: boolean;
  providerType?: string;
  baseUrl?: string;
  defaultModel?: string;
  availableModels?: readonly string[];
  apiKeyConfigured?: boolean;
  apiKeyPreview?: string;
  lastValidatedAt?: string;
  healthStatus?: string;
  lastError?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InferenceEndpointCollectionSnapshot {
  version?: number;
  defaultEndpointId?: string | null;
  endpoints?: readonly InferenceSettingsSnapshot[];
}

export interface InferenceLocalRunnerDevice {
  id?: string;
  name?: string;
  platform?: string;
  hostname?: string;
  appVersion?: string;
  daemonVersion?: string;
  status?: string;
  lastSeenAt?: string;
  capabilities?: Record<string, unknown>;
}

export interface InferenceWorkspaceBinding {
  id?: string;
  deviceId?: string;
  environmentId?: string;
  projectId?: string;
  name?: string;
  localPath?: string;
  syncRoot?: string;
  syncMode?: string;
  executionMode?: string;
}

export interface InferenceLocalRunnersSnapshot {
  status?: string;
  error?: string;
  bridgeEnabled?: boolean | null;
  devices?: readonly InferenceLocalRunnerDevice[];
  bindings?: readonly InferenceWorkspaceBinding[];
  loadedAt?: string;
}

export interface InferenceEndpointRow {
  id: string;
  name: string;
  kind: InferenceEndpointKind;
  kindLabel: string;
  providerType: string;
  providerLabel: string;
  runtimeLabel: string;
  status: InferenceEndpointStatus;
  statusLabel: string;
  statusVariant: PlatformLabelVariant;
  models: readonly string[];
  modelCount: number;
  baseUrl: string;
  hostLabel: string;
  lastCheckedAt: number;
  lastCheckedLabel: string;
  apiKeyConfigured: boolean;
  lastError: string;
  readOnly: boolean;
  isDefault: boolean;
  device?: InferenceLocalRunnerDevice;
  bindings: readonly InferenceWorkspaceBinding[];
  searchText: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  "openai-compatible": "OpenAI-Compatible",
  openai_compatible: "OpenAI-Compatible",
  vllm: "vLLM",
  tgi: "Hugging Face TGI",
  ollama: "Ollama",
  custom: "Custom",
};

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readText(value: unknown, fallback = ""): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || fallback;
}

function readStringList(...values: unknown[]): string[] {
  return Array.from(new Set(values.flatMap((value) => (
    Array.isArray(value)
      ? value.map((entry) => readText(entry)).filter(Boolean)
      : readText(value) ? [readText(value)] : []
  ))));
}

function readHost(value: string): string {
  if (!value) return "";
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

function readDate(value: unknown): { timestamp: number; label: string } {
  const normalized = readText(value);
  const timestamp = normalized ? new Date(normalized).getTime() : 0;
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return { timestamp: 0, label: "Never" };
  }
  return {
    timestamp,
    label: new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function getStatusPresentation(status: InferenceEndpointStatus): {
  label: string;
  variant: PlatformLabelVariant;
} {
  switch (status) {
    case "healthy":
      return { label: "Healthy", variant: "green" };
    case "error":
      return { label: "Needs attention", variant: "red" };
    case "offline":
      return { label: "Offline", variant: "gray" };
    case "disabled":
      return { label: "Disabled", variant: "gray" };
    default:
      return { label: "Not tested", variant: "yellow" };
  }
}

export function getInferenceProviderLabel(providerType: unknown): string {
  const normalized = readText(providerType, "openai-compatible");
  return PROVIDER_LABELS[normalized] || normalized.replace(/[_-]+/g, " ");
}

function buildExternalEndpoint(
  settings: InferenceSettingsSnapshot,
  index: number,
): InferenceEndpointRow | null {
  const baseUrl = readText(settings.baseUrl);
  const models = readStringList(settings.availableModels, settings.defaultModel);
  const configured = Boolean(
    settings.id
    || settings.name
    || baseUrl
    || settings.enabled
    || settings.apiKeyConfigured
    || models.length,
  );
  if (!configured) return null;

  const providerType = readText(settings.providerType, "openai-compatible");
  const providerLabel = getInferenceProviderLabel(providerType);
  const healthStatus = readText(settings.healthStatus);
  const status: InferenceEndpointStatus = healthStatus === "healthy"
    ? "healthy"
    : healthStatus === "error"
      ? "error"
      : "idle";
  const statusPresentation = getStatusPresentation(status);
  const lastChecked = readDate(settings.lastValidatedAt);
  const hostLabel = readHost(baseUrl);

  return {
    id: readText(
      settings.id,
      index === 0 ? ORGANIZATION_INFERENCE_ENDPOINT_ID : `inference-endpoint-${index + 1}`,
    ),
    name: readText(settings.name, hostLabel || `${providerLabel} Endpoint`),
    kind: "external",
    kindLabel: "External Endpoint",
    providerType,
    providerLabel,
    runtimeLabel: "Organization",
    status,
    statusLabel: statusPresentation.label,
    statusVariant: statusPresentation.variant,
    models,
    modelCount: models.length,
    baseUrl,
    hostLabel: hostLabel || "Not configured",
    lastCheckedAt: lastChecked.timestamp,
    lastCheckedLabel: lastChecked.label,
    apiKeyConfigured: Boolean(settings.apiKeyConfigured),
    lastError: readText(settings.lastError),
    readOnly: false,
    isDefault: Boolean(settings.isDefault),
    bindings: [],
    searchText: [
      providerLabel,
      baseUrl,
      hostLabel,
      ...models,
      statusPresentation.label,
      "external organization",
      settings.name,
    ].join(" "),
  };
}

function buildLocalEndpoint(
  device: InferenceLocalRunnerDevice,
  allBindings: readonly InferenceWorkspaceBinding[],
): InferenceEndpointRow | null {
  const id = readText(device.id);
  if (!id) return null;

  const capabilities = readRecord(device.capabilities);
  const localRuntime = readRecord(capabilities.localRuntime);
  const inference = readRecord(localRuntime.inference);
  const providerType = readText(
    inference.defaultProvider ?? inference.providerType,
    "local",
  );
  const baseUrl = readText(inference.baseUrl ?? inference.endpoint);
  const hostLabel = readText(inference.baseUrlHost, readHost(baseUrl));
  const models = readStringList(
    inference.availableModels,
    inference.models,
    inference.modelIds,
    inference.defaultModel,
  );
  const isConfigured = Boolean(
    inference.enabled
    || hostLabel
    || baseUrl
    || models.length
    || inference.defaultProvider,
  );
  if (!isConfigured) return null;

  const rawStatus = readText(inference.status);
  const deviceOnline = readText(device.status) === "online";
  const status: InferenceEndpointStatus = !deviceOnline
    ? "offline"
    : inference.enabled === false
      ? "disabled"
      : ["healthy", "available", "ready", "online"].includes(rawStatus)
        ? "healthy"
        : ["error", "failed", "unavailable"].includes(rawStatus)
          ? "error"
          : "idle";
  const statusPresentation = getStatusPresentation(status);
  const lastChecked = readDate(device.lastSeenAt);
  const name = `${readText(device.name, readText(device.hostname, "Local Runner"))} Inference`;
  const bindings = allBindings.filter((binding) => readText(binding.deviceId) === id);

  return {
    id: `local-inference:${id}`,
    name,
    kind: "local",
    kindLabel: "Local Endpoint",
    providerType,
    providerLabel: getInferenceProviderLabel(providerType),
    runtimeLabel: "Local Runner",
    status,
    statusLabel: statusPresentation.label,
    statusVariant: statusPresentation.variant,
    models,
    modelCount: models.length,
    baseUrl,
    hostLabel: hostLabel || readText(device.hostname, "Local"),
    lastCheckedAt: lastChecked.timestamp,
    lastCheckedLabel: lastChecked.label,
    apiKeyConfigured: Boolean(inference.apiKeyConfigured),
    lastError: readText(inference.lastError),
    readOnly: true,
    isDefault: false,
    device,
    bindings,
    searchText: [
      name,
      providerType,
      hostLabel,
      device.platform,
      device.hostname,
      ...models,
      statusPresentation.label,
      "local runner",
    ].join(" "),
  };
}

export function buildInferenceEndpointRows(
  collection: InferenceEndpointCollectionSnapshot | InferenceSettingsSnapshot,
  localRunners: InferenceLocalRunnersSnapshot,
): InferenceEndpointRow[] {
  const bindings = Array.isArray(localRunners.bindings) ? localRunners.bindings : [];
  const collectionRecord = readRecord(collection);
  const configuredEndpoints = Array.isArray(collectionRecord.endpoints)
    ? collectionRecord.endpoints as readonly InferenceSettingsSnapshot[]
    : [collection as InferenceSettingsSnapshot];
  const defaultEndpointId = readText(collectionRecord.defaultEndpointId);
  const externalEndpoints = configuredEndpoints
    .map((settings, index) => buildExternalEndpoint({
      ...settings,
      isDefault: settings.isDefault
        ?? (defaultEndpointId ? settings.id === defaultEndpointId : index === 0),
    }, index))
    .filter((endpoint): endpoint is InferenceEndpointRow => Boolean(endpoint));
  const localEndpoints = (Array.isArray(localRunners.devices) ? localRunners.devices : [])
    .map((device) => buildLocalEndpoint(device, bindings))
    .filter((endpoint): endpoint is InferenceEndpointRow => Boolean(endpoint));
  return [
    ...externalEndpoints,
    ...localEndpoints,
  ];
}

export function buildInferenceEndpointDraft(
  settings: InferenceSettingsSnapshot,
): InferenceEndpointRow {
  const providerType = readText(settings.providerType, "openai-compatible");
  const providerLabel = getInferenceProviderLabel(providerType);
  return {
    id: readText(settings.id, ORGANIZATION_INFERENCE_ENDPOINT_ID),
    name: readText(settings.name, "New Inference Endpoint"),
    kind: "external",
    kindLabel: "External Endpoint",
    providerType,
    providerLabel,
    runtimeLabel: "Organization",
    status: "idle",
    statusLabel: "Not configured",
    statusVariant: "gray",
    models: readStringList(settings.availableModels, settings.defaultModel),
    modelCount: readStringList(settings.availableModels, settings.defaultModel).length,
    baseUrl: readText(settings.baseUrl),
    hostLabel: "Not configured",
    lastCheckedAt: 0,
    lastCheckedLabel: "Never",
    apiKeyConfigured: Boolean(settings.apiKeyConfigured),
    lastError: readText(settings.lastError),
    readOnly: false,
    isDefault: true,
    bindings: [],
    searchText: "new external organization inference endpoint",
  };
}

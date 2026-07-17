import type {
  PlatformDataTableFilterOption,
  PlatformDataTableSortState,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import type {
  PlatformDetailTab,
} from "../../../../../platform-ui/components/composite/detail-tab-bar/index.js";
import type {
  ModelOverviewDetailFact,
  ModelOverviewDetails,
} from "./model-overview-types.js";
import {
  AGENT_MODEL_PRICING,
  AGENT_MODEL_TPS,
  FALLBACK_AGENT_MODELS,
  MODEL_PROVIDER_ICONS,
  STATIC_IMAGE_MODELS,
  STATIC_RESEARCH_MODELS,
  STATIC_VIDEO_MODELS,
  type ModelCatalogRow,
  type ModelsCategory,
} from "./model-catalog-data.js";

type UnknownRecord = Record<string, unknown>;

export interface CreateModelsOverviewProjectionOptions {
  category: ModelsCategory;
  remoteAgentModels: readonly unknown[];
  query?: string;
  providerFilter?: string;
  sorting?: PlatformDataTableSortState | null;
}

export interface ModelsOverviewProjection {
  rows: ModelCatalogRow[];
  allRows: ModelCatalogRow[];
  providerFilterOptions: PlatformDataTableFilterOption[];
}

export const MODELS_OVERVIEW_TABS: readonly PlatformDetailTab[] =
  Object.freeze([
    { id: "agent", label: "Agent Models" },
    { id: "image", label: "Image" },
    { id: "video", label: "Video" },
    { id: "deep_research", label: "Deep Research" },
  ]);

const PROVIDER_LABELS: Readonly<Record<string, string>> = Object.freeze({
  anthropic: "Anthropic",
  google: "Google",
  openai: "OpenAI",
  xai: "xAI",
  deepseek: "DeepSeek",
  minimax: "MiniMax",
  kimi: "Moonshot",
  zai: "ZAI",
  qwen: "Qwen",
  bytedance: "ByteDance",
  custom: "Custom",
  generic: "Provider",
});

const MANAGED_AVAILABILITY: Readonly<
  Record<string, Readonly<Record<string, unknown>>>
> = Object.freeze({
  "kimi-k2.6": {
    modelProvider: "Moonshot AI",
    deliveryProvider: "Cloudflare Workers AI",
    hosting: "Cloudflare-hosted",
    location: "Cloudflare global network",
    runtimeModelId: "@cf/moonshotai/kimi-k2.6",
    dataHandling: "Cloudflare Workers AI data policy",
    documentationUrl: "https://developers.cloudflare.com/workers-ai/models/kimi-k2.6/",
    capabilities: ["Function calling", "Reasoning", "Vision", "Structured outputs"],
  },
  "kimi-k2.7-code": {
    modelProvider: "Moonshot AI",
    deliveryProvider: "Cloudflare Workers AI",
    hosting: "Cloudflare-hosted",
    location: "Cloudflare global network",
    runtimeModelId: "@cf/moonshotai/kimi-k2.7-code",
    dataHandling: "Cloudflare Workers AI data policy",
    documentationUrl: "https://developers.cloudflare.com/workers-ai/models/kimi-k2.7-code/",
    capabilities: ["Function calling", "Reasoning", "Vision", "Structured outputs", "Long-horizon coding"],
  },
  "glm-5.2": {
    modelProvider: "Z.ai",
    deliveryProvider: "Cloudflare Workers AI",
    hosting: "Cloudflare-hosted",
    location: "Cloudflare global network",
    runtimeModelId: "@cf/zai-org/glm-5.2",
    dataHandling: "Cloudflare Workers AI data policy",
    documentationUrl: "https://developers.cloudflare.com/workers-ai/models/glm-5.2/",
    capabilities: ["Function calling", "Reasoning", "Agentic coding", "Long-horizon planning"],
  },
  "minimax-m3": {
    modelProvider: "MiniMax",
    deliveryProvider: "Cloudflare AI",
    hosting: "Third-party model",
    location: "Provider-managed; region not exposed",
    runtimeModelId: "minimax/m3",
    dataHandling: "Zero data retention",
    documentationUrl: "https://developers.cloudflare.com/ai/models/minimax/m3/",
    capabilities: ["Agentic coding", "Tool use", "Multilingual", "Long context"],
  },
  "qwen3.5-397b-a17b": {
    modelProvider: "Alibaba Qwen",
    deliveryProvider: "Cloudflare AI",
    hosting: "Third-party model",
    location: "Provider-managed; region not exposed",
    runtimeModelId: "alibaba/qwen3.5-397b-a17b",
    dataHandling: "Zero data retention",
    documentationUrl: "https://developers.cloudflare.com/ai/models/alibaba/qwen3.5-397b-a17b/",
    capabilities: ["Reasoning", "Coding", "Multimodal", "Mixture of experts"],
  },
});

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProviderType(model: ModelCatalogRow): string {
  const explicit = String(model.providerType || model.provider || "")
    .trim()
    .toLowerCase();
  const id = model.id.toLowerCase();
  if (id.startsWith("minimax-") || id === "minimax/m3") return "minimax";
  if (id.startsWith("kimi-") || id.includes("moonshot")) return "kimi";
  if (id.startsWith("glm-") || id.includes("zai")) return "zai";
  if (id.startsWith("qwen") || id.includes("alibaba/qwen")) return "qwen";
  if (id.startsWith("grok-") || id.includes("xai")) return "xai";
  if (explicit.includes("anthropic")) return "anthropic";
  if (explicit.includes("google") || explicit.includes("gemini")) return "google";
  if (explicit.includes("openai")) return "openai";
  if (explicit.includes("xai") || explicit.includes("grok")) return "xai";
  if (explicit.includes("deepseek")) return "deepseek";
  if (explicit.includes("minimax")) return "minimax";
  if (explicit.includes("moonshot") || explicit.includes("kimi")) return "kimi";
  if (explicit.includes("zai") || explicit.includes("zhipu")) return "zai";
  if (explicit.includes("qwen") || explicit.includes("alibaba")) return "qwen";
  if (explicit.includes("bytedance")) return "bytedance";
  if (id.startsWith("claude-")) return "anthropic";
  if (id.startsWith("gemini-")) return "google";
  if (id.startsWith("gpt-")) return "openai";
  if (id.startsWith("deepseek-")) return "deepseek";
  if (model.source === "external" || model.source === "custom") return "custom";
  return "generic";
}

export function getModelProviderLabel(model: ModelCatalogRow): string {
  const type = normalizeProviderType(model);
  return PROVIDER_LABELS[type]
    || String(model.provider || "").trim()
    || "Provider";
}

export function getModelProviderIcon(model: ModelCatalogRow) {
  return MODEL_PROVIDER_ICONS[normalizeProviderType(model)];
}

function normalizeRemoteAgentModel(value: unknown): ModelCatalogRow | null {
  const record = asRecord(value);
  const id = asString(record.id);
  const label = asString(record.label || record.id);
  if (!id || !label) return null;
  return {
    id,
    label,
    description: asString(record.description),
    intelligence: asString(record.intelligence) || "Custom",
    contextWindow: asString(record.contextWindow) || "Custom",
    speed: asString(record.speed) || "Custom",
    source: asString(record.source) || "managed",
    provider: asString(record.provider),
    providerType: asString(record.providerType),
    runtimeModelId: asString(record.runtimeModelId),
    location: asString(record.location),
    hosting: asString(record.hosting),
    dataHandling: asString(record.dataHandling),
    documentationUrl: asString(record.documentationUrl),
    capabilities: Array.isArray(record.capabilities)
      ? record.capabilities.map(asString).filter(Boolean)
      : [],
    availability: Object.keys(asRecord(record.availability)).length
      ? asRecord(record.availability)
      : undefined,
    locked: Boolean(record.locked),
    category: "agent",
  };
}

export function mergeAgentModelCatalog(
  remoteModels: readonly unknown[],
): ModelCatalogRow[] {
  const byId = new Map(
    FALLBACK_AGENT_MODELS.map((model) => [model.id, { ...model }]),
  );
  remoteModels.forEach((value) => {
    const model = normalizeRemoteAgentModel(value);
    if (!model) return;
    byId.set(model.id, {
      ...(byId.get(model.id) || {}),
      ...model,
      category: "agent",
    });
  });
  return [...byId.values()];
}

function formatUsdPerMillion(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  const retail = value * 1.1;
  const fractionDigits = retail > 0 && retail < 0.01
    ? 4
    : retail > 0 && retail < 1
      ? 3
      : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(retail);
}

export function getAgentPricingCells(model: ModelCatalogRow) {
  const pricing = AGENT_MODEL_PRICING[model.id];
  return {
    input: formatUsdPerMillion(pricing?.input),
    output: formatUsdPerMillion(pricing?.output),
    cached: formatUsdPerMillion(pricing?.cached),
  };
}

export function getModelSpeedLabel(model: ModelCatalogRow): string {
  if (
    model.category === "agent"
    && Object.prototype.hasOwnProperty.call(AGENT_MODEL_TPS, model.id)
  ) {
    const value = AGENT_MODEL_TPS[model.id];
    return typeof value === "number" ? `${value.toFixed(1)} t/s` : "—";
  }
  return String(model.speed || "").trim() || "Custom";
}

function createFact(
  label: string,
  value: unknown,
  description = "",
): ModelOverviewDetailFact | null {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;
  return {
    label,
    value: normalized,
    ...(description ? { description } : {}),
  };
}

function compactFacts(
  values: readonly (ModelOverviewDetailFact | null)[],
): ModelOverviewDetailFact[] {
  return values.filter(
    (value): value is ModelOverviewDetailFact => Boolean(value),
  );
}

function getCategoryLabel(category: ModelsCategory): string {
  switch (category) {
    case "image": return "Image model";
    case "video": return "Video model";
    case "deep_research": return "Research model";
    default: return "Agent model";
  }
}

function getIntegrationLabel(category: ModelsCategory): string {
  switch (category) {
    case "image": return "Image Generation skill";
    case "video": return "Video Generation skill";
    case "deep_research": return "Deep Research skill";
    default: return "Primary agent model";
  }
}

function createModelDetails(model: ModelCatalogRow): ModelOverviewDetails {
  const availability = {
    ...(MANAGED_AVAILABILITY[model.baseModelId || model.id] || {}),
    ...asRecord(model.availability),
  };
  const provider = String(
    availability.modelProvider
      || model.provider
      || getModelProviderLabel(model),
  ).trim();
  const location = String(
    availability.location || model.location || "Not exposed by platform",
  ).trim();
  const dataHandling = String(
    availability.dataHandling
      || model.dataHandling
      || "Not exposed by platform",
  ).trim();
  const overviewFacts = model.category === "agent"
    ? (() => {
        const pricing = getAgentPricingCells(model);
        return compactFacts([
          createFact("Model ID", model.id),
          createFact("Intelligence", model.intelligence || "Custom"),
          createFact("Context window", model.contextWindow || "Custom"),
          createFact("Speed", getModelSpeedLabel(model)),
          createFact("Input", `${pricing.input} / mTok`),
          createFact("Cached input", `${pricing.cached} / mTok`),
          createFact("Output", `${pricing.output} / mTok`),
        ]);
      })()
    : model.category === "video"
      ? compactFacts([
          createFact("Model ID", model.baseModelId || model.id),
          createFact("Maximum duration", model.maxDuration),
          createFact("Resolutions", model.resolutions),
          createFact("Input modalities", model.inputModalities),
          createFact("Pricing", model.pricingLabel),
        ])
      : compactFacts([
          createFact("Model ID", model.baseModelId || model.id),
          createFact("Mode", model.mode),
          createFact(
            model.category === "image" ? "Quality" : "Research scope",
            model.contextWindow,
          ),
          createFact("Speed", getModelSpeedLabel(model)),
          createFact("Pricing", model.pricingLabel),
        ]);
  const fallbackCapabilities = model.category === "image"
    ? ["Image generation", "Image editing"]
    : model.category === "video"
      ? ["Video generation"]
      : model.category === "deep_research"
        ? ["Deep research", "Source-grounded synthesis"]
        : ["Agent execution"];
  const capabilities = (
    Array.isArray(availability.capabilities)
      ? availability.capabilities
      : model.capabilities || fallbackCapabilities
  ).map(asString).filter(Boolean);
  return {
    categoryLabel: getCategoryLabel(model.category),
    description: model.description || "No model description is available.",
    providerIcon: getModelProviderIcon(model),
    overviewFacts,
    availabilityFacts: compactFacts([
      createFact("Model provider", provider),
      createFact(
        "Delivery provider",
        availability.deliveryProvider
          || (model.source === "external"
            ? "Workspace external model"
            : "Platform managed model gateway"),
      ),
      createFact(
        "Hosting",
        availability.hosting || model.hosting || "Provider-managed",
      ),
      createFact(
        "Location",
        location,
        /not exposed|provider-managed/i.test(location)
          ? "The model catalog does not expose a fixed inference region."
          : "",
      ),
      createFact(
        "Runtime model ID",
        availability.runtimeModelId
          || model.runtimeModelId
          || model.id,
      ),
      createFact(
        "Data handling",
        dataHandling,
        /not exposed/i.test(dataHandling)
          ? "Retention and residency depend on the configured provider route."
          : "",
      ),
      createFact(
        "Platform integration",
        availability.integration || getIntegrationLabel(model.category),
      ),
      createFact(
        "Catalog source",
        model.source === "external"
          ? "Workspace external catalog"
          : "Managed model catalog",
      ),
      createFact("Access", model.locked ? "Plan required" : "Available"),
    ]),
    capabilities: [...new Set(capabilities)],
    documentationUrl: asString(
      availability.documentationUrl || model.documentationUrl,
    ),
    canCreateAgent: model.category === "agent" && !model.locked,
    agentModelId: model.category === "agent" ? model.id : "",
  };
}

function getCategoryRows(
  category: ModelsCategory,
  remoteAgentModels: readonly unknown[],
): ModelCatalogRow[] {
  switch (category) {
    case "image": return STATIC_IMAGE_MODELS.map((model) => ({ ...model }));
    case "video": return STATIC_VIDEO_MODELS.map((model) => ({ ...model }));
    case "deep_research":
      return STATIC_RESEARCH_MODELS.map((model) => ({ ...model }));
    default: return mergeAgentModelCatalog(remoteAgentModels);
  }
}

function getProviderFilterKey(model: ModelCatalogRow): string {
  return normalizeProviderType(model);
}

function getSortValue(
  model: ModelCatalogRow,
  sortId: string,
): string | number {
  if (sortId === "name") return model.label.toLowerCase();
  if (sortId === "provider") return getModelProviderLabel(model).toLowerCase();
  if (sortId === "intelligence") {
    return { Custom: 0, Good: 1, High: 2, Highest: 3 }[
      String(model.intelligence || "Custom") as "Custom"
    ] ?? 0;
  }
  if (sortId === "context" || sortId === "scope") {
    const raw = String(model.contextWindow || model.resolutions || "")
      .toLowerCase();
    const value = Number(raw.match(/[0-9]+(?:\.[0-9]+)?/)?.[0] || 0);
    return raw.includes("m") ? value * 1_000_000
      : raw.includes("k") ? value * 1_000 : value;
  }
  if (sortId === "speed") {
    const tps = AGENT_MODEL_TPS[model.id];
    if (typeof tps === "number") return tps;
    const speed = String(model.speed || "").toLowerCase();
    if (speed.includes("very")) return 4;
    if (speed.includes("fast")) return 3;
    if (speed.includes("medium")) return 2;
    return 1;
  }
  if (sortId.startsWith("cost-")) {
    const pricing = AGENT_MODEL_PRICING[model.id];
    return sortId === "cost-output"
      ? pricing?.output ?? Number.POSITIVE_INFINITY
      : sortId === "cost-cached"
        ? pricing?.cached ?? Number.POSITIVE_INFINITY
        : pricing?.input ?? Number.POSITIVE_INFINITY;
  }
  if (sortId === "cost") {
    return model.pricingRank ?? Number.POSITIVE_INFINITY;
  }
  if (sortId === "capability") {
    return String(
      model.intelligence || model.mode || model.maxDuration || "",
    ).toLowerCase();
  }
  return model.label.toLowerCase();
}

function compareValues(left: string | number, right: string | number): number {
  return typeof left === "number" && typeof right === "number"
    ? left - right
    : String(left).localeCompare(String(right));
}

export function createModelsOverviewProjection({
  category,
  remoteAgentModels,
  query = "",
  providerFilter = "all",
  sorting = { id: "provider", direction: "asc" },
}: CreateModelsOverviewProjectionOptions): ModelsOverviewProjection {
  const allRows = getCategoryRows(category, remoteAgentModels);
  const providerOptions = [...new Map(
    allRows.map((model) => [
      getProviderFilterKey(model),
      getModelProviderLabel(model),
    ]),
  ).entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((left, right) => left.label.localeCompare(right.label));
  const providerFilterOptions: PlatformDataTableFilterOption[] = [
    { id: "all", label: "All models" },
    ...providerOptions,
    ...(category === "agent"
      ? [
          { id: "available", label: "Available" },
          { id: "locked", label: "Plan required" },
        ]
      : []),
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const rows = allRows
    .filter((model) => {
      if (providerFilter === "available" && model.locked) return false;
      if (providerFilter === "locked" && !model.locked) return false;
      if (
        !["all", "available", "locked"].includes(providerFilter)
        && getProviderFilterKey(model) !== providerFilter
      ) {
        return false;
      }
      if (!normalizedQuery) return true;
      const pricing = getAgentPricingCells(model);
      return [
        model.id,
        model.label,
        model.description,
        model.intelligence,
        model.contextWindow,
        model.speed,
        model.mode,
        model.maxDuration,
        model.resolutions,
        model.inputModalities,
        getModelProviderLabel(model),
        model.pricingLabel,
        pricing.input,
        pricing.output,
        pricing.cached,
      ].join(" ").toLowerCase().includes(normalizedQuery);
    })
    .sort((left, right) => {
      const comparison = compareValues(
        getSortValue(left, sorting?.id || "provider"),
        getSortValue(right, sorting?.id || "provider"),
      );
      return comparison * (sorting?.direction === "desc" ? -1 : 1);
    })
    .map((model) => ({
      ...model,
      providerLabel: getModelProviderLabel(model),
      speedLabel: getModelSpeedLabel(model),
      ...getAgentPricingCells(model),
      details: createModelDetails(model),
    }));

  return { rows, allRows, providerFilterOptions };
}

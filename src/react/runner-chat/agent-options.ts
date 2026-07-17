import {
  getRecordArray,
  getRecordObject,
  getRecordString,
  normalizeRecordObject,
} from "./record-utils.js";
import { stripRunnerSystemTags } from "../runner-markdown.js";
import type {
  RunnerAgentSelectorMode,
  RunnerChatVoiceMode,
  RunnerReasoningEffortId,
} from "./voice-audio.js";

export interface RunnerChatOption {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  voiceMode?: RunnerChatVoiceMode | string | null;
  voiceProvider?: string | null;
  voiceModel?: string | null;
  voiceId?: string | null;
  voiceInstructions?: string | null;
  voiceLanguageHint?: string | null;
}

export interface RunnerChatProjectOption extends RunnerChatOption {
  defaultEnvironmentId?: string | null;
  environmentId?: string | null;
  color?: string | null;
  metadata?: Record<string, unknown> | null;
}

type RunnerAgentOptionRecord = RunnerChatOption & {
  agentType?: string | null;
  model?: string | null;
  modelId?: string | null;
  modelProvider?: string | null;
  modelProviderType?: string | null;
  provider?: string | null;
  providerType?: string | null;
  source?: string | null;
  photoUrl?: string | null;
  photoURL?: string | null;
  avatarUrl?: string | null;
  avatarURL?: string | null;
  guardrails?: unknown;
  guardrailSetIds?: unknown;
  guardrail_set_ids?: unknown;
  promptAdaptations?: unknown;
  prompt_adaptations?: unknown;
  promptAdaptions?: unknown;
  prompt_adaptions?: unknown;
  invisiblePromptAdaptations?: unknown;
  invisible_prompt_adaptations?: unknown;
  invisiblePromptAdaptions?: unknown;
  invisible_prompt_adaptions?: unknown;
  profile?: unknown;
  metadata?: unknown;
};

export const RUNNER_REASONING_EFFORT_OPTIONS: Array<{
  id: RunnerReasoningEffortId;
  label: string;
  description: string;
}> = [
  { id: "minimal", label: "Low", description: "Fast responses for simple tasks." },
  { id: "low", label: "Medium", description: "Balanced default reasoning." },
  { id: "medium", label: "High", description: "More deliberate planning and tool use." },
  { id: "high", label: "Max", description: "Maximum reasoning for complex work." },
];

export function normalizeRunnerReasoningEffort(
  value: unknown
): RunnerReasoningEffortId {
  const normalized =
    typeof value === "string"
      ? value.trim().toLowerCase().replace(/[_\s]+/g, "-")
      : "";
  if (
    normalized === "minimal" ||
    normalized === "low" ||
    normalized === "medium" ||
    normalized === "high"
  ) {
    return normalized;
  }
  if (normalized === "extra-high" || normalized === "extra") {
    return "high";
  }
  return "low";
}

export function getRunnerReasoningEffortOption(value: unknown) {
  return (
    RUNNER_REASONING_EFFORT_OPTIONS.find(
      (option) => option.id === normalizeRunnerReasoningEffort(value)
    ) || RUNNER_REASONING_EFFORT_OPTIONS[1]
  );
}

export function orderOptionsWithPinnedTop<T extends RunnerChatOption>(
  options: T[],
  pinnedId: string | null
): T[] {
  if (!pinnedId) {
    return options;
  }
  const pinnedIndex = options.findIndex((option) => option.id === pinnedId);
  if (pinnedIndex <= 0) {
    return options;
  }
  return [
    options[pinnedIndex],
    ...options.slice(0, pinnedIndex),
    ...options.slice(pinnedIndex + 1),
  ];
}

export function mergeRunnerChatOptions(
  primary: RunnerChatOption[],
  additions: Array<RunnerChatOption | null | undefined>
): RunnerChatOption[] {
  const merged = new Map<string, RunnerChatOption>();
  for (const option of primary) {
    if (option.id.trim()) {
      merged.set(option.id, option);
    }
  }
  for (const option of additions) {
    if (!option || !option.id.trim()) {
      continue;
    }
    const existing = merged.get(option.id);
    merged.set(
      option.id,
      existing
        ? { ...option, ...existing, name: existing.name || option.name }
        : option
    );
  }
  return Array.from(merged.values());
}

export function getRunnerProjectEnvironmentId(
  project: RunnerChatProjectOption | null | undefined
): string {
  if (!project) {
    return "";
  }
  const directDefaultEnvironmentId =
    typeof project.defaultEnvironmentId === "string"
      ? project.defaultEnvironmentId.trim()
      : "";
  if (directDefaultEnvironmentId) {
    return directDefaultEnvironmentId;
  }
  const directEnvironmentId =
    typeof project.environmentId === "string"
      ? project.environmentId.trim()
      : "";
  if (directEnvironmentId) {
    return directEnvironmentId;
  }
  const metadata =
    project.metadata &&
    typeof project.metadata === "object" &&
    !Array.isArray(project.metadata)
      ? project.metadata
      : null;
  const metadataDefaultEnvironmentId =
    metadata && typeof metadata.defaultEnvironmentId === "string"
      ? metadata.defaultEnvironmentId.trim()
      : "";
  if (metadataDefaultEnvironmentId) {
    return metadataDefaultEnvironmentId;
  }
  return metadata && typeof metadata.environmentId === "string"
    ? metadata.environmentId.trim()
    : "";
}

export function isRunnerTeamAgentOption(
  option: RunnerChatOption | null | undefined
): boolean {
  if (!option) {
    return false;
  }

  const candidate = option as RunnerAgentOptionRecord;
  if (
    typeof candidate.agentType === "string" &&
    candidate.agentType.trim() === "team"
  ) {
    return true;
  }

  const metadata = candidate.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false;
  }

  const kind =
    "kind" in metadata && typeof metadata.kind === "string"
      ? metadata.kind.trim()
      : "";
  const team =
    "team" in metadata &&
    metadata.team &&
    typeof metadata.team === "object" &&
    !Array.isArray(metadata.team)
      ? metadata.team
      : null;

  return kind === "team" && Boolean(team);
}

export function isRunnerHumanAgentOption(
  option: RunnerChatOption | null | undefined
): boolean {
  if (!option) {
    return false;
  }

  const candidate = option as RunnerAgentOptionRecord;
  if (
    typeof candidate.agentType === "string" &&
    candidate.agentType.trim() === "human"
  ) {
    return true;
  }

  const metadata = candidate.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false;
  }

  const kind =
    "kind" in metadata && typeof metadata.kind === "string"
      ? metadata.kind.trim()
      : "";
  return kind === "human";
}

export function isRunnerAssistantAgentOption(
  option: RunnerChatOption | null | undefined
): boolean {
  const normalizedName = String(option?.name || "").trim().toLowerCase();
  const normalizedId = String(option?.id || "").trim().toLowerCase();
  return (
    normalizedName === "assistant" ||
    normalizedName === "default" ||
    normalizedName === "default agent" ||
    normalizedId === "agent_assistant" ||
    normalizedId === "agent-assistant" ||
    normalizedId.startsWith("agent-assistant-")
  );
}

export function isRunnerDeveloperAgentOption(
  option: RunnerChatOption | null | undefined
): boolean {
  const normalizedName = String(option?.name || "").trim().toLowerCase();
  const normalizedId = String(option?.id || "").trim().toLowerCase();
  return (
    normalizedName === "developer" ||
    normalizedId === "agent_default" ||
    normalizedId === "agent-default" ||
    normalizedId.startsWith("agent-default-")
  );
}

export function getRunnerPreferredDefaultAgentOption(
  agents: RunnerChatOption[]
): RunnerChatOption | null {
  const normalizedAgents = Array.isArray(agents)
    ? agents.filter(Boolean)
    : [];
  const singleAgents = normalizedAgents.filter(
    (agent) => !isRunnerTeamAgentOption(agent) && !isRunnerHumanAgentOption(agent)
  );
  const candidateAgents =
    singleAgents.length > 0 ? singleAgents : normalizedAgents;

  return (
    candidateAgents.find(isRunnerAssistantAgentOption) ||
    candidateAgents.find((agent) => agent?.isDefault) ||
    candidateAgents.find(isRunnerDeveloperAgentOption) ||
    candidateAgents[0] ||
    null
  );
}

export function getRunnerAgentOptionPhotoUrl(
  option: RunnerChatOption | null | undefined
): string {
  if (!option) {
    return "";
  }

  const candidate = option as RunnerAgentOptionRecord;
  const directPhotoUrl =
    typeof candidate.photoUrl === "string" && candidate.photoUrl.trim()
      ? candidate.photoUrl.trim()
      : typeof candidate.photoURL === "string" && candidate.photoURL.trim()
        ? candidate.photoURL.trim()
        : typeof candidate.avatarUrl === "string" && candidate.avatarUrl.trim()
          ? candidate.avatarUrl.trim()
          : typeof candidate.avatarURL === "string" &&
              candidate.avatarURL.trim()
            ? candidate.avatarURL.trim()
            : "";
  if (directPhotoUrl) {
    return directPhotoUrl;
  }

  const profile = candidate.profile;
  if (profile && typeof profile === "object" && !Array.isArray(profile)) {
    const profilePhotoUrl =
      "photoUrl" in profile &&
      typeof profile.photoUrl === "string" &&
      profile.photoUrl.trim()
        ? profile.photoUrl.trim()
        : "photoURL" in profile &&
            typeof profile.photoURL === "string" &&
            profile.photoURL.trim()
          ? profile.photoURL.trim()
          : "avatarUrl" in profile &&
              typeof profile.avatarUrl === "string" &&
              profile.avatarUrl.trim()
            ? profile.avatarUrl.trim()
            : "";
    if (profilePhotoUrl) {
      return profilePhotoUrl;
    }
  }

  const metadata = candidate.metadata;
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const metadataPhotoUrl =
      "photoUrl" in metadata &&
      typeof metadata.photoUrl === "string" &&
      metadata.photoUrl.trim()
        ? metadata.photoUrl.trim()
        : "photoURL" in metadata &&
            typeof metadata.photoURL === "string" &&
            metadata.photoURL.trim()
          ? metadata.photoURL.trim()
          : "avatarUrl" in metadata &&
              typeof metadata.avatarUrl === "string" &&
              metadata.avatarUrl.trim()
            ? metadata.avatarUrl.trim()
            : "";
    if (metadataPhotoUrl) {
      return metadataPhotoUrl;
    }
    const metadataProfile =
      "profile" in metadata &&
      metadata.profile &&
      typeof metadata.profile === "object" &&
      !Array.isArray(metadata.profile)
        ? metadata.profile
        : null;
    if (metadataProfile) {
      const metadataProfilePhotoUrl =
        "photoUrl" in metadataProfile &&
        typeof metadataProfile.photoUrl === "string" &&
        metadataProfile.photoUrl.trim()
          ? metadataProfile.photoUrl.trim()
          : "photoURL" in metadataProfile &&
              typeof metadataProfile.photoURL === "string" &&
              metadataProfile.photoURL.trim()
            ? metadataProfile.photoURL.trim()
            : "avatarUrl" in metadataProfile &&
                typeof metadataProfile.avatarUrl === "string" &&
                metadataProfile.avatarUrl.trim()
              ? metadataProfile.avatarUrl.trim()
              : "";
      if (metadataProfilePhotoUrl) {
        return metadataProfilePhotoUrl;
      }
    }
  }

  return "";
}

export function getRunnerAgentOptionModelId(
  option: RunnerChatOption | null | undefined
): string {
  if (!option) {
    return "";
  }

  const candidate = option as RunnerAgentOptionRecord;
  const directModel = getRecordString(
    candidate as unknown as Record<string, unknown>,
    [
      "model",
      "modelId",
      "model_id",
      "lastUsedModel",
      "last_used_model",
      "defaultModel",
      "default_model",
    ]
  ).trim();
  if (directModel) {
    return directModel;
  }

  const metadata = normalizeRecordObject(candidate.metadata);
  const metadataModel = getRecordString(metadata || {}, [
    "model",
    "modelId",
    "model_id",
    "lastUsedModel",
    "last_used_model",
    "defaultModel",
    "default_model",
  ]).trim();
  if (metadataModel) {
    return metadataModel;
  }

  const nestedModel = getRecordObject(metadata, [
    "model",
    "modelMeta",
    "model_meta",
    "llm",
    "llmModel",
    "llm_model",
  ]);
  return getRecordString(nestedModel || {}, [
    "id",
    "model",
    "modelId",
    "model_id",
    "name",
  ]).trim();
}

export function getRunnerAgentOptionExplicitProvider(
  option: RunnerChatOption | null | undefined
): string {
  if (!option) {
    return "";
  }

  const candidate = option as RunnerAgentOptionRecord;
  const directProvider = getRecordString(
    candidate as unknown as Record<string, unknown>,
    [
      "modelProvider",
      "model_provider",
      "modelProviderType",
      "model_provider_type",
      "provider",
      "providerType",
      "provider_type",
      "source",
    ]
  ).trim();
  if (directProvider) {
    return directProvider;
  }

  const metadata = normalizeRecordObject(candidate.metadata);
  const metadataProvider = getRecordString(metadata || {}, [
    "modelProvider",
    "model_provider",
    "modelProviderType",
    "model_provider_type",
    "provider",
    "providerType",
    "provider_type",
    "source",
  ]).trim();
  if (metadataProvider) {
    return metadataProvider;
  }

  const nestedModel = getRecordObject(metadata, [
    "model",
    "modelMeta",
    "model_meta",
    "llm",
    "llmModel",
    "llm_model",
  ]);
  return getRecordString(nestedModel || {}, [
    "modelProvider",
    "model_provider",
    "modelProviderType",
    "model_provider_type",
    "provider",
    "providerType",
    "provider_type",
    "source",
  ]).trim();
}

export function inferRunnerAgentProviderTypeFromModelId(
  modelId: string
): string {
  const normalized = modelId.trim().toLowerCase();
  if (!normalized) {
    return "";
  }
  if (normalized.startsWith("external:")) {
    const [, providerType] = normalized.split(":");
    return providerType || "";
  }
  if (
    normalized.startsWith("minimax-") ||
    normalized === "minimax/m3" ||
    normalized.includes("minimax")
  ) {
    return "minimax";
  }
  if (normalized.startsWith("claude-") || normalized.includes("anthropic")) {
    return "anthropic";
  }
  if (normalized.startsWith("gemini-") || normalized.includes("google")) {
    return "google";
  }
  if (
    normalized.startsWith("gpt-") ||
    normalized.startsWith("o1") ||
    normalized.startsWith("o3") ||
    normalized.startsWith("o4") ||
    normalized.includes("openai")
  ) {
    return "openai";
  }
  if (
    normalized.startsWith("deepseek-") ||
    normalized.includes("deepseek")
  ) {
    return "deepseek";
  }
  if (
    normalized.startsWith("kimi-") ||
    normalized.includes("moonshot") ||
    normalized.includes("kimi")
  ) {
    return "kimi";
  }
  if (
    normalized.startsWith("glm-") ||
    normalized.includes("zai") ||
    normalized.includes("zhipu")
  ) {
    return "zai";
  }
  if (
    normalized.startsWith("qwen") ||
    normalized.includes("alibaba/qwen")
  ) {
    return "qwen";
  }
  if (normalized.startsWith("grok-") || normalized.includes("xai")) {
    return "xai";
  }
  return "";
}

export function getRunnerAgentOptionProviderType(
  option: RunnerChatOption | null | undefined
): string {
  const modelProvider = inferRunnerAgentProviderTypeFromModelId(
    getRunnerAgentOptionModelId(option)
  );
  if (modelProvider === "minimax") {
    return modelProvider;
  }

  const explicitProvider = getRunnerAgentOptionExplicitProvider(option)
    .trim()
    .toLowerCase();
  if (!explicitProvider) {
    return modelProvider;
  }
  if (explicitProvider.includes("minimax")) return "minimax";
  if (
    explicitProvider.includes("anthropic") ||
    explicitProvider.includes("claude")
  ) {
    return "anthropic";
  }
  if (
    explicitProvider.includes("google") ||
    explicitProvider.includes("gemini")
  ) {
    return "google";
  }
  if (explicitProvider.includes("openai") || explicitProvider === "open-ai") {
    return "openai";
  }
  if (explicitProvider.includes("deepseek")) return "deepseek";
  if (
    explicitProvider.includes("moonshot") ||
    explicitProvider.includes("kimi")
  ) {
    return "kimi";
  }
  if (
    explicitProvider.includes("zai") ||
    explicitProvider.includes("zhipu")
  ) {
    return "zai";
  }
  if (
    explicitProvider.includes("qwen") ||
    explicitProvider.includes("alibaba")
  ) {
    return "qwen";
  }
  if (
    explicitProvider.includes("xai") ||
    explicitProvider.includes("grok")
  ) {
    return "xai";
  }
  if (explicitProvider.includes("cloudflare")) {
    return modelProvider || "kimi";
  }
  return modelProvider || explicitProvider;
}

export function getRunnerAgentProviderIcon(
  providerType: string
): { src: string; alt: string; className?: string } | null {
  const normalized = providerType.trim().toLowerCase();
  if (normalized === "anthropic") {
    return {
      src: "/img/05-model-provider-icons/claude.png",
      alt: "Anthropic",
    };
  }
  if (normalized === "google" || normalized === "gemini") {
    return { src: "/img/05-model-provider-icons/gemini.png", alt: "Google" };
  }
  if (normalized === "openai") {
    return {
      src: "/img/05-model-provider-icons/openai.svg",
      alt: "OpenAI",
      className: "is-openai",
    };
  }
  if (normalized === "deepseek") {
    return {
      src: "/img/05-model-provider-icons/deepseek.png",
      alt: "DeepSeek",
    };
  }
  if (normalized === "minimax") {
    return {
      src: "/img/05-model-provider-icons/minimax.svg",
      alt: "MiniMax",
    };
  }
  if (
    normalized === "kimi" ||
    normalized === "moonshot" ||
    normalized === "cloudflare"
  ) {
    return {
      src: "/img/05-model-provider-icons/kimi.png",
      alt: "Moonshot",
    };
  }
  if (
    normalized === "zai" ||
    normalized === "z-ai" ||
    normalized === "zhipu"
  ) {
    return { src: "/img/05-model-provider-icons/zai.webp", alt: "ZAI" };
  }
  if (normalized === "qwen" || normalized === "alibaba") {
    return {
      src: "/img/05-model-provider-icons/qwen.svg",
      alt: "Qwen",
      className: "is-openai",
    };
  }
  if (normalized === "xai" || normalized === "grok") {
    return { src: "/img/05-model-provider-icons/xai.svg", alt: "xAI" };
  }
  return null;
}

export function getRunnerAgentSelectorMode(
  option: RunnerChatOption | null | undefined
): RunnerAgentSelectorMode {
  if (isRunnerHumanAgentOption(option)) {
    return "humans";
  }
  return isRunnerTeamAgentOption(option) ? "teams" : "agents";
}

function addRunnerGuardrailText(
  texts: string[],
  seen: Set<string>,
  value: unknown
): void {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || seen.has(text)) {
    return;
  }
  seen.add(text);
  texts.push(text);
}

function collectRunnerPromptAdaptationTexts(
  texts: string[],
  seen: Set<string>,
  value: unknown
): void {
  if (!Array.isArray(value)) {
    return;
  }
  value.forEach((item) => {
    if (typeof item === "string") {
      addRunnerGuardrailText(texts, seen, item);
      return;
    }
    const record = normalizeRecordObject(item);
    if (!record) {
      return;
    }
    addRunnerGuardrailText(
      texts,
      seen,
      getRecordString(record, [
        "content",
        "prompt",
        "text",
        "instruction",
        "instructions",
      ])
    );
  });
}

function collectRunnerGuardrailSetTexts(
  texts: string[],
  seen: Set<string>,
  value: unknown
): void {
  if (!Array.isArray(value)) {
    return;
  }
  value.forEach((item) => {
    const record = normalizeRecordObject(item);
    if (!record) {
      return;
    }
    addRunnerGuardrailText(
      texts,
      seen,
      getRecordString(record, [
        "prompt",
        "content",
        "text",
        "instruction",
        "instructions",
      ])
    );
    getRecordArray(record, [
      "prompts",
      "promptAdaptations",
      "prompt_adaptations",
      "invisiblePromptAdaptations",
      "invisible_prompt_adaptations",
    ]).forEach((prompt) => {
      if (typeof prompt === "string") {
        addRunnerGuardrailText(texts, seen, prompt);
        return;
      }
      const promptRecord = normalizeRecordObject(prompt);
      if (!promptRecord) {
        return;
      }
      addRunnerGuardrailText(
        texts,
        seen,
        getRecordString(promptRecord, [
          "prompt",
          "content",
          "text",
          "instruction",
          "instructions",
        ])
      );
    });
  });
}

export function getRunnerAgentGuardrailTexts(
  option: RunnerChatOption | null | undefined
): string[] {
  if (!option) {
    return [];
  }

  const candidate = option as RunnerAgentOptionRecord;
  const metadata = normalizeRecordObject(candidate.metadata);
  const runnerGuardrails = getRecordObject(metadata, [
    "runnerGuardrails",
    "runner_guardrails",
  ]);
  const texts: string[] = [];
  const seen = new Set<string>();
  const adaptationKeys = [
    "promptAdaptations",
    "prompt_adaptations",
    "promptAdaptions",
    "prompt_adaptions",
    "invisiblePromptAdaptations",
    "invisible_prompt_adaptations",
    "invisiblePromptAdaptions",
    "invisible_prompt_adaptions",
  ];

  [
    candidate.promptAdaptations,
    candidate.prompt_adaptations,
    candidate.promptAdaptions,
    candidate.prompt_adaptions,
    candidate.invisiblePromptAdaptations,
    candidate.invisible_prompt_adaptations,
    candidate.invisiblePromptAdaptions,
    candidate.invisible_prompt_adaptions,
    ...adaptationKeys.map((key) => metadata?.[key]),
    ...adaptationKeys.map((key) => runnerGuardrails?.[key]),
  ].forEach((value) =>
    collectRunnerPromptAdaptationTexts(texts, seen, value)
  );

  [
    candidate.guardrails,
    metadata?.guardrails,
    runnerGuardrails?.guardrails,
  ].forEach((value) => collectRunnerGuardrailSetTexts(texts, seen, value));

  return texts;
}

const RUNNER_AGENT_GUARDRAILS_HIDDEN_PROMPT_MARKER =
  "Invisible guardrails for the selected agent:";
const RUNNER_VISIBLE_USER_MESSAGE_MARKER = "Visible user message:";

export function isRunnerInternalHiddenExecutionPromptContent(
  value: unknown
): boolean {
  const normalizedValue = stripRunnerSystemTags(String(value || "")).trim();
  if (!normalizedValue) {
    return false;
  }
  return normalizedValue.startsWith(
    RUNNER_AGENT_GUARDRAILS_HIDDEN_PROMPT_MARKER
  );
}

export function extractRunnerVisibleContentFromHiddenExecutionPrompt(
  value: unknown
): string {
  const normalizedValue = stripRunnerSystemTags(String(value || "")).trim();
  if (!isRunnerInternalHiddenExecutionPromptContent(normalizedValue)) {
    return normalizedValue;
  }

  const explicitVisibleIndex = normalizedValue.lastIndexOf(
    RUNNER_VISIBLE_USER_MESSAGE_MARKER
  );
  if (explicitVisibleIndex >= 0) {
    return normalizedValue
      .slice(explicitVisibleIndex + RUNNER_VISIBLE_USER_MESSAGE_MARKER.length)
      .trim();
  }

  const blocks = normalizedValue
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const lastBlock = blocks[blocks.length - 1] || "";
  if (
    !lastBlock ||
    lastBlock === RUNNER_AGENT_GUARDRAILS_HIDDEN_PROMPT_MARKER ||
    lastBlock.startsWith("Follow these guardrails") ||
    /^Guardrail\s+\d+:/i.test(lastBlock)
  ) {
    return "";
  }
  return lastBlock;
}

export function buildRunnerExecutionPromptWithHiddenContext(
  hiddenParts: string[],
  visiblePrompt: string
): string {
  const normalizedHiddenParts = hiddenParts
    .filter((part) => typeof part === "string" && part.trim().length > 0)
    .map((part) => part.trim());
  const normalizedVisiblePrompt = String(visiblePrompt || "").trim();
  if (normalizedHiddenParts.length === 0) {
    return normalizedVisiblePrompt;
  }
  return [
    ...normalizedHiddenParts,
    `${RUNNER_VISIBLE_USER_MESSAGE_MARKER}\n${normalizedVisiblePrompt}`,
  ].join("\n\n");
}

export function buildRunnerAgentGuardrailsHiddenPrompt(
  option: RunnerChatOption | null | undefined
): string {
  const guardrailTexts = getRunnerAgentGuardrailTexts(option);
  if (guardrailTexts.length === 0) {
    return "";
  }
  return [
    RUNNER_AGENT_GUARDRAILS_HIDDEN_PROMPT_MARKER,
    "Follow these guardrails for every response in this thread unless a higher-priority system or safety instruction conflicts with them.",
    guardrailTexts
      .map((text, index) => `Guardrail ${index + 1}:\n${text}`)
      .join("\n\n"),
  ].join("\n\n");
}

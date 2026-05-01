import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Bot, Check, Search, SlidersHorizontal } from "lucide-react";
import type { RunnerLog } from "../types.js";
import { LogHeader, LogPanel } from "./runner-log-card.js";
import { stripRunnerSystemTags } from "./runner-markdown.js";

type AgentModelMeta = {
  id: string;
  label: string;
  description: string;
  providerType: string;
  contextWindow: string;
};

type AgentModelPricing = {
  input: number;
  cached: number;
  output: number;
};

export type ComputerAgentsListAgent = {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  modelId: string;
  modelLabel: string;
  providerLabel: string;
  providerType: string;
  contextWindowLabel: string;
  contextWindowValue: number | null;
  ctCostLabel: string;
  ctCostValue: number | null;
  kind: "agent" | "team";
};

export type ComputerAgentsListLogDetails = {
  agents: ComputerAgentsListAgent[];
};

export type ComputerAgentsListAvailableAgent = unknown;

const DEFAULT_AGENT_MODEL_ID = "claude-haiku-4-5";
const DEFAULT_AGENT_PHOTO_URL = "/img/agent-profile-pics/assistantastro-1.webp";
const AGENTS_LIST_PAGE_SIZE = 5;

type AgentListMode = "agents" | "teams";
type AgentListSort = "name" | "model" | "provider" | "context" | "cost";
type AgentListPopover = "sort" | "filter" | null;

const AGENT_MODEL_CATALOG: AgentModelMeta[] = [
  {
    id: "claude-opus-4-7",
    label: "Claude Opus 4.7",
    description: "Latest Anthropic flagship for complex reasoning and agentic coding.",
    providerType: "anthropic",
    contextWindow: "1M",
  },
  {
    id: "claude-opus-4-6",
    label: "Claude Opus 4.6",
    description: "Previous-generation Anthropic flagship for complex reasoning.",
    providerType: "anthropic",
    contextWindow: "1M",
  },
  {
    id: "claude-sonnet-4-5",
    label: "Claude Sonnet 4.5",
    description: "Balanced flagship model for everyday coding work.",
    providerType: "anthropic",
    contextWindow: "200k",
  },
  {
    id: "claude-haiku-4-5",
    label: "Claude Haiku 4.5",
    description: "Fast and efficient for quick iterations.",
    providerType: "anthropic",
    contextWindow: "200k",
  },
  {
    id: "gpt-5.5-pro",
    label: "GPT-5.5 Pro",
    description: "OpenAI highest-accuracy model for the hardest professional and agentic work.",
    providerType: "openai",
    contextWindow: "1M",
  },
  {
    id: "gpt-5.5",
    label: "GPT-5.5",
    description: "OpenAI frontier model for coding, professional work, and long-context agents.",
    providerType: "openai",
    contextWindow: "1M",
  },
  {
    id: "gpt-5.4",
    label: "GPT-5.4",
    description: "OpenAI flagship model for complex coding, planning, and computer use.",
    providerType: "openai",
    contextWindow: "1M",
  },
  {
    id: "gpt-5.4-mini",
    label: "GPT-5.4 Mini",
    description: "OpenAI mini model optimized for coding, computer use, and fast agent execution.",
    providerType: "openai",
    contextWindow: "400k",
  },
  {
    id: "gpt-5.4-nano",
    label: "GPT-5.4 Nano",
    description: "OpenAI nano model for lightweight instruction following and high-volume workflows.",
    providerType: "openai",
    contextWindow: "400k",
  },
  {
    id: "gemini-3-flash",
    label: "Gemini 3 Flash",
    description: "Fast default model for broad agent execution.",
    providerType: "google",
    contextWindow: "1M",
  },
  {
    id: "gemini-3-1-flash",
    label: "Gemini 3.1 Flash",
    description: "Fast Gemini tier that currently routes through the same runtime as Gemini 3 Flash.",
    providerType: "google",
    contextWindow: "1M",
  },
  {
    id: "gemini-3-1-pro",
    label: "Gemini 3.1 Pro",
    description: "Long-context reasoning for deeper planning.",
    providerType: "google",
    contextWindow: "1M",
  },
  {
    id: "deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    description: "DeepSeek flagship served through the managed Claw runtime for agentic coding and long-context reasoning.",
    providerType: "deepseek",
    contextWindow: "1M",
  },
  {
    id: "deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    description: "Fast DeepSeek V4 model served through the managed Claw runtime for efficient agent execution.",
    providerType: "deepseek",
    contextWindow: "1M",
  },
  {
    id: "kimi-k2.6",
    label: "Kimi K2.6",
    description: "Moonshot flagship for long-horizon coding and agentic execution.",
    providerType: "kimi",
    contextWindow: "262k",
  },
];

const AGENT_MODEL_PRICING_BY_ID: Record<string, AgentModelPricing> = {
  "claude-haiku-4-5": { input: 1.0, cached: 0.1, output: 5.0 },
  "claude-sonnet-4-5": { input: 3.0, cached: 0.3, output: 15.0 },
  "claude-opus-4-6": { input: 5.0, cached: 0.5, output: 25.0 },
  "claude-opus-4-7": { input: 5.0, cached: 0.5, output: 25.0 },
  "gpt-5.5-pro": { input: 30.0, cached: 30.0, output: 180.0 },
  "gpt-5.5": { input: 5.0, cached: 0.5, output: 30.0 },
  "gpt-5.4": { input: 2.5, cached: 0.25, output: 15.0 },
  "gpt-5.4-mini": { input: 0.75, cached: 0.075, output: 4.5 },
  "gpt-5.4-nano": { input: 0.2, cached: 0.02, output: 1.25 },
  "gemini-3-flash": { input: 1.0, cached: 0.1, output: 5.0 },
  "gemini-3-1-flash": { input: 1.0, cached: 0.1, output: 5.0 },
  "gemini-3-1-pro": { input: 3.0, cached: 0.3, output: 15.0 },
  "deepseek-v4-pro": { input: 0.435, cached: 0.03625, output: 0.87 },
  "deepseek-v4-flash": { input: 0.14, cached: 0.028, output: 0.28 },
  "kimi-k2.6": { input: 0.95, cached: 0.16, output: 4.0 },
};

const AGENT_MODEL_ALIAS_BY_ID: Record<string, string> = {
  "gpt-5": "gpt-5.4",
  "gpt-5.1": "gpt-5.4",
  "gpt-5.2": "gpt-5.4",
  "gpt-5-pro": "gpt-5.4",
  "gpt-5.1-codex": "gpt-5.4-mini",
  "gpt-5-codex": "gpt-5.4-mini",
  "gpt-5-mini": "gpt-5.4-mini",
  "gpt-5-nano": "gpt-5.4-nano",
  "gpt-5.5-thinking": "gpt-5.5",
  "deepseek-v4pro": "deepseek-v4-pro",
  "deepseek-v4flash": "deepseek-v4-flash",
  "deepseek-chat": "deepseek-v4-flash",
  "deepseek-reasoner": "deepseek-v4-flash",
};

type StructuredCommandExecutionOutput = {
  stdout: string;
  stderr: string;
  returnCodeInterpretation: string | null;
  interrupted: boolean | null;
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseStructuredCommandExecutionOutput(output: unknown): StructuredCommandExecutionOutput | null {
  const visit = (value: unknown): StructuredCommandExecutionOutput | null => {
    if (value == null) return null;
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = visit(entry);
        if (nested) return nested;
      }
      return null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) return null;
      try {
        return visit(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    if (!isPlainRecord(value)) return null;

    if (Object.prototype.hasOwnProperty.call(value, "stdout") || Object.prototype.hasOwnProperty.call(value, "stderr")) {
      return {
        stdout: typeof value.stdout === "string" ? value.stdout : "",
        stderr: typeof value.stderr === "string" ? value.stderr : "",
        returnCodeInterpretation:
          typeof value.returnCodeInterpretation === "string" && value.returnCodeInterpretation.trim()
            ? value.returnCodeInterpretation.trim()
            : null,
        interrupted: typeof value.interrupted === "boolean" ? value.interrupted : null,
      };
    }

    for (const candidate of [value.result, value.payload, value.data, value.structuredContent, value.structured_content]) {
      const nested = visit(candidate);
      if (nested) return nested;
    }
    return null;
  };

  return visit(output);
}

function stripAnsiControlCodes(value: string): string {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
}

function getCommandOutputText(log: RunnerLog): string {
  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const output = parsedOutput
    ? [parsedOutput.stdout, parsedOutput.stderr].filter((value) => value.trim().length > 0).join("\n")
    : String(log.metadata?.output || "");
  return stripAnsiControlCodes(stripRunnerSystemTags(output));
}

function getCommandText(log: RunnerLog): string {
  return stripRunnerSystemTags(String(log.metadata?.command || log.message || ""));
}

function isComputerAgentsAgentsListCommand(command?: string): boolean {
  const normalized = stripRunnerSystemTags(String(command || "")).replace(/\s+/g, " ").trim();
  return /computer-agents(?:\.py)?\s+agents\s+list\b/i.test(normalized);
}

function readRecordString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function readNestedRecordString(record: Record<string, unknown>, paths: string[][]): string {
  for (const path of paths) {
    let current: unknown = record;
    for (const segment of path) {
      if (!isPlainRecord(current)) {
        current = null;
        break;
      }
      current = current[segment];
    }
    if (typeof current === "string" && current.trim()) return current.trim();
    if (typeof current === "number" && Number.isFinite(current)) return String(current);
  }
  return "";
}

function normalizeModelId(modelId: string): string {
  const raw = String(modelId || "").trim();
  if (!raw) return DEFAULT_AGENT_MODEL_ID;
  const lower = raw.toLowerCase();
  return AGENT_MODEL_ALIAS_BY_ID[lower] || raw;
}

function titleCaseProvider(value: string): string {
  return value
    .replace(/^external:/i, "")
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function getProviderLabel(providerType: string): string {
  const normalized = providerType.trim().toLowerCase();
  if (normalized === "anthropic") return "Anthropic";
  if (normalized === "google" || normalized === "gemini") return "Google";
  if (normalized === "openai") return "OpenAI";
  if (normalized === "deepseek") return "DeepSeek";
  if (normalized === "kimi" || normalized === "moonshot" || normalized === "cloudflare") return "Moonshot";
  return normalized ? titleCaseProvider(normalized) : "Provider";
}

function normalizeProviderClassName(providerType: string): string {
  return providerType
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "generic";
}

function inferProviderTypeFromModelId(modelId: string): string {
  const normalized = modelId.trim().toLowerCase();
  if (normalized.startsWith("external:")) {
    const [, providerType] = normalized.split(":");
    return providerType || "custom";
  }
  if (normalized.startsWith("claude-")) return "anthropic";
  if (normalized.startsWith("gemini-")) return "google";
  if (normalized.startsWith("gpt-")) return "openai";
  if (normalized.startsWith("deepseek-")) return "deepseek";
  if (normalized.startsWith("kimi-")) return "kimi";
  return "generic";
}

function buildExternalModelMeta(modelId: string): AgentModelMeta {
  const parts = modelId.split(":");
  const encodedModelId = parts.slice(2).join(":");
  let decodedModelId = encodedModelId || modelId;
  try {
    decodedModelId = decodeURIComponent(encodedModelId || modelId);
  } catch {}
  const providerType = parts[1] || inferProviderTypeFromModelId(modelId);
  return {
    id: modelId,
    label: decodedModelId || "External Model",
    description: "Workspace-managed external model.",
    providerType,
    contextWindow: "Custom",
  };
}

function getAgentModelMeta(modelId: string): AgentModelMeta {
  const normalizedModelId = normalizeModelId(modelId);
  if (normalizedModelId.toLowerCase().startsWith("external:")) {
    return buildExternalModelMeta(normalizedModelId);
  }
  const matched = AGENT_MODEL_CATALOG.find((model) => model.id === normalizedModelId);
  if (matched) return matched;
  return {
    id: normalizedModelId || DEFAULT_AGENT_MODEL_ID,
    label: normalizedModelId || "Selected model",
    description: "Selected model.",
    providerType: inferProviderTypeFromModelId(normalizedModelId),
    contextWindow: "Custom",
  };
}

function formatAgentModelComputeTokenCost(modelId: string): string {
  const pricing = AGENT_MODEL_PRICING_BY_ID[normalizeModelId(modelId)];
  if (!pricing) return "Custom";
  const weightedUsdPerMillion = (pricing.input * 0.7) + (pricing.cached * 0.1) + (pricing.output * 0.2);
  return `${Math.max(1, Math.round(weightedUsdPerMillion / 0.01)).toLocaleString("en-US")} CT / 1M`;
}

function getAgentModelComputeTokenCostValue(modelId: string): number | null {
  const pricing = AGENT_MODEL_PRICING_BY_ID[normalizeModelId(modelId)];
  if (!pricing) return null;
  const weightedUsdPerMillion = (pricing.input * 0.7) + (pricing.cached * 0.1) + (pricing.output * 0.2);
  return Math.max(1, Math.round(weightedUsdPerMillion / 0.01));
}

function normalizePhotoUrl(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  if (raw.startsWith("/") || raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return "";
}

function getExplicitAgentPhotoUrl(record: Record<string, unknown>): string {
  const explicitPhotoUrl = normalizePhotoUrl(
    readRecordString(record, [
      "photoUrl",
      "photoURL",
      "avatarUrl",
      "avatarURL",
      "avatar",
      "picture",
      "imageUrl",
      "imageURL",
      "profilePhotoUrl",
      "profilePhotoURL",
    ])
  );
  if (explicitPhotoUrl) return explicitPhotoUrl;

  return normalizePhotoUrl(
    readNestedRecordString(record, [
      ["metadata", "profile", "photoURL"],
      ["metadata", "profile", "photoUrl"],
      ["metadata", "profile", "avatarUrl"],
      ["metadata", "profile", "picture"],
      ["profile", "photoURL"],
      ["profile", "photoUrl"],
      ["profile", "avatarUrl"],
      ["profile", "picture"],
    ])
  );
}

function getFallbackAgentPhotoUrl(record: Record<string, unknown>): string {
  const normalizedName = readRecordString(record, ["name", "title", "displayName", "display_name"]).toLowerCase();
  const normalizedId = readRecordString(record, ["id", "agentId", "agent_id", "uid"]).toLowerCase();
  if (normalizedName === "developer" || normalizedId === "agent_default" || normalizedId === "agent-default") {
    return "/img/agent-profile-pics/devastro.webp";
  }
  if (normalizedName.includes("research") || normalizedId.includes("research")) {
    return "/img/agent-profile-pics/researchastro.webp";
  }
  return DEFAULT_AGENT_PHOTO_URL;
}

function getAgentPhotoUrl(record: Record<string, unknown>): string {
  const explicitPhotoUrl = getExplicitAgentPhotoUrl(record);
  if (explicitPhotoUrl) return explicitPhotoUrl;
  return getFallbackAgentPhotoUrl(record);
}

function getAgentRecordKind(record: Record<string, unknown>): "agent" | "team" {
  const explicitKind = readRecordString(record, ["agentType", "agent_type", "type", "kind"]).toLowerCase();
  if (explicitKind === "team" || explicitKind === "teams") return "team";

  const metadataKind = readNestedRecordString(record, [
    ["metadata", "kind"],
    ["metadata", "team", "kind"],
  ]).toLowerCase();
  if (metadataKind === "team" || metadataKind === "teams") return "team";

  const metadata = isPlainRecord(record.metadata) ? record.metadata : null;
  if (metadata && isPlainRecord(metadata.team)) return "team";
  return "agent";
}

function parseContextWindowValue(value: string): number | null {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
  if (!normalized || normalized === "custom" || normalized === "unknown") return null;
  const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)(k|m)?$/);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const unit = match[2] || "";
  if (unit === "m") return Math.round(amount * 1_000_000);
  if (unit === "k") return Math.round(amount * 1_000);
  return Math.round(amount);
}

function formatContextWindowLabel(value: string): string {
  const raw = value.trim();
  if (!raw) return "Custom";
  const parsed = parseContextWindowValue(raw);
  if (!parsed) return raw;
  if (parsed >= 1_000_000 && parsed % 1_000_000 === 0) return `${parsed / 1_000_000}M`;
  if (parsed >= 1_000 && parsed % 1_000 === 0) return `${parsed / 1_000}k`;
  return parsed.toLocaleString("en-US");
}

function getAgentContextWindow(record: Record<string, unknown>, modelMeta: AgentModelMeta): { label: string; value: number | null } {
  const explicitContext =
    readRecordString(record, [
      "contextWindow",
      "context_window",
      "contextLength",
      "context_length",
      "modelContextWindow",
      "model_context_window",
    ]) ||
    readNestedRecordString(record, [
      ["metadata", "contextWindow"],
      ["metadata", "context_window"],
      ["metadata", "contextLength"],
      ["metadata", "context_length"],
      ["metadata", "model", "contextWindow"],
      ["metadata", "model", "context_window"],
    ]);
  const label = formatContextWindowLabel(explicitContext || modelMeta.contextWindow);
  return {
    label,
    value: parseContextWindowValue(label),
  };
}

function normalizeAgentRecord(record: Record<string, unknown>): ComputerAgentsListAgent | null {
  const id = readRecordString(record, ["id", "agentId", "agent_id", "uid"]);
  const rawName = readRecordString(record, ["name", "title", "displayName", "display_name"]);
  const rawModelId = readRecordString(record, ["model", "modelId", "model_id", "lastUsedModel", "last_used_model"]);
  if (!id && !rawName && !rawModelId) return null;

  const modelMeta = getAgentModelMeta(rawModelId || DEFAULT_AGENT_MODEL_ID);
  const explicitProvider = readRecordString(record, [
    "modelProvider",
    "model_provider",
    "modelProviderType",
    "model_provider_type",
    "provider",
    "providerType",
    "provider_type",
  ]);
  const providerType = explicitProvider || modelMeta.providerType || inferProviderTypeFromModelId(modelMeta.id);
  const description =
    readRecordString(record, ["description", "summary", "purpose"]) ||
    readNestedRecordString(record, [
      ["metadata", "description"],
      ["metadata", "summary"],
      ["metadata", "runnerPlayground", "description"],
    ]) ||
    "Agent";
  const contextWindow = getAgentContextWindow(record, modelMeta);

  return {
    id: id || `${rawName || "agent"}:${modelMeta.id}`,
    name: rawName || id || "Untitled Agent",
    description,
    photoUrl: getAgentPhotoUrl(record),
    modelId: modelMeta.id,
    modelLabel: modelMeta.label || modelMeta.id,
    providerLabel: getProviderLabel(providerType),
    providerType: normalizeProviderClassName(providerType),
    contextWindowLabel: contextWindow.label,
    contextWindowValue: contextWindow.value,
    ctCostLabel: formatAgentModelComputeTokenCost(modelMeta.id),
    ctCostValue: getAgentModelComputeTokenCostValue(modelMeta.id),
    kind: getAgentRecordKind(record),
  };
}

function collectAgentsFromParsedValue(value: unknown, agents: ComputerAgentsListAgent[]): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectAgentsFromParsedValue(entry, agents));
    return;
  }
  if (!isPlainRecord(value)) return;

  const containers = [value.data, value.agents, value.items, value.results];
  for (const container of containers) {
    if (Array.isArray(container)) {
      collectAgentsFromParsedValue(container, agents);
    }
  }

  const agent = normalizeAgentRecord(value);
  if (agent) {
    agents.push(agent);
  }
}

function collectJsonValueCandidates(text: string): unknown[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  try {
    return [JSON.parse(trimmed)];
  } catch {}

  const candidates: unknown[] = [];
  let startIndex = -1;
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      if (depth === 0) startIndex = index;
      depth += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      if (depth <= 0) continue;
      depth -= 1;
      if (depth === 0 && startIndex >= 0) {
        const candidate = text.slice(startIndex, index + 1);
        startIndex = -1;
        try {
          candidates.push(JSON.parse(candidate));
        } catch {}
      }
    }
  }

  return candidates;
}

function dedupeAgents(agents: ComputerAgentsListAgent[]): ComputerAgentsListAgent[] {
  const seen = new Set<string>();
  const result: ComputerAgentsListAgent[] = [];
  for (const agent of agents) {
    const key = agent.id || `${agent.name}:${agent.modelId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(agent);
  }
  return result;
}

function parseAgentsListOutput(output: string): ComputerAgentsListAgent[] {
  const agents: ComputerAgentsListAgent[] = [];
  for (const parsedValue of collectJsonValueCandidates(output)) {
    collectAgentsFromParsedValue(parsedValue, agents);
  }
  return dedupeAgents(agents);
}

export function parseComputerAgentsListLogDetails(log: RunnerLog): ComputerAgentsListLogDetails | null {
  if (log.eventType !== "command_execution") return null;
  if (!isComputerAgentsAgentsListCommand(getCommandText(log))) return null;
  if (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) return null;

  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  if (parsedOutput?.returnCodeInterpretation === "timeout" || parsedOutput?.interrupted) return null;

  const agents = parseAgentsListOutput(getCommandOutputText(log));
  return agents.length > 0 ? { agents } : null;
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "A";
  const first = parts[0]?.[0] || "";
  const second = parts.length > 1 ? parts[1]?.[0] || "" : "";
  return `${first}${second}`.toUpperCase() || "A";
}

function getProviderIcon(providerType: string): { src: string; alt: string; className?: string } | null {
  const normalized = providerType.trim().toLowerCase();
  if (normalized === "anthropic") return { src: "/img/05-model-provider-icons/claude.png", alt: "Anthropic" };
  if (normalized === "google" || normalized === "gemini") return { src: "/img/05-model-provider-icons/gemini.png", alt: "Google" };
  if (normalized === "openai") return { src: "/img/05-model-provider-icons/openai.svg", alt: "OpenAI", className: "is-openai" };
  if (normalized === "deepseek") return { src: "/img/05-model-provider-icons/deepseek.png", alt: "DeepSeek" };
  if (normalized === "kimi" || normalized === "moonshot" || normalized === "cloudflare") return { src: "/img/05-model-provider-icons/kimi.png", alt: "Moonshot" };
  return null;
}

function getModeLabel(mode: AgentListMode, count: number): string {
  const singular = mode === "teams" ? "Team" : "Agent";
  const plural = mode === "teams" ? "Teams" : "Agents";
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}

function normalizeAgentLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

function buildAvailableAgentLookup(availableAgents: ComputerAgentsListAvailableAgent[] | undefined): Map<string, Record<string, unknown>> {
  const lookup = new Map<string, Record<string, unknown>>();
  (Array.isArray(availableAgents) ? availableAgents : []).forEach((agent) => {
    if (!isPlainRecord(agent)) return;
    const id = typeof agent.id === "string" ? agent.id.trim() : "";
    const name = typeof agent.name === "string" ? agent.name.trim() : "";
    if (id) lookup.set(`id:${id}`, agent);
    if (name) lookup.set(`name:${normalizeAgentLookupKey(name)}`, agent);
  });
  return lookup;
}

function enrichAgentWithAvailableRecord(
  agent: ComputerAgentsListAgent,
  availableRecord: Record<string, unknown> | undefined
): ComputerAgentsListAgent {
  if (!availableRecord) return agent;

  const modelMeta = getAgentModelMeta(readRecordString(availableRecord, ["model", "modelId", "model_id", "lastUsedModel", "last_used_model"]) || agent.modelId);
  const explicitProvider = readRecordString(availableRecord, [
    "modelProvider",
    "model_provider",
    "modelProviderType",
    "model_provider_type",
    "provider",
    "providerType",
    "provider_type",
  ]);
  const providerType = explicitProvider || modelMeta.providerType || inferProviderTypeFromModelId(modelMeta.id);
  const explicitPhotoUrl = getExplicitAgentPhotoUrl(availableRecord);
  const description =
    readRecordString(availableRecord, ["description", "summary", "purpose"]) ||
    readNestedRecordString(availableRecord, [
      ["metadata", "description"],
      ["metadata", "summary"],
      ["metadata", "runnerPlayground", "description"],
    ]) ||
    agent.description;
  const contextWindow = getAgentContextWindow(availableRecord, modelMeta);

  return {
    ...agent,
    name: readRecordString(availableRecord, ["name", "title", "displayName", "display_name"]) || agent.name,
    description,
    photoUrl: explicitPhotoUrl || agent.photoUrl,
    modelId: modelMeta.id,
    modelLabel: modelMeta.label || modelMeta.id,
    providerLabel: getProviderLabel(providerType),
    providerType: normalizeProviderClassName(providerType),
    contextWindowLabel: contextWindow.label,
    contextWindowValue: contextWindow.value,
    ctCostLabel: formatAgentModelComputeTokenCost(modelMeta.id),
    ctCostValue: getAgentModelComputeTokenCostValue(modelMeta.id),
    kind: getAgentRecordKind(availableRecord),
  };
}

function enrichAgentsWithAvailableRecords(
  agents: ComputerAgentsListAgent[],
  availableAgents: ComputerAgentsListAvailableAgent[] | undefined
): ComputerAgentsListAgent[] {
  const lookup = buildAvailableAgentLookup(availableAgents);
  return agents.map((agent) => {
    const byId = agent.id ? lookup.get(`id:${agent.id}`) : undefined;
    const byName = agent.name ? lookup.get(`name:${normalizeAgentLookupKey(agent.name)}`) : undefined;
    return enrichAgentWithAvailableRecord(agent, byId || byName);
  });
}

function ProviderIcon({ agent }: { agent: ComputerAgentsListAgent }) {
  const [failed, setFailed] = useState(false);
  const providerIcon = failed ? null : getProviderIcon(agent.providerType);
  return (
    <span className="tb-log-agent-list-provider-icon-shell" aria-hidden="true">
      {providerIcon ? (
        <img
          src={providerIcon.src}
          alt=""
          draggable="false"
          className={`tb-log-agent-list-provider-icon ${providerIcon.className || ""}`.trim()}
          onError={() => setFailed(true)}
        />
      ) : (
        <Bot className="tb-log-agent-list-provider-fallback-icon" strokeWidth={1.8} />
      )}
    </span>
  );
}

function AgentListAvatar({ agent }: { agent: ComputerAgentsListAgent }) {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => getInitials(agent.name), [agent.name]);
  const photoUrl = failed ? "" : agent.photoUrl;

  return (
    <span className="tb-log-agent-list-avatar" aria-hidden="true">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          draggable="false"
          className="tb-log-agent-list-avatar-image"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="tb-log-agent-list-avatar-fallback">{initials}</span>
      )}
    </span>
  );
}

function sortAgents(agents: ComputerAgentsListAgent[], sortMode: AgentListSort): ComputerAgentsListAgent[] {
  const sorted = agents.slice();
  sorted.sort((left, right) => {
    if (sortMode === "model") {
      const result = left.modelLabel.localeCompare(right.modelLabel);
      return result || left.name.localeCompare(right.name);
    }
    if (sortMode === "provider") {
      const result = left.providerLabel.localeCompare(right.providerLabel);
      return result || left.name.localeCompare(right.name);
    }
    if (sortMode === "cost") {
      const leftCost = left.ctCostValue ?? Number.MAX_SAFE_INTEGER;
      const rightCost = right.ctCostValue ?? Number.MAX_SAFE_INTEGER;
      return leftCost - rightCost || left.name.localeCompare(right.name);
    }
    if (sortMode === "context") {
      const leftContext = left.contextWindowValue ?? Number.MAX_SAFE_INTEGER;
      const rightContext = right.contextWindowValue ?? Number.MAX_SAFE_INTEGER;
      return leftContext - rightContext || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });
  return sorted;
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

export function ComputerAgentsListLogBox({
  details,
  timeLabel,
  onAgentClick,
  availableAgents,
}: {
  details: ComputerAgentsListLogDetails;
  timeLabel?: string;
  onAgentClick?: (agent: ComputerAgentsListAgent) => void;
  availableAgents?: ComputerAgentsListAvailableAgent[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mode, setMode] = useState<AgentListMode>("agents");
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [sortMode, setSortMode] = useState<AgentListSort>("name");
  const [openPopover, setOpenPopover] = useState<AgentListPopover>(null);
  const [visibleCount, setVisibleCount] = useState(AGENTS_LIST_PAGE_SIZE);
  const agents = useMemo(
    () => enrichAgentsWithAvailableRecords(details.agents, availableAgents),
    [availableAgents, details.agents]
  );
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const providerOptions = useMemo(() => {
    const options = new Map<string, string>();
    agents.forEach((agent) => {
      if (!agent.providerType) return;
      options.set(agent.providerType, agent.providerLabel);
    });
    return [
      { id: "all", label: "All providers" },
      ...Array.from(options.entries())
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([id, label]) => ({ id, label })),
    ];
  }, [agents]);
  const filteredAgents = useMemo(() => {
    const modeKind = mode === "teams" ? "team" : "agent";
    const matchingMode = agents.filter((agent) => agent.kind === modeKind);
    const matchingProvider = providerFilter === "all"
      ? matchingMode
      : matchingMode.filter((agent) => agent.providerType === providerFilter);
    const matchingSearch = normalizedSearchQuery
      ? matchingProvider.filter((agent) => {
          const haystack = [
            agent.name,
            agent.description,
            agent.modelLabel,
            agent.modelId,
            agent.providerLabel,
            agent.contextWindowLabel,
          ].join(" ").toLowerCase();
          return haystack.includes(normalizedSearchQuery);
        })
      : matchingProvider;
    return sortAgents(matchingSearch, sortMode);
  }, [agents, mode, normalizedSearchQuery, providerFilter, sortMode]);
  const visibleAgents = filteredAgents.slice(0, visibleCount);
  const hasMoreAgents = filteredAgents.length > visibleAgents.length;

  useEffect(() => {
    setVisibleCount(AGENTS_LIST_PAGE_SIZE);
  }, [mode, normalizedSearchQuery, providerFilter, sortMode]);

  const sortOptions: Array<{ id: AgentListSort; label: string }> = [
    { id: "name", label: "Name" },
    { id: "model", label: "Model" },
    { id: "provider", label: "Provider" },
    { id: "context", label: "Context length" },
    { id: "cost", label: "CT cost" },
  ];
  const selectedSortLabel = sortOptions.find((option) => option.id === sortMode)?.label || "Name";
  const selectedProviderLabel = providerOptions.find((option) => option.id === providerFilter)?.label || "All providers";

  function handleAgentOpen(agent: ComputerAgentsListAgent) {
    if (typeof onAgentClick === "function") {
      onAgentClick(agent);
    }
  }

  return (
    <div className="tb-log-card tb-log-card-agent-list">
      <LogHeader
        icon={<Bot className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="List Agents"
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-log-agent-list-toolbar">
          <div className="tb-log-agent-list-summary">{getModeLabel(mode, filteredAgents.length)}</div>
          <div className="tb-log-agent-list-controls">
            <div className="tb-log-agent-list-search-shell">
              <Search className="tb-log-agent-list-search-icon" strokeWidth={1.8} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="tb-log-agent-list-search"
                placeholder={mode === "teams" ? "Search teams" : "Search agents"}
              />
            </div>
            <div className="tb-log-agent-list-toolbar-controls">
              <div className="tb-log-agent-list-popup-shell">
                <button
                  type="button"
                  className={`tb-log-agent-list-control-button ${openPopover === "sort" || sortMode !== "name" ? "is-active" : ""}`.trim()}
                  onClick={() => setOpenPopover((current) => current === "sort" ? null : "sort")}
                >
                  <ArrowUpDown className="tb-log-agent-list-control-icon" strokeWidth={1.8} />
                  <span>Sort</span>
                </button>
                {openPopover === "sort" ? (
                  <div className="tb-log-agent-list-popup-menu">
                    <div className="tb-log-agent-list-popup-title">Sort by</div>
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`tb-log-agent-list-popup-row ${sortMode === option.id ? "selected" : ""}`.trim()}
                        onClick={() => {
                          setSortMode(option.id);
                          setOpenPopover(null);
                        }}
                      >
                        <span className="tb-log-agent-list-popup-check-slot">
                          {sortMode === option.id ? <Check className="tb-log-agent-list-popup-check" strokeWidth={1.8} /> : null}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="tb-log-agent-list-popup-shell">
                <button
                  type="button"
                  className={`tb-log-agent-list-control-button ${openPopover === "filter" || providerFilter !== "all" ? "is-active" : ""}`.trim()}
                  onClick={() => setOpenPopover((current) => current === "filter" ? null : "filter")}
                >
                  <SlidersHorizontal className="tb-log-agent-list-control-icon" strokeWidth={1.8} />
                  <span>Filter</span>
                </button>
                {openPopover === "filter" ? (
                  <div className="tb-log-agent-list-popup-menu">
                    <div className="tb-log-agent-list-popup-title">Provider</div>
                    {providerOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`tb-log-agent-list-popup-row ${providerFilter === option.id ? "selected" : ""}`.trim()}
                        onClick={() => {
                          setProviderFilter(option.id);
                          setOpenPopover(null);
                        }}
                      >
                        <span className="tb-log-agent-list-popup-check-slot">
                          {providerFilter === option.id ? <Check className="tb-log-agent-list-popup-check" strokeWidth={1.8} /> : null}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="tb-log-agent-list-mode-switch" role="group" aria-label="Agent list mode">
              <button
                type="button"
                className={`tb-log-agent-list-mode-button ${mode === "agents" ? "is-active" : ""}`.trim()}
                onClick={() => setMode("agents")}
                aria-pressed={mode === "agents"}
              >
                Agents
              </button>
              <button
                type="button"
                className={`tb-log-agent-list-mode-button ${mode === "teams" ? "is-active" : ""}`.trim()}
                onClick={() => setMode("teams")}
                aria-pressed={mode === "teams"}
              >
                Teams
              </button>
            </div>
          </div>
          <div className="tb-log-agent-list-active-filters" aria-live="polite">
            {sortMode !== "name" ? <span>{`Sorted by ${selectedSortLabel}`}</span> : null}
            {providerFilter !== "all" ? <span>{selectedProviderLabel}</span> : null}
          </div>
        </div>
        <div className="tb-log-agent-list-table-shell">
          {visibleAgents.length > 0 ? (
            <table className="tb-log-agent-list-table">
              <colgroup>
                <col className="tb-log-agent-list-col-name" />
                <col className="tb-log-agent-list-col-model" />
                <col className="tb-log-agent-list-col-context" />
                <col className="tb-log-agent-list-col-cost" />
              </colgroup>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Model</th>
                  <th>Context length</th>
                  <th className="is-right">CT cost per 1M tokens</th>
                </tr>
              </thead>
              <tbody>
                {visibleAgents.map((agent) => (
                  <tr
                    key={agent.id}
                    role={onAgentClick ? "button" : undefined}
                    tabIndex={onAgentClick ? 0 : undefined}
                    onClick={() => handleAgentOpen(agent)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleAgentOpen(agent);
                      }
                    }}
                  >
                    <td>
                      <div className="tb-log-agent-list-name-cell">
                        <AgentListAvatar agent={agent} />
                        <div className="tb-log-agent-list-name-copy">
                          <div className="tb-log-agent-list-name-title" title={agent.name}>{agent.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-model-cell">
                        <ProviderIcon agent={agent} />
                        <div className="tb-log-agent-list-model-copy">
                          <div className="tb-log-agent-list-model-provider" title={agent.providerLabel}>{agent.providerLabel}</div>
                          <div className="tb-log-agent-list-model-name" title={agent.modelLabel}>{agent.modelLabel}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-context">{agent.contextWindowLabel}</div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-cost">{agent.ctCostLabel}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="tb-log-agent-list-empty">
              {normalizedSearchQuery || providerFilter !== "all"
                ? `No matching ${mode === "teams" ? "teams" : "agents"} found.`
                : `No ${mode === "teams" ? "teams" : "agents"} available.`}
            </div>
          )}
        </div>
        {hasMoreAgents ? (
          <div className="tb-log-agent-list-more-row">
            <button
              type="button"
              className="tb-log-agent-list-load-more"
              onClick={() => setVisibleCount((current) => current + AGENTS_LIST_PAGE_SIZE)}
            >
              Load more
            </button>
          </div>
        ) : null}
      </LogPanel>
    </div>
  );
}

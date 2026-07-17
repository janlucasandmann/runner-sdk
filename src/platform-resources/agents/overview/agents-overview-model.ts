import type {
  AgentsOverviewAnalyticsResource,
} from "./agents-overview-analytics-client.js";
import type { AgentOverviewRow } from "./agents-overview-page.js";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstString(values: readonly unknown[]): string {
  for (const value of values) {
    const normalized = asString(value);
    if (normalized) return normalized;
  }
  return "";
}

function parseTimestamp(value: unknown): number {
  const timestamp = Date.parse(asString(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

function getInitials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "A";
}

function isSquadAgent(agent: UnknownRecord): boolean {
  const metadata = asRecord(agent.metadata);
  const team = asRecord(metadata.team);
  return ["team", "squad"].includes(
    firstString([
      agent.agentType,
      agent.agent_type,
      metadata.agentType,
      metadata.agent_type,
      metadata.type,
    ]).toLowerCase(),
  ) || Object.keys(team).length > 0
    || Boolean(metadata.agentTeam || metadata.agent_team);
}

function isSystemAgent(agent: UnknownRecord): boolean {
  const id = asString(agent.id);
  return agent.isDefault === true
    || agent.isSystem === true
    || /^agent-(?:default|research|assistant|computer-use)-/.test(id);
}

function readAgentAvatarUrl(agent: UnknownRecord): string {
  const metadata = asRecord(agent.metadata);
  return firstString([
    agent.avatarUrl,
    agent.avatar_url,
    agent.photoUrl,
    agent.photoURL,
    metadata.avatarUrl,
    metadata.avatar_url,
    metadata.photoUrl,
    metadata.photoURL,
    metadata.profilePhotoUrl,
    metadata.profile_photo_url,
  ]);
}

function readAgentCreator(agent: UnknownRecord): {
  name: string;
  avatarUrl: string;
  isSystem: boolean;
} {
  if (isSystemAgent(agent)) {
    return {
      name: "Computer Agents",
      avatarUrl: "",
      isSystem: true,
    };
  }
  const metadata = asRecord(agent.metadata);
  const creator = Object.keys(asRecord(agent.creator)).length
    ? asRecord(agent.creator)
    : Object.keys(asRecord(agent.createdBy)).length
      ? asRecord(agent.createdBy)
      : Object.keys(asRecord(metadata.creator)).length
        ? asRecord(metadata.creator)
        : asRecord(metadata.createdBy);
  return {
    name: firstString([
      creator.name,
      creator.displayName,
      creator.display_name,
      agent.creatorName,
      agent.createdByName,
      metadata.creatorName,
      metadata.createdByName,
    ]) || "Unknown",
    avatarUrl: firstString([
      creator.avatarUrl,
      creator.avatar_url,
      creator.photoUrl,
      creator.photoURL,
      agent.creatorAvatarUrl,
      agent.createdByAvatarUrl,
      metadata.creatorAvatarUrl,
      metadata.createdByAvatarUrl,
    ]),
    isSystem: false,
  };
}

export function normalizeAgentOverviewRows(
  records: readonly unknown[],
  analyticsResources: readonly AgentsOverviewAnalyticsResource[] = [],
): AgentOverviewRow[] {
  const usageById = new Map(
    analyticsResources.map((resource) => [resource.agentId, resource]),
  );
  return records.flatMap((rawAgent) => {
    const agent = asRecord(rawAgent);
    const id = asString(agent.id);
    if (!id || id === "__playground_new_agent__") return [];
    const metadata = asRecord(agent.metadata);
    const isSquad = isSquadAgent(agent);
    const name = asString(agent.name)
      || (isSquad ? "Untitled Squad" : "Untitled Agent");
    const model = firstString([
      agent.modelLabel,
      agent.model,
      agent.modelId,
      agent.model_id,
      metadata.modelLabel,
      metadata.model,
    ]) || "Selected model";
    const analytics = usageById.get(id);
    const lastUsedValue = firstString([
      analytics?.lastUsedAt,
      agent.lastRunAt,
      agent.last_run_at,
      metadata.lastRunAt,
      metadata.last_run_at,
      agent.updatedAt,
      agent.updated_at,
    ]);
    const creator = readAgentCreator(agent);
    return [{
      id,
      name,
      usageTokens: analytics?.tokenCount || 0,
      searchText: [
        name,
        asString(agent.description),
        asString(agent.instructions),
        model,
        creator.name,
      ].join(" "),
      avatarUrl: readAgentAvatarUrl(agent),
      avatarFallback: getInitials(name),
      isSquad,
      isSystem: isSystemAgent(agent),
      modelLabel: model,
      modelIconUrl: firstString([
        agent.modelIconUrl,
        agent.model_icon_url,
        metadata.modelIconUrl,
      ]),
      modelIconClassName: asString(agent.modelIconClassName),
      creatorName: creator.name,
      creatorAvatarUrl: creator.avatarUrl,
      creatorFallback: getInitials(creator.name),
      creatorIsSystem: creator.isSystem,
      lastUsedAt: parseTimestamp(lastUsedValue),
      lastUsedLabel: lastUsedValue ? formatDate(lastUsedValue) : "Never",
      lastUsedTitle: lastUsedValue,
    }];
  });
}

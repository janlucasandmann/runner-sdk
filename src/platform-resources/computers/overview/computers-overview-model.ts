import type {
  ResourceOverviewAnalyticsModel,
} from "../../../platform-ui/pages/overview/index.js";
import type { ComputerOverviewRow } from "./computers-overview-page.js";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseTimestamp(value: unknown): number {
  const timestamp = Date.parse(asString(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function firstString(values: readonly unknown[]): string {
  for (const value of values) {
    const normalized = asString(value);
    if (normalized) return normalized;
  }
  return "";
}

function getComputerMetadata(environment: UnknownRecord): UnknownRecord {
  return asRecord(environment.metadata);
}

function getComputerCreatedValue(environment: UnknownRecord): string {
  const metadata = getComputerMetadata(environment);
  return asString(environment.createdAt) || asString(metadata.createdAt);
}

export function getComputerLastUsedValue(environment: unknown): string {
  const record = asRecord(environment);
  const metadata = getComputerMetadata(record);
  const billing = asRecord(metadata.resourceBilling);
  const candidates = [
    record.lastUsedAt,
    record.lastRunAt,
    metadata.lastUsedAt,
    metadata.lastRunAt,
    billing.activeSessionLastSettledAt,
    billing.activeSessionStartedAt,
    billing.lastSettledAt,
    record.updatedAt,
  ];
  return candidates.reduce<{ value: string; timestamp: number }>(
    (latest, candidate) => {
      const value = asString(candidate);
      const timestamp = parseTimestamp(value);
      return timestamp > latest.timestamp ? { value, timestamp } : latest;
    },
    { value: "", timestamp: 0 },
  ).value;
}

export interface NormalizeComputerOverviewRowsOptions {
  draftId?: string;
  agents?: readonly unknown[];
  currentUserName?: string;
  currentUserEmail?: string;
  currentUserAvatarUrl?: string;
  systemCreatorAvatarUrl?: string;
  resolveProfileLabel?: (environment: UnknownRecord) => string;
  resolveAgentAvatarUrl?: (agent: UnknownRecord) => string;
  normalizeAvatarUrl?: (value: unknown) => string;
  canRenderAvatarImage?: (value: string) => boolean;
  formatDate?: (value: string) => string;
  formatExactDate?: (value: string) => string;
  getInitials?: (value: string) => string;
}

function defaultFormatDate(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

function defaultInitials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";
}

function resolveComputerCreator(
  environment: UnknownRecord,
  options: NormalizeComputerOverviewRowsOptions,
): { name: string; avatarUrl: string; isSystem: boolean } {
  const normalizeAvatarUrl = options.normalizeAvatarUrl
    || ((value: unknown) => asString(value));
  const canRenderAvatarImage = options.canRenderAvatarImage
    || ((value: string) => Boolean(value));
  if (environment.isDefault === true || environment.isSystem === true) {
    return {
      name: "Computer Agents",
      avatarUrl: asString(options.systemCreatorAvatarUrl),
      isSystem: true,
    };
  }

  const metadata = getComputerMetadata(environment);
  const nested = Object.keys(asRecord(environment.creator)).length
    ? asRecord(environment.creator)
    : Object.keys(asRecord(environment.createdBy)).length
      ? asRecord(environment.createdBy)
      : Object.keys(asRecord(metadata.creator)).length
        ? asRecord(metadata.creator)
        : asRecord(metadata.createdBy);
  const creatorId = firstString([
    nested.id,
    nested.agentId,
    nested.agent_id,
    environment.creatorId,
    environment.creator_id,
    metadata.creatorId,
    metadata.creator_id,
    typeof environment.createdBy === "string"
      ? environment.createdBy
      : "",
    typeof metadata.createdBy === "string" ? metadata.createdBy : "",
  ]);
  const creatorAgent = (options.agents || [])
    .map(asRecord)
    .find((agent) => asString(agent.id) === creatorId);
  if (creatorAgent) {
    const name = asString(creatorAgent.name)
      || asString(nested.name)
      || "Agent";
    const rawAvatarUrl = options.resolveAgentAvatarUrl
      ? options.resolveAgentAvatarUrl(creatorAgent)
      : firstString([
          creatorAgent.avatarUrl,
          creatorAgent.avatar_url,
          creatorAgent.photoUrl,
          creatorAgent.photoURL,
        ]);
    const avatarUrl = normalizeAvatarUrl(rawAvatarUrl);
    return {
      name,
      avatarUrl: canRenderAvatarImage(avatarUrl) ? avatarUrl : "",
      isSystem: creatorAgent.isDefault === true
        || creatorAgent.isSystem === true,
    };
  }

  const name = firstString([
    nested.name,
    nested.displayName,
    nested.display_name,
    environment.creatorName,
    environment.creator_name,
    environment.createdByName,
    environment.created_by_name,
    metadata.creatorName,
    metadata.creator_name,
    metadata.createdByName,
    metadata.created_by_name,
  ]) || asString(options.currentUserName)
    || asString(options.currentUserEmail)
    || "Unknown";
  const rawAvatarUrl = firstString([
    nested.avatarUrl,
    nested.avatar_url,
    nested.photoUrl,
    nested.photoURL,
    environment.creatorAvatarUrl,
    environment.creator_avatar_url,
    environment.createdByAvatarUrl,
    environment.created_by_avatar_url,
    metadata.creatorAvatarUrl,
    metadata.creator_avatar_url,
    metadata.createdByAvatarUrl,
    metadata.created_by_avatar_url,
  ]) || asString(options.currentUserAvatarUrl);
  const avatarUrl = normalizeAvatarUrl(rawAvatarUrl);
  return {
    name,
    avatarUrl: canRenderAvatarImage(avatarUrl) ? avatarUrl : "",
    isSystem: false,
  };
}

export function normalizeComputerOverviewRows(
  environments: readonly unknown[],
  options: NormalizeComputerOverviewRowsOptions = {},
): ComputerOverviewRow[] {
  const formatDate = options.formatDate || defaultFormatDate;
  const formatExactDate = options.formatExactDate || defaultFormatDate;
  const getInitials = options.getInitials || defaultInitials;
  return environments.flatMap((rawEnvironment) => {
    const environment = asRecord(rawEnvironment);
    const id = asString(environment.id);
    if (!id || id === asString(options.draftId)) return [];

    const createdValue = getComputerCreatedValue(environment);
    const lastUsedValue = getComputerLastUsedValue(environment);
    const profileLabel = asString(
      options.resolveProfileLabel?.(environment),
    ) || "Standard";
    const name = asString(environment.name) || "Untitled Computer";
    const description = firstString([
      environment.description,
      getComputerMetadata(environment).description,
    ]);
    const status = asString(environment.status);
    const creator = resolveComputerCreator(environment, options);
    return [{
      id,
      name,
      description,
      searchText: [name, description, profileLabel, creator.name, status].join(" "),
      profileLabel,
      status,
      isRunning: status.toLowerCase() === "running",
      isSystem: environment.isDefault === true
        || environment.isSystem === true,
      creatorName: creator.name,
      creatorAvatarUrl: creator.avatarUrl,
      creatorFallback: getInitials(creator.name),
      creatorIsSystem: creator.isSystem,
      createdAt: parseTimestamp(createdValue),
      createdLabel: createdValue ? formatDate(createdValue) : "-",
      createdTitle: createdValue ? formatExactDate(createdValue) : "",
      lastUsedAt: parseTimestamp(lastUsedValue),
      lastUsedLabel: lastUsedValue ? formatDate(lastUsedValue) : "Never",
      lastUsedTitle: lastUsedValue ? formatExactDate(lastUsedValue) : "",
    }];
  });
}

export interface CreateComputersOverviewAnalyticsOptions {
  rows: readonly ComputerOverviewRow[];
  title: string;
  labels: readonly string[];
  costValuesUsd: readonly number[];
  totalCostUsd: number;
  formatCurrency: (value: number) => string;
  loading?: boolean;
  error?: string;
}

export function createComputersOverviewAnalytics(
  options: CreateComputersOverviewAnalyticsOptions,
): ResourceOverviewAnalyticsModel {
  const runningComputers = options.rows.filter((row) => row.isRunning).length;
  return {
    title: options.title,
    ariaLabel: "Computer cost over time",
    loading: options.loading,
    error: options.error || null,
    metrics: [
      { id: "computers", label: "Computers", value: String(options.rows.length), color: "#8fc4ff" },
      { id: "running", label: "Running", value: String(runningComputers), color: "#7effff" },
      { id: "stopped", label: "Stopped", value: String(Math.max(0, options.rows.length - runningComputers)), color: "#6750ff" },
      { id: "profiles", label: "Profiles", value: String(new Set(options.rows.map((row) => row.profileLabel)).size), color: "#4da3ff" },
      { id: "cost", label: "Total cost", value: options.formatCurrency(Math.max(0, options.totalCostUsd)), color: "#fff" },
    ],
    labels: options.labels.map(String),
    series: [{
      id: "computers",
      label: "Computers",
      color: "#8fc4ff",
      values: options.costValuesUsd.map(
        (value) => Math.max(0, Number(value) || 0),
      ),
      valueKind: "currency",
      type: "line",
    }],
  };
}

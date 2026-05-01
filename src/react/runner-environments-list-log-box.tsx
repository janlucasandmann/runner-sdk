import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Check, HardDrive, Monitor, Search, SlidersHorizontal } from "lucide-react";
import type { RunnerLog } from "../types.js";
import { LogHeader, LogPanel } from "./runner-log-card.js";
import { stripRunnerSystemTags } from "./runner-markdown.js";

type EnvironmentComputeProfile = {
  id: string;
  label: string;
  description: string;
  cpuCores: number;
  memoryMb: number;
  minutePrice: number;
};

export type ComputerAgentsListEnvironment = {
  id: string;
  name: string;
  description: string;
  profileId: string;
  profileLabel: string;
  profileDescription: string;
  statusLabel: string;
  ctCostLabel: string;
  ctCostValue: number | null;
  isDefault: boolean;
};

export type ComputerAgentsEnvironmentsListLogDetails = {
  environments: ComputerAgentsListEnvironment[];
};

export type ComputerAgentsListAvailableEnvironment = unknown;

type EnvironmentListSort = "name" | "profile" | "status" | "cost";
type EnvironmentListPopover = "sort" | "filter" | null;

const ENVIRONMENTS_LIST_PAGE_SIZE = 5;
const DEFAULT_ENVIRONMENT_PROFILE_ID = "standard";

const ENVIRONMENT_COMPUTE_PROFILES: EnvironmentComputeProfile[] = [
  {
    id: "lite",
    label: "Lite",
    description: "0.5 CPU, 1.5 GB memory",
    cpuCores: 0.5,
    memoryMb: 1536,
    minutePrice: 0.002,
  },
  {
    id: "standard",
    label: "Standard",
    description: "1 CPU, 2 GB memory",
    cpuCores: 1,
    memoryMb: 2048,
    minutePrice: 0.004,
  },
  {
    id: "power",
    label: "Power",
    description: "2 CPU, 4 GB memory",
    cpuCores: 2,
    memoryMb: 4096,
    minutePrice: 0.0075,
  },
  {
    id: "desktop",
    label: "Desktop",
    description: "2 CPU, 4 GB memory, GUI",
    cpuCores: 2,
    memoryMb: 4096,
    minutePrice: 0.01,
  },
];

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

function isComputerAgentsEnvironmentsListCommand(command?: string): boolean {
  const normalized = stripRunnerSystemTags(String(command || "")).replace(/\s+/g, " ").trim();
  return /computer-agents(?:\.py)?\s+environments?\s+list\b/i.test(normalized);
}

function readRecordString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function readRecordNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function readRecordBoolean(record: Record<string, unknown>, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
  }
  return null;
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

function readNestedRecordNumber(record: Record<string, unknown>, paths: string[][]): number | null {
  for (const path of paths) {
    let current: unknown = record;
    for (const segment of path) {
      if (!isPlainRecord(current)) {
        current = null;
        break;
      }
      current = current[segment];
    }
    if (typeof current === "number" && Number.isFinite(current)) return current;
    if (typeof current === "string" && current.trim()) {
      const parsed = Number(current);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function normalizeComputeProfileId(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "lite" || normalized === "standard" || normalized === "power" || normalized === "desktop") {
    return normalized;
  }
  return "";
}

function getComputeProfile(profileId: string): EnvironmentComputeProfile {
  const normalized = normalizeComputeProfileId(profileId) || DEFAULT_ENVIRONMENT_PROFILE_ID;
  return ENVIRONMENT_COMPUTE_PROFILES.find((profile) => profile.id === normalized) || ENVIRONMENT_COMPUTE_PROFILES[1];
}

function resolveEnvironmentProfileId(record: Record<string, unknown>): string {
  const explicitProfile = normalizeComputeProfileId(
    readRecordString(record, ["computeProfile", "compute_profile", "profile", "profileId", "profile_id"]) ||
      readNestedRecordString(record, [
        ["metadata", "computeProfile"],
        ["metadata", "compute_profile"],
        ["metadata", "profile"],
        ["metadata", "profileId"],
        ["metadata", "profile_id"],
      ])
  );
  if (explicitProfile) return explicitProfile;

  const guiEnabled =
    readRecordBoolean(record, ["guiEnabled", "gui_enabled"]) ??
    (readNestedRecordString(record, [["metadata", "guiEnabled"], ["metadata", "gui_enabled"]]).toLowerCase() === "true");
  const officeAppsEnabled =
    readRecordBoolean(record, ["officeAppsEnabled", "office_apps_enabled"]) ??
    (readNestedRecordString(record, [["metadata", "officeAppsEnabled"], ["metadata", "office_apps_enabled"]]).toLowerCase() === "true");
  if (guiEnabled || officeAppsEnabled) return "desktop";

  const isDefault = readRecordBoolean(record, ["isDefault", "is_default"]) === true;
  return isDefault ? "lite" : DEFAULT_ENVIRONMENT_PROFILE_ID;
}

function formatEnvironmentStatusLabel(value: string, isActive: boolean | null): string {
  const normalized = value.trim().toLowerCase();
  if (!normalized && isActive === false) return "Inactive";
  if (!normalized) return "Ready";
  return normalized
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function formatComputeTokenMinuteCost(value: number | null): string {
  if (!Number.isFinite(value || NaN) || (value || 0) <= 0) return "Custom";
  const computeTokens = Math.max(0.01, (value || 0) / 0.01);
  return `${computeTokens.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: computeTokens < 1 ? 1 : 0,
  })} CT / min`;
}

function getEnvironmentMinutePrice(record: Record<string, unknown>, profile: EnvironmentComputeProfile): number | null {
  return (
    readRecordNumber(record, ["estimatedCostPerMinute", "estimated_cost_per_minute", "minutePrice", "minute_price"]) ??
    readNestedRecordNumber(record, [
      ["metadata", "pricing", "minutePrice"],
      ["metadata", "pricing", "minute_price"],
      ["metadata", "estimatedCostPerMinute"],
      ["metadata", "estimated_cost_per_minute"],
    ]) ??
    profile.minutePrice
  );
}

function normalizeEnvironmentRecord(record: Record<string, unknown>): ComputerAgentsListEnvironment | null {
  const id = readRecordString(record, ["id", "environmentId", "environment_id", "uid"]);
  const rawName = readRecordString(record, ["name", "title", "displayName", "display_name"]);
  if (!id && !rawName) return null;

  const profileId = resolveEnvironmentProfileId(record);
  const profile = getComputeProfile(profileId);
  const statusValue = readRecordString(record, ["status", "state", "phase"]);
  const isActive = readRecordBoolean(record, ["isActive", "is_active", "active"]);
  const minutePrice = getEnvironmentMinutePrice(record, profile);
  const isDefault = readRecordBoolean(record, ["isDefault", "is_default"]) === true;
  const rawDescription =
    readRecordString(record, ["description", "summary", "purpose"]) ||
    readNestedRecordString(record, [["metadata", "description"], ["metadata", "summary"]]);

  return {
    id: id || rawName,
    name: rawName || id || "Untitled Environment",
    description: rawDescription || (isDefault ? "Default environment" : "Computer environment"),
    profileId: profile.id,
    profileLabel: profile.label,
    profileDescription: profile.description,
    statusLabel: formatEnvironmentStatusLabel(statusValue, isActive),
    ctCostLabel: formatComputeTokenMinuteCost(minutePrice),
    ctCostValue: minutePrice == null ? null : Math.max(0.01, minutePrice / 0.01),
    isDefault,
  };
}

function collectEnvironmentsFromParsedValue(value: unknown, environments: ComputerAgentsListEnvironment[]): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectEnvironmentsFromParsedValue(entry, environments));
    return;
  }
  if (!isPlainRecord(value)) return;

  const containers = [value.data, value.environments, value.items, value.results];
  for (const container of containers) {
    if (Array.isArray(container)) {
      collectEnvironmentsFromParsedValue(container, environments);
    }
  }

  const environment = normalizeEnvironmentRecord(value);
  if (environment) {
    environments.push(environment);
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

function dedupeEnvironments(environments: ComputerAgentsListEnvironment[]): ComputerAgentsListEnvironment[] {
  const seen = new Set<string>();
  const result: ComputerAgentsListEnvironment[] = [];
  for (const environment of environments) {
    const key = environment.id || environment.name;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(environment);
  }
  return result;
}

function parseEnvironmentsListOutput(output: string): ComputerAgentsListEnvironment[] {
  const environments: ComputerAgentsListEnvironment[] = [];
  for (const parsedValue of collectJsonValueCandidates(output)) {
    collectEnvironmentsFromParsedValue(parsedValue, environments);
  }
  return dedupeEnvironments(environments);
}

export function parseComputerAgentsEnvironmentsListLogDetails(log: RunnerLog): ComputerAgentsEnvironmentsListLogDetails | null {
  if (log.eventType !== "command_execution") return null;
  if (!isComputerAgentsEnvironmentsListCommand(getCommandText(log))) return null;
  if (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) return null;

  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  if (parsedOutput?.returnCodeInterpretation === "timeout" || parsedOutput?.interrupted) return null;

  return { environments: parseEnvironmentsListOutput(getCommandOutputText(log)) };
}

function normalizeEnvironmentLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

function buildAvailableEnvironmentLookup(
  availableEnvironments: ComputerAgentsListAvailableEnvironment[] | undefined
): Map<string, Record<string, unknown>> {
  const lookup = new Map<string, Record<string, unknown>>();
  (Array.isArray(availableEnvironments) ? availableEnvironments : []).forEach((environment) => {
    if (!isPlainRecord(environment)) return;
    const id = typeof environment.id === "string" ? environment.id.trim() : "";
    const name = typeof environment.name === "string" ? environment.name.trim() : "";
    if (id) lookup.set(`id:${id}`, environment);
    if (name) lookup.set(`name:${normalizeEnvironmentLookupKey(name)}`, environment);
  });
  return lookup;
}

function enrichEnvironmentWithAvailableRecord(
  environment: ComputerAgentsListEnvironment,
  availableRecord: Record<string, unknown> | undefined
): ComputerAgentsListEnvironment {
  if (!availableRecord) return environment;
  const profileId = resolveEnvironmentProfileId(availableRecord) || environment.profileId;
  const profile = getComputeProfile(profileId);
  const minutePrice = getEnvironmentMinutePrice(availableRecord, profile);
  const isDefault = readRecordBoolean(availableRecord, ["isDefault", "is_default"]) ?? environment.isDefault;
  const statusValue = readRecordString(availableRecord, ["status", "state", "phase"]);
  const isActive = readRecordBoolean(availableRecord, ["isActive", "is_active", "active"]);
  const description =
    readRecordString(availableRecord, ["description", "summary", "purpose"]) ||
    readNestedRecordString(availableRecord, [["metadata", "description"], ["metadata", "summary"]]) ||
    environment.description;

  return {
    ...environment,
    name: readRecordString(availableRecord, ["name", "title", "displayName", "display_name"]) || environment.name,
    description,
    profileId: profile.id,
    profileLabel: profile.label,
    profileDescription: profile.description,
    statusLabel: statusValue ? formatEnvironmentStatusLabel(statusValue, isActive) : environment.statusLabel,
    ctCostLabel: formatComputeTokenMinuteCost(minutePrice),
    ctCostValue: minutePrice == null ? null : Math.max(0.01, minutePrice / 0.01),
    isDefault,
  };
}

function mergeEnvironmentsWithAvailableRecords(
  environments: ComputerAgentsListEnvironment[],
  availableEnvironments: ComputerAgentsListAvailableEnvironment[] | undefined
): ComputerAgentsListEnvironment[] {
  const lookup = buildAvailableEnvironmentLookup(availableEnvironments);
  const merged = environments.map((environment) => {
    const byId = environment.id ? lookup.get(`id:${environment.id}`) : undefined;
    const byName = environment.name ? lookup.get(`name:${normalizeEnvironmentLookupKey(environment.name)}`) : undefined;
    return enrichEnvironmentWithAvailableRecord(environment, byId || byName);
  });

  const seen = new Set(merged.flatMap((environment) => [
    environment.id ? `id:${environment.id}` : "",
    environment.name ? `name:${normalizeEnvironmentLookupKey(environment.name)}` : "",
  ]).filter(Boolean));
  (Array.isArray(availableEnvironments) ? availableEnvironments : []).forEach((availableEnvironment) => {
    if (!isPlainRecord(availableEnvironment)) return;
    const normalized = normalizeEnvironmentRecord(availableEnvironment);
    if (!normalized) return;
    const keys = [
      normalized.id ? `id:${normalized.id}` : "",
      normalized.name ? `name:${normalizeEnvironmentLookupKey(normalized.name)}` : "",
    ].filter(Boolean);
    if (keys.some((key) => seen.has(key))) return;
    keys.forEach((key) => seen.add(key));
    merged.push(normalized);
  });
  return merged;
}

function getEnvironmentCountLabel(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? "Computer" : "Computers"}`;
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function sortEnvironments(
  environments: ComputerAgentsListEnvironment[],
  sortMode: EnvironmentListSort
): ComputerAgentsListEnvironment[] {
  const sorted = environments.slice();
  sorted.sort((left, right) => {
    if (sortMode === "profile") {
      const result = left.profileLabel.localeCompare(right.profileLabel);
      return result || left.name.localeCompare(right.name);
    }
    if (sortMode === "status") {
      const result = left.statusLabel.localeCompare(right.statusLabel);
      return result || left.name.localeCompare(right.name);
    }
    if (sortMode === "cost") {
      const leftCost = left.ctCostValue ?? Number.MAX_SAFE_INTEGER;
      const rightCost = right.ctCostValue ?? Number.MAX_SAFE_INTEGER;
      return leftCost - rightCost || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });
  return sorted;
}

export function ComputerAgentsEnvironmentsListLogBox({
  details,
  timeLabel,
  availableEnvironments,
  onEnvironmentClick,
}: {
  details: ComputerAgentsEnvironmentsListLogDetails;
  timeLabel?: string;
  availableEnvironments?: ComputerAgentsListAvailableEnvironment[];
  onEnvironmentClick?: (environment: ComputerAgentsListEnvironment) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
  const [sortMode, setSortMode] = useState<EnvironmentListSort>("name");
  const [openPopover, setOpenPopover] = useState<EnvironmentListPopover>(null);
  const [visibleCount, setVisibleCount] = useState(ENVIRONMENTS_LIST_PAGE_SIZE);
  const environments = useMemo(
    () => mergeEnvironmentsWithAvailableRecords(details.environments, availableEnvironments),
    [availableEnvironments, details.environments]
  );
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const profileOptions = useMemo(() => {
    const options = new Map<string, string>();
    environments.forEach((environment) => {
      if (!environment.profileId) return;
      options.set(environment.profileId, environment.profileLabel);
    });
    return [
      { id: "all", label: "All profiles" },
      ...Array.from(options.entries())
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([id, label]) => ({ id, label })),
    ];
  }, [environments]);
  const filteredEnvironments = useMemo(() => {
    const matchingProfile = profileFilter === "all"
      ? environments
      : environments.filter((environment) => environment.profileId === profileFilter);
    const matchingSearch = normalizedSearchQuery
      ? matchingProfile.filter((environment) => {
          const haystack = [
            environment.name,
            environment.description,
            environment.id,
            environment.profileLabel,
            environment.statusLabel,
          ].join(" ").toLowerCase();
          return haystack.includes(normalizedSearchQuery);
        })
      : matchingProfile;
    return sortEnvironments(matchingSearch, sortMode);
  }, [environments, normalizedSearchQuery, profileFilter, sortMode]);
  const visibleEnvironments = filteredEnvironments.slice(0, visibleCount);
  const hasMoreEnvironments = filteredEnvironments.length > visibleEnvironments.length;

  useEffect(() => {
    setVisibleCount(ENVIRONMENTS_LIST_PAGE_SIZE);
  }, [normalizedSearchQuery, profileFilter, sortMode]);

  const sortOptions: Array<{ id: EnvironmentListSort; label: string }> = [
    { id: "name", label: "Name" },
    { id: "profile", label: "Profile" },
    { id: "status", label: "Status" },
    { id: "cost", label: "CT cost" },
  ];
  const selectedSortLabel = sortOptions.find((option) => option.id === sortMode)?.label || "Name";
  const selectedProfileLabel = profileOptions.find((option) => option.id === profileFilter)?.label || "All profiles";

  function handleEnvironmentOpen(environment: ComputerAgentsListEnvironment) {
    if (typeof onEnvironmentClick === "function") {
      onEnvironmentClick(environment);
    }
  }

  return (
    <div className="tb-log-card tb-log-card-agent-list tb-log-card-environment-list">
      <LogHeader
        icon={<Monitor className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="List Computers"
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-log-agent-list-toolbar">
          <div className="tb-log-agent-list-summary">{getEnvironmentCountLabel(filteredEnvironments.length)}</div>
          <div className="tb-log-agent-list-controls">
            <div className="tb-log-agent-list-search-shell">
              <Search className="tb-log-agent-list-search-icon" strokeWidth={1.8} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="tb-log-agent-list-search"
                placeholder="Search Computers"
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
                  className={`tb-log-agent-list-control-button ${openPopover === "filter" || profileFilter !== "all" ? "is-active" : ""}`.trim()}
                  onClick={() => setOpenPopover((current) => current === "filter" ? null : "filter")}
                >
                  <SlidersHorizontal className="tb-log-agent-list-control-icon" strokeWidth={1.8} />
                  <span>Filter</span>
                </button>
                {openPopover === "filter" ? (
                  <div className="tb-log-agent-list-popup-menu">
                    <div className="tb-log-agent-list-popup-title">Profile</div>
                    {profileOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`tb-log-agent-list-popup-row ${profileFilter === option.id ? "selected" : ""}`.trim()}
                        onClick={() => {
                          setProfileFilter(option.id);
                          setOpenPopover(null);
                        }}
                      >
                        <span className="tb-log-agent-list-popup-check-slot">
                          {profileFilter === option.id ? <Check className="tb-log-agent-list-popup-check" strokeWidth={1.8} /> : null}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="tb-log-agent-list-active-filters" aria-live="polite">
            {sortMode !== "name" ? <span>{`Sorted by ${selectedSortLabel}`}</span> : null}
            {profileFilter !== "all" ? <span>{selectedProfileLabel}</span> : null}
          </div>
        </div>
        <div className="tb-log-agent-list-table-shell">
          {visibleEnvironments.length > 0 ? (
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
                  <th>Profile</th>
                  <th>Status</th>
                  <th className="is-right">CT per minute</th>
                </tr>
              </thead>
              <tbody>
                {visibleEnvironments.map((environment) => (
                  <tr
                    key={environment.id}
                    role={onEnvironmentClick ? "button" : undefined}
                    tabIndex={onEnvironmentClick ? 0 : undefined}
                    onClick={() => handleEnvironmentOpen(environment)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleEnvironmentOpen(environment);
                      }
                    }}
                  >
                    <td>
                      <div className="tb-log-agent-list-name-cell">
                        <span className="tb-log-agent-list-avatar" aria-hidden="true">
                          <HardDrive className="tb-log-agent-list-provider-fallback-icon" strokeWidth={1.8} />
                        </span>
                        <div className="tb-log-agent-list-name-copy">
                          <div className="tb-log-agent-list-name-title" title={environment.name}>{environment.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-model-cell">
                        <div className="tb-log-agent-list-model-copy">
                          <div className="tb-log-agent-list-model-provider" title="Compute profile">Compute profile</div>
                          <div className="tb-log-agent-list-model-name" title={environment.profileDescription}>{environment.profileLabel}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-context">{environment.statusLabel}</div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-cost">{environment.ctCostLabel}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="tb-log-agent-list-empty">
              {normalizedSearchQuery || profileFilter !== "all"
                ? "No matching computers found."
                : "No computers available."}
            </div>
          )}
        </div>
        {hasMoreEnvironments ? (
          <div className="tb-log-agent-list-more-row">
            <button
              type="button"
              className="tb-log-agent-list-load-more"
              onClick={() => setVisibleCount((current) => current + ENVIRONMENTS_LIST_PAGE_SIZE)}
            >
              Load more
            </button>
          </div>
        ) : null}
      </LogPanel>
    </div>
  );
}

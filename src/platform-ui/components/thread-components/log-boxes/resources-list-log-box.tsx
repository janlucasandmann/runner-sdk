import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Check,
  Code2,
  Cpu,
  Database,
  Globe,
  HardDrive,
  KeyRound,
  Search,
  Server,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import type { RunnerLog } from "../../../../types.js";
import { PlatformPopupSurface } from "../../composite/popup/index.js";
import { LogHeader, LogPanel } from "./log-card.js";
import { stripRunnerSystemTags } from "../shared/runner-markdown.js";

export type AppPlatformListResource = {
  id: string;
  name: string;
  description: string;
  resourceType: string;
  typeLabel: string;
  statusLabel: string;
  url: string;
  updatedAt: string;
  updatedLabel: string;
};

export type AppPlatformResourcesListLogDetails = {
  resources: AppPlatformListResource[];
};

type ResourceListSort = "name" | "type" | "status" | "updated";
type ResourceListPopover = "sort" | "filter" | null;

const RESOURCES_LIST_PAGE_SIZE = 5;

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

function isAppPlatformResourcesListCommand(command?: string): boolean {
  const normalized = stripRunnerSystemTags(String(command || "")).replace(/\s+/g, " ").trim();
  return /app-platform(?:\.py)?\s+resources\s+list\b/i.test(normalized);
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

function normalizeResourceDate(value: string): string {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}

function formatResourceUpdatedLabel(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "-";
  const elapsedMs = Date.now() - timestamp;
  if (elapsedMs < 60_000) return "Just now";
  if (elapsedMs < 60 * 60_000) return `${Math.max(1, Math.round(elapsedMs / 60_000))}m ago`;
  if (elapsedMs < 24 * 60 * 60_000) return `${Math.max(1, Math.round(elapsedMs / (60 * 60_000)))}h ago`;
  if (elapsedMs < 30 * 24 * 60 * 60_000) return `${Math.max(1, Math.round(elapsedMs / (24 * 60 * 60_000)))}d ago`;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: new Date(timestamp).getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    }).format(new Date(timestamp));
  } catch {
    return "-";
  }
}

function formatResourceTypeLabel(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/-/g, "_");
  if (normalized === "web_app" || normalized === "website") return "Web App";
  if (normalized === "function" || normalized === "cloud_function") return "Function";
  if (normalized === "database") return "Database";
  if (normalized === "auth" || normalized === "authentication") return "Auth";
  if (normalized === "agent_runtime") return "Agent Runtime";
  if (normalized === "secret" || normalized === "secrets") return "Secrets";
  if (normalized === "api") return "API";
  if (normalized === "server") return "Server";
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "Resource";
}

function formatResourceStatusLabel(record: Record<string, unknown>): string {
  const value = readRecordString(record, [
    "status",
    "state",
    "deploymentStatus",
    "deployment_status",
    "health",
  ]);
  if (!value) return "-";
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getResourceUrl(record: Record<string, unknown>): string {
  return (
    readRecordString(record, ["serviceUrl", "service_url", "publicUrl", "public_url", "url", "endpoint", "origin", "domain", "hostname"])
    || readNestedRecordString(record, [
      ["metadata", "serviceUrl"],
      ["metadata", "publicUrl"],
      ["metadata", "url"],
      ["deployment", "serviceUrl"],
      ["deployment", "url"],
    ])
  );
}

function normalizeResourceRecord(record: Record<string, unknown>): AppPlatformListResource | null {
  const id = readRecordString(record, ["id", "serverId", "server_id", "databaseId", "database_id", "resourceId", "resource_id", "uid"]);
  const rawName = readRecordString(record, ["name", "title", "displayName", "display_name"]);
  if (!id && !rawName) return null;

  const rawType =
    readRecordString(record, ["resourceType", "resource_type", "kind", "type", "serverKind", "server_kind"]) ||
    readNestedRecordString(record, [["metadata", "resourceType"], ["metadata", "kind"], ["metadata", "type"]]);
  const updatedAt = normalizeResourceDate(
    readRecordString(record, ["updatedAt", "updated_at", "lastUpdatedAt", "last_updated_at"])
    || readRecordString(record, ["createdAt", "created_at"])
  );

  return {
    id: id || rawName,
    name: rawName || id || "Untitled Resource",
    description:
      readRecordString(record, ["description", "summary", "summaryText", "summary_text"]) ||
      readNestedRecordString(record, [["metadata", "description"], ["metadata", "summary"]]),
    resourceType: rawType || "resource",
    typeLabel: formatResourceTypeLabel(rawType || "resource"),
    statusLabel: formatResourceStatusLabel(record),
    url: getResourceUrl(record),
    updatedAt,
    updatedLabel: formatResourceUpdatedLabel(updatedAt),
  };
}

function collectResourcesFromParsedValue(value: unknown, resources: AppPlatformListResource[]): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectResourcesFromParsedValue(entry, resources));
    return;
  }
  if (!isPlainRecord(value)) return;

  for (const container of [value.data, value.resources, value.servers, value.databases, value.items, value.results]) {
    if (Array.isArray(container)) {
      collectResourcesFromParsedValue(container, resources);
    }
  }

  const resource = normalizeResourceRecord(value);
  if (resource) {
    resources.push(resource);
  }
}

function collectJsonValueCandidates(text: string): unknown[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const candidates: unknown[] = [];
  try {
    candidates.push(JSON.parse(trimmed));
  } catch {}

  let objectStart = -1;
  let objectDepth = 0;
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

    if (char === "{") {
      if (objectDepth === 0) objectStart = index;
      objectDepth += 1;
      continue;
    }

    if (char === "}") {
      if (objectDepth <= 0) continue;
      objectDepth -= 1;
      if (objectDepth === 0 && objectStart >= 0) {
        const candidate = text.slice(objectStart, index + 1);
        objectStart = -1;
        try {
          candidates.push(JSON.parse(candidate));
        } catch {}
      }
    }
  }

  return candidates;
}

function dedupeResources(resources: AppPlatformListResource[]): AppPlatformListResource[] {
  const seen = new Set<string>();
  const result: AppPlatformListResource[] = [];
  for (const resource of resources) {
    const key = resource.id || `${resource.resourceType}:${resource.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(resource);
  }
  return result;
}

function parseResourcesListOutput(output: string): AppPlatformListResource[] {
  const resources: AppPlatformListResource[] = [];
  for (const parsedValue of collectJsonValueCandidates(output)) {
    collectResourcesFromParsedValue(parsedValue, resources);
  }
  return dedupeResources(resources);
}

export function parseAppPlatformResourcesListLogDetails(log: RunnerLog): AppPlatformResourcesListLogDetails | null {
  if (log.eventType !== "command_execution" && log.eventType !== "mcp_tool_call") return null;
  if (!isAppPlatformResourcesListCommand(getCommandText(log))) return null;
  if (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) return null;

  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  if (parsedOutput?.returnCodeInterpretation === "timeout" || parsedOutput?.interrupted) return null;

  return { resources: parseResourcesListOutput(getCommandOutputText(log)) };
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function getResourceUpdatedTimestamp(resource: AppPlatformListResource): number {
  const timestamp = Date.parse(resource.updatedAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortResources(resources: AppPlatformListResource[], sortMode: ResourceListSort): AppPlatformListResource[] {
  const sorted = resources.slice();
  sorted.sort((left, right) => {
    if (sortMode === "type") {
      return left.typeLabel.localeCompare(right.typeLabel) || left.name.localeCompare(right.name);
    }
    if (sortMode === "status") {
      return left.statusLabel.localeCompare(right.statusLabel) || left.name.localeCompare(right.name);
    }
    if (sortMode === "updated") {
      return getResourceUpdatedTimestamp(right) - getResourceUpdatedTimestamp(left) || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });
  return sorted;
}

function getResourceCountLabel(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? "Resource" : "Resources"}`;
}

function getResourceIcon(resourceType: string) {
  const normalized = resourceType.trim().toLowerCase().replace(/-/g, "_");
  if (normalized === "web_app" || normalized === "website") return <Globe className="tb-log-card-small-icon" strokeWidth={1.5} />;
  if (normalized === "function" || normalized === "cloud_function") return <Code2 className="tb-log-card-small-icon" strokeWidth={1.5} />;
  if (normalized === "database") return <Database className="tb-log-card-small-icon" strokeWidth={1.5} />;
  if (normalized === "auth" || normalized === "authentication") return <KeyRound className="tb-log-card-small-icon" strokeWidth={1.5} />;
  if (normalized === "agent_runtime") return <Cpu className="tb-log-card-small-icon" strokeWidth={1.5} />;
  if (normalized === "secret" || normalized === "secrets") return <Shield className="tb-log-card-small-icon" strokeWidth={1.5} />;
  return <HardDrive className="tb-log-card-small-icon" strokeWidth={1.5} />;
}

export function AppPlatformResourcesListLogBox({
  details,
  timeLabel,
}: {
  details: AppPlatformResourcesListLogDetails;
  timeLabel?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortMode, setSortMode] = useState<ResourceListSort>("updated");
  const [openPopover, setOpenPopover] = useState<ResourceListPopover>(null);
  const [visibleCount, setVisibleCount] = useState(RESOURCES_LIST_PAGE_SIZE);
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const typeOptions = useMemo(() => {
    const options = new Map<string, string>();
    details.resources.forEach((resource) => {
      options.set(resource.resourceType || resource.typeLabel, resource.typeLabel || "Resource");
    });
    return [
      { id: "all", label: "All types" },
      ...Array.from(options.entries())
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([id, label]) => ({ id, label })),
    ];
  }, [details.resources]);
  const filteredResources = useMemo(() => {
    const matchingType = typeFilter === "all"
      ? details.resources
      : details.resources.filter((resource) => (resource.resourceType || resource.typeLabel) === typeFilter);
    const matchingSearch = normalizedSearchQuery
      ? matchingType.filter((resource) => {
          const haystack = [
            resource.name,
            resource.description,
            resource.id,
            resource.typeLabel,
            resource.statusLabel,
            resource.url,
          ].join(" ").toLowerCase();
          return haystack.includes(normalizedSearchQuery);
        })
      : matchingType;
    return sortResources(matchingSearch, sortMode);
  }, [details.resources, normalizedSearchQuery, sortMode, typeFilter]);
  const visibleResources = filteredResources.slice(0, visibleCount);
  const hasMoreResources = filteredResources.length > visibleResources.length;

  useEffect(() => {
    setVisibleCount(RESOURCES_LIST_PAGE_SIZE);
  }, [normalizedSearchQuery, sortMode, typeFilter]);

  const sortOptions: Array<{ id: ResourceListSort; label: string }> = [
    { id: "updated", label: "Updated" },
    { id: "name", label: "Name" },
    { id: "type", label: "Type" },
    { id: "status", label: "Status" },
  ];
  const selectedSortLabel = sortOptions.find((option) => option.id === sortMode)?.label || "Updated";
  const selectedTypeLabel = typeOptions.find((option) => option.id === typeFilter)?.label || "All types";

  return (
    <div className="tb-log-card tb-log-card-agent-list tb-log-card-resources-list">
      <LogHeader
        icon={<Server className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="List Resources"
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-log-agent-list-toolbar">
          <div className="tb-log-agent-list-summary">{getResourceCountLabel(filteredResources.length)}</div>
          <div className="tb-log-agent-list-controls">
            <div className="tb-log-agent-list-search-shell">
              <Search className="tb-log-agent-list-search-icon" strokeWidth={1.8} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="tb-log-agent-list-search"
                placeholder="Search resources"
              />
            </div>
            <div className="tb-log-agent-list-toolbar-controls">
              <div className="tb-log-agent-list-popup-shell">
                <button
                  type="button"
                  className={`tb-log-agent-list-control-button ${openPopover === "sort" || sortMode !== "updated" ? "is-active" : ""}`.trim()}
                  onClick={() => setOpenPopover((current) => current === "sort" ? null : "sort")}
                >
                  <ArrowUpDown className="tb-log-agent-list-control-icon" strokeWidth={1.8} />
                  <span>Sort</span>
                </button>
                {openPopover === "sort" ? (
                  <PlatformPopupSurface className="tb-log-agent-list-popup-menu">
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
                  </PlatformPopupSurface>
                ) : null}
              </div>
              <div className="tb-log-agent-list-popup-shell">
                <button
                  type="button"
                  className={`tb-log-agent-list-control-button ${openPopover === "filter" || typeFilter !== "all" ? "is-active" : ""}`.trim()}
                  onClick={() => setOpenPopover((current) => current === "filter" ? null : "filter")}
                >
                  <SlidersHorizontal className="tb-log-agent-list-control-icon" strokeWidth={1.8} />
                  <span>Filter</span>
                </button>
                {openPopover === "filter" ? (
                  <PlatformPopupSurface className="tb-log-agent-list-popup-menu">
                    <div className="tb-log-agent-list-popup-title">Type</div>
                    {typeOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`tb-log-agent-list-popup-row ${typeFilter === option.id ? "selected" : ""}`.trim()}
                        onClick={() => {
                          setTypeFilter(option.id);
                          setOpenPopover(null);
                        }}
                      >
                        <span className="tb-log-agent-list-popup-check-slot">
                          {typeFilter === option.id ? <Check className="tb-log-agent-list-popup-check" strokeWidth={1.8} /> : null}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </PlatformPopupSurface>
                ) : null}
              </div>
            </div>
          </div>
          <div className="tb-log-agent-list-active-filters" aria-live="polite">
            {sortMode !== "updated" ? <span>{`Sort: ${selectedSortLabel}`}</span> : null}
            {typeFilter !== "all" ? <span>{`Type: ${selectedTypeLabel}`}</span> : null}
          </div>
        </div>
        <div className="tb-log-agent-list-table-shell">
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
                <th>Type</th>
                <th>Status</th>
                <th className="is-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {visibleResources.length > 0 ? (
                visibleResources.map((resource) => (
                  <tr key={`${resource.resourceType}:${resource.id}`}>
                    <td>
                      <div className="tb-log-agent-list-name-cell">
                        <span className="tb-log-agent-list-avatar">
                          {getResourceIcon(resource.resourceType)}
                        </span>
                        <div className="tb-log-agent-list-name-copy">
                          <div className="tb-log-agent-list-name-title" title={resource.name}>{resource.name}</div>
                          {resource.url ? <div className="tb-log-agent-list-model-provider" title={resource.url}>{resource.url}</div> : null}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-model-name">{resource.typeLabel}</div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-context">{resource.statusLabel}</div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-cost">{resource.updatedLabel}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="tb-log-agent-list-empty">No resources were parsed.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {hasMoreResources || visibleCount > RESOURCES_LIST_PAGE_SIZE ? (
          <div className="tb-log-agent-list-more-row tb-log-file-list-more-row">
            <div className="tb-log-file-list-more-summary">
              {`Showing ${visibleResources.length.toLocaleString()} of ${filteredResources.length.toLocaleString()} Resources`}
            </div>
            <div className="tb-log-file-list-more-actions">
              {visibleCount > RESOURCES_LIST_PAGE_SIZE ? (
                <button
                  type="button"
                  className="tb-log-agent-list-load-more"
                  onClick={() => setVisibleCount(RESOURCES_LIST_PAGE_SIZE)}
                >
                  Collapse
                </button>
              ) : null}
              {hasMoreResources ? (
                <button
                  type="button"
                  className="tb-log-agent-list-load-more"
                  onClick={() => setVisibleCount((count) => count + RESOURCES_LIST_PAGE_SIZE)}
                >
                  Load more
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </LogPanel>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Check, Monitor, Rocket, Search, SlidersHorizontal } from "lucide-react";
import type { RunnerLog } from "../types.js";
import { LogHeader, LogPanel } from "./runner-log-card.js";
import { stripRunnerSystemTags } from "./runner-markdown.js";

export type TaskManagementListProject = {
  id: string;
  name: string;
  description: string;
  defaultEnvironmentId: string;
  defaultEnvironmentName: string;
  openTasksLabel: string;
  openTasksValue: number | null;
  updatedAt: string;
  updatedLabel: string;
};

export type TaskManagementProjectsListLogDetails = {
  projects: TaskManagementListProject[];
};

export type TaskManagementListAvailableProject = unknown;
export type TaskManagementListAvailableEnvironment = unknown;

type ProjectListSort = "name" | "computer" | "openTasks" | "updated";
type ProjectListPopover = "sort" | "filter" | null;

const PROJECTS_LIST_PAGE_SIZE = 5;

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

function isTaskManagementProjectsListCommand(command?: string): boolean {
  const normalized = stripRunnerSystemTags(String(command || "")).replace(/\s+/g, " ").trim();
  return /manage-tasks(?:\.py)?\s+projects\s+list\b/i.test(normalized);
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

function normalizeProjectDate(value: string): string {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}

function formatProjectUpdatedLabel(value: string): string {
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

function getProjectOpenTasks(record: Record<string, unknown>): { label: string; value: number | null } {
  const openTasks = readRecordNumber(record, ["openTasksCount", "openTaskCount", "open_tasks_count", "open_task_count"]) ??
    readNestedRecordNumber(record, [["summary", "openTasksCount"], ["summary", "openTaskCount"], ["metadata", "summary", "openTasksCount"]]);
  const totalTasks = readRecordNumber(record, ["tasksCount", "taskCount", "tasks_count", "task_count"]) ??
    readNestedRecordNumber(record, [["summary", "tasksCount"], ["summary", "taskCount"], ["metadata", "summary", "tasksCount"]]);

  if (openTasks == null && totalTasks == null) {
    return { label: "-", value: null };
  }
  if (openTasks != null && totalTasks != null) {
    return { label: `${Math.max(0, openTasks)} / ${Math.max(0, totalTasks)}`, value: Math.max(0, openTasks) };
  }
  if (openTasks != null) {
    return { label: `${Math.max(0, openTasks)} open`, value: Math.max(0, openTasks) };
  }
  return { label: `${Math.max(0, totalTasks || 0)} total`, value: 0 };
}

function normalizeProjectRecord(record: Record<string, unknown>): TaskManagementListProject | null {
  const id = readRecordString(record, ["id", "projectId", "project_id", "uid"]);
  const rawName = readRecordString(record, ["name", "title", "displayName", "display_name"]);
  if (!id && !rawName) return null;

  const defaultEnvironmentId =
    readRecordString(record, ["defaultEnvironmentId", "default_environment_id", "environmentId", "environment_id"]) ||
    readNestedRecordString(record, [["metadata", "defaultEnvironmentId"], ["metadata", "default_environment_id"]]);
  const defaultEnvironmentName =
    readRecordString(record, ["defaultEnvironmentName", "default_environment_name", "environmentName", "environment_name"]) ||
    readNestedRecordString(record, [["defaultEnvironment", "name"], ["environment", "name"], ["metadata", "defaultEnvironmentName"]]);
  const updatedAt = normalizeProjectDate(readRecordString(record, ["updatedAt", "updated_at"]) || readRecordString(record, ["createdAt", "created_at"]));
  const openTasks = getProjectOpenTasks(record);

  return {
    id: id || rawName,
    name: rawName || id || "Untitled Project",
    description:
      readRecordString(record, ["description", "summaryText", "summary_text"]) ||
      readNestedRecordString(record, [["metadata", "description"], ["metadata", "summary"]]),
    defaultEnvironmentId,
    defaultEnvironmentName,
    openTasksLabel: openTasks.label,
    openTasksValue: openTasks.value,
    updatedAt,
    updatedLabel: formatProjectUpdatedLabel(updatedAt),
  };
}

function collectProjectsFromParsedValue(value: unknown, projects: TaskManagementListProject[]): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectProjectsFromParsedValue(entry, projects));
    return;
  }
  if (!isPlainRecord(value)) return;

  const containers = [value.data, value.projects, value.items, value.results];
  for (const container of containers) {
    if (Array.isArray(container)) {
      collectProjectsFromParsedValue(container, projects);
    }
  }

  const project = normalizeProjectRecord(value);
  if (project) {
    projects.push(project);
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

function dedupeProjects(projects: TaskManagementListProject[]): TaskManagementListProject[] {
  const seen = new Set<string>();
  const result: TaskManagementListProject[] = [];
  for (const project of projects) {
    const key = project.id || project.name;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(project);
  }
  return result;
}

function parseProjectsListOutput(output: string): TaskManagementListProject[] {
  const projects: TaskManagementListProject[] = [];
  for (const parsedValue of collectJsonValueCandidates(output)) {
    collectProjectsFromParsedValue(parsedValue, projects);
  }
  return dedupeProjects(projects);
}

export function parseTaskManagementProjectsListLogDetails(log: RunnerLog): TaskManagementProjectsListLogDetails | null {
  if (log.eventType !== "command_execution") return null;
  if (!isTaskManagementProjectsListCommand(getCommandText(log))) return null;
  if (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) return null;

  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  if (parsedOutput?.returnCodeInterpretation === "timeout" || parsedOutput?.interrupted) return null;

  return { projects: parseProjectsListOutput(getCommandOutputText(log)) };
}

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

function buildEnvironmentLookup(availableEnvironments: TaskManagementListAvailableEnvironment[] | undefined): Map<string, string> {
  const lookup = new Map<string, string>();
  (Array.isArray(availableEnvironments) ? availableEnvironments : []).forEach((environment) => {
    if (!isPlainRecord(environment)) return;
    const id = readRecordString(environment, ["id", "environmentId", "environment_id"]);
    const name = readRecordString(environment, ["name", "title"]);
    if (id && name) lookup.set(id, name);
  });
  return lookup;
}

function buildProjectLookup(availableProjects: TaskManagementListAvailableProject[] | undefined): Map<string, Record<string, unknown>> {
  const lookup = new Map<string, Record<string, unknown>>();
  (Array.isArray(availableProjects) ? availableProjects : []).forEach((project) => {
    if (!isPlainRecord(project)) return;
    const id = readRecordString(project, ["id", "projectId", "project_id"]);
    const name = readRecordString(project, ["name", "title"]);
    if (id) lookup.set(`id:${id}`, project);
    if (name) lookup.set(`name:${normalizeLookupKey(name)}`, project);
  });
  return lookup;
}

function enrichProject(
  project: TaskManagementListProject,
  availableRecord: Record<string, unknown> | undefined,
  environmentNamesById: Map<string, string>
): TaskManagementListProject {
  const normalizedAvailable = availableRecord ? normalizeProjectRecord(availableRecord) : null;
  const merged = normalizedAvailable ? {
    ...project,
    name: normalizedAvailable.name || project.name,
    description: normalizedAvailable.description || project.description,
    defaultEnvironmentId: normalizedAvailable.defaultEnvironmentId || project.defaultEnvironmentId,
    defaultEnvironmentName: normalizedAvailable.defaultEnvironmentName || project.defaultEnvironmentName,
    openTasksLabel: project.openTasksValue == null ? normalizedAvailable.openTasksLabel : project.openTasksLabel,
    openTasksValue: project.openTasksValue == null ? normalizedAvailable.openTasksValue : project.openTasksValue,
    updatedAt: project.updatedAt || normalizedAvailable.updatedAt,
    updatedLabel: project.updatedAt ? project.updatedLabel : normalizedAvailable.updatedLabel,
  } : project;
  const environmentName = merged.defaultEnvironmentName || environmentNamesById.get(merged.defaultEnvironmentId) || "";
  return {
    ...merged,
    defaultEnvironmentName: environmentName || "None",
  };
}

function mergeProjectsWithAvailableRecords(
  projects: TaskManagementListProject[],
  availableProjects: TaskManagementListAvailableProject[] | undefined,
  availableEnvironments: TaskManagementListAvailableEnvironment[] | undefined
): TaskManagementListProject[] {
  const projectLookup = buildProjectLookup(availableProjects);
  const environmentNamesById = buildEnvironmentLookup(availableEnvironments);
  const merged = projects.map((project) => {
    const byId = project.id ? projectLookup.get(`id:${project.id}`) : undefined;
    const byName = project.name ? projectLookup.get(`name:${normalizeLookupKey(project.name)}`) : undefined;
    return enrichProject(project, byId || byName, environmentNamesById);
  });
  const seen = new Set(merged.flatMap((project) => [
    project.id ? `id:${project.id}` : "",
    project.name ? `name:${normalizeLookupKey(project.name)}` : "",
  ]).filter(Boolean));

  (Array.isArray(availableProjects) ? availableProjects : []).forEach((availableProject) => {
    if (!isPlainRecord(availableProject)) return;
    const normalized = normalizeProjectRecord(availableProject);
    if (!normalized) return;
    const keys = [
      normalized.id ? `id:${normalized.id}` : "",
      normalized.name ? `name:${normalizeLookupKey(normalized.name)}` : "",
    ].filter(Boolean);
    if (keys.some((key) => seen.has(key))) return;
    keys.forEach((key) => seen.add(key));
    merged.push(enrichProject(normalized, undefined, environmentNamesById));
  });

  return merged;
}

function getProjectCountLabel(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? "Project" : "Projects"}`;
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function getProjectUpdatedTimestamp(project: TaskManagementListProject): number {
  const timestamp = Date.parse(project.updatedAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortProjects(projects: TaskManagementListProject[], sortMode: ProjectListSort): TaskManagementListProject[] {
  const sorted = projects.slice();
  sorted.sort((left, right) => {
    if (sortMode === "computer") {
      const result = left.defaultEnvironmentName.localeCompare(right.defaultEnvironmentName);
      return result || left.name.localeCompare(right.name);
    }
    if (sortMode === "openTasks") {
      const leftCount = left.openTasksValue ?? Number.MAX_SAFE_INTEGER;
      const rightCount = right.openTasksValue ?? Number.MAX_SAFE_INTEGER;
      return leftCount - rightCount || left.name.localeCompare(right.name);
    }
    if (sortMode === "updated") {
      return getProjectUpdatedTimestamp(right) - getProjectUpdatedTimestamp(left) || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });
  return sorted;
}

export function TaskManagementProjectsListLogBox({
  details,
  timeLabel,
  availableProjects,
  availableEnvironments,
  onProjectClick,
}: {
  details: TaskManagementProjectsListLogDetails;
  timeLabel?: string;
  availableProjects?: TaskManagementListAvailableProject[];
  availableEnvironments?: TaskManagementListAvailableEnvironment[];
  onProjectClick?: (project: TaskManagementListProject) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [computerFilter, setComputerFilter] = useState("all");
  const [sortMode, setSortMode] = useState<ProjectListSort>("name");
  const [openPopover, setOpenPopover] = useState<ProjectListPopover>(null);
  const [visibleCount, setVisibleCount] = useState(PROJECTS_LIST_PAGE_SIZE);
  const projects = useMemo(
    () => mergeProjectsWithAvailableRecords(details.projects, availableProjects, availableEnvironments),
    [availableEnvironments, availableProjects, details.projects]
  );
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const computerOptions = useMemo(() => {
    const options = new Map<string, string>();
    projects.forEach((project) => {
      const id = project.defaultEnvironmentId || "__none__";
      options.set(id, project.defaultEnvironmentName || "None");
    });
    return [
      { id: "all", label: "All computers" },
      ...Array.from(options.entries())
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([id, label]) => ({ id, label })),
    ];
  }, [projects]);
  const filteredProjects = useMemo(() => {
    const matchingComputer = computerFilter === "all"
      ? projects
      : projects.filter((project) => (project.defaultEnvironmentId || "__none__") === computerFilter);
    const matchingSearch = normalizedSearchQuery
      ? matchingComputer.filter((project) => {
          const haystack = [
            project.name,
            project.description,
            project.id,
            project.defaultEnvironmentName,
            project.openTasksLabel,
          ].join(" ").toLowerCase();
          return haystack.includes(normalizedSearchQuery);
        })
      : matchingComputer;
    return sortProjects(matchingSearch, sortMode);
  }, [computerFilter, normalizedSearchQuery, projects, sortMode]);
  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMoreProjects = filteredProjects.length > visibleProjects.length;

  useEffect(() => {
    setVisibleCount(PROJECTS_LIST_PAGE_SIZE);
  }, [computerFilter, normalizedSearchQuery, sortMode]);

  const sortOptions: Array<{ id: ProjectListSort; label: string }> = [
    { id: "name", label: "Name" },
    { id: "computer", label: "Computer" },
    { id: "openTasks", label: "Open tasks" },
    { id: "updated", label: "Updated" },
  ];
  const selectedSortLabel = sortOptions.find((option) => option.id === sortMode)?.label || "Name";
  const selectedComputerLabel = computerOptions.find((option) => option.id === computerFilter)?.label || "All computers";

  function handleProjectOpen(project: TaskManagementListProject) {
    if (typeof onProjectClick === "function") {
      onProjectClick(project);
    }
  }

  return (
    <div className="tb-log-card tb-log-card-agent-list tb-log-card-project-list">
      <LogHeader
        icon={<Rocket className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="List Projects"
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-log-agent-list-toolbar">
          <div className="tb-log-agent-list-summary">{getProjectCountLabel(filteredProjects.length)}</div>
          <div className="tb-log-agent-list-controls">
            <div className="tb-log-agent-list-search-shell">
              <Search className="tb-log-agent-list-search-icon" strokeWidth={1.8} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="tb-log-agent-list-search"
                placeholder="Search projects"
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
                  className={`tb-log-agent-list-control-button ${openPopover === "filter" || computerFilter !== "all" ? "is-active" : ""}`.trim()}
                  onClick={() => setOpenPopover((current) => current === "filter" ? null : "filter")}
                >
                  <SlidersHorizontal className="tb-log-agent-list-control-icon" strokeWidth={1.8} />
                  <span>Filter</span>
                </button>
                {openPopover === "filter" ? (
                  <div className="tb-log-agent-list-popup-menu">
                    <div className="tb-log-agent-list-popup-title">Computer</div>
                    {computerOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`tb-log-agent-list-popup-row ${computerFilter === option.id ? "selected" : ""}`.trim()}
                        onClick={() => {
                          setComputerFilter(option.id);
                          setOpenPopover(null);
                        }}
                      >
                        <span className="tb-log-agent-list-popup-check-slot">
                          {computerFilter === option.id ? <Check className="tb-log-agent-list-popup-check" strokeWidth={1.8} /> : null}
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
            {computerFilter !== "all" ? <span>{selectedComputerLabel}</span> : null}
          </div>
        </div>
        <div className="tb-log-agent-list-table-shell">
          {visibleProjects.length > 0 ? (
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
                  <th>Computer</th>
                  <th>Open tasks</th>
                  <th className="is-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {visibleProjects.map((project) => (
                  <tr
                    key={project.id}
                    role={onProjectClick ? "button" : undefined}
                    tabIndex={onProjectClick ? 0 : undefined}
                    onClick={() => handleProjectOpen(project)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleProjectOpen(project);
                      }
                    }}
                  >
                    <td>
                      <div className="tb-log-agent-list-name-cell">
                        <span className="tb-log-agent-list-avatar" aria-hidden="true">
                          <Rocket className="tb-log-agent-list-provider-fallback-icon" strokeWidth={1.8} />
                        </span>
                        <div className="tb-log-agent-list-name-copy">
                          <div className="tb-log-agent-list-name-title" title={project.name}>{project.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-model-cell">
                        <span className="tb-log-agent-list-provider-icon-shell" aria-hidden="true">
                          <Monitor className="tb-log-agent-list-provider-fallback-icon" strokeWidth={1.8} />
                        </span>
                        <div className="tb-log-agent-list-model-copy">
                          <div className="tb-log-agent-list-model-provider" title="Default computer">Default computer</div>
                          <div className="tb-log-agent-list-model-name" title={project.defaultEnvironmentName}>{project.defaultEnvironmentName}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-context">{project.openTasksLabel}</div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-cost" title={project.updatedAt ? new Date(project.updatedAt).toLocaleString() : ""}>
                        {project.updatedLabel}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="tb-log-agent-list-empty">
              {normalizedSearchQuery || computerFilter !== "all"
                ? "No matching projects found."
                : "No projects available."}
            </div>
          )}
        </div>
        {hasMoreProjects ? (
          <div className="tb-log-agent-list-more-row">
            <button
              type="button"
              className="tb-log-agent-list-load-more"
              onClick={() => setVisibleCount((current) => current + PROJECTS_LIST_PAGE_SIZE)}
            >
              Load more
            </button>
          </div>
        ) : null}
      </LogPanel>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Check, MessageSquare, Search, SlidersHorizontal } from "lucide-react";
import type { RunnerLog } from "../types.js";
import type { ComputerAgentsListAvailableAgent } from "./runner-agents-list-log-box.js";
import { LogHeader, LogPanel } from "./runner-log-card.js";
import { stripRunnerSystemTags } from "./runner-markdown.js";

export type ComputerAgentsListThread = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  agentId: string;
  agentName: string;
  agentPhotoUrl: string;
  environmentName?: string;
  projectName?: string;
  taskTitle?: string;
  createdAt?: string;
  createdLabel?: string;
  updatedAt: string;
  updatedLabel: string;
  messageCountLabel: string;
  messageCountValue: number | null;
};

export type ComputerAgentsThreadsListLogDetails = {
  threads: ComputerAgentsListThread[];
};

export type ComputerAgentsThreadGetLogDetails = {
  thread: ComputerAgentsListThread;
};

type ThreadListSort = "updated" | "title" | "status" | "agent";
type ThreadListPopover = "sort" | "filter" | null;

const THREADS_LIST_PAGE_SIZE = 5;

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

function isComputerAgentsThreadsListCommand(command?: string): boolean {
  const normalized = stripRunnerSystemTags(String(command || "")).replace(/\s+/g, " ").trim();
  return /computer-agents(?:\.py)?\s+threads\s+list\b/i.test(normalized);
}

function isComputerAgentsThreadGetCommand(command?: string): boolean {
  const normalized = stripRunnerSystemTags(String(command || "")).replace(/\s+/g, " ").trim();
  return /computer-agents(?:\.py)?\s+threads\s+get\s+thread[_-][^\s]+/i.test(normalized);
}

function getThreadIdFromGetCommand(command?: string): string {
  const normalized = stripRunnerSystemTags(String(command || "")).replace(/\s+/g, " ").trim();
  const match = /computer-agents(?:\.py)?\s+threads\s+get\s+(thread[_-][^\s]+)/i.exec(normalized);
  return match?.[1]?.replace(/[;,]+$/g, "") || "";
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

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase();
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

function getFallbackAgentPhotoUrl(agentName: string, agentId: string): string {
  const normalizedName = agentName.trim().toLowerCase();
  const normalizedId = agentId.trim().toLowerCase();
  if (normalizedName === "developer" || normalizedId === "agent_default" || normalizedId === "agent-default") {
    return "/img/agent-profile-pics/devastro.webp";
  }
  if (normalizedName.includes("research") || normalizedId.includes("research")) {
    return "/img/agent-profile-pics/researchastro.webp";
  }
  return "/img/agent-profile-pics/assistantastro-1.webp";
}

function normalizeThreadDate(value: string): string {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}

function formatThreadUpdatedLabel(value: string): string {
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

function formatThreadDateLabel(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "-";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      year: new Date(timestamp).getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    }).format(new Date(timestamp));
  } catch {
    return "-";
  }
}

function formatThreadStatusLabel(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "Unknown";
  if (normalized === "permission_asked") return "Permission Asked";
  return normalized
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getThreadMessageCount(record: Record<string, unknown>): { label: string; value: number | null } {
  const count =
    readRecordNumber(record, ["messageCount", "messagesCount", "message_count", "messages_count", "turnCount", "turn_count"]) ??
    readNestedRecordNumber(record, [
      ["summary", "messageCount"],
      ["summary", "messagesCount"],
      ["metadata", "messageCount"],
      ["metadata", "messagesCount"],
    ]);
  if (count == null) return { label: "-", value: null };
  const normalized = Math.max(0, count);
  return { label: `${normalized.toLocaleString()} ${normalized === 1 ? "message" : "messages"}`, value: normalized };
}

function normalizeThreadRecord(record: Record<string, unknown>): ComputerAgentsListThread | null {
  const id = readRecordString(record, ["id", "threadId", "thread_id", "uid"]);
  if (!id || !/^thread[_-]/i.test(id)) return null;

  const rawTitle =
    readRecordString(record, ["title", "name", "summary", "subject", "firstMessage", "first_message"]) ||
    readNestedRecordString(record, [
      ["metadata", "title"],
      ["metadata", "summary"],
      ["metadata", "firstMessage"],
      ["task", "title"],
      ["project", "name"],
    ]);
  const rawStatus = readRecordString(record, ["status", "state", "displayStatus", "display_status"]) ||
    readNestedRecordString(record, [["metadata", "status"], ["metadata", "state"]]);
  const agentName =
    readRecordString(record, ["agentName", "agent_name", "assistantName", "assistant_name", "assigneeName", "assignee_name"]) ||
    readNestedRecordString(record, [["agent", "name"], ["assistant", "name"], ["assignee", "name"], ["metadata", "agentName"]]);
  const agentId =
    readRecordString(record, ["agentId", "agent_id", "assistantId", "assistant_id", "assigneeId", "assignee_id"]) ||
    readNestedRecordString(record, [["agent", "id"], ["assistant", "id"], ["assignee", "id"], ["metadata", "agentId"]]);
  const agentPhotoUrl =
    getExplicitAgentPhotoUrl(record) ||
    readNestedRecordString(record, [
      ["agent", "photoUrl"],
      ["agent", "avatarUrl"],
      ["assistant", "photoUrl"],
      ["assistant", "avatarUrl"],
      ["assignee", "photoUrl"],
      ["assignee", "avatarUrl"],
    ]);
  const updatedAt = normalizeThreadDate(
    readRecordString(record, ["updatedAt", "updated_at", "lastMessageAt", "last_message_at", "completedAt", "completed_at"]) ||
      readRecordString(record, ["createdAt", "created_at"])
  );
  const createdAt = normalizeThreadDate(readRecordString(record, ["createdAt", "created_at", "startedAt", "started_at"]));
  const environmentName =
    readRecordString(record, ["environmentName", "environment_name", "computerName", "computer_name"]) ||
    readNestedRecordString(record, [
      ["environment", "name"],
      ["computer", "name"],
      ["metadata", "environmentName"],
      ["metadata", "computerName"],
    ]);
  const projectName =
    readRecordString(record, ["projectName", "project_name"]) ||
    readNestedRecordString(record, [
      ["project", "name"],
      ["project", "title"],
      ["task", "projectName"],
      ["metadata", "projectName"],
    ]);
  const taskTitle =
    readRecordString(record, ["taskTitle", "task_title", "ticketTitle", "ticket_title"]) ||
    readNestedRecordString(record, [
      ["task", "title"],
      ["ticket", "title"],
      ["metadata", "taskTitle"],
      ["metadata", "ticketTitle"],
    ]);
  const messageCount = getThreadMessageCount(record);

  return {
    id,
    title: rawTitle || id,
    status: rawStatus || "unknown",
    statusLabel: formatThreadStatusLabel(rawStatus),
    agentId,
    agentName: agentName || "Unknown",
    agentPhotoUrl: normalizePhotoUrl(agentPhotoUrl) || getFallbackAgentPhotoUrl(agentName, agentId),
    environmentName,
    projectName,
    taskTitle,
    createdAt,
    createdLabel: formatThreadDateLabel(createdAt),
    updatedAt,
    updatedLabel: formatThreadUpdatedLabel(updatedAt),
    messageCountLabel: messageCount.label,
    messageCountValue: messageCount.value,
  };
}

function collectThreadsFromParsedValue(value: unknown, threads: ComputerAgentsListThread[]): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectThreadsFromParsedValue(entry, threads));
    return;
  }
  if (!isPlainRecord(value)) return;

  const containers = [value.data, value.threads, value.items, value.results];
  for (const container of containers) {
    if (Array.isArray(container)) {
      collectThreadsFromParsedValue(container, threads);
    } else if (isPlainRecord(container)) {
      collectThreadsFromParsedValue(container, threads);
    }
  }

  const thread = normalizeThreadRecord(value);
  if (thread) {
    threads.push(thread);
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

function readJsonStringFieldFromText(text: string, fieldName: string): string {
  const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`"${escapedFieldName}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "i").exec(text);
  if (!match) return "";
  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return match[1].replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
  }
}

function parseThreadRecordsFromPartialJsonText(text: string): ComputerAgentsListThread[] {
  const threads: ComputerAgentsListThread[] = [];
  const idMatches = Array.from(text.matchAll(/"(?:id|threadId|thread_id)"\s*:\s*"(thread[_-][^"]+)"/gi));
  for (let index = 0; index < idMatches.length; index += 1) {
    const startIndex = idMatches[index]?.index ?? 0;
    const endIndex = idMatches[index + 1]?.index ?? text.length;
    const recordText = text.slice(startIndex, endIndex);
    const id = readJsonStringFieldFromText(`{${recordText}`, "id") ||
      readJsonStringFieldFromText(`{${recordText}`, "threadId") ||
      readJsonStringFieldFromText(`{${recordText}`, "thread_id");
    if (!id || !/^thread[_-]/i.test(id)) continue;
    const normalized = normalizeThreadRecord({
      id,
      title: readJsonStringFieldFromText(`{${recordText}`, "title") ||
        readJsonStringFieldFromText(`{${recordText}`, "name") ||
        readJsonStringFieldFromText(`{${recordText}`, "summary"),
      status: readJsonStringFieldFromText(`{${recordText}`, "status") || readJsonStringFieldFromText(`{${recordText}`, "state"),
      agentId: readJsonStringFieldFromText(`{${recordText}`, "agentId") ||
        readJsonStringFieldFromText(`{${recordText}`, "agent_id") ||
        readJsonStringFieldFromText(`{${recordText}`, "assistantId"),
      agentName: readJsonStringFieldFromText(`{${recordText}`, "agentName") ||
        readJsonStringFieldFromText(`{${recordText}`, "agent_name") ||
        readJsonStringFieldFromText(`{${recordText}`, "assistantName"),
      photoUrl: readJsonStringFieldFromText(`{${recordText}`, "photoUrl") ||
        readJsonStringFieldFromText(`{${recordText}`, "avatarUrl"),
      updatedAt: readJsonStringFieldFromText(`{${recordText}`, "updatedAt") ||
        readJsonStringFieldFromText(`{${recordText}`, "updated_at") ||
        readJsonStringFieldFromText(`{${recordText}`, "createdAt") ||
        readJsonStringFieldFromText(`{${recordText}`, "created_at"),
    });
    if (normalized) {
      threads.push(normalized);
    }
  }
  return dedupeThreads(threads);
}

function dedupeThreads(threads: ComputerAgentsListThread[]): ComputerAgentsListThread[] {
  const seen = new Set<string>();
  const result: ComputerAgentsListThread[] = [];
  for (const thread of threads) {
    const key = thread.id;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(thread);
  }
  return result;
}

function parseThreadsListOutput(output: string): ComputerAgentsListThread[] {
  const threads: ComputerAgentsListThread[] = [];
  for (const parsedValue of collectJsonValueCandidates(output)) {
    collectThreadsFromParsedValue(parsedValue, threads);
  }
  const dedupedThreads = dedupeThreads(threads);
  return dedupedThreads.length > 0 ? dedupedThreads : parseThreadRecordsFromPartialJsonText(output);
}

function parseThreadGetOutput(output: string, targetThreadId: string): ComputerAgentsListThread | null {
  const threads: ComputerAgentsListThread[] = [];
  for (const parsedValue of collectJsonValueCandidates(output)) {
    collectThreadsFromParsedValue(parsedValue, threads);
  }
  const parsedThreads = dedupeThreads(threads);
  const matchingParsedThread = parsedThreads.find((thread) => !targetThreadId || thread.id === targetThreadId);
  if (matchingParsedThread) return matchingParsedThread;

  const partialThreads = parseThreadRecordsFromPartialJsonText(output);
  return partialThreads.find((thread) => !targetThreadId || thread.id === targetThreadId) || partialThreads[0] || null;
}

export function parseComputerAgentsThreadsListCommandOutput(command: string, output: string): ComputerAgentsThreadsListLogDetails | null {
  if (!isComputerAgentsThreadsListCommand(command) && !isComputerAgentsThreadsListCommand(`${command}\n${output}`)) return null;
  const threads = parseThreadsListOutput(output);
  return threads.length > 0 ? { threads } : null;
}

export function parseComputerAgentsThreadsListLogDetails(log: RunnerLog): ComputerAgentsThreadsListLogDetails | null {
  if (log.eventType !== "command_execution" && log.eventType !== "mcp_tool_call") return null;
  if (!isComputerAgentsThreadsListCommand(getCommandText(log))) return null;

  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const threads = parseThreadsListOutput(getCommandOutputText(log));
  if (threads.length > 0) return { threads };

  if (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) return null;
  if (parsedOutput?.returnCodeInterpretation === "timeout" || parsedOutput?.interrupted) return null;

  return null;
}

export function parseComputerAgentsThreadGetCommandOutput(command: string, output: string): ComputerAgentsThreadGetLogDetails | null {
  if (!isComputerAgentsThreadGetCommand(command) && !isComputerAgentsThreadGetCommand(`${command}\n${output}`)) return null;
  const targetThreadId = getThreadIdFromGetCommand(command) || getThreadIdFromGetCommand(`${command}\n${output}`);
  const thread = parseThreadGetOutput(output, targetThreadId);
  return thread ? { thread } : null;
}

export function parseComputerAgentsThreadGetLogDetails(log: RunnerLog): ComputerAgentsThreadGetLogDetails | null {
  if (log.eventType !== "command_execution" && log.eventType !== "mcp_tool_call") return null;
  const command = getCommandText(log);
  if (!isComputerAgentsThreadGetCommand(command)) return null;

  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const targetThreadId = getThreadIdFromGetCommand(command);
  const thread = parseThreadGetOutput(getCommandOutputText(log), targetThreadId);
  if (thread) return { thread };

  if (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) return null;
  if (parsedOutput?.returnCodeInterpretation === "timeout" || parsedOutput?.interrupted) return null;

  return null;
}

function getThreadCountLabel(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? "Thread" : "Threads"}`;
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function getThreadUpdatedTimestamp(thread: ComputerAgentsListThread): number {
  const timestamp = Date.parse(thread.updatedAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortThreads(threads: ComputerAgentsListThread[], sortMode: ThreadListSort): ComputerAgentsListThread[] {
  const sorted = threads.slice();
  sorted.sort((left, right) => {
    if (sortMode === "title") {
      return left.title.localeCompare(right.title) || left.id.localeCompare(right.id);
    }
    if (sortMode === "status") {
      return left.statusLabel.localeCompare(right.statusLabel) || left.title.localeCompare(right.title);
    }
    if (sortMode === "agent") {
      return left.agentName.localeCompare(right.agentName) || left.title.localeCompare(right.title);
    }
    return getThreadUpdatedTimestamp(right) - getThreadUpdatedTimestamp(left) || left.title.localeCompare(right.title);
  });
  return sorted;
}

function buildAvailableAgentLookup(availableAgents: ComputerAgentsListAvailableAgent[] | undefined): Map<string, Record<string, unknown>> {
  const lookup = new Map<string, Record<string, unknown>>();
  (Array.isArray(availableAgents) ? availableAgents : []).forEach((agent) => {
    if (!isPlainRecord(agent)) return;
    const id = readRecordString(agent, ["id", "agentId", "agent_id", "uid"]);
    const name = readRecordString(agent, ["name", "title", "displayName", "display_name"]);
    if (id) lookup.set(`id:${id}`, agent);
    if (name) lookup.set(`name:${normalizeLookupKey(name)}`, agent);
  });
  return lookup;
}

function enrichThreadsWithAvailableAgents(
  threads: ComputerAgentsListThread[],
  availableAgents: ComputerAgentsListAvailableAgent[] | undefined
): ComputerAgentsListThread[] {
  const lookup = buildAvailableAgentLookup(availableAgents);
  return threads.map((thread) => {
    const byId = thread.agentId ? lookup.get(`id:${thread.agentId}`) : undefined;
    const byName = thread.agentName ? lookup.get(`name:${normalizeLookupKey(thread.agentName)}`) : undefined;
    const record = byId || byName;
    if (!record) return thread;
    const agentName = readRecordString(record, ["name", "title", "displayName", "display_name"]) || thread.agentName;
    const agentId = readRecordString(record, ["id", "agentId", "agent_id", "uid"]) || thread.agentId;
    return {
      ...thread,
      agentId,
      agentName,
      agentPhotoUrl: getExplicitAgentPhotoUrl(record) || thread.agentPhotoUrl || getFallbackAgentPhotoUrl(agentName, agentId),
    };
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  return `${parts[0]?.[0] || ""}${parts.length > 1 ? parts[1]?.[0] || "" : ""}`.toUpperCase() || "A";
}

function ThreadAgentAvatar({ thread }: { thread: Pick<ComputerAgentsListThread, "agentName" | "agentPhotoUrl"> }) {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => getInitials(thread.agentName), [thread.agentName]);
  const photoUrl = failed ? "" : thread.agentPhotoUrl;

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

function ThreadDetailValue({ label, value }: { label: string; value?: string | null }) {
  const normalizedValue = typeof value === "string" && value.trim() ? value.trim() : "None";
  return (
    <div className="tb-log-thread-get-detail">
      <div className="tb-log-thread-get-detail-label">{label}</div>
      <div className="tb-log-thread-get-detail-value" title={normalizedValue}>{normalizedValue}</div>
    </div>
  );
}

export function ComputerAgentsThreadGetLogBox({
  details,
  timeLabel,
  availableAgents,
}: {
  details: ComputerAgentsThreadGetLogDetails;
  timeLabel?: string;
  availableAgents?: ComputerAgentsListAvailableAgent[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const thread = useMemo(
    () => enrichThreadsWithAvailableAgents([details.thread], availableAgents)[0] || details.thread,
    [availableAgents, details.thread]
  );

  return (
    <div className="tb-log-card tb-log-card-agent-list tb-log-card-thread-get">
      <LogHeader
        icon={<MessageSquare className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Get Thread"
        title={thread.title}
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-log-thread-get-summary">
          <div className="tb-log-thread-get-main">
            <div className="tb-log-thread-get-main-copy">
              <div className="tb-log-thread-get-title" title={thread.title}>{thread.title}</div>
              <div className="tb-log-thread-get-subtitle" title={thread.id}>{thread.id}</div>
            </div>
            <div className="tb-log-thread-get-status">{thread.statusLabel}</div>
          </div>
          <div className="tb-log-thread-get-agent-row">
            <ThreadAgentAvatar thread={thread} />
            <div className="tb-log-thread-get-agent-copy">
              <div className="tb-log-thread-get-agent-label">Agent</div>
              <div className="tb-log-thread-get-agent-name" title={thread.agentName}>{thread.agentName}</div>
            </div>
          </div>
          <div className="tb-log-thread-get-details-grid">
            <ThreadDetailValue label="Computer" value={thread.environmentName || "Default"} />
            <ThreadDetailValue label="Project" value={thread.projectName} />
            <ThreadDetailValue label="Task" value={thread.taskTitle} />
            <ThreadDetailValue label="Messages" value={thread.messageCountLabel} />
            <ThreadDetailValue label="Created" value={thread.createdLabel} />
            <ThreadDetailValue label="Updated" value={thread.updatedLabel} />
          </div>
        </div>
      </LogPanel>
    </div>
  );
}

export function ComputerAgentsThreadsListLogBox({
  details,
  timeLabel,
  availableAgents,
}: {
  details: ComputerAgentsThreadsListLogDetails;
  timeLabel?: string;
  availableAgents?: ComputerAgentsListAvailableAgent[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState<ThreadListSort>("updated");
  const [openPopover, setOpenPopover] = useState<ThreadListPopover>(null);
  const [visibleCount, setVisibleCount] = useState(THREADS_LIST_PAGE_SIZE);
  const threads = useMemo(
    () => enrichThreadsWithAvailableAgents(details.threads, availableAgents),
    [availableAgents, details.threads]
  );
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const statusOptions = useMemo(() => {
    const options = new Map<string, string>();
    threads.forEach((thread) => {
      options.set(thread.status || "unknown", thread.statusLabel || "Unknown");
    });
    return [
      { id: "all", label: "All statuses" },
      ...Array.from(options.entries())
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([id, label]) => ({ id, label })),
    ];
  }, [threads]);
  const filteredThreads = useMemo(() => {
    const matchingStatus = statusFilter === "all"
      ? threads
      : threads.filter((thread) => (thread.status || "unknown") === statusFilter);
    const matchingSearch = normalizedSearchQuery
      ? matchingStatus.filter((thread) => {
          const haystack = [
            thread.title,
            thread.id,
            thread.statusLabel,
            thread.agentName,
            thread.messageCountLabel,
          ].join(" ").toLowerCase();
          return haystack.includes(normalizedSearchQuery);
        })
      : matchingStatus;
    return sortThreads(matchingSearch, sortMode);
  }, [normalizedSearchQuery, sortMode, statusFilter, threads]);
  const visibleThreads = filteredThreads.slice(0, visibleCount);
  const hasMoreThreads = filteredThreads.length > visibleThreads.length;

  useEffect(() => {
    setVisibleCount(THREADS_LIST_PAGE_SIZE);
  }, [normalizedSearchQuery, sortMode, statusFilter]);

  const sortOptions: Array<{ id: ThreadListSort; label: string }> = [
    { id: "updated", label: "Updated" },
    { id: "title", label: "Title" },
    { id: "status", label: "Status" },
    { id: "agent", label: "Agent" },
  ];
  const selectedSortLabel = sortOptions.find((option) => option.id === sortMode)?.label || "Updated";
  const selectedStatusLabel = statusOptions.find((option) => option.id === statusFilter)?.label || "All statuses";

  return (
    <div className="tb-log-card tb-log-card-agent-list tb-log-card-threads-list">
      <LogHeader
        icon={<MessageSquare className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="List Threads"
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-log-agent-list-toolbar">
          <div className="tb-log-agent-list-summary">{getThreadCountLabel(filteredThreads.length)}</div>
          <div className="tb-log-agent-list-controls">
            <div className="tb-log-agent-list-search-shell">
              <Search className="tb-log-agent-list-search-icon" strokeWidth={1.8} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="tb-log-agent-list-search"
                placeholder="Search threads"
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
                  className={`tb-log-agent-list-control-button ${openPopover === "filter" || statusFilter !== "all" ? "is-active" : ""}`.trim()}
                  onClick={() => setOpenPopover((current) => current === "filter" ? null : "filter")}
                >
                  <SlidersHorizontal className="tb-log-agent-list-control-icon" strokeWidth={1.8} />
                  <span>Filter</span>
                </button>
                {openPopover === "filter" ? (
                  <div className="tb-log-agent-list-popup-menu">
                    <div className="tb-log-agent-list-popup-title">Status</div>
                    {statusOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`tb-log-agent-list-popup-row ${statusFilter === option.id ? "selected" : ""}`.trim()}
                        onClick={() => {
                          setStatusFilter(option.id);
                          setOpenPopover(null);
                        }}
                      >
                        <span className="tb-log-agent-list-popup-check-slot">
                          {statusFilter === option.id ? <Check className="tb-log-agent-list-popup-check" strokeWidth={1.8} /> : null}
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
            {sortMode !== "updated" ? <span>{`Sorted by ${selectedSortLabel}`}</span> : null}
            {statusFilter !== "all" ? <span>{selectedStatusLabel}</span> : null}
          </div>
        </div>
        <div className="tb-log-agent-list-table-shell">
          {visibleThreads.length > 0 ? (
            <table className="tb-log-agent-list-table">
              <colgroup>
                <col className="tb-log-agent-list-col-name" />
                <col className="tb-log-agent-list-col-model" />
                <col className="tb-log-agent-list-col-cost" />
              </colgroup>
              <thead>
                <tr>
                  <th>Thread</th>
                  <th>Agent</th>
                  <th className="is-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {visibleThreads.map((thread) => (
                  <tr key={thread.id}>
                    <td>
                      <div className="tb-log-agent-list-name-title" title={thread.title}>{thread.title}</div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-model-cell">
                        <ThreadAgentAvatar thread={thread} />
                        <div className="tb-log-agent-list-model-copy">
                          <div className="tb-log-agent-list-model-name" title={thread.agentName}>{thread.agentName}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="tb-log-agent-list-cost" title={thread.updatedAt ? new Date(thread.updatedAt).toLocaleString() : ""}>
                        {thread.updatedLabel}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="tb-log-agent-list-empty">
              {normalizedSearchQuery || statusFilter !== "all"
                ? "No matching threads found."
                : "No threads available."}
            </div>
          )}
        </div>
        {hasMoreThreads ? (
          <div className="tb-log-agent-list-more-row">
            <button
              type="button"
              className="tb-log-agent-list-load-more"
              onClick={() => setVisibleCount((current) => current + THREADS_LIST_PAGE_SIZE)}
            >
              Load more
            </button>
          </div>
        ) : null}
      </LogPanel>
    </div>
  );
}

import { CheckCircle2, X } from "../../ui/hugeicons-compat.js";
import { useState } from "react";
import type { RunnerLog } from "../../../../types.js";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../ui/button/index.js";
import { RunnerCodeViewer } from "./code-viewer.js";

export interface PermissionRequestPreview {
  summary: string;
  details: Array<{ label: string; value: string }>;
  previewLabel?: string;
  previewContent?: string;
  previewLanguage?: string;
  previewFilePath?: string;
  reason?: string;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parsePermissionInput(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function permissionValueToString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (
    Array.isArray(value) &&
    value.every((item) => ["string", "number", "boolean"].includes(typeof item))
  ) {
    return value
      .map((item) => String(item))
      .join(" ")
      .trim();
  }
  return "";
}

function getPermissionRecordString(record: Record<string, unknown> | null, keys: string[]): string {
  if (!record) {
    return "";
  }
  for (const key of keys) {
    const value = permissionValueToString(record[key]);
    if (value) {
      return value;
    }
  }
  return "";
}

function formatPermissionLanguageLabel(language: string): string {
  const normalized = language.trim().toLowerCase();
  if (!normalized) return "code";
  if (normalized === "js" || normalized === "javascript") return "JavaScript";
  if (normalized === "ts" || normalized === "typescript") return "TypeScript";
  if (normalized === "py" || normalized === "python") return "Python";
  if (normalized === "sh" || normalized === "shell" || normalized === "bash") {
    return "shell";
  }
  return language.trim();
}

function normalizePermissionCodeLanguage(language: string): string | undefined {
  const normalized = language.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "py") return "python";
  if (normalized === "js") return "javascript";
  if (normalized === "ts") return "typescript";
  if (normalized === "sh" || normalized === "bash" || normalized === "shell") {
    return "shell";
  }
  return normalized;
}

function getPermissionReasonCopy(reason: string): string {
  const cleaned = reason.trim();
  if (!cleaned || /requires approval due to ask rule/i.test(cleaned)) {
    return "";
  }
  return cleaned;
}

export function buildPermissionRequestPreview(
  toolName: string,
  input: string,
  reason: string,
): PermissionRequestPreview {
  const parsedInput = parsePermissionInput(input);
  const inputRecord = isPlainRecord(parsedInput) ? parsedInput : null;
  const rawTextInput = typeof parsedInput === "string" ? parsedInput.trim() : "";
  const normalizedToolName = toolName.trim().toLowerCase();
  const details: Array<{ label: string; value: string }> = [];
  const addDetail = (label: string, value: string) => {
    const cleanedValue = value.trim();
    if (
      cleanedValue &&
      !details.some((detail) => detail.label === label && detail.value === cleanedValue)
    ) {
      details.push({ label, value: cleanedValue });
    }
  };

  const path = getPermissionRecordString(inputRecord, [
    "path",
    "file_path",
    "filePath",
    "notebook_path",
    "notebookPath",
  ]);
  const language = getPermissionRecordString(inputRecord, ["language", "lang"]);
  const code = getPermissionRecordString(inputRecord, ["code", "source", "script"]);
  const command =
    getPermissionRecordString(inputRecord, ["command", "cmd", "shellCommand", "shell_command"]) ||
    rawTextInput;
  const diff = getPermissionRecordString(inputRecord, ["diff", "patch", "changes"]);
  const oldString = getPermissionRecordString(inputRecord, ["old_string", "oldString"]);
  const newString = getPermissionRecordString(inputRecord, ["new_string", "newString"]);
  const content = getPermissionRecordString(inputRecord, [
    "content",
    "new_content",
    "newContent",
    "text",
  ]);
  const url = getPermissionRecordString(inputRecord, ["url", "uri", "href"]);
  const query = getPermissionRecordString(inputRecord, ["query", "search", "pattern"]);
  const reasonCopy = getPermissionReasonCopy(reason);

  if (path) {
    addDetail("File", path);
  }
  if (url) {
    addDetail("URL", url);
  }
  if (query) {
    addDetail("Query", query);
  }

  if (normalizedToolName === "bash" || normalizedToolName === "powershell") {
    return {
      summary: "Approving lets the agent run this shell command once, then continue.",
      details,
      previewLabel: "Command",
      previewContent: command,
      previewLanguage: "shell",
      reason: reasonCopy,
    };
  }

  if (normalizedToolName === "repl") {
    const languageLabel = formatPermissionLanguageLabel(language);
    const codeLabel = languageLabel === "code" ? "code" : `${languageLabel} code`;
    return {
      summary: `Approving lets the agent run this ${codeLabel} once, then continue.`,
      details,
      previewContent: code || command,
      previewLanguage: normalizePermissionCodeLanguage(language),
      reason: reasonCopy,
    };
  }

  if (/^(write_file|edit_file|notebookedit)$/i.test(toolName)) {
    const isWrite = /^write_file$/i.test(toolName);
    const previewContent =
      diff ||
      (oldString || newString
        ? `Replace:\n${oldString || "(empty)"}\n\nWith:\n${newString || "(empty)"}`
        : content);
    return {
      summary: `Approving lets the agent ${isWrite ? "write" : "edit"} this file once, then continue.`,
      details,
      previewLabel: diff
        ? "Proposed diff"
        : oldString || newString
          ? "Proposed change"
          : content
            ? "File content"
            : undefined,
      previewContent,
      previewLanguage: diff ? "diff" : undefined,
      previewFilePath: path || undefined,
      reason: reasonCopy,
    };
  }

  return {
    summary: `Approving lets the agent use ${toolName} once, then continue.`,
    details,
    previewContent: rawTextInput && !inputRecord ? rawTextInput : undefined,
    reason: reasonCopy,
  };
}

interface PermissionRequestLogBoxProps {
  log: RunnerLog;
  timeLabel?: string;
  onPermissionDecision?: (log: RunnerLog, decision: "allow" | "deny") => Promise<void> | void;
}

export function PermissionRequestLogBox({
  log,
  timeLabel,
  onPermissionDecision,
}: PermissionRequestLogBoxProps) {
  const [isSubmitting, setIsSubmitting] = useState<"allow" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const status = String(log.metadata?.status || log.metadata?.decision || "pending")
    .trim()
    .toLowerCase();
  const isPending = status === "pending";
  const isApproved =
    status === "approved" || status === "allowed" || status === "allow" || status === "granted";
  const toolNameFromMessage = /^permission requested:\s*(.+)$/i
    .exec(String(log.message || "").trim())?.[1]
    ?.trim();
  const toolName =
    String(
      log.metadata?.toolName || log.metadata?.toolId || toolNameFromMessage || "tool",
    ).trim() || "tool";
  const reason = typeof log.metadata?.reason === "string" ? log.metadata.reason.trim() : "";
  const input = typeof log.metadata?.input === "string" ? log.metadata.input.trim() : "";
  const permissionRing =
    log.metadata?.permissionRing === 1 ||
    log.metadata?.permissionRing === 2 ||
    log.metadata?.permissionRing === 3
      ? log.metadata.permissionRing
      : undefined;
  const permissionRingLabel =
    typeof log.metadata?.permissionRingLabel === "string" && log.metadata.permissionRingLabel.trim()
      ? log.metadata.permissionRingLabel.trim()
      : permissionRing
        ? `Ring ${permissionRing}`
        : "";
  const permissionRingShortLabel =
    typeof log.metadata?.permissionRingShortLabel === "string" &&
    log.metadata.permissionRingShortLabel.trim()
      ? log.metadata.permissionRingShortLabel.trim()
      : "";
  const permissionRingDescription =
    typeof log.metadata?.permissionRingDescription === "string"
      ? log.metadata.permissionRingDescription.trim()
      : "";
  const permissionActionLabel =
    typeof log.metadata?.permissionActionLabel === "string" &&
    log.metadata.permissionActionLabel.trim()
      ? log.metadata.permissionActionLabel.trim()
      : toolName;
  const permissionActionDescription =
    typeof log.metadata?.permissionActionDescription === "string"
      ? log.metadata.permissionActionDescription.trim()
      : "";
  const permissionPreview = buildPermissionRequestPreview(toolName, input, reason);

  async function decide(decision: "allow" | "deny") {
    if (!onPermissionDecision || !isPending || isSubmitting) return;
    setError(null);
    setIsSubmitting(decision);
    try {
      await onPermissionDecision(log, decision);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      setIsSubmitting(null);
    }
  }

  if (!isPending) {
    const terminalLabel = isApproved ? "Permission approved" : "Permission denied";
    const TerminalIcon = isApproved ? CheckCircle2 : X;
    return (
      <div
        className={`tb-log-card tb-log-card-permission is-resolved ${isApproved ? "is-approved" : "is-denied"}`}
      >
        <div className="tb-log-card-panel tb-log-permission-panel">
          <div className="tb-log-permission-resolution">
            <TerminalIcon
              className="tb-log-permission-resolution-icon"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <div className="tb-log-permission-resolution-copy">
              <div className="tb-log-permission-resolution-title">{terminalLabel}</div>
              <div className="tb-log-permission-resolution-detail">
                <span>{permissionActionLabel || toolName}</span>
                {permissionRingLabel ? <span>{permissionRingLabel}</span> : null}
                {timeLabel ? <span>{timeLabel}</span> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tb-log-card tb-log-card-permission is-pending">
      <div className="tb-log-card-panel tb-log-permission-panel">
        {permissionRingLabel ? (
          <div className="tb-log-permission-ring">
            <div className="tb-log-permission-ring-badge">
              <span>{permissionRingLabel}</span>
              {permissionRingShortLabel ? <span>{permissionRingShortLabel}</span> : null}
            </div>
            <div className="tb-log-permission-ring-copy">
              <div className="tb-log-permission-ring-title">{permissionActionLabel}</div>
              {permissionActionDescription || permissionRingDescription ? (
                <div className="tb-log-permission-ring-description">
                  {permissionActionDescription || permissionRingDescription}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="tb-log-permission-summary">{permissionPreview.summary}</div>
        {permissionPreview.details.length > 0 ? (
          <div className="tb-log-permission-details">
            {permissionPreview.details.map((detail) => (
              <div className="tb-log-permission-detail" key={`${detail.label}:${detail.value}`}>
                <span className="tb-log-permission-detail-label">{detail.label}</span>
                <span className="tb-log-permission-detail-value">{detail.value}</span>
              </div>
            ))}
          </div>
        ) : null}
        {permissionPreview.reason ? (
          <div className="tb-log-permission-reason">{permissionPreview.reason}</div>
        ) : null}
        {permissionPreview.previewContent ? (
          <div className="tb-log-permission-preview">
            {permissionPreview.previewLabel ? (
              <div className="tb-log-permission-preview-label">
                {permissionPreview.previewLabel}
              </div>
            ) : null}
            <RunnerCodeViewer
              content={permissionPreview.previewContent}
              filePath={permissionPreview.previewFilePath}
              language={permissionPreview.previewLanguage}
              maxHeight={180}
              className="tb-log-permission-code"
            />
          </div>
        ) : null}
        {error ? <div className="tb-log-card-state tb-log-card-state-error">{error}</div> : null}
        <div className="tb-log-permission-actions">
          <PlatformSecondaryButton
            size="compact"
            type="button"
            className="tb-log-permission-button tb-log-permission-button-secondary"
            onClick={() => void decide("deny")}
            disabled={Boolean(isSubmitting)}
          >
            {isSubmitting === "deny" ? "Denying..." : "Deny"}
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="compact"
            type="button"
            className="tb-log-permission-button tb-log-permission-button-primary"
            onClick={() => void decide("allow")}
            disabled={Boolean(isSubmitting)}
          >
            {isSubmitting === "allow" ? "Approving..." : "Accept"}
          </PlatformPrimaryButton>
        </div>
      </div>
    </div>
  );
}

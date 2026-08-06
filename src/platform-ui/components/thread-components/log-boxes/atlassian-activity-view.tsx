import type { RunnerLog } from "../../../../types.js";
import {
  buildRunnerPreviewAttachmentFromPath,
  type RunnerConnectorActionPreviewData,
  type RunnerPreviewAttachment,
} from "../document-preview/preview-contracts.js";
import { buildCompactLogPreviewId } from "./preview-id.js";

const ATLASSIAN_LOGO_URL = "/img/plugins/atlassian.svg";

type AtlassianActionStatus = RunnerConnectorActionPreviewData["status"];

export interface AtlassianActivityPresentation {
  actionName: string;
  description: string;
  inputData: unknown;
  outputData: unknown;
  inputText: string;
  outputText: string;
  errorMessage: string;
  status: AtlassianActionStatus;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const normalized = value.trim();
  if (!normalized || (!normalized.startsWith("{") && !normalized.startsWith("["))) {
    return value;
  }
  try {
    return JSON.parse(normalized);
  } catch {
    return value;
  }
}

function formatPreviewValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  const parsed = parseJsonValue(value);
  if (typeof parsed === "string") return parsed.trim();
  try {
    return JSON.stringify(parsed, null, 2);
  } catch {
    return String(parsed).trim();
  }
}

function unwrapStructuredResult(value: unknown): unknown {
  const parsed = parseJsonValue(value);
  if (!isRecord(parsed)) return parsed;
  if (isRecord(parsed.structuredContent)) return parsed.structuredContent;
  if (isRecord(parsed.structured_content)) return parsed.structured_content;
  if (isRecord(parsed.result)) {
    const nestedResult = unwrapStructuredResult(parsed.result);
    if (nestedResult !== parsed.result) return nestedResult;
  }
  if (Array.isArray(parsed.content)) {
    const textEntry = parsed.content.find(
      (entry) => isRecord(entry) && entry.type === "text" && typeof entry.text === "string",
    );
    if (isRecord(textEntry)) {
      const nestedText = parseJsonValue(textEntry.text);
      if (nestedText !== textEntry.text) return nestedText;
    }
  }
  return parsed;
}

function normalizedConnectorId(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^mcp__/, "")
    .replace(/^connector[_:-]+/, "")
    .replace(/^integration[_:-]+/, "");
}

function isAtlassianConnectorId(value: unknown): boolean {
  const normalized = normalizedConnectorId(value);
  return normalized === "jira" || normalized === "atlassian";
}

function extractToolNameFromQualifiedName(value: unknown): string {
  const normalized = String(value || "").trim().toLowerCase();
  const match = /^(?:mcp__)?connector_(?:jira|atlassian)__(.+)$/.exec(normalized);
  return String(match?.[1] || "").trim();
}

function resolveAtlassianToolName(log: RunnerLog): string {
  const metadata = (log.metadata || {}) as Record<string, unknown>;
  const toolName = String(metadata.toolName || metadata.tool_name || "").trim();
  const qualifiedToolName = extractToolNameFromQualifiedName(toolName);
  if (qualifiedToolName) return qualifiedToolName;

  const connectorAuthorization = isRecord(metadata.connectorAuthorization)
    ? metadata.connectorAuthorization
    : isRecord(metadata.connector_authorization)
      ? metadata.connector_authorization
      : null;
  const hasAtlassianProviderEvidence = [
    metadata.serverName,
    metadata.server_name,
    metadata.connectorId,
    metadata.connector_id,
    connectorAuthorization?.connectorId,
    connectorAuthorization?.connector_id,
    connectorAuthorization?.serverName,
    connectorAuthorization?.server_name,
  ].some(isAtlassianConnectorId);

  return hasAtlassianProviderEvidence
    ? toolName.toLowerCase().replace(/^jira__/, "").replace(/^atlassian__/, "")
    : "";
}

export function isAtlassianConnectorLog(log: RunnerLog): boolean {
  if (log.eventType !== "mcp_tool_call" && log.eventType !== "command_execution") {
    return false;
  }
  return Boolean(resolveAtlassianToolName(log));
}

function recordValue(record: Record<string, unknown> | null, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function compactText(value: unknown, maximumLength = 96): string {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maximumLength) return normalized;
  return `${normalized.slice(0, Math.max(1, maximumLength - 1)).trimEnd()}…`;
}

function quotedTarget(value: unknown): string {
  const normalized = compactText(value);
  return normalized ? ` “${normalized}”` : "";
}

function plainTarget(value: unknown): string {
  const normalized = compactText(value);
  return normalized ? ` ${normalized}` : "";
}

function resolveStatus(log: RunnerLog): AtlassianActionStatus {
  const status = String(log.metadata?.status || "").trim().toLowerCase();
  const rawResult = log.metadata?.result ?? log.metadata?.output;
  const parsedResult = parseJsonValue(rawResult);
  const structuredResult = unwrapStructuredResult(rawResult);
  if (
    log.type === "error"
    || status === "failed"
    || log.metadata?.error
    || (isRecord(parsedResult) && parsedResult.isError === true)
    || (isRecord(structuredResult) && isRecord(structuredResult.error))
  ) return "failed";
  if (status === "running" || status === "started" || log.metadata?.isToolStarted) return "running";
  return "completed";
}

function statusPhrase(
  status: AtlassianActionStatus,
  phrases: { completed: string; running: string; failed: string },
): string {
  return phrases[status];
}

function describeAtlassianAction(
  actionName: string,
  status: AtlassianActionStatus,
  input: Record<string, unknown> | null,
  output: Record<string, unknown> | null,
): string {
  const issueKey = recordValue(input, "issueIdOrKey", "issue_id_or_key", "issueKey", "issue_key")
    || recordValue(output, "key", "issueKey", "issue_key");
  const project = recordValue(input, "projectIdOrKey", "project_id_or_key", "projectKeyOrId", "project_key_or_id", "projectKey", "project_key");
  const issueSummary = recordValue(input, "summary");
  const userQuery = recordValue(input, "query", "accountId", "account_id");
  const jql = recordValue(input, "jql");
  const board = recordValue(input, "boardId", "board_id");
  const sprint = recordValue(input, "sprintId", "sprint_id");
  const page = recordValue(input, "pageId", "page_id", "contentId", "content_id")
    || recordValue(output, "id", "pageId", "page_id");
  const space = recordValue(input, "spaceId", "space_id");
  const pageTitle = recordValue(input, "title") || recordValue(output, "title");
  const filename = recordValue(input, "filename", "filePath", "file_path");

  const phrase = (completed: string, running: string, failed: string) =>
    statusPhrase(status, { completed, running, failed });

  switch (actionName) {
    case "get_myself":
      return phrase("Read the connected Jira profile", "Reading the connected Jira profile", "Failed to read the connected Jira profile");
    case "list_projects":
      return phrase("Listed Jira projects", "Listing Jira projects", "Failed to list Jira projects");
    case "get_project":
      return phrase(`Opened Jira project${plainTarget(project)}`, `Opening Jira project${plainTarget(project)}`, `Failed to open Jira project${plainTarget(project)}`);
    case "search_issues":
      return phrase(`Searched Jira issues${quotedTarget(jql)}`, `Searching Jira issues${quotedTarget(jql)}`, `Failed to search Jira issues${quotedTarget(jql)}`);
    case "get_issue":
      return phrase(`Opened Jira issue${plainTarget(issueKey)}`, `Opening Jira issue${plainTarget(issueKey)}`, `Failed to open Jira issue${plainTarget(issueKey)}`);
    case "get_issue_changelog":
      return phrase(`Read the history of Jira issue${plainTarget(issueKey)}`, `Reading the history of Jira issue${plainTarget(issueKey)}`, `Failed to read the history of Jira issue${plainTarget(issueKey)}`);
    case "list_comments":
      return phrase(`Listed comments on Jira issue${plainTarget(issueKey)}`, `Listing comments on Jira issue${plainTarget(issueKey)}`, `Failed to list comments on Jira issue${plainTarget(issueKey)}`);
    case "get_transitions":
      return phrase(`Listed transitions for Jira issue${plainTarget(issueKey)}`, `Listing transitions for Jira issue${plainTarget(issueKey)}`, `Failed to list transitions for Jira issue${plainTarget(issueKey)}`);
    case "search_users":
      return phrase(`Searched Jira users${quotedTarget(userQuery)}`, `Searching Jira users${quotedTarget(userQuery)}`, `Failed to search Jira users${quotedTarget(userQuery)}`);
    case "list_issue_types":
      return phrase(`Listed issue types for Jira project${plainTarget(project)}`, `Listing issue types for Jira project${plainTarget(project)}`, `Failed to list issue types for Jira project${plainTarget(project)}`);
    case "list_fields":
      return phrase("Listed Jira fields", "Listing Jira fields", "Failed to list Jira fields");
    case "list_boards":
      return phrase(`Listed Jira boards${plainTarget(project)}`, `Listing Jira boards${plainTarget(project)}`, `Failed to list Jira boards${plainTarget(project)}`);
    case "list_sprints":
      return phrase(`Listed Jira sprints for board${plainTarget(board)}`, `Listing Jira sprints for board${plainTarget(board)}`, `Failed to list Jira sprints for board${plainTarget(board)}`);
    case "create_issue": {
      const target = issueKey ? plainTarget(issueKey) : quotedTarget(issueSummary);
      return phrase(`Created Jira issue${target}`, `Creating Jira issue${target}`, `Failed to create Jira issue${target}`);
    }
    case "update_issue":
      return phrase(`Updated Jira issue${plainTarget(issueKey)}`, `Updating Jira issue${plainTarget(issueKey)}`, `Failed to update Jira issue${plainTarget(issueKey)}`);
    case "delete_issue":
      return phrase(`Deleted Jira issue${plainTarget(issueKey)}`, `Deleting Jira issue${plainTarget(issueKey)}`, `Failed to delete Jira issue${plainTarget(issueKey)}`);
    case "assign_issue":
      return phrase(`Assigned Jira issue${plainTarget(issueKey)}`, `Assigning Jira issue${plainTarget(issueKey)}`, `Failed to assign Jira issue${plainTarget(issueKey)}`);
    case "transition_issue":
      return phrase(`Transitioned Jira issue${plainTarget(issueKey)}`, `Transitioning Jira issue${plainTarget(issueKey)}`, `Failed to transition Jira issue${plainTarget(issueKey)}`);
    case "add_comment":
      return phrase(`Added a comment to Jira issue${plainTarget(issueKey)}`, `Adding a comment to Jira issue${plainTarget(issueKey)}`, `Failed to add a comment to Jira issue${plainTarget(issueKey)}`);
    case "update_comment":
      return phrase(`Updated a comment on Jira issue${plainTarget(issueKey)}`, `Updating a comment on Jira issue${plainTarget(issueKey)}`, `Failed to update a comment on Jira issue${plainTarget(issueKey)}`);
    case "delete_comment":
      return phrase(`Deleted a comment from Jira issue${plainTarget(issueKey)}`, `Deleting a comment from Jira issue${plainTarget(issueKey)}`, `Failed to delete a comment from Jira issue${plainTarget(issueKey)}`);
    case "add_worklog":
      return phrase(`Logged work on Jira issue${plainTarget(issueKey)}`, `Logging work on Jira issue${plainTarget(issueKey)}`, `Failed to log work on Jira issue${plainTarget(issueKey)}`);
    case "move_issues_to_sprint":
      return phrase(`Moved Jira issues to sprint${plainTarget(sprint)}`, `Moving Jira issues to sprint${plainTarget(sprint)}`, `Failed to move Jira issues to sprint${plainTarget(sprint)}`);
    case "confluence_get_current_user":
      return phrase("Read the connected Confluence profile", "Reading the connected Confluence profile", "Failed to read the connected Confluence profile");
    case "confluence_list_spaces":
      return phrase("Listed Confluence spaces", "Listing Confluence spaces", "Failed to list Confluence spaces");
    case "confluence_get_space":
      return phrase(`Opened Confluence space${plainTarget(space)}`, `Opening Confluence space${plainTarget(space)}`, `Failed to open Confluence space${plainTarget(space)}`);
    case "confluence_search_content": {
      const cql = recordValue(input, "cql");
      return phrase(`Searched Confluence${quotedTarget(cql)}`, `Searching Confluence${quotedTarget(cql)}`, `Failed to search Confluence${quotedTarget(cql)}`);
    }
    case "confluence_get_page":
      return phrase(`Opened Confluence page${plainTarget(page)}`, `Opening Confluence page${plainTarget(page)}`, `Failed to open Confluence page${plainTarget(page)}`);
    case "confluence_get_page_children":
      return phrase(`Listed child pages of Confluence page${plainTarget(page)}`, `Listing child pages of Confluence page${plainTarget(page)}`, `Failed to list child pages of Confluence page${plainTarget(page)}`);
    case "confluence_list_comments":
      return phrase(`Listed comments on Confluence content${plainTarget(page)}`, `Listing comments on Confluence content${plainTarget(page)}`, `Failed to list comments on Confluence content${plainTarget(page)}`);
    case "confluence_list_attachments":
      return phrase(`Listed attachments on Confluence content${plainTarget(page)}`, `Listing attachments on Confluence content${plainTarget(page)}`, `Failed to list attachments on Confluence content${plainTarget(page)}`);
    case "confluence_create_page":
      return phrase(`Created Confluence page${quotedTarget(pageTitle)}`, `Creating Confluence page${quotedTarget(pageTitle)}`, `Failed to create Confluence page${quotedTarget(pageTitle)}`);
    case "confluence_update_page":
      return phrase(`Updated Confluence page${plainTarget(page)}`, `Updating Confluence page${plainTarget(page)}`, `Failed to update Confluence page${plainTarget(page)}`);
    case "confluence_delete_page":
      return phrase(`Deleted Confluence page${plainTarget(page)}`, `Deleting Confluence page${plainTarget(page)}`, `Failed to delete Confluence page${plainTarget(page)}`);
    case "confluence_add_comment":
      return phrase(`Added a comment to Confluence content${plainTarget(page)}`, `Adding a comment to Confluence content${plainTarget(page)}`, `Failed to add a comment to Confluence content${plainTarget(page)}`);
    case "confluence_update_comment":
      return phrase("Updated a Confluence comment", "Updating a Confluence comment", "Failed to update a Confluence comment");
    case "confluence_delete_comment":
      return phrase("Deleted a Confluence comment", "Deleting a Confluence comment", "Failed to delete a Confluence comment");
    case "confluence_add_attachment":
      return phrase(`Added${plainTarget(filename)} to Confluence`, `Adding${plainTarget(filename)} to Confluence`, `Failed to add${plainTarget(filename)} to Confluence`);
    default: {
      const readableAction = actionName.replace(/^confluence_/, "").replace(/_/g, " ").trim();
      const actionLabel = readableAction ? readableAction[0].toUpperCase() + readableAction.slice(1) : "Used Atlassian";
      return status === "failed" ? `Atlassian action failed: ${actionLabel}` : actionLabel;
    }
  }
}

export function buildAtlassianActivityPresentation(log: RunnerLog): AtlassianActivityPresentation | null {
  const actionName = resolveAtlassianToolName(log);
  if (!actionName) return null;

  const metadata = (log.metadata || {}) as Record<string, unknown>;
  const rawInput = metadata.toolInput ?? metadata.tool_input ?? metadata.args ?? metadata.input;
  const rawOutput = metadata.result ?? metadata.output;
  const parsedInput = parseJsonValue(rawInput);
  const parsedOutput = unwrapStructuredResult(rawOutput);
  const input = isRecord(parsedInput) ? parsedInput : null;
  const output = isRecord(parsedOutput) ? parsedOutput : null;
  const status = resolveStatus(log);
  const structuredError = isRecord(output) ? output.error : undefined;
  const errorMessage = formatPreviewValue(metadata.error)
    || (status === "failed" ? formatPreviewValue(structuredError || rawOutput) : "");

  return {
    actionName,
    description: describeAtlassianAction(actionName, status, input, output),
    inputData: parsedInput,
    outputData: parsedOutput,
    inputText: formatPreviewValue(rawInput),
    outputText: status === "failed" && errorMessage === formatPreviewValue(rawOutput)
      ? ""
      : formatPreviewValue(rawOutput),
    errorMessage,
    status,
  };
}

function buildAtlassianPreviewAttachment(
  presentation: AtlassianActivityPresentation,
): RunnerPreviewAttachment {
  const connectorActionPreview: RunnerConnectorActionPreviewData = {
    connectorId: "jira",
    connectorName: "Atlassian",
    logoUrl: ATLASSIAN_LOGO_URL,
    logoBackground: "#fff",
    actionName: presentation.actionName,
    description: presentation.description,
    status: presentation.status,
    inputData: presentation.inputData,
    outputData: presentation.outputData,
    inputText: presentation.inputText,
    outputText: presentation.outputText,
    errorMessage: presentation.errorMessage,
  };
  const previewIdentity = JSON.stringify(connectorActionPreview);
  return {
    ...buildRunnerPreviewAttachmentFromPath("/workspace/atlassian-action.json", {
      idPrefix: "connector-action-preview",
    }),
    id: buildCompactLogPreviewId("connector-action-preview", previewIdentity),
    filename: "Atlassian",
    mimeType: "application/x.computer-agents.connector-action",
    type: "document",
    previewKindOverride: "connector-action",
    connectorActionPreview,
  };
}

export function AtlassianActivityLogBox({
  log,
  onPreviewDocument,
}: {
  log: RunnerLog;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
}) {
  const presentation = buildAtlassianActivityPresentation(log);
  if (!presentation) return null;
  const previewAttachment = buildAtlassianPreviewAttachment(presentation);

  return (
    <button
      type="button"
      className="tb-log-web-search-compact tb-log-connector-action-compact"
      onClick={() => onPreviewDocument?.(previewAttachment)}
      aria-label={`Open Atlassian action details: ${presentation.description}`}
    >
      <span className="tb-log-web-search-compact-main">
        <span className="tb-log-connector-action-icon-shell" aria-hidden="true">
          <img src={ATLASSIAN_LOGO_URL} alt="" />
        </span>
        <span className="tb-log-web-search-compact-title">Atlassian</span>
        <span className="tb-log-web-search-compact-query">{presentation.description}</span>
      </span>
    </button>
  );
}

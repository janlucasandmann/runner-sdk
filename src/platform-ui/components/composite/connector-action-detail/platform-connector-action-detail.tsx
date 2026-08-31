import {
  CircleEllipsis,
  ExternalLink,
  Eye,
  List as ListIcon,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "../../ui/hugeicons-compat.js";
import type { CSSProperties } from "react";

import { PlatformLabel, type PlatformLabelVariant } from "../../ui/label/index.js";

export type PlatformConnectorActionStatus = "running" | "completed" | "failed";
export type PlatformConnectorActionKind =
  | "read"
  | "list"
  | "search"
  | "create"
  | "update"
  | "comment"
  | "delete"
  | "other";

export interface PlatformConnectorActionDetailProps {
  connectorId?: string;
  connectorName: string;
  logoUrl?: string;
  logoBackground?: string;
  actionName: string;
  description?: string;
  status: PlatformConnectorActionStatus;
  input?: unknown;
  output?: unknown;
  inputText?: string;
  outputText?: string;
  errorMessage?: string;
  maxCollectionItems?: number;
  className?: string;
}

interface ConnectorActionSectionCopy {
  input: string;
  output: string;
}

const ACTION_SECTION_COPY: Record<PlatformConnectorActionKind, ConnectorActionSectionCopy> = {
  read: { input: "Request", output: "Retrieved item" },
  list: { input: "Filters", output: "Items found" },
  search: { input: "Search criteria", output: "Search results" },
  create: { input: "New item", output: "Created item" },
  update: { input: "Changes", output: "Updated item" },
  comment: { input: "Comment", output: "Connector response" },
  delete: { input: "Item to remove", output: "Connector response" },
  other: { input: "Request details", output: "Result" },
};

const ACTION_ICONS = {
  read: Eye,
  list: ListIcon,
  search: Search,
  create: Plus,
  update: Pencil,
  comment: MessageSquareText,
  delete: Trash2,
  other: CircleEllipsis,
} as const;

const STATUS_PRESENTATION: Record<
  PlatformConnectorActionStatus,
  { label: string; variant: PlatformLabelVariant }
> = {
  running: { label: "Running", variant: "blue" },
  completed: { label: "Completed", variant: "green" },
  failed: { label: "Failed", variant: "red" },
};

const KNOWN_FIELD_LABELS: Record<string, string> = {
  accountid: "Account",
  assigneeid: "Assignee",
  boardid: "Board",
  body: "Content",
  cql: "Search query",
  createdat: "Created",
  displayname: "Name",
  emailaddress: "Email",
  fields: "Details",
  filename: "File",
  filepath: "File",
  issueid: "Issue",
  issueidorkey: "Issue",
  issuekey: "Issue",
  issuetype: "Issue type",
  jql: "Search query",
  maxresults: "Maximum results",
  pageid: "Page",
  projectid: "Project",
  projectidorkey: "Project",
  projectkey: "Project",
  query: "Search query",
  spaceid: "Space",
  sprintid: "Sprint",
  statusid: "Status",
  transitionid: "Transition",
  updatedat: "Updated",
};

const NARRATIVE_FIELD_PATTERN =
  /^(body|comment|content|description|message|note|prompt|summary|text)$/i;
const SENSITIVE_FIELD_PATTERN =
  /(?:access.?token|api.?key|authorization|cookie|credential|password|refresh.?token|secret|session.?token|^token$)/i;
const WRAPPER_FIELD_NAMES = new Set([
  "content",
  "data",
  "isError",
  "output",
  "result",
  "structuredContent",
  "structured_content",
]);

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeActionName(actionName: string): string {
  return String(actionName || "")
    .trim()
    .replace(/^.*__/, "")
    .replace(/^(?:atlassian|confluence|jira)[_:-]+/i, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s:-]+/g, "_")
    .toLowerCase();
}

export function classifyPlatformConnectorAction(actionName: string): PlatformConnectorActionKind {
  const normalized = normalizeActionName(actionName);
  if (/(?:^|_)(?:comment|reply|message|note)(?:_|$)/.test(normalized)) return "comment";
  if (/(?:^|_)(?:delete|remove|archive|revoke)(?:_|$)/.test(normalized)) return "delete";
  if (/(?:^|_)(?:create|add|insert|post|send|upload)(?:_|$)/.test(normalized)) return "create";
  if (/(?:^|_)(?:update|edit|set|transition|assign|move|rename|publish)(?:_|$)/.test(normalized))
    return "update";
  if (/(?:^|_)(?:search|find|query|lookup)(?:_|$)/.test(normalized)) return "search";
  if (/(?:^|_)(?:list|browse|enumerate)(?:_|$)/.test(normalized)) return "list";
  if (/(?:^|_)(?:get|read|fetch|retrieve|download|open)(?:_|$)/.test(normalized)) return "read";
  return "other";
}

export function formatPlatformConnectorActionLabel(actionName: string): string {
  const normalized = normalizeActionName(actionName).replace(/_/g, " ").trim();
  return normalized ? `${normalized[0].toUpperCase()}${normalized.slice(1)}` : "Connector action";
}

export function parsePlatformConnectorActionValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const normalized = value.trim();
  if (!normalized) return "";
  const looksLikeJson =
    (normalized.startsWith("{") && normalized.endsWith("}")) ||
    (normalized.startsWith("[") && normalized.endsWith("]"));
  if (!looksLikeJson) return normalized;
  try {
    return JSON.parse(normalized);
  } catch {
    return normalized;
  }
}

function unwrapConnectorOutput(value: unknown, depth = 0): unknown {
  const parsed = parsePlatformConnectorActionValue(value);
  if (depth > 4 || !isRecord(parsed)) return parsed;

  if (parsed.structuredContent !== undefined) {
    return unwrapConnectorOutput(parsed.structuredContent, depth + 1);
  }
  if (parsed.structured_content !== undefined) {
    return unwrapConnectorOutput(parsed.structured_content, depth + 1);
  }

  const keys = Object.keys(parsed);
  const isWrapper = keys.length > 0 && keys.every((key) => WRAPPER_FIELD_NAMES.has(key));
  if (isWrapper) {
    for (const key of ["result", "output", "data"] as const) {
      if (parsed[key] !== undefined) return unwrapConnectorOutput(parsed[key], depth + 1);
    }
  }

  if (Array.isArray(parsed.content)) {
    const textEntry = parsed.content.find(
      (entry) => isRecord(entry) && entry.type === "text" && typeof entry.text === "string",
    );
    if (isRecord(textEntry) && typeof textEntry.text === "string") {
      const nested = parsePlatformConnectorActionValue(textEntry.text);
      if (nested !== textEntry.text) return unwrapConnectorOutput(nested, depth + 1);
    }
  }

  return parsed;
}

function compactFieldKey(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

export function formatPlatformConnectorFieldLabel(fieldName: string): string {
  const knownLabel = KNOWN_FIELD_LABELS[compactFieldKey(fieldName)];
  if (knownLabel) return knownLabel;
  const normalized = fieldName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_:-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized ? `${normalized[0].toUpperCase()}${normalized.slice(1)}` : "Value";
}

function isSensitiveField(fieldName: string): boolean {
  return SENSITIVE_FIELD_PATTERN.test(fieldName.replace(/[_:-]+/g, ""));
}

function hasMeaningfulValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return true;
}

function hasRenderableConnectorValue(
  value: unknown,
  fieldName = "",
  seen = new WeakSet<object>(),
): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (isSensitiveField(fieldName)) return true;
  if (typeof value !== "object") return true;
  if (seen.has(value)) return false;
  seen.add(value);

  if (isRichTextValue(value)) return Boolean(extractRichText(value));
  if (Array.isArray(value)) {
    return value.some((entry) => hasRenderableConnectorValue(entry, "", seen));
  }
  return Object.entries(value).some(([key, entry]) =>
    hasRenderableConnectorValue(entry, key, seen),
  );
}

function formatDateValue(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}(?:T[\d:.+-]+Z?)?$/.test(value)) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  const includesTime = value.includes("T");
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    ...(includesTime ? { timeStyle: "short" as const } : {}),
  }).format(new Date(timestamp));
}

function extractRichText(value: unknown, depth = 0): string {
  if (depth > 8 || value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((entry) => extractRichText(entry, depth + 1))
      .filter(Boolean)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  if (!isRecord(value)) return "";
  if (typeof value.text === "string") return value.text;
  if (isRecord(value.attrs)) {
    const label = value.attrs.text ?? value.attrs.displayName ?? value.attrs.label;
    if (typeof label === "string") return label;
  }
  if (!Array.isArray(value.content)) return "";
  const separator = /^(?:doc|blockquote|bulletList|heading|listItem|orderedList|paragraph)$/i.test(
    String(value.type || ""),
  )
    ? "\n"
    : "";
  return value.content
    .map((entry) => extractRichText(entry, depth + 1))
    .filter(Boolean)
    .join(separator)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isRichTextValue(value: unknown): boolean {
  if (!isRecord(value) || !Array.isArray(value.content)) return false;
  return /^(?:doc|blockquote|bulletList|heading|listItem|orderedList|paragraph)$/i.test(
    String(value.type || ""),
  );
}

function getRecordTitle(record: Record<string, unknown>, fallback: string) {
  for (const key of ["summary", "title", "name", "displayName", "key", "id", "email"]) {
    const value = record[key];
    if (typeof value === "string" || typeof value === "number") {
      const label = String(value).trim();
      if (label) return { key, label };
    }
  }
  return { key: "", label: fallback };
}

function sortRecordEntries(entries: Array<[string, unknown]>) {
  const priority = ["summary", "title", "name", "key", "id", "status"];
  return [...entries].sort(([left], [right]) => {
    const leftIndex = priority.indexOf(left);
    const rightIndex = priority.indexOf(right);
    if (leftIndex < 0 && rightIndex < 0) return 0;
    if (leftIndex < 0) return 1;
    if (rightIndex < 0) return -1;
    return leftIndex - rightIndex;
  });
}

function sanitizeTechnicalValue(
  value: unknown,
  fieldName = "",
  seen = new WeakSet<object>(),
): unknown {
  if (isSensitiveField(fieldName)) return "Hidden for security";
  const parsed = parsePlatformConnectorActionValue(value);
  if (!parsed || typeof parsed !== "object") return parsed;
  if (seen.has(parsed)) return "[Circular reference]";
  seen.add(parsed);
  if (Array.isArray(parsed)) {
    return parsed.map((entry) => sanitizeTechnicalValue(entry, "", seen));
  }
  return Object.fromEntries(
    Object.entries(parsed).map(([key, entry]) => [key, sanitizeTechnicalValue(entry, key, seen)]),
  );
}

function formatTechnicalValue(value: unknown): string {
  if (!hasMeaningfulValue(value)) return "";
  const sanitized = sanitizeTechnicalValue(value);
  if (typeof sanitized === "string") return sanitized;
  try {
    return JSON.stringify(sanitized, null, 2);
  } catch {
    return String(sanitized);
  }
}

function ScalarValue({ value, fieldName = "" }: { value: unknown; fieldName?: string }) {
  if (value === undefined || value === null || value === "") return null;
  if (isSensitiveField(fieldName)) {
    return <span className="platform-connector-action-detail__redacted">Hidden for security</span>;
  }
  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (typeof value === "number") return <span>{value.toLocaleString()}</span>;
  const normalized = String(value);
  const dateValue = formatDateValue(normalized);
  if (dateValue) return <span>{dateValue}</span>;
  if (/^https?:\/\//i.test(normalized)) {
    return (
      <a href={normalized} target="_blank" rel="noopener noreferrer">
        <span>{normalized}</span>
        <ExternalLink width={12} height={12} strokeWidth={1.8} aria-hidden="true" />
      </a>
    );
  }
  const isNarrative =
    NARRATIVE_FIELD_PATTERN.test(fieldName) || normalized.length > 160 || normalized.includes("\n");
  return isNarrative ? (
    <p className="platform-connector-action-detail__narrative">{normalized}</p>
  ) : (
    <span>{normalized}</span>
  );
}

function ConnectorCollection({
  items,
  depth,
  path,
  maxItems,
}: {
  items: unknown[];
  depth: number;
  path: string;
  maxItems: number;
}) {
  const renderableItems = items.filter((item) => hasRenderableConnectorValue(item));
  const visibleItems = renderableItems.slice(0, maxItems);
  const remainingItems = renderableItems.slice(maxItems);
  const renderItem = (item: unknown, index: number, suffix = "") => {
    const itemPath = `${path}-${index}${suffix}`;
    const title = isRecord(item)
      ? getRecordTitle(item, `Item ${index + 1}`)
      : { key: "", label: `Item ${index + 1}` };
    return (
      <li key={itemPath} className="platform-connector-action-detail__collection-item">
        {isRecord(item) ? (
          <>
            <div className="platform-connector-action-detail__collection-title">{title.label}</div>
            <StructuredValue
              value={item}
              depth={depth + 1}
              path={itemPath}
              maxItems={maxItems}
              omittedKey={title.key}
            />
          </>
        ) : (
          <ScalarValue value={item} />
        )}
      </li>
    );
  };

  return (
    <div className="platform-connector-action-detail__collection-shell">
      <div className="platform-connector-action-detail__collection-count">
        {renderableItems.length.toLocaleString()} {renderableItems.length === 1 ? "item" : "items"}
      </div>
      <ul className="platform-connector-action-detail__collection">
        {visibleItems.map((item, index) => renderItem(item, index))}
      </ul>
      {remainingItems.length > 0 ? (
        <details className="platform-connector-action-detail__more">
          <summary>Show {remainingItems.length.toLocaleString()} more</summary>
          <ul className="platform-connector-action-detail__collection">
            {remainingItems.map((item, index) =>
              renderItem(item, index + visibleItems.length, "-more"),
            )}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function StructuredValue({
  value,
  fieldName = "",
  depth = 0,
  path,
  maxItems,
  omittedKey = "",
}: {
  value: unknown;
  fieldName?: string;
  depth?: number;
  path: string;
  maxItems: number;
  omittedKey?: string;
}) {
  const parsed = parsePlatformConnectorActionValue(value);
  if (depth > 5) {
    return (
      <p className="platform-connector-action-detail__muted">More details are available below.</p>
    );
  }
  if (isRichTextValue(parsed)) {
    return <p className="platform-connector-action-detail__narrative">{extractRichText(parsed)}</p>;
  }
  if (Array.isArray(parsed)) {
    return <ConnectorCollection items={parsed} depth={depth} path={path} maxItems={maxItems} />;
  }
  if (!isRecord(parsed)) return <ScalarValue value={parsed} fieldName={fieldName} />;

  if (fieldName) {
    const compactValueKey = ["name", "displayName", "value", "label"].find(
      (key) => typeof parsed[key] === "string" || typeof parsed[key] === "number",
    );
    const compactRecordKeys = new Set([
      "id",
      "key",
      "name",
      "displayName",
      "value",
      "label",
      "self",
      "url",
      "iconUrl",
    ]);
    if (compactValueKey && Object.keys(parsed).every((key) => compactRecordKeys.has(key))) {
      return <ScalarValue value={parsed[compactValueKey]} fieldName={fieldName} />;
    }
  }

  const entries = sortRecordEntries(Object.entries(parsed).filter(([key]) => key !== omittedKey));
  if (entries.length === 0) {
    return <p className="platform-connector-action-detail__muted">No additional information.</p>;
  }
  const simpleEntries = entries
    .filter(([, entry]) => entry === null || typeof entry !== "object")
    .filter(([key, entry]) => hasRenderableConnectorValue(entry, key));
  const nestedEntries = entries
    .filter(([, entry]) => Boolean(entry && typeof entry === "object"))
    .filter(([key, entry]) => hasRenderableConnectorValue(entry, key));

  if (simpleEntries.length === 0 && nestedEntries.length === 0) {
    return <p className="platform-connector-action-detail__muted">No additional information.</p>;
  }

  return (
    <div className="platform-connector-action-detail__structured-value">
      {simpleEntries.length > 0 ? (
        <dl className="platform-connector-action-detail__fields">
          {simpleEntries.map(([key, entry]) => (
            <div key={`${path}-${key}`} className="platform-connector-action-detail__field">
              <dt>{formatPlatformConnectorFieldLabel(key)}</dt>
              <dd>
                <ScalarValue value={entry} fieldName={key} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {nestedEntries.map(([key, entry]) => {
        const richText = NARRATIVE_FIELD_PATTERN.test(key) ? extractRichText(entry) : "";
        return (
          <section
            key={`${path}-${key}`}
            className="platform-connector-action-detail__nested-section"
          >
            <h3>{formatPlatformConnectorFieldLabel(key)}</h3>
            {richText ? (
              <p className="platform-connector-action-detail__narrative">{richText}</p>
            ) : (
              <StructuredValue
                value={entry}
                fieldName={key}
                depth={depth + 1}
                path={`${path}-${key}`}
                maxItems={maxItems}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}

function ConnectorActionSection({
  title,
  value,
  path,
  maxItems,
  tone = "default",
  collapsible = false,
}: {
  title: string;
  value: unknown;
  path: string;
  maxItems: number;
  tone?: "default" | "error";
  collapsible?: boolean;
}) {
  const sectionSurface = (
    <div className="platform-connector-action-detail__section-surface">
      <StructuredValue value={value} path={path} maxItems={maxItems} />
    </div>
  );

  return (
    <section
      className={joinClassNames(
        "platform-connector-action-detail__section",
        tone === "error" && "is-error",
      )}
    >
      {collapsible ? (
        <details className="platform-connector-action-detail__section-details">
          <summary>{title}</summary>
          {sectionSurface}
        </details>
      ) : (
        <>
          <h2>{title}</h2>
          {sectionSurface}
        </>
      )}
    </section>
  );
}

function TechnicalDetails({ input, output }: { input: unknown; output: unknown }) {
  const inputText = formatTechnicalValue(input);
  const outputText = formatTechnicalValue(output);
  if (!inputText && !outputText) return null;
  return (
    <details className="platform-connector-action-detail__technical">
      <summary>Technical details</summary>
      <div className="platform-connector-action-detail__technical-body">
        {inputText ? (
          <section>
            <h2>Request data</h2>
            <pre>{inputText}</pre>
          </section>
        ) : null}
        {outputText ? (
          <section>
            <h2>Response data</h2>
            <pre>{outputText}</pre>
          </section>
        ) : null}
      </div>
    </details>
  );
}

export function PlatformConnectorActionDetail({
  connectorId = "",
  connectorName,
  logoUrl,
  logoBackground = "#fff",
  actionName,
  description = "",
  status,
  input,
  output,
  inputText = "",
  outputText = "",
  errorMessage = "",
  maxCollectionItems = 6,
  className = "",
}: PlatformConnectorActionDetailProps) {
  const actionKind = classifyPlatformConnectorAction(actionName);
  const ActionIcon = ACTION_ICONS[actionKind];
  const actionLabel = formatPlatformConnectorActionLabel(actionName);
  const statusPresentation = STATUS_PRESENTATION[status];
  const resolvedInput = parsePlatformConnectorActionValue(input !== undefined ? input : inputText);
  const rawOutput = output !== undefined ? output : outputText;
  const resolvedOutput = unwrapConnectorOutput(rawOutput);
  const resolvedError = parsePlatformConnectorActionValue(errorMessage);
  const sectionCopy = ACTION_SECTION_COPY[actionKind];
  const safeMaxItems = Math.max(1, Math.min(20, Math.round(maxCollectionItems) || 6));
  const hasInput = hasRenderableConnectorValue(resolvedInput);
  const hasOutput = hasRenderableConnectorValue(resolvedOutput);
  const hasError = hasRenderableConnectorValue(resolvedError);
  const logoStyle = {
    "--platform-connector-action-logo-background": logoBackground,
  } as CSSProperties;

  return (
    <main
      className={joinClassNames("platform-connector-action-detail", className)}
      data-platform-connector-action-detail="true"
      data-connector-id={connectorId || undefined}
      data-action-kind={actionKind}
    >
      <header className="platform-connector-action-detail__hero">
        <div className="platform-connector-action-detail__identity">
          <span
            className="platform-connector-action-detail__logo"
            style={logoStyle}
            aria-hidden="true"
          >
            {logoUrl ? <img src={logoUrl} alt="" /> : <ActionIcon strokeWidth={1.8} />}
          </span>
          <div className="platform-connector-action-detail__identity-copy">
            <h1>{connectorName || "Connector"}</h1>
            <p>{description || actionLabel}</p>
          </div>
        </div>
        <PlatformLabel
          variant={statusPresentation.variant}
          className="platform-connector-action-detail__status"
        >
          {statusPresentation.label}
        </PlatformLabel>
      </header>

      <div
        className={joinClassNames("platform-connector-action-detail__action", `is-${actionKind}`)}
      >
        <span className="platform-connector-action-detail__action-icon" aria-hidden="true">
          <ActionIcon strokeWidth={1.8} />
        </span>
        <span className="platform-connector-action-detail__action-copy">
          <span>Action</span>
          <strong>{actionLabel}</strong>
        </span>
      </div>

      {hasError ? (
        <ConnectorActionSection
          title="What went wrong"
          value={resolvedError}
          path="error"
          maxItems={safeMaxItems}
          tone="error"
        />
      ) : null}
      {hasInput ? (
        <ConnectorActionSection
          title={sectionCopy.input}
          value={resolvedInput}
          path="input"
          maxItems={safeMaxItems}
        />
      ) : null}
      {hasOutput ? (
        <ConnectorActionSection
          title={sectionCopy.output}
          value={resolvedOutput}
          path="output"
          maxItems={safeMaxItems}
          collapsible={sectionCopy.output === "Connector response"}
        />
      ) : null}
      {!hasError && !hasInput && !hasOutput ? (
        <p className="platform-connector-action-detail__empty">
          No additional details were returned.
        </p>
      ) : null}

      <TechnicalDetails input={input !== undefined ? input : inputText} output={rawOutput} />
    </main>
  );
}

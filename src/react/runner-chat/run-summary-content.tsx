import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Braces as LucideBraces,
  ChevronDown as LucideChevronDown,
  ChevronUp as LucideChevronUp,
} from "lucide-react";
import type { RunnerLog } from "../../types.js";
import { RunnerCodeViewer } from "../../platform-ui/components/thread-components/log-boxes/index.js";
import { PlatformSwitch } from "../../platform-ui/components/ui/switch/index.js";
import {
  RunnerMarkdown,
  stripRunnerSystemTags as stripSystemTags,
} from "../runner-markdown.js";

type RunnerSummaryJsonValue = Record<string, unknown> | unknown[];

const RUN_SUMMARY_JSON_VIEW_OPTIONS = [
  { value: "preview", label: "Preview" },
  { value: "json", label: "JSON" },
] as const;

function isRunnerSummaryPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isRunnerSummaryJsonValue(value: unknown): value is RunnerSummaryJsonValue {
  return Array.isArray(value) || isRunnerSummaryPlainObject(value);
}

function stripRunnerSummaryJsonFence(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^```(?:json|jsonc)?\s*\n([\s\S]*?)\n```$/i);
  return match?.[1]?.trim() || trimmed;
}

function parseRunnerSummaryJsonValue(value: string): RunnerSummaryJsonValue | null {
  const candidate = stripRunnerSummaryJsonFence(value);
  if (!candidate.startsWith("{") && !candidate.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(candidate);
    return isRunnerSummaryJsonValue(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function formatRunnerSummaryJsonRaw(value: RunnerSummaryJsonValue): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
}

function getRunnerSummaryJsonType(value: unknown): "array" | "object" | "null" | "boolean" | "number" | "string" {
  if (Array.isArray(value)) return "array";
  if (isRunnerSummaryPlainObject(value)) return "object";
  if (value === null) return "null";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  return "string";
}

function formatRunnerSummaryJsonPreview(value: unknown): string {
  const type = getRunnerSummaryJsonType(value);
  if (type === "object") {
    const count = Object.keys(value as Record<string, unknown>).length;
    return `${count} ${count === 1 ? "field" : "fields"}`;
  }
  if (type === "array") {
    const count = Array.isArray(value) ? value.length : 0;
    return `${count} ${count === 1 ? "item" : "items"}`;
  }
  if (type === "null") return "null";
  if (type === "boolean" || type === "number") return String(value);
  return JSON.stringify(String(value || ""));
}

type RunnerRunSummarySegment =
  | { kind: "markdown"; content: string; id: string }
  | { kind: "json"; value: RunnerSummaryJsonValue; id: string; title: string };

export interface RunnerChatUserPromptRenderContext {
  turnId: string;
  turnIndex: number;
  isLatestTurn: boolean;
  prompt: string;
  displayContent: string;
  isEmailPrompt: boolean;
  emailFrom: string;
}

export interface RunnerChatRunSummaryJsonRenderContext {
  turnId: string;
  segmentId: string;
  title: string;
  value: RunnerSummaryJsonValue;
  summaryContent: string;
  agentMessage: RunnerLog;
}

export function splitRunnerRunSummaryContent(content: string): RunnerRunSummarySegment[] {
  const normalizedContent = stripSystemTags(content || "").trim();
  if (!normalizedContent) return [];

  const pureJson = parseRunnerSummaryJsonValue(normalizedContent);
  if (pureJson) {
    return [{ kind: "json", value: pureJson, id: "json-0", title: "JSON" }];
  }

  const segments: RunnerRunSummarySegment[] = [];
  const fenceRegex = /```([^\n`]*)\n([\s\S]*?)```/g;
  let cursor = 0;
  let jsonIndex = 0;

  for (const match of normalizedContent.matchAll(fenceRegex)) {
    const fullMatch = match[0] || "";
    const language = String(match[1] || "").trim().toLowerCase();
    const body = String(match[2] || "").trim();
    const startsAt = match.index ?? 0;
    const jsonValue = (!language || language === "json" || language === "jsonc") ? parseRunnerSummaryJsonValue(body) : null;

    if (!jsonValue) {
      continue;
    }

    const before = normalizedContent.slice(cursor, startsAt).trim();
    if (before) {
      segments.push({ kind: "markdown", content: before, id: `markdown-${segments.length}` });
    }
    segments.push({ kind: "json", value: jsonValue, id: `json-${jsonIndex}`, title: "JSON" });
    jsonIndex += 1;
    cursor = startsAt + fullMatch.length;
  }

  if (!segments.length) {
    return [{ kind: "markdown", content: normalizedContent, id: "markdown-0" }];
  }

  const after = normalizedContent.slice(cursor).trim();
  if (after) {
    segments.push({ kind: "markdown", content: after, id: `markdown-${segments.length}` });
  }

  return segments;
}

function RunnerRunSummaryJsonRows({ value, depth = 0 }: { value: RunnerSummaryJsonValue | unknown; depth?: number }) {
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(isRunnerSummaryPlainObject(value) ? value : {});

  if (!entries.length) {
    return (
      <div className="tb-run-summary-json-empty" style={depth > 0 ? { marginLeft: depth * 18 } : undefined}>
        No fields.
      </div>
    );
  }

  return (
    <div className="tb-run-summary-json-field-tree">
      {entries.map(([fieldKey, fieldValue]) => {
        const fieldType = getRunnerSummaryJsonType(fieldValue);
        const expandable = fieldType === "object" || fieldType === "array";
        return (
          <div key={`${depth}:${fieldKey}`} className="tb-run-summary-json-field-node">
            <div className="tb-run-summary-json-field-row" style={{ paddingLeft: depth * 18 }}>
              <div className="tb-run-summary-json-field-main">
                <span className="tb-run-summary-json-field-toggle-placeholder" />
                <span className="tb-run-summary-json-field-key">{fieldKey}</span>
                <span className="tb-run-summary-json-field-separator">:</span>
                {expandable ? (
                  <span className="tb-run-summary-json-field-group">
                    <span className="tb-run-summary-json-field-type-pill">{fieldType === "object" ? "Object" : "Array"}</span>
                    <span className="tb-run-summary-json-field-preview">{formatRunnerSummaryJsonPreview(fieldValue)}</span>
                  </span>
                ) : (
                  <span className="tb-run-summary-json-field-value">{formatRunnerSummaryJsonPreview(fieldValue)}</span>
                )}
              </div>
            </div>
            {expandable ? (
              <div className="tb-run-summary-json-field-children">
                <RunnerRunSummaryJsonRows value={fieldValue} depth={depth + 1} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function RunnerRunSummaryJsonDocument({ value, title = "JSON", documentId }: { value: RunnerSummaryJsonValue; title?: string; documentId: string }) {
  const [viewMode, setViewMode] = useState<"preview" | "json">("preview");
  const rawJson = useMemo(() => formatRunnerSummaryJsonRaw(value), [value]);

  return (
    <div className="tb-run-summary-json-document">
      <div className="tb-run-summary-json-header">
        <div className="tb-run-summary-json-title">
          <LucideBraces className="tb-run-summary-json-title-icon" strokeWidth={1.9} />
          <span>{title}</span>
        </div>
        <PlatformSwitch
          className="tb-run-summary-json-mode-switch"
          value={viewMode}
          options={RUN_SUMMARY_JSON_VIEW_OPTIONS}
          onValueChange={(value) =>
            setViewMode(value === "json" ? "json" : "preview")
          }
          ariaLabel="JSON display mode"
        />
      </div>
      <div className="tb-run-summary-json-body">
        {viewMode === "json" ? (
          <div className="tb-run-summary-json-editor-shell">
            <RunnerCodeViewer
              content={rawJson}
              filePath={`run-summary-${documentId}.json`}
              language="json"
              showLineNumbers
              fillHeight
              className="tb-run-summary-json-editor"
            />
          </div>
        ) : (
          <RunnerRunSummaryJsonRows value={value} />
        )}
      </div>
    </div>
  );
}

export function CollapsibleRunnerUserPrompt({
  content,
  className,
  maxLines = 10,
}: {
  content: string;
  className?: string;
  maxLines?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    void content;
    setIsExpanded(false);
  }, [content]);

  useLayoutEffect(() => {
    void content;
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const measure = () => {
      const computedStyle = window.getComputedStyle(node);
      const lineHeight = Number.parseFloat(computedStyle.lineHeight);
      const collapsedHeight = Number.isFinite(lineHeight) ? lineHeight * maxLines : 0;
      if (collapsedHeight > 0) {
        setIsOverflowing(node.scrollHeight > collapsedHeight + 1);
        return;
      }
      setIsOverflowing(node.scrollHeight > node.clientHeight + 1);
    };

    measure();

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(() => {
        measure();
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [content, maxLines]);

  return (
    <>
      <div
        ref={containerRef}
        className={`tb-user-turn-collapsible-copy ${isExpanded ? "is-expanded" : ""}`.trim()}
        style={!isExpanded ? { ["--tb-user-turn-collapsed-lines" as string]: String(maxLines) } : undefined}
      >
        <RunnerMarkdown
          content={content}
          className={className}
          softBreaks
          disallowHeadings
        />
      </div>
      {isOverflowing ? (
        <button
          type="button"
          className="tb-user-turn-show-more"
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span>{isExpanded ? "Show less" : "Show more"}</span>
          {isExpanded ? (
            <LucideChevronUp className="tb-user-turn-show-more-icon" strokeWidth={1.8} />
          ) : (
            <LucideChevronDown className="tb-user-turn-show-more-icon" strokeWidth={1.8} />
          )}
        </button>
      ) : null}
    </>
  );
}

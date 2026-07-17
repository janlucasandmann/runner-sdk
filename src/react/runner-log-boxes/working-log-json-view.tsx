import { useMemo, useState } from "react";
import { Braces } from "lucide-react";

import { RunnerMarkdown } from "../runner-markdown.js";
import { RunnerCodeViewer } from "./code-viewer.js";
import {
  formatRunnerWorkingLogJsonPreview,
  formatRunnerWorkingLogJsonRaw,
  getRunnerWorkingLogJsonType,
  isRunnerWorkingLogPlainObject,
  type RunnerWorkingLogJsonSegment,
  type RunnerWorkingLogJsonValue,
} from "./working-log-json.js";

function RunnerWorkingLogJsonRows({
  value,
  depth = 0,
}: {
  value: RunnerWorkingLogJsonValue | unknown;
  depth?: number;
}) {
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(isRunnerWorkingLogPlainObject(value) ? value : {});

  if (!entries.length) {
    return (
      <div
        className="tb-run-summary-json-empty"
        style={depth > 0 ? { marginLeft: depth * 18 } : undefined}
      >
        No fields.
      </div>
    );
  }

  return (
    <div className="tb-run-summary-json-field-tree">
      {entries.map(([fieldKey, fieldValue]) => {
        const fieldType = getRunnerWorkingLogJsonType(fieldValue);
        const expandable = fieldType === "object" || fieldType === "array";
        return (
          <div
            key={`${depth}:${fieldKey}`}
            className="tb-run-summary-json-field-node"
          >
            <div
              className="tb-run-summary-json-field-row"
              style={{ paddingLeft: depth * 18 }}
            >
              <div className="tb-run-summary-json-field-main">
                <span className="tb-run-summary-json-field-toggle-placeholder" />
                <span className="tb-run-summary-json-field-key">{fieldKey}</span>
                <span className="tb-run-summary-json-field-separator">:</span>
                {expandable ? (
                  <span className="tb-run-summary-json-field-group">
                    <span className="tb-run-summary-json-field-type-pill">
                      {fieldType === "object" ? "Object" : "Array"}
                    </span>
                    <span className="tb-run-summary-json-field-preview">
                      {formatRunnerWorkingLogJsonPreview(fieldValue)}
                    </span>
                  </span>
                ) : (
                  <span className="tb-run-summary-json-field-value">
                    {formatRunnerWorkingLogJsonPreview(fieldValue)}
                  </span>
                )}
              </div>
            </div>
            {expandable ? (
              <div className="tb-run-summary-json-field-children">
                <RunnerWorkingLogJsonRows
                  value={fieldValue}
                  depth={depth + 1}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function RunnerWorkingLogJsonDocument({
  value,
  title = "JSON",
  documentId,
}: {
  value: RunnerWorkingLogJsonValue;
  title?: string;
  documentId: string;
}) {
  const [viewMode, setViewMode] = useState<"preview" | "json">("preview");
  const rawJson = useMemo(
    () => formatRunnerWorkingLogJsonRaw(value),
    [value],
  );

  return (
    <div className="tb-run-summary-json-document tb-working-log-json-document">
      <div className="tb-run-summary-json-header">
        <div className="tb-run-summary-json-title">
          <Braces
            className="tb-run-summary-json-title-icon"
            strokeWidth={1.9}
          />
          <span>{title}</span>
        </div>
        <div
          className="tb-run-summary-json-mode-switch"
          role="tablist"
          aria-label="JSON display mode"
        >
          <button
            type="button"
            className={`tb-run-summary-json-mode-button ${viewMode === "preview" ? "is-active" : ""}`.trim()}
            onClick={() => setViewMode("preview")}
          >
            Preview
          </button>
          <button
            type="button"
            className={`tb-run-summary-json-mode-button ${viewMode === "json" ? "is-active" : ""}`.trim()}
            onClick={() => setViewMode("json")}
          >
            JSON
          </button>
        </div>
      </div>
      <div className="tb-run-summary-json-body">
        {viewMode === "json" ? (
          <div className="tb-run-summary-json-editor-shell">
            <RunnerCodeViewer
              content={rawJson}
              filePath={`working-log-${documentId}.json`}
              language="json"
              showLineNumbers
              fillHeight
              className="tb-run-summary-json-editor"
            />
          </div>
        ) : (
          <RunnerWorkingLogJsonRows value={value} />
        )}
      </div>
    </div>
  );
}

export function RunnerWorkingLogJsonContent({
  segments,
  documentIdPrefix,
  onWorkspacePathClick,
}: {
  segments: RunnerWorkingLogJsonSegment[];
  documentIdPrefix: string;
  onWorkspacePathClick?: (path: string) => void;
}) {
  return (
    <div className="tb-run-summary-content tb-working-log-json-content">
      {segments.map((segment, index) => (
        segment.kind === "json" ? (
          <RunnerWorkingLogJsonDocument
            key={segment.id}
            value={segment.value}
            title={segment.title}
            documentId={`${documentIdPrefix}-${index}`}
          />
        ) : (
          <RunnerMarkdown
            key={segment.id}
            content={segment.content}
            className="tb-message-markdown tb-message-markdown-summary"
            onWorkspacePathClick={onWorkspacePathClick}
          />
        )
      ))}
    </div>
  );
}

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { DiffModeEnum, DiffView } from "@git-diff-view/react";
import { generateDiffFile } from "@git-diff-view/file";
import { mountRunnerChatStyles } from "./runner-chat-styles.js";

export interface RunnerFileDiffSurfaceProps {
  filePath?: string;
  diffContent: string;
  fileContent?: string;
  additions?: number | null;
  deletions?: number | null;
  emptyMessage?: string;
  bleed?: boolean;
  maxHeight?: number;
  collapsedMaxHeight?: number;
  collapsedPreviewLines?: number;
  defaultViewMode?: "split" | "unified";
  defaultHideUnchanged?: boolean;
  defaultExpanded?: boolean;
  controlsAccessory?: ReactNode;
}

let runnerDiffSurfaceMonacoLoader: Promise<any> | null = null;
let runnerDiffSurfaceMonacoInstanceLoader: Promise<any> | null = null;
let runnerDiffSurfaceThemeRegistered = false;
const RUNNER_DIFF_SURFACE_THEME = "runner-diff-surface";
const RUNNER_DIFF_LINE_HEIGHT = 20;
const RUNNER_DIFF_MIN_HEIGHT = 72;
const RUNNER_DIFF_DEFAULT_COLLAPSED_PREVIEW_LINES = 10;

function loadRunnerDiffSurfaceMonacoModule() {
  if (!runnerDiffSurfaceMonacoLoader) {
    runnerDiffSurfaceMonacoLoader = import("@monaco-editor/react").catch(() => null);
  }
  return runnerDiffSurfaceMonacoLoader;
}

function loadRunnerDiffSurfaceMonacoInstance() {
  if (!runnerDiffSurfaceMonacoInstanceLoader) {
    runnerDiffSurfaceMonacoInstanceLoader = loadRunnerDiffSurfaceMonacoModule().then(async (module) => {
      const loader = module?.loader;
      if (!loader?.init) {
        return null;
      }
      try {
        const monaco = await loader.init();
        ensureRunnerDiffSurfaceTheme(monaco);
        return monaco;
      } catch {
        return null;
      }
    });
  }
  return runnerDiffSurfaceMonacoInstanceLoader;
}

function ensureRunnerDiffSurfaceTheme(monaco: any) {
  if (runnerDiffSurfaceThemeRegistered) return;
  monaco.editor.defineTheme(RUNNER_DIFF_SURFACE_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#171717",
      "editorGutter.background": "#171717",
      "editorLineNumber.foreground": "#7f848d",
      "editorLineNumber.activeForeground": "#d7d9de",
      "editorLineHighlightBackground": "#00000000",
      "editor.selectionBackground": "#ffffff14",
      "editor.inactiveSelectionBackground": "#ffffff0b",
      "scrollbar.shadow": "#00000000",
      "diffEditor.insertedTextBackground": "#204c3328",
      "diffEditor.removedTextBackground": "#59262d28",
      "diffEditor.insertedLineBackground": "#16362444",
      "diffEditor.removedLineBackground": "#4c1e2744",
      "diffEditorGutter.insertedLineBackground": "#204c33b0",
      "diffEditorGutter.removedLineBackground": "#59262d7a",
      "diffEditor.diagonalFill": "#00000000",
    },
  });
  runnerDiffSurfaceThemeRegistered = true;
}

function countRunnerDiffStats(diffText: string): { additions: number; deletions: number } {
  return {
    additions: (diffText.match(/^\+[^+]/gm) || []).length,
    deletions: (diffText.match(/^-[^-]/gm) || []).length,
  };
}

function parseUnifiedDiffRange(value: string): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildDiffSnippetFromUnifiedDiff(diffText: string): { original: string; modified: string } {
  const lines = String(diffText || "").replace(/\r\n/g, "\n").split("\n");
  const original: string[] = [];
  const modified: string[] = [];
  let insideHunk = false;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      insideHunk = true;
      continue;
    }
    if (!insideHunk || line === "\\ No newline at end of file") {
      continue;
    }
    if (line.startsWith("+")) {
      if (!line.startsWith("+++")) modified.push(line.slice(1));
      continue;
    }
    if (line.startsWith("-")) {
      if (!line.startsWith("---")) original.push(line.slice(1));
      continue;
    }
    if (line.startsWith(" ")) {
      const content = line.slice(1);
      original.push(content);
      modified.push(content);
    }
  }

  return {
    original: original.join("\n"),
    modified: modified.join("\n"),
  };
}

function buildRunnerDiffModels(diffText: string, fileContent?: string): { original: string; modified: string } {
  const normalizedDiff = typeof diffText === "string" ? diffText.replace(/\r\n/g, "\n") : "";
  const normalizedFileContent = typeof fileContent === "string" ? fileContent.replace(/\r\n/g, "\n") : "";
  if (!normalizedDiff.trim()) {
    return {
      original: "",
      modified: normalizedFileContent,
    };
  }

  const lines = normalizedDiff.split("\n");
  const hunkRegex = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/;
  const hunks: Array<{
    oldStart: number;
    oldCount: number;
    newStart: number;
    newCount: number;
    lines: string[];
  }> = [];
  let currentHunk:
    | {
        oldStart: number;
        oldCount: number;
        newStart: number;
        newCount: number;
        lines: string[];
      }
    | null = null;

  for (const line of lines) {
    const hunkMatch = line.match(hunkRegex);
    if (hunkMatch) {
      currentHunk = {
        oldStart: parseUnifiedDiffRange(hunkMatch[1]),
        oldCount: parseUnifiedDiffRange(hunkMatch[2] || "1"),
        newStart: parseUnifiedDiffRange(hunkMatch[3]),
        newCount: parseUnifiedDiffRange(hunkMatch[4] || "1"),
        lines: [],
      };
      hunks.push(currentHunk);
      continue;
    }
    if (!currentHunk || line === "\\ No newline at end of file") continue;
    currentHunk.lines.push(line);
  }

  if (!normalizedFileContent.trim() || hunks.length === 0) {
    return buildDiffSnippetFromUnifiedDiff(normalizedDiff);
  }

  const modifiedLines = normalizedFileContent.split("\n");
  const originalLines = [...modifiedLines];

  for (let index = hunks.length - 1; index >= 0; index -= 1) {
    const hunk = hunks[index];
    const oldSegment: string[] = [];
    for (const line of hunk.lines) {
      if (line.startsWith("+")) continue;
      if (line.startsWith("-") || line.startsWith(" ")) {
        oldSegment.push(line.slice(1));
      }
    }
    const spliceIndex = Math.max((hunk.newStart || 1) - 1, 0);
    originalLines.splice(spliceIndex, hunk.newCount, ...oldSegment);
  }

  return {
    original: originalLines.join("\n"),
    modified: modifiedLines.join("\n"),
  };
}

function inferRunnerDiffLanguage(filePath?: string): string {
  const lower = String(filePath || "").toLowerCase();
  if (lower.endsWith(".tsx") || lower.endsWith(".ts")) return "typescript";
  if (lower.endsWith(".jsx") || lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs")) return "javascript";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".html")) return "html";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".sh")) return "shell";
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
  return "plaintext";
}

type RunnerDiffSplitFallbackRow =
  | { kind: "hunk"; content: string }
  | { kind: "note"; content: string }
  | {
      kind: "content";
      left: { kind: "context" | "removed"; lineNumber: number | null; content: string } | null;
      right: { kind: "context" | "added"; lineNumber: number | null; content: string } | null;
    };

type RunnerDiffUnifiedFallbackRow =
  | { kind: "hunk"; content: string }
  | { kind: "note"; content: string }
  | {
      kind: "content";
      tone: "context" | "removed" | "added";
      oldLineNumber: number | null;
      newLineNumber: number | null;
      content: string;
    };

function buildRunnerDiffSplitFallbackRows(diffText: string): RunnerDiffSplitFallbackRow[] {
  const lines = String(diffText || "").replace(/\r\n/g, "\n").split("\n");
  const rows: RunnerDiffSplitFallbackRow[] = [];
  let oldLineNumber = 0;
  let newLineNumber = 0;
  let insideHunk = false;
  let pendingRemoved: Array<{ kind: "removed"; lineNumber: number | null; content: string }> = [];

  function flushPendingRemoved() {
    if (pendingRemoved.length === 0) return;
    for (const removedCell of pendingRemoved) {
      rows.push({
        kind: "content",
        left: removedCell,
        right: null,
      });
    }
    pendingRemoved = [];
  }

  for (const line of lines) {
    if (line.startsWith("@@")) {
      flushPendingRemoved();
      const match = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/);
      oldLineNumber = match ? parseUnifiedDiffRange(match[1]) : 0;
      newLineNumber = match ? parseUnifiedDiffRange(match[3]) : 0;
      insideHunk = true;
      rows.push({ kind: "hunk", content: line });
      continue;
    }

    if (line === "\\ No newline at end of file") {
      flushPendingRemoved();
      rows.push({ kind: "note", content: line });
      continue;
    }

    if (!insideHunk || line.startsWith("diff --git ") || line.startsWith("index ") || line.startsWith("--- ") || line.startsWith("+++ ")) {
      continue;
    }

    if (line.startsWith("-")) {
      pendingRemoved.push({
        kind: "removed",
        lineNumber: oldLineNumber || 0,
        content: line.slice(1),
      });
      oldLineNumber += 1;
      continue;
    }

    if (line.startsWith("+")) {
      const addedCell = {
        kind: "added" as const,
        lineNumber: newLineNumber || 0,
        content: line.slice(1),
      };
      const pairedRemoved = pendingRemoved.shift() || null;
      rows.push({
        kind: "content",
        left: pairedRemoved,
        right: addedCell,
      });
      newLineNumber += 1;
      continue;
    }

    if (line.startsWith(" ")) {
      flushPendingRemoved();
      const content = line.slice(1);
      rows.push({
        kind: "content",
        left: {
          kind: "context",
          lineNumber: oldLineNumber || 0,
          content,
        },
        right: {
          kind: "context",
          lineNumber: newLineNumber || 0,
          content,
        },
      });
      oldLineNumber += 1;
      newLineNumber += 1;
    }
  }

  flushPendingRemoved();
  return rows;
}

function buildRunnerDiffUnifiedFallbackRows(diffText: string): RunnerDiffUnifiedFallbackRow[] {
  const lines = String(diffText || "").replace(/\r\n/g, "\n").split("\n");
  const rows: RunnerDiffUnifiedFallbackRow[] = [];
  let oldLineNumber = 0;
  let newLineNumber = 0;
  let insideHunk = false;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      const match = line.match(/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/);
      oldLineNumber = match ? parseUnifiedDiffRange(match[1]) : 0;
      newLineNumber = match ? parseUnifiedDiffRange(match[3]) : 0;
      insideHunk = true;
      rows.push({ kind: "hunk", content: line });
      continue;
    }

    if (line === "\\ No newline at end of file") {
      rows.push({ kind: "note", content: line });
      continue;
    }

    if (!insideHunk || line.startsWith("diff --git ") || line.startsWith("index ") || line.startsWith("--- ") || line.startsWith("+++ ")) {
      continue;
    }

    if (line.startsWith("-")) {
      rows.push({
        kind: "content",
        tone: "removed",
        oldLineNumber: oldLineNumber || 0,
        newLineNumber: null,
        content: line.slice(1),
      });
      oldLineNumber += 1;
      continue;
    }

    if (line.startsWith("+")) {
      rows.push({
        kind: "content",
        tone: "added",
        oldLineNumber: null,
        newLineNumber: newLineNumber || 0,
        content: line.slice(1),
      });
      newLineNumber += 1;
      continue;
    }

    if (line.startsWith(" ")) {
      const content = line.slice(1);
      rows.push({
        kind: "content",
        tone: "context",
        oldLineNumber: oldLineNumber || 0,
        newLineNumber: newLineNumber || 0,
        content,
      });
      oldLineNumber += 1;
      newLineNumber += 1;
    }
  }

  return rows;
}

function sliceRunnerDiffFallbackRows<Row extends { kind: string }>(rows: Row[], previewContentRows: number): Row[] {
  if (previewContentRows <= 0) {
    return rows;
  }

  const visibleRows: Row[] = [];
  let visibleContentRows = 0;

  for (const row of rows) {
    if (row.kind === "content") {
      if (visibleContentRows >= previewContentRows) {
        break;
      }
      visibleContentRows += 1;
    }
    visibleRows.push(row);
  }

  return visibleRows;
}

function RunnerDiffSplitFallbackCell({
  language,
  side,
  cell,
}: {
  language: string;
  side: "left" | "right";
  cell: { kind: "context" | "removed" | "added"; lineNumber: number | null; content: string } | null;
}) {
  const tone = cell?.kind || "empty";
  const sign = cell?.kind === "removed" ? "-" : cell?.kind === "added" ? "+" : "";
  return (
    <div className={`tb-runner-diff-surface-fallback-cell is-${side} is-${tone}`.trim()}>
      <span className="tb-runner-diff-surface-fallback-line-number">{Number.isFinite(cell?.lineNumber) ? String(cell?.lineNumber) : ""}</span>
      <span className="tb-runner-diff-surface-fallback-line-sign" aria-hidden="true">
        {sign}
      </span>
      <span className="tb-runner-diff-surface-fallback-line-content">
        <code className="tb-runner-diff-surface-colorized-line" data-runner-diff-colorize="1" data-runner-diff-raw={cell?.content || " "} data-lang={language}>
          {cell?.content || " "}
        </code>
      </span>
    </div>
  );
}

function RunnerDiffSplitFallbackViewer({
  language,
  rows,
  filePath,
  emptyMessage,
}: {
  language: string;
  rows: RunnerDiffSplitFallbackRow[];
  filePath?: string;
  emptyMessage: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) {
      return;
    }
    void loadRunnerDiffSurfaceMonacoInstance().then(async (monaco) => {
      if (cancelled || !monaco || !container.isConnected) {
        return;
      }
      const codeNodes = Array.from(container.querySelectorAll<HTMLElement>("[data-runner-diff-colorize='1']"));
      for (const node of codeNodes) {
        if (cancelled || !node.isConnected) {
          return;
        }
        node.textContent = node.dataset.runnerDiffRaw || " ";
        node.setAttribute("data-lang", language);
        try {
          await monaco.editor.colorizeElement(node, {
            theme: RUNNER_DIFF_SURFACE_THEME,
            tabSize: 2,
          });
        } catch {
          node.textContent = node.dataset.runnerDiffRaw || " ";
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [language, rows]);

  return (
    <div ref={containerRef} className="tb-runner-diff-surface-fallback" aria-label={`Split diff for ${filePath || "selected file"}`}>
      {rows.length === 0 ? (
        <div className="tb-runner-diff-surface-empty">{emptyMessage}</div>
      ) : (
        rows.map((row, index) => {
          if (row.kind === "hunk") {
            return (
              <div key={`hunk:${index}`} className="tb-runner-diff-surface-fallback-hunk">
                {row.content}
              </div>
            );
          }
          if (row.kind === "note") {
            return (
              <div key={`note:${index}`} className="tb-runner-diff-surface-fallback-note">
                {row.content}
              </div>
            );
          }
          return (
            <div key={`row:${index}`} className="tb-runner-diff-surface-fallback-row">
              <RunnerDiffSplitFallbackCell language={language} side="left" cell={row.left} />
              <RunnerDiffSplitFallbackCell language={language} side="right" cell={row.right} />
            </div>
          );
        })
      )}
    </div>
  );
}

function RunnerDiffUnifiedFallbackViewer({
  language,
  rows,
  filePath,
  emptyMessage,
}: {
  language: string;
  rows: RunnerDiffUnifiedFallbackRow[];
  filePath?: string;
  emptyMessage: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) {
      return;
    }
    void loadRunnerDiffSurfaceMonacoInstance().then(async (monaco) => {
      if (cancelled || !monaco || !container.isConnected) {
        return;
      }
      const codeNodes = Array.from(container.querySelectorAll<HTMLElement>("[data-runner-diff-colorize='1']"));
      for (const node of codeNodes) {
        if (cancelled || !node.isConnected) {
          return;
        }
        node.textContent = node.dataset.runnerDiffRaw || " ";
        node.setAttribute("data-lang", language);
        try {
          await monaco.editor.colorizeElement(node, {
            theme: RUNNER_DIFF_SURFACE_THEME,
            tabSize: 2,
          });
        } catch {
          node.textContent = node.dataset.runnerDiffRaw || " ";
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [language, rows]);

  return (
    <div ref={containerRef} className="tb-runner-diff-surface-fallback tb-runner-diff-surface-fallback-unified" aria-label={`Unified diff for ${filePath || "selected file"}`}>
      {rows.length === 0 ? (
        <div className="tb-runner-diff-surface-empty">{emptyMessage}</div>
      ) : (
        rows.map((row, index) => {
          if (row.kind === "hunk") {
            return (
              <div key={`hunk:${index}`} className="tb-runner-diff-surface-fallback-hunk">
                {row.content}
              </div>
            );
          }
          if (row.kind === "note") {
            return (
              <div key={`note:${index}`} className="tb-runner-diff-surface-fallback-note">
                {row.content}
              </div>
            );
          }
          return (
            <div key={`row:${index}`} className={`tb-runner-diff-surface-fallback-unified-row is-${row.tone}`.trim()}>
              <span className="tb-runner-diff-surface-fallback-unified-line-number">
                {Number.isFinite(row.oldLineNumber) ? String(row.oldLineNumber) : Number.isFinite(row.newLineNumber) ? String(row.newLineNumber) : ""}
              </span>
              <span className="tb-runner-diff-surface-fallback-unified-line-sign" aria-hidden="true">
                {row.tone === "removed" ? "-" : row.tone === "added" ? "+" : ""}
              </span>
              <span className="tb-runner-diff-surface-fallback-unified-line-content">
                <code className="tb-runner-diff-surface-colorized-line" data-runner-diff-colorize="1" data-runner-diff-raw={row.content || " "} data-lang={language}>
                  {row.content || " "}
                </code>
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

function normalizeRunnerDiffPath(path?: string): string {
  return String(path || "").replace(/^\.?\//, "").replace(/^\/workspace\//, "");
}

function getRunnerDiffDisplayPath(path?: string): string {
  const normalized = normalizeRunnerDiffPath(path);
  return normalized || "file";
}

function RunnerDiffFallbackViewer({
  diffText,
  filePath,
  emptyMessage,
  viewMode,
  previewContentRows,
  isExpanded,
  language,
}: {
  diffText: string;
  filePath?: string;
  emptyMessage: string;
  viewMode: "split" | "unified";
  previewContentRows: number;
  isExpanded: boolean;
  language: string;
}) {
  if (!diffText.trim()) {
    return <div className="tb-runner-diff-surface-empty">{emptyMessage}</div>;
  }

  if (viewMode === "unified") {
    const rows = buildRunnerDiffUnifiedFallbackRows(diffText);
    const visibleRows = isExpanded ? rows : sliceRunnerDiffFallbackRows(rows, previewContentRows);
    return <RunnerDiffUnifiedFallbackViewer language={language} rows={visibleRows} filePath={filePath} emptyMessage={emptyMessage} />;
  }

  const rows = buildRunnerDiffSplitFallbackRows(diffText);
  const visibleRows = isExpanded ? rows : sliceRunnerDiffFallbackRows(rows, previewContentRows);
  return <RunnerDiffSplitFallbackViewer language={language} rows={visibleRows} filePath={filePath} emptyMessage={emptyMessage} />;
}

export function RunnerFileDiffSurface({
  filePath,
  diffContent,
  fileContent,
  additions,
  deletions,
  emptyMessage = "Diff unavailable.",
  bleed = false,
  maxHeight = 860,
  collapsedMaxHeight,
  collapsedPreviewLines = RUNNER_DIFF_DEFAULT_COLLAPSED_PREVIEW_LINES,
  defaultViewMode = "unified",
  defaultHideUnchanged = true,
  defaultExpanded,
  controlsAccessory,
}: RunnerFileDiffSurfaceProps) {
  mountRunnerChatStyles();

  const [viewMode, setViewMode] = useState<"split" | "unified">(defaultViewMode);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? !defaultHideUnchanged);

  const normalizedDiff = String(diffContent || "").trim();
  const models = useMemo(() => buildRunnerDiffModels(normalizedDiff, fileContent), [normalizedDiff, fileContent]);
  const resolvedStats = useMemo(() => {
    const fallback = normalizedDiff ? countRunnerDiffStats(normalizedDiff) : { additions: 0, deletions: 0 };
    return {
      additions: typeof additions === "number" ? additions : fallback.additions,
      deletions: typeof deletions === "number" ? deletions : fallback.deletions,
    };
  }, [additions, deletions, normalizedDiff]);
  const previewContentRows = Math.max(1, collapsedPreviewLines);
  const language = inferRunnerDiffLanguage(filePath);
  const displayPath = getRunnerDiffDisplayPath(filePath);
  const collapsedBodyMaxHeight = Math.max(
    RUNNER_DIFF_MIN_HEIGHT,
    typeof collapsedMaxHeight === "number" ? collapsedMaxHeight : previewContentRows * 28 + 16
  );
  const diffFile = useMemo(() => {
    const file = generateDiffFile(displayPath, models.original, displayPath, models.modified, language, language);
    file.initTheme("dark");
    file.initRaw();
    file.buildSplitDiffLines();
    file.buildUnifiedDiffLines();
    return file;
  }, [displayPath, language, models.modified, models.original]);

  return (
    <div className={`tb-runner-diff-surface${bleed ? " is-bleed" : ""}`.trim()}>
      <div className="tb-runner-diff-surface-topbar">
        <div className="tb-runner-diff-surface-meta">
          <button
            type="button"
            className="tb-runner-diff-surface-toggle-button"
            onClick={() => setIsExpanded((current) => !current)}
            aria-label={isExpanded ? "Show fewer lines" : "Show more lines"}
            title={isExpanded ? "Show fewer lines" : "Show more lines"}
          >
            {isExpanded ? <ChevronDown className="tb-runner-diff-surface-icon" strokeWidth={2} /> : <ChevronRight className="tb-runner-diff-surface-icon" strokeWidth={2} />}
          </button>
          <span className="tb-runner-diff-surface-filename" title={displayPath}>
            {displayPath}
          </span>
        </div>
        <div className="tb-runner-diff-surface-controls">
          <div className="tb-runner-diff-surface-view-switch">
            <button
              type="button"
              className={`tb-runner-diff-surface-view-button${viewMode === "split" ? " is-active" : ""}`.trim()}
              onClick={() => setViewMode("split")}
            >
              Split
            </button>
            <button
              type="button"
              className={`tb-runner-diff-surface-view-button${viewMode === "unified" ? " is-active" : ""}`.trim()}
              onClick={() => setViewMode("unified")}
            >
              Unified
            </button>
          </div>
          <span className="tb-runner-diff-surface-diff-stats">
            <span className="tb-runner-diff-surface-diff-count is-added">+{resolvedStats.additions}</span>
            <span className="tb-runner-diff-surface-diff-count is-removed">-{resolvedStats.deletions}</span>
          </span>
          {controlsAccessory}
        </div>
      </div>
      <div
        className={`tb-runner-diff-surface-body ${isExpanded ? "is-expanded" : "is-collapsed"}`.trim()}
        style={isExpanded ? undefined : { maxHeight: `${collapsedBodyMaxHeight}px` }}
      >
        {!normalizedDiff ? (
          <div className="tb-runner-diff-surface-empty">{emptyMessage}</div>
        ) : (
          <DiffView
            diffFile={diffFile}
            diffViewTheme="dark"
            diffViewHighlight
            diffViewFontSize={12}
            diffViewWrap={false}
            diffViewMode={viewMode === "split" ? DiffModeEnum.SplitGitHub : DiffModeEnum.Unified}
            className="tb-runner-diff-package-view"
          />
        )}
      </div>
    </div>
  );
}

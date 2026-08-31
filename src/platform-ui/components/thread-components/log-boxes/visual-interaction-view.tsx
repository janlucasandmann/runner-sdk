import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cloud,
  Globe,
  HardDrive,
  Monitor,
  MousePointerClick,
  Route,
  X,
} from "../../ui/hugeicons-compat.js";
import type { RunnerLog } from "../../../../types.js";
import { buildRunnerPreviewDownloadUrl } from "../document-preview/preview-contracts.js";
import { RunnerImagePreviewSurface } from "../document-preview/image-preview-surface.js";
import { LazyMediaPreviewMount } from "../shared/lazy-media-preview.js";
import { LogHeader, LogPanel } from "./log-card.js";
import { RunnerMarkdown, stripRunnerSystemTags } from "../shared/runner-markdown.js";
import { CompactActionLogLine } from "./compact-action-log-line.js";
import {
  extractWorkspaceImagePathFromOutput,
  extractWorkspaceImagePathFromResult,
} from "./media-state.js";
import { GenericImagePreviewLoadingState } from "./media-view.js";
import {
  isRunnerDetailDrawerPinnedToBottom,
  sanitizeSubagentDisplayText,
  truncateSubagentPreviewText,
} from "./presentation-utils.js";

type BrowserSkillElement = {
  selector?: string;
  text?: string;
  role?: string;
  tag?: string;
};

type BrowserSkillResult = {
  ok: boolean;
  action: string;
  url?: string;
  title?: string;
  selector?: string | null;
  text?: string | null;
  key?: string | null;
  timeoutMs?: number;
  error?: string;
  textExcerpt?: string;
  elements: BrowserSkillElement[];
  screenshotPaths: string[];
  coordinate?: [number, number] | null;
  startCoordinate?: [number, number] | null;
};

type BrowserSkillStep = {
  id: string;
  parsed: BrowserSkillResult;
  previewSrc: string | null;
  previewAlt: string;
  locationLabel: string;
  actionLabel: string;
  isRunning: boolean;
};

type VisualInteractionVariant = "browser" | "computer-use";

export function isBrowserSkillCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes(".claude/skills/browser/") || command.includes("browser.mjs");
}

export function isComputerUseMcpLog(log?: RunnerLog | null): boolean {
  if (!log || log.eventType !== "mcp_tool_call") {
    return false;
  }
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  return serverName === "computer-use" || serverName === "testbase-computer";
}

export function isBrowserSkillLaunchCommand(command?: string): boolean {
  if (!command) return false;
  return /\bbrowser\.mjs\s+launch(?:\s|$)/i.test(command);
}

function normalizeBrowserSkillWorkspacePath(filePath?: string | null): string | null {
  const normalized = String(filePath || "").trim().replace(/^\/workspace\//, "").replace(/^workspace\//, "");
  return normalized ? normalized : null;
}

function isComputerUseWorkspacePath(filePath?: string | null): boolean {
  const normalized = normalizeBrowserSkillWorkspacePath(filePath);
  return Boolean(normalized && normalized.startsWith("tmp/computer-use/"));
}

function guessBrowserSkillAction(command?: string): string {
  if (!command) return "browser";
  const match = command.match(/browser\.mjs\s+([a-z-]+)/i);
  return match?.[1] || "browser";
}

function isUsableBrowserSkillUrl(value?: string | null): boolean {
  const normalized = String(value || "").trim();
  return Boolean(normalized && normalized.toLowerCase() !== "about:blank");
}

function extractBrowserSkillUrlFromCommand(command?: string): string | undefined {
  const normalized = String(command || "");
  const explicitUrlMatch = normalized.match(/(?:--url\s+|navigate\s+)(["']?)(https?:\/\/[^\s"']+|file:\/\/[^\s"']+)\1/i);
  if (explicitUrlMatch?.[2]) {
    return explicitUrlMatch[2];
  }
  const looseUrlMatch = normalized.match(/\b(?:https?:\/\/|file:\/\/)[^\s"']+/i);
  return looseUrlMatch?.[0];
}

function extractBrowserSkillUrlFromText(value?: string): string | undefined {
  const normalized = String(value || "");
  const labeledMatch = normalized.match(
    /(?:current\s+url|page\s+url|browser\s+url|url)\s*[:=]\s*["']?((?:https?:\/\/|file:\/\/)[^\s"',)]+)/i
  );
  if (labeledMatch?.[1]) {
    return labeledMatch[1];
  }
  const looseUrlMatch = normalized.match(/\b(?:https?:\/\/|file:\/\/)[^\s"',)]+/i);
  return looseUrlMatch?.[0];
}

function getBrowserSkillString(record: Record<string, unknown> | null, keys: string[]): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function getNestedBrowserSkillString(record: Record<string, unknown> | null, parentKey: string, keys: string[]): string | undefined {
  const parent = record?.[parentKey];
  if (!parent || typeof parent !== "object" || Array.isArray(parent)) {
    return undefined;
  }
  return getBrowserSkillString(parent as Record<string, unknown>, keys);
}

function resolveBrowserSkillUrl(parsed: Record<string, unknown> | null, command?: string, output?: string): string | undefined {
  const candidates = [
    getBrowserSkillString(parsed, [
      "url",
      "currentUrl",
      "current_url",
      "pageUrl",
      "page_url",
      "browserUrl",
      "browser_url",
      "href",
      "location",
    ]),
    getNestedBrowserSkillString(parsed, "page", ["url", "currentUrl", "href", "location"]),
    getNestedBrowserSkillString(parsed, "browser", ["url", "currentUrl", "href", "location"]),
    getNestedBrowserSkillString(parsed, "context", ["url", "currentUrl", "href", "location"]),
    getNestedBrowserSkillString(parsed, "result", ["url", "currentUrl", "href", "location"]),
    getNestedBrowserSkillString(parsed, "state", ["url", "currentUrl", "href", "location"]),
    extractBrowserSkillUrlFromText(output),
    extractBrowserSkillUrlFromCommand(command),
  ];
  const usable = candidates.find(isUsableBrowserSkillUrl);
  if (usable) {
    return usable.trim();
  }
  const explicitUrl = getBrowserSkillString(parsed, ["url"]);
  return explicitUrl && explicitUrl.toLowerCase() !== "about:blank" ? explicitUrl : undefined;
}

function resolveBrowserSkillTitle(parsed: Record<string, unknown> | null): string | undefined {
  return (
    getBrowserSkillString(parsed, ["title", "pageTitle", "page_title", "displayLabel"]) ||
    getNestedBrowserSkillString(parsed, "page", ["title", "pageTitle", "displayLabel"]) ||
    getNestedBrowserSkillString(parsed, "browser", ["title", "pageTitle", "displayLabel"]) ||
    getNestedBrowserSkillString(parsed, "result", ["title", "pageTitle", "displayLabel"]) ||
    getNestedBrowserSkillString(parsed, "state", ["title", "pageTitle", "displayLabel"])
  );
}

function parseBrowserSkillOutput(output?: string, command?: string): BrowserSkillResult {
  const marker = "BROWSER_SKILL_RESULT::";
  const normalizedOutput = typeof output === "string" ? output : "";
  let parsed: Record<string, unknown> | null = null;

  if (normalizedOutput.includes(marker)) {
    const payload = normalizedOutput
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith(marker));
    if (payload) {
      try {
        parsed = JSON.parse(payload.slice(marker.length)) as Record<string, unknown>;
      } catch {
        parsed = null;
      }
    }
  }

  const explicitPath =
    normalizeBrowserSkillWorkspacePath(typeof parsed?.screenshotPath === "string" ? parsed.screenshotPath : null) ||
    normalizeBrowserSkillWorkspacePath(extractWorkspaceImagePathFromOutput(normalizedOutput));
  const listedPaths = Array.isArray(parsed?.screenshotPaths)
    ? parsed.screenshotPaths
        .map((value) => normalizeBrowserSkillWorkspacePath(typeof value === "string" ? value : null))
        .filter((value): value is string => Boolean(value))
    : [];
  const screenshotPaths = Array.from(new Set([explicitPath, ...listedPaths].filter((value): value is string => Boolean(value))));
  const resolvedUrl = resolveBrowserSkillUrl(parsed, command, normalizedOutput);
  const resolvedTitle = resolveBrowserSkillTitle(parsed);

  return {
    ok: parsed?.ok !== false,
    action: typeof parsed?.action === "string" && parsed.action.trim() ? parsed.action.trim() : guessBrowserSkillAction(command),
    url: resolvedUrl,
    title: resolvedTitle,
    selector: typeof parsed?.selector === "string" ? parsed.selector : null,
    text: typeof parsed?.text === "string" ? parsed.text : null,
    key: typeof parsed?.key === "string" ? parsed.key : null,
    timeoutMs: typeof parsed?.timeoutMs === "number" ? parsed.timeoutMs : undefined,
    error: typeof parsed?.error === "string" ? parsed.error : undefined,
    textExcerpt: typeof parsed?.textExcerpt === "string" ? parsed.textExcerpt : undefined,
    elements: Array.isArray(parsed?.elements)
      ? parsed.elements
          .filter((item) => item && typeof item === "object")
          .map((item) => {
            const entry = item as Record<string, unknown>;
            return {
              selector: typeof entry.selector === "string" ? entry.selector : undefined,
              text: typeof entry.text === "string" ? entry.text : undefined,
              role: typeof entry.role === "string" ? entry.role : undefined,
              tag: typeof entry.tag === "string" ? entry.tag : undefined,
            };
          })
      : [],
    screenshotPaths,
    coordinate: null,
    startCoordinate: null,
  };
}

function extractMarkedJsonPayload(prefix: string, value: unknown): Record<string, unknown> | null {
  const textCandidates: string[] = [];

  const visit = (entry: unknown): void => {
    if (!entry) return;
    if (typeof entry === "string") {
      textCandidates.push(entry);
      return;
    }
    if (Array.isArray(entry)) {
      for (const nestedEntry of entry) visit(nestedEntry);
      return;
    }
    if (typeof entry === "object") {
      const record = entry as Record<string, unknown>;
      if (typeof record.action === "string") {
        textCandidates.push(JSON.stringify(record));
      }
      for (const nestedEntry of Object.values(record)) {
        visit(nestedEntry);
      }
    }
  };

  visit(value);

  for (const candidate of textCandidates) {
    const lines = String(candidate || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    for (const line of lines) {
      if (!line.startsWith(prefix)) {
        continue;
      }
      try {
        const parsed = JSON.parse(line.slice(prefix.length));
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        continue;
      }
    }
  }

  return null;
}

function parseComputerUseOutput(result: unknown): BrowserSkillResult {
  const parsed = extractMarkedJsonPayload("COMPUTER_USE_RESULT::", result);
  const explicitScreenshotPaths = (
    [
      normalizeBrowserSkillWorkspacePath(typeof parsed?.screenshotPath === "string" ? parsed.screenshotPath : null),
      ...(Array.isArray(parsed?.screenshotPaths)
        ? parsed.screenshotPaths.map((value) => normalizeBrowserSkillWorkspacePath(typeof value === "string" ? value : null))
        : []),
    ] as Array<string | null>
  ).filter((value): value is string => Boolean(value));
  const fallbackScreenshotPath = normalizeBrowserSkillWorkspacePath(extractWorkspaceImagePathFromResult(result));
  const fallbackScreenshotPaths =
    isComputerUseWorkspacePath(fallbackScreenshotPath) && fallbackScreenshotPath
      ? [fallbackScreenshotPath]
      : [];
  const screenshotPaths = Array.from(
    new Set(
      explicitScreenshotPaths.length > 0
        ? explicitScreenshotPaths
        : fallbackScreenshotPaths
    )
  );
  const coordinate =
    Array.isArray(parsed?.coordinate) &&
    parsed.coordinate.length >= 2 &&
    Number.isFinite(Number(parsed.coordinate[0])) &&
    Number.isFinite(Number(parsed.coordinate[1]))
      ? [Number(parsed.coordinate[0]), Number(parsed.coordinate[1])] as [number, number]
      : null;
  const startCoordinate =
    Array.isArray(parsed?.startCoordinate) &&
    parsed.startCoordinate.length >= 2 &&
    Number.isFinite(Number(parsed.startCoordinate[0])) &&
    Number.isFinite(Number(parsed.startCoordinate[1]))
      ? [Number(parsed.startCoordinate[0]), Number(parsed.startCoordinate[1])] as [number, number]
      : Array.isArray(parsed?.start_coordinate) &&
          parsed.start_coordinate.length >= 2 &&
          Number.isFinite(Number(parsed.start_coordinate[0])) &&
          Number.isFinite(Number(parsed.start_coordinate[1]))
        ? [Number(parsed.start_coordinate[0]), Number(parsed.start_coordinate[1])] as [number, number]
        : null;

  return {
    ok: parsed?.ok !== false,
    action: typeof parsed?.action === "string" && parsed.action.trim() ? parsed.action.trim() : "computer",
    title:
      typeof parsed?.title === "string" && parsed.title.trim()
        ? parsed.title.trim()
        : typeof parsed?.displayLabel === "string" && parsed.displayLabel.trim()
          ? parsed.displayLabel.trim()
          : "Desktop",
    selector: null,
    text: typeof parsed?.textExcerpt === "string"
      ? parsed.textExcerpt
      : typeof parsed?.text === "string"
        ? parsed.text
        : null,
    key: typeof parsed?.key === "string" ? parsed.key : null,
    error: typeof parsed?.error === "string" ? parsed.error : undefined,
    textExcerpt: typeof parsed?.textExcerpt === "string" ? parsed.textExcerpt : undefined,
    elements: [],
    screenshotPaths,
    coordinate,
    startCoordinate,
  };
}

function formatBrowserSkillAction(action: string): string {
  return action
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function safeDecodeBrowserSkillPath(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function formatBrowserSkillLocationLabel(url?: string, fallbackTitle?: string): string {
  const normalizedUrl = String(url || "").trim();
  if (!isUsableBrowserSkillUrl(normalizedUrl)) {
    return fallbackTitle?.trim() || "Browser";
  }
  try {
    const parsedUrl = new URL(normalizedUrl);
    if (parsedUrl.protocol === "file:") {
      return safeDecodeBrowserSkillPath(parsedUrl.pathname || normalizedUrl) || normalizedUrl;
    }
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      const pathLabel = `${parsedUrl.hostname}${parsedUrl.pathname || "/"}${parsedUrl.search}${parsedUrl.hash}`;
      return pathLabel || normalizedUrl;
    }
    return normalizedUrl;
  } catch {
    return normalizedUrl;
  }
}

function formatBrowserSkillActionTarget(value?: string | null): string {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized.length > 64 ? `${normalized.slice(0, 61)}...` : normalized;
}

function formatInteractionCoordinate(value?: [number, number] | null): string {
  if (!value || value.length < 2) {
    return "";
  }
  return `${Math.round(value[0])}, ${Math.round(value[1])}`;
}

function formatBrowserSkillStepAction(parsed: BrowserSkillResult): string {
  const action = parsed.action.toLowerCase();
  const clickTarget = formatBrowserSkillActionTarget(parsed.text || parsed.selector || parsed.title || parsed.url);
  const fieldTarget = formatBrowserSkillActionTarget(parsed.selector || parsed.title || parsed.url);
  const waitTarget = formatBrowserSkillActionTarget(parsed.selector || parsed.text || parsed.title || parsed.url);
  const coordinateTarget = formatInteractionCoordinate(parsed.coordinate);
  const dragStart = formatInteractionCoordinate(parsed.startCoordinate);

  if (action === "launch") return "Launch browser";
  if (action === "navigate") return "Navigate";
  if (action === "snapshot" || action === "manual") return "Capture page";
  if (action === "screenshot") return "Capture screen";
  if (action === "scroll") return "Scroll";
  if (action === "mouse_move") return coordinateTarget ? `Move cursor to ${coordinateTarget}` : "Move cursor";
  if (action === "hover") return coordinateTarget ? `Hover ${coordinateTarget}` : "Hover";
  if (action === "click") return clickTarget ? `Click ${clickTarget}` : "Click";
  if (action === "left_click") return coordinateTarget ? `Click ${coordinateTarget}` : "Click";
  if (action === "double_click") return coordinateTarget ? `Double click ${coordinateTarget}` : "Double click";
  if (action === "triple_click") return coordinateTarget ? `Triple click ${coordinateTarget}` : "Triple click";
  if (action === "right_click") return coordinateTarget ? `Right click ${coordinateTarget}` : "Right click";
  if (action === "middle_click") return coordinateTarget ? `Middle click ${coordinateTarget}` : "Middle click";
  if (action === "left_mouse_down") return coordinateTarget ? `Mouse down ${coordinateTarget}` : "Mouse down";
  if (action === "left_mouse_up") return coordinateTarget ? `Mouse up ${coordinateTarget}` : "Mouse up";
  if (action === "type") {
    const typedText = formatBrowserSkillActionTarget(parsed.textExcerpt || parsed.text);
    if (typedText) return `Type ${typedText}`;
    return fieldTarget ? `Type into ${fieldTarget}` : "Type";
  }
  if (action === "key") return parsed.key ? `Press ${parsed.key}` : "Press key";
  if (action === "cursor_position") return "Inspect cursor position";
  if (action === "left_click_drag") {
    if (dragStart && coordinateTarget) {
      return `Drag ${dragStart} to ${coordinateTarget}`;
    }
    return "Drag";
  }
  if (action === "press") return parsed.key ? `Press ${parsed.key}` : "Press key";
  if (action === "wait-for") return waitTarget ? `Wait for ${waitTarget}` : "Wait";
  if (action === "wait") return "Wait";
  return formatBrowserSkillAction(parsed.action);
}

function buildBrowserSkillStep({
  log,
  index,
  backendUrl,
  environmentId,
  variant,
}: {
  log: RunnerLog;
  index: number;
  backendUrl?: string;
  environmentId?: string | null;
  variant: VisualInteractionVariant;
}): BrowserSkillStep {
  const command = log.metadata?.command || log.message || "";
  const output = typeof log.metadata?.output === "string" ? log.metadata.output : "";
  const parsed = variant === "computer-use"
    ? parseComputerUseOutput(log.metadata?.result || log.message)
    : parseBrowserSkillOutput(output || log.message, command);
  const previewSources = parsed.screenshotPaths
    .map((filePath) => buildRunnerPreviewDownloadUrl(backendUrl, environmentId, filePath))
    .filter((value): value is string => Boolean(value));
  const previewSrc = previewSources.length > 0 ? previewSources[previewSources.length - 1] : null;
  return {
    id: `${log.time || "00:00"}-${parsed.action}-${index}`,
    parsed,
    previewSrc,
    previewAlt: parsed.title || parsed.url || `Browser screenshot ${index + 1}`,
    locationLabel: formatBrowserSkillLocationLabel(parsed.url, parsed.title),
    actionLabel: formatBrowserSkillStepAction(parsed),
    isRunning: log.metadata?.status === "running" || log.metadata?.status === "started",
  };
}

export function BrowserSkillLogBox({
  log,
  logs,
  timeLabel,
  backendUrl,
  environmentId,
  requestHeaders,
  onOpenDetails,
  isDetailOpen = false,
  environmentName,
  onOpenEnvironmentDesktop,
}: {
  log?: RunnerLog;
  logs?: RunnerLog[];
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  onOpenDetails?: () => void;
  isDetailOpen?: boolean;
  environmentName?: string | null;
  onOpenEnvironmentDesktop?: () => void;
}) {
  const sourceLogs = useMemo(() => {
    const rawLogs = Array.isArray(logs) && logs.length > 0 ? logs : log ? [log] : [];
    return rawLogs.filter((entry) => !isBrowserSkillLaunchCommand(entry.metadata?.command || entry.message || ""));
  }, [log, logs]);
  const variant = useMemo<VisualInteractionVariant>(
    () => (sourceLogs.some((entry) => isComputerUseMcpLog(entry)) ? "computer-use" : "browser"),
    [sourceLogs]
  );
  const steps = useMemo(
    () =>
      sourceLogs.map((entry, index) =>
        buildBrowserSkillStep({
          log: entry,
          index,
          backendUrl,
          environmentId,
          variant,
        })
      ),
    [backendUrl, environmentId, sourceLogs, variant]
  );
  const visibleSteps = useMemo(
    () => steps.filter((step): step is BrowserSkillStep & { previewSrc: string } => Boolean(step.previewSrc)),
    [steps]
  );
  const [collapsed, setCollapsed] = useState(false);
  const [isFollowingLatest, setIsFollowingLatest] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(() => Math.max(0, visibleSteps.length - 1));

  useEffect(() => {
    if (visibleSteps.length === 0) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex((currentIndex) => {
      if (isFollowingLatest) {
        return visibleSteps.length - 1;
      }
      return Math.min(currentIndex, visibleSteps.length - 1);
    });
  }, [isFollowingLatest, visibleSteps.length]);

  const currentStep = visibleSteps[selectedIndex] || visibleSteps[visibleSteps.length - 1] || null;
  const lastLog = sourceLogs[sourceLogs.length - 1];
  const isRunning = Boolean(lastLog && (lastLog.metadata?.status === "running" || lastLog.metadata?.status === "started"));
  const canMoveBackward = selectedIndex > 0;
  const canMoveForward = selectedIndex < visibleSteps.length - 1;
  const cardLabel = variant === "computer-use" ? "Computer Use" : "Browser";
  const cardTitle = visibleSteps.length > 1
    ? `${visibleSteps.length} interactions`
    : currentStep?.actionLabel || (variant === "computer-use" ? "Computer use session" : "Browser session");
  const computerLabel = `${String(environmentName || "Environment").trim() || "Environment"} Computer`;

  function moveToStep(nextIndex: number) {
    setSelectedIndex(nextIndex);
    setIsFollowingLatest(nextIndex >= visibleSteps.length - 1);
  }

  if (sourceLogs.length === 0 || visibleSteps.length === 0) {
    return null;
  }

  return (
    <div className={`tb-log-card tb-log-card-browser${variant === "computer-use" ? " tb-log-card-computer-use" : ""}${isDetailOpen ? " is-detail-open" : ""}`}>
      <LogHeader
        icon={
          variant === "computer-use"
            ? <Monitor className="tb-log-card-small-icon tb-log-card-small-icon-browser" strokeWidth={1.5} />
            : <Globe className="tb-log-card-small-icon tb-log-card-small-icon-browser" strokeWidth={1.5} />
        }
        label={cardLabel}
        title={cardTitle}
        timeLabel={timeLabel}
        meta={isRunning ? <span className="tb-log-card-status">running...</span> : null}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {currentStep ? (
          <div className="tb-browser-carousel">
            {variant === "computer-use" ? (
              onOpenEnvironmentDesktop ? (
                <button
                  type="button"
                  className="tb-browser-carousel-path tb-browser-carousel-path-computer tb-browser-carousel-path-button"
                  title={computerLabel}
                  onClick={onOpenEnvironmentDesktop}
                >
                  <Monitor className="tb-browser-carousel-meta-icon" strokeWidth={1.6} />
                  <span className="tb-browser-carousel-meta-copy">{computerLabel}</span>
                </button>
              ) : (
                <div className="tb-browser-carousel-path tb-browser-carousel-path-computer" title={computerLabel}>
                  <Monitor className="tb-browser-carousel-meta-icon" strokeWidth={1.6} />
                  <span className="tb-browser-carousel-meta-copy">{computerLabel}</span>
                </div>
              )
            ) : (
              <div className="tb-browser-carousel-path" title={currentStep.locationLabel}>
                <HardDrive className="tb-browser-carousel-meta-icon" strokeWidth={1.6} />
                <span className="tb-browser-carousel-meta-copy">{currentStep.locationLabel}</span>
              </div>
            )}
            <div className="tb-browser-carousel-frame">
                <LazyMediaPreviewMount
                  mediaKey={currentStep.previewSrc}
                  className="tb-log-media-lazy-preview"
                  placeholder={<GenericImagePreviewLoadingState className="tb-browser-carousel-surface" />}
                >
                  <RunnerImagePreviewSurface
                    src={currentStep.previewSrc}
                    alt={currentStep.previewAlt}
                    className="tb-browser-carousel-surface"
                    imageClassName="tb-browser-carousel-image"
                    maxHeight={500}
                    fetchHeaders={requestHeaders}
                    loadStrategy="immediate"
                  />
                </LazyMediaPreviewMount>
            </div>
            {currentStep.parsed.error && !currentStep.isRunning ? (
              <div className="tb-log-card-state tb-log-card-state-error">{currentStep.parsed.error}</div>
            ) : null}
            <div className="tb-browser-carousel-footer">
              <div className="tb-browser-carousel-action">
                <MousePointerClick className="tb-browser-carousel-meta-icon" strokeWidth={1.6} />
                <span className="tb-browser-carousel-action-copy">{currentStep.actionLabel}</span>
              </div>
              <div className="tb-browser-carousel-footer-actions">
                <div className="tb-browser-carousel-controls">
                  <button
                    type="button"
                    className="tb-browser-carousel-control"
                    onClick={() => moveToStep(selectedIndex - 1)}
                    disabled={!canMoveBackward}
                    aria-label="Show previous browser step"
                  >
                    <ChevronLeft className="tb-browser-carousel-control-icon" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    className="tb-browser-carousel-control"
                    onClick={() => moveToStep(selectedIndex + 1)}
                    disabled={!canMoveForward}
                    aria-label="Show next browser step"
                  >
                    <ChevronRight className="tb-browser-carousel-control-icon" strokeWidth={1.5} />
                  </button>
                </div>
                {onOpenDetails ? (
                  <button type="button" className="tb-subagent-log-open-button" onClick={onOpenDetails}>
                    <span>View logs</span>
                    <ChevronRight className="tb-subagent-log-open-button-icon" strokeWidth={1.6} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="tb-log-card-empty">No browser output was parsed.</div>
        )}
      </LogPanel>
    </div>
  );
}

export function SubagentLogBox({
  title,
  prompt,
  timeLabel,
  running = false,
  summaryMessage,
  onOpenDetails,
  isDetailOpen = false,
}: {
  title: string;
  prompt?: string | null;
  timeLabel?: string;
  running?: boolean;
  summaryMessage?: string | null;
  onOpenDetails?: () => void;
  isDetailOpen?: boolean;
}) {
  const cleanedPrompt = truncateSubagentPreviewText(prompt);
  const cleanedSummaryMessage = truncateSubagentPreviewText(summaryMessage) || `${title} is working`;
  void timeLabel;
  void isDetailOpen;
  void cleanedPrompt;

  return (
    <CompactActionLogLine
      icon={<Bot className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Subagent"
      detail={[title, running ? "running..." : cleanedSummaryMessage].filter(Boolean).join(" - ")}
      onClick={onOpenDetails}
    />
  );
}

export function ComputerUseDetailDrawer({
  title = "Computer Use",
  variant = "computer-use",
  environmentName,
  workLabel,
  timeLabel,
  running = false,
  onClose,
  children,
}: {
  title?: string;
  variant?: VisualInteractionVariant;
  environmentName?: string | null;
  workLabel: string;
  timeLabel?: string;
  running?: boolean;
  onClose: () => void;
  children?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const scrollElement = bodyRef.current;
    if (!scrollElement) {
      return;
    }
    const resolvedScrollElement = scrollElement;

    function handleScroll() {
      shouldAutoScrollRef.current = isRunnerDetailDrawerPinnedToBottom(resolvedScrollElement);
    }

    handleScroll();
    resolvedScrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => resolvedScrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    const scrollElement = bodyRef.current;
    if (!scrollElement || !shouldAutoScrollRef.current) {
      return;
    }
    scrollElement.scrollTop = scrollElement.scrollHeight;
  }, [children, expanded]);

  return (
    <aside className={`tb-subagent-detail-drawer tb-computer-use-detail-drawer${variant === "browser" ? " tb-browser-detail-drawer" : ""}`}>
      <div className="tb-subagent-detail-drawer-header">
        <div className="tb-subagent-detail-drawer-header-copy">
          {variant === "browser" ? (
            <Globe className="tb-attachment-preview-drawer-header-icon" strokeWidth={1.6} />
          ) : (
            <Monitor className="tb-attachment-preview-drawer-header-icon" strokeWidth={1.6} />
          )}
          <div className="tb-subagent-detail-drawer-header-text">
            <div className="tb-subagent-detail-drawer-title" title={title}>{title}</div>
          </div>
        </div>
        <div className="tb-subagent-detail-drawer-header-actions">
          {timeLabel ? <span className="tb-subagent-detail-drawer-time">{timeLabel}</span> : null}
          <button type="button" className="tb-attachment-preview-drawer-action" onClick={onClose} aria-label={`Close ${variant === "browser" ? "browser" : "computer use"} details`}>
            <X className="tb-attachment-preview-drawer-action-icon" strokeWidth={1.8} />
          </button>
        </div>
      </div>
      <div ref={bodyRef} className="tb-subagent-detail-drawer-body">
        <div className="tb-subagent-log-shell">
          <div className="tb-subagent-log-meta">
            <span className="tb-turn-agent-name">{title}</span>
            {environmentName ? (
              <div className="tb-turn-environment-pill">
                <Cloud className="tb-turn-environment-icon" strokeWidth={1.6} />
                <span className="tb-turn-environment-label">{environmentName}</span>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="tb-work-header"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            <Route className="tb-step-row-icon" strokeWidth={1.5} />
            <span className="tb-work-label">{running ? "Computer use is running" : workLabel}</span>
            {expanded ? <ChevronUp className="tb-chevron" strokeWidth={1.5} /> : <ChevronDown className="tb-chevron" strokeWidth={1.5} />}
          </button>
          <div className={`tb-work-collapse ${expanded ? "" : "collapsed"}`}>
            {expanded ? (
              <div className="tb-work-collapse-inner">
                {children ? (
                  <div className="agent-steps-container tb-subagent-log-steps">
                    <div className="agent-steps-line" />
                    {children}
                  </div>
                ) : (
                  <div className="tb-log-card-empty">No computer-use logs yet.</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function SubagentDetailDrawer({
  title,
  prompt,
  environmentName,
  workLabel,
  timeLabel,
  running = false,
  responseMessage,
  responseFailed = false,
  onClose,
  children,
}: {
  title: string;
  prompt?: string | null;
  environmentName?: string | null;
  workLabel: string;
  timeLabel?: string;
  running?: boolean;
  responseMessage?: string | null;
  responseFailed?: boolean;
  onClose: () => void;
  children?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const cleanedPrompt = stripRunnerSystemTags(String(prompt || "")).trim();
  const cleanedResponseMessage = sanitizeSubagentDisplayText(responseMessage);

  return (
    <aside className="tb-subagent-detail-drawer">
      <div className="tb-subagent-detail-drawer-header">
        <div className="tb-subagent-detail-drawer-header-copy">
          <Bot className="tb-attachment-preview-drawer-header-icon" strokeWidth={1.6} />
          <div className="tb-subagent-detail-drawer-header-text">
            <div className="tb-subagent-detail-drawer-title" title={title}>{title}</div>
          </div>
        </div>
        <div className="tb-subagent-detail-drawer-header-actions">
          {timeLabel ? <span className="tb-subagent-detail-drawer-time">{timeLabel}</span> : null}
          <button type="button" className="tb-attachment-preview-drawer-action" onClick={onClose} aria-label="Close subagent details">
            <X className="tb-attachment-preview-drawer-action-icon" strokeWidth={1.8} />
          </button>
        </div>
      </div>
      <div className="tb-subagent-detail-drawer-body">
        <div className="tb-subagent-log-shell">
          {cleanedPrompt ? (
            <div className="tb-subagent-log-prompt">
              <RunnerMarkdown
                content={cleanedPrompt}
                className="tb-message-markdown tb-message-markdown-user tb-subagent-log-prompt-markdown"
                softBreaks
                disallowHeadings
              />
            </div>
          ) : null}
          <div className="tb-subagent-log-meta">
            <span className="tb-turn-agent-name">{title}</span>
            {environmentName ? (
              <div className="tb-turn-environment-pill">
                <Cloud className="tb-turn-environment-icon" strokeWidth={1.6} />
                <span className="tb-turn-environment-label">{environmentName}</span>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="tb-work-header"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            <Route className="tb-step-row-icon" strokeWidth={1.5} />
            <span className="tb-work-label">{running ? `${title} is working` : workLabel}</span>
            {expanded ? <ChevronUp className="tb-chevron" strokeWidth={1.5} /> : <ChevronDown className="tb-chevron" strokeWidth={1.5} />}
          </button>
          <div className={`tb-work-collapse ${expanded ? "" : "collapsed"}`}>
            {expanded ? (
              <div className="tb-work-collapse-inner">
                {children ? (
                  <div className="agent-steps-container tb-subagent-log-steps">
                    <div className="agent-steps-line" />
                    {children}
                  </div>
                ) : (
                  <div className="tb-log-card-empty">No subagent logs yet.</div>
                )}
              </div>
            ) : null}
          </div>
          {cleanedResponseMessage ? (
            <div className={`tb-subagent-log-summary ${responseFailed ? "is-error" : ""}`.trim()}>
              <RunnerMarkdown
                content={cleanedResponseMessage}
                className="tb-message-markdown tb-message-markdown-summary"
                softBreaks
              />
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

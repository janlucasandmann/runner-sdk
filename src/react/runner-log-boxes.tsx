import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Bookmark,
  Bot,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUp,
  Cloud,
  Copy,
  Cpu,
  Equal,
  Eye,
  FileImage,
  FilePlus,
  FileSearch,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  HardDrive,
  Images,
  Lightbulb,
  LoaderCircle,
  ListChevronsUpDown,
  ListTodo,
  Mail,
  Monitor,
  MousePointerClick,
  Route,
  Music,
  Paperclip,
  ScanText,
  Search,
  SlidersHorizontal,
  Telescope,
  Terminal,
  Video,
  X,
} from "lucide-react";
import type { RunnerDeepResearchSession, RunnerLog } from "../types.js";
import {
  buildRunnerPreviewAttachmentFromPath,
  buildRunnerPreviewDownloadUrl,
  buildRunnerPreviewHtmlDocument,
  getRunnerDocumentPreviewKind,
  type RunnerPreviewAttachment,
} from "./runner-document-preview.js";
import { RunnerFileDiffSurface } from "./runner-file-diff-surface.js";
import { RunnerImagePreviewSurface } from "./runner-image-preview-surface.js";
import { RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS, getRunnerChatEnterAnimationStyle } from "./runner-chat-animations.js";
import { ComputerAgentsListLogBox, parseComputerAgentsListLogDetails, type ComputerAgentsListAvailableAgent } from "./runner-agents-list-log-box.js";
import { ComputerAgentsEnvironmentsListLogBox, parseComputerAgentsEnvironmentsListLogDetails, type ComputerAgentsListAvailableEnvironment } from "./runner-environments-list-log-box.js";
import { TaskManagementProjectsListLogBox, parseTaskManagementProjectsListLogDetails, type TaskManagementListAvailableEnvironment, type TaskManagementListAvailableProject } from "./runner-projects-list-log-box.js";
import { GitCommitLogBox, parseGitCommitLogDetails } from "./runner-git-commit-log-box.js";
import { GitDiffLogBox, parseGitDiffLogDetails } from "./runner-git-diff-log-box.js";
import { GitStatusLogBox, parseGitStatusLogDetails } from "./runner-git-status-log-box.js";
import { LogHeader, LogPanel } from "./runner-log-card.js";
import { RunnerMarkdown, stripRunnerSystemTags } from "./runner-markdown.js";

const RUNNER_TEXT_FILE_ICON_URL = new URL("./assets/txtfile.png", import.meta.url).toString();
const RUNNER_FOLDER_ICON_URL = new URL("./assets/folder.png", import.meta.url).toString();
const RUNNER_IMAGE_FILE_ICON_URL = new URL("./assets/imgicon.webp", import.meta.url).toString();
const RUNNER_TRANSPARENT_LOGO_URL = "https://computer-agents.com/img/logos/runnertransparent.png";
const RUNNER_DETAIL_DRAWER_AUTO_SCROLL_THRESHOLD_PX = 24;
const RUNNER_WORKSPACE_PATH_MATCHER = /\/workspace\/\S+/g;

function isRunnerDetailDrawerPinnedToBottom(element: HTMLDivElement): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= RUNNER_DETAIL_DRAWER_AUTO_SCROLL_THRESHOLD_PX;
}

function sanitizeSubagentDisplayText(value: string | null | undefined): string {
  return stripRunnerSystemTags(String(value || ""))
    .replace(/^\s*agentId:\s.*$/gim, "")
    .replace(/<usage>[\s\S]*?<\/usage>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncateSubagentPreviewText(value: string | null | undefined, maxLength = 300): string {
  const cleaned = sanitizeSubagentDisplayText(value);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, maxLength).trimEnd()}...`;
}

function trimRunnerWorkspacePathMatch(rawValue: string): { path: string; trailing: string } {
  let boundaryIndex = rawValue.length;
  while (boundaryIndex > 0 && /[),.;:!?}\]"']/.test(rawValue.charAt(boundaryIndex - 1))) {
    boundaryIndex -= 1;
  }
  return {
    path: rawValue.slice(0, boundaryIndex),
    trailing: rawValue.slice(boundaryIndex),
  };
}

function renderTextWithWorkspacePathLinks(
  text: string,
  {
    onWorkspacePathClick,
    keyPrefix,
    className = "tb-message-markdown-link",
    style,
  }: {
    onWorkspacePathClick?: ((path: string) => void) | null;
    keyPrefix: string;
    className?: string;
    style?: CSSProperties;
  }
): ReactNode {
  if (!text || typeof onWorkspacePathClick !== "function") {
    return text;
  }

  const matcher = new RegExp(RUNNER_WORKSPACE_PATH_MATCHER);
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = matcher.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const rawValue = String(match[0] || "");
    const { path, trailing } = trimRunnerWorkspacePathMatch(rawValue);
    if (path) {
      nodes.push(
        <a
          key={`${keyPrefix}-workspace-path-${match.index}`}
          href={path}
          className={className}
          style={style}
          onClick={(event) => {
            event.preventDefault();
            onWorkspacePathClick(path);
          }}
        >
          {path}
        </a>
      );
    } else {
      nodes.push(rawValue);
    }

    if (trailing) {
      nodes.push(trailing);
    }

    lastIndex = match.index + rawValue.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : text;
}

interface RunnerWorkLogEntryProps {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  renderComputerUseMcpAsGeneric?: boolean;
  activeTaskPreviewId?: string | null;
  availableAgents?: ComputerAgentsListAvailableAgent[];
  availableEnvironments?: ComputerAgentsListAvailableEnvironment[];
  availableProjects?: TaskManagementListAvailableProject[];
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
  onWorkspacePathClick?: (path: string) => void;
  onPermissionDecision?: (log: RunnerLog, decision: "allow" | "deny") => Promise<void> | void;
  onTaskPreviewClick?: (preview: {
    taskId: string;
    projectId: string;
    projectName?: string;
    threadId?: string;
    ticketNumber: string;
    title: string;
    description?: string;
    taskColor?: string;
    status?: string;
    priority?: string;
    taskType?: string;
    assigneeAgentId?: string;
    assigneeName?: string;
    environmentId?: string;
    environmentName?: string;
    isDeleted?: boolean;
  }) => void;
  onAgentPreviewClick?: (agent: { agentId: string; agentName?: string }) => void;
  onEnvironmentPreviewClick?: (environment: { environmentId: string; environmentName?: string }) => void;
  onProjectPreviewClick?: (project: { projectId: string; projectName?: string }) => void;
}

function isRunnerLogImageFilePath(filePath?: string | null): boolean {
  return /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(String(filePath || "").trim());
}

let runnerLogThemeRegistered = false;
let runnerLogMonacoLoader: Promise<any> | null = null;
const RUNNER_LOG_DEFAULT_THEME = "runner-log-transparent";
const RUNNER_LOG_TERMINAL_THEME = "runner-log-terminal";

const RUNNER_LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  json: "json",
  jsonc: "json",
  py: "python",
  css: "css",
  scss: "scss",
  sass: "scss",
  less: "less",
  html: "html",
  htm: "html",
  md: "markdown",
  markdown: "markdown",
  mdx: "markdown",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  fish: "shell",
  yml: "yaml",
  yaml: "yaml",
  xml: "xml",
  svg: "xml",
  sql: "sql",
  java: "java",
  go: "go",
  rs: "rust",
  php: "php",
  rb: "ruby",
  toml: "ini",
};

function loadRunnerLogMonacoModule() {
  if (!runnerLogMonacoLoader) {
    runnerLogMonacoLoader = import("@monaco-editor/react").catch(() => null);
  }
  return runnerLogMonacoLoader;
}

function ensureRunnerLogMonacoTheme(monaco: any) {
  if (runnerLogThemeRegistered) return;
  monaco.editor.defineTheme(RUNNER_LOG_DEFAULT_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#00000000",
      "editorGutter.background": "#00000000",
      "editorLineNumber.foreground": "#ffffff52",
      "editorLineNumber.activeForeground": "#ffffff72",
      "editorLineHighlightBackground": "#00000000",
      "editor.selectionBackground": "#ffffff12",
      "editor.inactiveSelectionBackground": "#ffffff08",
      "scrollbar.shadow": "#00000000",
      "diffEditor.insertedTextBackground": "#2ea04333",
      "diffEditor.removedTextBackground": "#f8514933",
      "diffEditor.insertedLineBackground": "#2ea04324",
      "diffEditor.removedLineBackground": "#f8514924",
      "diffEditor.diagonalFill": "#00000000",
    },
  });
  monaco.editor.defineTheme(RUNNER_LOG_TERMINAL_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "string", foreground: "D4D4D4" },
      { token: "string.escape", foreground: "9CDCFE" },
      { token: "number", foreground: "B5CEA8" },
      { token: "keyword", foreground: "C586C0" },
      { token: "comment", foreground: "6A9955" },
      { token: "delimiter", foreground: "D4D4D4" },
      { token: "invalid", foreground: "D4D4D4" },
    ],
    colors: {
      "editor.background": "#00000000",
      "editorGutter.background": "#00000000",
      "editorLineNumber.foreground": "#ffffff52",
      "editorLineNumber.activeForeground": "#ffffff72",
      "editorLineHighlightBackground": "#00000000",
      "editor.selectionBackground": "#ffffff12",
      "editor.inactiveSelectionBackground": "#ffffff08",
      "scrollbar.shadow": "#00000000",
    },
  });
  runnerLogThemeRegistered = true;
}

function normalizeRunnerFilePath(filePath?: string | null): string | undefined {
  if (!filePath) return undefined;
  const trimmed = String(filePath).trim().replace(/^['"`]+|['"`]+$/g, "");
  if (!trimmed) return undefined;
  return trimmed;
}

function isRunnerNullDevicePath(filePath?: string | null): boolean {
  const normalized = normalizeRunnerFilePath(filePath);
  return normalized === "/dev/null" || normalized === "dev/null";
}

function getFileName(filePath: string): string {
  const parts = filePath.split("/");
  return parts[parts.length - 1] || filePath;
}

function formatBytes(bytes?: number): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function looksLikeMarkdown(content: string, filePath?: string): boolean {
  const lowerPath = filePath?.toLowerCase() || "";
  if (lowerPath.endsWith(".md") || lowerPath.endsWith(".markdown")) {
    return true;
  }
  return [
    /^#+\s+/m,
    /\*\*[^*]+\*\*/,
    /\[[^\]]+\]\([^)]+\)/,
    /^[-*]\s+/m,
    /^>\s+/m,
    /```[\s\S]*```/,
  ].some((pattern) => pattern.test(content));
}

function extractWorkspacePathFromText(text?: string | null): string | null {
  if (!text) return null;
  const patterns = [
    /["'`](\/workspace\/[^"'`\n]+?)["'`]/,
    /(\/workspace\/[^\s"'`|&;]+)/,
  ];
  for (const pattern of patterns) {
    const match = String(text).match(pattern);
    const normalized = normalizeRunnerFilePath(match?.[1]);
    if (normalized) return normalized;
  }
  return null;
}

function extractShellPayload(command: string): string | null {
  const patterns = [
    /^\s*(?:\/bin\/)?bash\s+-lc\s+"([\s\S]*)"\s*$/,
    /^\s*(?:\/bin\/)?bash\s+-lc\s+'([\s\S]*)'\s*$/,
    /^\s*(?:\/bin\/)?sh\s+-lc\s+"([\s\S]*)"\s*$/,
    /^\s*(?:\/bin\/)?sh\s+-lc\s+'([\s\S]*)'\s*$/,
  ];
  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (!match?.[1]) continue;
    return match[1]
      .replace(/\\"/g, `"`)
      .replace(/\\'/g, `'`)
      .replace(/\\\\/g, `\\`);
  }
  return null;
}

function formatShellCommandForDisplay(command: string): string {
  const payload = extractShellPayload(command);
  return payload ? payload.trim() : command.trim();
}

function escapeRunnerHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inferEmbeddedShellLanguage(headerLine: string): string {
  const lower = headerLine.toLowerCase();
  if (/\bpython(?:3(?:\.\d+)?)?\b/.test(lower)) return "python";
  if (/\b(?:tsx|ts-node)\b/.test(lower)) return "typescript";
  if (/\b(?:node|deno)\b/.test(lower)) return "javascript";
  if (/\b(?:bash|sh|zsh)\b/.test(lower)) return "shell";
  if (/\bruby\b/.test(lower)) return "ruby";
  if (/\bphp\b/.test(lower)) return "php";
  return "plaintext";
}

function parseShellCommandSegments(command: string):
  | {
      header: string;
      body: string;
      footer: string;
    }
  | null {
  const trimmed = command.trimEnd();
  const commandWithPrompt = trimmed.startsWith("$") ? trimmed : `$ ${trimmed}`;
  const match = commandWithPrompt.match(/^(\$\s*[^\n]*<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?[^\n]*)(?:\n)([\s\S]*?)(?:\n\2)\s*$/);
  if (!match?.[1] || !match[2]) return null;
  return {
    header: match[1],
    body: match[3] || "",
    footer: match[2],
  };
}

function renderShellTokenizedHtml(command: string): string {
  const lines = command.split("\n");
  const tokenPattern = /(\s+|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\|\||&&|>>|<<-?|[|&;(){}]|[^\s"'|&;(){}]+)/g;

  return lines
    .map((line) => {
      const tokens = Array.from(line.matchAll(tokenPattern)).map((match) => match[0]);
      let commandTokenSeen = false;
      let html = "";

      for (const token of tokens) {
        if (/^\s+$/.test(token)) {
          html += escapeRunnerHtml(token);
          continue;
        }

        let className = "tb-log-shell-token";
        if (token === "$") {
          className += " is-prompt";
        } else if (/^"(?:\\.|[^"])*"$/.test(token) || /^'(?:\\.|[^'])*'$/.test(token)) {
          className += " is-string";
        } else if (/^-{1,2}[A-Za-z0-9_-]+$/.test(token)) {
          className += " is-flag";
        } else if (/^(?:\|\||&&|\||;|>>|<<-?|[(){}])$/.test(token)) {
          className += " is-operator";
        } else if (/^(?:\.{0,2}\/|\/)[^\s]*$/.test(token)) {
          className += " is-path";
        } else if (/^\d+$/.test(token)) {
          className += " is-number";
        } else if (!commandTokenSeen) {
          className += " is-command";
          commandTokenSeen = true;
        }

        html += `<span class="${className}">${escapeRunnerHtml(token)}</span>`;
      }

      return html || "&nbsp;";
    })
    .join("\n");
}

function extractQuotedArgument(command: string, flagPattern: string): string | null {
  const flagRegex = new RegExp(`(?:${flagPattern})\\s+`, "i");
  const match = command.match(flagRegex);
  if (!match || match.index === undefined) return null;
  const rest = command.slice(match.index + match[0].length);
  const first = rest[0];
  if (first === `"` || first === `'`) {
    let value = "";
    for (let index = 1; index < rest.length; index += 1) {
      const current = rest[index];
      if (current === "\\" && index + 1 < rest.length) {
        value += rest[index + 1];
        index += 1;
        continue;
      }
      if (current === first) break;
      value += current;
    }
    return value.trim();
  }
  const unquoted = rest.match(/^(\S+)/);
  return unquoted ? unquoted[1].trim() : null;
}

function detectCodeLanguage(content: string, filePath?: string): string {
  const normalizedPath = normalizeRunnerFilePath(filePath);
  const lowerPath = (normalizedPath || "").toLowerCase();
  const extension = lowerPath.split(".").pop() || "";
  const mappedLanguage = RUNNER_LANGUAGE_BY_EXTENSION[extension];
  const trimmedContent = content.trimStart();

  if (mappedLanguage) return mappedLanguage;
  if (lowerPath.endsWith(".zshrc") || lowerPath.endsWith(".bashrc")) return "shell";
  if (/^#!.*\b(?:ba|z)?sh\b/m.test(content)) return "shell";
  if (/^#!.*\bpython(?:3(?:\.\d+)?)?\b/m.test(content)) return "python";
  if (/<!doctype html/i.test(trimmedContent) || /<(html|head|body)\b/i.test(trimmedContent)) return "html";
  if (/^<\?xml\b/i.test(trimmedContent) || /<svg\b/i.test(trimmedContent)) return "xml";
  if (looksLikeMarkdown(content, normalizedPath)) return "markdown";
  if (/^[\s\n]*[{[]/.test(content)) return "json";
  if (/^\s*[\w"'`-]+\s*:\s*.+$/m.test(content) && !/[{};]/.test(content)) return "yaml";
  if (/^\s*(?:from\s+\w+\s+import|import\s+\w+|def\s+\w+\(|class\s+\w+[:(])/m.test(content)) return "python";
  if (/^\s*(?:export\s+|import\s.+from\s.+;?|const\s+|let\s+|var\s+|function\s+|class\s+)/m.test(content)) return "javascript";
  if (/^\s*(?:[#.][\w-]+\s*\{|@media\b|@layer\b|@supports\b|--[\w-]+\s*:)/m.test(content)) return "css";
  return "plaintext";
}

function formatCodeLanguageLabel(language: string): string {
  if (language === "typescript") return "TypeScript";
  if (language === "javascript") return "JavaScript";
  if (language === "json") return "JSON";
  if (language === "python") return "Python";
  if (language === "css") return "CSS";
  if (language === "scss") return "SCSS";
  if (language === "less") return "Less";
  if (language === "html") return "HTML";
  if (language === "markdown") return "Markdown";
  if (language === "shell") return "Bash";
  if (language === "yaml") return "YAML";
  if (language === "xml") return "XML";
  if (language === "sql") return "SQL";
  if (language === "java") return "Java";
  if (language === "go") return "Go";
  if (language === "rust") return "Rust";
  if (language === "php") return "PHP";
  if (language === "ruby") return "Ruby";
  if (language === "ini") return "TOML";
  return "Plain Text";
}

async function copyRunnerText(text: string) {
  if (globalThis.navigator?.clipboard?.writeText) {
    await globalThis.navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function RunnerCodeViewer({
  content,
  filePath,
  language,
  maxHeight,
  showLineNumbers = false,
  className,
}: {
  content: string;
  filePath?: string;
  language?: string;
  maxHeight?: number;
  showLineNumbers?: boolean;
  className?: string;
}) {
  const [EditorComponent, setEditorComponent] = useState<any>(null);
  const resolvedLanguage = language || detectCodeLanguage(content, filePath);
  const lineCount = Math.max(1, content.split("\n").length);
  const naturalHeight = Math.max(lineCount * 18 + 8, 26);
  const height = typeof maxHeight === "number" ? Math.min(naturalHeight, maxHeight) : naturalHeight;
  const isScrollable = typeof maxHeight === "number" && naturalHeight > maxHeight;
  const normalizedFilePath = normalizeRunnerFilePath(filePath);
  const editorKey = `${resolvedLanguage}:${normalizedFilePath || "inline"}:${content.length}:${height}:${showLineNumbers ? "ln" : "nln"}`;

  useEffect(() => {
    let isCancelled = false;
    void loadRunnerLogMonacoModule().then((module) => {
      const editorComponent = module?.Editor || module?.default || null;
      if (!isCancelled) {
        setEditorComponent(() => editorComponent);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className={`tb-log-card-code ${className || ""}`.trim()}>
      {EditorComponent ? (
        <EditorComponent
          key={editorKey}
          beforeMount={ensureRunnerLogMonacoTheme}
          height={height}
          language={resolvedLanguage}
          path={normalizedFilePath}
          theme="runner-log-transparent"
          value={content}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 12,
            lineHeight: 18,
            lineNumbers: showLineNumbers ? "on" : "off",
            folding: false,
            wordWrap: "off",
            automaticLayout: true,
            scrollbar: {
              vertical: isScrollable ? "auto" : "hidden",
              horizontal: "auto",
              verticalScrollbarSize: isScrollable ? 8 : 0,
              horizontalScrollbarSize: 8,
              alwaysConsumeMouseWheel: false,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            renderLineHighlight: "none",
            contextmenu: false,
            selectionHighlight: false,
            occurrencesHighlight: "off",
            glyphMargin: false,
            lineDecorationsWidth: showLineNumbers ? 8 : 0,
            lineNumbersMinChars: showLineNumbers ? 4 : 0,
            guides: {
              indentation: false,
              highlightActiveIndentation: false,
            },
            padding: { top: 0, bottom: 0 },
          }}
        />
      ) : (
        <pre className="tb-log-card-code-fallback">
          <code>{content}</code>
        </pre>
      )}
    </div>
  );
}

function RunnerInlineSyntaxViewer({
  content,
  language,
  themeName = RUNNER_LOG_DEFAULT_THEME,
}: {
  content: string;
  language: string;
  themeName?: string;
}) {
  const [colorizedHtml, setColorizedHtml] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setColorizedHtml(null);

    void loadRunnerLogMonacoModule().then(async (module) => {
      const loader = module?.loader;
      if (!loader?.init) {
        if (!isCancelled) {
          setColorizedHtml(null);
        }
        return;
      }

      try {
        const monaco = await loader.init();
        if (isCancelled || !monaco?.editor?.colorize) {
          return;
        }
        ensureRunnerLogMonacoTheme(monaco);
        const html = await monaco.editor.colorize(content, language, {
          theme: themeName,
        });
        if (!isCancelled) {
          setColorizedHtml(html);
        }
      } catch {
        if (!isCancelled) {
          setColorizedHtml(null);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [content, language, themeName]);

  if (!colorizedHtml) {
    return (
      <pre className="tb-log-inline-code-fallback">
        <code>{content}</code>
      </pre>
    );
  }

  return <div className="tb-log-inline-code" dangerouslySetInnerHTML={{ __html: colorizedHtml }} />;
}

function RunnerStaticCodeViewer({
  content,
  language,
  className,
  themeName = RUNNER_LOG_DEFAULT_THEME,
}: {
  content: string;
  language: string;
  className?: string;
  themeName?: string;
}) {
  const [colorizedHtml, setColorizedHtml] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setColorizedHtml(null);

    void loadRunnerLogMonacoModule().then(async (module) => {
      const loader = module?.loader;
      if (!loader?.init) {
        if (!isCancelled) {
          setColorizedHtml(null);
        }
        return;
      }

      try {
        const monaco = await loader.init();
        if (isCancelled || !monaco?.editor?.colorize) {
          return;
        }
        ensureRunnerLogMonacoTheme(monaco);
        const html = await monaco.editor.colorize(content, language, {
          theme: themeName,
        });
        if (!isCancelled) {
          setColorizedHtml(html);
        }
      } catch {
        if (!isCancelled) {
          setColorizedHtml(null);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [content, language, themeName]);

  if (!colorizedHtml) {
    return (
      <pre className={`tb-log-static-code-fallback ${className || ""}`.trim()}>
        <code>{content}</code>
      </pre>
    );
  }

  return (
    <pre className={`tb-log-static-code ${className || ""}`.trim()}>
      <code dangerouslySetInnerHTML={{ __html: colorizedHtml }} />
    </pre>
  );
}

function RunnerShellCommandViewer({
  command,
}: {
  command: string;
}) {
  const displayCommand = useMemo(() => {
    const trimmed = command.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("$") ? trimmed : `$ ${trimmed}`;
  }, [command]);
  const segments = useMemo(() => parseShellCommandSegments(displayCommand), [displayCommand]);
  const shellHtml = useMemo(() => renderShellTokenizedHtml(displayCommand), [displayCommand]);

  if (!displayCommand) return null;
  if (!segments) {
    return (
      <pre className="tb-log-shell-command">
        <code dangerouslySetInnerHTML={{ __html: shellHtml }} />
      </pre>
    );
  }

  return (
    <div className="tb-log-terminal-command-stack">
      <pre className="tb-log-shell-command">
        <code dangerouslySetInnerHTML={{ __html: renderShellTokenizedHtml(segments.header) }} />
      </pre>
      <pre className="tb-log-shell-command tb-log-terminal-command-code tb-log-terminal-command-code-body">
        <code dangerouslySetInnerHTML={{ __html: renderShellTokenizedHtml(segments.body) }} />
      </pre>
      <pre className="tb-log-shell-command">
        <code dangerouslySetInnerHTML={{ __html: renderShellTokenizedHtml(segments.footer) }} />
      </pre>
    </div>
  );
}

type RunnerAnsiSegment = {
  text: string;
  color: string | null;
  bold: boolean;
};

const RUNNER_ANSI_COLOR_MAP: Record<number, string> = {
  30: "#8b949e",
  31: "#ff7b72",
  32: "#3fb950",
  33: "#d29922",
  34: "#79c0ff",
  35: "#d2a8ff",
  36: "#39c5cf",
  37: "#f0f6fc",
  90: "#6e7681",
  91: "#ffa198",
  92: "#56d364",
  93: "#e3b341",
  94: "#a5d6ff",
  95: "#e2c5ff",
  96: "#56d4dd",
  97: "#ffffff",
};

function applyRunnerAnsiCodes(
  state: { color: string | null; bold: boolean },
  codes: number[],
): { color: string | null; bold: boolean } {
  let nextState = { ...state };
  const normalizedCodes = codes.length > 0 ? codes : [0];

  for (const code of normalizedCodes) {
    if (code === 0) {
      nextState = { color: null, bold: false };
      continue;
    }
    if (code === 1) {
      nextState.bold = true;
      continue;
    }
    if (code === 22) {
      nextState.bold = false;
      continue;
    }
    if (code === 39) {
      nextState.color = null;
      continue;
    }
    if (RUNNER_ANSI_COLOR_MAP[code]) {
      nextState.color = RUNNER_ANSI_COLOR_MAP[code];
    }
  }

  return nextState;
}

function parseRunnerAnsiSegments(content: string): RunnerAnsiSegment[] {
  const normalized = content.replace(/\r\n/g, "\n");
  const ansiRegex = /\u001b\[([0-9;]*)m/g;
  const segments: RunnerAnsiSegment[] = [];
  let state = { color: null as string | null, bold: false };
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = ansiRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: normalized.slice(lastIndex, match.index),
        color: state.color,
        bold: state.bold,
      });
    }

    const codes = (match[1] || "")
      .split(";")
      .filter((value) => value.length > 0)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    state = applyRunnerAnsiCodes(state, codes);
    lastIndex = ansiRegex.lastIndex;
  }

  if (lastIndex < normalized.length) {
    segments.push({
      text: normalized.slice(lastIndex),
      color: state.color,
      bold: state.bold,
    });
  }

  if (segments.length === 0) {
    return [{ text: normalized, color: null, bold: false }];
  }

  return segments;
}

function RunnerAnsiOutput({
  content,
  isError,
  onWorkspacePathClick,
}: {
  content: string;
  isError?: boolean;
  onWorkspacePathClick?: (path: string) => void;
}) {
  const segments = useMemo(() => parseRunnerAnsiSegments(content), [content]);

  return (
    <pre className={`tb-log-terminal-output ${isError ? "is-error" : ""}`}>
      {segments.map((segment, index) => {
        const segmentStyle = {
          color: segment.color || undefined,
          fontWeight: segment.bold ? 600 : undefined,
        } satisfies CSSProperties;
        return (
          <span key={`${index}-${segment.text.length}`} style={segmentStyle}>
            {renderTextWithWorkspacePathLinks(segment.text, {
              onWorkspacePathClick,
              keyPrefix: `ansi-${index}`,
              style: segmentStyle,
            })}
          </span>
        );
      })}
    </pre>
  );
}

function isSkillLaunchNotice(content: string): boolean {
  const normalized = content.trim();
  return /^Launching skill:\s+.+$/i.test(normalized) && !normalized.includes("\n");
}

function RunnerTerminalStatus({
  content,
  onWorkspacePathClick,
}: {
  content: string;
  onWorkspacePathClick?: (path: string) => void;
}) {
  const normalizedContent = content.trim();
  return (
    <div className="tb-log-terminal-status">
      {renderTextWithWorkspacePathLinks(normalizedContent, {
        onWorkspacePathClick,
        keyPrefix: "terminal-status",
      })}
    </div>
  );
}

type RunnerFileDiffMetadata = {
  diff?: string;
  changes?: string;
  additions?: number;
  deletions?: number;
};

export type RunnerLogFileChangePreview = {
  path: string;
  kind: "created" | "modified" | "deleted";
  content?: string;
  diff?: string;
  additions?: number;
  deletions?: number;
};

function resolveFileMapValue<T>(map: Record<string, T> | undefined, filePath?: string): T | undefined {
  if (!map || !filePath) return undefined;
  if (map[filePath] !== undefined) return map[filePath];
  const normalizedPath = filePath.replace(/^\.?\//, "").replace(/^\/workspace\//, "");
  for (const [key, value] of Object.entries(map)) {
    const normalizedKey = key.replace(/^\.?\//, "").replace(/^\/workspace\//, "");
    if (normalizedKey === normalizedPath) {
      return value;
    }
  }
  return undefined;
}

function resolveFileDiffMetadata(log: RunnerLog, filePath?: string): RunnerFileDiffMetadata | null {
  const diffs = log.metadata?.diffs as Record<string, RunnerFileDiffMetadata> | undefined;
  return resolveFileMapValue(diffs, filePath) || null;
}

function countDiffStats(diffText: string): { additions: number; deletions: number } {
  return {
    additions: (diffText.match(/^\+[^+]/gm) || []).length,
    deletions: (diffText.match(/^-[^-]/gm) || []).length,
  };
}

function buildStructuredPatchDiff(
  filePath: string,
  patches: Array<{
    oldStart?: number;
    oldLines?: number;
    newStart?: number;
    newLines?: number;
    lines?: string[];
  }>,
  operation: "created" | "modified" | "deleted"
): string {
  const normalizedPath = String(filePath || "").replace(/^\/+/, "");
  const oldHeaderPath = operation === "created" ? "/dev/null" : `a/${normalizedPath}`;
  const newHeaderPath = operation === "deleted" ? "/dev/null" : `b/${normalizedPath}`;
  const lines = [`--- ${oldHeaderPath}`, `+++ ${newHeaderPath}`];

  for (const patch of patches) {
    const oldStart = Number.isFinite(patch.oldStart) ? Number(patch.oldStart) : 1;
    const oldLines = Number.isFinite(patch.oldLines) ? Number(patch.oldLines) : 0;
    const newStart = Number.isFinite(patch.newStart) ? Number(patch.newStart) : 1;
    const newLines = Number.isFinite(patch.newLines) ? Number(patch.newLines) : 0;
    lines.push(`@@ -${oldStart},${oldLines} +${newStart},${newLines} @@`);
    if (Array.isArray(patch.lines)) {
      lines.push(...patch.lines.map((entry) => String(entry)));
    }
  }

  return lines.join("\n");
}

function buildCreatedFileDiff(filePath: string, content: string): string {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const lines = normalizedContent.split("\n");
  const body = lines.map((line) => `+${line}`).join("\n");
  return `--- /dev/null\n+++ b/${filePath}\n@@ -0,0 +1,${lines.length} @@\n${body}`;
}

function buildDeletedFileDiff(filePath: string, content: string): string {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const lines = normalizedContent.split("\n");
  const body = lines.map((line) => `-${line}`).join("\n");
  return `--- a/${filePath}\n+++ /dev/null\n@@ -1,${lines.length} +0,0 @@\n${body}`;
}

function resolveWriteDiffPreview(log: RunnerLog, filePath: string | undefined, output: string, operation: "created" | "modified" | "deleted") {
  const diffMetadata = resolveFileDiffMetadata(log, filePath);
  const diffText = stripRunnerSystemTags(
    String(
      diffMetadata?.diff ||
        diffMetadata?.changes ||
        (operation === "created" && filePath && output
          ? buildCreatedFileDiff(filePath, output)
          : operation === "deleted" && filePath && output
            ? buildDeletedFileDiff(filePath, output)
            : "")
    )
  ).trim();
  const fallbackStats = diffText ? countDiffStats(diffText) : null;
  const hasKnownCounts =
    typeof diffMetadata?.additions === "number" ||
    typeof diffMetadata?.deletions === "number" ||
    !!fallbackStats;
  return {
    diffText,
    additions: typeof diffMetadata?.additions === "number" ? diffMetadata.additions : fallbackStats?.additions ?? null,
    deletions: typeof diffMetadata?.deletions === "number" ? diffMetadata.deletions : fallbackStats?.deletions ?? null,
    hasKnownCounts,
  };
}

type RunnerTaskManagementCreatedTaskPreview = {
  id: string;
  title: string;
  projectId?: string | null;
  projectName?: string | null;
  ticketNumber?: string | null;
  status?: string | null;
  priority?: string | null;
  taskType?: string | null;
  assigneeAgentId?: string | null;
  assigneeName?: string | null;
  taskColor?: string | null;
};

export type RunnerCreatedResourceType = "agent" | "skill" | "environment" | "project" | "release";

export type RunnerCreatedResourcePreview = {
  id: string;
  name: string;
  resourceType: RunnerCreatedResourceType;
  mutationVerb?: "created" | "updated" | null;
  description?: string | null;
  model?: string | null;
  category?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  isDefault?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  status?: string | null;
  taskCount?: number | null;
  openTaskCount?: number | null;
};

const RUNNER_PLAYGROUND_HUMAN_ME_ID = "__runner_playground_human_me__";
const runnerTaskManagementPreviewCache = new Map<string, RunnerTaskManagementCreatedTaskPreview>();
const runnerTaskManagementProjectTicketMapCache = new Map<string, Record<string, string>>();

function asOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asObjectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function normalizeTaskManagementPreviewStatus(value: string | null | undefined): "todo" | "in_progress" | "blocked" | "done" {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "in_progress" || normalized === "blocked" || normalized === "done") {
    return normalized;
  }
  if (normalized === "backlog" || normalized === "todo") {
    return "todo";
  }
  return "todo";
}

function normalizeTaskManagementPreviewPriority(value: string | null | undefined): "low" | "medium" | "high" | "critical" {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high" || normalized === "critical") {
    return normalized;
  }
  return "medium";
}

function normalizeTaskManagementPreviewType(value: string | null | undefined): "task" | "subtask" {
  return String(value || "").trim().toLowerCase() === "subtask" ? "subtask" : "task";
}

function normalizeTaskManagementPreviewTicketNumber(value: string | null | undefined): string | null {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  const digits = Array.from(normalized).filter((character) => character >= "0" && character <= "9").join("");
  const parsed = Number.parseInt(digits || normalized, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return String(parsed).padStart(3, "0");
}

function isTaskManagementHumanAssigneeId(value: string | null | undefined): boolean {
  return String(value || "").trim() === RUNNER_PLAYGROUND_HUMAN_ME_ID;
}

function normalizeTaskManagementPreviewColor(value: string | null | undefined): "gray" | "blue" | "green" | "amber" | "rose" {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "gray" || normalized === "green" || normalized === "amber" || normalized === "rose") {
    return normalized;
  }
  return normalized === "blue" ? "blue" : "gray";
}

function getTaskManagementPreviewColorStyle(value: string | null | undefined): CSSProperties {
  const normalized = normalizeTaskManagementPreviewColor(value);
  const presentation = normalized === "gray"
    ? {
        accent: "rgba(255, 255, 255, 0.92)",
        surface: "rgba(255, 255, 255, 0.05)",
        surfaceHover: "rgba(255, 255, 255, 0.07)",
        border: "rgba(255, 255, 255, 0.08)",
      }
    : normalized === "green"
      ? {
          accent: "#2ca36b",
          surface: "rgba(44, 163, 107, 0.12)",
          surfaceHover: "rgba(44, 163, 107, 0.16)",
          border: "rgba(44, 163, 107, 0.2)",
        }
      : normalized === "amber"
        ? {
            accent: "#c98a1f",
            surface: "rgba(201, 138, 31, 0.12)",
            surfaceHover: "rgba(201, 138, 31, 0.16)",
            border: "rgba(201, 138, 31, 0.2)",
          }
        : normalized === "rose"
          ? {
              accent: "#c45b87",
              surface: "rgba(196, 91, 135, 0.12)",
              surfaceHover: "rgba(196, 91, 135, 0.16)",
              border: "rgba(196, 91, 135, 0.2)",
            }
          : {
              accent: "#016bcb",
              surface: "rgba(1, 107, 203, 0.12)",
              surfaceHover: "rgba(1, 107, 203, 0.16)",
              border: "rgba(1, 107, 203, 0.2)",
            };
  return {
    "--tb-log-task-preview-accent": presentation.accent,
    "--tb-log-task-preview-surface": presentation.surface,
    "--tb-log-task-preview-surface-hover": presentation.surfaceHover,
    "--tb-log-task-preview-border": presentation.border,
  } as CSSProperties;
}

function getTaskManagementPreviewStatusLabel(value: string | null | undefined): string {
  const normalized = normalizeTaskManagementPreviewStatus(value);
  if (normalized === "in_progress") return "In doing";
  if (normalized === "blocked") return "Blocked";
  if (normalized === "done") return "Done";
  return "To do";
}

function renderTaskManagementPreviewPriorityIcon(priority: string | null | undefined, className: string) {
  const normalized = normalizeTaskManagementPreviewPriority(priority);
  if (normalized === "low") {
    return <ChevronDown className={`${className} is-low`} strokeWidth={2} />;
  }
  if (normalized === "high") {
    return <ChevronUp className={`${className} is-high`} strokeWidth={2} />;
  }
  if (normalized === "critical") {
    return <ChevronsUp className={`${className} is-critical`} strokeWidth={2} />;
  }
  return <Equal className={`${className} is-medium`} strokeWidth={2} />;
}

function splitTaskManagementTitleAndTicket(rawTitle: string): { title: string; ticketNumber?: string } {
  const trimmedTitle = rawTitle.trim();
  const prefixedTicketMatch = trimmedTitle.match(/^((?:[A-Z]+-\d+)|(?:\d{2,4}))(?:(?:\s*[·\-:]\s*)|\s+)(.+)$/);
  if (prefixedTicketMatch?.[1] && prefixedTicketMatch[2]) {
    return {
      ticketNumber: prefixedTicketMatch[1].trim(),
      title: prefixedTicketMatch[2].trim() || trimmedTitle,
    };
  }
  return { title: trimmedTitle };
}

function dedupeTaskManagementCreatePreviews(previews: RunnerTaskManagementCreatedTaskPreview[]): RunnerTaskManagementCreatedTaskPreview[] {
  function mergePreview(base: RunnerTaskManagementCreatedTaskPreview, incoming: RunnerTaskManagementCreatedTaskPreview): RunnerTaskManagementCreatedTaskPreview {
    const incomingStatus = normalizeTaskManagementPreviewStatus(incoming.status);
    const baseStatus = normalizeTaskManagementPreviewStatus(base.status);
    const incomingPriority = normalizeTaskManagementPreviewPriority(incoming.priority);
    const basePriority = normalizeTaskManagementPreviewPriority(base.priority);
    const incomingTaskType = normalizeTaskManagementPreviewType(incoming.taskType);
    const baseTaskType = normalizeTaskManagementPreviewType(base.taskType);
    const normalizedIncomingTicketNumber = normalizeTaskManagementPreviewTicketNumber(incoming.ticketNumber);
    const normalizedBaseTicketNumber = normalizeTaskManagementPreviewTicketNumber(base.ticketNumber);
    const incomingId = String(incoming.id || "").trim();
    const baseId = String(base.id || "").trim();
    const resolvedId =
      incomingId.startsWith("task_")
        ? incomingId
        : baseId.startsWith("task_")
          ? baseId
          : incomingId || baseId;

    return {
      ...base,
      ...incoming,
      id: resolvedId || base.id || incoming.id,
      title: String(incoming.title || "").trim() || base.title,
      projectId: incoming.projectId || base.projectId || null,
      projectName: incoming.projectName || base.projectName || null,
      ticketNumber: normalizedIncomingTicketNumber || normalizedBaseTicketNumber || null,
      status:
        incomingStatus !== "todo" || !base.status
          ? incomingStatus
          : baseStatus,
      priority:
        incomingPriority !== "medium" || !base.priority
          ? incomingPriority
          : basePriority,
      taskType:
        incomingTaskType === "subtask" || !base.taskType
          ? incomingTaskType
          : baseTaskType,
      assigneeAgentId: incoming.assigneeAgentId || base.assigneeAgentId || null,
      assigneeName: incoming.assigneeName || base.assigneeName || null,
      taskColor: incoming.taskColor || base.taskColor || null,
    };
  }

  const deduped: RunnerTaskManagementCreatedTaskPreview[] = [];
  for (const preview of previews) {
    const normalizedTitle = String(preview.title || "").trim().toLowerCase();
    if (!normalizedTitle && !String(preview.id || "").trim()) {
      continue;
    }
    const existingIndex = deduped.findIndex((candidate) => {
      const candidateId = String(candidate.id || "").trim();
      const previewId = String(preview.id || "").trim();
      const candidateTitle = String(candidate.title || "").trim().toLowerCase();
      return (
        (candidateId && previewId && candidateId === previewId)
        || (normalizedTitle && candidateTitle === normalizedTitle)
      );
    });
    if (existingIndex === -1) {
      deduped.push(preview);
      continue;
    }
    deduped[existingIndex] = mergePreview(deduped[existingIndex], preview);
  }
  return deduped;
}

function compareTaskManagementPreviewTicketOrder(left: Record<string, unknown>, right: Record<string, unknown>): number {
  const leftCreatedAt = Date.parse(String(left?.createdAt || "")) || 0;
  const rightCreatedAt = Date.parse(String(right?.createdAt || "")) || 0;
  if (leftCreatedAt !== rightCreatedAt) {
    return leftCreatedAt - rightCreatedAt;
  }
  const leftSortOrder = Number.isFinite(left?.sortOrder) ? Number(left.sortOrder) : (Number.isFinite(Number(left?.sortOrder)) ? Number(left?.sortOrder) : 0);
  const rightSortOrder = Number.isFinite(right?.sortOrder) ? Number(right.sortOrder) : (Number.isFinite(Number(right?.sortOrder)) ? Number(right?.sortOrder) : 0);
  if (leftSortOrder !== rightSortOrder) {
    return leftSortOrder - rightSortOrder;
  }
  return String(left?.id || "").localeCompare(String(right?.id || ""));
}

function buildTaskManagementTicketMapFromTaskListPayload(data: unknown): Record<string, string> {
  const payload = asObjectRecord(data);
  const items = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.tasks)
      ? payload.tasks
      : Array.isArray(payload?.items)
        ? payload.items
        : [];
  const orderedTasks = items
    .map((item) => asObjectRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item?.id))
    .slice()
    .sort(compareTaskManagementPreviewTicketOrder);
  const next: Record<string, string> = {};
  let explicitCount = 0;
  let highestTicketNumber = 0;

  orderedTasks.forEach((task) => {
    const metadata = asObjectRecord(task.metadata);
    const runnerPlayground = asObjectRecord(metadata?.runnerPlayground);
    const ticketNumber = normalizeTaskManagementPreviewTicketNumber(
      asOptionalTrimmedString(task.ticketNumber)
      || asOptionalTrimmedString(runnerPlayground?.ticketNumber)
      || null
    );
    if (!ticketNumber) {
      return;
    }
    next[String(task.id)] = ticketNumber;
    explicitCount += 1;
    highestTicketNumber = Math.max(highestTicketNumber, Number.parseInt(ticketNumber, 10));
  });

  let nextTicketNumber = explicitCount === 0 ? 0 : highestTicketNumber;
  orderedTasks.forEach((task) => {
    const taskId = String(task.id || "").trim();
    if (!taskId || next[taskId]) {
      return;
    }
    nextTicketNumber += 1;
    next[taskId] = String(nextTicketNumber).padStart(3, "0");
  });

  return next;
}

function normalizeTaskManagementCreatePreview(value: unknown): RunnerTaskManagementCreatedTaskPreview | null {
  const record = asObjectRecord(value);
  if (!record) return null;

  const metadata = asObjectRecord(record.metadata);
  const runnerPlayground = asObjectRecord(metadata?.runnerPlayground);
  const assigneeRecord = asObjectRecord(record.assignee) || asObjectRecord(record.assigneeAgent);

  const id =
    asOptionalTrimmedString(record.id)
    || asOptionalTrimmedString(record.taskId)
    || asOptionalTrimmedString(record.task_id)
    || "";
  const rawTitle =
    asOptionalTrimmedString(record.title)
    || asOptionalTrimmedString(record.name)
    || asOptionalTrimmedString(record.taskTitle)
    || "";
  const titleParts = rawTitle ? splitTaskManagementTitleAndTicket(rawTitle) : { title: rawTitle };
  const ticketNumber = normalizeTaskManagementPreviewTicketNumber(
    asOptionalTrimmedString(record.ticketNumber)
    || asOptionalTrimmedString(record.ticket_number)
    || asOptionalTrimmedString(record.ticket)
    || asOptionalTrimmedString(runnerPlayground?.ticketNumber)
    || titleParts.ticketNumber
    || null
  );
  const explicitTaskType =
    asOptionalTrimmedString(record.taskType)
    || asOptionalTrimmedString(record.task_type)
    || (asOptionalTrimmedString(record.type) && ["task", "subtask"].includes(String(record.type).trim().toLowerCase()) ? asOptionalTrimmedString(record.type) : undefined)
    || asOptionalTrimmedString(runnerPlayground?.taskType)
    || null;
  const assigneeAgentId =
    asOptionalTrimmedString(record.assigneeAgentId)
    || asOptionalTrimmedString(record.assignee_agent_id)
    || asOptionalTrimmedString(record.assigneeId)
    || asOptionalTrimmedString(record.assignee_id)
    || asOptionalTrimmedString(runnerPlayground?.assigneeActorId)
    || asOptionalTrimmedString(assigneeRecord?.id)
    || null;
  const assigneeName =
    asOptionalTrimmedString(record.assigneeName)
    || asOptionalTrimmedString(record.assignee_name)
    || asOptionalTrimmedString(record.assigneeAgentName)
    || asOptionalTrimmedString(record.assigneeActorName)
    || asOptionalTrimmedString(record.assignedToName)
    || asOptionalTrimmedString(assigneeRecord?.name)
    || asOptionalTrimmedString(assigneeRecord?.displayName)
    || (isTaskManagementHumanAssigneeId(assigneeAgentId) ? "Me" : null)
    || null;
  const taskColor =
    asOptionalTrimmedString(record.taskColor)
    || asOptionalTrimmedString(record.task_color)
    || asOptionalTrimmedString(record.color)
    || asOptionalTrimmedString(runnerPlayground?.taskColor)
    || null;
  const projectId =
    asOptionalTrimmedString(record.projectId)
    || asOptionalTrimmedString(record.project_id)
    || asOptionalTrimmedString(metadata?.projectId)
    || asOptionalTrimmedString(metadata?.project_id)
    || null;
  const projectName =
    asOptionalTrimmedString(record.projectName)
    || asOptionalTrimmedString(record.project_name)
    || null;
  const normalizedTitle = titleParts.title || id;
  const normalizedTaskType = explicitTaskType ? normalizeTaskManagementPreviewType(explicitTaskType) : null;
  const normalizedParentTaskId =
    asOptionalTrimmedString(record.parentTaskId)
    || asOptionalTrimmedString(record.parent_task_id)
    || asOptionalTrimmedString(runnerPlayground?.parentTaskId)
    || null;
  const normalizedDependencyIds =
    Array.isArray(record.dependencyIds)
      ? record.dependencyIds
      : Array.isArray(runnerPlayground?.dependencyIds)
        ? runnerPlayground.dependencyIds
        : [];
  const rawStatus =
    asOptionalTrimmedString(record.status)
    || asOptionalTrimmedString(runnerPlayground?.status)
    || null;
  const normalizedStatus =
    normalizedDependencyIds.length > 0 && normalizeTaskManagementPreviewStatus(rawStatus) !== "done"
      ? "blocked"
      : normalizeTaskManagementPreviewStatus(rawStatus);
  const normalizedPriority = normalizeTaskManagementPreviewPriority(
    asOptionalTrimmedString(record.priority)
    || asOptionalTrimmedString(runnerPlayground?.priority)
    || null
  );
  const hasExplicitTaskIdentifier =
    id.startsWith("task_")
    || Object.prototype.hasOwnProperty.call(record, "taskId")
    || Object.prototype.hasOwnProperty.call(record, "task_id");
  const runnerPlaygroundHasTaskSignals =
    runnerPlayground !== null
    && (
      Boolean(asOptionalTrimmedString(runnerPlayground.ticketNumber))
      || Boolean(asOptionalTrimmedString(runnerPlayground.taskType))
      || Boolean(asOptionalTrimmedString(runnerPlayground.taskColor))
      || Boolean(asOptionalTrimmedString(runnerPlayground.assigneeActorId))
      || Array.isArray(runnerPlayground.dependencyIds)
      || Array.isArray(runnerPlayground.linkedThreadIds)
    );
  const looksLikeTaskRecord =
    Boolean(normalizedTitle)
    && (
      hasExplicitTaskIdentifier
      || ticketNumber !== null
      || normalizedTaskType === "task"
      || normalizedTaskType === "subtask"
      || Object.prototype.hasOwnProperty.call(record, "assigneeAgentId")
      || Object.prototype.hasOwnProperty.call(record, "parentTaskId")
      || Object.prototype.hasOwnProperty.call(record, "linkedThreadIds")
      || Object.prototype.hasOwnProperty.call(record, "dependencyIds")
      || runnerPlaygroundHasTaskSignals
    );

  if (!looksLikeTaskRecord) {
    return null;
  }

  return {
    id: id || `task:${normalizedTitle}`,
    title: normalizedTitle,
    projectId,
    projectName,
    ticketNumber,
    status: normalizedStatus,
    priority: normalizedPriority,
    taskType: normalizedTaskType || (normalizedParentTaskId ? "subtask" : "task"),
    assigneeAgentId,
    assigneeName,
    taskColor,
  };
}

function buildTaskManagementCreatePreviewFromTaskPayload(value: unknown): RunnerTaskManagementCreatedTaskPreview | null {
  const payload = asObjectRecord(value);
  if (!payload) {
    return null;
  }

  const taskRecord = asObjectRecord(payload.task);
  if (!taskRecord) {
    return null;
  }

  const details = asObjectRecord(payload.details);
  const project = asObjectRecord(details?.project);
  const assignee = asObjectRecord(details?.assignee);

  return normalizeTaskManagementCreatePreview({
    ...taskRecord,
    ...(project && !Object.prototype.hasOwnProperty.call(taskRecord, "projectName")
      ? { projectName: asOptionalTrimmedString(project.name) || asOptionalTrimmedString(project.title) || null }
      : {}),
    ...(project && !Object.prototype.hasOwnProperty.call(taskRecord, "projectId")
      ? { projectId: asOptionalTrimmedString(project.id) || null }
      : {}),
    ...(assignee && !Object.prototype.hasOwnProperty.call(taskRecord, "assigneeAgentId")
      ? { assigneeAgentId: asOptionalTrimmedString(assignee.id) || null }
      : {}),
    ...(assignee && !Object.prototype.hasOwnProperty.call(taskRecord, "assigneeName")
      ? { assigneeName: asOptionalTrimmedString(assignee.name) || asOptionalTrimmedString(assignee.displayName) || null }
      : {}),
  });
}

function extractTaskManagementCreatePreviewsFromValue(value: unknown): RunnerTaskManagementCreatedTaskPreview[] {
  const previews: RunnerTaskManagementCreatedTaskPreview[] = [];
  const visited = new WeakSet<object>();

  function visit(current: unknown, depth: number) {
    if (!current || depth > 6) return;
    if (Array.isArray(current)) {
      current.forEach((entry) => visit(entry, depth + 1));
      return;
    }
    const record = asObjectRecord(current);
    if (!record) {
      return;
    }
    if (visited.has(record)) {
      return;
    }
    visited.add(record);

    const directPreview = normalizeTaskManagementCreatePreview(record);
    if (directPreview) {
      previews.push(directPreview);
    }

    for (const nestedValue of Object.values(record)) {
      visit(nestedValue, depth + 1);
    }
  }

  visit(value, 0);
  return dedupeTaskManagementCreatePreviews(previews);
}

function extractTaskManagementCreatePreviewsFromText(text: string): RunnerTaskManagementCreatedTaskPreview[] {
  const previews: RunnerTaskManagementCreatedTaskPreview[] = [];
  const trimmed = text.trim();
  if (!trimmed) {
    return previews;
  }

  try {
    const parsedJson = JSON.parse(trimmed) as unknown;
    const structuredPreviews = extractTaskManagementCreatePreviewsFromValue(parsedJson);
    if (structuredPreviews.length > 0) {
      return structuredPreviews;
    }
  } catch {}

  const lines = trimmed.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const createdMatch = line.match(/^(?:[+*-]\s*)?(?:✓\s*)?Created:\s*(.+?)(?:\s+\((task_[^)]+)\))?\s*$/i);
    if (!createdMatch?.[1]) {
      continue;
    }
    const titleParts = splitTaskManagementTitleAndTicket(createdMatch[1]);
    previews.push({
      id: createdMatch[2]?.trim() || `task:${titleParts.title}`,
      title: titleParts.title,
      projectId: null,
      projectName: null,
      ticketNumber: titleParts.ticketNumber || null,
      status: "todo",
      priority: "medium",
      taskType: "task",
      assigneeName: null,
      taskColor: null,
    });
  }

  return dedupeTaskManagementCreatePreviews(previews);
}

function collectTaskManagementCreatedTasks(log: RunnerLog): RunnerTaskManagementCreatedTaskPreview[] {
  const previews = [
    ...extractTaskManagementCreatePreviewsFromValue(log.metadata?.result),
    ...extractTaskManagementCreatePreviewsFromValue(log.metadata?.args),
    ...Object.values((log.metadata?.fileContents as Record<string, string> | undefined) || {}).flatMap((value) =>
      extractTaskManagementCreatePreviewsFromText(String(value || ""))
    ),
    ...(typeof log.metadata?.result === "string" ? extractTaskManagementCreatePreviewsFromText(log.metadata.result) : []),
    ...(typeof log.metadata?.output === "string" ? extractTaskManagementCreatePreviewsFromText(log.metadata.output) : []),
    ...extractTaskManagementCreatePreviewsFromText(log.message || ""),
  ];

  const command = String(log.metadata?.command || "");
  const commandProjectId = extractQuotedArgument(command, "--project-id");
  if (previews.length > 0) {
    return dedupeTaskManagementCreatePreviews(previews).map((preview) => ({
      ...preview,
      projectId: preview.projectId || commandProjectId || null,
    }));
  }

  if (isTaskManagementCreateCommand(command)) {
    const title = extractQuotedArgument(command, "--title");
    if (title) {
      const titleParts = splitTaskManagementTitleAndTicket(title);
      return [{
        id: `task:${titleParts.title}`,
        title: titleParts.title,
        projectId: commandProjectId || null,
        projectName: null,
        ticketNumber: titleParts.ticketNumber || null,
        status: "todo",
        priority: "medium",
        taskType: "task",
        assigneeName: null,
        taskColor: null,
      }];
    }
  }

  return [];
}

function normalizeCreatedResourceType(value: unknown): RunnerCreatedResourceType | null {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "agent" || normalized === "agents") return "agent";
  if (normalized === "skill" || normalized === "skills") return "skill";
  if (normalized === "environment" || normalized === "environments" || normalized === "env" || normalized === "envs") return "environment";
  if (normalized === "release" || normalized === "releases") return "release";
  return null;
}

function inferCreatedResourceTypeFromId(value: unknown): RunnerCreatedResourceType | null {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.startsWith("agent_")) return "agent";
  if (normalized.startsWith("skill_")) return "skill";
  if (normalized.startsWith("env_") || normalized.startsWith("environment_")) return "environment";
  if (normalized.startsWith("release_")) return "release";
  return null;
}

function getCreatedResourceTypeLabel(resourceType: RunnerCreatedResourceType): string {
  if (resourceType === "agent") return "Agent";
  if (resourceType === "skill") return "Skill";
  if (resourceType === "environment") return "Environment";
  return "Release";
}

function renderCreatedResourceIcon(resourceType: RunnerCreatedResourceType, className: string) {
  if (resourceType === "agent") return <Bot className={className} strokeWidth={1.8} />;
  if (resourceType === "skill") return <Cpu className={className} strokeWidth={1.8} />;
  if (resourceType === "environment") return <HardDrive className={className} strokeWidth={1.8} />;
  return <Calendar className={className} strokeWidth={1.8} />;
}

function dedupeCreatedResourcePreviews(previews: RunnerCreatedResourcePreview[]): RunnerCreatedResourcePreview[] {
  const next = new Map<string, RunnerCreatedResourcePreview>();
  for (const preview of previews) {
    const key = `${preview.resourceType}:${String(preview.id || preview.name || "").trim().toLowerCase()}`;
    if (!key || key.endsWith(":")) continue;
    const existing = next.get(key);
    next.set(key, existing ? {
      ...existing,
      ...preview,
      id: preview.id || existing.id,
      name: preview.name || existing.name,
      description: preview.description || existing.description || null,
      model: preview.model || existing.model || null,
      category: preview.category || existing.category || null,
      projectId: preview.projectId || existing.projectId || null,
      projectName: preview.projectName || existing.projectName || null,
      startAt: preview.startAt || existing.startAt || null,
      endAt: preview.endAt || existing.endAt || null,
      status: preview.status || existing.status || null,
      taskCount: typeof preview.taskCount === "number" ? preview.taskCount : existing.taskCount ?? null,
      openTaskCount: typeof preview.openTaskCount === "number" ? preview.openTaskCount : existing.openTaskCount ?? null,
      isDefault: preview.isDefault || existing.isDefault,
    } : preview);
  }
  return Array.from(next.values());
}

function normalizeCreatedResourcePreview(
  value: unknown,
  fallbackType?: RunnerCreatedResourceType | null,
): RunnerCreatedResourcePreview | null {
  const record = asObjectRecord(value);
  if (!record) return null;

  const metadata = asObjectRecord(record.metadata);
  const normalizedType =
    normalizeCreatedResourceType(record.resourceType)
    || normalizeCreatedResourceType(record.object)
    || normalizeCreatedResourceType(record.type)
    || fallbackType
    || inferCreatedResourceTypeFromId(record.id);
  if (!normalizedType) return null;

  const id =
    asOptionalTrimmedString(record.id)
    || asOptionalTrimmedString(record.environmentId)
    || asOptionalTrimmedString(record.environment_id)
    || asOptionalTrimmedString(record.releaseId)
    || asOptionalTrimmedString(record.release_id)
    || "";
  const name =
    asOptionalTrimmedString(record.name)
    || asOptionalTrimmedString(record.title)
    || asOptionalTrimmedString(record.label)
    || "";
  if (!id && !name) {
    return null;
  }

  return {
    id: id || `${normalizedType}:${name}`,
    name: name || getCreatedResourceTypeLabel(normalizedType),
    resourceType: normalizedType,
    description:
      asOptionalTrimmedString(record.description)
      || asOptionalTrimmedString(record.instructions)
      || asOptionalTrimmedString(record.markdown)
      || asOptionalTrimmedString(record.documentation)
      || null,
    model:
      asOptionalTrimmedString(record.model)
      || asOptionalTrimmedString(record.deepResearchModel)
      || null,
    category:
      asOptionalTrimmedString(record.category)
      || null,
    projectId:
      asOptionalTrimmedString(record.projectId)
      || asOptionalTrimmedString(record.project_id)
      || asOptionalTrimmedString(metadata?.projectId)
      || asOptionalTrimmedString(metadata?.project_id)
      || null,
    projectName:
      asOptionalTrimmedString(record.projectName)
      || asOptionalTrimmedString(record.project_name)
      || null,
    isDefault: Boolean(record.isDefault),
    startAt: asOptionalTrimmedString(record.startAt) || null,
    endAt: asOptionalTrimmedString(record.endAt) || null,
    status: asOptionalTrimmedString(record.status) || null,
    taskCount: Number.isFinite(record.taskCount) ? Number(record.taskCount) : null,
    openTaskCount: Number.isFinite(record.openTaskCount) ? Number(record.openTaskCount) : null,
  };
}

function extractCreatedResourcePreviewsFromValue(
  value: unknown,
  fallbackType?: RunnerCreatedResourceType | null,
): RunnerCreatedResourcePreview[] {
  const previews: RunnerCreatedResourcePreview[] = [];
  const visited = new WeakSet<object>();

  function visit(current: unknown, hintedType?: RunnerCreatedResourceType | null, depth = 0) {
    if (!current || depth > 6) return;
    if (Array.isArray(current)) {
      current.forEach((item) => visit(item, hintedType, depth + 1));
      return;
    }
    if (typeof current === "string") {
      const trimmed = current.trim();
      if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 1) {
        try {
          visit(JSON.parse(trimmed), hintedType, depth + 1);
        } catch {}
      }
      return;
    }
    const record = asObjectRecord(current);
    if (!record) return;
    if (visited.has(record)) return;
    visited.add(record);

    if (record.agent && typeof record.agent === "object") visit(record.agent, "agent", depth + 1);
    if (record.skill && typeof record.skill === "object") visit(record.skill, "skill", depth + 1);
    if (record.environment && typeof record.environment === "object") visit(record.environment, "environment", depth + 1);
    if (record.release && typeof record.release === "object") visit(record.release, "release", depth + 1);
    if (Array.isArray(record.agents)) visit(record.agents, "agent", depth + 1);
    if (Array.isArray(record.skills)) visit(record.skills, "skill", depth + 1);
    if (Array.isArray(record.environments)) visit(record.environments, "environment", depth + 1);
    if (Array.isArray(record.releases)) visit(record.releases, "release", depth + 1);

    const directPreview = normalizeCreatedResourcePreview(record, hintedType || fallbackType || null);
    if (directPreview) {
      previews.push(directPreview);
    }

    for (const nestedValue of Object.values(record)) {
      if (nestedValue && typeof nestedValue === "object") {
        visit(nestedValue, null, depth + 1);
      }
    }
  }

  visit(value, fallbackType || null, 0);
  return dedupeCreatedResourcePreviews(previews);
}

function extractCreatedResourcePreviewsFromText(
  text: string,
  fallbackType?: RunnerCreatedResourceType | null,
): RunnerCreatedResourcePreview[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const structured = extractCreatedResourcePreviewsFromValue(parsed, fallbackType);
    if (structured.length > 0) {
      return structured;
    }
  } catch {}

  const previews: RunnerCreatedResourcePreview[] = [];
  const patterns: Array<{ type: RunnerCreatedResourceType; pattern: RegExp }> = [
    { type: "agent", pattern: /^(?:[+*-]\s*)?(?:✓\s*)?(?:agent created|created agent)\b[:\s-]*(.+?)(?:\s+\((agent_[^)]+)\))?\s*$/i },
    { type: "skill", pattern: /^(?:[+*-]\s*)?(?:✓\s*)?(?:skill created|created skill)\b[:\s-]*(.+?)(?:\s+\((skill_[^)]+)\))?\s*$/i },
    { type: "environment", pattern: /^(?:[+*-]\s*)?(?:✓\s*)?(?:environment created|created environment)\b[:\s-]*(.+?)(?:\s+\(((?:env|environment)_[^)]+)\))?\s*$/i },
    { type: "release", pattern: /^(?:[+*-]\s*)?(?:✓\s*)?(?:release created|created release)\b[:\s-]*(.+?)(?:\s+\((release_[^)]+)\))?\s*$/i },
  ];

  for (const rawLine of trimmed.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    for (const { type, pattern } of patterns) {
      const match = line.match(pattern);
      if (!match?.[1]) continue;
      previews.push({
        id: String(match[2] || `${type}:${match[1]}`).trim(),
        name: String(match[1] || "").trim(),
        resourceType: type,
        mutationVerb: null,
        description: null,
        model: null,
        category: null,
        projectId: null,
        projectName: null,
        isDefault: false,
        startAt: null,
        endAt: null,
        status: null,
        taskCount: null,
        openTaskCount: null,
      });
      break;
    }
  }

  return dedupeCreatedResourcePreviews(previews);
}

function isComputerAgentsCreateCommand(command?: string): boolean {
  if (!command) return false;
  return /computer-agents\.py[\s\S]*\b(agents|skills|environments)\s+(create|clone)\b/i.test(command);
}

function inferComputerAgentsResourceTypeFromCommand(command?: string): RunnerCreatedResourceType | null {
  if (!command) return null;
  if (/computer-agents\.py[\s\S]*\bagents\s+(create|update)\b/i.test(command)) return "agent";
  if (/computer-agents\.py[\s\S]*\bskills\s+(create|update)\b/i.test(command)) return "skill";
  if (/computer-agents\.py[\s\S]*\benvironments\s+(create|clone|update)\b/i.test(command)) return "environment";
  return null;
}

function isComputerAgentsCreateToolInvocation(log: RunnerLog): boolean {
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  const combined = `${serverName} ${toolName}`;
  return (
    /(computer[_ -]?agents?|agents?|skills?|environments?|envs?)/.test(combined)
    && /(create|clone|new)/.test(combined)
  );
}

export function isComputerAgentsMutationLog(log: RunnerLog): boolean {
  const command = String(log.metadata?.command || "");
  if (/computer-agents\.py[\s\S]*\bagents\s+(create|update)\b/i.test(command)) return true;
  if (/computer-agents\.py[\s\S]*\bskills\s+(create|update)\b/i.test(command)) return true;
  if (/computer-agents\.py[\s\S]*\benvironments\s+(create|clone|update)\b/i.test(command)) return true;

  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  const combined = `${serverName} ${toolName}`;
  return (
    /(computer[_ -]?agents?|agents?|skills?|environments?|envs?)/.test(combined)
    && /(create|clone|new|update|edit)/.test(combined)
  );
}

function getComputerAgentsMutationVerb(log: RunnerLog): "created" | "updated" {
  const command = String(log.metadata?.command || "");
  if (/computer-agents\.py[\s\S]*\b(agents|skills|environments)\s+update\b/i.test(command)) {
    return "updated";
  }
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  const combined = `${serverName} ${toolName}`;
  if (/(update|edit)/.test(combined)) {
    return "updated";
  }
  return "created";
}

export function collectComputerAgentsCreatedResources(log: RunnerLog): RunnerCreatedResourcePreview[] {
  const command = String(log.metadata?.command || "");
  const fallbackType =
    inferComputerAgentsResourceTypeFromCommand(command)
    || null;
  const mutationVerb = getComputerAgentsMutationVerb(log);
  const previews = [
    ...extractCreatedResourcePreviewsFromValue(log.metadata?.result, fallbackType),
    ...extractCreatedResourcePreviewsFromValue(log.metadata?.args, fallbackType),
    ...Object.values((log.metadata?.fileContents as Record<string, string> | undefined) || {}).flatMap((value) =>
      extractCreatedResourcePreviewsFromText(String(value || ""), fallbackType)
    ),
    ...(typeof log.metadata?.result === "string" ? extractCreatedResourcePreviewsFromText(log.metadata.result, fallbackType) : []),
    ...(typeof log.metadata?.output === "string" ? extractCreatedResourcePreviewsFromText(log.metadata.output, fallbackType) : []),
    ...extractCreatedResourcePreviewsFromText(log.message || "", fallbackType),
  ].filter((preview) => preview.resourceType !== "release");

  if (previews.length > 0) {
    return dedupeCreatedResourcePreviews(previews).map((preview) => ({
      ...preview,
      mutationVerb,
    }));
  }

  if (!isComputerAgentsCreateCommand(command) && !isComputerAgentsCreateToolInvocation(log)) {
    return [];
  }

  const fallbackName = extractQuotedArgument(command, "--name");
  if (!fallbackName || !fallbackType) {
    return [];
  }
  return [{
    id: extractQuotedArgument(command, "--id") || `${fallbackType}:${fallbackName}`,
    name: fallbackName,
    resourceType: fallbackType,
    mutationVerb,
    description: extractQuotedArgument(command, "--description"),
    model: extractQuotedArgument(command, "--model"),
    category: extractQuotedArgument(command, "--category"),
    projectId: extractQuotedArgument(command, "--project-id"),
    projectName: null,
    isDefault: /\s--is-default(?:\s|$)/.test(command),
    startAt: null,
    endAt: null,
    status: null,
    taskCount: null,
    openTaskCount: null,
  }];
}

function isTaskManagementReleaseCreateCommand(command?: string): boolean {
  if (!command) return false;
  return /manage-tasks\.py[\s\S]*\breleases\s+create\b/i.test(command);
}

function isTaskManagementReleaseCreateToolInvocation(log: RunnerLog): boolean {
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  return (
    /task/.test(serverName || toolName)
    && (
      /(?:^|[._/-])create(?:[._/-])?releases?(?:$|[._/-])/.test(toolName)
      || /(?:^|[._/-])releases?(?:[._/-])create(?:$|[._/-])/.test(toolName)
    )
  );
}

function normalizeTaskManagementReleasePreview(value: unknown): RunnerCreatedResourcePreview | null {
  const record = asObjectRecord(value);
  if (!record) return null;
  const metadata = asObjectRecord(record.metadata);
  const normalizedType =
    normalizeCreatedResourceType(record.resourceType)
    || normalizeCreatedResourceType(record.object)
    || normalizeCreatedResourceType(record.type)
    || inferCreatedResourceTypeFromId(record.id);
  const id =
    asOptionalTrimmedString(record.id)
    || asOptionalTrimmedString(record.releaseId)
    || asOptionalTrimmedString(record.release_id)
    || "";
  const name =
    asOptionalTrimmedString(record.name)
    || asOptionalTrimmedString(record.title)
    || asOptionalTrimmedString(record.releaseName)
    || asOptionalTrimmedString(record.release_name)
    || "";

  const looksLikeReleaseRecord =
    normalizedType === "release"
    || id.startsWith("release_")
    || Object.prototype.hasOwnProperty.call(record, "startAt")
    || Object.prototype.hasOwnProperty.call(record, "endAt")
    || Object.prototype.hasOwnProperty.call(record, "openTaskCount")
    || Object.prototype.hasOwnProperty.call(record, "taskCount")
    || Object.prototype.hasOwnProperty.call(record, "releaseId");
  if (!looksLikeReleaseRecord || (!id && !name)) {
    return null;
  }

  return {
    id: id || `release:${name}`,
    name: name || "Untitled Release",
    resourceType: "release",
    description: asOptionalTrimmedString(record.description) || null,
    model: null,
    category: null,
    projectId:
      asOptionalTrimmedString(record.projectId)
      || asOptionalTrimmedString(record.project_id)
      || asOptionalTrimmedString(metadata?.projectId)
      || null,
    projectName:
      asOptionalTrimmedString(record.projectName)
      || asOptionalTrimmedString(record.project_name)
      || null,
    isDefault: false,
    startAt: asOptionalTrimmedString(record.startAt) || null,
    endAt: asOptionalTrimmedString(record.endAt) || null,
    status: asOptionalTrimmedString(record.status) || null,
    taskCount: Number.isFinite(record.taskCount) ? Number(record.taskCount) : null,
    openTaskCount: Number.isFinite(record.openTaskCount) ? Number(record.openTaskCount) : null,
  };
}

function extractTaskManagementReleasePreviewsFromValue(value: unknown): RunnerCreatedResourcePreview[] {
  const previews: RunnerCreatedResourcePreview[] = [];
  const visited = new WeakSet<object>();

  function visit(current: unknown, depth: number) {
    if (!current || depth > 6) return;
    if (Array.isArray(current)) {
      current.forEach((entry) => visit(entry, depth + 1));
      return;
    }
    if (typeof current === "string") {
      const trimmed = current.trim();
      if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 1) {
        try {
          visit(JSON.parse(trimmed), depth + 1);
        } catch {}
      }
      return;
    }
    const record = asObjectRecord(current);
    if (!record || visited.has(record)) return;
    visited.add(record);

    if (record.release && typeof record.release === "object") {
      visit(record.release, depth + 1);
    }
    if (Array.isArray(record.releases)) {
      visit(record.releases, depth + 1);
    }
    const directPreview = normalizeTaskManagementReleasePreview(record);
    if (directPreview) {
      previews.push(directPreview);
    }
    for (const nestedValue of Object.values(record)) {
      if (nestedValue && typeof nestedValue === "object") {
        visit(nestedValue, depth + 1);
      }
    }
  }

  visit(value, 0);
  return dedupeCreatedResourcePreviews(previews);
}

function extractTaskManagementReleasePreviewsFromText(text: string): RunnerCreatedResourcePreview[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const structured = extractTaskManagementReleasePreviewsFromValue(parsed);
    if (structured.length > 0) {
      return structured;
    }
  } catch {}

  const previews: RunnerCreatedResourcePreview[] = [];
  for (const rawLine of trimmed.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^(?:[+*-]\s*)?(?:✓\s*)?(?:Release created|Created release):\s*(.+?)(?:\s+\((release_[^)]+)\))?\s*$/i);
    if (!match?.[1]) continue;
    previews.push({
      id: String(match[2] || `release:${match[1]}`).trim(),
      name: String(match[1] || "").trim(),
      resourceType: "release",
      description: null,
      model: null,
      category: null,
      projectId: null,
      projectName: null,
      isDefault: false,
      startAt: null,
      endAt: null,
      status: null,
      taskCount: null,
      openTaskCount: null,
    });
  }
  return dedupeCreatedResourcePreviews(previews);
}

export function collectTaskManagementCreatedReleases(log: RunnerLog): RunnerCreatedResourcePreview[] {
  const previews = [
    ...extractTaskManagementReleasePreviewsFromValue(log.metadata?.result),
    ...extractTaskManagementReleasePreviewsFromValue(log.metadata?.args),
    ...Object.values((log.metadata?.fileContents as Record<string, string> | undefined) || {}).flatMap((value) =>
      extractTaskManagementReleasePreviewsFromText(String(value || ""))
    ),
    ...(typeof log.metadata?.result === "string" ? extractTaskManagementReleasePreviewsFromText(log.metadata.result) : []),
    ...(typeof log.metadata?.output === "string" ? extractTaskManagementReleasePreviewsFromText(log.metadata.output) : []),
    ...extractTaskManagementReleasePreviewsFromText(log.message || ""),
  ];

  const command = String(log.metadata?.command || "");
  const commandProjectId = extractQuotedArgument(command, "--project-id");
  if (previews.length > 0) {
    return dedupeCreatedResourcePreviews(previews).map((preview) => ({
      ...preview,
      projectId: preview.projectId || commandProjectId || null,
    }));
  }

  if (!isTaskManagementReleaseCreateCommand(command) && !isTaskManagementReleaseCreateToolInvocation(log)) {
    return [];
  }

  const releaseName = extractQuotedArgument(command, "--name");
  if (!releaseName) {
    return [];
  }
  return [{
    id: `release:${releaseName}`,
    name: releaseName,
    resourceType: "release",
    description: extractQuotedArgument(command, "--description"),
    model: null,
    category: null,
    projectId: commandProjectId || null,
    projectName: null,
    isDefault: false,
    startAt: extractQuotedArgument(command, "--start-at"),
    endAt: extractQuotedArgument(command, "--end-at"),
    status: "planned",
    taskCount: null,
    openTaskCount: null,
  }];
}

export function shouldRenderComputerAgentsCreateLog(log: RunnerLog): boolean {
  return (
    isComputerAgentsMutationLog(log)
    && collectComputerAgentsCreatedResources(log).length > 0
  );
}

function shouldRenderTaskManagementReleaseCreateLog(log: RunnerLog): boolean {
  return (
    isTaskManagementReleaseCreateCommand(log.metadata?.command || "")
    || isTaskManagementReleaseCreateToolInvocation(log)
    || collectTaskManagementCreatedReleases(log).length > 0
  );
}

function isTaskManagementCreateCommand(command?: string): boolean {
  if (!command) return false;
  return /manage-tasks\.py[\s\S]*\btasks\s+create\b/i.test(command);
}

function isTaskManagementCreateToolInvocation(log: RunnerLog): boolean {
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  return (
    /task/.test(serverName || toolName)
    && (
      /(?:^|[._/-])create(?:[._/-])?tasks?(?:$|[._/-])/.test(toolName)
      || /(?:^|[._/-])tasks?(?:[._/-])create(?:$|[._/-])/.test(toolName)
    )
  );
}

function shouldRenderTaskManagementCreateLog(log: RunnerLog): boolean {
  return (
    isTaskManagementCreateCommand(log.metadata?.command || "")
    || isTaskManagementCreateToolInvocation(log)
    || collectTaskManagementCreatedTasks(log).length > 0
  );
}

function TaskManagementCreateLogBox({
  log,
  timeLabel,
  backendUrl,
  requestHeaders,
  activeTaskPreviewId,
  onTaskPreviewClick,
}: {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  requestHeaders?: HeadersInit;
  activeTaskPreviewId?: string | null;
  onTaskPreviewClick?: RunnerWorkLogEntryProps["onTaskPreviewClick"];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [enrichedTasksById, setEnrichedTasksById] = useState<Record<string, RunnerTaskManagementCreatedTaskPreview>>({});
  const [ticketNumbersByTaskId, setTicketNumbersByTaskId] = useState<Record<string, string>>({});
  const createdTasks = useMemo(() => collectTaskManagementCreatedTasks(log), [log]);

  useEffect(() => {
    const nextEnrichedTasksById: Record<string, RunnerTaskManagementCreatedTaskPreview> = {};
    const nextTicketNumbersByTaskId: Record<string, string> = {};

    createdTasks.forEach((task) => {
      const normalizedTaskId = String(task.id || "").trim();
      if (normalizedTaskId && runnerTaskManagementPreviewCache.has(normalizedTaskId)) {
        nextEnrichedTasksById[normalizedTaskId] = runnerTaskManagementPreviewCache.get(normalizedTaskId)!;
      }
      const normalizedProjectId = String(task.projectId || "").trim();
      if (normalizedTaskId && normalizedProjectId && runnerTaskManagementProjectTicketMapCache.has(normalizedProjectId)) {
        const ticketMap = runnerTaskManagementProjectTicketMapCache.get(normalizedProjectId)!;
        if (ticketMap[normalizedTaskId]) {
          nextTicketNumbersByTaskId[normalizedTaskId] = ticketMap[normalizedTaskId];
        }
      }
    });

    setEnrichedTasksById(nextEnrichedTasksById);
    setTicketNumbersByTaskId(nextTicketNumbersByTaskId);
  }, [createdTasks]);

  const displayTasks = useMemo(
    () =>
      createdTasks.map((task) => {
        const enriched = task.id ? enrichedTasksById[task.id] : undefined;
        const normalizedTaskId = String(task.id || "").trim();
        const ticketNumberFromMap = normalizedTaskId ? ticketNumbersByTaskId[normalizedTaskId] : "";
        const mergedTask = !enriched
          ? task
          : {
              ...task,
              ...enriched,
              projectId: enriched.projectId || task.projectId || null,
              projectName: enriched.projectName || task.projectName || null,
            };
        return {
          ...mergedTask,
          ticketNumber: mergedTask.ticketNumber || ticketNumberFromMap || null,
        };
      }),
    [createdTasks, enrichedTasksById, ticketNumbersByTaskId]
  );
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const createdCount = displayTasks.length;
  const title = createdCount === 1
    ? "1 task created"
    : createdCount > 1
      ? `${createdCount} tasks created`
      : "Create tasks";

  useEffect(() => {
    let cancelled = false;
    const normalizedBackendUrl = String(backendUrl || "").trim().replace(/\/$/, "");
    const taskIds = Array.from(
      new Set(
        createdTasks
          .map((task) => String(task.id || "").trim())
          .filter((taskId) => taskId.startsWith("task_"))
      )
    );

    if (!normalizedBackendUrl || taskIds.length === 0) {
      setEnrichedTasksById({});
      return () => {
        cancelled = true;
      };
    }

    void Promise.allSettled(
      taskIds.map(async (taskId) => {
        const response = await fetch(`${normalizedBackendUrl}/tasks/${encodeURIComponent(taskId)}`, {
          method: "GET",
          headers: requestHeaders,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to load task ${taskId}`);
        }
        const body = await response.json();
        return {
          taskId,
          preview: buildTaskManagementCreatePreviewFromTaskPayload(body),
        };
      })
    ).then((results) => {
      if (cancelled) {
        return;
      }
      const nextEnrichedTasksById: Record<string, RunnerTaskManagementCreatedTaskPreview> = {};
      for (const result of results) {
        if (result.status !== "fulfilled" || !result.value.preview) {
          continue;
        }
        nextEnrichedTasksById[result.value.taskId] = result.value.preview;
        runnerTaskManagementPreviewCache.set(result.value.taskId, result.value.preview);
      }
      setEnrichedTasksById(nextEnrichedTasksById);
    }).catch(() => {
      if (!cancelled) {
        setEnrichedTasksById({});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [backendUrl, createdTasks, requestHeaders]);

  useEffect(() => {
    let cancelled = false;
    const normalizedBackendUrl = String(backendUrl || "").trim().replace(/\/$/, "");
    const projectIds = Array.from(
      new Set(
        displayTasks
          .filter((task) => !task.ticketNumber)
          .map((task) => String(task.projectId || "").trim())
          .filter(Boolean)
      )
    );

    if (!normalizedBackendUrl || projectIds.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    const cachedTicketNumbers: Record<string, string> = {};
    projectIds.forEach((projectId) => {
      const cachedMap = runnerTaskManagementProjectTicketMapCache.get(projectId);
      if (!cachedMap) {
        return;
      }
      Object.assign(cachedTicketNumbers, cachedMap);
    });
    if (Object.keys(cachedTicketNumbers).length > 0) {
      setTicketNumbersByTaskId((current) => ({ ...current, ...cachedTicketNumbers }));
    }

    const projectIdsToFetch = projectIds.filter((projectId) => !runnerTaskManagementProjectTicketMapCache.has(projectId));
    if (projectIdsToFetch.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    void Promise.allSettled(
      projectIdsToFetch.map(async (projectId) => {
        const response = await fetch(`${normalizedBackendUrl}/tasks?projectId=${encodeURIComponent(projectId)}&limit=1000`, {
          method: "GET",
          headers: requestHeaders,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to load tasks for project ${projectId}`);
        }
        const body = await response.json();
        return {
          projectId,
          ticketMap: buildTaskManagementTicketMapFromTaskListPayload(body),
        };
      })
    ).then((results) => {
      if (cancelled) {
        return;
      }
      const nextTicketNumbersByTaskId: Record<string, string> = {};
      for (const result of results) {
        if (result.status !== "fulfilled") {
          continue;
        }
        runnerTaskManagementProjectTicketMapCache.set(result.value.projectId, result.value.ticketMap);
        Object.assign(nextTicketNumbersByTaskId, result.value.ticketMap);
      }
      if (Object.keys(nextTicketNumbersByTaskId).length > 0) {
        setTicketNumbersByTaskId((current) => ({ ...current, ...nextTicketNumbersByTaskId }));
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [backendUrl, displayTasks, requestHeaders]);

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<ListTodo className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Task Management"
        title={title}
        timeLabel={timeLabel}
        meta={
          createdCount > 0
            ? <span className="tb-log-card-pill">{createdCount} created</span>
            : isLoading
              ? <span className="tb-log-card-status">creating...</span>
              : null
        }
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {createdCount > 0 ? (
          <div className="tb-log-task-create-list">
            {displayTasks.map((task) => {
              const normalizedStatus = normalizeTaskManagementPreviewStatus(task.status);
              const normalizedTaskType = normalizeTaskManagementPreviewType(task.taskType);
              const isClickable = Boolean(onTaskPreviewClick && task.id);
              const isActive = String(activeTaskPreviewId || "").trim() !== "" && String(task.id || "").trim() === String(activeTaskPreviewId || "").trim();
              const content = (
                <>
                  <div className="tb-log-task-create-item-content">
                    <div className="tb-log-task-create-leading">
                      <div className={`tb-log-task-create-type ${normalizedTaskType === "subtask" ? "is-subtask" : "is-task"}`.trim()}>
                        {normalizedTaskType === "subtask"
                          ? <Check className="tb-log-task-create-type-icon" strokeWidth={1.9} />
                          : <Bookmark className="tb-log-task-create-type-icon" strokeWidth={1.9} />}
                      </div>
                      <div className="tb-log-task-create-main">
                        {renderTaskManagementPreviewPriorityIcon(task.priority, "tb-log-task-create-priority")}
                        <span className={`tb-log-task-create-ticket ${task.ticketNumber ? "" : "is-placeholder"}`.trim()}>
                          {task.ticketNumber || "NEW"}
                        </span>
                        <span className="tb-log-task-create-title" title={task.title}>
                          {task.title}
                        </span>
                      </div>
                    </div>
                    <div className="tb-log-task-create-meta">
                      <span className={`tb-log-task-create-assignee ${task.assigneeName ? "" : "is-unassigned"}`.trim()} title={task.assigneeName || "Unassigned"}>
                        {task.assigneeName || "Unassigned"}
                      </span>
                      <span className={`tb-log-task-create-status is-${normalizedStatus.replace(/_/g, "-")}`.trim()}>
                        {getTaskManagementPreviewStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>
                </>
              );
              return isClickable ? (
                <button
                  key={task.id}
                  type="button"
                  className={`tb-log-task-create-item tb-log-task-create-item-button ${isActive ? "is-active" : ""}`.trim()}
                  style={getTaskManagementPreviewColorStyle(task.taskColor)}
                  onClick={() =>
                    onTaskPreviewClick?.({
                      taskId: task.id,
                      projectId: task.projectId || "",
                      ...(task.projectName ? { projectName: task.projectName } : {}),
                      ticketNumber: task.ticketNumber || "NEW",
                      title: task.title,
                      ...(task.taskColor ? { taskColor: task.taskColor } : {}),
                      ...(task.status ? { status: task.status } : {}),
                      ...(task.priority ? { priority: task.priority } : {}),
                      ...(task.taskType ? { taskType: task.taskType } : {}),
                      ...(task.assigneeAgentId ? { assigneeAgentId: task.assigneeAgentId } : {}),
                      ...(task.assigneeName ? { assigneeName: task.assigneeName } : {}),
                    })
                  }
                >
                  {content}
                </button>
              ) : (
                <div
                  key={task.id}
                  className={`tb-log-task-create-item ${isActive ? "is-active" : ""}`.trim()}
                  style={getTaskManagementPreviewColorStyle(task.taskColor)}
                >
                  {content}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="tb-log-card-empty">
            {isLoading ? "Creating tasks..." : "No created tasks were parsed."}
          </div>
        )}
      </LogPanel>
    </div>
  );
}

function formatCreatedResourceStatusLabel(resource: RunnerCreatedResourcePreview): string | null {
  if (resource.resourceType !== "release") return null;
  const normalized = String(resource.status || "").trim().toLowerCase();
  if (normalized === "completed" || normalized === "done") return "Completed";
  if (normalized === "active" || normalized === "in_progress") return "Active";
  if (normalized === "planned") return "Planned";
  return null;
}

function formatCreatedResourceMeta(resource: RunnerCreatedResourcePreview): string {
  if (resource.resourceType === "agent") {
    return [resource.model, resource.isDefault ? "Default" : ""].filter(Boolean).join(" · ");
  }
  if (resource.resourceType === "skill") {
    return [resource.category, resource.isDefault ? "Default" : ""].filter(Boolean).join(" · ");
  }
  if (resource.resourceType === "environment") {
    return [resource.projectName, resource.isDefault ? "Default" : ""].filter(Boolean).join(" · ");
  }
  const dateRange = [resource.startAt, resource.endAt].filter(Boolean).join(" - ");
  const taskSummary =
    typeof resource.taskCount === "number" && typeof resource.openTaskCount === "number"
      ? `${resource.openTaskCount}/${resource.taskCount} open`
      : typeof resource.taskCount === "number"
        ? `${resource.taskCount} tasks`
        : "";
  return [dateRange, taskSummary].filter(Boolean).join(" · ");
}

function ResourceCreateLogList({
  resources,
  emptyLabel,
}: {
  resources: RunnerCreatedResourcePreview[];
  emptyLabel: string;
}) {
  if (resources.length === 0) {
    return <div className="tb-log-card-empty">{emptyLabel}</div>;
  }

  return (
    <div className="tb-log-resource-create-list">
      {resources.map((resource) => {
        const meta = formatCreatedResourceMeta(resource);
        const statusLabel = formatCreatedResourceStatusLabel(resource);
        return (
          <div
            key={`${resource.resourceType}:${resource.id}`}
            className={`tb-log-resource-create-item is-${resource.resourceType}`.trim()}
          >
            <div className="tb-log-resource-create-leading">
              <div className={`tb-log-resource-create-icon-slot is-${resource.resourceType}`.trim()}>
                {renderCreatedResourceIcon(resource.resourceType, "tb-log-resource-create-icon")}
              </div>
              <div className="tb-log-resource-create-copy">
                <div className="tb-log-resource-create-title-row">
                  <span className="tb-log-resource-create-title" title={resource.name}>
                    {resource.name}
                  </span>
                  <span className="tb-log-resource-create-type-pill">
                    {getCreatedResourceTypeLabel(resource.resourceType)}
                  </span>
                </div>
                {resource.description ? (
                  <div className="tb-log-resource-create-description" title={resource.description}>
                    {resource.description}
                  </div>
                ) : null}
                {meta ? (
                  <div className="tb-log-resource-create-meta">{meta}</div>
                ) : null}
              </div>
            </div>
            {statusLabel ? (
              <span className={`tb-log-resource-create-status is-${String(resource.status || "planned").trim().toLowerCase()}`.trim()}>
                {statusLabel}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ComputerAgentsCreateLogBox({
  log,
  timeLabel,
}: {
  log: RunnerLog;
  timeLabel?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const resources = useMemo(() => collectComputerAgentsCreatedResources(log), [log]);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const mutationVerb = getComputerAgentsMutationVerb(log);
  const title =
    resources.length === 1
      ? `1 resource ${mutationVerb}`
      : resources.length > 1
        ? `${resources.length} resources ${mutationVerb}`
        : mutationVerb === "updated"
          ? "Update resources"
          : "Create resources";

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<img className="tb-log-card-small-icon tb-log-card-small-icon-runner" src={RUNNER_TRANSPARENT_LOGO_URL} alt="" aria-hidden="true" />}
        label="Computer Agents"
        title={title}
        timeLabel={timeLabel}
        meta={
          resources.length > 0
            ? <span className="tb-log-card-pill">{resources.length} {mutationVerb}</span>
            : isLoading
              ? <span className="tb-log-card-status">{mutationVerb === "updated" ? "updating..." : "creating..."}</span>
              : null
        }
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <ResourceCreateLogList
          resources={resources}
          emptyLabel={isLoading ? "Creating resources..." : "No created resources were parsed."}
        />
      </LogPanel>
    </div>
  );
}

function TaskManagementReleaseCreateLogBox({
  log,
  timeLabel,
}: {
  log: RunnerLog;
  timeLabel?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const releases = useMemo(() => collectTaskManagementCreatedReleases(log), [log]);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const title =
    releases.length === 1
      ? "1 release created"
      : releases.length > 1
        ? `${releases.length} releases created`
        : "Create releases";

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<Calendar className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Task Management"
        title={title}
        timeLabel={timeLabel}
        meta={
          releases.length > 0
            ? <span className="tb-log-card-pill">{releases.length} created</span>
            : isLoading
              ? <span className="tb-log-card-status">creating...</span>
              : null
        }
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <ResourceCreateLogList
          resources={releases}
          emptyLabel={isLoading ? "Creating releases..." : "No created releases were parsed."}
        />
      </LogPanel>
    </div>
  );
}

function ReasoningLogBox({
  log,
  onWorkspacePathClick,
}: {
  log: RunnerLog;
  onWorkspacePathClick?: (path: string) => void;
}) {
  const content = stripRunnerSystemTags(log.message).replace(/^\*\*[^*]+\*\*\s*/, "").trim();
  if (!content) return null;
  return (
    <div className="tb-log-reasoning">
      <span className="tb-log-reasoning-icon">
        <Lightbulb className="tb-log-card-small-icon" strokeWidth={1.5} />
      </span>
      <RunnerMarkdown content={content} className="tb-log-reasoning-copy tb-message-markdown" onWorkspacePathClick={onWorkspacePathClick} />
    </div>
  );
}

function GenericTextLogBox({
  log,
  timeLabel,
  label,
  title,
  icon,
  onWorkspacePathClick,
}: {
  log: RunnerLog;
  timeLabel?: string;
  label: string;
  title?: string | null;
  icon: ReactNode;
  onWorkspacePathClick?: (path: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const content = stripRunnerSystemTags(log.message || log.metadata?.output || "");
  return (
    <div className="tb-log-card">
      <LogHeader icon={icon} label={label} title={title} timeLabel={timeLabel} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <LogPanel collapsed={collapsed}>
        {content ? <RunnerMarkdown content={content} className="tb-message-markdown" softBreaks onWorkspacePathClick={onWorkspacePathClick} /> : <div className="tb-log-card-empty">No details available.</div>}
      </LogPanel>
    </div>
  );
}

function stripLineNumbers(text: string): string {
  return text.replace(/^\s*\d+→/gm, "");
}

function extractHeadTailReadPath(command?: string): string | null {
  if (!command) return null;
  const patterns = [
    /\b(?:head|tail)\s+-n\s+\d+\s+["']([^"']+)["']/,
    /\b(?:head|tail)\s+-n\s+\d+\s+([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
    /\b(?:head|tail)\s+-\d+\s+["']([^"']+)["']/,
    /\b(?:head|tail)\s+-\d+\s+([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
    /\b(?:head|tail)\s+["']([^"']+)["']/,
    /\b(?:head|tail)\s+([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
  ];
  for (const pattern of patterns) {
    const match = command.match(pattern);
    const candidate = match?.[1]?.trim();
    if (candidate && !candidate.startsWith("-")) {
      return candidate;
    }
  }
  return null;
}

function isReadFileCommand(command?: string): boolean {
  if (!command) return false;
  if (extractHeadTailReadPath(command)) {
    return true;
  }
  return [
    /^\$?\s*read_file\b/i,
    /^reading:\s+/i,
    /sed\s+-n\s+['"][^'"]*['"]\s+/,
    /\bcat\s+["']?[^|&;]+/,
    /\bless\s+["']?[^|&;]+/,
  ].some((pattern) => pattern.test(command));
}

export function isReadFileLog(log?: RunnerLog): boolean {
  if (!log) return false;
  const command = String(log.metadata?.command || "");
  const message = String(log.message || "");
  const output = typeof log.metadata?.output === "string" ? log.metadata.output : "";

  return (
    isReadFileCommand(command) ||
    /^Read:\s+/i.test(message) ||
    Boolean(log.metadata?.fileContents && typeof log.metadata.fileContents === "object") ||
    /"filePath"\s*:/.test(output) ||
    /"content"\s*:/.test(output)
  );
}

function extractReadFilePath(command?: string): string | null {
  if (!command) return null;
  const headTailPath = extractHeadTailReadPath(command);
  if (headTailPath) {
    return headTailPath;
  }
  const patterns = [
    /sed\s+-n\s+['"][^'"]*['"]\s+["']([^"']+)["']/,
    /sed\s+-n\s+['"][^'"]*['"]\s+(\S+)/,
    /\b(?:cat|less)\s+["']([^"']+)["']/,
    /\b(?:cat|less)\s+([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
    /["']?(\/workspace\/[^"'\s|&;>]+)["']?/,
  ];
  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractReadLineRange(command?: string): string | null {
  if (!command) return null;
  const sedRange = command.match(/sed\s+-n\s+['"](\d+),(\d+)p['"]/);
  if (sedRange) return `lines ${sedRange[1]}-${sedRange[2]}`;
  const head = command.match(/head\s+-n\s+(\d+)/);
  if (head) return `first ${head[1]} lines`;
  const compactHead = command.match(/head\s+-(\d+)(?:\s|$)/);
  if (compactHead) return `first ${compactHead[1]} lines`;
  const tail = command.match(/tail\s+-n\s+(\d+)/);
  if (tail) return `last ${tail[1]} lines`;
  const compactTail = command.match(/tail\s+-(\d+)(?:\s|$)/);
  if (compactTail) return `last ${compactTail[1]} lines`;
  return null;
}

function decodeJsonStringFragment(fragment: string): string {
  let result = "";
  for (let index = 0; index < fragment.length; index += 1) {
    const char = fragment[index];
    if (char !== "\\") {
      result += char;
      continue;
    }

    const next = fragment[index + 1];
    if (next == null) {
      break;
    }

    index += 1;
    if (next === "n") {
      result += "\n";
    } else if (next === "r") {
      result += "\r";
    } else if (next === "t") {
      result += "\t";
    } else if (next === "b") {
      result += "\b";
    } else if (next === "f") {
      result += "\f";
    } else if (next === '"' || next === "\\" || next === "/") {
      result += next;
    } else if (next === "u") {
      const hex = fragment.slice(index + 1, index + 5);
      if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        result += String.fromCharCode(Number.parseInt(hex, 16));
        index += 4;
      }
    } else {
      result += next;
    }
  }
  return result;
}

function extractJsonStringFieldValue(source: string, fieldNames: string[]): string | null {
  for (const fieldName of fieldNames) {
    const fieldPattern = new RegExp(`"${fieldName}"\\s*:\\s*"`, "i");
    const match = fieldPattern.exec(source);
    if (!match) {
      continue;
    }

    const start = match.index + match[0].length;
    let raw = "";
    let escaped = false;
    for (let index = start; index < source.length; index += 1) {
      const char = source[index];
      if (escaped) {
        raw += char;
        escaped = false;
        continue;
      }
      if (char === "\\") {
        raw += char;
        escaped = true;
        continue;
      }
      if (char === '"') {
        return decodeJsonStringFragment(raw);
      }
      raw += char;
    }

    if (raw) {
      return decodeJsonStringFragment(raw);
    }
  }
  return null;
}

function extractJsonBooleanFieldValue(source: string, fieldNames: string[]): boolean | null {
  for (const fieldName of fieldNames) {
    const fieldPattern = new RegExp(`"${fieldName}"\\s*:\\s*(true|false)`, "i");
    const match = fieldPattern.exec(source);
    if (!match?.[1]) {
      continue;
    }
    return match[1].toLowerCase() === "true";
  }
  return null;
}

type StructuredCommandExecutionOutput = {
  stdout: string;
  stderr: string;
  returnCodeInterpretation: string | null;
  backgroundTaskId: string | null;
  interrupted: boolean | null;
  noOutputExpected: boolean | null;
};

function parseStructuredCommandExecutionOutput(output: unknown): StructuredCommandExecutionOutput | null {
  const hasEnvelopeKeys = (record: Record<string, unknown>): boolean =>
    [
      "stdout",
      "stderr",
      "returnCodeInterpretation",
      "backgroundTaskId",
      "interrupted",
      "noOutputExpected",
      "sandboxStatus",
      "rawOutputPath",
      "persistedOutputPath",
    ].some((key) => Object.prototype.hasOwnProperty.call(record, key));

  const buildEnvelope = (record: Record<string, unknown>): StructuredCommandExecutionOutput => ({
    stdout: typeof record.stdout === "string" ? record.stdout : "",
    stderr: typeof record.stderr === "string" ? record.stderr : "",
    returnCodeInterpretation:
      typeof record.returnCodeInterpretation === "string" && record.returnCodeInterpretation.trim()
        ? record.returnCodeInterpretation.trim()
        : null,
    backgroundTaskId:
      typeof record.backgroundTaskId === "string" && record.backgroundTaskId.trim()
        ? record.backgroundTaskId.trim()
        : null,
    interrupted: typeof record.interrupted === "boolean" ? record.interrupted : null,
    noOutputExpected: typeof record.noOutputExpected === "boolean" ? record.noOutputExpected : null,
  });

  const visit = (value: unknown): StructuredCommandExecutionOutput | null => {
    if (value == null) {
      return null;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = visit(entry);
        if (nested) {
          return nested;
        }
      }
      return null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
        return null;
      }
      try {
        return visit(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    if (typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    if (hasEnvelopeKeys(record)) {
      return buildEnvelope(record);
    }

    const nestedCandidates = [
      record.result,
      record.payload,
      record.data,
      record.structuredContent,
      record.structured_content,
    ];
    for (const candidate of nestedCandidates) {
      const nested = visit(candidate);
      if (nested) {
        return nested;
      }
    }
    return null;
  };

  const structured = visit(output);
  if (structured) {
    return structured;
  }

  if (typeof output !== "string") {
    return null;
  }

  const trimmed = output.trim();
  if (!trimmed || !/"(?:stdout|stderr|returnCodeInterpretation|backgroundTaskId|interrupted|noOutputExpected)"\s*:/i.test(trimmed)) {
    return null;
  }

  return {
    stdout: extractJsonStringFieldValue(trimmed, ["stdout"]) || "",
    stderr: extractJsonStringFieldValue(trimmed, ["stderr"]) || "",
    returnCodeInterpretation: extractJsonStringFieldValue(trimmed, ["returnCodeInterpretation"]),
    backgroundTaskId: extractJsonStringFieldValue(trimmed, ["backgroundTaskId"]),
    interrupted: extractJsonBooleanFieldValue(trimmed, ["interrupted"]),
    noOutputExpected: extractJsonBooleanFieldValue(trimmed, ["noOutputExpected"]),
  };
}

function resolveCommandOutputText(output: unknown, preferred: "stdout" | "combined" = "combined"): string {
  const structured = parseStructuredCommandExecutionOutput(output);
  if (!structured) {
    return stripRunnerSystemTags(String(output || ""));
  }

  if (preferred === "stdout") {
    return stripRunnerSystemTags(structured.stdout || structured.stderr || "");
  }

  return stripRunnerSystemTags([structured.stdout, structured.stderr].filter(Boolean).join("\n"));
}

function extractStructuredReadFilePayload(output: string): { filePath?: string; content?: string } | null {
  const visit = (value: unknown): { filePath?: string; content?: string } | null => {
    if (value == null) {
      return null;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = visit(entry);
        if (nested) {
          return nested;
        }
      }
      return null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
        return null;
      }
      try {
        return visit(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    if (typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    const filePathCandidate =
      typeof record.filePath === "string" ? record.filePath
      : typeof record.file_path === "string" ? record.file_path
      : typeof record.path === "string" ? record.path
      : undefined;
    const contentCandidate =
      typeof record.content === "string" ? record.content
      : typeof record.text === "string" ? record.text
      : undefined;

    if (filePathCandidate || contentCandidate !== undefined) {
      return {
        ...(filePathCandidate ? { filePath: filePathCandidate } : {}),
        ...(contentCandidate !== undefined ? { content: contentCandidate } : {}),
      };
    }

    const nestedCandidates = [
      record.file,
      record.result,
      record.payload,
      record.data,
      record.structuredContent,
      record.structured_content,
    ];
    for (const candidate of nestedCandidates) {
      const nested = visit(candidate);
      if (nested) {
        return nested;
      }
    }
    return null;
  };

  const structured = visit(output);
  if (structured) {
    return structured;
  }

  const fallbackFilePath = extractJsonStringFieldValue(output, ["filePath", "file_path", "path"]);
  const fallbackContent = extractJsonStringFieldValue(output, ["content", "text"]);
  if (fallbackFilePath || fallbackContent !== null) {
    return {
      ...(fallbackFilePath ? { filePath: fallbackFilePath } : {}),
      ...(fallbackContent !== null ? { content: fallbackContent } : {}),
    };
  }

  return null;
}

function extractStructuredWriteFilePayload(output: string): {
  filePath?: string;
  content?: string;
  operation?: "created" | "modified" | "deleted";
  diffText?: string;
  additions?: number;
  deletions?: number;
} | null {
  const normalizeOperation = (value: unknown): "created" | "modified" | "deleted" | undefined => {
    const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (!normalized) return undefined;
    if (normalized === "created" || normalized === "create" || normalized === "new" || normalized === "write") {
      return "created";
    }
    if (
      normalized === "modified" ||
      normalized === "modify" ||
      normalized === "updated" ||
      normalized === "update" ||
      normalized === "edit" ||
      normalized === "edited" ||
      normalized === "replace"
    ) {
      return "modified";
    }
    if (normalized === "delete" || normalized === "deleted" || normalized === "remove" || normalized === "removed") {
      return "deleted" as const;
    }
    return undefined;
  };

  const visit = (value: unknown): {
    filePath?: string;
    content?: string;
    operation?: "created" | "modified" | "deleted";
    diffText?: string;
    additions?: number;
    deletions?: number;
  } | null => {
    if (value == null) {
      return null;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = visit(entry);
        if (nested) {
          return nested;
        }
      }
      return null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
        return null;
      }
      try {
        return visit(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    if (typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    const filePathCandidate =
      typeof record.filePath === "string" ? record.filePath
      : typeof record.file_path === "string" ? record.file_path
      : typeof record.path === "string" ? record.path
      : undefined;
    const contentCandidate =
      typeof record.content === "string" ? record.content
      : typeof record.text === "string" ? record.text
      : typeof record.newContent === "string" ? record.newContent
      : typeof record.newString === "string" ? record.newString
      : undefined;
    const operationCandidate =
      normalizeOperation(record.operationKind)
      || normalizeOperation(record.operation_kind)
      || normalizeOperation(record.operation)
      || normalizeOperation(record.type)
      || normalizeOperation(record.mode);
    const structuredPatch = Array.isArray(record.structuredPatch)
      ? (record.structuredPatch as Array<{ oldStart?: number; oldLines?: number; newStart?: number; newLines?: number; lines?: string[] }>)
      : Array.isArray(record.structured_patch)
        ? (record.structured_patch as Array<{ oldStart?: number; oldLines?: number; newStart?: number; newLines?: number; lines?: string[] }>)
        : [];
    const gitDiff =
      typeof record.gitDiff === "string" && record.gitDiff.trim()
        ? record.gitDiff
        : typeof record.diff === "string" && record.diff.trim()
          ? record.diff
          : typeof record.changes === "string" && record.changes.trim()
            ? record.changes
            : "";
    const diffText =
      gitDiff ||
      (filePathCandidate && structuredPatch.length > 0
        ? buildStructuredPatchDiff(filePathCandidate, structuredPatch, operationCandidate || "modified")
        : "");
    const stats = diffText ? countDiffStats(diffText) : null;

    if (filePathCandidate || contentCandidate !== undefined || operationCandidate || diffText) {
      return {
        ...(filePathCandidate ? { filePath: filePathCandidate } : {}),
        ...(contentCandidate !== undefined ? { content: contentCandidate } : {}),
        ...(operationCandidate ? { operation: operationCandidate } : {}),
        ...(diffText ? { diffText } : {}),
        ...(stats ? { additions: stats.additions, deletions: stats.deletions } : {}),
      };
    }

    const nestedCandidates = [
      record.file,
      record.result,
      record.payload,
      record.data,
      record.structuredContent,
      record.structured_content,
    ];
    for (const candidate of nestedCandidates) {
      const nested = visit(candidate);
      if (nested) {
        return nested;
      }
    }
    return null;
  };

  const structured = visit(output);
  if (structured) {
    return structured;
  }

  const fallbackFilePath = extractJsonStringFieldValue(output, ["filePath", "file_path", "path"]);
  const fallbackContent = extractJsonStringFieldValue(output, ["content", "text"]);
  const fallbackOperation =
    normalizeOperation(extractJsonStringFieldValue(output, ["operationKind", "operation_kind", "operation", "type", "mode"]));
  if (fallbackFilePath || fallbackContent !== null || fallbackOperation) {
    return {
      ...(fallbackFilePath ? { filePath: fallbackFilePath } : {}),
      ...(fallbackContent !== null ? { content: fallbackContent } : {}),
      ...(fallbackOperation ? { operation: fallbackOperation } : {}),
    };
  }

  return null;
}

export function isWriteFileLog(log?: RunnerLog): boolean {
  if (!log) return false;
  const command = String(log.metadata?.command || "");
  const message = String(log.message || "");
  const output = typeof log.metadata?.output === "string" ? log.metadata.output : "";
  const structuredWrite = extractStructuredWriteFilePayload(output);
  const candidatePaths = [
    ...(Array.isArray(log.metadata?.filePaths)
      ? log.metadata.filePaths.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : []),
    structuredWrite?.filePath,
    extractWriteFilePath(command),
    extractWorkspacePathFromText(message),
    extractWriteMessagePath(message),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  if (candidatePaths.length > 0 && candidatePaths.every((filePath) => isRunnerNullDevicePath(filePath))) {
    return false;
  }

  return (
    isWriteFileCommand(command) ||
    /^Write:\s+/i.test(message) ||
    /^Edit:\s+/i.test(message) ||
    /^Delete:\s+/i.test(message) ||
    /"structuredPatch"\s*:/.test(output) ||
    /"gitDiff"\s*:/.test(output)
  );
}

export function collectRunnerLogFileChangePreviews(log: RunnerLog): RunnerLogFileChangePreview[] {
  if (!log) {
    return [];
  }

  if (log.eventType === "file_change") {
    const filePaths = Array.isArray(log.metadata?.filePaths)
      ? log.metadata.filePaths.filter((value): value is string =>
        typeof value === "string" && value.trim().length > 0 && !isRunnerNullDevicePath(value)
      )
      : [];
    if (filePaths.length === 0) {
      return [];
    }

    const changeKinds = Array.isArray(log.metadata?.changeKinds) ? log.metadata.changeKinds : [];
    const fileContents =
      log.metadata?.fileContents && typeof log.metadata.fileContents === "object"
        ? (log.metadata.fileContents as Record<string, string>)
        : undefined;
    const diffs =
      log.metadata?.diffs && typeof log.metadata.diffs === "object"
        ? (log.metadata.diffs as Record<string, RunnerFileDiffMetadata>)
        : undefined;

    return filePaths.map((filePath, index) => {
      const resolvedDiff = resolveFileMapValue(diffs, filePath);
      const normalizedKind = String(changeKinds[index] || "").trim().toLowerCase();
      const kind: "created" | "modified" | "deleted" =
        normalizedKind === "created"
          ? "created"
          : normalizedKind === "deleted"
            ? "deleted"
            : "modified";
      const content = resolveFileMapValue(fileContents, filePath);
      const diffText = stripRunnerSystemTags(
        String(
          resolvedDiff?.diff ||
            resolvedDiff?.changes ||
            (kind === "created" && filePath && content ? buildCreatedFileDiff(filePath, content) : "")
        )
      ).trim();
      const fallbackStats = diffText ? countDiffStats(diffText) : null;

      return {
        path: filePath,
        kind,
        ...(typeof content === "string" ? { content } : {}),
        ...(diffText ? { diff: diffText } : {}),
        ...(typeof resolvedDiff?.additions === "number"
          ? { additions: resolvedDiff.additions }
          : fallbackStats
            ? { additions: fallbackStats.additions }
            : {}),
        ...(typeof resolvedDiff?.deletions === "number"
          ? { deletions: resolvedDiff.deletions }
          : fallbackStats
            ? { deletions: fallbackStats.deletions }
            : {}),
      };
    });
  }

  const imageGenerationCommand = typeof log.metadata?.command === "string" ? log.metadata.command : undefined;
  if (
    (log.eventType === "command_execution" || log.eventType === "mcp_tool_call") &&
    isLikelyImageGenerationLog(log, imageGenerationCommand)
  ) {
    const imagePaths = new Set<string>();
    const metadataFilePaths = Array.isArray(log.metadata?.filePaths)
      ? log.metadata.filePaths.filter((value): value is string =>
        typeof value === "string" && value.trim().length > 0 && !isRunnerNullDevicePath(value)
      )
      : [];
    for (const filePath of metadataFilePaths) {
      if (isRunnerLogImageFilePath(filePath)) {
        imagePaths.add(filePath);
      }
    }
    if (typeof log.metadata?.savedImagePath === "string" && log.metadata.savedImagePath.trim()) {
      imagePaths.add(log.metadata.savedImagePath.trim());
    }
    const resultImagePath = extractWorkspaceImagePathFromResult(log.metadata?.result);
    if (resultImagePath) {
      imagePaths.add(resultImagePath);
    }
    const outputImagePath = extractWorkspaceImagePathFromOutput(log.metadata?.output);
    if (outputImagePath) {
      imagePaths.add(outputImagePath);
    }
    const messageImagePath = extractWorkspaceImagePathFromOutput(log.message);
    if (messageImagePath) {
      imagePaths.add(messageImagePath);
    }

    const resolvedImagePaths = Array.from(imagePaths);
    if (resolvedImagePaths.length === 0) {
      return [];
    }

    const normalizedKind = String(log.metadata?.changeKinds?.[0] || "").trim().toLowerCase();
    const kind: "created" | "modified" | "deleted" =
      normalizedKind === "deleted"
        ? "deleted"
        : normalizedKind === "modified"
          ? "modified"
          : "created";

    return resolvedImagePaths.map((filePath) => ({
      path: filePath,
      kind,
    }));
  }

  if (log.eventType !== "command_execution") {
    return [];
  }

  if (!isWriteFileLog(log)) {
    const deletedFilePath = extractDeletedFilePathFromCommandOutput(log);
    if (!deletedFilePath) {
      return [];
    }
    return [{
      path: deletedFilePath,
      kind: "deleted",
    }];
  }

  const command = String(log.metadata?.command || "");
  const output = stripRunnerSystemTags(String(log.metadata?.output || ""));
  const structuredWrite = extractStructuredWriteFilePayload(output);
  const filePath =
    (log.metadata?.filePaths?.[0] as string | undefined) ||
    structuredWrite?.filePath ||
    extractWriteFilePath(command) ||
    extractWorkspacePathFromText(log.message) ||
    extractWriteMessagePath(log.message) ||
    undefined;
  if (!filePath || isRunnerNullDevicePath(filePath)) {
    return [];
  }

  const fileContents = log.metadata?.fileContents as Record<string, string> | undefined;
  const content = resolveFileMapValue(fileContents, filePath) ?? structuredWrite?.content;
  const operation = structuredWrite?.operation || deriveWriteOperation(command, log.metadata?.changeKinds?.[0]);
  const previewSource = typeof content === "string" ? content : output;
  const diffPreview = resolveWriteDiffPreview(log, filePath, previewSource, operation);
  const effectiveDiffText = String(structuredWrite?.diffText || diffPreview.diffText || "").trim();

  return [{
    path: filePath,
    kind: operation,
    ...(typeof content === "string" ? { content } : {}),
    ...(effectiveDiffText ? { diff: effectiveDiffText } : {}),
    ...(typeof structuredWrite?.additions === "number"
      ? { additions: structuredWrite.additions }
      : typeof diffPreview.additions === "number"
        ? { additions: diffPreview.additions }
        : {}),
    ...(typeof structuredWrite?.deletions === "number"
      ? { deletions: structuredWrite.deletions }
      : typeof diffPreview.deletions === "number"
        ? { deletions: diffPreview.deletions }
        : {}),
  }];
}

function extractDeletedFilePathFromCommandOutput(log: RunnerLog): string | null {
  if (log.eventType !== "command_execution") {
    return null;
  }

  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const outputText = [
    parsedOutput?.stdout || "",
    parsedOutput?.stderr || "",
    stripRunnerSystemTags(String(log.metadata?.output || "")),
  ]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join("\n");
  if (!/no such file or directory/i.test(outputText)) {
    return null;
  }

  const pathMatch =
    /cannot access ['"`]([^'"`\n]+)['"`]: No such file or directory/i.exec(outputText) ||
    /cannot remove ['"`]([^'"`\n]+)['"`]: No such file or directory/i.exec(outputText) ||
    /no such file or directory[^\n]*['"`]([^'"`\n]+)['"`]/i.exec(outputText);
  const resolvedPath = normalizeRunnerFilePath(pathMatch?.[1] || "");
  if (!resolvedPath || isRunnerNullDevicePath(resolvedPath)) {
    return null;
  }
  return resolvedPath;
}

function resolveReadDocumentPreviewAttachment(
  filePath: string | undefined,
  content: string,
  backendUrl?: string,
  environmentId?: string | null
): RunnerPreviewAttachment | null {
  const normalizedContent = String(content || "");
  const looksLikeHtml =
    /\.html?$/i.test(String(filePath || "")) ||
    /<!doctype\s+html/i.test(normalizedContent) ||
    /<html[\s>]/i.test(normalizedContent) ||
    (/<head[\s>]/i.test(normalizedContent) && /<body[\s>]/i.test(normalizedContent));
  if (!looksLikeHtml) {
    return null;
  }

  const normalizedPath = normalizeRunnerFilePath(filePath) || "/workspace/preview.html";
  const baseAttachment = buildRunnerPreviewAttachmentFromPath(normalizedPath, {
    backendUrl,
    environmentId,
    idPrefix: "log-preview",
  });
  const htmlDocument = buildRunnerPreviewHtmlDocument(normalizedContent);
  return {
    ...baseAttachment,
    filename: getFileName(normalizedPath),
    mimeType: "text/html",
    type: "document",
    htmlPreviewUrl: `data:text/html;charset=utf-8,${encodeURIComponent(htmlDocument)}`,
  };
}

function resolveReadCodePreviewAttachment(
  filePath: string | undefined,
  content: string,
  backendUrl?: string,
  environmentId?: string | null
): RunnerPreviewAttachment | null {
  const normalizedContent = String(content || "");
  if (!normalizedContent.trim()) {
    return null;
  }
  const normalizedPath = normalizeRunnerFilePath(filePath) || "/workspace/preview.txt";
  const filename = getFileName(normalizedPath);
  const isMarkdown = looksLikeMarkdown(normalizedContent, normalizedPath);
  const mimeType = isMarkdown ? "text/markdown" : "text/plain";
  return {
    ...buildRunnerPreviewAttachmentFromPath(normalizedPath, {
      backendUrl,
      environmentId,
      idPrefix: "log-preview-code",
    }),
    filename,
    mimeType,
    type: "document",
    previewKindOverride: isMarkdown ? "markdown" : "text",
    url: `data:${mimeType};charset=utf-8,${encodeURIComponent(normalizedContent)}`,
    previewUrl: `data:${mimeType};charset=utf-8,${encodeURIComponent(normalizedContent)}`,
  };
}

function ReadFileLogBox({
  log,
  timeLabel,
  backendUrl,
  environmentId,
  requestHeaders,
  onPreviewDocument,
  onWorkspacePathClick,
}: {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
  onWorkspacePathClick?: (path: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const command = log.metadata?.command || "";
  const filePath =
    normalizeRunnerFilePath(log.metadata?.filePaths?.[0] as string | undefined) ||
    normalizeRunnerFilePath((log.metadata as { file_path?: string; path?: string } | undefined)?.file_path) ||
    normalizeRunnerFilePath((log.metadata as { file_path?: string; path?: string } | undefined)?.path) ||
    normalizeRunnerFilePath(extractStructuredReadFilePayload(stripRunnerSystemTags(String(log.metadata?.output || "")))?.filePath) ||
    normalizeRunnerFilePath(extractReadFilePath(command)) ||
    normalizeRunnerFilePath(extractWorkspacePathFromText(log.message)) ||
    normalizeRunnerFilePath(extractWorkspacePathFromText(command));
  const output = stripRunnerSystemTags(String(log.metadata?.output || ""));
  const commandOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const structuredReadPayload = extractStructuredReadFilePayload(output);
  const lineRange = extractReadLineRange(command);
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;
  const content = stripLineNumbers(structuredReadPayload?.content ?? commandOutput?.stdout ?? output);
  const normalizedContent = content.trim().toLowerCase();
  const isImageFile = Boolean(filePath && isRunnerLogImageFilePath(filePath));
  const imagePreviewUrl = isImageFile ? buildRunnerPreviewDownloadUrl(backendUrl, environmentId, filePath) : null;
  const codePreviewAttachment = resolveReadCodePreviewAttachment(filePath || undefined, content, backendUrl, environmentId);
  const previewAttachment = resolveReadDocumentPreviewAttachment(filePath || undefined, content, backendUrl, environmentId);
  const isImageReadWithoutText =
    isImageFile
    && (
      normalizedContent.length === 0
      || normalizedContent === "read completed (no textual content found)."
    );
  const detectedLanguage = detectCodeLanguage(content, filePath || undefined);
  const languageLabel = formatCodeLanguageLabel(detectedLanguage);
  const shouldRenderMarkdownPreview = detectedLanguage === "markdown";
  const openCodePreviewLabel =
    shouldRenderMarkdownPreview && codePreviewAttachment
      ? `Open Markdown preview for ${codePreviewAttachment.filename}`
      : codePreviewAttachment
        ? `Open code preview for ${codePreviewAttachment.filename}`
        : "";

  useEffect(() => {
    if (!copied) return;
    const timeoutId = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy() {
    try {
      await copyRunnerText(content);
      setCopied(true);
    } catch {}
  }

  if (isImageReadWithoutText) {
    return (
      <ImagePreviewLogCard
        icon={<FileImage className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Read File"
        title={filePath ? getFileName(filePath) : "file"}
        timeLabel={timeLabel}
        meta={lineRange ? <span className="tb-log-card-pill">{lineRange}</span> : null}
        body={
          isError ? (
            <div className="tb-log-card-state tb-log-card-state-error">{output || "An error occurred while reading the file."}</div>
          ) : imagePreviewUrl ? (
            <div className="tb-log-image-grid">
              <RunnerImagePreviewSurface
                src={imagePreviewUrl}
                alt={filePath || "Read image"}
                fetchHeaders={requestHeaders}
                loadStrategy="visible"
              />
            </div>
          ) : (
            <div className="tb-log-card-empty">No image preview available.</div>
          )
        }
      />
    );
  }

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<ScanText className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Read File"
        title={filePath ? getFileName(filePath) : "file"}
        timeLabel={timeLabel}
        meta={lineRange ? <span className="tb-log-card-pill">{lineRange}</span> : null}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{output || "An error occurred while reading the file."}</div>
        ) : content ? (
          <>
            <div className="tb-log-file-preview-frame">
              <div className="tb-log-file-preview-topbar">
                <span className="tb-log-file-preview-language">{languageLabel}</span>
                <div className="tb-log-file-preview-actions">
                  {codePreviewAttachment ? (
                    <button
                      type="button"
                      className="tb-log-file-preview-icon-button"
                      onClick={() => onPreviewDocument?.(codePreviewAttachment)}
                      aria-label={openCodePreviewLabel}
                      title={openCodePreviewLabel}
                    >
                      <ListChevronsUpDown className="tb-log-file-preview-action-icon" strokeWidth={1.5} />
                    </button>
                  ) : null}
                  {previewAttachment ? (
                    <button
                      type="button"
                      className="tb-log-file-preview-icon-button"
                      onClick={() => onPreviewDocument?.(previewAttachment)}
                      aria-label={`Preview ${previewAttachment.filename}`}
                      title={`Preview ${previewAttachment.filename}`}
                    >
                      <Eye className="tb-log-file-preview-action-icon" strokeWidth={1.5} />
                    </button>
                  ) : null}
                  <button type="button" className="tb-log-file-preview-copy" onClick={handleCopy}>
                    <Copy className="tb-log-file-preview-action-icon" strokeWidth={1.5} />
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
              <div className="tb-log-file-preview-body">
                {shouldRenderMarkdownPreview ? (
                  <RunnerMarkdown
                    content={content}
                    className="tb-log-file-markdown-preview tb-message-markdown"
                    onWorkspacePathClick={onWorkspacePathClick}
                  />
                ) : (
                  <RunnerCodeViewer
                    key={`${filePath || "inline"}:${detectedLanguage}:file-preview`}
                    content={content}
                    filePath={filePath}
                    language={detectedLanguage}
                    maxHeight={500}
                    showLineNumbers
                    className="tb-log-card-code-hide-scrollbars"
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="tb-log-card-empty">File was empty.</div>
        )}
      </LogPanel>
    </div>
  );
}

function isWriteFileCommand(command?: string): boolean {
  if (!command) return false;
  const isWriteLike = [
    /^\$?\s*write_file\b/i,
    /^\$?\s*edit_file\b/i,
    /\bcat\s+>+\s*/,
    /\becho\s+.*>+\s*/,
    /\bprintf\s+.*>+\s*/,
    /\btee\s+["']?[^|&;]+/,
    /\bsed\s+-i/,
    />\s*["']?\/workspace\//,
    /\bcp\s+.*["']?\/workspace\//,
    /\bmv\s+.*["']?\/workspace\//,
  ].some((pattern) => pattern.test(command));
  if (!isWriteLike) return false;
  const writeTarget = extractWriteFilePath(command);
  return !isRunnerNullDevicePath(writeTarget);
}

function extractWriteFilePath(command?: string): string | null {
  if (!command) return null;
  const patterns = [
    />+\s*["']([^"']+)["']/,
    />+\s*([^\s|&;>"']+)/,
    /\btee\s+["']([^"']+)["']/,
    /\btee\s+([^\s|&;>"']+)/,
    /\bsed\s+-i\s+['"][^'"]*['"]\s+["']([^"']+)["']/,
    /\bsed\s+-i\s+['"][^'"]*['"]\s+([^\s|&;>"']+)/,
    /\b(?:cp|mv)\s+.*\s+["']?([^\s"']+)["']?\s*$/,
    /["']?(\/workspace\/[^"'\s|&;>]+)["']?/,
  ];
  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractWriteMessagePath(message?: string | null): string | null {
  const match = String(message || "").match(/^\s*(?:Write|Edit|Delete):\s+(.+?)\s*$/i);
  return normalizeRunnerFilePath(match?.[1] || "") || null;
}

function deriveWriteOperation(command?: string, changeKind?: string): "created" | "modified" {
  if (changeKind === "created") return "created";
  if (changeKind === "modified" || changeKind === "update" || changeKind === "updated") return "modified";
  if (!command) return "modified";
  if (command.includes(">>")) return "modified";
  if (/\bsed\s+-i/.test(command)) return "modified";
  if (command.includes(">") && !command.includes(">>")) return "created";
  if (/\b(?:cp|mv)\s+/.test(command)) return "created";
  return "modified";
}

function resolveWriteDocumentPreviewAttachment(
  filePath: string | undefined,
  backendUrl?: string,
  environmentId?: string | null
): RunnerPreviewAttachment | null {
  const normalizedPath = normalizeRunnerFilePath(filePath);
  if (!normalizedPath) {
    return null;
  }

  const attachment = buildRunnerPreviewAttachmentFromPath(normalizedPath, {
    backendUrl,
    environmentId,
    idPrefix: "log-preview",
  });
  if (!attachment.url || attachment.type !== "document") {
    return null;
  }

  const previewKind = getRunnerDocumentPreviewKind(attachment);
  if (previewKind !== "pdf" && previewKind !== "html" && previewKind !== "markdown") {
    return null;
  }

  return attachment;
}

function WriteFileSingleLogBox({
  log,
  timeLabel,
  backendUrl,
  environmentId,
  requestHeaders,
  onPreviewDocument,
}: {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const command = log.metadata?.command || "";
  const structuredWrite = extractStructuredWriteFilePayload(stripRunnerSystemTags(String(log.metadata?.output || "")));
  const filePath =
    (log.metadata?.filePaths?.[0] as string | undefined)
    || structuredWrite?.filePath
    || extractWriteFilePath(command)
    || extractWorkspacePathFromText(log.message)
    || extractWriteMessagePath(log.message)
    || undefined;
  if (isRunnerNullDevicePath(filePath)) {
    return null;
  }
  const fileContents = log.metadata?.fileContents as Record<string, string> | undefined;
  const fileContent = resolveFileMapValue(fileContents, filePath) ?? structuredWrite?.content;
  const output = stripRunnerSystemTags(String(fileContent || log.metadata?.output || ""));
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;
  const operation = structuredWrite?.operation || deriveWriteOperation(command, log.metadata?.changeKinds?.[0]);
  const diffPreview = resolveWriteDiffPreview(log, filePath, output, operation);
  const diffText = String(structuredWrite?.diffText || diffPreview.diffText || "").trim();
  const additions =
    typeof structuredWrite?.additions === "number"
      ? structuredWrite.additions
      : diffPreview.additions;
  const deletions =
    typeof structuredWrite?.deletions === "number"
      ? structuredWrite.deletions
      : diffPreview.deletions;
  const hasKnownCounts =
    typeof structuredWrite?.additions === "number" ||
    typeof structuredWrite?.deletions === "number" ||
    diffPreview.hasKnownCounts;
  const imagePreviewUrl = isRunnerLogImageFilePath(filePath)
    ? buildRunnerPreviewDownloadUrl(backendUrl, environmentId, filePath)
    : null;
  const previewAttachment = resolveWriteDocumentPreviewAttachment(filePath, backendUrl, environmentId);
  const codePreviewAttachment = resolveReadCodePreviewAttachment(filePath || undefined, output, backendUrl, environmentId);
  const detectedLanguage = detectCodeLanguage(output, filePath || undefined);
  const languageLabel = formatCodeLanguageLabel(detectedLanguage);
  const imageLabel = operation === "created" ? "Generated Image" : "Updated Image";

  useEffect(() => {
    if (!copied) return;
    const timeoutId = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy() {
    try {
      await copyRunnerText(output || diffText || "");
      setCopied(true);
    } catch {}
  }

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={(imagePreviewUrl ? <FileImage className="tb-log-card-small-icon" strokeWidth={1.5} /> : <FilePlus className="tb-log-card-small-icon" strokeWidth={1.5} />)}
        label={
          imagePreviewUrl
            ? imageLabel
            : operation === "created"
              ? "Create File"
              : operation === "deleted"
                ? "Delete File"
                : "Edit File"
        }
        title={filePath || "file"}
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{output || "An error occurred while writing the file."}</div>
        ) : imagePreviewUrl ? (
          <div className="tb-log-image-grid">
            <RunnerImagePreviewSurface
              src={imagePreviewUrl}
              alt={filePath || "Generated image"}
              fetchHeaders={requestHeaders}
              loadStrategy="visible"
            />
          </div>
        ) : diffText || output ? (
          <>
            <div className="tb-log-file-preview-frame">
              <div className="tb-log-file-preview-topbar">
                <span className="tb-log-file-preview-language">{languageLabel}</span>
                <div className="tb-log-file-preview-actions">
                  {codePreviewAttachment ? (
                    <button
                      type="button"
                      className="tb-log-file-preview-icon-button"
                      onClick={() => onPreviewDocument?.(codePreviewAttachment)}
                      aria-label={`Open code preview for ${codePreviewAttachment.filename}`}
                      title={`Open code preview for ${codePreviewAttachment.filename}`}
                    >
                      <ListChevronsUpDown className="tb-log-file-preview-action-icon" strokeWidth={1.5} />
                    </button>
                  ) : null}
                  {previewAttachment ? (
                    <button
                      type="button"
                      className="tb-log-file-preview-icon-button"
                      onClick={() => onPreviewDocument?.(previewAttachment)}
                      aria-label={`Preview ${previewAttachment.filename}`}
                      title={`Preview ${previewAttachment.filename}`}
                    >
                      <Eye className="tb-log-file-preview-action-icon" strokeWidth={1.5} />
                    </button>
                  ) : null}
                  <button type="button" className="tb-log-file-preview-copy" onClick={handleCopy}>
                    <Copy className="tb-log-file-preview-action-icon" strokeWidth={1.5} />
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
              <div className="tb-log-file-preview-body">
                {diffText ? (
                  <RunnerFileDiffSurface
                    filePath={filePath}
                    diffContent={diffText}
                    fileContent={output}
                    additions={hasKnownCounts ? additions : undefined}
                    deletions={hasKnownCounts ? deletions : undefined}
                    emptyMessage="Diff unavailable for this log."
                    maxHeight={500}
                    hideTopbar
                    embedded
                  />
                ) : (
                  <RunnerStaticCodeViewer
                    content={output}
                    language={detectedLanguage}
                    className="tb-log-card-code-hide-scrollbars"
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="tb-log-card-empty">Diff unavailable for this log.</div>
        )}
      </LogPanel>
    </div>
  );
}

function WriteFileLogGroup({
  log,
  timeLabel,
  backendUrl,
  environmentId,
  requestHeaders,
  onPreviewDocument,
}: {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
}) {
  const filePaths = (log.metadata?.filePaths || []).filter((filePath) => !isRunnerNullDevicePath(filePath));
  if (filePaths.length === 0 && Array.isArray(log.metadata?.filePaths) && log.metadata.filePaths.length > 0) {
    return null;
  }
  if (filePaths.length <= 1) {
    return (
      <WriteFileSingleLogBox
        log={log}
        timeLabel={timeLabel}
        backendUrl={backendUrl}
        environmentId={environmentId}
        requestHeaders={requestHeaders}
        onPreviewDocument={onPreviewDocument}
      />
    );
  }
  return (
    <div className="tb-log-group-stack">
      {filePaths.map((filePath, index) => {
        const singleLog: RunnerLog = {
          ...log,
          metadata: {
            ...log.metadata,
            filePaths: [filePath],
            changeKinds: log.metadata?.changeKinds ? [log.metadata.changeKinds[index] || "modified"] : undefined,
            fileContents: (() => {
              const source = log.metadata?.fileContents as Record<string, string> | undefined;
              const value = resolveFileMapValue(source, filePath);
              return value ? { [filePath]: value } : undefined;
            })(),
            diffs: (() => {
              const source = log.metadata?.diffs as Record<string, RunnerFileDiffMetadata> | undefined;
              const value = resolveFileMapValue(source, filePath);
              return value ? { [filePath]: value } : undefined;
            })(),
          },
        };
        return (
          <WriteFileSingleLogBox
            key={`${filePath}-${index}`}
            log={singleLog}
            timeLabel={index === 0 ? timeLabel : undefined}
            backendUrl={backendUrl}
            environmentId={environmentId}
            requestHeaders={requestHeaders}
            onPreviewDocument={onPreviewDocument}
          />
        );
      })}
    </div>
  );
}

type ListFileItem = {
  name: string;
  type: "file" | "folder";
  path?: string;
  size?: string;
  sizeBytes?: number | null;
  isHidden: boolean;
};

type ListFileSort = "name" | "type" | "size";
type ListFileFilter = "visible" | "files" | "folders" | "hidden";
type ListFilePopover = "sort" | "filter" | null;
type ListFileMetadata = {
  sizeBytes?: number;
  type?: "file" | "directory" | "folder";
};

const LIST_FILES_PAGE_SIZE = 5;
const DEFAULT_LIST_FILES_DIRECTORY = "/workspace";

function stripListFileAnsiSequences(value: string): string {
  return value.replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, "");
}

function stripShellInlineComments(command?: string): string {
  if (!command) return "";
  let quote: "'" | "\"" | null = null;
  let escaped = false;
  let result = "";
  for (let index = 0; index < command.length; index += 1) {
    const character = command[index];
    if (escaped) {
      result += character;
      escaped = false;
      continue;
    }
    if (character === "\\" && quote !== "'") {
      result += character;
      escaped = true;
      continue;
    }
    if (quote) {
      result += character;
      if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === "'" || character === "\"") {
      quote = character;
      result += character;
      continue;
    }
    if (character === "#" && (index === 0 || /\s/.test(command[index - 1] || ""))) {
      break;
    }
    result += character;
  }
  return result.trim();
}

function isUsableListDirectoryCandidate(value?: string | null): value is string {
  const trimmed = String(value || "").trim();
  return Boolean(trimmed && !trimmed.startsWith("-") && !/^#+$/.test(trimmed) && !trimmed.includes("#"));
}

function isListFilesCommand(command?: string): boolean {
  if (!command) return false;
  return [
    /(?:^|[;&|]\s*)\$?\s*(?:ls|ll)\b(?:\s|$)/i,
    /\bfind\s+(?!.*\s-exec\s)/i,
    /\brg\s+--files\b/i,
    /\bgit\s+ls-files\b/i,
  ].some((pattern) => pattern.test(command));
}

function extractShellCdPath(command?: string): string | null {
  if (!command) return null;
  const normalizedCommand = stripShellInlineComments(command);
  const patterns = [
    /(?:^|[;&|]\s*)cd\s+["']([^"']+)["']/,
    /(?:^|[;&|]\s*)cd\s+([^\s|&;>"']+)/,
  ];
  for (const pattern of patterns) {
    const match = normalizedCommand.match(pattern);
    const candidate = match?.[1]?.trim();
    if (isUsableListDirectoryCandidate(candidate)) {
      return candidate;
    }
  }
  return null;
}

function resolveListedDirectoryPath(command: string | undefined, listedPath: string): string {
  const normalizedListedPath = listedPath.trim();
  if (!normalizedListedPath || normalizedListedPath.startsWith("/") || normalizedListedPath.startsWith("~")) {
    return normalizedListedPath;
  }

  const cdPath = extractShellCdPath(command);
  if (!cdPath || !cdPath.startsWith("/")) {
    return normalizedListedPath;
  }

  if (normalizedListedPath === ".") {
    return cdPath;
  }

  return `${cdPath.replace(/\/+$/, "")}/${normalizedListedPath.replace(/^\.\//, "")}`;
}

function extractDirectoryPath(command?: string): string | null {
  if (!command) return null;
  const normalizedCommand = stripShellInlineComments(command);
  const cdPath = extractShellCdPath(normalizedCommand);
  const defaultDirectory = cdPath && cdPath.startsWith("/") ? cdPath : DEFAULT_LIST_FILES_DIRECTORY;
  const patterns = [
    /\b(?:ls|ll)\s+(?:-[a-zA-Z]+\s+)?["']([^"']+)["']/,
    /\b(?:ls|ll)\s+(?:-[a-zA-Z]+\s+)?([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
    /\bfind\s+["']([^"']+)["']/,
    /\bfind\s+([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
    /\brg\s+--files\s+["']([^"']+)["']/,
    /\brg\s+--files\s+([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
  ];
  for (const pattern of patterns) {
    const match = normalizedCommand.match(pattern);
    const candidate = match?.[1]?.trim();
    if (isUsableListDirectoryCandidate(candidate)) return resolveListedDirectoryPath(normalizedCommand, candidate);
  }
  const workspacePath = normalizedCommand.match(/(?:^|\s)(\/workspace(?:\/[^"'\s|&;>#]+)*)/);
  if (isUsableListDirectoryCandidate(workspacePath?.[1])) {
    return workspacePath[1];
  }
  return isListFilesCommand(normalizedCommand) ? defaultDirectory : null;
}

function isLikelyFileListLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("total ")) {
    return false;
  }
  if (/^[dl-][rwx-]{9}\s+/.test(trimmed)) {
    return true;
  }
  if (/^(?:\.{1,2}\/|\/workspace\/|~\/)[^\s]+$/.test(trimmed)) {
    return true;
  }
  if (/^[^\s]+\.[A-Za-z0-9]{1,12}$/.test(trimmed)) {
    return true;
  }
  return /^[A-Za-z0-9._@+-]+\/$/.test(trimmed);
}

function isLikelyFileListOutput(output: string): boolean {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("total "));
  if (lines.length < 2) {
    return false;
  }

  const fileLikeCount = lines.filter(isLikelyFileListLine).length;
  return fileLikeCount >= Math.min(3, lines.length) && fileLikeCount / lines.length >= 0.7;
}

function isListFilesLog(log?: RunnerLog): boolean {
  if (!log || log.eventType !== "command_execution") {
    return false;
  }
  const command = String(log.metadata?.command || "");
  if (isListFilesCommand(command)) {
    return true;
  }

  const output = resolveCommandOutputText(log.metadata?.output, "stdout");
  return !extractReadFilePath(command) && isLikelyFileListOutput(output);
}

function normalizeListFileName(name: string): string {
  return stripListFileAnsiSequences(name).trim().replace(/^\.\//, "");
}

function parseListFileSizeBytes(value: string): number | null {
  const normalized = value.trim();
  if (!normalized || normalized === "-") return null;
  const numericBytes = Number(normalized);
  if (Number.isFinite(numericBytes)) return numericBytes;
  const match = normalized.match(/^(\d+(?:\.\d+)?)([KMGTPE])B?$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers: Record<string, number> = {
    K: 1024,
    M: 1024 ** 2,
    G: 1024 ** 3,
    T: 1024 ** 4,
    P: 1024 ** 5,
    E: 1024 ** 6,
  };
  const multiplier = multipliers[unit];
  return Number.isFinite(amount) && multiplier ? Math.round(amount * multiplier) : null;
}

function getListFileDisplayName(pathOrName: string): string {
  const normalized = normalizeListFileName(pathOrName).replace(/\/+$/, "");
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] || normalized;
}

function normalizeListFileWorkspaceRelativePath(pathOrName: string): string {
  let normalized = String(pathOrName || "").trim().replace(/\\/g, "/");
  if (!normalized) return "";
  normalized = normalized.replace(/^\/workspace\/?/, "");
  normalized = normalized.replace(/^workspace\/?/, "");
  normalized = normalized.replace(/^\.\//, "");
  return normalized.replace(/^\/+|\/+$/g, "");
}

function getListFileMetadataLookupKey(pathOrName: string): string {
  const relativePath = normalizeListFileWorkspaceRelativePath(pathOrName);
  return relativePath ? `${DEFAULT_LIST_FILES_DIRECTORY}/${relativePath}` : DEFAULT_LIST_FILES_DIRECTORY;
}

function getListFileParentDirectory(pathOrName: string): string {
  const relativePath = normalizeListFileWorkspaceRelativePath(pathOrName);
  if (!relativePath || !relativePath.includes("/")) return "";
  return relativePath.split("/").slice(0, -1).join("/");
}

function buildListFileMetadataUrl(backendUrl: string | undefined, environmentId: string | null | undefined, folderPath: string): string {
  const normalizedBackendUrl = String(backendUrl || "").trim().replace(/\/+$/, "");
  const normalizedEnvironmentId = String(environmentId || "").trim();
  if (!normalizedBackendUrl || !normalizedEnvironmentId) return "";
  const params = new URLSearchParams();
  params.set("depth", "1");
  if (folderPath) {
    params.set("path", folderPath);
  }
  return `${normalizedBackendUrl}/environments/${encodeURIComponent(normalizedEnvironmentId)}/files?${params.toString()}`;
}

function isHiddenListFileName(name: string): boolean {
  const normalized = normalizeListFileName(name);
  const firstSegment = normalized.split("/").find(Boolean) || normalized;
  return firstSegment.startsWith(".") && firstSegment !== "." && firstSegment !== "..";
}

function isListLongFormatPermissions(value?: string): boolean {
  return /^[bcdlps-][rwxstST-]{9}[+@.]?$/.test(String(value || ""));
}

function isLikelyLongListMetadataLine(line: string): boolean {
  return line.split(/\s+/).some(isListLongFormatPermissions);
}

function parseLongListOutputLine(line: string): ListFileItem | null {
  const tokens = line.split(/\s+/).filter(Boolean);
  const permissionsIndex = tokens.findIndex(isListLongFormatPermissions);
  if (permissionsIndex < 0) return null;

  const permissions = tokens[permissionsIndex];
  const fields = tokens.slice(permissionsIndex + 1);
  if (fields.length < 7) return null;

  let sizeToken = fields[3];
  let nameStartIndex = /^\d{4}-\d{2}-\d{2}$/.test(fields[4] || "") ? 6 : 7;
  if (/^[\d.]+,$/.test(sizeToken) && fields.length >= 8) {
    sizeToken = "";
    nameStartIndex += 1;
  }

  const rawName = fields.slice(nameStartIndex).join(" ").replace(/\s+->\s+.+$/, "");
  const normalizedPath = normalizeListFileName(rawName);
  const displayName = getListFileDisplayName(normalizedPath);
  if (!displayName || displayName === "." || displayName === "..") {
    return null;
  }

  const sizeBytes = sizeToken ? parseListFileSizeBytes(sizeToken) : null;
  return {
    name: displayName,
    path: normalizedPath,
    type: permissions.startsWith("d") ? "folder" : "file",
    size: sizeBytes == null ? "" : formatBytes(sizeBytes),
    sizeBytes,
    isHidden: isHiddenListFileName(normalizedPath),
  };
}

function dedupeListFileItems(items: ListFileItem[]): ListFileItem[] {
  const byPath = new Map<string, ListFileItem>();
  for (const item of items) {
    const key = normalizeListFileWorkspaceRelativePath(item.path || item.name).toLowerCase() || item.name.toLowerCase();
    const existing = byPath.get(key);
    if (!existing) {
      byPath.set(key, item);
      continue;
    }
    const existingHasSize = existing.sizeBytes != null || Boolean(existing.size);
    const nextHasSize = item.sizeBytes != null || Boolean(item.size);
    if (!existingHasSize && nextHasSize) {
      byPath.set(key, item);
    }
  }
  return Array.from(byPath.values());
}

function parseListOutput(output: string): ListFileItem[] {
  if (!output.trim()) return [];
  const lines = output.trim().split("\n");
  const items: ListFileItem[] = [];
  for (const line of lines) {
    const trimmed = stripListFileAnsiSequences(line).trim();
    if (!trimmed || trimmed.startsWith("total ")) continue;
    const detailed = parseLongListOutputLine(trimmed);
    if (detailed) {
      items.push(detailed);
      continue;
    }
    if (isLikelyLongListMetadataLine(trimmed)) {
      continue;
    }
    const names = trimmed.split(/\s+/);
    for (const rawName of names) {
      const path = normalizeListFileName(rawName);
      const name = getListFileDisplayName(path);
      if (!name) continue;
      if (name === "." || name === "..") continue;
      const isLikelyFolder = !name.includes(".") || ["node_modules", "src", "dist", "build", "public", "assets", "components", "lib", "utils"].includes(name);
      items.push({ name, path, type: isLikelyFolder ? "folder" : "file", isHidden: isHiddenListFileName(path) });
    }
  }
  return dedupeListFileItems(items).sort((left, right) => {
    if (left.type !== right.type) return left.type === "folder" ? -1 : 1;
    return left.name.localeCompare(right.name);
  });
}

function fileKind(name: string): "image" | "video" | "audio" | "code" | "text" {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext || "")) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext || "")) return "video";
  if (["mp3", "wav", "ogg", "flac", "m4a"].includes(ext || "")) return "audio";
  if (["js", "ts", "jsx", "tsx", "py", "java", "c", "cpp", "h", "css", "scss", "html", "json", "xml", "yaml", "yml", "sh", "bash", "go", "rs", "rb", "php"].includes(ext || "")) return "code";
  return "text";
}

function FileKindIcon({ item }: { item: ListFileItem }) {
  if (item.type === "folder") {
    return <img src={RUNNER_FOLDER_ICON_URL} alt="" className="tb-log-file-icon-asset" />;
  }
  const kind = fileKind(item.name);
  if (kind === "image") return <img src={RUNNER_IMAGE_FILE_ICON_URL} alt="" className="tb-log-file-icon-asset" />;
  if (kind === "video") return <Video className="tb-log-card-small-icon" strokeWidth={1.5} />;
  if (kind === "audio") return <Music className="tb-log-card-small-icon" strokeWidth={1.5} />;
  return <img src={RUNNER_TEXT_FILE_ICON_URL} alt="" className="tb-log-file-icon-asset" />;
}

function getListFileCountLabel(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? "Item" : "Items"}`;
}

function getListFileTypeLabel(item: ListFileItem): string {
  return item.type === "folder" ? "Folder" : "File";
}

function getResolvedListFileTypeLabel(item: ListFileItem, metadata?: ListFileMetadata): string {
  if (metadata?.type === "directory" || metadata?.type === "folder") return "Folder";
  if (metadata?.type === "file") return "File";
  return getListFileTypeLabel(item);
}

function getListFileLocationLabel(directoryPath: string | null, item: ListFileItem): string {
  const itemPath = item.path || item.name;
  if (itemPath.startsWith("/")) return itemPath;
  const baseDirectory = directoryPath && directoryPath !== "." ? directoryPath : DEFAULT_LIST_FILES_DIRECTORY;
  if (baseDirectory.startsWith("/") || baseDirectory.startsWith("~")) {
    return `${baseDirectory.replace(/\/+$/, "")}/${itemPath.replace(/^\/+/, "")}`;
  }
  return `${DEFAULT_LIST_FILES_DIRECTORY}/${itemPath.replace(/^\/+/, "")}`;
}

function normalizeListFileSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function sortListFiles(items: ListFileItem[], sortMode: ListFileSort): ListFileItem[] {
  const sorted = items.slice();
  sorted.sort((left, right) => {
    if (sortMode === "type") {
      if (left.type !== right.type) return left.type === "folder" ? -1 : 1;
      return left.name.localeCompare(right.name);
    }
    if (sortMode === "size") {
      const leftSize = left.sizeBytes ?? Number.MAX_SAFE_INTEGER;
      const rightSize = right.sizeBytes ?? Number.MAX_SAFE_INTEGER;
      return leftSize - rightSize || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });
  return sorted;
}

function filterListFiles(items: ListFileItem[], filterMode: ListFileFilter): ListFileItem[] {
  if (filterMode === "files") return items.filter((item) => item.type === "file" && !item.isHidden);
  if (filterMode === "folders") return items.filter((item) => item.type === "folder" && !item.isHidden);
  if (filterMode === "hidden") return items.filter((item) => item.isHidden);
  return items.filter((item) => !item.isHidden);
}

function ListFilesLogBox({
  log,
  timeLabel,
  backendUrl,
  environmentId,
  requestHeaders,
  onWorkspacePathClick,
}: {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  onWorkspacePathClick?: (path: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<ListFileFilter>("visible");
  const [sortMode, setSortMode] = useState<ListFileSort>("name");
  const [openPopover, setOpenPopover] = useState<ListFilePopover>(null);
  const [visibleCount, setVisibleCount] = useState(LIST_FILES_PAGE_SIZE);
  const [fileMetadataByPath, setFileMetadataByPath] = useState<Record<string, ListFileMetadata>>({});
  const requestedMetadataFoldersRef = useRef<Set<string>>(new Set());
  const command = log.metadata?.command || "";
  const output = resolveCommandOutputText(log.metadata?.output, "stdout");
  const directoryPath = extractDirectoryPath(command);
  const allItems = useMemo(() => parseListOutput(output), [output]);
  const normalizedSearchQuery = normalizeListFileSearchText(searchQuery);
  const filteredItems = useMemo(() => {
    const matchingFilter = filterListFiles(allItems, filterMode);
    const matchingSearch = normalizedSearchQuery
      ? matchingFilter.filter((item) => {
          const location = getListFileLocationLabel(directoryPath, item);
          const haystack = [
            item.name,
            location,
            getListFileTypeLabel(item),
            item.size || "",
            item.isHidden ? "hidden" : "",
          ].join(" ").toLowerCase();
          return haystack.includes(normalizedSearchQuery);
        })
      : matchingFilter;
    return sortListFiles(matchingSearch, sortMode);
  }, [allItems, directoryPath, filterMode, normalizedSearchQuery, sortMode]);
  const displayItems = filteredItems.slice(0, visibleCount);
  const hasMoreItems = filteredItems.length > displayItems.length;
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;

  useEffect(() => {
    setVisibleCount(LIST_FILES_PAGE_SIZE);
  }, [filterMode, normalizedSearchQuery, sortMode]);

  useEffect(() => {
    const normalizedEnvironmentId = String(environmentId || "").trim();
    if (!backendUrl || !normalizedEnvironmentId || displayItems.length === 0) {
      return;
    }
    const folderPaths = new Set<string>();
    for (const item of displayItems) {
      if (item.sizeBytes != null || item.size) continue;
      const location = getListFileLocationLabel(directoryPath, item);
      const relativePath = normalizeListFileWorkspaceRelativePath(location);
      if (!relativePath || item.type === "folder") continue;
      folderPaths.add(getListFileParentDirectory(relativePath));
    }
    const pendingFolders = Array.from(folderPaths).filter((folderPath) => {
      const requestKey = `${normalizedEnvironmentId}:${folderPath}`;
      if (requestedMetadataFoldersRef.current.has(requestKey)) return false;
      requestedMetadataFoldersRef.current.add(requestKey);
      return true;
    });
    if (pendingFolders.length === 0) {
      return;
    }

    let cancelled = false;
    void Promise.all(pendingFolders.map(async (folderPath) => {
      const url = buildListFileMetadataUrl(backendUrl, normalizedEnvironmentId, folderPath);
      if (!url) return [];
      try {
        const response = await fetch(url, { headers: requestHeaders });
        if (!response.ok) return [];
        const payload = await response.json();
        return Array.isArray(payload?.files) ? payload.files : [];
      } catch {
        return [];
      }
    })).then((results) => {
      if (cancelled) return;
      const nextMetadata: Record<string, ListFileMetadata> = {};
      for (const files of results) {
        for (const file of files) {
          const rawPath = String(file?.path || "").trim();
          if (!rawPath) continue;
          const size = Number(file?.size);
          nextMetadata[getListFileMetadataLookupKey(rawPath)] = {
            sizeBytes: Number.isFinite(size) ? size : undefined,
            type: file?.type === "directory" || file?.type === "folder" ? "directory" : "file",
          };
        }
      }
      if (Object.keys(nextMetadata).length > 0) {
        setFileMetadataByPath((current) => ({ ...current, ...nextMetadata }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [backendUrl, directoryPath, displayItems, environmentId, requestHeaders]);

  const sortOptions: Array<{ id: ListFileSort; label: string }> = [
    { id: "name", label: "Name" },
    { id: "type", label: "Type" },
    { id: "size", label: "Size" },
  ];
  const filterOptions: Array<{ id: ListFileFilter; label: string }> = [
    { id: "visible", label: "Visible items" },
    { id: "files", label: "Files" },
    { id: "folders", label: "Folders" },
    { id: "hidden", label: "Hidden items" },
  ];
  const selectedSortLabel = sortOptions.find((option) => option.id === sortMode)?.label || "Name";
  const selectedFilterLabel = filterOptions.find((option) => option.id === filterMode)?.label || "Visible items";

  function handleListFileOpen(item: ListFileItem) {
    if (typeof onWorkspacePathClick !== "function") return;
    const location = getListFileLocationLabel(directoryPath, item);
    if (!location) return;
    onWorkspacePathClick(location);
  }

  return (
    <div className="tb-log-card tb-log-card-agent-list tb-log-card-file-list">
      <LogHeader
        icon={<FolderOpen className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="List Files"
        title={directoryPath}
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{output || "Failed to list files."}</div>
        ) : allItems.length > 0 ? (
          <>
            <div className="tb-log-agent-list-toolbar">
              <div className="tb-log-agent-list-summary">{getListFileCountLabel(filteredItems.length)}</div>
              <div className="tb-log-agent-list-controls">
                <div className="tb-log-agent-list-search-shell">
                  <Search className="tb-log-agent-list-search-icon" strokeWidth={1.8} />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="tb-log-agent-list-search"
                    placeholder="Search files"
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
                      className={`tb-log-agent-list-control-button ${openPopover === "filter" || filterMode !== "visible" ? "is-active" : ""}`.trim()}
                      onClick={() => setOpenPopover((current) => current === "filter" ? null : "filter")}
                    >
                      <SlidersHorizontal className="tb-log-agent-list-control-icon" strokeWidth={1.8} />
                      <span>Filter</span>
                    </button>
                    {openPopover === "filter" ? (
                      <div className="tb-log-agent-list-popup-menu">
                        <div className="tb-log-agent-list-popup-title">Type</div>
                        {filterOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className={`tb-log-agent-list-popup-row ${filterMode === option.id ? "selected" : ""}`.trim()}
                            onClick={() => {
                              setFilterMode(option.id);
                              setOpenPopover(null);
                            }}
                          >
                            <span className="tb-log-agent-list-popup-check-slot">
                              {filterMode === option.id ? <Check className="tb-log-agent-list-popup-check" strokeWidth={1.8} /> : null}
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
                {filterMode !== "visible" ? <span>{selectedFilterLabel}</span> : null}
              </div>
            </div>
            <div className="tb-log-agent-list-table-shell">
              {displayItems.length > 0 ? (
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
                      <th>Location</th>
                      <th>Type</th>
                      <th className="is-right">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item) => {
                      const location = getListFileLocationLabel(directoryPath, item);
                      const fileMetadata = fileMetadataByPath[getListFileMetadataLookupKey(location)];
                      const sizeLabel = item.size || (fileMetadata?.sizeBytes != null && fileMetadata.type !== "directory"
                        ? formatBytes(fileMetadata.sizeBytes)
                        : "-");
                      return (
                        <tr
                          key={`${item.type}-${item.path || item.name}`}
                          role={onWorkspacePathClick ? "button" : undefined}
                          tabIndex={onWorkspacePathClick ? 0 : undefined}
                          onClick={() => handleListFileOpen(item)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleListFileOpen(item);
                            }
                          }}
                        >
                          <td>
                            <div className="tb-log-agent-list-name-cell">
                              <span className="tb-log-agent-list-avatar" aria-hidden="true">
                                <FileKindIcon item={item} />
                              </span>
                              <div className="tb-log-agent-list-name-copy">
                                <div className="tb-log-agent-list-name-title" title={item.name}>{item.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="tb-log-agent-list-model-cell">
                              <div className="tb-log-agent-list-model-copy">
                                <div className="tb-log-agent-list-model-provider" title="Path">Path</div>
                                <div className="tb-log-agent-list-model-name" title={location}>{location}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="tb-log-agent-list-context">{getResolvedListFileTypeLabel(item, fileMetadata)}</div>
                          </td>
                          <td>
                            <div className="tb-log-agent-list-cost">{sizeLabel}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="tb-log-agent-list-empty">
                  {normalizedSearchQuery || filterMode !== "visible" ? "No matching files found." : "No visible files available."}
                </div>
              )}
            </div>
            {hasMoreItems || visibleCount > LIST_FILES_PAGE_SIZE ? (
              <div className="tb-log-agent-list-more-row tb-log-file-list-more-row">
                <div className="tb-log-file-list-more-summary">
                  {`Showing ${displayItems.length.toLocaleString()} of ${filteredItems.length.toLocaleString()} ${filteredItems.length === 1 ? "Item" : "Items"}`}
                </div>
                <div className="tb-log-file-list-more-actions">
                  {visibleCount > LIST_FILES_PAGE_SIZE ? (
                    <button
                      type="button"
                      className="tb-log-agent-list-load-more"
                      onClick={() => setVisibleCount(LIST_FILES_PAGE_SIZE)}
                    >
                      Collapse
                    </button>
                  ) : null}
                  {hasMoreItems ? (
                    <button
                      type="button"
                      className="tb-log-agent-list-load-more"
                      onClick={() => setVisibleCount((current) => current + LIST_FILES_PAGE_SIZE)}
                    >
                      Load more
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="tb-log-card-empty">Folder is empty.</div>
        )}
      </LogPanel>
    </div>
  );
}

type GrepSearchMatch = {
  title: string;
  subtitle?: string;
  source?: string;
  lineNumber?: string;
};

function isGrepSearchCommand(command?: string): boolean {
  if (!command) return false;
  if (/\brg\s+--files\b/i.test(command)) {
    return false;
  }
  return /\b(?:grep|rg|ag|git\s+grep)\b/i.test(command);
}

function isGrepSearchLog(log?: RunnerLog): boolean {
  return Boolean(log && log.eventType === "command_execution" && isGrepSearchCommand(String(log.metadata?.command || "")));
}

function extractFirstQuotedShellValue(value: string): string | null {
  for (let index = 0; index < value.length; index += 1) {
    const quote = value[index];
    if (quote !== `"` && quote !== `'`) {
      continue;
    }

    let result = "";
    for (let nextIndex = index + 1; nextIndex < value.length; nextIndex += 1) {
      const current = value[nextIndex];
      if (current === "\\" && nextIndex + 1 < value.length) {
        result += value[nextIndex + 1];
        nextIndex += 1;
        continue;
      }
      if (current === quote) {
        return result.trim();
      }
      result += current;
    }
  }
  return null;
}

function extractGrepSearchPattern(command?: string): string | null {
  if (!command) return null;
  const segmentMatch = /\b(?:grep|rg|ag|git\s+grep)\b([\s\S]*)/i.exec(command);
  const segment = segmentMatch?.[1] || command;
  const quoted = extractFirstQuotedShellValue(segment);
  if (quoted) {
    return quoted;
  }

  const tokens = segment.trim().split(/\s+/);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token) continue;
    if (token === "-e" || token === "--regexp") {
      return tokens[index + 1]?.trim() || null;
    }
    if (token.startsWith("-")) {
      continue;
    }
    return token.replace(/[|&;]+$/, "").trim() || null;
  }
  return null;
}

function formatGrepSearchPattern(pattern?: string | null): string {
  const normalized = String(pattern || "")
    .replace(/\\\\/g, "\\")
    .replace(/\\\./g, ".")
    .replace(/\\-/g, "-")
    .replace(/\\_/g, "_")
    .trim();
  return normalized || "matches";
}

function parseGrepSearchMatches(output: string): GrepSearchMatch[] {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const matches: GrepSearchMatch[] = [];

  for (const line of lines) {
    const directoryEntry = line.match(/^[d-][rwx-]{9}\s+\d+\s+\S+\s+\S+\s+(\d+)\s+([A-Za-z]{3}\s+\d+\s+[\d:]+)\s+(.+)$/);
    if (directoryEntry) {
      const [, size, modifiedAt, name] = directoryEntry;
      matches.push({
        title: normalizeListFileName(name),
        subtitle: [formatBytes(Number(size)), modifiedAt].filter(Boolean).join(" · "),
      });
      continue;
    }

    const lineMatch = line.match(/^(.+?):(\d+)(?::\d+)?:\s*(.*)$/);
    if (lineMatch) {
      const [, source, lineNumber, content] = lineMatch;
      matches.push({
        title: content || source,
        subtitle: `${source} · line ${lineNumber}`,
        source,
        lineNumber,
      });
      continue;
    }

    const sourceMatch = line.match(/^(.+?):\s*(.+)$/);
    if (sourceMatch && (sourceMatch[1].includes("/") || /\.[A-Za-z0-9]{1,12}$/.test(sourceMatch[1]))) {
      const [, source, content] = sourceMatch;
      matches.push({
        title: content,
        subtitle: source,
        source,
      });
      continue;
    }

    matches.push({ title: normalizeListFileName(line) });
  }

  return matches;
}

function GrepSearchLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const command = String(log.metadata?.command || "");
  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const stdout = resolveCommandOutputText(log.metadata?.output, "stdout");
  const stderr = stripRunnerSystemTags(parsedOutput?.stderr || "");
  const pattern = formatGrepSearchPattern(extractGrepSearchPattern(command));
  const matches = useMemo(() => parseGrepSearchMatches(stdout), [stdout]);
  const visibleMatches = showAll ? matches : matches.slice(0, 12);
  const exitCode = typeof log.metadata?.exitCode === "number" ? log.metadata.exitCode : null;
  const hasError = Boolean(stderr.trim()) && exitCode !== 1;

  return (
    <div className="tb-log-card tb-log-card-grep-search">
      <LogHeader
        icon={<Search className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Search Files"
        title={pattern}
        timeLabel={timeLabel}
        meta={matches.length > 0 ? <span className="tb-log-card-pill">{matches.length} {matches.length === 1 ? "match" : "matches"}</span> : null}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {hasError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{stderr || "Search failed."}</div>
        ) : matches.length > 0 ? (
          <>
            <div className="tb-log-list tb-log-search-match-list">
              {visibleMatches.map((match, index) => (
                <div key={`${match.source || match.title}-${match.lineNumber || index}`} className="tb-log-list-item tb-log-list-item-column tb-log-search-match">
                  <div className="tb-log-list-copy">
                    <div className="tb-log-list-title">{match.title}</div>
                    {match.subtitle ? <div className="tb-log-list-subtitle">{match.subtitle}</div> : null}
                  </div>
                </div>
              ))}
            </div>
            {matches.length > 12 ? (
              <div className="tb-log-card-actions">
                <button type="button" className="tb-log-card-link-button" onClick={() => setShowAll((value) => !value)}>
                  {showAll ? "Show fewer" : `Show ${matches.length - 12} more`}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="tb-log-card-empty">No matches found.</div>
        )}
      </LogPanel>
    </div>
  );
}

type WebSearchResult = { url: string; title: string; domain?: string; snippet?: string; thumbnail?: string };
type WebSearchImage = { url: string; thumbnail?: string; title?: string; source?: string };

function isWebSearchCommand(command?: string): boolean {
  if (!command) return false;
  return (
    command.includes("/workspace/.scripts/web-search.py") ||
    command.includes("web-search.py") ||
    command.includes(".claude/skills/web-search/") ||
    /^searching web:\s+/i.test(command.trim())
  );
}

function isWebSearchOutput(output?: string): boolean {
  if (!output) return false;
  const structuredCommandOutput = parseStructuredCommandExecutionOutput(output);
  const candidate = structuredCommandOutput
    ? [structuredCommandOutput.stdout, structuredCommandOutput.stderr].filter(Boolean).join("\n")
    : output;
  return (
    candidate.includes("Web search results for query:") ||
    candidate.includes("Links: [{") ||
    (/(?:^|\n)##?\s*Search Results/i.test(candidate) && /(?:^|\n)##?\s*Sources/i.test(candidate)) ||
    (candidate.includes("SUMMARY:") && candidate.includes("SOURCES:")) ||
    (/^\s*\{[\s\S]*"query"\s*:\s*".+?"[\s\S]*"results"\s*:/i.test(candidate))
  );
}

function extractSearchQuery(command?: string): string | null {
  if (!command) return null;
  const searchingWeb = command.match(/^searching web:\s+(.+)$/i);
  if (searchingWeb?.[1]) return searchingWeb[1].trim();
  const quoted = command.match(/web-search\.py\s+["']([^"']+)["']/);
  if (quoted?.[1]) return quoted[1];
  const unquoted = command.match(/web-search\.py\s+(\S+)/);
  return unquoted?.[1] || null;
}

function cleanSummaryText(text: string): string {
  return text
    .replace(/^[\s-]+/, "")
    .replace(/^-+\s*/gm, "")
    .replace(/REMINDER:.*?markdown hyperlinks\.?/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .replace(/^[\s\S]*?\}]\s*/m, "")
    .replace(/^,?"url":"[^"]*"\},?/gm, "")
    .replace(/^\{"title":"[^"]*","url":"[^"]*"\},?/gm, "")
    .trim();
}

function isLikelyImageUrl(value?: string | null): boolean {
  if (!value) return false;
  const normalized = value.split(/[?#]/, 1)[0]?.toLowerCase() || "";
  return [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".avif"].some((extension) => normalized.endsWith(extension));
}

function buildWebSearchImageEntry(title?: string, thumbnail?: string, source?: string): WebSearchImage | null {
  const normalizedThumbnail = thumbnail?.trim() || "";
  const normalizedSource = source?.trim() || undefined;
  const previewUrl = normalizedThumbnail || (isLikelyImageUrl(normalizedSource) ? normalizedSource : "");
  if (!previewUrl) {
    return null;
  }
  return {
    url: previewUrl,
    thumbnail: normalizedThumbnail || undefined,
    title: title?.trim() || undefined,
    source: normalizedSource,
  };
}

function buildWebSearchSourceEntry(title?: string, url?: string, domain?: string, snippet?: string, thumbnail?: string): WebSearchResult | null {
  const normalizedUrl = url?.trim() || "";
  if (!normalizedUrl) {
    return null;
  }
  let normalizedDomain = domain?.trim() || undefined;
  if (!normalizedDomain) {
    try {
      normalizedDomain = new URL(normalizedUrl).hostname.replace(/^www\./, "");
    } catch {
      normalizedDomain = undefined;
    }
  }
  return {
    url: normalizedUrl,
    title: title?.trim() || normalizedUrl,
    domain: normalizedDomain,
    snippet: snippet?.trim() || undefined,
    thumbnail: thumbnail?.trim() || undefined,
  };
}

function dedupeWebSearchSources(sources: WebSearchResult[]): WebSearchResult[] {
  const seen = new Set<string>();
  const deduped: WebSearchResult[] = [];
  for (const source of sources) {
    const key = source.url.trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(source);
  }
  return deduped;
}

function dedupeWebSearchImages(images: WebSearchImage[]): WebSearchImage[] {
  const seen = new Set<string>();
  const deduped: WebSearchImage[] = [];
  for (const image of images) {
    const key = image.url.trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(image);
  }
  return deduped;
}

function extractFallbackWebSearchSources(text: string): WebSearchResult[] {
  const sources: WebSearchResult[] = [];

  const markdownLinkPattern = /(?<!!)\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let markdownMatch: RegExpExecArray | null = null;
  while ((markdownMatch = markdownLinkPattern.exec(text)) !== null) {
    const source = buildWebSearchSourceEntry(markdownMatch[1], markdownMatch[2]);
    if (source) {
      sources.push(source);
    }
  }

  const bareUrlPattern = /(https?:\/\/[^\s"'<>]+)(?![^[]*\])/g;
  let bareUrlMatch: RegExpExecArray | null = null;
  while ((bareUrlMatch = bareUrlPattern.exec(text)) !== null) {
    const url = bareUrlMatch[1];
    if (isLikelyImageUrl(url)) {
      continue;
    }
    const source = buildWebSearchSourceEntry(undefined, url);
    if (source) {
      sources.push(source);
    }
  }

  return dedupeWebSearchSources(sources);
}

function parseWebSearchStructuredPayload(value: unknown): { summary: string | null; sources: WebSearchResult[]; images: WebSearchImage[] } {
  if (!value || typeof value !== "object") {
    return { summary: null, sources: [], images: [] };
  }

  const record = value as Record<string, unknown>;
  const summary =
    typeof record.summary === "string"
      ? cleanSummaryText(record.summary)
      : typeof record.text === "string"
        ? cleanSummaryText(record.text)
        : null;

  const resultItems = Array.isArray(record.search_results)
    ? record.search_results
    : Array.isArray(record.results)
      ? record.results
      : Array.isArray(record.organic_results)
        ? record.organic_results
        : Array.isArray(record.sources)
          ? record.sources
          : [];

  const sources = resultItems
    .map((item) => {
      if (typeof item === "string") {
        return /^https?:\/\//i.test(item.trim()) ? buildWebSearchSourceEntry(undefined, item) : null;
      }
      if (!item || typeof item !== "object") {
        return null;
      }
      const entry = item as Record<string, unknown>;
      return buildWebSearchSourceEntry(
        typeof entry.title === "string" ? entry.title : typeof entry.name === "string" ? entry.name : undefined,
        typeof entry.url === "string" ? entry.url : typeof entry.link === "string" ? entry.link : undefined,
        typeof entry.domain === "string" ? entry.domain : typeof entry.source === "string" ? entry.source : undefined,
        typeof entry.snippet === "string" ? entry.snippet : typeof entry.description === "string" ? entry.description : undefined,
        typeof entry.thumbnail === "string" ? entry.thumbnail : undefined,
      );
    })
    .filter((item): item is WebSearchResult => Boolean(item));

  const imageItems = Array.isArray(record.images)
    ? record.images
    : Array.isArray(record.image_results)
      ? record.image_results
      : [];

  const images = imageItems
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const entry = item as Record<string, unknown>;
      return buildWebSearchImageEntry(
        typeof entry.title === "string" ? entry.title : typeof entry.alt === "string" ? entry.alt : undefined,
        typeof entry.thumbnail === "string"
          ? entry.thumbnail
          : typeof entry.thumbnailUrl === "string"
            ? entry.thumbnailUrl
            : typeof entry.thumb === "string"
              ? entry.thumb
              : undefined,
        typeof entry.url === "string"
          ? entry.url
          : typeof entry.original === "string"
            ? entry.original
            : typeof entry.link === "string"
              ? entry.link
              : typeof entry.source === "string"
                ? entry.source
                : typeof entry.domain === "string"
                  ? entry.domain
                  : undefined,
      );
    })
    .filter((item): item is WebSearchImage => Boolean(item));

  return {
    summary:
      summary ||
      resultItems
        .find((item) => typeof item === "string" && !/^https?:\/\//i.test(item.trim()))
        ?.toString()
        ?.trim() ||
      null,
    sources: dedupeWebSearchSources(sources),
    images: dedupeWebSearchImages(images),
  };
}

function mergeParsedWebSearchData(...entries: Array<{ summary: string | null; sources: WebSearchResult[]; images: WebSearchImage[] }>): {
  summary: string | null;
  sources: WebSearchResult[];
  images: WebSearchImage[];
} {
  let summary: string | null = null;
  const mergedSources: WebSearchResult[] = [];
  const mergedImages: WebSearchImage[] = [];

  for (const entry of entries) {
    if (!summary && entry.summary) {
      summary = entry.summary;
    }
    mergedSources.push(...entry.sources);
    mergedImages.push(...entry.images);
  }

  return {
    summary,
    sources: dedupeWebSearchSources(mergedSources),
    images: dedupeWebSearchImages(mergedImages),
  };
}

function getWebSearchSourceDomain(source: WebSearchResult): string | undefined {
  if (source.domain?.trim()) {
    return source.domain.trim();
  }
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function getWebSearchFaviconUrl(domain?: string): string | null {
  if (!domain) return null;
  return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(`https://${domain}`)}&size=32`;
}

function parseWebSearchOutput(output?: string): { summary: string | null; sources: WebSearchResult[]; images: WebSearchImage[] } {
  if (!output) return { summary: null, sources: [], images: [] };
  const structuredCommandOutput = parseStructuredCommandExecutionOutput(output);
  const candidateOutput = stripRunnerSystemTags(
    structuredCommandOutput
      ? [structuredCommandOutput.stdout, structuredCommandOutput.stderr].filter(Boolean).join("\n")
      : output
  ).trim();
  if (!candidateOutput) {
    return { summary: null, sources: [], images: [] };
  }

  if (candidateOutput.startsWith("{") || candidateOutput.startsWith("[")) {
    try {
      const parsedJson = JSON.parse(candidateOutput);
      const parsedStructured = parseWebSearchStructuredPayload(parsedJson);
      if (parsedStructured.summary || parsedStructured.sources.length > 0 || parsedStructured.images.length > 0) {
        return parsedStructured;
      }
    } catch {
      // Fall through to legacy text parsing.
    }
  }

  let summary: string | null = null;
  let sources: WebSearchResult[] = [];
  let images: WebSearchImage[] = [];

  if (candidateOutput.includes("Web search results for query:")) {
    try {
      const linkPattern = /\{"title":"([^"]*?)","url":"([^"]*?)"\}/g;
      let match: RegExpExecArray | null = null;
      while ((match = linkPattern.exec(candidateOutput)) !== null) {
        const source = buildWebSearchSourceEntry(match[1] || match[2], match[2]);
        if (source) {
          sources.push(source);
        }
      }

      const imagesMatch = candidateOutput.match(/##?\s*Images\s*\n([\s\S]*?)$/i);
      if (imagesMatch) {
        const imagePattern = /(?:[-*]|\d+\.)\s*!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g;
        let imageMatch: RegExpExecArray | null = null;
        while ((imageMatch = imagePattern.exec(imagesMatch[1])) !== null) {
          const image = buildWebSearchImageEntry(imageMatch[1], imageMatch[2], imageMatch[3]);
          if (image) {
            images.push(image);
          }
        }
      }

      const linksStart = candidateOutput.indexOf("Links:");
      if (linksStart !== -1) {
        const afterLinks = candidateOutput.slice(linksStart);
        const arrayEnd = afterLinks.match(/\}]\s*([\s\S]*?)(?=##?\s*Images|$)/i);
        if (arrayEnd?.[1]) {
          const candidate = arrayEnd[1].trim();
          if (candidate.length > 10 && !candidate.startsWith("{") && !candidate.startsWith("[")) {
            summary = cleanSummaryText(candidate);
          }
        }
      }

      if (!summary) {
        const directArrayEndMatch = candidateOutput.match(/\}]\s*([A-Z][^{}\[\]]{10,}?)(?=##?\s*Images|$)/i);
        if (directArrayEndMatch?.[1]) {
          summary = cleanSummaryText(directArrayEndMatch[1].trim());
        }
      }

      if (!summary) {
        const beforeLinksMatch = candidateOutput.match(/Web search results for query:[^\n]*\n\n([\s\S]*?)(?=Links:|$)/);
        if (beforeLinksMatch?.[1]?.trim()) {
          summary = cleanSummaryText(beforeLinksMatch[1]);
        }
      }

      if (summary || sources.length > 0 || images.length > 0) {
        return { summary, sources, images };
      }
    } catch (error) {
      console.warn("Failed to parse native web search output", error);
    }
  }

  const markdownResults = candidateOutput.match(/##?\s*Search Results[^\n]*\n([\s\S]*?)(?=##?\s*Sources|##?\s*Images|$)/i);
  const markdownSources = candidateOutput.match(/##?\s*Sources\s*\n([\s\S]*?)(?=##?\s*Images|$)/i);
  const markdownImages = candidateOutput.match(/##?\s*Images\s*\n([\s\S]*?)$/i);
  if (markdownResults) {
    summary = cleanSummaryText(markdownResults[1]);
    if (markdownSources) {
      const pattern = /(?:[-*]|\d+\.)\s*\[([^\]]+)\]\(([^)]+)\)(?:\{([^}]+)\})?/g;
      let match: RegExpExecArray | null = null;
      while ((match = pattern.exec(markdownSources[1])) !== null) {
        const source = buildWebSearchSourceEntry(match[1], match[2], match[3]);
        if (source) {
          sources.push(source);
        }
      }
    }
    if (markdownImages) {
      const imagePattern = /(?:[-*]|\d+\.)\s*!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g;
      let match: RegExpExecArray | null = null;
      while ((match = imagePattern.exec(markdownImages[1])) !== null) {
        const image = buildWebSearchImageEntry(match[1], match[2], match[3]);
        if (image) {
          images.push(image);
        }
      }
    }
    if (summary || sources.length > 0 || images.length > 0) {
      return { summary, sources, images };
    }
  }

  const jsonPatterns = [
    /---\s*JSON OUTPUT\s*---\s*(\{[\s\S]*\})/i,
    /JSON OUTPUT:\s*```json?\s*([\s\S]*?)```/i,
    /JSON OUTPUT:\s*\n?\s*(\{[\s\S]*\})/i,
    /```json\s*([\s\S]*?)```/i,
    /(\{[\s\S]*"search_results"[\s\S]*\})/i,
    /(\{[\s\S]*"summary"[\s\S]*\})/i,
  ];

  for (const pattern of jsonPatterns) {
    const match = candidateOutput.match(pattern);
    if (!match?.[1]) {
      continue;
    }
    try {
      const jsonData = JSON.parse(match[1]) as {
        summary?: string;
        search_results?: Array<Record<string, unknown>>;
        results?: Array<Record<string, unknown>>;
        organic_results?: Array<Record<string, unknown>>;
        images?: Array<Record<string, unknown>>;
        image_results?: Array<Record<string, unknown>>;
      };

      if (jsonData.summary) {
        summary = cleanSummaryText(String(jsonData.summary));
      }

      const resultItems = jsonData.search_results || jsonData.results || jsonData.organic_results || [];
      if (Array.isArray(resultItems) && resultItems.length > 0) {
        sources = resultItems
          .map((result) =>
            buildWebSearchSourceEntry(
              typeof result.title === "string" ? result.title : typeof result.name === "string" ? result.name : typeof result.url === "string" ? result.url : typeof result.link === "string" ? result.link : undefined,
              typeof result.url === "string" ? result.url : typeof result.link === "string" ? result.link : undefined,
              undefined,
              typeof result.snippet === "string" ? result.snippet : typeof result.description === "string" ? result.description : undefined,
              typeof result.thumbnail === "string" ? result.thumbnail : undefined,
            ),
          )
          .filter((result): result is WebSearchResult => Boolean(result));
      }

      const imageItems = jsonData.images || jsonData.image_results || [];
      if (Array.isArray(imageItems) && imageItems.length > 0) {
        images = imageItems
          .map((image) =>
            buildWebSearchImageEntry(
              typeof image.title === "string" ? image.title : typeof image.alt === "string" ? image.alt : undefined,
              typeof image.thumbnail === "string"
                ? image.thumbnail
                : typeof image.thumbnailUrl === "string"
                  ? image.thumbnailUrl
                  : typeof image.thumb === "string"
                    ? image.thumb
                    : undefined,
              typeof image.url === "string"
                ? image.url
                : typeof image.original === "string"
                  ? image.original
                  : typeof image.link === "string"
                    ? image.link
                    : typeof image.source === "string"
                      ? image.source
                      : typeof image.domain === "string"
                        ? image.domain
                        : undefined,
            ),
          )
          .filter((image): image is WebSearchImage => Boolean(image));
      }

      if (summary || sources.length > 0 || images.length > 0) {
        break;
      }
    } catch {
      continue;
    }
  }

  if (!summary) {
    const summaryMatch = candidateOutput.match(/SUMMARY:\s*([\s\S]*?)(?=SOURCES:|JSON OUTPUT:|IMAGES:|$)/i);
    if (summaryMatch?.[1]) {
      summary = cleanSummaryText(summaryMatch[1]);
    }
  }

  if (sources.length === 0) {
    const sourcesMatch = candidateOutput.match(/SOURCES:\s*-*\s*([\s\S]*?)(?=JSON OUTPUT:|IMAGES:|$)/i);
    if (sourcesMatch?.[1]) {
      const lines = sourcesMatch[1].split("\n");
      let currentTitle: string | null = null;
      for (const rawLine of lines) {
        const line = rawLine.trimEnd();
        if (!line.trim() || /^-+$/.test(line.trim())) {
          continue;
        }
        const titleMatch = line.match(/^\[(\d+)\]\s+(.+)/);
        if (titleMatch) {
          currentTitle = titleMatch[2].trim();
          continue;
        }
        const indentedUrlMatch = line.match(/^\s+URL:\s*(https?:\/\/\S+)/);
        if (indentedUrlMatch && currentTitle) {
          const source = buildWebSearchSourceEntry(currentTitle, indentedUrlMatch[1]);
          if (source) {
            sources.push(source);
          }
          currentTitle = null;
          continue;
        }
        const singleLineUrlTitleMatch = line.match(/\[\d+\]\s+(https?:\/\/\S+)\s*-\s*(.+)/);
        if (singleLineUrlTitleMatch) {
          const source = buildWebSearchSourceEntry(singleLineUrlTitleMatch[2].trim(), singleLineUrlTitleMatch[1]);
          if (source) {
            sources.push(source);
          }
          continue;
        }
        const singleLineTitleUrlMatch = line.match(/\[\d+\]\s+(.+?)\s+\((https?:\/\/\S+)\)/);
        if (singleLineTitleUrlMatch) {
          const source = buildWebSearchSourceEntry(singleLineTitleUrlMatch[1].trim(), singleLineTitleUrlMatch[2]);
          if (source) {
            sources.push(source);
          }
          continue;
        }
        const bareUrlMatch = line.match(/^\s*(https?:\/\/\S+)\s*$/);
        if (bareUrlMatch) {
          const source = buildWebSearchSourceEntry(bareUrlMatch[1], bareUrlMatch[1]);
          if (source) {
            sources.push(source);
          }
        }
      }
    }
  }

  if (images.length === 0) {
    const imageUrlPattern = /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|avif|bmp)(?:\?[^\s"'<>]*)?)/gi;
    const imageMatches = candidateOutput.match(imageUrlPattern);
    if (imageMatches) {
      images = Array.from(new Set(imageMatches))
        .slice(0, 10)
        .map((url) => buildWebSearchImageEntry(undefined, url, url))
        .filter((image): image is WebSearchImage => Boolean(image));
    }
  }

  return { summary, sources, images };
}

function WebSearchSourceChip({ source }: { source: WebSearchResult }) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const domain = getWebSearchSourceDomain(source);
  const faviconUrl = faviconFailed ? null : getWebSearchFaviconUrl(domain);
  const label = source.title || domain || source.url;

  return (
    <a className="tb-log-web-search-source-link" href={source.url} target="_blank" rel="noopener noreferrer">
      {faviconUrl ? (
        <img
          src={faviconUrl}
          alt=""
          className="tb-log-web-search-source-favicon"
          onError={() => setFaviconFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <Globe className="tb-log-web-search-source-icon" strokeWidth={1.5} />
      )}
      <span className="tb-log-web-search-source-label" title={label}>
        {label}
      </span>
    </a>
  );
}

function WebSearchLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const query = extractSearchQuery(log.metadata?.command || "");
  const rawOutput = typeof log.metadata?.output === "string" ? log.metadata.output : "";
  const structuredCommandOutput = parseStructuredCommandExecutionOutput(rawOutput);
  const output = structuredCommandOutput
    ? [structuredCommandOutput.stdout, structuredCommandOutput.stderr].filter(Boolean).join("\n")
    : rawOutput;
  const resultValue = log.metadata?.result;
  const fullReport = typeof (log.metadata as Record<string, unknown> | undefined)?.fullReport === "string"
    ? String((log.metadata as Record<string, unknown>).fullReport)
    : "";
  const parsed = useMemo(() => {
    const parsedOutput = parseWebSearchOutput(output);
    const parsedResult =
      typeof resultValue === "string"
        ? parseWebSearchOutput(resultValue)
        : parseWebSearchStructuredPayload(resultValue);
    const parsedReport = fullReport ? parseWebSearchOutput(fullReport) : { summary: null, sources: [], images: [] };
    const parsedMessage = isWebSearchOutput(log.message) ? parseWebSearchOutput(log.message) : { summary: null, sources: [], images: [] };
    const fallbackText = [output, typeof resultValue === "string" ? resultValue : "", fullReport, log.message].filter(Boolean).join("\n");
    const fallbackSources = fallbackText ? extractFallbackWebSearchSources(fallbackText) : [];
    return mergeParsedWebSearchData(parsedOutput, parsedResult, parsedReport, parsedMessage, {
      summary: null,
      sources: fallbackSources,
      images: [],
    });
  }, [fullReport, log.message, output, resultValue]);
  const isRunning = log.metadata?.status === "running" || log.metadata?.status === "started";
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;
  const errorMessage = stripRunnerSystemTags(output || rawOutput).trim();

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<Search className="tb-log-card-small-icon" strokeWidth={1.5} />}
        className="tb-log-card-header-web-search"
        label="Web Search"
        title={query}
        timeLabel={timeLabel}
        meta={parsed.sources.length > 0 ? <span className="tb-log-card-pill">{parsed.sources.length} sources</span> : isRunning ? <span className="tb-log-card-status">searching...</span> : null}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{errorMessage || "Web search failed."}</div>
        ) : (
          <>
            {parsed.images.length > 0 ? (
              <div className="tb-log-image-grid tb-log-web-search-images">
                {parsed.images.slice(0, 4).map((image, index) => (
                  <RunnerImagePreviewSurface
                    key={`${image.url}-${index}`}
                    src={image.url || image.thumbnail || ""}
                    alt={image.title || `Search image ${index + 1}`}
                    className="tb-log-web-search-image-surface"
                    imageClassName="tb-log-image-thumb"
                    loadStrategy="visible"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            ) : null}
            {parsed.summary ? <RunnerMarkdown content={parsed.summary} className="tb-message-markdown" /> : null}
            {parsed.sources.length > 0 ? (
              <div className={parsed.summary ? "tb-log-web-search-source-list is-after-summary" : "tb-log-web-search-source-list"}>
                {parsed.sources.map((source) => (
                  <WebSearchSourceChip key={`${source.url}-${source.title}`} source={source} />
                ))}
              </div>
            ) : null}
            {!parsed.summary && parsed.sources.length === 0 && !isRunning ? <div className="tb-log-card-empty">No search results were parsed.</div> : null}
          </>
        )}
      </LogPanel>
    </div>
  );
}

function isMemoryCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes("search-threads.py") || command.includes(".claude/skills/memory/");
}

function extractMemoryQuery(command?: string): string | null {
  if (!command) return null;
  const quoted = command.match(/search-threads\.py\s+["']([^"']+)["']/);
  if (quoted?.[1]) return quoted[1];
  const unquoted = command.match(/search-threads\.py\s+(\S+)/);
  return unquoted?.[1] && !unquoted[1].startsWith("-") ? unquoted[1] : null;
}

function parseMemoryOutput(output?: string): { total: number; results: Array<{ threadId: string; title: string; createdAt: string; task?: string }>; processingTimeMs?: number } {
  if (!output) return { total: 0, results: [] };
  const total = Number(output.match(/Found (\d+) matching thread/)?.[1] || 0);
  const results: Array<{ threadId: string; title: string; createdAt: string; task?: string }> = [];
  const sections = output.split(/###\s*\d+\./).slice(1);
  for (const section of sections) {
    const title = section.match(/^\s*(.+?)(?=\n)/)?.[1]?.trim() || "Untitled";
    const threadId = section.match(/\*\*Thread ID:\*\*\s*(\S+)/)?.[1];
    if (!threadId) continue;
    results.push({
      threadId,
      title,
      createdAt: section.match(/\*\*Created:\*\*\s*(\d{4}-\d{2}-\d{2})/)?.[1] || "",
      task: section.match(/\*\*Task:\*\*\s*(.+?)(?=\n-|\n###|$)/)?.[1]?.trim(),
    });
  }
  const processingTimeMs = output.match(/Search completed in (\d+)ms/)?.[1];
  return { total, results, processingTimeMs: processingTimeMs ? Number(processingTimeMs) : undefined };
}

function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function MemoryLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const query = extractMemoryQuery(log.metadata?.command || "");
  const output = String(log.metadata?.output || log.metadata?.result || "");
  const parsed = useMemo(() => parseMemoryOutput(output), [output]);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<Brain className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Memory Search"
        title={query}
        timeLabel={timeLabel}
        meta={isLoading ? <span className="tb-log-card-status">searching...</span> : parsed.total > 0 ? <span className="tb-log-card-pill">{parsed.total} found</span> : null}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{output || "Memory search failed."}</div>
        ) : parsed.results.length > 0 ? (
          <div className="tb-log-list">
            {parsed.results.map((result) => (
              <div key={result.threadId} className="tb-log-list-item">
                <div className="tb-log-list-copy">
                  <div className="tb-log-list-title">{result.title}</div>
                  {result.task ? <div className="tb-log-list-subtitle">{result.task}</div> : null}
                </div>
                <div className="tb-log-list-meta">{formatRelativeDate(result.createdAt)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tb-log-card-empty">{isLoading ? "Searching through past conversations..." : "No matching threads found."}</div>
        )}
      </LogPanel>
    </div>
  );
}

function isEmailCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes("/workspace/.scripts/send-email.py") || command.includes("send-email.py");
}

function extractAttachments(command?: string): string[] {
  if (!command) return [];
  const attachmentsMatch = command.match(/(?:--attachments|-a)\s+(.+?)(?=\s+--|\s+-[a-z]|$)/i);
  if (!attachmentsMatch) return [];
  const files: string[] = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";
  for (let index = 0; index < attachmentsMatch[1].length; index += 1) {
    const currentChar = attachmentsMatch[1][index];
    if ((currentChar === `"` || currentChar === `'`) && !inQuote) {
      inQuote = true;
      quoteChar = currentChar;
    } else if (currentChar === quoteChar && inQuote) {
      inQuote = false;
      if (current.trim()) files.push(current.trim());
      current = "";
    } else if (currentChar === " " && !inQuote) {
      if (current.trim()) files.push(current.trim());
      current = "";
    } else {
      current += currentChar;
    }
  }
  if (current.trim()) files.push(current.trim());
  return files;
}

function parseEmailOutput(output?: string): { success: boolean; recipient: string | null; subject: string | null; errorMessage: string | null } {
  const base = { success: false, recipient: null, subject: null, errorMessage: null };
  if (!output) return base;
  const jsonPattern = output.match(/---\s*JSON OUTPUT\s*---\s*(\{[\s\S]*\})/i) || output.match(/(\{[\s\S]*"success"[\s\S]*\})/);
  if (jsonPattern?.[1]) {
    try {
      const data = JSON.parse(jsonPattern[1]);
      const recipient = typeof data.message === "string" ? data.message.match(/to\s+([^\s]+@[^\s]+)/i)?.[1] || null : null;
      return {
        success: data.success === true,
        recipient,
        subject: typeof data.subject === "string" ? data.subject : null,
        errorMessage: typeof data.error === "string" ? data.error : null,
      };
    } catch {}
  }
  return {
    success: output.includes("EMAIL SENT SUCCESSFULLY") || output.includes("Email sent successfully"),
    recipient: output.match(/(?:Sending email to|To):\s*([^\s\n]+@[^\s\n]+)/i)?.[1] || null,
    subject: output.match(/Subject:\s*(.+?)(?:\n|$)/i)?.[1]?.trim() || null,
    errorMessage: output.match(/Error:\s*(.+?)(?:\n|$)/i)?.[1]?.trim() || null,
  };
}

function EmailLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const command = log.metadata?.command || log.message || "";
  const output = String(log.metadata?.output || "");
  const parsed = parseEmailOutput(output);
  const subject = extractQuotedArgument(command, "--subject|-s") || parsed.subject;
  const body = extractQuotedArgument(command, "--body|-b");
  const attachments = extractAttachments(command);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const isError = (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) || Boolean(parsed.errorMessage);

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<Mail className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Send Email"
        title={subject ? `"${subject}"` : parsed.recipient}
        timeLabel={timeLabel}
        meta={attachments.length > 0 ? <span className="tb-log-card-pill">{attachments.length} attachments</span> : isLoading ? <span className="tb-log-card-status">sending...</span> : parsed.success ? <CheckCircle2 className="tb-log-status-icon tb-log-status-icon-success" strokeWidth={1.5} /> : null}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{parsed.errorMessage || output || "Email sending failed."}</div>
        ) : (
          <div className="tb-log-meta-grid">
            {parsed.recipient ? (
              <div className="tb-log-meta-row">
                <span className="tb-log-meta-label">To</span>
                <span className="tb-log-meta-value">{parsed.recipient}</span>
              </div>
            ) : null}
            {subject ? (
              <div className="tb-log-meta-row">
                <span className="tb-log-meta-label">Subject</span>
                <span className="tb-log-meta-value">{subject}</span>
              </div>
            ) : null}
            {body ? (
              <div className="tb-log-meta-row">
                <span className="tb-log-meta-label">Body</span>
                <span className="tb-log-meta-value tb-log-meta-value-wrap">{body}</span>
              </div>
            ) : null}
            {attachments.length > 0 ? (
              <div className="tb-log-meta-row">
                <span className="tb-log-meta-label">Attachments</span>
                <div className="tb-log-pill-list">
                  {attachments.map((attachment) => (
                    <span key={attachment} className="tb-log-pill">
                      <Paperclip className="tb-log-pill-icon" strokeWidth={1.5} />
                      <span className="tb-log-pill-label">{getFileName(attachment)}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {!subject && !body && !attachments.length && !parsed.recipient && !isLoading ? <div className="tb-log-card-empty">Email queued without additional details.</div> : null}
          </div>
        )}
      </LogPanel>
    </div>
  );
}

function isPdfReaderCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes("/workspace/.scripts/pdf-reader.py") || command.includes("pdf-reader.py");
}

function extractPdfPath(command?: string): string | null {
  if (!command) return null;
  const quoted = command.match(/pdf-reader\.py\s+["']([^"']+)["']/);
  if (quoted?.[1]) return quoted[1];
  const unquoted = command.match(/pdf-reader\.py\s+(\S+\.pdf)/i);
  return unquoted?.[1] || null;
}

function parsePdfReaderOutput(output?: string): Record<string, unknown> | null {
  if (!output) return null;
  const patterns = [/---\s*JSON OUTPUT\s*---\s*(\{[\s\S]*\})/i, /(\{[\s\S]*"success"[\s\S]*\})/, /(\{[\s\S]*"file_path"[\s\S]*\})/];
  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match?.[1]) {
      try {
        return JSON.parse(match[1]) as Record<string, unknown>;
      } catch {}
    }
  }
  return null;
}

function PdfReaderLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const command = log.metadata?.command || "";
  const output = String(log.metadata?.output || "");
  const parsed = parsePdfReaderOutput(output);
  const fileName = typeof parsed?.file_name === "string" ? parsed.file_name : extractPdfPath(command);
  const summary = typeof parsed?.summary === "string" ? parsed.summary : null;
  const pageCount = typeof parsed?.total_pages === "number" ? parsed.total_pages : null;
  const wordCount = typeof parsed?.word_count === "number" ? parsed.word_count : null;
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const isError = (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) || parsed?.success === false;

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<FileSearch className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="PDF Reader"
        title={fileName || undefined}
        timeLabel={timeLabel}
        meta={pageCount ? <span className="tb-log-card-pill">{pageCount} pages</span> : isLoading ? <span className="tb-log-card-status">reading...</span> : null}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{(typeof parsed?.error === "string" ? parsed.error : null) || output || "Failed to read PDF."}</div>
        ) : (
          <>
            <div className="tb-log-meta-grid">
              {pageCount ? (
                <div className="tb-log-meta-row">
                  <span className="tb-log-meta-label">Pages</span>
                  <span className="tb-log-meta-value">{pageCount}</span>
                </div>
              ) : null}
              {wordCount ? (
                <div className="tb-log-meta-row">
                  <span className="tb-log-meta-label">Words</span>
                  <span className="tb-log-meta-value">{wordCount}</span>
                </div>
              ) : null}
            </div>
            {summary ? <RunnerMarkdown content={summary} className="tb-message-markdown" /> : <div className="tb-log-card-empty">{isLoading ? "Reading PDF..." : "No summary available."}</div>}
          </>
        )}
      </LogPanel>
    </div>
  );
}

export function isDeepResearchCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes("/workspace/.scripts/deep-research.py") || command.includes("deep-research.py") || command.includes(".claude/skills/deep-research/");
}

function extractResearchTopic(command?: string): string | null {
  if (!command) return null;
  const quoted = command.match(/deep-research\.py\s+["']([^"']+)["']/);
  if (quoted?.[1]) return quoted[1];
  const unquoted = command.match(/deep-research\.py\s+(\S+)/);
  return unquoted?.[1] && !unquoted[1].startsWith("-") ? unquoted[1] : null;
}

function parseDeepResearchOutput(output?: string) {
  const result = {
    status: "starting" as "starting" | "thinking" | "researching" | "complete" | "error",
    topic: null as string | null,
    interactionId: null as string | null,
    thinkingSummaries: [] as string[],
    reportFile: null as string | null,
    reportManifestFile: null as string | null,
    sourcesCount: 0,
    sources: [] as string[],
    elapsedSeconds: 0,
    errorMessage: null as string | null,
    runtimePath: null as string | null,
  };
  if (!output) return result;
  const segments: string[] = [];
  const pushSegment = (value: unknown) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed) return;
    segments.push(trimmed);
  };

  pushSegment(output);
  try {
    const parsed = JSON.parse(output) as Record<string, unknown>;
    pushSegment(parsed?.stdout);
    pushSegment(parsed?.stderr);
    pushSegment(parsed?.output);
  } catch {}

  for (const line of segments.flatMap((segment) => segment.split("\n"))) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      const event = JSON.parse(trimmed) as Record<string, unknown>;
      if (event.event === "start") result.topic = typeof event.topic === "string" ? event.topic : result.topic;
      if (event.event === "interaction_started" && typeof event.interaction_id === "string") {
        result.interactionId = event.interaction_id;
        result.status = "thinking";
      }
      if (event.event === "thinking" && typeof event.summary === "string") {
        result.thinkingSummaries.push(event.summary);
        result.status = "thinking";
      }
      if (event.event === "content") result.status = "researching";
      if ((event.event === "research_complete" || event.event === "complete") && typeof event.report_file === "string") {
        result.reportFile = event.report_file;
        result.status = "complete";
      }
      if ((event.event === "research_complete" || event.event === "complete") && typeof event.report_manifest_file === "string") {
        result.reportManifestFile = event.report_manifest_file;
      }
      if ((event.event === "research_complete" || event.event === "complete") && typeof event.sources_count === "number") {
        result.sourcesCount = event.sources_count;
      }
      if ((event.event === "research_complete" || event.event === "complete") && Array.isArray(event.sources)) {
        result.sources = event.sources.filter((source): source is string => typeof source === "string");
      }
      if (typeof event.elapsed_seconds === "number") result.elapsedSeconds = event.elapsed_seconds;
      if (event.event === "resolved_runtime" && typeof event.path === "string") {
        result.runtimePath = event.path;
      }
      if (event.event === "error" && typeof event.message === "string") {
        result.status = "error";
        result.errorMessage = event.message;
      }
    } catch {}
  }
  return result;
}

export function hasDeepResearchOutput(output?: string): boolean {
  const parsed = parseDeepResearchOutput(output);
  return Boolean(
    parsed.topic ||
      parsed.interactionId ||
      parsed.reportFile ||
      parsed.reportManifestFile ||
      parsed.runtimePath ||
      parsed.errorMessage ||
      parsed.thinkingSummaries.length > 0 ||
      parsed.sourcesCount > 0
  );
}

function buildDeepResearchFromStreamingLogs(logs: RunnerLog[]) {
  const result = {
    status: "starting" as "starting" | "thinking" | "researching" | "complete" | "error",
    topic: null as string | null,
    interactionId: null as string | null,
    thinkingSummaries: [] as string[],
    reportFile: null as string | null,
    reportManifestFile: null as string | null,
    sourcesCount: 0,
    sources: [] as string[],
    elapsedSeconds: 0,
    errorMessage: null as string | null,
  };
  const seenSummaries = new Set<string>();

  for (const log of logs) {
    const deepResearch = log.metadata?.deepResearch;
    if (!deepResearch) continue;

    switch (deepResearch.event) {
      case "start":
        result.topic = deepResearch.topic || result.topic;
        result.status = "starting";
        break;
      case "interaction_started":
        result.interactionId = deepResearch.interactionId || result.interactionId;
        result.status = "thinking";
        break;
      case "thinking": {
        const summary = String(deepResearch.thinkingSummary || "").trim();
        if (summary) {
          const signature = summary.slice(0, 100);
          if (!seenSummaries.has(signature)) {
            seenSummaries.add(signature);
            result.thinkingSummaries.push(summary);
          }
        }
        result.status = "thinking";
        break;
      }
      case "status":
        if (typeof deepResearch.elapsedSeconds === "number" && deepResearch.elapsedSeconds > 0) {
          result.elapsedSeconds = deepResearch.elapsedSeconds;
        }
        break;
      case "research_complete":
      case "complete":
        result.status = "complete";
        result.reportFile = deepResearch.reportFile || result.reportFile;
        result.reportManifestFile = deepResearch.reportManifestFile || result.reportManifestFile;
        if (typeof deepResearch.sourcesCount === "number") {
          result.sourcesCount = deepResearch.sourcesCount;
        }
        if (Array.isArray(deepResearch.sources)) {
          result.sources = deepResearch.sources.filter((source): source is string => typeof source === "string");
        }
        if (typeof deepResearch.elapsedSeconds === "number" && deepResearch.elapsedSeconds > 0) {
          result.elapsedSeconds = deepResearch.elapsedSeconds;
        }
        break;
      case "error":
      case "timeout":
      case "connection_timeout":
      case "resume_timeout":
      case "resume_error":
        result.status = "error";
        result.errorMessage = deepResearch.errorMessage || deepResearch.thinkingSummary || "Unknown error occurred";
        if (typeof deepResearch.elapsedSeconds === "number" && deepResearch.elapsedSeconds > 0) {
          result.elapsedSeconds = deepResearch.elapsedSeconds;
        }
        break;
      case "resuming_stream":
        result.status = "thinking";
        if (typeof deepResearch.elapsedSeconds === "number" && deepResearch.elapsedSeconds > 0) {
          result.elapsedSeconds = deepResearch.elapsedSeconds;
        }
        break;
      case "resolved_runtime":
        if (result.status === "starting") {
          result.status = "starting";
        }
        break;
      case "stream_ended":
        if (typeof deepResearch.reportLength === "number" && deepResearch.reportLength > 0) {
          result.status = "complete";
        }
        if (typeof deepResearch.elapsedSeconds === "number" && deepResearch.elapsedSeconds > 0) {
          result.elapsedSeconds = deepResearch.elapsedSeconds;
        }
        break;
      default:
        break;
    }
  }

  return result;
}

function buildDeepResearchFromSession(session?: RunnerDeepResearchSession | null) {
  const metadata = session?.metadata && typeof session.metadata === "object" ? session.metadata : null;
  const rawSources = metadata && Array.isArray((metadata as { sources?: unknown }).sources)
    ? (metadata as { sources?: unknown[] }).sources
    : null;
  const reportManifestPath =
    metadata && typeof (metadata as { reportManifestPath?: unknown }).reportManifestPath === "string"
      ? String((metadata as { reportManifestPath?: unknown }).reportManifestPath || "").trim() || null
      : null;
  return {
    status:
      session?.status === "completed"
        ? ("complete" as const)
        : session?.status === "failed" || session?.status === "timeout" || session?.status === "cancelled"
          ? ("error" as const)
          : session?.thinkingSummaries?.length
            ? ("thinking" as const)
            : session
              ? ("researching" as const)
              : ("starting" as const),
    topic: session?.topic || null,
    interactionId: session?.interactionId || null,
    thinkingSummaries: Array.isArray(session?.thinkingSummaries)
      ? session!.thinkingSummaries
          .map((entry) => String(entry?.summary || "").trim())
          .filter(Boolean)
      : [],
    reportFile: session?.reportPath || null,
    reportManifestFile: reportManifestPath,
    sourcesCount: typeof session?.sourcesCount === "number" ? session.sourcesCount : 0,
    sources: Array.isArray(rawSources)
      ? rawSources.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [],
    elapsedSeconds: typeof session?.elapsedSeconds === "number" ? session.elapsedSeconds : 0,
    errorMessage: session?.errorMessage || null,
  };
}

function mergeDeepResearchState(
  base: ReturnType<typeof buildDeepResearchFromSession>,
  override: ReturnType<typeof buildDeepResearchFromStreamingLogs>
) {
  return {
    status: override.status || base.status,
    topic: override.topic || base.topic,
    interactionId: override.interactionId || base.interactionId,
    thinkingSummaries:
      override.thinkingSummaries.length > 0
        ? override.thinkingSummaries
        : base.thinkingSummaries,
    reportFile: override.reportFile || base.reportFile,
    reportManifestFile: override.reportManifestFile || base.reportManifestFile,
    sourcesCount: override.sourcesCount > 0 ? override.sourcesCount : base.sourcesCount,
    sources: override.sources.length > 0 ? override.sources : base.sources,
    elapsedSeconds: override.elapsedSeconds > 0 ? override.elapsedSeconds : base.elapsedSeconds,
    errorMessage: override.errorMessage || base.errorMessage,
  };
}

function isDeepResearchCommandStatusActive(status: unknown): boolean {
  const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : "";
  return normalizedStatus === "running" || normalizedStatus === "started" || normalizedStatus === "output";
}

type RunnerDeepResearchDerivedState = {
  streamingLogs: RunnerLog[];
  hasStreamingLogs: boolean;
  effectiveCommandLog?: RunnerLog;
  session?: RunnerDeepResearchSession | null;
  parsed: ReturnType<typeof buildDeepResearchFromStreamingLogs>;
  topic: string | null;
  isError: boolean;
  isComplete: boolean;
  isLoading: boolean;
  statusLabel: string;
};

export function getDeepResearchLogState({
  log,
  logs,
  runningCommandLog,
  session,
}: {
  log?: RunnerLog;
  logs?: RunnerLog[];
  runningCommandLog?: RunnerLog;
  session?: RunnerDeepResearchSession | null;
}): RunnerDeepResearchDerivedState {
  const streamingLogs = Array.isArray(logs) ? logs : [];
  const hasStreamingLogs = streamingLogs.length > 0;
  const effectiveCommandLog = runningCommandLog || log;
  const command = effectiveCommandLog?.metadata?.command || "";
  const commandStatus = effectiveCommandLog?.metadata?.status;
  const commandExitCode = effectiveCommandLog?.metadata?.exitCode;
  const commandOutput = typeof effectiveCommandLog?.metadata?.output === "string" ? effectiveCommandLog.metadata.output : "";

  const sessionParsed = buildDeepResearchFromSession(session);
  const streamingParsed = hasStreamingLogs ? buildDeepResearchFromStreamingLogs(streamingLogs) : parseDeepResearchOutput(commandOutput);
  const parsed = mergeDeepResearchState(sessionParsed, streamingParsed);

  const topicFromStreamingLogs =
    streamingLogs.find((entry) => entry.metadata?.deepResearch?.topic)?.metadata?.deepResearch?.topic || null;
  const topic = topicFromStreamingLogs || parsed.topic || extractResearchTopic(command);

  const hasStreamingError = hasStreamingLogs &&
    streamingLogs.some(
      (entry) =>
        entry.metadata?.deepResearch?.event === "error" ||
        entry.metadata?.deepResearch?.event === "timeout" ||
        entry.metadata?.deepResearch?.event === "connection_timeout"
    );
  const hasCommandError = typeof commandExitCode === "number" && commandExitCode !== 0;
  const isError = hasStreamingError || hasCommandError || parsed.status === "error";
  const isStreamingComplete = hasStreamingLogs &&
    (streamingLogs.some(
      (entry) =>
        entry.metadata?.deepResearch?.event === "research_complete" ||
        entry.metadata?.deepResearch?.event === "complete"
    ) ||
      streamingLogs.some((entry) => Boolean(entry.metadata?.deepResearch?.reportFile)) ||
      Boolean(parsed.reportFile));
  const isSessionComplete = session?.status === "completed";
  const isParsedComplete = parsed.status === "complete" || Boolean(parsed.reportFile);
  const isComplete = !isError && (isStreamingComplete || isSessionComplete || isParsedComplete);
  const isCommandRunning = isDeepResearchCommandStatusActive(commandStatus);
  const isSessionRunning = Boolean(
    session &&
      session.status !== "completed" &&
      session.status !== "failed" &&
      session.status !== "timeout" &&
      session.status !== "cancelled"
  );
  const isLoading = !isError && !isComplete && (hasStreamingLogs || isCommandRunning || isSessionRunning);
  const statusLabel = isError
    ? "error"
    : isComplete
      ? "complete"
      : parsed.status === "researching"
        ? "researching"
        : isLoading
          ? "starting"
          : parsed.status;

  return {
    streamingLogs,
    hasStreamingLogs,
    effectiveCommandLog,
    session,
    parsed,
    topic,
    isError,
    isComplete,
    isLoading,
    statusLabel,
  };
}

type RunnerDeepResearchDisplayLog = {
  key: string;
  label?: string | null;
  message: string;
  timeLabel?: string;
  tone?: "default" | "success" | "error";
};

type RunnerDeepResearchTransitionPhase = "entering" | "steady" | "exiting";

type RunnerDeepResearchTransitionedDisplayLog = RunnerDeepResearchDisplayLog & {
  transitionPhase: RunnerDeepResearchTransitionPhase;
};

function useDeepResearchAnimatedEntryKeys(entries: RunnerDeepResearchDisplayLog[]): Set<string> {
  const [animatedKeys, setAnimatedKeys] = useState<Set<string>>(new Set());
  const seenKeysRef = useRef<Set<string>>(new Set());
  const keySignature = useMemo(() => entries.map((entry) => entry.key).join("|"), [entries]);

  useEffect(() => {
    const previousKeys = seenKeysRef.current;
    const currentKeys = entries.map((entry) => entry.key);
    const addedKeys = currentKeys.filter((key) => !previousKeys.has(key));
    seenKeysRef.current = new Set(currentKeys);

    if (addedKeys.length === 0) {
      return;
    }

    setAnimatedKeys((current) => {
      const next = new Set(current);
      addedKeys.forEach((key) => next.add(key));
      return next;
    });

    const timeoutId = window.setTimeout(() => {
      setAnimatedKeys((current) => {
        const next = new Set(current);
        addedKeys.forEach((key) => next.delete(key));
        return next;
      });
    }, RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [entries, keySignature]);

  return animatedKeys;
}

function useDeepResearchPreviewDisplayLogs(
  entries: RunnerDeepResearchDisplayLog[]
): RunnerDeepResearchTransitionedDisplayLog[] {
  const [displayEntries, setDisplayEntries] = useState<RunnerDeepResearchTransitionedDisplayLog[]>(
    () => entries.map((entry) => ({ ...entry, transitionPhase: "steady" as const }))
  );
  const keySignature = useMemo(() => entries.map((entry) => entry.key).join("|"), [entries]);

  useEffect(() => {
    setDisplayEntries((current) => {
      const currentMap = new Map(current.map((entry) => [entry.key, entry]));
      const nextKeys = new Set(entries.map((entry) => entry.key));
      const exitingEntries = current
        .filter((entry) => !nextKeys.has(entry.key))
        .map((entry) => ({ ...entry, transitionPhase: "exiting" as const }));
      const nextEntries: RunnerDeepResearchTransitionedDisplayLog[] = entries.map((entry) => {
        const existing = currentMap.get(entry.key);
        return {
          ...entry,
          transitionPhase: existing ? (existing.transitionPhase === "entering" ? "entering" : "steady") : ("entering" as const),
        };
      });
      return [...exitingEntries, ...nextEntries];
    });
  }, [entries, keySignature]);

  useEffect(() => {
    const hasTransientEntries = displayEntries.some(
      (entry) => entry.transitionPhase === "entering" || entry.transitionPhase === "exiting"
    );
    if (!hasTransientEntries) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDisplayEntries((current) =>
        current
          .filter((entry) => entry.transitionPhase !== "exiting")
          .map((entry) =>
            entry.transitionPhase === "entering"
              ? { ...entry, transitionPhase: "steady" as const }
              : entry
          )
      );
    }, RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [displayEntries]);

  return displayEntries;
}

function isVisibleDeepResearchDisplayEvent(event: string | null | undefined): boolean {
  const normalized = String(event || "").trim();
  if (!normalized) {
    return false;
  }
  return ![
    "status",
    "research_complete",
    "complete",
    "error",
    "timeout",
    "connection_timeout",
    "resume_timeout",
    "resume_error",
    "resuming_stream",
    "stream_ended",
    "resolved_runtime",
  ].includes(normalized);
}

function formatDeepResearchDisplayLog(log: RunnerLog, index: number): RunnerDeepResearchDisplayLog | null {
  const deepResearch = log.metadata?.deepResearch;
  if (!deepResearch) {
    return null;
  }

  const timeLabel = typeof log.time === "string" && log.time.trim() ? log.time.trim() : undefined;
  const event = String(deepResearch.event || "").trim();
  if (!isVisibleDeepResearchDisplayEvent(event)) {
    return null;
  }
  const eventLabel = event.replace(/_/g, " ").trim();
  const key = `${event || "event"}-${index}-${timeLabel || ""}`;

  switch (event) {
    case "start":
      return {
        key,
        label: "Started",
        message: deepResearch.topic || "Starting deep research task.",
        timeLabel,
      };
    case "interaction_started":
      return {
        key,
        label: "Researching",
        message: "Connected the research session and started gathering material.",
        timeLabel,
      };
    case "thinking":
      return {
        key,
        label: null,
        message: deepResearch.thinkingSummary || "Analyzing the current research direction.",
        timeLabel,
      };
    case "status":
      return {
        key,
        label: "Status",
        message:
          typeof deepResearch.elapsedSeconds === "number" && deepResearch.elapsedSeconds > 0
            ? `Research in progress. ${deepResearch.elapsedSeconds}s elapsed.`
            : "Research in progress.",
        timeLabel,
      };
    case "content":
      return {
        key,
        label: "Finding",
        message: sanitizeSubagentDisplayText(log.message) || "Captured additional source material.",
        timeLabel,
      };
    case "research_complete":
    case "complete":
      return {
        key,
        label: "Complete",
        message:
          deepResearch.reportFile
            ? `Finished the report in ${deepResearch.reportFile}${typeof deepResearch.sourcesCount === "number" && deepResearch.sourcesCount > 0 ? ` using ${deepResearch.sourcesCount} sources.` : "."}`
            : typeof deepResearch.sourcesCount === "number" && deepResearch.sourcesCount > 0
              ? `Finished the research using ${deepResearch.sourcesCount} sources.`
              : "Finished the research run.",
        timeLabel,
        tone: "success",
      };
    case "error":
    case "timeout":
    case "connection_timeout":
    case "resume_timeout":
    case "resume_error":
      return {
        key,
        label: "Error",
        message: deepResearch.errorMessage || deepResearch.thinkingSummary || "Deep research failed.",
        timeLabel,
        tone: "error",
      };
    case "resuming_stream":
      return {
        key,
        label: "Resuming",
        message: "Resuming the deep research stream.",
        timeLabel,
      };
    case "resolved_runtime":
      return {
        key,
        label: "Runtime",
        message:
          typeof deepResearch.runtimePath === "string" && deepResearch.runtimePath.trim()
            ? `Using ${deepResearch.runtimePath}`
            : "Resolved the deep research runtime.",
        timeLabel,
      };
    case "stream_ended":
      return {
        key,
        label: "Stream ended",
        message:
          typeof deepResearch.reportLength === "number" && deepResearch.reportLength > 0
            ? `Research stream ended with ${deepResearch.reportLength} characters of report output.`
            : "Research stream ended.",
        timeLabel,
      };
    default:
      return {
        key,
        label: eventLabel ? eventLabel.charAt(0).toUpperCase() + eventLabel.slice(1) : "Update",
        message: sanitizeSubagentDisplayText(log.message) || "Deep research updated.",
        timeLabel,
      };
  }
}

function buildDeepResearchDisplayLogs({
  streamingLogs,
  parsed,
  topic,
  isError,
  isComplete,
  isLoading,
}: {
  streamingLogs: RunnerLog[];
  parsed: ReturnType<typeof getDeepResearchLogState>["parsed"];
  topic: string | null;
  isError: boolean;
  isComplete: boolean;
  isLoading: boolean;
}): RunnerDeepResearchDisplayLog[] {
  const formattedStreamingLogs = streamingLogs
    .map((log, index) => formatDeepResearchDisplayLog(log, index))
    .filter((entry): entry is RunnerDeepResearchDisplayLog => Boolean(entry));

  if (formattedStreamingLogs.length > 0) {
    return formattedStreamingLogs;
  }

  const synthesized: RunnerDeepResearchDisplayLog[] = [];

  parsed.thinkingSummaries.forEach((summary, index) => {
    synthesized.push({
      key: `synthetic-thinking-${index}`,
      label: null,
      message: summary,
    });
  });

  return synthesized;
}

function DeepResearchDisplayEventRow({
  entry,
  className,
  style,
}: {
  entry: RunnerDeepResearchDisplayLog;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`tb-deep-research-log-event ${entry.tone === "error" ? "is-error" : entry.tone === "success" ? "is-success" : ""} ${className || ""}`.trim()}
      style={style}
    >
      {entry.label || entry.timeLabel ? (
        <div className="tb-deep-research-log-event-header">
          {entry.label ? <span className="tb-deep-research-log-event-label">{entry.label}</span> : <span />}
          {entry.timeLabel ? <span className="tb-deep-research-log-event-time">{entry.timeLabel}</span> : null}
        </div>
      ) : null}
      <RunnerMarkdown
        content={entry.message}
        className="tb-message-markdown tb-message-markdown-summary tb-deep-research-log-event-markdown"
        softBreaks
        disallowHeadings
      />
    </div>
  );
}

function getDeepResearchReportFilename(path: string | null | undefined): string {
  const normalized = String(path || "").trim().replace(/\\/g, "/");
  if (!normalized) {
    return "";
  }
  const segments = normalized.split("/").filter(Boolean);
  return segments[segments.length - 1] || normalized;
}

function truncateDeepResearchReportFilename(value: string, maxLength = 44): string {
  const normalized = String(value || "").trim();
  if (!normalized || normalized.length <= maxLength) {
    return normalized;
  }
  const extensionMatch = normalized.match(/(\.[A-Za-z0-9_-]+)$/);
  const extension = extensionMatch ? extensionMatch[1] : "";
  const baseLength = Math.max(12, maxLength - extension.length - 1);
  return `${normalized.slice(0, baseLength)}…${extension}`;
}

export function hasActiveDeepResearchLogGroup(logs: RunnerLog[]): boolean {
  if (!Array.isArray(logs) || logs.length === 0) {
    return false;
  }
  const streamingLogs = logs.filter((entry) => entry.eventType === "deep_research");
  const commandLog = logs.find(
    (entry) =>
      entry.eventType === "command_execution" &&
      isDeepResearchCommand(entry.metadata?.command || entry.message || "")
  );
  if (!commandLog && streamingLogs.length === 0) {
    return false;
  }
  return getDeepResearchLogState({
    logs: streamingLogs,
    runningCommandLog: commandLog,
  }).isLoading;
}

function DeepResearchEventLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const data = log.metadata?.deepResearch;
  if (!isVisibleDeepResearchDisplayEvent(data?.event)) {
    return null;
  }
  const statusLabel =
    data?.event === "complete" || data?.event === "research_complete"
      ? "complete"
      : data?.event === "thinking"
        ? "thinking"
        : data?.event === "error"
          ? "error"
          : data?.event || "starting";
  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<Telescope className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Deep Research"
        title={data?.topic || undefined}
        timeLabel={timeLabel}
        meta={<span className="tb-log-card-pill">{statusLabel}</span>}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {data?.thinkingSummary ? <RunnerMarkdown content={data.thinkingSummary} className="tb-message-markdown" /> : null}
        {data?.reportFile ? (
          <div className="tb-log-meta-row">
            <span className="tb-log-meta-label">Report</span>
            <span className="tb-log-meta-value">{data.reportFile}</span>
          </div>
        ) : null}
        {typeof data?.sourcesCount === "number" ? (
          <div className="tb-log-meta-row">
            <span className="tb-log-meta-label">Sources</span>
            <span className="tb-log-meta-value">{data.sourcesCount}</span>
          </div>
        ) : null}
        {typeof data?.elapsedSeconds === "number" ? (
          <div className="tb-log-meta-row">
            <span className="tb-log-meta-label">Elapsed</span>
            <span className="tb-log-meta-value">{data.elapsedSeconds}s</span>
          </div>
        ) : null}
        {data?.errorMessage ? <div className="tb-log-card-state tb-log-card-state-error">{data.errorMessage}</div> : null}
      </LogPanel>
    </div>
  );
}

function DeepResearchCommandLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const parsed = parseDeepResearchOutput(String(log.metadata?.output || ""));
  const topic = extractResearchTopic(log.metadata?.command || "") || parsed.topic;
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;
  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<Telescope className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Deep Research"
        title={topic}
        timeLabel={timeLabel}
        meta={<span className="tb-log-card-pill">{parsed.status}</span>}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {isError || parsed.errorMessage ? (
          <div className="tb-log-card-state tb-log-card-state-error">{parsed.errorMessage || "Deep research failed."}</div>
        ) : (
          <>
            {parsed.thinkingSummaries.length > 0 ? (
              <div className="tb-log-list">
                {parsed.thinkingSummaries.map((summary, index) => (
                  <div key={`${summary.slice(0, 32)}-${index}`} className="tb-log-list-item tb-log-list-item-column">
                    <RunnerMarkdown content={summary} className="tb-message-markdown" />
                  </div>
                ))}
              </div>
            ) : null}
            {parsed.reportFile ? (
              <div className="tb-log-meta-row">
                <span className="tb-log-meta-label">Report</span>
                <span className="tb-log-meta-value">{parsed.reportFile}</span>
              </div>
            ) : null}
            {parsed.sourcesCount > 0 ? (
              <div className="tb-log-meta-row">
                <span className="tb-log-meta-label">Sources</span>
                <span className="tb-log-meta-value">{parsed.sourcesCount}</span>
              </div>
            ) : null}
            {parsed.elapsedSeconds > 0 ? (
              <div className="tb-log-meta-row">
                <span className="tb-log-meta-label">Elapsed</span>
                <span className="tb-log-meta-value">{parsed.elapsedSeconds}s</span>
              </div>
            ) : null}
            {!parsed.reportFile && parsed.thinkingSummaries.length === 0 && parsed.sourcesCount === 0 ? <div className="tb-log-card-empty">Research started.</div> : null}
          </>
        )}
      </LogPanel>
    </div>
  );
}

export function DeepResearchLogBox({
  log,
  logs,
  runningCommandLog,
  session,
  timeLabel,
  onOpenDetails,
  isDetailOpen = false,
  fallbackTopic,
}: {
  log?: RunnerLog;
  logs?: RunnerLog[];
  runningCommandLog?: RunnerLog;
  session?: RunnerDeepResearchSession | null;
  timeLabel?: string;
  onOpenDetails?: () => void;
  isDetailOpen?: boolean;
  fallbackTopic?: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    streamingLogs,
    hasStreamingLogs,
    effectiveCommandLog,
    parsed,
    topic,
    isError,
    isComplete,
    isLoading,
    statusLabel,
  } = useMemo(
      () => getDeepResearchLogState({ log, logs, runningCommandLog, session }),
    [log, logs, runningCommandLog, session]
  );
  const resolvedTopic = topic || parsed.topic || String(fallbackTopic || "").trim() || null;
  const taskCopy = truncateSubagentPreviewText(resolvedTopic || "Deep research task", 280);
  const previewLogs = useMemo(
    () =>
      buildDeepResearchDisplayLogs({
        streamingLogs,
        parsed,
        topic,
        isError,
        isComplete,
        isLoading,
      })
        .filter((entry) => !(taskCopy && entry.label === "Started" && entry.message.trim() === taskCopy.trim()))
        .slice(-2),
    [isComplete, isError, isLoading, parsed, streamingLogs, taskCopy, topic]
  );
  const transitionedPreviewLogs = useDeepResearchPreviewDisplayLogs(previewLogs);

  return (
    <div className={`tb-log-card tb-log-card-deep-research ${isDetailOpen ? "is-detail-open" : ""}`.trim()}>
      <LogHeader
        icon={<Telescope className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Deep Research"
        title={resolvedTopic || undefined}
        timeLabel={timeLabel}
        meta={<span className={`tb-log-card-pill ${isError ? "is-error" : ""}`.trim()}>{statusLabel}</span>}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-subagent-log-preview tb-deep-research-log-preview">
          <div className={`tb-subagent-log-preview-copy tb-deep-research-log-preview-copy ${isLoading ? "is-running" : ""}`.trim()}>
            {taskCopy ? (
              <>
                <div className="tb-subagent-log-preview-prompt tb-deep-research-log-task">
                  <RunnerMarkdown
                    content={taskCopy}
                    className="tb-message-markdown tb-message-markdown-summary tb-deep-research-log-task-markdown"
                    softBreaks
                    disallowHeadings
                  />
                </div>
                <div className="tb-subagent-log-preview-divider" aria-hidden="true" />
              </>
            ) : null}
            <div className="tb-deep-research-log-events tb-deep-research-log-events-preview">
              {transitionedPreviewLogs.map((entry) => (
                <DeepResearchDisplayEventRow
                  key={entry.key}
                  entry={entry}
                  className={`tb-deep-research-log-event-preview is-${entry.transitionPhase}`.trim()}
                  style={
                    entry.transitionPhase === "entering"
                      ? getRunnerChatEnterAnimationStyle()
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
          <div className="tb-subagent-log-preview-footer">
            <button type="button" className="tb-subagent-log-open-button" onClick={onOpenDetails}>
              <span>View all logs</span>
              <ChevronRight className="tb-subagent-log-open-button-icon" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </LogPanel>
    </div>
  );
}

export function DeepResearchDetailDrawer({
  log,
  logs,
  runningCommandLog,
  session,
  onClose,
  fallbackTopic,
  onReportFileClick,
}: {
  log?: RunnerLog;
  logs?: RunnerLog[];
  runningCommandLog?: RunnerLog;
  session?: RunnerDeepResearchSession | null;
  onClose: () => void;
  fallbackTopic?: string | null;
  onReportFileClick?: (path: string) => void;
}) {
  const {
    streamingLogs,
    parsed,
    topic,
    isError,
    isComplete,
    isLoading,
    statusLabel,
  } = useMemo(
      () => getDeepResearchLogState({ log, logs, runningCommandLog, session }),
    [log, logs, runningCommandLog, session]
  );

  const displayLogs = useMemo(
    () =>
      buildDeepResearchDisplayLogs({
        streamingLogs,
        parsed,
        topic,
        isError,
        isComplete,
        isLoading,
      }),
    [isComplete, isError, isLoading, parsed, streamingLogs, topic]
  );

  const taskCopy = String(topic || parsed.topic || String(fallbackTopic || "").trim() || "Deep research task").trim();
  const reportFilename = getDeepResearchReportFilename(parsed.reportFile);
  const reportFilenameLabel = truncateDeepResearchReportFilename(reportFilename);
  const canOpenReportFile = Boolean(parsed.reportFile && typeof onReportFileClick === "function");
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const animatedLogKeys = useDeepResearchAnimatedEntryKeys(displayLogs);

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
  }, [
    displayLogs,
    parsed.reportFile,
    parsed.sourcesCount,
    parsed.elapsedSeconds,
    isError,
    parsed.errorMessage,
  ]);

  return (
    <aside className="tb-subagent-detail-drawer tb-deep-research-detail-drawer">
      <div className="tb-subagent-detail-drawer-header">
        <div className="tb-subagent-detail-drawer-header-copy">
          <Telescope className="tb-attachment-preview-drawer-header-icon" strokeWidth={1.6} />
          <div className="tb-subagent-detail-drawer-header-text">
            <div className="tb-subagent-detail-drawer-title" title="Deep Research">Deep Research</div>
          </div>
        </div>
        <div className="tb-subagent-detail-drawer-header-actions">
          <button type="button" className="tb-attachment-preview-drawer-action" onClick={onClose} aria-label="Close deep research details">
            <X className="tb-attachment-preview-drawer-action-icon" strokeWidth={1.8} />
          </button>
        </div>
      </div>
      <div ref={bodyRef} className="tb-subagent-detail-drawer-body">
        <div className="tb-deep-research-log-shell">
          {taskCopy ? (
            <div className="tb-subagent-log-prompt tb-deep-research-log-task-surface">
              <RunnerMarkdown
                content={taskCopy}
                className="tb-message-markdown tb-message-markdown-user tb-subagent-log-prompt-markdown"
                softBreaks
                disallowHeadings
              />
            </div>
          ) : null}
          <div className="tb-subagent-log-meta">
            <span className="tb-turn-agent-name">Deep Research</span>
            <span className={`tb-log-card-pill ${isError ? "is-error" : ""}`.trim()}>{statusLabel}</span>
          </div>
          <div className="tb-deep-research-log-events tb-deep-research-log-events-drawer">
            {displayLogs.length > 0 ? (
              displayLogs.map((entry) => (
                <DeepResearchDisplayEventRow
                  key={entry.key}
                  entry={entry}
                  className={animatedLogKeys.has(entry.key) ? "is-entering" : undefined}
                  style={animatedLogKeys.has(entry.key) ? getRunnerChatEnterAnimationStyle() : undefined}
                />
              ))
            ) : (
              <div className="tb-log-card-empty">No research logs yet.</div>
            )}
          </div>
          {(parsed.reportFile || parsed.sourcesCount > 0 || parsed.elapsedSeconds > 0 || (isError && parsed.errorMessage)) ? (
            <div className={`tb-deep-research-log-summary ${isError ? "is-error" : ""}`.trim()}>
              {parsed.reportFile ? (
                <div className="tb-log-meta-row">
                  <span className="tb-log-meta-label">Report</span>
                  {canOpenReportFile ? (
                    <button
                      type="button"
                      className="tb-deep-research-log-report-link"
                      onClick={() => onReportFileClick?.(parsed.reportFile || "")}
                      title={reportFilename || parsed.reportFile || ""}
                    >
                      {reportFilenameLabel || parsed.reportFile}
                    </button>
                  ) : (
                    <span className="tb-log-meta-value" title={reportFilename || parsed.reportFile || ""}>
                      {reportFilenameLabel || parsed.reportFile}
                    </span>
                  )}
                </div>
              ) : null}
              {parsed.sourcesCount > 0 ? (
                <div className="tb-log-meta-row">
                  <span className="tb-log-meta-label">Sources</span>
                  <span className="tb-log-meta-value">{parsed.sourcesCount}</span>
                </div>
              ) : null}
              {parsed.elapsedSeconds > 0 ? (
                <div className="tb-log-meta-row">
                  <span className="tb-log-meta-label">Elapsed</span>
                  <span className="tb-log-meta-value">{parsed.elapsedSeconds}s</span>
                </div>
              ) : null}
              {isError && parsed.errorMessage ? (
                <div className="tb-log-card-state tb-log-card-state-error">{parsed.errorMessage}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function extractBase64Image(content: unknown): string | null {
  if (!content) return null;
  if (typeof content === "object") {
    const mcpOutput = content as {
      content?: Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
      structured_content?: { image_data?: string; file_paths?: string[] };
    };
    if (Array.isArray(mcpOutput.content)) {
      for (const item of mcpOutput.content) {
        if (item.type === "image" && item.data) {
          const mimeType = item.mimeType || "image/png";
          return `data:${mimeType};base64,${item.data}`;
        }
        if (item.type === "text" && item.text) {
          const extracted = extractBase64Image(item.text);
          if (extracted) return extracted;
        }
      }
    }
    if (mcpOutput.structured_content?.image_data) {
      return `data:image/png;base64,${mcpOutput.structured_content.image_data}`;
    }
    try {
      return extractBase64Image(JSON.stringify(content));
    } catch {
      return null;
    }
  }
  if (typeof content === "string") {
    const dataUri = content.match(/data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+/);
    if (dataUri?.[0]) return dataUri[0];
    const rawBase64 = content.match(/(iVBORw0KGgo[A-Za-z0-9+/=]+|\/9j\/[A-Za-z0-9+/=]+)/);
    if (rawBase64?.[1]) {
      const prefix = rawBase64[1].startsWith("iVBOR") ? "data:image/png;base64," : "data:image/jpeg;base64,";
      return `${prefix}${rawBase64[1]}`;
    }
  }
  return null;
}

function extractWorkspaceImagePathFromResult(result: unknown): string | null {
  const candidates: string[] = [];
  const visit = (value: unknown): void => {
    if (!value) return;
    if (typeof value === "string") {
      const matchedPath = value.match(/(?:\/workspace\/)?([A-Za-z0-9_./-]+\.(?:png|jpe?g|gif|webp|svg|avif|bmp))/i)?.[1];
      if (matchedPath) {
        candidates.push(matchedPath);
      }
      return;
    }
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry);
      return;
    }
    if (typeof value === "object") {
      const record = value as Record<string, unknown>;
      const structured = record.structuredContent && typeof record.structuredContent === "object"
        ? (record.structuredContent as Record<string, unknown>)
        : record.structured_content && typeof record.structured_content === "object"
          ? (record.structured_content as Record<string, unknown>)
          : null;
      if (structured) {
        visit(structured.workspace_file_paths);
        visit(structured.file_paths);
        visit(structured.original_file_paths);
      }
      for (const nestedValue of Object.values(record)) {
        visit(nestedValue);
      }
    }
  };

  visit(result);

  const normalized = candidates
    .map((value) => String(value || "").trim().replace(/^\/workspace\//, ""))
    .find((value) => isRunnerLogImageFilePath(value));
  return normalized || null;
}

function extractWorkspaceImagePathFromOutput(output: unknown): string | null {
  if (typeof output !== "string" || !output.trim()) {
    return null;
  }

  const candidates: string[] = [];
  const patterns = [
    /image saved to:\s*["']?([^\s"'\n]+\.(?:png|jpe?g|gif|webp|svg|avif|bmp))["']?/ig,
    /saved to:\s*["']?([^\s"'\n]+\.(?:png|jpe?g|gif|webp|svg|avif|bmp))["']?/ig,
    /((?:\/workspace\/|workspace\/)?[A-Za-z0-9_./-]+\.(?:png|jpe?g|gif|webp|svg|avif|bmp))/ig,
  ];

  for (const pattern of patterns) {
    for (const match of output.matchAll(pattern)) {
      const candidate = String(match[1] || "").trim().replace(/^\/workspace\//, "").replace(/^workspace\//, "");
      if (isRunnerLogImageFilePath(candidate)) {
        candidates.push(candidate);
      }
    }
  }

  return candidates[0] || null;
}

function hasConfirmedGeneratedImagePathText(output: unknown): boolean {
  if (typeof output !== "string" || !output.trim()) {
    return false;
  }
  return /(?:generated image|image saved to:|saved image to:|✓\s*image saved to:)/i.test(output);
}

function hasStructuredImagePayload(content: unknown): boolean {
  if (!content || typeof content !== "object") {
    return false;
  }

  const record = content as {
    content?: Array<{ type?: string; data?: string }>;
    structured_content?: Record<string, unknown>;
    structuredContent?: Record<string, unknown>;
  };

  if (Array.isArray(record.content)) {
    for (const item of record.content) {
      if (item?.type === "image" && typeof item.data === "string" && item.data.trim()) {
        return true;
      }
    }
  }

  const structured =
    record.structuredContent && typeof record.structuredContent === "object"
      ? record.structuredContent
      : record.structured_content && typeof record.structured_content === "object"
        ? record.structured_content
        : null;
  if (!structured) {
    return false;
  }

  if (typeof structured.image_data === "string" && structured.image_data.trim()) {
    return true;
  }

  const candidateLists = [
    structured.workspace_file_paths,
    structured.file_paths,
    structured.original_file_paths,
  ];
  return candidateLists.some(
    (value) => Array.isArray(value) && value.some((entry) => typeof entry === "string" && isRunnerLogImageFilePath(entry))
  );
}

export function isLikelyImageGenerationLog(log: RunnerLog, command?: string): boolean {
  const messageHasConfirmedImagePath =
    hasConfirmedGeneratedImagePathText(log.message) &&
    Boolean(extractWorkspaceImagePathFromOutput(log.message));
  return Boolean(
    (command && isImageGenerationCommand(command))
    || log.metadata?.isImageGeneration
    || (typeof log.metadata?.savedImagePath === "string" && log.metadata.savedImagePath.trim())
    || hasStructuredImagePayload(log.metadata?.result)
    || hasStructuredImagePayload(log.metadata?.output)
    || messageHasConfirmedImagePath
  );
}

function ImagePreviewLoadingState() {
  return (
    <div className="tb-runner-image-preview-surface tb-image-generation-preview tb-image-generation-preview-loading is-static" aria-hidden="true">
      <span className="tb-runner-image-preview-surface-state">
        <LoaderCircle className="tb-runner-image-preview-surface-spinner" strokeWidth={1.75} />
      </span>
    </div>
  );
}

function ImagePreviewLogCard({
  icon,
  label,
  title,
  timeLabel,
  meta,
  body,
}: {
  icon: ReactNode;
  label: string;
  title?: string | null;
  timeLabel?: string;
  meta?: ReactNode;
  body: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="tb-log-card tb-log-card-image-preview">
      <LogHeader
        icon={icon}
        label={label}
        title={title}
        timeLabel={timeLabel}
        meta={meta}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>{body}</LogPanel>
    </div>
  );
}

function isImageGenerationCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes(".claude/skills/image-generation/") || command.includes("generate-image.py");
}

function isImageFileChangeLog(log: RunnerLog): boolean {
  if (log.eventType !== "file_change") {
    return false;
  }
  if (log.metadata?.isImageGeneration || typeof log.metadata?.savedImagePath === "string") {
    return true;
  }
  const filePaths = Array.isArray(log.metadata?.filePaths) ? log.metadata?.filePaths : [];
  return filePaths.some((filePath) => isRunnerLogImageFilePath(String(filePath || "")));
}

function extractImagePrompt(command?: string): string | undefined {
  if (!command) return undefined;
  const quoted = [...command.matchAll(/"([^"]+)"/g), ...command.matchAll(/'([^']+)'/g)]
    .map((match) => sanitizeImagePromptCandidate(match[1]))
    .filter(
      (value) =>
        value.length >= 3 &&
        !value.match(/\.(png|jpg|jpeg|gif|webp|py|sh|txt|md)$/i) &&
        !value.startsWith("/") &&
        !value.startsWith(".") &&
        !value.startsWith("-")
    );
  if (quoted.length === 0) return undefined;
  return quoted.reduce((longest, current) => (current.length > longest.length ? current : longest));
}

function sanitizeImagePromptCandidate(value: unknown): string {
  let normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  normalized = normalized.replace(/\\n/g, "\n");
  const markerMatch = normalized.match(/\r?\n\s*(?:quality|generated with|openai size request|image saved to|size):/i);
  if (markerMatch) {
    normalized = normalized.slice(0, markerMatch.index).trim();
  }
  normalized = normalized.split(/\r?\n/)[0]?.trim() || "";
  normalized = normalized.replace(/^["'`]+|["'`,\s]+$/g, "").trim();
  return normalized;
}

function extractImagePromptFromLogMetadata(log: RunnerLog): string | undefined {
  const args = log.metadata?.args && typeof log.metadata.args === "object" && !Array.isArray(log.metadata.args)
    ? (log.metadata.args as Record<string, unknown>)
    : null;
  const toolInput = log.metadata?.toolInput && typeof log.metadata.toolInput === "object" && !Array.isArray(log.metadata.toolInput)
    ? log.metadata.toolInput
    : null;
  const candidates = [
    args?.prompt,
    args?.text,
    toolInput?.prompt,
    toolInput?.text,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      const sanitized = sanitizeImagePromptCandidate(candidate);
      if (sanitized) {
        return sanitized;
      }
    }
  }
  return undefined;
}

function ImageGenerationLogBox({
  log,
  timeLabel,
  backendUrl,
  environmentId,
  requestHeaders,
}: {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
}) {
  const prompt = extractImagePrompt(log.metadata?.command || log.message || "") || extractImagePromptFromLogMetadata(log);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const parsedStdout = parsedOutput?.stdout || "";
  const parsedStderr = parsedOutput?.stderr || "";
  const isError = Boolean(log.metadata?.error)
    || (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0)
    || parsedOutput?.returnCodeInterpretation === "timeout"
    || parsedStderr.trim().length > 0;
  const filePathFromMetadata =
    Array.isArray(log.metadata?.filePaths)
      ? log.metadata.filePaths.find((value): value is string => typeof value === "string" && isRunnerLogImageFilePath(value))
      : null;
  const outputPathSource = parsedOutput ? parsedStdout : log.metadata?.output;
  const outputImagePath =
    !isLoading && !isError && hasConfirmedGeneratedImagePathText(outputPathSource)
      ? extractWorkspaceImagePathFromOutput(outputPathSource)
      : null;
  const messageImagePath =
    !isLoading && !isError && hasConfirmedGeneratedImagePathText(log.message)
      ? extractWorkspaceImagePathFromOutput(log.message)
      : null;
  const resolvedImagePath =
    log.metadata?.savedImagePath
    || filePathFromMetadata
    || extractWorkspaceImagePathFromResult(log.metadata?.result)
    || outputImagePath
    || messageImagePath
    || null;
  const resolvedImageSrc =
    extractBase64Image(log.metadata?.result)
    || (!isError ? extractBase64Image(log.metadata?.output) : null)
    || buildRunnerPreviewDownloadUrl(
      backendUrl,
      environmentId,
      resolvedImagePath
    );
  const errorMessage =
    typeof log.metadata?.error === "string" && log.metadata.error.trim()
      ? log.metadata.error.trim()
      : parsedOutput?.returnCodeInterpretation === "timeout"
        ? "Image generation timed out before a new image was saved."
        : parsedStderr.trim() || String(log.metadata?.output || "Image generation failed.");

  if (!isError && !isLoading && !resolvedImageSrc) {
    return null;
  }

  return (
    <ImagePreviewLogCard
      icon={<Images className="tb-log-card-small-icon" strokeWidth={1.5} />}
      label="Image Generation"
      title={prompt}
      timeLabel={timeLabel}
      meta={isLoading ? <span className="tb-log-card-status">generating...</span> : null}
      body={
        isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{errorMessage}</div>
        ) : resolvedImageSrc ? (
          <div className="tb-log-image-grid">
            <RunnerImagePreviewSurface
              className="tb-image-generation-preview"
              imageClassName="tb-image-generation-preview-image"
              src={resolvedImageSrc}
              alt={prompt || "Generated image"}
              fetchHeaders={requestHeaders}
              loadStrategy="visible"
            />
          </div>
        ) : isLoading ? (
          <div className="tb-log-image-grid">
            <ImagePreviewLoadingState />
          </div>
        ) : null
      }
    />
  );
}

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

  return {
    ok: parsed?.ok !== false,
    action: typeof parsed?.action === "string" && parsed.action.trim() ? parsed.action.trim() : guessBrowserSkillAction(command),
    url: typeof parsed?.url === "string" ? parsed.url : undefined,
    title: typeof parsed?.title === "string" ? parsed.title : undefined,
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
  if (!normalizedUrl) {
    return fallbackTitle?.trim() || "about:blank";
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
  const [collapsed, setCollapsed] = useState(false);
  const [isFollowingLatest, setIsFollowingLatest] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(() => Math.max(0, steps.length - 1));

  useEffect(() => {
    if (steps.length === 0) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex((currentIndex) => {
      if (isFollowingLatest) {
        return steps.length - 1;
      }
      return Math.min(currentIndex, steps.length - 1);
    });
  }, [isFollowingLatest, steps.length]);

  const currentStep = steps[selectedIndex] || steps[steps.length - 1] || null;
  const lastLog = sourceLogs[sourceLogs.length - 1];
  const isRunning = Boolean(lastLog && (lastLog.metadata?.status === "running" || lastLog.metadata?.status === "started"));
  const canMoveBackward = selectedIndex > 0;
  const canMoveForward = selectedIndex < steps.length - 1;
  const cardLabel = variant === "computer-use" ? "Computer Use" : "Browser";
  const cardTitle = steps.length > 1
    ? `${steps.length} interactions`
    : currentStep?.actionLabel || (variant === "computer-use" ? "Computer use session" : "Browser session");
  const computerLabel = `${String(environmentName || "Environment").trim() || "Environment"} Computer`;

  function moveToStep(nextIndex: number) {
    setSelectedIndex(nextIndex);
    setIsFollowingLatest(nextIndex >= steps.length - 1);
  }

  if (sourceLogs.length === 0) {
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
              {currentStep.previewSrc ? (
                <RunnerImagePreviewSurface
                  src={currentStep.previewSrc}
                  alt={currentStep.previewAlt}
                  className="tb-browser-carousel-surface"
                  imageClassName="tb-browser-carousel-image"
                  maxHeight={500}
                  fetchHeaders={requestHeaders}
                  loadStrategy="visible"
                />
              ) : (
                <div className="tb-browser-carousel-empty">
                  {currentStep.isRunning ? "Capturing browser state..." : "No screenshot captured for this step."}
                </div>
              )}
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
                {variant === "computer-use" && onOpenDetails ? (
                  <button type="button" className="tb-subagent-log-open-button" onClick={onOpenDetails}>
                    <span>View all logs</span>
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
  const [collapsed, setCollapsed] = useState(false);
  const cleanedPrompt = truncateSubagentPreviewText(prompt);
  const cleanedSummaryMessage = truncateSubagentPreviewText(summaryMessage) || `${title} is working`;

  return (
    <div className={`tb-log-card tb-log-card-subagent ${isDetailOpen ? "is-detail-open" : ""}`.trim()}>
      <LogHeader
        icon={<Bot className="tb-log-card-small-icon tb-log-card-small-icon-subagent" strokeWidth={1.5} />}
        label="Subagent"
        title={title}
        timeLabel={timeLabel}
        meta={running ? <span className="tb-log-card-status">running...</span> : null}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        <div className="tb-subagent-log-preview">
          <div className={`tb-subagent-log-preview-copy ${running ? "is-running" : ""}`.trim()}>
            {cleanedPrompt ? (
              <>
                <div className="tb-subagent-log-preview-prompt">
                  <RunnerMarkdown
                    content={cleanedPrompt}
                    className="tb-message-markdown tb-message-markdown-summary tb-subagent-log-preview-prompt-markdown"
                    softBreaks
                    disallowHeadings
                  />
                </div>
                <div className="tb-subagent-log-preview-divider" aria-hidden="true" />
              </>
            ) : null}
            <div className="tb-subagent-log-preview-response">
              <RunnerMarkdown
                content={cleanedSummaryMessage}
                className="tb-message-markdown tb-message-markdown-summary tb-subagent-log-preview-markdown"
                softBreaks
              />
            </div>
          </div>
          <div className="tb-subagent-log-preview-footer">
            <button type="button" className="tb-subagent-log-open-button" onClick={onOpenDetails}>
              <span>Open details</span>
              <ChevronRight className="tb-subagent-log-open-button-icon" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </LogPanel>
    </div>
  );
}

export function ComputerUseDetailDrawer({
  title = "Computer Use",
  environmentName,
  workLabel,
  timeLabel,
  running = false,
  onClose,
  children,
}: {
  title?: string;
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
    <aside className="tb-subagent-detail-drawer tb-computer-use-detail-drawer">
      <div className="tb-subagent-detail-drawer-header">
        <div className="tb-subagent-detail-drawer-header-copy">
          <Monitor className="tb-attachment-preview-drawer-header-icon" strokeWidth={1.6} />
          <div className="tb-subagent-detail-drawer-header-text">
            <div className="tb-subagent-detail-drawer-title" title={title}>{title}</div>
          </div>
        </div>
        <div className="tb-subagent-detail-drawer-header-actions">
          {timeLabel ? <span className="tb-subagent-detail-drawer-time">{timeLabel}</span> : null}
          <button type="button" className="tb-attachment-preview-drawer-action" onClick={onClose} aria-label="Close computer use details">
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

function TodoListLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const todos = Array.isArray((log.metadata as { todos?: Array<{ text: string; completed: boolean }> } | undefined)?.todos)
    ? ((log.metadata as { todos?: Array<{ text: string; completed: boolean }> }).todos || [])
    : [];
  const completedCount = todos.filter((todo) => todo.completed).length;
  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<ListTodo className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Task Progress"
        title={todos.length > 0 ? `${completedCount}/${todos.length} completed` : log.message}
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {todos.length > 0 ? (
          <div className="tb-log-checklist">
            {todos.map((todo, index) => (
              <div key={`${todo.text}-${index}`} className="tb-log-checklist-item">
                {todo.completed ? <CheckCircle2 className="tb-log-checklist-icon tb-log-status-icon-success" strokeWidth={1.5} /> : <ChevronRight className="tb-log-checklist-icon" strokeWidth={1.5} />}
                <span className={`tb-log-checklist-text ${todo.completed ? "is-complete" : ""}`}>{todo.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="tb-log-card-empty">No task items available.</div>
        )}
      </LogPanel>
    </div>
  );
}

function GenericCommandLogBox({
  log,
  timeLabel,
  onWorkspacePathClick,
}: {
  log: RunnerLog;
  timeLabel?: string;
  onWorkspacePathClick?: (path: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const command = stripRunnerSystemTags(log.metadata?.command || log.message || "");
  const exitCode = typeof log.metadata?.exitCode === "number" ? log.metadata.exitCode : null;
  const parsedOutput = useMemo(
    () => parseStructuredCommandExecutionOutput(log.metadata?.output),
    [log.metadata?.output]
  );
  const rawOutput = stripRunnerSystemTags(String(log.metadata?.output || ""));
  const stdout = stripRunnerSystemTags(parsedOutput?.stdout || "");
  const stderr = stripRunnerSystemTags(parsedOutput?.stderr || "");
  const hasStdout = stdout.trim().length > 0;
  const hasStderr = stderr.trim().length > 0;
  const statusNotice = (() => {
    if (parsedOutput?.backgroundTaskId) {
      return `Backgrounded (${parsedOutput.backgroundTaskId})`;
    }
    if (parsedOutput?.returnCodeInterpretation === "timeout") {
      return "Timed out";
    }
    if (typeof exitCode === "number" && exitCode !== 0 && !hasStdout && !hasStderr) {
      return `Exited with code ${exitCode}`;
    }
    if (parsedOutput?.interrupted && !hasStdout && !hasStderr) {
      return "Interrupted";
    }
    return null;
  })();
  const hasStructuredTerminalOutput = hasStdout || hasStderr || Boolean(statusNotice);
  const output = parsedOutput ? "" : rawOutput;
  const hasOutput = hasStructuredTerminalOutput || output.trim().length > 0;
  const isError =
    (typeof exitCode === "number" && exitCode !== 0) ||
    parsedOutput?.returnCodeInterpretation === "timeout" ||
    hasStderr;
  const shellCommand = formatShellCommandForDisplay(command);
  const commandDisplay = expanded || shellCommand.length <= 700 ? shellCommand : `${shellCommand.slice(0, 700)}...`;
  const stdoutDisplay = expanded || stdout.length <= 700 ? stdout : `${stdout.slice(0, 700)}...`;
  const stderrDisplay = expanded || stderr.length <= 700 ? stderr : `${stderr.slice(0, 700)}...`;
  const outputDisplay = expanded || output.length <= 700 ? output : `${output.slice(0, 700)}...`;
  const isSkillLaunchOutput = !parsedOutput && hasOutput && isSkillLaunchNotice(outputDisplay);
  const shouldShowExpandToggle =
    shellCommand.length > 700 ||
    stdout.length > 700 ||
    stderr.length > 700 ||
    output.length > 700;
  const copyPayload = useMemo(() => {
    const normalizedCommand = shellCommand.trim()
      ? shellCommand.trim().startsWith("$")
        ? shellCommand.trim()
        : `$ ${shellCommand.trim()}`
      : "";
    const parts = [
      normalizedCommand,
      parsedOutput ? stdout : "",
      parsedOutput ? stderr : "",
      parsedOutput ? statusNotice || "" : output,
    ].filter((value) => typeof value === "string" && value.trim().length > 0);
    return parts.join("\n");
  }, [output, parsedOutput, shellCommand, statusNotice, stderr, stdout]);
  const title = parsedOutput?.backgroundTaskId
    ? "backgrounded"
    : parsedOutput?.returnCodeInterpretation === "timeout"
      ? "timed out"
      : exitCode !== null && exitCode !== 0
        ? `exit ${exitCode}`
        : undefined;

  useEffect(() => {
    if (!copied) return;
    const timeoutId = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy() {
    try {
      await copyRunnerText(copyPayload);
      setCopied(true);
    } catch {}
  }

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<Terminal className="tb-log-card-small-icon" strokeWidth={1.5} />}
        className={`tb-log-card-header-command${isError ? " is-error" : ""}`}
        label="Tool Call"
        title={title}
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {command || hasOutput ? (
          <>
            <div className="tb-log-file-preview-frame tb-log-terminal-frame">
              <div className="tb-log-file-preview-topbar">
                <span className="tb-log-file-preview-language">Bash</span>
                <div className="tb-log-file-preview-actions">
                  <button type="button" className="tb-log-file-preview-copy" onClick={handleCopy}>
                    <Copy className="tb-log-file-preview-action-icon" strokeWidth={1.5} />
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
              <div className="tb-log-terminal-body">
                {command ? <RunnerShellCommandViewer command={commandDisplay} /> : null}
                {parsedOutput ? (
                  <>
                    {hasStdout ? <RunnerAnsiOutput content={stdoutDisplay} onWorkspacePathClick={onWorkspacePathClick} /> : null}
                    {hasStderr ? <RunnerAnsiOutput content={stderrDisplay} isError onWorkspacePathClick={onWorkspacePathClick} /> : null}
                    {!hasStdout && !hasStderr && statusNotice ? <RunnerTerminalStatus content={statusNotice} onWorkspacePathClick={onWorkspacePathClick} /> : null}
                  </>
                ) : hasOutput ? (
                  isSkillLaunchOutput
                    ? <RunnerTerminalStatus content={outputDisplay} onWorkspacePathClick={onWorkspacePathClick} />
                    : <RunnerAnsiOutput content={outputDisplay} isError={isError} onWorkspacePathClick={onWorkspacePathClick} />
                ) : null}
                {!hasOutput ? <div className="tb-log-card-empty">No command output.</div> : null}
              </div>
            </div>
            {shouldShowExpandToggle ? (
              <button type="button" className="tb-log-card-link-button" onClick={() => setExpanded((value) => !value)}>
                {expanded ? "Show less" : "Show more..."}
              </button>
            ) : null}
          </>
        ) : (
          <div className="tb-log-card-empty">No command output.</div>
        )}
      </LogPanel>
    </div>
  );
}

function GenericMcpToolLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const serverName = log.metadata?.serverName || "MCP";
  const toolName = log.metadata?.toolName || "tool";
  const result = log.metadata?.result;
  const error = log.metadata?.error;
  const content = typeof result === "string" ? stripRunnerSystemTags(result) : result ? JSON.stringify(result, null, 2) : error ? String(error) : "";
  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<Globe className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label={`${serverName} -> ${toolName}`}
        timeLabel={timeLabel}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {content ? <RunnerCodeViewer content={content} /> : <div className="tb-log-card-empty">No tool output.</div>}
      </LogPanel>
    </div>
  );
}

function ComputerUseEventLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const parsed = parseComputerUseOutput(log.metadata?.result || log.message);
  const actionLabel = formatBrowserSkillStepAction(parsed);

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<MousePointerClick className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="Computer Use"
        title={actionLabel}
        timeLabel={timeLabel}
        collapsed
        onToggle={() => undefined}
      />
    </div>
  );
}

export function InlineStatusLogBox({
  icon,
  label,
  pending = false,
}: {
  icon: ReactNode;
  label: string;
  pending?: boolean;
}) {
  return (
    <div className={`tb-log-reasoning ${pending ? "tb-log-reasoning-pending" : ""}`.trim()}>
      {!pending ? <span className="tb-log-reasoning-icon">{icon}</span> : null}
      <div className={`tb-log-reasoning-copy ${pending ? "tb-log-reasoning-copy-pending" : ""}`.trim()}>
        {pending ? (
          <span className="tb-log-inline-status-spinner-slot" aria-hidden="true">
            <LoaderCircle className="tb-log-inline-status-spinner tb-context-action-notice-icon-spinner" strokeWidth={1.5} />
          </span>
        ) : null}
        <span className={`tb-log-inline-status-copy ${pending ? "tb-log-inline-status-copy-pending" : ""}`.trim()}>{label}</span>
      </div>
    </div>
  );
}

type PermissionRequestPreview = {
  summary: string;
  details: Array<{ label: string; value: string }>;
  previewLabel?: string;
  previewContent?: string;
  previewLanguage?: string;
  previewFilePath?: string;
  reason?: string;
};

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
  if (Array.isArray(value) && value.every((item) => ["string", "number", "boolean"].includes(typeof item))) {
    return value.map((item) => String(item)).join(" ").trim();
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
  if (normalized === "sh" || normalized === "shell" || normalized === "bash") return "shell";
  return language.trim();
}

function normalizePermissionCodeLanguage(language: string): string | undefined {
  const normalized = language.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "py") return "python";
  if (normalized === "js") return "javascript";
  if (normalized === "ts") return "typescript";
  if (normalized === "sh" || normalized === "bash" || normalized === "shell") return "shell";
  return normalized;
}

function getPermissionReasonCopy(reason: string): string {
  const cleaned = reason.trim();
  if (!cleaned || /requires approval due to ask rule/i.test(cleaned)) {
    return "";
  }
  return cleaned;
}

function buildPermissionRequestPreview(toolName: string, input: string, reason: string): PermissionRequestPreview {
  const parsedInput = parsePermissionInput(input);
  const inputRecord = isPlainRecord(parsedInput) ? parsedInput : null;
  const rawTextInput = typeof parsedInput === "string" ? parsedInput.trim() : "";
  const normalizedToolName = toolName.trim().toLowerCase();
  const details: Array<{ label: string; value: string }> = [];
  const addDetail = (label: string, value: string) => {
    const cleanedValue = value.trim();
    if (cleanedValue && !details.some((detail) => detail.label === label && detail.value === cleanedValue)) {
      details.push({ label, value: cleanedValue });
    }
  };

  const path = getPermissionRecordString(inputRecord, ["path", "file_path", "filePath", "notebook_path", "notebookPath"]);
  const language = getPermissionRecordString(inputRecord, ["language", "lang"]);
  const code = getPermissionRecordString(inputRecord, ["code", "source", "script"]);
  const command = getPermissionRecordString(inputRecord, ["command", "cmd", "shellCommand", "shell_command"]) || rawTextInput;
  const diff = getPermissionRecordString(inputRecord, ["diff", "patch", "changes"]);
  const oldString = getPermissionRecordString(inputRecord, ["old_string", "oldString"]);
  const newString = getPermissionRecordString(inputRecord, ["new_string", "newString"]);
  const content = getPermissionRecordString(inputRecord, ["content", "new_content", "newContent", "text"]);
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
    const previewContent = diff || (oldString || newString ? `Replace:\n${oldString || "(empty)"}\n\nWith:\n${newString || "(empty)"}` : content);
    return {
      summary: `Approving lets the agent ${isWrite ? "write" : "edit"} this file once, then continue.`,
      details,
      previewLabel: diff ? "Proposed diff" : oldString || newString ? "Proposed change" : content ? "File content" : undefined,
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

function PermissionRequestLogBox({
  log,
  timeLabel,
  onPermissionDecision,
}: {
  log: RunnerLog;
  timeLabel?: string;
  onPermissionDecision?: (log: RunnerLog, decision: "allow" | "deny") => Promise<void> | void;
}) {
  const [isSubmitting, setIsSubmitting] = useState<"allow" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const status = String(log.metadata?.status || log.metadata?.decision || "pending").trim().toLowerCase();
  const isPending = status === "pending";
  const isApproved = status === "approved" || status === "allowed" || status === "allow" || status === "granted";
  const toolNameFromMessage = /^permission requested:\s*(.+)$/i.exec(String(log.message || "").trim())?.[1]?.trim();
  const toolName = String(log.metadata?.toolName || log.metadata?.toolId || toolNameFromMessage || "tool").trim() || "tool";
  const reason = typeof log.metadata?.reason === "string" ? log.metadata.reason.trim() : "";
  const input = typeof log.metadata?.input === "string" ? log.metadata.input.trim() : "";
  const permissionPreview = buildPermissionRequestPreview(toolName, input, reason);

  const decide = async (decision: "allow" | "deny") => {
    if (!onPermissionDecision || !isPending || isSubmitting) return;
    setError(null);
    setIsSubmitting(decision);
    try {
      await onPermissionDecision(log, decision);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
      setIsSubmitting(null);
    }
  };

  if (!isPending) {
    const resolvedTitle = `Permission ${isApproved ? "granted" : "denied"} for ${toolName}`;
    const ResolvedIcon = isApproved ? Check : X;

    return (
      <div className="tb-log-card tb-log-card-permission is-resolved">
        <div className="tb-log-card-header tb-log-card-header-static">
          <span className="tb-log-card-icon">
            <ResolvedIcon className="tb-log-card-small-icon" strokeWidth={1.7} />
          </span>
          <div className="tb-log-card-header-copy">
            <div className="tb-log-card-title">{resolvedTitle}</div>
          </div>
          {timeLabel ? <span className="tb-log-card-time">{timeLabel}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="tb-log-card tb-log-card-permission is-pending">
      <div className="tb-log-card-header tb-log-card-header-static">
        <span className="tb-log-card-icon">
          <AlertCircle className="tb-log-card-small-icon" strokeWidth={1.7} />
        </span>
        <div className="tb-log-card-header-copy">
          <div className="tb-log-card-title">{`Permission asked for ${toolName}`}</div>
        </div>
        {timeLabel ? <span className="tb-log-card-time">{timeLabel}</span> : null}
      </div>
      <div className="tb-log-card-panel tb-log-permission-panel">
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
        {permissionPreview.reason ? <div className="tb-log-permission-reason">{permissionPreview.reason}</div> : null}
        {permissionPreview.previewContent ? (
          <div className="tb-log-permission-preview">
            {permissionPreview.previewLabel ? <div className="tb-log-permission-preview-label">{permissionPreview.previewLabel}</div> : null}
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
        {isPending ? (
          <div className="tb-log-permission-actions">
            <button
              type="button"
              className="tb-log-permission-button tb-log-permission-button-secondary"
              onClick={() => void decide("deny")}
              disabled={Boolean(isSubmitting)}
            >
              {isSubmitting === "deny" ? "Denying..." : "Deny"}
            </button>
            <button
              type="button"
              className="tb-log-permission-button tb-log-permission-button-primary"
              onClick={() => void decide("allow")}
              disabled={Boolean(isSubmitting)}
            >
              {isSubmitting === "allow" ? "Approving..." : "Accept"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function RunnerWorkLogEntry({
  log,
  timeLabel,
  backendUrl,
  environmentId,
  requestHeaders,
  renderComputerUseMcpAsGeneric = false,
  activeTaskPreviewId,
  availableAgents,
  availableEnvironments,
  availableProjects,
  onPreviewDocument,
  onWorkspacePathClick,
  onPermissionDecision,
  onTaskPreviewClick,
  onAgentPreviewClick,
  onEnvironmentPreviewClick,
  onProjectPreviewClick,
}: RunnerWorkLogEntryProps) {
  const normalizedMessage = stripRunnerSystemTags(log.message || "").replace(/\s+/g, " ").trim().toLowerCase();

  if (normalizedMessage === "starting session" || normalizedMessage === "starting session...") {
    return null;
  }

  if (normalizedMessage === "thinking" || normalizedMessage === "thinking...") {
    return <InlineStatusLogBox label="Thinking..." icon={<Terminal className="tb-log-card-small-icon" strokeWidth={1.5} />} pending />;
  }

  if (log.eventType === "reasoning" || log.eventType === "planning" || log.isReasoning || log.isPlanning) {
    return <ReasoningLogBox log={log} onWorkspacePathClick={onWorkspacePathClick} />;
  }

  if ((log as RunnerLog & { isActionSummary?: boolean }).isActionSummary || log.eventType === "action_summary") {
    return <GenericTextLogBox log={log} timeLabel={timeLabel} label="Action Summary" icon={<Lightbulb className="tb-log-card-small-icon" strokeWidth={1.5} />} onWorkspacePathClick={onWorkspacePathClick} />;
  }

  if (log.eventType === "permission_request") {
    return <PermissionRequestLogBox log={log} timeLabel={timeLabel} onPermissionDecision={onPermissionDecision} />;
  }

  if (log.eventType === "deep_research" && log.metadata?.deepResearch) {
    return <DeepResearchEventLogBox log={log} timeLabel={timeLabel} />;
  }

  if (log.eventType === "command_execution") {
    const command = log.metadata?.command || "";
    const output = String(log.metadata?.output || "");
    if (isWebSearchCommand(command) || isWebSearchOutput(output)) return <WebSearchLogBox log={log} timeLabel={timeLabel} />;
    if (isMemoryCommand(command)) return <MemoryLogBox log={log} timeLabel={timeLabel} />;
    if (isBrowserSkillCommand(command)) {
      return <BrowserSkillLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} />;
    }
    if (isEmailCommand(command)) return <EmailLogBox log={log} timeLabel={timeLabel} />;
    if (shouldRenderComputerAgentsCreateLog(log)) return <ComputerAgentsCreateLogBox log={log} timeLabel={timeLabel} />;
    const taskManagementProjectsListDetails = parseTaskManagementProjectsListLogDetails(log);
    if (taskManagementProjectsListDetails) {
      return (
        <TaskManagementProjectsListLogBox
          details={taskManagementProjectsListDetails}
          timeLabel={timeLabel}
          availableProjects={availableProjects}
          availableEnvironments={availableEnvironments as TaskManagementListAvailableEnvironment[] | undefined}
          onProjectClick={(project) => onProjectPreviewClick?.({
            projectId: project.id,
            projectName: project.name,
          })}
        />
      );
    }
    const computerAgentsEnvironmentsListDetails = parseComputerAgentsEnvironmentsListLogDetails(log);
    if (computerAgentsEnvironmentsListDetails) {
      return (
        <ComputerAgentsEnvironmentsListLogBox
          details={computerAgentsEnvironmentsListDetails}
          timeLabel={timeLabel}
          availableEnvironments={availableEnvironments}
          onEnvironmentClick={(environment) => onEnvironmentPreviewClick?.({
            environmentId: environment.id,
            environmentName: environment.name,
          })}
        />
      );
    }
    const computerAgentsListDetails = parseComputerAgentsListLogDetails(log);
    if (computerAgentsListDetails) {
      return (
        <ComputerAgentsListLogBox
          details={computerAgentsListDetails}
          timeLabel={timeLabel}
          availableAgents={availableAgents}
          onAgentClick={(agent) => onAgentPreviewClick?.({ agentId: agent.id, agentName: agent.name })}
        />
      );
    }
    if (shouldRenderTaskManagementReleaseCreateLog(log)) return <TaskManagementReleaseCreateLogBox log={log} timeLabel={timeLabel} />;
    if (shouldRenderTaskManagementCreateLog(log)) return <TaskManagementCreateLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} requestHeaders={requestHeaders} activeTaskPreviewId={activeTaskPreviewId} onTaskPreviewClick={onTaskPreviewClick} />;
    if (isGrepSearchLog(log)) return <GrepSearchLogBox log={log} timeLabel={timeLabel} />;
    if (isListFilesLog(log)) {
      return (
        <ListFilesLogBox
          log={log}
          timeLabel={timeLabel}
          backendUrl={backendUrl}
          environmentId={environmentId}
          requestHeaders={requestHeaders}
          onWorkspacePathClick={onWorkspacePathClick}
        />
      );
    }
    if (isReadFileLog(log)) {
      return (
        <ReadFileLogBox
          log={log}
          timeLabel={timeLabel}
          backendUrl={backendUrl}
          environmentId={environmentId}
          requestHeaders={requestHeaders}
          onPreviewDocument={onPreviewDocument}
          onWorkspacePathClick={onWorkspacePathClick}
        />
      );
    }
    if (isWriteFileLog(log)) {
      return (
        <WriteFileLogGroup
          log={log}
          timeLabel={timeLabel}
          backendUrl={backendUrl}
          environmentId={environmentId}
          requestHeaders={requestHeaders}
          onPreviewDocument={onPreviewDocument}
        />
      );
    }
    if (isPdfReaderCommand(command)) return <PdfReaderLogBox log={log} timeLabel={timeLabel} />;
    if (isLikelyImageGenerationLog(log, command)) {
      return <ImageGenerationLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} />;
    }
    if (isDeepResearchCommand(command)) return <DeepResearchCommandLogBox log={log} timeLabel={timeLabel} />;
    const gitDiffDetails = parseGitDiffLogDetails(log);
    if (gitDiffDetails) return <GitDiffLogBox details={gitDiffDetails} timeLabel={timeLabel} />;
    const gitCommitDetails = parseGitCommitLogDetails(log);
    if (gitCommitDetails) return <GitCommitLogBox details={gitCommitDetails} timeLabel={timeLabel} />;
    const gitStatusDetails = parseGitStatusLogDetails(log);
    if (gitStatusDetails) return <GitStatusLogBox details={gitStatusDetails} timeLabel={timeLabel} />;
    return <GenericCommandLogBox log={log} timeLabel={timeLabel} onWorkspacePathClick={onWorkspacePathClick} />;
  }

  if (log.eventType === "mcp_tool_call") {
    if (shouldRenderComputerAgentsCreateLog(log)) {
      return <ComputerAgentsCreateLogBox log={log} timeLabel={timeLabel} />;
    }
    if (shouldRenderTaskManagementReleaseCreateLog(log)) {
      return <TaskManagementReleaseCreateLogBox log={log} timeLabel={timeLabel} />;
    }
    if (shouldRenderTaskManagementCreateLog(log)) {
      return <TaskManagementCreateLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} requestHeaders={requestHeaders} activeTaskPreviewId={activeTaskPreviewId} onTaskPreviewClick={onTaskPreviewClick} />;
    }
    if (isComputerUseMcpLog(log)) {
      if (renderComputerUseMcpAsGeneric) {
        return <ComputerUseEventLogBox log={log} timeLabel={timeLabel} />;
      }
      return <BrowserSkillLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} />;
    }
    if (isLikelyImageGenerationLog(log)) {
      return <ImageGenerationLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} />;
    }
    return <GenericMcpToolLogBox log={log} timeLabel={timeLabel} />;
  }

  if (log.eventType === "mcp_log") {
    return <GenericTextLogBox log={log} timeLabel={timeLabel} label="MCP Log" icon={<Globe className="tb-log-card-small-icon" strokeWidth={1.5} />} onWorkspacePathClick={onWorkspacePathClick} />;
  }

  if (log.eventType === "file_change") {
    if (shouldRenderComputerAgentsCreateLog(log)) {
      return <ComputerAgentsCreateLogBox log={log} timeLabel={timeLabel} />;
    }
    if (shouldRenderTaskManagementReleaseCreateLog(log)) {
      return <TaskManagementReleaseCreateLogBox log={log} timeLabel={timeLabel} />;
    }
    if (shouldRenderTaskManagementCreateLog(log)) {
      return <TaskManagementCreateLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} requestHeaders={requestHeaders} activeTaskPreviewId={activeTaskPreviewId} onTaskPreviewClick={onTaskPreviewClick} />;
    }
    if (isImageFileChangeLog(log)) {
      return null;
    }
    return (
      <WriteFileLogGroup
        log={log}
        timeLabel={timeLabel}
        backendUrl={backendUrl}
        environmentId={environmentId}
        requestHeaders={requestHeaders}
        onPreviewDocument={onPreviewDocument}
      />
    );
  }

  if (log.eventType === "todo_list") {
    return <TodoListLogBox log={log} timeLabel={timeLabel} />;
  }

  if (log.eventType === "setup" || log.eventType === "startup") {
    return <InlineStatusLogBox label="Starting session" icon={<Terminal className="tb-log-card-small-icon" strokeWidth={1.5} />} />;
  }

  if (normalizedMessage === "setting up workspace" || normalizedMessage === "setting up workspace...") {
    return <InlineStatusLogBox label="Setting up workspace..." icon={<Terminal className="tb-log-card-small-icon" strokeWidth={1.5} />} pending />;
  }

  if (log.type === "error") {
    return <GenericTextLogBox log={log} timeLabel={timeLabel} label="Error" icon={<AlertCircle className="tb-log-card-small-icon" strokeWidth={1.5} />} onWorkspacePathClick={onWorkspacePathClick} />;
  }

  return <GenericTextLogBox log={log} timeLabel={timeLabel} label="Log" icon={<FileText className="tb-log-card-small-icon" strokeWidth={1.5} />} onWorkspacePathClick={onWorkspacePathClick} />;
}

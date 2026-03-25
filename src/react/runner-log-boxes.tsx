import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  FileImage,
  FilePlus,
  FileSearch,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  Images,
  Lightbulb,
  LoaderCircle,
  ListTodo,
  Mail,
  Music,
  Paperclip,
  ScanText,
  Search,
  Telescope,
  Terminal,
  Video,
} from "lucide-react";
import type { RunnerLog } from "../types.js";
import {
  buildRunnerPreviewAttachmentFromPath,
  buildRunnerPreviewDownloadUrl,
  getRunnerDocumentPreviewKind,
  type RunnerPreviewAttachment,
} from "./runner-document-preview.js";
import { RunnerFileDiffSurface } from "./runner-file-diff-surface.js";
import { RunnerImagePreviewSurface } from "./runner-image-preview-surface.js";
import { RunnerMarkdown, stripRunnerSystemTags } from "./runner-markdown.js";

const RUNNER_TEXT_FILE_ICON_URL = new URL("./assets/txtfile.png", import.meta.url).toString();
const RUNNER_FOLDER_ICON_URL = new URL("./assets/folder.png", import.meta.url).toString();
const RUNNER_IMAGE_FILE_ICON_URL = new URL("./assets/imgicon.webp", import.meta.url).toString();

interface RunnerWorkLogEntryProps {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
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

function getFileName(filePath: string): string {
  const parts = filePath.split("/");
  return parts[parts.length - 1] || filePath;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes < 1) return "";
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

function LogHeader({
  icon,
  label,
  title,
  timeLabel,
  meta,
  collapsed,
  onToggle,
  className,
}: {
  icon: ReactNode;
  label: string;
  title?: string | null;
  timeLabel?: string;
  meta?: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button type="button" className={`tb-log-card-header ${className || ""}`.trim()} onClick={onToggle}>
      <span className="tb-log-card-icon">{icon}</span>
      <div className="tb-log-card-header-copy">
        <span className="tb-log-card-label">{label}</span>
        {title ? <span className="tb-log-card-title">{title}</span> : null}
      </div>
      <div className="tb-log-card-header-right">
        {meta}
        {timeLabel ? <span className="tb-log-card-time">{timeLabel}</span> : null}
        {collapsed ? <ChevronRight className="tb-log-card-chevron" strokeWidth={1.5} /> : <ChevronDown className="tb-log-card-chevron" strokeWidth={1.5} />}
      </div>
    </button>
  );
}

function LogPanel({
  children,
  collapsed,
}: {
  children: ReactNode;
  collapsed: boolean;
}) {
  if (collapsed) return null;
  return <div className="tb-log-card-panel">{children}</div>;
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

function RunnerCodeViewer({
  content,
  filePath,
  language,
  maxHeight,
  showLineNumbers = false,
}: {
  content: string;
  filePath?: string;
  language?: string;
  maxHeight?: number;
  showLineNumbers?: boolean;
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
    <div className="tb-log-card-code">
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
}: {
  content: string;
  isError?: boolean;
}) {
  const segments = useMemo(() => parseRunnerAnsiSegments(content), [content]);

  return (
    <pre className={`tb-log-terminal-output ${isError ? "is-error" : ""}`}>
      {segments.map((segment, index) => (
        <span
          key={`${index}-${segment.text.length}`}
          style={{
            color: segment.color || undefined,
            fontWeight: segment.bold ? 600 : undefined,
          }}
        >
          {segment.text}
        </span>
      ))}
    </pre>
  );
}

function isSkillLaunchNotice(content: string): boolean {
  const normalized = content.trim();
  return /^Launching skill:\s+.+$/i.test(normalized) && !normalized.includes("\n");
}

function RunnerTerminalStatus({ content }: { content: string }) {
  return <div className="tb-log-terminal-status">{content.trim()}</div>;
}

type RunnerFileDiffMetadata = {
  diff?: string;
  changes?: string;
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

function buildCreatedFileDiff(filePath: string, content: string): string {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const lines = normalizedContent.split("\n");
  const body = lines.map((line) => `+${line}`).join("\n");
  return `--- /dev/null\n+++ b/${filePath}\n@@ -0,0 +1,${lines.length} @@\n${body}`;
}

function resolveWriteDiffPreview(log: RunnerLog, filePath: string | undefined, output: string, operation: "created" | "modified") {
  const diffMetadata = resolveFileDiffMetadata(log, filePath);
  const diffText = stripRunnerSystemTags(
    String(
      diffMetadata?.diff ||
        diffMetadata?.changes ||
        (operation === "created" && filePath && output ? buildCreatedFileDiff(filePath, output) : "")
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

function ReasoningLogBox({ log }: { log: RunnerLog }) {
  const content = stripRunnerSystemTags(log.message).replace(/^\*\*[^*]+\*\*\s*/, "").trim();
  if (!content) return null;
  return (
    <div className="tb-log-reasoning">
      <span className="tb-log-reasoning-icon">
        <Lightbulb className="tb-log-card-small-icon" strokeWidth={1.5} />
      </span>
      <RunnerMarkdown content={content} className="tb-log-reasoning-copy tb-message-markdown" />
    </div>
  );
}

function GenericTextLogBox({
  log,
  timeLabel,
  label,
  title,
  icon,
}: {
  log: RunnerLog;
  timeLabel?: string;
  label: string;
  title?: string | null;
  icon: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const content = stripRunnerSystemTags(log.message || log.metadata?.output || "");
  return (
    <div className="tb-log-card">
      <LogHeader icon={icon} label={label} title={title} timeLabel={timeLabel} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <LogPanel collapsed={collapsed}>
        {content ? <RunnerMarkdown content={content} className="tb-message-markdown" softBreaks /> : <div className="tb-log-card-empty">No details available.</div>}
      </LogPanel>
    </div>
  );
}

function stripLineNumbers(text: string): string {
  return text.replace(/^\s*\d+→/gm, "");
}

function isReadFileCommand(command?: string): boolean {
  if (!command) return false;
  return [
    /sed\s+-n\s+['"][^'"]*['"]\s+/,
    /\bcat\s+["']?[^|&;]+/,
    /\bhead\s+(?:-n\s+\d+\s+)?["']?[^|&;]+/,
    /\btail\s+(?:-n\s+\d+\s+)?["']?[^|&;]+/,
    /\bless\s+["']?[^|&;]+/,
  ].some((pattern) => pattern.test(command));
}

function extractReadFilePath(command?: string): string | null {
  if (!command) return null;
  const patterns = [
    /sed\s+-n\s+['"][^'"]*['"]\s+["']([^"']+)["']/,
    /sed\s+-n\s+['"][^'"]*['"]\s+(\S+)/,
    /\b(?:cat|head|tail|less)\s+(?:-n\s+\d+\s+)?["']([^"']+)["']/,
    /\b(?:cat|head|tail|less)\s+(?:-n\s+\d+\s+)?([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
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
  const tail = command.match(/tail\s+-n\s+(\d+)/);
  if (tail) return `last ${tail[1]} lines`;
  return null;
}

function ReadFileLogBox({
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
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const command = log.metadata?.command || "";
  const filePath =
    normalizeRunnerFilePath(log.metadata?.filePaths?.[0] as string | undefined) ||
    normalizeRunnerFilePath((log.metadata as { file_path?: string; path?: string } | undefined)?.file_path) ||
    normalizeRunnerFilePath((log.metadata as { file_path?: string; path?: string } | undefined)?.path) ||
    normalizeRunnerFilePath(extractReadFilePath(command)) ||
    normalizeRunnerFilePath(extractWorkspacePathFromText(log.message)) ||
    normalizeRunnerFilePath(extractWorkspacePathFromText(command));
  const output = stripRunnerSystemTags(String(log.metadata?.output || ""));
  const lineRange = extractReadLineRange(command);
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;
  const content = stripLineNumbers(output);
  const normalizedContent = content.trim().toLowerCase();
  const isImageFile = Boolean(filePath && isRunnerLogImageFilePath(filePath));
  const imagePreviewUrl = isImageFile ? buildRunnerPreviewDownloadUrl(backendUrl, environmentId, filePath) : null;
  const isImageReadWithoutText =
    isImageFile
    && (
      normalizedContent.length === 0
      || normalizedContent === "read completed (no textual content found)."
    );
  const detectedLanguage = detectCodeLanguage(content, filePath || undefined);
  const languageLabel = formatCodeLanguageLabel(detectedLanguage);

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
                <button type="button" className="tb-log-file-preview-copy" onClick={handleCopy}>
                  <Copy className="tb-log-pill-icon" strokeWidth={1.5} />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="tb-log-file-preview-body">
                <RunnerCodeViewer
                  key={`${filePath || "inline"}:${detectedLanguage}:file-preview`}
                  content={content}
                  filePath={filePath}
                  language={detectedLanguage}
                  maxHeight={500}
                  showLineNumbers
                />
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
  return [
    /\bcat\s+>+\s*/,
    /\becho\s+.*>+\s*/,
    /\bprintf\s+.*>+\s*/,
    /\btee\s+["']?[^|&;]+/,
    /\bsed\s+-i/,
    />\s*["']?\/workspace\//,
    /\bcp\s+.*["']?\/workspace\//,
    /\bmv\s+.*["']?\/workspace\//,
  ].some((pattern) => pattern.test(command));
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
  const command = log.metadata?.command || "";
  const filePath = (log.metadata?.filePaths?.[0] as string | undefined) || extractWriteFilePath(command) || undefined;
  const fileContents = log.metadata?.fileContents as Record<string, string> | undefined;
  const fileContent = resolveFileMapValue(fileContents, filePath);
  const output = stripRunnerSystemTags(String(fileContent || log.metadata?.output || ""));
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;
  const operation = deriveWriteOperation(command, log.metadata?.changeKinds?.[0]);
  const { diffText, additions, deletions, hasKnownCounts } = resolveWriteDiffPreview(log, filePath, output, operation);
  const imagePreviewUrl = isRunnerLogImageFilePath(filePath)
    ? buildRunnerPreviewDownloadUrl(backendUrl, environmentId, filePath)
    : null;
  const previewAttachment = resolveWriteDocumentPreviewAttachment(filePath, backendUrl, environmentId);
  const imageLabel = operation === "created" ? "Generated Image" : "Updated Image";

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={(imagePreviewUrl ? <FileImage className="tb-log-card-small-icon" strokeWidth={1.5} /> : <FilePlus className="tb-log-card-small-icon" strokeWidth={1.5} />)}
        label={imagePreviewUrl ? imageLabel : (operation === "created" ? "Create File" : "Edit File")}
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
        ) : (
          <>
            {diffText ? (
              <RunnerFileDiffSurface
                filePath={filePath}
                diffContent={diffText}
                fileContent={output}
                additions={hasKnownCounts ? additions : undefined}
                deletions={hasKnownCounts ? deletions : undefined}
                emptyMessage="Diff unavailable for this log."
                bleed
                collapsedPreviewLines={10}
                controlsAccessory={
                  previewAttachment ? (
                    <button
                      type="button"
                      className="tb-runner-diff-surface-action-button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onPreviewDocument?.(previewAttachment);
                      }}
                      aria-label={`Preview ${previewAttachment.filename}`}
                      title={`Preview ${previewAttachment.filename}`}
                    >
                      <Eye className="tb-runner-diff-surface-action-icon" strokeWidth={1.9} />
                    </button>
                  ) : null
                }
              />
            ) : output ? (
              <>
                <RunnerCodeViewer content={output} filePath={filePath || undefined} />
                <div className="tb-log-card-note">Diff unavailable for this log.</div>
              </>
            ) : (
              <div className="tb-log-card-empty">Diff unavailable for this log.</div>
            )}
          </>
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
  const filePaths = log.metadata?.filePaths || [];
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
  size?: string;
  isHidden: boolean;
};

function isListFilesCommand(command?: string): boolean {
  if (!command) return false;
  return [/\bls\s+(?:-[a-zA-Z]+\s+)?["']?[^|&;]+/, /\bll\s+["']?[^|&;]+/].some((pattern) => pattern.test(command));
}

function extractDirectoryPath(command?: string): string | null {
  if (!command) return null;
  const patterns = [
    /\b(?:ls|ll)\s+(?:-[a-zA-Z]+\s+)?["']([^"']+)["']/,
    /\b(?:ls|ll)\s+(?:-[a-zA-Z]+\s+)?([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
    /["']?(\/workspace\/[^"'\s|&;>]*)["']?/,
  ];
  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (match?.[1] && !match[1].startsWith("-")) return match[1];
  }
  return null;
}

function parseListOutput(output: string): ListFileItem[] {
  if (!output.trim()) return [];
  const lines = output.trim().split("\n");
  const items: ListFileItem[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("total ")) continue;
    const detailed = trimmed.match(/^([d-][rwx-]{9})\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\d+\s+[\d:]+\s+(.+)$/);
    if (detailed) {
      const [, permissions, size, name] = detailed;
      items.push({
        name,
        type: permissions.startsWith("d") ? "folder" : "file",
        size: formatBytes(Number(size)),
        isHidden: name.startsWith("."),
      });
      continue;
    }
    const names = trimmed.split(/\s+/);
    for (const name of names) {
      if (!name) continue;
      const isLikelyFolder = !name.includes(".") || ["node_modules", "src", "dist", "build", "public", "assets", "components", "lib", "utils"].includes(name);
      items.push({ name, type: isLikelyFolder ? "folder" : "file", isHidden: name.startsWith(".") });
    }
  }
  return items.sort((left, right) => {
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

function ListFilesLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const command = log.metadata?.command || "";
  const output = String(log.metadata?.output || "");
  const directoryPath = extractDirectoryPath(command);
  const allItems = useMemo(() => parseListOutput(output), [output]);
  const visibleItems = showHidden ? allItems : allItems.filter((item) => !item.isHidden);
  const displayItems = showAll ? visibleItems : visibleItems.slice(0, 12);
  const hasHidden = allItems.some((item) => item.isHidden);
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<FolderOpen className="tb-log-card-small-icon" strokeWidth={1.5} />}
        label="List Files"
        title={directoryPath}
        timeLabel={timeLabel}
        meta={visibleItems.length > 0 ? <span className="tb-log-card-pill">{visibleItems.length} items</span> : null}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <LogPanel collapsed={collapsed}>
        {isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{output || "Failed to list files."}</div>
        ) : visibleItems.length > 0 ? (
          <>
            <div className="tb-log-file-list">
              {displayItems.map((item) => (
                <div key={`${item.type}-${item.name}`} className="tb-log-file-row">
                  <span className="tb-log-file-icon">
                    <FileKindIcon item={item} />
                  </span>
                  <span className="tb-log-file-name">{item.name}</span>
                  {item.size ? <span className="tb-log-file-size">{item.size}</span> : null}
                </div>
              ))}
            </div>
            <div className="tb-log-card-actions">
              {hasHidden ? (
                <button type="button" className="tb-log-card-link-button" onClick={() => setShowHidden((value) => !value)}>
                  {showHidden ? "Hide hidden files" : `Show hidden files (${allItems.filter((item) => item.isHidden).length})`}
                </button>
              ) : null}
              {visibleItems.length > 12 ? (
                <button type="button" className="tb-log-card-link-button" onClick={() => setShowAll((value) => !value)}>
                  {showAll ? "Show fewer" : `Show ${visibleItems.length - 12} more`}
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <div className="tb-log-card-empty">Folder is empty.</div>
        )}
      </LogPanel>
    </div>
  );
}

type WebSearchResult = { url: string; title: string; domain?: string; snippet?: string; thumbnail?: string };
type WebSearchImage = { url: string; thumbnail?: string; title?: string; source?: string };

function isWebSearchCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes("/workspace/.scripts/web-search.py") || command.includes("web-search.py") || command.includes(".claude/skills/web-search/");
}

function isWebSearchOutput(output?: string): boolean {
  if (!output) return false;
  return (
    output.includes("Web search results for query:") ||
    output.includes("Links: [{") ||
    (/(?:^|\n)##?\s*Search Results/i.test(output) && /(?:^|\n)##?\s*Sources/i.test(output)) ||
    (output.includes("SUMMARY:") && output.includes("SOURCES:"))
  );
}

function extractSearchQuery(command?: string): string | null {
  if (!command) return null;
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
        return buildWebSearchSourceEntry(undefined, item);
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
    summary,
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
  let summary: string | null = null;
  let sources: WebSearchResult[] = [];
  let images: WebSearchImage[] = [];

  if (output.includes("Web search results for query:")) {
    try {
      const linkPattern = /\{"title":"([^"]*?)","url":"([^"]*?)"\}/g;
      let match: RegExpExecArray | null = null;
      while ((match = linkPattern.exec(output)) !== null) {
        const source = buildWebSearchSourceEntry(match[1] || match[2], match[2]);
        if (source) {
          sources.push(source);
        }
      }

      const imagesMatch = output.match(/##?\s*Images\s*\n([\s\S]*?)$/i);
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

      const linksStart = output.indexOf("Links:");
      if (linksStart !== -1) {
        const afterLinks = output.slice(linksStart);
        const arrayEnd = afterLinks.match(/\}]\s*([\s\S]*?)(?=##?\s*Images|$)/i);
        if (arrayEnd?.[1]) {
          const candidate = arrayEnd[1].trim();
          if (candidate.length > 10 && !candidate.startsWith("{") && !candidate.startsWith("[")) {
            summary = cleanSummaryText(candidate);
          }
        }
      }

      if (!summary) {
        const directArrayEndMatch = output.match(/\}]\s*([A-Z][^{}\[\]]{10,}?)(?=##?\s*Images|$)/i);
        if (directArrayEndMatch?.[1]) {
          summary = cleanSummaryText(directArrayEndMatch[1].trim());
        }
      }

      if (!summary) {
        const beforeLinksMatch = output.match(/Web search results for query:[^\n]*\n\n([\s\S]*?)(?=Links:|$)/);
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

  const markdownResults = output.match(/##?\s*Search Results[^\n]*\n([\s\S]*?)(?=##?\s*Sources|##?\s*Images|$)/i);
  const markdownSources = output.match(/##?\s*Sources\s*\n([\s\S]*?)(?=##?\s*Images|$)/i);
  const markdownImages = output.match(/##?\s*Images\s*\n([\s\S]*?)$/i);
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
    const match = output.match(pattern);
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
    const summaryMatch = output.match(/SUMMARY:\s*([\s\S]*?)(?=SOURCES:|JSON OUTPUT:|IMAGES:|$)/i);
    if (summaryMatch?.[1]) {
      summary = cleanSummaryText(summaryMatch[1]);
    }
  }

  if (sources.length === 0) {
    const sourcesMatch = output.match(/SOURCES:\s*-*\s*([\s\S]*?)(?=JSON OUTPUT:|IMAGES:|$)/i);
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
    const imageMatches = output.match(imageUrlPattern);
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
  const output = typeof log.metadata?.output === "string" ? log.metadata.output : "";
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
          <div className="tb-log-card-state tb-log-card-state-error">{output || "Web search failed."}</div>
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

function isDeepResearchCommand(command?: string): boolean {
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
    thinkingSummaries: [] as string[],
    reportFile: null as string | null,
    sourcesCount: 0,
    elapsedSeconds: 0,
    errorMessage: null as string | null,
  };
  if (!output) return result;
  for (const line of output.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      const event = JSON.parse(trimmed) as Record<string, unknown>;
      if (event.event === "start") result.topic = typeof event.topic === "string" ? event.topic : result.topic;
      if (event.event === "thinking" && typeof event.summary === "string") {
        result.thinkingSummaries.push(event.summary);
        result.status = "thinking";
      }
      if (event.event === "content") result.status = "researching";
      if ((event.event === "research_complete" || event.event === "complete") && typeof event.report_file === "string") {
        result.reportFile = event.report_file;
        result.status = "complete";
      }
      if ((event.event === "research_complete" || event.event === "complete") && typeof event.sources_count === "number") {
        result.sourcesCount = event.sources_count;
      }
      if (typeof event.elapsed_seconds === "number") result.elapsedSeconds = event.elapsed_seconds;
      if (event.event === "error" && typeof event.message === "string") {
        result.status = "error";
        result.errorMessage = event.message;
      }
    } catch {}
  }
  return result;
}

function DeepResearchEventLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const data = log.metadata?.deepResearch;
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

function isLikelyImageGenerationLog(log: RunnerLog, command?: string): boolean {
  return Boolean(
    (command && isImageGenerationCommand(command))
    || log.metadata?.isImageGeneration
    || (typeof log.metadata?.savedImagePath === "string" && log.metadata.savedImagePath.trim())
    || hasStructuredImagePayload(log.metadata?.result)
    || hasStructuredImagePayload(log.metadata?.output)
    || Boolean(extractWorkspaceImagePathFromOutput(log.message))
  );
}

function ImagePreviewLoadingState() {
  return (
    <div className="tb-runner-image-preview-surface is-static" aria-hidden="true">
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
    .map((match) => match[1])
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
  const prompt = extractImagePrompt(log.metadata?.command || log.message || "");
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const isError = Boolean(log.metadata?.error) || (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0);
  const [resolvedImageSrc, setResolvedImageSrc] = useState<string | null>(null);
  const [imageResolutionComplete, setImageResolutionComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = globalThis.setTimeout(() => {
      if (cancelled) {
        return;
      }
      const resolvedImagePath =
        log.metadata?.savedImagePath
        || extractWorkspaceImagePathFromResult(log.metadata?.result)
        || extractWorkspaceImagePathFromOutput(log.metadata?.output)
        || extractWorkspaceImagePathFromOutput(log.message)
        || null;
      const imageSrc =
        extractBase64Image(log.metadata?.result)
        || extractBase64Image(log.metadata?.output)
        || buildRunnerPreviewDownloadUrl(
          backendUrl,
          environmentId,
          resolvedImagePath
        );
      if (cancelled) {
        return;
      }
      setResolvedImageSrc(imageSrc);
      setImageResolutionComplete(true);
    }, 0);

    setResolvedImageSrc(null);
    setImageResolutionComplete(false);

    return () => {
      cancelled = true;
      globalThis.clearTimeout(timeoutId);
    };
  }, [backendUrl, environmentId, log]);

  return (
    <ImagePreviewLogCard
      icon={<Images className="tb-log-card-small-icon" strokeWidth={1.5} />}
      label="Image Generation"
      title={prompt}
      timeLabel={timeLabel}
      meta={isLoading ? <span className="tb-log-card-status">generating...</span> : null}
      body={
        isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">{String(log.metadata?.error || log.metadata?.output || "Image generation failed.")}</div>
        ) : !imageResolutionComplete ? (
          <div className="tb-log-image-grid">
            <ImagePreviewLoadingState />
          </div>
        ) : resolvedImageSrc ? (
          <div className="tb-log-image-grid">
            <RunnerImagePreviewSurface
              src={resolvedImageSrc}
              alt={prompt || "Generated image"}
              fetchHeaders={requestHeaders}
              loadStrategy="visible"
            />
          </div>
        ) : (
          <div className="tb-log-card-empty">{isLoading ? "Image generation in progress..." : "No image output available."}</div>
        )
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
};

function isBrowserSkillCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes(".claude/skills/browser/") || command.includes("browser.mjs");
}

function normalizeBrowserSkillWorkspacePath(filePath?: string | null): string | null {
  const normalized = String(filePath || "").trim().replace(/^\/workspace\//, "").replace(/^workspace\//, "");
  return normalized ? normalized : null;
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
  };
}

function formatBrowserSkillAction(action: string): string {
  return action
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function BrowserSkillLogBox({
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
  const command = log.metadata?.command || log.message || "";
  const output = typeof log.metadata?.output === "string" ? log.metadata.output : "";
  const parsed = useMemo(() => parseBrowserSkillOutput(output || log.message, command), [command, log.message, output]);
  const isRunning = log.metadata?.status === "running" || log.metadata?.status === "started";
  const imageSources = parsed.screenshotPaths
    .map((filePath) => buildRunnerPreviewDownloadUrl(backendUrl, environmentId, filePath))
    .filter((value): value is string => Boolean(value));

  return (
    <ImagePreviewLogCard
      icon={<Eye className="tb-log-card-small-icon" strokeWidth={1.5} />}
      label="Browser"
      title={parsed.title || formatBrowserSkillAction(parsed.action)}
      timeLabel={timeLabel}
      meta={isRunning ? <span className="tb-log-card-status">running...</span> : null}
      body={
        parsed.error && !isRunning ? (
          <div className="tb-log-card-state tb-log-card-state-error">{parsed.error}</div>
        ) : (
          <>
            {imageSources.length > 0 ? (
              <div className="tb-log-image-grid">
                {imageSources.slice(0, 2).map((src, index) => (
                  <RunnerImagePreviewSurface
                    key={`${src}-${index}`}
                    src={src}
                    alt={parsed.title || parsed.url || `Browser screenshot ${index + 1}`}
                    fetchHeaders={requestHeaders}
                    loadStrategy="visible"
                  />
                ))}
              </div>
            ) : null}
            <div className="tb-log-checklist">
              <div className="tb-log-checklist-item">
                <ChevronRight className="tb-log-checklist-icon" strokeWidth={1.5} />
                <span className="tb-log-checklist-text">{formatBrowserSkillAction(parsed.action)}</span>
              </div>
              {parsed.url ? (
                <div className="tb-log-checklist-item">
                  <ChevronRight className="tb-log-checklist-icon" strokeWidth={1.5} />
                  <span className="tb-log-checklist-text">{parsed.url}</span>
                </div>
              ) : null}
              {parsed.selector ? (
                <div className="tb-log-checklist-item">
                  <ChevronRight className="tb-log-checklist-icon" strokeWidth={1.5} />
                  <span className="tb-log-checklist-text">{parsed.selector}</span>
                </div>
              ) : null}
              {parsed.text ? (
                <div className="tb-log-checklist-item">
                  <ChevronRight className="tb-log-checklist-icon" strokeWidth={1.5} />
                  <span className="tb-log-checklist-text">{parsed.text}</span>
                </div>
              ) : null}
              {parsed.key ? (
                <div className="tb-log-checklist-item">
                  <ChevronRight className="tb-log-checklist-icon" strokeWidth={1.5} />
                  <span className="tb-log-checklist-text">Key: {parsed.key}</span>
                </div>
              ) : null}
              {typeof parsed.timeoutMs === "number" ? (
                <div className="tb-log-checklist-item">
                  <ChevronRight className="tb-log-checklist-icon" strokeWidth={1.5} />
                  <span className="tb-log-checklist-text">Timeout: {parsed.timeoutMs}ms</span>
                </div>
              ) : null}
            </div>
            {parsed.elements.length > 0 ? (
              <div className="tb-log-checklist">
                {parsed.elements.slice(0, 8).map((element, index) => (
                  <div key={`${element.selector || element.text || index}`} className="tb-log-checklist-item">
                    <ChevronRight className="tb-log-checklist-icon" strokeWidth={1.5} />
                    <span className="tb-log-checklist-text">
                      {element.text || element.tag || "Element"}
                      {element.selector ? ` -> ${element.selector}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            {parsed.textExcerpt ? (
              <div className="tb-log-file-preview-frame tb-log-terminal-frame">
                <div className="tb-log-file-preview-topbar">
                  <span className="tb-log-file-preview-language">Visible text</span>
                </div>
                <div className="tb-log-terminal-body">
                  <RunnerAnsiOutput content={parsed.textExcerpt.slice(0, 800)} />
                </div>
              </div>
            ) : null}
            {!parsed.error && !isRunning && imageSources.length === 0 && !parsed.url && parsed.elements.length === 0 ? (
              <div className="tb-log-card-empty">No browser output was parsed.</div>
            ) : null}
          </>
        )
      }
    />
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

function GenericCommandLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const command = stripRunnerSystemTags(log.metadata?.command || log.message || "");
  const output = stripRunnerSystemTags(String(log.metadata?.output || ""));
  const hasOutput = output.trim().length > 0;
  const exitCode = typeof log.metadata?.exitCode === "number" ? log.metadata.exitCode : null;
  const isError = exitCode !== null && exitCode !== 0;
  const shellCommand = formatShellCommandForDisplay(command);
  const commandLine = shellCommand ? `$ ${shellCommand}` : "";
  const commandDisplay = expanded || commandLine.length <= 700 ? commandLine : `${commandLine.slice(0, 700)}...`;
  const outputDisplay = expanded || output.length <= 700 ? output : `${output.slice(0, 700)}...`;
  const isSkillLaunchOutput = hasOutput && isSkillLaunchNotice(outputDisplay);
  const shouldShowExpandToggle = commandLine.length > 700 || output.length > 700;

  return (
    <div className="tb-log-card">
      <LogHeader
        icon={<Terminal className="tb-log-card-small-icon" strokeWidth={1.5} />}
        className={`tb-log-card-header-command${isError ? " is-error" : ""}`}
        label="Tool Call"
        title={exitCode !== null ? `exit ${exitCode}` : undefined}
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
              </div>
              <div className="tb-log-terminal-body">
                {command ? <RunnerShellCommandViewer command={commandDisplay} /> : null}
                {hasOutput ? (
                  isSkillLaunchOutput ? <RunnerTerminalStatus content={outputDisplay} /> : <RunnerAnsiOutput content={outputDisplay} isError={isError} />
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

export function RunnerWorkLogEntry({ log, timeLabel, backendUrl, environmentId, requestHeaders, onPreviewDocument }: RunnerWorkLogEntryProps) {
  const normalizedMessage = stripRunnerSystemTags(log.message || "").replace(/\s+/g, " ").trim().toLowerCase();

  if (normalizedMessage === "starting session" || normalizedMessage === "starting session...") {
    return null;
  }

  if (normalizedMessage === "thinking" || normalizedMessage === "thinking...") {
    return <InlineStatusLogBox label="Thinking..." icon={<Terminal className="tb-log-card-small-icon" strokeWidth={1.5} />} pending />;
  }

  if (log.eventType === "reasoning" || log.eventType === "planning" || log.isReasoning || log.isPlanning) {
    return <ReasoningLogBox log={log} />;
  }

  if ((log as RunnerLog & { isActionSummary?: boolean }).isActionSummary || log.eventType === "action_summary") {
    return <GenericTextLogBox log={log} timeLabel={timeLabel} label="Action Summary" icon={<Lightbulb className="tb-log-card-small-icon" strokeWidth={1.5} />} />;
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
    if (isReadFileCommand(command)) {
      return (
        <ReadFileLogBox
          log={log}
          timeLabel={timeLabel}
          backendUrl={backendUrl}
          environmentId={environmentId}
          requestHeaders={requestHeaders}
        />
      );
    }
    if (isListFilesCommand(command)) return <ListFilesLogBox log={log} timeLabel={timeLabel} />;
    if (isWriteFileCommand(command)) {
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
    return <GenericCommandLogBox log={log} timeLabel={timeLabel} />;
  }

  if (log.eventType === "mcp_tool_call") {
    if (isLikelyImageGenerationLog(log)) {
      return <ImageGenerationLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} />;
    }
    return <GenericMcpToolLogBox log={log} timeLabel={timeLabel} />;
  }

  if (log.eventType === "mcp_log") {
    return <GenericTextLogBox log={log} timeLabel={timeLabel} label="MCP Log" icon={<Globe className="tb-log-card-small-icon" strokeWidth={1.5} />} />;
  }

  if (log.eventType === "file_change") {
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
    return <GenericTextLogBox log={log} timeLabel={timeLabel} label="Error" icon={<AlertCircle className="tb-log-card-small-icon" strokeWidth={1.5} />} />;
  }

  return <GenericTextLogBox log={log} timeLabel={timeLabel} label="Log" icon={<FileText className="tb-log-card-small-icon" strokeWidth={1.5} />} />;
}

import { stripRunnerSystemTags } from "../../../../react/runner-markdown.js";

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

export interface RunnerHelpCommandDetails {
  resourceName: string;
  normalizedCommand: string;
}

export interface RunnerShellCommandSegments {
  header: string;
  body: string;
  footer: string;
}

export function isRunnerLogImageFilePath(
  filePath?: string | null,
): boolean {
  return /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(
    String(filePath || "").trim(),
  );
}

export function isRunnerLogVideoFilePath(
  filePath?: string | null,
): boolean {
  return /\.(mp4|mov|webm|mkv|avi)$/i.test(String(filePath || "").trim());
}

export function normalizeRunnerFilePath(
  filePath?: string | null,
): string | undefined {
  if (!filePath) return undefined;
  const trimmed = String(filePath).trim().replace(/^['"`]+|['"`]+$/g, "");
  return trimmed || undefined;
}

export function isRunnerNullDevicePath(
  filePath?: string | null,
): boolean {
  const normalized = normalizeRunnerFilePath(filePath);
  return normalized === "/dev/null" || normalized === "dev/null";
}

export function getFileName(filePath: string): string {
  const parts = filePath.split("/");
  return parts[parts.length - 1] || filePath;
}

export function formatBytes(bytes?: number): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) {
    return "";
  }
  if (bytes < 1) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function looksLikeMarkdown(
  content: string,
  filePath?: string,
): boolean {
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

export function extractWorkspacePathFromText(
  text?: string | null,
): string | null {
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

export function extractHeadTailReadPath(
  command?: string,
): string | null {
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

export function extractReadFilePath(command?: string): string | null {
  if (!command) return null;
  const headTailPath = extractHeadTailReadPath(command);
  if (headTailPath) {
    return headTailPath;
  }
  const patterns = [
    /(?:app-platform|computer-agents)(?:\.py)?\s+files\s+read\b[\s\S]*?\s--path\s+["']([^"']+)["']/i,
    /(?:app-platform|computer-agents)(?:\.py)?\s+files\s+read\b[\s\S]*?\s--path\s+([^\s|&;>"']+)/i,
    /(?:app-platform|computer-agents)(?:\.py)?\s+files\s+read\b\s+["']([^"'-][^"']*)["']/i,
    /(?:app-platform|computer-agents)(?:\.py)?\s+files\s+read\b\s+(?!-)([^\s|&;>"']+)/i,
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

export function stripShellInlineComments(command?: string): string {
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
    if (
      character === "#"
      && (index === 0 || /\s/.test(command[index - 1] || ""))
    ) {
      break;
    }
    result += character;
  }
  return result.trim();
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
      .replace(/\\"/g, "\"")
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\");
  }
  return null;
}

export function formatShellCommandForDisplay(command: string): string {
  const payload = extractShellPayload(command);
  return payload ? payload.trim() : command.trim();
}

function formatRunnerCommandResourceName(value: string): string {
  const basename = String(value || "")
    .split(/[\\/]/)
    .pop()
    ?.replace(/\.(?:py|mjs|cjs|js|ts|tsx|sh|bash|zsh)$/i, "")
    ?.trim() || "Command";
  return basename
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeRunnerHelpCommandCandidate(command: string): string {
  let normalized = formatShellCommandForDisplay(
    stripRunnerSystemTags(command || ""),
  )
    .trim()
    .replace(/^\$\s*/, "")
    .trim();
  let previous = "";
  while (previous !== normalized) {
    previous = normalized;
    normalized = normalized
      .replace(/\s+\d?>&\d+\s*$/g, "")
      .replace(/\s+\d?>\s*(?:"[^"]*"|'[^']*'|\S+)\s*$/g, "")
      .replace(/\s+2>\s*&1\s*$/g, "")
      .replace(/\s+1>\s*&2\s*$/g, "")
      .replace(/\s*[;&]\s*$/g, "")
      .trim();
  }
  return normalized;
}

export function tokenizeShellLikeArguments(value: string): string[] {
  const tokens: string[] = [];
  const tokenPattern = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|([^\s]+)/g;
  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(value)) !== null) {
    const rawToken = match[1] ?? match[2] ?? match[3] ?? "";
    const token = rawToken.replace(/\\(["'\\\s])/g, "$1").trim();
    if (token) {
      tokens.push(token);
    }
  }
  return tokens;
}

export function parseRunnerHelpCommandDetails(
  command: string,
): RunnerHelpCommandDetails | null {
  const normalizedCommand = normalizeRunnerHelpCommandCandidate(command);
  if (!/(?:^|\s)--help$/i.test(normalizedCommand)) {
    return null;
  }

  const skillMatch = normalizedCommand.match(
    /(?:^|\s)\S*\/\.claude\/skills\/([^/\s]+)\//i,
  );
  if (skillMatch?.[1]) {
    return {
      resourceName: formatRunnerCommandResourceName(skillMatch[1]),
      normalizedCommand,
    };
  }

  const tokens = tokenizeShellLikeArguments(normalizedCommand);
  const scriptToken = tokens.find((token) => (
    /\.(?:py|mjs|cjs|js|ts|tsx|sh|bash|zsh)$/i.test(token)
  ));
  const commandToken = scriptToken || tokens.find((token) => (
    !token.startsWith("-")
    && !/^(?:python3?|node|deno|bun|bash|sh|zsh|npx|pnpm|npm|yarn)$/i.test(
      token,
    )
  ));
  return {
    resourceName: formatRunnerCommandResourceName(commandToken || "Command"),
    normalizedCommand,
  };
}

function escapeRunnerHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function parseShellCommandSegments(
  command: string,
): RunnerShellCommandSegments | null {
  const trimmed = command.trimEnd();
  const commandWithPrompt = trimmed.startsWith("$") ? trimmed : `$ ${trimmed}`;
  const match = commandWithPrompt.match(
    /^(\$\s*[^\n]*<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?[^\n]*)(?:\n)([\s\S]*?)(?:\n\2)\s*$/,
  );
  if (!match?.[1] || !match[2]) return null;
  return {
    header: match[1],
    body: match[3] || "",
    footer: match[2],
  };
}

export function renderShellTokenizedHtml(command: string): string {
  const lines = command.split("\n");
  const tokenPattern = /(\s+|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\|\||&&|>>|<<-?|[|&;(){}]|[^\s"'|&;(){}]+)/g;

  return lines
    .map((line) => {
      const tokens = Array.from(line.matchAll(tokenPattern))
        .map((match) => match[0]);
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
        } else if (
          /^"(?:\\.|[^"])*"$/.test(token)
          || /^'(?:\\.|[^'])*'$/.test(token)
        ) {
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

export function extractQuotedArgument(
  command: string,
  flagPattern: string,
): string | null {
  const flagRegex = new RegExp(`(?:${flagPattern})\\s+`, "i");
  const match = command.match(flagRegex);
  if (!match || match.index === undefined) return null;
  const rest = command.slice(match.index + match[0].length);
  const first = rest[0];
  if (first === "\"" || first === "'") {
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

export function detectCodeLanguage(
  content: string,
  filePath?: string,
): string {
  const normalizedPath = normalizeRunnerFilePath(filePath);
  const lowerPath = (normalizedPath || "").toLowerCase();
  const extension = lowerPath.split(".").pop() || "";
  const mappedLanguage = RUNNER_LANGUAGE_BY_EXTENSION[extension];
  const trimmedContent = content.trimStart();

  if (mappedLanguage) return mappedLanguage;
  if (lowerPath.endsWith(".zshrc") || lowerPath.endsWith(".bashrc")) {
    return "shell";
  }
  if (/^#!.*\b(?:ba|z)?sh\b/m.test(content)) return "shell";
  if (/^#!.*\bpython(?:3(?:\.\d+)?)?\b/m.test(content)) return "python";
  if (
    /<!doctype html/i.test(trimmedContent)
    || /<(html|head|body)\b/i.test(trimmedContent)
  ) {
    return "html";
  }
  if (/^<\?xml\b/i.test(trimmedContent) || /<svg\b/i.test(trimmedContent)) {
    return "xml";
  }
  if (looksLikeMarkdown(content, normalizedPath)) return "markdown";
  if (/^[\s\n]*[{[]/.test(content)) return "json";
  if (
    /^\s*[\w"'`-]+\s*:\s*.+$/m.test(content)
    && !/[{};]/.test(content)
  ) {
    return "yaml";
  }
  if (
    /^\s*(?:from\s+\w+\s+import|import\s+\w+|def\s+\w+\(|class\s+\w+[:(])/m
      .test(content)
  ) {
    return "python";
  }
  if (
    /^\s*(?:export\s+|import\s.+from\s.+;?|const\s+|let\s+|var\s+|function\s+|class\s+)/m
      .test(content)
  ) {
    return "javascript";
  }
  if (
    /^\s*(?:[#.][\w-]+\s*\{|@media\b|@layer\b|@supports\b|--[\w-]+\s*:)/m
      .test(content)
  ) {
    return "css";
  }
  return "plaintext";
}

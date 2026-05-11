import { useMemo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { Components } from "react-markdown";
import { buildRunnerPreviewDownloadUrl } from "./runner-document-preview.js";
import { RunnerImagePreviewSurface } from "./runner-image-preview-surface.js";

const RUNNER_WORKSPACE_PATH_PROTOCOL = "runner-workspace:";
const RUNNER_WORKSPACE_PATH_MATCHER = /\/workspace\/\S+/g;
const RUNNER_WORKSPACE_PATH_DISALLOWED_PARENTS = new Set([
  "link",
  "linkReference",
  "definition",
  "inlineCode",
  "code",
  "image",
  "imageReference",
]);

interface RunnerMarkdownImageOptions {
  backendUrl?: string | null;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  baseWorkspacePath?: string | null;
  maxHeight?: number;
}

export function stripRunnerSystemTags(text: string): string {
  return text
    .replace(/<system>[\s\S]*?<\/system>/g, "")
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
    .replace(/<\/?(?:system|system-reminder)>/g, "")
    .replace(/<tool_use_error>([\s\S]*?)<\/tool_use_error>/g, "$1")
    .trim();
}

export function remarkSoftbreaksToBreaks() {
  return (tree: any) => {
    visit(tree, "text", (node: any, index?: number, parent?: any) => {
      if (!parent || typeof index !== "number") return;
      if (!node?.value || typeof node.value !== "string" || !node.value.includes("\n")) return;

      const parts = node.value.split("\n");
      const replacement: any[] = [];
      for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
        if (parts[partIndex]) replacement.push({ type: "text", value: parts[partIndex] });
        if (partIndex < parts.length - 1) replacement.push({ type: "break" });
      }

      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });
  };
}

function trimRunnerWorkspacePathMatch(rawValue: string): { path: string; trailing: string } {
  let path = String(rawValue || "");
  let trailing = "";
  while (path && /[.,!?;:)\]}]/.test(path.charAt(path.length - 1))) {
    trailing = path.charAt(path.length - 1) + trailing;
    path = path.slice(0, -1);
  }
  return { path, trailing };
}

function buildRunnerWorkspacePathNodes(value: string): any[] | null {
  if (!value.includes("/workspace/")) {
    return null;
  }

  const replacement: any[] = [];
  let cursor = 0;
  let didReplace = false;

  for (const match of value.matchAll(RUNNER_WORKSPACE_PATH_MATCHER)) {
    const startIndex = typeof match.index === "number" ? match.index : -1;
    if (startIndex < 0) {
      continue;
    }

    const rawMatch = String(match[0] || "");
    const { path, trailing } = trimRunnerWorkspacePathMatch(rawMatch);
    if (!path || path === "/workspace/") {
      continue;
    }

    if (startIndex > cursor) {
      replacement.push({ type: "text", value: value.slice(cursor, startIndex) });
    }

    replacement.push({
      type: "link",
      url: RUNNER_WORKSPACE_PATH_PROTOCOL + encodeURIComponent(path),
      children: [{ type: "text", value: path }],
    });
    if (trailing) {
      replacement.push({ type: "text", value: trailing });
    }
    cursor = startIndex + rawMatch.length;
    didReplace = true;
  }

  if (!didReplace) {
    return null;
  }

  if (cursor < value.length) {
    replacement.push({ type: "text", value: value.slice(cursor) });
  }

  return replacement;
}

export function remarkLinkRunnerWorkspacePaths() {
  return (tree: any) => {
    visit(tree, "text", (node: any, index?: number, parent?: any) => {
      if (!parent || typeof index !== "number") return;
      if (!node?.value || typeof node.value !== "string") return;
      if (RUNNER_WORKSPACE_PATH_DISALLOWED_PARENTS.has(String(parent.type || ""))) return;

      const replacement = buildRunnerWorkspacePathNodes(node.value);
      if (!replacement) {
        return;
      }

      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });
  };
}

function decodeRunnerWorkspacePathHref(href: string | undefined): string {
  const rawHref = String(href || "").trim();
  if (!rawHref.startsWith(RUNNER_WORKSPACE_PATH_PROTOCOL)) {
    return "";
  }

  try {
    return decodeURIComponent(rawHref.slice(RUNNER_WORKSPACE_PATH_PROTOCOL.length));
  } catch {
    return rawHref.slice(RUNNER_WORKSPACE_PATH_PROTOCOL.length);
  }
}

function extractRunnerMarkdownText(value: ReactNode): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => extractRunnerMarkdownText(entry)).join("");
  }
  if (value && typeof value === "object" && "props" in value) {
    return extractRunnerMarkdownText((value as { props?: { children?: ReactNode } }).props?.children ?? "");
  }
  return "";
}

function renderRunnerWorkspacePathNodes(
  text: string,
  onWorkspacePathClick: (path: string) => void,
  keyPrefix: string
): ReactNode[] | null {
  if (!text.includes("/workspace/")) {
    return null;
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let didReplace = false;

  for (const match of text.matchAll(RUNNER_WORKSPACE_PATH_MATCHER)) {
    const startIndex = typeof match.index === "number" ? match.index : -1;
    if (startIndex < 0) {
      continue;
    }

    const rawMatch = String(match[0] || "");
    const { path, trailing } = trimRunnerWorkspacePathMatch(rawMatch);
    if (!path || path === "/workspace/") {
      continue;
    }

    if (startIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, startIndex));
    }

    nodes.push(
      <a
        key={`${keyPrefix}-workspace-path-${startIndex}`}
        className="tb-message-markdown-link"
        href={RUNNER_WORKSPACE_PATH_PROTOCOL + encodeURIComponent(path)}
        onClick={(event) => {
          event.preventDefault();
          onWorkspacePathClick(path);
        }}
      >
        {path}
      </a>
    );
    if (trailing) {
      nodes.push(trailing);
    }

    lastIndex = startIndex + rawMatch.length;
    didReplace = true;
  }

  if (!didReplace) {
    return null;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function safeDecodeRunnerMarkdownUrl(value: string): string {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

function stripRunnerMarkdownUrlSuffix(value: string): string {
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  const suffixIndex = [queryIndex, hashIndex].filter((index) => index >= 0).sort((left, right) => left - right)[0];
  return suffixIndex >= 0 ? value.slice(0, suffixIndex) : value;
}

function normalizeRunnerMarkdownWorkspacePath(value: string): string {
  let normalized = safeDecodeRunnerMarkdownUrl(String(value || "").trim().replace(/^['"`]+|['"`]+$/g, ""));
  if (!normalized) {
    return "";
  }
  normalized = normalized.split("\\").join("/");
  normalized = normalized.replace(/^file:\/\//i, "");

  const embeddedWorkspaceMatch = normalized.match(/(?:^|:)\/workspace\/(.+)$/);
  if (embeddedWorkspaceMatch?.[1]) {
    normalized = embeddedWorkspaceMatch[1];
  } else {
    normalized = normalized.replace(/^\/+/, "");
    if (normalized.startsWith("workspace/")) {
      normalized = normalized.slice("workspace/".length);
    }
  }

  const segments: string[] = [];
  for (const segment of stripRunnerMarkdownUrlSuffix(normalized).split("/")) {
    if (!segment || segment === ".") {
      continue;
    }
    if (segment === "..") {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }
  return segments.join("/");
}

function parseRunnerMarkdownHtmlAttributes(value: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attributePattern = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>/]+))/g;
  let match: RegExpExecArray | null = null;
  while ((match = attributePattern.exec(value)) !== null) {
    const key = String(match[1] || "").toLowerCase();
    const attrValue = String(match[2] ?? match[3] ?? match[4] ?? "").trim();
    if (key) {
      attributes[key] = attrValue;
    }
  }
  return attributes;
}

function escapeRunnerMarkdownImageAlt(value: string): string {
  return String(value || "").replace(/[\[\]\n\r]/g, " ").replace(/\s+/g, " ").trim();
}

function formatRunnerMarkdownImageUrl(value: string): string {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }
  return /[\s()<>]/.test(normalized) ? `<${normalized.replace(/[<>]/g, "")}>` : normalized;
}

function normalizeRunnerMarkdownContent(content: string): string {
  return String(content || "").replace(/<img\b([^>]*)\/?>/gi, (match, rawAttributes) => {
    const attributes = parseRunnerMarkdownHtmlAttributes(String(rawAttributes || ""));
    const src = attributes.src || "";
    if (!src.trim()) {
      return match;
    }
    const alt = escapeRunnerMarkdownImageAlt(attributes.alt || attributes.title || "Image");
    const imageUrl = formatRunnerMarkdownImageUrl(src);
    return imageUrl ? `![${alt || "Image"}](${imageUrl})` : match;
  });
}

function getRunnerMarkdownWorkspaceDirectory(value?: string | null): string {
  const normalized = normalizeRunnerMarkdownWorkspacePath(String(value || ""));
  if (!normalized) {
    return "";
  }
  const segments = normalized.split("/").filter(Boolean);
  segments.pop();
  return segments.join("/");
}

function shouldTreatRunnerMarkdownImageAsWorkspaceRootRelative(src: string, baseDirectory: string): boolean {
  const normalizedSrc = String(src || "").trim().replace(/^\.?\//, "");
  if (!normalizedSrc || normalizedSrc.startsWith("../")) {
    return false;
  }
  const firstSegment = normalizedSrc.split("/").filter(Boolean)[0] || "";
  if (!firstSegment) {
    return false;
  }
  if (["research", "generated_images", "output", "outputs", "artifacts", "images", "img"].includes(firstSegment)) {
    return true;
  }
  const baseFirstSegment = baseDirectory.split("/").filter(Boolean)[0] || "";
  return Boolean(baseFirstSegment && firstSegment === baseFirstSegment);
}

function resolveRunnerMarkdownImageDownloadUrl(src: string | undefined, options?: RunnerMarkdownImageOptions): string | null {
  const rawSrc = String(src || "").trim();
  if (!rawSrc || !options?.backendUrl || !options.environmentId) {
    return null;
  }

  if (/^(?:data:|blob:|https?:\/\/|\/\/)/i.test(rawSrc) || rawSrc.startsWith("#") || rawSrc.startsWith("/api/")) {
    return null;
  }

  const sourceWithoutSuffix = stripRunnerMarkdownUrlSuffix(rawSrc);
  const decodedSource = safeDecodeRunnerMarkdownUrl(sourceWithoutSuffix).split("\\").join("/");
  const isWorkspaceAbsolute =
    decodedSource.startsWith("/workspace/") ||
    decodedSource.startsWith("workspace/") ||
    decodedSource.startsWith("file:///workspace/");
  const isRootRelativeWorkspacePath = decodedSource.startsWith("/") && !decodedSource.startsWith("/api/");
  const baseDirectory = getRunnerMarkdownWorkspaceDirectory(options.baseWorkspacePath);
  const isLikelyWorkspaceRootRelative = !isWorkspaceAbsolute && !isRootRelativeWorkspacePath && shouldTreatRunnerMarkdownImageAsWorkspaceRootRelative(decodedSource, baseDirectory);
  const candidatePath =
    isWorkspaceAbsolute || isRootRelativeWorkspacePath || isLikelyWorkspaceRootRelative
      ? normalizeRunnerMarkdownWorkspacePath(decodedSource)
      : normalizeRunnerMarkdownWorkspacePath([baseDirectory, decodedSource].filter(Boolean).join("/"));

  if (!candidatePath) {
    return null;
  }

  return buildRunnerPreviewDownloadUrl(options.backendUrl, options.environmentId, `/workspace/${candidatePath}`);
}

function createRunnerMarkdownComponents(
  onWorkspacePathClick?: (path: string) => void,
  imageOptions?: RunnerMarkdownImageOptions
): Components {
  return {
    ...runnerMarkdownComponents,
    a: ({ node, href, ...props }) => {
      const workspacePath = decodeRunnerWorkspacePathHref(href);
      if (workspacePath && onWorkspacePathClick) {
        return (
          <a
            className="tb-message-markdown-link"
            href={href}
            onClick={(event) => {
              event.preventDefault();
              onWorkspacePathClick(workspacePath);
            }}
            {...props}
          />
        );
      }

      return <a className="tb-message-markdown-link" target="_blank" rel="noopener noreferrer" href={href} {...props} />;
    },
    code: ({ node, className, children, ...props }) => {
      const isInline = !className;
      if (isInline) {
        const inlineText = extractRunnerMarkdownText(children);
        const workspacePathNodes =
          typeof onWorkspacePathClick === "function"
            ? renderRunnerWorkspacePathNodes(inlineText, onWorkspacePathClick, "inline-code")
            : null;

        return (
          <code className="tb-message-markdown-inline-code" {...props}>
            {workspacePathNodes || children}
          </code>
        );
      }

      return <code className="tb-message-markdown-code" {...props}>{children}</code>;
    },
    img: ({ node, src, alt, ...props }) => {
      const workspaceImageSrc = resolveRunnerMarkdownImageDownloadUrl(src, imageOptions);
      if (workspaceImageSrc) {
        return (
          <RunnerImagePreviewSurface
            src={workspaceImageSrc}
            alt={typeof alt === "string" ? alt : "Preview image"}
            className="tb-message-markdown-image"
            fetchHeaders={imageOptions?.requestHeaders}
            loadStrategy="visible"
            maxHeight={imageOptions?.maxHeight ?? 300}
          />
        );
      }

      return <img className="tb-message-markdown-image" src={src} alt={alt} {...props} />;
    },
  };
}

export const runnerMarkdownComponents: Components = {
  p: ({ node, ...props }) => <p className="tb-message-markdown-paragraph" {...props} />,
  strong: ({ node, ...props }) => <strong className="tb-message-markdown-strong" {...props} />,
  em: ({ node, ...props }) => <em className="tb-message-markdown-em" {...props} />,
  code: ({ node, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return <code className="tb-message-markdown-inline-code" {...props} />;
    }
    return <code className="tb-message-markdown-code" {...props} />;
  },
  pre: ({ node, ...props }) => <pre className="tb-message-markdown-pre" {...props} />,
  ul: ({ node, ...props }) => <ul className="tb-message-markdown-list" {...props} />,
  ol: ({ node, ...props }) => <ol className="tb-message-markdown-list tb-message-markdown-list-ordered" {...props} />,
  li: ({ node, ...props }) => <li className="tb-message-markdown-list-item" {...props} />,
  h1: ({ node, ...props }) => <h1 className="tb-message-markdown-heading" {...props} />,
  h2: ({ node, ...props }) => <h2 className="tb-message-markdown-heading" {...props} />,
  h3: ({ node, ...props }) => <h3 className="tb-message-markdown-heading" {...props} />,
  h4: ({ node, ...props }) => <h4 className="tb-message-markdown-heading" {...props} />,
  a: ({ node, href, ...props }) => <a className="tb-message-markdown-link" target="_blank" rel="noopener noreferrer" href={href} {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="tb-message-markdown-quote" {...props} />,
  table: ({ node, ...props }) => (
    <div className="tb-message-markdown-table-wrap">
      <table className="tb-message-markdown-table" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="tb-message-markdown-thead" {...props} />,
  tbody: ({ node, ...props }) => <tbody {...props} />,
  tr: ({ node, ...props }) => <tr className="tb-message-markdown-row" {...props} />,
  th: ({ node, ...props }) => <th className="tb-message-markdown-th" {...props} />,
  td: ({ node, ...props }) => <td className="tb-message-markdown-td" {...props} />,
  hr: ({ node, ...props }) => <hr className="tb-message-markdown-rule" {...props} />,
  img: ({ node, ...props }) => <img className="tb-message-markdown-image" {...props} />,
};

export interface RunnerMarkdownProps {
  content: string;
  className?: string;
  softBreaks?: boolean;
  disallowHeadings?: boolean;
  onWorkspacePathClick?: (path: string) => void;
  imageBackendUrl?: string | null;
  imageEnvironmentId?: string | null;
  imageRequestHeaders?: HeadersInit;
  imageBaseWorkspacePath?: string | null;
  imageMaxHeight?: number;
}

export function RunnerMarkdown({
  content,
  className,
  softBreaks = false,
  disallowHeadings = false,
  onWorkspacePathClick,
  imageBackendUrl,
  imageEnvironmentId,
  imageRequestHeaders,
  imageBaseWorkspacePath,
  imageMaxHeight,
}: RunnerMarkdownProps) {
  const normalizedContent = useMemo(() => normalizeRunnerMarkdownContent(content), [content]);
  const imageRequestHeadersSignature = useMemo(() => {
    if (!imageRequestHeaders) {
      return "";
    }
    const headers = new Headers(imageRequestHeaders);
    return JSON.stringify(Array.from(headers.entries()).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));
  }, [imageRequestHeaders]);
  const remarkPlugins = useMemo(
    () => [
      remarkGfm,
      ...(softBreaks ? [remarkSoftbreaksToBreaks] : []),
      ...(onWorkspacePathClick ? [remarkLinkRunnerWorkspacePaths] : []),
    ],
    [onWorkspacePathClick, softBreaks]
  );
  const components = useMemo(
    () => createRunnerMarkdownComponents(onWorkspacePathClick, {
      backendUrl: imageBackendUrl,
      environmentId: imageEnvironmentId,
      requestHeaders: imageRequestHeaders,
      baseWorkspacePath: imageBaseWorkspacePath,
      maxHeight: imageMaxHeight,
    }),
    [
      imageBackendUrl,
      imageBaseWorkspacePath,
      imageEnvironmentId,
      imageMaxHeight,
      imageRequestHeadersSignature,
      onWorkspacePathClick,
    ]
  );

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        disallowedElements={disallowHeadings ? ["h1", "h2", "h3", "h4", "h5", "h6"] : undefined}
        unwrapDisallowed={disallowHeadings}
        components={components}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}

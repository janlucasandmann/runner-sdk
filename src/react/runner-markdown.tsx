import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { Components } from "react-markdown";

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

function createRunnerMarkdownComponents(onWorkspacePathClick?: (path: string) => void): Components {
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
}

export function RunnerMarkdown({
  content,
  className,
  softBreaks = false,
  disallowHeadings = false,
  onWorkspacePathClick,
}: RunnerMarkdownProps) {
  const remarkPlugins = [
    remarkGfm,
    ...(softBreaks ? [remarkSoftbreaksToBreaks] : []),
    ...(onWorkspacePathClick ? [remarkLinkRunnerWorkspacePaths] : []),
  ];

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        disallowedElements={disallowHeadings ? ["h1", "h2", "h3", "h4", "h5", "h6"] : undefined}
        unwrapDisallowed={disallowHeadings}
        components={createRunnerMarkdownComponents(onWorkspacePathClick)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

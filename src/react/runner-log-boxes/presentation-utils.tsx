import type { CSSProperties, ReactNode } from "react";

import { stripRunnerSystemTags } from "../runner-markdown.js";

const RUNNER_DETAIL_DRAWER_AUTO_SCROLL_THRESHOLD_PX = 24;
const RUNNER_WORKSPACE_PATH_MATCHER = /\/workspace\/\S+/g;

export function isRunnerDetailDrawerPinnedToBottom(
  element: HTMLDivElement,
): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight
    <= RUNNER_DETAIL_DRAWER_AUTO_SCROLL_THRESHOLD_PX;
}

export function sanitizeSubagentDisplayText(
  value: string | null | undefined,
): string {
  return stripRunnerSystemTags(String(value || ""))
    .replace(/^\s*agentId:\s.*$/gim, "")
    .replace(/<usage>[\s\S]*?<\/usage>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function truncateSubagentPreviewText(
  value: string | null | undefined,
  maxLength = 300,
): string {
  const cleaned = sanitizeSubagentDisplayText(value);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, maxLength).trimEnd()}...`;
}

function trimRunnerWorkspacePathMatch(
  rawValue: string,
): { path: string; trailing: string } {
  let boundaryIndex = rawValue.length;
  while (
    boundaryIndex > 0
    && /[),.;:!?}\]"']/.test(rawValue.charAt(boundaryIndex - 1))
  ) {
    boundaryIndex -= 1;
  }
  return {
    path: rawValue.slice(0, boundaryIndex),
    trailing: rawValue.slice(boundaryIndex),
  };
}

export function renderTextWithWorkspacePathLinks(
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
  },
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
        </a>,
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

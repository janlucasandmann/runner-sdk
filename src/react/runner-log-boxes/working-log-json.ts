import { stripRunnerSystemTags } from "../runner-markdown.js";

export type RunnerWorkingLogJsonValue = Record<string, unknown> | unknown[];

export type RunnerWorkingLogJsonSegment =
  | { kind: "markdown"; content: string; id: string }
  | { kind: "json"; value: RunnerWorkingLogJsonValue; id: string; title: string };

export function isRunnerWorkingLogPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isRunnerWorkingLogJsonValue(
  value: unknown,
): value is RunnerWorkingLogJsonValue {
  return Array.isArray(value) || isRunnerWorkingLogPlainObject(value);
}

function stripRunnerWorkingLogJsonFence(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^```(?:json|jsonc)?\s*\n([\s\S]*?)\n```$/i);
  return match?.[1]?.trim() || trimmed;
}

function parseRunnerWorkingLogJsonValue(
  value: string,
): RunnerWorkingLogJsonValue | null {
  const candidate = stripRunnerWorkingLogJsonFence(value);
  if (!candidate.startsWith("{") && !candidate.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(candidate);
    return isRunnerWorkingLogJsonValue(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function findRunnerWorkingLogBalancedJsonEnd(
  value: string,
  startIndex: number,
): number | null {
  const opener = value.charAt(startIndex);
  if (opener !== "{" && opener !== "[") return null;

  const stack: string[] = [opener === "{" ? "}" : "]"];
  let inString = false;
  let escaped = false;

  for (let index = startIndex + 1; index < value.length; index += 1) {
    const char = value.charAt(index);

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      stack.push(char === "{" ? "}" : "]");
      continue;
    }

    if (char === "}" || char === "]") {
      if (stack[stack.length - 1] !== char) {
        return null;
      }
      stack.pop();
      if (!stack.length) {
        return index + 1;
      }
    }
  }

  return null;
}

function formatRunnerWorkingLogJsonTitleLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferRunnerWorkingLogInlineJsonTitle(
  prefix: string,
  fallbackTitle: string,
): string {
  const tail = prefix.slice(-96);
  const match = tail.match(/([A-Za-z][A-Za-z0-9 _/-]{0,40})\s*:\s*$/);
  const label = match?.[1]?.trim();
  if (!label) return fallbackTitle;
  const normalizedLabel = formatRunnerWorkingLogJsonTitleLabel(label);
  return normalizedLabel || fallbackTitle;
}

function splitRunnerWorkingLogInlineJsonContent(
  content: string,
  title = "JSON",
): RunnerWorkingLogJsonSegment[] {
  const normalizedContent = stripRunnerSystemTags(content || "").trim();
  if (!normalizedContent) return [];

  const segments: RunnerWorkingLogJsonSegment[] = [];
  let cursor = 0;
  let jsonIndex = 0;

  for (let index = 0; index < normalizedContent.length; index += 1) {
    const char = normalizedContent.charAt(index);
    if (char !== "{" && char !== "[") continue;

    const endIndex = findRunnerWorkingLogBalancedJsonEnd(normalizedContent, index);
    if (!endIndex) continue;

    const candidate = normalizedContent.slice(index, endIndex);
    const jsonValue = parseRunnerWorkingLogJsonValue(candidate);
    if (!jsonValue) continue;

    const before = normalizedContent.slice(cursor, index).trim();
    if (before) {
      segments.push({
        kind: "markdown",
        content: before,
        id: `markdown-${segments.length}`,
      });
    }

    segments.push({
      kind: "json",
      value: jsonValue,
      id: `json-${jsonIndex}`,
      title: inferRunnerWorkingLogInlineJsonTitle(
        normalizedContent.slice(cursor, index),
        title,
      ),
    });
    jsonIndex += 1;
    cursor = endIndex;
    index = endIndex - 1;
  }

  if (!segments.length) return [];

  const after = normalizedContent.slice(cursor).trim();
  if (after) {
    segments.push({
      kind: "markdown",
      content: after,
      id: `markdown-${segments.length}`,
    });
  }

  return segments;
}

export function formatRunnerWorkingLogJsonRaw(
  value: RunnerWorkingLogJsonValue,
): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
}

export function getRunnerWorkingLogJsonType(
  value: unknown,
): "array" | "object" | "null" | "boolean" | "number" | "string" {
  if (Array.isArray(value)) return "array";
  if (isRunnerWorkingLogPlainObject(value)) return "object";
  if (value === null) return "null";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  return "string";
}

export function formatRunnerWorkingLogJsonPreview(value: unknown): string {
  const type = getRunnerWorkingLogJsonType(value);
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

export function splitRunnerWorkingLogJsonContent(
  content: string,
  title = "JSON",
): RunnerWorkingLogJsonSegment[] {
  const normalizedContent = stripRunnerSystemTags(content || "").trim();
  if (!normalizedContent) return [];

  const pureJson = parseRunnerWorkingLogJsonValue(normalizedContent);
  if (pureJson) {
    return [{ kind: "json", value: pureJson, id: "json-0", title }];
  }

  const segments: RunnerWorkingLogJsonSegment[] = [];
  const fenceRegex = /```([^\n`]*)\n([\s\S]*?)```/g;
  let cursor = 0;
  let jsonIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(normalizedContent))) {
    const fullMatch = match[0] || "";
    const language = String(match[1] || "").trim().toLowerCase();
    const body = String(match[2] || "").trim();
    const startsAt = match.index;
    const jsonValue = (!language || language === "json" || language === "jsonc")
      ? parseRunnerWorkingLogJsonValue(body)
      : null;

    if (!jsonValue) {
      continue;
    }

    const before = normalizedContent.slice(cursor, startsAt).trim();
    if (before) {
      segments.push({
        kind: "markdown",
        content: before,
        id: `markdown-${segments.length}`,
      });
    }
    segments.push({
      kind: "json",
      value: jsonValue,
      id: `json-${jsonIndex}`,
      title,
    });
    jsonIndex += 1;
    cursor = startsAt + fullMatch.length;
  }

  if (!segments.length) {
    const inlineJsonSegments = splitRunnerWorkingLogInlineJsonContent(
      normalizedContent,
      title,
    );
    return inlineJsonSegments.length > 0
      ? inlineJsonSegments
      : [{
          kind: "markdown",
          content: normalizedContent,
          id: "markdown-0",
        }];
  }

  const after = normalizedContent.slice(cursor).trim();
  if (after) {
    segments.push({
      kind: "markdown",
      content: after,
      id: `markdown-${segments.length}`,
    });
  }

  return segments;
}

export function hasRunnerWorkingLogJsonSegments(
  segments: RunnerWorkingLogJsonSegment[],
): boolean {
  return segments.some((segment) => segment.kind === "json");
}

export function findRunnerWorkingLogJsonSegments(
  values: Array<string | null | undefined>,
  title = "JSON",
): RunnerWorkingLogJsonSegment[] {
  for (const value of values) {
    const candidate = String(value || "").trim();
    if (!candidate) continue;
    const segments = splitRunnerWorkingLogJsonContent(candidate, title);
    if (hasRunnerWorkingLogJsonSegments(segments)) {
      return segments;
    }
  }
  return [];
}

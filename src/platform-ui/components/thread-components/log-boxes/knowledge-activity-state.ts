import type { RunnerLog } from "../../../../types.js";
import { parseStructuredCommandExecutionOutput } from "./structured-command-output.js";

export interface RunnerKnowledgeActivityDetails {
  libraryId: string;
  libraryName: string;
  operation: "read" | "update";
  readOperation?: "get" | "list";
}

export interface RunnerKnowledgeReadDetails {
  libraryId: string;
  libraryName: string;
  operation: "get" | "list";
}

function decodeCommandArgument(value: string): string {
  const normalized = String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/[;&|]+$/, "");
  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

function extractKnowledgeLibraryName(value: unknown, depth = 0): string {
  if (!value || depth > 4) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("[")))
      return "";
    try {
      return extractKnowledgeLibraryName(JSON.parse(trimmed), depth + 1);
    } catch {
      return "";
    }
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const name = extractKnowledgeLibraryName(item, depth + 1);
      if (name) return name;
    }
    return "";
  }
  if (typeof value !== "object") return "";
  const source = value as Record<string, unknown>;
  for (const key of ["libraryName", "library_name"]) {
    const candidate = source[key];
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
  }
  const candidateId = String(
    source.id || source.libraryId || source.library_id || "",
  ).trim();
  if (
    (candidateId.startsWith("knowledge_library_") ||
      source.object === "knowledge_library") &&
    typeof source.name === "string" &&
    source.name.trim()
  ) {
    return source.name.trim();
  }
  for (const key of [
    "library",
    "knowledgeLibrary",
    "knowledge_library",
    "data",
    "result",
    "payload",
    "stdout",
    "output",
  ]) {
    const name = extractKnowledgeLibraryName(source[key], depth + 1);
    if (name) return name;
  }
  return "";
}

function isSuccessfulKnowledgeActivity(log: RunnerLog): boolean {
  if (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0)
    return false;
  const structuredOutput = parseStructuredCommandExecutionOutput(
    log.metadata?.output,
  );
  return (
    !structuredOutput?.interrupted &&
    structuredOutput?.returnCodeInterpretation !== "timeout"
  );
}

function extractFlagArgument(command: string, flag: string): string {
  const escapedFlag = flag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = command.match(
    new RegExp(
      `${escapedFlag}(?:=|\\s+)(?:"([^"]+)"|'([^']+)'|([^\\s;&|]+))`,
      "i",
    ),
  );
  return decodeCommandArgument(match?.[1] || match?.[2] || match?.[3] || "");
}

function extractScopedKnowledgeLibraryId(command: string): string {
  const isLibraryList =
    /(?:^|\s)(?:[^\s;&|]*\/)?computer-agents(?:\.py)?\s+knowledge\s+list\b/i.test(
      command,
    );
  if (!isLibraryList) return "";

  const candidateIds = Array.from(
    command.matchAll(/\bknowledge_[A-Za-z0-9_-]+\b/g),
    (match) => match[0],
  ).filter(
    (candidate) =>
      !/^knowledge_(?:document|proposal|revision|version)_/i.test(candidate),
  );
  const uniqueIds = Array.from(new Set(candidateIds));
  return uniqueIds.length === 1 ? uniqueIds[0] : "";
}

/** Recognizes successful Knowledge reads and library-changing document proposals. */
export function parseRunnerKnowledgeActivityDetails(
  log: RunnerLog,
): RunnerKnowledgeActivityDetails | null {
  const command = String(log.metadata?.command || log.message || "").trim();
  if (!command || !isSuccessfulKnowledgeActivity(log)) return null;

  const cliMutationMatch = command.match(
    /(?:^|\s)(?:[^\s;&|]*\/)?computer-agents(?:\.py)?\s+knowledge\s+documents\s+(propose|create|update|archive|delete)\s+([^\s;&|]+)/i,
  );
  const cliLibraryMutationMatch = command.match(
    /(?:^|\s)(?:[^\s;&|]*\/)?computer-agents(?:\.py)?\s+knowledge\s+(update|publish)\s+([^\s;&|]+)/i,
  );
  const apiMatch = command.match(
    /(?:(?:\/api\/real|\/v1))?\/knowledge\/([^\s/?'";&|]+)(?:\/(documents|proposals|versions)(?:\/[^\s?'";&|]+)?)?/i,
  );
  const apiMethod = command.match(
    /(?:-X|--request|\bmethod\s*[:=])\s*["']?(POST|PUT|PATCH|DELETE)\b/i,
  )?.[1];
  const hasProposalOperation =
    /--operation(?:=|\s+)(?:create_document|update_document|archive_document)\b/i.test(
      command,
    );
  const isApiMutation = Boolean(
    apiMatch &&
    (apiMatch[2]?.toLowerCase() === "proposals" ||
      apiMethod ||
      hasProposalOperation),
  );
  const mutationLibraryId = decodeCommandArgument(
    cliMutationMatch?.[2] ||
      cliLibraryMutationMatch?.[2] ||
      (isApiMutation ? apiMatch?.[1] : "") ||
      extractFlagArgument(command, "--library-id"),
  );
  if (mutationLibraryId) {
    return {
      libraryId: mutationLibraryId,
      libraryName: extractKnowledgeLibraryName(log.metadata?.output),
      operation: "update",
    };
  }

  const cliReadMatch = command.match(
    /(?:^|\s)(?:[^\s;&|]*\/)?computer-agents(?:\.py)?\s+knowledge\s+documents\s+(list|get)\s+([^\s;&|]+)/i,
  );
  const cliLibraryReadMatch = command.match(
    /(?:^|\s)(?:[^\s;&|]*\/)?computer-agents(?:\.py)?\s+knowledge\s+get\s+([^\s;&|]+)/i,
  );
  const scopedLibraryListId = extractScopedKnowledgeLibraryId(command);
  const cliVersionReadMatch = command.match(
    /(?:^|\s)(?:[^\s;&|]*\/)?computer-agents(?:\.py)?\s+knowledge\s+versions\s+([^\s;&|]+)\s+(list|get)\b/i,
  );
  const isApiDocumentRead = Boolean(
    apiMatch?.[2]?.toLowerCase() === "documents",
  );
  const isApiVersionRead = Boolean(apiMatch?.[2]?.toLowerCase() === "versions");
  const isApiLibraryRead = Boolean(apiMatch && !apiMatch[2] && !isApiMutation);
  const readOperation =
    cliReadMatch?.[1]?.toLowerCase() === "get" ||
    Boolean(cliLibraryReadMatch) ||
    cliVersionReadMatch?.[2]?.toLowerCase() === "get" ||
    isApiLibraryRead ||
    ((isApiDocumentRead || isApiVersionRead) &&
      /\/(?:documents|versions)\/[^\s?'";&|]+/i.test(command))
      ? "get"
      : cliReadMatch?.[1]?.toLowerCase() === "list" ||
          Boolean(scopedLibraryListId) ||
          cliVersionReadMatch?.[2]?.toLowerCase() === "list" ||
          isApiDocumentRead ||
          isApiVersionRead
        ? "list"
        : null;
  const readLibraryId = decodeCommandArgument(
    cliReadMatch?.[2] ||
      cliLibraryReadMatch?.[1] ||
      scopedLibraryListId ||
      cliVersionReadMatch?.[1] ||
      (readOperation ? apiMatch?.[1] : "") ||
      "",
  );
  if (!readOperation || !readLibraryId) return null;

  return {
    libraryId: readLibraryId,
    libraryName: extractKnowledgeLibraryName(log.metadata?.output),
    operation: "read",
    readOperation,
  };
}

/**
 * Recognizes the access-checked Knowledge CLI/API reads injected into agent
 * threads. Mutations intentionally do not match: they retain their own audit
 * presentation instead of being mislabeled as reads.
 */
export function parseRunnerKnowledgeReadDetails(
  log: RunnerLog,
): RunnerKnowledgeReadDetails | null {
  const details = parseRunnerKnowledgeActivityDetails(log);
  if (!details || details.operation !== "read" || !details.readOperation)
    return null;
  return {
    libraryId: details.libraryId,
    libraryName: details.libraryName,
    operation: details.readOperation,
  };
}

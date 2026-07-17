import type {
  RunnerLog,
  RunnerThreadStep,
  RunnerThreadStepDiffResult,
} from "../../../types.js";
import { normalizeRunnerPreviewPath } from "../../runner-document-preview.js";
import { formatElapsedDurationLabel } from "../time-utils.js";
import {
  isInternalFileChangeLog,
  isInternalTurnPreviewPath,
  isRunnerHydratedNullDevicePath,
  normalizeRunnerHydratedFilePath,
} from "./file-paths.js";
import { isRunnerHydratedVideoFilePath } from "./log-normalization.js";
import type { RunnerParsedThreadStep, RunnerThreadDiffEntry } from "./types.js";

export function parseThreadDiffEntries(value: unknown): RunnerThreadDiffEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) =>
      entry && typeof entry === "object" ? (entry as Record<string, unknown>) : null,
    )
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map((entry) => ({
      path: typeof entry.path === "string" ? entry.path : undefined,
      additions: typeof entry.additions === "number" ? entry.additions : undefined,
      deletions: typeof entry.deletions === "number" ? entry.deletions : undefined,
      changes: typeof entry.changes === "string" ? entry.changes : undefined,
      diff: typeof entry.diff === "string" ? entry.diff : undefined,
      createdAt: typeof entry.createdAt === "string" ? entry.createdAt : undefined,
    }))
    .filter((entry) => typeof entry.path === "string" && entry.path.trim().length > 0);
}

export function parseThreadSteps(value: unknown): RunnerParsedThreadStep[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) =>
      entry && typeof entry === "object" ? (entry as RunnerThreadStep) : null,
    )
    .filter(
      (entry): entry is RunnerThreadStep =>
        Boolean(entry) && typeof entry?.id === "string",
    )
    .map((entry) => ({
      id: entry.id,
      sequence: typeof entry.sequence === "number" ? entry.sequence : 0,
      stepKind: typeof entry.stepKind === "string" ? entry.stepKind : "",
      eventType: typeof entry.eventType === "string" ? entry.eventType : null,
      title: typeof entry.title === "string" ? entry.title : "",
      createdAt: typeof entry.createdAt === "string" ? entry.createdAt : "",
      metadata:
        entry.metadata && typeof entry.metadata === "object" ? entry.metadata : null,
    }));
}

function formatRelativeLogTime(createdAt: string, startedAtMs: number | null): string {
  const createdAtMs = Date.parse(createdAt);
  if (
    !Number.isFinite(createdAtMs) ||
    startedAtMs === null ||
    !Number.isFinite(startedAtMs)
  ) {
    return "";
  }
  return formatElapsedDurationLabel(Math.max(0, Math.round((createdAtMs - startedAtMs) / 1000)));
}

function inferChangeKind(entry: RunnerThreadDiffEntry): "created" | "modified" | "deleted" {
  const diffText = entry.diff || entry.changes || "";
  if (/^---\s+\/dev\/null\b/m.test(diffText)) {
    return "created";
  }
  if (/^\+\+\+\s+\/dev\/null\b/m.test(diffText)) {
    return "deleted";
  }
  return "modified";
}

function countDiffLineStats(diffText: string): { additions: number; deletions: number } {
  let additions = 0;
  let deletions = 0;
  for (const line of diffText.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) {
      continue;
    }
    if (line.startsWith("+")) {
      additions += 1;
    } else if (line.startsWith("-")) {
      deletions += 1;
    }
  }
  return { additions, deletions };
}

export function parseHydratedStepDiffEntries(
  diffText: string,
  createdAt?: string,
): RunnerThreadDiffEntry[] {
  if (typeof diffText !== "string" || diffText.trim().length === 0) {
    return [];
  }

  const sections = diffText
    .split(/^diff --git\s+/m)
    .map((section) => section.trim())
    .filter(Boolean)
    .map((section) => (section.startsWith("a/") ? `diff --git ${section}` : section));

  return sections.flatMap((section) => {
    const plusPath = /^\+\+\+\s+([^\n]+)$/m.exec(section)?.[1]?.trim() || "";
    const minusPath = /^---\s+([^\n]+)$/m.exec(section)?.[1]?.trim() || "";
    const selectedPath = plusPath !== "/dev/null" ? plusPath : minusPath;
    if (isRunnerHydratedNullDevicePath(selectedPath)) {
      return [];
    }
    const path = selectedPath.replace(/^[ab]\//, "").trim();
    if (!path) {
      return [];
    }
    const { additions, deletions } = countDiffLineStats(section);
    return [{ path, additions, deletions, diff: section, createdAt }];
  });
}

function isGeneratedMediaPath(value: unknown): boolean {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }
  const normalizedPath = normalizeRunnerHydratedFilePath(value);
  return /\.(?:png|jpe?g|gif|webp|svg|avif|bmp|mp4|mov|webm|mkv|avi)$/i.test(
    normalizedPath.split(/[?#]/)[0] || "",
  );
}

export async function fetchHydratedStepDiffEntries(params: {
  backendUrl: string;
  threadId: string;
  headers: Headers;
  steps: RunnerParsedThreadStep[];
}): Promise<RunnerThreadDiffEntry[]> {
  const candidateSteps = params.steps.filter((step) => {
    if (!step.id.trim()) {
      return false;
    }
    const metadata = step.metadata || {};
    const hasDiffableFilePaths =
      Array.isArray(metadata.filePaths) &&
      metadata.filePaths.some(
        (value) =>
          typeof value === "string" &&
          value.trim().length > 0 &&
          !isGeneratedMediaPath(value),
      );
    const hasInlineDiffs = Boolean(metadata.diffs && typeof metadata.diffs === "object");
    const stepKind = String(step.stepKind || "").toLowerCase();
    const eventType = String(step.eventType || "").toLowerCase();
    return (
      hasDiffableFilePaths ||
      hasInlineDiffs ||
      stepKind === "file_change" ||
      eventType === "file_change"
    );
  });
  if (candidateSteps.length === 0) {
    return [];
  }

  const entries = await Promise.all(
    candidateSteps.map(async (step) => {
      try {
        const response = await fetch(
          `${params.backendUrl}/threads/${encodeURIComponent(params.threadId)}/steps/${encodeURIComponent(step.id)}/diff`,
          { method: "GET", headers: params.headers },
        );
        if (!response.ok) {
          return [];
        }
        const body = (await response.json()) as Partial<RunnerThreadStepDiffResult> | null;
        const parsed = parseHydratedStepDiffEntries(
          typeof body?.diff === "string" ? body.diff : "",
          step.createdAt,
        );
        if (parsed.length > 0) {
          return parsed;
        }
        const changedPaths = Array.isArray(body?.changedPaths)
          ? body.changedPaths.filter(
              (value): value is string =>
                typeof value === "string" && value.trim().length > 0,
            )
          : [];
        if (changedPaths.length !== 1) {
          return [];
        }
        return [
          {
            path: changedPaths[0],
            additions: typeof body?.additions === "number" ? body.additions : undefined,
            deletions: typeof body?.deletions === "number" ? body.deletions : undefined,
            diff: typeof body?.diff === "string" ? body.diff : undefined,
            createdAt: step.createdAt,
          } satisfies RunnerThreadDiffEntry,
        ];
      } catch {
        return [];
      }
    }),
  );
  return entries.flat();
}

function buildSyntheticFileChangeLog(params: {
  path: string;
  changeKind: "created" | "modified" | "deleted";
  diff?: string;
  changes?: string;
  additions?: number;
  deletions?: number;
  createdAt?: string;
  startedAtMs?: number | null;
}): RunnerLog {
  const path = params.path.startsWith("/workspace/")
    ? params.path
    : `/workspace/${normalizeRunnerHydratedFilePath(params.path)}`;
  const message =
    params.changeKind === "created"
      ? `Write: ${path}`
      : params.changeKind === "deleted"
        ? `Delete: ${path}`
        : `Edit: ${path}`;
  return {
    ...(params.createdAt ? { createdAt: params.createdAt } : {}),
    time: params.createdAt
      ? formatRelativeLogTime(params.createdAt, params.startedAtMs ?? null)
      : "",
    message,
    type: "info",
    eventType: "file_change",
    metadata: {
      filePaths: [path],
      changeKinds: [params.changeKind],
      diffs: {
        [path]: {
          ...(params.diff ? { diff: params.diff } : {}),
          ...(params.changes ? { changes: params.changes } : {}),
          ...(typeof params.additions === "number" ? { additions: params.additions } : {}),
          ...(typeof params.deletions === "number" ? { deletions: params.deletions } : {}),
        },
      },
    },
  };
}

export function mergeThreadStepsIntoLogs(
  logs: RunnerLog[],
  steps: RunnerParsedThreadStep[],
  diffEntries: RunnerThreadDiffEntry[],
  startedAtMs: number | null,
): RunnerLog[] {
  const existingFileChangePaths = new Set<string>();
  for (const log of logs) {
    if (log.eventType !== "file_change" || isInternalFileChangeLog(log)) {
      continue;
    }
    const filePaths = Array.isArray(log.metadata?.filePaths) ? log.metadata.filePaths : [];
    for (const filePath of filePaths) {
      if (
        typeof filePath !== "string" ||
        !filePath.trim() ||
        isRunnerHydratedNullDevicePath(filePath)
      ) {
        continue;
      }
      existingFileChangePaths.add(normalizeRunnerHydratedFilePath(filePath));
    }
  }
  const hasFileChangeLogs = existingFileChangePaths.size > 0;

  const syntheticLogsFromSteps = steps
    .filter((step) => step.eventType === "file_change" || step.stepKind === "file_change")
    .flatMap((step) => {
      const metadata = step.metadata || {};
      const filePaths = Array.isArray(metadata.filePaths)
        ? metadata.filePaths.filter(
            (value): value is string =>
              typeof value === "string" &&
              value.trim().length > 0 &&
              !isRunnerHydratedNullDevicePath(value),
          )
        : [];
      const changeKinds = Array.isArray(metadata.changeKinds)
        ? metadata.changeKinds.filter(
            (value): value is "created" | "modified" | "deleted" =>
              value === "created" || value === "modified" || value === "deleted",
          )
        : [];
      const diffs =
        metadata.diffs && typeof metadata.diffs === "object"
          ? (metadata.diffs as Record<
              string,
              {
                diff?: string;
                changes?: string;
                additions?: number;
                deletions?: number;
              }
            >)
          : {};

      return filePaths
        .map((filePath, index) => {
          const previewPath = normalizeRunnerPreviewPath(filePath);
          if (previewPath && isInternalTurnPreviewPath(previewPath)) {
            return null;
          }
          const normalizedPath = normalizeRunnerHydratedFilePath(filePath);
          const diff = diffs[filePath] || diffs[normalizedPath];
          return buildSyntheticFileChangeLog({
            path: filePath,
            changeKind: changeKinds[index] || "modified",
            diff: diff?.diff,
            changes: diff?.changes,
            additions: diff?.additions,
            deletions: diff?.deletions,
            createdAt: step.createdAt,
            startedAtMs,
          });
        })
        .filter((entry): entry is RunnerLog => Boolean(entry));
    });

  const syntheticLogs =
    syntheticLogsFromSteps.length > 0
      ? syntheticLogsFromSteps
      : diffEntries
          .map((entry) =>
            entry.path &&
            !isRunnerHydratedNullDevicePath(entry.path) &&
            !isInternalTurnPreviewPath(normalizeRunnerHydratedFilePath(entry.path))
              ? buildSyntheticFileChangeLog({
                  path: entry.path,
                  changeKind: inferChangeKind(entry),
                  diff: entry.diff,
                  changes: entry.changes,
                  additions: entry.additions,
                  deletions: entry.deletions,
                  createdAt: entry.createdAt || steps[steps.length - 1]?.createdAt,
                  startedAtMs,
                })
              : null,
          )
          .filter((entry): entry is RunnerLog => Boolean(entry));

  const hydratedSyntheticLogs = hasFileChangeLogs
    ? syntheticLogs.filter((syntheticLog) => {
        const filePaths = Array.isArray(syntheticLog.metadata?.filePaths)
          ? syntheticLog.metadata.filePaths
          : [];
        return filePaths.some((filePath) => {
          if (
            typeof filePath !== "string" ||
            !filePath.trim() ||
            isRunnerHydratedNullDevicePath(filePath)
          ) {
            return false;
          }
          const normalizedPath = normalizeRunnerHydratedFilePath(filePath);
          return (
            isRunnerHydratedVideoFilePath(normalizedPath) &&
            !existingFileChangePaths.has(normalizedPath)
          );
        });
      })
    : syntheticLogs;
  if (hydratedSyntheticLogs.length === 0) {
    return logs;
  }

  const firstAgentMessageIndex = logs.findIndex(
    (log) => log.eventType === "agent_message" || log.eventType === "llm_response",
  );
  if (firstAgentMessageIndex === -1) {
    return [...logs, ...hydratedSyntheticLogs];
  }
  return [
    ...logs.slice(0, firstAgentMessageIndex),
    ...hydratedSyntheticLogs,
    ...logs.slice(firstAgentMessageIndex),
  ];
}

export function mergeThreadDiffsIntoLogs(
  logs: RunnerLog[],
  diffEntries: RunnerThreadDiffEntry[],
): RunnerLog[] {
  if (diffEntries.length === 0) {
    return logs;
  }

  const lastFileLogIndexByPath = new Map<string, number>();
  for (const [index, log] of logs.entries()) {
    if (log.eventType !== "file_change") continue;
    const filePaths = Array.isArray(log.metadata?.filePaths) ? log.metadata.filePaths : [];
    if (filePaths.length !== 1 || typeof filePaths[0] !== "string") continue;
    if (isRunnerHydratedNullDevicePath(filePaths[0])) continue;
    const path = normalizeRunnerHydratedFilePath(filePaths[0]);
    if (!path || isInternalTurnPreviewPath(path)) continue;
    lastFileLogIndexByPath.set(path, index);
  }

  const diffsByPath = new Map<
    string,
    { diff?: string; changes?: string; additions?: number; deletions?: number }
  >();
  for (const entry of diffEntries) {
    if (!entry.path || isRunnerHydratedNullDevicePath(entry.path)) continue;
    const path = normalizeRunnerHydratedFilePath(entry.path);
    if (!path || isInternalTurnPreviewPath(path)) continue;
    diffsByPath.set(path, {
      ...(entry.diff ? { diff: entry.diff } : {}),
      ...(entry.changes ? { changes: entry.changes } : {}),
      ...(typeof entry.additions === "number" ? { additions: entry.additions } : {}),
      ...(typeof entry.deletions === "number" ? { deletions: entry.deletions } : {}),
    });
  }

  return logs.map((log, index) => {
    if (log.eventType !== "file_change") {
      return log;
    }
    const filePaths = Array.isArray(log.metadata?.filePaths) ? log.metadata.filePaths : [];
    if (
      filePaths.length !== 1 ||
      typeof filePaths[0] !== "string" ||
      isRunnerHydratedNullDevicePath(filePaths[0])
    ) {
      return log;
    }
    const path = normalizeRunnerHydratedFilePath(filePaths[0]);
    if (!path || lastFileLogIndexByPath.get(path) !== index) {
      return log;
    }
    const diff = diffsByPath.get(path);
    if (!diff) {
      return log;
    }
    const existingDiffs = log.metadata?.diffs as
      | Record<
          string,
          {
            diff?: string;
            changes?: string;
            additions?: number;
            deletions?: number;
          }
        >
      | undefined;
    if (
      existingDiffs &&
      (typeof existingDiffs[path] === "object" ||
        typeof existingDiffs[filePaths[0]] === "object")
    ) {
      return log;
    }
    return {
      ...log,
      metadata: {
        ...log.metadata,
        diffs: { ...(existingDiffs || {}), [filePaths[0]]: diff },
      },
    };
  });
}

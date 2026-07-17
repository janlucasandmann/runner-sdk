import type { RunnerLog } from "../../types.js";
import { collectRunnerLogFileChangePreviews } from "../../platform-ui/components/thread-components/log-boxes/index.js";
import { normalizeRunnerPreviewPath } from "../runner-document-preview.js";
import { isInternalTurnPreviewPath } from "./hydration/file-paths.js";

export interface RunnerTurnChangedFile {
  path: string;
  kind: "created" | "modified" | "deleted";
  additions?: number;
  deletions?: number;
}

export function collectTurnChangedFiles(logs: RunnerLog[]): RunnerTurnChangedFile[] {
  const changedFiles = new Map<string, RunnerTurnChangedFile & { order: number }>();
  let order = 0;

  for (const log of logs) {
    const previews = collectRunnerLogFileChangePreviews(log);
    if (previews.length === 0) continue;

    for (const preview of previews) {
      const normalizedPath = normalizeRunnerPreviewPath(preview.path);
      if (!normalizedPath || isInternalTurnPreviewPath(normalizedPath)) continue;
      changedFiles.set(normalizedPath, {
        path: normalizedPath,
        kind: preview.kind,
        additions: typeof preview.additions === "number" ? preview.additions : undefined,
        deletions: typeof preview.deletions === "number" ? preview.deletions : undefined,
        order,
      });
      order += 1;
    }
  }

  return Array.from(changedFiles.values())
    .sort((left, right) => left.order - right.order)
    .map(({ order: _order, ...changedFile }) => changedFile);
}

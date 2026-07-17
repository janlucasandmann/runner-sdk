import type { RunnerLog } from "../../../types.js";
import { normalizeRunnerPreviewPath } from "../../runner-document-preview.js";

export function normalizeRunnerHydratedFilePath(value: string): string {
  return value.trim().replace(/^\/workspace\//, "").replace(/^\.?\//, "");
}

export function isRunnerHydratedNullDevicePath(value?: string | null): boolean {
  const normalized = String(value || "").trim().replace(/^['"`]+|['"`]+$/g, "");
  return normalized === "/dev/null" || normalized === "dev/null";
}

export function isInternalTurnPreviewPath(filePath: string): boolean {
  const normalized = filePath.replace(/^\/workspace\/?/, "");
  return (
    normalized === ".claude.json" ||
    normalized.startsWith(".claude/") ||
    normalized.startsWith(".cache/") ||
    normalized.startsWith(".npm/") ||
    normalized.startsWith(".local/") ||
    normalized.startsWith("browser-skill/") ||
    normalized.startsWith("tmp/")
  );
}

export function isInternalFileChangeLog(log: RunnerLog): boolean {
  if (log.eventType !== "file_change") {
    return false;
  }
  const filePaths = Array.isArray(log.metadata?.filePaths)
    ? log.metadata.filePaths.filter(
        (value): value is string =>
          typeof value === "string" &&
          value.trim().length > 0 &&
          !isRunnerHydratedNullDevicePath(value),
      )
    : [];
  return (
    filePaths.length > 0 &&
    filePaths.every((filePath) => {
      const normalizedPath = normalizeRunnerPreviewPath(filePath);
      return normalizedPath ? isInternalTurnPreviewPath(normalizedPath) : false;
    })
  );
}

export type RunnerThreadViewMode = "auto" | "canonical" | "legacy";

export function shouldUseRunnerCanonicalThreadSurface(input: {
  canonicalThreadEnabled: boolean;
  canonicalProjectionMatchesThread: boolean;
  threadViewMode: RunnerThreadViewMode;
  hasCanonicalTimelineContent: boolean;
}): boolean {
  if (!input.canonicalThreadEnabled || !input.canonicalProjectionMatchesThread) {
    return false;
  }
  if (input.threadViewMode === "canonical") return true;
  return input.threadViewMode === "auto" && input.hasCanonicalTimelineContent;
}

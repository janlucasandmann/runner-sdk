export const RUNNER_THREAD_WORKING_LABEL_MAX_WORDS = 18;

const GENERIC_ACTIVITY_GROUP_LABELS = new Set([
  "activity",
  "activity group",
  "delegating work to agents",
  "delegating work",
  "generating media",
  "implementing changes",
  "inspecting workspace files",
  "inspecting and gathering context",
  "publishing changes",
  "publishing or changing external systems",
  "reviewing external sources",
  "researching external sources",
  "run",
  "run local commands",
  "running local commands",
  "running tests and checks",
  "searching external sources",
  "updating the task plan",
  "updating workspace files",
  "verifying the work",
  "worker",
  "worker run",
  "working in the browser",
  "working with connected services",
  "working with database records",
  "working through the current task",
  "working through the task",
]);

const UNINFORMATIVE_WORKING_LABELS = new Set([
  "continuing work",
  "continuing the work",
  "coordinating delegated work",
  "executing the current task",
  "executing the task",
  "executing the task plan",
  "implementing changes",
  "implementing changes in the workspace",
  "inspecting the workspace and gathering context",
  "making progress",
  "preparing the next step",
  "processing the current task",
  "processing the task",
  "reviewing progress",
  "running checks and verifying the work",
  "starting the worker run",
  "working on it",
  "working on the current task",
  "working on the task",
  "working through current task",
  "working through task",
  "working through the current task",
  "working through the task",
]);

function normalizedText(value: unknown): string {
  return typeof value === "string"
    ? value
        .replace(/\s+/g, " ")
        .replace(/^(?:status|progress|working)\s*:\s*/i, "")
        .replace(/[.!?]+$/g, "")
        .trim()
    : "";
}

function comparableText(value: unknown): string {
  return normalizedText(value)
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isRunnerThreadGenericActivityGroupLabel(value: unknown): boolean {
  const comparable = comparableText(value);
  return !comparable || GENERIC_ACTIVITY_GROUP_LABELS.has(comparable);
}

/**
 * Accepts only concise, informative observer-owned status text. Returning null
 * means callers must retain their previous grounded label or show the stable
 * `Working...` fallback; they must not manufacture a category placeholder.
 */
export function normalizeRunnerThreadWorkingLabel(value: unknown): string | null {
  const label = normalizedText(value);
  if (!label) return null;
  const comparable = comparableText(label);
  if (
    UNINFORMATIVE_WORKING_LABELS.has(comparable)
    || /^working (?:through|on)(?:\s|$)/.test(comparable)
    || /^(?:continuing|progress)(?:\s|$)/.test(comparable)
    || /^processing (?:the )?(?:current )?task(?:\s|$)/.test(comparable)
    || /^implementing (?:the )?(?:current )?(?:task|work|changes)$/.test(comparable)
  ) {
    return null;
  }
  if (label.split(/\s+/).length > RUNNER_THREAD_WORKING_LABEL_MAX_WORDS) return null;
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

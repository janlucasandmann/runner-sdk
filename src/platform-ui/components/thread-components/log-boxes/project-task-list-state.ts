import type { RunnerLog } from "../../../../types.js";
import { parseRunnerProjectScopedListDetails } from "./project-scoped-list-state.js";

export interface RunnerProjectTaskListDetails {
  projectId: string;
  projectName: string;
  taskCount: number | null;
}

/**
 * Recognizes read-only project task listings emitted by the task-management
 * skill or API. Task mutations intentionally do not match.
 */
export function parseRunnerProjectTaskListDetails(
  log: RunnerLog,
): RunnerProjectTaskListDetails | null {
  const details = parseRunnerProjectScopedListDetails(log, {
    resource: "tasks",
    countLabels: ["TASK"],
  });
  if (!details) return null;
  return {
    projectId: details.projectId,
    projectName: details.projectName,
    taskCount: details.itemCount,
  };
}

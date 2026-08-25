import type { RunnerLog } from "../../../../types.js";
import { parseRunnerProjectScopedListDetails } from "./project-scoped-list-state.js";

export interface RunnerProjectMilestoneListDetails {
  projectId: string;
  projectName: string;
  milestoneCount: number | null;
}

export function parseRunnerProjectMilestoneListDetails(
  log: RunnerLog,
): RunnerProjectMilestoneListDetails | null {
  const details = parseRunnerProjectScopedListDetails(log, {
    resource: "releases",
    countLabels: ["RELEASE", "MILESTONE"],
  });
  if (!details) return null;
  return {
    projectId: details.projectId,
    projectName: details.projectName,
    milestoneCount: details.itemCount,
  };
}

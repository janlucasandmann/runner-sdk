import { Bookmark } from "lucide-react";
import type { RunnerLog } from "../../../../types.js";
import {
  parseRunnerProjectTaskListDetails,
  type RunnerProjectTaskListDetails,
} from "./project-task-list-state.js";
import { ProjectScopedListActivityLogBox } from "./project-scoped-list-view.js";

export interface ProjectTaskListActivityLogBoxProps {
  log: RunnerLog;
  backendUrl?: string;
  requestHeaders?: HeadersInit;
  availableProjects?: readonly unknown[];
  onProjectPreviewClick?: (project: {
    projectId: string;
    projectName?: string;
  }) => void;
}

export function ProjectTaskListActivityLogBox({
  log,
  ...props
}: ProjectTaskListActivityLogBoxProps) {
  const details = parseRunnerProjectTaskListDetails(
    log,
  ) as RunnerProjectTaskListDetails;
  return (
    <ProjectScopedListActivityLogBox
      {...props}
      projectId={details.projectId}
      projectName={details.projectName}
      titlePrefix="Listed tasks in"
      iconVariant="task"
      icon={<Bookmark strokeWidth={1.9} />}
    />
  );
}

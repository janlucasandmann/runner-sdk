import { Milestone } from "../../ui/hugeicons-compat.js";
import type { RunnerLog } from "../../../../types.js";
import {
  parseRunnerProjectMilestoneListDetails,
  type RunnerProjectMilestoneListDetails,
} from "./project-milestone-list-state.js";
import { ProjectScopedListActivityLogBox } from "./project-scoped-list-view.js";

export interface ProjectMilestoneListActivityLogBoxProps {
  log: RunnerLog;
  backendUrl?: string;
  requestHeaders?: HeadersInit;
  availableProjects?: readonly unknown[];
  onProjectPreviewClick?: (project: {
    projectId: string;
    projectName?: string;
  }) => void;
}

export function ProjectMilestoneListActivityLogBox({
  log,
  ...props
}: ProjectMilestoneListActivityLogBoxProps) {
  const details = parseRunnerProjectMilestoneListDetails(
    log,
  ) as RunnerProjectMilestoneListDetails;
  return (
    <ProjectScopedListActivityLogBox
      {...props}
      projectId={details.projectId}
      projectName={details.projectName}
      titlePrefix="Listed milestones in"
      iconVariant="milestone"
      icon={<Milestone strokeWidth={1.9} />}
    />
  );
}

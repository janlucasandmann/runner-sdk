import type { RunnerLog } from "../../../../types.js";
import type { ComputerAgentsListAvailableAgent } from "../../../../react/runner-agents-list-log-box.js";
import type { ComputerAgentsListAvailableEnvironment } from "../../../../react/runner-environments-list-log-box.js";
import type { RunnerPreviewAttachment } from "../../../../react/runner-document-preview.js";
import type { TaskManagementListAvailableProject } from "../../../../react/runner-projects-list-log-box.js";

export interface RunnerTaskPreviewClickPayload {
  taskId: string;
  projectId: string;
  projectName?: string;
  threadId?: string;
  ticketNumber: string;
  title: string;
  description?: string;
  taskColor?: string;
  status?: string;
  priority?: string;
  taskType?: string;
  assigneeAgentId?: string;
  assigneeName?: string;
  environmentId?: string;
  environmentName?: string;
  isDeleted?: boolean;
}

export interface RunnerWorkLogEntryProps {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  renderComputerUseMcpAsGeneric?: boolean;
  renderBrowserSkillAsGeneric?: boolean;
  activeTaskPreviewId?: string | null;
  availableAgents?: ComputerAgentsListAvailableAgent[];
  availableEnvironments?: ComputerAgentsListAvailableEnvironment[];
  availableProjects?: TaskManagementListAvailableProject[];
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
  onWorkspacePathClick?: (path: string) => void;
  onPermissionDecision?: (
    log: RunnerLog,
    decision: "allow" | "deny",
  ) => Promise<void> | void;
  onTaskPreviewClick?: (preview: RunnerTaskPreviewClickPayload) => void;
  onAgentPreviewClick?: (agent: { agentId: string; agentName?: string }) => void;
  onEnvironmentPreviewClick?: (environment: {
    environmentId: string;
    environmentName?: string;
  }) => void;
  onProjectPreviewClick?: (project: {
    projectId: string;
    projectName?: string;
  }) => void;
  onOpenTaskList?: () => void;
}

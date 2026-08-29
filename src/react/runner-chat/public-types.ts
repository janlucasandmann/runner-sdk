import type { ReactNode } from "react";

import type { RunnerExecuteResult, RunnerLog } from "../../types.js";
import type { RunnerCreatedResourcePreview } from "../../platform-ui/components/thread-components/log-boxes/index.js";
import type {
  RunnerAgentCreationCommandType,
  RunnerResourceCreationCommandType,
  RunnerSkillCreationCommandType,
  StagedAdCreationCommand,
  StagedParseCreationCommand,
  StagedResearchCreationCommand,
  StagedScrapeCreationCommand,
  StagedSlideCreationCommand,
  StagedLoopCommand,
} from "./composer-commands.js";
import type {
  RunnerChatOption,
  RunnerChatProjectOption,
} from "./agent-options.js";
import type {
  RunnerAttachment,
  RunnerChatImplicitAttachment,
  RunnerTurnAttachment,
} from "./attachment-types.js";
import type { RunnerChatFetchedFileContent } from "./attachment-api.js";
import type { RunnerFileBrowserSource } from "./file-browser-source.js";
import type { RunnerChatMetronomeWorkflowRunPayload } from "./metronome-workflow.js";
import type {
  RunnerChatRunSummaryJsonRenderContext,
  RunnerChatUserPromptRenderContext,
} from "./run-summary-content.js";
import type {
  RunnerChatSkill,
  RunnerChatSkillDefaults,
} from "./skill-configuration.js";
import type {
  RunnerMissionControlPreview,
  RunnerTaskPreview,
} from "./task-preview.js";
import type { RunnerChatThreadContext } from "./thread-context-utils.js";
import type { RunnerKnowledgeContext } from "./knowledge-context.js";
import type {
  RunnerQuotedSelection,
  RunnerTurnStatus,
} from "./turn-types.js";
import type {
  RunnerChatFileNode,
  RunnerChatNotionDatabase,
} from "./workspace-files.js";

export interface RunnerChatAgentTurnClickPayload {
  turnId: string;
  agentId?: string;
  agentName?: string;
}

export interface RunnerChatSummaryWorkspacePathClickPayload {
  path: string;
  turnId: string;
  threadId?: string | null;
  environmentId?: string | null;
  agentName?: string | null;
  sourceType: "run_summary" | "working_log" | "deep_research_report";
}

export interface RunnerChatFollowUpAction {
  id: string;
  label: string;
  disabled?: boolean;
  pending?: boolean;
  focusComposer?: boolean;
  onClick?: () => Promise<void> | void;
}

export type RunnerChatInputMode = "minimal" | "computer-agents";

export interface RunnerChatProjectsConfig {
  items?: RunnerChatProjectOption[];
  selectedProjectId?: string | null;
  onProjectChange?: (projectId: string) => void;
}

export interface RunnerChatConnectorOption {
  id: string;
  name: string;
  kind?: "plugin" | "tag";
  description?: string;
  keywords?: string[];
  logoUrl?: string;
  connected?: boolean;
  disabled?: boolean;
  onConnect?: () => Promise<boolean | void> | boolean | void;
}

export interface RunnerChatExternalRunRequest {
  token: string | number;
  threadId: string;
  prompt: string;
  displayPrompt?: string | null;
  reasoningEffort?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  attachments?: RunnerAttachment[] | null;
  githubRepo?: {
    repoFullName: string;
    repoName: string;
    branch: string;
    branchPrefix?: string;
    createPullRequests?: boolean;
    forcePushCommits?: boolean;
  } | null;
  enabledSkills?: Record<string, unknown> | null;
  connectors?: Record<string, unknown> | null;
  knowledgeContext?: RunnerKnowledgeContext | null;
  environmentId?: string | null;
  projectId?: string | null;
  quotedSelection?: RunnerQuotedSelection | null;
  slideCreationCommand?: StagedSlideCreationCommand | null;
  researchCreationCommand?: StagedResearchCreationCommand | null;
  scrapeCreationCommand?: StagedScrapeCreationCommand | null;
  parseCreationCommand?: StagedParseCreationCommand | null;
  adCreationCommand?: StagedAdCreationCommand | null;
  loopCommand?: StagedLoopCommand | null;
}

export interface RunnerChatExternalFileBrowserRequest {
  token: string | number;
  source?: RunnerFileBrowserSource | string | null;
}

/** Attaches a saved prompt to the composer through the canonical prompt picker path. */
export interface RunnerChatExternalPromptAttachmentRequest {
  token: string | number;
  prompt: RunnerChatPromptAttachment;
}

export interface RunnerChatComposerSubmitPayload {
  prompt: string;
  attachments: RunnerAttachment[];
  environmentId: string | null;
  projectId?: string | null;
  agentId: string | null;
  agentName?: string | null;
  reasoningEffort?: string | null;
  githubRepo?: {
    repoFullName: string;
    repoName: string;
    branch: string;
    branchPrefix?: string;
    createPullRequests?: boolean;
    forcePushCommits?: boolean;
  } | null;
  enabledSkills?: Record<string, unknown> | null;
  connectors?: Record<string, unknown> | null;
  knowledgeContext?: RunnerKnowledgeContext | null;
  quotedSelection?: RunnerQuotedSelection | null;
}

export interface RunnerChatProjectTaskSubmitPayload
  extends RunnerChatComposerSubmitPayload {
  taskPreview: RunnerTaskPreview;
}

export interface RunnerChatBatchJobSubmitPayload
  extends RunnerChatComposerSubmitPayload {
  targetKind: "thread_run";
  startPolicy: "manual";
}

export interface RunnerChatSchedulePreset {
  id: string;
  label: string;
  cron?: string;
}

/** A saved Markdown prompt selected from the global search modal for the composer. */
export interface RunnerChatPromptAttachment {
  id: string;
  name: string;
  description?: string;
  markdown: string;
  currentVersionId?: string;
  currentVersionNumber?: number;
}

/** A document contained by a Knowledge library selected for the composer. */
export interface RunnerChatKnowledgeDocumentAttachment {
  id: string;
  title: string;
  summary?: string;
  markdown?: string;
  content?: string;
  archived?: boolean;
  sortOrder?: number;
}

/** A Knowledge library selected from global search for the composer. */
export interface RunnerChatKnowledgeAttachment {
  id: string;
  name: string;
  description?: string;
  currentVersionId?: string;
  currentVersionNumber?: number;
  documents?: RunnerChatKnowledgeDocumentAttachment[];
}

/** A saved conversation selected from the global search modal for the composer. */
export interface RunnerChatThreadAttachment {
  id: string;
  title: string;
  description?: string;
  markdown?: string;
}

/** A connected account that can be used when browsing an integration. */
export interface RunnerChatConnectorAccount {
  id: string;
  name: string;
  identity?: string;
  isDefault?: boolean;
  disabled?: boolean;
}

export interface RunnerChatConnectorFetchOptions {
  accountId?: string;
}

export interface RunnerChatGithubRepositorySourceFile {
  path: string;
  content: string;
}

export interface RunnerChatGithubRepositoryCreateInput {
  name: string;
  description?: string;
  functionId?: string;
  webAppId?: string;
  resourceId?: string;
  resourceKind?: "function" | "web_app";
  private?: boolean;
  commitMessage?: string;
  files: RunnerChatGithubRepositorySourceFile[];
}

export interface RunnerChatGithubRepositoryCreateResult {
  id?: string;
  name: string;
  repoFullName: string;
  ref: string;
}

export interface RunnerChatGithubConfig {
  connected?: boolean;
  accounts?: RunnerChatConnectorAccount[];
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
  repositories?: RunnerChatOption[];
  selectedRepositoryId?: string;
  contexts?: RunnerChatOption[];
  selectedContextId?: string;
  contextLabel?: string;
  onAttach?: (fileIds: string[]) => void;
  onRepositoryChange?: (repositoryId: string) => void;
  onContextChange?: (contextId: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  fetchItems?: (
    folderId: string,
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatFileNode[]>;
  fetchBranches?: (
    repoFullName: string,
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatOption[]>;
  createRepository?: (
    input: RunnerChatGithubRepositoryCreateInput,
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatGithubRepositoryCreateResult>;
  fetchFileContent?: (
    file: RunnerChatFileNode,
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatFetchedFileContent>;
}

export interface RunnerChatNotionConfig {
  connected?: boolean;
  accounts?: RunnerChatConnectorAccount[];
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
  databases?: RunnerChatNotionDatabase[];
  selectedDatabaseId?: string;
  onDatabaseChange?: (databaseId: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  fetchDatabases?: (
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatNotionDatabase[]>;
}

export interface RunnerChatDriveConfig {
  connected?: boolean;
  accounts?: RunnerChatConnectorAccount[];
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
  items?: RunnerChatFileNode[];
  rootLabel?: string;
  onAttach?: (fileIds: string[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  fetchItems?: (
    folderId: string,
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatFileNode[]>;
  fetchFileContent?: (
    file: RunnerChatFileNode,
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatFetchedFileContent>;
  onManageAccess?: () => Promise<void> | void;
}

export interface RunnerChatWorkspaceConfig {
  items?: RunnerChatFileNode[];
  rootLabel?: string;
  onAttach?: (fileIds: string[]) => void;
}

export interface RunnerChatScheduleConfig {
  enabled?: boolean;
  presets?: RunnerChatSchedulePreset[];
  onQuickSchedule?: (schedule: {
    scheduledTime: Date;
    scheduleType: "one-time" | "recurring";
    cronExpression?: string;
  }) => void;
  onOpenCalendarApp?: () => void;
}

export interface RunnerChatComputerAgentsConfig {
  github?: RunnerChatGithubConfig;
  notion?: RunnerChatNotionConfig;
  googleDrive?: RunnerChatDriveConfig;
  oneDrive?: RunnerChatDriveConfig;
  workspace?: RunnerChatWorkspaceConfig;
  schedule?: RunnerChatScheduleConfig;
  projects?: RunnerChatProjectsConfig;
  connectors?: RunnerChatConnectorOption[];
  selectedConnectorIds?: string[];
  onSelectedConnectorsChange?: (connectorIds: string[]) => void;
}

export interface RunnerChatActionSummaryClickPayload {
  actionType?:
    | "compact"
    | "clear"
    | "fork"
    | "btw"
    | "revert"
    | "reapply"
    | "voice";
  message: string;
  revertedChangeStepId?: string | null;
  revertedFilePath?: string | null;
  revertedFileName?: string | null;
}

export interface RunnerThreadTaskListItem {
  id?: string;
  text: string;
  completed: boolean;
}

export interface RunnerThreadTaskListSummary {
  status?: "idle" | "loading" | "refreshing" | "loaded" | "error";
  error?: string | null;
  items: readonly RunnerThreadTaskListItem[];
}

export interface RunnerChatProps {
  backendUrl: string;
  apiKey: string;
  speechToTextUrl?: string;
  fetchCustomSkills?: () => Promise<RunnerChatSkill[]>;
  requestHeaders?: HeadersInit;
  resolveRequestHeaders?: () =>
    | HeadersInit
    | undefined
    | Promise<HeadersInit | undefined>;
  environmentId?: string;
  projectId?: string | null;
  agentId?: string;
  appId?: string;
  threadId?: string;
  title?: string;
  threadMetadata?: Record<string, unknown> | null;
  /** Version-pinned Knowledge libraries available to the thread runtime. */
  knowledgeContext?: RunnerKnowledgeContext | null;
  /**
   * Selects the thread renderer. `auto` promotes a thread to the canonical
   * event timeline only when Thread v2 data exists and no rich legacy-only
   * affordance would be hidden. Otherwise it keeps the legacy turn renderer as
   * a deployment-safe compatibility fallback.
   */
  threadViewMode?: "auto" | "canonical" | "legacy";
  /**
   * Controls the visual composer surface independently from thread loading.
   * This is useful for synthetic detail screens (for example workflow-run
   * overviews) that should look like an existing thread without pretending
   * that their synthetic route id is a loadable thread id.
   */
  composerSurfaceMode?: "auto" | "home" | "thread";
  /**
   * Holds a synthetic thread surface behind the canonical page loader until
   * its host-owned data is ready. Existing persisted threads are gated
   * automatically by RunnerChat's own history hydration.
   */
  initialSurfaceLoading?: boolean;
  placeholder?: string;
  privateMode?: boolean;
  initialTask?: string;
  hiddenSystemPrompt?: string;
  emptyState?: ReactNode;
  emptyStateAfterComposer?: ReactNode;
  composerLeadingControl?: ReactNode;
  composerBeforeAgentControl?: ReactNode;
  className?: string;
  disabled?: boolean;
  autoCreateThread?: boolean;
  maxAttachments?: number;
  implicitAttachments?: RunnerChatImplicitAttachment[];
  showUsageInStatus?: boolean;
  inputMode?: RunnerChatInputMode;
  agents?: RunnerChatOption[];
  hideAgentSelector?: boolean;
  /** Keeps the resolved agent visible in the composer while preventing changes. */
  lockAgentSelector?: boolean;
  isAgentSelectionBlocked?: (agent: RunnerChatOption) => boolean;
  onBlockedAgentSelect?: (agent: RunnerChatOption) => void;
  reasoningEffort?: string | null;
  onReasoningEffortChange?: (reasoningEffort: string) => void;
  environments?: RunnerChatOption[];
  hideEnvironmentSelector?: boolean;
  /** Keeps the resolved computer visible in the composer while preventing changes. */
  lockEnvironmentSelector?: boolean;
  skills?: RunnerChatSkill[];
  enabledSkillIds?: string[];
  skillDefaults?: RunnerChatSkillDefaults;
  computerAgents?: RunnerChatComputerAgentsConfig;
  uploadFiles?: (files: File[]) => Promise<RunnerAttachment[]>;
  mapFileToAttachment?: (
    file: File,
  ) => Promise<RunnerAttachment> | RunnerAttachment;
  onThreadIdChange?: (threadId: string) => void;
  onThreadTitleChange?: (threadId: string, title: string) => void;
  onThreadStatusChange?: (threadId: string, status: RunnerTurnStatus) => void;
  onRunStart?: (threadId: string) => void;
  onRunFinish?: (result: RunnerExecuteResult, threadId: string) => void;
  onRunCancel?: (threadId: string) => void;
  onRunError?: (error: Error, threadId?: string) => void;
  onMetronomeWorkflowRun?: (
    payload: RunnerChatMetronomeWorkflowRunPayload,
  ) => void;
  onAgentChange?: (agentId: string) => void;
  onEnvironmentChange?: (environmentId: string) => void;
  onSkillsChange?: (skillIds: string[]) => void;
  onContextIndicatorClick?: (context: RunnerChatThreadContext | null) => void;
  onActionSummaryClick?: (
    summary: RunnerChatActionSummaryClickPayload,
  ) => void;
  onOpenChanges?: (threadId: string, runId?: string) => void;
  executionWorkbenchOpen?: boolean;
  onExecutionWorkbenchOpenChange?: (isOpen: boolean) => void;
  onExecutionWorkbenchAvailabilityChange?: (isAvailable: boolean) => void;
  threadTaskList?: RunnerThreadTaskListSummary | null;
  onSubagentDetailOpenChange?: (isOpen: boolean) => void;
  onDocumentPreviewOpenChange?: (isOpen: boolean) => void;
  onDeepResearchDetailOpenChange?: (isOpen: boolean) => void;
  threadTaskPreview?: RunnerTaskPreview | null;
  threadMissionControlPreview?: RunnerMissionControlPreview | null;
  composerProjectTasks?: RunnerTaskPreview[];
  selectedComposerProjectTask?: RunnerTaskPreview | null;
  composerPlanTierId?: string | null;
  composerOrganizations?: RunnerChatOption[];
  composerOrganizationId?: string | null;
  showComposerCreateAgentAction?: boolean;
  onComposerCreateAgentClick?: () => void;
  onComposerOrganizationChange?: (organizationId: string) => void;
  onComposerProjectTaskChange?: (preview: RunnerTaskPreview | null) => void;
  onComposerProjectTaskSubmit?: (
    payload: RunnerChatProjectTaskSubmitPayload,
    // biome-ignore lint/suspicious/noConfusingVoidType: Preserves the compatibility callback API.
  ) => Promise<boolean | void> | boolean | void;
  /**
   * Lets a host reuse the complete composer while owning submission. Returning
   * `false` keeps the draft intact; the native thread path is never invoked.
   */
  onComposerSubmit?: (
    payload: RunnerChatComposerSubmitPayload,
    // biome-ignore lint/suspicious/noConfusingVoidType: Preserves the compatibility callback API.
  ) => Promise<boolean | void> | boolean | void;
  /**
   * Saves the staged `/Batch` composer payload without starting a thread.
   * `manual` is the durable API policy represented as “Keep on shelf” in the UI.
   */
  onBatchJobCreate?: (
    payload: RunnerChatBatchJobSubmitPayload,
    // biome-ignore lint/suspicious/noConfusingVoidType: Preserves the compatibility callback API.
  ) => Promise<boolean | void> | boolean | void;
  /** Reports the live composer draft without replacing the composer's state. */
  onComposerDraftChange?: (draft: string) => void;
  /** A changing token requests submission through the same path as the send control. */
  composerSubmitRequest?: string | number | null;
  /** Renders slash-command and connector-mention menus above clipping hosts. */
  portalComposerSuggestions?: boolean;
  activeTaskPreviewId?: string | null;
  onTaskPreviewClick?: (preview: RunnerTaskPreview) => void;
  onOpenTaskList?: () => void;
  onTaskListChange?: (threadId: string, log: RunnerLog) => void;
  onResourcePreviewClick?: (resource: RunnerCreatedResourcePreview) => void;
  onAgentTurnClick?: (payload: RunnerChatAgentTurnClickPayload) => void;
  onSummaryWorkspacePathClick?: (
    payload: RunnerChatSummaryWorkspacePathClickPayload,
  ) => void;
  documentPreviewPortalTarget?: Element | null;
  documentPreviewPortalOnly?: boolean;
  initialDocumentPreviewAttachment?:
    | RunnerTurnAttachment
    | RunnerAttachment
    | null;
  initialDocumentPreviewToken?: string | number | null;
  subagentDetailPortalTarget?: Element | null;
  disableSubagentDetailDrawer?: boolean;
  externalRunRequest?: RunnerChatExternalRunRequest | null;
  externalFileBrowserRequest?: RunnerChatExternalFileBrowserRequest | null;
  externalPromptAttachmentRequest?: RunnerChatExternalPromptAttachmentRequest | null;
  onExternalPromptAttachmentRequestHandled?: (token: string | number) => void;
  onExternalRunRequestHandled?: (token: string | number) => void;
  onExternalRunRequestCreate?: (
    request: RunnerChatExternalRunRequest,
    // biome-ignore lint/suspicious/noConfusingVoidType: Preserves the compatibility callback API.
  ) => boolean | void;
  autoFocusComposer?: boolean;
  composerFocusRequest?: string | number | null;
  keepFocusOnSubmit?: boolean;
  enableBacklogSubtaskCommand?: boolean;
  backlogTaskConnectors?: Record<string, unknown> | null;
  backlogSubtaskCommand?: {
    ticketNumber: string;
    token: string | number;
    label?: string;
  } | null;
  enableBacklogMissionControlCommand?: boolean;
  backlogMissionControlCommand?: {
    token: string | number;
    label?: string;
  } | null;
  enableResourceCreationCommand?: boolean;
  resourceCreationCommand?: {
    type: RunnerResourceCreationCommandType;
    token: string | number;
    label?: string;
  } | null;
  resourceCreationCommandHiddenPrompt?: (
    commandType: RunnerResourceCreationCommandType,
  ) => string;
  onResourceCreationCommandChange?: (
    commandType: RunnerResourceCreationCommandType | null,
  ) => void;
  enableAgentCreationCommand?: boolean;
  agentCreationCommand?: {
    type: RunnerAgentCreationCommandType;
    token: string | number;
    label?: string;
  } | null;
  agentCreationCommandHiddenPrompt?: (
    commandType: RunnerAgentCreationCommandType,
  ) => string;
  onAgentCreationCommandChange?: (
    commandType: RunnerAgentCreationCommandType | null,
  ) => void;
  enableSkillCreationCommand?: boolean;
  skillCreationCommand?: {
    type: RunnerSkillCreationCommandType;
    token: string | number;
    label?: string;
  } | null;
  skillCreationCommandHiddenPrompt?: (
    commandType: RunnerSkillCreationCommandType,
  ) => string;
  onSkillCreationCommandChange?: (
    commandType: RunnerSkillCreationCommandType | null,
  ) => void;
  onOpenPluginsOverview?: () => void;
  /** Opens the host shell's prompt search. The callback receives the selected prompt. */
  onOpenPromptSearch?: (
    onSelect: (prompt: RunnerChatPromptAttachment) => void | Promise<void>,
  ) => void;
  /** Opens the host shell's Knowledge search. The callback receives the selected library. */
  onOpenKnowledgeSearch?: (
    onSelect: (library: RunnerChatKnowledgeAttachment) => void | Promise<void>,
  ) => void;
  /** Opens the host shell's thread search. The callback receives the selected thread. */
  onOpenThreadSearch?: (
    onSelect: (thread: RunnerChatThreadAttachment) => void | Promise<void>,
  ) => void;
  onOpenPlansBudget?: () => void;
  onBacklogMissionControlSubmit?: (payload: {
    prompt: string;
    attachments: RunnerAttachment[];
    environmentId: string | null;
    projectId?: string | null;
    agentId: string | null;
    reasoningEffort?: string | null;
    githubRepo?: {
      repoFullName: string;
      repoName: string;
      branch: string;
      branchPrefix?: string;
      createPullRequests?: boolean;
      forcePushCommits?: boolean;
    } | null;
    enabledSkills?: Record<string, unknown> | null;
    connectors?: Record<string, unknown> | null;
  }) => Promise<void> | void;
  followUpActions?: RunnerChatFollowUpAction[];
  followUpError?: string;
  renderUserPromptContent?: (
    context: RunnerChatUserPromptRenderContext,
  ) => ReactNode | undefined;
  renderRunSummaryJsonSegment?: (
    context: RunnerChatRunSummaryJsonRenderContext,
  ) => ReactNode | undefined;
}

import { CSSProperties, ChangeEvent, ClipboardEvent, Fragment, KeyboardEvent, MouseEvent, ReactNode, SyntheticEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp as LucideArrowUp,
  AudioLines as LucideAudioLines,
  Bot as LucideBot,
  Brain as LucideBrain,
  Calendar as LucideCalendar,
  Check as LucideCheck,
  ChevronDown as LucideChevronDown,
  CornerDownRight as LucideCornerDownRight,
  Code as LucideCode,
  Copy as LucideCopy,
  Cpu as LucideCpu,
  ChevronRight as LucideChevronRight,
  ChevronUp as LucideChevronUp,
  Ellipsis as LucideEllipsis,
  ExternalLink as LucideExternalLink,
  FileText as LucideFileText,
  FolderOpen as LucideFolderOpen,
  GitBranch as LucideGitBranch,
  Globe as LucideGlobe,
  Images as LucideImages,
  Layers as LucideLayers,
  LibraryBig as LucideLibraryBig,
  ListTodo as LucideListTodo,
  Mail as LucideMail,
  MessageSquare as LucideMessageSquare,
  MessageSquareText as LucideMessageSquareText,
  Maximize2 as LucideMaximize2,
  Minimize2 as LucideMinimize2,
  Monitor as LucideMonitor,
  LoaderCircle as LucideLoaderCircle,
  Palette as LucidePalette,
  Pencil as LucidePencil,
  Presentation as LucidePresentation,
  Plug as LucidePlug,
  RefreshCw as LucideRefreshCw,
  Repeat2 as LucideRepeat2,
  Split as LucideSplit,
  Star as LucideStar,
  Telescope as LucideTelescope,
  TextQuote as LucideTextQuote,
  ThumbsDown as LucideThumbsDown,
  ThumbsUp as LucideThumbsUp,
  Truck as LucideTruck,
  Upload as LucideUpload,
  UsersRound as LucideUsersRound,
  Video as LucideVideo,
  Wand2 as LucideWand2,
  X as LucideX,
  Zap as LucideZap,
} from "lucide-react";
import { RunnerDeepResearchSession, RunnerLog } from "../types.js";
import {
  PlatformPopupSurface,
  type PlatformPopupAnimation,
} from "../platform-ui/components/composite/popup/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../platform-ui/components/ui/button/index.js";
import { PlatformStatusIndicator } from "../platform-ui/components/composite/status-indicator/index.js";
import { PlatformLoadingState } from "../platform-ui/components/composite/loading-state/index.js";
import { PlatformIconButton } from "../platform-ui/components/ui/icon-button/index.js";
import {
  PlatformResourceActionMenuItem,
  PlatformResourceActionsDivider,
  PlatformResourceActionsInformation,
  PlatformResourceActionsMenu,
} from "../platform-ui/components/composite/resource-header-actions/index.js";
import { PlatformSwitch } from "../platform-ui/components/ui/switch/index.js";
import { ConnectionIdentityIcon } from "../platform-resources/shared/connections/connection-identity-icon.js";
import { buildRunnerThreadScreenViewModel } from "../thread/presentation.js";
import type { RunnerThreadAction, RunnerThreadMessage } from "../thread/types.js";
import { useRunnerExecution } from "./use-runner-execution.js";
import { getRunnerChatEnterAnimationStyle } from "./runner-chat-animations.js";
import { mountRunnerChatStyles } from "./runner-chat-styles.js";
import { RunnerThreadExecutionWorkbench } from "./thread/execution-workbench.js";
import { RunnerThreadUserMessageTime } from "./thread/thread-message.js";
import { useRunnerThreadProjection } from "./thread/use-runner-thread-projection.js";
import { shouldUseRunnerCanonicalThreadSurface } from "./thread/thread-surface-mode.js";
import { useRunnerLogAutoScroll } from "./runner-chat/use-log-auto-scroll.js";
import { useRunnerThreadHistoryRail } from "./runner-chat/use-thread-history-rail.js";
import { RunnerDocumentPreviewDrawer } from "./runner-document-preview-drawer.js";
import {
  buildRunnerPreviewAttachmentFromPath,
  buildRunnerPreviewDownloadUrl,
  buildRunnerPreviewHtmlPreviewUrl,
  inferRunnerPreviewMimeType,
  normalizeRunnerPreviewWorkspacePath,
  type RunnerImageUnderstandingPreviewData,
  type RunnerImageUnderstandingPreviewItem,
  type RunnerMediaGenerationPromptPreviewData,
  type RunnerPreviewAttachment,
  type RunnerWebSearchPreviewData,
  type RunnerWebSearchPreviewImage,
  type RunnerWebSearchPreviewSource,
} from "./runner-document-preview.js";
import { ComputerUseDetailDrawer, DeepResearchDetailDrawer, RunnerCodeViewer, SubagentDetailDrawer, hasActiveDeepResearchLogGroup, isBrowserSkillCommand, isBrowserSkillLaunchCommand, isComputerUseMcpLog, isDeepResearchCommand } from "../platform-ui/components/thread-components/log-boxes/index.js";
import {
  RunnerWorkStatusDisclosure,
  type RunnerWorkStatusItem,
} from "../platform-ui/components/thread-components/work-status-disclosure/index.js";
import { RunnerMarkdown, stripRunnerSystemTags as stripSystemTags } from "./runner-markdown.js";
import { DotLoader } from "./dot-loader.js";
import {
  getRunnerEmailDeliveryDisplay,
  getRunnerEmailAttachmentFilename,
  getRunnerEmailPromptDisplay,
  isRunnerEmailMetadata,
  normalizeRunnerTurnMessageMetadata,
  type RunnerEmailDeliveryAttachmentFile,
  type RunnerEmailDeliveryDisplay,
} from "./runner-chat/email-presentation.js";
import {
  getRecordNumber,
  normalizeRecordObject,
} from "./runner-chat/record-utils.js";
import {
  CollapsibleRunnerUserPrompt,
  RunnerRunSummaryJsonDocument,
  splitRunnerRunSummaryContent,
} from "./runner-chat/run-summary-content.js";
export type {
  RunnerChatRunSummaryJsonRenderContext,
  RunnerChatUserPromptRenderContext,
} from "./runner-chat/run-summary-content.js";
import {
  renderRunnerSummaryResourceChip,
} from "./runner-chat/run-summary-presentation.js";
import {
  RunnerTurnIdentity,
} from "./runner-chat/turn-presentation.js";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCloud,
  IconFile,
  IconFileText,
  IconFolderOpen,
  IconFolderPlus,
  IconGithub,
  IconGoogleDrive,
  IconImages,
  IconLayers,
  IconLogout,
  IconMic,
  IconNotion,
  IconOneDrive,
  IconPaperclip,
  IconPlus,
  IconSearch,
  IconStop,
  IconX,
} from "./runner-chat/icons.js";
import {
  type RunnerAgentSelectorMode,
  type RunnerReasoningEffortId,
} from "./runner-chat/voice-audio.js";
import { useRunnerSpeechToText } from "./runner-chat/use-speech-to-text.js";
import { useRunnerVoiceModeSession } from "./runner-chat/use-voice-mode-session.js";
import {
  RunnerVoiceModeControl,
  RunnerVoiceModeStatusBar,
} from "./runner-chat/voice-mode-presentation.js";
import {
  RunnerAgentSelectorControl,
  RunnerComposerOrganizationSelector,
  RunnerWorkspaceSelectorControl,
} from "./runner-chat/composer-selector-controls.js";
import { RunnerThreadContextControl } from "./runner-chat/thread-context-control.js";
import {
  RunnerFileBrowserItem,
  renderRunnerBrowserFileIcon,
} from "./runner-chat/file-browser-item.js";
import {
  RunnerTimelineWorkLogEntry,
  renderRunnerCanonicalThreadAction,
  renderRunnerNestedTimelineItems,
  renderRunnerTimelineItem,
  type RunnerTimelineRenderContext,
} from "./runner-chat/timeline-renderer.js";
import {
  RUNNER_AD_ASPECT_RATIO_OPTIONS,
  RUNNER_AD_CREATION_DEFAULT_SETTINGS,
  RUNNER_AD_QUALITY_OPTIONS,
  RUNNER_AD_STYLE_OPTIONS,
  RUNNER_AD_VARIANT_OPTIONS,
  buildStagedRunnerAdCreationCommand,
  formatRunnerAdCreationComputeTokens,
  getRunnerAdCreationQualityComputeTokensPerImage,
  normalizeRunnerAdCreationSettings,
  resolveRunnerSlashCommandInputState,
  type RunnerAdCreationAspectRatioId,
  type RunnerAdCreationQualityId,
  type RunnerAdCreationSettings,
  type RunnerAdCreationStyleId,
  type RunnerAdCreationVariantCount,
  type StagedBacklogCommand,
} from "./runner-chat/composer-commands.js";
import {
  buildRunnerAgentGuardrailsHiddenPrompt,
  buildRunnerExecutionPromptWithHiddenContext,
  getRunnerAgentOptionPhotoUrl,
  getRunnerAgentSelectorMode,
  getRunnerPreferredDefaultAgentOption,
  getRunnerProjectEnvironmentId,
  isRunnerHumanAgentOption,
  isRunnerTeamAgentOption,
  mergeRunnerChatOptions,
  normalizeRunnerReasoningEffort,
  orderOptionsWithPinnedTop,
  RUNNER_REASONING_EFFORT_OPTIONS,
  type RunnerChatOption,
  type RunnerChatProjectOption,
} from "./runner-chat/agent-options.js";
export type {
  RunnerChatOption,
  RunnerChatProjectOption,
} from "./runner-chat/agent-options.js";
import type {
  LocalAttachment,
  RunnerTurnAttachment,
} from "./runner-chat/attachment-types.js";
export type {
  RunnerAttachment,
  RunnerChatImplicitAttachment,
} from "./runner-chat/attachment-types.js";
import {
  attachmentTypeForFile,
  buildSelectedGithubRepoReference,
  createGithubBrowserNodeId,
  createGithubBrowserRepoFolderId,
  isAttachmentDocumentPreviewable,
  parseGithubBrowserFolderId,
} from "./runner-chat/attachment-utils.js";
import { parseRunnerPromptEmbeddedAttachments } from "./runner-chat/prompt-attachments.js";
import { RunnerAttachmentPreviewChip } from "./runner-chat/attachment-preview-chip.js";
import {
  RUNNER_THREAD_HISTORY_ACTIVE_LINE_WIDTH,
  buildRunnerThreadHistoryItems,
  buildRunnerThreadHistoryItemId,
  getRunnerThreadHistoryLineWidth,
} from "./runner-chat/thread-history.js";
import {
  fetchAllThreadMessages,
  getRunnerLogAbsoluteTimestampMs,
  isComputeTokenBudgetErrorLog,
  isComputeTokenBudgetErrorMessage,
  isRunnerModelProviderUnavailableMessage,
  sanitizeRunnerMessage,
  type RunnerConversationMessage,
} from "./runner-chat/conversation-messages.js";
import { parseSecondsFromClock } from "./runner-chat/time-utils.js";
import {
  buildRunnerHeaders,
  sanitizeBackendUrl,
} from "./runner-chat/api-utils.js";
import {
  createThread,
  DEFAULT_NEW_THREAD_TITLE,
  forkThreadRequest,
  type RunnerForkExistingEnvironmentFileCopyMode,
} from "./runner-chat/thread-api.js";
import {
  reportRunnerLifecycleCallbackError,
  startEnvironment,
} from "./runner-chat/environment-api.js";
import {
  buildFileFromFetchedContent,
  uploadAttachment,
} from "./runner-chat/attachment-api.js";
import {
  createRunnerImplicitAttachments,
} from "./runner-chat/attachment-factories.js";
export type {
  RunnerChatFetchedFileContent,
} from "./runner-chat/attachment-api.js";
import {
  buildRunnerAttachmentFromPreviewAttachment,
  buildTurnAttachmentsFromLocalAttachments,
  buildTurnAttachmentsFromRunnerAttachments,
  isRunnerImagePreviewAttachment,
  isRunnerTurnDisplayHiddenAttachment,
  mergeRunnerTurnAttachments,
  normalizeTurnAttachments,
  pickTurnAttachments,
} from "./runner-chat/turn-attachments.js";
import type {
  RunnerQuotedSelection,
  RunnerQuotedSelectionSource,
  RunnerTurn,
  RunnerTurnStatus,
} from "./runner-chat/turn-types.js";
import type {
  RunnerThreadHydrationPayload,
} from "./runner-chat/hydration/types.js";
import {
  dedupeAdjacentRunnerLogs,
  normalizeHydratedLog,
  runnerLogSignature,
  shouldDisplayTimelineLog,
} from "./runner-chat/hydration/log-normalization.js";
import {
  buildSubagentTimelineGroups,
  getTurnMetronomeWorkflowPromptLog,
  isBrowserTimelineLog,
  isComputerUseTimelineLog,
  isDeepResearchTimelineCommand,
  isRunnerTimelineToolCallItem,
  logBelongsToSubagentInvocation,
  type RunnerTimelineItem,
  type RunnerTurnTimelineState,
} from "./runner-chat/legacy-timeline.js";
import {
  buildBrowserGroupPresentation,
  buildComputerUseGroupPresentation,
  buildSubagentGroupPresentation,
  getBrowserTimelineGroupId,
  timelineItemKey,
  type RunnerComputerUsePresentation,
  type RunnerSubagentPresentation,
} from "./runner-chat/legacy-timeline-presentation.js";
import {
  isRunningThreadLifecycleStatus,
} from "./runner-chat/hydration/lifecycle-status.js";
import {
  fetchThreadHydrationPayload,
} from "./runner-chat/hydration/api.js";
import {
  applyHydratedRunningThreadState,
  getRunnerBatchQueueReceiptLabel,
  getTurnBatchQueueReceipt,
  getTurnAssistantMessageText,
  isActiveTurnStatus,
  isRunningTurnStatus,
  isTurnResponseLog,
  turnPresentation,
} from "./runner-chat/hydration/turn-state.js";
import {
  buildHydratedTurnsFromMessages,
} from "./runner-chat/hydration/message-turns.js";
import {
  mergeHydratedTurns,
} from "./runner-chat/hydration/turn-merge.js";
import {
  buildHydratedTurnsFromLogs,
  buildHydratedTurnsFromPayload,
} from "./runner-chat/hydration/turn-builders.js";
import { useRunnerRunningThreadReattachment } from "./runner-chat/hydration/use-running-thread-reattachment.js";
import { useRunnerThreadHistoryHydration } from "./runner-chat/hydration/use-thread-history-hydration.js";
import { useRunnerInitialSurfaceReadiness } from "./runner-chat/use-initial-surface-readiness.js";
import {
  normalizeQuotedSelection,
  previewQuotedSelectionText,
  sanitizeQuotedSelectionText,
} from "./runner-chat/quoted-selection.js";
import {
  findQuotedSelectionContainer,
  getQuotedSelectionSourceType,
} from "./runner-chat/quoted-selection-dom.js";
import { generateRunnerClientId as generateId } from "./runner-chat/id-utils.js";
import {
  formatThreadContextCommandText,
  parseThreadContextCommand,
  stagedThreadContextCommandOffset,
  stagedThreadContextCommandTone,
  threadContextActionAllowsPrompt,
  type ParsedThreadContextCommand,
  type RunnerChatThreadContextAction,
} from "./runner-chat/thread-context-utils.js";
import {
  streamRunnerThreadBtw,
} from "./runner-chat/thread-context-api.js";
import {
  executeRunnerThreadContextAction,
} from "./runner-chat/thread-context-action.js";
import {
  getRunnerMissionControlAgentName,
  getRunnerMissionControlAgentPhotoUrl,
  renderRunnerMissionControlPreviewCard,
  renderRunnerTaskPreviewCard,
  type RunnerTaskPreview,
} from "./runner-chat/task-preview.js";
import {
  buildWorkspaceSelectionStorageKey,
  childFolderPath,
  fileItemsForParent,
  formatBrowserFileSize,
  notionDatabasesToFileItems,
  normalizeWorkspaceSelectorMode,
  persistWorkspaceSelection,
  type RunnerChatFileNode,
} from "./runner-chat/workspace-files.js";
import {
  collectTurnChangedFiles,
} from "./runner-chat/turn-file-changes.js";
import {
  resolveRunnerEditableTurnBoundary,
} from "./runner-chat/editable-turn-boundary.js";
import {
  mapExpandedTurns,
} from "./runner-chat/turn-expansion.js";
import {
  normalizeRunnerFileBrowserSource,
  type RunnerFileBrowserSource,
} from "./runner-chat/file-browser-source.js";
import { useRunnerFileBrowserNavigation } from "./runner-chat/use-file-browser-navigation.js";
import { useRunnerFileBrowserPreview } from "./runner-chat/use-file-browser-preview.js";
import { useRunnerFileBrowserSourceLoaders } from "./runner-chat/use-file-browser-source-loaders.js";
import { useRunnerFileBrowserSourceState } from "./runner-chat/use-file-browser-source-state.js";
import {
  deleteRunnerWorkspaceFile,
  isRunnerWorkspacePathWithin,
  remapRunnerWorkspaceItemPath,
  renameRunnerWorkspaceFile,
} from "./runner-chat/file-browser-workspace-actions.js";
import { useRunnerFileDropController } from "./runner-chat/use-file-drop-controller.js";
import { useRunnerFileBrowserAttachmentController } from "./runner-chat/use-file-browser-attachment-controller.js";
import { useRunnerAttachmentController } from "./runner-chat/use-attachment-controller.js";
import { generateRunnerClientId } from "./runner-chat/id-utils.js";
import { useRunnerForkConfigurationController } from "./runner-chat/use-fork-configuration-controller.js";
import { useRunnerRunStopController } from "./runner-chat/use-run-stop-controller.js";
import { useRunnerThreadContextController } from "./runner-chat/use-thread-context-controller.js";
import { useRunnerDeepResearchSessionsController } from "./runner-chat/use-deep-research-sessions-controller.js";
import { tryRouteRunnerCommunicatorMessage } from "./runner-chat/communicator-router.js";
import {
  completeRunnerParticipantNeutralTurn,
  createRunnerParticipantNeutralPendingTurn,
} from "./runner-chat/participant-neutral-routing.js";
import { useRunnerGithubBranchSelection } from "./runner-chat/use-github-branch-selection.js";
import { useRunnerAgentSelectionController } from "./runner-chat/use-agent-selection-controller.js";
import { useRunnerCustomSkillsController } from "./runner-chat/use-custom-skills-controller.js";
import { useRunnerEnabledSkillsController } from "./runner-chat/use-enabled-skills-controller.js";
import { useRunnerExternalComposerCommandStaging } from "./runner-chat/use-external-composer-command-staging.js";
import { useRunnerIntegrationSelectionController } from "./runner-chat/use-integration-selection-controller.js";
import { useRunnerStagedComposerCommands } from "./runner-chat/use-staged-composer-commands.js";
import { useRunnerWorkspaceSelectionController } from "./runner-chat/use-workspace-selection-controller.js";
import {
  formatRunnerDateTimeLocalValue,
  formatRunnerScheduleChipLabel,
  useRunnerScheduleController,
} from "./runner-chat/use-schedule-controller.js";
import {
  buildRunnerConnectorPayload,
  filterRunnerConnectorOptions,
  getRunnerConnectorIdsFromMessageMetadata,
  getRunnerConnectorIdsFromPayload,
  mergeRunnerConnectorPayloads,
  normalizeRunnerConnectorOptions,
  normalizeRunnerSelectedConnectorIds,
  replaceRunnerConnectorMention,
  resolveRunnerConnectorMentionInputState,
  RUNNER_CONNECTOR_IDS_METADATA_KEY,
  type RunnerConnectorMentionInputState,
} from "./runner-chat/composer-connectors.js";
import { RunnerUserMessageContent } from "./runner-chat/message-connectors.js";
import {
  buildRunnerKnowledgeContextFromAttachments,
  mergeRunnerKnowledgeContexts,
  type RunnerKnowledgeContext,
} from "./runner-chat/knowledge-context.js";
import {
  buildRunnerTurnMessageMetadataIndex,
  buildRunnerTurnWorkingLabelIndex,
} from "./runner-chat/canonical-message-metadata.js";
import type {
  RunnerChatConnectorOption,
  RunnerChatBatchJobSubmitPayload,
  RunnerChatDriveConfig,
  RunnerChatFollowUpAction,
  RunnerChatGithubConfig,
  RunnerChatKnowledgeAttachment,
  RunnerChatNotionConfig,
  RunnerChatPromptAttachment,
  RunnerChatThreadAttachment,
  RunnerChatProps,
} from "./runner-chat/public-types.js";
export type {
  RunnerChatActionSummaryClickPayload,
  RunnerChatAgentTurnClickPayload,
  RunnerChatComputerAgentsConfig,
  RunnerChatConnectorAccount,
  RunnerChatConnectorOption,
  RunnerChatConnectorFetchOptions,
  RunnerChatDriveConfig,
  RunnerChatExternalFileBrowserRequest,
  RunnerChatExternalPromptAttachmentRequest,
  RunnerChatExternalRunRequest,
  RunnerChatFollowUpAction,
  RunnerChatGithubConfig,
  RunnerChatInputMode,
  RunnerChatNotionConfig,
  RunnerChatKnowledgeAttachment,
  RunnerChatProjectTaskSubmitPayload,
  RunnerChatComposerSubmitPayload,
  RunnerChatBatchJobSubmitPayload,
  RunnerChatProjectsConfig,
  RunnerChatProps,
  RunnerChatPromptAttachment,
  RunnerChatThreadAttachment,
  RunnerChatScheduleConfig,
  RunnerChatSchedulePreset,
  RunnerChatSummaryWorkspacePathClickPayload,
  RunnerChatWorkspaceConfig,
  RunnerThreadTaskListItem,
  RunnerThreadTaskListSummary,
} from "./runner-chat/public-types.js";
export type {
  RunnerFileBrowserSource,
} from "./runner-chat/file-browser-source.js";
export type {
  RunnerKnowledgeContext,
  RunnerKnowledgeContextBinding,
  RunnerKnowledgeContextMode,
} from "./runner-chat/knowledge-context.js";
import { useRunnerExternalRunRequest } from "./runner-chat/execution/external-run-request.js";
import { useRunnerWorkLogPagination } from "./runner-chat/use-work-log-pagination.js";
import {
  getRunnerTurnDurationSeconds,
  getRunnerTurnWorkHeadline,
} from "./runner-chat/turn-status-presentation.js";
import {
  buildRunnerOriginalActionLogIndex,
} from "./runner-chat/canonical-action-log-index.js";
import {
  buildRunnerTurnTimelineState,
} from "./runner-chat/turn-timeline-state.js";
import {
  useRunnerQueuedExecution,
  type RunnerPendingMessage,
} from "./runner-chat/execution/queued-execution.js";
import { useRunnerTurnNoticeController } from "./runner-chat/use-turn-notice-controller.js";
import {
  tryRouteRunnerActiveRunInstruction,
} from "./runner-chat/execution/active-run-instruction.js";
import { RunnerPageQueueReceipt } from "./runner-chat/execution/page-queue-receipt.js";
import { createRunnerThreadRunExecutor } from "./runner-chat/execution/thread-run-executor.js";
import { RunnerCanonicalThreadSurface } from "./runner-chat/canonical-thread-surface.js";
import { adaptRunnerThreadPermissionRequestToRunnerLog } from "./runner-chat/permission-log-adapter.js";
import {
  applyRunnerPermissionDecision,
  submitRunnerPermissionDecision,
} from "./runner-chat/permission-decision.js";
import { RunnerFileBrowserDialog } from "./runner-chat/file-browser-dialog.js";
import {
  RunnerEditConfirmationDialog,
  RunnerForkThreadDialog,
  RunnerFeedbackDialog,
} from "./runner-chat/workflow-dialogs.js";
import {
  getRunnerComposerPlanDisplay,
} from "./runner-chat/composer-plan.js";
import {
  isPlusPopupId,
  renderComposerPopupPortal,
  useComposerAnchoredPopupStyle,
} from "./runner-chat/composer-popup.js";
import { RunnerComposerSuggestionPopup } from "./runner-chat/composer-suggestion-popup.js";
import {
  useRunnerComposerPopupController,
} from "./runner-chat/use-composer-popup-controller.js";
import {
  useRunnerComposerQuotedSelection,
} from "./runner-chat/use-composer-quoted-selection.js";
import {
  useRunnerDocumentPreviewController,
} from "./runner-chat/use-document-preview-controller.js";
import {
  useRunnerThreadFeedbackController,
} from "./runner-chat/use-thread-feedback-controller.js";
import {
  extractDeepResearchSessionIdFromLogs,
  extractDeepResearchTopicFromGroup,
  resolveDeepResearchSessionForGroup,
} from "./runner-chat/deep-research-session.js";
import {
  buildRunnerImageSelectionInpaintPrompt,
  createRunnerImageSelectionMaskFile,
} from "./runner-chat/image-selection.js";
import {
  getRunnerLogRangeDurationLabel,
  getRunnerLogTimestampMs,
  runnerExecutionStatusTone as statusTone,
  toRunnerLogDurationLabel as toDurationLabel,
} from "./runner-chat/log-presentation.js";
import {
  buildEnabledSkillsPayload,
  buildEnabledSkillsStorageKey,
  customSkillIconComponent,
  normalizeComputerAgentSkills,
  normalizeEnabledSkillIdList,
  type RunnerChatSkill,
} from "./runner-chat/skill-configuration.js";
export type {
  RunnerChatThreadContext,
  RunnerChatThreadContextAction,
  RunnerChatThreadContextAvailableActions,
  RunnerChatThreadContextCategory,
  RunnerChatThreadContextCategoryKey,
  RunnerChatThreadContextDetails,
} from "./runner-chat/thread-context-utils.js";
export type {
  RunnerMissionControlPreview,
  RunnerTaskPreview,
} from "./runner-chat/task-preview.js";
export type {
  RunnerChatFileNode,
  RunnerChatNotionDatabase,
} from "./runner-chat/workspace-files.js";
export type {
  RunnerChatSkill,
  RunnerChatSkillDefaults,
} from "./runner-chat/skill-configuration.js";
export type {
  RunnerChatMetronomeWorkflowRunPayload,
} from "./runner-chat/metronome-workflow.js";

const RUNNER_EMAIL_ATTACHMENT_FILE_ICON_URL = new URL(
  "../platform-ui/components/thread-components/assets/email-attachment.webp",
  import.meta.url,
).toString();
const RUNNER_TRANSPARENT_LOGO_URL = "https://computer-agents.com/img/logos/runnertransparent.png";
const RUNNER_WORK_LOG_PAGE_SIZE = 10;

interface RunnerQuotedSelectionPopupState {
  selection: RunnerQuotedSelection;
  x: number;
  y: number;
}

interface PendingEditConfirmation {
  turnId: string;
  nextPrompt: string;
  changedFiles: Array<{
    path: string;
    kind: "created" | "modified" | "deleted";
    additions?: number;
    deletions?: number;
  }>;
}

interface RunnerSelectedSubagentDetail {
  turnId: string;
  invocationId: string;
}

interface RunnerSelectedDeepResearchDetail {
  turnId: string;
}

type RunnerVisualDetailKind = "browser" | "computer_use";

interface RunnerSelectedComputerUseDetail {
  turnId: string;
  groupId: string;
  kind?: RunnerVisualDetailKind;
}

interface RunnerSelectedDeepResearchDetailPresentation {
  turn: RunnerTurn;
  logs: RunnerLog[];
  runningCommandLog?: RunnerLog;
  session: RunnerDeepResearchSession | null;
  timeLabel?: string;
  fallbackTopic?: string | null;
}

const ATTACH_FILES_SHORTCUT_KEY = "u";
const SCHEDULE_SHORTCUT_KEY = "s";
const PROMPTS_SHORTCUT_KEY = "p";
const RUNNER_CHAT_TAG_CONNECTOR_IDS = new Set(["discord", "email", "telegram"]);

function getRunnerChatConnectorIdentityKind(
  option: RunnerChatConnectorOption,
): "tags" | "plugins" {
  if (
    option.kind === "tag"
    || (
      option.kind !== "plugin"
      && RUNNER_CHAT_TAG_CONNECTOR_IDS.has(option.id)
    )
  ) {
    return "tags";
  }
  return "plugins";
}

function formatRunnerSlashCommandLabel(command: string): string {
  const normalizedCommand = command.replace(/^\/+/, "").trim();
  if (!normalizedCommand) {
    return "";
  }
  return `${normalizedCommand.charAt(0).toUpperCase()}${normalizedCommand.slice(1)}`;
}

type RunnerSlashPopupView = "commands" | "projects" | "reasoning";

type RunnerFileBrowserConnectorSource = "google-drive" | "notion" | "one-drive" | "github";

const RUNNER_FILE_BROWSER_CONNECTOR_LABELS: Record<RunnerFileBrowserConnectorSource, string> = {
  "google-drive": "Google Drive",
  notion: "Notion",
  "one-drive": "OneDrive",
  github: "GitHub",
};

function buildRunnerFileBrowserAccountOptions(
  source: RunnerFileBrowserConnectorSource,
  config:
    | RunnerChatGithubConfig
    | RunnerChatNotionConfig
    | RunnerChatDriveConfig
    | undefined,
) {
  if (!config?.connected) return [];
  const accounts = (Array.isArray(config.accounts) ? config.accounts : [])
    .map((account) => ({
      ...account,
      id: String(account?.id || "").trim(),
      name: String(account?.name || account?.identity || "Connected account").trim(),
      identity: String(account?.identity || account?.name || "Connected").trim(),
    }))
    .filter((account) => account.id && account.name)
    .sort((left, right) => {
      if (Boolean(left.isDefault) !== Boolean(right.isDefault)) {
        return left.isDefault ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    });
  if (accounts.length > 0) return accounts;
  return [{
    id: "__default__",
    name: `${RUNNER_FILE_BROWSER_CONNECTOR_LABELS[source]} account`,
    identity: "Default account",
    isDefault: true,
  }];
}

const RUNNER_SLASH_CORE_ACTION_COUNT = 8;

export function RunnerChat({
  backendUrl,
  apiKey,
  speechToTextUrl,
  fetchCustomSkills,
  requestHeaders,
  resolveRequestHeaders,
  environmentId,
  projectId,
  agentId,
  appId = "runner-web-sdk",
  threadId,
  title,
  threadMetadata = null,
  knowledgeContext = null,
  threadViewMode = "auto",
  composerSurfaceMode = "auto",
  initialSurfaceLoading = false,
  placeholder = "What would you like me to do?",
  privateMode = false,
  initialTask = "",
  hiddenSystemPrompt = "",
  emptyState,
  emptyStateAfterComposer,
  composerLeadingControl,
  composerBeforeAgentControl,
  className,
  disabled = false,
  autoCreateThread = true,
  maxAttachments = 20,
  implicitAttachments = [],
  showUsageInStatus = true,
  inputMode = "minimal",
  agents = [],
  hideAgentSelector = false,
  lockAgentSelector = false,
  isAgentSelectionBlocked,
  onBlockedAgentSelect,
  reasoningEffort: controlledReasoningEffort,
  onReasoningEffortChange,
  environments = [],
  hideEnvironmentSelector = false,
  lockEnvironmentSelector = false,
  skills = [],
  enabledSkillIds: controlledEnabledSkillIds,
  skillDefaults,
  computerAgents,
  uploadFiles,
  mapFileToAttachment,
  onThreadIdChange,
  onThreadTitleChange,
  onThreadStatusChange,
  onRunStart,
  onRunFinish,
  onRunCancel,
  onRunError,
  onMetronomeWorkflowRun,
  onAgentChange,
  onEnvironmentChange,
  onSkillsChange,
  onContextIndicatorClick,
  onActionSummaryClick,
  onOpenChanges,
  executionWorkbenchOpen,
  onExecutionWorkbenchOpenChange,
  onExecutionWorkbenchAvailabilityChange,
  threadTaskList = null,
  onSubagentDetailOpenChange,
  onDocumentPreviewOpenChange,
  onDeepResearchDetailOpenChange,
  threadTaskPreview = null,
  threadMissionControlPreview = null,
  selectedComposerProjectTask = null,
  composerPlanTierId = "free",
  composerOrganizations = [],
  composerOrganizationId = null,
  onComposerOrganizationChange,
  onComposerProjectTaskSubmit,
  onComposerSubmit,
  onBatchJobCreate,
  onComposerDraftChange,
  composerSubmitRequest = null,
  portalComposerSuggestions = false,
  activeTaskPreviewId = null,
  onTaskPreviewClick,
  onOpenTaskList,
  onTaskListChange,
  onResourcePreviewClick,
  onAgentTurnClick,
  onSummaryWorkspacePathClick,
  documentPreviewPortalTarget = null,
  documentPreviewPortalOnly = false,
  initialDocumentPreviewAttachment = null,
  initialDocumentPreviewToken = null,
  subagentDetailPortalTarget = null,
  disableSubagentDetailDrawer = false,
  externalRunRequest = null,
  externalFileBrowserRequest = null,
  externalPromptAttachmentRequest = null,
  onExternalPromptAttachmentRequestHandled,
  onExternalRunRequestHandled,
  onExternalRunRequestCreate,
  autoFocusComposer = false,
  composerFocusRequest = null,
  keepFocusOnSubmit = false,
  enableBacklogSubtaskCommand = false,
  backlogTaskConnectors = null,
  backlogSubtaskCommand = null,
  enableBacklogMissionControlCommand = false,
  backlogMissionControlCommand = null,
  enableResourceCreationCommand = false,
  resourceCreationCommand = null,
  resourceCreationCommandHiddenPrompt,
  onResourceCreationCommandChange,
  enableAgentCreationCommand = false,
  agentCreationCommand = null,
  agentCreationCommandHiddenPrompt,
  onAgentCreationCommandChange,
  enableSkillCreationCommand = false,
  skillCreationCommand = null,
  skillCreationCommandHiddenPrompt,
  onSkillCreationCommandChange,
  onOpenPluginsOverview,
  onOpenPromptSearch,
  onOpenKnowledgeSearch,
  onOpenThreadSearch,
  onOpenPlansBudget,
  onBacklogMissionControlSubmit,
  followUpActions = [],
  followUpError = "",
  renderUserPromptContent,
  renderRunSummaryJsonSegment,
}: RunnerChatProps) {
  const [input, setInput] = useState(initialTask);
  const [inputSelectionStart, setInputSelectionStart] = useState(() => initialTask.length);
  const [slashPopupView, setSlashPopupView] = useState<RunnerSlashPopupView>("commands");
  const [activeSlashPopupIndex, setActiveSlashPopupIndex] = useState(0);
  const [localSelectedConnectorIds, setLocalSelectedConnectorIds] = useState<string[]>(() =>
    normalizeRunnerSelectedConnectorIds(computerAgents?.selectedConnectorIds),
  );
  const [activeConnectorOptionIndex, setActiveConnectorOptionIndex] = useState(0);
  const [connectingConnectorId, setConnectingConnectorId] = useState("");
  const [dismissedConnectorMentionKey, setDismissedConnectorMentionKey] = useState("");
  const {
    selection: composerQuotedSelection,
    setSelection: setComposerQuotedSelection,
    renderedSelection: renderedComposerQuotedSelection,
    visible: isComposerQuotedSelectionVisible,
    clear: clearComposerQuotedSelection,
  } = useRunnerComposerQuotedSelection();
  const [localThreadId, setLocalThreadId] = useState<string | null>(threadId ?? null);
  const [selectedSubagentDetail, setSelectedSubagentDetail] = useState<RunnerSelectedSubagentDetail | null>(null);
  const [selectedDeepResearchDetail, setSelectedDeepResearchDetail] = useState<RunnerSelectedDeepResearchDetail | null>(null);
  const [selectedComputerUseDetail, setSelectedComputerUseDetail] = useState<RunnerSelectedComputerUseDetail | null>(null);
  const [isThreadHistoryLoading, setIsThreadHistoryLoading] = useState(false);
  const [initialHydratedThreadId, setInitialHydratedThreadId] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [batchSavedReceiptId, setBatchSavedReceiptId] = useState(0);
  const [isSavingBatchJob, setIsSavingBatchJob] = useState(false);
  const [isPreparingRun, setIsPreparingRun] = useState(false);
  const [turns, setTurns] = useState<RunnerTurn[]>([]);
  const [hydratedThreadStatus, setHydratedThreadStatus] = useState<string | null>(null);
  const {
    visibleWorkLogItemCountsByTurn,
    setVisibleWorkLogItemCountsByTurn,
  } = useRunnerWorkLogPagination(turns);
  const [pendingQueuedMessages, setPendingQueuedMessages] = useState<RunnerPendingMessage[]>([]);
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [editingTurnDraft, setEditingTurnDraft] = useState("");
  const [runSummaryMoreTurnId, setRunSummaryMoreTurnId] = useState<string | null>(null);
  const [emailDeliveryAttachmentsTurnId, setEmailDeliveryAttachmentsTurnId] = useState<string | null>(null);
  const [pendingEditConfirmation, setPendingEditConfirmation] = useState<PendingEditConfirmation | null>(null);
  const [expandedTurns, setExpandedTurns] = useState<Record<string, boolean>>({});
  const [expandedStepRows, setExpandedStepRows] = useState<Record<string, boolean>>({});
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const {
    open: showFileBrowserModal,
    apiKeyPromptOpen: showFileBrowserApiKeyPrompt,
    searchQuery: fileBrowserSearchQuery,
    setSearchQuery: setFileBrowserSearchQuery,
    previewId: fileBrowserPreviewId,
    setPreviewId: setFileBrowserPreviewId,
    expandedFolderIds: expandedFileBrowserFolderIds,
    setExpandedFolderIds: setExpandedFileBrowserFolderIds,
    history: fileBrowserHistory,
    historyIndex: fileBrowserHistoryIndex,
    currentEntry: currentFileBrowserEntry,
    selectedWorkspaceFileIds,
    selectedGoogleDriveFileIds,
    selectedOneDriveFileIds,
    selectedGithubFileIds,
    requestOpen: requestFileBrowserOpen,
    close: closeFileBrowserNavigation,
    closeApiKeyPrompt: closeFileBrowserApiKeyPrompt,
    switchSource: resetFileBrowserSourceNavigation,
    navigateToFolder: navigateFileBrowserToFolder,
    goBack: goFileBrowserBack,
    goForward: goFileBrowserForward,
    replaceHistory: replaceFileBrowserHistory,
    mapHistory: mapFileBrowserHistory,
    toggleSelection: toggleFileBrowserSelection,
    setSelectedWorkspaceFileIds,
    setSelectedGoogleDriveFileIds,
    setSelectedOneDriveFileIds,
    setSelectedGithubFileIds,
  } = useRunnerFileBrowserNavigation();
  const currentFileBrowserSource = currentFileBrowserEntry.source;
  const currentFileBrowserFolderId = currentFileBrowserEntry.folderId;
  const fileBrowserSourceState = useRunnerFileBrowserSourceState();
  const {
    workspace: {
      items: remoteWorkspaceItems,
      loadedFolderIds: loadedWorkspaceFolderIds,
      loadingFolderIds: loadingWorkspaceFolderIds,
      folderErrorsById: workspaceFolderErrorsById,
      loading: isWorkspaceBrowserLoading,
      error: workspaceBrowserError,
      setError: setWorkspaceBrowserError,
    },
    googleDrive: {
      items: remoteGoogleDriveItems,
      setItems: setRemoteGoogleDriveItems,
      loadedFolderIds: loadedGoogleDriveFolderIds,
      setLoadedFolderIds: setLoadedGoogleDriveFolderIds,
      loadingFolderIds: loadingGoogleDriveFolderIds,
      loading: isGoogleDriveBrowserLoading,
      error: googleDriveBrowserError,
      setError: setGoogleDriveBrowserError,
      pickerLoading: isGoogleDrivePickerLoading,
      setPickerLoading: setIsGoogleDrivePickerLoading,
    },
    oneDrive: {
      items: remoteOneDriveItems,
      loadedFolderIds: loadedOneDriveFolderIds,
      loadingFolderIds: loadingOneDriveFolderIds,
      loading: isOneDriveBrowserLoading,
      error: oneDriveBrowserError,
    },
    github: {
      items: remoteGithubItems,
      setItems: setRemoteGithubItems,
      loadedFolderIds: loadedGithubFolderIds,
      setLoadedFolderIds: setLoadedGithubFolderIds,
      loadingFolderIds: loadingGithubFolderIds,
      setLoadingFolderIds: setLoadingGithubFolderIds,
      loading: isGithubBrowserLoading,
      error: githubBrowserError,
      setError: setGithubBrowserError,
    },
    notion: {
      databases: remoteNotionDatabases,
      loaded: notionDatabasesLoaded,
      loading: isNotionBrowserLoading,
      error: notionBrowserError,
    },
    resetSource: resetFileBrowserSourceData,
    resetAfterClose: resetFileBrowserSourceDataAfterClose,
  } = fileBrowserSourceState;
  const lastExternalFileBrowserRequestTokenRef = useRef("");
  const [skillsTab, setSkillsTab] = useState<"system" | "custom">("system");
  const [activeThreadEnvironmentId, setActiveThreadEnvironmentId] = useState<string | null>(null);
  const [activeThreadEnvironmentName, setActiveThreadEnvironmentName] = useState<string | null>(null);
  const [adCreationSettings, setAdCreationSettings] = useState<RunnerAdCreationSettings>(RUNNER_AD_CREATION_DEFAULT_SETTINGS);
  const [quotedSelectionPopup, setQuotedSelectionPopup] = useState<RunnerQuotedSelectionPopupState | null>(null);
  const {
    rootRef,
    isScreenDragActive: isScreenFileDragActive,
    isDropzoneDragging: isDraggingOver,
    resetDragState: resetFileDragState,
    handleRootDragEnter: handleRootFileDragEnter,
    handleRootDragOver: handleRootFileDragOver,
    handleRootDragLeave: handleRootFileDragLeave,
    handleRootDrop: handleRootFileDrop,
    handleDropzoneDragOver,
    handleDropzoneDragLeave,
    handleDropzoneDrop,
  } = useRunnerFileDropController({
    onFilesDropped: handleDroppedLocalFiles,
  });
  const {
    activeInputPopup,
    setActiveInputPopup,
    renderedMainPopup,
    mainPopupPhase,
    renderedSidePopup,
    sidePopupPhase,
    sidePopupExitDirection,
    closeAllInputPopups,
    toggleMainMenu,
    openPlusPopup,
    togglePopup,
  } = useRunnerComposerPopupController({
    onClose: () => {
      setSelectedWorkspaceFileIds([]);
      resetFileDragState();
      clearQuotedSelectionPopup();
    },
  });
  const {
    agentPopupMode,
    initialAgentTopId,
    selectedAgentId,
    selectedReasoningEffort,
    setAgentPopupMode,
    setSelectedAgentId,
    setSelectedReasoningEffort,
  } = useRunnerAgentSelectionController({
    activePopup: activeInputPopup,
    agentId,
    agents,
    controlledReasoningEffort,
  });
  const {
    acceptLoadedSkills: acceptLoadedCustomSkills,
    customSkills,
    loading: isLoadingCustomSkills,
  } = useRunnerCustomSkillsController({
    active: activeInputPopup === "skills",
    fetchCustomSkills,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logsRef = useRef<HTMLDivElement | null>(null);
  const contentWidthRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const composerBoxRef = useRef<HTMLDivElement | null>(null);
  const selectedConnectorsInlineRef = useRef<HTMLDivElement | null>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const popupAreaRef = useRef<HTMLDivElement | null>(null);
  const plusButtonRef = useRef<HTMLButtonElement | null>(null);
  const plusMainPopupRef = useRef<HTMLDivElement | null>(null);
  const plusSidePopupRef = useRef<HTMLDivElement | null>(null);
  const contextIndicatorButtonRef = useRef<HTMLButtonElement | null>(null);
  const contextPopupRef = useRef<HTMLDivElement | null>(null);
  const agentSelectorButtonRef = useRef<HTMLButtonElement | null>(null);
  const agentPopupRef = useRef<HTMLDivElement | null>(null);
  const agentReasoningPopupRef = useRef<HTMLDivElement | null>(null);
  const environmentSelectorButtonRef = useRef<HTMLButtonElement | null>(null);
  const environmentPopupRef = useRef<HTMLDivElement | null>(null);
  const organizationSelectorButtonRef = useRef<HTMLButtonElement | null>(null);
  const organizationPopupRef = useRef<HTMLDivElement | null>(null);
  const runSummaryMoreMenuRef = useRef<HTMLSpanElement | null>(null);
  const emailDeliveryAttachmentsPopoverRef = useRef<HTMLSpanElement | null>(null);
  const currentInputRef = useRef(initialTask);
  const isDrainingQueuedRunsRef = useRef(false);
  const turnsRef = useRef<RunnerTurn[]>([]);
  const threadHydrationCacheRef = useRef<RunnerThreadHydrationPayload | null>(null);
  const notifiedTaskListLogKeysRef = useRef<Set<string>>(new Set());
  const initializedThreadHistoryIdRef = useRef<string | null>(null);
  const locallyOwnedExecutionThreadIdRef = useRef<string | null>(null);
  const lastEnvironmentStartRequestKeyRef = useRef<string | null>(null);
  const quotedSelectionPopupRef = useRef<HTMLDivElement | null>(null);
  const handledExternalRunRequestTokenRef = useRef<string | number | null>(null);
  const handledExternalPromptAttachmentRequestTokenRef = useRef<string | number | null>(null);
  const handledComposerSubmitRequestTokenRef = useRef<string | number | null>(null);

  const { status, logs, execute, cancel, clear, result } = useRunnerExecution({ clearLogsOnExecute: false });

  const normalizedBackendUrl = useMemo(() => sanitizeBackendUrl(backendUrl), [backendUrl]);
  const normalizedThreadKnowledgeContext = useMemo(
    () => mergeRunnerKnowledgeContexts(
      knowledgeContext,
      threadMetadata && typeof threadMetadata === "object"
        ? (threadMetadata as Record<string, unknown>).knowledgeContext
        : null,
    ),
    [knowledgeContext, threadMetadata],
  );
  const {
    attachment: previewedDocumentAttachment,
    imageSelectionState: previewImageSelectionState,
    setImageSelectionState: setPreviewImageSelectionState,
    maximized: isDocumentPreviewMaximized,
    actionMenuOpen: documentPreviewActionMenuOpen,
    setActionMenuOpen: setDocumentPreviewActionMenuOpen,
    drawerWidth: documentPreviewDrawerWidth,
    actionMenuRef: documentPreviewActionMenuRef,
    close: closeDocumentAttachmentPreview,
    toggleAttachment: toggleDocumentAttachmentPreview,
    toggleMaximized: toggleDocumentPreviewMaximized,
    startResize: startDocumentPreviewResize,
    getOpenUrl: getDocumentPreviewOpenUrl,
    copyValue: copyDocumentPreviewValue,
  } = useRunnerDocumentPreviewController({
    backendUrl: normalizedBackendUrl,
    initialAttachment: initialDocumentPreviewAttachment,
    initialAttachmentToken: initialDocumentPreviewToken,
    onBeforeOpen: () => {
      closeDeepResearchDetailDrawer();
      closeSubagentDetailDrawer();
      closeComputerUseDetailDrawer();
    },
    onOpenChange: onDocumentPreviewOpenChange,
  });
  const {
    isListening,
    recordingElapsedSeconds,
    resetDraft: resetSpeechDraft,
    stop: stopSpeechToText,
    supportsSpeechToText,
    toggle: toggleSpeechToText,
  } = useRunnerSpeechToText({
    apiKey,
    backendUrl: normalizedBackendUrl,
    input,
    onError: setInlineError,
    onInputChange: setInput,
    requestHeaders,
    speechToTextUrl,
  });
  const applyStagedComposerDraft = useCallback(
    (prompt: string) => {
      setInput(prompt);
      currentInputRef.current = prompt;
      resetSpeechDraft(prompt);
    },
    [resetSpeechDraft],
  );
  const readCurrentComposerDraft = useCallback(
    () => currentInputRef.current,
    [],
  );
  const {
    stagedThreadContextCommand,
    stagedResourceCreationCommand,
    stagedAgentCreationCommand,
    stagedSkillCreationCommand,
    stagedSlideCreationCommand,
    stagedResearchCreationCommand,
    stagedScrapeCreationCommand,
    stagedParseCreationCommand,
    stagedAdCreationCommand,
    stagedBacklogSubtaskCommand,
    stagedBacklogMissionControlCommand,
    stagedBatchCreationCommand,
    stagedLoopCommand,
    clearAllStagedCommands,
    clearStagedCommand,
    dismissActiveCommand: dismissActiveStagedCommand,
    refreshStagedAdCreationCommand,
    setComposerDraft,
    tryAutoStageInput,
    stageThreadContextCommand,
    stageBacklogSubtaskCommand,
    stageBacklogMissionControlCommand,
    stageBatchCreationCommand,
    stageLoopCommand,
    stageResourceCreationCommand,
    stageAgentCreationCommand,
    stageSkillCreationCommand,
    stageSlideCreationCommand,
    stageResearchCreationCommand,
    stageScrapeCreationCommand,
    stageParseCreationCommand,
    stageAdCreationCommand,
  } = useRunnerStagedComposerCommands({
    adCreationSettings,
    getCurrentDraft: readCurrentComposerDraft,
    onDraftChange: applyStagedComposerDraft,
  });
  const prepareExternallyStagedComposerCommand = useCallback(() => {
    closeAllInputPopups();
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [closeAllInputPopups]);
  useRunnerExternalComposerCommandStaging({
    backlogSubtask: backlogSubtaskCommand,
    backlogMissionControl: backlogMissionControlCommand,
    resourceCreation: resourceCreationCommand,
    agentCreation: agentCreationCommand,
    skillCreation: skillCreationCommand,
    enableBacklogSubtask: enableBacklogSubtaskCommand,
    enableBacklogMissionControl: enableBacklogMissionControlCommand,
    enableResourceCreation: enableResourceCreationCommand,
    enableAgentCreation: enableAgentCreationCommand,
    enableSkillCreation: enableSkillCreationCommand,
    stagedResourceCreationType:
      stagedResourceCreationCommand?.action || null,
    stagedAgentCreationType: stagedAgentCreationCommand?.action || null,
    stagedSkillCreationType: stagedSkillCreationCommand?.action || null,
    onResourceCreationChange: onResourceCreationCommandChange,
    onAgentCreationChange: onAgentCreationCommandChange,
    onSkillCreationChange: onSkillCreationCommandChange,
    onStage: prepareExternallyStagedComposerCommand,
    stageBacklogSubtask: stageBacklogSubtaskCommand,
    stageBacklogMissionControl: stageBacklogMissionControlCommand,
    stageResourceCreation: stageResourceCreationCommand,
    stageAgentCreation: stageAgentCreationCommand,
    stageSkillCreation: stageSkillCreationCommand,
  });
  const normalizedSkills = useMemo(() => normalizeComputerAgentSkills(skills), [skills]);
  const displayedSkills = useMemo(() => [...normalizedSkills, ...customSkills], [customSkills, normalizedSkills]);
  const controlledEnabledSkillIdsList = useMemo(
    () => normalizeEnabledSkillIdList(controlledEnabledSkillIds),
    [controlledEnabledSkillIds]
  );
  const enabledSkillsStorageKey = useMemo(() => buildEnabledSkillsStorageKey(appId), [appId]);
  const { enabledSkillIds, toggleSkill } = useRunnerEnabledSkillsController({
    controlledEnabledSkillIds: controlledEnabledSkillIdsList,
    normalizedSkills,
    onChange: onSkillsChange,
    storageKey: enabledSkillsStorageKey,
  });
  const workspaceSelectionStorageKey = useMemo(
    () => buildWorkspaceSelectionStorageKey(appId, normalizedBackendUrl),
    [appId, normalizedBackendUrl]
  );
  const systemSkills = useMemo(() => displayedSkills.filter((skill) => !skill.isCustom), [displayedSkills]);
  const customSkillItems = useMemo(() => displayedSkills.filter((skill) => skill.isCustom), [displayedSkills]);
  const githubConfig = computerAgents?.github;
  const notionConfig = computerAgents?.notion;
  const googleDriveConfig = computerAgents?.googleDrive;
  const oneDriveConfig = computerAgents?.oneDrive;
  const workspaceConfig = computerAgents?.workspace;
  const scheduleConfig = computerAgents?.schedule;
  const projectsConfig = computerAgents?.projects;
  const [fileBrowserAccountOverrides, setFileBrowserAccountOverrides] = useState<
    Partial<Record<RunnerFileBrowserConnectorSource, string>>
  >({});
  const fileBrowserAccountOptionsBySource = useMemo(
    () => ({
      "google-drive": buildRunnerFileBrowserAccountOptions("google-drive", googleDriveConfig),
      notion: buildRunnerFileBrowserAccountOptions("notion", notionConfig),
      "one-drive": buildRunnerFileBrowserAccountOptions("one-drive", oneDriveConfig),
      github: buildRunnerFileBrowserAccountOptions("github", githubConfig),
    }),
    [githubConfig, googleDriveConfig, notionConfig, oneDriveConfig],
  );
  const fileBrowserAccountIdsBySource = useMemo(() => {
    const configs = {
      "google-drive": googleDriveConfig,
      notion: notionConfig,
      "one-drive": oneDriveConfig,
      github: githubConfig,
    } as const;
    const next = {} as Record<RunnerFileBrowserConnectorSource, string>;
    (Object.keys(fileBrowserAccountOptionsBySource) as RunnerFileBrowserConnectorSource[]).forEach((source) => {
      const options = fileBrowserAccountOptionsBySource[source];
      const configuredId = String(configs[source]?.selectedAccountId || "").trim();
      const overriddenId = String(fileBrowserAccountOverrides[source] || "").trim();
      next[source] =
        (overriddenId && options.some((option) => option.id === overriddenId) && overriddenId)
        || (configuredId && options.some((option) => option.id === configuredId) && configuredId)
        || options.find((option) => option.isDefault)?.id
        || options[0]?.id
        || "";
    });
    return next;
  }, [
    fileBrowserAccountOptionsBySource,
    fileBrowserAccountOverrides,
    githubConfig,
    googleDriveConfig,
    notionConfig,
    oneDriveConfig,
  ]);
  const currentFileBrowserAccountId = currentFileBrowserSource === "workspace"
    ? ""
    : fileBrowserAccountIdsBySource[currentFileBrowserSource as RunnerFileBrowserConnectorSource] || "";
  const activeFileBrowserAccountId = currentFileBrowserAccountId === "__default__"
    ? ""
    : currentFileBrowserAccountId;
  const {
    clearScheduledTask,
    scheduleEnabled,
    schedulePresets,
    scheduledAtValue,
    scheduledTask,
    scheduleType,
    selectedSchedulePresetId,
    setScheduledAtValue,
    setScheduleType,
    setSelectedSchedulePresetId,
    submitSchedule: handleScheduleSubmit,
  } = useRunnerScheduleController({
    config: scheduleConfig,
    onInvalidSchedule: setInlineError,
    onSubmitted: closeAllInputPopups,
  });
  const githubRepositories = githubConfig?.repositories || [];
  const githubContexts = githubConfig?.contexts || [];
  const notionDatabases = notionConfig?.fetchDatabases ? remoteNotionDatabases : notionConfig?.databases || [];
  const googleDriveItems = googleDriveConfig?.fetchItems ? remoteGoogleDriveItems : googleDriveConfig?.items || [];
  const oneDriveItems = oneDriveConfig?.fetchItems ? remoteOneDriveItems : oneDriveConfig?.items || [];
  const githubItems = githubConfig?.fetchItems ? remoteGithubItems : [];
  const notionItems = notionDatabasesToFileItems(notionDatabases);
  const {
    googleDriveFolderId,
    oneDriveFolderId,
    selectedGithubContextId,
    selectedGithubRepositoryId,
    selectedNotionDatabaseId,
    selectGithubContext,
    selectGithubRepository,
    selectNotionDatabase,
    setGoogleDriveFolderId,
    setOneDriveFolderId,
    setSelectedNotionDatabaseId,
  } = useRunnerIntegrationSelectionController({
    githubContexts,
    githubRepositories,
    notionDatabases,
    selectedGithubContextId: githubConfig?.selectedContextId,
    selectedGithubRepositoryId: githubConfig?.selectedRepositoryId,
    selectedNotionDatabaseId: notionConfig?.selectedDatabaseId,
    onGithubContextChange: githubConfig?.onContextChange,
    onGithubRepositoryChange: githubConfig?.onRepositoryChange,
    onNotionDatabaseChange: notionConfig?.onDatabaseChange,
  });
  const currentThreadId = threadId ?? localThreadId;
  const hasCurrentThread = Boolean(currentThreadId);
  const {
    actionLoading: threadContextActionLoading,
    availableActions: threadContextAvailableActions,
    beginAction: beginThreadContextAction,
    clearDetailsError: clearThreadContextDetailsError,
    context: threadContext,
    details: threadContextDetails,
    detailsError: threadContextDetailsError,
    detailsLoading: isThreadContextDetailsLoading,
    estimateLoading: isThreadContextLoading,
    finishAction: finishThreadContextAction,
    markContextCleared,
    nativeError: threadContextNativeError,
    refreshDetails: refreshThreadContextDetails,
    refreshDetailsInBackground:
      refreshThreadContextDetailsInBackground,
    resetContext: resetThreadContext,
  } = useRunnerThreadContextController({
    apiKey,
    backendUrl: normalizedBackendUrl,
    detailsRequested: renderedMainPopup === "context",
    executionRunning: status === "running",
    requestHeaders,
    threadId: currentThreadId,
  });
  const clearPendingQueuedMessagesForStop = useCallback(() => {
    setPendingQueuedMessages([]);
  }, []);
  const {
    clearStopRequest,
    consumeIntentionalStopAbort,
    handleStopActiveRun,
    isStoppingRun,
    normalizeIntentionalStopError,
  } = useRunnerRunStopController({
    apiKey,
    backendUrl: normalizedBackendUrl,
    cancelLocalExecution: cancel,
    clearQueuedMessages: clearPendingQueuedMessagesForStop,
    localExecutionRunning: status === "running",
    onContextRefresh: refreshThreadContextDetailsInBackground,
    onRunCancel,
    onRunError,
    requestHeaders,
    setError: setInlineError,
    setPreparingRun: setIsPreparingRun,
    setTurns,
    threadId: currentThreadId,
  });
  const {
    feedback: threadFeedback,
    submitRating: submitThreadFeedback,
    reportTarget: reportIssueTurn,
    reportMessage: reportIssueMessage,
    reportError: reportIssueError,
    reportSubmitting: isReportIssueSubmitting,
    openReport: openReportIssueModal,
    closeReport: closeReportIssueModal,
    setReportMessage: setReportIssueMessage,
    submitReport: submitReportIssue,
  } = useRunnerThreadFeedbackController({
    backendUrl: normalizedBackendUrl,
    apiKey,
    threadId: currentThreadId,
    requestHeaders,
    sanitizeSummary: stripSystemTags,
    onUnavailable: setInlineError,
    onReportOpen: () => setRunSummaryMoreTurnId(null),
  });
  const scopedActiveThreadEnvironmentId = hasCurrentThread ? activeThreadEnvironmentId : null;
  const scopedActiveThreadEnvironmentName = hasCurrentThread ? activeThreadEnvironmentName : null;
  const currentThreadHasMessages = useMemo(
    () => turns.some((turn) => turn.presentation !== "context-action-notice" && turn.prompt.trim().length > 0),
    [turns]
  );
  function notifyTaskListChange(threadIdValue: string | null | undefined, log: RunnerLog) {
    const normalizedThreadId = String(threadIdValue || "").trim();
    if (!normalizedThreadId || log.eventType !== "todo_list") {
      return;
    }
    const notificationKey = `${normalizedThreadId}:${runnerLogSignature(log)}`;
    if (notifiedTaskListLogKeysRef.current.has(notificationKey)) {
      return;
    }
    notifiedTaskListLogKeysRef.current.add(notificationKey);
    try {
      onTaskListChange?.(normalizedThreadId, log);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onTaskListChange", error);
    }
  }

	  useEffect(() => {
	    const normalizedThreadId = String(currentThreadId || "").trim();
	    if (!normalizedThreadId || typeof onTaskListChange !== "function") {
	      return;
	    }
    for (const turn of turns) {
      for (const log of turn.logs) {
        notifyTaskListChange(normalizedThreadId, normalizeHydratedLog(log));
	      }
	    }
	  }, [currentThreadId, onTaskListChange, turns]);
	  const currentThreadHasWorkspaceChanges = useMemo(
    () => turns.some((turn) => collectTurnChangedFiles(turn.logs).length > 0),
    [turns]
  );
  const currentThreadHasDeepResearchActivity = useMemo(
    () =>
      turns.some((turn) =>
        turn.logs.some((log) => {
          if (log.eventType === "deep_research" || log.metadata?.deepResearch) {
            return true;
          }
          const command = typeof log.metadata?.command === "string"
            ? log.metadata.command
            : typeof log.message === "string"
              ? log.message
              : "";
          return log.eventType === "command_execution" && isDeepResearchCommand(command);
        })
      ),
    [turns]
  );
  const currentThreadHasActiveDeepResearchLogs = useMemo(
    () => turns.some((turn) => hasActiveDeepResearchLogGroup(turn.logs)),
    [turns]
  );
  const isRunning = status === "running";
  const activeRunningTurn =
    [...turns].reverse().find(
      (turn) => isRunningTurnStatus(turn.status) && turn.presentation !== "btw" && turn.presentation !== "context-action-notice"
    ) || null;
  const hasRunningTurn = Boolean(activeRunningTurn);
  const hydratedThreadIsRunning = isRunningThreadLifecycleStatus(hydratedThreadStatus);
  const {
    activeSession: activeDeepResearchThreadSession,
    hasActiveSession: hasActiveDeepResearchSession,
    sessions: deepResearchSessions,
  } = useRunnerDeepResearchSessionsController({
    apiKey,
    backendUrl: normalizedBackendUrl,
    poll: currentThreadHasActiveDeepResearchLogs,
    refresh:
      currentThreadHasDeepResearchActivity ||
      Boolean(selectedDeepResearchDetail),
    requestHeaders,
    threadId: currentThreadId,
  });
  const hasHydratedReattachActivity = useMemo(
    () => hasActiveDeepResearchSession || turns.some((turn) => isActiveTurnStatus(turn.status) || hasActiveDeepResearchLogGroup(turn.logs)),
    [hasActiveDeepResearchSession, turns]
  );
  const hasRunningTurnLogs = Boolean(activeRunningTurn && activeRunningTurn.logs.length > 0);
  const showRunPreparationIndicator = isPreparingRun && !hasRunningTurn && !isRunning && !isStoppingRun;
  const showActiveRunStopButton =
    !showRunPreparationIndicator &&
    (hasRunningTurn || hydratedThreadIsRunning || hasActiveDeepResearchSession || isRunning || isStoppingRun);
  const onThreadStatusChangeRef = useRef(onThreadStatusChange);
  onThreadStatusChangeRef.current = onThreadStatusChange;
  useEffect(() => {
    if (!currentThreadId || !hasRunningTurn || hydratedThreadIsRunning) {
      return;
    }

    setHydratedThreadStatus("running");
    try {
      onThreadStatusChangeRef.current?.(currentThreadId, "running");
    } catch (error) {
      reportRunnerLifecycleCallbackError("onThreadStatusChange", error);
    }
  }, [currentThreadId, hasRunningTurn, hydratedThreadIsRunning]);
  const trimmedInput = input.trim();
  const hasComposerText = input.length > 0;
  const stagedThreadContextCommandToneValue = stagedThreadContextCommandTone(stagedThreadContextCommand);
  const stagedThreadContextCommandLabel = stagedThreadContextCommand ? `/${stagedThreadContextCommand}` : "";
  const stagedResourceCreationCommandLabel = stagedResourceCreationCommand?.label || "";
  const stagedAgentCreationCommandLabel = stagedAgentCreationCommand?.label || "";
  const stagedSkillCreationCommandLabel = stagedSkillCreationCommand?.label || "";
  const stagedSlideCreationCommandLabel = stagedSlideCreationCommand?.label || "";
  const stagedResearchCreationCommandLabel = stagedResearchCreationCommand?.label || "";
  const stagedScrapeCreationCommandLabel = stagedScrapeCreationCommand?.label || "";
  const stagedParseCreationCommandLabel = stagedParseCreationCommand?.label || "";
  const stagedAdCreationCommandLabel = stagedAdCreationCommand?.label || "";
  const stagedBatchCreationCommandLabel = stagedBatchCreationCommand?.label || "";
  const stagedLoopCommandLabel = stagedLoopCommand?.label || "";
  const stagedBacklogCommand = stagedBacklogMissionControlCommand || stagedBacklogSubtaskCommand;
  const stagedComposerLabel =
    stagedBacklogCommand?.label
    || stagedLoopCommandLabel
    || stagedBatchCreationCommandLabel
    || stagedSlideCreationCommandLabel
    || stagedAdCreationCommandLabel
    || stagedResearchCreationCommandLabel
    || stagedScrapeCreationCommandLabel
    || stagedParseCreationCommandLabel
    || stagedSkillCreationCommandLabel
    || stagedAgentCreationCommandLabel
    || stagedResourceCreationCommandLabel
    || stagedThreadContextCommandLabel;
  const stagedComposerToneValue = stagedBacklogCommand || stagedLoopCommand || stagedBatchCreationCommand || stagedResourceCreationCommand || stagedAgentCreationCommand || stagedSkillCreationCommand || stagedSlideCreationCommand || stagedResearchCreationCommand || stagedScrapeCreationCommand || stagedParseCreationCommand || stagedAdCreationCommand ? "compact" : stagedThreadContextCommandToneValue;
  const stagedComposerOffsetValue = stagedBacklogCommand || stagedLoopCommand || stagedBatchCreationCommand || stagedResourceCreationCommand || stagedAgentCreationCommand || stagedSkillCreationCommand || stagedSlideCreationCommand || stagedResearchCreationCommand || stagedScrapeCreationCommand || stagedParseCreationCommand || stagedAdCreationCommand
    ? `${Math.max(
        16,
        Math.round(
          stagedComposerLabel.length * 7
          + 20
          + (stagedResourceCreationCommand?.action === "computer" ? 14 : 0)
        )
      )}px`
    : stagedThreadContextCommandOffset(stagedThreadContextCommand);
  const hasStagedComposerCommand = Boolean(stagedThreadContextCommand || stagedLoopCommand || stagedBatchCreationCommand || stagedResourceCreationCommand || stagedAgentCreationCommand || stagedSkillCreationCommand || stagedSlideCreationCommand || stagedResearchCreationCommand || stagedScrapeCreationCommand || stagedParseCreationCommand || stagedAdCreationCommand || stagedBacklogCommand);
  const slashCommandInputState = useMemo(() => {
    if (hasStagedComposerCommand) {
      return null;
    }
    return resolveRunnerSlashCommandInputState(input, inputSelectionStart);
  }, [hasStagedComposerCommand, input, inputSelectionStart]);
  const availableConnectorOptions = useMemo(() => {
    if (computerAgents?.connectors?.length) {
      return normalizeRunnerConnectorOptions(computerAgents.connectors);
    }

    return normalizeRunnerConnectorOptions([
      {
        id: "github",
        name: "GitHub",
        description: "Repositories, issues, pull requests, and delivery workflows",
        connected: computerAgents?.github?.connected,
        onConnect: computerAgents?.github?.onConnect,
      },
      {
        id: "notion",
        name: "Notion",
        description: "Pages, databases, and workspace knowledge",
        connected: computerAgents?.notion?.connected,
        onConnect: computerAgents?.notion?.onConnect,
      },
      {
        id: "google-drive",
        name: "Google Drive",
        description: "Files and folders from Google Drive",
        connected: computerAgents?.googleDrive?.connected,
        onConnect: computerAgents?.googleDrive?.onConnect,
      },
      {
        id: "one-drive",
        name: "OneDrive",
        description: "Files and folders from Microsoft OneDrive",
        connected: computerAgents?.oneDrive?.connected,
        onConnect: computerAgents?.oneDrive?.onConnect,
      },
    ]);
  }, [computerAgents]);
  const selectedConnectorIds = useMemo(
    () =>
      normalizeRunnerSelectedConnectorIds(
        computerAgents?.selectedConnectorIds === undefined
          ? localSelectedConnectorIds
          : computerAgents.selectedConnectorIds,
        availableConnectorOptions,
      ),
    [
      availableConnectorOptions,
      computerAgents?.selectedConnectorIds,
      localSelectedConnectorIds,
    ],
  );
  const selectedConnectorOptions = useMemo(() => {
    const selectedIds = new Set(selectedConnectorIds);
    return availableConnectorOptions.filter((option) => selectedIds.has(option.id));
  }, [availableConnectorOptions, selectedConnectorIds]);
  const selectedConnectorsInlineStartValue = hasStagedComposerCommand
    ? stagedComposerOffsetValue
    : "16px";
  const composerTextareaOffsetValue = selectedConnectorOptions.length > 0
    ? `calc(${selectedConnectorsInlineStartValue} + var(--tb-selected-connectors-inline-width, 0px) + 8px)`
    : stagedComposerOffsetValue;
  const selectedConnectorPayload = useMemo(
    () => buildRunnerConnectorPayload(selectedConnectorIds),
    [selectedConnectorIds],
  );
  const connectorMentionInputState = useMemo(() => {
    if (hasStagedComposerCommand) {
      return null;
    }
    return resolveRunnerConnectorMentionInputState(input, inputSelectionStart);
  }, [hasStagedComposerCommand, input, inputSelectionStart]);
  const connectorMentionKey = connectorMentionInputState
    ? [
        connectorMentionInputState.start,
        connectorMentionInputState.end,
        connectorMentionInputState.query,
      ].join(":")
    : "";
  const filteredConnectorOptions = useMemo(
    () =>
      connectorMentionInputState
        ? filterRunnerConnectorOptions(
            availableConnectorOptions,
            connectorMentionInputState.query,
          )
        : [],
    [availableConnectorOptions, connectorMentionInputState],
  );
  const showConnectorMentionPopup = Boolean(
    inputMode === "computer-agents"
    && !activeInputPopup
    && connectorMentionInputState
    && connectorMentionKey !== dismissedConnectorMentionKey
    && availableConnectorOptions.length > 0
  );
  useEffect(() => {
    setActiveConnectorOptionIndex(0);
  }, [connectorMentionKey]);
  const availableSlashCommandItems = useMemo(() => {
    const items: Array<{
      id: string;
      command: string;
      description: string;
      icon: ReactNode;
      stage: () => void;
    }> = [];
    if (onBatchJobCreate) {
      items.push({
        id: "batch",
        command: "/Batch",
        description: "Save work to Batches",
        icon: <LucideTruck className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageBatchCreationCommand(slashCommandInputState?.prompt || ""),
      });
    }
    items.push({
      id: "loop",
      command: "/loop",
      description: "Run a verified improvement loop",
      icon: <LucideRepeat2 className="tb-popup-icon" strokeWidth={1.75} />,
      stage: () => stageLoopCommand(slashCommandInputState?.prompt || ""),
    });
    items.push({
      id: "slides",
      command: "/slides",
      description: "Create or adapt slides",
      icon: <LucidePresentation className="tb-popup-icon" strokeWidth={1.75} />,
      stage: () => stageSlideCreationCommand(slashCommandInputState?.prompt || ""),
    });
    items.push({
      id: "ad",
      command: "/ad",
      description: "Create or adapt an ad",
      icon: <LucideImages className="tb-popup-icon" strokeWidth={1.75} />,
      stage: () => stageAdCreationCommand(slashCommandInputState?.prompt || ""),
    });
    items.push({
      id: "research",
      command: "/research",
      description: "Deep research",
      icon: <LucideTelescope className="tb-popup-icon" strokeWidth={1.75} />,
      stage: () => stageResearchCreationCommand(slashCommandInputState?.prompt || ""),
    });
    items.push({
      id: "scrape",
      command: "/scrape",
      description: "Scrape web pages",
      icon: <LucideGlobe className="tb-popup-icon" strokeWidth={1.75} />,
      stage: () => stageScrapeCreationCommand(slashCommandInputState?.prompt || ""),
    });
    items.push({
      id: "parse",
      command: "/parse",
      description: "Parse documents",
      icon: <LucideFileText className="tb-popup-icon" strokeWidth={1.75} />,
      stage: () => stageParseCreationCommand(slashCommandInputState?.prompt || ""),
    });
    if (enableAgentCreationCommand) {
      items.push({
        id: "agent",
        command: "/agent",
        description: "Create or adapt an agent",
        icon: <LucideBot className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageAgentCreationCommand("agent", slashCommandInputState?.prompt || ""),
      });
      items.push({
        id: "team",
        command: "/team",
        description: "Create or adapt a team",
        icon: <LucideLayers className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageAgentCreationCommand("team", slashCommandInputState?.prompt || ""),
      });
    }
    if (enableResourceCreationCommand) {
      items.push({
        id: "computer",
        command: "/computer",
        description: "Create or adapt a computer",
        icon: <LucideCpu className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageResourceCreationCommand("computer", slashCommandInputState?.prompt || ""),
      });
      items.push({
        id: "app",
        command: "/app",
        description: "Create or adapt an app",
        icon: <LucideMonitor className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageResourceCreationCommand("app", slashCommandInputState?.prompt || ""),
      });
      items.push({
        id: "function",
        command: "/function",
        description: "Create or adapt a cloud function",
        icon: <LucideCode className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageResourceCreationCommand("function", slashCommandInputState?.prompt || ""),
      });
    }
    if (enableSkillCreationCommand) {
      items.push({
        id: "skill",
        command: "/skill",
        description: "Create or adapt a skill",
        icon: <LucideWand2 className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageSkillCreationCommand("skill", slashCommandInputState?.prompt || ""),
      });
    }
    return items;
  }, [enableAgentCreationCommand, enableResourceCreationCommand, enableSkillCreationCommand, onBatchJobCreate, slashCommandInputState?.prompt, stageAdCreationCommand, stageAgentCreationCommand, stageBatchCreationCommand, stageLoopCommand, stageParseCreationCommand, stageResearchCreationCommand, stageResourceCreationCommand, stageScrapeCreationCommand, stageSkillCreationCommand, stageSlideCreationCommand]);
  const filteredSlashCommandItems = useMemo(() => {
    if (!slashCommandInputState) {
      return [];
    }
    const query = slashCommandInputState.query;
    if (!query) {
      return availableSlashCommandItems;
    }
    return availableSlashCommandItems.filter((item) => item.id.startsWith(query));
  }, [availableSlashCommandItems, slashCommandInputState]);
  const showSlashCommandPopup = Boolean(
    inputMode === "computer-agents"
    && !activeInputPopup
    && !showConnectorMentionPopup
    && slashCommandInputState
    && availableSlashCommandItems.length > 0
  );
  const canRunStagedThreadContextCommand = stagedThreadContextCommand
    ? stagedThreadContextCommand === "btw"
      ? trimmedInput.length > 0
      : true
    : false;
  const canRunStagedMissionControlCommand = Boolean(stagedBacklogMissionControlCommand && onBacklogMissionControlSubmit);
  const canRun =
    !disabled &&
    !isSavingBatchJob &&
    !isPreparingRun &&
    (!hasRunningTurn || hasRunningTurnLogs) &&
    (trimmedInput.length > 0 || canRunStagedThreadContextCommand || canRunStagedMissionControlCommand);
  const useComputerAgentsMode = inputMode === "computer-agents";
  const enabledSkillsPayload = useMemo(
    () => (useComputerAgentsMode ? buildEnabledSkillsPayload(enabledSkillIds, displayedSkills, skillDefaults) : null),
    [displayedSkills, enabledSkillIds, skillDefaults, useComputerAgentsMode]
  );
  const adCreationComputeTokensPerImage = getRunnerAdCreationQualityComputeTokensPerImage(adCreationSettings.quality);
  const adCreationTotalComputeTokens = adCreationComputeTokensPerImage * adCreationSettings.variants;
  function updateAdCreationSettings(patch: Partial<RunnerAdCreationSettings>) {
    const next = normalizeRunnerAdCreationSettings({
      ...adCreationSettings,
      ...patch,
    });
    setAdCreationSettings(next);
    refreshStagedAdCreationCommand(next);
  }
  const hasApiKey = apiKey.trim().length > 0;
  const authenticatedAttachmentFetchHeaders = useMemo(
    () => buildRunnerHeaders(requestHeaders, apiKey.trim()),
    [apiKey, requestHeaders]
  );
  const canonicalThreadId = String(currentThreadId || "").trim();
  const canonicalThreadWorkbenchRequested = Boolean(
    executionWorkbenchOpen !== undefined
    || onExecutionWorkbenchOpenChange
    || onExecutionWorkbenchAvailabilityChange
  );
  const canonicalThreadEnabled = Boolean(
    canonicalThreadId
    && normalizedBackendUrl
    && (threadViewMode !== "legacy" || canonicalThreadWorkbenchRequested || hasRunningTurn)
  );
  const canonicalThread = useRunnerThreadProjection({
    threadId: canonicalThreadId,
    backendUrl: normalizedBackendUrl,
    headers: authenticatedAttachmentFetchHeaders,
    enabled: canonicalThreadEnabled,
    initialLimit: 120,
    includeLegacy: false,
  });
  const canonicalProjectionMatchesThread = canonicalThread.projection.threadId === canonicalThreadId;
  const legacyTurnMessageMetadataById = useMemo(
    () => buildRunnerTurnMessageMetadataIndex(turns, canonicalThread.projection),
    [canonicalThread.projection, turns],
  );
  const legacyUsedConnectorIds = useMemo(() => {
    const connectorIds = new Set<string>();
    for (const turn of turns) {
      const metadata = legacyTurnMessageMetadataById.get(turn.id) || turn.messageMetadata;
      for (const connectorId of getRunnerConnectorIdsFromMessageMetadata(metadata)) {
        connectorIds.add(connectorId);
      }
    }
    return Array.from(connectorIds);
  }, [legacyTurnMessageMetadataById, turns]);
  const canonicalWorkingLabelByTurnId = useMemo(
    () => buildRunnerTurnWorkingLabelIndex(turns, canonicalThread.projection),
    [canonicalThread.projection, turns],
  );
  const isVoiceModeNoticeTurn = (turn: RunnerTurn) => (
    turn.presentation === "context-action-notice"
    && turn.logs.length > 0
    && turn.logs.every((log) => log.metadata?.actionType === "voice")
  );
  const canonicalConversationMessages = Object.values(canonicalThread.projection.messagesById);
  const isCanonicalRepresentedVoiceTurn = (turn: RunnerTurn) => {
    if (turn.messageMetadata?.source !== "voice") return false;
    const prompt = turn.prompt.trim();
    const assistantContent = [...turn.logs].reverse().find((log) => (
      (log.eventType === "agent_message" || log.eventType === "llm_response") && log.message.trim()
    ))?.message.trim() || "";
    const hasNearbyMessage = (content: string, participantKind: string) => !content || canonicalConversationMessages.some((message) => {
      if (message.content.trim() !== content) return false;
      if (canonicalThread.projection.participantsById[message.authorParticipantId]?.kind !== participantKind) return false;
      const timestamp = Date.parse(message.createdAt);
      return !Number.isFinite(timestamp) || Math.abs(timestamp - turn.startedAtMs) <= 60_000;
    });
    return hasNearbyMessage(prompt, "human") && hasNearbyMessage(assistantContent, "communicator");
  };
  const substantiveLegacyTurnCount = turns.reduce(
    (count, turn) => count + (
      isVoiceModeNoticeTurn(turn)
      || (turn.presentation === "btw" && turn.messageMetadata?.source === "thread_v2_communicator")
      || isCanonicalRepresentedVoiceTurn(turn)
        ? 0
        : 1
    ),
    0,
  );
  const hasCanonicalTimelineContent = useMemo(
    () => {
      if (!canonicalProjectionMatchesThread) return false;
      const hasCanonicalRun = Object.values(canonicalThread.projection.runsById).some((run) => (
        run.metadata?.legacyInferred !== true && !run.id.startsWith("legacy_run:")
      ));
      const hasCanonicalMessage = canonicalThread.projection.timeline.some((reference) => reference.kind === "message");
      // A run is the authority boundary for migrating a legacy worker thread.
      // Message-only canonical threads are valid for voice/group chat, but only
      // when no hydrated legacy transcript would be hidden by the hand-off.
      return hasCanonicalRun || (substantiveLegacyTurnCount === 0 && hasCanonicalMessage);
    },
    [canonicalProjectionMatchesThread, canonicalThread.projection.timeline, substantiveLegacyTurnCount]
  );
  const shouldUseCanonicalThreadSurface = shouldUseRunnerCanonicalThreadSurface({
    canonicalThreadEnabled,
    canonicalProjectionMatchesThread,
    threadViewMode,
    hasCanonicalTimelineContent,
  });
  const shouldUseLegacyVoiceTranscriptFallback = threadViewMode === "legacy"
    || (substantiveLegacyTurnCount > 0 && !shouldUseCanonicalThreadSurface);
  const activeCanonicalRun = canonicalProjectionMatchesThread
    ? Object.values(canonicalThread.projection.runsById)
      .filter((run) => ["queued", "pending", "running", "parked", "waiting", "waiting_permission", "requires_action"].includes(run.status))
      .sort((left, right) => (right.updatedAt || right.createdAt).localeCompare(left.updatedAt || left.createdAt))[0] || null
    : null;
  const hasRoutableActiveRun = hasRunningTurn || Boolean(activeCanonicalRun);
  const hasCanonicalSurfaceContent = canonicalThread.projection.timeline.length > 0;
  const executionWorkbenchScreen = useMemo(
    () => buildRunnerThreadScreenViewModel(canonicalThread.projection),
    [canonicalThread.projection],
  );
  const executionWorkbenchReceipt = executionWorkbenchScreen.defaultRunId
    ? executionWorkbenchScreen.receipts.find(
      (receipt) => receipt.id === executionWorkbenchScreen.defaultRunId,
    ) || null
    : null;
  const executionWorkbenchAvailable = Boolean(canonicalThreadId);
  const detachedExecutionWorkbenchOpen = Boolean(
    !shouldUseCanonicalThreadSurface
    && executionWorkbenchOpen
    && executionWorkbenchAvailable
  );
  const workspaceItems = hasApiKey ? remoteWorkspaceItems : workspaceConfig?.items || [];
  const availableEnvironments = useMemo(
    () =>
      mergeRunnerChatOptions(environments, [
        scopedActiveThreadEnvironmentId && scopedActiveThreadEnvironmentName
          ? {
              id: scopedActiveThreadEnvironmentId,
              name: scopedActiveThreadEnvironmentName,
            }
          : null,
        environmentId && !environments.some((environment) => environment.id === environmentId)
          ? {
              id: environmentId,
              name: scopedActiveThreadEnvironmentName || "Current Environment",
            }
          : null,
      ]),
    [environmentId, environments, scopedActiveThreadEnvironmentId, scopedActiveThreadEnvironmentName]
  );
  const availableProjects = useMemo<RunnerChatProjectOption[]>(() => {
    const merged = new Map<string, RunnerChatProjectOption>();
    for (const project of projectsConfig?.items || []) {
      const normalizedProjectId = String(project?.id || "").trim();
      if (!normalizedProjectId) {
        continue;
      }
      merged.set(normalizedProjectId, {
        ...project,
        id: normalizedProjectId,
        name: String(project.name || "").trim() || "Untitled Project",
      });
    }
    return Array.from(merged.values());
  }, [projectsConfig?.items]);
  const {
    selectedEnvironmentId,
    setSelectedEnvironmentId,
    selectedProjectId,
    setSelectedProjectId,
    workspaceSelectorMode,
    setWorkspaceSelectorMode,
    selectedProject,
    selectedProjectEnvironmentId,
    effectiveWorkspaceSelectorMode,
    effectiveProjectEnvironmentId,
    initialEnvironmentTopId,
  } = useRunnerWorkspaceSelectionController({
    activeThreadEnvironmentId: scopedActiveThreadEnvironmentId,
    availableEnvironments,
    availableProjects,
    controlledProjectId: projectsConfig?.selectedProjectId,
    environmentId,
    storageKey: workspaceSelectionStorageKey,
    useComputerAgentsMode,
  });
  const summaryPreviewEnvironmentId =
    scopedActiveThreadEnvironmentId || selectedEnvironmentId || environmentId || null;
  const canPreviewSummaryWorkspacePaths = Boolean(summaryPreviewEnvironmentId);
  const effectiveAgentId = useComputerAgentsMode ? selectedAgentId || agentId : agentId;
  const explicitProjectId = typeof projectId === "string" && projectId.trim() ? projectId.trim() : null;
  const effectiveProjectId = explicitProjectId || (
    useComputerAgentsMode && effectiveWorkspaceSelectorMode === "projects" && selectedProject
      ? selectedProject.id
      : null
  );
  const effectiveEnvironmentId = useComputerAgentsMode
    ? effectiveProjectEnvironmentId || selectedEnvironmentId || environmentId
    : environmentId;
  const selectedAgent =
    agents.find((agent) => agent.id === selectedAgentId)
    || getRunnerPreferredDefaultAgentOption(agents)
    || agents[0];
  const selectedEnvironment =
    availableEnvironments.find((environment) => environment.id === selectedEnvironmentId)
    || availableEnvironments.find((environment) => environment.isDefault)
    || availableEnvironments[0];
  const displayedAgentLabel = hasApiKey ? selectedAgent?.name || "Agent" : "Default Agent";
  const displayedEnvironmentLabel = hasApiKey ? selectedEnvironment?.name || "Default" : "Default";
  const displayedWorkspaceLabel = hasApiKey
    ? effectiveWorkspaceSelectorMode === "projects" && selectedProject
      ? selectedProject.name || "Project"
      : displayedEnvironmentLabel
    : "Default";
  const sourceThreadEnvironmentId = hasCurrentThread
    ? scopedActiveThreadEnvironmentId || selectedEnvironment?.id || environmentId || null
    : null;
  const sourceThreadEnvironmentName = hasCurrentThread
    ? scopedActiveThreadEnvironmentName || selectedEnvironment?.name || null
    : null;
  const {
    buildSuggestedForkEnvironmentName,
    cancelPendingForkConfiguration: cancelForkConfiguration,
    forkDialogError,
    forkEnvironmentPopupRef,
    forkExistingEnvironmentFileCopyMode,
    forkingTurnId,
    forkNewEnvironmentFileCopyMode,
    forkNewEnvironmentName,
    forkTarget,
    forkTargetEnvironmentId,
    openMessageForkConfiguration,
    openThreadForkConfiguration,
    orderedForkTargetEnvironments,
    pendingForkConfiguration,
    resetForkConfiguration,
    selectedForkExistingEnvironment,
    setForkDialogError,
    setForkExistingEnvironmentFileCopyMode,
    setForkingTurnId,
    setForkNewEnvironmentFileCopyMode,
    setForkNewEnvironmentName,
    setForkTarget,
    setForkTargetEnvironmentId,
    setShowForkEnvironmentPopup,
    shouldShowForkExistingEnvironmentCopyOptions,
    showForkEnvironmentPopup,
  } = useRunnerForkConfigurationController({
    availableEnvironments,
    defaultEnvironmentId: environmentId,
    displayedEnvironmentLabel,
    selectedEnvironmentId,
    selectedEnvironmentName: selectedEnvironment?.name,
    sourceEnvironmentId: sourceThreadEnvironmentId,
    sourceEnvironmentName: sourceThreadEnvironmentName,
  });
  const patchTurnAttachment = useCallback(
    (
      attachmentId: string,
      patch: Partial<RunnerTurnAttachment>
    ) => {
      setTurns((prev) =>
        prev.map((turn) => {
          if (!turn.attachments?.some((attachment) => attachment.id === attachmentId)) {
            return turn;
          }
          return {
            ...turn,
            attachments: turn.attachments.map((attachment) =>
              attachment.id === attachmentId
                ? {
                    ...attachment,
                    ...patch,
                  }
                : attachment
            ),
          };
        })
      );
    },
    []
  );
  const attachmentUploadEnvironmentId = currentThreadId
    ? activeThreadEnvironmentId || selectedEnvironment?.id || environmentId || null
    : effectiveEnvironmentId || selectedEnvironment?.id || environmentId || null;
  const uploadFeedbackFiles = useCallback(
    async (files: File[]) => {
      if (uploadFiles) {
        return uploadFiles(files);
      }
      return Promise.all(
        files.map((file) => uploadAttachment({
          backendUrl: normalizedBackendUrl,
          apiKey,
          requestHeaders,
          file,
          environmentId: attachmentUploadEnvironmentId || undefined,
        })),
      );
    },
    [
      apiKey,
      attachmentUploadEnvironmentId,
      normalizedBackendUrl,
      requestHeaders,
      uploadFiles,
    ],
  );
  const {
    addAttachments,
    appendFiles,
    attachments,
    beginAttachmentUpload,
    clearComposerAttachments,
    prepareGithubRepoForThreadRun,
    pruneWorkspaceAttachmentsForEnvironment,
    removeAttachment,
    resolveAttachmentPayload,
    resolveAttachmentUploadEnvironmentId,
  } = useRunnerAttachmentController({
    apiKey,
    backendUrl: normalizedBackendUrl,
    mapFileToAttachment,
    maxAttachments,
    onTurnAttachmentPatch: patchTurnAttachment,
    requestHeaders,
    selectedAgentId,
    uploadEnvironmentId: attachmentUploadEnvironmentId,
    uploadFiles,
  });
  const {
    appendPendingThreadContextActionNotice,
    appendSyntheticActionTurn,
    appendThreadContextActionNotice,
    updateThreadContextActionNotice,
  } = useRunnerTurnNoticeController({
    agentName: selectedAgent?.name || displayedAgentLabel,
    environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
    setExpandedTurns,
    setTurns,
  });
  const {
    start: startVoiceModeSession,
    state: voiceModeState,
    stop: stopVoiceModeSession,
  } = useRunnerVoiceModeSession({
    agent: selectedAgent,
    agentId: effectiveAgentId,
    agentName: displayedAgentLabel,
    apiKey,
    backendUrl: normalizedBackendUrl,
    currentThreadId,
    disabled,
    environmentId: effectiveEnvironmentId,
    isDictationListening: isListening,
    isLegacyTranscriptFallback: shouldUseLegacyVoiceTranscriptFallback,
    isPreparingRun,
    onError: setInlineError,
    onLegacyTranscript: ({ prompt, response, metadata }) => {
      appendSyntheticActionTurn(prompt, response, "Voice mode", {
        messageMetadata: metadata,
      });
    },
    onThreadIdChange: (nextThreadId) => {
      setLocalThreadId(nextThreadId);
      try {
        onThreadIdChange?.(nextThreadId);
      } catch (error) {
        reportRunnerLifecycleCallbackError("onThreadIdChange", error);
      }
    },
    requestHeaders,
    stopDictation: stopSpeechToText,
  });
  useRunnerThreadHistoryHydration({
    agentName: displayedAgentLabel,
    apiKey,
    backendUrl: normalizedBackendUrl,
    clearExecution: clear,
    environmentName: displayedEnvironmentLabel,
    externalRunRequest,
    handledExternalRunTokenRef: handledExternalRunRequestTokenRef,
    hasApiKey,
    hasRunningTurn,
    hydrationCacheRef: threadHydrationCacheRef,
    initializedThreadIdRef: initializedThreadHistoryIdRef,
    isPreparingRun,
    locallyOwnedExecutionThreadIdRef,
    onEnvironmentHydrated: applyHydratedThreadEnvironment,
    onInitialHydrationSettled: setInitialHydratedThreadId,
    pendingQueuedMessageCount: pendingQueuedMessages.length,
    requestHeaders,
    setError: setInlineError,
    setExpandedStepRows,
    setExpandedTurns,
    setHydratedThreadStatus,
    setIsLoading: setIsThreadHistoryLoading,
    setTurns,
    threadId,
    turnsRef,
  });
  useRunnerRunningThreadReattachment({
    agentName: displayedAgentLabel,
    apiKey,
    backendUrl: normalizedBackendUrl,
    enabled: Boolean(currentThreadId && hasApiKey && normalizedBackendUrl),
    environmentName: displayedEnvironmentLabel,
    hasHydratedActivity: hasHydratedReattachActivity,
    hasRunningTurn,
    hydrationCacheRef: threadHydrationCacheRef,
    locallyOwnedExecutionThreadIdRef,
    onEnvironmentHydrated: applyHydratedThreadEnvironment,
    requestHeaders,
    setExpandedTurns,
    setHydratedThreadStatus,
    setTurns,
    threadId: currentThreadId,
    turnsRef,
  });
  const effectiveReasoningEffort = useComputerAgentsMode
    ? selectedReasoningEffort
    : normalizeRunnerReasoningEffort(controlledReasoningEffort);
  const isPassiveWarmEnvironmentReady = !useComputerAgentsMode || Boolean(effectiveEnvironmentId);
  const isPassiveWarmAgentReady = !useComputerAgentsMode || Boolean(effectiveAgentId);
  const textareaAllowsPromptAfterStagedCommand = threadContextActionAllowsPrompt(stagedThreadContextCommand);
  const hasCustomEmptyStateActive =
    !isPreparingRun &&
    turns.length === 0 &&
    emptyState !== undefined &&
    emptyState !== null;

  function focusComposerSoon(options?: { preventScroll?: boolean }) {
    if (typeof window === "undefined") {
      return;
    }
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus(options?.preventScroll ? { preventScroll: true } : undefined);
    });
  }

  function handleFollowUpActionClick(action: RunnerChatFollowUpAction) {
    if (!action || action.disabled || action.pending) {
      return;
    }
    if (action.focusComposer) {
      focusComposerSoon({ preventScroll: true });
    }
    if (typeof action.onClick !== "function") {
      return;
    }
    void Promise.resolve(action.onClick()).catch((error) => {
      const message = error instanceof Error ? error.message : String(error || "Follow-up action failed.");
      setInlineError(message || "Follow-up action failed.");
    }).finally(() => {
      if (action.focusComposer) {
        focusComposerSoon({ preventScroll: true });
      }
    });
  }

  useEffect(() => {
    if (!privateMode || disabled || typeof window === "undefined") {
      return;
    }
    const focusFrame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [disabled, privateMode]);

  function applyHydratedThreadEnvironment(payload: RunnerThreadHydrationPayload) {
    const nextEnvironmentId = payload.threadEnvironmentId ?? null;
    const nextEnvironmentName = payload.threadEnvironmentName ?? payload.environmentName ?? null;
    setActiveThreadEnvironmentId(nextEnvironmentId);
    setActiveThreadEnvironmentName(nextEnvironmentName);
    if (nextEnvironmentId) {
      setSelectedEnvironmentId(nextEnvironmentId);
    }
  }

  async function tryHandleThreadCommunicatorMessage(
    content: string,
    pendingTurnId: string,
  ): Promise<boolean> {
    let didCompleteTurn = false;
    const handled = await tryRouteRunnerCommunicatorMessage({
      activeRunId: activeCanonicalRun?.id || null,
      apiKey,
      backendUrl: normalizedBackendUrl,
      content,
      controlRun: canonicalThread.controlRun,
      hasRoutableActiveRun,
      onAnswer: (answer) => {
        didCompleteTurn = true;
        const completedAtMs = Date.now();
        updateTurn(pendingTurnId, (turn) => completeRunnerParticipantNeutralTurn(
          turn,
          answer,
          completedAtMs,
        ));
      },
      onError: (message) => setInlineError(message),
      onRestoreComposer: (restoredContent) => {
        setInput(restoredContent);
        currentInputRef.current = restoredContent;
        focusComposerSoon({ preventScroll: true });
      },
      onStop: handleStopActiveRun,
      postMessage: canonicalThread.postMessage,
      requestHeaders,
      threadId: currentThreadId,
      usesCanonicalThreadSurface: shouldUseCanonicalThreadSurface,
    });
    if (handled && !didCompleteTurn) {
      removeTurn(pendingTurnId);
    }
    return handled;
  }

  async function tryHandleActiveCanonicalWorkerInstruction(content: string): Promise<boolean> {
    return tryRouteRunnerActiveRunInstruction({
      content,
      enabled: canonicalThreadEnabled,
      onNotice: (message) => setInlineError(message),
      onRestoreComposer: (restoredContent) => {
        setInput(restoredContent);
        currentInputRef.current = restoredContent;
        focusComposerSoon({ preventScroll: true });
      },
      postMessage: canonicalThread.postMessage,
      projectionMatchesThread: canonicalProjectionMatchesThread,
      runId: activeCanonicalRun?.id || null,
    });
  }

  function handleContextIndicatorClick() {
    onContextIndicatorClick?.(threadContext);
    togglePopup("context");
  }

  function openContextPopup() {
    onContextIndicatorClick?.(threadContext);
    setActiveInputPopup("context");
  }

  function updateSelectedConnectorIds(nextIds: readonly string[]) {
    const normalizedIds = normalizeRunnerSelectedConnectorIds(
      nextIds,
      availableConnectorOptions,
    );
    if (computerAgents?.selectedConnectorIds === undefined) {
      setLocalSelectedConnectorIds(normalizedIds);
    }
    computerAgents?.onSelectedConnectorsChange?.(normalizedIds);
  }

  function removeSelectedConnector(connectorId: string) {
    updateSelectedConnectorIds(
      selectedConnectorIds.filter((id) => id !== connectorId),
    );
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function replaceActiveConnectorMention(
    mention: RunnerConnectorMentionInputState,
  ) {
    const replacement = replaceRunnerConnectorMention(input, mention);
    applyComposerInputValue(replacement.value, replacement.selectionStart);
    setDismissedConnectorMentionKey("");
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }
      textarea.focus();
      textarea.setSelectionRange(
        replacement.selectionStart,
        replacement.selectionStart,
      );
    });
  }

  async function selectComposerConnector(
    option: RunnerChatConnectorOption,
    mention: RunnerConnectorMentionInputState,
  ) {
    if (option.disabled || connectingConnectorId) {
      return;
    }

    if (option.connected === false) {
      if (!option.onConnect) {
        onOpenPluginsOverview?.();
        return;
      }
      setConnectingConnectorId(option.id);
      try {
        const didConnect = await option.onConnect();
        if (didConnect === true) {
          updateSelectedConnectorIds([...selectedConnectorIds, option.id]);
          replaceActiveConnectorMention(mention);
        }
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        setInlineError(
          normalizedError.message || `Failed to connect ${option.name}.`,
        );
      } finally {
        setConnectingConnectorId("");
      }
      return;
    }

    updateSelectedConnectorIds([...selectedConnectorIds, option.id]);
    replaceActiveConnectorMention(mention);
  }

  function clearComposerDraft(options?: {
    preserveQuotedSelection?: boolean;
    preserveSelectedConnectors?: boolean;
    preserveStagedCommand?: boolean;
  }) {
    setInput("");
    setSlashPopupView("commands");
    if (!options?.preserveStagedCommand) {
      clearAllStagedCommands();
    }
    if (!options?.preserveQuotedSelection) {
      setComposerQuotedSelection(null);
    }
    currentInputRef.current = "";
    resetSpeechDraft("");
    if (!options?.preserveSelectedConnectors) {
      updateSelectedConnectorIds([]);
    }
  }

  function clearQuotedSelectionPopup() {
    setQuotedSelectionPopup(null);
  }

  function closeDeepResearchDetailDrawer() {
    setSelectedDeepResearchDetail(null);
  }

  function closeComputerUseDetailDrawer() {
    setSelectedComputerUseDetail(null);
  }

  function closeSubagentDetailDrawer() {
    setSelectedSubagentDetail(null);
  }

  function openSubagentDetailDrawer(turnId: string, invocationId: string) {
    if (!turnId || !invocationId) {
      return;
    }
    closeDeepResearchDetailDrawer();
    closeComputerUseDetailDrawer();
    closeDocumentAttachmentPreview();
    setSelectedSubagentDetail({ turnId, invocationId });
  }

  function openDeepResearchDetailDrawer(turnId: string) {
    if (!turnId) {
      return;
    }
    closeSubagentDetailDrawer();
    closeComputerUseDetailDrawer();
    closeDocumentAttachmentPreview();
    setSelectedDeepResearchDetail({ turnId });
  }

  function openComputerUseDetailDrawer(turnId: string, groupId: string) {
    if (!turnId || !groupId) {
      return;
    }
    closeSubagentDetailDrawer();
    closeDeepResearchDetailDrawer();
    closeDocumentAttachmentPreview();
    setSelectedComputerUseDetail({ turnId, groupId, kind: "computer_use" });
  }

  function openBrowserDetailDrawer(turnId: string, groupId: string) {
    if (!turnId || !groupId) {
      return;
    }
    closeSubagentDetailDrawer();
    closeDeepResearchDetailDrawer();
    closeDocumentAttachmentPreview();
    setSelectedComputerUseDetail({ turnId, groupId, kind: "browser" });
  }

  async function openEnvironmentDesktopWindow(targetEnvironmentId?: string | null, targetEnvironmentName?: string | null) {
    if (typeof window === "undefined" || !normalizedBackendUrl) {
      return;
    }

    const normalizedEnvironmentId = String(
      targetEnvironmentId || scopedActiveThreadEnvironmentId || selectedEnvironment?.id || environmentId || ""
    ).trim();
    if (!normalizedEnvironmentId) {
      return;
    }

    const normalizedEnvironmentName = String(
      targetEnvironmentName || scopedActiveThreadEnvironmentName || selectedEnvironment?.name || displayedEnvironmentLabel || "Environment"
    ).trim() || "Environment";
    const desktopWindow = window.open("about:blank", "_blank");

    const renderDesktopWindowMessage = (message: string) => {
      if (!desktopWindow || desktopWindow.closed) {
        return;
      }
      try {
        const nextDocument = desktopWindow.document;
        nextDocument.title = `${normalizedEnvironmentName} Desktop`;
        nextDocument.body.innerHTML = "";
        nextDocument.body.style.margin = "0";
        nextDocument.body.style.background = "#000";
        nextDocument.body.style.color = "rgba(255,255,255,0.92)";
        nextDocument.body.style.fontFamily = "system-ui, sans-serif";
        nextDocument.body.style.display = "flex";
        nextDocument.body.style.alignItems = "center";
        nextDocument.body.style.justifyContent = "center";
        nextDocument.body.style.minHeight = "100vh";
        nextDocument.body.style.padding = "24px";
        const copy = nextDocument.createElement("div");
        copy.style.fontSize = "14px";
        copy.style.lineHeight = "1.5";
        copy.style.textAlign = "center";
        copy.textContent = message;
        nextDocument.body.appendChild(copy);
      } catch {
        // Ignore viewer placeholder rendering failures.
      }
    };

    renderDesktopWindowMessage(`Opening ${normalizedEnvironmentName} Computer...`);

    try {
      const response = await fetch(
        `${normalizedBackendUrl}/environments/${encodeURIComponent(normalizedEnvironmentId)}/gui/session`,
        {
          method: "POST",
          headers: {
            ...buildRunnerHeaders(requestHeaders, apiKey.trim()),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          cache: "no-store",
        }
      );
      const data = await response.json().catch(() => ({} as Record<string, unknown>));
      if (!response.ok) {
        throw new Error(
          String((data as { message?: unknown; error?: unknown })?.message || (data as { error?: unknown })?.error || "Failed to open computer.")
        );
      }

      const websocketPath = String((data as { websocketPath?: unknown })?.websocketPath || "").trim();
      if (!websocketPath) {
        throw new Error("Desktop session did not return a websocket path.");
      }

      let viewerWsUrl: URL;
      if (websocketPath.startsWith("/api/real/ws/vnc")) {
        viewerWsUrl = new URL(websocketPath, window.location.origin);
        viewerWsUrl.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      } else {
        const backendTarget = new URL(normalizedBackendUrl, window.location.origin);
        viewerWsUrl = new URL(websocketPath, backendTarget);
        viewerWsUrl.protocol =
          viewerWsUrl.protocol === "https:"
            ? "wss:"
            : viewerWsUrl.protocol === "http:"
              ? "ws:"
              : viewerWsUrl.protocol;
      }

      const viewerUrl = new URL("/environment-gui/viewer", window.location.origin);
      viewerUrl.searchParams.set("wsUrl", viewerWsUrl.toString());
      viewerUrl.searchParams.set("title", normalizedEnvironmentName);
      viewerUrl.searchParams.set("environmentId", normalizedEnvironmentId);
      viewerUrl.searchParams.set("ts", String(Date.now()));

      if (desktopWindow && !desktopWindow.closed) {
        desktopWindow.location.replace(viewerUrl.toString());
      } else {
        window.open(viewerUrl.toString(), "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to open computer.";
      renderDesktopWindowMessage(message);
    }
  }

  function handleQuotedSelectionMouseUp(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    const { clientX, clientY } = event;
    window.requestAnimationFrame(() => {
      const rootElement = rootRef.current;
      const selection = window.getSelection();
      if (!rootElement || !selection || selection.isCollapsed) {
        setQuotedSelectionPopup(null);
        return;
      }
      const anchorContainer = findQuotedSelectionContainer(selection.anchorNode, rootElement);
      const focusContainer = findQuotedSelectionContainer(selection.focusNode, rootElement);
      if (!anchorContainer || !focusContainer || anchorContainer !== focusContainer) {
        setQuotedSelectionPopup(null);
        return;
      }
      const text = sanitizeQuotedSelectionText(selection.toString());
      if (!text) {
        setQuotedSelectionPopup(null);
        return;
      }
      const popupX = Math.min(Math.max(clientX - 36, 12), window.innerWidth - 184);
      const popupY = Math.max(clientY - 64, 12);
      setQuotedSelectionPopup({
        selection: {
          text,
          sourceType: getQuotedSelectionSourceType(anchorContainer),
        },
        x: popupX,
        y: popupY,
      });
    });
  }

  function handleAddQuotedSelectionToComposer() {
    if (!quotedSelectionPopup) {
      return;
    }
    setComposerQuotedSelection(quotedSelectionPopup.selection);
    setQuotedSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function updateTurn(turnId: string, updater: (turn: RunnerTurn) => RunnerTurn) {
    setTurns((prev) => prev.map((turn) => (turn.id === turnId ? updater(turn) : turn)));
  }

  function appendParticipantNeutralPendingTurn(prompt: string): string {
    const turnId = generateId("turn");
    const startedAtMs = Date.now();
    setTurns((previousTurns) => [
      ...previousTurns,
      createRunnerParticipantNeutralPendingTurn({
        id: turnId,
        prompt,
        startedAtMs,
        isInitialTurn: previousTurns.length === 0,
        agentName: selectedAgent?.name || displayedAgentLabel,
        environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
      }),
    ]);
    setExpandedTurns((previous) => ({ ...previous, [turnId]: false }));
    return turnId;
  }

  function removeTurn(turnId: string) {
    setTurns((previousTurns) => previousTurns.filter((turn) => turn.id !== turnId));
    setExpandedTurns((previous) => {
      if (!(turnId in previous)) return previous;
      const next = { ...previous };
      delete next[turnId];
      return next;
    });
  }

  function collapseAllWorkingLogs(extraTurnId?: string) {
    const turnIds = Array.from(new Set([
      ...turnsRef.current.map((turn) => turn.id).filter(Boolean),
      ...(extraTurnId ? [extraTurnId] : []),
    ]));
    if (turnIds.length === 0) {
      return;
    }
    setExpandedTurns((previousExpandedTurns) => {
      let didChange = false;
      const nextExpandedTurns = { ...previousExpandedTurns };
      turnIds.forEach((turnId) => {
        if (nextExpandedTurns[turnId] !== false) {
          nextExpandedTurns[turnId] = false;
          didChange = true;
        }
      });
      return didChange ? nextExpandedTurns : previousExpandedTurns;
    });
    setVisibleWorkLogItemCountsByTurn((previousCounts) => {
      let didChange = false;
      const nextCounts = { ...previousCounts };
      turnIds.forEach((turnId) => {
        if (turnId in nextCounts) {
          delete nextCounts[turnId];
          didChange = true;
        }
      });
      return didChange ? nextCounts : previousCounts;
    });
  }

  function loadMoreWorkingLogs(turnId: string, totalItemCount: number) {
    setVisibleWorkLogItemCountsByTurn((previousCounts) => {
      const currentCount = previousCounts[turnId] ?? RUNNER_WORK_LOG_PAGE_SIZE;
      const nextCount = Math.min(totalItemCount, currentCount + RUNNER_WORK_LOG_PAGE_SIZE);
      if (nextCount <= currentCount) {
        return previousCounts;
      }
      return { ...previousCounts, [turnId]: nextCount };
    });
  }

  function appendTurnLog(turnId: string, log: RunnerLog) {
    const normalizedLog = normalizeHydratedLog(log);
    const hasAbsoluteTimestamp = getRunnerLogAbsoluteTimestampMs(normalizedLog) !== null;
    const relativeSeconds = normalizedLog.time ? parseSecondsFromClock(normalizedLog.time) : null;
    const timestampedLog =
      hasAbsoluteTimestamp || (relativeSeconds !== null && relativeSeconds > 0)
        ? normalizedLog
        : {
            ...normalizedLog,
            createdAt: new Date().toISOString(),
          };
    updateTurn(turnId, (turn) => ({
      ...turn,
      logs: [...turn.logs, timestampedLog],
    }));
    if (isTurnResponseLog(timestampedLog)) {
      collapseAllWorkingLogs(turnId);
    }
  }

  function upsertTurnAgentMessage(turnId: string, message: string) {
    updateTurn(turnId, (turn) => {
      const nextLogs = [...turn.logs];
      const existingIndex = nextLogs.findIndex((log) => log.eventType === "agent_message" || log.eventType === "llm_response");
      const nextLog: RunnerLog = {
        time: new Date().toISOString(),
        message,
        type: "info",
        eventType: "agent_message",
      };
      if (existingIndex === -1) {
        nextLogs.push(nextLog);
      } else {
        nextLogs[existingIndex] = nextLog;
      }
      return {
        ...turn,
        logs: nextLogs,
      };
    });
    if (message.trim()) {
      collapseAllWorkingLogs(turnId);
    }
  }

  function isEditableUserTurn(turn: RunnerTurn) {
    return (
      turn.presentation !== "btw" &&
      turn.presentation !== "context-action-notice" &&
      (turn.sourceMessageId?.startsWith("msg_") || turn.id.startsWith("msg_")) &&
      turn.prompt.trim().length > 0 &&
      !hasRunningTurn &&
      !isPreparingRun &&
      !forkingTurnId
    );
  }

  function isActionableUserTurn(turn: RunnerTurn) {
    return (
      turn.presentation !== "btw" &&
      turn.presentation !== "context-action-notice" &&
      turn.prompt.trim().length > 0
    );
  }

  function startEditingTurn(turn: RunnerTurn) {
    setEditingTurnId(turn.id);
    setEditingTurnDraft(stripSystemTags(turn.prompt));
  }

  function cancelEditingTurn() {
    setEditingTurnId(null);
    setEditingTurnDraft("");
    setPendingEditConfirmation(null);
  }

  function turnHasFileChanges(turn: RunnerTurn) {
    return collectTurnChangedFiles(turn.logs).length > 0;
  }

  async function submitEditedTurn(turnId: string, nextPrompt: string, persistFileChanges?: boolean) {
    const normalizedPrompt = nextPrompt.trim();
    if (!normalizedPrompt) {
      return;
    }

    const resolvedThreadId = currentThreadId;

    const turnIndex = turnsRef.current.findIndex((turn) => turn.id === turnId);
    if (turnIndex === -1) {
      setInlineError("Message not found.");
      return;
    }

    let editBoundary: { messageId: string; truncateAtMessageIndex: number };
    try {
      editBoundary = await resolveRunnerEditableTurnBoundary({
        apiKey,
        backendUrl: normalizedBackendUrl,
        requestHeaders,
        threadId: currentThreadId,
        turnId,
        turns: turnsRef.current,
      });
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Message not found.");
      return;
    }

    const nextTurns = turnsRef.current
      .slice(0, turnIndex + 1)
      .map((turn, index) =>
        turn.id === turnId
          ? {
              ...turn,
              prompt: normalizedPrompt,
              logs: [],
              startedAtMs: Date.now(),
              completedAtMs: undefined,
              durationSeconds: null,
              status: "running" as RunnerTurnStatus,
              animateOnRender: false,
              sourceMessageId: editBoundary.messageId,
              isInitialTurn: index === 0,
            }
          : {
              ...turn,
              isInitialTurn: index === 0,
            }
      );

    setTurns(nextTurns);
    setPendingQueuedMessages([]);
    isDrainingQueuedRunsRef.current = false;
    setExpandedTurns((prev) => ({
      ...prev,
      [turnId]: false,
    }));
    setEditingTurnId(null);
    setEditingTurnDraft("");
    setPendingEditConfirmation(null);
    setInlineError(null);
      setIsPreparingRun(true);
      closeAllInputPopups();

    try {
      const quotedSelection = turnsRef.current[turnIndex]?.quotedSelection;
      const execution = await executeThreadRun(normalizedPrompt, [], {
        turnId,
        truncateAtMessageIndex: editBoundary.truncateAtMessageIndex,
        persistFileChanges,
        quotedSelection,
      });
      const executionThreadId = execution.threadId || resolvedThreadId;
      if (executionThreadId && hasApiKey) {
        const payload = await fetchThreadHydrationPayload({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: executionThreadId,
          requestHeaders,
        });
        threadHydrationCacheRef.current = payload;
        applyHydratedThreadEnvironment(payload);
        const hydratedTurns = buildHydratedTurnsFromPayload(payload, {
          agentName: displayedAgentLabel,
          environmentName: payload.threadEnvironmentName ?? payload.environmentName ?? displayedEnvironmentLabel,
          backendUrl: normalizedBackendUrl,
        });
        setTurns(hydratedTurns);
        setExpandedTurns((previousExpandedTurns) =>
          mapExpandedTurns(previousExpandedTurns, nextTurns, hydratedTurns, {
            collapseOnNewRunSummary: true,
          })
        );
      }
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to resend edited message.");
      if (resolvedThreadId && hasApiKey) {
        void fetchThreadHydrationPayload({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: resolvedThreadId,
          requestHeaders,
        })
          .then((payload) => {
            threadHydrationCacheRef.current = payload;
            applyHydratedThreadEnvironment(payload);
            return buildHydratedTurnsFromPayload(payload, {
              agentName: displayedAgentLabel,
              environmentName: payload.threadEnvironmentName ?? payload.environmentName ?? displayedEnvironmentLabel,
              backendUrl: normalizedBackendUrl,
            });
          })
          .then((hydratedTurns) => {
            setTurns(hydratedTurns);
            setExpandedTurns((previousExpandedTurns) =>
              mapExpandedTurns(previousExpandedTurns, turnsRef.current, hydratedTurns, {
                collapseOnNewRunSummary: true,
              })
            );
          })
          .catch(() => {
            updateTurn(turnId, (turn) => ({
              ...turn,
              prompt: normalizedPrompt,
              status: "failed",
              completedAtMs: Date.now(),
              durationSeconds: getTurnDurationSeconds(turn),
            }));
          });
      } else {
        updateTurn(turnId, (turn) => ({
          ...turn,
          prompt: normalizedPrompt,
          status: "failed",
          completedAtMs: Date.now(),
          durationSeconds: getTurnDurationSeconds(turn),
        }));
      }
    } finally {
      setIsPreparingRun(false);
    }
  }

  function openForkDialogForTurn(turn: RunnerTurn) {
    if (!currentThreadId) {
      setInlineError("Forking requires a saved thread.");
      return;
    }
    if (!normalizedBackendUrl) {
      setInlineError("backendUrl is required.");
      return;
    }
    if (!hasApiKey) {
      setInlineError("apiKey is required.");
      return;
    }

    setInlineError(null);
    setPendingEditConfirmation(null);
    closeAllInputPopups();

    openMessageForkConfiguration(currentThreadId, turn);
  }

  async function copyRunSummaryText(summaryText: string) {
    const normalizedSummary = stripSystemTags(summaryText).trim();
    if (!normalizedSummary) {
      return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(normalizedSummary);
        return;
      }
    } catch {}

    const textarea = document.createElement("textarea");
    textarea.value = normalizedSummary;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }
  }

  function rerunTurnFromSummary(turn: RunnerTurn) {
    const normalizedPrompt = stripSystemTags(turn.prompt).trim();
    if (!normalizedPrompt) {
      setInlineError("Message is empty.");
      return;
    }
    void submitEditedTurn(turn.id, normalizedPrompt);
  }

  function openPlansBudgetFromComputeTokenLog() {
    if (typeof onOpenPlansBudget === "function") {
      try {
        onOpenPlansBudget();
      } catch (error) {
        reportRunnerLifecycleCallbackError("onOpenPlansBudget", error);
      }
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("runner:open-plans-budget", {
        detail: { section: "costs-plans" },
      }));
    }
  }

  function renderComputeTokenUpgradeLogBox() {
    return (
      <div className="tb-compute-token-log-box" role="status">
        <div className="tb-compute-token-log-copy">
          <div className="tb-compute-token-log-heading">
            <LucideZap className="tb-compute-token-log-icon" strokeWidth={1.8} />
            <span>Usage limit reached</span>
          </div>
        </div>
        <PlatformPrimaryButton
          type="button"
          size="small"
          className="tb-compute-token-log-action"
          onClick={openPlansBudgetFromComputeTokenLog}
        >
          Open Plans &amp; Budget
        </PlatformPrimaryButton>
      </div>
    );
  }

  function renderAgentSummaryContent(
    turn: RunnerTurn,
    agentMessage: RunnerLog,
    options: {
      className: string;
      softBreaks?: boolean;
      canPreviewSummaryWorkspacePaths?: boolean;
    }
  ) {
    if (isComputeTokenBudgetErrorLog(agentMessage)) {
      return renderComputeTokenUpgradeLogBox();
    }
    const summaryContent = stripSystemTags(agentMessage.message);
    const summarySegments = splitRunnerRunSummaryContent(summaryContent);
    if (summarySegments.some((segment) => segment.kind === "json")) {
      return (
        <div className="tb-run-summary-content">
          {summarySegments.map((segment) => {
            if (segment.kind === "json") {
              const customJsonSegment = renderRunSummaryJsonSegment?.({
                turnId: turn.id,
                segmentId: segment.id,
                title: segment.title,
                value: segment.value,
                summaryContent,
                agentMessage,
              });
              if (customJsonSegment !== undefined) {
                return <Fragment key={segment.id}>{customJsonSegment}</Fragment>;
              }
              return (
                <RunnerRunSummaryJsonDocument
                  key={segment.id}
                  value={segment.value}
                  title={segment.title}
                  documentId={`${turn.id}-${segment.id}`}
                />
              );
            }
            return (
              <RunnerMarkdown
                key={segment.id}
                content={segment.content}
                className={options.className}
                softBreaks={options.softBreaks}
                onWorkspacePathClick={options.canPreviewSummaryWorkspacePaths ? (path) => handleSummaryWorkspacePathClick(turn, path, "run_summary") : undefined}
              />
            );
          })}
        </div>
      );
    }
    return (
      <RunnerMarkdown
        content={summaryContent}
        className={options.className}
        softBreaks={options.softBreaks}
        onWorkspacePathClick={options.canPreviewSummaryWorkspacePaths ? (path) => handleSummaryWorkspacePathClick(turn, path, "run_summary") : undefined}
      />
    );
  }

  function renderModelProviderRetryAction(turn: RunnerTurn, message: string) {
    if (!isRunnerModelProviderUnavailableMessage(message)) {
      return null;
    }
    const normalizedPrompt = stripSystemTags(turn.prompt).trim();
    const isRetryDisabled = disabled || isPreparingRun || hasRunningTurn || isRunning || isStoppingRun || !normalizedPrompt;
    return (
      <div className="tb-provider-retry" role="group" aria-label="Retry model provider outage">
        <button
          type="button"
          className="tb-provider-retry-button"
          onClick={() => rerunTurnFromSummary(turn)}
          disabled={isRetryDisabled}
        >
          <LucideRefreshCw className="tb-provider-retry-icon" strokeWidth={1.8} />
          <span>Retry turn</span>
        </button>
      </div>
    );
  }

  function renderRunSummaryActionLine(
    turn: RunnerTurn,
    summaryText: string,
    options?: {
      isLatest?: boolean;
      canEditTurn?: boolean;
      emailDeliveryDisplay?: RunnerEmailDeliveryDisplay | null;
    }
  ) {
    const isForkingThisTurn = forkingTurnId === turn.id;
    const isMoreMenuOpen = runSummaryMoreTurnId === turn.id;
    const emailDeliveryDisplay = options?.emailDeliveryDisplay || null;
    const isAttachmentPopoverOpen = emailDeliveryAttachmentsTurnId === turn.id;
    const attachmentCount = emailDeliveryDisplay?.attachmentCount || 0;
    const attachmentFiles = emailDeliveryDisplay?.attachmentFiles || [];
    const attachmentLabel = `${attachmentCount} attachment${attachmentCount === 1 ? "" : "s"}`;
    const buildEmailDeliveryPreviewAttachment = (file: RunnerEmailDeliveryAttachmentFile): RunnerTurnAttachment | null => {
      const workspacePath = normalizeRunnerPreviewWorkspacePath(file.workspacePath || "");
      if (workspacePath && summaryPreviewEnvironmentId) {
        return {
          ...buildRunnerPreviewAttachmentFromPath(workspacePath, {
            backendUrl: normalizedBackendUrl,
            environmentId: summaryPreviewEnvironmentId,
            idPrefix: "email-delivery",
          }),
          filename: file.filename,
          mimeType: file.mimeType || inferRunnerPreviewMimeType(workspacePath),
          workspacePath,
        };
      }

      const url = String(file.url || "").trim();
      if (!url) {
        return null;
      }
      const filename = String(file.filename || getRunnerEmailAttachmentFilename(url)).trim() || "Attachment";
      const mimeType = String(file.mimeType || inferRunnerPreviewMimeType(filename) || "application/octet-stream").trim() || "application/octet-stream";
      const type = attachmentTypeForFile(mimeType, filename);
      return {
        id: `email-delivery:${turn.id}:${file.kind || "attachment"}:${workspacePath || url || filename}`,
        filename,
        mimeType,
        type,
        url,
        previewUrl: type === "image" ? url : undefined,
        ...(workspacePath ? { workspacePath } : {}),
      };
    };
    const openEmailDeliveryAttachmentPreview = (file: RunnerEmailDeliveryAttachmentFile) => {
      const previewAttachment = buildEmailDeliveryPreviewAttachment(file);
      if (!previewAttachment || !isAttachmentDocumentPreviewable(previewAttachment)) {
        return;
      }
      setEmailDeliveryAttachmentsTurnId(null);
      toggleDocumentAttachmentPreview(previewAttachment);
    };
    return (
      <div className={`tb-run-summary-action-line ${options?.isLatest ? "is-latest" : ""}`.trim()} aria-label="Run summary actions">
        <span className="tb-run-summary-action-group">
          <PlatformIconButton
            className="tb-run-summary-action-button"
            aria-label="Copy run summary"
            tooltip="Copy"
            tooltipPlacement="bottom"
            onClick={() => {
              void copyRunSummaryText(summaryText);
            }}
          >
            <LucideCopy className="tb-run-summary-action-icon" strokeWidth={2} />
          </PlatformIconButton>
          <PlatformIconButton
            className="tb-run-summary-action-button"
            aria-label="Fork from message"
            tooltip="Fork"
            tooltipPlacement="bottom"
            onClick={() => openForkDialogForTurn(turn)}
          >
            {isForkingThisTurn ? (
              <LucideLoaderCircle className="tb-run-summary-action-icon tb-context-action-notice-icon-spinner" strokeWidth={2} />
            ) : (
              <LucideSplit className="tb-run-summary-action-icon" strokeWidth={2} />
            )}
          </PlatformIconButton>
          <PlatformIconButton
            className={`tb-run-summary-action-button ${threadFeedback.userRating === "up" ? "is-active" : ""}`.trim()}
            aria-label="Mark as helpful"
            tooltip="Good"
            tooltipPlacement="bottom"
            aria-pressed={threadFeedback.userRating === "up"}
            onClick={() => submitThreadFeedback("up")}
          >
            <LucideThumbsUp className="tb-run-summary-action-icon" strokeWidth={2} />
          </PlatformIconButton>
          <PlatformIconButton
            className={`tb-run-summary-action-button ${threadFeedback.userRating === "down" ? "is-active" : ""}`.trim()}
            aria-label="Mark as not helpful"
            tooltip="Bad"
            tooltipPlacement="bottom"
            aria-pressed={threadFeedback.userRating === "down"}
            onClick={() => submitThreadFeedback("down")}
          >
            <LucideThumbsDown className="tb-run-summary-action-icon" strokeWidth={2} />
          </PlatformIconButton>
          <PlatformIconButton
            className="tb-run-summary-action-button"
            aria-label="Rerun from message"
            tooltip="Rerun"
            tooltipPlacement="bottom"
            onClick={() => rerunTurnFromSummary(turn)}
          >
            <LucideRefreshCw className="tb-run-summary-action-icon" strokeWidth={2} />
          </PlatformIconButton>
          <span className="tb-run-summary-more-anchor" ref={isMoreMenuOpen ? runSummaryMoreMenuRef : undefined}>
            <PlatformIconButton
              className={`tb-run-summary-action-button ${isMoreMenuOpen ? "is-open" : ""}`.trim()}
              aria-label="More"
              tooltip={isMoreMenuOpen ? undefined : "More"}
              tooltipPlacement="bottom"
              aria-haspopup="menu"
              aria-expanded={isMoreMenuOpen}
              onClick={(event) => {
                event.stopPropagation();
                setEmailDeliveryAttachmentsTurnId(null);
                setRunSummaryMoreTurnId((current) => current === turn.id ? null : turn.id);
              }}
            >
              <LucideEllipsis className="tb-run-summary-action-icon" strokeWidth={2} />
            </PlatformIconButton>
            {isMoreMenuOpen ? (
              <PlatformPopupSurface className="tb-run-summary-more-menu" role="menu" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className="tb-run-summary-more-menu-item"
                  role="menuitem"
                  onClick={() => openReportIssueModal(turn.id, summaryText)}
                >
                  Feedback
                </button>
              </PlatformPopupSurface>
            ) : null}
          </span>
        </span>
        {emailDeliveryDisplay ? (
          <span className="tb-run-summary-email-status">
            <span className={`tb-email-delivery-status ${emailDeliveryDisplay.className}`}>
              <LucideMail className="tb-email-delivery-status-icon" strokeWidth={1.7} />
              <span>{emailDeliveryDisplay.label}</span>
              {emailDeliveryDisplay.detail ? <span className="tb-email-delivery-status-detail">{emailDeliveryDisplay.detail}</span> : null}
            </span>
            {attachmentCount > 0 ? (
              <span
                className="tb-email-delivery-attachments-anchor"
                ref={isAttachmentPopoverOpen ? emailDeliveryAttachmentsPopoverRef : undefined}
              >
                <button
                  type="button"
                  className={`tb-email-delivery-attachments-button ${isAttachmentPopoverOpen ? "is-open" : ""}`.trim()}
                  aria-label={`Show ${attachmentLabel}`}
                  aria-haspopup="dialog"
                  aria-expanded={isAttachmentPopoverOpen}
                  onClick={(event) => {
                    event.stopPropagation();
                    setRunSummaryMoreTurnId(null);
                    setEmailDeliveryAttachmentsTurnId((current) => current === turn.id ? null : turn.id);
                  }}
                >
                  {attachmentLabel}
                </button>
                {isAttachmentPopoverOpen ? (
                  <PlatformPopupSurface className="tb-email-delivery-attachments-popover" animation="up-in" role="dialog" aria-label="Email attachments" onClick={(event) => event.stopPropagation()}>
                    <div className="tb-email-delivery-attachments-popover-title">Attached files</div>
                    <div className="tb-email-delivery-attachments-list">
                      {attachmentFiles.length > 0 ? attachmentFiles.map((file, index) => {
                        const meta = [
                          file.kind === "download_link" ? "Download link" : "",
                          formatBrowserFileSize(file.sizeBytes),
                          file.workspacePath,
                        ].filter(Boolean).join(" · ");
                        const previewAttachment = buildEmailDeliveryPreviewAttachment(file);
                        const isPreviewable = Boolean(previewAttachment && isAttachmentDocumentPreviewable(previewAttachment));
                        const rowContent = (
                          <>
                            <img className="tb-email-delivery-attachment-icon" src={RUNNER_EMAIL_ATTACHMENT_FILE_ICON_URL} alt="" aria-hidden="true" />
                            <span className="tb-email-delivery-attachment-copy">
                              <span className="tb-email-delivery-attachment-name">{file.filename}</span>
                              {meta ? <span className="tb-email-delivery-attachment-meta">{meta}</span> : null}
                            </span>
                          </>
                        );
                        return (
                          <button
                            type="button"
                            key={`${file.filename}:${file.workspacePath || file.url || index}`}
                            className={`tb-email-delivery-attachment-row ${isPreviewable ? "is-previewable" : ""}`.trim()}
                            disabled={!isPreviewable}
                            onClick={() => openEmailDeliveryAttachmentPreview(file)}
                          >
                            {rowContent}
                          </button>
                        );
                      }) : (
                        <div className="tb-email-delivery-attachments-empty">
                          Attachment details are not available for this email.
                        </div>
                      )}
                    </div>
                  </PlatformPopupSurface>
                ) : null}
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
    );
  }

  function openForkDialogForCurrentThread(
    prompt: string,
    options?: {
      includeCurrentAttachments?: boolean;
      preselectedTargetEnvironmentId?: string | null;
      restoreSelectedEnvironmentId?: string | null;
      initialExistingEnvironmentFileCopyMode?: RunnerForkExistingEnvironmentFileCopyMode;
    }
  ) {
    if (!currentThreadId) {
      setInlineError("Forking requires a saved thread.");
      return;
    }
    if (!normalizedBackendUrl) {
      setInlineError("backendUrl is required.");
      return;
    }
    if (!hasApiKey) {
      setInlineError("apiKey is required.");
      return;
    }

    setInlineError(null);
    setPendingEditConfirmation(null);
    closeAllInputPopups();

    openThreadForkConfiguration({
      attachments: options?.includeCurrentAttachments === false ? [] : attachments.slice(),
      initialExistingEnvironmentFileCopyMode:
        options?.initialExistingEnvironmentFileCopyMode,
      preselectedTargetEnvironmentId: options?.preselectedTargetEnvironmentId,
      quotedSelection: composerQuotedSelection,
      restoreSelectedEnvironmentId: options?.restoreSelectedEnvironmentId,
      sourceThreadId: currentThreadId,
      stagedPrompt: prompt,
    });
  }

  function cancelPendingForkConfiguration() {
    const restoreSelectedEnvironmentId = cancelForkConfiguration();
    if (restoreSelectedEnvironmentId !== null) {
      setSelectedEnvironmentId(restoreSelectedEnvironmentId);
    }
  }

  async function switchToForkedThread(params: {
    nextThreadId: string;
    nextEnvironmentId: string | null;
    nextEnvironmentName: string | null;
    composerDraft?: string;
    composerQuotedSelection?: RunnerQuotedSelection | null;
    autoRunPrompt?: string;
    autoRunAttachments?: LocalAttachment[];
    autoRunQuotedSelection?: RunnerQuotedSelection | null;
  }) {
    clear();
    setTurns([]);
    setExpandedTurns({});
    setExpandedStepRows({});
    setPendingQueuedMessages([]);
    isDrainingQueuedRunsRef.current = false;
    setEditingTurnId(null);
    setEditingTurnDraft("");
    setPendingEditConfirmation(null);
    clearComposerAttachments(params.autoRunAttachments);
    resetThreadContext();
    setActiveThreadEnvironmentId(params.nextEnvironmentId || null);
    setActiveThreadEnvironmentName(params.nextEnvironmentName || null);
    if (params.nextEnvironmentId) {
      setSelectedEnvironmentId(params.nextEnvironmentId);
      onEnvironmentChange?.(params.nextEnvironmentId);
    }
    setLocalThreadId(params.nextThreadId);
    try {
      onThreadIdChange?.(params.nextThreadId);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onThreadIdChange", error);
    }

    if (typeof params.composerDraft === "string") {
      setComposerDraft(params.composerDraft);
      setComposerQuotedSelection(params.composerQuotedSelection || null);
    } else {
      clearComposerDraft();
    }

    try {
      try {
        const payload = await fetchThreadHydrationPayload({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: params.nextThreadId,
          requestHeaders,
        });
        threadHydrationCacheRef.current = payload;
        applyHydratedThreadEnvironment(payload);
        const hydratedTurns = buildHydratedTurnsFromPayload(payload, {
          agentName: displayedAgentLabel,
          environmentName: payload.threadEnvironmentName ?? payload.environmentName ?? displayedEnvironmentLabel,
          backendUrl: normalizedBackendUrl,
        });
        setTurns(hydratedTurns);
        setExpandedTurns(mapExpandedTurns({}, [], hydratedTurns, { collapseOnNewRunSummary: true }));
      } catch {
        setActiveThreadEnvironmentName(params.nextEnvironmentName || null);
        const hydratedTurns = await fetchAllThreadMessages({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: params.nextThreadId,
          requestHeaders,
        }).then((messages) =>
          buildHydratedTurnsFromMessages(messages, {
            agentName: displayedAgentLabel,
            environmentName: params.nextEnvironmentName,
            backendUrl: normalizedBackendUrl,
          })
        );
        setTurns(hydratedTurns);
        setExpandedTurns(mapExpandedTurns({}, [], hydratedTurns, { collapseOnNewRunSummary: true }));
      }

      if (params.autoRunPrompt?.trim()) {
        await executeThreadRun(params.autoRunPrompt.trim(), params.autoRunAttachments || [], {
          threadIdOverride: params.nextThreadId,
          quotedSelection: params.autoRunQuotedSelection || null,
          environmentIdOverride: params.nextEnvironmentId,
        });
      } else {
        refreshThreadContextDetailsInBackground(params.nextThreadId);
        window.requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      }
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to load forked thread.");
    }
  }

  async function confirmForkFromPendingConfiguration() {
    const pendingFork = pendingForkConfiguration;
    if (!pendingFork) {
      return;
    }
    if (!pendingFork.sourceThreadId) {
      setForkDialogError("Forking requires a saved thread.");
      return;
    }
    if (!normalizedBackendUrl) {
      setForkDialogError("backendUrl is required.");
      return;
    }
    if (!hasApiKey) {
      setForkDialogError("apiKey is required.");
      return;
    }

    const requestTarget = forkTarget;
    const requestTargetEnvironmentId =
      requestTarget === "existing_environment"
        ? (forkTargetEnvironmentId || sourceThreadEnvironmentId || selectedEnvironmentId || environmentId || "")
        : "";
    const requestEnvironmentName =
      requestTarget === "new_forked_environment"
        ? (forkNewEnvironmentName.trim() || buildSuggestedForkEnvironmentName())
        : "";
    const selectedForkEnvironment =
      availableEnvironments.find((environment) => environment.id === requestTargetEnvironmentId) || null;
    const shouldShowExistingEnvironmentCopyOptions =
      requestTarget === "existing_environment" &&
      Boolean(requestTargetEnvironmentId) &&
      Boolean(sourceThreadEnvironmentId) &&
      requestTargetEnvironmentId !== sourceThreadEnvironmentId;
    const requestFileCopyMode =
      requestTarget === "new_forked_environment"
        ? forkNewEnvironmentFileCopyMode
        : shouldShowExistingEnvironmentCopyOptions
          ? forkExistingEnvironmentFileCopyMode
          : undefined;
    const fallbackForkEnvironmentName =
      requestTarget === "existing_environment"
        ? (selectedForkEnvironment?.name || sourceThreadEnvironmentName || displayedEnvironmentLabel)
        : requestEnvironmentName;

    if (requestTarget === "existing_environment" && !requestTargetEnvironmentId) {
      setForkDialogError("Select an environment for the forked thread.");
      return;
    }
    if (requestTarget === "new_forked_environment" && !requestEnvironmentName.trim()) {
      setForkDialogError("Enter a name for the new forked environment.");
      return;
    }

    setForkDialogError(null);
    setForkingTurnId(pendingFork.turn?.id || "thread-fork");

    let forkResult: Awaited<ReturnType<typeof forkThreadRequest>> | null = null;
    try {
      await stopSpeechToText().catch(() => undefined);
      const truncateAtMessageIndex =
        pendingFork.source === "message" && pendingFork.turn
          ? (
              await resolveRunnerEditableTurnBoundary({
                apiKey,
                backendUrl: normalizedBackendUrl,
                requestHeaders,
                threadId: currentThreadId,
                turnId: pendingFork.turn.id,
                turns: turnsRef.current,
              })
            ).truncateAtMessageIndex
          : undefined;
      forkResult = await forkThreadRequest({
        backendUrl: normalizedBackendUrl,
        apiKey: apiKey.trim(),
        threadId: pendingFork.sourceThreadId,
        truncateAtMessageIndex,
        environmentTarget: requestTarget,
        environmentName: requestTarget === "new_forked_environment" ? requestEnvironmentName : undefined,
        targetEnvironmentId: requestTarget === "existing_environment" ? requestTargetEnvironmentId : undefined,
        fileCopyMode: requestFileCopyMode,
        requestHeaders,
      });
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setForkDialogError(normalizedError.message || "Failed to fork thread.");
      setForkingTurnId(null);
      return;
    }

    const nextThreadId = forkResult.thread.id;
    resetForkConfiguration();
    const nextEnvironmentId =
      forkResult.environmentId ??
      (requestTarget === "existing_environment" ? requestTargetEnvironmentId : sourceThreadEnvironmentId ?? null);
    const nextEnvironmentName = forkResult.environmentName ?? fallbackForkEnvironmentName;
    const autoRunPrompt = pendingFork.source === "thread" ? pendingFork.stagedPrompt.trim() : "";
    const autoRunAttachments = pendingFork.source === "thread" ? pendingFork.attachments || [] : [];
    const pendingForkQuotedSelection = pendingFork.quotedSelection || null;

    try {
      await switchToForkedThread({
        nextThreadId,
        nextEnvironmentId,
        nextEnvironmentName,
        composerDraft: pendingFork.source === "message" ? pendingFork.stagedPrompt : undefined,
        composerQuotedSelection: pendingFork.source === "message" ? pendingForkQuotedSelection : null,
        autoRunPrompt: pendingFork.source === "thread" ? autoRunPrompt : undefined,
        autoRunAttachments,
        autoRunQuotedSelection: pendingFork.source === "thread" ? pendingForkQuotedSelection : null,
      });
    } finally {
      setForkingTurnId(null);
    }
  }

  function handleEditedTurnSend(turnId: string) {
    const normalizedPrompt = editingTurnDraft.trim();
    if (!normalizedPrompt) {
      return;
    }

    const turnIndex = turnsRef.current.findIndex((turn) => turn.id === turnId);
    if (turnIndex === -1) {
      return;
    }

    const affectedTurns = turnsRef.current.slice(turnIndex);
    const changedFiles = affectedTurns.flatMap((turn) => collectTurnChangedFiles(turn.logs));
    const changedFileMap = new Map<string, {
      path: string;
      kind: "created" | "modified" | "deleted";
      additions?: number;
      deletions?: number;
    }>();
    for (const file of changedFiles) {
      changedFileMap.set(file.path, file);
    }

    if (changedFileMap.size > 0) {
      setPendingEditConfirmation({
        turnId,
        nextPrompt: normalizedPrompt,
        changedFiles: Array.from(changedFileMap.values()),
      });
      return;
    }

    void submitEditedTurn(turnId, normalizedPrompt);
  }

  function handleEditedTurnKeyDown(event: KeyboardEvent<HTMLTextAreaElement>, turnId: string) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleEditedTurnSend(turnId);
    }
  }

  async function streamBtwSideQuestion(prompt: string, commandText: string) {
    if (!normalizedBackendUrl) {
      throw new Error("backendUrl is required.");
    }
    if (!apiKey) {
      throw new Error("apiKey is required.");
    }
    const resolvedThreadId = currentThreadId;
    if (!resolvedThreadId) {
      throw new Error("Start a conversation first before using /btw.");
    }

    const turnId = generateId("turn");
    const now = Date.now();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        prompt: commandText,
        logs: [],
        startedAtMs: now,
        status: "running",
        animateOnRender: true,
        isInitialTurn: prev.length === 0,
        agentName: selectedAgent?.name || displayedAgentLabel,
        environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
        presentation: "btw",
      },
    ]);

    const agentGuardrailsHiddenPromptText = buildRunnerAgentGuardrailsHiddenPrompt(selectedAgent);
    const hiddenSystemPromptText = hiddenSystemPrompt.trim();
    const executionPrompt = buildRunnerExecutionPromptWithHiddenContext(
      [agentGuardrailsHiddenPromptText, hiddenSystemPromptText],
      prompt
    );

    try {
      await streamRunnerThreadBtw({
        backendUrl: normalizedBackendUrl,
        apiKey,
        requestHeaders,
        threadId: resolvedThreadId,
        prompt: executionPrompt,
        onMessage: (message) => {
          upsertTurnAgentMessage(turnId, message);
        },
      });

      updateTurn(turnId, (turn) => ({
        ...turn,
        status: "completed",
        completedAtMs: Date.now(),
        durationSeconds: getTurnDurationSeconds(turn),
      }));
      refreshThreadContextDetailsInBackground(resolvedThreadId);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      updateTurn(turnId, (turn) => ({
        ...turn,
        status: "failed",
        completedAtMs: Date.now(),
        durationSeconds: getTurnDurationSeconds(turn),
        logs: turn.logs.length > 0
          ? turn.logs
          : [
              {
                time: new Date().toISOString(),
                message: normalizedError.message || "Failed to execute /btw.",
                type: "error",
                eventType: "agent_message",
              },
            ],
      }));
      throw normalizedError;
    }
  }

  const executeThreadRun = createRunnerThreadRunExecutor({
    activeThreadEnvironmentId,
    agentCreationCommandHiddenPrompt,
    apiKey,
    appendTurnLog,
    backlogTaskConnectors,
    currentThreadId,
    displayedAgentLabel,
    displayedEnvironmentLabel,
    effectiveAgentId,
    effectiveEnvironmentId,
    effectiveProjectId,
    effectiveReasoningEffort,
    enabledSkillsPayload,
    ensureThread,
    environmentId,
    execute,
    fetchCustomSkills,
    getTurnDurationSeconds,
    githubContexts,
    githubRepositories,
    hiddenSystemPrompt,
    knowledgeContext: normalizedThreadKnowledgeContext,
    initializedThreadHistoryIdRef,
    locallyOwnedExecutionThreadIdRef,
    normalizedBackendUrl,
    normalizeIntentionalStopError,
    notifyTaskListChange,
    onCustomSkillsLoaded: acceptLoadedCustomSkills,
    onExternalRunRequestCreate,
    onMetronomeWorkflowRun,
    onRunFinish,
    onRunStart,
    onThreadStatusChange,
    onThreadTitleChange,
    prepareGithubRepoForThreadRun,
    refreshThreadContextDetails:
      refreshThreadContextDetailsInBackground,
    requestHeaders,
    resolveRequestHeaders,
    resolveAttachmentPayload,
    resourceCreationCommandHiddenPrompt,
    selectedAgent,
    selectedContextId: selectedGithubContextId,
    selectedEnvironment,
    selectedRepositoryId: selectedGithubRepositoryId,
    setExpandedTurns,
    setIsPreparingRun,
    setTurns,
    skillCreationCommandHiddenPrompt,
    title,
    updateTurn,
  });

  useRunnerExternalRunRequest({
    currentThreadId,
    disabled,
    enabled: Boolean(hasApiKey && normalizedBackendUrl),
    execute: async (request, normalizedPrompt, normalizedRequestThreadId) => {
      setPendingQueuedMessages([]);
      closeAllInputPopups();
      await executeThreadRun(normalizedPrompt, [], {
        threadIdOverride: normalizedRequestThreadId,
        environmentIdOverride: request.environmentId ?? undefined,
        agentIdOverride: request.agentId ?? undefined,
        agentNameOverride: request.agentName ?? undefined,
        reasoningEffortOverride: request.reasoningEffort ?? undefined,
        quotedSelection: request.quotedSelection || null,
        resolvedAttachmentsOverride: Array.isArray(request.attachments)
          ? request.attachments
          : undefined,
        githubRepoOverride: request.githubRepo ?? undefined,
        enabledSkillsOverride: request.enabledSkills ?? undefined,
        connectorsOverride: request.connectors === undefined
          ? undefined
          : request.connectors,
        knowledgeContextOverride: request.knowledgeContext === undefined
          ? undefined
          : request.knowledgeContext,
        displayPromptOverride: typeof request.displayPrompt === "string"
          ? request.displayPrompt
          : undefined,
        slideCreationCommand: request.slideCreationCommand || null,
        researchCreationCommand: request.researchCreationCommand || null,
        scrapeCreationCommand: request.scrapeCreationCommand || null,
        parseCreationCommand: request.parseCreationCommand || null,
        adCreationCommand: request.adCreationCommand || null,
        loopCommand: request.loopCommand || null,
      });
    },
    handledTokenRef: handledExternalRunRequestTokenRef,
    onError: (error, requestThreadId) => {
      try {
        onRunError?.(error, requestThreadId);
      } catch (callbackError) {
        reportRunnerLifecycleCallbackError("onRunError", callbackError);
      }
    },
    onHandled: (token) => {
      try {
        onExternalRunRequestHandled?.(token);
      } catch (error) {
        reportRunnerLifecycleCallbackError(
          "onExternalRunRequestHandled",
          error,
        );
      }
    },
    request: externalRunRequest,
    setError: setInlineError,
    setIsPreparingRun,
    wasIntentionalStop: consumeIntentionalStopAbort,
  });

  async function executeThreadContextAction(
    action: RunnerChatThreadContextAction,
    options?: { prompt?: string; commandText?: string }
  ) {
    return executeRunnerThreadContextAction({
      action,
      apiKey,
      appendBtwTurn: (commandText, responseText) => {
        appendSyntheticActionTurn(commandText, responseText, "Asked side question", {
          presentation: "btw",
        });
      },
      appendNotice: appendThreadContextActionNotice,
      appendPendingNotice: appendPendingThreadContextActionNotice,
      backendUrl: normalizedBackendUrl,
      beginAction: beginThreadContextAction,
      commandText: options?.commandText,
      finishAction: finishThreadContextAction,
      markContextCleared,
      onThreadForked: (nextThreadId) => {
        setLocalThreadId(nextThreadId);
        try {
          onThreadIdChange?.(nextThreadId);
        } catch (error) {
          reportRunnerLifecycleCallbackError("onThreadIdChange", error);
        }
      },
      prompt: options?.prompt,
      refreshDetails: refreshThreadContextDetailsInBackground,
      requestHeaders,
      threadId: currentThreadId,
      updateNotice: updateThreadContextActionNotice,
    });
  }

  useEffect(() => {
    mountRunnerChatStyles();
  }, []);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  useEffect(() => {
    if (threadId) {
      if (threadId !== localThreadId) {
        initializedThreadHistoryIdRef.current = null;
        setActiveThreadEnvironmentId(null);
        setActiveThreadEnvironmentName(null);
      }
      setLocalThreadId(threadId);
      setEditingTurnId(null);
      setEditingTurnDraft("");
      setComposerQuotedSelection(null);
      setQuotedSelectionPopup(null);
      closeDocumentAttachmentPreview();
      resetForkConfiguration();
    }
  }, [localThreadId, threadId]);

  useEffect(() => {
    if (currentThreadId) {
      return;
    }
    setActiveThreadEnvironmentId(null);
    setActiveThreadEnvironmentName(null);
  }, [currentThreadId]);

  useEffect(() => {
    if (!quotedSelectionPopup) {
      return;
    }

    function handleDocumentMouseDown(event: globalThis.MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        setQuotedSelectionPopup(null);
        return;
      }
      if (quotedSelectionPopupRef.current?.contains(target)) {
        return;
      }
      setQuotedSelectionPopup(null);
    }

    function handleViewportChange() {
      setQuotedSelectionPopup(null);
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [quotedSelectionPopup]);


  useEffect(() => {
    setHydratedThreadStatus(null);
    setPendingQueuedMessages([]);
    clearStopRequest();
    setEditingTurnId(null);
    setEditingTurnDraft("");
    setForkingTurnId(null);
    setPendingEditConfirmation(null);
    isDrainingQueuedRunsRef.current = false;
    if (locallyOwnedExecutionThreadIdRef.current !== currentThreadId) {
      locallyOwnedExecutionThreadIdRef.current = null;
    }
  }, [clearStopRequest, currentThreadId]);

  useEffect(() => {
    const hasPendingExternalRunForThread =
      Boolean(externalRunRequest)
      && handledExternalRunRequestTokenRef.current !== externalRunRequest?.token
      && String(externalRunRequest?.threadId || "").trim() === String(threadId || "").trim()
      && String(externalRunRequest?.prompt || "").trim().length > 0;
    if (
      !hasApiKey ||
      !normalizedBackendUrl ||
      !effectiveEnvironmentId ||
      !isPassiveWarmEnvironmentReady ||
      !isPassiveWarmAgentReady ||
      isPreparingRun ||
      isRunning ||
      hasPendingExternalRunForThread
    ) {
      lastEnvironmentStartRequestKeyRef.current = null;
      return;
    }
    const requestKey = JSON.stringify({
      environmentId: effectiveEnvironmentId,
      agentId: effectiveAgentId || null,
      enabledSkills: enabledSkillsPayload,
    });
    if (lastEnvironmentStartRequestKeyRef.current === requestKey) {
      return;
    }
    lastEnvironmentStartRequestKeyRef.current = requestKey;
    void startEnvironment({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      requestHeaders,
      environmentId: effectiveEnvironmentId,
      agentId: effectiveAgentId,
      enabledSkills: enabledSkillsPayload,
    }).catch(() => undefined);
  }, [
    apiKey,
    effectiveAgentId,
    effectiveEnvironmentId,
    enabledSkillsPayload,
    externalRunRequest,
    hasApiKey,
    isPassiveWarmAgentReady,
    isPassiveWarmEnvironmentReady,
    isPreparingRun,
    isRunning,
    normalizedBackendUrl,
    requestHeaders,
    threadId,
  ]);

  useEffect(() => {
    if (!runSummaryMoreTurnId) {
      return;
    }

    const handlePointerDown = (event: Event) => {
      const target = event.target as Node | null;
      if (runSummaryMoreMenuRef.current && target && !runSummaryMoreMenuRef.current.contains(target)) {
        setRunSummaryMoreTurnId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [runSummaryMoreTurnId]);

  useEffect(() => {
    if (!emailDeliveryAttachmentsTurnId) {
      return;
    }

    const handlePointerDown = (event: Event) => {
      const target = event.target as Node | null;
      if (emailDeliveryAttachmentsPopoverRef.current && target && !emailDeliveryAttachmentsPopoverRef.current.contains(target)) {
        setEmailDeliveryAttachmentsTurnId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [emailDeliveryAttachmentsTurnId]);

  useLayoutEffect(() => {
    threadHydrationCacheRef.current = null;
  }, [currentThreadId]);

  useRunnerLogAutoScroll({
    canonicalSequence: canonicalThread.projection.latestSequence,
    contentWidthRef,
    executionLogs: logs,
    hasCustomEmptyState: hasCustomEmptyStateActive,
    logsRef,
    threadId: currentThreadId,
    turns,
    usesCanonicalThreadSurface: shouldUseCanonicalThreadSurface,
  });

  useEffect(() => {
    const hasRunningTurn = turns.some((turn) => isRunningTurnStatus(turn.status));
    if (!hasRunningTurn) return;
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [turns]);

  useEffect(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const computed = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(computed.lineHeight) || 20;
    const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(computed.paddingBottom) || 0;
    const singleRowHeight = Math.ceil(lineHeight + paddingTop + paddingBottom);

    textarea.style.height = "auto";
    textarea.style.height = `${
      input.length === 0
        ? singleRowHeight
        : Math.max(singleRowHeight, Math.min(textarea.scrollHeight, 220))
    }px`;
  }, [input]);

  useLayoutEffect(() => {
    const selectedConnectors = selectedConnectorsInlineRef.current;
    const textareaShell = selectedConnectors?.parentElement;
    if (!selectedConnectors || !textareaShell) {
      return;
    }

    const syncInlineConnectorWidth = () => {
      const width = Math.ceil(selectedConnectors.getBoundingClientRect().width);
      textareaShell.style.setProperty(
        "--tb-selected-connectors-inline-width",
        `${width}px`,
      );
    };
    syncInlineConnectorWidth();

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(syncInlineConnectorWidth);
    resizeObserver?.observe(selectedConnectors);

    return () => {
      resizeObserver?.disconnect();
      textareaShell.style.removeProperty(
        "--tb-selected-connectors-inline-width",
      );
    };
  }, [selectedConnectorOptions]);

  useEffect(() => {
    if (!editingTextareaRef.current || !editingTurnId) return;
    const textarea = editingTextareaRef.current;
    const computed = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(computed.lineHeight) || 20;
    const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(computed.paddingBottom) || 0;
    const singleRowHeight = Math.ceil(lineHeight + paddingTop + paddingBottom);
    const maxHeight = 300;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(singleRowHeight, Math.min(textarea.scrollHeight, maxHeight))}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [editingTurnDraft, editingTurnId]);

  useEffect(() => {
    currentInputRef.current = input;
    onComposerDraftChange?.(input);
  }, [input, onComposerDraftChange]);

  useEffect(() => {
    if (!autoFocusComposer) {
      return;
    }
    focusComposerSoon({ preventScroll: hasCustomEmptyStateActive });
  }, [autoFocusComposer, hasCustomEmptyStateActive]);

  useEffect(() => {
    if (composerFocusRequest === null || composerFocusRequest === undefined) {
      return;
    }
    focusComposerSoon({ preventScroll: hasCustomEmptyStateActive });
  }, [composerFocusRequest]);

  useEffect(() => {
    if (!isRunning) return;
    void stopSpeechToText();
  }, [isRunning, stopSpeechToText]);

  async function ensureThread(taskText: string, options?: {
    reserveLocalExecution?: boolean;
    knowledgeContext?: RunnerKnowledgeContext | null;
  }): Promise<{
    threadId: string;
    didCreateThread: boolean;
    initialTitle: string | null;
    environmentId: string | null;
  }> {
    if (currentThreadId) {
      return {
        threadId: currentThreadId,
        didCreateThread: false,
        initialTitle: null,
        environmentId: activeThreadEnvironmentId || selectedEnvironment?.id || environmentId || null,
      };
    }

    if (!autoCreateThread) {
      throw new Error("No threadId available. Provide threadId or enable autoCreateThread.");
    }

    const createdThread = await createThread({
      backendUrl: normalizedBackendUrl,
      apiKey,
      requestHeaders,
      appId,
      environmentId: effectiveEnvironmentId,
      projectId: effectiveProjectId,
      agentId: effectiveAgentId,
      reasoningEffort: effectiveReasoningEffort,
      title: title || DEFAULT_NEW_THREAD_TITLE,
      metadata: threadMetadata,
      knowledgeContext: mergeRunnerKnowledgeContexts(
        normalizedThreadKnowledgeContext,
        options?.knowledgeContext,
      ),
      privateMode,
    });

    initializedThreadHistoryIdRef.current = createdThread.threadId;
    if (options?.reserveLocalExecution) {
      locallyOwnedExecutionThreadIdRef.current = createdThread.threadId;
    }
    setLocalThreadId(createdThread.threadId);
    setActiveThreadEnvironmentId(createdThread.environmentId || effectiveEnvironmentId || null);
    setActiveThreadEnvironmentName(selectedEnvironment?.name || null);
    try {
      onThreadIdChange?.(createdThread.threadId);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onThreadIdChange", error);
    }
    if (createdThread.title) {
      try {
        onThreadTitleChange?.(createdThread.threadId, createdThread.title);
      } catch (error) {
        reportRunnerLifecycleCallbackError("onThreadTitleChange", error);
      }
    }
    return {
      threadId: createdThread.threadId,
      didCreateThread: true,
      initialTitle: createdThread.title,
      environmentId: createdThread.environmentId || effectiveEnvironmentId || null,
    };
  }

  function handleDroppedLocalFiles(files: File[]): boolean {
    const validFiles = Array.from(files || []).filter((file) => file instanceof File);
    if (!validFiles.length) {
      return false;
    }
    appendFiles(validFiles);
    closeAllInputPopups();
    return true;
  }

  function handleAddFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    appendFiles(files);
    if (renderedSidePopup === "attach-files" || activeInputPopup === "attach-files") {
      closeAllInputPopups();
    }

    event.target.value = "";
  }

  function handlePromptAttachmentSelect(prompt: RunnerChatPromptAttachment) {
    const promptName = String(prompt?.name || "Untitled prompt").trim() || "Untitled prompt";
    const safeFilename = promptName
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "prompt";
    const filename = /\.md$/i.test(safeFilename) ? safeFilename : `${safeFilename}.md`;
    const markdown = typeof prompt?.markdown === "string" ? prompt.markdown : "";
    const file = new File([markdown], filename, { type: "text/markdown" });
    const promptId = String(prompt?.id || "").trim() || undefined;
    const promptVersionId = String(prompt?.currentVersionId || "").trim() || undefined;
    const promptVersionNumber = Number.isFinite(Number(prompt?.currentVersionNumber))
      ? Number(prompt.currentVersionNumber)
      : undefined;
    addReferenceAttachment({
      file,
      displayName: promptName,
      referenceType: "prompt",
      promptId,
      promptVersionId,
      promptVersionNumber,
    });

    const existingAttachmentIds = new Set(
      attachments
        .flatMap((attachment) => [
          String(attachment.resolvedAttachment?.id || "").trim(),
          String(attachment.sourceAttachmentId || "").trim(),
        ])
        .filter(Boolean),
    );
    const remainingCapacity = Math.max(
      maxAttachments - attachments.length - 1,
      0,
    );
    const embeddedAttachments: LocalAttachment[] =
      parseRunnerPromptEmbeddedAttachments(markdown)
        .filter((attachment) => !existingAttachmentIds.has(attachment.attachmentId))
        .slice(0, remainingCapacity)
        .map((attachment) => {
          const supportingFile = new File([], attachment.filename, {
            type: attachment.mimeType,
          });
          return {
            id: generateRunnerClientId("prompt-file"),
            file: supportingFile,
            type: attachment.type,
            source: "local",
            promptId,
            promptVersionId,
            promptVersionNumber,
            runnerAttachmentRole: "prompt_supporting_attachment",
            // Prompt-owned images are sent with the prompt for model context,
            // but are not independent user attachments in either the composer
            // or the persisted turn presentation.
            hiddenFromTurnDisplay: attachment.type === "image",
            sourceAttachmentId: attachment.attachmentId,
            sourceAttachmentUrl: attachment.url,
            uploadStatus: "uploading",
            uploadError: null,
          };
        });
    addAttachments(embeddedAttachments);
    for (const attachment of embeddedAttachments) {
      const uploadPromise = beginAttachmentUpload(attachment);
      if (uploadPromise) {
        void uploadPromise.catch(() => undefined);
      }
    }
    closeAllInputPopups();
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleThreadAttachmentSelect(thread: RunnerChatThreadAttachment) {
    const threadTitle = String(thread?.title || "Untitled thread").trim() || "Untitled thread";
    const safeFilename = threadTitle
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "thread";
    const filename = /\.md$/i.test(safeFilename) ? safeFilename : `${safeFilename}.md`;
    const markdown = typeof thread?.markdown === "string" && thread.markdown.trim()
      ? thread.markdown
      : [
          `# ${threadTitle}`,
          `Thread ID: ${String(thread?.id || "").trim()}`,
          String(thread?.description || "").trim(),
        ].filter(Boolean).join("\n\n");
    const file = new File([markdown], filename, { type: "text/markdown" });
    addReferenceAttachment({
      file,
      displayName: threadTitle,
      referenceType: "thread",
      threadId: String(thread?.id || "").trim() || undefined,
    });
    closeAllInputPopups();
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleKnowledgeAttachmentSelect(library: RunnerChatKnowledgeAttachment) {
    const libraryName = String(library?.name || "Untitled library").trim() || "Untitled library";
    const safeFilename = libraryName
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "knowledge-library";
    const filename = /\.md$/i.test(safeFilename) ? safeFilename : `${safeFilename}.md`;
    // Keep the composer attachment lightweight. The selected library and
    // immutable version are sent as Knowledge context and retrieved by the
    // authenticated execution gateway; uploading a generated copy would be
    // both redundant and potentially enormous.
    const file = new File([], filename, { type: "text/markdown" });
    addReferenceAttachment({
      file,
      displayName: libraryName,
      referenceType: "knowledge",
      knowledgeLibraryId: String(library?.id || "").trim() || undefined,
      knowledgeVersionId: String(library?.currentVersionId || "").trim() || undefined,
      knowledgeVersionNumber: Number.isFinite(Number(library?.currentVersionNumber))
        ? Number(library.currentVersionNumber)
        : undefined,
    });
    closeAllInputPopups();
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function addReferenceAttachment({
    file,
    displayName,
    referenceType,
    promptId,
    promptVersionId,
    promptVersionNumber,
    threadId,
    knowledgeLibraryId,
    knowledgeVersionId,
    knowledgeVersionNumber,
  }: {
    file: File;
    displayName: string;
    referenceType: "prompt" | "thread" | "knowledge";
    promptId?: string;
    promptVersionId?: string;
    promptVersionNumber?: number;
    threadId?: string;
    knowledgeLibraryId?: string;
    knowledgeVersionId?: string;
    knowledgeVersionNumber?: number;
  }) {
    if (attachments.length >= maxAttachments) {
      return;
    }
    const isKnowledgeReference = referenceType === "knowledge";
    const shouldUpload = !isKnowledgeReference && Boolean(
      uploadFiles || mapFileToAttachment || (normalizedBackendUrl && apiKey.trim()),
    );
    const attachment: LocalAttachment = {
      id: generateRunnerClientId(referenceType),
      file,
      type: "document",
      source: "local",
      referenceType,
      displayName,
      promptId,
      promptVersionId,
      promptVersionNumber,
      threadId,
      knowledgeLibraryId,
      knowledgeVersionId,
      knowledgeVersionNumber,
      runnerAttachmentRole: `${referenceType}_reference`,
      uploadStatus: shouldUpload ? "uploading" : "idle",
      uploadError: null,
    };
    addAttachments([attachment]);
    if (shouldUpload) {
      const uploadPromise = beginAttachmentUpload(attachment);
      if (uploadPromise) {
        void uploadPromise.catch(() => undefined);
      }
    }
  }

  function handlePromptsMenuClick() {
    closeAllInputPopups();
    onOpenPromptSearch?.(handlePromptAttachmentSelect);
  }

  function handleKnowledgeMenuClick() {
    closeAllInputPopups();
    onOpenKnowledgeSearch?.(handleKnowledgeAttachmentSelect);
  }

  useEffect(() => {
    const requestToken = externalPromptAttachmentRequest?.token;
    if (
      requestToken === null
      || requestToken === undefined
      || requestToken === ""
      || requestToken === handledExternalPromptAttachmentRequestTokenRef.current
      || !externalPromptAttachmentRequest?.prompt
    ) {
      return;
    }
    handledExternalPromptAttachmentRequestTokenRef.current = requestToken;
    handlePromptAttachmentSelect(externalPromptAttachmentRequest.prompt);
    onExternalPromptAttachmentRequestHandled?.(requestToken);
  }, [externalPromptAttachmentRequest, onExternalPromptAttachmentRequestHandled]);

  function handleThreadsMenuClick() {
    closeAllInputPopups();
    onOpenThreadSearch?.(handleThreadAttachmentSelect);
  }

  function handleAttachFilesMenuClick() {
    setActiveInputPopup("attach-files");
  }

  function closeAttachFilesPopup() {
    resetFileDragState();
    setActiveInputPopup("main");
  }

  function closeSkillsPopup() {
    setActiveInputPopup("main");
  }

  function closeAgentReasoningPopup() {
    setActiveInputPopup("agent");
  }

  function closeSchedulePopup() {
    setActiveInputPopup("main");
  }

  function handleUploadNewFilesClick() {
    fileInputRef.current?.click();
  }

  function openFileBrowserModal(initialSource: RunnerFileBrowserSource) {
    if (!requestFileBrowserOpen(initialSource, hasApiKey)) {
      return;
    }
    setActiveInputPopup(null);
    resetFileBrowserSourceData(initialSource);
  }

  useEffect(() => {
    const token = String(externalFileBrowserRequest?.token || "").trim();
    if (!token || token === lastExternalFileBrowserRequestTokenRef.current) {
      return;
    }
    lastExternalFileBrowserRequestTokenRef.current = token;
    openFileBrowserModal(normalizeRunnerFileBrowserSource(externalFileBrowserRequest?.source));
  }, [externalFileBrowserRequest]);

  function closeFileBrowserModal() {
    closeFileBrowserNavigation();
    resetFileBrowserAttaching();
    resetFileBrowserSourceDataAfterClose();
  }

  function handleGithubRepoBranchChange(item: RunnerChatFileNode, nextBranch: string) {
    const repoFullName = String(item.repoFullName || "").trim();
    const normalizedBranch = String(nextBranch || "").trim();
    if (!repoFullName || !normalizedBranch) {
      return;
    }

    const currentRootId = String(item.id || "").trim();
    const nextRootId = createGithubBrowserRepoFolderId(repoFullName, normalizedBranch);

    setGithubSelectedBranchByRepoFullName((current) => ({
      ...current,
      [repoFullName]: normalizedBranch,
    }));

    setRemoteGithubItems((current) => {
      const nextItems: RunnerChatFileNode[] = [];
      let rootUpdated = false;
      for (const currentItem of current) {
        if (String(currentItem.repoFullName || "").trim() !== repoFullName) {
          nextItems.push(currentItem);
          continue;
        }
        if ((currentItem.parentId ?? null) === null) {
          nextItems.push({
            ...currentItem,
            id: nextRootId,
            ref: normalizedBranch,
          });
          rootUpdated = true;
        }
      }
      if (!rootUpdated) {
        nextItems.push({
          ...item,
          id: nextRootId,
          ref: normalizedBranch,
          parentId: null,
        });
      }
      return nextItems;
    });

    setLoadedGithubFolderIds((current) =>
      current.filter((folderId) => parseGithubBrowserFolderId(folderId).repoFullName !== repoFullName)
    );
    setLoadingGithubFolderIds((current) =>
      current.filter((folderId) => parseGithubBrowserFolderId(folderId).repoFullName !== repoFullName)
    );
    setExpandedFileBrowserFolderIds((current) =>
      current
        .filter((folderId) => parseGithubBrowserFolderId(folderId).repoFullName !== repoFullName)
        .concat(current.includes(currentRootId) ? [nextRootId] : [])
    );
    setSelectedGithubFileIds((current) =>
      current.filter((fileId) => parseGithubBrowserFolderId(fileId).repoFullName !== repoFullName)
    );
    setFileBrowserPreviewId((current) => {
      if (!current || parseGithubBrowserFolderId(current).repoFullName !== repoFullName) {
        return current;
      }
      return null;
    });
    mapFileBrowserHistory((entry) => {
        if (entry.source !== "github" || !entry.folderId) {
          return entry;
        }
        const parsedFolder = parseGithubBrowserFolderId(entry.folderId);
        if (parsedFolder.repoFullName !== repoFullName) {
          return entry;
        }
        if (!parsedFolder.path) {
          return {
            ...entry,
            folderId: nextRootId,
          };
        }
        return {
          ...entry,
          folderId: createGithubBrowserNodeId(repoFullName, parsedFolder.path, normalizedBranch),
        };
      });

    if (currentFileBrowserSource === "github" && currentFileBrowserFolderId) {
      const parsedFolder = parseGithubBrowserFolderId(currentFileBrowserFolderId);
      if (parsedFolder.repoFullName === repoFullName) {
        const nextFolderId = parsedFolder.path
          ? createGithubBrowserNodeId(repoFullName, parsedFolder.path, normalizedBranch)
          : nextRootId;
        void loadGithubFolder(nextFolderId);
      }
    }
  }

  async function handleGoogleDriveManageAccess() {
    if (!googleDriveConfig?.onManageAccess) {
      return;
    }

    setIsGoogleDrivePickerLoading(true);
    try {
      await googleDriveConfig.onManageAccess();
      setRemoteGoogleDriveItems([]);
      setLoadedGoogleDriveFolderIds([]);
      replaceFileBrowserHistory({ source: "google-drive", folderId: null });
      await loadGoogleDriveFolder("root");
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setGoogleDriveBrowserError(normalizedError.message || "Failed to open Google Drive picker.");
    } finally {
      setIsGoogleDrivePickerLoading(false);
    }
  }

  async function handleMicrophoneClick() {
    if (disabled || isPreparingRun) return;
    await toggleSpeechToText();
  }

  function selectAgent(nextAgentId: string) {
    const normalizedAgentId = String(nextAgentId || "").trim();
    const selectedAgentOption = agents.find((agent) => String(agent?.id || "").trim() === normalizedAgentId) || null;
    if (selectedAgentOption && isAgentSelectionBlocked?.(selectedAgentOption)) {
      setActiveInputPopup(null);
      onBlockedAgentSelect?.(selectedAgentOption);
      return;
    }

    setSelectedAgentId(normalizedAgentId);
    onAgentChange?.(normalizedAgentId);
    setActiveInputPopup(null);
  }

  function selectReasoningEffort(nextReasoningEffort: RunnerReasoningEffortId) {
    const normalizedReasoningEffort = normalizeRunnerReasoningEffort(nextReasoningEffort);
    setSelectedReasoningEffort(normalizedReasoningEffort);
    onReasoningEffortChange?.(normalizedReasoningEffort);
  }

  function selectEnvironment(nextEnvironmentId: string) {
    const previousEnvironmentId = selectedEnvironmentId || sourceThreadEnvironmentId || environmentId || "";
    const threadEnvironmentId = sourceThreadEnvironmentId || environmentId || "";
    const isWorkspaceModeChange = workspaceSelectorMode !== "computers" || Boolean(selectedProjectId);

    if (nextEnvironmentId === previousEnvironmentId && !isWorkspaceModeChange) {
      setActiveInputPopup(null);
      return;
    }

    setWorkspaceSelectorMode("computers");
    setSelectedProjectId("");
    projectsConfig?.onProjectChange?.("");

    if (
      currentThreadId &&
      currentThreadHasMessages &&
      currentThreadHasWorkspaceChanges &&
      threadEnvironmentId &&
      nextEnvironmentId !== threadEnvironmentId
    ) {
      setSelectedEnvironmentId(nextEnvironmentId);
      openForkDialogForCurrentThread("", {
        includeCurrentAttachments: false,
        preselectedTargetEnvironmentId: nextEnvironmentId,
        restoreSelectedEnvironmentId: previousEnvironmentId,
        initialExistingEnvironmentFileCopyMode: "thread_only",
      });
      return;
    }

    setSelectedEnvironmentId(nextEnvironmentId);
    onEnvironmentChange?.(nextEnvironmentId);
    persistWorkspaceSelection(workspaceSelectionStorageKey, {
      mode: "computers",
      environmentId: nextEnvironmentId,
      projectId: "",
    });
    setActiveInputPopup(null);
  }

  function selectComposerOrganization(nextOrganizationId: string) {
    const normalizedOrganizationId = String(nextOrganizationId || "").trim();
    if (!normalizedOrganizationId) {
      setActiveInputPopup(null);
      return;
    }

    onComposerOrganizationChange?.(normalizedOrganizationId);
    setActiveInputPopup(null);
  }

  function selectProject(nextProjectId: string) {
    const normalizedProjectId = String(nextProjectId || "").trim();
    const project = availableProjects.find((entry) => entry.id === normalizedProjectId) || null;
    const nextEnvironmentId = getRunnerProjectEnvironmentId(project);
    if (!project || !nextEnvironmentId) {
      return;
    }

    setWorkspaceSelectorMode("projects");
    setSelectedProjectId(project.id);
    setSelectedEnvironmentId(nextEnvironmentId);
    projectsConfig?.onProjectChange?.(project.id);
    onEnvironmentChange?.(nextEnvironmentId);
    persistWorkspaceSelection(workspaceSelectionStorageKey, {
      mode: "projects",
      projectId: project.id,
      environmentId: nextEnvironmentId,
    });
    setActiveInputPopup(null);
  }

  function resetSlashPopupComposer() {
    setSlashPopupView("commands");
    setActiveSlashPopupIndex(0);
    setInputSelectionStart(0);
    clearComposerDraft({ preserveSelectedConnectors: true });
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true });
    });
  }

  function handleSlashAttachWorkspaceFilesClick() {
    resetSlashPopupComposer();
    openFileBrowserModal("workspace");
  }

  function handleSlashUploadFilesClick() {
    if (attachments.length >= maxAttachments) {
      return;
    }
    resetSlashPopupComposer();
    handleUploadNewFilesClick();
  }

  function handleSlashPromptAttachmentClick() {
    if (!onOpenPromptSearch) {
      return;
    }
    resetSlashPopupComposer();
    handlePromptsMenuClick();
  }

  function handleSlashKnowledgeAttachmentClick() {
    if (!onOpenKnowledgeSearch) {
      return;
    }
    resetSlashPopupComposer();
    handleKnowledgeMenuClick();
  }

  function handleSlashThreadAttachmentClick() {
    if (!onOpenThreadSearch) {
      return;
    }
    resetSlashPopupComposer();
    handleThreadsMenuClick();
  }

  function handleSlashFeedbackClick() {
    const reportTurn = [...turns].reverse().find((turn) => Boolean(String(turn.prompt || "").trim()));
    const targetId = reportTurn?.id || currentThreadId || "composer";
    const summaryText = reportTurn?.prompt || input.trim() || "Feedback from the composer";
    resetSlashPopupComposer();
    openReportIssueModal(targetId, summaryText, {
      allowUnavailable: true,
      reportType: "general",
    });
  }

  function handleSlashProjectSelect(nextProjectId: string) {
    const normalizedProjectId = String(nextProjectId || "").trim();
    const project = availableProjects.find((entry) => entry.id === normalizedProjectId) || null;
    if (!project || !getRunnerProjectEnvironmentId(project)) {
      return;
    }
    selectProject(normalizedProjectId);
    resetSlashPopupComposer();
  }

  function handleSlashReasoningSelect(nextReasoningEffort: RunnerReasoningEffortId) {
    selectReasoningEffort(nextReasoningEffort);
    resetSlashPopupComposer();
  }

  function handleSlashPopupItemSelect(index: number) {
    if (slashPopupView === "commands") {
      if (index === 0) {
        handleSlashFeedbackClick();
        return;
      }
      if (index === 1) {
        setSlashPopupView("projects");
        setActiveSlashPopupIndex(0);
        return;
      }
      if (index === 2) {
        setSlashPopupView("reasoning");
        setActiveSlashPopupIndex(0);
        return;
      }
      if (index === 3) {
        handleSlashAttachWorkspaceFilesClick();
        return;
      }
      if (index === 4) {
        handleSlashUploadFilesClick();
        return;
      }
      if (index === 5) {
        handleSlashPromptAttachmentClick();
        return;
      }
      if (index === 6) {
        handleSlashKnowledgeAttachmentClick();
        return;
      }
      if (index === 7) {
        handleSlashThreadAttachmentClick();
        return;
      }
      const item = filteredSlashCommandItems[index - RUNNER_SLASH_CORE_ACTION_COUNT];
      if (!item) return;
      item.stage();
      window.requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
      return;
    }
    if (slashPopupView === "projects") {
      const project = orderedProjects[index];
      if (project) {
        handleSlashProjectSelect(project.id);
      }
      return;
    }
    const reasoningOption = RUNNER_REASONING_EFFORT_OPTIONS[index];
    if (reasoningOption) {
      handleSlashReasoningSelect(reasoningOption.id);
    }
  }

  function handleWorkspaceFileBrowserEnvironmentSelect(nextEnvironmentId: string) {
    setSelectedWorkspaceFileIds([]);
    pruneWorkspaceAttachmentsForEnvironment(nextEnvironmentId);
    setSelectedEnvironmentId(nextEnvironmentId);
    onEnvironmentChange?.(nextEnvironmentId);
    switchFileBrowserSource("workspace");
  }

  function switchFileBrowserSource(nextSource: RunnerFileBrowserSource) {
    resetFileBrowserSourceNavigation(nextSource);
    resetFileBrowserSourceData(nextSource);
  }

  function handleFileBrowserAccountChange(
    source: RunnerFileBrowserConnectorSource,
    nextAccountId: string,
  ) {
    const normalizedAccountId = String(nextAccountId || "").trim();
    setFileBrowserAccountOverrides((current) => ({
      ...current,
      [source]: normalizedAccountId || "__default__",
    }));
    const config =
      source === "google-drive"
        ? googleDriveConfig
        : source === "one-drive"
          ? oneDriveConfig
          : source === "notion"
            ? notionConfig
            : githubConfig;
    config?.onAccountChange?.(normalizedAccountId);
    setFileBrowserPreviewId(null);
    if (source === "google-drive") {
      setSelectedGoogleDriveFileIds([]);
    } else if (source === "one-drive") {
      setSelectedOneDriveFileIds([]);
    } else if (source === "github") {
      setSelectedGithubFileIds([]);
    } else {
      setSelectedNotionDatabaseId("");
    }
    resetFileBrowserSourceData(source);
    resetFileBrowserSourceNavigation(source);
  }

  function navigateFileBrowserToBreadcrumb(index: number) {
    const nextEntry = fileBrowserPath[index];
    if (!nextEntry) return;
    navigateFileBrowserToFolder(nextEntry.id);
  }

  async function toggleFileBrowserFolderExpansion(folderId: string, event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (fileBrowserSearchQuery.trim()) {
      setFileBrowserSearchQuery("");
    }
    const isExpanded = expandedFileBrowserFolderIds.includes(folderId);
    if (!isExpanded && currentFileBrowserSource === "workspace" && !loadedWorkspaceFolderIds.includes(folderId)) {
      await loadWorkspaceFolder(folderId, { inline: true });
    }
    if (!isExpanded && currentFileBrowserSource === "google-drive" && googleDriveConfig?.fetchItems && !loadedGoogleDriveFolderIds.includes(folderId)) {
      await loadGoogleDriveFolder(folderId, { inline: true });
    }
    if (!isExpanded && currentFileBrowserSource === "one-drive" && oneDriveConfig?.fetchItems && !loadedOneDriveFolderIds.includes(folderId)) {
      await loadOneDriveFolder(folderId, { inline: true });
    }
    if (!isExpanded && currentFileBrowserSource === "github" && githubConfig?.fetchItems && !loadedGithubFolderIds.includes(folderId)) {
      await loadGithubFolder(folderId, { inline: true });
    }
    setExpandedFileBrowserFolderIds((current) => (current.includes(folderId) ? current.filter((id) => id !== folderId) : [...current, folderId]));
  }

  async function openFileBrowserFolder(item: RunnerChatFileNode) {
    const normalizedFolderId = String(item.id || "").trim();
    if (!normalizedFolderId) {
      return;
    }

    navigateFileBrowserToFolder(normalizedFolderId);

    if (currentFileBrowserSource === "workspace" && !loadedWorkspaceFolderIds.includes(normalizedFolderId)) {
      await loadWorkspaceFolder(normalizedFolderId);
      return;
    }
    if (currentFileBrowserSource === "google-drive" && googleDriveConfig?.fetchItems && !loadedGoogleDriveFolderIds.includes(normalizedFolderId)) {
      await loadGoogleDriveFolder(normalizedFolderId);
      return;
    }
    if (currentFileBrowserSource === "one-drive" && oneDriveConfig?.fetchItems && !loadedOneDriveFolderIds.includes(normalizedFolderId)) {
      await loadOneDriveFolder(normalizedFolderId);
      return;
    }
    if (currentFileBrowserSource === "github" && githubConfig?.fetchItems && !loadedGithubFolderIds.includes(normalizedFolderId)) {
      await loadGithubFolder(normalizedFolderId);
    }
  }

  function toggleFileBrowserItemSelection(item: RunnerChatFileNode) {
    if (currentFileBrowserSource === "google-drive") {
      toggleFileBrowserSelection("google-drive", item.id);
      return;
    }

    if (currentFileBrowserSource === "one-drive") {
      toggleFileBrowserSelection("one-drive", item.id);
      return;
    }
    if (currentFileBrowserSource === "github") {
      toggleFileBrowserSelection("github", item.id);
      return;
    }
    if (currentFileBrowserSource === "notion") {
      setSelectedNotionDatabaseId((current) => (current === item.id ? "" : item.id));
      return;
    }

    toggleFileBrowserSelection("workspace", item.id);
  }

  function handleFileBrowserItemClick(item: RunnerChatFileNode) {
    setFileBrowserPreviewId(item.id);
    if (item.isFolder) {
      void openFileBrowserFolder(item);
      return;
    }
    toggleFileBrowserItemSelection(item);
  }

  function handleFileBrowserItemOpen(item: RunnerChatFileNode) {
    setFileBrowserPreviewId(item.id);
    if (item.isFolder) void openFileBrowserFolder(item);
  }

  async function handleFileBrowserAttach() {
    if (currentFileBrowserSource === "google-drive") {
      if (await attachIntegrationFiles("google-drive")) {
        closeFileBrowserModal();
      }
      return;
    }
    if (currentFileBrowserSource === "one-drive") {
      if (await attachIntegrationFiles("one-drive")) {
        closeFileBrowserModal();
      }
      return;
    }
    if (currentFileBrowserSource === "github") {
      if (await attachIntegrationFiles("github")) {
        closeFileBrowserModal();
      }
      return;
    }
    if (currentFileBrowserSource === "notion") {
      const nextDatabaseId = selectedNotionDatabaseId || "";
      if (nextDatabaseId) {
        selectNotionDatabase(nextDatabaseId);
      }
      closeFileBrowserModal();
      return;
    }
    if (await attachWorkspaceFiles()) {
      closeFileBrowserModal();
    }
  }

  async function handleThreadContextCommand(command: ParsedThreadContextCommand, options?: { commandText?: string }) {
    setInlineError(null);
    await stopSpeechToText();

    if (command.action === "context") {
      openContextPopup();
      clearComposerDraft();
      return;
    }

    if (command.action === "btw" && !command.prompt) {
      throw new Error("Provide a side question after /btw.");
    }

    if (command.action === "btw") {
      clearComposerDraft();
      await streamBtwSideQuestion(command.prompt || "", options?.commandText || formatThreadContextCommandText("btw", command.prompt || ""));
      return;
    }

    if (command.action === "fork") {
      openForkDialogForCurrentThread(command.prompt || "");
      return;
    }

    await executeThreadContextAction(command.action, {
      prompt: command.prompt?.trim() || undefined,
      commandText: options?.commandText || input.trim(),
    });
  }

  async function handleContextPopupActionClick(action: RunnerChatThreadContextAction) {
    setInlineError(null);
    clearThreadContextDetailsError();
    closeAllInputPopups();
    if (action === "clear") {
      void stopSpeechToText().catch((error) => {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setInlineError(normalizedError.message || "Failed to stop speech-to-text.");
      });
      void executeThreadContextAction("clear").catch((error) => {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setInlineError(normalizedError.message || "Failed to clear thread context.");
      });
      return;
    }
    stageThreadContextCommand(action);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
    void stopSpeechToText().catch((error) => {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to stop speech-to-text.");
    });
  }

  async function runTask() {
    if (!canRun) return;

    setInlineError(null);
    closeAllInputPopups();
    let ensuredThreadId: string | undefined;
    let participantNeutralTurnId: string | null = null;

    try {
      if (!normalizedBackendUrl) {
        throw new Error("backendUrl is required.");
      }
      if (!apiKey) {
        throw new Error("apiKey is required.");
      }

      const taskText = trimmedInput;
      const composerAttachmentEntries = attachments;
      let attachmentEntries = composerAttachmentEntries;
      const previewImageRunAttachment = buildRunnerAttachmentFromPreviewAttachment(previewedDocumentAttachment);
      const previewImageRunAttachments = previewImageRunAttachment ? [previewImageRunAttachment] : null;
      const quotedSelection = composerQuotedSelection;
      const backlogCommand = stagedBacklogCommand;
      const batchCreationCommand = stagedBatchCreationCommand;
      const loopCommand = stagedLoopCommand;
      const resourceCreationCommand = stagedResourceCreationCommand;
      const agentCreationCommand = stagedAgentCreationCommand;
      const skillCreationCommand = stagedSkillCreationCommand;
      const slideCreationCommand = stagedSlideCreationCommand;
      const researchCreationCommand = stagedResearchCreationCommand;
      const scrapeCreationCommand = stagedScrapeCreationCommand;
      const parseCreationCommand = stagedParseCreationCommand;
      const adCreationCommand = stagedAdCreationCommand ? buildStagedRunnerAdCreationCommand(adCreationSettings) : null;
      const runConnectorPayload = mergeRunnerConnectorPayloads(
        backlogTaskConnectors,
        selectedConnectorPayload,
      );
      const runConnectorIds = getRunnerConnectorIdsFromPayload(
        runConnectorPayload,
      );
      if (stagedThreadContextCommand) {
        const stagedPrompt = textareaAllowsPromptAfterStagedCommand ? taskText : "";
        const shouldPreserveComposerState = stagedThreadContextCommand === "fork";
        if (!shouldPreserveComposerState) {
          clearComposerDraft();
          clearComposerAttachments(composerAttachmentEntries);
        }
        await handleThreadContextCommand(
          {
            action: stagedThreadContextCommand,
            ...(stagedPrompt ? { prompt: stagedPrompt } : {}),
          },
          {
            commandText: formatThreadContextCommandText(stagedThreadContextCommand, stagedPrompt),
          }
        );
        return;
      }
      const threadContextCommand = parseThreadContextCommand(taskText);
      if (threadContextCommand) {
        const shouldPreserveComposerState = threadContextCommand.action === "fork";
        if (!shouldPreserveComposerState) {
          clearComposerDraft();
          clearComposerAttachments(composerAttachmentEntries);
        }
        await handleThreadContextCommand(threadContextCommand);
        return;
      }

      if (batchCreationCommand && onBatchJobCreate && taskText) {
        setIsSavingBatchJob(true);
        try {
          const implicitAttachmentEntries =
            await createRunnerImplicitAttachments(implicitAttachments);
          attachmentEntries = implicitAttachmentEntries.length > 0
            ? [...implicitAttachmentEntries, ...composerAttachmentEntries]
            : composerAttachmentEntries;
          const resolvedAttachments = await resolveAttachmentPayload(attachmentEntries);
          const githubRepo = buildSelectedGithubRepoReference(attachmentEntries, {
            repositories: githubRepositories,
            contexts: githubContexts,
            selectedRepositoryId: selectedGithubRepositoryId,
            selectedContextId: selectedGithubContextId,
          });
          const batchPayload: RunnerChatBatchJobSubmitPayload = {
            prompt: taskText,
            attachments: resolvedAttachments || [],
            environmentId: effectiveEnvironmentId ?? null,
            projectId: effectiveProjectId ?? null,
            agentId: effectiveAgentId ?? null,
            agentName: selectedAgent?.name || displayedAgentLabel || null,
            reasoningEffort: effectiveReasoningEffort,
            githubRepo: githubRepo || null,
            enabledSkills: enabledSkillsPayload || null,
            connectors: runConnectorPayload,
            knowledgeContext: mergeRunnerKnowledgeContexts(
              normalizedThreadKnowledgeContext,
              buildRunnerKnowledgeContextFromAttachments(attachmentEntries),
            ),
            quotedSelection,
            targetKind: "thread_run",
            startPolicy: "manual",
          };
          const didSaveBatch = await onBatchJobCreate(batchPayload);
          if (didSaveBatch !== false) {
            clearComposerDraft();
            clearComposerAttachments(composerAttachmentEntries, {
              revokePreviews: false,
            });
            setBatchSavedReceiptId((current) => current + 1);
            if (keepFocusOnSubmit) {
              focusComposerSoon();
            }
            await stopSpeechToText();
          }
        } finally {
          setIsSavingBatchJob(false);
        }
        return;
      }

      setIsPreparingRun(true);
      const implicitAttachmentEntries =
        await createRunnerImplicitAttachments(implicitAttachments);
      attachmentEntries = implicitAttachmentEntries.length > 0
        ? [...implicitAttachmentEntries, ...composerAttachmentEntries]
        : composerAttachmentEntries;

      if (onComposerSubmit && taskText && !loopCommand) {
        const resolvedAttachments = await resolveAttachmentPayload(attachmentEntries);
        const githubRepo = buildSelectedGithubRepoReference(attachmentEntries, {
          repositories: githubRepositories,
          contexts: githubContexts,
          selectedRepositoryId: selectedGithubRepositoryId,
          selectedContextId: selectedGithubContextId,
        });
        const didHandleComposer = await onComposerSubmit({
          prompt: taskText,
          attachments: resolvedAttachments || [],
          environmentId: effectiveEnvironmentId ?? null,
          projectId: effectiveProjectId ?? null,
          agentId: effectiveAgentId ?? null,
          agentName: selectedAgent?.name || displayedAgentLabel || null,
          reasoningEffort: effectiveReasoningEffort,
          githubRepo: githubRepo || null,
          enabledSkills: enabledSkillsPayload || null,
          connectors: runConnectorPayload,
          knowledgeContext: mergeRunnerKnowledgeContexts(
            normalizedThreadKnowledgeContext,
            buildRunnerKnowledgeContextFromAttachments(attachmentEntries),
          ),
          quotedSelection,
        });
        if (didHandleComposer !== false) {
          clearComposerDraft();
          clearComposerAttachments(composerAttachmentEntries, {
            revokePreviews: false,
          });
          if (keepFocusOnSubmit) {
            focusComposerSoon();
          }
          await stopSpeechToText();
        }
        return;
      }

      if (
        selectedComposerProjectTask
        && onComposerProjectTaskSubmit
        && taskText
        && !loopCommand
      ) {
        const resolvedAttachments = await resolveAttachmentPayload(attachmentEntries);
        const githubRepo = buildSelectedGithubRepoReference(attachmentEntries, {
          repositories: githubRepositories,
          contexts: githubContexts,
          selectedRepositoryId: selectedGithubRepositoryId,
          selectedContextId: selectedGithubContextId,
        });
        const didHandleProjectTask = await onComposerProjectTaskSubmit({
          prompt: taskText,
          taskPreview: selectedComposerProjectTask,
          attachments: resolvedAttachments || [],
          environmentId: effectiveEnvironmentId ?? null,
          projectId: effectiveProjectId ?? null,
          agentId: effectiveAgentId ?? null,
          agentName: selectedAgent?.name || displayedAgentLabel || null,
          reasoningEffort: effectiveReasoningEffort,
          githubRepo: githubRepo || null,
          enabledSkills: enabledSkillsPayload || null,
          connectors: runConnectorPayload,
          quotedSelection,
        });
        if (didHandleProjectTask !== false) {
          clearComposerDraft();
          clearComposerAttachments(composerAttachmentEntries, {
            revokePreviews: false,
          });
          if (keepFocusOnSubmit) {
            focusComposerSoon();
          }
          await stopSpeechToText();
          return;
        }
      }
      if (stagedBacklogMissionControlCommand && onBacklogMissionControlSubmit) {
        const resolvedAttachments = await resolveAttachmentPayload(attachmentEntries);
        const githubRepo = buildSelectedGithubRepoReference(attachmentEntries, {
          repositories: githubRepositories,
          contexts: githubContexts,
          selectedRepositoryId: selectedGithubRepositoryId,
          selectedContextId: selectedGithubContextId,
        });
        clearComposerDraft();
        clearComposerAttachments(composerAttachmentEntries, {
          revokePreviews: false,
        });
        if (keepFocusOnSubmit) {
          focusComposerSoon();
        }
        await stopSpeechToText();
        await onBacklogMissionControlSubmit({
          prompt: taskText,
          attachments: resolvedAttachments || [],
          environmentId: effectiveEnvironmentId ?? null,
          projectId: effectiveProjectId ?? null,
          agentId: effectiveAgentId ?? null,
          reasoningEffort: effectiveReasoningEffort,
          ...(githubRepo
            ? {
                githubRepo: {
                  repoFullName: githubRepo.repoFullName,
                  repoName: githubRepo.repoName || githubRepo.repoFullName.split("/").pop() || githubRepo.repoFullName,
                  branch: githubRepo.branch || "main",
                },
              }
            : {}),
          ...(enabledSkillsPayload ? { enabledSkills: enabledSkillsPayload } : {}),
          ...(runConnectorPayload ? { connectors: runConnectorPayload } : {}),
        });
        return;
      }

      let executionTaskText = taskText;
      let executionAttachmentEntries = attachmentEntries;
      let shouldClosePreviewAfterSubmit = false;
      if (
        previewImageRunAttachment
        && previewImageSelectionState
        && previewImageSelectionState.attachmentId === String(previewedDocumentAttachment?.id || previewedDocumentAttachment?.workspacePath || previewedDocumentAttachment?.filename || "")
        && Array.isArray(previewImageSelectionState.strokes)
        && previewImageSelectionState.strokes.length > 0
      ) {
        const maskFile = await createRunnerImageSelectionMaskFile(previewImageSelectionState, previewImageRunAttachment);
        if (maskFile) {
          const maskLocalAttachment: LocalAttachment = {
            id: generateId("attachment"),
            file: maskFile,
            type: "image",
            previewUrl: URL.createObjectURL(maskFile),
            source: "local",
            hiddenFromTurnDisplay: true,
            runnerAttachmentRole: "image_edit_mask",
          };
          executionAttachmentEntries = [...attachmentEntries, maskLocalAttachment];
          executionTaskText = [
            buildRunnerImageSelectionInpaintPrompt(previewImageRunAttachment, maskFile.name),
            taskText,
          ].filter(Boolean).join("\n\n");
          shouldClosePreviewAfterSubmit = true;
        }
      }
      const queuedTurnAttachments = mergeRunnerTurnAttachments(
        buildTurnAttachmentsFromLocalAttachments(executionAttachmentEntries),
        buildTurnAttachmentsFromRunnerAttachments(previewImageRunAttachments || undefined, normalizedBackendUrl)
      );

      if (shouldClosePreviewAfterSubmit) {
        closeDocumentAttachmentPreview();
      }
      clearComposerDraft();
      clearComposerAttachments(composerAttachmentEntries, {
        revokePreviews: false,
      });
      if (keepFocusOnSubmit) {
        focusComposerSoon();
      }
      await stopSpeechToText();
      const shouldAttemptParticipantNeutralRouting = (
        executionAttachmentEntries.length === 0 &&
        !quotedSelection &&
        !runConnectorPayload &&
        !loopCommand
      );
      if (shouldAttemptParticipantNeutralRouting) {
        participantNeutralTurnId = appendParticipantNeutralPendingTurn(taskText);
        if (await tryHandleThreadCommunicatorMessage(taskText, participantNeutralTurnId)) {
          return;
        }
      }
      const hasSpecialExecutionCommand = Boolean(
        backlogCommand
        || resourceCreationCommand
        || agentCreationCommand
        || skillCreationCommand
        || slideCreationCommand
        || researchCreationCommand
        || scrapeCreationCommand
        || parseCreationCommand
        || adCreationCommand
        || loopCommand
      );
      if (
        executionAttachmentEntries.length === 0
        && !(previewImageRunAttachments?.length)
        && !quotedSelection
        && !runConnectorPayload
        && !hasSpecialExecutionCommand
        && await tryHandleActiveCanonicalWorkerInstruction(taskText)
      ) {
        if (participantNeutralTurnId) {
          removeTurn(participantNeutralTurnId);
        }
        return;
      }
      if (hasRoutableActiveRun) {
        const queuedTurnId = participantNeutralTurnId || generateId("turn");
        const queuedTurn = (existingTurn?: RunnerTurn): RunnerTurn => ({
          ...(existingTurn || {}),
          id: queuedTurnId,
          prompt: taskText,
          logs: [],
          startedAtMs: existingTurn?.startedAtMs || Date.now(),
          status: "queued",
          animateOnRender: true,
          isInitialTurn: existingTurn?.isInitialTurn,
          agentName: selectedAgent?.name || displayedAgentLabel,
          environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
          quotedSelection,
          attachments: queuedTurnAttachments,
          slideCreationCommand,
          researchCreationCommand,
          scrapeCreationCommand,
          parseCreationCommand,
          adCreationCommand,
          loopCommand,
          messageMetadata: runConnectorIds.length > 0
            ? { [RUNNER_CONNECTOR_IDS_METADATA_KEY]: runConnectorIds }
            : null,
        });
        if (participantNeutralTurnId) {
          updateTurn(queuedTurnId, queuedTurn);
        } else {
          setTurns((prev) => [
            ...prev,
            queuedTurn({
              id: queuedTurnId,
              prompt: taskText,
              logs: [],
              startedAtMs: Date.now(),
              status: "queued",
              isInitialTurn: prev.length === 0,
            }),
          ]);
        }
        setPendingQueuedMessages((prev) => [
          ...prev,
          {
            id: generateId("queue"),
            turnId: queuedTurnId,
            prompt: executionTaskText,
            displayPrompt: taskText,
            attachments: executionAttachmentEntries,
            extraResolvedAttachments: previewImageRunAttachments,
            reasoningEffort: effectiveReasoningEffort,
            quotedSelection,
            backlogCommand,
            resourceCreationCommand,
            agentCreationCommand,
            skillCreationCommand,
            slideCreationCommand,
            researchCreationCommand,
            scrapeCreationCommand,
            parseCreationCommand,
            adCreationCommand,
            loopCommand,
            connectors: runConnectorPayload,
          },
        ]);
        return;
      }

      const execution = await executeThreadRun(executionTaskText, executionAttachmentEntries, {
        turnId: participantNeutralTurnId || undefined,
        quotedSelection,
        backlogCommand,
        resourceCreationCommand,
        agentCreationCommand,
        skillCreationCommand,
        slideCreationCommand,
        researchCreationCommand,
        scrapeCreationCommand,
        parseCreationCommand,
        adCreationCommand,
        loopCommand,
        connectorsOverride: runConnectorPayload,
        extraResolvedAttachments: previewImageRunAttachments,
        displayPromptOverride: executionTaskText === taskText ? undefined : taskText,
      });
      ensuredThreadId = execution.threadId;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      if (consumeIntentionalStopAbort(normalizedError, ensuredThreadId ?? currentThreadId ?? null)) {
        return;
      }
      setInlineError(normalizedError.message);
      try {
        onRunError?.(normalizedError, ensuredThreadId ?? currentThreadId ?? undefined);
      } catch (callbackError) {
        reportRunnerLifecycleCallbackError("onRunError", callbackError);
      }
    } finally {
      setIsPreparingRun(false);
    }
  }

  useEffect(() => {
    if (composerSubmitRequest === null || composerSubmitRequest === undefined) {
      return;
    }
    if (handledComposerSubmitRequestTokenRef.current === composerSubmitRequest) {
      return;
    }
    handledComposerSubmitRequestTokenRef.current = composerSubmitRequest;
    void runTask();
  }, [composerSubmitRequest]);

  useRunnerQueuedExecution({
    currentThreadId,
    execute: async (nextQueuedMessage) => {
      await executeThreadRun(
        nextQueuedMessage.prompt,
        nextQueuedMessage.attachments,
        {
          turnId: nextQueuedMessage.turnId,
          quotedSelection: nextQueuedMessage.quotedSelection,
          backlogCommand: nextQueuedMessage.backlogCommand,
          resourceCreationCommand: nextQueuedMessage.resourceCreationCommand,
          agentCreationCommand: nextQueuedMessage.agentCreationCommand,
          skillCreationCommand: nextQueuedMessage.skillCreationCommand,
          slideCreationCommand: nextQueuedMessage.slideCreationCommand,
          researchCreationCommand: nextQueuedMessage.researchCreationCommand,
          scrapeCreationCommand: nextQueuedMessage.scrapeCreationCommand,
          parseCreationCommand: nextQueuedMessage.parseCreationCommand,
          adCreationCommand: nextQueuedMessage.adCreationCommand,
          loopCommand: nextQueuedMessage.loopCommand,
          extraResolvedAttachments:
            nextQueuedMessage.extraResolvedAttachments,
          displayPromptOverride: nextQueuedMessage.displayPrompt,
          reasoningEffortOverride: nextQueuedMessage.reasoningEffort,
          connectorsOverride: nextQueuedMessage.connectors,
        },
      );
    },
    hasActiveRun: hasRoutableActiveRun,
    isDrainingRef: isDrainingQueuedRunsRef,
    isPreparingRun,
    messages: pendingQueuedMessages,
    onError: (error, queuedThreadId) => {
      setInlineError(error.message);
      try {
        onRunError?.(error, queuedThreadId || undefined);
      } catch (callbackError) {
        reportRunnerLifecycleCallbackError("onRunError", callbackError);
      }
    },
    setIsPreparingRun,
    setMessages: setPendingQueuedMessages,
    wasIntentionalStop: consumeIntentionalStopAbort,
  });

  function applyComposerInputValue(nextValue: string, selectionStart: number) {
    setInputSelectionStart(selectionStart);
    setSlashPopupView("commands");
    setActiveSlashPopupIndex(0);
    setDismissedConnectorMentionKey("");
    if (tryAutoStageInput(nextValue, {
      agentCreation: enableAgentCreationCommand,
      batchCreation: Boolean(onBatchJobCreate),
      backlogMissionControl: enableBacklogMissionControlCommand,
      backlogSubtask: enableBacklogSubtaskCommand,
      resourceCreation: enableResourceCreationCommand,
      skillCreation: enableSkillCreationCommand,
    })) {
      return;
    }
    setInput(nextValue);

    if (isListening) {
      resetSpeechDraft(nextValue);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextValue = event.target.value;
    applyComposerInputValue(nextValue, event.target.selectionStart ?? nextValue.length);
  }

  function handleInputPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const clipboardText = event.clipboardData.getData("text/plain") || event.clipboardData.getData("text");
    if (!clipboardText || !/[\r\n]$/.test(clipboardText)) {
      return;
    }

    const normalizedClipboardText = clipboardText.replace(/[\r\n]+$/g, "");
    if (normalizedClipboardText === clipboardText) {
      return;
    }

    event.preventDefault();

    const textarea = event.currentTarget;
    const currentValue = textarea.value;
    const selectionStart = textarea.selectionStart ?? currentValue.length;
    const selectionEnd = textarea.selectionEnd ?? selectionStart;
    const nextValue = currentValue.slice(0, selectionStart) + normalizedClipboardText + currentValue.slice(selectionEnd);
    const nextSelectionStart = selectionStart + normalizedClipboardText.length;

    applyComposerInputValue(nextValue, nextSelectionStart);

    window.requestAnimationFrame(() => {
      const activeTextarea = textareaRef.current;
      if (!activeTextarea) {
        return;
      }
      activeTextarea.focus();
      activeTextarea.setSelectionRange(nextSelectionStart, nextSelectionStart);
    });
  }

  function handleInputSelectionChange(event: SyntheticEvent<HTMLTextAreaElement>) {
    const target = event.currentTarget;
    setInputSelectionStart(target.selectionStart ?? target.value.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (showSlashCommandPopup && slashPopupItemCount > 0) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        setActiveSlashPopupIndex((currentIndex) => (
          (currentIndex + direction + slashPopupItemCount) % slashPopupItemCount
        ));
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        handleSlashPopupItemSelect(activeSlashPopupIndex);
        return;
      }
    }
    if (
      showConnectorMentionPopup
      && connectorMentionInputState
      && filteredConnectorOptions.length > 0
    ) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        setActiveConnectorOptionIndex((current) => {
          const optionCount = filteredConnectorOptions.length;
          return (current + direction + optionCount) % optionCount;
        });
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        const selectedOption =
          filteredConnectorOptions[
            Math.min(
              activeConnectorOptionIndex,
              filteredConnectorOptions.length - 1,
            )
          ];
        if (selectedOption) {
          void selectComposerConnector(
            selectedOption,
            connectorMentionInputState,
          );
        }
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setDismissedConnectorMentionKey(connectorMentionKey);
        return;
      }
    }
    if (
      event.key === "Backspace"
      && input.length === 0
      && selectedConnectorIds.length > 0
    ) {
      event.preventDefault();
      removeSelectedConnector(
        selectedConnectorIds[selectedConnectorIds.length - 1],
      );
      return;
    }
    if (
      event.key === "Backspace"
      && input.length === 0
      && dismissActiveStagedCommand()
    ) {
      event.preventDefault();
      return;
    }
    if (event.key !== "Enter") {
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      if (canRun) {
        void runTask();
      }
      return;
    }
    if (event.shiftKey) {
      return;
    }
    if (!input.includes("\n")) {
      event.preventDefault();
      if (canRun) {
        void runTask();
      }
    }
  }

  function getTurnDurationSeconds(turn: RunnerTurn): number {
    return getRunnerTurnDurationSeconds(turn, nowMs);
  }

  function getTurnTimelineState(turn: RunnerTurn): RunnerTurnTimelineState {
    return buildRunnerTurnTimelineState({
      turn,
      turns,
      deepResearchSessions,
      activeDeepResearchThreadSession,
    });
  }

  const originalThreadActionLogIndex = useMemo(
    () => buildRunnerOriginalActionLogIndex(turns),
    [turns],
  );

  async function handlePermissionDecision(log: RunnerLog, decision: "allow" | "deny") {
    const outcome = await submitRunnerPermissionDecision({
      apiKey,
      backendUrl: normalizedBackendUrl,
      decision,
      log,
      requestHeaders,
      threadId: currentThreadId,
    });
    if (outcome.notice) setInlineError(outcome.notice);
    setTurns((previousTurns) => applyRunnerPermissionDecision(previousTurns, outcome));
    try {
      onThreadStatusChange?.(currentThreadId || "", outcome.nextTurnStatus);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onThreadStatusChange", error);
    }
  }

  const timelineRenderContext: RunnerTimelineRenderContext = {
    activeTaskPreviewId,
    agents,
    availableEnvironments,
    availableProjects,
    backendUrl: normalizedBackendUrl,
    deepResearchSessions,
    displayedAgentLabel,
    displayedEnvironmentLabel,
    environmentId:
      scopedActiveThreadEnvironmentId
      || selectedEnvironment?.id
      || environmentId
      || null,
    environmentName:
      scopedActiveThreadEnvironmentName
      || selectedEnvironment?.name
      || displayedEnvironmentLabel
      || "Environment",
    isBrowserDetailOpen: (turnId, groupId) =>
      selectedComputerUseDetail?.turnId === turnId
      && selectedComputerUseDetail?.kind === "browser"
      && selectedComputerUseDetail?.groupId === groupId,
    isComputerUseDetailOpen: (turnId, groupId) =>
      selectedComputerUseDetail?.turnId === turnId
      && selectedComputerUseDetail?.groupId === groupId,
    isDeepResearchDetailOpen: (turnId) =>
      selectedDeepResearchDetail?.turnId === turnId,
    isSubagentDetailOpen: (turnId, invocationId) =>
      selectedSubagentDetail?.turnId === turnId
      && selectedSubagentDetail?.invocationId === invocationId,
    onAgentTurnClick,
    onOpenBrowserDetails: openBrowserDetailDrawer,
    onOpenComputerUseDetails: openComputerUseDetailDrawer,
    onOpenDeepResearchDetails: openDeepResearchDetailDrawer,
    onOpenEnvironmentDesktop: (nextEnvironmentId, nextEnvironmentName) => {
      void openEnvironmentDesktopWindow(
        nextEnvironmentId,
        nextEnvironmentName,
      );
    },
    onOpenSubagentDetails: openSubagentDetailDrawer,
    onOpenTaskList,
    onPermissionDecision: handlePermissionDecision,
    onPreviewDocument: (attachment) => {
      toggleDocumentAttachmentPreview(attachment);
    },
    onResourcePreviewClick,
    onTaskPreviewClick,
    onWorkspacePathClick: (turn, path) => {
      handleSummaryWorkspacePathClick(turn, path, "working_log");
    },
    requestHeaders: buildRunnerHeaders(requestHeaders, apiKey.trim()),
  };

  function renderNestedTimelineItems(
    turn: RunnerTurn,
    items: RunnerTimelineItem[],
    options?: { renderBrowserSkillAsGeneric?: boolean },
  ) {
    return renderRunnerNestedTimelineItems({
      context: timelineRenderContext,
      items,
      options,
      turn,
    });
  }

  function renderCanonicalThreadAction(action: RunnerThreadAction) {
    return renderRunnerCanonicalThreadAction({
      action,
      context: timelineRenderContext,
      getTurnTimelineState,
      originalLogIndex: originalThreadActionLogIndex,
    });
  }

  function renderTimelineItem(turn: RunnerTurn, item: RunnerTimelineItem, index: number, options?: { renderComputerUseMcpAsGeneric?: boolean; renderBrowserSkillAsGeneric?: boolean }) {
    return renderRunnerTimelineItem({
      context: timelineRenderContext,
      index,
      item,
      options,
      turn,
    });
  }

  function renderSkillIcon(skill: RunnerChatSkill, className: string) {
    if (skill.isCustom) {
      const CustomSkillIcon = customSkillIconComponent(skill.icon);
      return <CustomSkillIcon className={className} strokeWidth={1.75} />;
    }
    if (skill.id === "image_generation") return <LucideImages className={className} strokeWidth={1.75} />;
    if (skill.id === "video_generation") return <LucideVideo className={className} strokeWidth={1.75} />;
    if (skill.id === "web_search") return <LucideGlobe className={className} strokeWidth={1.75} />;
    if (skill.id === "deep_research" || skill.id === "research") return <LucideTelescope className={className} strokeWidth={1.75} />;
    if (skill.id === "browser") return <LucideMonitor className={className} strokeWidth={1.75} />;
    if (skill.id === "pdf") return <LucideFileText className={className} strokeWidth={1.75} />;
    if (skill.id === "frontend_design") return <LucidePalette className={className} strokeWidth={1.75} />;
    if (skill.id === "pptx") return <LucideLayers className={className} strokeWidth={1.75} />;
    if (skill.id === "memory") return <LucideBrain className={className} strokeWidth={1.75} />;
    if (skill.id === "task_management") return <LucideListTodo className={className} strokeWidth={1.75} />;
    if (skill.id === "email") return <LucideMail className={className} strokeWidth={1.75} />;
    if (skill.id === "computer_agents") {
      return <img src={RUNNER_TRANSPARENT_LOGO_URL} alt="" aria-hidden="true" draggable={false} className={className} style={{ objectFit: "contain" }} />;
    }
    return <LucideLayers className={className} strokeWidth={1.75} />;
  }

  const effectiveStatus = isPreparingRun ? "running" : status;
  const statusToneValue = statusTone(effectiveStatus);
  const availableAgentPhotoEntries = useMemo(
    () =>
      agents
        .map((agent) => ({
          label: String(agent?.name || "").trim(),
          photoUrl: getRunnerAgentOptionPhotoUrl(agent),
        }))
        .filter((entry) => entry.label),
    [agents]
  );
  const selectedAgentPhotoUrl = getRunnerAgentOptionPhotoUrl(selectedAgent);
  const resolveTurnAgentPhotoUrl = useCallback((agentLabel: string | null | undefined) => {
    const normalizedLabel = String(agentLabel || "").trim().toLowerCase();
    if (!normalizedLabel) {
      return "";
    }
    const missionControlAgentLabel = getRunnerMissionControlAgentName(threadMissionControlPreview).toLowerCase();
    const missionControlAgentPhotoUrl = getRunnerMissionControlAgentPhotoUrl(threadMissionControlPreview);
    if (normalizedLabel === missionControlAgentLabel && missionControlAgentPhotoUrl) {
      return missionControlAgentPhotoUrl;
    }
    const exactMatch = availableAgentPhotoEntries.find((entry) => entry.label.trim().toLowerCase() === normalizedLabel);
    if (exactMatch?.photoUrl) {
      return exactMatch.photoUrl;
    }
    return String(displayedAgentLabel || "").trim().toLowerCase() === normalizedLabel
      ? selectedAgentPhotoUrl
      : "";
  }, [availableAgentPhotoEntries, displayedAgentLabel, selectedAgentPhotoUrl, threadMissionControlPreview]);
  const handleTurnAgentClick = useCallback((turn: RunnerTurn, turnAgentLabel: string) => {
    if (typeof onAgentTurnClick !== "function") {
      return;
    }
    const normalizedAgentName = String(turnAgentLabel || turn.agentName || "").trim();
    const normalizedSelectedAgentId = String(selectedAgent?.id || effectiveAgentId || agentId || "").trim();
    const normalizedSelectedAgentName = String(selectedAgent?.name || "").trim().toLowerCase();
    const resolvedAgentId =
      normalizedAgentName
      && normalizedSelectedAgentId
      && normalizedSelectedAgentName
      && normalizedAgentName.toLowerCase() === normalizedSelectedAgentName
        ? normalizedSelectedAgentId
        : "";
    onAgentTurnClick({
      turnId: turn.id,
      agentId: resolvedAgentId || undefined,
      agentName: normalizedAgentName || undefined,
    });
  }, [agentId, effectiveAgentId, onAgentTurnClick, selectedAgent]);
  const handleSummaryWorkspacePathClick = useCallback((turn: RunnerTurn, path: string, sourceType: RunnerQuotedSelectionSource) => {
    const normalizedPath = String(path || "").trim();
    if (!normalizedPath) {
      return;
    }

    if (sourceType !== "deep_research_report" && summaryPreviewEnvironmentId) {
      const previewAttachment: RunnerTurnAttachment = {
        ...buildRunnerPreviewAttachmentFromPath(normalizedPath, {
          backendUrl: normalizedBackendUrl,
          environmentId: summaryPreviewEnvironmentId,
          idPrefix: "summary-preview",
        }),
        workspacePath: normalizedPath,
      };
      if (isAttachmentDocumentPreviewable(previewAttachment)) {
        toggleDocumentAttachmentPreview(previewAttachment);
        return;
      }
    }

    if (typeof onSummaryWorkspacePathClick !== "function") {
      return;
    }

    onSummaryWorkspacePathClick({
      path: normalizedPath,
      turnId: turn.id,
      threadId: threadId || null,
      environmentId: summaryPreviewEnvironmentId,
      agentName: turn.agentName || null,
      sourceType,
    });
  }, [normalizedBackendUrl, onSummaryWorkspacePathClick, summaryPreviewEnvironmentId, threadId]);
  const threadHistoryItems = useMemo(
    () =>
      buildRunnerThreadHistoryItems({
        displayedAgentLabel,
        missionControlPreview: threadMissionControlPreview,
        taskPreview: threadTaskPreview,
        turns,
      }),
    [displayedAgentLabel, threadMissionControlPreview, threadTaskPreview, turns],
  );
  const {
    activeItemId: activeThreadHistoryItemId,
    activeItemIndex: activeThreadHistoryIndex,
    areControlsVisible: areThreadHistoryControlsVisible,
    hoveredItemId: hoveredThreadHistoryItemId,
    navigate: navigateThreadHistory,
    nextItem: nextThreadHistoryItem,
    previousItem: previousThreadHistoryItem,
    scrollItemIntoView: scrollThreadHistoryItemIntoView,
    setAnchorElement: setThreadHistoryAnchorElement,
    setHoveredItemId: setHoveredThreadHistoryItemId,
    setRailHovered: setIsThreadHistoryRailHovered,
    shouldDisplay: shouldDisplayThreadHistoryRail,
  } = useRunnerThreadHistoryRail({
    contentWidthRef,
    expandedTurns,
    executionLogs: logs,
    items: threadHistoryItems,
    logsRef,
    previewedDocumentAttachment,
    surfaceEnabled: !shouldUseCanonicalThreadSurface,
    turns,
  });

  const selectedDeepResearchDetailPresentation = useMemo<RunnerSelectedDeepResearchDetailPresentation | null>(() => {
    if (!selectedDeepResearchDetail) {
      return null;
    }

    const selectedTurn = turns.find((turn) => turn.id === selectedDeepResearchDetail.turnId);
    if (!selectedTurn) {
      return null;
    }

    const timelineState = getTurnTimelineState(selectedTurn);
    const deepResearchGroup = timelineState.displayedTimelineItems.find(
      (item): item is Extract<RunnerTimelineItem, { kind: "deep_research_group" }> => item.kind === "deep_research_group"
    );
    const resolvedLogs = deepResearchGroup?.logs || selectedTurn.logs.filter((log) => log.eventType === "deep_research");
    const resolvedRunningCommandLog = deepResearchGroup?.runningCommandLog || selectedTurn.logs.find((log) => isDeepResearchTimelineCommand(log));
    const session = resolveDeepResearchSessionForGroup({
      logs: resolvedLogs,
      runningCommandLog: resolvedRunningCommandLog,
      turn: selectedTurn,
      sessions: deepResearchSessions,
    });
    if (!deepResearchGroup && resolvedLogs.length === 0 && !resolvedRunningCommandLog && !session) {
      return null;
    }
    const firstLog = resolvedLogs[0] || resolvedRunningCommandLog;
    return {
      turn: selectedTurn,
      logs: resolvedLogs,
      runningCommandLog: resolvedRunningCommandLog,
      session,
      timeLabel: firstLog ? toDurationLabel(firstLog, selectedTurn.startedAtMs) : undefined,
      fallbackTopic: extractDeepResearchTopicFromGroup(resolvedLogs, resolvedRunningCommandLog) || selectedTurn.prompt || null,
    };
  }, [deepResearchSessions, selectedDeepResearchDetail, turns]);
  const lastSelectedDeepResearchDetailPresentationRef = useRef<RunnerSelectedDeepResearchDetailPresentation | null>(null);
  useEffect(() => {
    if (selectedDeepResearchDetailPresentation) {
      lastSelectedDeepResearchDetailPresentationRef.current = selectedDeepResearchDetailPresentation;
    } else if (!selectedDeepResearchDetail) {
      lastSelectedDeepResearchDetailPresentationRef.current = null;
    }
  }, [selectedDeepResearchDetail, selectedDeepResearchDetailPresentation]);
  const effectiveSelectedDeepResearchDetailPresentation =
    selectedDeepResearchDetailPresentation
      || (selectedDeepResearchDetail ? lastSelectedDeepResearchDetailPresentationRef.current : null);

  const selectedComputerUseDetailPresentation = useMemo(() => {
    if (!selectedComputerUseDetail) {
      return null;
    }

    const selectedTurn = turns.find((turn) => turn.id === selectedComputerUseDetail.turnId);
    if (!selectedTurn) {
      return null;
    }

    const timelineState = getTurnTimelineState(selectedTurn);
    const selectedDetailKind = selectedComputerUseDetail.kind || "computer_use";
    if (selectedDetailKind === "browser") {
      const browserGroup = timelineState.displayedTimelineItems.find(
        (item): item is Extract<RunnerTimelineItem, { kind: "browser_group" }> =>
          item.kind === "browser_group" && getBrowserTimelineGroupId(item.logs) === selectedComputerUseDetail.groupId
      );

      if (!browserGroup) {
        return null;
      }

      return {
        turn: selectedTurn,
        ...buildBrowserGroupPresentation(selectedTurn, browserGroup.logs, {
          displayedEnvironmentLabel,
        }),
      };
    }

    const computerUseGroup = timelineState.displayedTimelineItems.find(
      (item): item is Extract<RunnerTimelineItem, { kind: "computer_use_group" }> =>
        item.kind === "computer_use_group" && item.group.id === selectedComputerUseDetail.groupId
    );

    if (!computerUseGroup) {
      return null;
    }

    return {
      turn: selectedTurn,
      ...buildComputerUseGroupPresentation(selectedTurn, computerUseGroup.group, {
        displayedEnvironmentLabel,
      }),
    };
  }, [displayedEnvironmentLabel, selectedComputerUseDetail, turns]);

  const selectedSubagentDetailPresentation = useMemo(() => {
    if (!selectedSubagentDetail) {
      return null;
    }

    const selectedTurn = turns.find((turn) => turn.id === selectedSubagentDetail.turnId);
    if (!selectedTurn) {
      return null;
    }

    const displayedTimelineLogs = dedupeAdjacentRunnerLogs(
      selectedTurn.logs.filter((log) => shouldDisplayTimelineLog(log))
    );
    const subagentGroups = buildSubagentTimelineGroups(
      displayedTimelineLogs.length === 0 && isRunningTurnStatus(selectedTurn.status)
        ? [
            {
              time: "00:00",
              message: "Setting up workspace...",
              type: "info" as const,
              eventType: "setup" as const,
            },
          ]
        : displayedTimelineLogs
    );
    const selectedGroup = subagentGroups.get(selectedSubagentDetail.invocationId);

    if (!selectedGroup) {
      return null;
    }

    return {
      turn: selectedTurn,
      ...buildSubagentGroupPresentation(selectedTurn, selectedGroup, {
        displayedAgentLabel,
        displayedEnvironmentLabel,
      }),
    };
  }, [displayedAgentLabel, displayedEnvironmentLabel, selectedSubagentDetail, turns]);
  const orderedAgents = useMemo(() => orderOptionsWithPinnedTop(agents, initialAgentTopId), [agents, initialAgentTopId]);
  const availableAgentPopupModes = useMemo<RunnerAgentSelectorMode[]>(() => {
    const nextModes: RunnerAgentSelectorMode[] = [];
    for (const agent of orderedAgents) {
      const nextMode = getRunnerAgentSelectorMode(agent);
      if (!nextModes.includes(nextMode)) {
        nextModes.push(nextMode);
      }
    }
    return nextModes.length > 0 ? nextModes : ["agents"];
  }, [orderedAgents]);
  const filteredOrderedAgents = useMemo(
    () => orderedAgents.filter((agent) => getRunnerAgentSelectorMode(agent) === agentPopupMode),
    [agentPopupMode, orderedAgents]
  );
  const orderedEnvironments = useMemo(
    () => orderOptionsWithPinnedTop(availableEnvironments, initialEnvironmentTopId),
    [availableEnvironments, initialEnvironmentTopId]
  );
  const orderedProjects = useMemo(
    () => orderOptionsWithPinnedTop(availableProjects, selectedProjectId || null),
    [availableProjects, selectedProjectId]
  );
  const slashPopupItemCount = slashPopupView === "commands"
    ? RUNNER_SLASH_CORE_ACTION_COUNT + filteredSlashCommandItems.length
    : slashPopupView === "projects"
      ? orderedProjects.length
      : RUNNER_REASONING_EFFORT_OPTIONS.length;
  useEffect(() => {
    setActiveSlashPopupIndex(0);
  }, [slashCommandInputState?.query, slashPopupView]);
  useEffect(() => {
    setActiveSlashPopupIndex((currentIndex) => slashPopupItemCount > 0
      ? Math.min(currentIndex, slashPopupItemCount - 1)
      : 0);
  }, [slashPopupItemCount]);
  const activeWorkspaceEnvironmentId = effectiveEnvironmentId || selectedEnvironment?.id || environmentId || "";
  useEffect(() => {
    if (availableAgentPopupModes.includes(agentPopupMode)) {
      return;
    }
    if (activeInputPopup === "agent" || activeInputPopup === "agent-reasoning") {
      return;
    }
    const nextMode = getRunnerAgentSelectorMode(
      orderedAgents.find((agent) => agent.id === selectedAgentId) || orderedAgents[0] || null
    );
    const fallbackMode = (availableAgentPopupModes[0] || "agents") as RunnerAgentSelectorMode;
    const resolvedMode: RunnerAgentSelectorMode = availableAgentPopupModes.includes(nextMode)
      ? nextMode
      : fallbackMode;
    setAgentPopupMode(resolvedMode);
  }, [activeInputPopup, agentPopupMode, availableAgentPopupModes, orderedAgents, selectedAgentId]);
  const githubConnected = githubConfig?.connected ?? false;
  const notionConnected = notionConfig?.connected ?? false;
  const googleDriveConnected = googleDriveConfig?.connected ?? false;
  const oneDriveConnected = oneDriveConfig?.connected ?? false;
  const composerPlanDisplay = getRunnerComposerPlanDisplay(composerPlanTierId);
  const visibleComposerAttachments = attachments.filter(
    (attachment) => !attachment.hiddenFromTurnDisplay,
  );
  const ComposerPlanIcon = composerPlanDisplay.Icon;
  const composerOrganizationOptions = useMemo<RunnerChatOption[]>(() => {
    const seenOrganizationIds = new Set<string>();
    const normalizedOrganizations: RunnerChatOption[] = [];
    (Array.isArray(composerOrganizations) ? composerOrganizations : []).forEach((organization) => {
      const id = String(organization?.id || "").trim();
      const name = String(organization?.name || "").trim();
      if (!id || !name || seenOrganizationIds.has(id)) {
        return;
      }
      seenOrganizationIds.add(id);
      const description = typeof organization?.description === "string" ? organization.description.trim() : "";
      normalizedOrganizations.push({
        ...organization,
        id,
        name,
        ...(description ? { description } : {}),
      });
    });
    return normalizedOrganizations.length > 0
      ? normalizedOrganizations
      : [{ id: "__personal_workspace__", name: "Personal Workspace" }];
  }, [composerOrganizations]);
  const canChangeComposerOrganization =
    composerOrganizationOptions.length > 1 &&
    typeof onComposerOrganizationChange === "function";
  const githubContextLabel = githubConfig?.contextLabel || "Branch";
  const defaultGithubBranchFromContext = useMemo(() => {
    const selectedContext = githubContexts.find((context) => context.id === selectedGithubContextId);
    return String(selectedContext?.name || selectedGithubContextId || "").trim();
  }, [githubContexts, selectedGithubContextId]);
  const {
    branchesByRepoFullName: githubBranchesByRepoFullName,
    buildEffectiveRootItem: buildGithubEffectiveRootItem,
    ensureBranchesLoaded: ensureGithubBranchesLoaded,
    loadingRepoFullNames: githubBranchLoadingRepoFullNames,
    resolveSelectedBranch: getGithubSelectedBranchForRepo,
    setSelectedBranchByRepoFullName:
      setGithubSelectedBranchByRepoFullName,
  } = useRunnerGithubBranchSelection({
    accountId: fileBrowserAccountIdsBySource.github === "__default__" ? "" : fileBrowserAccountIdsBySource.github,
    defaultBranch: defaultGithubBranchFromContext,
    fetchBranches: githubConfig?.fetchBranches,
    onError: setGithubBrowserError,
  });
  const {
    attachIntegrationFiles,
    attachWorkspaceFiles,
    isAttaching: isFileBrowserAttaching,
    resetAttaching: resetFileBrowserAttaching,
  } = useRunnerFileBrowserAttachmentController({
    activeWorkspaceEnvironmentId,
    addAttachments,
    apiKey,
    attachmentCount: attachments.length,
    backendUrl: normalizedBackendUrl,
    beginAttachmentUpload,
    closeInputPopups: closeAllInputPopups,
    getGithubSelectedBranch: getGithubSelectedBranchForRepo,
    githubConfig,
    githubAccountId: fileBrowserAccountIdsBySource.github === "__default__" ? "" : fileBrowserAccountIdsBySource.github,
    githubItems,
    googleDriveConfig,
    googleDriveAccountId: fileBrowserAccountIdsBySource["google-drive"] === "__default__" ? "" : fileBrowserAccountIdsBySource["google-drive"],
    googleDriveItems,
    maxAttachments,
    oneDriveConfig,
    oneDriveAccountId: fileBrowserAccountIdsBySource["one-drive"] === "__default__" ? "" : fileBrowserAccountIdsBySource["one-drive"],
    oneDriveItems,
    onError: setInlineError,
    onWorkspaceError: setWorkspaceBrowserError,
    requestHeaders,
    resolveUploadEnvironmentId:
      resolveAttachmentUploadEnvironmentId,
    selectedGithubFileIds,
    selectedGoogleDriveFileIds,
    selectedOneDriveFileIds,
    selectedWorkspaceFileIds,
    setSelectedGithubFileIds,
    setSelectedGoogleDriveFileIds,
    setSelectedOneDriveFileIds,
    setSelectedWorkspaceFileIds,
    workspaceConfig,
    workspaceItems,
  });
  const {
    loadWorkspaceFolder,
    loadGoogleDriveFolder,
    loadOneDriveFolder,
    loadGithubFolder,
  } = useRunnerFileBrowserSourceLoaders({
    apiKey,
    backendUrl: normalizedBackendUrl,
    accountId: activeFileBrowserAccountId,
    currentFolderId: currentFileBrowserFolderId,
    currentSource: currentFileBrowserSource,
    fetchGithubItems: githubConfig?.fetchItems,
    fetchGoogleDriveItems: googleDriveConfig?.fetchItems,
    fetchNotionDatabases: notionConfig?.fetchDatabases,
    fetchOneDriveItems: oneDriveConfig?.fetchItems,
    githubConnected,
    googleDriveConnected,
    hasApiKey,
    mapGithubRootItem: buildGithubEffectiveRootItem,
    notionConnected,
    oneDriveConnected,
    open: showFileBrowserModal,
    requestHeaders,
    sourceState: fileBrowserSourceState,
    workspaceEnvironmentId: activeWorkspaceEnvironmentId,
  });

  async function handleWorkspaceFileRename(
    item: RunnerChatFileNode,
    nextName: string,
  ) {
    try {
      const result = await renameRunnerWorkspaceFile({
        apiKey,
        backendUrl: normalizedBackendUrl,
        environmentId: activeWorkspaceEnvironmentId,
        item,
        nextName,
        requestHeaders,
      });
      const targetPath = result.targetPath || result.sourcePath;
      if (targetPath !== result.sourcePath) {
        const remapPath = (path: string) => {
          if (!isRunnerWorkspacePathWithin(path, result.sourcePath)) return path;
          return `${targetPath}${path.slice(result.sourcePath.length)}`;
        };
        fileBrowserSourceState.workspace.setItems((current) =>
          current.map((entry) =>
            remapRunnerWorkspaceItemPath(
              entry,
              result.sourcePath,
              targetPath,
            ),
          ),
        );
        setSelectedWorkspaceFileIds((current) => current.map(remapPath));
        setExpandedFileBrowserFolderIds((current) => current.map(remapPath));
        setFileBrowserPreviewId((current) => current ? remapPath(current) : current);
        mapFileBrowserHistory((entry) => (
          entry.source === "workspace" && entry.folderId
            ? { ...entry, folderId: remapPath(entry.folderId) }
            : entry
        ));
      }
      setWorkspaceBrowserError(null);
      await loadWorkspaceFolder(result.parentId, { inline: true });
    } catch (error) {
      const normalizedError = error instanceof Error
        ? error
        : new Error(String(error));
      setWorkspaceBrowserError(normalizedError.message || "Failed to rename item.");
      throw normalizedError;
    }
  }

  async function handleWorkspaceFileDelete(item: RunnerChatFileNode) {
    try {
      const result = await deleteRunnerWorkspaceFile({
        apiKey,
        backendUrl: normalizedBackendUrl,
        environmentId: activeWorkspaceEnvironmentId,
        item,
        requestHeaders,
      });
      fileBrowserSourceState.workspace.setItems((current) =>
        current.filter((entry) =>
          !isRunnerWorkspacePathWithin(entry.path || entry.id, result.sourcePath),
        ),
      );
      setSelectedWorkspaceFileIds((current) => current.filter((itemId) =>
        !isRunnerWorkspacePathWithin(itemId, result.sourcePath),
      ));
      setExpandedFileBrowserFolderIds((current) => current.filter((folderId) =>
        !isRunnerWorkspacePathWithin(folderId, result.sourcePath),
      ));
      setFileBrowserPreviewId((current) => (
        current && isRunnerWorkspacePathWithin(current, result.sourcePath)
          ? null
          : current
      ));
      setWorkspaceBrowserError(null);
      await loadWorkspaceFolder(result.parentId, { inline: true });
    } catch (error) {
      const normalizedError = error instanceof Error
        ? error
        : new Error(String(error));
      setWorkspaceBrowserError(normalizedError.message || "Failed to delete item.");
      throw normalizedError;
    }
  }
  const workspaceRootLabel = workspaceConfig?.rootLabel || "Workspace";
  const googleDriveRootLabel = googleDriveConfig?.rootLabel || "My Drive";
  const oneDriveRootLabel = oneDriveConfig?.rootLabel || "OneDrive";
  const githubRootLabel = "Repositories";
  const notionRootLabel = "Notion";
  const googleDrivePath = childFolderPath(googleDriveItems, googleDriveRootLabel, googleDriveFolderId);
  const oneDrivePath = childFolderPath(oneDriveItems, oneDriveRootLabel, oneDriveFolderId);
  const visibleGoogleDriveItems = fileItemsForParent(googleDriveItems, googleDriveFolderId);
  const visibleOneDriveItems = fileItemsForParent(oneDriveItems, oneDriveFolderId);
  const fileBrowserRootLabel =
    currentFileBrowserSource === "google-drive"
      ? googleDriveRootLabel
      : currentFileBrowserSource === "github"
        ? githubRootLabel
      : currentFileBrowserSource === "notion"
        ? notionRootLabel
      : currentFileBrowserSource === "one-drive"
        ? oneDriveRootLabel
        : selectedEnvironment?.name
          ? `${selectedEnvironment.name} Computer`
          : workspaceRootLabel;
  const fileBrowserItems =
    currentFileBrowserSource === "google-drive"
      ? googleDriveItems
      : currentFileBrowserSource === "github"
        ? githubItems
      : currentFileBrowserSource === "notion"
        ? notionItems
      : currentFileBrowserSource === "one-drive"
        ? oneDriveItems
        : workspaceItems;
  const fileBrowserPath = childFolderPath(fileBrowserItems, fileBrowserRootLabel, currentFileBrowserFolderId);
  const visibleFileBrowserItems = fileItemsForParent(fileBrowserItems, currentFileBrowserFolderId);
  const normalizedWorkspaceFileSearchQuery = currentFileBrowserSource === "workspace"
    ? fileBrowserSearchQuery.trim().toLowerCase()
    : "";
  const filteredFileBrowserItems = normalizedWorkspaceFileSearchQuery
    ? workspaceItems.filter((item) =>
        !item.isFolder && item.name.toLowerCase().includes(normalizedWorkspaceFileSearchQuery)
      )
    : visibleFileBrowserItems;
  const selectedFileBrowserIds =
    currentFileBrowserSource === "google-drive"
      ? selectedGoogleDriveFileIds
      : currentFileBrowserSource === "github"
        ? selectedGithubFileIds
      : currentFileBrowserSource === "notion"
        ? (selectedNotionDatabaseId ? [selectedNotionDatabaseId] : [])
      : currentFileBrowserSource === "one-drive"
        ? selectedOneDriveFileIds
        : selectedWorkspaceFileIds;
  const selectedFileBrowserItems = fileBrowserItems.filter((item) => selectedFileBrowserIds.includes(item.id));
  const selectedFileBrowserLabel =
    currentFileBrowserSource === "notion" && selectedFileBrowserItems.length > 0
      ? selectedFileBrowserItems[0]?.id === "__entire_workspace__"
        ? "workspace"
        : `${selectedFileBrowserIds.length} ${selectedFileBrowserIds.length === 1 ? "database" : "databases"}`
      : currentFileBrowserSource === "github" && selectedFileBrowserItems.some((item) => item.isFolder)
      ? `${selectedFileBrowserIds.length} ${selectedFileBrowserIds.length === 1 ? "item" : "items"}`
      : `${selectedFileBrowserIds.length} ${selectedFileBrowserIds.length === 1 ? "file" : "files"}`;
  const previewFileBrowserItem = fileBrowserItems.find((item) => item.id === fileBrowserPreviewId) || null;
  const fileBrowserConnectorFetchFileContent =
    currentFileBrowserSource === "google-drive"
      ? googleDriveConfig?.fetchFileContent
      : currentFileBrowserSource === "one-drive"
        ? oneDriveConfig?.fetchFileContent
        : currentFileBrowserSource === "github"
          ? githubConfig?.fetchFileContent
          : undefined;
  const {
    content: fileBrowserPreviewContent,
    kind: fileBrowserPreviewKind,
    loading: isFileBrowserPreviewLoading,
  } = useRunnerFileBrowserPreview({
    apiKey,
    backendUrl: normalizedBackendUrl,
    accountId: activeFileBrowserAccountId,
    environmentId: activeWorkspaceEnvironmentId,
    fetchConnectorContent: fileBrowserConnectorFetchFileContent,
    item: previewFileBrowserItem,
    requestHeaders,
    source: currentFileBrowserSource,
  });
  const showGoogleDriveAuthScreen = currentFileBrowserSource === "google-drive" && !googleDriveConnected;
  const showGithubAuthScreen = currentFileBrowserSource === "github" && !githubConnected;
  const showNotionAuthScreen = currentFileBrowserSource === "notion" && !notionConnected;
  const showOneDriveAuthScreen = currentFileBrowserSource === "one-drive" && !oneDriveConnected;
  const showGoogleDrivePickerPrompt =
    currentFileBrowserSource === "google-drive" &&
    googleDriveConnected &&
    !isGoogleDriveBrowserLoading &&
    !googleDriveBrowserError &&
    filteredFileBrowserItems.length === 0 &&
    !fileBrowserSearchQuery.trim() &&
    fileBrowserPath.length <= 1 &&
    !!googleDriveConfig?.onManageAccess;
  const hasInputPopupOpen = activeInputPopup !== null;
  const showMainMenu = renderedMainPopup === "main";
  const hasPlusPopupOpen = isPlusPopupId(activeInputPopup) || renderedSidePopup !== null || renderedMainPopup === "main";
  const showContextPopup = renderedMainPopup === "context";
  const showSkillsPopup = renderedSidePopup === "skills";
  const showAgentReasoningPopup = renderedSidePopup === "agent-reasoning";
  const showAgentPopup = renderedMainPopup === "agent";
  const showEnvironmentPopup = renderedMainPopup === "environment";
  const showOrganizationPopup = renderedMainPopup === "organization";
  const showGithubPopup = renderedSidePopup === "github";
  const showNotionPopup = renderedSidePopup === "notion";
  const showGoogleDrivePopup = renderedSidePopup === "google-drive";
  const showOneDrivePopup = renderedSidePopup === "one-drive";
  const showSchedulePopup = renderedSidePopup === "schedule";
  const showAttachFilesPopup = renderedSidePopup === "attach-files";
  const hasPlusSidePopup =
    showSkillsPopup ||
    showGithubPopup ||
    showNotionPopup ||
    showGoogleDrivePopup ||
    showOneDrivePopup ||
    showSchedulePopup ||
    showAttachFilesPopup;
  const plusMainPopupStyle = useComposerAnchoredPopupStyle({
    open: showMainMenu,
    anchorRef: plusButtonRef,
    popupRef: plusMainPopupRef,
    placement: "above-start",
  });
  const plusSidePopupStyle = useComposerAnchoredPopupStyle({
    open: hasPlusSidePopup,
    anchorRef: plusMainPopupRef,
    popupRef: plusSidePopupRef,
    placement: "side-end",
  });
  const contextPopupStyle = useComposerAnchoredPopupStyle({
    open: showContextPopup,
    anchorRef: contextIndicatorButtonRef,
    verticalAnchorRef: plusButtonRef,
    popupRef: contextPopupRef,
    placement: "above-start",
    offsetX: -6,
  });
  const agentPopupStyle = useComposerAnchoredPopupStyle({
    open: showAgentPopup,
    anchorRef: agentSelectorButtonRef,
    popupRef: agentPopupRef,
    placement: "above-start",
  });
  const agentReasoningPopupStyle = useComposerAnchoredPopupStyle({
    open: showAgentReasoningPopup,
    anchorRef: agentPopupRef,
    popupRef: agentReasoningPopupRef,
    placement: "side-end",
  });
  const environmentPopupStyle = useComposerAnchoredPopupStyle({
    open: showEnvironmentPopup,
    anchorRef: environmentSelectorButtonRef,
    popupRef: environmentPopupRef,
    placement: "above-end",
  });
  const organizationPopupStyle = useComposerAnchoredPopupStyle({
    open: showOrganizationPopup,
    anchorRef: organizationSelectorButtonRef,
    popupRef: organizationPopupRef,
    placement: "above-end",
  });
  const hasPortalDocumentPreview = Boolean(documentPreviewPortalTarget);
  const isPreviewedDocumentImage = isRunnerImagePreviewAttachment(previewedDocumentAttachment);
  const shouldReserveDocumentPreviewWidth = Boolean(previewedDocumentAttachment && !hasPortalDocumentPreview);
  const previewedDocumentWorkspacePath = normalizeRunnerPreviewWorkspacePath(
    previewedDocumentAttachment?.workspacePath || previewedDocumentAttachment?.id || ""
  );
  const previewedDocumentOpenUrl = getDocumentPreviewOpenUrl(previewedDocumentAttachment);
  const documentPreviewHeaderTitleActions = previewedDocumentAttachment ? (
    <PlatformResourceActionsMenu
      open={documentPreviewActionMenuOpen}
      onOpenChange={setDocumentPreviewActionMenuOpen}
      resourceLabel="File"
      width={300}
      maxWidth="min(300px, calc(100vw - 16px))"
      popupClassName="tb-document-preview-resource-actions-menu"
    >
      <PlatformResourceActionsInformation
        resourceLabel="File"
        items={[
          {
            id: "name",
            label: "Name",
            value: previewedDocumentAttachment.displayName || previewedDocumentAttachment.filename,
            title: previewedDocumentAttachment.displayName || previewedDocumentAttachment.filename,
          },
          {
            id: "type",
            label: "Type",
            value: previewedDocumentAttachment.mimeType || "File",
          },
          previewedDocumentWorkspacePath
            ? {
                id: "path",
                label: "Path",
                value: `/workspace/${previewedDocumentWorkspacePath}`,
                title: `/workspace/${previewedDocumentWorkspacePath}`,
                monospace: true,
                copyValue: `/workspace/${previewedDocumentWorkspacePath}`,
                copyAriaLabel: "Copy file path",
              }
            : null,
        ].filter(Boolean) as Array<{
          id: string;
          label: string;
          value: string;
          title?: string;
          monospace?: boolean;
          copyValue?: string;
          copyAriaLabel?: string;
        }>}
      />
      <PlatformResourceActionsDivider />
      {previewedDocumentOpenUrl ? (
        <PlatformResourceActionMenuItem
          icon={<LucideExternalLink width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Open in new tab"
          onClick={() => {
            setDocumentPreviewActionMenuOpen(false);
            if (typeof window !== "undefined") {
              window.open(previewedDocumentOpenUrl, "_blank", "noopener,noreferrer");
            }
          }}
        />
      ) : null}
      <PlatformResourceActionMenuItem
        icon={<LucideCopy width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
        label="Copy filename"
        onClick={() => copyDocumentPreviewValue(previewedDocumentAttachment.filename)}
      />
      {previewedDocumentWorkspacePath ? (
        <PlatformResourceActionMenuItem
          icon={<LucideCopy width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Copy path"
          onClick={() => copyDocumentPreviewValue(`/workspace/${previewedDocumentWorkspacePath}`)}
        />
      ) : null}
    </PlatformResourceActionsMenu>
  ) : null;
  const documentPreviewHeaderActions = previewedDocumentAttachment ? (
    <>
      <button
        type="button"
        className="tb-attachment-preview-drawer-action tb-document-preview-maximize-button"
        onClick={toggleDocumentPreviewMaximized}
        aria-label={isDocumentPreviewMaximized ? "Exit full screen" : "Full screen"}
        aria-pressed={isDocumentPreviewMaximized}
        title={isDocumentPreviewMaximized ? "Exit full screen" : "Full screen"}
      >
        {isDocumentPreviewMaximized ? (
          <LucideMinimize2 className="tb-attachment-preview-drawer-action-icon" strokeWidth={1.9} />
        ) : (
          <LucideMaximize2 className="tb-attachment-preview-drawer-action-icon" strokeWidth={1.9} />
        )}
      </button>
    </>
  ) : null;
  const documentAttachmentPreviewDrawerContent = previewedDocumentAttachment ? (
    <RunnerDocumentPreviewDrawer
      attachment={previewedDocumentAttachment}
      backendUrl={normalizedBackendUrl}
      requestHeaders={requestHeaders}
      apiKey={apiKey.trim()}
      inline={hasPortalDocumentPreview}
      surface={hasPortalDocumentPreview}
      onClose={closeDocumentAttachmentPreview}
      onResizeStart={startDocumentPreviewResize}
      headerTitleActions={documentPreviewHeaderTitleActions}
      headerActionsAfterPreviewToggle={documentPreviewHeaderActions}
      showResizeHandle={!documentPreviewPortalTarget}
      enableImageWheelZoom
      enableImagePreviewTools
      imagePreviewReservedBottom={isPreviewedDocumentImage && isDocumentPreviewMaximized ? 132 : 0}
      imagePreviewFullscreen={isPreviewedDocumentImage && isDocumentPreviewMaximized}
      onImageSelectionChange={isPreviewedDocumentImage ? setPreviewImageSelectionState : undefined}
    />
  ) : null;
  const documentAttachmentPreviewDrawer =
    documentAttachmentPreviewDrawerContent && documentPreviewPortalTarget && typeof document !== "undefined"
      ? createPortal(documentAttachmentPreviewDrawerContent, documentPreviewPortalTarget)
      : documentPreviewPortalOnly
        ? null
        : documentAttachmentPreviewDrawerContent;
  const deepResearchDetailDrawerContent = effectiveSelectedDeepResearchDetailPresentation ? (
    <DeepResearchDetailDrawer
      log={effectiveSelectedDeepResearchDetailPresentation.runningCommandLog}
      logs={effectiveSelectedDeepResearchDetailPresentation.logs}
      runningCommandLog={effectiveSelectedDeepResearchDetailPresentation.runningCommandLog}
      session={effectiveSelectedDeepResearchDetailPresentation.session}
      fallbackTopic={effectiveSelectedDeepResearchDetailPresentation.fallbackTopic}
      onReportFileClick={(path) => handleSummaryWorkspacePathClick(
        effectiveSelectedDeepResearchDetailPresentation.turn,
        path,
        "deep_research_report"
      )}
      onClose={closeDeepResearchDetailDrawer}
    />
  ) : null;
  const deepResearchDetailDrawer =
    deepResearchDetailDrawerContent && subagentDetailPortalTarget && typeof document !== "undefined"
      ? createPortal(deepResearchDetailDrawerContent, subagentDetailPortalTarget)
      : deepResearchDetailDrawerContent;
  const computerUseDetailDrawerContent = selectedComputerUseDetailPresentation ? (
    <ComputerUseDetailDrawer
      title={selectedComputerUseDetailPresentation.title}
      variant={selectedComputerUseDetailPresentation.kind === "browser" ? "browser" : "computer-use"}
      environmentName={selectedComputerUseDetailPresentation.environmentName}
      workLabel={selectedComputerUseDetailPresentation.workLabel}
      timeLabel={selectedComputerUseDetailPresentation.timeLabel}
      running={selectedComputerUseDetailPresentation.running}
      onClose={closeComputerUseDetailDrawer}
    >
      {renderNestedTimelineItems(
        selectedComputerUseDetailPresentation.turn,
        selectedComputerUseDetailPresentation.nestedItems,
        { renderBrowserSkillAsGeneric: selectedComputerUseDetailPresentation.kind === "browser" }
      )}
    </ComputerUseDetailDrawer>
  ) : null;
  const computerUseDetailDrawer =
    computerUseDetailDrawerContent && subagentDetailPortalTarget && typeof document !== "undefined"
      ? createPortal(computerUseDetailDrawerContent, subagentDetailPortalTarget)
      : computerUseDetailDrawerContent;
  const subagentDetailDrawerContent = selectedSubagentDetailPresentation ? (
    <SubagentDetailDrawer
      title={selectedSubagentDetailPresentation.title}
      prompt={selectedSubagentDetailPresentation.prompt}
      environmentName={selectedSubagentDetailPresentation.environmentName}
      workLabel={selectedSubagentDetailPresentation.workLabel}
      timeLabel={selectedSubagentDetailPresentation.timeLabel}
      running={selectedSubagentDetailPresentation.running}
      responseMessage={selectedSubagentDetailPresentation.responseMessage}
      responseFailed={selectedSubagentDetailPresentation.responseFailed}
      onClose={closeSubagentDetailDrawer}
    >
      {renderNestedTimelineItems(selectedSubagentDetailPresentation.turn, selectedSubagentDetailPresentation.nestedItems)}
    </SubagentDetailDrawer>
  ) : null;
  const subagentDetailDrawer =
    subagentDetailDrawerContent && subagentDetailPortalTarget && typeof document !== "undefined"
      ? createPortal(subagentDetailDrawerContent, subagentDetailPortalTarget)
      : subagentDetailDrawerContent;
  const isClosingPopupStackTogether =
    sidePopupPhase === "exit" &&
    mainPopupPhase === "exit" &&
    renderedMainPopup === "main" &&
    renderedSidePopup !== null;
  const mainPopupAnimation: PlatformPopupAnimation | false = mainPopupPhase === "enter"
    ? "up-in"
    : mainPopupPhase === "exit"
      ? "up-out"
      : false;
  const sidePopupAnimation: PlatformPopupAnimation | false = sidePopupPhase === "enter"
    ? "left-in"
    : sidePopupPhase === "exit"
      ? isClosingPopupStackTogether || sidePopupExitDirection === "down"
        ? "up-out"
        : "left-out"
      : false;
	  const speechToTextTitle = !hasApiKey
	    ? "Enter an API key to enable speech-to-text"
	    : supportsSpeechToText
	      ? isListening
	        ? "Stop speech to text"
	        : "Start speech to text"
	      : "Speech-to-text is not supported in this browser";
  const contextIndicatorControl = (
    <RunnerThreadContextControl
      actionAvailability={threadContextAvailableActions}
      actionLoading={threadContextActionLoading}
      animation={mainPopupAnimation}
      buttonRef={contextIndicatorButtonRef}
      context={threadContext}
      currentThreadId={currentThreadId}
      details={threadContextDetails}
      detailsError={threadContextDetailsError}
      detailsLoading={isThreadContextDetailsLoading}
      hasApiKey={hasApiKey}
      hasAssistantAnswer={turns.some((turn) =>
        turn.logs.some(
          (log) =>
            log.eventType === "agent_message"
            || log.eventType === "llm_response",
        ),
      )}
      hasMessages={currentThreadHasMessages}
      indicatorLoading={isThreadContextLoading}
      onAction={(action) => void handleContextPopupActionClick(action)}
      onIndicatorClick={handleContextIndicatorClick}
      onRefresh={() => void refreshThreadContextDetails()}
      open={showContextPopup}
      popupRef={contextPopupRef}
      popupStyle={contextPopupStyle}
    />
  );
  useEffect(() => {
    if (selectedSubagentDetail && !selectedSubagentDetailPresentation) {
      setSelectedSubagentDetail(null);
    }
  }, [selectedSubagentDetail, selectedSubagentDetailPresentation]);

  useEffect(() => {
    if (selectedComputerUseDetail && !selectedComputerUseDetailPresentation) {
      setSelectedComputerUseDetail(null);
    }
  }, [selectedComputerUseDetail, selectedComputerUseDetailPresentation]);

  useEffect(() => {
    setSelectedSubagentDetail(null);
    setSelectedDeepResearchDetail(null);
    setSelectedComputerUseDetail(null);
  }, [localThreadId]);

  useEffect(() => {
    if (disableSubagentDetailDrawer && selectedSubagentDetail) {
      setSelectedSubagentDetail(null);
    }
    if (disableSubagentDetailDrawer && selectedDeepResearchDetail) {
      setSelectedDeepResearchDetail(null);
    }
    if (disableSubagentDetailDrawer && selectedComputerUseDetail) {
      setSelectedComputerUseDetail(null);
    }
  }, [disableSubagentDetailDrawer, selectedComputerUseDetail, selectedDeepResearchDetail, selectedSubagentDetail]);

  useEffect(() => {
    onSubagentDetailOpenChange?.(Boolean(selectedSubagentDetailPresentation || selectedComputerUseDetailPresentation));
  }, [onSubagentDetailOpenChange, selectedComputerUseDetailPresentation, selectedSubagentDetailPresentation]);

  useEffect(() => {
    return () => {
      onSubagentDetailOpenChange?.(false);
    };
  }, [onSubagentDetailOpenChange]);

  useEffect(() => {
    onDeepResearchDetailOpenChange?.(Boolean(effectiveSelectedDeepResearchDetailPresentation));
  }, [effectiveSelectedDeepResearchDetailPresentation, onDeepResearchDetailOpenChange]);

  useEffect(() => {
    if (shouldUseCanonicalThreadSurface) return undefined;
    onExecutionWorkbenchAvailabilityChange?.(executionWorkbenchAvailable);
    return () => onExecutionWorkbenchAvailabilityChange?.(false);
  }, [
    canonicalThreadId,
    executionWorkbenchAvailable,
    onExecutionWorkbenchAvailabilityChange,
    shouldUseCanonicalThreadSurface,
  ]);

  useEffect(() => {
    return () => {
      onDeepResearchDetailOpenChange?.(false);
    };
  }, [onDeepResearchDetailOpenChange]);

  useEffect(() => {
    if (!hasInputPopupOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (popupAreaRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest(".tb-composer-popup-portal-root")) return;
      closeAllInputPopups("outside");
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [hasInputPopupOpen]);

  useEffect(() => {
    if (!useComputerAgentsMode || disabled || isPreparingRun || showFileBrowserModal) return;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if ((!event.metaKey && !event.ctrlKey) || event.altKey || event.shiftKey || event.repeat) {
        return;
      }
      const shortcutKey = event.key.toLowerCase();
      if (shortcutKey === ATTACH_FILES_SHORTCUT_KEY) {
        event.preventDefault();
        if (showSlashCommandPopup) {
          handleSlashAttachWorkspaceFilesClick();
        } else {
          openFileBrowserModal("workspace");
        }
        return;
      }
      if (shortcutKey === SCHEDULE_SHORTCUT_KEY) {
        event.preventDefault();
        setActiveInputPopup("schedule");
        return;
      }
      if (shortcutKey === PROMPTS_SHORTCUT_KEY && onOpenPromptSearch) {
        event.preventDefault();
        handlePromptsMenuClick();
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    disabled,
    isPreparingRun,
    onOpenPromptSearch,
    showFileBrowserModal,
    showSlashCommandPopup,
    useComputerAgentsMode,
  ]);

  const hasCustomEmptyState =
    !isPreparingRun &&
    turns.length === 0 &&
    emptyState !== undefined &&
    emptyState !== null;
  const shouldRenderInlineComposerWithEmptyState =
    hasCustomEmptyState && emptyStateAfterComposer !== undefined && emptyStateAfterComposer !== null;
  const documentPreviewWidthStyleValue = previewedDocumentAttachment
    ? shouldReserveDocumentPreviewWidth && documentPreviewDrawerWidth !== null
      ? `${documentPreviewDrawerWidth}px`
      : shouldReserveDocumentPreviewWidth
        ? "var(--tb-document-preview-max-width)"
        : "0px"
    : "0px";
  const imagePreviewComposerWidthStyleValue =
    isPreviewedDocumentImage
      ? isDocumentPreviewMaximized
        ? "100vw"
        : shouldReserveDocumentPreviewWidth
          ? documentPreviewWidthStyleValue
          : "var(--tb-image-preview-side-width, var(--tb-document-preview-max-width))"
      : documentPreviewWidthStyleValue;
  const isThreadComposerSurface = composerSurfaceMode === "thread"
    || (composerSurfaceMode !== "home" && (Boolean(currentThreadId) || isPreparingRun));
  const normalizedControlledThreadId = String(threadId || "").trim();
  const hasPendingInitialExternalRun = Boolean(
    externalRunRequest
    && handledExternalRunRequestTokenRef.current !== externalRunRequest.token
    && String(externalRunRequest.threadId || "").trim() === normalizedControlledThreadId
    && String(externalRunRequest.prompt || "").trim(),
  );
  const isInitialThreadHydrationPending = Boolean(
    normalizedControlledThreadId
    && initialHydratedThreadId !== normalizedControlledThreadId
    && locallyOwnedExecutionThreadIdRef.current !== normalizedControlledThreadId
    && !hasPendingInitialExternalRun,
  );
  const initialSurfacePhase = useRunnerInitialSurfaceReadiness({
    blocked: Boolean(initialSurfaceLoading || isInitialThreadHydrationPending),
    rootRef,
  });
  const isInitialSurfaceLoading = initialSurfacePhase === "loading";

  return (
    <div
      ref={rootRef}
      className={`tb-runner-chat ${isPreparingRun ? "is-run-preparing" : ""} ${isThreadComposerSurface ? "is-thread-composer-surface" : "is-home-composer-surface"} ${isInitialSurfaceLoading ? "is-initial-surface-loading" : ""} ${initialSurfacePhase === "entering" ? "is-initial-surface-entering" : ""} ${shouldReserveDocumentPreviewWidth ? "tb-runner-chat-document-preview-open" : ""} ${isPreviewedDocumentImage ? "tb-runner-chat-image-preview-open" : ""} ${isPreviewedDocumentImage && hasPortalDocumentPreview ? "tb-runner-chat-image-preview-portal-open" : ""} ${isPreviewedDocumentImage && !hasPortalDocumentPreview ? "tb-runner-chat-image-preview-local-open" : ""} ${previewedDocumentAttachment && isDocumentPreviewMaximized ? "tb-runner-chat-document-preview-maximized" : ""} ${selectedSubagentDetailPresentation || selectedComputerUseDetailPresentation ? "tb-runner-chat-subagent-detail-open" : ""} ${effectiveSelectedDeepResearchDetailPresentation ? "tb-runner-chat-deep-research-detail-open" : ""} ${detachedExecutionWorkbenchOpen ? "tb-runner-chat-execution-workbench-open" : ""} ${className || ""}`.trim()}
      aria-busy={isInitialSurfaceLoading ? true : undefined}
      onDragEnterCapture={handleRootFileDragEnter}
      onDragOverCapture={handleRootFileDragOver}
      onDragLeaveCapture={handleRootFileDragLeave}
      onDropCapture={handleRootFileDrop}
      style={
        {
          "--tb-document-preview-width": documentPreviewWidthStyleValue,
          "--tb-image-preview-composer-width": imagePreviewComposerWidthStyleValue,
        } as CSSProperties
      }
    >
      {isInitialSurfaceLoading ? (
        <PlatformLoadingState
          className="tb-runner-chat__initial-loader"
          message="Loading thread..."
          centered
        />
      ) : null}
      <input ref={fileInputRef} type="file" multiple hidden onChange={handleAddFiles} />

      {isScreenFileDragActive ? (
        <div className="tb-screen-file-drop-overlay">
          <div className="tb-screen-file-drop-overlay-panel">
            <div className="tb-screen-file-drop-overlay-illustration" aria-hidden="true">
              <div className="tb-screen-file-drop-overlay-icon-card tb-screen-file-drop-overlay-icon-card-back">
                <LucideCode className="tb-screen-file-drop-overlay-icon" strokeWidth={1.75} />
              </div>
              <div className="tb-screen-file-drop-overlay-icon-card tb-screen-file-drop-overlay-icon-card-front">
                <IconImages className="tb-screen-file-drop-overlay-icon" />
              </div>
              <div className="tb-screen-file-drop-overlay-icon-card tb-screen-file-drop-overlay-icon-card-side">
                <IconFileText className="tb-screen-file-drop-overlay-icon" />
              </div>
            </div>
            <div className="tb-screen-file-drop-overlay-title">Add files</div>
            <div className="tb-screen-file-drop-overlay-copy">Drop files here to add them to the conversation</div>
          </div>
        </div>
      ) : null}

      {quotedSelectionPopup ? (
        <PlatformPopupSurface
          ref={quotedSelectionPopupRef}
          className="tb-selection-popup"
          style={{
            left: `${quotedSelectionPopup.x}px`,
            top: `${quotedSelectionPopup.y}px`,
          }}
        >
          <button
            type="button"
            className="tb-selection-popup-button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleAddQuotedSelectionToComposer}
          >
            <LucideTextQuote className="tb-selection-popup-icon" strokeWidth={1.7} />
            <span>Add to chat</span>
          </button>
        </PlatformPopupSurface>
      ) : null}

      <div className="workinglogsbox">
        <div
          className={`tb-log-scroll ${hasCustomEmptyState ? "is-custom-empty-state" : ""}`.trim()}
          ref={logsRef}
          onMouseUp={handleQuotedSelectionMouseUp}
        >
          <div
            ref={contentWidthRef}
            className={`tb-content-width ${hasCustomEmptyState ? "is-custom-empty-state" : ""}`.trim()}
          >
            {!shouldUseCanonicalThreadSurface && turns.length === 0
              ? hasCustomEmptyState
                ? emptyState
                : (isPreparingRun || hasRunningTurn || pendingQueuedMessages.length > 0 || isThreadHistoryLoading)
                  ? null
                  : <div className="runner-log-empty">No logs yet. Run a task to start streaming.</div>
              : null}
            {shouldUseCanonicalThreadSurface ? (
              <RunnerCanonicalThreadSurface
                availableConnectorOptions={availableConnectorOptions}
                taskList={threadTaskList}
                projection={canonicalThread.projection}
                connected={canonicalThread.connected}
                reconnecting={canonicalThread.reconnecting}
                loading={canonicalThread.loading}
                error={canonicalThread.error}
                hasContent={hasCanonicalSurfaceContent}
                fallbackRunAgentName={displayedAgentLabel}
                fallbackRunWorkspaceName={displayedWorkspaceLabel}
                runDetailStates={canonicalThread.runDetailStates}
                activityGroupActionStates={canonicalThread.activityGroupActionStates}
                renderAction={renderCanonicalThreadAction}
                onRefresh={canonicalThread.refresh}
                onLoadRunDetails={(run) => canonicalThread.loadRunDetails(run.id)}
                onLoadActivityGroupActions={canonicalThread.loadActivityGroupActions}
                onLoadEarlier={async () => {
                  const scrollElement = logsRef.current;
                  const previousScrollHeight = scrollElement?.scrollHeight || 0;
                  const previousScrollTop = scrollElement?.scrollTop || 0;
                  try {
                    const loaded = await canonicalThread.loadMore();
                    if (loaded && scrollElement && typeof window !== "undefined") {
                      window.requestAnimationFrame(() => {
                        const heightDelta = scrollElement.scrollHeight - previousScrollHeight;
                        scrollElement.scrollTop = Math.max(0, previousScrollTop + heightDelta);
                      });
                    }
                    return loaded;
                  } catch (error) {
                    const normalizedError = error instanceof Error ? error : new Error(String(error));
                    setInlineError(normalizedError.message || "Failed to load earlier thread activity.");
                    throw normalizedError;
                  }
                }}
                onControlRun={async (run, action) => {
                  try {
                    const command = await canonicalThread.controlRun(run.id, {
                      action,
                      idempotencyKey: ["runner-chat", run.id, action, Date.now()].join(":"),
                    });
                    if (command.effectApplied === false) {
                      setInlineError(command.limitation || "The control request was recorded and is waiting for the run coordinator.");
                    }
                  } catch (error) {
                    const normalizedError = error instanceof Error ? error : new Error(String(error));
                    setInlineError(normalizedError.message || `Failed to ${action} the run.`);
                  }
                }}
                onOpenChanges={onOpenChanges ? (run) => onOpenChanges(canonicalThreadId, run.id) : undefined}
                executionWorkbenchOpen={executionWorkbenchOpen}
                onExecutionWorkbenchOpenChange={onExecutionWorkbenchOpenChange}
                onPermissionDecision={(request, decision) => handlePermissionDecision(
                  adaptRunnerThreadPermissionRequestToRunnerLog(request),
                  decision,
                )}
              />
            ) : turns.map((turn, turnIndex) => {
              const isTurnRunning = isRunningTurnStatus(turn.status);
              const isTurnPermissionAsked = turn.status === "permission_asked";
              const isQueuedTurn = turn.status === "queued";
              const durableBatchQueueReceipt = getTurnBatchQueueReceipt(turn);
              const isLatestTurn = turnIndex === turns.length - 1;
              const { agentMessage, displayedTimelineItems: rawDisplayedTimelineItems } = getTurnTimelineState(turn);
              const hasRunSummary = Boolean(agentMessage?.message?.trim());
              const isTurnActivelyWorking = isTurnRunning && !hasRunSummary;
              const metronomeWorkflowPromptLog = getTurnMetronomeWorkflowPromptLog(turn);
              const shouldRenderMetronomeWorkflowPrompt = Boolean(metronomeWorkflowPromptLog);
              const normalizedPrompt = turn.prompt.trim();
              const emailPromptDisplay = getRunnerEmailPromptDisplay(turn.prompt, turn.messageMetadata);
              const emailDeliveryDisplay = agentMessage?.message && isLatestTurn
                ? getRunnerEmailDeliveryDisplay(turn.messageMetadata, agentMessage.message)
                : null;
              const displayedUserPrompt = emailPromptDisplay.content;
              const emailPromptLabel = emailPromptDisplay.isEmailPrompt ? (
                <div className="tb-user-turn-email-label">Email from {emailPromptDisplay.emailFrom}</div>
              ) : null;
              const customUserPromptContent = renderUserPromptContent?.({
                turnId: turn.id,
                turnIndex,
                isLatestTurn,
                prompt: turn.prompt,
                displayContent: displayedUserPrompt,
                isEmailPrompt: emailPromptDisplay.isEmailPrompt,
                emailFrom: emailPromptDisplay.emailFrom,
              });
              const hasCustomUserPromptContent = customUserPromptContent !== undefined;
              const defaultUserPromptContent = (
                <>
                  {emailPromptLabel}
                  <CollapsibleRunnerUserPrompt
                    content={displayedUserPrompt}
                    className="tb-message-markdown tb-message-markdown-user"
                  />
                </>
              );
              const baseUserPromptContent = hasCustomUserPromptContent
                ? customUserPromptContent
                : defaultUserPromptContent;
              const userPromptContent = (
                <RunnerUserMessageContent
                  metadata={legacyTurnMessageMetadataById.get(turn.id) || turn.messageMetadata}
                  availableConnectorOptions={availableConnectorOptions}
                >
                  {baseUserPromptContent}
                </RunnerUserMessageContent>
              );
              const isInternalRoutedResponseTurn = turn.messageMetadata?.source === "thread_v2_communicator";
              const isBtwTurn = !isInternalRoutedResponseTurn && (
                turn.presentation === "btw" || normalizedPrompt.toLowerCase().startsWith("/btw")
              );
              const isEditingTurn = editingTurnId === turn.id;
              const canEditTurn = isEditableUserTurn(turn);
              const taskPreviewForTurn =
                threadTaskPreview &&
                !isBtwTurn &&
                turn.presentation !== "context-action-notice" &&
                (turn.isInitialTurn || turnIndex === 0)
                  ? threadTaskPreview
                  : null;
              const missionControlPreviewForTurn =
                !taskPreviewForTurn &&
                threadMissionControlPreview &&
                !isBtwTurn &&
                turn.presentation !== "context-action-notice" &&
                (turn.isInitialTurn || turnIndex === 0)
                  ? threadMissionControlPreview
                  : null;
              const isMissionControlThreadTurn = Boolean(threadMissionControlPreview) && !isBtwTurn && turn.presentation !== "context-action-notice";
              const hasSpecialPromptPreview = Boolean(taskPreviewForTurn || missionControlPreviewForTurn);
              const isActionableTurn = isActionableUserTurn(turn);
              const isForkingTurn = forkingTurnId === turn.id;
              const isEditablePromptTurn = canEditTurn && !hasCustomUserPromptContent && !hasSpecialPromptPreview && !shouldRenderMetronomeWorkflowPrompt;
              const showTurnActions = isActionableTurn && !hasCustomUserPromptContent && !isEditingTurn && !hasSpecialPromptPreview && !shouldRenderMetronomeWorkflowPrompt;
              const areTurnActionsDisabled = !canEditTurn || isForkingTurn || hasSpecialPromptPreview;
              const shouldRenderSpecialPreviewPrompt = Boolean(
                (taskPreviewForTurn?.reviewRequest === true || taskPreviewForTurn?.showPromptPreview === true) && normalizedPrompt
              );
              const actionSummaryLog =
                turn.presentation === "context-action-notice"
                  ? turn.logs.find((log) => log.eventType === "action_summary") || null
                  : null;
              const visibleTimelineSourceItems = shouldRenderMetronomeWorkflowPrompt && metronomeWorkflowPromptLog
                ? rawDisplayedTimelineItems.filter((item) => item.kind !== "log" || item.log !== metronomeWorkflowPromptLog)
                : rawDisplayedTimelineItems;
              const revealedTimelineItems = visibleTimelineSourceItems;
              const visibleWorkLogItemCount =
                visibleWorkLogItemCountsByTurn[turn.id] ?? RUNNER_WORK_LOG_PAGE_SIZE;
              const firstDisplayedTimelineItemIndex = Math.max(0, revealedTimelineItems.length - visibleWorkLogItemCount);
              const displayedTimelineItems = revealedTimelineItems.slice(firstDisplayedTimelineItemIndex);
              const hasMoreWorkingLogs = firstDisplayedTimelineItemIndex > 0;
              const baseDelay = turnIndex * 140;
              const promptStyle = turn.animateOnRender ? getRunnerChatEnterAnimationStyle(baseDelay) : undefined;
              const metaHeaderStyle = turn.animateOnRender ? getRunnerChatEnterAnimationStyle(baseDelay + 40) : undefined;
              const responseStyle = turn.animateOnRender
                ? getRunnerChatEnterAnimationStyle(baseDelay + 150 + displayedTimelineItems.length * 45)
                : undefined;
              const userMessageTime = normalizedPrompt ? (
                <RunnerThreadUserMessageTime value={new Date(turn.startedAtMs).toISOString()} />
              ) : null;
              const shouldAnimateTimelineRows = turn.animateOnRender;
              const turnAgentLabel = isMissionControlThreadTurn
                ? getRunnerMissionControlAgentName(threadMissionControlPreview)
                : turn.agentName || displayedAgentLabel || "Agent";
              const turnAgentPhotoUrl = resolveTurnAgentPhotoUrl(turnAgentLabel);
              const turnEnvironmentLabel = turn.environmentName || displayedEnvironmentLabel || "Environment";
              const shouldRenderWorkSection = !isQueuedTurn;
              const isWorkLogExpanded = expandedTurns[turn.id] ?? false;
              const workLogHeadline = getRunnerTurnWorkHeadline(
                turn,
                nowMs,
                canonicalWorkingLabelByTurnId.get(turn.id),
              );
              const turnIdentity = !isQueuedTurn ? (
                <RunnerTurnIdentity
                  agentName={turnAgentLabel}
                  agentPhotoUrl={turnAgentPhotoUrl}
                  environmentName={turnEnvironmentLabel}
                  isGenerating={isTurnActivelyWorking}
                  onAgentClick={
                    typeof onAgentTurnClick === "function" && turnAgentLabel.trim()
                      ? () => handleTurnAgentClick(turn, turnAgentLabel)
                      : undefined
                  }
                  style={metaHeaderStyle}
                />
              ) : null;
              const workLogItems = displayedTimelineItems.reduce<RunnerWorkStatusItem[]>((items, item, index) => {
                const timelineIndex = firstDisplayedTimelineItemIndex + index;
                const content = renderTimelineItem(turn, item, timelineIndex);
                if (!content) {
                  return items;
                }
                items.push({
                  key: timelineItemKey(turn.id, timelineIndex, item),
                  content,
                  isToolCall: isRunnerTimelineToolCallItem(item),
                  style: shouldAnimateTimelineRows
                    ? getRunnerChatEnterAnimationStyle(baseDelay + 80 + index * 45)
                    : undefined,
                });
                return items;
              }, []);
              const workLogSection = shouldRenderWorkSection ? (
                <RunnerWorkStatusDisclosure
                  expanded={isWorkLogExpanded}
                  headline={workLogHeadline}
                  headerStyle={
                    turn.animateOnRender
                      ? getRunnerChatEnterAnimationStyle(baseDelay + 60)
                      : undefined
                  }
                  items={workLogItems}
                  live={isTurnActivelyWorking}
                  showCollapsedPreview={!hasRunSummary}
                  onExpandedChange={(expanded) => {
                    setExpandedTurns((previousExpandedTurns) => {
                      if (previousExpandedTurns[turn.id] === expanded) {
                        return previousExpandedTurns;
                      }
                      return {
                        ...previousExpandedTurns,
                        [turn.id]: expanded,
                      };
                    });
                  }}
                  hasMore={hasMoreWorkingLogs}
                  onLoadMore={
                    hasMoreWorkingLogs
                      ? () => loadMoreWorkingLogs(turn.id, revealedTimelineItems.length)
                      : undefined
                  }
                />
              ) : null;
              const userThreadHistoryItemId = buildRunnerThreadHistoryItemId(turn.id, "user");
              const assistantThreadHistoryItemId = buildRunnerThreadHistoryItemId(turn.id, "assistant");
              const visibleFollowUpActions = Array.isArray(followUpActions)
                ? followUpActions.filter((action) => action && action.id && action.label)
                : [];
              const shouldRenderFollowUpEngine = Boolean(
                agentMessage?.message &&
                visibleFollowUpActions.length > 0 &&
                isLatestTurn &&
                !isTurnRunning &&
                !isTurnPermissionAsked &&
                !isQueuedTurn
              );
              const runModeLabelConfig = turn.slideCreationCommand
                ? {
                    className: "is-slides",
                    Icon: LucidePresentation,
                    label: "Slides",
                  }
                : turn.loopCommand
                  ? {
                      className: "is-loop",
                      Icon: LucideRepeat2,
                      label: "Loop",
                    }
                : turn.adCreationCommand
                  ? {
                      className: "is-ad",
                      Icon: LucideImages,
                      label: "Ad",
                    }
                : turn.researchCreationCommand
                  ? {
                      className: "is-research",
                      Icon: LucideTelescope,
                      label: "Research",
                    }
                : turn.scrapeCreationCommand
                  ? {
                      className: "is-scrape",
                      Icon: LucideGlobe,
                      label: "Scrape",
                    }
                : turn.parseCreationCommand
                  ? {
                      className: "is-parse",
                      Icon: LucideFileText,
                      label: "Parse",
                    }
                  : null;
              const RunModeLabelIcon = runModeLabelConfig?.Icon || null;
              const runModeLabel = runModeLabelConfig && RunModeLabelIcon ? (
                <div className={`tb-run-mode-label ${runModeLabelConfig.className}`}>
                  <RunModeLabelIcon className="tb-run-mode-label-icon" strokeWidth={1.75} />
                  <span>{runModeLabelConfig.label}</span>
                </div>
              ) : null;
              const metronomeWorkflowPromptContent = shouldRenderMetronomeWorkflowPrompt && metronomeWorkflowPromptLog ? (
                <div className="tb-metronome-turn-workflow-prompt">
                  <RunnerTimelineWorkLogEntry
                    activeTaskPreviewId={threadTaskPreview?.taskId || null}
                    context={timelineRenderContext}
                    log={metronomeWorkflowPromptLog}
                    requestHeadersOverride={requestHeaders ?? null}
                    onWorkspacePathClick={(path) => handleSummaryWorkspacePathClick(turn, path, "working_log")}
                    turnId={turn.id}
                  />
                </div>
              ) : null;

	              if (actionSummaryLog) {
	                const actionType = actionSummaryLog.metadata?.actionType;
	                const isPendingActionSummary = Boolean(actionSummaryLog.metadata?.isPending);
                const ActionSummaryIcon = actionType === "voice" ? LucideAudioLines : LucideFileText;
	                const isActionSummaryClickable =
                  !isPendingActionSummary &&
                  typeof onActionSummaryClick === "function" &&
                  (actionType === "revert" || actionType === "reapply") &&
                  Boolean(actionSummaryLog.metadata?.revertedChangeStepId || actionSummaryLog.metadata?.revertedFilePath);
                const actionSummaryContent = isActionSummaryClickable ? (
                  <button
                    type="button"
                    className="tb-context-action-notice-copy tb-context-action-notice-copy-button"
                    onClick={() =>
                      onActionSummaryClick?.({
                        actionType,
                        message: actionSummaryLog.message,
                        revertedChangeStepId: actionSummaryLog.metadata?.revertedChangeStepId ?? null,
                        revertedFilePath: actionSummaryLog.metadata?.revertedFilePath ?? null,
                        revertedFileName: actionSummaryLog.metadata?.revertedFileName ?? null,
                      })
                    }
                  >
	                    {isPendingActionSummary ? (
	                      <LucideLoaderCircle className="tb-context-action-notice-icon tb-context-action-notice-icon-spinner" strokeWidth={1.5} />
	                    ) : (
	                      <ActionSummaryIcon className="tb-context-action-notice-icon" strokeWidth={1.5} />
	                    )}
                    <span>{actionSummaryLog.message}</span>
                  </button>
                ) : (
                  <span className="tb-context-action-notice-copy">
	                    {isPendingActionSummary ? (
	                      <LucideLoaderCircle className="tb-context-action-notice-icon tb-context-action-notice-icon-spinner" strokeWidth={1.5} />
	                    ) : (
	                      <ActionSummaryIcon className="tb-context-action-notice-icon" strokeWidth={1.5} />
	                    )}
                    <span>{actionSummaryLog.message}</span>
                  </span>
                );
                return (
                  <div key={turn.id} className="tb-turn tb-turn-context-action-notice">
                    {userMessageTime}
                    {turn.prompt.trim() ? (
                      <>
                        <div
                          ref={(node) => setThreadHistoryAnchorElement(userThreadHistoryItemId, node)}
                          className={`task-prompt-in-session-context tb-thread-history-anchor ${emailPromptDisplay.isEmailPrompt ? "is-email-origin" : ""}`.trim()}
                          style={promptStyle}
                        >
                          {userPromptContent}
                        </div>
                      </>
                    ) : null}
                    <div
                      ref={(node) => setThreadHistoryAnchorElement(assistantThreadHistoryItemId, node)}
                      className={`tb-context-action-notice ${actionType ? `tb-context-action-notice-${actionType}` : ""} ${isPendingActionSummary ? "tb-context-action-notice-pending" : ""}`.trim()}
                      style={turn.animateOnRender ? getRunnerChatEnterAnimationStyle(baseDelay + 40) : undefined}
                    >
                      <span className="tb-context-action-notice-line" />
                      {actionSummaryContent}
                      <span className="tb-context-action-notice-line" />
                    </div>
                  </div>
                );
              }

              if (isBtwTurn) {
                return (
                  <div key={turn.id} className="tb-turn tb-turn-btw">
                    {userMessageTime}
                    <div className="tb-btw-turn-card" style={promptStyle}>
                      <div
                        ref={(node) => setThreadHistoryAnchorElement(userThreadHistoryItemId, node)}
                        className="tb-btw-turn-prompt tb-thread-history-anchor"
                      >
                        {userPromptContent}
                      </div>
                      {isTurnRunning && !agentMessage?.message ? (
                        <div className="tb-btw-turn-pending tb-thinking-status" style={responseStyle}>
                          <span className="tb-btw-turn-pending-loader" aria-hidden="true">
                            <DotLoader dotCount={9} dotSize={3} gap={2} className="tb-btw-turn-pending-dot-loader" />
                          </span>
                          <span>Thinking...</span>
                        </div>
                      ) : null}
                      {agentMessage?.message ? (
                        <div
                          ref={(node) => setThreadHistoryAnchorElement(assistantThreadHistoryItemId, node)}
                          className="tb-btw-turn-response tb-thread-history-anchor"
                          style={responseStyle}
                        >
                          {renderAgentSummaryContent(turn, agentMessage, {
                            className: "tb-message-markdown tb-message-markdown-summary",
                            softBreaks: true,
                            canPreviewSummaryWorkspacePaths,
                          })}
                          {emailDeliveryDisplay ? (
                            <div className={`tb-email-delivery-status ${emailDeliveryDisplay.className}`}>
                              <LucideMail className="tb-email-delivery-status-icon" strokeWidth={1.7} />
                              <span>{emailDeliveryDisplay.label}</span>
                              {emailDeliveryDisplay.detail ? <span className="tb-email-delivery-status-detail">{emailDeliveryDisplay.detail}</span> : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              }

              if (hasSpecialPromptPreview && !isEditingTurn) {
                return (
                  <div key={turn.id} className="tb-turn tb-turn-user tb-turn-user-task-preview">
                    {userMessageTime}
                    <div
                      ref={(node) => {
                        if (!shouldRenderSpecialPreviewPrompt) {
                          setThreadHistoryAnchorElement(userThreadHistoryItemId, node);
                        }
                      }}
                      className="tb-task-preview-turn-shell tb-thread-history-anchor"
                      style={promptStyle}
                    >
                      {taskPreviewForTurn
                        ? renderRunnerTaskPreviewCard(taskPreviewForTurn, { onClick: onTaskPreviewClick })
                        : renderRunnerMissionControlPreviewCard(missionControlPreviewForTurn)}
                    </div>

                    {shouldRenderSpecialPreviewPrompt ? (
                      <div
                        ref={(node) => setThreadHistoryAnchorElement(userThreadHistoryItemId, node)}
                        className="tb-user-turn-shell tb-thread-history-anchor"
                        style={promptStyle}
                      >
                        {runModeLabel}
                        <div className={`task-prompt-in-session-context ${emailPromptDisplay.isEmailPrompt ? "is-email-origin" : ""}`.trim()}>
                          {metronomeWorkflowPromptContent || userPromptContent}
                        </div>
                      </div>
                    ) : null}

                    {turnIdentity}
                    {workLogSection}

                    {agentMessage?.message ? (
                    <div
                      ref={(node) => setThreadHistoryAnchorElement(assistantThreadHistoryItemId, node)}
                      className={`tb-turn-summary tb-thread-history-anchor ${isLatestTurn ? "is-latest-summary" : ""}`.trim()}
                      style={responseStyle}
                    >
                        <div className="tb-turn-response">
                          {renderAgentSummaryContent(turn, agentMessage, {
                            className: "tb-message-markdown tb-message-markdown-summary",
                            canPreviewSummaryWorkspacePaths,
                          })}
                        </div>
                        {renderModelProviderRetryAction(turn, agentMessage.message)}
                        {renderRunSummaryActionLine(turn, agentMessage.message, { isLatest: isLatestTurn, canEditTurn, emailDeliveryDisplay })}
                        {shouldRenderFollowUpEngine ? (
                          <div className="tb-follow-up-engine" role="group" aria-label="Follow-up actions">
                            <div className="tb-follow-up-engine-stack">
                              <div className="tb-follow-up-engine-actions">
                                {visibleFollowUpActions.map((action) => (
                                  <button
                                    key={action.id}
                                    type="button"
                                    className="tb-follow-up-engine-action"
                                    onClick={() => handleFollowUpActionClick(action)}
                                    disabled={Boolean(action.disabled || action.pending)}
                                  >
                                    <LucideCornerDownRight className="tb-follow-up-engine-action-icon" strokeWidth={1.75} />
                                    {action.pending ? (
                                      <LucideLoaderCircle className="tb-follow-up-engine-action-spinner tb-context-action-notice-icon-spinner" strokeWidth={1.6} />
                                    ) : null}
                                    <span>{action.label}</span>
                                  </button>
                                ))}
                              </div>
                              {followUpError ? <div className="tb-follow-up-engine-error">{followUpError}</div> : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <div key={turn.id} className="tb-turn tb-turn-user">
                  {userMessageTime}
                  {metronomeWorkflowPromptContent && !isEditingTurn && !taskPreviewForTurn && !missionControlPreviewForTurn ? (
                    <div
                      ref={(node) => setThreadHistoryAnchorElement(userThreadHistoryItemId, node)}
                      className="tb-metronome-turn-workflow-prompt-shell tb-thread-history-anchor"
                      style={promptStyle}
                    >
                      {metronomeWorkflowPromptContent}
                    </div>
                  ) : (
                    <div
                      ref={(node) => setThreadHistoryAnchorElement(userThreadHistoryItemId, node)}
                      className={`tb-user-turn-shell ${showTurnActions ? "tb-user-turn-shell-has-actions" : ""} ${isEditablePromptTurn ? "tb-user-turn-shell-editable" : ""} ${isEditingTurn ? "tb-user-turn-shell-editing" : ""} ${isForkingTurn ? "tb-user-turn-shell-forking" : ""}`.trim()}
                      style={promptStyle}
                    >
                      {turn.attachments && turn.attachments.length > 0 ? (
                        <div className="runner-attachments runner-attachments-turn">
                          {turn.attachments.map((attachment) => (
                            <RunnerAttachmentPreviewChip
                              key={attachment.id}
                              activePreviewAttachmentId={previewedDocumentAttachment?.id || null}
                              attachment={attachment}
                              authenticatedFetchHeaders={authenticatedAttachmentFetchHeaders}
                              backendUrl={normalizedBackendUrl}
                              onPreview={toggleDocumentAttachmentPreview}
                              variant="message"
                            />
                          ))}
                        </div>
                      ) : null}
                      {turn.quotedSelection ? (
                        <div className="tb-user-turn-quote">
                          <LucideTextQuote className="tb-user-turn-quote-icon" strokeWidth={1.6} />
                          <div className="tb-user-turn-quote-text">{turn.quotedSelection.text}</div>
                        </div>
                      ) : null}
                      {runModeLabel}
                      <div
                        className={`task-prompt-in-session-context ${emailPromptDisplay.isEmailPrompt ? "is-email-origin" : ""} ${isEditablePromptTurn ? "tb-user-turn-editable" : ""} ${isEditingTurn ? "tb-user-turn-editing" : ""}`.trim()}
                      >
                        {isEditingTurn ? (
                          <>
                            <textarea
                              ref={editingTextareaRef}
                              className="tb-user-turn-editor"
                              value={editingTurnDraft}
                              onChange={(event) => setEditingTurnDraft(event.target.value)}
                              onKeyDown={(event) => handleEditedTurnKeyDown(event, turn.id)}
                              autoFocus
                            />
                            <div className="tb-user-turn-edit-actions">
                              <PlatformSecondaryButton size="medium" type="button" className="tb-user-turn-edit-button tb-user-turn-edit-button-secondary" onClick={cancelEditingTurn}>
                                Cancel
                              </PlatformSecondaryButton>
                              <PlatformPrimaryButton
                                size="medium"
                                type="button"
                                className="tb-user-turn-edit-button tb-user-turn-edit-button-primary"
                                onClick={() => handleEditedTurnSend(turn.id)}
                                disabled={!editingTurnDraft.trim()}
                              >
                                Send
                              </PlatformPrimaryButton>
                            </div>
                          </>
                        ) : taskPreviewForTurn ? (
                          renderRunnerTaskPreviewCard(taskPreviewForTurn, { onClick: onTaskPreviewClick })
                        ) : missionControlPreviewForTurn ? (
                          renderRunnerMissionControlPreviewCard(missionControlPreviewForTurn)
                        ) : (
                          userPromptContent
                        )}
                      </div>
                      {showTurnActions ? (
                        <div className="tb-user-turn-actions">
                          <button
                            type="button"
                            className="tb-user-turn-action-trigger"
                            aria-label="Fork from message"
                            onClick={() => openForkDialogForTurn(turn)}
                            disabled={areTurnActionsDisabled}
                          >
                            {isForkingTurn ? (
                              <LucideLoaderCircle className="tb-user-turn-edit-trigger-icon tb-context-action-notice-icon-spinner" strokeWidth={1.75} />
                            ) : (
                              <LucideGitBranch className="tb-user-turn-edit-trigger-icon" strokeWidth={1.75} />
                            )}
                          </button>
                          <button
                            type="button"
                            className="tb-user-turn-action-trigger"
                            aria-label="Edit message"
                            onClick={() => startEditingTurn(turn)}
                            disabled={areTurnActionsDisabled}
                          >
                            <LucidePencil className="tb-user-turn-edit-trigger-icon" strokeWidth={1.75} />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {isQueuedTurn ? (
                    <RunnerPageQueueReceipt
                      durable={Boolean(durableBatchQueueReceipt)}
                      label={durableBatchQueueReceipt
                        ? getRunnerBatchQueueReceiptLabel(durableBatchQueueReceipt)
                        : undefined}
                    />
                  ) : null}

                  {turnIdentity}
                  {workLogSection}

                  {agentMessage?.message ? (
                    <div
                      ref={(node) => setThreadHistoryAnchorElement(assistantThreadHistoryItemId, node)}
                      className={`tb-turn-summary tb-thread-history-anchor ${isLatestTurn ? "is-latest-summary" : ""}`.trim()}
                      style={responseStyle}
                    >
                      <div className="tb-turn-response">
                        {renderAgentSummaryContent(turn, agentMessage, {
                          className: "tb-message-markdown tb-message-markdown-summary",
                          canPreviewSummaryWorkspacePaths,
                        })}
                      </div>
                      {renderModelProviderRetryAction(turn, agentMessage.message)}
                      {renderRunSummaryActionLine(turn, agentMessage.message, { isLatest: isLatestTurn, canEditTurn, emailDeliveryDisplay })}
                      {shouldRenderFollowUpEngine ? (
                        <div className="tb-follow-up-engine" role="group" aria-label="Follow-up actions">
                          <div className="tb-follow-up-engine-stack">
                            <div className="tb-follow-up-engine-actions">
                              {visibleFollowUpActions.map((action) => (
                                <button
                                  key={action.id}
                                  type="button"
                                  className="tb-follow-up-engine-action"
                                  onClick={() => handleFollowUpActionClick(action)}
                                  disabled={Boolean(action.disabled || action.pending)}
                                >
                                  <LucideCornerDownRight className="tb-follow-up-engine-action-icon" strokeWidth={1.75} />
                                  {action.pending ? (
                                    <LucideLoaderCircle className="tb-follow-up-engine-action-spinner tb-context-action-notice-icon-spinner" strokeWidth={1.6} />
                                  ) : null}
                                  <span>{action.label}</span>
                                </button>
                              ))}
                            </div>
                            {followUpError ? <div className="tb-follow-up-engine-error">{followUpError}</div> : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        {shouldDisplayThreadHistoryRail ? (
          <div
            className={`tb-thread-history-rail ${areThreadHistoryControlsVisible ? "is-controls-visible" : ""}`.trim()}
            onMouseEnter={() => setIsThreadHistoryRailHovered(true)}
            onMouseLeave={() => {
              setIsThreadHistoryRailHovered(false);
              setHoveredThreadHistoryItemId(null);
            }}
          >
            <button
              type="button"
              className="tb-thread-history-chevron tb-thread-history-chevron-up"
              onClick={() => navigateThreadHistory(-1)}
              disabled={!previousThreadHistoryItem}
              aria-label="Scroll to previous message"
            >
              <LucideChevronUp className="tb-thread-history-chevron-icon" strokeWidth={1.8} />
            </button>

            <div className="tb-thread-history-lines" role="navigation" aria-label="Thread history">
              {threadHistoryItems.map((item, index) => {
                const isActive = item.id === activeThreadHistoryItemId;
                const isHovered = item.id === hoveredThreadHistoryItemId;
                const lineWidth = isHovered
                  ? RUNNER_THREAD_HISTORY_ACTIVE_LINE_WIDTH
                  : getRunnerThreadHistoryLineWidth(index, activeThreadHistoryIndex);

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`tb-thread-history-line-button ${isActive ? "is-active" : ""} ${isHovered ? "is-hovered" : ""}`.trim()}
                    onMouseEnter={() => setHoveredThreadHistoryItemId(item.id)}
                    onMouseLeave={() => setHoveredThreadHistoryItemId((current) => current === item.id ? null : current)}
                    onFocus={() => setHoveredThreadHistoryItemId(item.id)}
                    onBlur={() => setHoveredThreadHistoryItemId((current) => current === item.id ? null : current)}
                    onClick={() => scrollThreadHistoryItemIntoView(item.id)}
                    aria-label={`Scroll to ${item.label}: ${item.preview}`}
                  >
                    {isHovered ? (
                      <div className="tb-thread-history-preview-bubble" aria-hidden="true">
                        <div className="tb-thread-history-preview-label">{item.label}</div>
                        <div className="tb-thread-history-preview-copy">{item.preview}</div>
                      </div>
                    ) : null}
                    <span
                      className="tb-thread-history-line"
                      style={{ width: `${lineWidth}px` }}
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="tb-thread-history-chevron tb-thread-history-chevron-down"
              onClick={() => navigateThreadHistory(1)}
              disabled={!nextThreadHistoryItem}
              aria-label="Scroll to next message"
            >
              <LucideChevronDown className="tb-thread-history-chevron-icon" strokeWidth={1.8} />
            </button>
          </div>
        ) : null}
      </div>

      {!shouldUseCanonicalThreadSurface && executionWorkbenchAvailable ? (
        <aside
          className={`tb-thread-execution-workbench-sidebar ${detachedExecutionWorkbenchOpen ? "is-open" : ""}`.trim()}
          aria-label="Execution details"
          aria-hidden={detachedExecutionWorkbenchOpen ? undefined : true}
          inert={detachedExecutionWorkbenchOpen ? undefined : true}
        >
          {detachedExecutionWorkbenchOpen ? (
            <RunnerThreadExecutionWorkbench
              key={executionWorkbenchReceipt?.id || `task-list:${canonicalThreadId}`}
              receipt={executionWorkbenchReceipt}
              projection={canonicalThread.projection}
              taskList={threadTaskList}
              availableConnectorOptions={availableConnectorOptions}
              usedConnectorIds={legacyUsedConnectorIds}
              detailLoadState={
                executionWorkbenchReceipt
                  ? canonicalThread.runDetailStates?.[executionWorkbenchReceipt.id]
                    || { status: "idle", error: null }
                  : undefined
              }
              activityGroupActionStates={canonicalThread.activityGroupActionStates}
              renderAction={renderCanonicalThreadAction}
              onClose={() => onExecutionWorkbenchOpenChange?.(false)}
              onLoadRunDetails={(run) => canonicalThread.loadRunDetails(run.id)}
              onLoadActivityGroupActions={canonicalThread.loadActivityGroupActions}
              onControlRun={async (run, action) => {
                try {
                  const command = await canonicalThread.controlRun(run.id, {
                    action,
                    idempotencyKey: ["runner-chat", run.id, action, Date.now()].join(":"),
                  });
                  if (command.effectApplied === false) {
                    setInlineError(command.limitation || "The control request was recorded and is waiting for the run coordinator.");
                  }
                } catch (error) {
                  const normalizedError = error instanceof Error ? error : new Error(String(error));
                  setInlineError(normalizedError.message || `Failed to ${action} the run.`);
                }
              }}
              onOpenChanges={onOpenChanges ? (run) => onOpenChanges(canonicalThreadId, run.id) : undefined}
              onPermissionDecision={(request, decision) => handlePermissionDecision(
                adaptRunnerThreadPermissionRequestToRunnerLog(request),
                decision,
              )}
            />
          ) : null}
        </aside>
      ) : null}

      {batchSavedReceiptId > 0 && typeof document !== "undefined"
        ? createPortal(
            <div className="tb-runner-page-status-indicator">
              <PlatformStatusIndicator
                key={batchSavedReceiptId}
                title="Batch job saved"
                copy="Kept on shelf in Batches."
                icon={<LucideTruck strokeWidth={1.75} />}
                onDismiss={() => setBatchSavedReceiptId(0)}
              />
            </div>,
            document.body,
          )
        : null}

      <div className="tb-input-shell">
        <div className="tb-input-width">
          <div className="embedded-runner-input">
            <div
              ref={composerBoxRef}
              className={`task-input-box ${privateMode ? "task-input-box-private" : ""} ${stagedComposerToneValue ? `task-input-box-thread-context task-input-box-thread-context-${stagedComposerToneValue}` : ""}`.trim()}
            >
              {showConnectorMentionPopup && connectorMentionInputState ? (
                <RunnerComposerSuggestionPopup
                  className="tb-popup-menu-connector-mention"
                  placement={hasCurrentThread ? "top" : "bottom"}
                  portal={portalComposerSuggestions}
                  anchorRef={composerBoxRef}
                  ariaLabel="Connectors"
                  footer={onOpenPluginsOverview ? (
                    <button
                      type="button"
                      className="tb-connector-mention-manage"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setDismissedConnectorMentionKey(connectorMentionKey);
                        onOpenPluginsOverview();
                      }}
                    >
                      <LucidePlug strokeWidth={1.7} />
                      <span>Manage connectors</span>
                    </button>
                  ) : null}
                >
                    {filteredConnectorOptions.length > 0 ? (
                      filteredConnectorOptions.map((option, index) => {
                        const isSelected = selectedConnectorIds.includes(
                          option.id,
                        );
                        const isConnecting =
                          connectingConnectorId === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`tb-popup-row tb-connector-mention-row ${index === activeConnectorOptionIndex ? "is-active" : ""} ${isSelected ? "is-selected" : ""}`.trim()}
                            disabled={Boolean(
                              option.disabled || connectingConnectorId,
                            )}
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() =>
                              setActiveConnectorOptionIndex(index)
                            }
                            onClick={() =>
                              void selectComposerConnector(
                                option,
                                connectorMentionInputState,
                              )
                            }
                          >
                            <ConnectionIdentityIcon
                              kind={getRunnerChatConnectorIdentityKind(option)}
                              connectionId={option.id}
                              logoUrl={option.logoUrl}
                              logoClassName="tb-connector-mention-logo"
                              variant="catalog"
                              className="tb-connector-mention-icon-shell"
                              icon={(
                                <LucidePlug
                                  className="tb-connector-mention-icon"
                                  strokeWidth={1.7}
                                />
                              )}
                            />
                            <span className="tb-connector-mention-copy">
                              <span className="tb-connector-mention-name">
                                {option.name}
                              </span>
                              {option.description ? (
                                <span className="tb-connector-mention-description">
                                  {option.description}
                                </span>
                              ) : null}
                            </span>
                            <span className="tb-connector-mention-status">
                              {isConnecting ? (
                                <LucideLoaderCircle
                                  className="tb-connector-mention-spinner"
                                  strokeWidth={1.7}
                                />
                              ) : isSelected ? (
                                <LucideCheck
                                  className="tb-connector-mention-check"
                                  strokeWidth={1.9}
                                />
                              ) : option.connected === false ? (
                                "Connect"
                              ) : null}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="tb-connector-mention-empty">
                        No connectors match that input.
                      </div>
                    )}
                </RunnerComposerSuggestionPopup>
              ) : null}
              {showSlashCommandPopup ? (
                <RunnerComposerSuggestionPopup
                  className="tb-popup-menu-slash"
                  placement={hasCurrentThread ? "top" : "bottom"}
                  portal={portalComposerSuggestions}
                  anchorRef={composerBoxRef}
                  ariaLabel="Slash commands"
                  activeIndex={activeSlashPopupIndex}
                  keyboardNavigation
                  header={slashPopupView === "commands" ? (
                    <div className="tb-composer-suggestion-popup-header tb-popup-menu-slash-header">
                      <div className="tb-popup-menu-slash-actions" role="group" aria-label="Composer actions">
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeSlashPopupIndex === 0}
                          className={`tb-popup-row tb-popup-row-core-action tb-popup-row-composer-action ${activeSlashPopupIndex === 0 ? "is-active" : ""}`.trim()}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveSlashPopupIndex(0)}
                          onClick={handleSlashFeedbackClick}
                        >
                          <LucideMessageSquareText className="tb-popup-icon" strokeWidth={1.75} />
                          <span className="tb-popup-label">Feedback</span>
                        </button>
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeSlashPopupIndex === 1}
                          className={`tb-popup-row tb-popup-row-core-action tb-popup-row-composer-action ${activeSlashPopupIndex === 1 ? "is-active" : ""}`.trim()}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveSlashPopupIndex(1)}
                          onClick={() => {
                            setSlashPopupView("projects");
                            setActiveSlashPopupIndex(0);
                          }}
                        >
                          <LucideFolderOpen className="tb-popup-icon" strokeWidth={1.75} />
                          <span className="tb-popup-label">Work in Project</span>
                        </button>
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeSlashPopupIndex === 2}
                          className={`tb-popup-row tb-popup-row-core-action tb-popup-row-composer-action ${activeSlashPopupIndex === 2 ? "is-active" : ""}`.trim()}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveSlashPopupIndex(2)}
                          onClick={() => {
                            setSlashPopupView("reasoning");
                            setActiveSlashPopupIndex(0);
                          }}
                        >
                          <LucideBrain className="tb-popup-icon" strokeWidth={1.75} />
                          <span className="tb-popup-label">Reasoning</span>
                        </button>
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeSlashPopupIndex === 3}
                          className={`tb-popup-row tb-popup-row-core-action tb-popup-row-composer-action ${activeSlashPopupIndex === 3 ? "is-active" : ""}`.trim()}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveSlashPopupIndex(3)}
                          onClick={handleSlashAttachWorkspaceFilesClick}
                        >
                          <LucideFolderOpen className="tb-popup-icon" strokeWidth={1.75} />
                          <span className="tb-popup-label">Attach Files from Workspace</span>
                          <span className="tb-popup-shortcut" aria-label="Keyboard shortcut Command U">
                            <span className="tb-popup-shortcut-key">⌘</span>
                            <span className="tb-popup-shortcut-key tb-popup-shortcut-key-letter">{ATTACH_FILES_SHORTCUT_KEY.toUpperCase()}</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeSlashPopupIndex === 4}
                          className={`tb-popup-row tb-popup-row-core-action tb-popup-row-composer-action ${activeSlashPopupIndex === 4 ? "is-active" : ""}`.trim()}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveSlashPopupIndex(4)}
                          onClick={handleSlashUploadFilesClick}
                        >
                          <IconPaperclip className="tb-popup-icon" />
                          <span className="tb-popup-label">Upload Files</span>
                        </button>
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeSlashPopupIndex === 5}
                          className={`tb-popup-row tb-popup-row-core-action tb-popup-row-composer-action ${activeSlashPopupIndex === 5 ? "is-active" : ""}`.trim()}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveSlashPopupIndex(5)}
                          onClick={handleSlashPromptAttachmentClick}
                        >
                          <LucideMessageSquareText className="tb-popup-icon" strokeWidth={1.75} />
                          <span className="tb-popup-label">Attach Prompt</span>
                          <span className="tb-popup-shortcut" aria-label="Keyboard shortcut Command P">
                            <span className="tb-popup-shortcut-key">⌘</span>
                            <span className="tb-popup-shortcut-key tb-popup-shortcut-key-letter">{PROMPTS_SHORTCUT_KEY.toUpperCase()}</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeSlashPopupIndex === 6}
                          className={`tb-popup-row tb-popup-row-core-action tb-popup-row-composer-action ${activeSlashPopupIndex === 6 ? "is-active" : ""}`.trim()}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveSlashPopupIndex(6)}
                          onClick={handleSlashKnowledgeAttachmentClick}
                        >
                          <LucideLibraryBig className="tb-popup-icon" strokeWidth={1.75} />
                          <span className="tb-popup-label">Attach Knowledge</span>
                        </button>
                        <button
                          type="button"
                          role="option"
                          aria-selected={activeSlashPopupIndex === 7}
                          className={`tb-popup-row tb-popup-row-core-action tb-popup-row-composer-action ${activeSlashPopupIndex === 7 ? "is-active" : ""}`.trim()}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveSlashPopupIndex(7)}
                          onClick={handleSlashThreadAttachmentClick}
                        >
                          <LucideMessageSquare className="tb-popup-icon" strokeWidth={1.75} />
                          <span className="tb-popup-label">Attach Thread</span>
                        </button>
                      </div>
                      <div className="tb-popup-menu-section-label">Capabilities</div>
                    </div>
                  ) : (
                    <div className="tb-composer-suggestion-popup-header tb-popup-menu-slash-header tb-popup-menu-slash-subheader">
                      <button
                        type="button"
                        className="tb-popup-menu-slash-back"
                        data-popup-navigation-ignore
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setSlashPopupView("commands");
                          setActiveSlashPopupIndex(0);
                        }}
                      >
                        <IconChevronLeft className="tb-popup-icon" />
                        <span>{slashPopupView === "projects" ? "Projects" : "Reasoning"}</span>
                      </button>
                    </div>
                  )}
                  emptyState={slashPopupView === "commands" && filteredSlashCommandItems.length === 0 ? (
                    <div className="tb-popup-menu-slash-empty">
                      <div className="tb-popup-empty-state">No slash commands match that input.</div>
                    </div>
                  ) : null}
                >
                  {slashPopupView === "commands" ? filteredSlashCommandItems.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={activeSlashPopupIndex === index + RUNNER_SLASH_CORE_ACTION_COUNT}
                        className={`tb-popup-row tb-popup-row-core-action ${activeSlashPopupIndex === index + RUNNER_SLASH_CORE_ACTION_COUNT ? "is-active" : ""}`.trim()}
                        onMouseDown={(event) => {
                          event.preventDefault();
                        }}
                        onMouseEnter={() => setActiveSlashPopupIndex(index + RUNNER_SLASH_CORE_ACTION_COUNT)}
                        onClick={() => {
                          handleSlashPopupItemSelect(index + RUNNER_SLASH_CORE_ACTION_COUNT);
                        }}
                      >
                        {item.icon}
                        <span className="tb-popup-label">{formatRunnerSlashCommandLabel(item.command)}</span>
                        <span className="tb-popup-value">{item.description}</span>
                      </button>
                    )) : slashPopupView === "projects" ? (
                      orderedProjects.length > 0 ? orderedProjects.map((project, index) => {
                        const projectEnvironmentId = getRunnerProjectEnvironmentId(project);
                        const projectEnvironment = orderedEnvironments.find((environment) => environment.id === projectEnvironmentId);
                        const isSelected = effectiveWorkspaceSelectorMode === "projects" && selectedProjectId === project.id;
                        return (
                          <button
                            key={project.id}
                            type="button"
                            role="option"
                            aria-selected={activeSlashPopupIndex === index}
                            aria-disabled={!projectEnvironmentId}
                            disabled={!projectEnvironmentId}
                            title={!projectEnvironmentId ? "This project has no linked computer." : project.name}
                            className={`tb-popup-row tb-popup-row-core-action ${activeSlashPopupIndex === index ? "is-active" : ""}`.trim()}
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() => setActiveSlashPopupIndex(index)}
                            onClick={() => handleSlashPopupItemSelect(index)}
                          >
                            <LucideFolderOpen className="tb-popup-icon" strokeWidth={1.75} />
                            <span className="tb-popup-label">{project.name}</span>
                            <span className="tb-popup-value">{project.description || projectEnvironment?.name || "Project"}</span>
                            {isSelected ? <LucideCheck className="tb-popup-check" strokeWidth={1.9} /> : null}
                          </button>
                        );
                      }) : (
                        <div className="tb-popup-menu-slash-empty">
                          <div className="tb-popup-empty-state">No projects available.</div>
                        </div>
                      )
                    ) : (
                      RUNNER_REASONING_EFFORT_OPTIONS.map((option, optionIndex) => {
                        const isSelected = normalizeRunnerReasoningEffort(effectiveReasoningEffort) === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            role="option"
                            aria-selected={activeSlashPopupIndex === optionIndex}
                            className={`tb-popup-row tb-popup-row-core-action ${activeSlashPopupIndex === optionIndex ? "is-active" : ""}`.trim()}
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() => setActiveSlashPopupIndex(optionIndex)}
                            onClick={() => handleSlashPopupItemSelect(optionIndex)}
                          >
                            <LucideBrain className="tb-popup-icon" strokeWidth={1.75} />
                            <span className="tb-popup-label">{option.label}</span>
                            <span className="tb-popup-value">{option.description}</span>
                            {isSelected ? <LucideCheck className="tb-popup-check" strokeWidth={1.9} /> : null}
                          </button>
                        );
                      })
                    )}
                </RunnerComposerSuggestionPopup>
              ) : null}
              {stagedAdCreationCommand ? (
                <PlatformPopupSurface className="tb-popup-menu-main tb-ad-creation-popup" animation="up-in" role="dialog" aria-label="Create Ad settings">
                  <div className="tb-ad-creation-popup-header">
                    <div className="tb-ad-creation-popup-title">Create Ad</div>
                    <button
                      type="button"
                      className="tb-ad-creation-close-button"
                      onClick={() => clearStagedCommand("adCreation")}
                      aria-label="Close Create Ad settings"
                    >
                      <LucideX className="tb-ad-creation-close-icon" strokeWidth={1.75} />
                    </button>
                  </div>
                  <div className="tb-ad-creation-options">
                    <div className="tb-ad-creation-control">
                      <label className="tb-ad-creation-control-label" htmlFor="tb-ad-creation-style">Style</label>
                      <div className="tb-ad-creation-select-shell">
                        <select
                          id="tb-ad-creation-style"
                          className="tb-ad-creation-select"
                          value={adCreationSettings.style}
                          onChange={(event) => updateAdCreationSettings({ style: event.target.value as RunnerAdCreationStyleId })}
                          aria-label="Ad style"
                        >
                          {RUNNER_AD_STYLE_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </select>
                        <LucideChevronDown className="tb-ad-creation-select-chevron" strokeWidth={1.75} />
                      </div>
                    </div>
                    <div className="tb-ad-creation-control tb-ad-creation-control-quality">
                      <label className="tb-ad-creation-control-label" htmlFor="tb-ad-creation-quality">Quality</label>
                      <div className="tb-ad-creation-select-shell tb-ad-creation-select-shell-wide">
                        <select
                          id="tb-ad-creation-quality"
                          className="tb-ad-creation-select"
                          value={adCreationSettings.quality}
                          onChange={(event) => updateAdCreationSettings({ quality: event.target.value as RunnerAdCreationQualityId })}
                          aria-label="GPT Image 2 quality"
                        >
                          {RUNNER_AD_QUALITY_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </select>
                        <LucideChevronDown className="tb-ad-creation-select-chevron" strokeWidth={1.75} />
                      </div>
                    </div>
                    <div className="tb-ad-creation-control">
                      <label className="tb-ad-creation-control-label" htmlFor="tb-ad-creation-aspect-ratio">Aspect Ratio</label>
                      <div className="tb-ad-creation-select-shell">
                        <select
                          id="tb-ad-creation-aspect-ratio"
                          className="tb-ad-creation-select"
                          value={adCreationSettings.aspectRatio}
                          onChange={(event) => updateAdCreationSettings({ aspectRatio: event.target.value as RunnerAdCreationAspectRatioId })}
                          aria-label="Ad aspect ratio"
                        >
                          {RUNNER_AD_ASPECT_RATIO_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </select>
                        <LucideChevronDown className="tb-ad-creation-select-chevron" strokeWidth={1.75} />
                      </div>
                    </div>
                    <div className="tb-ad-creation-control">
                      <label className="tb-ad-creation-control-label" htmlFor="tb-ad-creation-variants">Images</label>
                      <div className="tb-ad-creation-select-shell">
                        <select
                          id="tb-ad-creation-variants"
                          className="tb-ad-creation-select"
                          value={String(adCreationSettings.variants)}
                          onChange={(event) => updateAdCreationSettings({ variants: Number(event.target.value) as RunnerAdCreationVariantCount })}
                          aria-label="Ad image variants"
                        >
                          {RUNNER_AD_VARIANT_OPTIONS.map((option) => (
                            <option key={option.id} value={String(option.id)}>{option.label}</option>
                          ))}
                        </select>
                        <LucideChevronDown className="tb-ad-creation-select-chevron" strokeWidth={1.75} />
                      </div>
                    </div>
                    <div className="tb-ad-creation-cost">
                      <span>{formatRunnerAdCreationComputeTokens(adCreationTotalComputeTokens)}</span>
                      <span>Total estimate</span>
                    </div>
                  </div>
                </PlatformPopupSurface>
              ) : null}

              {visibleComposerAttachments.length > 0 ? (
                <div className="runner-attachments">
                  {visibleComposerAttachments.map((attachment) => (
                    <RunnerAttachmentPreviewChip
                      key={attachment.id}
                      attachment={attachment}
                      authenticatedFetchHeaders={authenticatedAttachmentFetchHeaders}
                      backendUrl={normalizedBackendUrl}
                      variant="message"
                      removable
                      onRemove={() => {
                        removeAttachment(attachment.id);
                        if (
                          attachment.referenceType === "prompt"
                          && attachment.promptId
                        ) {
                          attachments
                            .filter(
                              (relatedAttachment) =>
                                relatedAttachment.promptId === attachment.promptId
                                && relatedAttachment.runnerAttachmentRole === "prompt_supporting_attachment",
                            )
                            .forEach((relatedAttachment) => {
                              removeAttachment(relatedAttachment.id);
                            });
                        }
                      }}
                    />
                  ))}
                </div>
              ) : null}

              {renderedComposerQuotedSelection ? (
                <div
                  className={`tb-composer-quoted-selection ${isComposerQuotedSelectionVisible ? "tb-composer-quoted-selection-visible" : ""}`.trim()}
                >
                  <LucideTextQuote className="tb-composer-quoted-selection-icon" strokeWidth={1.7} />
                  <div className="tb-composer-quoted-selection-copy">{previewQuotedSelectionText(renderedComposerQuotedSelection.text)}</div>
                  <button
                    type="button"
                    className="tb-composer-quoted-selection-dismiss"
                    onClick={clearComposerQuotedSelection}
                    aria-label="Remove quoted text"
                  >
                    <LucideX className="tb-composer-quoted-selection-dismiss-icon" strokeWidth={1.75} />
                  </button>
                </div>
              ) : null}

              <div
                className={`tb-composer-textarea-shell ${hasStagedComposerCommand ? "tb-composer-textarea-shell-staged" : ""} ${selectedConnectorOptions.length > 0 ? "tb-composer-textarea-shell-connectors" : ""}`.trim()}
                style={
                  hasStagedComposerCommand || selectedConnectorOptions.length > 0
                    ? ({
                        "--tb-staged-thread-command-offset": composerTextareaOffsetValue,
                        "--tb-selected-connectors-inline-start": selectedConnectorsInlineStartValue,
                      } as CSSProperties)
                    : undefined
                }
              >
                {hasStagedComposerCommand ? (
                  <span
                    className={`tb-staged-thread-command ${stagedComposerToneValue ? `tb-staged-thread-command-${stagedComposerToneValue}` : ""}`.trim()}
                  >
                    {stagedComposerLabel}
                  </span>
                ) : null}
                {selectedConnectorOptions.length > 0 ? (
                  <div
                    ref={selectedConnectorsInlineRef}
                    className="tb-composer-selected-connectors"
                    role="group"
                    aria-label="Selected connectors"
                  >
                    {selectedConnectorOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className="tb-composer-selected-connector"
                        aria-label={`Remove ${option.name} connector`}
                        title={`Remove ${option.name}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => removeSelectedConnector(option.id)}
                      >
                        <ConnectionIdentityIcon
                          kind={getRunnerChatConnectorIdentityKind(option)}
                          connectionId={option.id}
                          logoUrl={option.logoUrl}
                          logoClassName="tb-composer-selected-connector-logo"
                          variant="catalog"
                          className="tb-composer-selected-connector-icon-shell"
                          icon={(
                            <LucidePlug
                              className="tb-composer-selected-connector-icon"
                              strokeWidth={1.7}
                            />
                          )}
                        />
                        <span className="tb-composer-selected-connector-name">
                          {option.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className={`sidebar-textarea ${hasStagedComposerCommand ? "sidebar-textarea-staged" : ""} ${selectedConnectorOptions.length > 0 ? "sidebar-textarea-connectors" : ""}`.trim()}
                  value={input}
                  onChange={handleInputChange}
                  onPaste={handleInputPaste}
                  onSelect={handleInputSelectionChange}
                  onClick={handleInputSelectionChange}
                  onKeyUp={handleInputSelectionChange}
                  placeholder={
                    hasStagedComposerCommand || selectedConnectorOptions.length > 0
                      ? ""
                      : placeholder
                  }
                  onKeyDown={handleKeyDown}
                  readOnly={disabled || Boolean(
                    stagedThreadContextCommand && !textareaAllowsPromptAfterStagedCommand
                  )}
                />
              </div>

              {useComputerAgentsMode ? (
                  <div ref={popupAreaRef} className="task-input-controls task-input-controls-full">
                    <div className="tb-selector-anchor">
                      <button
                        ref={plusButtonRef}
                        type="button"
                        className={`task-attachment-button task-attachment-button-full ${hasPlusPopupOpen ? "active" : ""}`}
                        onClick={toggleMainMenu}
                        disabled={disabled || isPreparingRun}
                        aria-label="More options"
                        title="More options"
                      >
                        <IconPlus className="task-attachment-icon" />
                      </button>

                      {renderComposerPopupPortal(
                        showMainMenu ? (
                        <PlatformPopupSurface ref={plusMainPopupRef} className="tb-popup-menu-main" animation={mainPopupAnimation}>
                          <button
                            type="button"
                            className={`tb-popup-row tb-popup-row-divider tb-popup-row-core-action ${showAttachFilesPopup ? "selected" : ""}`}
                            onClick={handleAttachFilesMenuClick}
                          >
                            <IconPaperclip className="tb-popup-icon" />
                            <span className="tb-popup-label">Attach Files</span>
                            <span className="tb-popup-shortcut" aria-label="Keyboard shortcut Command U">
                              <span className="tb-popup-shortcut-key">⌘</span>
                              <span className="tb-popup-shortcut-key tb-popup-shortcut-key-letter">{ATTACH_FILES_SHORTCUT_KEY.toUpperCase()}</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            className="tb-popup-row tb-popup-row-prompts"
                            onClick={handlePromptsMenuClick}
                            disabled={!onOpenPromptSearch}
                            aria-disabled={!onOpenPromptSearch}
                          >
                            <LucideMessageSquareText className="tb-popup-icon" strokeWidth={1.75} />
                            <span className="tb-popup-label">Prompts</span>
                            <span className="tb-popup-shortcut" aria-label="Keyboard shortcut Command P">
                              <span className="tb-popup-shortcut-key">⌘</span>
                              <span className="tb-popup-shortcut-key tb-popup-shortcut-key-letter">{PROMPTS_SHORTCUT_KEY.toUpperCase()}</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            className="tb-popup-row tb-popup-row-knowledge"
                            onClick={handleKnowledgeMenuClick}
                            disabled={!onOpenKnowledgeSearch}
                            aria-disabled={!onOpenKnowledgeSearch}
                          >
                            <LucideLibraryBig className="tb-popup-icon" strokeWidth={1.75} />
                            <span className="tb-popup-label">Knowledge</span>
                          </button>
                          <button
                            type="button"
                            className="tb-popup-row tb-popup-row-threads tb-popup-row-divider"
                            onClick={handleThreadsMenuClick}
                            disabled={!onOpenThreadSearch}
                            aria-disabled={!onOpenThreadSearch}
                          >
                            <LucideMessageSquare className="tb-popup-icon" strokeWidth={1.75} />
                            <span className="tb-popup-label">Threads</span>
                          </button>
                          <button
                            type="button"
                            className={`tb-popup-row tb-popup-row-core-action ${showSkillsPopup ? "selected" : ""}`}
                            onClick={() => openPlusPopup("skills")}
                          >
                            <IconLayers className="tb-popup-icon" />
                            <span className="tb-popup-label">Skills</span>
                            <IconChevronRight className="tb-popup-chevron" />
                          </button>
                          <button
                            type="button"
                            className={`tb-popup-row tb-popup-row-core-action ${showSchedulePopup ? "selected" : ""} ${scheduleEnabled ? "tb-popup-row-accent" : ""}`}
                            onClick={() => openPlusPopup("schedule")}
                          >
                            <IconClock className="tb-popup-icon" />
                            <span className="tb-popup-label">Schedule</span>
                            <span className="tb-popup-shortcut" aria-label="Keyboard shortcut Command S">
                              <span className="tb-popup-shortcut-key">⌘</span>
                              <span className="tb-popup-shortcut-key tb-popup-shortcut-key-letter">{SCHEDULE_SHORTCUT_KEY.toUpperCase()}</span>
                            </span>
                          </button>
                        </PlatformPopupSurface>
                        ) : null,
                        plusMainPopupStyle
                      )}

                      {renderComposerPopupPortal(
                        showSkillsPopup ? (
                        <PlatformPopupSurface ref={plusSidePopupRef} className="tb-popup-menu-side tb-popup-menu-skills" animation={sidePopupAnimation}>
                          <div className="tb-popup-attach-topbar">
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-close" onClick={closeSkillsPopup} aria-label="Close skills popup">
                              <LucideX className="tb-popup-attach-topbar-icon" strokeWidth={1.75} />
                            </button>
                            <div className="tb-popup-attach-topbar-title">Skills</div>
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-confirm" onClick={() => closeAllInputPopups()} aria-label="Done">
                              <LucideCheck className="tb-popup-attach-topbar-icon" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                            <PlatformSwitch
                              className="tb-popup-skill-source-switch"
                              ariaLabel="Skill source"
                              value={skillsTab}
                              options={[
                                { value: "system", label: "System" },
                                { value: "custom", label: "Custom" },
                              ]}
                              onValueChange={(nextTab) => {
                                if (nextTab === "system" || nextTab === "custom") {
                                  setSkillsTab(nextTab);
                                }
                              }}
                            />
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced tb-popup-panel-section-skills-body">
                            {(skillsTab === "system" ? systemSkills : customSkillItems).map((skill) => {
                              const isEnabled = enabledSkillIds.includes(skill.id);
                              return (
                                <button
                                  key={skill.id}
                                  type="button"
                                  className={`tb-popup-row tb-popup-row-skill ${isEnabled ? "selected" : ""}`}
                                  onClick={() => toggleSkill(skill.id)}
                                >
                                  {renderSkillIcon(skill, "tb-popup-icon")}
                                  <span className="tb-popup-label">{skill.name}</span>
                                  <span className="tb-popup-check-slot">{isEnabled ? <LucideCheck className="tb-popup-check" strokeWidth={1.75} /> : null}</span>
                                </button>
                              );
                            })}
                            {skillsTab === "custom" && isLoadingCustomSkills ? (
                              <div className="tb-popup-loading-row">
                                <span className="tb-popup-loading-spinner" aria-hidden="true" />
                                <span className="tb-popup-loading-label">Loading custom skills...</span>
                              </div>
                            ) : null}
                            {skillsTab === "custom" && !isLoadingCustomSkills && customSkillItems.length === 0 ? (
                              <div className="tb-popup-empty-state">No custom skills yet.</div>
                            ) : null}
                          </div>
                        </PlatformPopupSurface>
                        ) : null,
                        plusSidePopupStyle
                      )}

                      {renderComposerPopupPortal(
                        showGithubPopup ? (
                        <PlatformPopupSurface ref={plusSidePopupRef} className="tb-popup-menu-side tb-popup-menu-panel" animation={sidePopupAnimation}>
                          {!githubConnected ? (
                            <div className="tb-popup-note">
                              <div className="tb-popup-note-title">GitHub not connected</div>
                              <div className="tb-popup-note-body">
                                {hasApiKey ? "Provide GitHub auth in your host app to browse repositories and branches." : "Enter an API key in the playground sidebar to connect GitHub."}
                              </div>
                              <button type="button" className="tb-popup-action" onClick={() => {
                                githubConfig?.onConnect?.();
                                closeAllInputPopups();
                              }}>
                                Connect GitHub
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="tb-popup-panel-section">
                                <label className="tb-popup-field-label">Repository</label>
                                <select className="tb-popup-select" value={selectedGithubRepositoryId} onChange={(event) => selectGithubRepository(event.target.value)}>
                                  <option value="">No repository</option>
                                  {githubRepositories.map((repository) => (
                                    <option key={repository.id} value={repository.id}>
                                      {repository.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="tb-popup-panel-section tb-popup-panel-section-divider">
                                <label className="tb-popup-field-label">{githubContextLabel}</label>
                                <select className="tb-popup-select" value={selectedGithubContextId} onChange={(event) => selectGithubContext(event.target.value)}>
                                  <option value="">{selectedGithubRepositoryId ? `Select ${githubContextLabel.toLowerCase()}...` : "Select repository first"}</option>
                                  {githubContexts.map((context) => (
                                    <option key={context.id} value={context.id}>
                                      {context.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="tb-popup-panel-footer">
                                <PlatformSecondaryButton size="large" type="button" className="tb-popup-action tb-popup-action-secondary" onClick={() => {
                                  githubConfig?.onDisconnect?.();
                                  closeAllInputPopups();
                                }}>
                                  <IconLogout className="tb-popup-action-icon" />
                                  Disconnect GitHub
                                </PlatformSecondaryButton>
                              </div>
                            </>
                          )}
                        </PlatformPopupSurface>
                        ) : null,
                        plusSidePopupStyle
                      )}

                      {renderComposerPopupPortal(
                        showNotionPopup ? (
                        <PlatformPopupSurface ref={plusSidePopupRef} className="tb-popup-menu-side tb-popup-menu-panel" animation={sidePopupAnimation}>
                          {!notionConnected ? (
                            <div className="tb-popup-note">
                              <div className="tb-popup-note-title">Notion not connected</div>
                              <div className="tb-popup-note-body">
                                {hasApiKey ? "Provide Notion auth in your host app to browse databases." : "Enter an API key in the playground sidebar to connect Notion."}
                              </div>
                              <button type="button" className="tb-popup-action" onClick={() => {
                                notionConfig?.onConnect?.();
                                closeAllInputPopups();
                              }}>
                                Connect Notion
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="tb-popup-panel-section tb-popup-panel-section-divider">
                                <label className="tb-popup-field-label">Notion Database</label>
                                <select className="tb-popup-select" value={selectedNotionDatabaseId} onChange={(event) => selectNotionDatabase(event.target.value)}>
                                  <option value="">No database selected</option>
                                  <option value="__entire_workspace__">Entire workspace</option>
                                  {notionDatabases.map((database) => (
                                    <option key={database.id} value={database.id}>
                                      {database.icon ? `${database.icon} ` : ""}{database.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="tb-popup-panel-footer">
                                <PlatformSecondaryButton size="large" type="button" className="tb-popup-action tb-popup-action-secondary" onClick={() => {
                                  notionConfig?.onDisconnect?.();
                                  closeAllInputPopups();
                                }}>
                                  <IconLogout className="tb-popup-action-icon" />
                                  Disconnect Notion
                                </PlatformSecondaryButton>
                              </div>
                            </>
                          )}
                        </PlatformPopupSurface>
                        ) : null,
                        plusSidePopupStyle
                      )}

                      {renderComposerPopupPortal(
                        showGoogleDrivePopup ? (
                        <PlatformPopupSurface ref={plusSidePopupRef} className="tb-popup-menu-side tb-popup-menu-filebrowser" animation={sidePopupAnimation}>
                          {!googleDriveConnected ? (
                            <div className="tb-popup-note">
                              <div className="tb-popup-note-title">Google Drive not connected</div>
                              <div className="tb-popup-note-body">
                                {hasApiKey ? "Provide Google Drive auth in your host app to browse files." : "Enter an API key in the playground sidebar to connect Google Drive."}
                              </div>
                              <button type="button" className="tb-popup-action" onClick={() => {
                                googleDriveConfig?.onConnect?.();
                                closeAllInputPopups();
                              }}>
                                Connect Google Drive
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="tb-popup-file-header">
                                <div className="tb-popup-breadcrumbs">
                                  {googleDrivePath.map((folder, index) => (
                                    <span key={`${folder.id || "root"}-${index}`} className="tb-popup-breadcrumb-part">
                                      {index > 0 ? <span>/</span> : null}
                                      <button type="button" className="tb-popup-breadcrumb" onClick={() => setGoogleDriveFolderId(folder.id)}>
                                        {folder.name}
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <button type="button" className="tb-popup-icon-button" onClick={() => {
                                  googleDriveConfig?.onDisconnect?.();
                                  closeAllInputPopups();
                                }} aria-label="Disconnect Google Drive">
                                  <IconLogout className="tb-popup-icon-button-glyph" />
                                </button>
                              </div>
                              <div className="tb-popup-file-list">
                                {visibleGoogleDriveItems.length === 0 ? (
                                  <div className="tb-popup-empty">This folder is empty</div>
                                ) : (
                                  visibleGoogleDriveItems.map((item) => (
                                    <button
                                      key={item.id}
                                      type="button"
                                      className={`tb-popup-file-row ${selectedGoogleDriveFileIds.includes(item.id) ? "selected" : ""}`}
                                      onClick={() => {
                                        if (item.isFolder) {
                                          setGoogleDriveFolderId(item.id);
                                          return;
                                        }
                                        toggleFileBrowserSelection("google-drive", item.id);
                                      }}
                                    >
                                      {item.isFolder ? <IconFolderOpen className="tb-popup-icon tb-popup-file-type" /> : <span className={`tb-popup-file-checkbox ${selectedGoogleDriveFileIds.includes(item.id) ? "selected" : ""}`}>{selectedGoogleDriveFileIds.includes(item.id) ? <IconCheck className="tb-popup-file-check" /> : null}</span>}
                                      {!item.isFolder ? <IconFile className="tb-popup-icon tb-popup-file-type tb-popup-file-type-muted" /> : null}
                                      <span className="tb-popup-file-name">{item.name}</span>
                                      {item.isFolder ? <IconChevronRight className="tb-popup-chevron" /> : null}
                                    </button>
                                  ))
                                )}
                              </div>
                              <div className="tb-popup-file-footer">
                                <PlatformPrimaryButton size="large" type="button" className="tb-popup-action tb-popup-action-primary" disabled={selectedGoogleDriveFileIds.length === 0} onClick={() => void attachIntegrationFiles("google-drive")}>
                                  <IconPaperclip className="tb-popup-action-icon" />
                                  Attach {selectedGoogleDriveFileIds.length > 0 ? `${selectedGoogleDriveFileIds.length} file${selectedGoogleDriveFileIds.length > 1 ? "s" : ""}` : "Files"}
                                </PlatformPrimaryButton>
                              </div>
                            </>
                          )}
                        </PlatformPopupSurface>
                        ) : null,
                        plusSidePopupStyle
                      )}

                      {renderComposerPopupPortal(
                        showOneDrivePopup ? (
                        <PlatformPopupSurface ref={plusSidePopupRef} className="tb-popup-menu-side tb-popup-menu-filebrowser" animation={sidePopupAnimation}>
                          {!oneDriveConnected ? (
                            <div className="tb-popup-note">
                              <div className="tb-popup-note-title">OneDrive not connected</div>
                              <div className="tb-popup-note-body">
                                {hasApiKey ? "Provide OneDrive auth in your host app to browse files." : "Enter an API key in the playground sidebar to connect OneDrive."}
                              </div>
                              <button type="button" className="tb-popup-action" onClick={() => {
                                oneDriveConfig?.onConnect?.();
                                closeAllInputPopups();
                              }}>
                                Connect OneDrive
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="tb-popup-file-header">
                                <div className="tb-popup-breadcrumbs">
                                  {oneDrivePath.map((folder, index) => (
                                    <span key={`${folder.id || "root"}-${index}`} className="tb-popup-breadcrumb-part">
                                      {index > 0 ? <span>/</span> : null}
                                      <button type="button" className="tb-popup-breadcrumb" onClick={() => setOneDriveFolderId(folder.id)}>
                                        {folder.name}
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <button type="button" className="tb-popup-icon-button" onClick={() => {
                                  oneDriveConfig?.onDisconnect?.();
                                  closeAllInputPopups();
                                }} aria-label="Disconnect OneDrive">
                                  <IconLogout className="tb-popup-icon-button-glyph" />
                                </button>
                              </div>
                              <div className="tb-popup-file-list">
                                {visibleOneDriveItems.length === 0 ? (
                                  <div className="tb-popup-empty">This folder is empty</div>
                                ) : (
                                  visibleOneDriveItems.map((item) => (
                                    <button
                                      key={item.id}
                                      type="button"
                                      className={`tb-popup-file-row ${selectedOneDriveFileIds.includes(item.id) ? "selected" : ""}`}
                                      onClick={() => {
                                        if (item.isFolder) {
                                          setOneDriveFolderId(item.id);
                                          return;
                                        }
                                        toggleFileBrowserSelection("one-drive", item.id);
                                      }}
                                    >
                                      {item.isFolder ? <IconFolderOpen className="tb-popup-icon tb-popup-file-type" /> : <span className={`tb-popup-file-checkbox ${selectedOneDriveFileIds.includes(item.id) ? "selected" : ""}`}>{selectedOneDriveFileIds.includes(item.id) ? <IconCheck className="tb-popup-file-check" /> : null}</span>}
                                      {!item.isFolder ? <IconFile className="tb-popup-icon tb-popup-file-type tb-popup-file-type-muted" /> : null}
                                      <span className="tb-popup-file-name">{item.name}</span>
                                      {item.isFolder ? <IconChevronRight className="tb-popup-chevron" /> : null}
                                    </button>
                                  ))
                                )}
                              </div>
                              <div className="tb-popup-file-footer">
                                <PlatformPrimaryButton size="large" type="button" className="tb-popup-action tb-popup-action-primary" disabled={selectedOneDriveFileIds.length === 0} onClick={() => void attachIntegrationFiles("one-drive")}>
                                  <IconPaperclip className="tb-popup-action-icon" />
                                  Attach {selectedOneDriveFileIds.length > 0 ? `${selectedOneDriveFileIds.length} file${selectedOneDriveFileIds.length > 1 ? "s" : ""}` : "Files"}
                                </PlatformPrimaryButton>
                              </div>
                            </>
                          )}
                        </PlatformPopupSurface>
                        ) : null,
                        plusSidePopupStyle
                      )}

                      {renderComposerPopupPortal(
                        showSchedulePopup ? (
                        <PlatformPopupSurface ref={plusSidePopupRef} className="tb-popup-menu-side tb-popup-menu-schedule" animation={sidePopupAnimation}>
                          <div className="tb-popup-attach-topbar">
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-close" onClick={closeSchedulePopup} aria-label="Close schedule popup">
                              <LucideX className="tb-popup-attach-topbar-icon" strokeWidth={1.75} />
                            </button>
                            <div className="tb-popup-attach-topbar-title">Schedule</div>
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-confirm" onClick={handleScheduleSubmit} aria-label="Confirm schedule">
                              <LucideCheck className="tb-popup-attach-topbar-icon" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                            <PlatformSwitch
                              ariaLabel="Schedule type"
                              value={scheduleType}
                              options={[
                                { value: "one-time", label: "One-time" },
                                { value: "recurring", label: "Recurring" },
                              ]}
                              onValueChange={(nextType) => {
                                if (nextType === "one-time" || nextType === "recurring") {
                                  setScheduleType(nextType);
                                }
                              }}
                            />
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced">
                            <>
                              <div className="tb-popup-field-row">
                                <label className="tb-popup-field-label">Run at</label>
                                <button type="button" className="tb-popup-link-button tb-popup-link-button-inline" onClick={() => {
                                  scheduleConfig?.onOpenCalendarApp?.();
                                  closeAllInputPopups();
                                }}>
                                  Open Calendar App
                                  <LucideChevronRight className="tb-popup-link-chevron" strokeWidth={1.75} />
                                </button>
                              </div>
                              <div className="tb-popup-select-wrap tb-popup-select-wrap-schedule">
                                <input
                                  type="datetime-local"
                                  className="tb-popup-select tb-popup-select-schedule"
                                  value={scheduledAtValue}
                                  min={formatRunnerDateTimeLocalValue(new Date())}
                                  onChange={(event) => setScheduledAtValue(event.target.value)}
                                />
                              </div>
                              {scheduleType === "recurring" ? (
                                <>
                                  <div className="tb-popup-field-row tb-popup-field-row-followup">
                                    <label className="tb-popup-field-label">Repeat</label>
                                  </div>
                                  <div className="tb-popup-preset-list">
                                    {schedulePresets.map((preset) => (
                                      <button key={preset.id} type="button" className={`tb-popup-preset-row ${selectedSchedulePresetId === preset.id ? "selected" : ""}`} onClick={() => setSelectedSchedulePresetId(preset.id)}>
                                        <span className="tb-popup-check-slot">{selectedSchedulePresetId === preset.id ? <LucideCheck className="tb-popup-check" strokeWidth={1.75} /> : null}</span>
                                        <span>{preset.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </>
                              ) : null}
                            </>
                          </div>
                        </PlatformPopupSurface>
                        ) : null,
                        plusSidePopupStyle
                      )}

                      {renderComposerPopupPortal(
                        showAttachFilesPopup ? (
                        <PlatformPopupSurface ref={plusSidePopupRef} className="tb-popup-menu-side tb-popup-menu-attach" animation={sidePopupAnimation}>
                          <div className="tb-popup-attach-topbar">
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-close" onClick={closeAttachFilesPopup} aria-label="Close attach files popup">
                              <LucideX className="tb-popup-attach-topbar-icon" strokeWidth={1.75} />
                            </button>
                            <div className="tb-popup-attach-topbar-title">Attach Files</div>
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-confirm" onClick={() => closeAllInputPopups()} aria-label="Done">
                              <LucideCheck className="tb-popup-attach-topbar-icon" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                            <PlatformSwitch
                              className="tb-popup-attachment-source-switch"
                              ariaLabel="Attachment source"
                              value="upload"
                              options={[
                                { value: "upload", label: "Upload New" },
                                { value: "workspace", label: "From Workspace" },
                              ]}
                              onValueChange={(nextSource) => {
                                if (nextSource === "workspace") {
                                  openFileBrowserModal("workspace");
                                }
                              }}
                            />
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-attach-body tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced">
                            <button
                              type="button"
                              className={`tb-popup-dropzone ${isDraggingOver ? "dragging" : ""}`}
                              onClick={handleUploadNewFilesClick}
                              onDragOver={handleDropzoneDragOver}
                              onDragLeave={handleDropzoneDragLeave}
                              onDrop={handleDropzoneDrop}
                            >
                              <LucideUpload className="tb-popup-dropzone-icon" strokeWidth={1.75} />
                              <span className="tb-popup-dropzone-title">{isDraggingOver ? "Drop files here" : "Drag & drop files here"}</span>
                              <span className="tb-popup-dropzone-copy">or click to browse</span>
                            </button>
                          </div>
                        </PlatformPopupSurface>
                        ) : null,
                        plusSidePopupStyle
                      )}
                    </div>
                    {composerLeadingControl ? (
                      <div className="tb-composer-leading-control">{composerLeadingControl}</div>
                    ) : null}
                    {contextIndicatorControl}

                    {composerBeforeAgentControl ? (
                      <div className="tb-composer-leading-control">{composerBeforeAgentControl}</div>
                    ) : null}

                    <RunnerAgentSelectorControl
                      animation={mainPopupAnimation}
                      availableModes={availableAgentPopupModes}
                      buttonRef={agentSelectorButtonRef}
                      displayedAgentLabel={displayedAgentLabel}
                      hasApiKey={hasApiKey}
                      hidden={hideAgentSelector}
                      locked={lockAgentSelector}
                      mode={agentPopupMode}
                      onCloseReasoning={closeAgentReasoningPopup}
                      onDoneReasoning={() => closeAllInputPopups()}
                      onModeChange={setAgentPopupMode}
                      onOpenReasoning={() => setActiveInputPopup("agent-reasoning")}
                      onSelectAgent={selectAgent}
                      onSelectReasoningEffort={selectReasoningEffort}
                      onToggle={() => togglePopup("agent")}
                      open={showAgentPopup}
                      options={filteredOrderedAgents}
                      popupRef={agentPopupRef}
                      popupStyle={agentPopupStyle}
                      reasoningEffort={effectiveReasoningEffort}
                      reasoningOpen={showAgentReasoningPopup}
                      reasoningPopupAnimation={sidePopupAnimation}
                      reasoningPopupRef={agentReasoningPopupRef}
                      reasoningPopupStyle={agentReasoningPopupStyle}
                      selectedAgentId={selectedAgentId}
                      totalAgentCount={agents.length}
                    />

                    {scheduledTask ? (
                      <div className="tb-schedule-chip">
                        <LucideCalendar className="tb-schedule-chip-icon" strokeWidth={1.75} />
                        <span className="tb-schedule-chip-label">{formatRunnerScheduleChipLabel(scheduledTask)}</span>
                        <button type="button" className="tb-schedule-chip-clear" onClick={clearScheduledTask} aria-label="Clear schedule">
                          <LucideX className="tb-schedule-chip-clear-icon" strokeWidth={1.75} />
                        </button>
                      </div>
                    ) : null}

	                    <div className="task-input-spacer" />

	                    <RunnerWorkspaceSelectorControl
                      animation={mainPopupAnimation}
                      buttonRef={environmentSelectorButtonRef}
                      displayedWorkspaceLabel={displayedWorkspaceLabel}
                      effectiveMode={effectiveWorkspaceSelectorMode}
                      environments={orderedEnvironments}
                      hasApiKey={hasApiKey}
                      hidden={hideEnvironmentSelector}
                      locked={lockEnvironmentSelector}
                      mode={workspaceSelectorMode}
                      onModeChange={setWorkspaceSelectorMode}
                      onSelectEnvironment={selectEnvironment}
                      onSelectProject={selectProject}
                      onToggle={() => togglePopup("environment")}
                      open={showEnvironmentPopup}
                      popupRef={environmentPopupRef}
                      popupStyle={environmentPopupStyle}
                      projects={orderedProjects}
                      selectedEnvironmentId={selectedEnvironmentId}
                      selectedProjectId={selectedProjectId}
                    />
                    <RunnerVoiceModeControl
                      agentVoiceMode={selectedAgent?.voiceMode}
                      disabled={disabled}
                      enabled={useComputerAgentsMode}
                      isFull
                      onStart={() => void startVoiceModeSession()}
                      onStop={() => void stopVoiceModeSession()}
                      state={voiceModeState}
                    />

	                    {showRunPreparationIndicator ? (
                      <button type="button" className="task-run-button task-run-button-full" disabled>
                        <span className="runner-spinner" />
                      </button>
                    ) : showActiveRunStopButton ? (
                      <button
                        type="button"
                        className="task-run-button task-run-button-full"
                        onClick={() => void handleStopActiveRun()}
                        disabled={disabled || isStoppingRun}
                        aria-label="Stop agent"
                        title="Stop agent"
                      >
                        <span className="task-stop-icon" />
                      </button>
                    ) : hasComposerText ? (
                      <button
                        type="button"
                        className="task-run-button task-run-button-full"
                        onClick={() => void runTask()}
                        disabled={!canRun}
                        aria-label="Send message"
                        title="Send message"
                      >
                        <LucideArrowUp className="task-send-icon" strokeWidth={2.1} />
                      </button>
                    ) : (
                      <>
                        {isListening ? <span className="task-recording-duration">{recordingElapsedSeconds}s</span> : null}
                        <button
                          type="button"
                          className={`task-mic-button task-mic-button-full ${isListening ? "active" : ""}`}
                          onClick={handleMicrophoneClick}
                          disabled={disabled}
                          aria-label={isListening ? "Stop speech to text" : "Start speech to text"}
                          title={speechToTextTitle}
                        >
                          {isListening ? <IconStop className="task-mic-icon" /> : <IconMic className="task-mic-icon" />}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="task-input-controls">
                    <button
                      type="button"
                      className="task-attachment-button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled || isPreparingRun || attachments.length >= maxAttachments}
                      aria-label="Upload files"
                      title="Upload files"
                    >
                      <IconPlus className="task-attachment-icon" />
                    </button>
	                    {contextIndicatorControl}
	                    <div className="task-input-spacer" />
                    <RunnerVoiceModeControl
                      agentVoiceMode={selectedAgent?.voiceMode}
                      disabled={disabled}
                      enabled={useComputerAgentsMode}
                      onStart={() => void startVoiceModeSession()}
                      onStop={() => void stopVoiceModeSession()}
                      state={voiceModeState}
                    />
	                    {showRunPreparationIndicator ? (
                      <button type="button" className="task-run-button" disabled>
                        <span className="runner-spinner" />
                      </button>
                    ) : showActiveRunStopButton ? (
                      <button
                        type="button"
                        className="task-run-button"
                        onClick={() => void handleStopActiveRun()}
                        disabled={disabled || isStoppingRun}
                      >
                        <span className="task-stop-icon" />
                      </button>
                    ) : hasComposerText ? (
                      <button
                        type="button"
                        className="task-run-button"
                        onClick={() => void runTask()}
                        disabled={!canRun}
                        aria-label="Send message"
                        title="Send message"
                      >
                        <LucideArrowUp className="task-send-icon" strokeWidth={2.1} />
                      </button>
                    ) : (
                      <>
                        {isListening ? <span className="task-recording-duration">{recordingElapsedSeconds}s</span> : null}
                        <button
                          type="button"
                          className={`task-mic-button ${isListening ? "active" : ""}`}
                          onClick={handleMicrophoneClick}
                          disabled={disabled}
                          aria-label={isListening ? "Stop speech to text" : "Start speech to text"}
                          title={speechToTextTitle}
                        >
                          {isListening ? <IconStop className="task-mic-icon" /> : <IconMic className="task-mic-icon" />}
                        </button>
                      </>
	                )}
                <RunnerVoiceModeStatusBar
                  enabled={useComputerAgentsMode}
                  onStop={() => void stopVoiceModeSession()}
                  state={voiceModeState}
                />
	              </div>
                )}
              </div>
              {useComputerAgentsMode && shouldRenderInlineComposerWithEmptyState ? (
                <div className="tb-composer-connectors-row" aria-label="Project tasks and plugins">
                  <div className="tb-composer-project-task-area">
                    <button
                      type="button"
                      className="tb-composer-plan-label"
                      aria-label={composerPlanDisplay.label}
                      onClick={onOpenPlansBudget}
                      disabled={!onOpenPlansBudget}
                    >
                      <ComposerPlanIcon className="tb-composer-plan-icon" strokeWidth={1.75} />
                      <span>{composerPlanDisplay.label}</span>
                    </button>
                  </div>
                  <div className="tb-composer-connectors-right">
                    <RunnerComposerOrganizationSelector
                      animation={mainPopupAnimation}
                      buttonRef={organizationSelectorButtonRef}
                      canChange={canChangeComposerOrganization}
                      onSelect={selectComposerOrganization}
                      onToggle={() => togglePopup("organization")}
                      open={showOrganizationPopup}
                      options={composerOrganizationOptions}
                      organizationId={composerOrganizationId}
                      popupRef={organizationPopupRef}
                      popupStyle={organizationPopupStyle}
                    />
                  </div>
                </div>
              ) : null}
              {inlineError ? (
                <div className="runner-inline-error" role="alert">
                  <span>{inlineError}</span>
                  <button type="button" onClick={() => setInlineError(null)} aria-label="Dismiss message">
                    <LucideX strokeWidth={1.8} />
                  </button>
                </div>
              ) : null}
          </div>
        </div>
      </div>

      {shouldRenderInlineComposerWithEmptyState ? emptyStateAfterComposer : null}

      <RunnerFeedbackDialog
        open={Boolean(reportIssueTurn)}
        message={reportIssueMessage}
        error={reportIssueError}
        submitting={isReportIssueSubmitting}
        onMessageChange={setReportIssueMessage}
        onUploadFiles={uploadFeedbackFiles}
        onSubmit={() => {
          void submitReportIssue();
        }}
        onClose={closeReportIssueModal}
      />

      <RunnerForkThreadDialog
        open={Boolean(pendingForkConfiguration)}
        source={pendingForkConfiguration?.source || "thread"}
        stagedPrompt={pendingForkConfiguration?.stagedPrompt || ""}
        target={forkTarget}
        onTargetChange={setForkTarget}
        environments={orderedForkTargetEnvironments}
        selectedEnvironmentId={forkTargetEnvironmentId}
        selectedEnvironmentName={selectedForkExistingEnvironment?.name || null}
        onEnvironmentSelect={setForkTargetEnvironmentId}
        environmentPopupOpen={showForkEnvironmentPopup}
        onEnvironmentPopupOpenChange={setShowForkEnvironmentPopup}
        environmentPopupRef={forkEnvironmentPopupRef}
        newEnvironmentName={forkNewEnvironmentName}
        onNewEnvironmentNameChange={setForkNewEnvironmentName}
        newEnvironmentFileCopyMode={forkNewEnvironmentFileCopyMode}
        onNewEnvironmentFileCopyModeChange={setForkNewEnvironmentFileCopyMode}
        existingEnvironmentFileCopyMode={forkExistingEnvironmentFileCopyMode}
        onExistingEnvironmentFileCopyModeChange={setForkExistingEnvironmentFileCopyMode}
        showExistingEnvironmentCopyOptions={shouldShowForkExistingEnvironmentCopyOptions}
        error={forkDialogError}
        creating={Boolean(forkingTurnId)}
        onClearError={() => setForkDialogError(null)}
        onConfirm={confirmForkFromPendingConfiguration}
        onClose={cancelPendingForkConfiguration}
      />

      <RunnerEditConfirmationDialog
        open={Boolean(pendingEditConfirmation)}
        changedFiles={pendingEditConfirmation?.changedFiles || []}
        onCancel={() => setPendingEditConfirmation(null)}
        onConfirm={(keepFileChanges) => {
          const confirmation = pendingEditConfirmation;
          if (!confirmation) return;
          return submitEditedTurn(confirmation.turnId, confirmation.nextPrompt, keepFileChanges);
        }}
      />

      {deepResearchDetailDrawer}
      {computerUseDetailDrawer}
      {subagentDetailDrawer}
      {documentAttachmentPreviewDrawer}

      <RunnerFileBrowserDialog
        open={showFileBrowserModal}
        apiKeyPromptOpen={showFileBrowserApiKeyPrompt}
        source={currentFileBrowserSource}
        searchQuery={fileBrowserSearchQuery}
        onSearchQueryChange={setFileBrowserSearchQuery}
        environments={availableEnvironments}
        selectedEnvironmentId={selectedEnvironmentId}
        onEnvironmentSelect={handleWorkspaceFileBrowserEnvironmentSelect}
        onSourceChange={(source) => {
          // Atlassian resource selection is currently exposed from project
          // settings. The regular thread attachment browser keeps its
          // existing source contract and therefore never advertises it.
          if (source !== "atlassian") switchFileBrowserSource(source);
        }}
        connections={{
          "google-drive": {
            connected: googleDriveConnected,
            accounts: fileBrowserAccountOptionsBySource["google-drive"],
            selectedAccountId: fileBrowserAccountIdsBySource["google-drive"],
            onAccountChange: (accountId) => handleFileBrowserAccountChange("google-drive", accountId),
            onConnect: googleDriveConfig?.onConnect,
            onDisconnect: googleDriveConfig?.onDisconnect,
          },
          notion: {
            connected: notionConnected,
            accounts: fileBrowserAccountOptionsBySource.notion,
            selectedAccountId: fileBrowserAccountIdsBySource.notion,
            onAccountChange: (accountId) => handleFileBrowserAccountChange("notion", accountId),
            onConnect: notionConfig?.onConnect,
            onDisconnect: notionConfig?.onDisconnect,
          },
          "one-drive": {
            connected: oneDriveConnected,
            accounts: fileBrowserAccountOptionsBySource["one-drive"],
            selectedAccountId: fileBrowserAccountIdsBySource["one-drive"],
            onAccountChange: (accountId) => handleFileBrowserAccountChange("one-drive", accountId),
            onConnect: oneDriveConfig?.onConnect,
            onDisconnect: oneDriveConfig?.onDisconnect,
          },
          github: {
            connected: githubConnected,
            accounts: fileBrowserAccountOptionsBySource.github,
            selectedAccountId: fileBrowserAccountIdsBySource.github,
            onAccountChange: (accountId) => handleFileBrowserAccountChange("github", accountId),
            onConnect: githubConfig?.onConnect,
            onDisconnect: githubConfig?.onDisconnect,
          },
          atlassian: { connected: false },
        }}
        authSource={
          showGoogleDriveAuthScreen
            ? "google-drive"
            : showNotionAuthScreen
              ? "notion"
              : showOneDriveAuthScreen
                ? "one-drive"
                : showGithubAuthScreen
                  ? "github"
                  : null
        }
        path={fileBrowserPath}
        historyIndex={fileBrowserHistoryIndex}
        historyLength={fileBrowserHistory.length}
        onBack={goFileBrowserBack}
        onForward={goFileBrowserForward}
        onBreadcrumbSelect={navigateFileBrowserToBreadcrumb}
        googleDriveItemCount={googleDriveItems.length}
        onManageGoogleDriveAccess={googleDriveConfig?.onManageAccess ? handleGoogleDriveManageAccess : undefined}
        isGoogleDrivePickerLoading={isGoogleDrivePickerLoading}
        loading={
          currentFileBrowserSource === "workspace"
            ? isWorkspaceBrowserLoading
            : currentFileBrowserSource === "google-drive"
              ? isGoogleDriveBrowserLoading
              : currentFileBrowserSource === "notion"
                ? isNotionBrowserLoading
                : currentFileBrowserSource === "one-drive"
                  ? isOneDriveBrowserLoading
                  : isGithubBrowserLoading
        }
        error={
          currentFileBrowserSource === "workspace"
            ? workspaceBrowserError
            : currentFileBrowserSource === "google-drive"
              ? googleDriveBrowserError
              : currentFileBrowserSource === "notion"
                ? notionBrowserError
                : currentFileBrowserSource === "one-drive"
                  ? oneDriveBrowserError
                  : githubBrowserError
	        }
	        showGoogleDrivePickerPrompt={showGoogleDrivePickerPrompt}
	        items={filteredFileBrowserItems}
	        renderItem={(item) => (
            <RunnerFileBrowserItem
              key={
                currentFileBrowserSource === "github" &&
                item.isFolder &&
                !item.parentId &&
                item.repoFullName
                  ? `github-repository:${item.repoFullName}`
                  : buildGithubEffectiveRootItem(item).id
              }
              allItems={fileBrowserItems}
              backendUrl={normalizedBackendUrl}
              branchLoadingRepoFullNames={githubBranchLoadingRepoFullNames}
              branchesByRepoFullName={githubBranchesByRepoFullName}
              buildEffectiveGithubRootItem={buildGithubEffectiveRootItem}
              expandedFolderIds={expandedFileBrowserFolderIds}
              githubLoadingFolderIds={loadingGithubFolderIds}
              googleDriveLoadingFolderIds={loadingGoogleDriveFolderIds}
              item={item}
              onBranchChange={handleGithubRepoBranchChange}
              onEnsureBranchesLoaded={(repoFullName, fallbackRef) => {
                void ensureGithubBranchesLoaded(repoFullName, fallbackRef);
              }}
              onDeleteItem={
                currentFileBrowserSource === "workspace"
                  ? handleWorkspaceFileDelete
                  : undefined
              }
              onItemClick={handleFileBrowserItemClick}
              onOpenItem={handleFileBrowserItemOpen}
              onRenameItem={
                currentFileBrowserSource === "workspace"
                  ? handleWorkspaceFileRename
                  : undefined
              }
              onToggleSelection={toggleFileBrowserItemSelection}
              onToggleFolder={toggleFileBrowserFolderExpansion}
              onToggleGithubSelection={(itemId) => {
                toggleFileBrowserSelection("github", itemId);
              }}
              oneDriveLoadingFolderIds={loadingOneDriveFolderIds}
              previewItemId={previewFileBrowserItem?.id || null}
              resolveSelectedGithubBranch={getGithubSelectedBranchForRepo}
              searchQuery={fileBrowserSearchQuery}
              selectedItemIds={selectedFileBrowserIds}
              source={currentFileBrowserSource}
              workspaceFolderErrorsById={workspaceFolderErrorsById}
              workspaceEnvironmentId={selectedEnvironmentId || ""}
              workspaceLoadingFolderIds={loadingWorkspaceFolderIds}
            />
          )}
        previewItem={previewFileBrowserItem}
        previewContent={fileBrowserPreviewContent}
        previewKind={fileBrowserPreviewKind}
        isPreviewLoading={isFileBrowserPreviewLoading}
	        renderPreviewIcon={(item) =>
            renderRunnerBrowserFileIcon(
              item,
              "tb-file-browser-preview-glyph",
            )}
        selectedItemCount={selectedFileBrowserIds.length}
        selectedItemLabel={selectedFileBrowserLabel}
        isAttaching={isFileBrowserAttaching}
        onAttach={handleFileBrowserAttach}
        onPreviewClose={() => setFileBrowserPreviewId(null)}
        onClose={closeFileBrowserModal}
        onApiKeyPromptClose={closeFileBrowserApiKeyPrompt}
      />
    </div>
  );
}

export type { RunnerLog };
